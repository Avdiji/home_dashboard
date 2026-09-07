#!/bin/sh
# Pi OS Lite has no desktop/window manager on the host X server. Chromium's
# --kiosk mode uses an override-redirect fullscreen window, which sits above
# everything and bypasses window-manager stacking entirely — so onboard's
# on-screen-keyboard popup could never draw above it. Instead:
#   1. run a minimal WM (matchbox) so windows are properly stacked/raised
#   2. run chromium WM-managed fullscreen (no --kiosk) so onboard can rise
#      above it
#   3. run onboard, auto-shown via AT-SPI when chromium focuses a text field
set -e

matchbox-window-manager -use_titlebar no &
sleep 1

eval "$(dbus-launch --sh-syntax)"
export DBUS_SESSION_BUS_ADDRESS

onboard --size=small --layout=Compact -a &

exec chromium \
    --start-fullscreen \
    --window-position=0,0 \
    --no-sandbox \
    --no-first-run \
    --disable-infobars \
    --noerrdialogs \
    --password-store=basic \
    --lang=de \
    --check-for-update-interval=31536000 \
    --touch-events=enabled \
    --force-renderer-accessibility \
    "$@"
