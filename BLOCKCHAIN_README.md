# LightDom Blockchain System

A revolutionary blockchain system that mines "Light DOM" - converting web optimization into tradeable digital assets and blockchain metaverse infrastructure.

## 🌟 Features

### 🔗 **Headless Chrome Blockchain Runner**
- Runs the LightDom blockchain in headless Chrome for mining and monitoring
- Real-time DOM optimization and space harvesting
- Advanced metrics collection and monitoring
- User-specific mining sessions

### 🔌 **Chrome Extension**
- **Manifest V3** compliant extension
- Real-time DOM monitoring and optimization
- User-specific notifications for LightDom users only
- Mining statistics and blockchain integration
- Popup interface for mining control

### 📊 **Advanced Monitoring**
- **Blockchain Metrics**: Network health, mining stats, optimization data
- **Performance Metrics**: Memory, CPU, response times, error rates
- **Economic Metrics**: DSH token minting, transaction volume, gas usage
- **User Metrics**: Active users, retention, session data

### 🎯 **User-Specific Notifications**
- Only LightDom blockchain users receive notifications
- Real-time optimization alerts
- Block mining notifications
- Bridge chat updates
- Custom routing to blockchain URLs

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Database
```bash
# Run PostgreSQL setup script
psql -U postgres -f postgresql-setup-script.sql
```

### 3. Install Chrome Extension
1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked" and select the `extension/` folder
4. The LightDom extension will be installed and ready

### 4. Start the System
```bash
# Start API server with blockchain runner
npm run dev

# Or start individual components
npm run api
npm run blockchain
```

## 🏗️ Architecture

### **Headless Chrome Integration**
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Chrome        │    │   LightDom       │    │   PostgreSQL    │
│   Extension     │◄──►│   API Server     │◄──►│   Database      │
│                 │    │                  │    │                 │
│ • DOM Mining    │    │ • Blockchain     │    │ • Optimizations │
│ • Notifications │    │   Runner         │    │ • Sessions      │
│ • User Auth     │    │ • Metrics        │    │ • Metrics       │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### **Blockchain Flow**
1. **Extension** monitors DOM on visited websites
2. **Headless Chrome** runs blockchain mining process
3. **API Server** coordinates mining sessions and metrics
4. **Database** stores optimizations and blockchain data
5. **Notifications** sent only to LightDom users

## 📱 Chrome Extension

### **Features**
- **Real-time DOM Mining**: Automatically optimizes websites you visit
- **User Authentication**: Secure user address management
- **Mining Control**: Start/stop mining with one click
- **Live Statistics**: See your mining progress in real-time
- **Notifications**: Get notified of optimizations and blocks mined

### **Installation**
1. Download the extension from `extension/` folder
2. Open Chrome → Extensions → Developer mode
3. Load unpacked extension
4. Click the LightDom icon to start mining

### **Usage**
1. **Start Mining**: Click "Start Mining" in the popup
2. **Browse Websites**: Visit any website to start mining
3. **View Stats**: Check your mining statistics
4. **Get Notifications**: Receive real-time updates

## 🔧 API Endpoints

### **Blockchain Endpoints**
```bash
# Start mining session
POST /api/blockchain/start-mining
{
  "userAddress": "0x...",
  "extensionId": "chrome-extension-id"
}

# Stop mining session
POST /api/blockchain/stop-mining
{
  "userAddress": "0x..."
}

# Submit optimization
POST /api/blockchain/submit-optimization
{
  "url": "https://example.com",
  "userAddress": "0x...",
  "domAnalysis": {...},
  "spaceSaved": 1024
}

# Get blockchain metrics
GET /api/blockchain/metrics

# Get blockchain status
GET /api/blockchain/status
```

### **Monitoring Endpoints**
```bash
# Prometheus metrics
GET /metrics

# JSON metrics
GET /api/metrics

# Detailed health check
GET /api/health/detailed
```

## 📊 Monitoring & Metrics

### **Blockchain Metrics**
- **Network**: Total nodes, active nodes, latency, hash rate
- **Mining**: Blocks mined, block time, difficulty, hash rate
- **Optimization**: Total optimizations, space saved, success rate
- **Users**: Active users, retention, session length
- **Performance**: Response time, requests/sec, error rate
- **Economic**: DSH minted, transaction volume, gas usage

### **Real-time Monitoring**
- WebSocket events for live updates
- Prometheus metrics for external monitoring
- Grafana dashboards (optional)
- Alert system for critical metrics

## 🔐 Security Features

### **User Authentication**
- Blockchain address verification
- Extension ID validation
- Session management
- Rate limiting

### **Data Protection**
- Encrypted storage
- Secure API endpoints
- Input validation
- SQL injection prevention

## 🌐 Custom Routing

### **Blockchain URLs**
- Each bridge chat has a unique URL: `/bridge/{bridgeId}`
- Direct access to specific mining sessions
- Shareable links for collaboration
- Browser history support

### **Extension Integration**
- Seamless navigation between extension and web interface
- Real-time synchronization
- Cross-tab communication
- Background processing

## 🚀 Advanced Features

### **Headless Chrome Mining**
- Runs blockchain in background
- Advanced DOM analysis
- Real-time optimization detection
- Performance monitoring

### **User-Specific Notifications**
- Only LightDom users receive notifications
- Real-time WebSocket updates
- Custom notification types
- Priority-based delivery

### **Metrics Collection**
- Comprehensive performance monitoring
- Historical data storage
- Trend analysis
- Alert system

## 🔧 Configuration

### **Environment Variables**
```bash
# Blockchain
BLOCKCHAIN_URL=http://localhost:3001/blockchain
HEADLESS_CHROME=true
CHROME_DEVTOOLS=false

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/lightdom

# API
PORT=3001
NODE_ENV=development
```

### **Extension Configuration**
- User address management
- Mining preferences
- Notification settings
- Performance tuning

## 📈 Performance

### **Optimization**
- Efficient DOM analysis algorithms
- Minimal memory footprint
- Fast response times
- Scalable architecture

### **Monitoring**
- Real-time performance metrics
- Resource usage tracking
- Error rate monitoring
- Capacity planning

## 🛠️ Development

### **Running Tests**
```bash
# Run all tests
npm run test:all

# Run specific test suites
npm run test:blockchain
npm run test:extension
npm run test:api
```

### **Building**
```bash
# Build extension
npm run build:extension

# Build API
npm run build:api

# Build everything
npm run build:all
```

## 📚 Documentation

- **API Documentation**: `/docs/api`
- **Extension Guide**: `/docs/extension`
- **Blockchain Spec**: `/docs/blockchain`
- **Architecture**: `/docs/architecture`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

- **Issues**: GitHub Issues
- **Discord**: LightDom Community
- **Email**: support@lightdom.io
- **Documentation**: /docs

---

**LightDom Blockchain** - Mining the future of web optimization! ⚡
