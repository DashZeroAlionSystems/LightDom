# Enterprise Coding Rules & Standards Enforcement

## Overview

This document outlines the enterprise-level coding standards, rules, and best practices for the LightDom project. These rules are designed to ensure code quality, maintainability, security, and consistency across the entire codebase.

## Core Principles

### 1. REVIEW EXISTING CODE BEFORE WRITING NEW CODE

**Critical Rule**: Always search for and review existing implementations before creating new code.

**Process**:
1. Search codebase for similar functionality (`grep`, `find`, IDE search)
2. Review existing services, utilities, and components
3. Check documentation for existing solutions
4. Look for disconnected or unused code that might solve the problem
5. Only write new code if no existing solution is found

**Rationale**: We have substantial existing code that may not be hooked up. Reusing and connecting existing code is faster and more maintainable than writing new code.

**Examples**:
```bash
# Before creating a new SEO extractor service
grep -r "seo.*extract" services/
grep -r "attribute.*extract" services/
find . -name "*seo*" -o -name "*attribute*"

# Before creating a new animation service
grep -r "animation.*mine" services/
grep -r "styleguide.*extract" services/
```

### 2. Document As You Go

- Update documentation when modifying features
- Add comments for complex logic
- Update README files for new services
- Keep API documentation current
- Document configuration changes

### 3. Test Functionality, Not Just Structure

- Test that services actually start and connect
- Verify APIs return real data (not mocks)
- Ensure database connections work in practice
- Test end-to-end workflows
- Run `npm run compliance:check` before committing

---

## Code Quality Standards

### TypeScript/JavaScript

```typescript
// ✅ GOOD: Descriptive names, proper typing, error handling
async function extractSEOAttributes(
  html: string,
  url: string
): Promise<SEOAttributes> {
  try {
    const $ = cheerio.load(html);
    
    const attributes: SEOAttributes = {
      url,
      timestamp: new Date().toISOString(),
      title: $('title').text().trim() || '',
      // ... more attributes
    };
    
    return attributes;
  } catch (error) {
    logger.error('Failed to extract SEO attributes', { url, error });
    throw new SEOExtractionError('Attribute extraction failed', { cause: error });
  }
}

// ❌ BAD: Vague names, no types, poor error handling
async function extract(h, u) {
  const $ = cheerio.load(h);
  return {
    u,
    t: $('title').text()
  };
}
```

### React Components

```typescript
// ✅ GOOD: Functional component, proper types, hooks
interface SEODashboardProps {
  clientId: string;
  apiKey: string;
  theme?: 'light' | 'dark';
}

export const SEODashboard: React.FC<SEODashboardProps> = ({ 
  clientId, 
  apiKey, 
  theme = 'light' 
}) => {
  const [data, setData] = useState<SEOData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/seo/data?clientId=${clientId}`, {
          headers: { 'X-API-Key': apiKey }
        });
        
        if (!response.ok) {
          throw new Error(`API error: ${response.statusText}`);
        }
        
        const data = await response.json();
        setData(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [clientId, apiKey]);
  
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  if (!data) return null;
  
  return (
    <div className={`seo-dashboard theme-${theme}`}>
      {/* Dashboard content */}
    </div>
  );
};

// ❌ BAD: Class component, no types, inline styles
export class Dashboard extends React.Component {
  render() {
    return (
      <div style={{ padding: '20px' }}>
        {this.props.data.map(d => <div>{d}</div>)}
      </div>
    );
  }
}
```

### API Development

```typescript
// ✅ GOOD: RESTful, validated, error handling, logging
import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

const AttributeExtractionSchema = z.object({
  url: z.string().url(),
  depth: z.enum(['basic', 'full']).default('basic'),
  includeImages: z.boolean().default(true)
});

export async function extractAttributes(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Validate input
    const params = AttributeExtractionSchema.parse(req.body);
    
    // Rate limiting check
    await checkRateLimit(req.ip);
    
    // Extract attributes
    const attributes = await seoExtractor.extract(params.url, {
      depth: params.depth,
      includeImages: params.includeImages
    });
    
    // Log success
    logger.info('Attributes extracted', {
      url: params.url,
      attributeCount: Object.keys(attributes).length
    });
    
    // Return response
    res.status(200).json({
      success: true,
      data: attributes,
      meta: {
        extractedAt: new Date().toISOString(),
        attributeCount: Object.keys(attributes).length
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors
      });
    } else {
      logger.error('Attribute extraction failed', { error });
      next(error); // Pass to error handler middleware
    }
  }
}

// ❌ BAD: No validation, poor error handling
export function extract(req, res) {
  const url = req.body.url;
  const attrs = getAttrs(url);
  res.json(attrs);
}
```

---

## Security Requirements

### Input Validation

```typescript
// ✅ GOOD: Comprehensive validation
import { z } from 'zod';
import DOMPurify from 'isomorphic-dompurify';

const UserInputSchema = z.object({
  url: z.string().url().refine(
    url => !url.includes('javascript:'),
    'Invalid URL scheme'
  ),
  content: z.string().max(10000),
  options: z.object({
    depth: z.number().int().min(1).max(5),
    timeout: z.number().int().min(1000).max(30000)
  }).optional()
});

function sanitizeContent(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'a'],
    ALLOWED_ATTR: ['href']
  });
}

// ❌ BAD: No validation, XSS vulnerability
function processInput(html) {
  return `<div>${html}</div>`; // XSS risk!
}
```

### SQL Injection Prevention

```typescript
// ✅ GOOD: Parameterized queries
async function getUserData(userId: string): Promise<User> {
  const result = await db.query(
    'SELECT * FROM users WHERE id = $1',
    [userId]
  );
  return result.rows[0];
}

// ❌ BAD: String concatenation, SQL injection risk
async function getUserData(userId) {
  const result = await db.query(
    `SELECT * FROM users WHERE id = '${userId}'`
  );
  return result.rows[0];
}
```

### Secret Management

```typescript
// ✅ GOOD: Environment variables, never committed
import dotenv from 'dotenv';
dotenv.config();

const config = {
  apiKey: process.env.API_KEY!,
  dbPassword: process.env.DB_PASSWORD!,
  jwtSecret: process.env.JWT_SECRET!
};

// Validate required secrets
const requiredEnvVars = ['API_KEY', 'DB_PASSWORD', 'JWT_SECRET'];
for (const varName of requiredEnvVars) {
  if (!process.env[varName]) {
    throw new Error(`Missing required environment variable: ${varName}`);
  }
}

// ❌ BAD: Hardcoded secrets
const config = {
  apiKey: 'sk-1234567890abcdef', // NEVER DO THIS
  dbPassword: 'mypassword123' // NEVER DO THIS
};
```

---

## Testing Requirements

### Unit Tests

```typescript
// ✅ GOOD: Comprehensive test coverage
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { extractSEOAttributes } from './seo-extractor';

describe('extractSEOAttributes', () => {
  const mockHTML = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <title>Test Page</title>
        <meta name="description" content="Test description">
      </head>
      <body>
        <h1>Main Heading</h1>
        <p>Content here</p>
      </body>
    </html>
  `;
  
  it('should extract title correctly', async () => {
    const result = await extractSEOAttributes(mockHTML, 'https://test.com');
    
    expect(result.title).toBe('Test Page');
    expect(result.titleLength).toBe(9);
  });
  
  it('should extract meta description', async () => {
    const result = await extractSEOAttributes(mockHTML, 'https://test.com');
    
    expect(result.metaDescription).toBe('Test description');
    expect(result.metaDescriptionLength).toBe(16);
  });
  
  it('should handle missing elements gracefully', async () => {
    const minimalHTML = '<html><body>Test</body></html>';
    const result = await extractSEOAttributes(minimalHTML, 'https://test.com');
    
    expect(result.title).toBe('');
    expect(result.metaDescription).toBe('');
    expect(result.h1Count).toBe(0);
  });
  
  it('should throw error for invalid HTML', async () => {
    await expect(
      extractSEOAttributes('invalid<>html', 'https://test.com')
    ).rejects.toThrow();
  });
});

// ❌ BAD: Minimal, mock-only tests
describe('extract', () => {
  it('works', () => {
    const result = extract('<html></html>', 'url');
    expect(result).toBeTruthy();
  });
});
```

### Integration Tests

```typescript
// ✅ GOOD: Tests actual service connectivity
import { describe, it, expect } from 'vitest';
import { app } from '../app';
import request from 'supertest';

describe('POST /api/seo/extract', () => {
  it('should extract attributes from real URL', async () => {
    const response = await request(app)
      .post('/api/seo/extract')
      .send({
        url: 'https://example.com',
        depth: 'basic'
      })
      .expect(200);
    
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('title');
    expect(response.body.data).toHaveProperty('metaDescription');
    expect(response.body.data.seoScore).toBeGreaterThan(0);
  });
  
  it('should validate input', async () => {
    const response = await request(app)
      .post('/api/seo/extract')
      .send({
        url: 'not-a-url'
      })
      .expect(400);
    
    expect(response.body.success).toBe(false);
    expect(response.body.error).toContain('Validation error');
  });
  
  it('should handle rate limiting', async () => {
    // Make multiple requests quickly
    const requests = Array(11).fill(null).map(() =>
      request(app)
        .post('/api/seo/extract')
        .send({ url: 'https://example.com' })
    );
    
    const responses = await Promise.all(requests);
    const rateLimited = responses.some(r => r.status === 429);
    
    expect(rateLimited).toBe(true);
  });
});
```

---

## Performance Standards

### Response Time Targets

| Endpoint Type | Target | Maximum |
|---------------|--------|---------|
| Simple GET | <50ms | 100ms |
| Complex Query | <200ms | 500ms |
| Data Mining | <2s | 5s |
| ML Prediction | <100ms | 300ms |
| Batch Processing | <10s | 30s |

### Optimization Techniques

```typescript
// ✅ GOOD: Caching, pagination, parallel processing
import { LRUCache } from 'lru-cache';

const cache = new LRUCache<string, SEOAttributes>({
  max: 500,
  ttl: 1000 * 60 * 5 // 5 minutes
});

async function getAttributesCached(url: string): Promise<SEOAttributes> {
  const cached = cache.get(url);
  if (cached) {
    return cached;
  }
  
  const attributes = await extractSEOAttributes(url);
  cache.set(url, attributes);
  
  return attributes;
}

// Parallel processing
async function extractMultiple(urls: string[]): Promise<SEOAttributes[]> {
  const batchSize = 10;
  const results: SEOAttributes[] = [];
  
  for (let i = 0; i < urls.length; i += batchSize) {
    const batch = urls.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(url => getAttributesCached(url))
    );
    results.push(...batchResults);
  }
  
  return results;
}
```

---

## Documentation Standards

### Code Documentation

```typescript
/**
 * Extracts comprehensive SEO attributes from HTML content
 * 
 * @param html - Raw HTML content to analyze
 * @param url - URL of the page being analyzed
 * @param options - Optional configuration for extraction
 * @returns Promise resolving to SEOAttributes object with 192+ properties
 * 
 * @throws {SEOExtractionError} If HTML parsing fails or URL is invalid
 * 
 * @example
 * ```typescript
 * const attributes = await extractSEOAttributes(
 *   '<html><head><title>Test</title></head></html>',
 *   'https://example.com'
 * );
 * console.log(attributes.title); // "Test"
 * ```
 */
export async function extractSEOAttributes(
  html: string,
  url: string,
  options?: ExtractionOptions
): Promise<SEOAttributes> {
  // Implementation
}
```

### API Documentation

```typescript
/**
 * @api {post} /api/seo/extract Extract SEO Attributes
 * @apiName ExtractSEOAttributes
 * @apiGroup SEO
 * @apiVersion 1.0.0
 * 
 * @apiParam {String} url URL to analyze (required)
 * @apiParam {String="basic","full"} [depth="basic"] Extraction depth
 * @apiParam {Boolean} [includeImages=true] Include image analysis
 * 
 * @apiSuccess {Boolean} success Request success status
 * @apiSuccess {Object} data SEO attributes object
 * @apiSuccess {Number} data.seoScore Overall SEO score (0-100)
 * @apiSuccess {String} data.title Page title
 * @apiSuccess {String} data.metaDescription Meta description
 * 
 * @apiError (400) ValidationError Invalid request parameters
 * @apiError (429) RateLimitError Too many requests
 * @apiError (500) ServerError Internal server error
 * 
 * @apiExample {curl} Example usage:
 *   curl -X POST https://api.lightdom.io/api/seo/extract \
 *     -H "Content-Type: application/json" \
 *     -d '{"url": "https://example.com"}'
 */
```

---

## Git & Version Control

### Commit Messages

```bash
# ✅ GOOD: Conventional commits with scope
feat(seo): add 192 attributes modular configuration system

- Created config/seo-attributes.json with validation rules
- Added per-attribute ML weights and training parameters
- Implemented seeding rules with quality thresholds

Refs: #123

# ❌ BAD: Vague, no context
updated stuff
```

### Branch Naming

```bash
# ✅ GOOD: Descriptive, categorized
feature/seo-attribute-config
bugfix/tensorflow-memory-leak
refactor/animation-mining-service
docs/api-endpoint-documentation

# ❌ BAD: Unclear, no category
updates
fix
branch1
```

---

## Enforcement Tools

### Pre-commit Hooks

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm run lint && npm run type-check && npm run test:unit",
      "pre-push": "npm run compliance:check && npm run test:integration"
    }
  }
}
```

### CI/CD Pipeline

```yaml
# .github/workflows/quality-gates.yml
name: Quality Gates

on: [push, pull_request]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Install dependencies
        run: npm ci
      
      - name: Lint code
        run: npm run lint:check
      
      - name: Type check
        run: npm run type-check
      
      - name: Run unit tests
        run: npm run test:unit:coverage
      
      - name: Run integration tests
        run: npm run test:integration
      
      - name: Check functionality
        run: npm run compliance:check
      
      - name: Security scan
        run: npm run security:scan
```

---

## Checklist for New Code

Before submitting a PR, verify:

- [ ] Searched for existing similar code
- [ ] Reviewed and reused existing implementations where possible
- [ ] Added comprehensive tests (unit + integration)
- [ ] Tested actual functionality (not just mocks)
- [ ] Ran `npm run compliance:check` and all tests pass
- [ ] Added proper error handling
- [ ] Validated all inputs
- [ ] Added TypeScript types
- [ ] Documented complex logic
- [ ] Updated API documentation
- [ ] Updated relevant README files
- [ ] No secrets or API keys committed
- [ ] Follows naming conventions
- [ ] Added proper logging
- [ ] Performance is acceptable
- [ ] Security vulnerabilities checked
- [ ] Code is linted and formatted
- [ ] Commit messages follow conventions

---

## Continuous Improvement

### Rule Updates

This document is a living document. Rules should be updated when:
- New patterns emerge
- Better practices are discovered
- Team feedback indicates improvements
- Technology stack changes
- Security vulnerabilities are found

### Feedback Process

1. Team members propose rule changes via PR
2. Changes are discussed in code review
3. Consensus is reached
4. Rules are updated
5. Team is notified of changes

---

## References

- [.cursorrules](../.cursorrules) - Detailed cursor-specific rules
- [CONTRIBUTING.md](../CONTRIBUTING.md) - Contribution guidelines
- [SECURITY.md](../SECURITY.md) - Security policies
- [Testing Guide](./TESTING_GUIDE.md) - Comprehensive testing documentation
