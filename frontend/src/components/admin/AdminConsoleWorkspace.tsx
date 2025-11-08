/**
 * AdminConsoleWorkspace
 * Material Design 3 aligned administration cockpit for crawler orchestration and system health.
 * Replaces the legacy Ant Design dashboard with design-system primitives.
 */

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Badge,
  Button,
  Card,
  Checkbox,
  DeepSeekCategoryCrud,
  Input,
  KpiCard,
  KpiGrid,
  WorkspaceLayout,
  WorkspaceRailSection,
  WorkspaceSection,
  WorkspaceTabs,
  WorkspaceToggleGroup,
} from '@/components/ui';
import { cn } from '@/lib/utils';
import { Activity, AlertCircle, Brain, Cog, ShieldCheck, Sparkles, Zap } from 'lucide-react';
import React, { useMemo, useState } from 'react';

const ADMIN_MODULES = [
  {
    id: 'crawler',
    label: 'Crawler orchestration',
    description: 'Control automation campaigns and crawlers',
    icon: <Zap className='h-4 w-4' />,
  },
  {
    id: 'security',
    label: 'Security posture',
    description: 'Review access logs and incidents',
    icon: <ShieldCheck className='h-4 w-4' />,
  },
  {
    id: 'automation',
    label: 'Automation queues',
    description: 'Monitor running jobs and AI enrichment',
    icon: <Sparkles className='h-4 w-4' />,
  },
  {
    id: 'neural',
    label: 'Neural ops',
    description: 'Inspect neural job performance',
    icon: <Brain className='h-4 w-4' />,
  },
  {
    id: 'settings',
    label: 'System settings',
    description: 'Manage integrations and backups',
    icon: <Cog className='h-4 w-4' />,
  },
];

const WORKFLOW_PRESETS = [
  {
    id: 'seo-content',
    label: 'SEO content schema',
    description: 'Focus on keyword research and brief generation.',
  },
  {
    id: 'migration',
    label: 'Site migration',
    description: 'Audit redirects, errors, and sitemap coverage.',
  },
  {
    id: 'technical',
    label: 'Technical SEO sweep',
    description: 'Core Web Vitals, structured data, broken links.',
  },
];

const STATUS_CARDS = [
  {
    title: 'Prompt review',
    state: 'Issue detected',
    tone: 'error',
    detail: 'Prompt needs additional context for product SKUs.',
  },
  {
    title: 'Schema alignment',
    state: 'In progress',
    tone: 'warning',
    detail: 'Awaiting crawler sync for 2 templates.',
  },
  {
    title: 'Crawler queue',
    state: 'Nominal',
    tone: 'primary',
    detail: '4 of 6 crawlers within SLA. No throttling detected.',
  },
];

const OPTIMIZATION_HIGHLIGHTS = [
  {
    id: 'highlight-1',
    title: 'Authority pages trending +12%',
    meta: 'Authority Signals dashboard',
    description:
      'High-authority landing pages received +12% organic sessions WoW after optimized briefs were deployed.',
  },
  {
    id: 'highlight-2',
    title: 'Schema coverage expanded to 78%',
    meta: 'Schema health checks',
    description:
      'Structured data templates now cover most commercial intents. Remaining gaps flagged for prompt follow-up.',
  },
];

const KPI_METRICS = [
  {
    label: 'URLs crawled',
    sublabel: 'Last 24 hours',
    value: '286',
    delta: '+14%',
    tone: 'primary',
  },
  {
    label: 'Space reclaimed',
    sublabel: 'Storage reclaimed',
    value: '640 MB',
    delta: '+32%',
    tone: 'success',
  },
  {
    label: 'Tokens earned',
    sublabel: 'Operational throughput',
    value: '4.8 LDOM',
    delta: '+21%',
    tone: 'primary',
  },
  {
    label: 'Crawler uptime',
    sublabel: 'SLA tracking',
    value: '99.4%',
    delta: '-0.3%',
    tone: 'warning',
  },
];

const ATTRIBUTE_OPTIONS = [
  'Meta tags',
  'Keyword clusters',
  'Backlink graph',
  'Core Web Vitals',
  'Content blocks',
  'Schema.org types',
];
const CATEGORY_OPTIONS = ['Metadata', 'Content intelligence', 'Authority signals', 'Performance'];

const InspectorBadge: React.FC<{ tone?: 'primary' | 'warning' | 'error'; label: string }> = ({
  tone = 'primary',
  label,
}) => (
  <Badge variant={tone === 'primary' ? 'primary' : tone === 'warning' ? 'warning' : 'error'}>
    {label}
  </Badge>
);

const AdminConsoleWorkspace: React.FC = () => {
  const [selectedModule, setSelectedModule] = useState('crawler');
  const [viewMode, setViewMode] = useState<'overview' | 'details'>('overview');
  const [workflowPrompt, setWorkflowPrompt] = useState(
    'Cluster SaaS landing pages by conversion intent and content depth.'
  );
  const [datasetName, setDatasetName] = useState('SEO_Content_Classifier_2025-11-02');
  const [autoTrain, setAutoTrain] = useState(true);
  const [selectedAttributes, setSelectedAttributes] = useState<string[]>([
    'Meta tags',
    'Keyword clusters',
  ]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    'Metadata',
    'Content intelligence',
  ]);

  const openTabs = useMemo(
    () =>
      ADMIN_MODULES.slice(0, 4).map(module => ({
        id: module.id,
        label: module.label,
        subtitle: module.description,
        version: '1.0',
        active: module.id === selectedModule,
      })),
    [selectedModule]
  );

  const toggleAttribute = (value: string) => {
    setSelectedAttributes(prev =>
      prev.includes(value) ? prev.filter(item => item !== value) : [...prev, value]
    );
  };

  const toggleCategory = (value: string) => {
    setSelectedCategories(prev =>
      prev.includes(value) ? prev.filter(item => item !== value) : [...prev, value]
    );
  };

  return (
    <WorkspaceLayout
      sidebar={
        <>
          <WorkspaceRailSection
            title='Admin modules'
            description='Switch between operational surfaces'
          >
            <div className='space-y-2'>
              {ADMIN_MODULES.map(module => (
                <button
                  key={module.id}
                  type='button'
                  className={cn(
                    'w-full rounded-2xl border px-4 py-3 text-left transition-all',
                    module.id === selectedModule
                      ? 'border-primary bg-primary/10 text-on-surface'
                      : 'border-outline/20 bg-surface hover:border-outline/40'
                  )}
                  onClick={() => setSelectedModule(module.id)}
                >
                  <div className='flex items-center gap-3'>
                    <span className='inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary'>
                      {module.icon}
                    </span>
                    <div className='min-w-0'>
                      <p className='md3-title-small text-on-surface truncate'>{module.label}</p>
                      <p className='md3-body-small text-on-surface-variant truncate'>
                        {module.description}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </WorkspaceRailSection>

          <WorkspaceRailSection
            title='Workflow presets'
            description='Apply saved orchestration blueprints'
          >
            <div className='space-y-2'>
              {WORKFLOW_PRESETS.map(preset => (
                <Card
                  key={preset.id}
                  variant='filled'
                  padding='md'
                  className='border border-outline/15'
                >
                  <p className='md3-title-small text-on-surface'>{preset.label}</p>
                  <p className='md3-body-small text-on-surface-variant mt-1'>
                    {preset.description}
                  </p>
                  <div className='mt-3 flex justify-end'>
                    <Button variant='text' size='sm'>
                      Load preset
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </WorkspaceRailSection>
        </>
      }
      inspector={
        <>
          <WorkspaceRailSection
            title='Crawler health'
            description='Live view of automation infrastructure'
          >
            <div className='space-y-4'>
              <Card variant='filled' padding='md' className='border border-outline/15 space-y-3'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2 text-on-surface'>
                    <Activity className='h-4 w-4 text-primary' />
                    <span className='md3-body-medium'>4 / 6 crawlers healthy</span>
                  </div>
                  <InspectorBadge label='Operational' />
                </div>
                <p className='md3-body-small text-on-surface-variant'>
                  Two content crawlers are awaiting dataset sync. Estimated recovery: 12 minutes.
                </p>
                <div className='flex gap-2'>
                  <Button size='sm' variant='outlined'>
                    View logs
                  </Button>
                  <Button size='sm' variant='text'>
                    Restart node
                  </Button>
                </div>
              </Card>

              <Accordion type='single' collapsible className='space-y-2'>
                <AccordionItem
                  value='clusters'
                  className='rounded-2xl border border-outline/15 bg-surface'
                >
                  <AccordionTrigger className='px-4 py-3'>
                    <span className='md3-body-medium text-on-surface'>Cluster status</span>
                  </AccordionTrigger>
                  <AccordionContent className='space-y-2 px-4 pb-4'>
                    <div className='rounded-2xl border border-outline/10 bg-surface-container-low px-3 py-2'>
                      <p className='md3-body-small text-on-surface'>
                        Crawler-01 • Serving 146 URLs
                      </p>
                      <p className='md3-body-small text-on-surface-variant'>
                        Latency: 180ms • CPU: 62%
                      </p>
                    </div>
                    <div className='rounded-2xl border border-outline/10 bg-surface-container-low px-3 py-2'>
                      <p className='md3-body-small text-on-surface'>Crawler-02 • Awaiting sync</p>
                      <p className='md3-body-small text-on-surface-variant'>
                        Latency: — • CPU: 18%
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </WorkspaceRailSection>

          <WorkspaceRailSection
            title='Optimization highlights'
            description='Recent wins surfaced by analytics'
          >
            <div className='space-y-3'>
              {OPTIMIZATION_HIGHLIGHTS.map(highlight => (
                <Card
                  key={highlight.id}
                  variant='filled'
                  padding='md'
                  className='border border-outline/10 space-y-1.5'
                >
                  <p className='md3-title-small text-on-surface'>{highlight.title}</p>
                  <p className='md3-label-small uppercase text-primary/80'>{highlight.meta}</p>
                  <p className='md3-body-small text-on-surface-variant/90 mt-1'>
                    {highlight.description}
                  </p>
                </Card>
              ))}
            </div>
          </WorkspaceRailSection>

          <WorkspaceRailSection title='Automation backlog' description='Queued enhancement tasks'>
            <div className='space-y-2'>
              <Card variant='filled' padding='md' className='border border-outline/15 space-y-1.5'>
                <div className='flex items-center justify-between'>
                  <span className='md3-body-medium text-on-surface'>Schema diff audit</span>
                  <InspectorBadge tone='warning' label='Due' />
                </div>
                <p className='md3-body-small text-on-surface-variant'>
                  Compare schema drift across e-commerce templates.
                </p>
              </Card>
              <Card variant='filled' padding='md' className='border border-outline/15 space-y-1.5'>
                <div className='flex items-center justify-between'>
                  <span className='md3-body-medium text-on-surface'>
                    Backfill historical dashboards
                  </span>
                  <InspectorBadge tone='primary' label='Scheduled' />
                </div>
                <p className='md3-body-small text-on-surface-variant'>
                  Sync the last 90 days of Core Web Vitals into analytics.
                </p>
              </Card>
            </div>
          </WorkspaceRailSection>
        </>
      }
      header={
        <div className='flex flex-col gap-4'>
          <div className='flex flex-wrap items-center justify-between gap-3'>
            <div>
              <p className='md3-label-medium text-primary uppercase tracking-wide'>
                Admin dashboard
              </p>
              <h1 className='md3-headline-medium text-on-surface'>
                Crawler workflow orchestration
              </h1>
            </div>
            <div className='flex flex-wrap items-center gap-2'>
              <Button variant='outlined'>Download summary</Button>
              <Button variant='filled' leftIcon={<Sparkles className='h-4 w-4' />}>
                Launch enrichment
              </Button>
            </div>
          </div>
          <WorkspaceTabs
            tabs={openTabs}
            onSelect={tabId => setSelectedModule(tabId)}
            onClose={undefined}
          />
          <div className='flex items-center justify-between gap-3'>
            <WorkspaceToggleGroup
              value={viewMode}
              onChange={value => setViewMode(value as typeof viewMode)}
              options={[
                { value: 'overview', label: 'Overview', badge: 'primary' },
                { value: 'details', label: 'Details', badge: 'beta' },
              ]}
            />
            <div className='flex items-center gap-2 text-on-surface-variant md3-body-small'>
              <AlertCircle className='h-4 w-4 text-warning' />
              <span>Unable to ping crawler node eu-west-2 — retrying in 30s</span>
            </div>
          </div>
        </div>
      }
    >
      <WorkspaceSection title='Automation metrics' meta='Live metrics refreshed every 60 seconds'>
        <KpiGrid columns={4}>
          {KPI_METRICS.map(metric => (
            <KpiCard
              key={metric.label}
              label={metric.label}
              description={metric.sublabel}
              value={metric.value}
              tone={metric.tone as any}
              delta={metric.delta}
            />
          ))}
        </KpiGrid>
      </WorkspaceSection>

      <WorkspaceSection
        title='Prompt & schema configuration'
        meta='Define how AI-assisted crawlers run and map data to schemas'
        actions={<Button variant='outlined'>Copy config JSON</Button>}
      >
        <div className='grid gap-4 lg:grid-cols-[minmax(0,2fr),minmax(0,1.2fr)]'>
          <Card variant='filled' padding='lg' className='space-y-6'>
            <Input
              label='Workflow prompt'
              value={workflowPrompt}
              onChange={event => setWorkflowPrompt(event.target.value)}
              placeholder='Describe the desired workflow outcome'
            />

            <div className='grid gap-4 md:grid-cols-2'>
              <div className='space-y-2'>
                <p className='md3-label-medium text-on-surface'>Attributes to capture</p>
                <div className='grid gap-2 sm:grid-cols-2'>
                  {ATTRIBUTE_OPTIONS.map(option => (
                    <label
                      key={option}
                      className='flex items-center gap-2 rounded-2xl border border-outline/20 bg-surface px-3 py-2'
                    >
                      <Checkbox
                        checked={selectedAttributes.includes(option)}
                        onChange={() => toggleAttribute(option)}
                      />
                      <span className='md3-body-small text-on-surface'>{option}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className='space-y-2'>
                <p className='md3-label-medium text-on-surface'>Topic categories</p>
                <div className='grid gap-2 sm:grid-cols-2'>
                  {CATEGORY_OPTIONS.map(option => (
                    <label
                      key={option}
                      className='flex items-center gap-2 rounded-2xl border border-outline/20 bg-surface px-3 py-2'
                    >
                      <Checkbox
                        checked={selectedCategories.includes(option)}
                        onChange={() => toggleCategory(option)}
                      />
                      <span className='md3-body-small text-on-surface'>{option}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className='grid gap-6 lg:grid-cols-[minmax(0,1.1fr),minmax(0,0.9fr)]'>
              <Card
                variant='filled'
                padding='md'
                className='space-y-4 border border-outline/15 bg-surface'
              >
                <div className='space-y-2'>
                  <p className='md3-label-medium text-on-surface'>Dataset name</p>
                  <Input
                    value={datasetName}
                    onChange={event => setDatasetName(event.target.value)}
                  />
                </div>
                <div className='space-y-2'>
                  <p className='md3-label-medium text-on-surface'>Crawler instances</p>
                  <div className='flex items-center gap-3'>
                    <Button size='sm' variant='text'>
                      -
                    </Button>
                    <span className='md3-title-medium text-on-surface'>4</span>
                    <Button size='sm' variant='text'>
                      +
                    </Button>
                    <label className='flex items-center gap-2 text-on-surface-variant md3-body-small'>
                      <Checkbox
                        checked={autoTrain}
                        onChange={() => setAutoTrain(value => !value)}
                      />
                      Auto-train
                    </label>
                  </div>
                </div>
                <div className='space-y-2'>
                  <p className='md3-label-medium text-on-surface'>Generated seed configuration</p>
                  <textarea
                    className='min-h-[140px] w-full rounded-2xl border border-outline/20 bg-surface-container-low p-3 font-mono text-xs text-on-surface'
                    defaultValue={JSON.stringify(
                      {
                        schema: 'SEO Content Schema',
                        attributes: selectedAttributes,
                        categories: selectedCategories,
                        autoTrain,
                        datasetName,
                      },
                      null,
                      2
                    )}
                  />
                </div>
                <div className='flex justify-end gap-2'>
                  <Button variant='text'>Reset</Button>
                  <Button variant='filled'>Launch workflow</Button>
                </div>
              </Card>

              <Card
                variant='filled'
                padding='md'
                className='space-y-3 border border-outline/15 bg-surface'
              >
                <p className='md3-label-medium text-on-surface'>Guided actions</p>
                <div className='space-y-2'>
                  <button className='w-full rounded-2xl border border-outline/20 bg-surface-container-low px-4 py-3 text-left'>
                    <p className='md3-body-medium text-on-surface'>Run schema validation</p>
                    <p className='md3-body-small text-on-surface-variant'>
                      Ensures generated briefs align with structured data requirements.
                    </p>
                  </button>
                  <button className='w-full rounded-2xl border border-outline/20 bg-surface-container-low px-4 py-3 text-left'>
                    <p className='md3-body-medium text-on-surface'>Send to QA queue</p>
                    <p className='md3-body-small text-on-surface-variant'>
                      Trigger manual review for high-impact landing pages.
                    </p>
                  </button>
                </div>
              </Card>
            </div>
          </Card>

          <Card variant='filled' padding='lg' className='space-y-4'>
            <div className='space-y-2'>
              <p className='md3-label-medium text-on-surface'>Schema attribute definitions</p>
              <div className='grid gap-2'>
                {ATTRIBUTE_OPTIONS.slice(0, 4).map(option => (
                  <div
                    key={option}
                    className='rounded-2xl border border-outline/20 bg-surface px-3 py-2'
                  >
                    <p className='md3-body-medium text-on-surface'>{option}</p>
                    <p className='md3-body-small text-on-surface-variant'>
                      Auto-generated mapping to schema.org vocabulary.
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </WorkspaceSection>

      <WorkspaceSection title='Workflow status' meta='Current run health across pipeline stages'>
        <div className='grid gap-4 md:grid-cols-3'>
          {STATUS_CARDS.map(status => (
            <Card
              key={status.title}
              variant='filled'
              padding='md'
              className='border border-outline/15 space-y-3'
            >
              <div className='flex items-center justify-between'>
                <p className='md3-title-small text-on-surface'>{status.title}</p>
                <InspectorBadge label={status.state} tone={status.tone as any} />
              </div>
              <p className='md3-body-small text-on-surface-variant'>{status.detail}</p>
              <div className='flex gap-2'>
                <Button size='sm' variant='text'>
                  View detail
                </Button>
                <Button size='sm' variant='outlined'>
                  Create task
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </WorkspaceSection>

      <WorkspaceSection
        title='DeepSeek categories'
        meta='Manage category -> service -> workflow mappings'
      >
        <div className='space-y-4'>
          <DeepSeekCategoryCrud />
        </div>
      </WorkspaceSection>
    </WorkspaceLayout>
  );
};

export default AdminConsoleWorkspace;
