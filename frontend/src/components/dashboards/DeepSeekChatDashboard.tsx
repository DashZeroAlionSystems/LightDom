/**
 * DeepSeek Chat Dashboard
 * AI chat interface with conversation management
 */

import React, { useState, useEffect, useRef } from 'react';
import { Card, Button, Input, List, Typography, Space, Tag, Modal, Form, Spin, Empty, message as antdMessage } from 'antd';
import {
  MessageOutlined,
  SendOutlined,
  PlusOutlined,
  DeleteOutlined,
  InboxOutlined,
  ReloadOutlined,
  UserOutlined,
  RobotOutlined,
} from '@ant-design/icons';
import { deepseekChatAPI } from '@/services/apiService';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface Conversation {
  id: string;
  title: string;
  userId?: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  archived: boolean;
  context?: any;
}

const DeepSeekChatDashboard: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [isNewConversationModalVisible, setIsNewConversationModalVisible] = useState(false);
  const [serviceStatus, setServiceStatus] = useState<any>(null);
  const [form] = Form.useForm();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadServiceStatus();
    loadConversations();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadServiceStatus = async () => {
    try {
      const response = await deepseekChatAPI.getStatus();
      if (response.success) {
        setServiceStatus(response.status);
      }
    } catch (error) {
      console.error('Failed to load service status:', error);
    }
  };

  const loadConversations = async () => {
    setLoading(true);
    try {
      const response = await deepseekChatAPI.getConversations(50, false);
      if (response.success) {
        setConversations(response.conversations || []);
      }
    } catch (error) {
      console.error('Failed to load conversations:', error);
      antdMessage.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const loadConversation = async (id: string) => {
    setLoading(true);
    try {
      const response = await deepseekChatAPI.getConversation(id);
      if (response.success) {
        setCurrentConversation(response.conversation);
        setMessages(response.conversation.messages || []);
      }
    } catch (error) {
      console.error('Failed to load conversation:', error);
      antdMessage.error('Failed to load conversation');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateConversation = async (values: any) => {
    try {
      const response = await deepseekChatAPI.createConversation({
        title: values.title || 'New Conversation',
        userId: values.userId,
        context: values.context ? JSON.parse(values.context) : undefined,
      });

      if (response.success) {
        antdMessage.success('Conversation created successfully');
        setIsNewConversationModalVisible(false);
        form.resetFields();
        await loadConversations();
        if (response.conversation) {
          loadConversation(response.conversation.id);
        }
      }
    } catch (error) {
      console.error('Failed to create conversation:', error);
      antdMessage.error('Failed to create conversation');
    }
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !currentConversation) {
      return;
    }

    const userMessage = messageInput.trim();
    setMessageInput('');
    setSending(true);

    // Optimistically add user message
    const tempUserMessage: Message = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, tempUserMessage]);

    try {
      const response = await deepseekChatAPI.sendMessage(currentConversation.id, userMessage);
      
      if (response.success) {
        // Replace temp message with actual messages from response
        setMessages(prev => {
          const withoutTemp = prev.filter(m => m.id !== tempUserMessage.id);
          return [...withoutTemp, response.userMessage, response.assistantMessage];
        });
        
        // Update conversation in list
        await loadConversations();
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      antdMessage.error('Failed to send message');
      // Remove temp message on error
      setMessages(prev => prev.filter(m => m.id !== tempUserMessage.id));
      setMessageInput(userMessage); // Restore input
    } finally {
      setSending(false);
    }
  };

  const handleDeleteConversation = async (id: string) => {
    Modal.confirm({
      title: 'Delete Conversation',
      content: 'Are you sure you want to delete this conversation? This action cannot be undone.',
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          await deepseekChatAPI.deleteConversation(id);
          antdMessage.success('Conversation deleted');
          if (currentConversation?.id === id) {
            setCurrentConversation(null);
            setMessages([]);
          }
          await loadConversations();
        } catch (error) {
          console.error('Failed to delete conversation:', error);
          antdMessage.error('Failed to delete conversation');
        }
      },
    });
  };

  const handleArchiveConversation = async (id: string) => {
    try {
      await deepseekChatAPI.archiveConversation(id);
      antdMessage.success('Conversation archived');
      if (currentConversation?.id === id) {
        setCurrentConversation(null);
        setMessages([]);
      }
      await loadConversations();
    } catch (error) {
      console.error('Failed to archive conversation:', error);
      antdMessage.error('Failed to archive conversation');
    }
  };

  return (
    <div style={{ padding: '24px', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>
          <MessageOutlined style={{ marginRight: '12px' }} />
          DeepSeek Chat
        </Title>
        <Paragraph>
          AI-powered conversations with DeepSeek models. Create conversations, send messages, and manage chat history.
        </Paragraph>
      </div>

      {serviceStatus && (
        <Card size="small" style={{ marginBottom: '16px' }}>
          <Space size="large">
            <Text>
              <strong>Status:</strong> <Tag color={serviceStatus.initialized ? 'green' : 'red'}>
                {serviceStatus.initialized ? 'Initialized' : 'Not Initialized'}
              </Tag>
            </Text>
            <Text>
              <strong>Model:</strong> {serviceStatus.model || 'N/A'}
            </Text>
            <Text>
              <strong>Conversations:</strong> {conversations.length}
            </Text>
          </Space>
        </Card>
      )}

      <div style={{ display: 'flex', gap: '16px', flex: 1, overflow: 'hidden' }}>
        {/* Conversations Sidebar */}
        <Card
          title={
            <Space>
              <MessageOutlined />
              Conversations
            </Space>
          }
          extra={
            <Space>
              <Button
                icon={<ReloadOutlined />}
                onClick={loadConversations}
                loading={loading}
                size="small"
              />
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setIsNewConversationModalVisible(true)}
                size="small"
              >
                New
              </Button>
            </Space>
          }
          style={{ width: '350px', display: 'flex', flexDirection: 'column' }}
          bodyStyle={{ flex: 1, overflow: 'auto', padding: 0 }}
        >
          {loading && conversations.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center' }}>
              <Spin />
            </div>
          ) : conversations.length === 0 ? (
            <Empty description="No conversations yet" style={{ padding: '24px' }} />
          ) : (
            <List
              dataSource={conversations}
              renderItem={(conversation) => (
                <List.Item
                  key={conversation.id}
                  onClick={() => loadConversation(conversation.id)}
                  style={{
                    cursor: 'pointer',
                    backgroundColor: currentConversation?.id === conversation.id ? '#f0f0f0' : 'transparent',
                    padding: '12px 16px',
                  }}
                  actions={[
                    <Button
                      type="text"
                      size="small"
                      icon={<InboxOutlined />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleArchiveConversation(conversation.id);
                      }}
                    />,
                    <Button
                      type="text"
                      danger
                      size="small"
                      icon={<DeleteOutlined />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteConversation(conversation.id);
                      }}
                    />,
                  ]}
                >
                  <List.Item.Meta
                    title={conversation.title}
                    description={
                      <Space direction="vertical" size="small">
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          {conversation.messageCount || 0} messages
                        </Text>
                        <Text type="secondary" style={{ fontSize: '11px' }}>
                          {new Date(conversation.updatedAt).toLocaleString()}
                        </Text>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          )}
        </Card>

        {/* Chat Area */}
        <Card
          title={
            currentConversation ? (
              <Space>
                <RobotOutlined />
                {currentConversation.title}
              </Space>
            ) : (
              'Select a conversation'
            )
          }
          style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
          bodyStyle={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
        >
          {!currentConversation ? (
            <Empty
              description="Select a conversation from the sidebar to start chatting"
              style={{ margin: 'auto' }}
            />
          ) : (
            <>
              {/* Messages */}
              <div style={{ flex: 1, overflow: 'auto', padding: '16px', marginBottom: '16px' }}>
                {messages.length === 0 ? (
                  <Empty description="No messages yet. Start the conversation!" />
                ) : (
                  <>
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        style={{
                          marginBottom: '16px',
                          display: 'flex',
                          justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                        }}
                      >
                        <div
                          style={{
                            maxWidth: '70%',
                            padding: '12px 16px',
                            borderRadius: '8px',
                            backgroundColor: msg.role === 'user' ? '#1890ff' : '#f0f0f0',
                            color: msg.role === 'user' ? 'white' : 'black',
                          }}
                        >
                          <Space direction="vertical" size="small" style={{ width: '100%' }}>
                            <Space>
                              {msg.role === 'user' ? <UserOutlined /> : <RobotOutlined />}
                              <Text strong style={{ color: msg.role === 'user' ? 'white' : 'inherit' }}>
                                {msg.role === 'user' ? 'You' : 'DeepSeek'}
                              </Text>
                            </Space>
                            <Paragraph
                              style={{
                                margin: 0,
                                whiteSpace: 'pre-wrap',
                                color: msg.role === 'user' ? 'white' : 'inherit',
                              }}
                            >
                              {msg.content}
                            </Paragraph>
                            <Text
                              type="secondary"
                              style={{
                                fontSize: '11px',
                                color: msg.role === 'user' ? 'rgba(255,255,255,0.7)' : undefined,
                              }}
                            >
                              {new Date(msg.timestamp).toLocaleTimeString()}
                            </Text>
                          </Space>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Message Input */}
              <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '16px' }}>
                <Space.Compact style={{ width: '100%' }}>
                  <Input
                    placeholder="Type your message..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onPressEnter={handleSendMessage}
                    disabled={sending}
                    style={{ flex: 1 }}
                  />
                  <Button
                    type="primary"
                    icon={<SendOutlined />}
                    onClick={handleSendMessage}
                    loading={sending}
                    disabled={!messageInput.trim()}
                  >
                    Send
                  </Button>
                </Space.Compact>
              </div>
            </>
          )}
        </Card>
      </div>

      {/* New Conversation Modal */}
      <Modal
        title="Create New Conversation"
        open={isNewConversationModalVisible}
        onCancel={() => {
          setIsNewConversationModalVisible(false);
          form.resetFields();
        }}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateConversation}>
          <Form.Item
            label="Title"
            name="title"
            rules={[{ required: true, message: 'Please enter a title' }]}
          >
            <Input placeholder="Enter conversation title" />
          </Form.Item>

          <Form.Item
            label="User ID (Optional)"
            name="userId"
          >
            <Input placeholder="Enter user ID if applicable" />
          </Form.Item>

          <Form.Item
            label="Context (Optional JSON)"
            name="context"
          >
            <TextArea
              rows={4}
              placeholder='{"key": "value"}'
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Create Conversation
              </Button>
              <Button onClick={() => {
                setIsNewConversationModalVisible(false);
                form.resetFields();
              }}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DeepSeekChatDashboard;
