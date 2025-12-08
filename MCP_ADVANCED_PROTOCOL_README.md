# Advanced MCP Bi-Directional Protocol
## Self-Learning System with Trust Scoring & Campaign Governance

## 🎯 Overview

Revolutionary bi-directional protocol that combines:
- **Atomic component data mining** (atoms → molecules → organisms → templates → pages)
- **Progressive state testing** - Tests only natural progressions, not all combinations
- **Trust scoring system** - Learns what works and reuses proven patterns
- **Campaign governance** - Billing-integrated resource management (free/paid tiers)
- **Live self-evaluation** - Analyzes failures and auto-generates fixes
- **Multi-schema orchestration** - Parallel execution for client campaigns

## 🧬 Atomic Component Design

Based on Brad Frost's Atomic Design methodology for data mining:

### Component Hierarchy

```
Pages (Full Workflows)
    ↓
Templates (Reusable Configs)
    ↓
Organisms (Complex Patterns)
    ↓  
Molecules (Attribute Combinations)
    ↓
Atoms (Individual Attributes)
```

### API: Atomic Data Mining

```typescript
POST /api/mcp/atomic/datamine
{
  "category": "seo",
  "attributes": ["title", "meta_description", "h1", "canonical"],
  "componentType": "molecule",
  "depth": 3
}
```

**Response:**
```json
{
  "success": true,
  "structure": {
    "atoms": [
      {
        "attribute": "title",
        "category": "seo",
        "trust_score": 0.95,
        "usage_count": 1000
      }
    ],
    "molecules": [
      {
        "atoms": ["title", "meta_description"],
        "synergy": 0.88,
        "trust_score": 0.92
      }
    ],
    "organisms": [...],
    "templates": [...],
    "pages": [...]
  },
  "recommendations": {
    "suggestedMolecules": [...],
    "reuseTemplates": [...]
  }
}
```

**Benefits:**
- **Blow-out-of-water functionality** - Builds complex from simple, proven patterns
- **Component reusability** - Higher-level components from trusted lower-level ones
- **Natural scaling** - Start with atoms, build to pages automatically

## 🧪 Progressive State Testing

### Efficient Combination Testing

Instead of testing ALL combinations (exponential), tests only **natural progressions**:

```typescript
POST /api/mcp/atomic/test-combinations
{
  "initialPrompt": "Analyze SEO for website",
  "maxDepth": 5,
  "resourceBudget": 10000
}
```

**How it works:**
1. AI identifies natural next steps from initial prompt
2. Tests only high-confidence progressions
3. Stops when budget exhausted or max depth reached
4. Stores successful paths for reuse

**Response:**
```json
{
  "success": true,
  "progressionTree": {
    "root": "Analyze SEO for website",
    "testedPaths": 15,
    "successfulPaths": 12,
    "resourcesUsed": 8500,
    "efficiency": 0.80
  },
  "optimalConfig": {
    "based_on_paths": 12,
    "recommended_depth": 4,
    "confidence": 0.85
  }
}
```

**Power:**
- **Spends resources only on bettering product** - No wasted testing
- **Natural progression** - Tests what humans would naturally do next
- **Resource efficient** - 10x faster than brute force

## 💰 Campaign Governance & Billing

### Plan-Based Resource Management

**Plans:**
- **Free**: 100 executions/month, 3 schemas, basic features
- **Basic**: 1K executions, 10 schemas, auto-optimization
- **Pro**: 10K executions, 50 schemas, advanced features
- **Enterprise**: Unlimited, all features

### API: Create Governed Campaign

```typescript
POST /api/mcp/campaign/create
{
  "clientId": "client-123",
  "campaignName": "Q1 SEO Campaign",
  "plan": "pro",
  "billingCycle": "monthly",
  "config": {
    "autoStopConfig": {
      "onBillingEnd": true,
      "onLimitReached": true,
      "gracePeriodDays": 7
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "campaign": {
    "id": "campaign-1234567890",
    "plan": "pro",
    "limits": {
      "maxExecutions": 10000,
      "maxSchemas": 50,
      "maxBundles": 20,
      "autoOptimization": true
    },
    "usage": {
      "executions": 0,
      "schemas": 0
    },
    "nextBillingDate": "2025-02-04T00:00:00Z",
    "autoStopConfig": {
      "onBillingEnd": true,
      "onLimitReached": true
    }
  }
}
```

### When DeepSeek Stops (Config-Governed)

**Auto-stop triggers:**
1. **Billing cycle ends** - Campaign stops at next billing date
2. **Limit reached** - Stops when execution quota exhausted
3. **Client discontinues** - Manual stop via API
4. **Grace period expires** - 7-day grace period after billing

```typescript
// Campaign auto-stops when billing ends
// Configured per campaign, not global
POST /api/mcp/campaign/stop
{
  "campaignId": "campaign-123",
  "reason": "billing_cycle_ended"
}
```

### Execute Within Governance

```typescript
POST /api/mcp/campaign/execute
{
  "campaignId": "campaign-123",
  "task": {
    "type": "analyze_seo",
    "url": "https://example.com"
  }
}
```

**Checks before execution:**
- Campaign active?
- Within execution limit?
- Within schema limit?
- Billing current?

**If limit reached:**
```json
{
  "success": false,
  "error": "Campaign limit reached",
  "limit": "executions",
  "upgrade": "enterprise"
}
```

## 🏆 Trust Scoring System

### How Much Times Did This Do Exactly What I Asked?

Every execution records trust:

```typescript
POST /api/mcp/trust/record
{
  "type": "schema",
  "identifier": "seo-analysis",
  "success": true,
  "metadata": {
    "campaignId": "campaign-123",
    "task": "analyze_seo"
  }
}
```

### Trust Score Calculation

```
Trust Score = Successful Executions / Total Executions

Levels:
- Excellent: > 0.9 (90%+ success rate)
- Good: > 0.7 (70%+ success rate)
- Acceptable: > 0.5 (50%+ success rate)
- Poor: < 0.5 (Below 50%)
```

### Get Trusted Patterns for Reuse

```typescript
GET /api/mcp/trust/recommendations?category=seo&minScore=0.7
```

**Response:**
```json
{
  "success": true,
  "recommendations": [
    {
      "type": "schema",
      "identifier": "seo-analysis",
      "total_executions": 100,
      "successful_executions": 92,
      "success_rate": 0.92,
      "trust_level": "excellent",
      "last_used": "2025-01-04T20:00:00Z"
    }
  ]
}
```

**Auto-reuse:**
- System automatically selects high-trust patterns
- Proven configs applied to new campaigns
- Learning improves over time

## 🔧 Live Self-Evaluation & Auto-Fix

### Analyze Failures in Real-Time

```typescript
POST /api/mcp/evaluate/analyze-failure
{
  "error": "TypeError: Cannot read property 'title' of undefined",
  "context": {
    "serverId": 1,
    "campaignId": "campaign-123",
    "category": "seo"
  },
  "codeSnapshot": "const title = page.metadata.title;"
}
```

**Response:**
```json
{
  "success": true,
  "analysis": {
    "rootCause": "missing_null_check",
    "confidence": 0.85,
    "similarFailures": 3
  },
  "suggestions": [
    {
      "type": "code_change",
      "suggestion": "Add null check: const title = page.metadata?.title || '';"
    },
    {
      "type": "config_change",
      "suggestion": "Enable strict mode validation"
    }
  ],
  "autoConfig": {
    "strict_validation": true,
    "null_checks": true,
    "based_on": "failure_analysis",
    "confidence": 0.85
  }
}
```

**Auto-apply if:**
- Confidence > 0.8
- Campaign has `autoOptimization: true`
- Pattern previously successful

### Auto-Generate Schemas from Learning

```typescript
POST /api/mcp/evaluate/generate-schemas
{
  "category": "seo",
  "basedOnSuccess": true
}
```

**System:**
1. Analyzes successful executions
2. Identifies patterns that work
3. Generates new schemas from patterns
4. Validates schema definitions
5. Auto-links to relevant servers

**Response:**
```json
{
  "success": true,
  "generatedSchemas": [
    {
      "id": 123,
      "name": "Auto-SEO-Analysis-1704398400",
      "description": "Auto-generated from trusted pattern",
      "category": "seo",
      "trust_score": 0.88,
      "auto_generated": true
    }
  ],
  "count": 1
}
```

## 🎭 Multi-Schema Orchestration for Campaigns

### Run Multiple Schemas in Parallel

```typescript
POST /api/mcp/orchestrate/multi-schema-task
{
  "campaignId": "campaign-123",
  "schemaIds": [1, 2, 3, 4, 5],
  "parallelism": 3,
  "task": {
    "type": "comprehensive_seo_audit",
    "url": "https://example.com"
  }
}
```

**Execution:**
1. Loads all schemas
2. Executes in parallel batches (3 at a time)
3. Checks campaign limits before each
4. Records trust scores
5. Updates campaign usage

**Response:**
```json
{
  "success": true,
  "orchestrationId": "orch-1704398400",
  "results": [
    {
      "schemaId": 1,
      "schemaName": "SEO Analysis",
      "success": true,
      "result": {...}
    },
    {
      "schemaId": 2,
      "schemaName": "Content Analysis",
      "success": true,
      "result": {...}
    }
  ],
  "summary": {
    "total": 5,
    "successful": 4,
    "failed": 1
  }
}
```

**Power for Clients:**
- Run complete SEO audits in parallel
- Each schema specialized for one aspect
- Results combined automatically
- Governed by campaign limits

## 📊 Free Plan Engagement (Data Mining for Improvement)

### Track Free User Behavior

```typescript
POST /api/mcp/free-plan/engagement
{
  "userId": "user-free-001",
  "action": "analyzed_page",
  "context": {
    "schemaUsed": "basic-seo",
    "timeSpent": 45,
    "satisfied": true
  }
}
```

**System tracks:**
- What features free users try
- Which schemas are most popular
- Conversion potential (usage patterns)
- Feature requests (implicit)

**Analysis:**
```typescript
GET /api/mcp/free-plan/insights?userId=user-free-001
```

**Response:**
```json
{
  "success": true,
  "insights": {
    "totalActions": 87,
    "uniqueActions": 12,
    "lastActivity": "2025-01-04T19:00:00Z",
    "conversionPotential": 0.87,
    "recommendation": "High engagement - likely to convert"
  }
}
```

**Make Service Engaging:**
- Real-time progress visualization
- Achievement unlocking
- Feature previews (pro features)
- Educational content based on usage

## 🎬 Real-Time Progress Visualization

The system emits WebSocket events for live monitoring:

```javascript
const socket = io('/mcp-progress');

socket.on('atomic-progress', (data) => {
  console.log('Building component:', data.componentType);
  updateProgressBar(data.completion);
});

socket.on('trust-score-updated', (data) => {
  console.log('Pattern trust:', data.score);
  showTrustBadge(data.level);
});

socket.on('campaign-usage-updated', (data) => {
  console.log('Quota:', data.remainingQuota);
  updateQuotaMeter(data);
});

socket.on('schema-auto-generated', (data) => {
  console.log('New schema created:', data.schemaName);
  showNotification('AI created new schema from your patterns!');
});
```

## 📈 Database Schema

### New Tables

**Campaigns** - Billing integration
```sql
CREATE TABLE campaigns (
  id VARCHAR(255) PRIMARY KEY,
  client_id VARCHAR(255) NOT NULL,
  plan VARCHAR(50) NOT NULL,
  limits JSONB NOT NULL,
  usage JSONB NOT NULL,
  next_billing_date TIMESTAMP,
  auto_stop_config JSONB
);
```

**Trust Scores** - Learning system
```sql
CREATE TABLE trust_scores (
  type VARCHAR(100) NOT NULL,
  identifier VARCHAR(255) NOT NULL,
  total_executions INTEGER DEFAULT 0,
  successful_executions INTEGER DEFAULT 0,
  UNIQUE(type, identifier)
);
```

**Atomic Components** - Component hierarchy
```sql
CREATE TABLE atomic_components (
  component_type VARCHAR(50) NOT NULL, -- atom, molecule, organism, template, page
  name VARCHAR(255) NOT NULL,
  definition JSONB NOT NULL,
  parent_components INTEGER[],
  trust_score DECIMAL(5,4)
);
```

**Trusted Paths** - Proven progressions
```sql
CREATE TABLE trusted_paths (
  path JSONB NOT NULL,
  success_rate DECIMAL(5,4),
  total_executions INTEGER
);
```

**Failure Analysis** - Self-evaluation
```sql
CREATE TABLE failure_analysis (
  error_message TEXT NOT NULL,
  root_cause VARCHAR(255),
  fix_suggestions JSONB,
  auto_fixed BOOLEAN DEFAULT false
);
```

**Orchestrations** - Multi-schema execution
```sql
CREATE TABLE orchestrations (
  id VARCHAR(255) PRIMARY KEY,
  campaign_id VARCHAR(255),
  schema_ids JSONB NOT NULL,
  results JSONB
);
```

**Free Plan Engagement** - User behavior
```sql
CREATE TABLE free_plan_engagement (
  user_id VARCHAR(255) NOT NULL,
  action VARCHAR(100) NOT NULL,
  context JSONB
);
```

### Views & Functions

**campaign_health** - Monitor campaign usage
**trust_leaderboard** - Top trusted patterns
**component_hierarchy** - Atomic component tree
**free_plan_insights** - Conversion potential

**Functions:**
- `check_campaign_expiry()` - Auto-stop on billing end
- `calculate_component_synergy()` - Multi-component trust
- `suggest_schema_combinations()` - AI recommendations
- `auto_optimize_campaign()` - Generate optimal config

## 🚀 Complete Workflow Example

### Client Pays for Pro Plan Campaign

```typescript
// 1. Create campaign
const campaign = await fetch('/api/mcp/campaign/create', {
  method: 'POST',
  body: JSON.stringify({
    clientId: 'acme-corp',
    campaignName: 'ACME Q1 SEO Blitz',
    plan: 'pro',
    billingCycle: 'monthly'
  })
});
// Campaign starts, limits set, billing scheduled

// 2. System mines data using atomic design
const miningResult = await fetch('/api/mcp/atomic/datamine', {
  method: 'POST',
  body: JSON.stringify({
    category: 'seo',
    attributes: ['title', 'meta', 'h1', 'canonical', 'schema_markup'],
    componentType: 'organism',
    depth: 5
  })
});
// Builds: atoms → molecules → organisms → templates

// 3. Test natural progressions efficiently
const testingResult = await fetch('/api/mcp/atomic/test-combinations', {
  method: 'POST',
  body: JSON.stringify({
    initialPrompt: 'Comprehensive SEO audit for ACME',
    maxDepth: 6,
    resourceBudget: campaign.limits.maxExecutions
  })
});
// Only tests natural paths, stores successful ones

// 4. Execute multi-schema orchestration
const execution = await fetch('/api/mcp/orchestrate/multi-schema-task', {
  method: 'POST',
  body: JSON.stringify({
    campaignId: campaign.id,
    schemaIds: [1, 2, 3, 4, 5, 6, 7, 8],
    parallelism: 5,
    task: {
      type: 'full_seo_audit',
      urls: ['https://acme.com', 'https://acme.com/products']
    }
  })
});
// Runs 8 schemas in parallel batches of 5

// 5. System learns and auto-optimizes
// - Records trust scores for each schema
// - Analyzes any failures
// - Auto-generates fixes if confidence high
// - Creates new schemas from successful patterns

// 6. Real-time progress for client
socket.on('orchestration-progress', (data) => {
  showProgress(data.completed, data.total);
  showResults(data.results);
});

// 7. Campaign auto-stops on billing end
// - Next billing date reached
// - System auto-stops all resources
// - Client charged, campaign renewed or ended
```

## 🎯 Summary: The Complete Picture

This system revolutionizes MCP:

1. **Atomic Design** - Builds complex from simple, proven patterns
2. **Smart Testing** - Only tests natural progressions, not all combos
3. **Trust System** - Learns what works, reuses proven patterns
4. **Billing Integration** - Auto-governs resources by plan tier
5. **Self-Evaluation** - Analyzes failures, auto-generates fixes
6. **Multi-Schema Power** - Parallel execution for comprehensive tasks
7. **Free Plan Mining** - Learns from free users to improve service
8. **Real-Time Visibility** - Clients see progress as it happens

**Result:** A self-improving, resource-efficient, client-friendly AI system that learns and optimizes continuously.
