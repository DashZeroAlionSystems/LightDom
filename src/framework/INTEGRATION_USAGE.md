# Service Integration Usage Guide

## Quick Start

```typescript
import { LightDomFramework, serviceIntegration, integrateServices } from './framework';

// Initialize framework with integrated services
async function startIntegratedFramework() {
  // Create framework instance
  const framework = new LightDomFramework({
    name: 'LightDom Integrated',
    enableSimulation: true
  });

  // Integrate all services
  await integrateServices(framework);

  // Start framework
  await framework.start();
  
  // Now all services are available
  const { slotSystem, miningService, blockchainService } = framework.services;
}
```

## Using Integrated Services

### 1. Slot-Based Optimization

```typescript
// The framework now uses slot optimization automatically
const result = await framework.optimizeURL('https://example.com');

// Result includes slot optimization data
console.log(result.slot.slotsOptimized);
console.log(result.slot.spaceSavedBySlot);
```

### 2. Blockchain Mining

```typescript
// Mining is now integrated with real blockchain service
const miningResult = await framework.services.miningService.mineOptimizations([
  result.standard,
  result.slot
]);

// Automatically submitted to blockchain
console.log('Transaction:', miningResult.txHash);
console.log('Block reward:', miningResult.reward);
```

### 3. Gamification

```typescript
// Users earn points and achievements automatically
framework.services.gamification.on('levelUp', (data) => {
  console.log(`User ${data.userId} reached level ${data.level}!`);
});

framework.services.gamification.on('achievement', (achievement) => {
  // Animation plays automatically
  console.log(`Achievement unlocked: ${achievement.name}`);
});
```

### 4. Analytics Dashboard

```typescript
// Get comprehensive analytics
const dashboard = await serviceIntegration.getAnalyticsDashboard();

console.log('Optimization Stats:', dashboard.optimizationStats);
console.log('Mining Stats:', dashboard.miningStats);
console.log('Revenue:', dashboard.revenueStats);
```

### 5. Authentication & Payments

```typescript
// WebAuthn integration
const authResult = await framework.services.authService.authenticate(userId);

// Process premium subscription
if (authResult.success) {
  const payment = await serviceIntegration.processPayment(
    userId,
    'premium'
  );
  console.log('Subscription active:', payment.subscriptionId);
}
```

## UI Integration

```typescript
import { MonitoringDashboard } from './framework';
import { designSystem } from './framework/ServiceIntegration';

// Dashboard now uses design system
<MonitoringDashboard 
  theme={designSystem}
  services={framework.services}
/>
```

## Advanced Features

### Custom Workflow

```typescript
// Use Cursor + n8n integration
const workflow = await framework.services.cursorN8nService.createWorkflow({
  name: 'Auto-Optimize Sites',
  triggers: ['schedule'],
  actions: [
    'crawl_site',
    'optimize_dom',
    'mine_block',
    'distribute_rewards'
  ]
});

await workflow.execute();
```

### Metaverse Animation

```typescript
// Trigger animations on optimization
framework.on('optimization:complete', async (result) => {
  await framework.services.animationService.playOptimizationEffect({
    spaceSaved: result.spaceSaved,
    position: result.metaversePosition
  });
});
```

## Benefits

1. **No Code Duplication** - Single implementation for each feature
2. **Better Performance** - Services are optimized and cached
3. **More Features** - Slot optimization, gamification, animations
4. **Real Blockchain** - Actual on-chain transactions
5. **Professional UI** - Material design system applied
6. **Analytics** - Comprehensive tracking and insights

## Migration Guide

### From Old Framework

```typescript
// Old way
const framework = new LightDomFramework();
await framework.optimize(url); // Limited features

// New way
const framework = new LightDomFramework();
await integrateServices(framework);
await framework.optimize(url); // Full features
```

### Service Access

```typescript
// All services available via
framework.services.slotSystem
framework.services.miningService
framework.services.blockchainService
framework.services.gamification
framework.services.animationService
// ... and more
```

## Error Handling

```typescript
serviceIntegration.on('error', (error) => {
  console.error('Service error:', error);
});

serviceIntegration.on('initialized', (services) => {
  console.log('All services ready:', Object.keys(services));
});
```

## Cleanup

```typescript
// Proper shutdown
await framework.stop();
await serviceIntegration.shutdown();
```

The integrated framework is now much more powerful while being easier to use!
