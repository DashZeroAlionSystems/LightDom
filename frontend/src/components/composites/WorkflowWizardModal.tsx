import React, { useEffect, useMemo, useState } from 'react';
import { Modal, Button, Card, Input, Checkbox } from '@/components/ui';

export interface WorkflowWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  config?: any;
  initialStep?: string;
}

type Template = { id: string; label: string; description?: string; default_tasks?: any[] };
type Task = { id: string; task_key: string; task_label: string; prompt?: string; selected?: boolean };

const STEP_IDS = ['ideation', 'db', 'template', 'tasks', 'link', 'review'] as const;
type StepId = (typeof STEP_IDS)[number];

const isStepId = (value: string): value is StepId => STEP_IDS.includes(value as StepId);

const DEFAULT_SCHEMA_BLUEPRINT = `{
  "entities": [],
  "relationships": []
}`;

const STEP_METADATA: { id: StepId; title: string; subtitle: string }[] = [
  { id: 'ideation', title: 'Prompt', subtitle: 'Describe workflow goals' },
  { id: 'db', title: 'Schemas', subtitle: 'Check data readiness' },
  { id: 'template', title: 'Template', subtitle: 'Select configuration' },
  { id: 'tasks', title: 'Tasks', subtitle: 'Pick automation steps' },
  { id: 'link', title: 'Links', subtitle: 'Map schema roles' },
  { id: 'review', title: 'Review', subtitle: 'Confirm & generate' },
];

export const WorkflowWizardModal: React.FC<WorkflowWizardModalProps> = ({ isOpen, onClose, config, initialStep = 'ideation' }) => {
  const [activeStep, setActiveStep] = useState<StepId>('ideation');
  const [completed, setCompleted] = useState<Record<string, boolean>>({});
  const [verifying, setVerifying] = useState(false);
  const [dbVerified, setDbVerified] = useState(false);

  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [availableTasks, setAvailableTasks] = useState<Task[]>([]);

  const [schemaBlueprint, setSchemaBlueprint] = useState('');
  const [configTemplate, setConfigTemplate] = useState('');
  const [configOverrides, setConfigOverrides] = useState<Array<{ id: string; key: string; value: string }>>([]);

  const [schemaLinks, setSchemaLinks] = useState<Array<{ schema_uri?: string; role?: string }>>([]);
  const [generated, setGenerated] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [planning, setPlanning] = useState(false);
  const [campaignPrompt, setCampaignPrompt] = useState<string>(
    config?.defaultPrompt ||
      'Design an SEO content operations workflow that ingests keyword research, prioritises opportunities, generates briefs, and monitors performance.'
  );
  const [promptInsights, setPromptInsights] = useState<any>(null);

  const resetWizard = () => {
    setActiveStep('ideation');
    setCompleted({});
    setVerifying(false);
    setDbVerified(false);
    setTemplates([]);
    setSelectedTemplate(null);
    setAvailableTasks([]);
    setSchemaBlueprint('');
    setConfigTemplate('');
    setConfigOverrides([]);
    setSchemaLinks([]);
    setGenerated(null);
    setPlanning(false);
    setCampaignPrompt(
      config?.defaultPrompt ||
        'Design an SEO content operations workflow that ingests keyword research, prioritises opportunities, generates briefs, and monitors performance.'
    );
    setPromptInsights(null);
  };

  useEffect(() => {
    if (!isOpen) {
      resetWizard();
      return;
    }

    const startStep = isStepId(initialStep) ? initialStep : 'ideation';
    setActiveStep(startStep);

    const precedingSteps = STEP_IDS.slice(0, STEP_IDS.indexOf(startStep));
    if (startStep !== 'ideation') {
      const preCompleted = precedingSteps.reduce<Record<string, boolean>>((acc, stepId) => {
        acc[stepId] = true;
        return acc;
      }, {});
      setCompleted(preCompleted);
    }

    if (precedingSteps.includes('db') || startStep !== 'db') {
      setDbVerified(true);
    }
  }, [isOpen, initialStep]);

  const steps = useMemo(() => STEP_METADATA, []);
  const activeIndex = useMemo(() => STEP_IDS.indexOf(activeStep), [activeStep]);
  const completedCount = useMemo(() => Object.values(completed).filter(Boolean).length, [completed]);
  const isLastStep = activeStep === 'review';

  const verifySchemas = async () => {
    setVerifying(true);
    try {
      const res = await fetch('/api/workflow/verify-schemas');
      if (res.ok) {
        const data = await res.json();
        setDbVerified(Boolean(data.verified));
        if (data.verified) setCompleted((c) => ({ ...c, db: true }));
      }
    } catch (error) {
      // ignore
    } finally {
      setVerifying(false);
    }
  };

  const applyGeneratedPlan = (plan: any) => {
    if (!plan) return;
    setPromptInsights(plan.insights || plan);

    if (plan.recommended_prompt) {
      setCampaignPrompt(plan.recommended_prompt);
    }

    if (plan.schema_blueprint) {
      setSchemaBlueprint(plan.schema_blueprint);
    }

    if (plan.config_template) {
      const formattedTemplate =
        typeof plan.config_template === 'string' ? plan.config_template : JSON.stringify(plan.config_template, null, 2);
      setConfigTemplate(formattedTemplate);
    }

    if (Array.isArray(plan.config_overrides)) {
      setConfigOverrides(
        plan.config_overrides.map((entry: any, index: number) => ({
          id: `plan-override-${index}`,
          key: entry.key ?? '',
          value: typeof entry.value === 'string' ? entry.value : JSON.stringify(entry.value ?? '', null, 2),
        }))
      );
    }

    if (plan.template_id) {
      setSelectedTemplate(plan.template_id);
      setCompleted((prev) => ({ ...prev, template: true }));
    }

    if (Array.isArray(plan.tasks) && plan.tasks.length > 0) {
      const mapped: Task[] = plan.tasks.map((task: any) => ({
        id: task.id ?? task.task_key ?? crypto.randomUUID?.() ?? `task-${Math.random().toString(36).slice(2, 8)}`,
        task_key: task.task_key ?? task.id ?? `task-${Math.random().toString(36).slice(2, 8)}`,
        task_label: task.task_label ?? task.label ?? 'Task',
        prompt: task.prompt ?? '',
        selected: task.selected ?? true,
      }));
      setAvailableTasks(mapped);
      setCompleted((prev) => ({ ...prev, tasks: true }));
    }

    if (Array.isArray(plan.schema_links) && plan.schema_links.length > 0) {
      setSchemaLinks(plan.schema_links);
    }

    setCompleted((prev) => ({ ...prev, ideation: true }));
  };

  const generateWorkflowPlan = async () => {
    setPlanning(true);
    try {
      const response = await fetch('/api/ai/workflow-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: campaignPrompt, context: config?.context || 'seo-campaign' }),
      });

      if (response.ok) {
        const data = await response.json();
        applyGeneratedPlan(data.plan || data);
      } else {
        throw new Error('Failed to fetch workflow plan');
      }
    } catch (error) {
      console.warn('workflow plan fallback', error);
      applyGeneratedPlan({
        recommended_prompt: campaignPrompt,
        template_id: 'seo-orchestration',
        tasks: [
          {
            id: 'collect-keywords',
            task_key: 'collect-keywords',
            task_label: 'Collect keyword opportunities',
            prompt: 'Aggregate keyword ideas from search console, competitor domains, and backlog docs.',
            selected: true,
          },
          {
            id: 'prioritize-opps',
            task_key: 'prioritize-opps',
            task_label: 'Prioritise opportunities',
            prompt: 'Score keywords by difficulty, intent, and business value to produce a shortlist.',
            selected: true,
          },
          {
            id: 'generate-briefs',
            task_key: 'generate-briefs',
            task_label: 'Generate content briefs',
            prompt: 'Create AI-assisted content briefs with outline, SERP analysis, and schema suggestions.',
            selected: true,
          },
          {
            id: 'publish-monitor',
            task_key: 'publish-monitor',
            task_label: 'Monitor & report',
            prompt: 'Track performance changes post-publication with automated dashboards.',
            selected: true,
          },
        ],
        schema_blueprint: `{
  "entities": [
    { "name": "KeywordOpportunity", "attributes": ["keyword", "difficulty", "intent", "volume"] },
    { "name": "ContentBrief", "attributes": ["title", "outline", "target_keyword", "schema"] },
    { "name": "PerformanceSnapshot", "attributes": ["page", "metric", "value", "delta"] }
  ],
  "relationships": [
    { "from": "KeywordOpportunity", "to": "ContentBrief", "type": "informs" },
    { "from": "ContentBrief", "to": "PerformanceSnapshot", "type": "monitored_by" }
  ]
}`,
        config_template: {
          campaign_goal: 'Increase organic sessions for high-intent pages',
          segments: ['blogs', 'landing-pages'],
          success_metrics: ['organic_sessions', 'avg_position', 'conversion_rate'],
        },
        config_overrides: [
          { key: 'alerts.threshold', value: '0.15' },
          { key: 'reporting.cadence', value: 'weekly' },
        ],
        schema_links: [
          { schema_uri: 'https://schema.org/WebPage', role: 'contentBriefTarget' },
          { schema_uri: 'https://schema.org/Report', role: 'performanceSnapshot' },
        ],
        insights: {
          summary: 'Recommended workflow emphasises ingest → prioritise → brief → monitor loop.',
          key_metrics: ['Organic sessions', 'Average position', 'Brief adoption'],
        },
      });
    } finally {
      setPlanning(false);
      setActiveStep('db');
    }
  };

  const createSchemas = async () => {
    setVerifying(true);
    try {
      const res = await fetch('/api/workflow/create-schemas', { method: 'POST' });
      if (res.ok) {
        await verifySchemas();
      }
    } catch (error) {
      // ignore
    } finally {
      setVerifying(false);
    }
  };

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/workflow/templates');
      if (res.ok) {
        const data = await res.json();
        setTemplates(data.templates || []);
      }
    } catch (error) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeStep === 'template') {
      loadTemplates();
    }
  }, [activeStep]);

  const selectTemplate = async (id: string) => {
    setSelectedTemplate(id);
    setLoading(true);
    try {
      const res = await fetch(`/api/workflow/templates/${id}/tasks`);
      if (res.ok) {
        const data = await res.json();
        const tasks: Task[] = (data.tasks || []).map((t: any) => ({
          id: t.id ?? t.task_key,
          task_key: t.task_key ?? t.id,
          task_label: t.task_label ?? t.label,
          selected: Boolean(t.selected ?? false),
          prompt: t.prompt ?? '',
        }));
        setAvailableTasks(tasks);
        setCompleted((c) => ({ ...c, template: true }));

        const schemaPreset = data.schema_blueprint || data.template?.schema_blueprint || DEFAULT_SCHEMA_BLUEPRINT;
        setSchemaBlueprint(schemaPreset);

        const configTemplateSource = data.config_template || data.template?.config_template || config?.defaultTemplate || {};
        const formattedTemplate =
          typeof configTemplateSource === 'string' ? configTemplateSource : JSON.stringify(configTemplateSource, null, 2);
        setConfigTemplate(formattedTemplate);

        const overrides = (data.template?.config_overrides || []).map((entry: any, index: number) => ({
          id: `${id}-override-${index}`,
          key: entry.key ?? entry.field ?? '',
          value: typeof entry.value === 'string' ? entry.value : JSON.stringify(entry.value ?? '', null, 2),
        }));
        setConfigOverrides(overrides);
      }
    } catch (error) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const toggleTask = (taskId: string) => {
    setAvailableTasks((prev) => prev.map((task) => (task.id === taskId ? { ...task, selected: !task.selected } : task)));
  };

  const updateTaskPrompt = (taskId: string, prompt: string) => {
    setAvailableTasks((prev) => prev.map((task) => (task.id === taskId ? { ...task, prompt } : task)));
  };

  const addSchemaLink = () => setSchemaLinks((prev) => [...prev, { schema_uri: '', role: '' }]);

  const updateSchemaLink = (index: number, field: 'schema_uri' | 'role', value: string) => {
    setSchemaLinks((prev) => prev.map((link, idx) => (idx === index ? { ...link, [field]: value } : link)));
  };

  const addConfigOverride = () => {
    setConfigOverrides((prev) => [...prev, { id: `override-${Date.now()}`, key: '', value: '' }]);
  };

  const updateConfigOverride = (overrideId: string, field: 'key' | 'value', value: string) => {
    setConfigOverrides((prev) => prev.map((entry) => (entry.id === overrideId ? { ...entry, [field]: value } : entry)));
  };

  const removeConfigOverride = (overrideId: string) => {
    setConfigOverrides((prev) => prev.filter((entry) => entry.id !== overrideId));
  };

  const generateWorkflow = async () => {
    setLoading(true);
    try {
      const payload = {
        template_id: selectedTemplate,
        tasks: availableTasks.filter((task) => task.selected).map((task) => ({ ...task })),
        schema_links: schemaLinks,
        schema_blueprint: schemaBlueprint,
        config_template: configTemplate,
        config_overrides: configOverrides
          .filter((entry) => entry.key || entry.value)
          .map((entry) => ({ key: entry.key, value: entry.value })),
        metadata: { created_at: new Date().toISOString() },
      };

      const genRes = await fetch('/api/ollama/generate-workflow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ template: 'create_workflow_from_description', parameters: payload }),
      });

      if (genRes.ok) {
        const genData = await genRes.json();
        const saveRes = await fetch('/api/workflow/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...payload, generated_structure: genData.result || {} }),
        });

        if (saveRes.ok) {
          const saved = await saveRes.json();
          setGenerated(saved);
          setCompleted((c) => ({ ...c, review: true }));
        }
      }
    } catch (error) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    setCompleted((prev) => ({ ...prev, [activeStep]: true }));
    const idx = STEP_IDS.indexOf(activeStep);
    if (idx < STEP_IDS.length - 1) {
      setActiveStep(STEP_IDS[idx + 1]);
    }
  };

  const handlePrev = () => {
    if (activeIndex > 0) {
      setActiveStep(STEP_IDS[activeIndex - 1]);
    }
  };

  const canNavigateTo = (stepId: StepId) => {
    const targetIndex = STEP_IDS.indexOf(stepId);
    if (targetIndex <= activeIndex) return true;
    const requiredSteps = STEP_IDS.slice(0, targetIndex);
    return requiredSteps.every((step) => completed[step]);
  };

  const cardBaseClasses = 'flex h-full flex-col rounded-2xl border border-outline/30 bg-surface-container-high shadow-none';

  const renderStepCard = () => {
    switch (activeStep) {
      case 'ideation':
        return (
          <Card variant="filled" className={`${cardBaseClasses} gap-4`}>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-foreground">Describe the workflow</h3>
              <p className="text-sm text-muted-foreground">
                Provide the high-level intent for this automation. We’ll seed template selection and tasks from this brief.
              </p>
            </div>
            <textarea
              className="min-h-[160px] w-full rounded-xl border border-outline bg-surface p-3 text-sm text-foreground"
              value={campaignPrompt}
              onChange={(event) => {
                setCampaignPrompt(event.target.value);
                setCompleted((prev) => ({ ...prev, ideation: false }));
              }}
              placeholder="Example: Ingest keyword research, generate briefs, and monitor results for the SEO team."
            />
            <div className="flex flex-wrap items-center gap-2">
              <Button onClick={generateWorkflowPlan} disabled={planning}>
                {planning ? 'Analysing…' : 'Generate plan'}
              </Button>
              <Button variant="text" onClick={() => applyGeneratedPlan({ recommended_prompt: campaignPrompt })}>
                Use current prompt
              </Button>
            </div>
            {promptInsights && (
              <div className="rounded-2xl border border-outline/20 bg-surface-container p-3 text-sm text-muted-foreground">
                <p className="font-medium text-foreground">AI summary</p>
                <p className="mt-1">
                  {promptInsights.summary || 'Prompt analysed. Suggested configuration seeded into later steps.'}
                </p>
                {Array.isArray(promptInsights.key_metrics) && promptInsights.key_metrics.length > 0 && (
                  <ul className="mt-2 list-disc pl-4">
                    {promptInsights.key_metrics.map((metric: string) => (
                      <li key={metric}>{metric}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </Card>
        );
      case 'db':
        return (
          <Card variant="filled" className={`${cardBaseClasses} gap-3`}>
            <p className="text-sm text-muted-foreground">
              Confirm that database schemas and tables required for workflow execution are present.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <Button onClick={verifySchemas} disabled={verifying}>
                {verifying ? 'Checking…' : 'Verify schemas'}
              </Button>
              {!dbVerified && (
                <Button variant="text" onClick={createSchemas}>
                  Create missing tables
                </Button>
              )}
              {dbVerified && <span className="text-sm font-medium text-success">Schemas verified</span>}
            </div>
          </Card>
        );
      case 'template':
        return (
          <Card variant="filled" className={`${cardBaseClasses} gap-4`}>
            <p className="text-sm text-muted-foreground">Choose a base template and adjust configuration to your needs.</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {templates.map((template) => (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => selectTemplate(template.id)}
                  className={`rounded-xl border p-3 text-left transition ${
                    selectedTemplate === template.id
                      ? 'border-primary bg-primary/10 text-foreground'
                      : 'border-outline/30 bg-surface text-foreground'
                  }`}
                >
                  <span className="text-sm font-semibold">{template.label}</span>
                  <p className="mt-1 text-xs text-muted-foreground">{template.description}</p>
                </button>
              ))}
              {!templates.length && <p className="text-sm text-muted-foreground">No templates available.</p>}
            </div>

            {selectedTemplate && (
              <div className="space-y-3">
                <div className="grid gap-3 lg:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Schema blueprint</label>
                    <textarea
                      className="min-h-[140px] w-full rounded-xl border border-outline bg-surface p-3 font-mono text-xs text-foreground"
                      value={schemaBlueprint}
                      onChange={(event) => setSchemaBlueprint(event.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Configuration template</label>
                    <textarea
                      className="min-h-[140px] w-full rounded-xl border border-outline bg-surface p-3 font-mono text-xs text-foreground"
                      value={configTemplate}
                      onChange={(event) => setConfigTemplate(event.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">Configuration overrides</span>
                    <Button variant="text" onClick={addConfigOverride}>
                      Add override
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {configOverrides.length === 0 && (
                      <p className="text-xs text-muted-foreground">No overrides applied.</p>
                    )}
                    {configOverrides.map((entry) => (
                      <div key={entry.id} className="rounded-xl border border-outline/30 bg-surface p-3">
                        <div className="grid gap-2 sm:grid-cols-[1.2fr,2fr]">
                          <Input
                            placeholder="Override key"
                            value={entry.key}
                            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                              updateConfigOverride(entry.id, 'key', event.target.value)
                            }
                          />
                          <textarea
                            className="min-h-[88px] w-full rounded-lg border border-outline bg-surface p-2 font-mono text-xs text-foreground"
                            value={entry.value}
                            onChange={(event) => updateConfigOverride(entry.id, 'value', event.target.value)}
                          />
                        </div>
                        <div className="mt-2 text-right">
                          <Button variant="text" onClick={() => removeConfigOverride(entry.id)}>
                            Remove
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </Card>
        );
      case 'tasks':
        return (
          <Card variant="filled" className={`${cardBaseClasses} gap-3`}>
            <p className="text-sm text-muted-foreground">
              Toggle the automation steps you want to keep and customise prompts for selected tasks.
            </p>
            <div className="space-y-2">
              {availableTasks.length === 0 && <p className="text-sm text-muted-foreground">No tasks loaded yet.</p>}
              {availableTasks.map((task) => (
                <div
                  key={task.id}
                  className={`rounded-xl border p-3 transition ${
                    task.selected ? 'border-primary/60 bg-primary/10' : 'border-outline/30 bg-surface'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-foreground">{task.task_label}</span>
                    <label className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Checkbox checked={Boolean(task.selected)} onChange={() => toggleTask(task.id)} />
                      Include task
                    </label>
                  </div>
                  {task.selected && (
                    <textarea
                      className="mt-3 w-full rounded-lg border border-outline bg-surface p-2 text-xs text-foreground"
                      rows={3}
                      value={task.prompt || ''}
                      onChange={(event) => updateTaskPrompt(task.id, event.target.value)}
                    />
                  )}
                </div>
              ))}
            </div>
          </Card>
        );
      case 'link':
        return (
          <Card variant="filled" className={`${cardBaseClasses} gap-3`}>
            <p className="text-sm text-muted-foreground">Map schema URIs to workflow roles.</p>
            <div className="space-y-2">
              {schemaLinks.map((link, index) => (
                <div key={index} className="grid gap-2 sm:grid-cols-[2fr,1.2fr]">
                  <Input
                    placeholder="Schema URI"
                    value={link.schema_uri || ''}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                      updateSchemaLink(index, 'schema_uri', event.target.value)
                    }
                  />
                  <Input
                    placeholder="Role"
                    value={link.role || ''}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                      updateSchemaLink(index, 'role', event.target.value)
                    }
                  />
                </div>
              ))}
              <Button variant="text" onClick={addSchemaLink}>
                Add schema link
              </Button>
            </div>
          </Card>
        );
      case 'review':
        return (
          <Card variant="filled" className={`${cardBaseClasses} gap-3`}>
            <h3 className="text-lg font-semibold text-foreground">Review configuration</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Template</p>
                <p className="text-sm text-foreground">
                  {templates.find((template) => template.id === selectedTemplate)?.label || 'Not selected'}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Tasks included</p>
                <p className="text-sm text-foreground">{availableTasks.filter((task) => task.selected).length}</p>
              </div>
            </div>
            {configOverrides.length > 0 && (
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Overrides</p>
                <ul className="mt-1 list-disc pl-4 text-sm text-muted-foreground">
                  {configOverrides
                    .filter((entry) => entry.key)
                    .map((entry) => (
                      <li key={entry.id}>{entry.key}</li>
                    ))}
                </ul>
              </div>
            )}
            {generated && (
              <div className="rounded-xl border border-outline/30 bg-surface p-3 text-xs">
                <p className="font-medium text-foreground">Generated workflow</p>
                <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap text-muted-foreground">
                  {JSON.stringify(generated, null, 2)}
                </pre>
              </div>
            )}
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create workflow" size="4xl" className="flex max-h-[90vh] flex-col">
      <div className="flex flex-col gap-4">
        <div className="flex gap-2 overflow-x-auto rounded-2xl border border-outline/20 bg-surface-container-high p-2">
          {steps.map((step) => {
            const state = completed[step.id]
              ? 'completed'
              : step.id === activeStep
              ? 'active'
              : STEP_IDS.indexOf(step.id) < activeIndex
              ? 'available'
              : 'upcoming';
            const canSelect = canNavigateTo(step.id) && step.id !== activeStep;

            return (
              <button
                key={step.id}
                type="button"
                onClick={() => canSelect && setActiveStep(step.id)}
                className={`min-w-[120px] rounded-xl border px-3 py-2 text-left transition ${
                  state === 'active'
                    ? 'border-primary bg-primary/15 text-foreground'
                    : state === 'completed'
                    ? 'border-success/30 bg-success/10 text-foreground'
                    : 'border-outline/20 bg-surface text-muted-foreground'
                } ${canSelect ? 'hover:border-primary/60 focus:outline-none' : 'cursor-default'}`}
              >
                <span className="block text-xs font-semibold uppercase tracking-wide">{step.title}</span>
                <span className="mt-1 block text-[11px] opacity-80">{step.subtitle}</span>
              </button>
            );
          })}
        </div>

        <div className="max-h-[60vh] overflow-y-auto pr-1">{renderStepCard()}</div>

        <footer className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-outline/20 bg-surface-container-high p-3">
          <div className="text-sm text-muted-foreground">{completedCount}/{steps.length} steps complete</div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="text" onClick={resetWizard}>
              Reset
            </Button>
            <Button variant="text" onClick={handlePrev} disabled={activeIndex === 0}>
              Back
            </Button>
            {!isLastStep && (
              <Button onClick={handleNext} disabled={activeStep === 'template' && !selectedTemplate}>
                Next
              </Button>
            )}
            {isLastStep && (
              <Button variant="filled" onClick={generateWorkflow} disabled={loading}>
                {loading ? 'Generating…' : 'Generate workflow'}
              </Button>
            )}
            <Button variant="outlined" onClick={onClose}>
              Close
            </Button>
          </div>
        </footer>
      </div>
    </Modal>
  );
};

export default WorkflowWizardModal;
