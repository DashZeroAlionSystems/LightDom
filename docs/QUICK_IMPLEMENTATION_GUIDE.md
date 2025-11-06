# Quick Implementation Guide - Secure SEO & Onboarding

## 🚀 Quick Start (5 minutes)

### Step 1: Environment Setup
```bash
# Copy environment template
cp .env.example .env

# Generate encryption keys
node -e "console.log('ENCRYPTION_MASTER_KEY=' + require('crypto').randomBytes(32).toString('hex'))"

# Add the generated key to .env
```

### Step 2: Database Migration
```bash
# Run onboarding schema migration
psql -U postgres -d lightdom -f database/client_onboarding_schema.sql

# Verify tables created
psql -U postgres -d lightdom -c "\dt onboarding*"
```

### Step 3: Install Dependencies
```bash
npm install
# All required dependencies are already in package.json
```

### Step 4: Start Development Server
```bash
# Option 1: Full stack
npm run start:dev

# Option 2: Frontend only
npm run dev
```

## 📁 File Structure

```
LightDom/
├── src/
│   ├── security/
│   │   ├── encryption.ts              # Encryption service
│   │   └── schema-protection.ts       # Schema protection
│   ├── services/
│   │   └── onboarding-service.ts      # Onboarding logic
│   ├── api/
│   │   └── client-secure-routes.ts    # API endpoints
│   ├── components/
│   │   ├── dashboard/
│   │   │   └── ClientDashboard.tsx    # Dashboard component
│   │   └── ui/
│   │       └── infographics/
│   │           └── index.tsx          # Infographic components
│   └── ...
├── database/
│   └── client_onboarding_schema.sql   # Database schema
├── docs/
│   ├── SECURITY_ARCHITECTURE.md       # Security guide
│   ├── CLIENT_ONBOARDING_GUIDE.md     # Onboarding guide
│   ├── INFOGRAPHIC_DESIGN_GUIDE.md    # Design guide
│   └── FEATURE_SUMMARY_SECURE_ONBOARDING.md
└── ...
```

## 🔌 API Integration

### Backend Integration (Express)

```typescript
// In your main server file (e.g., api-server-express.js)
import clientSecureRoutes from './src/api/client-secure-routes';

// Add routes
app.use('/api/v1', clientSecureRoutes);

// That's it! All endpoints are now available
```

### Frontend Integration (React)

```tsx
import { ClientDashboard } from '@/components/dashboard/ClientDashboard';
import { TimelineStep } from '@/components/ui/infographics';

function App() {
  return (
    <div>
      {/* Client Dashboard */}
      <ClientDashboard clientId="client_123" />
      
      {/* Onboarding Timeline */}
      <TimelineStep
        stepNumber={1}
        title="Welcome"
        completed={true}
        icon={UserPlus}
      />
    </div>
  );
}
```

## 🔐 Security Setup

### Generate Master Key
```bash
# Generate 256-bit encryption key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Add to .env as ENCRYPTION_MASTER_KEY
```

### Initialize Encryption Service
```typescript
import { initializeEncryptionService } from '@/security/encryption';

// Initialize with your key (from environment)
initializeEncryptionService(process.env.ENCRYPTION_MASTER_KEY!);
```

### Protect Campaign Data
```typescript
import { getEncryptionService } from '@/security/encryption';

const service = getEncryptionService();

// Encrypt
const encrypted = service.encryptCampaign({
  schemas: [...],
  keywords: [...],
  contentStrategy: {...}
});

// Store encrypted data in database
await db.query(
  'INSERT INTO encrypted_campaigns (client_id, encrypted_data) VALUES ($1, $2)',
  [clientId, JSON.stringify(encrypted)]
);
```

## 🛣️ Onboarding Implementation

### Start Onboarding Flow

**Backend:**
```typescript
import { getOnboardingService } from '@/services/onboarding-service';

const service = getOnboardingService();
const session = service.startOnboarding('user@example.com', {
  referralSource: 'google_ads'
});
```

**Frontend:**
```typescript
const startOnboarding = async (email: string) => {
  const response = await fetch('/api/v1/onboarding/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  
  const { sessionToken } = await response.json();
  // Store token for subsequent requests
  sessionStorage.setItem('onboardingToken', sessionToken);
};
```

### Update Step Data
```typescript
const updateStep = async (stepNumber: number, data: any) => {
  const token = sessionStorage.getItem('onboardingToken');
  
  await fetch(`/api/v1/onboarding/steps/${stepNumber}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Session-Token': token
    },
    body: JSON.stringify(data)
  });
};
```

## 📊 Dashboard Usage

### Fetch Dashboard Data
```typescript
const getDashboardData = async (clientId: string, apiKey: string) => {
  const response = await fetch(`/api/v1/dashboard/${clientId}`, {
    headers: {
      'X-API-Key': apiKey
    }
  });
  
  return await response.json();
};
```

### Display Metrics
```tsx
import { MetricCard, ProgressGauge } from '@/components/ui/infographics';

function DashboardMetrics({ data }) {
  return (
    <div className="grid grid-cols-3 gap-6">
      <MetricCard
        title="SEO Score"
        value={data.seoScore.current}
        change={data.seoScore.change}
        trend="up"
      />
      
      <ProgressGauge
        value={data.seoScore.current}
        max={100}
        label="Overall Score"
      />
    </div>
  );
}
```

## 🎨 Infographic Components

### Using Infographic Components
```tsx
import {
  MetricCard,
  InfographicHeader,
  ProgressGauge,
  ComparisonCard,
  TimelineStep
} from '@/components/ui/infographics';

// Metric Card
<MetricCard
  title="Organic Traffic"
  value={45230}
  change={19}
  changeLabel="vs. last month"
  trend="up"
  format="number"
  showSparkline={true}
  sparklineData={[30000, 35000, 40000, 45230]}
/>

// Progress Gauge
<ProgressGauge
  value={85}
  max={100}
  label="SEO Score"
  size="lg"
  color="blue"
/>

// Comparison Card
<ComparisonCard
  beforeLabel="Before"
  beforeValue="72"
  afterLabel="After"
  afterValue="85"
  improvement={18}
  metric="SEO Score"
/>
```

## 🔒 Schema Protection

### Register Protected Schema
```typescript
import { getSchemaProtectionService } from '@/security/schema-protection';

const service = getSchemaProtectionService();

const schemaId = service.registerSchema({
  type: 'Product',
  structure: {
    '@type': 'Product',
    name: '{{product_name}}',
    // Internal optimization hints (will be encrypted)
    _optimization: {
      priceStrategy: 'dynamic',
      competitorTracking: true
    }
  },
  requiredFields: ['name', 'offers'],
  optimizationHints: {...} // Proprietary logic
});
```

### Get Schema for Client
```typescript
// Backend - sanitized version without proprietary hints
const schema = service.getSchemaForClient(schemaId, clientId, {
  url: 'https://example.com/product/123',
  timestamp: new Date().toISOString()
});

// Frontend - receives only public parts
{
  structure: {
    '@type': 'Product',
    name: '{{product_name}}'
    // No _optimization fields
  },
  requiredFields: ['name', 'offers']
}
```

## 🧪 Testing

### Run All Tests
```bash
# Unit tests
npm run test:unit

# Integration tests
npm run test:integration

# Security tests
npm run security:scan
```

### Test Encryption
```typescript
import { SEOEncryptionService } from '@/security/encryption';

const service = new SEOEncryptionService();

// Test encryption/decryption
const data = { secret: 'my campaign strategy' };
const encrypted = service.encrypt(data);
const decrypted = service.decrypt(encrypted);

console.assert(
  JSON.stringify(data) === JSON.stringify(decrypted),
  'Encryption roundtrip failed'
);
```

## 📈 Monitoring

### Check Service Health
```bash
curl http://localhost:3001/api/v1/health
```

### Monitor Rate Limits
```typescript
// Rate limit metrics are logged automatically
// Check logs for rate limit violations
grep "rate limit" logs/app.log
```

## 🐛 Troubleshooting

### Common Issues

**Issue: Encryption key not set**
```bash
Error: No master key provided
Solution: Set ENCRYPTION_MASTER_KEY in .env
```

**Issue: Session expired**
```bash
Error: Invalid or expired session
Solution: Session tokens expire after 7 days. Start new onboarding.
```

**Issue: Rate limit exceeded**
```bash
Error: Too many requests
Solution: Wait for the rate limit window to reset (shown in response)
```

**Issue: API key invalid**
```bash
Error: Invalid API key format
Solution: Ensure key starts with 'ld_live_' or 'ld_test_'
```

## 📝 Best Practices

### Security
✅ **Always** use HTTPS in production  
✅ **Never** commit encryption keys to git  
✅ **Rotate** API keys every 90 days  
✅ **Log** all security events  
✅ **Validate** all user input  

### Performance
✅ **Cache** dashboard data (5-minute TTL)  
✅ **Paginate** large result sets  
✅ **Compress** API responses  
✅ **Index** database queries  

### User Experience
✅ **Show** progress indicators  
✅ **Provide** helpful error messages  
✅ **Validate** forms in real-time  
✅ **Save** partial onboarding progress  

## 🔗 Additional Resources

- [Security Architecture](./SECURITY_ARCHITECTURE.md)
- [Onboarding Guide](./CLIENT_ONBOARDING_GUIDE.md)
- [Infographic Design Guide](./INFOGRAPHIC_DESIGN_GUIDE.md)
- [API Documentation](https://docs.lightdom.io/api)

## 🆘 Support

**Issues:** https://github.com/DashZeroAlionSystems/LightDom/issues  
**Email:** support@lightdom.io  
**Security:** security@lightdom.io

---

**Quick Reference Version:** 1.0.0  
**Last Updated:** 2024-11-02
