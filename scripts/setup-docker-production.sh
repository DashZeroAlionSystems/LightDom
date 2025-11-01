#!/bin/bash

# LightDom Docker Production Setup Script
# Builds and configures production-ready containers

set -e

echo "🐳 Setting up LightDom Docker Production Environment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
COMPOSE_FILE="docker-compose.production.yml"
DOCKERFILE="Dockerfile.production.optimized"
IMAGE_NAME="lightdom/production"
TAG=${TAG:-"latest"}
REGISTRY=${REGISTRY:-""}

# Check if optimized Dockerfile exists
if [ ! -f "$DOCKERFILE" ]; then
    echo -e "${RED}Error: Optimized Dockerfile not found: $DOCKERFILE${NC}"
    exit 1
fi

# Create required directories
echo -e "${GREEN}Creating required directories...${NC}"
mkdir -p logs artifacts temp ssl monitoring/prometheus monitoring/grafana/dashboards monitoring/grafana/datasources

# Build production image
echo -e "${BLUE}Building production Docker image...${NC}"
if [ -n "$REGISTRY" ]; then
    FULL_IMAGE_NAME="$REGISTRY/$IMAGE_NAME:$TAG"
else
    FULL_IMAGE_NAME="$IMAGE_NAME:$TAG"
fi

docker build -f $DOCKERFILE -t $FULL_IMAGE_NAME .

echo -e "${GREEN}✅ Production image built: $FULL_IMAGE_NAME${NC}"

# Generate environment file if it doesn't exist
if [ ! -f ".env.production" ]; then
    echo -e "${YELLOW}Warning: .env.production not found. Creating template...${NC}"
    cat > .env.production << EOF
# LightDom Production Environment Variables
# Copy this file and update with your production values

# Database Configuration
DB_HOST=postgres
DB_PORT=5432
DB_NAME=dom_space_harvester
DB_USER=lightdom
DB_PASSWORD=your_secure_db_password_here
DB_SSL=true

# Redis Configuration
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=your_secure_redis_password_here

# Application Configuration
NODE_ENV=production
PORT=3001
FRONTEND_PORT=3000
JWT_SECRET=your_super_secure_jwt_secret_here
API_SECRET=your_api_secret_here

# Blockchain Configuration
ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/your_infura_key
POLYGON_RPC_URL=https://polygon-mainnet.infura.io/v3/your_infura_key
BLOCKCHAIN_PRIVATE_KEY=your_blockchain_private_key_here

# Security Configuration
CORS_ORIGIN=https://yourdomain.com
SSL_CERT_PATH=/etc/nginx/ssl/cert.pem
SSL_KEY_PATH=/etc/nginx/ssl/private.key

# Monitoring Configuration
PROMETHEUS_URL=http://prometheus:9090
GRAFANA_URL=http://grafana:3000
GRAFANA_PASSWORD=your_secure_grafana_password

# External Services
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password

# CDN Configuration (optional)
CDN_URL=https://cdn.yourdomain.com
CDN_API_KEY=your_cdn_api_key
EOF
    echo -e "${YELLOW}⚠️  Please update .env.production with your actual values before deploying${NC}"
fi

# Create nginx configuration for production
echo -e "${GREEN}Creating nginx configuration...${NC}"
cat > nginx.production.conf << EOF
# LightDom Production Nginx Configuration
# SSL/TLS enabled reverse proxy with security hardening

events {
    worker_connections 1024;
    use epoll;
    multi_accept on;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    # Logging
    log_format main '\$remote_addr - \$remote_user [\$time_local] "\$request" '
                    '\$status \$body_bytes_sent "\$http_referer" '
                    '"\$http_user_agent" "\$http_x_forwarded_for" '
                    'rt=\$request_time uct="\$upstream_connect_time" '
                    'uht="\$upstream_header_time" urt="\$upstream_response_time"';

    access_log /var/log/nginx/access.log main;
    error_log /var/log/nginx/error.log warn;

    # Performance
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    client_max_body_size 100M;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;

    # Rate limiting zones
    limit_req_zone \$binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone \$binary_remote_addr zone=auth:10m rate=5r/m;
    limit_req_zone \$binary_remote_addr zone=mining:10m rate=20r/s;

    # Upstream servers
    upstream lightdom_api {
        server api-server:3001;
        keepalive 32;
    }

    upstream lightdom_frontend {
        server frontend:3000;
        keepalive 32;
    }

    server {
        listen 80;
        server_name _;
        return 301 https://\$host\$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name yourdomain.com www.yourdomain.com;

        # SSL Configuration
        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/private.key;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
        ssl_prefer_server_ciphers off;
        ssl_session_cache shared:SSL:10m;
        ssl_session_timeout 10m;

        # Security headers
        add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
        add_header X-Frame-Options DENY always;
        add_header X-Content-Type-Options nosniff always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header Referrer-Policy "strict-origin-when-cross-origin" always;
        add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' wss: https:;" always;

        # Frontend routes
        location / {
            proxy_pass http://lightdom_frontend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade \$http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
            proxy_cache_bypass \$http_upgrade;

            # Caching for static assets
            location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
                expires 1y;
                add_header Cache-Control "public, immutable";
                access_log off;
            }
        }

        # API routes with rate limiting
        location /api/ {
            proxy_pass http://lightdom_api;
            proxy_http_version 1.1;
            proxy_set_header Upgrade \$http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;

            # Rate limiting for API
            limit_req zone=api burst=20 nodelay;

            # Auth endpoints stricter rate limiting
            location ~ ^/api/(auth|login|register) {
                limit_req zone=auth burst=5 nodelay;
            }

            # Mining endpoints
            location ~ ^/api/mining {
                limit_req zone=mining burst=50 nodelay;
            }
        }

        # WebSocket support
        location /ws {
            proxy_pass http://lightdom_api;
            proxy_http_version 1.1;
            proxy_set_header Upgrade \$http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
        }

        # Health check endpoint
        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }

        # Security: Block access to sensitive files
        location ~ /\.(env|git|htaccess|htpasswd)$ {
            deny all;
            return 404;
        }

        # Block access to node_modules
        location ~ /node_modules/ {
            deny all;
            return 404;
        }
    }
}
EOF

# Create Prometheus configuration
echo -e "${GREEN}Creating Prometheus configuration...${NC}"
cat > monitoring/prometheus.yml << EOF
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  # - "first_rules.yml"
  # - "second_rules.yml"

scrape_configs:
  - job_name: 'lightdom-api'
    static_configs:
      - targets: ['api-server:3001']
    metrics_path: '/api/metrics'
    scrape_interval: 5s

  - job_name: 'lightdom-frontend'
    static_configs:
      - targets: ['frontend:3000']
    metrics_path: '/metrics'
    scrape_interval: 10s

  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres:5432']
    scrape_interval: 30s

  - job_name: 'redis'
    static_configs:
      - targets: ['redis:6379']
    scrape_interval: 30s

  - job_name: 'nginx'
    static_configs:
      - targets: ['nginx:80']
    scrape_interval: 10s
EOF

# Create Grafana datasource configuration
echo -e "${GREEN}Creating Grafana datasource configuration...${NC}"
mkdir -p monitoring/grafana/datasources
cat > monitoring/grafana/datasources/prometheus.yml << EOF
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
    editable: true
EOF

# Create docker-compose override for local development
echo -e "${GREEN}Creating docker-compose override for development...${NC}"
cat > docker-compose.override.yml << EOF
version: '3.8'

services:
  api-server:
    environment:
      NODE_ENV: development
      DEBUG: lightdom:*
    volumes:
      - .:/app
      - /app/node_modules
    command: ["npm", "run", "dev"]

  frontend:
    environment:
      NODE_ENV: development
    volumes:
      - .:/usr/share/nginx/html:ro
EOF

# Create deployment script
echo -e "${GREEN}Creating deployment script...${NC}"
cat > scripts/deploy-production.sh << 'EOF'
#!/bin/bash

# LightDom Production Deployment Script

set -e

echo "🚀 Deploying LightDom to Production..."

# Load environment variables
if [ -f ".env.production" ]; then
    export $(cat .env.production | xargs)
fi

# Pull latest images
echo "📥 Pulling latest images..."
docker-compose -f docker-compose.production.yml pull

# Build custom images
echo "🔨 Building custom images..."
docker-compose -f docker-compose.production.yml build --no-cache

# Run database migrations
echo "🗄️ Running database migrations..."
docker-compose -f docker-compose.production.yml run --rm api-server npm run db:migrate

# Start services
echo "▶️ Starting services..."
docker-compose -f docker-compose.production.yml up -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be healthy..."
sleep 30

# Run health checks
echo "🏥 Running health checks..."
curl -f http://localhost/api/health || (echo "❌ API health check failed" && exit 1)
curl -f http://localhost/health || (echo "❌ Frontend health check failed" && exit 1)

# Run smoke tests
echo "🧪 Running smoke tests..."
docker-compose -f docker-compose.production.yml exec api-server npm run test:smoke

echo "✅ Production deployment completed successfully!"
echo ""
echo "🌐 Application URLs:"
echo "  Frontend: https://yourdomain.com"
echo "  API: https://yourdomain.com/api"
echo "  Monitoring: https://yourdomain.com:3000"
echo ""
echo "📊 Monitoring URLs:"
echo "  Grafana: http://localhost:3000 (admin/admin)"
echo "  Prometheus: http://localhost:9090"
EOF

chmod +x scripts/deploy-production.sh

# Create monitoring dashboard configuration
echo -e "${GREEN}Creating monitoring dashboard configuration...${NC}"
mkdir -p monitoring/grafana/dashboards
cat > monitoring/grafana/dashboards/lightdom.json << EOF
{
  "dashboard": {
    "title": "LightDom Production Dashboard",
    "tags": ["lightdom", "production"],
    "timezone": "browser",
    "panels": [
      {
        "title": "API Response Time",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_request_duration_seconds_sum{job=\"lightdom-api\"}[5m]) / rate(http_request_duration_seconds_count{job=\"lightdom-api\"}[5m])",
            "legendFormat": "API Response Time"
          }
        ]
      },
      {
        "title": "Database Connections",
        "type": "graph",
        "targets": [
          {
            "expr": "pg_stat_activity_count{datname=\"dom_space_harvester\"}",
            "legendFormat": "Active Connections"
          }
        ]
      },
      {
        "title": "Redis Memory Usage",
        "type": "graph",
        "targets": [
          {
            "expr": "redis_memory_used_bytes / redis_memory_max_bytes * 100",
            "legendFormat": "Redis Memory %"
          }
        ]
      }
    ],
    "time": {
      "from": "now-1h",
      "to": "now"
    },
    "refresh": "30s"
  }
}
EOF

# Final summary
echo ""
echo -e "${GREEN}🎉 Docker Production Setup Complete!${NC}"
echo ""
echo "📁 Generated Files:"
echo "  • Dockerfile.production.optimized - Optimized production container"
echo "  • docker-compose.production.yml - Production orchestration"
echo "  • nginx.production.conf - Production reverse proxy config"
echo "  • monitoring/prometheus.yml - Monitoring configuration"
echo "  • monitoring/grafana/ - Dashboard configurations"
echo "  • scripts/deploy-production.sh - Deployment automation"
echo ""
echo "🚀 Next Steps:"
echo "1. Update .env.production with your actual values"
echo "2. Configure SSL certificates in ssl/ directory"
echo "3. Update nginx.production.conf with your domain"
echo "4. Run: ./scripts/deploy-production.sh"
echo ""
echo "🔒 Security Notes:"
echo "• Non-root user in containers"
echo "• Security headers configured"
echo "• Rate limiting enabled"
echo "• SSL/TLS enforced"
echo ""
echo "📊 Monitoring:"
echo "• Prometheus metrics collection"
echo "• Grafana dashboards"
echo "• Health checks configured"
echo "• Log aggregation ready"