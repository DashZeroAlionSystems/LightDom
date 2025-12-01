import type { Meta, StoryObj } from '@storybook/react';
import { Bot, CheckCircle, FileCode, Database, GitBranch, Package } from 'lucide-react';
import { BotReplyBox } from '../../../components/atoms/rag/BotReplyBox';

const meta: Meta<typeof BotReplyBox> = {
  title: 'Atoms/RAG/BotReplyBox',
  component: BotReplyBox,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    status: {
      control: 'select',
      options: ['success', 'error', 'pending', 'processing', 'warning'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof BotReplyBox>;

export const Default: Story = {
  args: {
    content: 'This is a basic bot reply with default settings.',
  },
};

export const Success: Story = {
  args: {
    status: 'success',
    content: 'Task completed successfully! All tests passed and the deployment is ready.',
  },
};

export const Error: Story = {
  args: {
    status: 'error',
    content: 'An error occurred while processing your request. Please check the logs for more details.',
  },
};

export const Pending: Story = {
  args: {
    status: 'pending',
    content: 'Your request is queued and will be processed shortly.',
  },
};

export const Processing: Story = {
  args: {
    status: 'processing',
    isProcessing: true,
    processingMessage: 'Analyzing your codebase...',
  },
};

export const Warning: Story = {
  args: {
    status: 'warning',
    content: 'Task completed with warnings. Some optional checks were skipped.',
  },
};

export const WithLocation: Story = {
  args: {
    status: 'success',
    content: 'Successfully created the feature branch and initial commit.',
    location: {
      repo: 'DashZeroAlionSystems/LightDom',
      task: '#123: Add RAG workflow components',
      branch: 'feature/rag-components',
    },
  },
};

export const WithListItems: Story = {
  args: {
    status: 'success',
    content: 'Generated the following components for your RAG workflow:',
    listItems: [
      {
        id: '1',
        label: 'BotReplyBox',
        description: 'Main reply container with status and controls',
        icon: <Package className="h-5 w-5" />,
      },
      {
        id: '2',
        label: 'AccordionItem',
        description: 'Expandable content sections with nested support',
        icon: <FileCode className="h-5 w-5" />,
      },
      {
        id: '3',
        label: 'TryAgainControl',
        description: 'Retry with model selection',
        icon: <Database className="h-5 w-5" />,
      },
      {
        id: '4',
        label: 'FeedbackControl',
        description: 'Thumbs up/down feedback mechanism',
        icon: <CheckCircle className="h-5 w-5" />,
      },
    ],
  },
};

export const FullFeatured: Story = {
  args: {
    status: 'success',
    content: 'Successfully implemented the RAG prompt response workflow UI components. All components are now available in the component library with full Storybook integration.',
    location: {
      repo: 'DashZeroAlionSystems/LightDom',
      task: 'Create RAG workflow UI components',
      branch: 'feature/rag-ui-components',
    },
    listItems: [
      {
        id: '1',
        label: 'Core Components',
        description: 'BotReplyBox, AccordionItem, AddButton',
        icon: <Package className="h-5 w-5" />,
      },
      {
        id: '2',
        label: 'Interactive Controls',
        description: 'FeedbackControl, CopyControl, TryAgainControl',
        icon: <FileCode className="h-5 w-5" />,
      },
      {
        id: '3',
        label: 'UI Indicators',
        description: 'BusyIndicator with multiple variants',
        icon: <Database className="h-5 w-5" />,
      },
      {
        id: '4',
        label: 'Storybook Stories',
        description: 'Comprehensive stories for all components',
        icon: <GitBranch className="h-5 w-5" />,
      },
    ],
    showFeedback: true,
    showCopy: true,
    showTryAgain: true,
  },
};

export const WithoutControls: Story = {
  args: {
    status: 'success',
    content: 'This reply box has all interactive controls disabled.',
    showFeedback: false,
    showCopy: false,
    showTryAgain: false,
  },
};

export const WithCallbacks: Story = {
  args: {
    status: 'success',
    content: 'This reply includes callback handlers for all interactive elements.',
    location: {
      repo: 'example/repo',
      task: 'Interactive demo',
    },
    onFeedback: (value) => {
      console.log('Feedback:', value);
      alert(`Feedback: ${value || 'cleared'}`);
    },
    onCopy: () => {
      console.log('Content copied');
      alert('Content copied to clipboard!');
    },
    onRetry: () => {
      console.log('Retrying with same model');
      alert('Retrying with same model...');
    },
    onRetryWithModel: (model) => {
      console.log('Retrying with model:', model);
      alert(`Retrying with model: ${model}`);
    },
  },
};

export const CustomBotIcon: Story = {
  args: {
    status: 'success',
    content: 'This reply uses a custom bot icon.',
    botIcon: (
      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
        <Bot className="h-5 w-5 text-white" />
      </div>
    ),
  },
};

export const CustomTitle: Story = {
  args: {
    status: 'success',
    title: 'Custom Status Title',
    content: 'You can override the default status title with a custom one.',
  },
};

export const LongContent: Story = {
  args: {
    status: 'success',
    content: `I've analyzed your codebase and implemented a comprehensive set of RAG workflow UI components. 

Here's what I created:

1. **BotReplyBox**: The main container that displays bot responses with status indicators, location info, and interactive controls.

2. **Interactive Controls**: Including FeedbackControl for thumbs up/down, CopyControl for copying content, and TryAgainControl for retrying with different AI models.

3. **AccordionItem**: A flexible accordion component that supports nested items, perfect for displaying hierarchical information.

4. **Visual Indicators**: BusyIndicator with three variants (spinner, pulse, dots) for showing processing states.

All components follow Material Design 3 principles and are fully integrated with your existing design system. They're also documented with comprehensive Storybook stories.`,
    location: {
      repo: 'DashZeroAlionSystems/LightDom',
      task: 'RAG UI Implementation',
      branch: 'feature/rag-components',
    },
  },
};

export const ProcessingState: Story = {
  args: {
    status: 'processing',
    isProcessing: true,
    processingMessage: 'Generating components...',
    content: '',
  },
};

export const ProcessingWithLocation: Story = {
  args: {
    status: 'processing',
    isProcessing: true,
    processingMessage: 'Analyzing repository structure...',
    location: {
      repo: 'DashZeroAlionSystems/LightDom',
      task: 'Component generation',
    },
  },
};
