/**
 * Enhanced DeepSeek Chat Component
 * 
 * Advanced conversational interface with:
 * - Quick action buttons for common tasks
 * - Context awareness (hierarchy, session, agent info)
 * - Data mining campaign integration
 * - Conversation history persistence
 * - Knowledge graph integration
 * - Real-time status and metadata display
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Input,
  Button,
  Card,
  List,
  Avatar,
  Tag,
  Spin,
  message,
  Space,
  Typography,
  Dropdown,
  Menu,
  Badge,
  Tooltip,
  Divider,
  Alert,
  Row,
  Col,
} from 'antd';
import {
  SendOutlined,
  RobotOutlined,
  UserOutlined,
  ToolOutlined,
  CheckCircleOutlined,
  ThunderboltOutlined,
  DatabaseOutlined,
  ApiOutlined,
  FolderOutlined,
  TeamOutlined,
  HistoryOutlined,
  SettingOutlined,
  RocketOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import axios from 'axios';

const { TextArea } = Input;
const { Text, Title } = Typography;

// Context information interface
interface SessionContext {
  sessionId: string;
  agentId?: string;
  hierarchy?: string;
  userId?: string;
  role?: string;
  activeWorkflows?: string[];
  activeCampaigns?: string[];
}

// Quick action templates
interface QuickAction {
  key: string;
  label: string;
  icon: React.ReactNode;
  prompt: string;
  description: string;
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    key: 'create-workflow',
    label: 'Create Workflow',
    icon: <RocketOutlined />,
    prompt: 'Create a new workflow for',
    description: 'Start creating a new workflow',
  },
  {
    key: 'data-mining',
    label: 'Start Data Mining',
    icon: <DatabaseOutlined />,
    prompt: 'Setup a data mining campaign for SEO attribute',
    description: 'Configure and start data mining',
  },
  {
    key: 'generate-crud',
    label: 'Generate CRUD API',
    icon: <ApiOutlined />,
    prompt: 'Generate CRUD API for attribute',
    description: 'Auto-generate REST API endpoints',
  },
  {
    key: 'check-campaigns',
    label: 'Check Campaigns',
    icon: <FolderOutlined />,
    prompt: 'Show status of active data mining campaigns',
    description: 'View active campaign status',
  },
  {
    key: 'n8n-workflow',
    label: 'Create N8N Workflow',
    icon: <ThunderboltOutlined />,
    prompt: 'Create an n8n workflow template for',
    description: 'Generate n8n workflow automation',
  },
  {
    key: 'query-schema',
    label: 'Query Schema',
    icon: <FileTextOutlined />,
    prompt: 'Query and analyze schema for',
    description: 'Explore data schemas',
  },
];

export interface EnhancedDeepSeekChatProps {
  sessionContext?: SessionContext;
  onWorkflowCreated?: (workflow: any) => void;
  onDataMiningStarted?: (campaign: any) => void;
  onCRUDGenerated?: (api: any) => void;
  streamingEnabled?: boolean;
  toolsEnabled?: boolean;
  showContext?: boolean;
  persistHistory?: boolean;
}

export const EnhancedDeepSeekChat: React.FC<EnhancedDeepSeekChatProps> = ({
  sessionContext,
  onWorkflowCreated,
  onDataMiningStarted,
  onCRUDGenerated,
  streamingEnabled = true,
  toolsEnabled = true,
  showContext = true,
  persistHistory = true,
}) => {
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [streamingChunk, setStreamingChunk] = useState('');
  const [conversationId, setConversationId] = useState<string>('');
  const [toolCalls, setToolCalls] = useState<any[]>([]);
  const [context, setContext] = useState<SessionContext>(
    sessionContext || {
      sessionId: `session-${Date.now()}`,
      role: 'admin',
    }
  );

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingChunk]);

  // Initialize connection and check health
  useEffect(() => {
    checkOllamaHealth();
    if (streamingEnabled) {
      initializeWebSocket();
    }
    
    // Generate conversation ID
    setConversationId(`conv-${context.sessionId}-${Date.now()}`);

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const checkOllamaHealth = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/ollama/health');
      setIsConnected(response.data.success);
    } catch (error) {
      setIsConnected(false);
      console.error('Ollama health check failed:', error);
    }
  };

  const initializeWebSocket = () => {
    try {
      const ws = new WebSocket('ws://localhost:3001');
      
      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        if (data.type === 'chunk') {
          setStreamingChunk(prev => prev + data.content);
        } else if (data.type === 'complete') {
          // Add assistant message
          setMessages(prev => [
            ...prev,
            { role: 'assistant', content: data.content },
          ]);
          setStreamingChunk('');
          setIsStreaming(false);
        } else if (data.type === 'error') {
          message.error(`Error: ${data.error}`);
          setIsStreaming(false);
        }
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('WebSocket initialization failed:', error);
    }
  };

  const handleSend = async () => {
    if (!inputMessage.trim() || !isConnected) return;

    const userMessage = {
      role: 'user',
      content: inputMessage,
    };

    setMessages(prev => [...prev, userMessage]);
    setIsStreaming(true);

    try {
      // Send via REST API for now (WebSocket enhancement can come later)
      const response = await axios.post('http://localhost:3001/api/ollama/chat', {
        message: inputMessage,
        conversationId,
        context: {
          ...context,
          previousMessages: messages.slice(-5), // Last 5 messages for context
        },
      });

      if (response.data.success) {
        setMessages(prev => [
          ...prev,
          { role: 'assistant', content: response.data.response },
        ]);

        // Persist to knowledge graph if enabled
        if (persistHistory) {
          await persistConversation(userMessage, response.data.response);
        }
      }
    } catch (error) {
      message.error('Failed to send message');
      console.error('Send error:', error);
    } finally {
      setIsStreaming(false);
      setInputMessage('');
    }
  };

  const persistConversation = async (userMsg: any, assistantMsg: string) => {
    try {
      // Save to knowledge graph / conversation history
      await axios.post('http://localhost:3001/api/knowledge-graph/conversation', {
        conversationId,
        sessionContext: context,
        messages: [userMsg, { role: 'assistant', content: assistantMsg }],
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Failed to persist conversation:', error);
    }
  };

  const handleQuickAction = (action: QuickAction) => {
    setInputMessage(action.prompt + ' ');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearConversation = async () => {
    try {
      await axios.delete(`http://localhost:3001/api/ollama/conversation/${conversationId}`);
      setMessages([]);
      setConversationId(`conv-${context.sessionId}-${Date.now()}`);
      message.success('Conversation cleared');
    } catch (error) {
      message.error('Failed to clear conversation');
    }
  };

  const loadConversationHistory = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3001/api/ollama/conversation/${conversationId}`
      );
      if (response.data.success) {
        setMessages(response.data.history);
      }
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  };

  const quickActionsMenu = (
    <Menu
      items={QUICK_ACTIONS.map(action => ({
        key: action.key,
        icon: action.icon,
        label: action.label,
        onClick: () => handleQuickAction(action),
      }))}
    />
  );

  const renderMessage = (msg: any, index: number) => {
    const isUser = msg.role === 'user';
    const isToolCall = msg.role === 'tool';

    return (
      <List.Item key={index} style={{ padding: '12px 0' }}>
        <List.Item.Meta
          avatar={
            <Avatar
              icon={isUser ? <UserOutlined /> : isToolCall ? <ToolOutlined /> : <RobotOutlined />}
              style={{
                backgroundColor: isUser ? '#1890ff' : isToolCall ? '#52c41a' : '#722ed1',
              }}
            />
          }
          title={
            <Space>
              <Text strong>{isUser ? 'You' : isToolCall ? 'Tool Result' : 'DeepSeek'}</Text>
              {msg.tool_calls && msg.tool_calls.length > 0 && (
                <Tag color="green">
                  <ToolOutlined /> {msg.tool_calls.length} tool(s) called
                </Tag>
              )}
            </Space>
          }
          description={
            <div style={{ marginTop: 8 }}>
              <Text style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</Text>
              {msg.tool_calls && msg.tool_calls.length > 0 && (
                <div style={{ marginTop: 12 }}>
                  {msg.tool_calls.map((toolCall: any, idx: number) => (
                    <Tag key={idx} color="blue" style={{ marginTop: 4 }}>
                      <ToolOutlined /> {toolCall.function.name}
                    </Tag>
                  ))}
                </div>
              )}
            </div>
          }
        />
      </List.Item>
    );
  };

  return (
    <Card
      title={
        <Space>
          <RobotOutlined />
          <Title level={4} style={{ margin: 0 }}>
            DeepSeek AI Assistant
          </Title>
          {isConnected ? (
            <Tag color="success">
              <CheckCircleOutlined /> Connected
            </Tag>
          ) : (
            <Tag color="error">Disconnected</Tag>
          )}
        </Space>
      }
      extra={
        <Space>
          <Tooltip title="Load conversation history">
            <Button
              icon={<HistoryOutlined />}
              size="small"
              onClick={loadConversationHistory}
            />
          </Tooltip>
          <Button onClick={clearConversation} size="small">
            Clear
          </Button>
          <Dropdown overlay={quickActionsMenu} trigger={['click']}>
            <Button icon={<SettingOutlined />} size="small">
              Options
            </Button>
          </Dropdown>
        </Space>
      }
      style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
      bodyStyle={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
    >
      {/* Context Information */}
      {showContext && (
        <Alert
          message="Session Context"
          description={
            <Row gutter={[8, 8]} style={{ fontSize: '12px' }}>
              <Col span={12}>
                <Text type="secondary">Session: </Text>
                <Text code>{context.sessionId.slice(0, 12)}...</Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">Role: </Text>
                <Tag color="blue">{context.role}</Tag>
              </Col>
              {context.hierarchy && (
                <Col span={12}>
                  <Text type="secondary">Hierarchy: </Text>
                  <Text>{context.hierarchy}</Text>
                </Col>
              )}
              {context.activeCampaigns && context.activeCampaigns.length > 0 && (
                <Col span={12}>
                  <Text type="secondary">Active Campaigns: </Text>
                  <Badge count={context.activeCampaigns.length} />
                </Col>
              )}
            </Row>
          }
          type="info"
          closable
          style={{ marginBottom: 16 }}
        />
      )}

      {/* Quick Actions */}
      <div style={{ marginBottom: 16 }}>
        <Space wrap>
          {QUICK_ACTIONS.slice(0, 4).map(action => (
            <Tooltip key={action.key} title={action.description}>
              <Button
                size="small"
                icon={action.icon}
                onClick={() => handleQuickAction(action)}
              >
                {action.label}
              </Button>
            </Tooltip>
          ))}
          <Dropdown overlay={quickActionsMenu} trigger={['click']}>
            <Button size="small">
              More Actions...
            </Button>
          </Dropdown>
        </Space>
      </div>

      <Divider style={{ margin: '8px 0' }} />

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', marginBottom: 16 }}>
        <List
          dataSource={messages}
          renderItem={renderMessage}
          locale={{ emptyText: 'Start a conversation with DeepSeek...' }}
        />
        {isStreaming && streamingChunk && (
          <List.Item style={{ padding: '12px 0' }}>
            <List.Item.Meta
              avatar={<Avatar icon={<RobotOutlined />} style={{ backgroundColor: '#722ed1' }} />}
              title={
                <Space>
                  <Text strong>DeepSeek</Text>
                  <Spin size="small" />
                </Space>
              }
              description={
                <Text style={{ whiteSpace: 'pre-wrap' }}>
                  {streamingChunk}
                  <span className="streaming-cursor">▊</span>
                </Text>
              }
            />
          </List.Item>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <Space.Compact style={{ width: '100%' }}>
        <TextArea
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask DeepSeek to create workflows, mine data, generate APIs, or analyze schemas..."
          autoSize={{ minRows: 2, maxRows: 6 }}
          disabled={isStreaming || !isConnected}
        />
        <Button
          type="primary"
          icon={<SendOutlined />}
          onClick={handleSend}
          loading={isStreaming}
          disabled={!inputMessage.trim() || !isConnected}
          style={{ height: 'auto' }}
        >
          Send
        </Button>
      </Space.Compact>

      {/* Tool Calls Display */}
      {toolCalls.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <Text type="secondary">Recent tool calls: </Text>
          {toolCalls.slice(-5).map((call, idx) => (
            <Tag key={idx} color="blue" style={{ marginTop: 4 }}>
              {call.name}
            </Tag>
          ))}
        </div>
      )}

      <style>{`
        .streaming-cursor {
          animation: blink 1s infinite;
        }
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
      `}</style>
    </Card>
  );
};

export default EnhancedDeepSeekChat;
