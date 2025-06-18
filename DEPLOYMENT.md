# Teen Budget Tracker - Deployment Guide

## Current Status
✅ **Application is deployed and running locally**
- URL: http://localhost:3001
- Container: `teen-budget-tracker`
- Database: SQLite with initialization
- Authentication: Demo account ready

## Local Network Access
To access from other devices on your network:
1. Find your computer's IP: `ipconfig getifaddr en0` (macOS) or `hostname -I` (Linux)
2. Access from any device: `http://YOUR_IP:3001`

## Production Deployment Options

### 1. Self-Hosted Server (Recommended)
```bash
# On your server
git clone <your-repo>
cd teen-budget-tracker
docker build -t teen-budget-tracker .
docker run -d --name teen-budget-tracker -p 3001:3001 teen-budget-tracker
```

### 2. Docker Hub Distribution
```bash
# Tag and push to Docker Hub
docker tag teen-budget-tracker yourusername/teen-budget-tracker:latest
docker push yourusername/teen-budget-tracker:latest

# Deploy anywhere
docker run -d --name teen-budget-tracker -p 3001:3001 yourusername/teen-budget-tracker:latest
```

### 3. Cloud Deployment

#### Railway
1. Connect GitHub repository
2. Use existing Dockerfile
3. Environment variables are set in container

#### Fly.io
```bash
fly launch
fly deploy
```

#### DigitalOcean App Platform
1. Connect repository
2. Dockerfile detected automatically
3. Set port to 3001

### 4. Reverse Proxy Setup (Nginx)
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Environment Configuration

The application includes production-ready defaults:
- `NEXTAUTH_URL=http://localhost:3001`
- `NEXTAUTH_SECRET=teen-budget-tracker-production-secret-2024`
- `DATABASE_URL=file:/app/data/teen-budget.db`

For production, update these in the Dockerfile or pass as environment variables.

## Database Persistence

Current setup uses SQLite with volume mounting. For production:

### Option 1: SQLite with Volume
```bash
docker run -d \
  --name teen-budget-tracker \
  -p 3001:3001 \
  -v $(pwd)/data:/app/data \
  teen-budget-tracker
```

### Option 2: PostgreSQL (Recommended for production)
1. Update `DATABASE_URL` in environment
2. Change Prisma schema datasource to PostgreSQL
3. Run migrations: `npx prisma db push`

## Security Considerations

- ✅ NextAuth.js configured
- ✅ HTTPS ready (add reverse proxy)
- ✅ Demo auth for testing
- 🔄 Production auth providers (add OAuth)
- 🔄 Environment secrets management
- 🔄 Database encryption at rest

## Monitoring & Maintenance

The application includes:
- Health checks via HTTP 200 responses
- Structured logging
- Graceful error handling
- Database initialization scripts

## Backup Strategy

For SQLite deployment:
```bash
# Backup
docker exec teen-budget-tracker sqlite3 /app/data/teen-budget.db ".backup /app/data/backup.db"

# Restore
docker cp backup.db teen-budget-tracker:/app/data/teen-budget.db
docker restart teen-budget-tracker
```

## Scaling Considerations

Current setup supports:
- Single instance deployment
- SQLite for <1000 users
- File-based session storage

For larger deployments:
- Use PostgreSQL
- Add Redis for sessions
- Implement horizontal scaling