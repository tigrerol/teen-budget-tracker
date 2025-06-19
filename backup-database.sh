#!/bin/bash

# Teen Budget Tracker - Database Backup Script for Synology NAS
# This script creates timestamped backups of the SQLite database

# Configuration (adjust these paths for your Synology setup)
DB_PATH="/volume1/docker/teen-budget-tracker/teen-budget.db"
BACKUP_DIR="/volume1/docker/backups/teen-budget-tracker"
RETENTION_DAYS=30

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to log with timestamp
log() {
    echo -e "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

log "${BLUE}🗄️  Teen Budget Tracker Database Backup${NC}"
log "=============================================="

# Check if database file exists
if [[ ! -f "$DB_PATH" ]]; then
    log "${RED}❌ Database file not found: $DB_PATH${NC}"
    log "Make sure the Teen Budget Tracker container is running and has created the database."
    exit 1
fi

# Create backup directory if it doesn't exist
if [[ ! -d "$BACKUP_DIR" ]]; then
    log "${BLUE}📁 Creating backup directory: $BACKUP_DIR${NC}"
    mkdir -p "$BACKUP_DIR"
    if [[ $? -ne 0 ]]; then
        log "${RED}❌ Failed to create backup directory${NC}"
        exit 1
    fi
fi

# Generate timestamp for backup file
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/teen-budget_$TIMESTAMP.db"

# Create backup
log "${BLUE}💾 Creating backup...${NC}"
log "Source: $DB_PATH"
log "Destination: $BACKUP_FILE"

# Use SQLite's .backup command for safe backup (if sqlite3 is available)
if command -v sqlite3 &> /dev/null; then
    log "${BLUE}🔧 Using SQLite backup command for consistency${NC}"
    sqlite3 "$DB_PATH" ".backup '$BACKUP_FILE'"
    BACKUP_RESULT=$?
else
    log "${YELLOW}⚠️  SQLite3 CLI not available, using file copy${NC}"
    cp "$DB_PATH" "$BACKUP_FILE"
    BACKUP_RESULT=$?
fi

if [[ $BACKUP_RESULT -eq 0 ]]; then
    log "${GREEN}✅ Backup created successfully!${NC}"
    
    # Show backup file info
    BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    log "${BLUE}📊 Backup size: $BACKUP_SIZE${NC}"
else
    log "${RED}❌ Backup failed!${NC}"
    exit 1
fi

# Clean up old backups
log "${BLUE}🧹 Cleaning up old backups (keeping last $RETENTION_DAYS days)...${NC}"

# Find and count old backups
OLD_BACKUPS=$(find "$BACKUP_DIR" -name "teen-budget_*.db" -type f -mtime +$RETENTION_DAYS)
OLD_COUNT=$(echo "$OLD_BACKUPS" | grep -v '^$' | wc -l)

if [[ $OLD_COUNT -gt 0 ]]; then
    log "${YELLOW}🗑️  Removing $OLD_COUNT old backup(s)${NC}"
    find "$BACKUP_DIR" -name "teen-budget_*.db" -type f -mtime +$RETENTION_DAYS -delete
    log "${GREEN}✅ Cleanup completed${NC}"
else
    log "${GREEN}✅ No old backups to remove${NC}"
fi

# Show current backup status
TOTAL_BACKUPS=$(ls -1 "$BACKUP_DIR"/teen-budget_*.db 2>/dev/null | wc -l)
TOTAL_SIZE=$(du -sh "$BACKUP_DIR" 2>/dev/null | cut -f1)

log "${BLUE}📈 Backup Summary:${NC}"
log "   Total backups: $TOTAL_BACKUPS"
log "   Total size: $TOTAL_SIZE"
log "   Latest backup: $BACKUP_FILE"

# Verify backup integrity (if sqlite3 is available)
if command -v sqlite3 &> /dev/null; then
    log "${BLUE}🔍 Verifying backup integrity...${NC}"
    if sqlite3 "$BACKUP_FILE" "PRAGMA integrity_check;" | grep -q "ok"; then
        log "${GREEN}✅ Backup integrity verified${NC}"
    else
        log "${RED}❌ Backup integrity check failed!${NC}"
        exit 1
    fi
fi

log "${GREEN}🎉 Backup completed successfully!${NC}"
log "=============================================="

# Optional: Send notification (if Synology notification system is available)
if command -v synodsmnotify &> /dev/null; then
    synodsmnotify @administrators "Teen Budget Tracker" "Database backup completed successfully. Size: $BACKUP_SIZE"
fi