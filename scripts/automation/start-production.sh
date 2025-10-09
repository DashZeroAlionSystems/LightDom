#!/bin/bash

# LightDom Space-Bridge Platform Production Startup Script
# This script starts the complete production environment

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

# Function to check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check if Docker is running
    if ! docker info >/dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker first."
        exit 1
    fi
    
    # Check if docker-compose is available
    if ! command -v docker-compose >/dev/null 2>&1; then
        print_error "Docker Compose is not installed."
        exit 1
    fi
    
    # Check if .env file exists
    if [ ! -f .env ]; then
        print_warning ".env file not found. Creating from template..."
        cp .env.example .env 2>/dev/null || {
            print_error "No .env.example file found. Please create .env file manually."
            exit 1
        }
    fi
    
    print_success "Prerequisites check completed"
}

# Function to initialize database
init_database() {
    print_status "Initializing database..."
    
    # Start database first
    docker-compose up -d postgres
    
    # Wait for database to be ready
    print_status "Waiting for database to be ready..."
    sleep 15
    
    # Check if database is ready
    if docker-compose exec postgres pg_isready -U lightdom_user -d lightdom; then
        print_success "Database is ready"
    else
        print_error "Database failed to start"
        exit 1
    fi
}

# Function to start all services
start_all_services() {
    print_status "Starting all services..."
    
    # Start services in order
    docker-compose up -d postgres redis
    sleep 10
    
    docker-compose up -d app worker
    sleep 10
    
    docker-compose up -d nginx prometheus grafana
    
    print_success "All services started"
}

# Function to wait for services to be healthy
wait_for_services() {
    print_status "Waiting for services to be healthy..."
    
    # Wait for application to be ready
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f http://localhost:3001/api/health >/dev/null 2>&1; then
            print_success "Application is healthy"
            break
        fi
        
        print_status "Attempt $attempt/$max_attempts - Waiting for application..."
        sleep 10
        attempt=$((attempt + 1))
    done
    
    if [ $attempt -gt $max_attempts ]; then
        print_error "Application failed to become healthy"
        docker-compose logs app
        exit 1
    fi
}

# Function to check service status
check_service_status() {
    print_status "Checking service status..."
    
    echo ""
    echo "Service Status:"
    echo "==============="
    docker-compose ps
    
    echo ""
    echo "Service URLs:"
    echo "============="
    echo "  Application: http://localhost:3000"
    echo "  API: http://localhost:3001"
    echo "  Grafana: http://localhost:3001 (admin/admin)"
    echo "  Prometheus: http://localhost:9090"
    echo ""
}

# Function to show logs
show_logs() {
    print_status "Showing application logs..."
    docker-compose logs -f app
}

# Function to stop all services
stop_all_services() {
    print_status "Stopping all services..."
    docker-compose down
    print_success "All services stopped"
}

# Function to restart services
restart_services() {
    print_status "Restarting services..."
    docker-compose restart
    wait_for_services
    print_success "Services restarted"
}

# Function to show help
show_help() {
    echo "LightDom Space-Bridge Platform Production Startup"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  start     - Start all services (default)"
    echo "  stop      - Stop all services"
    echo "  restart   - Restart all services"
    echo "  status    - Show service status"
    echo "  logs      - Show application logs"
    echo "  health    - Check service health"
    echo "  help      - Show this help message"
    echo ""
}

# Main script logic
case "${1:-start}" in
    start)
        print_status "Starting LightDom Space-Bridge Platform..."
        check_prerequisites
        init_database
        start_all_services
        wait_for_services
        check_service_status
        print_success "Platform started successfully!"
        ;;
    stop)
        stop_all_services
        ;;
    restart)
        restart_services
        check_service_status
        ;;
    status)
        check_service_status
        ;;
    logs)
        show_logs
        ;;
    health)
        wait_for_services
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