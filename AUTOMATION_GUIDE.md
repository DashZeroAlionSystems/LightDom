# Automation Guide

Complete guide for using the advanced automation, campaign management, and intelligent navigation systems.

## Table of Contents

- [Campaign Management](#campaign-management)
- [Smart Navigation](#smart-navigation)
- [SEO Mining](#seo-mining)
- [Anime.js Fluid Design](#animejs-fluid-design)
- [Complete Workflows](#complete-workflows)
- [Configuration](#configuration)
- [Best Practices](#best-practices)

## Campaign Management

The Campaign Management Service orchestrates multiple data mining campaigns with resource allocation and goal tracking.

### Creating a Campaign

```javascript
import { CampaignManagementService, CAMPAIGN_TYPES } from './services/campaign-management-service.js';

const campaignMgr = new CampaignManagementService({ db });

const campaign = await campaignMgr.createCampaign({
  name: 'Q4 2024 Storybook Discovery',
  type: CAMPAIGN_TYPES.STORYBOOK_DISCOVERY,
  priority: 8, // 1-10, higher = more important
  
  goals: {
    minComponents: 10000,
    quality: 0.9,
  },
  
  resources: {
    maxWorkers: 8,
    maxCPUPercent: 50,
    maxMemoryMB: 4096,
  },
  
  configuration: {
    maxSeeds: 1000,
    discover: true,
    depth: 3,
  },
});

console.log('Campaign created:', campaign.id);
```

### Executing a Campaign

```javascript
// Execute campaign
const result = await campaignMgr.executeCampaign(campaign.id);

if (result.success) {
  console.log('Campaign completed!');
  console.log('Items processed:', campaign.metrics.itemsProcessed);
  console.log('Goals achieved:', result.goalsAchieved);
}
```

### Monitoring Campaigns

```javascript
// Get campaign status
const status = campaignMgr.getCampaign(campaign.id);
console.log('Progress:', status.metrics.progressPercent + '%');

// Listen for events
campaignMgr.on('campaign:progress', (campaign) => {
  console.log(`${campaign.name}: ${campaign.metrics.progressPercent}%`);
});

// Get system metrics
const metrics = campaignMgr.getMetrics();
console.log('Active campaigns:', metrics.activeCampaigns);
console.log('Resource utilization:', metrics.resourceUtilization);
```

### Campaign Types

1. **Storybook Discovery**: Mine component libraries from the web
2. **Code Analysis**: Index and analyze codebase
3. **SEO Mining**: Extract SEO attributes from websites
4. **Training Data**: Generate ML training data
5. **Component Mining**: Deep extraction of UI components
6. **Relationship Analysis**: Analyze code relationships

### Managing Multiple Campaigns

```javascript
// Create multiple campaigns with dependencies
const campaign1 = await campaignMgr.createCampaign({
  name: 'Index Codebase',
  type: CAMPAIGN_TYPES.CODE_ANALYSIS,
  priority: 10,
});

const campaign2 = await campaignMgr.createCampaign({
  name: 'Fix Issues',
  type: CAMPAIGN_TYPES.CODE_ANALYSIS,
  priority: 9,
  dependencies: [campaign1.id], // Wait for campaign1
});

// Campaigns execute in order based on dependencies and priority
```

### CLI Usage

```bash
# Create campaign
node scripts/manage-campaigns.js create \
  --type storybook_discovery \
  --name "My Campaign" \
  --goal "minComponents:10000" \
  --workers 8 \
  --priority 8

# List campaigns
node scripts/manage-campaigns.js list

# Get status
node scripts/manage-campaigns.js status <campaign-id>

# Pause campaign
node scripts/manage-campaigns.js pause <campaign-id>

# Resume campaign
node scripts/manage-campaigns.js resume <campaign-id>

# Cancel campaign
node scripts/manage-campaigns.js cancel <campaign-id>
```

## Smart Navigation

The Smart Navigation System uses AI to decide the best workflows based on current context.

### AI-Powered Workflow Decisions

```javascript
import { SmartNavigationSystem } from './services/smart-navigation-system.js';

const nav = new SmartNavigationSystem({ 
  db, 
  aiService: deepseekService,
});

// Let AI decide the best workflow
const workflow = await nav.decideWorkflow({
  goal: 'improve_codebase_quality',
  context: {
    issues: 50,
    coverage: 0.6,
    complexity: 8,
  },
  constraints: {
    maxDuration: 3600000, // 1 hour
    autoFix: true,
  },
});

console.log('Workflow:', workflow);
// → { steps: [
//     { type: 'index', name: 'Index Codebase' },
//     { type: 'analyze', name: 'Analyze Code' },
//     { type: 'fix', name: 'Generate Fixes', maxFixes: 10 },
//     { type: 'test', name: 'Run Tests' },
//     { type: 'commit', name: 'Commit Changes' },
//     { type: 'pr', name: 'Create Pull Request' },
//   ]}
```

### Executing Workflows

```javascript
// Execute the workflow
const result = await nav.executeWorkflow(workflow);

if (result.success) {
  console.log('Workflow completed!');
  console.log('Duration:', result.duration + 'ms');
  console.log('Results:', result.results);
}
```

### Automation Rules

```javascript
// Add automation rule
nav.addAutomationRule({
  trigger: 'issue:detected',
  condition: { field: 'severity', operator: '>=', value: 8 },
  action: {
    type: 'fix',
    name: 'Auto-fix High Severity Issues',
    maxFixes: 5,
  },
});

// Check rules on events
nav.checkAutomationRules({
  type: 'issue:detected',
  data: { severity: 9, category: 'security' },
});
// → Automatically triggers fix action
```

### Common Workflows

**Improve Codebase Quality**:
- Index codebase
- Analyze relationships
- Fix high-priority issues
- Run tests
- Commit and create PR

**Fix Bugs**:
- Analyze for bugs
- Generate fixes
- Verify fixes with tests
- Commit changes

**Optimize Performance**:
- Index with performance metrics
- Identify bottlenecks
- Generate optimizations
- Benchmark improvements

### CLI Usage

```bash
# Analyze and decide workflow
node scripts/smart-navigate.js analyze --goal improve_codebase_quality

# Execute workflow
node scripts/smart-navigate.js execute --workflow workflow.json

# Add automation rule
node scripts/smart-navigate.js add-rule \
  --trigger issue:detected \
  --condition "severity>=8" \
  --action fix
```

## SEO Mining

Extract SEO attributes, schema markup, and generate training data for ML models.

### Analyze a Page

```javascript
import { SEOMiningService } from './services/seo-mining-service.js';

const seoMiner = new SEOMiningService({ db });

const analysis = await seoMiner.analyzePage('https://example.com/product');

console.log('SEO Score:', analysis.score + '/100');
console.log('Schemas found:', analysis.schemas.map(s => s.type));
console.log('Suggestions:', analysis.suggestions);

// Result:
// SEO Score: 85/100
// Schemas found: ['Product', 'Review', 'Organization']
// Suggestions: [
//   { priority: 'medium', message: 'Add breadcrumb schema', impact: 'Improves navigation' },
//   { priority: 'low', message: 'Add canonical URL', impact: 'Prevents duplicate content' },
// ]
```

### Extract Attribute Rules

```javascript
// Extract patterns from multiple pages
const urls = [
  'https://example.com/product1',
  'https://example.com/product2',
  'https://example.com/article',
];

const rules = await seoMiner.extractAttributeRules(urls);

console.log('Extracted', rules.length, 'rules');
// Each rule contains:
// - schemaType: 'Product'
// - selector: '[itemtype*="Product"]'
// - attributes: ['name', 'price', 'image']
// - example: { name: 'Product Name', price: '19.99', ... }
```

### Competitor Analysis

```javascript
const competitor = await seoMiner.analyzeCompetitor(
  'https://competitor.com/product',
  'best running shoes'
);

console.log('Competitor Score:', competitor.seoScore);
console.log('Their schemas:', competitor.schemas);
console.log('Opportunities:', competitor.opportunities);
```

### Export Training Data

```javascript
// Export for ML training
const trainingData = await seoMiner.exportTrainingData('jsonl');

await fs.writeFile('seo_training.jsonl', trainingData);
```

### CLI Usage

```bash
# Analyze page
node scripts/seo-mine.js analyze --url https://example.com

# Analyze multiple URLs
node scripts/seo-mine.js analyze --urls urls.txt

# Extract rules
node scripts/seo-mine.js extract-rules \
  --urls urls.txt \
  --output seo_rules.jsonl

# Competitor analysis
node scripts/seo-mine.js competitor \
  --url https://competitor.com \
  --query "best product"

# Export training data
node scripts/seo-mine.js export --output training.jsonl
```

## Anime.js Fluid Design

Generate animated UI components with Storybook documentation.

### Generate Animated Component

```javascript
import { AnimejsFluidDesignService, ANIMATION_TYPES, COMPONENT_TYPES } from './services/animejs-fluid-design-service.js';

const designer = new AnimejsFluidDesignService();

const component = await designer.generateFluidComponent({
  type: COMPONENT_TYPES.BUTTON,
  animation: ANIMATION_TYPES.HOVER,
  framework: 'react',
  responsive: true,
});

console.log('Component code:', component.code);
console.log('Styles:', component.styles);
console.log('Story:', component.story);
```

### Generate Complete Storybook

```javascript
const storybook = await designer.generateAnimatedStorybook({
  components: ['button', 'card', 'modal', 'dropdown'],
  animations: ['fadeIn', 'slideIn', 'hover', 'click'],
  frameworks: ['react', 'vue'],
});

console.log('Storybook generated at:', storybook.outputPath);
console.log('Components created:', storybook.components.length);

// Run Storybook
// cd to storybook.outputPath
// npm install
// npm run storybook
```

### Animation Types

**Entrance Animations**:
- `fadeIn`: Fade in from transparent
- `slideIn`: Slide in from left
- `zoomIn`: Zoom in from small
- `bounceIn`: Bounce in effect
- `rotateIn`: Rotate while fading in

**Interaction Animations**:
- `hover`: Scale on hover
- `click`: Scale pulse on click
- `drag`: Follow mouse dragging

**Morphing Animations**:
- `morphShape`: Morph border radius
- `morphColor`: Cycle through colors
- `morphSize`: Scale in loop

**Complex Animations**:
- `stagger`: Staggered entrance for lists
- `sequential`: Sequential animations
- `timeline`: Custom timeline

### CLI Usage

```bash
# Generate single component
node scripts/animate-components.js generate \
  --type button \
  --animation hover \
  --framework react

# Generate multiple components
node scripts/animate-components.js generate \
  --types button,card,modal \
  --animations fadeIn,hover \
  --frameworks react,vue

# Generate complete Storybook
node scripts/animate-components.js storybook \
  --components all \
  --animations entrance,interaction \
  --output ./my-storybook

# List available animations
node scripts/animate-components.js list-animations

# List available components
node scripts/animate-components.js list-components
```

## Complete Workflows

### End-to-End Storybook Mining & Generation

```bash
# Step 1: Create discovery campaign
node scripts/manage-campaigns.js create \
  --type storybook_discovery \
  --goal "minComponents:10000" \
  --workers 8 \
  --priority 10

# Step 2: Monitor progress
watch node scripts/manage-campaigns.js status <campaign-id>

# Step 3: Generate animated components from mined data
node scripts/animate-components.js generate \
  --input mined_components.json \
  --animations all \
  --framework react

# Step 4: Create Storybook
node scripts/animate-components.js storybook \
  --input generated_components/ \
  --output ./final-storybook

# Step 5: Install and run
cd final-storybook
npm install
npm run storybook
```

### AI-Powered Development Loop

```bash
# Step 1: Start all services
node scripts/start-system.js

# Step 2: Index codebase
node examples/codebase-indexing-example.js

# Step 3: Let AI analyze and decide
node scripts/smart-navigate.js analyze

# Step 4: Execute recommended workflow
AUTO_FIX=true AUTO_PR=true node scripts/smart-navigate.js execute

# Step 5: Monitor autonomous agent
node examples/autonomous-agent-example.js --auto-fix --auto-pr
```

### ML Model Training Pipeline

```bash
# Step 1: Generate training data (1M simulations)
node scripts/generate-training-data.js \
  --simulations 1000000 \
  --workers 16 \
  --output training_data.jsonl

# Step 2: Mine SEO patterns
node scripts/seo-mine.js extract-rules \
  --urls popular_sites.txt \
  --output seo_rules.jsonl

# Step 3: Combine datasets
cat training_data.jsonl seo_rules.jsonl > combined_training.jsonl

# Step 4: Train TensorFlow model
node scripts/train-tensorflow-model.js \
  --data combined_training.jsonl \
  --epochs 100 \
  --validation-split 0.2

# Step 5: Evaluate model
node scripts/evaluate-model.js --model trained_model.json
```

## Configuration

### Campaign Configuration

```json
{
  "name": "Production Campaign",
  "type": "storybook_discovery",
  "priority": 8,
  "goals": {
    "minComponents": 10000,
    "quality": 0.9,
    "minSchemas": 1000
  },
  "resources": {
    "maxWorkers": 8,
    "maxCPUPercent": 50,
    "maxMemoryMB": 4096
  },
  "configuration": {
    "maxSeeds": 1000,
    "discover": true,
    "depth": 3,
    "timeout": 30000
  }
}
```

### Navigation Configuration

```json
{
  "goal": "improve_codebase_quality",
  "context": {
    "issues": 50,
    "coverage": 0.6,
    "complexity": 8
  },
  "constraints": {
    "maxDuration": 3600000,
    "autoFix": true,
    "maxFixes": 10
  }
}
```

### SEO Mining Configuration

```json
{
  "cacheMaxAge": 3600000,
  "attributeRules": {
    "Product": {
      "name": { "selector": "[itemprop='name']", "attribute": "textContent" },
      "price": { "selector": "[itemprop='price']", "attribute": "content" }
    }
  }
}
```

## Best Practices

### Resource Management

1. **Set Appropriate Limits**: Don't allocate more than 80% of system resources
2. **Use Priorities**: Set campaign priorities based on business value
3. **Monitor Metrics**: Watch resource utilization and adjust
4. **Handle Failures**: Always set goals and rollback strategies

### Workflow Optimization

1. **Cache Results**: Enable caching for repeated operations
2. **Parallel Processing**: Use multiple workers when possible
3. **Incremental Updates**: Process in batches, not all at once
4. **Fail Fast**: Set reasonable timeouts and retry limits

### Data Quality

1. **Validate Inputs**: Check URLs, configurations before processing
2. **Filter Results**: Apply quality thresholds
3. **Deduplicate**: Remove duplicates early in pipeline
4. **Version Control**: Track training data versions

### Automation Safety

1. **Test Rules**: Test automation rules in sandbox first
2. **Set Limits**: Limit auto-fix count and scope
3. **Review Changes**: Always review before merging
4. **Monitor Metrics**: Track success rates and adjust

## Troubleshooting

### Campaign Not Starting

- Check resource availability
- Verify dependencies are met
- Check priority and queue position

### Workflow Execution Failing

- Verify all services are running
- Check step dependencies
- Review error logs

### Low SEO Scores

- Check if page is JavaScript-heavy
- Verify schema markup is valid
- Ensure metadata is complete

### Animation Not Working

- Check Anime.js is imported
- Verify CSS is loaded
- Check browser compatibility

## Support

For issues or questions:
- Check logs in `./logs/`
- Review metrics with `getMetrics()`
- Enable debug mode: `DEBUG=* node script.js`

