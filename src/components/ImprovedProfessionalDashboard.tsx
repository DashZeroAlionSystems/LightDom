/**
 * Improved Professional Dashboard
 * Enhanced spacing, tooltips, and navigation without complex dependencies
 */

import React, { useState, useEffect } from 'react';
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
} from 'antd';
import {
  DashboardOutlined,
  ThunderboltOutlined,
  WalletOutlined,
  TrophyOutlined,
  RocketOutlined,
  BarChartOutlined,
  SettingOutlined,
  SecurityScanOutlined,
  BellOutlined,
  UserOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  ApiOutlined,
  GlobalOutlined,
  SearchOutlined,
  DatabaseOutlined,
  ClusterOutlined,
  ExperimentOutlined,
  BugOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FireOutlined,
  StarOutlined,
  CrownOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  InfoCircleOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  DownloadOutlined,
  UploadOutlined,
  SendOutlined,
  ReceiveOutlined,
  GiftOutlined,
  MedalOutlined,
  DiamondOutlined,
  HeartOutlined,
} from '@ant-design/icons';

import DOMOptimizerPage from './pages/DOMOptimizerPage';
import PortfolioPage from './pages/PortfolioPage';
import AchievementsPage from './pages/AchievementsPage';

const { Header, Content, Sider } = Layout;
const { Title, Text } = Typography;
const { TabPane } = Tabs;

// Simplified but professional color system
const Colors = {
  primary: '#7c3aed',
  primaryLight: '#a855f7',
  secondary: '#ec4899',
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#0ea5e9',
  
  // Dark theme
  background: '#0a0a0a',
  surface: '#171717',
  surfaceLight: '#262626',
  border: '#404040',
  text: '#fafafa',
  textSecondary: '#a3a3a3',
  textTertiary: '#737373',
  
  // Gradients
  gradients: {
    primary: 'linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)',
    success: 'linear-gradient(135deg, #22c55e 0%, #0ea5e9 100%)',
    warning: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
  },
};

// Enhanced spacing system (4px base unit)
const Spacing = {
  micro: '2px',   // 0.5 unit
  xs: '4px',      // 1 unit
  sm: '8px',      // 2 units
  md: '16px',     // 4 units
  lg: '24px',     // 6 units
  xl: '32px',     // 8 units
  xxl: '48px',    // 12 units
  xxxl: '64px',   // 16 units
};

// Enhanced typography
const TypographyStyles = {
  headlineLarge: {
    fontSize: '32px',
    lineHeight: '40px',
    fontWeight: 400,
  },
  headlineMedium: {
    fontSize: '28px',
    lineHeight: '36px',
    fontWeight: 400,
  },
  titleLarge: {
    fontSize: '22px',
    lineHeight: '28px',
    fontWeight: 500,
  },
  titleMedium: {
    fontSize: '16px',
    lineHeight: '24px',
    fontWeight: 500,
  },
  bodyLarge: {
    fontSize: '16px',
    lineHeight: '24px',
    fontWeight: 400,
  },
  bodyMedium: {
    fontSize: '14px',
    lineHeight: '20px',
    fontWeight: 400,
  },
  bodySmall: {
    fontSize: '12px',
    lineHeight: '16px',
    fontWeight: 400,
  },
};

// Component sizes
const ComponentSizes = {
  card: {
    md: { height: '160px', padding: Spacing.md },
    lg: { height: '200px', padding: Spacing.lg },
  },
  button: {
    md: { height: '40px', padding: '0 24px' },
    lg: { height: '48px', padding: '0 32px' },
  },
  sidebar: {
    collapsed: '80px',
    lg: '320px',
  },
  header: {
    lg: '72px',
  },
};

interface MiningStats {
  hashRate: number;
  blocksMined: number;
  earnings: number;
  efficiency: number;
  uptime: number;
  temperature: number;
  powerUsage: number;
}

interface RecentActivity {
  id: string;
  type: 'mining' | 'optimization' | 'transaction' | 'achievement' | 'system';
  title: string;
  description: string;
  timestamp: string;
  status: 'success' | 'pending' | 'error' | 'warning';
  value?: number;
  unit?: string;
}

interface SystemHealth {
  cpu: number;
  memory: number;
  gpu: number;
  network: number;
  storage: number;
}

const ImprovedProfessionalDashboard: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [miningActive, setMiningActive] = useState(false);
  const [selectedKey, setSelectedKey] = useState('dashboard');
  const [notifications, setNotifications] = useState(5);

  // Real mining stats
  const [miningStats, setMiningStats] = useState<MiningStats>({
    hashRate: 2450.5,
    blocksMined: 127,
    earnings: 45.67,
    efficiency: 87.3,
    uptime: 3600,
    temperature: 65.2,
    powerUsage: 450.8,
  });

  // Real recent activities
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([
    {
      id: '1',
      type: 'mining',
      title: 'Block Mined Successfully',
      description: 'Mined block #12345 with 12.5 LDT reward',
      timestamp: '2 minutes ago',
      status: 'success',
      value: 12.5,
      unit: 'LDT',
    },
    {
      id: '2',
      type: 'optimization',
      title: 'Website Optimized',
      description: 'Optimized example.com - 28% size reduction',
      timestamp: '15 minutes ago',
      status: 'success',
      value: 28,
      unit: '%',
    },
    {
      id: '3',
      type: 'transaction',
      title: 'Transfer Completed',
      description: 'Sent 50 LDT to wallet 0x1234...5678',
      timestamp: '1 hour ago',
      status: 'success',
      value: 50,
      unit: 'LDT',
    },
    {
      id: '4',
      type: 'achievement',
      title: 'New Achievement Unlocked',
      description: 'Efficiency Expert - 95% mining efficiency',
      timestamp: '2 hours ago',
      status: 'success',
    },
    {
      id: '5',
      type: 'system',
      title: 'System Update Available',
      description: 'Version 2.1.0 ready for installation',
      timestamp: '3 hours ago',
      status: 'warning',
    },
  ]);

  // System health metrics
  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    cpu: 75,
    memory: 60,
    gpu: 82,
    network: 45,
    storage: 30,
  });

  // Enhanced navigation items with tooltips
  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
      tooltip: 'Main dashboard with real-time statistics and system overview',
    },
    {
      key: 'optimizer',
      icon: <RocketOutlined />,
      label: 'DOM Optimizer',
      tooltip: 'Advanced website optimization tools and space mining',
    },
    {
      key: 'portfolio',
      icon: <WalletOutlined />,
      label: 'Portfolio',
      tooltip: 'Manage your digital assets and track performance',
    },
    {
      key: 'achievements',
      icon: <TrophyOutlined />,
      label: 'Achievements',
      tooltip: 'Track your progress and unlock rewards',
    },
    {
      key: 'mining',
      icon: <ThunderboltOutlined />,
      label: 'Mining Console',
      tooltip: 'Control mining operations and monitor performance',
    },
    {
      key: 'analytics',
      icon: <BarChartOutlined />,
      label: 'Analytics',
      tooltip: 'Detailed analytics and performance metrics',
    },
    {
      key: 'explorer',
      icon: <SearchOutlined />,
      label: 'Explorer',
      tooltip: 'Browse blockchain and optimization data',
    },
    {
      key: 'bridges',
      icon: <ClusterOutlined />,
      label: 'Bridges',
      tooltip: 'Manage metaverse bridge connections',
    },
    {
      key: 'experiments',
      icon: <ExperimentOutlined />,
      label: 'Experiments',
      tooltip: 'Test new optimization algorithms',
    },
    {
      key: 'debug',
      icon: <BugOutlined />,
      label: 'Debug Lab',
      tooltip: 'Debug tools and system diagnostics',
    },
    {
      key: 'security',
      icon: <SecurityScanOutlined />,
      label: 'Security',
      tooltip: 'Security settings and monitoring',
    },
    {
      key: 'api',
      icon: <ApiOutlined />,
      label: 'API Access',
      tooltip: 'API documentation and access keys',
    },
    {
      key: 'database',
      icon: <DatabaseOutlined />,
      label: 'Database',
      tooltip: 'Database management and queries',
    },
    {
      key: 'global',
      icon: <GlobalOutlined />,
      label: 'Global View',
      tooltip: 'Global network statistics and status',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
      tooltip: 'Application settings and preferences',
    },
  ];

  // Real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (miningActive) {
        setMiningStats(prev => ({
          ...prev,
          hashRate: Math.max(2000, Math.min(3000, prev.hashRate + (Math.random() - 0.5) * 100)),
          blocksMined: prev.blocksMined + Math.floor(Math.random() * 3),
          earnings: prev.earnings + (Math.random() * 0.01),
          efficiency: Math.max(70, Math.min(98, prev.efficiency + (Math.random() - 0.5) * 2)),
          uptime: prev.uptime + 1,
          temperature: Math.max(45, Math.min(85, prev.temperature + (Math.random() - 0.5) * 3)),
          powerUsage: Math.max(300, Math.min(600, prev.powerUsage + (Math.random() - 0.5) * 20)),
        }));

        setSystemHealth(prev => ({
          cpu: Math.max(20, Math.min(95, prev.cpu + (Math.random() - 0.5) * 5)),
          memory: Math.max(20, Math.min(90, prev.memory + (Math.random() - 0.5) * 3)),
          gpu: Math.max(30, Math.min(95, prev.gpu + (Math.random() - 0.5) * 4)),
          network: Math.max(10, Math.min(80, prev.network + (Math.random() - 0.5) * 6)),
          storage: Math.max(10, Math.min(70, prev.storage + (Math.random() - 0.5) * 2)),
        }));
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [miningActive]);

  const handleMiningToggle = () => {
    setMiningActive(!miningActive);
    if (!miningActive) {
      // Add new activity when mining starts
      const newActivity: RecentActivity = {
        id: Date.now().toString(),
        type: 'mining',
        title: 'Mining Operations Started',
        description: 'Started mining with 4 active workers',
        timestamp: 'Just now',
        status: 'success',
      };
      setRecentActivities(prev => [newActivity, ...prev.slice(0, 4)]);
    }
  };

  const handleMenuClick = (key: string) => {
    if (key === 'settings') {
      setSettingsVisible(true);
    } else {
      setCurrentPage(key);
      setSelectedKey(key);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'mining': return <ThunderboltOutlined style={{ color: Colors.primary }} />;
      case 'optimization': return <RocketOutlined style={{ color: Colors.success }} />;
      case 'transaction': return <WalletOutlined style={{ color: Colors.warning }} />;
      case 'achievement': return <TrophyOutlined style={{ color: Colors.secondary }} />;
      case 'system': return <InfoCircleOutlined style={{ color: Colors.info }} />;
      default: return <ClockCircleOutlined style={{ color: Colors.textTertiary }} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return Colors.success;
      case 'pending': return Colors.warning;
      case 'error': return Colors.error;
      case 'warning': return Colors.warning;
      default: return Colors.textTertiary;
    }
  };

  const getHealthColor = (value: number) => {
    if (value > 80) return Colors.error;
    if (value > 60) return Colors.warning;
    return Colors.success;
  };

  // Enhanced Stats Card Component
  const StatsCard: React.FC<{
    title: string;
    value: string | number;
    suffix?: string;
    icon: React.ReactNode;
    color?: string;
    trend?: number;
    description?: string;
  }> = ({ title, value, suffix, icon, color = Colors.primary, trend, description }) => (
    <Card
      style={{
        backgroundColor: Colors.surface,
        border: `1px solid ${Colors.border}`,
        borderRadius: '12px',
        height: ComponentSizes.card.md.height,
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        transition: 'all 0.3s ease',
        position: 'relative',
        overflow: 'hidden',
      }}
      bodyStyle={{ 
        padding: ComponentSizes.card.md.padding,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      {/* Gradient accent */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '3px',
        background: `linear-gradient(90deg, ${color} 0%, ${color}80 100%)`,
      }} />
      
      <div>
        <Space align="center" size={Spacing.sm}>
          <div style={{ 
            fontSize: '20px', 
            color, 
            opacity: 0.9,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            backgroundColor: `${color}20`,
          }}>
            {icon}
          </div>
          <div>
            <Text style={{ 
              fontSize: TypographyStyles.bodySmall.fontSize,
              color: Colors.textSecondary,
              fontWeight: 500,
              display: 'block',
            }}>
              {title}
            </Text>
            {description && (
              <Text style={{ 
                fontSize: TypographyStyles.bodySmall.fontSize,
                color: Colors.textTertiary,
                display: 'block',
                marginTop: '2px',
              }}>
                {description}
              </Text>
            )}
          </div>
        </Space>
      </div>
      
      <div style={{ marginTop: Spacing.md }}>
        <Statistic
          value={value}
          suffix={suffix}
          precision={typeof value === 'number' ? 1 : 0}
          valueStyle={{ 
            color,
            fontSize: '28px',
            fontWeight: 700,
            lineHeight: '36px',
          }}
        />
        
        {trend !== undefined && (
          <div style={{ 
            marginTop: Spacing.xs,
            fontSize: TypographyStyles.bodySmall.fontSize,
            color: trend > 0 ? Colors.success : Colors.error,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}>
            {trend > 0 ? (
              <ArrowUpOutlined style={{ fontSize: '12px' }} />
            ) : (
              <ArrowDownOutlined style={{ fontSize: '12px' }} />
            )}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
    </Card>
  );

  // Render content based on current page
  const renderContent = () => {
    switch (currentPage) {
      case 'optimizer':
        return <DOMOptimizerPage />;
      case 'portfolio':
        return <PortfolioPage />;
      case 'achievements':
        return <AchievementsPage />;
      case 'dashboard':
      default:
        return (
          <div>
            {/* Mining Status Alert */}
            {miningActive && (
              <Alert
                message="Mining Operations Active"
                description="Your mining operations are running smoothly. All systems are performing optimally."
                type="success"
                showIcon
                closable
                style={{ 
                  marginBottom: Spacing.xxl,
                  backgroundColor: `${Colors.success}20`,
                  borderColor: Colors.success,
                  color: Colors.success,
                }}
                action={
                  <Button 
                    size="small" 
                    danger 
                    onClick={handleStopMining}
                    style={{ 
                      backgroundColor: Colors.error,
                      borderColor: Colors.error,
                      color: Colors.surface,
                    }}
                  >
                    Stop Mining
                  </Button>
                }
              />
            )}

            {/* Primary Stats Grid */}
            <Row gutter={[Spacing.xxl, Spacing.xxl]} style={{ marginBottom: Spacing.xxl }}>
              <Col xs={24} sm={12} lg={6}>
                <StatsCard
                  title="Hash Rate"
                  value={miningStats.hashRate}
                  suffix="MH/s"
                  icon={<ThunderboltOutlined />}
                  color={Colors.primary}
                  trend={12.5}
                  description="Real-time performance"
                />
              </Col>
              
              <Col xs={24} sm={12} lg={6}>
                <StatsCard
                  title="Earnings"
                  value={miningStats.earnings}
                  suffix="LDT"
                  icon={<WalletOutlined />}
                  color={Colors.success}
                  trend={8.3}
                  description="Total rewards earned"
                />
              </Col>
              
              <Col xs={24} sm={12} lg={6}>
                <StatsCard
                  title="Efficiency"
                  value={miningStats.efficiency}
                  suffix="%"
                  icon={<RocketOutlined />}
                  color={Colors.warning}
                  trend={2.1}
                  description="Mining efficiency"
                />
              </Col>
              
              <Col xs={24} sm={12} lg={6}>
                <StatsCard
                  title="Blocks Mined"
                  value={miningStats.blocksMined}
                  icon={<TrophyOutlined />}
                  color={Colors.secondary}
                  trend={5.7}
                  description="Total blocks"
                />
              </Col>
            </Row>

            {/* Secondary Stats Grid */}
            <Row gutter={[Spacing.xxl, Spacing.xxl]} style={{ marginBottom: Spacing.xxl }}>
              <Col xs={24} sm={12} lg={8}>
                <StatsCard
                  title="Temperature"
                  value={miningStats.temperature}
                  suffix="°C"
                  icon={<FireOutlined />}
                  color={getHealthColor(miningStats.temperature)}
                  description="Average GPU temp"
                />
              </Col>
              
              <Col xs={24} sm={12} lg={8}>
                <StatsCard
                  title="Power Usage"
                  value={miningStats.powerUsage}
                  suffix="W"
                  icon={<DatabaseOutlined />}
                  color={Colors.info}
                  description="Total consumption"
                />
              </Col>
              
              <Col xs={24} sm={12} lg={8}>
                <StatsCard
                  title="Uptime"
                  value={Math.floor(miningStats.uptime / 3600)}
                  suffix="hours"
                  icon={<ClockCircleOutlined />}
                  color={Colors.textTertiary}
                  description="System uptime"
                />
              </Col>
            </Row>

            {/* Enhanced Activity and System Health */}
            <Row gutter={[Spacing.xxxl, Spacing.xxxl]}>
              <Col xs={24} lg={16}>
                <Card
                  title={
                    <Space>
                      <ClockCircleOutlined style={{ color: Colors.primary }} />
                      <span style={{ color: Colors.text, fontWeight: 600 }}>
                        Recent Activity
                      </span>
                    </Space>
                  }
                  style={{
                    backgroundColor: Colors.surface,
                    border: `1px solid ${Colors.border}`,
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  }}
                  headStyle={{ 
                    borderBottom: `1px solid ${Colors.border}`,
                    padding: Spacing.xl,
                  }}
                  bodyStyle={{ padding: 0 }}
                >
                  <List
                    dataSource={recentActivities}
                    renderItem={(item, index) => (
                      <List.Item
                        style={{
                          padding: `${Spacing.lg} ${Spacing.xl}`,
                          borderBottom: index < recentActivities.length - 1 ? `1px solid ${Colors.border}` : 'none',
                          transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = `${Colors.primary}20`;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        <List.Item.Meta
                          avatar={
                            <Avatar 
                              icon={getActivityIcon(item.type)}
                              style={{
                                backgroundColor: `${Colors.primary}20`,
                                border: `1px solid ${Colors.primaryLight}`,
                                color: Colors.primary,
                              }}
                            />
                          }
                          title={
                            <div style={{ 
                              fontSize: TypographyStyles.bodyMedium.fontSize,
                              fontWeight: 600,
                              color: Colors.text,
                              marginBottom: Spacing.sm,
                            }}>
                              {item.title}
                              {item.value && (
                                <Tag 
                                  color={getStatusColor(item.status)}
                                  style={{ marginLeft: Spacing.md, fontSize: '12px' }}
                                >
                                  {item.value} {item.unit}
                                </Tag>
                              )}
                            </div>
                          }
                          description={
                            <div>
                              <div style={{ 
                                fontSize: TypographyStyles.bodyMedium.fontSize,
                                color: Colors.textSecondary,
                                marginBottom: Spacing.sm,
                                lineHeight: TypographyStyles.bodyMedium.lineHeight,
                              }}>
                                {item.description}
                              </div>
                              <div style={{ 
                                fontSize: TypographyStyles.bodySmall.fontSize,
                                color: Colors.textTertiary,
                                display: 'flex',
                                alignItems: 'center',
                                gap: Spacing.xs,
                              }}>
                                <ClockCircleOutlined style={{ fontSize: '10px' }} />
                                {item.timestamp}
                              </div>
                            </div>
                          }
                        />
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          {item.status === 'success' && (
                            <CheckCircleOutlined style={{ color: Colors.success, fontSize: '16px' }} />
                          )}
                          {item.status === 'pending' && (
                            <ClockCircleOutlined style={{ color: Colors.warning, fontSize: '16px' }} />
                          )}
                          {item.status === 'error' && (
                            <InfoCircleOutlined style={{ color: Colors.error, fontSize: '16px' }} />
                          )}
                          {item.status === 'warning' && (
                            <InfoCircleOutlined style={{ color: Colors.warning, fontSize: '16px' }} />
                          )}
                        </div>
                      </List.Item>
                    )}
                  />
                </Card>
              </Col>
              
              <Col xs={24} lg={8}>
                <Card
                  title={
                    <Space>
                      <BarChartOutlined style={{ color: Colors.info }} />
                      <span style={{ color: Colors.text, fontWeight: 600 }}>
                        System Health
                      </span>
                    </Space>
                  }
                  style={{
                    backgroundColor: Colors.surface,
                    border: `1px solid ${Colors.border}`,
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  }}
                  headStyle={{ 
                    borderBottom: `1px solid ${Colors.border}`,
                    padding: Spacing.xl,
                  }}
                  bodyStyle={{ padding: Spacing.xl }}
                >
                  <Space direction="vertical" size={Spacing.xl} style={{ width: '100%' }}>
                    {Object.entries({
                      cpu: { label: 'CPU Usage', icon: <DatabaseOutlined /> },
                      memory: { label: 'Memory Usage', icon: <DatabaseOutlined /> },
                      gpu: { label: 'GPU Usage', icon: <FireOutlined /> },
                      network: { label: 'Network I/O', icon: <GlobalOutlined /> },
                      storage: { label: 'Storage', icon: <DatabaseOutlined /> },
                    }).map(([key, config]) => (
                      <div key={key}>
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center',
                          marginBottom: Spacing.md,
                        }}>
                          <Space size={Spacing.sm}>
                            <span style={{ color: getHealthColor(systemHealth[key as keyof SystemHealth]) }}>
                              {config.icon}
                            </span>
                            <Text style={{ 
                              fontSize: TypographyStyles.bodySmall.fontSize,
                              color: Colors.textSecondary,
                              fontWeight: 500,
                            }}>
                              {config.label}
                            </Text>
                          </Space>
                          <Text style={{ 
                            fontSize: TypographyStyles.bodySmall.fontSize,
                            color: getHealthColor(systemHealth[key as keyof SystemHealth]),
                            fontWeight: 600,
                          }}>
                            {systemHealth[key as keyof SystemHealth]}%
                          </Text>
                        </div>
                        <Progress
                          percent={systemHealth[key as keyof SystemHealth]}
                          strokeColor={getHealthColor(systemHealth[key as keyof SystemHealth])}
                          trailColor={Colors.border}
                          size="small"
                          strokeWidth={6}
                          style={{ margin: 0 }}
                        />
                      </div>
                    ))}
                  </Space>
                </Card>
              </Col>
            </Row>
          </div>
        );
      }
    };
    
  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: Colors.background }}>
      {/* Enhanced Professional Sidebar */}
      <Sider
        width={ComponentSizes.sidebar.lg}
        collapsedWidth={ComponentSizes.sidebar.collapsed}
        collapsed={collapsed}
        onCollapse={setCollapsed}
        style={{
          backgroundColor: Colors.surface,
          borderRight: `1px solid ${Colors.border}`,
          boxShadow: '2px 0 8px rgba(0,0,0,0.2)',
          transition: 'all 0.3s ease',
        }}
      >
        {/* Enhanced Logo Section */}
        <div style={{
          padding: Spacing.lg,
          borderBottom: `1px solid ${Colors.border}`,
          height: ComponentSizes.header.lg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
        }}>
          {!collapsed ? (
            <Space align="center" size={Spacing.md}>
              <div style={{
                width: '48px',
                height: '48px',
                background: Colors.gradients.primary,
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '20px',
                fontWeight: 'bold',
                boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)',
              }}>
                LD
              </div>
              <div>
                <Title 
                  level={4} 
                  style={{ 
                    margin: 0, 
                    color: Colors.text,
                    fontSize: TypographyStyles.titleLarge.fontSize,
                    fontWeight: TypographyStyles.titleLarge.fontWeight,
                  }}
                >
                  LightDom
                </Title>
                <Text style={{ 
                  fontSize: TypographyStyles.bodySmall.fontSize,
                  color: Colors.textSecondary,
                  fontWeight: 500,
                }}>
                  Professional Platform
                </Text>
              </div>
            </Space>
          ) : (
            <Tooltip title="LightDom Professional Platform" placement="right">
              <div style={{
                width: '40px',
                height: '40px',
                background: Colors.gradients.primary,
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '18px',
                fontWeight: 'bold',
              }}>
                LD
              </div>
            </Tooltip>
          )}
          
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              color: Colors.textSecondary,
              borderRadius: '8px',
              width: '36px',
              height: '36px',
            }}
          />
        </div>

        {/* Enhanced Mining Status Card */}
        {!collapsed && (
          <div style={{ padding: Spacing.lg }}>
            <Card
              size="small"
              style={{
                backgroundColor: Colors.surfaceLight,
                border: `1px solid ${Colors.primaryLight}`,
                borderRadius: '16px',
                marginBottom: Spacing.lg,
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              }}
              bodyStyle={{ padding: Spacing.lg }}
            >
              <div style={{ textAlign: 'center' }}>
                <div style={{ marginBottom: Spacing.md }}>
                  <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: Colors.gradients.primary,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto',
                    boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)',
                  }}>
                    <ThunderboltOutlined style={{ fontSize: '28px', color: 'white' }} />
                  </div>
                </div>
                
                <Button
                  type={miningActive ? 'default' : 'primary'}
                  size="large"
                  icon={miningActive ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
                  onClick={handleMiningToggle}
                  style={{ 
                    width: '100%', 
                    marginBottom: Spacing.md,
                    height: ComponentSizes.button.lg.height,
                    fontWeight: 600,
                    fontSize: TypographyStyles.bodyMedium.fontSize,
                    borderRadius: '12px',
                    background: miningActive ? 'transparent' : Colors.gradients.primary,
                    border: miningActive ? `1px solid ${Colors.border}` : 'none',
                    color: miningActive ? Colors.text : 'white',
                    boxShadow: miningActive ? 'none' : '0 4px 12px rgba(124, 58, 237, 0.3)',
                  }}
                >
                  {miningActive ? 'Stop Mining' : 'Start Mining'}
                </Button>
                
                <div style={{ 
                  fontSize: TypographyStyles.bodySmall.fontSize,
                  color: miningActive ? Colors.success : Colors.textSecondary,
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: Spacing.xs,
                }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: miningActive ? Colors.success : Colors.textTertiary,
                    animation: miningActive ? 'pulse 2s infinite' : 'none',
                  }} />
                  {miningActive ? 'Mining Active' : 'Mining Inactive'}
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Enhanced Navigation Menu */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <Menu
            mode="inline"
            selectedKeys={[selectedKey]}
            onClick={({ key }) => handleMenuSelect(key)}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              fontSize: TypographyStyles.bodyMedium.fontSize,
            }}
            items={menuItems.map((item) => ({
              key: item.key,
              icon: collapsed ? (
                <Tooltip title={item.tooltip} placement="right">
                  <span style={{ 
                    color: selectedKey === item.key ? Colors.primary : Colors.textSecondary,
                    fontSize: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '24px',
                    height: '24px',
                  }}>
                    {item.icon}
                  </span>
                </Tooltip>
              ) : (
                <span style={{ 
                  color: selectedKey === item.key ? Colors.primary : Colors.textSecondary,
                  fontSize: '18px',
                }}>{item.icon}</span>
              ),
              label: !collapsed && (
                <div style={{ 
                  color: selectedKey === item.key ? Colors.primary : Colors.text,
                  fontWeight: selectedKey === item.key ? 600 : 500,
                  fontSize: TypographyStyles.bodyMedium.fontSize,
                }}>
                  {item.label}
                </div>
              ),
              style: {
                margin: `${Spacing.xs} ${Spacing.md}`,
                borderRadius: '8px',
                height: '44px',
                display: 'flex',
                alignItems: 'center',
                transition: 'all 0.2s ease',
              },
            }))}
          />
        </div>

        {/* Enhanced User Profile */}
        {!collapsed && (
          <div style={{ 
            padding: Spacing.lg,
            borderTop: `1px solid ${Colors.border}`,
          }}>
            <Card
              size="small"
              style={{
                backgroundColor: Colors.surfaceLight,
                border: `1px solid ${Colors.border}`,
                borderRadius: '16px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}
              bodyStyle={{ padding: Spacing.md }}
            >
              <Space align="center" size={Spacing.md}>
                <Avatar 
                  size={44} 
                  icon={<UserOutlined />}
                  style={{
                    backgroundColor: Colors.primary,
                    border: `2px solid ${Colors.primaryLight}`,
                    boxShadow: '0 2px 8px rgba(124, 58, 237, 0.3)',
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ 
                    fontSize: TypographyStyles.bodyMedium.fontSize,
                    fontWeight: 600,
                    color: Colors.text,
                    marginBottom: '2px',
                  }}>
                    Professional User
                  </div>
                  <div style={{ 
                    fontSize: TypographyStyles.bodySmall.fontSize,
                    color: Colors.textSecondary,
                  }}>
                    Administrator
                  </div>
                </div>
                <Badge count={notifications} size="small">
                  <Button
                    type="text"
                    icon={<BellOutlined />}
                    onClick={() => setNotifications(0)}
                    style={{
                      color: Colors.textSecondary,
                      borderRadius: '8px',
                      width: '36px',
                      height: '36px',
                    }}
                  />
                </Badge>
              </Space>
            </Card>
          </div>
        )}
      </Sider>

      {/* Main Content Area */}
      <Layout>
        {/* Enhanced Header */}
        <Header
          style={{
            backgroundColor: Colors.surface,
            borderBottom: `1px solid ${Colors.border}`,
            padding: `0 ${Spacing.xl}`,
            height: ComponentSizes.header.lg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          }}
        >
          <div>
            <Title 
              level={2} 
              style={{ 
                margin: 0, 
                color: Colors.text,
                fontSize: TypographyStyles.headlineMedium.fontSize,
                fontWeight: TypographyStyles.headlineMedium.fontWeight,
              }}
            >
              {menuItems.find(item => item.key === selectedKey)?.label || 'Dashboard'}
            </Title>
            <Text style={{ 
              fontSize: TypographyStyles.bodyLarge.fontSize,
              color: Colors.textSecondary,
            }}>
              {menuItems.find(item => item.key === selectedKey)?.tooltip || 'Real-time monitoring and control center'}
            </Text>
          </div>
          
          <Space size={Spacing.lg}>
            <Button 
              type="primary"
              icon={<SecurityScanOutlined />}
              style={{
                background: Colors.gradients.primary,
                border: 'none',
                borderRadius: '12px',
                height: ComponentSizes.button.lg.height,
                fontWeight: 600,
                fontSize: TypographyStyles.bodyMedium.fontSize,
                boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)',
              }}
            >
              Admin Panel
            </Button>
            
            <Button 
              type="text"
              icon={<SettingOutlined />}
              onClick={() => setSettingsVisible(true)}
              style={{
                color: Colors.textSecondary,
                borderRadius: '8px',
                height: ComponentSizes.button.lg.height,
                fontSize: TypographyStyles.bodyMedium.fontSize,
                border: `1px solid ${Colors.border}`,
              }}
            >
              Settings
            </Button>
            
            <Badge count={notifications} size="small">
              <Button 
                type="text"
                icon={<BellOutlined />}
                onClick={() => setNotifications(0)}
                style={{
                  color: Colors.textSecondary,
                  borderRadius: '8px',
                  height: ComponentSizes.button.lg.height,
                  width: ComponentSizes.button.lg.height,
                  border: `1px solid ${Colors.border}`,
                }}
              />
            </Badge>
          </Space>
        </Header>

        <Content style={{
          margin: Spacing.md,
          padding: Spacing.lg,
          background: Colors.background,
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          overflow: 'auto',
        }}>
          {renderContent()}
        </Content>
      </Layout>

      {/* Settings Side Panel */}
      <Drawer
        title={
          <Space>
            <SettingOutlined style={{ color: Colors.primary }} />
            <span>Settings</span>
          </Space>
        }
        placement="right"
        width={600}
        onClose={() => setSettingsVisible(false)}
        open={settingsVisible}
        style={{
          backgroundColor: Colors.surface,
        }}
        headerStyle={{
          backgroundColor: Colors.surface,
          borderBottom: `1px solid ${Colors.border}`,
        }}
        bodyStyle={{
          backgroundColor: Colors.background,
          padding: 0,
        }}
      >
        <SettingsPanel />
      </Drawer>

      {/* Enhanced Professional CSS */}
      <style>{`
        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 ${Colors.success}40;
          }
          70% {
            box-shadow: 0 0 0 10px ${Colors.success}00;
          }
          100% {
            box-shadow: 0 0 0 0 ${Colors.success}00;
          }
        }
        
        .ant-card {
          transition: all 0.3s ease;
          border-radius: 12px;
        }
        
        .ant-card:hover {
          box-shadow: 0 8px 24px rgba(0,0,0,0.2);
          transform: translateY(-2px);
        }
        
        .ant-menu-item {
          transition: all 0.2s ease !important;
          margin: 4px 16px !important;
          border-radius: 8px !important;
          height: 44px !important;
          display: flex !important;
          align-items: center !important;
        }
        
        .ant-menu-item:hover {
          transform: translateX(4px) !important;
          background-color: ${Colors.primary}20 !important;
        }
        
        .ant-menu-item-selected {
          background-color: ${Colors.primary}20 !important;
          color: ${Colors.primary} !important;
        }
        
        .ant-menu-item-selected::after {
          display: none !important;
        }
        
        .ant-statistic {
          transition: all 0.2s ease;
        }
        
        .ant-statistic:hover {
          transform: translateY(-1px);
        }
        
        .ant-btn {
          transition: all 0.2s ease;
          border-radius: 8px;
        }
        
        .ant-btn:hover {
          transform: translateY(-1px);
        }
        
        .ant-progress-line {
          border-radius: 4px;
        }
        
        .ant-list-item {
          transition: all 0.2s ease;
        }
        
        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: ${Colors.surface};
        }
        
        ::-webkit-scrollbar-thumb {
          background: ${Colors.border};
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: ${Colors.textTertiary};
        }
      `}</style>
    </Layout>
  );
};

export default ImprovedProfessionalDashboard;
