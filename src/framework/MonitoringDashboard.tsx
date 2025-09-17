/**
 * Monitoring Dashboard - Real-time monitoring and visualization for LightDom Framework
 * Provides comprehensive metrics, charts, and control interface
 */

import React, { useState, useEffect, useCallback } from 'react';
import { frameworkRunner } from './FrameworkRunner';

interface DashboardMetrics {
  framework: any;
  queue: any;
  simulation: any;
  performance: any;
}

interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
    fill?: boolean;
  }>;
}

export const MonitoringDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(5000);

  // Fetch metrics
  const fetchMetrics = useCallback(async () => {
    try {
      const data = frameworkRunner.getMetrics();
      setMetrics(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch metrics');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Auto-refresh effect
  useEffect(() => {
    fetchMetrics();
    
    if (autoRefresh) {
      const interval = setInterval(fetchMetrics, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchMetrics, autoRefresh, refreshInterval]);

  // Manual refresh
  const handleRefresh = () => {
    setIsLoading(true);
    fetchMetrics();
  };

  // Add URL to queue
  const handleAddURL = async (url: string, priority: 'high' | 'medium' | 'low', siteType: string) => {
    try {
      await frameworkRunner.addURL(url, priority, siteType as any);
      fetchMetrics(); // Refresh after adding
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add URL');
    }
  };

  // Run simulation
  const handleRunSimulation = async () => {
    try {
      await frameworkRunner.runSimulation();
      fetchMetrics(); // Refresh after simulation
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to run simulation');
    }
  };

  if (isLoading && !metrics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-600">Loading metrics...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error loading metrics</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
            <div className="mt-4">
              <button
                onClick={handleRefresh}
                className="bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!metrics) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">LightDom Framework Dashboard</h1>
            <p className="text-gray-600">Real-time monitoring and control</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <label className="text-sm font-medium text-gray-700 mr-2">Auto-refresh:</label>
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
            <div className="flex items-center">
              <label className="text-sm font-medium text-gray-700 mr-2">Interval:</label>
              <select
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(Number(e.target.value))}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm"
              >
                <option value={1000}>1s</option>
                <option value={5000}>5s</option>
                <option value={10000}>10s</option>
                <option value={30000}>30s</option>
              </select>
            </div>
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatusCard
          title="Framework Status"
          value={metrics.framework.running ? 'Running' : 'Stopped'}
          status={metrics.framework.running ? 'success' : 'error'}
          icon="🚀"
        />
        <StatusCard
          title="Active Nodes"
          value={metrics.framework.metrics.activeNodes.toString()}
          status="info"
          icon="🖥️"
        />
        <StatusCard
          title="Queue Size"
          value={metrics.framework.metrics.queueSize.toString()}
          status="warning"
          icon="📋"
        />
        <StatusCard
          title="Simulation Efficiency"
          value={`${metrics.framework.metrics.simulationEfficiency.toFixed(1)}%`}
          status="info"
          icon="🔄"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AddURLForm onAddURL={handleAddURL} />
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">Simulation Control</h3>
            <button
              onClick={handleRunSimulation}
              className="w-full bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700"
            >
              Run Simulation
            </button>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">Framework Control</h3>
            <div className="space-y-2">
              <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
                Start Framework
              </button>
              <button className="w-full bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700">
                Stop Framework
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Queue Status */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Queue Status</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Pending:</span>
              <span className="font-medium">{metrics.queue.queueLength}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Processing:</span>
              <span className="font-medium">{metrics.queue.processingRate.toFixed(1)}/min</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Success Rate:</span>
              <span className="font-medium">{metrics.queue.successRate.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Avg Processing Time:</span>
              <span className="font-medium">{(metrics.queue.averageProcessingTime / 1000).toFixed(1)}s</span>
            </div>
          </div>
        </div>

        {/* Simulation Status */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Simulation Status</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Simulations:</span>
              <span className="font-medium">{metrics.simulation.totalSimulations}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Avg Efficiency:</span>
              <span className="font-medium">{metrics.simulation.averageEfficiency.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Avg Duration:</span>
              <span className="font-medium">{(metrics.simulation.averageDuration / 1000).toFixed(1)}s</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Health Trend:</span>
              <span className={`font-medium ${
                metrics.simulation.networkHealthTrend === 'improving' ? 'text-green-600' :
                metrics.simulation.networkHealthTrend === 'stable' ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {metrics.simulation.networkHealthTrend}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Memory Usage</h3>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Used:</span>
                <span className="font-medium">{(metrics.performance.memoryUsage.heapUsed / 1024 / 1024).toFixed(1)} MB</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total:</span>
                <span className="font-medium">{(metrics.performance.memoryUsage.heapTotal / 1024 / 1024).toFixed(1)} MB</span>
              </div>
            </div>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 mb-2">CPU Usage</h3>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">User:</span>
                <span className="font-medium">{(metrics.performance.cpuUsage.user / 1000000).toFixed(1)}s</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">System:</span>
                <span className="font-medium">{(metrics.performance.cpuUsage.system / 1000000).toFixed(1)}s</span>
              </div>
            </div>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Uptime</h3>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Duration:</span>
                <span className="font-medium">{Math.floor(metrics.performance.uptime / 1000 / 60)} minutes</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Status Card Component
const StatusCard: React.FC<{
  title: string;
  value: string;
  status: 'success' | 'error' | 'warning' | 'info';
  icon: string;
}> = ({ title, value, status, icon }) => {
  const statusColors = {
    success: 'text-green-600 bg-green-100',
    error: 'text-red-600 bg-red-100',
    warning: 'text-yellow-600 bg-yellow-100',
    info: 'text-blue-600 bg-blue-100'
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <span className="text-2xl">{icon}</span>
        </div>
        <div className="ml-4">
          <h3 className="text-sm font-medium text-gray-500">{title}</h3>
          <p className={`text-2xl font-semibold ${statusColors[status]}`}>{value}</p>
        </div>
      </div>
    </div>
  );
};

// Add URL Form Component
const AddURLForm: React.FC<{
  onAddURL: (url: string, priority: 'high' | 'medium' | 'low', siteType: string) => void;
}> = ({ onAddURL }) => {
  const [url, setUrl] = useState('');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [siteType, setSiteType] = useState('other');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onAddURL(url.trim(), priority, siteType);
      setUrl('');
    }
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <h3 className="font-medium text-gray-900 mb-3">Add URL to Queue</h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as any)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>
          <select
            value={siteType}
            onChange={(e) => setSiteType(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ecommerce">E-commerce</option>
            <option value="blog">Blog</option>
            <option value="corporate">Corporate</option>
            <option value="portfolio">Portfolio</option>
            <option value="news">News</option>
            <option value="social">Social</option>
            <option value="other">Other</option>
          </select>
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
        >
          Add to Queue
        </button>
      </form>
    </div>
  );
};

export default MonitoringDashboard;
