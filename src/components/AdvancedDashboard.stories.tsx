import type { Meta, StoryObj } from '@storybook/react';
import AdvancedDashboard from './AdvancedDashboard';

/**
 * AdvancedDashboard component
 * 
 * Auto-generated story - please customize as needed
 */
const meta: Meta<typeof AdvancedDashboard> = {
  title: 'Components/AdvancedDashboard',
  component: AdvancedDashboard,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'AdvancedDashboard component - Add your component description here'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {

  }
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default story with standard props
 */
export const Default: Story = {
  args: {

  }
};

/**
 * Interactive story for testing
 */
export const Interactive: Story = {
  args: {

  }
};
