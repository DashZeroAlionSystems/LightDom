import type { Meta, StoryObj } from '@storybook/react';
import { AnimationControls } from './AnimationControls';

const meta: Meta<typeof AnimationControls> = {
  title: 'Design System/Animation Controls',
  component: AnimationControls,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
# Animation Controls

Interactive playground for anime.js animations inspired by animejs.com.

## Features

- **Real-time parameter adjustment** - Change duration, easing, and stagger delays on the fly
- **Multiple demo modes** - Product showcase, data visualization, SVG, text effects, and interactive demos
- **Playback controls** - Play, pause, restart, and reverse animations
- **Code examples** - See the code that creates each animation
- **Accessibility** - Respects prefers-reduced-motion settings

## Usage

\`\`\`tsx
import { AnimationControls } from '@/components/AnimationControls';

<AnimationControls 
  demoMode="product" 
  showCode={true}
/>
\`\`\`

## Animation Types

### Product Showcase
Staggered card animations perfect for feature highlights and product galleries.

### Data Visualization
Animated counters and progress bars for dashboards and reports.

### SVG Animation
Path drawing and morphing for logos and graphics.

### Text Effects
Letter-by-letter reveals and typewriter effects.

### Interactive
Hover and click effects for engaging user experiences.
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    demoMode: {
      control: 'select',
      options: ['product', 'data', 'svg', 'text', 'interactive'],
      description: 'Select the animation demo to display',
    },
    showCode: {
      control: 'boolean',
      description: 'Show the code example for the current animation',
    },
  },
};

export default meta;
type Story = StoryObj<typeof AnimationControls>;

export const ProductShowcase: Story = {
  args: {
    demoMode: 'product',
    showCode: true,
  },
};

export const DataVisualization: Story = {
  args: {
    demoMode: 'data',
    showCode: true,
  },
};

export const SVGAnimation: Story = {
  args: {
    demoMode: 'svg',
    showCode: true,
  },
};

export const TextEffects: Story = {
  args: {
    demoMode: 'text',
    showCode: true,
  },
};

export const Interactive: Story = {
  args: {
    demoMode: 'interactive',
    showCode: true,
  },
};

export const WithoutCode: Story = {
  args: {
    demoMode: 'product',
    showCode: false,
  },
};
