/**
 * Copilot UI Demo - Showcasing VS Code Copilot-inspired components
 */

import React, { useState } from 'react';
import {
  SearchOutlined,
  FileTextOutlined,
  BulbOutlined,
  CodeOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  SettingOutlined,
  StarOutlined,
} from '@ant-design/icons';
import {
  CopilotPanel,
  CopilotDivider,
  CopilotList,
  CopilotListItem,
  CopilotInput,
  CopilotTextarea,
  CopilotAccordion,
  CopilotButton,
  CopilotCodeBlock,
} from '../ui/copilot';
import { Heading, Text } from '../ui/atoms/Typography';
import { Badge } from '../ui/atoms/Badge';

const CopilotUIDemo: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const [textareaValue, setTextareaValue] = useState('');

  const suggestionItems = [
    {
      icon: <BulbOutlined style={{ fontSize: 16 }} />,
      title: 'Explain this code',
      description: 'Get a detailed explanation of the selected code block',
      clickable: true,
    },
    {
      icon: <CodeOutlined style={{ fontSize: 16 }} />,
      title: 'Generate unit tests',
      description: 'Automatically create test cases for this function',
      clickable: true,
      active: true,
    },
    {
      icon: <CheckCircleOutlined style={{ fontSize: 16 }} />,
      title: 'Fix this code',
      description: 'Identify and resolve potential issues',
      clickable: true,
    },
    {
      icon: <FileTextOutlined style={{ fontSize: 16 }} />,
      title: 'Add documentation',
      description: 'Generate JSDoc comments for this code',
      clickable: true,
    },
  ];

  const accordionItems = [
    {
      id: 'suggestions',
      title: 'Code Suggestions',
      subtitle: '4 active suggestions',
      icon: <BulbOutlined style={{ fontSize: 16 }} />,
      badge: <Badge variant="primary" size="xs">4</Badge>,
      content: (
        <div className="space-y-2">
          <CopilotList items={suggestionItems} />
        </div>
      ),
      defaultOpen: true,
    },
    {
      id: 'recent',
      title: 'Recent Actions',
      subtitle: 'Your last 5 interactions',
      icon: <ClockCircleOutlined style={{ fontSize: 16 }} />,
      content: (
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <CheckCircleOutlined className="text-green-600" />
            <span>Generated component boilerplate</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircleOutlined className="text-green-600" />
            <span>Added type definitions</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircleOutlined className="text-green-600" />
            <span>Refactored function logic</span>
          </div>
        </div>
      ),
    },
    {
      id: 'settings',
      title: 'Copilot Settings',
      subtitle: 'Configure your preferences',
      icon: <SettingOutlined style={{ fontSize: 16 }} />,
      content: (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Text size="sm">Auto-suggestions</Text>
            <input type="checkbox" className="rounded" defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <Text size="sm">Inline completions</Text>
            <input type="checkbox" className="rounded" defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <Text size="sm">Show documentation</Text>
            <input type="checkbox" className="rounded" />
          </div>
        </div>
      ),
    },
  ];

  const sampleCode = `function calculateTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => {
    return sum + (item.price * item.quantity);
  }, 0);
}`;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <Heading level="h2" className="mb-2">
            Copilot UI Components
          </Heading>
          <Text color="muted" size="lg">
            VS Code GitHub Copilot-inspired interface components
          </Text>
        </div>

        {/* Panels Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Main Copilot Panel */}
          <CopilotPanel
            title="Code Assistant"
            subtitle="Get AI-powered suggestions"
            elevated
            headerAction={
              <CopilotButton variant="ghost" size="sm" icon={<StarOutlined />}>
                Favorite
              </CopilotButton>
            }
            footer={
              <div className="flex items-center justify-between">
                <Text size="xs" color="muted">
                  Last updated: 2 minutes ago
                </Text>
                <CopilotButton variant="primary" size="sm">
                  Apply Suggestion
                </CopilotButton>
              </div>
            }
          >
            <div className="space-y-4">
              <Text size="sm">
                Select a code block and choose an action from the suggestions below.
              </Text>
              <CopilotList items={suggestionItems} />
            </div>
          </CopilotPanel>

          {/* Accordion Demo */}
          <CopilotPanel title="Quick Actions" elevated>
            <CopilotAccordion items={accordionItems} />
          </CopilotPanel>
        </div>

        {/* Input Components */}
        <CopilotPanel title="Input Components" elevated>
          <div className="space-y-4">
            <CopilotInput
              label="Search code"
              placeholder="Type to search..."
              leftIcon={<SearchOutlined />}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              hint="Press Enter to search across all files"
            />

            <CopilotTextarea
              label="Describe your request"
              placeholder="E.g., Create a function that validates email addresses..."
              value={textareaValue}
              onChange={(e) => setTextareaValue(e.target.value)}
              rows={4}
              hint="Be specific to get better suggestions"
            />

            <div className="flex gap-2">
              <CopilotButton variant="primary">
                Generate Code
              </CopilotButton>
              <CopilotButton variant="secondary">
                Clear
              </CopilotButton>
              <CopilotButton variant="ghost">
                Cancel
              </CopilotButton>
            </div>
          </div>
        </CopilotPanel>

        {/* Code Block Demo */}
        <CopilotPanel title="Code Preview" elevated>
          <div className="space-y-4">
            <Text size="sm" color="muted">
              Preview of generated code with syntax highlighting
            </Text>
            <CopilotCodeBlock
              language="TypeScript"
              code={sampleCode}
              showLineNumbers
            />
            <div className="flex gap-2">
              <CopilotButton variant="primary" size="sm" icon={<CheckCircleOutlined />}>
                Accept
              </CopilotButton>
              <CopilotButton variant="secondary" size="sm">
                Modify
              </CopilotButton>
              <CopilotButton variant="ghost" size="sm">
                Reject
              </CopilotButton>
            </div>
          </div>
        </CopilotPanel>

        {/* Dividers Demo */}
        <CopilotPanel title="Dividers" elevated>
          <div className="space-y-4">
            <Text size="sm">Simple divider</Text>
            <CopilotDivider />
            <Text size="sm">Divider with label</Text>
            <CopilotDivider label="OR" />
            <Text size="sm">Light variant</Text>
            <CopilotDivider variant="light" />
          </div>
        </CopilotPanel>

        {/* List Variations */}
        <CopilotPanel title="List Variations" elevated>
          <div className="space-y-4">
            <Text size="sm" weight="medium">With actions</Text>
            <CopilotList>
              <CopilotListItem
                icon={<FileTextOutlined />}
                title="component.tsx"
                description="Modified 2 minutes ago"
                action={
                  <CopilotButton variant="ghost" size="sm">
                    View
                  </CopilotButton>
                }
                clickable
              />
              <CopilotListItem
                icon={<FileTextOutlined />}
                title="utils.ts"
                description="No changes"
                action={
                  <CopilotButton variant="ghost" size="sm">
                    View
                  </CopilotButton>
                }
                clickable
              />
            </CopilotList>

            <CopilotDivider variant="light" />

            <Text size="sm" weight="medium">Active states</Text>
            <CopilotList>
              <CopilotListItem
                icon={<CodeOutlined />}
                title="Refactor function"
                description="Extract method from selection"
                active
                clickable
              />
              <CopilotListItem
                icon={<BulbOutlined />}
                title="Add type safety"
                description="Convert to TypeScript"
                clickable
              />
            </CopilotList>
          </div>
        </CopilotPanel>

        {/* Compact Grid */}
        <div className="grid grid-cols-3 gap-4">
          <CopilotPanel title="Stats" elevated>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">1,234</div>
              <Text size="xs" color="muted">Suggestions accepted</Text>
            </div>
          </CopilotPanel>
          <CopilotPanel title="Accuracy" elevated>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">94%</div>
              <Text size="xs" color="muted">Success rate</Text>
            </div>
          </CopilotPanel>
          <CopilotPanel title="Time Saved" elevated>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">12.5h</div>
              <Text size="xs" color="muted">This week</Text>
            </div>
          </CopilotPanel>
        </div>
      </div>
    </div>
  );
};

export default CopilotUIDemo;
