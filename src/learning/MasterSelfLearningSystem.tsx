import React, { useState, useEffect } from 'react';
import {
  // Self-Learning System
  SelfLearningDashboard,
  LearningAnalyticsDashboard,
  useSelfLearning,

  // Intelligent Dashboard Manager
  IntelligentDashboardManager,

  // Predictive Analytics
  PredictiveDashboard,
  usePredictiveAnalytics,

  // Core UI Components
  WorkflowPanel,
  WorkflowPanelSection,
  WorkflowPanelFooter,
  KpiGrid,
  KpiCard,
  Button,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,

  // Icons
  Brain,
  TrendingUp,
  Activity,
  Settings,
  BarChart3,
  Zap,
  Target,
  Eye,
  RefreshCw,
  Cpu,
  Database,
  Globe
} from '@/components/ui';

// Master Self-Learning Dashboard System
export const MasterSelfLearningSystem: React.FC = () => {
  const [activeView, setActiveView] = useState('overview');
  const [systemStatus, setSystemStatus] = useState('learning');

  // Self-learning hooks
  const { isLearning, toggleLearning, getAnalytics, recordInteraction } = useSelfLearning();
  const { recordMetric, getAnalyticsInsights } = usePredictiveAnalytics();

  // System metrics
  const learningAnalytics = getAnalytics();
  const predictiveInsights = getAnalyticsInsights();

  // Simulate real-time system activity
  useEffect(() => {
    const simulateActivity = () => {
      // Record user interactions
      recordInteraction({
        userId: 'system-user',
        dashboard: 'master-system',
        component: 'system-monitor',
        action: 'activity-check',
        context: { view: activeView }
      });

      // Record system metrics
      recordMetric('system-activity', Math.floor(Math.random() * 100) + 50);
      recordMetric('learning-progress', learningAnalytics.totalInteractions / 100);
      recordMetric('prediction-accuracy', 0.85 + Math.random() * 0.1);
    };

    simulateActivity();
    const interval = setInterval(simulateActivity, 30000); // Every 30 seconds
    return () => clearInterval(interval);
  }, [activeView, recordInteraction, recordMetric, learningAnalytics.totalInteractions]);

  const systemViews = [
    { id: 'overview', name: 'System Overview', icon: BarChart3, description: 'Complete learning system status' },
    { id: 'learning', name: 'Self-Learning', icon: Brain, description: 'AI-powered learning dashboard' },
    { id: 'predictive', name: 'Predictive Analytics', icon: TrendingUp, description: 'Forecasting and anomaly detection' },
    { id: 'management', name: 'Dashboard Management', icon: Settings, description: 'Intelligent dashboard orchestration' },
    { id: 'analytics', name: 'Learning Analytics', icon: Activity, description: 'Comprehensive learning insights' }
  ];

  const systemKpis = [
    {
      label: 'Learning Interactions',
      value: learningAnalytics.totalInteractions.toLocaleString(),
      delta: '+12% from last hour',
      tone: 'primary' as const,
      icon: <Brain className="h-4 w-4" />
    },
    {
      label: 'Learned Patterns',
      value: learningAnalytics.learningPatterns.toString(),
      delta: 'Behavioral insights',
      tone: 'success' as const,
      icon: <Target className="h-4 w-4" />
    },
    {
      label: 'Active Forecasts',
      value: predictiveInsights.length.toString(),
      delta: 'Predictive models',
      tone: 'warning' as const,
      icon: <TrendingUp className="h-4 w-4" />
    },
    {
      label: 'System Intelligence',
      value: isLearning ? 'Adaptive' : 'Static',
      delta: 'Learning mode',
      tone: 'tertiary' as const,
      icon: <Zap className="h-4 w-4" />
    }
  ];

  return (
    <div className="min-h-screen bg-surface">
      {/* Master System Header */}
      <header className="border-b border-outline bg-surface-container-high px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary via-tertiary to-success text-on-primary">
              <Brain className="h-6 w-6" />
            </div>
            <div>
              <h1 className="md3-headline-large text-on-surface">
                LightDom Self-Learning Dashboard System
              </h1>
              <p className="md3-body-medium text-on-surface-variant mt-1">
                AI-powered dashboard management with continuous learning and predictive analytics
              </p>
            </div>
          </div>

          {/* System Status Indicators */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className={`inline-flex h-3 w-3 rounded-full animate-pulse ${
                isLearning ? 'bg-success' : 'bg-outline-variant'
              }`} />
              <span className="md3-label-medium text-on-surface">
                {isLearning ? 'Learning Active' : 'Learning Paused'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              <span className="md3-label-medium text-on-surface">
                {learningAnalytics.activeUsers} Active Learners
              </span>
            </div>

            <div className="px-3 py-1 rounded-full bg-primary-container text-on-primary-container">
              <span className="md3-label-small font-medium">
                v2.0 INTELLIGENT
              </span>
            </div>
          </div>
        </div>

        {/* Learning Mode Controls */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-4">
            <span className="md3-label-medium text-on-surface-variant">Learning Mode:</span>
            <button
              onClick={toggleLearning}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                isLearning
                  ? 'bg-success text-on-success'
                  : 'bg-outline-variant text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              {isLearning ? '🧠 Learning Active' : '⏸️ Learning Paused'}
            </button>
          </div>

          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4 text-primary" />
              <span className="text-on-surface-variant">Real-time monitoring</span>
            </div>
            <div className="flex items-center gap-1">
              <Target className="h-4 w-4 text-success" />
              <span className="text-on-surface-variant">Adaptive layouts</span>
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4 text-warning" />
              <span className="text-on-surface-variant">Predictive insights</span>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="border-b border-outline bg-surface px-8 py-4">
        <div className="flex gap-2 overflow-x-auto">
          {systemViews.map(view => (
            <button
              key={view.id}
              onClick={() => setActiveView(view.id)}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                activeView === view.id
                  ? 'bg-primary text-on-primary shadow-lg'
                  : 'text-on-surface hover:bg-surface-container'
              }`}
            >
              <view.icon className="h-4 w-4" />
              <div className="text-left">
                <div className="md3-label-medium font-medium">{view.name}</div>
                <div className="md3-body-small opacity-80">{view.description}</div>
              </div>
            </button>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-8">
        {/* System Overview */}
        {activeView === 'overview' && (
          <div className="space-y-8">
            {/* System KPIs */}
            <KpiGrid columns={4}>
              {systemKpis.map((kpi, index) => (
                <KpiCard key={index} {...kpi} />
              ))}
            </KpiGrid>

            {/* System Architecture Overview */}
            <WorkflowPanel title="Self-Learning System Architecture" description="Complete overview of the intelligent dashboard ecosystem">
              <WorkflowPanelSection>
                <div className="grid gap-6 lg:grid-cols-4">
                  <div className="text-center p-6 rounded-3xl border border-primary/30 bg-primary-container/10">
                    <Brain className="h-12 w-12 text-primary mx-auto mb-3" />
                    <div className="md3-title-medium text-on-surface mb-2">Self-Learning Engine</div>
                    <div className="md3-body-small text-on-surface-variant">
                      AI-powered behavioral analysis and pattern recognition
                    </div>
                  </div>

                  <div className="text-center p-6 rounded-3xl border border-success/30 bg-success-container/10">
                    <TrendingUp className="h-12 w-12 text-success mx-auto mb-3" />
                    <div className="md3-title-medium text-on-surface mb-2">Predictive Analytics</div>
                    <div className="md3-body-small text-on-surface-variant">
                      Forecasting and anomaly detection for proactive insights
                    </div>
                  </div>

                  <div className="text-center p-6 rounded-3xl border border-warning/30 bg-warning-container/10">
                    <Settings className="h-12 w-12 text-warning mx-auto mb-3" />
                    <div className="md3-title-medium text-on-surface mb-2">Intelligent Management</div>
                    <div className="md3-body-small text-on-surface-variant">
                      Adaptive dashboard orchestration and personalization
                    </div>
                  </div>

                  <div className="text-center p-6 rounded-3xl border border-tertiary/30 bg-tertiary-container/10">
                    <BarChart3 className="h-12 w-12 text-tertiary mx-auto mb-3" />
                    <div className="md3-title-medium text-on-surface mb-2">Learning Analytics</div>
                    <div className="md3-body-small text-on-surface-variant">
                      Comprehensive insights into system learning and performance
                    </div>
                  </div>
                </div>
              </WorkflowPanelSection>
            </WorkflowPanel>

            {/* System Health Status */}
            <WorkflowPanel title="System Health & Learning Progress" description="Real-time monitoring of the self-learning system's performance">
              <WorkflowPanelSection>
                <div className="grid gap-6 lg:grid-cols-3">
                  <div className="text-center p-6 rounded-2xl border border-outline bg-surface">
                    <div className="md3-title-large text-on-surface font-semibold mb-2">
                      {learningAnalytics.totalInteractions.toLocaleString()}
                    </div>
                    <div className="md3-body-small text-on-surface-variant mb-3">Total Learning Interactions</div>
                    <div className="w-full bg-surface-container rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: '75%' }} />
                    </div>
                  </div>

                  <div className="text-center p-6 rounded-2xl border border-outline bg-surface">
                    <div className="md3-title-large text-on-surface font-semibold mb-2">
                      {learningAnalytics.learningPatterns}
                    </div>
                    <div className="md3-body-small text-on-surface-variant mb-3">Learned Behavioral Patterns</div>
                    <div className="w-full bg-surface-container rounded-full h-2">
                      <div className="bg-success h-2 rounded-full" style={{ width: '60%' }} />
                    </div>
                  </div>

                  <div className="text-center p-6 rounded-2xl border border-outline bg-surface">
                    <div className="md3-title-large text-on-surface font-semibold mb-2">
                      {predictiveInsights.length}
                    </div>
                    <div className="md3-body-small text-on-surface-variant mb-3">Active Predictive Insights</div>
                    <div className="w-full bg-surface-container rounded-full h-2">
                      <div className="bg-warning h-2 rounded-full" style={{ width: '85%' }} />
                    </div>
                  </div>
                </div>
              </WorkflowPanelSection>
              <WorkflowPanelFooter>
                <div className="flex items-center justify-between w-full">
                  <span className="md3-label-medium text-on-surface-variant">
                    System continuously learns from {learningAnalytics.activeUsers} active users
                  </span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh Data
                    </Button>
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4 mr-2" />
                      System Config
                    </Button>
                  </div>
                </div>
              </WorkflowPanelFooter>
            </WorkflowPanel>
          </div>
        )}

        {/* Self-Learning Dashboard */}
        {activeView === 'learning' && (
          <SelfLearningDashboard
            userId="master-user"
            dashboard="learning-system"
            className="space-y-6"
          >
            <div className="text-center py-12">
              <Brain className="h-16 w-16 text-primary mx-auto mb-4" />
              <h2 className="md3-headline-small text-on-surface mb-2">Self-Learning Dashboard Active</h2>
              <p className="md3-body-medium text-on-surface-variant">
                This dashboard is continuously learning from your interactions and adapting its layout and content.
              </p>
            </div>
          </SelfLearningDashboard>
        )}

        {/* Predictive Analytics */}
        {activeView === 'predictive' && (
          <PredictiveDashboard />
        )}

        {/* Intelligent Dashboard Management */}
        {activeView === 'management' && (
          <IntelligentDashboardManager
            userId="master-user"
            userPermissions={['admin.access', 'ml.access', 'analytics.access']}
            userTier="enterprise"
            currentDashboard="overview"
          />
        )}

        {/* Learning Analytics */}
        {activeView === 'analytics' && (
          <LearningAnalyticsDashboard />
        )}
      </main>

      {/* Intelligent Footer */}
      <footer className="border-t border-outline bg-surface-container px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="md3-headline-small text-on-surface font-semibold">LightDom AI</div>
              <div className="md3-body-small text-on-surface-variant">Self-Learning Dashboard Ecosystem</div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-primary animate-pulse" />
                <span className="md3-label-medium text-on-surface-variant">
                  Learning: {isLearning ? 'Active' : 'Paused'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-success" />
                <span className="md3-label-medium text-on-surface-variant">
                  {learningAnalytics.totalInteractions} Interactions Processed
                </span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-warning" />
                <span className="md3-label-medium text-on-surface-variant">
                  {predictiveInsights.length} Predictive Insights
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="md3-label-small text-on-surface-variant">System Status</div>
              <div className="md3-label-medium text-success font-medium">Operational</div>
            </div>
            <div className="text-right">
              <div className="md3-label-small text-on-surface-variant">Intelligence Level</div>
              <div className="md3-label-medium text-primary font-medium">Adaptive</div>
            </div>
            <div className="text-right">
              <div className="md3-label-small text-on-surface-variant">Last Learning Cycle</div>
              <div className="md3-label-medium text-on-surface font-medium">
                {new Date().toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Export the master system
export default MasterSelfLearningSystem;
