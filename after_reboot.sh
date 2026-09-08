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

# Guard against two invocations racing each other — e.g. running this by
# hand over SSH while home-dashboard.service's own run is still mid-flight.
# Two `docker compose` processes fighting over the same containers produced
# real "Conflict: name already in use" / "No such container" errors in
# testing, some of which needed a manual `docker rm -f` + daemon restart to
# untangle. `flock` on a fixed file makes a second run exit immediately
# instead of stepping on the first.
LOCKFILE="/tmp/home-dashboard.lock"
exec 200>"$LOCKFILE"
if ! flock -n 200; then
    echo "Another instance of after_reboot.sh is already running — exiting." >&2
    exit 1
fi

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
# "unplugging the Pi" is an unclean shutdown, so any container left over from
# before the power-cut has a writable layer written mid-kill (chromium
# profile lock files, crash-restore state, etc.). Reusing that container
# as-is (plain `up`) can leave chromium/onboard in a bad state instead of the
# clean boot every other run gets — tear fully down first so every boot
# starts from the same known-good state (this also makes --force-recreate on
# `up` redundant: there's nothing left in place to recreate).
# --remove-orphans drops the non-tailscale compose file's containers if that
# was used previously, and also clears the namespace-shared orphan
# containers (`<hash>_backend` etc.) that `network_mode: service:tailscale`
# can leave behind if tailscale's own container is recreated independently.
# --build: this runs unattended on every boot (see home-dashboard.service),
# so a `git pull` that changed a Dockerfile or kiosk/entrypoint.sh must take
# effect on the very next reboot with no separate manual `docker compose
# build` step — otherwise the device silently keeps running stale images
# forever. Docker's build cache makes this a fast no-op when nothing changed.
bring_up() {
    docker compose -f docker-compose.tailscale.yml down --remove-orphans
    docker compose -f docker-compose.tailscale.yml up --build --remove-orphans
}

# Docker's own container-naming index has been observed to get stuck after a
# force-removed container (name conflicts persisting even once `docker ps -a`
# confirms the container is gone) — restarting the docker daemon was the only
# fix found. Rather than requiring a manual SSH session + `systemctl restart
# docker` every time this happens, self-heal once automatically: retry after
# a second clean teardown, which is enough to clear a transient stale-name
# glitch without needing the daemon itself restarted.
if ! bring_up; then
    echo "Stack failed to start — retrying once after a clean teardown." >&2
    docker compose -f docker-compose.tailscale.yml down --remove-orphans
    sleep 2
    bring_up
fi