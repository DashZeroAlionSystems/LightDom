import React, { useMemo, useState } from 'react';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  WorkspaceLayout,
  WorkspaceRailSection,
  WorkspaceSection,
  WorkspaceTabs,
} from '@/components/ui';
import { WorkflowWizardModal } from '@/components/composites/WorkflowWizardModal';
import { CalendarDays, CheckCircle2, Clock3, Sparkles, Target } from 'lucide-react';

const WORKFLOW_STATUS_VARIANTS = {
  draft: 'outline',
  'in-progress': 'warning',
  completed: 'success',
} as const;

type WorkflowStatus = keyof typeof WORKFLOW_STATUS_VARIANTS;

type StepState = 'completed' | 'active' | 'upcoming';

type WorkflowStep = {
  id: string;
  title: string;
  subtitle: string;
  state: StepState;
};

type WorkflowTask = {
  id: string;
  label: string;
  owner: string;
  status: 'ready' | 'running' | 'blocked';
  insight: string;
};

type SchemaLink = {
  id: string;
  role: string;
  schema: string;
};

type WorkflowRun = {
  id: string;
  name: string;
  status: WorkflowStatus;
  team: string;
  lastRun: string;
  watchers: string[];
  aiInsight: string;
  nextMilestone: string;
  steps: WorkflowStep[];
  tasks: WorkflowTask[];
  metrics: {
    readiness: number;
    automation: number;
    coverage: number;
  };
  schemaLinks: SchemaLink[];
};

const formatPercent = (value: number) => `${Math.round(value * 100)}%`;

export const WorkflowWizardDemoPage: React.FC = () => {
  const workflowRuns = useMemo<WorkflowRun[]>(
    () => [
      {
        id: 'seo-cluster-ops',
        name: 'SEO Cluster Activation',
        status: 'in-progress',
        team: 'Growth Automation',
        lastRun: '2 hours ago',
        watchers: ['Template Watcher Service', 'Socket.IO · admin-navigation'],
        aiInsight:
          'DeepSeek recommends prioritising entity schema enrichment before scheduling the publishing stage. Monitoring dashboards are ready for sync.',
        nextMilestone: 'Schedule schema verification window with data ops',
        steps: [
          { id: 'describe', title: 'Describe', subtitle: 'Prompt & scope', state: 'completed' },
          { id: 'configure', title: 'Configure', subtitle: 'Templates & schemas', state: 'active' },
          { id: 'generate', title: 'Generate', subtitle: 'Automation tasks', state: 'upcoming' },
          { id: 'review', title: 'Review', subtitle: 'QA & publish', state: 'upcoming' },
        ],
        tasks: [
          {
            id: 'collect-signals',
            label: 'Collect opportunity signals',
            owner: 'Data Ops',
            status: 'running',
            insight: 'Crawler metrics ingestion streaming via watcher events. 64% of backlog processed.',
          },
          {
            id: 'generate-briefs',
            label: 'Generate content briefs',
            owner: 'Content AI',
            status: 'ready',
            insight: 'Waiting for prioritised keyword shortlist. Prompt overrides applied from last run.',
          },
          {
            id: 'publish-monitor',
            label: 'Publish & monitor dashboards',
            owner: 'Analytics',
            status: 'blocked',
            insight: 'Requires schema linkage confirmation for ProductKnowledgeBase surfaces.',
          },
        ],
        metrics: {
          readiness: 0.82,
          automation: 0.9,
          coverage: 0.67,
        },
        schemaLinks: [
          { id: 'schema-webpage', role: 'Content brief target', schema: 'https://schema.org/WebPage' },
          { id: 'schema-report', role: 'Performance snapshot', schema: 'https://schema.org/Report' },
        ],
      },
      {
        id: 'partner-onboarding',
        name: 'Partner Onboarding Ops',
        status: 'draft',
        team: 'Customer Success',
        lastRun: 'Draft saved 3 days ago',
        watchers: ['Workflow hierarchy CRUD', 'Admin navigation cache'],
        aiInsight:
          'Template selection pending. Recommend re-using onboarding blueprint to mirror workflow hierarchy meta.',
        nextMilestone: 'Select "Ops provisioning" template and align overrides',
        steps: [
          { id: 'describe', title: 'Describe', subtitle: 'Prompt & scope', state: 'active' },
          { id: 'configure', title: 'Configure', subtitle: 'Templates & schemas', state: 'upcoming' },
          { id: 'generate', title: 'Generate', subtitle: 'Automation tasks', state: 'upcoming' },
          { id: 'review', title: 'Review', subtitle: 'QA & publish', state: 'upcoming' },
        ],
        tasks: [
          {
            id: 'map-schema',
            label: 'Map schema roles',
            owner: 'Solutions',
            status: 'ready',
            insight: 'Awaiting workflow prompt to seed schema blueprint. Last synced against onboarding knowledge base.',
          },
          {
            id: 'draft-playbook',
            label: 'Draft onboarding playbook',
            owner: 'Success Ops',
            status: 'ready',
            insight: 'Success ops to adapt prior playbook. Wizard will auto-populate tasks after prompt analysis.',
          },
        ],
        metrics: {
          readiness: 0.46,
          automation: 0.52,
          coverage: 0.31,
        },
        schemaLinks: [
          { id: 'schema-organization', role: 'Partner record', schema: 'https://schema.org/Organization' },
        ],
      },
      {
        id: 'ai-governance',
        name: 'AI Governance Review',
        status: 'completed',
        team: 'ML Platform',
        lastRun: 'Completed last week',
        watchers: ['DeepSeek model audit', 'Knowledge graph publisher'],
        aiInsight:
          'Workflow generated and synced to admin navigation. Awaiting next scheduled guardrail review.',
        nextMilestone: 'Publish guardrail report deck to leadership workspace',
        steps: [
          { id: 'describe', title: 'Describe', subtitle: 'Prompt & scope', state: 'completed' },
          { id: 'configure', title: 'Configure', subtitle: 'Templates & schemas', state: 'completed' },
          { id: 'generate', title: 'Generate', subtitle: 'Automation tasks', state: 'completed' },
          { id: 'review', title: 'Review', subtitle: 'QA & publish', state: 'completed' },
        ],
        tasks: [
          {
            id: 'risk-review',
            label: 'Run risk review',
            owner: 'Compliance',
            status: 'ready',
            insight: 'All required documents attached. Ready for recurring execution.',
          },
        ],
        metrics: {
          readiness: 0.97,
          automation: 0.88,
          coverage: 0.92,
        },
        schemaLinks: [
          { id: 'schema-audit', role: 'Audit record', schema: 'https://schema.org/Audit' },
          { id: 'schema-dataset', role: 'Training dataset', schema: 'https://schema.org/Dataset' },
        ],
      },
    ],
    []
  );

  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string>(workflowRuns[0]?.id ?? '');
  const [isWizardOpen, setWizardOpen] = useState(false);

  const selectedWorkflow = useMemo(
    () => workflowRuns.find((run) => run.id === selectedWorkflowId) ?? workflowRuns[0],
    [selectedWorkflowId, workflowRuns]
  );

  const stepTabs = useMemo(
    () =>
      selectedWorkflow?.steps.map((step) => ({
        id: step.id,
        label: step.title,
        subtitle: step.subtitle,
        active: step.state === 'active',
        dirty: step.state === 'active' && selectedWorkflow.status !== 'completed',
      })) ?? [],
    [selectedWorkflow]
  );

  return (
    <>
      <WorkspaceLayout
        sidebar={
          <div className="space-y-4">
            <WorkspaceRailSection
              title="Workflow runs"
              description="Watcher-driven orchestration pipelines"
            >
              <div className="space-y-2">
                {workflowRuns.map((run) => (
                  <button
                    key={run.id}
                    type="button"
                    onClick={() => setSelectedWorkflowId(run.id)}
                    className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                      selectedWorkflow?.id === run.id
                        ? 'border-primary bg-primary/10 shadow-level-1'
                        : 'border-outline/20 hover:border-outline/40'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="md3-title-small text-on-surface">{run.name}</p>
                        <p className="md3-body-small text-on-surface-variant/80">{run.team}</p>
                      </div>
                      <Badge variant={WORKFLOW_STATUS_VARIANTS[run.status]}>{run.status}</Badge>
                    </div>
                    <p className="mt-2 text-xs text-on-surface-variant/70">{run.lastRun}</p>
                  </button>
                ))}
              </div>
            </WorkspaceRailSection>

            <WorkspaceRailSection
              title="Watcher signals"
              description="Realtime streams"
            >
              <ul className="space-y-2">
                {selectedWorkflow?.watchers.map((watcher) => (
                  <li
                    key={watcher}
                    className="rounded-2xl border border-outline/10 bg-surface px-3 py-2 text-xs text-on-surface-variant"
                  >
                    {watcher}
                  </li>
                ))}
              </ul>
            </WorkspaceRailSection>
          </div>
        }
        inspector={
          selectedWorkflow && (
            <div className="space-y-4">
              <WorkspaceRailSection
                title="Schema links"
                description="Ensure wizard output maps to KG surfaces."
              >
                <div className="space-y-2">
                  {selectedWorkflow.schemaLinks.map((link) => (
                    <Card key={link.id} className="border-outline/20 bg-surface-container-low">
                      <CardHeader className="space-y-1">
                        <CardTitle className="md3-title-small text-on-surface">{link.role}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="break-all text-xs text-on-surface-variant">{link.schema}</p>
                      </CardContent>
                    </Card>
                  ))}
                  {selectedWorkflow.schemaLinks.length === 0 && (
                    <p className="text-sm text-on-surface-variant/80">No schema links configured.</p>
                  )}
                </div>
              </WorkspaceRailSection>

              <WorkspaceRailSection
                title="Next milestone"
                description="Keep teams aligned"
              >
                <div className="flex items-start gap-3 rounded-2xl border border-outline/15 bg-surface-container-low p-4 text-sm">
                  <Target className="h-5 w-5 text-primary" />
                  <p className="flex-1 text-on-surface">{selectedWorkflow.nextMilestone}</p>
                </div>
              </WorkspaceRailSection>
            </div>
          )
        }
        header={
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
                <Sparkles className="h-4 w-4" />
                Workflow wizard showcase
              </div>
              <div>
                <h1 className="text-3xl font-semibold text-on-surface md:text-4xl">Generate workflows with MD3 primitives</h1>
                <p className="mt-2 max-w-3xl text-sm text-on-surface-variant">
                  Trigger the multi-step workflow wizard, reuse admin navigation metadata, and align schema links before publishing automation templates. This demo reuses the live <code>WorkflowWizardModal</code> component wired for watcher outputs.
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Button variant="filled" onClick={() => setWizardOpen(true)}>
                Launch workflow wizard
              </Button>
              <p className="text-xs text-on-surface-variant/80">Wizard uses DeepSeek planning API with fallback mock data.</p>
            </div>
          </div>
        }
      >
        <div className="space-y-5">
          <WorkspaceTabs
            tabs={stepTabs}
            onSelect={(tabId) => {
              const targetWorkflow = workflowRuns.find((run) => run.steps.some((step) => step.id === tabId));
              if (!targetWorkflow) return;
              if (targetWorkflow.id !== selectedWorkflow?.id) {
                setSelectedWorkflowId(targetWorkflow.id);
              }
            }}
            className="bg-surface-container-high"
          />

          {selectedWorkflow && (
            <>
              <WorkspaceSection
                title="Automation readiness"
                meta={`${selectedWorkflow.watchers.length} watcher streams • Last run ${selectedWorkflow.lastRun}`}
                actions={
                  <Button variant="text" size="sm" onClick={() => setWizardOpen(true)}>
                    Resume wizard
                  </Button>
                }
              >
                <div className="grid gap-3 md:grid-cols-3">
                  <Card className="border-outline/20 bg-surface-container-low">
                    <CardHeader className="flex items-center gap-3">
                      <CalendarDays className="h-5 w-5 text-primary" />
                      <CardTitle className="md3-title-small text-on-surface">Readiness</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="md3-display-small text-on-surface">{formatPercent(selectedWorkflow.metrics.readiness)}</p>
                      <p className="mt-1 text-sm text-on-surface-variant">Schemas verified against watcher inventory.</p>
                    </CardContent>
                  </Card>

                  <Card className="border-outline/20 bg-surface-container-low">
                    <CardHeader className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-success" />
                      <CardTitle className="md3-title-small text-on-surface">Automation</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="md3-display-small text-on-surface">{formatPercent(selectedWorkflow.metrics.automation)}</p>
                      <p className="mt-1 text-sm text-on-surface-variant">Tasks synced with Template Watcher outputs.</p>
                    </CardContent>
                  </Card>

                  <Card className="border-outline/20 bg-surface-container-low">
                    <CardHeader className="flex items-center gap-3">
                      <Clock3 className="h-5 w-5 text-warning" />
                      <CardTitle className="md3-title-small text-on-surface">Coverage</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="md3-display-small text-on-surface">{formatPercent(selectedWorkflow.metrics.coverage)}</p>
                      <p className="mt-1 text-sm text-on-surface-variant">Knowledge graph entities mapped for this run.</p>
                    </CardContent>
                  </Card>
                </div>

                <Card className="border-outline/20 bg-surface-container mt-4">
                  <CardHeader>
                    <CardTitle className="md3-title-medium text-on-surface">Assistant insight</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed text-on-surface-variant">{selectedWorkflow.aiInsight}</p>
                  </CardContent>
                </Card>
              </WorkspaceSection>

              <WorkspaceSection title="Task orchestration" meta="Toggle tasks and customise prompts in the wizard">
                <div className="space-y-3">
                  {selectedWorkflow.tasks.map((task) => (
                    <Card
                      key={task.id}
                      className={`border ${
                        task.status === 'running'
                          ? 'border-primary/40 bg-primary/8'
                          : task.status === 'ready'
                          ? 'border-outline/20 bg-surface'
                          : 'border-error/30 bg-error/5'
                      }`}
                    >
                      <CardHeader className="flex items-center justify-between gap-3">
                        <div>
                          <CardTitle className="md3-title-small text-on-surface">{task.label}</CardTitle>
                          <p className="text-xs text-on-surface-variant/80">Owner · {task.owner}</p>
                        </div>
                        <Badge
                          variant={
                            task.status === 'running'
                              ? 'warning'
                              : task.status === 'ready'
                              ? 'secondary'
                              : 'error'
                          }
                        >
                          {task.status}
                        </Badge>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-on-surface-variant">{task.insight}</p>
                      </CardContent>
                    </Card>
                  ))}
                  {selectedWorkflow.tasks.length === 0 && (
                    <p className="text-sm text-on-surface-variant/80">No tasks configured yet. Launch the wizard to seed tasks.</p>
                  )}
                </div>
              </WorkspaceSection>
            </>
          )}
        </div>
      </WorkspaceLayout>

      <WorkflowWizardModal
        isOpen={isWizardOpen}
        onClose={() => setWizardOpen(false)}
        initialStep="ideation"
        config={{
          defaultPrompt: selectedWorkflow?.steps[0]?.state === 'completed'
            ? 'Regenerate tasks for SEO cluster activation with schema QA focus.'
            : 'Design an automation workflow for the selected initiative.',
          context: selectedWorkflow?.team ?? 'seo-campaign',
        }}
      />
    </>
  );
};

export default WorkflowWizardDemoPage;
