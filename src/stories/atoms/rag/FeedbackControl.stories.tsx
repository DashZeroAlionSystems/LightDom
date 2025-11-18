import type { Meta, StoryObj } from '@storybook/react';
import { FeedbackControl } from '../../../components/atoms/rag/FeedbackControl';

const meta: Meta<typeof FeedbackControl> = {
  title: 'Atoms/RAG/FeedbackControl',
  component: FeedbackControl,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    value: {
      control: 'select',
      options: ['positive', 'negative', null],
    },
  },
};

export default meta;
type Story = StoryObj<typeof FeedbackControl>;

export const Default: Story = {
  args: {},
};

export const WithLabels: Story = {
  args: {
    showLabels: true,
  },
};

export const PreselectedPositive: Story = {
  args: {
    value: 'positive',
  },
};

export const PreselectedNegative: Story = {
  args: {
    value: 'negative',
  },
};

export const Small: Story = {
  args: {
    size: 'sm',
  },
};

export const Medium: Story = {
  args: {
    size: 'md',
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
  },
};

export const LargeWithLabels: Story = {
  args: {
    size: 'lg',
    showLabels: true,
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

export const DisabledWithValue: Story = {
  args: {
    disabled: true,
    value: 'positive',
  },
};

export const WithCallback: Story = {
  args: {
    showLabels: true,
    onChange: (value) => {
      console.log('Feedback changed:', value);
      alert(`Feedback: ${value || 'cleared'}`);
    },
  },
};

export const Interactive: Story = {
  render: () => {
    const [feedback, setFeedback] = React.useState<'positive' | 'negative' | null>(null);
    
    return (
      <div className="space-y-4">
        <div className="text-center">
          <p className="text-sm text-on-surface-variant mb-2">
            Current feedback: <strong>{feedback || 'None'}</strong>
          </p>
          <FeedbackControl
            value={feedback}
            onChange={setFeedback}
            showLabels={true}
            size="lg"
          />
        </div>
      </div>
    );
  },
};

import React from 'react';
