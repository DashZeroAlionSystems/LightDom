import type { Meta, StoryObj } from '@storybook/react';
import { Plus, ArrowRight, Download, Trash2 } from 'lucide-react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outline', 'ghost', 'danger', 'success'],
      description: 'Visual style variant',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Button size',
    },
    fullWidth: {
      control: 'boolean',
      description: 'Make button full width',
    },
    isLoading: {
      control: 'boolean',
      description: 'Show loading spinner',
    },
    disabled: {
      control: 'boolean',
      description: 'Disable button',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

/**
 * Primary variant - Main call-to-action buttons
 */
export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Primary Button',
  },
};

/**
 * Secondary variant - Secondary actions
 */
export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary Button',
  },
};

/**
 * Outline variant - Tertiary actions
 */
export const Outline: Story = {
  args: {
    variant: 'outline',
    children: 'Outline Button',
  },
};

/**
 * Ghost variant - Minimal emphasis
 */
export const Ghost: Story = {
  args: {
    variant: 'ghost',
    children: 'Ghost Button',
  },
};

/**
 * Danger variant - Destructive actions
 */
export const Danger: Story = {
  args: {
    variant: 'danger',
    children: 'Delete',
    leftIcon: <Trash2 size={16} />,
  },
};

/**
 * Success variant - Positive actions
 */
export const Success: Story = {
  args: {
    variant: 'success',
    children: 'Success Button',
  },
};

/**
 * Small size
 */
export const Small: Story = {
  args: {
    size: 'sm',
    children: 'Small Button',
  },
};

/**
 * Medium size (default)
 */
export const Medium: Story = {
  args: {
    size: 'md',
    children: 'Medium Button',
  },
};

/**
 * Large size
 */
export const Large: Story = {
  args: {
    size: 'lg',
    children: 'Large Button',
  },
};

/**
 * With left icon
 */
export const WithLeftIcon: Story = {
  args: {
    variant: 'primary',
    children: 'Add Item',
    leftIcon: <Plus size={16} />,
  },
};

/**
 * With right icon
 */
export const WithRightIcon: Story = {
  args: {
    variant: 'primary',
    children: 'Next',
    rightIcon: <ArrowRight size={16} />,
  },
};

/**
 * Loading state
 */
export const Loading: Story = {
  args: {
    variant: 'primary',
    children: 'Processing...',
    isLoading: true,
  },
};

/**
 * Disabled state
 */
export const Disabled: Story = {
  args: {
    variant: 'primary',
    children: 'Disabled Button',
    disabled: true,
  },
};

/**
 * Full width button
 */
export const FullWidth: Story = {
  args: {
    variant: 'primary',
    children: 'Full Width Button',
    fullWidth: true,
  },
};

/**
 * All variants showcase
 */
export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex gap-4">
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="danger">Danger</Button>
        <Button variant="success">Success</Button>
      </div>
    </div>
  ),
};

/**
 * All sizes showcase
 */
export const AllSizes: Story = {
  render: () => (
    <div className="flex items-end gap-4">
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </div>
  ),
};

/**
 * With icons showcase
 */
export const WithIcons: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex gap-4">
        <Button leftIcon={<Plus size={16} />}>Add</Button>
        <Button rightIcon={<ArrowRight size={16} />}>Next</Button>
        <Button leftIcon={<Download size={16} />} rightIcon={<ArrowRight size={16} />}>
          Download
        </Button>
      </div>
    </div>
  ),
};

/**
 * Loading states showcase
 */
export const LoadingStates: Story = {
  render: () => (
    <div className="flex gap-4">
      <Button variant="primary" isLoading>
        Loading
      </Button>
      <Button variant="secondary" isLoading>
        Processing
      </Button>
      <Button variant="outline" isLoading>
        Please wait
      </Button>
    </div>
  ),
};
