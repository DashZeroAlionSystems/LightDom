# Error Orchestration System

> **DeepSeek-powered autonomous error analysis and remediation pipeline**

## Overview

The Error Orchestration System provides comprehensive runtime error management with AI-powered analysis and automated remediation workflows. It captures errors, analyzes them using DeepSeek (via Ollama), and creates actionable outcomes like tickets or pull requests.

## Architecture

### Components

```
┌─────────────────┐
│ Runtime Errors  │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│ ErrorReportingService   │  ← Capture, deduplicate, redact secrets
└────────┬────────────────┘
         │ emit: error:needsAnalysis
         ▼
┌─────────────────────────┐
│ ErrorAnalysisWorker     │  ← Poll, batch, orchestrate
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ DeepSeekAnalysisClient  │  ← Call Ollama, rate limit, audit log
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ Action Decision Logic   │  ← Evaluate confidence thresholds
└────────┬────────────────┘
         │
         ├─────────────────┬─────────────────┬─────────────────┐
         ▼                 ▼                 ▼                 ▼
    ┌────────┐      ┌──────────┐      ┌──────────┐      ┌──────────┐
    │ Log    │      │ Ticket   │      │ Draft PR │      │ Auto-fix │
    │ Only   │      │ Creation │      │ Creation │      │ + Commit │
    └────────┘      └──────────┘      └──────────┘      └──────────┘
                          │                  │                 │
                          ▼                  ▼                 ▼
                    ┌──────────────────────────────────────────┐
                    │      GitWorkflowManager (Optional)       │
                    └──────────────────────────────────────────┘
```

### Database Schema

**Tables:**

- `error_reports` - Captured errors with deduplication via `error_hash`
- `error_actions` - Recommended/executed actions (tickets, PRs, commits)
- `error_aggregations` - Pattern detection across related errors
- `deepseek_analysis_log` - Audit trail for all DeepSeek API calls
- `error_orchestration_config` - Persisted configuration
- `error_event_logs` - Structured event log stream emitted by the orchestration services

**Views:**

- `pending_error_analysis` - Errors meeting analysis threshold
- `error_reports_summary` - Aggregated stats by error type

**Functions:**

- `upsert_error_report()` - Idempotent error insertion with occurrence counting

### Services

#### ErrorReportingService

**Purpose:** Error capture and initial processing

**Key Methods:**

- `reportError(error)` - Capture error, redact secrets, persist to DB
- `generateErrorHash()` - Create deterministic hash for deduplication
- `redactSecrets()` - Remove sensitive data using configurable patterns
- `shouldTriggerAnalysis()` - Check if occurrence threshold met
- `getPendingErrors(limit)` - Query errors ready for analysis
- `logEvent(event)` - Emit structured event logs to `error_event_logs`

**Events:**

- `error:reported` - New error captured
- `error:needsAnalysis` - Error meets analysis threshold

#### DeepSeekAnalysisClient

**Purpose:** Secure Ollama/DeepSeek integration

**Key Methods:**

- `analyzeError(errorData)` - Send error to DeepSeek, get diagnosis
- `generateFix(errorData)` - Get code fix with explanation and tests
- `generateCommitMessage(fixData)` - Create conventional commit message
- `callOllama(prompt, system)` - Base LLM caller with timeout/retry

**Security Features:**

- Rate limiting (10 req/min, 3 concurrent by default)
- Audit logging to `deepseek_analysis_log`
- Network restrictions (loopback only by default)
- Request/response size limits

#### ErrorAnalysisWorker

**Purpose:** Background orchestration loop

**Key Responsibilities:**

- Poll `pending_error_analysis` view at scheduled intervals
- Batch errors according to `analysis.scheduling.batchSize`
- Call DeepSeekAnalysisClient for each error
- Evaluate confidence scores against thresholds
- Create `error_actions` records with recommendations
- Execute actions based on approval settings

**Events:**

- `worker:started` / `worker:stopped` - Lifecycle
- `error:analyzed` - Analysis completed
- `action:created` - Action record inserted
- `ticket:created` - Ticket created
- `worker:batch:completed` / `worker:batch:failed` - Batch results

#### GitWorkflowManager

**Purpose:** Git automation for automated fixes

**Key Methods:**

- `createBranch(errorHash)` - Create `fix/deepseek-{hash}` branch
- `stageFiles(files)` - Stage modified files
- `commit(options)` - Create commit with formatted message
- `createPR(options)` - Create draft PR via GitHub CLI
- `syncWithGitHubDesktop()` - Open repo in GitHub Desktop

**Safety Features:**

- Working directory clean check
- Branch existence validation
- Dry-run mode for testing
- Draft PR mode (default)
- Manual approval gates

## Configuration

### File: `config/error-orchestration.config.json`

**Key Sections:**

#### Analysis Configuration

```json
{
  "analysis": {
    "thresholds": {
      "minOccurrences": 3, // Errors must occur 3x before analysis
      "minConfidence": 0.7, // Minimum confidence for action
      "autoFixConfidence": 0.9 // Confidence for auto-commit
    },
    "rateLimit": {
      "maxRequestsPerMinute": 10,
      "maxConcurrentRequests": 3
    },
    "scheduling": {
      "enabled": true,
      "intervalMs": 60000, // Poll every 60 seconds
      "batchSize": 10 // Process 10 errors per batch
    }
  }
}
```

#### Git Workflow

```json
{
  "git": {
    "workflow": {
      "branchPrefix": "fix/deepseek-",
      "autoCommit": false, // Stage only, don't commit
      "requireApproval": true, // Human must approve
      "draftPR": true, // Create as draft
      "useGitHubDesktop": false // Open in GitHub Desktop
    },
    "commitTemplate": {
      "type": "fix",
      "scope": "auto",
      "format": "{type}({scope}): {subject}\n\n{body}\n\n{footer}"
    }
  }
}
```

#### Security Settings

```json
{
  "security": {
    "redaction": {
      "enabled": true,
      "patterns": [
        // Keywords to redact
        "password",
        "api_key",
        "secret",
        "token",
        "private_key",
        "auth",
        "credential",
        "oauth",
        "jwt",
        "bearer",
        "session_id",
        "access_token",
        "refresh_token"
      ],
      "customRegex": [
        // Regex patterns
        "\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}\\b", // Emails
        "\\b\\d{3}-\\d{2}-\\d{4}\\b", // SSNs
        "\\b(?:\\d{4}[- ]?){3}\\d{4}\\b" // Credit cards
      ]
    },
    "network": {
      "allowedEndpoints": ["http://127.0.0.1:11434"],
      "allowedNetworks": ["127.0.0.0/8"]
    },
    "audit": {
      "logAllRequests": true,
      "retentionDays": 90
    }
  }
}
```

#### Actions Configuration

```json
{
  "actions": {
    "enabledTypes": ["log_only", "create_ticket", "generate_pr"],
    "ticketing": {
      "system": "database", // or "github", "linear", "jira"
      "labels": ["bug", "automated"],
      "assignToComponent": true
    },
    "pullRequests": {
      "createDraft": true,
      "requireReview": true,
      "labels": ["automated", "deepseek-fix"],
      "template": "..."
    }
  }
}
```

#### Ollama/DeepSeek Settings

```json
{
  "ollama": {
    "endpoint": "http://127.0.0.1:11434",
    "model": "deepseek-coder:latest",
    "timeout": 30000,
    "retries": 3,
    "prompts": {
      "systemRole": "You are an expert software engineer...",
      "analysisTemplate": "Analyze this error: {error}",
      "fixTemplate": "Generate a fix for: {error}",
      "commitTemplate": "Generate conventional commit message for: {fix}"
    }
  }
}
```

### Schema Validation

Configuration is validated against `config/schemas/error-orchestration.schema.json` (JSON Schema Draft-07).

**Validation enforces:**

- `minOccurrences >= 1`
- `confidence` in range `0-1`
- `branchPrefix` matches pattern `^[a-z0-9-]+/$`
- `allowedNetworks` uses valid CIDR notation
- `retentionDays >= 1`

## Usage

### 1. Setup

**Install dependencies:**

```bash
npm install
```

**Run database migration:**

```bash
psql $DATABASE_URL -f migrations/007_error_reporting_system.sql
```

**Configure:**

```bash
# Copy template
cp config/error-orchestration.config.json.example config/error-orchestration.config.json

# Edit configuration
nano config/error-orchestration.config.json
```

### 2. Start Services

**Start Ollama (if not already running):**

```bash
ollama serve
```

**Pull DeepSeek model:**

```bash
ollama pull deepseek-coder:latest
```

**Start error orchestration service:**

```bash
node scripts/start-error-orchestration.js
```

**Or start all services:**

```bash
npm run start:all
```

### 3. Report Errors

**Programmatically:**

```typescript
import ErrorReportingService from './services/error-reporting/ErrorReportingService.js';
import { Pool } from 'pg';

const db = new Pool({ connectionString: process.env.DATABASE_URL });
const config = require('./config/error-orchestration.config.json');

const errorService = new ErrorReportingService({ db, config });

// Report error
await errorService.reportError({
  errorType: 'DatabaseConnectionError',
  severity: 'critical',
  message: 'Failed to connect to PostgreSQL',
  stackTrace: error.stack,
  component: 'api-server',
  service: 'user-auth',
  context: { host: 'localhost', port: 5432 },
  environment: 'production',
});
```

**Global error handler:**

```typescript
// In your main app file
process.on('uncaughtException', async error => {
  await errorService.reportError({
    errorType: error.name,
    severity: 'critical',
    message: error.message,
    stackTrace: error.stack,
    component: 'global',
    environment: process.env.NODE_ENV || 'development',
  });

  // Still exit on uncaught exceptions
  process.exit(1);
});

process.on('unhandledRejection', async (reason, promise) => {
  await errorService.reportError({
    errorType: 'UnhandledRejection',
    severity: 'error',
    message: String(reason),
    component: 'async',
    context: { promise: String(promise) },
    environment: process.env.NODE_ENV || 'development',
  });
});
```

**Express middleware:**

```typescript
// Error handling middleware
app.use(async (err, req, res, next) => {
  await errorService.reportError({
    errorType: err.name || 'ExpressError',
    severity: err.statusCode >= 500 ? 'critical' : 'error',
    message: err.message,
    stackTrace: err.stack,
    component: 'express',
    context: {
      method: req.method,
      path: req.path,
      statusCode: err.statusCode,
    },
    environment: process.env.NODE_ENV || 'development',
  });

  res.status(err.statusCode || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message,
  });
});
```

### 4. Monitor

**Health check endpoint:**

```bash
curl http://localhost:3002/health
```

**Query pending errors:**

```sql
SELECT * FROM pending_error_analysis;
```

**View analysis log:**

```sql
SELECT * FROM deepseek_analysis_log
ORDER BY created_at DESC
LIMIT 10;
```

**Check error actions:**

```sql
SELECT
  er.error_type,
  er.component,
  ea.action_type,
  ea.action_status,
  ea.confidence_score,
  ea.ticket_id
FROM error_actions ea
JOIN error_reports er ON ea.error_report_id = er.id
WHERE ea.created_at > NOW() - INTERVAL '24 hours'
ORDER BY ea.created_at DESC;
```

## Workflows

### Workflow 1: Log Only (Low Confidence)

```
Error Occurs (3+ times)
  ↓
DeepSeek Analysis (confidence < 0.7)
  ↓
Create error_action (type: log_only)
  ↓
Log to database & emit event
  ↓
Manual review via dashboard
```

### Workflow 2: Ticket Creation (Medium Confidence)

```
Error Occurs (3+ times)
  ↓
DeepSeek Analysis (0.7 ≤ confidence < 0.9)
  ↓
Create error_action (type: create_ticket)
  ↓
Generate ticket ID (ERR-{hash})
  ↓
Insert to content_entities or external system
  ↓
Assign to component owner (if configured)
  ↓
Notify via configured channels
```

### Workflow 3: Draft PR (High Confidence)

```
Error Occurs (3+ times)
  ↓
DeepSeek Analysis (confidence ≥ 0.9)
  ↓
Generate fix code via DeepSeek
  ↓
Create branch: fix/deepseek-{hash}
  ↓
Stage files with changes
  ↓
Generate conventional commit message
  ↓
Commit (if autoCommit: true) OR stage only
  ↓
Create draft PR via GitHub CLI
  ↓
Add labels: automated, deepseek-fix
  ↓
Assign to component owner
  ↓
Wait for human review & approval
```

### Workflow 4: Auto-fix (Very High Confidence + Manual Override)

```
Error Occurs (3+ times)
  ↓
DeepSeek Analysis (confidence ≥ 0.95)
  ↓
Manual approval required (requireApproval: true)
  ↓
Admin approves via dashboard
  ↓
Execute fix workflow
  ↓
Run tests to validate fix
  ↓
Merge if tests pass
  ↓
Deploy to staging → production
```

## Security Considerations

### Secret Redaction

**Automatic redaction of:**

- Passwords, API keys, tokens, secrets
- Private keys, OAuth credentials, JWTs
- Email addresses, SSNs, credit card numbers (via regex)
- Custom patterns (configurable)

**Applied to:**

- Error messages
- Stack traces
- Context objects
- Request/response bodies

### Rate Limiting

**Prevents abuse:**

- Max 10 requests/minute to Ollama (configurable)
- Max 3 concurrent requests (configurable)
- Exponential backoff on failures
- Circuit breaker pattern (TODO)

### Audit Logging

**All DeepSeek calls logged:**

- Request timestamp
- Error ID
- Request type (analysis, fix, commit)
- Token usage
- Response time
- Success/failure status

**Retention:**

- Default: 90 days
- Configurable via `security.audit.retentionDays`
- Auto-cleanup via scheduled job (TODO)

### Network Restrictions

**Ollama endpoint:**

- Default: `http://127.0.0.1:11434` (loopback only)
- Configurable: `security.network.allowedEndpoints`
- CIDR whitelist: `security.network.allowedNetworks`

**No external data transmission** unless explicitly configured.

### Approval Gates

**Manual approval required for:**

- Auto-commits (`git.workflow.autoCommit: false`)
- PR merges (`git.workflow.requireApproval: true`)
- Production deployments (external workflow)

**Approval methods:**

- Admin dashboard (TODO)
- GitHub PR review
- CLI tool (TODO)

## Configuration Examples

### Conservative (Default)

**Best for: Production environments, sensitive codebases**

```json
{
  "analysis": {
    "thresholds": {
      "minOccurrences": 5,
      "minConfidence": 0.8,
      "autoFixConfidence": 0.95
    }
  },
  "git": {
    "workflow": {
      "autoCommit": false,
      "requireApproval": true,
      "draftPR": true
    }
  },
  "actions": {
    "enabledTypes": ["log_only", "create_ticket"]
  }
}
```

### Aggressive

**Best for: Development environments, high-confidence teams**

```json
{
  "analysis": {
    "thresholds": {
      "minOccurrences": 2,
      "minConfidence": 0.6,
      "autoFixConfidence": 0.8
    }
  },
  "git": {
    "workflow": {
      "autoCommit": true,
      "requireApproval": false,
      "draftPR": false
    }
  },
  "actions": {
    "enabledTypes": ["log_only", "create_ticket", "generate_pr"]
  }
}
```

### Debug/Testing

**Best for: Development, debugging DeepSeek integration**

```json
{
  "analysis": {
    "thresholds": {
      "minOccurrences": 1,
      "minConfidence": 0.1,
      "autoFixConfidence": 1.0
    },
    "scheduling": {
      "intervalMs": 10000
    }
  },
  "actions": {
    "enabledTypes": ["log_only"]
  },
  "security": {
    "redaction": {
      "enabled": false
    }
  }
}
```

## Troubleshooting

### Issue: Worker not processing errors

**Check:**

1. Worker is running: `ps aux | grep start-error-orchestration`
2. Ollama is running: `curl http://localhost:11434/api/tags`
3. Database connection: `psql $DATABASE_URL -c "SELECT COUNT(*) FROM pending_error_analysis"`
4. Configuration: `node -e "console.log(require('./config/error-orchestration.config.json'))"`

**Logs:**

```bash
# Check worker logs
tail -f logs/error-orchestration.log

# Check Ollama logs
journalctl -u ollama -f
```

### Issue: DeepSeek analysis failing

**Check:**

1. Model is downloaded: `ollama list | grep deepseek`
2. Rate limits not exceeded: Query `deepseek_analysis_log` for recent requests
3. Network connectivity: `curl http://localhost:11434/api/generate -d '{"model":"deepseek-coder:latest","prompt":"test"}'`

**Common errors:**

- `ECONNREFUSED`: Ollama not running → Start with `ollama serve`
- `Model not found`: Model not pulled → Run `ollama pull deepseek-coder:latest`
- `Rate limit exceeded`: Too many requests → Increase `maxRequestsPerMinute` or wait

### Issue: Secrets not being redacted

**Check:**

1. Redaction enabled: `config.security.redaction.enabled = true`
2. Patterns match your secrets: Add custom patterns to `customRegex`
3. Context objects are being processed: Check `redactSecretsFromObject()` implementation

**Test redaction:**

```typescript
const service = new ErrorReportingService({ db, config });
const redacted = service.redactSecrets('password=abc123 api_key=xyz789');
console.log(redacted); // Should show [REDACTED]
```

### Issue: GitHub CLI not found

**Install GitHub CLI:**

```bash
# Windows (Scoop)
scoop install gh

# macOS (Homebrew)
brew install gh

# Linux (apt)
sudo apt install gh

# Authenticate
gh auth login
```

### Issue: Working directory not clean

**Options:**

1. Commit or stash changes: `git stash`
2. Override check: Set `git.workflow.requireApproval = false` (not recommended)
3. Use dry-run mode: Test workflow without committing

## API Reference

### ErrorReportingService

```typescript
class ErrorReportingService extends EventEmitter {
  constructor(options: ErrorReportingOptions);

  // Core methods
  async reportError(error: ErrorReport): Promise<string>;
  async getErrorStats(): Promise<any>;
  async getPendingErrors(limit: number): Promise<any[]>;
  async markAnalyzing(errorId: string): Promise<void>;
  async saveAnalysisResult(errorId: string, result: any): Promise<void>;
  async healthCheck(): Promise<{ status: string; details?: any }>;

  // Events
  on('error:reported', (data: { id: string; hash: string }) => void);
  on('error:needsAnalysis', (data: { id: string; hash: string; occurrences: number }) => void);
  on('error:analyzed', (data: { errorId: string; result: any }) => void);
}
```

### DeepSeekAnalysisClient

```typescript
class DeepSeekAnalysisClient {
  constructor(options: DeepSeekClientOptions);

  // Analysis methods
  async analyzeError(errorData: any): Promise<any>;
  async generateFix(errorData: any): Promise<any>;
  async generateCommitMessage(fixData: any): Promise<string>;

  // Utility
  async healthCheck(): Promise<{ status: string; details?: any }>;
}
```

### ErrorAnalysisWorker

```typescript
class ErrorAnalysisWorker extends EventEmitter {
  constructor(options: ErrorAnalysisWorkerOptions);

  // Lifecycle
  async start(): Promise<void>;
  async stop(): Promise<void>;
  async healthCheck(): Promise<{ status: string; details?: any }>;

  // Events
  on('worker:started', () => void);
  on('worker:stopped', () => void);
  on('error:analyzed', (data: { id: string; analysis: any; action: string }) => void);
  on('action:created', (data: { errorId: string; actionType: string; analysis: any }) => void);
  on('ticket:created', (data: { errorId: string; ticketId: string }) => void);
  on('worker:batch:completed', (data: { processed: number }) => void);
  on('worker:batch:failed', (data: { error: Error }) => void);
}
```

### GitWorkflowManager

```typescript
class GitWorkflowManager {
  constructor(config: GitWorkflowConfig, logger?: Console);

  // Git operations
  async isGitRepo(): Promise<boolean>;
  async getCurrentBranch(): Promise<string>;
  async isWorkingDirectoryClean(): Promise<boolean>;
  async createBranch(errorHash: string): Promise<string>;
  async stageFiles(files: string[]): Promise<void>;
  async commit(options: CommitOptions): Promise<string>;
  async createPR(options: PROptions): Promise<{ url?: string; number?: number }>;

  // GitHub integration
  async hasGitHubCLI(): Promise<boolean>;
  async hasGitHubDesktop(): Promise<boolean>;
  async openInGitHubDesktop(): Promise<void>;
  async syncWithGitHubDesktop(): Promise<void>;

  // Complete workflow
  async executeWorkflow(options: WorkflowOptions): Promise<WorkflowResult>;

  // Utilities
  formatCommitMessage(options: CommitMessageOptions): string;
}
```

## Future Enhancements

### Planned Features

1. **Admin Dashboard**
   - View pending errors
   - Approve/reject fixes
   - Configure thresholds
   - Monitor system health

2. **External Ticketing Systems**
   - GitHub Issues integration
   - Linear API support
   - Jira integration
   - Custom webhooks

3. **Advanced Analysis**
   - Pattern detection across errors
   - Root cause analysis
   - Impact assessment
   - Related error clustering

4. **Deployment Integration**
   - CI/CD pipeline hooks
   - Staging environment testing
   - Rollback on test failures
   - Production deployment gates

5. **Notifications**
   - Slack/Discord webhooks
   - Email alerts
   - SMS for critical errors
   - Custom notification channels

6. **Metrics & Analytics**
   - Error trends over time
   - Fix success rates
   - DeepSeek confidence accuracy
   - Component reliability scores

## Contributing

See main project `CONTRIBUTING.md` for guidelines.

## License

See main project `LICENSE` file.

## Support

- **Issues:** GitHub Issues
- **Discussions:** GitHub Discussions
- **Documentation:** This README + inline code comments
- **Examples:** `examples/` directory

---

**Built with ❤️ using DeepSeek and LightDom**
