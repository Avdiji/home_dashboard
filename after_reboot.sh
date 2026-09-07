#!/bin/bash
# Run this once after unplugging/power-cycling the Pi.
#
# The host boots into multi-user.target (no X), so lightdm/X never starts on
# its own — and the chromium container's host X passthrough (see
# docker-compose.yml / docker-compose.tailscale.yml) has nothing to connect
# to until it does. This makes the Pi boot into the graphical target, starts
# lightdm/X now, waits for the X socket, then brings the stack up.
set -e

sudo systemctl set-default graphical.target
sudo systemctl start lightdm

echo "Waiting for X server..."
until [ -S /tmp/.X11-unix/X0 ]; do
    sleep 1
done
echo "X server is up."

cd "$(dirname "$0")"
docker compose -f docker-compose.tailscale.yml up
