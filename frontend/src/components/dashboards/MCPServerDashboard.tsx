import React, { useState, useEffect } from 'react';
import { Card, Tabs, Table, Button, Modal, Form, Input, Select, Switch, Tag, Space, Statistic, Row, Col, message, Descriptions, Timeline } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, PlayCircleOutlined, StopOutlined, ReloadOutlined, EyeOutlined, LinkOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { mcpServerAPI } from '../../services/apiService';

const { TabPane } = Tabs;
const { TextArea } = Input;
const { Option } = Select;

const MCPServerDashboard: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [servers, setServers] = useState<any[]>([]);
  const [selectedServer, setSelectedServer] = useState<any>(null);
  const [schemas, setSchemas] = useState<any[]>([]);
  const [executions, setExecutions] = useState<any[]>([]);
  const [health, setHealth] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [schemaModalVisible, setSchemaModalVisible] = useState(false);
  const [executeModalVisible, setExecuteModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [executeForm] = Form.useForm();

  useEffect(() => {
    loadServers();
    loadSchemas();
    loadHealth();
  }, []);

  const loadServers = async (filters?: any) => {
    try {
      setLoading(true);
      const response = await mcpServerAPI.getServers(filters);
      if (response.success) {
        setServers(response.servers || []);
      }
    } catch (error: any) {
      message.error('Failed to load MCP servers: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadSchemas = async () => {
    try {
      const response = await mcpServerAPI.getSchemas();
      if (response.success) {
        setSchemas(response.schemas || []);
      }
    } catch (error: any) {
      console.error('Failed to load schemas:', error);
    }
  };

  const loadHealth = async () => {
    try {
      const response = await mcpServerAPI.getHealth();
      if (response.success) {
        setHealth(response);
      }
    } catch (error: any) {
      console.error('Failed to load health:', error);
    }
  };

  const loadServerDetail = async (serverId: string) => {
    try {
      const response = await mcpServerAPI.getServer(serverId);
      if (response.success) {
        setSelectedServer(response.server);
        setDetailModalVisible(true);
      }
    } catch (error: any) {
      message.error('Failed to load server details: ' + error.message);
    }
  };

  const loadExecutions = async (serverId: string) => {
    try {
      const response = await mcpServerAPI.getExecutions(serverId);
      if (response.success) {
        setExecutions(response.executions || []);
      }
    } catch (error: any) {
      message.error('Failed to load executions: ' + error.message);
    }
  };

  const handleCreate = () => {
    form.resetFields();
    form.setFieldsValue({ active: true });
    setModalVisible(true);
  };

  const handleEdit = (server: any) => {
    form.setFieldsValue({
      ...server,
      schema_ids: server.linked_schemas?.map((s: any) => s.id) || []
    });
    setSelectedServer(server);
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      if (selectedServer) {
        await mcpServerAPI.updateServer(selectedServer.id, values);
        message.success('MCP server updated successfully');
      } else {
        await mcpServerAPI.createServer(values);
        message.success('MCP server created successfully');
      }

      setModalVisible(false);
      setSelectedServer(null);
      form.resetFields();
      await loadServers();
    } catch (error: any) {
      message.error('Failed to save MCP server: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (serverId: string) => {
    Modal.confirm({
      title: 'Delete MCP Server',
      content: 'Are you sure you want to delete this MCP server?',
      onOk: async () => {
        try {
          await mcpServerAPI.deleteServer(serverId);
          message.success('MCP server deleted successfully');
          await loadServers();
        } catch (error: any) {
          message.error('Failed to delete MCP server: ' + error.message);
        }
      }
    });
  };

  const handleLinkSchema = async (serverId: string, schemaId: string) => {
    try {
      await mcpServerAPI.linkSchema(serverId, schemaId);
      message.success('Schema linked successfully');
      await loadServers();
    } catch (error: any) {
      message.error('Failed to link schema: ' + error.message);
    }
  };

  const handleUnlinkSchema = (serverId: string, schemaId: string) => {
    Modal.confirm({
      title: 'Unlink Schema',
      content: 'Are you sure you want to unlink this schema?',
      onOk: async () => {
        try {
          await mcpServerAPI.unlinkSchema(serverId, schemaId);
          message.success('Schema unlinked successfully');
          await loadServers();
        } catch (error: any) {
          message.error('Failed to unlink schema: ' + error.message);
        }
      }
    });
  };

  const handleExecute = (server: any) => {
    setSelectedServer(server);
    executeForm.resetFields();
    setExecuteModalVisible(true);
  };

  const handleExecuteSubmit = async () => {
    try {
      const values = await executeForm.validateFields();
      setLoading(true);

      const response = await mcpServerAPI.executeServer(selectedServer.id, values);
      if (response.success) {
        message.success('Execution started successfully');
        setExecuteModalVisible(false);
        executeForm.resetFields();
        await loadExecutions(selectedServer.id);
      }
    } catch (error: any) {
      message.error('Failed to execute: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const serverColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: any) => (
        <Space>
          <Tag color={record.active ? 'green' : 'red'}>
            {record.active ? 'Active' : 'Inactive'}
          </Tag>
          <a onClick={() => loadServerDetail(record.id)}>{text}</a>
        </Space>
      )
    },
    {
      title: 'Agent Type',
      dataIndex: 'agent_type',
      key: 'agent_type',
      render: (type: string) => <Tag color="blue">{type}</Tag>
    },
    {
      title: 'Model',
      dataIndex: 'model_name',
      key: 'model_name',
      render: (model: string) => <Tag color="purple">{model || 'deepseek-r1'}</Tag>
    },
    {
      title: 'Linked Schemas',
      dataIndex: 'linked_schemas_count',
      key: 'linked_schemas_count',
      render: (count: number) => (
        <Tag color="cyan">
          <LinkOutlined /> {count || 0}
        </Tag>
      )
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => new Date(date).toLocaleDateString()
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space>
          <Button 
            type="link" 
            icon={<EyeOutlined />}
            onClick={() => loadServerDetail(record.id)}
          >
            View
          </Button>
          <Button 
            type="link" 
            icon={<PlayCircleOutlined />}
            onClick={() => handleExecute(record)}
          >
            Execute
          </Button>
          <Button 
            type="link" 
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Button 
            type="link" 
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          />
        </Space>
      )
    }
  ];

  const schemaColumns = [
    {
      title: 'Schema Name',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (category: string) => <Tag>{category}</Tag>
    }
  ];

  const executionColumns = [
    {
      title: 'Tool Name',
      dataIndex: 'tool_name',
      key: 'tool_name',
      render: (name: string) => <Tag color="blue">{name}</Tag>
    },
    {
      title: 'Status',
      dataIndex: 'success',
      key: 'success',
      render: (success: boolean) => (
        <Tag color={success ? 'green' : 'red'}>
          {success ? 'Success' : 'Failed'}
        </Tag>
      )
    },
    {
      title: 'Duration',
      dataIndex: 'duration',
      key: 'duration',
      render: (duration: number) => `${duration || 0}ms`
    },
    {
      title: 'Timestamp',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (date: string) => new Date(date).toLocaleString()
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <h1>
          <ThunderboltOutlined /> MCP Server Management
        </h1>
        <p>Manage AI agent instances with schema linking and tool execution tracking</p>
      </Card>

      <Tabs defaultActiveKey="servers" style={{ marginTop: '24px' }}>
        <TabPane tab="Servers" key="servers">
          <Card>
            <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between' }}>
              <Space>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleCreate}
                >
                  Create Server
                </Button>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={() => loadServers()}
                >
                  Refresh
                </Button>
              </Space>
              <Space>
                <Select
                  placeholder="Filter by agent type"
                  style={{ width: 200 }}
                  allowClear
                  onChange={(value) => loadServers(value ? { agentType: value } : {})}
                >
                  <Option value="data-mining">Data Mining</Option>
                  <Option value="seo-analysis">SEO Analysis</Option>
                  <Option value="content-generation">Content Generation</Option>
                  <Option value="workflow-automation">Workflow Automation</Option>
                </Select>
                <Select
                  placeholder="Filter by status"
                  style={{ width: 150 }}
                  allowClear
                  onChange={(value) => loadServers(value !== undefined ? { active: value } : {})}
                >
                  <Option value="true">Active</Option>
                  <Option value="false">Inactive</Option>
                </Select>
              </Space>
            </div>
            <Table
              dataSource={servers}
              columns={serverColumns}
              loading={loading}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </TabPane>

        <TabPane tab="Health" key="health">
          <Card title="System Health">
            {health && (
              <Row gutter={16}>
                <Col span={8}>
                  <Statistic
                    title="Total Servers"
                    value={health.total_servers || 0}
                    prefix={<ThunderboltOutlined />}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="Active Servers"
                    value={health.active_servers || 0}
                    valueStyle={{ color: '#3f8600' }}
                    prefix={<PlayCircleOutlined />}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="Inactive Servers"
                    value={health.inactive_servers || 0}
                    valueStyle={{ color: '#cf1322' }}
                    prefix={<StopOutlined />}
                  />
                </Col>
              </Row>
            )}
          </Card>
        </TabPane>

        <TabPane tab="Schemas" key="schemas">
          <Card title="Available Schemas">
            <Table
              dataSource={schemas}
              columns={schemaColumns}
              loading={loading}
              rowKey="id"
              pagination={{ pageSize: 15 }}
            />
          </Card>
        </TabPane>
      </Tabs>

      {/* Create/Edit Modal */}
      <Modal
        title={selectedServer ? 'Edit MCP Server' : 'Create MCP Server'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => {
          setModalVisible(false);
          setSelectedServer(null);
          form.resetFields();
        }}
        width={700}
        confirmLoading={loading}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Server Name"
            rules={[{ required: true, message: 'Please enter server name' }]}
          >
            <Input placeholder="My MCP Server" />
          </Form.Item>
          
          <Form.Item name="description" label="Description">
            <TextArea rows={3} placeholder="Describe the purpose of this MCP server" />
          </Form.Item>

          <Form.Item
            name="agent_type"
            label="Agent Type"
            rules={[{ required: true, message: 'Please select agent type' }]}
          >
            <Select placeholder="Select agent type">
              <Option value="data-mining">Data Mining</Option>
              <Option value="seo-analysis">SEO Analysis</Option>
              <Option value="content-generation">Content Generation</Option>
              <Option value="workflow-automation">Workflow Automation</Option>
              <Option value="schema-discovery">Schema Discovery</Option>
            </Select>
          </Form.Item>

          <Form.Item name="model_name" label="Model Name">
            <Select placeholder="Select model" defaultValue="deepseek-r1">
              <Option value="deepseek-r1">DeepSeek R1</Option>
              <Option value="deepseek-coder">DeepSeek Coder</Option>
              <Option value="gpt-4">GPT-4</Option>
              <Option value="claude-3">Claude 3</Option>
            </Select>
          </Form.Item>

          <Form.Item name="endpoint_url" label="Endpoint URL">
            <Input placeholder="https://api.example.com/mcp" />
          </Form.Item>

          <Form.Item name="topic" label="Topic/Queue">
            <Input placeholder="mcp-data-mining" />
          </Form.Item>

          <Form.Item name="schema_ids" label="Link Schemas">
            <Select mode="multiple" placeholder="Select schemas to link">
              {schemas.map(schema => (
                <Option key={schema.id} value={schema.id}>
                  {schema.name} ({schema.category})
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="active" label="Active" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>

      {/* Detail Modal */}
      <Modal
        title="MCP Server Details"
        open={detailModalVisible}
        onCancel={() => {
          setDetailModalVisible(false);
          setSelectedServer(null);
        }}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Close
          </Button>
        ]}
        width={900}
      >
        {selectedServer && (
          <>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Name">{selectedServer.name}</Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={selectedServer.active ? 'green' : 'red'}>
                  {selectedServer.active ? 'Active' : 'Inactive'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Agent Type">
                <Tag color="blue">{selectedServer.agent_type}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Model">
                <Tag color="purple">{selectedServer.model_name || 'deepseek-r1'}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Endpoint">{selectedServer.endpoint_url || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="Topic">{selectedServer.topic || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="Description" span={2}>
                {selectedServer.description || 'No description'}
              </Descriptions.Item>
            </Descriptions>

            <h3 style={{ marginTop: '24px' }}>Linked Schemas</h3>
            {selectedServer.linked_schemas && selectedServer.linked_schemas.length > 0 ? (
              <Space wrap>
                {selectedServer.linked_schemas.map((schema: any) => (
                  <Tag key={schema.id} closable onClose={() => handleUnlinkSchema(selectedServer.id, schema.id)}>
                    {schema.name} ({schema.category})
                  </Tag>
                ))}
              </Space>
            ) : (
              <p>No schemas linked</p>
            )}

            <h3 style={{ marginTop: '24px' }}>Recent Executions</h3>
            {selectedServer.recent_executions && selectedServer.recent_executions.length > 0 ? (
              <Timeline>
                {selectedServer.recent_executions.slice(0, 5).map((exec: any, index: number) => (
                  <Timeline.Item 
                    key={index}
                    color={exec.success ? 'green' : 'red'}
                  >
                    <Tag color="blue">{exec.tool_name}</Tag> - {exec.duration}ms
                    <br />
                    <small>{new Date(exec.timestamp).toLocaleString()}</small>
                  </Timeline.Item>
                ))}
              </Timeline>
            ) : (
              <p>No executions yet</p>
            )}
          </>
        )}
      </Modal>

      {/* Execute Modal */}
      <Modal
        title="Execute MCP Server"
        open={executeModalVisible}
        onOk={handleExecuteSubmit}
        onCancel={() => {
          setExecuteModalVisible(false);
          setSelectedServer(null);
          executeForm.resetFields();
        }}
        confirmLoading={loading}
      >
        <Form form={executeForm} layout="vertical">
          <Form.Item
            name="tool_name"
            label="Tool Name"
            rules={[{ required: true, message: 'Please enter tool name' }]}
          >
            <Input placeholder="data-mining-tool" />
          </Form.Item>
          
          <Form.Item
            name="parameters"
            label="Parameters (JSON)"
          >
            <TextArea rows={6} placeholder='{"url": "https://example.com", "depth": 2}' />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MCPServerDashboard;
