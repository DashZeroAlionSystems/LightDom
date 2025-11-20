import type { Meta, StoryObj } from '@storybook/react';
import { KaggleCard } from './KaggleCard';

/**
 * KaggleCard component extracted from Kaggle's Material Design system.
 *
 * Features:
 * - 4 variants: default, elevated, outlined, interactive
 * - Image support with hover zoom
 * - Badge with 6 color variants
 * - Title, description, and custom content
 * - Footer section
 * - Hover states and animations
 */
const meta = {
  title: 'Kaggle/KaggleCard',
  component: KaggleCard,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Material Design card component extracted from Kaggle.com. Supports images, badges, and multiple visual variants.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'elevated', 'outlined', 'interactive'],
      description: 'Visual style variant',
    },
    badgeVariant: {
      control: 'select',
      options: ['default', 'primary', 'success', 'warning', 'danger', 'info'],
      description: 'Badge color variant',
    },
    hoverable: {
      control: 'boolean',
      description: 'Enable hover effects',
    },
    onClick: {
      action: 'clicked',
      description: 'Click handler for card',
    },
  },
} satisfies Meta<typeof KaggleCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default card with minimal styling
 */
export const Default: Story = {
  args: {
    title: 'Dataset Title',
    description: 'This is a sample dataset description that provides context about the data.',
    variant: 'default',
  },
};

/**
 * Elevated card with shadow and hover effect
 */
export const Elevated: Story = {
  args: {
    title: 'COVID-19 Dataset',
    description:
      'Comprehensive pandemic data including cases, deaths, and vaccination rates across 200+ countries.',
    variant: 'elevated',
    badge: 'Featured',
    badgeVariant: 'primary',
  },
};

/**
 * Card with image
 */
export const WithImage: Story = {
  args: {
    title: 'Titanic Dataset',
    description:
      'Historic passenger data from the RMS Titanic for machine learning classification.',
    image: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=400&h=300&fit=crop',
    imageAlt: 'Titanic ship',
    variant: 'elevated',
    badge: 'Popular',
    badgeVariant: 'success',
  },
};

/**
 * Interactive card with click handler
 */
export const Interactive: Story = {
  args: {
    title: 'House Prices Dataset',
    description:
      'Predict house prices using advanced regression techniques with this comprehensive dataset.',
    variant: 'interactive',
    badge: 'Competition',
    badgeVariant: 'warning',
    onClick: () => alert('Card clicked!'),
  },
};

/**
 * Card with footer actions
 */
export const WithFooter: Story = {
  args: {
    title: 'MNIST Digits',
    description: 'Classic dataset of handwritten digits for computer vision tasks.',
    image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=300&fit=crop',
    badge: 'Beginner',
    badgeVariant: 'info',
    variant: 'elevated',
    footer: (
      <div className='flex items-center justify-between'>
        <span className='text-sm text-gray-600'>10,000 images</span>
        <button className='px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors'>
          View Dataset
        </button>
      </div>
    ),
  },
};

/**
 * Outlined card style
 */
export const Outlined: Story = {
  args: {
    title: 'Weather Dataset',
    description: 'Historical weather data for climate prediction and analysis.',
    variant: 'outlined',
    badge: 'New',
    badgeVariant: 'primary',
  },
};

/**
 * Card with custom content
 */
export const CustomContent: Story = {
  args: {
    title: 'Sentiment Analysis Dataset',
    description: 'Movie reviews labeled with sentiment for NLP tasks.',
    variant: 'elevated',
    badge: 'NLP',
    badgeVariant: 'info',
    children: (
      <div className='mt-3 flex gap-2'>
        <span className='px-2 py-1 bg-green-100 text-green-800 text-xs rounded'>CSV</span>
        <span className='px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded'>50K rows</span>
        <span className='px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded'>Text</span>
      </div>
    ),
  },
};

/**
 * Danger badge variant
 */
export const WithDangerBadge: Story = {
  args: {
    title: 'Fraud Detection Dataset',
    description: 'Credit card transactions with fraud labels for anomaly detection.',
    variant: 'elevated',
    badge: 'High Priority',
    badgeVariant: 'danger',
  },
};

/**
 * Full featured card
 */
export const FullFeatured: Story = {
  args: {
    title: 'SpaceX Launch Data',
    description:
      'Complete history of SpaceX launches including dates, outcomes, payloads, and rocket specifications.',
    image: 'https://images.unsplash.com/photo-1516849677043-ef67c9557e16?w=400&h=300&fit=crop',
    imageAlt: 'SpaceX rocket',
    variant: 'elevated',
    badge: 'Trending',
    badgeVariant: 'primary',
    children: (
      <div className='flex flex-col gap-2 mt-3'>
        <div className='flex items-center gap-2 text-sm text-gray-600'>
          <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20'>
            <path d='M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z' />
          </svg>
          <span>1,234 users</span>
        </div>
        <div className='flex gap-2'>
          <span className='px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded'>JSON</span>
          <span className='px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded'>5.2 MB</span>
          <span className='px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded'>
            Updated 2d ago
          </span>
        </div>
      </div>
    ),
    footer: (
      <div className='flex items-center justify-between'>
        <div className='flex -space-x-2'>
          <img
            className='w-8 h-8 rounded-full border-2 border-white'
            src='https://i.pravatar.cc/150?img=1'
            alt='User 1'
          />
          <img
            className='w-8 h-8 rounded-full border-2 border-white'
            src='https://i.pravatar.cc/150?img=2'
            alt='User 2'
          />
          <img
            className='w-8 h-8 rounded-full border-2 border-white'
            src='https://i.pravatar.cc/150?img=3'
            alt='User 3'
          />
        </div>
        <button className='px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors'>
          Explore
        </button>
      </div>
    ),
  },
};

/**
 * Grid layout with multiple cards
 */
export const GridLayout: Story = {
  render: () => (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
      <KaggleCard
        title='Dataset 1'
        description='Sample dataset for analysis'
        variant='elevated'
        badge='Popular'
        badgeVariant='success'
      />
      <KaggleCard
        title='Dataset 2'
        description='Another interesting dataset'
        variant='elevated'
        badge='New'
        badgeVariant='primary'
      />
      <KaggleCard
        title='Dataset 3'
        description='Third dataset in collection'
        variant='elevated'
        badge='Featured'
        badgeVariant='warning'
      />
      <KaggleCard
        title='Dataset 4'
        description='Fourth dataset with unique data'
        variant='elevated'
        badge='Trending'
        badgeVariant='info'
      />
      <KaggleCard
        title='Dataset 5'
        description='Fifth dataset for ML tasks'
        variant='elevated'
        badge='Hot'
        badgeVariant='danger'
      />
      <KaggleCard
        title='Dataset 6'
        description='Sixth dataset in the grid'
        variant='elevated'
        badge='Classic'
        badgeVariant='default'
      />
    </div>
  ),
};
