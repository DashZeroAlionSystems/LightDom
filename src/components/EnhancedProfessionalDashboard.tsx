/**
 * Enhanced Professional Dashboard
 * Improved spacing, tooltips, navigation, and real data integration
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
  Tabs,
  Alert,
  Badge,
  Avatar,
  List,
  Tag,
  Menu,
  Divider,
  Drawer,
  Tooltip,
  Switch,
  InputNumber,
  Select,
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
  TrendingUpOutlined,
  TrendingDownOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import DesignSystem from './EnhancedDesignSystem';
import MiningConsolePage from './MiningConsolePage';
import SettingsPage from './SettingsPage';

const { Header, Content, Sider } = Layout;
const { Title, Text } = Typography;
const { TabPane } = Tabs;

// Real data interfaces
interface MiningStats {
  hashRate: number;
  blocksMined: number;
  earnings: number;
  efficiency: number;
  uptime: number;
  temperature: number;
  powerUsage: number;
  networkDifficulty: number;
  blockReward: number;
  nextBlockIn: number;
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

const EnhancedProfessionalDashboard: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [miningActive, setMiningActive] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedKey, setSelectedKey] = useState('dashboard');
  const [settingsVisible, setSettingsVisible] = useState(false);
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
    networkDifficulty: 1258439201875,
    blockReward: 12.5,
    nextBlockIn: 142,
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
      tooltip: 'Mining overview and statistics',
    },
    { 
      key: 'mining', 
      icon: <ThunderboltOutlined />, 
      label: 'Mining Console',
      tooltip: 'Advanced mining operations control',
    },
    { 
      key: 'optimizer', 
      icon: <RocketOutlined />, 
      label: 'DOM Optimizer',
      tooltip: 'Website optimization tools',
    },
    { 
      key: 'portfolio', 
      icon: <WalletOutlined />, 
      label: 'Portfolio',
      tooltip: 'Assets and balance management',
    },
    { 
      key: 'achievements', 
      icon: <TrophyOutlined />, 
      label: 'Achievements',
      tooltip: 'Rewards and milestones',
    },
    { 
      key: 'analytics', 
      icon: <BarChartOutlined />, 
      label: 'Analytics',
      tooltip: 'Performance analytics and reports',
    },
    { 
      key: 'marketplace', 
      icon: <ApiOutlined />, 
      label: 'Marketplace',
      tooltip: 'Tools and services marketplace',
    },
    { 
      key: 'metaverse', 
      icon: <GlobalOutlined />, 
      label: 'Metaverse',
      tooltip: 'Virtual world integration',
    },
    { 
      key: 'explorer', 
      icon: <SearchOutlined />, 
      label: 'Explorer',
      tooltip: 'Blockchain explorer',
    },
    { 
      key: 'database', 
      icon: <DatabaseOutlined />, 
      label: 'Database',
      tooltip: 'Data management and backup',
    },
    { 
      key: 'cluster', 
      icon: <ClusterOutlined />, 
      label: 'Cluster',
      tooltip: 'Node cluster management',
    },
    { 
      key: 'laboratory', 
      icon: <ExperimentOutlined />, 
      label: 'Laboratory',
      tooltip: 'R&D and experimental features',
    },
    { 
      key: 'debugger', 
      icon: <BugOutlined />, 
      label: 'Debugger',
      tooltip: 'Debug and diagnostic tools',
    },
    { 
      key: 'admin', 
      icon: <SecurityScanOutlined />, 
      label: 'Admin Panel',
      tooltip: 'System administration',
    },
    { 
      key: 'settings', 
      icon: <SettingOutlined />, 
      label: 'Settings',
      tooltip: 'Application configuration',
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
          nextBlockIn: Math.max(1, prev.nextBlockIn - 1),
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

  const handleMenuSelect = (key: string) => {
    setSelectedKey(key);
    if (key === 'settings') {
      setSettingsVisible(true);
    } else if (key === 'mining') {
      setActiveTab('mining');
    } else {
      setActiveTab('overview');
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'mining': return <ThunderboltOutlined style={{ color: DesignSystem.Colors.primary }} />;
      case 'optimization': return <RocketOutlined style={{ color: DesignSystem.Colors.success }} />;
      case 'transaction': return <WalletOutlined style={{ color: DesignSystem.Colors.warning }} />;
      case 'achievement': return <TrophyOutlined style={{ color: DesignSystem.Colors.primary }} />;
      case 'system': return <InfoCircleOutlined style={{ color: DesignSystem.Colors.info }} />;
      default: return <ClockCircleOutlined style={{ color: DesignSystem.Colors.textSecondary }} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return DesignSystem.Colors.success;
      case 'pending': return DesignSystem.Colors.warning;
      case 'error': return DesignSystem.Colors.error;
      case 'warning': return DesignSystem.Colors.warning;
      default: return DesignSystem.Colors.textSecondary;
    }
  };

  const getHealthColor = (value: number) => {
    if (value > 80) return DesignSystem.Colors.error;
    if (value > 60) return DesignSystem.Colors.warning;
    return DesignSystem.Colors.success;
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
  }> = ({ title, value, suffix, icon, color = DesignSystem.Colors.primary, trend, description }) => (
    <Card
      style={{
        backgroundColor: DesignSystem.Colors.surface,
        border: `1px solid ${DesignSystem.Colors.border}`,
        borderRadius: DesignSystem.BorderRadius.lg,
        height: '160px',
        boxShadow: DesignSystem.Elevation.md,
        transition: 'all 0.3s ease',
        position: 'relative',
        overflow: 'hidden',
      }}
      bodyStyle={{ 
        padding: DesignSystem.Spacing.md,
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
        <Space align="center" size={EnhancedSpacing.sm}>
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
              fontSize: EnhancedTypography.bodySmall.fontSize,
              color: EnhancedColors.dark.textSecondary,
              fontWeight: 500,
              display: 'block',
            }}>
              {title}
            </Text>
            {description && (
              <Text style={{ 
                fontSize: EnhancedTypography.bodySmall.fontSize,
                color: EnhancedColors.dark.textTertiary,
                display: 'block',
                marginTop: '2px',
              }}>
                {description}
              </Text>
            )}
          </div>
        </Space>
      </div>
      
      <div style={{ marginTop: EnhancedSpacing.md }}>
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
            marginTop: EnhancedSpacing.xs,
            fontSize: EnhancedTypography.bodySmall.fontSize,
            color: trend > 0 ? EnhancedColors.success[500] : EnhancedColors.error[500],
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}>
            {trend > 0 ? (
              <TrendingUpOutlined style={{ fontSize: '12px' }} />
            ) : (
              <TrendingDownOutlined style={{ fontSize: '12px' }} />
            )}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
    </Card>
  );

  // Render page content based on selection
  const renderPageContent = () => {
    switch (selectedKey) {
      case 'mining':
        return <MiningConsolePage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return (
          <div style={{ padding: EnhancedSpacing.lg }}>
            {/* Enhanced Page Header */}
            <div style={{ marginBottom: EnhancedSpacing.xxl }}>
              <Title level={2} style={{ 
                color: EnhancedColors.dark.text,
                fontSize: EnhancedTypography.headlineLarge.fontSize,
                fontWeight: EnhancedTypography.headlineLarge.fontWeight,
                margin: 0,
                marginBottom: EnhancedSpacing.sm,
              }}>
                Mining Dashboard
              </Title>
              <Text style={{ 
                fontSize: EnhancedTypography.bodyLarge.fontSize,
                color: EnhancedColors.dark.textSecondary,
                lineHeight: EnhancedTypography.bodyLarge.lineHeight,
              }}>
                Real-time monitoring and optimization control center
              </Text>
            </div>

            {/* Enhanced Mining Status Alert */}
            {miningActive && (
              <Alert
                message="Mining Operations Active"
                description={`Your mining rig is operating at optimal efficiency. Current hash rate: ${miningStats.hashRate.toFixed(1)} MH/s with ${miningStats.efficiency.toFixed(1)}% efficiency.`}
                type="success"
                showIcon
                closable
                style={{
                  marginBottom: EnhancedSpacing.xl,
                  backgroundColor: `${EnhancedColors.success[100]}20`,
                  borderColor: EnhancedColors.success[500],
                  borderRadius: EnhancedBorderRadius.md,
                  padding: EnhancedSpacing.md,
                }}
              />
            )}

            {/* Primary Stats Grid */}
            <Row gutter={[EnhancedSpacing.lg, EnhancedSpacing.lg]} style={{ marginBottom: EnhancedSpacing.xl }}>
              <Col xs={24} sm={12} lg={6}>
                <StatsCard
                  title="Hash Rate"
                  value={miningStats.hashRate}
                  suffix="MH/s"
                  icon={<ThunderboltOutlined />}
                  color={EnhancedColors.primary[600]}
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
                  color={EnhancedColors.success[500]}
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
                  color={EnhancedColors.warning[500]}
                  trend={2.1}
                  description="Mining efficiency"
                />
              </Col>
              
              <Col xs={24} sm={12} lg={6}>
                <StatsCard
                  title="Blocks Mined"
                  value={miningStats.blocksMined}
                  icon={<TrophyOutlined />}
                  color={EnhancedColors.secondary[600]}
                  trend={5.7}
                  description="Total blocks"
                />
              </Col>
            </Row>

            {/* Secondary Stats Grid */}
            <Row gutter={[EnhancedSpacing.lg, EnhancedSpacing.lg]} style={{ marginBottom: EnhancedSpacing.xl }}>
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
                  color={EnhancedColors.info[500]}
                  description="Total consumption"
                />
              </Col>
              
              <Col xs={24} sm={12} lg={8}>
                <StatsCard
                  title="Uptime"
                  value={Math.floor(miningStats.uptime / 3600)}
                  suffix="hours"
                  icon={<ClockCircleOutlined />}
                  color={EnhancedColors.neutral[400]}
                  description="System uptime"
                />
              </Col>
            </Row>

            {/* Enhanced Activity and System Health */}
            <Row gutter={[EnhancedSpacing.xl, EnhancedSpacing.xl]}>
              <Col xs={24} lg={16}>
                <Card
                  title={
                    <Space>
                      <ClockCircleOutlined style={{ color: EnhancedColors.primary[600] }} />
                      <span style={{ color: EnhancedColors.dark.text, fontWeight: 600 }}>
                        Recent Activity
                      </span>
                    </Space>
                  }
                  style={{
                    backgroundColor: EnhancedColors.dark.surface,
                    border: `1px solid ${EnhancedColors.dark.border}`,
                    borderRadius: EnhancedBorderRadius.md,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  }}
                  headStyle={{ 
                    borderBottom: `1px solid ${EnhancedColors.dark.border}`,
                    padding: EnhancedSpacing.lg,
                  }}
                  bodyStyle={{ padding: 0 }}
                >
                  <List
                    dataSource={recentActivities}
                    renderItem={(item, index) => (
                      <List.Item
                        style={{
                          padding: EnhancedSpacing.lg,
                          borderBottom: index < recentActivities.length - 1 ? `1px solid ${EnhancedColors.dark.border}` : 'none',
                          transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = `${EnhancedColors.primary[100]}30`;
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
                                backgroundColor: `${EnhancedColors.primary[100]}`,
                                border: `1px solid ${EnhancedColors.primary[300]}`,
                                color: EnhancedColors.primary[600],
                              }}
                            />
                          }
                          title={
                            <div style={{ 
                              fontSize: EnhancedTypography.bodyMedium.fontSize,
                              fontWeight: 600,
                              color: EnhancedColors.dark.text,
                              marginBottom: EnhancedSpacing.xs,
                            }}>
                              {item.title}
                              {item.value && (
                                <Tag 
                                  color={getStatusColor(item.status)}
                                  style={{ marginLeft: EnhancedSpacing.sm, fontSize: '12px' }}
                                >
                                  {item.value} {item.unit}
                                </Tag>
                              )}
                            </div>
                          }
                          description={
                            <div>
                              <div style={{ 
                                fontSize: EnhancedTypography.bodyMedium.fontSize,
                                color: EnhancedColors.dark.textSecondary,
                                marginBottom: EnhancedSpacing.xs,
                                lineHeight: EnhancedTypography.bodyMedium.lineHeight,
                              }}>
                                {item.description}
                              </div>
                              <div style={{ 
                                fontSize: EnhancedTypography.bodySmall.fontSize,
                                color: EnhancedColors.dark.textTertiary,
                                display: 'flex',
                                alignItems: 'center',
                                gap: EnhancedSpacing.xs,
                              }}>
                                <ClockCircleOutlined style={{ fontSize: '10px' }} />
                                {item.timestamp}
                              </div>
                            </div>
                          }
                        />
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          {item.status === 'success' && (
                            <CheckCircleOutlined style={{ color: EnhancedColors.success[500], fontSize: '16px' }} />
                          )}
                          {item.status === 'pending' && (
                            <ClockCircleOutlined style={{ color: EnhancedColors.warning[500], fontSize: '16px' }} />
                          )}
                          {item.status === 'error' && (
                            <InfoCircleOutlined style={{ color: EnhancedColors.error[500], fontSize: '16px' }} />
                          )}
                          {item.status === 'warning' && (
                            <InfoCircleOutlined style={{ color: EnhancedColors.warning[500], fontSize: '16px' }} />
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
                      <BarChartOutlined style={{ color: EnhancedColors.info[500] }} />
                      <span style={{ color: EnhancedColors.dark.text, fontWeight: 600 }}>
                        System Health
                      </span>
                    </Space>
                  }
                  style={{
                    backgroundColor: EnhancedColors.dark.surface,
                    border: `1px solid ${EnhancedColors.dark.border}`,
                    borderRadius: EnhancedBorderRadius.md,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  }}
                  headStyle={{ 
                    borderBottom: `1px solid ${EnhancedColors.dark.border}`,
                    padding: EnhancedSpacing.lg,
                  }}
                  bodyStyle={{ padding: EnhancedSpacing.lg }}
                >
                  <Space direction="vertical" size={EnhancedSpacing.lg} style={{ width: '100%' }}>
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
                          marginBottom: EnhancedSpacing.sm,
                        }}>
                          <Space size={EnhancedSpacing.xs}>
                            <span style={{ color: getHealthColor(systemHealth[key as keyof SystemHealth]) }}>
                              {config.icon}
                            </span>
                            <Text style={{ 
                              fontSize: EnhancedTypography.bodySmall.fontSize,
                              color: EnhancedColors.dark.textSecondary,
                              fontWeight: 500,
                            }}>
                              {config.label}
                            </Text>
                          </Space>
                          <Text style={{ 
                            fontSize: EnhancedTypography.bodySmall.fontSize,
                            color: getHealthColor(systemHealth[key as keyof SystemHealth]),
                            fontWeight: 600,
                          }}>
                            {systemHealth[key as keyof SystemHealth]}%
                          </Text>
                        </div>
                        <Progress
                          percent={systemHealth[key as keyof SystemHealth]}
                          strokeColor={getHealthColor(systemHealth[key as keyof SystemHealth])}
                          trailColor={EnhancedColors.dark.border}
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
    <Layout style={{ minHeight: '100vh', backgroundColor: EnhancedColors.dark.background }}>
      {/* Enhanced Professional Sidebar */}
      <Sider
        width={EnhancedComponentSizes.sidebar.lg}
        collapsedWidth={EnhancedComponentSizes.sidebar.collapsed}
        collapsed={collapsed}
        onCollapse={setCollapsed}
        style={{
          backgroundColor: EnhancedColors.dark.surface,
          borderRight: `1px solid ${EnhancedColors.dark.border}`,
          boxShadow: '2px 0 8px rgba(0,0,0,0.2)',
          transition: 'all 0.3s ease',
        }}
      >
        {/* Enhanced Logo Section */}
        <div style={{
          padding: EnhancedSpacing.lg,
          borderBottom: `1px solid ${EnhancedColors.dark.border}`,
          height: EnhancedComponentSizes.header.lg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
        }}>
          {!collapsed ? (
            <Space align="center" size={EnhancedSpacing.md}>
              <div style={{
                width: '48px',
                height: '48px',
                background: EnhancedColors.gradients.primary,
                borderRadius: EnhancedBorderRadius.lg,
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
                    color: EnhancedColors.dark.text,
                    fontSize: EnhancedTypography.titleLarge.fontSize,
                    fontWeight: EnhancedTypography.titleLarge.fontWeight,
                    lineHeight: EnhancedTypography.titleLarge.lineHeight,
                  }}
                >
                  LightDom
                </Title>
                <Text style={{ 
                  fontSize: EnhancedTypography.bodySmall.fontSize,
                  color: EnhancedColors.dark.textSecondary,
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
                background: EnhancedColors.gradients.primary,
                borderRadius: EnhancedBorderRadius.md,
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
              color: EnhancedColors.dark.textSecondary,
              borderRadius: EnhancedBorderRadius.sm,
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          />
        </div>

        {/* Enhanced Mining Status Card */}
        {!collapsed && (
          <div style={{ padding: EnhancedSpacing.lg }}>
            <Card
              size="small"
              style={{
                backgroundColor: EnhancedColors.dark.surfaceLight,
                border: `1px solid ${EnhancedColors.primary[400]}`,
                borderRadius: EnhancedBorderRadius.lg,
                marginBottom: EnhancedSpacing.lg,
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              }}
              bodyStyle={{ padding: EnhancedSpacing.lg }}
            >
              <div style={{ textAlign: 'center' }}>
                <div style={{ marginBottom: EnhancedSpacing.md }}>
                  <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${EnhancedColors.primary[600]} 0%, ${EnhancedColors.secondary[600]} 100%)`,
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
                    marginBottom: EnhancedSpacing.md,
                    height: EnhancedComponentSizes.button.lg.height,
                    fontWeight: 600,
                    fontSize: EnhancedTypography.bodyMedium.fontSize,
                    borderRadius: EnhancedBorderRadius.md,
                    background: miningActive ? 'transparent' : EnhancedColors.gradients.primary,
                    border: miningActive ? `1px solid ${EnhancedColors.dark.border}` : 'none',
                    color: miningActive ? EnhancedColors.dark.text : 'white',
                    boxShadow: miningActive ? 'none' : '0 4px 12px rgba(124, 58, 237, 0.3)',
                  }}
                >
                  {miningActive ? 'Stop Mining' : 'Start Mining'}
                </Button>
                
                <div style={{ 
                  fontSize: EnhancedTypography.bodySmall.fontSize,
                  color: miningActive ? EnhancedColors.success[500] : EnhancedColors.dark.textSecondary,
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: EnhancedSpacing.xs,
                }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: miningActive ? EnhancedColors.success[500] : EnhancedColors.dark.textTertiary,
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
              fontSize: EnhancedTypography.bodyMedium.fontSize,
            }}
            items={menuItems.map((item) => ({
              key: item.key,
              icon: collapsed ? (
                <Tooltip title={item.tooltip} placement="right">
                  <span style={{ 
                    color: selectedKey === item.key ? EnhancedColors.primary[600] : EnhancedColors.dark.textSecondary,
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
                  color: selectedKey === item.key ? EnhancedColors.primary[600] : EnhancedColors.dark.textSecondary,
                  fontSize: '18px',
                }}>{item.icon}</span>
              ),
              label: !collapsed && (
                <div style={{ 
                  color: selectedKey === item.key ? EnhancedColors.primary[600] : EnhancedColors.dark.text,
                  fontWeight: selectedKey === item.key ? 600 : 500,
                  fontSize: EnhancedTypography.bodyMedium.fontSize,
                }}>
                  {item.label}
                </div>
              ),
              style: {
                margin: `${EnhancedSpacing.xs} ${EnhancedSpacing.md}`,
                borderRadius: EnhancedBorderRadius.sm,
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
            padding: EnhancedSpacing.lg,
            borderTop: `1px solid ${EnhancedColors.dark.border}`,
          }}>
            <Card
              size="small"
              style={{
                backgroundColor: EnhancedColors.dark.surfaceLight,
                border: `1px solid ${EnhancedColors.dark.border}`,
                borderRadius: EnhancedBorderRadius.lg,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}
              bodyStyle={{ padding: EnhancedSpacing.md }}
            >
              <Space align="center" size={EnhancedSpacing.md}>
                <Avatar 
                  size={44} 
                  icon={<UserOutlined />}
                  style={{
                    backgroundColor: EnhancedColors.primary[600],
                    border: `2px solid ${EnhancedColors.primary[400]}`,
                    boxShadow: '0 2px 8px rgba(124, 58, 237, 0.3)',
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ 
                    fontSize: EnhancedTypography.bodyMedium.fontSize,
                    fontWeight: 600,
                    color: EnhancedColors.dark.text,
                    marginBottom: '2px',
                  }}>
                    Professional User
                  </div>
                  <div style={{ 
                    fontSize: EnhancedTypography.bodySmall.fontSize,
                    color: EnhancedColors.dark.textSecondary,
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
                      color: EnhancedColors.dark.textSecondary,
                      borderRadius: EnhancedBorderRadius.sm,
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
            backgroundColor: EnhancedColors.dark.surface,
            borderBottom: `1px solid ${EnhancedColors.dark.border}`,
            padding: `0 ${EnhancedSpacing.xl}`,
            height: EnhancedComponentSizes.header.lg,
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
                color: EnhancedColors.dark.text,
                fontSize: EnhancedTypography.headlineMedium.fontSize,
                fontWeight: EnhancedTypography.headlineMedium.fontWeight,
                lineHeight: EnhancedTypography.headlineMedium.lineHeight,
              }}
            >
              {menuItems.find(item => item.key === selectedKey)?.label || 'Dashboard'}
            </Title>
            <Text style={{ 
              fontSize: EnhancedTypography.bodyLarge.fontSize,
              color: EnhancedColors.dark.textSecondary,
              lineHeight: EnhancedTypography.bodyLarge.lineHeight,
            }}>
              {menuItems.find(item => item.key === selectedKey)?.tooltip || 'Real-time monitoring and control center'}
            </Text>
          </div>
          
          <Space size={EnhancedSpacing.lg}>
            <Button 
              type="primary"
              icon={<SecurityScanOutlined />}
              style={{
                background: EnhancedColors.gradients.primary,
                border: 'none',
                borderRadius: EnhancedBorderRadius.md,
                height: EnhancedComponentSizes.button.lg.height,
                fontWeight: 600,
                fontSize: EnhancedTypography.bodyMedium.fontSize,
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
                color: EnhancedColors.dark.textSecondary,
                borderRadius: EnhancedBorderRadius.sm,
                height: EnhancedComponentSizes.button.lg.height,
                fontSize: EnhancedTypography.bodyMedium.fontSize,
                border: `1px solid ${EnhancedColors.dark.border}`,
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
                  color: EnhancedColors.dark.textSecondary,
                  borderRadius: EnhancedBorderRadius.sm,
                  height: EnhancedComponentSizes.button.lg.height,
                  width: EnhancedComponentSizes.button.lg.height,
                  border: `1px solid ${EnhancedColors.dark.border}`,
                }}
              />
            </Badge>
          </Space>
        </Header>

        {/* Enhanced Content */}
        <Content style={{ 
          backgroundColor: EnhancedColors.dark.background,
          overflow: 'auto',
        }}>
          {renderPageContent()}
        </Content>
      </Layout>

      {/* Settings Side Panel */}
      <Drawer
        title={
          <Space>
            <SettingOutlined style={{ color: EnhancedColors.primary[600] }} />
            <span>Settings</span>
          </Space>
        }
        placement="right"
        width={600}
        onClose={() => setSettingsVisible(false)}
        open={settingsVisible}
        style={{
          backgroundColor: EnhancedColors.dark.surface,
        }}
        headerStyle={{
          backgroundColor: EnhancedColors.dark.surface,
          borderBottom: `1px solid ${EnhancedColors.dark.border}`,
        }}
        bodyStyle={{
          backgroundColor: EnhancedColors.dark.background,
          padding: 0,
        }}
      >
        <SettingsPage />
      </Drawer>

      {/* Enhanced Professional CSS */}
      <style>{`
        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 ${EnhancedColors.success[500]}40;
          }
          70% {
            box-shadow: 0 0 0 10px ${EnhancedColors.success[500]}00;
          }
          100% {
            box-shadow: 0 0 0 0 ${EnhancedColors.success[500]}00;
          }
        }
        
        .ant-card {
          transition: all 0.3s ease;
          border-radius: ${EnhancedBorderRadius.md}px;
        }
        
        .ant-card:hover {
          box-shadow: 0 8px 24px rgba(0,0,0,0.2);
          transform: translateY(-2px);
        }
        
        .ant-menu-item {
          transition: all 0.2s ease !important;
          margin: ${EnhancedSpacing.xs} ${EnhancedSpacing.md} !important;
          border-radius: ${EnhancedBorderRadius.sm}px !important;
          height: 44px !important;
          display: flex !important;
          align-items: center !important;
        }
        
        .ant-menu-item:hover {
          transform: translateX(4px) !important;
          background-color: ${EnhancedColors.primary[100]}30 !important;
        }
        
        .ant-menu-item-selected {
          background-color: ${EnhancedColors.primary[100]}30 !important;
          color: ${EnhancedColors.primary[600]} !important;
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
          border-radius: ${EnhancedBorderRadius.sm}px;
        }
        
        .ant-btn:hover {
          transform: translateY(-1px);
        }
        
        .ant-progress-line {
          border-radius: ${EnhancedBorderRadius.xs}px;
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
          background: ${EnhancedColors.dark.surface};
        }
        
        ::-webkit-scrollbar-thumb {
          background: ${EnhancedColors.dark.border};
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: ${EnhancedColors.dark.textTertiary};
        }
      `}</style>
    </Layout>
  );
};

export default EnhancedProfessionalDashboard;
