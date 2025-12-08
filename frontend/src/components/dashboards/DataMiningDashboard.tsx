/**
 * Data Mining Dashboard
 * 
 * Comprehensive dashboard for managing data mining workflows, campaigns, and tools.
 * Provides full CRUD operations and real-time execution monitoring.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Row,
  Col,
  Button,
  Table,
  Tag,
  Space,
  Statistic,
  Input,
  Select,
  Tabs,
  Alert,
  List,
  Badge,
  Tooltip,
  Modal,
  Form,
  Steps,
  Empty,
  Progress,
  message,
} from 'antd';
import {
  RocketOutlined,
  PlayCircleOutlined,
  PauseOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  ToolOutlined,
  ThunderboltOutlined,
  DatabaseOutlined,
  SyncOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  ReloadOutlined,
  ExperimentOutlined,
  ClusterOutlined,
} from '@ant-design/icons';
import { dataMiningAPI, DataMiningWorkflow, DataMiningCampaign, DataMiningTool } from '../../services/apiService';

const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;
const { Step } = Steps;

export const DataMiningDashboard: React.FC = () => {
  // State
  const [tools, setTools] = useState<DataMiningTool[]>([]);
  const [workflows, setWorkflows] = useState<DataMiningWorkflow[]>([]);
  const [campaigns, setCampaigns] = useState<DataMiningCampaign[]>([]);
  const [status, setStatus] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Modal states
  const [workflowModalVisible, setWorkflowModalVisible] = useState(false);
  const [campaignModalVisible, setCampaignModalVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [form] = Form.useForm();

  // Fetch data
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [toolsData, workflowsData, campaignsData, statusData, statsData] = await Promise.all([
        dataMiningAPI.getTools(),
        dataMiningAPI.getWorkflows(),
        dataMiningAPI.getCampaigns(),
        dataMiningAPI.getStatus(),
        dataMiningAPI.getStats(),
      ]);
      setTools(toolsData);
      setWorkflows(workflowsData);
      setCampaigns(campaignsData);
      setStatus(statusData);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      message.error('Failed to load data mining data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    
    // Poll for updates when running
    const interval = setInterval(() => {
      if (status?.activeWorkflows > 0 || status?.activeCampaigns > 0) {
        fetchData();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [fetchData, status]);

  // Handlers
  const handleCreateWorkflow = async (values: any) => {
    try {
      await dataMiningAPI.createWorkflow({
        name: values.name,
        description: values.description,
        steps: values.steps || [],
      });
      message.success('Workflow created successfully');
      setWorkflowModalVisible(false);
      form.resetFields();
      fetchData();
    } catch (error) {
      message.error('Failed to create workflow');
    }
  };

  const handleExecuteWorkflow = async (workflowId: string) => {
    try {
      await dataMiningAPI.executeWorkflow(workflowId);
      message.success('Workflow execution started');
      fetchData();
    } catch (error) {
      message.error('Failed to execute workflow');
    }
  };

  const handleDeleteWorkflow = async (workflowId: string) => {
    try {
      await dataMiningAPI.deleteWorkflow(workflowId);
      message.success('Workflow deleted');
      fetchData();
    } catch (error) {
      message.error('Failed to delete workflow');
    }
  };

  const handleCreateCampaign = async (values: any) => {
    try {
      await dataMiningAPI.createCampaign({
        name: values.name,
        description: values.description,
        workflows: values.workflows || [],
      });
      message.success('Campaign created successfully');
      setCampaignModalVisible(false);
      form.resetFields();
      fetchData();
    } catch (error) {
      message.error('Failed to create campaign');
    }
  };

  const handleExecuteCampaign = async (campaignId: string) => {
    try {
      await dataMiningAPI.executeCampaign(campaignId);
      message.success('Campaign execution started');
      fetchData();
    } catch (error) {
      message.error('Failed to execute campaign');
    }
  };

  const handleDeleteCampaign = async (campaignId: string) => {
    try {
      await dataMiningAPI.deleteCampaign(campaignId);
      message.success('Campaign deleted');
      fetchData();
    } catch (error) {
      message.error('Failed to delete campaign');
    }
  };

  const handleViewItem = (item: any, type: 'workflow' | 'campaign') => {
    setSelectedItem({ ...item, type });
    setViewModalVisible(true);
  };

  // Status badge
  const getStatusBadge = (statusValue: string) => {
    const statusConfig: Record<string, { status: 'processing' | 'success' | 'error' | 'default'; text: string }> = {
      running: { status: 'processing', text: 'Running' },
      completed: { status: 'success', text: 'Completed' },
      failed: { status: 'error', text: 'Failed' },
      cancelled: { status: 'error', text: 'Cancelled' },
      idle: { status: 'default', text: 'Idle' },
    };
    const config = statusConfig[statusValue] || { status: 'default', text: statusValue };
    return <Badge status={config.status} text={config.text} />;
  };

  // Table columns
  const workflowColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: DataMiningWorkflow) => (
        <Space>
          <ExperimentOutlined />
          <a onClick={() => handleViewItem(record, 'workflow')}>{text}</a>
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getStatusBadge(status),
    },
    {
      title: 'Steps',
      key: 'steps',
      render: (_: any, record: DataMiningWorkflow) => (
        <Tag>{record.steps?.length || 0} steps</Tag>
      ),
    },
    {
      title: 'Last Run',
      dataIndex: 'lastRun',
      key: 'lastRun',
      render: (date: string) => date ? new Date(date).toLocaleString() : 'Never',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: DataMiningWorkflow) => (
        <Space>
          <Tooltip title="Execute">
            <Button
              type="primary"
              size="small"
              icon={<PlayCircleOutlined />}
              onClick={() => handleExecuteWorkflow(record.id)}
              disabled={record.status === 'running'}
            />
          </Tooltip>
          <Tooltip title="View">
            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleViewItem(record, 'workflow')}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDeleteWorkflow(record.id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const campaignColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: DataMiningCampaign) => (
        <Space>
          <ClusterOutlined />
          <a onClick={() => handleViewItem(record, 'campaign')}>{text}</a>
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getStatusBadge(status),
    },
    {
      title: 'Workflows',
      key: 'workflows',
      render: (_: any, record: DataMiningCampaign) => (
        <Tag color="blue">{record.workflows?.length || 0} workflows</Tag>
      ),
    },
    {
      title: 'Last Run',
      dataIndex: 'lastRun',
      key: 'lastRun',
      render: (date: string) => date ? new Date(date).toLocaleString() : 'Never',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: DataMiningCampaign) => (
        <Space>
          <Tooltip title="Execute">
            <Button
              type="primary"
              size="small"
              icon={<PlayCircleOutlined />}
              onClick={() => handleExecuteCampaign(record.id)}
              disabled={record.status === 'running'}
            />
          </Tooltip>
          <Tooltip title="View">
            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleViewItem(record, 'campaign')}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDeleteCampaign(record.id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Row gutter={[16, 16]}>
        {/* Header */}
        <Col span={24}>
          <Card>
            <Row justify="space-between" align="middle">
              <Col>
                <Space>
                  <DatabaseOutlined style={{ fontSize: 24, color: '#1890ff' }} />
                  <div>
                    <h2 style={{ margin: 0 }}>Data Mining</h2>
                    <p style={{ margin: 0, color: '#666' }}>
                      Advanced data mining workflows and campaigns
                    </p>
                  </div>
                </Space>
              </Col>
              <Col>
                <Space>
                  <Button icon={<ReloadOutlined />} onClick={fetchData} loading={loading}>
                    Refresh
                  </Button>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setWorkflowModalVisible(true)}
                  >
                    New Workflow
                  </Button>
                  <Button
                    icon={<PlusOutlined />}
                    onClick={() => setCampaignModalVisible(true)}
                  >
                    New Campaign
                  </Button>
                </Space>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Stats Cards */}
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Workflows"
              value={workflows.length}
              prefix={<ExperimentOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Campaigns"
              value={campaigns.length}
              prefix={<ClusterOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Available Tools"
              value={tools.length}
              prefix={<ToolOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Active Tasks"
              value={status?.activeWorkflows || 0}
              prefix={
                status?.activeWorkflows > 0 ? (
                  <SyncOutlined spin />
                ) : (
                  <CheckCircleOutlined />
                )
              }
              valueStyle={{
                color: status?.activeWorkflows > 0 ? '#faad14' : '#52c41a',
              }}
            />
          </Card>
        </Col>

        {/* Main Content */}
        <Col span={24}>
          <Card>
            <Tabs activeKey={activeTab} onChange={setActiveTab}>
              <TabPane tab="Workflows" key="workflows">
                {workflows.length > 0 ? (
                  <Table
                    dataSource={workflows}
                    columns={workflowColumns}
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                  />
                ) : (
                  <Empty description="No workflows created yet">
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={() => setWorkflowModalVisible(true)}
                    >
                      Create First Workflow
                    </Button>
                  </Empty>
                )}
              </TabPane>

              <TabPane tab="Campaigns" key="campaigns">
                {campaigns.length > 0 ? (
                  <Table
                    dataSource={campaigns}
                    columns={campaignColumns}
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                  />
                ) : (
                  <Empty description="No campaigns created yet">
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={() => setCampaignModalVisible(true)}
                    >
                      Create First Campaign
                    </Button>
                  </Empty>
                )}
              </TabPane>

              <TabPane tab="Tools" key="tools">
                {tools.length > 0 ? (
                  <Row gutter={[16, 16]}>
                    {tools.map((tool) => (
                      <Col xs={24} sm={12} md={8} key={tool.id}>
                        <Card size="small" hoverable>
                          <Card.Meta
                            avatar={<ToolOutlined style={{ fontSize: 24, color: '#1890ff' }} />}
                            title={tool.name}
                            description={tool.description}
                          />
                          <div style={{ marginTop: 12 }}>
                            <Tag color="blue">{tool.category}</Tag>
                          </div>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                ) : (
                  <Empty description="No tools available" />
                )}
              </TabPane>

              <TabPane tab="Statistics" key="stats">
                <Row gutter={[16, 16]}>
                  <Col xs={24} md={12}>
                    <Card title="Workflow Statistics">
                      <List size="small">
                        <List.Item>
                          <span>Total Workflows</span>
                          <Badge count={stats?.totalWorkflows || workflows.length} showZero />
                        </List.Item>
                        <List.Item>
                          <span>Running</span>
                          <Badge
                            count={workflows.filter((w) => w.status === 'running').length}
                            showZero
                            style={{ backgroundColor: '#faad14' }}
                          />
                        </List.Item>
                        <List.Item>
                          <span>Completed</span>
                          <Badge
                            count={workflows.filter((w) => w.status === 'completed').length}
                            showZero
                            style={{ backgroundColor: '#52c41a' }}
                          />
                        </List.Item>
                        <List.Item>
                          <span>Failed</span>
                          <Badge
                            count={workflows.filter((w) => w.status === 'failed').length}
                            showZero
                            style={{ backgroundColor: '#f5222d' }}
                          />
                        </List.Item>
                      </List>
                    </Card>
                  </Col>
                  <Col xs={24} md={12}>
                    <Card title="Campaign Statistics">
                      <List size="small">
                        <List.Item>
                          <span>Total Campaigns</span>
                          <Badge count={stats?.totalCampaigns || campaigns.length} showZero />
                        </List.Item>
                        <List.Item>
                          <span>Running</span>
                          <Badge
                            count={campaigns.filter((c) => c.status === 'running').length}
                            showZero
                            style={{ backgroundColor: '#faad14' }}
                          />
                        </List.Item>
                        <List.Item>
                          <span>Completed</span>
                          <Badge
                            count={campaigns.filter((c) => c.status === 'completed').length}
                            showZero
                            style={{ backgroundColor: '#52c41a' }}
                          />
                        </List.Item>
                        <List.Item>
                          <span>Failed</span>
                          <Badge
                            count={campaigns.filter((c) => c.status === 'failed').length}
                            showZero
                            style={{ backgroundColor: '#f5222d' }}
                          />
                        </List.Item>
                      </List>
                    </Card>
                  </Col>
                  {stats?.successRate !== undefined && (
                    <Col span={24}>
                      <Card title="Success Rate">
                        <Progress
                          percent={stats.successRate}
                          status={stats.successRate >= 80 ? 'success' : stats.successRate >= 50 ? 'normal' : 'exception'}
                          strokeWidth={20}
                        />
                      </Card>
                    </Col>
                  )}
                </Row>
              </TabPane>
            </Tabs>
          </Card>
        </Col>
      </Row>

      {/* Create Workflow Modal */}
      <Modal
        title="Create New Workflow"
        open={workflowModalVisible}
        onCancel={() => {
          setWorkflowModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateWorkflow}>
          <Form.Item
            name="name"
            label="Workflow Name"
            rules={[{ required: true, message: 'Please enter a workflow name' }]}
          >
            <Input placeholder="e.g., SEO Competitor Analysis" />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <TextArea rows={3} placeholder="Describe what this workflow does..." />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Create Workflow
              </Button>
              <Button onClick={() => setWorkflowModalVisible(false)}>Cancel</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Create Campaign Modal */}
      <Modal
        title="Create New Campaign"
        open={campaignModalVisible}
        onCancel={() => {
          setCampaignModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateCampaign}>
          <Form.Item
            name="name"
            label="Campaign Name"
            rules={[{ required: true, message: 'Please enter a campaign name' }]}
          >
            <Input placeholder="e.g., Q1 Data Collection Campaign" />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <TextArea rows={3} placeholder="Describe what this campaign does..." />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Create Campaign
              </Button>
              <Button onClick={() => setCampaignModalVisible(false)}>Cancel</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* View Details Modal */}
      <Modal
        title={
          selectedItem ? (
            <Space>
              {selectedItem.type === 'workflow' ? <ExperimentOutlined /> : <ClusterOutlined />}
              {selectedItem.name}
            </Space>
          ) : (
            'Details'
          )
        }
        open={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setViewModalVisible(false)}>
            Close
          </Button>,
        ]}
        width={700}
      >
        {selectedItem && (
          <div>
            <p>
              <strong>Type:</strong> {selectedItem.type === 'workflow' ? 'Workflow' : 'Campaign'}
            </p>
            <p>
              <strong>Status:</strong> {getStatusBadge(selectedItem.status)}
            </p>
            <p>
              <strong>Description:</strong> {selectedItem.description || 'No description'}
            </p>
            <p>
              <strong>Created:</strong> {new Date(selectedItem.createdAt).toLocaleString()}
            </p>
            {selectedItem.lastRun && (
              <p>
                <strong>Last Run:</strong> {new Date(selectedItem.lastRun).toLocaleString()}
              </p>
            )}
            
            {selectedItem.type === 'workflow' && selectedItem.steps && (
              <div style={{ marginTop: 16 }}>
                <strong>Steps:</strong>
                <Steps direction="vertical" size="small" style={{ marginTop: 8 }}>
                  {selectedItem.steps.map((step: any, index: number) => (
                    <Step
                      key={index}
                      title={step.name}
                      description={`Tool: ${step.tool}`}
                      status={
                        step.status === 'completed'
                          ? 'finish'
                          : step.status === 'running'
                          ? 'process'
                          : step.status === 'failed'
                          ? 'error'
                          : 'wait'
                      }
                    />
                  ))}
                </Steps>
              </div>
            )}

            {selectedItem.type === 'campaign' && selectedItem.workflows && (
              <div style={{ marginTop: 16 }}>
                <strong>Workflows ({selectedItem.workflows.length}):</strong>
                <List
                  size="small"
                  style={{ marginTop: 8 }}
                  dataSource={selectedItem.workflows}
                  renderItem={(workflow: any) => (
                    <List.Item>
                      <Space>
                        <ExperimentOutlined />
                        {workflow.name}
                        <Tag>{workflow.steps?.length || 0} steps</Tag>
                      </Space>
                    </List.Item>
                  )}
                />
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DataMiningDashboard;
