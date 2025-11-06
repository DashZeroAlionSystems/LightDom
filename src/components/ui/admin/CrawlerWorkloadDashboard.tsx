/**
 * CrawlerWorkloadDashboard
 * 
 * Comprehensive crawler management dashboard combining:
 * - Real-time parallel crawler monitoring
 * - AI-powered URL seeding service
 * - Workload visualization and management
 * - Schema-linked components
 */

import React, { useState } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Badge,
} from '@/components/ui';
import { Activity, Settings, Plus, Eye, FileText } from 'lucide-react';
import EnhancedCrawlerMonitoringDashboard from './EnhancedCrawlerMonitoringDashboard';
import URLSeedingService from './URLSeedingService';

type TabType = 'monitoring' | 'seeding' | 'workload' | 'settings';

export const CrawlerWorkloadDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('monitoring');

  const tabs = [
    {
      id: 'monitoring' as TabType,
      label: 'Live Monitoring',
      icon: Activity,
      description: 'Real-time crawler status and workload',
    },
    {
      id: 'seeding' as TabType,
      label: 'URL Seeding',
      icon: Plus,
      description: 'Generate and manage crawler seeds',
    },
    {
      id: 'workload' as TabType,
      label: 'Workload Analysis',
      icon: Eye,
      description: 'Analyze crawler performance and distribution',
    },
    {
      id: 'settings' as TabType,
      label: 'Settings',
      icon: Settings,
      description: 'Configure crawler behavior',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Crawler Workload Management
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Monitor, configure, and optimize parallel web crawlers
              </p>
            </div>
            <Badge variant="outlined">
              <FileText className="w-3 h-3 mr-1" />
              Schema-Linked
            </Badge>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex space-x-8" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm
                    transition-colors duration-200
                    ${
                      isActive
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <Icon
                    className={`
                      mr-2 h-5 w-5
                      ${isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'}
                    `}
                  />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {activeTab === 'monitoring' && (
          <div className="space-y-6">
            <EnhancedCrawlerMonitoringDashboard />
          </div>
        )}

        {activeTab === 'seeding' && (
          <div className="space-y-6">
            <URLSeedingService />
          </div>
        )}

        {activeTab === 'workload' && (
          <WorkloadAnalysisTab />
        )}

        {activeTab === 'settings' && (
          <CrawlerSettingsTab />
        )}
      </div>
    </div>
  );
};

/**
 * Workload Analysis Tab
 */
const WorkloadAnalysisTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Workload Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Workload analysis and performance metrics will be displayed here.
          </p>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="text-sm font-semibold text-blue-900 mb-1">
                Domain Distribution
              </h4>
              <p className="text-xs text-blue-700">
                Visual breakdown of crawler workload by domain
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h4 className="text-sm font-semibold text-green-900 mb-1">
                Performance Trends
              </h4>
              <p className="text-xs text-green-700">
                Historical performance and efficiency metrics
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <h4 className="text-sm font-semibold text-purple-900 mb-1">
                Resource Usage
              </h4>
              <p className="text-xs text-purple-700">
                CPU, memory, and network utilization
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

/**
 * Crawler Settings Tab
 */
const CrawlerSettingsTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Global Crawler Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Parallel Crawlers
            </label>
            <input
              type="number"
              defaultValue={5}
              min={1}
              max={20}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Maximum number of crawlers that can run simultaneously
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Default Rate Limit (requests/second)
            </label>
            <input
              type="number"
              defaultValue={10}
              min={1}
              max={100}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Default rate limit for all crawlers unless overridden
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Request Timeout (ms)
            </label>
            <input
              type="number"
              defaultValue={30000}
              min={5000}
              max={120000}
              step={1000}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Maximum time to wait for a page to load
            </p>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="text-sm font-medium text-gray-900">
                Respect robots.txt
              </h4>
              <p className="text-xs text-gray-600">
                Follow robots.txt directives from websites
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="text-sm font-medium text-gray-900">
                Auto-restart failed crawlers
              </h4>
              <p className="text-xs text-gray-600">
                Automatically retry crawlers that encounter errors
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <Button variant="filled" fullWidth>
              Save Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CrawlerWorkloadDashboard;
