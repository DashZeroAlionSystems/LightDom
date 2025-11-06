# n8n Database Design Patterns Research

## Overview

This document analyzes n8n's database design patterns to inform our workflow UI/UX generation system. n8n uses a sophisticated database structure to manage workflows, executions, credentials, and settings.

## Core Tables & Patterns

### 1. Workflow Execution Model

**execution_entity Table:**
```sql
CREATE TABLE execution_entity (
  id INTEGER PRIMARY KEY,
  workflowId VARCHAR,
  finished BOOLEAN,
  mode VARCHAR, -- 'manual', 'trigger', 'webhook'
  retryOf VARCHAR,
  retrySuccessId VARCHAR,
  startedAt DATETIME,
  stoppedAt DATETIME,
  workflowData TEXT, -- JSON
  data TEXT, -- JSON execution data
  waitTill DATETIME
);
```

**Key Insights:**
- Immutable execution records
- Stores complete workflow snapshot at execution time
- Separate `workflowData` (structure) and `data` (results)
- Retry chain tracking (retryOf, retrySuccessId)
- Mode-based execution paths

**Implementation for LightDom:**
- Use same pattern for workflow execution logs
- Store component generation attempts
- Track rebuild chains
- Enable time-travel debugging

### 2. Workflow Versioning

**workflow_entity Table:**
```sql
CREATE TABLE workflow_entity (
  id INTEGER PRIMARY KEY,
  name VARCHAR,
  active BOOLEAN DEFAULT false,
  nodes TEXT, -- JSON array
  connections TEXT, -- JSON object
  settings TEXT, -- JSON object
  staticData TEXT, -- JSON object
  tags TEXT, -- JSON array of tag IDs
  createdAt DATETIME,
  updatedAt DATETIME
);
```

**Versioning Strategy:**
- Every save creates execution snapshot
- Workflows reference specific version
- Enables rollback and audit trail
- Tags for organization

**Implementation:**
- Version our generated components
- Track which schema version generated what
- Enable "undo" for AI generations
- Tag components by feature/module

### 3. Credentials & Settings Management

**credentials_entity Table:**
```sql
CREATE TABLE credentials_entity (
  id INTEGER PRIMARY KEY,
  name VARCHAR,
  type VARCHAR,
  nodesAccess TEXT, -- JSON array
  data TEXT, -- Encrypted JSON
  createdAt DATETIME,
  updatedAt DATETIME
);
```

**Security Pattern:**
- Encrypted sensitive data
- Node-level access control
- Type-based credential templates

**Implementation:**
- Encrypt API keys for Ollama/DeepSeek
- Schema-level access control
- Template-based credentials

### 4. Tag & Category System

**tag_entity Table:**
```sql
CREATE TABLE tag_entity (
  id INTEGER PRIMARY KEY,
  name VARCHAR UNIQUE,
  createdAt DATETIME,
  updatedAt DATETIME
);

CREATE TABLE workflows_tags (
  workflowId INTEGER,
  tagId INTEGER,
  PRIMARY KEY (workflowId, tagId)
);
```

**Pattern:**
- Many-to-many relationship
- Simple tag structure
- No hierarchical categories (flat)

**Implementation:**
- Tag components: "form", "dashboard", "admin"
- Tag workflows: "user-management", "analytics"
- Search/filter by tags
- Auto-tag based on schema analysis

### 5. Settings Hierarchy

**settings Table:**
```sql
CREATE TABLE settings (
  key VARCHAR PRIMARY KEY,
  value TEXT, -- JSON
  loadOnStartup BOOLEAN
);
```

**Hierarchy:**
1. Global settings (settings table)
2. Workflow settings (workflow_entity.settings)
3. Node settings (within nodes JSON)

**Implementation:**
- Global: Design system tokens
- Workflow: Dashboard-level config
- Component: Component-specific props

## UI/UX Generation Patterns

### 1. Form Generation from Workflow Nodes

**n8n Node Parameter UI:**
```typescript
{
  displayName: 'Resource',
  name: 'resource',
  type: 'options',
  options: [
    {name: 'User', value: 'user'},
    {name: 'Company', value: 'company'}
  ],
  default: 'user'
}
```

**Our Implementation:**
```typescript
// Generate from database schema
{
  fieldName: 'role_id',
  columnType: 'INTEGER',
  foreignKey: {table: 'roles', column: 'id'},
  component: 'Select',
  props: {
    options: 'SELECT id, name FROM roles'
  }
}
```

### 2. Conditional Display Logic

**n8n displayOptions:**
```typescript
{
  displayOptions: {
    show: {
      resource: ['user'],
      operation: ['get']
    }
  }
}
```

**Our Implementation:**
```typescript
// Show field based on other field values
{
  displayWhen: {
    table: 'users',
    operation: 'create'
  }
}
```

### 3. Dynamic Value Expressions

**n8n Expressions:**
```
{{ $json.data.userId }}
{{ $node["HTTP Request"].json.result }}
```

**Our Implementation:**
```typescript
// Reference other form fields
{
  defaultValue: '{{ form.first_name }} {{ form.last_name }}',
  validation: '{{ form.email.includes("@") }}'
}
```

## Database Best Practices from n8n

### 1. JSON Storage for Flexibility
- Use JSONB for dynamic data
- Schema evolution without migrations
- Query flexibility with JSONB operators

### 2. Immutable Execution Records
- Never update execution records
- Create new records for retries
- Enables complete audit trail

### 3. Soft Deletes
- Add `deletedAt` timestamp
- Filter by `WHERE deletedAt IS NULL`
- Preserve data for debugging

### 4. Optimized Indexes
```sql
CREATE INDEX idx_execution_workflowId ON execution_entity(workflowId);
CREATE INDEX idx_execution_finished ON execution_entity(finished);
CREATE INDEX idx_execution_mode ON execution_entity(mode);
CREATE INDEX idx_execution_startedAt ON execution_entity(startedAt);
```

### 5. Pagination & Performance
- Use LIMIT/OFFSET with total count
- Index frequently filtered columns
- Separate read/write queries

## Workflow UI Patterns

### 1. Visual Flow Builder
- Node-based drag & drop
- Connection validation
- Auto-layout algorithms

**Implementation:**
- Component-based drag & drop
- Schema-aware connections
- AI-suggested layouts

### 2. Execution Visualization
- Step-by-step execution view
- Data inspection at each node
- Error highlighting

**Implementation:**
- Component generation steps
- Schema context at each step
- Error traces with AI suggestions

### 3. Testing & Debugging
- Manual execution mode
- Pin data for testing
- Execution history

**Implementation:**
- Test generated components
- Pin schema examples
- Generation history

## Implementation Checklist

✅ **Execution Model**
- [ ] Create `workflow_execution_logs` table
- [ ] Store component generation attempts
- [ ] Track retry chains
- [ ] Implement time-travel debugging

✅ **Versioning**
- [ ] Version generated components
- [ ] Link to schema versions
- [ ] Enable rollback
- [ ] Audit trail

✅ **Settings**
- [ ] Global design tokens
- [ ] Workflow-level config
- [ ] Component-level props
- [ ] Hierarchical override

✅ **Tags & Organization**
- [ ] Tag system for components
- [ ] Auto-tagging from schemas
- [ ] Search/filter by tags
- [ ] Tag-based recommendations

✅ **Security**
- [ ] Encrypt API keys
- [ ] Schema-level permissions
- [ ] Audit logging
- [ ] Secure credential storage

## Example Implementations

### Workflow Execution Tracking

```typescript
interface WorkflowExecution {
  id: string;
  workflowId: string;
  mode: 'manual' | 'auto' | 'scheduled';
  startedAt: Date;
  stoppedAt: Date;
  status: 'running' | 'completed' | 'failed';
  steps: {
    stepId: string;
    componentId: string;
    startedAt: Date;
    completedAt: Date;
    status: 'pending' | 'running' | 'completed' | 'failed';
    input: any;
    output: any;
    error?: string;
  }[];
  metrics: {
    totalTime: number;
    successRate: number;
    retryCount: number;
  };
}
```

### Component Generation Record

```typescript
interface ComponentGeneration {
  id: string;
  templateId: string;
  schemaRefs: string[];
  prompt: string;
  generatedCode: string;
  componentType: string;
  status: 'draft' | 'validated' | 'deployed';
  userRating: number;
  feedbackNotes: string;
  createdAt: Date;
  deployedAt?: Date;
}
```

## Conclusion

n8n's database design provides excellent patterns for:
1. **Execution tracking** with immutable records
2. **Versioning** with complete snapshots
3. **Settings hierarchy** from global to component level
4. **Flexible schema** using JSONB
5. **Organization** with tags and categories

By following these patterns, we create a robust system for AI-powered component generation with full audit trails, rollback capability, and production-ready execution tracking.

## References

- n8n GitHub: https://github.com/n8n-io/n8n
- Database Migrations: `/packages/cli/src/databases/migrations/`
- Execution Service: `/packages/cli/src/WaitTracker.ts`
- Workflow Service: `/packages/cli/src/workflows/workflows.service.ts`
