#!/bin/bash

# LightDom Complete System Startup Script (Linux/Mac)
# Starts all services including Ollama, API server, frontend, and Electron

set -e

echo "🚀 Starting LightDom Complete System (Linux/Mac)..."

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
  
  echo "🔍 Waiting for $name ($url)..."
  
  while [ $attempt -le $max_attempts ]; do
    if curl -s -f -o /dev/null "$url" 2>/dev/null; then
      echo "✅ $name is reachable"
      return 0
    fi
    echo "⏳ Attempt $attempt/$max_attempts failed. Retrying in 2 seconds..."
    sleep 2
    attempt=$((attempt + 1))
  done
  
  echo "❌ $name did not respond after $max_attempts attempts"
  return 1
}

# Function to kill processes on a port
kill_port() {
  local port=$1
  if check_port $port; then
    echo "🧹 Killing process on port $port..."
    lsof -ti:$port | xargs kill -9 2>/dev/null || true
  fi
}

# Cleanup existing processes
echo "🧹 Cleaning up existing processes..."
kill_port 3001 # API Server
kill_port 3000 # Frontend
kill_port 11434 # Ollama
kill_port 5678 # n8n
kill_port 8090 # MCP Server
pkill -f "node.*simple-api-server" || true
pkill -f "electron" || true
pkill -f "ollama serve" || true

sleep 2

# Check if Ollama is installed
if command -v ollama &> /dev/null; then
  echo "🦾 Starting Ollama serve daemon..."
  
  # Start Ollama in the background
  nohup ollama serve > /tmp/ollama.log 2>&1 &
  OLLAMA_PID=$!
  echo "✅ Ollama service starting (PID: $OLLAMA_PID)..."
  
  sleep 3
  
  # Pull deepseek model if not present
  echo "📥 Ensuring deepseek-r1:latest model is available..."
  if ollama pull deepseek-r1:latest > /dev/null 2>&1; then
    echo "✅ DeepSeek model ready"
  else
    echo "⚠️  Could not pull DeepSeek model automatically. Pull manually with: ollama pull deepseek-r1:latest"
  fi
else
  echo "⚠️  Ollama not found. Install from https://ollama.com"
  echo "   Continuing without Ollama integration..."
fi

# Start API Server
echo "📡 Starting API Server..."
nohup node simple-api-server.js > /tmp/api-server.log 2>&1 &
API_PID=$!
echo "✅ API Server starting (PID: $API_PID)..."

# Wait for API to start
if ! wait_for_http "API Server" "http://localhost:3001/api/health" 30; then
  echo "❌ Failed to start API Server. Check /tmp/api-server.log for details"
  exit 1
fi

# Apply database schemas
echo "🗄️  Applying database schemas..."
if curl -s -X POST http://localhost:3001/api/db/apply-schemas > /dev/null 2>&1; then
  echo "✅ Database schemas applied (idempotent)"
else
  echo "⚠️  Unable to apply database schemas automatically. Check API logs for details"
fi

# Check Ollama health if it was started
if command -v ollama &> /dev/null; then
  if wait_for_http "Ollama" "http://localhost:11434/api/tags" 10; then
    echo "✅ Ollama service is ready"
  else
    echo "⚠️  Ollama may not be fully ready yet"
  fi
fi

# Start n8n (via docker-compose)
echo "🔄 Starting n8n Workflow Engine..."
if command -v docker-compose &> /dev/null || command -v docker &> /dev/null; then
  docker-compose up -d n8n > /tmp/n8n.log 2>&1 || docker compose up -d n8n > /tmp/n8n.log 2>&1
  echo "✅ n8n starting (Docker)..."
  
  # Wait for n8n to be ready
  if wait_for_http "n8n" "http://localhost:5678/healthz" 30; then
    echo "✅ n8n is ready"
  else
    echo "⚠️  n8n may not be fully ready yet"
  fi
else
  echo "⚠️  Docker not found. Skipping n8n startup."
fi

# Start MCP Server for n8n
echo "🔗 Starting MCP Server..."
nohup node services/n8n-mcp-server-start.js > /tmp/mcp-server.log 2>&1 &
MCP_PID=$!
echo "✅ MCP Server starting (PID: $MCP_PID)..."

# Start Frontend
echo "🌐 Starting Frontend..."
nohup npm run dev > /tmp/frontend.log 2>&1 &
FRONTEND_PID=$!
echo "✅ Frontend starting (PID: $FRONTEND_PID)..."

# Wait for frontend to start
sleep 5

# Start Electron
echo "🖥️  Starting Electron..."

# Check if electron is available
if command -v electron &> /dev/null; then
  ELECTRON_CMD="electron"
elif [ -f "node_modules/.bin/electron" ]; then
  ELECTRON_CMD="npx electron"
else
  echo "⚠️  Electron not found. Installing locally..."
  npm install electron --no-save
  ELECTRON_CMD="npx electron"
fi

NODE_ENV=development nohup $ELECTRON_CMD . --dev > /tmp/electron.log 2>&1 &
ELECTRON_PID=$!
echo "✅ Electron starting (PID: $ELECTRON_PID)..."

echo ""
echo "✅ All services started!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🌐 Frontend: http://localhost:3000"
echo "🔌 API: http://localhost:3001"
echo "🦾 Ollama: http://localhost:11434 (if installed)"
echo "🔄 n8n: http://localhost:5678 (admin/lightdom_n8n_password)"
echo "🔗 MCP Server: http://localhost:8090/mcp"
echo "🖥️  Electron: Desktop app should open"
echo ""
echo "📋 Process IDs:"
echo "   API Server: $API_PID"
echo "   Frontend: $FRONTEND_PID"
echo "   Electron: $ELECTRON_PID"
echo "   MCP Server: $MCP_PID"
if [ ! -z "$OLLAMA_PID" ]; then
  echo "   Ollama: $OLLAMA_PID"
fi
echo ""
echo "📝 Logs:"
echo "   API: /tmp/api-server.log"
echo "   Frontend: /tmp/frontend.log"
echo "   Electron: /tmp/electron.log"
echo "   n8n: /tmp/n8n.log"
echo "   MCP: /tmp/mcp-server.log"
if command -v ollama &> /dev/null; then
  echo "   Ollama: /tmp/ollama.log"
fi
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Press Ctrl+C to stop all services..."

# Function to cleanup on exit
cleanup() {
  echo ""
  echo "🛑 Stopping all services..."
  
  if [ ! -z "$API_PID" ]; then
    kill $API_PID 2>/dev/null || true
    echo "✅ API Server stopped"
  fi
  
  if [ ! -z "$FRONTEND_PID" ]; then
    kill $FRONTEND_PID 2>/dev/null || true
    echo "✅ Frontend stopped"
  fi
  
  if [ ! -z "$ELECTRON_PID" ]; then
    kill $ELECTRON_PID 2>/dev/null || true
    echo "✅ Electron stopped"
  fi
  
  if [ ! -z "$OLLAMA_PID" ]; then
    kill $OLLAMA_PID 2>/dev/null || true
    echo "✅ Ollama stopped"
  fi
  
  if [ ! -z "$MCP_PID" ]; then
    kill $MCP_PID 2>/dev/null || true
    echo "✅ MCP Server stopped"
  fi
  
  # Stop n8n docker container
  if command -v docker-compose &> /dev/null || command -v docker &> /dev/null; then
    docker-compose stop n8n 2>/dev/null || docker compose stop n8n 2>/dev/null
    echo "✅ n8n stopped"
  fi
  
  echo "✅ All services stopped"
  exit 0
}

# Trap Ctrl+C and call cleanup
trap cleanup INT TERM

# Keep script running
wait
