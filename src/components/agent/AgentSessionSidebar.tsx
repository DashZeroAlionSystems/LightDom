/**
 * Agent Session Sidebar Component
 * Similar to GitHub Copilot's chat interface with session management
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Drawer,
  Button,
  Input,
  List,
  Card,
  Avatar,
  Space,
  Typography,
  Tag,
  Tooltip,
  Dropdown,
  Menu,
  Modal,
  Form,
  Select,
  message,
  Badge,
  Divider
} from 'antd';
import {
  PlusOutlined,
  SendOutlined,
  RobotOutlined,
  SettingOutlined,
  DeleteOutlined,
  MoreOutlined,
  CopyOutlined,
  CheckCircleOutlined,
  LoadingOutlined,
  CloseOutlined,
  MenuOutlined
} from '@ant-design/icons';
import axios from 'axios';

const { TextArea } = Input;
const { Text, Title } = Typography;

interface AgentSession {
  session_id: string;
  name: string;
  agent_type: string;
  status: string;
  created_at: string;
}

interface AgentMessage {
  message_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
}

interface AgentInstance {
  instance_id: string;
  name: string;
  model_name: string;
  status: string;
}

export const AgentSessionSidebar: React.FC<{ visible?: boolean }> = ({ visible = true }) => {
  const [sidebarOpen, setSidebarOpen] = useState(visible);
  const [sessions, setSessions] = useState<AgentSession[]>([]);
  const [currentSession, setCurrentSession] = useState<AgentSession | null>(null);
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [instances, setInstances] = useState<AgentInstance[]>([]);
  const [currentInstance, setCurrentInstance] = useState<AgentInstance | null>(null);
  const [promptInput, setPromptInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showNewSessionModal, setShowNewSessionModal] = useState(false);
  const [showInstanceModal, setShowInstanceModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [form] = Form.useForm();
  const [instanceForm] = Form.useForm();

  useEffect(() => {
    if (sidebarOpen) {
      loadSessions();
    }
  }, [sidebarOpen]);

  useEffect(() => {
    if (currentSession) {
      loadMessages();
      loadInstances();
    }
  }, [currentSession]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadSessions = async () => {
    try {
      const response = await axios.get('/api/agent/sessions');
      setSessions(response.data);
      
      const activeSession = response.data.find((s: AgentSession) => s.status === 'active');
      if (activeSession && !currentSession) {
        setCurrentSession(activeSession);
      }
    } catch (error) {
      console.error('Failed to load sessions:', error);
      message.error('Failed to load sessions');
    }
  };

  const loadMessages = async () => {
    if (!currentSession) return;
    
    try {
      const response = await axios.get(`/api/agent/messages/${currentSession.session_id}`);
      setMessages(response.data);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const loadInstances = async () => {
    if (!currentSession) return;
    
    try {
      const response = await axios.get(`/api/agent/instances?session_id=${currentSession.session_id}`);
      setInstances(response.data);
      
      const readyInstance = response.data.find((i: AgentInstance) => i.status === 'ready');
      if (readyInstance && !currentInstance) {
        setCurrentInstance(readyInstance);
      }
    } catch (error) {
      console.error('Failed to load instances:', error);
    }
  };

  const handleCreateSession = async (values: any) => {
    try {
      const response = await axios.post('/api/agent/sessions', {
        name: values.name,
        description: values.description,
        agent_type: values.agent_type || 'deepseek'
      });
      
      message.success('Session created successfully');
      setShowNewSessionModal(false);
      form.resetFields();
      await loadSessions();
      setCurrentSession(response.data);
    } catch (error) {
      console.error('Failed to create session:', error);
      message.error('Failed to create session');
    }
  };

  const handleCreateInstance = async (values: any) => {
    if (!currentSession) return;
    
    try {
      const response = await axios.post('/api/agent/instances', {
        session_id: currentSession.session_id,
        name: values.name,
        model_name: values.model_name || 'deepseek-coder',
        temperature: parseFloat(values.temperature) || 0.7,
        max_tokens: parseInt(values.max_tokens) || 4096,
        tools_enabled: values.tools_enabled || [],
        services_enabled: values.services_enabled || []
      });
      
      message.success('Agent instance created successfully');
      setShowInstanceModal(false);
      instanceForm.resetFields();
      await loadInstances();
      setCurrentInstance(response.data);
    } catch (error) {
      console.error('Failed to create instance:', error);
      message.error('Failed to create instance');
    }
  };

  const handleSendMessage = async () => {
    if (!promptInput.trim() || !currentSession || !currentInstance) {
      message.warning('Please select an agent instance and enter a message');
      return;
    }

    const userMessage = promptInput.trim();
    setPromptInput('');
    setIsLoading(true);

    try {
      await axios.post('/api/agent/messages', {
        session_id: currentSession.session_id,
        instance_id: currentInstance.instance_id,
        content: userMessage
      });

      await loadMessages();

      // Poll for AI response with exponential backoff
      let attempts = 0;
      const maxAttempts = 10;
      const pollInterval = 1000;
      
      const pollForResponse = async () => {
        if (attempts >= maxAttempts) {
          setIsLoading(false);
          return;
        }
        
        await loadMessages();
        attempts++;
        
        // TODO: Implement WebSocket or SSE for real-time updates
        // For now, use simple polling
        setTimeout(pollForResponse, pollInterval * Math.min(attempts, 3));
      };
      
      // Start polling after initial delay
      setTimeout(() => {
        setIsLoading(false);
        // pollForResponse(); // Commented out to avoid excessive polling
      }, 1000);
    } catch (error) {
      console.error('Failed to send message:', error);
      message.error('Failed to send message');
      setIsLoading(false);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    try {
      await axios.delete(`/api/agent/sessions/${sessionId}`);
      message.success('Session deleted');
      await loadSessions();
      if (currentSession?.session_id === sessionId) {
        setCurrentSession(null);
        setMessages([]);
      }
    } catch (error) {
      console.error('Failed to delete session:', error);
      message.error('Failed to delete session');
    }
  };

  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    message.success('Copied to clipboard');
  };

  return (
    <>
      <Button
        type="primary"
        icon={<RobotOutlined />}
        onClick={() => setSidebarOpen(!sidebarOpen)}
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          borderRadius: '50%',
          width: 56,
          height: 56,
          zIndex: 999
        }}
      >
        {sidebarOpen && <Badge count={sessions.length} />}
      </Button>

      <Drawer
        title={
          <Space style={{ width: '100%', justifyContent: 'space-between' }}>
            <Space>
              <RobotOutlined />
              <Text strong>AI Agent Sessions</Text>
            </Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              size="small"
              onClick={() => setShowNewSessionModal(true)}
            >
              New Task
            </Button>
          </Space>
        }
        placement="right"
        width={450}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        bodyStyle={{ padding: 0, display: 'flex', flexDirection: 'column', height: '100%' }}
      >
        <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0' }}>
          <Select
            style={{ width: '100%' }}
            placeholder="Select a session"
            value={currentSession?.session_id}
            onChange={(value) => {
              const session = sessions.find(s => s.session_id === value);
              setCurrentSession(session || null);
            }}
            dropdownRender={(menu) => (
              <>
                {menu}
                <Divider style={{ margin: '8px 0' }} />
                <div style={{ padding: '8px' }}>
                  <Button
                    type="link"
                    icon={<PlusOutlined />}
                    onClick={() => setShowNewSessionModal(true)}
                    block
                  >
                    Create New Session
                  </Button>
                </div>
              </>
            )}
          >
            {sessions.map(session => (
              <Select.Option key={session.session_id} value={session.session_id}>
                <Space>
                  <Tag color={session.status === 'active' ? 'green' : 'default'}>
                    {session.agent_type}
                  </Tag>
                  {session.name}
                </Space>
              </Select.Option>
            ))}
          </Select>
        </div>

        {currentSession && (
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0' }}>
            <Space style={{ width: '100%' }} direction="vertical" size="small">
              <Text type="secondary" style={{ fontSize: 12 }}>Agent Instance:</Text>
              <Select
                style={{ width: '100%' }}
                placeholder="Select an agent instance"
                value={currentInstance?.instance_id}
                onChange={(value) => {
                  const instance = instances.find(i => i.instance_id === value);
                  setCurrentInstance(instance || null);
                }}
                dropdownRender={(menu) => (
                  <>
                    {menu}
                    <Divider style={{ margin: '8px 0' }} />
                    <div style={{ padding: '8px' }}>
                      <Button
                        type="link"
                        icon={<PlusOutlined />}
                        onClick={() => setShowInstanceModal(true)}
                        block
                      >
                        Create New Instance
                      </Button>
                    </div>
                  </>
                )}
              >
                {instances.map(instance => (
                  <Select.Option key={instance.instance_id} value={instance.instance_id}>
                    <Space>
                      <Badge status={instance.status === 'ready' ? 'success' : 'default'} />
                      {instance.name} ({instance.model_name})
                    </Space>
                  </Select.Option>
                ))}
              </Select>
            </Space>
          </div>
        )}

        <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
          {currentSession ? (
            messages.length > 0 ? (
              <List
                dataSource={messages}
                renderItem={(msg) => (
                  <List.Item style={{ border: 'none', padding: '8px 0' }}>
                    <Card
                      size="small"
                      style={{
                        width: '100%',
                        backgroundColor: msg.role === 'user' ? '#e6f7ff' : '#f5f5f5'
                      }}
                      bodyStyle={{ padding: '12px' }}
                    >
                      <Space direction="vertical" style={{ width: '100%' }} size="small">
                        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                          <Space>
                            <Avatar
                              size="small"
                              icon={msg.role === 'user' ? '👤' : <RobotOutlined />}
                              style={{
                                backgroundColor: msg.role === 'user' ? '#1890ff' : '#52c41a'
                              }}
                            />
                            <Text strong>{msg.role === 'user' ? 'You' : 'AI'}</Text>
                          </Space>
                          <Button
                            type="text"
                            size="small"
                            icon={<CopyOutlined />}
                            onClick={() => handleCopyMessage(msg.content)}
                          />
                        </Space>
                        <Text style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</Text>
                      </Space>
                    </Card>
                  </List.Item>
                )}
              />
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: '#999' }}>
                <RobotOutlined style={{ fontSize: 48, marginBottom: 16 }} />
                <Text type="secondary">Start a conversation with your AI agent</Text>
              </div>
            )
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#999' }}>
              <Text type="secondary">Select or create a session to begin</Text>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {currentSession && currentInstance && (
          <div style={{ padding: '16px', borderTop: '1px solid #f0f0f0' }}>
            <Space.Compact style={{ width: '100%' }}>
              <TextArea
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
                placeholder="Ask your AI agent anything..."
                autoSize={{ minRows: 2, maxRows: 6 }}
                onPressEnter={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                disabled={isLoading}
              />
              <Button
                type="primary"
                icon={isLoading ? <LoadingOutlined /> : <SendOutlined />}
                onClick={handleSendMessage}
                disabled={isLoading || !promptInput.trim()}
                style={{ height: 'auto' }}
              />
            </Space.Compact>
            <Text type="secondary" style={{ fontSize: 11, display: 'block', marginTop: 8 }}>
              Press Enter to send, Shift+Enter for new line
            </Text>
          </div>
        )}
      </Drawer>

      <Modal
        title="Create New Agent Session"
        open={showNewSessionModal}
        onCancel={() => {
          setShowNewSessionModal(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateSession}>
          <Form.Item
            name="name"
            label="Session Name"
            rules={[{ required: true, message: 'Please enter a session name' }]}
          >
            <Input placeholder="e.g., Feature Development, Bug Fix, Code Review" />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <TextArea rows={3} placeholder="Optional description of what you're working on" />
          </Form.Item>
          <Form.Item name="agent_type" label="Agent Type" initialValue="deepseek">
            <Select>
              <Select.Option value="deepseek">DeepSeek Coder</Select.Option>
              <Select.Option value="gpt4">GPT-4</Select.Option>
              <Select.Option value="claude">Claude</Select.Option>
              <Select.Option value="custom">Custom</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Create Agent Instance"
        open={showInstanceModal}
        onCancel={() => {
          setShowInstanceModal(false);
          instanceForm.resetFields();
        }}
        onOk={() => instanceForm.submit()}
        width={600}
      >
        <Form form={instanceForm} layout="vertical" onFinish={handleCreateInstance}>
          <Form.Item
            name="name"
            label="Instance Name"
            rules={[{ required: true, message: 'Please enter an instance name' }]}
          >
            <Input placeholder="e.g., Frontend Developer, API Specialist" />
          </Form.Item>
          <Form.Item name="model_name" label="Model" initialValue="deepseek-coder">
            <Select>
              <Select.Option value="deepseek-coder">DeepSeek Coder</Select.Option>
              <Select.Option value="deepseek-chat">DeepSeek Chat</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="temperature" label="Temperature" initialValue={0.7}>
            <Input type="number" min={0} max={1} step={0.1} />
          </Form.Item>
          <Form.Item name="max_tokens" label="Max Tokens" initialValue={4096}>
            <Input type="number" min={256} max={8192} step={256} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};
