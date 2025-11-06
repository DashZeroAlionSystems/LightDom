/**
 * SEO Crawler Workflow Component
 * Comprehensive workflow for SEO crawling, data processing, and ML model training
 * Auto-generates memories and workflows for SEO operations
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Card,
  Steps,
  Button,
  Form,
  Input,
  Select,
  Space,
  Typography,
  message,
  Modal,
  Table,
  Tag,
  Badge,
  Progress,
  Timeline,
  Alert,
  Row,
  Col,
  Statistic,
  Tabs,
  List,
  Descriptions,
  Drawer,
  Tooltip,
  Checkbox,
  Divider,
  InputNumber,
  Empty,
  Avatar,
  Dropdown,
  Menu,
  Radio,
  DatePicker
} from 'antd';
import {
  GlobalOutlined,
  ThunderboltOutlined,
  DatabaseOutlined,
  BarChartOutlined,
  ExperimentOutlined,
  PlayCircleOutlined,
  EyeOutlined,
  SearchOutlined,
  FilterOutlined,
  DownloadOutlined,
  HistoryOutlined,
  BulbOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  LoadingOutlined,
  SyncOutlined,
  RightOutlined,
  PlusOutlined,
  SettingOutlined,
  TrophyOutlined,
  MenuFoldOutlined,
  MoreOutlined,
  AppstoreOutlined,
  ShareAltOutlined
} from '@ant-design/icons';
import DesktopOutlined from '@ant-design/icons/DesktopOutlined';
import type { ColumnsType } from 'antd/es/table';
import './AdminStyles.css';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Step } = Steps;

// Advanced Memory Components for Enhanced UX
interface AdvancedMemoryLoggerProps {
  memories: SEOWorkflowMemory[];
  onMemorySelect?: (memory: SEOWorkflowMemory) => void;
  onMemoryReplay?: (memory: SEOWorkflowMemory) => void;
}

const AdvancedMemoryLogger: React.FC<AdvancedMemoryLoggerProps> = ({
  memories,
  onMemorySelect,
  onMemoryReplay
}) => {
  const [searchText, setSearchText] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'timeline' | 'table' | 'graph'>('timeline');
  const [dateRange, setDateRange] = useState<[any, any]>([null, null]);

  const filteredMemories = useMemo(() => {
    return memories.filter(memory => {
      const matchesSearch = memory.action.toLowerCase().includes(searchText.toLowerCase()) ||
                          JSON.stringify(memory.details).toLowerCase().includes(searchText.toLowerCase());
      const matchesType = selectedType === 'all' || memory.type === selectedType;
      const matchesStatus = selectedStatus === 'all' || memory.status === selectedStatus;
      const matchesDate = !dateRange[0] || !dateRange[1] ||
                         (memory.timestamp >= dateRange[0].toDate() && memory.timestamp <= dateRange[1].toDate());

      return matchesSearch && matchesType && matchesStatus && matchesDate;
    });
  }, [memories, searchText, selectedType, selectedStatus, dateRange]);

  const memoryStats = useMemo(() => {
    const stats = {
      total: memories.length,
      success: memories.filter(m => m.status === 'success').length,
      error: memories.filter(m => m.status === 'error').length,
      running: memories.filter(m => m.status === 'running').length,
      pending: memories.filter(m => m.status === 'pending').length
    };
    return stats;
  }, [memories]);

  return (
    <div>
      <Card>
        <Title level={4}>Advanced Memory Logger</Title>
        <Text type="secondary">
          Intelligent memory management with AI-powered insights and workflow suggestions
        </Text>

        {/* Memory Statistics */}
        <Row gutter={16} style={{ marginTop: '16px', marginBottom: '16px' }}>
          <Col span={4}>
            <Statistic title="Total Memories" value={memoryStats.total} />
          </Col>
          <Col span={4}>
            <Statistic title="Success" value={memoryStats.success} valueStyle={{ color: '#3f8600' }} />
          </Col>
          <Col span={4}>
            <Statistic title="Errors" value={memoryStats.error} valueStyle={{ color: '#cf1322' }} />
          </Col>
          <Col span={4}>
            <Statistic title="Running" value={memoryStats.running} valueStyle={{ color: '#1890ff' }} />
          </Col>
          <Col span={4}>
            <Statistic title="Pending" value={memoryStats.pending} valueStyle={{ color: '#faad14' }} />
          </Col>
          <Col span={4}>
            <Statistic title="Success Rate" value={memoryStats.total > 0 ? (memoryStats.success / memoryStats.total * 100).toFixed(1) : 0} suffix="%" />
          </Col>
        </Row>

        {/* Filters and Search */}
        <Card size="small" style={{ marginBottom: '16px' }}>
          <Row gutter={16} align="middle">
            <Col span={6}>
              <Input
                placeholder="Search memories..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </Col>
            <Col span={4}>
              <Select value={selectedType} onChange={setSelectedType} style={{ width: '100%' }}>
                <Select.Option value="all">All Types</Select.Option>
                <Select.Option value="crawler_start">Crawler Start</Select.Option>
                <Select.Option value="crawler_progress">Progress</Select.Option>
                <Select.Option value="crawler_complete">Complete</Select.Option>
                <Select.Option value="data_processing">Data Processing</Select.Option>
                <Select.Option value="model_training">Model Training</Select.Option>
                <Select.Option value="model_evaluation">Evaluation</Select.Option>
                <Select.Option value="optimization_applied">Optimization</Select.Option>
              </Select>
            </Col>
            <Col span={4}>
              <Select value={selectedStatus} onChange={setSelectedStatus} style={{ width: '100%' }}>
                <Select.Option value="all">All Status</Select.Option>
                <Select.Option value="success">Success</Select.Option>
                <Select.Option value="error">Error</Select.Option>
                <Select.Option value="running">Running</Select.Option>
                <Select.Option value="pending">Pending</Select.Option>
              </Select>
            </Col>
            <Col span={6}>
              <DatePicker.RangePicker
                value={dateRange}
                onChange={(dates) => setDateRange(dates as [Date | null, Date | null])}
                style={{ width: '100%' }}
              />
            </Col>
            <Col span={4}>
              <Radio.Group value={viewMode} onChange={(e) => setViewMode(e.target.value)}>
                <Radio.Button value="timeline"><HistoryOutlined /></Radio.Button>
                <Radio.Button value="table"><DatabaseOutlined /></Radio.Button>
                <Radio.Button value="graph"><ShareAltOutlined /></Radio.Button>
              </Radio.Group>
            </Col>
          </Row>
        </Card>

        {/* Workflow Suggestions */}
        <WorkflowSuggestions
          memories={filteredMemories}
          onSuggestionSelect={(suggestion) => {
            message.info(`Applied suggestion: ${suggestion.title}`);
          }}
        />

        {/* Memory Views */}
        <div style={{ marginTop: '16px' }}>
          {viewMode === 'timeline' && (
            <MemoryTimelineView
              memories={filteredMemories}
              onMemorySelect={onMemorySelect}
              onMemoryReplay={onMemoryReplay}
            />
          )}
          {viewMode === 'table' && (
            <MemoryTableView
              memories={filteredMemories}
              onMemorySelect={onMemorySelect}
              onMemoryReplay={onMemoryReplay}
            />
          )}
          {viewMode === 'graph' && (
            <MemoryGraphView
              memories={filteredMemories}
              onMemorySelect={onMemorySelect}
            />
          )}
        </div>
      </Card>
    </div>
  );
};

interface WorkflowSuggestionsProps {
  memories: SEOWorkflowMemory[];
  onSuggestionSelect?: (suggestion: any) => void;
}

const WorkflowSuggestions: React.FC<WorkflowSuggestionsProps> = ({
  memories,
  onSuggestionSelect
}) => {
  const suggestions = useMemo(() => {
    const recentErrors = memories.filter(m => m.status === 'error').slice(0, 3);
    const successfulPatterns = memories.filter(m => m.status === 'success');
    const avgExecutionTime = successfulPatterns.reduce((acc, m) => {
      // Calculate average execution time (simplified)
      return acc + (Math.random() * 1000); // Mock calculation
    }, 0) / successfulPatterns.length;

    const suggs = [];

    if (recentErrors.length > 0) {
      suggs.push({
        id: 'error_fix',
        title: 'Fix Recent Errors',
        description: `Address ${recentErrors.length} recent workflow errors`,
        confidence: 0.85,
        type: 'error_resolution',
        action: 'retry_failed_workflows'
      });
    }

    if (successfulPatterns.length > 5) {
      suggs.push({
        id: 'optimize_workflow',
        title: 'Optimize Workflow Pattern',
        description: 'Based on successful patterns, optimize execution flow',
        confidence: 0.72,
        type: 'optimization',
        action: 'apply_best_practices'
      });
    }

    if (avgExecutionTime > 5000) {
      suggs.push({
        id: 'performance_boost',
        title: 'Performance Optimization',
        description: 'Reduce average execution time by 30%',
        confidence: 0.68,
        type: 'performance',
        action: 'optimize_performance'
      });
    }

    return suggs;
  }, [memories]);

  if (suggestions.length === 0) return null;

  return (
    <Card size="small" style={{ marginBottom: '16px' }}>
      <Title level={5}>
        <BulbOutlined style={{ marginRight: '8px' }} />
        AI Workflow Suggestions
      </Title>
      <List
        dataSource={suggestions}
        renderItem={(suggestion) => (
          <List.Item
            actions={[
              <Button
                type="link"
                size="small"
                onClick={() => onSuggestionSelect?.(suggestion)}
              >
                Apply
              </Button>
            ]}
          >
            <List.Item.Meta
              title={
                <Space>
                  {suggestion.title}
                  <Tag color="blue">{(suggestion.confidence * 100).toFixed(0)}% confidence</Tag>
                </Space>
              }
              description={suggestion.description}
            />
          </List.Item>
        )}
      />
    </Card>
  );
};

interface MemoryTimelineViewProps {
  memories: SEOWorkflowMemory[];
  onMemorySelect?: (memory: SEOWorkflowMemory) => void;
  onMemoryReplay?: (memory: SEOWorkflowMemory) => void;
}

const MemoryTimelineView: React.FC<MemoryTimelineViewProps> = ({
  memories,
  onMemorySelect,
  onMemoryReplay
}) => {
  return (
    <div style={{ maxHeight: '600px', overflow: 'auto' }}>
      <Timeline>
        {memories.map((memory) => (
          <Timeline.Item
            key={memory.id}
            color={
              memory.status === 'success' ? 'green' :
              memory.status === 'error' ? 'red' :
              memory.status === 'running' ? 'blue' : 'gray'
            }
          >
            <Card
              size="small"
              hoverable
              onClick={() => onMemorySelect?.(memory)}
              actions={[
                <Tooltip title="Replay Workflow">
                  <Button
                    type="text"
                    icon={<SyncOutlined />}
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      onMemoryReplay?.(memory);
                    }}
                  />
                </Tooltip>
              ]}
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text strong>{memory.action}</Text>
                  <Space>
                    <Tag color={
                      memory.status === 'success' ? 'success' :
                      memory.status === 'error' ? 'error' :
                      memory.status === 'running' ? 'processing' : 'default'
                    }>
                      {memory.status.toUpperCase()}
                    </Tag>
                    <Tag color="blue">{memory.type.replace('_', ' ').toUpperCase()}</Tag>
                  </Space>
                </div>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  {memory.timestamp.toLocaleString()}
                </Text>
                {memory.sessionId && (
                  <Text style={{ fontSize: '12px' }}>
                    Session: <Text code>{memory.sessionId}</Text>
                  </Text>
                )}
                {memory.metrics && (
                  <div style={{ fontSize: '12px' }}>
                    <Text>Pages Crawled: {memory.metrics.pagesCrawled || 0}</Text>
                    <br />
                    <Text>Data Processed: {memory.metrics.dataProcessed || 0}</Text>
                    <br />
                    <Text>Model Accuracy: {memory.metrics.modelAccuracy ? `${(memory.metrics.modelAccuracy * 100).toFixed(1)}%` : 'N/A'}</Text>
                  </div>
                )}
              </Space>
            </Card>
          </Timeline.Item>
        ))}
      </Timeline>
    </div>
  );
};

interface MemoryTableViewProps {
  memories: SEOWorkflowMemory[];
  onMemorySelect?: (memory: SEOWorkflowMemory) => void;
  onMemoryReplay?: (memory: SEOWorkflowMemory) => void;
}

const MemoryTableView: React.FC<MemoryTableViewProps> = ({
  memories,
  onMemorySelect,
  onMemoryReplay
}) => {
  const columns: ColumnsType<SEOWorkflowMemory> = [
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      ellipsis: true,
      sorter: (a, b) => a.action.localeCompare(b.action)
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag color="blue">{type.replace('_', ' ').toUpperCase()}</Tag>
      ),
      filters: [
        { text: 'Crawler Start', value: 'crawler_start' },
        { text: 'Progress', value: 'crawler_progress' },
        { text: 'Complete', value: 'crawler_complete' },
        { text: 'Data Processing', value: 'data_processing' },
        { text: 'Model Training', value: 'model_training' },
        { text: 'Evaluation', value: 'model_evaluation' },
        { text: 'Optimization', value: 'optimization_applied' }
      ],
      onFilter: (value, record) => record.type === value
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={
          status === 'success' ? 'success' :
          status === 'error' ? 'error' :
          status === 'running' ? 'processing' : 'default'
        }>
          {status.toUpperCase()}
        </Tag>
      ),
      filters: [
        { text: 'Success', value: 'success' },
        { text: 'Error', value: 'error' },
        { text: 'Running', value: 'running' },
        { text: 'Pending', value: 'pending' }
      ],
      onFilter: (value, record) => record.status === value
    },
    {
      title: 'Timestamp',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (timestamp: Date) => timestamp.toLocaleString(),
      sorter: (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
    },
    {
      title: 'Session',
      dataIndex: 'sessionId',
      key: 'sessionId',
      render: (sessionId?: string) => sessionId ? <Text code>{sessionId.slice(0, 8)}...</Text> : '-'
    },
    {
      title: 'Metrics',
      key: 'metrics',
      render: (_, record) => (
        <div>
          {record.metrics?.pagesCrawled && <div>Pages: {record.metrics.pagesCrawled}</div>}
          {record.metrics?.modelAccuracy && <div>Accuracy: {(record.metrics.modelAccuracy * 100).toFixed(1)}%</div>}
        </div>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            size="small"
            onClick={() => onMemorySelect?.(record)}
          >
            View
          </Button>
          <Button
            type="link"
            size="small"
            icon={<SyncOutlined />}
            onClick={() => onMemoryReplay?.(record)}
          >
            Replay
          </Button>
        </Space>
      )
    }
  ];

  return (
    <Table
      columns={columns}
      dataSource={memories}
      rowKey="id"
      size="small"
      pagination={{
        pageSize: 20,
        showSizeChanger: true,
        showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} memories`
      }}
      onRow={(record) => ({
        onClick: () => onMemorySelect?.(record)
      })}
    />
  );
};

interface MemoryGraphViewProps {
  memories: SEOWorkflowMemory[];
  onMemorySelect?: (memory: SEOWorkflowMemory) => void;
}

const MemoryGraphView: React.FC<MemoryGraphViewProps> = ({
  memories,
  onMemorySelect
}) => {
  // Group memories by session for graph visualization
  const sessionGroups = useMemo(() => {
    const groups: { [key: string]: SEOWorkflowMemory[] } = {};
    memories.forEach(memory => {
      const key = memory.sessionId || 'no-session';
      if (!groups[key]) groups[key] = [];
      groups[key].push(memory);
    });
    return groups;
  }, [memories]);

  return (
    <div>
      <Title level={5}>Memory Relationship Graph</Title>
      <Text type="secondary">Visualize workflow patterns and relationships</Text>

      <div style={{ marginTop: '16px' }}>
        {Object.entries(sessionGroups).map(([sessionId, sessionMemories]) => (
          <Card key={sessionId} size="small" style={{ marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Space>
                <Text strong>Session: {sessionId === 'no-session' ? 'No Session' : sessionId.slice(0, 8)}</Text>
                <Badge count={sessionMemories.length} />
              </Space>
              <Button
                type="link"
                size="small"
                onClick={() => onMemorySelect?.(sessionMemories[0])}
              >
                View Details
              </Button>
            </div>

            <div style={{ marginTop: '8px' }}>
              <Timeline>
                {sessionMemories.slice(0, 5).map((memory, index) => (
                  <Timeline.Item
                    key={memory.id}
                    color={
                      memory.status === 'success' ? 'green' :
                      memory.status === 'error' ? 'red' :
                      memory.status === 'running' ? 'blue' : 'gray'
                    }
                  >
                    <Text style={{ fontSize: '12px' }}>{memory.action}</Text>
                    {index === 4 && sessionMemories.length > 5 && (
                      <Text type="secondary" style={{ fontSize: '11px' }}>
                        ... and {sessionMemories.length - 5} more
                      </Text>
                    )}
                  </Timeline.Item>
                ))}
              </Timeline>
            </div>
          </Card>
        ))}
      </div>

      {Object.keys(sessionGroups).length === 0 && (
        <Empty description="No memories to visualize" />
      )}
    </div>
  );
};

// Workflow Memory System for SEO Operations
interface SEOWorkflowMemory {
  id: string;
  type: 'crawler_start' | 'crawler_progress' | 'crawler_complete' | 'data_processing' | 'model_training' | 'model_evaluation' | 'optimization_applied';
  timestamp: Date;
  sessionId?: string;
  action: string;
  details: any;
  status: 'success' | 'error' | 'pending' | 'running';
  workflowId: string;
  metrics?: {
    pagesCrawled?: number;
    dataProcessed?: number;
    modelAccuracy?: number;
    optimizationsApplied?: number;
  };
}

interface SEOCrawlerStep {
  id: string;
  title: string;
  description: string;
  status: 'wait' | 'process' | 'finish' | 'error';
  data?: any;
  metrics?: any;
}

interface SEOCrawlerWorkflow {
  id: string;
  type: 'seo_crawler' | 'data_processing' | 'model_training' | 'optimization_deployment';
  steps: SEOCrawlerStep[];
  currentStep: number;
  status: 'active' | 'completed' | 'failed' | 'cancelled' | 'paused';
  createdAt: Date;
  completedAt?: Date;
  config?: SEOCrawlerConfig | MLModelTrainingConfig;
  results?: any;
  memories: SEOWorkflowMemory[];
}

interface SEOCrawlerConfig {
  targetUrls: string[];
  crawlDepth: number;
  maxPages: number;
  delayBetweenRequests: number;
  userAgent: string;
  respectRobotsTxt: boolean;
  extractStructuredData: boolean;
  analyzePerformance: boolean;
  generateReports: boolean;
}

interface MLModelTrainingConfig {
  name: string;
  type: 'regression' | 'classification' | 'clustering' | 'nlp';
  algorithm: string;
  trainingDataSize: number;
}

interface CrawlerSession {
  id: string;
  status: 'idle' | 'running' | 'completed' | 'error' | 'paused';
  startTime?: Date;
  endTime?: Date;
  config: SEOCrawlerConfig;
  progress: {
    pagesCrawled: number;
    pagesQueued: number;
    errors: number;
    dataExtracted: number;
  };
  results?: {
    optimizations: any[];
    performanceMetrics: any;
    structuredData: any[];
  };
  workflowHistory?: SEOCrawlerWorkflow[];
}

interface MLModel {
  id: string;
  name: string;
  type: 'regression' | 'classification' | 'clustering' | 'nlp';
  algorithm: string;
  status: 'training' | 'ready' | 'failed' | 'deployed';
  accuracy?: number;
  trainingDataSize: number;
  features: string[];
  createdAt: Date;
  lastTrained?: Date;
  performance: {
    precision?: number;
    recall?: number;
    f1Score?: number;
    mse?: number;
    r2Score?: number;
  };
}

const SEOCrawlerWorkflow: React.FC = () => {
  // State management
  const [activeWorkflow, setActiveWorkflow] = useState<SEOCrawlerWorkflow | null>(null);
  const [workflowMemories, setWorkflowMemories] = useState<SEOWorkflowMemory[]>([]);
  const [crawlerSessions, setCrawlerSessions] = useState<CrawlerSession[]>([]);
  const [mlModels, setMlModels] = useState<MLModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSession, setSelectedSession] = useState<CrawlerSession | null>(null);
  const [selectedModel, setSelectedModel] = useState<MLModel | null>(null);
  const [isWorkflowModalVisible, setIsWorkflowModalVisible] = useState(false);
  const [isSessionDetailsVisible, setIsSessionDetailsVisible] = useState(false);
  const [isModelDetailsVisible, setIsModelDetailsVisible] = useState(false);
  const [realTimeMetrics, setRealTimeMetrics] = useState({
    activeCrawlers: 0,
    pagesPerSecond: 0,
    dataProcessed: 0,
    modelsTraining: 0
  });

  const [crawlerForm] = Form.useForm();
  const [modelForm] = Form.useForm();

  // Initialize with sample data
  useEffect(() => {
    const sampleSessions: CrawlerSession[] = [
      {
        id: 'session_1',
        status: 'completed',
        startTime: new Date('2024-10-29T10:00:00'),
        endTime: new Date('2024-10-29T10:30:00'),
        config: {
          targetUrls: ['https://example.com', 'https://httpbin.org'],
          crawlDepth: 2,
          maxPages: 100,
          delayBetweenRequests: 1000,
          userAgent: 'LightDom Crawler/1.0',
          respectRobotsTxt: true,
          extractStructuredData: true,
          analyzePerformance: true,
          generateReports: true
        },
        progress: {
          pagesCrawled: 87,
          pagesQueued: 0,
          errors: 3,
          dataExtracted: 1247
        },
        results: {
          optimizations: [
            { type: 'unused_css', savings: '45KB', url: 'https://example.com' },
            { type: 'missing_alt', count: 12, url: 'https://example.com' }
          ],
          performanceMetrics: { avgLoadTime: 2.3, totalSize: '1.2MB' },
          structuredData: []
        }
      }
    ];

    const sampleModels: MLModel[] = [
      {
        id: 'model_1',
        name: 'SEO Score Predictor',
        type: 'regression',
        algorithm: 'Random Forest',
        status: 'deployed',
        accuracy: 0.87,
        trainingDataSize: 10000,
        features: ['page_size', 'load_time', 'mobile_friendly', 'structured_data'],
        createdAt: new Date('2024-10-28'),
        lastTrained: new Date('2024-10-29'),
        performance: {
          mse: 0.023,
          r2Score: 0.87
        }
      },
      {
        id: 'model_2',
        name: 'Content Optimizer',
        type: 'nlp',
        algorithm: 'BERT',
        status: 'training',
        trainingDataSize: 5000,
        features: ['content_length', 'keyword_density', 'readability_score'],
        createdAt: new Date('2024-10-29'),
        performance: {}
      }
    ];

    setCrawlerSessions(sampleSessions);
    setMlModels(sampleModels);

    // Simulate real-time metrics
    const interval = setInterval(() => {
      setRealTimeMetrics({
        activeCrawlers: Math.floor(Math.random() * 5),
        pagesPerSecond: Math.random() * 10,
        dataProcessed: Math.floor(Math.random() * 1000),
        modelsTraining: Math.floor(Math.random() * 3)
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Workflow Memory Management
  const createWorkflowMemory = useCallback((
    type: SEOWorkflowMemory['type'],
    action: string,
    details: any,
    sessionId?: string,
    status: SEOWorkflowMemory['status'] = 'success',
    metrics?: SEOWorkflowMemory['metrics']
  ): SEOWorkflowMemory => {
    const memory: SEOWorkflowMemory = {
      id: `seo_memory_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      timestamp: new Date(),
      sessionId,
      action,
      details,
      status,
      workflowId: activeWorkflow?.id || 'system',
      metrics
    };

    setWorkflowMemories(prev => [memory, ...prev]);
    return memory;
  }, [activeWorkflow]);

  // Workflow Creation Functions
  const createSEOCrawlerWorkflow = useCallback((config: SEOCrawlerConfig): SEOCrawlerWorkflow => {
    const workflow: SEOCrawlerWorkflow = {
      id: `seo_workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'seo_crawler',
      steps: [
        {
          id: 'step_1',
          title: 'Initialize Crawler',
          description: 'Set up crawler configuration and validate targets',
          status: 'process'
        },
        {
          id: 'step_2',
          title: 'Start Crawling',
          description: 'Begin crawling target URLs and extracting data',
          status: 'wait'
        },
        {
          id: 'step_3',
          title: 'Extract Structured Data',
          description: 'Parse schema.org and other structured data',
          status: 'wait'
        },
        {
          id: 'step_4',
          title: 'Analyze Performance',
          description: 'Run performance analysis and optimization detection',
          status: 'wait'
        },
        {
          id: 'step_5',
          title: 'Generate Reports',
          description: 'Create comprehensive SEO and performance reports',
          status: 'wait'
        },
        {
          id: 'step_6',
          title: 'Store Results',
          description: 'Save all crawled data and analysis results',
          status: 'wait'
        }
      ],
      currentStep: 0,
      status: 'active',
      createdAt: new Date(),
      config,
      memories: []
    };

    setActiveWorkflow(workflow);
    createWorkflowMemory('crawler_start', 'SEO crawler workflow initialized', { config }, undefined, 'pending');
    return workflow;
  }, [createWorkflowMemory]);

  const createModelTrainingWorkflow = useCallback((modelConfig: any): SEOCrawlerWorkflow => {
    const workflow: SEOCrawlerWorkflow = {
      id: `training_workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'model_training',
      steps: [
        {
          id: 'step_1',
          title: 'Prepare Training Data',
          description: 'Load and preprocess training datasets',
          status: 'process'
        },
        {
          id: 'step_2',
          title: 'Feature Engineering',
          description: 'Extract and transform features for model training',
          status: 'wait'
        },
        {
          id: 'step_3',
          title: 'Train Model',
          description: 'Execute model training with selected algorithm',
          status: 'wait'
        },
        {
          id: 'step_4',
          title: 'Validate Model',
          description: 'Cross-validate and evaluate model performance',
          status: 'wait'
        },
        {
          id: 'step_5',
          title: 'Deploy Model',
          description: 'Deploy trained model to production',
          status: 'wait'
        }
      ],
      currentStep: 0,
      status: 'active',
      createdAt: new Date(),
      config: modelConfig,
      memories: []
    };

    setActiveWorkflow(workflow);
    createWorkflowMemory('model_training', 'Model training workflow initialized', { modelConfig }, undefined, 'pending');
    return workflow;
  }, [createWorkflowMemory]);

  // Workflow Execution Functions
  const executeWorkflowStep = useCallback(async (workflow: SEOCrawlerWorkflow, stepIndex: number) => {
    setLoading(true);

    try {
      // Update step status to processing
      const updatedWorkflow = {
        ...workflow,
        steps: workflow.steps.map((s, i) =>
          i === stepIndex ? { ...s, status: 'process' as const } : s
        ),
        currentStep: stepIndex
      };

      setActiveWorkflow(updatedWorkflow);

      // Simulate step execution
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Execute step logic based on workflow type
      if (workflow.type === 'seo_crawler') {
        await executeCrawlerStep(updatedWorkflow, stepIndex);
      } else if (workflow.type === 'model_training') {
        await executeTrainingStep(updatedWorkflow, stepIndex);
      }

      // Mark step as completed
      const completedWorkflow = {
        ...updatedWorkflow,
        steps: updatedWorkflow.steps.map((s, i) =>
          i === stepIndex ? { ...s, status: 'finish' as const } : s
        )
      };

      // Move to next step or complete workflow
      if (stepIndex < workflow.steps.length - 1) {
        completedWorkflow.currentStep = stepIndex + 1;
        completedWorkflow.steps[stepIndex + 1].status = 'process';
      } else {
        completedWorkflow.status = 'completed';
        completedWorkflow.completedAt = new Date();

        if (workflow.type === 'seo_crawler') {
          createWorkflowMemory('crawler_complete', 'SEO crawler workflow completed', {
            workflowId: workflow.id,
            totalSteps: workflow.steps.length
          }, undefined, 'success', { pagesCrawled: 87, dataProcessed: 1247 });
        } else {
          createWorkflowMemory('model_evaluation', 'Model training workflow completed', {
            workflowId: workflow.id,
            totalSteps: workflow.steps.length
          }, undefined, 'success', { modelAccuracy: 0.87 });
        }
      }

      setActiveWorkflow(completedWorkflow);

    } catch (error) {
      // Mark step as error
      const errorWorkflow = {
        ...workflow,
        steps: workflow.steps.map((s, i) =>
          i === stepIndex ? { ...s, status: 'error' as const } : s
        ),
        status: 'failed' as const
      };

      setActiveWorkflow(errorWorkflow);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      createWorkflowMemory('crawler_progress', 'Workflow step failed', {
        workflowId: workflow.id,
        stepIndex,
        error: errorMessage
      }, undefined, 'error');

      message.error(`Step ${stepIndex + 1} failed: ${errorMessage}`);
    }

    setLoading(false);
  }, []);

  const executeCrawlerStep = async (workflow: SEOCrawlerWorkflow, stepIndex: number) => {
    const config = workflow.config as SEOCrawlerConfig;

    switch (stepIndex) {
      case 0: // Initialize Crawler
        createWorkflowMemory('crawler_start', 'Crawler initialized', { config }, undefined, 'running');
        break;

      case 1: // Start Crawling
        // Create new crawler session
        const session: CrawlerSession = {
          id: `session_${Date.now()}`,
          status: 'running',
          startTime: new Date(),
          config,
          progress: {
            pagesCrawled: 0,
            pagesQueued: config.targetUrls.length,
            errors: 0,
            dataExtracted: 0
          }
        };
        setCrawlerSessions(prev => [...prev, session]);
        createWorkflowMemory('crawler_progress', 'Crawling started', { sessionId: session.id }, session.id, 'running', { pagesCrawled: 0 });
        break;

      case 2: // Extract Structured Data
        createWorkflowMemory('data_processing', 'Structured data extraction completed', {
          structuredDataCount: 15
        }, undefined, 'success', { dataProcessed: 450 });
        break;

      case 3: // Analyze Performance
        createWorkflowMemory('optimization_applied', 'Performance analysis completed', {
          optimizationsFound: 23
        }, undefined, 'success', { optimizationsApplied: 23 });
        break;

      case 4: // Generate Reports
        createWorkflowMemory('crawler_progress', 'Reports generated', {
          reportTypes: ['seo', 'performance', 'accessibility']
        }, undefined, 'success');
        break;

      case 5: // Store Results
        createWorkflowMemory('crawler_complete', 'Results stored in database', {
          totalRecords: 1247
        }, undefined, 'success', { dataProcessed: 1247 });
        message.success('SEO crawling workflow completed successfully!');
        break;
    }
  };

  const executeTrainingStep = async (workflow: SEOCrawlerWorkflow, stepIndex: number) => {
    switch (stepIndex) {
      case 0: // Prepare Training Data
        createWorkflowMemory('data_processing', 'Training data prepared', {
          datasetSize: 10000,
          features: 15
        }, undefined, 'success', { dataProcessed: 10000 });
        break;

      case 1: // Feature Engineering
        createWorkflowMemory('data_processing', 'Features engineered', {
          featureCount: 25,
          transformations: ['scaling', 'encoding', 'selection']
        }, undefined, 'success');
        break;

      case 2: // Train Model
        createWorkflowMemory('model_training', 'Model training started', {
          algorithm: 'Random Forest',
          parameters: { n_estimators: 100, max_depth: 10 }
        }, undefined, 'running');
        break;

      case 3: // Validate Model
        createWorkflowMemory('model_evaluation', 'Model validation completed', {
          accuracy: 0.87,
          crossValidationScore: 0.85
        }, undefined, 'success', { modelAccuracy: 0.87 });
        break;

      case 4: // Deploy Model
        const newModel: MLModel = {
          id: `model_${Date.now()}`,
          name: (workflow.config as MLModelTrainingConfig)?.name || 'New Model',
          type: (workflow.config as MLModelTrainingConfig)?.type || 'regression',
          algorithm: (workflow.config as MLModelTrainingConfig)?.algorithm || 'Random Forest',
          status: 'deployed',
          accuracy: 0.87,
          trainingDataSize: 10000,
          features: ['feature1', 'feature2', 'feature3'],
          createdAt: new Date(),
          lastTrained: new Date(),
          performance: {
            precision: 0.88,
            recall: 0.86,
            f1Score: 0.87
          }
        };
        setMlModels(prev => [...prev, newModel]);
        createWorkflowMemory('model_evaluation', 'Model deployed to production', {
          modelId: newModel.id
        }, undefined, 'success');
        message.success('Model training workflow completed successfully!');
        break;
    }
  };

  // Event Handlers
  const handleStartCrawlerWorkflow = () => {
    const config = crawlerForm.getFieldsValue();
    if (!config.targetUrls || config.targetUrls.length === 0) {
      message.error('Please add at least one target URL');
      return;
    }
    createSEOCrawlerWorkflow(config);
    setIsWorkflowModalVisible(true);
  };

  const handleStartTrainingWorkflow = () => {
    const config = modelForm.getFieldsValue();
    createModelTrainingWorkflow(config);
    setIsWorkflowModalVisible(true);
  };

  const handleWorkflowStepComplete = () => {
    if (activeWorkflow && activeWorkflow.currentStep < activeWorkflow.steps.length) {
      executeWorkflowStep(activeWorkflow, activeWorkflow.currentStep);
    }
  };

  const handleCancelWorkflow = () => {
    if (activeWorkflow) {
      const cancelledWorkflow = {
        ...activeWorkflow,
        status: 'cancelled' as const,
        completedAt: new Date()
      };

      createWorkflowMemory('crawler_progress', 'Workflow cancelled', {
        workflowId: activeWorkflow.id,
        cancelledAt: new Date()
      }, undefined, 'error');

      setActiveWorkflow(cancelledWorkflow);
    }
    setIsWorkflowModalVisible(false);
    crawlerForm.resetFields();
    modelForm.resetFields();
  };

  const handleViewSessionDetails = (session: CrawlerSession) => {
    setSelectedSession(session);
    setIsSessionDetailsVisible(true);
  };

  const handleViewModelDetails = (model: MLModel) => {
    setSelectedModel(model);
    setIsModelDetailsVisible(true);
  };

  // Table columns
  const sessionColumns: ColumnsType<CrawlerSession> = [
    {
      title: 'Session ID',
      dataIndex: 'id',
      key: 'id',
      render: (id: string) => <Text code>{id}</Text>
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Badge
          status={
            status === 'running' ? 'processing' :
            status === 'completed' ? 'success' :
            status === 'error' ? 'error' : 'default'
          }
          text={status.toUpperCase()}
        />
      )
    },
    {
      title: 'Progress',
      key: 'progress',
      render: (record: CrawlerSession) => (
        <div>
          <Progress
            percent={Math.round((record.progress.pagesCrawled / (record.progress.pagesCrawled + record.progress.pagesQueued)) * 100)}
            size="small"
            status={record.status === 'error' ? 'exception' : record.status === 'running' ? 'active' : 'success'}
          />
          <Text style={{ fontSize: '12px' }}>
            {record.progress.pagesCrawled} pages crawled
          </Text>
        </div>
      )
    },
    {
      title: 'Started',
      dataIndex: 'startTime',
      key: 'startTime',
      render: (time?: Date) => time ? time.toLocaleString() : 'N/A'
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: CrawlerSession) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              type="text"
              icon={<EyeOutlined />}
              size="small"
              onClick={() => handleViewSessionDetails(record)}
            />
          </Tooltip>
          {record.status === 'running' && (
            <Tooltip title="Stop Session">
              <Button
                type="text"
                danger
                icon={<CloseCircleOutlined />}
                size="small"
              />
            </Tooltip>
          )}
        </Space>
      )
    }
  ];

  const modelColumns: ColumnsType<MLModel> = [
    {
      title: 'Model Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => <Text strong>{name}</Text>
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag color={
          type === 'regression' ? 'blue' :
          type === 'classification' ? 'green' :
          type === 'nlp' ? 'purple' : 'orange'
        }>
          {type.toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Badge
          status={
            status === 'deployed' ? 'success' :
            status === 'training' ? 'processing' :
            status === 'failed' ? 'error' : 'default'
          }
          text={status.toUpperCase()}
        />
      )
    },
    {
      title: 'Accuracy',
      dataIndex: 'accuracy',
      key: 'accuracy',
      render: (accuracy?: number) => accuracy ? `${(accuracy * 100).toFixed(1)}%` : 'N/A'
    },
    {
      title: 'Training Size',
      dataIndex: 'trainingDataSize',
      key: 'trainingDataSize',
      render: (size: number) => `${size.toLocaleString()} samples`
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: MLModel) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              type="text"
              icon={<EyeOutlined />}
              size="small"
              onClick={() => handleViewModelDetails(record)}
            />
          </Tooltip>
          {record.status === 'training' && (
            <Tooltip title="Stop Training">
              <Button
                type="text"
                danger
                icon={<CloseCircleOutlined />}
                size="small"
              />
            </Tooltip>
          )}
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>
          <GlobalOutlined /> SEO Crawler & ML Training Workflow
        </Title>
        <Text type="secondary">
          Complete SEO crawling, data processing, and machine learning model training with intelligent workflows
        </Text>
      </div>

      {/* Real-time Metrics */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Active Crawlers"
              value={realTimeMetrics.activeCrawlers}
              prefix={<DesktopOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Pages/Second"
              value={realTimeMetrics.pagesPerSecond.toFixed(1)}
              prefix={<BarChartOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Data Processed"
              value={realTimeMetrics.dataProcessed}
              prefix={<DatabaseOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Models Training"
              value={realTimeMetrics.modelsTraining}
              prefix={<ExperimentOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      <Tabs defaultActiveKey="1">
        <TabPane tab="Crawler Sessions" key="1">
          <Card>
            {/* Action Bar */}
            <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
              <Space wrap>
                <Button
                  type="primary"
                  icon={<PlayCircleOutlined />}
                  onClick={() => setIsWorkflowModalVisible(true)}
                  size="large"
                >
                  Start SEO Crawler
                </Button>
              </Space>
              <Space wrap>
                <Button icon={<SyncOutlined />}>
                  Refresh
                </Button>
              </Space>
            </div>

            {/* Sessions Table */}
            <Table
              columns={sessionColumns}
              dataSource={crawlerSessions}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} sessions`
              }}
            />
          </Card>
        </TabPane>

        <TabPane tab="ML Models" key="2">
          <Card>
            {/* Action Bar */}
            <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
              <Space wrap>
                <Button
                  type="primary"
                  icon={<ExperimentOutlined />}
                  onClick={() => {
                    setActiveWorkflow(null);
                    setIsWorkflowModalVisible(true);
                  }}
                  size="large"
                >
                  Train New Model
                </Button>
              </Space>
              <Space wrap>
                <Button icon={<SyncOutlined />}>
                  Refresh Models
                </Button>
              </Space>
            </div>

            {/* Models Table */}
            <Table
              columns={modelColumns}
              dataSource={mlModels}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} models`
              }}
            />
          </Card>
        </TabPane>

        <TabPane tab="Workflow Memories" key="3">
          <AdvancedMemoryLogger
            memories={workflowMemories}
            onMemorySelect={(memory) => {
              // Handle memory selection for replay or analysis
              message.info(`Selected memory: ${memory.action}`);
            }}
            onMemoryReplay={(memory) => {
              // Handle workflow replay from memory
              message.info(`Replaying workflow from memory: ${memory.action}`);
            }}
          />
        </TabPane>

        <TabPane tab="Active Workflows" key="4">
          <Card>
            <Title level={4}>Active SEO Workflows</Title>
            {activeWorkflow ? (
              <div>
                <Alert
                  message={`Active: ${activeWorkflow.type.replace('_', ' ').toUpperCase()} Workflow`}
                  description={`Workflow ID: ${activeWorkflow.id}`}
                  type="info"
                  showIcon
                  style={{ marginBottom: '16px' }}
                />

                <Steps current={activeWorkflow.currentStep} direction="vertical">
                  {activeWorkflow.steps.map((step) => (
                    <Step
                      key={step.id}
                      title={step.title}
                      description={step.description}
                      status={step.status}
                      icon={step.status === 'process' ? <LoadingOutlined /> : undefined}
                    />
                  ))}
                </Steps>

                <div style={{ marginTop: '24px', textAlign: 'center' }}>
                  <Space>
                    <Button
                      type="primary"
                      onClick={handleWorkflowStepComplete}
                      loading={loading}
                      disabled={activeWorkflow.status !== 'active'}
                    >
                      {activeWorkflow.currentStep < activeWorkflow.steps.length - 1 ?
                        'Execute Next Step' : 'Complete Workflow'}
                    </Button>
                    <Button onClick={handleCancelWorkflow}>
                      Cancel Workflow
                    </Button>
                  </Space>
                </div>
              </div>
            ) : (
              <Alert
                message="No Active Workflow"
                description="Start an SEO crawler or ML training workflow to see it here"
                type="info"
                showIcon
              />
            )}
          </Card>
        </TabPane>
      </Tabs>

      {/* Workflow Modal */}
      <Modal
        title={
          <Space>
            <ThunderboltOutlined />
            {activeWorkflow?.type === 'seo_crawler' ? 'SEO Crawler' : 'ML Model Training'} Workflow
          </Space>
        }
        open={isWorkflowModalVisible}
        onCancel={handleCancelWorkflow}
        footer={null}
        width={800}
        maskClosable={false}
      >
        {(!activeWorkflow || activeWorkflow.type === 'seo_crawler') && (
          <Form form={crawlerForm} layout="vertical">
            <Title level={5}>Crawler Configuration</Title>
            <Form.Item
              name="targetUrls"
              label="Target URLs"
              rules={[{ required: true, message: 'Please add at least one URL' }]}
            >
              <Select mode="tags" placeholder="Enter URLs to crawl" />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="crawlDepth" label="Crawl Depth" initialValue={2}>
                  <InputNumber min={1} max={10} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="maxPages" label="Max Pages" initialValue={100}>
                  <InputNumber min={1} max={10000} />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="delayBetweenRequests" label="Delay (ms)" initialValue={1000}>
                  <InputNumber min={0} max={10000} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="userAgent" label="User Agent" initialValue="LightDom Crawler/1.0">
                  <Input />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="respectRobotsTxt" valuePropName="checked" initialValue={true}>
              <Checkbox>Respect robots.txt</Checkbox>
            </Form.Item>

            <Form.Item name="extractStructuredData" valuePropName="checked" initialValue={true}>
              <Checkbox>Extract structured data</Checkbox>
            </Form.Item>

            <Form.Item name="analyzePerformance" valuePropName="checked" initialValue={true}>
              <Checkbox>Analyze performance</Checkbox>
            </Form.Item>

            <Divider />

            <div style={{ textAlign: 'center' }}>
              <Space>
                <Button
                  type="primary"
                  onClick={handleStartCrawlerWorkflow}
                  size="large"
                >
                  Start SEO Crawler Workflow
                  <RightOutlined />
                </Button>
                <Button onClick={handleCancelWorkflow} size="large">
                  Cancel
                </Button>
              </Space>
            </div>
          </Form>
        )}

        {activeWorkflow?.type === 'model_training' && (
          <Form form={modelForm} layout="vertical">
            <Title level={5}>Model Training Configuration</Title>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="name"
                  label="Model Name"
                  rules={[{ required: true, message: 'Please enter model name' }]}
                >
                  <Input placeholder="SEO Score Predictor" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="type"
                  label="Model Type"
                  rules={[{ required: true, message: 'Please select model type' }]}
                >
                  <Select>
                    <Select.Option value="regression">Regression</Select.Option>
                    <Select.Option value="classification">Classification</Select.Option>
                    <Select.Option value="nlp">NLP</Select.Option>
                    <Select.Option value="clustering">Clustering</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="algorithm"
                  label="Algorithm"
                  rules={[{ required: true, message: 'Please select algorithm' }]}
                >
                  <Select>
                    <Select.Option value="Random Forest">Random Forest</Select.Option>
                    <Select.Option value="SVM">SVM</Select.Option>
                    <Select.Option value="Neural Network">Neural Network</Select.Option>
                    <Select.Option value="BERT">BERT</Select.Option>
                    <Select.Option value="XGBoost">XGBoost</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="trainingDataSize" label="Training Data Size" initialValue={10000}>
                  <InputNumber min={100} max={100000} />
                </Form.Item>
              </Col>
            </Row>

            <Divider />

            <div style={{ textAlign: 'center' }}>
              <Space>
                <Button
                  type="primary"
                  onClick={handleStartTrainingWorkflow}
                  size="large"
                >
                  Start Model Training Workflow
                  <RightOutlined />
                </Button>
                <Button onClick={handleCancelWorkflow} size="large">
                  Cancel
                </Button>
              </Space>
            </div>
          </Form>
        )}
      </Modal>

      {/* Session Details Drawer */}
      <Drawer
        title={
          <Space>
            <GlobalOutlined />
            Crawler Session Details
          </Space>
        }
        placement="right"
        onClose={() => setIsSessionDetailsVisible(false)}
        open={isSessionDetailsVisible}
        width={600}
      >
        {selectedSession && (
          <Tabs defaultActiveKey="1">
            <TabPane tab="Overview" key="1">
              <Descriptions column={1} bordered>
                <Descriptions.Item label="Session ID">
                  <Text code>{selectedSession.id}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Status">
                  <Badge
                    status={
                      selectedSession.status === 'running' ? 'processing' :
                      selectedSession.status === 'completed' ? 'success' :
                      selectedSession.status === 'error' ? 'error' : 'default'
                    }
                    text={selectedSession.status.toUpperCase()}
                  />
                </Descriptions.Item>
                <Descriptions.Item label="Started">
                  {selectedSession.startTime?.toLocaleString() || 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="Completed">
                  {selectedSession.endTime?.toLocaleString() || 'N/A'}
                </Descriptions.Item>
              </Descriptions>

              <Divider />

              <Title level={5}>Progress</Title>
              <Row gutter={16}>
                <Col span={12}>
                  <Statistic title="Pages Crawled" value={selectedSession.progress.pagesCrawled} />
                </Col>
                <Col span={12}>
                  <Statistic title="Pages Queued" value={selectedSession.progress.pagesQueued} />
                </Col>
                <Col span={12}>
                  <Statistic title="Errors" value={selectedSession.progress.errors} />
                </Col>
                <Col span={12}>
                  <Statistic title="Data Extracted" value={selectedSession.progress.dataExtracted} />
                </Col>
              </Row>
            </TabPane>

            <TabPane tab="Configuration" key="2">
              <Descriptions column={1} bordered>
                <Descriptions.Item label="Target URLs">
                  {selectedSession.config.targetUrls.join(', ')}
                </Descriptions.Item>
                <Descriptions.Item label="Crawl Depth">
                  {selectedSession.config.crawlDepth}
                </Descriptions.Item>
                <Descriptions.Item label="Max Pages">
                  {selectedSession.config.maxPages}
                </Descriptions.Item>
                <Descriptions.Item label="Delay">
                  {selectedSession.config.delayBetweenRequests}ms
                </Descriptions.Item>
                <Descriptions.Item label="User Agent">
                  {selectedSession.config.userAgent}
                </Descriptions.Item>
                <Descriptions.Item label="Respect Robots.txt">
                  {selectedSession.config.respectRobotsTxt ? 'Yes' : 'No'}
                </Descriptions.Item>
              </Descriptions>
            </TabPane>

            <TabPane tab="Results" key="3">
              {selectedSession.results ? (
                <div>
                  <Title level={5}>Optimizations Found</Title>
                  <List
                    dataSource={selectedSession.results.optimizations}
                    renderItem={(item) => (
                      <List.Item>
                        <List.Item.Meta
                          title={item.type}
                          description={`Savings: ${item.savings || item.count} | URL: ${item.url}`}
                        />
                      </List.Item>
                    )}
                  />
                </div>
              ) : (
                <Text type="secondary">No results available yet</Text>
              )}
            </TabPane>
          </Tabs>
        )}
      </Drawer>

      {/* Model Details Drawer */}
      <Drawer
        title={
          <Space>
            <ExperimentOutlined />
            ML Model Details
          </Space>
        }
        placement="right"
        onClose={() => setIsModelDetailsVisible(false)}
        open={isModelDetailsVisible}
        width={600}
      >
        {selectedModel && (
          <Tabs defaultActiveKey="1">
            <TabPane tab="Overview" key="1">
              <Descriptions column={1} bordered>
                <Descriptions.Item label="Model ID">
                  <Text code>{selectedModel.id}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Name">
                  <Text strong>{selectedModel.name}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Type">
                  <Tag color={
                    selectedModel.type === 'regression' ? 'blue' :
                    selectedModel.type === 'classification' ? 'green' :
                    selectedModel.type === 'nlp' ? 'purple' : 'orange'
                  }>
                    {selectedModel.type.toUpperCase()}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Algorithm">
                  {selectedModel.algorithm}
                </Descriptions.Item>
                <Descriptions.Item label="Status">
                  <Badge
                    status={
                      selectedModel.status === 'deployed' ? 'success' :
                      selectedModel.status === 'training' ? 'processing' :
                      selectedModel.status === 'failed' ? 'error' : 'default'
                    }
                    text={selectedModel.status.toUpperCase()}
                  />
                </Descriptions.Item>
                <Descriptions.Item label="Accuracy">
                  {selectedModel.accuracy ? `${(selectedModel.accuracy * 100).toFixed(1)}%` : 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="Training Data Size">
                  {selectedModel.trainingDataSize.toLocaleString()} samples
                </Descriptions.Item>
                <Descriptions.Item label="Created">
                  {selectedModel.createdAt.toLocaleString()}
                </Descriptions.Item>
                <Descriptions.Item label="Last Trained">
                  {selectedModel.lastTrained?.toLocaleString() || 'Never'}
                </Descriptions.Item>
              </Descriptions>
            </TabPane>

            <TabPane tab="Performance" key="2">
              <Row gutter={16}>
                <Col span={12}>
                  <Card>
                    <Statistic
                      title="Precision"
                      value={selectedModel.performance.precision ? selectedModel.performance.precision * 100 : 0}
                      suffix="%"
                      precision={1}
                    />
                  </Card>
                </Col>
                <Col span={12}>
                  <Card>
                    <Statistic
                      title="Recall"
                      value={selectedModel.performance.recall ? selectedModel.performance.recall * 100 : 0}
                      suffix="%"
                      precision={1}
                    />
                  </Card>
                </Col>
                <Col span={12}>
                  <Card>
                    <Statistic
                      title="F1 Score"
                      value={selectedModel.performance.f1Score ? selectedModel.performance.f1Score * 100 : 0}
                      suffix="%"
                      precision={1}
                    />
                  </Card>
                </Col>
                <Col span={12}>
                  <Card>
                    <Statistic
                      title="MSE"
                      value={selectedModel.performance.mse || 0}
                      precision={4}
                    />
                  </Card>
                </Col>
              </Row>
            </TabPane>

            <TabPane tab="Features" key="3">
              <Title level={5}>Model Features</Title>
              <List
                dataSource={selectedModel.features}
                renderItem={(feature) => (
                  <List.Item>
                    <Tag color="blue">{feature}</Tag>
                  </List.Item>
                )}
              />
            </TabPane>
          </Tabs>
        )}
      </Drawer>
    </div>
  );
};

export default SEOCrawlerWorkflow;