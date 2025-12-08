# Demo and Storybook System Guide

## Overview

The LightDom platform includes a comprehensive demo and component documentation system powered by Storybook. This guide explains how to create, run, and maintain demos using our design system components.

## 📚 Table of Contents

1. [Quick Start](#quick-start)
2. [Running Storybook](#running-storybook)
3. [Creating Demos](#creating-demos)
4. [User Story Tests](#user-story-tests)
5. [Demo Verification](#demo-verification)
6. [Best Practices](#best-practices)
7. [Integration with Services](#integration-with-services)

## 🚀 Quick Start

### Start Storybook

```bash
# Standard way
npm run storybook

# As a managed service
npm run storybook:service start

# Check health
npm run storybook:service health
```

Storybook will be available at http://localhost:6006

### Verify Existing Demos

```bash
# Verify all demo files
npm run demo:verify

# List all demos
npm run demo:list
```

## 🎨 Running Storybook

### Manual Start

```bash
npm run storybook
```

This starts Storybook on port 6006 and opens your browser automatically.

### Managed Service

The Storybook service manager provides additional features:

```bash
# Start with health monitoring
node scripts/storybook-service.js start

# Stop the service
node scripts/storybook-service.js stop

# Restart
node scripts/storybook-service.js restart

# Check health
node scripts/storybook-service.js health
```

### Build for Production

```bash
# Build static Storybook
npm run storybook:build

# Serve the built version
npm run storybook:serve
```

## 🛠️ Creating Demos

### Using the DemoTemplate Component

The easiest way to create a demo is using our `DemoTemplate` component:

```tsx
import { DemoTemplate } from '@/components/demo/DemoTemplate';
import { Card, CardContent, KpiGrid, KpiCard } from '@/components/ui';

export const MyFeatureDemo = () => {
  return (
    <DemoTemplate
      title="My Feature"
      description="Demonstrates my feature with design system components"
      onStart={() => console.log('Demo started')}
    >
      {/* Your demo content */}
      <Card variant="elevated">
        <CardContent>
          <p>Demo content goes here</p>
        </CardContent>
      </Card>
    </DemoTemplate>
  );
};
```

### Creating a Storybook Story

Stories are written in TypeScript/TSX files with `.stories.tsx` extension:

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { MyComponent } from './MyComponent';

const meta: Meta<typeof MyComponent> = {
  title: 'Category/MyComponent',
  component: MyComponent,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof MyComponent>;

export const Default: Story = {
  args: {
    // Component props
  },
};

export const Variant: Story = {
  args: {
    // Different props
  },
};
```

### Story Organization

Stories are organized in the following structure:

```
src/
├── stories/
│   ├── atoms/          # Atomic components (Button, Input, Badge)
│   ├── admin/          # Admin-specific stories
│   ├── user-stories/   # User story interaction tests
│   └── Configure.mdx   # Configuration documentation
├── components/
│   ├── ui/             # Design system components
│   ├── demo/           # Demo templates and utilities
│   └── *.stories.tsx   # Component-specific stories
```

## ✅ User Story Tests

User stories in Storybook use the `@storybook/addon-interactions` for testing user workflows.

### Basic User Story Test

```tsx
import { within, userEvent, expect } from '@storybook/test';

export const UserCanSubmitForm: Story = {
  args: {
    // Story args
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // Step 1: Find input
    const input = canvas.getByLabelText(/email/i);
    
    // Step 2: Type value
    await userEvent.type(input, 'user@example.com');
    
    // Step 3: Submit
    const button = canvas.getByRole('button', { name: /submit/i });
    await userEvent.click(button);
    
    // Step 4: Verify result
    expect(input).toHaveValue('user@example.com');
  },
};
```

### User Story Format

Follow this format for user story tests:

```tsx
/**
 * User Story: [Title]
 * 
 * As a [role]
 * I want to [action]
 * So that [benefit]
 */
export const StoryName: Story = {
  args: { /* ... */ },
  play: async ({ canvasElement }) => {
    // Test implementation
  },
};
```

### Example User Stories

See `src/stories/user-stories/ButtonInteractions.stories.tsx` for examples.

## 🔍 Demo Verification

The demo verification system checks all demo files for common issues.

### Run Verification

```bash
npm run demo:verify
```

### What It Checks

- ✅ ES Module compatibility (no `require()` in `.js` files)
- ✅ Design system component usage
- ✅ Documentation and JSDoc comments
- ✅ Error handling in async functions
- ✅ Environment variable usage (no hardcoded URLs)
- ✅ Logging practices (avoid excessive console.log)

### Verification Output

```
📊 Verifying demos...

✅ PASS: demo-client-zone.js
⚠️  Warnings:
   • Uses hardcoded URLs - consider using environment variables

❌ FAIL: demo-styleguide-generator.js
   Issues:
     • Uses require() in ES module context - should use import
```

### Fixing Common Issues

#### ES Module Issue

❌ **Wrong:**
```javascript
const fetch = require('node-fetch');
```

✅ **Correct:**
```javascript
// Node.js 18+ has built-in fetch
// No import needed
```

#### Hardcoded URLs

❌ **Wrong:**
```javascript
const API_URL = 'http://localhost:3001';
```

✅ **Correct:**
```javascript
const API_URL = process.env.API_URL || 'http://localhost:3001';
```

## 📖 Best Practices

### 1. Use Design System Components

Always use components from `@/components/ui`:

```tsx
// ✅ Good
import { Button, Card, Input } from '@/components/ui';

// ❌ Avoid
import { Button } from 'antd';
```

### 2. Follow Material Design 3

- Use semantic color tokens (`primary`, `surface`, `on-surface`)
- Follow spacing guidelines (4px grid)
- Use proper elevation levels
- Implement responsive layouts

### 3. Make Demos Interactive

```tsx
const [count, setCount] = useState(0);

<DemoTemplate
  title="Interactive Counter"
  description="Click to increment"
  onStart={() => setCount(0)}
>
  <Button onClick={() => setCount(c => c + 1)}>
    Count: {count}
  </Button>
</DemoTemplate>
```

### 4. Document Your Demos

Add clear JSDoc comments:

```tsx
/**
 * Dashboard Metrics Demo
 * 
 * Demonstrates how to use KPI cards to display metrics
 * with proper theming and interactivity.
 * 
 * @features
 * - Real-time metric updates
 * - Material Design 3 theming
 * - Responsive grid layout
 */
export const DashboardMetricsDemo = () => {
  // ...
};
```

### 5. Test Accessibility

Use Storybook's a11y addon to test accessibility:

- All interactive elements should be keyboard accessible
- Use proper ARIA labels
- Ensure sufficient color contrast
- Test with screen readers

## 🔌 Integration with Services

### Starting Storybook with Other Services

Storybook can be started automatically with other platform services.

#### In start-lightdom-complete.js

```javascript
import { StorybookService } from './scripts/storybook-service.js';

const storybookService = new StorybookService({ port: 6006 });

// Start Storybook
await storybookService.start();
await storybookService.waitForHealth();

// Enable health monitoring
storybookService.startHealthMonitoring();
```

#### In Docker Compose

```yaml
services:
  storybook:
    build:
      context: .
      dockerfile: Dockerfile
    command: npm run storybook
    ports:
      - "6006:6006"
    volumes:
      - ./src:/app/src
      - ./.storybook:/app/.storybook
    environment:
      - NODE_ENV=development
```

### Health Monitoring

The Storybook service includes automatic health monitoring:

```javascript
// Check if Storybook is running
const isHealthy = await storybookService.checkHealth();

if (!isHealthy) {
  // Auto-restart on failure
  await storybookService.restart();
}
```

## 📝 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run storybook` | Start Storybook dev server |
| `npm run storybook:build` | Build static Storybook |
| `npm run storybook:serve` | Serve built Storybook |
| `npm run storybook:service` | Manage Storybook as a service |
| `npm run demo:verify` | Verify all demo files |
| `npm run demo:list` | List all demo files |
| `npm run styleguide:generate` | Generate components from styleguide |

## 🐛 Troubleshooting

### Storybook Won't Start

1. **Check if port 6006 is already in use:**
   ```bash
   lsof -i :6006
   ```

2. **Clear Storybook cache:**
   ```bash
   rm -rf node_modules/.cache/storybook
   ```

3. **Reinstall dependencies:**
   ```bash
   npm install
   ```

### Stories Not Showing Up

1. **Check story file location** - should be in `src/` or match patterns in `.storybook/main.ts`
2. **Verify file extension** - should be `.stories.tsx` or `.stories.ts`
3. **Check export** - must have default export and named story exports

### Build Failures

1. **Type errors** - run `npm run type-check`
2. **Missing dependencies** - run `npm install`
3. **Import errors** - verify path aliases in `tsconfig.json`

## 🔗 Related Documentation

- [Design System README](./DESIGN_SYSTEM_README.md)
- [Component Library Docs](./COMPONENT_LIBRARY_DOCS.md)
- [Storybook Setup Guide](./STORYBOOK_SETUP_GUIDE.md)
- [Comprehensive Storybook Guide](./COMPREHENSIVE_STORYBOOK_GUIDE.md)

## 💡 Examples

### Complete Demo Examples

1. **KPI Dashboard Demo** - `src/components/demo/DemoTemplate.stories.tsx`
2. **User Story Tests** - `src/stories/user-stories/ButtonInteractions.stories.tsx`
3. **Design System Showcase** - `frontend/src/pages/DesignSystemShowcasePage.tsx`

### Demo Files

- `demo-client-zone.js` - Client dashboard integration
- `demo-styleguide-generator.js` - Styleguide to component generation
- `demo-design-system-enhancement.js` - Design system features

## 🚀 Next Steps

1. Start Storybook: `npm run storybook`
2. Browse existing stories at http://localhost:6006
3. Create your first story using `DemoTemplate`
4. Add user story tests for critical flows
5. Run `npm run demo:verify` to ensure quality

---

**Need Help?** Check the [Comprehensive Storybook Guide](./COMPREHENSIVE_STORYBOOK_GUIDE.md) for advanced patterns and techniques.
