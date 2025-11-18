# LightDom Startup Guide

This guide provides comprehensive instructions for starting the LightDom Space-Bridge Platform with all required services.

## 🚀 Quick Start Options

### Option 1: Complete System (Recommended)
Starts all services including databases, API, frontend, Electron app, and monitoring.

```bash
npm start
```

### Option 2: Development Mode
Quick startup for development - starts essential services only.

```bash
npm run start:dev
```

### Option 3: Docker Mode
Starts the system using Docker for databases and local services for development.

```bash
npm run start:docker
```

### Option 4: Legacy Scripts
Use existing startup scripts for specific components.

```bash
npm run start:complete    # Complete system (legacy)
npm run start:blockchain  # Blockchain app only
```

## 📋 What Each Startup Script Does

### `npm start` (Complete System)
- ✅ Checks prerequisites (Docker, Node.js, required files)
- ✅ Starts PostgreSQL database (Docker or local)
- ✅ Starts Redis cache (Docker or local)
- ✅ Starts API server with web crawler
- ✅ Starts Vite frontend development server
- ✅ Launches Electron desktop application
- ✅ Starts monitoring services
- ✅ Provides comprehensive system status

### `npm run start:dev` (Development Mode)
- ✅ Starts API server
- ✅ Starts Vite frontend
- ✅ Launches Electron desktop app
- ⚠️  Assumes databases are already running

### `npm run start:docker` (Docker Mode)
- ✅ Checks Docker availability
- ✅ Starts PostgreSQL and Redis via Docker Compose
- ✅ Starts local API server (connected to Docker databases)
- ✅ Starts Vite frontend
- ✅ Launches Electron desktop app

## 🔧 Prerequisites

### Required Software
- **Node.js** (v18 or higher)
- **npm** (v8 or higher)
- **Docker Desktop** (for database services)

### Required Files
- `package.json`
- `simple-api-server.js`
- `web-crawler-service.js`
- `electron/main.cjs`

## 🌐 Service Ports

| Service | Port | URL |
|---------|------|-----|
| Frontend (Vite) | 3000 | http://localhost:3000 |
| API Server | 3001 | http://localhost:3001 |
| PostgreSQL | 5434 | localhost:5434 |
| Redis | 6380 | localhost:6380 |

## 🗄️ Database Setup

### Automatic Setup (Recommended)
The startup scripts will automatically:
1. Check if Docker is available
2. Start PostgreSQL and Redis via Docker Compose
3. Initialize databases with required schemas
4. Connect services to databases

### Manual Database Setup
If you prefer to run databases manually:

```bash
# Start only database services
docker-compose up -d postgres redis

# Or install PostgreSQL and Redis locally
# PostgreSQL: Install and run on port 5434
# Redis: Install and run on port 6380
```

## 🔍 Troubleshooting

### Common Issues

#### 1. Port Already in Use
```bash
# Check what's using the port
netstat -ano | findstr :3000

# Kill the process (Windows)
taskkill /PID <PID> /F

# Kill the process (Linux/Mac)
kill -9 <PID>
```

#### 2. Docker Not Running
```bash
# Start Docker Desktop
# Or install Docker if not available
# The system will fall back to local services
```

#### 3. Database Connection Issues
```bash
# Check if databases are running
docker ps

# Restart database services
docker-compose restart postgres redis
```

#### 4. Electron Not Starting
```bash
# Check if frontend is running first
curl http://localhost:3000

# Restart Electron
npm run electron:dev
```

### Service Health Checks

#### API Server Health
```bash
curl http://localhost:3001/api/health
```

#### Frontend Health
```bash
curl http://localhost:3000
```

#### Database Health
```bash
# PostgreSQL
docker-compose exec postgres pg_isready -U lightdom_user -d lightdom

# Redis
docker-compose exec redis redis-cli ping
```

## 📊 System Monitoring

### Built-in Monitoring
- **Health Endpoints**: `/api/health`
- **Crawler Stats**: `/api/crawler/stats`
- **Mining Data**: `/api/metaverse/mining-data`
- **System Status**: Displayed in console

### External Monitoring
- **Grafana**: http://localhost:3005 (if monitoring stack is running)
- **Prometheus**: http://localhost:9090 (if monitoring stack is running)

## 🛑 Stopping the System

### Graceful Shutdown
Press `Ctrl+C` in the terminal where you started the system. This will:
1. Stop all Node.js processes
2. Stop Docker services
3. Clean up resources

### Force Shutdown
If graceful shutdown doesn't work:
```bash
# Kill all Node processes
pkill -f node

# Stop Docker services
docker-compose down

# Kill Electron processes
pkill -f electron
```

## 🔄 Development Workflow

### 1. Start Development Environment
```bash
npm run start:dev
```

### 2. Make Changes
- Edit files in `src/` directory
- Vite will hot-reload frontend changes
- API server will restart automatically

### 3. Test Changes
- Frontend: http://localhost:3000
- API: http://localhost:3001/api/health
- Desktop App: Electron window

### 4. Stop and Restart
```bash
# Stop with Ctrl+C
# Restart with npm run start:dev
```

## 🚀 Production Deployment

### Using Docker Compose
```bash
# Build and start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

### Using PM2 (Process Manager)
```bash
# Install PM2
npm install -g pm2

# Start with PM2
pm2 start start-lightdom-complete.js --name lightdom

# Monitor
pm2 monit

# Stop
pm2 stop lightdom
```

## 📝 Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL=postgresql://lightdom_user:lightdom_password@localhost:5434/lightdom
REDIS_URL=redis://:lightdom_redis_password@localhost:6380

# API
PORT=3001
NODE_ENV=development

# Frontend
VITE_PORT=3000
VITE_API_URL=http://localhost:4100/api

# Blockchain
RPC_URL=http://localhost:8545
PRIVATE_KEY=your_private_key_here
```

## 🎯 Service Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Electron      │    │   Vite Frontend │    │   API Server    │
│   Desktop App   │◄──►│   (Port 3000)   │◄──►│   (Port 3001)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                        │
                       ┌─────────────────┐              │
                       │   PostgreSQL    │◄─────────────┘
                       │   (Port 5434)   │
                       └─────────────────┘
                                │
                       ┌─────────────────┐
                       │   Redis Cache   │
                       │   (Port 6380)   │
                       └─────────────────┘
```

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review the console output for error messages
3. Ensure all prerequisites are installed
4. Try the different startup options
5. Check the system architecture documentation

## 🎉 Success Indicators

When the system starts successfully, you should see:
- ✅ All services started messages
- 🌐 Frontend accessible at http://localhost:3000
- 🔌 API server responding at http://localhost:3001
- 🖥️  Electron desktop app window opened
- 🕷️  Web crawler actively crawling websites
- 📊 System status displayed in console
