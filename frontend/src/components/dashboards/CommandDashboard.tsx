import React, { useState, useEffect } from 'react';
import { Card, Tabs, Table, Button, Form, Input, Modal, Select, message, Tag, Space, Statistic, Row, Col } from 'antd';
import { PlusOutlined, PlayCircleOutlined, EditOutlined, DeleteOutlined, BulbOutlined, BarChartOutlined } from '@ant-design/icons';
import { commandAPI } from '../../services/apiService';

const { TabPane } = Tabs;
const { TextArea } = Input;
const { Option } = Select;

interface Command {
  id: string;
  name: string;
  description: string;
  command: string;
  category: string;
  parameters: string;
  output_type: string;
  is_async: boolean;
  timeout: number;
  created_at: string;
  updated_at: string;
}

interface CommandStats {
  total: number;
  categories: { [key: string]: number };
  recent_executions: number;
  success_rate: number;
}

const CommandDashboard: React.FC = () => {
  const [commands, setCommands] = useState<Command[]>([]);
  const [stats, setStats] = useState<CommandStats | null>(null);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [executeModalVisible, setExecuteModalVisible] = useState(false);
  const [editingCommand, setEditingCommand] = useState<Command | null>(null);
  const [executingCommand, setExecutingCommand] = useState<Command | null>(null);
  const [form] = Form.useForm();
  const [executeForm] = Form.useForm();

  useEffect(() => {
    loadCommands();
    loadStats();
    loadSuggestions();
  }, []);

  const loadCommands = async () => {
    setLoading(true);
    try {
      const response = await commandAPI.getCommands();
      if (response.success) {
        setCommands(response.data || []);
      }
    } catch (error) {
      message.error('Failed to load commands');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await commandAPI.getStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const loadSuggestions = async () => {
    try {
      const response = await commandAPI.getSuggestions();
      if (response.success) {
        setSuggestions(response.data || []);
      }
    } catch (error) {
      console.error('Failed to load suggestions:', error);
    }
  };

  const handleCreateCommand = () => {
    setEditingCommand(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEditCommand = (command: Command) => {
    setEditingCommand(command);
    form.setFieldsValue({
      ...command,
      parameters: command.parameters ? JSON.stringify(command.parameters, null, 2) : '{}'
    });
    setModalVisible(true);
  };

  const handleDeleteCommand = async (id: string) => {
    try {
      const response = await commandAPI.deleteCommand(id);
      if (response.success) {
        message.success('Command deleted successfully');
        loadCommands();
        loadStats();
      }
    } catch (error) {
      message.error('Failed to delete command');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      const commandData = {
        ...values,
        parameters: values.parameters ? JSON.parse(values.parameters) : {}
      };

      let response;
      if (editingCommand) {
        response = await commandAPI.updateCommand(editingCommand.id, commandData);
      } else {
        response = await commandAPI.createCommand(commandData);
      }

      if (response.success) {
        message.success(`Command ${editingCommand ? 'updated' : 'created'} successfully`);
        setModalVisible(false);
        loadCommands();
        loadStats();
      }
    } catch (error) {
      message.error(`Failed to ${editingCommand ? 'update' : 'create'} command`);
    }
  };

  const handleExecuteCommand = (command: Command) => {
    setExecutingCommand(command);
    executeForm.resetFields();
    setExecuteModalVisible(true);
  };

  const handleExecute = async (values: any) => {
    if (!executingCommand) return;

    try {
      const response = await commandAPI.executeCommand({
        command_id: executingCommand.id,
        parameters: values.parameters ? JSON.parse(values.parameters) : {}
      });

      if (response.success) {
        message.success('Command executed successfully');
        Modal.info({
          title: 'Execution Result',
          content: (
            <pre style={{ maxHeight: '400px', overflow: 'auto' }}>
              {JSON.stringify(response.data, null, 2)}
            </pre>
          ),
          width: 700
        });
        setExecuteModalVisible(false);
        loadStats();
      }
    } catch (error) {
      message.error('Failed to execute command');
    }
  };

  const commandColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a: Command, b: Command) => a.name.localeCompare(b.name),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (category: string) => <Tag color="blue">{category}</Tag>,
      filters: Array.from(new Set(commands.map(c => c.category))).map(cat => ({
        text: cat,
        value: cat,
      })),
      onFilter: (value: any, record: Command) => record.category === value,
    },
    {
      title: 'Output Type',
      dataIndex: 'output_type',
      key: 'output_type',
      render: (type: string) => <Tag>{type}</Tag>,
    },
    {
      title: 'Async',
      dataIndex: 'is_async',
      key: 'is_async',
      render: (isAsync: boolean) => (
        <Tag color={isAsync ? 'orange' : 'green'}>{isAsync ? 'Yes' : 'No'}</Tag>
      ),
    },
    {
      title: 'Timeout',
      dataIndex: 'timeout',
      key: 'timeout',
      render: (timeout: number) => `${timeout}s`,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Command) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<PlayCircleOutlined />}
            onClick={() => handleExecuteCommand(record)}
          >
            Execute
          </Button>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEditCommand(record)}
          >
            Edit
          </Button>
          <Button
            danger
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteCommand(record.id)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  const suggestionColumns = [
    {
      title: 'Command',
      dataIndex: 'command',
      key: 'command',
      ellipsis: true,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (category: string) => <Tag color="purple">{category}</Tag>,
    },
    {
      title: 'Use Cases',
      dataIndex: 'use_cases',
      key: 'use_cases',
      render: (useCases: string[]) => useCases?.slice(0, 2).join(', ') || '-',
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <h1>Command Management</h1>
      
      <Tabs defaultActiveKey="commands">
        <TabPane tab="Commands" key="commands">
          <Card>
            <div style={{ marginBottom: 16 }}>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleCreateCommand}
              >
                Create Command
              </Button>
            </div>
            
            <Table
              columns={commandColumns}
              dataSource={commands}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </TabPane>

        <TabPane tab="Suggestions" key="suggestions">
          <Card title="AI-Powered Command Suggestions">
            <p style={{ marginBottom: 16 }}>
              Discover recommended commands for common tasks and workflows.
            </p>
            <Table
              columns={suggestionColumns}
              dataSource={suggestions}
              rowKey={(record) => record.command}
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </TabPane>

        <TabPane tab="Statistics" key="statistics">
          <Card title="Command Statistics">
            {stats && (
              <>
                <Row gutter={16} style={{ marginBottom: 24 }}>
                  <Col span={6}>
                    <Statistic
                      title="Total Commands"
                      value={stats.total}
                      prefix={<BarChartOutlined />}
                    />
                  </Col>
                  <Col span={6}>
                    <Statistic
                      title="Recent Executions"
                      value={stats.recent_executions}
                      prefix={<PlayCircleOutlined />}
                    />
                  </Col>
                  <Col span={6}>
                    <Statistic
                      title="Success Rate"
                      value={stats.success_rate}
                      suffix="%"
                      precision={1}
                    />
                  </Col>
                  <Col span={6}>
                    <Statistic
                      title="Categories"
                      value={Object.keys(stats.categories || {}).length}
                    />
                  </Col>
                </Row>

                <Card title="Commands by Category" style={{ marginTop: 16 }}>
                  <Row gutter={16}>
                    {Object.entries(stats.categories || {}).map(([category, count]) => (
                      <Col span={8} key={category} style={{ marginBottom: 16 }}>
                        <Card>
                          <Statistic title={category} value={count as number} />
                        </Card>
                      </Col>
                    ))}
                  </Row>
                </Card>
              </>
            )}
          </Card>
        </TabPane>
      </Tabs>

      <Modal
        title={editingCommand ? 'Edit Command' : 'Create Command'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="name"
            label="Command Name"
            rules={[{ required: true, message: 'Please enter command name' }]}
          >
            <Input placeholder="e.g., backup-database" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please enter description' }]}
          >
            <TextArea rows={3} placeholder="Describe what this command does" />
          </Form.Item>

          <Form.Item
            name="command"
            label="Command"
            rules={[{ required: true, message: 'Please enter command' }]}
          >
            <TextArea rows={2} placeholder="e.g., pg_dump -U postgres mydb" />
          </Form.Item>

          <Form.Item
            name="category"
            label="Category"
            rules={[{ required: true, message: 'Please select category' }]}
          >
            <Select placeholder="Select category">
              <Option value="database">Database</Option>
              <Option value="deployment">Deployment</Option>
              <Option value="monitoring">Monitoring</Option>
              <Option value="maintenance">Maintenance</Option>
              <Option value="development">Development</Option>
              <Option value="testing">Testing</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="output_type"
            label="Output Type"
            rules={[{ required: true, message: 'Please select output type' }]}
          >
            <Select placeholder="Select output type">
              <Option value="json">JSON</Option>
              <Option value="text">Text</Option>
              <Option value="html">HTML</Option>
              <Option value="binary">Binary</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="parameters"
            label="Parameters (JSON)"
            initialValue="{}"
          >
            <TextArea rows={4} placeholder='{"param1": "value1"}' />
          </Form.Item>

          <Form.Item
            name="is_async"
            label="Async Execution"
            initialValue={false}
          >
            <Select>
              <Option value={false}>No (Synchronous)</Option>
              <Option value={true}>Yes (Asynchronous)</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="timeout"
            label="Timeout (seconds)"
            initialValue={30}
            rules={[{ required: true, message: 'Please enter timeout' }]}
          >
            <Input type="number" min={1} max={3600} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`Execute: ${executingCommand?.name}`}
        open={executeModalVisible}
        onCancel={() => setExecuteModalVisible(false)}
        onOk={() => executeForm.submit()}
        width={600}
      >
        <Form
          form={executeForm}
          layout="vertical"
          onFinish={handleExecute}
        >
          <Form.Item
            name="parameters"
            label="Execution Parameters (JSON)"
            initialValue="{}"
          >
            <TextArea rows={6} placeholder='{"param1": "value1"}' />
          </Form.Item>
          
          {executingCommand && (
            <div style={{ marginTop: 16, padding: 12, background: '#f5f5f5', borderRadius: 4 }}>
              <strong>Command:</strong> <code>{executingCommand.command}</code>
            </div>
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default CommandDashboard;
