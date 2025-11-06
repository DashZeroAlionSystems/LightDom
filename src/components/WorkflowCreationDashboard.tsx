/**
 * Workflow Creation Dashboard
 * 
 * Main dashboard for creating and managing workflows with:
 * - Real-time Mermaid chart rendering
 * - Process status indicators (green/red/orange)
 * - Workflow wizards and configuration panels
 * - Schema-linked graphics
 * - SVG generation by prompt
 */

import React, { useState, useEffect } from 'react';
import { Tabs, Card, Button, message, Space, Badge, Spin } from 'antd';
import { 
  PlayCircleOutlined, 
  PauseCircleOutlined, 
  StopOutlined,
  PlusOutlined,
  SettingOutlined,
  FileTextOutlined,
  AppstoreOutlined
} from '@ant-design/icons';
import WorkflowMermaidDiagram from './workflow/WorkflowMermaidDiagram';
import WorkflowWizard from './workflow/WorkflowWizard';
import WorkflowConfigPanel from './workflow/WorkflowConfigPanel';
import ComponentConfigurator from './workflow/ComponentConfigurator';
import SVGGraphicsGenerator from './workflow/SVGGraphicsGenerator';

const { TabPane } = Tabs;

interface WorkflowStatus {
  name: string;
  status: 'running' | 'stopped' | 'idle';
  currentStep?: string;
  progress?: number;
}

const WorkflowCreationDashboard: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [workflows, setWorkflows] = useState<WorkflowStatus[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('diagram');
  const [loading, setLoading] = useState(false);

  // Load workflows from API
  useEffect(() => {
    loadWorkflows();
  }, []);

  const loadWorkflows = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/workflow-generator/config/summary');
      if (response.ok) {
        const data = await response.json();
        const workflowStatuses: WorkflowStatus[] = data.setups?.map((setup: any) => ({
          name: setup.name,
          status: 'idle',
          currentStep: undefined,
          progress: 0
        })) || [];
        setWorkflows(workflowStatuses);
      }
    } catch (error) {
      console.error('Failed to load workflows:', error);
      message.error('Failed to load workflows');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWorkflow = () => {
    setActiveTab('wizard');
  };

  const handleExecuteWorkflow = async (workflowName: string) => {
    try {
      // Update status to running
      setWorkflows(prev => prev.map(w => 
        w.name === workflowName ? { ...w, status: 'running', progress: 0 } : w
      ));

      const response = await fetch(`/api/workflow-generator/execute/${workflowName}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });

      if (response.ok) {
        message.success(`Workflow ${workflowName} executed successfully`);
        setWorkflows(prev => prev.map(w => 
          w.name === workflowName ? { ...w, status: 'idle', progress: 100 } : w
        ));
      } else {
        throw new Error('Execution failed');
      }
    } catch (error) {
      console.error('Failed to execute workflow:', error);
      message.error(`Failed to execute workflow ${workflowName}`);
      setWorkflows(prev => prev.map(w => 
        w.name === workflowName ? { ...w, status: 'stopped' } : w
      ));
    }
  };

  const handleStopWorkflow = (workflowName: string) => {
    setWorkflows(prev => prev.map(w => 
      w.name === workflowName ? { ...w, status: 'stopped' } : w
    ));
    message.info(`Workflow ${workflowName} stopped`);
  };

  const getStatusBadge = (status: 'running' | 'stopped' | 'idle') => {
    const statusConfig = {
      running: { color: 'green', text: 'Running' },
      stopped: { color: 'red', text: 'Stopped' },
      idle: { color: 'orange', text: 'Idle' }
    };
    return <Badge status={statusConfig[status].color as any} text={statusConfig[status].text} />;
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-full px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Workflow Creation Dashboard</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                Create, configure, and monitor workflows with real-time Mermaid diagrams
              </p>
            </div>
            <Space>
              <Button 
                icon={<PlusOutlined />} 
                type="primary"
                onClick={handleCreateWorkflow}
              >
                Create Workflow
              </Button>
              <Button 
                onClick={() => setDarkMode(!darkMode)}
              >
                {darkMode ? '☀️ Light' : '🌙 Dark'}
              </Button>
            </Space>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-full px-6 py-6">
        <Tabs activeKey={activeTab} onChange={setActiveTab} size="large">
          {/* Workflow Diagram Tab */}
          <TabPane 
            tab={
              <span>
                <FileTextOutlined />
                Workflow Diagram
              </span>
            } 
            key="diagram"
          >
            <Card loading={loading}>
              <WorkflowMermaidDiagram 
                workflows={workflows}
                selectedWorkflow={selectedWorkflow}
                onSelectWorkflow={setSelectedWorkflow}
                onExecute={handleExecuteWorkflow}
                onStop={handleStopWorkflow}
                darkMode={darkMode}
              />
            </Card>
          </TabPane>

          {/* Workflow Wizard Tab */}
          <TabPane 
            tab={
              <span>
                <PlusOutlined />
                Workflow Wizard
              </span>
            } 
            key="wizard"
          >
            <Card>
              <WorkflowWizard 
                onComplete={(workflow) => {
                  setWorkflows(prev => [...prev, {
                    name: workflow.name,
                    status: 'idle',
                    progress: 0
                  }]);
                  setActiveTab('diagram');
                  message.success('Workflow created successfully');
                }}
                darkMode={darkMode}
              />
            </Card>
          </TabPane>

          {/* Configuration Panel Tab */}
          <TabPane 
            tab={
              <span>
                <SettingOutlined />
                Configuration
              </span>
            } 
            key="config"
          >
            <Card>
              <WorkflowConfigPanel 
                workflows={workflows}
                selectedWorkflow={selectedWorkflow}
                onUpdate={loadWorkflows}
                darkMode={darkMode}
              />
            </Card>
          </TabPane>

          {/* Component Configurator Tab */}
          <TabPane 
            tab={
              <span>
                <AppstoreOutlined />
                Components
              </span>
            } 
            key="components"
          >
            <Card>
              <ComponentConfigurator 
                darkMode={darkMode}
              />
            </Card>
          </TabPane>

          {/* SVG Graphics Generator Tab */}
          <TabPane 
            tab={
              <span>
                <FileTextOutlined />
                Graphics Generator
              </span>
            } 
            key="graphics"
          >
            <Card>
              <SVGGraphicsGenerator 
                darkMode={darkMode}
              />
            </Card>
          </TabPane>
        </Tabs>
      </div>
    </div>
  );
};

export default WorkflowCreationDashboard;
