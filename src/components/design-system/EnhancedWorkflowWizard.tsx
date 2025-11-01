import React, { useState, useCallback, useEffect } from 'react';
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
  CheckCircle2,
  AlertCircle,
  Loader2,
  Settings,
  Target,
  Layers,
  Workflow as WorkflowIcon,
  Play,
  Save,
  Search,
  Globe,
  TrendingUp,
  Link,
  Calendar,
  FileText,
  Database,
  Check,
} from 'lucide-react';

// Workflow process types
export type WorkflowProcessType =
  | 'scraping'
  | 'crawling'
  | 'seo_optimization'
  | 'url_seeding'
  | 'scheduling'
  | 'content_generation'
  | 'data_mining'
  | 'analysis';

export interface WorkflowProcess {
  id: string;
  name: string;
  processType: WorkflowProcessType;
  description: string;
  icon: React.ReactNode;
  schema: ComponentSchema;
  tasks: WorkflowTask[];
  config: Record<string, any>;
  selected?: boolean;
}

export interface WorkflowTask {
  id: string;
  name: string;
  description: string;
  executionOrder: number;
  schema: ComponentSchema;
  handlerFunction: string;
  canRunParallel?: boolean;
}

export interface EnhancedWorkflowCampaign {
  id?: string;
  name: string;
  description: string;
  selectedProcesses: WorkflowProcess[];
  schedule?: {
    frequency: 'once' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'custom_cron';
    cronExpression?: string;
    startDate?: Date;
    endDate?: Date;
  };
  urlSeeds?: Array<{
    url: string;
    priority: number;
    category?: string;
  }>;
  settings: {
    adminLevel: Record<string, any>;
    clientLevel: Record<string, any>;
  };
}

interface EnhancedWorkflowWizardProps {
  onComplete?: (campaign: EnhancedWorkflowCampaign) => void;
  onCancel?: () => void;
  className?: string;
}

const WORKFLOW_PROCESSES: WorkflowProcess[] = [
  {
    id: 'web-crawling',
    name: 'Web Crawling',
    processType: 'crawling',
    description: 'Crawl websites and extract content, links, and metadata',
    icon: <Globe className="h-6 w-6" />,
    schema: {
      name: 'WebCrawling',
      type: 'component',
      fields: [
        { id: '1', key: 'maxDepth', label: 'Max Depth', type: 'number', required: true },
        { id: '2', key: 'respectRobotsTxt', label: 'Respect Robots.txt', type: 'boolean', required: true },
        { id: '3', key: 'rateLimit', label: 'Rate Limit (ms)', type: 'number', required: true },
      ],
    },
    tasks: [],
    config: {},
  },
  {
    id: 'seo-analysis',
    name: 'SEO Analysis',
    processType: 'seo_optimization',
    description: 'Analyze web pages for SEO optimization opportunities',
    icon: <TrendingUp className="h-6 w-6" />,
    schema: {
      name: 'SEOAnalysis',
      type: 'component',
      fields: [
        { id: '1', key: 'targetKeywords', label: 'Target Keywords', type: 'array', required: true },
        { id: '2', key: 'analyzeBacklinks', label: 'Analyze Backlinks', type: 'boolean', required: false },
        { id: '3', key: 'checkMobileFriendly', label: 'Check Mobile Friendly', type: 'boolean', required: true },
      ],
    },
    tasks: [],
    config: {},
  },
  {
    id: 'content-scraping',
    name: 'Content Scraping',
    processType: 'scraping',
    description: 'Extract specific content from web pages using selectors',
    icon: <Search className="h-6 w-6" />,
    schema: {
      name: 'ContentScraping',
      type: 'component',
      fields: [
        { id: '1', key: 'selectors', label: 'CSS Selectors', type: 'json', required: true },
        { id: '2', key: 'waitForSelector', label: 'Wait For Selector', type: 'string', required: false },
        { id: '3', key: 'pagination', label: 'Enable Pagination', type: 'boolean', required: false },
      ],
    },
    tasks: [],
    config: {},
  },
  {
    id: 'url-seeding',
    name: 'URL Seeding',
    processType: 'url_seeding',
    description: 'Discover and seed URLs for crawling and analysis',
    icon: <Link className="h-6 w-6" />,
    schema: {
      name: 'URLSeeding',
      type: 'component',
      fields: [
        { id: '1', key: 'discoverFromSitemap', label: 'Discover From Sitemap', type: 'boolean', required: true },
        { id: '2', key: 'discoverFromLinks', label: 'Discover From Links', type: 'boolean', required: true },
        { id: '3', key: 'maxDepth', label: 'Discovery Max Depth', type: 'number', required: true },
      ],
    },
    tasks: [],
    config: {},
  },
  {
    id: 'scheduling',
    name: 'Workflow Scheduling',
    processType: 'scheduling',
    description: 'Schedule automated workflow execution',
    icon: <Calendar className="h-6 w-6" />,
    schema: {
      name: 'Scheduling',
      type: 'component',
      fields: [
        { id: '1', key: 'frequency', label: 'Frequency', type: 'select', required: true, options: [
          { value: 'hourly', label: 'Hourly' },
          { value: 'daily', label: 'Daily' },
          { value: 'weekly', label: 'Weekly' },
          { value: 'monthly', label: 'Monthly' },
        ]},
        { id: '2', key: 'startDate', label: 'Start Date', type: 'datetime', required: true },
        { id: '3', key: 'maxExecutions', label: 'Max Executions', type: 'number', required: false },
      ],
    },
    tasks: [],
    config: {},
  },
  {
    id: 'content-generation',
    name: 'Content Generation',
    processType: 'content_generation',
    description: 'Generate SEO-optimized content using AI',
    icon: <FileText className="h-6 w-6" />,
    schema: {
      name: 'ContentGeneration',
      type: 'component',
      fields: [
        { id: '1', key: 'topic', label: 'Topic', type: 'string', required: true },
        { id: '2', key: 'keywords', label: 'Keywords', type: 'array', required: true },
        { id: '3', key: 'wordCount', label: 'Word Count', type: 'number', required: true },
        { id: '4', key: 'tone', label: 'Tone', type: 'select', required: true, options: [
          { value: 'professional', label: 'Professional' },
          { value: 'casual', label: 'Casual' },
          { value: 'technical', label: 'Technical' },
        ]},
      ],
    },
    tasks: [],
    config: {},
  },
  {
    id: 'data-mining',
    name: 'Data Mining',
    processType: 'data_mining',
    description: 'Extract and analyze data patterns',
    icon: <Database className="h-6 w-6" />,
    schema: {
      name: 'DataMining',
      type: 'component',
      fields: [
        { id: '1', key: 'miningType', label: 'Mining Type', type: 'select', required: true, options: [
          { value: 'dom_patterns', label: 'DOM Patterns' },
          { value: 'content_patterns', label: 'Content Patterns' },
          { value: 'seo_patterns', label: 'SEO Patterns' },
        ]},
        { id: '2', key: 'minSupport', label: 'Minimum Support', type: 'number', required: true },
      ],
    },
    tasks: [],
    config: {},
  },
];

export const EnhancedWorkflowWizard: React.FC<EnhancedWorkflowWizardProps> = ({
  onComplete,
  onCancel,
  className,
}) => {
  const [activeStep, setActiveStep] = useState('select-processes');
  const [campaign, setCampaign] = useState<EnhancedWorkflowCampaign>({
    name: '',
    description: '',
    selectedProcesses: [],
    settings: {
      adminLevel: {},
      clientLevel: {},
    },
  });
  const [availableProcesses, setAvailableProcesses] = useState<WorkflowProcess[]>(WORKFLOW_PROCESSES);
  const [editingProcess, setEditingProcess] = useState<WorkflowProcess | null>(null);

  const toggleProcessSelection = useCallback((processId: string) => {
    setCampaign((prev) => {
      const process = availableProcesses.find((p) => p.id === processId);
      if (!process) return prev;

      const isSelected = prev.selectedProcesses.some((p) => p.id === processId);

      if (isSelected) {
        return {
          ...prev,
          selectedProcesses: prev.selectedProcesses.filter((p) => p.id !== processId),
        };
      } else {
        return {
          ...prev,
          selectedProcesses: [...prev.selectedProcesses, { ...process, selected: true }],
        };
      }
    });
  }, [availableProcesses]);

  const updateProcessConfig = useCallback((processId: string, schema: ComponentSchema) => {
    setCampaign((prev) => ({
      ...prev,
      selectedProcesses: prev.selectedProcesses.map((p) =>
        p.id === processId ? { ...p, schema } : p
      ),
    }));
  }, []);

  const saveCampaign = useCallback(async () => {
    try {
      const response = await fetch('/api/workflows/enhanced-campaigns', {
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
      alert(error.message || 'Failed to save campaign');
    }
  }, [campaign, onComplete]);

  const steps: WizardStepDescriptor[] = [
    {
      id: 'select-processes',
      title: 'Select Processes',
      subtitle: 'Choose workflow processes to include',
      status: activeStep === 'select-processes' ? 'active' : 'completed',
      meta: {
        caption: campaign.selectedProcesses.length > 0 
          ? `${campaign.selectedProcesses.length} selected` 
          : undefined,
      },
    },
    {
      id: 'configure-processes',
      title: 'Configure Processes',
      subtitle: 'Set up each selected process',
      status:
        activeStep === 'configure-processes'
          ? 'active'
          : campaign.selectedProcesses.length > 0
            ? 'completed'
            : 'pending',
    },
    {
      id: 'url-seeds',
      title: 'URL Seeds',
      subtitle: 'Add URLs to process',
      status: activeStep === 'url-seeds' ? 'active' : 'pending',
    },
    {
      id: 'scheduling',
      title: 'Schedule',
      subtitle: 'Set up automation schedule',
      status: activeStep === 'scheduling' ? 'active' : 'pending',
    },
    {
      id: 'review',
      title: 'Review & Launch',
      subtitle: 'Review and deploy workflow',
      status: activeStep === 'review' ? 'active' : 'pending',
    },
  ];

  return (
    <div className={cn('min-h-screen bg-surface p-6', className)}>
      <Wizard
        title="Create Enhanced Workflow"
        description="Build automated workflows with multiple processes, scheduling, and URL management"
        steps={steps}
        activeStepId={activeStep}
        onStepChange={setActiveStep}
        actions={
          <Badge variant="primary" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Enhanced Workflow
          </Badge>
        }
      >
        {/* Step 1: Select Processes */}
        <WizardContent stepId="select-processes">
          <div className="space-y-6">
            <div>
              <h3 className="mb-2 text-lg font-semibold text-on-surface">Campaign Details</h3>
              <p className="text-sm text-on-surface-variant">
                Name your campaign and select the processes to include
              </p>
            </div>

            <div className="space-y-4">
              <Input
                label="Campaign Name"
                value={campaign.name}
                onChange={(e) => setCampaign({ ...campaign, name: e.target.value })}
                placeholder="My Workflow Campaign"
                required
              />

              <div>
                <label className="mb-2 block text-sm font-medium text-on-surface">
                  Description
                </label>
                <textarea
                  value={campaign.description}
                  onChange={(e) => setCampaign({ ...campaign, description: e.target.value })}
                  placeholder="Describe the purpose of this campaign..."
                  className="h-24 w-full rounded-lg border border-outline bg-surface p-4 text-on-surface placeholder:text-on-surface-variant focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div>
              <h4 className="mb-4 font-semibold text-on-surface">Select Workflow Processes</h4>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {availableProcesses.map((process) => {
                  const isSelected = campaign.selectedProcesses.some((p) => p.id === process.id);

                  return (
                    <Card
                      key={process.id}
                      variant={isSelected ? 'filled' : 'outlined'}
                      className={cn(
                        'cursor-pointer transition-all hover:shadow-lg',
                        isSelected && 'border-primary bg-primary-container/20'
                      )}
                      onClick={() => toggleProcessSelection(process.id)}
                    >
                      <div className="p-4">
                        <div className="mb-3 flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-primary/10 p-2 text-primary">
                              {process.icon}
                            </div>
                            {isSelected && (
                              <div className="rounded-full bg-primary p-1">
                                <Check className="h-4 w-4 text-on-primary" />
                              </div>
                            )}
                          </div>
                          <Badge variant={isSelected ? 'primary' : 'secondary'} className="text-xs">
                            {process.processType}
                          </Badge>
                        </div>
                        <h5 className="mb-2 font-semibold text-on-surface">{process.name}</h5>
                        <p className="text-sm text-on-surface-variant">{process.description}</p>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>

            {campaign.selectedProcesses.length > 0 && (
              <Card variant="outlined" className="p-4">
                <h5 className="mb-3 font-semibold text-on-surface">Selected Processes</h5>
                <div className="flex flex-wrap gap-2">
                  {campaign.selectedProcesses.map((process) => (
                    <Badge key={process.id} variant="primary" className="flex items-center gap-2">
                      {process.icon}
                      {process.name}
                    </Badge>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </WizardContent>

        {/* Step 2: Configure Processes */}
        <WizardContent stepId="configure-processes">
          {campaign.selectedProcesses.length > 0 ? (
            <div className="space-y-6">
              <div>
                <h3 className="mb-2 text-lg font-semibold text-on-surface">Configure Processes</h3>
                <p className="text-sm text-on-surface-variant">
                  Set up configuration for each selected process
                </p>
              </div>

              {campaign.selectedProcesses.map((process) => (
                <Card key={process.id} variant="outlined" className="p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-primary/10 p-2 text-primary">
                        {process.icon}
                      </div>
                      <div>
                        <h4 className="font-semibold text-on-surface">{process.name}</h4>
                        <p className="text-sm text-on-surface-variant">{process.description}</p>
                      </div>
                    </div>
                    <Button
                      variant="text"
                      size="sm"
                      onClick={() => setEditingProcess(editingProcess?.id === process.id ? null : process)}
                    >
                      {editingProcess?.id === process.id ? 'Collapse' : 'Configure'}
                    </Button>
                  </div>

                  {editingProcess?.id === process.id && (
                    <div className="mt-4 border-t border-outline pt-4">
                      <SchemaEditor
                        schema={process.schema}
                        onChange={(schema) => updateProcessConfig(process.id, schema)}
                        mode="visual"
                        onSave={() => setEditingProcess(null)}
                      />
                    </div>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <p className="text-on-surface-variant">
                No processes selected. Go back to select processes.
              </p>
            </div>
          )}
        </WizardContent>

        {/* Step 3: URL Seeds */}
        <WizardContent stepId="url-seeds">
          <div className="space-y-6">
            <div>
              <h3 className="mb-2 text-lg font-semibold text-on-surface">URL Seeds</h3>
              <p className="text-sm text-on-surface-variant">
                Add URLs to be processed by your workflow
              </p>
            </div>

            <Card variant="outlined" className="p-4">
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-on-surface">
                    Add URLs (one per line)
                  </label>
                  <textarea
                    placeholder="https://example.com&#10;https://example.com/page&#10;https://another-site.com"
                    className="h-48 w-full rounded-lg border border-outline bg-surface p-4 font-mono text-sm text-on-surface placeholder:text-on-surface-variant focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    onChange={(e) => {
                      const urls = e.target.value
                        .split('\n')
                        .filter((url) => url.trim())
                        .map((url, index) => ({
                          url: url.trim(),
                          priority: 5,
                          category: 'default',
                        }));
                      setCampaign({ ...campaign, urlSeeds: urls });
                    }}
                  />
                </div>

                {campaign.urlSeeds && campaign.urlSeeds.length > 0 && (
                  <div>
                    <h5 className="mb-2 text-sm font-semibold text-on-surface">
                      Parsed URLs ({campaign.urlSeeds.length})
                    </h5>
                    <div className="max-h-64 overflow-auto rounded-lg bg-surface-container p-3">
                      <ul className="space-y-1 text-sm text-on-surface-variant">
                        {campaign.urlSeeds.slice(0, 10).map((seed, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {seed.priority}
                            </Badge>
                            {seed.url}
                          </li>
                        ))}
                        {campaign.urlSeeds.length > 10 && (
                          <li className="text-on-surface-variant/60">
                            ... and {campaign.urlSeeds.length - 10} more
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </WizardContent>

        {/* Step 4: Scheduling */}
        <WizardContent stepId="scheduling">
          <div className="space-y-6">
            <div>
              <h3 className="mb-2 text-lg font-semibold text-on-surface">Workflow Schedule</h3>
              <p className="text-sm text-on-surface-variant">
                Configure when and how often the workflow should run
              </p>
            </div>

            <Card variant="outlined" className="p-4">
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-on-surface">Frequency</label>
                  <select
                    className="w-full rounded-lg border border-outline bg-surface px-4 py-2 text-on-surface"
                    value={campaign.schedule?.frequency || 'once'}
                    onChange={(e) =>
                      setCampaign({
                        ...campaign,
                        schedule: {
                          ...(campaign.schedule || {}),
                          frequency: e.target.value as any,
                        },
                      })
                    }
                  >
                    <option value="once">Run Once</option>
                    <option value="hourly">Hourly</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="custom_cron">Custom (Cron)</option>
                  </select>
                </div>

                {campaign.schedule?.frequency === 'custom_cron' && (
                  <Input
                    label="Cron Expression"
                    placeholder="0 */6 * * *"
                    value={campaign.schedule?.cronExpression || ''}
                    onChange={(e) =>
                      setCampaign({
                        ...campaign,
                        schedule: {
                          ...(campaign.schedule || {}),
                          cronExpression: e.target.value,
                        },
                      })
                    }
                  />
                )}

                <Input
                  label="Start Date"
                  type="datetime-local"
                  value={campaign.schedule?.startDate?.toISOString().slice(0, 16) || ''}
                  onChange={(e) =>
                    setCampaign({
                      ...campaign,
                      schedule: {
                        ...(campaign.schedule || {}),
                        startDate: new Date(e.target.value),
                      },
                    })
                  }
                />

                <Input
                  label="End Date (Optional)"
                  type="datetime-local"
                  value={campaign.schedule?.endDate?.toISOString().slice(0, 16) || ''}
                  onChange={(e) =>
                    setCampaign({
                      ...campaign,
                      schedule: {
                        ...(campaign.schedule || {}),
                        endDate: e.target.value ? new Date(e.target.value) : undefined,
                      },
                    })
                  }
                />
              </div>
            </Card>
          </div>
        </WizardContent>

        {/* Step 5: Review */}
        <WizardContent stepId="review">
          <div className="space-y-6">
            <div className="text-center">
              <WorkflowIcon className="mx-auto h-16 w-16 text-success" />
              <h3 className="mt-4 text-xl font-semibold text-on-surface">Campaign Ready</h3>
              <p className="mt-2 text-on-surface-variant">
                Review your workflow configuration and launch
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
                  <span className="text-on-surface-variant">Processes:</span>
                  <Badge variant="primary">{campaign.selectedProcesses.length}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">URLs:</span>
                  <Badge variant="secondary">{campaign.urlSeeds?.length || 0}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Schedule:</span>
                  <Badge variant="tertiary">{campaign.schedule?.frequency || 'Not set'}</Badge>
                </div>
              </div>

              <div className="mt-6">
                <h5 className="mb-3 font-semibold text-on-surface">Selected Processes:</h5>
                <div className="space-y-2">
                  {campaign.selectedProcesses.map((process) => (
                    <div key={process.id} className="flex items-center gap-3 rounded-lg bg-surface-container p-3">
                      <div className="rounded bg-primary/10 p-2 text-primary">
                        {process.icon}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-on-surface">{process.name}</div>
                        <div className="text-xs text-on-surface-variant">{process.processType}</div>
                      </div>
                      <CheckCircle2 className="h-5 w-5 text-success" />
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </WizardContent>

        {/* Footer Navigation */}
        <WizardFooter
          trailing={
            <div className="flex items-center gap-3">
              {activeStep !== 'select-processes' && (
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

              {activeStep === 'select-processes' && (
                <Button
                  variant="filled"
                  onClick={() => setActiveStep('configure-processes')}
                  disabled={campaign.selectedProcesses.length === 0}
                  rightIcon={<ArrowRight />}
                >
                  Continue
                </Button>
              )}

              {activeStep === 'configure-processes' && (
                <Button
                  variant="filled"
                  onClick={() => setActiveStep('url-seeds')}
                  rightIcon={<ArrowRight />}
                >
                  Continue
                </Button>
              )}

              {activeStep === 'url-seeds' && (
                <Button
                  variant="filled"
                  onClick={() => setActiveStep('scheduling')}
                  rightIcon={<ArrowRight />}
                >
                  Continue
                </Button>
              )}

              {activeStep === 'scheduling' && (
                <Button
                  variant="filled"
                  onClick={() => setActiveStep('review')}
                  rightIcon={<ArrowRight />}
                >
                  Review
                </Button>
              )}

              {activeStep === 'review' && (
                <Button variant="filled" onClick={saveCampaign} leftIcon={<Play />}>
                  Launch Workflow
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

export default EnhancedWorkflowWizard;
