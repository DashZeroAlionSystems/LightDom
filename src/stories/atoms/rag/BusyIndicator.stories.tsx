import type { Meta, StoryObj } from '@storybook/react';
import { BusyIndicator } from '../../../components/atoms/rag/BusyIndicator';

const meta: Meta<typeof BusyIndicator> = {
  title: 'Atoms/RAG/BusyIndicator',
  component: BusyIndicator,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    variant: {
      control: 'select',
      options: ['spinner', 'pulse', 'dots'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof BusyIndicator>;

export const Default: Story = {
  args: {},
};

export const WithMessage: Story = {
  args: {
    message: 'Processing your request...',
  },
};

export const Spinner: Story = {
  args: {
    variant: 'spinner',
    message: 'Loading data...',
  },
};

export const Pulse: Story = {
  args: {
    variant: 'pulse',
    message: 'Analyzing content...',
  },
};

export const Dots: Story = {
  args: {
    variant: 'dots',
    message: 'Generating response...',
  },
};

export const Small: Story = {
  args: {
    size: 'sm',
    message: 'Please wait',
  },
};

export const Medium: Story = {
  args: {
    size: 'md',
    message: 'Processing',
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
    message: 'Loading large dataset',
  },
};

export const SpinnerSmall: Story = {
  args: {
    variant: 'spinner',
    size: 'sm',
  },
};

export const SpinnerLarge: Story = {
  args: {
    variant: 'spinner',
    size: 'lg',
    message: 'Training model...',
  },
};

export const DotsAnimation: Story = {
  args: {
    variant: 'dots',
    size: 'lg',
    message: 'Thinking...',
  },
};

export const PulseAnimation: Story = {
  args: {
    variant: 'pulse',
    size: 'lg',
    message: 'Connecting to server...',
  },
};
