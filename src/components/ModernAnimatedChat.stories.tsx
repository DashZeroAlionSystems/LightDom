import type { Meta, StoryObj } from '@storybook/react';
import { ModernAnimatedChat } from './ModernAnimatedChat';
import { useState } from 'react';

const meta: Meta<typeof ModernAnimatedChat> = {
  title: 'Components/Chat/Modern Animated Chat',
  component: ModernAnimatedChat,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'A beautiful, animated chat interface with smooth transitions, typing indicators, and excellent UX. Inspired by modern chat applications.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ModernAnimatedChat>;

// Sample messages for demos
const sampleMessages = [
  {
    id: '1',
    role: 'assistant' as const,
    content: 'Hello! I\'m DeepSeek AI. How can I help you today?',
    timestamp: new Date(Date.now() - 120000),
  },
  {
    id: '2',
    role: 'user' as const,
    content: 'Can you help me create a workflow for data mining?',
    timestamp: new Date(Date.now() - 60000),
  },
  {
    id: '3',
    role: 'assistant' as const,
    content: 'Of course! I can help you create a comprehensive data mining workflow. Let me generate a customized workflow based on your needs.',
    timestamp: new Date(Date.now() - 30000),
    tools: ['workflow-generator', 'data-mining-orchestrator'],
  },
];

export const Default: Story = {
  args: {
    placeholder: 'Ask me anything...',
  },
};

export const WithMessages: Story = {
  args: {
    messages: sampleMessages,
    placeholder: 'Continue the conversation...',
  },
};

export const Typing: Story = {
  args: {
    messages: sampleMessages,
    isTyping: true,
    placeholder: 'Waiting for response...',
  },
};

export const Interactive: Story = {
  render: () => {
    const InteractiveChatDemo = () => {
      const [messages, setMessages] = useState(sampleMessages);
      const [isTyping, setIsTyping] = useState(false);

      const handleSendMessage = async (content: string) => {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Show typing indicator
        setIsTyping(true);

        // Simulate assistant response after delay
        setTimeout(() => {
          const assistantResponse = {
            id: Date.now().toString(),
            role: 'assistant' as const,
            content: 'I received your message: "' + content + '". Let me process that for you.',
            timestamp: new Date(),
          };

          setMessages((prev) => [...prev, assistantResponse]);
          setIsTyping(false);
        }, 2000);
      };

      return (
        <div style={{ height: '600px' }}>
          <ModernAnimatedChat
            messages={messages}
            isTyping={isTyping}
            onSendMessage={handleSendMessage}
          />
        </div>
      );
    };

    return <InteractiveChatDemo />;
  },
};

export const WithToolCalls: Story = {
  args: {
    messages: [
      ...sampleMessages,
      {
        id: '4',
        role: 'assistant' as const,
        content: 'I\'ve executed multiple tools to help you with your request.',
        timestamp: new Date(),
        tools: ['crawler-service', 'seo-analyzer', 'schema-validator', 'data-enrichment'],
      },
    ],
  },
};

export const LongConversation: Story = {
  args: {
    messages: [
      {
        id: '1',
        role: 'assistant' as const,
        content: 'Hello! How can I assist you today?',
        timestamp: new Date(Date.now() - 600000),
      },
      {
        id: '2',
        role: 'user' as const,
        content: 'I need help with my project',
        timestamp: new Date(Date.now() - 540000),
      },
      {
        id: '3',
        role: 'assistant' as const,
        content: 'I\'d be happy to help! Can you tell me more about your project?',
        timestamp: new Date(Date.now() - 480000),
      },
      {
        id: '4',
        role: 'user' as const,
        content: 'It\'s a web application that needs data mining capabilities',
        timestamp: new Date(Date.now() - 420000),
      },
      {
        id: '5',
        role: 'assistant' as const,
        content: 'Great! I can help you set up data mining workflows. Would you like me to create a custom configuration?',
        timestamp: new Date(Date.now() - 360000),
        tools: ['workflow-generator'],
      },
      {
        id: '6',
        role: 'user' as const,
        content: 'Yes, that would be perfect!',
        timestamp: new Date(Date.now() - 300000),
      },
      {
        id: '7',
        role: 'assistant' as const,
        content: 'Perfect! I\'ve created a comprehensive data mining workflow tailored to your needs. The workflow includes automated crawling, schema validation, and data enrichment steps.',
        timestamp: new Date(Date.now() - 240000),
        tools: ['crawler-service', 'schema-validator', 'data-enrichment'],
      },
      {
        id: '8',
        role: 'user' as const,
        content: 'Can you also add SEO optimization?',
        timestamp: new Date(Date.now() - 180000),
      },
      {
        id: '9',
        role: 'assistant' as const,
        content: 'Absolutely! I\'ve integrated SEO optimization into your workflow. This includes automatic metadata generation, rich snippet creation, and search algorithm optimization.',
        timestamp: new Date(Date.now() - 120000),
        tools: ['seo-analyzer', 'rich-snippet-generator', 'search-optimizer'],
      },
    ],
  },
};

export const CustomPlaceholder: Story = {
  args: {
    placeholder: 'Type your question here and press Enter to send...',
  },
};

export const EmptyState: Story = {
  args: {
    messages: [],
    placeholder: 'Start a new conversation...',
  },
};
