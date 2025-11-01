/**
 * Simple Enhanced Professional Dashboard
 * Working version with proper imports and routing
 */

import React, { useState, useEffect } from 'react';
import MiningConsolePage from './pages/MiningConsolePage';
import WalletPage from './pages/WalletPage';
import RewardsPage from './pages/RewardsPage';
import SpaceMiningPage from './pages/SpaceMiningPage';
import AnalyticsPage from './pages/AnalyticsPage';
import {
  Layout,
  Menu,
  Button,
  Card,
  Row,
  Col,
  Typography,
  Statistic,
  Progress,
  Space,
  Avatar,
  Badge,
  Tooltip,
  Drawer,
  Switch,
  Divider,
  Dropdown,
  message,
  Timeline,
} from 'antd';
import {
  DashboardOutlined,
  ThunderboltOutlined,
  WalletOutlined,
  TrophyOutlined,
  RocketOutlined,
  BarChartOutlined,
  SettingOutlined,
  BellOutlined,
  UserOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  ApiOutlined,
  MonitorOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined,
  InfoCircleOutlined,
  FireOutlined,
} from '@ant-design/icons';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

// Simple design system colors
const Colors = {
  primary: '#7c3aed',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
  background: '#0a0a0a',
  surface: '#1a1a1a',
  text: '#ffffff',
  textSecondary: '#a0a0a0',
  border: '#333333',
};

const Spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
};

// Navigation items with tooltips
const navigationItems = [
  {
    key: 'dashboard',
    icon: <DashboardOutlined />,
    label: 'Dashboard',
    tooltip: 'Main dashboard with overview and statistics',
  },
  {
    key: 'mining',
    icon: <ThunderboltOutlined />,
    label: 'Mining Console',
    tooltip: 'Advanced mining operations and control panel',
  },
  {
    key: 'wallet',
    icon: <WalletOutlined />,
    label: 'Wallet',
    tooltip: 'Manage your digital assets and transactions',
  },
  {
    key: 'rewards',
    icon: <TrophyOutlined />,
    label: 'Rewards',
    tooltip: 'View achievements and earned rewards',
  },
  {
    key: 'space-mining',
    icon: <RocketOutlined />,
    label: 'Space Mining',
    tooltip: 'DOM space optimization and mining operations',
  },
  {
    key: 'analytics',
    icon: <BarChartOutlined />,
    label: 'Analytics',
    tooltip: 'Detailed performance analytics and reports',
  },
  {
    key: 'settings',
    icon: <SettingOutlined />,
    label: 'Settings',
    tooltip: 'Application settings and preferences',
  },
];

const SimpleEnhancedDashboard: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedKey, setSelectedKey] = useState('dashboard');
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [isMining, setIsMining] = useState(false);
  const [stats, setStats] = useState({
    hashRate: 0,
    workers: 0,
    earnings: 0,
    efficiency: 0,
    cpu: 45,
    gpu: 60,
    memory: 70,
    temperature: 65,
  });

  // Set document title on mount
  useEffect(() => {
    document.title = 'Enhanced Professional Dashboard - LightDom';
    console.log('🎯 Enhanced Professional Dashboard loaded successfully!');
  }, []);

  // Simulate real-time updates
  useEffect(() => {
    if (!isMining) return;

    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        hashRate: Math.max(0, prev.hashRate + (Math.random() - 0.5) * 20),
        earnings: prev.earnings + 0.0001,
        efficiency: Math.max(70, Math.min(95, prev.efficiency + (Math.random() - 0.5) * 5)),
        cpu: Math.max(0, Math.min(100, prev.cpu + (Math.random() - 0.5) * 10)),
        gpu: Math.max(0, Math.min(100, prev.gpu + (Math.random() - 0.5) * 15)),
        temperature: Math.max(30, Math.min(85, prev.temperature + (Math.random() - 0.5) * 3)),
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, [isMining]);

  const handleStartMining = () => {
    setIsMining(true);
    setStats(prev => ({
      ...prev,
      hashRate: 175.8,
      workers: 3,
      efficiency: 88.5,
    }));
    message.success('Mining started successfully!');
  };

  const handleStopMining = () => {
    setIsMining(false);
    setStats(prev => ({
      ...prev,
      hashRate: 0,
      workers: 0,
      efficiency: 0,
    }));
    message.info('Mining stopped');
  };

  const getStatusColor = (value: number) => {
    if (value < 50) return Colors.success;
    if (value < 80) return Colors.warning;
    return Colors.error;
  };

  const getTemperatureColor = (temp: number) => {
    if (temp < 60) return Colors.success;
    if (temp < 75) return Colors.warning;
    return Colors.error;
  };

  const renderContent = () => {
    switch (selectedKey) {
      case 'mining':
        return <MiningConsolePage />;
      case 'wallet':
        return <WalletPage />;
      case 'rewards':
        return <RewardsPage />;
      case 'space-mining':
        return <SpaceMiningPage />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'settings':
        return (
          <div style={{ padding: '24px' }}>
            <Title level={2} style={{ color: '#ffffff' }}>Settings</Title>
            <Text style={{ color: '#a0a0a0' }}>Application settings and preferences</Text>
            <div style={{ marginTop: '24px' }}>
              <Card style={{
                backgroundColor: '#1a1a1a',
                border: '1px solid #333333',
                borderRadius: '12px',
                padding: '24px',
              }}>
                <Text style={{ color: '#ffffff' }}>Settings page coming soon...</Text>
              </Card>
            </div>
          </div>
        );
      default:
        return renderDashboard();
    }
  };

  const renderDashboard = () => {
    return (
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
      {/* Quick Stats */}
      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card style={{
            background: Colors.surface,
            border: `1px solid ${Colors.border}`,
            borderRadius: '12px',
            height: '160px',
            padding: '12px',
          }}>
            <Statistic
              title="Hash Rate"
              value={stats.hashRate}
              suffix="MH/s"
              prefix={<ThunderboltOutlined style={{ color: Colors.primary, fontSize: '16px' }} />}
              valueStyle={{ color: Colors.primary, fontSize: '20px' }}
              titleStyle={{ fontSize: '12px', color: '#a0a0a0' }}
            />
            <Progress 
              percent={(stats.hashRate / 200) * 100} 
              strokeColor={Colors.primary}
              showInfo={false}
              style={{ marginTop: '12px' }}
              size="small"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card style={{
            background: Colors.surface,
            border: `1px solid ${Colors.border}`,
            borderRadius: '12px',
            height: '160px',
            padding: '12px',
          }}>
            <Statistic
              title="Workers"
              value={stats.workers}
              suffix="active"
              prefix={<ApiOutlined style={{ color: Colors.success, fontSize: '16px' }} />}
              valueStyle={{ color: Colors.success, fontSize: '20px' }}
              titleStyle={{ fontSize: '12px', color: '#a0a0a0' }}
            />
            <Progress 
              percent={(stats.workers / 50) * 100} 
              strokeColor={Colors.success}
              showInfo={false}
              style={{ marginTop: '12px' }}
              size="small"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card style={{
            background: Colors.surface,
            border: `1px solid ${Colors.border}`,
            borderRadius: '12px',
            height: '160px',
            padding: '12px',
          }}>
            <Statistic
              title="Earnings"
              value={stats.earnings}
              precision={6}
              prefix={<TrophyOutlined style={{ color: Colors.warning, fontSize: '16px' }} />}
              valueStyle={{ color: Colors.warning, fontSize: '20px' }}
              titleStyle={{ fontSize: '12px', color: '#a0a0a0' }}
            />
            <Progress 
              percent={Math.min(100, stats.earnings * 1000)} 
              strokeColor={Colors.warning}
              showInfo={false}
              style={{ marginTop: '12px' }}
              size="small"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card style={{
            background: Colors.surface,
            border: `1px solid ${Colors.border}`,
            borderRadius: '12px',
            height: '160px',
            padding: '12px',
          }}>
            <Statistic
              title="Efficiency"
              value={stats.efficiency}
              suffix="%"
              prefix={<BarChartOutlined style={{ color: Colors.info, fontSize: '16px' }} />}
              valueStyle={{ color: Colors.info, fontSize: '20px' }}
              titleStyle={{ fontSize: '12px', color: '#a0a0a0' }}
            />
            <Progress 
              percent={stats.efficiency} 
              strokeColor={Colors.info}
              showInfo={false}
              style={{ marginTop: '12px' }}
              size="small"
            />
          </Card>
        </Col>
      </Row>

      {/* System Health */}
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <Card 
            title={
              <Space>
                <MonitorOutlined style={{ color: Colors.primary }} />
                <span style={{ color: '#ffffff', fontSize: '14px' }}>System Health</span>
                <span style={{ 
                  background: Colors.primary, 
                  color: 'white', 
                  padding: '2px 8px', 
                  borderRadius: '4px', 
                  fontSize: '12px' 
                }}>
                  Enhanced
                </span>
              </Space>
            }
            extra={
              <Space>
                <Badge 
                  status={isMining ? "processing" : "default"} 
                  text={isMining ? "Mining Active" : "Mining Idle"}
                />
                <Button
                  type={isMining ? "default" : "primary"}
                  icon={<PlayCircleOutlined />}
                  onClick={handleStartMining}
                  disabled={isMining}
                  size="small"
                >
                  Start
                </Button>
                <Button
                  type="default"
                  icon={<PauseCircleOutlined />}
                  onClick={handleStopMining}
                  disabled={!isMining}
                  danger
                  size="small"
                >
                  Stop
                </Button>
              </Space>
            }
            style={{
              background: Colors.surface,
              border: `1px solid ${Colors.border}`,
              borderRadius: '12px',
            }}
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={8}>
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <Text style={{ color: Colors.text, fontSize: '12px' }}>CPU Usage</Text>
                    <Text style={{ color: getStatusColor(stats.cpu), fontSize: '12px' }}>{stats.cpu.toFixed(1)}%</Text>
                  </div>
                  <Progress 
                    percent={stats.cpu} 
                    strokeColor={getStatusColor(stats.cpu)}
                    size="small"
                  />
                </div>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <Text style={{ color: Colors.text, fontSize: '12px' }}>GPU Usage</Text>
                    <Text style={{ color: getStatusColor(stats.gpu), fontSize: '12px' }}>{stats.gpu.toFixed(1)}%</Text>
                  </div>
                  <Progress 
                    percent={stats.gpu} 
                    strokeColor={getStatusColor(stats.gpu)}
                    size="small"
                  />
                </div>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <Text style={{ color: Colors.text, fontSize: '12px' }}>Memory</Text>
                    <Text style={{ color: getStatusColor(stats.memory), fontSize: '12px' }}>{stats.memory.toFixed(1)}%</Text>
                  </div>
                  <Progress 
                    percent={stats.memory} 
                    strokeColor={getStatusColor(stats.memory)}
                    size="small"
                  />
                </div>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <Text style={{ color: Colors.text, fontSize: '12px' }}>Temperature</Text>
                    <Text style={{ color: getTemperatureColor(stats.temperature), fontSize: '12px' }}>{stats.temperature.toFixed(1)}°C</Text>
                  </div>
                  <Progress 
                    percent={(stats.temperature / 90) * 100} 
                    strokeColor={getTemperatureColor(stats.temperature)}
                    size="small"
                  />
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card 
            title={
              <Space>
                <ClockCircleOutlined style={{ color: Colors.info }} />
                <span style={{ color: '#ffffff', fontSize: '14px' }}>Recent Activity</span>
              </Space>
            }
            style={{
              background: Colors.surface,
              border: `1px solid ${Colors.border}`,
              borderRadius: '12px',
            }}
          >
            <Timeline
              items={[
                {
                  color: Colors.success,
                  children: (
                    <div>
                      <Text style={{ color: Colors.text, fontSize: '12px' }}>Mining Started</Text>
                      <br />
                      <Text style={{ color: Colors.textSecondary, fontSize: '10px' }}>
                        Just now
                      </Text>
                    </div>
                  ),
                },
                {
                  color: Colors.info,
                  children: (
                    <div>
                      <Text style={{ color: Colors.text, fontSize: '12px' }}>System Update</Text>
                      <br />
                      <Text style={{ color: Colors.textSecondary, fontSize: '10px' }}>
                        2 minutes ago
                      </Text>
                    </div>
                  ),
                },
                {
                  color: Colors.warning,
                  children: (
                    <div>
                      <Text style={{ color: Colors.text, fontSize: '12px' }}>Performance Alert</Text>
                      <br />
                      <Text style={{ color: Colors.textSecondary, fontSize: '10px' }}>
                        5 minutes ago
                      </Text>
                    </div>
                  ),
                },
              ]}
            />
          </Card>
        </Col>
      </Row>

      {/* Mining Statistics */}
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <Card 
            title={
              <Space>
                <TrophyOutlined style={{ color: Colors.warning }} />
                <span style={{ color: '#ffffff', fontSize: '14px' }}>Mining Performance</span>
              </Space>
            }
            style={{
              background: Colors.surface,
              border: `1px solid ${Colors.border}`,
              borderRadius: '12px',
              height: '160px',
            }}
          >
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Statistic
                  title="Accepted Shares"
                  value={stats.hashRate > 0 ? Math.floor(Math.random() * 1000) : 0}
                  prefix={<CheckCircleOutlined style={{ color: Colors.success, fontSize: '16px' }} />}
                  valueStyle={{ color: Colors.success, fontSize: '18px' }}
                  titleStyle={{ fontSize: '12px', color: '#a0a0a0' }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Rejected Shares"
                  value={stats.hashRate > 0 ? Math.floor(Math.random() * 10) : 0}
                  prefix={<ExclamationCircleOutlined style={{ color: Colors.error, fontSize: '16px' }} />}
                  valueStyle={{ color: Colors.error, fontSize: '18px' }}
                  titleStyle={{ fontSize: '12px', color: '#a0a0a0' }}
                />
              </Col>
            </Row>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card 
            title={
              <Space>
                <FireOutlined style={{ color: Colors.error }} />
                <span style={{ color: '#ffffff', fontSize: '14px' }}>Power & Performance</span>
              </Space>
            }
            style={{
              background: Colors.surface,
              border: `1px solid ${Colors.border}`,
              borderRadius: '12px',
              height: '160px',
            }}
          >
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Statistic
                  title="Power Usage"
                  value={stats.hashRate > 0 ? Math.floor(stats.hashRate * 1.2) : 45}
                  suffix="W"
                  prefix={<ThunderboltOutlined style={{ color: Colors.warning, fontSize: '16px' }} />}
                  valueStyle={{ color: Colors.warning, fontSize: '18px' }}
                  titleStyle={{ fontSize: '12px', color: '#a0a0a0' }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Temperature"
                  value={stats.temperature}
                  suffix="°C"
                  prefix={<FireOutlined style={{ color: getTemperatureColor(stats.temperature), fontSize: '16px' }} />}
                  valueStyle={{ color: getTemperatureColor(stats.temperature), fontSize: '18px' }}
                  titleStyle={{ fontSize: '12px', color: '#a0a0a0' }}
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Additional Features */}
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={8}>
          <Card 
            title={
              <Space>
                <RocketOutlined style={{ color: Colors.primary }} />
                <span style={{ color: '#ffffff', fontSize: '14px' }}>Space Mining</span>
              </Space>
            }
            style={{
              background: Colors.surface,
              border: `1px solid ${Colors.border}`,
              borderRadius: '12px',
              height: '160px',
            }}
          >
            <Statistic
              title="DOM Space Optimized"
              value={stats.hashRate > 0 ? Math.floor(Math.random() * 500) : 0}
              suffix="MB"
              prefix={<RocketOutlined style={{ color: Colors.primary, fontSize: '16px' }} />}
              valueStyle={{ color: Colors.primary, fontSize: '18px' }}
              titleStyle={{ fontSize: '12px', color: '#a0a0a0' }}
            />
            <Progress 
              percent={stats.hashRate > 0 ? Math.floor(Math.random() * 100) : 0} 
              strokeColor={Colors.primary}
              showInfo={false}
              style={{ marginTop: '12px' }}
              size="small"
            />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card 
            title={
              <Space>
                <WalletOutlined style={{ color: Colors.success }} />
                <span style={{ color: '#ffffff', fontSize: '14px' }}>Wallet Balance</span>
              </Space>
            }
            style={{
              background: Colors.surface,
              border: `1px solid ${Colors.border}`,
              borderRadius: '12px',
              height: '160px',
            }}
          >
            <Statistic
              title="Available Balance"
              value={stats.earnings}
              precision={6}
              prefix={<WalletOutlined style={{ color: Colors.success, fontSize: '16px' }} />}
              valueStyle={{ color: Colors.success, fontSize: '18px' }}
              titleStyle={{ fontSize: '12px', color: '#a0a0a0' }}
            />
            <Progress 
              percent={Math.min(100, stats.earnings * 10000)} 
              strokeColor={Colors.success}
              showInfo={false}
              style={{ marginTop: '12px' }}
              size="small"
            />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card 
            title={
              <Space>
                <BarChartOutlined style={{ color: Colors.info }} />
                <span style={{ color: '#ffffff', fontSize: '14px' }}>Analytics</span>
              </Space>
            }
            style={{
              background: Colors.surface,
              border: `1px solid ${Colors.border}`,
              borderRadius: '12px',
              height: '160px',
            }}
          >
            <Statistic
              title="Performance Score"
              value={stats.efficiency}
              suffix="%"
              prefix={<BarChartOutlined style={{ color: Colors.info, fontSize: '16px' }} />}
              valueStyle={{ color: Colors.info, fontSize: '18px' }}
              titleStyle={{ fontSize: '12px', color: '#a0a0a0' }}
            />
            <Progress 
              percent={stats.efficiency} 
              strokeColor={Colors.info}
              showInfo={false}
              style={{ marginTop: '12px' }}
              size="small"
            />
          </Card>
        </Col>
      </Row>
    </Space>
    );
  };

  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: Colors.background }}>
      {/* Sidebar */}
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={280}
        collapsedWidth={80}
        style={{
          background: Colors.surface,
          borderRight: `1px solid ${Colors.border}`,
        }}
      >
        <div style={{ 
          padding: Spacing.lg, 
          borderBottom: `1px solid ${Colors.border}`,
          marginBottom: Spacing.md,
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: collapsed ? 'center' : 'flex-start',
          }}>
            <Avatar
              size={collapsed ? 32 : 40}
              style={{
                background: `linear-gradient(135deg, ${Colors.primary} 0%, #a78bfa 100%)`,
                border: `2px solid ${Colors.primary}`,
              }}
              icon={<RocketOutlined />}
            />
            {!collapsed && (
              <div style={{ marginLeft: Spacing.md }}>
                <Title level={4} style={{ color: Colors.text, margin: 0 }}>
                  LightDom
                </Title>
                <Text style={{ color: Colors.textSecondary, fontSize: '12px' }}>
                  Enhanced Professional
                </Text>
              </div>
            )}
          </div>
        </div>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          items={navigationItems.map(item => ({
            key: item.key,
            icon: item.icon,
            label: collapsed ? (
              <Tooltip title={item.tooltip} placement="right">
                <span>{item.label}</span>
              </Tooltip>
            ) : (
              <span>{item.label}</span>
            ),
            onClick: () => setSelectedKey(item.key),
          }))}
          style={{
            background: 'transparent',
            border: 'none',
          }}
        />
      </Sider>

      {/* Main Content */}
      <Layout>
        {/* Header */}
        <Header style={{ 
          padding: '0 24px', 
          background: Colors.surface,
          borderBottom: `1px solid ${Colors.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <Col>
            <Space>
              <Button
                type="text"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setCollapsed(!collapsed)}
                style={{ color: Colors.text }}
              />
              <Title level={3} style={{ color: Colors.text, margin: 0 }}>
                {navigationItems.find(item => item.key === selectedKey)?.label || 'Dashboard'}
              </Title>
              <span style={{ 
                background: Colors.primary, 
                color: 'white', 
                padding: '2px 8px', 
                borderRadius: '4px', 
                fontSize: '12px',
                marginLeft: Spacing.sm
              }}>
                Enhanced Pro
              </span>
            </Space>
          </Col>
          <Col>
            <Space>
              <Tooltip title="Notifications">
                <Button
                  type="text"
                  icon={<BellOutlined />}
                  style={{ color: Colors.text }}
                />
              </Tooltip>
              <Tooltip title="Settings">
                <Button
                  type="text"
                  icon={<SettingOutlined />}
                  onClick={() => setSettingsVisible(true)}
                  style={{ color: Colors.text }}
                />
              </Tooltip>
              <Avatar
                size="small"
                style={{
                  background: `linear-gradient(135deg, ${Colors.primary} 0%, #a78bfa 100%)`,
                  border: `2px solid ${Colors.primary}`,
                }}
                icon={<UserOutlined />}
              />
            </Space>
          </Col>
        </Header>

        {/* Content Area */}
        <Content style={{ 
          padding: Spacing.lg,
          background: Colors.background,
          overflow: 'auto',
        }}>
          {renderContent()}
        </Content>
      </Layout>

      {/* Settings Drawer */}
      <Drawer
        title="Quick Settings"
        placement="right"
        onClose={() => setSettingsVisible(false)}
        open={settingsVisible}
        width={400}
        style={{
          background: Colors.surface,
        }}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div>
            <Text strong style={{ color: Colors.text }}>Mining Settings</Text>
            <div style={{ marginTop: Spacing.md }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ color: Colors.text }}>Auto-start Mining</Text>
                  <Switch defaultChecked />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ color: Colors.text }}>Power Saving Mode</Text>
                  <Switch />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ color: Colors.text }}>Notifications</Text>
                  <Switch defaultChecked />
                </div>
              </Space>
            </div>
          </div>
          
          <Divider />
          
          <div>
            <Text strong style={{ color: Colors.text }}>Appearance</Text>
            <div style={{ marginTop: Spacing.md }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ color: Colors.text }}>Dark Mode</Text>
                  <Switch defaultChecked />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ color: Colors.text }}>Compact View</Text>
                  <Switch />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ color: Colors.text }}>Animations</Text>
                  <Switch defaultChecked />
                </div>
              </Space>
            </div>
          </div>
          
          <Divider />
          
          <Button
            type="primary"
            block
            style={{
              background: `linear-gradient(135deg, ${Colors.primary} 0%, #a78bfa 100%)`,
              border: 'none',
            }}
          >
            Save Settings
          </Button>
        </Space>
      </Drawer>
    </Layout>
  );
};

export default SimpleEnhancedDashboard;
