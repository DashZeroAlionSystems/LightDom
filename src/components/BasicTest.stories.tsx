import type { Meta, StoryObj } from '@storybook/react';
import BasicTest from './BasicTest';

/**
 * BasicTest component
 * 
 * Auto-generated story - please customize as needed
 */
const meta: Meta<typeof BasicTest> = {
  title: 'Components/BasicTest',
  component: BasicTest,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'BasicTest component - Add your component description here'
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
