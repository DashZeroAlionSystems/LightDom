# Contributing to LightDom

Thank you for your interest in contributing to LightDom! This guide will help you get started.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Code Standards](#code-standards)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)
- [Code Review Process](#code-review-process)

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 13+
- Git
- GitHub account
- (Optional) Make utility for Makefile commands

### Ways to Contribute

- 🐛 Report bugs
- 💡 Suggest features
- 📝 Improve documentation
- 🔧 Fix issues
- ✨ Add features
- 🧪 Write tests
- 🎨 Improve UI/UX

## Development Setup

### Using Dev Container (Recommended)

1. **Fork and Clone**
   ```bash
   gh repo fork DashZeroAlionSystems/LightDom --clone
   cd LightDom
   ```

2. **Open in Dev Container**
   - VS Code: F1 → "Dev Containers: Reopen in Container"
   - GitHub Codespaces: Click "Code" → "Codespaces" → Create

3. **Start Development**
   ```bash
   make dev-full
   ```

See [Dev Container Documentation](./.devcontainer/README.md) for details.

### Manual Setup

1. **Fork and Clone**
   ```bash
   gh repo fork DashZeroAlionSystems/LightDom --clone
   cd LightDom
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Setup Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Setup Database**
   ```bash
   make db-create
   make db-migrate
   ```

5. **Start Development**
   ```bash
   make dev-full
   ```

## Making Changes

### 1. Create a Branch

Follow our branch naming conventions:

```bash
# Features
git checkout -b feature/description

# Bug fixes
git checkout -b bugfix/description

# Hotfixes
git checkout -b hotfix/description

# Documentation
git checkout -b docs/description

# Refactoring
git checkout -b refactor/description
```

Examples:
```bash
git checkout -b feature/add-optimization-api
git checkout -b bugfix/fix-token-calculation
git checkout -b docs/update-api-documentation
```

### 2. Make Your Changes

Follow our coding standards (see [Code Standards](#code-standards)).

### 3. Test Your Changes

```bash
# Run all tests
npm run cli test

# Run specific tests
npm run cli test --unit
npm run cli test --integration

# Run with coverage
npm run cli test --coverage
```

### 4. Quality Checks

```bash
# Run all quality checks
make quality

# Or individually
make lint
make format
make type-check
```

## Code Standards

### 🚨 CRITICAL: Search Existing Code First

**Before creating ANY new code, you MUST:**

1. **Search the codebase comprehensively**
   ```bash
   # Search by keywords
   grep -r "feature-keyword" services/ src/ api/
   
   # Find files by name
   find . -name "*feature*" -not -path "*/node_modules/*"
   
   # Search for similar classes/functions
   grep -r "class.*Feature" . --include="*.ts" --include="*.js"
   ```

2. **Review existing services**
   - `services/` - 100+ service files
   - `api/` - API route handlers
   - `src/services/` - TypeScript services
   - `src/components/` - React components
   - `scripts/` - Automation scripts

3. **Use the search-first validation tool**
   ```bash
   npm run rules:search-first
   # or interactive mode
   npm run rules:search-first:interactive
   ```

4. **Document your search in the PR**
   ```markdown
   ## Existing Code Search
   - [x] Searched for similar functionality using: [keywords]
   - [x] Reviewed existing services
   - [ ] Found existing code: [list if any]
   - [ ] Reason for new code: [explain why]
   ```

See [Search-First Rule Documentation](.github/CODE_REVIEW_RULES.md#-core-principle-existing-code-first) for complete details.

### TypeScript/JavaScript

- Use TypeScript for all new code
- Enable strict type checking
- Avoid `any` type
- Use meaningful variable names
- Add JSDoc comments for complex functions

```typescript
// Good
interface OptimizationResult {
  spaceSaved: number;
  suggestions: string[];
}

async function optimizeDOM(url: string): Promise<OptimizationResult> {
  // Implementation
}

// Bad
async function opt(u: any): Promise<any> {
  // Implementation
}
```

### React Components

- Use functional components with hooks
- Implement proper TypeScript interfaces for props
- Use proper accessibility attributes
- Follow component naming conventions

```tsx
// Good
interface DashboardProps {
  userId: string;
  onComplete: (result: OptimizationResult) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ userId, onComplete }) => {
  // Implementation
};

// Bad
export const dashboard = (props: any) => {
  // Implementation
};
```

### Solidity

- Follow OpenZeppelin standards
- Implement proper access control
- Use events for state changes
- Add comprehensive NatSpec documentation

```solidity
// Good
/// @notice Reward user for optimization
/// @param to Recipient address
/// @param amount Token amount
/// @param optimizationId Optimization reference
function rewardOptimization(
  address to,
  uint256 amount,
  bytes32 optimizationId
) external onlyRole(MINTER_ROLE) {
  _mint(to, amount);
  emit OptimizationReward(to, amount, optimizationId);
}

// Bad
function reward(address a, uint256 b) external {
  _mint(a, b);
}
```

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Format
<type>(<scope>): <description>

# Types
feat:     New feature
fix:      Bug fix
docs:     Documentation
style:    Formatting, missing semicolons, etc.
refactor: Code restructuring
test:     Adding tests
chore:    Maintenance

# Examples
feat(api): add optimization submission endpoint
fix(token): correct token calculation formula
docs(readme): update installation instructions
test(optimization): add unit tests for space calculation
```

### Documentation

- Update README for new features
- Add JSDoc/NatSpec comments
- Update API documentation
- Include examples in documentation

## Testing

### Test Coverage Requirements

- Minimum 80% coverage for all code
- 100% coverage for critical business logic
- Test all edge cases and error conditions

### Writing Tests

```typescript
// Unit tests
describe('OptimizationService', () => {
  it('should calculate space savings correctly', () => {
    const result = calculateSavings(1000, 300);
    expect(result).toBe(300);
  });

  it('should handle errors gracefully', () => {
    expect(() => calculateSavings(-1, 300)).toThrow();
  });
});

// Integration tests
describe('Optimization API', () => {
  it('should submit optimization successfully', async () => {
    const response = await request(app)
      .post('/api/optimization/submit')
      .send({ url: 'https://example.com' });
    
    expect(response.status).toBe(201);
    expect(response.body.data).toBeDefined();
  });
});
```

### Running Tests

```bash
# All tests
npm run cli test

# Watch mode
npm run cli test --watch

# Coverage report
npm run cli test --coverage

# Specific tests
npm run cli test --unit
npm run cli test --integration
npm run cli test --e2e
```

## Submitting Changes

### 1. Push Your Branch

```bash
git add .
git commit -m "feat(scope): description"
git push origin feature/your-feature
```

### 2. Create Pull Request

1. Go to GitHub repository
2. Click "New Pull Request"
3. Select your branch
4. Fill in the PR template:

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Tests added/updated
- [ ] No breaking changes (or documented)
```

### 3. Wait for Review

- CI/CD checks must pass
- At least one approval required
- Address review feedback
- Keep PR updated with main branch

## Code Review Process

### What We Look For

- Code quality and readability
- Test coverage and quality
- Documentation completeness
- Performance implications
- Security considerations
- Breaking changes

### Review Timeline

- Small PRs: 1-2 days
- Medium PRs: 2-4 days
- Large PRs: 4-7 days

### Addressing Feedback

```bash
# Make requested changes
git add .
git commit -m "fix: address review feedback"
git push origin feature/your-feature

# Force push after rebase (if needed)
git rebase main
git push origin feature/your-feature --force-with-lease
```

## Development Workflow

### Daily Development

```bash
# 1. Update your branch
git checkout main
git pull origin main
git checkout your-branch
git rebase main

# 2. Start services
make dev-full

# 3. Make changes and test
npm run cli test --watch

# 4. Quality checks
make quality

# 5. Commit changes
git add .
git commit -m "feat: description"
```

### Before Submitting PR

```bash
# 1. Update from main
git fetch origin
git rebase origin/main

# 2. Run full test suite
npm run cli test

# 3. Run quality checks
make quality

# 4. Build verification
make build

# 5. Clean up commits (if needed)
git rebase -i HEAD~n
```

## AI Integration

### GitHub Copilot

When using GitHub Copilot:
- Review [Copilot Instructions](./.github/COPILOT_INSTRUCTIONS.md)
- Follow project patterns
- Review generated code carefully
- Add tests for AI-generated code

### Cursor AI

When using Cursor AI:
- Review [Cursor Instructions](./.cursor/CURSOR_INSTRUCTIONS.md)
- Follow [Cursor Rules](./.cursorrules)
- Use predefined workflows
- Verify AI suggestions

## Common Tasks

### Adding a New Feature

1. **Plan**
   - Discuss in GitHub issue
   - Design API/interface
   - Plan tests

2. **Implement**
   ```bash
   git checkout -b feature/new-feature
   # Write code
   # Write tests
   make quality
   ```

3. **Document**
   - Update README
   - Add API documentation
   - Update CHANGELOG

4. **Submit**
   ```bash
   git push origin feature/new-feature
   # Create PR
   ```

### Fixing a Bug

1. **Reproduce**
   - Write failing test
   - Verify bug exists

2. **Fix**
   ```bash
   git checkout -b bugfix/fix-issue
   # Fix code
   # Verify test passes
   ```

3. **Verify**
   ```bash
   npm run cli test
   make quality
   ```

4. **Submit**
   ```bash
   git push origin bugfix/fix-issue
   # Create PR
   ```

### Updating Documentation

1. **Edit**
   ```bash
   git checkout -b docs/update-docs
   # Edit documentation files
   ```

2. **Review**
   - Check formatting
   - Verify links
   - Test examples

3. **Submit**
   ```bash
   git push origin docs/update-docs
   # Create PR
   ```

## Getting Help

### Resources

- [Project README](./README.md)
- [Workflow Automation](./WORKFLOW_AUTOMATION.md)
- [Dev Container Guide](./.devcontainer/README.md)
- [Architecture Docs](./ARCHITECTURE.md)

### Communication

- GitHub Issues: Bug reports and feature requests
- GitHub Discussions: Questions and discussions
- Pull Requests: Code review and feedback

### Questions?

1. Check existing documentation
2. Search GitHub issues
3. Ask in GitHub Discussions
4. Create a new issue with question

## License

By contributing, you agree that your contributions will be licensed under the project's MIT License.

---

Thank you for contributing to LightDom! 🎉
