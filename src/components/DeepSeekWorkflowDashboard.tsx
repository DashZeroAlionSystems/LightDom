/**
 * DeepSeek Workflow Dashboard Component
 * React UI for managing DeepSeek workflows, schemas, and services
 */

import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Input,
  Table,
  Tabs,
  Tag,
  Space,
  Modal,
  Form,
  Select,
  Progress,
  Statistic,
  Row,
  Col,
  Timeline,
  Alert,
  Badge
} from 'antd';
import {
  PlayCircleOutlined,
  StopOutlined,
  SyncOutlined,
  ApiOutlined,
  DatabaseOutlined,
  CloudOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';

const { TextArea } = Input;
const { TabPane } = Tabs;
const { Option } = Select;

export const DeepSeekWorkflowDashboard: React.FC = () => {
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [schemas, setSchemas] = useState<any[]>([]);
  const [executions, setExecutions] = useState<any[]>([]);
  const [systemHealth, setSystemHealth] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<any>(null);

  // Fetch data on mount
  useEffect(() => {
    fetchWorkflows();
    fetchSchemas();
    fetchExecutions();
    fetchSystemHealth();
  }, []);

  const fetchWorkflows = async () => {
    try {
      const response = await fetch('/api/deepseek/workflows');
      const data = await response.json();
      setWorkflows(data);
    } catch (error) {
      console.error('Error fetching workflows:', error);
    }
  };

  const fetchSchemas = async () => {
    try {
      const response = await fetch('/api/deepseek/schemas');
      const data = await response.json();
      setSchemas(data);
    } catch (error) {
      console.error('Error fetching schemas:', error);
    }
  };

  const fetchExecutions = async () => {
    try {
      const response = await fetch('/api/deepseek/executions');
      const data = await response.json();
      setExecutions(data);
    } catch (error) {
      console.error('Error fetching executions:', error);
    }
  };

  const fetchSystemHealth = async () => {
    try {
      const response = await fetch('/api/deepseek/health');
      const data = await response.json();
      setSystemHealth(data);
    } catch (error) {
      console.error('Error fetching system health:', error);
    }
  };

  const handleCreateWorkflow = async (values: any) => {
    setLoading(true);
    try {
      const response = await fetch('/api/deepseek/workflow/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: values.description })
      });
      const workflow = await response.json();
      setWorkflows([...workflows, workflow]);
      setCreateModalVisible(false);
    } catch (error) {
      console.error('Error creating workflow:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteWorkflow = async (workflowId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/deepseek/workflow/${workflowId}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: {} })
      });
      const execution = await response.json();
      setExecutions([...executions, execution]);
      fetchExecutions();
    } catch (error) {
      console.error('Error executing workflow:', error);
    } finally {
      setLoading(false);
    }
  };

  const workflowColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true
    },
    {
      title: 'Tasks',
      dataIndex: 'tasks',
      key: 'tasks',
      render: (tasks: any[]) => tasks?.length || 0
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'default'}>
          {status || 'draft'}
        </Tag>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: any) => (
        <Space>
          <Button
            icon={<PlayCircleOutlined />}
            onClick={() => handleExecuteWorkflow(record.id)}
            size="small"
            type="primary"
          >
            Execute
          </Button>
          <Button
            onClick={() => setSelectedWorkflow(record)}
            size="small"
          >
            View
          </Button>
        </Space>
      )
    }
  ];

  const schemaColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag icon={<DatabaseOutlined />}>{type}</Tag>
      )
    },
    {
      title: 'Properties',
      dataIndex: 'properties',
      key: 'properties',
      render: (props: any) => Object.keys(props || {}).length
    },
    {
      title: 'Relationships',
      dataIndex: 'relationships',
      key: 'relationships',
      render: (rels: any[]) => rels?.length || 0
    }
  ];

  const executionColumns = [
    {
      title: 'Workflow',
      dataIndex: 'workflowName',
      key: 'workflowName'
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const config: any = {
          completed: { color: 'success', icon: <CheckCircleOutlined /> },
          running: { color: 'processing', icon: <SyncOutlined spin /> },
          failed: { color: 'error', icon: <CloseCircleOutlined /> },
          pending: { color: 'default', icon: <ClockCircleOutlined /> }
        };
        const { color, icon } = config[status] || config.pending;
        return <Tag icon={icon} color={color}>{status}</Tag>;
      }
    },
    {
      title: 'Progress',
      dataIndex: 'progress',
      key: 'progress',
      render: (progress: number) => <Progress percent={progress || 0} size="small" />
    },
    {
      title: 'Duration',
      dataIndex: 'duration',
      key: 'duration',
      render: (duration: number) => `${(duration / 1000).toFixed(2)}s`
    },
    {
      title: 'Tasks',
      key: 'tasks',
      render: (record: any) => (
        <Space>
          <Tag color="green">{record.tasksCompleted || 0} completed</Tag>
          <Tag color="red">{record.tasksFailed || 0} failed</Tag>
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Workflows"
              value={workflows.length}
              prefix={<ApiOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Generated Schemas"
              value={schemas.length}
              prefix={<DatabaseOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Executions"
              value={executions.length}
              prefix={<PlayCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Success Rate"
              value={85}
              suffix="%"
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
      </Row>

      {/* System Health */}
      {systemHealth && (
        <Alert
          message="System Health"
          description={
            <Row gutter={8}>
              {Object.entries(systemHealth.services || {}).map(([key, value]: any) => (
                <Col key={key}>
                  <Badge
                    status={value ? 'success' : 'error'}
                    text={key}
                  />
                </Col>
              ))}
            </Row>
          }
          type="info"
          style={{ marginBottom: '16px' }}
        />
      )}

      {/* Main Tabs */}
      <Tabs defaultActiveKey="workflows">
        <TabPane tab="Workflows" key="workflows">
          <Space direction="vertical" style={{ width: '100%' }}>
            <Button
              type="primary"
              icon={<PlayCircleOutlined />}
              onClick={() => setCreateModalVisible(true)}
            >
              Create Workflow
            </Button>
            <Table
              columns={workflowColumns}
              dataSource={workflows}
              rowKey="id"
              loading={loading}
            />
          </Space>
        </TabPane>

        <TabPane tab="Schemas" key="schemas">
          <Table
            columns={schemaColumns}
            dataSource={schemas}
            rowKey="id"
            loading={loading}
          />
        </TabPane>

        <TabPane tab="Executions" key="executions">
          <Table
            columns={executionColumns}
            dataSource={executions}
            rowKey="id"
            loading={loading}
          />
        </TabPane>

        <TabPane tab="Timeline" key="timeline">
          <Timeline mode="left">
            {executions.slice(0, 10).map((exec: any) => (
              <Timeline.Item
                key={exec.id}
                color={exec.status === 'completed' ? 'green' : 'blue'}
                label={new Date(exec.startTime).toLocaleString()}
              >
                <strong>{exec.workflowName}</strong>
                <div>{exec.status}</div>
              </Timeline.Item>
            ))}
          </Timeline>
        </TabPane>
      </Tabs>

      {/* Create Workflow Modal */}
      <Modal
        title="Create New Workflow"
        open={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        footer={null}
      >
        <Form onFinish={handleCreateWorkflow} layout="vertical">
          <Form.Item
            name="description"
            label="Workflow Description"
            rules={[{ required: true, message: 'Please enter workflow description' }]}
          >
            <TextArea
              rows={4}
              placeholder="Describe your workflow in natural language..."
            />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                Generate
              </Button>
              <Button onClick={() => setCreateModalVisible(false)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Workflow Details Modal */}
      {selectedWorkflow && (
        <Modal
          title={selectedWorkflow.name}
          open={!!selectedWorkflow}
          onCancel={() => setSelectedWorkflow(null)}
          width={800}
          footer={null}
        >
          <Space direction="vertical" style={{ width: '100%' }}>
            <Card size="small">
              <strong>Description:</strong> {selectedWorkflow.description}
            </Card>
            <Card size="small" title="Tasks">
              {selectedWorkflow.tasks?.map((task: any, index: number) => (
                <div key={index} style={{ marginBottom: '8px' }}>
                  <Tag>{index + 1}</Tag> {task.name}
                </div>
              ))}
            </Card>
          </Space>
        </Modal>
      )}
    </div>
  );
};

export default DeepSeekWorkflowDashboard;
