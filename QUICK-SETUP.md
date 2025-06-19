# 🚀 Quick Setup for Synology NAS

## Simple 5-Minute Setup

### Step 1: Download Files
SSH into your Synology NAS and run:
```bash
# Create directory
mkdir -p /volume1/docker/teen-budget-tracker
cd /volume1/docker

# Download setup files
wget https://raw.githubusercontent.com/YOUR_REPO/teen-budget-tracker/main/docker-compose-synology.yml
```

### Step 2: Configure
Edit the compose file:
```bash
nano docker-compose-synology.yml
```

**Required changes:**
- Line 11: Replace `YOUR_NAS_IP` with your NAS IP (e.g., `192.168.1.100`)
- Line 12: Replace `CHANGE_THIS_TO_A_SECURE_RANDOM_STRING` with:
  ```bash
  # Generate secret:
  openssl rand -base64 32
  ```

### Step 3: Deploy
```bash
docker-compose -f docker-compose-synology.yml up -d
```

### Step 4: Access
Open browser: `http://YOUR_NAS_IP:3001`

**Login:**
- Viola: PIN `1234`
- Dominic: PIN `5678`

⚠️ **Change these PINs immediately after first login!**

---

## That's it! 🎉

Your Teen Budget Tracker is now running on your Synology NAS.

**Database:** Automatically created in `/volume1/docker/teen-budget-tracker/`
**Backups:** See full guide for automated backup setup
**Updates:** `docker-compose pull && docker-compose up -d`

For detailed setup, troubleshooting, and advanced features, see [SYNOLOGY-DEPLOYMENT.md](SYNOLOGY-DEPLOYMENT.md)