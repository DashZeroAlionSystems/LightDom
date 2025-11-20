import type { Meta, StoryObj } from '@storybook/react';
import { KaggleDataGrid } from './KaggleDataGrid';

/**
 * KaggleDataGrid component extracted from Kaggle's Material Design system.
 *
 * Features:
 * - Sortable columns with visual indicators
 * - Striped rows for better readability
 * - Hover states
 * - Row click handlers
 * - Custom cell rendering
 * - Loading and empty states
 * - Responsive design
 */
const meta = {
  title: 'Kaggle/KaggleDataGrid',
  component: KaggleDataGrid,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Material Design data table component extracted from Kaggle.com. Features sorting, striping, and flexible rendering.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    sortable: {
      control: 'boolean',
      description: 'Enable column sorting',
    },
    striped: {
      control: 'boolean',
      description: 'Alternate row background colors',
    },
    hoverable: {
      control: 'boolean',
      description: 'Enable row hover effects',
    },
    loading: {
      control: 'boolean',
      description: 'Show loading spinner',
    },
    onRowClick: {
      action: 'row-clicked',
      description: 'Row click handler',
    },
  },
} satisfies Meta<typeof KaggleDataGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleData = [
  { id: 1, name: 'Alice Johnson', score: 95, rank: 'Gold', submissions: 42 },
  { id: 2, name: 'Bob Smith', score: 87, rank: 'Silver', submissions: 38 },
  { id: 3, name: 'Carol Davis', score: 82, rank: 'Silver', submissions: 35 },
  { id: 4, name: 'David Wilson', score: 78, rank: 'Bronze', submissions: 30 },
  { id: 5, name: 'Emma Brown', score: 76, rank: 'Bronze', submissions: 28 },
  { id: 6, name: 'Frank Miller', score: 71, rank: 'Bronze', submissions: 25 },
  { id: 7, name: 'Grace Lee', score: 68, rank: 'Participant', submissions: 20 },
  { id: 8, name: 'Henry Taylor', score: 65, rank: 'Participant', submissions: 18 },
];

const columns = [
  { key: 'rank', label: 'Rank', sortable: true, width: '100px' },
  { key: 'name', label: 'Participant', sortable: true },
  { key: 'score', label: 'Score', sortable: true, align: 'right' as const },
  { key: 'submissions', label: 'Submissions', sortable: true, align: 'center' as const },
];

/**
 * Basic data grid
 */
export const Default: Story = {
  args: {
    columns,
    data: sampleData,
    sortable: true,
    striped: true,
    hoverable: true,
  },
};

/**
 * With custom cell rendering
 */
export const CustomRendering: Story = {
  args: {
    columns: [
      { key: 'rank', label: 'Rank', sortable: true, width: '100px' },
      { key: 'name', label: 'Participant', sortable: true },
      {
        key: 'score',
        label: 'Score',
        sortable: true,
        align: 'right' as const,
        render: (value: number) => <span className='font-bold text-blue-600'>{value}</span>,
      },
      {
        key: 'rank',
        label: 'Badge',
        render: (value: string) => {
          const colors: Record<string, string> = {
            Gold: 'bg-yellow-100 text-yellow-800',
            Silver: 'bg-gray-100 text-gray-800',
            Bronze: 'bg-orange-100 text-orange-800',
            Participant: 'bg-blue-100 text-blue-800',
          };
          return (
            <span className={`px-2 py-1 rounded text-xs font-semibold ${colors[value]}`}>
              {value}
            </span>
          );
        },
      },
    ],
    data: sampleData,
    sortable: true,
    striped: true,
    hoverable: true,
  },
};

/**
 * Loading state
 */
export const Loading: Story = {
  args: {
    columns,
    data: sampleData,
    loading: true,
  },
};

/**
 * Empty state
 */
export const Empty: Story = {
  args: {
    columns,
    data: [],
    emptyMessage: 'No participants found. Be the first to join!',
  },
};

/**
 * Without sorting
 */
export const NonSortable: Story = {
  args: {
    columns,
    data: sampleData,
    sortable: false,
    striped: true,
    hoverable: true,
  },
};

/**
 * Without striping
 */
export const NonStriped: Story = {
  args: {
    columns,
    data: sampleData,
    sortable: true,
    striped: false,
    hoverable: true,
  },
};

/**
 * With row click handler
 */
export const Clickable: Story = {
  args: {
    columns,
    data: sampleData,
    sortable: true,
    striped: true,
    hoverable: true,
    onRowClick: (row: any) => alert(`Clicked: ${row.name}`),
  },
};

/**
 * Large dataset
 */
export const LargeDataset: Story = {
  args: {
    columns,
    data: Array.from({ length: 50 }, (_, i) => ({
      id: i + 1,
      name: `Participant ${i + 1}`,
      score: Math.floor(Math.random() * 100),
      rank: ['Gold', 'Silver', 'Bronze', 'Participant'][Math.floor(Math.random() * 4)],
      submissions: Math.floor(Math.random() * 50),
    })),
    sortable: true,
    striped: true,
    hoverable: true,
    defaultSortKey: 'score',
    defaultSortDirection: 'desc',
  },
};

/**
 * Competition leaderboard
 */
export const Leaderboard: Story = {
  args: {
    columns: [
      {
        key: 'position',
        label: '#',
        sortable: false,
        width: '60px',
        align: 'center' as const,
        render: (_value: any, _row: any, index: number) => (
          <span className='font-bold text-gray-700'>{index + 1}</span>
        ),
      },
      {
        key: 'name',
        label: 'Team',
        sortable: true,
        render: (value: string) => (
          <div className='flex items-center gap-2'>
            <img
              src={`https://i.pravatar.cc/40?img=${Math.floor(Math.random() * 70)}`}
              alt={value}
              className='w-8 h-8 rounded-full'
            />
            <span className='font-medium'>{value}</span>
          </div>
        ),
      },
      {
        key: 'score',
        label: 'Score',
        sortable: true,
        align: 'right' as const,
        render: (value: number) => (
          <span className='font-mono font-bold text-blue-600'>{value.toFixed(4)}</span>
        ),
      },
      {
        key: 'submissions',
        label: 'Submissions',
        sortable: true,
        align: 'center' as const,
      },
      {
        key: 'lastSubmission',
        label: 'Last Submit',
        sortable: true,
        render: (value: string) => <span className='text-sm text-gray-600'>{value}</span>,
      },
    ],
    data: [
      { id: 1, name: 'DataWizards', score: 0.9876, submissions: 142, lastSubmission: '2h ago' },
      { id: 2, name: 'ML Masters', score: 0.9845, submissions: 138, lastSubmission: '4h ago' },
      { id: 3, name: 'AI Ninjas', score: 0.9823, submissions: 135, lastSubmission: '1h ago' },
      { id: 4, name: 'Deep Learners', score: 0.9801, submissions: 128, lastSubmission: '6h ago' },
      { id: 5, name: 'Neural Nets', score: 0.9789, submissions: 125, lastSubmission: '3h ago' },
      { id: 6, name: 'Code Crushers', score: 0.9765, submissions: 120, lastSubmission: '5h ago' },
      { id: 7, name: 'Data Pirates', score: 0.9743, submissions: 115, lastSubmission: '7h ago' },
      { id: 8, name: 'Kaggle Kings', score: 0.9721, submissions: 110, lastSubmission: '8h ago' },
    ],
    sortable: true,
    striped: true,
    hoverable: true,
    defaultSortKey: 'score',
    defaultSortDirection: 'desc',
  },
};

/**
 * Dataset metadata table
 */
export const DatasetMetadata: Story = {
  args: {
    columns: [
      { key: 'field', label: 'Field', sortable: false },
      { key: 'type', label: 'Data Type', sortable: true },
      {
        key: 'nullable',
        label: 'Nullable',
        sortable: true,
        align: 'center' as const,
        render: (value: boolean) => (
          <span
            className={`px-2 py-1 rounded text-xs ${value ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}
          >
            {value ? 'Yes' : 'No'}
          </span>
        ),
      },
      { key: 'description', label: 'Description', sortable: false },
    ],
    data: [
      { field: 'user_id', type: 'integer', nullable: false, description: 'Unique user identifier' },
      { field: 'username', type: 'string', nullable: false, description: 'Display name' },
      { field: 'email', type: 'string', nullable: false, description: 'Contact email' },
      { field: 'age', type: 'integer', nullable: true, description: 'User age in years' },
      { field: 'country', type: 'string', nullable: true, description: 'Country code' },
      {
        field: 'created_at',
        type: 'datetime',
        nullable: false,
        description: 'Account creation timestamp',
      },
    ],
    sortable: true,
    striped: true,
    hoverable: false,
  },
};
