# LightDom Enhanced Startup System

## Overview

The Enhanced Startup System provides comprehensive orchestration for LightDom workloads with:
- **Blockchain Algorithm Demo Integration** - Automatically runs optimization benchmarks on startup
- **Self-Generating Workload Containers** - Dynamic containerization for different workload types
- **SEO Data Mining Containerization** - Scalable data mining workers in isolated containers
- **Multi-Environment Support** - Development, staging, and production configurations

## Quick Start

### Basic Startup (with demo)
```bash
node start-lightdom-enhanced.js
```

This will:
1. Start the API server
2. Run the blockchain algorithm optimization demo
3. Display benchmark results
4. Start configured workload containers

### Startup Without Demo
```bash
node start-lightdom-enhanced.js --no-demo
```

### Startup with Specific Workload
```bash
# SEO optimization workload
node start-lightdom-enhanced.js --workload seo

# Data mining workload
node start-lightdom-enhanced.js --workload datamining

# Crawling workload
node start-lightdom-enhanced.js --workload crawling

# All workloads
node start-lightdom-enhanced.js --workload all
```

### Production Startup
```bash
node start-lightdom-enhanced.js --env production --no-demo
```

## Command Line Options

| Option | Description | Default |
|--------|-------------|---------|
| `--no-demo` | Disable blockchain algorithm demo | Demo enabled |
| `--no-containers` | Disable container orchestration | Containers enabled |
| `--no-datamining` | Disable data mining containers | Data mining enabled |
| `--workload <type>` | Specify workload type | `seo` |
| `--env <environment>` | Set environment | `development` |
| `--help` | Show help message | - |

### Workload Types

- **`seo`** - SEO optimization and analysis
- **`crawling`** - Web crawling and data extraction
- **`mining`** - Blockchain mining operations
- **`datamining`** - Data mining for ML training
- **`all`** - All workload types

## Docker Compose Orchestration

### Start Complete SEO Data Mining Stack
```bash
docker-compose -f docker-compose.seo-datamining.yml up -d
```

This starts:
- API Server
- PostgreSQL Database
- Redis Cache
- 3 SEO Data Mining Workers
- Blockchain Node (Ganache)
- Monitoring Service

### Scale Workers
```bash
# Scale to 10 workers
docker-compose -f docker-compose.seo-datamining.yml up -d --scale seo-worker-1=10
```

### View Logs
```bash
# All services
docker-compose -f docker-compose.seo-datamining.yml logs -f

# Specific service
docker-compose -f docker-compose.seo-datamining.yml logs -f seo-worker-1
```

### Stop Services
```bash
# Stop all
docker-compose -f docker-compose.seo-datamining.yml down

# Stop and remove volumes
docker-compose -f docker-compose.seo-datamining.yml down -v
```

## Architecture

### Startup Flow

```
┌─────────────────────────────────────────────────────┐
│ 1. Check Prerequisites                               │
│    - Docker availability                             │
│    - Required files                                  │
│    - Node.js version                                 │
└──────────────────┬──────────────────────────────────┘
                   ▼
┌─────────────────────────────────────────────────────┐
│ 2. Start Core Services                              │
│    - API Server (port 3001)                         │
│    - Wait for health check                          │
└──────────────────┬──────────────────────────────────┘
                   ▼
┌─────────────────────────────────────────────────────┐
│ 3. Run Blockchain Algorithm Demo                    │
│    - Benchmark PoW, PoS, PoO, DPoS                  │
│    - DOM optimization demo                          │
│    - Display results                                │
└──────────────────┬──────────────────────────────────┘
                   ▼
┌─────────────────────────────────────────────────────┐
│ 4. Start Workload Containers                        │
│    - Build Docker images if needed                  │
│    - Launch workload-specific containers            │
│    - Configure networking                           │
└──────────────────┬──────────────────────────────────┘
                   ▼
┌─────────────────────────────────────────────────────┐
│ 5. Start Data Mining Containers                     │
│    - Launch multiple worker containers              │
│    - Configure API connections                      │
│    - Set up resource limits                         │
└──────────────────┬──────────────────────────────────┘
                   ▼
┌─────────────────────────────────────────────────────┐
│ 6. Display System Status                            │
│    - List all running services                      │
│    - Show API endpoints                             │
│    - Display container IDs                          │
└──────────────────┬──────────────────────────────────┘
                   ▼
                 Ready!
```

### Container Architecture

```
┌──────────────────────────────────────────────────────────┐
│                     Host Machine                         │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │           lightdom-network (172.20.0.0/16)         │ │
│  │                                                    │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐        │ │
│  │  │   API    │  │PostgreSQL│  │  Redis   │        │ │
│  │  │ Server   │  │          │  │          │        │ │
│  │  └────┬─────┘  └────┬─────┘  └────┬─────┘        │ │
│  │       │             │             │               │ │
│  │  ┌────┴─────────────┴─────────────┴──────┐       │ │
│  │  │                                         │      │ │
│  │  │  ┌──────────┐  ┌──────────┐  ┌───────┐│      │ │
│  │  │  │SEO Worker│  │SEO Worker│  │  ...  ││      │ │
│  │  │  │    1     │  │    2     │  │       ││      │ │
│  │  │  └──────────┘  └──────────┘  └───────┘│      │ │
│  │  │                                         │      │ │
│  │  │       Data Mining Worker Pool           │      │ │
│  │  └─────────────────────────────────────────┘      │ │
│  │                                                    │ │
│  │  ┌──────────┐  ┌──────────┐                      │ │
│  │  │Blockchain│  │Monitoring│                      │ │
│  │  │  Node    │  │  Service │                      │ │
│  │  └──────────┘  └──────────┘                      │ │
│  └────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

## Self-Generating Workload System

The startup system can dynamically generate containers for different workload types:

### How It Works

1. **Workload Configuration** - Define workload parameters in `getWorkloadConfig()`
2. **Image Building** - Automatically builds Docker images if not present
3. **Container Generation** - Spawns containers with appropriate environment
4. **Networking** - Configures host networking for inter-service communication
5. **Lifecycle Management** - Handles startup, monitoring, and shutdown

### Adding New Workloads

Edit `start-lightdom-enhanced.js` and add to `getWorkloadConfig()`:

```javascript
myworkload: {
  image: 'lightdom-myworkload',
  dockerfile: 'Dockerfile.workflow',
  ports: ['3020:3020'],
  environment: {
    WORKLOAD_TYPE: 'myworkload',
    API_URL: `http://host.docker.internal:${this.ports.api}`
  },
  command: 'node services/my-workload-service.js'
}
```

## Containerized Data Mining

### Features

- **Horizontal Scaling** - Run multiple worker containers
- **Resource Isolation** - Each worker in separate container
- **Independent Failures** - One worker failure doesn't affect others
- **Easy Deployment** - Single command deploys entire stack

### Resource Limits

Each data mining worker container has:
- **CPU Limit**: 1.0 cores
- **CPU Reservation**: 0.5 cores
- **Memory Limit**: 2GB
- **Memory Reservation**: 1GB

### Monitoring

```bash
# Container stats
docker stats lightdom-seo-worker-1

# Resource usage
docker-compose -f docker-compose.seo-datamining.yml stats
```

## Environment Variables

### Core Services

- `NODE_ENV` - Environment (development/staging/production)
- `PORT` - API server port (default: 3001)
- `BLOCKCHAIN_ENABLED` - Enable blockchain features (default: true)
- `DB_DISABLED` - Disable database initially (default: true for fast startup)

### Worker Containers

- `WORKER_ID` - Unique worker identifier
- `WORKLOAD_TYPE` - Type of workload to run
- `API_URL` - Main API server URL
- `BLOCKCHAIN_RPC_URL` - Blockchain node URL
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` - Database connection

## Examples

### Example 1: Development with Demo
```bash
# Start with all features
node start-lightdom-enhanced.js

# Output:
# 🚀 LightDom Enhanced Startup System
# ⏰ Started at: 2025-11-05T...
# 🔧 Environment: development
# 📦 Workload Type: seo
# 🐳 Containers: Enabled
# 🤖 Demo: Enabled
#
# 🎯 Running Blockchain Algorithm Optimization Demo...
# 📊 BENCHMARK RESULTS:
#    PoO: 19.90 TPS (BEST for SEO)
# ✅ Demo completed successfully
#
# 🐳 Starting Workload-Specific Containers...
# ✅ seo container started
#
# ✅ LightDom System Status
# 🔌 Core Services:
#    ✓ API Server          http://localhost:3001
```

### Example 2: Production Deployment
```bash
# Production with all workloads
node start-lightdom-enhanced.js --env production --workload all

# Or use Docker Compose
docker-compose -f docker-compose.seo-datamining.yml up -d --scale seo-worker-1=10
```

### Example 3: Data Mining Only
```bash
# Just data mining workload
node start-lightdom-enhanced.js --workload datamining --no-demo
```

## Troubleshooting

### Demo Fails to Run
```bash
# Run demo manually
node demo-blockchain-algorithm-optimization.js

# Check if services exist
ls -la services/blockchain-algorithm-benchmark-service.js
```

### Container Fails to Start
```bash
# Check Docker
docker ps -a

# View logs
docker logs lightdom-seo-worker-1

# Inspect container
docker inspect lightdom-seo-worker-1
```

### API Server Not Starting
```bash
# Check port availability
lsof -i :3001

# Test API manually
curl http://localhost:3001/api/health
```

## Integration with CI/CD

### GitHub Actions Example
```yaml
name: Deploy Data Mining Stack

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Start System
        run: |
          node start-lightdom-enhanced.js --env production --no-demo
      
      - name: Run Tests
        run: |
          node test-blockchain-optimization.js
      
      - name: Deploy Containers
        run: |
          docker-compose -f docker-compose.seo-datamining.yml up -d
```

## Performance Tuning

### Adjust Worker Count
```javascript
// In docker-compose.seo-datamining.yml
docker-compose up -d --scale seo-worker-1=20
```

### Adjust Resource Limits
```yaml
# In docker-compose.seo-datamining.yml
deploy:
  resources:
    limits:
      cpus: '2.0'        # Increase CPU
      memory: 4G         # Increase memory
```

### Optimize Startup Time
```bash
# Skip demo for faster startup
node start-lightdom-enhanced.js --no-demo

# Skip containers if not needed
node start-lightdom-enhanced.js --no-containers
```

## Related Documentation

- [Blockchain Algorithm Optimization](BLOCKCHAIN_ALGORITHM_OPTIMIZATION_README.md)
- [Implementation Summary](IMPLEMENTATION_SUMMARY.md)
- [Docker Deployment Guide](DEPLOYMENT.md)
- [SEO Data Mining](DOM_3D_MINING_README.md)

## Support

For issues or questions:
- Check logs: `docker-compose logs -f`
- Review status: API endpoint `/api/realtime/status`
- Run tests: `node test-blockchain-optimization.js`
