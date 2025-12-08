# Error Orchestration System - Quick Start Guide

> Get up and running with DeepSeek-powered error analysis in 5 minutes

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database running
- Ollama installed and running
- LightDom repository cloned

## Step 1: Install Ollama (if not already installed)

### Windows

```powershell
# Download from https://ollama.com/download
# Or use Scoop
scoop install ollama
```

### macOS

```bash
brew install ollama
```

### Linux

```bash
curl -fsSL https://ollama.com/install.sh | sh
```

## Step 2: Start Ollama and Pull DeepSeek Model

```bash
# Start Ollama server
ollama serve

# In another terminal, pull the DeepSeek model
ollama pull deepseek-coder:latest

# Verify model is available
ollama list
```

## Step 3: Run Database Migrations

```bash
# From LightDom root directory
psql $DATABASE_URL -f migrations/007_error_reporting_system.sql
psql $DATABASE_URL -f migrations/008_error_event_logs.sql

# Verify tables created
psql $DATABASE_URL -c "\dt error_*"
```

You should see:

- `error_reports`
- `error_actions`
- `error_aggregations`
- `deepseek_analysis_log`
- `error_orchestration_config`
- `error_event_logs`

## Step 4: Configure Error Orchestration

The default configuration is already in place at `config/error-orchestration.config.json`.

**Optional: Customize settings**

```bash
# Edit configuration
nano config/error-orchestration.config.json
```

**Key settings to review:**

```json
{
  "analysis": {
    "thresholds": {
      "minOccurrences": 3, // Errors must occur 3x before analysis
      "minConfidence": 0.7, // Minimum confidence for action
      "autoFixConfidence": 0.9 // Confidence for auto-commit
    }
  },
  "git": {
    "workflow": {
      "autoCommit": false, // Set true to auto-commit fixes
      "requireApproval": true, // Set false to skip approval
      "draftPR": true // Set false for non-draft PRs
    }
  }
}
```

## Step 5: Start Error Orchestration Service

### Option A: Start error orchestration only

```bash
node scripts/start-error-orchestration.js
```

### Option B: Start all services (recommended)

```bash
npm run start:all
```

The error orchestration service will be included automatically.

### Option C: Use the Makefile

```bash
make dev-full
```

## Step 6: Verify Services Are Running

```bash
# Check Ollama
curl http://localhost:11434/api/tags

# Check error orchestration health
curl http://localhost:3002/health

# Check database connection
psql $DATABASE_URL -c "SELECT COUNT(*) FROM error_reports"
```

## Step 7: Test Error Reporting

### Method 1: Manual test via Node.js

Create a file `test-error-reporting.js`:

```javascript
import { Pool } from 'pg';
import ErrorReportingService from './services/error-reporting/ErrorReportingService.js';
import config from './config/error-orchestration.config.json' assert { type: 'json' };

const db = new Pool({ connectionString: process.env.DATABASE_URL });
const errorService = new ErrorReportingService({ db, config });

// Report a test error
async function testReport() {
  const errorId = await errorService.reportError({
    errorType: 'TestError',
    severity: 'error',
    message: 'This is a test error from the quick start guide',
    stackTrace: new Error().stack,
    component: 'test',
    service: 'quick-start',
    context: { test: true },
    environment: 'development',
  });

  console.log(`Error reported: ${errorId}`);
}

testReport()
  .catch(console.error)
  .finally(() => db.end());
```

Run it:

```bash
node test-error-reporting.js
```

### Method 2: Trigger same error multiple times

```bash
# Run 3 times to trigger analysis threshold
node test-error-reporting.js
node test-error-reporting.js
node test-error-reporting.js
```

## Step 8: Monitor Error Processing

### View pending errors

```bash
psql $DATABASE_URL -c "SELECT * FROM pending_error_analysis"
```

### View analysis log

```bash
psql $DATABASE_URL -c "SELECT * FROM deepseek_analysis_log ORDER BY created_at DESC LIMIT 5"
```

### View structured event log

```bash
psql $DATABASE_URL -c "SELECT * FROM error_event_logs ORDER BY created_at DESC LIMIT 10"
```

### View created actions

```bash
psql $DATABASE_URL -c "
  SELECT
    er.error_type,
    er.component,
    ea.action_type,
    ea.confidence_score,
    ea.ticket_id
  FROM error_actions ea
  JOIN error_reports er ON ea.error_report_id = er.id
  ORDER BY ea.created_at DESC
  LIMIT 10
"
```

## Step 9: Check Service Logs

```bash
# Error orchestration service logs
tail -f logs/error-orchestration.log

# Or check stdout if running in terminal
# You should see:
# [INFO] Error analysis worker started
# [INFO] Polling interval: 60000ms
# [INFO] Processing N errors
# [INFO] Error {id} analyzed: confidence=0.X, action={action}
```

## Step 10: Verify DeepSeek Analysis

Wait for the next polling interval (default: 60 seconds) or trigger manually:

```bash
# Query error reports
psql $DATABASE_URL -c "
  SELECT
    error_type,
    component,
    occurrences,
    status,
    analysis_result->>'rootCause' as root_cause,
    analysis_result->>'confidence' as confidence
  FROM error_reports
  WHERE status = 'analyzed'
  ORDER BY updated_at DESC
  LIMIT 5
"
```

You should see:

- `status = 'analyzed'`
- `root_cause` populated with DeepSeek's diagnosis
- `confidence` score (0-1)

## Troubleshooting

### Issue: Ollama connection refused

**Solution:**

```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# If not, start it
ollama serve
```

### Issue: DeepSeek model not found

**Solution:**

```bash
# Pull the model
ollama pull deepseek-coder:latest

# Verify
ollama list | grep deepseek
```

### Issue: Database connection error

**Solution:**

```bash
# Check DATABASE_URL environment variable
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL -c "SELECT 1"

# If fails, check PostgreSQL is running
sudo systemctl status postgresql  # Linux
brew services list | grep postgres  # macOS
```

### Issue: Worker not processing errors

**Solution:**

```bash
# Check worker is running
ps aux | grep start-error-orchestration

# Check configuration
node -e "console.log(require('./config/error-orchestration.config.json').analysis.scheduling)"

# Check for errors in logs
tail -f logs/error-orchestration.log
```

### Issue: Rate limit exceeded

**Solution:**

```bash
# Check recent requests
psql $DATABASE_URL -c "
  SELECT COUNT(*),
         DATE_TRUNC('minute', created_at) as minute
  FROM deepseek_analysis_log
  WHERE created_at > NOW() - INTERVAL '5 minutes'
  GROUP BY minute
  ORDER BY minute DESC
"

# If rate limited, increase limits in config
# config.analysis.rateLimit.maxRequestsPerMinute
```

## Next Steps

### 1. Integrate with Your API Server

See `examples/error-orchestration-integration.js` for complete integration example.

Add to your `api-server-express.js`:

```javascript
import { setupErrorOrchestration } from './examples/error-orchestration-integration.js';

// After app initialization
setupErrorOrchestration(app);
```

### 2. Set Up GitHub CLI (for PR creation)

```bash
# Install GitHub CLI
# See: https://cli.github.com/

# Authenticate
gh auth login

# Test
gh repo view
```

### 3. Configure Git Workflow

Enable auto-commit and PR creation:

```json
{
  "git": {
    "workflow": {
      "autoCommit": true,
      "draftPR": true
    }
  },
  "actions": {
    "enabledTypes": ["log_only", "create_ticket", "generate_pr"]
  }
}
```

### 4. Create Admin Dashboard (TODO)

Build a UI to:

- View pending errors
- Approve/reject fixes
- Monitor system health
- Configure thresholds

### 5. Set Up Notifications

Add Slack/Discord webhooks:

```json
{
  "notifications": {
    "slack": {
      "enabled": true,
      "webhookUrl": "https://hooks.slack.com/services/YOUR/WEBHOOK/URL",
      "channel": "#errors"
    }
  }
}
```

## Production Checklist

Before deploying to production:

- [ ] Review and adjust confidence thresholds
- [ ] Enable secret redaction (`security.redaction.enabled: true`)
- [ ] Set `git.workflow.requireApproval: true`
- [ ] Configure rate limits appropriately
- [ ] Set up monitoring and alerting
- [ ] Test error reporting end-to-end
- [ ] Document your incident response workflow
- [ ] Train team on approval process
- [ ] Set up database backups (includes error history)
- [ ] Configure log retention policies

## Getting Help

- **Documentation:** `ERROR_ORCHESTRATION_README.md`
- **Examples:** `examples/error-orchestration-integration.js`
- **Issues:** GitHub Issues
- **Discussions:** GitHub Discussions

## Congratulations! 🎉

You now have a fully functional AI-powered error analysis and remediation system running!

Errors will be:

1. Automatically captured and deduplicated
2. Analyzed by DeepSeek when threshold is met
3. Converted into actionable outcomes (logs, tickets, PRs)
4. Ready for human review and approval

---

**Happy debugging!** 🐛🔍🤖
