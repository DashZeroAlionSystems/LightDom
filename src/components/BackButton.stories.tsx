import type { Meta, StoryObj } from '@storybook/react';
import BackButton from './BackButton';

/**
 * BackButton component
 * 
 * Auto-generated story - please customize as needed
 */
const meta: Meta<typeof BackButton> = {
  title: 'Components/BackButton',
  component: BackButton,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'BackButton component - Add your component description here'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    onBack: { control: 'text' },
    className: { control: 'text' }
  }
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default story with standard props
 */
export const Default: Story = {
  args: {
  onBack: () => {}
  }
};

/**
 * Interactive story for testing
 */
export const Interactive: Story = {
  args: {
  onBack: () => {}
  }
};
