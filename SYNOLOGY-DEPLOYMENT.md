# 🏠 Teen Budget Tracker - Synology NAS Deployment Guide

Deploy the Teen Budget Tracker on your Synology NAS using Docker for family access to financial education tools.

## 📋 Prerequisites

### Synology NAS Requirements
- **Model**: DS918+ or compatible (minimum 4GB RAM recommended)
- **DSM Version**: 7.0 or later
- **Docker Package**: Installed from Package Center
- **Storage**: At least 2GB free space for application and database

### Network Requirements
- **Port 3001**: Available on your NAS
- **LAN Access**: For family members to access the application

## 🚀 Quick Deployment

### Step 1: Prepare Directory Structure
1. Open **File Station** on your Synology NAS
2. Navigate to `/volume1/docker/` (create if it doesn't exist)
3. Create a new folder: `teen-budget-tracker`
4. Set permissions to allow Docker access

### Step 2: Download Configuration
1. SSH into your Synology NAS or use the built-in terminal
2. Navigate to your Docker projects directory:
   ```bash
   cd /volume1/docker
   ```
3. Download the compose file:
   ```bash
   wget https://raw.githubusercontent.com/YOUR_REPO/teen-budget-tracker/main/docker-compose-synology.yml
   ```

### Step 3: Configure Environment
1. Edit the `docker-compose-synology.yml` file:
   ```bash
   nano docker-compose-synology.yml
   ```
2. **REQUIRED CHANGES**:
   - Replace `YOUR_NAS_IP` with your Synology NAS IP address (e.g., `192.168.1.100`)
   - Replace `CHANGE_THIS_TO_A_SECURE_RANDOM_STRING` with a secure secret (see security section)

### Step 4: Deploy the Application
```bash
# Pull and start the container
docker-compose -f docker-compose-synology.yml up -d

# Check if it's running
docker-compose -f docker-compose-synology.yml ps

# View logs
docker-compose -f docker-compose-synology.yml logs -f
```

### Step 5: Access the Application
1. Open a web browser
2. Navigate to: `http://YOUR_NAS_IP:3001`
3. You should see the Teen Budget Tracker login page

## 🔐 Security Configuration

### Generate Secure Secret
Use one of these methods to generate a secure NEXTAUTH_SECRET:

**Option 1 - On your NAS:**
```bash
openssl rand -base64 32
```

**Option 2 - Online (use a trusted generator):**
Visit: https://generate-secret.vercel.app/32

**Option 3 - Node.js:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Default Login Credentials
⚠️ **IMPORTANT**: Change these immediately after first login!

- **Viola**: PIN `1234`
- **Dominic**: PIN `5678`
- **Demo Account**: Available via "Try Demo Account" button

### Network Security
1. **Firewall**: Consider restricting access to your local network only
2. **Port**: Default port 3001 - change if needed for security
3. **Reverse Proxy**: Consider using Synology's built-in reverse proxy for HTTPS

## 📊 Database & Backup

### Database Location
The SQLite database is stored at:
```
/volume1/docker/teen-budget-tracker/teen-budget.db
```

### Backup Strategy
1. **Automatic Backup** (Recommended):
   ```bash
   # Create backup script
   cat > /volume1/docker/backup-teen-budget.sh << 'EOF'
   #!/bin/bash
   DATE=$(date +%Y%m%d_%H%M%S)
   BACKUP_DIR="/volume1/docker/backups/teen-budget-tracker"
   mkdir -p "$BACKUP_DIR"
   cp "/volume1/docker/teen-budget-tracker/teen-budget.db" "$BACKUP_DIR/teen-budget_$DATE.db"
   # Keep last 30 backups
   ls -t "$BACKUP_DIR"/teen-budget_*.db | tail -n +31 | xargs -r rm
   EOF
   
   chmod +x /volume1/docker/backup-teen-budget.sh
   ```

2. **Schedule with Cron**:
   ```bash
   # Add to crontab (daily at 2 AM)
   echo "0 2 * * * /volume1/docker/backup-teen-budget.sh" | crontab -
   ```

3. **Manual Backup**:
   ```bash
   cp /volume1/docker/teen-budget-tracker/teen-budget.db /path/to/backup/location/
   ```

## 🔧 Management Commands

### Update Application
```bash
# Stop the container
docker-compose -f docker-compose-synology.yml down

# Pull latest image
docker-compose -f docker-compose-synology.yml pull

# Start with new version
docker-compose -f docker-compose-synology.yml up -d
```

### View Logs
```bash
# Live logs
docker-compose -f docker-compose-synology.yml logs -f

# Last 100 lines
docker-compose -f docker-compose-synology.yml logs --tail=100
```

### Restart Application
```bash
docker-compose -f docker-compose-synology.yml restart
```

### Stop Application
```bash
docker-compose -f docker-compose-synology.yml down
```

## 📱 Access Options

### Local Network Access
- **Desktop**: `http://NAS_IP:3001`
- **Mobile**: Same URL works on mobile browsers
- **Tablets**: Responsive design adapts to all screen sizes

### External Access (Advanced)
1. **Port Forwarding**: Forward port 3001 on your router (security risk)
2. **VPN**: Connect via VPN to access locally (recommended)
3. **Reverse Proxy**: Use Synology's reverse proxy with HTTPS

## 🛠️ Troubleshooting

### Container Won't Start
1. Check logs: `docker-compose -f docker-compose-synology.yml logs`
2. Verify port 3001 is available: `netstat -tlnp | grep 3001`
3. Check file permissions on data directory

### Can't Access Web Interface
1. Verify NAS IP address is correct
2. Check Synology firewall settings
3. Ensure port 3001 is open
4. Try accessing from NAS locally: `curl http://localhost:3001`

### Database Issues
1. Check database file exists: `ls -la /volume1/docker/teen-budget-tracker/`
2. Verify permissions: `ls -la /volume1/docker/teen-budget-tracker/teen-budget.db`
3. Check container logs for database errors

### Performance Issues
1. Monitor resource usage in Docker UI
2. Adjust memory limits in docker-compose file
3. Check available disk space

## ⚡ Performance Optimization

### For DS918+ (4GB RAM)
- Default memory limit: 512MB (adjust if needed)
- CPU limit: 0.5 cores (50% of one core)
- Consider increasing limits if you have available resources

### Monitoring
```bash
# Check resource usage
docker stats teen-budget-tracker

# Check disk usage
du -sh /volume1/docker/teen-budget-tracker/
```

## 🔄 Updates & Maintenance

### Regular Maintenance Tasks
1. **Weekly**: Check application logs for errors
2. **Monthly**: Verify backups are working
3. **Quarterly**: Update to latest version
4. **As Needed**: Monitor disk space usage

### Version Management
The Docker image uses semantic versioning:
- `tigreroll/teen-budget-tracker:latest` - Latest stable release
- `tigreroll/teen-budget-tracker:v1.0.0` - Specific version

## 📞 Support

### Common Issues
- **Login Problems**: Verify default PINs or reset database
- **Performance**: Adjust resource limits
- **Network Access**: Check firewall and network settings

### Logs Location
- **Application Logs**: `docker-compose logs`
- **Database**: SQLite file can be inspected with DB Browser
- **System Logs**: Synology DSM logs

---

## 🎯 Post-Deployment Checklist

- [ ] Application accessible at `http://NAS_IP:3001`
- [ ] Viola can log in with PIN 1234
- [ ] Dominic can log in with PIN 5678
- [ ] Demo account works
- [ ] Both users can create transactions
- [ ] Database persists after container restart
- [ ] Backup script configured and tested
- [ ] **Security**: Default PINs changed
- [ ] **Security**: NEXTAUTH_SECRET updated
- [ ] **Network**: Access restricted to local network if desired

## 🛡️ Security Best Practices

1. **Change Default PINs**: First priority after deployment
2. **Secure Secret**: Use a strong, unique NEXTAUTH_SECRET
3. **Network Isolation**: Restrict to local network unless external access needed
4. **Regular Backups**: Automate database backups
5. **Monitor Access**: Regularly check logs for unusual activity
6. **Updates**: Keep the application updated to latest version

---

**Happy budgeting! 💰**