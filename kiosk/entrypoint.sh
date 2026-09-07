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

# Lazy D-Bus activation of org.a11y.Bus races onboard's first connection
# attempt on a cold container start, so launch the AT-SPI registry up front
# and give it a moment to publish its bus address before onboard looks for it.
/usr/libexec/at-spi-bus-launcher --launch-immediately &
sleep 1

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
