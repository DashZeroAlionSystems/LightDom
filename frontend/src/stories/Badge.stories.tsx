import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Badge } from '@/components/ui/Badge';
import { Check, AlertTriangle, Info, X, Star, Zap } from 'lucide-react';

/**
 * # Badge Component
 * 
 * Material Design 3 badge for status indicators, labels, and tags.
 * 
 * ## Styleguide Rules
 * - Use semantic colors for status (success, warning, error)
 * - Keep badge text short (1-3 words)
 * - Dot badges for notification counts
 * - Ensure sufficient color contrast
 */
const meta: Meta<typeof Badge> = {
  title: 'DESIGN SYSTEM/Atoms/Badge',
  component: Badge,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'tertiary', 'success', 'warning', 'error', 'outline'],
      description: 'Color variant for semantic meaning',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Badge size',
    },
    dot: {
      control: 'boolean',
      description: 'Shows as a small circular indicator',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// ============================================================================
// Basic Variants
// ============================================================================

export const Primary: Story = {
  args: {
    children: 'Primary',
    variant: 'primary',
  },
};

export const Secondary: Story = {
  args: {
    children: 'Secondary',
    variant: 'secondary',
  },
};

export const Tertiary: Story = {
  args: {
    children: 'Tertiary',
    variant: 'tertiary',
  },
};

export const Success: Story = {
  args: {
    children: 'Success',
    variant: 'success',
  },
};

export const Warning: Story = {
  args: {
    children: 'Warning',
    variant: 'warning',
  },
};

export const Error: Story = {
  args: {
    children: 'Error',
    variant: 'error',
  },
};

export const Outline: Story = {
  args: {
    children: 'Outline',
    variant: 'outline',
  },
};

// ============================================================================
// Sizes
// ============================================================================

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Badge size="sm">Small</Badge>
      <Badge size="md">Medium</Badge>
      <Badge size="lg">Large</Badge>
    </div>
  ),
};

// ============================================================================
// With Icons
// ============================================================================

export const WithIcon: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Badge variant="success" icon={<Check className="w-3 h-3" />}>
        Verified
      </Badge>
      <Badge variant="warning" icon={<AlertTriangle className="w-3 h-3" />}>
        Pending
      </Badge>
      <Badge variant="error" icon={<X className="w-3 h-3" />}>
        Failed
      </Badge>
      <Badge variant="primary" icon={<Info className="w-3 h-3" />}>
        Info
      </Badge>
    </div>
  ),
};

// ============================================================================
// Dot Indicators
// ============================================================================

export const DotIndicators: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <Badge variant="success" dot />
        <span>Online</span>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="warning" dot />
        <span>Away</span>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="error" dot />
        <span>Busy</span>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="outline" dot />
        <span>Offline</span>
      </div>
    </div>
  ),
};

// ============================================================================
// Status Badges
// ============================================================================

export const StatusBadges: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Badge variant="success">Active</Badge>
        <Badge variant="warning">Pending</Badge>
        <Badge variant="error">Inactive</Badge>
        <Badge variant="outline">Draft</Badge>
      </div>
      <div className="flex flex-wrap gap-2">
        <Badge variant="success" icon={<Check className="w-3 h-3" />}>Completed</Badge>
        <Badge variant="primary" icon={<Zap className="w-3 h-3" />}>In Progress</Badge>
        <Badge variant="warning" icon={<AlertTriangle className="w-3 h-3" />}>Review</Badge>
        <Badge variant="error" icon={<X className="w-3 h-3" />}>Rejected</Badge>
      </div>
    </div>
  ),
};

// ============================================================================
// Feature Badges
// ============================================================================

export const FeatureBadges: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="primary" icon={<Star className="w-3 h-3" />}>Featured</Badge>
      <Badge variant="secondary">New</Badge>
      <Badge variant="tertiary">Beta</Badge>
      <Badge variant="success">Free</Badge>
      <Badge variant="warning">Premium</Badge>
      <Badge variant="error">Limited</Badge>
    </div>
  ),
};

// ============================================================================
// In Context
// ============================================================================

export const InContext: Story = {
  render: () => (
    <div className="space-y-4 max-w-md">
      <div className="p-4 bg-surface rounded-lg flex items-center justify-between">
        <span className="font-medium">Design System</span>
        <Badge variant="success">Active</Badge>
      </div>
      <div className="p-4 bg-surface rounded-lg flex items-center justify-between">
        <span className="font-medium">API Integration</span>
        <Badge variant="warning">Pending</Badge>
      </div>
      <div className="p-4 bg-surface rounded-lg flex items-center justify-between">
        <span className="font-medium">Legacy Module</span>
        <Badge variant="error">Deprecated</Badge>
      </div>
      <div className="p-4 bg-surface rounded-lg flex items-center justify-between">
        <span className="font-medium">New Feature</span>
        <Badge variant="primary" icon={<Zap className="w-3 h-3" />}>Beta</Badge>
      </div>
    </div>
  ),
};

// ============================================================================
// All Variants Showcase
// ============================================================================

export const AllVariants: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Color Variants</h3>
        <div className="flex flex-wrap gap-2">
          <Badge variant="primary">Primary</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="tertiary">Tertiary</Badge>
          <Badge variant="success">Success</Badge>
          <Badge variant="warning">Warning</Badge>
          <Badge variant="error">Error</Badge>
          <Badge variant="outline">Outline</Badge>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Sizes</h3>
        <div className="flex items-center gap-4">
          <Badge size="sm" variant="primary">Small</Badge>
          <Badge size="md" variant="primary">Medium</Badge>
          <Badge size="lg" variant="primary">Large</Badge>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">With Icons</h3>
        <div className="flex flex-wrap gap-2">
          <Badge variant="success" icon={<Check className="w-3 h-3" />}>Success</Badge>
          <Badge variant="warning" icon={<AlertTriangle className="w-3 h-3" />}>Warning</Badge>
          <Badge variant="error" icon={<X className="w-3 h-3" />}>Error</Badge>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Dot Indicators</h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Badge variant="success" dot />
            <span className="text-sm">Online</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="warning" dot />
            <span className="text-sm">Away</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="error" dot />
            <span className="text-sm">Busy</span>
          </div>
        </div>
      </div>
    </div>
  ),
};
