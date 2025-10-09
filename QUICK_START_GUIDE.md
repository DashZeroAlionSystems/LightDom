# LightDom Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Prerequisites
- Node.js 18+ installed
- PostgreSQL 13+ running
- Git installed

### 1. Clone and Install
```bash
git clone <repository-url>
cd LightDom
npm install
```

### 2. Setup Database
```bash
# Create database
createdb dom_space_harvester

# Run setup script
npm run db:setup
```

### 3. Start the System
```bash
# Start everything at once
node scripts/start-system-integration.js
```

### 4. Access the Application
- **Frontend**: http://localhost:3000
- **API Server**: http://localhost:3001
- **Health Check**: http://localhost:3001/api/health

## 🎯 Key Features

### 💰 Wallet System
- View LightDom coin balance
- Purchase items from marketplace
- Transfer funds between users
- Transaction history

### 🌉 Metaverse Dashboard
- Bridge network visualization
- Chat room management
- Real-time messaging
- Economy tracking

### ⛏️ Blockchain Mining
- Automatic block mining
- Real-time statistics
- Health monitoring
- Performance metrics

### 🕷️ Web Crawler
- Website optimization
- DOM analysis
- Performance tracking
- Space harvesting

### 📱 PWA Features
- Offline support
- Push notifications
- Background sync
- App shortcuts

## 🔧 Quick Commands

### Start Individual Services
```bash
# API Server only
node api-server-express.js

# Enhanced systems (blockchain + crawler)
node scripts/start-enhanced-systems.js

# Frontend only
npm run dev
```

### Health Checks
```bash
# Database health
npm run db:health

# System status
curl http://localhost:3001/api/headless/status

# Blockchain stats
curl http://localhost:3001/api/blockchain/stats

# Crawler stats
curl http://localhost:3001/api/crawler/stats
```

### Test Notifications
```bash
curl -X POST http://localhost:3001/api/headless/notifications/test \
  -H "Content-Type: application/json" \
  -d '{"type": "system", "message": "Test notification"}'
```

## 🎮 Navigation

### Main Routes
- `/` - Simple Dashboard
- `/dashboard` - User Dashboard
- `/wallet` - Wallet Interface
- `/metaverse` - Metaverse Dashboard
- `/admin` - Admin Panel (admin users only)

### App Shortcuts
- Right-click app icon for quick access
- Wallet, Metaverse, Dashboard shortcuts
- Protocol handler: `web+lightdom://`

## 🔔 Notifications

### Types
- **System Alerts** - Success, warning, error, info
- **Mining** - Block mining notifications
- **Optimization** - Crawler completion alerts
- **Wallet** - Transaction notifications
- **Metaverse** - Bridge and chat updates

### Setup
1. Allow notifications when prompted
2. Notifications work offline
3. Click notifications to navigate to relevant sections

## 🛠️ Troubleshooting

### Common Issues

#### Services Won't Start
```bash
# Check if ports are available
netstat -an | grep :3000
netstat -an | grep :3001

# Check Node.js version
node --version

# Check PostgreSQL
pg_isready
```

#### Database Issues
```bash
# Check database connection
npm run db:health

# Reset database
dropdb dom_space_harvester
createdb dom_space_harvester
npm run db:setup
```

#### PWA Issues
- Ensure HTTPS in production
- Check browser console for errors
- Verify service worker registration
- Check notification permissions

### Debug Mode
```bash
# Enable debug logging
DEBUG=* node scripts/start-system-integration.js

# Check service logs
tail -f logs/system.log
```

## 📊 Monitoring

### Health Dashboard
- System status overview
- Service health indicators
- Performance metrics
- Error tracking

### Real-time Updates
- Live data from blockchain
- Crawler progress updates
- Wallet balance changes
- Metaverse activity

### Performance Metrics
- Uptime tracking
- Request processing
- Error rates
- Resource usage

## 🔐 Security

### Authentication
- User registration/login
- Role-based access control
- Session management
- Password security

### Data Protection
- Encrypted connections
- Secure API endpoints
- Input validation
- Rate limiting

## 🚀 Advanced Usage

### Custom Configuration
```bash
# Environment variables
export BLOCKCHAIN_RPC_URL=http://localhost:8545
export CRAWLER_MAX_CONCURRENCY=10
export MINING_INTERVAL=15000
```

### API Integration
```javascript
// Example API usage
const response = await fetch('/api/wallet/balance', {
  headers: { 'x-user-id': 'user123' }
});
const data = await response.json();
```

### WebSocket Events
```javascript
// Real-time updates
const ws = new WebSocket('ws://localhost:3001/ws');
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Update:', data);
};
```

## 📚 Next Steps

1. **Explore Features** - Try all dashboard sections
2. **Test Notifications** - Send test notifications
3. **Monitor Performance** - Check health dashboard
4. **Customize Settings** - Adjust system configuration
5. **Read Documentation** - Check COMPLETE_SYSTEM_DOCUMENTATION.md

## 🆘 Need Help?

- **Documentation**: Check COMPLETE_SYSTEM_DOCUMENTATION.md
- **Issues**: Create GitHub issue
- **Community**: Join discussions
- **Support**: Contact support team

---

*Happy optimizing with LightDom! 🚀*
