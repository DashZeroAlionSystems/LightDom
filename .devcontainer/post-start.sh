#!/bin/bash

# LightDom Codespace Post-Start Script
set -e

echo "🔄 Post-start setup for LightDom..."

# Ensure PostgreSQL is running
if ! pg_isready -h localhost -p 5432 > /dev/null 2>&1; then
  echo "🐘 Starting PostgreSQL..."
  sudo service postgresql start
fi

# Check if Anvil is running, start if not
if ! curl -s http://localhost:8545 > /dev/null 2>&1; then
  echo "⛏️ Starting Anvil blockchain..."
  anvil --host 0.0.0.0 --port 8545 &
  sleep 3
fi

# Verify services are running
echo "🔍 Verifying services..."
if pg_isready -h localhost -p 5432 > /dev/null 2>&1; then
  echo "✅ PostgreSQL is running"
else
  echo "❌ PostgreSQL is not running"
fi

if curl -s http://localhost:8545 > /dev/null 2>&1; then
  echo "✅ Anvil blockchain is running"
else
  echo "❌ Anvil blockchain is not running"
fi

# Display helpful information
echo ""
echo "🎯 Quick Actions:"
echo "  • Run './start-dev.sh' to start the full development environment"
echo "  • Run 'npm start' to start the complete system"
echo "  • Run 'npm run dev' to start just the frontend"
echo "  • Run 'npm run api' to start just the API server"
echo ""
echo "📊 Service Status:"
echo "  • PostgreSQL: $(pg_isready -h localhost -p 5432 > /dev/null 2>&1 && echo '✅ Running' || echo '❌ Not running')"
echo "  • Anvil: $(curl -s http://localhost:8545 > /dev/null 2>&1 && echo '✅ Running' || echo '❌ Not running')"
echo ""
echo "🌐 Access URLs:"
echo "  • Frontend: http://localhost:3000"
echo "  • API: http://localhost:3001"
echo "  • Anvil: http://localhost:8545"
echo "  • Database: localhost:5432"
echo ""
echo "Ready to develop! 🚀"