/**
 * Agent Orchestration Dashboard
 * 
 * Comprehensive dashboard for managing AI agents, tasks, and orchestration services
 */

import React, { useState, useEffect } from 'react';
import {
  Card,
  Tabs,
  Button,
  Table,
  Tag,
  Space,
  Statistic,
  Row,
  Col,
  Input,
  Select,
  message,
  Modal,
  Form,
  Badge,
  Timeline,
  Descriptions,
  Progress,
  Alert
} from 'antd';
import {
  RobotOutlined,
  ThunderboltOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  GithubOutlined,
  ReloadOutlined,
  PlusOutlined,
  EyeOutlined,
  BugOutlined,
  BulbOutlined
} from '@ant-design/icons';
import { agentOrchestrationAPI } from '../../services/apiService';

const { TabPane } = Tabs;
const { TextArea } = Input;
const { Option } = Select;

interface AgentTask {
  id: string;
  type: string;
  priority: number;
  context: any;
  status: string;
  created_at: string;
  updated_at: string;
}

interface Agent {
  id: string;
  type: string;
  status: string;
  currentTask?: string;
  startTime: string;
  metrics?: any;
}

interface QueueStatus {
  pending: number;
  running: number;
  completed: number;
  failed: number;
  total: number;
}

const AgentOrchestrationDashboard: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [orchestrationStatus, setOrchestrationStatus] = useState<any>(null);
  const [healthStatus, setHealthStatus] = useState<any>(null);
  const [activeAgents, setActiveAgents] = useState<Agent[]>([]);
  const [queueStatus, setQueueStatus] = useState<QueueStatus | null>(null);
  const [selectedTask, setSelectedTask] = useState<AgentTask | null>(null);
  const [taskModalVisible, setTaskModalVisible] = useState(false);
  const [investigateModalVisible, setInvestigateModalVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      const [status, health, agents, queue] = await Promise.all([
        agentOrchestrationAPI.getStatus(),
        agentOrchestrationAPI.getHealth(),
        agentOrchestrationAPI.getActiveAgents(),
        agentOrchestrationAPI.getQueueStatus(),
      ]);

      setOrchestrationStatus(status);
      setHealthStatus(health);
      setActiveAgents(agents.agents || []);
      setQueueStatus(queue);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const handleQueueTask = async (values: any) => {
    setLoading(true);
    try {
      const result = await agentOrchestrationAPI.queueTask(
        values.type,
        values.context,
        values.priority || 5
      );
      message.success(`Task queued successfully: ${result.taskId}`);
      setTaskModalVisible(false);
      form.resetFields();
      loadDashboardData();
    } catch (error: any) {
      message.error(`Failed to queue task: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleInvestigateFeature = async (values: any) => {
    setLoading(true);
    try {
      const result = await agentOrchestrationAPI.investigateFeature(
        values.description,
        values.components ? values.components.split(',').map((c: string) => c.trim()) : []
      );
      message.success('Feature investigation started');
      setInvestigateModalVisible(false);
      form.resetFields();
      loadDashboardData();
    } catch (error: any) {
      message.error(`Failed to start investigation: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleViewAgent = async (agentId: string) => {
    try {
      const agent = await agentOrchestrationAPI.getAgent(agentId);
      Modal.info({
        title: `Agent: ${agentId}`,
        width: 600,
        content: (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="ID">{agent.id}</Descriptions.Item>
            <Descriptions.Item label="Type">{agent.type}</Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag color={agent.status === 'active' ? 'green' : 'default'}>
                {agent.status}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Current Task">{agent.currentTask || 'None'}</Descriptions.Item>
            <Descriptions.Item label="Start Time">{new Date(agent.startTime).toLocaleString()}</Descriptions.Item>
            {agent.metrics && (
              <Descriptions.Item label="Metrics">
                <pre>{JSON.stringify(agent.metrics, null, 2)}</pre>
              </Descriptions.Item>
            )}
          </Descriptions>
        ),
      });
    } catch (error: any) {
      message.error(`Failed to load agent details: ${error.message}`);
    }
  };

  const renderOverviewTab = () => (
    <div>
      <Alert
        message="Agent Orchestration System"
        description="Manage AI agents, tasks, and service orchestration with real-time monitoring and investigation capabilities"
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Active Agents"
              value={activeAgents.length}
              prefix={<RobotOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Pending Tasks"
              value={queueStatus?.pending || 0}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Running Tasks"
              value={queueStatus?.running || 0}
              prefix={<ThunderboltOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Completed Tasks"
              value={queueStatus?.completed || 0}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {queueStatus && (
        <Card title="Task Queue Progress" style={{ marginBottom: 24 }}>
          <Row gutter={16}>
            <Col span={12}>
              <div style={{ marginBottom: 16 }}>
                <div>Completion Rate</div>
                <Progress
                  percent={Math.round((queueStatus.completed / queueStatus.total) * 100)}
                  status="active"
                />
              </div>
            </Col>
            <Col span={12}>
              <div style={{ marginBottom: 16 }}>
                <div>Failure Rate</div>
                <Progress
                  percent={Math.round((queueStatus.failed / queueStatus.total) * 100)}
                  status={queueStatus.failed > 0 ? 'exception' : 'normal'}
                />
              </div>
            </Col>
          </Row>
        </Card>
      )}

      {orchestrationStatus && (
        <Card title="Orchestration Status">
          <Descriptions bordered column={2}>
            <Descriptions.Item label="System Status">
              <Tag color="green">Operational</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Uptime">
              {orchestrationStatus.uptime || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Services">
              {orchestrationStatus.services?.length || 0}
            </Descriptions.Item>
            <Descriptions.Item label="Last Updated">
              {new Date().toLocaleString()}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      )}
    </div>
  );

  const renderAgentsTab = () => (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setTaskModalVisible(true)}
        >
          Queue New Task
        </Button>
        <Button icon={<ReloadOutlined />} onClick={loadDashboardData}>
          Refresh
        </Button>
      </Space>

      <Card title="Active Agents">
        <Table
          dataSource={activeAgents}
          rowKey="id"
          loading={loading}
          columns={[
            {
              title: 'Agent ID',
              dataIndex: 'id',
              key: 'id',
              render: (id) => <code>{id}</code>,
            },
            {
              title: 'Type',
              dataIndex: 'type',
              key: 'type',
              render: (type) => <Tag color="blue">{type}</Tag>,
            },
            {
              title: 'Status',
              dataIndex: 'status',
              key: 'status',
              render: (status) => (
                <Badge
                  status={status === 'active' ? 'processing' : 'default'}
                  text={status}
                />
              ),
            },
            {
              title: 'Current Task',
              dataIndex: 'currentTask',
              key: 'currentTask',
              render: (task) => task || <Tag>Idle</Tag>,
            },
            {
              title: 'Start Time',
              dataIndex: 'startTime',
              key: 'startTime',
              render: (time) => new Date(time).toLocaleString(),
            },
            {
              title: 'Actions',
              key: 'actions',
              render: (_, record) => (
                <Button
                  size="small"
                  icon={<EyeOutlined />}
                  onClick={() => handleViewAgent(record.id)}
                >
                  View
                </Button>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );

  const renderHealthTab = () => (
    <div>
      {healthStatus && (
        <Card title="Service Health Status">
          <Row gutter={[16, 16]}>
            {Object.entries(healthStatus.services || {}).map(([serviceId, data]: [string, any]) => (
              <Col xs={24} sm={12} md={8} key={serviceId}>
                <Card
                  size="small"
                  title={serviceId}
                  extra={
                    <Tag color={data.healthy ? 'green' : 'red'}>
                      {data.healthy ? 'Healthy' : 'Unhealthy'}
                    </Tag>
                  }
                >
                  <Descriptions size="small" column={1}>
                    <Descriptions.Item label="Last Check">
                      {new Date(data.lastCheck).toLocaleString()}
                    </Descriptions.Item>
                    {data.uptime && (
                      <Descriptions.Item label="Uptime">
                        {data.uptime}
                      </Descriptions.Item>
                    )}
                    {data.metrics && (
                      <Descriptions.Item label="Metrics">
                        {JSON.stringify(data.metrics)}
                      </Descriptions.Item>
                    )}
                  </Descriptions>
                </Card>
              </Col>
            ))}
          </Row>
        </Card>
      )}
    </div>
  );

  const renderInvestigationTab = () => (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button
          type="primary"
          icon={<BulbOutlined />}
          onClick={() => setInvestigateModalVisible(true)}
        >
          Investigate Feature
        </Button>
        <Button icon={<BugOutlined />}>
          Investigate Error
        </Button>
        <Button icon={<GithubOutlined />}>
          Create GitHub Issue
        </Button>
      </Space>

      <Alert
        message="Investigation Tools"
        description="Use AI agents to investigate features, debug errors, and automatically create GitHub issues with detailed context"
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />

      <Card title="Investigation History">
        <Timeline>
          <Timeline.Item color="green">
            Feature investigation completed - Login System
          </Timeline.Item>
          <Timeline.Item color="blue">
            Error investigation started - Database Connection
          </Timeline.Item>
          <Timeline.Item>
            GitHub issue created - #1234
          </Timeline.Item>
        </Timeline>
      </Card>
    </div>
  );

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: 24 }}>
        <h1>
          <RobotOutlined style={{ marginRight: 8 }} />
          Agent Orchestration Dashboard
        </h1>
        <p style={{ fontSize: '14px', color: '#666' }}>
          Manage AI agents, tasks, and service orchestration with real-time monitoring
        </p>
      </div>

      <Tabs defaultActiveKey="overview">
        <TabPane
          tab={
            <span>
              <ThunderboltOutlined />
              Overview
            </span>
          }
          key="overview"
        >
          {renderOverviewTab()}
        </TabPane>

        <TabPane
          tab={
            <span>
              <RobotOutlined />
              Agents ({activeAgents.length})
            </span>
          }
          key="agents"
        >
          {renderAgentsTab()}
        </TabPane>

        <TabPane
          tab={
            <span>
              <CheckCircleOutlined />
              Health
            </span>
          }
          key="health"
        >
          {renderHealthTab()}
        </TabPane>

        <TabPane
          tab={
            <span>
              <BulbOutlined />
              Investigation
            </span>
          }
          key="investigation"
        >
          {renderInvestigationTab()}
        </TabPane>
      </Tabs>

      {/* Queue Task Modal */}
      <Modal
        title="Queue New Agent Task"
        visible={taskModalVisible}
        onCancel={() => setTaskModalVisible(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleQueueTask} layout="vertical">
          <Form.Item
            name="type"
            label="Task Type"
            rules={[{ required: true, message: 'Please select task type' }]}
          >
            <Select placeholder="Select task type">
              <Option value="investigation">Investigation</Option>
              <Option value="code-generation">Code Generation</Option>
              <Option value="testing">Testing</Option>
              <Option value="documentation">Documentation</Option>
              <Option value="debugging">Debugging</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="context"
            label="Task Context (JSON)"
            rules={[{ required: true, message: 'Please provide task context' }]}
          >
            <TextArea
              rows={6}
              placeholder='{"description": "Task description", "details": {...}}'
            />
          </Form.Item>

          <Form.Item name="priority" label="Priority" initialValue={5}>
            <Select>
              <Option value={1}>Critical (1)</Option>
              <Option value={3}>High (3)</Option>
              <Option value={5}>Normal (5)</Option>
              <Option value={7}>Low (7)</Option>
              <Option value={9}>Very Low (9)</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                Queue Task
              </Button>
              <Button onClick={() => setTaskModalVisible(false)}>Cancel</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Investigate Feature Modal */}
      <Modal
        title="Investigate Feature"
        visible={investigateModalVisible}
        onCancel={() => setInvestigateModalVisible(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleInvestigateFeature} layout="vertical">
          <Form.Item
            name="description"
            label="Feature Description"
            rules={[{ required: true, message: 'Please describe the feature' }]}
          >
            <TextArea
              rows={4}
              placeholder="Describe the feature you want to investigate..."
            />
          </Form.Item>

          <Form.Item name="components" label="Related Components (comma-separated)">
            <Input placeholder="component1, component2, component3" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                Start Investigation
              </Button>
              <Button onClick={() => setInvestigateModalVisible(false)}>Cancel</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AgentOrchestrationDashboard;
