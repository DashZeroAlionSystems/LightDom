import React, { useState, useEffect } from 'react';
import {
  // Core components
  Button,
  Input,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Badge,
  Avatar,
  StatCard,

  // Layout components
  KpiGrid,
  KpiCard,
  WorkflowPanel,
  WorkflowPanelSection,
  WorkflowPanelFooter,
  AsyncStateLoading,
  AsyncStateError,
  AsyncStateEmpty,
  Fab,

  // Advanced components
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
  Dialog,
  DialogHeader,
  DialogContent,
  DialogFooter,
  Drawer,
  DrawerHeader,
  DrawerContent,
  DrawerFooter,
  Progress,
  CircularProgress,
  Tooltip,
  Wizard,
  WizardContent,
  WizardFooter,

  // Neural Network components
  ModelCard,
  MetricsChart,
  NeuralNetworkVisualizer,
  ResearchIntegration,
} from '@/components/ui';
import {
  Brain,
  TrendingUp,
  Settings,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Play,
  Pause,
  CheckCircle,
  AlertCircle,
  Info,
  X,
  Cpu,
  Database,
  BarChart3
} from 'lucide-react';

// Mock data for demonstrations
const mockKpiData = [
  {
    label: 'Active components',
    value: '128',
    delta: '12 new this quarter',
    tone: 'primary' as const,
    icon: <Cpu className="h-4 w-4" />,
  },
  {
    label: 'Design tokens',
    value: '412',
    delta: '3 changes pending',
    tone: 'warning' as const,
    icon: <Database className="h-4 w-4" />,
  },
  {
    label: 'Usage coverage',
    value: '86%',
    delta: '+5% vs last month',
    tone: 'success' as const,
    icon: <BarChart3 className="h-4 w-4" />,
  },
  {
    label: 'Research integrations',
    value: '24',
    delta: 'Latest update: FP8 training',
    tone: 'success' as const,
    icon: <Brain className="h-4 w-4" />,
  },
];

const mockTrainingData = [
  { epoch: 1, accuracy: 0.65, loss: 1.2, validationAccuracy: 0.62, validationLoss: 1.3 },
  { epoch: 5, accuracy: 0.78, loss: 0.8, validationAccuracy: 0.75, validationLoss: 0.85 },
  { epoch: 10, accuracy: 0.85, loss: 0.6, validationAccuracy: 0.82, validationLoss: 0.65 },
  { epoch: 15, accuracy: 0.89, loss: 0.45, validationAccuracy: 0.87, validationLoss: 0.48 },
  { epoch: 20, accuracy: 0.92, loss: 0.35, validationAccuracy: 0.89, validationLoss: 0.38 }
];

const networkLayers = [
  { name: 'Input', neurons: 128, activation: 'Embedding' },
  { name: 'Multi-Head Attention', neurons: 512, activation: 'Softmax' },
  { name: 'Feed Forward', neurons: 2048, activation: 'ReLU' },
  { name: 'Layer Norm', neurons: 512 },
  { name: 'Output', neurons: 2, activation: 'Softmax' }
];

export const DesignSystemShowcasePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('components');
  const [activeWizardStep, setActiveWizardStep] = useState<'prompt' | 'schema' | 'tasks' | 'review'>('prompt');

  const [dialogOpen, setDialogOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [progress, setProgress] = useState(65);
  const [searchQuery, setSearchQuery] = useState('');

  // Simulate progress animation
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => (prev >= 100 ? 0 : prev + 1));
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const wizardSteps = [
    {
      id: 'prompt',
      title: 'Campaign prompt',
      subtitle: 'Capture intent and goals for the workflow.',
      status: 'completed' as const,
      meta: {
        caption: 'Prompt recorded',
        badge: 'Step 1',
        timestamp: '3m ago',
      },
    },
    {
      id: 'schema',
      title: 'Schema blueprint',
      subtitle: 'Generate schema.org-linked structure for components.',
      status: activeWizardStep === 'schema' ? 'active' : 'pending',
      meta: {
        caption: 'Awaiting confirmation',
        badge: 'Step 2',
      },
    },
    {
      id: 'tasks',
      title: 'Task orchestration',
      subtitle: 'Configure crawler, enrichment, and training tasks.',
      status: activeWizardStep === 'tasks' ? 'active' : 'pending',
      meta: {
        badge: 'Step 3',
      },
    },
    {
      id: 'review',
      title: 'Review & launch',
      subtitle: 'Verify automation rules and deploy workflow.',
      status: 'blocked',
      meta: {
        caption: 'Missing header script',
        badge: 'Step 4',
      },
    },
  ];

  return (
    <div className="relative min-h-screen bg-surface p-6 space-y-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="md3-headline-large text-on-surface flex items-center gap-3">
            <Settings className="h-8 w-8 text-primary" />
            LightDom Design System Showcase
          </h1>
          <p className="md3-body-medium text-on-surface-variant mt-1">
            Comprehensive demonstration of components with automated research integration.
          </p>
          <div className="flex items-center gap-4 mt-3">
            <div className="inline-flex h-2 w-2 rounded-full bg-success animate-pulse" />
            <span className="md3-label-small text-success">All systems operational</span>
            <div className="inline-flex h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="md3-label-small text-primary">Research system active</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Tooltip content="Search components and patterns" placement="bottom">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
              <input
                type="text"
                placeholder="Search design system..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 rounded-2xl border border-outline bg-surface-container-high text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </Tooltip>
        </div>
      </header>

      {/* KPI Dashboard */}
      <WorkflowPanel title="System Overview" description="Real-time metrics and key performance indicators.">
        <WorkflowPanelSection>
          <KpiGrid columns={4}>
            {mockKpiData.map((kpi, index) => (
              <KpiCard key={index} {...kpi} />
            ))}
          </KpiGrid>
        </WorkflowPanelSection>
      </WorkflowPanel>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="components">Components</TabsTrigger>
          <TabsTrigger value="layouts">Layouts</TabsTrigger>
          <TabsTrigger value="ml">ML Dashboard</TabsTrigger>
          <TabsTrigger value="research">Research</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Progress Components */}
            <WorkflowPanel title="Progress Indicators" description="Various progress and loading state components.">
              <WorkflowPanelSection>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="md3-label-medium text-on-surface-variant">Linear Progress</span>
                      <span className="md3-label-small text-on-surface-variant">{progress}%</span>
                    </div>
                    <Progress value={progress} showValue />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="md3-label-medium text-on-surface-variant mb-1">Circular Progress</div>
                      <div className="md3-body-small text-on-surface-variant">Task completion</div>
                    </div>
                    <CircularProgress value={progress} showValue />
                  </div>
                </div>
              </WorkflowPanelSection>
            </WorkflowPanel>

            {/* Status Components */}
            <WorkflowPanel title="Async States" description="Loading, error, and empty state handling.">
              <WorkflowPanelSection>
                <div className="space-y-4">
                  <AsyncStateLoading className="min-h-[100px]" title="Loading component library..." />
                  <KpiCard
                    label="Average accuracy"
                    value="96.4%"
                    tone="success"
                    delta="+2.1% vs last month"
                    icon={<TrendingUp className="h-4 w-4" />}
                  />
                  <AsyncStateEmpty
                    title="No components found"
                    description="Try adjusting your search criteria."
                    icon={<Search className="h-8 w-8" />}
                    compact
                  />
                </div>
              </WorkflowPanelSection>
            </WorkflowPanel>
          </div>

          {/* Interactive Components Demo */}
          <WorkflowPanel title="Interactive Components" description="Demonstration of modal, drawer, and tooltip interactions.">
            <WorkflowPanelSection>
              <div className="flex flex-wrap gap-4">
                <Button onClick={() => setDialogOpen(true)}>Open Dialog</Button>
                <Button variant="outlined" onClick={() => setDrawerOpen(true)}>Open Drawer</Button>
                <Tooltip content="This is a tooltip with detailed information about the component.">
                  <Button variant="text">Hover for Tooltip</Button>
                </Tooltip>
                <Fab icon={<Plus className="h-5 w-5" />} aria-label="Add item" />
              </div>
            </WorkflowPanelSection>
          </WorkflowPanel>
        </TabsContent>

        <TabsContent value="components" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Form Components */}
            <WorkflowPanel title="Form Components" description="Input fields, buttons, and form controls.">
              <WorkflowPanelSection>
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <Input placeholder="Text input field" />
                    <Input type="email" placeholder="Email input" />
                  </div>
                  <div className="flex gap-2">
                    <Button>Filled Button</Button>
                    <Button variant="outlined">Outlined</Button>
                    <Button variant="text">Text</Button>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="primary">Primary</Badge>
                    <Badge variant="secondary">Secondary</Badge>
                    <Badge variant="error">Error</Badge>
                  </div>
                </div>
              </WorkflowPanelSection>
            </WorkflowPanel>

            {/* Card Components */}
            <WorkflowPanel title="Card Components" description="Content containers with various layouts.">
              <WorkflowPanelSection>
                <Card>
                  <CardHeader>
                    <CardTitle>Card Title</CardTitle>
                    <CardDescription>Card description with supporting text.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="md3-body-medium text-on-surface-variant">
                      This is the main content area of the card component.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button size="sm">Action</Button>
                  </CardFooter>
                </Card>
              </WorkflowPanelSection>
            </WorkflowPanel>
          </div>

          {/* Accordion Demo */}
          <WorkflowPanel title="Accordion Component" description="Collapsible content sections.">
            <WorkflowPanelSection>
              <Accordion type="single" className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>Component Variants</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3">
                      <p className="md3-body-medium text-on-surface-variant">
                        Components support multiple variants for different use cases and visual styles.
                      </p>
                      <div className="flex gap-2">
                        <Badge variant="primary">Primary</Badge>
                        <Badge variant="secondary">Secondary</Badge>
                        <Badge variant="outline">Outline</Badge>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger>Design Tokens</AccordionTrigger>
                  <AccordionContent>
                    <p className="md3-body-medium text-on-surface-variant">
                      All components use MD3 design tokens for consistent theming and accessibility.
                    </p>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                  <AccordionTrigger>Accessibility</AccordionTrigger>
                  <AccordionContent>
                    <p className="md3-body-medium text-on-surface-variant">
                      Components follow WCAG AA guidelines with proper ARIA labels and keyboard navigation.
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </WorkflowPanelSection>
          </WorkflowPanel>
        </TabsContent>

        <TabsContent value="layouts" className="space-y-6">
          <WorkflowPanel title="Workflow Panels" description="Structured content organization with sections and footers.">
            <WorkflowPanelSection>
              <div className="md3-body-medium text-on-surface-variant">
                Workflow panels provide consistent structure for dashboard content with clear sections and actions.
              </div>
            </WorkflowPanelSection>
            <WorkflowPanelFooter>
              <span className="md3-label-medium text-on-surface-variant">
                Use WorkflowPanel for complex layouts requiring structured content organization.
              </span>
              <Button>Learn More</Button>
            </WorkflowPanelFooter>
          </WorkflowPanel>

          <div className="grid gap-6 lg:grid-cols-2">
            <WorkflowPanel title="Grid Layouts" description="Responsive grid systems for content organization.">
              <WorkflowPanelSection>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-outline bg-surface p-4">
                    <div className="md3-title-small text-on-surface mb-2">Grid Item 1</div>
                    <div className="md3-body-small text-on-surface-variant">Responsive content block</div>
                  </div>
                  <div className="rounded-2xl border border-outline bg-surface p-4">
                    <div className="md3-title-small text-on-surface mb-2">Grid Item 2</div>
                    <div className="md3-body-small text-on-surface-variant">Flexible layout component</div>
                  </div>
                </div>
              </WorkflowPanelSection>
            </WorkflowPanel>

            <WorkflowPanel title="Tab Navigation" description="Organized content with tabbed interfaces.">
              <WorkflowPanelSection>
                <Tabs defaultValue="tab1" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
                    <TabsTrigger value="tab2">Tab 2</TabsTrigger>
                    <TabsTrigger value="tab3">Tab 3</TabsTrigger>
                  </TabsList>
                  <TabsContent value="tab1" className="mt-4">
                    <div className="md3-body-medium text-on-surface-variant">
                      Content for the first tab with organized information display.
                    </div>
                  </TabsContent>
                  <TabsContent value="tab2" className="mt-4">
                    <div className="md3-body-medium text-on-surface-variant">
                      Second tab content demonstrating tabbed navigation patterns.
                    </div>
                  </TabsContent>
                  <TabsContent value="tab3" className="mt-4">
                    <div className="md3-body-medium text-on-surface-variant">
                      Third tab with additional content and interactive elements.
                    </div>
                  </TabsContent>
                </Tabs>
              </WorkflowPanelSection>
            </WorkflowPanel>
          </div>
        </TabsContent>

        <TabsContent value="ml" className="space-y-6">
          <WorkflowPanel title="Neural Network Dashboard" description="Specialized ML components for model training and monitoring.">
            <WorkflowPanelSection>
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="space-y-4">
                  <ModelCard
                    modelName="Advanced Predictor v2.1"
                    modelType="Transformer"
                    accuracy={0.97}
                    loss={0.11}
                    epochs={50}
                    trainingProgress={100}
                    status="completed"
                    lastUpdated="2025-01-15T10:30:00Z"
                  />
                  <ModelCard
                    modelName="Real-time Analyzer"
                    modelType="CNN"
                    accuracy={0.89}
                    loss={0.23}
                    epochs={35}
                    trainingProgress={78}
                    status="training"
                    lastUpdated="2025-01-15T11:45:00Z"
                  />
                </div>
                <div className="space-y-4">
                  <MetricsChart data={mockTrainingData} title="Training Progress" height="sm" />
                  <NeuralNetworkVisualizer layers={networkLayers.slice(0, 4)} size="sm" />
                </div>
              </div>
            </WorkflowPanelSection>
          </WorkflowPanel>
        </TabsContent>

        <TabsContent value="research" className="space-y-6">
          <ResearchIntegration
            status="active"
            activeWorkflows={["data-science-research-workflow", "component-generation-workflow"]}
            onResearchTrigger={(topic) => console.log("Research triggered:", topic)}
          />
        </TabsContent>
      </Tabs>

      {/* Fixed Action Button */}
      <div className="fixed bottom-8 right-8">
        <Fab extended icon={<Settings className="h-5 w-5" />} aria-label="Design system settings">
          Design System
        </Fab>
      </div>

      {/* Dialog Demo */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogHeader title="Component Demo" description="Interactive component demonstration" />
        <DialogContent>
          <div className="space-y-4">
            <p className="md3-body-medium text-on-surface-variant">
              This dialog demonstrates the modal component with proper focus management and accessibility features.
            </p>
            <div className="flex gap-2">
              <Button onClick={() => setDialogOpen(false)}>Close</Button>
              <Button variant="outlined">Secondary Action</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Drawer Demo */}
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerHeader title="Design System Settings" description="Configure design system preferences" />
        <DrawerContent>
          <div className="space-y-4">
            <div>
              <label className="md3-label-medium text-on-surface-variant block mb-2">Theme</label>
              <select className="w-full rounded-2xl border border-outline bg-surface px-3 py-2">
                <option>Light</option>
                <option>Dark</option>
                <option>System</option>
              </select>
            </div>
            <div>
              <label className="md3-label-medium text-on-surface-variant block mb-2">Density</label>
              <select className="w-full rounded-2xl border border-outline bg-surface px-3 py-2">
                <option>Comfortable</option>
                <option>Compact</option>
                <option>Spacious</option>
              </select>
            </div>
          </div>
        </DrawerContent>
        <DrawerFooter align="end">
          <Button variant="outlined" onClick={() => setDrawerOpen(false)}>Cancel</Button>
          <Button onClick={() => setDrawerOpen(false)}>Save Changes</Button>
        </DrawerFooter>
      </Drawer>
    </div>
  );
};
