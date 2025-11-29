import React, { useMemo, useState } from 'react';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Checkbox,
  Input,
  TextArea,
} from '@/components/ui';

interface TemplateOption {
  id: string;
  name: string;
  description: string;
  category: 'seo' | 'ops' | 'ai';
  tags: string[];
}

interface ExecutionPlanStep {
  stepId: string;
  name: string;
  description: string;
  action: string;
  estimatedDuration: string;
  dependencies: string[];
}

interface ExecutionPlan {
  planId: string;
  templateId: string;
  title: string;
  description: string;
  steps: ExecutionPlanStep[];
  status: 'ready' | 'in-progress' | 'completed';
  variables: Record<string, string>;
}

interface AssistantLogEntry {
  id: string;
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp: string;
}

const TABS = [
  { id: 'templates', name: 'Templates & Planning', emoji: '📋' },
  { id: 'wiki', name: 'Knowledge Hub', emoji: '📚' },
  { id: 'components', name: 'Component Library', emoji: '🧩' },
  { id: 'assistant', name: 'AI Assistant', emoji: '🤖' },
] as const;

type TabId = typeof TABS[number]['id'];

export const UnifiedDashboardDemoPage: React.FC = () => {
  const templates = useMemo<TemplateOption[]>(
    () => [
      {
        id: 'content-enrichment',
        name: 'Content Enrichment Pipeline',
        description:
          'Automates schema enrichment, content clustering, and DeepSeek QA loops for multi-market landing pages.',
        category: 'seo',
        tags: ['schema', 'qa', 'localisation'],
      },
      {
        id: 'technical-audit',
        name: 'Technical SEO Audit',
        description: 'Runs Core Web Vitals checks, lighthouse audits, and prioritises remediation tasks.',
        category: 'seo',
        tags: ['core-web-vitals', 'lighthouse', 'automation'],
      },
      {
        id: 'partner-onboarding',
        name: 'Partner Onboarding Ops',
        description: 'Guides customer success through schema mapping, workflow provisioning, and training assets.',
        category: 'ops',
        tags: ['success', 'workflow', 'automation'],
      },
      {
        id: 'ai-governance',
        name: 'AI Governance Program',
        description: 'Tracks model experiments, dataset lineage, and risk reviews with scheduled guardrail checks.',
        category: 'ai',
        tags: ['ml', 'compliance', 'audit'],
      },
    ],
    []
  );

  const wikiTopics = useMemo(
    () => [
      {
        id: 'schema-validation',
        title: 'Schema-Driven Validation Playbook',
        summary:
          'Establish reusable schema validation pipelines with Zod + PostgreSQL JSONB to enforce contract-first development.',
        tags: ['schema', 'validation', 'postgres'],
      },
      {
        id: 'workflow-handoff',
        title: 'Workflow Handoff Templates',
        summary:
          'Document how automation jobs transition between data mining, enrichment, and reporting teams using ServiceHub.',
        tags: ['automation', 'handoff', 'servicehub'],
      },
      {
        id: 'observer-patterns',
        title: 'Observer Patterns for SEO dashboards',
        summary:
          'Design realtime observability surfaces using Socket.IO streams, workflow watcher events, and MD3 async states.',
        tags: ['observability', 'socket.io', 'md3'],
      },
    ],
    []
  );

  const componentEntries = useMemo(
    () => [
      {
        schemaId: 'ld:Workflow.GanttView',
        title: 'Workflow Gantt Timeline',
        description: 'Display orchestration stages with dependency tracking and timeboxed execution windows.',
        status: 'preview',
      },
      {
        schemaId: 'ld:Knowledge.TopicSummary',
        title: 'Topic Insight Card',
        description: 'Summarises wiki insights with MD3 badges, CTA actions, and knowledge graph attributes.',
        status: 'ga',
      },
      {
        schemaId: 'ld:Automation.PlanReview',
        title: 'Plan Review Panel',
        description: 'Collates AI generated plans, manual overrides, and ready-to-launch payloads with guardrail checks.',
        status: 'beta',
      },
    ],
    []
  );

  const [activeTab, setActiveTab] = useState<TabId>('templates');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(templates[0]?.id ?? null);
  const [formState, setFormState] = useState({
    projectName: 'Multi-market enrichment rollout',
    targetDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    priority: 'high',
    includeMonitoring: true,
    includeReporting: true,
    includeHumanReview: false,
    notes:
      'Focus on lighthouse remediation for hero journeys. Align schema output with existing ProductKnowledgeBase.',
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<ExecutionPlan | null>(null);
  const [assistantPrompt, setAssistantPrompt] = useState('');
  const [assistantLogs, setAssistantLogs] = useState<AssistantLogEntry[]>([{
    id: 'log-initial',
    role: 'system',
    content: 'DeepSeek assistant ready. Ask about workflow templates, schema drift, or admin navigation metadata.',
    timestamp: new Date().toISOString(),
  }]);

  const selectedTemplate = useMemo(
    () => templates.find(template => template.id === selectedTemplateId) ?? null,
    [selectedTemplateId, templates]
  );

  const handleGeneratePlan = () => {
    if (!selectedTemplate) {
      setGeneratedPlan(null);
      return;
    }

    setIsGenerating(true);
    setGeneratedPlan(null);
    window.setTimeout(() => {
      const mockPlan: ExecutionPlan = {
        planId: `plan-${Date.now()}`,
        templateId: selectedTemplate.id,
        title: `Execution plan for ${formState.projectName}`,
        description: `Generated using ${selectedTemplate.name}. Includes monitoring: ${formState.includeMonitoring ? 'yes' : 'no'}, reporting: ${formState.includeReporting ? 'yes' : 'no'}.`,
        status: 'ready',
        variables: {
          projectName: formState.projectName,
          targetDate: formState.targetDate,
          priority: formState.priority,
        },
        steps: [
          {
            stepId: 'collect-signals',
            name: 'Collect signals',
            description: 'Ingest crawler stats, backlog CSVs, and DeepSeek prompt history for baseline.',
            action: 'ingest',
            estimatedDuration: '45m',
            dependencies: [],
          },
          {
            stepId: 'cluster-topics',
            name: 'Cluster opportunities',
            description: 'Leverage LightDom clusterer to prioritise high-impact intents and generate outline prompts.',
            action: 'cluster',
            estimatedDuration: '60m',
            dependencies: ['collect-signals'],
          },
          {
            stepId: 'enrich-schema',
            name: 'Enrich schema entries',
            description: 'Generate JSON-LD with fallback to manual QA if human review is enabled.',
            action: 'enrich',
            estimatedDuration: '90m',
            dependencies: ['cluster-topics'],
          },
          {
            stepId: 'sync-monitoring',
            name: 'Sync monitoring dashboards',
            description: 'Publish plan to admin navigation, refresh MD3 dashboards, and notify owning squads.',
            action: 'notify',
            estimatedDuration: '30m',
            dependencies: ['enrich-schema'],
          },
        ],
      };

      setGeneratedPlan(mockPlan);
      setIsGenerating(false);
    }, 900);
  };

  const appendAssistantLog = (entry: Omit<AssistantLogEntry, 'id' | 'timestamp'>) => {
    setAssistantLogs(prev => [
      ...prev,
      {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        ...entry,
      },
    ]);
  };

  const handleAssistantSubmit = () => {
    if (!assistantPrompt.trim()) {
      return;
    }

    appendAssistantLog({ role: 'user', content: assistantPrompt.trim() });
    setAssistantPrompt('');

    window.setTimeout(() => {
      appendAssistantLog({
        role: 'assistant',
        content:
          'Synced with Template Watcher events. Recommend promoting "Content Enrichment Pipeline" to admin navigation for tonight’s deployment window.',
      });
    }, 650);
  };

  return (
    <div className='space-y-6 p-6'>
      <header className='rounded-3xl border border-outline/20 bg-gradient-to-br from-primary/10 via-surface-container-high to-surface p-6 shadow-sm'>
        <div className='flex flex-wrap items-start justify-between gap-4'>
          <div className='space-y-3'>
            <div className='inline-flex items-center gap-2 rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary'>
              Unified operations cockpit
            </div>
            <div>
              <h1 className='text-3xl font-semibold text-on-surface md:text-4xl'>Feature showcase dashboard</h1>
              <p className='mt-2 max-w-3xl text-sm text-on-surface-variant'>
                Explore workflow templates, knowledge topics, component catalogues, and the DeepSeek assistant — all powered by LightDom design system components and live watcher metadata when available.
              </p>
            </div>
          </div>
          <div className='flex flex-wrap items-center gap-2'>
            {TABS.map(tab => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? 'filled' : 'text'}
                onClick={() => setActiveTab(tab.id)}
                className={activeTab === tab.id ? 'shadow-level-1' : ''}
              >
                <span className='flex items-center gap-2'>
                  <span>{tab.emoji}</span>
                  <span className='md:hidden lg:inline'>{tab.name}</span>
                </span>
              </Button>
            ))}
          </div>
        </div>
      </header>

      {activeTab === 'templates' && (
        <section className='grid gap-6 lg:grid-cols-[minmax(0,1.1fr),minmax(0,0.9fr)]'>
          <div className='space-y-4'>
            <Card className='border-outline/15 bg-surface'>
              <CardHeader className='space-y-2'>
                <CardTitle className='text-on-surface'>Workflow templates</CardTitle>
                <p className='md3-body-small text-on-surface-variant'>Select a template to bootstrap an execution plan.</p>
              </CardHeader>
              <CardContent>
                <div className='grid gap-3 md:grid-cols-2'>
                  {templates.map(template => {
                    const isSelected = template.id === selectedTemplateId;
                    return (
                      <button
                        key={template.id}
                        type='button'
                        onClick={() => setSelectedTemplateId(template.id)}
                        className='text-left'
                      >
                        <Card
                          className={`h-full border transition-all ${
                            isSelected
                              ? 'border-primary shadow-level-1 bg-primary/5'
                              : 'border-outline/10 hover:border-outline/30'
                          }`}
                        >
                          <CardHeader className='space-y-2'>
                            <CardTitle className='md3-title-medium text-on-surface'>{template.name}</CardTitle>
                            <div className='flex flex-wrap gap-2'>
                              <Badge variant='secondary'>{template.category.toUpperCase()}</Badge>
                              {template.tags.map(tag => (
                                <Badge key={tag} variant='outline'>
                                  #{tag}
                                </Badge>
                              ))}
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className='md3-body-small text-on-surface-variant'>{template.description}</p>
                          </CardContent>
                        </Card>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card className='border-outline/15 bg-surface'>
              <CardHeader className='space-y-2'>
                <CardTitle className='text-on-surface'>Configuration</CardTitle>
                <p className='md3-body-small text-on-surface-variant'>Define project context before generating an AI-assisted plan.</p>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='grid gap-4 md:grid-cols-2'>
                  <Input
                    label='Project name'
                    value={formState.projectName}
                    onChange={event => setFormState(prev => ({ ...prev, projectName: event.target.value }))}
                  />
                  <Input
                    label='Target date'
                    type='date'
                    value={formState.targetDate}
                    onChange={event => setFormState(prev => ({ ...prev, targetDate: event.target.value }))}
                  />
                </div>
                <div className='grid gap-4 md:grid-cols-2'>
                  <Input
                    label='Priority'
                    value={formState.priority}
                    onChange={event => setFormState(prev => ({ ...prev, priority: event.target.value }))}
                  />
                  <div className='space-y-3 rounded-2xl border border-outline/15 bg-surface-container-low px-4 py-3'>
                    <Checkbox
                      checked={formState.includeMonitoring}
                      onChange={() => setFormState(prev => ({ ...prev, includeMonitoring: !prev.includeMonitoring }))}
                    >
                      Include monitoring dashboards
                    </Checkbox>
                    <Checkbox
                      checked={formState.includeReporting}
                      onChange={() => setFormState(prev => ({ ...prev, includeReporting: !prev.includeReporting }))}
                    >
                      Include automated reporting deck
                    </Checkbox>
                    <Checkbox
                      checked={formState.includeHumanReview}
                      onChange={() => setFormState(prev => ({ ...prev, includeHumanReview: !prev.includeHumanReview }))}
                    >
                      Require human QA sign-off
                    </Checkbox>
                  </div>
                </div>
                <TextArea
                  label='Notes'
                  rows={4}
                  value={formState.notes}
                  onChange={event => setFormState(prev => ({ ...prev, notes: event.target.value }))}
                  helperText='Optional contextual notes shared with campaign owners.'
                />
                <div className='flex flex-wrap items-center gap-2'>
                  <Button variant='filled' onClick={handleGeneratePlan} isLoading={isGenerating} disabled={isGenerating}>
                    Generate plan
                  </Button>
                  {generatedPlan ? (
                    <Badge variant='success'>Plan ready · {generatedPlan.steps.length} steps</Badge>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className='space-y-4'>
            <Card className='border-outline/15 bg-surface'>
              <CardHeader>
                <CardTitle className='md3-title-medium text-on-surface'>Plan details</CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                {isGenerating && (
                  <div className='rounded-2xl border border-outline/15 bg-surface-container-low p-4 text-on-surface-variant'>
                    Generating plan via DeepSeek orchestrator…
                  </div>
                )}

                {!generatedPlan && !isGenerating && (
                  <div className='rounded-2xl border border-outline/15 bg-surface-container-low p-4 text-on-surface-variant'>
                    Configure a template and generate a plan to preview the schedule, dependencies, and payloads.
                  </div>
                )}

                {generatedPlan && (
                  <div className='space-y-4'>
                    <div className='flex flex-wrap items-center gap-2'>
                      <Badge variant='primary'>{generatedPlan.status.toUpperCase()}</Badge>
                      <Badge variant='outline'>Plan ID: {generatedPlan.planId}</Badge>
                    </div>
                    <p className='md3-body-medium text-on-surface'>{generatedPlan.description}</p>
                    <div className='space-y-3'>
                      {generatedPlan.steps.map(step => (
                        <Card key={step.stepId} className='border-outline/20 bg-surface-container-low'>
                          <CardHeader className='flex flex-col gap-1'>
                            <CardTitle className='md3-title-small text-on-surface'>{step.name}</CardTitle>
                            <div className='flex flex-wrap gap-2'>
                              <Badge variant='secondary'>{step.action}</Badge>
                              <Badge variant='outline'>{step.estimatedDuration}</Badge>
                            </div>
                          </CardHeader>
                          <CardContent className='space-y-2'>
                            <p className='md3-body-small text-on-surface-variant'>{step.description}</p>
                            {step.dependencies.length > 0 ? (
                              <p className='md3-body-small text-on-surface-variant/80'>
                                Depends on: {step.dependencies.join(', ')}
                              </p>
                            ) : null}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {activeTab === 'wiki' && (
        <section className='space-y-4'>
          <Card className='border-outline/15 bg-surface'>
            <CardHeader>
              <CardTitle className='text-on-surface'>Knowledge topics</CardTitle>
            </CardHeader>
            <CardContent className='grid gap-3 md:grid-cols-2 xl:grid-cols-3'>
              {wikiTopics.map(topic => (
                <Card key={topic.id} className='border-outline/15 bg-surface-container-low'>
                  <CardHeader className='space-y-2'>
                    <CardTitle className='md3-title-medium text-on-surface'>{topic.title}</CardTitle>
                    <div className='flex flex-wrap gap-2'>
                      {topic.tags.map(tag => (
                        <Badge key={tag} variant='outline'>
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className='md3-body-small text-on-surface-variant'>{topic.summary}</p>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </section>
      )}

      {activeTab === 'components' && (
        <section className='space-y-4'>
          <Card className='border-outline/15 bg-surface'>
            <CardHeader>
              <CardTitle className='text-on-surface'>Component catalogue</CardTitle>
            </CardHeader>
            <CardContent className='grid gap-3 md:grid-cols-2 xl:grid-cols-3'>
              {componentEntries.map(entry => (
                <Card key={entry.schemaId} className='border-outline/15 bg-surface-container-low'>
                  <CardHeader className='space-y-2'>
                    <CardTitle className='md3-title-medium text-on-surface'>{entry.title}</CardTitle>
                    <div className='flex flex-wrap items-center gap-2'>
                      <Badge variant='outline'>{entry.schemaId}</Badge>
                      <Badge
                        variant={entry.status === 'ga' ? 'success' : entry.status === 'beta' ? 'secondary' : 'warning'}
                      >
                        {entry.status.toUpperCase()}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className='md3-body-small text-on-surface-variant'>{entry.description}</p>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </section>
      )}

      {activeTab === 'assistant' && (
        <section className='grid gap-6 lg:grid-cols-[minmax(0,0.7fr),minmax(0,1.3fr)]'>
          <Card className='border-outline/15 bg-surface'>
            <CardHeader>
              <CardTitle className='md3-title-medium text-on-surface'>Prompt assistant</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <TextArea
                label='Ask DeepSeek assistant'
                rows={5}
                value={assistantPrompt}
                onChange={event => setAssistantPrompt(event.target.value)}
                placeholder='E.g. “Draft rollout plan for schema enrichment across admin navigation categories.”'
              />
              <div className='flex gap-2'>
                <Button variant='filled' onClick={handleAssistantSubmit} disabled={!assistantPrompt.trim()}>
                  Send
                </Button>
                <Button
                  variant='text'
                  onClick={() => setAssistantLogs([assistantLogs[0]])}
                  disabled={assistantLogs.length <= 1}
                >
                  Clear history
                </Button>
              </div>
              <p className='md3-body-small text-on-surface-variant'>Assistant leverages existing workflow watchers and DeepSeek orchestration for responses.</p>
            </CardContent>
          </Card>

          <Card className='border-outline/15 bg-surface'>
            <CardHeader>
              <CardTitle className='md3-title-medium text-on-surface'>Conversation stream</CardTitle>
            </CardHeader>
            <CardContent className='space-y-3 max-h-[420px] overflow-y-auto pr-2'>
              {assistantLogs.map(log => (
                <div
                  key={log.id}
                  className={`rounded-2xl border px-4 py-3 ${
                    log.role === 'assistant'
                      ? 'border-primary/30 bg-primary/5 text-on-surface'
                      : log.role === 'user'
                      ? 'border-outline/20 bg-surface-container-low text-on-surface'
                      : 'border-outline/10 bg-surface-container-low text-on-surface-variant'
                  }`}
                >
                  <div className='flex items-center justify-between text-xs text-on-surface-variant/80'>
                    <span className='uppercase tracking-wide'>{log.role}</span>
                    <span>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className='mt-2 text-sm leading-relaxed'>{log.content}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
      )}
    </div>
  );
};

export default UnifiedDashboardDemoPage;
