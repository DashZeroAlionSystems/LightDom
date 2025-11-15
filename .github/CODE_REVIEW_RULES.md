# GitHub Copilot Code Review Rules for LightDom

## Overview

These rules are designed to ensure high-quality, maintainable code contributions to LightDom, following GitHub's best practices for coding agents and automated code review. The primary principle is to **always search for and reuse existing code before creating anything new**.

## 🎯 Core Principle: Existing Code First

**BEFORE writing ANY new code, you MUST:**

1. **Search the entire codebase** for similar functionality
2. **Review existing services** that might already solve the problem
3. **Check for disconnected or unused code** that could be integrated
4. **Look for existing patterns** that can be extended
5. **Only create new code** when absolutely necessary

### Why This Matters

LightDom has substantial existing code (~100+ services, 200+ files). Many features may already exist but are not fully connected or documented. Reusing and connecting existing code:

- ✅ Reduces duplication and technical debt
- ✅ Maintains consistency across the codebase
- ✅ Speeds up development
- ✅ Improves maintainability
- ✅ Leverages battle-tested code

### How to Search Effectively

```bash
# Search for functionality by keywords
grep -r "relevant.*keyword" services/ src/ scripts/

# Find files by name pattern
find . -name "*relevant*" -type f -not -path "*/node_modules/*"

# Search for class/function definitions
grep -r "class.*YourFeature\|function.*yourFeature" . --include="*.ts" --include="*.js"

# Search for imports to find usage
grep -r "import.*YourModule" . --include="*.ts" --include="*.js"

# Use ripgrep for faster searches (if available)
rg "your search term" --type ts --type js
```

### Examples of What to Search For

| When Creating... | Search For... |
|------------------|---------------|
| SEO extractor | `seo`, `attribute`, `extract`, `meta`, `og:` |
| Animation mining | `animation`, `styleguide`, `mine`, `css` |
| TensorFlow model | `tensorflow`, `model`, `train`, `ml`, `ai` |
| Database operations | `db`, `query`, `pool`, `connection`, `sql` |
| API endpoint | `router`, `endpoint`, `api`, `route`, `express` |
| UI component | `component`, `react`, `dashboard`, `ui` |
| Blockchain integration | `blockchain`, `contract`, `ethereum`, `web3` |

## 🏗️ Modular, Plug-and-Play Architecture

### When to Add New Code

New code should ONLY be added when it:

1. **Improves modularity** - Makes the system more component-based
2. **Enables plug-and-play** - Can be easily integrated or removed
3. **Reduces coupling** - Decreases dependencies between components
4. **Enhances reusability** - Can be used in multiple contexts
5. **Fills a genuine gap** - No existing solution can be adapted

### Modular Design Principles

```typescript
// ✅ GOOD: Modular, plug-and-play service
export interface OptimizationService {
  optimize(url: string): Promise<OptimizationResult>;
}

export class DOMOptimizationService implements OptimizationService {
  constructor(
    private crawler: CrawlerService,
    private analyzer: AnalyzerService
  ) {}
  
  async optimize(url: string): Promise<OptimizationResult> {
    // Implementation
  }
}

// ✅ GOOD: Easy to swap implementations
const service = new DOMOptimizationService(
  new PuppeteerCrawler(),
  new SpaceAnalyzer()
);

// ❌ BAD: Tightly coupled, hard to test
class TightlyCoupledService {
  async optimize(url: string) {
    const crawler = new PuppeteerCrawler(); // Hard-coded dependency
    const analyzer = new SpaceAnalyzer();   // Hard-coded dependency
    // Implementation
  }
}
```

### Service Design Guidelines

1. **Interfaces over implementations** - Define contracts
2. **Dependency injection** - Pass dependencies via constructor
3. **Single responsibility** - Each service does one thing well
4. **Configuration-driven** - Use config objects, not hard-coded values
5. **Event-driven communication** - Use events/callbacks for loose coupling

## 📋 Code Review Checklist

### Before Submitting Code

- [ ] **Searched for existing code** that solves the same problem
- [ ] **Reviewed similar implementations** in the codebase
- [ ] **Checked if existing code can be extended** instead of creating new
- [ ] **Verified modularity** - Can this be a standalone service?
- [ ] **Ensured plug-and-play** - Can this be easily integrated/removed?
- [ ] **Added comprehensive tests** - Unit, integration, and E2E as needed
- [ ] **Updated documentation** - README, API docs, inline comments
- [ ] **Ran all quality checks** - Lint, format, type-check, tests
- [ ] **Verified no breaking changes** - Or documented them clearly
- [ ] **Checked security implications** - No vulnerabilities introduced

### Code Quality Standards

#### TypeScript/JavaScript

```typescript
// ✅ GOOD: Clear, typed, documented
/**
 * Calculates DOM space savings from optimization
 * @param original - Original DOM size in bytes
 * @param optimized - Optimized DOM size in bytes
 * @returns Space saved in bytes
 * @throws {Error} If inputs are invalid
 */
export function calculateSpaceSavings(
  original: number,
  optimized: number
): number {
  if (original < 0 || optimized < 0) {
    throw new Error('Size values must be non-negative');
  }
  if (optimized > original) {
    throw new Error('Optimized size cannot exceed original');
  }
  return original - optimized;
}

// ❌ BAD: Unclear, untyped, undocumented
export function calc(a: any, b: any) {
  return a - b;
}
```

#### React Components

```tsx
// ✅ GOOD: Typed, accessible, documented
interface OptimizationCardProps {
  /** Optimization result to display */
  result: OptimizationResult;
  /** Callback when user requests details */
  onViewDetails: (id: string) => void;
  /** Optional CSS class name */
  className?: string;
}

/**
 * Displays an optimization result card
 */
export const OptimizationCard: React.FC<OptimizationCardProps> = ({
  result,
  onViewDetails,
  className
}) => {
  return (
    <Card 
      className={className}
      role="article"
      aria-label={`Optimization result for ${result.url}`}
    >
      <h3>{result.url}</h3>
      <p>Space saved: {formatBytes(result.spaceSaved)}</p>
      <Button 
        onClick={() => onViewDetails(result.id)}
        aria-label="View optimization details"
      >
        View Details
      </Button>
    </Card>
  );
};

// ❌ BAD: Untyped, inaccessible, unclear
export const Card = (props: any) => {
  return <div onClick={props.click}>{props.data}</div>;
};
```

#### API Endpoints

```typescript
// ✅ GOOD: Validated, error-handled, documented
import { z } from 'zod';

const OptimizationRequestSchema = z.object({
  url: z.string().url('Invalid URL format'),
  options: z.object({
    threshold: z.number().min(0).max(100).optional(),
    recursive: z.boolean().optional()
  }).optional()
});

/**
 * POST /api/optimization/submit
 * Submits a URL for DOM optimization
 */
router.post('/api/optimization/submit',
  authenticate,
  validateRequest(OptimizationRequestSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { url, options } = req.body;
      const userId = req.user.id;

      logger.info('Optimization requested', { userId, url });

      const result = await optimizationService.optimize({
        url,
        userId,
        options
      });

      logger.info('Optimization completed', { 
        userId, 
        url, 
        spaceSaved: result.spaceSaved 
      });

      return res.status(201).json({
        success: true,
        data: result,
        meta: {
          timestamp: new Date().toISOString(),
          version: '1.0.0'
        }
      });
    } catch (error) {
      logger.error('Optimization failed', { error, url: req.body.url });
      next(error);
    }
  }
);

// ❌ BAD: No validation, poor error handling
router.post('/api/optimize', async (req, res) => {
  const result = await doOptimize(req.body.url);
  res.json(result);
});
```

## 🔒 Security Requirements

### Critical Security Rules

1. **Never commit secrets** - Use environment variables
2. **Validate all inputs** - Use schema validation (Zod, Joi, etc.)
3. **Sanitize outputs** - Prevent XSS and injection attacks
4. **Use parameterized queries** - Prevent SQL injection
5. **Implement proper authentication** - JWT, sessions, or OAuth
6. **Apply rate limiting** - Prevent abuse and DoS attacks
7. **Use HTTPS in production** - Encrypt data in transit
8. **Implement CORS properly** - Don't use wildcard in production
9. **Keep dependencies updated** - Regular security audits
10. **Log security events** - Monitor for suspicious activity

### Security Checklist

- [ ] No secrets in code or commits
- [ ] All inputs validated and sanitized
- [ ] Database queries are parameterized
- [ ] Authentication/authorization implemented
- [ ] Rate limiting configured
- [ ] CORS configured properly
- [ ] Dependencies scanned for vulnerabilities
- [ ] Security headers configured (Helmet)
- [ ] Error messages don't leak sensitive info
- [ ] Audit logging implemented for sensitive operations

## 🧪 Testing Requirements

### Test Coverage Standards

- **Minimum 80% code coverage** for all code
- **100% coverage** for critical business logic
- **All edge cases tested** including error conditions
- **Integration tests** for API endpoints
- **E2E tests** for critical user flows
- **Performance tests** for optimization algorithms

### Testing Patterns

```typescript
// Unit Test Example
describe('calculateSpaceSavings', () => {
  it('should calculate savings correctly', () => {
    const result = calculateSpaceSavings(1000, 700);
    expect(result).toBe(300);
  });

  it('should handle zero optimized size', () => {
    const result = calculateSpaceSavings(1000, 0);
    expect(result).toBe(1000);
  });

  it('should throw for negative inputs', () => {
    expect(() => calculateSpaceSavings(-1, 0)).toThrow();
    expect(() => calculateSpaceSavings(1000, -1)).toThrow();
  });

  it('should throw when optimized > original', () => {
    expect(() => calculateSpaceSavings(500, 1000)).toThrow();
  });
});

// Integration Test Example
describe('Optimization API', () => {
  it('should submit optimization successfully', async () => {
    const response = await request(app)
      .post('/api/optimization/submit')
      .set('Authorization', `Bearer ${validToken}`)
      .send({ 
        url: 'https://example.com',
        options: { threshold: 50 }
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('spaceSaved');
    expect(response.body.data).toHaveProperty('id');
  });

  it('should reject invalid URLs', async () => {
    const response = await request(app)
      .post('/api/optimization/submit')
      .set('Authorization', `Bearer ${validToken}`)
      .send({ url: 'not-a-valid-url' });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it('should require authentication', async () => {
    const response = await request(app)
      .post('/api/optimization/submit')
      .send({ url: 'https://example.com' });

    expect(response.status).toBe(401);
  });
});
```

### Running Tests

```bash
# Run all tests
npm run test

# Run specific test suites
npm run test:unit          # Unit tests
npm run test:integration   # Integration tests
npm run test:e2e          # End-to-end tests

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch
```

## 📚 Documentation Requirements

### Code Documentation

1. **JSDoc for all public functions**
   ```typescript
   /**
    * Brief description
    * @param paramName - Parameter description
    * @returns Return value description
    * @throws {ErrorType} When this error occurs
    * @example
    * ```typescript
    * const result = myFunction('input');
    * ```
    */
   ```

2. **README updates** for new features
3. **API documentation** with examples
4. **Architecture diagrams** for complex systems
5. **Migration guides** for breaking changes

### Documentation Checklist

- [ ] JSDoc comments for all public APIs
- [ ] README updated with new features
- [ ] API documentation includes request/response examples
- [ ] Complex algorithms explained with comments
- [ ] Breaking changes documented in CHANGELOG
- [ ] Migration guide provided if needed
- [ ] Examples provided for common use cases

## 🔄 Pull Request Process

### PR Requirements

1. **Small, focused changes** - One feature/fix per PR
2. **Clear title and description** - Explain what and why
3. **Link to issues** - Reference related issues
4. **All tests passing** - CI must be green
5. **No merge conflicts** - Rebase on main
6. **Reviewed by at least one person** - Get approval
7. **Documentation updated** - If needed
8. **No linting errors** - Code must be clean

### PR Template

```markdown
## Description
Brief description of changes made.

## Type of Change
- [ ] Bug fix (non-breaking change that fixes an issue)
- [ ] New feature (non-breaking change that adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to change)
- [ ] Documentation update

## Existing Code Search
- [ ] Searched codebase for similar functionality
- [ ] Reviewed existing services that might solve this
- [ ] Checked for reusable code
- [ ] Confirmed new code is necessary

## Modularity Check
- [ ] Code is modular and follows single responsibility
- [ ] Dependencies are injected, not hard-coded
- [ ] Code can be easily tested in isolation
- [ ] Code can be easily integrated or removed

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] All tests pass locally
- [ ] Test coverage meets minimum 80%

## Quality Checks
- [ ] `npm run lint` passes
- [ ] `npm run format:check` passes
- [ ] `npm run type-check` passes
- [ ] `npm run test` passes

## Documentation
- [ ] Code is self-documenting with clear names
- [ ] JSDoc comments added for public APIs
- [ ] README updated (if needed)
- [ ] API documentation updated (if needed)

## Security
- [ ] No secrets committed
- [ ] Inputs validated and sanitized
- [ ] Security implications considered
- [ ] Dependencies scanned for vulnerabilities

## Screenshots (if UI changes)
Add screenshots or videos here.

## Additional Notes
Any additional context or notes for reviewers.
```

## 🤖 Automated Code Review

### Pre-commit Hooks

The following checks run automatically before each commit:

1. **Linting** - ESLint checks
2. **Formatting** - Prettier checks
3. **Type checking** - TypeScript validation
4. **Unit tests** - Fast test suite
5. **Existing code search** - Check for duplicates

### CI/CD Checks

The following checks run on every PR:

1. **Build verification** - Code compiles
2. **Full test suite** - All tests pass
3. **Coverage check** - Minimum 80%
4. **Security scan** - Vulnerability check
5. **Performance tests** - No regression
6. **Documentation check** - Docs updated

### Quality Gates

Code cannot be merged unless:

- ✅ All CI checks pass
- ✅ Test coverage ≥ 80%
- ✅ No high/critical security vulnerabilities
- ✅ At least one approval from code owner
- ✅ All conversations resolved
- ✅ Branch is up-to-date with main

## 🛠️ Tools and Commands

### Quality Check Commands

```bash
# Run all quality checks
npm run quality

# Individual checks
npm run lint              # ESLint
npm run format:check      # Prettier
npm run type-check        # TypeScript
npm run test:unit         # Unit tests
npm run test:integration  # Integration tests
npm run compliance:check  # Functionality validation

# Security checks
npm run security:scan     # Dependency audit
npm run security:check    # Semgrep scan

# Architecture validation
npm run architecture:validate

# Rule validation
npm run rules:check
```

### Search and Analysis Tools

```bash
# Search for code patterns
grep -r "pattern" . --include="*.ts" --include="*.js"

# Find files by name
find . -name "*pattern*" -not -path "*/node_modules/*"

# Code analysis
npm run cli analyze

# Service discovery
npm run services list
```

## 📊 Metrics and Monitoring

### Code Quality Metrics

- **Code coverage** - Target: ≥80%
- **Complexity** - Keep cyclomatic complexity low
- **Duplication** - Minimize code duplication
- **Technical debt** - Track and reduce
- **Security vulnerabilities** - Zero tolerance for critical/high

### Review Metrics

- **Review time** - Target: <24 hours
- **Iteration count** - Target: <3 iterations
- **Approval rate** - Target: >90% on first review
- **Merge time** - Target: <48 hours

## 🎯 Best Practices Summary

1. **Search first, create last** - Always look for existing code
2. **Modular design** - Build plug-and-play components
3. **Test everything** - Minimum 80% coverage
4. **Document thoroughly** - Code should be self-explanatory
5. **Secure by default** - Never compromise on security
6. **Small PRs** - Easier to review and merge
7. **Follow patterns** - Consistency is key
8. **Automate checks** - Let tools catch issues
9. **Communicate clearly** - Good descriptions save time
10. **Continuous improvement** - Learn from reviews

## 📖 References

- [GitHub Copilot Best Practices](https://docs.github.com/en/enterprise-cloud@latest/copilot/tutorials/coding-agent/get-the-best-results)
- [LightDom Architecture](../ARCHITECTURE.md)
- [Contributing Guide](../CONTRIBUTING.md)
- [Cursor Rules](../.cursorrules)
- [Copilot Instructions](.github/COPILOT_INSTRUCTIONS.md)

## 🔄 Rule Updates

These rules are living documents. To suggest improvements:

1. Open an issue with label `rules-improvement`
2. Describe the proposed change and rationale
3. Get approval from at least 2 maintainers
4. Submit PR with updated rules
5. Update automation scripts if needed

---

**Remember**: The goal is not to have the most code, but to have the **right** code that is maintainable, testable, and secure. Always favor reusing and improving existing code over creating new code.
