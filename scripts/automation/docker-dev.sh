#!/bin/bash

# LightDom Space-Bridge Platform Docker Development Setup Script
# This script sets up the development environment with hot reloading

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

# Function to create development environment file
create_dev_env() {
    print_status "Creating development environment file..."
    
    if [ ! -f .env.dev ]; then
        cat > .env.dev << EOF
# Database Configuration (Development)
DATABASE_URL=postgresql://lightdom_user:lightdom_password@postgres-dev:5432/lightdom_dev
DB_HOST=postgres-dev
DB_PORT=5432
DB_NAME=lightdom_dev
DB_USER=lightdom_user
DB_PASSWORD=lightdom_password

# Redis Configuration (Development)
REDIS_URL=redis://redis-dev:6379
REDIS_HOST=redis-dev
REDIS_PORT=6379

# Application Configuration
NODE_ENV=development
PORT=3001
FRONTEND_PORT=3000

# Development Settings
DEBUG=true
LOG_LEVEL=debug

# Blockchain Configuration (Testnet)
ETHEREUM_RPC_URL=https://goerli.infura.io/v3/your-infura-key
POLYGON_RPC_URL=https://polygon-mumbai.infura.io/v3/your-infura-key

# Security (Development keys)
JWT_SECRET=dev-jwt-secret-key
API_SECRET=dev-api-secret-key

# Puppeteer Configuration
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
EOF
        print_success "Development environment file created"
    else
        print_warning "Development environment file already exists"
    fi
}

# Function to start development services
start_dev_services() {
    print_status "Starting development services..."
    
    # Start database and cache first
    docker-compose -f docker-compose.dev.yml up -d postgres-dev redis-dev
    
    # Wait for database to be ready
    print_status "Waiting for database to be ready..."
    sleep 10
    
    # Start development application
    docker-compose -f docker-compose.dev.yml up -d app-dev
    
    print_success "Development services started"
}

# Function to check development service health
check_dev_health() {
    print_status "Checking development service health..."
    
    # Wait a bit for services to start
    sleep 15
    
    # Check if services are running
    if docker-compose -f docker-compose.dev.yml ps | grep -q "Up"; then
        print_success "Development services are running"
        
        # Display service URLs
        echo ""
        print_status "Development Service URLs:"
        echo "  Application: http://localhost:3000"
        echo "  API: http://localhost:3001"
        echo "  Database: localhost:5433"
        echo "  Redis: localhost:6380"
        echo ""
        
    else
        print_error "Some development services failed to start"
        docker-compose -f docker-compose.dev.yml ps
        exit 1
    fi
}

# Function to show development logs
show_dev_logs() {
    print_status "Showing development application logs..."
    docker-compose -f docker-compose.dev.yml logs -f app-dev
}

# Function to stop development services
stop_dev_services() {
    print_status "Stopping development services..."
    docker-compose -f docker-compose.dev.yml down
    print_success "Development services stopped"
}

# Function to clean up development environment
cleanup_dev() {
    print_status "Cleaning up development environment..."
    docker-compose -f docker-compose.dev.yml down -v
    docker system prune -f
    print_success "Development cleanup completed"
}

# Function to rebuild development image
rebuild_dev() {
    print_status "Rebuilding development image..."
    docker-compose -f docker-compose.dev.yml build app-dev
    print_success "Development image rebuilt"
}

# Function to show help
show_help() {
    echo "LightDom Space-Bridge Platform Docker Development Setup"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  setup     - Complete development setup"
    echo "  start     - Start development services"
    echo "  stop      - Stop development services"
    echo "  restart   - Restart development services"
    echo "  rebuild   - Rebuild development image"
    echo "  logs      - Show development logs"
    echo "  health    - Check development service health"
    echo "  cleanup   - Stop services and clean up volumes"
    echo "  help      - Show this help message"
    echo ""
}

# Main script logic
case "${1:-setup}" in
    setup)
        print_status "Starting LightDom Space-Bridge Platform development setup..."
        create_dev_env
        start_dev_services
        check_dev_health
        print_success "Development setup completed successfully!"
        echo ""
        print_status "Development features:"
        echo "  - Hot reloading enabled"
        echo "  - Debug logging enabled"
        echo "  - Testnet blockchain connections"
        echo "  - Separate development database"
        echo ""
        print_status "Next steps:"
        echo "  1. Visit http://localhost:3000 to access the application"
        echo "  2. Check http://localhost:3001/api/health for API status"
        echo "  3. Use 'docker-compose -f docker-compose.dev.yml logs -f app-dev' to view logs"
        ;;
    start)
        start_dev_services
        check_dev_health
        ;;
    stop)
        stop_dev_services
        ;;
    restart)
        stop_dev_services
        start_dev_services
        check_dev_health
        ;;
    rebuild)
        rebuild_dev
        ;;
    logs)
        show_dev_logs
        ;;
    health)
        check_dev_health
        ;;
    cleanup)
        cleanup_dev
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