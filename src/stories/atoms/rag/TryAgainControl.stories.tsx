import type { Meta, StoryObj } from '@storybook/react';
import { TryAgainControl } from '../../../components/atoms/rag/TryAgainControl';

const meta: Meta<typeof TryAgainControl> = {
  title: 'Atoms/RAG/TryAgainControl',
  component: TryAgainControl,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof TryAgainControl>;

export const Default: Story = {
  args: {
    onRetry: () => console.log('Retrying...'),
  },
};

export const WithModelSelector: Story = {
  args: {
    showModelSelector: true,
    onRetry: () => console.log('Retrying with same model...'),
    onRetryWithModel: (model) => console.log('Retrying with model:', model),
  },
};

export const SelectedModel: Story = {
  args: {
    showModelSelector: true,
    selectedModel: 'gpt-4',
    onRetry: () => console.log('Retrying...'),
    onRetryWithModel: (model) => console.log('Retrying with model:', model),
  },
};

export const CustomModels: Story = {
  args: {
    showModelSelector: true,
    models: [
      { id: 'llama-3', name: 'Llama 3', description: 'Meta\'s open model' },
      { id: 'mistral', name: 'Mistral', description: 'Fast and efficient' },
      { id: 'deepseek-r1', name: 'DeepSeek R1', description: 'Advanced reasoning' },
    ],
    selectedModel: 'mistral',
    onRetry: () => console.log('Retrying...'),
    onRetryWithModel: (model) => console.log('Retrying with model:', model),
  },
};

export const Small: Story = {
  args: {
    size: 'sm',
    showModelSelector: true,
    onRetry: () => console.log('Retrying...'),
  },
};

export const Medium: Story = {
  args: {
    size: 'md',
    showModelSelector: true,
    onRetry: () => console.log('Retrying...'),
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
    showModelSelector: true,
    onRetry: () => console.log('Retrying...'),
  },
};

export const Loading: Story = {
  args: {
    isLoading: true,
    showModelSelector: true,
    onRetry: () => console.log('Retrying...'),
  },
};

export const WithoutModelSelector: Story = {
  args: {
    showModelSelector: false,
    onRetry: () => console.log('Retrying...'),
  },
};

export const WithCallbacks: Story = {
  args: {
    showModelSelector: true,
    onRetry: () => {
      console.log('Exact retry triggered');
      alert('Retrying with same model...');
    },
    onRetryWithModel: (model) => {
      console.log('Retry with different model:', model);
      alert(`Retrying with model: ${model}`);
    },
  },
};
