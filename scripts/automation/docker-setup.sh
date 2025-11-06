#!/bin/bash

# LightDom Space-Bridge Platform Docker Setup Script
# This script sets up the complete Docker environment for the platform

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check Docker installation
check_docker() {
    print_status "Checking Docker installation..."
    
    if ! command_exists docker; then
        print_error "Docker is not installed. Please install Docker first."
        print_status "Visit: https://docs.docker.com/get-docker/"
        exit 1
    fi
    
    if ! command_exists docker-compose; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        print_status "Visit: https://docs.docker.com/compose/install/"
        exit 1
    fi
    
    print_success "Docker and Docker Compose are installed"
}

# Function to create necessary directories
create_directories() {
    print_status "Creating necessary directories..."
    
    mkdir -p logs
    mkdir -p artifacts
    mkdir -p temp
    mkdir -p ssl
    mkdir -p monitoring/grafana/dashboards
    mkdir -p monitoring/grafana/datasources
    
    print_success "Directories created"
}

# Function to generate SSL certificates (self-signed for development)
generate_ssl_certificates() {
    print_status "Generating SSL certificates..."
    
    if [ ! -f ssl/cert.pem ] || [ ! -f ssl/key.pem ]; then
        openssl req -x509 -newkey rsa:4096 -keyout ssl/key.pem -out ssl/cert.pem -days 365 -nodes -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"
        print_success "SSL certificates generated"
    else
        print_warning "SSL certificates already exist, skipping generation"
    fi
}

# Function to create environment file
create_env_file() {
    print_status "Creating environment file..."
    
    if [ ! -f .env ]; then
        cat > .env << EOF
# Database Configuration
DATABASE_URL=postgresql://lightdom_user:lightdom_password@postgres:5432/lightdom
DB_HOST=postgres
DB_PORT=5432
DB_NAME=lightdom
DB_USER=lightdom_user
DB_PASSWORD=lightdom_password

# Redis Configuration
REDIS_URL=redis://:lightdom_redis_password@redis:6379
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=lightdom_redis_password

# Application Configuration
NODE_ENV=production
PORT=3001
FRONTEND_PORT=3000

# Blockchain Configuration (Replace with your actual keys)
ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/your-infura-key
POLYGON_RPC_URL=https://polygon-mainnet.infura.io/v3/your-infura-key
ARBITRUM_RPC_URL=https://arbitrum-mainnet.infura.io/v3/your-infura-key
OPTIMISM_RPC_URL=https://optimism-mainnet.infura.io/v3/your-infura-key

# Security (CHANGE THESE IN PRODUCTION!)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
API_SECRET=your-api-secret-key-change-this-in-production

# WebSocket Configuration
WS_PORT=3001

# Puppeteer Configuration
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Logging
LOG_LEVEL=info
LOG_FILE=/app/logs/app.log
EOF
        print_success "Environment file created"
    else
        print_warning "Environment file already exists, skipping creation"
    fi
}

# Function to build Docker images
build_images() {
    print_status "Building Docker images..."
    
    # Build main application image
    docker-compose build app
    
    # Build worker image (same as app)
    docker-compose build worker
    
    print_success "Docker images built successfully"
}

# Function to start services
start_services() {
    print_status "Starting services..."
    
    # Start database and cache first
    docker-compose up -d postgres redis
    
    # Wait for database to be ready
    print_status "Waiting for database to be ready..."
    sleep 10
    
    # Start application services
    docker-compose up -d app worker nginx
    
    # Start monitoring services
    docker-compose up -d prometheus grafana
    
    print_success "All services started"
}

# Function to check service health
check_health() {
    print_status "Checking service health..."
    
    # Wait a bit for services to start
    sleep 15
    
    # Check if services are running
    if docker-compose ps | grep -q "Up"; then
        print_success "Services are running"
        
        # Display service URLs
        echo ""
        print_status "Service URLs:"
        echo "  Application: http://localhost:3000"
        echo "  API: http://localhost:3001"
        echo "  Grafana: http://localhost:3001 (admin/admin)"
        echo "  Prometheus: http://localhost:9090"
        echo ""
        
    else
        print_error "Some services failed to start"
        docker-compose ps
        exit 1
    fi
}

# Function to show logs
show_logs() {
    print_status "Showing application logs..."
    docker-compose logs -f app
}

# Function to stop services
stop_services() {
    print_status "Stopping services..."
    docker-compose down
    print_success "Services stopped"
}

# Function to clean up
cleanup() {
    print_status "Cleaning up..."
    docker-compose down -v
    docker system prune -f
    print_success "Cleanup completed"
}

# Function to show help
show_help() {
    echo "LightDom Space-Bridge Platform Docker Setup"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  setup     - Complete setup (check, create dirs, build, start)"
    echo "  start     - Start all services"
    echo "  stop      - Stop all services"
    echo "  restart   - Restart all services"
    echo "  logs      - Show application logs"
    echo "  health    - Check service health"
    echo "  cleanup   - Stop services and clean up volumes"
    echo "  help      - Show this help message"
    echo ""
}

# Main script logic
case "${1:-setup}" in
    setup)
        print_status "Starting LightDom Space-Bridge Platform setup..."
        check_docker
        create_directories
        generate_ssl_certificates
        create_env_file
        build_images
        start_services
        check_health
        print_success "Setup completed successfully!"
        echo ""
        print_status "Next steps:"
        echo "  1. Visit http://localhost:3000 to access the application"
        echo "  2. Check http://localhost:3001/api/health for API status"
        echo "  3. Access Grafana at http://localhost:3001 (admin/admin)"
        echo "  4. View Prometheus metrics at http://localhost:9090"
        ;;
    start)
        start_services
        check_health
        ;;
    stop)
        stop_services
        ;;
    restart)
        stop_services
        start_services
        check_health
        ;;
    logs)
        show_logs
        ;;
    health)
        check_health
        ;;
    cleanup)
        cleanup
        ;;
    help)
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        show_help
        exit 1
        ;;
esac