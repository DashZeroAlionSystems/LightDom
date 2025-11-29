# Container Architecture & Communication Patterns

## 🎯 Overview

This document outlines the container architecture for the LightDom DeepSeek Campaign Management System, including bi-directional communication patterns, orchestration strategies, and resource management.

## 📦 Container Architecture

### System Architecture Diagram

```
┌────────────────────────────────────────────────────────────────┐
│                     Load Balancer (Nginx)                      │
│                         Port 80/443                            │
└──────────────┬──────────────────┬──────────────────────────────┘
               │                  │
               ▼                  ▼
┌──────────────────────┐  ┌──────────────────────┐
│   Frontend Container │  │   API Container      │
│   React + Vite       │  │   Express.js         │
│   Port 3000          │  │   Port 3001          │
└──────────────────────┘  └──────────┬───────────┘
                                     │
               ┌─────────────────────┼─────────────────────┐
               │                     │                     │
               ▼                     ▼                     ▼
┌──────────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  DeepSeek Container  │  │  Database        │  │  Blockchain Node │
│  Ollama + Models     │  │  PostgreSQL      │  │  Hardhat         │
│  Port 11434          │  │  Port 5432       │  │  Port 8545       │
└──────────────────────┘  └──────────────────┘  └──────────────────┘
               │                     │                     │
               │                     │                     │
               ▼                     ▼                     ▼
┌──────────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  Workflow Engine     │  │  Redis Cache     │  │  n8n Automation  │
│  Campaign Executor   │  │  Port 6379       │  │  Port 5678       │
│  Port 3002           │  └──────────────────┘  └──────────────────┘
└──────────────────────┘
               │
               ▼
┌──────────────────────┐
│  Message Queue       │
│  RabbitMQ/Redis      │
│  Port 5672           │
└──────────────────────┘
```

## 🐳 Docker Compose Configuration

### Complete docker-compose.yml

```yaml
version: '3.8'

services:
  # Frontend Container
  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    container_name: lightdom-frontend
    ports:
      - "3000:3000"
    environment:
      - VITE_API_URL=http://api:3001
      - VITE_WS_URL=ws://api:3001
    volumes:
      - ./frontend:/app
      - /app/node_modules
    depends_on:
      - api
    networks:
      - lightdom-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000"]
      interval: 30s
      timeout: 10s
      retries: 3

  # API Container
  api:
    build:
      context: .
      dockerfile: Dockerfile.api
    container_name: lightdom-api
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - DB_HOST=postgres
      - DB_PORT=5432
      - DB_NAME=lightdom
      - DB_USER=postgres
      - DB_PASSWORD=${DB_PASSWORD}
      - REDIS_URL=redis://redis:6379
      - OLLAMA_URL=http://ollama:11434
      - RABBITMQ_URL=amqp://rabbitmq:5672
    volumes:
      - ./api:/app
      - /app/node_modules
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_started
      rabbitmq:
        condition: service_healthy
    networks:
      - lightdom-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # DeepSeek/Ollama Container
  ollama:
    image: ollama/ollama:latest
    container_name: lightdom-ollama
    ports:
      - "11434:11434"
    volumes:
      - ollama-models:/root/.ollama
    environment:
      - OLLAMA_MODELS=/root/.ollama/models
    networks:
      - lightdom-network
    restart: unless-stopped
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: all
              capabilities: [gpu]
    command: serve

  # PostgreSQL Database
  postgres:
    image: postgres:15-alpine
    container_name: lightdom-postgres
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_DB=lightdom
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=${DB_PASSWORD}
      - PGDATA=/var/lib/postgresql/data/pgdata
    volumes:
      - postgres-data:/var/lib/postgresql/data
      - ./database:/docker-entrypoint-initdb.d
    networks:
      - lightdom-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Redis Cache
  redis:
    image: redis:7-alpine
    container_name: lightdom-redis
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    networks:
      - lightdom-network
    restart: unless-stopped
    command: redis-server --appendonly yes

  # RabbitMQ Message Queue
  rabbitmq:
    image: rabbitmq:3-management-alpine
    container_name: lightdom-rabbitmq
    ports:
      - "5672:5672"
      - "15672:15672"
    environment:
      - RABBITMQ_DEFAULT_USER=lightdom
      - RABBITMQ_DEFAULT_PASS=${RABBITMQ_PASSWORD}
    volumes:
      - rabbitmq-data:/var/lib/rabbitmq
    networks:
      - lightdom-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "rabbitmq-diagnostics", "ping"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Workflow Engine
  workflow-engine:
    build:
      context: .
      dockerfile: Dockerfile.workflow
    container_name: lightdom-workflow-engine
    ports:
      - "3002:3002"
    environment:
      - NODE_ENV=production
      - DB_HOST=postgres
      - DB_PORT=5432
      - REDIS_URL=redis://redis:6379
      - RABBITMQ_URL=amqp://rabbitmq:5672
    volumes:
      - ./workflow-engine:/app
      - /app/node_modules
    depends_on:
      - postgres
      - redis
      - rabbitmq
    networks:
      - lightdom-network
    restart: unless-stopped

  # n8n Automation
  n8n:
    image: n8nio/n8n:latest
    container_name: lightdom-n8n
    ports:
      - "5678:5678"
    environment:
      - DB_TYPE=postgresdb
      - DB_POSTGRESDB_HOST=postgres
      - DB_POSTGRESDB_PORT=5432
      - DB_POSTGRESDB_DATABASE=n8n
      - DB_POSTGRESDB_USER=postgres
      - DB_POSTGRESDB_PASSWORD=${DB_PASSWORD}
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=${N8N_PASSWORD}
    volumes:
      - n8n-data:/home/node/.n8n
    depends_on:
      - postgres
    networks:
      - lightdom-network
    restart: unless-stopped

  # Blockchain Node
  blockchain:
    build:
      context: .
      dockerfile: Dockerfile.blockchain
    container_name: lightdom-blockchain
    ports:
      - "8545:8545"
    volumes:
      - blockchain-data:/data
      - ./contracts:/contracts
    networks:
      - lightdom-network
    restart: unless-stopped

  # Nginx Load Balancer
  nginx:
    image: nginx:alpine
    container_name: lightdom-nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - frontend
      - api
    networks:
      - lightdom-network
    restart: unless-stopped

networks:
  lightdom-network:
    driver: bridge

volumes:
  postgres-data:
  redis-data:
  rabbitmq-data:
  ollama-models:
  n8n-data:
  blockchain-data:
```

## 🔄 Bi-Directional Communication Patterns

### 1. **HTTP REST API** (Request-Response)

**Use Case**: Client-server communication, CRUD operations

```typescript
// API Container → Frontend Container
// Request: GET /api/campaigns
// Response: { campaigns: [...] }

// Frontend Container → API Container
fetch('http://api:3001/api/campaigns')
  .then(res => res.json())
  .then(campaigns => console.log(campaigns));
```

---

### 2. **WebSocket** (Bi-directional Real-Time)

**Use Case**: Real-time updates, chat, live metrics

```typescript
// API Container
import { Server } from 'socket.io';
const io = new Server(server);

io.on('connection', (socket) => {
  console.log('Client connected');
  
  // Send to client
  socket.emit('campaign:update', { id: '123', progress: 75 });
  
  // Receive from client
  socket.on('campaign:action', (data) => {
    console.log('Action received:', data);
  });
});

// Frontend Container
import { io } from 'socket.io-client';
const socket = io('http://api:3001');

// Receive from server
socket.on('campaign:update', (data) => {
  console.log('Update:', data);
});

// Send to server
socket.emit('campaign:action', { action: 'pause', campaignId: '123' });
```

---

### 3. **Message Queue** (Async Task Processing)

**Use Case**: Background jobs, workflow execution, event-driven architecture

```typescript
// Producer (API Container)
import amqp from 'amqplib';

const connection = await amqp.connect('amqp://rabbitmq:5672');
const channel = await connection.createChannel();
const queue = 'workflow-tasks';

await channel.assertQueue(queue, { durable: true });

// Publish message
channel.sendToQueue(queue, Buffer.from(JSON.stringify({
  workflowId: 'wf-123',
  action: 'execute',
  data: { ... }
})), { persistent: true });

// Consumer (Workflow Engine Container)
channel.consume(queue, async (msg) => {
  if (msg) {
    const task = JSON.parse(msg.content.toString());
    console.log('Processing:', task);
    
    // Execute workflow
    await executeWorkflow(task.workflowId, task.data);
    
    // Acknowledge
    channel.ack(msg);
  }
}, { noAck: false });
```

---

### 4. **Redis Pub/Sub** (Event Broadcasting)

**Use Case**: Real-time notifications, cache invalidation, distributed events

```typescript
// Publisher (Any Container)
import Redis from 'ioredis';
const redis = new Redis('redis://redis:6379');

await redis.publish('campaign:events', JSON.stringify({
  type: 'status:change',
  campaignId: '123',
  status: 'completed'
}));

// Subscriber (Multiple Containers)
const subscriber = new Redis('redis://redis:6379');

subscriber.subscribe('campaign:events', (err, count) => {
  console.log(`Subscribed to ${count} channels`);
});

subscriber.on('message', (channel, message) => {
  const event = JSON.parse(message);
  console.log('Event:', event);
  
  // Handle event
  handleCampaignEvent(event);
});
```

---

### 5. **gRPC** (High-Performance RPC)

**Use Case**: Service-to-service communication, microservices

```typescript
// Workflow Engine Service
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';

const PROTO_PATH = './workflow.proto';
const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const workflowProto = grpc.loadPackageDefinition(packageDefinition);

const server = new grpc.Server();

server.addService(workflowProto.WorkflowService.service, {
  executeWorkflow: async (call, callback) => {
    const { workflowId } = call.request;
    const result = await runWorkflow(workflowId);
    callback(null, { success: true, result });
  }
});

server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), () => {
  server.start();
});

// API Container (Client)
const client = new workflowProto.WorkflowService(
  'workflow-engine:50051',
  grpc.credentials.createInsecure()
);

client.executeWorkflow({ workflowId: 'wf-123' }, (err, response) => {
  console.log('Result:', response);
});
```

---

## 🎯 Communication Decision Matrix

| Pattern | Latency | Throughput | Complexity | Use Case |
|---------|---------|------------|------------|----------|
| HTTP REST | Medium | Medium | Low | CRUD operations |
| WebSocket | Low | Medium | Medium | Real-time updates |
| Message Queue | High | High | Medium | Background jobs |
| Redis Pub/Sub | Low | High | Low | Event broadcasting |
| gRPC | Very Low | Very High | High | Service-to-service |

---

## 🔧 Container Orchestration

### Kubernetes Configuration

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: lightdom-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: lightdom-api
  template:
    metadata:
      labels:
        app: lightdom-api
    spec:
      containers:
      - name: api
        image: lightdom/api:latest
        ports:
        - containerPort: 3001
        env:
        - name: DB_HOST
          value: postgres-service
        - name: REDIS_URL
          value: redis://redis-service:6379
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3001
          initialDelaySeconds: 5
          periodSeconds: 5

---
apiVersion: v1
kind: Service
metadata:
  name: lightdom-api-service
spec:
  selector:
    app: lightdom-api
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3001
  type: LoadBalancer
```

---

## 📊 Resource Management

### CPU & Memory Limits

```yaml
# docker-compose resource limits
services:
  api:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G
  
  ollama:
    deploy:
      resources:
        limits:
          cpus: '4'
          memory: 8G
        reservations:
          cpus: '2'
          memory: 4G
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]
```

### Auto-Scaling Configuration

```yaml
# HPA for Kubernetes
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: lightdom-api-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: lightdom-api
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

---

## 🔒 Security Best Practices

### 1. **Network Isolation**

```yaml
# Separate networks for different layers
networks:
  frontend-network:
  backend-network:
  database-network:

services:
  frontend:
    networks:
      - frontend-network
  
  api:
    networks:
      - frontend-network
      - backend-network
  
  postgres:
    networks:
      - backend-network
```

### 2. **Secrets Management**

```bash
# Using Docker secrets
echo "postgres_password" | docker secret create db_password -

# In docker-compose.yml
services:
  postgres:
    secrets:
      - db_password
    environment:
      - POSTGRES_PASSWORD_FILE=/run/secrets/db_password

secrets:
  db_password:
    external: true
```

### 3. **Container Security**

```dockerfile
# Use non-root user
FROM node:18-alpine
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001
USER nodejs

# Read-only filesystem
docker run --read-only --tmpfs /tmp lightdom/api
```

---

## 🚀 Deployment Strategies

### 1. **Rolling Update**

```bash
# Update containers one at a time
docker-compose up -d --scale api=3 --no-recreate
docker-compose up -d --scale api=3 --no-deps api
```

### 2. **Blue-Green Deployment**

```yaml
# docker-compose.blue-green.yml
services:
  api-blue:
    image: lightdom/api:v1.0
    ...
  
  api-green:
    image: lightdom/api:v1.1
    ...
  
  nginx:
    environment:
      - ACTIVE_ENV=blue  # or green
```

### 3. **Canary Deployment**

```yaml
# 90% traffic to stable, 10% to canary
services:
  api-stable:
    deploy:
      replicas: 9
  
  api-canary:
    deploy:
      replicas: 1
```

---

## 📈 Monitoring & Logging

### Prometheus Metrics

```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'lightdom-api'
    static_configs:
      - targets: ['api:3001']
  
  - job_name: 'lightdom-workflow'
    static_configs:
      - targets: ['workflow-engine:3002']
```

### Centralized Logging

```yaml
# ELK Stack
services:
  elasticsearch:
    image: elasticsearch:8.0.0
    ...
  
  logstash:
    image: logstash:8.0.0
    ...
  
  kibana:
    image: kibana:8.0.0
    ...
```

---

## 🎯 Summary

This container architecture provides:
- ✅ **Scalability**: Horizontal scaling with load balancing
- ✅ **Reliability**: Health checks and auto-restart
- ✅ **Performance**: Resource limits and GPU support
- ✅ **Security**: Network isolation and secrets management
- ✅ **Communication**: Multiple patterns for different needs
- ✅ **Monitoring**: Comprehensive logging and metrics

**Recommended Starting Point**: Use docker-compose for development, migrate to Kubernetes for production scaling.
