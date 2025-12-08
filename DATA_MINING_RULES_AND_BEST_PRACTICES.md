# Data Mining Rules and Best Practices

## Executive Summary

This document establishes comprehensive data mining rules and best practices for the LightDom platform, ensuring ethical, legal, and effective data collection while respecting web standards and user privacy.

---

## Table of Contents

1. [Legal and Ethical Framework](#legal-and-ethical-framework)
2. [Technical Rules](#technical-rules)
3. [Rate Limiting and Politeness](#rate-limiting-and-politeness)
4. [Data Quality Standards](#data-quality-standards)
5. [Security and Privacy](#security-and-privacy)
6. [Performance Optimization](#performance-optimization)
7. [Error Handling and Resilience](#error-handling-and-resilience)
8. [Data Storage and Retention](#data-storage-and-retention)

---

## Legal and Ethical Framework

### Rule 1: Respect robots.txt
**MANDATORY - CRITICAL**

```javascript
// ALWAYS check and respect robots.txt
{
  "respectRobotsTxt": true,  // MUST be true
  "robotsTxtCache": 3600,    // Cache for 1 hour
  "userAgent": "LightDom Bot/1.0 (+https://lightdom.io/bot)"
}
```

**Implementation**:
- Parse robots.txt before crawling any domain
- Respect Crawl-delay directive
- Honor Disallow rules for all paths
- Check for specific rules for your User-Agent

**Example robots.txt handling**:
```
User-agent: *
Crawl-delay: 2
Disallow: /admin/
Disallow: /private/

User-agent: LightDom Bot
Crawl-delay: 5
Allow: /public/
```

### Rule 2: Honor Terms of Service (ToS)
**MANDATORY**

- Review ToS before scraping any site
- Do NOT scrape sites that explicitly prohibit it
- Respect "no-scrape" meta tags
- Honor copyright and intellectual property

```html
<!-- Respect these meta tags -->
<meta name="robots" content="noindex, nofollow">
<meta name="googlebot" content="noarchive">
```

### Rule 3: User Privacy and GDPR Compliance
**MANDATORY - LEGAL REQUIREMENT**

- Do NOT collect personally identifiable information (PII)
- Do NOT collect email addresses, phone numbers, or personal data
- Respect privacy policies
- Comply with GDPR, CCPA, and other privacy regulations

**Prohibited Data**:
- ❌ Email addresses
- ❌ Phone numbers
- ❌ Physical addresses
- ❌ Credit card information
- ❌ Social security numbers
- ❌ Passwords or authentication tokens
- ❌ Personal messages or private communications

**Allowed Data**:
- ✅ Public metadata (titles, descriptions)
- ✅ Public URLs and links
- ✅ Published content (articles, blog posts)
- ✅ Public structured data (Schema.org)
- ✅ Performance metrics (anonymized)

### Rule 4: Attribution and Fair Use

- Maintain source attribution
- Do NOT claim scraped content as original
- Respect copyright and fair use principles
- Link back to original sources

```javascript
{
  "metadata": {
    "source_url": "https://example.com/article",
    "scraped_at": "2025-11-16T14:30:00Z",
    "attribution": "Content from Example.com",
    "copyright": "© 2025 Example Inc."
  }
}
```

---

## Technical Rules

### Rule 5: Proper User-Agent Identification
**MANDATORY**

```javascript
const USER_AGENT = "LightDom Bot/1.0 (+https://lightdom.io/bot; contact@lightdom.io)";
```

**Requirements**:
- Identify your bot clearly
- Provide contact information
- Include link to bot information page
- Use consistent User-Agent across all requests

### Rule 6: Request Headers Best Practices

```javascript
const HEADERS = {
  'User-Agent': 'LightDom Bot/1.0 (+https://lightdom.io/bot)',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
  'Accept-Encoding': 'gzip, deflate, br',
  'DNT': '1',  // Do Not Track
  'Connection': 'keep-alive',
  'Upgrade-Insecure-Requests': '1'
};
```

### Rule 7: Follow Redirects Properly

```javascript
{
  "followRedirects": true,
  "maxRedirects": 5,
  "trackRedirectChain": true,
  "respectCrossDomainRedirects": true
}
```

### Rule 8: Handle Different Content Types

```javascript
const SUPPORTED_CONTENT_TYPES = [
  'text/html',
  'application/xhtml+xml',
  'application/xml',
  'text/xml',
  'application/json'
];

// Reject binary content unless specifically needed
const REJECTED_CONTENT_TYPES = [
  'image/*',
  'video/*',
  'audio/*',
  'application/pdf',  // Unless PDF parsing is required
  'application/octet-stream'
];
```

---

## Rate Limiting and Politeness

### Rule 9: Implement Aggressive Rate Limiting
**MANDATORY - PREVENT BANS**

```javascript
{
  "rateLimiting": {
    "requestsPerSecond": 1,      // Max 1 request/second per domain
    "requestsPerMinute": 30,     // Max 30 requests/minute per domain
    "requestsPerHour": 1000,     // Max 1000 requests/hour per domain
    "concurrentRequests": 2,     // Max 2 concurrent requests per domain
    "burstSize": 5,              // Allow burst of 5 requests
    "cooldownPeriod": 300000     // 5 min cooldown after hitting limits
  }
}
```

**Tiered Rate Limiting**:
- **Tier 1 (Unknown sites)**: 1 req/sec, 2 concurrent
- **Tier 2 (Known friendly)**: 5 req/sec, 5 concurrent
- **Tier 3 (Own domains)**: 20 req/sec, 10 concurrent

### Rule 10: Implement Exponential Backoff

```javascript
function calculateBackoff(attemptNumber, baseDelay = 1000) {
  const delay = Math.min(
    baseDelay * Math.pow(2, attemptNumber),
    300000  // Max 5 minutes
  );
  
  // Add jitter (±25%)
  const jitter = delay * 0.25 * (Math.random() - 0.5);
  return delay + jitter;
}

// Usage
{
  "retryStrategy": {
    "maxAttempts": 3,
    "baseDelay": 1000,
    "exponentialBackoff": true,
    "jitter": true
  }
}
```

### Rule 11: Respect Server Response Times

```javascript
{
  "adaptiveRateLimiting": {
    "enabled": true,
    "targetResponseTime": 1000,  // Target 1s response time
    "adjustmentFactor": 0.5,     // Slow down 50% if servers slow
    "minimumDelay": 500,         // Never go below 500ms
    "monitoringWindow": 100      // Monitor last 100 requests
  }
}
```

### Rule 12: Time-of-Day Awareness

```javascript
{
  "schedulingRules": {
    "preferOffPeakHours": true,
    "offPeakStart": "22:00",      // 10 PM
    "offPeakEnd": "06:00",        // 6 AM
    "pauseDuringPeakHours": false,
    "reduceRateDuringPeakHours": true,
    "peakHourMultiplier": 0.5     // 50% slower during peak
  }
}
```

---

## Data Quality Standards

### Rule 13: Validate All Extracted Data

```javascript
const validationRules = {
  "url": {
    "required": true,
    "format": "url",
    "maxLength": 2048
  },
  "title": {
    "required": true,
    "minLength": 10,
    "maxLength": 200,
    "sanitize": true
  },
  "description": {
    "required": false,
    "maxLength": 500,
    "sanitize": true
  },
  "timestamp": {
    "required": true,
    "format": "iso8601"
  }
};
```

### Rule 14: Data Sanitization

```javascript
function sanitizeData(data) {
  return {
    // Remove HTML tags
    cleanText: stripHtml(data.text),
    
    // Normalize whitespace
    normalized: normalizeWhitespace(data.text),
    
    // Remove null bytes
    safe: data.text.replace(/\0/g, ''),
    
    // Encode special characters
    encoded: encodeHtml(data.text),
    
    // Validate encoding
    validUtf8: ensureUtf8(data.text)
  };
}
```

### Rule 15: Deduplication Strategy

```javascript
{
  "deduplication": {
    "method": "content-hash",      // SHA-256 of normalized content
    "fields": ["url", "title", "content"],
    "threshold": 0.95,             // 95% similarity = duplicate
    "checkBefore": "storage",      // Check before storing
    "cacheSize": 100000,           // Cache last 100k URLs
    "persistentStorage": true       // Store in database
  }
}
```

### Rule 16: Metadata Completeness

**Required Metadata**:
```javascript
{
  "metadata": {
    "source_url": "string (required)",
    "scraped_at": "ISO8601 timestamp (required)",
    "scraper_version": "string (required)",
    "scraper_type": "string (required)",
    "http_status": "number (required)",
    "response_time_ms": "number (required)",
    "content_hash": "string (required)",
    "content_length": "number (required)",
    "content_type": "string (required)",
    "final_url": "string (if redirected)",
    "redirect_chain": "array (if applicable)"
  }
}
```

---

## Security and Privacy

### Rule 17: Secure Data Transmission

```javascript
{
  "security": {
    "https": {
      "required": true,
      "rejectUnauthorized": true,
      "minVersion": "TLSv1.2"
    },
    "certificateValidation": true,
    "strictTransportSecurity": true
  }
}
```

### Rule 18: Authentication Handling

```javascript
// NEVER store credentials in code
{
  "authentication": {
    "method": "env-variables",
    "secretsManager": "vault",
    "rotateKeys": true,
    "rotationInterval": "30d"
  }
}

// Use environment variables
const API_KEY = process.env.SCRAPING_API_KEY;
```

### Rule 19: PII Detection and Prevention

```javascript
const PII_PATTERNS = {
  email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
  phone: /(\+\d{1,3}[- ]?)?\d{10}/g,
  ssn: /\d{3}-\d{2}-\d{4}/g,
  creditCard: /\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}/g
};

function detectAndRedactPII(content) {
  let cleaned = content;
  
  for (const [type, pattern] of Object.entries(PII_PATTERNS)) {
    cleaned = cleaned.replace(pattern, `[${type.toUpperCase()}_REDACTED]`);
  }
  
  return cleaned;
}
```

### Rule 20: Access Control

```javascript
{
  "accessControl": {
    "requireAuthentication": true,
    "roleBasedAccess": true,
    "auditLogging": true,
    "ipWhitelist": ["10.0.0.0/8"],
    "apiKeyRotation": true
  }
}
```

---

## Performance Optimization

### Rule 21: Resource Management

```javascript
{
  "resources": {
    "maxMemoryPerInstance": "512MB",
    "maxCPUPerInstance": "1 core",
    "maxDiskUsage": "10GB",
    "cleanupInterval": 3600000,  // 1 hour
    "memoryThreshold": 0.8       // Alert at 80%
  }
}
```

### Rule 22: Connection Pooling

```javascript
{
  "connectionPool": {
    "minConnections": 5,
    "maxConnections": 50,
    "idleTimeout": 30000,
    "connectionTimeout": 10000,
    "keepAlive": true,
    "keepAliveTimeout": 60000
  }
}
```

### Rule 23: Caching Strategy

```javascript
{
  "caching": {
    "dns": {
      "enabled": true,
      "ttl": 86400  // 24 hours
    },
    "robotsTxt": {
      "enabled": true,
      "ttl": 3600   // 1 hour
    },
    "pages": {
      "enabled": true,
      "ttl": 604800,  // 7 days
      "maxSize": "1GB",
      "strategy": "LRU"
    },
    "assets": {
      "enabled": false  // Don't cache images, CSS, JS
    }
  }
}
```

### Rule 24: Compression

```javascript
{
  "compression": {
    "acceptEncoding": ["gzip", "deflate", "br"],
    "compressStorage": true,
    "compressionLevel": 6,
    "minSizeForCompression": 1024  // 1KB
  }
}
```

---

## Error Handling and Resilience

### Rule 25: Comprehensive Error Handling

```javascript
const ERROR_TYPES = {
  NETWORK: {
    timeout: { retry: true, backoff: true },
    connectionRefused: { retry: true, backoff: true },
    dnsError: { retry: true, backoff: true }
  },
  HTTP: {
    400: { retry: false, log: true },  // Bad Request
    401: { retry: false, alert: true }, // Unauthorized
    403: { retry: false, alert: true }, // Forbidden
    404: { retry: false, log: false },  // Not Found
    429: { retry: true, backoff: true, cooldown: 3600000 }, // Rate Limited
    500: { retry: true, backoff: true }, // Server Error
    502: { retry: true, backoff: true }, // Bad Gateway
    503: { retry: true, backoff: true }  // Service Unavailable
  },
  SCRAPING: {
    parseError: { retry: false, log: true },
    validationError: { retry: false, log: true },
    noContent: { retry: false, log: false }
  }
};
```

### Rule 26: Circuit Breaker Pattern

```javascript
{
  "circuitBreaker": {
    "enabled": true,
    "failureThreshold": 5,        // Open after 5 failures
    "successThreshold": 2,        // Close after 2 successes
    "timeout": 60000,             // 1 minute
    "halfOpenRequests": 1,        // Test with 1 request
    "monitoringWindow": 300000    // 5 minute window
  }
}
```

### Rule 27: Health Checks

```javascript
{
  "healthChecks": {
    "enabled": true,
    "interval": 30000,            // 30 seconds
    "timeout": 5000,              // 5 seconds
    "endpoints": [
      { url: "https://example.com", critical: true },
      { url: "https://api.example.com/health", critical: false }
    ],
    "alertOnFailure": true,
    "autoRestart": true
  }
}
```

### Rule 28: Logging and Monitoring

```javascript
{
  "logging": {
    "level": "info",              // debug, info, warn, error
    "format": "json",
    "destination": "file",        // file, database, cloudwatch
    "rotation": {
      "enabled": true,
      "maxSize": "100MB",
      "maxFiles": 10,
      "compress": true
    },
    "includeStackTrace": true,
    "sanitizeLogs": true          // Remove PII from logs
  }
}
```

---

## Data Storage and Retention

### Rule 29: Data Retention Policies

```javascript
{
  "retention": {
    "rawHtml": {
      "duration": "7d",           // Keep for 7 days
      "compress": true,
      "archiveAfter": "1d"
    },
    "extractedData": {
      "duration": "90d",          // Keep for 90 days
      "compress": false
    },
    "metadata": {
      "duration": "365d",         // Keep for 1 year
      "compress": false
    },
    "logs": {
      "duration": "30d",          // Keep for 30 days
      "compress": true,
      "archiveAfter": "7d"
    }
  }
}
```

### Rule 30: Data Backup

```javascript
{
  "backup": {
    "enabled": true,
    "frequency": "daily",
    "retention": 30,              // 30 days of backups
    "destinations": [
      { type: "s3", bucket: "lightdom-backups" },
      { type: "local", path: "/backups" }
    ],
    "encryption": true,
    "validation": true,           // Verify backup integrity
    "testRestore": "weekly"       // Test restore weekly
  }
}
```

---

## Compliance Checklist

### Pre-Scraping Checklist
- [ ] Reviewed target site's ToS
- [ ] Checked robots.txt
- [ ] Verified no explicit scraping prohibition
- [ ] Configured appropriate User-Agent
- [ ] Set conservative rate limits
- [ ] Enabled PII detection and redaction
- [ ] Configured error handling
- [ ] Set up monitoring and alerting

### During Scraping Checklist
- [ ] Monitor rate limits
- [ ] Check for HTTP 429 (rate limiting)
- [ ] Validate extracted data
- [ ] Remove PII from collected data
- [ ] Log all errors appropriately
- [ ] Monitor resource usage
- [ ] Respect server response times

### Post-Scraping Checklist
- [ ] Verify data quality
- [ ] Check for duplicates
- [ ] Validate metadata completeness
- [ ] Ensure proper attribution
- [ ] Secure data storage
- [ ] Apply retention policies
- [ ] Archive or delete raw HTML

---

## Ethical Guidelines

### The Three Pillars of Ethical Scraping

1. **Respect**: Respect website owners, users, and content creators
2. **Transparency**: Be transparent about what you're doing and why
3. **Responsibility**: Take responsibility for the impact of your scraping

### Best Practices
- ✅ Only scrape publicly accessible data
- ✅ Provide value back to the ecosystem
- ✅ Share insights responsibly
- ✅ Respect intellectual property
- ✅ Minimize server impact
- ✅ Honor opt-out requests
- ✅ Maintain data security
- ✅ Follow industry standards

### Red Flags (DO NOT PROCEED)
- ❌ Site explicitly prohibits scraping in ToS
- ❌ robots.txt disallows your bot
- ❌ Login required to access content
- ❌ CAPTCHA challenges on every request
- ❌ Site implements anti-scraping measures
- ❌ Content behind paywall
- ❌ Personal/private user data

---

## Implementation Example

### Complete Rule-Compliant Scraper Configuration

```javascript
{
  "scraper": {
    "name": "LightDom Compliant Scraper",
    "version": "1.0.0",
    "userAgent": "LightDom Bot/1.0 (+https://lightdom.io/bot)",
    
    "legal": {
      "respectRobotsTxt": true,
      "honorTermsOfService": true,
      "privacyCompliant": true,
      "gdprCompliant": true
    },
    
    "rateLimiting": {
      "requestsPerSecond": 1,
      "concurrentRequests": 2,
      "adaptiveRateLimiting": true,
      "exponentialBackoff": true
    },
    
    "dataQuality": {
      "validateAll": true,
      "sanitizeData": true,
      "deduplication": true,
      "metadataComplete": true
    },
    
    "security": {
      "httpsOnly": true,
      "piiDetection": true,
      "piiRedaction": true,
      "encryptionAtRest": true
    },
    
    "resilience": {
      "maxRetries": 3,
      "timeout": 30000,
      "circuitBreaker": true,
      "healthChecks": true
    },
    
    "storage": {
      "retentionPolicy": true,
      "compression": true,
      "backup": true,
      "encryption": true
    },
    
    "monitoring": {
      "logging": true,
      "metrics": true,
      "alerting": true,
      "auditTrail": true
    }
  }
}
```

---

## Conclusion

Following these rules ensures:
- ✅ **Legal Compliance**: Stay within the law
- ✅ **Ethical Operation**: Respect the web ecosystem
- ✅ **High Quality**: Collect accurate, clean data
- ✅ **Performance**: Efficient resource usage
- ✅ **Reliability**: Resilient to failures
- ✅ **Security**: Protected data and operations

**Remember**: Good data mining is about being a good citizen of the web. Always prioritize respect, transparency, and responsibility.

---

## Updates and Maintenance

This document should be reviewed and updated:
- Quarterly for regulatory changes
- After any legal consultation
- When adopting new technologies
- Following industry best practice updates

**Last Updated**: 2025-11-16
**Next Review**: 2026-02-16
