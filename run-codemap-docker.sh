#!/bin/bash

# Memory Workflow CodeMap - Docker Run Script
# Automated container setup and management

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install Docker first."
        echo "Visit: https://docs.docker.com/get-docker/"
        exit 1
    fi

    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not installed. Please install Docker Compose."
        echo "Visit: https://docs.docker.com/compose/install/"
        exit 1
    fi

    log_success "Docker and Docker Compose are installed"
}

# Check if Ollama model is available locally (for non-containerized Ollama)
check_ollama_model() {
    if command -v ollama &> /dev/null; then
        if ollama list | grep -q "llama2:7b"; then
            log_success "Ollama model llama2:7b is available locally"
            return 0
        else
            log_warning "Ollama model llama2:7b not found locally. It will be downloaded in the container."
        fi
    fi
    return 1
}

# Create necessary directories
setup_directories() {
    log_info "Setting up directories..."

    mkdir -p memory-store logs

    # Set proper permissions
    if [[ "$OSTYPE" != "darwin"* ]]; then
        sudo chown -R 1001:1001 memory-store logs 2>/dev/null || true
    fi

    log_success "Directories created"
}

# Build the containers
build_containers() {
    log_info "Building Docker containers..."

    if ! docker-compose -f docker-compose-codemap.yml build; then
        log_error "Failed to build containers"
        exit 1
    fi

    log_success "Containers built successfully"
}

# Start the services
start_services() {
    log_info "Starting Memory Workflow CodeMap services..."

    if ! docker-compose -f docker-compose-codemap.yml up -d; then
        log_error "Failed to start services"
        exit 1
    fi

    log_success "Services started successfully"
    log_info "Waiting for services to be ready..."
}

# Wait for services to be healthy
wait_for_services() {
    local max_attempts=30
    local attempt=1

    log_info "Checking service health..."

    while [ $attempt -le $max_attempts ]; do
        if docker-compose -f docker-compose-codemap.yml ps | grep -q "healthy"; then
            log_success "All services are healthy!"
            return 0
        fi

        echo -n "."
        sleep 5
        ((attempt++))
    done

    log_warning "Services are still starting. This may take a few more minutes."
    log_info "You can check status with: docker-compose -f docker-compose-codemap.yml ps"
    return 1
}

# Show service status
show_status() {
    log_info "Service Status:"
    echo ""
    docker-compose -f docker-compose-codemap.yml ps
    echo ""
    log_info "Service Logs:"
    echo "  • CodeMap App: docker-compose -f docker-compose-codemap.yml logs codemap"
    echo "  • Ollama: docker-compose -f docker-compose-codemap.yml logs ollama"
    echo "  • All: docker-compose -f docker-compose-codemap.yml logs"
}

# Open browser
open_browser() {
    log_info "Opening browser to http://localhost:3002"

    case "$(uname -s)" in
        Darwin)
            open http://localhost:3002
            ;;
        Linux)
            if command -v xdg-open &> /dev/null; then
                xdg-open http://localhost:3002
            fi
            ;;
        CYGWIN*|MINGW32*|MSYS*|MINGW*)
            start http://localhost:3002
            ;;
    esac
}

# Main functions
start_system() {
    log_info "🚀 Starting Memory Workflow CodeMap in Docker containers"
    echo ""

    check_docker
    check_ollama_model
    setup_directories
    build_containers
    start_services

    if wait_for_services; then
        echo ""
        log_success "🎉 Memory Workflow CodeMap is running!"
        echo ""
        log_info "🌐 Access the interactive CodeMap at: http://localhost:3002"
        echo ""
        show_status
        echo ""
        log_info "💡 Useful commands:"
        echo "  • View logs: docker-compose -f docker-compose-codemap.yml logs -f"
        echo "  • Stop system: docker-compose -f docker-compose-codemap.yml down"
        echo "  • Restart: docker-compose -f docker-compose-codemap.yml restart"
        echo ""
        open_browser
    fi
}

stop_system() {
    log_info "🛑 Stopping Memory Workflow CodeMap"

    if docker-compose -f docker-compose-codemap.yml down; then
        log_success "Services stopped successfully"
    else
        log_error "Failed to stop services"
    fi
}

restart_system() {
    log_info "🔄 Restarting Memory Workflow CodeMap"

    if docker-compose -f docker-compose-codemap.yml restart; then
        log_success "Services restarted successfully"
        wait_for_services
    else
        log_error "Failed to restart services"
    fi
}

show_help() {
    echo "Memory Workflow CodeMap - Docker Management Script"
    echo ""
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  start     Start the complete CodeMap system"
    echo "  stop      Stop all CodeMap services"
    echo "  restart   Restart all CodeMap services"
    echo "  status    Show current service status"
    echo "  logs      Show service logs"
    echo "  build     Rebuild the containers"
    echo "  clean     Remove containers and volumes"
    echo "  help      Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 start          # Start the complete system"
    echo "  $0 logs codemap   # Show CodeMap app logs"
    echo "  $0 stop           # Stop all services"
    echo ""
}

# Main script logic
case "${1:-start}" in
    start)
        start_system
        ;;
    stop)
        stop_system
        ;;
    restart)
        restart_system
        ;;
    status)
        show_status
        ;;
    logs)
        if [ -n "$2" ]; then
            docker-compose -f docker-compose-codemap.yml logs "$2"
        else
            docker-compose -f docker-compose-codemap.yml logs
        fi
        ;;
    build)
        build_containers
        ;;
    clean)
        log_warning "This will remove all containers and volumes. Are you sure? (y/N)"
        read -r response
        if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
            docker-compose -f docker-compose-codemap.yml down -v --rmi all
            log_success "System cleaned"
        fi
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        log_error "Unknown command: $1"
        echo ""
        show_help
        exit 1
        ;;
esac
