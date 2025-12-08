import type { Meta, StoryObj } from '@storybook/react';
import { Download, Plus, Settings } from 'lucide-react';
import { Button } from '../../../components/atoms/Button/Button';

const meta: Meta<typeof Button> = {
  title: 'Atoms/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['filled', 'filled-tonal', 'outlined', 'text', 'elevated', 'destructive'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {
  args: {
    children: 'Button',
  },
};

export const Filled: Story = {
  args: {
    children: 'Filled Button',
    variant: 'filled',
  },
};

export const FilledTonal: Story = {
  args: {
    children: 'Filled Tonal',
    variant: 'filled-tonal',
  },
};

export const Outlined: Story = {
  args: {
    children: 'Outlined',
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
    children: 'Elevated',
    variant: 'elevated',
  },
};

export const Destructive: Story = {
  args: {
    children: 'Delete',
    variant: 'destructive',
  },
};

// Size variants
export const Small: Story = {
  args: {
    children: 'Small Button',
    size: 'sm',
  },
};

export const Medium: Story = {
  args: {
    children: 'Medium Button',
    size: 'md',
  },
};

export const Large: Story = {
  args: {
    children: 'Large Button',
    size: 'lg',
  },
};

// With icons
export const WithLeftIcon: Story = {
  args: {
    children: 'Add Item',
    leftIcon: Plus,
  },
};

export const WithRightIcon: Story = {
  args: {
    children: 'Download',
    rightIcon: Download,
  },
};

export const IconOnly: Story = {
  args: {
    leftIcon: Settings,
    'aria-label': 'Settings',
  },
};

// States
export const Loading: Story = {
  args: {
    children: 'Loading...',
    loading: true,
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
  parameters: {
    layout: 'padded',
  },
};
