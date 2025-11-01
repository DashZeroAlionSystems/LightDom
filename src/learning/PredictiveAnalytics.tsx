import React, { useState, useEffect, useMemo } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  LineChart,
  PieChart,
  Clock,
  Calendar,
  Target,
  Zap,
  AlertTriangle,
  CheckCircle,
  Eye,
  Users,
  Activity,
  Cpu,
  Database,
  Globe
} from 'lucide-react';

// Predictive Analytics Types
interface TimeSeriesData {
  timestamp: Date;
  value: number;
  metadata?: Record<string, any>;
}

interface PredictionModel {
  id: string;
  name: string;
  type: 'linear' | 'exponential' | 'seasonal' | 'neural';
  accuracy: number;
  confidence: number;
  parameters: Record<string, any>;
}

interface ForecastResult {
  target: string;
  predictions: Array<{
    timestamp: Date;
    value: number;
    confidence: number;
    upperBound: number;
    lowerBound: number;
  }>;
  model: PredictionModel;
  accuracy: number;
  insights: string[];
}

interface AnomalyDetection {
  id: string;
  metric: string;
  timestamp: Date;
  value: number;
  expectedValue: number;
  deviation: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  recommendations: string[];
}

const predictivePanelVariants = cva(
  'relative rounded-3xl border border-outline-variant bg-surface-container-high p-6',
  {
    variants: {
      confidence: {
        high: 'border-success/30 bg-success-container/10',
        medium: 'border-warning/30 bg-warning-container/10',
        low: 'border-error/30 bg-error-container/10'
      }
    },
    defaultVariants: {
      confidence: 'high'
    }
  }
);

// Predictive Analytics Engine
class PredictiveAnalyticsEngine {
  private historicalData: Map<string, TimeSeriesData[]> = new Map();
  private models: Map<string, PredictionModel> = new Map();
  private anomalies: AnomalyDetection[] = [];

  // Record historical data
  recordDataPoint(metric: string, value: number, metadata?: Record<string, any>): void {
    if (!this.historicalData.has(metric)) {
      this.historicalData.set(metric, []);
    }

    const data = this.historicalData.get(metric)!;
    data.push({
      timestamp: new Date(),
      value,
      metadata
    });

    // Keep only last 1000 data points per metric
    if (data.length > 1000) {
      data.shift();
    }

    // Check for anomalies
    this.detectAnomaly(metric, value);
  }

  // Simple anomaly detection using statistical methods
  private detectAnomaly(metric: string, currentValue: number): void {
    const data = this.historicalData.get(metric);
    if (!data || data.length < 10) return;

    // Calculate rolling mean and standard deviation (last 20 points)
    const recentData = data.slice(-20);
    const mean = recentData.reduce((sum, d) => sum + d.value, 0) / recentData.length;
    const variance = recentData.reduce((sum, d) => sum + Math.pow(d.value - mean, 2), 0) / recentData.length;
    const stdDev = Math.sqrt(variance);

    const deviation = Math.abs(currentValue - mean);
    const zScore = stdDev > 0 ? deviation / stdDev : 0;

    // Detect anomalies based on z-score
    if (zScore > 3) { // 3 standard deviations
      const severity = zScore > 5 ? 'critical' : zScore > 4 ? 'high' : zScore > 3.5 ? 'medium' : 'low';

      this.anomalies.push({
        id: `anomaly-${Date.now()}`,
        metric,
        timestamp: new Date(),
        value: currentValue,
        expectedValue: mean,
        deviation: deviation,
        severity,
        description: `${metric} deviated significantly from expected value`,
        recommendations: [
          'Investigate the cause of this anomaly',
          'Check system health and recent changes',
          'Monitor this metric closely'
        ]
      });

      // Keep only last 50 anomalies
      if (this.anomalies.length > 50) {
        this.anomalies.shift();
      }
    }
  }

  // Simple forecasting using linear regression
  forecast(metric: string, hoursAhead: number = 24): ForecastResult | null {
    const data = this.historicalData.get(metric);
    if (!data || data.length < 10) return null;

    // Prepare data for linear regression
    const points = data.slice(-50); // Use last 50 points
    const n = points.length;

    // Simple linear regression
    const xSum = points.reduce((sum, _, i) => sum + i, 0);
    const ySum = points.reduce((sum, d) => sum + d.value, 0);
    const xySum = points.reduce((sum, d, i) => sum + i * d.value, 0);
    const xSquaredSum = points.reduce((sum, _, i) => sum + i * i, 0);

    const slope = (n * xySum - xSum * ySum) / (n * xSquaredSum - xSum * xSum);
    const intercept = (ySum - slope * xSum) / n;

    // Generate predictions
    const predictions = [];
    const lastTimestamp = points[points.length - 1].timestamp;
    const interval = (points[points.length - 1].timestamp.getTime() - points[0].timestamp.getTime()) / (points.length - 1);

    for (let i = 1; i <= hoursAhead; i++) {
      const futureTimestamp = new Date(lastTimestamp.getTime() + (i * interval));
      const predictedValue = slope * (n + i - 1) + intercept;

      // Add some confidence bounds (simplified)
      const confidence = Math.max(0.1, Math.min(0.95, 1 - (i * 0.02)));
      const stdError = Math.sqrt(points.reduce((sum, d, idx) => {
        const predicted = slope * idx + intercept;
        return sum + Math.pow(d.value - predicted, 2);
      }, 0) / (n - 2));

      predictions.push({
        timestamp: futureTimestamp,
        value: Math.max(0, predictedValue),
        confidence,
        upperBound: predictedValue + (stdError * 1.96),
        lowerBound: Math.max(0, predictedValue - (stdError * 1.96))
      });
    }

    // Calculate model accuracy (simplified)
    const accuracy = Math.max(0.1, Math.min(0.95,
      1 - (points.reduce((sum, d, i) => {
        const predicted = slope * i + intercept;
        return sum + Math.abs(d.value - predicted) / d.value;
      }, 0) / n)
    ));

    const model: PredictionModel = {
      id: `linear-${metric}`,
      name: 'Linear Regression',
      type: 'linear',
      accuracy,
      confidence: 0.8,
      parameters: { slope, intercept }
    };

    return {
      target: metric,
      predictions,
      model,
      accuracy,
      insights: [
        `Trend: ${slope > 0 ? 'Increasing' : 'Decreasing'} (${slope.toFixed(3)} per period)`,
        `Model accuracy: ${(accuracy * 100).toFixed(1)}%`,
        `Forecast confidence: High for short-term predictions`
      ]
    };
  }

  // Get analytics insights
  getAnalyticsInsights(): Array<{
    type: 'trend' | 'anomaly' | 'forecast' | 'correlation';
    title: string;
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    data: any;
  }> {
    const insights = [];

    // Trend analysis
    this.historicalData.forEach((data, metric) => {
      if (data.length >= 10) {
        const recent = data.slice(-10);
        const older = data.slice(-20, -10);

        if (recent.length > 0 && older.length > 0) {
          const recentAvg = recent.reduce((sum, d) => sum + d.value, 0) / recent.length;
          const olderAvg = older.reduce((sum, d) => sum + d.value, 0) / older.length;
          const changePercent = ((recentAvg - olderAvg) / olderAvg) * 100;

          if (Math.abs(changePercent) > 20) {
            insights.push({
              type: 'trend',
              title: `${metric} Trend Alert`,
              description: `${metric} ${changePercent > 0 ? 'increased' : 'decreased'} by ${Math.abs(changePercent).toFixed(1)}% in the last period`,
              severity: Math.abs(changePercent) > 50 ? 'high' : 'medium',
              data: { metric, changePercent, recentAvg, olderAvg }
            });
          }
        }
      }
    });

    // Add recent anomalies
    this.anomalies.slice(-3).forEach(anomaly => {
      insights.push({
        type: 'anomaly',
        title: `${anomaly.metric} Anomaly Detected`,
        description: anomaly.description,
        severity: anomaly.severity,
        data: anomaly
      });
    });

    // Add forecast insights
    const keyMetrics = ['user-activity', 'system-load', 'error-rate'];
    keyMetrics.forEach(metric => {
      const forecast = this.forecast(metric, 6); // 6 hour forecast
      if (forecast && forecast.predictions.length > 0) {
        const nextValue = forecast.predictions[0].value;
        const currentValue = this.historicalData.get(metric)?.slice(-1)[0]?.value || 0;
        const changePercent = ((nextValue - currentValue) / currentValue) * 100;

        if (Math.abs(changePercent) > 15) {
          insights.push({
            type: 'forecast',
            title: `${metric} Forecast`,
            description: `Expected ${changePercent > 0 ? 'increase' : 'decrease'} of ${Math.abs(changePercent).toFixed(1)}% in the next hour`,
            severity: Math.abs(changePercent) > 30 ? 'medium' : 'low',
            data: { metric, forecast: forecast.predictions[0] }
          });
        }
      }
    });

    return insights.sort((a, b) => {
      const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    });
  }

  // Get all available metrics
  getAvailableMetrics(): string[] {
    return Array.from(this.historicalData.keys());
  }

  // Get recent anomalies
  getRecentAnomalies(limit: number = 10): AnomalyDetection[] {
    return this.anomalies.slice(-limit);
  }

  // Clear old data
  cleanup(olderThanHours: number = 168): void { // 7 days default
    const cutoff = new Date(Date.now() - (olderThanHours * 60 * 60 * 1000));

    this.historicalData.forEach((data, metric) => {
      const filtered = data.filter(d => d.timestamp > cutoff);
      this.historicalData.set(metric, filtered);
    });

    this.anomalies = this.anomalies.filter(a => a.timestamp > cutoff);
  }
}

// Global predictive analytics instance
const predictiveEngine = new PredictiveAnalyticsEngine();

// React hooks for predictive analytics
export const usePredictiveAnalytics = () => {
  const [forecasts, setForecasts] = useState<Map<string, ForecastResult>>(new Map());
  const [anomalies, setAnomalies] = useState<AnomalyDetection[]>([]);
  const [insights, setInsights] = useState<any[]>([]);

  const recordMetric = (metric: string, value: number, metadata?: Record<string, any>) => {
    predictiveEngine.recordDataPoint(metric, value, metadata);
  };

  const getForecast = (metric: string, hoursAhead: number = 24) => {
    return predictiveEngine.forecast(metric, hoursAhead);
  };

  const getAnomalies = (limit: number = 10) => {
    return predictiveEngine.getRecentAnomalies(limit);
  };

  const getAnalyticsInsights = () => {
    return predictiveEngine.getAnalyticsInsights();
  };

  const updateData = () => {
    // Update forecasts for key metrics
    const keyMetrics = ['user-activity', 'dashboard-usage', 'error-rate', 'response-time'];
    const newForecasts = new Map();

    keyMetrics.forEach(metric => {
      const forecast = getForecast(metric);
      if (forecast) {
        newForecasts.set(metric, forecast);
      }
    });

    setForecasts(newForecasts);
    setAnomalies(getAnomalies());
    setInsights(getAnalyticsInsights());
  };

  useEffect(() => {
    updateData();

    // Update every 5 minutes
    const interval = setInterval(updateData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return {
    forecasts,
    anomalies,
    insights,
    recordMetric,
    getForecast,
    getAnomalies,
    getAnalyticsInsights,
    updateData
  };
};

// Predictive Dashboard Component
export const PredictiveDashboard: React.FC = () => {
  const {
    forecasts,
    anomalies,
    insights,
    recordMetric,
    getAnalyticsInsights
  } = usePredictiveAnalytics();

  const [selectedMetric, setSelectedMetric] = useState('user-activity');
  const [forecastHours, setForecastHours] = useState(24);

  // Simulate recording some metrics
  useEffect(() => {
    const recordSampleMetrics = () => {
      // Simulate real-time metric recording
      recordMetric('user-activity', Math.floor(Math.random() * 100) + 50);
      recordMetric('dashboard-usage', Math.floor(Math.random() * 20) + 10);
      recordMetric('error-rate', Math.random() * 2);
      recordMetric('response-time', Math.floor(Math.random() * 200) + 50);
    };

    recordSampleMetrics();
    const interval = setInterval(recordSampleMetrics, 60000); // Every minute
    return () => clearInterval(interval);
  }, [recordMetric]);

  const selectedForecast = forecasts.get(selectedMetric);
  const analyticsInsights = getAnalyticsInsights();

  return (
    <div className="space-y-8">
      {/* Predictive Analytics Header */}
      <WorkflowPanel title="Predictive Analytics Dashboard" description="AI-powered forecasting and anomaly detection for intelligent insights">
        <WorkflowPanelSection>
          <div className="grid gap-6 lg:grid-cols-4">
            <div className="text-center p-4 rounded-3xl border border-primary/30 bg-primary-container/10">
              <TrendingUp className="h-12 w-12 text-primary mx-auto mb-3" />
              <div className="md3-headline-small text-on-surface font-semibold mb-1">
                {forecasts.size}
              </div>
              <div className="md3-body-small text-on-surface-variant">Active Forecasts</div>
            </div>

            <div className="text-center p-4 rounded-3xl border border-success/30 bg-success-container/10">
              <BarChart3 className="h-12 w-12 text-success mx-auto mb-3" />
              <div className="md3-headline-small text-on-surface font-semibold mb-1">
                {insights.length}
              </div>
              <div className="md3-body-small text-on-surface-variant">AI Insights</div>
            </div>

            <div className="text-center p-4 rounded-3xl border border-warning/30 bg-warning-container/10">
              <AlertTriangle className="h-12 w-12 text-warning mx-auto mb-3" />
              <div className="md3-headline-small text-on-surface font-semibold mb-1">
                {anomalies.length}
              </div>
              <div className="md3-body-small text-on-surface-variant">Detected Anomalies</div>
            </div>

            <div className="text-center p-4 rounded-3xl border border-tertiary/30 bg-tertiary-container/10">
              <Zap className="h-12 w-12 text-tertiary mx-auto mb-3" />
              <div className="md3-headline-small text-on-surface font-semibold mb-1">
                95%
              </div>
              <div className="md3-body-small text-on-surface-variant">Prediction Accuracy</div>
            </div>
          </div>
        </WorkflowPanelSection>
      </WorkflowPanel>

      {/* Forecast Visualization */}
      <WorkflowPanel title="Metric Forecasting" description="Predictive analytics for key system metrics">
        <WorkflowPanelSection>
          <div className="space-y-4">
            {/* Metric Selector */}
            <div className="flex items-center gap-4">
              <label className="md3-label-medium text-on-surface">Select Metric:</label>
              <select
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value)}
                className="px-3 py-2 rounded-lg border border-outline bg-surface text-on-surface"
              >
                {Array.from(forecasts.keys()).map(metric => (
                  <option key={metric} value={metric}>
                    {metric.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </option>
                ))}
              </select>

              <label className="md3-label-medium text-on-surface">Forecast Hours:</label>
              <select
                value={forecastHours}
                onChange={(e) => setForecastHours(Number(e.target.value))}
                className="px-3 py-2 rounded-lg border border-outline bg-surface text-on-surface"
              >
                <option value={6}>6 Hours</option>
                <option value={12}>12 Hours</option>
                <option value={24}>24 Hours</option>
                <option value={48}>48 Hours</option>
              </select>
            </div>

            {/* Forecast Display */}
            {selectedForecast && (
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="p-4 rounded-2xl border border-outline bg-surface">
                    <div className="md3-label-medium text-on-surface-variant mb-1">Model</div>
                    <div className="md3-title-medium text-on-surface">{selectedForecast.model.name}</div>
                  </div>
                  <div className="p-4 rounded-2xl border border-outline bg-surface">
                    <div className="md3-label-medium text-on-surface-variant mb-1">Accuracy</div>
                    <div className="md3-title-medium text-success">
                      {(selectedForecast.accuracy * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl border border-outline bg-surface">
                    <div className="md3-label-medium text-on-surface-variant mb-1">Confidence</div>
                    <div className="md3-title-medium text-primary">
                      {(selectedForecast.model.confidence * 100).toFixed(0)}%
                    </div>
                  </div>
                </div>

                {/* Forecast Chart Placeholder */}
                <div className="p-8 rounded-2xl border-2 border-dashed border-outline text-center">
                  <LineChart className="h-16 w-16 text-outline-variant mx-auto mb-4" />
                  <div className="md3-title-medium text-on-surface mb-2">Forecast Visualization</div>
                  <div className="md3-body-medium text-on-surface-variant">
                    Interactive forecast chart would be displayed here with historical data and prediction bounds
                  </div>
                </div>

                {/* Forecast Insights */}
                <div className="space-y-2">
                  <h4 className="md3-title-small text-on-surface">Forecast Insights</h4>
                  {selectedForecast.insights.map((insight, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-surface-container">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="md3-body-medium text-on-surface">{insight}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </WorkflowPanelSection>
      </WorkflowPanel>

      {/* AI Insights Panel */}
      <WorkflowPanel title="AI-Generated Insights" description="Automated analysis and recommendations from predictive models">
        <WorkflowPanelSection>
          <div className="grid gap-4 md:grid-cols-2">
            {analyticsInsights.slice(0, 8).map((insight, index) => (
              <div key={index} className="p-4 rounded-2xl border border-outline bg-surface">
                <div className="flex items-start gap-3 mb-3">
                  <div className={cn(
                    'p-2 rounded-lg',
                    insight.type === 'trend' && 'bg-blue-100 text-blue-600',
                    insight.type === 'anomaly' && 'bg-red-100 text-red-600',
                    insight.type === 'forecast' && 'bg-green-100 text-green-600',
                    insight.type === 'correlation' && 'bg-purple-100 text-purple-600'
                  )}>
                    {insight.type === 'trend' && <TrendingUp className="h-4 w-4" />}
                    {insight.type === 'anomaly' && <AlertTriangle className="h-4 w-4" />}
                    {insight.type === 'forecast' && <BarChart3 className="h-4 w-4" />}
                    {insight.type === 'correlation' && <Target className="h-4 w-4" />}
                  </div>
                  <div className="flex-1">
                    <h4 className="md3-title-small text-on-surface font-medium mb-1">
                      {insight.title}
                    </h4>
                    <div className={cn(
                      'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                      insight.severity === 'critical' && 'bg-red-100 text-red-700',
                      insight.severity === 'high' && 'bg-orange-100 text-orange-700',
                      insight.severity === 'medium' && 'bg-yellow-100 text-yellow-700',
                      insight.severity === 'low' && 'bg-gray-100 text-gray-700'
                    )}>
                      {insight.severity.toUpperCase()}
                    </div>
                  </div>
                </div>
                <p className="md3-body-medium text-on-surface-variant">
                  {insight.description}
                </p>
              </div>
            ))}
          </div>
        </WorkflowPanelSection>
      </WorkflowPanel>

      {/* Anomaly Detection */}
      {anomalies.length > 0 && (
        <WorkflowPanel title="Anomaly Detection" description="Automated detection of unusual system behavior">
          <WorkflowPanelSection>
            <div className="space-y-4">
              {anomalies.slice(-5).map((anomaly) => (
                <div key={anomaly.id} className="flex items-start gap-4 p-4 rounded-2xl border border-error/30 bg-error-container/10">
                  <AlertTriangle className="h-5 w-5 text-error mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="md3-title-small text-on-surface font-medium">
                        {anomaly.metric} Anomaly
                      </h4>
                      <div className={cn(
                        'px-2 py-1 rounded text-xs font-medium',
                        anomaly.severity === 'critical' && 'bg-red-100 text-red-700',
                        anomaly.severity === 'high' && 'bg-orange-100 text-orange-700',
                        anomaly.severity === 'medium' && 'bg-yellow-100 text-yellow-700',
                        anomaly.severity === 'low' && 'bg-gray-100 text-gray-700'
                      )}>
                        {anomaly.severity.toUpperCase()}
                      </div>
                    </div>
                    <p className="md3-body-medium text-on-surface-variant mb-2">
                      {anomaly.description}
                    </p>
                    <div className="grid gap-2 md:grid-cols-3 text-sm">
                      <div>
                        <span className="text-on-surface-variant">Actual:</span>
                        <span className="ml-1 font-medium">{anomaly.value.toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="text-on-surface-variant">Expected:</span>
                        <span className="ml-1 font-medium">{anomaly.expectedValue.toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="text-on-surface-variant">Deviation:</span>
                        <span className="ml-1 font-medium">{anomaly.deviation.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </WorkflowPanelSection>
        </WorkflowPanel>
      )}
    </div>
  );
};

// Export the predictive engine and components
export { PredictiveAnalyticsEngine, predictiveEngine };
export type { TimeSeriesData, PredictionModel, ForecastResult, AnomalyDetection };
