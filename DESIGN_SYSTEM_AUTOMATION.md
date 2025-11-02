# Design System Automation & Reusability Guide

## Overview

This guide covers the enhanced automation capabilities for building reusable design system components and complete dashboards using Ollama AI and n8n workflows. The system now supports:

1. **Component Generation** - Generate single, reusable React components
2. **Progressive Dashboard Building** - Build from single components to complete dashboards
3. **Real-Time Feedback** - Monitor workflow execution with live progress updates
4. **Change Monitoring** - Automatically rebuild when files change
5. **Enhanced Reusability** - AI-powered component analysis and enhancement

## Table of Contents

1. [Quick Start](#quick-start)
2. [Design System Builder](#design-system-builder)
3. [Workflow Automation Monitor](#workflow-automation-monitor)
4. [Progressive Dashboard Building](#progressive-dashboard-building)
5. [Real-Time Feedback System](#real-time-feedback-system)
6. [Change Monitoring](#change-monitoring)
7. [Prompt Templates](#prompt-templates)
8. [Usage Examples](#usage-examples)
9. [Best Practices](#best-practices)

## Quick Start

### Install Dependencies

```bash
# Ensure all dependencies are installed
npm install

# Install chokidar for file watching
npm install chokidar
```

### Test Your Setup

```bash
# Test Ollama
npm run ollama:test

# Interactive design system builder
npm run design:build:interactive

# Interactive workflow monitor
npm run workflow:monitor:interactive
```

## Design System Builder

### Overview

The Design System Builder uses Ollama AI to generate reusable React components that follow your design system tokens and best practices.

### Key Features

- **Single Component Generation** - Create individual reusable components
- **Dashboard Workflow Generation** - Plan complete dashboards with component breakdowns
- **Progressive Building** - Build dashboards step-by-step with real-time feedback
- **Change Monitoring** - Auto-regenerate when workflow files change
- **Design System Integration** - Automatically uses your design system tokens

### Usage

#### Interactive Mode (Recommended)

```bash
npm run design:build:interactive
```

This will guide you through:
1. Choosing between single component, dashboard, or progressive building
2. Describing what you want to build
3. Monitoring the build process
4. Saving generated code

#### Generate Single Component

```bash
npm run design:component -- "A loading button with spinner and disabled state"
```

#### Generate Complete Dashboard

```bash
npm run design:dashboard -- "Analytics dashboard with charts and metrics"
```

### Component Generation Process

1. **Description Analysis** - AI analyzes your component description
2. **Design System Loading** - Loads color, spacing, and typography tokens
3. **Code Generation** - Creates TypeScript React component code
4. **Validation** - Checks for TypeScript errors and best practices
5. **Saving** - Saves to `src/components/generated/`

### Dashboard Generation Process

1. **Workflow Planning** - AI breaks dashboard into components
2. **Dependency Analysis** - Determines component build order
3. **Progressive Building** - Builds components one by one
4. **Real-Time Feedback** - Shows progress as each component completes
5. **Dashboard Assembly** - Combines components into main dashboard
6. **Feedback Logging** - Saves detailed build log

## Workflow Automation Monitor

### Overview

Monitor n8n workflow executions with real-time feedback and progress tracking.

### Key Features

- **Execution Monitoring** - Watch workflows execute in real-time
- **Step-by-Step Feedback** - See each node complete
- **Error Tracking** - Detailed error information
- **File Watching** - Auto-execute on file changes
- **Feedback Logging** - Save execution logs to file

### Usage

#### Interactive Mode

```bash
npm run workflow:monitor:interactive
```

Choose from:
1. Execute workflow with monitoring
2. Watch file and auto-execute on changes
3. Monitor existing execution

#### Execute Workflow

```bash
npm run workflow:monitor -- --execute workflow-id
```

#### Watch and Auto-Execute

```bash
npm run workflow:watch -- workflow.json --auto
```

### Real-Time Feedback Events

The monitor emits the following events:

- `start` - Workflow execution started
- `executing` - Execution in progress
- `progress` - Step completed
- `complete` - Workflow finished
- `error` - Error occurred
- `file-change` - Watched file changed

## Progressive Dashboard Building

### What is Progressive Building?

Progressive building breaks a complex dashboard into manageable components and builds them one at a time, providing feedback at each step.

### How It Works

1. **Workflow Generation**
   ```bash
   npm run design:build:interactive
   # Choose option 2: Generate complete dashboard
   ```

2. **Component Prioritization**
   - AI assigns priority 1-10 to each component
   - Higher priority components built first
   - Dependencies considered automatically

3. **Step-by-Step Building**
   - Each component generated individually
   - Real-time status updates
   - Error handling per component
   - Continue on failure

4. **Dashboard Assembly**
   - Main dashboard component created
   - All sub-components imported
   - Layout structure applied

### Progress Feedback

During building, you'll see:
```
[1/5] Generating HeaderComponent...
✅ Generated HeaderComponent

[2/5] Generating ChartWidget...
✅ Generated ChartWidget

[3/5] Generating DataTable...
❌ Failed to generate DataTable

[4/5] Generating FilterPanel...
✅ Generated FilterPanel

[5/5] Generating FooterComponent...
✅ Generated FooterComponent

✅ Dashboard built: src/components/generated/AnalyticsDashboard.tsx
```

## Real-Time Feedback System

### Feedback Architecture

The system provides multi-level feedback:

1. **Console Feedback** - Real-time terminal output
2. **Event Emitters** - Programmatic event handling
3. **File Logging** - Persistent feedback logs
4. **JSON Reports** - Structured feedback data

### Implementing Custom Feedback

```javascript
const DesignSystemBuilder = require('./scripts/automation/design-system-builder');

const builder = new DesignSystemBuilder();
await builder.initialize();

const result = await builder.buildDashboardProgressive(workflow, {
  onProgress: (feedback) => {
    console.log(`Step ${feedback.step}/${feedback.total}`);
    console.log(`Component: ${feedback.component}`);
    console.log(`Status: ${feedback.status}`);
    
    // Send to external service
    fetch('https://your-service/feedback', {
      method: 'POST',
      body: JSON.stringify(feedback)
    });
  }
});
```

### Feedback Log Structure

```json
{
  "step": 1,
  "total": 5,
  "component": "HeaderComponent",
  "status": "completed",
  "timestamp": "2025-11-01T14:00:00.000Z",
  "code": "Component code here..."
}
```

## Change Monitoring

### File Watching

Monitor workflow files and auto-regenerate on changes:

```bash
npm run design:build:interactive
# Choose option 3: Progressive dashboard with monitoring
```

### How It Works

1. **Initial Build** - Dashboard built from workflow
2. **File Watching** - Workflow JSON file monitored
3. **Change Detection** - File modifications detected
4. **Auto-Regeneration** - Dashboard rebuilt automatically
5. **Continuous Monitoring** - Process continues until stopped

### Use Cases

- **Iterative Development** - Modify workflow, see results instantly
- **Prototyping** - Quick iterations on dashboard structure
- **Design Exploration** - Test different component combinations
- **CI/CD Integration** - Auto-rebuild on git commits

## Prompt Templates

### New Design System Templates

The system includes 4 new prompt templates:

#### 1. `generate_component`

Generate reusable React components:

```bash
npm run ollama:prompt:execute -- generate_component \
  description="Data table with sorting and pagination" \
  design_tokens="$(cat src/styles/design-system.ts | head -100)"
```

#### 2. `generate_dashboard_workflow`

Plan dashboard build workflows:

```bash
npm run ollama:prompt:execute -- generate_dashboard_workflow \
  dashboard_description="E-commerce admin dashboard"
```

#### 3. `enhance_component_reusability`

Analyze and improve component reusability:

```bash
npm run ollama:prompt:execute -- enhance_component_reusability \
  component_code="$(cat src/components/MyComponent.tsx)"
```

#### 4. `generate_component_variants`

Create component variants:

```bash
npm run ollama:prompt:execute -- generate_component_variants \
  base_component="$(cat src/components/Button.tsx)" \
  variants_list="primary,secondary,danger,ghost"
```

## Usage Examples

### Example 1: Build Simple Component

```bash
npm run design:component -- "A card component with header, body, and actions"
```

### Example 2: Build Analytics Dashboard

```bash
npm run design:dashboard -- "Analytics dashboard with user metrics, revenue charts, and activity feed"
```

### Example 3: Progressive Building with Monitoring

```bash
# Start interactive builder
npm run design:build:interactive

# Choose: 3. Progressive dashboard with monitoring
# Describe: "Admin dashboard with users table, statistics cards, and settings panel"
# The system will:
# 1. Generate workflow
# 2. Build components progressively
# 3. Provide real-time feedback
# 4. Start monitoring for changes
# 5. Auto-rebuild on workflow updates
```

### Example 4: Monitor Workflow Execution

```bash
# Execute with monitoring
npm run workflow:monitor -- -e my-workflow-id

# Watch file and auto-execute
npm run workflow:watch -- workflows/my-workflow.json --auto
```

### Example 5: Enhance Existing Component

```bash
# Analyze reusability
npm run ollama:prompt:execute -- enhance_component_reusability \
  component_code="$(cat src/components/MyButton.tsx)"

# Generate variants
npm run ollama:prompt:execute -- generate_component_variants \
  base_component="$(cat src/components/MyButton.tsx)" \
  variants_list="small,medium,large"
```

## Best Practices

### Component Generation

1. **Be Specific** - Detailed descriptions yield better components
2. **Include Context** - Mention use cases and requirements
3. **Specify Variants** - List different states (loading, error, etc.)
4. **Design System** - Reference existing design tokens
5. **Accessibility** - Mention keyboard navigation, ARIA requirements

**Good Description:**
```
"A form input component with label, placeholder, error message display, 
validation feedback, disabled state, and keyboard navigation support"
```

**Poor Description:**
```
"input box"
```

### Dashboard Building

1. **Start Simple** - Begin with basic layout, add complexity
2. **Define Data Flow** - Clarify where data comes from
3. **Component Reuse** - Identify opportunities for reusable components
4. **Responsive Design** - Mention mobile/tablet/desktop requirements
5. **Testing Strategy** - Include test scenarios in workflow

### Progressive Building

1. **Set Priorities** - Higher priority for critical components
2. **Handle Failures** - System continues if one component fails
3. **Review Feedback** - Check feedback log for issues
4. **Iterate** - Modify workflow based on results
5. **Version Control** - Commit successful builds

### Change Monitoring

1. **Test First** - Ensure workflow works before enabling monitoring
2. **Small Changes** - Make incremental workflow modifications
3. **Watch Logs** - Monitor feedback for errors
4. **Save Progress** - Commit working versions
5. **Stop When Done** - Ctrl+C to stop monitoring

### Workflow Execution

1. **Monitor Progress** - Use real-time feedback
2. **Check Logs** - Review execution logs for errors
3. **Handle Errors** - Implement error handling in workflows
4. **Test Locally** - Test workflows before automation
5. **Document Inputs** - Clearly document required input data

## Troubleshooting

### Component Generation Issues

**"Failed to generate component"**
- Check Ollama is running: `ollama serve`
- Verify model availability: `ollama pull codellama:7b`
- Try simpler description
- Check design system file exists

**"Component has TypeScript errors"**
- Generated code may need manual fixes
- Review and adjust imports
- Verify design tokens usage
- Check Ant Design component names

### Dashboard Building Issues

**"Workflow generation failed"**
- Simplify dashboard description
- Be more specific about components needed
- Try different Ollama model
- Check prompt template syntax

**"Component priority errors"**
- Ensure priorities are numbers 1-10
- Dependencies should be array
- Check JSON structure validity

### Monitoring Issues

**"Cannot connect to n8n"**
- Start n8n: `npm run n8n:start`
- Check URL: `N8N_BASE_URL` in `.env`
- Verify network connectivity

**"Execution not found"**
- Confirm workflow ID exists
- Check execution ID is valid
- Ensure API key is correct

**"File watch not working"**
- Install chokidar: `npm install chokidar`
- Check file path is correct
- Verify file permissions

## Advanced Usage

### Programmatic Component Generation

```javascript
const DesignSystemBuilder = require('./scripts/automation/design-system-builder');

async function generateComponents() {
  const builder = new DesignSystemBuilder();
  await builder.initialize();

  const components = [
    "Button with loading state",
    "Input field with validation",
    "Modal dialog with animations"
  ];

  for (const description of components) {
    const result = await builder.generateComponent(description);
    
    if (result.success) {
      console.log(`✅ Generated: ${description}`);
    }
  }
}

generateComponents();
```

### Custom Feedback Handler

```javascript
const WorkflowAutomationMonitor = require('./scripts/automation/workflow-automation-monitor');

async function monitorWithCustomFeedback() {
  const monitor = new WorkflowAutomationMonitor();

  monitor.on('progress', (data) => {
    // Send to Slack
    sendToSlack(`Step completed: ${data.steps.length} steps done`);
    
    // Update database
    database.update({ executionId: data.executionId, progress: data.steps });
    
    // Log to file
    console.log(`Progress: ${JSON.stringify(data)}`);
  });

  await monitor.executeWorkflowWithFeedback('workflow-id');
}
```

### Batch Dashboard Generation

```javascript
const dashboards = [
  "User management dashboard",
  "Analytics and reporting dashboard",
  "Settings and configuration dashboard"
];

for (const description of dashboards) {
  const workflowResult = await builder.generateDashboardWorkflow(description);
  
  if (workflowResult.success) {
    await builder.buildDashboardProgressive(workflowResult.workflow);
  }
}
```

## Integration with Existing Systems

### CI/CD Integration

Add to your CI pipeline:

```yaml
# .github/workflows/build-dashboards.yml
name: Build Dashboards

on:
  push:
    paths:
      - 'workflows/**/*.json'

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: npm install
      - run: npm run design:dashboard -- "$(cat workflow.txt)"
      - run: git add src/components/generated
      - run: git commit -m "Auto-generated components"
```

### n8n Integration

Create n8n workflows that trigger component generation:

1. Webhook trigger receives component description
2. Call design system builder API
3. Store generated code
4. Deploy to preview environment
5. Send notification

### Monitoring Integration

Send feedback to external services:

```javascript
monitor.on('progress', async (data) => {
  await fetch('https://metrics.example.com/api/feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      workflow: data.executionId,
      progress: data.steps.length,
      timestamp: new Date().toISOString()
    })
  });
});
```

## Next Steps

1. **Explore Templates** - Review all prompt templates
2. **Build Components** - Generate your first component
3. **Create Dashboard** - Build a complete dashboard
4. **Monitor Workflows** - Watch execution in real-time
5. **Customize** - Adapt system to your needs

## Resources

- **Design System Builder**: `scripts/automation/design-system-builder.js`
- **Workflow Monitor**: `scripts/automation/workflow-automation-monitor.js`
- **Prompt Templates**: `workflows/automation/ollama-prompts/prompt-templates.json`
- **Generated Components**: `src/components/generated/`
- **Design System Tokens**: `src/styles/design-system.ts`

---

**Build smarter, faster, and more reusable with AI-powered design system automation!** 🎨🚀
