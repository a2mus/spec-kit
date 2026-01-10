# Remote Collaboration Guide

This guide helps you set up remote access to the BeagleBone for development collaboration.

---

## 1. Tailscale Setup (Recommended)

[Tailscale](https://tailscale.com/) creates a secure, private network (VPN) that allows direct access to the BeagleBone from anywhere.

### On the BeagleBone (Teammate's Steps)

```bash
# 1. Install Tailscale
curl -fsSL https://tailscale.com/install.sh | sh

# 2. Start Tailscale and authenticate
sudo tailscale up

# 3. Note the assigned IP (e.g., 100.x.x.x)
tailscale ip -4
```

### On Your PC

1. Download Tailscale from [tailscale.com/download](https://tailscale.com/download)
2. Install and sign in with the **same account** (or join via shared Tailnet)
3. SSH into the BeagleBone:
   ```bash
   ssh debian@100.x.x.x
   ```

> [!TIP]
> Use the same Tailscale account, or share access via [Tailscale ACLs](https://tailscale.com/kb/1018/acls/).

---

## 2. VS Code Remote-SSH

Once connected via Tailscale:

1. Install **Remote - SSH** extension in VS Code
2. Add to `~/.ssh/config`:
   ```
   Host beaglebone
       HostName 100.x.x.x
       User debian
   ```
3. Connect: `Ctrl+Shift+P` → "Remote-SSH: Connect to Host" → `beaglebone`

---

## 3. Git Workflow

Use Git to sync code between your PC and the BeagleBone:

```bash
# On BeagleBone: Clone the repo
git clone https://github.com/YOUR_REPO/virtual-fencing.git
cd virtual-fencing

# Pull latest changes
git pull origin main

# After testing, commit and push results
git add .
git commit -m "Tested on real hardware"
git push origin main
```

---

## 4. Alternative: ngrok (Temporary Access)

If Tailscale is not an option:

```bash
# On BeagleBone
ngrok tcp 22
```

Share the generated URL (e.g., `tcp://0.tcp.ngrok.io:12345`) for SSH access.

---

## 5. Communication Protocol

| Channel | Use For |
|---------|---------|
| Git Issues | Bug reports, feature requests |
| Discord/Slack | Quick questions, sharing logs |
| Screen Share | Live debugging sessions |
