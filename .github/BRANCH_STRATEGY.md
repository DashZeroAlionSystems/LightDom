# Branch Strategy & Naming Conventions

## Branch Types

| Prefix | Purpose | Base Branch | Merges Into |
|--------|---------|-------------|-------------|
| `main` | Production-ready code | — | — |
| `feature/` | New features | `main` | `main` |
| `bugfix/` | Bug fixes | `main` | `main` |
| `hotfix/` | Urgent production fixes | `main` | `main` |
| `docs/` | Documentation changes | `main` | `main` |
| `refactor/` | Code restructuring | `main` | `main` |
| `test/` | Test improvements | `main` | `main` |

## Naming Rules

```
<type>/<short-description>
```

- Use **lowercase** with **hyphens** as separators
- Keep descriptions short (2-5 words)
- Be descriptive about what the branch does

### Good Examples

```
feature/add-wallet-dashboard
bugfix/fix-token-calculation
hotfix/patch-auth-bypass
docs/update-api-reference
refactor/split-mining-service
test/add-crawler-integration-tests
```

### Bad Examples

```
fix-stuff                    # No type prefix
feature/a                    # Too vague
my-branch                    # No type prefix, unclear purpose
copilot/fix-7d4901cb-...     # Random IDs, no description
```

## AI Agent Branches

AI coding agents (Copilot, Claude, Cursor) **must** follow the same naming conventions.
Branches created by agents should use the format:

```
<type>/<agent>-<short-description>
```

Examples:
```
feature/copilot-add-mining-dashboard
bugfix/claude-fix-auth-flow
docs/cursor-update-readme
```

Agent branches with random UUID suffixes (e.g., `copilot/fix-7d4901cb-...`) will be
flagged for cleanup if not associated with an active PR.

## Branch Lifecycle

1. **Create** from `main` (always pull latest first)
2. **Develop** with small, focused commits
3. **Open PR** against `main` with the PR template filled out
4. **Review** — at least 1 approval required
5. **Merge** via squash merge (keeps history clean)
6. **Delete** the branch after merge (automated by branch cleanup workflow)

## Stale Branch Policy

Branches are considered **stale** if:
- No commits in the last 30 days
- No associated open PR
- Not `main` or a protected branch

Stale branches are flagged for review and may be deleted during automated cleanup.

## Protected Branches

| Branch | Protection |
|--------|-----------|
| `main` | Require PR, require status checks, no force push |
