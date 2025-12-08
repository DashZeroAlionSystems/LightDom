# LightDom GitHub Configuration & Documentation

This directory contains GitHub-specific configuration, workflows, and documentation for the LightDom project.

## 📚 Documentation Index

### Core Code Review & Development

- **[CODE_REVIEW_RULES.md](CODE_REVIEW_RULES.md)** - Comprehensive code review rules and standards
  - Search-first principle (MUST READ before coding)
  - Modular architecture guidelines
  - Security requirements
  - Testing standards
  - PR process and checklist

- **[SEARCH_FIRST_GUIDE.md](SEARCH_FIRST_GUIDE.md)** - Quick reference for search-first development
  - Command cheat sheet
  - Common search patterns
  - Examples and anti-patterns
  - PR checklist template

### AI Coding Assistants

- **[COPILOT_INSTRUCTIONS.md](COPILOT_INSTRUCTIONS.md)** - GitHub Copilot specific instructions
  - Project context
  - Code generation patterns
  - Common patterns and best practices

- **[COPILOT_RULES.md](COPILOT_RULES.md)** - Concise rules for automated coding agents
  - High-level contracts
  - Testing and quality gates
  - Automation rules

### Project Management

- **[CODEOWNERS](CODEOWNERS)** - Code ownership and review assignments
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Deployment guidelines and procedures

### Issue & PR Templates

- **[ISSUE_TEMPLATE/](ISSUE_TEMPLATE/)** - Templates for creating issues

## 🔄 Workflows

Located in [workflows/](workflows/), these automate various processes:

### Code Quality & Review

- **code-review-search-first.yml** - Validates search-first rule compliance
  - Checks for potential code duplication
  - Enforces documentation of existing code search
  - Validates code modularity

### CI/CD

- **ci-cd.yml** - Continuous integration and deployment
- **ci.yml** - Basic CI checks
- **test.yml** - Comprehensive testing

### Automation

- **agent-automation.yml** - AI agent automation
- **auto-merge.yml** - Automatic PR merging
- **branch-cleanup.yml** - Automated branch cleanup
- **issue-automanage.yml** - Issue management automation
- **pr-creator.yml** - PR creation automation

### Other

- **deploy.yml** - Deployment workflow
- **integration.yml** - Integration testing
- **research.yml** - Research automation
- **update-doc-index.yml** - Documentation updates
- **validate-retry.yml** - Validation with retry logic

## 🚀 Quick Start for Contributors

### 1. Read the Rules

Before contributing, read these in order:

1. [SEARCH_FIRST_GUIDE.md](SEARCH_FIRST_GUIDE.md) - Learn the search-first principle
2. [CODE_REVIEW_RULES.md](CODE_REVIEW_RULES.md) - Understand all code standards
3. [../CONTRIBUTING.md](../CONTRIBUTING.md) - Contributing guidelines

### 2. Set Up Your Environment

```bash
# Install dependencies
npm install

# Set up pre-commit hooks (includes search-first validation)
npm run prepare
```

### 3. Before Creating New Code

```bash
# Use the search-first validation tool
npm run rules:search-first:interactive

# Or validate specific files
npm run rules:search-first -- --files src/new-feature.ts
```

### 4. Create Your PR

Use the search checklist in your PR description:

```markdown
## Existing Code Search
- [x] Searched for similar functionality
- [x] Keywords: [list]
- [x] Commands: [list]
- [ ] Found existing code: [list or "none"]
- [ ] Reason for new code: [explain]
```

## 🤖 For AI Coding Agents

If you're an AI coding agent (GitHub Copilot, Cursor AI, etc.):

1. **ALWAYS read** [COPILOT_INSTRUCTIONS.md](COPILOT_INSTRUCTIONS.md) first
2. **Follow** [COPILOT_RULES.md](COPILOT_RULES.md) strictly
3. **Search existing code** before generating new code (use patterns in [SEARCH_FIRST_GUIDE.md](SEARCH_FIRST_GUIDE.md))
4. **Include search documentation** in all code suggestions

## 📋 Code Review Process

### For Contributors

1. **Search for existing code** (required)
2. **Create feature branch** (`feature/description`)
3. **Write code** following standards
4. **Add tests** (80% coverage minimum)
5. **Run quality checks** (`npm run quality`)
6. **Create PR** with search documentation
7. **Address review feedback**
8. **Get approval** (minimum 1 reviewer)
9. **Merge** when CI passes

### For Reviewers

Check these points:

- ✅ Search-first rule followed (documented in PR)
- ✅ Code is modular and follows patterns
- ✅ Tests added/updated with good coverage
- ✅ Security considerations addressed
- ✅ Documentation updated
- ✅ No breaking changes (or documented)
- ✅ CI checks passing

## 🔐 Security

- **Never commit secrets** - Use environment variables
- **Scan dependencies** - Automated on every PR
- **Validate inputs** - Always sanitize user input
- **Follow OWASP** - Security best practices

See [CODE_REVIEW_RULES.md](CODE_REVIEW_RULES.md#-security-requirements) for details.

## 🧪 Testing

### Running Tests

```bash
# All tests
npm test

# Specific suites
npm run test:unit
npm run test:integration
npm run test:e2e

# With coverage
npm run test:coverage
```

### Test Requirements

- **80% minimum coverage** for all code
- **100% coverage** for critical business logic
- **Integration tests** for all API endpoints
- **E2E tests** for critical user flows

## 📊 Metrics & Quality

We track these metrics:

- **Code coverage** - Target: ≥80%
- **Test execution time** - Target: <10 minutes
- **Review time** - Target: <24 hours
- **Security vulnerabilities** - Target: 0 high/critical
- **Build success rate** - Target: >95%

## 🔧 Tools & Commands

### Quality Checks

```bash
npm run lint              # ESLint
npm run format:check      # Prettier
npm run type-check        # TypeScript
npm run test              # All tests
npm run security:scan     # Security audit
npm run rules:search-first # Search-first validation
```

### Automated Workflows

All workflows run automatically on PR creation/update:

- **Search-first validation** - Checks for code duplication
- **Linting and formatting** - Code style
- **Type checking** - TypeScript validation
- **Testing** - Full test suite
- **Security scanning** - Vulnerability detection
- **Build verification** - Compilation check

## 🎯 Best Practices

1. **Search first, code last** - Always look for existing solutions
2. **Small PRs** - Easier to review and merge
3. **Write tests** - Before or with your code
4. **Document thoroughly** - Code should be self-explanatory
5. **Follow patterns** - Consistency is key
6. **Automate checks** - Let tools catch issues
7. **Communicate clearly** - Good descriptions save time

## 📖 Additional Resources

### Internal Documentation

- [Project README](../README.md) - Project overview
- [Architecture](../ARCHITECTURE.md) - System architecture
- [Contributing Guide](../CONTRIBUTING.md) - How to contribute
- [Cursor Rules](../.cursorrules) - Cursor AI specific rules

### External Resources

- [GitHub Copilot Best Practices](https://docs.github.com/en/enterprise-cloud@latest/copilot/tutorials/coding-agent/get-the-best-results)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)
- [React Best Practices](https://react.dev/learn)

## 🔄 Updating This Documentation

To update GitHub documentation:

1. Make changes to relevant .md files
2. Test any code examples
3. Update this README if adding new files
4. Create PR with label `docs`
5. Get review from documentation owner

## 🆘 Getting Help

- **Documentation issues** - Create issue with label `docs`
- **Rule clarification** - Ask in PR or issue
- **Process questions** - Check [CONTRIBUTING.md](../CONTRIBUTING.md)
- **Technical questions** - Create issue with label `question`

## 📝 License

See [LICENSE](../LICENSE) in root directory.

---

**Remember**: The goal is to build maintainable, high-quality software by reusing existing code and following consistent patterns. These rules and workflows exist to help, not hinder development.

For questions or suggestions about these guidelines, open an issue with the `rules-improvement` label.
