/**
 * DeepSeek Chat Component
 * Conversational interface for interacting with DeepSeek AI via Ollama
 * Supports bidirectional streaming, tool calling, and workflow creation
 */

import React, { useState, useEffect, useRef } from 'react';
import { Input, Button, Card, List, Avatar, Tag, Spin, message, Space, Typography } from 'antd';
import { SendOutlined, RobotOutlined, UserOutlined, ToolOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useOllamaChat } from '../hooks/useOllamaChat';

const { TextArea } = Input;
const { Text, Title } = Typography;

export interface DeepSeekChatProps {
  onWorkflowCreated?: (workflow: any) => void;
  onDataMiningStarted?: (campaign: any) => void;
  streamingEnabled?: boolean;
  toolsEnabled?: boolean;
}

export const DeepSeekChat: React.FC<DeepSeekChatProps> = ({
  onWorkflowCreated,
  onDataMiningStarted,
  streamingEnabled = true,
  toolsEnabled = true,
}) => {
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    isStreaming,
    isConnected,
    streamingChunk,
    toolCalls,
    sendMessage,
    clearConversation,
  } = useOllamaChat({
    streamingEnabled,
    toolsEnabled,
    onWorkflowCreated,
    onDataMiningStarted,
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingChunk]);

  const handleSend = async () => {
    if (!inputMessage.trim()) return;

    try {
      await sendMessage(inputMessage);
      setInputMessage('');
    } catch (error) {
      message.error('Failed to send message');
      console.error('Send error:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

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
            DeepSeek AI Chat
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
        <Button onClick={clearConversation} size="small">
          Clear Chat
        </Button>
      }
      style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
      bodyStyle={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
    >
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

      <Space.Compact style={{ width: '100%' }}>
        <TextArea
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask DeepSeek to create workflows, analyze data, or mine insights..."
          autoSize={{ minRows: 2, maxRows: 6 }}
          disabled={isStreaming}
        />
        <Button
          type="primary"
          icon={<SendOutlined />}
          onClick={handleSend}
          loading={isStreaming}
          disabled={!inputMessage.trim() || !isConnected}
        >
          Send
        </Button>
      </Space.Compact>

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

export default DeepSeekChat;
