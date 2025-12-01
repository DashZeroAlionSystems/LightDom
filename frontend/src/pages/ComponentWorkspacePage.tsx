/**
 * Component Workspace Page
 * Multi-pane layout for browsing completed components, opening multiple workspaces,
 * and configuring schema-linked function calls with preview/code/diff views.
 */

import {
  Badge,
  Button,
  Card,
  Checkbox,
  Input,
  Tooltip,
  WorkspaceLayout,
  WorkspaceRailSection,
  WorkspaceSection,
  WorkspaceTabs,
  WorkspaceToggleGroup,
} from '@/components/ui';
import { RadixComponentGallery } from '@/components/ui/radix/RadixComponentGallery';
import type { RadixComponentDescriptor } from '@/components/ui/radix/types';
import { RADIX_COMPONENTS } from '@/data/radix-components.generated';
import { cn } from '@/lib/utils';
import {
  Code2,
  Eye,
  GitPullRequest,
  Link as LinkIcon,
  Search,
  Sparkles,
  Wand2,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';

interface SchemaLink {
  id: string;
  label: string;
  description: string;
  required?: boolean;
  functionSignature: string;
}

interface ComponentArtifact {
  id: string;
  name: string;
  category: string;
  status: 'stable' | 'beta' | 'deprecated';
  version: string;
  description: string;
  owner: string;
  lastUpdated: string;
  previewType: 'metrics' | 'workflow' | 'list';
  code: string;
  diff: string;
  schemaLinks: SchemaLink[];
}

const COMPONENT_CATALOG: ComponentArtifact[] = [
  {
    id: 'seo-kpi-grid',
    name: 'SEO KPI Grid',
    category: 'Dashboards',
    status: 'stable',
    version: '2.1.4',
    description: 'Displays core SEO metrics with trend deltas and annotations.',
    owner: 'Growth Intelligence',
    lastUpdated: '2025-10-06',
    previewType: 'metrics',
    code: `export const SeoKpiGrid = () => (
  <KpiGrid columns={3}>
    <KpiCard label="Organic traffic" value="124k" delta="↑ 8.2%" tone="success" />
    <KpiCard label="Keyword coverage" value="312" delta="↑ 12" tone="primary" />
    <KpiCard label="Backlink health" value="92%" delta="↓ 3%" tone="warning" />
  </KpiGrid>
);`,
    diff: `diff --git a/src/components/dashboard/SeoKpiGrid.tsx b/src/components/dashboard/SeoKpiGrid.tsx
@@
- <KpiCard label="Keyword coverage" value="304" delta="↑ 8" tone="primary" />
+ <KpiCard label="Keyword coverage" value="312" delta="↑ 12" tone="primary" />
@@
- <KpiCard label="Backlink health" value="88%" delta="↓ 7%" tone="warning" />
+ <KpiCard label="Backlink health" value="92%" delta="↓ 3%" tone="warning" />`,
    schemaLinks: [
      {
        id: 'schema-traffic',
        label: 'TrafficTimeseries',
        description: 'Organic traffic timeseries aggregated by day.',
        required: true,
        functionSignature:
          'fetchTrafficTimeseries(siteId: string, range: DateRange): Promise<TrafficPoint[]>',
      },
      {
        id: 'schema-keywords',
        label: 'KeywordCoverageSnapshot',
        description: 'Keyword ranking snapshot with trend deltas.',
        functionSignature:
          'generateKeywordCoverage(siteId: string, segment?: string): Promise<KeywordCoverage[]>',
      },
    ],
  },
  {
    id: 'workflow-orchestrator',
    name: 'Workflow Orchestrator Panel',
    category: 'Automation',
    status: 'beta',
    version: '1.7.0',
    description: 'Controls queued SEO automation workflows with AI enrichment toggles.',
    owner: 'Automation Systems',
    lastUpdated: '2025-09-20',
    previewType: 'workflow',
    code: `export const WorkflowOrchestratorPanel = () => (
  <WorkflowPanel title="Queued workflows" description="Prioritize automations for the next crawl window">
    <WorkflowPanelSection>
      <WorkflowQueueList />
    </WorkflowPanelSection>
    <WorkflowPanelFooter>
      <Button variant="filled" leftIcon={<Sparkles />}>Enrich with AI</Button>
    </WorkflowPanelFooter>
  </WorkflowPanel>
);`,
    diff: `diff --git a/src/components/workflows/WorkflowOrchestratorPanel.tsx b/src/components/workflows/WorkflowOrchestratorPanel.tsx
@@
- <Button variant="filled" leftIcon={<Sparkles />}>Trigger enrichment</Button>
+ <Button variant="filled" leftIcon={<Sparkles />}>Enrich with AI</Button>`,
    schemaLinks: [
      {
        id: 'schema-queue',
        label: 'WorkflowQueue',
        description: 'Queue metadata for pending automations.',
        required: true,
        functionSignature: 'listWorkflowQueue(status?: WorkflowStatus): Promise<WorkflowJob[]>',
      },
      {
        id: 'schema-enrichment',
        label: 'PromptEnrichmentConfig',
        description: 'Schema definition for AI enrichment payloads.',
        functionSignature: 'createEnrichmentPayload(jobId: string): Promise<EnrichmentPayload>',
      },
    ],
  },
  {
    id: 'component-changelog',
    name: 'Component Changelog List',
    category: 'Documentation',
    status: 'stable',
    version: '3.0.2',
    description: 'Lists component version history with semantic diffs and release status.',
    owner: 'Design Systems',
    lastUpdated: '2025-09-11',
    previewType: 'list',
    code: `export const ComponentChangelog = ({ entries }: { entries: ReleaseEntry[] }) => (
  <Card>
    <ol className="space-y-4">
      {entries.map((entry) => (
        <li key={entry.version} className="rounded-xl border border-outline/20 p-4">
          <div className="flex items-center justify-between">
            <span className="md3-title-small">{entry.version}</span>
            <Badge tone={entry.type === 'major' ? 'warning' : 'primary'}>{entry.type}</Badge>
          </div>
          <p className="md3-body-small text-on-surface-variant mt-2">{entry.summary}</p>
        </li>
      ))}
    </ol>
  </Card>
);`,
    diff: `diff --git a/src/components/system/ComponentChangelog.tsx b/src/components/system/ComponentChangelog.tsx
@@
- <Badge tone={entry.type === 'major' ? 'warning' : 'primary'}>{entry.type}</Badge>
+ <Badge tone={entry.type === 'major' ? 'error' : 'primary'}>{entry.type}</Badge>`,
    schemaLinks: [
      {
        id: 'schema-release',
        label: 'ComponentRelease',
        description: 'Release metadata with semantic versioning.',
        required: true,
        functionSignature: 'fetchComponentReleases(componentId: string): Promise<ReleaseEntry[]>',
      },
    ],
  },
];

const statusVariantMap: Record<ComponentArtifact['status'], 'success' | 'warning' | 'outline'> = {
  stable: 'success',
  beta: 'warning',
  deprecated: 'outline',
};

const previewRenderers: Record<ComponentArtifact['previewType'], React.FC> = {
  metrics: () => (
    <div className='grid gap-4 md:grid-cols-3'>
      <Card variant='filled' className='space-y-2'>
        <p className='md3-label-medium text-on-surface-variant'>Organic traffic</p>
        <p className='md3-display-small text-primary'>124k</p>
        <p className='md3-body-small text-success'>↑ 8.2% wow</p>
      </Card>
      <Card variant='filled' className='space-y-2'>
        <p className='md3-label-medium text-on-surface-variant'>Keyword coverage</p>
        <p className='md3-display-small text-primary'>312</p>
        <p className='md3-body-small text-success'>↑ 12 tracked</p>
      </Card>
      <Card variant='filled' className='space-y-2'>
        <p className='md3-label-medium text-on-surface-variant'>Backlink health</p>
        <p className='md3-display-small text-warning'>92%</p>
        <p className='md3-body-small text-warning'>↓ 3% vs last sprint</p>
      </Card>
    </div>
  ),
  workflow: () => (
    <Card variant='filled' className='space-y-4'>
      <div className='flex items-center justify-between'>
        <div>
          <p className='md3-label-medium text-on-surface-variant uppercase tracking-wide'>Queue</p>
          <h3 className='md3-title-medium text-on-surface'>Automation workflows</h3>
        </div>
        <Badge variant='primary'>Active</Badge>
      </div>
      <div className='space-y-2'>
        {['Memo enrichment', 'Schema sync', 'Backlink audit'].map(item => (
          <div
            key={item}
            className='flex items-center justify-between rounded-2xl border border-outline/20 bg-surface-container-low px-4 py-3'
          >
            <div>
              <p className='md3-title-small text-on-surface'>{item}</p>
              <p className='md3-body-small text-on-surface-variant'>
                Awaiting crawler availability
              </p>
            </div>
            <Button size='sm' variant='text'>
              Prioritize
            </Button>
          </div>
        ))}
      </div>
      <div className='flex justify-end'>
        <Button leftIcon={<Sparkles />} variant='filled'>
          Enrich with AI
        </Button>
      </div>
    </Card>
  ),
  list: () => (
    <Card variant='filled' className='space-y-4'>
      {[
        { version: '3.0.2', summary: 'Added schema diff panel', type: 'major' },
        { version: '3.0.1', summary: 'Improved function call hints', type: 'minor' },
      ].map(entry => (
        <div
          key={entry.version}
          className='flex items-center justify-between rounded-2xl border border-outline/15 bg-surface px-4 py-3'
        >
          <div>
            <p className='md3-title-small text-on-surface'>v{entry.version}</p>
            <p className='md3-body-small text-on-surface-variant mt-1'>{entry.summary}</p>
          </div>
          <Badge variant={entry.type === 'major' ? 'error' : 'primary'}>{entry.type}</Badge>
        </div>
      ))}
    </Card>
  ),
};

const ComponentWorkspacePage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedComponentIds, setSelectedComponentIds] = useState<string[]>(['seo-kpi-grid']);
  const [openComponentIds, setOpenComponentIds] = useState<string[]>(['seo-kpi-grid']);
  const [activeComponentId, setActiveComponentId] = useState<string>('seo-kpi-grid');
  const [viewMode, setViewMode] = useState<'preview' | 'code' | 'diff'>('preview');
  const [functionCallingMap, setFunctionCallingMap] = useState<
    Record<string, Record<string, boolean>>
  >(() => ({
    'seo-kpi-grid': { 'schema-traffic': true },
  }));
  const [schemaEntryMap, setSchemaEntryMap] = useState<Record<string, Record<string, string>>>(
    () => ({
      'seo-kpi-grid': { 'schema-traffic': 'fetchTrafficTimeseries' },
    })
  );
  const [promptOverrides, setPromptOverrides] = useState<Record<string, string>>({});

  const handleRadixComponentSelect = (descriptor: RadixComponentDescriptor) => {
    setSearchTerm(descriptor.name);
  };

  const filteredComponents = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return COMPONENT_CATALOG;
    return COMPONENT_CATALOG.filter(component =>
      [component.name, component.category, component.description].some(field =>
        field.toLowerCase().includes(term)
      )
    );
  }, [searchTerm]);

  const activeComponent =
    COMPONENT_CATALOG.find(component => component.id === activeComponentId) ?? COMPONENT_CATALOG[0];
  const ActivePreview = activeComponent
    ? previewRenderers[activeComponent.previewType]
    : () => null;

  const toggleComponentSelection = (componentId: string) => {
    setSelectedComponentIds(prev => {
      const exists = prev.includes(componentId);
      if (exists) {
        return prev.filter(id => id !== componentId);
      }
      return [...prev, componentId];
    });

    setOpenComponentIds(prev => {
      if (prev.includes(componentId)) {
        return prev;
      }
      return [...prev, componentId];
    });
    setActiveComponentId(componentId);
  };

  const closeTab = (componentId: string) => {
    setOpenComponentIds(prev => prev.filter(id => id !== componentId));
    setSelectedComponentIds(prev => prev.filter(id => id !== componentId));

    if (activeComponentId === componentId) {
      const next = openComponentIds.find(id => id !== componentId);
      if (next) {
        setActiveComponentId(next);
      } else if (openComponentIds.length > 1) {
        setActiveComponentId(openComponentIds[0]);
      }
    }
  };

  const ensureFunctionState = (componentId: string, schemaId: string) => {
    setFunctionCallingMap(prev => ({
      ...prev,
      [componentId]: {
        ...(prev[componentId] || {}),
        [schemaId]: prev[componentId]?.[schemaId] ?? false,
      },
    }));
  };

  const toggleFunctionCalling = (componentId: string, schemaId: string) => {
    ensureFunctionState(componentId, schemaId);
    setFunctionCallingMap(prev => ({
      ...prev,
      [componentId]: {
        ...(prev[componentId] || {}),
        [schemaId]: !prev[componentId]?.[schemaId],
      },
    }));
  };

  const updateSchemaEntry = (componentId: string, schemaId: string, value: string) => {
    setSchemaEntryMap(prev => ({
      ...prev,
      [componentId]: {
        ...(prev[componentId] || {}),
        [schemaId]: value,
      },
    }));
  };

  const openTabs = useMemo(
    () =>
      openComponentIds
        .map(id => COMPONENT_CATALOG.find(component => component.id === id))
        .filter((component): component is ComponentArtifact => Boolean(component))
        .map(component => ({
          id: component.id,
          label: component.name,
          subtitle: component.category,
          version: component.version,
          active: component.id === activeComponentId,
        })),
    [openComponentIds, activeComponentId]
  );

  return (
    <WorkspaceLayout
      className='min-h-screen'
      sidebar={
        <>
          <WorkspaceRailSection
            title='Component filters'
            description='Search and narrow the component catalog'
          >
            <div className='relative'>
              <Input
                value={searchTerm}
                onChange={event => setSearchTerm(event.target.value)}
                placeholder='Search components...'
                leftIcon={<Search className='h-4 w-4' />}
              />
            </div>
            <div className='flex items-center justify-between rounded-2xl border border-outline/20 bg-surface px-4 py-3'>
              <span className='md3-body-medium text-on-surface-variant'>Catalog size</span>
              <Badge variant='primary'>{COMPONENT_CATALOG.length}</Badge>
            </div>
            <div className='space-y-2 text-on-surface-variant md3-body-small'>
              <p className='uppercase tracking-wide md3-label-medium text-on-surface-variant/80'>
                Guides
              </p>
              <ul className='space-y-1'>
                <li>• Double-click a component to open it</li>
                <li>• Tabs mirror IDE slot behaviour</li>
                <li>• Function calling toggles live per schema</li>
              </ul>
            </div>
          </WorkspaceRailSection>

          <WorkspaceRailSection
            title='Active session'
            description='Keep track of what’s open in the workspace'
          >
            <div className='space-y-2'>
              {openTabs.length === 0 && (
                <p className='text-on-surface-variant md3-body-small'>
                  Open components will appear here.
                </p>
              )}
              {openTabs.map(tab => (
                <div
                  key={tab.id}
                  className={cn(
                    'flex items-center justify-between rounded-2xl border px-4 py-3',
                    tab.active ? 'border-primary bg-primary/8' : 'border-outline/20'
                  )}
                >
                  <div>
                    <p className='md3-title-small text-on-surface'>{tab.label}</p>
                    <p className='md3-body-small text-on-surface-variant'>v{tab.version}</p>
                  </div>
                  <Button size='sm' variant='text' onClick={() => setActiveComponentId(tab.id)}>
                    Focus
                  </Button>
                </div>
              ))}
            </div>
          </WorkspaceRailSection>
        </>
      }
      inspector={
        <>
          <WorkspaceRailSection
            title='Completed components'
            description='Select components to configure schema bindings'
          >
            <div className='space-y-2'>
              {filteredComponents.map(component => (
                <div
                  key={component.id}
                  className={cn(
                    'flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 transition-all',
                    selectedComponentIds.includes(component.id)
                      ? 'border-primary bg-primary/8'
                      : 'border-outline/20 hover:border-outline/40'
                  )}
                  onDoubleClick={() => toggleComponentSelection(component.id)}
                >
                  <div className='flex flex-1 items-start gap-3'>
                    <Checkbox
                      checked={selectedComponentIds.includes(component.id)}
                      onChange={() => toggleComponentSelection(component.id)}
                    />
                    <div className='min-w-0'>
                      <p className='md3-title-small text-on-surface truncate'>{component.name}</p>
                      <p className='md3-body-small text-on-surface-variant truncate'>
                        {component.description}
                      </p>
                      <div className='mt-1 flex flex-wrap items-center gap-2'>
                        <Badge variant={statusVariantMap[component.status]}>
                          {component.status}
                        </Badge>
                        <Badge variant='outline'>v{component.version}</Badge>
                      </div>
                    </div>
                  </div>
                  <Tooltip content='Open in workspace'>
                    <Button
                      size='sm'
                      variant='text'
                      onClick={() => toggleComponentSelection(component.id)}
                    >
                      Open
                    </Button>
                  </Tooltip>
                </div>
              ))}
            </div>
          </WorkspaceRailSection>

          <WorkspaceRailSection
            title='Linked schemas'
            description='Enable function calling for selected components'
          >
            <div className='space-y-4'>
              {selectedComponentIds.length === 0 && (
                <p className='md3-body-small text-on-surface-variant'>
                  Select a component to configure schema bindings.
                </p>
              )}
              {selectedComponentIds.map(componentId => {
                const component = COMPONENT_CATALOG.find(entry => entry.id === componentId);
                if (!component) return null;
                return (
                  <div
                    key={component.id}
                    className='space-y-3 rounded-2xl border border-outline/20 bg-surface-container p-4'
                  >
                    <div className='flex items-center justify-between'>
                      <div>
                        <p className='md3-title-small text-on-surface'>{component.name}</p>
                        <p className='md3-body-small text-on-surface-variant'>
                          {component.schemaLinks.length} schema links
                        </p>
                      </div>
                      <Badge variant='primary'>v{component.version}</Badge>
                    </div>
                    <div className='space-y-3'>
                      {component.schemaLinks.map(schema => {
                        const enabled = Boolean(functionCallingMap[component.id]?.[schema.id]);
                        return (
                          <div
                            key={schema.id}
                            className='rounded-2xl border border-outline/15 bg-surface p-4'
                          >
                            <div className='flex items-start justify-between gap-3'>
                              <div>
                                <p className='md3-title-small text-on-surface flex items-center gap-2'>
                                  <LinkIcon className='h-4 w-4 text-primary' />
                                  {schema.label}
                                </p>
                                <p className='md3-body-small text-on-surface-variant mt-1'>
                                  {schema.description}
                                </p>
                                <p className='md3-body-small text-on-surface-variant/80 mt-1'>
                                  Signature:{' '}
                                  <code className='font-mono text-xs'>
                                    {schema.functionSignature}
                                  </code>
                                </p>
                              </div>
                              <Button
                                variant={enabled ? 'filled' : 'outlined'}
                                size='sm'
                                onClick={() => toggleFunctionCalling(component.id, schema.id)}
                              >
                                {enabled ? 'Function calling enabled' : 'Enable function call'}
                              </Button>
                            </div>
                            {enabled && (
                              <div className='mt-3 space-y-2'>
                                <label
                                  className='md3-label-medium text-on-surface'
                                  htmlFor={`${component.id}-${schema.id}-entry`}
                                >
                                  Entry point override
                                </label>
                                <Input
                                  id={`${component.id}-${schema.id}-entry`}
                                  value={
                                    schemaEntryMap[component.id]?.[schema.id] ??
                                    schema.functionSignature.split('(')[0]
                                  }
                                  onChange={event =>
                                    updateSchemaEntry(component.id, schema.id, event.target.value)
                                  }
                                />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </WorkspaceRailSection>
        </>
      }
      header={
        <div className='flex flex-col gap-4'>
          <div className='flex flex-wrap items-center justify-between gap-3'>
            <div>
              <p className='md3-label-medium text-primary uppercase tracking-wide'>
                Component workspace
              </p>
              <h1 className='md3-headline-medium text-on-surface'>
                Review and configure shipped components
              </h1>
            </div>
            <div className='flex items-center gap-2'>
              <Button variant='outlined' leftIcon={<GitPullRequest className='h-4 w-4' />}>
                Create review request
              </Button>
              <Button variant='filled' leftIcon={<Wand2 className='h-4 w-4' />}>
                Generate changelog
              </Button>
            </div>
          </div>
          <WorkspaceTabs
            tabs={openTabs}
            onSelect={tabId => setActiveComponentId(tabId)}
            onClose={closeTab}
          />
        </div>
      }
    >
      {activeComponent ? (
        <div className='flex h-full flex-col gap-6'>
          <WorkspaceSection
            title={activeComponent.name}
            meta={
              <span className='text-on-surface-variant'>
                Owned by {activeComponent.owner} • Updated {activeComponent.lastUpdated}
              </span>
            }
            actions={
              <WorkspaceToggleGroup
                value={viewMode}
                onChange={value => setViewMode(value as typeof viewMode)}
                options={[
                  { value: 'preview', label: 'Preview', badge: 'UI' },
                  { value: 'code', label: 'Code', badge: 'TSX' },
                  { value: 'diff', label: 'Diff', badge: 'git' },
                ]}
              />
            }
          >
            {viewMode === 'preview' && <ActivePreview />}
            {viewMode === 'code' && (
              <div className='relative'>
                <pre className='max-h-[420px] overflow-auto rounded-2xl bg-surface-container-high p-6 text-sm text-on-surface-variant'>
                  <code>{activeComponent.code}</code>
                </pre>
                <div className='absolute right-6 top-4 flex items-center gap-2 text-on-surface-variant/80'>
                  <Eye className='h-4 w-4' /> <span>Generated preview snippet</span>
                </div>
              </div>
            )}
            {viewMode === 'diff' && (
              <div className='relative'>
                <pre className='max-h-[420px] overflow-auto rounded-2xl bg-surface-container-high p-6 text-sm text-on-surface-variant'>
                  <code>{activeComponent.diff}</code>
                </pre>
                <div className='absolute right-6 top-4 flex items-center gap-2 text-on-surface-variant/80'>
                  <Code2 className='h-4 w-4' /> <span>Latest git diff</span>
                </div>
              </div>
            )}
          </WorkspaceSection>

          <WorkspaceSection
            title='Prompt & configuration overrides'
            meta={
              <span className='text-on-surface-variant'>
                Define AI prompt refinements for schema-driven generation
              </span>
            }
          >
            <div className='grid gap-4 lg:grid-cols-2'>
              {selectedComponentIds.map(componentId => {
                const component = COMPONENT_CATALOG.find(entry => entry.id === componentId);
                if (!component) return null;
                return (
                  <div
                    key={component.id}
                    className='space-y-3 rounded-2xl border border-outline/20 bg-surface-container p-4'
                  >
                    <div className='flex items-center justify-between'>
                      <p className='md3-title-small text-on-surface'>{component.name}</p>
                      <Badge tone='outline'>v{component.version}</Badge>
                    </div>
                    <label
                      className='md3-label-medium text-on-surface'
                      htmlFor={`${component.id}-prompt`}
                    >
                      Prompt override
                    </label>
                    <textarea
                      id={`${component.id}-prompt`}
                      className='h-32 w-full rounded-2xl border border-outline/20 bg-surface p-3 font-mono text-sm text-on-surface'
                      placeholder='Describe layout or behaviour adjustments'
                      value={promptOverrides[component.id] ?? ''}
                      onChange={event =>
                        setPromptOverrides(prev => ({
                          ...prev,
                          [component.id]: event.target.value,
                        }))
                      }
                    />
                    <div className='flex items-center justify-between text-on-surface-variant md3-body-small'>
                      <span>{component.schemaLinks.length} linked functions</span>
                      <Button size='sm' variant='text'>
                        Sync with wizard
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </WorkspaceSection>

          <WorkspaceSection
            title='Radix UI atomic registry'
            meta={
              <span className='text-on-surface-variant'>
                {RADIX_COMPONENTS.length} external atoms mined via the Radix UI styleguide campaign
              </span>
            }
          >
            <RadixComponentGallery
              components={RADIX_COMPONENTS}
              highlightTags={['navigation', 'overlay', 'input']}
              onComponentSelect={handleRadixComponentSelect}
            />
          </WorkspaceSection>
        </div>
      ) : (
        <div className='flex h-full items-center justify-center text-on-surface-variant'>
          Select a component to begin.
        </div>
      )}
    </WorkspaceLayout>
  );
};

export default ComponentWorkspacePage;
