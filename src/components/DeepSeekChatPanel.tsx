import {
  CodeOutlined,
  HistoryOutlined,
  ReloadOutlined,
  RobotOutlined,
  SendOutlined,
  StopOutlined,
  UploadOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Divider,
  Input,
  List,
  message,
  Row,
  Space,
  Spin,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import React, { useEffect, useMemo, useRef, useState } from 'react';

const { Text, Paragraph } = Typography;
const { TextArea } = Input;

type ChatRole = 'user' | 'assistant' | 'system';

interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  timestamp: string;
}

interface ContextDocument {
  documentId?: string;
  content: string;
  score?: number;
  metadata?: Record<string, unknown>;
}

interface RagStatusProvider {
  status?: string;
  endpoint?: string;
  model?: string;
  availableModels?: string[];
  configured?: boolean;
}

interface RagStatus {
  status: 'ok' | 'warn' | 'error';
  message: string;
  endpoint?: string;
  model?: string;
  providers: {
    ollama?: RagStatusProvider;
    deepseek?: RagStatusProvider;
  };
}

const toPayloadMessages = (messages: ChatMessage[]): Array<{ role: ChatRole; content: string }> =>
  messages.map(({ role, content }) => ({ role, content }));

export const DeepSeekChatPanel: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [indexing, setIndexing] = useState(false);
  const [ragStatus, setRagStatus] = useState<RagStatus | null>(null);
  const [contextDocs, setContextDocs] = useState<ContextDocument[]>([]);
  const [lastError, setLastError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamingControllerRef = useRef<AbortController | null>(null);
  const sseBufferRef = useRef('');

  useEffect(() => {
    loadStatus();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadStatus = async () => {
    try {
      const response = await fetch('/api/rag/health');
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error || json.message || 'Failed to load RAG status');
      }
      setRagStatus(json);
    } catch (error: any) {
      setRagStatus(null);
      message.error(error.message || 'Unable to load RAG health status');
    }
  };

  const appendAssistantContent = (assistantId: string, chunk: string) => {
    if (!chunk) return;
    setMessages(prev =>
      prev.map(msg => (msg.id === assistantId ? { ...msg, content: msg.content + chunk } : msg))
    );
  };

  const handleSsePayload = (payload: string, assistantId: string) => {
    if (!payload) return;

    if (payload === '[DONE]') {
      setIsStreaming(false);
      streamingControllerRef.current = null;
      return;
    }

    try {
      const event = JSON.parse(payload);

      if (event.type === 'context' && Array.isArray(event.documents)) {
        setContextDocs(event.documents);
        return;
      }

      if (event.error) {
        const messageText =
          typeof event.error === 'string'
            ? event.error
            : event.details || 'RAG provider returned an error';
        setLastError(messageText);
        message.error(messageText);
        setIsStreaming(false);
        streamingControllerRef.current = null;
        return;
      }

      if (typeof event.token === 'string') {
        appendAssistantContent(assistantId, event.token);
        return;
      }

      if (event.done) {
        setIsStreaming(false);
        streamingControllerRef.current = null;
        return;
      }

      if (event.result && typeof event.result === 'string') {
        appendAssistantContent(assistantId, event.result);
        return;
      }

      if (event.info && typeof event.info === 'string') {
        appendAssistantContent(assistantId, `\n${event.info}`);
        return;
      }
    } catch {
      appendAssistantContent(assistantId, payload);
    }
  };

  const handleSend = async () => {
    if (!inputValue.trim() || isStreaming) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date().toISOString(),
    };

    const requestMessages = toPayloadMessages([...messages, userMessage]);

    const assistantId = `assistant-${Date.now()}`;
    const placeholder: ChatMessage = {
      id: assistantId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage, placeholder]);
    setInputValue('');
    setIsStreaming(true);
    setLastError(null);

    const controller = new AbortController();
    streamingControllerRef.current = controller;
    sseBufferRef.current = '';

    try {
      const response = await fetch('/api/rag/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: requestMessages,
          enableTools: true,
        }),
        signal: controller.signal,
      });

      if (!response.ok || !response.body) {
        const text = await response.text();
        throw new Error(text || 'Failed to start RAG stream');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        if (!chunk) continue;

        sseBufferRef.current += chunk;

        let separatorIndex = sseBufferRef.current.indexOf('\n\n');
        while (separatorIndex >= 0) {
          const rawEvent = sseBufferRef.current.slice(0, separatorIndex).trim();
          sseBufferRef.current = sseBufferRef.current.slice(separatorIndex + 2);

          if (rawEvent) {
            const dataLines = rawEvent
              .split('\n')
              .filter(line => line.startsWith('data:'))
              .map(line => line.slice(5).trim())
              .filter(Boolean);

            for (const data of dataLines) {
              handleSsePayload(data, assistantId);
            }
          }

          separatorIndex = sseBufferRef.current.indexOf('\n\n');
        }
      }

      setIsStreaming(false);
      streamingControllerRef.current = null;
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        const messageText = error.message || 'RAG streaming failed';
        setLastError(messageText);
        appendAssistantContent(assistantId, `\n\n[Error] ${messageText}`);
        message.error(messageText);
      }
      setIsStreaming(false);
      streamingControllerRef.current = null;
    }
  };

  const handleStopStreaming = () => {
    if (streamingControllerRef.current) {
      streamingControllerRef.current.abort();
      streamingControllerRef.current = null;
      setIsStreaming(false);
    }
  };

  const handleUploadTrigger = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = async event => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setLastError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', file.name);

      const response = await fetch('/api/rag/ingest/upload', {
        method: 'POST',
        body: formData,
      });
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error || 'Document ingestion failed');
      }
      message.success(`Ingested ${file.name}`);
    } catch (error: any) {
      const messageText = error.message || 'Failed to ingest document';
      setLastError(messageText);
      message.error(messageText);
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const handleIndexCodebase = async () => {
    setIndexing(true);
    setLastError(null);
    try {
      const response = await fetch('/api/rag/ingest/codebase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error || 'Codebase indexing failed');
      }
      const documentsProcessed = json.documentsProcessed ?? json.filesProcessed ?? 0;
      const chunksProcessed = json.chunksProcessed ?? json.totalChunks ?? 0;
      message.success(`Indexed ${documentsProcessed} files (${chunksProcessed} chunks)`);
    } catch (error: any) {
      const messageText = error.message || 'Failed to index codebase';
      setLastError(messageText);
      message.error(messageText);
    } finally {
      setIndexing(false);
    }
  };

  const handleReset = () => {
    setMessages([]);
    setContextDocs([]);
    setLastError(null);
    setInputValue('');
  };

  const quickActions = useMemo(
    () => [
      {
        key: 'upload',
        label: 'Upload Document',
        icon: <UploadOutlined />,
        onClick: handleUploadTrigger,
        loading: uploading,
      },
      {
        key: 'index',
        label: 'Index Codebase',
        icon: <CodeOutlined />,
        onClick: handleIndexCodebase,
        loading: indexing,
      },
      {
        key: 'reset',
        label: 'Reset Thread',
        icon: <HistoryOutlined />,
        onClick: handleReset,
        loading: false,
      },
    ],
    [uploading, indexing]
  );

  const statusTag = useMemo(() => {
    if (!ragStatus) {
      return <Tag color='default'>Status Unknown</Tag>;
    }
    if (ragStatus.status === 'ok') {
      return <Tag color='green'>Ready</Tag>;
    }
    if (ragStatus.status === 'warn') {
      return <Tag color='gold'>Degraded</Tag>;
    }
    return <Tag color='red'>Unavailable</Tag>;
  }, [ragStatus]);

  const providerSummary = useMemo(() => {
    if (!ragStatus) return null;
    const ollama = ragStatus.providers?.ollama;
    const deepseek = ragStatus.providers?.deepseek;
    return (
      <Space size='small'>
        {ollama?.status && (
          <Tooltip
            title={`Endpoint: ${ollama.endpoint || 'local'}\nModel: ${ollama.model || 'n/a'}`}
          >
            <Tag
              color={
                ollama.status === 'ready'
                  ? 'green'
                  : ollama.status === 'unreachable'
                    ? 'red'
                    : 'blue'
              }
            >
              Ollama: {ollama.status}
            </Tag>
          </Tooltip>
        )}
        {deepseek?.status && (
          <Tag color={deepseek.status === 'configured' ? 'blue' : 'default'}>
            DeepSeek: {deepseek.status}
          </Tag>
        )}
      </Space>
    );
  }, [ragStatus]);

  return (
    <div style={{ padding: 24 }}>
      <Card
        title={
          <Space>
            <RobotOutlined />
            <Text strong>RAG Assistant</Text>
            {statusTag}
          </Space>
        }
        extra={
          <Space>
            {providerSummary}
            <Button icon={<ReloadOutlined />} onClick={loadStatus} size='small'>
              Refresh
            </Button>
            {isStreaming && (
              <Button icon={<StopOutlined />} danger size='small' onClick={handleStopStreaming}>
                Stop
              </Button>
            )}
          </Space>
        }
        bodyStyle={{ display: 'flex', flexDirection: 'column', gap: 16 }}
      >
        <input
          type='file'
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />

        <Space wrap>
          {quickActions.map(action => (
            <Button
              key={action.key}
              icon={action.icon}
              onClick={action.onClick}
              loading={action.loading}
            >
              {action.label}
            </Button>
          ))}
        </Space>

        {lastError && (
          <Alert type='error' message={lastError} closable onClose={() => setLastError(null)} />
        )}

        {contextDocs.length > 0 && (
          <Card size='small' title='Retrieved Context' bordered>
            <List
              size='small'
              dataSource={contextDocs}
              renderItem={(doc, index) => (
                <List.Item key={doc.documentId || `doc-${index}`}>
                  <List.Item.Meta
                    title={
                      <Space>
                        <Text strong>{doc.documentId || 'Document'}</Text>
                        {typeof doc.score === 'number' && (
                          <Badge count={`score ${doc.score.toFixed(2)}`} color='blue' />
                        )}
                      </Space>
                    }
                    description={
                      <Paragraph
                        style={{ whiteSpace: 'pre-wrap', marginBottom: 0 }}
                        ellipsis={{ rows: 4 }}
                      >
                        {doc.content}
                      </Paragraph>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        )}

        <Card
          size='small'
          bordered
          bodyStyle={{ height: '50vh', display: 'flex', flexDirection: 'column' }}
        >
          <div style={{ flex: 1, overflowY: 'auto', paddingRight: 8 }}>
            {messages.length === 0 ? (
              <div style={{ textAlign: 'center', marginTop: 40 }}>
                <Text type='secondary'>
                  Ask a question to start a conversation. Documents you ingest will be retrieved
                  automatically.
                </Text>
              </div>
            ) : (
              <List
                dataSource={messages}
                renderItem={msg => (
                  <List.Item key={msg.id} style={{ border: 'none', padding: '12px 0' }}>
                    <List.Item.Meta
                      avatar={msg.role === 'user' ? <UserOutlined /> : <RobotOutlined />}
                      title={
                        <Space size='small'>
                          <Text strong>{msg.role === 'user' ? 'You' : 'Assistant'}</Text>
                          <Text type='secondary' style={{ fontSize: 12 }}>
                            {new Date(msg.timestamp).toLocaleTimeString()}
                          </Text>
                        </Space>
                      }
                      description={
                        <Paragraph style={{ whiteSpace: 'pre-wrap', marginBottom: 0 }}>
                          {msg.content ||
                            (isStreaming && msg.role === 'assistant' ? (
                              <Spin size='small' />
                            ) : null)}
                        </Paragraph>
                      }
                    />
                  </List.Item>
                )}
              />
            )}
            <div ref={messagesEndRef} />
          </div>

          <Divider style={{ margin: '12px 0' }} />

          <Space.Compact style={{ width: '100%' }}>
            <TextArea
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onPressEnter={event => {
                if (!event.shiftKey) {
                  event.preventDefault();
                  handleSend();
                }
              }}
              placeholder='Ask about the codebase, ingested documents, or request actions...'
              autoSize={{ minRows: 2, maxRows: 6 }}
              disabled={isStreaming}
            />
            <Button
              type='primary'
              icon={<SendOutlined />}
              onClick={handleSend}
              disabled={!inputValue.trim() || isStreaming}
            >
              Send
            </Button>
          </Space.Compact>
        </Card>

        <Row gutter={16}>
          <Col span={12}>
            <Card size='small' title='Tips'>
              <List size='small'>
                <List.Item>Upload design docs or specs to ground answers.</List.Item>
                <List.Item>Run "Index Codebase" after major changes.</List.Item>
                <List.Item>Ask the assistant to cite document IDs from context.</List.Item>
              </List>
            </Card>
          </Col>
          <Col span={12}>
            <Card size='small' title='Provider Status'>
              <Space direction='vertical'>
                <Text type='secondary'>
                  Endpoint:{' '}
                  {ragStatus?.endpoint || ragStatus?.providers?.ollama?.endpoint || 'local'}
                </Text>
                <Text type='secondary'>
                  Model:{' '}
                  {ragStatus?.model || ragStatus?.providers?.ollama?.model || 'deepseek-r1:latest'}
                </Text>
              </Space>
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default DeepSeekChatPanel;
