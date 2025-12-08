/**
 * Storybook Stories for RAG Error Boundary Component
 * 
 * Demonstrates error handling and recovery for RAG components
 */

import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import RagErrorBoundary from '../components/RagErrorBoundary';

// Component that throws an error
const ErrorComponent = () => {
  throw new Error('RAG service connection failed');
};

// Component that works fine
const WorkingComponent = () => (
  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
    <h3 className="text-lg font-semibold text-green-900">RAG Service</h3>
    <p className="text-sm text-green-700">Everything is working correctly!</p>
  </div>
);

const meta: Meta<typeof RagErrorBoundary> = {
  title: 'Components/RAG/ErrorBoundary',
  component: RagErrorBoundary,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Error boundary component that catches and handles errors from RAG service components with retry functionality.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    children: {
      control: false,
      description: 'Child components to wrap',
    },
    fallback: {
      control: false,
      description: 'Custom fallback UI',
    },
    onError: {
      description: 'Error callback',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Normal operation with no errors
 */
export const NoError: Story = {
  args: {
    children: <WorkingComponent />,
  },
};

/**
 * Error caught by boundary
 */
export const WithError: Story = {
  args: {
    children: <ErrorComponent />,
  },
};

/**
 * Error with custom fallback
 */
export const CustomFallback: Story = {
  args: {
    children: <ErrorComponent />,
    fallback: (
      <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-900">Custom Error UI</h3>
        <p className="text-sm text-blue-700">This is a custom fallback component.</p>
      </div>
    ),
  },
};
