# Workflow Prompt System Documentation

## Overview

The Workflow Prompt System is a comprehensive AI-powered platform that enables users to create complex workflows through natural language prompts, visualize workflow execution in real-time, and automatically generate UI components from Storybook with continuous styleguide mining.

## Features

### 1. AI Workflow Assistant
- **Natural Language Processing**: Create workflows by describing them in plain English
- **Intelligent Suggestions**: AI-powered workflow recommendations based on user patterns
- **Context-Aware**: Adapts to user role, permissions, and active projects

### 2. Workflow Visualization
- **Card Panel Layout**: Each workflow displayed in Material Design 3 cards
- **Accordion Steps**: Collapsible steps showing summary and detailed configuration
- **Real-time Updates**: WebSocket connection for live status updates
- **Color-Coded Status**: Visual indicators (blue=pending, yellow=running, green=success, red=failed)

### 3. DeepSeek Component Generation
- **Storybook Integration**: Connects to Storybook via headless API
- **Continuous Mining**: Background worker that mines design tokens and patterns
- **AI-Powered Generation**: Uses DeepSeek to generate components following styleguide
- **Complete Output**: Generates React component + Storybook story + TypeScript interfaces

### 4. Quick Navigation System
- **Role-Based Menus**: Different navigation based on user role (admin/developer/analyst)
- **Recent Items**: Quick access to recently viewed workflows and components
- **Search Functionality**: Fast search across workflows, components, and patterns

## API Reference

### Workflow Creation

**POST /api/workflow-prompt/create**
```javascript
{
  "prompt": "Create an SEO audit workflow that analyzes competitor websites"
}
```

Response:
```javascript
{
  "success": true,
  "workflow": {
    "id": "wf_1234",
    "name": "SEO Audit Workflow",
    "steps": [...],
    "nextSteps": ["Execute now", "Schedule", "Customize"]
  }
}
```

### Component Generation

**POST /api/workflow-prompt/components/generate**
```javascript
{
  "prompt": "Generate pricing card component with our design system",
  "styleGuideId": "11111111-1111-1111-1111-111111111111"
}
```

Response:
```javascript
{
  "success": true,
  "component": {
    "componentCode": "...",
    "storyCode": "...",
    "componentName": "PricingCard",
    "filePaths": {
      "component": "src/components/generated/PricingCard.tsx",
      "story": "src/stories/generated/PricingCard.stories.tsx"
    }
  }
}
```

### Styleguide Mining

**POST /api/workflow-prompt/styleguide/mine**
```javascript
{
  "storybookUrl": "http://localhost:6006",
  "continuous": true,
  "interval": 300000
}
```

**GET /api/workflow-prompt/styleguide/schema**

Returns complete styleguide schema with design tokens, components, and patterns.

## UI Components

### WorkflowPromptInterface
Main prompt interface where users create workflows.

**Usage:**
```tsx
import { WorkflowPromptInterface } from './components/workflow-prompt/WorkflowPromptInterface';

<WorkflowPromptInterface />
```

### WorkflowDetailPanel
Displays workflow details with accordion steps.

**Usage:**
```tsx
import { WorkflowDetailPanel } from './components/workflow-prompt/WorkflowDetailPanel';

<WorkflowDetailPanel workflowId="wf_1234" />
```

## Database Schema

### Main Tables
- **workflow_prompts** - User prompts and AI responses
- **workflow_executions** - Real-time execution tracking
- **workflow_steps** - Individual step configs and status
- **workflow_change_history** - Audit trail of changes
- **styleguide_schemas** - Mined styleguide data
- **generated_components** - AI-generated components
- **component_patterns** - Discovered patterns

## Use Cases

### 1. Create SEO Audit Workflow

```bash
User prompt: "Create workflow to audit competitor SEO: discover their URLs, extract metadata, compare with our metrics, generate report"

System generates:
- Step 1: Web Crawler (discover URLs)
- Step 2: Metadata Extractor
- Step 3: Metric Comparator
- Step 4: Report Generator

User can execute immediately or customize steps
```

### 2. Generate Component from Styleguide

```bash
User prompt: "Generate pricing card with 3 tiers following our design system"

System:
1. Scans Storybook for card patterns
2. Extracts design tokens (colors, spacing, typography)
3. Uses DeepSeek to generate component code
4. Creates Storybook story
5. Returns file paths for integration
```

### 3. Continuous Styleguide Mining

```bash
System automatically:
1. Scans Storybook every 5 minutes
2. Extracts new design tokens
3. Discovers common patterns
4. Updates schema database
5. Makes patterns available for generation
```

## Best Practices

1. **Prompts**: Be specific about workflow steps and requirements
2. **Styleguides**: Keep Storybook up-to-date for better generation
3. **Patterns**: Review discovered patterns periodically
4. **Monitoring**: Check workflow execution logs for optimization
5. **Components**: Validate generated components before production use

## Troubleshooting

**Issue**: Workflow not generating
- Check DeepSeek API connectivity
- Verify prompt is clear and specific

**Issue**: Component generation fails
- Ensure Storybook is running on correct port
- Check styleguide schema is up-to-date

**Issue**: Mining not finding patterns
- Verify Storybook has sufficient components
- Check component naming conventions

## Performance

- Workflow creation: <2 seconds
- Component generation: 5-10 seconds
- Styleguide mining: 30-60 seconds
- Pattern discovery: 10-20 seconds

## Security

- All prompts are logged for audit
- Component code is sanitized before execution
- Access controls based on user roles
- API rate limiting enabled

## Future Enhancements

- Multi-language support for prompts
- Advanced pattern matching algorithms
- Component performance benchmarking
- Integration with Figma designs
- Automated A/B testing for generated components
