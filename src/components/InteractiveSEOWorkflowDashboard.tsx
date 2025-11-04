/**
 * Interactive SEO Workflow Creation Dashboard
 * Claude/Copilot-style prompt interface with session management
 * 
 * Features:
 * - Interactive chat-based workflow creation
 * - Session tracking with visual cards
 * - Dynamic form generation from schemas
 * - Real-time workflow status updates
 * - 192 SEO attribute configuration
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Card,
  Input,
  Button,
  List,
  Tag,
  Progress,
  Steps,
  Form,
  Select,
  Space,
  Typography,
  Alert,
  Divider,
  Spin,
  Badge,
  Avatar,
  Timeline,
  Collapse,
  Checkbox,
  InputNumber,
  message,
  Modal
} from 'antd';
import {
  SendOutlined,
  RobotOutlined,
  UserOutlined,
  CheckCircleOutlined,
  LoadingOutlined,
  ThunderboltOutlined,
  DatabaseOutlined,
  ApiOutlined,
  SettingOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  InfoCircleOutlined,
  BulbOutlined,
  CodeOutlined,
  LineChartOutlined
} from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';

const { TextArea } = Input;
const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;
const { Panel } = Collapse;
const { Option } = Select;

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  toolCalls?: any[];
  attachments?: any[];
}

interface WorkflowSession {
  id: string;
  name: string;
  status: 'active' | 'completed' | 'paused' | 'failed';
  currentStep: number;
  totalSteps: number;
  workflows: any[];
  createdAt: Date;
  lastActivity: Date;
  metadata: any;
}

interface SEOAttribute {
  name: string;
  category: string;
  description: string;
  enabled: boolean;
  priority: number;
}

const InteractiveSEOWorkflowDashboard: React.FC = () => {
  // State
  const [sessions, setSessions] = useState<WorkflowSession[]>([]);
  const [activeSession, setActiveSession] = useState<WorkflowSession | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showAttributeConfig, setShowAttributeConfig] = useState(false);
  const [seoAttributes, setSeoAttributes] = useState<SEOAttribute[]>([]);
  const [workflowStatus, setWorkflowStatus] = useState<any>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const ws = useRef<WebSocket | null>(null);

  // Initialize WebSocket connection
  useEffect(() => {
    connectWebSocket();
    loadSessions();
    loadSEOAttributes();

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const connectWebSocket = () => {
    ws.current = new WebSocket('ws://localhost:3001/ws/workflow-status');
    
    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'workflow_status') {
        setWorkflowStatus(data.payload);
      } else if (data.type === 'session_update') {
        updateSessionStatus(data.payload);
      } else if (data.type === 'task_progress') {
        updateTaskProgress(data.payload);
      }
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error);
      message.error('Connection error. Retrying...');
    };

    ws.current.onclose = () => {
      // Reconnect after 5 seconds
      setTimeout(connectWebSocket, 5000);
    };
  };

  const loadSessions = async () => {
    try {
      const response = await fetch('/api/seo-workflow/sessions');
      const data = await response.json();
      setSessions(data.sessions || []);
    } catch (error) {
      console.error('Error loading sessions:', error);
    }
  };

  const loadSEOAttributes = async () => {
    try {
      const response = await fetch('/api/seo-workflow/attributes');
      const data = await response.json();
      setSeoAttributes(data.attributes || []);
    } catch (error) {
      console.error('Error loading SEO attributes:', error);
    }
  };

  const createNewSession = async () => {
    try {
      const response = await fetch('/api/seo-workflow/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `SEO Campaign ${new Date().toLocaleString()}`,
          type: 'workflow_creation'
        })
      });
      
      const data = await response.json();
      const newSession = data.session;
      
      setSessions([newSession, ...sessions]);
      setActiveSession(newSession);
      setMessages([{
        id: '1',
        role: 'assistant',
        content: `Hi! I'm your SEO workflow assistant. I'll help you create a comprehensive data mining campaign for your website.

To get started, I need some information:

1. **What's your target website URL?**
2. **What are your main SEO goals?** (e.g., improve rankings, monitor performance, competitor analysis)
3. **How often do you want to collect data?** (hourly, daily, weekly)
4. **Any specific attributes you want to prioritize?** (I can extract 192+ different SEO metrics)

Let's begin! 🚀`,
        timestamp: new Date()
      }]);
      
      message.success('New session created!');
    } catch (error) {
      console.error('Error creating session:', error);
      message.error('Failed to create session');
    }
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || !activeSession) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages([...messages, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/seo-workflow/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: activeSession.id,
          message: inputValue,
          conversationHistory: messages
        })
      });

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
        toolCalls: data.toolCalls,
        attachments: data.executedTools
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Update session if workflow was created
      if (data.executedTools?.workflow) {
        updateSessionWithWorkflow(data.executedTools.workflow);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      message.error('Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  const updateSessionWithWorkflow = (workflow: any) => {
    if (!activeSession) return;

    const updatedSession = {
      ...activeSession,
      workflows: [...activeSession.workflows, workflow],
      currentStep: activeSession.currentStep + 1
    };

    setActiveSession(updatedSession);
    setSessions(sessions.map(s => s.id === updatedSession.id ? updatedSession : s));
  };

  const updateSessionStatus = (payload: any) => {
    setSessions(sessions.map(s => 
      s.id === payload.sessionId 
        ? { ...s, ...payload.updates }
        : s
    ));
  };

  const updateTaskProgress = (payload: any) => {
    setWorkflowStatus((prev: any) => ({
      ...prev,
      tasks: prev?.tasks?.map((t: any) =>
        t.id === payload.taskId
          ? { ...t, progress: payload.progress, status: payload.status }
          : t
      )
    }));
  };

  const executeWorkflow = async (workflowId: string) => {
    try {
      const response = await fetch(`/api/seo-workflow/execute/${workflowId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: activeSession?.id
        })
      });

      const data = await response.json();
      message.success('Workflow execution started!');
      
      // Status updates will come via WebSocket
    } catch (error) {
      console.error('Error executing workflow:', error);
      message.error('Failed to execute workflow');
    }
  };

  const renderMessage = (msg: Message) => {
    const isUser = msg.role === 'user';

    return (
      <motion.div
        key={msg.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{
          display: 'flex',
          justifyContent: isUser ? 'flex-end' : 'flex-start',
          marginBottom: 16
        }}
      >
        <div style={{ maxWidth: '70%', display: 'flex', gap: 12, flexDirection: isUser ? 'row-reverse' : 'row' }}>
          <Avatar
            icon={isUser ? <UserOutlined /> : <RobotOutlined />}
            style={{
              backgroundColor: isUser ? '#1890ff' : '#52c41a',
              flexShrink: 0
            }}
          />
          <div>
            <Card
              size="small"
              style={{
                backgroundColor: isUser ? '#e6f7ff' : '#f6ffed',
                borderColor: isUser ? '#91d5ff' : '#b7eb8f'
              }}
            >
              <Paragraph style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                {msg.content}
              </Paragraph>
              
              {msg.toolCalls && msg.toolCalls.length > 0 && (
                <div style={{ marginTop: 12 }}>
                  <Divider style={{ margin: '8px 0' }} />
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    <ThunderboltOutlined /> Executed {msg.toolCalls.length} tool(s)
                  </Text>
                </div>
              )}
              
              {msg.attachments && (
                <div style={{ marginTop: 12 }}>
                  {msg.attachments.workflow && (
                    <Alert
                      message="Workflow Created!"
                      description={
                        <div>
                          <Text strong>{msg.attachments.workflow.name}</Text>
                          <br />
                          <Button
                            size="small"
                            type="link"
                            icon={<PlayCircleOutlined />}
                            onClick={() => executeWorkflow(msg.attachments.workflow.id)}
                          >
                            Execute Now
                          </Button>
                        </div>
                      }
                      type="success"
                      showIcon
                      icon={<CheckCircleOutlined />}
                    />
                  )}
                  
                  {msg.attachments.algorithms && msg.attachments.algorithms.length > 0 && (
                    <Collapse size="small" style={{ marginTop: 8 }}>
                      <Panel header={`${msg.attachments.algorithms.length} Algorithms Generated`} key="1">
                        <List
                          size="small"
                          dataSource={msg.attachments.algorithms}
                          renderItem={(alg: any) => (
                            <List.Item>
                              <Text code>{alg.attributeName}</Text>
                            </List.Item>
                          )}
                        />
                      </Panel>
                    </Collapse>
                  )}
                </div>
              )}
            </Card>
            <Text type="secondary" style={{ fontSize: 11, marginTop: 4, display: 'block' }}>
              {msg.timestamp.toLocaleTimeString()}
            </Text>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div style={{ padding: 24, maxWidth: 1400, margin: '0 auto' }}>
      <Title level={2}>
        <BulbOutlined /> Interactive SEO Workflow Creator
      </Title>
      <Paragraph>
        Create intelligent SEO data mining workflows through natural conversation.
        Configure 192+ attributes and let AI generate optimized N8N workflows.
      </Paragraph>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 24, marginTop: 24 }}>
        {/* Sessions Sidebar */}
        <div>
          <Card
            title="Sessions"
            extra={
              <Button
                type="primary"
                size="small"
                onClick={createNewSession}
              >
                + New
              </Button>
            }
          >
            <List
              size="small"
              dataSource={sessions}
              renderItem={(session) => (
                <List.Item
                  onClick={() => setActiveSession(session)}
                  style={{
                    cursor: 'pointer',
                    backgroundColor: activeSession?.id === session.id ? '#e6f7ff' : 'transparent',
                    padding: 12,
                    borderRadius: 4,
                    marginBottom: 8
                  }}
                >
                  <List.Item.Meta
                    avatar={
                      <Badge
                        status={
                          session.status === 'active' ? 'processing' :
                          session.status === 'completed' ? 'success' :
                          session.status === 'paused' ? 'warning' : 'error'
                        }
                      />
                    }
                    title={<Text strong>{session.name}</Text>}
                    description={
                      <div>
                        <Text type="secondary" style={{ fontSize: 11 }}>
                          Step {session.currentStep}/{session.totalSteps || '?'}
                        </Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: 11 }}>
                          {session.workflows.length} workflow(s)
                        </Text>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>

          <Card
            title="SEO Attributes"
            style={{ marginTop: 16 }}
            extra={
              <Button
                size="small"
                icon={<SettingOutlined />}
                onClick={() => setShowAttributeConfig(true)}
              >
                Configure
              </Button>
            }
          >
            <div style={{ fontSize: 12 }}>
              <Text type="secondary">
                {seoAttributes.filter(a => a.enabled).length} / {seoAttributes.length} enabled
              </Text>
              <div style={{ marginTop: 12 }}>
                {Array.from(new Set(seoAttributes.map(a => a.category))).map(category => (
                  <Tag key={category} style={{ marginBottom: 4 }}>
                    {category.replace(/_/g, ' ')}
                  </Tag>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Main Chat Area */}
        <div>
          <Card
            title={
              activeSession ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Text strong>{activeSession.name}</Text>
                  <Tag color={activeSession.status === 'active' ? 'green' : 'default'}>
                    {activeSession.status}
                  </Tag>
                  {activeSession.totalSteps > 0 && (
                    <Progress
                      percent={Math.round((activeSession.currentStep / activeSession.totalSteps) * 100)}
                      size="small"
                      style={{ width: 100 }}
                    />
                  )}
                </div>
              ) : (
                'Select or create a session to begin'
              )
            }
            style={{ height: 'calc(100vh - 200px)', display: 'flex', flexDirection: 'column' }}
            bodyStyle={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}
          >
            {activeSession ? (
              <>
                {/* Messages */}
                <div style={{ flex: 1, overflowY: 'auto', paddingRight: 12 }}>
                  <AnimatePresence>
                    {messages.map(renderMessage)}
                  </AnimatePresence>
                  
                  {isLoading && (
                    <div style={{ textAlign: 'center', padding: 20 }}>
                      <Spin indicator={<LoadingOutlined spin />} />
                      <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
                        AI is thinking...
                      </Text>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>

                {/* Workflow Status Panel */}
                {workflowStatus && (
                  <Card
                    size="small"
                    style={{ marginBottom: 12 }}
                    title={<Text strong><LineChartOutlined /> Workflow Status</Text>}
                  >
                    <Timeline
                      items={workflowStatus.tasks?.map((task: any) => ({
                        color: task.status === 'completed' ? 'green' : 
                               task.status === 'running' ? 'blue' :
                               task.status === 'failed' ? 'red' : 'gray',
                        children: (
                          <div>
                            <Text>{task.name}</Text>
                            <br />
                            <Progress
                              percent={task.progress}
                              size="small"
                              status={task.status === 'failed' ? 'exception' : undefined}
                            />
                          </div>
                        )
                      })) || []}
                    />
                  </Card>
                )}

                {/* Input Area */}
                <div style={{ paddingTop: 12, borderTop: '1px solid #f0f0f0' }}>
                  <Space.Compact style={{ width: '100%' }}>
                    <TextArea
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onPressEnter={(e) => {
                        if (!e.shiftKey) {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                      placeholder="Type your message... (Shift+Enter for new line)"
                      autoSize={{ minRows: 1, maxRows: 4 }}
                      disabled={isLoading}
                    />
                    <Button
                      type="primary"
                      icon={<SendOutlined />}
                      onClick={sendMessage}
                      loading={isLoading}
                      disabled={!inputValue.trim()}
                    >
                      Send
                    </Button>
                  </Space.Compact>
                  
                  <div style={{ marginTop: 8 }}>
                    <Text type="secondary" style={{ fontSize: 11 }}>
                      <InfoCircleOutlined /> Pro tip: Be specific about your SEO goals for better workflow recommendations
                    </Text>
                  </div>
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: 60 }}>
                <BulbOutlined style={{ fontSize: 48, color: '#bfbfbf' }} />
                <Title level={4} style={{ marginTop: 16, color: '#bfbfbf' }}>
                  No Active Session
                </Title>
                <Button type="primary" onClick={createNewSession}>
                  Create New Session
                </Button>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* SEO Attributes Configuration Modal */}
      <Modal
        title="Configure SEO Attributes"
        open={showAttributeConfig}
        onCancel={() => setShowAttributeConfig(false)}
        width={800}
        footer={null}
      >
        <Collapse>
          {Array.from(new Set(seoAttributes.map(a => a.category))).map(category => (
            <Panel
              header={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text strong>{category.replace(/_/g, ' ').toUpperCase()}</Text>
                  <Tag>
                    {seoAttributes.filter(a => a.category === category && a.enabled).length} enabled
                  </Tag>
                </div>
              }
              key={category}
            >
              <List
                size="small"
                dataSource={seoAttributes.filter(a => a.category === category)}
                renderItem={(attr) => (
                  <List.Item
                    actions={[
                      <Checkbox
                        checked={attr.enabled}
                        onChange={(e) => {
                          setSeoAttributes(seoAttributes.map(a =>
                            a.name === attr.name ? { ...a, enabled: e.target.checked } : a
                          ));
                        }}
                      />
                    ]}
                  >
                    <List.Item.Meta
                      title={attr.name.replace(/_/g, ' ')}
                      description={attr.description}
                    />
                  </List.Item>
                )}
              />
            </Panel>
          ))}
        </Collapse>
      </Modal>
    </div>
  );
};

export default InteractiveSEOWorkflowDashboard;
