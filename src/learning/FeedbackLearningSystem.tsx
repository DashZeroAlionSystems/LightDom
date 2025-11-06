import React, { useState, useCallback, useEffect } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { useMLPrediction } from '../ml/MLIntegration';
import {
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Brain,
  Target,
  Lightbulb,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';

const feedbackPanelVariants = cva(
  'relative rounded-3xl border border-outline-variant bg-surface-container-high p-6',
  {
    variants: {
      type: {
        feedback: 'border-primary/30 bg-primary-container/10',
        reinforcement: 'border-success/30 bg-success-container/10',
        evaluation: 'border-warning/30 bg-warning-container/10'
      }
    },
    defaultVariants: {
      type: 'feedback'
    }
  }
);

// User Feedback Types
interface UserFeedback {
  id: string;
  userId: string;
  insightId: string;
  rating: 'positive' | 'negative' | 'neutral';
  confidence?: number;
  usefulness: number; // 1-5 scale
  comments?: string;
  context: Record<string, any>;
  timestamp: Date;
  sessionId: string;
}

interface FeedbackAnalytics {
  totalFeedback: number;
  averageRating: number;
  positiveRate: number;
  improvementRate: number;
  commonThemes: Array<{
    theme: string;
    frequency: number;
    sentiment: 'positive' | 'negative' | 'neutral';
  }>;
  modelPerformance: Record<string, {
    accuracy: number;
    userSatisfaction: number;
    improvementSuggestions: string[];
  }>;
}

interface ReinforcementSignal {
  userId: string;
  action: string;
  context: Record<string, any>;
  reward: number; // -1 to 1 scale
  timestamp: Date;
  modelUsed: string;
  outcome: 'success' | 'partial' | 'failure';
}

// Feedback Collection and Analysis System
class FeedbackLearningSystem {
  private feedback: UserFeedback[] = [];
  private reinforcementSignals: ReinforcementSignal[] = [];
  private modelPerformance: Map<string, { correct: number; total: number; feedback: number[] }> = new Map();

  // Collect user feedback
  addFeedback(feedback: UserFeedback): void {
    this.feedback.push(feedback);

    // Update model performance
    if (feedback.confidence !== undefined) {
      const modelKey = feedback.context.model || 'general';
      if (!this.modelPerformance.has(modelKey)) {
        this.modelPerformance.set(modelKey, { correct: 0, total: 0, feedback: [] });
      }

      const performance = this.modelPerformance.get(modelKey)!;
      performance.total += 1;
      performance.feedback.push(feedback.usefulness);

      // Consider feedback > 3 as "correct" prediction
      if (feedback.usefulness >= 3) {
        performance.correct += 1;
      }
    }
  }

  // Add reinforcement signal
  addReinforcementSignal(signal: ReinforcementSignal): void {
    this.reinforcementSignals.push(signal);
  }

  // Analyze feedback patterns
  analyzeFeedback(): FeedbackAnalytics {
    if (this.feedback.length === 0) {
      return {
        totalFeedback: 0,
        averageRating: 0,
        positiveRate: 0,
        improvementRate: 0,
        commonThemes: [],
        modelPerformance: {}
      };
    }

    const totalFeedback = this.feedback.length;
    const averageRating = this.feedback.reduce((sum, f) => sum + f.usefulness, 0) / totalFeedback;
    const positiveRate = this.feedback.filter(f => f.rating === 'positive').length / totalFeedback;

    // Calculate improvement rate (feedback quality over time)
    const recentFeedback = this.feedback.slice(-50);
    const olderFeedback = this.feedback.slice(-100, -50);
    const improvementRate = recentFeedback.length > 0 && olderFeedback.length > 0
      ? (recentFeedback.reduce((sum, f) => sum + f.usefulness, 0) / recentFeedback.length) -
        (olderFeedback.reduce((sum, f) => sum + f.usefulness, 0) / olderFeedback.length)
      : 0;

    // Extract common themes from comments
    const themes = this.extractCommonThemes();

    // Model performance analysis
    const modelPerformance: Record<string, any> = {};
    this.modelPerformance.forEach((perf, model) => {
      const accuracy = perf.correct / perf.total;
      const avgFeedback = perf.feedback.reduce((a, b) => a + b, 0) / perf.feedback.length;

      modelPerformance[model] = {
        accuracy,
        userSatisfaction: avgFeedback / 5, // Normalize to 0-1
        improvementSuggestions: this.generateImprovementSuggestions(model, accuracy, avgFeedback)
      };
    });

    return {
      totalFeedback,
      averageRating,
      positiveRate,
      improvementRate,
      commonThemes: themes,
      modelPerformance
    };
  }

  private extractCommonThemes(): Array<{ theme: string; frequency: number; sentiment: 'positive' | 'negative' | 'neutral' }> {
    // Simple theme extraction (in production, use NLP)
    const themes: Record<string, { count: number; sentiment: Record<string, number> }> = {};

    this.feedback.forEach(f => {
      if (f.comments) {
        const words = f.comments.toLowerCase().split(/\s+/);
        words.forEach(word => {
          if (word.length > 3) { // Skip short words
            if (!themes[word]) {
              themes[word] = { count: 0, sentiment: { positive: 0, negative: 0, neutral: 0 } };
            }
            themes[word].count += 1;
            themes[word].sentiment[f.rating] += 1;
          }
        });
      }
    });

    return Object.entries(themes)
      .sort(([, a], [, b]) => b.count - a.count)
      .slice(0, 10)
      .map(([theme, data]) => ({
        theme,
        frequency: data.count,
        sentiment: Object.entries(data.sentiment)
          .sort(([, a], [, b]) => b - a)[0][0] as 'positive' | 'negative' | 'neutral'
      }));
  }

  private generateImprovementSuggestions(model: string, accuracy: number, satisfaction: number): string[] {
    const suggestions = [];

    if (accuracy < 0.7) {
      suggestions.push('Consider retraining with more diverse data');
    }

    if (satisfaction < 0.6) {
      suggestions.push('Improve prediction confidence thresholds');
      suggestions.push('Add more context to recommendations');
    }

    if (accuracy > 0.9 && satisfaction < 0.8) {
      suggestions.push('Focus on user experience and presentation');
    }

    if (suggestions.length === 0) {
      suggestions.push('Model performance is good, continue monitoring');
    }

    return suggestions;
  }

  // Generate reinforcement learning data
  generateReinforcementData(): ReinforcementSignal[] {
    return this.reinforcementSignals.slice(-100); // Last 100 signals
  }

  // Get personalized recommendations based on feedback
  getPersonalizedRecommendations(userId: string): Array<{
    type: string;
    title: string;
    description: string;
    confidence: number;
  }> {
    const userFeedback = this.feedback.filter(f => f.userId === userId);
    if (userFeedback.length < 5) {
      return [];
    }

    const avgRating = userFeedback.reduce((sum, f) => sum + f.usefulness, 0) / userFeedback.length;
    const preferredTypes = userFeedback.reduce((acc, f) => {
      acc[f.context.type || 'general'] = (acc[f.context.type || 'general'] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const recommendations = [];

    if (avgRating < 3) {
      recommendations.push({
        type: 'improvement',
        title: 'Feedback-Based Improvements',
        description: 'Based on your feedback, we\'re working to provide more relevant insights.',
        confidence: 0.8
      });
    }

    const topType = Object.entries(preferredTypes).sort(([, a], [, b]) => b - a)[0];
    if (topType && topType[1] > userFeedback.length * 0.3) {
      recommendations.push({
        type: 'personalization',
        title: 'More of What You Like',
        description: `We'll focus on providing more ${topType[0]} insights based on your preferences.`,
        confidence: 0.9
      });
    }

    return recommendations;
  }

  // Reset system (for testing)
  reset(): void {
    this.feedback = [];
    this.reinforcementSignals = [];
    this.modelPerformance.clear();
  }
}

// Global feedback system instance
const feedbackSystem = new FeedbackLearningSystem();

// React Components for User Feedback Collection
interface FeedbackCollectorProps {
  insightId: string;
  userId: string;
  context: Record<string, any>;
  onFeedbackSubmitted?: (feedback: UserFeedback) => void;
}

export const FeedbackCollector: React.FC<FeedbackCollectorProps> = ({
  insightId,
  userId,
  context,
  onFeedbackSubmitted
}) => {
  const [rating, setRating] = useState<'positive' | 'negative' | 'neutral' | null>(null);
  const [usefulness, setUsefulness] = useState<number>(3);
  const [comments, setComments] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!rating) return;

    const feedback: UserFeedback = {
      id: `feedback-${Date.now()}`,
      userId,
      insightId,
      rating,
      usefulness,
      comments: comments.trim() || undefined,
      context,
      timestamp: new Date(),
      sessionId: `session-${userId}-${Date.now()}`
    };

    feedbackSystem.addFeedback(feedback);

    // Send reinforcement signal
    const reward = rating === 'positive' ? 1 : rating === 'negative' ? -1 : 0;
    feedbackSystem.addReinforcementSignal({
      userId,
      action: 'feedback_submitted',
      context: { insightId, rating },
      reward,
      timestamp: new Date(),
      modelUsed: context.model || 'general',
      outcome: 'success'
    });

    setSubmitted(true);
    onFeedbackSubmitted?.(feedback);
  };

  if (submitted) {
    return (
      <div className="flex items-center gap-2 text-success">
        <CheckCircle className="h-4 w-4" />
        <span className="md3-body-small">Thank you for your feedback!</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4">
        <span className="md3-body-small text-on-surface-variant">How useful was this insight?</span>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map(num => (
            <button
              key={num}
              onClick={() => setUsefulness(num)}
              className={cn(
                'w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium transition-colors',
                usefulness >= num
                  ? 'bg-primary text-on-primary border-primary'
                  : 'border-outline text-on-surface-variant hover:border-primary'
              )}
            >
              {num}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setRating('positive')}
          className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors',
            rating === 'positive'
              ? 'bg-success text-on-success border-success'
              : 'border-outline text-on-surface-variant hover:border-success'
          )}
        >
          <ThumbsUp className="h-4 w-4" />
          <span className="md3-label-small">Helpful</span>
        </button>

        <button
          onClick={() => setRating('neutral')}
          className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors',
            rating === 'neutral'
              ? 'bg-warning text-on-warning border-warning'
              : 'border-outline text-on-surface-variant hover:border-warning'
          )}
        >
          <MessageSquare className="h-4 w-4" />
          <span className="md3-label-small">Neutral</span>
        </button>

        <button
          onClick={() => setRating('negative')}
          className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors',
            rating === 'negative'
              ? 'bg-error text-on-error border-error'
              : 'border-outline text-on-surface-variant hover:border-error'
          )}
        >
          <ThumbsDown className="h-4 w-4" />
          <span className="md3-label-small">Not Helpful</span>
        </button>
      </div>

      {rating && (
        <div className="space-y-2">
          <textarea
            placeholder="Any additional comments? (optional)"
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            className="w-full p-3 rounded-lg border border-outline bg-surface text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            rows={2}
          />
          <Button onClick={handleSubmit} size="sm">
            Submit Feedback
          </Button>
        </div>
      )}
    </div>
  );
};

// Feedback Analytics Dashboard
export const FeedbackAnalyticsDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<FeedbackAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading analytics
    const loadAnalytics = async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const data = feedbackSystem.analyzeFeedback();
      setAnalytics(data);
      setIsLoading(false);
    };

    loadAnalytics();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <RefreshCw className="h-8 w-8 animate-spin text-primary mr-3" />
        <div className="md3-title-medium text-on-surface">Analyzing feedback data...</div>
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="space-y-8">
      {/* Feedback Overview */}
      <WorkflowPanel title="Feedback Analytics Overview" description="User feedback analysis and model performance insights">
        <WorkflowPanelSection>
          <div className="grid gap-6 lg:grid-cols-4">
            <div className="text-center p-4 rounded-3xl border border-outline bg-surface">
              <BarChart3 className="h-12 w-12 text-primary mx-auto mb-3" />
              <div className="md3-headline-small text-on-surface font-semibold mb-1">
                {analytics.totalFeedback}
              </div>
              <div className="md3-body-small text-on-surface-variant">Total Feedback</div>
            </div>

            <div className="text-center p-4 rounded-3xl border border-outline bg-surface">
              <TrendingUp className="h-12 w-12 text-success mx-auto mb-3" />
              <div className="md3-headline-small text-on-surface font-semibold mb-1">
                {(analytics.averageRating * 20).toFixed(0)}%
              </div>
              <div className="md3-body-small text-on-surface-variant">Avg Satisfaction</div>
            </div>

            <div className="text-center p-4 rounded-3xl border border-outline bg-surface">
              <Target className="h-12 w-12 text-warning mx-auto mb-3" />
              <div className="md3-headline-small text-on-surface font-semibold mb-1">
                {(analytics.positiveRate * 100).toFixed(0)}%
              </div>
              <div className="md3-body-small text-on-surface-variant">Positive Rate</div>
            </div>

            <div className="text-center p-4 rounded-3xl border border-outline bg-surface">
              <Brain className="h-12 w-12 text-tertiary mx-auto mb-3" />
              <div className="md3-headline-small text-on-surface font-semibold mb-1">
                {analytics.improvementRate > 0 ? '+' : ''}{(analytics.improvementRate * 100).toFixed(1)}%
              </div>
              <div className="md3-body-small text-on-surface-variant">Improvement Rate</div>
            </div>
          </div>
        </WorkflowPanelSection>
      </WorkflowPanel>

      {/* Common Themes */}
      {analytics.commonThemes.length > 0 && (
        <WorkflowPanel title="Common Feedback Themes" description="Most frequently mentioned topics in user feedback">
          <WorkflowPanelSection>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {analytics.commonThemes.map((theme, index) => (
                <div key={index} className="p-4 rounded-2xl border border-outline bg-surface">
                  <div className="flex items-center justify-between mb-2">
                    <span className="md3-title-small text-on-surface font-medium capitalize">
                      {theme.theme}
                    </span>
                    <span className={cn(
                      'px-2 py-1 rounded text-xs font-medium',
                      theme.sentiment === 'positive' && 'bg-success/20 text-success',
                      theme.sentiment === 'negative' && 'bg-error/20 text-error',
                      theme.sentiment === 'neutral' && 'bg-warning/20 text-warning'
                    )}>
                      {theme.sentiment}
                    </span>
                  </div>
                  <div className="md3-body-small text-on-surface-variant">
                    Mentioned {theme.frequency} times
                  </div>
                </div>
              ))}
            </div>
          </WorkflowPanelSection>
        </WorkflowPanel>
      )}

      {/* Model Performance */}
      {Object.keys(analytics.modelPerformance).length > 0 && (
        <WorkflowPanel title="ML Model Performance" description="How well our AI models are performing based on user feedback">
          <WorkflowPanelSection>
            <div className="space-y-4">
              {Object.entries(analytics.modelPerformance).map(([model, perf]) => (
                <div key={model} className="p-4 rounded-2xl border border-outline bg-surface">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="md3-title-small text-on-surface font-medium capitalize">
                      {model.replace('-', ' ')}
                    </h4>
                    <div className="flex gap-2">
                      <span className="md3-label-small text-on-surface-variant">
                        {(perf.accuracy * 100).toFixed(1)}% accuracy
                      </span>
                      <span className="md3-label-small text-on-surface-variant">
                        {(perf.userSatisfaction * 100).toFixed(1)}% satisfaction
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-on-surface-variant">Model Accuracy</span>
                      <span className="text-on-surface font-medium">{(perf.accuracy * 100).toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-surface-container rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{ width: `${perf.accuracy * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2 mt-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-on-surface-variant">User Satisfaction</span>
                      <span className="text-on-surface font-medium">{(perf.userSatisfaction * 100).toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-surface-container rounded-full h-2">
                      <div
                        className="bg-success h-2 rounded-full"
                        style={{ width: `${perf.userSatisfaction * 100}%` }}
                      />
                    </div>
                  </div>

                  {perf.improvementSuggestions.length > 0 && (
                    <div className="mt-3">
                      <div className="md3-label-small text-on-surface-variant mb-2">Improvement Suggestions:</div>
                      <ul className="space-y-1">
                        {perf.improvementSuggestions.map((suggestion, idx) => (
                          <li key={idx} className="md3-body-small text-on-surface-variant flex items-start gap-2">
                            <span className="text-primary mt-0.5">•</span>
                            {suggestion}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </WorkflowPanelSection>
        </WorkflowPanel>
      )}
    </div>
  );
};

// Enhanced Insight Component with Feedback
interface FeedbackInsightProps {
  insight: {
    id: string;
    type: 'behavioral' | 'performance' | 'predictive' | 'optimization';
    title: string;
    description: string;
    confidence: number;
    impact: 'low' | 'medium' | 'high' | 'critical';
    data: any;
  };
  userId: string;
  context: Record<string, any>;
}

export const FeedbackInsight: React.FC<FeedbackInsightProps> = ({
  insight,
  userId,
  context
}) => {
  const [showFeedback, setShowFeedback] = useState(false);

  return (
    <div className="flex items-start gap-3 rounded-2xl border border-outline bg-surface p-4">
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
        <div className="flex items-start justify-between mb-2">
          <h5 className="md3-title-small text-on-surface font-medium">{insight.title}</h5>
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
            <button
              onClick={() => setShowFeedback(!showFeedback)}
              className="md3-label-small text-primary hover:text-primary/80"
            >
              {showFeedback ? 'Hide' : 'Feedback'}
            </button>
          </div>
        </div>

        <p className="md3-body-medium text-on-surface-variant mb-3">{insight.description}</p>

        <div className="flex items-center gap-2 mb-3">
          <span className="md3-label-small text-on-surface-variant">Confidence:</span>
          <span className="md3-label-small text-primary font-medium">
            {(insight.confidence * 100).toFixed(0)}%
          </span>
        </div>

        {showFeedback && (
          <FeedbackCollector
            insightId={insight.id}
            userId={userId}
            context={{ ...context, type: insight.type, model: 'insight-feedback' }}
          />
        )}
      </div>
    </div>
  );
};

// Export the feedback system
export { feedbackSystem };
export type { UserFeedback, FeedbackAnalytics, ReinforcementSignal, FeedbackCollectorProps, FeedbackInsightProps };
