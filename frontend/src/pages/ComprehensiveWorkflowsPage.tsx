/**
 * Comprehensive Workflows Page
 * Main page for workflow management with AI-powered creation and TensorFlow integration
 */

import React, { useState, useEffect } from 'react';
import { Card, Tabs, Button, Space, message, Drawer, Empty } from 'antd';
import {
  PlusOutlined,
  ThunderboltOutlined,
  DatabaseOutlined,
  LineChartOutlined,
  RocketOutlined,
} from '@ant-design/icons';
import WorkflowListPanel, { Workflow } from '../components/WorkflowListPanel';
import PromptWorkflowCreator from '../components/PromptWorkflowCreator';
import TensorFlowDashboard from '../components/TensorFlowDashboard';

const { TabPane } = Tabs;

export const ComprehensiveWorkflowsPage: React.FC = () => {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [detailsDrawerVisible, setDetailsDrawerVisible] = useState(false);

  useEffect(() => {
    loadWorkflows();
  }, []);

  const loadWorkflows = async () => {
    setLoading(true);
    try {
      // In production, fetch from API
      const mockWorkflows: Workflow[] = [
        {
          id: 'wf-1',
          name: 'Product Price Scraper',
          description: 'Scrapes product prices from e-commerce sites daily',
          status: 'idle',
          type: 'web-scraping',
          category: 'data-mining',
          runs: 45,
          successRate: 98,
          lastRun: new Date(Date.now() - 3600000).toISOString(),
          createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
          author: 'System',
        },
        {
          id: 'wf-2',
          name: 'SEO Content Analyzer',
          description: 'Analyzes content for SEO optimization using AI',
          status: 'completed',
          type: 'analysis',
          category: 'seo',
          runs: 120,
          successRate: 95,
          lastRun: new Date(Date.now() - 1800000).toISOString(),
          createdAt: new Date(Date.now() - 86400000 * 14).toISOString(),
          author: 'Admin',
        },
        {
          id: 'wf-3',
          name: 'ML Model Training Pipeline',
          description: 'Trains TensorFlow models on collected data',
          status: 'running',
          type: 'ml-training',
          category: 'machine-learning',
          runs: 23,
          successRate: 87,
          lastRun: new Date().toISOString(),
          createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
          author: 'ML Team',
        },
        {
          id: 'wf-4',
          name: 'Competitor Analysis',
          description: 'Tracks competitor pricing and features',
          status: 'idle',
          type: 'analysis',
          category: 'competitive-intelligence',
          runs: 67,
          successRate: 92,
          lastRun: new Date(Date.now() - 7200000).toISOString(),
          createdAt: new Date(Date.now() - 86400000 * 21).toISOString(),
          author: 'Marketing',
        },
        {
          id: 'wf-5',
          name: 'Training Data Collection',
          description: 'Collects and preprocesses data for ML training',
          status: 'completed',
          type: 'data-collection',
          category: 'data-mining',
          runs: 89,
          successRate: 96,
          lastRun: new Date(Date.now() - 900000).toISOString(),
          createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
          author: 'Data Team',
        },
      ];
      setWorkflows(mockWorkflows);
    } catch (error) {
      message.error('Failed to load workflows');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRunWorkflow = async (id: string) => {
    try {
      // In production, call API to run workflow
      setWorkflows(workflows.map(w =>
        w.id === id ? { ...w, status: 'running' as const } : w
      ));
      message.success('Workflow started successfully');
      
      // Simulate completion after 5 seconds
      setTimeout(() => {
        setWorkflows(prev => prev.map(w =>
          w.id === id
            ? {
                ...w,
                status: 'completed' as const,
                runs: w.runs + 1,
                lastRun: new Date().toISOString(),
              }
            : w
        ));
        message.success('Workflow completed successfully');
      }, 5000);
    } catch (error) {
      message.error('Failed to start workflow');
      console.error(error);
    }
  };

  const handlePauseWorkflow = async (id: string) => {
    try {
      setWorkflows(workflows.map(w =>
        w.id === id ? { ...w, status: 'paused' as const } : w
      ));
      message.info('Workflow paused');
    } catch (error) {
      message.error('Failed to pause workflow');
      console.error(error);
    }
  };

  const handleCloneWorkflow = async (id: string) => {
    try {
      const workflow = workflows.find(w => w.id === id);
      if (!workflow) return;

      const cloned: Workflow = {
        ...workflow,
        id: `wf-${Date.now()}`,
        name: `${workflow.name} (Copy)`,
        status: 'idle',
        runs: 0,
        createdAt: new Date().toISOString(),
      };

      setWorkflows([...workflows, cloned]);
      message.success('Workflow cloned successfully');
    } catch (error) {
      message.error('Failed to clone workflow');
      console.error(error);
    }
  };

  const handleEditWorkflow = (id: string) => {
    message.info('Edit workflow functionality would open here');
    // In production, open edit modal/page
  };

  const handleDeleteWorkflow = async (id: string) => {
    try {
      setWorkflows(workflows.filter(w => w.id !== id));
      message.success('Workflow deleted successfully');
    } catch (error) {
      message.error('Failed to delete workflow');
      console.error(error);
    }
  };

  const handleViewWorkflow = (id: string) => {
    const workflow = workflows.find(w => w.id === id);
    if (workflow) {
      setSelectedWorkflow(workflow);
      setDetailsDrawerVisible(true);
    }
  };

  const handleCreateWorkflow = (config: any) => {
    const newWorkflow: Workflow = {
      id: `wf-${Date.now()}`,
      name: config.name,
      description: config.description,
      status: 'idle',
      type: 'custom',
      category: config.category,
      runs: 0,
      successRate: 0,
      createdAt: new Date().toISOString(),
      author: 'User',
    };

    setWorkflows([...workflows, newWorkflow]);
    message.success('Workflow created successfully!');
  };

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
      <Card
        title={
          <Space>
            <ThunderboltOutlined style={{ fontSize: 24, color: '#1890ff' }} />
            <span style={{ fontSize: 24, fontWeight: 600 }}>Workflow Management</span>
          </Space>
        }
        bordered={false}
      >
        <Tabs defaultActiveKey="workflows" size="large">
          <TabPane
            tab={
              <span>
                <DatabaseOutlined />
                Workflows
              </span>
            }
            key="workflows"
          >
            <WorkflowListPanel
              workflows={workflows}
              loading={loading}
              onRun={handleRunWorkflow}
              onPause={handlePauseWorkflow}
              onClone={handleCloneWorkflow}
              onEdit={handleEditWorkflow}
              onDelete={handleDeleteWorkflow}
              onView={handleViewWorkflow}
              onCreate={() => setCreateModalVisible(true)}
            />
          </TabPane>

          <TabPane
            tab={
              <span>
                <LineChartOutlined />
                TensorFlow Training
              </span>
            }
            key="tensorflow"
          >
            <TensorFlowDashboard />
          </TabPane>

          <TabPane
            tab={
              <span>
                <RocketOutlined />
                Templates
              </span>
            }
            key="templates"
          >
            <Card title="Workflow Templates">
              <Empty description="Workflow templates coming soon" />
            </Card>
          </TabPane>
        </Tabs>
      </Card>

      <PromptWorkflowCreator
        visible={createModalVisible}
        onClose={() => setCreateModalVisible(false)}
        onComplete={handleCreateWorkflow}
      />

      <Drawer
        title="Workflow Details"
        placement="right"
        onClose={() => setDetailsDrawerVisible(false)}
        open={detailsDrawerVisible}
        width={600}
      >
        {selectedWorkflow && (
          <div>
            <h3>{selectedWorkflow.name}</h3>
            <p>{selectedWorkflow.description}</p>
            <Card title="Statistics" size="small" style={{ marginTop: 16 }}>
              <p><strong>Status:</strong> {selectedWorkflow.status}</p>
              <p><strong>Total Runs:</strong> {selectedWorkflow.runs}</p>
              <p><strong>Success Rate:</strong> {selectedWorkflow.successRate}%</p>
              <p><strong>Category:</strong> {selectedWorkflow.category}</p>
              <p><strong>Created:</strong> {new Date(selectedWorkflow.createdAt).toLocaleString()}</p>
              {selectedWorkflow.lastRun && (
                <p><strong>Last Run:</strong> {new Date(selectedWorkflow.lastRun).toLocaleString()}</p>
              )}
            </Card>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default ComprehensiveWorkflowsPage;
