# LightDom Blockchain - Quick Start Guide

## 🚀 **What We Built**

A complete **LightDom Blockchain System** with:

- **Headless Chrome Mining**: Runs blockchain in background browser
- **Chrome Extension**: Real-time DOM optimization and mining
- **User-Specific Notifications**: Only LightDom users get updates
- **Advanced Monitoring**: Comprehensive metrics and analytics
- **Custom Blockchain URLs**: Direct access to bridge chats and mining

## 📁 **File Structure**

```
LightDom/
├── extension/                    # Chrome Extension (Manifest V3)
│   ├── manifest.json            # Extension configuration
│   ├── background.js            # Background service worker
│   ├── content.js               # Content script for DOM mining
│   ├── blockchain-miner.js      # Advanced mining script
│   ├── popup.html               # Extension popup interface
│   └── popup.js                 # Popup functionality
├── utils/                       # Utility classes
│   ├── HeadlessBlockchainRunner.js    # Headless Chrome runner
│   ├── BlockchainMetricsCollector.js  # Blockchain metrics
│   ├── CrawlerSupervisor.js           # Crawler management
│   └── MetricsCollector.js            # System metrics
├── api-server-express.js        # Main API server
├── start-blockchain.js          # System startup script
├── test-blockchain.js           # System testing script
└── BLOCKCHAIN_README.md         # Complete documentation
```

## 🏃‍♂️ **Quick Start**

### **1. Install Dependencies**

```bash
npm install
```

### **2. Start the Blockchain System**

```bash
# Option 1: Start everything at once
npm run blockchain

# Option 2: Start components separately
npm run api          # Start API server
npm run dev          # Start frontend (in another terminal)
```

### **3. Install Chrome Extension**

1. Open Chrome → `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked" → Select `extension/` folder
4. Click the LightDom icon to start mining

### **4. Test the System**

```bash
npm run test:blockchain
```

## 🔧 **Available Scripts**

```bash
# Development
npm run dev              # Start Vite frontend
npm run api              # Start API server only
npm run blockchain       # Start complete blockchain system

# Testing
npm run test:blockchain  # Test blockchain functionality

# Building
npm run build            # Build frontend
```

## 🌐 **Access Points**

- **Dashboard**: http://localhost:3000
- **API Server**: http://localhost:3001
- **Blockchain API**: http://localhost:3001/api/blockchain
- **Metrics**: http://localhost:3001/metrics
- **Health Check**: http://localhost:3001/api/health

## 🔌 **Chrome Extension Features**

### **Mining Control**

- Start/stop blockchain mining
- Real-time statistics display
- User address management
- Mining session tracking

### **DOM Optimization**

- Automatic website optimization
- Space savings detection
- Real-time notifications
- Performance monitoring

### **Blockchain Integration**

- Submit optimizations to blockchain
- Earn DSH tokens for space saved
- View mining rewards
- Track blockchain events

## 📊 **Monitoring & Metrics**

### **Real-time Metrics**

- **Network**: Nodes, latency, hash rate
- **Mining**: Blocks mined, optimizations, space saved
- **Users**: Active miners, sessions, retention
- **Performance**: Memory, CPU, response times
- **Economic**: DSH tokens, transactions, gas usage

### **Monitoring Endpoints**

```bash
# System metrics
GET /api/metrics

# Blockchain metrics
GET /api/blockchain/metrics

# Prometheus format
GET /metrics

# Health check
GET /api/health/detailed
```

## 🔐 **User-Specific Notifications**

### **LightDom Users Only**

- Notifications sent exclusively to blockchain participants
- Real-time optimization alerts
- Block mining notifications
- Bridge chat updates

### **Custom Blockchain URLs**

- Bridge chats: `/bridge/{bridgeId}`
- Mining sessions: User-specific interfaces
- Shareable links for collaboration
- Browser history support

## 🚀 **Advanced Features**

### **Headless Chrome Mining**

- Runs blockchain in background
- Advanced DOM analysis algorithms
- Real-time optimization detection
- Performance monitoring

### **Chrome Extension**

- Manifest V3 compliant
- Real-time DOM monitoring
- User authentication
- Cross-tab communication

### **Blockchain Integration**

- Ethereum-compatible smart contracts
- DSH token minting
- On-chain optimization proofs
- Gas optimization

## 🛠️ **Configuration**

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

### **Extension Settings**

- User address management
- Mining preferences
- Notification settings
- Performance tuning

## 🧪 **Testing**

### **Run Tests**

```bash
# Test blockchain system
npm run test:blockchain

# Test individual components
npm run test:api
npm run test:extension
npm run test:blockchain
```

### **Manual Testing**

1. Start the system: `npm run blockchain`
2. Install Chrome extension
3. Visit any website
4. Check mining statistics
5. View blockchain metrics

## 📈 **Performance**

### **Optimization Features**

- Efficient DOM analysis
- Minimal memory footprint
- Fast response times
- Scalable architecture

### **Monitoring**

- Real-time performance metrics
- Resource usage tracking
- Error rate monitoring
- Capacity planning

## 🆘 **Troubleshooting**

### **Common Issues**

1. **Extension not loading**: Check Chrome developer mode
2. **API not starting**: Check port 3001 availability
3. **Database errors**: Verify PostgreSQL connection
4. **Mining not working**: Check user address setup

### **Debug Mode**

```bash
# Enable Chrome devtools
CHROME_DEVTOOLS=true npm run blockchain

# Verbose logging
DEBUG=* npm run api
```

## 🎯 **Next Steps**

1. **Install Extension**: Load the Chrome extension
2. **Start Mining**: Click "Start Mining" in extension
3. **Browse Websites**: Visit sites to start mining
4. **Monitor Progress**: Check dashboard and metrics
5. **Earn Tokens**: Collect DSH for optimizations

## 📚 **Documentation**

- **Complete Guide**: `BLOCKCHAIN_README.md`
- **API Docs**: `/docs/api`
- **Extension Guide**: `/docs/extension`
- **Architecture**: `/docs/architecture`

---

**🎉 You're ready to mine the LightDom blockchain!**

Start with `npm run blockchain` and install the Chrome extension to begin mining DOM optimizations and earning DSH tokens! ⚡
