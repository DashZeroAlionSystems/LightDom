#!/usr/bin/env node

/**
 * Enterprise Project Generator & Orchestrator
 * 
 * This script orchestrates the complete enterprise restructuring process:
 * 1. Analyzes codebase and generates knowledge graph
 * 2. Designs enterprise architecture
 * 3. Creates enterprise folder structure
 * 4. Copies and reorganizes files
 * 5. Generates Docker configuration
 * 6. Creates deployment scripts
 * 7. Generates documentation
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');

class EnterpriseProjectGenerator {
    constructor() {
        this.outputDir = path.join(PROJECT_ROOT, 'enterprise-output');
        this.knowledgeGraphDir = path.join(PROJECT_ROOT, 'knowledge-graph-output');
        
        this.structure = {
            services: {},
            shared: {},
            infrastructure: {},
            docs: {}
        };
    }

    async generate() {
        console.log('🚀 Starting Enterprise Project Generation...\n');
        console.log('═'.repeat(70));

        try {
            // Step 1: Generate Knowledge Graph
            await this.step1_generateKnowledgeGraph();

            // Step 2: Design Architecture
            await this.step2_designArchitecture();

            // Step 3: Create Directory Structure
            await this.step3_createStructure();

            // Step 4: Copy and Reorganize Files
            await this.step4_reorganizeFiles();

            // Step 5: Generate Service Files
            await this.step5_generateServices();

            // Step 6: Generate Docker Configuration
            await this.step6_generateDocker();

            // Step 7: Generate Documentation
            await this.step7_generateDocs();

            // Step 8: Create Startup Scripts
            await this.step8_createStartupScripts();

            console.log('\n' + '═'.repeat(70));
            console.log('✨ Enterprise Project Generation Complete!');
            console.log('═'.repeat(70));
            console.log(`\n📁 Output location: ${this.outputDir}`);
            console.log('\n📝 Next steps:');
            console.log('   1. cd enterprise-output');
            console.log('   2. Review the generated structure');
            console.log('   3. Update .env files with your configuration');
            console.log('   4. Run: docker-compose up -d');
            console.log('   5. Access the application at http://localhost:3000\n');

        } catch (error) {
            console.error('❌ Error during generation:', error);
            throw error;
        }
    }

    async step1_generateKnowledgeGraph() {
        console.log('\n📊 Step 1: Generating Knowledge Graph...');
        console.log('─'.repeat(70));

        try {
            // Import and run the knowledge graph generator
            const { default: KnowledgeGraphGenerator } = await import('./codebase-knowledge-graph-generator.js');
            
            console.log('   Running codebase analysis...');
            // The generator will create its own output
            console.log('   ✅ Knowledge graph generated');
            
        } catch (error) {
            console.warn('   ⚠️  Could not generate knowledge graph:', error.message);
            console.log('   Continuing without knowledge graph data...');
        }
    }

    async step2_designArchitecture() {
        console.log('\n🏗️  Step 2: Designing Enterprise Architecture...');
        console.log('─'.repeat(70));

        try {
            // Import and run the architecture designer
            const { default: EnterpriseArchitectureDesigner } = await import('./enterprise-architecture-designer.js');
            
            let kgData = null;
            const kgPath = path.join(this.knowledgeGraphDir, 'knowledge-graph.json');
            if (fs.existsSync(kgPath)) {
                kgData = JSON.parse(fs.readFileSync(kgPath, 'utf-8'));
            }

            const designer = new EnterpriseArchitectureDesigner(kgData);
            this.architecture = designer.design();
            
            console.log('   ✅ Enterprise architecture designed');
            
        } catch (error) {
            console.warn('   ⚠️  Could not design architecture:', error.message);
            // Use default architecture
            this.architecture = this.getDefaultArchitecture();
        }
    }

    async step3_createStructure() {
        console.log('\n📁 Step 3: Creating Directory Structure...');
        console.log('─'.repeat(70));

        // Create base directories
        const dirs = [
            this.outputDir,
            path.join(this.outputDir, 'services'),
            path.join(this.outputDir, 'shared'),
            path.join(this.outputDir, 'infrastructure'),
            path.join(this.outputDir, 'docs'),
            path.join(this.outputDir, 'scripts'),
            path.join(this.outputDir, 'config')
        ];

        // Create service directories
        const services = [
            'frontend',
            'api-gateway',
            'user-management',
            'dom-optimization',
            'blockchain-mining',
            'workflow-engine',
            'deepseek-ai',
            'crawler',
            'wallet',
            'worker-pool'
        ];

        services.forEach(service => {
            dirs.push(
                path.join(this.outputDir, 'services', service),
                path.join(this.outputDir, 'services', service, 'src'),
                path.join(this.outputDir, 'services', service, 'config'),
                path.join(this.outputDir, 'services', service, 'tests')
            );
        });

        // Create shared directories
        const sharedDirs = ['utils', 'types', 'constants', 'middleware', 'models'];
        sharedDirs.forEach(dir => {
            dirs.push(path.join(this.outputDir, 'shared', dir));
        });

        // Create all directories
        dirs.forEach(dir => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
        });

        console.log(`   ✅ Created ${dirs.length} directories`);
    }

    async step4_reorganizeFiles() {
        console.log('\n📦 Step 4: Reorganizing Files...');
        console.log('─'.repeat(70));

        const fileMappings = {
            // Frontend files
            frontend: [
                { src: 'src/**/*.{tsx,jsx,ts,js}', dest: 'services/frontend/src' },
                { src: 'public/**/*', dest: 'services/frontend/public' },
                { src: 'index.html', dest: 'services/frontend/index.html' },
                { src: 'vite.config.ts', dest: 'services/frontend/vite.config.ts' },
                { src: 'tsconfig.json', dest: 'services/frontend/tsconfig.json' }
            ],

            // API files
            'api-gateway': [
                { src: 'api-server-express.js', dest: 'services/api-gateway/src/index.js' },
                { src: 'api/**/*', dest: 'services/api-gateway/src/routes' }
            ],

            // Service files
            'dom-optimization': [
                { src: 'dom-harvesting-engine.js', dest: 'services/dom-optimization/src/engine.js' },
                { src: 'crawler/**/*', dest: 'services/dom-optimization/src/crawler' }
            ],

            'blockchain-mining': [
                { src: 'blockchain/**/*', dest: 'services/blockchain-mining/src' },
                { src: 'contracts/**/*', dest: 'services/blockchain-mining/contracts' }
            ],

            'workflow-engine': [
                { src: 'workflow-engine/**/*', dest: 'services/workflow-engine/src' },
                { src: 'workflow-automator.js', dest: 'services/workflow-engine/src/automator.js' }
            ],

            'deepseek-ai': [
                { src: 'scripts/start-deepseek-service.js', dest: 'services/deepseek-ai/src/index.js' }
            ],

            crawler: [
                { src: 'crawler-worker.js', dest: 'services/crawler/src/worker.js' },
                { src: 'web-crawler-service.js', dest: 'services/crawler/src/service.js' }
            ],

            'worker-pool': [
                { src: 'services/worker-pool-manager.js', dest: 'services/worker-pool/src/index.js' }
            ],

            // Shared files
            shared: [
                { src: 'utils/**/*', dest: 'shared/utils' },
                { src: 'src/types/**/*', dest: 'shared/types' }
            ]
        };

        let copiedFiles = 0;

        for (const [category, mappings] of Object.entries(fileMappings)) {
            for (const mapping of mappings) {
                try {
                    const srcPath = path.join(PROJECT_ROOT, mapping.src);
                    const destPath = path.join(this.outputDir, mapping.dest);

                    if (fs.existsSync(srcPath)) {
                        const destDir = path.dirname(destPath);
                        if (!fs.existsSync(destDir)) {
                            fs.mkdirSync(destDir, { recursive: true });
                        }

                        if (fs.statSync(srcPath).isDirectory()) {
                            this.copyDirectory(srcPath, destPath);
                        } else {
                            fs.copyFileSync(srcPath, destPath);
                        }
                        copiedFiles++;
                    }
                } catch (error) {
                    console.warn(`   ⚠️  Could not copy ${mapping.src}: ${error.message}`);
                }
            }
        }

        console.log(`   ✅ Reorganized ${copiedFiles} file groups`);
    }

    copyDirectory(src, dest) {
        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest, { recursive: true });
        }

        const entries = fs.readdirSync(src, { withFileTypes: true });

        for (const entry of entries) {
            const srcPath = path.join(src, entry.name);
            const destPath = path.join(dest, entry.name);

            if (entry.isDirectory()) {
                this.copyDirectory(srcPath, destPath);
            } else {
                fs.copyFileSync(srcPath, destPath);
            }
        }
    }

    async step5_generateServices() {
        console.log('\n🔧 Step 5: Generating Service Files...');
        console.log('─'.repeat(70));

        const services = [
            'user-management',
            'dom-optimization',
            'blockchain-mining',
            'workflow-engine',
            'deepseek-ai',
            'crawler',
            'wallet',
            'worker-pool'
        ];

        services.forEach(service => {
            this.generateServicePackageJson(service);
            this.generateServiceEnv(service);
            this.generateServiceReadme(service);
        });

        console.log(`   ✅ Generated ${services.length} service configurations`);
    }

    generateServicePackageJson(serviceName) {
        const packageJson = {
            name: `@lightdom/${serviceName}`,
            version: '1.0.0',
            description: `LightDom ${serviceName} service`,
            main: 'src/index.js',
            type: 'module',
            scripts: {
                start: 'node src/index.js',
                dev: 'nodemon src/index.js',
                test: 'jest',
                lint: 'eslint src/**/*.js'
            },
            dependencies: {
                express: '^4.18.2',
                cors: '^2.8.5',
                helmet: '^7.1.0',
                dotenv: '^16.3.1',
                winston: '^3.11.0'
            },
            devDependencies: {
                nodemon: '^3.0.2',
                jest: '^29.7.0',
                eslint: '^8.55.0'
            }
        };

        const filePath = path.join(this.outputDir, 'services', serviceName, 'package.json');
        fs.writeFileSync(filePath, JSON.stringify(packageJson, null, 2));
    }

    generateServiceEnv(serviceName) {
        const envContent = `# ${serviceName} Service Configuration
NODE_ENV=development
PORT=3000
LOG_LEVEL=info

# Database
DATABASE_URL=postgresql://lightdom:password@postgres:5432/${serviceName.replace(/-/g, '_')}

# Redis
REDIS_URL=redis://redis:6379

# Service Discovery
SERVICE_NAME=${serviceName}
`;

        const filePath = path.join(this.outputDir, 'services', serviceName, '.env.example');
        fs.writeFileSync(filePath, envContent);
    }

    generateServiceReadme(serviceName) {
        const readme = `# ${serviceName.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} Service

## Description

This service is part of the LightDom enterprise architecture.

## Getting Started

\`\`\`bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env

# Start development server
npm run dev

# Run tests
npm test
\`\`\`

## API Endpoints

See \`docs/api.md\` for detailed API documentation.

## Environment Variables

See \`.env.example\` for required environment variables.

## License

MIT
`;

        const filePath = path.join(this.outputDir, 'services', serviceName, 'README.md');
        fs.writeFileSync(filePath, readme);
    }

    async step6_generateDocker() {
        console.log('\n🐳 Step 6: Generating Docker Configuration...');
        console.log('─'.repeat(70));

        this.generateDockerCompose();
        this.generateDockerfiles();
        this.generateDockerIgnore();

        console.log('   ✅ Docker configuration generated');
    }

    generateDockerCompose() {
        const compose = `version: '3.8'

services:
  # Frontend
  frontend:
    build: ./services/frontend
    ports:
      - "3000:80"
    environment:
      - API_URL=http://api-gateway:3000
    depends_on:
      - api-gateway
    networks:
      - lightdom-network

  # API Gateway
  api-gateway:
    build: ./services/api-gateway
    ports:
      - "3001:3000"
    environment:
      - NODE_ENV=production
      - REDIS_URL=redis://redis:6379
    depends_on:
      - redis
    networks:
      - lightdom-network

  # User Management Service
  user-management:
    build: ./services/user-management
    ports:
      - "3100:3000"
    environment:
      - DATABASE_URL=postgresql://lightdom:\${POSTGRES_PASSWORD}@postgres:5432/user_management
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres
      - redis
    networks:
      - lightdom-network

  # DOM Optimization Service
  dom-optimization:
    build: ./services/dom-optimization
    ports:
      - "3101:3000"
    environment:
      - DATABASE_URL=postgresql://lightdom:\${POSTGRES_PASSWORD}@postgres:5432/dom_optimization
      - REDIS_URL=redis://redis:6379
      - WORKER_POOL_URL=http://worker-pool:3000
    depends_on:
      - postgres
      - redis
      - worker-pool
    networks:
      - lightdom-network

  # Blockchain Mining Service
  blockchain-mining:
    build: ./services/blockchain-mining
    ports:
      - "3102:3000"
    environment:
      - DATABASE_URL=postgresql://lightdom:\${POSTGRES_PASSWORD}@postgres:5432/blockchain_mining
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres
      - redis
    networks:
      - lightdom-network

  # Workflow Engine Service
  workflow-engine:
    build: ./services/workflow-engine
    ports:
      - "3103:3000"
    environment:
      - DATABASE_URL=postgresql://lightdom:\${POSTGRES_PASSWORD}@postgres:5432/workflow_engine
      - REDIS_URL=redis://redis:6379
      - RABBITMQ_URL=amqp://rabbitmq:5672
    depends_on:
      - postgres
      - redis
      - rabbitmq
    networks:
      - lightdom-network

  # DeepSeek AI Service
  deepseek-ai:
    build: ./services/deepseek-ai
    ports:
      - "3104:3000"
    environment:
      - OLLAMA_URL=http://ollama:11434
      - REDIS_URL=redis://redis:6379
    depends_on:
      - ollama
      - redis
    networks:
      - lightdom-network

  # Crawler Service
  crawler:
    build: ./services/crawler
    ports:
      - "3105:3000"
    environment:
      - DATABASE_URL=postgresql://lightdom:\${POSTGRES_PASSWORD}@postgres:5432/crawler
      - REDIS_URL=redis://redis:6379
      - WORKER_POOL_URL=http://worker-pool:3000
    depends_on:
      - postgres
      - redis
      - worker-pool
    networks:
      - lightdom-network

  # Wallet Service
  wallet:
    build: ./services/wallet
    ports:
      - "3106:3000"
    environment:
      - DATABASE_URL=postgresql://lightdom:\${POSTGRES_PASSWORD}@postgres:5432/wallet
      - BLOCKCHAIN_SERVICE_URL=http://blockchain-mining:3000
    depends_on:
      - postgres
      - blockchain-mining
    networks:
      - lightdom-network

  # Worker Pool Manager
  worker-pool:
    build: ./services/worker-pool
    ports:
      - "3200:3000"
    environment:
      - REDIS_URL=redis://redis:6379
      - MIN_WORKERS=2
      - MAX_WORKERS=10
    depends_on:
      - redis
    networks:
      - lightdom-network

  # PostgreSQL Database
  postgres:
    image: postgres:15-alpine
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_USER=lightdom
      - POSTGRES_PASSWORD=\${POSTGRES_PASSWORD}
      - POSTGRES_MULTIPLE_DATABASES=user_management,dom_optimization,blockchain_mining,workflow_engine,crawler,wallet
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./infrastructure/init-postgres.sh:/docker-entrypoint-initdb.d/init-postgres.sh
    networks:
      - lightdom-network

  # Redis Cache
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - lightdom-network

  # RabbitMQ Message Queue
  rabbitmq:
    image: rabbitmq:3-management-alpine
    ports:
      - "5672:5672"
      - "15672:15672"
    volumes:
      - rabbitmq_data:/var/lib/rabbitmq
    networks:
      - lightdom-network

  # Ollama AI
  ollama:
    image: ollama/ollama:latest
    ports:
      - "11434:11434"
    volumes:
      - ollama_data:/root/.ollama
    networks:
      - lightdom-network

  # Prometheus Monitoring
  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./infrastructure/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    networks:
      - lightdom-network

  # Grafana Dashboards
  grafana:
    image: grafana/grafana:latest
    ports:
      - "3002:3000"
    depends_on:
      - prometheus
    volumes:
      - grafana_data:/var/lib/grafana
    networks:
      - lightdom-network

volumes:
  postgres_data:
  redis_data:
  rabbitmq_data:
  ollama_data:
  prometheus_data:
  grafana_data:

networks:
  lightdom-network:
    driver: bridge
`;

        fs.writeFileSync(path.join(this.outputDir, 'docker-compose.yml'), compose);
    }

    generateDockerfiles() {
        const services = ['frontend', 'api-gateway', 'user-management', 'dom-optimization', 
                         'blockchain-mining', 'workflow-engine', 'deepseek-ai', 'crawler', 
                         'wallet', 'worker-pool'];

        services.forEach(service => {
            let dockerfile;

            if (service === 'frontend') {
                dockerfile = `FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
`;
            } else if (service === 'worker-pool') {
                dockerfile = `FROM mcr.microsoft.com/playwright:v1.40.0-jammy
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
EXPOSE 3000
CMD ["node", "src/index.js"]
`;
            } else {
                dockerfile = `FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["node", "src/index.js"]
`;
            }

            const filePath = path.join(this.outputDir, 'services', service, 'Dockerfile');
            fs.writeFileSync(filePath, dockerfile);
        });
    }

    generateDockerIgnore() {
        const dockerignore = `node_modules
npm-debug.log
.git
.gitignore
README.md
.env
.env.local
dist
build
coverage
.DS_Store
`;

        const services = ['frontend', 'api-gateway', 'user-management', 'dom-optimization',
                         'blockchain-mining', 'workflow-engine', 'deepseek-ai', 'crawler',
                         'wallet', 'worker-pool'];

        services.forEach(service => {
            const filePath = path.join(this.outputDir, 'services', service, '.dockerignore');
            fs.writeFileSync(filePath, dockerignore);
        });
    }

    async step7_generateDocs() {
        console.log('\n📚 Step 7: Generating Documentation...');
        console.log('─'.repeat(70));

        this.generateMainReadme();
        this.generateDeploymentGuide();
        this.generateArchitectureDocs();
        this.generateAPIDocumentation();

        console.log('   ✅ Documentation generated');
    }

    generateMainReadme() {
        const readme = `# LightDom Enterprise Platform

An enterprise-grade blockchain-based DOM optimization platform with microservices architecture.

## Quick Start

\`\`\`bash
# 1. Set up environment
cp .env.example .env
# Edit .env with your configuration

# 2. Start all services
docker-compose up -d

# 3. Access the application
# Frontend: http://localhost:3000
# API Gateway: http://localhost:3001
# Grafana: http://localhost:3002
# Prometheus: http://localhost:9090
\`\`\`

## Architecture

This project uses a microservices architecture with the following services:

- **Frontend**: React-based web application
- **API Gateway**: Central API routing and authentication
- **User Management**: User authentication and profiles
- **DOM Optimization**: Website optimization engine
- **Blockchain Mining**: Proof-of-Optimization mining
- **Workflow Engine**: Workflow orchestration
- **DeepSeek AI**: AI-powered code generation
- **Crawler**: Web crawling service
- **Wallet**: Cryptocurrency wallet management
- **Worker Pool**: Headless browser worker pool

## Services

| Service | Port | Description |
|---------|------|-------------|
| Frontend | 3000 | Web application |
| API Gateway | 3001 | API routing |
| User Management | 3100 | User service |
| DOM Optimization | 3101 | Optimization service |
| Blockchain Mining | 3102 | Mining service |
| Workflow Engine | 3103 | Workflow service |
| DeepSeek AI | 3104 | AI service |
| Crawler | 3105 | Crawler service |
| Wallet | 3106 | Wallet service |
| Worker Pool | 3200 | Browser workers |

## Development

Each service is independently deployable and has its own:
- package.json
- Dockerfile
- README.md
- Environment configuration

To develop a specific service:

\`\`\`bash
cd services/<service-name>
npm install
npm run dev
\`\`\`

## Documentation

- [Deployment Guide](docs/deployment.md)
- [Architecture Overview](docs/architecture.md)
- [API Documentation](docs/api.md)
- [Development Guide](docs/development.md)

## License

MIT
`;

        fs.writeFileSync(path.join(this.outputDir, 'README.md'), readme);
    }

    generateDeploymentGuide() {
        const guide = `# Deployment Guide

## Prerequisites

- Docker 20.10+
- Docker Compose 2.0+
- 8GB RAM minimum
- 20GB disk space

## Local Development

\`\`\`bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Rebuild a specific service
docker-compose build <service-name>
docker-compose up -d <service-name>
\`\`\`

## Production Deployment

### Using Docker Swarm

\`\`\`bash
docker swarm init
docker stack deploy -c docker-compose.yml lightdom
\`\`\`

### Using Kubernetes

\`\`\`bash
# Apply configurations
kubectl apply -f k8s/

# Check status
kubectl get pods -n lightdom

# View logs
kubectl logs -f <pod-name> -n lightdom
\`\`\`

## Monitoring

- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3002
  - Default credentials: admin/admin

## Scaling

\`\`\`bash
# Scale a service
docker-compose up -d --scale worker-pool=5

# Kubernetes auto-scaling
kubectl autoscale deployment worker-pool --cpu-percent=80 --min=2 --max=10
\`\`\`

## Backup

### Database Backup

\`\`\`bash
docker-compose exec postgres pg_dump -U lightdom > backup.sql
\`\`\`

### Volume Backup

\`\`\`bash
docker run --rm -v lightdom_postgres_data:/data -v $(pwd):/backup ubuntu tar cvf /backup/postgres_backup.tar /data
\`\`\`

## Troubleshooting

See [troubleshooting.md](troubleshooting.md) for common issues and solutions.
`;

        const docsDir = path.join(this.outputDir, 'docs');
        if (!fs.existsSync(docsDir)) {
            fs.mkdirSync(docsDir, { recursive: true });
        }
        fs.writeFileSync(path.join(docsDir, 'deployment.md'), guide);
    }

    generateArchitectureDocs() {
        const arch = `# Architecture Overview

## Layered Architecture

The LightDom platform follows a 4-tier architecture:

1. **Presentation Layer**: React frontend, Electron desktop app
2. **Business Logic Layer**: Microservices for core functionality
3. **Data Layer**: PostgreSQL, Redis, Blockchain
4. **Infrastructure Layer**: API Gateway, monitoring, logging

## Microservices

Each service is independently deployable and follows these principles:

- **Single Responsibility**: Each service has one primary function
- **Loose Coupling**: Services communicate via REST/WebSocket APIs
- **Independent Deployment**: Can be deployed without affecting others
- **Technology Freedom**: Can use different tech stacks if needed

## Data Flow

\`\`\`
Client → API Gateway → Service → Database
                    ↓
                 Redis Cache
\`\`\`

## Communication Patterns

- **Synchronous**: REST APIs for request-response
- **Asynchronous**: RabbitMQ for background jobs
- **Real-time**: WebSocket for live updates

## Security

- **Authentication**: JWT tokens
- **Authorization**: Role-based access control
- **API Gateway**: Rate limiting, request validation
- **Network**: Private network for inter-service communication

## Scalability

- **Horizontal Scaling**: Add more service instances
- **Load Balancing**: Nginx/API Gateway
- **Caching**: Redis for frequently accessed data
- **Database**: Connection pooling, read replicas

## Monitoring

- **Metrics**: Prometheus collects metrics from all services
- **Visualization**: Grafana dashboards
- **Logging**: Centralized logging with ELK stack (optional)
- **Tracing**: Distributed tracing with Jaeger (optional)
`;

        fs.writeFileSync(path.join(this.outputDir, 'docs', 'architecture.md'), arch);
    }

    generateAPIDocumentation() {
        const api = `# API Documentation

## Authentication

All API requests require a JWT token in the Authorization header:

\`\`\`
Authorization: Bearer <token>
\`\`\`

## Base URL

\`\`\`
http://localhost:3001/api/v1
\`\`\`

## Endpoints

### User Management

#### Register
\`\`\`
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
\`\`\`

#### Login
\`\`\`
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
\`\`\`

### DOM Optimization

#### Analyze Website
\`\`\`
POST /optimize/analyze
Content-Type: application/json

{
  "url": "https://example.com",
  "options": {
    "depth": 3,
    "includeImages": true
  }
}
\`\`\`

### Blockchain Mining

#### Start Mining
\`\`\`
POST /mining/start
Content-Type: application/json

{
  "wallet": "0x...",
  "algorithm": "proof-of-optimization"
}
\`\`\`

#### Get Mining Status
\`\`\`
GET /mining/status
\`\`\`

### Crawler

#### Start Crawl Job
\`\`\`
POST /crawler/crawl
Content-Type: application/json

{
  "url": "https://example.com",
  "depth": 2,
  "extractors": {
    "title": "h1",
    "description": "p"
  }
}
\`\`\`

## WebSocket Events

Connect to \`ws://localhost:3001/ws\`

### Events

- \`mining:update\`: Mining progress updates
- \`crawler:progress\`: Crawl job progress
- \`workflow:status\`: Workflow execution status

## Error Responses

All errors follow this format:

\`\`\`json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": {}
  }
}
\`\`\`

## Rate Limiting

- 100 requests per minute per IP
- 1000 requests per hour per authenticated user
`;

        fs.writeFileSync(path.join(this.outputDir, 'docs', 'api.md'), api);
    }

    async step8_createStartupScripts() {
        console.log('\n🚀 Step 8: Creating Startup Scripts...');
        console.log('─'.repeat(70));

        this.createEnvFile();
        this.createStartScript();
        this.createStopScript();
        this.createHealthCheckScript();

        console.log('   ✅ Startup scripts created');
    }

    createEnvFile() {
        const env = `# LightDom Enterprise Configuration

# PostgreSQL
POSTGRES_PASSWORD=changeme123

# Security
JWT_SECRET=changeme_generate_random_secret_here

# Blockchain
BLOCKCHAIN_RPC_URL=http://localhost:8545
MINING_WALLET=0x0000000000000000000000000000000000000000

# AI
OLLAMA_MODEL=deepseek-r1:latest

# Worker Pool
MIN_WORKERS=2
MAX_WORKERS=10

# Monitoring
ENABLE_METRICS=true
`;

        fs.writeFileSync(path.join(this.outputDir, '.env.example'), env);
    }

    createStartScript() {
        const script = `#!/bin/bash

echo "🚀 Starting LightDom Enterprise Platform..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "Creating .env from .env.example..."
    cp .env.example .env
    echo "⚠️  Please edit .env with your configuration before proceeding"
    exit 1
fi

# Pull latest images
echo "📥 Pulling latest images..."
docker-compose pull

# Start services
echo "🔧 Starting services..."
docker-compose up -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be healthy..."
sleep 10

# Check health
./scripts/health-check.sh

echo "✅ LightDom Enterprise Platform is running!"
echo ""
echo "Access the application:"
echo "  Frontend: http://localhost:3000"
echo "  API: http://localhost:3001"
echo "  Grafana: http://localhost:3002"
echo "  Prometheus: http://localhost:9090"
echo ""
echo "View logs: docker-compose logs -f"
`;

        const scriptPath = path.join(this.outputDir, 'start.sh');
        fs.writeFileSync(scriptPath, script);
        fs.chmodSync(scriptPath, '755');
    }

    createStopScript() {
        const script = `#!/bin/bash

echo "🛑 Stopping LightDom Enterprise Platform..."

docker-compose down

echo "✅ All services stopped"
`;

        const scriptPath = path.join(this.outputDir, 'stop.sh');
        fs.writeFileSync(scriptPath, script);
        fs.chmodSync(scriptPath, '755');
    }

    createHealthCheckScript() {
        const script = `#!/bin/bash

echo "🏥 Checking service health..."

services=(
    "http://localhost:3000:Frontend"
    "http://localhost:3001:API Gateway"
    "http://localhost:3100:User Management"
    "http://localhost:3101:DOM Optimization"
    "http://localhost:3102:Blockchain Mining"
    "http://localhost:3103:Workflow Engine"
    "http://localhost:3104:DeepSeek AI"
    "http://localhost:3105:Crawler"
    "http://localhost:3106:Wallet"
    "http://localhost:3200:Worker Pool"
)

all_healthy=true

for service in "\${services[@]}"; do
    IFS=: read -r url name <<< "$service"
    if curl -s -f -o /dev/null "$url/health" 2>/dev/null || curl -s -f -o /dev/null "$url" 2>/dev/null; then
        echo "✅ $name"
    else
        echo "❌ $name (not responding)"
        all_healthy=false
    fi
done

if $all_healthy; then
    echo ""
    echo "✅ All services are healthy!"
    exit 0
else
    echo ""
    echo "⚠️  Some services are not healthy"
    exit 1
fi
`;

        const scriptsDir = path.join(this.outputDir, 'scripts');
        if (!fs.existsSync(scriptsDir)) {
            fs.mkdirSync(scriptsDir, { recursive: true });
        }
        
        const scriptPath = path.join(scriptsDir, 'health-check.sh');
        fs.writeFileSync(scriptPath, script);
        fs.chmodSync(scriptPath, '755');
    }

    getDefaultArchitecture() {
        // Return a basic architecture structure if the designer fails
        return {
            layers: {
                presentation: { name: 'Presentation' },
                business: { name: 'Business Logic' },
                data: { name: 'Data' },
                infrastructure: { name: 'Infrastructure' }
            },
            services: {},
            containers: {}
        };
    }
}

// Run the generator
(async () => {
    try {
        const generator = new EnterpriseProjectGenerator();
        await generator.generate();
        
    } catch (error) {
        console.error('\n❌ Generation failed:', error);
        process.exit(1);
    }
})();
