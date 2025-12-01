#!/bin/bash

# LightDom Complete System Startup Script with n8n Integration
# Starts all services including n8n, Ollama, API server, frontend, and Electron

set -e

echo "🚀 Starting LightDom Complete System with n8n (Linux/Mac)..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Function to check if a port is in use
check_port() {
  local port=$1
  if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    return 0
  else
    return 1
  fi
}

# Function to wait for HTTP endpoint
wait_for_http() {
  local name=$1
  local url=$2
  local max_attempts=${3:-20}
  local attempt=1
  
  print_info "Waiting for $name ($url)..."
  
  while [ $attempt -le $max_attempts ]; do
    if curl -s -f -o /dev/null "$url" 2>/dev/null; then
      print_status "$name is reachable"
      return 0
    fi
    echo "⏳ Attempt $attempt/$max_attempts failed. Retrying in 3 seconds..."
    sleep 3
    attempt=$((attempt + 1))
  done
  
  print_error "$name did not respond after $max_attempts attempts"
  return 1
}

# Function to kill processes on a port
kill_port() {
  local port=$1
  if check_port $port; then
    print_info "Killing process on port $port..."
    lsof -ti:$port | xargs kill -9 2>/dev/null || true
  fi
}

# Cleanup existing processes
print_info "Cleaning up existing processes..."
kill_port 3001 # API Server
kill_port 3000 # Frontend
kill_port 11434 # Ollama
kill_port 5678 # n8n
kill_port 8090 # MCP Server
pkill -f "node.*simple-api-server" || true
pkill -f "electron" || true
pkill -f "ollama serve" || true

sleep 2

# Start Docker Compose for n8n and supporting services
print_info "Starting Docker Compose services (n8n, PostgreSQL, Redis)..."

if command -v docker-compose &> /dev/null || command -v docker &> /dev/null; then
  # Check if docker-compose.dev.yml exists
  if [ -f "docker-compose.dev.yml" ]; then
    # Add n8n service if not already in docker-compose
    if ! grep -q "n8n:" docker-compose.dev.yml; then
      print_info "Adding n8n service to docker-compose.dev.yml..."
      
      cat >> docker-compose.dev.yml << 'EOF'

  n8n:
    image: n8nio/n8n:latest
    container_name: lightdom-n8n
    restart: unless-stopped
    ports:
      - '5678:5678'
    environment:
      - N8N_BASIC_AUTH_ACTIVE=false
      - N8N_HOST=localhost
      - N8N_PORT=5678
      - N8N_PROTOCOL=http
      - NODE_ENV=development
      - WEBHOOK_URL=http://localhost:5678/
      - GENERIC_TIMEZONE=UTC
      - DB_TYPE=postgresdb
      - DB_POSTGRESDB_HOST=postgres-dev
      - DB_POSTGRESDB_PORT=5432
      - DB_POSTGRESDB_DATABASE=lightdom_dev
      - DB_POSTGRESDB_USER=lightdom_user
      - DB_POSTGRESDB_PASSWORD=lightdom_password
    volumes:
      - n8n_data:/home/node/.n8n
      - ./n8n-workflows:/home/node/.n8n/workflows
    depends_on:
      - postgres-dev
      - redis

volumes:
  n8n_data:
    driver: local
EOF
      print_status "n8n service added to docker-compose.dev.yml"
    fi
    
    # Start docker compose
    if command -v docker-compose &> /dev/null; then
      docker-compose -f docker-compose.dev.yml up -d
    else
      docker compose -f docker-compose.dev.yml up -d
    fi
    
    print_status "Docker Compose services starting..."
    
    # Wait for n8n to be ready
    if ! wait_for_http "n8n" "http://localhost:5678" 60; then
      print_error "n8n failed to start"
      print_info "Check logs with: docker logs lightdom-n8n"
    else
      print_status "n8n is running at http://localhost:5678"
    fi
  else
    print_warning "docker-compose.dev.yml not found, starting n8n manually..."
    
    # Start n8n with Docker
    docker run -d \
      --name lightdom-n8n \
      -p 5678:5678 \
      -e N8N_BASIC_AUTH_ACTIVE=false \
      -e N8N_HOST=localhost \
      -e N8N_PORT=5678 \
      -e N8N_PROTOCOL=http \
      -v n8n_data:/home/node/.n8n \
      n8nio/n8n:latest
    
    print_status "n8n container started"
    
    if ! wait_for_http "n8n" "http://localhost:5678" 60; then
      print_error "n8n failed to start"
    fi
  fi
else
  print_warning "Docker not found. n8n will not be started."
  print_info "Install Docker from https://docs.docker.com/get-docker/"
  print_info "Continuing with other services..."
fi

# Check if Ollama is installed
if command -v ollama &> /dev/null; then
  print_info "Starting Ollama serve daemon..."
  
  # Start Ollama in the background
  nohup ollama serve > /tmp/ollama.log 2>&1 &
  OLLAMA_PID=$!
  print_status "Ollama service starting (PID: $OLLAMA_PID)..."
  
  sleep 3
  
  # Pull models for 4GB systems
  print_info "Ensuring models are available for 4GB systems..."
  
  # Small models suitable for 4GB RAM
  ollama pull phi:latest > /dev/null 2>&1 || print_warning "Could not pull phi model"
  ollama pull deepseek-r1:1.5b > /dev/null 2>&1 || print_warning "Could not pull deepseek-r1:1.5b model"
  
  print_status "Models ready for 4GB systems"
else
  print_warning "Ollama not found. Install from https://ollama.com"
  print_info "Continuing without Ollama integration..."
fi

# Start API Server
print_info "Starting API Server..."
nohup node simple-api-server.js > /tmp/api-server.log 2>&1 &
API_PID=$!
print_status "API Server starting (PID: $API_PID)..."

# Wait for API to start
if ! wait_for_http "API Server" "http://localhost:3001/api/health" 30; then
  print_error "Failed to start API Server. Check /tmp/api-server.log for details"
  exit 1
fi

# Apply database schemas
print_info "Applying database schemas..."
if command -v psql &> /dev/null; then
  # Try to apply schemas if PostgreSQL client is available
  export PGPASSWORD=lightdom_password
  psql -h localhost -p 5433 -U lightdom_user -d lightdom_dev -f database/migrations/crawler-campaign-tables.sql 2>/dev/null || print_warning "Could not apply database schema (PostgreSQL may not be ready yet)"
else
  print_warning "psql not found. Skipping database schema application."
fi

# Start Frontend
print_info "Starting Frontend..."
nohup npm run dev > /tmp/frontend.log 2>&1 &
FRONTEND_PID=$!
print_status "Frontend starting (PID: $FRONTEND_PID)..."

# Wait for frontend
if ! wait_for_http "Frontend" "http://localhost:3000" 60; then
  print_warning "Frontend may not have started. Check /tmp/frontend.log for details"
fi

# Summary
echo ""
print_status "========================================="
print_status "🎉 LightDom System Started Successfully!"
print_status "========================================="
echo ""
print_info "Services running:"
echo "  📡 API Server:    http://localhost:3001"
echo "  🖥️  Frontend:     http://localhost:3000"
echo "  🔧 n8n:           http://localhost:5678"
echo "  🦙 Ollama:        http://localhost:11434"
echo ""
print_info "Logs:"
echo "  API Server:  /tmp/api-server.log"
echo "  Frontend:    /tmp/frontend.log"
echo "  Ollama:      /tmp/ollama.log"
echo "  n8n:         docker logs lightdom-n8n"
echo ""
print_info "Process IDs:"
echo "  API Server: $API_PID"
echo "  Frontend:   $FRONTEND_PID"
[ -n "$OLLAMA_PID" ] && echo "  Ollama:     $OLLAMA_PID"
echo ""
print_info "To stop all services:"
echo "  ./stop-all-services.sh"
echo ""
print_info "To view n8n workflows:"
echo "  curl http://localhost:5678/api/v1/workflows"
echo ""
print_status "Ready for development! ��"

