# Workflow Wizard - Setup & Testing Guide

## 🎯 Overview

This guide walks you through setting up and testing the AI-powered Component Workflow Wizard with DeepSeek/Ollama integration.

## 📋 Prerequisites

1. **Ollama installed** - Download from https://ollama.ai
2. **DeepSeek model installed** via Ollama
3. **PostgreSQL database** running
4. **Node.js** and dependencies installed

## 🚀 Setup Steps

### Step 1: Install and Start Ollama

```bash
# Install Ollama (if not already installed)
# Visit: https://ollama.ai

# Pull the DeepSeek R1 1.5B model
ollama pull deepseek-r1:1.5b

# Verify Ollama is running
curl http://localhost:11434/api/tags
```

### Step 2: Configure Environment

Create or update `.env` file:

```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=dom_space_harvester
DB_USER=postgres
DB_PASSWORD=your_password

# Ollama
OLLAMA_API_URL=http://localhost:11434

# API Server
PORT=3001
```

### Step 3: Run Database Migrations

```bash
# Run migrations to create required tables
npm run migrate

# Initialize services (loads component schemas)
npm run init:services
```

### Step 4: Start the API Server

The API server needs to include the workflow routes. Add to your Express server:

```typescript
// In api-server-express.js or similar
import workflowRoutes from './src/routes/workflow.routes.js';

// Add routes
app.use('/api/workflow', workflowRoutes);
app.use('/api/workflows', workflowRoutes);
```

Then start the server:

```bash
npm run dev
# or
node api-server-express.js
```

### Step 5: Open the Workflow Wizard

```bash
# Open the wizard in your browser
open workflow-wizard.html
# or navigate to: http://localhost:3001/workflow-wizard.html
```

## 🧪 Testing the Workflow

### Test 1: Simple Component Generation

1. Open `workflow-wizard.html` in your browser
2. In Step 1, enter this prompt:
   ```
   Create a user login form with email and password fields, a remember me checkbox, and a submit button. Style it with Material Design 3.
   ```
3. Click "Analyze with DeepSeek"
4. Review the generated configuration in Step 2
5. Click "Continue" → "Generate Component"
6. Review the generated React component code

**Expected Result:**
- Workflow appears in the sidebar with "completed" status
- Component code is displayed with TypeScript
- Component includes all requested features

### Test 2: Complex Dashboard Component

1. Click "Create Another Component"
2. Enter this prompt:
   ```
   Build an admin dashboard user table with sortable columns, filtering, pagination, and action buttons (edit, delete) for each row. Include a search bar at the top.
   ```
3. Complete the workflow
4. Verify the generated component includes:
   - DataGrid/table structure
   - Search functionality
   - Action buttons
   - Pagination controls

### Test 3: Custom Molecule Component

1. Create a new workflow
2. Enter this prompt:
   ```
   Create a user profile card showing avatar, name, email, role badge, and edit/message buttons
   ```
3. In Step 2, verify componentType is set to "molecule" or "organism"
4. Complete generation

## 🔍 Verification Checklist

### Database Verification

```sql
-- Check workflows are being saved
SELECT 
  content->>'id' as workflow_id,
  content->>'name' as component_name,
  content->>'status' as status,
  created_at
FROM content_entities 
WHERE type = 'ld:ComponentWorkflow'
ORDER BY created_at DESC;

-- Check AI interactions are logged
SELECT 
  model,
  service,
  success,
  duration_ms,
  created_at
FROM ai_interactions
ORDER BY created_at DESC
LIMIT 10;

-- Check component schemas are loaded
SELECT 
  schema_id,
  title,
  category,
  is_atomic
FROM schema_library
ORDER BY title;
```

### API Verification

```bash
# Test prompt analysis endpoint
curl -X POST http://localhost:3001/api/workflow/analyze-prompt \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Create a login form with email and password",
    "model": "deepseek-r1:1.5b"
  }'

# Get all workflows
curl http://localhost:3001/api/workflows

# Get specific workflow
curl http://localhost:3001/api/workflows/<workflow-id>
```

### Ollama Verification

```bash
# Test DeepSeek directly
curl http://localhost:11434/api/chat -d '{
  "model": "deepseek-r1:1.5b",
  "messages": [
    {
      "role": "system",
      "content": "You are a helpful assistant. Respond with valid JSON only."
    },
    {
      "role": "user",
      "content": "Return a JSON object with: {\"componentName\": \"TestButton\", \"type\": \"atom\"}"
    }
  ],
  "stream": false
}'
```

## 🎨 UI Features

### Workflow Wizard Interface

- **Step 1**: Describe - Natural language prompt input
- **Step 2**: Configure - Review and adjust AI-generated config
- **Step 3**: Generate - Trigger component generation
- **Step 4**: Review - View generated code and save

### Workflows Sidebar

- Shows all generated workflows
- Real-time status updates (pending, processing, completed, failed)
- Click to view workflow details
- Timestamps for each workflow

### Status Indicators

- 🟡 **Pending**: Workflow created, waiting to process
- 🔵 **Processing**: AI is generating the component
- 🟢 **Completed**: Component successfully generated
- 🔴 **Failed**: Error occurred during generation

## 🐛 Troubleshooting

### Issue: Ollama Connection Failed

**Solution:**
```bash
# Check Ollama is running
curl http://localhost:11434/api/tags

# Restart Ollama
ollama serve

# Check firewall/ports
lsof -i :11434
```

### Issue: DeepSeek Model Not Found

**Solution:**
```bash
# List available models
ollama list

# Pull DeepSeek if missing
ollama pull deepseek-r1:1.5b

# Or use alternative model
# Update model in wizard UI or WorkflowWizardService
```

### Issue: Database Connection Error

**Solution:**
```bash
# Check PostgreSQL is running
pg_isready

# Verify connection string
psql -h localhost -U postgres -d dom_space_harvester

# Re-run migrations
npm run migrate
```

### Issue: Invalid JSON from DeepSeek

**Problem:** DeepSeek sometimes returns non-JSON responses

**Solution:** The WorkflowWizardService includes fallback logic:
- Tries to extract JSON from response
- Falls back to basic analysis if parsing fails
- Uses heuristics to guess component type and base components

## 📊 Performance Tips

### Optimize DeepSeek Responses

1. **Clear system prompts**: Be explicit about JSON-only responses
2. **Temperature setting**: Lower temperature (0.3-0.5) for more consistent JSON
3. **Model selection**: Use `deepseek-r1:1.5b` for faster responses

### Batch Generation

For multiple components, use ComponentAssemblyWorkflowService:

```typescript
import { componentAssemblyWorkflowService } from './src/services/ComponentAssemblyWorkflowService.js';

const result = await componentAssemblyWorkflowService.executeAssembly({
  projectName: 'UserManagement',
  components: [
    { name: 'UserList', type: 'organism', useCase: '...' },
    { name: 'UserForm', type: 'organism', useCase: '...' },
    { name: 'UserCard', type: 'molecule', useCase: '...' }
  ],
  outputDirectory: 'src/components/users',
  includeTests: true
});
```

## 🎓 Best Practices

### Writing Effective Prompts

**Good Prompt:**
```
Create a login form with:
- Email input field (required, validated)
- Password input field (required, obscured)
- Remember me checkbox
- Submit button
- Forgot password link
Style with Material Design 3, include error states
```

**Poor Prompt:**
```
login form
```

### Component Naming

- Use PascalCase: `UserLoginForm`, not `user-login-form`
- Be descriptive: `AdminUserTable` not `Table1`
- Follow React conventions: `Modal`, `Dialog`, `Card`

### Testing Generated Components

1. Review the generated code before saving
2. Check for TypeScript errors
3. Verify props match requirements
4. Test accessibility features
5. Ensure responsive design

## 📝 Next Steps

After successful testing:

1. **Integrate with CI/CD**: Add workflow generation to build pipeline
2. **Extend schemas**: Add more atomic components as needed
3. **Custom templates**: Create organization-specific component templates
4. **Monitoring**: Set up logging and analytics for workflow usage
5. **Optimization**: Fine-tune DeepSeek prompts based on results

## 🆘 Support

For issues or questions:

1. Check the logs: `console` in browser and server logs
2. Verify database state with SQL queries above
3. Test Ollama independently
4. Review `docs/ATOMIC_COMPONENTS.md` for component library details
5. Check `docs/SERVICES_README.md` for service documentation

---

**Happy Component Generation! 🚀**
