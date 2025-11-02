# Production Deployment Guide

This guide covers the complete process for deploying the LightDom Platform to production.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Database Configuration](#database-configuration)
4. [AI Service Setup](#ai-service-setup)
5. [Application Deployment](#application-deployment)
6. [Monitoring & Logging](#monitoring--logging)
7. [Security Hardening](#security-hardening)
8. [Scaling Strategies](#scaling-strategies)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### System Requirements

- **Operating System**: Ubuntu 20.04+ / CentOS 8+ / macOS
- **Node.js**: v20.x or higher
- **PostgreSQL**: v14.x or higher
- **Memory**: Minimum 4GB RAM (8GB+ recommended)
- **Storage**: 20GB+ available disk space
- **Network**: Stable internet connection

### Software Dependencies

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh
```

---

## Environment Setup

### 1. Clone Repository

```bash
git clone https://github.com/YourOrg/LightDom.git
cd LightDom
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

```bash
cp .env.example .env
nano .env
```

**Required Environment Variables:**

```bash
# Application
NODE_ENV=production
PORT=3001
LOG_LEVEL=info

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=dom_space_harvester
DB_USER=lightdom_user
DB_PASSWORD=your_secure_password_here

# Ollama AI Service
OLLAMA_API_URL=http://localhost:11434

# Security
JWT_SECRET=your_jwt_secret_minimum_32_characters
SESSION_SECRET=your_session_secret_minimum_32_characters
CORS_ORIGIN=https://yourdomain.com

# Optional: External Services
REDIS_URL=redis://localhost:6379
SENTRY_DSN=your_sentry_dsn_for_error_tracking
```

---

## Database Configuration

### 1. Create Database User

```bash
sudo -u postgres psql
```

```sql
CREATE USER lightdom_user WITH PASSWORD 'your_secure_password';
CREATE DATABASE dom_space_harvester OWNER lightdom_user;
GRANT ALL PRIVILEGES ON DATABASE dom_space_harvester TO lightdom_user;
\q
```

### 2. Run Migrations

```bash
npm run migrate
```

Expected output:
```
Running migration: 001_initial_schema.sql
Migration 001_initial_schema.sql completed
Running migration: 002_add_ai_interactions_table.sql
Migration 002_add_ai_interactions_table.sql completed
Running migration: 003_add_schema_library_table.sql
Migration 003_add_schema_library_table.sql completed
Executed 3 pending migration(s)
```

### 3. Verify Database Setup

```bash
psql -h localhost -U lightdom_user -d dom_space_harvester -c "\dt"
```

Expected tables:
- `content_entities`
- `ai_interactions`
- `schema_library`
- `schema_migrations`

---

## AI Service Setup

### 1. Start Ollama Service

```bash
# Start Ollama as a service
ollama serve &

# Or use systemd (recommended)
sudo systemctl enable ollama
sudo systemctl start ollama
```

### 2. Pull Required Models

```bash
# Pull DeepSeek model (recommended)
ollama pull deepseek-r1:1.5b

# Optional: Pull other models
ollama pull deepseek-r1:7b    # More powerful but slower
ollama pull r1                # Ollama default model
```

### 3. Verify Ollama Setup

```bash
curl http://localhost:11434/api/tags
```

Expected response should list available models.

---

## Application Deployment

### 1. Build TypeScript

```bash
npm run build
```

### 2. Load Component Schemas

```bash
npm run init:services
```

Expected output:
```
Loading 20 component schemas...
✓ Loaded 13 atomic components
✓ Loaded 2 molecular components
✓ Loaded 5 organism components
```

### 3. Start Production Server

```bash
npm run start:production
```

**Using PM2 (Recommended for Production):**

```bash
# Install PM2 globally
npm install -g pm2

# Start with PM2
pm2 start start-production.js --name lightdom-api

# Enable auto-start on reboot
pm2 startup
pm2 save

# View logs
pm2 logs lightdom-api
```

### 4. Verify Deployment

```bash
# Health check
curl http://localhost:3001/api/health

# Should return:
# {
#   "status": "healthy",
#   "database": "connected",
#   "ollama": "available",
#   "schemas": 20
# }
```

---

## Monitoring & Logging

### 1. Application Logs

```bash
# PM2 logs
pm2 logs lightdom-api

# System logs (if using systemd)
journalctl -u lightdom -f
```

### 2. Database Monitoring

```sql
-- Check active connections
SELECT count(*) FROM pg_stat_activity;

-- Monitor slow queries
SELECT query, mean_exec_time 
FROM pg_stat_statements 
ORDER BY mean_exec_time DESC 
LIMIT 10;
```

### 3. Health Checks

Create a monitoring script:

```bash
#!/bin/bash
# health-check.sh

HEALTH_ENDPOINT="http://localhost:3001/api/health"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" $HEALTH_ENDPOINT)

if [ $RESPONSE -eq 200 ]; then
  echo "✓ LightDom API is healthy"
  exit 0
else
  echo "✗ LightDom API is down (HTTP $RESPONSE)"
  exit 1
fi
```

**Set up cron job for periodic checks:**

```bash
crontab -e
```

Add:
```
*/5 * * * * /path/to/health-check.sh >> /var/log/lightdom-health.log 2>&1
```

### 4. Performance Metrics

Access metrics endpoint:

```bash
curl http://localhost:3001/api/metrics/workflows
```

---

## Security Hardening

### 1. Firewall Configuration

```bash
# Allow only necessary ports
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 3001/tcp  # API Server
sudo ufw enable
```

### 2. SSL/TLS Setup

**Using Nginx as reverse proxy:**

```bash
sudo apt install nginx certbot python3-certbot-nginx
```

```nginx
# /etc/nginx/sites-available/lightdom
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /socket.io/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

```bash
# Enable and start Nginx
sudo ln -s /etc/nginx/sites-available/lightdom /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com
```

### 3. Database Security

```sql
-- Revoke public schema access
REVOKE CREATE ON SCHEMA public FROM PUBLIC;

-- Set strong password policy
ALTER USER lightdom_user WITH PASSWORD 'new_strong_password';

-- Enable SSL connections
ALTER SYSTEM SET ssl = on;
```

### 4. Rate Limiting

Already configured in API server, but verify:

```javascript
// In api-server-express.js
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
```

---

## Scaling Strategies

### 1. Horizontal Scaling

**Load Balancer Configuration (Nginx):**

```nginx
upstream lightdom_backend {
    least_conn;
    server localhost:3001;
    server localhost:3002;
    server localhost:3003;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    location / {
        proxy_pass http://lightdom_backend;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

**Run multiple instances:**

```bash
PORT=3001 pm2 start start-production.js --name lightdom-api-1
PORT=3002 pm2 start start-production.js --name lightdom-api-2
PORT=3003 pm2 start start-production.js --name lightdom-api-3
```

### 2. Database Scaling

**Connection Pooling:**

```javascript
// In database configuration
const pool = new Pool({
  max: 20,              // Max connections per instance
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

**Read Replicas:**

```javascript
// Master for writes
const masterPool = new Pool({ host: 'master-db.example.com' });

// Replica for reads
const replicaPool = new Pool({ host: 'replica-db.example.com' });
```

### 3. Caching Layer

**Redis Integration:**

```bash
sudo apt install redis-server
sudo systemctl enable redis
sudo systemctl start redis
```

```javascript
// In application
import Redis from 'redis';

const cache = Redis.createClient({
  url: process.env.REDIS_URL
});

// Cache workflow results
await cache.setEx(`workflow:${id}`, 3600, JSON.stringify(workflow));
```

---

## Troubleshooting

### Common Issues

#### 1. API Server Won't Start

```bash
# Check port availability
sudo lsof -i :3001

# Check logs
pm2 logs lightdom-api

# Check environment variables
pm2 env 0
```

#### 2. Database Connection Errors

```bash
# Test connection
psql -h localhost -U lightdom_user -d dom_space_harvester

# Check PostgreSQL status
sudo systemctl status postgresql

# View PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-14-main.log
```

#### 3. Ollama Service Not Available

```bash
# Check Ollama status
curl http://localhost:11434/api/tags

# Restart Ollama
sudo systemctl restart ollama

# Check Ollama logs
journalctl -u ollama -f
```

#### 4. High Memory Usage

```bash
# Check process memory
pm2 monit

# Limit memory per instance
pm2 start start-production.js --max-memory-restart 1G
```

#### 5. Slow Component Generation

```bash
# Check Ollama model size
ollama list

# Use lighter model for better performance
ollama pull deepseek-r1:1.5b  # Faster than 7b version

# Increase Ollama concurrency
export OLLAMA_NUM_PARALLEL=4
```

### Debug Mode

Enable verbose logging:

```bash
LOG_LEVEL=debug npm run start:production
```

---

## Deployment Checklist

Before going live:

- [ ] Set `NODE_ENV=production`
- [ ] Use strong passwords (DB, JWT, Session)
- [ ] Enable SSL/TLS
- [ ] Configure firewall
- [ ] Set up monitoring and alerts
- [ ] Configure automated backups
- [ ] Test health check endpoint
- [ ] Load test the system
- [ ] Review security headers
- [ ] Set up error tracking (Sentry)
- [ ] Document recovery procedures
- [ ] Test rollback process
- [ ] Configure log rotation
- [ ] Set up uptime monitoring

---

## Backup & Recovery

### Database Backup

```bash
#!/bin/bash
# backup-db.sh

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/lightdom"
mkdir -p $BACKUP_DIR

pg_dump -h localhost -U lightdom_user dom_space_harvester | gzip > $BACKUP_DIR/backup_$TIMESTAMP.sql.gz

# Keep only last 7 days
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +7 -delete
```

**Automated daily backups:**

```bash
crontab -e
```

Add:
```
0 2 * * * /path/to/backup-db.sh
```

### Restore Database

```bash
gunzip -c /var/backups/lightdom/backup_20250102_020000.sql.gz | psql -h localhost -U lightdom_user dom_space_harvester
```

---

## Support

For production support:
- **Documentation**: See `docs/` directory
- **Issues**: GitHub Issues
- **Email**: support@yourdomain.com

---

**Last Updated**: 2025-01-02
