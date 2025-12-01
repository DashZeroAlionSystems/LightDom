/**
 * DeepSeek Campaign Chat Component
 * 
 * Real-time chat interface for interacting with DeepSeek AI to manage SEO campaigns.
 * Supports streaming responses, campaign context, and command execution.
 */

import React, { useState, useEffect, useRef } from 'react';
import { Input, Button, Card, List, Tag, Spin, message, Tooltip, Space } from 'antd';
import { SendOutlined, RobotOutlined, UserOutlined, ThunderboltOutlined, DatabaseOutlined } from '@ant-design/icons';
import { ollamaService } from '../services/ollama-service';

const { TextArea } = Input;

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    campaignId?: string;
    action?: string;
    result?: any;
  };
}

interface CampaignContext {
  campaignId?: string;
  campaignName?: string;
  status?: string;
  activeWorkflows?: string[];
}

export const DeepSeekCampaignChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [campaignContext, setCampaignContext] = useState<CampaignContext>({});
  const [ollamaAvailable, setOllamaAvailable] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    checkOllamaHealth();
    initializeChat();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const checkOllamaHealth = async () => {
    try {
      const isHealthy = await ollamaService.checkServiceHealth();
      setOllamaAvailable(isHealthy);
      if (!isHealthy) {
        message.warning('Ollama service not available. Please start it with: ollama serve');
      }
    } catch (error) {
      console.error('Health check failed:', error);
      setOllamaAvailable(false);
    }
  };

  const initializeChat = () => {
    const welcomeMessage: Message = {
      id: Date.now().toString(),
      role: 'system',
      content: `Welcome to DeepSeek Campaign Manager! 🚀

I can help you with:
• Creating and managing SEO campaigns
• Analyzing market data and blockchain anomalies
• Building automated workflows
• Optimizing campaign performance
• Mining valuable insights from data

How can I assist you today?`,
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Build context-aware prompt
      const contextPrompt = buildContextPrompt(input);
      
      // Get response from DeepSeek via Ollama
      const response = await ollamaService.generate({
        prompt: contextPrompt,
        model: 'deepseek-r1',
        temperature: 0.7,
      });

      // Parse response for actions
      const { content, actions } = parseResponse(response);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content,
        timestamp: new Date(),
        metadata: {
          campaignId: campaignContext.campaignId,
          action: actions?.[0],
        },
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Execute any detected actions
      if (actions && actions.length > 0) {
        await executeActions(actions);
      }
    } catch (error) {
      console.error('Chat error:', error);
      message.error('Failed to get response from DeepSeek');
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'system',
        content: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const buildContextPrompt = (userInput: string): string => {
    const contextParts = [
      'You are DeepSeek, an AI campaign manager specializing in SEO and data mining.',
      '',
      'Current Context:',
    ];

    if (campaignContext.campaignId) {
      contextParts.push(`Campaign ID: ${campaignContext.campaignId}`);
    }
    if (campaignContext.campaignName) {
      contextParts.push(`Campaign Name: ${campaignContext.campaignName}`);
    }
    if (campaignContext.status) {
      contextParts.push(`Status: ${campaignContext.status}`);
    }
    if (campaignContext.activeWorkflows && campaignContext.activeWorkflows.length > 0) {
      contextParts.push(`Active Workflows: ${campaignContext.activeWorkflows.join(', ')}`);
    }

    contextParts.push('');
    contextParts.push('Available Commands:');
    contextParts.push('- CREATE_CAMPAIGN: Create a new SEO campaign');
    contextParts.push('- ANALYZE_DATA: Analyze market or blockchain data');
    contextParts.push('- BUILD_WORKFLOW: Create automated workflow');
    contextParts.push('- OPTIMIZE: Optimize campaign settings');
    contextParts.push('- MINE_INSIGHTS: Extract valuable patterns');
    contextParts.push('');
    contextParts.push(`User: ${userInput}`);
    contextParts.push('');
    contextParts.push('Respond naturally and include action tags like [ACTION:CREATE_CAMPAIGN] if needed.');

    return contextParts.join('\n');
  };

  const parseResponse = (response: string): { content: string; actions: string[] } => {
    const actionRegex = /\[ACTION:(\w+)\]/g;
    const actions: string[] = [];
    let match;

    while ((match = actionRegex.exec(response)) !== null) {
      actions.push(match[1]);
    }

    // Remove action tags from display content
    const content = response.replace(actionRegex, '').trim();

    return { content, actions };
  };

  const executeActions = async (actions: string[]) => {
    for (const action of actions) {
      try {
        switch (action) {
          case 'CREATE_CAMPAIGN':
            message.info('Creating campaign...');
            // API call to create campaign
            break;
          case 'ANALYZE_DATA':
            message.info('Starting data analysis...');
            // API call to start analysis
            break;
          case 'BUILD_WORKFLOW':
            message.info('Building workflow...');
            // API call to create workflow
            break;
          case 'OPTIMIZE':
            message.info('Optimizing campaign...');
            // API call to optimize
            break;
          case 'MINE_INSIGHTS':
            message.info('Mining insights...');
            // API call to mine data
            break;
        }
      } catch (error) {
        console.error(`Action ${action} failed:`, error);
      }
    }
  };

  const handleQuickAction = async (action: string) => {
    const quickPrompts: Record<string, string> = {
      analyze: 'Analyze current campaign performance and suggest improvements',
      workflow: 'Create a new automated workflow for data collection',
      optimize: 'Review and optimize campaign settings',
      insights: 'Mine insights from recent data',
    };

    setInput(quickPrompts[action] || action);
    // Auto-send after a brief delay
    setTimeout(handleSendMessage, 100);
  };

  return (
    <Card
      title={
        <Space>
          <RobotOutlined />
          <span>DeepSeek Campaign Manager</span>
          {!ollamaAvailable && (
            <Tag color="red">Ollama Offline</Tag>
          )}
          {ollamaAvailable && (
            <Tag color="green">Connected</Tag>
          )}
        </Space>
      }
      style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
      bodyStyle={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
    >
      {/* Campaign Context Display */}
      {campaignContext.campaignId && (
        <div style={{ marginBottom: 16, padding: 12, background: '#f0f2f5', borderRadius: 8 }}>
          <Space>
            <Tag color="blue">{campaignContext.campaignName || 'Campaign'}</Tag>
            <Tag>{campaignContext.status || 'Active'}</Tag>
            {campaignContext.activeWorkflows && campaignContext.activeWorkflows.length > 0 && (
              <Tag color="purple">{campaignContext.activeWorkflows.length} Workflows</Tag>
            )}
          </Space>
        </div>
      )}

      {/* Messages Area */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          marginBottom: 16,
          padding: 16,
          background: '#fafafa',
          borderRadius: 8,
        }}
      >
        <List
          dataSource={messages}
          renderItem={(msg) => (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  maxWidth: '70%',
                  padding: '12px 16px',
                  borderRadius: 12,
                  background: msg.role === 'user' ? '#1890ff' : msg.role === 'system' ? '#f0f2f5' : '#fff',
                  color: msg.role === 'user' ? '#fff' : '#000',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
                  {msg.role === 'user' ? <UserOutlined /> : <RobotOutlined />}
                  <span style={{ marginLeft: 8, fontSize: 12, opacity: 0.7 }}>
                    {msg.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>
                {msg.metadata?.action && (
                  <Tag color="green" style={{ marginTop: 8 }}>
                    Action: {msg.metadata.action}
                  </Tag>
                )}
              </div>
            </div>
          )}
        />
        <div ref={messagesEndRef} />
        {loading && (
          <div style={{ textAlign: 'center', padding: 16 }}>
            <Spin tip="DeepSeek is thinking..." />
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <Space style={{ marginBottom: 12 }}>
        <Tooltip title="Analyze campaign">
          <Button
            icon={<ThunderboltOutlined />}
            onClick={() => handleQuickAction('analyze')}
            disabled={loading}
          >
            Analyze
          </Button>
        </Tooltip>
        <Tooltip title="Create workflow">
          <Button
            icon={<DatabaseOutlined />}
            onClick={() => handleQuickAction('workflow')}
            disabled={loading}
          >
            Workflow
          </Button>
        </Tooltip>
        <Tooltip title="Optimize settings">
          <Button onClick={() => handleQuickAction('optimize')} disabled={loading}>
            Optimize
          </Button>
        </Tooltip>
        <Tooltip title="Mine insights">
          <Button onClick={() => handleQuickAction('insights')} disabled={loading}>
            Insights
          </Button>
        </Tooltip>
      </Space>

      {/* Input Area */}
      <div style={{ display: 'flex', gap: 8 }}>
        <TextArea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onPressEnter={(e) => {
            if (!e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          placeholder="Ask DeepSeek about campaigns, workflows, or data analysis..."
          autoSize={{ minRows: 1, maxRows: 4 }}
          disabled={loading || !ollamaAvailable}
        />
        <Button
          type="primary"
          icon={<SendOutlined />}
          onClick={handleSendMessage}
          loading={loading}
          disabled={!input.trim() || !ollamaAvailable}
        >
          Send
        </Button>
      </div>
    </Card>
  );
};
