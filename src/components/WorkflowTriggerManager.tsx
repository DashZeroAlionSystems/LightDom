import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Switch,
  Tag,
  Space,
  Typography,
  Badge,
  Popconfirm,
  message,
  Tabs,
  Statistic,
  Row,
  Col,
  Alert,
  Tooltip
} from 'antd';
import {
  PlusOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  DeleteOutlined,
  ThunderboltOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined,
  CodeOutlined,
  HistoryOutlined
} from '@ant-design/icons';
import axios from 'axios';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;

interface WorkflowTrigger {
  id: string;
  campaignId: string;
  eventType: string;
  workflowId: string;
  condition: string;
  description: string;
  enabled: boolean;
  createdAt: string;
  executionCount: number;
  lastExecuted: string | null;
}

interface WorkflowTriggerManagerProps {
  campaignId: string;
}

const WorkflowTriggerManager: React.FC<WorkflowTriggerManagerProps> = ({ campaignId }) => {
  const [triggers, setTriggers] = useState<WorkflowTrigger[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [executionHistory, setExecutionHistory] = useState<any[]>([]);
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    loadTriggers();
    loadTemplates();
    loadStats();
    loadWorkflows();
    loadExecutionHistory();
  }, [campaignId]);

  const loadTriggers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/n8n/triggers?campaignId=${campaignId}`);
      setTriggers(response.data.triggers || []);
    } catch (error) {
      console.error('Failed to load triggers:', error);
      message.error('Failed to load triggers');
    } finally {
      setLoading(false);
    }
  };

  const loadTemplates = async () => {
    try {
      const response = await axios.get('/api/n8n/trigger-templates');
      setTemplates(response.data.templates || []);
    } catch (error) {
      console.error('Failed to load templates:', error);
    }
  };

  const loadStats = async () => {
    try {
      const response = await axios.get('/api/n8n/triggers/stats');
      setStats(response.data.stats);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const loadWorkflows = async () => {
    try {
      const response = await axios.get('/api/n8n/workflows');
      setWorkflows(response.data.workflows || []);
    } catch (error) {
      console.error('Failed to load workflows:', error);
    }
  };

  const loadExecutionHistory = async () => {
    try {
      const response = await axios.get('/api/n8n/triggers/executions', {
        params: { limit: 50 }
      });
      setExecutionHistory(response.data.history || []);
    } catch (error) {
      console.error('Failed to load execution history:', error);
    }
  };

  const handleCreateTrigger = async (values: any) => {
    try {
      setLoading(true);
      await axios.post('/api/n8n/triggers', {
        ...values,
        campaignId
      });
      message.success('Trigger created successfully');
      setModalVisible(false);
      form.resetFields();
      loadTriggers();
      loadStats();
    } catch (error) {
      console.error('Failed to create trigger:', error);
      message.error('Failed to create trigger');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTrigger = async (triggerId: string, enabled: boolean) => {
    try {
      await axios.patch(`/api/n8n/triggers/${triggerId}`, { enabled });
      message.success(enabled ? 'Trigger enabled' : 'Trigger disabled');
      loadTriggers();
    } catch (error) {
      console.error('Failed to toggle trigger:', error);
      message.error('Failed to toggle trigger');
    }
  };

  const handleDeleteTrigger = async (triggerId: string) => {
    try {
      await axios.delete(`/api/n8n/triggers/${triggerId}`);
      message.success('Trigger deleted');
      loadTriggers();
      loadStats();
    } catch (error) {
      console.error('Failed to delete trigger:', error);
      message.error('Failed to delete trigger');
    }
  };

  const handleTemplateSelect = (templateKey: string) => {
    const template = templates.find(t => t.key === templateKey);
    if (template) {
      form.setFieldsValue({
        eventType: template.event,
        condition: template.condition,
        description: template.description,
        useTemplate: templateKey
      });
    }
  };

  const triggerColumns = [
    {
      title: 'Event Type',
      dataIndex: 'eventType',
      key: 'eventType',
      render: (text: string) => (
        <Tag color="blue" icon={<ThunderboltOutlined />}>
          {text}
        </Tag>
      )
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true
    },
    {
      title: 'Workflow',
      dataIndex: 'workflowId',
      key: 'workflowId',
      render: (workflowId: string) => {
        const workflow = workflows.find(w => w.id === workflowId);
        return workflow ? workflow.name : workflowId;
      }
    },
    {
      title: 'Status',
      dataIndex: 'enabled',
      key: 'enabled',
      render: (enabled: boolean) => (
        <Badge
          status={enabled ? 'processing' : 'default'}
          text={enabled ? 'Active' : 'Inactive'}
        />
      )
    },
    {
      title: 'Executions',
      dataIndex: 'executionCount',
      key: 'executionCount',
      render: (count: number) => <Statistic value={count} valueStyle={{ fontSize: 14 }} />
    },
    {
      title: 'Last Executed',
      dataIndex: 'lastExecuted',
      key: 'lastExecuted',
      render: (date: string | null) =>
        date ? new Date(date).toLocaleString() : 'Never'
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: WorkflowTrigger) => (
        <Space>
          <Tooltip title={record.enabled ? 'Disable' : 'Enable'}>
            <Button
              type="text"
              icon={record.enabled ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
              onClick={() => handleToggleTrigger(record.id, !record.enabled)}
            />
          </Tooltip>
          <Popconfirm
            title="Delete this trigger?"
            onConfirm={() => handleDeleteTrigger(record.id)}
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    }
  ];

  const executionColumns = [
    {
      title: 'Time',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (date: string) => new Date(date).toLocaleString()
    },
    {
      title: 'Trigger',
      dataIndex: 'triggerId',
      key: 'triggerId',
      render: (triggerId: string) => {
        const trigger = triggers.find(t => t.id === triggerId);
        return trigger?.description || triggerId;
      }
    },
    {
      title: 'Event Data',
      dataIndex: 'eventData',
      key: 'eventData',
      render: (data: any) => (
        <Tooltip title={<pre>{JSON.stringify(data, null, 2)}</pre>}>
          <Button type="text" icon={<CodeOutlined />} size="small">
            View Data
          </Button>
        </Tooltip>
      )
    },
    {
      title: 'Status',
      dataIndex: 'success',
      key: 'success',
      render: (success: boolean, record: any) => (
        <Space>
          {success ? (
            <Tag color="success" icon={<CheckCircleOutlined />}>
              Success
            </Tag>
          ) : (
            <Tooltip title={record.error}>
              <Tag color="error" icon={<CloseCircleOutlined />}>
                Failed
              </Tag>
            </Tooltip>
          )}
        </Space>
      )
    }
  ];

  return (
    <Card title="Workflow Triggers" extra={
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={() => setModalVisible(true)}
      >
        Create Trigger
      </Button>
    }>
      {/* Statistics */}
      {stats && (
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={6}>
            <Card>
              <Statistic
                title="Total Triggers"
                value={stats.total}
                prefix={<ThunderboltOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Active"
                value={stats.enabled}
                valueStyle={{ color: '#3f8600' }}
                prefix={<PlayCircleOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Total Executions"
                value={stats.totalExecutions}
                prefix={<HistoryOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Success Rate"
                value={stats.successRate}
                suffix="%"
                valueStyle={{ color: stats.successRate > 90 ? '#3f8600' : '#cf1322' }}
              />
            </Card>
          </Col>
        </Row>
      )}

      <Alert
        message="Workflow Triggers"
        description="Automatically execute n8n workflows when specific campaign events occur. Triggers can be customized with conditions and use pre-built templates."
        type="info"
        icon={<InfoCircleOutlined />}
        showIcon
        style={{ marginBottom: 16 }}
      />

      <Tabs defaultActiveKey="triggers">
        <TabPane tab="Triggers" key="triggers">
          <Table
            columns={triggerColumns}
            dataSource={triggers}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10 }}
          />
        </TabPane>

        <TabPane tab="Execution History" key="history">
          <Table
            columns={executionColumns}
            dataSource={executionHistory}
            rowKey={(record) => `${record.triggerId}_${record.timestamp}`}
            pagination={{ pageSize: 20 }}
          />
        </TabPane>

        <TabPane tab="Templates" key="templates">
          <Row gutter={[16, 16]}>
            {templates.map(template => (
              <Col span={12} key={template.key}>
                <Card
                  title={template.name}
                  extra={
                    <Button
                      type="link"
                      onClick={() => {
                        handleTemplateSelect(template.key);
                        setModalVisible(true);
                      }}
                    >
                      Use Template
                    </Button>
                  }
                >
                  <Paragraph ellipsis={{ rows: 2 }}>
                    {template.description}
                  </Paragraph>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Text strong>Event:</Text>
                    <Tag>{template.event}</Tag>
                    <Text strong>Default Actions:</Text>
                    {template.defaultActions?.map((action: string, idx: number) => (
                      <Text key={idx}>• {action}</Text>
                    ))}
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>
        </TabPane>
      </Tabs>

      {/* Create Trigger Modal */}
      <Modal
        title="Create Workflow Trigger"
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        width={800}
        confirmLoading={loading}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateTrigger}
        >
          <Form.Item
            name="useTemplate"
            label="Template (Optional)"
          >
            <Select
              placeholder="Select a template"
              allowClear
              onChange={handleTemplateSelect}
            >
              {templates.map(template => (
                <Option key={template.key} value={template.key}>
                  {template.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="eventType"
            label="Event Type"
            rules={[{ required: true, message: 'Please select an event type' }]}
          >
            <Select placeholder="Select event type">
              <Option value="campaign.schema.discovered">Schema Discovered</Option>
              <Option value="campaign.seeder.urls_collected">URLs Collected</Option>
              <Option value="campaign.crawler.data_mined">Data Mined</Option>
              <Option value="campaign.cluster.scale_needed">Cluster Scale Needed</Option>
              <Option value="campaign.error.threshold_exceeded">Error Threshold Exceeded</Option>
              <Option value="campaign.training.ready">Training Data Ready</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please enter a description' }]}
          >
            <Input placeholder="Describe what this trigger does" />
          </Form.Item>

          <Form.Item
            name="workflowId"
            label="Workflow"
            tooltip="Leave empty to auto-generate workflow from template"
          >
            <Select
              placeholder="Select existing workflow or leave empty to generate"
              allowClear
            >
              {workflows.map(workflow => (
                <Option key={workflow.id} value={workflow.id}>
                  {workflow.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="condition"
            label="Condition"
            tooltip="JavaScript expression using {{variable}} syntax. Leave empty to always execute."
          >
            <TextArea
              rows={3}
              placeholder="e.g., {{schema.type}} === 'Product' && {{data.count}} > 100"
            />
          </Form.Item>

          <Form.Item
            name="enabled"
            label="Enable Immediately"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default WorkflowTriggerManager;
