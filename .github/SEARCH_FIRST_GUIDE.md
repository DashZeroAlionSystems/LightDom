# Quick Reference: Search-First Development

## 🎯 The Golden Rule

**ALWAYS search for existing code BEFORE creating anything new.**

## ⚡ Quick Start

### 1. Before You Code

```bash
# Run interactive search helper
npm run rules:search-first:interactive

# Or validate specific files
npm run rules:search-first -- --files src/new-feature.ts
```

### 2. Search Commands Cheat Sheet

```bash
# Search by keyword
grep -r "keyword" services/ src/ api/ scripts/

# Find files by name
find . -name "*keyword*" -not -path "*/node_modules/*"

# Search for class definitions
grep -r "class.*Keyword" . --include="*.ts" --include="*.js"

# Search for function definitions
grep -r "function.*keyword\|const.*keyword.*=" . --include="*.ts"

# Search imports to find usage
grep -r "import.*Keyword" . --include="*.ts" --include="*.js"
```

### 3. Common Searches

| Building... | Search For... | Command |
|------------|---------------|---------|
| **Auth** | `auth`, `login`, `jwt`, `token` | `grep -r "auth\|login" api/ src/` |
| **Database** | `db`, `query`, `pool`, `sql` | `grep -r "pool.query" .` |
| **API** | `router`, `endpoint`, `express` | `grep -r "router\." api/` |
| **UI** | `component`, `dashboard`, `ui` | `find src/components/ -name "*Dashboard*"` |
| **Blockchain** | `contract`, `ethereum`, `web3` | `grep -r "ethers" contracts/` |
| **Crawler** | `crawl`, `scrape`, `puppeteer` | `grep -r "puppeteer" services/` |
| **SEO** | `seo`, `meta`, `og:`, `extract` | `grep -r "seo" src/ services/` |
| **Testing** | `test`, `spec`, `mock` | `find test/ -name "*feature*"` |

## 📋 PR Checklist Template

Copy this into your PR description:

```markdown
## Existing Code Search

- [x] Searched for similar functionality
- [x] Keywords used: [list keywords]
- [x] Commands executed:
  ```bash
  grep -r "keyword" services/
  find . -name "*pattern*"
  ```
- [ ] Existing code found: [list files or "none"]
- [ ] Reason for new code: [explain]

### Search Results

[Describe what you found and why it cannot be reused]
```

## 🔄 Development Workflow

### Pre-Development

1. **Understand the requirement**
2. **Identify keywords** (nouns, verbs, domain terms)
3. **Search existing code** (see cheat sheet above)
4. **Review similar files** found in search
5. **Decide**: Reuse, Extend, or Create New

### During Development

```bash
# Validate as you go
npm run rules:search-first

# Pre-commit hook will validate automatically
git commit -m "feat: add feature"
```

### Pre-PR

```bash
# Final validation
npm run rules:search-first

# Add search documentation to PR description
# See checklist above
```

## 🚫 Anti-Patterns

### ❌ DON'T

```typescript
// Creating new service without searching
export class NewAuthService {
  async login(email: string, password: string) {
    // Implementation
  }
}
```

### ✅ DO

```bash
# First search for auth services
grep -r "class.*Auth" src/ services/
grep -r "login" api/ src/

# Found: services/AuthService.js
# Decision: Extend existing service instead of creating new one
```

```typescript
// Extend existing service
import { AuthService } from '@/services/AuthService';

export class EnhancedAuthService extends AuthService {
  async loginWithTwoFactor(email: string, password: string, token: string) {
    // Add new functionality to existing service
    const user = await super.login(email, password);
    return this.verifyTwoFactor(user, token);
  }
}
```

## 🔍 Where to Search

### Priority Order

1. **services/** - 100+ service files (search first!)
2. **api/** - API endpoints and middleware
3. **src/services/** - TypeScript business logic
4. **src/components/** - React UI components
5. **src/core/** - Core business logic
6. **src/hooks/** - React hooks
7. **src/utils/** - Utility functions
8. **scripts/** - Automation scripts

### Don't Forget

- **Test files** - Often contain example usage
- **Documentation** - May describe existing features
- **Comments** - Often explain similar functionality
- **Git history** - Check removed/modified code

## 🛠️ Tools

### Built-in Commands

```bash
# Search validation
npm run rules:search-first

# Interactive search helper
npm run rules:search-first:interactive

# Pre-commit validation (automatic)
git commit -m "message"
```

### External Tools

```bash
# Ripgrep (faster alternative to grep)
rg "keyword" --type ts --type js

# Silver Searcher
ag "keyword" --ts --js

# GitHub CLI
gh search code "keyword" --repo DashZeroAlionSystems/LightDom

# VS Code
# Use "Search in Files" (Ctrl+Shift+F)
```

## 📖 Resources

- [Full Code Review Rules](.github/CODE_REVIEW_RULES.md)
- [Contributing Guide](CONTRIBUTING.md)
- [Cursor Rules](.cursorrules)
- [Copilot Instructions](.github/COPILOT_INSTRUCTIONS.md)

## 🎓 Examples

### Example 1: SEO Feature

**Requirement**: Add SEO metadata extraction

**Search Process**:
```bash
$ grep -r "seo" src/ services/
src/services/SEOService.ts
services/seo-extractor.js
api/routes/seo.js

$ grep -r "meta.*og:" src/
src/utils/metadata-parser.ts
```

**Decision**: Found existing `SEOService.ts` and `seo-extractor.js`. 
Extend existing service instead of creating new one.

### Example 2: Authentication

**Requirement**: Add OAuth authentication

**Search Process**:
```bash
$ grep -r "auth" api/ src/
api/middleware/auth.js
src/services/AuthService.ts
src/hooks/useAuth.ts

$ grep -r "oauth\|login" api/ src/
# No OAuth found
```

**Decision**: Auth infrastructure exists. Add OAuth as new strategy
to existing `AuthService.ts`.

### Example 3: Database Query

**Requirement**: Add user analytics query

**Search Process**:
```bash
$ grep -r "analytics" src/ services/
services/analytics-service.js

$ grep -r "pool.query.*users" .
api/services/user-service.js (similar query found)
```

**Decision**: Reuse query pattern from `user-service.js`,
integrate with `analytics-service.js`.

## ⚠️ Important Notes

1. **False Positives**: If validator flags false positive, document in PR
2. **Disconnected Code**: Many services exist but aren't connected - look for these!
3. **Test Code**: Check test files for example implementations
4. **Documentation**: Check docs for described but unimplemented features

## 🎯 Success Criteria

✅ **Good Search**:
- Multiple search commands used
- All relevant directories checked
- Similar files reviewed
- Decision documented

❌ **Poor Search**:
- Single grep command
- Only one directory checked
- No review of found files
- No documentation

## 💡 Tips

1. **Use multiple search terms** - Different developers use different names
2. **Check file names AND content** - Both are important
3. **Review git history** - Features may have been removed
4. **Ask the team** - Others may know about existing code
5. **Document your search** - Even if nothing found, show you looked

---

**Remember**: It's faster to find and reuse existing code than to write, test, and maintain new code!

For questions or issues, see [Code Review Rules](.github/CODE_REVIEW_RULES.md) or ask in your PR.
