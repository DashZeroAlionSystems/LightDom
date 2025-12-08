# RAG Service - LightDom

## Overview

The RAG (Retrieval-Augmented Generation) service provides AI-powered document retrieval and chat capabilities for the LightDom platform. It integrates with DeepSeek, Ollama, and vector databases to enable intelligent content search and generation.

## Features

- **Document Ingestion**: Upload and process documents for semantic search
- **Vector Embeddings**: Generate embeddings using Ollama or OpenAI
- **Semantic Search**: Find relevant content using vector similarity
- **AI Chat**: Context-aware conversations with DeepSeek integration
- **Tool Execution**: Execute system commands and tools through AI
- **Health Monitoring**: Built-in health checks and metrics
- **Automatic Restart**: PM2-managed process with auto-recovery
- **Comprehensive Logging**: File-based and stdout logging

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                  Client Application                  │
│              (Frontend, Backend, CLI)               │
└───────────────────┬─────────────────────────────────┘
                    │ HTTP/REST
                    ↓
┌─────────────────────────────────────────────────────┐
│              RAG Standalone Service                  │
│                  (Port 3002)                        │
├─────────────────────────────────────────────────────┤
│  Endpoints:                                         │
│  • /health           - Health check                 │
│  • /ready            - Readiness probe              │
│  • /metrics          - Service metrics              │
│  • /api/rag/*        - Core RAG operations          │
│  • /api/enhanced-rag/* - Enhanced AI features       │
└───────────┬─────────────────────┬───────────────────┘
            │                     │
            ↓                     ↓
    ┌───────────────┐     ┌──────────────┐
    │  PostgreSQL   │     │    Ollama    │
    │ Vector Store  │     │  (DeepSeek)  │
    └───────────────┘     └──────────────┘
```

## Prerequisites

1. **Node.js** >= 18.0.0
2. **PostgreSQL** with vector extension (pgvector)
3. **Ollama** (for local AI) or **DeepSeek API key** (for remote AI)
4. **PM2** (recommended for production)

## Installation

### 1. Install Dependencies

```bash
npm install
```

### 2. Install PM2 (Process Manager)

```bash
npm install -g pm2
```

### 3. Install Ollama (Optional - for local AI)

```bash
# macOS/Linux
curl -fsSL https://ollama.com/install.sh | sh

# Start Ollama service
ollama serve

# Pull DeepSeek model
ollama pull deepseek-r1:latest
```

### 4. Setup Database

Ensure PostgreSQL is running and the vector extension is installed:

```sql
-- Connect to your database
psql -U postgres -d dom_space_harvester

-- Install vector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Verify tables exist (run migrations if needed)
\dt rag_*
```

### 5. Configure Environment

Create or update `.env` file:

```bash
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=dom_space_harvester
DB_USER=postgres
DB_PASSWORD=postgres

# RAG Service Configuration
RAG_SERVICE_PORT=3002
RAG_SERVICE_HOST=0.0.0.0
RAG_LOG_DIR=./logs

# Ollama Configuration (for local AI)
OLLAMA_ENDPOINT=http://localhost:11434
OLLAMA_MODEL=deepseek-r1:latest

# RAG Configuration
RAG_EMBED_PROVIDER=ollama  # or 'openai'
RAG_CHUNK_SIZE=800
RAG_CHUNK_OVERLAP=120

# DeepSeek API (for remote AI - optional)
DEEPSEEK_API_KEY=your_api_key_here
DEEPSEEK_API_URL=https://api.deepseek.com/v1

# OpenAI API (for embeddings - optional)
OPENAI_API_KEY=your_openai_key_here

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

## Usage

### Running with PM2 (Recommended)

PM2 provides automatic restart, monitoring, and log management.

#### Start Service

```bash
# Start RAG service
pm2 start ecosystem.config.cjs

# Or start only RAG service
pm2 start ecosystem.config.cjs --only rag-service

# Start in development mode
pm2 start ecosystem.config.cjs --env development
```

#### Manage Service

```bash
# View status
pm2 status
pm2 list

# View logs (real-time)
pm2 logs rag-service

# View last 100 lines
pm2 logs rag-service --lines 100

# Monitor resources
pm2 monit

# Restart service
pm2 restart rag-service

# Stop service
pm2 stop rag-service

# Delete service from PM2
pm2 delete rag-service

# Reload (zero-downtime restart)
pm2 reload rag-service
```

#### Advanced PM2 Commands

```bash
# Save PM2 configuration (persist across reboots)
pm2 save

# Setup PM2 to start on system boot
pm2 startup

# View detailed info
pm2 info rag-service

# Scale to multiple instances
pm2 scale rag-service 3

# View metrics
pm2 metrics rag-service

# Flush logs
pm2 flush rag-service
```

### Running Directly (Development)

```bash
# Start service directly
node services/rag/rag-standalone-service.js

# Or using npm script (add to package.json)
npm run rag:start
```

### Running with NPM Scripts

Add these scripts to `package.json`:

```json
{
  "scripts": {
    "rag:start": "pm2 start ecosystem.config.cjs --only rag-service",
    "rag:start:dev": "pm2 start ecosystem.config.cjs --only rag-service --env development",
    "rag:stop": "pm2 stop rag-service",
    "rag:restart": "pm2 restart rag-service",
    "rag:logs": "pm2 logs rag-service --lines 100",
    "rag:monit": "pm2 monit",
    "rag:status": "pm2 status rag-service"
  }
}
```

Then use:

```bash
npm run rag:start        # Start service
npm run rag:stop         # Stop service
npm run rag:restart      # Restart service
npm run rag:logs         # View logs
npm run rag:status       # Check status
```

## API Endpoints

### Health & Monitoring

#### Health Check
```bash
curl http://localhost:3002/health
```

Response:
```json
{
  "status": "healthy",
  "service": "rag-standalone",
  "uptime": "3600s",
  "requests": 1250,
  "errors": 2,
  "timestamp": "2025-11-18T12:00:00.000Z",
  "database": "connected",
  "environment": {
    "ollama": "http://localhost:11434",
    "embedProvider": "ollama"
  }
}
```

#### Readiness Check
```bash
curl http://localhost:3002/ready
```

#### Metrics
```bash
curl http://localhost:3002/metrics
```

Response:
```json
{
  "uptime_seconds": 3600,
  "requests_total": 1250,
  "errors_total": 2,
  "requests_per_second": 0.347,
  "error_rate": 0.0016,
  "memory": {
    "rss": 125825024,
    "heapTotal": 41721856,
    "heapUsed": 28345672
  },
  "timestamp": "2025-11-18T12:00:00.000Z"
}
```

### RAG Operations

#### Document Upload
```bash
curl -X POST http://localhost:3002/api/rag/documents \
  -H "Content-Type: application/json" \
  -d '{
    "documents": [
      {
        "id": "doc1",
        "title": "Sample Document",
        "content": "Your document content here..."
      }
    ]
  }'
```

#### Search Documents
```bash
curl -X POST http://localhost:3002/api/rag/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "your search query",
    "limit": 5
  }'
```

#### AI Chat
```bash
curl -X POST http://localhost:3002/api/enhanced-rag/chat/tools/stream \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "Explain quantum computing"}
    ],
    "conversationId": "conv-123",
    "mode": "assistant"
  }'
```

## Logging

The RAG service provides comprehensive logging:

### Log Files

- **Service Logs**: `./logs/rag-service.log` - All service activity
- **Error Logs**: `./logs/rag-service-error.log` - Errors only
- **PM2 Output**: `./logs/pm2-rag-out.log` - Stdout from PM2
- **PM2 Error**: `./logs/pm2-rag-error.log` - Stderr from PM2
- **PM2 Combined**: `./logs/pm2-rag-combined.log` - Combined output

### Log Format

```
[2025-11-18T12:00:00.000Z] [INFO] Message here {"meta": "data"}
[2025-11-18T12:00:01.000Z] [ERROR] Error occurred {"error": "details"}
```

### Viewing Logs

```bash
# Tail service logs
tail -f logs/rag-service.log

# View errors only
tail -f logs/rag-service-error.log

# View PM2 logs (real-time)
pm2 logs rag-service

# View last 100 lines
pm2 logs rag-service --lines 100

# View logs with timestamp
pm2 logs rag-service --timestamp

# View raw logs without formatting
pm2 logs rag-service --raw
```

### Log Rotation

PM2 provides built-in log rotation. Install the module:

```bash
pm2 install pm2-logrotate

# Configure rotation (optional)
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30
pm2 set pm2-logrotate:compress true
```

## Troubleshooting

### Service Won't Start

**Problem**: Service fails to start or crashes immediately.

**Solution**:

1. Check database connection:
   ```bash
   psql -U postgres -d dom_space_harvester -c "SELECT 1"
   ```

2. Verify Ollama is running:
   ```bash
   curl http://localhost:11434/api/tags
   ```

3. Check environment variables:
   ```bash
   cat .env | grep -E "DB_|RAG_|OLLAMA_"
   ```

4. View error logs:
   ```bash
   pm2 logs rag-service --err --lines 50
   ```

5. Check port availability:
   ```bash
   lsof -i :3002
   # If port is in use, change RAG_SERVICE_PORT
   ```

### Database Connection Failed

**Problem**: Cannot connect to PostgreSQL.

**Solution**:

1. Verify PostgreSQL is running:
   ```bash
   pg_isready -h localhost -p 5432
   ```

2. Check credentials in `.env`:
   ```bash
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=dom_space_harvester
   DB_USER=postgres
   DB_PASSWORD=postgres
   ```

3. Test connection manually:
   ```bash
   psql -h localhost -p 5432 -U postgres -d dom_space_harvester
   ```

4. Verify database exists:
   ```sql
   \l dom_space_harvester
   ```

### Ollama Not Responding

**Problem**: Cannot connect to Ollama service.

**Solution**:

1. Check if Ollama is running:
   ```bash
   ps aux | grep ollama
   ```

2. Start Ollama:
   ```bash
   ollama serve
   ```

3. Test Ollama endpoint:
   ```bash
   curl http://localhost:11434/api/tags
   ```

4. Pull required model:
   ```bash
   ollama pull deepseek-r1:latest
   ```

5. Verify OLLAMA_ENDPOINT in `.env`:
   ```bash
   OLLAMA_ENDPOINT=http://localhost:11434
   ```

### High Memory Usage

**Problem**: Service consuming too much memory.

**Solution**:

1. Check current memory usage:
   ```bash
   pm2 monit
   ```

2. Adjust max memory restart in `ecosystem.config.cjs`:
   ```javascript
   max_memory_restart: '500M', // Reduce from 1G
   ```

3. Monitor memory over time:
   ```bash
   pm2 logs rag-service | grep memory
   ```

4. Consider scaling down chunk size in `.env`:
   ```bash
   RAG_CHUNK_SIZE=500  # Reduce from 800
   ```

### Service Keeps Restarting

**Problem**: Service enters restart loop.

**Solution**:

1. Check restart count:
   ```bash
   pm2 status rag-service
   ```

2. View startup errors:
   ```bash
   pm2 logs rag-service --err --lines 100
   ```

3. Increase restart delay in `ecosystem.config.cjs`:
   ```javascript
   restart_delay: 10000, // Increase from 4000
   min_uptime: '30s', // Increase from 10s
   ```

4. Check for port conflicts:
   ```bash
   lsof -i :3002
   ```

5. Temporarily disable auto-restart to debug:
   ```bash
   pm2 stop rag-service
   node services/rag/rag-standalone-service.js
   # Debug the direct output
   ```

### Cannot Find Module Errors

**Problem**: `Error: Cannot find module 'xxx'`

**Solution**:

1. Reinstall dependencies:
   ```bash
   npm install
   ```

2. Clear node_modules and reinstall:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. Check if using ES modules correctly:
   ```bash
   # package.json should have:
   "type": "module"
   ```

### Debug Mode

Enable debug mode for detailed logging:

```bash
# In .env
DEBUG=true

# Or with PM2
pm2 restart rag-service --update-env -- DEBUG=true

# Or run directly
DEBUG=true node services/rag/rag-standalone-service.js
```

## Performance Tuning

### Optimize for High Traffic

1. **Enable clustering** (modify `ecosystem.config.cjs`):
   ```javascript
   instances: 'max', // Use all CPU cores
   exec_mode: 'cluster',
   ```

2. **Increase database pool size** (in service code):
   ```javascript
   max: 20, // Increase from 10
   ```

3. **Adjust chunk processing**:
   ```bash
   RAG_CHUNK_SIZE=1000
   RAG_CHUNK_OVERLAP=150
   ```

### Optimize for Low Memory

1. **Reduce pool size**:
   ```javascript
   max: 5, // Decrease from 10
   ```

2. **Lower memory restart threshold**:
   ```javascript
   max_memory_restart: '500M',
   ```

3. **Smaller chunks**:
   ```bash
   RAG_CHUNK_SIZE=500
   ```

## Integration Examples

### From Frontend

```javascript
// Health check
const health = await fetch('http://localhost:3002/health').then(r => r.json());

// Search
const results = await fetch('http://localhost:3002/api/rag/search', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ query: 'search term', limit: 5 })
}).then(r => r.json());

// Chat
const response = await fetch('http://localhost:3002/api/enhanced-rag/chat/tools/stream', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    messages: [{ role: 'user', content: 'Hello!' }],
    conversationId: 'conv-123'
  })
});
```

### From Backend

```javascript
import fetch from 'node-fetch';

async function searchDocuments(query) {
  const response = await fetch('http://localhost:3002/api/rag/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, limit: 10 })
  });
  return response.json();
}
```

## Deployment

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Configure proper database credentials
- [ ] Set up log rotation with `pm2-logrotate`
- [ ] Enable PM2 startup script: `pm2 startup`
- [ ] Save PM2 configuration: `pm2 save`
- [ ] Configure firewall for port 3002
- [ ] Set up monitoring and alerts
- [ ] Enable HTTPS/SSL (use reverse proxy like Nginx)
- [ ] Configure backup strategy for logs
- [ ] Set up health check monitoring
- [ ] Review and adjust resource limits

### Systemd Service (Alternative to PM2)

If you prefer systemd over PM2:

```ini
# /etc/systemd/system/rag-service.service
[Unit]
Description=LightDom RAG Service
After=network.target postgresql.service

[Service]
Type=simple
User=node
WorkingDirectory=/var/www/lightdom
ExecStart=/usr/bin/node services/rag/rag-standalone-service.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl daemon-reload
sudo systemctl enable rag-service
sudo systemctl start rag-service
sudo systemctl status rag-service
```

## Support

For issues or questions:
- Check logs: `pm2 logs rag-service`
- Review this README troubleshooting section
- Check GitHub issues
- Contact development team

## License

MIT License - See LICENSE file for details
