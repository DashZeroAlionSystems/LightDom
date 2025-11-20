import {
  Activity,
  AdvancedResearch,
  BarChart3,
  // Icons
  Brain,
  // All component imports
  Button,
  CheckCircle,
  // Analytics & Monitoring
  DesignSystemAnalytics,
  DesignSystemQA,
  // Architecture Components
  EdgeHealth,
  EnterpriseDashboard,
  // Enterprise Components
  EnterpriseProvider,
  Globe,
  Home,
  KpiCard,
  KpiGrid,
  Layers,
  MetricsChart,
  ModelCard,
  NeuralNetworkVisualizer,
  RefreshCw,
  ResearchIntegration,
  Search,
  Settings,
  Shield,
  // AI/ML Components
  SmartDashboard,
  SystemHealthDashboard,
  WorkflowPanel,
  WorkflowPanelSection,
} from '@/components/ui';
import React, { useState } from 'react';

// Mock data for comprehensive demonstration
const comprehensiveMetrics = [
  {
    label: 'Total Components',
    value: '30+',
    delta: 'MD3 compliant',
    tone: 'primary' as const,
    icon: <Layers className='h-4 w-4' />,
  },
  {
    label: 'AI Insights',
    value: '1,247',
    delta: '+23% this week',
    tone: 'success' as const,
    icon: <Brain className='h-4 w-4' />,
  },
  {
    label: 'Edge Regions',
    value: '6',
    delta: 'Global coverage',
    tone: 'warning' as const,
    icon: <Globe className='h-4 w-4' />,
  },
  {
    label: 'System Uptime',
    value: '99.9%',
    delta: 'Enterprise SLA',
    tone: 'tertiary' as const,
    icon: <Activity className='h-4 w-4' />,
  },
];

const trainingData = [
  { epoch: 1, accuracy: 0.65, loss: 1.2, validationAccuracy: 0.62, validationLoss: 1.3 },
  { epoch: 10, accuracy: 0.82, loss: 0.65, validationAccuracy: 0.79, validationLoss: 0.68 },
  { epoch: 20, accuracy: 0.89, loss: 0.45, validationAccuracy: 0.86, validationLoss: 0.48 },
  { epoch: 30, accuracy: 0.94, loss: 0.28, validationAccuracy: 0.91, validationLoss: 0.32 },
  { epoch: 40, accuracy: 0.96, loss: 0.18, validationAccuracy: 0.93, validationLoss: 0.21 },
  { epoch: 50, accuracy: 0.98, loss: 0.11, validationAccuracy: 0.95, validationLoss: 0.14 },
];

const networkArchitecture = [
  { name: 'Input Layer', neurons: 128, activation: 'Embedding' },
  { name: 'Multi-Head Attention', neurons: 512, activation: 'Softmax' },
  { name: 'Feed Forward', neurons: 2048, activation: 'ReLU' },
  { name: 'Layer Normalization', neurons: 512 },
  { name: 'Output Layer', neurons: 2, activation: 'Softmax' },
];

export const ComprehensiveSystemDemo: React.FC = () => {
  const [activeDemo, setActiveDemo] = useState('overview');
  const [intelligenceLevel, setIntelligenceLevel] = useState<
    'basic' | 'adaptive' | 'predictive' | 'autonomous'
  >('adaptive');
  const [userTier, setUserTier] = useState<'starter' | 'professional' | 'enterprise'>('enterprise');

  const demos = [
    {
      id: 'overview',
      name: 'System Overview',
      icon: Home,
      description: 'Complete system status and architecture',
    },
    {
      id: 'ai-intelligence',
      name: 'AI Intelligence',
      icon: Brain,
      description: 'Smart components and ML integration',
    },
    {
      id: 'enterprise',
      name: 'Enterprise Governance',
      icon: Shield,
      description: 'Multi-tenant management and compliance',
    },
    {
      id: 'architecture',
      name: 'System Architecture',
      icon: Layers,
      description: 'Micro-frontends and edge computing',
    },
    {
      id: 'performance',
      name: 'Performance Analytics',
      icon: BarChart3,
      description: 'Real-time monitoring and insights',
    },
    {
      id: 'research',
      name: 'Research Automation',
      icon: Search,
      description: 'Continuous learning and discovery',
    },
    {
      id: 'workflows',
      name: 'Workflow Automation',
      icon: RefreshCw,
      description: 'Development process automation',
    },
  ];

  return (
    <div className='min-h-screen bg-surface'>
      {/* Master Header */}
      <header className='border-b border-outline bg-surface-container-high px-8 py-6'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-4'>
            <div className='flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-tertiary text-on-primary'>
              <Brain className='h-6 w-6' />
            </div>
            <div>
              <h1 className='md3-headline-large text-on-surface'>LightDom Design System v2.0</h1>
              <p className='md3-body-medium text-on-surface-variant mt-1'>
                Complete Enterprise AI/ML Design System Demonstration
              </p>
            </div>
          </div>

          {/* System Status */}
          <div className='flex items-center gap-6'>
            <div className='flex items-center gap-2'>
              <div className='inline-flex h-3 w-3 rounded-full bg-success animate-pulse' />
              <span className='md3-label-medium text-on-surface'>All Systems Operational</span>
            </div>

            <div className='flex items-center gap-2'>
              <select
                value={intelligenceLevel}
                onChange={e => setIntelligenceLevel(e.target.value as any)}
                className='px-3 py-1 rounded-lg border border-outline bg-surface text-on-surface'
              >
                <option value='basic'>Basic</option>
                <option value='adaptive'>Adaptive</option>
                <option value='predictive'>Predictive</option>
                <option value='autonomous'>Autonomous</option>
              </select>
              <span className='md3-label-small text-on-surface-variant'>AI Level</span>
            </div>

            <div className='flex items-center gap-2'>
              <select
                value={userTier}
                onChange={e => setUserTier(e.target.value as any)}
                className='px-3 py-1 rounded-lg border border-outline bg-surface text-on-surface'
              >
                <option value='starter'>Starter</option>
                <option value='professional'>Professional</option>
                <option value='enterprise'>Enterprise</option>
              </select>
              <span className='md3-label-small text-on-surface-variant'>Tier</span>
            </div>
          </div>
        </div>

        {/* Intelligence Indicator */}
        <div className='flex items-center justify-between mt-4'>
          <div className='flex items-center gap-4'>
            <span className='md3-label-medium text-on-surface-variant'>System Intelligence:</span>
            <div className='flex items-center gap-2'>
              <div
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  intelligenceLevel === 'basic'
                    ? 'bg-outline text-on-surface'
                    : intelligenceLevel === 'adaptive'
                      ? 'bg-primary text-on-primary'
                      : intelligenceLevel === 'predictive'
                        ? 'bg-success text-on-success'
                        : 'bg-warning text-on-warning'
                }`}
              >
                {intelligenceLevel.charAt(0).toUpperCase() + intelligenceLevel.slice(1)} Mode
              </div>
            </div>
          </div>

          <div className='flex items-center gap-4 text-sm'>
            <div className='flex items-center gap-1'>
              <CheckCircle className='h-4 w-4 text-success' />
              <span className='text-on-surface-variant'>30+ Components</span>
            </div>
            <div className='flex items-center gap-1'>
              <Brain className='h-4 w-4 text-primary' />
              <span className='text-on-surface-variant'>AI Enhanced</span>
            </div>
            <div className='flex items-center gap-1'>
              <Globe className='h-4 w-4 text-tertiary' />
              <span className='text-on-surface-variant'>Global Scale</span>
            </div>
            <div className='flex items-center gap-1'>
              <Shield className='h-4 w-4 text-success' />
              <span className='text-on-surface-variant'>Enterprise Ready</span>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className='border-b border-outline bg-surface px-8 py-4'>
        <div className='flex gap-2 overflow-x-auto'>
          {demos.map(demo => (
            <button
              key={demo.id}
              onClick={() => setActiveDemo(demo.id)}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                activeDemo === demo.id
                  ? 'bg-primary text-on-primary shadow-lg'
                  : 'text-on-surface hover:bg-surface-container'
              }`}
            >
              <demo.icon className='h-4 w-4' />
              <div className='text-left'>
                <div className='md3-label-medium font-medium'>{demo.name}</div>
                <div className='md3-body-small opacity-80'>{demo.description}</div>
              </div>
            </button>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main className='flex-1 p-8'>
        {/* Overview */}
        {activeDemo === 'overview' && (
          <div className='space-y-8'>
            {/* System Metrics */}
            <KpiGrid columns={4}>
              {comprehensiveMetrics.map((metric, index) => (
                <KpiCard key={index} {...metric} />
              ))}
            </KpiGrid>

            {/* Architecture Overview */}
            <WorkflowPanel
              title='System Architecture Overview'
              description='Complete enterprise design system with AI/ML integration'
            >
              <WorkflowPanelSection>
                <div className='grid gap-6 lg:grid-cols-4'>
                  <div className='text-center p-6 rounded-3xl border border-primary/30 bg-primary-container/10'>
                    <Layers className='h-12 w-12 text-primary mx-auto mb-3' />
                    <div className='md3-title-medium text-on-surface mb-2'>Component Library</div>
                    <div className='md3-body-medium text-on-surface-variant'>
                      30+ MD3 components with full accessibility
                    </div>
                  </div>

                  <div className='text-center p-6 rounded-3xl border border-success/30 bg-success-container/10'>
                    <Brain className='h-12 w-12 text-success mx-auto mb-3' />
                    <div className='md3-title-medium text-on-surface mb-2'>AI/ML Intelligence</div>
                    <div className='md3-body-medium text-on-surface-variant'>
                      Smart components with predictive capabilities
                    </div>
                  </div>

                  <div className='text-center p-6 rounded-3xl border border-warning/30 bg-warning-container/10'>
                    <Shield className='h-12 w-12 text-warning mx-auto mb-3' />
                    <div className='md3-title-medium text-on-surface mb-2'>
                      Enterprise Governance
                    </div>
                    <div className='md3-body-medium text-on-surface-variant'>
                      Multi-tenant management and compliance
                    </div>
                  </div>

                  <div className='text-center p-6 rounded-3xl border border-tertiary/30 bg-tertiary-container/10'>
                    <Globe className='h-12 w-12 text-tertiary mx-auto mb-3' />
                    <div className='md3-title-medium text-on-surface mb-2'>Global Performance</div>
                    <div className='md3-body-medium text-on-surface-variant'>
                      Edge computing with 6 global regions
                    </div>
                  </div>
                </div>
              </WorkflowPanelSection>
            </WorkflowPanel>

            {/* System Health Summary */}
            <div className='grid gap-6 lg:grid-cols-3'>
              <WorkflowPanel title='AI/ML Status' description='Intelligent system performance'>
                <WorkflowPanelSection>
                  <div className='space-y-3'>
                    <div className='flex justify-between items-center'>
                      <span className='md3-body-medium text-on-surface-variant'>Active Models</span>
                      <span className='md3-body-medium text-on-surface font-medium'>3</span>
                    </div>
                    <div className='flex justify-between items-center'>
                      <span className='md3-body-medium text-on-surface-variant'>Training Jobs</span>
                      <span className='md3-body-medium text-on-surface font-medium'>2</span>
                    </div>
                    <div className='flex justify-between items-center'>
                      <span className='md3-body-medium text-on-surface-variant'>AI Insights</span>
                      <span className='md3-body-medium text-on-surface font-medium'>1,247</span>
                    </div>
                  </div>
                </WorkflowPanelSection>
              </WorkflowPanel>

              <WorkflowPanel
                title='Enterprise Metrics'
                description='Organization and governance status'
              >
                <WorkflowPanelSection>
                  <div className='space-y-3'>
                    <div className='flex justify-between items-center'>
                      <span className='md3-body-medium text-on-surface-variant'>
                        Active Tenants
                      </span>
                      <span className='md3-body-medium text-on-surface font-medium'>12</span>
                    </div>
                    <div className='flex justify-between items-center'>
                      <span className='md3-body-medium text-on-surface-variant'>
                        Compliance Score
                      </span>
                      <span className='md3-body-medium text-success font-medium'>97%</span>
                    </div>
                    <div className='flex justify-between items-center'>
                      <span className='md3-body-medium text-on-surface-variant'>
                        Security Events
                      </span>
                      <span className='md3-body-medium text-on-surface font-medium'>0</span>
                    </div>
                  </div>
                </WorkflowPanelSection>
              </WorkflowPanel>

              <WorkflowPanel
                title='Performance Stats'
                description='System performance and optimization'
              >
                <WorkflowPanelSection>
                  <div className='space-y-3'>
                    <div className='flex justify-between items-center'>
                      <span className='md3-body-medium text-on-surface-variant'>Response Time</span>
                      <span className='md3-body-medium text-success font-medium'>{'<50ms'}</span>
                    </div>
                    <div className='flex justify-between items-center'>
                      <span className='md3-body-medium text-on-surface-variant'>Bundle Size</span>
                      <span className='md3-body-medium text-on-surface font-medium'>180KB</span>
                    </div>
                    <div className='flex justify-between items-center'>
                      <span className='md3-body-medium text-on-surface-variant'>Uptime</span>
                      <span className='md3-body-medium text-success font-medium'>99.9%</span>
                    </div>
                  </div>
                </WorkflowPanelSection>
              </WorkflowPanel>
            </div>
          </div>
        )}

        {/* AI/ML Intelligence */}
        {activeDemo === 'ai-intelligence' && (
          <div className='space-y-8'>
            <SmartDashboard
              intelligence={intelligenceLevel}
              adaptiveContent={true}
              realtime={true}
              learningMode={true}
            />

            <div className='grid gap-6 lg:grid-cols-2'>
              <WorkflowPanel
                title='Neural Network Training'
                description='Real-time ML model training and monitoring'
              >
                <WorkflowPanelSection>
                  <div className='space-y-4'>
                    <ModelCard
                      modelName='Advanced SEO Predictor v2.1'
                      modelType='Transformer'
                      accuracy={0.98}
                      loss={0.11}
                      epochs={50}
                      trainingProgress={100}
                      status='completed'
                      lastUpdated='2025-01-15T10:30:00Z'
                    />
                    <NeuralNetworkVisualizer layers={networkArchitecture} size='md' />
                  </div>
                </WorkflowPanelSection>
              </WorkflowPanel>

              <WorkflowPanel
                title='Training Analytics'
                description='Comprehensive model performance metrics'
              >
                <WorkflowPanelSection>
                  <MetricsChart
                    data={trainingData}
                    title='SEO Predictor Training Progress'
                    showValidation={true}
                    height='md'
                  />
                </WorkflowPanelSection>
              </WorkflowPanel>
            </div>

            <ResearchIntegration
              activeWorkflows={[
                'data-science-research-workflow',
                'neural-network-dashboard-workflow',
              ]}
              status='active'
            />
          </div>
        )}

        {/* Enterprise Governance */}
        {activeDemo === 'enterprise' && (
          <EnterpriseProvider
            tenantId='demo-organization'
            tenantName='LightDom Demo Corp'
            tier={userTier}
          >
            <EnterpriseDashboard showGovernance={true} showAnalytics={true} />
          </EnterpriseProvider>
        )}

        {/* System Architecture */}
        {activeDemo === 'architecture' && (
          <div className='space-y-8'>
            <WorkflowPanel
              title='Micro-Frontend Architecture'
              description='Modular application structure with independent deployments'
            >
              <WorkflowPanelSection>
                <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-4'>
                  <div className='text-center p-6 rounded-3xl border border-primary/30 bg-primary-container/10'>
                    <Layers className='h-12 w-12 text-primary mx-auto mb-3' />
                    <div className='md3-title-medium text-on-surface mb-2'>Dashboard Core</div>
                    <div className='md3-body-small text-on-surface-variant'>
                      Main application shell with routing
                    </div>
                  </div>
                  <div className='text-center p-6 rounded-3xl border border-success/30 bg-success-container/10'>
                    <Brain className='h-12 w-12 text-success mx-auto mb-3' />
                    <div className='md3-title-medium text-on-surface mb-2'>AI/ML Engine</div>
                    <div className='md3-body-small text-on-surface-variant'>
                      Neural network processing and insights
                    </div>
                  </div>
                  <div className='text-center p-6 rounded-3xl border border-warning/30 bg-warning-container/10'>
                    <BarChart3 className='h-12 w-12 text-warning mx-auto mb-3' />
                    <div className='md3-title-medium text-on-surface mb-2'>Analytics Portal</div>
                    <div className='md3-body-small text-on-surface-variant'>
                      Data visualization and monitoring
                    </div>
                  </div>
                  <div className='text-center p-6 rounded-3xl border border-tertiary/30 bg-tertiary-container/10'>
                    <Shield className='h-12 w-12 text-tertiary mx-auto mb-3' />
                    <div className='md3-title-medium text-on-surface mb-2'>Admin Console</div>
                    <div className='md3-body-small text-on-surface-variant'>
                      Enterprise governance and management
                    </div>
                  </div>
                </div>
              </WorkflowPanelSection>
            </WorkflowPanel>

            <EdgeHealth showDetails={true} />

            <WorkflowPanel
              title='Advanced State Management'
              description='Sophisticated global state with offline support and AI optimization'
            >
              <WorkflowPanelSection>
                <div className='grid gap-6 md:grid-cols-3'>
                  <div className='p-4 rounded-2xl border border-outline bg-surface'>
                    <div className='md3-title-small text-on-surface mb-2'>Reducer Pattern</div>
                    <div className='md3-body-medium text-on-surface-variant'>
                      Predictable state updates with comprehensive action types and middleware
                    </div>
                  </div>
                  <div className='p-4 rounded-2xl border border-outline bg-surface'>
                    <div className='md3-title-small text-on-surface mb-2'>Offline Resilience</div>
                    <div className='md3-body-medium text-on-surface-variant'>
                      Service workers, pending actions, and intelligent cache management
                    </div>
                  </div>
                  <div className='p-4 rounded-2xl border border-outline bg-surface'>
                    <div className='md3-title-small text-on-surface mb-2'>AI Optimization</div>
                    <div className='md3-body-medium text-on-surface-variant'>
                      Machine learning-driven state optimization and predictive loading
                    </div>
                  </div>
                </div>
              </WorkflowPanelSection>
            </WorkflowPanel>
          </div>
        )}

        {/* Performance Analytics */}
        {activeDemo === 'performance' && (
          <div className='space-y-8'>
            <DesignSystemAnalytics realtime={true} showCharts={true} />

            <SystemHealthDashboard />

            <DesignSystemQA status='passed' autoRun={true} interval={30000} />
          </div>
        )}

        {/* Research Automation */}
        {activeDemo === 'research' && (
          <AdvancedResearch
            modalities={['text', 'image', 'video', 'code', 'design']}
            platforms={['web', 'mobile', 'desktop', 'tablet']}
            domains={['ui', 'ux', 'performance', 'accessibility', 'ai', 'security']}
            realtime={true}
          />
        )}

        {/* Workflow Automation */}
        {activeDemo === 'workflows' && (
          <div className='space-y-6'>
            <WorkflowPanel
              title='Intelligent Workflow Orchestration'
              description='AI-powered automation with quality gates and continuous learning'
            >
              <WorkflowPanelSection>
                <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6'>
                  <div className='p-4 rounded-2xl border border-primary/30 bg-primary-container/10'>
                    <Settings className='h-8 w-8 text-primary mb-3' />
                    <div className='md3-title-small text-on-surface mb-2'>Component Generation</div>
                    <div className='md3-body-small text-on-surface-variant'>
                      Automated MD3 component creation with AI assistance
                    </div>
                  </div>

                  <div className='p-4 rounded-2xl border border-success/30 bg-success-container/10'>
                    <Brain className='h-8 w-8 text-success mb-3' />
                    <div className='md3-title-small text-on-surface mb-2'>Research Automation</div>
                    <div className='md3-body-small text-on-surface-variant'>
                      Continuous ML research and framework monitoring
                    </div>
                  </div>

                  <div className='p-4 rounded-2xl border border-warning/30 bg-warning-container/10'>
                    <RefreshCw className='h-8 w-8 text-warning mb-3' />
                    <div className='md3-title-small text-on-surface mb-2'>Deployment Pipeline</div>
                    <div className='md3-body-small text-on-surface-variant'>
                      Quality-gated deployment with rollback capabilities
                    </div>
                  </div>

                  <div className='p-4 rounded-2xl border border-tertiary/30 bg-tertiary-container/10'>
                    <Activity className='h-8 w-8 text-tertiary mb-3' />
                    <div className='md3-title-small text-on-surface mb-2'>System Integration</div>
                    <div className='md3-body-small text-on-surface-variant'>
                      Complete system orchestration and validation
                    </div>
                  </div>
                </div>

                <div className='flex items-center justify-center gap-4'>
                  <Button variant='outlined'>View Workflow Status</Button>
                  <Button variant='outlined'>Configure Automation</Button>
                  <Button>Execute Full Pipeline</Button>
                </div>
              </WorkflowPanelSection>
            </WorkflowPanel>

            <WorkflowPanel
              title='Workflow Performance Metrics'
              description='Real-time automation efficiency and success rates'
            >
              <WorkflowPanelSection>
                <div className='grid gap-4 md:grid-cols-4'>
                  <div className='text-center p-4 rounded-2xl border border-outline bg-surface'>
                    <div className='md3-title-large text-on-surface font-semibold mb-1'>94%</div>
                    <div className='md3-body-small text-on-surface-variant'>Success Rate</div>
                  </div>
                  <div className='text-center p-4 rounded-2xl border border-outline bg-surface'>
                    <div className='md3-title-large text-on-surface font-semibold mb-1'>2.3s</div>
                    <div className='md3-body-small text-on-surface-variant'>Avg Execution</div>
                  </div>
                  <div className='text-center p-4 rounded-2xl border border-outline bg-surface'>
                    <div className='md3-title-large text-on-surface font-semibold mb-1'>247</div>
                    <div className='md3-body-small text-on-surface-variant'>Runs Today</div>
                  </div>
                  <div className='text-center p-4 rounded-2xl border border-outline bg-surface'>
                    <div className='md3-title-large text-on-surface font-semibold mb-1'>0</div>
                    <div className='md3-body-small text-on-surface-variant'>Failures</div>
                  </div>
                </div>
              </WorkflowPanelSection>
            </WorkflowPanel>
          </div>
        )}
      </main>

      {/* Master Footer */}
      <footer className='border-t border-outline bg-surface-container px-8 py-6'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-6'>
            <div className='text-center'>
              <div className='md3-headline-small text-on-surface font-semibold'>LightDom v2.0</div>
              <div className='md3-body-small text-on-surface-variant'>
                Enterprise AI/ML Design System
              </div>
            </div>

            <div className='flex items-center gap-4'>
              <div className='flex items-center gap-2'>
                <CheckCircle className='h-4 w-4 text-success' />
                <span className='md3-label-medium text-on-surface-variant'>Production Ready</span>
              </div>
              <div className='flex items-center gap-2'>
                <Brain className='h-4 w-4 text-primary' />
                <span className='md3-label-medium text-on-surface-variant'>AI Enhanced</span>
              </div>
              <div className='flex items-center gap-2'>
                <Shield className='h-4 w-4 text-tertiary' />
                <span className='md3-label-medium text-on-surface-variant'>Enterprise Secure</span>
              </div>
            </div>
          </div>

          <div className='flex items-center gap-6'>
            <div className='text-right'>
              <div className='md3-label-small text-on-surface-variant'>Components</div>
              <div className='md3-label-medium text-on-surface font-medium'>30+ Active</div>
            </div>
            <div className='text-right'>
              <div className='md3-label-small text-on-surface-variant'>Intelligence</div>
              <div className='md3-label-medium text-on-surface font-medium capitalize'>
                {intelligenceLevel}
              </div>
            </div>
            <div className='text-right'>
              <div className='md3-label-small text-on-surface-variant'>Uptime</div>
              <div className='md3-label-medium text-success font-medium'>99.9%</div>
            </div>
            <div className='text-right'>
              <div className='md3-label-small text-on-surface-variant'>Version</div>
              <div className='md3-label-medium text-on-surface font-medium'>v2.0.0</div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
