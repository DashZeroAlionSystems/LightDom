import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { SchemaEditor, PromptToComponent, WorkflowWizard, ComponentSchema } from '@/components/design-system';
import { Code, Sparkles, Workflow, Layers } from 'lucide-react';

/**
 * Design System Showcase
 * 
 * Interactive demo of the design system components:
 * - Schema Editor
 * - Prompt-to-Component Generator
 * - Workflow Wizard
 */
const DesignSystemShowcase: React.FC = () => {
  const [activeDemo, setActiveDemo] = useState<'schema' | 'prompt' | 'workflow' | null>(null);
  const [exampleSchema, setExampleSchema] = useState<ComponentSchema>({
    name: 'UserProfileCard',
    type: 'component',
    description: 'A card component for displaying user profile information',
    fields: [
      {
        id: '1',
        key: 'name',
        label: 'Full Name',
        type: 'string',
        required: true,
        description: 'The user\'s full name',
      },
      {
        id: '2',
        key: 'email',
        label: 'Email Address',
        type: 'string',
        required: true,
        validations: [{ type: 'email', message: 'Must be a valid email address' }],
      },
      {
        id: '3',
        key: 'role',
        label: 'User Role',
        type: 'select',
        required: true,
        options: [
          { value: 'admin', label: 'Administrator' },
          { value: 'user', label: 'User' },
          { value: 'guest', label: 'Guest' },
        ],
      },
      {
        id: '4',
        key: 'bio',
        label: 'Biography',
        type: 'string',
        required: false,
        description: 'Short bio or description',
      },
      {
        id: '5',
        key: 'avatar',
        label: 'Avatar URL',
        type: 'string',
        required: false,
        validations: [{ type: 'url', message: 'Must be a valid URL' }],
      },
    ],
    metadata: {
      category: 'user-management',
      tags: ['user', 'profile', 'card'],
      designTokens: {
        borderRadius: '12px',
        padding: '16px',
        backgroundColor: 'var(--md-sys-color-surface)',
      },
    },
  });

  return (
    <div className="min-h-screen bg-surface p-6">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Layers className="h-10 w-10 text-primary" />
            <h1 className="text-4xl font-bold text-on-surface">Design System Showcase</h1>
          </div>
          <p className="text-lg text-on-surface-variant">
            Explore the AI-powered design system for creating reusable components, dashboards, and workflows
          </p>
        </div>

        {/* Main Content */}
        {!activeDemo ? (
          <div className="grid gap-6 md:grid-cols-3">
            {/* Schema Editor Card */}
            <Card variant="elevated" className="overflow-hidden">
              <div className="p-6">
                <Code className="mb-4 h-12 w-12 text-primary" />
                <h3 className="mb-2 text-xl font-semibold text-on-surface">Schema Editor</h3>
                <p className="mb-4 text-sm text-on-surface-variant">
                  Visual editor for creating and modifying component schemas with drag & drop, validation rules, and real-time preview.
                </p>
                <div className="mb-4 flex flex-wrap gap-2">
                  <Badge variant="primary">Visual Editor</Badge>
                  <Badge variant="secondary">Code View</Badge>
                  <Badge variant="tertiary">Validation</Badge>
                </div>
                <Button
                  variant="filled"
                  fullWidth
                  onClick={() => setActiveDemo('schema')}
                  rightIcon={<Code />}
                >
                  Try Schema Editor
                </Button>
              </div>
              <div className="bg-surface-container-high p-4">
                <h4 className="mb-2 text-sm font-semibold text-on-surface">Features:</h4>
                <ul className="space-y-1 text-xs text-on-surface-variant">
                  <li>✓ 12 field types supported</li>
                  <li>✓ Drag & drop reordering</li>
                  <li>✓ Visual and code modes</li>
                  <li>✓ Real-time validation</li>
                  <li>✓ Export to JSON</li>
                </ul>
              </div>
            </Card>

            {/* Prompt-to-Component Card */}
            <Card variant="elevated" className="overflow-hidden">
              <div className="p-6">
                <Sparkles className="mb-4 h-12 w-12 text-primary" />
                <h3 className="mb-2 text-xl font-semibold text-on-surface">AI Component Generator</h3>
                <p className="mb-4 text-sm text-on-surface-variant">
                  Generate complete component schemas from natural language descriptions using DeepSeek R1 AI model.
                </p>
                <div className="mb-4 flex flex-wrap gap-2">
                  <Badge variant="primary">AI-Powered</Badge>
                  <Badge variant="secondary">Ollama</Badge>
                  <Badge variant="tertiary">DeepSeek R1</Badge>
                </div>
                <Button
                  variant="filled"
                  fullWidth
                  onClick={() => setActiveDemo('prompt')}
                  rightIcon={<Sparkles />}
                >
                  Try AI Generator
                </Button>
              </div>
              <div className="bg-surface-container-high p-4">
                <h4 className="mb-2 text-sm font-semibold text-on-surface">Capabilities:</h4>
                <ul className="space-y-1 text-xs text-on-surface-variant">
                  <li>✓ Natural language input</li>
                  <li>✓ Intelligent field inference</li>
                  <li>✓ Material Design compliance</li>
                  <li>✓ Editable output</li>
                  <li>✓ Learning from feedback</li>
                </ul>
              </div>
            </Card>

            {/* Workflow Wizard Card */}
            <Card variant="elevated" className="overflow-hidden">
              <div className="p-6">
                <Workflow className="mb-4 h-12 w-12 text-primary" />
                <h3 className="mb-2 text-xl font-semibold text-on-surface">Workflow Wizard</h3>
                <p className="mb-4 text-sm text-on-surface-variant">
                  Create complete campaigns with AI-generated atoms, components, and dashboards in a guided workflow.
                </p>
                <div className="mb-4 flex flex-wrap gap-2">
                  <Badge variant="primary">Multi-Step</Badge>
                  <Badge variant="secondary">Campaign</Badge>
                  <Badge variant="tertiary">Full Stack</Badge>
                </div>
                <Button
                  variant="filled"
                  fullWidth
                  onClick={() => setActiveDemo('workflow')}
                  rightIcon={<Workflow />}
                >
                  Try Workflow Wizard
                </Button>
              </div>
              <div className="bg-surface-container-high p-4">
                <h4 className="mb-2 text-sm font-semibold text-on-surface">Features:</h4>
                <ul className="space-y-1 text-xs text-on-surface-variant">
                  <li>✓ Guided campaign setup</li>
                  <li>✓ Auto-generate schemas</li>
                  <li>✓ Schema review & edit</li>
                  <li>✓ Admin/client settings</li>
                  <li>✓ Deploy workflows</li>
                </ul>
              </div>
            </Card>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Back Button */}
            <Button variant="outlined" onClick={() => setActiveDemo(null)} leftIcon={<Code />}>
              ← Back to Overview
            </Button>

            {/* Demo Content */}
            {activeDemo === 'schema' && (
              <Card variant="elevated" className="p-6">
                <div className="mb-6">
                  <h2 className="mb-2 text-2xl font-bold text-on-surface">Schema Editor Demo</h2>
                  <p className="text-sm text-on-surface-variant">
                    Edit the example component schema below. Try adding fields, changing types, or modifying validation rules.
                  </p>
                </div>
                <SchemaEditor
                  schema={exampleSchema}
                  onChange={setExampleSchema}
                  mode="visual"
                  onSave={(schema) => {
                    console.log('Saved schema:', schema);
                    alert('Schema saved! Check console for details.');
                  }}
                  onCancel={() => setActiveDemo(null)}
                />
              </Card>
            )}

            {activeDemo === 'prompt' && (
              <PromptToComponent
                onComplete={(schema) => {
                  console.log('Generated schema:', schema);
                  setExampleSchema(schema);
                  setActiveDemo('schema');
                }}
                onCancel={() => setActiveDemo(null)}
              />
            )}

            {activeDemo === 'workflow' && (
              <WorkflowWizard
                onComplete={(campaign) => {
                  console.log('Campaign created:', campaign);
                  alert('Campaign created! Check console for details.');
                  setActiveDemo(null);
                }}
                onCancel={() => setActiveDemo(null)}
              />
            )}
          </div>
        )}

        {/* Information Section */}
        {!activeDemo && (
          <Card variant="outlined" className="p-6">
            <h3 className="mb-4 text-xl font-semibold text-on-surface">About the Design System</h3>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h4 className="mb-2 font-semibold text-on-surface">Architecture</h4>
                <p className="mb-3 text-sm text-on-surface-variant">
                  Built on atomic design principles with a clear hierarchy:
                </p>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    <Badge variant="primary" className="text-xs">Atoms</Badge>
                    <span className="text-on-surface-variant">→ Basic UI elements</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">Components</Badge>
                    <span className="text-on-surface-variant">→ Composed elements</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="tertiary" className="text-xs">Dashboards</Badge>
                    <span className="text-on-surface-variant">→ Complete layouts</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">Workflows</Badge>
                    <span className="text-on-surface-variant">→ Orchestrated processes</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="mb-2 font-semibold text-on-surface">Key Features</h4>
                <ul className="space-y-2 text-sm text-on-surface-variant">
                  <li>✓ AI-powered component generation with DeepSeek R1</li>
                  <li>✓ Schema-driven design with PostgreSQL storage</li>
                  <li>✓ Material Design 3 compliance</li>
                  <li>✓ Real-time validation and preview</li>
                  <li>✓ Training data collection for continuous improvement</li>
                  <li>✓ Component versioning and publishing</li>
                  <li>✓ Admin and client-level configuration</li>
                  <li>✓ Full accessibility support (WCAG 2.1 AA)</li>
                </ul>
              </div>
            </div>

            <div className="mt-6 rounded-lg bg-primary-container/20 p-4">
              <h4 className="mb-2 font-semibold text-on-surface">🚀 Getting Started</h4>
              <ol className="space-y-2 text-sm text-on-surface-variant">
                <li>1. Start with the <strong>Schema Editor</strong> to understand component structure</li>
                <li>2. Try the <strong>AI Generator</strong> to create components from descriptions</li>
                <li>3. Use the <strong>Workflow Wizard</strong> to build complete campaigns</li>
                <li>4. Review generated schemas and customize as needed</li>
                <li>5. Deploy your workflows and track usage analytics</li>
              </ol>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default DesignSystemShowcase;
