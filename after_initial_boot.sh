#!/bin/bash
# Run this ONCE on a freshly-imaged Pi, over SSH, right after cloning this
# repo (README steps 1-3: install git, clone, cd in). It provisions
# everything after_reboot.sh assumes already exists — Docker, the X11/openbox/
# lightdm kiosk display stack, and a systemd service that runs after_reboot.sh
# on every future boot — so that after this script (and one reboot) the device
# is fully plug-and-play: unplug/replug power and the kiosk comes back with no
# further SSH session ever needed.
#
# Deliberately never touches a live X session: it only installs packages and
# drops config files that lightdm/openbox read on their own next login. That's
# what makes it safe to run entirely over SSH (an X11 kiosk otherwise has no
# "seat" over SSH — see the README's startx note) and safe to re-run (every
# file this writes is regenerated from scratch, so re-running just confirms
# the same end state).
#
# Root cause read here: README.md, sections 2 and 4 (Docker + X11 install,
# lightdm autologin, the modesetting kmsdev fix, "xhost does not persist
# across reboots") and kiosk/entrypoint.sh's comments (WM-managed chromium +
# openbox decor=no, the onboard keyboard needing accessibility + a real WM to
# draw above it).
set -e

if [ "$(id -u)" -eq 0 ]; then
    TARGET_USER="${SUDO_USER:-root}"
else
    TARGET_USER="$(id -un)"
fi
TARGET_HOME="$(getent passwd "$TARGET_USER" | cut -d: -f6)"
if [ -z "$TARGET_HOME" ]; then
    echo "Could not resolve a home directory for user '$TARGET_USER'." >&2
    exit 1
fi
REPO_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "Provisioning for user '$TARGET_USER' (home: $TARGET_HOME), repo at $REPO_DIR"

# write_root_file <dest> <mode>  — content from stdin, owned by root.
write_root_file() {
    local dest="$1" mode="$2" tmp
    tmp="$(mktemp)"
    cat >"$tmp"
    sudo mkdir -p "$(dirname "$dest")"
    sudo install -m "$mode" -o root -g root "$tmp" "$dest"
    rm -f "$tmp"
}

# write_owned_file <dest> <mode>  — content from stdin, owned by $TARGET_USER.
write_owned_file() {
    local dest="$1" mode="$2" tmp
    tmp="$(mktemp)"
    cat >"$tmp"
    sudo -u "$TARGET_USER" mkdir -p "$(dirname "$dest")"
    sudo install -m "$mode" -o "$TARGET_USER" -g "$TARGET_USER" "$tmp" "$dest"
    rm -f "$tmp"
}

# ---------------------------------------------------------------------------
echo "== [1/8] Docker =="
if ! command -v docker >/dev/null 2>&1; then
    curl -fsSL https://get.docker.com -o /tmp/get-docker.sh
    sudo sh /tmp/get-docker.sh
    rm -f /tmp/get-docker.sh
else
    echo "docker already installed, skipping install"
fi
# Idempotent even if docker was already present — covers the case where it
# was installed by hand before this user was added to the group.
sudo usermod -aG docker "$TARGET_USER"
sudo systemctl enable --now docker

# ---------------------------------------------------------------------------
echo "== [2/8] X11 / kiosk display packages =="
# chromium itself is deliberately NOT installed on the host — the kiosk
# container (kiosk/Dockerfile) bundles its own; the host only needs a display
# server + window manager for that container's X11 passthrough to draw into.
sudo apt-get update
sudo apt-get install -y --no-install-recommends \
    xserver-xorg x11-xserver-utils xinit \
    openbox lightdm accountsservice unclutter \
    python3

# ---------------------------------------------------------------------------
echo "== [3/8] Xorg GPU pin (README 4.4: Pi's multiple /dev/dri/cardN confuse Xorg) =="
CARD=""
for status_file in /sys/class/drm/card*-*/status; do
    [ -f "$status_file" ] || continue
    if [ "$(cat "$status_file")" = "connected" ]; then
        connector_dir="$(basename "$(dirname "$status_file")")"
        CARD="${connector_dir%%-*}"
        break
    fi
done
if [ -n "$CARD" ]; then
    echo "connected connector: $connector_dir -> pinning Xorg to /dev/dri/$CARD"
    write_root_file /etc/X11/xorg.conf.d/99-modesetting.conf 0644 <<EOF
Section "Device"
    Identifier "Pi GPU"
    Driver "modesetting"
    Option "kmsdev" "/dev/dri/$CARD"
EndSection
EOF
else
    echo "WARNING: no connected DRM connector found under /sys/class/drm/." >&2
    echo "Skipping the GPU pin — if Xorg fails with 'no screens found' after" >&2
    echo "reboot, plug the display in and re-run this script, or see the" >&2
    echo "README's X11 troubleshooting table." >&2
fi

# ---------------------------------------------------------------------------
echo "== [4/8] lightdm autologin -> openbox =="
write_root_file /etc/lightdm/lightdm.conf.d/50-home-dashboard.conf 0644 <<EOF
[Seat:*]
autologin-user=$TARGET_USER
autologin-session=openbox
autologin-user-timeout=0
EOF

# ---------------------------------------------------------------------------
echo "== [5/8] openbox autostart: xhost for docker, screen always on =="
# README 4.7: "xhost +local:docker does NOT persist across reboots — add it
# to an autostart mechanism". openbox's autostart runs once per graphical
# login with DISPLAY/XAUTHORITY already set up by that session, so it never
# needs a live X connection from this (SSH) script.
write_owned_file "$TARGET_HOME/.config/openbox/autostart" 0755 <<'EOF'
#!/bin/sh
# home-dashboard: let the docker-hosted chromium container reach this X
# session, and keep an unattended wall-mounted touchscreen from ever blanking.
xhost +local:docker
xset s off
xset s noblank
xset -dpms
command -v unclutter >/dev/null 2>&1 && unclutter -idle 0 -root &
EOF

# ---------------------------------------------------------------------------
echo "== [6/8] openbox decor=no rule for chromium (borderless kiosk window) =="
# kiosk/entrypoint.sh runs chromium WM-managed (not --kiosk) specifically so
# openbox can stack onboard's on-screen keyboard above it; the remaining
# titlebar this leaves is stripped here instead, per that file's comments.
RC="$TARGET_HOME/.config/openbox/rc.xml"
if [ ! -f "$RC" ]; then
    sudo -u "$TARGET_USER" mkdir -p "$(dirname "$RC")"
    sudo -u "$TARGET_USER" cp /etc/xdg/openbox/rc.xml "$RC"
fi
if ! grep -q "home-dashboard: chromium decor" "$RC"; then
    sudo -u "$TARGET_USER" python3 - "$RC" <<'PYEOF'
import sys
path = sys.argv[1]
with open(path) as f:
    content = f.read()
rule = (
    '  <application class="Chromium*">\n'
    '    <!-- home-dashboard: chromium decor=no -->\n'
    '    <decor>no</decor>\n'
    '  </application>\n'
)
content = content.replace("</applications>", rule + "</applications>", 1)
with open(path, "w") as f:
    f.write(content)
PYEOF
fi

# ---------------------------------------------------------------------------
echo "== [7/8] home-dashboard.service (runs after_reboot.sh on every boot) =="
write_root_file /etc/systemd/system/home-dashboard.service 0644 <<EOF
[Unit]
Description=Home Dashboard app stack (docker compose via after_reboot.sh)
After=lightdm.service docker.service
Wants=docker.service

[Service]
Type=simple
User=$TARGET_USER
WorkingDirectory=$REPO_DIR
ExecStart=$REPO_DIR/after_reboot.sh
Restart=on-failure
RestartSec=5
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=graphical.target
EOF
sudo systemctl daemon-reload
sudo systemctl enable home-dashboard.service

# graphical.target (not multi-user.target) as the permanent boot default,
# and lightdm enabled as a unit — together these mean the whole chain
# (X -> openbox -> home-dashboard.service) starts unattended on every future
# boot, no manual `systemctl start lightdm` step required (the reason
# after_reboot.sh used to need sudo at all).
sudo systemctl set-default graphical.target
sudo systemctl enable lightdm

# ---------------------------------------------------------------------------
echo "== [8/8] .env + pre-building images =="
if [ ! -f "$REPO_DIR/.env" ]; then
    cp "$REPO_DIR/.env.example" "$REPO_DIR/.env"
    echo "Created .env from .env.example — TS_AUTHKEY is still empty." >&2
elif ! grep -q "^TS_AUTHKEY=..*" "$REPO_DIR/.env"; then
    echo "WARNING: .env exists but TS_AUTHKEY looks empty." >&2
fi
if ! grep -q "^TS_AUTHKEY=..*" "$REPO_DIR/.env"; then
    echo "Get one at https://login.tailscale.com/admin/settings/keys (tick" >&2
    echo "Reusable) and set TS_AUTHKEY in $REPO_DIR/.env before rebooting," >&2
    echo "or the tailscale sidecar — and backend/frontend/chromium, which" >&2
    echo "share its network namespace — will crash-loop." >&2
fi

# Root always has docker socket access regardless of group membership timing,
# so this doesn't need to wait for $TARGET_USER's new docker group to take
# effect (which needs a fresh login session anyway).
echo "Pre-building app images so the first real boot doesn't wait on this..."
if ! (cd "$REPO_DIR" && sudo docker compose -f docker-compose.tailscale.yml build); then
    echo "WARNING: image pre-build failed — home-dashboard.service will just" >&2
    echo "build on first boot instead, making that first boot slower." >&2
fi

cat <<EOF

============================================================
Done. One manual step left: reboot to activate the kiosk display.

    sudo reboot

After that:
  - the Pi boots straight into a borderless, always-on kiosk display
  - home-dashboard.service brings the docker stack up automatically
  - any future unplug/replug repeats exactly that — no SSH session needed
EOF
if ! grep -q "^TS_AUTHKEY=..*" "$REPO_DIR/.env"; then
    echo "  - EXCEPT: set TS_AUTHKEY in .env first (see warning above)"
fi
echo "============================================================"
