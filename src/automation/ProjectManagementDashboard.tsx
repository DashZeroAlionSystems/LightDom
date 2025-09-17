/**
 * Project Management Dashboard
 * React component for managing large-scale blockchain projects
 * Provides real-time monitoring, resource allocation, and workflow management
 */

import React, { useState, useEffect, useCallback } from 'react';
import { ProjectManagementFramework } from './ProjectManagementFramework';
import { BlockchainAutomationManager } from './BlockchainAutomationManager';
import { BlockchainNodeManager } from './BlockchainNodeManager';

interface DashboardProps {
  projectFramework: ProjectManagementFramework;
  automationManager: BlockchainAutomationManager;
  nodeManager: BlockchainNodeManager;
}

interface DashboardState {
  projects: any[];
  capacityPlan: any;
  nodeHealth: any[];
  metrics: any;
  selectedProject: string | null;
  view: 'overview' | 'projects' | 'nodes' | 'workflows' | 'metrics';
}

export const ProjectManagementDashboard: React.FC<DashboardProps> = ({
  projectFramework,
  automationManager,
  nodeManager
}) => {
  const [state, setState] = useState<DashboardState>({
    projects: [],
    capacityPlan: null,
    nodeHealth: [],
    metrics: null,
    selectedProject: null,
    view: 'overview'
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    loadDashboardData();
    
    // Set up real-time updates
    const interval = setInterval(loadDashboardData, 30000); // Update every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [projects, capacityPlan, nodeHealth, metrics] = await Promise.all([
        projectFramework.getAllProjects(),
        projectFramework.getCapacityPlan(),
        nodeManager.getAllNodeHealth(),
        automationManager.getMetrics()
      ]);

      setState(prev => ({
        ...prev,
        projects,
        capacityPlan,
        nodeHealth,
        metrics
      }));

    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [projectFramework, automationManager, nodeManager]);

  const handleProjectSelect = (projectId: string) => {
    setState(prev => ({
      ...prev,
      selectedProject: prev.selectedProject === projectId ? null : projectId
    }));
  };

  const handleViewChange = (view: DashboardState['view']) => {
    setState(prev => ({ ...prev, view }));
  };

  const handleCreateProject = async (projectData: any) => {
    try {
      await projectFramework.createProject(projectData);
      await loadDashboardData();
    } catch (err) {
      console.error('Failed to create project:', err);
      setError(err instanceof Error ? err.message : 'Failed to create project');
    }
  };

  const handleExecuteWorkflow = async (workflowId: string) => {
    try {
      await automationManager.executeWorkflow(workflowId);
      await loadDashboardData();
    } catch (err) {
      console.error('Failed to execute workflow:', err);
      setError(err instanceof Error ? err.message : 'Failed to execute workflow');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadDashboardData}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                LightDom Project Management
              </h1>
              <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                Live
              </span>
            </div>
            <nav className="flex space-x-4">
              {[
                { id: 'overview', label: 'Overview', icon: '📊' },
                { id: 'projects', label: 'Projects', icon: '📁' },
                { id: 'nodes', label: 'Nodes', icon: '🔧' },
                { id: 'workflows', label: 'Workflows', icon: '🤖' },
                { id: 'metrics', label: 'Metrics', icon: '📈' }
              ].map(({ id, label, icon }) => (
                <button
                  key={id}
                  onClick={() => handleViewChange(id as DashboardState['view'])}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    state.view === id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <span className="mr-1">{icon}</span>
                  {label}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {state.view === 'overview' && <OverviewView state={state} />}
        {state.view === 'projects' && <ProjectsView state={state} onProjectSelect={handleProjectSelect} />}
        {state.view === 'nodes' && <NodesView state={state} />}
        {state.view === 'workflows' && <WorkflowsView state={state} onExecuteWorkflow={handleExecuteWorkflow} />}
        {state.view === 'metrics' && <MetricsView state={state} />}
      </main>
    </div>
  );
};

// Overview View Component
const OverviewView: React.FC<{ state: DashboardState }> = ({ state }) => {
  const { projects, capacityPlan, nodeHealth, metrics } = state;

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-900">System Overview</h2>
      
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Active Projects"
          value={projects.filter(p => p.status === 'active').length}
          total={projects.length}
          icon="📁"
          color="blue"
        />
        <MetricCard
          title="Healthy Nodes"
          value={nodeHealth.filter(n => n.status === 'healthy').length}
          total={nodeHealth.length}
          icon="🔧"
          color="green"
        />
        <MetricCard
          title="Running Workflows"
          value={metrics?.runningWorkflows || 0}
          total={metrics?.totalWorkflows || 0}
          icon="🤖"
          color="purple"
        />
        <MetricCard
          title="Resource Utilization"
          value={`${Math.round(capacityPlan?.allocatedCapacity?.cpu || 0)}%`}
          total="100%"
          icon="📊"
          color="orange"
        />
      </div>

      {/* Capacity Plan */}
      {capacityPlan && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Resource Capacity</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ResourceBar
              label="CPU"
              used={capacityPlan.allocatedCapacity.cpu}
              total={capacityPlan.totalCapacity.cpu}
              unit="cores"
            />
            <ResourceBar
              label="Memory"
              used={capacityPlan.allocatedCapacity.memory}
              total={capacityPlan.totalCapacity.memory}
              unit="MB"
            />
            <ResourceBar
              label="Storage"
              used={capacityPlan.allocatedCapacity.storage}
              total={capacityPlan.totalCapacity.storage}
              unit="GB"
            />
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {projects.slice(0, 5).map(project => (
            <div key={project.id} className="flex items-center justify-between py-2 border-b">
              <div>
                <p className="font-medium text-gray-900">{project.name}</p>
                <p className="text-sm text-gray-500">{project.description}</p>
              </div>
              <span className={`px-2 py-1 text-xs rounded-full ${
                project.status === 'active' ? 'bg-green-100 text-green-800' :
                project.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {project.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Projects View Component
const ProjectsView: React.FC<{ 
  state: DashboardState; 
  onProjectSelect: (projectId: string) => void;
}> = ({ state, onProjectSelect }) => {
  const { projects } = state;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900">Projects</h2>
        <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          + New Project
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {projects.map(project => (
          <ProjectCard
            key={project.id}
            project={project}
            isSelected={state.selectedProject === project.id}
            onSelect={() => onProjectSelect(project.id)}
          />
        ))}
      </div>
    </div>
  );
};

// Nodes View Component
const NodesView: React.FC<{ state: DashboardState }> = ({ state }) => {
  const { nodeHealth } = state;

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-900">Blockchain Nodes</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {nodeHealth.map(node => (
          <NodeCard key={node.nodeId} node={node} />
        ))}
      </div>
    </div>
  );
};

// Workflows View Component
const WorkflowsView: React.FC<{ 
  state: DashboardState; 
  onExecuteWorkflow: (workflowId: string) => void;
}> = ({ state, onExecuteWorkflow }) => {
  const { metrics } = state;

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-900">Automation Workflows</h2>
      
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{metrics?.totalWorkflows || 0}</div>
            <div className="text-sm text-gray-500">Total Workflows</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">{metrics?.runningWorkflows || 0}</div>
            <div className="text-sm text-gray-500">Running</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">{metrics?.completedWorkflows || 0}</div>
            <div className="text-sm text-gray-500">Completed</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WorkflowCard
          id="dom-optimization-workflow"
          name="DOM Optimization Workflow"
          description="Automated DOM optimization and blockchain submission"
          status="running"
          onExecute={() => onExecuteWorkflow('dom-optimization-workflow')}
        />
        <WorkflowCard
          id="monitoring-workflow"
          name="System Monitoring Workflow"
          description="Continuous monitoring of blockchain and system health"
          status="running"
          onExecute={() => onExecuteWorkflow('monitoring-workflow')}
        />
      </div>
    </div>
  );
};

// Metrics View Component
const MetricsView: React.FC<{ state: DashboardState }> = ({ state }) => {
  const { metrics } = state;

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-900">System Metrics</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Blockchain Metrics</h3>
          <div className="space-y-3">
            <MetricRow label="Transactions Processed" value={metrics?.blockchainMetrics?.transactionsProcessed || 0} />
            <MetricRow label="Blocks Mined" value={metrics?.blockchainMetrics?.blocksMined || 0} />
            <MetricRow label="Optimizations Submitted" value={metrics?.blockchainMetrics?.optimizationsSubmitted || 0} />
            <MetricRow label="Gas Used" value={metrics?.blockchainMetrics?.gasUsed || 0} />
            <MetricRow label="Error Rate" value={`${metrics?.blockchainMetrics?.errorRate || 0}%`} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Resource Utilization</h3>
          <div className="space-y-3">
            <MetricRow label="CPU" value={`${metrics?.resourceUtilization?.cpu || 0}%`} />
            <MetricRow label="Memory" value={`${metrics?.resourceUtilization?.memory || 0}%`} />
            <MetricRow label="Storage" value={`${metrics?.resourceUtilization?.storage || 0}%`} />
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper Components
const MetricCard: React.FC<{
  title: string;
  value: number | string;
  total: number | string;
  icon: string;
  color: string;
}> = ({ title, value, total, icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500'
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${colorClasses[color as keyof typeof colorClasses]} text-white`}>
          <span className="text-2xl">{icon}</span>
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
          <p className="text-sm text-gray-500">of {total}</p>
        </div>
      </div>
    </div>
  );
};

const ResourceBar: React.FC<{
  label: string;
  used: number;
  total: number;
  unit: string;
}> = ({ label, used, total, unit }) => {
  const percentage = total > 0 ? (used / total) * 100 : 0;
  
  return (
    <div>
      <div className="flex justify-between text-sm text-gray-600 mb-1">
        <span>{label}</span>
        <span>{used} / {total} {unit}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full ${
            percentage > 80 ? 'bg-red-500' : percentage > 60 ? 'bg-yellow-500' : 'bg-green-500'
          }`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        ></div>
      </div>
    </div>
  );
};

const ProjectCard: React.FC<{
  project: any;
  isSelected: boolean;
  onSelect: () => void;
}> = ({ project, isSelected, onSelect }) => {
  return (
    <div
      className={`bg-white rounded-lg shadow p-6 cursor-pointer transition-all ${
        isSelected ? 'ring-2 ring-blue-500' : 'hover:shadow-lg'
      }`}
      onClick={onSelect}
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
        <span className={`px-2 py-1 text-xs rounded-full ${
          project.status === 'active' ? 'bg-green-100 text-green-800' :
          project.status === 'completed' ? 'bg-blue-100 text-blue-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {project.status}
        </span>
      </div>
      
      <p className="text-gray-600 text-sm mb-4">{project.description}</p>
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Progress</span>
          <span className="font-medium">{project.metrics?.progress || 0}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full"
            style={{ width: `${project.metrics?.progress || 0}%` }}
          ></div>
        </div>
      </div>
      
      <div className="mt-4 flex justify-between text-sm text-gray-500">
        <span>{project.metrics?.tasksCompleted || 0} / {project.metrics?.tasksTotal || 0} tasks</span>
        <span>${project.metrics?.budgetUsed || 0} / ${project.budget || 0}</span>
      </div>
    </div>
  );
};

const NodeCard: React.FC<{ node: any }> = ({ node }) => {
  const statusColors = {
    healthy: 'bg-green-100 text-green-800',
    degraded: 'bg-yellow-100 text-yellow-800',
    unhealthy: 'bg-red-100 text-red-800',
    offline: 'bg-gray-100 text-gray-800'
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{node.nodeId}</h3>
        <span className={`px-2 py-1 text-xs rounded-full ${statusColors[node.status]}`}>
          {node.status}
        </span>
      </div>
      
      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">CPU</span>
          <span className="font-medium">{node.metrics?.cpu?.toFixed(1) || 0}%</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Memory</span>
          <span className="font-medium">{node.metrics?.memory?.toFixed(1) || 0}%</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Uptime</span>
          <span className="font-medium">{Math.floor(node.uptime / 3600)}h</span>
        </div>
      </div>
      
      {node.issues && node.issues.length > 0 && (
        <div className="mt-4 p-3 bg-red-50 rounded-md">
          <p className="text-sm text-red-800 font-medium">Issues:</p>
          {node.issues.map((issue: any, index: number) => (
            <p key={index} className="text-xs text-red-600 mt-1">{issue.description}</p>
          ))}
        </div>
      )}
    </div>
  );
};

const WorkflowCard: React.FC<{
  id: string;
  name: string;
  description: string;
  status: string;
  onExecute: () => void;
}> = ({ id, name, description, status, onExecute }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
        <span className={`px-2 py-1 text-xs rounded-full ${
          status === 'running' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {status}
        </span>
      </div>
      
      <p className="text-gray-600 text-sm mb-4">{description}</p>
      
      <button
        onClick={onExecute}
        className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
      >
        Execute Workflow
      </button>
    </div>
  );
};

const MetricRow: React.FC<{ label: string; value: string | number }> = ({ label, value }) => {
  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-100">
      <span className="text-gray-600">{label}</span>
      <span className="font-medium text-gray-900">{value}</span>
    </div>
  );
};

export default ProjectManagementDashboard;
