import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { KaggleBadge } from './KaggleBadge';

/**
 * KaggleBadge component extracted from Kaggle's Material Design system.
 *
 * Features:
 * - 6 color variants: default, primary, success, warning, danger, info
 * - 3 sizes: sm, md, lg
 * - Optional icons
 * - Removable functionality
 * - Rounded or squared corners
 */
const meta = {
  title: 'Kaggle/KaggleBadge',
  component: KaggleBadge,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Material Design badge/tag component extracted from Kaggle.com. Used for labels, tags, and status indicators.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'primary', 'success', 'warning', 'danger', 'info'],
      description: 'Color variant',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size variant',
    },
    rounded: {
      control: 'boolean',
      description: 'Fully rounded corners (pill shape)',
    },
    onRemove: {
      action: 'removed',
      description: 'Remove button click handler',
    },
  },
} satisfies Meta<typeof KaggleBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default badge
 */
export const Default: Story = {
  args: {
    children: 'Default',
    variant: 'default',
    size: 'md',
  },
};

/**
 * Primary variant
 */
export const Primary: Story = {
  args: {
    children: 'Featured',
    variant: 'primary',
    size: 'md',
  },
};

/**
 * Success variant
 */
export const Success: Story = {
  args: {
    children: 'Completed',
    variant: 'success',
    size: 'md',
  },
};

/**
 * Warning variant
 */
export const Warning: Story = {
  args: {
    children: 'Pending',
    variant: 'warning',
    size: 'md',
  },
};

/**
 * Danger variant
 */
export const Danger: Story = {
  args: {
    children: 'Error',
    variant: 'danger',
    size: 'md',
  },
};

/**
 * Info variant
 */
export const Info: Story = {
  args: {
    children: 'New',
    variant: 'info',
    size: 'md',
  },
};

/**
 * Small size
 */
export const Small: Story = {
  args: {
    children: 'Small',
    variant: 'primary',
    size: 'sm',
  },
};

/**
 * Large size
 */
export const Large: Story = {
  args: {
    children: 'Large',
    variant: 'primary',
    size: 'lg',
  },
};

/**
 * Rounded (pill shape)
 */
export const Rounded: Story = {
  args: {
    children: 'Rounded',
    variant: 'primary',
    size: 'md',
    rounded: true,
  },
};

/**
 * With icon
 */
export const WithIcon: Story = {
  args: {
    children: 'Python',
    variant: 'info',
    size: 'md',
    icon: (
      <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20'>
        <path d='M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z' />
      </svg>
    ),
  },
};

/**
 * Removable badge
 */
export const Removable: Story = {
  args: {
    children: 'Machine Learning',
    variant: 'primary',
    size: 'md',
    onRemove: () => alert('Badge removed!'),
  },
};

/**
 * All variants showcase
 */
export const AllVariants: Story = {
  args: { children: '' },
  render: () => (
    <div className='flex flex-wrap gap-2'>
      <KaggleBadge variant='default'>Default</KaggleBadge>
      <KaggleBadge variant='primary'>Primary</KaggleBadge>
      <KaggleBadge variant='success'>Success</KaggleBadge>
      <KaggleBadge variant='warning'>Warning</KaggleBadge>
      <KaggleBadge variant='danger'>Danger</KaggleBadge>
      <KaggleBadge variant='info'>Info</KaggleBadge>
    </div>
  ),
};

/**
 * All sizes showcase
 */
export const AllSizes: Story = {
  args: { children: '' },
  render: () => (
    <div className='flex flex-wrap items-center gap-2'>
      <KaggleBadge variant='primary' size='sm'>
        Small
      </KaggleBadge>
      <KaggleBadge variant='primary' size='md'>
        Medium
      </KaggleBadge>
      <KaggleBadge variant='primary' size='lg'>
        Large
      </KaggleBadge>
    </div>
  ),
};

/**
 * Dataset tags example
 */
export const DatasetTags: Story = {
  args: { children: '' },
  render: () => (
    <div className='flex flex-wrap gap-2'>
      <KaggleBadge variant='primary' rounded>
        CSV
      </KaggleBadge>
      <KaggleBadge variant='info' rounded>
        50K Rows
      </KaggleBadge>
      <KaggleBadge variant='success' rounded>
        Clean Data
      </KaggleBadge>
      <KaggleBadge variant='default' rounded>
        Public
      </KaggleBadge>
      <KaggleBadge variant='warning' rounded>
        Large File
      </KaggleBadge>
    </div>
  ),
};

/**
 * Competition labels example
 */
export const CompetitionLabels: Story = {
  args: { children: '' },
  render: () => (
    <div className='flex flex-col gap-3'>
      <div className='flex items-center gap-2'>
        <span className='text-sm text-gray-600 w-20'>Status:</span>
        <KaggleBadge variant='success' size='sm'>
          Active
        </KaggleBadge>
      </div>
      <div className='flex items-center gap-2'>
        <span className='text-sm text-gray-600 w-20'>Difficulty:</span>
        <KaggleBadge variant='warning' size='sm'>
          Intermediate
        </KaggleBadge>
      </div>
      <div className='flex items-center gap-2'>
        <span className='text-sm text-gray-600 w-20'>Prize:</span>
        <KaggleBadge variant='primary' size='sm'>
          $10,000
        </KaggleBadge>
      </div>
      <div className='flex items-center gap-2'>
        <span className='text-sm text-gray-600 w-20'>Category:</span>
        <KaggleBadge variant='info' size='sm'>
          Computer Vision
        </KaggleBadge>
      </div>
    </div>
  ),
};

/**
 * Tag filter example with remove
 */
export const TagFilter: Story = {
  args: { children: '' },
  render: () => {
    const [tags, setTags] = React.useState([
      { id: 1, label: 'Python', variant: 'primary' as const },
      { id: 2, label: 'Machine Learning', variant: 'info' as const },
      { id: 3, label: 'Data Science', variant: 'success' as const },
      { id: 4, label: 'Deep Learning', variant: 'warning' as const },
    ]);

    const removeTag = (id: number) => {
      setTags(tags.filter(tag => tag.id !== id));
    };

    return (
      <div className='flex flex-col gap-3'>
        <div className='text-sm font-medium text-gray-700'>Selected Tags:</div>
        <div className='flex flex-wrap gap-2'>
          {tags.map(tag => (
            <KaggleBadge
              key={tag.id}
              variant={tag.variant}
              onRemove={() => removeTag(tag.id)}
              rounded
            >
              {tag.label}
            </KaggleBadge>
          ))}
        </div>
        {tags.length === 0 && <div className='text-sm text-gray-500'>No tags selected</div>}
      </div>
    );
  },
};

/**
 * Status indicators
 */
export const StatusIndicators: Story = {
  args: { children: '' },
  render: () => (
    <div className='flex flex-col gap-2'>
      <div className='flex items-center gap-2'>
        <KaggleBadge variant='success' size='sm' rounded>
          Online
        </KaggleBadge>
        <span className='text-sm'>5 users</span>
      </div>
      <div className='flex items-center gap-2'>
        <KaggleBadge variant='warning' size='sm' rounded>
          Away
        </KaggleBadge>
        <span className='text-sm'>2 users</span>
      </div>
      <div className='flex items-center gap-2'>
        <KaggleBadge variant='danger' size='sm' rounded>
          Busy
        </KaggleBadge>
        <span className='text-sm'>1 user</span>
      </div>
      <div className='flex items-center gap-2'>
        <KaggleBadge variant='default' size='sm' rounded>
          Offline
        </KaggleBadge>
        <span className='text-sm'>12 users</span>
      </div>
    </div>
  ),
};
