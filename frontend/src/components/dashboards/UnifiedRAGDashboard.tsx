/**
 * Unified RAG Dashboard
 * 
 * Comprehensive dashboard for the Unified RAG system providing:
 * - Chat interface with streaming
 * - Document indexing (text, code, images, PDFs, DOCX, PPTX)
 * - Hybrid search (semantic + keyword)
 * - Model management
 * - Health monitoring
 * - Agent execution
 */

import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Tabs, 
  Button, 
  Input, 
  Select, 
  Table, 
  Tag, 
  Upload, 
  message, 
  Space, 
  Statistic, 
  Row, 
  Col,
  Spin,
  Alert,
  Divider,
  Form,
  Switch
} from 'antd';
import {
  MessageOutlined,
  FileAddOutlined,
  SearchOutlined,
  SettingOutlined,
  DashboardOutlined,
  UploadOutlined,
  CodeOutlined,
  FileImageOutlined,
  DatabaseOutlined,
  ThunderboltOutlined
} from '@ant-design/icons';
import { unifiedRAGAPI } from '@/services/apiService';

const { TabPane } = Tabs;
const { TextArea } = Input;
const { Option } = Select;

const UnifiedRAGDashboard: React.FC = () => {
  // State
  const [loading, setLoading] = useState(false);
  const [health, setHealth] = useState<any>(null);
  const [config, setConfig] = useState<any>(null);
  const [models, setModels] = useState<any[]>([]);
  const [conversations, setConversations] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  
  // Chat state
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatStreaming, setChatStreaming] = useState(false);
  
  // Index state
  const [indexType, setIndexType] = useState<'text' | 'file' | 'codebase' | 'image'>('text');
  const [indexContent, setIndexContent] = useState('');
  const [indexMetadata, setIndexMetadata] = useState('{}');
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'semantic' | 'hybrid'>('hybrid');
  const [searchLimit, setSearchLimit] = useState(10);

  // Load initial data
  useEffect(() => {
    loadHealth();
    loadConfig();
    loadModels();
  }, []);

  const loadHealth = async () => {
    try {
      const data = await unifiedRAGAPI.getHealth();
      setHealth(data);
    } catch (error) {
      console.error('Failed to load health:', error);
    }
  };

  const loadConfig = async () => {
    try {
      const data = await unifiedRAGAPI.getConfig();
      setConfig(data);
    } catch (error) {
      console.error('Failed to load config:', error);
    }
  };

  const loadModels = async () => {
    try {
      const data = await unifiedRAGAPI.getModels();
      setModels(data.models || []);
    } catch (error) {
      console.error('Failed to load models:', error);
    }
  };

  // Chat functions
  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;

    const userMessage = { role: 'user', content: chatInput };
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setChatStreaming(true);

    try {
      const response = await unifiedRAGAPI.chat(chatInput, {
        conversationId: 'dashboard-session',
        useContext: true,
        maxTokens: 2000
      });

      const assistantMessage = { role: 'assistant', content: response.response || response.message };
      setChatMessages(prev => [...prev, assistantMessage]);
    } catch (error: any) {
      message.error('Chat error: ' + error.message);
    } finally {
      setChatStreaming(false);
    }
  };

  // Index functions
  const handleIndexText = async () => {
    if (!indexContent.trim()) {
      message.warning('Please enter content to index');
      return;
    }

    setLoading(true);
    try {
      let metadata = {};
      try {
        metadata = JSON.parse(indexMetadata);
      } catch (e) {
        message.warning('Invalid metadata JSON, using empty metadata');
      }

      const result = await unifiedRAGAPI.indexText(indexContent, metadata);
      message.success(`Indexed successfully! Document ID: ${result.documentId}`);
      setIndexContent('');
      setIndexMetadata('{}');
    } catch (error: any) {
      message.error('Index error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleIndexFile = async (file: File) => {
    setLoading(true);
    try {
      const result = await unifiedRAGAPI.indexFile(file);
      message.success(`File indexed successfully! Document ID: ${result.documentId}`);
    } catch (error: any) {
      message.error('File index error: ' + error.message);
    } finally {
      setLoading(false);
    }
    return false; // Prevent default upload
  };

  const handleIndexCodebase = async () => {
    setLoading(true);
    try {
      const result = await unifiedRAGAPI.indexCodebase({
        path: indexContent || process.cwd(),
        patterns: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx']
      });
      message.success(`Codebase indexed! Found ${result.filesIndexed} files`);
    } catch (error: any) {
      message.error('Codebase index error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Search functions
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      message.warning('Please enter a search query');
      return;
    }

    setLoading(true);
    try {
      const results = searchType === 'hybrid' 
        ? await unifiedRAGAPI.hybridSearch(searchQuery, { limit: searchLimit })
        : await unifiedRAGAPI.search(searchQuery, { limit: searchLimit });
      
      setSearchResults(results.results || results);
      message.success(`Found ${results.results?.length || results.length} results`);
    } catch (error: any) {
      message.error('Search error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderHealthStatus = () => {
    if (!health) return <Spin />;

    return (
      <Row gutter={[16, 16]}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Status"
              value={health.status}
              valueStyle={{ color: health.status === 'healthy' ? '#3f8600' : '#cf1322' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="LLM Status"
              value={health.llm?.status || 'Unknown'}
              valueStyle={{ color: health.llm?.available ? '#3f8600' : '#cf1322' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Vector DB"
              value={health.vectorStore?.status || 'Unknown'}
              valueStyle={{ color: health.vectorStore?.available ? '#3f8600' : '#cf1322' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Database"
              value={health.database?.status || 'Unknown'}
              valueStyle={{ color: health.database?.connected ? '#3f8600' : '#cf1322' }}
            />
          </Card>
        </Col>
      </Row>
    );
  };

  const renderChatInterface = () => (
    <Card title={<><MessageOutlined /> Chat with RAG</>}>
      <div style={{ marginBottom: 16, maxHeight: 400, overflowY: 'auto', border: '1px solid #d9d9d9', borderRadius: 4, padding: 16 }}>
        {chatMessages.length === 0 ? (
          <Alert message="Start a conversation by asking a question below" type="info" />
        ) : (
          chatMessages.map((msg, idx) => (
            <div key={idx} style={{ marginBottom: 12 }}>
              <Tag color={msg.role === 'user' ? 'blue' : 'green'}>{msg.role}</Tag>
              <div style={{ marginTop: 4, padding: 8, background: '#f5f5f5', borderRadius: 4 }}>
                {msg.content}
              </div>
            </div>
          ))
        )}
        {chatStreaming && <Spin tip="Thinking..." />}
      </div>
      <Space.Compact style={{ width: '100%' }}>
        <Input
          placeholder="Ask a question..."
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          onPressEnter={handleSendMessage}
          disabled={chatStreaming}
        />
        <Button type="primary" onClick={handleSendMessage} loading={chatStreaming}>
          Send
        </Button>
      </Space.Compact>
    </Card>
  );

  const renderIndexInterface = () => (
    <Card title={<><FileAddOutlined /> Index Documents</>}>
      <Form layout="vertical">
        <Form.Item label="Index Type">
          <Select value={indexType} onChange={setIndexType}>
            <Option value="text"><FileAddOutlined /> Text Content</Option>
            <Option value="file"><UploadOutlined /> Upload File</Option>
            <Option value="codebase"><CodeOutlined /> Codebase</Option>
            <Option value="image"><FileImageOutlined /> Image</Option>
          </Select>
        </Form.Item>

        {indexType === 'text' && (
          <>
            <Form.Item label="Content">
              <TextArea
                rows={6}
                value={indexContent}
                onChange={(e) => setIndexContent(e.target.value)}
                placeholder="Enter text content to index..."
              />
            </Form.Item>
            <Form.Item label="Metadata (JSON)">
              <TextArea
                rows={3}
                value={indexMetadata}
                onChange={(e) => setIndexMetadata(e.target.value)}
                placeholder='{"source": "documentation", "category": "api"}'
              />
            </Form.Item>
            <Button type="primary" onClick={handleIndexText} loading={loading}>
              Index Text
            </Button>
          </>
        )}

        {indexType === 'file' && (
          <Form.Item>
            <Upload
              beforeUpload={handleIndexFile}
              accept=".txt,.md,.json,.js,.ts,.tsx,.jsx,.pdf,.docx,.pptx,.xlsx"
              maxCount={1}
            >
              <Button icon={<UploadOutlined />} loading={loading}>
                Select File to Index
              </Button>
            </Upload>
            <div style={{ marginTop: 8 }}>
              <Alert
                message="Supported formats: Text, Markdown, Code, PDF, DOCX, PPTX, XLSX"
                type="info"
              />
            </div>
          </Form.Item>
        )}

        {indexType === 'codebase' && (
          <>
            <Form.Item label="Codebase Path">
              <Input
                value={indexContent}
                onChange={(e) => setIndexContent(e.target.value)}
                placeholder="Leave empty for current directory"
              />
            </Form.Item>
            <Button type="primary" onClick={handleIndexCodebase} loading={loading}>
              Index Codebase
            </Button>
          </>
        )}

        {indexType === 'image' && (
          <Form.Item>
            <Upload
              beforeUpload={(file) => handleIndexFile(file)}
              accept=".png,.jpg,.jpeg,.webp,.gif"
              maxCount={1}
            >
              <Button icon={<FileImageOutlined />} loading={loading}>
                Select Image to Index
              </Button>
            </Upload>
          </Form.Item>
        )}
      </Form>
    </Card>
  );

  const renderSearchInterface = () => (
    <Card title={<><SearchOutlined /> Search Documents</>}>
      <Form layout="vertical">
        <Form.Item label="Search Query">
          <Input
            placeholder="Enter search query..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onPressEnter={handleSearch}
          />
        </Form.Item>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Search Type">
              <Select value={searchType} onChange={setSearchType}>
                <Option value="hybrid">Hybrid (Semantic + Keyword)</Option>
                <Option value="semantic">Semantic Only</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Max Results">
              <Input
                type="number"
                value={searchLimit}
                onChange={(e) => setSearchLimit(parseInt(e.target.value) || 10)}
              />
            </Form.Item>
          </Col>
        </Row>
        <Button type="primary" onClick={handleSearch} loading={loading}>
          Search
        </Button>
      </Form>

      <Divider />

      {searchResults.length > 0 && (
        <Table
          dataSource={searchResults}
          columns={[
            { title: 'Document ID', dataIndex: 'documentId', key: 'documentId', width: 200 },
            { title: 'Content', dataIndex: 'content', key: 'content', ellipsis: true },
            { title: 'Score', dataIndex: 'score', key: 'score', width: 100, render: (score) => score?.toFixed(4) },
            { title: 'Source', dataIndex: ['metadata', 'source'], key: 'source', width: 150 }
          ]}
          pagination={{ pageSize: 10 }}
          scroll={{ x: true }}
        />
      )}
    </Card>
  );

  const renderConfigInterface = () => (
    <Card title={<><SettingOutlined /> Configuration</>}>
      {config ? (
        <div>
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Card type="inner" title="LLM Settings">
                <p><strong>Provider:</strong> {config.llm?.provider}</p>
                <p><strong>Model:</strong> {config.llm?.model}</p>
                <p><strong>Temperature:</strong> {config.llm?.temperature}</p>
              </Card>
            </Col>
            <Col span={12}>
              <Card type="inner" title="Embedding Settings">
                <p><strong>Model:</strong> {config.embedding?.model}</p>
                <p><strong>Dimensions:</strong> {config.embedding?.dimensions}</p>
              </Card>
            </Col>
          </Row>
          <Divider />
          <Card type="inner" title="Available Models">
            <Table
              dataSource={models}
              columns={[
                { title: 'Name', dataIndex: 'name', key: 'name' },
                { title: 'Size', dataIndex: 'size', key: 'size' },
                { title: 'Modified', dataIndex: 'modified_at', key: 'modified_at' }
              ]}
              pagination={false}
              size="small"
            />
          </Card>
        </div>
      ) : (
        <Spin />
      )}
    </Card>
  );

  return (
    <div style={{ padding: 24 }}>
      <h1>
        <DatabaseOutlined /> Unified RAG Dashboard
      </h1>
      <p>Comprehensive RAG system with document indexing, semantic search, and AI chat</p>

      <Divider />

      {renderHealthStatus()}

      <Divider />

      <Tabs defaultActiveKey="chat">
        <TabPane tab={<span><MessageOutlined /> Chat</span>} key="chat">
          {renderChatInterface()}
        </TabPane>

        <TabPane tab={<span><FileAddOutlined /> Index</span>} key="index">
          {renderIndexInterface()}
        </TabPane>

        <TabPane tab={<span><SearchOutlined /> Search</span>} key="search">
          {renderSearchInterface()}
        </TabPane>

        <TabPane tab={<span><SettingOutlined /> Config</span>} key="config">
          {renderConfigInterface()}
        </TabPane>
      </Tabs>
    </div>
  );
};

export default UnifiedRAGDashboard;
