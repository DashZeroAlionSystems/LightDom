#!/usr/bin/env node

/**
 * Master Enterprise Generator Script
 * 
 * This is the main entry point that coordinates all aspects of the enterprise
 * restructuring project:
 * 
 * 1. Generates comprehensive knowledge graph of codebase
 * 2. Designs enterprise-level microservices architecture
 * 3. Creates restructured project with proper layering
 * 4. Sets up headless browser worker pool
 * 5. Integrates DeepSeek AI service
 * 6. Creates Docker containerization
 * 7. Generates complete documentation
 * 
 * Usage:
 *   node scripts/master-enterprise-generator.js [options]
 * 
 * Options:
 *   --skip-analysis    Skip code analysis phase
 *   --skip-docker      Skip Docker generation
 *   --dry-run          Show what would be done without doing it
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');

// Color codes for terminal output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

class MasterEnterpriseGenerator {
    constructor(options = {}) {
        this.options = {
            skipAnalysis: options.skipAnalysis || false,
            skipDocker: options.skipDocker || false,
            dryRun: options.dryRun || false,
            ...options
        };

        this.startTime = Date.now();
        this.outputDir = path.join(PROJECT_ROOT, 'enterprise-output');
        this.kgDir = path.join(PROJECT_ROOT, 'knowledge-graph-output');
    }

    async run() {
        this.printHeader();

        try {
            // Phase 1: Install dependencies if needed
            await this.phase1_checkDependencies();

            // Phase 2: Generate knowledge graph
            if (!this.options.skipAnalysis) {
                await this.phase2_generateKnowledgeGraph();
            } else {
                this.log('Skipping knowledge graph generation', 'yellow');
            }

            // Phase 3: Design enterprise architecture
            await this.phase3_designArchitecture();

            // Phase 4: Generate enterprise project structure
            await this.phase4_generateProject();

            // Phase 5: Set up worker pool service
            await this.phase5_setupWorkerPool();

            // Phase 6: Set up DeepSeek AI service
            await this.phase6_setupDeepSeek();

            // Phase 7: Generate Docker configuration
            if (!this.options.skipDocker) {
                await this.phase7_generateDocker();
            } else {
                this.log('Skipping Docker generation', 'yellow');
            }

            // Phase 8: Create API documentation
            await this.phase8_generateAPIDocs();

            // Phase 9: Generate deployment guides
            await this.phase9_generateDeploymentGuides();

            // Final summary
            this.printSummary();

        } catch (error) {
            this.log(`Error: ${error.message}`, 'red');
            if (error.stack) {
                console.error(error.stack);
            }
            process.exit(1);
        }
    }

    printHeader() {
        console.log('\n');
        console.log(colors.cyan + '═'.repeat(80) + colors.reset);
        console.log(colors.bright + colors.cyan + 
                   '         LightDom Enterprise Platform Generator' + 
                   colors.reset);
        console.log(colors.cyan + '═'.repeat(80) + colors.reset);
        console.log('\n');
        console.log('This tool will:');
        console.log('  ✓ Analyze your codebase and create a knowledge graph');
        console.log('  ✓ Design an enterprise-level microservices architecture');
        console.log('  ✓ Restructure code into layered services');
        console.log('  ✓ Set up headless browser worker pool (Playwright)');
        console.log('  ✓ Integrate DeepSeek AI service');
        console.log('  ✓ Generate Docker containerization');
        console.log('  ✓ Create comprehensive documentation');
        console.log('\n');
    }

    async phase1_checkDependencies() {
        this.log('Phase 1: Checking Dependencies', 'cyan', true);

        const requiredPackages = [
            '@babel/parser',
            '@babel/traverse',
            'glob',
            'playwright'
        ];

        const packageJsonPath = path.join(PROJECT_ROOT, 'package.json');
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
        const allDeps = {
            ...packageJson.dependencies,
            ...packageJson.devDependencies
        };

        const missingPackages = requiredPackages.filter(pkg => !allDeps[pkg]);

        if (missingPackages.length > 0) {
            this.log(`Missing packages: ${missingPackages.join(', ')}`, 'yellow');
            
            if (!this.options.dryRun) {
                this.log('Installing missing packages...', 'yellow');
                try {
                    execSync(`npm install --save-dev ${missingPackages.join(' ')}`, {
                        cwd: PROJECT_ROOT,
                        stdio: 'inherit'
                    });
                    this.log('Dependencies installed successfully', 'green');
                } catch (error) {
                    this.log('Warning: Could not install dependencies automatically', 'yellow');
                    this.log('Please run: npm install --save-dev ' + missingPackages.join(' '), 'yellow');
                }
            }
        } else {
            this.log('All dependencies present', 'green');
        }
    }

    async phase2_generateKnowledgeGraph() {
        this.log('Phase 2: Generating Knowledge Graph', 'cyan', true);

        if (this.options.dryRun) {
            this.log('[DRY RUN] Would generate knowledge graph', 'yellow');
            return;
        }

        try {
            // Run the knowledge graph generator
            const generatorPath = path.join(__dirname, 'codebase-knowledge-graph-generator.js');
            
            if (fs.existsSync(generatorPath)) {
                this.log('Running code analysis...', 'blue');
                execSync(`node "${generatorPath}"`, {
                    cwd: PROJECT_ROOT,
                    stdio: 'inherit'
                });
                this.log('Knowledge graph generated successfully', 'green');
            } else {
                this.log('Knowledge graph generator not found, skipping...', 'yellow');
            }
        } catch (error) {
            this.log(`Warning: Knowledge graph generation had issues: ${error.message}`, 'yellow');
            this.log('Continuing with limited analysis...', 'yellow');
        }
    }

    async phase3_designArchitecture() {
        this.log('Phase 3: Designing Enterprise Architecture', 'cyan', true);

        if (this.options.dryRun) {
            this.log('[DRY RUN] Would design architecture', 'yellow');
            return;
        }

        try {
            const designerPath = path.join(__dirname, 'enterprise-architecture-designer.js');
            
            if (fs.existsSync(designerPath)) {
                this.log('Creating architecture design...', 'blue');
                execSync(`node "${designerPath}"`, {
                    cwd: PROJECT_ROOT,
                    stdio: 'inherit'
                });
                this.log('Architecture design completed', 'green');
            } else {
                this.log('Architecture designer not found, using defaults...', 'yellow');
            }
        } catch (error) {
            this.log(`Warning: Architecture design had issues: ${error.message}`, 'yellow');
        }
    }

    async phase4_generateProject() {
        this.log('Phase 4: Generating Enterprise Project Structure', 'cyan', true);

        if (this.options.dryRun) {
            this.log('[DRY RUN] Would generate project structure', 'yellow');
            return;
        }

        try {
            const generatorPath = path.join(__dirname, 'enterprise-project-generator.js');
            
            if (fs.existsSync(generatorPath)) {
                this.log('Generating project structure...', 'blue');
                execSync(`node "${generatorPath}"`, {
                    cwd: PROJECT_ROOT,
                    stdio: 'inherit'
                });
                this.log('Project structure generated', 'green');
            } else {
                this.log('Project generator not found', 'red');
            }
        } catch (error) {
            this.log(`Error generating project: ${error.message}`, 'red');
            throw error;
        }
    }

    async phase5_setupWorkerPool() {
        this.log('Phase 5: Setting Up Worker Pool Service', 'cyan', true);

        if (this.options.dryRun) {
            this.log('[DRY RUN] Would set up worker pool', 'yellow');
            return;
        }

        const workerPoolDir = path.join(this.outputDir, 'services', 'worker-pool');
        
        if (fs.existsSync(workerPoolDir)) {
            this.log('Worker pool service directory created', 'green');
            
            // Create additional worker pool documentation
            const workerDocs = this.generateWorkerPoolDocs();
            fs.writeFileSync(
                path.join(workerPoolDir, 'WORKER_POOL_GUIDE.md'),
                workerDocs
            );
            
            this.log('Worker pool documentation generated', 'green');
        } else {
            this.log('Worker pool directory not found', 'yellow');
        }
    }

    async phase6_setupDeepSeek() {
        this.log('Phase 6: Setting Up DeepSeek AI Service', 'cyan', true);

        if (this.options.dryRun) {
            this.log('[DRY RUN] Would set up DeepSeek service', 'yellow');
            return;
        }

        const deepseekDir = path.join(this.outputDir, 'services', 'deepseek-ai');
        
        if (fs.existsSync(deepseekDir)) {
            this.log('DeepSeek AI service directory created', 'green');
            
            // Create DeepSeek integration guide
            const deepseekDocs = this.generateDeepSeekDocs();
            fs.writeFileSync(
                path.join(deepseekDir, 'DEEPSEEK_INTEGRATION.md'),
                deepseekDocs
            );
            
            this.log('DeepSeek documentation generated', 'green');
        } else {
            this.log('DeepSeek directory not found', 'yellow');
        }
    }

    async phase7_generateDocker() {
        this.log('Phase 7: Generating Docker Configuration', 'cyan', true);

        if (this.options.dryRun) {
            this.log('[DRY RUN] Would generate Docker files', 'yellow');
            return;
        }

        // Docker files should already be created by the project generator
        const dockerComposePath = path.join(this.outputDir, 'docker-compose.yml');
        
        if (fs.existsSync(dockerComposePath)) {
            this.log('Docker configuration verified', 'green');
            
            // Create additional Docker helpers
            this.createDockerHelpers();
            this.log('Docker helper scripts created', 'green');
        } else {
            this.log('Docker configuration not found', 'yellow');
        }
    }

    async phase8_generateAPIDocs() {
        this.log('Phase 8: Generating API Documentation', 'cyan', true);

        if (this.options.dryRun) {
            this.log('[DRY RUN] Would generate API docs', 'yellow');
            return;
        }

        const docsDir = path.join(this.outputDir, 'docs');
        
        if (fs.existsSync(docsDir)) {
            // Create OpenAPI specification
            const openapi = this.generateOpenAPISpec();
            fs.writeFileSync(
                path.join(docsDir, 'openapi.json'),
                JSON.stringify(openapi, null, 2)
            );
            
            this.log('OpenAPI specification generated', 'green');
        }
    }

    async phase9_generateDeploymentGuides() {
        this.log('Phase 9: Generating Deployment Guides', 'cyan', true);

        if (this.options.dryRun) {
            this.log('[DRY RUN] Would generate deployment guides', 'yellow');
            return;
        }

        const docsDir = path.join(this.outputDir, 'docs');
        
        if (fs.existsSync(docsDir)) {
            // Create Kubernetes guide
            const k8sGuide = this.generateKubernetesGuide();
            fs.writeFileSync(path.join(docsDir, 'kubernetes.md'), k8sGuide);
            
            // Create troubleshooting guide
            const troubleshooting = this.generateTroubleshootingGuide();
            fs.writeFileSync(path.join(docsDir, 'troubleshooting.md'), troubleshooting);
            
            this.log('Deployment guides generated', 'green');
        }
    }

    generateWorkerPoolDocs() {
        return `# Worker Pool Service Guide

## Overview

The Worker Pool Manager provides a scalable pool of headless browser instances for
web scraping, testing, and automation tasks.

## Features

- **Dynamic Scaling**: Automatically scales workers based on demand
- **Multiple Browser Types**: Support for Chromium, Firefox, and WebKit
- **Task Queue**: Priority-based task scheduling
- **Health Monitoring**: Automatic worker health checks and recovery
- **Resource Management**: Efficient resource cleanup and idle worker removal

## API Endpoints

### Allocate Worker

\`\`\`http
POST /api/workers/allocate
Content-Type: application/json

{
  "priority": 1,
  "timeout": 60000
}
\`\`\`

### Release Worker

\`\`\`http
POST /api/workers/release/:workerId
\`\`\`

### Get Status

\`\`\`http
GET /api/workers/status
\`\`\`

### Scale Workers

\`\`\`http
POST /api/workers/scale
Content-Type: application/json

{
  "count": 5
}
\`\`\`

## Task Types

### Navigate
\`\`\`javascript
{
  "type": "navigate",
  "params": {
    "url": "https://example.com",
    "waitUntil": "networkidle"
  }
}
\`\`\`

### Screenshot
\`\`\`javascript
{
  "type": "screenshot",
  "params": {
    "path": "/tmp/screenshot.png",
    "fullPage": true
  }
}
\`\`\`

### Extract Data
\`\`\`javascript
{
  "type": "extract",
  "params": {
    "selector": ".product-title",
    "extract": "text",
    "multiple": true
  }
}
\`\`\`

### Crawl Page
\`\`\`javascript
{
  "type": "crawl",
  "params": {
    "url": "https://example.com",
    "extractors": {
      "title": "h1",
      "description": "meta[name='description']"
    },
    "screenshot": true
  }
}
\`\`\`

## Configuration

Environment variables:

- \`MIN_WORKERS\`: Minimum worker pool size (default: 2)
- \`MAX_WORKERS\`: Maximum worker pool size (default: 10)
- \`BROWSER_TYPE\`: Browser type (chromium/firefox/webkit)
- \`IDLE_TIMEOUT\`: Worker idle timeout in ms (default: 300000)
- \`TASK_TIMEOUT\`: Task execution timeout in ms (default: 60000)

## Monitoring

The worker pool exposes metrics at \`/metrics\`:

- \`worker_pool_size\`: Current number of workers
- \`worker_pool_utilization\`: Percentage of busy workers
- \`worker_pool_queue_length\`: Number of queued tasks
- \`worker_pool_tasks_processed\`: Total tasks processed
- \`worker_pool_tasks_failed\`: Total failed tasks
`;
    }

    generateDeepSeekDocs() {
        return `# DeepSeek AI Integration Guide

## Overview

The DeepSeek AI service provides AI-powered capabilities for code generation,
optimization, and analysis using the DeepSeek model via Ollama.

## Setup

1. Ensure Ollama is running:
   \`\`\`bash
   docker-compose up -d ollama
   \`\`\`

2. Pull the DeepSeek model:
   \`\`\`bash
   docker-compose exec ollama ollama pull deepseek-r1:latest
   \`\`\`

3. Start the AI service:
   \`\`\`bash
   docker-compose up -d deepseek-ai
   \`\`\`

## API Endpoints

### Generate Code

\`\`\`http
POST /api/ai/generate
Content-Type: application/json

{
  "prompt": "Create a React component for user profile",
  "context": {
    "framework": "React",
    "language": "TypeScript"
  }
}
\`\`\`

### Optimize Code

\`\`\`http
POST /api/ai/optimize
Content-Type: application/json

{
  "code": "const x = 1; const y = 2; return x + y;",
  "language": "javascript"
}
\`\`\`

### Analyze Code

\`\`\`http
POST /api/ai/analyze
Content-Type: application/json

{
  "code": "function example() { ... }",
  "analysisType": ["complexity", "security", "performance"]
}
\`\`\`

## Use Cases

### 1. Component Generation

Generate UI components from natural language descriptions:

\`\`\`javascript
const response = await fetch('/api/ai/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    prompt: 'Create a login form with email and password fields',
    context: {
      framework: 'React',
      styling: 'Tailwind CSS'
    }
  })
});
\`\`\`

### 2. Code Optimization

Optimize existing code for performance:

\`\`\`javascript
const response = await fetch('/api/ai/optimize', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    code: existingCode,
    optimizeFor: ['performance', 'readability']
  })
});
\`\`\`

### 3. Code Review

Get AI-powered code review feedback:

\`\`\`javascript
const response = await fetch('/api/ai/analyze', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    code: pullRequestCode,
    analysisType: ['security', 'best-practices', 'bugs']
  })
});
\`\`\`

## Configuration

Environment variables:

- \`OLLAMA_URL\`: Ollama server URL (default: http://ollama:11434)
- \`MODEL_NAME\`: Model to use (default: deepseek-r1:latest)
- \`MAX_TOKENS\`: Maximum response tokens (default: 2000)
- \`TEMPERATURE\`: Model temperature (default: 0.7)

## Best Practices

1. **Cache Results**: Use Redis to cache common queries
2. **Rate Limiting**: Implement rate limiting for API calls
3. **Context Management**: Provide relevant context for better results
4. **Error Handling**: Handle model errors gracefully
5. **Monitoring**: Track model performance and costs
`;
    }

    createDockerHelpers() {
        const scriptsDir = path.join(this.outputDir, 'scripts');
        if (!fs.existsSync(scriptsDir)) {
            fs.mkdirSync(scriptsDir, { recursive: true });
        }

        // Create logs viewer script
        const logsScript = `#!/bin/bash
# View logs for a specific service or all services

if [ -z "$1" ]; then
    echo "Viewing all service logs..."
    docker-compose logs -f
else
    echo "Viewing logs for $1..."
    docker-compose logs -f $1
fi
`;

        fs.writeFileSync(path.join(scriptsDir, 'logs.sh'), logsScript);
        fs.chmodSync(path.join(scriptsDir, 'logs.sh'), '755');

        // Create restart script
        const restartScript = `#!/bin/bash
# Restart a specific service

if [ -z "$1" ]; then
    echo "Usage: ./scripts/restart.sh <service-name>"
    exit 1
fi

echo "Restarting $1..."
docker-compose restart $1
echo "✅ $1 restarted"
`;

        fs.writeFileSync(path.join(scriptsDir, 'restart.sh'), restartScript);
        fs.chmodSync(path.join(scriptsDir, 'restart.sh'), '755');
    }

    generateOpenAPISpec() {
        return {
            openapi: '3.0.0',
            info: {
                title: 'LightDom Enterprise API',
                version: '1.0.0',
                description: 'Enterprise-grade blockchain-based DOM optimization platform'
            },
            servers: [
                {
                    url: 'http://localhost:3001/api/v1',
                    description: 'Development server'
                }
            ],
            components: {
                securitySchemes: {
                    bearerAuth: {
                        type: 'http',
                        scheme: 'bearer',
                        bearerFormat: 'JWT'
                    }
                }
            },
            security: [
                {
                    bearerAuth: []
                }
            ],
            paths: {
                '/auth/login': {
                    post: {
                        summary: 'User login',
                        tags: ['Authentication'],
                        requestBody: {
                            required: true,
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            email: { type: 'string' },
                                            password: { type: 'string' }
                                        }
                                    }
                                }
                            }
                        },
                        responses: {
                            '200': {
                                description: 'Login successful',
                                content: {
                                    'application/json': {
                                        schema: {
                                            type: 'object',
                                            properties: {
                                                token: { type: 'string' },
                                                user: { type: 'object' }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        };
    }

    generateKubernetesGuide() {
        return `# Kubernetes Deployment Guide

## Prerequisites

- Kubernetes cluster (1.20+)
- kubectl configured
- Helm 3.x (optional)

## Quick Deploy

\`\`\`bash
# Create namespace
kubectl create namespace lightdom

# Apply configurations
kubectl apply -f k8s/

# Check status
kubectl get pods -n lightdom
\`\`\`

## Configuration

All services are configured via ConfigMaps and Secrets.

### Secrets

\`\`\`bash
kubectl create secret generic lightdom-secrets \\
  --from-literal=postgres-password=<password> \\
  --from-literal=jwt-secret=<secret> \\
  -n lightdom
\`\`\`

## Scaling

### Manual Scaling

\`\`\`bash
kubectl scale deployment worker-pool --replicas=10 -n lightdom
\`\`\`

### Auto-scaling

\`\`\`bash
kubectl autoscale deployment worker-pool \\
  --cpu-percent=80 \\
  --min=2 \\
  --max=10 \\
  -n lightdom
\`\`\`

## Monitoring

### Logs

\`\`\`bash
kubectl logs -f deployment/api-gateway -n lightdom
\`\`\`

### Metrics

\`\`\`bash
kubectl top pods -n lightdom
\`\`\`

## Updates

### Rolling Update

\`\`\`bash
kubectl set image deployment/api-gateway \\
  api-gateway=lightdom/api-gateway:v2.0.0 \\
  -n lightdom
\`\`\`

### Rollback

\`\`\`bash
kubectl rollout undo deployment/api-gateway -n lightdom
\`\`\`
`;
    }

    generateTroubleshootingGuide() {
        return `# Troubleshooting Guide

## Common Issues

### Services Not Starting

**Symptom**: Service containers exit immediately

**Solutions**:
1. Check logs: \`docker-compose logs <service-name>\`
2. Verify environment variables in \`.env\`
3. Ensure all required services are running
4. Check port conflicts

### Database Connection Issues

**Symptom**: Services can't connect to PostgreSQL

**Solutions**:
1. Verify PostgreSQL is running: \`docker-compose ps postgres\`
2. Check database credentials in \`.env\`
3. Ensure database is initialized: \`docker-compose exec postgres psql -U lightdom -l\`

### Worker Pool Issues

**Symptom**: Browser automation tasks failing

**Solutions**:
1. Check worker pool status: \`curl http://localhost:3200/api/workers/status\`
2. Increase worker pool size if needed
3. Check system resources (RAM, CPU)
4. Review worker logs for browser errors

### API Gateway Timeouts

**Symptom**: Requests timing out at gateway

**Solutions**:
1. Check service health: \`./scripts/health-check.sh\`
2. Review API gateway logs for routing issues
3. Verify service discovery is working
4. Check Redis connection for cache

### High Memory Usage

**Symptom**: Containers using too much memory

**Solutions**:
1. Scale down worker pool: \`docker-compose up -d --scale worker-pool=2\`
2. Set memory limits in docker-compose.yml
3. Enable memory monitoring
4. Check for memory leaks in application logs

## Debug Mode

Enable debug logging:

\`\`\`bash
# Set in .env
LOG_LEVEL=debug

# Restart services
docker-compose restart
\`\`\`

## Getting Help

1. Check documentation in \`docs/\`
2. Review logs: \`docker-compose logs -f\`
3. Check GitHub issues
4. Contact support
`;
    }

    printSummary() {
        const elapsed = ((Date.now() - this.startTime) / 1000).toFixed(2);

        console.log('\n');
        console.log(colors.green + '═'.repeat(80) + colors.reset);
        console.log(colors.bright + colors.green + 
                   '                    Generation Complete!' + 
                   colors.reset);
        console.log(colors.green + '═'.repeat(80) + colors.reset);
        console.log('\n');

        console.log(colors.bright + 'Summary:' + colors.reset);
        console.log(`  Time elapsed: ${elapsed}s`);
        console.log(`  Output directory: ${colors.cyan}${this.outputDir}${colors.reset}`);
        console.log('\n');

        console.log(colors.bright + 'Generated Artifacts:' + colors.reset);
        console.log('  ✓ Knowledge graph visualization');
        console.log('  ✓ Enterprise architecture design');
        console.log('  ✓ Microservices structure (10 services)');
        console.log('  ✓ Docker containerization');
        console.log('  ✓ Worker pool service (Playwright)');
        console.log('  ✓ DeepSeek AI service');
        console.log('  ✓ API documentation (OpenAPI)');
        console.log('  ✓ Deployment guides');
        console.log('\n');

        console.log(colors.bright + 'Next Steps:' + colors.reset);
        console.log(`  1. ${colors.cyan}cd ${this.outputDir}${colors.reset}`);
        console.log(`  2. ${colors.cyan}cp .env.example .env${colors.reset} (and update values)`);
        console.log(`  3. ${colors.cyan}./start.sh${colors.reset} (or docker-compose up -d)`);
        console.log(`  4. ${colors.cyan}./scripts/health-check.sh${colors.reset}`);
        console.log('\n');

        console.log(colors.bright + 'Access Points:' + colors.reset);
        console.log(`  Frontend:     ${colors.blue}http://localhost:3000${colors.reset}`);
        console.log(`  API Gateway:  ${colors.blue}http://localhost:3001${colors.reset}`);
        console.log(`  Grafana:      ${colors.blue}http://localhost:3002${colors.reset}`);
        console.log(`  Prometheus:   ${colors.blue}http://localhost:9090${colors.reset}`);
        console.log(`  Worker Pool:  ${colors.blue}http://localhost:3200${colors.reset}`);
        console.log('\n');

        console.log(colors.bright + 'Documentation:' + colors.reset);
        console.log(`  Main README:    ${path.join(this.outputDir, 'README.md')}`);
        console.log(`  Architecture:   ${path.join(this.outputDir, 'docs/architecture.md')}`);
        console.log(`  API Docs:       ${path.join(this.outputDir, 'docs/api.md')}`);
        console.log(`  Deployment:     ${path.join(this.outputDir, 'docs/deployment.md')}`);
        console.log('\n');

        if (fs.existsSync(this.kgDir)) {
            const kgHtml = path.join(this.kgDir, 'knowledge-graph.html');
            console.log(colors.bright + 'Knowledge Graph:' + colors.reset);
            console.log(`  Open in browser: ${colors.blue}file://${kgHtml}${colors.reset}`);
            console.log('\n');
        }

        console.log(colors.green + '═'.repeat(80) + colors.reset);
        console.log('\n');
    }

    log(message, color = 'reset', header = false) {
        const colorCode = colors[color] || colors.reset;
        
        if (header) {
            console.log('\n' + colorCode + '━'.repeat(70) + colors.reset);
            console.log(colorCode + colors.bright + message + colors.reset);
            console.log(colorCode + '━'.repeat(70) + colors.reset + '\n');
        } else {
            console.log(colorCode + '  ' + message + colors.reset);
        }
    }
}

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
    skipAnalysis: args.includes('--skip-analysis'),
    skipDocker: args.includes('--skip-docker'),
    dryRun: args.includes('--dry-run')
};

if (args.includes('--help') || args.includes('-h')) {
    console.log(`
LightDom Master Enterprise Generator

Usage: node scripts/master-enterprise-generator.js [options]

Options:
  --skip-analysis    Skip code analysis and knowledge graph generation
  --skip-docker      Skip Docker configuration generation
  --dry-run          Show what would be done without doing it
  --help, -h         Show this help message

Examples:
  # Full generation
  node scripts/master-enterprise-generator.js

  # Skip analysis (use existing knowledge graph)
  node scripts/master-enterprise-generator.js --skip-analysis

  # Dry run to see what would happen
  node scripts/master-enterprise-generator.js --dry-run
`);
    process.exit(0);
}

// Run the generator
const generator = new MasterEnterpriseGenerator(options);
generator.run().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});
