import type { Meta, StoryObj } from '@storybook/react';
import { UIUXTrainingDashboard } from '../../components/neural/UIUXTrainingDashboard';

const meta: Meta<typeof UIUXTrainingDashboard> = {
  title: 'Neural Network/Training Dashboard',
  component: UIUXTrainingDashboard,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Comprehensive dashboard for training neural networks to understand UI/UX quality.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
