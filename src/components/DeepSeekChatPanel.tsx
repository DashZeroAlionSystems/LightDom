import React, { useState, useEffect, useRef } from 'react';
import {
  Card,
  Button,
  Input,
  List,
  Avatar,
  Space,
  Typography,
  Spin,
  Empty,
  Divider,
  Badge,
  Tooltip,
  Modal,
  Form,
  message,
} from 'antd';
import {
  SendOutlined,
  UserOutlined,
  RobotOutlined,
  PlusOutlined,
  DeleteOutlined,
  HistoryOutlined,
  ThunderboltOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import axios from 'axios';

const { TextArea } = Input;
const { Text, Paragraph } = Typography;

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  message_count?: number;
  last_message?: string;
}

export const DeepSeekChatPanel: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [status, setStatus] = useState<any>(null);
  const [form] = Form.useForm();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadConversations();
    loadStatus();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversations = async () => {
    try {
      const response = await axios.get('/api/chat/conversations');
      if (response.data.success) {
        setConversations(response.data.conversations);
        
        // Auto-select first conversation if none selected
        if (!currentConversation && response.data.conversations.length > 0) {
          loadConversation(response.data.conversations[0].id);
        }
      }
    } catch (error) {
      console.error('Failed to load conversations:', error);
    }
  };

  const loadStatus = async () => {
    try {
      const response = await axios.get('/api/chat/status');
      if (response.data.success) {
        setStatus(response.data.status);
      }
    } catch (error) {
      console.error('Failed to load status:', error);
    }
  };

  const loadConversation = async (conversationId: string) => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/chat/conversations/${conversationId}`);
      if (response.data.success) {
        setCurrentConversation(response.data.conversation);
        setMessages(response.data.conversation.messages || []);
      }
    } catch (error) {
      console.error('Failed to load conversation:', error);
      message.error('Failed to load conversation');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateConversation = async (values: any) => {
    setLoading(true);
    try {
      const response = await axios.post('/api/chat/conversations', values);
      if (response.data.success) {
        message.success('Conversation created');
        setCreateModalVisible(false);
        form.resetFields();
        loadConversations();
        loadConversation(response.data.conversation.id);
      }
    } catch (error: any) {
      message.error(error.response?.data?.error || 'Failed to create conversation');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !currentConversation) return;

    setSending(true);
    const userMessage = inputValue.trim();
    setInputValue('');

    try {
      const response = await axios.post(
        `/api/chat/conversations/${currentConversation.id}/messages`,
        { message: userMessage }
      );

      if (response.data.success) {
        setMessages([...messages, response.data.userMessage, response.data.aiMessage]);
        loadConversations(); // Refresh conversation list to update last message
      }
    } catch (error: any) {
      message.error(error.response?.data?.error || 'Failed to send message');
      setInputValue(userMessage); // Restore message on error
    } finally {
      setSending(false);
    }
  };

  const handleDeleteConversation = async (conversationId: string) => {
    Modal.confirm({
      title: 'Delete Conversation',
      content: 'Are you sure you want to delete this conversation?',
      onOk: async () => {
        try {
          const response = await axios.delete(`/api/chat/conversations/${conversationId}`);
          if (response.data.success) {
            message.success('Conversation deleted');
            if (currentConversation?.id === conversationId) {
              setCurrentConversation(null);
              setMessages([]);
            }
            loadConversations();
          }
        } catch (error: any) {
          message.error(error.response?.data?.error || 'Failed to delete conversation');
        }
      },
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <Card
        title={
          <Space>
            <RobotOutlined />
            <span>DeepSeek Chat</span>
            {status?.ollamaConnected ? (
              <Badge status="success" text="Connected" />
            ) : (
              <Badge status="error" text="Disconnected" />
            )}
          </Space>
        }
        extra={
          <Space>
            <Tooltip title="Status">
              <Text type="secondary">
                Model: {status?.model || 'N/A'}
              </Text>
            </Tooltip>
            <Button icon={<ReloadOutlined />} onClick={loadStatus} size="small">
              Refresh
            </Button>
          </Space>
        }
      >
        <div style={{ display: 'flex', height: 'calc(100vh - 250px)' }}>
          {/* Conversations Sidebar */}
          <div
            style={{
              width: 280,
              borderRight: '1px solid #f0f0f0',
              paddingRight: 16,
              overflowY: 'auto',
            }}
          >
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setCreateModalVisible(true)}
              block
              style={{ marginBottom: 16 }}
            >
              New Conversation
            </Button>

            <List
              size="small"
              dataSource={conversations}
              renderItem={(conv) => (
                <List.Item
                  style={{
                    cursor: 'pointer',
                    backgroundColor:
                      currentConversation?.id === conv.id ? '#f0f5ff' : 'transparent',
                    padding: '8px 12px',
                    borderRadius: 4,
                    marginBottom: 4,
                  }}
                  onClick={() => loadConversation(conv.id)}
                  actions={[
                    <Tooltip title="Delete">
                      <Button
                        type="text"
                        size="small"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteConversation(conv.id);
                        }}
                      />
                    </Tooltip>,
                  ]}
                >
                  <List.Item.Meta
                    avatar={<HistoryOutlined />}
                    title={conv.title || 'Untitled'}
                    description={
                      <Text type="secondary" ellipsis style={{ fontSize: 12 }}>
                        {conv.message_count || 0} messages
                      </Text>
                    }
                  />
                </List.Item>
              )}
            />
          </div>

          {/* Chat Area */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', paddingLeft: 16 }}>
            {currentConversation ? (
              <>
                <div
                  style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '16px 0',
                    marginBottom: 16,
                  }}
                >
                  {loading ? (
                    <div style={{ textAlign: 'center', padding: 50 }}>
                      <Spin size="large" />
                    </div>
                  ) : messages.length === 0 ? (
                    <Empty description="No messages yet. Start the conversation!" />
                  ) : (
                    <List
                      dataSource={messages}
                      renderItem={(msg) => (
                        <List.Item
                          style={{
                            border: 'none',
                            padding: '8px 0',
                            alignItems: 'flex-start',
                          }}
                        >
                          <List.Item.Meta
                            avatar={
                              <Avatar
                                icon={msg.role === 'user' ? <UserOutlined /> : <RobotOutlined />}
                                style={{
                                  backgroundColor: msg.role === 'user' ? '#1890ff' : '#52c41a',
                                }}
                              />
                            }
                            title={
                              <Space>
                                <Text strong>{msg.role === 'user' ? 'You' : 'DeepSeek'}</Text>
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                  {new Date(msg.created_at).toLocaleTimeString()}
                                </Text>
                              </Space>
                            }
                            description={
                              <Paragraph
                                style={{
                                  whiteSpace: 'pre-wrap',
                                  marginBottom: 0,
                                  marginTop: 8,
                                }}
                              >
                                {msg.content}
                              </Paragraph>
                            }
                          />
                        </List.Item>
                      )}
                    />
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 16 }}>
                  <Space.Compact style={{ width: '100%' }}>
                    <TextArea
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your message... (Shift+Enter for new line)"
                      autoSize={{ minRows: 1, maxRows: 6 }}
                      disabled={sending}
                    />
                    <Button
                      type="primary"
                      icon={<SendOutlined />}
                      onClick={handleSendMessage}
                      loading={sending}
                      disabled={!inputValue.trim()}
                    >
                      Send
                    </Button>
                  </Space.Compact>
                </div>
              </>
            ) : (
              <Empty
                description="Select a conversation or create a new one to start chatting"
                style={{ marginTop: 100 }}
              />
            )}
          </div>
        </div>
      </Card>

      <Modal
        title="Create New Conversation"
        open={createModalVisible}
        onCancel={() => {
          setCreateModalVisible(false);
          form.resetFields();
        }}
        footer={null}
      >
        <Form form={form} onFinish={handleCreateConversation} layout="vertical">
          <Form.Item
            name="title"
            label="Conversation Title"
            rules={[{ required: true, message: 'Please enter a title' }]}
          >
            <Input placeholder="e.g., Design System Discussion" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                Create
              </Button>
              <Button onClick={() => setCreateModalVisible(false)}>Cancel</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DeepSeekChatPanel;
