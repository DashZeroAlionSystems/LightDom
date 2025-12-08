import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Tabs, Button, Input, Table, Tag, Space, message, Spin, Modal, Form, Select, Statistic, Divider } from 'antd';
import { SendOutlined, ToolOutlined, CodeOutlined, FileOutlined, ProjectOutlined, DeleteOutlined, ReloadOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { enhancedRAGAPI } from '../../services/apiService';

const { TabPane } = Tabs;
const { TextArea } = Input;
const { Option } = Select;

const EnhancedRAGDashboard: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [health, setHealth] = useState<any>(null);
  const [tools, setTools] = useState<any[]>([]);
  const [conversations, setConversations] = useState<any[]>([]);
  const [systemInfo, setSystemInfo] = useState<any>(null);
  const [projectInfo, setProjectInfo] = useState<any>(null);
  
  // Chat state
  const [messages, setMessages] = useState<any[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [conversationId, setConversationId] = useState('default');
  const [streaming, setStreaming] = useState(false);
  
  // Tool execution state
  const [toolModalVisible, setToolModalVisible] = useState(false);
  const [selectedTool, setSelectedTool] = useState<string>('');
  const [toolParams, setToolParams] = useState<string>('{}');
  
  // Command execution state
  const [commandModalVisible, setCommandModalVisible] = useState(false);
  const [command, setCommand] = useState('');
  const [commandResult, setCommandResult] = useState<any>(null);

  useEffect(() => {
    fetchHealth();
    fetchTools();
    fetchConversations();
    fetchSystemInfo();
    fetchProjectInfo();
  }, []);

  const fetchHealth = async () => {
    try {
      const data = await enhancedRAGAPI.getHealth();
      setHealth(data);
    } catch (error: any) {
      message.error('Failed to fetch health: ' + error.message);
    }
  };

  const fetchTools = async () => {
    try {
      const data = await enhancedRAGAPI.getTools();
      setTools(data.tools || []);
    } catch (error: any) {
      message.error('Failed to fetch tools: ' + error.message);
    }
  };

  const fetchConversations = async () => {
    try {
      const data = await enhancedRAGAPI.getConversations();
      setConversations(data.conversations || []);
    } catch (error: any) {
      message.error('Failed to fetch conversations: ' + error.message);
    }
  };

  const fetchSystemInfo = async () => {
    try {
      const data = await enhancedRAGAPI.getSystemInfo();
      setSystemInfo(data);
    } catch (error: any) {
      message.error('Failed to fetch system info: ' + error.message);
    }
  };

  const fetchProjectInfo = async () => {
    try {
      const data = await enhancedRAGAPI.getProjectInfo();
      setProjectInfo(data);
    } catch (error: any) {
      message.error('Failed to fetch project info: ' + error.message);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;
    
    const userMessage = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setStreaming(true);
    
    try {
      const response = await enhancedRAGAPI.chatWithTools({
        messages: [...messages, userMessage],
        conversationId,
        mode: 'assistant',
        enableTools: true
      });
      
      const assistantMessage = {
        role: 'assistant',
        content: response.response || response.message,
        timestamp: new Date().toISOString(),
        toolCalls: response.toolCalls
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      message.success('Message sent successfully');
    } catch (error: any) {
      message.error('Failed to send message: ' + error.message);
    } finally {
      setStreaming(false);
    }
  };

  const handleExecuteTool = async () => {
    if (!selectedTool) {
      message.error('Please select a tool');
      return;
    }
    
    setLoading(true);
    try {
      let params = {};
      try {
        params = JSON.parse(toolParams);
      } catch (e) {
        message.error('Invalid JSON parameters');
        setLoading(false);
        return;
      }
      
      const result = await enhancedRAGAPI.executeTool(selectedTool, params);
      message.success('Tool executed successfully');
      Modal.info({
        title: 'Tool Execution Result',
        content: <pre>{JSON.stringify(result, null, 2)}</pre>,
        width: 600
      });
      setToolModalVisible(false);
    } catch (error: any) {
      message.error('Failed to execute tool: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteCommand = async () => {
    if (!command.trim()) {
      message.error('Please enter a command');
      return;
    }
    
    setLoading(true);
    try {
      const result = await enhancedRAGAPI.executeCommand(command);
      setCommandResult(result);
      message.success('Command executed successfully');
    } catch (error: any) {
      message.error('Failed to execute command: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConversation = async (id: string) => {
    setLoading(true);
    try {
      await enhancedRAGAPI.deleteConversation(id);
      message.success('Conversation deleted');
      fetchConversations();
    } catch (error: any) {
      message.error('Failed to delete conversation: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleIndexCodebase = async () => {
    setLoading(true);
    try {
      const result = await enhancedRAGAPI.indexCodebase({});
      message.success('Codebase indexing started');
      Modal.info({
        title: 'Indexing Result',
        content: <pre>{JSON.stringify(result, null, 2)}</pre>
      });
    } catch (error: any) {
      message.error('Failed to index codebase: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const conversationColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 200,
    },
    {
      title: 'Message Count',
      dataIndex: 'messageCount',
      key: 'messageCount',
      width: 150,
    },
    {
      title: 'Created',
      dataIndex: 'created',
      key: 'created',
      render: (text: string) => new Date(text).toLocaleString(),
    },
    {
      title: 'Updated',
      dataIndex: 'updated',
      key: 'updated',
      render: (text: string) => new Date(text).toLocaleString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteConversation(record.id)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  const toolColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
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
      render: (category: string) => <Tag color="blue">{category}</Tag>,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Button
          type="primary"
          size="small"
          icon={<ToolOutlined />}
          onClick={() => {
            setSelectedTool(record.name);
            setToolModalVisible(true);
          }}
        >
          Execute
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <h1>Enhanced RAG Dashboard</h1>
      <p>Advanced RAG with DeepSeek Tools, ORC Integration, and AI Agent Capabilities</p>
      
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Service Status"
              value={health?.status || 'Unknown'}
              prefix={health?.status === 'healthy' ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
              valueStyle={{ color: health?.status === 'healthy' ? '#3f8600' : '#cf1322' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Tools"
              value={tools.length}
              prefix={<ToolOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Conversations"
              value={conversations.length}
              prefix={<ProjectOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Button
              type="primary"
              icon={<ReloadOutlined />}
              onClick={() => {
                fetchHealth();
                fetchTools();
                fetchConversations();
              }}
              block
            >
              Refresh
            </Button>
          </Card>
        </Col>
      </Row>

      <Tabs defaultActiveKey="chat">
        <TabPane tab="AI Chat" key="chat">
          <Card>
            <div style={{ marginBottom: 16 }}>
              <Input
                placeholder="Conversation ID"
                value={conversationId}
                onChange={(e) => setConversationId(e.target.value)}
                style={{ marginBottom: 8 }}
              />
            </div>
            
            <div style={{ height: '400px', overflowY: 'auto', marginBottom: 16, border: '1px solid #d9d9d9', padding: 16, borderRadius: 4 }}>
              {messages.map((msg, idx) => (
                <div key={idx} style={{ marginBottom: 12 }}>
                  <Tag color={msg.role === 'user' ? 'blue' : 'green'}>{msg.role}</Tag>
                  <span style={{ marginLeft: 8, color: '#888', fontSize: '12px' }}>
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </span>
                  <div style={{ marginTop: 4, padding: 8, backgroundColor: msg.role === 'user' ? '#e6f7ff' : '#f6ffed', borderRadius: 4 }}>
                    {msg.content}
                  </div>
                  {msg.toolCalls && msg.toolCalls.length > 0 && (
                    <div style={{ marginTop: 4, fontSize: '12px', color: '#888' }}>
                      <ToolOutlined /> Tool calls: {msg.toolCalls.map((t: any) => t.name).join(', ')}
                    </div>
                  )}
                </div>
              ))}
              {streaming && <Spin tip="AI is thinking..." />}
            </div>
            
            <Space.Compact style={{ width: '100%' }}>
              <Input
                placeholder="Type your message..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onPressEnter={handleSendMessage}
                disabled={streaming}
              />
              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={handleSendMessage}
                loading={streaming}
              >
                Send
              </Button>
            </Space.Compact>
          </Card>
        </TabPane>

        <TabPane tab="Tools" key="tools">
          <Card
            title="Available AI Tools"
            extra={
              <Button
                type="primary"
                icon={<ToolOutlined />}
                onClick={() => setToolModalVisible(true)}
              >
                Execute Tool
              </Button>
            }
          >
            <Table
              dataSource={tools}
              columns={toolColumns}
              rowKey="name"
              loading={loading}
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </TabPane>

        <TabPane tab="Conversations" key="conversations">
          <Card title="Conversation History">
            <Table
              dataSource={conversations}
              columns={conversationColumns}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </TabPane>

        <TabPane tab="Commands" key="commands">
          <Card title="Execute Shell Commands">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Input
                placeholder="Enter command (e.g., ls -la)"
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                onPressEnter={handleExecuteCommand}
              />
              <Button
                type="primary"
                icon={<CodeOutlined />}
                onClick={handleExecuteCommand}
                loading={loading}
              >
                Execute
              </Button>
              
              {commandResult && (
                <Card title="Command Result" style={{ marginTop: 16 }}>
                  <pre style={{ backgroundColor: '#f5f5f5', padding: 12, borderRadius: 4, overflow: 'auto' }}>
                    {JSON.stringify(commandResult, null, 2)}
                  </pre>
                </Card>
              )}
            </Space>
          </Card>
        </TabPane>

        <TabPane tab="System Info" key="system">
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Card title="System Information">
                {systemInfo ? (
                  <pre style={{ backgroundColor: '#f5f5f5', padding: 12, borderRadius: 4, overflow: 'auto' }}>
                    {JSON.stringify(systemInfo, null, 2)}
                  </pre>
                ) : (
                  <Spin />
                )}
              </Card>
            </Col>
            <Col span={12}>
              <Card
                title="Project Information"
                extra={
                  <Button
                    icon={<FileOutlined />}
                    onClick={handleIndexCodebase}
                    loading={loading}
                  >
                    Index Codebase
                  </Button>
                }
              >
                {projectInfo ? (
                  <pre style={{ backgroundColor: '#f5f5f5', padding: 12, borderRadius: 4, overflow: 'auto' }}>
                    {JSON.stringify(projectInfo, null, 2)}
                  </pre>
                ) : (
                  <Spin />
                )}
              </Card>
            </Col>
          </Row>
        </TabPane>
      </Tabs>

      <Modal
        title="Execute Tool"
        visible={toolModalVisible}
        onOk={handleExecuteTool}
        onCancel={() => setToolModalVisible(false)}
        width={600}
      >
        <Form layout="vertical">
          <Form.Item label="Tool">
            <Select
              value={selectedTool}
              onChange={setSelectedTool}
              placeholder="Select a tool"
            >
              {tools.map(tool => (
                <Option key={tool.name} value={tool.name}>
                  {tool.name} - {tool.description}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="Parameters (JSON)">
            <TextArea
              rows={8}
              value={toolParams}
              onChange={(e) => setToolParams(e.target.value)}
              placeholder='{"param1": "value1", "param2": "value2"}'
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default EnhancedRAGDashboard;
