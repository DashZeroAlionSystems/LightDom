/**
 * Campaign Training Admin Dashboard
 * 
 * Comprehensive admin dashboard for monitoring:
 * - All client campaigns and training status
 * - Workflow state machines and simulations
 * - 3D DOM mining results with rich snippets
 * - Component data library
 * - Training data models
 */

import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Table,
  Tag,
  Space,
  Statistic,
  Progress,
  Button,
  Tabs,
  Alert,
  Badge,
  Timeline,
  Descriptions,
  Modal,
  Input,
  Form,
  Select,
  Tree,
} from 'antd';
import {
  DashboardOutlined,
  TeamOutlined,
  RocketOutlined,
  ThunderboltOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  PlayCircleOutlined,
  BranchesOutlined,
  DatabaseOutlined,
  CodeOutlined,
} from '@ant-design/icons';
import DOM3DVisualization from '../visualizations/DOM3DVisualization';

const { TabPane } = Tabs;
const { TextArea } = Input;
const { Option } = Select;

interface CampaignStatus {
  campaignId: string;
  clientId: string;
  dataCollectionStatus: string;
  trainingStatus: string;
  metrics: {
    totalSamples: number;
    lastCollectionTime: string;
    collectionRate: number;
    trainingAccuracy: number;
  };
  health: {
    status: string;
    issues: string[];
  };
}

interface ClientStatus {
  clientId: string;
  planType: string;
  campaigns: CampaignStatus[];
  totalCampaigns: number;
  activeCampaigns: number;
  totalSamples: number;
  avgAccuracy: number;
  status: string;
}

export const CampaignTrainingAdminDashboard: React.FC = () => {
  const [campaigns, setCampaigns] = useState<CampaignStatus[]>([]);
  const [clients, setClients] = useState<ClientStatus[]>([]);
  const [miningResults, setMiningResults] = useState<any[]>([]);
  const [componentLibrary, setComponentLibrary] = useState<any[]>([]);
  const [trainingModels, setTrainingModels] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [simulateModalVisible, setSimulateModalVisible] = useState(false);
  const [visualizationModalVisible, setVisualizationModalVisible] = useState(false);
  const [selectedMiningResult, setSelectedMiningResult] = useState<any>(null);
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadData();
    // Refresh every 30 seconds
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [campaignsRes, clientsRes, miningRes, componentRes, modelsRes] = await Promise.all([
        fetch('/api/workflow/monitoring/campaigns').then(r => r.json()),
        fetch('/api/workflow/monitoring/clients').then(r => r.json()),
        fetch('/api/workflow/mining/results?limit=20').then(r => r.json()),
        fetch('/api/workflow/components/library').then(r => r.json()),
        fetch('/api/workflow/training-models?isTemplate=true').then(r => r.json()),
      ]);

      setCampaigns(campaignsRes);
      setClients(clientsRes);
      setMiningResults(miningRes);
      setComponentLibrary(componentRes);
      setTrainingModels(modelsRes);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateSimulation = async (values: any) => {
    try {
      setLoading(true);
      const response = await fetch('/api/workflow/state-machine/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workflowId: selectedWorkflow,
          requirements: values.requirements,
        }),
      });

      const plan = await response.json();
      Modal.info({
        title: 'Simulation Plan Generated',
        width: 800,
        content: (
          <div>
            <p><strong>Plan ID:</strong> {plan.id}</p>
            <p><strong>Estimated Duration:</strong> {plan.estimatedDuration} seconds</p>
            <p><strong>Steps:</strong> {plan.steps.length}</p>
            <Timeline>
              {plan.steps.map((step: any, idx: number) => (
                <Timeline.Item key={idx}>
                  <strong>Step {step.stepNumber}:</strong> {step.action}
                  <br />
                  <small>Duration: {step.duration}s</small>
                </Timeline.Item>
              ))}
            </Timeline>
          </div>
        ),
      });

      setSimulateModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('Error generating simulation:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'warning': return <WarningOutlined style={{ color: '#faad14' }} />;
      case 'critical': return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
      default: return <ClockCircleOutlined style={{ color: '#d9d9d9' }} />;
    }
  };

  const campaignColumns = [
    {
      title: 'Campaign ID',
      dataIndex: 'campaignId',
      key: 'campaignId',
      render: (id: string) => <code>{id}</code>,
    },
    {
      title: 'Client ID',
      dataIndex: 'clientId',
      key: 'clientId',
    },
    {
      title: 'Collection Status',
      dataIndex: 'dataCollectionStatus',
      key: 'dataCollectionStatus',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : status === 'paused' ? 'orange' : 'red'}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Training Status',
      dataIndex: 'trainingStatus',
      key: 'trainingStatus',
      render: (status: string) => (
        <Tag color={status === 'in_progress' ? 'blue' : status === 'completed' ? 'green' : 'default'}>
          {status.replace('_', ' ').toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Samples',
      dataIndex: ['metrics', 'totalSamples'],
      key: 'samples',
      render: (samples: number) => samples.toLocaleString(),
    },
    {
      title: 'Accuracy',
      dataIndex: ['metrics', 'trainingAccuracy'],
      key: 'accuracy',
      render: (accuracy: number) => (
        <Progress
          percent={accuracy}
          size="small"
          strokeColor={accuracy > 80 ? '#52c41a' : accuracy > 60 ? '#faad14' : '#ff4d4f'}
        />
      ),
    },
    {
      title: 'Collection Rate',
      dataIndex: ['metrics', 'collectionRate'],
      key: 'rate',
      render: (rate: number) => `${rate.toFixed(2)}/hr`,
    },
    {
      title: 'Health',
      dataIndex: ['health', 'status'],
      key: 'health',
      render: (status: string, record: CampaignStatus) => (
        <Space>
          {getStatusIcon(status)}
          <span>{status}</span>
          {record.health.issues.length > 0 && (
            <Badge count={record.health.issues.length} />
          )}
        </Space>
      ),
    },
  ];

  const clientColumns = [
    {
      title: 'Client ID',
      dataIndex: 'clientId',
      key: 'clientId',
      render: (id: string) => <strong>{id}</strong>,
    },
    {
      title: 'Plan',
      dataIndex: 'planType',
      key: 'planType',
      render: (plan: string) => <Tag color="blue">{plan.toUpperCase()}</Tag>,
    },
    {
      title: 'Total Campaigns',
      dataIndex: 'totalCampaigns',
      key: 'totalCampaigns',
    },
    {
      title: 'Active Campaigns',
      dataIndex: 'activeCampaigns',
      key: 'activeCampaigns',
      render: (active: number, record: ClientStatus) => (
        <span style={{ color: active > 0 ? '#52c41a' : '#d9d9d9' }}>
          {active} / {record.totalCampaigns}
        </span>
      ),
    },
    {
      title: 'Total Samples',
      dataIndex: 'totalSamples',
      key: 'totalSamples',
      render: (samples: number) => samples.toLocaleString(),
    },
    {
      title: 'Avg Accuracy',
      dataIndex: 'avgAccuracy',
      key: 'avgAccuracy',
      render: (accuracy: number) => `${accuracy.toFixed(1)}%`,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Badge
          status={status === 'active' ? 'success' : 'default'}
          text={status.toUpperCase()}
        />
      ),
    },
  ];

  const miningColumns = [
    {
      title: 'URL',
      dataIndex: 'url',
      key: 'url',
      ellipsis: true,
    },
    {
      title: 'SEO Score',
      dataIndex: 'seo_score',
      key: 'seo_score',
      render: (score: number) => (
        <Progress
          type="circle"
          percent={score}
          width={50}
          strokeColor={score > 70 ? '#52c41a' : score > 40 ? '#faad14' : '#ff4d4f'}
        />
      ),
    },
    {
      title: 'Rich Snippets',
      dataIndex: 'snippet_count',
      key: 'snippet_count',
      render: (count: number) => <Badge count={count} showZero />,
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Button
          icon={<EyeOutlined />}
          onClick={async () => {
            // Fetch full mining result
            const response = await fetch(`/api/workflow/mining/results/${record.id}`);
            const fullResult = await response.json();
            setSelectedMiningResult(fullResult);
            setVisualizationModalVisible(true);
          }}
        >
          View 3D
        </Button>
      ),
    },
  ];

  // Calculate summary stats
  const totalCampaigns = campaigns.length;
  const activeCampaigns = campaigns.filter(c => c.dataCollectionStatus === 'active').length;
  const healthyCampaigns = campaigns.filter(c => c.health.status === 'healthy').length;
  const avgAccuracy = campaigns.length > 0
    ? campaigns.reduce((sum, c) => sum + c.metrics.trainingAccuracy, 0) / campaigns.length
    : 0;

  return (
    <div style={{ padding: '24px' }}>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card>
            <h1>
              <DashboardOutlined /> Campaign Training Admin Dashboard
            </h1>
            <p>Monitor all client campaigns, training data collection, and workflow execution</p>
          </Card>
        </Col>

        {/* Summary Stats */}
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Campaigns"
              value={totalCampaigns}
              prefix={<RocketOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Active Campaigns"
              value={activeCampaigns}
              prefix={<ThunderboltOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Healthy Campaigns"
              value={healthyCampaigns}
              prefix={<CheckCircleOutlined />}
              suffix={`/ ${totalCampaigns}`}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Avg Accuracy"
              value={avgAccuracy.toFixed(1)}
              suffix="%"
              prefix={<DatabaseOutlined />}
              valueStyle={{ color: avgAccuracy > 80 ? '#52c41a' : '#faad14' }}
            />
          </Card>
        </Col>

        {/* Main Content */}
        <Col span={24}>
          <Card>
            <Tabs defaultActiveKey="campaigns">
              <TabPane tab={<span><RocketOutlined /> Campaigns</span>} key="campaigns">
                <Space direction="vertical" style={{ width: '100%' }} size="large">
                  <Alert
                    message="Real-time Campaign Monitoring"
                    description="Monitor training data collection status, neural network training progress, and system health for all campaigns"
                    type="info"
                    showIcon
                  />
                  
                  <Table
                    columns={campaignColumns}
                    dataSource={campaigns}
                    rowKey="campaignId"
                    loading={loading}
                    scroll={{ x: 1200 }}
                  />
                </Space>
              </TabPane>

              <TabPane tab={<span><TeamOutlined /> Clients</span>} key="clients">
                <Space direction="vertical" style={{ width: '100%' }} size="large">
                  <Alert
                    message="Client Overview"
                    description="View all clients with their campaign statistics, training progress, and account status"
                    type="info"
                    showIcon
                  />
                  
                  <Table
                    columns={clientColumns}
                    dataSource={clients}
                    rowKey="clientId"
                    loading={loading}
                  />
                </Space>
              </TabPane>

              <TabPane tab={<span><BranchesOutlined /> Workflows</span>} key="workflows">
                <Space direction="vertical" style={{ width: '100%' }} size="large">
                  <Alert
                    message="Workflow State Machine & Simulation"
                    description="DeepSeek can generate simulation plans, manage workflow states, and execute complex workflows via linked schemas"
                    type="info"
                    showIcon
                  />
                  
                  <Button
                    type="primary"
                    icon={<PlayCircleOutlined />}
                    onClick={() => setSimulateModalVisible(true)}
                  >
                    Generate Simulation Plan
                  </Button>

                  <Card title="Workflow Benefits">
                    <ul>
                      <li>State machine automatically manages workflow execution</li>
                      <li>Linked schemas enable data flow between workflow steps</li>
                      <li>DeepSeek generates optimized execution plans</li>
                      <li>Tasks and subtasks organized hierarchically</li>
                      <li>Real-time status monitoring for all executions</li>
                    </ul>
                  </Card>
                </Space>
              </TabPane>

              <TabPane tab={<span><EyeOutlined /> 3D DOM Mining</span>} key="mining">
                <Space direction="vertical" style={{ width: '100%' }} size="large">
                  <Alert
                    message="Chrome Layers 3D + Rich Snippets"
                    description="Mine websites for 3D DOM structure, extract rich snippets, and link schema.org markup to DOM elements"
                    type="info"
                    showIcon
                  />
                  
                  <Table
                    columns={miningColumns}
                    dataSource={miningResults}
                    rowKey="id"
                    loading={loading}
                  />
                </Space>
              </TabPane>

              <TabPane tab={<span><CodeOutlined /> Component Library</span>} key="components">
                <Space direction="vertical" style={{ width: '100%' }} size="large">
                  <Alert
                    message="Reusable Component Data"
                    description="Save and reuse component schemas, data templates, and configurations across workflows"
                    type="info"
                    showIcon
                  />
                  
                  <Row gutter={16}>
                    {componentLibrary.slice(0, 6).map(comp => (
                      <Col xs={24} sm={12} md={8} key={comp.id}>
                        <Card
                          title={comp.name}
                          extra={<Badge count={comp.usage_count} style={{ backgroundColor: '#52c41a' }} />}
                        >
                          <Descriptions size="small" column={1}>
                            <Descriptions.Item label="Category">{comp.category}</Descriptions.Item>
                            <Descriptions.Item label="Type">{comp.component_type}</Descriptions.Item>
                          </Descriptions>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                </Space>
              </TabPane>

              <TabPane tab={<span><DatabaseOutlined /> Training Models</span>} key="models">
                <Space direction="vertical" style={{ width: '100%' }} size="large">
                  <Alert
                    message="Training Data Model Templates"
                    description="Pre-configured training data models with schemas, validation rules, and preprocessing pipelines"
                    type="info"
                    showIcon
                  />
                  
                  <Row gutter={16}>
                    {trainingModels.map(model => (
                      <Col xs={24} sm={12} key={model.id}>
                        <Card title={model.name}>
                          <Descriptions size="small" column={1}>
                            <Descriptions.Item label="Type">{model.model_type}</Descriptions.Item>
                            <Descriptions.Item label="Min Samples">
                              {model.data_requirements.minSamples}
                            </Descriptions.Item>
                            <Descriptions.Item label="Usage Count">
                              {model.usage_count || 0}
                            </Descriptions.Item>
                          </Descriptions>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                </Space>
              </TabPane>
            </Tabs>
          </Card>
        </Col>
      </Row>

      {/* Simulation Modal */}
      <Modal
        title="Generate Workflow Simulation Plan"
        visible={simulateModalVisible}
        onOk={() => form.submit()}
        onCancel={() => setSimulateModalVisible(false)}
        confirmLoading={loading}
      >
        <Form form={form} onFinish={generateSimulation} layout="vertical">
          <Form.Item
            name="workflowId"
            label="Workflow ID"
            rules={[{ required: true, message: 'Please enter workflow ID' }]}
          >
            <Input placeholder="workflow-123" onChange={e => setSelectedWorkflow(e.target.value)} />
          </Form.Item>

          <Form.Item
            name="requirements"
            label="Requirements Description"
            rules={[{ required: true, message: 'Please describe requirements' }]}
          >
            <TextArea
              rows={4}
              placeholder="Describe what you want the workflow to accomplish..."
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* 3D Visualization Modal */}
      <Modal
        title="3D DOM Visualization & Schema Analysis"
        visible={visualizationModalVisible}
        onCancel={() => setVisualizationModalVisible(false)}
        width="95%"
        style={{ top: 20 }}
        footer={null}
      >
        {selectedMiningResult && (
          <DOM3DVisualization
            miningResult={selectedMiningResult}
            onElementSelect={(elementId) => {
              console.log('Selected element:', elementId);
            }}
          />
        )}
      </Modal>
    </div>
  );
};

export default CampaignTrainingAdminDashboard;
