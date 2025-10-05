#!/bin/bash

# DOM Space Harvester Devnet Setup Script
# Sets up local Anvil devnet with contracts deployed

set -e

echo "🚀 Setting up DOM Space Harvester Devnet..."

# Check if Anvil is installed
if ! command -v anvil &> /dev/null; then
    echo "❌ Anvil not found. Installing Foundry..."
    curl -L https://foundry.paradigm.xyz | bash
    source ~/.bashrc
    foundryup
fi

# Start Anvil in background
echo "🔧 Starting Anvil devnet..."
anvil --host 0.0.0.0 --port 8545 --chain-id 31337 --gas-limit 30000000 --gas-price 20000000000 &
ANVIL_PID=$!

# Wait for Anvil to start
sleep 5

# Set environment variables
export RPC_URL="http://localhost:8545"
export PRIVATE_KEY="0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80" # Anvil default
export BLOCKCHAIN_ENABLED="true"

# Deploy contracts
echo "📦 Deploying contracts..."
cd contracts
forge build
forge create --rpc-url $RPC_URL --private-key $PRIVATE_KEY src/ProofOfOptimization.sol:ProofOfOptimization --constructor-args "0x0000000000000000000000000000000000000000" "0x0000000000000000000000000000000000000000"
forge create --rpc-url $RPC_URL --private-key $PRIVATE_KEY src/DOMSpaceToken.sol:DOMSpaceToken
forge create --rpc-url $RPC_URL --private-key $PRIVATE_KEY src/VirtualLandNFT.sol:VirtualLandNFT --constructor-args "DOM Space Land" "DSL"

# Get contract addresses
POO_ADDRESS=$(forge create --rpc-url $RPC_URL --private-key $PRIVATE_KEY src/ProofOfOptimization.sol:ProofOfOptimization --constructor-args "0x0000000000000000000000000000000000000000" "0x0000000000000000000000000000000000000000" | grep "Deployed to:" | awk '{print $3}')
TOKEN_ADDRESS=$(forge create --rpc-url $RPC_URL --private-key $PRIVATE_KEY src/DOMSpaceToken.sol:DOMSpaceToken | grep "Deployed to:" | awk '{print $3}')
LAND_ADDRESS=$(forge create --rpc-url $RPC_URL --private-key $PRIVATE_KEY src/VirtualLandNFT.sol:VirtualLandNFT --constructor-args "DOM Space Land" "DSL" | grep "Deployed to:" | awk '{print $3}')

cd ..

# Create .env file
echo "📝 Creating environment configuration..."
cat > .env << EOF
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=dom_space_harvester
DB_USER=postgres
DB_PASSWORD=postgres

# Blockchain
RPC_URL=$RPC_URL
PRIVATE_KEY=$PRIVATE_KEY
BLOCKCHAIN_ENABLED=true
POO_CONTRACT_ADDRESS=$POO_ADDRESS
DSH_CONTRACT=$TOKEN_ADDRESS
LAND_CONTRACT_ADDRESS=$LAND_ADDRESS

# API
PORT=3001
FRONTEND_URL=http://localhost:3002
ADMIN_TOKEN=dev-admin-token-123

# Storage
STORAGE_TYPE=local
ARTIFACT_PATH=./artifacts
EOF

echo "✅ Devnet setup complete!"
echo ""
echo "📋 Contract Addresses:"
echo "  PoO Contract: $POO_ADDRESS"
echo "  Token Contract: $TOKEN_ADDRESS"
echo "  Land Contract: $LAND_ADDRESS"
echo ""
echo "🔧 Environment variables saved to .env"
echo ""
echo "🚀 To start the system:"
echo "  1. Start PostgreSQL: docker run -d --name postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 postgres"
echo "  2. Run migrations: psql -h localhost -U postgres -d dom_space_harvester -f postgresql-setup-script.sql"
echo "  3. Start API: yarn start"
echo "  4. Start Frontend: yarn web"
echo ""
echo "🛑 To stop Anvil: kill $ANVIL_PID"
