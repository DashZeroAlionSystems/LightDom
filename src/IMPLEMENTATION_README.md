# Schema-Driven Development Implementation

This directory contains the implementation of the schema-driven development system based on the research from SCHEMA_AI_RESEARCH_2025.md and SCHEMA_PRACTICAL_IMPLEMENTATION_2025.md.

## Structure

```
src/
├── schemas/          # Zod schema definitions
│   ├── user.schema.ts
│   ├── workflow.schema.ts
│   └── component.schema.ts
├── generators/       # Code generators
│   ├── schema-to-zod.ts
│   └── component-generator.ts
├── utils/           # Utilities
│   ├── db-introspection.ts
│   └── workflow-engine.ts
└── cli/            # CLI tools
    └── schema-generator.ts
```

## Usage

### 1. Generate Schemas from Database

```bash
npm run schema:generate -- -d "postgresql://localhost:5432/lightdom" -t "users,posts,comments"
```

This will generate:
- Zod schemas in `src/generated/schemas/`
- React form components in `src/generated/components/`
- API clients in `src/generated/api/`
- React Query hooks in `src/generated/hooks/`

### 2. Use Schemas in Your Code

```typescript
import { UserSchema, CreateUserSchema } from './schemas/user.schema';
import { useUsers, useCreateUser } from './hooks/useUsers';

// In your component
function UserManagement() {
  const { data: users } = useUsers();
  const createUser = useCreateUser();
  
  const handleSubmit = async (data) => {
    await createUser.mutateAsync(data);
  };
  
  return <UserForm onSubmit={handleSubmit} />;
}
```

### 3. Workflow Automation

```typescript
import { WorkflowEngine, createContentApprovalWorkflow } from './utils/workflow-engine';

const engine = new WorkflowEngine();
await engine.loadWorkflow(createContentApprovalWorkflow());

// Execute workflow steps
const result = await engine.executeStep('draft', {
  content: 'My article content',
  title: 'My Article'
});
```

## Database Schema

Run the migration to set up the workflow system:

```bash
psql -d lightdom -f database/migrations/204-schema-driven-workflow-system.sql
```

This creates:
- `workflows` table
- `workflow_steps` table
- `workflow_transitions` table
- `workflow_executions` table
- `generated_components` table
- `schema_registry` table

## Features

### ✅ Database Introspection
- PostgreSQL schema analysis
- Automatic type mapping (PostgreSQL → Zod)
- Relationship discovery

### ✅ Code Generation
- Zod schemas from database tables
- React form components
- API clients with validation
- React Query hooks
- Type-safe throughout

### ✅ Workflow Automation
- Manual, automated, and AI-assisted steps
- Conditional transitions
- Execution history tracking
- Context preservation

### ✅ Component Generation
- Schema-driven UI components
- Multiple UI libraries (Ant Design, Material-UI)
- Accessibility built-in
- Validation integration

## Examples

See the research documents for comprehensive examples:
- SCHEMA_PRACTICAL_IMPLEMENTATION_2025.md
- SCHEMA_AI_RESEARCH_2025.md
- SCHEMA_GITHUB_PROJECTS_2025.md

## Next Steps

1. Install dependencies:
```bash
npm install zod @tanstack/react-query axios commander pg
npm install --save-dev @types/pg
```

2. Configure database connection in `.env`:
```
DATABASE_URL=postgresql://user:pass@localhost:5432/lightdom
```

3. Run schema generation
4. Import generated components
5. Start building!
