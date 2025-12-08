import type { Meta, StoryObj } from '@storybook/react';
import { KaggleTabs } from './KaggleTabs';

/**
 * KaggleTabs component extracted from Kaggle's Material Design system.
 *
 * Features:
 * - 3 variants: line, pills, enclosed
 * - 3 sizes: sm, md, lg
 * - Icon support
 * - Badge/counter support
 * - Disabled states
 * - Keyboard navigation (Arrow keys, Enter, Space)
 * - Full width option
 * - Smooth content transitions
 */
const meta = {
  title: 'Kaggle/KaggleTabs',
  component: KaggleTabs,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Material Design tabs component extracted from Kaggle.com. Features multiple variants, keyboard navigation, and accessibility support.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['line', 'pills', 'enclosed'],
      description: 'Visual variant',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size variant',
    },
    fullWidth: {
      control: 'boolean',
      description: 'Make tabs span full width',
    },
    onChange: {
      action: 'tab-changed',
      description: 'Tab change handler',
    },
  },
} satisfies Meta<typeof KaggleTabs>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleTabs = [
  {
    key: 'overview',
    label: 'Overview',
    content: (
      <div className='p-4'>
        <h3 className='text-lg font-bold mb-2'>Overview</h3>
        <p className='text-gray-600'>
          This is the overview tab content. It provides a high-level summary of the dataset.
        </p>
      </div>
    ),
  },
  {
    key: 'data',
    label: 'Data',
    content: (
      <div className='p-4'>
        <h3 className='text-lg font-bold mb-2'>Data</h3>
        <p className='text-gray-600'>
          Explore the dataset structure, columns, and sample records here.
        </p>
      </div>
    ),
  },
  {
    key: 'code',
    label: 'Code',
    content: (
      <div className='p-4'>
        <h3 className='text-lg font-bold mb-2'>Code</h3>
        <p className='text-gray-600'>Browse notebooks and scripts related to this dataset.</p>
      </div>
    ),
  },
];

/**
 * Default line variant
 */
export const Default: Story = {
  args: {
    tabs: sampleTabs,
    variant: 'line',
    size: 'md',
  },
};

/**
 * Pills variant
 */
export const Pills: Story = {
  args: {
    tabs: sampleTabs,
    variant: 'pills',
    size: 'md',
  },
};

/**
 * Enclosed variant
 */
export const Enclosed: Story = {
  args: {
    tabs: sampleTabs,
    variant: 'enclosed',
    size: 'md',
  },
};

/**
 * With badges
 */
export const WithBadges: Story = {
  args: {
    tabs: [
      {
        key: 'all',
        label: 'All',
        badge: 156,
        content: <div className='p-4'>All items (156)</div>,
      },
      {
        key: 'active',
        label: 'Active',
        badge: 42,
        content: <div className='p-4'>Active items (42)</div>,
      },
      {
        key: 'completed',
        label: 'Completed',
        badge: 98,
        content: <div className='p-4'>Completed items (98)</div>,
      },
      {
        key: 'archived',
        label: 'Archived',
        badge: 16,
        content: <div className='p-4'>Archived items (16)</div>,
      },
    ],
    variant: 'line',
    size: 'md',
  },
};

/**
 * With icons
 */
export const WithIcons: Story = {
  args: {
    tabs: [
      {
        key: 'overview',
        label: 'Overview',
        icon: (
          <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20'>
            <path d='M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z' />
          </svg>
        ),
        content: <div className='p-4'>Overview content</div>,
      },
      {
        key: 'data',
        label: 'Data',
        icon: (
          <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20'>
            <path d='M3 12v3c0 1.657 3.134 3 7 3s7-1.343 7-3v-3c0 1.657-3.134 3-7 3s-7-1.343-7-3z' />
            <path d='M3 7v3c0 1.657 3.134 3 7 3s7-1.343 7-3V7c0 1.657-3.134 3-7 3S3 8.657 3 7z' />
            <path d='M17 5c0 1.657-3.134 3-7 3S3 6.657 3 5s3.134-3 7-3 7 1.343 7 3z' />
          </svg>
        ),
        content: <div className='p-4'>Data content</div>,
      },
      {
        key: 'settings',
        label: 'Settings',
        icon: (
          <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20'>
            <path
              fillRule='evenodd'
              d='M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z'
              clipRule='evenodd'
            />
          </svg>
        ),
        content: <div className='p-4'>Settings content</div>,
      },
    ],
    variant: 'line',
    size: 'md',
  },
};

/**
 * With disabled tab
 */
export const WithDisabled: Story = {
  args: {
    tabs: [
      {
        key: 'overview',
        label: 'Overview',
        content: <div className='p-4'>Overview content</div>,
      },
      {
        key: 'data',
        label: 'Data',
        content: <div className='p-4'>Data content</div>,
      },
      {
        key: 'premium',
        label: 'Premium',
        disabled: true,
        content: <div className='p-4'>Premium content (locked)</div>,
      },
    ],
    variant: 'line',
    size: 'md',
  },
};

/**
 * Small size
 */
export const Small: Story = {
  args: {
    tabs: sampleTabs,
    variant: 'line',
    size: 'sm',
  },
};

/**
 * Large size
 */
export const Large: Story = {
  args: {
    tabs: sampleTabs,
    variant: 'line',
    size: 'lg',
  },
};

/**
 * Full width
 */
export const FullWidth: Story = {
  args: {
    tabs: sampleTabs,
    variant: 'line',
    size: 'md',
    fullWidth: true,
  },
};

/**
 * Dataset exploration example
 */
export const DatasetExploration: Story = {
  args: {
    tabs: [
      {
        key: 'overview',
        label: 'Overview',
        content: (
          <div className='p-4'>
            <h3 className='text-xl font-bold mb-3'>Titanic Dataset</h3>
            <p className='text-gray-600 mb-4'>
              Historic passenger data from the RMS Titanic for machine learning classification
              tasks.
            </p>
            <div className='grid grid-cols-3 gap-4'>
              <div className='p-4 bg-blue-50 rounded'>
                <div className='text-2xl font-bold text-blue-600'>891</div>
                <div className='text-sm text-gray-600'>Passengers</div>
              </div>
              <div className='p-4 bg-green-50 rounded'>
                <div className='text-2xl font-bold text-green-600'>12</div>
                <div className='text-sm text-gray-600'>Features</div>
              </div>
              <div className='p-4 bg-purple-50 rounded'>
                <div className='text-2xl font-bold text-purple-600'>38.4%</div>
                <div className='text-sm text-gray-600'>Survival Rate</div>
              </div>
            </div>
          </div>
        ),
      },
      {
        key: 'data',
        label: 'Data',
        badge: 891,
        content: (
          <div className='p-4'>
            <table className='min-w-full divide-y divide-gray-200'>
              <thead>
                <tr>
                  <th className='px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase'>
                    Name
                  </th>
                  <th className='px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase'>
                    Age
                  </th>
                  <th className='px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase'>
                    Class
                  </th>
                  <th className='px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase'>
                    Survived
                  </th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-200'>
                <tr>
                  <td className='px-4 py-2'>Braund, Mr. Owen</td>
                  <td className='px-4 py-2'>22</td>
                  <td className='px-4 py-2'>3rd</td>
                  <td className='px-4 py-2'>No</td>
                </tr>
                <tr>
                  <td className='px-4 py-2'>Cumings, Mrs. John</td>
                  <td className='px-4 py-2'>38</td>
                  <td className='px-4 py-2'>1st</td>
                  <td className='px-4 py-2'>Yes</td>
                </tr>
                <tr>
                  <td className='px-4 py-2'>Heikkinen, Miss. Laina</td>
                  <td className='px-4 py-2'>26</td>
                  <td className='px-4 py-2'>3rd</td>
                  <td className='px-4 py-2'>Yes</td>
                </tr>
              </tbody>
            </table>
          </div>
        ),
      },
      {
        key: 'code',
        label: 'Code',
        badge: 156,
        content: (
          <div className='p-4'>
            <p className='text-gray-600 mb-4'>156 notebooks analyzing this dataset</p>
            <div className='space-y-2'>
              {[
                'Exploratory Data Analysis',
                'RandomForest Classifier',
                'Deep Learning Approach',
              ].map((title, i) => (
                <div key={i} className='p-3 bg-gray-50 rounded hover:bg-gray-100 cursor-pointer'>
                  <div className='font-medium'>{title}</div>
                  <div className='text-sm text-gray-600'>Python • Updated 2d ago</div>
                </div>
              ))}
            </div>
          </div>
        ),
      },
      {
        key: 'discussion',
        label: 'Discussion',
        badge: 42,
        content: (
          <div className='p-4'>
            <p className='text-gray-600'>42 discussions about this dataset</p>
          </div>
        ),
      },
    ],
    variant: 'line',
    size: 'md',
  },
};

/**
 * Competition tabs example
 */
export const CompetitionTabs: Story = {
  args: {
    tabs: [
      {
        key: 'leaderboard',
        label: 'Leaderboard',
        icon: (
          <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20'>
            <path d='M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z' />
          </svg>
        ),
        content: (
          <div className='p-4'>
            <h3 className='font-bold mb-3'>Top Performers</h3>
            <div className='space-y-2'>
              {['TeamAlpha - 0.9876', 'DataNinjas - 0.9845', 'MLMasters - 0.9812'].map(
                (team, i) => (
                  <div key={i} className='flex items-center justify-between p-2 bg-gray-50 rounded'>
                    <div className='flex items-center gap-2'>
                      <span className='font-bold text-gray-500'>#{i + 1}</span>
                      <span>{team}</span>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        ),
      },
      {
        key: 'rules',
        label: 'Rules',
        content: <div className='p-4'>Competition rules and guidelines</div>,
      },
      {
        key: 'prizes',
        label: 'Prizes',
        badge: '$50K',
        content: <div className='p-4'>Prize distribution information</div>,
      },
    ],
    variant: 'pills',
    size: 'md',
  },
};
