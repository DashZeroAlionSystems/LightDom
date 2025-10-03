import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Layout,
  Menu,
  Avatar,
  Dropdown,
  Badge,
  Button,
  Space,
  Typography,
  Card,
  Row,
  Col,
  Statistic,
  Progress,
  Alert,
  Drawer,
  List,
  Divider
} from 'antd';
import {
  DashboardOutlined,
  OptimizationOutlined,
  BarChartOutlined,
  SettingOutlined,
  LogoutOutlined,
  BellOutlined,
  WalletOutlined,
  TrophyOutlined,
  GlobalOutlined,
  HistoryOutlined,
  UserOutlined,
  MenuOutlined,
  CloseOutlined,
  SearchOutlined
} from '@ant-design/icons';
import { useAuth } from '../../hooks/useAuth';
import { useOptimization } from '../../hooks/useOptimization';
import { useNotifications } from '../../hooks/useNotifications';
import './DashboardLayout.css';

const { Header, Sider, Content } = Layout;
const { Text, Title } = Typography;

interface DashboardLayoutProps {
  children?: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false);
  const { user, logout } = useAuth();
  const { optimizationStats, loading: statsLoading } = useOptimization();
  const { notifications, unreadCount } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: 'Overview',
    },
    {
      key: '/dashboard/optimization',
      icon: <OptimizationOutlined />,
      label: 'DOM Optimization',
    },
    {
      key: '/dashboard/seo',
      icon: <SearchOutlined />,
      label: 'SEO Pipeline',
    },
    {
      key: '/dashboard/analytics',
      icon: <BarChartOutlined />,
      label: 'Analytics',
    },
    {
      key: '/dashboard/websites',
      icon: <GlobalOutlined />,
      label: 'My Websites',
    },
    {
      key: '/dashboard/history',
      icon: <HistoryOutlined />,
      label: 'Optimization History',
    },
    {
      key: '/dashboard/wallet',
      icon: <WalletOutlined />,
      label: 'Wallet & Tokens',
    },
    {
      key: '/dashboard/achievements',
      icon: <TrophyOutlined />,
      label: 'Achievements',
    },
    {
      key: '/dashboard/settings',
      icon: <SettingOutlined />,
      label: 'Settings',
    },
  ];

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile',
    },
    {
      key: 'billing',
      icon: <WalletOutlined />,
      label: 'Billing & Payments',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Account Settings',
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      danger: true,
    },
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    if (key === 'logout') {
      logout();
    } else if (key === 'profile') {
      navigate('/dashboard/profile');
    } else if (key === 'billing') {
      navigate('/dashboard/billing');
    } else if (key === 'settings') {
      navigate('/dashboard/settings');
    } else {
      navigate(key);
    }
  };

  const handleSidebarClick = ({ key }: { key: string }) => {
    navigate(key);
    setMobileMenuVisible(false);
  };

  const userMenu = (
    <Menu
      items={userMenuItems}
      onClick={handleMenuClick}
      className="user-dropdown-menu"
    />
  );

  const notificationItems = notifications.map((notification, index) => ({
    key: index,
    title: notification.title,
    description: notification.description,
    time: notification.time,
    type: notification.type,
  }));

  return (
    <Layout className="dashboard-layout">
      {/* Mobile Header */}
      <div className="mobile-header">
        <Button
          type="text"
          icon={<MenuOutlined />}
          onClick={() => setMobileMenuVisible(true)}
          className="mobile-menu-button"
        />
        <Title level={4} className="mobile-title">
          LightDom Dashboard
        </Title>
        <Space>
          <Badge count={unreadCount} size="small">
            <Button
              type="text"
              icon={<BellOutlined />}
              className="notification-button"
            />
          </Badge>
          <Dropdown overlay={userMenu} placement="bottomRight">
            <Avatar
              src={user?.avatar}
              icon={<UserOutlined />}
              className="user-avatar"
            />
          </Dropdown>
        </Space>
      </div>

      {/* Desktop Sidebar */}
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        className="dashboard-sidebar"
        width={280}
        collapsedWidth={80}
      >
        <div className="sidebar-header">
          <div className="logo">
            <OptimizationOutlined className="logo-icon" />
            {!collapsed && <span className="logo-text">LightDom</span>}
          </div>
        </div>

        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleSidebarClick}
          className="sidebar-menu"
        />

        <div className="sidebar-footer">
          <Card size="small" className="user-info-card">
            <div className="user-info">
              <Avatar
                src={user?.avatar}
                icon={<UserOutlined />}
                size="small"
              />
              {!collapsed && (
                <div className="user-details">
                  <Text strong>{user?.name}</Text>
                  <Text type="secondary" className="user-email">
                    {user?.email}
                  </Text>
                </div>
              )}
            </div>
          </Card>
        </div>
      </Sider>

      <Layout className="dashboard-main">
        {/* Desktop Header */}
        <Header className="dashboard-header">
          <div className="header-left">
            <Button
              type="text"
              icon={collapsed ? <MenuOutlined /> : <CloseOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              className="sidebar-toggle"
            />
          </div>

          <div className="header-center">
            <Title level={3} className="page-title">
              {menuItems.find(item => item.key === location.pathname)?.label || 'Dashboard'}
            </Title>
          </div>

          <div className="header-right">
            <Space size="middle">
              <Badge count={unreadCount} size="small">
                <Button
                  type="text"
                  icon={<BellOutlined />}
                  className="notification-button"
                />
              </Badge>

              <Dropdown overlay={userMenu} placement="bottomRight">
                <div className="user-profile">
                  <Avatar
                    src={user?.avatar}
                    icon={<UserOutlined />}
                    className="user-avatar"
                  />
                  <div className="user-info">
                    <Text strong>{user?.name}</Text>
                    <Text type="secondary" className="user-email">
                      {user?.email}
                    </Text>
                  </div>
                </div>
              </Dropdown>
            </Space>
          </div>
        </Header>

        {/* Quick Stats Bar */}
        <div className="quick-stats-bar">
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
              <Card size="small" className="stat-card">
                <Statistic
                  title="Websites Optimized"
                  value={optimizationStats?.websitesOptimized || 0}
                  loading={statsLoading}
                  prefix={<GlobalOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card size="small" className="stat-card">
                <Statistic
                  title="Performance Score"
                  value={optimizationStats?.averageScore || 0}
                  suffix="%"
                  loading={statsLoading}
                  prefix={<TrophyOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card size="small" className="stat-card">
                <Statistic
                  title="Tokens Earned"
                  value={optimizationStats?.tokensEarned || 0}
                  loading={statsLoading}
                  prefix={<WalletOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card size="small" className="stat-card">
                <Statistic
                  title="Optimizations Today"
                  value={optimizationStats?.optimizationsToday || 0}
                  loading={statsLoading}
                  prefix={<OptimizationOutlined />}
                />
              </Card>
            </Col>
          </Row>
        </div>

        {/* Main Content */}
        <Content className="dashboard-content">
          {children || <Outlet />}
        </Content>
      </Layout>

      {/* Mobile Sidebar Drawer */}
      <Drawer
        title="LightDom Dashboard"
        placement="left"
        onClose={() => setMobileMenuVisible(false)}
        open={mobileMenuVisible}
        className="mobile-drawer"
        width={280}
      >
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleSidebarClick}
          className="mobile-sidebar-menu"
        />
      </Drawer>

      {/* Notifications Drawer */}
      <Drawer
        title={
          <div className="notification-header">
            <BellOutlined />
            <span>Notifications</span>
            <Badge count={unreadCount} size="small" />
          </div>
        }
        placement="right"
        onClose={() => {}}
        open={false}
        className="notification-drawer"
        width={400}
      >
        <List
          dataSource={notificationItems}
          renderItem={(item) => (
            <List.Item className="notification-item">
              <List.Item.Meta
                title={item.title}
                description={item.description}
                avatar={
                  <Badge
                    status={item.type === 'success' ? 'success' : 'default'}
                    dot
                  />
                }
              />
              <Text type="secondary" className="notification-time">
                {item.time}
              </Text>
            </List.Item>
          )}
        />
      </Drawer>
    </Layout>
  );
};

export default DashboardLayout;
