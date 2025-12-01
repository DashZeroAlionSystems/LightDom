import type { Meta, StoryObj } from '@storybook/react';
import { ProductOverview } from './ProductOverview';

const meta: Meta<typeof ProductOverview> = {
  title: 'Product Pages/Product Overview',
  component: ProductOverview,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
# Product Overview Page

A stunning product showcase page with anime.js animations that bring your product to life.

## Features

- **Hero Animation** - Dramatic entrance with staggered content reveal
- **Animated Statistics** - Counters that count up when scrolled into view
- **Feature Cards** - Staggered card animations with hover effects
- **Magnetic Buttons** - Interactive CTA buttons that follow cursor
- **Scroll Triggers** - Animations activate as user scrolls
- **Accessibility** - Respects prefers-reduced-motion settings

## Animations Used

### Hero Section
- Opacity fade-in
- Scale transformation
- Vertical translation
- Staggered text reveal

### Statistics
- Animated number counters
- Easing: easeOutExpo
- Duration: 2000ms

### Feature Cards
- Scroll-triggered entrance
- Stagger delay: 100ms per card
- Combined opacity, scale, and translate

### CTA Buttons
- Magnetic effect following mouse cursor
- Elastic spring-back on mouse leave
- Strength: 15px displacement

## Usage

\`\`\`tsx
import { ProductOverview } from '@/components/ProductOverview';

<ProductOverview 
  productName="Your Product"
  tagline="Your Amazing Tagline"
  description="Full product description..."
/>
\`\`\`
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    productName: {
      control: 'text',
      description: 'The main product name displayed in the hero section',
    },
    tagline: {
      control: 'text',
      description: 'The tagline or subtitle for the product',
    },
    description: {
      control: 'text',
      description: 'Detailed product description',
    },
  },
};

export default meta;
type Story = StoryObj<typeof ProductOverview>;

export const Default: Story = {
  args: {
    productName: 'LightDom Space Bridge',
    tagline: 'Revolutionary DOM Optimization Platform',
    description: 'Transform your web applications with AI-powered DOM analysis, blockchain mining, and advanced space quantification technology.',
  },
};

export const CustomProduct: Story = {
  args: {
    productName: 'Your Product Name',
    tagline: 'Change Me: Your Product Tagline',
    description: 'This is a customizable product description. Edit the story args to see how it looks with your content.',
  },
};

export const ShortContent: Story = {
  args: {
    productName: 'Simple Product',
    tagline: 'Easy to Use',
    description: 'A minimalist approach to product showcase.',
  },
};

export const LongContent: Story = {
  args: {
    productName: 'Enterprise Solution for Modern Web Development',
    tagline: 'Comprehensive Platform for Building, Testing, and Deploying High-Performance Applications',
    description: 'An all-in-one enterprise solution that combines cutting-edge technology with intuitive design, providing developers with the tools they need to build, test, and deploy applications at scale. Features include advanced analytics, real-time monitoring, automated deployment pipelines, and comprehensive security measures.',
  },
};
