/**
 * Workflow Management Dashboard
 * 
 * Comprehensive dashboard for managing visual workflows with:
 * - React Flow visual editor
 * - Workflow templates library
 * - AI-powered workflow generation
 * - Multi-instance environment management
 * - Real-time execution monitoring
 */

import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Tabs, 
  Button, 
  Space, 
  Table, 
  Tag, 
  message, 
  Modal, 
  Form, 
  Input,
  Select,
  Tooltip,
  Badge,
  Statistic,
  Row,
  Col,
} from 'antd';
import {
  PlayCircleOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CopyOutlined,
  DownloadOutlined,
  CloudUploadOutlined,
  ApiOutlined,
  RobotOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import EnhancedWorkflowBuilder from './EnhancedWorkflowBuilder';

const { TabPane } = Tabs;
const { TextArea } = Input;
const { Option } = Select;

interface Workflow {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'running' | 'error';
  nodes: any[];
  edges: any[];
  createdAt: string;
  updatedAt: string;
  tags?: string[];
  environment?: string;
}

interface WorkflowStats {
  total: number;
  active: number;
  running: number;
  executions: number;
}

export const WorkflowManagementDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('list');
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<WorkflowStats>({
    total: 0,
    active: 0,
    running: 0,
    executions: 0,
  });
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [environments, setEnvironments] = useState<string[]>(['production', 'staging', 'development']);
  const [selectedEnv, setSelectedEnv] = useState('development');

  // Load workflows on mount
  useEffect(() => {
    loadWorkflows();
    loadStats();
  }, [selectedEnv]);

  /**
   * Load workflows from API
   */
  const loadWorkflows = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/workflow-generator/config/summary?env=${selectedEnv}`);
      if (response.ok) {
        const data = await response.json();
        setWorkflows(data.workflows || []);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Failed to load workflows:', errorMessage, error);
      message.error(`Failed to load workflows: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Load workflow statistics
   */
  const loadStats = async () => {
    try {
      const response = await fetch(`/api/workflow-generator/stats?env=${selectedEnv}`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  /**
   * Create a new workflow
   */
  const handleCreateWorkflow = () => {
    setSelectedWorkflow(null);
    setActiveTab('builder');
  };

  /**
   * Edit an existing workflow
   */
  const handleEditWorkflow = (workflow: Workflow) => {
    setSelectedWorkflow(workflow);
    setActiveTab('builder');
  };

  /**
   * Execute a workflow
   */
  const handleExecuteWorkflow = async (workflowId: string) => {
    try {
      const response = await fetch(`/api/workflow-generator/execute/${workflowId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ environment: selectedEnv }),
      });

      if (response.ok) {
        message.success('Workflow execution started');
        loadWorkflows();
        loadStats();
      } else {
        throw new Error('Execution failed');
      }
    } catch (error) {
      console.error('Failed to execute workflow:', error);
      message.error('Failed to execute workflow');
    }
  };

  /**
   * Delete a workflow
   */
  const handleDeleteWorkflow = (workflowId: string) => {
    Modal.confirm({
      title: 'Delete Workflow',
      content: 'Are you sure you want to delete this workflow? This action cannot be undone.',
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          const response = await fetch(`/api/workflow-generator/config/${workflowId}`, {
            method: 'DELETE',
          });

          if (response.ok) {
            message.success('Workflow deleted');
            loadWorkflows();
            loadStats();
          } else {
            throw new Error('Delete failed');
          }
        } catch (error) {
          console.error('Failed to delete workflow:', error);
          message.error('Failed to delete workflow');
        }
      },
    });
  };

  /**
   * Duplicate a workflow
   */
  const handleDuplicateWorkflow = async (workflow: Workflow) => {
    try {
      const response = await fetch('/api/workflow-generator/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...workflow,
          name: `${workflow.name} (Copy)`,
          id: undefined,
        }),
      });

      if (response.ok) {
        message.success('Workflow duplicated');
        loadWorkflows();
      } else {
        throw new Error('Duplication failed');
      }
    } catch (error) {
      console.error('Failed to duplicate workflow:', error);
      message.error('Failed to duplicate workflow');
    }
  };

  /**
   * Export workflow
   */
  const handleExportWorkflow = (workflow: Workflow) => {
    const blob = new Blob([JSON.stringify(workflow, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${workflow.name.replace(/\s+/g, '-').toLowerCase()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    message.success('Workflow exported');
  };

  /**
   * Save workflow from builder
   */
  const handleSaveWorkflow = async (workflowData: any) => {
    try {
      const url = selectedWorkflow
        ? `/api/workflow-generator/config/${selectedWorkflow.id}`
        : '/api/workflow-generator/create';
      
      const method = selectedWorkflow ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...workflowData,
          environment: selectedEnv,
        }),
      });

      if (response.ok) {
        message.success(`Workflow ${selectedWorkflow ? 'updated' : 'created'} successfully`);
        setActiveTab('list');
        loadWorkflows();
        loadStats();
      } else {
        throw new Error('Save failed');
      }
    } catch (error) {
      console.error('Failed to save workflow:', error);
      message.error('Failed to save workflow');
    }
  };

  // Workflow table columns
  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Workflow) => (
        <Space>
          <strong>{text}</strong>
          {record.tags?.map(tag => (
            <Tag key={tag} color="blue">{tag}</Tag>
          ))}
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const colorMap: Record<string, string> = {
          active: 'green',
          inactive: 'default',
          running: 'blue',
          error: 'red',
        };
        return <Tag color={colorMap[status] || 'default'}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Nodes',
      dataIndex: 'nodes',
      key: 'nodes',
      render: (nodes: any[]) => nodes?.length || 0,
    },
    {
      title: 'Updated',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Workflow) => (
        <Space>
          <Tooltip title="Execute">
            <Button
              icon={<PlayCircleOutlined />}
              onClick={() => handleExecuteWorkflow(record.id)}
              type="primary"
              size="small"
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button
              icon={<EditOutlined />}
              onClick={() => handleEditWorkflow(record)}
              size="small"
            />
          </Tooltip>
          <Tooltip title="Duplicate">
            <Button
              icon={<CopyOutlined />}
              onClick={() => handleDuplicateWorkflow(record)}
              size="small"
            />
          </Tooltip>
          <Tooltip title="Export">
            <Button
              icon={<DownloadOutlined />}
              onClick={() => handleExportWorkflow(record)}
              size="small"
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button
              icon={<DeleteOutlined />}
              onClick={() => handleDeleteWorkflow(record.id)}
              danger
              size="small"
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      {/* Header with Stats */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic title="Total Workflows" value={stats.total} prefix={<ApiOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Active" value={stats.active} prefix={<PlayCircleOutlined />} valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Running" value={stats.running} prefix={<Badge status="processing" />} valueStyle={{ color: '#1890ff' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Total Executions" value={stats.executions} />
          </Card>
        </Col>
      </Row>

      {/* Main Content */}
      <Card
        title="Workflow Management"
        extra={
          <Space>
            <Select
              value={selectedEnv}
              onChange={setSelectedEnv}
              style={{ width: 150 }}
            >
              {environments.map(env => (
                <Option key={env} value={env}>{env}</Option>
              ))}
            </Select>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreateWorkflow}
            >
              Create Workflow
            </Button>
            <Button icon={<CloudUploadOutlined />} onClick={() => setImportModalVisible(true)}>
              Import
            </Button>
          </Space>
        }
      >
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="Workflows List" key="list">
            <Table
              columns={columns}
              dataSource={workflows}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 10 }}
            />
          </TabPane>

          <TabPane tab="Visual Builder" key="builder">
            <EnhancedWorkflowBuilder
              initialWorkflow={selectedWorkflow ? {
                nodes: selectedWorkflow.nodes,
                edges: selectedWorkflow.edges,
                name: selectedWorkflow.name,
                description: selectedWorkflow.description,
              } : undefined}
              onSave={handleSaveWorkflow}
              onExecute={handleExecuteWorkflow}
            />
          </TabPane>

          <TabPane tab="Templates" key="templates">
            <div style={{ padding: 24 }}>
              <h3>Workflow Templates</h3>
              <p>Pre-built workflow templates for common use cases</p>
              {/* Template gallery would go here */}
            </div>
          </TabPane>

          <TabPane tab="Settings" key="settings">
            <div style={{ padding: 24 }}>
              <h3>Workflow Settings</h3>
              <Form layout="vertical">
                <Form.Item label="Default Environment">
                  <Select defaultValue="development">
                    {environments.map(env => (
                      <Option key={env} value={env}>{env}</Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item label="Auto-save Interval (seconds)">
                  <Input type="number" defaultValue={30} />
                </Form.Item>
                <Form.Item>
                  <Button type="primary">Save Settings</Button>
                </Form.Item>
              </Form>
            </div>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default WorkflowManagementDashboard;
