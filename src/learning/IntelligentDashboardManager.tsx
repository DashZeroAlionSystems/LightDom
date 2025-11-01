import React, { useState, useEffect, useMemo } from 'react';
import { SelfLearningDashboard, useSelfLearning } from './SelfLearningSystem';
import {
  // All dashboard components
  DashboardPage,
  SEOModelTrainingPage,
  ClientDashboardPage,
  AdminDashboardPage,
  NeuralNetworkDashboardPage,
  DesignSystemShowcasePage,
  MasterDesignSystemDemo,
  ComprehensiveSystemDemo
} from '@/components/dashboards';
import {
  // Layout components
  WorkflowPanel,
  WorkflowPanelSection,
  WorkflowPanelFooter,
  KpiGrid,
  KpiCard,

  // UI components
  Button,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Badge,

  // Icons
  Brain,
  BarChart3,
  Settings,
  Users,
  Activity,
  TrendingUp,
  Zap,
  Target,
  Eye,
  RefreshCw,
  Maximize2,
  Minimize2
} from '@/components/ui';

// Dashboard Registry
interface DashboardConfig {
  id: string;
  name: string;
  description: string;
  component: React.ComponentType;
  category: 'business' | 'technical' | 'system' | 'demo';
  permissions: string[];
  features: string[];
  complexity: 'basic' | 'intermediate' | 'advanced';
}

const DASHBOARD_REGISTRY: DashboardConfig[] = [
  {
    id: 'overview',
    name: 'System Overview',
    description: 'Complete system health and key metrics dashboard',
    component: DashboardPage,
    category: 'business',
    permissions: [],
    features: ['kpi-cards', 'health-status', 'recent-activity'],
    complexity: 'basic'
  },
  {
    id: 'seo-training',
    name: 'SEO Training',
    description: 'Machine learning model training and optimization for SEO',
    component: SEOModelTrainingPage,
    category: 'technical',
    permissions: ['ml.access'],
    features: ['model-training', 'performance-metrics', 'data-visualization'],
    complexity: 'advanced'
  },
  {
    id: 'client-dashboard',
    name: 'Client Portal',
    description: 'Client-specific metrics and performance insights',
    component: ClientDashboardPage,
    category: 'business',
    permissions: ['client.access'],
    features: ['client-metrics', 'performance-reports', 'custom-views'],
    complexity: 'intermediate'
  },
  {
    id: 'admin-console',
    name: 'Admin Console',
    description: 'System administration and governance dashboard',
    component: AdminDashboardPage,
    category: 'system',
    permissions: ['admin.access'],
    features: ['user-management', 'system-config', 'audit-logs'],
    complexity: 'advanced'
  },
  {
    id: 'neural-network',
    name: 'Neural Network Hub',
    description: 'Advanced AI/ML model management and monitoring',
    component: NeuralNetworkDashboardPage,
    category: 'technical',
    permissions: ['ml.access', 'advanced.access'],
    features: ['model-registry', 'training-monitor', 'architecture-viz'],
    complexity: 'advanced'
  },
  {
    id: 'design-showcase',
    name: 'Design System',
    description: 'Component library and design system showcase',
    component: DesignSystemShowcasePage,
    category: 'system',
    permissions: [],
    features: ['component-demo', 'variant-showcase', 'documentation'],
    complexity: 'intermediate'
  },
  {
    id: 'master-demo',
    name: 'Master Demo',
    description: 'Comprehensive system demonstration with all features',
    component: MasterDesignSystemDemo,
    category: 'demo',
    permissions: [],
    features: ['full-system', 'interactive-demo', 'feature-showcase'],
    complexity: 'advanced'
  },
  {
    id: 'comprehensive-demo',
    name: 'Comprehensive Demo',
    description: 'Complete system overview with all capabilities',
    component: ComprehensiveSystemDemo,
    category: 'demo',
    permissions: [],
    features: ['system-overview', 'capability-demo', 'integration-showcase'],
    complexity: 'advanced'
  }
];

// Intelligent Dashboard Manager
interface DashboardManagerProps {
  userId: string;
  userPermissions?: string[];
  userTier?: 'starter' | 'professional' | 'enterprise';
  currentDashboard?: string;
  onDashboardChange?: (dashboardId: string) => void;
}

export const IntelligentDashboardManager: React.FC<DashboardManagerProps> = ({
  userId,
  userPermissions = [],
  userTier = 'professional',
  currentDashboard = 'overview',
  onDashboardChange
}) => {
  const { getInsights, getLayout, getAnalytics, recordInteraction } = useSelfLearning();
  const [activeDashboard, setActiveDashboard] = useState(currentDashboard);
  const [dashboardMode, setDashboardMode] = useState<'normal' | 'focus' | 'compare'>('normal');
  const [showInsights, setShowInsights] = useState(true);

  // Get available dashboards based on permissions and tier
  const availableDashboards = useMemo(() => {
    return DASHBOARD_REGISTRY.filter(dashboard => {
      // Check permissions
      if (dashboard.permissions.length > 0) {
        const hasPermission = dashboard.permissions.some(perm => userPermissions.includes(perm));
        if (!hasPermission) return false;
      }

      // Check tier (simplified tier hierarchy)
      const tierLevels = { starter: 1, professional: 2, enterprise: 3 };
      const requiredTier = tierLevels[dashboard.category === 'system' ? 'professional' : 'starter'];
      const userTierLevel = tierLevels[userTier];

      return userTierLevel >= requiredTier;
    });
  }, [userPermissions, userTier]);

  // Get personalized layout for current dashboard
  const currentLayout = getLayout(userId, activeDashboard);
  const dashboardInsights = getInsights(userId, activeDashboard);
  const learningAnalytics = getAnalytics();

  // Get dashboard recommendations based on user behavior
  const dashboardRecommendations = useMemo(() => {
    const recommendations = [];
    const recentInteractions = Array.from(new Set(
      // Get recent dashboard interactions (simplified)
      availableDashboards.map(d => d.id)
    ));

    // Recommend based on usage patterns
    if (currentLayout?.preferredComponents.includes('analytics')) {
      recommendations.push({
        dashboard: 'performance-analytics',
        reason: 'Based on your analytics preferences',
        confidence: 0.85
      });
    }

    if (dashboardInsights.some(i => i.type === 'performance')) {
      recommendations.push({
        dashboard: 'system-health',
        reason: 'Performance insights detected',
        confidence: 0.92
      });
    }

    return recommendations;
  }, [currentLayout, dashboardInsights, availableDashboards]);

  const handleDashboardChange = (dashboardId: string) => {
    setActiveDashboard(dashboardId);
    onDashboardChange?.(dashboardId);

    // Record the interaction
    recordInteraction({
      userId,
      dashboard: dashboardId,
      component: 'dashboard-manager',
      action: 'switch',
      context: { from: activeDashboard, to: dashboardId }
    });
  };

  const getCurrentDashboardConfig = () => {
    return DASHBOARD_REGISTRY.find(d => d.id === activeDashboard);
  };

  const currentConfig = getCurrentDashboardConfig();

  return (
    <div className="min-h-screen bg-surface">
      {/* Intelligent Header */}
      <header className="border-b border-outline bg-surface-container-high px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-tertiary text-on-primary">
              <Brain className="h-6 w-6" />
            </div>
            <div>
              <h1 className="md3-headline-large text-on-surface">
                Intelligent Dashboard Hub
              </h1>
              <p className="md3-body-medium text-on-surface-variant mt-1">
                AI-powered dashboard management with personalized insights
              </p>
            </div>
          </div>

          {/* System Status */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-primary animate-pulse" />
              <span className="md3-label-medium text-on-surface">AI Active</span>
            </div>

            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-success" />
              <span className="md3-label-medium text-on-surface">
                {learningAnalytics.totalInteractions} Interactions
              </span>
            </div>

            <div className="px-3 py-1 rounded-full bg-primary-container text-on-primary-container">
              <span className="md3-label-small font-medium">
                {availableDashboards.length} Dashboards Available
              </span>
            </div>
          </div>
        </div>

        {/* Dashboard Navigation with Intelligence */}
        <div className="flex items-center gap-4 mt-6">
          <div className="flex gap-2 overflow-x-auto">
            {availableDashboards.map(dashboard => (
              <button
                key={dashboard.id}
                onClick={() => handleDashboardChange(dashboard.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                  activeDashboard === dashboard.id
                    ? 'bg-primary text-on-primary shadow-lg'
                    : 'text-on-surface hover:bg-surface-container'
                }`}
              >
                <BarChart3 className="h-4 w-4" />
                <span className="md3-label-medium font-medium">{dashboard.name}</span>
                {dashboard.complexity === 'advanced' && (
                  <Badge variant="secondary" className="text-xs">Advanced</Badge>
                )}
              </button>
            ))}
          </div>

          {/* Mode Controls */}
          <div className="flex items-center gap-2 ml-4">
            <button
              onClick={() => setDashboardMode('normal')}
              className={`px-3 py-1 rounded text-sm ${
                dashboardMode === 'normal' ? 'bg-primary text-on-primary' : 'bg-surface text-on-surface'
              }`}
            >
              Normal
            </button>
            <button
              onClick={() => setDashboardMode('focus')}
              className={`px-3 py-1 rounded text-sm ${
                dashboardMode === 'focus' ? 'bg-primary text-on-primary' : 'bg-surface text-on-surface'
              }`}
            >
              Focus
            </button>
            <button
              onClick={() => setDashboardMode('compare')}
              className={`px-3 py-1 rounded text-sm ${
                dashboardMode === 'compare' ? 'bg-primary text-on-primary' : 'bg-surface text-on-surface'
              }`}
            >
              Compare
            </button>
          </div>
        </div>

        {/* AI Insights Bar */}
        {dashboardInsights.length > 0 && showInsights && (
          <div className="mt-4 p-4 rounded-2xl bg-primary-container/10 border border-primary/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Zap className="h-5 w-5 text-primary" />
                <span className="md3-title-medium text-on-surface">
                  {dashboardInsights.length} AI Insights Available
                </span>
                <div className="flex gap-2">
                  {dashboardInsights.slice(0, 3).map((insight, index) => (
                    <Badge
                      key={insight.id}
                      variant={
                        insight.impact === 'critical' ? 'destructive' :
                        insight.impact === 'high' ? 'secondary' :
                        'outline'
                      }
                      className="text-xs"
                    >
                      {insight.type}
                    </Badge>
                  ))}
                  {dashboardInsights.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{dashboardInsights.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowInsights(false)}
              >
                Hide Insights
              </Button>
            </div>
          </div>
        )}

        {/* Dashboard Recommendations */}
        {dashboardRecommendations.length > 0 && (
          <div className="mt-4 flex gap-4">
            {dashboardRecommendations.map((rec, index) => (
              <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-success-container/10 border border-success/30">
                <Target className="h-4 w-4 text-success" />
                <div>
                  <div className="md3-label-medium text-on-surface font-medium">
                    Try {rec.dashboard.replace('-', ' ')}
                  </div>
                  <div className="md3-body-small text-on-surface-variant">
                    {rec.reason} ({Math.round(rec.confidence * 100)}% confidence)
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDashboardChange(rec.dashboard)}
                >
                  Switch
                </Button>
              </div>
            ))}
          </div>
        )}
      </header>

      {/* Main Dashboard Content */}
      <main className="flex-1 p-8">
        <SelfLearningDashboard
          userId={userId}
          dashboard={activeDashboard}
          className="space-y-6"
        >
          {/* Dashboard Metadata */}
          {currentConfig && (
            <WorkflowPanel title={`${currentConfig.name} Dashboard`} description={currentConfig.description}>
              <WorkflowPanelSection>
                <div className="grid gap-6 md:grid-cols-3">
                  <div className="text-center p-4 rounded-2xl border border-outline bg-surface">
                    <div className="md3-title-medium text-on-surface mb-1">{currentConfig.category}</div>
                    <div className="md3-body-small text-on-surface-variant capitalize">Category</div>
                  </div>
                  <div className="text-center p-4 rounded-2xl border border-outline bg-surface">
                    <div className="md3-title-medium text-on-surface mb-1 capitalize">{currentConfig.complexity}</div>
                    <div className="md3-body-small text-on-surface-variant">Complexity</div>
                  </div>
                  <div className="text-center p-4 rounded-2xl border border-outline bg-surface">
                    <div className="md3-title-medium text-on-surface mb-1">{currentConfig.features.length}</div>
                    <div className="md3-body-small text-on-surface-variant">Key Features</div>
                  </div>
                </div>
              </WorkflowPanelSection>
              <WorkflowPanelFooter>
                <div className="flex items-center justify-between w-full">
                  <div className="flex flex-wrap gap-2">
                    {currentConfig.features.map(feature => (
                      <Badge key={feature} variant="secondary" className="text-xs">
                        {feature.replace('-', ' ')}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4 mr-2" />
                      Customize
                    </Button>
                  </div>
                </div>
              </WorkflowPanelFooter>
            </WorkflowPanel>
          )}

          {/* Render Active Dashboard */}
          {(() => {
            const DashboardComponent = DASHBOARD_REGISTRY.find(d => d.id === activeDashboard)?.component;
            return DashboardComponent ? <DashboardComponent /> : (
              <div className="flex items-center justify-center p-12">
                <div className="text-center">
                  <BarChart3 className="h-16 w-16 text-outline-variant mx-auto mb-4" />
                  <h3 className="md3-headline-small text-on-surface mb-2">Dashboard Not Found</h3>
                  <p className="md3-body-medium text-on-surface-variant">
                    The requested dashboard is not available or you don't have permission to access it.
                  </p>
                </div>
              </div>
            );
          })()}
        </SelfLearningDashboard>
      </main>

      {/* Intelligent Footer */}
      <footer className="border-t border-outline bg-surface-container px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="md3-headline-small text-on-surface font-semibold">LightDom AI</div>
              <div className="md3-body-small text-on-surface-variant">Intelligent Dashboard Management</div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-primary" />
                <span className="md3-label-medium text-on-surface-variant">Learning Active</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-success" />
                <span className="md3-label-medium text-on-surface-variant">
                  {learningAnalytics.learningPatterns} Patterns Learned
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-tertiary" />
                <span className="md3-label-medium text-on-surface-variant">
                  {learningAnalytics.insightsGenerated} Insights Generated
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="md3-label-small text-on-surface-variant">Active Dashboard</div>
              <div className="md3-label-medium text-on-surface font-medium">
                {currentConfig?.name || 'Unknown'}
              </div>
            </div>
            <div className="text-right">
              <div className="md3-label-small text-on-surface-variant">Learning Mode</div>
              <div className="md3-label-medium text-primary font-medium">Adaptive</div>
            </div>
            <div className="text-right">
              <div className="md3-label-small text-on-surface-variant">Last Updated</div>
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

// Export dashboard registry for external use
export { DASHBOARD_REGISTRY };
export type { DashboardConfig, DashboardManagerProps };
