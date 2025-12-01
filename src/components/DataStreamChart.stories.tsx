import type { Meta, StoryObj } from '@storybook/react';
import DataStreamChart from './DataStreamChart';

/**
 * DataStreamChart component
 * 
 * Auto-generated story - please customize as needed
 */
const meta: Meta<typeof DataStreamChart> = {
  title: 'Components/DataStreamChart',
  component: DataStreamChart,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'DataStreamChart component - Add your component description here'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    stream: { control: 'text' },
    id: { control: 'text' },
    name: { control: 'text' },
    type: { control: 'text' },
    active: { control: 'boolean' },
    lastUpdate: { control: 'text' },
    data: { control: 'text' }
  }
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default story with standard props
 */
export const Default: Story = {
  args: {
  stream: {},
  id: 'Sample text',
  name: 'Sample text',
  type: 'Sample text',
  active: true
  }
};

/**
 * Interactive story for testing
 */
export const Interactive: Story = {
  args: {
  stream: {},
  id: 'Sample text',
  name: 'Sample text',
  type: 'Sample text',
  active: true
  }
};
