#!/bin/bash

# LightDom Production Security Setup Script
# This script sets up SSL certificates, security configurations, and hardening

set -e

echo "🔒 Setting up LightDom Production Security..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
DOMAIN=${DOMAIN:-"app.lightdom.com"}
EMAIL=${EMAIL:-"security@lightdom.com"}
SSL_DIR="/etc/nginx/ssl"
BACKUP_DIR="/opt/lightdom/backups/security"

# Create directories
echo -e "${GREEN}Creating security directories...${NC}"
sudo mkdir -p $SSL_DIR
sudo mkdir -p $BACKUP_DIR
sudo mkdir -p /var/log/lightdom/security

# Set proper permissions
sudo chown -R www-data:www-data $SSL_DIR
sudo chmod -R 700 $SSL_DIR

# Install Certbot if not present
if ! command -v certbot &> /dev/null; then
    echo -e "${YELLOW}Installing Certbot for SSL certificates...${NC}"
    sudo apt-get update
    sudo apt-get install -y certbot python3-certbot-nginx
fi

# Obtain SSL certificate
echo -e "${GREEN}Obtaining SSL certificate for $DOMAIN...${NC}"
sudo certbot certonly --nginx -d $DOMAIN -d www.$DOMAIN --email $EMAIL --agree-tos --non-interactive

# Create SSL configuration
echo -e "${GREEN}Creating SSL configuration...${NC}"
sudo tee $SSL_DIR/ssl-params.conf > /dev/null <<EOF
# SSL Configuration
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384;
ssl_prefer_server_ciphers off;
ssl_session_cache shared:SSL:10m;
ssl_session_timeout 10m;
ssl_session_tickets off;

# OCSP Stapling
ssl_stapling on;
ssl_stapling_verify on;
resolver 8.8.8.8 8.8.4.4 valid=300s;
resolver_timeout 5s;

# HSTS
add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
EOF

# Create Diffie-Hellman parameters
echo -e "${GREEN}Generating Diffie-Hellman parameters...${NC}"
sudo openssl dhparam -out $SSL_DIR/dhparam.pem 2048

# Set up firewall
echo -e "${GREEN}Configuring firewall...${NC}"
sudo ufw --force enable
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw --force reload

# Install fail2ban for intrusion prevention
echo -e "${GREEN}Installing fail2ban...${NC}"
sudo apt-get install -y fail2ban

# Configure fail2ban for nginx
sudo tee /etc/fail2ban/jail.d/nginx.conf > /dev/null <<EOF
[nginx-http-auth]
enabled = true

[nginx-noscript]
enabled = true

[nginx-badbots]
enabled = true

[nginx-noproxy]
enabled = true

[nginx-botsearch]
enabled = true
EOF

sudo systemctl enable fail2ban
sudo systemctl restart fail2ban

# Set up log rotation for security logs
echo -e "${GREEN}Configuring log rotation...${NC}"
sudo tee /etc/logrotate.d/lightdom-security > /dev/null <<EOF
/var/log/lightdom/security/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    postrotate
        systemctl reload nginx
    endscript
}
EOF

# Create security monitoring script
echo -e "${GREEN}Creating security monitoring script...${NC}"
sudo tee /opt/lightdom/bin/security-monitor.sh > /dev/null <<EOF
#!/bin/bash

# LightDom Security Monitor
# Run this script periodically to check security status

echo "🔍 LightDom Security Check - $(date)"

# Check SSL certificate expiry
echo "SSL Certificate Status:"
openssl x509 -in /etc/letsencrypt/live/$DOMAIN/fullchain.pem -text -noout | grep -E "(Not Before|Not After)"

# Check firewall status
echo "Firewall Status:"
sudo ufw status | head -10

# Check fail2ban status
echo "Fail2ban Status:"
sudo fail2ban-client status

# Check for suspicious processes
echo "Suspicious Processes:"
ps aux | grep -E "(miner|hack|exploit|scan)" | grep -v grep || echo "None found"

# Check disk usage
echo "Disk Usage:"
df -h | grep -E "^/dev/"

# Check memory usage
echo "Memory Usage:"
free -h

echo "Security check completed at $(date)"
EOF

sudo chmod +x /opt/lightdom/bin/security-monitor.sh

# Set up cron job for security monitoring
echo -e "${GREEN}Setting up automated security monitoring...${NC}"
sudo tee /etc/cron.d/lightdom-security > /dev/null <<EOF
# LightDom Security Monitoring
# Run security checks daily at 2 AM
0 2 * * * www-data /opt/lightdom/bin/security-monitor.sh >> /var/log/lightdom/security/daily-check.log 2>&1

# Run SSL certificate check weekly
0 3 * * 0 www-data certbot renew >> /var/log/lightdom/security/ssl-renewal.log 2>&1
EOF

# Create backup script for security configurations
echo -e "${GREEN}Creating security backup script...${NC}"
sudo tee /opt/lightdom/bin/backup-security.sh > /dev/null <<EOF
#!/bin/bash

# LightDom Security Configuration Backup
BACKUP_DATE=\$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="\$BACKUP_DIR/security_backup_\$BACKUP_DATE.tar.gz"

echo "Backing up security configurations..."

# Create backup
sudo tar -czf \$BACKUP_FILE \
    /etc/nginx/ssl/ \
    /etc/fail2ban/ \
    /etc/ufw/ \
    /etc/letsencrypt/ \
    /opt/lightdom/bin/ \
    --exclude='*.key' \
    --exclude='*privkey*'

echo "Security backup completed: \$BACKUP_FILE"

# Clean old backups (keep last 7)
sudo find \$BACKUP_DIR -name "security_backup_*.tar.gz" -mtime +7 -delete
EOF

sudo chmod +x /opt/lightdom/bin/backup-security.sh

# Set up automated backups
echo "0 4 * * * www-data /opt/lightdom/bin/backup-security.sh" | sudo tee -a /etc/cron.d/lightdom-security > /dev/null

# Final security checklist
echo -e "${GREEN}Security Setup Complete!${NC}"
echo ""
echo "🔒 Security Checklist:"
echo "✅ SSL certificates installed and configured"
echo "✅ Firewall enabled with proper rules"
echo "✅ Fail2ban intrusion prevention installed"
echo "✅ Security headers configured in nginx"
echo "✅ Log rotation configured"
echo "✅ Automated security monitoring set up"
echo "✅ Security configuration backups enabled"
echo ""
echo "📋 Next Steps:"
echo "1. Test SSL certificate: https://$DOMAIN"
echo "2. Verify security headers: curl -I https://$DOMAIN"
echo "3. Check firewall: sudo ufw status"
echo "4. Monitor logs: tail -f /var/log/lightdom/security/*.log"
echo ""
echo "🔑 Important: Keep SSL certificates renewed automatically"
echo "🔑 Monitor security logs regularly"
echo "🔑 Update system packages regularly: sudo apt-get update && sudo apt-get upgrade"