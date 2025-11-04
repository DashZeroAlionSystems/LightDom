/**
 * TensorFlow Neural Network Workflow Dashboard
 * 
 * Comprehensive dashboard for managing neural network workflows,
 * training data, and client SEO campaigns
 */

import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Tabs,
  Button,
  Table,
  Tag,
  Space,
  Statistic,
  Progress,
  Modal,
  Form,
  Input,
  Select,
  Switch,
  Timeline,
  Alert,
  Descriptions,
  Badge,
} from 'antd';
import {
  RocketOutlined,
  ThunderboltOutlined,
  DatabaseOutlined,
  ToolOutlined,
  ApiOutlined,
  BranchesOutlined,
  LineChartOutlined,
  SafetyOutlined,
  CloudUploadOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
} from '@ant-design/icons';

const { TabPane } = Tabs;
const { TextArea } = Input;
const { Option } = Select;

interface Workflow {
  id: string;
  name: string;
  description: string;
  type: string;
  status?: string;
  steps: any[];
  metadata: {
    createdAt: string;
    version: string;
  };
}

interface ServiceRegistry {
  id: string;
  name: string;
  type: string;
  endpoint: string;
  capabilities: string[];
  status: string;
}

interface Tool {
  name: string;
  description: string;
  parameters: any;
}

interface TrainingDataConfig {
  id: string;
  neuralNetworkId: string;
  dataType: string;
  status: string;
  metadata: {
    totalSamples: number;
    lastCollection?: string;
  };
}

export const TensorFlowNeuralNetworkDashboard: React.FC = () => {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [services, setServices] = useState<ServiceRegistry[]>([]);
  const [tools, setTools] = useState<Tool[]>([]);
  const [trainingConfigs, setTrainingConfigs] = useState<TrainingDataConfig[]>([]);
  const [systemStatus, setSystemStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [createWorkflowModal, setCreateWorkflowModal] = useState(false);
  const [executeToolModal, setExecuteToolModal] = useState(false);
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadData();
    // Refresh every 10 seconds
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [workflowsRes, servicesRes, toolsRes, configsRes, statusRes] = await Promise.all([
        fetch('/api/tensorflow/workflows').then(r => r.json()),
        fetch('/api/tensorflow/services').then(r => r.json()),
        fetch('/api/tensorflow/tools').then(r => r.json()),
        fetch('/api/tensorflow/training-data/configs').then(r => r.json()),
        fetch('/api/tensorflow/status').then(r => r.json()),
      ]);

      setWorkflows(workflowsRes);
      setServices(servicesRes);
      setTools(toolsRes);
      setTrainingConfigs(configsRes);
      setSystemStatus(statusRes);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const createWorkflowFromPrompt = async (values: any) => {
    setLoading(true);
    try {
      const response = await fetch('/api/tensorflow/workflows/from-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        await loadData();
        setCreateWorkflowModal(false);
        form.resetFields();
      }
    } catch (error) {
      console.error('Error creating workflow:', error);
    } finally {
      setLoading(false);
    }
  };

  const executeWorkflow = async (workflowId: string) => {
    setLoading(true);
    try {
      await fetch(`/api/tensorflow/workflows/${workflowId}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inputs: {} }),
      });

      await loadData();
    } catch (error) {
      console.error('Error executing workflow:', error);
    } finally {
      setLoading(false);
    }
  };

  const executeTool = async (values: any) => {
    if (!selectedTool) return;

    setLoading(true);
    try {
      await fetch(`/api/tensorflow/tools/${selectedTool.name}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ args: values }),
      });

      setExecuteToolModal(false);
      form.resetFields();
    } catch (error) {
      console.error('Error executing tool:', error);
    } finally {
      setLoading(false);
    }
  };

  const createMetaWorkflow = async () => {
    setLoading(true);
    try {
      await fetch('/api/tensorflow/workflows/meta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      await loadData();
    } catch (error) {
      console.error('Error creating meta-workflow:', error);
    } finally {
      setLoading(false);
    }
  };

  const collectTrainingData = async (configId: string) => {
    setLoading(true);
    try {
      await fetch(`/api/tensorflow/training-data/configs/${configId}/collect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      await loadData();
    } catch (error) {
      console.error('Error collecting training data:', error);
    } finally {
      setLoading(false);
    }
  };

  const workflowColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Workflow) => (
        <Space>
          <BranchesOutlined />
          <span>{text}</span>
          <Tag color={record.type === 'orchestration' ? 'blue' : 'green'}>{record.type}</Tag>
        </Space>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Steps',
      dataIndex: 'steps',
      key: 'steps',
      render: (steps: any[]) => steps.length,
    },
    {
      title: 'Created',
      dataIndex: ['metadata', 'createdAt'],
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Workflow) => (
        <Space>
          <Button
            type="primary"
            icon={<PlayCircleOutlined />}
            onClick={() => executeWorkflow(record.id)}
            loading={loading}
          >
            Execute
          </Button>
        </Space>
      ),
    },
  ];

  const serviceColumns = [
    {
      title: 'Service',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: ServiceRegistry) => (
        <Space>
          <ApiOutlined />
          <span>{text}</span>
          <Badge status={record.status === 'active' ? 'success' : 'error'} />
        </Space>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => <Tag>{type}</Tag>,
    },
    {
      title: 'Endpoint',
      dataIndex: 'endpoint',
      key: 'endpoint',
      render: (endpoint: string) => <code>{endpoint}</code>,
    },
    {
      title: 'Capabilities',
      dataIndex: 'capabilities',
      key: 'capabilities',
      render: (capabilities: string[]) => (
        <Space wrap>
          {capabilities.map(cap => (
            <Tag key={cap} color="blue">
              {cap}
            </Tag>
          ))}
        </Space>
      ),
    },
  ];

  const toolColumns = [
    {
      title: 'Tool',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => (
        <Space>
          <ToolOutlined />
          <code>{text}</code>
        </Space>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Tool) => (
        <Button
          type="link"
          onClick={() => {
            setSelectedTool(record);
            setExecuteToolModal(true);
          }}
        >
          Execute
        </Button>
      ),
    },
  ];

  const trainingDataColumns = [
    {
      title: 'Neural Network ID',
      dataIndex: 'neuralNetworkId',
      key: 'neuralNetworkId',
      render: (id: string) => <code>{id}</code>,
    },
    {
      title: 'Data Type',
      dataIndex: 'dataType',
      key: 'dataType',
      render: (type: string) => <Tag color="purple">{type}</Tag>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : status === 'paused' ? 'orange' : 'default'}>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Samples',
      dataIndex: ['metadata', 'totalSamples'],
      key: 'totalSamples',
    },
    {
      title: 'Last Collection',
      dataIndex: ['metadata', 'lastCollection'],
      key: 'lastCollection',
      render: (date?: string) => (date ? new Date(date).toLocaleString() : 'Never'),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: TrainingDataConfig) => (
        <Button
          type="primary"
          icon={<CloudUploadOutlined />}
          onClick={() => collectTrainingData(record.id)}
          loading={loading}
          disabled={record.status !== 'active'}
        >
          Collect Data
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card>
            <Row gutter={16}>
              <Col span={24}>
                <h1>
                  <RocketOutlined /> TensorFlow Neural Network Workflow Dashboard
                </h1>
                <p>
                  Orchestrate neural network workflows, manage training data, and automate SEO campaigns
                  with DeepSeek integration
                </p>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* System Status Cards */}
        {systemStatus && (
          <>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Active Workflows"
                  value={systemStatus.workflows?.total || 0}
                  prefix={<BranchesOutlined />}
                  suffix={`/ ${systemStatus.workflows?.activeExecutions || 0} running`}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Registered Services"
                  value={systemStatus.services?.registered || 0}
                  prefix={<ApiOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Available Tools"
                  value={systemStatus.tools?.available || 0}
                  prefix={<ToolOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Training Configs"
                  value={systemStatus.trainingData?.active || 0}
                  prefix={<DatabaseOutlined />}
                  suffix={`/ ${systemStatus.trainingData?.configurations || 0} total`}
                />
              </Card>
            </Col>
          </>
        )}

        {/* Main Content */}
        <Col span={24}>
          <Card>
            <Tabs defaultActiveKey="workflows">
              <TabPane tab={<span><BranchesOutlined /> Workflows</span>} key="workflows">
                <Space direction="vertical" style={{ width: '100%' }} size="large">
                  <Alert
                    message="Workflow Orchestration"
                    description="Create and manage workflows for neural network training, data collection, and self-improvement. Use DeepSeek to generate workflows from natural language prompts."
                    type="info"
                    showIcon
                  />

                  <Space>
                    <Button
                      type="primary"
                      icon={<ThunderboltOutlined />}
                      onClick={() => setCreateWorkflowModal(true)}
                    >
                      Create Workflow from Prompt
                    </Button>
                    <Button
                      icon={<BranchesOutlined />}
                      onClick={createMetaWorkflow}
                      loading={loading}
                    >
                      Create Meta-Workflow
                    </Button>
                  </Space>

                  <Table
                    columns={workflowColumns}
                    dataSource={workflows}
                    rowKey="id"
                    loading={loading}
                  />
                </Space>
              </TabPane>

              <TabPane tab={<span><ApiOutlined /> Services</span>} key="services">
                <Space direction="vertical" style={{ width: '100%' }} size="large">
                  <Alert
                    message="Service Registry"
                    description="View all registered services and their capabilities. These services can be integrated into workflows for automated orchestration."
                    type="info"
                    showIcon
                  />

                  <Table
                    columns={serviceColumns}
                    dataSource={services}
                    rowKey="id"
                    loading={loading}
                  />
                </Space>
              </TabPane>

              <TabPane tab={<span><ToolOutlined /> DeepSeek Tools</span>} key="tools">
                <Space direction="vertical" style={{ width: '100%' }} size="large">
                  <Alert
                    message="DeepSeek Integration Tools"
                    description="Puppeteer-based tools for web automation, schema extraction, and data collection. These tools enable DeepSeek to interact with the web and gather training data."
                    type="info"
                    showIcon
                  />

                  <Table
                    columns={toolColumns}
                    dataSource={tools}
                    rowKey="name"
                    loading={loading}
                  />
                </Space>
              </TabPane>

              <TabPane tab={<span><DatabaseOutlined /> Training Data</span>} key="training-data">
                <Space direction="vertical" style={{ width: '100%' }} size="large">
                  <Alert
                    message="Training Data Management"
                    description="Manage training data configurations for neural networks. Configure automated data collection from web crawlers, APIs, and databases."
                    type="info"
                    showIcon
                  />

                  <Table
                    columns={trainingDataColumns}
                    dataSource={trainingConfigs}
                    rowKey="id"
                    loading={loading}
                  />
                </Space>
              </TabPane>
            </Tabs>
          </Card>
        </Col>
      </Row>

      {/* Create Workflow Modal */}
      <Modal
        title={<span><ThunderboltOutlined /> Create Workflow from Prompt</span>}
        visible={createWorkflowModal}
        onOk={() => form.submit()}
        onCancel={() => {
          setCreateWorkflowModal(false);
          form.resetFields();
        }}
        confirmLoading={loading}
        width={600}
      >
        <Form form={form} onFinish={createWorkflowFromPrompt} layout="vertical">
          <Form.Item
            name="prompt"
            label="Workflow Description"
            rules={[{ required: true, message: 'Please enter a workflow description' }]}
          >
            <TextArea
              rows={4}
              placeholder="Describe the workflow you want to create, e.g., 'Create a workflow to collect SEO data from competitor websites and train a neural network to predict optimal keywords'"
            />
          </Form.Item>

          <Form.Item name="context" label="Additional Context (Optional)">
            <TextArea
              rows={2}
              placeholder='{"industry": "e-commerce", "targetAudience": "developers"}'
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Execute Tool Modal */}
      <Modal
        title={<span><ToolOutlined /> Execute Tool: {selectedTool?.name}</span>}
        visible={executeToolModal}
        onOk={() => form.submit()}
        onCancel={() => {
          setExecuteToolModal(false);
          form.resetFields();
          setSelectedTool(null);
        }}
        confirmLoading={loading}
        width={600}
      >
        {selectedTool && (
          <Form form={form} onFinish={executeTool} layout="vertical">
            <Alert
              message={selectedTool.description}
              type="info"
              style={{ marginBottom: 16 }}
            />

            {selectedTool.parameters?.required?.includes('url') && (
              <Form.Item
                name="url"
                label="URL"
                rules={[{ required: true, message: 'Please enter a URL' }]}
              >
                <Input placeholder="https://example.com" />
              </Form.Item>
            )}

            {selectedTool.parameters?.required?.includes('startUrl') && (
              <Form.Item
                name="startUrl"
                label="Start URL"
                rules={[{ required: true, message: 'Please enter a start URL' }]}
              >
                <Input placeholder="https://example.com" />
              </Form.Item>
            )}

            {selectedTool.parameters?.properties?.dataType && (
              <Form.Item name="dataType" label="Data Type">
                <Select placeholder="Select data type">
                  <Option value="seo">SEO</Option>
                  <Option value="ui-patterns">UI Patterns</Option>
                  <Option value="content">Content</Option>
                  <Option value="workflow">Workflow</Option>
                </Select>
              </Form.Item>
            )}

            {selectedTool.parameters?.properties?.maxPages && (
              <Form.Item name="maxPages" label="Max Pages">
                <Input type="number" placeholder="10" />
              </Form.Item>
            )}
          </Form>
        )}
      </Modal>
    </div>
  );
};

export default TensorFlowNeuralNetworkDashboard;
