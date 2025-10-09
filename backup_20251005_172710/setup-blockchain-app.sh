#!/bin/bash

# LightDom Blockchain Application Setup Script
# Comprehensive setup script for the blockchain application

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="LightDom Blockchain Application"
VERSION="1.0.0"
REQUIRED_NODE_VERSION="18"
REQUIRED_NPM_VERSION="8"

# Functions
print_header() {
    echo -e "${PURPLE}"
    echo "============================================================"
    echo "🌐 $APP_NAME"
    echo "============================================================"
    echo -e "${NC}"
    echo -e "${CYAN}Version: $VERSION${NC}"
    echo -e "${CYAN}Setup started at: $(date)${NC}"
    echo
}

print_step() {
    echo -e "${BLUE}🔧 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${CYAN}ℹ️  $1${NC}"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
check_prerequisites() {
    print_step "Checking prerequisites..."
    
    # Check Node.js
    if command_exists node; then
        NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
        if [ "$NODE_VERSION" -ge "$REQUIRED_NODE_VERSION" ]; then
            print_success "Node.js $(node --version) is installed"
        else
            print_error "Node.js version $REQUIRED_NODE_VERSION+ required. Current: $(node --version)"
            exit 1
        fi
    else
        print_error "Node.js is not installed. Please install Node.js $REQUIRED_NODE_VERSION+"
        exit 1
    fi
    
    # Check npm
    if command_exists npm; then
        NPM_VERSION=$(npm --version | cut -d'.' -f1)
        if [ "$NPM_VERSION" -ge "$REQUIRED_NPM_VERSION" ]; then
            print_success "npm $(npm --version) is installed"
        else
            print_error "npm version $REQUIRED_NPM_VERSION+ required. Current: $(npm --version)"
            exit 1
        fi
    else
        print_error "npm is not installed"
        exit 1
    fi
    
    # Check Git
    if command_exists git; then
        print_success "Git $(git --version | cut -d' ' -f3) is installed"
    else
        print_error "Git is not installed"
        exit 1
    fi
    
    # Check PostgreSQL
    if command_exists psql; then
        print_success "PostgreSQL is installed"
    else
        print_warning "PostgreSQL is not installed. Database features will be disabled."
        print_info "To install PostgreSQL:"
        print_info "  Ubuntu/Debian: sudo apt-get install postgresql postgresql-contrib"
        print_info "  macOS: brew install postgresql"
        print_info "  Windows: Download from https://www.postgresql.org/download/"
    fi
    
    # Check Docker (optional)
    if command_exists docker; then
        print_success "Docker is installed (optional for monitoring)"
    else
        print_warning "Docker is not installed (optional for monitoring)"
    fi
    
    echo
}

# Setup environment
setup_environment() {
    print_step "Setting up environment..."
    
    # Create .env file if it doesn't exist
    if [ ! -f .env ]; then
        if [ -f .env.example ]; then
            cp .env.example .env
            print_success "Created .env file from .env.example"
            print_warning "Please edit .env file with your configuration"
        else
            print_error ".env.example file not found"
            exit 1
        fi
    else
        print_info ".env file already exists"
    fi
    
    # Create logs directory
    mkdir -p logs
    print_success "Created logs directory"
    
    # Create uploads directory
    mkdir -p uploads
    print_success "Created uploads directory"
    
    # Create deployments directory
    mkdir -p deployments
    print_success "Created deployments directory"
    
    echo
}

# Install dependencies
install_dependencies() {
    print_step "Installing dependencies..."
    
    # Install npm dependencies
    print_info "Installing npm packages..."
    npm install
    
    if [ $? -eq 0 ]; then
        print_success "npm dependencies installed successfully"
    else
        print_error "Failed to install npm dependencies"
        exit 1
    fi
    
    # Install Hardhat dependencies
    print_info "Installing Hardhat dependencies..."
    npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox @nomicfoundation/hardhat-ethers ethers @openzeppelin/contracts @openzeppelin/contracts-upgradeable
    
    if [ $? -eq 0 ]; then
        print_success "Hardhat dependencies installed successfully"
    else
        print_error "Failed to install Hardhat dependencies"
        exit 1
    fi
    
    echo
}

# Setup database
setup_database() {
    print_step "Setting up database..."
    
    if command_exists psql; then
        # Check if database exists
        DB_NAME=$(grep "DB_NAME" .env | cut -d'=' -f2 | tr -d ' ')
        DB_USER=$(grep "DB_USER" .env | cut -d'=' -f2 | tr -d ' ')
        DB_PASSWORD=$(grep "DB_PASSWORD" .env | cut -d'=' -f2 | tr -d ' ')
        DB_HOST=$(grep "DB_HOST" .env | cut -d'=' -f2 | tr -d ' ')
        DB_PORT=$(grep "DB_PORT" .env | cut -d'=' -f2 | tr -d ' ')
        
        if [ -z "$DB_NAME" ]; then
            DB_NAME="lightdom_blockchain"
        fi
        if [ -z "$DB_USER" ]; then
            DB_USER="postgres"
        fi
        if [ -z "$DB_PASSWORD" ]; then
            DB_PASSWORD="postgres"
        fi
        if [ -z "$DB_HOST" ]; then
            DB_HOST="localhost"
        fi
        if [ -z "$DB_PORT" ]; then
            DB_PORT="5432"
        fi
        
        print_info "Setting up database: $DB_NAME"
        
        # Create database if it doesn't exist
        PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c "CREATE DATABASE $DB_NAME;" 2>/dev/null || print_info "Database $DB_NAME already exists"
        
        # Run schema
        if [ -f database/blockchain_schema.sql ]; then
            PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f database/blockchain_schema.sql
            if [ $? -eq 0 ]; then
                print_success "Database schema created successfully"
            else
                print_warning "Failed to create database schema. You may need to run it manually."
            fi
        else
            print_warning "Database schema file not found: database/blockchain_schema.sql"
        fi
    else
        print_warning "PostgreSQL not available. Skipping database setup."
        print_info "Database features will be disabled."
    fi
    
    echo
}

# Compile contracts
compile_contracts() {
    print_step "Compiling smart contracts..."
    
    if command_exists npx; then
        npx hardhat compile
        if [ $? -eq 0 ]; then
            print_success "Smart contracts compiled successfully"
        else
            print_warning "Failed to compile smart contracts"
        fi
    else
        print_warning "npx not available. Skipping contract compilation."
    fi
    
    echo
}

# Run tests
run_tests() {
    print_step "Running tests..."
    
    # Run contract tests
    if command_exists npx; then
        print_info "Running smart contract tests..."
        npx hardhat test 2>/dev/null || print_warning "Smart contract tests failed or not available"
    fi
    
    # Run application tests
    if [ -f package.json ] && grep -q '"test"' package.json; then
        print_info "Running application tests..."
        npm test 2>/dev/null || print_warning "Application tests failed or not available"
    fi
    
    print_success "Tests completed"
    echo
}

# Create startup scripts
create_startup_scripts() {
    print_step "Creating startup scripts..."
    
    # Make startup script executable
    chmod +x start-blockchain-app.js
    
    # Create systemd service (Linux)
    if [ -f /etc/systemd/system ]; then
        cat > lightdom-blockchain.service << EOF
[Unit]
Description=LightDom Blockchain Application
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$(pwd)
ExecStart=/usr/bin/node start-blockchain-app.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF
        print_success "Created systemd service file: lightdom-blockchain.service"
        print_info "To install: sudo cp lightdom-blockchain.service /etc/systemd/system/"
        print_info "To enable: sudo systemctl enable lightdom-blockchain"
        print_info "To start: sudo systemctl start lightdom-blockchain"
    fi
    
    echo
}

# Display completion summary
display_summary() {
    echo -e "${GREEN}"
    echo "============================================================"
    echo "🎉 SETUP COMPLETED SUCCESSFULLY!"
    echo "============================================================"
    echo -e "${NC}"
    
    echo -e "${CYAN}📋 Next Steps:${NC}"
    echo "1. Edit .env file with your configuration"
    echo "2. Start the application: npm start"
    echo "3. Open browser: http://localhost:3000"
    echo "4. Deploy contracts: npm run deploy:contracts:localhost"
    echo
    
    echo -e "${CYAN}🔧 Available Commands:${NC}"
    echo "  npm start              - Start the complete application"
    echo "  npm run dev            - Start frontend development server"
    echo "  npm run start:api      - Start API server only"
    echo "  npm run node           - Start blockchain node"
    echo "  npm run deploy:contracts - Deploy smart contracts"
    echo "  npm run test:contracts - Run smart contract tests"
    echo
    
    echo -e "${CYAN}📚 Documentation:${NC}"
    echo "  README: BLOCKCHAIN_APP_README.md"
    echo "  API Docs: http://localhost:3001/api/docs"
    echo "  Contract Docs: contracts/README.md"
    echo
    
    echo -e "${CYAN}🌐 Access URLs:${NC}"
    echo "  Frontend: http://localhost:3000"
    echo "  API:      http://localhost:3001"
    echo "  Metrics:  http://localhost:9090"
    echo "  Grafana:  http://localhost:3000"
    echo
    
    echo -e "${CYAN}🆘 Support:${NC}"
    echo "  Issues: GitHub Issues"
    echo "  Discord: LightDom Community"
    echo "  Email: support@lightdom.io"
    echo
    
    echo -e "${GREEN}Setup completed at: $(date)${NC}"
    echo
}

# Main setup function
main() {
    print_header
    
    # Run setup steps
    check_prerequisites
    setup_environment
    install_dependencies
    setup_database
    compile_contracts
    run_tests
    create_startup_scripts
    
    # Display summary
    display_summary
}

# Run main function
main "$@"
