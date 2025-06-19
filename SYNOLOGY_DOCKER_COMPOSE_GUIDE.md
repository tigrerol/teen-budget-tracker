# Docker Compose Deployment Guide for Synology NAS

## 🎯 Overview

This guide walks you through deploying Teen Budget Tracker on Synology NAS using Docker Compose, which provides better configuration management, easier updates, and more robust deployment compared to individual container management.

## 📋 Prerequisites

### Synology Requirements
- **DSM 7.0+** with Docker package installed
- **SSH access** enabled (Control Panel → Terminal & SNMP → Enable SSH service)
- **Minimum 2GB RAM** available for container
- **1GB storage** for application and database

### Docker Compose Installation
```bash
# SSH into your Synology NAS
ssh admin@your-nas-ip

# Install Docker Compose (if not already available)
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker-compose --version
```

## 📂 Setup Directory Structure

```bash
# Create project directory
sudo mkdir -p /volume1/docker/teen-budget-tracker
cd /volume1/docker/teen-budget-tracker

# Create data directory with proper permissions
sudo mkdir -p data
sudo chown -R 1001:1001 data
sudo chmod 755 data
```

## 📄 Configuration Files

### 1. Create docker-compose.yml
```yaml
version: '3.8'

services:
  teen-budget-tracker:
    image: tigreroll/teen-budget-tracker:v1.0.12
    container_name: teen-budget-tracker
    restart: unless-stopped
    ports:
      - "3001:3001"
    volumes:
      - teen_budget_data:/app/data
    environment:
      - NODE_ENV=production
      - DATABASE_URL=file:/app/data/teen-budget.db
      - NEXTAUTH_URL=http://192.168.178.130:3001  # Update with your NAS IP
      - NEXTAUTH_SECRET=teen-budget-tracker-production-secret-2024
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://0.0.0.0:3001/api/auth/users"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    labels:
      - "com.docker.compose.project=teen-budget-tracker"
      - "com.docker.compose.service=web"
      - "app.version=1.0.12"
      - "app.description=Teen Budget Tracker - Personal finance management"
      - "maintenance.backup.enable=true"
      - "maintenance.update.check=daily"
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '0.5'
        reservations:
          memory: 256M
          cpus: '0.25'

volumes:
  teen_budget_data:
    driver: local
    labels:
      - "com.docker.compose.project=teen-budget-tracker"
      - "backup.enable=true"
      - "backup.frequency=daily"

networks:
  default:
    name: teen-budget-network
    labels:
      - "com.docker.compose.project=teen-budget-tracker"
```

### 2. Create .env file (Optional)
```bash
# Environment variables for production
NODE_ENV=production
NEXTAUTH_URL=http://192.168.178.130:3001
NEXTAUTH_SECRET=teen-budget-tracker-production-secret-2024
DATABASE_URL=file:/app/data/teen-budget.db

# Resource limits
MEMORY_LIMIT=512M
CPU_LIMIT=0.5
```

### 3. Create docker-compose.override.yml (For local customizations)
```yaml
version: '3.8'

services:
  teen-budget-tracker:
    environment:
      - NEXTAUTH_URL=http://YOUR_ACTUAL_NAS_IP:3001
    # Uncomment if you want to use host network for easier access
    # network_mode: host
    # ports: []  # Remove port mapping when using host network
```

## 🚀 Deployment Steps

### Step 1: Download and Prepare Files
```bash
# SSH into your NAS
ssh admin@your-nas-ip

# Navigate to project directory
cd /volume1/docker/teen-budget-tracker

# Create the docker-compose.yml file (copy content from above)
sudo nano docker-compose.yml

# Update NEXTAUTH_URL with your actual NAS IP address
sudo sed -i 's/192.168.178.130/YOUR_NAS_IP/g' docker-compose.yml
```

### Step 2: Deploy the Application
```bash
# Pull the latest image
docker-compose pull

# Start the application in detached mode
docker-compose up -d

# View startup logs
docker-compose logs -f teen-budget-tracker
```

### Step 3: Verify Deployment
```bash
# Check container status
docker-compose ps

# Test application health
curl http://YOUR_NAS_IP:3001/api/auth/users

# Check version info (new in v1.0.12)
curl http://YOUR_NAS_IP:3001/version
```

## 🔧 Management Commands

### Daily Operations
```bash
# View logs
docker-compose logs teen-budget-tracker
docker-compose logs -f teen-budget-tracker  # Follow logs

# Check resource usage
docker stats teen-budget-tracker

# Restart application
docker-compose restart teen-budget-tracker

# Stop application
docker-compose stop

# Start application
docker-compose start
```

### Updates and Maintenance
```bash
# Update to latest version
docker-compose pull
docker-compose up -d

# Update to specific version
# Edit docker-compose.yml to change image tag, then:
docker-compose up -d

# View container information
docker-compose exec teen-budget-tracker sh
```

### Database Management
```bash
# Access database directly
docker-compose exec teen-budget-tracker sqlite3 /app/data/teen-budget.db

# Backup database
docker-compose exec teen-budget-tracker sqlite3 /app/data/teen-budget.db ".backup /app/data/backup-$(date +%Y%m%d).db"

# View data directory
docker-compose exec teen-budget-tracker ls -la /app/data/
```

## 🛡️ Security and HTTPS Setup

### Option 1: Reverse Proxy with Traefik
Add to docker-compose.yml:
```yaml
services:
  teen-budget-tracker:
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.budget.rule=Host(`budget.your-domain.com`)"
      - "traefik.http.routers.budget.tls=true"
      - "traefik.http.services.budget.loadbalancer.server.port=3001"
```

### Option 2: Synology Reverse Proxy
1. **Control Panel** → **Application Portal** → **Reverse Proxy**
2. **Create** new rule:
   - **Source**: `budget.your-domain.com` (HTTPS, Port 443)
   - **Destination**: `localhost:3001` (HTTP)
3. Update NEXTAUTH_URL in docker-compose.yml to use HTTPS

## 📊 Monitoring and Troubleshooting

### Health Monitoring
```bash
# Check application health
docker-compose exec teen-budget-tracker wget -qO- http://localhost:3001/api/auth/users

# View detailed container info
docker-compose exec teen-budget-tracker cat /proc/meminfo
docker-compose exec teen-budget-tracker df -h
```

### Common Issues and Solutions

#### Issue: Container Won't Start
```bash
# Check logs for specific errors
docker-compose logs teen-budget-tracker

# Common fixes:
# 1. Check data directory permissions
sudo chown -R 1001:1001 /volume1/docker/teen-budget-tracker/data

# 2. Verify port availability
sudo netstat -tulpn | grep :3001

# 3. Clean up and restart
docker-compose down
docker-compose up -d
```

#### Issue: Database Connection Problems
```bash
# Verify database file exists and is accessible
docker-compose exec teen-budget-tracker ls -la /app/data/

# Check database integrity
docker-compose exec teen-budget-tracker sqlite3 /app/data/teen-budget.db "PRAGMA integrity_check;"
```

#### Issue: Memory or Performance Problems
```bash
# Monitor resource usage
docker stats teen-budget-tracker

# Adjust memory limits in docker-compose.yml:
deploy:
  resources:
    limits:
      memory: 1G  # Increase from 512M
      cpus: '1.0'  # Increase from 0.5
```

## 🔄 Backup and Restore

### Automated Backup Script
Create `/volume1/docker/teen-budget-tracker/backup.sh`:
```bash
#!/bin/bash
BACKUP_DIR="/volume1/docker/teen-budget-tracker/backups"
DATE=$(date +%Y%m%d-%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup database
docker-compose exec -T teen-budget-tracker sqlite3 /app/data/teen-budget.db ".backup /app/data/backup-$DATE.db"

# Copy backup to backup directory
docker cp teen-budget-tracker:/app/data/backup-$DATE.db $BACKUP_DIR/

# Keep only last 7 days of backups
find $BACKUP_DIR -name "backup-*.db" -mtime +7 -delete

echo "Backup completed: backup-$DATE.db"
```

### Schedule Automatic Backups
```bash
# Add to crontab (run daily at 2 AM)
sudo crontab -e
0 2 * * * /volume1/docker/teen-budget-tracker/backup.sh
```

## 📱 Access URLs

After successful deployment, access your application at:

- **Main Application**: `http://YOUR_NAS_IP:3001`
- **Version Info**: `http://YOUR_NAS_IP:3001/version`
- **Health Check**: `http://YOUR_NAS_IP:3001/api/auth/users`

## 🎉 Advantages of Docker Compose on Synology

### Benefits Over Individual Container Management:
1. **Configuration as Code**: All settings in version-controlled files
2. **Easy Updates**: Single command to update entire stack
3. **Environment Management**: Clear separation of dev/prod configs
4. **Service Dependencies**: Automatic handling of startup order
5. **Volume Management**: Consistent data persistence
6. **Network Isolation**: Dedicated network for the application
7. **Resource Limits**: Built-in resource management
8. **Health Monitoring**: Integrated health checks and restart policies

### Integration with Synology Features:
- **DSM Integration**: Containers appear in Docker package GUI
- **Backup Station**: Can backup the entire project directory
- **File Station**: Easy access to configuration files
- **Log Center**: Centralized log collection
- **Resource Monitor**: Built-in monitoring of container resources

---

**Deployment Method**: Docker Compose on Synology NAS  
**Recommended For**: Production environments, easier management  
**Maintenance Effort**: Low (automated updates and backups)  
**Scalability**: High (easy to add related services)