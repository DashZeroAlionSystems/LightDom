/**
 * LangChain Ollama Dashboard Component
 * 
 * React component for interacting with the LangChain + Ollama DeepSeek integration
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Card,
  Input,
  Button,
  Select,
  Tabs,
  List,
  Badge,
  Statistic,
  Row,
  Col,
  Space,
  Typography,
  Divider,
  message,
  Spin,
  Alert,
  Tag,
  Modal,
  Switch,
} from 'antd';
import {
  SendOutlined,
  DeleteOutlined,
  ReloadOutlined,
  CodeOutlined,
  RobotOutlined,
  HistoryOutlined,
  BarChartOutlined,
  SettingOutlined,
  ThunderboltOutlined,
  MessageOutlined,
} from '@ant-design/icons';

const { TextArea } = Input;
const { Option } = Select;
const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

const LangChainOllamaDashboard = () => {
  // State management
  const [loading, setLoading] = useState(false);
  const [health, setHealth] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [activeTab, setActiveTab] = useState('chat');
  
  // Chat state
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [currentSession, setCurrentSession] = useState('default');
  const [systemPrompt, setSystemPrompt] = useState('You are a helpful AI assistant.');
  
  // Code generation state
  const [codeDescription, setCodeDescription] = useState('');
  const [codeLanguage, setCodeLanguage] = useState('javascript');
  const [codeContext, setCodeContext] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  
  // Workflow generation state
  const [workflowDescription, setWorkflowDescription] = useState('');
  const [workflowRequirements, setWorkflowRequirements] = useState('');
  const [generatedWorkflow, setGeneratedWorkflow] = useState('');
  
  // Configuration state
  const [config, setConfig] = useState({
    model: 'deepseek-r1:latest',
    temperature: 0.7,
    maxTokens: 2048,
    topP: 0.9,
  });
  const [configModalVisible, setConfigModalVisible] = useState(false);
  
  const chatContainerRef = useRef(null);
  
  // API base URL
  const API_BASE = '/api/langchain';
  
  // Fetch health status
  const fetchHealth = async () => {
    try {
      const response = await fetch(`${API_BASE}/health`);
      const data = await response.json();
      setHealth(data);
    } catch (error) {
      console.error('Failed to fetch health:', error);
      message.error('Failed to check service health');
    }
  };
  
  // Fetch metrics
  const fetchMetrics = async () => {
    try {
      const response = await fetch(`${API_BASE}/metrics`);
      const data = await response.json();
      setMetrics(data.metrics);
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
    }
  };
  
  // Fetch sessions
  const fetchSessions = async () => {
    try {
      const response = await fetch(`${API_BASE}/sessions`);
      const data = await response.json();
      setSessions(data.sessions || []);
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
    }
  };
  
  // Load initial data
  useEffect(() => {
    fetchHealth();
    fetchMetrics();
    fetchSessions();
    
    // Refresh metrics every 10 seconds
    const interval = setInterval(() => {
      fetchMetrics();
      fetchSessions();
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Auto-scroll chat
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);
  
  // Send chat message
  const sendMessage = async () => {
    if (!message.trim()) return;
    
    const userMessage = { role: 'user', content: message, timestamp: new Date().toISOString() };
    setChatHistory(prev => [...prev, userMessage]);
    setMessage('');
    setLoading(true);
    
    try {
      const response = await fetch(`${API_BASE}/conversation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: message,
          sessionId: currentSession,
          systemPrompt: systemPrompt,
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        const aiMessage = {
          role: 'assistant',
          content: data.response,
          timestamp: new Date().toISOString(),
          duration: data.metadata.duration,
        };
        setChatHistory(prev => [...prev, aiMessage]);
        fetchSessions(); // Update session list
      } else {
        message.error(`Failed to get response: ${data.error}`);
      }
    } catch (error) {
      console.error('Chat error:', error);
      message.error('Failed to send message');
    } finally {
      setLoading(false);
    }
  };
  
  // Generate code
  const generateCode = async () => {
    if (!codeDescription.trim()) {
      message.warning('Please enter a code description');
      return;
    }
    
    setLoading(true);
    setGeneratedCode('');
    
    try {
      const response = await fetch(`${API_BASE}/generate/code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: codeDescription,
          language: codeLanguage,
          context: codeContext,
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setGeneratedCode(data.response);
        message.success('Code generated successfully');
      } else {
        message.error(`Failed to generate code: ${data.error}`);
      }
    } catch (error) {
      console.error('Code generation error:', error);
      message.error('Failed to generate code');
    } finally {
      setLoading(false);
    }
  };
  
  // Generate workflow
  const generateWorkflow = async () => {
    if (!workflowDescription.trim()) {
      message.warning('Please enter a workflow description');
      return;
    }
    
    setLoading(true);
    setGeneratedWorkflow('');
    
    try {
      const requirements = workflowRequirements
        .split('\n')
        .filter(r => r.trim())
        .map(r => r.trim());
      
      const response = await fetch(`${API_BASE}/generate/workflow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: workflowDescription,
          requirements,
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setGeneratedWorkflow(data.response);
        message.success('Workflow generated successfully');
      } else {
        message.error(`Failed to generate workflow: ${data.error}`);
      }
    } catch (error) {
      console.error('Workflow generation error:', error);
      message.error('Failed to generate workflow');
    } finally {
      setLoading(false);
    }
  };
  
  // Clear session
  const clearSession = async (sessionId) => {
    try {
      const response = await fetch(`${API_BASE}/session/${sessionId}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (data.success) {
        message.success(`Session "${sessionId}" cleared`);
        if (sessionId === currentSession) {
          setChatHistory([]);
        }
        fetchSessions();
      } else {
        message.error(`Failed to clear session: ${data.error}`);
      }
    } catch (error) {
      console.error('Clear session error:', error);
      message.error('Failed to clear session');
    }
  };
  
  // Update configuration
  const updateConfig = async () => {
    try {
      const response = await fetch(`${API_BASE}/config`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      
      const data = await response.json();
      
      if (data.success) {
        message.success('Configuration updated');
        setConfigModalVisible(false);
        fetchHealth();
      } else {
        message.error(`Failed to update config: ${data.error}`);
      }
    } catch (error) {
      console.error('Config update error:', error);
      message.error('Failed to update configuration');
    }
  };
  
  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      <Title level={2}>
        <RobotOutlined /> LangChain + Ollama DeepSeek Dashboard
      </Title>
      
      {/* Health Status */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Service Status"
              value={health?.status || 'Unknown'}
              valueStyle={{ color: health?.status === 'healthy' ? '#3f8600' : '#cf1322' }}
              prefix={health?.status === 'healthy' ? '✓' : '✗'}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Requests"
              value={metrics?.totalRequests || 0}
              prefix={<ThunderboltOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Success Rate"
              value={metrics?.successRate || '0%'}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Avg Response Time"
              value={Math.round(metrics?.averageResponseTime || 0)}
              suffix="ms"
              prefix={<BarChartOutlined />}
            />
          </Card>
        </Col>
      </Row>
      
      {/* Main Content Tabs */}
      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          {/* Chat Tab */}
          <TabPane
            tab={
              <span>
                <MessageOutlined />
                Chat
              </span>
            }
            key="chat"
          >
            <Row gutter={16}>
              <Col span={18}>
                <Card
                  title="Conversation"
                  extra={
                    <Space>
                      <Select
                        value={currentSession}
                        onChange={setCurrentSession}
                        style={{ width: 200 }}
                      >
                        <Option value="default">Default Session</Option>
                        {sessions.map(s => (
                          <Option key={s.sessionId} value={s.sessionId}>
                            {s.sessionId} ({s.messageCount} msgs)
                          </Option>
                        ))}
                      </Select>
                      <Button
                        icon={<DeleteOutlined />}
                        onClick={() => clearSession(currentSession)}
                        danger
                      >
                        Clear
                      </Button>
                    </Space>
                  }
                >
                  <div
                    ref={chatContainerRef}
                    style={{
                      height: '400px',
                      overflowY: 'auto',
                      marginBottom: '16px',
                      padding: '12px',
                      backgroundColor: '#f5f5f5',
                      borderRadius: '4px',
                    }}
                  >
                    {chatHistory.length === 0 ? (
                      <Text type="secondary">Start a conversation...</Text>
                    ) : (
                      chatHistory.map((msg, idx) => (
                        <div
                          key={idx}
                          style={{
                            marginBottom: '12px',
                            textAlign: msg.role === 'user' ? 'right' : 'left',
                          }}
                        >
                          <Tag color={msg.role === 'user' ? 'blue' : 'green'}>
                            {msg.role === 'user' ? 'You' : 'AI'}
                          </Tag>
                          <div
                            style={{
                              display: 'inline-block',
                              maxWidth: '70%',
                              padding: '8px 12px',
                              backgroundColor: msg.role === 'user' ? '#1890ff' : '#fff',
                              color: msg.role === 'user' ? '#fff' : '#000',
                              borderRadius: '8px',
                              textAlign: 'left',
                            }}
                          >
                            <Paragraph
                              style={{
                                margin: 0,
                                color: msg.role === 'user' ? '#fff' : '#000',
                              }}
                            >
                              {msg.content}
                            </Paragraph>
                            {msg.duration && (
                              <Text
                                type="secondary"
                                style={{
                                  fontSize: '11px',
                                  color: msg.role === 'user' ? '#fff' : undefined,
                                }}
                              >
                                {msg.duration}ms
                              </Text>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                    {loading && (
                      <div style={{ textAlign: 'center', padding: '12px' }}>
                        <Spin tip="AI is thinking..." />
                      </div>
                    )}
                  </div>
                  
                  <Input.Group compact>
                    <Input
                      style={{ width: 'calc(100% - 100px)' }}
                      placeholder="Type your message..."
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      onPressEnter={sendMessage}
                      disabled={loading}
                    />
                    <Button
                      type="primary"
                      icon={<SendOutlined />}
                      onClick={sendMessage}
                      loading={loading}
                      style={{ width: '100px' }}
                    >
                      Send
                    </Button>
                  </Input.Group>
                </Card>
              </Col>
              
              <Col span={6}>
                <Card title="Settings" size="small">
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <div>
                      <Text strong>System Prompt:</Text>
                      <TextArea
                        rows={4}
                        value={systemPrompt}
                        onChange={e => setSystemPrompt(e.target.value)}
                        placeholder="System instructions for the AI..."
                      />
                    </div>
                    
                    <Button
                      icon={<SettingOutlined />}
                      onClick={() => setConfigModalVisible(true)}
                      block
                    >
                      Advanced Config
                    </Button>
                    
                    <Button
                      icon={<ReloadOutlined />}
                      onClick={() => {
                        fetchHealth();
                        fetchMetrics();
                        fetchSessions();
                      }}
                      block
                    >
                      Refresh Status
                    </Button>
                  </Space>
                </Card>
                
                <Card
                  title="Active Sessions"
                  size="small"
                  style={{ marginTop: '16px' }}
                >
                  <List
                    size="small"
                    dataSource={sessions}
                    renderItem={session => (
                      <List.Item
                        actions={[
                          <Button
                            size="small"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => clearSession(session.sessionId)}
                          />,
                        ]}
                      >
                        <Text ellipsis style={{ maxWidth: '150px' }}>
                          {session.sessionId}
                        </Text>
                        <Badge count={session.messageCount} />
                      </List.Item>
                    )}
                  />
                </Card>
              </Col>
            </Row>
          </TabPane>
          
          {/* Code Generation Tab */}
          <TabPane
            tab={
              <span>
                <CodeOutlined />
                Code Generation
              </span>
            }
            key="code"
          >
            <Row gutter={16}>
              <Col span={12}>
                <Card title="Input">
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <div>
                      <Text strong>Code Description:</Text>
                      <TextArea
                        rows={4}
                        value={codeDescription}
                        onChange={e => setCodeDescription(e.target.value)}
                        placeholder="Describe the code you want to generate..."
                      />
                    </div>
                    
                    <div>
                      <Text strong>Language:</Text>
                      <Select
                        value={codeLanguage}
                        onChange={setCodeLanguage}
                        style={{ width: '100%' }}
                      >
                        <Option value="javascript">JavaScript</Option>
                        <Option value="typescript">TypeScript</Option>
                        <Option value="python">Python</Option>
                        <Option value="java">Java</Option>
                        <Option value="go">Go</Option>
                        <Option value="rust">Rust</Option>
                        <Option value="cpp">C++</Option>
                      </Select>
                    </div>
                    
                    <div>
                      <Text strong>Additional Context:</Text>
                      <TextArea
                        rows={2}
                        value={codeContext}
                        onChange={e => setCodeContext(e.target.value)}
                        placeholder="Any additional context or requirements..."
                      />
                    </div>
                    
                    <Button
                      type="primary"
                      icon={<CodeOutlined />}
                      onClick={generateCode}
                      loading={loading}
                      block
                      size="large"
                    >
                      Generate Code
                    </Button>
                  </Space>
                </Card>
              </Col>
              
              <Col span={12}>
                <Card title="Generated Code">
                  {generatedCode ? (
                    <pre
                      style={{
                        backgroundColor: '#f5f5f5',
                        padding: '12px',
                        borderRadius: '4px',
                        overflow: 'auto',
                        maxHeight: '500px',
                      }}
                    >
                      <code>{generatedCode}</code>
                    </pre>
                  ) : (
                    <Text type="secondary">No code generated yet</Text>
                  )}
                </Card>
              </Col>
            </Row>
          </TabPane>
          
          {/* Workflow Generation Tab */}
          <TabPane
            tab={
              <span>
                <HistoryOutlined />
                Workflow
              </span>
            }
            key="workflow"
          >
            <Row gutter={16}>
              <Col span={12}>
                <Card title="Input">
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <div>
                      <Text strong>Workflow Description:</Text>
                      <TextArea
                        rows={4}
                        value={workflowDescription}
                        onChange={e => setWorkflowDescription(e.target.value)}
                        placeholder="Describe the workflow you want to create..."
                      />
                    </div>
                    
                    <div>
                      <Text strong>Requirements (one per line):</Text>
                      <TextArea
                        rows={6}
                        value={workflowRequirements}
                        onChange={e => setWorkflowRequirements(e.target.value)}
                        placeholder="Requirement 1&#10;Requirement 2&#10;Requirement 3"
                      />
                    </div>
                    
                    <Button
                      type="primary"
                      icon={<ThunderboltOutlined />}
                      onClick={generateWorkflow}
                      loading={loading}
                      block
                      size="large"
                    >
                      Generate Workflow
                    </Button>
                  </Space>
                </Card>
              </Col>
              
              <Col span={12}>
                <Card title="Generated Workflow">
                  {generatedWorkflow ? (
                    <pre
                      style={{
                        backgroundColor: '#f5f5f5',
                        padding: '12px',
                        borderRadius: '4px',
                        overflow: 'auto',
                        maxHeight: '500px',
                      }}
                    >
                      <code>{generatedWorkflow}</code>
                    </pre>
                  ) : (
                    <Text type="secondary">No workflow generated yet</Text>
                  )}
                </Card>
              </Col>
            </Row>
          </TabPane>
          
          {/* Metrics Tab */}
          <TabPane
            tab={
              <span>
                <BarChartOutlined />
                Metrics
              </span>
            }
            key="metrics"
          >
            <Row gutter={16}>
              <Col span={8}>
                <Card title="Request Statistics">
                  <Statistic
                    title="Total Requests"
                    value={metrics?.totalRequests || 0}
                  />
                  <Divider />
                  <Statistic
                    title="Successful"
                    value={metrics?.successfulRequests || 0}
                    valueStyle={{ color: '#3f8600' }}
                  />
                  <Divider />
                  <Statistic
                    title="Failed"
                    value={metrics?.failedRequests || 0}
                    valueStyle={{ color: '#cf1322' }}
                  />
                </Card>
              </Col>
              
              <Col span={8}>
                <Card title="Performance">
                  <Statistic
                    title="Success Rate"
                    value={metrics?.successRate || '0%'}
                    valueStyle={{ color: '#3f8600' }}
                  />
                  <Divider />
                  <Statistic
                    title="Average Response Time"
                    value={Math.round(metrics?.averageResponseTime || 0)}
                    suffix="ms"
                  />
                </Card>
              </Col>
              
              <Col span={8}>
                <Card title="Sessions">
                  <Statistic
                    title="Active Sessions"
                    value={metrics?.activeSessions || 0}
                  />
                  <Divider />
                  <Statistic
                    title="Total Messages"
                    value={sessions.reduce((sum, s) => sum + s.messageCount, 0)}
                  />
                </Card>
              </Col>
            </Row>
            
            <Card title="Service Configuration" style={{ marginTop: '16px' }}>
              {health && (
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Text>
                    <strong>Model:</strong> {health.config?.model}
                  </Text>
                  <Text>
                    <strong>Endpoint:</strong> {health.config?.baseUrl}
                  </Text>
                  <Text>
                    <strong>Temperature:</strong> {health.config?.temperature}
                  </Text>
                </Space>
              )}
            </Card>
          </TabPane>
        </Tabs>
      </Card>
      
      {/* Configuration Modal */}
      <Modal
        title="Advanced Configuration"
        open={configModalVisible}
        onOk={updateConfig}
        onCancel={() => setConfigModalVisible(false)}
        okText="Update"
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <Text strong>Model:</Text>
            <Input
              value={config.model}
              onChange={e => setConfig({ ...config, model: e.target.value })}
              placeholder="deepseek-r1:latest"
            />
          </div>
          
          <div>
            <Text strong>Temperature:</Text>
            <Input
              type="number"
              min={0}
              max={2}
              step={0.1}
              value={config.temperature}
              onChange={e =>
                setConfig({ ...config, temperature: parseFloat(e.target.value) })
              }
            />
          </div>
          
          <div>
            <Text strong>Max Tokens:</Text>
            <Input
              type="number"
              min={256}
              max={8192}
              step={256}
              value={config.maxTokens}
              onChange={e =>
                setConfig({ ...config, maxTokens: parseInt(e.target.value) })
              }
            />
          </div>
          
          <div>
            <Text strong>Top P:</Text>
            <Input
              type="number"
              min={0}
              max={1}
              step={0.05}
              value={config.topP}
              onChange={e => setConfig({ ...config, topP: parseFloat(e.target.value) })}
            />
          </div>
        </Space>
      </Modal>
    </div>
  );
};

export default LangChainOllamaDashboard;
