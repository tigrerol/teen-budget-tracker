# WebStation Reverse Proxy Setup for Teen Budget Tracker

## Problem
WebStation is trying to connect via HTTPS/SSL to the container which only serves HTTP, causing the SSL handshake error.

## Solution: Configure WebStation Reverse Proxy Correctly

### Step 1: WebStation Portal Configuration

1. **Open WebStation** in DSM
2. Go to **Web Service Portal** → **Create** → **Create Service Portal**

### Step 2: Portal Settings

**General Settings:**
- **Portal Type**: Name-based
- **Hostname**: `budget` (or your preferred subdomain)
- **Port**: 
  - HTTP: 80
  - HTTPS: 443
- **Enable HSTS**: Optional (recommended for HTTPS)

### Step 3: Reverse Proxy Rules

1. Click on the portal you created
2. Go to **Reverse Proxy Rules**
3. Click **Create**

**Source:**
- **Protocol**: HTTP (or HTTPS if you have SSL certificate)
- **Hostname**: `budget` (same as portal)
- **Port**: 80 (or 443 for HTTPS)

**Destination:**
- **Protocol**: HTTP (NOT HTTPS - this is the key!)
- **Hostname**: `localhost` or `127.0.0.1`
- **Port**: 3002 (your container's external port)

### Step 4: Advanced Settings (Optional)

**Custom Headers:**
```
X-Real-IP $remote_addr
X-Forwarded-For $proxy_add_x_forwarded_for
X-Forwarded-Proto $scheme
X-Forwarded-Host $host
X-Forwarded-Port $server_port
```

**Timeouts:**
- **Connection timeout**: 60 seconds
- **Send timeout**: 60 seconds  
- **Read timeout**: 60 seconds

### Step 5: Update Docker Compose Environment

Since you're using reverse proxy, update the NEXTAUTH_URL in your docker-compose file:

```yaml
environment:
  - NEXTAUTH_URL=http://budget  # Or https://budget if using SSL
```

Or if using IP-based access:
```yaml
environment:
  - NEXTAUTH_URL=http://192.168.178.130  # Without port since proxy handles it
```

## Alternative: Direct Access Without WebStation

If you prefer to bypass WebStation entirely:

1. **Stop WebStation reverse proxy** for this service
2. **Access directly** via `http://YOUR_NAS_IP:3002`
3. **Update NEXTAUTH_URL** to match: `http://YOUR_NAS_IP:3002`

## Troubleshooting

### Still Getting SSL Errors?

1. **Check Protocol**: Ensure destination protocol is HTTP, not HTTPS
2. **Clear Browser Cache**: Old redirects might force HTTPS
3. **Check Container Logs**: 
   ```bash
   docker logs teen-budget-tracker
   ```

### Test Without SSL First

1. Configure WebStation for HTTP only initially
2. Access via `http://budget` or `http://YOUR_NAS_IP`
3. Once working, add SSL certificate if needed

### Container Health Check

Verify container is responding correctly:
```bash
curl http://localhost:3002/api/auth/users
```

## Working Configuration Example

**WebStation Portal:**
- Source: `http://budget:80`
- Destination: `http://localhost:3002`
- NO SSL between WebStation and container

**Docker Environment:**
```yaml
NEXTAUTH_URL=http://budget
```

## Important Notes

- The container serves HTTP on port 3001 (internal)
- Docker maps this to port 3002 (external)
- WebStation must connect via HTTP, not HTTPS
- SSL termination happens at WebStation level only

This setup ensures WebStation correctly proxies HTTP requests to your container without SSL handshake errors.