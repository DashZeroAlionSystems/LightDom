# Storybook Mining Campaign with Neural Network Integration

Complete system for mining Storybook design systems with AI-powered pattern recognition and auto-component generation.

## Overview

This system connects a **neural network** to a **web crawler** to intelligently mine Storybook instances, style guides, and design systems across the web. It learns patterns, identifies best practices vs anti-patterns, and automatically generates atom components with Storybook stories.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                Storybook Mining Campaign System                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────┐        ┌────────────────────────┐         │
│  │ Neural Network   │◄──────►│  Crawler Orchestrator  │         │
│  │   Instance       │        │   - Puppeteer          │         │
│  │ - TensorFlow.js  │        │   - Prioritization     │         │
│  │ - CNN-LSTM       │        │   - Queue Management   │         │
│  │ - Pattern Recog  │        └────────────────────────┘         │
│  └──────────────────┘                    │                       │
│         │                                │                       │
│         │ Predictions                    │ URLs                  │
│         ▼                                ▼                       │
│  ┌─────────────────────────────────────────────────┐           │
│  │          Storybook Mining Service               │           │
│  │  - Component Extraction                         │           │
│  │  - Pattern Analysis (similarities/differences)  │           │
│  │  - Screenshot Capture                           │           │
│  │  - UX Pattern Mining                            │           │
│  └─────────────────────────────────────────────────┘           │
│                       │                                          │
│                       │ Components + Patterns                    │
│                       ▼                                          │
│  ┌─────────────────────────────────────────────────┐           │
│  │         Auto-Component Generator                 │           │
│  │  - Generate React Component (.tsx)               │           │
│  │  - Generate Storybook Story (.stories.tsx)      │           │
│  │  - Capture Screenshot (Required)                 │           │
│  │  - Mine UX Patterns (Required)                   │           │
│  └─────────────────────────────────────────────────┘           │
│                       │                                          │
│                       ▼                                          │
│  ┌─────────────────────────────────────────────────┐           │
│  │           Training Data Feedback                 │           │
│  │  Component Quality → Neural Network              │           │
│  │  Pattern Analysis → Neural Network               │           │
│  │  Continuous Learning & Improvement               │           │
│  └─────────────────────────────────────────────────┘           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Features

### 🧠 Neural Network Intelligence

- **Pattern Recognition**: Learns what makes good vs bad components
- **Quality Prediction**: Predicts if a Storybook is worth crawling
- **Adaptive Learning**: Improves with each discovery
- **Best Practice Detection**: Identifies design patterns to emulate
- **Anti-Pattern Detection**: Identifies patterns to avoid

### 🕷️ Intelligent Crawling

- **Neural-Guided Prioritization**: Neural network decides what to crawl next
- **Storybook Detection**: Automatically identifies Storybook instances
- **Design System Mining**: Extracts components, tokens, patterns
- **Respectful Crawling**: Follows robots.txt and rate limits

### 🎨 Pattern Analysis

- **Similarity Detection**: Finds common patterns across libraries
- **Difference Analysis**: Identifies unique approaches
- **Best Practice Identification**: Scores patterns by quality
- **Comparative Analysis**: Compares implementations across sources

### 🔨 Auto-Component Generation

**RULES (Always Enforced):**
1. ✅ **Screenshots Required**: Every component must have a screenshot
2. ✅ **UX Mining Required**: Must mine UX patterns from stories and tests
3. ✅ **Storybook Integration**: Every component gets a Storybook story
4. ✅ **Atomic Components Only**: Generates atom-level components

Generated files:
- `src/components/atoms/mined/{ComponentName}.tsx` - React component
- `src/stories/atoms/mined/{ComponentName}.stories.tsx` - Storybook story
- `mined-components/screenshots/{ComponentName}.png` - Screenshot

### 📊 Continuous Learning

- Feeds component quality back to neural network
- Retrains automatically after collecting enough samples
- Improves detection accuracy over time
- Learns from patterns and anti-patterns

## Quick Start

### 1. Installation

```bash
# Install dependencies (already done in your project)
npm install

# Ensure database is running
# The system will auto-create tables
```

### 2. Start a Campaign

```bash
# Start with default settings
node cli/storybook-mining-campaign-cli.js start

# Or with custom options
node cli/storybook-mining-campaign-cli.js start \
  --name "material-design-mining" \
  --concurrency 5 \
  --screenshots \
  --ux-mining
```

### 3. Monitor Progress

```bash
# Check status
node cli/storybook-mining-campaign-cli.js status --name "material-design-mining"

# List generated components
node cli/storybook-mining-campaign-cli.js list-components

# List discovered patterns
node cli/storybook-mining-campaign-cli.js list-patterns --best-practices
```

## Configuration

### Campaign Configuration

```javascript
const campaign = new StorybookMiningCampaign({
  campaignName: 'my-campaign',
  
  // Neural Network Settings
  neuralConfig: {
    modelType: 'design-system-classifier',
    architecture: 'cnn-lstm',
    objectives: [
      'component-quality-detection',
      'design-pattern-similarity',
      'ux-effectiveness-scoring',
      'storybook-detection'
    ],
    learningRate: 0.001,
    batchSize: 32,
  },
  
  // Crawler Settings
  crawlerConfig: {
    maxConcurrency: 10,
    intelligentPrioritization: true,
    adaptiveDepth: true,
  },
  
  // Mining Targets
  miningTargets: {
    storybooks: true,
    styleGuides: true,
    componentLibraries: true,
    designSystems: true,
    patterns: ['components', 'tokens', 'animations'],
  },
  
  // Auto-Generation Rules (REQUIRED)
  autoGeneration: {
    enabled: true,
    requiresScreenshot: true,  // ✅ REQUIRED
    requiresUXMining: true,    // ✅ REQUIRED
    atomicComponentsOnly: true,
    storybookIntegration: true,
  },
  
  // Pattern Analysis
  patternAnalysis: {
    mineSimilarities: true,
    mineDifferences: true,
    identifyBestPractices: true,
    identifyAntiPatterns: true,
  },
});
```

## CLI Commands

### Start Campaign

```bash
node cli/storybook-mining-campaign-cli.js start [options]

Options:
  -n, --name <name>         Campaign name (default: "default-campaign")
  -c, --concurrency <num>   Max concurrent crawls (default: 10)
  --no-neural               Disable neural network
  --no-auto-generate        Disable auto component generation
  --no-screenshots          Disable screenshot capture (not recommended)
  --no-ux-mining           Disable UX pattern mining (not recommended)
```

### Check Status

```bash
node cli/storybook-mining-campaign-cli.js status --name "my-campaign"
```

### List Components

```bash
node cli/storybook-mining-campaign-cli.js list-components --name "my-campaign"
```

### List Patterns

```bash
# All patterns
node cli/storybook-mining-campaign-cli.js list-patterns

# Best practices only
node cli/storybook-mining-campaign-cli.js list-patterns --best-practices

# Anti-patterns only
node cli/storybook-mining-campaign-cli.js list-patterns --anti-patterns
```

### Retrain Neural Network

```bash
node cli/storybook-mining-campaign-cli.js retrain --name "my-campaign"
```

## How It Works

### 1. URL Discovery & Seeding

```javascript
// System seeds URLs from multiple sources
await seederService.seedFromSources({
  github: true,    // GitHub repos with Storybook
  npm: true,       // NPM packages with Storybook
  popular: true,   // Known popular design systems
});
```

### 2. Neural Network Evaluation

```javascript
// For each discovered URL, neural network predicts:
const prediction = await neuralNetwork.predict({
  url: 'https://example.com/storybook',
  metadata: { /* crawl history, domain info, etc */ }
});

// Returns:
// {
//   isStorybook: 0.95,           // Confidence it's a Storybook
//   designSystemQuality: 0.87,    // Predicted quality score
//   crawlPriority: 0.91,          // Should we crawl this?
// }
```

### 3. Intelligent Crawling

```javascript
// Only crawl high-quality targets
if (prediction.isStorybook && prediction.designSystemQuality > 0.7) {
  await queueForCrawling(url, prediction.crawlPriority);
}
```

### 4. Component Mining

```javascript
// Extract components with all metadata
const components = await storybookMining.mineWebsite(url, {
  extractComponents: true,
  extractPatterns: true,
  extractUX: true,          // REQUIRED
  takeScreenshots: true,    // REQUIRED
});
```

### 5. Pattern Analysis

```javascript
// Analyze similarities and differences
const patterns = await analyzePatterns(components);

// Returns:
// {
//   similarities: [
//     { property: 'borderRadius', value: '4px', frequency: 0.85 }
//   ],
//   differences: [
//     { component1: 'url1', component2: 'url2', differences: [...] }
//   ],
//   isBestPractice: true,
//   qualityScore: 0.92
// }
```

### 6. Auto-Component Generation

```javascript
// Generate React component + Storybook story
const result = await generateAtomComponent(component, patterns);

// Creates:
// - src/components/atoms/mined/Button.tsx
// - src/stories/atoms/mined/Button.stories.tsx
// - mined-components/screenshots/Button.png  ✅ REQUIRED
// - Mines UX patterns from stories           ✅ REQUIRED
```

### 7. Continuous Learning

```javascript
// Feed results back to neural network
await addTrainingData({
  type: 'component-quality',
  input: component.features,
  output: component.qualityScore,
});

// Auto-retrain when threshold reached
await checkAndRetrain(); // Retrains after 1000 new samples
```

## Database Schema

The system creates the following tables:

```sql
-- Campaign tracking
mining_campaigns (
  id, name, status, config, neural_instance_id,
  started_at, last_active, metrics
)

-- Pattern analysis
design_patterns (
  id, campaign_id, pattern_type, pattern_name,
  quality_score, is_best_practice, is_anti_pattern,
  similarities, differences, examples
)

-- Generated components
generated_components (
  id, campaign_id, component_name, component_type,
  source_urls, file_path, story_path, screenshot_path,
  ux_patterns, quality_metrics
)

-- Training data for neural network
neural_training_data (
  id, campaign_id, data_type, input_features,
  output_labels, source_url, quality_verified
)

-- UX patterns
ux_patterns (
  id, campaign_id, pattern_category, pattern_description,
  effectiveness_score, usage_frequency, source_storybooks
)
```

## API Integration

The system integrates with existing APIs:

```javascript
// Neural Network API
POST /api/neural-networks/instances              // Create instance
POST /api/neural-networks/instances/:id/train    // Train
POST /api/neural-networks/instances/:id/predict  // Predict

// Storybook Discovery API
POST /api/storybook-discovery/start              // Start discovery
GET  /api/storybook-discovery/status             // Get status

// Mining API
POST /api/storybook-mining/mine                  // Mine URL
GET  /api/storybook-mining/components            // List components
GET  /api/storybook-mining/patterns              // List patterns
```

## Metrics & Monitoring

The system tracks:

- **Components Generated**: Total atom components created
- **Patterns Discovered**: Unique design patterns found
- **UX Patterns**: User experience patterns mined
- **Training Samples**: Data points for neural network
- **Best Practices**: High-quality patterns identified
- **Anti-Patterns**: Low-quality patterns to avoid
- **Neural Accuracy**: Model prediction accuracy
- **Crawl Success Rate**: Percentage of successful crawls

## Example Output

### Generated Component

```tsx
// src/components/atoms/mined/MaterialButton.tsx
import React from 'react';

/**
 * MaterialButton
 * 
 * Mined from: https://material-ui.com/storybook
 * Quality Score: 0.94
 * 
 * Pattern Analysis:
 * - button: Best Practice ✓
 * - Uses consistent border-radius (4px)
 * - Follows Material Design elevation principles
 */

export interface MaterialButtonProps {
  children?: React.ReactNode;
  variant?: 'contained' | 'outlined' | 'text';
  color?: 'primary' | 'secondary';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  onClick?: () => void;
}

export const MaterialButton: React.FC<MaterialButtonProps> = ({
  children,
  variant = 'contained',
  color = 'primary',
  size = 'medium',
  disabled = false,
  onClick,
}) => {
  return (
    <button
      className={`btn btn-${variant} btn-${color} btn-${size}`}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
};
```

### Generated Story

```tsx
// src/stories/atoms/mined/MaterialButton.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { MaterialButton } from './MaterialButton';

const meta: Meta<typeof MaterialButton> = {
  title: 'Atoms/Mined/MaterialButton',
  component: MaterialButton,
  parameters: {
    docs: {
      description: {
        component: `
# MaterialButton

**Mined from:** https://material-ui.com/storybook
**Quality Score:** 0.94

**UX Patterns:**
- interactions: [
    { name: "click", steps: "expect(button).toBeEnabled()" }
  ]
- accessibility: { ariaLabel: true, keyboardNav: true }
- responsiveness: [{ breakpoint: "mobile", adjustments: ["fontSize"] }]

**Best Practices Identified:**
- Consistent elevation on hover (2dp → 4dp)
- Clear focus indicators for accessibility
- Smooth transitions (200ms ease-in-out)
        `,
      },
    },
  },
  tags: ['autodocs', 'mined'],
};

export default meta;
type Story = StoryObj<typeof MaterialButton>;

export const Contained: Story = {
  args: {
    variant: 'contained',
    children: 'Contained Button',
  },
};

export const Outlined: Story = {
  args: {
    variant: 'outlined',
    children: 'Outlined Button',
  },
};

// Screenshot: mined-components/screenshots/MaterialButton-{timestamp}.png
// UX Patterns: Mined from 15 stories and 8 interaction tests
```

## Best Practices

### 1. Let Neural Network Guide
- Start with broad seeding, let NN prioritize
- Trust quality predictions (>0.7 threshold)
- Feed back quality scores for learning

### 2. Always Capture Screenshots
- Required for visual pattern recognition
- Helps neural network learn visual patterns
- Provides documentation for generated components

### 3. Mine UX Patterns
- Extract interaction patterns from tests
- Learn from effective user flows
- Apply patterns to generated components

### 4. Analyze Patterns Continuously
- Compare similar components across sources
- Identify what makes patterns effective
- Learn from both successes and failures

### 5. Review Generated Components
- Auto-generation is smart but not perfect
- Review and refine generated code
- Feed corrections back to training data

## Troubleshooting

### Neural Network Not Learning

```bash
# Check training data collection
node cli/storybook-mining-campaign-cli.js status

# Manually trigger retraining
node cli/storybook-mining-campaign-cli.js retrain
```

### No Components Generated

```bash
# Check if URLs are being discovered
# Check logs for crawl errors
# Verify auto-generation is enabled in config
```

### Low Quality Predictions

```bash
# Need more training data
# Adjust quality thresholds
# Review and correct false positives
```

## Advanced Usage

### Custom Neural Network Architecture

```javascript
const campaign = new StorybookMiningCampaign({
  neuralConfig: {
    architecture: 'custom',
    layers: [
      { type: 'conv2d', filters: 32, kernelSize: 3 },
      { type: 'maxPooling2d', poolSize: 2 },
      { type: 'lstm', units: 128 },
      { type: 'dense', units: 64, activation: 'relu' },
      { type: 'dense', units: 1, activation: 'sigmoid' },
    ],
  },
});
```

### Custom Pattern Filters

```javascript
const patterns = await analyzePatterns(components, {
  filters: {
    minQuality: 0.8,
    minFrequency: 3,
    categories: ['layout', 'typography', 'color'],
  },
});
```

### Export Training Data

```javascript
// Export for external ML tools
const trainingData = await campaign.exportTrainingData({
  format: 'tfjs',  // or 'csv', 'json'
  includeMetadata: true,
});
```

## Integration with Existing RAG Components

The mined components complement your existing RAG UI components:

```tsx
// Use mined components alongside RAG components
import { BotReplyBox } from '@/components/atoms/rag';
import { MaterialButton } from '@/components/atoms/mined';

<BotReplyBox status="success" content="Found great design patterns!">
  <MaterialButton variant="contained" onClick={handleAction}>
    View Patterns
  </MaterialButton>
</BotReplyBox>
```

## Next Steps

1. **Start Your First Campaign**
   ```bash
   node cli/storybook-mining-campaign-cli.js start --name "first-campaign"
   ```

2. **Monitor Progress**
   - Watch the console for real-time updates
   - Check `src/components/atoms/mined/` for generated components

3. **Review Generated Components**
   - Open generated `.tsx` and `.stories.tsx` files
   - Test in your Storybook

4. **Let It Learn**
   - The longer it runs, the smarter it gets
   - Feed back quality assessments
   - Watch accuracy improve

## Support

For issues or questions:
- Check logs for detailed error messages
- Review database tables for campaign status
- Check neural network metrics for learning progress

## Contributing

To improve the system:
1. Add new pattern detection algorithms
2. Enhance component generation templates
3. Improve neural network architecture
4. Add more UX pattern categories

---

**🚀 Ready to mine the web for design patterns!**

The system is production-ready with:
- ✅ Neural network integration
- ✅ Intelligent crawling
- ✅ Pattern analysis (similarities/differences)
- ✅ Auto-component generation
- ✅ Screenshot capture (required)
- ✅ UX pattern mining (required)
- ✅ Continuous learning
- ✅ Comprehensive CLI
- ✅ Full documentation
