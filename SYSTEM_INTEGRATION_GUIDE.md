# LightDom System Integration Guide

## 🎯 Overview

This guide explains how all LightDom components work together and provides clear instructions for starting and using the integrated system.

## 🏗️ System Architecture

### Core Components

```
┌─────────────────────────────────────────────────────────────┐
│                     LightDom Platform                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐    ┌──────────────┐   ┌──────────────┐  │
│  │   Frontend   │◄──►│  API Server  │◄─►│   Database   │  │
│  │  React PWA   │    │   Express    │   │  PostgreSQL  │  │
│  │  Port 3000   │    │   Port 3001  │   │  Port 5432   │  │
│  └──────────────┘    └──────────────┘   └──────────────┘  │
│         │                    │                    │         │
│         │                    │                    │         │
│  ┌──────▼────────────────────▼────────────────────▼──────┐ │
│  │              WebSocket (Socket.IO)                     │ │
│  │            Real-time bidirectional updates             │ │
│  └────────────────────────────────────────────────────────┘ │
│         │                    │                    │         │
│  ┌──────▼──────┐     ┌──────▼──────┐     ┌──────▼──────┐  │
│  │  Blockchain │     │   Crawler   │     │     RAG     │  │
│  │   Mining    │     │   System    │     │   (Ollama)  │  │
│  └─────────────┘     └─────────────┘     └─────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Integration Points

1. **Frontend ↔ API**: HTTP REST + WebSocket via proxy at `/api` and `/ws`
2. **API ↔ Database**: PostgreSQL connection pool (can be disabled for dev)
3. **API ↔ Blockchain**: Web3/ethers.js integration (optional)
4. **API ↔ RAG**: Ollama integration for AI features (optional)
5. **API ↔ Crawler**: Real-time web crawling system (optional)

## 🚀 Quick Start Options

### Option 1: Development Without Database

**Best for**: Quick testing, frontend development, API testing without PostgreSQL

```bash
# Set DB_DISABLED=true in .env to use mock data
# Then start the system
npm run start:integrated

# This starts:
# - API Server on port 3001 (with mock/fallback for DB features)
# - Frontend on port 3000
# - WebSocket on ws://localhost:3001
```

**Features Available**:
- ✅ Frontend UI with Discord theme
- ✅ REST API endpoints
- ✅ WebSocket real-time updates
- ✅ RAG integration (if Ollama running)
- ✅ Category management (mock mode)
- ⚠️ Database features use in-memory mock data

**Access Points**:
- Frontend: http://localhost:3000
- API: http://localhost:3001
- Health: http://localhost:3001/api/health
- API Docs: http://localhost:3001/api/docs (if available)

### Option 2: Full System with Database

**Best for**: Full feature testing, production-like environment

**Prerequisites**:
```bash
# 1. PostgreSQL must be running
docker run -d \
  --name lightdom-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=dom_space_harvester \
  -p 5432:5432 \
  postgres:13

# 2. Run database migrations
npm run db:migrate
```

**Start the system**:
```bash
# Note: Database is enabled by default in .env
# If you don't have PostgreSQL, set DB_DISABLED=true in .env

# Start the integrated system
npm run start:integrated
```

**Features Available**:
- ✅ All minimal mode features
- ✅ Full database persistence
- ✅ Blockchain integration
- ✅ Advanced crawler features
- ✅ User management
- ✅ Transaction history

### Option 3: Individual Services (Advanced)

**Best for**: Debugging, service-specific development

```bash
# Terminal 1: Start API Server
node api-server-express.js

# Terminal 2: Start Frontend (in separate terminal)
npm run dev

# Optional: Start other services as needed
# npm run blockchain:start
# npm run mining:daemon
# ollama serve
```

## 📋 Component Details

### 1. Frontend (React PWA)

**Location**: `src/`  
**Entry Point**: `src/main.tsx`  
**Build Tool**: Vite  
**Port**: 3000  

**Key Features**:
- React 18 with TypeScript
- Discord-inspired UI theme
- PWA capabilities (offline, notifications)
- Ant Design components + Tailwind CSS
- Hot Module Replacement (HMR)

**Configuration**:
- `vite.config.ts` - Vite configuration with API proxy
- `src/index.css` - Global styles
- `src/discord-theme.css` - Theme definitions

**API Integration**:
```typescript
// All /api requests are proxied to port 3001
fetch('/api/health')  // → http://localhost:3001/api/health
fetch('/api/blockchain/stats')  // → http://localhost:3001/api/blockchain/stats
```

### 2. API Server (Express)

**Location**: `api-server-express.js`  
**Port**: 3001  
**Framework**: Express.js  

**Key Features**:
- 50+ RESTful API endpoints
- WebSocket (Socket.IO) for real-time updates
- PostgreSQL integration (optional)
- Blockchain integration (optional)
- RAG/AI integration (optional)
- Comprehensive error handling
- Security middleware (Helmet, CORS, rate limiting)

**Major Route Groups**:
```javascript
/api/health                    // Health check
/api/blockchain/*              // Blockchain operations
/api/crawler/*                 // Web crawler
/api/wallet/*                  // Wallet operations
/api/metaverse/*               // Metaverse features
/api/rag/*                     // RAG/AI features
/api/category-management/*     // Category CRUD
/api/workflows/*               // Workflow management
/api/seo/*                     // SEO features
/api/mining-jobs/*             // Mining operations
/api/git/*                     // Git operations
```

**Configuration**:
- Environment variables in `.env`
- Database pooling configuration
- CORS and security settings
- Rate limiting rules

### 3. Database (PostgreSQL)

**Location**: `database/`  
**Schemas**: Multiple SQL files  
**Port**: 5432  

**Key Tables**:
- User management
- Transactions
- Metaverse data
- Blockchain records
- Crawler results
- Workflow definitions

**Setup**:
```bash
# Option A: Docker
docker-compose up -d postgres

# Option B: Local PostgreSQL
createdb dom_space_harvester
psql dom_space_harvester < database/schema.sql
```

**Migrations**:
```bash
npm run db:migrate
npm run db:seed  # Optional: load sample data
```

### 4. Blockchain Integration

**Location**: `blockchain/`  
**Contracts**: `contracts/`  
**Network**: Local Hardhat node or custom testnet  

**Key Features**:
- Proof of Optimization (PoO) mining
- LightDom token (ERC-20)
- Smart contract integration
- Mining rewards system

**Setup**:
```bash
# Start local blockchain node
npm run blockchain:start

# Deploy contracts
npm run blockchain:deploy

# Start mining
npm run mining:start
```

### 5. Web Crawler System

**Location**: `crawler/`  
**Main File**: `crawler/RealWebCrawlerSystem.js`  

**Key Features**:
- Multi-threaded crawling
- DOM optimization analysis
- Performance metrics
- Real-time progress updates

**Usage**:
```bash
# Via API
curl -X POST http://localhost:3001/api/crawler/start \
  -H "Content-Type: application/json" \
  -d '{"urls": ["https://example.com"]}'

# Monitor progress
curl http://localhost:3001/api/crawler/stats
```

### 6. RAG System (AI Integration)

**Location**: `services/rag/`  
**Provider**: Ollama (DeepSeek, Llama3)  
**Port**: 11434 (Ollama)  

**Features**:
- Natural language queries
- Document analysis
- Code generation
- Conversational AI

**Setup**:
```bash
# Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Pull DeepSeek model
ollama pull deepseek-r1

# Start Ollama service
ollama serve
```

## 🔧 Configuration

### Environment Variables (.env)

```bash
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/dom_space_harvester
DB_DISABLED=false             # Set to true to disable database (use mock data)

# API Server
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000

# Blockchain (optional)
ETHEREUM_RPC_URL=http://localhost:8545
BLOCKCHAIN_ENABLED=true

# Optional Services
OLLAMA_HOST=http://localhost:11434
```

### Feature Flags

The system supports graceful degradation when optional services aren't available:

- **Database Disabled** (`DB_DISABLED=true`): Uses mock data, allows API/frontend testing
- **Blockchain Disabled**: Mining features not available
- **Ollama Not Running**: RAG features return fallback responses

## 🧪 Testing the Integration

### 1. Basic Health Check

```bash
# Check API health
curl http://localhost:3001/api/health

# Expected response:
# {"status":"healthy"} or {"status":"unhealthy","error":"..."}
```

### 2. Frontend Accessibility

```bash
# Open browser
open http://localhost:3000

# Or test with curl
curl -I http://localhost:3000
```

### 3. WebSocket Connection

```javascript
// In browser console
const socket = io('http://localhost:3001');
socket.on('connect', () => console.log('Connected!'));
socket.on('mining_update', (data) => console.log('Mining:', data));
```

### 4. API Endpoints

```bash
# Test various endpoints
curl http://localhost:3001/api/blockchain/stats
curl http://localhost:3001/api/crawler/stats
curl http://localhost:3001/api/wallet/balance
curl http://localhost:3001/api/metaverse/stats
```

## 📊 Monitoring

### Service Status

```bash
# Check running processes
ps aux | grep -E "(node|vite)"

# Check ports
lsof -i :3000  # Frontend
lsof -i :3001  # API Server
lsof -i :5432  # Database
```

### Logs

```bash
# API Server logs (if running in background)
tail -f /tmp/api-server.log

# Frontend logs (Vite)
# Visible in terminal running `npm run dev`
```

### Performance Metrics

Access http://localhost:3001/api/metrics for:
- Request counts
- Response times
- Error rates
- Active connections

## 🔒 Security Considerations

### Development Mode
- CORS allows localhost:3000
- Rate limiting disabled or relaxed
- Debug logging enabled
- Sample/test data

### Production Mode
- Strict CORS configuration
- Rate limiting enforced
- Reduced logging
- Database required
- HTTPS enforcement
- Environment variable validation

## 🐛 Troubleshooting

### Problem: API server won't start

**Solution**:
```bash
# Check if port 3001 is in use
lsof -ti:3001 | xargs kill -9

# Check dependencies
npm install --legacy-peer-deps

# Check .env file exists
test -f .env || cp .env.example .env
```

### Problem: Frontend can't connect to API

**Solution**:
1. Verify API is running: `curl http://localhost:3001/api/health`
2. Check Vite proxy configuration in `vite.config.ts`
3. Verify CORS settings in `api-server-express.js`
4. Check browser console for errors

### Problem: Database connection errors

**Solution**:
```bash
# Option 1: For development without PostgreSQL, disable database
# In .env: DB_DISABLED=true

# Option 2: Or start PostgreSQL
docker-compose up -d postgres

# Or use local PostgreSQL
pg_ctl -D /usr/local/var/postgres start
```

### Problem: WebSocket not connecting

**Solution**:
1. Verify API server is running
2. Check Socket.IO client configuration
3. Verify firewall rules
4. Check browser console for connection errors

## 📚 Additional Resources

- [Complete System Documentation](COMPLETE_SYSTEM_DOCUMENTATION.md)
- [Quick Start Guide](QUICK_START_GUIDE.md)
- [API Documentation](API_DOCUMENTATION.md)
- [Frontend Setup](FRONTEND_SETUP_COMPLETE.md)
- [Blockchain Guide](BLOCKCHAIN_README.md)
- [Mining System](MINING_SYSTEM_README.md)

## 🤝 Development Workflow

### Adding New Features

1. **Backend (API)**:
   - Add route in `api-server-express.js` or create new route file
   - Test with curl or Postman
   - Document in API docs

2. **Frontend**:
   - Add components in `src/components/`
   - Add pages in `src/pages/`
   - Add routing in `src/App.tsx`
   - Test in browser

3. **Database**:
   - Create migration in `database/migrations/`
   - Run migration: `npm run db:migrate`
   - Update TypeScript types

### Testing Changes

```bash
# Run linter
npm run lint

# Type check
npm run type-check

# Run tests
npm test

# Build for production
npm run build
```

## 🎯 Best Practices

1. **Start Simple**: Use minimal mode first, enable features as needed
2. **Check Logs**: Monitor console output for errors and warnings
3. **Use Health Checks**: Verify services are running before testing
4. **Environment Variables**: Never commit sensitive data to `.env`
5. **Database**: Use mock mode for frontend development
6. **Documentation**: Update docs when adding new features
7. **Error Handling**: Handle service unavailability gracefully

---

**Last Updated**: November 2025  
**Version**: 1.0.0  
**Maintainer**: LightDom Team
