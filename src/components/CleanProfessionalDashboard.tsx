/**
 * Clean Professional Dashboard
 * Simplified version without complex dependencies
 * Material Design inspired with consistent sizing
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
} from '@ant-design/icons';

const { Header, Content, Sider } = Layout;
const { Title, Text } = Typography;
const { TabPane } = Tabs;

// Simplified Material Design Colors
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
  textTertiary: '#525252',
};

// Simplified Spacing
const Spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  xxl: '48px',
};

// Simplified Typography
const TypographyStyles = {
  headlineLarge: {
    fontSize: '32px',
    lineHeight: '40px',
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

interface MiningStats {
  hashRate: number;
  blocksMined: number;
  earnings: number;
  efficiency: number;
  uptime: number;
}

const CleanProfessionalDashboard: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [miningActive, setMiningActive] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedKey, setSelectedKey] = useState('dashboard');

  const [miningStats, setMiningStats] = useState<MiningStats>({
    hashRate: 2450.5,
    blocksMined: 127,
    earnings: 45.67,
    efficiency: 87.3,
    uptime: 3600,
  });

  // Real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (miningActive) {
        setMiningStats(prev => ({
          hashRate: Math.random() * 1000 + 2000,
          blocksMined: prev.blocksMined + Math.floor(Math.random() * 3),
          earnings: prev.earnings + (Math.random() * 0.01),
          efficiency: Math.random() * 20 + 80,
          uptime: prev.uptime + 1,
        }));
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [miningActive]);

  const handleMiningToggle = () => {
    setMiningActive(!miningActive);
  };

  // Navigation items
  const menuItems = [
    { key: 'dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
    { key: 'mining', icon: <ThunderboltOutlined />, label: 'Mining Console' },
    { key: 'optimizer', icon: <RocketOutlined />, label: 'DOM Optimizer' },
    { key: 'portfolio', icon: <WalletOutlined />, label: 'Portfolio' },
    { key: 'achievements', icon: <TrophyOutlined />, label: 'Achievements' },
    { key: 'analytics', icon: <BarChartOutlined />, label: 'Analytics' },
    { key: 'marketplace', icon: <ApiOutlined />, label: 'Marketplace' },
    { key: 'metaverse', icon: <GlobalOutlined />, label: 'Metaverse' },
    { key: 'explorer', icon: <SearchOutlined />, label: 'Explorer' },
    { key: 'database', icon: <DatabaseOutlined />, label: 'Database' },
    { key: 'cluster', icon: <ClusterOutlined />, label: 'Cluster' },
    { key: 'laboratory', icon: <ExperimentOutlined />, label: 'Laboratory' },
    { key: 'debugger', icon: <BugOutlined />, label: 'Debugger' },
    { key: 'admin', icon: <SecurityScanOutlined />, label: 'Admin Panel' },
    { key: 'settings', icon: <SettingOutlined />, label: 'Settings' },
  ];

  // Consistent Stats Card Component
  const StatsCard: React.FC<{
    title: string;
    value: string | number;
    suffix?: string;
    icon: React.ReactNode;
    color?: string;
  }> = ({ title, value, suffix, icon, color = Colors.primary }) => (
    <Card
      style={{
        backgroundColor: Colors.surface,
        border: `1px solid ${Colors.border}`,
        borderRadius: '12px',
        height: '160px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        transition: 'all 0.3s ease',
      }}
      bodyStyle={{ 
        padding: Spacing.md,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <div>
        <Space align="center" size={Spacing.sm}>
          <div style={{ fontSize: '20px', color, opacity: 0.8 }}>
            {icon}
          </div>
          <Text style={{ 
            fontSize: TypographyStyles.bodySmall.fontSize,
            color: Colors.textSecondary,
          }}>
            {title}
          </Text>
        </Space>
      </div>
      
      <div style={{ marginTop: Spacing.sm }}>
        <Statistic
          value={value}
          suffix={suffix}
          precision={typeof value === 'number' ? 1 : 0}
          valueStyle={{ 
            color,
            fontSize: '24px',
            fontWeight: 600,
          }}
        />
      </div>
    </Card>
  );

  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: Colors.background }}>
      {/* Professional Sidebar */}
      <Sider
        width={280}
        collapsedWidth={80}
        collapsed={collapsed}
        onCollapse={setCollapsed}
        style={{
          backgroundColor: Colors.surface,
          borderRight: `1px solid ${Colors.border}`,
          boxShadow: '2px 0 8px rgba(0,0,0,0.2)',
        }}
      >
        {/* Logo Section */}
        <div style={{
          padding: Spacing.md,
          borderBottom: `1px solid ${Colors.border}`,
          height: '72px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
        }}>
          {!collapsed ? (
            <Space align="center" size={Spacing.sm}>
              <div style={{
                width: '40px',
                height: '40px',
                background: `linear-gradient(135deg, ${Colors.primary} 0%, ${Colors.secondary} 100%)`,
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '18px',
                fontWeight: 'bold',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
              }}>
                LD
              </div>
              <div>
                <Title 
                  level={4} 
                  style={{ 
                    margin: 0, 
                    color: Colors.text,
                    fontSize: TypographyStyles.titleMedium.fontSize,
                    fontWeight: TypographyStyles.titleMedium.fontWeight,
                  }}
                >
                  LightDom
                </Title>
                <Text style={{ 
                  fontSize: TypographyStyles.bodySmall.fontSize,
                  color: Colors.textSecondary,
                }}>
                  Professional Platform
                </Text>
              </div>
            </Space>
          ) : (
            <div style={{
              width: '40px',
              height: '40px',
              background: `linear-gradient(135deg, ${Colors.primary} 0%, ${Colors.secondary} 100%)`,
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
          )}
          
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              color: Colors.textSecondary,
              borderRadius: '8px',
              width: '32px',
              height: '32px',
            }}
          />
        </div>

        {/* Mining Status Card */}
        {!collapsed && (
          <div style={{ padding: Spacing.md }}>
            <Card
              size="small"
              style={{
                backgroundColor: Colors.surfaceLight,
                border: `1px solid ${Colors.primary}`,
                borderRadius: '12px',
                marginBottom: Spacing.md,
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              }}
              bodyStyle={{ padding: Spacing.md }}
            >
              <div style={{ textAlign: 'center' }}>
                <div style={{ marginBottom: Spacing.sm }}>
                  <ThunderboltOutlined style={{ fontSize: '32px', color: Colors.primary }} />
                </div>
                
                <Button
                  type={miningActive ? 'default' : 'primary'}
                  size="large"
                  icon={miningActive ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
                  onClick={handleMiningToggle}
                  style={{ 
                    width: '100%', 
                    marginBottom: Spacing.sm,
                    height: '44px',
                    fontWeight: 600,
                    borderRadius: '8px',
                    background: miningActive ? 'transparent' : Colors.primary,
                    border: miningActive ? `1px solid ${Colors.border}` : 'none',
                    color: miningActive ? Colors.text : 'white',
                  }}
                >
                  {miningActive ? 'Stop Mining' : 'Start Mining'}
                </Button>
                
                <div style={{ 
                  fontSize: TypographyStyles.bodySmall.fontSize,
                  color: miningActive ? Colors.success : Colors.textSecondary,
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: miningActive ? Colors.success : Colors.textTertiary,
                  }} />
                  {miningActive ? 'Mining Active' : 'Mining Inactive'}
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Navigation Menu */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <Menu
            mode="inline"
            selectedKeys={[selectedKey]}
            onClick={({ key }) => setSelectedKey(key)}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              fontSize: TypographyStyles.bodyMedium.fontSize,
            }}
            items={menuItems.map((item) => ({
              key: item.key,
              icon: <span style={{ 
                color: selectedKey === item.key ? Colors.primary : Colors.textSecondary,
                fontSize: '16px',
              }}>{item.icon}</span>,
              label: !collapsed && (
                <div style={{ 
                  color: selectedKey === item.key ? Colors.primary : Colors.text,
                  fontWeight: selectedKey === item.key ? 600 : 400,
                }}>
                  {item.label}
                </div>
              ),
              style: {
                margin: '4px 8px',
                borderRadius: '8px',
              },
            }))}
          />
        </div>

        {/* User Profile */}
        {!collapsed && (
          <div style={{ 
            padding: Spacing.md,
            borderTop: `1px solid ${Colors.border}`,
          }}>
            <Card
              size="small"
              style={{
                backgroundColor: Colors.surfaceLight,
                border: `1px solid ${Colors.border}`,
                borderRadius: '12px',
              }}
              bodyStyle={{ padding: Spacing.sm }}
            >
              <Space align="center" size={Spacing.sm}>
                <Avatar 
                  size={40} 
                  icon={<UserOutlined />}
                  style={{
                    backgroundColor: Colors.primary,
                    border: `2px solid ${Colors.primaryLight}`,
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ 
                    fontSize: TypographyStyles.bodyMedium.fontSize,
                    fontWeight: 600,
                    color: Colors.text,
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
                <Badge count={5} size="small">
                  <Button
                    type="text"
                    icon={<BellOutlined />}
                    style={{
                      color: Colors.textSecondary,
                      borderRadius: '8px',
                      width: '32px',
                      height: '32px',
                    }}
                  />
                </Badge>
              </Space>
            </Card>
          </div>
        )}
      </Sider>

      {/* Main Content */}
      <Layout>
        {/* Header */}
        <Header
          style={{
            backgroundColor: Colors.surface,
            borderBottom: `1px solid ${Colors.border}`,
            padding: `0 ${Spacing.lg}`,
            height: '72px',
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
                fontSize: TypographyStyles.headlineLarge.fontSize,
                fontWeight: TypographyStyles.headlineLarge.fontWeight,
              }}
            >
              Mining Dashboard
            </Title>
            <Text style={{ 
              fontSize: TypographyStyles.bodyLarge.fontSize,
              color: Colors.textSecondary,
            }}>
              Real-time monitoring and optimization control center
            </Text>
          </div>
          
          <Space size={Spacing.md}>
            <Button 
              type="primary"
              icon={<SecurityScanOutlined />}
              style={{
                backgroundColor: Colors.primary,
                borderColor: Colors.primary,
                borderRadius: '8px',
                height: '40px',
                fontWeight: 500,
              }}
            >
              Admin Panel
            </Button>
            
            <Button 
              type="text"
              icon={<SettingOutlined />}
              style={{
                color: Colors.textSecondary,
                borderRadius: '8px',
                height: '40px',
              }}
            >
              Settings
            </Button>
            
            <Badge count={5} size="small">
              <Button 
                type="text"
                icon={<BellOutlined />}
                style={{
                  color: Colors.textSecondary,
                  borderRadius: '8px',
                  height: '40px',
                  width: '40px',
                }}
              />
            </Badge>
          </Space>
        </Header>

        {/* Content */}
        <Content style={{ 
          padding: Spacing.lg,
          backgroundColor: Colors.background,
          overflow: 'auto',
        }}>
          {/* Mining Status Alert */}
          {miningActive && (
            <Alert
              message="Mining Operations Active"
              description="Your mining rig is operating at optimal efficiency. All systems are functioning normally."
              type="success"
              showIcon
              closable
              style={{
                marginBottom: Spacing.lg,
                backgroundColor: `${Colors.success}20`,
                borderColor: Colors.success,
                borderRadius: '12px',
              }}
            />
          )}

          {/* Stats Grid */}
          <Row gutter={[Spacing.lg, Spacing.lg]}>
            <Col xs={24} sm={12} lg={6}>
              <StatsCard
                title="Hash Rate"
                value={miningStats.hashRate}
                suffix="MH/s"
                icon={<ThunderboltOutlined />}
                color={Colors.primary}
              />
            </Col>
            
            <Col xs={24} sm={12} lg={6}>
              <StatsCard
                title="Earnings"
                value={miningStats.earnings}
                suffix="LDT"
                icon={<WalletOutlined />}
                color={Colors.success}
              />
            </Col>
            
            <Col xs={24} sm={12} lg={6}>
              <StatsCard
                title="Efficiency"
                value={miningStats.efficiency}
                suffix="%"
                icon={<RocketOutlined />}
                color={Colors.warning}
              />
            </Col>
            
            <Col xs={24} sm={12} lg={6}>
              <StatsCard
                title="Blocks Mined"
                value={miningStats.blocksMined}
                icon={<TrophyOutlined />}
                color={Colors.secondary}
              />
            </Col>
          </Row>

          {/* Recent Activity */}
          <Row gutter={[Spacing.lg, Spacing.lg]} style={{ marginTop: Spacing.lg }}>
            <Col xs={24} lg={16}>
              <Card
                title="Recent Activity"
                style={{
                  backgroundColor: Colors.surface,
                  border: `1px solid ${Colors.border}`,
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                }}
                headStyle={{ 
                  borderBottom: `1px solid ${Colors.border}`,
                  color: Colors.text,
                }}
              >
                <List
                  dataSource={[
                    {
                      title: 'Block Mined Successfully',
                      description: 'Mined block #12345 with 12.5 LDT reward',
                      time: '2 minutes ago',
                      icon: <ThunderboltOutlined style={{ color: Colors.primary }} />,
                    },
                    {
                      title: 'Website Optimized',
                      description: 'Optimized example.com - 28% size reduction',
                      time: '15 minutes ago',
                      icon: <RocketOutlined style={{ color: Colors.success }} />,
                    },
                    {
                      title: 'Transfer Completed',
                      description: 'Sent 50 LDT to wallet 0x1234...5678',
                      time: '1 hour ago',
                      icon: <WalletOutlined style={{ color: Colors.warning }} />,
                    },
                  ]}
                  renderItem={(item) => (
                    <List.Item
                      style={{
                        padding: Spacing.md,
                        borderBottom: `1px solid ${Colors.border}`,
                      }}
                    >
                      <List.Item.Meta
                        avatar={
                          <Avatar 
                            icon={item.icon}
                            style={{
                              backgroundColor: `${Colors.primary}20`,
                              border: `1px solid ${Colors.primary}`,
                            }}
                          />
                        }
                        title={
                          <div style={{ 
                            fontSize: TypographyStyles.bodyMedium.fontSize,
                            fontWeight: 500,
                            color: Colors.text,
                          }}>
                            {item.title}
                          </div>
                        }
                        description={
                          <div>
                            <div style={{ 
                              fontSize: TypographyStyles.bodySmall.fontSize,
                              color: Colors.textSecondary,
                              marginBottom: '4px',
                            }}>
                              {item.description}
                            </div>
                            <div style={{ 
                              fontSize: TypographyStyles.bodySmall.fontSize,
                              color: Colors.textTertiary,
                            }}>
                              {item.time}
                            </div>
                          </div>
                        }
                      />
                      <CheckCircleOutlined style={{ color: Colors.success }} />
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
            
            <Col xs={24} lg={8}>
              <Card
                title="System Status"
                style={{
                  backgroundColor: Colors.surface,
                  border: `1px solid ${Colors.border}`,
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                }}
                headStyle={{ 
                  borderBottom: `1px solid ${Colors.border}`,
                  color: Colors.text,
                }}
              >
                <Space direction="vertical" size={Spacing.md} style={{ width: '100%' }}>
                  <div>
                    <Text style={{ color: Colors.textSecondary, fontSize: TypographyStyles.bodySmall.fontSize }}>
                      CPU Usage
                    </Text>
                    <Progress 
                      percent={75} 
                      strokeColor={Colors.primary}
                      style={{ marginTop: '4px' }}
                    />
                  </div>
                  
                  <div>
                    <Text style={{ color: Colors.textSecondary, fontSize: TypographyStyles.bodySmall.fontSize }}>
                      Memory Usage
                    </Text>
                    <Progress 
                      percent={60} 
                      strokeColor={Colors.success}
                      style={{ marginTop: '4px' }}
                    />
                  </div>
                  
                  <div>
                    <Text style={{ color: Colors.textSecondary, fontSize: TypographyStyles.bodySmall.fontSize }}>
                      Network I/O
                    </Text>
                    <Progress 
                      percent={45} 
                      strokeColor={Colors.info}
                      style={{ marginTop: '4px' }}
                    />
                  </div>
                  
                  <div>
                    <Text style={{ color: Colors.textSecondary, fontSize: TypographyStyles.bodySmall.fontSize }}>
                      Storage
                    </Text>
                    <Progress 
                      percent={30} 
                      strokeColor={Colors.warning}
                      style={{ marginTop: '4px' }}
                    />
                  </div>
                </Space>
              </Card>
            </Col>
          </Row>
        </Content>
      </Layout>

      {/* Professional CSS */}
      <style>{`
        .ant-card {
          transition: all 0.3s ease;
        }
        
        .ant-card:hover {
          box-shadow: 0 8px 24px rgba(0,0,0,0.2);
          transform: translateY(-2px);
        }
        
        .ant-menu-item {
          transition: all 0.2s ease !important;
          margin: 4px 8px !important;
          border-radius: 8px !important;
        }
        
        .ant-menu-item:hover {
          transform: translateX(4px) !important;
          background-color: ${Colors.primary}20 !important;
        }
        
        .ant-menu-item-selected {
          background-color: ${Colors.primary}20 !important;
        }
        
        .ant-statistic {
          transition: all 0.2s ease;
        }
        
        .ant-statistic:hover {
          transform: translateY(-1px);
        }
      `}</style>
    </Layout>
  );
};

export default CleanProfessionalDashboard;
