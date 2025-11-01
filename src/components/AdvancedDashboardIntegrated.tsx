/**
 * Advanced Integrated Dashboard with All Components
 * Comprehensive dashboard with SEO, mining, blockchain, metaverse, automation, and ML features
 */

import React, { useState, useEffect, useCallback } from 'react';
import NeuralNetworkPage from './pages/NeuralNetworkPage';
import SEOContentGeneratorPage from './pages/SEOContentGeneratorPage';
import {
  Layout,
  Card,
  Row,
  Col,
  Typography,
  Space,
  Statistic,
  Progress,
  Button,
  Alert,
  Badge,
  Avatar,
  List,
  Tag,
  Menu,
  Drawer,
  Tooltip,
  Switch,
  InputNumber,
  Select,
  Table,
  Tabs,
  Slider,
  DatePicker,
  Input,
  Modal,
  Form,
  message,
  Spin,
  Empty,
  Divider,
  Timeline,
  Rate,
  Dropdown,
  MenuProps,
} from 'antd';
import {
  DashboardOutlined,
  ThunderboltOutlined,
  WalletOutlined,
  TrophyOutlined,
  RocketOutlined,
  BarChartOutlined,
  LineChartOutlined,
  PieChartOutlined,
  ExperimentOutlined,
  RobotOutlined,
  ClusterOutlined,
  GlobalOutlined,
  MessageOutlined,
  DiamondOutlined,
  PlayCircleOutlined,
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
  SearchOutlined,
  FilterOutlined,
  SortAscendingOutlined,
  CalendarOutlined,
  UserOutlined,
  TeamOutlined,
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
  StarOutlined,
  CrownOutlined,
  GiftOutlined,
  FireOutlined,
  HeartOutlined,
  BulbOutlined,
  LightbulbOutlined,
  ThunderboltFilled,
  PlayCircleFilled,
  PauseCircleFilled,
  StopFilled,
  CpuOutlined,
  MemoryOutlined,
  HardDriveOutlined,
  WifiOutlined,
  ApiFilled,
  DatabaseFilled,
  CloudFilled,
  LineChartFilled,
  BarChartFilled,
  PieChartFilled,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  MinusOutlined,
  SecurityScanOutlined,
  FundOutlined,
  NodeIndexOutlined,
  WalletFilled,
  TrophyFilled,
  RocketFilled,
  StarFilled,
} from '@ant-design/icons';

// Import new components - Disabled to fix import errors
// import SEOContentGenerator from './SEOContentGenerator';
// import BlockchainRewards from './BlockchainRewards';
// import MetaversePortal from './MetaversePortal';
// import AutomationWorkflows from './AutomationWorkflows';
// import TensorFlowAdmin from './TensorFlowAdmin';

// import { apiService } from '../services/apiService';

const { Header, Sider, Content } = Layout;
const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

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

// Enhanced spacing system
const Spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  xxl: '48px',
  xxxl: '64px',
};

// Component sizes
const ComponentSizes = {
  card: {
    small: { height: '120px' },
    medium: { height: '200px' },
    large: { height: '300px' },
  },
  button: {
    small: { height: '32px', padding: '0 16px' },
    medium: { height: '40px', padding: '0 24px' },
    large: { height: '48px', padding: '0 32px' },
  },
  header: {
    small: '64px',
    medium: '72px',
    large: '80px',
  }
};

// Typography styles
const TypographyStyles = {
  headlineLarge: {
    fontSize: '32px',
    fontWeight: 700,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  headlineMedium: {
    fontSize: '24px',
    fontWeight: 600,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  headlineSmall: {
    fontSize: '20px',
    fontWeight: 500,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  bodyLarge: {
    fontSize: '16px',
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  bodyMedium: {
    fontSize: '14px',
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  bodySmall: {
    fontSize: '12px',
    color: Colors.textTertiary,
    marginBottom: Spacing.xs,
  },
};

// Interface definitions
interface DashboardData {
  overview: {
    totalUsers: number;
    activeUsers: number;
    totalRevenue: number;
    growthRate: number;
  };
  seo: {
    score: number;
    keywords: number;
    backlinks: number;
    rankings: number;
  };
  mining: {
    hashRate: number;
    blocksMined: number;
    revenue: number;
    efficiency: number;
  };
  blockchain: {
    transactions: number;
    walletBalance: number;
    stakedAmount: number;
    rewards: number;
  };
  metaverse: {
    activeWorlds: number;
    totalUsers: number;
    bridges: number;
    economy: number;
  };
  spaceMining: {
    storageUsed: number;
    storageTotal: number;
    nodes: number;
    bandwidth: number;
  };
  analytics: {
    pageViews: number;
    bounceRate: number;
    sessionDuration: number;
    conversionRate: number;
  };
  system: {
    cpu: number;
    memory: number;
    disk: number;
    network: number;
  };
}

const AdvancedDashboardIntegrated: React.FC = () => {
  // State management
  const [loading, setLoading] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30000);
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [settingsVisible, setSettingsVisible] = useState(false);

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Mock API call - replace with actual API
      const mockData: DashboardData = {
        overview: {
          totalUsers: 15420,
          activeUsers: 8932,
          totalRevenue: 2847500,
          growthRate: 23.5,
        },
        seo: {
          score: 94.2,
          keywords: 1250,
          backlinks: 890,
          rankings: 156,
        },
        mining: {
          hashRate: 125.8,
          blocksMined: 89,
          revenue: 45670,
          efficiency: 87.3,
        },
        blockchain: {
          transactions: 45670,
          walletBalance: 125000,
          stakedAmount: 50000,
          rewards: 8920,
        },
        metaverse: {
          activeWorlds: 12,
          totalUsers: 5670,
          bridges: 8,
          economy: 2340000,
        },
        spaceMining: {
          storageUsed: 750000000000,
          storageTotal: 1000000000000,
          nodes: 45,
          bandwidth: 1250,
        },
        analytics: {
          pageViews: 892340,
          bounceRate: 32.5,
          sessionDuration: 245,
          conversionRate: 4.8,
        },
        system: {
          cpu: 67.8,
          memory: 72.3,
          disk: 45.6,
          network: 23.4,
        },
      };
      
      setDashboardData(mockData);
      
      // Mock notifications
      const mockNotifications = [
        {
          id: '1',
          type: 'success',
          title: 'SEO Campaign Completed',
          message: 'Your SEO optimization campaign has been completed successfully.',
          timestamp: new Date().toISOString(),
          read: false,
        },
        {
          id: '2',
          type: 'warning',
          title: 'Mining Efficiency Drop',
          message: 'Mining efficiency has dropped by 5%. Consider optimizing parameters.',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          read: false,
        },
        {
          id: '3',
          type: 'info',
          title: 'New Metaverse Bridge',
          message: 'A new metaverse bridge has been established in Tokyo.',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          read: true,
        },
      ];
      
      setNotifications(mockNotifications);
      
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      message.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize component
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Auto-refresh effect
  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      const interval = setInterval(fetchDashboardData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, fetchDashboardData]);

  // Render overview tab
  const renderOverview = () => (
    <Row gutter={[Spacing.lg, Spacing.lg]}>
      <Col xs={24} lg={6}>
        <Card
          style={{
            background: Colors.surface,
            border: `1px solid ${Colors.border}`,
            borderRadius: '12px',
            ...ComponentSizes.card.medium,
          }}
        >
          <Statistic
            title="Total Users"
            value={dashboardData?.overview.totalUsers || 0}
            prefix={<UserOutlined />}
            valueStyle={{ color: Colors.primary }}
          />
          <Progress
            percent={23.5}
            strokeColor={Colors.gradients.success}
            showInfo={false}
            style={{ marginTop: Spacing.sm }}
          />
          <Text style={{ ...TypographyStyles.bodySmall, marginTop: Spacing.xs }}>
            +23.5% from last month
          </Text>
        </Card>
      </Col>
      <Col xs={24} lg={6}>
        <Card
          style={{
            background: Colors.surface,
            border: `1px solid ${Colors.border}`,
            borderRadius: '12px',
            ...ComponentSizes.card.medium,
          }}
        >
          <Statistic
            title="Active Users"
            value={dashboardData?.overview.activeUsers || 0}
            prefix={<TeamOutlined />}
            valueStyle={{ color: Colors.success }}
          />
          <Progress
            percent={57.9}
            strokeColor={Colors.gradients.primary}
            showInfo={false}
            style={{ marginTop: Spacing.sm }}
          />
          <Text style={{ ...TypographyStyles.bodySmall, marginTop: Spacing.xs }}>
            57.9% of total users
          </Text>
        </Card>
      </Col>
      <Col xs={24} lg={6}>
        <Card
          style={{
            background: Colors.surface,
            border: `1px solid ${Colors.border}`,
            borderRadius: '12px',
            ...ComponentSizes.card.medium,
          }}
        >
          <Statistic
            title="Revenue"
            value={dashboardData?.overview.totalRevenue || 0}
            prefix={<WalletOutlined />}
            valueStyle={{ color: Colors.warning }}
            formatter={(value) => `$${Number(value).toLocaleString()}`}
          />
          <Progress
            percent={18.2}
            strokeColor={Colors.gradients.warning}
            showInfo={false}
            style={{ marginTop: Spacing.sm }}
          />
          <Text style={{ ...TypographyStyles.bodySmall, marginTop: Spacing.xs }}>
            +18.2% growth rate
          </Text>
        </Card>
      </Col>
      <Col xs={24} lg={6}>
        <Card
          style={{
            background: Colors.surface,
            border: `1px solid ${Colors.border}`,
            borderRadius: '12px',
            ...ComponentSizes.card.medium,
          }}
        >
          <Statistic
            title="Growth Rate"
            value={dashboardData?.overview.growthRate || 0}
            suffix="%"
            prefix={<RocketOutlined />}
            valueStyle={{ color: Colors.info }}
          />
          <Progress
            percent={23.5}
            strokeColor={Colors.gradients.info}
            showInfo={false}
            style={{ marginTop: Spacing.sm }}
          />
          <Text style={{ ...TypographyStyles.bodySmall, marginTop: Spacing.xs }}>
            Monthly growth
          </Text>
        </Card>
      </Col>
    </Row>
  );

  // Render system status
  const renderSystemStatus = () => (
    <Row gutter={[Spacing.lg, Spacing.lg]}>
      <Col xs={24} lg={12}>
        <Card
          title={
            <Space>
              <MonitorOutlined style={{ color: Colors.info }} />
              <span>System Resources</span>
            </Space>
          }
          style={{
            background: Colors.surface,
            border: `1px solid ${Colors.border}`,
            borderRadius: '12px',
          }}
        >
          <Space direction="vertical" style={{ width: '100%' }} size={Spacing.lg}>
            <div>
              <Text strong style={{ color: Colors.text }}>CPU Usage</Text>
              <Progress
                percent={dashboardData?.system.cpu || 0}
                strokeColor={Colors.gradients.primary}
                format={(percent) => `${percent}%`}
              />
            </div>
            <div>
              <Text strong style={{ color: Colors.text }}>Memory Usage</Text>
              <Progress
                percent={dashboardData?.system.memory || 0}
                strokeColor={Colors.gradients.warning}
                format={(percent) => `${percent}%`}
              />
            </div>
            <div>
              <Text strong style={{ color: Colors.text }}>Disk Usage</Text>
              <Progress
                percent={dashboardData?.system.disk || 0}
                strokeColor={Colors.gradients.error}
                format={(percent) => `${percent}%`}
              />
            </div>
            <div>
              <Text strong style={{ color: Colors.text }}>Network Usage</Text>
              <Progress
                percent={dashboardData?.system.network || 0}
                strokeColor={Colors.gradients.success}
                format={(percent) => `${percent}%`}
              />
            </div>
          </Space>
        </Card>
      </Col>
      <Col xs={24} lg={12}>
        <Card
          title={
            <Space>
              <BellOutlined style={{ color: Colors.warning }} />
              <span>Recent Notifications</span>
            </Space>
          }
          extra={
            <Button
              type="link"
              icon={<SettingOutlined />}
              onClick={() => setSettingsVisible(true)}
            >
              Settings
            </Button>
          }
          style={{
            background: Colors.surface,
            border: `1px solid ${Colors.border}`,
            borderRadius: '12px',
          }}
        >
          <List
            dataSource={notifications.slice(0, 5)}
            renderItem={(item) => (
              <List.Item>
                <List.Item.Meta
                  avatar={
                    <Avatar
                      style={{
                        backgroundColor: item.type === 'success' ? Colors.success :
                                        item.type === 'warning' ? Colors.warning :
                                        item.type === 'error' ? Colors.error : Colors.info,
                      }}
                      icon={
                        item.type === 'success' ? <CheckCircleOutlined /> :
                        item.type === 'warning' ? <WarningOutlined /> :
                        item.type === 'error' ? <ExclamationCircleOutlined /> :
                        <InfoCircleOutlined />
                      }
                    />
                  }
                  title={
                    <Text style={{ color: Colors.text, fontSize: '14px' }}>
                      {item.title}
                    </Text>
                  }
                  description={
                    <Space direction="vertical" size={0}>
                      <Text style={{ color: Colors.textSecondary, fontSize: '12px' }}>
                        {item.message}
                      </Text>
                      <Text style={{ color: Colors.textTertiary, fontSize: '10px' }}>
                        {new Date(item.timestamp).toLocaleString()}
                      </Text>
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        </Card>
      </Col>
    </Row>
  );

  // Render quick actions
  const renderQuickActions = () => (
    <Card
      title={
        <Space>
          <ThunderboltOutlined style={{ color: Colors.primary }} />
          <span>Quick Actions</span>
        </Space>
      }
      style={{
        background: Colors.surface,
        border: `1px solid ${Colors.border}`,
        borderRadius: '12px',
        marginBottom: Spacing.lg,
      }}
    >
      <Row gutter={[Spacing.md, Spacing.md]}>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Button
            type="primary"
            icon={<RobotOutlined />}
            size="large"
            style={{
              background: Colors.gradients.primary,
              border: 'none',
              borderRadius: '8px',
              width: '100%',
              height: '60px',
            }}
            onClick={() => setActiveTab('seo')}
          >
            Generate SEO Content
          </Button>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Button
            type="primary"
            icon={<PlayCircleOutlined />}
            size="large"
            style={{
              background: Colors.gradients.success,
              border: 'none',
              borderRadius: '8px',
              width: '100%',
              height: '60px',
            }}
            onClick={() => setActiveTab('automation')}
          >
            Start Workflow
          </Button>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Button
            type="primary"
            icon={<ExperimentOutlined />}
            size="large"
            style={{
              background: Colors.gradients.warning,
              border: 'none',
              borderRadius: '8px',
              width: '100%',
              height: '60px',
            }}
            onClick={() => setActiveTab('tensorflow')}
          >
            Train Model
          </Button>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Button
            type="primary"
            icon={<GlobalOutlined />}
            size="large"
            style={{
              background: Colors.gradients.secondary,
              border: 'none',
              borderRadius: '8px',
              width: '100%',
              height: '60px',
            }}
            onClick={() => setActiveTab('metaverse')}
          >
            Enter Metaverse
          </Button>
        </Col>
      </Row>
    </Card>
  );

  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: Colors.background }}>
      <Header
        style={{
          background: Colors.surface,
          padding: `0 ${Spacing.lg}`,
          borderBottom: `1px solid ${Colors.border}`,
          height: ComponentSizes.header.medium,
        }}
      >
        <Row justify="space-between" align="middle" style={{ height: '100%' }}>
          <Col>
            <Space align="center">
              <Button
                type="text"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setCollapsed(!collapsed)}
                style={{ color: Colors.text }}
              />
              <Avatar
                size="large"
                style={{
                  background: Colors.gradients.primary,
                  border: `2px solid ${Colors.primaryLight}`,
                }}
                icon={<DashboardOutlined />}
              />
              <div>
                <Title level={3} style={{ ...TypographyStyles.headlineSmall, margin: 0 }}>
                  LightDom Dashboard
                </Title>
                <Text style={{ ...TypographyStyles.bodySmall }}>
                  Advanced Integrated Control Center
                </Text>
              </div>
            </Space>
          </Col>
          <Col>
            <Space>
              <Select
                value={selectedTimeRange}
                onChange={setSelectedTimeRange}
                style={{ width: 120 }}
                options={[
                  { label: 'Last Hour', value: '1h' },
                  { label: 'Last 24h', value: '24h' },
                  { label: 'Last Week', value: '7d' },
                  { label: 'Last Month', value: '30d' },
                ]}
              />
              <Tooltip title="Auto Refresh">
                <Switch
                  checked={autoRefresh}
                  onChange={setAutoRefresh}
                  checkedChildren={<SyncOutlined spin />}
                  unCheckedChildren={<PauseCircleOutlined />}
                />
              </Tooltip>
              <Button
                type="text"
                icon={<BellOutlined />}
                style={{ color: Colors.text }}
                onClick={() => message.info('Notifications clicked')}
              />
              <Button
                type="text"
                icon={<SettingOutlined />}
                style={{ color: Colors.text }}
                onClick={() => setSettingsVisible(true)}
              />
            </Space>
          </Col>
        </Row>
      </Header>

      <Content style={{ padding: Spacing.lg }}>
        {renderQuickActions()}

        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          style={{ color: Colors.text }}
          items={[
            {
              key: 'overview',
              label: (
                <Space>
                  <DashboardOutlined />
                  <span>Overview</span>
                </Space>
              ),
              children: (
                <Space direction="vertical" style={{ width: '100%' }} size={Spacing.xl}>
                  {renderOverview()}
                  {renderSystemStatus()}
                </Space>
              ),
            },
            {
              key: 'seo',
              label: (
                <Space>
                  <RobotOutlined />
                  <span>SEO Generator</span>
                </Space>
              ),
              children: <SEOContentGeneratorPage />,
            },
            {
              key: 'rewards',
              label: (
                <Space>
                  <TrophyOutlined />
                  <span>Blockchain Rewards</span>
                </Space>
              ),
              children: (
                <Card title="Blockchain Rewards" style={{ background: Colors.surface, border: `1px solid ${Colors.border}` }}>
                  <p>Blockchain rewards functionality coming soon...</p>
                </Card>
              ),
            },
            {
              key: 'metaverse',
              label: (
                <Space>
                  <GlobalOutlined />
                  <span>Metaverse Portal</span>
                </Space>
              ),
              children: (
                <Card title="Metaverse Portal" style={{ background: Colors.surface, border: `1px solid ${Colors.border}` }}>
                  <p>Metaverse portal functionality coming soon...</p>
                </Card>
              ),
            },
            {
              key: 'automation',
              label: (
                <Space>
                  <ExperimentOutlined />
                  <span>Automation Workflows</span>
                </Space>
              ),
              children: (
                <Card title="Automation Workflows" style={{ background: Colors.surface, border: `1px solid ${Colors.border}` }}>
                  <p>Automation workflows functionality coming soon...</p>
                </Card>
              ),
            },
            {
              key: 'tensorflow',
              label: (
                <Space>
                  <ExperimentOutlined />
                  <span>Neural Networks</span>
                </Space>
              ),
              children: <NeuralNetworkPage />,
            },
          ]}
        />
      </Content>

      {/* Settings Drawer */}
      <Drawer
        title={
          <Space>
            <SettingOutlined style={{ color: Colors.primary }} />
            <span>Dashboard Settings</span>
          </Space>
        }
        placement="right"
        onClose={() => setSettingsVisible(false)}
        open={settingsVisible}
        width={400}
        style={{
          backgroundColor: Colors.surface,
        }}
      >
        <Space direction="vertical" size={Spacing.xl} style={{ width: '100%' }}>
          <Card size="small" style={{ backgroundColor: Colors.surfaceLight, border: `1px solid ${Colors.border}` }}>
            <Title level={5} style={{ color: Colors.text, marginBottom: Spacing.md }}>
              Refresh Settings
            </Title>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ color: Colors.text }}>Auto Refresh</Text>
                <Switch checked={autoRefresh} onChange={setAutoRefresh} />
              </div>
              <div>
                <Text style={{ color: Colors.text }}>Refresh Interval</Text>
                <Slider
                  min={5000}
                  max={300000}
                  step={5000}
                  value={refreshInterval}
                  onChange={setRefreshInterval}
                  marks={{
                    5000: '5s',
                    30000: '30s',
                    60000: '1m',
                    300000: '5m',
                  }}
                />
              </div>
            </Space>
          </Card>
          
          <Card size="small" style={{ backgroundColor: Colors.surfaceLight, border: `1px solid ${Colors.border}` }}>
            <Title level={5} style={{ color: Colors.text, marginBottom: Spacing.md }}>
              Display Settings
            </Title>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ color: Colors.text }}>Compact Mode</Text>
                <Switch />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ color: Colors.text }}>Show Animations</Text>
                <Switch defaultChecked />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ color: Colors.text }}>Dark Mode</Text>
                <Switch defaultChecked />
              </div>
            </Space>
          </Card>
        </Space>
      </Drawer>
    </Layout>
  );
};

export default AdvancedDashboardIntegrated;
