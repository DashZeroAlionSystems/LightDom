import type { Meta, StoryObj } from '@storybook/react';
import { Download, Plus, Send, Settings, Trash2 } from 'lucide-react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Atoms/Button',
  component: Button,
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

export const Filled: Story = {
  args: {
    children: 'Button',
    variant: 'filled',
  },
};

export const FilledTonal: Story = {
  args: {
    children: 'Button',
    variant: 'filled-tonal',
  },
};

export const Outlined: Story = {
  args: {
    children: 'Button',
    variant: 'outlined',
  },
};

export const Text: Story = {
  args: {
    children: 'Button',
    variant: 'text',
  },
};

export const Elevated: Story = {
  args: {
    children: 'Button',
    variant: 'elevated',
  },
};

export const Destructive: Story = {
  args: {
    children: 'Delete',
    variant: 'destructive',
    leftIcon: <Trash2 className='h-4 w-4' />,
  },
};

export const WithLeftIcon: Story = {
  args: {
    children: 'Add Item',
    leftIcon: <Plus className='h-4 w-4' />,
  },
};

export const WithRightIcon: Story = {
  args: {
    children: 'Download',
    rightIcon: <Download className='h-4 w-4' />,
  },
};

export const WithBothIcons: Story = {
  args: {
    children: 'Send Message',
    leftIcon: <Send className='h-4 w-4' />,
    rightIcon: <Settings className='h-4 w-4' />,
  },
};

export const Loading: Story = {
  args: {
    children: 'Submitting...',
    isLoading: true,
  },
};

export const Disabled: Story = {
  args: {
    children: 'Disabled',
    disabled: true,
  },
};

export const SmallSize: Story = {
  args: {
    children: 'Small Button',
    size: 'sm',
    leftIcon: <Plus className='h-3 w-3' />,
  },
};

export const LargeSize: Story = {
  args: {
    children: 'Large Button',
    size: 'lg',
    leftIcon: <Download className='h-5 w-5' />,
  },
};

export const FullWidth: Story = {
  args: {
    children: 'Full Width Button',
    fullWidth: true,
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className='space-y-4'>
      <div className='flex gap-3'>
        <Button variant='filled'>Filled</Button>
        <Button variant='filled-tonal'>Filled Tonal</Button>
        <Button variant='outlined'>Outlined</Button>
        <Button variant='text'>Text</Button>
        <Button variant='elevated'>Elevated</Button>
        <Button variant='destructive'>Destructive</Button>
      </div>
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div className='flex items-center gap-3'>
      <Button size='sm'>Small</Button>
      <Button size='md'>Medium</Button>
      <Button size='lg'>Large</Button>
    </div>
  ),
};

export const WithIcons: Story = {
  render: () => (
    <div className='space-y-3'>
      <div className='flex gap-3'>
        <Button leftIcon={<Plus className='h-4 w-4' />}>Add</Button>
        <Button rightIcon={<Download className='h-4 w-4' />}>Download</Button>
        <Button
          leftIcon={<Send className='h-4 w-4' />}
          rightIcon={<Settings className='h-4 w-4' />}
        >
          Send & Configure
        </Button>
      </div>
    </div>
  ),
};

export const LoadingStates: Story = {
  render: () => (
    <div className='space-y-3'>
      <div className='flex gap-3'>
        <Button isLoading variant='filled'>
          Submitting...
        </Button>
        <Button isLoading variant='outlined'>
          Loading...
        </Button>
        <Button isLoading variant='destructive'>
          Deleting...
        </Button>
      </div>
    </div>
  ),
};
