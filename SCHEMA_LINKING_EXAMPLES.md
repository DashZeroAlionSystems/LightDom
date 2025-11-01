# Schema Linking Service - Example Usage Guide

This document provides practical examples of using the Schema Linking Service in the LightDom platform.

## Quick Start

### 1. Run the Demo

The fastest way to see the service in action:

```bash
npm run schema:link:demo
```

This demonstrates:
- Schema analysis with mock data
- Relationship discovery
- Feature grouping
- Dashboard generation
- Workflow creation
- Export functionality

### 2. Analyze Live Database

When your PostgreSQL database is running:

```bash
# Run analysis once
npm run schema:link

# Start automated runner (runs every hour)
npm run schema:link:start
```

### 3. Access via API

When the API server is running on port 3001:

```bash
# Get all features
npm run schema:link:features

# Get full analysis
npm run schema:link:analyze
```

## Example Workflows

### Example 1: Discover Table Relationships

```javascript
import SchemaLinkingService from './services/schema-linking-service.js';

const service = new SchemaLinkingService();

// Analyze the database
const result = await service.analyzeDatabaseSchema();

console.log(`Found ${result.relationships} relationships`);

// Get all foreign key relationships
const foreignKeys = Array.from(service.schemaLinks.values())
  .filter(link => link.type === 'foreign_key');

foreignKeys.forEach(fk => {
  console.log(`${fk.source.table}.${fk.source.column} → ${fk.target.table}.${fk.target.column}`);
});

await service.close();
```

Output:
```
Found 15 relationships
optimizations.user_id → users.id
seo_clients.user_id → users.id
seo_analytics.client_id → seo_clients.id
```

### Example 2: Generate Feature Dashboards

```javascript
import SchemaLinkingService from './services/schema-linking-service.js';

const service = new SchemaLinkingService();
await service.analyzeDatabaseSchema();

// Get the SEO feature
const seoSchema = service.generateLinkedSchemaMap('seo');

console.log(`Feature: ${seoSchema.feature}`);
console.log(`Dashboards: ${seoSchema.dashboards.length}`);

// Use dashboards in your application
for (const dashboard of seoSchema.dashboards) {
  console.log(`\nDashboard: ${dashboard.name}`);
  console.log(`Table: ${dashboard.table}`);
  console.log(`Components: ${dashboard.components.length}`);
  
  // Render each component
  for (const component of dashboard.components) {
    renderComponent(component);
  }
}

await service.close();

function renderComponent(component) {
  console.log(`  - ${component.label} (${component.type})`);
  // In a real app, this would render UI components
}
```

Output:
```
Feature: seo
Dashboards: 2

Dashboard: Seo Clients Configuration
Table: seo_clients
Components: 7
  - User Id (uuid-display)
  - Domain (input)
  - Api Key (input)
  - Subscription Tier (input)
  - Status (input)
  - Config (json-editor)
  - Settings (json-editor)

Dashboard: Seo Analytics Configuration
Table: seo_analytics
Components: 6
  - Client Id (uuid-display)
  - Url (textarea)
  - Seo Score (number)
  - Performance Score (number)
  - Optimization Applied (json-editor)
```

### Example 3: Create Automated Workflow

```javascript
import SchemaLinkingService from './services/schema-linking-service.js';

const service = new SchemaLinkingService();
await service.analyzeDatabaseSchema();

// Get workflow for user feature
const userSchema = service.generateLinkedSchemaMap('user');
const workflow = userSchema.workflows;

console.log(`Workflow: ${workflow.name}`);
console.log(`Steps: ${workflow.steps.length}`);

// Execute workflow
for (const step of workflow.steps) {
  console.log(`\nExecuting step: ${step.id}`);
  console.log(`  Action: ${step.action} on ${step.table}`);
  console.log(`  Fields: ${step.fields.join(', ')}`);
  
  // In a real app, this would execute the workflow step
  await executeWorkflowStep(step);
}

await service.close();

async function executeWorkflowStep(step) {
  // Implementation would configure the table based on step.fields
  console.log(`  ✓ Configured ${step.table}`);
}
```

Output:
```
Workflow: User Configuration Workflow
Steps: 1

Executing step: step-0
  Action: configure on users
  Fields: wallet_address, username, email, reputation_score
  ✓ Configured users
```

### Example 4: Export Schemas for External Use

```javascript
import SchemaLinkingService from './services/schema-linking-service.js';

const service = new SchemaLinkingService();
await service.analyzeDatabaseSchema();

// Export all schemas
const outputPath = './my-linked-schemas.json';
const exportData = await service.exportLinkedSchemas(outputPath);

console.log('Export complete!');
console.log(`  Tables: ${exportData.metadata.totalTables}`);
console.log(`  Relationships: ${exportData.metadata.totalRelationships}`);
console.log(`  Features: ${exportData.metadata.totalFeatures}`);
console.log(`  File: ${outputPath}`);

// Use exported data
const schemas = JSON.parse(require('fs').readFileSync(outputPath, 'utf8'));

// Share with team
uploadToS3(outputPath);
sendToSlack(`New schemas exported: ${schemas.metadata.totalFeatures} features`);

await service.close();
```

Output:
```
Export complete!
  Tables: 25
  Relationships: 42
  Features: 12
  File: ./my-linked-schemas.json
```

### Example 5: API Integration

```javascript
// In your Express.js application
import express from 'express';
import schemaLinkingRoutes from './services/schema-linking-routes.js';

const app = express();

// Register schema linking routes
app.use('/api/schema-linking', schemaLinkingRoutes);

// Use in your routes
app.get('/admin/features', async (req, res) => {
  // This proxies to the schema linking API
  const response = await fetch('http://localhost:3001/api/schema-linking/features');
  const data = await response.json();
  
  res.render('admin/features', {
    features: data.data.features
  });
});

app.listen(3000);
```

Then access via HTTP:

```bash
# Get all features
curl http://localhost:3001/api/schema-linking/features

# Get specific feature schema
curl http://localhost:3001/api/schema-linking/features/seo

# Get dashboards for a feature
curl http://localhost:3001/api/schema-linking/dashboards/optimization

# Get workflows for a feature
curl http://localhost:3001/api/schema-linking/workflows/user
```

### Example 6: Automated Background Runner

```javascript
import { SchemaLinkingRunner } from './services/schema-linking-runner.js';

// Configure the runner
const runner = new SchemaLinkingRunner({
  runInterval: 3600000, // Run every hour
  outputDir: './data/linked-schemas',
  autoStart: true
});

// Initialize and start
await runner.initialize();

// Monitor progress
runner.service.on('analysis-complete', (result) => {
  console.log('Schema analysis complete!');
  console.log(`  Tables: ${result.tables}`);
  console.log(`  Features: ${result.features}`);
  
  // Send notification
  notifyTeam(`Schema updated with ${result.features} features`);
});

// Keep running
console.log('Runner started. Press Ctrl+C to stop.');

process.on('SIGINT', async () => {
  console.log('\nStopping runner...');
  await runner.stop();
  process.exit(0);
});
```

### Example 7: Custom Feature Analysis

```javascript
import SchemaLinkingService from './services/schema-linking-service.js';

const service = new SchemaLinkingService();
await service.analyzeDatabaseSchema();

// Find features with specific characteristics
const features = Array.from(service.featureInteractions.values());

// Features with settings
const featuresWithSettings = features.filter(f => f.settings.length > 0);
console.log(`Features with settings: ${featuresWithSettings.length}`);

// Features with many tables
const complexFeatures = features.filter(f => f.tables.length > 2);
console.log(`Complex features: ${complexFeatures.length}`);

// Generate dashboards only for features with settings
for (const feature of featuresWithSettings) {
  const schema = service.generateLinkedSchemaMap(feature.name);
  console.log(`\n${feature.name}: ${schema.dashboards.length} dashboards`);
  
  // Use these dashboards in your admin panel
  registerAdminDashboards(schema.dashboards);
}

await service.close();

function registerAdminDashboards(dashboards) {
  // Implementation would add these to your admin interface
  console.log(`  Registered ${dashboards.length} admin dashboards`);
}
```

Output:
```
Features with settings: 3
Complex features: 2

seo: 2 dashboards
  Registered 2 admin dashboards

billing: 1 dashboards
  Registered 1 admin dashboards
```

## Real-World Use Cases

### Use Case 1: Auto-Generate Admin Dashboards

When you add a new database table:

1. Run schema analysis
2. Service automatically discovers the table
3. Generates dashboard configuration
4. Dashboard appears in admin panel automatically

```javascript
// This happens automatically with the runner
const runner = new SchemaLinkingRunner({ autoStart: true });
await runner.initialize();

// New table detected on next cycle
// Dashboard auto-generated
// Admin panel updated
```

### Use Case 2: Document Database Schema

Generate always up-to-date documentation:

```bash
# Run analysis and generate report
npm run schema:link

# Report is in data/linked-schemas/report-{timestamp}.md
cat data/linked-schemas/latest.json | jq '.features'
```

### Use Case 3: Validate Feature Relationships

Ensure database relationships are correct:

```javascript
const service = new SchemaLinkingService();
await service.analyzeDatabaseSchema();

// Check that all user_id columns reference users table
const userRefs = Array.from(service.schemaLinks.values())
  .filter(link => link.source.column === 'user_id');

userRefs.forEach(ref => {
  if (ref.target.table !== 'users') {
    console.warn(`Warning: ${ref.source.table}.user_id does not reference users!`);
  }
});
```

### Use Case 4: Monitor Schema Changes

Detect when schema changes:

```javascript
const runner = new SchemaLinkingRunner();
await runner.initialize();

let lastTableCount = 0;

setInterval(async () => {
  const result = await runner.runLinkingCycle();
  
  if (result.tables !== lastTableCount) {
    console.log('Schema changed!');
    console.log(`  Tables: ${lastTableCount} → ${result.tables}`);
    
    // Send alert
    alertTeam('Database schema has changed!');
    
    lastTableCount = result.tables;
  }
}, 60000); // Check every minute
```

## Tips and Best Practices

### 1. Run Analysis Regularly

Use the automated runner to keep schemas up-to-date:

```bash
# Start the runner as a service
npm run schema:link:start
```

### 2. Version Control Schemas

Commit exported schemas to git:

```bash
npm run schema:link
git add data/linked-schemas/latest.json
git commit -m "Update schema definitions"
```

### 3. Use API for Dynamic Access

Don't parse JSON files directly, use the API:

```javascript
// Good
const response = await fetch('/api/schema-linking/features/seo');
const schema = await response.json();

// Avoid
const schema = JSON.parse(fs.readFileSync('./latest.json'));
```

### 4. Cache Analysis Results

The service caches results in memory. Reuse the same instance:

```javascript
// Good - reuse instance
const service = new SchemaLinkingService();
const result1 = await service.analyzeDatabaseSchema();
const result2 = await service.generateLinkedSchemaMap('seo'); // Uses cached data

// Avoid - creates new instance
for (let i = 0; i < 10; i++) {
  const service = new SchemaLinkingService();
  await service.analyzeDatabaseSchema(); // Analyzes DB each time
}
```

### 5. Handle Missing Features

Check if features exist before using:

```javascript
const schema = service.generateLinkedSchemaMap('unknown-feature');

if (!schema) {
  console.error('Feature not found');
  return;
}

// Use schema safely
const dashboards = schema.dashboards;
```

## Troubleshooting

### Database Connection Failed

```bash
# Check database is running
pg_isready -h localhost -p 5434

# Check credentials
psql -h localhost -p 5434 -U lightdom_user -d lightdom
```

### No Features Found

The service groups tables by naming patterns. If your tables don't follow patterns, they appear as individual features:

```javascript
// Table: user_profiles → Feature: user
// Table: user_settings → Feature: user
// Table: random_table → Feature: random
```

### API Not Responding

Ensure routes are registered:

```javascript
// In api-server-express.js
import schemaLinkingRoutes from './services/schema-linking-routes.js';
app.use('/api/schema-linking', schemaLinkingRoutes);
```

## Next Steps

- Explore the full [Schema Linking README](./services/SCHEMA_LINKING_README.md)
- Check out the [Demo Script](./schema-linking-demo.js)
- Review [Test Cases](./test/schema-linking.test.js)
- Integrate with your admin panel
- Create custom visualizations
