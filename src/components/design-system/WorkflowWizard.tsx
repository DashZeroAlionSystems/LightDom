import React, { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Wizard, WizardContent, WizardFooter, WizardStepDescriptor } from '@/components/ui/Wizard';
import SchemaEditor, { ComponentSchema } from './SchemaEditor';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Loader2,
  Settings,
  Target,
  Layers,
  Workflow as WorkflowIcon,
  Play,
  Save,
} from 'lucide-react';

// Workflow configuration interfaces
export interface WorkflowTask {
  id: string;
  taskKey: string;
  taskLabel: string;
  handlerType: 'crawler' | 'mining' | 'training' | 'analysis' | 'notification';
  handlerConfig: Record<string, any>;
  isOptional: boolean;
  ordering: number;
}

export interface WorkflowTemplate {
  id?: string;
  templateKey: string;
  label: string;
  description: string;
  primaryPrompt: string;
  defaultTasks: WorkflowTask[];
  defaultAtoms: string[];
  defaultComponents: string[];
  defaultDashboards: string[];
}

export interface WorkflowCampaign {
  id?: string;
  name: string;
  description: string;
  template?: WorkflowTemplate;
  promptPayload: Record<string, any>;
  generatedSchemas?: {
    atoms: ComponentSchema[];
    components: ComponentSchema[];
    dashboards: ComponentSchema[];
  };
  tasks: WorkflowTask[];
  settings: {
    adminLevel: Record<string, any>;
    clientLevel: Record<string, any>;
  };
  automationThreshold?: number;
}

interface WorkflowWizardProps {
  onComplete?: (campaign: WorkflowCampaign) => void;
  onCancel?: () => void;
  initialTemplate?: WorkflowTemplate;
  className?: string;
}

const OLLAMA_API_URL = process.env.VITE_OLLAMA_API_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.VITE_OLLAMA_MODEL || 'deepseek-r1:latest';

export const WorkflowWizard: React.FC<WorkflowWizardProps> = ({
  onComplete,
  onCancel,
  initialTemplate,
  className,
}) => {
  const [activeStep, setActiveStep] = useState('prompt');
  const [campaign, setCampaign] = useState<WorkflowCampaign>({
    name: '',
    description: '',
    template: initialTemplate,
    promptPayload: {},
    tasks: initialTemplate?.defaultTasks || [],
    settings: {
      adminLevel: {},
      clientLevel: {},
    },
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [selectedSchema, setSelectedSchema] = useState<ComponentSchema | null>(null);
  const [schemaEditMode, setSchemaEditMode] = useState<'atoms' | 'components' | 'dashboards'>(
    'components'
  );

  const generateWorkflowSchemas = useCallback(async () => {
    setIsGenerating(true);
    setGenerationError(null);

    try {
      const systemPrompt = `You are an expert workflow designer and UI architect. Generate a complete workflow configuration with atoms, components, and dashboards based on the user's campaign requirements.

Return ONLY a valid JSON object with this structure:
{
  "atoms": [
    {
      "name": "AtomName",
      "type": "atom",
      "description": "...",
      "fields": [...],
      "metadata": {
        "category": "action|input|surface|display",
        "designTokens": {...}
      }
    }
  ],
  "components": [
    {
      "name": "ComponentName",
      "type": "component",
      "description": "...",
      "fields": [...],
      "metadata": {
        "atoms": ["atom-ids"],
        "category": "...",
        "tags": [...]
      }
    }
  ],
  "dashboards": [
    {
      "name": "DashboardName",
      "type": "dashboard",
      "description": "...",
      "fields": [...],
      "metadata": {
        "components": ["component-ids"],
        "layout": {...},
        "domain": "admin|client|workflow"
      }
    }
  ],
  "workflowConfig": {
    "tasks": [...],
    "automationRules": {...}
  }
}

Campaign Details:
- Name: ${campaign.name}
- Description: ${campaign.description}
- Additional Requirements: ${JSON.stringify(campaign.promptPayload)}

Design for:
1. Atoms: Basic UI elements (buttons, inputs, cards, etc.)
2. Components: Composed of atoms (forms, tables, charts, etc.)
3. Dashboards: Layouts composed of components
4. Ensure all components follow Material Design 3 principles
5. Include accessibility metadata
6. Define proper data bindings and settings`;

      const response = await fetch(`${OLLAMA_API_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: OLLAMA_MODEL,
          prompt: systemPrompt,
          stream: false,
          format: 'json',
          options: {
            temperature: 0.7,
            top_p: 0.9,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.statusText}`);
      }

      const data = await response.json();
      const generatedData = JSON.parse(data.response);

      // Normalize schemas
      const normalizeSchemas = (schemas: any[], type: 'atom' | 'component' | 'dashboard') =>
        schemas.map((schema: any, index: number) => ({
          id: crypto.randomUUID(),
          name: schema.name || `${type}_${index + 1}`,
          type,
          description: schema.description || '',
          fields: (schema.fields || []).map((field: any, idx: number) => ({
            id: crypto.randomUUID(),
            key: field.key || `field_${idx + 1}`,
            label: field.label || 'Field',
            type: field.type || 'string',
            description: field.description,
            required: field.required || false,
            options: field.options,
          })),
          metadata: schema.metadata || {},
        }));

      setCampaign((prev) => ({
        ...prev,
        generatedSchemas: {
          atoms: normalizeSchemas(generatedData.atoms || [], 'atom'),
          components: normalizeSchemas(generatedData.components || [], 'component'),
          dashboards: normalizeSchemas(generatedData.dashboards || [], 'dashboard'),
        },
        tasks: generatedData.workflowConfig?.tasks || prev.tasks,
      }));

      setActiveStep('review-schemas');
    } catch (error: any) {
      console.error('Generation error:', error);
      setGenerationError(error.message || 'Failed to generate workflow schemas');
    } finally {
      setIsGenerating(false);
    }
  }, [campaign.name, campaign.description, campaign.promptPayload]);

  const updateSchema = useCallback(
    (type: 'atoms' | 'components' | 'dashboards', id: string, updates: ComponentSchema) => {
      setCampaign((prev) => {
        if (!prev.generatedSchemas) return prev;

        return {
          ...prev,
          generatedSchemas: {
            ...prev.generatedSchemas,
            [type]: prev.generatedSchemas[type].map((schema) =>
              schema.id === id ? updates : schema
            ),
          },
        };
      });
    },
    []
  );

  const saveCampaign = useCallback(async () => {
    try {
      const response = await fetch('/api/workflows/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(campaign),
      });

      if (!response.ok) {
        throw new Error('Failed to save campaign');
      }

      const savedCampaign = await response.json();

      if (onComplete) {
        onComplete(savedCampaign);
      }
    } catch (error: any) {
      console.error('Save error:', error);
      setGenerationError(error.message || 'Failed to save campaign');
    }
  }, [campaign, onComplete]);

  const steps: WizardStepDescriptor[] = [
    {
      id: 'prompt',
      title: 'Campaign Setup',
      subtitle: 'Define your campaign goals',
      status: activeStep === 'prompt' ? 'active' : 'completed',
    },
    {
      id: 'generate',
      title: 'Generate Workflow',
      subtitle: 'AI-powered schema generation',
      status:
        activeStep === 'generate'
          ? 'active'
          : campaign.generatedSchemas
            ? 'completed'
            : 'pending',
    },
    {
      id: 'review-schemas',
      title: 'Review Schemas',
      subtitle: 'Edit atoms, components, dashboards',
      status:
        activeStep === 'review-schemas'
          ? 'active'
          : campaign.generatedSchemas
            ? 'completed'
            : 'pending',
      meta: campaign.generatedSchemas
        ? {
            caption: `${campaign.generatedSchemas.atoms.length}A / ${campaign.generatedSchemas.components.length}C / ${campaign.generatedSchemas.dashboards.length}D`,
          }
        : undefined,
    },
    {
      id: 'configure',
      title: 'Configure Settings',
      subtitle: 'Admin and client settings',
      status: activeStep === 'configure' ? 'active' : 'pending',
    },
    {
      id: 'preview',
      title: 'Preview & Launch',
      subtitle: 'Review and deploy',
      status: activeStep === 'preview' ? 'active' : 'pending',
    },
  ];

  return (
    <div className={cn('min-h-screen bg-surface p-6', className)}>
      <Wizard
        title="Create Workflow Campaign"
        description="Design and deploy complete workflows with AI-generated components and dashboards"
        steps={steps}
        activeStepId={activeStep}
        onStepChange={setActiveStep}
        actions={
          <Badge variant="primary" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Workflow Designer
          </Badge>
        }
      >
        {/* Step 1: Campaign Setup */}
        <WizardContent stepId="prompt">
          <div className="space-y-6">
            <div>
              <h3 className="mb-2 text-lg font-semibold text-on-surface">Campaign Details</h3>
              <p className="text-sm text-on-surface-variant">
                Provide basic information about your campaign
              </p>
            </div>

            <div className="space-y-4">
              <Input
                label="Campaign Name"
                value={campaign.name}
                onChange={(e) => setCampaign({ ...campaign, name: e.target.value })}
                placeholder="My Marketing Campaign"
                required
              />

              <div>
                <label className="mb-2 block text-sm font-medium text-on-surface">
                  Description
                </label>
                <textarea
                  value={campaign.description}
                  onChange={(e) => setCampaign({ ...campaign, description: e.target.value })}
                  placeholder="Describe the purpose and goals of this campaign..."
                  className="h-32 w-full rounded-lg border border-outline bg-surface p-4 text-on-surface placeholder:text-on-surface-variant focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <Card variant="filled" className="p-4">
                <h4 className="mb-3 font-semibold text-on-surface">Campaign Requirements</h4>
                <div className="space-y-3">
                  <Input
                    label="Target Audience"
                    value={campaign.promptPayload.targetAudience || ''}
                    onChange={(e) =>
                      setCampaign({
                        ...campaign,
                        promptPayload: { ...campaign.promptPayload, targetAudience: e.target.value },
                      })
                    }
                    placeholder="e.g., B2B SaaS companies"
                  />
                  <Input
                    label="Data Sources"
                    value={campaign.promptPayload.dataSources || ''}
                    onChange={(e) =>
                      setCampaign({
                        ...campaign,
                        promptPayload: { ...campaign.promptPayload, dataSources: e.target.value },
                      })
                    }
                    placeholder="e.g., CRM, Analytics, Social Media"
                  />
                  <Input
                    label="Key Metrics"
                    value={campaign.promptPayload.keyMetrics || ''}
                    onChange={(e) =>
                      setCampaign({
                        ...campaign,
                        promptPayload: { ...campaign.promptPayload, keyMetrics: e.target.value },
                      })
                    }
                    placeholder="e.g., Conversion Rate, ROI, Engagement"
                  />
                </div>
              </Card>
            </div>
          </div>
        </WizardContent>

        {/* Step 2: Generate */}
        <WizardContent stepId="generate">
          <div className="space-y-6 py-8 text-center">
            {!isGenerating && !campaign.generatedSchemas && (
              <>
                <Target className="mx-auto h-16 w-16 text-primary" />
                <div>
                  <h3 className="text-xl font-semibold text-on-surface">Ready to Generate</h3>
                  <p className="mt-2 text-on-surface-variant">
                    Click the button below to generate workflow schemas using AI
                  </p>
                </div>
              </>
            )}

            {isGenerating && (
              <>
                <Loader2 className="mx-auto h-16 w-16 animate-spin text-primary" />
                <div>
                  <h3 className="text-xl font-semibold text-on-surface">Generating...</h3>
                  <p className="mt-2 text-on-surface-variant">
                    Creating atoms, components, and dashboards for your campaign
                  </p>
                </div>
              </>
            )}

            {campaign.generatedSchemas && (
              <>
                <CheckCircle className="mx-auto h-16 w-16 text-success" />
                <div>
                  <h3 className="text-xl font-semibold text-on-surface">Schemas Generated</h3>
                  <p className="mt-2 text-on-surface-variant">Review and edit in the next step</p>
                </div>
                <div className="mx-auto grid max-w-2xl grid-cols-3 gap-4">
                  <Card variant="outlined" className="p-4">
                    <div className="text-2xl font-bold text-primary">
                      {campaign.generatedSchemas.atoms.length}
                    </div>
                    <div className="mt-1 text-sm text-on-surface-variant">Atoms</div>
                  </Card>
                  <Card variant="outlined" className="p-4">
                    <div className="text-2xl font-bold text-primary">
                      {campaign.generatedSchemas.components.length}
                    </div>
                    <div className="mt-1 text-sm text-on-surface-variant">Components</div>
                  </Card>
                  <Card variant="outlined" className="p-4">
                    <div className="text-2xl font-bold text-primary">
                      {campaign.generatedSchemas.dashboards.length}
                    </div>
                    <div className="mt-1 text-sm text-on-surface-variant">Dashboards</div>
                  </Card>
                </div>
              </>
            )}

            {generationError && (
              <Card variant="outlined" className="border-error bg-error-container/10 p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-error" />
                  <div className="flex-1 text-left">
                    <h4 className="font-semibold text-error">Generation Error</h4>
                    <p className="mt-1 text-sm text-on-error-container">{generationError}</p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </WizardContent>

        {/* Step 3: Review Schemas */}
        <WizardContent stepId="review-schemas">
          {campaign.generatedSchemas && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-on-surface">Review Generated Schemas</h3>
                <div className="flex gap-2">
                  <Button
                    variant={schemaEditMode === 'atoms' ? 'filled' : 'outlined'}
                    size="sm"
                    onClick={() => setSchemaEditMode('atoms')}
                  >
                    Atoms ({campaign.generatedSchemas.atoms.length})
                  </Button>
                  <Button
                    variant={schemaEditMode === 'components' ? 'filled' : 'outlined'}
                    size="sm"
                    onClick={() => setSchemaEditMode('components')}
                  >
                    Components ({campaign.generatedSchemas.components.length})
                  </Button>
                  <Button
                    variant={schemaEditMode === 'dashboards' ? 'filled' : 'outlined'}
                    size="sm"
                    onClick={() => setSchemaEditMode('dashboards')}
                  >
                    Dashboards ({campaign.generatedSchemas.dashboards.length})
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                {campaign.generatedSchemas[schemaEditMode].map((schema) => (
                  <Card key={schema.id} variant="outlined" className="p-4">
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-on-surface">{schema.name}</h4>
                        <p className="text-sm text-on-surface-variant">{schema.description}</p>
                      </div>
                      <Button
                        variant="text"
                        size="sm"
                        onClick={() => setSelectedSchema(schema)}
                      >
                        Edit
                      </Button>
                    </div>

                    {selectedSchema?.id === schema.id && (
                      <SchemaEditor
                        schema={selectedSchema}
                        onChange={(updated) =>
                          updateSchema(schemaEditMode, schema.id!, updated)
                        }
                        onSave={() => setSelectedSchema(null)}
                        onCancel={() => setSelectedSchema(null)}
                        mode="visual"
                      />
                    )}
                  </Card>
                ))}
              </div>
            </div>
          )}
        </WizardContent>

        {/* Step 4: Configure Settings */}
        <WizardContent stepId="configure">
          <div className="space-y-6">
            <div>
              <h3 className="mb-2 text-lg font-semibold text-on-surface">Workflow Settings</h3>
              <p className="text-sm text-on-surface-variant">
                Configure admin and client-level settings
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card variant="outlined" className="p-4">
                <h4 className="mb-4 font-semibold text-on-surface">Admin Settings</h4>
                <div className="space-y-3">
                  <Input
                    label="Automation Threshold"
                    type="number"
                    value={campaign.automationThreshold || 80}
                    onChange={(e) =>
                      setCampaign({ ...campaign, automationThreshold: parseInt(e.target.value) })
                    }
                    placeholder="80"
                  />
                  <Input
                    label="Notification Email"
                    value={campaign.settings.adminLevel.notificationEmail || ''}
                    onChange={(e) =>
                      setCampaign({
                        ...campaign,
                        settings: {
                          ...campaign.settings,
                          adminLevel: { ...campaign.settings.adminLevel, notificationEmail: e.target.value },
                        },
                      })
                    }
                    placeholder="admin@example.com"
                  />
                </div>
              </Card>

              <Card variant="outlined" className="p-4">
                <h4 className="mb-4 font-semibold text-on-surface">Client Settings</h4>
                <div className="space-y-3">
                  <Input
                    label="Access Level"
                    value={campaign.settings.clientLevel.accessLevel || 'user'}
                    onChange={(e) =>
                      setCampaign({
                        ...campaign,
                        settings: {
                          ...campaign.settings,
                          clientLevel: { ...campaign.settings.clientLevel, accessLevel: e.target.value },
                        },
                      })
                    }
                    placeholder="user"
                  />
                  <Input
                    label="Dashboard Theme"
                    value={campaign.settings.clientLevel.theme || 'light'}
                    onChange={(e) =>
                      setCampaign({
                        ...campaign,
                        settings: {
                          ...campaign.settings,
                          clientLevel: { ...campaign.settings.clientLevel, theme: e.target.value },
                        },
                      })
                    }
                    placeholder="light"
                  />
                </div>
              </Card>
            </div>
          </div>
        </WizardContent>

        {/* Step 5: Preview & Launch */}
        <WizardContent stepId="preview">
          <div className="space-y-6">
            <div className="text-center">
              <WorkflowIcon className="mx-auto h-16 w-16 text-success" />
              <h3 className="mt-4 text-xl font-semibold text-on-surface">Campaign Ready</h3>
              <p className="mt-2 text-on-surface-variant">
                Review your campaign configuration and launch
              </p>
            </div>

            <Card variant="outlined" className="p-6">
              <h4 className="mb-4 text-lg font-semibold text-on-surface">Summary</h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Name:</span>
                  <span className="font-medium text-on-surface">{campaign.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Atoms:</span>
                  <Badge variant="primary">{campaign.generatedSchemas?.atoms.length || 0}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Components:</span>
                  <Badge variant="secondary">
                    {campaign.generatedSchemas?.components.length || 0}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Dashboards:</span>
                  <Badge variant="tertiary">
                    {campaign.generatedSchemas?.dashboards.length || 0}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Tasks:</span>
                  <Badge variant="outline">{campaign.tasks.length}</Badge>
                </div>
              </div>
            </Card>
          </div>
        </WizardContent>

        {/* Footer Navigation */}
        <WizardFooter
          trailing={
            <div className="flex items-center gap-3">
              {activeStep !== 'prompt' && (
                <Button
                  variant="outlined"
                  onClick={() => {
                    const stepIndex = steps.findIndex((s) => s.id === activeStep);
                    if (stepIndex > 0) {
                      setActiveStep(steps[stepIndex - 1].id);
                    }
                  }}
                  leftIcon={<ArrowLeft />}
                >
                  Back
                </Button>
              )}

              {activeStep === 'prompt' && (
                <Button
                  variant="filled"
                  onClick={() => setActiveStep('generate')}
                  disabled={!campaign.name}
                  rightIcon={<ArrowRight />}
                >
                  Continue
                </Button>
              )}

              {activeStep === 'generate' && !campaign.generatedSchemas && (
                <Button
                  variant="filled"
                  onClick={generateWorkflowSchemas}
                  disabled={isGenerating}
                  leftIcon={isGenerating ? <Loader2 className="animate-spin" /> : <Sparkles />}
                >
                  {isGenerating ? 'Generating...' : 'Generate Workflow'}
                </Button>
              )}

              {activeStep === 'generate' && campaign.generatedSchemas && (
                <Button
                  variant="filled"
                  onClick={() => setActiveStep('review-schemas')}
                  rightIcon={<ArrowRight />}
                >
                  Review Schemas
                </Button>
              )}

              {activeStep === 'review-schemas' && (
                <Button
                  variant="filled"
                  onClick={() => setActiveStep('configure')}
                  rightIcon={<ArrowRight />}
                >
                  Configure Settings
                </Button>
              )}

              {activeStep === 'configure' && (
                <Button
                  variant="filled"
                  onClick={() => setActiveStep('preview')}
                  rightIcon={<ArrowRight />}
                >
                  Preview
                </Button>
              )}

              {activeStep === 'preview' && (
                <Button variant="filled" onClick={saveCampaign} leftIcon={<Play />}>
                  Launch Campaign
                </Button>
              )}

              {onCancel && (
                <Button variant="text" onClick={onCancel}>
                  Cancel
                </Button>
              )}
            </div>
          }
        />
      </Wizard>
    </div>
  );
};

export default WorkflowWizard;
