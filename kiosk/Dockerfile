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
        matchbox-window-manager \
    && rm -rf /var/lib/apt/lists/* \
    && sed -i '/de_DE.UTF-8/s/^# //' /etc/locale.gen \
    && locale-gen

ENV LANG=de_DE.UTF-8 \
    LANGUAGE=de_DE:de \
    LC_ALL=de_DE.UTF-8 \
    GTK_MODULES=gail:atk-bridge

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
