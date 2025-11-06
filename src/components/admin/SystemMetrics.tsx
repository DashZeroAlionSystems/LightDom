/**
 * System Metrics Component
 * Displays detailed system performance and usage metrics
 */

import React, { useState, useEffect } from 'react';
import { 
  Activity,
  Cpu,
  HardDrive,
  Network,
  Clock,
  TrendingUp,
  TrendingDown,
  AlertTriangle
} from 'lucide-react';

interface Metric {
  name: string;
  value: number;
  unit: string;
  trend: number;
  status: 'healthy' | 'warning' | 'critical';
}

const SystemMetrics: React.FC = () => {
  const [metrics, setMetrics] = useState<Record<string, Metric>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
    const interval = setInterval(loadMetrics, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const loadMetrics = async () => {
    try {
      // Mock metrics data - in production, fetch from monitoring service
      const mockMetrics: Record<string, Metric> = {
        cpu: {
          name: 'CPU Usage',
          value: 45,
          unit: '%',
          trend: -5,
          status: 'healthy'
        },
        memory: {
          name: 'Memory Usage',
          value: 62,
          unit: '%',
          trend: 2,
          status: 'healthy'
        },
        disk: {
          name: 'Disk Usage',
          value: 73,
          unit: '%',
          trend: 1,
          status: 'warning'
        },
        network: {
          name: 'Network I/O',
          value: 125,
          unit: 'MB/s',
          trend: 15,
          status: 'healthy'
        },
        responseTime: {
          name: 'Avg Response Time',
          value: 142,
          unit: 'ms',
          trend: -8,
          status: 'healthy'
        },
        errorRate: {
          name: 'Error Rate',
          value: 0.3,
          unit: '%',
          trend: -0.1,
          status: 'healthy'
        },
        activeConnections: {
          name: 'Active Connections',
          value: 1247,
          unit: '',
          trend: 52,
          status: 'healthy'
        },
        requestsPerSecond: {
          name: 'Requests/Second',
          value: 523,
          unit: 'req/s',
          trend: 24,
          status: 'healthy'
        }
      };
      
      setMetrics(mockMetrics);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load metrics:', error);
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'metric-healthy';
      case 'warning': return 'metric-warning';
      case 'critical': return 'metric-critical';
      default: return '';
    }
  };

  const getIcon = (metricName: string) => {
    const icons: Record<string, any> = {
      cpu: Cpu,
      memory: HardDrive,
      disk: HardDrive,
      network: Network,
      responseTime: Clock,
      errorRate: AlertTriangle,
      activeConnections: Network,
      requestsPerSecond: Activity
    };
    const Icon = icons[metricName] || Activity;
    return <Icon size={24} />;
  };

  if (loading) {
    return <div className="metrics-loading">Loading system metrics...</div>;
  }

  return (
    <div className="system-metrics">
      <div className="metrics-grid">
        {Object.entries(metrics).map(([key, metric]) => (
          <div key={key} className={`metric-card ${getStatusColor(metric.status)}`}>
            <div className="metric-header">
              <div className="metric-icon">
                {getIcon(key)}
              </div>
              <div className="metric-trend">
                {metric.trend > 0 ? (
                  <TrendingUp size={16} className="trend-up" />
                ) : metric.trend < 0 ? (
                  <TrendingDown size={16} className="trend-down" />
                ) : null}
                <span>{Math.abs(metric.trend)}{metric.unit === '%' ? '%' : ''}</span>
              </div>
            </div>
            <div className="metric-body">
              <div className="metric-value">
                {metric.value}
                <span className="metric-unit">{metric.unit}</span>
              </div>
              <div className="metric-name">{metric.name}</div>
            </div>
            {metric.status === 'warning' && (
              <div className="metric-warning">
                <AlertTriangle size={14} />
                <span>Approaching limit</span>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="metrics-charts">
        <div className="chart-section">
          <h3>Performance Trends</h3>
          <div className="chart-placeholder">
            {/* In production, integrate with a charting library like recharts */}
            <div className="placeholder-text">Performance chart visualization</div>
          </div>
        </div>

        <div className="chart-section">
          <h3>Resource Utilization</h3>
          <div className="chart-placeholder">
            <div className="placeholder-text">Resource usage chart</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemMetrics;


