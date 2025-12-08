# Knowledge Graph & AI-Powered Codebase Intelligence

## Complete System for Autonomous Code Management

This system provides advanced codebase intelligence with AI-powered analysis, knowledge graphs, git automation, and autonomous agents.

---

## 📚 Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Database Schema](#database-schema)
4. [Services](#services)
5. [Workflows](#workflows)
6. [Usage Guide](#usage-guide)
7. [Integration](#integration)
8. [Best Practices](#best-practices)

---

## 🎯 Overview

### What This System Does

**Codebase Intelligence**:
- Parses and indexes your entire codebase
- Builds knowledge graphs of code relationships
- Detects dead code, bugs, and complexity issues
- Provides semantic code search

**AI-Powered Analysis**:
- DeepSeek integration for code review
- Automatic issue detection
- Code fix generation
- Documentation generation
- Refactoring suggestions

**Git Workflow Automation**:
- Automatic branch creation
- Smart commit messages
- PR creation with AI reasoning
- Merge conflict detection
- GitHub Desktop-style sync

**Autonomous Agents**:
- Self-managing development loops
- Automatic bug fixes
- Learning from outcomes
- Pattern recognition

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  Autonomous Code Agent                       │
│                   (Orchestrator)                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌────────────────┐  ┌──────────────────┐  ┌─────────────┐ │
│  │   Codebase     │  │   DeepSeek       │  │     Git     │ │
│  │   Indexing     │──│   Integration    │──│  Workflow   │ │
│  │   Service      │  │                  │  │ Automation  │ │
│  └────────────────┘  └──────────────────┘  └─────────────┘ │
│          │                    │                     │        │
│          ▼                    ▼                     ▼        │
│  ┌────────────────────────────────────────────────────────┐ │
│  │          Knowledge Graph Database (PostgreSQL)         │ │
│  │  • Code Entities        • Relationships               │ │
│  │  • Issues              • Agent Tasks                  │ │
│  │  • Git Branches/PRs    • Learning Patterns           │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## 💾 Database Schema

### Core Tables

**code_entities**: Functions, classes, files with embeddings
```sql
- entity_id (unique identifier)
- entity_type (function, class, file, etc.)
- name, file_path, line numbers
- embedding (for semantic search)
- complexity_score
- properties (JSON metadata)
```

**code_relationships**: How code connects
```sql
- from_entity_id → to_entity_id
- relationship_type (calls, imports, extends, etc.)
- weight, confidence
```

**code_issues**: Detected problems
```sql
- severity, category
- file_path, line numbers
- ai_detected, ai_confidence
- status, resolution
```

**agent_branches**: AI-managed git branches
```sql
- branch_name, purpose
- created_by_agent
- status, merge_status
```

**agent_tasks**: Autonomous agent work
```sql
- task_type, description
- status, success
- confidence_score, quality_score
```

**agent_learning_patterns**: ML for code
```sql
- pattern_type, pattern_signature
- solution_template
- success_count, failure_count
- embedding (for similarity)
```

### Special Features

**Recursive Relationships**:
```sql
-- Find all related entities up to depth N
SELECT * FROM find_related_entities('entity_123', 3);
```

**Dead Code Detection**:
```sql
-- Find functions never called
SELECT * FROM orphaned_code;
```

**Call Graph Analysis**:
```sql
-- Materialized view of call relationships
SELECT * FROM code_call_graph WHERE from_name = 'myFunction';
```

---

## 🛠️ Services

### 1. CodebaseIndexingService

**Purpose**: Parse and index codebase with AST analysis

**Features**:
- Tree-sitter AST parsing (JS/TS)
- Entity extraction (functions, classes, imports)
- Relationship building (call graphs, dependencies)
- Issue detection (dead code, complexity)
- Semantic embeddings
- DeepSeek integration

**Usage**:
```javascript
import CodebaseIndexingService from './services/codebase-indexing-service.js';

const indexer = new CodebaseIndexingService({
  rootDir: '/path/to/repo',
  db: dbPool,
  deepseekService: deepseek,
});

const result = await indexer.indexCodebase({
  incremental: false,
});
```

### 2. GitWorkflowAutomationService

**Purpose**: Automate git operations for AI agents

**Features**:
- Branch creation with naming conventions
- Auto-commit with formatting
- PR creation with AI reasoning
- Merge conflict detection
- GitHub Desktop-style sync
- Push to remote

**Usage**:
```javascript
import GitWorkflowAutomationService from './services/git-workflow-automation-service.js';

const git = new GitWorkflowAutomationService({
  repoPath: '/path/to/repo',
  githubToken: process.env.GITHUB_TOKEN,
  repoOwner: 'user',
  repoName: 'repo',
});

// Create branch
const branch = await git.createAgentBranch({
  purpose: 'bugfix',
  description: 'Fix memory leak',
  agentId: 'agent-001',
});

// Commit changes
await git.autoCommit({
  message: 'fix: resolve memory leak in parser',
  files: ['src/parser.js'],
});

// Create PR
await git.createPullRequest({
  title: 'Fix: Memory leak in parser',
  body: 'Resolves issue #123',
  agentReasoning: 'Identified leak in event listeners',
});
```

### 3. DeepSeekCodebaseIntegration

**Purpose**: AI-powered code analysis and generation

**Features**:
- Code analysis and review
- Bug fix generation
- Documentation generation
- Semantic code search
- Refactoring suggestions
- Code explanation

**Usage**:
```javascript
import DeepSeekCodebaseIntegration from './services/deepseek-codebase-integration.js';

const deepseek = new DeepSeekCodebaseIntegration({
  apiKey: process.env.DEEPSEEK_API_KEY,
  db: dbPool,
});

// Analyze code
const analysis = await deepseek.analyzeEntity(entity, {
  code: sourceCode,
});

// Generate fix
const fix = await deepseek.generateFix(issue, {
  code: currentCode,
});

// Semantic search
const results = await deepseek.semanticSearch('authentication logic', {
  limit: 10,
});
```

### 4. AutonomousCodeAgent

**Purpose**: Self-managing development agent

**Features**:
- Autonomous task identification
- Automatic code fixes
- PR creation with reasoning
- Learning from outcomes
- Pattern recognition
- Self-improvement

**Usage**:
```javascript
import AutonomousCodeAgent from './services/autonomous-code-agent.js';

const agent = new AutonomousCodeAgent({
  agentId: 'agent-001',
  db: dbPool,
  deepseekService: deepseek,
  autoFix: true,
  autoPR: true,
  githubToken: process.env.GITHUB_TOKEN,
});

// Start autonomous loop
await agent.start();
```

---

## 🔄 Workflows

### Workflow 1: Codebase Indexing

```bash
# Step 1: Run indexing
node scripts/index-codebase.js

# Step 2: View results
psql -d knowledge_graph -c "SELECT COUNT(*) FROM code_entities;"
psql -d knowledge_graph -c "SELECT * FROM code_issues WHERE status='open';"

# Step 3: Analyze specific entity
node scripts/analyze-entity.js --entity-id function_abc123
```

### Workflow 2: Autonomous Bug Fixing

```bash
# Start agent
node scripts/start-autonomous-agent.js

# The agent will:
# 1. Index codebase
# 2. Identify issues
# 3. Create branches
# 4. Generate fixes
# 5. Commit & create PRs
# 6. Learn from results

# Monitor progress
node scripts/agent-status.js
```

### Workflow 3: Manual Code Analysis

```javascript
// 1. Index codebase
const indexer = new CodebaseIndexingService({ db, deepseekService });
await indexer.indexCodebase();

// 2. Find issues
const issues = await db.query(`
  SELECT * FROM code_issues 
  WHERE severity IN ('critical', 'high')
  ORDER BY severity, ai_confidence DESC
`);

// 3. Analyze specific issue
const analysis = await deepseekService.analyzeEntity(issue.related_entity_id);

// 4. Generate fix
const fix = await deepseekService.generateFix(issue);

// 5. Manual review and apply
```

### Workflow 4: Semantic Code Search

```javascript
// Search for authentication code
const results = await deepseekService.semanticSearch('user authentication', {
  entityTypes: ['function', 'class'],
  limit: 10,
});

// Find similar code
const similar = await deepseekService.findSimilarCode('entity_123');
```

### Workflow 5: Git Automation

```javascript
// 1. Create feature branch
const branch = await git.createAgentBranch({
  purpose: 'feature',
  description: 'Add new API endpoint',
});

// 2. Make changes (manually or programmatically)

// 3. Commit
await git.autoCommit({
  message: 'feat: add user profile endpoint',
  files: ['src/api/profile.js'],
});

// 4. Check conflicts
const conflicts = await git.detectMergeConflicts();

// 5. Create PR
if (!conflicts.hasConflicts) {
  await git.createPullRequest({
    title: 'Add user profile endpoint',
    body: 'Implements #456',
  });
}
```

---

## 📖 Usage Guide

### Initial Setup

**1. Database Setup**:
```bash
# Create database
createdb knowledge_graph

# Run schema
psql -d knowledge_graph -f database/schema-knowledge-graph-codebase.sql

# Install pgvector extension
psql -d knowledge_graph -c "CREATE EXTENSION vector;"
```

**2. Environment Variables**:
```bash
# .env
DATABASE_URL=postgresql://user:pass@localhost/knowledge_graph
DEEPSEEK_API_KEY=your_key
DEEPSEEK_BASE_URL=https://api.deepseek.com
GITHUB_TOKEN=your_token
```

**3. Install Dependencies**:
```bash
npm install tree-sitter tree-sitter-javascript tree-sitter-typescript
npm install simple-git @octokit/rest
npm install pg glob
```

### Running Components

**Index Codebase**:
```javascript
import { Pool } from 'pg';
import CodebaseIndexingService from './services/codebase-indexing-service.js';

const db = new Pool({ connectionString: process.env.DATABASE_URL });

const indexer = new CodebaseIndexingService({
  rootDir: process.cwd(),
  db,
});

await indexer.indexCodebase();
```

**Start Autonomous Agent**:
```javascript
import AutonomousCodeAgent from './services/autonomous-code-agent.js';

const agent = new AutonomousCodeAgent({
  agentId: 'agent-001',
  db,
  deepseekService,
  githubToken: process.env.GITHUB_TOKEN,
  repoOwner: 'user',
  repoName: 'repo',
});

await agent.start();
```

**Query Knowledge Graph**:
```sql
-- Find all functions calling a specific function
SELECT * FROM code_call_graph 
WHERE to_name = 'processData';

-- Find high-complexity code
SELECT * FROM code_entities 
WHERE complexity_score > 10 
ORDER BY complexity_score DESC;

-- Find dead code
SELECT * FROM orphaned_code;

-- Find related entities
SELECT * FROM find_related_entities('function_123', 3);
```

---

## 🔗 Integration

### With Existing Services

**DeepSeek Service**:
```javascript
import { DeepSeekAPIService } from './services/deepseek-api-service.js';

const deepseek = new DeepSeekAPIService({
  apiKey: process.env.DEEPSEEK_API_KEY,
});

const codebaseIntegration = new DeepSeekCodebaseIntegration({
  db,
  apiKey: process.env.DEEPSEEK_API_KEY,
});
```

**Storybook Mining**:
```javascript
// Use crawler configurations
await db.query(`
  INSERT INTO crawler_configurations (
    config_id, algorithm_type, extraction_rules, target_tables
  ) VALUES (
    'storybook-default',
    'storybook',
    $1::jsonb,
    ARRAY['storybook_instances', 'storybook_components']
  )
`, [extractionRules]);
```

### API Integration

**REST Endpoints** (to be created):
```
POST /api/codebase/index
POST /api/codebase/search
GET  /api/codebase/entities
GET  /api/codebase/issues
POST /api/agents/start
GET  /api/agents/status
POST /api/git/branch
POST /api/git/commit
POST /api/git/pr
```

---

## ✅ Best Practices

### 1. Indexing Strategy

**Full Index**: Once per day
**Incremental**: On file changes
**Targeted**: For specific files/directories

### 2. Agent Configuration

**Start Conservatively**:
- Begin with `autoFix: false`
- Review agent suggestions manually
- Gradually enable automation

**Set Confidence Thresholds**:
- `minConfidence: 0.8` for critical fixes
- `minConfidence: 0.6` for refactorings
- `minConfidence: 0.5` for documentation

### 3. Git Workflow

**Branch Naming**: Use agent prefix (`agent/bugfix/...`)
**PR Reviews**: Always require human review
**Testing**: Run tests before merging agent PRs

### 4. Database Maintenance

**Regular Tasks**:
```sql
-- Refresh materialized views
REFRESH MATERIALIZED VIEW CONCURRENTLY code_call_graph;
REFRESH MATERIALIZED VIEW CONCURRENTLY orphaned_code;

-- Update complexity scores
UPDATE code_entities SET 
  complexity_score = calculate_entity_complexity(entity_id);

-- Clean old learning patterns
DELETE FROM agent_learning_patterns 
WHERE success_count = 0 
AND failure_count > 3;
```

### 5. Monitoring

**Track Metrics**:
- Agent success rate
- Issue detection accuracy
- PR merge rate
- Code quality improvements

**Alerts**:
- High error rates
- Low confidence scores
- Failed agent runs
- Git conflicts

---

## 🚀 Next Steps

1. **Create API Routes**: REST endpoints for all services
2. **Build Dashboard**: Visualize code graph and agent activity
3. **Add Tests**: Unit and integration tests
4. **Implement Embeddings**: Vector search for semantic understanding
5. **Enhance Learning**: Improve pattern recognition
6. **Add More Agents**: Specialized agents for different tasks

---

## 📝 Notes

- This system requires PostgreSQL with pgvector extension
- DeepSeek API key required for AI features
- GitHub token needed for PR automation
- Tree-sitter parsers required for AST analysis

For questions or issues, see documentation in each service file.
