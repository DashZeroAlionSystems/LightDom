import type { Meta, StoryObj } from '@storybook/react';
import { KaggleAvatar } from './KaggleAvatar';

/**
 * KaggleAvatar component extracted from Kaggle's Material Design system.
 *
 * Features:
 * - 5 sizes: xs, sm, md, lg, xl
 * - 2 shapes: circle, square
 * - Status indicators: online, offline, away, busy
 * - Fallback text support
 * - Image loading states
 * - Border option
 * - Click handler
 */
const meta = {
  title: 'Kaggle/KaggleAvatar',
  component: KaggleAvatar,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Material Design avatar component extracted from Kaggle.com. Used for user profiles with status indicators and fallbacks.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Avatar size',
    },
    shape: {
      control: 'select',
      options: ['circle', 'square'],
      description: 'Avatar shape',
    },
    status: {
      control: 'select',
      options: [undefined, 'online', 'offline', 'away', 'busy'],
      description: 'Status indicator',
    },
    border: {
      control: 'boolean',
      description: 'Show border ring',
    },
    onClick: {
      action: 'clicked',
      description: 'Click handler',
    },
  },
} satisfies Meta<typeof KaggleAvatar>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default avatar with image
 */
export const Default: Story = {
  args: {
    src: 'https://i.pravatar.cc/150?img=1',
    alt: 'John Doe',
    size: 'md',
  },
};

/**
 * With fallback text
 */
export const Fallback: Story = {
  args: {
    fallback: 'JD',
    alt: 'John Doe',
    size: 'md',
  },
};

/**
 * Online status
 */
export const Online: Story = {
  args: {
    src: 'https://i.pravatar.cc/150?img=2',
    alt: 'Jane Smith',
    size: 'md',
    status: 'online',
  },
};

/**
 * Offline status
 */
export const Offline: Story = {
  args: {
    src: 'https://i.pravatar.cc/150?img=3',
    alt: 'Bob Johnson',
    size: 'md',
    status: 'offline',
  },
};

/**
 * Away status
 */
export const Away: Story = {
  args: {
    src: 'https://i.pravatar.cc/150?img=4',
    alt: 'Alice Brown',
    size: 'md',
    status: 'away',
  },
};

/**
 * Busy status
 */
export const Busy: Story = {
  args: {
    src: 'https://i.pravatar.cc/150?img=5',
    alt: 'Charlie Wilson',
    size: 'md',
    status: 'busy',
  },
};

/**
 * Extra small size
 */
export const ExtraSmall: Story = {
  args: {
    src: 'https://i.pravatar.cc/150?img=6',
    alt: 'User',
    size: 'xs',
    status: 'online',
  },
};

/**
 * Small size
 */
export const Small: Story = {
  args: {
    src: 'https://i.pravatar.cc/150?img=7',
    alt: 'User',
    size: 'sm',
    status: 'online',
  },
};

/**
 * Large size
 */
export const Large: Story = {
  args: {
    src: 'https://i.pravatar.cc/150?img=8',
    alt: 'User',
    size: 'lg',
    status: 'online',
  },
};

/**
 * Extra large size
 */
export const ExtraLarge: Story = {
  args: {
    src: 'https://i.pravatar.cc/150?img=9',
    alt: 'User',
    size: 'xl',
    status: 'online',
  },
};

/**
 * Square shape
 */
export const Square: Story = {
  args: {
    src: 'https://i.pravatar.cc/150?img=10',
    alt: 'User',
    size: 'md',
    shape: 'square',
    status: 'online',
  },
};

/**
 * With border
 */
export const WithBorder: Story = {
  args: {
    src: 'https://i.pravatar.cc/150?img=11',
    alt: 'User',
    size: 'md',
    border: true,
    status: 'online',
  },
};

/**
 * Clickable avatar
 */
export const Clickable: Story = {
  args: {
    src: 'https://i.pravatar.cc/150?img=12',
    alt: 'User',
    size: 'md',
    onClick: () => alert('Avatar clicked!'),
  },
};

/**
 * All sizes showcase
 */
export const AllSizes: Story = {
  render: () => (
    <div className='flex items-center gap-4'>
      <KaggleAvatar src='https://i.pravatar.cc/150?img=13' size='xs' status='online' />
      <KaggleAvatar src='https://i.pravatar.cc/150?img=14' size='sm' status='online' />
      <KaggleAvatar src='https://i.pravatar.cc/150?img=15' size='md' status='online' />
      <KaggleAvatar src='https://i.pravatar.cc/150?img=16' size='lg' status='online' />
      <KaggleAvatar src='https://i.pravatar.cc/150?img=17' size='xl' status='online' />
    </div>
  ),
};

/**
 * All statuses showcase
 */
export const AllStatuses: Story = {
  render: () => (
    <div className='flex items-center gap-4'>
      <div className='flex flex-col items-center gap-2'>
        <KaggleAvatar src='https://i.pravatar.cc/150?img=18' size='md' status='online' />
        <span className='text-xs text-gray-600'>Online</span>
      </div>
      <div className='flex flex-col items-center gap-2'>
        <KaggleAvatar src='https://i.pravatar.cc/150?img=19' size='md' status='away' />
        <span className='text-xs text-gray-600'>Away</span>
      </div>
      <div className='flex flex-col items-center gap-2'>
        <KaggleAvatar src='https://i.pravatar.cc/150?img=20' size='md' status='busy' />
        <span className='text-xs text-gray-600'>Busy</span>
      </div>
      <div className='flex flex-col items-center gap-2'>
        <KaggleAvatar src='https://i.pravatar.cc/150?img=21' size='md' status='offline' />
        <span className='text-xs text-gray-600'>Offline</span>
      </div>
    </div>
  ),
};

/**
 * Avatar group
 */
export const AvatarGroup: Story = {
  render: () => (
    <div className='flex -space-x-2'>
      <KaggleAvatar src='https://i.pravatar.cc/150?img=22' size='md' border />
      <KaggleAvatar src='https://i.pravatar.cc/150?img=23' size='md' border />
      <KaggleAvatar src='https://i.pravatar.cc/150?img=24' size='md' border />
      <KaggleAvatar src='https://i.pravatar.cc/150?img=25' size='md' border />
      <div className='w-10 h-10 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs font-semibold text-gray-600'>
        +5
      </div>
    </div>
  ),
};

/**
 * User profile card
 */
export const UserProfile: Story = {
  render: () => (
    <div className='bg-white rounded-lg shadow-md p-6 w-64'>
      <div className='flex flex-col items-center'>
        <KaggleAvatar src='https://i.pravatar.cc/150?img=26' size='xl' status='online' />
        <h3 className='mt-4 text-lg font-bold text-gray-900'>Alice Johnson</h3>
        <p className='text-sm text-gray-600'>Kaggle Master</p>
        <div className='mt-4 flex gap-2'>
          <div className='text-center'>
            <div className='text-xl font-bold text-blue-600'>42</div>
            <div className='text-xs text-gray-600'>Competitions</div>
          </div>
          <div className='w-px bg-gray-200' />
          <div className='text-center'>
            <div className='text-xl font-bold text-green-600'>156</div>
            <div className='text-xs text-gray-600'>Datasets</div>
          </div>
          <div className='w-px bg-gray-200' />
          <div className='text-center'>
            <div className='text-xl font-bold text-purple-600'>89</div>
            <div className='text-xs text-gray-600'>Notebooks</div>
          </div>
        </div>
      </div>
    </div>
  ),
};

/**
 * Comment thread
 */
export const CommentThread: Story = {
  render: () => (
    <div className='space-y-4 w-96'>
      {[
        { name: 'Alice', text: 'Great analysis! The feature engineering is impressive.', img: 27 },
        { name: 'Bob', text: 'Thanks! I spent a lot of time on that part.', img: 28 },
        { name: 'Carol', text: 'Have you tried XGBoost? Might improve your score.', img: 29 },
      ].map((comment, i) => (
        <div key={i} className='flex gap-3'>
          <KaggleAvatar
            src={`https://i.pravatar.cc/150?img=${comment.img}`}
            alt={comment.name}
            size='sm'
            status={i === 0 ? 'online' : undefined}
          />
          <div className='flex-1'>
            <div className='flex items-center gap-2 mb-1'>
              <span className='font-semibold text-sm text-gray-900'>{comment.name}</span>
              <span className='text-xs text-gray-500'>2h ago</span>
            </div>
            <p className='text-sm text-gray-700'>{comment.text}</p>
          </div>
        </div>
      ))}
    </div>
  ),
};

/**
 * Team members list
 */
export const TeamMembers: Story = {
  render: () => (
    <div className='space-y-2 w-80'>
      {[
        { name: 'Alice Johnson', role: 'Team Lead', status: 'online' as const, img: 30 },
        { name: 'Bob Smith', role: 'Data Scientist', status: 'online' as const, img: 31 },
        { name: 'Carol Davis', role: 'ML Engineer', status: 'away' as const, img: 32 },
        { name: 'David Wilson', role: 'Analyst', status: 'offline' as const, img: 33 },
      ].map((member, i) => (
        <div
          key={i}
          className='flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer'
        >
          <KaggleAvatar
            src={`https://i.pravatar.cc/150?img=${member.img}`}
            alt={member.name}
            size='md'
            status={member.status}
          />
          <div className='flex-1'>
            <div className='font-medium text-sm text-gray-900'>{member.name}</div>
            <div className='text-xs text-gray-500'>{member.role}</div>
          </div>
        </div>
      ))}
    </div>
  ),
};
