# Storybook Setup & Usage Guide

## Overview

LightDom's Storybook implementation provides a comprehensive design system showcase with Material Design 3 components, animation demos, and component generation capabilities.

## Features

✅ **Material Design 3 Integration**
- Complete design token system
- Animation presets
- Component patterns
- Accessibility compliance

✅ **Animated Components**
- SEO Report demos
- Interactive data visualizations
- Smooth transitions using anime.js and Framer Motion

✅ **Component Generation**
- Generate components from user stories
- Automatic prop extraction
- Story variants
- Pattern application

✅ **Enhanced Theming**
- Dark/Light themes
- Material Design themes
- Motion preferences
- Responsive viewports

## Installation

### Install Dependencies

The project requires several Storybook packages. If they're not installed:

```bash
npm install --save-dev \
  @storybook/addon-docs@^10.0.4 \
  @storybook/addon-onboarding@^10.0.4 \
  @storybook/addon-essentials@^10.0.4 \
  @storybook/addon-interactions@^10.0.4 \
  @storybook/addon-a11y@^10.0.4 \
  @storybook/addon-designs@^10.0.4 \
  @storybook/react-vite@^10.0.4 \
  storybook@^10.0.4
```

### Install Runtime Dependencies

If missing:

```bash
npm install \
  framer-motion@^12.23.24 \
  lucide-react@^0.544.0 \
  animejs@^4.2.2
```

## Running Storybook

Start the Storybook development server:

```bash
npm run storybook
```

This will start Storybook on `http://localhost:6006`

## Building Storybook

Build a static version for deployment:

```bash
npm run build-storybook
```

Serve the built version:

```bash
npm run storybook:serve
```

## Available Stories

### Reports

#### SEO Report Animated Demo
Location: `Reports > SEO Report Animated Demo`

Beautiful animated SEO performance reports for clients:
- Animated metric cards
- Number counters
- Trend indicators
- Interactive effects
- Export/share capabilities

**Variants:**
- Default
- Custom Client
- Monthly Report

### Generated Components

Components generated from user stories appear in the `Generated/` category.

## Component Generation

### From User Stories

Generate components from user stories using the component generator:

```typescript
import { componentGenerator } from '@/config/storybook-component-generator';

const userStory = {
  id: 'us-001',
  title: 'Metric Card',
  description: 'Display key metrics with animations',
  acceptanceCriteria: [
    'Should show metric value',
    'Must animate on entrance',
  ],
  componentType: 'card',
};

// Generate component template
const template = componentGenerator.generateFromUserStory(userStory);

// Generate code
const componentCode = componentGenerator.generateComponentCode(template);
const storyCode = componentGenerator.generateStoryFile(template);
```

### Manual Component Creation

Create a new component with Storybook story:

1. **Create Component** (`src/components/MyComponent.tsx`):

```typescript
import React from 'react';
import { motion } from 'framer-motion';

interface MyComponentProps {
  title: string;
  description?: string;
}

export const MyComponent: React.FC<MyComponentProps> = ({ 
  title, 
  description 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 bg-surface rounded-lg"
    >
      <h2 className="text-2xl font-bold">{title}</h2>
      {description && <p className="mt-2">{description}</p>}
    </motion.div>
  );
};
```

2. **Create Story** (`src/components/MyComponent.stories.tsx`):

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { MyComponent } from './MyComponent';

const meta = {
  title: 'Components/MyComponent',
  component: MyComponent,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Description of your component',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    title: {
      control: 'text',
      description: 'Component title',
    },
    description: {
      control: 'text',
      description: 'Optional description',
    },
  },
} satisfies Meta<typeof MyComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'My Component',
    description: 'This is a description',
  },
};

export const WithoutDescription: Story = {
  args: {
    title: 'No Description',
  },
};
```

## Using Material Design Patterns

Access pre-built Material Design patterns:

```typescript
import materialPatternMiner from '@/services/material-design-pattern-miner';

// Get all patterns
const patterns = materialPatternMiner.getAllPatterns();

// Get specific pattern
const drawer = materialPatternMiner.getPatternById('navigation-drawer');

// Generate implementation code
const code = materialPatternMiner.generatePatternCode('navigation-drawer');
```

Available patterns:
- Navigation Drawer
- Top App Bar
- Bottom Navigation
- Extended FAB
- Snackbar
- Filter Chips
- Card Grid
- Material Ripple
- Text Field
- List Item

## Using Design Tokens

Access Material Design 3 tokens:

```typescript
import { defaultMD3StyleguideConfig } from '@/config/material-design-3-styleguide-config';

// Colors
const primary = defaultMD3StyleguideConfig.tokens.colors.primary[40];

// Spacing
const spacing = defaultMD3StyleguideConfig.tokens.spacing.scale.md;

// Elevation
const shadow = defaultMD3StyleguideConfig.tokens.elevation.levels['2'].shadow;

// Motion
const easing = defaultMD3StyleguideConfig.tokens.motion.easing.standard;
const duration = defaultMD3StyleguideConfig.animations.duration.medium1;
```

## Animation Guidelines

### Using Anime.js

```typescript
import anime from 'animejs';

// Staggered animation
anime({
  targets: '.card',
  opacity: [0, 1],
  translateY: [40, 0],
  delay: anime.stagger(100),
  duration: 600,
  easing: 'easeOutExpo',
});

// Number counter
const obj = { value: 0 };
anime({
  targets: obj,
  value: 1000,
  round: 1,
  duration: 1500,
  easing: 'easeOutExpo',
  update: () => {
    element.textContent = obj.value;
  },
});
```

### Using Framer Motion

```typescript
import { motion } from 'framer-motion';

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.4 }}
  whileHover={{ scale: 1.05 }}
>
  Content
</motion.div>
```

### Material Design Motion Principles

Follow these duration guidelines:
- **Instant (0-50ms)**: Icon changes
- **Short (100-150ms)**: Simple transitions
- **Medium (200-250ms)**: Component state changes
- **Long (300-350ms)**: Screen transitions

Use Material Design easing curves:
- **Standard**: `cubic-bezier(0.2, 0, 0, 1)` - Default
- **Emphasized**: `cubic-bezier(0.05, 0.7, 0.1, 1)` - Important transitions
- **Decelerate**: Elements entering
- **Accelerate**: Elements exiting

## Storybook Configuration

### Main Config (`.storybook/main.ts`)

```typescript
import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: [
    '../src/**/*.mdx',
    '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)',
    '../generated-components/**/*.stories.@(js|jsx|mjs|ts|tsx)',
  ],
  addons: [
    '@storybook/addon-docs',
    '@storybook/addon-onboarding',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-a11y',
    '@storybook/addon-designs',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  docs: {
    autodocs: true,
  },
};
export default config;
```

### Preview Config (`.storybook/preview.ts`)

Enhanced with:
- Material Design themes
- Motion preferences
- Responsive viewports
- Background options
- Global decorators

## Accessibility

All components follow WCAG 2.1 AA guidelines:

✅ **Color Contrast**: 4.5:1 for text, 3:1 for UI components
✅ **Focus Indicators**: Visible 2px borders
✅ **Touch Targets**: Minimum 48x48dp
✅ **Screen Readers**: Semantic HTML and ARIA labels
✅ **Motion**: Respects `prefers-reduced-motion`

Test accessibility in Storybook using the a11y addon.

## Best Practices

### Component Development

1. **Follow Material Design 3**: Use design tokens
2. **Make it Accessible**: WCAG 2.1 AA minimum
3. **Responsive**: Mobile-first approach
4. **Performance**: Optimize animations
5. **Testing**: Add visual regression tests

### Story Writing

1. **Organization**: Group by feature/category
2. **Documentation**: Add descriptions
3. **Controls**: Make props interactive
4. **Variants**: Show different states
5. **Examples**: Provide usage examples

### Animation

1. **Duration**: Keep under 400ms
2. **Easing**: Use Material curves
3. **Purpose**: Every animation has meaning
4. **Reduced Motion**: Provide alternatives
5. **Performance**: 60fps target

## Troubleshooting

### Storybook Won't Start

Check dependencies are installed:
```bash
npm list @storybook/react-vite
```

Reinstall if needed:
```bash
npm install
```

### TypeScript Errors

Check tsconfig.json includes Storybook paths:
```json
{
  "include": [
    "src",
    ".storybook"
  ]
}
```

### Import Errors

Ensure path aliases are configured in:
- `vite.config.ts`
- `tsconfig.json`

Example:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

## Resources

- [Storybook Documentation](https://storybook.js.org)
- [Material Design 3](https://m3.material.io)
- [Anime.js](https://animejs.com)
- [Framer Motion](https://www.framer.com/motion/)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

## Demo

Run the comprehensive demo:

```bash
node demo-design-system-enhancement.js
```

This will showcase:
- Material Design 3 configuration
- Pattern mining
- Component generation
- Code generation

## Support

For issues or questions:
1. Check the comprehensive guide: `DESIGN_SYSTEM_COMPREHENSIVE_GUIDE.md`
2. Review Material Design patterns: `src/services/material-design-pattern-miner.ts`
3. Examine example components: `src/components/SEOReportAnimatedDemo.tsx`
