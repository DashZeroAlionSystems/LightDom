import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from '../../../components/atoms/Badge/Badge';

const meta: Meta<typeof Badge> = {
  title: 'Atoms/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'success', 'warning', 'error', 'info', 'outline'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Default: Story = {
  args: {
    children: 'Badge',
  },
};

// Variants
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

export const Info: Story = {
  args: {
    children: 'Info',
    variant: 'info',
  },
};

export const Outline: Story = {
  args: {
    children: 'Outline',
    variant: 'outline',
  },
};

// Sizes
export const Small: Story = {
  args: {
    children: 'Small',
    size: 'sm',
  },
};

export const Medium: Story = {
  args: {
    children: 'Medium',
    size: 'md',
  },
};

export const Large: Story = {
  args: {
    children: 'Large',
    size: 'lg',
  },
};

// With dot indicator
export const WithDot: Story = {
  args: {
    children: 'Active',
    dot: true,
    variant: 'success',
  },
};

export const DotVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
      <Badge variant='primary' dot>
        Online
      </Badge>
      <Badge variant='success' dot>
        Available
      </Badge>
      <Badge variant='warning' dot>
        Away
      </Badge>
      <Badge variant='error' dot>
        Busy
      </Badge>
      <Badge variant='info' dot>
        In Meeting
      </Badge>
    </div>
  ),
};

// Removable badges
export const Removable: Story = {
  args: {
    children: 'Removable',
    onRemove: () => alert('Badge removed!'),
  },
};

export const RemovableVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
      <Badge variant='primary' onRemove={() => console.log('Removed')}>
        React
      </Badge>
      <Badge variant='secondary' onRemove={() => console.log('Removed')}>
        TypeScript
      </Badge>
      <Badge variant='success' onRemove={() => console.log('Removed')}>
        Node.js
      </Badge>
      <Badge variant='info' onRemove={() => console.log('Removed')}>
        Vite
      </Badge>
    </div>
  ),
};

// Status badges
export const StatusBadges: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <span>Build:</span>
        <Badge variant='success'>Passing</Badge>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <span>Tests:</span>
        <Badge variant='warning'>Pending</Badge>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <span>Deploy:</span>
        <Badge variant='error'>Failed</Badge>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <span>Docs:</span>
        <Badge variant='info'>Updated</Badge>
      </div>
    </div>
  ),
};

// All variants showcase
export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
      <Badge variant='primary'>Primary</Badge>
      <Badge variant='secondary'>Secondary</Badge>
      <Badge variant='success'>Success</Badge>
      <Badge variant='warning'>Warning</Badge>
      <Badge variant='error'>Error</Badge>
      <Badge variant='info'>Info</Badge>
      <Badge variant='outline'>Outline</Badge>
    </div>
  ),
};

// Size comparison
export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
      <Badge size='sm'>Small</Badge>
      <Badge size='md'>Medium</Badge>
      <Badge size='lg'>Large</Badge>
    </div>
  ),
};
