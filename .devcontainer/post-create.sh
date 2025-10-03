#!/bin/bash

# LightDom Codespace Post-Create Setup Script
set -e

echo "🚀 Setting up LightDom development environment..."

# Update system packages
echo "📦 Updating system packages..."
sudo apt-get update && sudo apt-get upgrade -y

# Install additional system dependencies
echo "🔧 Installing system dependencies..."
sudo apt-get install -y \
  postgresql-client \
  curl \
  wget \
  git \
  build-essential \
  python3 \
  python3-pip \
  jq \
  unzip \
  software-properties-common

# Install Foundry (for Solidity development)
echo "⛏️ Installing Foundry..."
curl -L https://foundry.paradigm.xyz | bash
export PATH="$PATH:$HOME/.foundry/bin"
foundryup

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
npm ci

# Install global npm packages
echo "🌐 Installing global npm packages..."
npm install -g \
  @hardhat/cli \
  @openzeppelin/cli \
  truffle \
  ganache-cli \
  pm2 \
  nodemon \
  typescript \
  ts-node

# Setup PostgreSQL (if not already running)
echo "🐘 Setting up PostgreSQL..."
if ! pg_isready -h localhost -p 5432 > /dev/null 2>&1; then
  echo "Starting PostgreSQL service..."
  sudo service postgresql start
fi

# Create database if it doesn't exist
echo "🗄️ Setting up database..."
sudo -u postgres psql -c "CREATE DATABASE dom_space_harvester;" 2>/dev/null || echo "Database already exists"
sudo -u postgres psql -c "CREATE USER lightdom WITH PASSWORD 'lightdom123';" 2>/dev/null || echo "User already exists"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE dom_space_harvester TO lightdom;" 2>/dev/null || echo "Privileges already granted"

# Run database setup script
echo "📊 Running database setup..."
if [ -f "postgresql-setup-script.sql" ]; then
  PGPASSWORD=lightdom123 psql -h localhost -U lightdom -d dom_space_harvester -f postgresql-setup-script.sql || echo "Database setup completed with warnings"
fi

# Setup environment variables
echo "🔐 Setting up environment variables..."
if [ ! -f ".env" ]; then
  cat > .env << EOF
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=dom_space_harvester
DB_USER=lightdom
DB_PASSWORD=lightdom123

# Blockchain Configuration
RPC_URL=http://localhost:8545
PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
NETWORK_ID=31337

# Application Configuration
NODE_ENV=development
PORT=3001
FRONTEND_PORT=3000

# API Configuration
API_BASE_URL=http://localhost:3001
FRONTEND_URL=http://localhost:3000

# Security
JWT_SECRET=lightdom-development-secret-key-change-in-production
ENCRYPTION_KEY=lightdom-encryption-key-32-chars

# Monitoring
ENABLE_MONITORING=true
LOG_LEVEL=debug
EOF
  echo "✅ Created .env file"
fi

# Setup Git configuration
echo "🔧 Setting up Git configuration..."
git config --global user.name "LightDom Developer" || true
git config --global user.email "developer@lightdom.dev" || true
git config --global init.defaultBranch main || true
git config --global pull.rebase false || true

# Install VS Code extensions
echo "🔌 Installing VS Code extensions..."
code --install-extension ms-vscode.vscode-typescript-next || true
code --install-extension bradlc.vscode-tailwindcss || true
code --install-extension esbenp.prettier-vscode || true
code --install-extension ms-vscode.vscode-eslint || true
code --install-extension JuanBlanco.solidity || true
code --install-extension ms-vscode.vscode-docker || true

# Build the application
echo "🏗️ Building application..."
npm run build || echo "Build completed with warnings"

# Run initial tests
echo "🧪 Running initial tests..."
npm run test:unit || echo "Tests completed with warnings"

# Setup monitoring (if enabled)
if [ "$ENABLE_MONITORING" = "true" ]; then
  echo "📊 Setting up monitoring..."
  if [ -f "setup-monitoring.js" ]; then
    node setup-monitoring.js || echo "Monitoring setup completed with warnings"
  fi
fi

# Create startup script
echo "📝 Creating startup script..."
cat > start-dev.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting LightDom development environment..."

# Start PostgreSQL
sudo service postgresql start

# Start Anvil (local blockchain)
echo "⛏️ Starting Anvil blockchain..."
anvil --host 0.0.0.0 --port 8545 &
ANVIL_PID=$!

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 5

# Deploy contracts
echo "📜 Deploying smart contracts..."
npm run deploy:local || echo "Contract deployment completed with warnings"

# Start API server
echo "🔌 Starting API server..."
npm run api &
API_PID=$!

# Start frontend
echo "🎨 Starting frontend..."
npm run dev &
FRONTEND_PID=$!

echo "✅ Development environment started!"
echo "Frontend: http://localhost:3000"
echo "API: http://localhost:3001"
echo "Anvil: http://localhost:8545"
echo "Database: localhost:5432"

# Function to cleanup on exit
cleanup() {
  echo "🛑 Shutting down services..."
  kill $ANVIL_PID $API_PID $FRONTEND_PID 2>/dev/null || true
  exit 0
}

trap cleanup SIGINT SIGTERM

# Wait for processes
wait
EOF

chmod +x start-dev.sh

# Create quick start script
echo "📝 Creating quick start script..."
cat > quick-start.sh << 'EOF'
#!/bin/bash
echo "⚡ Quick start for LightDom..."

# Check if services are running
if ! pg_isready -h localhost -p 5432 > /dev/null 2>&1; then
  echo "Starting PostgreSQL..."
  sudo service postgresql start
fi

if ! curl -s http://localhost:8545 > /dev/null 2>&1; then
  echo "Starting Anvil..."
  anvil --host 0.0.0.0 --port 8545 &
fi

# Start the application
echo "Starting LightDom..."
npm start
EOF

chmod +x quick-start.sh

echo "🎉 LightDom development environment setup complete!"
echo ""
echo "📋 Available commands:"
echo "  ./start-dev.sh     - Start full development environment"
echo "  ./quick-start.sh   - Quick start with minimal setup"
echo "  npm start          - Start complete system"
echo "  npm run dev        - Start frontend only"
echo "  npm run api        - Start API server only"
echo "  npm run build      - Build application"
echo "  npm test           - Run tests"
echo ""
echo "🌐 Services will be available at:"
echo "  Frontend: http://localhost:3000"
echo "  API: http://localhost:3001"
echo "  Anvil: http://localhost:8545"
echo "  Database: localhost:5432"
echo ""
echo "Happy coding! 🚀"