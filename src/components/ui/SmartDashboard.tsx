import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Brain, TrendingUp, Zap, Target, Eye, Clock, Users, Activity } from 'lucide-react';

const smartDashboardVariants = cva(
  'relative rounded-3xl border border-outline-variant bg-surface-container-high p-6 transition-all duration-medium-2 ease-emphasized',
  {
    variants: {
      intelligence: {
        basic: 'border-outline-variant',
        adaptive: 'border-primary/30 bg-primary-container/10',
        predictive: 'border-success/30 bg-success-container/10',
        autonomous: 'border-warning/30 bg-warning-container/10'
      }
    },
    defaultVariants: {
      intelligence: 'adaptive'
    }
  }
);

export interface SmartDashboardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof smartDashboardVariants> {
  userId?: string;
  context?: 'dashboard' | 'analytics' | 'admin' | 'research';
  realtime?: boolean;
  learningMode?: boolean;
  adaptiveContent?: boolean;
}

// AI-powered insights and predictions
interface AIInsight {
  id: string;
  type: 'prediction' | 'recommendation' | 'anomaly' | 'optimization';
  title: string;
  description: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high' | 'critical';
  action?: string;
  timestamp: Date;
}

const SmartDashboard: React.FC<SmartDashboardProps> = ({
  userId = 'default',
  context = 'dashboard',
  realtime = true,
  learningMode = true,
  adaptiveContent = true,
  intelligence = 'adaptive',
  className,
  children,
  ...props
}) => {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [userBehavior, setUserBehavior] = useState({
    pageViews: 0,
    interactions: 0,
    timeSpent: 0,
    preferences: {} as Record<string, any>
  });
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [learningProgress, setLearningProgress] = useState(0);

  // AI-powered behavior tracking
  useEffect(() => {
    if (!learningMode) return;

    const trackBehavior = () => {
      setUserBehavior(prev => ({
        ...prev,
        pageViews: prev.pageViews + 1,
        interactions: prev.interactions + Math.floor(Math.random() * 3),
        timeSpent: prev.timeSpent + 5
      }));
    };

    const interval = setInterval(trackBehavior, 10000); // Track every 10 seconds
    return () => clearInterval(interval);
  }, [learningMode]);

  // AI-powered insights generation
  const generateInsights = useCallback(() => {
    const mockInsights: AIInsight[] = [
      {
        id: '1',
        type: 'prediction',
        title: 'Peak Usage Predicted',
        description: 'Based on historical data, expect 40% increase in dashboard usage between 2-4 PM today.',
        confidence: 0.87,
        impact: 'medium',
        action: 'Consider scaling resources',
        timestamp: new Date()
      },
      {
        id: '2',
        type: 'recommendation',
        title: 'Component Optimization',
        description: 'WorkflowPanel component usage has increased 25%. Consider lazy loading for better performance.',
        confidence: 0.92,
        impact: 'high',
        action: 'Implement lazy loading',
        timestamp: new Date(Date.now() - 300000)
      },
      {
        id: '3',
        type: 'anomaly',
        title: 'Unusual Error Rate',
        description: 'Error rate spiked to 2.1% in the last 15 minutes, 3x above normal.',
        confidence: 0.95,
        impact: 'critical',
        action: 'Investigate immediately',
        timestamp: new Date(Date.now() - 900000)
      },
      {
        id: '4',
        type: 'optimization',
        title: 'Memory Usage Alert',
        description: 'Component memory usage is approaching 80% threshold. Consider optimization.',
        confidence: 0.78,
        impact: 'medium',
        action: 'Review component lifecycle',
        timestamp: new Date(Date.now() - 1800000)
      }
    ];

    setInsights(mockInsights.slice(0, intelligence === 'autonomous' ? 4 : intelligence === 'predictive' ? 3 : 2));
  }, [intelligence]);

  // AI-powered content adaptation
  const adaptiveLayout = useMemo(() => {
    if (!adaptiveContent) return 'default';

    // AI logic for layout adaptation based on user behavior
    if (userBehavior.interactions > 10) return 'detailed';
    if (userBehavior.timeSpent > 300) return 'comprehensive';
    if (insights.some(i => i.impact === 'critical')) return 'alert-focused';

    return 'balanced';
  }, [adaptiveContent, userBehavior, insights]);

  // AI-powered suggestions
  useEffect(() => {
    if (!learningMode) return;

    const suggestions = [];

    if (userBehavior.interactions < 5) {
      suggestions.push('Try exploring different dashboard sections for better insights');
    }

    if (insights.some(i => i.type === 'anomaly')) {
      suggestions.push('Check system health dashboard for potential issues');
    }

    if (context === 'dashboard' && userBehavior.pageViews > 3) {
      suggestions.push('Consider creating custom KPI views for your workflow');
    }

    setAiSuggestions(suggestions);
  }, [userBehavior, insights, context, learningMode]);

  // Learning progress simulation
  useEffect(() => {
    if (!learningMode) return;

    const progress = Math.min(100, (userBehavior.interactions * 2) + (userBehavior.pageViews * 5));
    setLearningProgress(progress);
  }, [userBehavior, learningMode]);

  useEffect(() => {
    generateInsights();
  }, [generateInsights]);

  const getInsightIcon = (type: AIInsight['type']) => {
    switch (type) {
      case 'prediction': return <TrendingUp className="h-4 w-4 text-primary" />;
      case 'recommendation': return <Target className="h-4 w-4 text-success" />;
      case 'anomaly': return <AlertCircle className="h-4 w-4 text-error" />;
      case 'optimization': return <Zap className="h-4 w-4 text-warning" />;
    }
  };

  const getImpactColor = (impact: AIInsight['impact']) => {
    switch (impact) {
      case 'low': return 'text-outline-variant';
      case 'medium': return 'text-warning';
      case 'high': return 'text-primary';
      case 'critical': return 'text-error';
    }
  };

  return (
    <div className={cn(smartDashboardVariants({ intelligence }), className)} {...props}>
      {/* AI Status Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={cn(
            'flex h-10 w-10 items-center justify-center rounded-full',
            intelligence === 'autonomous' ? 'bg-warning text-on-warning' :
            intelligence === 'predictive' ? 'bg-success text-on-success' :
            'bg-primary text-on-primary'
          )}>
            <Brain className="h-5 w-5" />
          </div>
          <div>
            <h3 className="md3-title-large text-on-surface">Smart Dashboard</h3>
            <p className="md3-body-medium text-on-surface-variant">
              AI-powered insights and adaptive content
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="md3-label-small text-on-surface-variant">AI Learning</div>
            <div className="md3-label-medium text-on-surface font-medium">{learningProgress}%</div>
          </div>

          <div className="text-right">
            <div className="md3-label-small text-on-surface-variant">Intelligence</div>
            <div className="md3-label-medium text-on-surface font-medium capitalize">{intelligence}</div>
          </div>

          {realtime && (
            <div className="flex items-center gap-2">
              <div className="inline-flex h-2 w-2 rounded-full bg-success animate-pulse" />
              <span className="md3-label-small text-success">Live</span>
            </div>
          )}
        </div>
      </div>

      {/* AI Insights Panel */}
      {insights.length > 0 && (
        <div className="mb-6">
          <h4 className="md3-title-small text-on-surface mb-4 flex items-center gap-2">
            <Activity className="h-4 w-4" />
            AI Insights ({insights.length})
          </h4>
          <div className="space-y-3">
            {insights.map((insight) => (
              <div key={insight.id} className="flex items-start gap-3 rounded-2xl border border-outline bg-surface p-4">
                <div className="flex-shrink-0 mt-0.5">
                  {getInsightIcon(insight.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h5 className="md3-title-small text-on-surface font-medium">{insight.title}</h5>
                    <div className="flex items-center gap-2">
                      <span className={cn('md3-label-small capitalize', getImpactColor(insight.impact))}>
                        {insight.impact}
                      </span>
                      <span className="md3-label-small text-on-surface-variant">
                        {(insight.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                  <p className="md3-body-medium text-on-surface-variant mb-2">{insight.description}</p>
                  {insight.action && (
                    <button className="md3-label-medium text-primary hover:text-primary/80 transition-colors">
                      {insight.action} →
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Suggestions */}
      {aiSuggestions.length > 0 && (
        <div className="mb-6 rounded-2xl border border-primary/30 bg-primary-container/10 p-4">
          <h4 className="md3-title-small text-on-primary-container mb-2 flex items-center gap-2">
            <Eye className="h-4 w-4" />
            AI Suggestions
          </h4>
          <ul className="space-y-1">
            {aiSuggestions.map((suggestion, index) => (
              <li key={index} className="md3-body-medium text-on-primary-container/90 flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                {suggestion}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Adaptive Content Layout */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h4 className="md3-title-small text-on-surface">Content Layout</h4>
          <div className="flex items-center gap-2">
            <span className="md3-label-small text-on-surface-variant">Adaptive:</span>
            <span className="md3-label-small text-primary capitalize">{adaptiveLayout}</span>
          </div>
        </div>

        {/* User Behavior Metrics */}
        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-outline bg-surface p-4 text-center">
            <div className="md3-title-medium text-on-surface font-semibold mb-1">{userBehavior.pageViews}</div>
            <div className="md3-body-small text-on-surface-variant">Page Views</div>
          </div>
          <div className="rounded-2xl border border-outline bg-surface p-4 text-center">
            <div className="md3-title-medium text-on-surface font-semibold mb-1">{userBehavior.interactions}</div>
            <div className="md3-body-small text-on-surface-variant">Interactions</div>
          </div>
          <div className="rounded-2xl border border-outline bg-surface p-4 text-center">
            <div className="md3-title-medium text-on-surface font-semibold mb-1">{Math.floor(userBehavior.timeSpent / 60)}m</div>
            <div className="md3-body-small text-on-surface-variant">Time Spent</div>
          </div>
          <div className="rounded-2xl border border-outline bg-surface p-4 text-center">
            <div className="md3-title-medium text-on-surface font-semibold mb-1">{insights.length}</div>
            <div className="md3-body-small text-on-surface-variant">AI Insights</div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="min-h-96 rounded-2xl border-2 border-dashed border-outline p-8 text-center">
          <div className="max-w-md mx-auto">
            <Brain className="h-16 w-16 text-primary mx-auto mb-4 opacity-50" />
            <h3 className="md3-headline-small text-on-surface mb-2">Adaptive Content Area</h3>
            <p className="md3-body-medium text-on-surface-variant">
              This area adapts based on user behavior, AI insights, and contextual relevance.
              Content is dynamically optimized for better user experience.
            </p>
            <div className="mt-6 grid gap-3 md:grid-cols-2">
              <div className="rounded-lg border border-outline p-3">
                <div className="md3-label-medium text-on-surface mb-1">Current Layout</div>
                <div className="md3-body-small text-on-surface-variant capitalize">{adaptiveLayout}</div>
              </div>
              <div className="rounded-lg border border-outline p-3">
                <div className="md3-label-medium text-on-surface mb-1">AI Confidence</div>
                <div className="md3-body-small text-on-surface-variant">
                  {intelligence === 'autonomous' ? '95%' :
                   intelligence === 'predictive' ? '87%' :
                   intelligence === 'adaptive' ? '76%' : 'N/A'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Learning Progress */}
      <div className="mt-6 pt-6 border-t border-outline">
        <div className="flex items-center justify-between mb-3">
          <div className="md3-label-medium text-on-surface">AI Learning Progress</div>
          <div className="md3-label-medium text-on-surface">{learningProgress}%</div>
        </div>
        <div className="w-full bg-surface-container rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-500"
            style={{ width: `${learningProgress}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="md3-body-small text-on-surface-variant">
            Learning from user behavior and system patterns
          </span>
          <span className="md3-body-small text-on-surface-variant">
            {intelligence === 'autonomous' ? 'Fully Autonomous' :
             intelligence === 'predictive' ? 'Predictive Mode' :
             intelligence === 'adaptive' ? 'Adaptive Learning' : 'Basic Mode'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default SmartDashboard;
