# LightDom - Integrated System Quick Start

## ⚡ Start in 3 Commands

```bash
# 1. Install dependencies
PUPPETEER_SKIP_DOWNLOAD=true npm install --legacy-peer-deps

# 2. Ensure .env exists (creates from .env.example if needed)
cp -n .env.example .env

# 3. Start the integrated system
npm run start:integrated
```

## 🎯 What You Get

After running the command above:
- ✅ Frontend UI at **http://localhost:3000**
- ✅ API Server at **http://localhost:3001**
- ✅ WebSocket for real-time updates
- ✅ Mock data (no database required)
- ✅ All major features working

## 📊 System Status

Check if everything is running:
```bash
# API health check
curl http://localhost:3001/api/health

# Frontend (open in browser)
open http://localhost:3000
```

## 🔧 Development Mode Features

With `DB_DISABLED=true` (default in .env):
- Category management with in-memory data
- Workflow system
- Template management
- Git operations  
- RAG/AI (if Ollama running)
- Chrome layers visualization

## 🚀 Enable Full Features (Optional)

### 1. Enable Database

```bash
# Start PostgreSQL with Docker
docker run -d --name lightdom-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=dom_space_harvester \
  -p 5432:5432 postgres:13

# Update .env
sed -i 's/DB_DISABLED=true/DB_DISABLED=false/' .env

# Restart
npm run start:integrated
```

### 2. Enable AI/RAG

```bash
# Install and start Ollama
curl -fsSL https://ollama.ai/install.sh | sh
ollama serve

# Pull DeepSeek model
ollama pull deepseek-r1
```

### 3. Enable Blockchain

```bash
# Start local blockchain
npm run blockchain:start

# Deploy contracts
npm run blockchain:deploy
```

## 🐛 Troubleshooting

**Ports already in use?**
```bash
lsof -ti:3000 | xargs kill -9  # Frontend
lsof -ti:3001 | xargs kill -9  # API
```

**Dependencies won't install?**
```bash
rm -rf node_modules package-lock.json
PUPPETEER_SKIP_DOWNLOAD=true npm install --legacy-peer-deps
```

**Database connection errors?**
- If `DB_DISABLED=true`: These are expected, system uses mock data
- If `DB_DISABLED=false`: Ensure PostgreSQL is running on port 5432

## 📚 More Documentation

- **[System Integration Guide](SYSTEM_INTEGRATION_GUIDE.md)** - Complete integration docs
- **[README](README.md)** - Full feature list
- **[Architecture](ARCHITECTURE.md)** - System design

---

**Got it running?** Start exploring at http://localhost:3000! 🎉
