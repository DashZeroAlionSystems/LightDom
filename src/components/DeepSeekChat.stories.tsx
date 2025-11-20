import type { Meta, StoryObj } from '@storybook/react';
import DeepSeekChat from './DeepSeekChat';

/**
 * DeepSeekChat component
 * 
 * Auto-generated story - please customize as needed
 */
const meta: Meta<typeof DeepSeekChat> = {
  title: 'Components/DeepSeekChat',
  component: DeepSeekChat,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'DeepSeekChat component - Add your component description here'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    onWorkflowCreated: { control: 'text' },
    onDataMiningStarted: { control: 'text' },
    streamingEnabled: { control: 'boolean' },
    toolsEnabled: { control: 'boolean' }
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
