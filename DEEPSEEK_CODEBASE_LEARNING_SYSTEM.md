# DeepSeek Codebase Learning System

## Overview

This system enables DeepSeek to learn and understand the LightDom codebase through automated workflows, API interactions, and continuous learning from project activity.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  DeepSeek Learning System               │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐  │
│  │   Codebase   │  │   Workflow   │  │   Activity  │  │
│  │   Indexer    │  │   Executor   │  │   Monitor   │  │
│  └──────────────┘  └──────────────┘  └─────────────┘  │
│         │                  │                  │         │
│         └──────────────────┴──────────────────┘         │
│                        │                                │
│              ┌─────────────────────┐                    │
│              │  Knowledge Graph    │                    │
│              │  (PostgreSQL)       │                    │
│              └─────────────────────┘                    │
│                        │                                │
│              ┌─────────────────────┐                    │
│              │  DeepSeek API       │                    │
│              │  (Ollama/Cloud)     │                    │
│              └─────────────────────┘                    │
└─────────────────────────────────────────────────────────┘
```

## Components

### 1. Codebase Indexer

Automatically indexes and analyzes the codebase to build a knowledge graph.

**Features**:
- **File Analysis**: Parses all source files (JS, TS, JSX, TSX)
- **Dependency Mapping**: Builds import/export dependency graphs
- **Function Extraction**: Catalogs all functions with signatures
- **Documentation Parsing**: Extracts JSDoc, comments, and README files
- **API Endpoint Discovery**: Maps all REST/GraphQL endpoints
- **Database Schema**: Understands database structure
- **Configuration Analysis**: Parses all config files

**Workflow**:
```javascript
{
  "workflow_id": "codebase-indexing",
  "schedule": "0 */6 * * *",  // Every 6 hours
  "tasks": [
    {
      "name": "scan-files",
      "type": "filesystem",
      "action": "recursive-scan",
      "patterns": ["**/*.{js,ts,jsx,tsx,json,yaml,md}"],
      "exclude": ["node_modules", "dist", ".git"]
    },
    {
      "name": "parse-javascript",
      "type": "ast-parser",
      "parser": "@babel/parser",
      "extract": ["functions", "classes", "exports", "imports"]
    },
    {
      "name": "analyze-dependencies",
      "type": "dependency-analyzer",
      "buildGraph": true,
      "detectCircular": true
    },
    {
      "name": "extract-documentation",
      "type": "doc-parser",
      "formats": ["jsdoc", "markdown", "inline-comments"]
    },
    {
      "name": "store-knowledge",
      "type": "database",
      "table": "codebase_knowledge",
      "operation": "upsert"
    }
  ]
}
```

### 2. Workflow Executor

Executes workflows that involve DeepSeek for code understanding and generation.

**Pre-built Workflows**:

#### A. Code Review Workflow
```yaml
name: "DeepSeek Code Review"
trigger: "pull_request"
steps:
  - name: "Fetch PR Changes"
    action: "git_diff"
    
  - name: "Analyze Changes"
    action: "deepseek_analyze"
    prompt: |
      Review this code change for:
      1. Potential bugs
      2. Performance issues
      3. Security vulnerabilities
      4. Best practice violations
      5. Inconsistencies with existing codebase
      
      Context: {codebase_knowledge}
      Changes: {git_diff}
    
  - name: "Generate Review"
    action: "github_comment"
    template: "code-review-comment"
```

#### B. Documentation Generation Workflow
```yaml
name: "Auto-Generate Documentation"
trigger: "code_commit"
steps:
  - name: "Detect Undocumented Code"
    action: "find_missing_docs"
    
  - name: "Generate Documentation"
    action: "deepseek_generate"
    prompt: |
      Generate comprehensive documentation for:
      {undocumented_code}
      
      Follow the existing documentation style in:
      {existing_docs_examples}
      
      Include:
      - Description
      - Parameters
      - Return values
      - Examples
      - Related functions
    
  - name: "Create PR"
    action: "github_create_pr"
    title: "docs: Add missing documentation"
```

#### C. Bug Fix Suggestion Workflow
```yaml
name: "Bug Fix Suggestions"
trigger: "issue_labeled:bug"
steps:
  - name: "Fetch Issue Details"
    action: "github_get_issue"
    
  - name: "Search Codebase"
    action: "codebase_search"
    query: "{issue.title} {issue.description}"
    
  - name: "Analyze Bug"
    action: "deepseek_analyze"
    prompt: |
      Given this bug report:
      {issue}
      
      And these related code sections:
      {search_results}
      
      Suggest potential fixes with:
      1. Root cause analysis
      2. Code changes needed
      3. Test cases to add
      4. Similar bugs to check
    
  - name: "Post Suggestions"
    action: "github_comment"
```

### 3. Activity Monitor

Monitors project activity and feeds learning data to DeepSeek.

**Monitored Activities**:
- Git commits and their patterns
- Pull request discussions
- Issue comments and resolutions
- API endpoint usage
- Error logs and stack traces
- Performance metrics
- User feedback

**Learning Pipeline**:
```javascript
{
  "pipeline": "continuous-learning",
  "sources": [
    {
      "type": "git-commits",
      "analyze": "commit-patterns",
      "learn": ["common-changes", "file-relationships", "author-patterns"]
    },
    {
      "type": "pull-requests",
      "analyze": "pr-discussions",
      "learn": ["code-review-patterns", "common-issues", "best-practices"]
    },
    {
      "type": "issues",
      "analyze": "issue-resolution",
      "learn": ["bug-patterns", "feature-requests", "pain-points"]
    },
    {
      "type": "api-logs",
      "analyze": "endpoint-usage",
      "learn": ["api-patterns", "error-frequencies", "performance-bottlenecks"]
    }
  ],
  "processing": {
    "aggregate": "daily",
    "summarize": "weekly",
    "train": "monthly"
  }
}
```

### 4. Knowledge Graph

PostgreSQL-based knowledge graph storing all learned information.

**Schema**:
```sql
-- Files and their metadata
CREATE TABLE codebase_files (
  id SERIAL PRIMARY KEY,
  path TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL,
  size INTEGER,
  lines_of_code INTEGER,
  last_modified TIMESTAMP,
  content_hash TEXT,
  metadata JSONB
);

-- Functions and their details
CREATE TABLE codebase_functions (
  id SERIAL PRIMARY KEY,
  file_id INTEGER REFERENCES codebase_files(id),
  name TEXT NOT NULL,
  signature TEXT,
  line_start INTEGER,
  line_end INTEGER,
  complexity INTEGER,
  documentation TEXT,
  parameters JSONB,
  returns JSONB,
  metadata JSONB
);

-- Dependencies between files
CREATE TABLE codebase_dependencies (
  id SERIAL PRIMARY KEY,
  from_file_id INTEGER REFERENCES codebase_files(id),
  to_file_id INTEGER REFERENCES codebase_files(id),
  import_type TEXT,
  imported_items JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- API endpoints
CREATE TABLE codebase_endpoints (
  id SERIAL PRIMARY KEY,
  path TEXT NOT NULL,
  method TEXT NOT NULL,
  file_id INTEGER REFERENCES codebase_files(id),
  function_id INTEGER REFERENCES codebase_functions(id),
  parameters JSONB,
  response_schema JSONB,
  authentication_required BOOLEAN,
  documentation TEXT,
  usage_count INTEGER DEFAULT 0,
  last_used TIMESTAMP
);

-- DeepSeek learning sessions
CREATE TABLE deepseek_learning_sessions (
  id SERIAL PRIMARY KEY,
  session_type TEXT NOT NULL,
  started_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  items_processed INTEGER,
  insights_generated JSONB,
  model_version TEXT,
  metadata JSONB
);

-- Learned patterns
CREATE TABLE deepseek_learned_patterns (
  id SERIAL PRIMARY KEY,
  pattern_type TEXT NOT NULL,
  pattern_name TEXT NOT NULL,
  description TEXT,
  confidence FLOAT,
  examples JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  last_seen TIMESTAMP,
  occurrence_count INTEGER DEFAULT 1
);

-- Code insights
CREATE TABLE deepseek_insights (
  id SERIAL PRIMARY KEY,
  insight_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  severity TEXT,
  file_paths TEXT[],
  code_snippets JSONB,
  recommendations JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  resolved BOOLEAN DEFAULT FALSE
);
```

### 5. DeepSeek API Integration

#### Configuration

```yaml
# config/deepseek/learning-config.yaml
deepseek:
  # Connection
  mode: "ollama"              # "ollama" or "cloud"
  baseUrl: "http://localhost:11434"
  model: "deepseek-coder"     # or "deepseek-chat"
  
  # Learning Configuration
  learning:
    enabled: true
    continuousLearning: true
    learningInterval: "24h"
    batchSize: 100
    
  # Context Management
  context:
    maxTokens: 8000
    includeCodebase: true
    includeHistory: true
    contextWindow: 20           # Last 20 interactions
    
  # Prompts
  systemPrompt: |
    You are an AI assistant deeply integrated with the LightDom codebase.
    You have access to:
    - Complete codebase structure and dependencies
    - Historical commit patterns
    - Issue and PR discussions
    - API endpoint definitions
    - Database schema
    - Configuration files
    
    Your role is to:
    1. Understand code changes in context
    2. Suggest improvements based on existing patterns
    3. Identify potential issues before they occur
    4. Generate code consistent with the existing style
    5. Provide accurate, context-aware responses
    
  # API Settings
  api:
    temperature: 0.3          # Lower for code generation
    topP: 0.9
    topK: 40
    repeatPenalty: 1.1
    timeout: 60000            # 60 seconds
    
  # Caching
  cache:
    enabled: true
    ttl: 3600                 # 1 hour
    maxSize: 1000             # 1000 responses
```

#### API Endpoints

```javascript
// API routes for DeepSeek learning
const routes = [
  {
    path: '/api/deepseek/learn/codebase',
    method: 'POST',
    description: 'Trigger codebase indexing and learning',
    handler: async (req, res) => {
      const session = await deepseekService.startLearningSession('codebase');
      const results = await codebaseIndexer.indexAll();
      await deepseekService.ingestKnowledge(results);
      await session.complete();
      res.json({ success: true, session });
    }
  },
  
  {
    path: '/api/deepseek/learn/activity',
    method: 'POST',
    description: 'Learn from recent project activity',
    body: {
      timeframe: '7d',        // Last 7 days
      activityTypes: ['commits', 'prs', 'issues']
    },
    handler: async (req, res) => {
      const activities = await activityMonitor.fetchActivities(req.body);
      const insights = await deepseekService.analyzeActivities(activities);
      await deepseekService.storeInsights(insights);
      res.json({ success: true, insights });
    }
  },
  
  {
    path: '/api/deepseek/query',
    method: 'POST',
    description: 'Query DeepSeek with codebase context',
    body: {
      question: 'string',
      includeContext: true,
      contextScope: ['files', 'functions', 'endpoints']
    },
    handler: async (req, res) => {
      const context = await knowledgeGraph.getContext(req.body.contextScope);
      const response = await deepseekService.query({
        question: req.body.question,
        context: context
      });
      res.json({ response });
    }
  },
  
  {
    path: '/api/deepseek/suggest/improvement',
    method: 'POST',
    description: 'Get improvement suggestions for code',
    body: {
      filePath: 'string',
      code: 'string'
    },
    handler: async (req, res) => {
      const fileContext = await knowledgeGraph.getFileContext(req.body.filePath);
      const suggestions = await deepseekService.suggestImprovements({
        code: req.body.code,
        context: fileContext,
        existingPatterns: await knowledgeGraph.getPatterns()
      });
      res.json({ suggestions });
    }
  },
  
  {
    path: '/api/deepseek/generate/tests',
    method: 'POST',
    description: 'Generate tests for code',
    body: {
      filePath: 'string',
      functionName: 'string'
    },
    handler: async (req, res) => {
      const func = await knowledgeGraph.getFunction(
        req.body.filePath,
        req.body.functionName
      );
      const existingTests = await knowledgeGraph.getRelatedTests(func);
      const tests = await deepseekService.generateTests({
        function: func,
        existingTestPatterns: existingTests
      });
      res.json({ tests });
    }
  },
  
  {
    path: '/api/deepseek/knowledge/stats',
    method: 'GET',
    description: 'Get statistics about learned knowledge',
    handler: async (req, res) => {
      const stats = await knowledgeGraph.getStats();
      res.json({
        filesIndexed: stats.fileCount,
        functionsAnalyzed: stats.functionCount,
        endpointsDiscovered: stats.endpointCount,
        patternsLearned: stats.patternCount,
        insightsGenerated: stats.insightCount,
        lastLearningSession: stats.lastSession,
        nextScheduledLearning: stats.nextSession
      });
    }
  },
  
  {
    path: '/api/deepseek/insights',
    method: 'GET',
    description: 'Get generated insights',
    query: {
      type: 'string',         // bug, performance, security, style
      resolved: 'boolean',
      limit: 'number'
    },
    handler: async (req, res) => {
      const insights = await deepseekService.getInsights(req.query);
      res.json({ insights });
    }
  }
];
```

## GitHub Workflows Integration

### Workflow 1: Codebase Learning (Scheduled)

```yaml
# .github/workflows/deepseek-learning.yml
name: DeepSeek Codebase Learning
on:
  schedule:
    - cron: '0 */6 * * *'     # Every 6 hours
  workflow_dispatch:          # Manual trigger

jobs:
  learn-codebase:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0      # Full history
          
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          
      - name: Install Dependencies
        run: npm ci
        
      - name: Start DeepSeek Service
        run: |
          docker run -d -p 11434:11434 --name ollama ollama/ollama
          docker exec ollama ollama pull deepseek-coder
          
      - name: Index Codebase
        run: npm run deepseek:index
        
      - name: Learn from Activity
        run: npm run deepseek:learn:activity
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          
      - name: Generate Insights
        run: npm run deepseek:generate:insights
        
      - name: Upload Insights
        uses: actions/upload-artifact@v3
        with:
          name: deepseek-insights
          path: ./insights/*.json
```

### Workflow 2: AI Code Review (on PR)

```yaml
# .github/workflows/ai-code-review.yml
name: AI Code Review with DeepSeek
on:
  pull_request:
    types: [opened, synchronize]

jobs:
  ai-review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0
          
      - name: Setup DeepSeek
        run: |
          docker run -d -p 11434:11434 ollama/ollama
          docker exec ollama ollama pull deepseek-coder
          
      - name: Load Codebase Context
        run: npm run deepseek:load:context
        
      - name: Analyze PR Changes
        id: analyze
        run: |
          npm run deepseek:analyze:pr -- \
            --pr-number=${{ github.event.pull_request.number }} \
            --output=review.json
          
      - name: Post Review Comment
        uses: actions/github-script@v6
        with:
          script: |
            const fs = require('fs');
            const review = JSON.parse(fs.readFileSync('review.json', 'utf8'));
            
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.name,
              body: review.comment
            });
```

### Workflow 3: Auto-Documentation (on push)

```yaml
# .github/workflows/auto-docs.yml
name: Auto-Generate Documentation
on:
  push:
    branches: [main, develop]
    paths:
      - 'src/**/*.js'
      - 'src/**/*.ts'

jobs:
  generate-docs:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        
      - name: Setup DeepSeek
        run: |
          docker run -d -p 11434:11434 ollama/ollama
          docker exec ollama ollama pull deepseek-coder
          
      - name: Find Undocumented Code
        id: find
        run: npm run deepseek:find:undocumented
        
      - name: Generate Documentation
        if: steps.find.outputs.count > 0
        run: npm run deepseek:generate:docs
        
      - name: Create PR
        if: steps.find.outputs.count > 0
        uses: peter-evans/create-pull-request@v5
        with:
          commit-message: 'docs: Add AI-generated documentation'
          title: 'AI Documentation Update'
          body: 'Auto-generated documentation by DeepSeek'
          branch: ai-docs-update
```

## Setup Instructions

### 1. Install Ollama (Local DeepSeek)

```bash
# Linux/Mac
curl https://ollama.ai/install.sh | sh

# Windows
# Download from https://ollama.ai/download

# Pull DeepSeek model
ollama pull deepseek-coder
ollama pull deepseek-chat
```

### 2. Initialize Database

```bash
# Create database
createdb lightdom_deepseek

# Run migrations
npm run db:migrate:deepseek
```

### 3. Configure DeepSeek

```bash
# Copy example config
cp config/deepseek/learning-config.example.yaml config/deepseek/learning-config.yaml

# Edit configuration
nano config/deepseek/learning-config.yaml
```

### 4. Start Learning Service

```bash
# Start the DeepSeek learning service
npm run start:deepseek:learning

# Or as part of main server
npm run start:dev  # Includes DeepSeek routes
```

### 5. Initial Codebase Index

```bash
# Index entire codebase (may take 10-30 minutes)
npm run deepseek:index:full

# Or incremental index (faster)
npm run deepseek:index:incremental
```

### 6. Enable GitHub Integration

```bash
# Set up GitHub App or Personal Access Token
export GITHUB_TOKEN=your_token

# Configure webhooks
npm run deepseek:setup:webhooks
```

## Usage Examples

### Query DeepSeek about Code

```bash
curl -X POST http://localhost:3001/api/deepseek/query \
  -H "Content-Type: application/json" \
  -d '{
    "question": "How does the neural crawler prioritize URLs?",
    "includeContext": true
  }'
```

### Get Improvement Suggestions

```bash
curl -X POST http://localhost:3001/api/deepseek/suggest/improvement \
  -H "Content-Type: application/json" \
  -d '{
    "filePath": "src/services/crawler.js",
    "code": "function crawl(url) { ... }"
  }'
```

### Generate Tests

```bash
curl -X POST http://localhost:3001/api/deepseek/generate/tests \
  -H "Content-Type: application/json" \
  -d '{
    "filePath": "src/utils/validator.js",
    "functionName": "validateEmail"
  }'
```

## Monitoring and Maintenance

### View Learning Stats

```bash
npm run deepseek:stats

# Output:
# DeepSeek Learning Statistics
# ============================
# Files Indexed: 1,247
# Functions Analyzed: 8,932
# API Endpoints: 156
# Patterns Learned: 342
# Insights Generated: 89
# Last Learning: 2 hours ago
# Next Scheduled: 4 hours from now
```

### Review Insights

```bash
npm run deepseek:insights

# Or via API
curl http://localhost:3001/api/deepseek/insights?type=bug&resolved=false
```

### Retrain Model

```bash
# Retrain with latest data
npm run deepseek:retrain

# Full reindex and retrain
npm run deepseek:retrain:full
```

## Best Practices

1. **Regular Indexing**: Run full index weekly, incremental daily
2. **Review Insights**: Check generated insights regularly
3. **Validate Suggestions**: Always review AI-generated code
4. **Continuous Learning**: Enable activity monitoring for best results
5. **Context Management**: Keep context window optimal (not too large)
6. **Model Updates**: Update DeepSeek model monthly
7. **Backup Knowledge**: Regular backups of knowledge graph

## Troubleshooting

### DeepSeek Not Responding
```bash
# Check Ollama status
ollama list
systemctl status ollama  # Linux

# Restart Ollama
systemctl restart ollama
```

### Indexing Too Slow
```bash
# Use incremental indexing
npm run deepseek:index:incremental

# Or limit scope
npm run deepseek:index -- --scope=src/**/*.js
```

### Low Quality Suggestions
```bash
# Retrain with more data
npm run deepseek:retrain

# Increase context window
# Edit config/deepseek/learning-config.yaml
```

## Conclusion

The DeepSeek Codebase Learning System enables continuous AI-powered understanding of your project, providing:

- ✅ Automated code reviews
- ✅ Context-aware suggestions
- ✅ Automatic documentation
- ✅ Bug prevention
- ✅ Pattern learning
- ✅ Continuous improvement

**Next Steps**: Run `npm run deepseek:setup` to begin setup wizard.
