# LightDom Production Deployment Guide

## 🚀 Complete Production Deployment Guide

This guide covers the complete production deployment of LightDom, including monitoring, scaling, security, and maintenance.

## 📋 Prerequisites

### System Requirements
- **OS**: Ubuntu 20.04+ / CentOS 8+ / RHEL 8+
- **CPU**: 4+ cores (8+ recommended)
- **RAM**: 8GB+ (16GB+ recommended)
- **Storage**: 100GB+ SSD
- **Network**: Stable internet connection

### Software Requirements
- Node.js 18+
- Docker 20.10+
- Kubernetes 1.24+
- Helm 3.8+
- PostgreSQL 13+
- Redis 6+

## 🏗️ Deployment Options

### Option 1: Docker Compose (Recommended for Small-Medium Deployments)

#### Quick Start
```bash
# Clone repository
git clone <repository-url>
cd LightDom

# Setup environment
cp .env.example .env.production
# Edit .env.production with your configuration

# Start services
docker-compose -f docker-compose.production.yml up -d

# Check status
docker-compose -f docker-compose.production.yml ps
```

#### Configuration
```bash
# Environment variables (.env.production)
NODE_ENV=production
DOMAIN=lightdom.example.com
DB_PASSWORD=secure_password_123
REDIS_PASSWORD=redis_password_123
JWT_SECRET=your_jwt_secret_key
ENCRYPTION_KEY=your_encryption_key
SSL_ENABLED=true
MONITORING_ENABLED=true
```

#### Services Included
- **PostgreSQL**: Database with persistent storage
- **Redis**: Cache with persistent storage
- **API Server**: LightDom API with clustering
- **Frontend**: Nginx serving React app
- **Enhanced Systems**: Blockchain + Crawler
- **Monitoring**: Prometheus + Grafana
- **Load Balancer**: Nginx load balancer

### Option 2: Kubernetes (Recommended for Large-Scale Deployments)

#### Prerequisites
```bash
# Install kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl

# Install Helm
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
```

#### Deployment Steps
```bash
# Build and push Docker image
docker build -f Dockerfile.production -t lightdom:latest .
docker tag lightdom:latest your-registry/lightdom:latest
docker push your-registry/lightdom:latest

# Deploy to Kubernetes
kubectl apply -f k8s/lightdom-production.yaml

# Check deployment status
kubectl get pods -n lightdom
kubectl get services -n lightdom
kubectl get ingress -n lightdom
```

#### Scaling
```bash
# Scale API servers
kubectl scale deployment lightdom-api --replicas=5 -n lightdom

# Scale frontend
kubectl scale deployment lightdom-frontend --replicas=3 -n lightdom

# Check HPA status
kubectl get hpa -n lightdom
```

### Option 3: Manual Server Setup (For Custom Deployments)

#### Automated Setup
```bash
# Run production environment setup
node scripts/setup-production-environment.js

# Start services
systemctl start lightdom-api
systemctl start lightdom-enhanced

# Check status
systemctl status lightdom-api
systemctl status lightdom-enhanced
```

#### Manual Configuration
```bash
# Install dependencies
sudo apt-get update
sudo apt-get install -y postgresql redis-server nginx certbot

# Setup database
sudo -u postgres createdb dom_space_harvester_prod
sudo -u postgres createuser lightdom_prod

# Configure services
sudo cp config/lightdom-api.service /etc/systemd/system/
sudo cp config/lightdom-enhanced.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable lightdom-api lightdom-enhanced
```

## 📊 Monitoring and Observability

### Prometheus Metrics
- **Endpoint**: `http://your-domain:9090/metrics`
- **Metrics**: System, application, and custom metrics
- **Retention**: 15 days (configurable)

### Grafana Dashboards
- **URL**: `http://your-domain:3000`
- **Default Login**: admin / admin_password_123
- **Dashboards**: System overview, application metrics, alerts

### Health Checks
```bash
# API Health
curl http://your-domain:3001/api/health

# System Status
curl http://your-domain:3001/api/headless/status

# Database Health
curl http://your-domain:3001/api/db/health

# Blockchain Stats
curl http://your-domain:3001/api/blockchain/stats

# Crawler Stats
curl http://your-domain:3001/api/crawler/stats
```

### Log Management
- **Location**: `/app/logs/` (Docker) or `/var/log/lightdom/` (Systemd)
- **Rotation**: Daily rotation with 30-day retention
- **Format**: JSON structured logging
- **Levels**: ERROR, WARN, INFO, DEBUG

## 🔒 Security Configuration

### SSL/TLS Setup
```bash
# Using Let's Encrypt (Certbot)
sudo certbot certonly --standalone -d your-domain.com
sudo certbot certonly --standalone -d www.your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Firewall Configuration
```bash
# UFW (Ubuntu)
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 3001/tcp
sudo ufw enable

# iptables (CentOS/RHEL)
sudo iptables -A INPUT -p tcp --dport 22 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 80 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 443 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 3001 -j ACCEPT
sudo iptables -A INPUT -j DROP
```

### Security Hardening
- **Fail2ban**: Protection against brute force attacks
- **Rate Limiting**: API rate limiting (100 requests/minute)
- **Input Validation**: All inputs validated and sanitized
- **CORS**: Proper CORS configuration
- **Headers**: Security headers (HSTS, CSP, etc.)

## 📈 Performance Optimization

### Database Optimization
```sql
-- Create indexes for better performance
CREATE INDEX idx_transactions_timestamp ON transactions(timestamp);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_chat_messages_room_id ON chat_messages(room_id);
CREATE INDEX idx_chat_messages_timestamp ON chat_messages(timestamp);

-- Analyze tables for query optimization
ANALYZE transactions;
ANALYZE chat_messages;
ANALYZE user_economy;
```

### Redis Configuration
```bash
# Optimize Redis for production
maxmemory 1gb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
save 60 10000
appendonly yes
appendfsync everysec
```

### Application Optimization
- **Clustering**: Multiple API server instances
- **Caching**: Redis caching for frequently accessed data
- **Compression**: Gzip compression for responses
- **CDN**: Static asset delivery via CDN

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow
The CI/CD pipeline includes:
- **Code Quality**: Linting, type checking, unit tests
- **Security**: Vulnerability scanning, dependency audit
- **Testing**: Integration tests, performance tests
- **Building**: Docker image creation and registry push
- **Deployment**: Automated deployment to staging/production
- **Monitoring**: Post-deployment health checks

### Pipeline Stages
1. **Test**: Unit tests, integration tests, security scans
2. **Build**: Docker image creation and registry push
3. **Deploy Staging**: Deploy to staging environment
4. **Performance Test**: Load testing and performance validation
5. **Deploy Production**: Deploy to production with health checks
6. **Monitor**: Post-deployment monitoring and alerting

### Manual Deployment
```bash
# Deploy to production
./scripts/deploy-production.js

# Or using deployment script
/usr/local/bin/lightdom-deploy.sh
```

## 💾 Backup and Recovery

### Database Backup
```bash
# Automated backup (runs daily at 2 AM)
pg_dump -h localhost -U lightdom_prod dom_space_harvester_prod > backup_$(date +%Y%m%d).sql
gzip backup_$(date +%Y%m%d).sql

# Restore from backup
gunzip backup_20240101.sql.gz
psql -h localhost -U lightdom_prod dom_space_harvester_prod < backup_20240101.sql
```

### File Backup
```bash
# Backup application files
tar -czf lightdom_files_$(date +%Y%m%d).tar.gz /app/logs /app/artifacts /app/config

# Restore files
tar -xzf lightdom_files_20240101.tar.gz -C /
```

### Disaster Recovery
1. **RTO**: Recovery Time Objective: 4 hours
2. **RPO**: Recovery Point Objective: 1 hour
3. **Backup Retention**: 30 days for database, 7 days for files
4. **Testing**: Monthly backup restoration tests

## 🔧 Maintenance and Updates

### Regular Maintenance Tasks
```bash
# Daily
- Check service health
- Monitor disk space
- Review error logs

# Weekly
- Update dependencies
- Review performance metrics
- Clean up old logs

# Monthly
- Security updates
- Backup restoration test
- Performance optimization review
```

### Update Process
```bash
# Update application
git pull origin main
npm ci --only=production
npm run build
npm run db:migrate
systemctl restart lightdom-api lightdom-enhanced

# Update system packages
sudo apt-get update
sudo apt-get upgrade
sudo systemctl restart lightdom-api lightdom-enhanced
```

### Monitoring Alerts
- **High Memory Usage**: >90% for 5 minutes
- **High CPU Usage**: >80% for 10 minutes
- **Service Down**: Any service unavailable
- **Database Connection**: Connection failures
- **Disk Space**: <10% free space
- **SSL Certificate**: Expires in 30 days

## 🚨 Troubleshooting

### Common Issues

#### Service Won't Start
```bash
# Check service status
systemctl status lightdom-api
journalctl -u lightdom-api -f

# Check logs
tail -f /app/logs/api.log
tail -f /app/logs/error.log

# Check dependencies
systemctl status postgresql
systemctl status redis
```

#### Database Connection Issues
```bash
# Check database status
sudo -u postgres psql -c "SELECT version();"
sudo -u postgres psql -c "\\l"

# Check connection
psql -h localhost -U lightdom_prod -d dom_space_harvester_prod -c "SELECT NOW();"

# Check database logs
tail -f /var/log/postgresql/postgresql-15-main.log
```

#### Performance Issues
```bash
# Check system resources
htop
df -h
free -h

# Check application metrics
curl http://localhost:9090/metrics

# Check database performance
sudo -u postgres psql -c "SELECT * FROM pg_stat_activity;"
```

#### SSL Certificate Issues
```bash
# Check certificate status
certbot certificates

# Renew certificate
sudo certbot renew

# Test SSL
openssl s_client -connect your-domain.com:443
```

### Emergency Procedures

#### Service Recovery
```bash
# Restart all services
systemctl restart lightdom-api lightdom-enhanced postgresql redis

# Check health
curl http://localhost:3001/api/health

# If still failing, check logs
journalctl -u lightdom-api --since "10 minutes ago"
```

#### Database Recovery
```bash
# Stop application
systemctl stop lightdom-api lightdom-enhanced

# Restore from backup
gunzip backup_20240101.sql.gz
psql -h localhost -U lightdom_prod dom_space_harvester_prod < backup_20240101.sql

# Start application
systemctl start lightdom-api lightdom-enhanced
```

#### Rollback Procedure
```bash
# Rollback to previous version
cp -r /app.backup.20240101 /app
systemctl restart lightdom-api lightdom-enhanced
```

## 📞 Support and Documentation

### Documentation
- **System Documentation**: `COMPLETE_SYSTEM_DOCUMENTATION.md`
- **Quick Start Guide**: `QUICK_START_GUIDE.md`
- **API Documentation**: Available at `/api/docs`
- **Monitoring Dashboard**: Available at `/monitoring`

### Support Channels
- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: Community support
- **Documentation**: Comprehensive guides and references
- **Monitoring**: Real-time system status

### Maintenance Schedule
- **Daily**: Health checks and log review
- **Weekly**: Performance monitoring and optimization
- **Monthly**: Security updates and backup testing
- **Quarterly**: Architecture review and capacity planning

---

## 🎯 Quick Reference

### Essential Commands
```bash
# Start services
systemctl start lightdom-api lightdom-enhanced

# Stop services
systemctl stop lightdom-api lightdom-enhanced

# Check status
systemctl status lightdom-api lightdom-enhanced

# View logs
journalctl -u lightdom-api -f

# Health check
curl http://localhost:3001/api/health

# Deploy update
/usr/local/bin/lightdom-deploy.sh

# Backup database
/usr/local/bin/lightdom-db-backup.sh
```

### Key URLs
- **Application**: `https://your-domain.com`
- **API**: `https://your-domain.com/api`
- **Monitoring**: `http://your-domain.com:9090`
- **Grafana**: `http://your-domain.com:3000`
- **Health Check**: `https://your-domain.com/api/health`

### Configuration Files
- **Environment**: `.env.production`
- **Database**: `/etc/postgresql/15/main/postgresql.conf`
- **Redis**: `/etc/redis/redis.conf`
- **Nginx**: `/etc/nginx/nginx.conf`
- **Systemd**: `/etc/systemd/system/lightdom-*.service`

---

*This deployment guide is continuously updated as the system evolves. For the latest information, check the GitHub repository.*
