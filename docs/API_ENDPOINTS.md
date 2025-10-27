# LightDom Complete API Endpoint Documentation

## Overview
This document provides a complete reference for all API endpoints available in the LightDom platform.

**Base URL**: `http://localhost:3001/api`

**Total Endpoints**: 100+ endpoints across 15 categories

---

## 📊 Dashboard & Health

### Complete Dashboard Data
```
GET /api/dashboard/complete
```
Returns unified data from all services in a single call.

**Response:**
```json
{
  "timestamp": "2025-10-27T...",
  "services": {
    "crawler": { "isRunning": true, "crawledCount": 150 },
    "mining": { "activeSessions": 3 },
    "blockchain": { "connected": true },
    "spaceMining": { "totalSpaceMined": 50000 },
    "metaverse": { "bridges": 10 },
    "seo": { "trainingRecords": 1000 }
  }
}
```

### System Health
```
GET /api/health
```
Returns overall system health status.

---

## 🕷️ Web Crawler Endpoints

### Get Crawler Status
```
GET /api/crawler/status
```

### Get Crawler Statistics
```
GET /api/crawler/stats
```
Returns detailed crawler statistics with database metrics.

**Response:**
```json
{
  "isRunning": true,
  "crawledCount": 150,
  "discoveredCount": 500,
  "crawledLastHour": 15,
  "crawledToday": 45,
  "avgSeoScore": 85,
  "totalSpaceSaved": 250000,
  "seoTrainingRecords": 1000
}
```

### Get Recent Crawls
```
GET /api/crawler/recent?limit=10
```

### Start/Stop Crawler
```
POST /api/crawler/start
POST /api/crawler/stop
```

---

## ⛏️ Mining Service Endpoints

### Start Mining Session
```
POST /api/mining/start
```
**Body:**
```json
{
  "urls": ["https://example.com"],
  "config": {
    "maxDepth": 2,
    "maxConcurrency": 5
  }
}
```

### Get Mining Statistics
```
GET /api/mining/stats
```

### Stop Mining
```
POST /api/mining/stop
```

---

## 🔗 Blockchain Endpoints

### Get Blockchain Status
```
GET /api/blockchain/status
```

### Get Harvester Stats
```
GET /api/blockchain/harvester/:address
```

### Submit Optimization to Blockchain
```
POST /api/blockchain/submit-optimization
```

---

## 🎯 Optimization API Endpoints

### Submit Optimization Proof
```
POST /api/optimization/submit
```
**Body:**
```json
{
  "url": "https://example.com",
  "spaceSaved": 15000,
  "biomeType": "forest",
  "proofHash": "0x..."
}
```

### List Optimizations
```
GET /api/optimization/list?limit=50&offset=0
```

### Get Specific Optimization
```
GET /api/optimization/:proofHash
```

### Get Harvester Stats
```
GET /api/harvester/:address
```

### List All Harvesters
```
GET /api/harvester/list
```

### Get Metaverse Assets
```
GET /api/metaverse/assets
```

### Get Optimization Analytics
```
GET /api/analytics/optimization
```

### Get Optimization Feed
```
GET /api/feed/optimizations?limit=20
```

---

## 🧠 Blockchain Model Storage API

### Store Model Data
```
POST /api/blockchain-models/store
```

### Get Model Data
```
GET /api/blockchain-models/:modelId
```

### Update Model
```
PUT /api/blockchain-models/:modelId
```

### Delete Model
```
DELETE /api/blockchain-models/:modelId
```

### Get All Models
```
GET /api/blockchain-models/all
```

### Search Models
```
POST /api/blockchain-models/search
```

### Get Model Statistics
```
GET /api/blockchain-models/statistics
```

### Add Admin Access
```
POST /api/blockchain-models/admin/add
```

---

## 💾 Storage API Endpoints

### Get Storage Settings
```
GET /api/storage/settings
```

### Update Storage Settings
```
PUT /api/storage/settings
```

### Upload File
```
POST /api/storage/upload
```

### List Files
```
GET /api/storage/files
```

### Delete File
```
DELETE /api/storage/files/:fileId
```

### Get Storage Limits
```
GET /api/storage/limits
```

---

## ⚡ Space Mining API Endpoints

### Mine Space from URL
```
POST /api/space-mining/mine
```
**Body:**
```json
{
  "url": "https://example.com"
}
```

### Add to Mining Queue
```
POST /api/space-mining/queue
```

### Get All Bridges
```
GET /api/space-mining/bridges
```

### Get Bridge Details
```
GET /api/space-mining/bridge/:bridgeId
```

### Get Bridge URL
```
GET /api/space-mining/bridge/:bridgeId/url
```

### Get Isolated DOMs
```
GET /api/space-mining/isolated-doms
```

### Get Specific Isolated DOM
```
GET /api/space-mining/isolated-dom/:domId
```

### Get Spatial Structures
```
GET /api/space-mining/spatial-structures
```

### Get Mining Stats
```
GET /api/space-mining/stats
```

### Start Continuous Mining
```
POST /api/space-mining/start-continuous
```

### Generate Bridge Routes
```
POST /api/space-mining/generate-routes
```

### Test Bridge Connectivity
```
POST /api/space-mining/test-bridge/:bridgeId
```

---

## 🌉 Metaverse Bridge API

### Get Bridge Details
```
GET /api/metaverse/bridge/:bridgeId
```

### Get Bridge Chat
```
GET /api/metaverse/bridge/:bridgeId/chat
```

### Get Metaverse Mining Data
```
GET /api/metaverse/mining-data
```

---

## 👨‍💼 Admin Analytics API

### System Overview
```
GET /api/admin/analytics/overview
```

### Client Usage Metrics
```
GET /api/admin/analytics/clients
```

### Client Activity
```
GET /api/admin/analytics/client/:clientId/activity
```

### Mining Statistics
```
GET /api/admin/analytics/mining
```

### Billing Analytics
```
GET /api/admin/analytics/billing
```

### System Alerts
```
GET /api/admin/analytics/alerts
```

---

## 🚀 Startup & Refresh Handlers

### Get Startup Status
```
GET /api/startup/status
```

### Force Restart
```
POST /api/startup/restart
```

### Force Save Data
```
POST /api/refresh/save
```

### Get Save Status
```
GET /api/refresh/status
```

### Restore from Backup
```
POST /api/refresh/restore
```

---

## 💾 Persistent Storage API

### Load All Data
```
GET /api/persistent/data
```

### Get Storage Stats
```
GET /api/persistent/stats
```

### Sync with Blockchain
```
POST /api/persistent/sync
```

### Clear All Data
```
POST /api/persistent/clear
```

### Export Data
```
POST /api/persistent/export
```

### Import Data
```
POST /api/persistent/import
```

---

## ⚙️ User Settings API

### Get User Settings
```
GET /api/settings
```

### Update User Settings
```
PUT /api/settings
```

---

## 🤖 Automation Orchestration API

### Start Workflow
```
POST /api/automation/workflow/start
```

### Stop Workflow
```
POST /api/automation/workflow/stop
```

### Get Workflow Status
```
GET /api/automation/workflow/:jobId
```

### List All Workflows
```
GET /api/automation/workflows
```

### List All Jobs
```
GET /api/automation/jobs
```

### Start Autopilot
```
POST /api/automation/autopilot/start
```

### Evaluate Tasks
```
POST /api/automation/evaluate
```

### Execute Tasks
```
POST /api/automation/execute
```

### Get Metrics
```
GET /api/automation/metrics
```

### Get Evaluations
```
GET /api/automation/evaluations
```

### Schedule Workflow
```
POST /api/automation/schedule
```

### Get Automation Health
```
GET /api/automation/health
```

---

## 🎯 SEO Analytics API

### Get SEO Dashboard
```
GET /api/seo/dashboard
```

### Collect SEO Metrics
```
POST /api/seo/collect
```
**Body:**
```json
{
  "url": "https://example.com"
}
```

---

## 💰 Wallet Service API

### Get Wallet Balance
```
GET /api/wallet/balance
```

### Get Transaction History
```
GET /api/wallet/transactions
```

---

## 🔧 Optimization Engine API

### Submit Optimization Job
```
POST /api/optimization/submit
```

### Get Job Status
```
GET /api/optimization/status/:jobId
```

---

## 📊 Complete Endpoint Summary

| Category | Endpoint Count |
|----------|----------------|
| Dashboard & Health | 2 |
| Web Crawler | 4 |
| Mining Service | 3 |
| Blockchain | 3 |
| Optimization API | 9 |
| Blockchain Models | 8 |
| Storage API | 6 |
| Space Mining | 13 |
| Metaverse Bridge | 3 |
| Admin Analytics | 6 |
| Startup & Refresh | 5 |
| Persistent Storage | 6 |
| User Settings | 2 |
| Automation | 12 |
| SEO Analytics | 2 |
| Wallet Service | 2 |
| **TOTAL** | **86+ Endpoints** |

---

## 🔐 Authentication

Currently, most endpoints are open for development. In production, endpoints should be protected with:

- **JWT Tokens** for user authentication
- **API Keys** for service-to-service communication
- **Rate Limiting** to prevent abuse
- **CORS Configuration** for cross-origin requests

---

## 📝 Response Format

All API responses follow this consistent format:

**Success Response:**
```json
{
  "success": true,
  "data": { ... }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error message",
  "message": "Detailed error description"
}
```

---

## 🧪 Testing Endpoints

### Using cURL

```bash
# Test health endpoint
curl http://localhost:3001/api/health

# Get complete dashboard
curl http://localhost:3001/api/dashboard/complete

# Get crawler stats
curl http://localhost:3001/api/crawler/stats

# Submit optimization
curl -X POST http://localhost:3001/api/optimization/submit \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com","spaceSaved":15000}'
```

### Using JavaScript/Axios

```javascript
import axios from 'axios';

const API_BASE = 'http://localhost:3001/api';

// Get dashboard data
const dashboard = await axios.get(`${API_BASE}/dashboard/complete`);

// Start mining
const mining = await axios.post(`${API_BASE}/mining/start`, {
  urls: ['https://example.com']
});

// Get crawler stats
const stats = await axios.get(`${API_BASE}/crawler/stats`);
```

---

## 🔄 Real-time Updates

For real-time data updates, the dashboard should poll endpoints every 5 seconds:

```javascript
setInterval(async () => {
  const data = await axios.get('/api/dashboard/complete');
  updateUI(data);
}, 5000);
```

Future implementation will include WebSocket support for push-based updates.

---

## 📚 Additional Resources

- **Architecture Documentation**: `/docs/ARCHITECTURE.md`
- **Routes Specification**: `/src/api/routes.ts`
- **Main README**: `/README.md`

---

**Last Updated**: October 27, 2025
**API Version**: 1.0.0
