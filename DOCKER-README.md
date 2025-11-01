# Memory Workflow CodeMap - Docker Container Setup

Run the complete Memory Workflow CodeMap system in isolated Docker containers with zero external dependencies.

## 🚀 Quick Start (3 Commands)

```bash
# 1. Start the complete system
npm run docker:start

# 2. Open your browser
# http://localhost:3002

# 3. Explore the interactive knowledge graph!
```

## 📦 What's Included

### **Containers:**
- **CodeMap App**: Interactive web interface with real-time updates
- **Ollama AI**: Local LLM processing (no external API costs)
- **Nginx** (Optional): Production reverse proxy with SSL

### **Features:**
- **Zero External Dependencies**: Everything runs locally
- **Persistent Memory**: Knowledge graph survives container restarts
- **Real-time Collaboration**: WebSocket-powered live updates
- **Production Ready**: Health checks, logging, security headers

## 🛠️ Manual Setup

### **Prerequisites:**
```bash
# Docker and Docker Compose
docker --version
docker-compose --version

# At least 8GB RAM recommended
# At least 10GB free disk space
```

### **Step-by-Step:**

1. **Clone/Download Files:**
   ```bash
   # Files needed:
   # - docker-compose-codemap.yml
   # - Dockerfile-codemap
   # - run-codemap-docker.sh (Linux/Mac)
   # - run-codemap-docker.bat (Windows)
   # - memory-codemap-interactive.html
   # - [All CodeMap server files]
   ```

2. **Build Containers:**
   ```bash
   docker-compose -f docker-compose-codemap.yml build
   ```

3. **Start System:**
   ```bash
   docker-compose -f docker-compose-codemap.yml up -d
   ```

4. **Check Status:**
   ```bash
   docker-compose -f docker-compose-codemap.yml ps
   ```

5. **Access Application:**
   ```
   http://localhost:3002
   ```

## 🎮 Management Commands

### **Using NPM Scripts:**
```bash
# Start complete system
npm run docker:start

# Stop all services
npm run docker:stop

# Restart services
npm run docker:restart

# Check status
npm run docker:status

# View logs
npm run docker:logs        # All logs
npm run docker:logs codemap  # CodeMap app logs
npm run docker:logs ollama   # Ollama logs

# Clean everything (removes containers and volumes)
npm run docker:clean
```

### **Using Docker Compose Directly:**
```bash
# Start system
docker-compose -f docker-compose-codemap.yml up -d

# Stop system
docker-compose -f docker-compose-codemap.yml down

# View logs
docker-compose -f docker-compose-codemap.yml logs -f

# Rebuild containers
docker-compose -f docker-compose-codemap.yml build --no-cache

# Remove everything
docker-compose -f docker-compose-codemap.yml down -v --rmi all
```

### **Using Shell Scripts:**
```bash
# Linux/Mac
./run-codemap-docker.sh start    # Start system
./run-codemap-docker.sh stop     # Stop system
./run-codemap-docker.sh status   # Check status
./run-codemap-docker.sh logs     # View logs
./run-codemap-docker.sh clean    # Remove everything

# Windows
run-codemap-docker.bat start
run-codemap-docker.bat stop
run-codemap-docker.bat status
run-codemap-docker.bat logs
run-codemap-docker.bat clean
```

## 🔧 Configuration

### **Environment Variables:**

#### **CodeMap App:**
```bash
NODE_ENV=production
PORT=3002
OLLAMA_HOST=http://ollama:11434
MEMORY_STORE_PATH=/app/memory-store/memory-data.json
```

#### **Ollama AI:**
```bash
OLLAMA_HOST=0.0.0.0
```

### **Custom Model:**
Edit `docker-compose-codemap.yml` to change the Ollama model:
```yaml
environment:
  - OLLAMA_HOST=0.0.0.0
command: ["ollama", "run", "codellama:13b"]  # Change model here
```

### **Port Configuration:**
```yaml
# Change CodeMap port
ports:
  - "8080:3002"  # Host:Container

# Change Ollama port
ports:
  - "11435:11434"  # Host:Container
```

### **Volume Mounts:**
```yaml
volumes:
  - ./memory-store:/app/memory-store  # Persistent memory
  - ./logs:/app/logs                  # Application logs
  - ./ollama-data:/root/.ollama       # AI model storage
```

## 📊 System Architecture

### **Container Layout:**
```
┌─────────────────────────────────────┐
│           Browser                    │
│        localhost:3002               │
└─────────────────┬───────────────────┘
                  │
        ┌─────────▼─────────┐
        │     Nginx         │  ← Optional reverse proxy
        │   (Production)    │
        └─────────┬─────────┘
                  │
        ┌─────────▼─────────┐
        │   CodeMap App     │  ← Node.js + Express + Socket.IO
        │     Port 3002     │
        └─────────┬─────────┘
                  │
        ┌─────────▼─────────┐
        │     Ollama AI     │  ← Local LLM processing
        │   Port 11434      │
        └───────────────────┘
```

### **Data Flow:**
1. **User Request** → Browser → Nginx (optional) → CodeMap App
2. **AI Processing** → CodeMap App → Ollama API → AI Response
3. **Real-time Updates** → Socket.IO → Browser live updates
4. **Memory Persistence** → JSON files → Docker volumes

## 🚨 Troubleshooting

### **Common Issues:**

#### **1. Port Already in Use:**
```bash
# Find process using port
lsof -i :3002
# or
netstat -tulpn | grep :3002

# Kill process or change port in docker-compose.yml
```

#### **2. Ollama Model Not Found:**
```bash
# Check available models
docker exec memory-codemap-ollama ollama list

# Pull a different model
docker exec memory-codemap-ollama ollama pull mistral:7b
```

#### **3. Memory Store Permission Issues:**
```bash
# Fix permissions on host
sudo chown -R $USER:$USER memory-store/
sudo chown -R $USER:$USER logs/
```

#### **4. Container Won't Start:**
```bash
# Check logs
docker-compose -f docker-compose-codemap.yml logs

# Rebuild without cache
docker-compose -f docker-compose-codemap.yml build --no-cache
```

#### **5. Out of Memory:**
```bash
# Increase Docker memory limit
# Docker Desktop: Settings → Resources → Memory
# Or add to docker-compose.yml:
services:
  ollama:
    deploy:
      resources:
        limits:
          memory: 8G
```

### **Performance Optimization:**

#### **For Better Performance:**
```yaml
# Add to CodeMap service
environment:
  - NODE_ENV=production
  - UV_THREADPOOL_SIZE=4
deploy:
  resources:
    limits:
      memory: 2G
      cpus: '1.0'
```

#### **For GPU Acceleration:**
```yaml
# Add GPU support (if available)
services:
  ollama:
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]
```

## 🔒 Security Considerations

### **Container Security:**
- **Non-root user**: CodeMap runs as `codemap` user (uid 1001)
- **Minimal base image**: Alpine Linux for smaller attack surface
- **No privileged access**: Containers run without elevated permissions

### **Network Security:**
- **Internal networking**: Services communicate via Docker networks
- **Port exposure**: Only necessary ports exposed to host
- **No default passwords**: All access controlled by application logic

### **Data Security:**
- **Local processing**: AI inference never leaves the container
- **Volume encryption**: Consider encrypting sensitive volumes
- **Access logging**: All API calls logged for audit trails

## 📈 Scaling & Production

### **Development Setup:**
```yaml
# Use this for development
version: '3.8'
services:
  codemap:
    build:
      context: .
      dockerfile: Dockerfile-codemap
    ports:
      - "3002:3002"
    volumes:
      - .:/app  # Mount source for live reload
      - /app/node_modules
    environment:
      - NODE_ENV=development
```

### **Production Setup:**
```yaml
# Use production profile for nginx
docker-compose -f docker-compose-codemap.yml --profile production up -d

# Enable SSL in nginx config
# Configure SSL certificates
# Set up monitoring and logging
```

### **Load Balancing:**
```yaml
# Scale CodeMap app
docker-compose -f docker-compose-codemap.yml up -d --scale codemap=3

# Add load balancer
services:
  loadbalancer:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx-lb.conf:/etc/nginx/nginx.conf
```

## 📊 Monitoring & Observability

### **Health Checks:**
```bash
# Container health
docker-compose -f docker-compose-codemap.yml ps

# Application health
curl http://localhost:3002/api/metrics

# AI service health
curl http://localhost:11434/api/tags
```

### **Logging:**
```bash
# Application logs
docker-compose -f docker-compose-codemap.yml logs codemap

# AI service logs
docker-compose -f docker-compose-codemap.yml logs ollama

# System resource usage
docker stats
```

### **Metrics Endpoints:**
- **CodeMap**: `http://localhost:3002/api/metrics`
- **Ollama**: `http://localhost:11434/api/tags`
- **Container Stats**: `docker stats`

## 🎯 Use Cases

### **Individual Developer:**
- **Local experimentation** with memory workflows
- **Offline development** without internet dependency
- **Private knowledge graphs** for personal projects

### **Development Team:**
- **Shared exploration** of complex architectures
- **Collaborative debugging** with live knowledge updates
- **Documentation generation** from interactive sessions

### **Research Organization:**
- **Academic research** into AI-augmented workflows
- **Knowledge management** for complex domains
- **Interactive learning** environments

### **Enterprise Deployment:**
- **Internal tools** for system architecture exploration
- **Knowledge bases** for large codebases
- **Training platforms** for new team members

## 🚀 Advanced Configuration

### **Custom Ollama Models:**
```yaml
services:
  ollama:
    environment:
      - OLLAMA_HOST=0.0.0.0
    command: ["ollama", "run", "your-custom-model"]
    volumes:
      - ./custom-models:/root/.ollama/models
```

### **External Database:**
```yaml
services:
  codemap:
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/codemap
    depends_on:
      - db

  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: codemap
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
```

### **CI/CD Integration:**
```yaml
# .github/workflows/docker.yml
name: Build and Test CodeMap
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build containers
        run: docker-compose -f docker-compose-codemap.yml build
      - name: Run tests
        run: docker-compose -f docker-compose-codemap.yml run --rm codemap npm test
```

## 📚 Next Steps

1. **Run the System**: `npm run docker:start`
2. **Explore Features**: Click through the interactive knowledge graph
3. **Customize Content**: Modify memory data for your domain
4. **Extend Functionality**: Add custom plugins and integrations
5. **Scale Up**: Deploy multiple instances for team collaboration

---

**Containerized intelligence, zero external dependencies, infinite exploration possibilities.** 🐳🚀🧠
