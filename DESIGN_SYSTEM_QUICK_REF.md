# Design System Automation - Quick Reference

## 🚀 Quick Commands

### Component Generation
```bash
# Interactive mode
npm run design:build:interactive

# Single component
npm run design:component -- "Description here"

# Complete dashboard
npm run design:dashboard -- "Dashboard description"
```

### Workflow Monitoring
```bash
# Interactive monitoring
npm run workflow:monitor:interactive

# Execute and monitor
npm run workflow:monitor -- -e workflow-id

# Watch and auto-execute
npm run workflow:watch -- file.json --auto
```

### Prompt Templates
```bash
# List all templates
npm run ollama:prompt:list

# Generate component
npm run ollama:prompt:execute -- generate_component \
  description="Button with states" \
  design_tokens="..."

# Generate dashboard workflow
npm run ollama:prompt:execute -- generate_dashboard_workflow \
  dashboard_description="Analytics dashboard"

# Enhance reusability
npm run ollama:prompt:execute -- enhance_component_reusability \
  component_code="..."

# Generate variants
npm run ollama:prompt:execute -- generate_component_variants \
  base_component="..." \
  variants_list="variant1,variant2"
```

## 📁 File Locations

```
scripts/automation/
├── design-system-builder.js           # Component/dashboard builder
└── workflow-automation-monitor.js     # Workflow monitoring

workflows/automation/ollama-prompts/
└── prompt-templates.json              # Updated with 4 new templates

src/components/generated/              # Generated components
src/styles/design-system.ts            # Design system tokens

DESIGN_SYSTEM_AUTOMATION.md           # Complete guide
```

## 🎯 Common Workflows

### 1. Build Single Component
```bash
npm run design:component -- "Data table with sorting, filtering, and pagination"
```

### 2. Build Dashboard Progressively
```bash
npm run design:build:interactive
# Choose: 2. Generate complete dashboard
# Describe: "Admin dashboard with metrics and charts"
# Watch progress in real-time
```

### 3. Build with Change Monitoring
```bash
npm run design:build:interactive
# Choose: 3. Progressive dashboard with monitoring
# System watches workflow file and rebuilds on changes
```

### 4. Monitor Workflow Execution
```bash
npm run workflow:monitor -- -e workflow-123
# See real-time progress as workflow executes
```

### 5. Auto-Execute on File Changes
```bash
npm run workflow:watch -- workflow.json --auto
# Workflow executes automatically when file changes
```

## 🎨 New Prompt Templates

| Template | Purpose | Parameters |
|----------|---------|------------|
| `generate_component` | Create reusable React component | `description`, `design_tokens` |
| `generate_dashboard_workflow` | Plan dashboard build | `dashboard_description` |
| `enhance_component_reusability` | Improve component reusability | `component_code` |
| `generate_component_variants` | Create component variations | `base_component`, `variants_list` |

## 💡 Key Features

### Design System Builder
- ✅ Single component generation
- ✅ Complete dashboard workflows
- ✅ Progressive building with feedback
- ✅ Change monitoring and auto-rebuild
- ✅ Design system token integration

### Workflow Monitor
- ✅ Real-time execution feedback
- ✅ Step-by-step progress tracking
- ✅ Error detection and reporting
- ✅ File watching and auto-execution
- ✅ Feedback logging to files

### Reusability Focus
- ✅ AI-powered component analysis
- ✅ Reusability scoring
- ✅ Enhancement suggestions
- ✅ Variant generation
- ✅ Best practices enforcement

## 📊 Feedback Events

### Design System Builder
- `onProgress(feedback)` - Component build progress
- Real-time console output
- JSON feedback logs

### Workflow Monitor
- `start` - Execution started
- `executing` - In progress
- `progress` - Step completed
- `complete` - Finished
- `error` - Error occurred
- `file-change` - File modified

## 🔧 Troubleshooting

| Issue | Solution |
|-------|----------|
| Ollama not running | `ollama serve` |
| Model not found | `ollama pull codellama:7b` |
| n8n not accessible | `npm run n8n:start` |
| chokidar not installed | `npm install chokidar` |
| Component errors | Review generated code manually |
| Workflow fails | Check n8n logs: `npm run n8n:logs` |

## 🎓 Examples

### Generate Button Component
```bash
npm run design:component -- "Button component with primary, secondary, and danger variants, loading state, disabled state, and icon support"
```

### Build Analytics Dashboard
```bash
npm run design:dashboard -- "Analytics dashboard with revenue chart, user metrics cards, recent activity feed, and filters"
```

### Monitor Dashboard Build
```bash
npm run design:build:interactive
# Option 3: Progressive with monitoring
# Watch as each component builds
# Auto-rebuilds when workflow changes
```

### Watch Workflow File
```bash
npm run workflow:watch -- workflows/my-workflow.json --auto
# Edit my-workflow.json to trigger execution
```

## 📖 Documentation

- **Complete Guide**: `DESIGN_SYSTEM_AUTOMATION.md`
- **Integration Guide**: `OLLAMA_N8N_INTEGRATION_GUIDE.md`
- **Quick Reference**: `OLLAMA_N8N_QUICK_REFERENCE.md`
- **Implementation Summary**: `IMPLEMENTATION_SUMMARY.md`

## 🚀 Getting Started

1. **Test Setup**
   ```bash
   npm run ollama:test
   ```

2. **Try Component Generation**
   ```bash
   npm run design:component -- "Simple card component"
   ```

3. **Build Dashboard**
   ```bash
   npm run design:build:interactive
   ```

4. **Monitor Workflow**
   ```bash
   npm run workflow:monitor:interactive
   ```

---

**Build reusable components and complete dashboards with AI! 🎨✨**
