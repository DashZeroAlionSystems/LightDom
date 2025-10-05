# Cursor-N8n Integration for Headless Chrome Pipeline

This document describes the integration between Cursor API, n8n workflows, and the headless Chrome pipeline for JavaScript function execution in the LightDom platform.

## Overview

The integration provides a comprehensive task management system that allows:

1. **JavaScript Function Execution**: Run custom JavaScript functions in headless Chrome browsers
2. **Cursor API Integration**: Execute predefined Cursor API functions for DOM analysis
3. **N8n Workflow Integration**: Trigger and manage n8n workflows for complex automation tasks
4. **Real-time Task Monitoring**: Track task execution status and results in real-time
5. **Scalable Task Processing**: Queue and process multiple tasks concurrently

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Cursor API    │    │   Task Manager   │    │ Headless Chrome │
│   Functions     │◄──►│                  │◄──►│    Service      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   N8n Workflows │    │ Integration      │    │   Task Queue    │
│                 │◄──►│ Service          │◄──►│   & Processing  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## Components

### 1. Task Manager (`TaskManager.ts`)

The core component that manages task execution lifecycle:

- **Task Types**: JavaScript execution, DOM analysis, n8n workflows
- **Priority Queue**: Tasks are processed based on priority levels
- **Concurrent Processing**: Configurable maximum concurrent task execution
- **Event System**: Real-time task status updates via EventEmitter

**Key Features:**
- Task creation and queuing
- Concurrent task execution
- Task monitoring and status tracking
- Automatic cleanup of completed tasks
- Error handling and retry mechanisms

### 2. Headless Chrome Service (`HeadlessChromeService.ts`)

Manages headless Chrome browser instances:

- **Browser Management**: Launch, configure, and manage Chrome instances
- **Page Management**: Create, navigate, and manage browser pages
- **Script Execution**: Execute JavaScript code in browser context
- **Performance Monitoring**: Track DOM performance and optimization metrics
- **Resource Optimization**: Block unnecessary resources for faster execution

**Key Features:**
- Optimized Chrome configuration for performance
- Request interception and filtering
- DOM analysis and performance metrics
- Screenshot and PDF generation capabilities
- Memory and resource management

### 3. Cursor-N8n Integration Service (`CursorN8nIntegrationService.ts`)

Orchestrates the integration between all components:

- **Cursor API Functions**: Predefined functions for common DOM operations
- **N8n Workflow Management**: Integration with n8n automation workflows
- **Task Orchestration**: Coordinates complex multi-step operations
- **Status Monitoring**: Real-time integration status and health checks

**Built-in Cursor API Functions:**
- `analyzeDOM`: Comprehensive DOM structure and performance analysis
- `extractText`: Extract all text content from pages
- `getTitle`: Get page title
- `getMetaTags`: Extract meta tags and SEO data
- `getLinks`: Extract all links with metadata
- `getImages`: Extract all images with optimization data
- `getForms`: Extract form structures and validation rules
- `checkAccessibility`: Basic accessibility compliance checking

### 4. Task API (`TaskAPI.ts`)

RESTful API endpoints for task management:

- **Task Creation**: Create JavaScript, DOM analysis, and n8n workflow tasks
- **Task Monitoring**: Get task status, results, and execution details
- **Direct Execution**: Execute JavaScript immediately without queuing
- **Batch Operations**: Execute multiple scripts in sequence
- **Integration Status**: Get system health and available functions

## API Endpoints

### Task Management

#### Create JavaScript Task
```http
POST /api/tasks/javascript
Content-Type: application/json

{
  "script": "return document.title;",
  "url": "https://example.com",
  "timeout": 30000,
  "priority": 8
}
```

#### Create DOM Analysis Task
```http
POST /api/tasks/dom-analysis
Content-Type: application/json

{
  "url": "https://example.com",
  "analysisType": "full",
  "priority": 8
}
```

#### Create N8n Workflow Task
```http
POST /api/tasks/n8n-workflow
Content-Type: application/json

{
  "workflowId": "dom-analysis-workflow",
  "inputData": {
    "url": "https://example.com",
    "analysisType": "full"
  },
  "timeout": 60000,
  "priority": 8
}
```

#### Get Task Status
```http
GET /api/tasks/{taskId}
```

#### Get Task Statistics
```http
GET /api/tasks/stats
```

### Direct Execution

#### Execute JavaScript
```http
POST /api/execute/javascript
Content-Type: application/json

{
  "script": "return document.title;",
  "url": "https://example.com",
  "timeout": 30000
}
```

#### Execute Cursor API Function
```http
POST /api/cursor/execute
Content-Type: application/json

{
  "functionName": "analyzeDOM",
  "url": "https://example.com",
  "timeout": 30000
}
```

### Integration Status

#### Get Integration Status
```http
GET /api/integration/status
```

#### Get Available Cursor Functions
```http
GET /api/integration/cursor/functions
```

#### Get Available N8n Workflows
```http
GET /api/integration/n8n/workflows
```

## N8n Workflow Templates

### 1. DOM Analysis Workflow

**Purpose**: Comprehensive DOM analysis for optimization
**Webhook**: `/webhook/dom-analysis`

**Input**:
```json
{
  "url": "https://example.com",
  "analysisType": "full"
}
```

**Output**:
```json
{
  "success": true,
  "url": "https://example.com",
  "analysis": {
    "totalElements": 150,
    "performanceScore": {
      "domContentLoaded": 1200,
      "loadComplete": 2500
    },
    "optimizationSuggestions": [
      {
        "type": "performance",
        "priority": "high",
        "message": "Optimize 25 images for better performance"
      }
    ]
  }
}
```

### 2. JavaScript Execution Workflow

**Purpose**: Execute custom JavaScript functions in headless Chrome
**Webhook**: `/webhook/execute-js`

**Input**:
```json
{
  "script": "return document.title;",
  "url": "https://example.com"
}
```

### 3. Cursor API Integration Workflow

**Purpose**: Execute Cursor API functions through n8n
**Webhook**: `/webhook/cursor-api`

**Input**:
```json
{
  "functionName": "analyzeDOM",
  "url": "https://example.com"
}
```

### 4. Optimization Pipeline Workflow

**Purpose**: Complete DOM optimization pipeline with Cursor and n8n integration
**Webhook**: `/webhook/optimize-dom`

**Input**:
```json
{
  "url": "https://example.com",
  "optimizationType": "full"
}
```

## Configuration

### Environment Variables

```bash
# Cursor API Configuration
CURSOR_API_URL=http://localhost:3001/api/cursor

# N8n Configuration
N8N_ENABLED=true
N8N_BASE_URL=http://localhost:5678
N8N_API_KEY=your_n8n_api_key
N8N_WEBHOOK_SECRET=your_webhook_secret

# Headless Chrome Configuration
HEADLESS_CHROME=true
MAX_CONCURRENT_TASKS=5
DEFAULT_TASK_TIMEOUT=30000

# Database Configuration (existing)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=dom_space_harvester
DB_USER=postgres
DB_PASSWORD=postgres
```

### Service Configuration

```javascript
const config = {
  cursorAPI: {
    enabled: true,
    baseUrl: 'http://localhost:3001/api/cursor'
  },
  n8n: {
    enabled: true,
    baseUrl: 'http://localhost:5678',
    apiKey: 'your_api_key',
    webhookSecret: 'your_webhook_secret'
  },
  headlessChrome: {
    enabled: true,
    maxConcurrency: 5,
    defaultTimeout: 30000
  }
};
```

## Usage Examples

### 1. Basic JavaScript Execution

```javascript
// Create a task for DOM analysis
const taskId = await taskManager.createJavaScriptTask(`
  const analysis = {
    title: document.title,
    totalElements: document.querySelectorAll('*').length,
    images: document.querySelectorAll('img').length
  };
  return analysis;
`, {
  url: 'https://example.com',
  timeout: 30000,
  priority: 8
});

// Monitor task completion
const task = await taskManager.getTask(taskId);
console.log('Task result:', task.result);
```

### 2. Using Cursor API Functions

```javascript
// Execute built-in DOM analysis function
const result = await integrationService.executeCursorFunction('analyzeDOM', {}, {
  url: 'https://example.com',
  timeout: 30000
});

console.log('DOM Analysis:', result);
```

### 3. N8n Workflow Execution

```javascript
// Execute optimization pipeline workflow
const result = await integrationService.executeN8nWorkflow('optimization-pipeline-workflow', {
  url: 'https://example.com',
  optimizationType: 'full'
});

console.log('Optimization results:', result);
```

### 4. Complete Optimization Pipeline

```javascript
// Run complete optimization pipeline
const result = await integrationService.executeOptimizationPipeline('https://example.com', {
  analysisType: 'full',
  includeAccessibility: true,
  timeout: 120000
});

console.log('Pipeline results:', result);
```

## Testing

### Run Integration Tests

```bash
# Start the API server
npm run api

# Run integration tests
node scripts/test-cursor-n8n-integration.js
```

### Test Individual Components

```bash
# Test task management
curl -X POST http://localhost:3001/api/tasks/javascript \
  -H "Content-Type: application/json" \
  -d '{"script": "return document.title;", "url": "https://example.com"}'

# Test direct execution
curl -X POST http://localhost:3001/api/execute/javascript \
  -H "Content-Type: application/json" \
  -d '{"script": "return document.title;", "url": "https://example.com"}'

# Test Cursor API
curl -X POST http://localhost:3001/api/cursor/execute \
  -H "Content-Type: application/json" \
  -d '{"functionName": "getTitle", "url": "https://example.com"}'
```

## Monitoring and Observability

### Task Statistics

The system provides comprehensive task statistics:

```javascript
{
  "total": 150,
  "pending": 5,
  "running": 3,
  "completed": 140,
  "failed": 2,
  "queueLength": 5,
  "maxConcurrent": 5,
  "activeTasks": 3
}
```

### Integration Status

Monitor the health of all integration components:

```javascript
{
  "initialized": true,
  "cursorAPI": {
    "enabled": true,
    "functionsAvailable": 8
  },
  "n8n": {
    "enabled": true,
    "workflowsAvailable": 4,
    "activeWorkflows": 4
  },
  "headlessChrome": {
    "enabled": true,
    "status": {
      "isInitialized": true,
      "activePages": 2,
      "maxPages": 10
    }
  }
}
```

### Real-time Events

The system emits real-time events for task lifecycle:

- `taskCreated`: New task created
- `taskStarted`: Task execution started
- `taskCompleted`: Task completed successfully
- `taskFailed`: Task execution failed
- `taskCancelled`: Task was cancelled

## Security Considerations

### Script Execution Security

- **Sandboxing**: All JavaScript execution runs in isolated browser contexts
- **Input Validation**: Scripts are validated before execution
- **Dangerous Patterns**: Detection and blocking of dangerous script patterns
- **Timeout Protection**: All executions have configurable timeouts
- **Resource Limits**: Memory and CPU usage limits

### API Security

- **Rate Limiting**: Built-in rate limiting for API endpoints
- **Authentication**: API key authentication for sensitive operations
- **Input Sanitization**: All inputs are sanitized and validated
- **CORS Protection**: Proper CORS configuration
- **Error Handling**: Secure error messages without sensitive information

## Performance Optimization

### Headless Chrome Optimization

- **Resource Blocking**: Block unnecessary resources (ads, analytics, etc.)
- **Memory Management**: Automatic cleanup of browser resources
- **Connection Pooling**: Efficient browser instance management
- **Concurrent Execution**: Configurable concurrent task processing

### Task Processing Optimization

- **Priority Queue**: Tasks processed based on priority levels
- **Batch Processing**: Support for batch JavaScript execution
- **Result Caching**: Cache frequently requested results
- **Cleanup Automation**: Automatic cleanup of old tasks

## Troubleshooting

### Common Issues

1. **Browser Initialization Failed**
   - Check Chrome installation
   - Verify system dependencies
   - Check memory availability

2. **Task Execution Timeout**
   - Increase timeout values
   - Optimize JavaScript code
   - Check network connectivity

3. **N8n Integration Issues**
   - Verify n8n service status
   - Check webhook URLs
   - Validate API credentials

### Debug Mode

Enable debug logging:

```bash
DEBUG=TaskManager,HeadlessChromeService,CursorN8nIntegrationService npm run api
```

### Health Checks

Monitor system health:

```bash
curl http://localhost:3001/api/health
curl http://localhost:3001/api/integration/status
```

## Future Enhancements

### Planned Features

1. **Advanced Workflow Orchestration**
   - Complex multi-step workflows
   - Conditional execution paths
   - Parallel task execution

2. **Enhanced Security**
   - Code signing for JavaScript functions
   - Advanced sandboxing
   - Audit logging

3. **Performance Improvements**
   - Distributed task processing
   - Advanced caching strategies
   - Load balancing

4. **Integration Expansions**
   - Additional automation platforms
   - Cloud service integrations
   - Advanced monitoring and alerting

## Conclusion

The Cursor-N8n integration provides a powerful and flexible system for JavaScript function execution in headless Chrome browsers. It enables complex DOM optimization workflows while maintaining security, performance, and scalability.

The system is designed to be extensible and can be easily integrated with additional automation platforms and services as needed.
