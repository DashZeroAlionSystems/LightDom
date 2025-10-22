# Admin Analytics Dashboard

## Overview

The Admin Analytics Dashboard provides comprehensive monitoring and analysis of the LightDom platform, integrating blockchain, metaverse, gamification, and billing features into a unified administrative interface.

## Features

### 1. System Overview
- **Key Metrics Display**
  - Total clients with active/trial/suspended breakdown
  - Total revenue and Monthly Recurring Revenue (MRR)
  - Platform-wide mining scores and algorithms discovered
  - Token minting statistics

- **System Health Monitoring**
  - CPU and memory usage tracking
  - System uptime monitoring
  - API response time metrics
  - Error rate tracking
  - Real-time performance indicators

- **Visual Analytics**
  - Client distribution pie chart
  - Optimization statistics
  - Growth trends visualization

### 2. Client Management
- **Comprehensive Client List**
  - Searchable client database
  - Filterable by status (active, trial, suspended, cancelled)
  - Sortable by multiple criteria
  - Real-time usage indicators

- **Usage Tracking**
  - API request consumption with percentage indicators
  - Storage utilization monitoring
  - Optimization tasks completed
  - Visual progress bars for resource usage

- **Drill-Down Capabilities**
  - Detailed client information drawer
  - Complete usage statistics
  - Mining performance metrics
  - Gamification achievements
  - Recent activity timeline
  - Performance analytics

### 3. Mining Statistics
- **Overall Mining Metrics**
  - Total mining operations across platform
  - Algorithms discovered count
  - Average mining scores
  - Token earnings tracking

- **Client Performance**
  - Top performers leaderboard
  - Mining score rankings
  - Algorithm discovery counts
  - Token earnings by client

- **Biome Analysis**
  - Operations by biome type
  - Authority scores by biome
  - Rewards distribution
  - Visual biome performance charts

### 4. Billing Analytics
- **Revenue Tracking**
  - Total revenue accumulation
  - Monthly revenue trends
  - Growth rate calculations
  - Revenue forecasting

- **Subscription Management**
  - Active subscription count
  - Trial conversion tracking
  - Cancellation monitoring
  - Churn rate analysis

- **Plan Performance**
  - Revenue by plan type
  - Subscriber distribution
  - Average revenue per user
  - Plan popularity metrics

- **Usage-Based Billing**
  - Total API calls
  - Total optimizations
  - Storage consumption
  - Overage charge calculations

- **Trend Analysis**
  - 30-day revenue trends
  - New client acquisition
  - Client churn tracking
  - Active client trends

### 5. Alert System
- **Real-Time Alerts**
  - Usage limit warnings (90% threshold)
  - Storage capacity alerts
  - Payment overdue notifications
  - System health warnings

- **Alert Categories**
  - Usage warnings
  - Storage warnings
  - Billing alerts
  - Critical system alerts

## API Endpoints

### System Overview
```
GET /api/admin/analytics/overview
Headers: x-admin-address: <ethereum_address>

Response:
{
  "success": true,
  "data": {
    "totalClients": 150,
    "activeClients": 120,
    "suspendedClients": 10,
    "trialClients": 20,
    "totalRevenue": 50000.00,
    "monthlyRecurringRevenue": 15000.00,
    "totalMiningScore": 1000000,
    "totalAlgorithmsDiscovered": 500,
    "totalOptimizations": 10000,
    "totalTokensMinted": 10000000,
    "systemHealth": {
      "uptime": 864000,
      "cpuUsage": 45.2,
      "memoryUsage": 62.8,
      "diskUsage": 35.5,
      "apiResponseTime": 45,
      "errorRate": 0.1
    }
  }
}
```

### Client Usage Metrics
```
GET /api/admin/analytics/clients
Headers: x-admin-address: <ethereum_address>

Response:
{
  "success": true,
  "data": [
    {
      "clientId": "client_1_1234567890",
      "clientName": "Acme Corp",
      "planId": "enterprise",
      "planName": "Enterprise Plan",
      "status": "active",
      "usage": {
        "requestsThisMonth": 8500,
        "requestsLimit": 100000,
        "requestsPercentage": 8.5,
        "storageUsedGB": 45.2,
        "storageLimit": 100,
        "storagePercentage": 45.2,
        "apiCallsToday": 350,
        "apiCallsLimit": 10000,
        "optimizationTasksCompleted": 450
      },
      "mining": {
        "totalMiningScore": 15000,
        "algorithmsDiscovered": 25,
        "elementsCollected": 150,
        "combinationsCompleted": 80,
        "totalTokensEarned": 150000
      },
      "gamification": {
        "level": 35,
        "experiencePoints": 52000,
        "achievementsUnlocked": 42,
        "questsCompleted": 89,
        "currentStreak": 15,
        "rank": "Master"
      },
      "billing": {
        "currentPeriodStart": 1697846400000,
        "currentPeriodEnd": 1700438400000,
        "totalCharges": 1500.00,
        "lastPaymentDate": 1697846400000,
        "paymentStatus": "paid"
      },
      "lastActive": 1697932800000,
      "createdAt": 1690070400000
    }
  ]
}
```

### Client Activity Detail
```
GET /api/admin/analytics/client/:clientId/activity
Headers: x-admin-address: <ethereum_address>

Response:
{
  "success": true,
  "data": {
    "clientId": "client_1_1234567890",
    "activities": [
      {
        "timestamp": 1697932800000,
        "type": "optimization",
        "description": "Optimization activity",
        "metadata": {
          "success": true
        }
      }
    ],
    "performanceMetrics": {
      "averageOptimizationTime": 1.2,
      "successRate": 95.5,
      "resourceUtilization": 65.3
    }
  }
}
```

### Mining Statistics
```
GET /api/admin/analytics/mining
Headers: x-admin-address: <ethereum_address>

Response:
{
  "success": true,
  "data": {
    "overall": {
      "totalMiningOperations": 50000,
      "totalAlgorithmsDiscovered": 500,
      "totalDataMined": 10000,
      "averageMiningScore": 1000,
      "totalTokensEarned": 5000000
    },
    "byClient": [
      {
        "clientId": "client_1",
        "clientName": "Top Client",
        "miningScore": 25000,
        "algorithmsDiscovered": 50,
        "tokensEarned": 250000,
        "lastMiningActivity": 1697932800000
      }
    ],
    "byBiome": [
      {
        "biomeType": "digital_realm",
        "biomeCount": 5,
        "totalOperations": 10000,
        "averageAuthority": 75.5,
        "totalRewards": 100000
      }
    ],
    "topPerformers": [
      {
        "clientId": "client_1",
        "clientName": "Top Client",
        "metric": "Mining Score",
        "value": 25000,
        "rank": 1
      }
    ]
  }
}
```

### Billing Analytics
```
GET /api/admin/analytics/billing
Headers: x-admin-address: <ethereum_address>

Response:
{
  "success": true,
  "data": {
    "revenue": {
      "total": 150000.00,
      "thisMonth": 15000.00,
      "lastMonth": 14000.00,
      "growthRate": 7.14
    },
    "subscriptions": {
      "active": 120,
      "trial": 20,
      "cancelled": 10,
      "churnRate": 6.67
    },
    "plans": [
      {
        "planId": "enterprise",
        "planName": "Enterprise Plan",
        "subscriberCount": 30,
        "revenue": 89700.00,
        "averageRevenue": 2990.00
      }
    ],
    "usage": {
      "totalApiCalls": 500000,
      "totalOptimizations": 50000,
      "totalStorageGB": 2500,
      "overageCharges": 5000.00
    },
    "trends": [
      {
        "date": "2023-10-01",
        "revenue": 500.00,
        "newClients": 2,
        "churnedClients": 0,
        "activeClients": 120
      }
    ]
  }
}
```

### System Alerts
```
GET /api/admin/analytics/alerts
Headers: x-admin-address: <ethereum_address>

Response:
{
  "success": true,
  "data": {
    "alerts": [
      {
        "type": "usage_warning",
        "severity": "warning",
        "clientId": "client_1",
        "clientName": "Acme Corp",
        "message": "Client approaching request limit (9500/10000)",
        "timestamp": 1697932800000
      }
    ],
    "count": 5
  }
}
```

## Usage

### Accessing the Dashboard

1. Navigate to `/admin/analytics` in your browser
2. Ensure you have admin credentials stored in localStorage:
   ```javascript
   localStorage.setItem('adminAddress', '0x1234567890123456789012345678901234567890');
   ```
3. The dashboard will automatically load with real-time data

### Dashboard Navigation

The dashboard uses tabs for easy navigation:

- **Overview**: High-level system metrics and health
- **Clients**: Detailed client management and monitoring
- **Mining Statistics**: Platform-wide mining analytics
- **Billing Analytics**: Revenue and subscription tracking

### Client Drill-Down

1. Navigate to the **Clients** tab
2. Use search and filters to find specific clients
3. Click "View Details" on any client row
4. A drawer will open with:
   - Complete client information
   - Usage statistics with progress bars
   - Mining performance metrics
   - Gamification achievements
   - Recent activity timeline
   - Performance analytics

### Using Filters

#### Client Search
```
Type in the search box to filter by:
- Client name
- Client ID
```

#### Status Filter
```
Select from dropdown:
- All Status
- Active
- Trial
- Suspended
- Cancelled
```

### Auto-Refresh

The dashboard automatically refreshes every 30 seconds to provide real-time updates. Manual refresh is available via the "Refresh" button.

## Security

### Authentication

All admin analytics endpoints require authentication via the `x-admin-address` header:

```typescript
headers: {
  'x-admin-address': '0x1234567890123456789012345678901234567890'
}
```

### Authorization

- Admin addresses must be 42 characters long (including '0x' prefix)
- Addresses must start with '0x'
- Invalid addresses receive a 403 Forbidden response
- No client data is exposed without valid admin authentication

### Data Protection

- All sensitive client data is protected by admin authentication
- API responses exclude sensitive information like API keys
- Error messages do not expose internal system details

## Integration with Existing Systems

### Client Management System
The analytics dashboard integrates with the `ClientManagementSystem` to provide:
- Real-time client data
- Usage tracking
- Plan management
- Billing information

### Metaverse Mining Engine
Integration with `MetaverseMiningEngine` provides:
- Mining score tracking
- Algorithm discovery monitoring
- Biome statistics
- Token earnings

### Gamification Engine
Integration with `GamificationEngine` provides:
- User levels and experience
- Achievement tracking
- Quest completion
- Streak monitoring
- Rank calculations

### Billing System
Integration with the billing API provides:
- Revenue tracking
- Subscription management
- Payment status
- Usage-based billing

## Customization

### Adjusting Alert Thresholds

Alerts trigger at 90% usage by default. To customize:

```typescript
// In adminAnalyticsApi.ts
if (client.usage.requestsThisMonth > client.plan.limits.requestsPerMonth * 0.9) {
  // Change 0.9 to your desired threshold (e.g., 0.8 for 80%)
}
```

### Adding Custom Metrics

To add custom metrics to the overview:

1. Update the `SystemOverview` interface in `adminAnalyticsApi.ts`
2. Calculate the metric in `getSystemOverview()`
3. Display in `AdminAnalyticsDashboard.tsx`

Example:
```typescript
// Add to SystemOverview interface
customMetric: number;

// Calculate in getSystemOverview()
customMetric: calculateCustomMetric(),

// Display in dashboard
<Card>
  <Statistic
    title="Custom Metric"
    value={overview.customMetric}
  />
</Card>
```

### Styling

The dashboard uses Ant Design components with custom CSS in `AdminAnalyticsDashboard.css`. To customize:

```css
/* Custom card styling */
.admin-analytics-dashboard .ant-card {
  border-radius: 16px; /* Increase border radius */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); /* Custom shadow */
}

/* Custom statistic styling */
.admin-analytics-dashboard .ant-statistic-content {
  font-size: 28px; /* Larger font */
  font-weight: 700; /* Bolder text */
}
```

## Testing

Run the comprehensive test suite:

```bash
# Run all admin analytics tests
npm test tests/integration/api/adminAnalytics.test.ts

# Run specific test suites
npm test -- --grep "System Overview"
npm test -- --grep "Client Management"
npm test -- --grep "Mining Statistics"
npm test -- --grep "Billing Analytics"
npm test -- --grep "Security"
```

### Test Coverage

The test suite covers:
- ✅ All API endpoints
- ✅ Authentication and authorization
- ✅ Data validation
- ✅ Error handling
- ✅ Security measures
- ✅ Performance benchmarks
- ✅ Edge cases

## Performance Optimization

### Caching

Consider implementing caching for frequently accessed data:

```typescript
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 60000; // 1 minute

function getCachedData(key: string, fetchFn: () => Promise<any>) {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  
  const data = await fetchFn();
  cache.set(key, { data, timestamp: Date.now() });
  return data;
}
```

### Pagination

For large datasets, implement pagination:

```typescript
// Client list with pagination
const PAGE_SIZE = 50;
const page = parseInt(req.query.page as string) || 1;
const offset = (page - 1) * PAGE_SIZE;
const clients = clientSystem.getAllClients()
  .slice(offset, offset + PAGE_SIZE);
```

### Database Indexing

If using a database, ensure proper indexing:

```sql
CREATE INDEX idx_client_status ON clients(status);
CREATE INDEX idx_client_plan ON clients(plan_id);
CREATE INDEX idx_mining_score ON client_mining(mining_score DESC);
```

## Troubleshooting

### Common Issues

#### 403 Forbidden Error
**Cause**: Invalid or missing admin address
**Solution**: Verify admin address in localStorage or request headers

#### Slow Dashboard Loading
**Cause**: Large number of clients or complex queries
**Solution**: Implement pagination and caching

#### Missing Data
**Cause**: Core systems not properly initialized
**Solution**: Ensure ClientManagementSystem, MetaverseMiningEngine, and GamificationEngine are running

#### Auto-Refresh Not Working
**Cause**: Component unmounted or network issues
**Solution**: Check browser console for errors, verify network connectivity

## Future Enhancements

### Planned Features
- [ ] WebSocket integration for real-time updates
- [ ] Export functionality (CSV, PDF)
- [ ] Custom date range filtering
- [ ] Advanced filtering and sorting
- [ ] Email notifications for alerts
- [ ] Role-based access control
- [ ] Audit logging
- [ ] Custom dashboard layouts
- [ ] Mobile responsive design improvements
- [ ] Dark mode support

### API Enhancements
- [ ] GraphQL API support
- [ ] Rate limiting per admin
- [ ] API key rotation
- [ ] Webhook notifications
- [ ] Bulk operations support

## Support

For issues or questions regarding the Admin Analytics Dashboard:

1. Check this documentation
2. Review test cases for usage examples
3. Check the browser console for errors
4. Review API response messages
5. Contact the development team

## License

This feature is part of the LightDom Enterprise Platform and follows the same license terms.

---

**Last Updated**: October 2024  
**Version**: 1.0.0  
**Maintainer**: LightDom Development Team
