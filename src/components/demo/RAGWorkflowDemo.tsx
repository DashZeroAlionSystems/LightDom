import React, { useState } from 'react';
import {
  BotReplyBox,
  AccordionItem,
  AddButton,
  BusyIndicator,
  type FeedbackValue,
} from '@/components/atoms/rag';
import { Package, FileCode, Database, GitBranch } from 'lucide-react';

/**
 * RAG Workflow Demo Page
 * 
 * Demonstrates the complete RAG prompt response workflow UI components
 * in action with interactive examples.
 */
export const RAGWorkflowDemo: React.FC = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackValue>(null);
  const [messages, setMessages] = useState([
    {
      id: '1',
      status: 'success' as const,
      content: 'Successfully created a comprehensive set of RAG workflow UI components.',
      location: {
        repo: 'DashZeroAlionSystems/LightDom',
        task: 'Create RAG workflow UI components',
        branch: 'feature/rag-ui-components',
      },
      listItems: [
        {
          id: 'comp-1',
          label: 'BotReplyBox',
          description: 'Main container with status, location, and controls',
          icon: <Package className="h-5 w-5" />,
        },
        {
          id: 'comp-2',
          label: 'Interactive Controls',
          description: 'Feedback, copy, and retry functionality',
          icon: <FileCode className="h-5 w-5" />,
        },
        {
          id: 'comp-3',
          label: 'AccordionItem',
          description: 'Expandable sections with nested support',
          icon: <Database className="h-5 w-5" />,
        },
        {
          id: 'comp-4',
          label: 'UI Indicators',
          description: 'Loading animations and busy states',
          icon: <GitBranch className="h-5 w-5" />,
        },
      ],
    },
  ]);

  const handleRetry = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          status: 'success' as const,
          content: 'Retried successfully with the same model.',
          location: {
            repo: 'DashZeroAlionSystems/LightDom',
            task: 'Retry demonstration',
          },
        },
      ]);
    }, 2000);
  };

  const handleRetryWithModel = (modelId: string) => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          status: 'success' as const,
          content: `Retried successfully with ${modelId} model.`,
          location: {
            repo: 'DashZeroAlionSystems/LightDom',
            task: 'Model switching demonstration',
          },
        },
      ]);
    }, 2000);
  };

  const handleAddService = () => {
    alert('Add service clicked! This would open a modal or navigate to a form.');
  };

  return (
    <div className="min-h-screen bg-surface-container-low p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-on-surface mb-2">
            RAG Workflow UI Demo
          </h1>
          <p className="text-lg text-on-surface-variant">
            Interactive demonstration of RAG prompt response components
          </p>
        </div>

        {/* Bot Replies */}
        <div className="space-y-4">
          {messages.map((message) => (
            <BotReplyBox
              key={message.id}
              status={message.status}
              content={message.content}
              location={message.location}
              listItems={message.listItems}
              onFeedback={(value) => {
                console.log('Feedback:', value);
                setFeedback(value);
              }}
              onCopy={() => console.log('Content copied')}
              onRetry={handleRetry}
              onRetryWithModel={handleRetryWithModel}
            />
          ))}

          {/* Processing indicator */}
          {isProcessing && (
            <div className="rounded-xl bg-surface border border-outline shadow-sm p-8 flex justify-center">
              <BusyIndicator
                variant="dots"
                size="lg"
                message="Processing your request..."
              />
            </div>
          )}
        </div>

        {/* Accordion Examples */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-on-surface">
            Campaign Services
          </h2>
          
          <AccordionItem
            title="Marketing Campaign"
            icon={<Package className="h-5 w-5" />}
            badge={
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-primary/10 text-primary">
                3 services
              </span>
            }
          >
            <div className="space-y-2">
              <AccordionItem
                title="SEO Optimization"
                variant="bordered"
                size="sm"
                icon={<FileCode className="h-4 w-4" />}
              >
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Keyword research and analysis</li>
                  <li>Meta tag optimization</li>
                  <li>Content structure improvement</li>
                  <li>Backlink strategy</li>
                </ul>
              </AccordionItem>

              <AccordionItem
                title="Content Marketing"
                variant="bordered"
                size="sm"
                icon={<Database className="h-4 w-4" />}
              >
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Blog post creation</li>
                  <li>Social media content</li>
                  <li>Email campaigns</li>
                  <li>Newsletter management</li>
                </ul>
              </AccordionItem>

              <AccordionItem
                title="Analytics & Reporting"
                variant="bordered"
                size="sm"
                icon={<GitBranch className="h-4 w-4" />}
              >
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Traffic analysis</li>
                  <li>Conversion tracking</li>
                  <li>Performance reports</li>
                  <li>ROI calculations</li>
                </ul>
              </AccordionItem>
            </div>
          </AccordionItem>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-on-surface">
            Quick Actions
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AddButton
              label="Add Service"
              description="Deploy a new microservice"
              variant="primary"
              onClick={handleAddService}
            />
            
            <AddButton
              label="Add Campaign"
              description="Create a marketing campaign"
              variant="secondary"
              onClick={() => alert('Add campaign clicked!')}
            />
            
            <AddButton
              label="Add Workflow"
              description="Design a custom workflow"
              variant="outlined"
              onClick={() => alert('Add workflow clicked!')}
            />
            
            <AddButton
              label="Add Integration"
              description="Connect external service"
              variant="primary"
              onClick={() => alert('Add integration clicked!')}
            />
          </div>
        </div>

        {/* Feedback Status */}
        {feedback && (
          <div className="rounded-xl bg-surface border border-outline shadow-sm p-4">
            <p className="text-sm text-on-surface-variant">
              Current feedback:{' '}
              <span className="font-semibold text-on-surface">
                {feedback === 'positive' ? '👍 Positive' : '👎 Negative'}
              </span>
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="text-center pt-8 pb-4">
          <p className="text-sm text-on-surface-variant">
            View the Storybook for more examples and documentation
          </p>
          <button
            onClick={() => window.open('http://localhost:6006', '_blank')}
            className="mt-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Open Storybook
          </button>
        </div>
      </div>
    </div>
  );
};

export default RAGWorkflowDemo;
