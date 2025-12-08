import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Input,
  Select,
  Tabs,
  Table,
  Space,
  Tag,
  Timeline,
  Progress,
  Alert,
  Row,
  Col,
  Statistic,
  Modal,
  Form,
  message,
  Spin
} from 'antd';
import {
  RocketOutlined,
  ThunderboltOutlined,
  CodeOutlined,
  DashboardOutlined,
  ApiOutlined,
  BranchesOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  SettingOutlined
} from '@ant-design/icons';

const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

/**
 * Agent Orchestration Dashboard
 * 
 * Central control panel for agent-driven workflows:
 * - Natural language prompts to generate components/dashboards/services
 * - Real-time workflow monitoring
 * - Component library management
 * - Schema configuration
 * - Workflow history
 */
export const AgentOrchestrationDashboard: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeWorkflows, setActiveWorkflows] = useState<any[]>([]);
  const [workflowHistory, setWorkflowHistory] = useState<any[]>([]);
  const [components, setComponents] = useState<any[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [stats, setStats] = useState({
    totalGenerated: 0,
    successRate: 0,
    activeWorkflows: 0,
    componentsGenerated: 0
  });

  // Sample prompts for quick start
  const samplePrompts = [
    'Create a button component with primary, secondary, and danger variants',
    'Generate a dashboard for user analytics with charts and tables',
    'Create a service for managing user authentication',
    'Build a workflow for automated SEO optimization',
    'Generate a data table component with sorting and filtering'
  ];

  const intentTypes = [
    { value: 'component', label: 'Component', icon: <CodeOutlined />, color: 'blue' },
    { value: 'dashboard', label: 'Dashboard', icon: <DashboardOutlined />, color: 'purple' },
    { value: 'service', label: 'Service', icon: <ApiOutlined />, color: 'green' },
    { value: 'workflow', label: 'Workflow', icon: <BranchesOutlined />, color: 'orange' },
  ];

  useEffect(() => {
    // Load initial data
    loadWorkflows();
    loadComponents();
    loadStats();
    
    // Refresh every 5 seconds
    const interval = setInterval(() => {
      loadWorkflows();
      loadStats();
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const loadWorkflows = async () => {
    try {
      // Mock data - replace with actual API call
      const mockActiveWorkflows = [];
      const mockHistory = [
        {
          id: 'workflow-1',
          prompt: 'Create a button component',
          status: 'completed',
          intent: { type: 'component' },
          startedAt: new Date(Date.now() - 300000).toISOString(),
          completedAt: new Date(Date.now() - 240000).toISOString()
        },
        {
          id: 'workflow-2',
          prompt: 'Generate analytics dashboard',
          status: 'completed',
          intent: { type: 'dashboard' },
          startedAt: new Date(Date.now() - 600000).toISOString(),
          completedAt: new Date(Date.now() - 480000).toISOString()
        }
      ];
      
      setActiveWorkflows(mockActiveWorkflows);
      setWorkflowHistory(mockHistory);
    } catch (error) {
      console.error('Failed to load workflows:', error);
    }
  };

  const loadComponents = async () => {
    try {
      // Mock data
      const mockComponents = [
        { name: 'Button', type: 'atom', generated: true, usageCount: 15 },
        { name: 'Input', type: 'atom', generated: true, usageCount: 12 },
        { name: 'Card', type: 'molecule', generated: true, usageCount: 8 },
        { name: 'DataTable', type: 'organism', generated: false, usageCount: 5 }
      ];
      
      setComponents(mockComponents);
    } catch (error) {
      console.error('Failed to load components:', error);
    }
  };

  const loadStats = async () => {
    try {
      setStats({
        totalGenerated: workflowHistory.length,
        successRate: 95,
        activeWorkflows: activeWorkflows.length,
        componentsGenerated: components.length
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const executeWorkflow = async () => {
    if (!prompt.trim()) {
      message.warning('Please enter a prompt');
      return;
    }

    setLoading(true);
    
    try {
      // Call API endpoint
      const response = await fetch('/api/agent/orchestrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });

      if (!response.ok) throw new Error('Workflow execution failed');

      const result = await response.json();
      
      message.success('Workflow completed successfully!');
      setPrompt('');
      loadWorkflows();
      loadComponents();
      setSelectedWorkflow(result);
      setShowDetails(true);
      
    } catch (error) {
      message.error(`Failed to execute workflow: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const getStatusTag = (status: string) => {
    const statusMap: Record<string, { color: string; icon: React.ReactNode }> = {
      processing: { color: 'blue', icon: <ClockCircleOutlined /> },
      completed: { color: 'success', icon: <CheckCircleOutlined /> },
      failed: { color: 'error', icon: <CloseCircleOutlined /> }
    };
    
    const config = statusMap[status] || statusMap.processing;
    
    return <Tag color={config.color} icon={config.icon}>{status.toUpperCase()}</Tag>;
  };

  const getIntentTag = (type: string) => {
    const intent = intentTypes.find(i => i.value === type);
    if (!intent) return <Tag>{type}</Tag>;
    
    return (
      <Tag color={intent.color} icon={intent.icon}>
        {intent.label}
      </Tag>
    );
  };

  const workflowColumns = [
    {
      title: 'Workflow ID',
      dataIndex: 'id',
      key: 'id',
      width: 150
    },
    {
      title: 'Prompt',
      dataIndex: 'prompt',
      key: 'prompt',
      ellipsis: true
    },
    {
      title: 'Intent',
      dataIndex: ['intent', 'type'],
      key: 'intent',
      width: 120,
      render: (type: string) => getIntentTag(type)
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => getStatusTag(status)
    },
    {
      title: 'Duration',
      key: 'duration',
      width: 100,
      render: (_: any, record: any) => {
        if (!record.startedAt || !record.completedAt) return '-';
        const duration = Math.round((new Date(record.completedAt).getTime() - new Date(record.startedAt).getTime()) / 1000);
        return `${duration}s`;
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      render: (_: any, record: any) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => {
            setSelectedWorkflow(record);
            setShowDetails(true);
          }}
        >
          View
        </Button>
      )
    }
  ];

  const componentColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => <Tag>{type.toUpperCase()}</Tag>
    },
    {
      title: 'Generated',
      dataIndex: 'generated',
      key: 'generated',
      render: (generated: boolean) => generated ? <CheckCircleOutlined style={{ color: 'green' }} /> : '-'
    },
    {
      title: 'Usage Count',
      dataIndex: 'usageCount',
      key: 'usageCount'
    }
  ];

  return (
    <div className="agent-orchestration-dashboard" style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1>
          <RocketOutlined /> Agent Orchestration Dashboard
        </h1>
        <p>Generate components, dashboards, and services using natural language</p>
      </div>

      {/* Stats */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Generated"
              value={stats.totalGenerated}
              prefix={<ThunderboltOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Success Rate"
              value={stats.successRate}
              suffix="%"
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Active Workflows"
              value={stats.activeWorkflows}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Components"
              value={stats.componentsGenerated}
              prefix={<CodeOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Content */}
      <Row gutter={16}>
        {/* Left: Prompt Input */}
        <Col span={8}>
          <Card title="Generate from Prompt" extra={<SettingOutlined />}>
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <div>
                <TextArea
                  placeholder="Describe what you want to create..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={6}
                  disabled={loading}
                />
              </div>

              <div>
                <p style={{ marginBottom: 8, fontWeight: 500 }}>Sample Prompts:</p>
                <Space direction="vertical" style={{ width: '100%' }}>
                  {samplePrompts.map((sample, idx) => (
                    <Button
                      key={idx}
                      size="small"
                      style={{ width: '100%', textAlign: 'left', height: 'auto', padding: '8px 12px' }}
                      onClick={() => setPrompt(sample)}
                    >
                      {sample}
                    </Button>
                  ))}
                </Space>
              </div>

              <Button
                type="primary"
                size="large"
                icon={<RocketOutlined />}
                loading={loading}
                onClick={executeWorkflow}
                block
              >
                Execute Workflow
              </Button>
            </Space>
          </Card>
        </Col>

        {/* Right: Results & History */}
        <Col span={16}>
          <Card>
            <Tabs defaultActiveKey="history">
              <TabPane tab="Workflow History" key="history">
                <Table
                  dataSource={workflowHistory}
                  columns={workflowColumns}
                  rowKey="id"
                  pagination={{ pageSize: 10 }}
                />
              </TabPane>
              
              <TabPane tab="Component Library" key="components">
                <Table
                  dataSource={components}
                  columns={componentColumns}
                  rowKey="name"
                  pagination={{ pageSize: 10 }}
                />
              </TabPane>
              
              <TabPane tab="Active Workflows" key="active">
                {activeWorkflows.length > 0 ? (
                  <Timeline>
                    {activeWorkflows.map((workflow) => (
                      <Timeline.Item key={workflow.id} color="blue">
                        <p><strong>{workflow.prompt}</strong></p>
                        <p>Status: {getStatusTag(workflow.status)}</p>
                      </Timeline.Item>
                    ))}
                  </Timeline>
                ) : (
                  <Alert
                    message="No Active Workflows"
                    description="All workflows have completed."
                    type="info"
                    showIcon
                  />
                )}
              </TabPane>
            </Tabs>
          </Card>
        </Col>
      </Row>

      {/* Details Modal */}
      <Modal
        title={`Workflow Details: ${selectedWorkflow?.id || ''}`}
        open={showDetails}
        onCancel={() => setShowDetails(false)}
        footer={[
          <Button key="close" onClick={() => setShowDetails(false)}>
            Close
          </Button>
        ]}
        width={800}
      >
        {selectedWorkflow && (
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <div>
              <h4>Prompt</h4>
              <p>{selectedWorkflow.prompt}</p>
            </div>

            <div>
              <h4>Intent</h4>
              {getIntentTag(selectedWorkflow.intent?.type)}
              {selectedWorkflow.intent?.entities && (
                <pre style={{ marginTop: 8, background: '#f5f5f5', padding: 12 }}>
                  {JSON.stringify(selectedWorkflow.intent.entities, null, 2)}
                </pre>
              )}
            </div>

            {selectedWorkflow.steps && (
              <div>
                <h4>Execution Steps</h4>
                <Timeline>
                  {selectedWorkflow.steps.map((step: any, idx: number) => (
                    <Timeline.Item key={idx} color="green">
                      <strong>{step.step}</strong>
                      {step.result && (
                        <pre style={{ marginTop: 4, background: '#f5f5f5', padding: 8, fontSize: 12 }}>
                          {JSON.stringify(step.result, null, 2).substring(0, 200)}...
                        </pre>
                      )}
                    </Timeline.Item>
                  ))}
                </Timeline>
              </div>
            )}

            {selectedWorkflow.results && (
              <div>
                <h4>Results</h4>
                <Alert
                  message="Workflow Completed Successfully"
                  description={
                    <pre style={{ marginTop: 8 }}>
                      {JSON.stringify(selectedWorkflow.results, null, 2)}
                    </pre>
                  }
                  type="success"
                  showIcon
                />
              </div>
            )}
          </Space>
        )}
      </Modal>
    </div>
  );
};

export default AgentOrchestrationDashboard;
