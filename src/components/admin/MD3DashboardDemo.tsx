import React, { useState } from 'react';
import {
  StatusCard,
  MetricCard,
  Chip,
  ProgressIndicator,
  FAB,
  ListItem,
  SectionHeader,
  useTheme,
  formatNumber
} from '../../utils/ReusableDesignSystem';
import {
  Layout,
  Row,
  Col,
  Card,
  Button,
  Space,
  Typography,
  Avatar,
  Badge,
  Divider
} from 'antd';
import {
  DashboardOutlined,
  TeamOutlined,
  DollarOutlined,
  ThunderboltOutlined,
  DatabaseOutlined,
  ApiOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  SyncOutlined,
  BellOutlined,
  SettingOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  PlusOutlined,
  FilterOutlined,
  MoreOutlined
} from '@ant-design/icons';
import MD3DesignSystem from '../../styles/NewDesignSystem';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

/**
 * Material Design 3 Dashboard Demo
 * Showcasing the complete MD3 design system implementation
 */
const MD3DashboardDemo: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');

  const themeConfig = MD3DesignSystem[theme];

  const menuItems = [
    { key: 'overview', icon: <DashboardOutlined />, label: 'Overview' },
    { key: 'analytics', icon: <BarChartOutlined />, label: 'Analytics' },
    { key: 'users', icon: <TeamOutlined />, label: 'Users' },
    { key: 'content', icon: <FileTextOutlined />, label: 'Content' },
    { key: 'settings', icon: <SettingOutlined />, label: 'Settings' },
  ];

  const recentActivities = [
    {
      title: 'New user registration completed',
      subtitle: 'alice@example.com joined the platform',
      timestamp: '2 minutes ago',
      status: 'success' as const,
      leadingIcon: <CheckCircleOutlined style={{ color: themeConfig.colors.success }} />
    },
    {
      title: 'Payment processed',
      subtitle: '$49.99 received from bob@example.com',
      timestamp: '15 minutes ago',
      status: 'success' as const,
      leadingIcon: <DollarOutlined style={{ color: themeConfig.colors.success }} />
    },
    {
      title: 'High API usage detected',
      subtitle: 'IP 192.168.1.100 exceeded rate limit',
      timestamp: '1 hour ago',
      status: 'warning' as const,
      leadingIcon: <ExclamationCircleOutlined style={{ color: themeConfig.colors.warning }} />
    },
    {
      title: 'Blockchain sync completed',
      subtitle: `Block #${formatNumber(1542876)} processed`,
      timestamp: '2 hours ago',
      status: 'info' as const,
      leadingIcon: <SyncOutlined style={{ color: themeConfig.colors.info }} />
    }
  ];

  return (
    <Layout style={{ minHeight: '100vh', background: themeConfig.colors.background }}>
      {/* Navigation Rail */}
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={280}
        collapsedWidth={80}
        style={{
          background: themeConfig.colors.surface,
          borderRight: `1px solid ${themeConfig.colors.outlineVariant}`,
          boxShadow: themeConfig.elevation.level1,
          overflow: 'auto',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 10,
        }}
      >
        <div style={{
          padding: MD3DesignSystem.getSpacing(24),
          borderBottom: `1px solid ${themeConfig.colors.outlineVariant}`,
          background: themeConfig.colors.primaryContainer,
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {!collapsed ? (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: MD3DesignSystem.getShape('medium'),
                background: themeConfig.colors.onPrimary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: MD3DesignSystem.getSpacing(12),
              }}>
                <ThunderboltOutlined style={{ color: themeConfig.colors.primary }} />
              </div>
              <Typography.Title level={4} style={{
                margin: 0,
                color: themeConfig.colors.onPrimaryContainer,
                ...MD3DesignSystem.getTypography('titleLarge')
              }}>
                LightDom
              </Typography.Title>
            </div>
          ) : (
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: MD3DesignSystem.getShape('medium'),
              background: themeConfig.colors.onPrimary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <ThunderboltOutlined style={{ color: themeConfig.colors.primary }} />
            </div>
          )}
        </div>

        <div style={{ padding: MD3DesignSystem.getSpacing(16) }}>
          {menuItems.map(item => (
            <Button
              key={item.key}
              type="text"
              icon={item.icon}
              style={{
                width: '100%',
                marginBottom: MD3DesignSystem.getSpacing(8),
                justifyContent: collapsed ? 'center' : 'flex-start',
                height: '48px',
                background: 'transparent',
                color: themeConfig.colors.onSurfaceVariant,
                fontSize: '14px',
                fontWeight: 500,
                borderRadius: MD3DesignSystem.getShape('medium'),
                transition: `all ${MD3DesignSystem.getMotion('duration', 'medium2')} ${MD3DesignSystem.getMotion('easing', 'standard')}`,
                paddingLeft: collapsed ? MD3DesignSystem.getSpacing(12) : MD3DesignSystem.getSpacing(16)
              }}
            >
              {!collapsed && item.label}
            </Button>
          ))}

          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: MD3DesignSystem.getSpacing(24),
            borderTop: `1px solid ${themeConfig.colors.outlineVariant}`,
            background: themeConfig.colors.surface,
          }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Avatar
                size={collapsed ? 32 : 40}
                style={{
                  background: themeConfig.colors.primary,
                  color: themeConfig.colors.onPrimary,
                  fontWeight: 600,
                }}
              >
                A
              </Avatar>
              {!collapsed && (
                <div style={{ marginLeft: MD3DesignSystem.getSpacing(16), overflow: 'hidden' }}>
                  <div style={{
                    ...MD3DesignSystem.getTypography('bodyMedium'),
                    color: themeConfig.colors.onSurface,
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                  }}>
                    Admin User
                  </div>
                  <div style={{
                    ...MD3DesignSystem.getTypography('bodySmall'),
                    color: themeConfig.colors.onSurfaceVariant,
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                  }}>
                    admin@example.com
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Sider>

      {/* Main Content */}
      <Layout style={{ marginLeft: collapsed ? 80 : 280, transition: `margin-left ${MD3DesignSystem.getMotion('duration', 'medium2')} ${MD3DesignSystem.getMotion('easing', 'standard')}` }}>
        <Header style={{
          background: themeConfig.colors.surface,
          padding: `0 ${MD3DesignSystem.getSpacing(24)}`,
          borderBottom: `1px solid ${themeConfig.colors.outlineVariant}`,
          boxShadow: themeConfig.elevation.level1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '64px',
          position: 'sticky',
          top: 0,
          zIndex: 9,
        }}>
          <Space>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{
                fontSize: '16px',
                color: themeConfig.colors.onSurface,
                height: '40px',
                width: '40px',
                borderRadius: MD3DesignSystem.getShape('medium'),
                transition: `all ${MD3DesignSystem.getMotion('duration', 'medium2')} ${MD3DesignSystem.getMotion('easing', 'standard')}`,
              }}
            />
            <Typography.Title level={4} style={{
              margin: 0,
              color: themeConfig.colors.onSurface,
              ...MD3DesignSystem.getTypography('headlineMedium')
            }}>
              Dashboard Overview
            </Typography.Title>
          </Space>

          <Space size={MD3DesignSystem.getSpacing(12)}>
            <Badge count={3} size="small">
              <Button
                type="text"
                icon={<BellOutlined style={{ fontSize: '18px' }} />}
                style={{
                  color: themeConfig.colors.onSurfaceVariant,
                  height: '40px',
                  width: '40px',
                  borderRadius: MD3DesignSystem.getShape('medium'),
                }}
              />
            </Badge>
            <Button
              type="text"
              icon={<SettingOutlined style={{ fontSize: '18px' }} />}
              style={{
                color: themeConfig.colors.onSurfaceVariant,
                height: '40px',
                width: '40px',
                borderRadius: MD3DesignSystem.getShape('medium'),
              }}
            />
            <div style={{
              width: '1px',
              height: '24px',
              background: themeConfig.colors.outlineVariant,
              margin: '0 8px',
            }} />
            <Button
              onClick={toggleTheme}
              style={{
                color: themeConfig.colors.onSurface,
                border: `1px solid ${themeConfig.colors.outlineVariant}`,
                borderRadius: MD3DesignSystem.getShape('medium'),
                height: '40px',
                padding: `0 ${MD3DesignSystem.getSpacing(16)}`,
              }}
            >
              {theme === 'light' ? '🌙' : '☀️'} {theme === 'light' ? 'Dark' : 'Light'}
            </Button>
          </Space>
        </Header>

        <Content style={{
          margin: 0,
          padding: MD3DesignSystem.getSpacing(24),
          background: themeConfig.colors.background,
          minHeight: 'calc(100vh - 64px)',
          overflow: 'auto',
        }}>
          {/* Welcome Section */}
          <SectionHeader
            title="Welcome back, Admin"
            subtitle="Here's what's happening with your platform today"
          />

          {/* System Health Cards */}
          <SectionHeader title="System Health" />
          <Row gutter={[MD3DesignSystem.getSpacing(24), MD3DesignSystem.getSpacing(24)]}>
            <Col xs={24} sm={12} lg={6}>
              <StatusCard
                title="API Gateway"
                status="healthy"
                icon={<ApiOutlined />}
                metrics={[
                  { label: 'Latency', value: '42ms' },
                  { label: 'Uptime', value: '99.99%' }
                ]}
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <StatusCard
                title="Database"
                status="healthy"
                icon={<DatabaseOutlined />}
                metrics={[
                  { label: 'Connections', value: '24' },
                  { label: 'Size', value: '2.4 GB' }
                ]}
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <StatusCard
                title="Blockchain"
                status="syncing"
                icon={<ThunderboltOutlined />}
                metrics={[
                  { label: 'Block Height', value: formatNumber(1542876) },
                  { label: 'Peers', value: '12' }
                ]}
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <StatusCard
                title="Automation"
                status="degraded"
                icon={<RobotOutlined />}
                metrics={[
                  { label: 'Running Jobs', value: '8' },
                  { label: 'Failed Jobs', value: '2' }
                ]}
              />
            </Col>
          </Row>

          {/* Performance Metrics */}
          <SectionHeader title="Performance Metrics" />
          <Row gutter={[MD3DesignSystem.getSpacing(24), MD3DesignSystem.getSpacing(24)]}>
            <Col xs={24} sm={12} lg={6}>
              <MetricCard
                title="Total Users"
                value={formatNumber(12458)}
                icon={<TeamOutlined />}
                trend={{ value: 12.5, label: 'from last month', direction: 'up' }}
                color="primary"
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <MetricCard
                title="Revenue"
                value={`$${formatNumber(125430)}`}
                icon={<DollarOutlined />}
                trend={{ value: 8.3, label: 'from last month', direction: 'up' }}
                color="secondary"
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <MetricCard
                title="Optimizations"
                value="187"
                icon={<ThunderboltOutlined />}
                trend={{ value: 15.2, label: 'efficiency', direction: 'up' }}
                color="success"
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <MetricCard
                title="Space Saved"
                value="24.5 GB"
                icon={<DatabaseOutlined />}
                trend={{ value: 22.1, label: 'storage', direction: 'up' }}
                color="info"
              />
            </Col>
          </Row>

          {/* Filter Chips */}
          <div style={{ marginBottom: MD3DesignSystem.getSpacing(24) }}>
            <Space size={MD3DesignSystem.getSpacing(12)}>
              <Chip
                variant="filter"
                selected={selectedFilter === 'all'}
                onClick={() => setSelectedFilter('all')}
                leadingIcon={<FilterOutlined />}
              >
                All Activities
              </Chip>
              <Chip
                variant="filter"
                selected={selectedFilter === 'success'}
                onClick={() => setSelectedFilter('success')}
              >
                Success
              </Chip>
              <Chip
                variant="filter"
                selected={selectedFilter === 'warning'}
                onClick={() => setSelectedFilter('warning')}
              >
                Warnings
              </Chip>
              <Chip
                variant="filter"
                selected={selectedFilter === 'info'}
                onClick={() => setSelectedFilter('info')}
              >
                Info
              </Chip>
            </Space>
          </div>

          {/* Progress Indicators */}
          <Row gutter={[MD3DesignSystem.getSpacing(24), MD3DesignSystem.getSpacing(24)]} style={{ marginBottom: MD3DesignSystem.getSpacing(24) }}>
            <Col xs={24} lg={12}>
              <Card
                style={{
                  borderRadius: MD3DesignSystem.getShape('large'),
                  border: `1px solid ${themeConfig.colors.outlineVariant}`,
                  background: themeConfig.colors.surface,
                  boxShadow: themeConfig.elevation.level1,
                }}
                bodyStyle={{ padding: MD3DesignSystem.getSpacing(24) }}
              >
                <Title level={5} style={{
                  marginBottom: MD3DesignSystem.getSpacing(16),
                  color: themeConfig.colors.onSurface,
                  ...MD3DesignSystem.getTypography('titleMedium')
                }}>
                  System Performance
                </Title>
                <Space direction="vertical" style={{ width: '100%' }} size={MD3DesignSystem.getSpacing(16)}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: MD3DesignSystem.getSpacing(8) }}>
                      <Text style={MD3DesignSystem.getTypography('bodyMedium')}>CPU Usage</Text>
                      <Text style={MD3DesignSystem.getTypography('labelMedium')}>67%</Text>
                    </div>
                    <ProgressIndicator percent={67} size="medium" color="primary" />
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: MD3DesignSystem.getSpacing(8) }}>
                      <Text style={MD3DesignSystem.getTypography('bodyMedium')}>Memory</Text>
                      <Text style={MD3DesignSystem.getTypography('labelMedium')}>84%</Text>
                    </div>
                    <ProgressIndicator percent={84} size="medium" color="secondary" />
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: MD3DesignSystem.getSpacing(8) }}>
                      <Text style={MD3DesignSystem.getTypography('bodyMedium')}>Storage</Text>
                      <Text style={MD3DesignSystem.getTypography('labelMedium')}>45%</Text>
                    </div>
                    <ProgressIndicator percent={45} size="medium" color="tertiary" />
                  </div>
                </Space>
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card
                style={{
                  borderRadius: MD3DesignSystem.getShape('large'),
                  border: `1px solid ${themeConfig.colors.outlineVariant}`,
                  background: themeConfig.colors.surface,
                  boxShadow: themeConfig.elevation.level1,
                }}
                bodyStyle={{ padding: MD3DesignSystem.getSpacing(24) }}
              >
                <Title level={5} style={{
                  marginBottom: MD3DesignSystem.getSpacing(16),
                  color: themeConfig.colors.onSurface,
                  ...MD3DesignSystem.getTypography('titleMedium')
                }}>
                  Task Progress
                </Title>
                <Row gutter={[MD3DesignSystem.getSpacing(16), MD3DesignSystem.getSpacing(16)]}>
                  <Col span={12}>
                    <div style={{ textAlign: 'center' }}>
                      <ProgressIndicator
                        type="circular"
                        percent={75}
                        size="large"
                        color="success"
                        showInfo
                      />
                      <Text style={{
                        ...MD3DesignSystem.getTypography('bodySmall'),
                        color: themeConfig.colors.onSurfaceVariant,
                        marginTop: MD3DesignSystem.getSpacing(8),
                        display: 'block'
                      }}>
                        Completed Tasks
                      </Text>
                    </div>
                  </Col>
                  <Col span={12}>
                    <div style={{ textAlign: 'center' }}>
                      <ProgressIndicator
                        type="circular"
                        percent={23}
                        size="large"
                        color="warning"
                        showInfo
                      />
                      <Text style={{
                        ...MD3DesignSystem.getTypography('bodySmall'),
                        color: themeConfig.colors.onSurfaceVariant,
                        marginTop: MD3DesignSystem.getSpacing(8),
                        display: 'block'
                      }}>
                        In Progress
                      </Text>
                    </div>
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>

          {/* Recent Activity with List Items */}
          <SectionHeader
            title="Recent Activity"
            action={<Button type="text" size="small">View All</Button>}
          />

          <Card
            style={{
              borderRadius: MD3DesignSystem.getShape('large'),
              border: `1px solid ${themeConfig.colors.outlineVariant}`,
              background: themeConfig.colors.surface,
              boxShadow: themeConfig.elevation.level1,
              overflow: 'hidden',
            }}
            bodyStyle={{ padding: 0 }}
          >
            {recentActivities.map((activity, index) => (
              <React.Fragment key={activity.title}>
                <ListItem
                  title={activity.title}
                  subtitle={activity.subtitle}
                  leadingIcon={activity.leadingIcon}
                  trailingIcon={<Text type="secondary" style={MD3DesignSystem.getTypography('bodySmall')}>
                    {activity.timestamp}
                  </Text>}
                />
                {index < recentActivities.length - 1 && (
                  <Divider style={{ margin: 0 }} />
                )}
              </React.Fragment>
            ))}
          </Card>

          {/* FAB */}
          <div style={{
            position: 'fixed',
            bottom: MD3DesignSystem.getSpacing(24),
            right: MD3DesignSystem.getSpacing(24),
            zIndex: 1000
          }}>
            <FAB
              icon={<PlusOutlined />}
              size="large"
              onClick={() => console.log('FAB clicked')}
            />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default MD3DashboardDemo;
