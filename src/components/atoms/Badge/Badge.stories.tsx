import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from './Badge';

const meta: Meta<typeof Badge> = {
  title: 'Atoms/Badge',
  component: Badge,
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

export const Primary: Story = {
  args: {
    children: 'Primary',
    variant: 'primary',
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

export const WithDot: Story = {
  args: {
    children: 'Online',
    variant: 'success',
    dot: true,
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className='flex flex-wrap gap-2'>
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

export const AllSizes: Story = {
  render: () => (
    <div className='flex items-center gap-3'>
      <Badge size='sm'>Small</Badge>
      <Badge size='md'>Medium</Badge>
      <Badge size='lg'>Large</Badge>
    </div>
  ),
};

export const WithDots: Story = {
  render: () => (
    <div className='flex flex-wrap gap-2'>
      <Badge variant='success' dot>
        Online
      </Badge>
      <Badge variant='warning' dot>
        Away
      </Badge>
      <Badge variant='error' dot>
        Offline
      </Badge>
      <Badge variant='info' dot>
        Idle
      </Badge>
    </div>
  ),
};

export const StatusBadges: Story = {
  render: () => (
    <div className='space-y-3'>
      <div className='flex gap-2'>
        <Badge variant='success' dot>
          Active
        </Badge>
        <Badge variant='warning' dot>
          Pending
        </Badge>
        <Badge variant='error' dot>
          Failed
        </Badge>
      </div>
      <div className='flex gap-2'>
        <Badge variant='primary'>New</Badge>
        <Badge variant='secondary'>Updated</Badge>
        <Badge variant='info'>Info</Badge>
      </div>
    </div>
  ),
};
