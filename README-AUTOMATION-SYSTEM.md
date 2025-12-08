# Design System Automation & AI Revenue Generation

## Quick Start

This directory contains the complete implementation of an AI-powered design system automation and revenue generation framework.

### Prerequisites

Make sure you have the required dependencies:

```bash
# If handlebars is not installed, add it:
npm install handlebars @types/handlebars --save

# All other dependencies should already be in package.json
```

### Running the Demo

```bash
# Run the complete automation demo
npm run demo:automation

# Or use tsx directly
npx tsx demo-complete-automation.ts
```

### What's Included

#### AI Skills Configuration (`config/ai-skills/`)
- **skill-template.yaml** - Template for creating new AI skills
- **design-system-creator.yaml** - AI skill for creating complete design systems
- **infrastructure-gap-analyzer.yaml** - AI skill for analyzing infrastructure
- **revenue-optimizer.yaml** - AI skill for optimizing revenue strategies

#### Core Services (`src/services/`)

##### AI Services (`src/services/ai/`)
- **AISkillExecutor.ts** - Executes AI skills from YAML configurations
  - Multi-provider support (DeepSeek, Ollama, OpenAI, Anthropic)
  - Template rendering with Handlebars
  - Validation and retry logic
  - Training data collection

##### Automation Services (`src/services/automation/`)
- **AdvancedTaskQueue.ts** - Advanced task queue with:
  - Priority scheduling
  - Dependency resolution
  - Retry with exponential backoff
  - Persistent state
  
- **DesignSystemAutomationFramework.ts** - Complete design system automation:
  - Atomic design implementation
  - Component generation
  - Storybook integration
  - Documentation generation
  
- **RevenueAutomationEngine.ts** - Revenue generation and optimization:
  - Usage tracking
  - Tier management
  - Pricing optimization
  - Token rewards

#### Documentation
- **docs/COMPLETE_AUTOMATION_GUIDE.md** - Comprehensive guide with examples

#### Demo
- **demo-complete-automation.ts** - Full demonstration of all features

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    AI Skill Executor                        │
│  Loads YAML skills, renders prompts, executes with AI      │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                  Advanced Task Queue                        │
│  Manages complex workflows with dependencies and retries   │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┴──────────────┐
        │                             │
        ▼                             ▼
┌──────────────────┐         ┌──────────────────┐
│ Design System    │         │ Revenue          │
│ Automation       │         │ Automation       │
└──────────────────┘         └──────────────────┘
```

### Key Features

1. **AI-Powered Design System Generation**
   - Generate complete design systems from requirements
   - Atomic design principles (atoms → molecules → organisms → templates → pages)
   - Automated component code generation
   - Storybook stories and documentation

2. **Advanced Task Management**
   - Priority-based task scheduling
   - Task dependencies and ordering
   - Automatic retry with exponential backoff
   - Persistent queue state

3. **Revenue Optimization**
   - AI-generated monetization strategies
   - Usage tracking and tier management
   - Automated upsell detection
   - Token reward processing
   - Revenue metrics (MRR, ARR, CLV, etc.)

4. **Infrastructure Analysis**
   - AI-powered gap analysis
   - Service relationship mapping
   - Prioritized recommendations
   - Implementation roadmaps

5. **Self-Learning**
   - Automatic training data collection
   - Feedback loops for improvement
   - Performance tracking

### Creating a Custom AI Skill

1. Copy `config/ai-skills/skill-template.yaml`
2. Modify the configuration:
   - Set skillId, name, and description
   - Define the model and parameters
   - Write system and user prompts
   - Define variables with types
   - Configure output format and validation
3. Load and execute:

```typescript
import AISkillExecutor from './src/services/ai/AISkillExecutor';

const executor = new AISkillExecutor();
await executor.initialize();

const result = await executor.executeSkill('your-skill-id', {
  variables: {
    // Your variables here
  },
});
```

### Example: Generate a Design System

```typescript
import DesignSystemAutomationFramework from './src/services/automation/DesignSystemAutomationFramework';

const framework = new DesignSystemAutomationFramework();
await framework.initialize();
framework.start();

// Generate a complete design system
await framework.generateDesignSystem({
  name: 'MyDesignSystem',
  description: 'A modern, accessible design system',
  framework: 'react',
  brandGuidelines: {
    colors: {
      primary: '#007bff',
      secondary: '#6c757d',
    },
  },
  includeStorybook: true,
  includeDocumentation: true,
});

// Monitor progress
const stats = framework.getStats();
console.log(`Progress: ${stats.completed}/${stats.total}`);
```

### Example: Setup Revenue Automation

```typescript
import RevenueAutomationEngine from './src/services/automation/RevenueAutomationEngine';

const engine = new RevenueAutomationEngine();
await engine.initialize();

// Generate a revenue strategy
const strategy = await engine.generateRevenueStrategy(
  'AI Design System Platform',
  {
    capabilities: 'Component generation, styleguide mining, AI training',
    targetMarket: 'Frontend developers, design teams, enterprises',
    resources: 'Cloud infrastructure, AI models, support team',
    revenueGoals: '$50k MRR in 12 months',
  }
);

// Track usage
await engine.trackUsage({
  userId: 'user123',
  serviceId: 'design-system-generator',
  timestamp: new Date(),
  metrics: {
    componentsGenerated: 25,
    modelsRun: 5,
    apiCalls: 150,
  },
});

// Calculate metrics
const metrics = await engine.calculateMetrics();
console.log('MRR:', metrics.mrr);
console.log('ARR:', metrics.arr);
```

### Integration with Existing Systems

This framework integrates seamlessly with existing LightDom infrastructure:

- **Styleguide Mining**: Uses existing services from `services/styleguide-data-mining-service.js`
- **Storybook**: Integrates with `services/storybook-mining-service.js`
- **DeepSeek**: Leverages `services/deepseek-storybook-generator.service.js`
- **Revenue Models**: Compatible with `config/revenue-model-2025.json`
- **Blockchain**: Uses existing token reward system

### Next Steps

1. **Register Model Providers**
   ```typescript
   executor.registerModelProvider('deepseek', yourDeepSeekProvider);
   executor.registerModelProvider('ollama', yourOllamaProvider);
   ```

2. **Create Custom Skills**
   - Define skills for your specific use cases
   - Use the template as a starting point

3. **Setup Monitoring**
   - Listen to events for real-time updates
   - Track metrics and performance

4. **Deploy to Production**
   - Configure persistent storage
   - Setup automated optimization
   - Enable monitoring and alerts

### Support

- Full documentation: `docs/COMPLETE_AUTOMATION_GUIDE.md`
- Example usage: `demo-complete-automation.ts`
- Template files: `config/ai-skills/skill-template.yaml`

### License

See main project LICENSE file.
