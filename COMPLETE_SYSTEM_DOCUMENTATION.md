# LightDom Complete System Documentation

## 🚀 System Overview

LightDom is a comprehensive blockchain-based DOM optimization platform that combines web crawling, optimization algorithms, blockchain mining, and metaverse integration into a unified ecosystem.

## 🏗️ Architecture

### Core Systems
1. **Blockchain Mining System** - Mines blocks based on optimization results
2. **Web Crawler System** - Crawls and optimizes websites
3. **API Server** - RESTful API with comprehensive endpoints
4. **Frontend Application** - React-based PWA with Discord-style UI
5. **Database Integration** - PostgreSQL with comprehensive schemas
6. **PWA Features** - Offline support, push notifications, background sync

### Enhanced Features
- **Real-time Monitoring** - Health checks and performance metrics
- **PWA Notifications** - Push notifications for system events
- **Background Sync** - Automatic data synchronization
- **System Integration** - Unified management and control
- **Design System** - Consistent UI with animations and transitions

## 🔧 Installation & Setup

### Prerequisites
- Node.js 18+ 
- PostgreSQL 13+
- npm or yarn
- Git

### Quick Start
```bash
# Clone repository
git clone <repository-url>
cd LightDom

# Install dependencies
npm install

# Setup database
npm run db:setup

# Start complete system
node scripts/start-system-integration.js
```

### Individual Service Startup
```bash
# Start API server
node api-server-express.js

# Start enhanced systems (blockchain + crawler)
node scripts/start-enhanced-systems.js

# Start frontend
npm run dev

# Start complete system
node scripts/start-complete-system.js
```

## 📊 System Components

### 1. Blockchain Mining System (`blockchain/LightDomMiningSystem.js`)

**Features:**
- Real-time health monitoring
- Performance metrics tracking
- Network connectivity monitoring
- Mining statistics and rewards
- Error handling and recovery

**Key Methods:**
- `initialize(privateKey)` - Initialize blockchain connection
- `startMining()` - Begin mining process
- `stopMining()` - Stop mining process
- `getMiningStats()` - Get current mining statistics
- `getHealthStatus()` - Get system health status
- `subscribe(callback)` - Subscribe to real-time updates

**Configuration:**
```javascript
const config = {
  rpcUrl: 'http://localhost:8545',
  chainId: 1337,
  miningInterval: 30000,
  healthCheckInterval: 10000,
  maxRetries: 3,
  retryDelay: 5000
};
```

### 2. Web Crawler System (`crawler/RealWebCrawlerSystem.js`)

**Features:**
- Multi-threaded crawling
- DOM optimization analysis
- Performance monitoring
- Health status tracking
- Real-time statistics

**Key Methods:**
- `initialize()` - Initialize crawler system
- `startCrawling(urls)` - Begin crawling process
- `stopCrawling()` - Stop crawling process
- `getCrawlerStats()` - Get crawling statistics
- `getHealthStatus()` - Get system health
- `subscribe(callback)` - Subscribe to real-time updates

**Configuration:**
```javascript
const config = {
  maxConcurrency: 5,
  requestDelay: 2000,
  maxDepth: 2,
  healthCheckInterval: 15000,
  performanceUpdateInterval: 5000
};
```

### 3. API Server (`api-server-express.js`)

**Endpoints:**

#### Blockchain Endpoints
- `GET /api/blockchain/stats` - Get blockchain statistics
- `POST /api/blockchain/mine` - Trigger mining
- `GET /api/blockchain/health` - Get blockchain health

#### Crawler Endpoints
- `GET /api/crawler/stats` - Get crawler statistics
- `POST /api/crawler/start` - Start crawling
- `POST /api/crawler/stop` - Stop crawling
- `GET /api/crawler/health` - Get crawler health

#### Wallet Endpoints
- `GET /api/wallet/balance` - Get wallet balance
- `GET /api/wallet/transactions` - Get transaction history
- `POST /api/wallet/purchase` - Purchase items
- `POST /api/wallet/transfer` - Transfer funds

#### Metaverse Endpoints
- `GET /api/metaverse/stats` - Get metaverse statistics
- `GET /api/metaverse/bridges` - Get bridge data
- `POST /api/metaverse/bridges` - Create bridge
- `GET /api/metaverse/chatrooms` - Get chat rooms
- `POST /api/metaverse/chatrooms` - Create chat room

#### Headless Endpoints
- `GET /api/headless/status` - Get system status
- `POST /api/headless/blockchain/start-mining` - Start mining
- `POST /api/headless/crawler/start` - Start crawler
- `POST /api/headless/notifications/test` - Test notifications

### 4. Frontend Application

#### Main Components
- **`src/main.tsx`** - Main entry point with routing
- **`src/components/ui/EnhancedNavigation.tsx`** - Main navigation
- **`src/components/ui/wallet/WalletDashboard.tsx`** - Wallet interface
- **`src/components/ui/MetaverseDashboard.tsx`** - Metaverse interface

#### Design System
- **`src/styles/design-tokens.css`** - Design tokens and variables
- **`src/styles/component-system.css`** - Reusable component styles
- **`src/styles/animations.css`** - Animation utilities
- **`src/discord-theme.css`** - Discord-style theme

#### PWA Features
- **`public/sw.js`** - Enhanced service worker
- **`public/manifest.json`** - PWA manifest
- **`src/services/PWANotificationService.ts`** - Notification service

### 5. Database Schema

#### Core Tables
- `users` - User accounts and authentication
- `user_economy` - Wallet balances and transactions
- `transactions` - Transaction history
- `marketplace_items` - Available items for purchase

#### Metaverse Tables
- `space_bridges` - Bridge connections
- `metaverse_chatrooms` - Chat room data
- `chat_messages` - Message history
- `metaverse_portals` - Portal connections

#### System Tables
- `crawled_sites` - Crawled website data
- `space_allocations` - Space allocation tracking
- `schema_migrations` - Database migration tracking

## 🔔 PWA Features

### Service Worker (`public/sw.js`)
- **Multi-Cache Strategy** - Separate caches for static assets and API data
- **Background Sync** - Automatic data synchronization
- **Push Notifications** - Rich notifications with actions
- **Offline Support** - Cached content for offline use

### Manifest (`public/manifest.json`)
- **App Shortcuts** - Quick access to key features
- **Protocol Handlers** - Custom URL scheme support
- **Dark Theme** - Discord-style color scheme
- **Edge Side Panel** - Browser integration support

### Notification Service (`src/services/PWANotificationService.ts`)
- **System Alerts** - Success, warning, error, info notifications
- **Mining Notifications** - Block mining alerts
- **Optimization Notifications** - Crawler completion alerts
- **Wallet Notifications** - Transaction alerts
- **Metaverse Notifications** - Bridge and chat updates

## 🚀 System Integration

### Enhanced Systems Manager (`scripts/start-enhanced-systems.js`)
- **Unified Management** - Single point of control
- **Health Monitoring** - Continuous health checks
- **Event Coordination** - Centralized event handling
- **Performance Tracking** - Real-time metrics

### Complete System Startup (`scripts/start-complete-system.js`)
- **Automated Service Management** - Starts services in correct order
- **Prerequisites Checking** - Validates system requirements
- **Graceful Shutdown** - Proper cleanup and resource management
- **Health Monitoring** - Service health tracking

### System Integration (`scripts/start-system-integration.js`)
- **Real-time Integration** - Live data from all systems
- **Event System** - Comprehensive event handling
- **Performance Metrics** - Uptime and performance tracking
- **Notification System** - Automatic system notifications

## 📊 Monitoring & Health

### Health Monitoring
- **Service Health** - Individual service status tracking
- **Overall Health** - System-wide health assessment
- **Error Tracking** - Error count and history
- **Performance Metrics** - CPU, memory, network latency

### Performance Tracking
- **Uptime Monitoring** - System uptime tracking
- **Request Processing** - API request statistics
- **Error Rates** - Error occurrence tracking
- **Resource Usage** - System resource monitoring

### Real-time Updates
- **Event Emission** - Real-time system events
- **Data Subscribers** - Live data updates
- **Health Updates** - Continuous health monitoring
- **Performance Updates** - Live performance metrics

## 🔧 Configuration

### Environment Variables
```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=dom_space_harvester
DB_USER=postgres
DB_PASSWORD=postgres

# Blockchain
BLOCKCHAIN_RPC_URL=http://localhost:8545
BLOCKCHAIN_CHAIN_ID=1337
MINING_INTERVAL=30000

# Crawler
CRAWLER_MAX_CONCURRENCY=5
CRAWLER_REQUEST_DELAY=2000
CRAWLER_MAX_DEPTH=2

# API Server
PORT=3001
NODE_ENV=development

# Frontend
VITE_PORT=3000
```

### Service Configuration
Each service can be configured through environment variables or configuration objects passed during initialization.

## 🎯 Usage Examples

### Starting Blockchain Mining
```javascript
import { LightDomMiningSystem } from './blockchain/LightDomMiningSystem.js';

const miningSystem = new LightDomMiningSystem({
  rpcUrl: 'http://localhost:8545',
  miningInterval: 30000
});

await miningSystem.initialize('0x' + '1'.repeat(64));
await miningSystem.startMining();

// Subscribe to events
miningSystem.subscribe((data) => {
  console.log('Mining update:', data);
});
```

### Starting Web Crawler
```javascript
import { RealWebCrawlerSystem } from './crawler/RealWebCrawlerSystem.js';

const crawlerSystem = new RealWebCrawlerSystem({
  maxConcurrency: 5,
  requestDelay: 2000
});

await crawlerSystem.initialize();
await crawlerSystem.startCrawling(['https://example.com']);

// Subscribe to events
crawlerSystem.subscribe((data) => {
  console.log('Crawler update:', data);
});
```

### Using PWA Notifications
```javascript
import { pwaNotificationService } from './services/PWANotificationService';

// Initialize PWA features
await pwaNotificationService.initialize();

// Send notifications
await pwaNotificationService.sendSystemAlert('success', 'Operation completed');
await pwaNotificationService.sendMiningNotification(12345, 25.5);
await pwaNotificationService.sendOptimizationNotification('https://example.com', 15.2);
```

## 🔍 Troubleshooting

### Common Issues

#### Service Won't Start
- Check prerequisites (Node.js, PostgreSQL)
- Verify environment variables
- Check port availability
- Review service logs

#### Database Connection Issues
- Verify PostgreSQL is running
- Check connection credentials
- Ensure database exists
- Run database health check: `npm run db:health`

#### PWA Features Not Working
- Check browser support
- Verify service worker registration
- Check notification permissions
- Review console for errors

#### Blockchain/Crawler Issues
- Check system health endpoints
- Review service logs
- Verify system integration
- Check resource usage

### Debug Commands
```bash
# Check system health
curl http://localhost:3001/api/headless/status

# Check database health
npm run db:health

# Test notifications
curl -X POST http://localhost:3001/api/headless/notifications/test \
  -H "Content-Type: application/json" \
  -d '{"type": "system", "message": "Test notification"}'

# Check blockchain stats
curl http://localhost:3001/api/blockchain/stats

# Check crawler stats
curl http://localhost:3001/api/crawler/stats
```

## 📈 Performance Optimization

### System Optimization
- **Resource Monitoring** - Track CPU and memory usage
- **Connection Pooling** - Optimize database connections
- **Caching Strategies** - Implement effective caching
- **Load Balancing** - Distribute system load

### Frontend Optimization
- **Code Splitting** - Lazy load components
- **Bundle Optimization** - Minimize bundle size
- **Caching** - Effective browser caching
- **PWA Features** - Offline support and background sync

### Database Optimization
- **Indexing** - Proper database indexes
- **Query Optimization** - Efficient queries
- **Connection Management** - Connection pooling
- **Migration Strategy** - Efficient schema updates

## 🔒 Security Considerations

### API Security
- **Input Validation** - Validate all inputs
- **Authentication** - Secure authentication
- **Rate Limiting** - Prevent abuse
- **CORS Configuration** - Proper CORS setup

### Database Security
- **Connection Security** - Encrypted connections
- **Access Control** - Proper permissions
- **Data Encryption** - Sensitive data encryption
- **Backup Security** - Secure backups

### PWA Security
- **HTTPS Required** - Secure connections only
- **Service Worker Security** - Secure service workers
- **Notification Security** - Secure notifications
- **Data Protection** - Protect user data

## 🚀 Deployment

### Production Deployment
1. **Environment Setup** - Configure production environment
2. **Database Migration** - Run database migrations
3. **Service Deployment** - Deploy all services
4. **Health Monitoring** - Setup monitoring
5. **Backup Strategy** - Implement backups

### Docker Deployment
```dockerfile
# Dockerfile example
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["node", "api-server-express.js"]
```

### Monitoring Setup
- **Health Checks** - Continuous health monitoring
- **Performance Metrics** - Performance tracking
- **Error Tracking** - Error monitoring
- **Alerting** - Automated alerts

## 📚 API Reference

### Complete API Documentation
All API endpoints are documented with:
- **Request/Response Examples**
- **Error Codes**
- **Authentication Requirements**
- **Rate Limiting**
- **Data Validation**

### SDK Examples
- **JavaScript SDK** - Frontend integration
- **Node.js SDK** - Backend integration
- **REST API** - Direct API usage
- **WebSocket API** - Real-time updates

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create feature branch
3. Make changes
4. Run tests
5. Submit pull request

### Code Standards
- **TypeScript** - Use TypeScript for new code
- **ESLint** - Follow linting rules
- **Testing** - Write tests for new features
- **Documentation** - Update documentation

### Testing
- **Unit Tests** - Component and service tests
- **Integration Tests** - API and system tests
- **E2E Tests** - End-to-end testing
- **Performance Tests** - Performance testing

---

## 📞 Support

For support and questions:
- **Documentation** - Check this documentation
- **Issues** - Create GitHub issues
- **Discussions** - Use GitHub discussions
- **Community** - Join the community

---

*This documentation is continuously updated as the system evolves.*
