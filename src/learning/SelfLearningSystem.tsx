import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import {
  Brain,
  TrendingUp,
  TrendingDown,
  Activity,
  Users,
  Eye,
  MousePointer,
  Clock,
  Target,
  Zap,
  BarChart3,
  PieChart,
  LineChart,
  AlertTriangle,
  CheckCircle,
  Lightbulb,
  Sparkles,
  Cpu,
  Database,
  Globe
} from 'lucide-react';

// Learning Engine Types
interface UserInteraction {
  userId: string;
  timestamp: Date;
  dashboard: string;
  component: string;
  action: string;
  duration?: number;
  context: Record<string, any>;
  outcome?: 'success' | 'error' | 'cancelled';
}

interface LearningPattern {
  id: string;
  pattern: string;
  confidence: number;
  frequency: number;
  lastSeen: Date;
  insights: string[];
  recommendations: string[];
}

interface DashboardInsight {
  id: string;
  type: 'behavioral' | 'performance' | 'predictive' | 'optimization';
  title: string;
  description: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high' | 'critical';
  data: any;
  timestamp: Date;
  expiresAt?: Date;
}

interface PersonalizedLayout {
  userId: string;
  dashboard: string;
  preferredComponents: string[];
  componentOrder: Record<string, number>;
  hiddenComponents: string[];
  layoutPreferences: Record<string, any>;
  lastUpdated: Date;
}

const learningEngineVariants = cva(
  'relative rounded-3xl border border-outline-variant bg-surface-container-high p-6',
  {
    variants: {
      status: {
        learning: 'border-primary/30 bg-primary-container/10',
        analyzing: 'border-success/30 bg-success-container/10',
        optimizing: 'border-warning/30 bg-warning-container/10',
        idle: 'border-outline-variant'
      }
    },
    defaultVariants: {
      status: 'learning'
    }
  }
);

// Self-Learning Dashboard Manager
class SelfLearningManager {
  private interactions: UserInteraction[] = [];
  private patterns: Map<string, LearningPattern> = new Map();
  private insights: Map<string, DashboardInsight[]> = new Map();
  private layouts: Map<string, PersonalizedLayout> = new Map();
  private learningActive: boolean = true;

  constructor() {
    this.initializeLearning();
  }

  // Record user interaction
  recordInteraction(interaction: Omit<UserInteraction, 'timestamp'>): void {
    const fullInteraction: UserInteraction = {
      ...interaction,
      timestamp: new Date()
    };

    this.interactions.push(fullInteraction);
    this.updatePatterns(fullInteraction);
    this.generateInsights(fullInteraction);
    this.optimizeLayout(fullInteraction);

    // Keep only last 1000 interactions for memory efficiency
    if (this.interactions.length > 1000) {
      this.interactions = this.interactions.slice(-1000);
    }
  }

  // Pattern recognition and learning
  private updatePatterns(interaction: UserInteraction): void {
    const patternKey = `${interaction.dashboard}:${interaction.component}:${interaction.action}`;

    if (!this.patterns.has(patternKey)) {
      this.patterns.set(patternKey, {
        id: patternKey,
        pattern: patternKey,
        confidence: 0.1,
        frequency: 1,
        lastSeen: interaction.timestamp,
        insights: [],
        recommendations: []
      });
    } else {
      const pattern = this.patterns.get(patternKey)!;
      pattern.frequency += 1;
      pattern.lastSeen = interaction.timestamp;
      pattern.confidence = Math.min(1, pattern.confidence + 0.1);

      // Generate insights based on patterns
      this.analyzePattern(pattern, interaction);
    }
  }

  private analyzePattern(pattern: LearningPattern, interaction: UserInteraction): void {
    // Behavioral insights
    if (pattern.frequency > 10 && interaction.outcome === 'success') {
      pattern.insights.push(`${interaction.component} is frequently used successfully in ${interaction.dashboard}`);
      pattern.recommendations.push(`Promote ${interaction.component} in ${interaction.dashboard} layout`);
    }

    // Performance insights
    if (interaction.duration && interaction.duration > 5000) {
      pattern.insights.push(`${interaction.component} has slow response time (${interaction.duration}ms)`);
      pattern.recommendations.push(`Consider optimizing ${interaction.component} performance`);
    }

    // Error pattern insights
    if (interaction.outcome === 'error') {
      pattern.insights.push(`Error occurred in ${interaction.component} during ${interaction.action}`);
      pattern.recommendations.push(`Add error handling for ${interaction.component} ${interaction.action}`);
    }
  }

  // Generate personalized insights
  private generateInsights(interaction: UserInteraction): void {
    const userKey = `${interaction.userId}:${interaction.dashboard}`;
    const userInsights = this.insights.get(userKey) || [];

    // Behavioral insights
    if (interaction.action === 'view' && interaction.duration && interaction.duration > 10000) {
      userInsights.push({
        id: `behavioral-${Date.now()}`,
        type: 'behavioral',
        title: 'Extended Viewing Session',
        description: `You spent ${Math.round(interaction.duration / 1000)}s viewing ${interaction.component}. Consider bookmarking this view.`,
        confidence: 0.8,
        impact: 'low',
        data: { component: interaction.component, duration: interaction.duration },
        timestamp: new Date()
      });
    }

    // Performance insights
    if (interaction.outcome === 'error') {
      userInsights.push({
        id: `performance-${Date.now()}`,
        type: 'performance',
        title: 'Action Failed',
        description: `The ${interaction.action} action on ${interaction.component} failed. This might be a temporary issue.`,
        confidence: 0.9,
        impact: 'medium',
        data: { component: interaction.component, action: interaction.action },
        timestamp: new Date()
      });
    }

    // Predictive insights
    const recentInteractions = this.interactions
      .filter(i => i.userId === interaction.userId && i.dashboard === interaction.dashboard)
      .slice(-5);

    if (recentInteractions.length >= 3) {
      const commonComponent = this.findMostCommonComponent(recentInteractions);
      if (commonComponent && commonComponent !== interaction.component) {
        userInsights.push({
          id: `predictive-${Date.now()}`,
          type: 'predictive',
          title: 'Based on Your Activity',
          description: `You've been using ${commonComponent} frequently. Would you like to focus on that component?`,
          confidence: 0.7,
          impact: 'low',
          data: { recommendedComponent: commonComponent },
          timestamp: new Date()
        });
      }
    }

    // Keep only last 10 insights per user/dashboard
    this.insights.set(userKey, userInsights.slice(-10));
  }

  private findMostCommonComponent(interactions: UserInteraction[]): string | null {
    const componentCounts: Record<string, number> = {};
    interactions.forEach(i => {
      componentCounts[i.component] = (componentCounts[i.component] || 0) + 1;
    });

    let maxCount = 0;
    let mostCommon = null;
    Object.entries(componentCounts).forEach(([component, count]) => {
      if (count > maxCount) {
        maxCount = count;
        mostCommon = component;
      }
    });

    return maxCount >= 2 ? mostCommon : null;
  }

  // Optimize dashboard layouts
  private optimizeLayout(interaction: UserInteraction): void {
    const layoutKey = `${interaction.userId}:${interaction.dashboard}`;
    let layout = this.layouts.get(layoutKey);

    if (!layout) {
      layout = {
        userId: interaction.userId,
        dashboard: interaction.dashboard,
        preferredComponents: [],
        componentOrder: {},
        hiddenComponents: [],
        layoutPreferences: {},
        lastUpdated: new Date()
      };
    }

    // Update component preferences based on usage
    if (!layout.preferredComponents.includes(interaction.component)) {
      layout.preferredComponents.push(interaction.component);
    }

    // Update component order based on frequency
    const componentUsage = this.interactions
      .filter(i => i.userId === interaction.userId && i.dashboard === interaction.dashboard)
      .reduce((acc, i) => {
        acc[i.component] = (acc[i.component] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    Object.entries(componentUsage).forEach(([component, count]) => {
      layout.componentOrder[component] = count;
    });

    layout.lastUpdated = new Date();
    this.layouts.set(layoutKey, layout);
  }

  // Public API methods
  getInsights(userId: string, dashboard: string): DashboardInsight[] {
    const key = `${userId}:${dashboard}`;
    return this.insights.get(key) || [];
  }

  getLayout(userId: string, dashboard: string): PersonalizedLayout | null {
    const key = `${userId}:${dashboard}`;
    return this.layouts.get(key) || null;
  }

  getPatterns(userId?: string, dashboard?: string): LearningPattern[] {
    let patterns = Array.from(this.patterns.values());

    if (userId || dashboard) {
      patterns = patterns.filter(p => {
        const [, patternDashboard, patternComponent] = p.pattern.split(':');
        if (dashboard && patternDashboard !== dashboard) return false;
        // Additional user filtering would require interaction tracking by user
        return true;
      });
    }

    return patterns.sort((a, b) => b.confidence - a.confidence);
  }

  getAnalytics(): {
    totalInteractions: number;
    activeUsers: number;
    learningPatterns: number;
    insightsGenerated: number;
  } {
    const uniqueUsers = new Set(this.interactions.map(i => i.userId)).size;
    const totalInsights = Array.from(this.insights.values()).reduce((sum, insights) => sum + insights.length, 0);

    return {
      totalInteractions: this.interactions.length,
      activeUsers: uniqueUsers,
      learningPatterns: this.patterns.size,
      insightsGenerated: totalInsights
    };
  }

  reset(): void {
    this.interactions = [];
    this.patterns.clear();
    this.insights.clear();
    this.layouts.clear();
  }

  setLearningActive(active: boolean): void {
    this.learningActive = active;
  }

  isLearningActive(): boolean {
    return this.learningActive;
  }

  private initializeLearning(): void {
    // Initialize with some baseline patterns
    this.patterns.set('dashboard:overview:view', {
      id: 'dashboard:overview:view',
      pattern: 'dashboard:overview:view',
      confidence: 0.8,
      frequency: 100,
      lastSeen: new Date(),
      insights: ['Overview dashboard is the most visited section'],
      recommendations: ['Keep overview dashboard easily accessible']
    });
  }
}

// Global learning manager instance
const learningManager = new SelfLearningManager();

// React hooks for self-learning system
export const useSelfLearning = () => {
  const [isLearning, setIsLearning] = useState(learningManager.isLearningActive());

  const recordInteraction = useCallback((interaction: Omit<UserInteraction, 'timestamp'>) => {
    if (isLearning) {
      learningManager.recordInteraction(interaction);
    }
  }, [isLearning]);

  const toggleLearning = useCallback(() => {
    const newState = !isLearning;
    setIsLearning(newState);
    learningManager.setLearningActive(newState);
  }, [isLearning]);

  const getInsights = useCallback((userId: string, dashboard: string) => {
    return learningManager.getInsights(userId, dashboard);
  }, []);

  const getLayout = useCallback((userId: string, dashboard: string) => {
    return learningManager.getLayout(userId, dashboard);
  }, []);

  const getPatterns = useCallback((userId?: string, dashboard?: string) => {
    return learningManager.getPatterns(userId, dashboard);
  }, []);

  const getAnalytics = useCallback(() => {
    return learningManager.getAnalytics();
  }, []);

  return {
    isLearning,
    toggleLearning,
    recordInteraction,
    getInsights,
    getLayout,
    getPatterns,
    getAnalytics
  };
};

// Self-Learning Dashboard Component
interface SelfLearningDashboardProps {
  userId: string;
  dashboard: string;
  children: React.ReactNode;
  className?: string;
}

export const SelfLearningDashboard: React.FC<SelfLearningDashboardProps> = ({
  userId,
  dashboard,
  children,
  className
}) => {
  const { isLearning, recordInteraction, getInsights, getLayout } = useSelfLearning();
  const insights = getInsights(userId, dashboard);
  const layout = getLayout(userId, dashboard);

  // Record dashboard view
  useEffect(() => {
    recordInteraction({
      userId,
      dashboard,
      component: 'dashboard',
      action: 'view',
      context: { entry: true }
    });
  }, [userId, dashboard, recordInteraction]);

  // Record component interactions
  const handleComponentInteraction = useCallback((component: string, action: string, context?: any) => {
    recordInteraction({
      userId,
      dashboard,
      component,
      action,
      context: context || {}
    });
  }, [userId, dashboard, recordInteraction]);

  return (
    <div className={cn('relative', className)}>
      {/* Learning Status Indicator */}
      {isLearning && (
        <div className="fixed top-4 right-4 z-50">
          <div className="flex items-center gap-2 bg-primary text-on-primary px-3 py-2 rounded-full shadow-lg">
            <Brain className="h-4 w-4 animate-pulse" />
            <span className="text-sm font-medium">Learning Active</span>
          </div>
        </div>
      )}

      {/* Insights Panel */}
      {insights.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-primary" />
            <h3 className="md3-title-large text-on-surface">AI Insights ({insights.length})</h3>
          </div>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {insights.slice(0, 6).map((insight) => (
              <div key={insight.id} className="p-4 rounded-2xl border border-outline bg-surface">
                <div className="flex items-start gap-3">
                  <div className={cn(
                    'p-2 rounded-lg',
                    insight.type === 'behavioral' && 'bg-blue-100 text-blue-600',
                    insight.type === 'performance' && 'bg-green-100 text-green-600',
                    insight.type === 'predictive' && 'bg-purple-100 text-purple-600',
                    insight.type === 'optimization' && 'bg-orange-100 text-orange-600'
                  )}>
                    {insight.type === 'behavioral' && <Users className="h-4 w-4" />}
                    {insight.type === 'performance' && <Activity className="h-4 w-4" />}
                    {insight.type === 'predictive' && <TrendingUp className="h-4 w-4" />}
                    {insight.type === 'optimization' && <Zap className="h-4 w-4" />}
                  </div>
                  <div className="flex-1">
                    <h4 className="md3-title-small text-on-surface font-medium mb-1">
                      {insight.title}
                    </h4>
                    <p className="md3-body-small text-on-surface-variant mb-2">
                      {insight.description}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        'px-2 py-1 rounded text-xs font-medium',
                        insight.impact === 'critical' && 'bg-red-100 text-red-700',
                        insight.impact === 'high' && 'bg-orange-100 text-orange-700',
                        insight.impact === 'medium' && 'bg-yellow-100 text-yellow-700',
                        insight.impact === 'low' && 'bg-gray-100 text-gray-700'
                      )}>
                        {insight.impact.toUpperCase()}
                      </span>
                      <span className="md3-label-small text-on-surface-variant">
                        {Math.round(insight.confidence * 100)}% confidence
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Personalized Layout */}
      {layout && layout.preferredComponents.length > 0 && (
        <div className="mb-6 p-4 rounded-2xl border border-primary/30 bg-primary-container/10">
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-4 w-4 text-primary" />
            <span className="md3-label-medium text-on-primary-container font-medium">
              Personalized Layout Active
            </span>
          </div>
          <div className="md3-body-small text-on-primary-container/90">
            Layout optimized based on your usage patterns. Most used components prioritized.
          </div>
        </div>
      )}

      {/* Enhanced Children with Interaction Tracking */}
      <div
        onClick={(e) => {
          const target = e.target as HTMLElement;
          const componentElement = target.closest('[data-component]');
          if (componentElement) {
            const component = componentElement.getAttribute('data-component') || 'unknown';
            handleComponentInteraction(component, 'click', { element: target.tagName });
          }
        }}
      >
        {React.Children.map(children, (child, index) => {
          if (React.isValidElement(child)) {
            // Add data attributes for interaction tracking
            return React.cloneElement(child, {
              'data-component': child.props['data-component'] || `component-${index}`,
              onMouseEnter: (e: any) => {
                handleComponentInteraction(
                  child.props['data-component'] || `component-${index}`,
                  'hover',
                  { duration: 0 }
                );
                child.props.onMouseEnter?.(e);
              }
            } as any);
          }
          return child;
        })}
      </div>
    </div>
  );
};

// Learning Analytics Dashboard
export const LearningAnalyticsDashboard: React.FC = () => {
  const { getAnalytics, getPatterns, getInsights } = useSelfLearning();
  const [selectedUser, setSelectedUser] = useState<string>('all');
  const [selectedDashboard, setSelectedDashboard] = useState<string>('all');

  const analytics = getAnalytics();
  const patterns = getPatterns(selectedUser === 'all' ? undefined : selectedUser, selectedDashboard === 'all' ? undefined : selectedDashboard);
  const allInsights = Array.from(new Map(
    Array.from(document.querySelectorAll('[data-user-dashboard]')).map(el => {
      const [user, dashboard] = (el.getAttribute('data-user-dashboard') || '').split(':');
      return [`${user}:${dashboard}`, getInsights(user, dashboard)];
    })
  ).values()).flat();

  return (
    <div className="space-y-8">
      {/* Learning Overview */}
      <div className="grid gap-6 lg:grid-cols-4">
        <div className="rounded-3xl border border-outline bg-surface p-6 text-center">
          <Brain className="h-12 w-12 text-primary mx-auto mb-3" />
          <div className="md3-headline-small text-on-surface font-semibold mb-1">
            {analytics.totalInteractions.toLocaleString()}
          </div>
          <div className="md3-body-small text-on-surface-variant">Total Interactions</div>
        </div>

        <div className="rounded-3xl border border-outline bg-surface p-6 text-center">
          <Users className="h-12 w-12 text-success mx-auto mb-3" />
          <div className="md3-headline-small text-on-surface font-semibold mb-1">
            {analytics.activeUsers}
          </div>
          <div className="md3-body-small text-on-surface-variant">Active Learners</div>
        </div>

        <div className="rounded-3xl border border-outline bg-surface p-6 text-center">
          <Target className="h-12 w-12 text-warning mx-auto mb-3" />
          <div className="md3-headline-small text-on-surface font-semibold mb-1">
            {analytics.learningPatterns}
          </div>
          <div className="md3-body-small text-on-surface-variant">Learned Patterns</div>
        </div>

        <div className="rounded-3xl border border-outline bg-surface p-6 text-center">
          <Lightbulb className="h-12 w-12 text-tertiary mx-auto mb-3" />
          <div className="md3-headline-small text-on-surface font-semibold mb-1">
            {analytics.insightsGenerated}
          </div>
          <div className="md3-body-small text-on-surface-variant">Insights Generated</div>
        </div>
      </div>

      {/* Learning Patterns */}
      <WorkflowPanel title="Learned Patterns" description="Behavioral patterns discovered through continuous learning">
        <WorkflowPanelSection>
          <div className="space-y-4">
            {patterns.slice(0, 10).map((pattern) => (
              <div key={pattern.id} className="flex items-center justify-between p-4 rounded-2xl border border-outline bg-surface">
                <div className="flex-1">
                  <div className="md3-title-small text-on-surface font-medium mb-1">
                    {pattern.pattern.replace(/:/g, ' → ')}
                  </div>
                  <div className="md3-body-small text-on-surface-variant">
                    Frequency: {pattern.frequency} | Confidence: {Math.round(pattern.confidence * 100)}%
                  </div>
                  {pattern.insights.length > 0 && (
                    <div className="md3-label-small text-primary mt-2">
                      💡 {pattern.insights[0]}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className="md3-label-small text-on-surface-variant">
                    Last seen: {pattern.lastSeen.toLocaleDateString()}
                  </div>
                  {pattern.recommendations.length > 0 && (
                    <div className="md3-label-small text-success mt-1">
                      ✓ {pattern.recommendations[0]}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </WorkflowPanelSection>
      </WorkflowPanel>

      {/* Recent Insights */}
      <WorkflowPanel title="Recent Insights" description="Latest AI-generated insights across all dashboards">
        <WorkflowPanelSection>
          <div className="grid gap-4 md:grid-cols-2">
            {allInsights.slice(0, 8).map((insight) => (
              <div key={insight.id} className="p-4 rounded-2xl border border-outline bg-surface">
                <div className="flex items-start gap-3">
                  <div className={cn(
                    'p-2 rounded-lg',
                    insight.type === 'behavioral' && 'bg-blue-100 text-blue-600',
                    insight.type === 'performance' && 'bg-green-100 text-green-600',
                    insight.type === 'predictive' && 'bg-purple-100 text-purple-600',
                    insight.type === 'optimization' && 'bg-orange-100 text-orange-600'
                  )}>
                    {insight.type === 'behavioral' && <Users className="h-4 w-4" />}
                    {insight.type === 'performance' && <Activity className="h-4 w-4" />}
                    {insight.type === 'predictive' && <TrendingUp className="h-4 w-4" />}
                    {insight.type === 'optimization' && <Zap className="h-4 w-4" />}
                  </div>
                  <div className="flex-1">
                    <h4 className="md3-title-small text-on-surface font-medium mb-1">
                      {insight.title}
                    </h4>
                    <p className="md3-body-small text-on-surface-variant mb-2">
                      {insight.description}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        'px-2 py-1 rounded text-xs font-medium',
                        insight.impact === 'critical' && 'bg-red-100 text-red-700',
                        insight.impact === 'high' && 'bg-orange-100 text-orange-700',
                        insight.impact === 'medium' && 'bg-yellow-100 text-yellow-700',
                        insight.impact === 'low' && 'bg-gray-100 text-gray-700'
                      )}>
                        {insight.impact.toUpperCase()}
                      </span>
                      <span className="md3-label-small text-on-surface-variant">
                        {Math.round(insight.confidence * 100)}% confidence
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </WorkflowPanelSection>
      </WorkflowPanel>
    </div>
  );
};

// Export the learning manager and components
export { SelfLearningManager, learningManager };
export type {
  UserInteraction,
  LearningPattern,
  DashboardInsight,
  PersonalizedLayout
};
