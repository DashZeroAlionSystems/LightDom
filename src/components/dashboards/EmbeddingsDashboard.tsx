/**
 * Embeddings/Codebase Index Dashboard
 * 
 * Dashboard for semantic code search using embeddings.
 * Build index, search codebase, find similar files, and manage embedding models.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Row,
  Col,
  Button,
  Table,
  Tag,
  Space,
  Statistic,
  Input,
  Select,
  Tabs,
  Modal,
  Form,
  List,
  Badge,
  Tooltip,
  Empty,
  message,
  Progress,
  Descriptions,
  Alert,
  Switch,
  Spin,
} from 'antd';
import {
  SearchOutlined,
  DatabaseOutlined,
  FileSearchOutlined,
  ReloadOutlined,
  RocketOutlined,
  ThunderboltOutlined,
  CodeOutlined,
  LinkOutlined,
  CloudUploadOutlined,
  CloudDownloadOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  LoadingOutlined,
  EyeOutlined,
  SettingOutlined,
  BulbOutlined,
} from '@ant-design/icons';
import { embeddingsAPI, SearchResult, IndexStats, EmbeddingModel } from '../../services/apiService';

const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

export const EmbeddingsDashboard: React.FC = () => {
  // State
  const [health, setHealth] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [models, setModels] = useState<EmbeddingModel[]>([]);
  const [currentModel, setCurrentModel] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [building, setBuilding] = useState(false);
  const [searching, setSearching] = useState(false);
  const [activeTab, setActiveTab] = useState('search');
  
  // Search state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null);
  const [searchOptions, setSearchOptions] = useState({
    topK: 10,
    threshold: 0.5,
  });
  
  // Similar files state
  const [similarFile, setSimilarFile] = useState<string>('');
  const [similarResults, setSimilarResults] = useState<SearchResult | null>(null);
  
  // Related code state
  const [relatedCode, setRelatedCode] = useState<string>('');
  const [relatedResults, setRelatedResults] = useState<SearchResult | null>(null);
  
  // Context state
  const [contextQuery, setContextQuery] = useState<string>('');
  const [contextResult, setContextResult] = useState<any>(null);
  
  // Index files state
  const [indexedFiles, setIndexedFiles] = useState<string[]>([]);
  
  // Modal states
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [buildModalVisible, setBuildModalVisible] = useState(false);
  const [modelModalVisible, setModelModalVisible] = useState(false);
  
  const [form] = Form.useForm();

  // Fetch data
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [healthData, statsData, modelsData, filesData] = await Promise.all([
        embeddingsAPI.getHealth(),
        embeddingsAPI.getStats(),
        embeddingsAPI.listModels(),
        embeddingsAPI.getIndexedFiles(),
      ]);
      setHealth(healthData);
      setStats(statsData);
      setModels(modelsData.models || []);
      setCurrentModel(modelsData.currentModel || '');
      setIndexedFiles(filesData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      message.error('Failed to load embeddings data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handlers
  const handleBuildIndex = async (values: any) => {
    setBuilding(true);
    try {
      const result = await embeddingsAPI.buildIndex({
        incremental: values.incremental || false,
        patterns: values.patterns ? values.patterns.split('\n').filter((p: string) => p.trim()) : undefined,
        rootPath: values.rootPath || undefined,
      });
      message.success('Index built successfully');
      setBuildModalVisible(false);
      await fetchData();
    } catch (error) {
      message.error('Failed to build index');
    } finally {
      setBuilding(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      message.error('Please enter a search query');
      return;
    }

    setSearching(true);
    try {
      const result = await embeddingsAPI.search(searchQuery, searchOptions);
      setSearchResults(result);
      message.success(`Found ${result.count} results`);
    } catch (error) {
      message.error('Search failed');
    } finally {
      setSearching(false);
    }
  };

  const handleFindSimilar = async () => {
    if (!similarFile.trim()) {
      message.error('Please enter a file path');
      return;
    }

    setSearching(true);
    try {
      const result = await embeddingsAPI.getSimilarFiles(similarFile, {
        topK: searchOptions.topK,
        threshold: searchOptions.threshold,
      });
      setSimilarResults(result);
      message.success(`Found ${result.count} similar files`);
    } catch (error) {
      message.error('Failed to find similar files');
    } finally {
      setSearching(false);
    }
  };

  const handleFindRelated = async () => {
    if (!relatedCode.trim()) {
      message.error('Please enter a code snippet');
      return;
    }

    setSearching(true);
    try {
      const result = await embeddingsAPI.getRelatedCode(relatedCode, {
        topK: searchOptions.topK,
        threshold: searchOptions.threshold,
      });
      setRelatedResults(result);
      message.success(`Found ${result.count} related code snippets`);
    } catch (error) {
      message.error('Failed to find related code');
    } finally {
      setSearching(false);
    }
  };

  const handleGetContext = async () => {
    if (!contextQuery.trim()) {
      message.error('Please enter a query');
      return;
    }

    setSearching(true);
    try {
      const result = await embeddingsAPI.getContext(contextQuery, {
        maxTokens: 4000,
        topK: searchOptions.topK,
      });
      setContextResult(result);
      message.success('Context generated successfully');
    } catch (error) {
      message.error('Failed to generate context');
    } finally {
      setSearching(false);
    }
  };

  const handleSwitchModel = async (model: string) => {
    setLoading(true);
    try {
      await embeddingsAPI.switchModel(model, { reindex: true, pullIfMissing: true });
      message.success(`Switched to model: ${model}`);
      setModelModalVisible(false);
      await fetchData();
    } catch (error) {
      message.error('Failed to switch model');
    } finally {
      setLoading(false);
    }
  };

  const handleClearIndex = async () => {
    Modal.confirm({
      title: 'Clear Index',
      content: 'Are you sure you want to clear the entire index? This cannot be undone.',
      onOk: async () => {
        try {
          await embeddingsAPI.clearIndex();
          message.success('Index cleared successfully');
          await fetchData();
        } catch (error) {
          message.error('Failed to clear index');
        }
      },
    });
  };

  const handleViewResult = (result: any) => {
    setSelectedItem(result);
    setViewModalVisible(true);
  };

  // Search results columns
  const resultColumns = [
    {
      title: 'File',
      dataIndex: 'file',
      key: 'file',
      ellipsis: true,
      render: (file: string) => (
        <Tooltip title={file}>
          <Space>
            <CodeOutlined />
            <span style={{ fontFamily: 'monospace', fontSize: 12 }}>{file.split('/').pop()}</span>
          </Space>
        </Tooltip>
      ),
    },
    {
      title: 'Score',
      dataIndex: 'score',
      key: 'score',
      width: 120,
      render: (score: number) => (
        <Progress
          percent={Math.round(score * 100)}
          size="small"
          status={score >= 0.8 ? 'success' : score >= 0.5 ? 'normal' : 'exception'}
        />
      ),
    },
    {
      title: 'Line',
      dataIndex: 'line',
      key: 'line',
      width: 80,
      render: (line: number) => line ? <Tag>{line}</Tag> : '-',
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 80,
      render: (_: any, record: any) => (
        <Tooltip title="View Details">
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewResult(record)}
          />
        </Tooltip>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Row gutter={[16, 16]}>
        {/* Header */}
        <Col span={24}>
          <Card>
            <Row justify="space-between" align="middle">
              <Col>
                <Space>
                  <DatabaseOutlined style={{ fontSize: 24, color: '#1890ff' }} />
                  <div>
                    <h2 style={{ margin: 0 }}>Embeddings & Semantic Search</h2>
                    <p style={{ margin: 0, color: '#666' }}>
                      Semantic code search powered by high-quality embeddings
                    </p>
                  </div>
                </Space>
              </Col>
              <Col>
                <Space>
                  <Button
                    icon={<SettingOutlined />}
                    onClick={() => setModelModalVisible(true)}
                  >
                    Models
                  </Button>
                  <Button
                    icon={<RocketOutlined />}
                    onClick={() => setBuildModalVisible(true)}
                  >
                    Build Index
                  </Button>
                  <Button icon={<ReloadOutlined />} onClick={fetchData} loading={loading}>
                    Refresh
                  </Button>
                </Space>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Health Status */}
        {health && (
          <Col span={24}>
            <Alert
              message={
                <Space>
                  {health.status === 'healthy' ? (
                    <CheckCircleOutlined style={{ color: '#52c41a' }} />
                  ) : (
                    <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
                  )}
                  <span>
                    Status: <strong>{health.status}</strong> | Model: <strong>{health.model}</strong> | 
                    Dimensions: <strong>{health.dimensions}</strong>
                  </span>
                </Space>
              }
              type={health.status === 'healthy' ? 'success' : 'error'}
            />
          </Col>
        )}

        {/* Stats Cards */}
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Indexed Files"
              value={stats?.index?.totalFiles || 0}
              prefix={<FileSearchOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Chunks"
              value={stats?.index?.totalChunks || 0}
              prefix={<DatabaseOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Avg Chunks/File"
              value={stats?.index?.avgChunksPerFile || 0}
              precision={1}
              prefix={<BulbOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Current Model"
              value={currentModel.split('/').pop() || 'N/A'}
              prefix={<SettingOutlined />}
              valueStyle={{ color: '#faad14', fontSize: 16 }}
            />
          </Card>
        </Col>

        {/* Main Content */}
        <Col span={24}>
          <Card>
            <Tabs activeKey={activeTab} onChange={setActiveTab}>
              <TabPane tab="Search Codebase" key="search">
                <Row gutter={[16, 16]}>
                  <Col xs={24} md={12}>
                    <Card title="Search" size="small">
                      <Form layout="vertical">
                        <Form.Item label="Query" required>
                          <TextArea
                            rows={3}
                            placeholder="Enter natural language query (e.g., 'How to authenticate users?')"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                          />
                        </Form.Item>
                        <Row gutter={16}>
                          <Col span={12}>
                            <Form.Item label="Top K Results">
                              <Input
                                type="number"
                                value={searchOptions.topK}
                                onChange={(e) => setSearchOptions({ ...searchOptions, topK: parseInt(e.target.value) || 10 })}
                              />
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item label="Threshold">
                              <Input
                                type="number"
                                step="0.1"
                                value={searchOptions.threshold}
                                onChange={(e) => setSearchOptions({ ...searchOptions, threshold: parseFloat(e.target.value) || 0.5 })}
                              />
                            </Form.Item>
                          </Col>
                        </Row>
                        <Form.Item>
                          <Button
                            type="primary"
                            icon={searching ? <LoadingOutlined /> : <SearchOutlined />}
                            onClick={handleSearch}
                            loading={searching}
                            block
                          >
                            Search
                          </Button>
                        </Form.Item>
                      </Form>
                    </Card>
                  </Col>
                  <Col xs={24} md={12}>
                    <Card title="Results" size="small">
                      {searchResults ? (
                        <>
                          <Alert
                            message={`Found ${searchResults.count} results (avg score: ${(searchResults.avgScore * 100).toFixed(1)}%)`}
                            type="info"
                            style={{ marginBottom: 16 }}
                          />
                          <Table
                            dataSource={searchResults.results}
                            columns={resultColumns}
                            rowKey="file"
                            size="small"
                            pagination={{ pageSize: 5 }}
                          />
                        </>
                      ) : (
                        <Empty description="No search results yet" />
                      )}
                    </Card>
                  </Col>
                </Row>
              </TabPane>

              <TabPane tab="Similar Files" key="similar">
                <Row gutter={[16, 16]}>
                  <Col xs={24} md={12}>
                    <Card title="Find Similar Files" size="small">
                      <Form layout="vertical">
                        <Form.Item label="File Path" required>
                          <Input
                            placeholder="e.g., src/components/Dashboard.tsx"
                            value={similarFile}
                            onChange={(e) => setSimilarFile(e.target.value)}
                          />
                        </Form.Item>
                        <Form.Item>
                          <Button
                            type="primary"
                            icon={searching ? <LoadingOutlined /> : <LinkOutlined />}
                            onClick={handleFindSimilar}
                            loading={searching}
                            block
                          >
                            Find Similar
                          </Button>
                        </Form.Item>
                      </Form>
                    </Card>
                  </Col>
                  <Col xs={24} md={12}>
                    <Card title="Similar Files" size="small">
                      {similarResults ? (
                        <Table
                          dataSource={similarResults.results}
                          columns={resultColumns}
                          rowKey="file"
                          size="small"
                          pagination={{ pageSize: 5 }}
                        />
                      ) : (
                        <Empty description="No similar files found yet" />
                      )}
                    </Card>
                  </Col>
                </Row>
              </TabPane>

              <TabPane tab="Related Code" key="related">
                <Row gutter={[16, 16]}>
                  <Col xs={24} md={12}>
                    <Card title="Find Related Code" size="small">
                      <Form layout="vertical">
                        <Form.Item label="Code Snippet" required>
                          <TextArea
                            rows={6}
                            placeholder="Paste code snippet here..."
                            value={relatedCode}
                            onChange={(e) => setRelatedCode(e.target.value)}
                            style={{ fontFamily: 'monospace' }}
                          />
                        </Form.Item>
                        <Form.Item>
                          <Button
                            type="primary"
                            icon={searching ? <LoadingOutlined /> : <CodeOutlined />}
                            onClick={handleFindRelated}
                            loading={searching}
                            block
                          >
                            Find Related
                          </Button>
                        </Form.Item>
                      </Form>
                    </Card>
                  </Col>
                  <Col xs={24} md={12}>
                    <Card title="Related Code" size="small">
                      {relatedResults ? (
                        <Table
                          dataSource={relatedResults.results}
                          columns={resultColumns}
                          rowKey="file"
                          size="small"
                          pagination={{ pageSize: 5 }}
                        />
                      ) : (
                        <Empty description="No related code found yet" />
                      )}
                    </Card>
                  </Col>
                </Row>
              </TabPane>

              <TabPane tab="AI Context" key="context">
                <Row gutter={[16, 16]}>
                  <Col xs={24} md={12}>
                    <Card title="Generate Context for AI" size="small">
                      <Form layout="vertical">
                        <Form.Item label="Query" required>
                          <TextArea
                            rows={3}
                            placeholder="What do you want to know?"
                            value={contextQuery}
                            onChange={(e) => setContextQuery(e.target.value)}
                          />
                        </Form.Item>
                        <Form.Item>
                          <Button
                            type="primary"
                            icon={searching ? <LoadingOutlined /> : <ThunderboltOutlined />}
                            onClick={handleGetContext}
                            loading={searching}
                            block
                          >
                            Generate Context
                          </Button>
                        </Form.Item>
                      </Form>
                    </Card>
                  </Col>
                  <Col xs={24} md={12}>
                    {contextResult ? (
                      <Card title="Generated Context" size="small">
                        <Descriptions column={1} size="small" bordered>
                          <Descriptions.Item label="Token Count">{contextResult.tokenCount}</Descriptions.Item>
                          <Descriptions.Item label="Sources">{contextResult.sources?.length || 0}</Descriptions.Item>
                        </Descriptions>
                        <div style={{ marginTop: 16 }}>
                          <h4>Context:</h4>
                          <pre style={{ 
                            background: '#f5f5f5', 
                            padding: 12, 
                            borderRadius: 4, 
                            fontSize: 12, 
                            maxHeight: 400, 
                            overflow: 'auto' 
                          }}>
                            {contextResult.context}
                          </pre>
                        </div>
                      </Card>
                    ) : (
                      <Card size="small">
                        <Empty description="Generate context to see results" />
                      </Card>
                    )}
                  </Col>
                </Row>
              </TabPane>

              <TabPane tab="Indexed Files" key="files">
                <Card>
                  <Alert
                    message={`${indexedFiles.length} files indexed`}
                    type="info"
                    style={{ marginBottom: 16 }}
                  />
                  <List
                    dataSource={indexedFiles}
                    renderItem={(file) => (
                      <List.Item>
                        <Space>
                          <CodeOutlined />
                          <span style={{ fontFamily: 'monospace', fontSize: 12 }}>{file}</span>
                        </Space>
                      </List.Item>
                    )}
                    pagination={{ pageSize: 20 }}
                  />
                </Card>
              </TabPane>
            </Tabs>
          </Card>
        </Col>
      </Row>

      {/* Build Index Modal */}
      <Modal
        title="Build/Update Index"
        open={buildModalVisible}
        onCancel={() => setBuildModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleBuildIndex}>
          <Form.Item label="Incremental Build" name="incremental" valuePropName="checked">
            <Switch />
            <small style={{ marginLeft: 8, color: '#666' }}>Only index new/modified files</small>
          </Form.Item>
          <Form.Item label="Root Path" name="rootPath">
            <Input placeholder="Leave empty for current directory" />
          </Form.Item>
          <Form.Item label="File Patterns (one per line)" name="patterns">
            <TextArea
              rows={4}
              placeholder="**/*.ts&#10;**/*.tsx&#10;**/*.js&#10;**/*.jsx"
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={building} block>
              Build Index
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Model Selection Modal */}
      <Modal
        title="Embedding Models"
        open={modelModalVisible}
        onCancel={() => setModelModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setModelModalVisible(false)}>
            Close
          </Button>,
        ]}
        width={700}
      >
        <Alert
          message={`Current model: ${currentModel}`}
          type="info"
          style={{ marginBottom: 16 }}
        />
        <List
          dataSource={models}
          renderItem={(model) => (
            <List.Item
              actions={[
                <Button
                  size="small"
                  type={model.name === currentModel ? 'primary' : 'default'}
                  onClick={() => handleSwitchModel(model.name)}
                  disabled={model.name === currentModel}
                >
                  {model.name === currentModel ? 'Current' : 'Switch'}
                </Button>,
              ]}
            >
              <List.Item.Meta
                title={model.displayName || model.name}
                description={
                  <div>
                    <div>{model.description}</div>
                    <Space style={{ marginTop: 8 }}>
                      <Tag>Dimensions: {model.dimensions}</Tag>
                      <Tag>Size: {model.size}</Tag>
                    </Space>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      </Modal>

      {/* View Result Modal */}
      <Modal
        title="Result Details"
        open={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setViewModalVisible(false)}>
            Close
          </Button>,
        ]}
        width={800}
      >
        {selectedItem && (
          <div>
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="File">{selectedItem.file}</Descriptions.Item>
              <Descriptions.Item label="Score">
                <Progress percent={Math.round((selectedItem.score || 0) * 100)} size="small" />
              </Descriptions.Item>
              {selectedItem.line && (
                <Descriptions.Item label="Line">{selectedItem.line}</Descriptions.Item>
              )}
            </Descriptions>

            {selectedItem.content && (
              <>
                <h4 style={{ marginTop: 16 }}>Content:</h4>
                <pre style={{ 
                  background: '#f5f5f5', 
                  padding: 12, 
                  borderRadius: 4, 
                  fontSize: 12, 
                  maxHeight: 400, 
                  overflow: 'auto',
                  fontFamily: 'monospace',
                }}>
                  {selectedItem.content}
                </pre>
              </>
            )}

            {selectedItem.context && (
              <>
                <h4 style={{ marginTop: 16 }}>Context:</h4>
                <pre style={{ 
                  background: '#f5f5f5', 
                  padding: 12, 
                  borderRadius: 4, 
                  fontSize: 12, 
                  maxHeight: 200, 
                  overflow: 'auto',
                  fontFamily: 'monospace',
                }}>
                  {selectedItem.context}
                </pre>
              </>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default EmbeddingsDashboard;
