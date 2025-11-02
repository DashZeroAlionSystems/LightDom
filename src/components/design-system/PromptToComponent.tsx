import React, { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Wizard, WizardContent, WizardFooter, WizardStepDescriptor } from '@/components/ui/Wizard';
import SchemaEditor, { ComponentSchema, SchemaField } from './SchemaEditor';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Loader2,
  Eye,
  Code,
  Save,
  Play,
} from 'lucide-react';

// Ollama API integration
const OLLAMA_API_URL = process.env.VITE_OLLAMA_API_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.VITE_OLLAMA_MODEL || 'deepseek-r1:latest';

interface PromptToComponentProps {
  onComplete?: (schema: ComponentSchema) => void;
  onCancel?: () => void;
  className?: string;
}

interface GenerationResult {
  schema: ComponentSchema;
  reasoning?: string;
  confidence?: number;
}

export const PromptToComponent: React.FC<PromptToComponentProps> = ({
  onComplete,
  onCancel,
  className,
}) => {
  const [activeStep, setActiveStep] = useState('prompt');
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [generatedSchema, setGeneratedSchema] = useState<ComponentSchema | null>(null);
  const [reasoning, setReasoning] = useState<string>('');
  const [userEdits, setUserEdits] = useState<Record<string, any>>({});

  const generateSchema = useCallback(async () => {
    if (!prompt.trim()) {
      setGenerationError('Please enter a prompt');
      return;
    }

    setIsGenerating(true);
    setGenerationError(null);

    try {
      const systemPrompt = `You are an expert UI/UX component designer. Generate a component schema based on the user's requirements.

Return ONLY a valid JSON object with this structure:
{
  "name": "ComponentName",
  "type": "atom" | "component" | "dashboard",
  "description": "Brief description",
  "fields": [
    {
      "id": "unique-id",
      "key": "fieldKey",
      "label": "Field Label",
      "type": "string" | "number" | "boolean" | "select" | "multiselect" | "date" | "color" | "json",
      "description": "Field description",
      "required": true/false,
      "options": [{"value": "val", "label": "Label"}] // for select/multiselect
    }
  ],
  "metadata": {
    "category": "category",
    "tags": ["tag1", "tag2"],
    "designTokens": {...}
  },
  "reasoning": "Explanation of design decisions"
}

Material Design 3 principles:
- Use semantic naming (primary, secondary, surface, etc.)
- Include accessibility considerations
- Define proper field types and validation
- Group related fields logically
- Provide helpful descriptions

User prompt: ${prompt}`;

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

      // Validate and normalize the schema
      const schema: ComponentSchema = {
        name: generatedData.name || 'New Component',
        type: generatedData.type || 'component',
        description: generatedData.description || '',
        fields: (generatedData.fields || []).map((field: any, index: number) => ({
          id: field.id || crypto.randomUUID(),
          key: field.key || `field_${index + 1}`,
          label: field.label || 'Field',
          type: field.type || 'string',
          description: field.description,
          required: field.required || false,
          options: field.options,
          defaultValue: field.defaultValue,
        })),
        metadata: generatedData.metadata || {},
      };

      setGeneratedSchema(schema);
      setReasoning(generatedData.reasoning || 'Schema generated successfully');
      setActiveStep('review');
    } catch (error: any) {
      console.error('Generation error:', error);
      setGenerationError(error.message || 'Failed to generate schema. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  }, [prompt]);

  const handleSchemaChange = useCallback((updatedSchema: ComponentSchema) => {
    setGeneratedSchema(updatedSchema);
    
    // Track user edits for training data
    setUserEdits((prev) => ({
      ...prev,
      timestamp: Date.now(),
      changes: updatedSchema,
    }));
  }, []);

  const handleSaveAndContinue = useCallback(async () => {
    if (!generatedSchema) return;

    // Save to database with training data
    try {
      const response = await fetch('/api/components/schema', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          schema: generatedSchema,
          userEdits,
          reasoning,
          accepted: true,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save schema');
      }

      if (onComplete) {
        onComplete(generatedSchema);
      }
    } catch (error: any) {
      console.error('Save error:', error);
      setGenerationError(error.message || 'Failed to save schema');
    }
  }, [generatedSchema, prompt, userEdits, reasoning, onComplete]);

  const steps: WizardStepDescriptor[] = [
    {
      id: 'prompt',
      title: 'Describe Component',
      subtitle: 'Enter a natural language description',
      status: activeStep === 'prompt' ? 'active' : 'completed',
      meta: {
        caption: 'AI-powered generation',
        helperText: 'Be specific about fields, types, and behavior',
      },
    },
    {
      id: 'review',
      title: 'Review & Edit Schema',
      subtitle: 'Refine the generated component',
      status:
        activeStep === 'review'
          ? 'active'
          : generatedSchema
            ? 'completed'
            : 'pending',
      meta: {
        caption: generatedSchema ? `${generatedSchema.fields.length} fields` : undefined,
      },
    },
    {
      id: 'preview',
      title: 'Preview',
      subtitle: 'See component in action',
      status: activeStep === 'preview' ? 'active' : 'pending',
    },
    {
      id: 'save',
      title: 'Save',
      subtitle: 'Add to component library',
      status: activeStep === 'save' ? 'active' : 'pending',
    },
  ];

  return (
    <div className={cn('min-h-screen bg-surface p-6', className)}>
      <Wizard
        title="Create Component from Prompt"
        description="Use AI to generate reusable components from natural language descriptions"
        steps={steps}
        activeStepId={activeStep}
        onStepChange={setActiveStep}
        actions={
          <>
            <Badge variant="primary" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              AI-Powered
            </Badge>
          </>
        }
      >
        {/* Step 1: Prompt Input */}
        <WizardContent stepId="prompt">
          <div className="space-y-6">
            <div>
              <h3 className="mb-2 text-lg font-semibold text-on-surface">
                Describe Your Component
              </h3>
              <p className="text-sm text-on-surface-variant">
                Describe the component you want to create. Include details about fields, behavior,
                styling, and any specific requirements.
              </p>
            </div>

            <div className="space-y-4">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Example: Create a user profile card with avatar, name, email, bio, and social links. Include a status badge showing online/offline state. Use Material Design styling with rounded corners."
                className="h-48 w-full rounded-lg border border-outline bg-surface p-4 text-on-surface placeholder:text-on-surface-variant focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                disabled={isGenerating}
              />

              {generationError && (
                <Card variant="outlined" className="border-error bg-error-container/10 p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-error" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-error">Generation Error</h4>
                      <p className="mt-1 text-sm text-on-error-container">{generationError}</p>
                    </div>
                  </div>
                </Card>
              )}

              <div className="rounded-lg bg-primary-container/20 p-4">
                <h4 className="mb-2 font-semibold text-on-surface">💡 Tips for better results:</h4>
                <ul className="space-y-1 text-sm text-on-surface-variant">
                  <li>• Specify the component type (atom, molecule, organism)</li>
                  <li>• List all required and optional fields</li>
                  <li>• Mention data types (text, number, date, etc.)</li>
                  <li>• Include validation requirements</li>
                  <li>• Describe desired styling and behavior</li>
                </ul>
              </div>
            </div>
          </div>
        </WizardContent>

        {/* Step 2: Review & Edit */}
        <WizardContent stepId="review">
          {generatedSchema ? (
            <div className="space-y-6">
              {reasoning && (
                <Card variant="filled" className="p-4">
                  <div className="flex items-start gap-3">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-on-surface">AI Reasoning</h4>
                      <p className="mt-1 text-sm text-on-surface-variant">{reasoning}</p>
                    </div>
                  </div>
                </Card>
              )}

              <SchemaEditor
                schema={generatedSchema}
                onChange={handleSchemaChange}
                mode="visual"
              />
            </div>
          ) : (
            <div className="py-12 text-center">
              <p className="text-on-surface-variant">
                Generate a schema in the previous step to review it here.
              </p>
            </div>
          )}
        </WizardContent>

        {/* Step 3: Preview */}
        <WizardContent stepId="preview">
          {generatedSchema ? (
            <div className="space-y-6">
              <div>
                <h3 className="mb-2 text-lg font-semibold text-on-surface">Component Preview</h3>
                <p className="text-sm text-on-surface-variant">
                  See how your component schema looks as code
                </p>
              </div>

              <Card variant="filled" className="p-4">
                <pre className="overflow-auto rounded bg-surface-container p-4 text-sm">
                  <code>{JSON.stringify(generatedSchema, null, 2)}</code>
                </pre>
              </Card>

              <Card variant="outlined" className="p-4">
                <h4 className="mb-3 font-semibold text-on-surface">Schema Summary</h4>
                <div className="grid gap-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-on-surface-variant">Component Name:</span>
                    <Badge variant="secondary">{generatedSchema.name}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-on-surface-variant">Type:</span>
                    <Badge variant="primary">{generatedSchema.type}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-on-surface-variant">Fields:</span>
                    <Badge variant="tertiary">{generatedSchema.fields.length}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-on-surface-variant">Required Fields:</span>
                    <Badge variant="error">
                      {generatedSchema.fields.filter((f) => f.required).length}
                    </Badge>
                  </div>
                </div>
              </Card>
            </div>
          ) : (
            <div className="py-12 text-center">
              <p className="text-on-surface-variant">No schema to preview yet.</p>
            </div>
          )}
        </WizardContent>

        {/* Step 4: Save */}
        <WizardContent stepId="save">
          <div className="space-y-6 py-8 text-center">
            <CheckCircle className="mx-auto h-16 w-16 text-success" />
            <div>
              <h3 className="text-xl font-semibold text-on-surface">Ready to Save</h3>
              <p className="mt-2 text-on-surface-variant">
                Your component schema is ready to be added to the library
              </p>
            </div>
          </div>
        </WizardContent>

        {/* Footer with navigation */}
        <WizardFooter
          leading={
            activeStep === 'prompt' ? (
              <p className="text-sm text-on-surface-variant">
                Powered by {OLLAMA_MODEL}
              </p>
            ) : null
          }
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
                  onClick={generateSchema}
                  disabled={isGenerating || !prompt.trim()}
                  leftIcon={isGenerating ? <Loader2 className="animate-spin" /> : <Sparkles />}
                >
                  {isGenerating ? 'Generating...' : 'Generate Schema'}
                </Button>
              )}

              {activeStep === 'review' && (
                <Button
                  variant="filled"
                  onClick={() => setActiveStep('preview')}
                  disabled={!generatedSchema}
                  rightIcon={<ArrowRight />}
                >
                  Continue
                </Button>
              )}

              {activeStep === 'preview' && (
                <Button
                  variant="filled"
                  onClick={() => setActiveStep('save')}
                  rightIcon={<ArrowRight />}
                >
                  Continue
                </Button>
              )}

              {activeStep === 'save' && (
                <Button
                  variant="filled"
                  onClick={handleSaveAndContinue}
                  leftIcon={<Save />}
                >
                  Save to Library
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

export default PromptToComponent;
