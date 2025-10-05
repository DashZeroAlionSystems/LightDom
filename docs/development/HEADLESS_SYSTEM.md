# LightDom Headless Chrome & Puppeteer System

## Overview

The LightDom Headless Chrome and Puppeteer system is a comprehensive solution for web crawling, DOM analysis, and website optimization. It provides enterprise-grade functionality for automated web interactions, performance monitoring, and optimization recommendations.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    HeadlessService                          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Main Orchestrator                      │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        │                       │                       │
┌───────▼────────┐    ┌────────▼────────┐    ┌────────▼────────┐
│ HeadlessChrome │    │  WebCrawler     │    │ Optimization    │
│    Service     │    │    Service      │    │    Engine       │
└────────────────┘    └─────────────────┘    └─────────────────┘
        │                       │                       │
        │                       │                       │
┌───────▼────────┐    ┌────────▼────────┐    ┌────────▼────────┐
│ Background     │    │   Monitoring    │    │   DOM Analyzer  │
│   Workers      │    │    Service      │    │                 │
└────────────────┘    └─────────────────┘    └─────────────────┘
```

## Core Services

### 1. HeadlessChromeService
Manages Puppeteer browser instances and page operations.

**Features:**
- Browser lifecycle management
- Page creation and navigation
- Screenshot capture
- PDF generation
- DOM analysis
- Performance metrics collection

**Key Methods:**
```typescript
// Initialize service
await headlessService.initialize();

// Create a page
const page = await headlessService.createPage('page-id', options);

// Navigate to URL
await headlessService.navigateToPage('page-id', 'https://example.com');

// Take screenshot
const screenshot = await headlessService.takeScreenshot('page-id', options);

// Generate PDF
const pdf = await headlessService.generatePDF('page-id', options);

// Analyze DOM
const analysis = await headlessService.analyzeDOM('page-id');

// Close page
await headlessService.closePage('page-id');
```

### 2. WebCrawlerService
Handles website crawling and data extraction.

**Features:**
- Multi-page website crawling
- Data extraction (images, links, scripts, CSS)
- Performance analysis
- SEO analysis
- Accessibility analysis
- Screenshot and PDF generation

**Key Methods:**
```typescript
// Start crawling
const crawlId = await crawlerService.crawlWebsite(url, options);

// Get crawl status
const status = await crawlerService.getCrawlStatus(crawlId);

// Get crawl result
const result = await crawlerService.getCrawlResult(crawlId);
```

### 3. OptimizationEngine
Provides website optimization recommendations and implementations.

**Features:**
- Image optimization
- CSS optimization
- JavaScript optimization
- HTML optimization
- Performance optimization
- SEO optimization
- Accessibility optimization

**Key Methods:**
```typescript
// Start optimization
const optimizationId = await optimizationEngine.optimizeWebsite(url, options);

// Get optimization status
const status = await optimizationEngine.getOptimizationStatus(optimizationId);

// Get optimization result
const result = await optimizationEngine.getOptimizationResult(optimizationId);
```

### 4. BackgroundWorkerService
Manages background processing and job queues.

**Features:**
- Job queue management
- Background processing
- Cron job scheduling
- Health monitoring
- Resource cleanup

**Key Methods:**
```typescript
// Add job to queue
const job = await backgroundWorker.addJob(queueName, jobType, data, options);

// Get queue status
const status = await backgroundWorker.getQueueStatus(queueName);
```

### 5. MonitoringService
Provides comprehensive monitoring and alerting.

**Features:**
- System metrics collection
- Service health monitoring
- Alert management
- Performance tracking
- Error reporting

**Key Methods:**
```typescript
// Collect metrics
const metrics = await monitoringService.collectMetrics();

// Create alert
const alert = await monitoringService.createAlert(alertData);

// Resolve alert
await monitoringService.resolveAlert(alertId);
```

### 6. DOMAnalyzer
Analyzes DOM structure and identifies optimization opportunities.

**Features:**
- DOM structure analysis
- Image analysis
- Script analysis
- CSS analysis
- Performance metrics
- Optimization opportunity detection

**Key Methods:**
```typescript
// Analyze DOM
const analysis = await domAnalyzer.analyzeDOM(page);

// Find optimization opportunities
const opportunities = await domAnalyzer.findOptimizationOpportunities(page, analysis);
```

## API Endpoints

### Health & Status
- `GET /health` - Health check
- `GET /api/status` - Service status
- `GET /api/headless/status` - Headless services status
- `GET /api/headless/health` - Headless services health

### Page Management
- `POST /api/headless/page/create` - Create a new page
- `POST /api/headless/page/navigate` - Navigate to URL
- `POST /api/headless/page/analyze` - Analyze DOM
- `POST /api/headless/page/screenshot` - Take screenshot
- `POST /api/headless/page/pdf` - Generate PDF
- `POST /api/headless/page/execute` - Execute custom JavaScript
- `DELETE /api/headless/page/:pageId` - Close page

### Web Crawling
- `POST /api/headless/crawl` - Start crawling
- `GET /api/headless/crawl/:crawlId/status` - Get crawl status
- `GET /api/headless/crawl/:crawlId/result` - Get crawl result

### Website Optimization
- `POST /api/headless/optimize` - Start optimization
- `GET /api/headless/optimize/:optimizationId/status` - Get optimization status
- `GET /api/headless/optimize/:optimizationId/result` - Get optimization result

### Background Workers
- `POST /api/headless/worker/job` - Add job to queue
- `GET /api/headless/worker/queue/:queueName/status` - Get queue status

### Cleanup
- `POST /api/headless/cleanup` - Cleanup all resources

## Configuration

The system uses a comprehensive configuration management system with environment variable support:

### Environment Variables

```bash
# Headless Chrome
HEADLESS_ENABLED=true
HEADLESS_MAX_PAGES=10
HEADLESS_MODE=new
HEADLESS_TIMEOUT=30000
HEADLESS_IGNORE_HTTPS=true

# Web Crawler
CRAWLER_ENABLED=true
CRAWLER_MAX_CONCURRENT=5
CRAWLER_TIMEOUT=30000
CRAWLER_RETRY_ATTEMPTS=3
CRAWLER_MAX_DEPTH=3
CRAWLER_MAX_PAGES=100
CRAWLER_RESPECT_ROBOTS=true
CRAWLER_FOLLOW_REDIRECTS=true

# Optimization Engine
OPTIMIZATION_ENABLED=true
OPTIMIZATION_MAX_CONCURRENT=3
OPTIMIZATION_TIMEOUT=120000
OPTIMIZATION_LEVEL=standard
OPTIMIZATION_GENERATE_REPORT=true
OPTIMIZATION_TAKE_SCREENSHOTS=true
OPTIMIZATION_GENERATE_PDF=true

# Monitoring
MONITORING_ENABLED=true
MONITORING_INTERVAL=60000
MONITORING_MEMORY_THRESHOLD=80
MONITORING_CPU_THRESHOLD=80
MONITORING_ERROR_RATE_THRESHOLD=10

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# Logging
LOG_LEVEL=info
LOG_CONSOLE=true
LOG_FILE=true
LOG_DIRECTORY=logs
```

## Usage Examples

### Basic Usage

```typescript
import HeadlessService from './src/services/HeadlessService';

const headlessService = new HeadlessService();

// Initialize
await headlessService.initialize();

// Get services
const headlessChrome = headlessService.getHeadlessChromeService();
const crawler = headlessService.getWebCrawlerService();
const optimizer = headlessService.getOptimizationEngine();

// Use services
const page = await headlessChrome.createPage('test-page');
await headlessChrome.navigateToPage('test-page', 'https://example.com');
const screenshot = await headlessChrome.takeScreenshot('test-page');

// Cleanup
await headlessService.cleanup();
```

### Web Crawling

```typescript
// Start crawling
const crawlId = await crawler.crawlWebsite('https://example.com', {
  generatePDF: true,
  takeScreenshot: true,
  waitForSelector: '.content'
});

// Wait for completion
let result;
while (!result) {
  result = await crawler.getCrawlResult(crawlId);
  await new Promise(resolve => setTimeout(resolve, 1000));
}

console.log('Crawl completed:', result.websiteData.title);
```

### Website Optimization

```typescript
// Start optimization
const optimizationId = await optimizer.optimizeWebsite('https://example.com', {
  optimizationLevel: 'aggressive',
  generateReport: true,
  takeScreenshots: true
});

// Wait for completion
let result;
while (!result) {
  result = await optimizer.getOptimizationResult(optimizationId);
  await new Promise(resolve => setTimeout(resolve, 1000));
}

console.log('Optimization completed:', result.appliedOptimizations.length, 'optimizations applied');
```

## Error Handling

The system includes comprehensive error handling with categorized error types:

### Error Types
- `HeadlessChromeError` - Browser/page related errors
- `CrawlError` - Web crawling errors
- `OptimizationError` - Optimization process errors
- `TimeoutError` - Operation timeout errors
- `NetworkError` - Network connectivity errors
- `ValidationError` - Input validation errors

### Error Handling Example

```typescript
import { ErrorHandler } from './src/utils/ErrorHandler';

const errorHandler = new ErrorHandler();

try {
  await headlessChrome.navigateToPage('page-id', 'invalid-url');
} catch (error) {
  const errorReport = errorHandler.handleError(error, {
    service: 'HeadlessChromeService',
    operation: 'navigateToPage',
    requestId: 'req-123',
    metadata: { url: 'invalid-url' }
  });
  
  console.log('Error reported:', errorReport.id);
}
```

## Monitoring & Alerting

### Metrics Collection
- System metrics (memory, CPU, uptime)
- Service health status
- Queue statistics
- Performance metrics
- Error rates

### Alert Types
- **Critical**: Service failures, out of memory
- **High**: High error rates, queue backlogs
- **Medium**: Performance issues, resource usage
- **Low**: Minor issues, warnings

### Alert Example

```typescript
// Create alert
const alert = await monitoringService.createAlert({
  type: 'warning',
  severity: 'high',
  title: 'High Memory Usage',
  message: 'Memory usage is 85% (threshold: 80%)',
  service: 'system',
  metadata: { memoryUsage: 85 }
});

// Resolve alert
await monitoringService.resolveAlert(alert.id);
```

## Testing

The system includes comprehensive test coverage:

### Test Categories
- Unit tests for individual services
- Integration tests for service interactions
- End-to-end tests for complete workflows
- Performance tests for load testing
- Error handling tests

### Running Tests

```bash
# Run all tests
npm test

# Run specific test suite
npm run test:headless

# Run with coverage
npm run test:coverage

# Run performance tests
npm run test:performance
```

## Performance Considerations

### Resource Management
- Configurable page limits
- Automatic cleanup of unused resources
- Memory usage monitoring
- CPU usage optimization

### Scalability
- Horizontal scaling with multiple instances
- Queue-based processing
- Background worker distribution
- Redis-based state management

### Optimization
- Lazy loading of resources
- Connection pooling
- Caching strategies
- Batch processing

## Security

### Security Features
- Input validation and sanitization
- Rate limiting
- CORS protection
- Helmet security headers
- Error message sanitization

### Best Practices
- Environment variable configuration
- Secure credential management
- Regular security updates
- Vulnerability scanning

## Deployment

### Docker Support
```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3001
CMD ["npm", "start"]
```

### Environment Setup
```bash
# Install dependencies
npm install

# Set environment variables
cp .env.example .env

# Start Redis
docker run -d -p 6379:6379 redis:alpine

# Start the service
npm run start:headless
```

## Troubleshooting

### Common Issues

1. **Browser Launch Failures**
   - Check system dependencies
   - Verify Chrome installation
   - Check memory availability

2. **Page Navigation Timeouts**
   - Increase timeout settings
   - Check network connectivity
   - Verify URL accessibility

3. **Memory Issues**
   - Reduce max pages limit
   - Enable automatic cleanup
   - Monitor memory usage

4. **Queue Backlogs**
   - Increase worker concurrency
   - Check Redis connectivity
   - Monitor queue processing

### Debug Mode

```bash
# Enable debug logging
LOG_LEVEL=debug npm start

# Enable verbose output
DEBUG=* npm start
```

## Contributing

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Install dependencies: `npm install`
4. Run tests: `npm test`
5. Make changes and test
6. Submit a pull request

### Code Standards
- TypeScript for type safety
- ESLint for code quality
- Prettier for formatting
- Jest for testing
- Comprehensive error handling

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review the troubleshooting guide
- Contact the development team
