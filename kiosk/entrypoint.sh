#!/bin/sh
# Starts a session D-Bus + AT-SPI bus (chromium's accessibility tree rides on
# this) so onboard can auto-show/hide as an on-screen keyboard whenever a text
# field gets focus in chromium, then launches chromium itself.
set -e

eval "$(dbus-launch --sh-syntax)"
export DBUS_SESSION_BUS_ADDRESS

onboard --size=small --layout=Compact -a &

exec chromium \
    --kiosk \
    --no-sandbox \
    --no-first-run \
    --disable-infobars \
    --noerrdialogs \
    --start-fullscreen \
    --password-store=basic \
    --lang=de \
    --check-for-update-interval=31536000 \
    --touch-events=enabled \
    --force-renderer-accessibility \
    "$@"
