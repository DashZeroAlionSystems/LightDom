import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Button } from '@/components/ui/Button';
import { 
  Plus, 
  Settings, 
  Download, 
  ArrowRight, 
  Heart,
  Send,
  Check,
  X,
  Trash2
} from 'lucide-react';

/**
 * # Button Component
 * 
 * Material Design 3 inspired button component with multiple variants,
 * sizes, and states. Follows the LightDom Design System styleguide.
 * 
 * ## Styleguide Rules
 * - Minimum touch target: 44x44px
 * - Use semantic variants for correct emphasis
 * - Include loading states for async actions
 * - Icons should be 16x16 or 20x20px
 */
const meta: Meta<typeof Button> = {
  title: 'DESIGN SYSTEM/Atoms/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['filled', 'filled-tonal', 'outlined', 'text', 'elevated'],
      description: 'Visual style variant following Material Design 3',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Button size - md is recommended for most use cases',
    },
    fullWidth: {
      control: 'boolean',
      description: 'Whether the button spans full width',
    },
    isLoading: {
      control: 'boolean',
      description: 'Shows loading spinner and disables interaction',
    },
    disabled: {
      control: 'boolean',
      description: 'Disables the button',
    },
  },
  parameters: {
    docs: {
      description: {
        component: `
The Button component follows Material Design 3 principles with support for:
- **5 Variants**: filled, filled-tonal, outlined, text, elevated
- **3 Sizes**: sm (32px), md (40px), lg (48px)
- **States**: default, hover, focus, active, loading, disabled
- **Icons**: left and right icon slots
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// ============================================================================
// Basic Variants
// ============================================================================

export const Filled: Story = {
  args: {
    children: 'Filled Button',
    variant: 'filled',
  },
};

export const FilledTonal: Story = {
  args: {
    children: 'Tonal Button',
    variant: 'filled-tonal',
  },
};

export const Outlined: Story = {
  args: {
    children: 'Outlined Button',
    variant: 'outlined',
  },
};

export const Text: Story = {
  args: {
    children: 'Text Button',
    variant: 'text',
  },
};

export const Elevated: Story = {
  args: {
    children: 'Elevated Button',
    variant: 'elevated',
  },
};

// ============================================================================
// Sizes
// ============================================================================

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </div>
  ),
};

// ============================================================================
// With Icons
// ============================================================================

export const WithLeftIcon: Story = {
  args: {
    children: 'Add Item',
    leftIcon: <Plus className="w-4 h-4" />,
  },
};

export const WithRightIcon: Story = {
  args: {
    children: 'Continue',
    rightIcon: <ArrowRight className="w-4 h-4" />,
  },
};

export const WithBothIcons: Story = {
  args: {
    children: 'Download',
    leftIcon: <Download className="w-4 h-4" />,
    rightIcon: <ArrowRight className="w-4 h-4" />,
  },
};

export const IconOnly: Story = {
  args: {
    leftIcon: <Settings className="w-4 h-4" />,
    'aria-label': 'Settings',
  },
};

// ============================================================================
// States
// ============================================================================

export const Loading: Story = {
  args: {
    children: 'Saving...',
    isLoading: true,
  },
};

export const Disabled: Story = {
  args: {
    children: 'Disabled',
    disabled: true,
  },
};

export const FullWidth: Story = {
  args: {
    children: 'Full Width Button',
    fullWidth: true,
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-md">
        <Story />
      </div>
    ),
  ],
};

// ============================================================================
// All Variants Showcase
// ============================================================================

export const AllVariants: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Variants</h3>
        <div className="flex flex-wrap gap-4">
          <Button variant="filled">Filled</Button>
          <Button variant="filled-tonal">Filled Tonal</Button>
          <Button variant="outlined">Outlined</Button>
          <Button variant="text">Text</Button>
          <Button variant="elevated">Elevated</Button>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">With Icons</h3>
        <div className="flex flex-wrap gap-4">
          <Button variant="filled" leftIcon={<Plus className="w-4 h-4" />}>
            Add
          </Button>
          <Button variant="outlined" leftIcon={<Heart className="w-4 h-4" />}>
            Like
          </Button>
          <Button variant="filled-tonal" leftIcon={<Send className="w-4 h-4" />}>
            Send
          </Button>
          <Button variant="text" leftIcon={<Settings className="w-4 h-4" />}>
            Settings
          </Button>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Action Buttons</h3>
        <div className="flex flex-wrap gap-4">
          <Button variant="filled" leftIcon={<Check className="w-4 h-4" />}>
            Confirm
          </Button>
          <Button variant="outlined" leftIcon={<X className="w-4 h-4" />}>
            Cancel
          </Button>
          <Button variant="text" className="text-error" leftIcon={<Trash2 className="w-4 h-4" />}>
            Delete
          </Button>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">States</h3>
        <div className="flex flex-wrap gap-4">
          <Button>Default</Button>
          <Button disabled>Disabled</Button>
          <Button isLoading>Loading</Button>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Complete showcase of all button variants, icons, and states.',
      },
    },
  },
};
