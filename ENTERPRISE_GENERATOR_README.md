# Enterprise Knowledge Graph & Restructuring System

This comprehensive system analyzes the LightDom codebase, generates knowledge graphs, designs enterprise architecture, and creates a fully restructured enterprise-ready version of the application.

## 🎯 Overview

This system provides:

1. **Codebase Knowledge Graph** - Deep analysis of all code relationships, function usage, and dependencies
2. **Enterprise Architecture Design** - Microservices-based architecture with proper layering
3. **Project Restructuring** - Reorganized code into enterprise services structure
4. **Worker Pool System** - Scalable headless browser worker pool using Playwright
5. **DeepSeek AI Integration** - AI-powered code generation and optimization service
6. **Containerization** - Complete Docker and Kubernetes deployment configuration
7. **Comprehensive Documentation** - Auto-generated API docs, deployment guides, and architecture diagrams

## 🚀 Quick Start

### Generate Everything (Recommended)

```bash
# Generate complete enterprise platform
npm run enterprise:generate
```

This will:
- Analyze the codebase (~5 minutes)
- Generate knowledge graph with visualization
- Design enterprise architecture
- Create restructured project in `enterprise-output/`
- Set up all microservices
- Generate Docker configuration
- Create complete documentation

### Dry Run (Preview Only)

```bash
# See what would be generated without actually doing it
npm run enterprise:generate:dry-run
```

### Skip Analysis (Use Existing Data)

```bash
# Skip codebase analysis if you've already run it
npm run enterprise:generate:skip-analysis
```

## 📊 Individual Components

You can also run each component separately:

### 1. Knowledge Graph Generator

Analyzes the entire codebase and creates a comprehensive knowledge graph:

```bash
npm run enterprise:kg
```

**Output:**
- `knowledge-graph-output/knowledge-graph.json` - Complete graph data
- `knowledge-graph-output/knowledge-graph.html` - Interactive D3.js visualization
- `knowledge-graph-output/statistics.json` - Code statistics
- `knowledge-graph-output/architecture-analysis.md` - Architecture report
- `knowledge-graph-output/neo4j-*.csv` - Neo4j import files

**What it analyzes:**
- All files and their relationships
- Function definitions and usage patterns
- Import/export dependencies
- Cross-file function calls
- Component hierarchies
- Service dependencies

### 2. Enterprise Architecture Designer

Designs a complete enterprise-level microservices architecture:

```bash
npm run enterprise:architecture
```

**Output:**
- `knowledge-graph-output/enterprise-architecture.json` - Architecture spec
- `knowledge-graph-output/enterprise-architecture.md` - Documentation
- `knowledge-graph-output/enterprise-architecture-diagrams.mmd` - Mermaid diagrams

**What it designs:**
- 4-tier layered architecture
- 10+ microservices with clear boundaries
- API contracts (REST, WebSocket, GraphQL)
- Container architecture
- Deployment strategies

### 3. Project Generator

Creates the restructured enterprise project:

```bash
npm run enterprise:project
```

**Output:**
- `enterprise-output/` - Complete restructured project
- All services properly organized
- Docker configuration
- Startup scripts
- Documentation

### 4. Worker Pool Manager

Run the headless browser worker pool as a standalone service:

```bash
# Start with default settings (2-10 workers)
npm run worker-pool:start

# Start demo with custom settings
npm run worker-pool:demo
```

**Features:**
- Dynamic scaling based on load
- Task queue with priority
- Support for Chromium, Firefox, WebKit
- Health monitoring and auto-recovery
- Multiple task types (navigate, screenshot, crawl, extract)

## 📁 Output Structure

After running `npm run enterprise:generate`, you'll have:

```
enterprise-output/
├── services/                    # Microservices
│   ├── frontend/               # React web application
│   ├── api-gateway/            # Central API gateway
│   ├── user-management/        # User service
│   ├── dom-optimization/       # DOM optimization service
│   ├── blockchain-mining/      # Blockchain service
│   ├── workflow-engine/        # Workflow orchestration
│   ├── deepseek-ai/            # AI service (DeepSeek)
│   ├── crawler/                # Web crawler service
│   ├── wallet/                 # Wallet service
│   └── worker-pool/            # Headless browser workers
├── shared/                      # Shared code
│   ├── utils/
│   ├── types/
│   ├── constants/
│   ├── middleware/
│   └── models/
├── infrastructure/              # Infrastructure code
│   ├── init-postgres.sh
│   ├── prometheus.yml
│   └── ...
├── docs/                        # Documentation
│   ├── api.md
│   ├── architecture.md
│   ├── deployment.md
│   ├── kubernetes.md
│   ├── troubleshooting.md
│   └── openapi.json
├── scripts/                     # Utility scripts
│   ├── start.sh
│   ├── stop.sh
│   ├── health-check.sh
│   ├── logs.sh
│   └── restart.sh
├── docker-compose.yml          # Docker orchestration
├── .env.example                # Environment template
└── README.md                   # Main documentation
```

## 🐳 Running the Enterprise Platform

### Prerequisites

- Docker 20.10+
- Docker Compose 2.0+
- 8GB RAM minimum
- 20GB disk space

### Start the Platform

```bash
cd enterprise-output

# 1. Create environment file
cp .env.example .env
# Edit .env with your configuration

# 2. Start all services
./start.sh
# or
docker-compose up -d

# 3. Check health
./scripts/health-check.sh

# 4. View logs
./scripts/logs.sh
# or for specific service
./scripts/logs.sh api-gateway
```

### Access the Services

After starting, services will be available at:

- **Frontend**: http://localhost:3000
- **API Gateway**: http://localhost:3001
- **Grafana**: http://localhost:3002 (admin/admin)
- **Prometheus**: http://localhost:9090
- **RabbitMQ**: http://localhost:15672
- **Worker Pool**: http://localhost:3200

Individual microservices:
- User Management: http://localhost:3100
- DOM Optimization: http://localhost:3101
- Blockchain Mining: http://localhost:3102
- Workflow Engine: http://localhost:3103
- DeepSeek AI: http://localhost:3104
- Crawler: http://localhost:3105
- Wallet: http://localhost:3106

## 🔧 Microservices Architecture

### Service Overview

| Service | Port | Purpose | Dependencies |
|---------|------|---------|--------------|
| Frontend | 3000 | React web app | API Gateway |
| API Gateway | 3001 | Central routing | Redis |
| User Management | 3100 | Auth & users | PostgreSQL, Redis |
| DOM Optimization | 3101 | DOM analysis | PostgreSQL, Redis, Worker Pool |
| Blockchain Mining | 3102 | Blockchain ops | PostgreSQL, Redis |
| Workflow Engine | 3103 | Workflows | PostgreSQL, Redis, RabbitMQ |
| DeepSeek AI | 3104 | AI generation | Ollama, Redis |
| Crawler | 3105 | Web crawling | PostgreSQL, Redis, Worker Pool |
| Wallet | 3106 | Crypto wallet | PostgreSQL, Blockchain |
| Worker Pool | 3200 | Browser workers | Redis |

### Infrastructure Services

- **PostgreSQL**: Primary database (port 5432)
- **Redis**: Caching and sessions (port 6379)
- **RabbitMQ**: Message queue (ports 5672, 15672)
- **Ollama**: AI model server (port 11434)
- **Prometheus**: Metrics collection (port 9090)
- **Grafana**: Dashboards (port 3002)

## 📖 Knowledge Graph Visualization

The knowledge graph provides deep insights into your codebase:

### Features

- **Interactive D3.js visualization** - Zoom, pan, drag nodes
- **File relationship mapping** - See how files depend on each other
- **Function usage tracking** - Identify most-used functions
- **Dependency analysis** - Detect circular dependencies
- **Component discovery** - Identify React components
- **Service mapping** - Discover service boundaries

### Opening the Visualization

```bash
# After running enterprise:generate or enterprise:kg
open knowledge-graph-output/knowledge-graph.html
```

### Statistics Included

- Total files, functions, imports, exports
- Most used functions (top 50)
- Most connected files (top 50)
- File type distribution
- Component and service counts
- Circular dependency detection

## 🤖 Worker Pool Service

The worker pool manages a scalable pool of headless browser instances.

### API Endpoints

```bash
# Get status
curl http://localhost:3200/api/workers/status

# Allocate a worker
curl -X POST http://localhost:3200/api/workers/allocate \
  -H "Content-Type: application/json" \
  -d '{"priority": 1}'

# Release a worker
curl -X POST http://localhost:3200/api/workers/release/:workerId

# Scale workers
curl -X POST http://localhost:3200/api/workers/scale \
  -H "Content-Type: application/json" \
  -d '{"count": 5}'
```

### Task Types

**Navigate:**
```javascript
{
  "type": "navigate",
  "params": {
    "url": "https://example.com",
    "waitUntil": "networkidle"
  }
}
```

**Screenshot:**
```javascript
{
  "type": "screenshot",
  "params": {
    "path": "/tmp/screenshot.png",
    "fullPage": true
  }
}
```

**Crawl:**
```javascript
{
  "type": "crawl",
  "params": {
    "url": "https://example.com",
    "extractors": {
      "title": "h1",
      "description": "meta[name='description']"
    }
  }
}
```

### Configuration

Environment variables for worker pool:

- `MIN_WORKERS`: Minimum pool size (default: 2)
- `MAX_WORKERS`: Maximum pool size (default: 10)
- `BROWSER_TYPE`: chromium/firefox/webkit
- `IDLE_TIMEOUT`: Worker idle timeout in ms
- `TASK_TIMEOUT`: Task execution timeout in ms

## 🧠 DeepSeek AI Service

AI-powered code generation using DeepSeek R1 model.

### Setup

```bash
# Start Ollama
docker-compose up -d ollama

# Pull DeepSeek model
docker-compose exec ollama ollama pull deepseek-r1:latest

# Start AI service
docker-compose up -d deepseek-ai
```

### API Usage

**Generate Code:**
```bash
curl -X POST http://localhost:3104/api/ai/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Create a React login component",
    "context": {
      "framework": "React",
      "language": "TypeScript"
    }
  }'
```

**Optimize Code:**
```bash
curl -X POST http://localhost:3104/api/ai/optimize \
  -H "Content-Type: application/json" \
  -d '{
    "code": "const x = 1; const y = 2; return x + y;",
    "language": "javascript"
  }'
```

## 📚 Documentation

Comprehensive documentation is auto-generated:

- **Main README** - Overview and quick start
- **Architecture Docs** - System architecture and design
- **API Documentation** - OpenAPI spec and endpoint docs
- **Deployment Guide** - Docker and Kubernetes deployment
- **Troubleshooting** - Common issues and solutions
- **Kubernetes Guide** - K8s-specific deployment

## 🔍 Advanced Usage

### Scaling Services

```bash
# Scale worker pool to 10 instances
docker-compose up -d --scale worker-pool=10

# Scale any service
docker-compose up -d --scale <service>=<count>
```

### Monitoring

```bash
# View all logs
docker-compose logs -f

# View specific service
docker-compose logs -f api-gateway

# Check health
./scripts/health-check.sh

# View metrics (Prometheus)
open http://localhost:9090

# View dashboards (Grafana)
open http://localhost:3002
```

### Development

Each service can be developed independently:

```bash
cd enterprise-output/services/<service-name>
npm install
npm run dev
```

## 🐛 Troubleshooting

### Services Not Starting

```bash
# Check logs
docker-compose logs <service-name>

# Verify environment
cat .env

# Check port conflicts
netstat -an | grep <port>
```

### Database Issues

```bash
# Check PostgreSQL
docker-compose ps postgres
docker-compose logs postgres

# Access database
docker-compose exec postgres psql -U lightdom -d user_management
```

### Worker Pool Issues

```bash
# Check status
curl http://localhost:3200/api/workers/status | jq

# View logs
docker-compose logs worker-pool

# Restart with fresh state
docker-compose restart worker-pool
```

## 🎓 Learning Resources

- **Knowledge Graph Visualization** - Explore code relationships interactively
- **Architecture Diagrams** - Understand system design
- **API Documentation** - Learn the API endpoints
- **Service READMEs** - Each service has its own documentation
- **Example Requests** - API examples in the docs

## 🤝 Contributing

The enterprise structure is designed for team collaboration:

1. Each service is independent
2. Shared code in `/shared`
3. Clear service boundaries
4. API contracts documented
5. Comprehensive testing setup

## 📝 License

MIT

## 🔗 Related Documentation

- [Main LightDom README](../README.md)
- [Original Architecture](../ARCHITECTURE.md)
- [Blockchain Documentation](../BLOCKCHAIN_README.md)
- [Worker Pool Guide](enterprise-output/services/worker-pool/WORKER_POOL_GUIDE.md)
- [DeepSeek Integration](enterprise-output/services/deepseek-ai/DEEPSEEK_INTEGRATION.md)

---

**Generated by**: LightDom Enterprise Knowledge Graph & Restructuring System
**Version**: 1.0.0
**Last Updated**: 2025
