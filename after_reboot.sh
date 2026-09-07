#!/bin/bash
# Run this once after unplugging/power-cycling the Pi to get everything back
# up with no further steps.
#
# The host boots into multi-user.target (no X), so lightdm/X never starts on
# its own — and the chromium container's host X passthrough (see
# docker-compose.yml / docker-compose.tailscale.yml) has nothing to connect
# to until it does. This makes the Pi boot into the graphical target, starts
# lightdm/X now, waits for the X socket and the docker daemon, then brings
# the whole stack up so the script exits instead of blocking.
set -e

sudo systemctl set-default graphical.target
sudo systemctl start lightdm

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
docker compose -f docker-compose.tailscale.yml up

echo "Stack starting — check with: docker compose -f docker-compose.tailscale.yml ps"
