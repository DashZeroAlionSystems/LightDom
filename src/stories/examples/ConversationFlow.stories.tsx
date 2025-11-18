import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import {
  BotReplyBox,
  AccordionItem,
  BusyIndicator,
} from '../../../components/atoms/rag';
import { Package, Code, Database, FileText } from 'lucide-react';

const meta: Meta = {
  title: 'Examples/RAG Conversation Flow',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
# RAG Conversation Flow Example

This example demonstrates how to build a complete conversation flow using the RAG components,
simulating a multi-turn interaction between a user and an AI assistant.

## Features

- Multiple bot responses in sequence
- Processing states between messages
- Different status indicators (success, warning, error)
- Interactive controls on each message
- Nested accordions for detailed information
- Copy and retry functionality

## Use Cases

- AI chat interfaces
- Code generation workflows
- Task automation dashboards
- Technical support systems
- Documentation assistants
        `,
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

export const ConversationFlow: Story = {
  render: () => {
    const [messages] = useState([
      {
        id: '1',
        status: 'success' as const,
        content: 'I understand you want to create a new API endpoint for user authentication. Let me help you with that.',
        location: {
          repo: 'myproject/api',
          task: '#145: Add authentication endpoint',
          branch: 'feature/auth-endpoint',
        },
      },
      {
        id: '2',
        status: 'success' as const,
        content: 'I\'ve created the following files for your authentication endpoint:',
        listItems: [
          {
            id: 'file1',
            label: '/routes/auth.ts',
            description: 'Main authentication route handler',
            icon: <FileText className="h-5 w-5" />,
          },
          {
            id: 'file2',
            label: '/middleware/auth.middleware.ts',
            description: 'JWT token validation middleware',
            icon: <Code className="h-5 w-5" />,
          },
          {
            id: 'file3',
            label: '/services/auth.service.ts',
            description: 'Authentication business logic',
            icon: <Database className="h-5 w-5" />,
          },
          {
            id: 'file4',
            label: '/tests/auth.test.ts',
            description: 'Unit tests for authentication',
            icon: <Package className="h-5 w-5" />,
          },
        ],
      },
      {
        id: '3',
        status: 'warning' as const,
        content: 'Note: I noticed that the database schema needs to be updated to support refresh tokens. Would you like me to handle that as well?',
        location: {
          repo: 'myproject/api',
          task: '#145: Add authentication endpoint',
        },
      },
    ]);

    return (
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-on-surface mb-2">
            AI-Assisted Development Session
          </h2>
          <p className="text-on-surface-variant">
            A multi-turn conversation showing how the bot guides through implementation
          </p>
        </div>

        {messages.map((message) => (
          <BotReplyBox
            key={message.id}
            status={message.status}
            content={message.content}
            location={message.location}
            listItems={message.listItems}
            onFeedback={(value) => console.log('Feedback:', value)}
            onCopy={() => console.log('Copied:', message.id)}
            onRetry={() => console.log('Retry:', message.id)}
          />
        ))}

        {/* Additional context with accordions */}
        <div className="mt-8">
          <h3 className="text-xl font-semibold text-on-surface mb-4">
            Implementation Details
          </h3>
          
          <AccordionItem
            title="API Endpoints"
            icon={<Code className="h-5 w-5" />}
          >
            <div className="space-y-2">
              <div className="p-3 bg-surface-container rounded-lg">
                <div className="font-mono text-sm text-on-surface">POST /api/auth/login</div>
                <p className="text-xs text-on-surface-variant mt-1">Authenticate user with email and password</p>
              </div>
              <div className="p-3 bg-surface-container rounded-lg">
                <div className="font-mono text-sm text-on-surface">POST /api/auth/refresh</div>
                <p className="text-xs text-on-surface-variant mt-1">Refresh access token using refresh token</p>
              </div>
              <div className="p-3 bg-surface-container rounded-lg">
                <div className="font-mono text-sm text-on-surface">POST /api/auth/logout</div>
                <p className="text-xs text-on-surface-variant mt-1">Invalidate user session</p>
              </div>
            </div>
          </AccordionItem>

          <AccordionItem
            title="Security Considerations"
            icon={<Database className="h-5 w-5" />}
          >
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>JWT tokens expire after 15 minutes</li>
              <li>Refresh tokens expire after 7 days</li>
              <li>Rate limiting: 5 requests per minute</li>
              <li>Password hashing with bcrypt (10 rounds)</li>
              <li>CORS configured for frontend domain only</li>
            </ul>
          </AccordionItem>

          <AccordionItem
            title="Testing Strategy"
            icon={<Package className="h-5 w-5" />}
          >
            <div className="space-y-3">
              <AccordionItem
                title="Unit Tests"
                variant="bordered"
                size="sm"
              >
                <p className="text-sm">Testing authentication service logic, password hashing, token generation</p>
              </AccordionItem>
              <AccordionItem
                title="Integration Tests"
                variant="bordered"
                size="sm"
              >
                <p className="text-sm">Testing API endpoints with mocked database</p>
              </AccordionItem>
              <AccordionItem
                title="E2E Tests"
                variant="bordered"
                size="sm"
              >
                <p className="text-sm">Full authentication flow from login to protected route access</p>
              </AccordionItem>
            </div>
          </AccordionItem>
        </div>
      </div>
    );
  },
};

export const WithProcessing: Story = {
  render: () => {
    const [isProcessing, setIsProcessing] = useState(true);
    const [messages, setMessages] = useState<Array<{
      id: string;
      status: 'success' | 'error';
      content: string;
    }>>([]);

    // Simulate message generation
    React.useEffect(() => {
      const timer1 = setTimeout(() => {
        setMessages([{
          id: '1',
          status: 'success',
          content: 'Analyzing your codebase...',
        }]);
      }, 2000);

      const timer2 = setTimeout(() => {
        setMessages((prev) => [...prev, {
          id: '2',
          status: 'success',
          content: 'Found 3 optimization opportunities in your API routes.',
        }]);
      }, 4000);

      const timer3 = setTimeout(() => {
        setIsProcessing(false);
      }, 5000);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    }, []);

    return (
      <div className="max-w-3xl mx-auto space-y-4">
        {messages.map((message) => (
          <BotReplyBox
            key={message.id}
            status={message.status}
            content={message.content}
          />
        ))}

        {isProcessing && (
          <div className="rounded-xl bg-surface border border-outline shadow-sm p-8">
            <BusyIndicator
              variant="dots"
              size="lg"
              message="Generating detailed analysis..."
            />
          </div>
        )}
      </div>
    );
  },
};

export const ErrorHandling: Story = {
  render: () => (
    <div className="max-w-3xl mx-auto space-y-4">
      <BotReplyBox
        status="error"
        content="I encountered an error while trying to access the database. The connection timed out after 30 seconds."
        location={{
          repo: 'myproject/api',
          task: 'Database migration',
        }}
        showTryAgain={true}
        onRetry={() => alert('Retrying...')}
      />

      <BotReplyBox
        status="warning"
        content="The deployment was successful, but I noticed that 2 out of 5 health checks are failing. You may want to investigate the following services:"
        listItems={[
          {
            id: 'svc1',
            label: 'auth-service',
            description: 'Health check endpoint returning 503',
          },
          {
            id: 'svc2',
            label: 'notification-service',
            description: 'Timeout connecting to message queue',
          },
        ]}
      />

      <BotReplyBox
        status="success"
        content="I've created a rollback plan in case you need to revert these changes. The rollback script has been saved to your repository."
        location={{
          repo: 'myproject/api',
          branch: 'main',
        }}
      />
    </div>
  ),
};
