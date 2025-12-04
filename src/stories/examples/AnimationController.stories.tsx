import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Space, Typography, Divider } from 'antd';
import { AnimationController, StaggerDemo, TimelineBuilder } from '../../components/AnimationController';

const { Title, Paragraph } = Typography;

// =============================================================================
// Meta Configuration
// =============================================================================

const meta: Meta<typeof AnimationController> = {
  title: 'Design System/Animation Controller',
  component: AnimationController,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
# Animation Controller

A comprehensive animation player UI inspired by [animejs.com](https://animejs.com).

## Features

- **Timeline Player**: Play, pause, seek, and scrub through animations
- **Easing Visualizer**: Visual representation of easing functions
- **Property Inspector**: Real-time view of animation state
- **Playback Controls**: Speed control, loop, direction, and reverse
- **Property Sliders**: Adjust translateX, translateY, scale, rotate, opacity, and duration

## Components

### AnimationController
The main animation player with full controls.

### StaggerDemo
Demonstrates staggered animations with configurable delay and direction.

### TimelineBuilder
Shows how to build and control multi-element timelines.

## Usage

\`\`\`tsx
import { AnimationController, StaggerDemo, TimelineBuilder } from '@/components/AnimationController';

// Basic usage
<AnimationController />

// Stagger animation demo
<StaggerDemo count={10} staggerDelay={80} />

// Timeline builder
<TimelineBuilder onTimelineChange={(tl) => console.log(tl)} />
\`\`\`

## Accessibility

All animations respect the user's \`prefers-reduced-motion\` setting.
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    showEasingViz: {
      control: 'boolean',
      description: 'Show the easing function visualizer',
      defaultValue: true,
    },
    showInspector: {
      control: 'boolean',
      description: 'Show the animation state inspector',
      defaultValue: true,
    },
    variant: {
      control: 'select',
      options: ['default', 'compact', 'minimal'],
      description: 'UI variant',
      defaultValue: 'default',
    },
  },
};

export default meta;
type Story = StoryObj<typeof AnimationController>;

// =============================================================================
// Stories
// =============================================================================

/**
 * The full Animation Controller with all features enabled.
 * Includes playback controls, property sliders, easing visualizer, and state inspector.
 */
export const Default: Story = {
  args: {
    showEasingViz: true,
    showInspector: true,
  },
  render: (args) => (
    <div style={{ padding: 24 }}>
      <Title level={2}>Animation Controller</Title>
      <Paragraph>
        A comprehensive animation player inspired by animejs.com. 
        Use the controls to play, pause, seek, and adjust animation properties.
      </Paragraph>
      <AnimationController {...args} />
    </div>
  ),
};

/**
 * Animation Controller without the easing visualizer.
 */
export const WithoutEasing: Story = {
  args: {
    showEasingViz: false,
    showInspector: true,
  },
};

/**
 * Animation Controller without the state inspector.
 */
export const WithoutInspector: Story = {
  args: {
    showEasingViz: true,
    showInspector: false,
  },
};

/**
 * Minimal version with only core playback controls.
 */
export const Minimal: Story = {
  args: {
    showEasingViz: false,
    showInspector: false,
    variant: 'minimal',
  },
};

/**
 * Demonstrates staggered animations with configurable settings.
 * You can adjust the stagger from position, direction, and delay.
 */
export const StaggerAnimation: Story = {
  render: () => (
    <div style={{ padding: 24 }}>
      <Title level={2}>Stagger Animation Demo</Title>
      <Paragraph>
        Staggered animations create a wave effect across multiple elements.
        Configure the stagger origin, direction, and delay to see different effects.
      </Paragraph>
      <StaggerDemo count={10} staggerDelay={80} />
    </div>
  ),
};

/**
 * Multi-element timeline with synchronized animations.
 * Shows how to coordinate multiple animations with offsets.
 */
export const TimelineDemo: Story = {
  render: () => (
    <div style={{ padding: 24 }}>
      <Title level={2}>Timeline Builder</Title>
      <Paragraph>
        Create complex animation sequences with multiple elements.
        Each element can have different properties and timing offsets.
      </Paragraph>
      <TimelineBuilder />
    </div>
  ),
};

/**
 * All animation controller components displayed together.
 */
export const AllControllers: Story = {
  render: () => (
    <div style={{ padding: 24 }}>
      <Title level={2}>Animation Controllers Suite</Title>
      <Paragraph>
        A complete demonstration of all animation controller components 
        inspired by animejs.com interactive demos.
      </Paragraph>
      
      <Divider orientation="left">Animation Controller</Divider>
      <AnimationController showEasingViz={true} showInspector={true} />
      
      <Divider orientation="left" style={{ marginTop: 48 }}>Stagger Animation</Divider>
      <StaggerDemo count={10} staggerDelay={80} />
      
      <Divider orientation="left" style={{ marginTop: 48 }}>Timeline Builder</Divider>
      <TimelineBuilder />
    </div>
  ),
};
