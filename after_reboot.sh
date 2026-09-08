#!/bin/bash
# Brings the app stack up. Safe to run by hand (e.g. after pulling new code,
# or to force a clean restart) and is also exactly what the home-dashboard
# systemd service runs automatically on every boot — see after_initial_boot.sh,
# which provisions that service plus the X11/lightdm/docker setup this relies
# on, once per device.
#
# Needs no sudo: after_initial_boot.sh already made graphical.target the
# permanent boot default and enabled lightdm as a systemd service, so X is
# either already up or already on its way up by the time this runs — we just
# wait for its socket instead of starting it ourselves (starting it here too
# would need sudo, which a boot-time systemd service can't interactively
# provide). Docker needs no sudo either, since that same script added this
# user to the docker group.
set -e

echo "Waiting for X server..."
for i in $(seq 1 30); do
    [ -S /tmp/.X11-unix/X0 ] && break
    sleep 1
done
if [ ! -S /tmp/.X11-unix/X0 ]; then
    echo "X server did not come up after 30s — check 'systemctl status lightdm'." >&2
    exit 1
fi
echo "X server is up."

echo "Waiting for docker daemon..."
for i in $(seq 1 30); do
    docker info >/dev/null 2>&1 && break
    sleep 1
done
if ! docker info >/dev/null 2>&1; then
    echo "Docker daemon did not come up after 30s — check 'systemctl status docker'." >&2
    exit 1
fi
echo "Docker is up."

cd "$(dirname "$0")"
# --force-recreate: "unplugging the Pi" is an unclean shutdown, so any
# container left over from before the power-cut has a writable layer written
# mid-kill (chromium profile lock files, crash-restore state, etc.). Reusing
# that container as-is (plain `up`) can leave chromium/onboard in a bad state
# instead of the clean boot every other run gets — recreate so every boot
# starts from the same known-good state. --remove-orphans drops the
# non-tailscale compose file's containers if that was used previously.
# --build: this runs unattended on every boot (see home-dashboard.service),
# so a `git pull` that changed a Dockerfile or kiosk/entrypoint.sh must take
# effect on the very next reboot with no separate manual `docker compose
# build` step — otherwise the device silently keeps running stale images
# forever. Docker's build cache makes this a fast no-op when nothing changed.
docker compose -f docker-compose.tailscale.yml up --build --force-recreate --remove-orphans
