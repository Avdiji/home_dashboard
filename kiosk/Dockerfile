# Minimal Chromium kiosk image: displays the frontend fullscreen on the
# host's X server (X11 passthrough) — for a monitor plugged directly into
# the Pi. German locale/UI, no sandbox (containerized, trusted local net).

FROM debian:bookworm-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
        chromium \
        fonts-noto-color-emoji \
        locales \
        onboard \
        dbus-x11 \
        at-spi2-core \
        gir1.2-atspi-2.0 \
        libglib2.0-bin \
    && rm -rf /var/lib/apt/lists/* \
    && sed -i '/de_DE.UTF-8/s/^# //' /etc/locale.gen \
    && locale-gen \
    # Kiosk hardening: strip the F-key row from onboard's on-screen keyboard
    # (its "numbers" layer) — F11/F12 etc. have no place on a touchscreen
    # with no physical keyboard and only invite breaking out of the kiosk.
    && sed -i '/group="fkeys"/d' "/usr/share/onboard/layouts/Compact.onboard"

ENV LANG=de_DE.UTF-8 \
    LANGUAGE=de_DE:de \
    LC_ALL=de_DE.UTF-8 \
    GTK_MODULES=gail:atk-bridge

# Kiosk hardening: DevTools (F12, Ctrl+Shift+I, right-click Inspect) disabled
# via Chromium enterprise policy — the app's own contextmenu handler (see
# frontend/src/core/kiosk.js) blocks the rest of the right-click menu.
COPY policies.json /etc/chromium/policies/managed/policies.json

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
