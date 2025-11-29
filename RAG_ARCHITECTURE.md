# RAG System Architecture and Best Practices

## Overview

The LightDom RAG (Retrieval Augmented Generation) system is a production-grade implementation featuring enterprise-level reliability, automatic error recovery, and comprehensive health monitoring.

## Architecture

### Backend Components

#### 1. RAG Health Monitor (`services/rag/rag-health-monitor.js`)
- **Purpose**: Continuous health monitoring with circuit breaker pattern
- **Features**:
  - Periodic health checks (every 30 seconds by default)
  - Circuit breaker with configurable thresholds
  - Component-level health tracking (database, vector store, embedding, LLM)
  - Event emission for health status changes
  - Automatic recovery detection

#### 2. RAG Connection Manager (`services/rag/rag-connection-manager.js`)
- **Purpose**: Automatic connection management with exponential backoff retry
- **Features**:
  - Exponential backoff with jitter (prevents thundering herd)
  - Configurable retry parameters (max retries, delays, backoff multiplier)
  - Connection pooling and reuse
  - Graceful degradation

#### 3. RAG Router (`services/rag/rag-router.js`)
- **Purpose**: Express router with all RAG endpoints
- **Endpoints**:
  - `POST /api/rag/chat/stream` - Stream chat responses
  - `POST /api/rag/upsert` - Upsert documents to vector store
  - `POST /api/rag/search` - Semantic search
  - `GET /api/rag/health` - Comprehensive health check
  - `GET /api/rag/status` - Connection status
  - `POST /api/rag/reconnect` - Manual reconnection
  - `POST /api/rag/ingest/upload` - File upload ingestion
  - `POST /api/rag/ingest/url` - URL content ingestion
  - `POST /api/rag/ingest/codebase` - Codebase ingestion

### Frontend Components

#### 1. RAG API Client (`frontend/src/services/ragApiClient.ts`)
- **Purpose**: TypeScript client for RAG API with automatic retry
- **Features**:
  - Exponential backoff retry for failed requests
  - Health status monitoring
  - Circuit breaker awareness
  - Event subscriptions for health updates
  - Stream handling with proper cleanup

#### 2. React Hooks (`frontend/src/hooks/useRagChat.ts`)
- `useRagHealth()` - Health status monitoring
- `useRagChat()` - Chat streaming with retry
- `useRagConnectionStatus()` - Connection status display

#### 3. UI Components
- `RagConnectionStatus` - Visual connection status indicator
- `RagErrorBoundary` - Error boundary with retry functionality

## Configuration

### Environment Variables

```bash
# Backend
DEEPSEEK_API_KEY=your_deepseek_api_key      # DeepSeek API key
OLLAMA_ENDPOINT=http://127.0.0.1:11434      # Ollama local endpoint
RAG_EMBED_PROVIDER=ollama                    # 'ollama' or 'openai'
OPENAI_API_KEY=your_openai_key              # OpenAI API key (optional)
RAG_UPLOAD_MAX_BYTES=52428800               # Max upload size (50MB default)

# Frontend
VITE_API_URL=http://localhost:3001/api      # Backend API URL
```

### Retry Configuration

#### Backend (Connection Manager)
```javascript
new RagConnectionManager({
  maxRetries: 10,           // Maximum retry attempts
  initialRetryDelay: 1000,  // Initial delay in ms
  maxRetryDelay: 60000,     // Maximum delay in ms
  backoffMultiplier: 2,     // Exponential backoff multiplier
})
```

#### Frontend (API Client)
```typescript
new RagApiClient('/api', {
  maxRetries: 5,
  initialDelay: 1000,
  maxDelay: 30000,
  backoffMultiplier: 2,
})
```

### Circuit Breaker Configuration

```javascript
{
  failures: 0,              // Current failure count
  threshold: 5,             // Failures before opening circuit
  timeout: 60000,           // Time before half-open attempt (1 min)
  state: 'closed',          // 'closed', 'open', 'half-open'
}
```

## Best Practices

### 1. Health Monitoring

Always monitor RAG health status before making requests:

```typescript
const { healthStatus, isAvailable } = useRagHealth();

if (!isAvailable) {
  // Show error message or disable RAG features
  return;
}
```

### 2. Error Handling

Wrap RAG components in error boundaries:

```tsx
<RagErrorBoundary>
  <YourRagComponent />
</RagErrorBoundary>
```

### 3. Graceful Degradation

```typescript
try {
  await streamChat(messages, options, onChunk);
} catch (error) {
  if (error instanceof RagApiError && error.statusCode === 503) {
    // Service unavailable, show fallback UI
    showFallbackUI();
  } else {
    // Other error, log and notify user
    logError(error);
    notifyUser('An error occurred');
  }
}
```

### 4. Connection Status Display

Always show connection status to users:

```tsx
<RagConnectionStatus 
  showDetails={true} 
  onReconnect={() => console.log('Reconnecting...')} 
/>
```

### 5. Cleanup

Always cleanup resources:

```typescript
useEffect(() => {
  const client = getRagClient();
  const unsubscribe = client.onHealthUpdate(handleUpdate);
  
  return () => {
    unsubscribe();
    client.stopHealthMonitoring();
  };
}, []);
```

## Monitoring and Observability

### Health Check Endpoint

```bash
curl http://localhost:3001/api/rag/health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2025-11-18T15:00:00.000Z",
  "uptime": 3600,
  "components": {
    "database": {
      "status": "healthy",
      "lastCheck": "2025-11-18T15:00:00.000Z",
      "responseTime": 5
    },
    "vectorStore": {
      "status": "healthy",
      "details": { ... }
    },
    "embedding": { ... },
    "llm": { ... }
  },
  "connection": {
    "isConnected": true,
    "retryCount": 0,
    "maxRetries": 10
  },
  "circuitBreaker": {
    "state": "closed",
    "failures": 0
  }
}
```

### Status Codes

- **200**: All components healthy
- **206**: Degraded (some components unhealthy)
- **503**: Service unavailable (critical components down or circuit breaker open)

## Troubleshooting

### Issue: Connection Failures

**Symptoms**: Repeated connection errors, circuit breaker opens

**Solutions**:
1. Check if Ollama is running: `curl http://127.0.0.1:11434/api/tags`
2. Verify DeepSeek API key is configured
3. Check database connectivity
4. Review logs for specific error messages
5. Use manual reconnection: `POST /api/rag/reconnect`

### Issue: Slow Responses

**Symptoms**: High latency, timeout errors

**Solutions**:
1. Monitor health endpoint for component response times
2. Check vector store index size
3. Verify embedding service performance
4. Consider scaling resources
5. Adjust timeout configurations

### Issue: Circuit Breaker Opens

**Symptoms**: Service unavailable after repeated failures

**Solutions**:
1. Wait for circuit breaker timeout (60 seconds default)
2. Fix underlying issue (check logs)
3. Use reconnect endpoint once issue is resolved
4. Circuit breaker will automatically attempt half-open state

## Testing

### Unit Tests
```bash
npm run test:unit -- services/rag
```

### Integration Tests
```bash
npm run test:integration -- rag
```

### E2E Tests
```bash
npm run test:e2e -- rag
```

## Deployment

### Production Checklist

- [ ] Configure production API keys (DeepSeek, OpenAI)
- [ ] Set up Ollama service with proper models
- [ ] Configure PostgreSQL with vector extension
- [ ] Set appropriate retry and timeout values
- [ ] Enable logging and monitoring
- [ ] Set up health check alerts
- [ ] Configure circuit breaker thresholds
- [ ] Test failover scenarios
- [ ] Document recovery procedures
- [ ] Set up backup RAG providers

### Monitoring Setup

```javascript
// Example: Set up monitoring alerts
healthMonitor.on('circuit-breaker-open', (data) => {
  alertOps({
    level: 'critical',
    message: 'RAG circuit breaker opened',
    failures: data.failures,
    error: data.error,
  });
});

healthMonitor.on('health-check-failed', (data) => {
  alertOps({
    level: 'warning',
    message: 'RAG health check failed',
    status: data.status,
  });
});
```

## References

### Internal Documentation
- [RAG Health Monitor](../services/rag/rag-health-monitor.js)
- [RAG Connection Manager](../services/rag/rag-connection-manager.js)
- [RAG Router](../services/rag/rag-router.js)
- [Frontend RAG Client](../frontend/src/services/ragApiClient.ts)

### External Resources
- [Azure RAG Best Practices](https://learn.microsoft.com/en-us/azure/architecture/ai-ml/guide/rag/rag-solution-design-and-evaluation-guide)
- [Enterprise RAG Architecture](https://ragnav.com/knowledge/enterprise-rag-architecture)
- [Circuit Breaker Pattern](https://martinfowler.com/bliki/CircuitBreaker.html)
- [Exponential Backoff](https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/)
