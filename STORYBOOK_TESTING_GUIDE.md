# Storybook Integration Guide

## Overview

Storybook is fully integrated with the LightDom platform, providing:
- **Component Development**: Isolated component development environment
- **Visual Testing**: Automated visual regression testing
- **Accessibility Testing**: WCAG compliance checks
- **Interactive Documentation**: Live component documentation
- **Design System**: Centralized component library

## 🚀 Quick Start

### Start Storybook with the App

```bash
# Start entire system (includes Storybook)
npm start

# Or start Storybook standalone
npm run storybook

# Access at http://localhost:6006
```

### View Component Stories

1. Navigate to http://localhost:6006
2. Browse stories in the sidebar:
   - **Design System/Animation Controls** - Interactive animation playground
   - **Product Pages/Product Overview** - Product showcase page
   - **Product Pages/Product Drill-Down** - Feature exploration
   - **Design System/Theme Configurator** - Theme editor

## 🧪 Testing

### Run Storybook Tests

```bash
# Run all story tests
npm run test:storybook

# Watch mode
npm run test:storybook:watch

# With coverage
npm run storybook:test:coverage
```

### What Tests Run

1. **Visual Tests**: Screenshot comparisons
2. **Accessibility Tests**: WCAG 2.0/2.1 AA compliance
3. **Interaction Tests**: User interaction simulations
4. **Component Tests**: Props and state validation

### Test Configuration

Tests are configured in `.storybook/test-runner.ts`:
- Accessibility checks with axe-core
- Custom test timeouts
- Browser configuration
- Tag-based filtering

## 📚 Component Testing

### Testing New Components

When you create a new component, add tests:

```tsx
// src/components/__tests__/MyComponent.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MyComponent } from '../MyComponent';

describe('MyComponent', () => {
  it('renders without crashing', () => {
    render(<MyComponent />);
    expect(screen.getByText(/my component/i)).toBeInTheDocument();
  });

  it('handles user interaction', () => {
    render(<MyComponent />);
    // Add interaction tests
  });
});
```

### Running Component Tests

```bash
# Run all component tests
npm test

# Run specific test file
npm test -- AnimationControls.test.tsx

# Watch mode
npm run test:watch
```

## 🎨 Storybook Features

### 1. Animation Controls

Interactive playground for testing animations:
- 5 demo modes (Product, Data, SVG, Text, Interactive)
- Real-time parameter tuning
- Playback controls
- Live code examples

**Story**: `Design System/Animation Controls`

### 2. Theme Configurator

Visual theme editor:
- 5 preset themes
- Color customization
- Live preview
- Export/Import themes

**Story**: `Design System/Theme Configurator`

### 3. Product Pages

Full product showcase pages:
- Hero animations
- Feature cards
- Tab-based exploration
- Interactive demos

**Stories**:
- `Product Pages/Product Overview`
- `Product Pages/Product Drill-Down`

## 🔧 Advanced Usage

### Storybook Integration CLI

```bash
# Initialize integration
node scripts/storybook-integration.js init

# Start with app
node scripts/storybook-integration.js start

# Check status
node scripts/storybook-integration.js status

# Run tests
node scripts/storybook-integration.js test

# Build static site
node scripts/storybook-integration.js build
```

### Environment Variables

```bash
# Custom port
STORYBOOK_PORT=7007 npm run storybook

# Disable auto-start
STORYBOOK_ENABLED=false npm start

# Disable health monitoring
STORYBOOK_AUTO=false npm start
```

### Build for Production

```bash
# Build static Storybook site
npm run storybook:build

# Serve built site
npm run storybook:serve

# Access at http://localhost:8080
```

## 📖 Writing Stories

### Basic Story

```tsx
// src/components/MyComponent.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { MyComponent } from './MyComponent';

const meta: Meta<typeof MyComponent> = {
  title: 'Components/MyComponent',
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
    label: 'My Component',
  },
};

export const WithAnimation: Story = {
  args: {
    label: 'Animated',
    animated: true,
  },
};
```

### Story with Interactions

```tsx
import { userEvent, within } from '@storybook/testing-library';
import { expect } from '@storybook/jest';

export const InteractiveStory: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // Click button
    await userEvent.click(canvas.getByRole('button'));
    
    // Assert result
    await expect(canvas.getByText('Clicked')).toBeInTheDocument();
  },
};
```

## 🎯 Best Practices

### 1. Component Organization

```
src/components/
├── MyComponent/
│   ├── MyComponent.tsx
│   ├── MyComponent.stories.tsx
│   ├── MyComponent.test.tsx
│   └── index.ts
```

### 2. Story Naming

- Use descriptive story names
- Group related stories
- Include states (Default, Loading, Error, etc.)

### 3. Documentation

- Add component descriptions
- Document props with JSDoc
- Include usage examples
- Add accessibility notes

### 4. Testing Strategy

- Test all interactive states
- Verify accessibility
- Check responsive behavior
- Test edge cases

## 🐛 Troubleshooting

### Storybook Won't Start

```bash
# Check port availability
lsof -i :6006

# Kill existing process
kill -9 $(lsof -t -i:6006)

# Clear cache
rm -rf node_modules/.cache

# Reinstall dependencies
npm install
```

### Tests Failing

```bash
# Update snapshots
npm run test:storybook -- --updateSnapshots

# Run with verbose output
npm run test:storybook -- --verbose

# Check specific story
npm run test:storybook -- --grep "MyComponent"
```

### Build Issues

```bash
# Clear build cache
rm -rf storybook-static

# Rebuild
npm run storybook:build

# Check for TypeScript errors
npm run type-check
```

## 📊 Monitoring

### Health Checks

Storybook includes health monitoring:
- Automatic restart on failure
- Health check every 60 seconds
- Status logging
- Graceful shutdown

Check health:
```bash
node scripts/storybook-integration.js status
```

### Logs

View Storybook logs:
```bash
# During startup
npm start | grep "Storybook"

# Service logs
node scripts/storybook-service.js start
```

## 🔗 Resources

- **Storybook Documentation**: https://storybook.js.org/docs
- **Testing Handbook**: https://storybook.js.org/tutorials/ui-testing-handbook/
- **Accessibility Guide**: https://storybook.js.org/docs/react/writing-tests/accessibility-testing
- **Component Tests**: `src/components/__tests__/`

## 📝 Component Test Examples

### AnimationControls Tests

Located in `src/components/__tests__/AnimationControls.test.tsx`:
- Rendering tests
- Playback control tests
- Parameter adjustment tests
- Accessibility tests

### ThemeConfigurator Tests

Located in `src/components/__tests__/ThemeConfigurator.test.tsx`:
- Theme selection tests
- Color customization tests
- Export/Import tests
- Live preview tests

## 🎓 Learning Path

1. **Start Here**: Run `npm run storybook` and explore existing stories
2. **Read Stories**: Check `src/components/*.stories.tsx` files
3. **Write Tests**: Add tests in `src/components/__tests__/`
4. **Run Tests**: Use `npm run test:storybook`
5. **Build**: Deploy with `npm run storybook:build`

## 🚀 Next Steps

1. Explore animation stories for inspiration
2. Create stories for your components
3. Add interaction tests
4. Run accessibility checks
5. Build and deploy your component library

---

**Need Help?**
- Check existing stories for examples
- Read the test files for patterns
- Review the Storybook docs
- Ask the team for guidance
