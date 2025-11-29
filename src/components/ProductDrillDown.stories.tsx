import type { Meta, StoryObj } from '@storybook/react';
import { ProductDrillDown } from './ProductDrillDown';

const meta: Meta<typeof ProductDrillDown> = {
  title: 'Product Pages/Product Drill-Down',
  component: ProductDrillDown,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
# Product Drill-Down Page

An interactive feature exploration page with advanced anime.js animations for detailed product presentations.

## Features

- **Tabbed Interface** - Switch between different product features
- **Animated Tab Content** - Each tab change triggers entrance animations
- **Progress Metrics** - Animated progress bars showing performance metrics
- **Timeline Animation** - Technical details revealed with scroll-triggered animation
- **Interactive Demo** - SVG animations that users can trigger
- **Feature Icons** - Rotating and scaling entrance effects

## Animation Techniques

### Tab Content Entrance
\`\`\`typescript
Timeline sequence:
1. Icon: scale [0, 1] + rotate [180, 0]
2. Title: opacity + translateY
3. Benefits: staggered opacity + translateX
\`\`\`

### Progress Bars
- Elastic easing for engaging visual feedback
- Staggered delays create cascading effect
- Width animation from 0% to target percentage

### Timeline Items
- Scroll-triggered activation
- Horizontal slide-in effect
- Stagger: 100ms per item

### Interactive SVG Demo
- Stroke dash animation for circle drawing
- Rotation and scale for diamond path
- User-triggered on button click

## Usage

\`\`\`tsx
import { ProductDrillDown } from '@/components/ProductDrillDown';

<ProductDrillDown />
\`\`\`

## Customization

This component includes 4 pre-configured feature tabs:
- DOM Space Analysis
- Blockchain Mining
- AI-Powered Optimization
- API Integration

Each feature includes:
- Icon and title
- Description
- Key benefits list
- Performance metrics
- Technical details timeline
        `,
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ProductDrillDown>;

export const Default: Story = {};

export const DOMAnalysis: Story = {
  play: async ({ canvasElement }) => {
    // Simulate selecting the DOM Analysis tab
    const tabs = canvasElement.querySelectorAll('[role="tab"]');
    if (tabs[0]) {
      (tabs[0] as HTMLElement).click();
    }
  },
};

export const BlockchainMining: Story = {
  play: async ({ canvasElement }) => {
    // Simulate selecting the Blockchain Mining tab
    const tabs = canvasElement.querySelectorAll('[role="tab"]');
    if (tabs[1]) {
      (tabs[1] as HTMLElement).click();
    }
  },
};

export const AIOptimization: Story = {
  play: async ({ canvasElement }) => {
    // Simulate selecting the AI Optimization tab
    const tabs = canvasElement.querySelectorAll('[role="tab"]');
    if (tabs[2]) {
      (tabs[2] as HTMLElement).click();
    }
  },
};

export const APIIntegration: Story = {
  play: async ({ canvasElement }) => {
    // Simulate selecting the API Integration tab
    const tabs = canvasElement.querySelectorAll('[role="tab"]');
    if (tabs[3]) {
      (tabs[3] as HTMLElement).click();
    }
  },
};
