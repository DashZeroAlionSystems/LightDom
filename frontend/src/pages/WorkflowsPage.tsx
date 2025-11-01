import React, { useEffect, useMemo, useState } from 'react';
import {
  WorkflowPanel,
  WorkflowPanelSection,
  WorkflowPanelFooter,
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
  Badge,
  Button,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  AsyncStateLoading,
  AsyncStateEmpty,
} from '@/components/ui';
import {
  CheckCircle2,
  Clock3,
  PauseCircle,
  AlertTriangle,
  Edit3,
  Wand2,
  Target,
  Drill,
  Settings,
  Rocket,
  RefreshCcw,
  Workflow as WorkflowIcon,
  Users,
  Link2,
  ClipboardList,
  ChevronRight,
} from 'lucide-react';

type WorkflowStatus = 'pending' | 'in_progress' | 'completed' | 'paused' | 'error' | 'draft';

type WorkflowTask = {
  id: string;
  label: string;
  description?: string;
  status: WorkflowStatus;
  lastRunAt?: string;
};

type WorkflowAttribute = {
  id: string;
  label: string;
  type?: string;
  enrichmentPrompt?: string;
  drilldownPrompts: string[];
  status?: WorkflowStatus;
};

type WorkflowSummary = {
  id: string;
  campaignName: string;
  ownerName: string;
  ownerEmail: string;
  scriptInjected: boolean;
  status: WorkflowStatus;
  createdAt: string;
  updatedAt: string;
  n8nWorkflowId?: string;
  tensorflowInstanceId?: string;
  seoScore?: number | null;
  tasks: WorkflowTask[];
  attributes: WorkflowAttribute[];
  automationThreshold?: number | null;
  pendingAutomation?: boolean;
};

const statusTone: Record<WorkflowStatus, { badge: 'primary' | 'success' | 'warning' | 'error' | 'secondary'; label: string; icon: React.ReactNode }> = {
  pending: { badge: 'secondary', label: 'Pending', icon: <Clock3 className="h-4 w-4" /> },
  in_progress: { badge: 'primary', label: 'In progress', icon: <RefreshCcw className="h-4 w-4 animate-spin" /> },
  completed: { badge: 'success', label: 'Completed', icon: <CheckCircle2 className="h-4 w-4" /> },
  paused: { badge: 'warning', label: 'Paused', icon: <PauseCircle className="h-4 w-4" /> },
  error: { badge: 'error', label: 'Needs attention', icon: <AlertTriangle className="h-4 w-4" /> },
  draft: { badge: 'secondary', label: 'Draft', icon: <ClipboardList className="h-4 w-4" /> },
};

const formatDate = (value?: string, options?: { includeTime?: boolean }) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  const formatter = new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    ...(options?.includeTime ? { timeStyle: 'short' } : {}),
  });
  return formatter.format(date);
};

const normalizeStatus = (value?: string | null): WorkflowStatus => {
  const normalized = (value ?? '').toString().toLowerCase();
  switch (normalized) {
    case 'in_progress':
    case 'in-progress':
    case 'running':
    case 'active':
      return 'in_progress';
    case 'completed':
    case 'complete':
    case 'success':
    case 'ready':
      return 'completed';
    case 'paused':
    case 'pause':
      return 'paused';
    case 'error':
    case 'failed':
    case 'errored':
      return 'error';
    case 'draft':
      return 'draft';
    case 'pending':
    default:
      return 'pending';
  }
};

const toStringOrFallback = (value: unknown, fallback: string) =>
  typeof value === 'string' && value.trim() ? value : fallback;

const toNumberOrNull = (value: unknown): number | null => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

const ensureStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => (typeof item === 'string' ? item : item != null ? String(item) : null))
    .filter((item): item is string => Boolean(item));
};

const mapWorkflowSummary = (input: any, index: number): WorkflowSummary => {
  const tasksRaw = Array.isArray(input?.tasks)
    ? input.tasks
    : Array.isArray(input?.activeTasks)
      ? input.activeTasks
      : [];
  const attributesRaw = Array.isArray(input?.attributes) ? input.attributes : [];

  const tasks: WorkflowTask[] = tasksRaw.map((task: any, taskIndex: number) => ({
    id: toStringOrFallback(task?.id ?? task?.taskId, `task-${taskIndex}`),
    label: toStringOrFallback(task?.label ?? task?.name, `Task ${taskIndex + 1}`),
    description:
      typeof task?.description === 'string' && task.description.trim()
        ? task.description
        : undefined,
    status: normalizeStatus(task?.status),
    lastRunAt: task?.lastRunAt ?? task?.last_run_at ?? undefined,
  }));

  const attributes: WorkflowAttribute[] = attributesRaw.map((attribute: any, attrIndex: number) => ({
    id: toStringOrFallback(attribute?.id ?? attribute?.key, `attribute-${attrIndex}`),
    label: toStringOrFallback(attribute?.label ?? attribute?.name, `Attribute ${attrIndex + 1}`),
    type: typeof attribute?.type === 'string' ? attribute.type : attribute?.category ?? undefined,
    enrichmentPrompt:
      typeof attribute?.enrichmentPrompt === 'string'
        ? attribute.enrichmentPrompt
        : typeof attribute?.prompt === 'string'
          ? attribute.prompt
          : undefined,
    drilldownPrompts: ensureStringArray(attribute?.drilldownPrompts),
    status: attribute?.status ? normalizeStatus(attribute.status) : undefined,
  }));

  const createdAt = toStringOrFallback(input?.createdAt ?? input?.created_at, new Date().toISOString());
  const updatedAt = toStringOrFallback(input?.updatedAt ?? input?.updated_at, createdAt);

  return {
    id: toStringOrFallback(input?.id ?? input?.workflowId, `workflow-${index}`),
    campaignName: toStringOrFallback(
      input?.campaignName ?? input?.datasetName ?? input?.name,
      `Workflow ${index + 1}`,
    ),
    ownerName: toStringOrFallback(input?.ownerName, 'Unknown owner'),
    ownerEmail: toStringOrFallback(input?.ownerEmail, 'unknown@example.com'),
    scriptInjected: Boolean(input?.scriptInjected),
    status: normalizeStatus(input?.status),
    createdAt,
    updatedAt,
    n8nWorkflowId:
      typeof input?.n8nWorkflowId === 'string'
        ? input.n8nWorkflowId
        : input?.n8n_workflow_id ?? undefined,
    tensorflowInstanceId:
      typeof input?.tensorflowInstanceId === 'string'
        ? input.tensorflowInstanceId
        : input?.tf_model_id ?? undefined,
    seoScore: toNumberOrNull(input?.seoScore),
    tasks,
    attributes,
    automationThreshold: toNumberOrNull(input?.automationThreshold),
    pendingAutomation: Boolean(input?.pendingAutomation),
  };
};

export const WorkflowsPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [workflows, setWorkflows] = useState<WorkflowSummary[]>([]);
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('tasks');
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchWorkflows = async () => {
      try {
        const response = await fetch('/api/workflow-admin/workflows/summary');
        if (!response.ok) {
          throw new Error(`Failed to load workflows (${response.status})`);
        }
        const data = await response.json();
        if (isMounted) {
          const mapped = Array.isArray(data?.workflows)
            ? (data.workflows as any[]).map(mapWorkflowSummary)
            : [];
          setWorkflows(mapped);
          setSelectedWorkflowId(mapped[0]?.id ?? null);
          setLoadError(null);
        }
      } catch (error) {
        if (isMounted) {
          setWorkflows([]);
          setSelectedWorkflowId(null);
          setLoadError(error instanceof Error ? error.message : 'Failed to load workflows');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchWorkflows();

    return () => {
      isMounted = false;
    };
  }, []);

  const selectedWorkflow = useMemo(
    () => workflows.find((workflow) => workflow.id === selectedWorkflowId) ?? workflows[0] ?? null,
    [workflows, selectedWorkflowId],
  );

  if (isLoading) {
    return (
      <div className="p-6">
        <AsyncStateLoading className="min-h-[40vh]">Fetching campaign workflows…</AsyncStateLoading>
      </div>
    );
  }

  if (!workflows.length) {
    return (
      <div className="p-6">
        <AsyncStateEmpty
          title="No workflows yet"
          description={
            loadError
              ? `Unable to load workflow summaries. ${loadError}`
              : 'Use the wizard to generate a workflow schema from a prompt.'
          }
          icon={<WorkflowIcon className="h-10 w-10" />}
          compact
        />
      </div>
    );
  }

  return (
    <div className="relative space-y-6 p-6 pb-32">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="md3-headline-large text-on-surface flex items-center gap-2">
            <WorkflowIcon className="h-8 w-8 text-primary" />
            Workflows
          </h1>
          <p className="md3-body-medium text-on-surface-variant">
            Launch prompt-driven SEO automation workflows, monitor progress, and tune campaign tasks in one place.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button className="rounded-full" variant="outlined">
            <ClipboardList className="h-4 w-4" />
            <span className="ml-2">Workflow templates</span>
          </Button>
          <Button className="rounded-full" variant="filled">
            <Wand2 className="h-4 w-4" />
            <span className="ml-2">New workflow from prompt</span>
          </Button>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,420px),1fr]">
        <WorkflowPanel
          title="Campaign workflows"
          description="Each workflow links crawler automation, TensorFlow training, and live SEO enrichment."
          actions={
            <Badge variant={selectedWorkflow?.scriptInjected ? 'success' : 'warning'} size="md">
              <Link2 className="mr-2 h-3.5 w-3.5" />
              {selectedWorkflow?.scriptInjected ? 'Script installed' : 'Script pending'}
            </Badge>
          }
        >
          <WorkflowPanelSection className="border-none pt-0">
            <div className="space-y-4">
              {workflows.map((workflow) => {
                const workflowStatus = statusTone[workflow.status];
                return (
                  <button
                    type="button"
                    key={workflow.id}
                    onClick={() => {
                      setSelectedWorkflowId(workflow.id);
                      setActiveTab('tasks');
                    }}
                    className={`w-full rounded-3xl border p-5 text-left transition-all hover:border-primary hover:shadow-level-2 ${
                      workflow.id === selectedWorkflow?.id
                        ? 'border-primary shadow-level-2 bg-surface-container-high'
                        : 'border-outline bg-surface'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={selectedWorkflow?.id === workflow.id ? 'primary' : 'secondary'}
                            size="sm"
                          >
                            <Users className="mr-1 h-3 w-3" />
                            {workflow.ownerName}
                          </Badge>
                          <Badge variant="outline" size="sm">
                            {workflow.ownerEmail}
                          </Badge>
                        </div>
                        <h3 className="md3-title-medium text-on-surface flex items-center gap-2">
                          {workflow.campaignName}
                          <ChevronRight className="h-4 w-4 text-on-surface-variant" />
                        </h3>
                        <div className="md3-body-small text-on-surface-variant flex flex-wrap gap-2">
                          <span>Updated {formatDate(workflow.updatedAt, { includeTime: true })}</span>
                          {workflow.seoScore !== undefined && (
                            <span>SEO score · {workflow.seoScore}</span>
                          )}
                          {workflow.tensorflowInstanceId && (
                            <span>TF instance · {workflow.tensorflowInstanceId}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge variant={workflowStatus.badge} size="sm" icon={workflowStatus.icon}>
                          {workflowStatus.label}
                        </Badge>
                        <Button variant="text" className="rounded-full p-2" aria-label="Edit workflow tasks">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      <div className="flex items-center gap-3 rounded-2xl border border-outline-variant/60 bg-surface-container-high px-4 py-3">
                        <div className="flex-1">
                          <p className="md3-label-medium text-on-surface">n8n workflow</p>
                          <p className="md3-body-small text-on-surface-variant">
                            {workflow.n8nWorkflowId ? `Workflow #${workflow.n8nWorkflowId}` : 'Not synced yet'}
                          </p>
                        </div>
                        <Button variant="outlined" className="rounded-full px-3 py-1">
                          Open
                        </Button>
                      </div>
                      <div className="flex items-center gap-3 rounded-2xl border border-outline-variant/60 bg-surface-container-high px-4 py-3">
                        <div className="flex-1">
                          <p className="md3-label-medium text-on-surface">Script status</p>
                          <p className="md3-body-small text-on-surface-variant">
                            {workflow.scriptInjected
                              ? 'Header script verified'
                              : 'Awaiting installation confirmation'}
                          </p>
                        </div>
                        <Button variant="text" className="rounded-full px-3 py-1">
                          Check
                        </Button>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-outline-variant/60 pt-4">
                      {workflow.tasks.slice(0, 4).map((task) => {
                        const tone = statusTone[task.status];
                        return (
                          <Badge key={task.id} variant={tone.badge} size="sm" icon={tone.icon}>
                            {task.label}
                          </Badge>
                        );
                      })}
                      {workflow.tasks.length > 4 && (
                        <Badge variant="outline" size="sm">
                          +{workflow.tasks.length - 4} more
                        </Badge>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </WorkflowPanelSection>
        </WorkflowPanel>

        {selectedWorkflow && (
          <WorkflowPanel
            title="Workflow wizard"
            description="Edit generated tasks, enrichment attributes, and automation rules before launch."
            meta={
              <span className="flex items-center gap-2 text-on-surface-variant">
                <Target className="h-4 w-4 text-primary" />
                {selectedWorkflow.campaignName}
              </span>
            }
          >
            <WorkflowPanelSection>
              <Tabs className="space-y-4" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-3 rounded-full bg-surface-container-high p-1">
                  <TabsTrigger
                    value="tasks"
                    className={`rounded-full px-3 py-2 text-sm font-medium transition ${
                      activeTab === 'tasks'
                        ? 'bg-primary text-on-primary'
                        : 'text-on-surface-variant hover:bg-surface-container-highest'
                    }`}
                  >
                    Tasks
                  </TabsTrigger>
                  <TabsTrigger
                    value="attributes"
                    className={`rounded-full px-3 py-2 text-sm font-medium transition ${
                      activeTab === 'attributes'
                        ? 'bg-primary text-on-primary'
                        : 'text-on-surface-variant hover:bg-surface-container-highest'
                    }`}
                  >
                    Attributes
                  </TabsTrigger>
                  <TabsTrigger
                    value="automation"
                    className={`rounded-full px-3 py-2 text-sm font-medium transition ${
                      activeTab === 'automation'
                        ? 'bg-primary text-on-primary'
                        : 'text-on-surface-variant hover:bg-surface-container-highest'
                    }`}
                  >
                    Automation
                  </TabsTrigger>
                </TabsList>

                <TabsContent
                  value="tasks"
                  className={`space-y-4 ${activeTab !== 'tasks' ? 'hidden' : ''}`}
                >
                  {selectedWorkflow.tasks.map((task) => {
                    const tone = statusTone[task.status];
                    return (
                      <div
                        key={task.id}
                        className="rounded-3xl border border-outline-variant/60 bg-surface-container-high px-5 py-4"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <Badge variant={tone.badge} size="sm" icon={tone.icon}>
                                {tone.label}
                              </Badge>
                              {task.lastRunAt && (
                                <span className="md3-body-small text-on-surface-variant">
                                  Last run {formatDate(task.lastRunAt, { includeTime: true })}
                                </span>
                              )}
                            </div>
                            <h3 className="md3-title-medium text-on-surface mt-1">{task.label}</h3>
                            {task.description && (
                              <p className="md3-body-small text-on-surface-variant">{task.description}</p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outlined" className="rounded-full" size="sm">
                              <Edit3 className="mr-2 h-4 w-4" />
                              Edit task
                            </Button>
                            <Button variant="text" className="rounded-full" size="sm">
                              <Rocket className="mr-2 h-4 w-4" />
                              Run step
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </TabsContent>

                <TabsContent
                  value="attributes"
                  className={`space-y-4 ${activeTab !== 'attributes' ? 'hidden' : ''}`}
                >
                  {selectedWorkflow.attributes.map((attribute) => {
                    const tone = statusTone[attribute.status ?? 'pending'];
                    return (
                      <div
                        key={attribute.id}
                        className="rounded-3xl border border-outline-variant/50 bg-surface px-4 py-4"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              {attribute.type && (
                                <Badge variant="outline" size="sm">
                                  {attribute.type}
                                </Badge>
                              )}
                              <Badge variant={tone.badge} size="sm" icon={tone.icon}>
                                {tone.label}
                              </Badge>
                            </div>
                            <h3 className="md3-title-medium text-on-surface">{attribute.label}</h3>
                            {attribute.enrichmentPrompt && (
                              <p className="md3-body-small text-on-surface-variant">
                                {attribute.enrichmentPrompt}
                              </p>
                            )}
                            <div className="flex flex-wrap gap-2">
                              {attribute.drilldownPrompts.map((prompt) => (
                                <Badge key={prompt} variant="secondary" size="sm">
                                  {prompt}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            <Button variant="outlined" className="rounded-full" size="sm">
                              <Edit3 className="mr-2 h-4 w-4" />
                              Edit attribute
                            </Button>
                            <Button variant="text" className="rounded-full" size="sm">
                              <Wand2 className="mr-2 h-4 w-4" />
                              Enrichment prompt
                            </Button>
                            <Button variant="text" className="rounded-full" size="sm">
                              <Drill className="mr-2 h-4 w-4" />
                              Drilldown prompts
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </TabsContent>

                <TabsContent
                  value="automation"
                  className={`space-y-4 ${activeTab !== 'automation' ? 'hidden' : ''}`}
                >
                  <div className="rounded-3xl border border-outline-variant/60 bg-surface-container-high px-5 py-4">
                    <h3 className="md3-title-medium text-on-surface flex items-center gap-2">
                      <Rocket className="h-4 w-4 text-primary" />
                      Automation thresholds
                    </h3>
                    <p className="md3-body-small text-on-surface-variant mt-1">
                      Trigger automated SEO strategy updates once the crawler mines a minimum amount of data and
                      TensorFlow completes training.
                    </p>
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <Badge variant="primary" size="sm">
                        Minimum mined pages · {selectedWorkflow.automationThreshold ?? 120}
                      </Badge>
                      <Badge
                        variant={selectedWorkflow.pendingAutomation ? 'warning' : 'success'}
                        size="sm"
                        icon={selectedWorkflow.pendingAutomation ? <PauseCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                      >
                        {selectedWorkflow.pendingAutomation ? 'Automation awaiting data' : 'Automation ready'}
                      </Badge>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-outline-variant/60 bg-surface px-5 py-4">
                    <h3 className="md3-title-medium text-on-surface flex items-center gap-2">
                      <Link2 className="h-4 w-4 text-primary" />
                      Header script health check
                    </h3>
                    <p className="md3-body-small text-on-surface-variant mt-1">
                      Automatically verify your client has installed the LightDom injection script. This enables live
                      data capture and backlink orchestration.
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Badge variant={selectedWorkflow.scriptInjected ? 'success' : 'warning'} size="sm">
                        {selectedWorkflow.scriptInjected ? 'Script detected' : 'Script missing'}
                      </Badge>
                      <Button variant="outlined" className="rounded-full" size="sm">
                        Re-run check
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </WorkflowPanelSection>

            <WorkflowPanelFooter>
              <div className="flex flex-col gap-2 text-on-surface-variant">
                <span className="md3-label-medium">Created {formatDate(selectedWorkflow.createdAt)}</span>
                <span className="md3-body-small">
                  Wizard tracks live step status and surfaces paused or incomplete actions for the campaign team.
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="text" className="rounded-full">
                  Preview workflow run
                </Button>
                <Button variant="filled" className="rounded-full">
                  Launch workflow
                </Button>
              </div>
            </WorkflowPanelFooter>
          </WorkflowPanel>
        )}
      </div>

      {selectedWorkflow && (
        <div className="fixed inset-x-6 bottom-6">
          <Accordion
            type="single"
            defaultValue="quick-edit"
            className="rounded-3xl border border-outline bg-surface-container-high shadow-level-3"
          >
            <AccordionItem value="quick-edit" data-accordion-item data-value="quick-edit">
              <AccordionTrigger className="px-6">
                <div className="flex flex-1 items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Settings className="h-5 w-5 text-primary" />
                    <div className="text-left">
                      <p className="md3-title-medium text-on-surface">Quick edit panel</p>
                      <p className="md3-body-small text-on-surface-variant">
                        Review base data and current task states without leaving the list.
                      </p>
                    </div>
                  </div>
                  <Badge variant={statusTone[selectedWorkflow.status].badge} size="sm">
                    {statusTone[selectedWorkflow.status].label}
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6">
                <div className="grid gap-6 md:grid-cols-3">
                  <div className="rounded-2xl border border-outline-variant/60 bg-surface-container-high px-4 py-4">
                    <h3 className="md3-label-medium text-on-surface-variant">Campaign</h3>
                    <p className="md3-title-medium text-on-surface">{selectedWorkflow.campaignName}</p>
                    <p className="md3-body-small text-on-surface-variant">{selectedWorkflow.ownerEmail}</p>
                  </div>
                  <div className="rounded-2xl border border-outline-variant/60 bg-surface-container-high px-4 py-4">
                    <h3 className="md3-label-medium text-on-surface-variant">Automation</h3>
                    <p className="md3-body-small text-on-surface-variant">
                      SEO strategy update task will execute when mining and training complete.
                    </p>
                    <Badge variant="primary" size="sm" className="mt-2">
                      Update SEO strategy
                    </Badge>
                  </div>
                  <div className="rounded-2xl border border-outline-variant/60 bg-surface-container-high px-4 py-4">
                    <h3 className="md3-label-medium text-on-surface-variant">Header script</h3>
                    <p className="md3-body-small text-on-surface-variant">
                      {selectedWorkflow.scriptInjected
                        ? 'Client script was verified in the last run.'
                        : 'Script not confirmed. Send reminder to install in site header.'}
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  {selectedWorkflow.tasks.map((task) => {
                    const tone = statusTone[task.status];
                    return (
                      <div
                        key={`quick-${task.id}`}
                        className="flex items-center justify-between rounded-2xl border border-outline-variant/50 bg-surface px-4 py-3"
                      >
                        <div>
                          <p className="md3-label-medium text-on-surface">{task.label}</p>
                          {task.description && (
                            <p className="md3-body-small text-on-surface-variant">{task.description}</p>
                          )}
                        </div>
                        <Badge variant={tone.badge} size="sm" icon={tone.icon}>
                          {tone.label}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      )}
    </div>
  );
};

export default WorkflowsPage;
