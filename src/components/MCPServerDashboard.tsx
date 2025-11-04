/**
 * MCP Server Management Dashboard
 * Comprehensive UI for managing MCP server instances with schema linking
 */

import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Table,
  Tag,
  Space,
  Modal,
  Form,
  Input,
  Select,
  Switch,
  Tabs,
  Statistic,
  Row,
  Col,
  Alert,
  Badge,
  Tooltip,
  Descriptions,
  message,
  Divider,
  Empty,
  Timeline,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  PlayCircleOutlined,
  ApiOutlined,
  DatabaseOutlined,
  CloudOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined,
  InfoCircleOutlined,
  ThunderboltOutlined,
  LinkOutlined,
  BranchesOutlined,
  LineChartOutlined,
  EditFilled,
} from '@ant-design/icons';

const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

interface MCPServer {
  id: number;
  name: string;
  description: string;
  agent_type: string;
  model_name: string;
  endpoint_url?: string;
  topic?: string;
  config: any;
  active: boolean;
  linked_schemas_count?: number;
  linked_schemas?: any[];
  created_at: string;
  updated_at: string;
}

interface Schema {
  id: number;
  name: string;
  description: string;
  category: string;
  schema_definition: any;
}

interface ToolExecution {
  id: string;
  tool_name: string;
  timestamp: string;
  duration: number;
  success: boolean;
}

export const MCPServerDashboard: React.FC = () => {
  const [servers, setServers] = useState<MCPServer[]>([]);
  const [schemas, setSchemas] = useState<Schema[]>([]);
  const [selectedServer, setSelectedServer] = useState<MCPServer | null>(null);
  const [executions, setExecutions] = useState<ToolExecution[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [executeModalVisible, setExecuteModalVisible] = useState(false);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [executeForm] = Form.useForm();
  const [healthStats, setHealthStats] = useState<any>(null);

  useEffect(() => {
    fetchServers();
    fetchSchemas();
    fetchHealth();
  }, []);

  const fetchServers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/mcp/servers');
      const data = await response.json();
      if (data.success) {
        setServers(data.servers);
      }
    } catch (error) {
      console.error('Error fetching servers:', error);
      message.error('Failed to fetch MCP servers');
    } finally {
      setLoading(false);
    }
  };

  const fetchSchemas = async () => {
    try {
      const response = await fetch('/api/mcp/schemas');
      const data = await response.json();
      if (data.success) {
        setSchemas(data.schemas);
      }
    } catch (error) {
      console.error('Error fetching schemas:', error);
    }
  };

  const fetchHealth = async () => {
    try {
      const response = await fetch('/api/mcp/health');
      const data = await response.json();
      if (data.success) {
        setHealthStats(data.health.stats);
      }
    } catch (error) {
      console.error('Error fetching health:', error);
    }
  };

  const fetchExecutions = async (serverId: number) => {
    try {
      const response = await fetch(`/api/mcp/servers/${serverId}/executions?limit=20`);
      const data = await response.json();
      if (data.success) {
        setExecutions(data.executions);
      }
    } catch (error) {
      console.error('Error fetching executions:', error);
    }
  };

  const handleCreate = () => {
    form.resetFields();
    setSelectedServer(null);
    setModalVisible(true);
  };

  const handleEdit = (server: MCPServer) => {
    setSelectedServer(server);
    form.setFieldsValue({
      ...server,
      schema_ids: server.linked_schemas?.map(s => s.id) || [],
    });
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    Modal.confirm({
      title: 'Delete MCP Server',
      content: 'Are you sure you want to delete this MCP server instance?',
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          const response = await fetch(`/api/mcp/servers/${id}`, {
            method: 'DELETE',
          });
          const data = await response.json();
          if (data.success) {
            message.success('MCP server deleted successfully');
            fetchServers();
          } else {
            message.error(data.error || 'Failed to delete server');
          }
        } catch (error) {
          console.error('Error deleting server:', error);
          message.error('Failed to delete server');
        }
      },
    });
  };

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const url = selectedServer
        ? `/api/mcp/servers/${selectedServer.id}`
        : '/api/mcp/servers';
      const method = selectedServer ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const data = await response.json();
      if (data.success) {
        message.success(
          selectedServer
            ? 'MCP server updated successfully'
            : 'MCP server created successfully'
        );
        setModalVisible(false);
        fetchServers();
        fetchHealth();
      } else {
        message.error(data.error || 'Operation failed');
      }
    } catch (error) {
      console.error('Error saving server:', error);
      message.error('Failed to save server');
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteTool = async (values: any) => {
    if (!selectedServer) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/mcp/servers/${selectedServer.id}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const data = await response.json();
      if (data.success) {
        message.success('Tool executed successfully');
        setExecuteModalVisible(false);
        executeForm.resetFields();
        fetchExecutions(selectedServer.id);
      } else {
        message.error(data.error || 'Execution failed');
      }
    } catch (error) {
      console.error('Error executing tool:', error);
      message.error('Failed to execute tool');
    } finally {
      setLoading(false);
    }
  };

  const showServerDetails = async (server: MCPServer) => {
    setSelectedServer(server);
    fetchExecutions(server.id);
    setDetailsModalVisible(true);
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: MCPServer) => (
        <Space>
          <ApiOutlined style={{ color: '#1890ff' }} />
          <a onClick={() => showServerDetails(record)}>{text}</a>
        </Space>
      ),
    },
    {
      title: 'Agent Type',
      dataIndex: 'agent_type',
      key: 'agent_type',
      render: (type: string) => (
        <Tag color="blue">{type.toUpperCase()}</Tag>
      ),
    },
    {
      title: 'Model',
      dataIndex: 'model_name',
      key: 'model_name',
      render: (model: string) => (
        <Tag color="purple">{model}</Tag>
      ),
    },
    {
      title: 'Topic',
      dataIndex: 'topic',
      key: 'topic',
      render: (topic: string) => topic ? (
        <Tag color="cyan">{topic}</Tag>
      ) : <Tag>General</Tag>,
    },
    {
      title: 'Linked Schemas',
      dataIndex: 'linked_schemas_count',
      key: 'linked_schemas_count',
      render: (count: number) => (
        <Badge count={count} showZero style={{ backgroundColor: '#52c41a' }} />
      ),
    },
    {
      title: 'Status',
      dataIndex: 'active',
      key: 'active',
      render: (active: boolean) => (
        <Tag
          icon={active ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
          color={active ? 'success' : 'default'}
        >
          {active ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: MCPServer) => (
        <Space>
          <Tooltip title="Execute Tool">
            <Button
              type="text"
              icon={<PlayCircleOutlined />}
              onClick={() => {
                setSelectedServer(record);
                setExecuteModalVisible(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Edit Schema">
            <Button
              type="text"
              icon={<EditFilled />}
              onClick={() => window.open(`/dashboard/mcp-servers/schema-editor?serverId=${record.id}`, '_blank')}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record.id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={24}>
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Space direction="vertical" size={0}>
                <h2 style={{ margin: 0 }}>
                  <ApiOutlined /> MCP Server Management
                </h2>
                <p style={{ margin: 0, color: '#666' }}>
                  Manage DeepSeek agent instances with schema linking
                </p>
              </Space>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleCreate}
                size="large"
              >
                Create MCP Server
              </Button>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Statistics */}
      {healthStats && (
        <Row gutter={16} style={{ marginBottom: '24px' }}>
          <Col span={6}>
            <Card>
              <Statistic
                title="Total Servers"
                value={healthStats.total_servers || 0}
                prefix={<DatabaseOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Active Servers"
                value={healthStats.active_servers || 0}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Total Executions"
                value={healthStats.total_executions || 0}
                prefix={<ThunderboltOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Avg Execution Time"
                value={
                  healthStats.avg_execution_time
                    ? Math.round(parseFloat(healthStats.avg_execution_time))
                    : 0
                }
                suffix="ms"
                prefix={<SyncOutlined />}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* Servers Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={servers}
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        title={selectedServer ? 'Edit MCP Server' : 'Create MCP Server'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        confirmLoading={loading}
        width={700}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="name"
            label="Server Name"
            rules={[{ required: true, message: 'Please enter server name' }]}
          >
            <Input placeholder="e.g., SEO Specialist Agent" />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <TextArea rows={2} placeholder="Brief description of this agent instance" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="agent_type"
                label="Agent Type"
                rules={[{ required: true }]}
                initialValue="deepseek"
              >
                <Select>
                  <Option value="deepseek">DeepSeek</Option>
                  <Option value="ollama">Ollama</Option>
                  <Option value="openai">OpenAI</Option>
                  <Option value="anthropic">Anthropic</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="model_name"
                label="Model Name"
                initialValue="deepseek-r1"
              >
                <Input placeholder="e.g., deepseek-r1" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="topic" label="Specialization Topic">
                <Input placeholder="e.g., seo, components, workflows" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="active" label="Active" valuePropName="checked" initialValue={true}>
                <Switch />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="endpoint_url" label="API Endpoint (Optional)">
            <Input placeholder="https://api.example.com/mcp" />
          </Form.Item>

          <Form.Item name="schema_ids" label="Linked Schemas">
            <Select
              mode="multiple"
              placeholder="Select schemas to link"
              showSearch
              filterOption={(input, option) =>
                (option?.children as string).toLowerCase().includes(input.toLowerCase())
              }
            >
              {schemas.map((schema) => (
                <Option key={schema.id} value={schema.id}>
                  <Tag color="blue">{schema.category}</Tag> {schema.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Alert
            message="Schema Linking"
            description="Linking schemas provides topic-specific context to the agent instance, improving its performance for specialized tasks."
            type="info"
            showIcon
            icon={<InfoCircleOutlined />}
          />
        </Form>
      </Modal>

      {/* Execute Tool Modal */}
      <Modal
        title={`Execute Tool on ${selectedServer?.name}`}
        open={executeModalVisible}
        onCancel={() => {
          setExecuteModalVisible(false);
          executeForm.resetFields();
        }}
        onOk={() => executeForm.submit()}
        confirmLoading={loading}
      >
        <Form form={executeForm} layout="vertical" onFinish={handleExecuteTool}>
          <Form.Item
            name="tool_name"
            label="Tool Name"
            rules={[{ required: true }]}
          >
            <Select placeholder="Select a tool">
              <Option value="analyze_seo">Analyze SEO</Option>
              <Option value="extract_components">Extract Components</Option>
              <Option value="generate_workflow">Generate Workflow</Option>
              <Option value="generate_content">Generate Content</Option>
              <Option value="mine_data">Mine Data</Option>
            </Select>
          </Form.Item>

          <Form.Item name="args" label="Arguments (JSON)">
            <TextArea
              rows={4}
              placeholder='{"url": "https://example.com", "metrics": ["speed", "seo"]}'
            />
          </Form.Item>

          <Alert
            message={`Linked Schemas: ${selectedServer?.linked_schemas_count || 0}`}
            description="This agent has access to topic-specific schemas for enhanced context."
            type="success"
            showIcon
          />
        </Form>
      </Modal>

      {/* Server Details Modal */}
      <Modal
        title={`Server Details: ${selectedServer?.name}`}
        open={detailsModalVisible}
        onCancel={() => setDetailsModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailsModalVisible(false)}>
            Close
          </Button>,
        ]}
        width={900}
      >
        {selectedServer && (
          <Tabs defaultActiveKey="1">
            <TabPane tab="Overview" key="1">
              <Descriptions bordered column={2}>
                <Descriptions.Item label="Server ID">{selectedServer.id}</Descriptions.Item>
                <Descriptions.Item label="Status">
                  <Tag color={selectedServer.active ? 'success' : 'default'}>
                    {selectedServer.active ? 'Active' : 'Inactive'}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Agent Type">
                  <Tag color="blue">{selectedServer.agent_type}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Model">
                  {selectedServer.model_name}
                </Descriptions.Item>
                <Descriptions.Item label="Topic" span={2}>
                  {selectedServer.topic ? (
                    <Tag color="cyan">{selectedServer.topic}</Tag>
                  ) : (
                    'General Purpose'
                  )}
                </Descriptions.Item>
                <Descriptions.Item label="Endpoint" span={2}>
                  {selectedServer.endpoint_url || 'Not configured'}
                </Descriptions.Item>
                <Descriptions.Item label="Description" span={2}>
                  {selectedServer.description || 'No description'}
                </Descriptions.Item>
              </Descriptions>
            </TabPane>

            <TabPane tab={`Linked Schemas (${selectedServer.linked_schemas?.length || 0})`} key="2">
              {selectedServer.linked_schemas && selectedServer.linked_schemas.length > 0 ? (
                <Timeline>
                  {selectedServer.linked_schemas.map((schema: any) => (
                    <Timeline.Item key={schema.id} color="blue">
                      <p>
                        <strong>{schema.name}</strong>
                        <Tag color="blue" style={{ marginLeft: 8 }}>
                          {schema.category}
                        </Tag>
                      </p>
                    </Timeline.Item>
                  ))}
                </Timeline>
              ) : (
                <Empty description="No schemas linked to this server" />
              )}
            </TabPane>

            <TabPane tab="Recent Executions" key="3">
              {executions.length > 0 ? (
                <Timeline>
                  {executions.map((exec: any) => (
                    <Timeline.Item
                      key={exec.id}
                      color={exec.error ? 'red' : 'green'}
                    >
                      <p>
                        <strong>{exec.tool_name}</strong>
                        <Tag
                          color={exec.error ? 'error' : 'success'}
                          style={{ marginLeft: 8 }}
                        >
                          {exec.error ? 'Failed' : 'Success'}
                        </Tag>
                      </p>
                      <p style={{ fontSize: '12px', color: '#666' }}>
                        {new Date(exec.timestamp).toLocaleString()} • {exec.duration}ms
                      </p>
                    </Timeline.Item>
                  ))}
                </Timeline>
              ) : (
                <Empty description="No executions yet" />
              )}
            </TabPane>
          </Tabs>
        )}
      </Modal>
    </div>
  );
};

export default MCPServerDashboard;
