import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Progress } from '@/components/ui/Progress';

/**
 * # Progress Component
 * 
 * Progress indicator for showing completion status.
 * 
 * ## Styleguide Rules
 * - Use for deterministic progress (known completion %)
 * - Include text label for accessibility
 * - Use appropriate colors for context
 */
const meta: Meta<typeof Progress> = {
  title: 'DESIGN SYSTEM/Atoms/Progress',
  component: Progress,
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
      description: 'Progress value (0-100)',
    },
    variant: {
      control: 'select',
      options: ['default', 'success', 'warning', 'error'],
      description: 'Color variant',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Bar height',
    },
    showLabel: {
      control: 'boolean',
      description: 'Show percentage label',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// ============================================================================
// Basic
// ============================================================================

export const Default: Story = {
  args: {
    value: 60,
  },
};

export const WithLabel: Story = {
  args: {
    value: 75,
    showLabel: true,
  },
};

// ============================================================================
// Values
// ============================================================================

export const ProgressValues: Story = {
  render: () => (
    <div className="space-y-4 max-w-md">
      <div>
        <span className="text-sm mb-1 block">0%</span>
        <Progress value={0} />
      </div>
      <div>
        <span className="text-sm mb-1 block">25%</span>
        <Progress value={25} />
      </div>
      <div>
        <span className="text-sm mb-1 block">50%</span>
        <Progress value={50} />
      </div>
      <div>
        <span className="text-sm mb-1 block">75%</span>
        <Progress value={75} />
      </div>
      <div>
        <span className="text-sm mb-1 block">100%</span>
        <Progress value={100} />
      </div>
    </div>
  ),
};

// ============================================================================
// Variants
// ============================================================================

export const Variants: Story = {
  render: () => (
    <div className="space-y-4 max-w-md">
      <div>
        <span className="text-sm mb-1 block">Default</span>
        <Progress value={60} variant="default" />
      </div>
      <div>
        <span className="text-sm mb-1 block text-success">Success</span>
        <Progress value={100} variant="success" />
      </div>
      <div>
        <span className="text-sm mb-1 block text-warning">Warning</span>
        <Progress value={45} variant="warning" />
      </div>
      <div>
        <span className="text-sm mb-1 block text-error">Error</span>
        <Progress value={20} variant="error" />
      </div>
    </div>
  ),
};

// ============================================================================
// Sizes
// ============================================================================

export const Sizes: Story = {
  render: () => (
    <div className="space-y-4 max-w-md">
      <div>
        <span className="text-sm mb-1 block">Small</span>
        <Progress value={60} size="sm" />
      </div>
      <div>
        <span className="text-sm mb-1 block">Medium</span>
        <Progress value={60} size="md" />
      </div>
      <div>
        <span className="text-sm mb-1 block">Large</span>
        <Progress value={60} size="lg" />
      </div>
    </div>
  ),
};

// ============================================================================
// In Context
// ============================================================================

export const FileUpload: Story = {
  render: () => (
    <div className="max-w-md p-4 bg-surface rounded-lg space-y-3">
      <div className="flex items-center justify-between">
        <span className="font-medium">Uploading file.zip</span>
        <span className="text-sm text-on-surface-variant">3.2 MB / 5.0 MB</span>
      </div>
      <Progress value={64} />
      <p className="text-sm text-on-surface-variant">Estimated time: 12 seconds</p>
    </div>
  ),
};

export const TaskProgress: Story = {
  render: () => (
    <div className="max-w-md space-y-4">
      <div className="p-4 bg-surface rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium">Project Setup</span>
          <span className="text-sm text-success">Complete</span>
        </div>
        <Progress value={100} variant="success" />
      </div>
      
      <div className="p-4 bg-surface rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium">Design Phase</span>
          <span className="text-sm text-on-surface-variant">75%</span>
        </div>
        <Progress value={75} />
      </div>
      
      <div className="p-4 bg-surface rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium">Development</span>
          <span className="text-sm text-on-surface-variant">30%</span>
        </div>
        <Progress value={30} />
      </div>
      
      <div className="p-4 bg-surface rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium">Testing</span>
          <span className="text-sm text-on-surface-variant">Not started</span>
        </div>
        <Progress value={0} />
      </div>
    </div>
  ),
};

export const StorageUsage: Story = {
  render: () => {
    const usage = 78;
    const variant = usage > 90 ? 'error' : usage > 70 ? 'warning' : 'default';
    
    return (
      <div className="max-w-sm p-4 bg-surface rounded-lg">
        <h3 className="font-semibold mb-4">Storage Usage</h3>
        <Progress value={usage} variant={variant} size="lg" />
        <div className="flex justify-between mt-2 text-sm">
          <span className="text-on-surface-variant">78 GB used</span>
          <span className="text-on-surface-variant">100 GB total</span>
        </div>
        <p className="text-sm text-warning mt-2">
          ⚠️ Storage almost full. Consider upgrading your plan.
        </p>
      </div>
    );
  },
};

// ============================================================================
// All Variants Showcase
// ============================================================================

export const AllVariants: Story = {
  render: () => (
    <div className="space-y-8 max-w-lg">
      <div>
        <h3 className="text-lg font-semibold mb-4">Progress Values</h3>
        <div className="space-y-3">
          <Progress value={0} showLabel />
          <Progress value={25} showLabel />
          <Progress value={50} showLabel />
          <Progress value={75} showLabel />
          <Progress value={100} showLabel />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Color Variants</h3>
        <div className="space-y-3">
          <Progress value={60} variant="default" />
          <Progress value={100} variant="success" />
          <Progress value={45} variant="warning" />
          <Progress value={20} variant="error" />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Sizes</h3>
        <div className="space-y-3">
          <Progress value={60} size="sm" />
          <Progress value={60} size="md" />
          <Progress value={60} size="lg" />
        </div>
      </div>
    </div>
  ),
};
