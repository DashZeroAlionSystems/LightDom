# Enhanced Agent Session System - Usage Guide

## Overview

The Enhanced Agent Session System provides a comprehensive platform for managing AI agents with knowledge graph awareness, DeepSeek orchestration, and intelligent task delegation.

## Features

### 🤖 **Agent Session Management**
- Create and manage multiple agent sessions
- VSCode-style collapsible panel interface
- List and single view modes
- Real-time status updates

### 🧠 **Knowledge Graph Integration**
- Agents receive relevant codebase sections as context
- Automatic schema linking and relationship mapping
- Configurable knowledge focus areas
- Pattern-based code understanding

### 🎯 **DeepSeek Orchestration**
- Automatic agent selection based on task requirements
- Self-generated prompts for delegated tasks
- Navigation schema with include/exclude rules
- Decision tracking and reasoning logs

### 🔧 **Agent Specializations**
- **Frontend Developer**: React, TypeScript, UI components
- **Backend API Specialist**: Express routes, database queries
- **Database Engineer**: PostgreSQL schemas, migrations
- **Code Reviewer**: Quality analysis, security audits
- **Documentation Writer**: Technical documentation

### 📦 **Repository Integration**
- Assign repositories to specific agents
- Access control (read, read_write, admin)
- Scope restrictions for security
- Branch-specific context

## Quick Start

### 1. Database Setup

Run the migration to create all necessary tables:

```bash
psql -U postgres -d lightdom -f migrations/20250105_enhanced_agent_sessions.sql
```

This creates:
- 15+ new tables for agent orchestration
- Seed data for 5 default specializations
- 4 knowledge graph sections
- Default repository entry

### 2. API Server

The enhanced agent routes are automatically registered when the API server starts:

```bash
npm run start:dev
```

Endpoints available at:
- `POST /api/agent/enhanced/create` - Create enhanced agent
- `POST /api/agent/enhanced/select` - Select agents for task
- `POST /api/agent/enhanced/delegate` - Delegate task to agent
- `GET /api/agent/enhanced/knowledge-sections` - List knowledge sections
- `GET /api/agent/enhanced/repositories` - List repositories

### 3. UI Access

Navigate to the agent sessions panel:

```
http://localhost:3000/dashboard/agent-sessions
```

## Usage Examples

### Creating an Enhanced Agent (API)

```typescript
POST /api/agent/enhanced/create
{
  "name": "Frontend Expert",
  "session_id": "session-uuid",
  "model_name": "deepseek-coder",
  "specialization": "Frontend Developer",
  "capabilities": ["code_generation", "component_design", "testing"],
  "knowledge_graph_sections": ["section-uuid-1", "section-uuid-2"],
  "repository_ids": ["repo-uuid"],
  "fine_tune_before_start": false,
  "delegation_enabled": true,
  "auto_prompt_generation": true
}
```

### Selecting Agents for a Task

```typescript
POST /api/agent/enhanced/select
{
  "session_id": "session-uuid",
  "task_description": "Create a new React component for user authentication",
  "required_capabilities": ["code_generation", "component_design"],
  "max_agents": 2
}
```

Response includes:
- Selected agents with reasoning
- Confidence score
- Alternative agents

### Delegating a Task

```typescript
POST /api/agent/enhanced/delegate
{
  "orchestrator_instance_id": "orchestrator-uuid",
  "task_description": "Implement user login form validation",
  "context_data": {
    "component_path": "src/components/auth/LoginForm.tsx",
    "requirements": ["email validation", "password strength"]
  },
  "preferred_agent_specialization": "Frontend Developer"
}
```

Returns a generated prompt tailored to the target agent's knowledge context.

### Using the UI

1. **Create a Session**
   - Click "New Session" in the Agent Sessions panel
   - Enter session name and description
   - Select agent type (DeepSeek recommended)

2. **Add an Agent**
   - Select a session
   - Click "Add Agent"
   - Choose specialization, capabilities, and repositories
   - Configure knowledge graph sections
   - Enable delegation and auto-prompts

3. **Start Working**
   - Select an agent from the list
   - Click "Start Agent Session"
   - Provide instructions or let DeepSeek generate them

## Architecture

### Components

**Frontend (React)**
- `AgentSessionsPanel.tsx` - Main UI component
- `AgentSessionsPanel.css` - VSCode-inspired styling

**Backend (Express)**
- `enhanced-agent-session.routes.ts` - API endpoints
- `enhanced-agent-orchestrator.service.ts` - Orchestration logic
- `agent-management.service.ts` - CRUD operations

**Types**
- `enhanced-agent-session.ts` - TypeScript type definitions
- `agent-management.ts` - Base agent types

**Database**
- `20250105_enhanced_agent_sessions.sql` - Migration script

### Database Schema

**Core Tables:**
- `agent_sessions` - Session management
- `agent_instances` - Agent configurations
- `agent_messages` - Chat history

**Knowledge Graph:**
- `knowledge_graph_sections` - Codebase sections
- `agent_knowledge_contexts` - Agent-to-knowledge links
- `codebase_schema_map` - File analysis

**Orchestration:**
- `agent_decision_contexts` - Decision history
- `generated_prompts` - Auto-generated prompts
- `delegation_rules` - Task delegation rules
- `deepseek_orchestration_configs` - Per-session config

**Support:**
- `agent_specializations` - Predefined roles
- `repositories` - Git repositories
- `agent_repository_assignments` - Access control
- `agent_fine_tune_jobs` - Training queue

## Configuration

### Environment Variables

```bash
# DeepSeek API (optional, for cloud deployment)
DEEPSEEK_API_URL=https://api.deepseek.com/v1
DEEPSEEK_API_KEY=your_api_key_here

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/lightdom
DB_HOST=localhost
DB_PORT=5432
DB_NAME=lightdom
DB_USER=postgres
DB_PASSWORD=postgres
```

### Knowledge Graph Sections

Define custom knowledge sections:

```typescript
POST /api/agent/enhanced/knowledge-sections
{
  "name": "Authentication System",
  "description": "User auth components and services",
  "nodes": [
    {
      "node_id": "auth-1",
      "node_type": "component",
      "path": "src/components/auth",
      "name": "Auth Components",
      "relationships": ["svc-auth-1"]
    }
  ],
  "entry_points": ["src/components/auth/LoginPage.tsx"],
  "coverage_score": 0.8
}
```

### Agent Specializations

Create custom specializations:

```sql
INSERT INTO agent_specializations (name, description, required_capabilities, knowledge_focus)
VALUES (
  'Testing Specialist',
  'Expert in writing comprehensive test suites',
  '["testing", "test_automation", "mocking"]'::jsonb,
  '["tests", "__tests__", "*.test.ts"]'::jsonb
);
```

## Advanced Features

### Fine-Tuning Agents

Queue an agent for fine-tuning before activation:

```typescript
{
  "fine_tune_before_start": true,
  "fine_tune_config": {
    "training_file": "path/to/training/data.jsonl",
    "epochs": 3,
    "learning_rate": 0.0001
  }
}
```

### Navigation Rules

Create rules for automatic agent inclusion/exclusion:

```sql
INSERT INTO agent_navigation_rules (name, condition, action, confidence_threshold)
VALUES (
  'Exclude Database Agents for Frontend Tasks',
  '{"keywords": ["React", "component", "UI"]}'::jsonb,
  'exclude',
  0.8
);
```

### 3D Visualization Integration

Store and retrieve DOM layer visualizations:

```typescript
POST /api/agent/enhanced/visualizations
{
  "agent_instance_id": "agent-uuid",
  "layer_type": "3d_dom",
  "render_data": { /* visualization data */ },
  "screenshot_url": "https://example.com/viz.png"
}
```

## Best Practices

1. **Knowledge Context**: Assign relevant knowledge sections to agents for better context
2. **Specialization**: Use specialized agents for specific tasks
3. **Delegation**: Enable delegation for complex multi-step tasks
4. **Repository Access**: Grant minimal necessary access to repositories
5. **Fine-Tuning**: Fine-tune agents on project-specific patterns for better results
6. **Decision Tracking**: Review decision contexts to improve orchestration rules

## Troubleshooting

### Agent Not Responding
- Check agent status is 'ready'
- Verify knowledge context is assigned
- Ensure repository access is granted

### Poor Agent Selection
- Review decision context reasoning
- Adjust navigation rules
- Add more specific capabilities to agents

### Context Too Large
- Reduce knowledge graph sections
- Use focused knowledge areas
- Implement scope restrictions

## API Reference

See the full API documentation in the route files:
- `src/api/routes/enhanced-agent-session.routes.ts`
- `src/api/routes/agent-management.routes.ts`

## Support

For issues or questions:
1. Check the decision context logs
2. Review agent execution history
3. Consult the knowledge graph sections
4. Verify database migrations ran successfully
