/**
 * Advanced Automation Workflow System
 * Comprehensive workflow management with AI integration and real-time monitoring
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Row,
  Col,
  Typography,
  Button,
  Table,
  Tag,
  Space,
  Alert,
  Modal,
  message,
  Spin,
  Statistic,
  Divider,
  List,
  Avatar,
  Tooltip,
  Badge,
  Progress,
  Tabs,
  Form,
  Input,
  Select,
  InputNumber,
  DatePicker,
  Timeline,
  Empty,
  Switch,
  Drawer,
  Collapse,
  Tree,
  Transfer,
  Slider,
  Steps,
  Dropdown,
  MenuProps,
} from 'antd';
import {
  RobotOutlined,
  ThunderboltOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  StopOutlined,
  ReloadOutlined,
  SettingOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  DownloadOutlined,
  UploadOutlined,
  ShareAltOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  WarningOutlined,
  ClockCircleOutlined,
  SyncOutlined,
  ApiOutlined,
  DatabaseOutlined,
  CloudOutlined,
  LineChartOutlined,
  BarChartOutlined,
  PieChartOutlined,
  ExperimentOutlined,
  CodeOutlined,
  BugOutlined,
  SafetyOutlined,
  FileTextOutlined,
  FolderOutlined,
  LinkOutlined,
  DisconnectOutlined,
  NodeIndexOutlined,
  ClusterOutlined,
  GlobalOutlined,
  SearchOutlined,
  FilterOutlined,
  SortAscendingOutlined,
  CalendarOutlined,
  UserOutlined,
  TeamOutlined,
  MessageOutlined,
  BellOutlined,
  MailOutlined,
  PhoneOutlined,
  VideoCameraOutlined,
  AudioOutlined,
  CameraOutlined,
  ScreenshotOutlined,
  ScanOutlined,
  MonitorOutlined,
  DesktopOutlined,
  MobileOutlined,
  TabletOutlined,
  LaptopOutlined,
  HddOutlined,
  CloudServerOutlined,
  DeploymentUnitOutlined,
  RocketOutlined,
  TrophyOutlined,
  StarOutlined,
  CrownOutlined,
  DiamondOutlined,
  GiftOutlined,
  FireOutlined,
  HeartOutlined,
  BulbOutlined,
  LightbulbOutlined,
  ThunderboltFilled,
  PlayCircleFilled,
  PauseCircleFilled,
  StopFilled,
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { TextArea } = Input;
const { RangePicker } = DatePicker;
const { Panel } = Collapse;
const { DirectoryTree } = Tree;
const { Step } = Steps;

// Enhanced color system
const Colors = {
  primary: '#7c3aed',
  primaryLight: '#a78bfa',
  secondary: '#06b6d4',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
  surface: '#1f2937',
  surfaceLight: '#374151',
  background: '#111827',
  text: '#f9fafb',
  textSecondary: '#d1d5db',
  textTertiary: '#9ca3af',
  border: '#374151',
  gradients: {
    primary: 'linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)',
    secondary: 'linear-gradient(135deg, #06b6d4 0%, #67e8f9 100%)',
    success: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
    warning: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
    error: 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)',
  }
};

const Spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  xxl: '48px',
};

interface Workflow {
  id: string;
  name: string;
  description: string;
  category: 'seo' | 'mining' | 'blockchain' | 'metaverse' | 'automation' | 'testing' | 'deployment';
  status: 'active' | 'inactive' | 'running' | 'completed' | 'failed' | 'paused';
  priority: 'low' | 'medium' | 'high' | 'critical';
  progress: number;
  startTime: string;
  endTime?: string;
  duration?: number;
  steps: WorkflowStep[];
  triggers: WorkflowTrigger[];
  actions: WorkflowAction[];
  schedule?: WorkflowSchedule;
  metrics: WorkflowMetrics;
  logs: WorkflowLog[];
  errors: WorkflowError[];
}

interface WorkflowStep {
  id: string;
  name: string;
  type: 'trigger' | 'action' | 'condition' | 'loop' | 'parallel' | 'delay';
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  config: any;
  input?: any;
  output?: any;
  error?: string;
  duration?: number;
  retryCount?: number;
}

interface WorkflowTrigger {
  id: string;
  type: 'webhook' | 'schedule' | 'event' | 'manual' | 'api' | 'file' | 'database';
  config: any;
  enabled: boolean;
}

interface WorkflowAction {
  id: string;
  type: 'api_call' | 'database' | 'file' | 'email' | 'notification' | 'webhook' | 'script' | 'ai_process';
  config: any;
  enabled: boolean;
}

interface WorkflowSchedule {
  type: 'cron' | 'interval' | 'once' | 'recurring';
  expression: string;
  timezone: string;
  enabled: boolean;
}

interface WorkflowMetrics {
  totalRuns: number;
  successfulRuns: number;
  failedRuns: number;
  averageDuration: number;
  lastRunTime: string;
  nextRunTime?: string;
  successRate: number;
}

interface WorkflowLog {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'debug';
  message: string;
  stepId?: string;
  data?: any;
}

interface WorkflowError {
  id: string;
  timestamp: string;
  stepId: string;
  error: string;
  stack?: string;
  resolved: boolean;
}

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  estimatedTime: number;
  steps: Omit<WorkflowStep, 'id' | 'status' | 'duration' | 'retryCount'>[];
  tags: string[];
  rating: number;
  downloads: number;
}

const AutomationWorkflows: React.FC = () => {
  // State management
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('workflows');
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<WorkflowTemplate | null>(null);
  const [workflowModalVisible, setWorkflowModalVisible] = useState(false);
  const [templateModalVisible, setTemplateModalVisible] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [executionModalVisible, setExecutionModalVisible] = useState(false);

  // Form state
  const [workflowForm] = Form.useForm();
  const [templateForm] = Form.useForm();

  // Fetch workflows data
  const fetchWorkflowsData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Mock workflows data
      const mockWorkflows: Workflow[] = [
        {
          id: '1',
          name: 'SEO Content Generation Pipeline',
          description: 'Automated SEO content generation with AI optimization',
          category: 'seo',
          status: 'running',
          priority: 'high',
          progress: 75,
          startTime: new Date(Date.now() - 3600000).toISOString(),
          steps: [
            {
              id: '1',
              name: 'Fetch Target URLs',
              type: 'trigger',
              status: 'completed',
              config: { source: 'database', query: 'SELECT urls FROM targets' },
              output: { urls: ['https://example.com', 'https://test.com'] },
              duration: 5000,
            },
            {
              id: '2',
              name: 'Analyze SEO Data',
              type: 'action',
              status: 'completed',
              config: { analyzer: 'seo_v2', depth: 3 },
              output: { scores: [85, 92] },
              duration: 12000,
            },
            {
              id: '3',
              name: 'Generate Content',
              type: 'action',
              status: 'running',
              config: { model: 'gpt-4', temperature: 0.7 },
              duration: 30000,
            },
            {
              id: '4',
              name: 'Optimize for SEO',
              type: 'action',
              status: 'pending',
              config: { optimization_level: 'maximum' },
            },
            {
              id: '5',
              name: 'Publish Results',
              type: 'action',
              status: 'pending',
              config: { destinations: ['website', 'api', 'database'] },
            },
          ],
          triggers: [
            {
              id: '1',
              type: 'schedule',
              config: { cron: '0 */6 * * *', timezone: 'UTC' },
              enabled: true,
            },
          ],
          actions: [
            {
              id: '1',
              type: 'ai_process',
              config: { model: 'gpt-4', prompt: 'Generate SEO content' },
              enabled: true,
            },
            {
              id: '2',
              type: 'database',
              config: { table: 'seo_results', operation: 'insert' },
              enabled: true,
            },
          ],
          schedule: {
            type: 'cron',
            expression: '0 */6 * * *',
            timezone: 'UTC',
            enabled: true,
          },
          metrics: {
            totalRuns: 156,
            successfulRuns: 148,
            failedRuns: 8,
            averageDuration: 45000,
            lastRunTime: new Date(Date.now() - 3600000).toISOString(),
            nextRunTime: new Date(Date.now() + 21600000).toISOString(),
            successRate: 94.9,
          },
          logs: [
            {
              id: '1',
              timestamp: new Date().toISOString(),
              level: 'info',
              message: 'Workflow started successfully',
              data: { workflowId: '1' },
            },
            {
              id: '2',
              timestamp: new Date(Date.now() - 300000).toISOString(),
              level: 'info',
              message: 'Step 2 completed: Analyze SEO Data',
              stepId: '2',
            },
          ],
          errors: [],
        },
        {
          id: '2',
          name: 'Blockchain Mining Automation',
          description: 'Automated blockchain mining with optimization',
          category: 'mining',
          status: 'active',
          priority: 'critical',
          progress: 100,
          startTime: new Date(Date.now() - 7200000).toISOString(),
          endTime: new Date(Date.now() - 3600000).toISOString(),
          duration: 3600000,
          steps: [
            {
              id: '1',
              name: 'Check Mining Difficulty',
              type: 'trigger',
              status: 'completed',
              config: { network: 'ethereum', refresh_interval: 300 },
              output: { difficulty: 1.5, profitable: true },
              duration: 2000,
            },
            {
              id: '2',
              name: 'Start Mining Session',
              type: 'action',
              status: 'completed',
              config: { algorithm: 'ethash', intensity: 'high' },
              output: { hash_rate: 85, power_usage: 750 },
              duration: 3598000,
            },
            {
              id: '3',
              name: 'Monitor Performance',
              type: 'action',
              status: 'completed',
              config: { metrics: ['hash_rate', 'temperature', 'efficiency'] },
              output: { average_hash_rate: 82.5, efficiency: 94.2 },
              duration: 1000,
            },
          ],
          triggers: [
            {
              id: '1',
              type: 'event',
              config: { event: 'difficulty_change', threshold: 0.1 },
              enabled: true,
            },
          ],
          actions: [
            {
              id: '1',
              type: 'api_call',
              config: { endpoint: '/api/mining/start', method: 'POST' },
              enabled: true,
            },
          ],
          metrics: {
            totalRuns: 89,
            successfulRuns: 87,
            failedRuns: 2,
            averageDuration: 1800000,
            lastRunTime: new Date(Date.now() - 3600000).toISOString(),
            successRate: 97.8,
          },
          logs: [
            {
              id: '1',
              timestamp: new Date(Date.now() - 7200000).toISOString(),
              level: 'info',
              message: 'Mining session started',
              data: { difficulty: 1.5 },
            },
            {
              id: '2',
              timestamp: new Date(Date.now() - 3600000).toISOString(),
              level: 'info',
              message: 'Mining session completed successfully',
              data: { blocks_mined: 3, rewards: 150 },
            },
          ],
          errors: [],
        },
        {
          id: '3',
          name: 'Metaverse Bridge Monitor',
          description: 'Monitor and maintain metaverse bridge connections',
          category: 'metaverse',
          status: 'inactive',
          priority: 'medium',
          progress: 0,
          steps: [
            {
              id: '1',
              name: 'Check Bridge Status',
              type: 'trigger',
              status: 'pending',
              config: { bridges: ['alpha', 'beta', 'gamma'] },
            },
            {
              id: '2',
              name: 'Analyze Performance',
              type: 'action',
              status: 'pending',
              config: { metrics: ['latency', 'bandwidth', 'uptime'] },
            },
            {
              id: '3',
              name: 'Send Alerts',
              type: 'action',
              status: 'pending',
              config: { channels: ['email', 'slack', 'discord'] },
            },
          ],
          triggers: [
            {
              id: '1',
              type: 'schedule',
              config: { cron: '*/5 * * * *', timezone: 'UTC' },
              enabled: false,
            },
          ],
          actions: [
            {
              id: '1',
              type: 'notification',
              config: { type: 'alert', severity: 'warning' },
              enabled: true,
            },
          ],
          schedule: {
            type: 'cron',
            expression: '*/5 * * * *',
            timezone: 'UTC',
            enabled: false,
          },
          metrics: {
            totalRuns: 245,
            successfulRuns: 242,
            failedRuns: 3,
            averageDuration: 15000,
            lastRunTime: new Date(Date.now() - 86400000).toISOString(),
            successRate: 98.8,
          },
          logs: [],
          errors: [
            {
              id: '1',
              timestamp: new Date(Date.now() - 86400000).toISOString(),
              stepId: '2',
              error: 'Failed to connect to bridge gamma',
              stack: 'Connection timeout after 30 seconds',
              resolved: true,
            },
          ],
        },
      ];
      
      setWorkflows(mockWorkflows);
      
      // Mock templates
      const mockTemplates: WorkflowTemplate[] = [
        {
          id: '1',
          name: 'SEO Analysis Template',
          description: 'Complete SEO analysis workflow with reporting',
          category: 'seo',
          difficulty: 'intermediate',
          estimatedTime: 30,
          steps: [
            {
              name: 'Fetch URLs',
              type: 'trigger',
              config: { source: 'sitemap' },
            },
            {
              name: 'Analyze Content',
              type: 'action',
              config: { tools: ['semrush', 'ahrefs'] },
            },
            {
              name: 'Generate Report',
              type: 'action',
              config: { format: 'pdf', template: 'seo_report' },
            },
          ],
          tags: ['seo', 'analysis', 'reporting'],
          rating: 4.8,
          downloads: 1250,
        },
        {
          id: '2',
          name: 'Mining Optimization',
          description: 'Optimize mining parameters for maximum efficiency',
          category: 'mining',
          difficulty: 'advanced',
          estimatedTime: 60,
          steps: [
            {
              name: 'Monitor Network',
              type: 'trigger',
              config: { network: 'ethereum' },
            },
            {
              name: 'Adjust Parameters',
              type: 'action',
              config: { auto_tune: true },
            },
            {
              name: 'Log Performance',
              type: 'action',
              config: { metrics: 'all' },
            },
          ],
          tags: ['mining', 'optimization', 'automation'],
          rating: 4.6,
          downloads: 890,
        },
        {
          id: '3',
          name: 'Content Publishing',
          description: 'Automated content publishing to multiple platforms',
          category: 'automation',
          difficulty: 'beginner',
          estimatedTime: 15,
          steps: [
            {
              name: 'Generate Content',
              type: 'action',
              config: { ai_model: 'gpt-4' },
            },
            {
              name: 'Review Content',
              type: 'condition',
              config: { approval_required: true },
            },
            {
              name: 'Publish to Platforms',
              type: 'action',
              config: { platforms: ['wordpress', 'medium', 'linkedin'] },
            },
          ],
          tags: ['content', 'publishing', 'social'],
          rating: 4.5,
          downloads: 2100,
        },
      ];
      
      setTemplates(mockTemplates);
      
    } catch (error) {
      console.error('Failed to fetch workflows data:', error);
      message.error('Failed to load workflows data');
    } finally {
      setLoading(false);
    }
  }, []);

  // Execute workflow
  const executeWorkflow = useCallback(async (workflowId: string) => {
    try {
      setLoading(true);
      
      // Mock execution
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setWorkflows(prev => prev.map(w => 
        w.id === workflowId ? { ...w, status: 'running' as const, progress: 0 } : w
      ));
      
      message.success('Workflow execution started!');
      
      // Simulate progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        setWorkflows(prev => prev.map(w => 
          w.id === workflowId ? { ...w, progress } : w
        ));
        
        if (progress >= 100) {
          clearInterval(interval);
          setWorkflows(prev => prev.map(w => 
            w.id === workflowId ? { 
              ...w, 
              status: 'completed' as const, 
              endTime: new Date().toISOString(),
              metrics: {
                ...w.metrics,
                totalRuns: w.metrics.totalRuns + 1,
                successfulRuns: w.metrics.successfulRuns + 1,
                lastRunTime: new Date().toISOString(),
                successRate: ((w.metrics.successfulRuns + 1) / (w.metrics.totalRuns + 1)) * 100,
              }
            } : w
          ));
          message.success('Workflow completed successfully!');
        }
      }, 1000);
      
    } catch (error) {
      console.error('Failed to execute workflow:', error);
      message.error('Failed to execute workflow');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize component
  useEffect(() => {
    fetchWorkflowsData();
  }, [fetchWorkflowsData]);

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return Colors.success;
      case 'inactive': return Colors.textTertiary;
      case 'running': return Colors.primary;
      case 'completed': return Colors.success;
      case 'failed': return Colors.error;
      case 'paused': return Colors.warning;
      default: return Colors.textTertiary;
    }
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return Colors.error;
      case 'high': return Colors.warning;
      case 'medium': return Colors.info;
      case 'low': return Colors.textTertiary;
      default: return Colors.textTertiary;
    }
  };

  // Get category color
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'seo': return Colors.primary;
      case 'mining': return Colors.warning;
      case 'blockchain': return Colors.success;
      case 'metaverse': return Colors.secondary;
      case 'automation': return Colors.info;
      case 'testing': return Colors.error;
      case 'deployment': return Colors.textTertiary;
      default: return Colors.textTertiary;
    }
  };

  // Render workflows tab
  const renderWorkflows = () => (
    <Row gutter={[Spacing.lg, Spacing.lg]}>
      <Col xs={24} lg={16}>
        <Card
          title={
            <Space>
              <RobotOutlined style={{ color: Colors.primary }} />
              <span>Active Workflows</span>
            </Space>
          }
          extra={
            <Space>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setWorkflowModalVisible(true)}
              >
                Create Workflow
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={fetchWorkflowsData}
              >
                Refresh
              </Button>
            </Space>
          }
          style={{
            backgroundColor: Colors.surface,
            border: `1px solid ${Colors.border}`,
            borderRadius: '12px',
          }}
        >
          <Table
            dataSource={workflows}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10 }}
            columns={[
              {
                title: 'Workflow',
                dataIndex: 'name',
                key: 'name',
                render: (name: string, record: Workflow) => (
                  <Space direction="vertical" size={0}>
                    <Text style={{ color: Colors.text, fontWeight: 500 }}>{name}</Text>
                    <Text style={{ color: Colors.textTertiary, fontSize: '12px' }}>
                      {record.description}
                    </Text>
                  </Space>
                ),
              },
              {
                title: 'Category',
                dataIndex: 'category',
                key: 'category',
                render: (category: string) => (
                  <Tag color={getCategoryColor(category)}>
                    {category.toUpperCase()}
                  </Tag>
                ),
              },
              {
                title: 'Status',
                dataIndex: 'status',
                key: 'status',
                render: (status: string, record: Workflow) => (
                  <Space direction="vertical" size={0}>
                    <Tag color={getStatusColor(status)}>
                      {status.toUpperCase()}
                    </Tag>
                    {status === 'running' && (
                      <Progress
                        percent={record.progress}
                        size="small"
                        strokeColor={Colors.gradients.primary}
                      />
                    )}
                  </Space>
                ),
              },
              {
                title: 'Priority',
                dataIndex: 'priority',
                key: 'priority',
                render: (priority: string) => (
                  <Tag color={getPriorityColor(priority)}>
                    {priority.toUpperCase()}
                  </Tag>
                ),
              },
              {
                title: 'Success Rate',
                key: 'successRate',
                render: (_, record: Workflow) => (
                  <Space direction="vertical" size={0}>
                    <Text style={{ color: Colors.text }}>
                      {record.metrics.successRate.toFixed(1)}%
                    </Text>
                    <Text style={{ color: Colors.textTertiary, fontSize: '12px' }}>
                      {record.metrics.successfulRuns}/{record.metrics.totalRuns} runs
                    </Text>
                  </Space>
                ),
              },
              {
                title: 'Actions',
                key: 'actions',
                render: (_, record: Workflow) => (
                  <Space>
                    <Button
                      type="link"
                      icon={<EyeOutlined />}
                      onClick={() => setSelectedWorkflow(record)}
                    >
                      View
                    </Button>
                    <Button
                      type="link"
                      icon={<PlayCircleOutlined />}
                      disabled={record.status === 'running'}
                      onClick={() => executeWorkflow(record.id)}
                    >
                      Run
                    </Button>
                    <Dropdown
                      menu={{
                        items: [
                          {
                            key: 'edit',
                            label: 'Edit',
                            icon: <EditOutlined />,
                            onClick: () => message.info('Edit workflow'),
                          },
                          {
                            key: 'duplicate',
                            label: 'Duplicate',
                            icon: <CopyOutlined />,
                            onClick: () => message.info('Duplicate workflow'),
                          },
                          {
                            key: 'delete',
                            label: 'Delete',
                            icon: <DeleteOutlined />,
                            danger: true,
                            onClick: () => message.info('Delete workflow'),
                          },
                        ],
                      }}
                    >
                      <Button type="link" icon={<SettingOutlined />} />
                    </Dropdown>
                  </Space>
                ),
              },
            ]}
          />
        </Card>
      </Col>
      
      <Col xs={24} lg={8}>
        <Space direction="vertical" style={{ width: '100%' }} size={Spacing.lg}>
          <Card
            title={
              <Space>
                <BarChartOutlined style={{ color: Colors.info }} />
                <span>Workflow Statistics</span>
              </Space>
            }
            style={{
              backgroundColor: Colors.surface,
              border: `1px solid ${Colors.border}`,
              borderRadius: '12px',
            }}
          >
            <Space direction="vertical" style={{ width: '100%' }} size={Spacing.md}>
              <Statistic
                title="Total Workflows"
                value={workflows.length}
                prefix={<RobotOutlined />}
                valueStyle={{ color: Colors.primary }}
              />
              <Statistic
                title="Active Workflows"
                value={workflows.filter(w => w.status === 'active' || w.status === 'running').length}
                prefix={<PlayCircleOutlined />}
                valueStyle={{ color: Colors.success }}
              />
              <Statistic
                title="Total Runs"
                value={workflows.reduce((sum, w) => sum + w.metrics.totalRuns, 0)}
                prefix={<ThunderboltOutlined />}
                valueStyle={{ color: Colors.info }}
              />
              <Statistic
                title="Avg Success Rate"
                value={workflows.length > 0 ? 
                  (workflows.reduce((sum, w) => sum + w.metrics.successRate, 0) / workflows.length).toFixed(1) : 
                  0}
                suffix="%"
                prefix={<TrophyOutlined />}
                valueStyle={{ color: Colors.warning }}
              />
            </Space>
          </Card>
          
          <Card
            title={
              <Space>
                <ClockCircleOutlined style={{ color: Colors.warning }} />
                <span>Recent Activity</span>
              </Space>
            }
            style={{
              backgroundColor: Colors.surface,
              border: `1px solid ${Colors.border}`,
              borderRadius: '12px',
            }}
          >
            <Timeline
              items={[
                {
                  color: Colors.primary,
                  children: (
                    <div>
                      <Text style={{ color: Colors.text }}>SEO Content Generation started</Text>
                      <br />
                      <Text style={{ color: Colors.textTertiary, fontSize: '12px' }}>
                        2 minutes ago
                      </Text>
                    </div>
                  ),
                },
                {
                  color: Colors.success,
                  children: (
                    <div>
                      <Text style={{ color: Colors.text }}>Blockchain Mining completed</Text>
                      <br />
                      <Text style={{ color: Colors.textTertiary, fontSize: '12px' }}>
                        1 hour ago
                      </Text>
                    </div>
                  ),
                },
                {
                  color: Colors.warning,
                  children: (
                    <div>
                      <Text style={{ color: Colors.text }}>Metaverse Monitor paused</Text>
                      <br />
                      <Text style={{ color: Colors.textTertiary, fontSize: '12px' }}>
                        3 hours ago
                      </Text>
                    </div>
                  ),
                },
              ]}
            />
          </Card>
        </Space>
      </Col>
    </Row>
  );

  // Render templates tab
  const renderTemplates = () => (
    <Row gutter={[Spacing.lg, Spacing.lg]}>
      <Col xs={24} lg={16}>
        <Card
          title={
            <Space>
              <FileTextOutlined style={{ color: Colors.primary }} />
              <span>Workflow Templates</span>
            </Space>
          }
          extra={
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setTemplateModalVisible(true)}
            >
              Create Template
            </Button>
          }
          style={{
            backgroundColor: Colors.surface,
            border: `1px solid ${Colors.border}`,
            borderRadius: '12px',
          }}
        >
          <Row gutter={[Spacing.md, Spacing.md]}>
            {templates.map((template) => (
              <Col xs={24} sm={12} lg={8} key={template.id}>
                <Card
                  hoverable
                  style={{
                    backgroundColor: Colors.surfaceLight,
                    border: `1px solid ${Colors.border}`,
                    borderRadius: '8px',
                  }}
                  actions={[
                    <EyeOutlined key="view" onClick={() => setSelectedTemplate(template)} />,
                    <DownloadOutlined key="use" onClick={() => message.info('Using template...')} />,
                    <StarOutlined key="favorite" onClick={() => message.info('Added to favorites')} />,
                  ]}
                >
                  <Card.Meta
                    title={
                      <Space>
                        <Text style={{ color: Colors.text }}>{template.name}</Text>
                        <Tag color={getCategoryColor(template.category)} size="small">
                          {template.category}
                        </Tag>
                      </Space>
                    }
                    description={
                      <Space direction="vertical" size={0}>
                        <Text style={{ color: Colors.textSecondary, fontSize: '12px' }}>
                          {template.description}
                        </Text>
                        <Space>
                          <Text style={{ color: Colors.textTertiary, fontSize: '12px' }}>
                            {template.estimatedTime} min
                          </Text>
                          <Text style={{ color: Colors.textTertiary, fontSize: '12px' }}>
                            {template.difficulty}
                          </Text>
                        </Space>
                        <Space>
                          <Rate disabled value={template.rating} style={{ fontSize: '12px' }} />
                          <Text style={{ color: Colors.textTertiary, fontSize: '12px' }}>
                            ({template.downloads})
                          </Text>
                        </Space>
                        <div>
                          {template.tags.map((tag, index) => (
                            <Tag key={index} size="small" style={{ fontSize: '10px' }}>
                              {tag}
                            </Tag>
                          ))}
                        </div>
                      </Space>
                    }
                  />
                </Card>
              </Col>
            ))}
          </Row>
        </Card>
      </Col>
      
      <Col xs={24} lg={8}>
        <Space direction="vertical" style={{ width: '100%' }} size={Spacing.lg}>
          <Card
            title={
              <Space>
                <BarChartOutlined style={{ color: Colors.info }} />
                <span>Template Statistics</span>
              </Space>
            }
            style={{
              backgroundColor: Colors.surface,
              border: `1px solid ${Colors.border}`,
              borderRadius: '12px',
            }}
          >
            <Space direction="vertical" style={{ width: '100%' }} size={Spacing.md}>
              <Statistic
                title="Total Templates"
                value={templates.length}
                prefix={<FileTextOutlined />}
                valueStyle={{ color: Colors.primary }}
              />
              <Statistic
                title="Total Downloads"
                value={templates.reduce((sum, t) => sum + t.downloads, 0)}
                prefix={<DownloadOutlined />}
                valueStyle={{ color: Colors.success }}
              />
              <Statistic
                title="Avg Rating"
                value={templates.length > 0 ? 
                  (templates.reduce((sum, t) => sum + t.rating, 0) / templates.length).toFixed(1) : 
                  0}
                prefix={<StarOutlined />}
                valueStyle={{ color: Colors.warning }}
              />
            </Space>
          </Card>
        </Space>
      </Col>
    </Row>
  );

  // Render execution tab
  const renderExecution = () => (
    <Row gutter={[Spacing.lg, Spacing.lg]}>
      <Col xs={24} lg={16}>
        <Card
          title={
            <Space>
              <PlayCircleOutlined style={{ color: Colors.primary }} />
              <span>Workflow Execution</span>
            </Space>
          }
          style={{
            backgroundColor: Colors.surface,
            border: `1px solid ${Colors.border}`,
            borderRadius: '12px',
          }}
        >
          {selectedWorkflow ? (
            <Space direction="vertical" style={{ width: '100%' }} size={Spacing.lg}>
              <div>
                <Title level={4} style={{ color: Colors.text }}>
                  {selectedWorkflow.name}
                </Title>
                <Text style={{ color: Colors.textSecondary }}>
                  {selectedWorkflow.description}
                </Text>
              </div>
              
              <Steps
                current={selectedWorkflow.steps.findIndex(s => s.status === 'running')}
                status={selectedWorkflow.status === 'failed' ? 'error' : 'process'}
                style={{ marginBottom: Spacing.lg }}
              >
                {selectedWorkflow.steps.map((step, index) => (
                  <Step
                    key={step.id}
                    title={step.name}
                    description={
                      <Space direction="vertical" size={0}>
                        <Text style={{ color: Colors.textTertiary, fontSize: '12px' }}>
                          {step.type}
                        </Text>
                        {step.duration && (
                          <Text style={{ color: Colors.textTertiary, fontSize: '12px' }}>
                            {step.duration}ms
                          </Text>
                        )}
                      </Space>
                    }
                    icon={
                      step.status === 'completed' ? <CheckCircleOutlined /> :
                      step.status === 'running' ? <SyncOutlined spin /> :
                      step.status === 'failed' ? <ExclamationCircleOutlined /> :
                      step.status === 'skipped' ? <MinusOutlined /> :
                      <ClockCircleOutlined />
                    }
                  />
                ))}
              </Steps>
              
              <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                <Button
                  icon={<PlayCircleOutlined />}
                  disabled={selectedWorkflow.status === 'running'}
                  onClick={() => executeWorkflow(selectedWorkflow.id)}
                >
                  Start Execution
                </Button>
                <Button
                  icon={<PauseCircleOutlined />}
                  disabled={selectedWorkflow.status !== 'running'}
                  onClick={() => message.info('Pausing execution...')}
                >
                  Pause
                </Button>
                <Button
                  icon={<StopOutlined />}
                  disabled={selectedWorkflow.status !== 'running'}
                  onClick={() => message.info('Stopping execution...')}
                >
                  Stop
                </Button>
                <Button
                  icon={<EyeOutlined />}
                  onClick={() => setExecutionModalVisible(true)}
                >
                  View Details
                </Button>
              </Space>
            </Space>
          ) : (
            <Empty
              description="Select a workflow to view execution details"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          )}
        </Card>
      </Col>
      
      <Col xs={24} lg={8}>
        <Space direction="vertical" style={{ width: '100%' }} size={Spacing.lg}>
          <Card
            title={
              <Space>
                <LineChartOutlined style={{ color: Colors.info }} />
                <span>Execution Metrics</span>
              </Space>
            }
            style={{
              backgroundColor: Colors.surface,
              border: `1px solid ${Colors.border}`,
              borderRadius: '12px',
            }}
          >
            {selectedWorkflow ? (
              <Space direction="vertical" style={{ width: '100%' }} size={Spacing.md}>
                <Statistic
                  title="Total Runs"
                  value={selectedWorkflow.metrics.totalRuns}
                  prefix={<PlayCircleOutlined />}
                  valueStyle={{ color: Colors.primary }}
                />
                <Statistic
                  title="Success Rate"
                  value={selectedWorkflow.metrics.successRate}
                  suffix="%"
                  prefix={<TrophyOutlined />}
                  valueStyle={{ color: Colors.success }}
                />
                <Statistic
                  title="Avg Duration"
                  value={selectedWorkflow.metrics.averageDuration}
                  suffix="ms"
                  prefix={<ClockCircleOutlined />}
                  valueStyle={{ color: Colors.warning }}
                />
                <Statistic
                  title="Last Run"
                  value={new Date(selectedWorkflow.metrics.lastRunTime).toLocaleString()}
                  prefix={<CalendarOutlined />}
                  valueStyle={{ color: Colors.info }}
                />
              </Space>
            ) : (
              <Empty
                description="No workflow selected"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </Card>
        </Space>
      </Col>
    </Row>
  );

  return (
    <div style={{ padding: Spacing.lg, backgroundColor: Colors.background, minHeight: '100vh' }}>
      <div style={{ marginBottom: Spacing.xxl }}>
        <Title level={1} style={{ 
          color: Colors.text,
          fontSize: '32px',
          fontWeight: 700,
          margin: 0,
          marginBottom: Spacing.sm,
        }}>
          Automation Workflows
        </Title>
        <Text style={{ 
          fontSize: '16px',
          color: Colors.textSecondary,
        }}>
          Advanced workflow management with AI integration and real-time monitoring
        </Text>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        style={{ color: Colors.text }}
        items={[
          {
            key: 'workflows',
            label: (
              <Space>
                <RobotOutlined />
                <span>Workflows</span>
                <Badge count={workflows.length} style={{ backgroundColor: Colors.primary }} />
              </Space>
            ),
            children: renderWorkflows(),
          },
          {
            key: 'templates',
            label: (
              <Space>
                <FileTextOutlined />
                <span>Templates</span>
                <Badge count={templates.length} style={{ backgroundColor: Colors.info }} />
              </Space>
            ),
            children: renderTemplates(),
          },
          {
            key: 'execution',
            label: (
              <Space>
                <PlayCircleOutlined />
                <span>Execution</span>
                {selectedWorkflow && selectedWorkflow.status === 'running' && (
                  <Badge status="processing" />
                )}
              </Space>
            ),
            children: renderExecution(),
          },
        ]}
      />

      {/* Workflow Details Modal */}
      <Modal
        title="Workflow Details"
        open={!!selectedWorkflow}
        onCancel={() => setSelectedWorkflow(null)}
        footer={[
          <Button key="close" onClick={() => setSelectedWorkflow(null)}>
            Close
          </Button>,
          <Button
            key="execute"
            type="primary"
            icon={<PlayCircleOutlined />}
            onClick={() => selectedWorkflow && executeWorkflow(selectedWorkflow.id)}
          >
            Execute Workflow
          </Button>,
        ]}
        width={800}
      >
        {selectedWorkflow && (
          <Space direction="vertical" style={{ width: '100%' }} size={Spacing.lg}>
            <div>
              <Title level={4} style={{ color: Colors.text }}>
                {selectedWorkflow.name}
              </Title>
              <Text style={{ color: Colors.textSecondary }}>
                {selectedWorkflow.description}
              </Text>
            </div>
            
            <Row gutter={[Spacing.lg, Spacing.lg]}>
              <Col span={12}>
                <Space direction="vertical" style={{ width: '100%' }} size={Spacing.md}>
                  <div>
                    <Text strong style={{ color: Colors.text }}>Category</Text>
                    <div style={{ marginTop: Spacing.xs }}>
                      <Tag color={getCategoryColor(selectedWorkflow.category)}>
                        {selectedWorkflow.category.toUpperCase()}
                      </Tag>
                    </div>
                  </div>
                  <div>
                    <Text strong style={{ color: Colors.text }}>Status</Text>
                    <div style={{ marginTop: Spacing.xs }}>
                      <Tag color={getStatusColor(selectedWorkflow.status)}>
                        {selectedWorkflow.status.toUpperCase()}
                      </Tag>
                    </div>
                  </div>
                  <div>
                    <Text strong style={{ color: Colors.text }}>Priority</Text>
                    <div style={{ marginTop: Spacing.xs }}>
                      <Tag color={getPriorityColor(selectedWorkflow.priority)}>
                        {selectedWorkflow.priority.toUpperCase()}
                      </Tag>
                    </div>
                  </div>
                </Space>
              </Col>
              <Col span={12}>
                <Space direction="vertical" style={{ width: '100%' }} size={Spacing.md}>
                  <Statistic
                    title="Total Runs"
                    value={selectedWorkflow.metrics.totalRuns}
                    prefix={<PlayCircleOutlined />}
                  />
                  <Statistic
                    title="Success Rate"
                    value={selectedWorkflow.metrics.successRate}
                    suffix="%"
                    prefix={<TrophyOutlined />}
                  />
                  <Statistic
                    title="Avg Duration"
                    value={selectedWorkflow.metrics.averageDuration}
                    suffix="ms"
                    prefix={<ClockCircleOutlined />}
                  />
                </Space>
              </Col>
            </Row>
            
            <div>
              <Text strong style={{ color: Colors.text }}>Workflow Steps</Text>
              <div style={{ marginTop: Spacing.md }}>
                <List
                  dataSource={selectedWorkflow.steps}
                  renderItem={(step) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={
                          <Avatar
                            style={{
                              backgroundColor: step.status === 'completed' ? Colors.success :
                                              step.status === 'running' ? Colors.primary :
                                              step.status === 'failed' ? Colors.error :
                                              Colors.textTertiary,
                            }}
                            icon={
                              step.status === 'completed' ? <CheckCircleOutlined /> :
                              step.status === 'running' ? <SyncOutlined spin /> :
                              step.status === 'failed' ? <ExclamationCircleOutlined /> :
                              <ClockCircleOutlined />
                            }
                          />
                        }
                        title={
                          <Space>
                            <Text style={{ color: Colors.text }}>{step.name}</Text>
                            <Tag color={Colors.info} size="small">
                              {step.type}
                            </Tag>
                          </Space>
                        }
                        description={
                          <Space direction="vertical" size={0}>
                            <Text style={{ color: Colors.textTertiary, fontSize: '12px' }}>
                              Status: {step.status}
                            </Text>
                            {step.duration && (
                              <Text style={{ color: Colors.textTertiary, fontSize: '12px' }}>
                                Duration: {step.duration}ms
                              </Text>
                            )}
                          </Space>
                        }
                      />
                    </List.Item>
                  )}
                />
              </div>
            </div>
          </Space>
        )}
      </Modal>
    </div>
  );
};

export default AutomationWorkflows;
