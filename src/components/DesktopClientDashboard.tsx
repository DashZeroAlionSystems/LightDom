/**
 * Desktop Client Dashboard Component
 * Exodus wallet-inspired client interface with real-time updates
 * Professional and readable design with enhanced visual hierarchy
 */

import React, { useState, useEffect, useCallback } from 'react';
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
  Tabs,
  Alert,
  Badge,
  List,
  Avatar,
  Tag,
  Divider,
  Input,
  Modal,
  Form,
  message,
  Tooltip,
  Switch,
  Dropdown,
  Menu,
  Drawer,
  notification,
  FloatButton,
  Tour,
  Select,
} from 'antd';
const { Option } = Select;
import {
  DashboardOutlined,
  ThunderboltOutlined,
  WalletOutlined,
  TrophyOutlined,
  GlobalOutlined,
  SearchOutlined,
  BarChartOutlined,
  ApiOutlined,
  SettingOutlined,
  SecurityScanOutlined,
  RocketOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  StopOutlined,
  EyeOutlined,
  DownloadOutlined,
  UploadOutlined,
  SyncOutlined,
  BellOutlined,
  QuestionCircleOutlined,
  PlusOutlined,
  MinusOutlined,
  FireOutlined,
  GiftOutlined,
  CrownOutlined,
  StarOutlined,
  BulbOutlined,
  CloudOutlined,
  DatabaseOutlined,
  LinkOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import { Line, Column, Pie, Area, Gauge } from '@ant-design/plots';
import LightDomDesignSystem, {
  LightDomColors,
  LightDomShadows,
  StatsCard,
} from '../styles/LightDomDesignSystem';
import {
  LightDomLogo,
  MiningAnimation,
  PerformanceMeterGraphic,
  FloatingParticlesGraphic,
} from '../assets/graphics/LightDomGraphics';

const { Header, Content, Sider } = Layout;
const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Search } = Input;

interface MiningStats {
  hashRate: number;
  blocksMined: number;
  difficulty: number;
  earnings: number;
  uptime: number;
  efficiency: number;
}

interface OptimizationResult {
  id: string;
  url: string;
  originalSize: number;
  optimizedSize: number;
  savings: number;
  timestamp: string;
  status: 'completed' | 'processing' | 'failed';
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  progress: number;
  total: number;
  unlocked: boolean;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface NotificationItem {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

const DesktopClientDashboard: React.FC = () => {
  const navigate = (path: string) => {
    console.log('Navigate to:', path);
    // In Electron, we can use window.location or Electron APIs
    window.location.hash = path;
  };
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [miningActive, setMiningActive] = useState(false);
  const [miningStats, setMiningStats] = useState<MiningStats>({
    hashRate: 0,
    blocksMined: 0,
    difficulty: 0,
    earnings: 0,
    uptime: 0,
    efficiency: 0,
  });
  const [optimizations, setOptimizations] = useState<OptimizationResult[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [tourVisible, setTourVisible] = useState(false);

  // Real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (miningActive) {
        setMiningStats(prev => ({
          hashRate: Math.random() * 1000 + 2000,
          blocksMined: prev.blocksMined + Math.floor(Math.random() * 3),
          difficulty: Math.random() * 1000000 + 5000000,
          earnings: prev.earnings + (Math.random() * 0.01),
          uptime: prev.uptime + 1,
          efficiency: Math.random() * 20 + 80,
        }));
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [miningActive]);

  // Initialize mock data
  useEffect(() => {
    setOptimizations([
      {
        id: '1',
        url: 'https://example.com',
        originalSize: 2500000,
        optimizedSize: 1800000,
        savings: 28,
        timestamp: '2025-10-27T10:30:00Z',
        status: 'completed',
      },
      {
        id: '2',
        url: 'https://test-site.org',
        originalSize: 1200000,
        optimizedSize: 950000,
        savings: 20.8,
        timestamp: '2025-10-27T09:15:00Z',
        status: 'completed',
      },
      {
        id: '3',
        url: 'https://demo.net',
        originalSize: 3400000,
        optimizedSize: 0,
        savings: 0,
        timestamp: '2025-10-27T11:00:00Z',
        status: 'processing',
      },
    ]);

    setAchievements([
      {
        id: '1',
        title: 'First Optimization',
        description: 'Complete your first DOM optimization',
        icon: <StarOutlined />,
        progress: 1,
        total: 1,
        unlocked: true,
        rarity: 'common',
      },
      {
        id: '2',
        title: 'Mining Pioneer',
        description: 'Mine 100 blocks',
        icon: <ThunderboltOutlined />,
        progress: 67,
        total: 100,
        unlocked: false,
        rarity: 'rare',
      },
      {
        id: '3',
        title: 'Efficiency Expert',
        description: 'Achieve 95% mining efficiency',
        icon: <GiftOutlined />,
        progress: 87,
        total: 95,
        unlocked: false,
        rarity: 'epic',
      },
      {
        id: '4',
        title: 'DOM Master',
        description: 'Optimize 1,000,000 bytes of DOM',
        icon: <CrownOutlined />,
        progress: 750000,
        total: 1000000,
        unlocked: false,
        rarity: 'legendary',
      },
    ]);

    // Show welcome notification
    notification.success({
      message: 'Welcome to LightDom Desktop',
      description: 'Your mining dashboard is ready to optimize and earn!',
      duration: 5,
    });
  }, []);

  // Chart configurations
  const earningsConfig = {
    data: [
      { time: '00:00', earnings: 0 },
      { time: '04:00', earnings: 12.5 },
      { time: '08:00', earnings: 28.3 },
      { time: '12:00', earnings: 45.7 },
      { time: '16:00', earnings: 62.1 },
      { time: '20:00', earnings: 78.9 },
    ],
    xField: 'time',
    yField: 'earnings',
    smooth: true,
    color: LightDomColors.gradients.primary,
  };

  const performanceConfig = {
    data: [
      { metric: 'Speed', value: 85, fullMark: 100 },
      { metric: 'Efficiency', value: 92, fullMark: 100 },
      { metric: 'Reliability', value: 78, fullMark: 100 },
      { metric: 'Security', value: 95, fullMark: 100 },
    ],
    xField: 'metric',
    yField: 'value',
    seriesField: 'type',
    color: LightDomColors.primary[500],
  };

  const handleMiningToggle = () => {
    setMiningActive(!miningActive);
    message.info(miningActive ? 'Mining stopped' : 'Mining started');
  };

  const handleOptimizeUrl = async (url: string) => {
    setLoading(true);
    // Simulate optimization
    setTimeout(() => {
      const newOptimization: OptimizationResult = {
        id: Date.now().toString(),
        url,
        originalSize: Math.floor(Math.random() * 3000000) + 1000000,
        optimizedSize: Math.floor(Math.random() * 2000000) + 500000,
        savings: Math.random() * 30 + 10,
        timestamp: new Date().toISOString(),
        status: 'completed',
      };
      setOptimizations(prev => [newOptimization, ...prev]);
      setLoading(false);
      message.success('Optimization completed successfully!');
    }, 3000);
  };

  const tourSteps = [
    {
      title: 'Welcome to LightDom Desktop',
      description: 'Your personal mining and optimization dashboard',
      target: () => document.querySelector('.dashboard-header'),
    },
    {
      title: 'Mining Controls',
      description: 'Start and stop mining operations here',
      target: () => document.querySelector('.mining-controls'),
    },
    {
      title: 'Real-time Stats',
      description: 'Monitor your performance and earnings',
      target: () => document.querySelector('.stats-section'),
    },
    {
      title: 'Optimization Tools',
      description: 'Optimize websites and earn rewards',
      target: () => document.querySelector('.optimization-section'),
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh', background: LightDomColors.dark.background }}>
      {/* Enhanced Professional Header */}
      <Header
        className="dashboard-header"
        style={{
          background: `linear-gradient(135deg, ${LightDomColors.dark.surface} 0%, ${LightDomColors.dark.background} 100%)`,
          borderBottom: `1px solid ${LightDomColors.dark.border}`,
          padding: '0 32px',
          height: '72px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          position: 'relative',
          zIndex: 1000,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <LightDomLogo size={36} />
            <div>
              <Title 
                level={3} 
                style={{ 
                  margin: 0, 
                  color: LightDomColors.primary[400],
                  fontSize: '20px',
                  fontWeight: 600,
                  letterSpacing: '-0.5px',
                  lineHeight: '24px'
                }}
              >
                LightDom Desktop
              </Title>
              <Text 
                type="secondary" 
                style={{ 
                  fontSize: '12px',
                  color: LightDomColors.dark.textSecondary,
                  fontWeight: 500,
                  letterSpacing: '0.1px'
                }}
              >
                Professional Mining & Optimization Platform
              </Text>
            </div>
          </div>
          
          {/* Enhanced Action Buttons */}
          <Space size="middle">
            <Button 
              type="primary" 
              size="middle"
              icon={<SecurityScanOutlined />}
              onClick={() => navigate('/admin')}
              style={{
                background: LightDomColors.gradients.primary,
                border: 'none',
                borderRadius: '8px',
                fontWeight: 500,
                height: '36px',
                paddingLeft: '16px',
                paddingRight: '16px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              }}
            >
              Admin Panel
            </Button>
            
            <Button 
              type="text" 
              size="middle"
              icon={<SettingOutlined />}
              onClick={() => setSettingsVisible(true)}
              style={{
                color: LightDomColors.dark.textSecondary,
                borderRadius: '8px',
                fontWeight: 500,
                height: '36px',
                paddingLeft: '12px',
                paddingRight: '12px',
              }}
            >
              Settings
            </Button>
            
            <Badge count={notifications.filter(n => !n.read).length} size="small">
              <Button 
                type="text" 
                size="middle"
                icon={<BellOutlined />}
                style={{
                  color: LightDomColors.dark.textSecondary,
                  borderRadius: '8px',
                  height: '36px',
                  width: '36px',
                }}
              />
            </Badge>
          </Space>
          </div>
        </Header>

      <Layout>
        {/* Enhanced Professional Sidebar */}
        <Sider
          width={300}
          style={{
            background: `linear-gradient(180deg, ${LightDomColors.dark.surface} 0%, ${LightDomColors.dark.background} 100%)`,
            borderRight: `1px solid ${LightDomColors.dark.border}`,
            boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
          }}
        >
          <div style={{ padding: '24px 16px' }}>
            {/* Enhanced Mining Status Card */}
            <Card
              size="small"
              style={{
                background: `linear-gradient(135deg, ${LightDomColors.dark.background} 0%, rgba(79, 70, 229, 0.1) 100%)`,
                border: `1px solid ${LightDomColors.primary[300]}`,
                marginBottom: '24px',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              }}
            >
              <div style={{ textAlign: 'center', padding: '8px 0' }}>
                <div style={{ marginBottom: '20px' }}>
                  <MiningAnimation size={64} />
                </div>
                
                <div className="mining-controls">
                  <Button
                    type={miningActive ? 'default' : 'primary'}
                    size="large"
                    icon={miningActive ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
                    onClick={handleMiningToggle}
                    style={{ 
                      width: '100%', 
                      marginBottom: '12px',
                      height: '44px',
                      fontWeight: 600,
                      fontSize: '14px',
                      borderRadius: '8px',
                      background: miningActive ? 'transparent' : LightDomColors.gradients.primary,
                      border: miningActive ? `1px solid ${LightDomColors.dark.border}` : 'none',
                      boxShadow: miningActive ? 'none' : '0 2px 8px rgba(79, 70, 229, 0.3)',
                    }}
                  >
                    {miningActive ? 'Stop Mining' : 'Start Mining'}
                  </Button>
                  
                  <div style={{ 
                    fontSize: '13px', 
                    color: miningActive ? LightDomColors.primary[400] : LightDomColors.dark.textSecondary,
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: miningActive ? LightDomColors.success[500] : LightDomColors.dark.textSecondary,
                      animation: miningActive ? 'pulse 2s infinite' : 'none'
                    }} />
                    {miningActive ? 'Mining Active' : 'Mining Inactive'}
                  </div>
                </div>
              </div>
            </Card>

            {/* Enhanced Navigation Menu */}
            <div style={{ marginBottom: '24px' }}>
              <Title 
                level={5} 
                style={{ 
                  color: LightDomColors.dark.textSecondary,
                  fontSize: '12px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  margin: '0 0 16px 16px',
                }}
              >
                Navigation
              </Title>
              <Menu
                mode="inline"
                selectedKeys={[activeTab]}
                onClick={({ key }) => setActiveTab(key)}
                style={{ 
                  background: 'transparent', 
                  border: 'none',
                  fontSize: '14px',
                }}
              >
              <Menu.Item key="overview" icon={<DashboardOutlined />}>
                Dashboard
              </Menu.Item>
              <Menu.Item key="mining" icon={<ThunderboltOutlined />}>
                Mining Console
              </Menu.Item>
              <Menu.Item key="optimization" icon={<BulbOutlined />}>
                DOM Optimizer
              </Menu.Item>
              <Menu.Item key="portfolio" icon={<WalletOutlined />}>
                Portfolio
              </Menu.Item>
              <Menu.Item key="achievements" icon={<TrophyOutlined />}>
                Achievements
              </Menu.Item>
              <Menu.Item key="analytics" icon={<BarChartOutlined />}>
                Analytics
              </Menu.Item>
              <Menu.Item key="settings" icon={<SettingOutlined />}>
                Settings
              </Menu.Item>
            </Menu>
          </div>
        </div>
        </Sider>

        {/* Enhanced Main Content Area */}
        <Content style={{ 
          padding: '32px', 
          overflow: 'auto',
          background: LightDomColors.dark.background,
          minHeight: 'calc(100vh - 72px)',
        }}>
          <Tabs 
            activeKey={activeTab} 
            onChange={setActiveTab} 
            type="card"
            size="large"
            style={{
              marginBottom: '24px',
            }}
            tabBarStyle={{
              background: LightDomColors.dark.surface,
              borderRadius: '12px',
              padding: '8px',
              marginBottom: '24px',
              border: `1px solid ${LightDomColors.dark.border}`,
            }}
          >
            {/* Enhanced Dashboard Overview */}
            <TabPane tab={<span><DashboardOutlined /> Dashboard</span>} key="overview">
              {/* Section Header */}
              <div style={{ marginBottom: '32px' }}>
                <Title 
                  level={2} 
                  style={{ 
                    color: LightDomColors.dark.text,
                    fontSize: '28px',
                    fontWeight: 700,
                    margin: 0,
                    marginBottom: '8px',
                  }}
                >
                  Mining Dashboard
                </Title>
                <Text 
                  style={{ 
                    fontSize: '16px',
                    color: LightDomColors.dark.textSecondary,
                    fontWeight: 400,
                  }}
                >
                  Monitor your mining performance and optimization results in real-time
                </Text>
              </div>
              
              <Row gutter={[24, 24]}>
                {/* Enhanced Quick Stats */}
                <Col span={24} className="stats-section">
                  <div style={{ marginBottom: '24px' }}>
                    <Title 
                      level={4} 
                      style={{ 
                        color: LightDomColors.dark.text,
                        fontSize: '18px',
                        fontWeight: 600,
                        margin: 0,
                        marginBottom: '16px',
                      }}
                    >
                      Performance Metrics
                    </Title>
                  </div>
                  <Row gutter={[20, 20]}>
                    <Col xs={24} sm={12} lg={6}>
                      <StatsCard
                        title="Hash Rate"
                        value={`${miningStats.hashRate.toFixed(1)} MH/s`}
                        change={12.5}
                        icon={<ThunderboltOutlined />}
                      />
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                      <StatsCard
                        title="Earnings"
                        value={`$${miningStats.earnings.toFixed(2)}`}
                        change={8.3}
                        icon={<WalletOutlined />}
                      />
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                      <StatsCard
                        title="Efficiency"
                        value={`${miningStats.efficiency.toFixed(1)}%`}
                        change={2.1}
                        icon={<RocketOutlined />}
                      />
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                      <StatsCard
                        title="Blocks Mined"
                        value={miningStats.blocksMined}
                        change={5.7}
                        icon={<DatabaseOutlined />}
                      />
                    </Col>
                  </Row>
                </Col>

                {/* Earnings Chart */}
                <Col span={16}>
                  <Card
                    title="Earnings Overview"
                    style={{
                      background: LightDomColors.dark.surface,
                      border: `1px solid ${LightDomColors.dark.border}`,
                    }}
                  >
                    <Area {...earningsConfig} height={300} />
                  </Card>
                </Col>

                {/* Performance Gauge */}
                <Col span={8}>
                  <Card
                    title="Performance Metrics"
                    style={{
                      background: LightDomColors.dark.surface,
                      border: `1px solid ${LightDomColors.dark.border}`,
                    }}
                  >
                    <Column {...performanceConfig} height={300} />
                  </Card>
                </Col>

                {/* Recent Activity */}
                <Col span={24}>
                  <Card
                    title="Recent Activity"
                    style={{
                      background: LightDomColors.dark.surface,
                      border: `1px solid ${LightDomColors.dark.border}`,
                    }}
                  >
                    <List
                      dataSource={optimizations.slice(0, 5)}
                      renderItem={(item) => (
                        <List.Item>
                          <List.Item.Meta
                            avatar={
                              <Avatar
                                icon={
                                  item.status === 'completed' ? (
                                    <CheckCircleOutlined />
                                  ) : item.status === 'processing' ? (
                                    <SyncOutlined spin />
                                  ) : (
                                    <ExclamationCircleOutlined />
                                  )
                                }
                                style={{
                                  backgroundColor:
                                    item.status === 'completed'
                                      ? LightDomColors.status.success
                                      : item.status === 'processing'
                                      ? LightDomColors.status.warning
                                      : LightDomColors.status.error,
                                }}
                              />
                            }
                            title={`Optimized ${item.url}`}
                            description={`Saved ${item.savings.toFixed(1)}% • ${new Date(
                              item.timestamp
                            ).toLocaleString()}`}
                          />
                        </List.Item>
                      )}
                    />
                  </Card>
                </Col>
              </Row>
            </TabPane>

            {/* Mining Console */}
            <TabPane tab="Mining Console" key="mining">
              <Row gutter={[24, 24]}>
                <Col span={24}>
                  <Card
                    title="Mining Operations"
                    style={{
                      background: LightDomColors.dark.surface,
                      border: `1px solid ${LightDomColors.dark.border}`,
                    }}
                  >
                    <Row gutter={[16, 16]}>
                      <Col span={12}>
                        <Space direction="vertical" style={{ width: '100%' }}>
                          <Statistic
                            title="Current Hash Rate"
                            value={miningStats.hashRate}
                            suffix="MH/s"
                            valueStyle={{ color: LightDomColors.primary[500] }}
                          />
                          <Progress
                            percent={miningStats.efficiency}
                            strokeColor={LightDomColors.gradients.primary}
                            trailColor={LightDomColors.dark.border}
                          />
                          <Text type="secondary">Mining Efficiency</Text>
                        </Space>
                      </Col>
                      <Col span={12}>
                        <Space direction="vertical" style={{ width: '100%' }}>
                          <Statistic
                            title="Total Earnings"
                            value={miningStats.earnings}
                            prefix="$"
                            precision={2}
                            valueStyle={{ color: LightDomColors.accent.green }}
                          />
                          <Statistic
                            title="Uptime"
                            value={Math.floor(miningStats.uptime / 3600)}
                            suffix="hours"
                            valueStyle={{ color: LightDomColors.accent.orange }}
                          />
                        </Space>
                      </Col>
                    </Row>
                  </Card>
                </Col>
              </Row>
            </TabPane>

            {/* DOM Optimizer */}
            <TabPane tab="DOM Optimizer" key="optimization" className="optimization-section">
              <Row gutter={[24, 24]}>
                <Col span={24}>
                  <Card
                    title="Website Optimizer"
                    style={{
                      background: LightDomColors.dark.surface,
                      border: `1px solid ${LightDomColors.dark.border}`,
                    }}
                  >
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Search
                        placeholder="Enter website URL to optimize..."
                        enterButton="Optimize"
                        size="large"
                        loading={loading}
                        onSearch={handleOptimizeUrl}
                      />
                      <Alert
                        message="How it works"
                        description="Enter a website URL and our advanced DOM optimization algorithms will analyze and optimize the structure, reducing file size and improving performance while earning you DSH tokens."
                        type="info"
                        showIcon
                      />
                    </Space>
                  </Card>
                </Col>

                <Col span={24}>
                  <Card
                    title="Optimization History"
                    style={{
                      background: LightDomColors.dark.surface,
                      border: `1px solid ${LightDomColors.dark.border}`,
                    }}
                  >
                    <List
                      dataSource={optimizations}
                      renderItem={(item) => (
                        <List.Item
                          actions={[
                            <Button
                              type="link"
                              icon={<DownloadOutlined />}
                              onClick={() => message.info('Download optimized files')}
                            >
                              Download
                            </Button>,
                            <Button
                              type="link"
                              icon={<EyeOutlined />}
                              onClick={() => message.info('View optimization details')}
                            >
                              Details
                            </Button>,
                          ]}
                        >
                          <List.Item.Meta
                            title={item.url}
                            description={
                              <Space>
                                <Text>Original: {(item.originalSize / 1000000).toFixed(2)} MB</Text>
                                <Text>Optimized: {(item.optimizedSize / 1000000).toFixed(2)} MB</Text>
                                <Text style={{ color: LightDomColors.accent.green }}>
                                  Saved: {item.savings.toFixed(1)}%
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
            </TabPane>

            {/* Achievements */}
            <TabPane tab="Achievements" key="achievements">
              <Row gutter={[24, 24]}>
                <Col span={24}>
                  <Card
                    title="Your Achievements"
                    style={{
                      background: LightDomColors.dark.surface,
                      border: `1px solid ${LightDomColors.dark.border}`,
                    }}
                  >
                    <Row gutter={[16, 16]}>
                      {achievements.map((achievement) => (
                        <Col xs={24} sm={12} lg={6} key={achievement.id}>
                          <Card
                            hoverable
                            style={{
                              background: achievement.unlocked
                                ? LightDomColors.dark.background
                                : LightDomColors.dark.surface,
                              border: `1px solid ${
                                achievement.unlocked
                                  ? LightDomColors.primary[500]
                                  : LightDomColors.dark.border
                              }`,
                              textAlign: 'center',
                            }}
                          >
                            <div style={{ fontSize: '32px', marginBottom: '16px' }}>
                              {achievement.icon}
                            </div>
                            <Title level={5} style={{ margin: '8px 0' }}>
                              {achievement.title}
                            </Title>
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                              {achievement.description}
                            </Text>
                            <Progress
                              percent={(achievement.progress / achievement.total) * 100}
                              size="small"
                              style={{ marginTop: '16px' }}
                              strokeColor={
                                achievement.unlocked
                                  ? LightDomColors.gradients.primary
                                  : LightDomColors.dark.border
                              }
                            />
                            <Tag
                              color={
                                achievement.rarity === 'legendary'
                                  ? 'purple'
                                  : achievement.rarity === 'epic'
                                  ? 'blue'
                                  : achievement.rarity === 'rare'
                                  ? 'orange'
                                  : 'default'
                              }
                              style={{ marginTop: '8px' }}
                            >
                              {achievement.rarity.toUpperCase()}
                            </Tag>
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  </Card>
                </Col>
              </Row>
            </TabPane>
          </Tabs>
        </Content>
      </Layout>

      {/* Settings Drawer */}
      <Drawer
        title="Settings"
        placement="right"
        onClose={() => setSettingsVisible(false)}
        visible={settingsVisible}
        width={400}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <Title level={5}>Mining Settings</Title>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text>Auto-start mining</Text>
                <Switch defaultChecked={false} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text>Maximum CPU usage</Text>
                <Select defaultValue="80" style={{ width: 100 }}>
                  <Option value="50">50%</Option>
                  <Option value="80">80%</Option>
                  <Option value="100">100%</Option>
                </Select>
              </div>
            </Space>
          </div>
          <Divider />
          <div>
            <Title level={5}>Notifications</Title>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text>Desktop notifications</Text>
                <Switch defaultChecked={true} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text>Sound alerts</Text>
                <Switch defaultChecked={false} />
              </div>
            </Space>
          </div>
          <Divider />
          <div>
            <Title level={5}>Appearance</Title>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text>Dark theme</Text>
                <Switch defaultChecked={true} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text>Animations</Text>
                <Switch defaultChecked={true} />
              </div>
            </Space>
          </div>
        </Space>
      </Drawer>

      {/* Interactive Tour */}
      <Tour
        steps={tourSteps}
        isOpen={tourVisible}
        onRequestClose={() => setTourVisible(false)}
      />

      {/* Enhanced Floating Action Button */}
      <FloatButton.Group
        trigger="hover"
        type="primary"
        style={{ 
          right: 32,
          bottom: 32,
        }}
        icon={<PlusOutlined />}
      >
        <FloatButton
          icon={<SyncOutlined />}
          tooltip="Refresh Data"
          onClick={() => message.info('Data refreshed')}
        />
        <FloatButton
          icon={<QuestionCircleOutlined />}
          tooltip="Help Center"
          onClick={() => setTourVisible(true)}
        />
      </FloatButton.Group>
      
      {/* Professional CSS Animations */}
      <style>{`
        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(34, 197, 94, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(34, 197, 94, 0);
          }
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .ant-card {
          animation: slideIn 0.3s ease-out;
        }
        
        .ant-statistic {
          transition: all 0.3s ease;
        }
        
        .ant-statistic:hover {
          transform: translateY(-2px);
        }
        
        .ant-tabs-tab {
          font-weight: 500 !important;
          transition: all 0.3s ease !important;
        }
        
        .ant-tabs-tab:hover {
          transform: translateY(-1px) !important;
        }
        
        .ant-menu-item {
          transition: all 0.2s ease !important;
          margin: 4px 8px !important;
          border-radius: 8px !important;
        }
        
        .ant-menu-item:hover {
          transform: translateX(4px) !important;
        }
        
        .ant-menu-item-selected {
          background: rgba(79, 70, 229, 0.1) !important;
          border-radius: 8px !important;
        }
      `}</style>
    </Layout>
  );
};

export default DesktopClientDashboard;
