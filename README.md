# Raspberry Pi 5 Kiosk Setup — Full Guide

Complete setup for a Raspberry Pi 5 running a containerized fullstack app with Tailscale remote access and a local kiosk display (X11 + Chromium).

Tested on: Raspberry Pi OS (Debian Trixie-based, 64-bit / aarch64).

---

## 1. Install Git

```bash
sudo apt update
sudo apt install git
```

Set your identity (needed for commits):
```bash
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
```

Verify:
```bash
git --version
```

---

## 2. Install Docker (Raspberry Pi 5 / ARM64)

Use Docker's official convenience script — it auto-detects the ARM64 architecture:

```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
```

After installing:
```bash
# Run docker without sudo
sudo usermod -aG docker $USER

# Enable Docker on boot
sudo systemctl enable --now docker
```

Log out and back in (or reboot) for the group change to apply. Verify:
```bash
docker run hello-world
```

Confirm you're on 64-bit OS (should print `aarch64`, not `armv7l`):
```bash
uname -m
```

---

## 3. Clone the Git Repository

```bash
cd ~
git clone https://github.com/Avdiji/home_dashboard.git
cd home_dashboard
```

To pull updates later:
```bash
git pull
```

---

## 4. Install and Configure X11 (for Kiosk Display)

### 4.1 Install X server and kiosk essentials

```bash
sudo apt update
sudo apt install --no-install-recommends xserver-xorg x11-xserver-utils xinit
sudo apt install --no-install-recommends openbox chromium-browser unclutter
```

### 4.2 Install a display manager (lightdm) — avoids manual `startx` / tty permission issues

**Important:** `startx` will NOT work over SSH — it requires a real console "seat," which SSH sessions don't have (`loginctl list-sessions` will show no SEAT assigned). Use lightdm as a systemd service instead; it manages its own VT access as root, independent of your login session.

```bash
sudo apt install --no-install-recommends lightdm
sudo apt install accountsservice
```
(`accountsservice` is required — without it lightdm's user-list lookup fails and it can loop-crash.)

### 4.3 Configure autologin

```bash
sudo nano /etc/lightdm/lightdm.conf
```

Add/edit under `[Seat:*]`:
```ini
[Seat:*]
autologin-user=pi
autologin-session=openbox
```

Save (`Ctrl+O`, `Enter`) and exit (`Ctrl+X`).

### 4.4 Fix the "Cannot run in framebuffer mode" / "no screens found" errors

The Pi 5 exposes multiple `/dev/dri/cardN` devices; Xorg can't auto-pick the right one. You must specify it explicitly.

**Find which card has your monitor connected:**
```bash
for f in /sys/class/drm/*/status; do echo "$f: $(cat $f)"; done
```
Look for the connector marked `connected` (e.g. `card1-HDMI-A-1: connected`) — note which `cardN` it belongs to.

**Create the Xorg config:**
```bash
sudo nano /etc/X11/xorg.conf.d/99-modesetting.conf
```

Content (replace `card1` with whatever you found above):
```
Section "Device"
    Identifier "Pi5 GPU"
    Driver "modesetting"
    Option "kmsdev" "/dev/dri/card1"
EndSection
```

### 4.5 Start lightdm

```bash
sudo systemctl enable lightdm
sudo systemctl restart lightdm
```

### 4.6 Verify X is running correctly

```bash
sudo systemctl status lightdm --no-pager
ps aux | grep -i [X]org
sudo cat /var/log/lightdm/x-0.log
```
No `Fatal server error` in the log and an Xorg process in a non-`D` state (e.g. `Ssl+`) means it's healthy.

### 4.7 Allow local Docker containers to connect to the X display

```bash
DISPLAY=:0 xhost +local:docker
```

**This does NOT persist across reboots.** Add it to an autostart mechanism, e.g. lightdm's session autostart or a small systemd service, so it runs every boot.

---

## 5. Chromium-in-Docker: Required Compose Settings

For a containerized Chromium kiosk to reach the host's X server, the compose service needs:

```yaml
services:
  chromium:
    # ... your existing config ...
    environment:
      - DISPLAY=:0
    volumes:
      - /tmp/.X11-unix:/tmp/.X11-unix:rw
    devices:
      - /dev/dri:/dev/dri
```

- `DISPLAY` + the X11 socket volume → lets Chromium find and connect to the host's X server.
- `/dev/dri` device passthrough → gives the container access to the GPU nodes for hardware-accelerated rendering (avoids `MESA-LOADER: failed to retrieve device information` errors).

After changing `docker-compose.yml`, a plain `restart` is not enough — recreate the container:
```bash
docker compose up -d --force-recreate chromium
```

**Note:** if you see `V3D x.x not supported by this version of Mesa` and `libGL error: failed to load driver: vc4`, this is a version mismatch between the container's Mesa userspace driver and the host kernel's GPU driver. Chromium falls back to software rendering automatically — the browser still works, just without GPU acceleration. Safe to ignore unless the UI feels sluggish; if so, add explicit flags like `--use-gl=swiftshader` to the Chromium launch command.

D-Bus errors (`Failed to connect to the bus`, `UPower`, `GCM registration`) are also harmless noise in a minimal container with no system D-Bus / Google account — they don't block rendering.

---

## 6. Troubleshooting Quick Reference

| Symptom | Cause | Fix |
|---|---|---|
| `parse_vt_settings: Cannot open /dev/tty0 (Permission denied)` | Running `startx` over SSH (no console seat) | Use lightdm instead of `startx` |
| `Cannot run in framebuffer mode. Please specify busIDs...` | Multiple `/dev/dri/cardN` devices, none selected | Add `xorg.conf.d` file with explicit `kmsdev` |
| `Fatal server error: no screens found` | Wrong `/dev/dri/cardN` specified (no monitor attached to that card) | Check `/sys/class/drm/*/status`, use the `connected` card |
| `xhost: unable to open display ":0"` | X server not running yet, or checking from a session with no seat | Confirm Xorg is alive (`ps aux \| grep Xorg`) before running `xhost` |
| `Missing X server or $DISPLAY` (in container) | Container missing `DISPLAY` env / X11 socket mount | Add `environment: DISPLAY=:0` and mount `/tmp/.X11-unix` |
| `libGL error: failed to open /dev/dri/cardX: No such file or directory` (in container) | GPU devices not passed into container | Add `devices: - /dev/dri:/dev/dri` |
| `usermod: no changes` when adding to `tty`/`video` groups | User already in those groups — not the actual problem | Check `loginctl list-sessions` for a `SEAT` instead |

---

## 7. Useful Diagnostic Commands

```bash
# Check which session has console access
loginctl list-sessions
tty
echo $SSH_CONNECTION

# Check connected displays
for f in /sys/class/drm/*/status; do echo "$f: $(cat $f)"; done

# Check lightdm status and logs
sudo systemctl status lightdm --no-pager
sudo cat /var/log/lightdm/lightdm.log
sudo cat /var/log/lightdm/x-0.log

# Check running Xorg process and its state
ps aux | grep -i [X]org
```
