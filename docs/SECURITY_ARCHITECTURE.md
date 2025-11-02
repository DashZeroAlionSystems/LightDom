# LightDom Security Architecture & Best Practices

## 🔐 Overview

This document outlines the comprehensive security measures implemented in LightDom to protect:
- Proprietary SEO campaign strategies
- Rich snippet schema templates
- Client data and credentials
- API endpoints and integrations
- Business intelligence and algorithms

## 🛡️ Security Layers

### 1. Data Encryption

#### Campaign Data Encryption
All SEO campaign strategies, optimization algorithms, and proprietary methodologies are encrypted using **AES-256-GCM** encryption.

**Implementation:**
```typescript
import { getEncryptionService } from '@/security/encryption';

const encryptionService = getEncryptionService();

// Encrypt campaign data
const encryptedCampaign = encryptionService.encryptCampaign({
  schemas: [...],
  metaTags: {...},
  keywords: [...],
  contentStrategy: {...}
});

// Decrypt when needed (server-side only)
const decryptedCampaign = encryptionService.decrypt(encryptedCampaign);
```

**Key Features:**
- 256-bit AES encryption
- Galois/Counter Mode (GCM) for authenticated encryption
- Unique IV (Initialization Vector) per encryption
- PBKDF2 key derivation for additional security layer
- Authentication tags to prevent tampering

#### Rich Snippet Schema Protection
All proprietary rich snippet templates are encrypted and stored securely.

**Implementation:**
```typescript
import { getSchemaProtectionService } from '@/security/schema-protection';

const schemaService = getSchemaProtectionService();

// Register protected schema
const schemaId = schemaService.registerSchema({
  type: 'Product',
  structure: {...},
  optimizationHints: {...} // Encrypted, never exposed to clients
});

// Get sanitized version for client
const sanitizedSchema = schemaService.getSchemaForClient(schemaId, clientId);
```

### 2. API Security

#### API Key Management
- **Generation:** Cryptographically secure random keys
- **Storage:** Hashed with SHA-256 before database storage
- **Rotation:** Automatic rotation every 90 days (configurable)
- **Format:** `ld_live_` or `ld_test_` prefix for easy identification

**Best Practices:**
```bash
# .env configuration
ENCRYPTION_MASTER_KEY=<64-character-hex-key>
API_KEY_ROTATION_DAYS=90
API_KEY_HASH_ALGORITHM=sha256
```

#### Rate Limiting
Implemented at multiple levels:

```typescript
// Per-endpoint rate limits
const rateLimits = {
  onboarding: { maxRequests: 10, windowMs: 60000 },    // 10/min
  dashboard: { maxRequests: 100, windowMs: 60000 },     // 100/min
  schemas: { maxRequests: 1000, windowMs: 60000 },      // 1000/min
  reports: { maxRequests: 10, windowMs: 3600000 }       // 10/hour
};
```

#### Authentication Flow
1. Client provides API key in `X-API-Key` header
2. Server validates key format and existence
3. Server checks rate limits for this client
4. Server logs request for audit trail
5. Response is sent with appropriate data obfuscation

### 3. Data Obfuscation

#### Client-Facing Data
Never expose proprietary information to clients. Use obfuscation layers:

**Example:**
```typescript
// Internal data (encrypted)
const internalData = {
  rankingAlgorithm: 'proprietary_ml_model_v3',
  optimizationFactors: [
    { factor: 'semantic_density', weight: 0.35 },
    { factor: 'schema_completeness', weight: 0.28 },
    { factor: 'content_freshness', weight: 0.22 }
  ],
  competitorStrategies: {...}
};

// Client-facing data (obfuscated)
const publicData = {
  seoScore: 85,
  improvement: 'Significant',
  recommendations: [
    'Continue current optimization strategy',
    'Focus on content quality improvements'
  ]
};
```

#### Metrics Obfuscation Strategy
- **Show Results, Not Methods:** Display performance improvements without revealing how
- **Aggregate Data:** Provide summaries instead of granular details
- **Relative Metrics:** Use percentages and trends rather than absolute numbers
- **Contextual Information:** Always include industry benchmarks for context

### 4. Schema Security

#### Protected Fields
Schemas contain both public and private sections:

**Public (shown to clients):**
- Schema type (`@type`)
- Required fields list
- Basic validation rules
- Public metadata

**Private (encrypted, server-only):**
- Optimization algorithms (`_optimization` fields)
- Competitor analysis data
- ML model parameters
- Performance tuning configurations

**Implementation:**
```typescript
// Internal schema structure
const internalSchema = {
  '@type': 'Product',
  name: '{{product_name}}',
  offers: {...},
  // Private optimization hints
  _optimization: {
    priceStrategy: 'dynamic',
    reviewAggregation: 'weighted',
    competitorTracking: true
  }
};

// Sanitized for client
const clientSchema = sanitizeSchema(internalSchema);
// Result: { '@type': 'Product', name: '{{product_name}}', offers: {...} }
```

#### Usage Tracking
All schema usage is logged for:
- Abuse detection (excessive requests from single client)
- Performance analytics
- Billing verification
- Security auditing

### 5. Session Security

#### Onboarding Sessions
- **Token Generation:** 128-character random hex tokens
- **Expiration:** 7 days from creation (configurable)
- **Storage:** Server-side only, never in client localStorage
- **Validation:** Every request checks token validity and expiration

**Security Features:**
```typescript
// Session security configuration
const sessionConfig = {
  tokenLength: 128,          // bytes
  expirationDays: 7,
  maxConcurrentSessions: 3,  // per email
  cleanupIntervalHours: 24
};
```

### 6. Database Security

#### Encryption at Rest
Sensitive fields in database are encrypted:

```sql
-- Encrypted campaign data
CREATE TABLE encrypted_campaigns (
  id UUID PRIMARY KEY,
  client_id UUID REFERENCES seo_clients(id),
  encrypted_data JSONB NOT NULL,  -- AES-256 encrypted
  data_fingerprint VARCHAR(64) NOT NULL,  -- SHA-256 hash for integrity
  encryption_key_version VARCHAR(20)
);

-- API key storage (hashed, never plaintext)
CREATE TABLE seo_clients (
  id UUID PRIMARY KEY,
  api_key_hash VARCHAR(64) NOT NULL,  -- SHA-256 hash
  -- Original key is never stored
);
```

#### Row-Level Security
Implemented using PostgreSQL RLS:

```sql
-- Enable RLS
ALTER TABLE seo_clients ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own data
CREATE POLICY client_isolation ON seo_clients
  USING (user_id = current_user_id());
```

### 7. Network Security

#### HTTPS/TLS
- **Minimum Version:** TLS 1.3
- **Cipher Suites:** Modern, secure suites only
- **Certificate:** Valid SSL/TLS certificate required
- **HSTS:** HTTP Strict Transport Security enabled

**Configuration:**
```javascript
// Express server configuration
app.use(helmet({
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'nonce-{random}'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", 'https://api.lightdom.io']
    }
  }
}));
```

#### CORS Configuration
Strict CORS policies:

```javascript
const corsOptions = {
  origin: (origin, callback) => {
    // Check against whitelist
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  maxAge: 86400
};

app.use(cors(corsOptions));
```

## 🔍 Audit & Monitoring

### Logging Strategy

#### What to Log
✅ **Security Events:**
- Authentication attempts (success/failure)
- API key usage
- Rate limit violations
- Suspicious request patterns
- Schema access (for abuse detection)

✅ **Business Events:**
- Onboarding completions
- Plan upgrades/downgrades
- Report generations
- Campaign modifications

❌ **Never Log:**
- Plaintext API keys
- Unencrypted passwords
- Full schema templates
- Proprietary algorithms

### Security Monitoring

**Metrics to Track:**
```typescript
const securityMetrics = {
  // Authentication
  failedAuthAttempts: 'counter',
  successfulAuthAttempts: 'counter',
  
  // Rate limiting
  rateLimitViolations: 'counter',
  
  // API usage
  apiCallsPerClient: 'histogram',
  apiResponseTimes: 'histogram',
  
  // Suspicious activity
  multipleSessionsPerEmail: 'counter',
  unusualAccessPatterns: 'counter',
  schemaExcessiveRequests: 'counter'
};
```

### Incident Response

**Automated Responses:**
1. **Rate Limit Exceeded:** Temporary ban (5-60 minutes)
2. **Invalid Auth Attempts:** Progressive delays (exponential backoff)
3. **Suspicious Patterns:** Alert admin, flag account for review
4. **Data Breach Detected:** Immediate key rotation, client notification

## 🚀 Deployment Security

### Environment Variables

**Required Secure Variables:**
```bash
# Master encryption key (64-character hex)
ENCRYPTION_MASTER_KEY=<generate-with-crypto.randomBytes(32).toString('hex')>

# JWT secret for authentication
JWT_SECRET=<secure-random-string>

# Session secret
SESSION_SECRET=<secure-random-string>

# Database credentials (never commit)
DB_PASSWORD=<strong-password>

# API keys for external services (never commit)
STRIPE_SECRET_KEY=sk_live_...
```

**Best Practices:**
- ✅ Use `.env` files locally (never commit)
- ✅ Use environment variables in production
- ✅ Rotate secrets every 90 days
- ✅ Use different keys for dev/staging/production
- ❌ Never hardcode secrets in code
- ❌ Never commit `.env` files to git
- ❌ Never log sensitive environment variables

### Production Checklist

- [ ] All encryption keys are unique and secure (32+ bytes)
- [ ] HTTPS/TLS 1.3 enabled
- [ ] Rate limiting configured for all endpoints
- [ ] Database encryption at rest enabled
- [ ] Row-level security policies active
- [ ] API keys hashed before storage
- [ ] Schema templates encrypted
- [ ] Campaign data encrypted
- [ ] Audit logging enabled
- [ ] Monitoring alerts configured
- [ ] Backup encryption enabled
- [ ] Security headers configured (Helmet.js)
- [ ] CORS whitelist configured
- [ ] SQL injection protection (parameterized queries)
- [ ] XSS protection enabled
- [ ] CSRF tokens implemented

## 📋 Compliance

### GDPR Compliance
- ✅ Data encryption at rest and in transit
- ✅ Right to access (API endpoints for data export)
- ✅ Right to deletion (cascade deletes on client removal)
- ✅ Data portability (JSON export format)
- ✅ Consent tracking (onboarding flow)
- ✅ Data retention policies (configurable)

### SOC 2 Type II Considerations
- ✅ Access controls and authentication
- ✅ Encryption standards
- ✅ Audit logging
- ✅ Change management
- ✅ Incident response procedures
- ✅ Vendor security assessment

## 🔧 Security Testing

### Automated Testing

**Unit Tests:**
```bash
npm run test:security
```

**Integration Tests:**
```bash
npm run test:security:integration
```

**Penetration Testing:**
```bash
# Manual penetration testing checklist
- SQL injection attempts
- XSS attack vectors
- CSRF token bypass
- Authentication bypass
- Rate limit evasion
- API key enumeration
- Session hijacking
```

### Security Scan Tools
- **OWASP ZAP:** Automated vulnerability scanning
- **npm audit:** Dependency vulnerability checking
- **Snyk:** Continuous security monitoring
- **ESLint Security Plugin:** Code-level security checks

## 📚 Developer Guidelines

### Secure Coding Practices

**DO:**
- ✅ Use parameterized queries (never string concatenation)
- ✅ Validate all input (never trust client data)
- ✅ Sanitize output (prevent XSS)
- ✅ Use encryption service for sensitive data
- ✅ Hash passwords/API keys before storage
- ✅ Implement rate limiting on all public endpoints
- ✅ Log security events
- ✅ Use TypeScript for type safety

**DON'T:**
- ❌ Store plaintext passwords or API keys
- ❌ Expose internal error messages to clients
- ❌ Trust client-side validation alone
- ❌ Use deprecated cryptography algorithms
- ❌ Log sensitive data
- ❌ Expose stack traces in production
- ❌ Use default/weak encryption keys

### Code Review Checklist

When reviewing security-related code:

- [ ] All sensitive data is encrypted
- [ ] No hardcoded secrets or credentials
- [ ] Input validation is comprehensive
- [ ] Output is properly sanitized
- [ ] Authentication is required where needed
- [ ] Authorization checks are in place
- [ ] Rate limiting is configured
- [ ] Error messages don't leak sensitive info
- [ ] Logging doesn't include sensitive data
- [ ] Dependencies are up-to-date and secure

## 🆘 Incident Response

### Security Incident Procedure

**1. Detection**
- Automated alerts trigger
- Manual report received
- Security scan identifies issue

**2. Assessment**
- Determine severity (Critical/High/Medium/Low)
- Identify affected systems/data
- Estimate number of affected clients

**3. Containment**
- Isolate affected systems
- Rotate compromised credentials
- Enable additional monitoring

**4. Eradication**
- Fix vulnerability
- Deploy patch
- Verify fix effectiveness

**5. Recovery**
- Restore normal operations
- Monitor for recurrence
- Validate system integrity

**6. Post-Incident**
- Document incident
- Update security measures
- Notify affected parties if required
- Review and improve procedures

## 📞 Contact

**Security Team:** security@lightdom.io  
**Security Reports:** Report vulnerabilities privately to security team  
**Bug Bounty:** Details at https://lightdom.io/security/bug-bounty

---

**Document Version:** 1.0.0  
**Last Updated:** 2024-11-02  
**Next Review:** 2025-02-02
