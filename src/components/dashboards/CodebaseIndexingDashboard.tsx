/**
 * Codebase Indexing Dashboard
 * 
 * Frontend component for semantic code search, knowledge graph visualization,
 * and AI-powered code analysis - critical for RAG integration.
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
  Progress,
  Input,
  Select,
  Tabs,
  Alert,
  List,
  Badge,
  Tooltip,
  Modal,
  Descriptions,
  Timeline,
  Empty,
} from 'antd';
import {
  CodeOutlined,
  SearchOutlined,
  PlayCircleOutlined,
  StopOutlined,
  BranchesOutlined,
  ApiOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  DatabaseOutlined,
  FileTextOutlined,
  EyeOutlined,
  ReloadOutlined,
  ThunderboltOutlined,
  BulbOutlined,
} from '@ant-design/icons';
import { codebaseIndexingAPI } from '../../services/apiService';

const { Search } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

interface IndexingStatus {
  status: string;
  lastIndexed: string | null;
  totalEntities: number;
  totalRelationships: number;
  totalFiles: number;
}

interface CodeEntity {
  id: string;
  name: string;
  type: string;
  filePath: string;
  lineStart: number;
  lineEnd: number;
  description?: string;
  signature?: string;
}

interface IndexingSession {
  id: string;
  status: string;
  startTime: string;
  endTime?: string;
  stats: {
    filesProcessed: number;
    entitiesFound: number;
    relationshipsFound: number;
    issuesDetected: number;
  };
}

interface Insight {
  type: string;
  title: string;
  description: string;
  data: any[];
}

export const CodebaseIndexingDashboard: React.FC = () => {
  const [status, setStatus] = useState<IndexingStatus | null>(null);
  const [sessions, setSessions] = useState<IndexingSession[]>([]);
  const [searchResults, setSearchResults] = useState<CodeEntity[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [deadCode, setDeadCode] = useState<any[]>([]);
  const [dependencies, setDependencies] = useState<{ internal: any[]; external: any[] }>({ internal: [], external: [] });
  const [loading, setLoading] = useState(true);
  const [indexing, setIndexing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [entityType, setEntityType] = useState<string | undefined>(undefined);
  const [selectedEntity, setSelectedEntity] = useState<CodeEntity | null>(null);
  const [entityModalVisible, setEntityModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const fetchStatus = useCallback(async () => {
    try {
      const data = await codebaseIndexingAPI.getStatus();
      setStatus(data);
      setIndexing(data.status === 'running');
    } catch (error) {
      console.error('Failed to fetch status:', error);
    }
  }, []);

  const fetchSessions = useCallback(async () => {
    try {
      const data = await codebaseIndexingAPI.getSessions(10);
      setSessions(data);
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
    }
  }, []);

  const fetchInsights = useCallback(async () => {
    try {
      const data = await codebaseIndexingAPI.getInsights();
      setInsights(data);
    } catch (error) {
      console.error('Failed to fetch insights:', error);
    }
  }, []);

  const fetchDeadCode = useCallback(async () => {
    try {
      const data = await codebaseIndexingAPI.getDeadCode();
      setDeadCode(data);
    } catch (error) {
      console.error('Failed to fetch dead code:', error);
    }
  }, []);

  const fetchDependencies = useCallback(async () => {
    try {
      const data = await codebaseIndexingAPI.getDependencies();
      setDependencies(data);
    } catch (error) {
      console.error('Failed to fetch dependencies:', error);
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchStatus(),
        fetchSessions(),
        fetchInsights(),
        fetchDeadCode(),
        fetchDependencies(),
      ]);
      setLoading(false);
    };
    loadData();

    // Poll for status updates when indexing
    const interval = setInterval(() => {
      if (indexing) {
        fetchStatus();
        fetchSessions();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [fetchStatus, fetchSessions, fetchInsights, fetchDeadCode, fetchDependencies, indexing]);

  const handleStartIndexing = async (incremental: boolean = false) => {
    try {
      setIndexing(true);
      await codebaseIndexingAPI.startIndexing({ incremental });
      await fetchStatus();
      await fetchSessions();
    } catch (error) {
      console.error('Failed to start indexing:', error);
      setIndexing(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    try {
      const results = await codebaseIndexingAPI.searchEntities(searchQuery, {
        type: entityType,
        limit: 50,
      });
      setSearchResults(results);
    } catch (error) {
      console.error('Failed to search:', error);
    }
  };

  const handleViewEntity = async (entity: CodeEntity) => {
    try {
      const details = await codebaseIndexingAPI.getEntity(entity.id);
      if (details) {
        setSelectedEntity(details);
        setEntityModalVisible(true);
      }
    } catch (error) {
      console.error('Failed to fetch entity details:', error);
    }
  };

  const getStatusBadge = (statusValue: string) => {
    switch (statusValue) {
      case 'running':
        return <Badge status="processing" text="Running" />;
      case 'completed':
        return <Badge status="success" text="Completed" />;
      case 'failed':
        return <Badge status="error" text="Failed" />;
      case 'idle':
        return <Badge status="default" text="Idle" />;
      default:
        return <Badge status="default" text={statusValue} />;
    }
  };

  const entityColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: CodeEntity) => (
        <Space>
          <CodeOutlined />
          <a onClick={() => handleViewEntity(record)}>{text}</a>
        </Space>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => {
        const colors: Record<string, string> = {
          function: 'blue',
          class: 'purple',
          variable: 'green',
          interface: 'orange',
          type: 'cyan',
        };
        return <Tag color={colors[type] || 'default'}>{type}</Tag>;
      },
    },
    {
      title: 'File',
      dataIndex: 'filePath',
      key: 'filePath',
      ellipsis: true,
      render: (path: string) => (
        <Tooltip title={path}>
          <span>{path.split('/').slice(-2).join('/')}</span>
        </Tooltip>
      ),
    },
    {
      title: 'Lines',
      key: 'lines',
      render: (_: any, record: CodeEntity) => (
        <span>{record.lineStart} - {record.lineEnd}</span>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: CodeEntity) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => handleViewEntity(record)}
        >
          View
        </Button>
      ),
    },
  ];

  const sessionColumns = [
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (statusValue: string) => getStatusBadge(statusValue),
    },
    {
      title: 'Started',
      dataIndex: 'startTime',
      key: 'startTime',
      render: (time: string) => new Date(time).toLocaleString(),
    },
    {
      title: 'Files',
      key: 'files',
      render: (_: any, record: IndexingSession) => record.stats.filesProcessed,
    },
    {
      title: 'Entities',
      key: 'entities',
      render: (_: any, record: IndexingSession) => record.stats.entitiesFound,
    },
    {
      title: 'Relationships',
      key: 'relationships',
      render: (_: any, record: IndexingSession) => record.stats.relationshipsFound,
    },
    {
      title: 'Issues',
      key: 'issues',
      render: (_: any, record: IndexingSession) => (
        <Tag color={record.stats.issuesDetected > 0 ? 'warning' : 'success'}>
          {record.stats.issuesDetected}
        </Tag>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card>
            <Row justify="space-between" align="middle">
              <Col>
                <Space>
                  <CodeOutlined style={{ fontSize: 24, color: '#1890ff' }} />
                  <div>
                    <h2 style={{ margin: 0 }}>Codebase Indexing</h2>
                    <p style={{ margin: 0, color: '#666' }}>
                      Semantic code search, knowledge graph, and AI-powered analysis
                    </p>
                  </div>
                </Space>
              </Col>
              <Col>
                <Space>
                  <Button
                    icon={<ReloadOutlined />}
                    onClick={() => {
                      fetchStatus();
                      fetchSessions();
                      fetchInsights();
                    }}
                  >
                    Refresh
                  </Button>
                  <Button
                    type="primary"
                    icon={indexing ? <SyncOutlined spin /> : <PlayCircleOutlined />}
                    onClick={() => handleStartIndexing(false)}
                    disabled={indexing}
                  >
                    {indexing ? 'Indexing...' : 'Start Full Index'}
                  </Button>
                  <Button
                    icon={<ThunderboltOutlined />}
                    onClick={() => handleStartIndexing(true)}
                    disabled={indexing}
                  >
                    Incremental Index
                  </Button>
                </Space>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Stats Cards */}
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Entities"
              value={status?.totalEntities || 0}
              prefix={<CodeOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Relationships"
              value={status?.totalRelationships || 0}
              prefix={<BranchesOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Status"
              value={status?.status || 'Unknown'}
              prefix={
                status?.status === 'running' ? (
                  <SyncOutlined spin />
                ) : (
                  <CheckCircleOutlined />
                )
              }
              valueStyle={{
                color: status?.status === 'running' ? '#faad14' : '#52c41a',
              }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Last Indexed"
              value={
                status?.lastIndexed
                  ? new Date(status.lastIndexed).toLocaleDateString()
                  : 'Never'
              }
              prefix={<DatabaseOutlined />}
            />
          </Card>
        </Col>

        {/* Main Content */}
        <Col span={24}>
          <Card>
            <Tabs activeKey={activeTab} onChange={setActiveTab}>
              <TabPane tab="Search" key="search">
                <Space direction="vertical" style={{ width: '100%' }} size="large">
                  <Row gutter={16}>
                    <Col flex="auto">
                      <Search
                        placeholder="Search functions, classes, variables..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onSearch={handleSearch}
                        enterButton
                        size="large"
                      />
                    </Col>
                    <Col>
                      <Select
                        placeholder="Filter by type"
                        style={{ width: 150 }}
                        size="large"
                        allowClear
                        value={entityType}
                        onChange={setEntityType}
                      >
                        <Option value="function">Functions</Option>
                        <Option value="class">Classes</Option>
                        <Option value="variable">Variables</Option>
                        <Option value="interface">Interfaces</Option>
                        <Option value="type">Types</Option>
                      </Select>
                    </Col>
                  </Row>

                  {searchResults.length > 0 ? (
                    <Table
                      dataSource={searchResults}
                      columns={entityColumns}
                      rowKey="id"
                      pagination={{ pageSize: 10 }}
                    />
                  ) : searchQuery ? (
                    <Empty description="No results found" />
                  ) : (
                    <Alert
                      message="Search Your Codebase"
                      description="Enter a search term to find functions, classes, variables, and more across your entire codebase."
                      type="info"
                      showIcon
                    />
                  )}
                </Space>
              </TabPane>

              <TabPane tab="Insights" key="insights">
                {insights.length > 0 ? (
                  <Row gutter={[16, 16]}>
                    {insights.map((insight, index) => (
                      <Col xs={24} md={12} key={index}>
                        <Card
                          title={
                            <Space>
                              <BulbOutlined style={{ color: '#faad14' }} />
                              {insight.title}
                            </Space>
                          }
                        >
                          <p>{insight.description}</p>
                          <List
                            size="small"
                            dataSource={insight.data.slice(0, 5)}
                            renderItem={(item: any) => (
                              <List.Item>
                                <Space>
                                  {item.name || item.file_path || item.type}
                                  {item.count && <Tag>{item.count}</Tag>}
                                  {item.connections && (
                                    <Tag color="blue">{item.connections} connections</Tag>
                                  )}
                                  {item.entity_count && (
                                    <Tag color="green">{item.entity_count} entities</Tag>
                                  )}
                                </Space>
                              </List.Item>
                            )}
                          />
                        </Card>
                      </Col>
                    ))}
                  </Row>
                ) : (
                  <Empty description="No insights available. Run indexing first." />
                )}
              </TabPane>

              <TabPane tab="Dead Code" key="dead-code">
                {deadCode.length > 0 ? (
                  <Table
                    dataSource={deadCode}
                    columns={[
                      { title: 'Name', dataIndex: 'name', key: 'name' },
                      {
                        title: 'Type',
                        dataIndex: 'type',
                        key: 'type',
                        render: (type: string) => <Tag>{type}</Tag>,
                      },
                      { title: 'File', dataIndex: 'filePath', key: 'filePath', ellipsis: true },
                      { title: 'Line', dataIndex: 'line', key: 'line' },
                      {
                        title: 'Reason',
                        dataIndex: 'reason',
                        key: 'reason',
                        render: (reason: string) => (
                          <Space>
                            <WarningOutlined style={{ color: '#faad14' }} />
                            {reason}
                          </Space>
                        ),
                      },
                    ]}
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                  />
                ) : (
                  <Empty description="No dead code detected or indexing not complete." />
                )}
              </TabPane>

              <TabPane tab="Dependencies" key="dependencies">
                <Row gutter={[16, 16]}>
                  <Col xs={24} md={12}>
                    <Card title="External Dependencies" size="small">
                      <List
                        dataSource={dependencies.external.slice(0, 20)}
                        renderItem={(dep: any) => (
                          <List.Item>
                            <Space>
                              <ApiOutlined />
                              {dep.module}
                              <Tag color="blue">{dep.usageCount} uses</Tag>
                            </Space>
                          </List.Item>
                        )}
                        locale={{ emptyText: 'No external dependencies found' }}
                      />
                    </Card>
                  </Col>
                  <Col xs={24} md={12}>
                    <Card title="Internal Modules" size="small">
                      <List
                        dataSource={dependencies.internal.slice(0, 20)}
                        renderItem={(dep: any) => (
                          <List.Item>
                            <Space>
                              <FileTextOutlined />
                              {dep.module}
                              <Tag color="green">{dep.usageCount} uses</Tag>
                            </Space>
                          </List.Item>
                        )}
                        locale={{ emptyText: 'No internal modules found' }}
                      />
                    </Card>
                  </Col>
                </Row>
              </TabPane>

              <TabPane tab="Sessions" key="sessions">
                <Table
                  dataSource={sessions}
                  columns={sessionColumns}
                  rowKey="id"
                  pagination={{ pageSize: 10 }}
                  locale={{ emptyText: 'No indexing sessions yet' }}
                />
              </TabPane>
            </Tabs>
          </Card>
        </Col>
      </Row>

      {/* Entity Details Modal */}
      <Modal
        title={
          <Space>
            <CodeOutlined />
            {selectedEntity?.name}
          </Space>
        }
        open={entityModalVisible}
        onCancel={() => setEntityModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedEntity && (
          <Descriptions bordered column={2}>
            <Descriptions.Item label="Name">{selectedEntity.name}</Descriptions.Item>
            <Descriptions.Item label="Type">
              <Tag>{selectedEntity.type}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="File" span={2}>
              {selectedEntity.filePath}
            </Descriptions.Item>
            <Descriptions.Item label="Lines">
              {selectedEntity.lineStart} - {selectedEntity.lineEnd}
            </Descriptions.Item>
            <Descriptions.Item label="Description" span={2}>
              {selectedEntity.description || 'No description available'}
            </Descriptions.Item>
            {selectedEntity.signature && (
              <Descriptions.Item label="Signature" span={2}>
                <code style={{ background: '#f5f5f5', padding: '8px', display: 'block' }}>
                  {selectedEntity.signature}
                </code>
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default CodebaseIndexingDashboard;
