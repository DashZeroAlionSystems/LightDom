#!/bin/bash

# LightDom Blockchain Quick Start Script
# This script helps you get the blockchain up and running quickly

set -e

echo "🚀 LightDom Blockchain Quick Start"
echo "=================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if node is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    echo "Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

echo -e "${GREEN}✅ Node.js $(node --version) detected${NC}"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ npm $(npm --version) detected${NC}"
echo ""

# Function to check if a port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        return 0
    else
        return 1
    fi
}

# Step 1: Check .env file
echo "📋 Step 1: Checking environment configuration..."
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  .env file not found${NC}"
    if [ -f .env.example ]; then
        echo "Copying .env.example to .env..."
        cp .env.example .env
        echo -e "${GREEN}✅ .env file created${NC}"
    else
        echo -e "${RED}❌ .env.example not found${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ .env file exists${NC}"
fi
echo ""

# Step 2: Check if Hardhat node is running
echo "📋 Step 2: Checking if Hardhat node is running..."
if check_port 8545; then
    echo -e "${GREEN}✅ Hardhat node is already running on port 8545${NC}"
else
    echo -e "${YELLOW}⚠️  Hardhat node is not running${NC}"
    echo "Starting Hardhat node in background..."
    
    # Start Hardhat node in background
    npx hardhat node > /dev/null 2>&1 &
    HARDHAT_PID=$!
    echo "Hardhat node PID: $HARDHAT_PID"
    
    # Wait for Hardhat to start
    echo "Waiting for Hardhat node to start..."
    sleep 5
    
    if check_port 8545; then
        echo -e "${GREEN}✅ Hardhat node started successfully${NC}"
    else
        echo -e "${RED}❌ Failed to start Hardhat node${NC}"
        exit 1
    fi
fi
echo ""

# Step 3: Compile contracts
echo "📋 Step 3: Compiling smart contracts..."
if [ -d "artifacts" ]; then
    echo -e "${GREEN}✅ Contracts already compiled${NC}"
else
    echo "Compiling contracts..."
    npx hardhat compile || {
        echo -e "${RED}❌ Contract compilation failed${NC}"
        exit 1
    }
    echo -e "${GREEN}✅ Contracts compiled successfully${NC}"
fi
echo ""

# Step 4: Deploy contracts
echo "📋 Step 4: Deploying contracts..."
if node scripts/deploy-local.js; then
    echo -e "${GREEN}✅ Contracts deployed successfully${NC}"
else
    echo -e "${RED}❌ Contract deployment failed${NC}"
    exit 1
fi
echo ""

# Step 5: Run health check
echo "📋 Step 5: Running blockchain health check..."
if node scripts/blockchain-health-check.js; then
    echo -e "${GREEN}✅ Health check passed${NC}"
else
    echo -e "${YELLOW}⚠️  Some health checks failed (this may be okay)${NC}"
fi
echo ""

# Step 6: Generate test data (optional)
echo "📋 Step 6: Generating test data (optional)..."
read -p "Generate test data? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    node scripts/generate-test-data.js all
    echo -e "${GREEN}✅ Test data generated${NC}"
else
    echo "Skipping test data generation"
fi
echo ""

# Summary
echo "=================================="
echo -e "${GREEN}✅ Blockchain Quick Start Complete!${NC}"
echo "=================================="
echo ""
echo "🎉 Your blockchain is ready to use!"
echo ""
echo "📝 Next steps:"
echo "  1. Start the API server:"
echo "     node api-server-express.js"
echo ""
echo "  2. Start the frontend (in a new terminal):"
echo "     npm run dev"
echo ""
echo "  3. Open your browser:"
echo "     http://localhost:3000"
echo ""
echo "📚 Useful commands:"
echo "  - Run health check: node scripts/blockchain-health-check.js"
echo "  - Generate test data: node scripts/generate-test-data.js"
echo "  - View deployment: cat deployments/localhost.json"
echo ""
echo "🛑 To stop the Hardhat node:"
if [ -n "$HARDHAT_PID" ]; then
    echo "  kill $HARDHAT_PID"
fi
echo ""
