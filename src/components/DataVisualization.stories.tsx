import type { Meta, StoryObj } from '@storybook/react';
import DataVisualization from './DataVisualization';

/**
 * DataVisualization component
 * 
 * Auto-generated story - please customize as needed
 */
const meta: Meta<typeof DataVisualization> = {
  title: 'Components/DataVisualization',
  component: DataVisualization,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'DataVisualization component - Add your component description here'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    data: { control: 'text' },
    height: { control: 'number' },
    className: { control: 'text' },
    showValues: { control: 'boolean' },
    animated: { control: 'boolean' }
  }
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default story with standard props
 */
export const Default: Story = {
  args: {
  data: []
  }
};

/**
 * Interactive story for testing
 */
export const Interactive: Story = {
  args: {
  data: []
  }
};
