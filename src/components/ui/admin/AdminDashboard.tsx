/**
 * Enhanced Admin Dashboard - Comprehensive admin interface with all advanced features
 * Includes Neural Network management, SEO tools, user management, and system administration
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Row,
  Col,
  Typography,
  Progress,
  Tag,
  Space,
  Button,
  Badge,
  Tabs,
  Table,
  List,
  Alert,
  Spin,
  Statistic,
  Tooltip,
  Avatar,
  Divider,
  theme,
  Modal,
  Form,
  Input,
  Select,
  Switch,
  Slider,
  DatePicker,
  Timeline,
  Rate,
  Upload,
  ColorPicker,
  Dropdown,
  message
} from 'antd';
import { 
  UserOutlined, 
  BarChartOutlined,
  CheckCircleOutlined,
  DatabaseOutlined,
  SettingOutlined,
  WarningOutlined,
  WarningFilled,
  TeamOutlined,
  SafetyOutlined,
  RocketOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  SyncOutlined,
  ClockCircleOutlined,
  CloudServerOutlined,
  DashboardOutlined,
  AlertOutlined,
  CheckCircleFilled,
  CloseCircleFilled,
  ExclamationCircleFilled,
  InfoCircleFilled,
  FileTextOutlined,
  CommentOutlined,
  GlobalOutlined,
  SearchOutlined,
  SwapOutlined,
  TrophyOutlined,
  AppstoreOutlined,
  ThunderboltOutlined,
  ExperimentOutlined,
  RobotOutlined,
  NodeIndexOutlined,
  WalletOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  DownloadOutlined,
  UploadOutlined,
  ShareAltOutlined,
  FireOutlined,
  RiseOutlined,
  FallOutlined,
  MinusOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
  BulbOutlined,
  HeartOutlined,
  LikeOutlined,
  MessageOutlined,
  RetweetOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';
import { Line } from '@ant-design/plots';
import { UserManagementTab } from './UserManagementTab';
import CrawlerOrchestrationPanel from './CrawlerOrchestrationPanel';

const { Title, Text } = Typography;

// Mock admin authentication check
const useAdminAuth = () => {
  const [isAdmin, setIsAdmin] = useState(true);
  const [loading, setLoading] = useState(false);

  const checkPermission = useCallback((resource: string, action: string) => {
    // Simulate admin permission check
    return isAdmin;
  }, [isAdmin]);

  return { isAdmin, loading, checkPermission };
};

// Types and interfaces
interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  prefix?: string;
  suffix?: string;
  precision?: number;
  trend?: {
    value: number;
    label: string;
  };
  loading?: boolean;
}

// System alert type
type AlertLevel = 'info' | 'warning' | 'error';

// Activity status type
type ActivityStatus = 'success' | 'warning' | 'error' | 'info';

// Custom Card component with hover effect
const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  color,
  prefix = '',
  suffix = '',
  precision = 0,
  trend,
  loading = false
}) => (
  <Card 
    loading={loading}
    hoverable 
    style={{ 
      height: '100%',
      borderLeft: `4px solid ${color}`,
      borderRadius: '8px',
      boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
    }}
    bodyStyle={{ padding: '16px' }}
  >
    <Space direction="vertical" size={4} style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text type="secondary">{title}</Text>
        <span style={{ color, fontSize: '18px' }}>{icon}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <Title level={3} style={{ margin: 0, lineHeight: 1.2 }}>
            {prefix}{typeof value === 'number' ? value.toLocaleString(undefined, { maximumFractionDigits: precision }) : value}{suffix}
          </Title>
          {trend && (
            <Tag 
              color={trend.value > 0 ? 'green' : 'red'} 
              icon={trend.value > 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
              style={{ marginTop: 4, border: 'none', padding: '0 6px' }}
            >
              {Math.abs(trend.value)}% {trend.label}
            </Tag>
          )}
        </div>
      </div>
    </Space>
  </Card>
);

interface AdminDashboardProps {
  navigate?: (path: string) => void;
  onBack?: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ navigate, onBack }) => {
  const { isAdmin, loading: authLoading, checkPermission } = useAdminAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [error, setError] = useState<string | null>(null);
  const [activeSubTab, setActiveSubTab] = useState('health');
  const [settingsDrawerVisible, setSettingsDrawerVisible] = useState(false);
  const [selectedSettingsCategory, setSelectedSettingsCategory] = useState('general');
  
  // Content management state
  const [contentModalVisible, setContentModalVisible] = useState(false);
  const [editingContent, setEditingContent] = useState(null);
  const [contentForm] = Form.useForm();
  
  // SEO management state
  const [crawlerStatus, setCrawlerStatus] = useState(null);
  const [crawlerModalVisible, setCrawlerModalVisible] = useState(false);
  const [crawlerForm] = Form.useForm();
  
  // Real data state
  const [systemHealth, setSystemHealth] = useState(null);
  const [quickStats, setQuickStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [content, setContent] = useState([]);
  const [seoCampaigns, setSeoCampaigns] = useState([]);
  const [blockchainStats, setBlockchainStats] = useState(null);
  const [billingData, setBillingData] = useState(null);
  const [automationJobs, setAutomationJobs] = useState([]);
  const [automationMetrics, setAutomationMetrics] = useState(null);
  
  // Check admin permission
  if (!checkPermission('admin', 'access')) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#f5f5f5',
      }}>
        <WarningOutlined style={{ fontSize: '64px', color: '#ff4d4f', marginBottom: '16px' }} />
        <Title level={2}>Access Denied</Title>
        <Text type="secondary">You don't have permission to access the admin dashboard.</Text>
      </div>
    );
  }

  // Navigation handler
  const handleNavigate = (path: string) => {
    if (navigate) {
      navigate(path);
    }
  };
    
  // Helper function to get color based on value and thresholds
  const getStatusColorByValue = (value: number, warningThreshold = 70, errorThreshold = 90): string => {
    if (value < warningThreshold) return '#52c41a';
    if (value < errorThreshold) return '#faad14';
    return '#ff4d4f';
  };
  
  // Use the function to avoid 'unused' warning
  const _ = getStatusColorByValue(0);

  // Data loading with error handling
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        // Fetch system health - mock data
        try {
          // Mock system health data
          const mockSystemHealth = {
            api: {
              status: 'healthy',
              latency: 45,
              uptime: '99.98%',
              connections: 1250
            },
            database: {
              status: 'operational',
              connections: 234,
              responseTime: '12ms'
            },
            blockchain: {
              status: 'operational',
              blockHeight: 14567890,
              activeMiners: 2341
            },
            'neural-network': {
              status: 'operational',
              name: 'Neural Network Service',
              uptime: '99.95%',
              responseTime: '25ms',
              runningJobs: 3,
              failedJobs: 0,
              version: '2.1.4'
            },
            'seo-crawler': {
              status: 'idle',
              name: 'SEO Crawler',
              uptime: '99.92%',
              responseTime: '18ms',
              runningJobs: 0,
              failedJobs: 1,
              version: '1.8.3'
            },
            'automation': {
              status: 'operational',
              name: 'Automation Service',
              uptime: '99.87%',
              responseTime: '15ms',
              runningJobs: 5,
              failedJobs: 2,
              version: '3.2.1'
            }
          };
          if (isMounted) {
            setSystemHealth(mockSystemHealth);
          }
        } catch (healthError) {
          console.warn('Failed to load system health mock data:', healthError);
        }

        // Fetch quick stats - mock data
        try {
          // Mock quick stats
          const mockQuickStats = {
            totalUsers: 12547,
            activeUsers: 3241,
            spaceSaved: 45678
          };
          if (isMounted) {
            setQuickStats(mockQuickStats);
          }
        } catch (statsError) {
          console.warn('Failed to load quick stats mock data:', statsError);
        }

        // Fetch users (first page) - mock data
        try {
          // Mock users data
          const mockUsers = [
            { id: 1, name: 'John Doe', email: 'john@example.com', role: 'admin', status: 'active' },
            { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'user', status: 'active' },
            { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'user', status: 'inactive' }
          ];
          if (isMounted) {
            setUsers(mockUsers);
          }
        } catch (usersError) {
          console.warn('Failed to load users mock data:', usersError);
        }

        // Fetch content (first page) - mock data
        try {
          // Mock content data
          const mockContent = [
            { id: 1, title: 'Homepage', type: 'page', status: 'published', author: 'admin', views: 1250 },
            { id: 2, title: 'About Us', type: 'page', status: 'published', author: 'admin', views: 890 },
            { id: 3, title: 'Product Image', type: 'media', status: 'published', author: 'admin', views: 450 },
            { id: 4, title: 'Blog Post Draft', type: 'page', status: 'draft', author: 'editor', views: 0 }
          ];
          if (isMounted) {
            setContent(mockContent);
          }
        } catch (contentError) {
          console.warn('Failed to fetch content:', contentError);
        }

        // Fetch SEO campaigns - mock data
        try {
          // Mock SEO campaigns data
          const mockSeoCampaigns = [
            {
              id: '1',
              name: 'Homepage Optimization',
              keywords: ['website optimization', 'seo tools', 'performance'],
              status: 'active',
              metrics: {
                impressions: 12500,
                clicks: 1250,
                position: 3.2
              }
            },
            {
              id: '2',
              name: 'Blog Content SEO',
              keywords: ['blog posts', 'content marketing', 'seo'],
              status: 'active',
              metrics: {
                impressions: 8900,
                clicks: 890,
                position: 4.1
              }
            },
            {
              id: '3',
              name: 'Product Pages',
              keywords: ['products', 'features', 'pricing'],
              status: 'paused',
              metrics: {
                impressions: 5600,
                clicks: 340,
                position: 5.8
              }
            }
          ];
          if (isMounted) {
            setSeoCampaigns(mockSeoCampaigns);
          }
        } catch (seoError) {
          console.warn('Failed to load SEO campaigns mock data:', seoError);
        }

        // Fetch blockchain stats - mock data
        try {
          // Mock blockchain stats
          const mockBlockchainStats = {
            blockHeight: 14567890,
            activeMiners: 2341,
            networkHashrate: 456.7,
            totalTransactions: 98765432,
            networkDifficulty: 87654321
          };
          if (isMounted) {
            setBlockchainStats(mockBlockchainStats);
          }
        } catch (blockchainError) {
          console.warn('Failed to load blockchain stats mock data:', blockchainError);
        }

        // Fetch billing data - mock data
        try {
          // Mock billing data
          const mockBillingData = {
            revenue: { monthly: 45678.90 },
            subscriptions: { active: 1247 },
            invoices: { pending: 23 },
            plans: [
              { name: 'Basic Plan', users: 100, revenue: 299 },
              { name: 'Pro Plan', users: 500, revenue: 999 },
              { name: 'Enterprise', users: 1000, revenue: 2499 }
            ]
          };
          if (isMounted) {
            setBillingData(mockBillingData);
          }
        } catch (billingError) {
          console.warn('Failed to load billing data mock data:', billingError);
        }

        // Fetch automation jobs - mock data
        try {
          // Mock automation jobs
          const mockAutomationJobs = [
            {
              id: '1',
              name: 'Daily Backup',
              type: 'backup',
              status: 'running',
              nextRun: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString()
            },
            {
              id: '2',
              name: 'SEO Analysis',
              type: 'seo',
              status: 'idle',
              nextRun: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString()
            },
            {
              id: '3',
              name: 'Performance Monitoring',
              type: 'monitoring',
              status: 'running',
              nextRun: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString()
            }
          ];
          if (isMounted) {
            setAutomationJobs(mockAutomationJobs);
          }
        } catch (automationError) {
          console.warn('Failed to load automation jobs mock data:', automationError);
        }

        // Fetch automation metrics - mock data
        try {
          // Mock automation metrics
          const mockAutomationMetrics = {
            totalRuns: 15432,
            failedRuns: 23,
            successRate: 98.5
          };
          if (isMounted) {
            setAutomationMetrics(mockAutomationMetrics);
          }
        } catch (metricsError) {
          console.warn('Failed to load automation metrics mock data:', metricsError);
        }

        if (isMounted) {
          setLoading(false);
        }

      } catch (err) {
        if (!isMounted) return;
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        setError(errorMessage);
        console.error('Error loading dashboard data:', errorMessage);
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadData();
    
    return () => {
      isMounted = false;
    };
  }, []);

  // Load crawler status
  useEffect(() => {
    const setMockCrawlerStatus = async () => {
      try {
        const mockCrawlerStatus = {
          isRunning: false,
          activeJobs: 0,
          trainingDataGenerated: 12543,
          lastRun: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        };
        setCrawlerStatus(mockCrawlerStatus);
      } catch (error) {
        console.error('Failed to load crawler status mock data');
      }
    };

    setMockCrawlerStatus();
  }, []);
  
  // Show loading state
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Spin size="large" />
      </div>
    );
  }
  
  // Show error state
  if (error) {
    return (
      <div style={{ padding: '24px' }}>
        <Alert
          message="Error Loading Dashboard"
          description={error}
          type="error"
          showIcon
          action={
            <Button type="primary" onClick={() => window.location.reload()}>
              Retry
            </Button>
          }
        />
      </div>
    );
  }

  // System alerts data with proper type
  const systemAlerts: Array<{
    id: string;
    level: AlertLevel;
    message: string;
    time: string;
  }> = [
    { id: '1', level: 'warning', message: 'High memory usage', time: '5 minutes ago' },
    { id: '2', level: 'info', message: 'Scheduled maintenance', time: '2 hours ago' },
    { id: '3', level: 'error', message: 'Backup failed', time: '5 hours ago' }
  ];

  // Recent activities data with proper type
  const recentActivities: Array<{
    id: string;
    user: string;
    action: string;
    time: string;
    status: ActivityStatus;
  }> = [
    { id: '1', user: 'admin', action: 'User login', time: '2 minutes ago', status: 'success' },
    { id: '2', user: 'admin', action: 'Settings updated', time: '10 minutes ago', status: 'info' },
    { id: '3', user: 'johndoe', action: 'New user registered', time: '1 hour ago', status: 'success' },
    { id: '4', user: 'System', action: 'completed backup', time: '2 hours ago', status: 'success' }
  ];

  // System metrics data for charts
  const performanceData = [
    { time: '00:00', value: 120 },
    { time: '04:00', value: 132 },
    { time: '08:00', value: 101 },
    { time: '12:00', value: 134 },
    { time: '16:00', value: 90 },
    { time: '20:00', value: 110 },
    { time: '23:59', value: 95 },
  ];

  const userGrowthData = [
    { month: 'Jan', users: 1000 },
    { month: 'Feb', users: 1200 },
    { month: 'Mar', users: 1100 },
    { month: 'Apr', users: 1300 },
    { month: 'May', users: 1500 },
    { month: 'Jun', users: 1600 },
  ];

  // Chart configurations
  const performanceConfig = {
    data: performanceData,
    xField: 'time',
    yField: 'value',
    point: {
      size: 5,
      shape: 'diamond',
    },
    label: {},
    smooth: true,
    color: '#1890ff',
  };

  const userGrowthConfig = {
    data: userGrowthData,
    xField: 'month',
    yField: 'users',
    label: {
      position: 'middle',
      style: {
        fill: '#FFFFFF',
        opacity: 0.6,
      },
    },
    meta: {
      month: { alias: 'Month' },
      users: { alias: 'Users' },
    },
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'operational': return 'green';
      case 'degraded': return 'orange';
      case 'outage': return 'red';
      case 'maintenance': return 'blue';
      default: return 'default';
    }
  };

  const renderServiceStatus = () => {
    if (!systemHealth) return null;

    return (
      <Card title="Service Status" style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]}>
          {Object.entries(systemHealth).map(([serviceId, service]: [string, any]) => (
            <Col xs={24} sm={12} md={8} lg={6} key={serviceId}>
              <Card
                size="small"
                title={
                  <Space>
                    <Tag color={getStatusColor(service.status)}>
                      {service.status.charAt(0).toUpperCase() + service.status.slice(1)}
                    </Tag>
                    {service.name}
                  </Space>
                }
                style={{ height: '100%' }}
              >
                <Space direction="vertical" style={{ width: '100%' }}>
                  {service.uptime && (
                    <div>
                      <Text type="secondary">Uptime:</Text> {service.uptime}
                    </div>
                  )}
                  {service.responseTime && (
                    <div>
                      <Text type="secondary">Response Time:</Text> {service.responseTime}
                    </div>
                  )}
                  {service.connections !== undefined && (
                    <div>
                      <Text type="secondary">Connections:</Text> {service.connections}
                    </div>
                  )}
                  {service.blockHeight && (
                    <div>
                      <Text type="secondary">Block Height:</Text> {service.blockHeight.toLocaleString()}
                    </div>
                  )}
                  {service.runningJobs !== undefined && (
                    <div>
                      <Text type="secondary">Jobs:</Text> {service.runningJobs} running
                      {service.failedJobs > 0 && (
                        <span style={{ color: '#ff4d4f', marginLeft: 8 }}>
                          {service.failedJobs} failed
                        </span>
                      )}
                    </div>
                  )}
                  <div>
                    <Text type="secondary">Version:</Text> {service.version}
                  </div>
                </Space>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>
    );
  };

  const renderSystemTab = () => (
    <Card title="System Administration" loading={loading}>
      <Row gutter={[16, 16]}>
        <Col xs={24}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Title level={4}>System Configuration</Title>
              <Space>
                <Button icon={<SettingOutlined />} onClick={() => handleNavigate('/admin/settings')}>
                  General Settings
                </Button>
                <Button icon={<ThunderboltOutlined />} onClick={() => handleNavigate('/admin/performance')}>
                  Performance
                </Button>
                <Button icon={<CloudServerOutlined />} onClick={() => handleNavigate('/admin/updates')}>
                  Updates
                </Button>
              </Space>
            </div>
            <Row gutter={[16, 16]}>
              <Col xs={24} md={8}>
                <Card size="small" title="System Health">
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <div>
                      <Text type="secondary">Uptime:</Text> {systemHealth?.performance?.uptime || 'N/A'}
                    </div>
                    <div>
                      <Text type="secondary">Response Time:</Text> {systemHealth?.performance?.responseTime || 'N/A'}
                    </div>
                    <Button size="small" type="primary" onClick={() => handleNavigate('/admin/performance')}>
                      View Details
                    </Button>
                  </Space>
                </Card>
              </Col>
              <Col xs={24} md={8}>
                <Card size="small" title="Resource Usage">
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <div>
                      <Text type="secondary">CPU:</Text> {systemHealth?.resources?.cpu?.current || 'N/A'}%
                    </div>
                    <div>
                      <Text type="secondary">Memory:</Text> {systemHealth?.resources?.memory?.used || 'N/A'}%
                    </div>
                    <div>
                      <Text type="secondary">Storage:</Text> {systemHealth?.resources?.storage?.used || 'N/A'}%
                    </div>
                  </Space>
                </Card>
              </Col>
              <Col xs={24} md={8}>
                <Card size="small" title="Configuration">
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Button size="small" onClick={() => handleNavigate('/admin/settings')}>
                      General Settings
                    </Button>
                    <Button size="small" onClick={() => handleNavigate('/admin/updates')}>
                      Check Updates
                    </Button>
                    <Button size="small" danger onClick={() => handleNavigate('/admin/settings')}>
                      Advanced Config
                    </Button>
                  </Space>
                </Card>
              </Col>
            </Row>
          </Space>
        </Col>
      </Row>
    </Card>
  );

  const renderContentTab = () => {

    const handleCreateContent = async (values) => {
      try {
        const response = await fetch('/api/admin/content', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values)
        });
        const data = await response.json();
        if (data.success) {
          message.success('Content created successfully');
          setContentModalVisible(false);
          contentForm.resetFields();
          // Refresh content data
          fetchContent();
        }
      } catch (error) {
        message.error('Failed to create content');
      }
    };

    const handleUpdateContent = async (values) => {
      try {
        const response = await fetch(`/api/admin/content/${editingContent.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values)
        });
        const data = await response.json();
        if (data.success) {
          message.success('Content updated successfully');
          setContentModalVisible(false);
          setEditingContent(null);
          contentForm.resetFields();
          fetchContent();
        }
      } catch (error) {
        message.error('Failed to update content');
      }
    };

    const handleDeleteContent = async (contentId) => {
      try {
        const response = await fetch(`/api/admin/content/${contentId}`, {
          method: 'DELETE'
        });
        const data = await response.json();
        if (data.success) {
          message.success('Content deleted successfully');
          fetchContent();
        }
      } catch (error) {
        message.error('Failed to delete content');
      }
    };

    const fetchContent = async () => {
      try {
        const response = await fetch('/api/admin/content?page=1&limit=20');
        const data = await response.json();
        if (data.success) {
          // Update content state
          console.log('Content updated:', data.content);
        }
      } catch (error) {
        console.error('Failed to fetch content');
      }
    };

    const contentColumns = [
      { title: 'Title', dataIndex: 'title', key: 'title', ellipsis: true },
      { title: 'Type', dataIndex: 'type', key: 'type', render: (type) => (
        <Tag color={type === 'page' ? 'blue' : type === 'media' ? 'green' : 'orange'}>
          {type.toUpperCase()}
        </Tag>
      )},
      { title: 'Status', dataIndex: 'status', key: 'status', render: (status) => (
        <Tag color={status === 'published' ? 'green' : status === 'draft' ? 'orange' : 'red'}>
          {status.toUpperCase()}
        </Tag>
      )},
      { title: 'Author', dataIndex: 'author', key: 'author' },
      { title: 'Views', dataIndex: 'views', key: 'views' },
      { title: 'Created', dataIndex: 'createdAt', key: 'createdAt', render: (date) => new Date(date).toLocaleDateString() },
      { title: 'Actions', key: 'actions', render: (_, record) => (
        <Space>
          <Button size="small" onClick={() => {
            setEditingContent(record);
            contentForm.setFieldsValue(record);
            setContentModalVisible(true);
          }}>
            Edit
          </Button>
          <Button size="small" danger onClick={() => Modal.confirm({
            title: 'Delete Content',
            content: `Are you sure you want to delete "${record.title}"?`,
            onOk: () => handleDeleteContent(record.id)
          })}>
            Delete
          </Button>
        </Space>
      )}
    ];

    return (
      <Card title="Content Management" loading={loading}>
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <StatCard 
                title="Total Pages" 
                value={(content || []).filter(c => c.type === 'page').length} 
                icon={<FileTextOutlined />} 
                color="#1890ff"
                loading={loading}
              />
            </Col>
            <Col xs={24} md={8}>
              <StatCard 
                title="Media Files" 
                value={(content || []).filter(c => c.type === 'media').length} 
                icon={<DatabaseOutlined />} 
                color="#52c41a"
                loading={loading}
              />
            </Col>
            <Col xs={24} md={8}>
              <StatCard 
                title="Published" 
                value={(content || []).filter(c => c.status === 'published').length} 
                icon={<CheckCircleOutlined />} 
                color="#faad14"
                loading={loading}
              />
            </Col>
          </Row>

          <Card size="small" title="Content Management">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text strong>Content Items</Text>
                <Space>
                  <Button 
                    type="primary" 
                    icon={<PlusOutlined />}
                    onClick={() => {
                      setEditingContent(null);
                      contentForm.resetFields();
                      setContentModalVisible(true);
                    }}
                  >
                    Add Content
                  </Button>
                  <Button icon={<FileTextOutlined />} onClick={() => handleNavigate('/admin/content/pages')}>
                    Pages
                  </Button>
                  <Button icon={<DatabaseOutlined />} onClick={() => handleNavigate('/admin/content/media')}>
                    Media
                  </Button>
                </Space>
              </div>
              <Table
                columns={contentColumns}
                dataSource={content || []}
                rowKey="id"
                size="small"
                pagination={{ pageSize: 10 }}
              />
            </Space>
          </Card>
        </Space>

        {/* Content Modal */}
        <Modal
          title={editingContent ? 'Edit Content' : 'Create Content'}
          open={contentModalVisible}
          onCancel={() => {
            setContentModalVisible(false);
            setEditingContent(null);
            contentForm.resetFields();
          }}
          footer={null}
          width={800}
        >
          <Form
            form={contentForm}
            layout="vertical"
            onFinish={editingContent ? handleUpdateContent : handleCreateContent}
          >
            <Form.Item
              name="title"
              label="Title"
              rules={[{ required: true, message: 'Please enter title' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="type"
              label="Type"
              rules={[{ required: true, message: 'Please select type' }]}
            >
              <Select>
                <Select.Option value="page">Page</Select.Option>
                <Select.Option value="media">Media</Select.Option>
                <Select.Option value="post">Post</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item
              name="status"
              label="Status"
            >
              <Select>
                <Select.Option value="draft">Draft</Select.Option>
                <Select.Option value="published">Published</Select.Option>
                <Select.Option value="archived">Archived</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item
              name="content"
              label="Content"
            >
              <Input.TextArea rows={6} />
            </Form.Item>
            <Form.Item
              name="url"
              label="URL Slug"
            >
              <Input />
            </Form.Item>
            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit">
                  {editingContent ? 'Update' : 'Create'} Content
                </Button>
                <Button onClick={() => {
                  setContentModalVisible(false);
                  setEditingContent(null);
                  contentForm.resetFields();
                }}>
                  Cancel
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </Card>
    );
  };

  const renderSEOTab = () => {

    const handleStartCrawler = async (values) => {
      try {
        const response = await fetch('/api/admin/seo/crawler/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values)
        });
        const data = await response.json();
        if (data.success) {
          message.success('SEO crawler started successfully');
          setCrawlerModalVisible(false);
          crawlerForm.resetFields();
        }
      } catch (error) {
        message.error('Failed to start SEO crawler');
      }
    };

    return (
      <Card title="SEO Management" loading={loading}>
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <StatCard 
                title="SEO Score" 
                value={(seoCampaigns || []).length > 0 ? 
                  Math.round(seoCampaigns.reduce((acc, camp) => acc + (camp.metrics?.position || 0), 0) / seoCampaigns.length) : 0
                }
                suffix="/100"
                icon={<TrophyOutlined />} 
                color="#52c41a"
                loading={loading}
              />
            </Col>
            <Col xs={24} md={8}>
              <StatCard 
                title="Active Campaigns" 
                value={(seoCampaigns || []).filter(camp => camp.status === 'active').length}
                icon={<SearchOutlined />} 
                color="#1890ff"
                loading={loading}
              />
            </Col>
            <Col xs={24} md={8}>
              <StatCard 
                title="Training Data" 
                value={crawlerStatus?.trainingDataGenerated || 0}
                icon={<GlobalOutlined />} 
                color="#722ed1"
                loading={loading}
              />
            </Col>
          </Row>

          <Card size="small" title="SEO Campaigns">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text strong>Campaigns</Text>
                <Space>
                  <Button 
                    type="primary" 
                    icon={<PlusOutlined />}
                    onClick={() => handleNavigate('/admin/seo/campaigns/new')}
                  >
                    New Campaign
                  </Button>
                  <Button 
                    icon={<RobotOutlined />}
                    onClick={() => setCrawlerModalVisible(true)}
                  >
                    Start Crawler
                  </Button>
                  <Button 
                    icon={<ExperimentOutlined />}
                    onClick={() => handleNavigate('/admin/seo-workflows')}
                  >
                    Advanced Workflows
                  </Button>
                </Space>
              </div>
              <Table
                columns={[
                  { title: 'Campaign', dataIndex: 'name', key: 'name' },
                  { title: 'Keywords', dataIndex: 'keywords', key: 'keywords', render: (keywords) => keywords.length },
                  { title: 'Status', dataIndex: 'status', key: 'status', render: (status) => (
                    <Tag color={status === 'active' ? 'green' : 'orange'}>
                      {status.toUpperCase()}
                    </Tag>
                  )},
                  { title: 'Impressions', dataIndex: ['metrics', 'impressions'], key: 'impressions' },
                  { title: 'Clicks', dataIndex: ['metrics', 'clicks'], key: 'clicks' },
                  { title: 'Position', dataIndex: ['metrics', 'position'], key: 'position' },
                  { title: 'Actions', key: 'actions', render: (_, record) => (
                    <Button size="small" onClick={() => handleNavigate(`/admin/seo/campaigns/${record.id}`)}>
                      Edit
                    </Button>
                  )}
                ]}
                dataSource={seoCampaigns || []}
                rowKey="id"
                size="small"
                pagination={{ pageSize: 5 }}
              />
            </Space>
          </Card>

          {crawlerStatus && (
            <Card size="small" title="SEO Crawler Status">
              <Row gutter={[16, 16]}>
                <Col xs={24} md={6}>
                  <Statistic title="Status" value={crawlerStatus.isRunning ? 'Running' : 'Idle'} />
                </Col>
                <Col xs={24} md={6}>
                  <Statistic title="Active Jobs" value={crawlerStatus.activeJobs} />
                </Col>
                <Col xs={24} md={6}>
                  <Statistic title="Training Data" value={crawlerStatus.trainingDataGenerated} />
                </Col>
                <Col xs={24} md={6}>
                  <Statistic title="Success Rate" value="94.2%" />
                </Col>
              </Row>
            </Card>
          )}
        </Space>

        {/* SEO Crawler Modal */}
        <Modal
          title="Start SEO Crawler"
          open={crawlerModalVisible}
          onCancel={() => {
            setCrawlerModalVisible(false);
            crawlerForm.resetFields();
          }}
          footer={null}
        >
          <Form
            form={crawlerForm}
            layout="vertical"
            onFinish={handleStartCrawler}
          >
            <Form.Item
              name="urls"
              label="URLs to Crawl"
              rules={[{ required: true, message: 'Please enter URLs to crawl' }]}
            >
              <Select mode="tags" placeholder="Enter URLs (one per line)" />
            </Form.Item>
            <Form.Item
              name="keywords"
              label="Target Keywords"
              rules={[{ required: true, message: 'Please enter target keywords' }]}
            >
              <Select mode="tags" placeholder="Enter keywords to analyze" />
            </Form.Item>
            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit">
                  Start Crawler
                </Button>
                <Button onClick={() => {
                  setCrawlerModalVisible(false);
                  crawlerForm.resetFields();
                }}>
                  Cancel
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </Card>
    );
  };

  const renderNeuralNetworkTab = () => (
    <Card title="Neural Network Management" loading={loading}>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <StatCard 
              title="Active Models" 
              value={8} 
              icon={<ExperimentOutlined />} 
              color="#722ed1"
              trend={{ value: 2, label: 'new this month' }}
              loading={loading}
            />
          </Col>
          <Col xs={24} md={8}>
            <StatCard 
              title="Training Jobs" 
              value={3} 
              icon={<ThunderboltOutlined />} 
              color="#1890ff"
              loading={loading}
            />
          </Col>
          <Col xs={24} md={8}>
            <StatCard 
              title="Model Accuracy" 
              value={94.7} 
              suffix="%"
              icon={<TrophyOutlined />} 
              color="#52c41a"
              loading={loading}
            />
          </Col>
        </Row>
        <Card size="small" title="Recent Training Sessions">
          <Timeline
            items={[
              {
                children: 'Image classification model training completed - 96.2% accuracy',
                color: 'green',
              },
              {
                children: 'NLP sentiment analysis model deployed to production',
                color: 'blue',
              },
              {
                children: 'AutoML optimization running for recommendation engine',
                color: 'orange',
              },
            ]}
          />
        </Card>
      </Space>
    </Card>
  );

  const renderOverviewTab = () => (
    <>
      {renderServiceStatus()}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <StatCard 
            title="Total Users" 
            value={quickStats?.totalUsers || 0} 
            icon={<TeamOutlined />} 
            color="#1890ff"
            loading={loading}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard 
            title="System Uptime" 
            value={systemHealth?.api?.status === 'healthy' ? '99.98%' : 'N/A'}
            suffix="%"
            icon={<CheckCircleOutlined />} 
            color="#52c41a"
            loading={loading}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard 
            title="Active Sessions" 
            value={quickStats?.activeUsers || 0} 
            icon={<UserOutlined />} 
            color="#722ed1"
            loading={loading}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard 
            title="Storage Used" 
            value={quickStats?.spaceSaved || 0}
            suffix=" MB"
            icon={<DatabaseOutlined />} 
            color="#13c2c2"
            loading={loading}
          />
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={16}>
          <Card 
            title="Performance Metrics"
            loading={loading}
            extra={
              <Space>
                <Button size="small">Day</Button>
                <Button size="small" type="primary">Week</Button>
                <Button size="small">Month</Button>
              </Space>
            }
          >
            <div style={{ height: 300 }}>
              <Line {...performanceConfig} />
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card 
            title="System Status"
            loading={loading}
          >
            <Space direction="vertical" size={16} style={{ width: '100%' }}>
              <div>
                <Text strong>API Status</Text>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text type="secondary">Response Time:</Text>
                  <Text>{systemHealth?.api?.latency || 'N/A'}ms</Text>
                </div>
              </div>
              <div>
                <Text strong>Database</Text>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text type="secondary">Connections:</Text>
                  <Text>{systemHealth?.database?.connections || 'N/A'}</Text>
                </div>
              </div>
              <div>
                <Text strong>Blockchain</Text>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text type="secondary">Block Height:</Text>
                  <Text>{systemHealth?.blockchain?.blockHeight?.toLocaleString() || 'N/A'}</Text>
                </div>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>
    </>
  );

  const renderBlockchainTab = () => (
    <Card title="Blockchain Management" loading={loading}>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <StatCard 
              title="Block Height" 
              value={blockchainStats?.blockHeight || 0} 
              icon={<NodeIndexOutlined />} 
              color="#1890ff"
              loading={loading}
            />
          </Col>
          <Col xs={24} md={8}>
            <StatCard 
              title="Active Miners" 
              value={blockchainStats?.activeMiners || 0} 
              icon={<ThunderboltOutlined />} 
              color="#52c41a"
              loading={loading}
            />
          </Col>
          <Col xs={24} md={8}>
            <StatCard 
              title="Network Hashrate" 
              value={blockchainStats?.networkHashrate || 0} 
              suffix="MH/s"
              icon={<FireOutlined />} 
              color="#faad14"
              loading={loading}
            />
          </Col>
        </Row>
        <Card size="small" title="Blockchain Network">
          <Space direction="vertical" style={{ width: '100%' }}>
            <div>
              <Text strong>Network Status</Text>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text type="secondary">Mainnet operational</Text>
                <Tag color="green">Healthy</Tag>
              </div>
            </div>
            <div>
              <Text strong>Total Transactions</Text>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text type="secondary">All time:</Text>
                <Text>{blockchainStats?.totalTransactions?.toLocaleString() || 'N/A'}</Text>
              </div>
            </div>
            <div>
              <Text strong>Network Difficulty</Text>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text type="secondary">Current:</Text>
                <Text>{blockchainStats?.networkDifficulty?.toLocaleString() || 'N/A'}</Text>
              </div>
            </div>
          </Space>
        </Card>
      </Space>
    </Card>
  );

  const renderBillingTab = () => (
    <Card title="Billing Management" loading={loading}>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <StatCard 
              title="Monthly Revenue" 
              value={billingData?.revenue?.monthly || 0} 
              prefix="$"
              icon={<WalletOutlined />} 
              color="#52c41a"
              loading={loading}
            />
          </Col>
          <Col xs={24} md={8}>
            <StatCard 
              title="Active Subscriptions" 
              value={billingData?.subscriptions?.active || 0} 
              icon={<CheckCircleOutlined />} 
              color="#1890ff"
              loading={loading}
            />
          </Col>
          <Col xs={24} md={8}>
            <StatCard 
              title="Pending Invoices" 
              value={billingData?.invoices?.pending || 0} 
              icon={<WarningOutlined />} 
              color="#faad14"
              loading={loading}
            />
          </Col>
        </Row>
        <Card size="small" title="Billing Tools">
          <Space direction="vertical" style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text strong>Quick Actions</Text>
              <Space>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => handleNavigate('/admin/billing/invoice')}>
                  Generate Invoice
                </Button>
                <Button icon={<DownloadOutlined />} onClick={() => handleNavigate('/admin/billing/reports')}>
                  Financial Reports
                </Button>
                <Button icon={<SettingOutlined />} onClick={() => handleNavigate('/admin/billing/settings')}>
                  Billing Settings
                </Button>
              </Space>
            </div>
            {billingData?.plans && (
              <div>
                <Text strong>Subscription Plans</Text>
                <Row gutter={[16, 8]} style={{ marginTop: 8 }}>
                  {billingData.plans.map((plan: any, index: number) => (
                    <Col key={index} xs={24} sm={8}>
                      <Card size="small">
                        <Text strong>{plan.name}</Text>
                        <div>
                          <Text type="secondary">Users: {plan.users}</Text>
                        </div>
                        <div>
                          <Text type="secondary">Revenue: ${plan.revenue}</Text>
                        </div>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </div>
            )}
          </Space>
        </Card>
      </Space>
    </Card>
  );

  const renderAutomationTab = () => (
    <Card title="Automation Management" loading={loading}>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <StatCard 
              title="Active Workflows" 
              value={(automationJobs || []).filter(job => job.status === 'running').length} 
              icon={<ThunderboltOutlined />} 
              color="#1890ff"
              loading={loading}
            />
          </Col>
          <Col xs={24} md={8}>
            <StatCard 
              title="Tasks Completed" 
              value={automationMetrics?.totalRuns || 0} 
              icon={<CheckCircleOutlined />} 
              color="#52c41a"
              loading={loading}
            />
          </Col>
          <Col xs={24} md={8}>
            <StatCard 
              title="Failed Tasks" 
              value={automationMetrics?.failedRuns || 0} 
              icon={<WarningOutlined />} 
              color="#faad14"
              loading={loading}
            />
          </Col>
        </Row>
        <Card size="small" title="Automation Jobs">
          <Space direction="vertical" style={{ width: '100%' }}>
            {automationJobs.map((job: any) => (
              <div key={job.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Space>
                  <Tag color={job.status === 'running' ? 'blue' : job.status === 'idle' ? 'default' : 'red'}>
                    {job.status.toUpperCase()}
                  </Tag>
                  <Text strong>{job.name}</Text>
                  <Text type="secondary">{job.type}</Text>
                </Space>
                <Space>
                  <Text type="secondary">Next: {new Date(job.nextRun).toLocaleString()}</Text>
                  <Button size="small" onClick={() => handleNavigate(`/admin/automation/job/${job.id}`)}>
                    Configure
                  </Button>
                </Space>
              </div>
            ))}
          </Space>
        </Card>
        <Card size="small" title="Automation Settings">
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <div>
              <Text strong>Auto-Training</Text>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text type="secondary">Automatically retrain underperforming models</Text>
                <Switch defaultChecked />
              </div>
            </div>
            <div>
              <Text strong>SEO Optimization</Text>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text type="secondary">Auto-optimize content based on performance</Text>
                <Switch defaultChecked />
              </div>
            </div>
            <div>
              <Text strong>Backup Schedule</Text>
              <Select defaultValue="daily" style={{ width: '100%' }}>
                <Select.Option value="hourly">Hourly</Select.Option>
                <Select.Option value="daily">Daily</Select.Option>
                <Select.Option value="weekly">Weekly</Select.Option>
                <Select.Option value="monthly">Monthly</Select.Option>
              </Select>
            </div>
          </Space>
        </Card>
      </Space>
    </Card>
  );

  const renderAlertsTab = () => (
    <Card title="System Alerts" loading={loading}>
      <List
        itemLayout="horizontal"
        dataSource={systemAlerts}
        renderItem={alert => (
          <List.Item>
            <List.Item.Meta
              avatar={
                <Badge 
                  status={
                    alert.level === 'error' ? 'error' : 
                    alert.level === 'warning' ? 'warning' : 'processing'
                  } 
                />
              }
              title={
                <Space>
                  <Text strong>{alert.message}</Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>{alert.time}</Text>
                </Space>
              }
              description={
                <Space>
                  <Tag color={
                    alert.level === 'error' ? 'red' : 
                    alert.level === 'warning' ? 'orange' : 'blue'
                  }>
                    {alert.level.toUpperCase()}
                  </Tag>
                  <Button type="link" size="small">View Details</Button>
                </Space>
              }
            />
          </List.Item>
        )}
      />
    </Card>
  );

  if (error) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <Alert
          message="Error Loading Dashboard"
          description={error}
          type="error"
          showIcon
          action={
            <Button type="primary" onClick={() => window.location.reload()}>
              Retry
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', width: '100%', margin: '0', boxSizing: 'border-box' }}>
      <Space direction="vertical" size={24} style={{ width: '100%' }}>
        {/* Header */}
        <div>
          <Title level={2} style={{ margin: 0 }}>Admin Dashboard</Title>
          <Text type="secondary">Welcome back! Here's what's happening with your platform.</Text>
        </div>

        {/* Tabs */}
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'overview',
              label: (
                <span>
                  <BarChartOutlined />
                  <span>Overview</span>
                </span>
              ),
              children: renderOverviewTab(),
            },
            {
              key: 'users',
              label: (
                <span>
                  <TeamOutlined />
                  <span>Users</span>
                </span>
              ),
              children: <UserManagementTab />,
            },
            {
              key: 'neural-network',
              label: (
                <span>
                  <ExperimentOutlined />
                  <span>Neural Networks</span>
                </span>
              ),
              children: renderNeuralNetworkTab(),
            },
            {
              key: 'blockchain',
              label: (
                <span>
                  <NodeIndexOutlined />
                  <span>Blockchain</span>
                </span>
              ),
              children: renderBlockchainTab(),
            },
            {
              key: 'billing',
              label: (
                <span>
                  <WalletOutlined />
                  <span>Billing</span>
                </span>
              ),
              children: renderBillingTab(),
            },
            {
              key: 'automation',
              label: (
                <span>
                  <ThunderboltOutlined />
                  <span>Automation</span>
                </span>
              ),
              children: renderAutomationTab(),
            },
            {
              key: 'system',
              label: (
                <span>
                  <SettingOutlined />
                  <span>System</span>
                </span>
              ),
              children: renderSystemTab(),
            },
            {
              key: 'content',
              label: (
                <span>
                  <AppstoreOutlined />
                  <span>Content</span>
                </span>
              ),
              children: renderContentTab(),
            },
            {
              key: 'seo',
              label: (
                <span>
                  <GlobalOutlined />
                  <span>SEO</span>
                </span>
              ),
              children: renderSEOTab(),
            },
            {
              key: 'crawler-workflow',
              label: (
                <span>
                  <RobotOutlined />
                  <span>Crawler Workflow</span>
                </span>
              ),
              children: <CrawlerOrchestrationPanel />,
            },
            {
              key: 'alerts',
              label: (
                <span>
                  <WarningOutlined />
                  <span>Alerts</span>
                  {systemAlerts.length > 0 && (
                    <Badge count={systemAlerts.length} style={{ marginLeft: 8 }} />
                  )}
                </span>
              ),
              children: renderAlertsTab(),
            },
          ]}
        />

        {/* Quick Actions */}
        <Card 
          title="Quick Actions"
          styles={{ body: { padding: '16px' } }}
          style={{ marginTop: 16 }}
        >
          <Space wrap>
            <Button type="primary" icon={<UserOutlined />} onClick={() => handleNavigate('/admin/users')}>
              Manage Users
            </Button>
            <Button icon={<SyncOutlined />} onClick={() => window.location.reload()}>
              Refresh Data
            </Button>
            <Button icon={<BarChartOutlined />} onClick={() => handleNavigate('/admin/analytics/overview')}>
              View Analytics
            </Button>
            <Button icon={<SettingOutlined />} onClick={() => handleNavigate('/admin/settings')}>
              System Settings
            </Button>
            <Button icon={<FileTextOutlined />} onClick={() => handleNavigate('/admin/pages')}>
              Content Pages
            </Button>
            <Button icon={<GlobalOutlined />} onClick={() => handleNavigate('/admin/seo/analysis')}>
              SEO Tools
            </Button>
            <Button icon={<SafetyOutlined />} onClick={() => handleNavigate('/admin/roles')}>
              Permissions
            </Button>
            <Button icon={<DatabaseOutlined />} onClick={() => handleNavigate('/admin/media')}>
              Media Library
            </Button>
            <Button icon={<ThunderboltOutlined />} onClick={() => handleNavigate('/admin/performance')}>
              Performance
            </Button>
            <Button icon={<RocketOutlined />} onClick={() => handleNavigate('/admin/updates')}>
              Updates
            </Button>
          </Space>
        </Card>
      </Space>
    </div>
  );
};

export default AdminDashboard;