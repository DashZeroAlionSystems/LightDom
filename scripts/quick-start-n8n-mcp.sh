#!/bin/bash

# Quick Start Script for n8n MCP Integration
# This script sets up the n8n MCP integration for LightDom

set -e

echo "🚀 LightDom n8n MCP Integration Quick Start"
echo "==========================================="

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

# Check if Node.js is installed
check_nodejs() {
    print_info "Checking Node.js installation..."
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        print_status "Node.js is installed: $NODE_VERSION"
    else
        print_error "Node.js is not installed. Please install Node.js 16+ first."
        exit 1
    fi
}

# Check if npm is installed
check_npm() {
    print_info "Checking npm installation..."
    if command -v npm &> /dev/null; then
        NPM_VERSION=$(npm --version)
        print_status "npm is installed: $NPM_VERSION"
    else
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi
}

# Install dependencies
install_dependencies() {
    print_info "Installing dependencies..."
    
    # Check if package.json exists
    if [ ! -f "package.json" ]; then
        print_error "package.json not found. Please run this script from the project root."
        exit 1
    fi
    
    # Install MCP dependencies
    npm install @modelcontextprotocol/sdk axios commander chalk ora --save
    
    print_status "Dependencies installed successfully"
}

# Create environment configuration
setup_environment() {
    print_info "Setting up environment configuration..."
    
    # Create .env.example if it doesn't exist
    if [ ! -f ".env.example" ]; then
        cat > .env.example << EOF
# n8n MCP Configuration
N8N_BASE_URL=http://localhost:5678
N8N_API_KEY=your_api_key_here
N8N_WEBHOOK_URL=
N8N_TIMEOUT=30000

# Optional: Enable debug mode
N8N_DEBUG=false
EOF
        print_status "Created .env.example"
    else
        print_warning ".env.example already exists"
    fi
    
    # Create .env if it doesn't exist
    if [ ! -f ".env" ]; then
        cp .env.example .env
        print_status "Created .env file"
        print_warning "Please update .env with your n8n configuration"
    else
        print_warning ".env file already exists"
    fi
}

# Create MCP configuration
setup_mcp_config() {
    print_info "Setting up MCP configuration..."
    
    cat > mcp-config.json << EOF
{
  "mcpServers": {
    "n8n": {
      "command": "node",
      "args": ["dist/src/mcp/n8n-mcp-server.js"],
      "env": {
        "N8N_BASE_URL": "http://localhost:5678",
        "N8N_API_KEY": "",
        "N8N_WEBHOOK_URL": "",
        "N8N_TIMEOUT": "30000"
      }
    }
  }
}
EOF
    
    print_status "Created mcp-config.json"
    print_info "Add this file to your Cursor MCP settings"
}

# Build the MCP server
build_mcp_server() {
    print_info "Building MCP server..."
    
    # Check if TypeScript is available
    if ! command -v tsc &> /dev/null; then
        print_warning "TypeScript not found. Installing TypeScript..."
        npm install -g typescript
    fi
    
    # Create dist directory if it doesn't exist
    mkdir -p dist/src/mcp
    
    # Build the MCP server
    npx tsc src/mcp/n8n-mcp-server.ts --outDir dist --target es2020 --module commonjs --esModuleInterop --skipLibCheck
    npx tsc src/mcp/n8n-mcp-cli.ts --outDir dist --target es2020 --module commonjs --esModuleInterop --skipLibCheck
    
    print_status "MCP server built successfully"
}

# Update package.json scripts
update_package_scripts() {
    print_info "Updating package.json scripts..."
    
    # Check if scripts section exists and add MCP scripts
    if grep -q '"scripts"' package.json; then
        # Add MCP scripts if they don't exist
        if ! grep -q '"build:n8n-mcp"' package.json; then
            # This is a simplified approach - in practice, you'd use a proper JSON editor
            print_warning "Please manually add the following scripts to package.json:"
            echo '  "build:n8n-mcp": "npx tsc src/mcp/*.ts --outDir dist --target es2020 --module commonjs --esModuleInterop --skipLibCheck",'
            echo '  "start:n8n-mcp": "node dist/src/mcp/n8n-mcp-server.js",'
            echo '  "cli:n8n-mcp": "node dist/src/mcp/n8n-mcp-cli.js",'
            echo '  "test:n8n-mcp": "node dist/src/mcp/n8n-mcp-cli.js test"'
        else
            print_status "Package.json scripts already updated"
        fi
    else
        print_warning "No scripts section found in package.json"
    fi
}

# Test the connection
test_connection() {
    print_info "Testing n8n connection..."
    
    # Check if n8n is running
    if curl -s http://localhost:5678/api/v1/workflows > /dev/null 2>&1; then
        print_status "n8n is running and accessible"
        
        # Test the MCP CLI
        if [ -f "dist/src/mcp/n8n-mcp-cli.js" ]; then
            print_info "Testing MCP CLI connection..."
            node dist/src/mcp/n8n-mcp-cli.js test || print_warning "MCP CLI test failed - check your n8n configuration"
        fi
    else
        print_warning "n8n is not accessible at http://localhost:5678"
        print_info "Please ensure n8n is running and accessible"
    fi
}

# Create sample workflow
create_sample_workflow() {
    print_info "Creating sample DOM optimization workflow..."
    
    if [ -f "workflows/dom-optimization-template.json" ]; then
        print_status "Sample workflow template found"
        print_info "You can import this workflow using:"
        echo "  node dist/src/mcp/n8n-mcp-cli.js import workflows/dom-optimization-template.json"
    else
        print_warning "Sample workflow template not found"
    fi
}

# Main execution
main() {
    echo ""
    print_info "Starting LightDom n8n MCP integration setup..."
    echo ""
    
    check_nodejs
    check_npm
    install_dependencies
    setup_environment
    setup_mcp_config
    build_mcp_server
    update_package_scripts
    test_connection
    create_sample_workflow
    
    echo ""
    print_status "Setup completed successfully!"
    echo ""
    print_info "Next steps:"
    echo "1. Update .env with your n8n configuration"
    echo "2. Add mcp-config.json to your Cursor MCP settings"
    echo "3. Restart Cursor"
    echo "4. Test the integration in Cursor"
    echo ""
    print_info "Useful commands:"
    echo "  npm run test:n8n-mcp     # Test n8n connection"
    echo "  npm run cli:n8n-mcp list # List workflows"
    echo "  npm run start:n8n-mcp    # Start MCP server"
    echo ""
    print_info "For more information, see docs/N8N_MCP_INTEGRATION.md"
}

# Run main function
main "$@"
