#!/bin/sh
# The host already runs openbox as its window manager (see README's lightdm
# autologin-session=openbox setup) — no need to bundle a second one here.
# Chromium's --kiosk mode uses an override-redirect fullscreen window, which
# sits above everything and bypasses window-manager stacking entirely — so
# onboard's on-screen-keyboard popup could never draw above it. Instead:
#   1. run chromium WM-managed fullscreen (no --kiosk) so openbox stacks it
#      like a normal window and onboard can rise above it
#   2. run onboard, auto-shown via AT-SPI when chromium focuses a text field
set -e

eval "$(dbus-launch --sh-syntax)"
export DBUS_SESSION_BUS_ADDRESS

# Lazy D-Bus activation of org.a11y.Bus races onboard's and chromium's first
# connection attempt on a cold container start — and that race is much more
# likely to be lost on a real host boot (dockerd, lightdm/X, and the other
# 3 containers all starting at once on a Pi) than in a warm restart on an
# already-idle host. Chromium checks for the accessibility bus exactly once
# at launch and never retries, so if it's exec'd before at-spi-bus-launcher
# has published org.a11y.Bus on the session bus, accessibility (and with it
# onboard's auto-show) stays silently off for the container's whole life —
# a fixed sleep is a guess at that timing, so poll for the bus instead,
# bounded so a genuinely broken at-spi doesn't hang the container forever.
/usr/libexec/at-spi-bus-launcher --launch-immediately &
i=0
while [ "$i" -lt 50 ] && ! dbus-send --session --print-reply \
        --dest=org.a11y.Bus /org/a11y/bus org.a11y.Bus.GetAddress \
        >/dev/null 2>&1; do
    i=$((i + 1))
    sleep 0.2
done
# A cold host boot (dockerd, lightdm/X, and 3 other containers all starting
# at once, cold SD-card page cache) can still lose this race past the 10s
# bound above. Since chromium never retries the accessibility bus after
# launch, proceeding anyway would leave onboard's auto-show broken for the
# container's whole life — bail out instead so the "restart: unless-stopped"
# policy on this service restarts the container with a fresh dbus session
# and another shot at the race, instead of requiring a manual re-run.
if ! dbus-send --session --print-reply \
        --dest=org.a11y.Bus /org/a11y/bus org.a11y.Bus.GetAddress \
        >/dev/null 2>&1; then
    echo "org.a11y.Bus did not come up after 10s — restarting for a fresh attempt." >&2
    exit 1
fi

# Onboard's auto-show-on-focus is a GSettings key (org.onboard.auto-show
# enabled), defaulting to false — "-a" on the onboard CLI means
# --keep-aspect, not auto-show, so nothing was ever enabling it.
gsettings set org.onboard.auto-show enabled true

# Auto-show also requires the desktop-wide a11y toggle (org.gnome.desktop.
# interface toolkit-accessibility). Without it onboard just shows a modal
# "Enable accessibility now?" dialog on first focus instead of the keyboard —
# and since nothing can click it in a kiosk, auto-show silently never works.
# This must be set *before* chromium starts: accessibility bridges are only
# loaded at process launch, so toggling it after the fact doesn't retroactively
# enable it in an already-running browser.
gsettings set org.gnome.desktop.interface toolkit-accessibility true

onboard --size=800x300 --layout=Compact &

# --disable-background-networking stops GCM/sync/registration pings, which
# this unofficial Debian Chromium build has no API keys for and which just
# spam the log with harmless 401 "wrong_secret" errors otherwise.
# --app (instead of a plain URL arg) opens a chromeless "app mode" window —
# no address bar, tabs, or bookmarks bar — while still being an ordinary
# WM-managed top-level window (unlike --kiosk's override-redirect window),
# so openbox still stacks it normally and onboard can rise above it. The
# remaining openbox titlebar is stripped by a decor=no rule in openbox's
# rc.xml (host config, not this repo) instead of --kiosk, to get the same
# borderless look without breaking the keyboard.
# --test-type suppresses the "You are using an unsupported command-line
# flag: --no-sandbox" infobar that would otherwise sit at the top of every
# launch.
exec chromium \
    --app="$1" \
    --start-fullscreen \
    --window-position=0,0 \
    --no-sandbox \
    --test-type \
    --no-first-run \
    --disable-infobars \
    --noerrdialogs \
    --password-store=basic \
    --lang=de \
    --check-for-update-interval=31536000 \
    --disable-background-networking \
    --touch-events=enabled \
    --force-renderer-accessibility
