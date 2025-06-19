# Production Migration Guide: v1.0.6 → v1.0.12

## 🎯 Migration Overview

**Current Production**: `tigreroll/teen-budget-tracker:latest` (equivalent to v1.0.6)  
**Target Version**: `tigreroll/teen-budget-tracker:v1.0.12`  
**Migration Type**: **Zero-downtime upgrade** (no database schema changes)

## ✨ What's New in v1.0.12

### 🐛 Critical Bug Fixes
- **BUG-007**: Fixed API limit exceeded errors (Budget Overview requesting 1000 vs 100 limit)
- **BUG-006**: Fixed budget consumption calculations (date alignment issues)  
- **Category Save Error**: Resolved internal server errors during category creation

### 🚀 New Features
- **Version Tracking**: Build numbers, git commits, deployment timestamps
- **Delete Buttons**: Recent transactions can be deleted directly from dashboard
- **Cleaner UI**: Removed "View All Budgets" button from dashboard
- **Migration Tools**: `/version` page for production deployment tracking

## 🛡️ Pre-Migration Checklist

### 1. Backup Current State
```bash
# Backup current production data (optional - data persists via volumes)
docker exec teen-budget-tracker sqlite3 /app/data/teen-budget.db ".backup /app/data/backup-$(date +%Y%m%d-%H%M%S).db"

# Tag current version as backup
docker tag tigreroll/teen-budget-tracker:latest tigreroll/teen-budget-tracker:v1.0.6-backup
```

### 2. Verify Production Status
```bash
# Check current container status
docker ps | grep teen-budget-tracker

# Verify current version (if version endpoint exists)
curl -s http://localhost:3001/version || echo "Version endpoint not available in current version"
```

## 🚀 Migration Steps

### Step 1: Pull New Version
```bash
# Pull the latest v1.0.12 image (AMD64 compatible)
docker pull tigreroll/teen-budget-tracker:v1.0.12
docker pull tigreroll/teen-budget-tracker:latest  # Points to v1.0.12 now

# Verify image architecture matches your server
docker inspect tigreroll/teen-budget-tracker:v1.0.12 | grep Architecture
```

### Step 2: Deploy New Version
```bash
# Stop current container gracefully  
docker stop teen-budget-tracker

# Remove current container (data persists in volumes)
docker rm teen-budget-tracker

# Deploy new version with same volume mounts
docker run -d \
  --name teen-budget-tracker \
  -p 3001:3001 \
  -v teen-budget-data:/app/data \
  tigreroll/teen-budget-tracker:v1.0.12
```

### Step 3: Verify Deployment
```bash
# Check container startup
docker logs -f teen-budget-tracker

# Verify version endpoint (NEW in v1.0.12)
curl -s http://localhost:3001/version

# Test application responsiveness
curl -s http://localhost:3001/api/auth/users
```

## ✅ Post-Migration Validation

### 1. Version Verification
- Visit `/version` page to confirm v1.0.12 deployment
- Check build timestamp matches deployment time
- Verify all version info displays correctly

### 2. Feature Testing
- **Budget Overview**: Verify calculations show correct spending vs budget
- **Recent Transactions**: Test delete buttons work properly  
- **Categories**: Create new categories to ensure save functionality works
- **Login**: Test PIN authentication for all users

### 3. Data Integrity
- Verify all existing transactions are preserved
- Check budget data is intact and calculations are accurate
- Confirm user accounts and categories are unchanged

## 🔄 Rollback Strategy (If Needed)

### Quick Rollback
```bash
# Stop new version
docker stop teen-budget-tracker
docker rm teen-budget-tracker

# Restore previous version
docker run -d \
  --name teen-budget-tracker \
  -p 3001:3001 \
  -v teen-budget-data:/app/data \
  tigreroll/teen-budget-tracker:v1.0.6-backup
```

### Data Recovery
- Database volume persists across container versions
- No schema changes between versions - full data compatibility
- All user data, transactions, and settings preserved

## 📊 Success Criteria

### ✅ Deployment Success Indicators
- Container starts successfully with "Ready in XXms" message
- Version page shows v1.0.12 with correct build info
- Dashboard loads without errors
- Budget Overview shows accurate calculations
- Recent transaction delete buttons are visible

### ✅ Functional Validation
- All existing users can log in successfully
- Transaction creation/editing works properly
- Category management functions correctly
- Budget calculations reflect actual transactions
- No performance degradation observed

## 🚨 Troubleshooting

### Common Issues
1. **Container Won't Start**: Check Docker logs for specific errors
2. **Version Info Missing**: Ensure v1.0.12 image was properly built with version system
3. **Budget Calculations Wrong**: Clear browser cache, new calculation logic may need refresh
4. **Delete Buttons Missing**: Confirm v1.0.12 deployment, feature added in this version

### Emergency Contacts
- **Immediate Issues**: Use rollback procedure above
- **Data Problems**: Check volume mounts and database file permissions
- **Performance Issues**: Monitor container resource usage

## 📈 Monitoring Post-Migration

### Key Metrics to Watch
- Container startup time and stability
- API response times (especially budget overview)
- User authentication success rates
- Database query performance

### Version Tracking
- Visit `/version` regularly to confirm running version
- Use build numbers for precise deployment tracking
- Monitor for any unexpected version changes

---

**Migration Prepared**: June 19, 2025  
**Target Deployment**: Production environment  
**Estimated Downtime**: < 30 seconds (container restart only)  
**Risk Level**: Low (no schema changes, rollback available)