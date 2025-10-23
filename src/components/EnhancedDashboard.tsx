/**
 * Enhanced Dashboard Component
 * Showcases all the new Electron and PWA features
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Zap, Cpu, HardDrive, Activity, Download, Bell,
  Maximize2, Minimize2, X, Moon, Sun
} from 'lucide-react';

// Import hooks
import {
  useAppInfo,
  useWindowControls,
  useElectronTheme,
  useElectronNotification,
  usePuppeteerCrawl,
  useBackendLogs,
  useServiceStatus,
  useIsElectron,
  useElectronNavigation,
  useTrayActions,
} from '../hooks/useElectron';

// Import components
import { StatCard, BarChart, LineChart, DonutChart, ProgressRing } from './DataVisualization';
import { useNotifications } from './NotificationSystem';

export function EnhancedDashboard() {
  const navigate = useNavigate();
  const isElectron = useIsElectron();
  const { appInfo, loading: appLoading } = useAppInfo();
  const { minimize, maximize, close } = useWindowControls();
  const { isDark, toggleTheme } = useElectronTheme();
  const { showNotification: showElectronNotif } = useElectronNotification();
  const { success, info, error: notifyError } = useNotifications();
  const { status } = useServiceStatus();
  const { logs, errors } = useBackendLogs();

  // Navigation from Electron (tray, shortcuts)
  useElectronNavigation((route) => {
    navigate(route);
    info('Navigation', `Navigated to ${route}`);
  });

  // Tray actions
  useTrayActions((action) => {
    if (action === 'start-crawling') {
      handleStartCrawl();
    } else if (action === 'stop-crawling') {
      success('Crawling stopped');
    }
  });

  // Sample data for visualizations
  const [stats, setStats] = useState({
    tokensEarned: 1250,
    tokensChange: 12.5,
    spaceSaved: 1024000,
    spaceSavedChange: 8.3,
    activeCrawlers: 3,
    crawlersChange: 0,
    optimization: 85,
    optimizationChange: 5.2,
  });

  const [crawlData] = useState([
    { label: 'Mon', value: 120 },
    { label: 'Tue', value: 180 },
    { label: 'Wed', value: 150 },
    { label: 'Thu', value: 220 },
    { label: 'Fri', value: 190 },
    { label: 'Sat', value: 240 },
    { label: 'Sun', value: 200 },
  ]);

  const [timeSeriesData] = useState([
    { timestamp: '00:00', value: 0 },
    { timestamp: '04:00', value: 120 },
    { timestamp: '08:00', value: 180 },
    { timestamp: '12:00', value: 250 },
    { timestamp: '16:00', value: 320 },
    { timestamp: '20:00', value: 280 },
    { timestamp: '24:00', value: 350 },
  ]);

  const [resourceData] = useState([
    { label: 'CPU', value: 45, color: '#6C7BFF' },
    { label: 'Memory', value: 62, color: '#7C5CFF' },
    { label: 'Disk', value: 28, color: '#5865F2' },
    { label: 'Network', value: 55, color: '#9D7CFF' },
  ]);

  // Test Puppeteer crawl
  const handleStartCrawl = async () => {
    if (!isElectron) {
      notifyError('Electron Required', 'Crawling is only available in Electron mode');
      return;
    }

    info('Starting Crawl', 'Crawling example.com...');

    // This would use the actual hook in production
    setTimeout(() => {
      success('Crawl Complete', 'Successfully crawled example.com');
      setStats(prev => ({
        ...prev,
        tokensEarned: prev.tokensEarned + 10,
        spaceSaved: prev.spaceSaved + 1024,
      }));
    }, 2000);
  };

  const handleTestNotification = () => {
    success('Test Notification', 'This is a test notification with all features enabled!');

    if (isElectron) {
      showElectronNotif('Native Notification', 'This is a native Electron notification');
    }
  };

  return (
    <div className="min-h-screen bg-background-primary text-white">
      {/* Custom Title Bar (Electron) */}
      {isElectron && (
        <div className="bg-background-secondary border-b border-gray-800 flex items-center justify-between px-4 py-2 drag">
          <div className="flex items-center gap-3">
            <Zap className="w-5 h-5 text-accent-blue" />
            <span className="text-sm font-semibold">LightDom Enhanced</span>
            {appInfo && (
              <span className="text-xs text-gray-500">v{appInfo.version}</span>
            )}
          </div>

          <div className="flex items-center gap-2 no-drag">
            <button
              onClick={toggleTheme}
              className="p-2 hover:bg-gray-700 rounded transition-colors"
              title="Toggle theme"
            >
              {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>

            <button
              onClick={minimize}
              className="p-2 hover:bg-gray-700 rounded transition-colors"
              title="Minimize"
            >
              <Minimize2 className="w-4 h-4" />
            </button>

            <button
              onClick={maximize}
              className="p-2 hover:bg-gray-700 rounded transition-colors"
              title="Maximize"
            >
              <Maximize2 className="w-4 h-4" />
            </button>

            <button
              onClick={close}
              className="p-2 hover:bg-red-600 rounded transition-colors"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Enhanced Dashboard</h1>
          <p className="text-gray-400">
            {isElectron ? 'Running in Electron with all features enabled' : 'Running in web browser'}
          </p>

          {appInfo && (
            <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
              <span>Platform: {appInfo.platform}</span>
              <span>•</span>
              <span>Electron: {appInfo.electron}</span>
              <span>•</span>
              <span>Node: {appInfo.node}</span>
            </div>
          )}
        </div>

        {/* Service Status */}
        {isElectron && Object.keys(status).length > 0 && (
          <div className="mb-8 p-4 bg-background-secondary rounded-lg border border-gray-800">
            <h3 className="text-sm font-semibold mb-3">Service Status</h3>
            <div className="flex gap-4">
              {Object.entries(status).map(([name, state]) => (
                <div key={name} className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    state === 'running' ? 'bg-green-500' :
                    state === 'starting' ? 'bg-yellow-500 animate-pulse' :
                    'bg-red-500'
                  }`} />
                  <span className="text-sm capitalize">{name}: {state}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mb-8 flex gap-4">
          <button
            onClick={handleStartCrawl}
            className="px-6 py-3 bg-accent-blue hover:bg-accent-blue/80 rounded-lg font-semibold transition-colors flex items-center gap-2"
          >
            <Download className="w-5 h-5" />
            Start Crawl
          </button>

          <button
            onClick={handleTestNotification}
            className="px-6 py-3 bg-accent-purple hover:bg-accent-purple/80 rounded-lg font-semibold transition-colors flex items-center gap-2"
          >
            <Bell className="w-5 h-5" />
            Test Notification
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Tokens Earned"
            value={stats.tokensEarned.toLocaleString()}
            change={stats.tokensChange}
            icon={<Zap className="w-6 h-6 text-blue-400" />}
            color="blue"
            subtitle="LIGHT tokens"
          />

          <StatCard
            title="Space Saved"
            value={`${(stats.spaceSaved / 1024).toFixed(1)} KB`}
            change={stats.spaceSavedChange}
            icon={<HardDrive className="w-6 h-6 text-purple-400" />}
            color="purple"
            subtitle="Optimized space"
          />

          <StatCard
            title="Active Crawlers"
            value={stats.activeCrawlers}
            change={stats.crawlersChange}
            icon={<Cpu className="w-6 h-6 text-green-400" />}
            color="green"
            subtitle="Running workers"
          />

          <StatCard
            title="Optimization"
            value={`${stats.optimization}%`}
            change={stats.optimizationChange}
            icon={<Activity className="w-6 h-6 text-orange-400" />}
            color="orange"
            subtitle="Efficiency score"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Bar Chart */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Weekly Activity</h3>
            <BarChart data={crawlData} height={300} />
          </div>

          {/* Line Chart */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Token Earnings (24h)</h3>
            <LineChart data={timeSeriesData} height={300} color="#6C7BFF" />
          </div>
        </div>

        {/* Bottom Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Donut Chart */}
          <div className="lg:col-span-2">
            <h3 className="text-lg font-semibold mb-4">Resource Usage</h3>
            <DonutChart data={resourceData} height={300} />
          </div>

          {/* Progress Rings */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Goals</h3>
            <div className="bg-background-secondary/50 backdrop-blur-xl rounded-lg p-6 border border-gray-800">
              <div className="grid grid-cols-2 gap-6">
                <ProgressRing
                  value={750}
                  max={1000}
                  size={100}
                  color="#6C7BFF"
                  label="Daily Goal"
                />
                <ProgressRing
                  value={4200}
                  max={5000}
                  size={100}
                  color="#7C5CFF"
                  label="Weekly Goal"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Logs (Electron only) */}
        {isElectron && logs.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Backend Logs</h3>
            <div className="bg-background-secondary rounded-lg p-4 border border-gray-800 max-h-48 overflow-y-auto font-mono text-xs">
              {logs.slice(-10).map((log, i) => (
                <div key={i} className="text-gray-400 py-1">{log}</div>
              ))}
            </div>
          </div>
        )}

        {isElectron && errors.length > 0 && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-4 text-red-400">Errors</h3>
            <div className="bg-red-950/20 rounded-lg p-4 border border-red-900 max-h-48 overflow-y-auto font-mono text-xs">
              {errors.slice(-10).map((error, i) => (
                <div key={i} className="text-red-400 py-1">{error}</div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add drag CSS */}
      <style>{`
        .drag {
          -webkit-app-region: drag;
        }
        .no-drag {
          -webkit-app-region: no-drag;
        }
      `}</style>
    </div>
  );
}

export default EnhancedDashboard;
