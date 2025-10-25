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
  ThunderboltOutlined,
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
  ShoppingCartOutlined,
  GiftOutlined,
  ExperimentOutlined,
  BugOutlined,
  ClusterOutlined,
  DatabaseOutlined,
  RocketOutlined,
  ApiOutlined,
  SearchOutlined
} from '@ant-design/icons';
import { useAuth } from '../../../hooks/state/useAuth';
import { useOptimization } from '../../../hooks/state/useOptimization';
import { useNotifications } from '../../../hooks/state/useNotifications';
import Navigation from '../Navigation';
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

  // Lightweight service status indicators for the rail
  const [serviceStatus, setServiceStatus] = useState<{
    api: boolean;
    crawler: boolean;
    optimization: boolean;
    blockchain: boolean;
  }>({ api: false, crawler: false, optimization: false, blockchain: false });

  useEffect(() => {
    let mounted = true;
    const check = async () => {
      try {
        const apiOk = await fetch('/api/health', { method: 'GET' }).then(r => r.ok).catch(() => false);
        // Best-effort lightweight probes; ignore errors
        const miningOk = await fetch('/api/mining/stats', { method: 'GET' }).then(r => r.ok).catch(() => false);
        const crawlerOk = await fetch('/api/crawler/status', { method: 'GET' }).then(r => r.ok).catch(() => false);
        if (mounted) {
          setServiceStatus({ api: apiOk, crawler: crawlerOk, optimization: apiOk, blockchain: miningOk });
        }
      } catch {
        if (mounted) setServiceStatus(s => ({ ...s, api: false }));
      }
    };
    check();
    const id = setInterval(check, 10000);
    return () => { mounted = false; clearInterval(id); };
  }, []);

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: 'Overview',
    },
    {
      key: '/dashboard/optimization',
      icon: <ThunderboltOutlined />,
      label: 'DOM Optimization',
    },
    {
      key: '/dashboard/blockchain',
      icon: <WalletOutlined />,
      label: 'Blockchain',
    },
    {
      key: '/dashboard/space-mining',
      icon: <GlobalOutlined />,
      label: 'Space Mining',
    },
    {
      key: '/dashboard/metaverse-mining',
      icon: <TrophyOutlined />,
      label: 'Metaverse Mining',
    },
    {
      key: '/dashboard/metaverse-marketplace',
      icon: <ShoppingCartOutlined />,
      label: 'Metaverse Marketplace',
    },
    {
      key: '/dashboard/metaverse-mining-rewards',
      icon: <GiftOutlined />,
      label: 'Mining Rewards',
    },
    {
      key: '/dashboard/workflow-simulation',
      icon: <ExperimentOutlined />,
      label: 'Workflow Simulation',
    },
    {
      key: '/dashboard/testing',
      icon: <BugOutlined />,
      label: 'Testing',
    },
    {
      key: '/dashboard/advanced-nodes',
      icon: <ClusterOutlined />,
      label: 'Advanced Nodes',
    },
    {
      key: '/dashboard/blockchain-models',
      icon: <DatabaseOutlined />,
      label: 'Blockchain Models',
    },
    {
      key: '/dashboard/space-optimization',
      icon: <RocketOutlined />,
      label: 'Space Optimization',
    },
    {
      key: '/dashboard/seo-optimization',
      icon: <SearchOutlined />,
      label: 'SEO Optimization',
    },
    {
      key: '/dashboard/seo-marketplace',
      icon: <ShoppingCartOutlined />,
      label: 'SEO Marketplace',
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

  // Add admin menu item for admin users
  const isAdmin = user?.email?.includes('admin'); // Simple check - replace with proper role check
  if (isAdmin) {
    menuItems.push({
      key: 'admin-separator',
      type: 'divider' as any,
    });
    menuItems.push({
      key: '/admin',
      icon: <SettingOutlined style={{ color: '#e74c3c' }} />,
      label: <span style={{ color: '#e74c3c', fontWeight: 600 }}>Admin Panel</span>,
    });
  }

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
      <Navigation />
      {/* Compact left rail */}
      <div className="nav-rail">
        <div className="rail-top">
          <div className="rail-logo">LD</div>
          <button className="rail-icon" onClick={() => navigate('/dashboard')} title="Dashboard">
            <DashboardOutlined />
          </button>
          <button className="rail-icon" onClick={() => navigate('/dashboard/optimization')} title="Optimization">
            <ThunderboltOutlined />
          </button>
          <button className="rail-icon" onClick={() => navigate('/dashboard/space-mining')} title="Space Mining">
            <GlobalOutlined />
          </button>
          <button className="rail-icon" onClick={() => navigate('/dashboard/analytics')} title="Analytics">
            <BarChartOutlined />
          </button>
        </div>
        <div className="rail-bottom">
          <div className="rail-status" title={`API: ${serviceStatus.api ? 'Operational' : 'Down'}`}>
            <span className={`dot ${serviceStatus.api ? 'ok' : 'down'}`} />
            <ApiOutlined />
          </div>
          <div className="rail-status" title={`Crawler: ${serviceStatus.crawler ? 'Operational' : 'Down'}`}>
            <span className={`dot ${serviceStatus.crawler ? 'ok' : 'down'}`} />
            <BugOutlined />
          </div>
          <div className="rail-status" title={`Optimization: ${serviceStatus.optimization ? 'Operational' : 'Down'}`}>
            <span className={`dot ${serviceStatus.optimization ? 'ok' : 'down'}`} />
            <ThunderboltOutlined />
          </div>
          <div className="rail-status" title={`Blockchain: ${serviceStatus.blockchain ? 'Operational' : 'Down'}`}>
            <span className={`dot ${serviceStatus.blockchain ? 'ok' : 'down'}`} />
            <WalletOutlined />
          </div>
        </div>
      </div>
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
            <ThunderboltOutlined className="logo-icon" />
            {!collapsed && <span className="logo-text">LightDom</span>}
          </div>
        </div>

        {!collapsed && (
          <div style={{ padding: '12px 16px' }}>
            <button className="compose-btn">
              <span className="dot ok" style={{ marginRight: 8 }} /> New Message
            </button>
          </div>
        )}

        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleSidebarClick}
          className="sidebar-menu"
        />

        {!collapsed && (
          <div className="sidebar-sections">
            <div className="section">
              <div className="section-title">MESSAGE CATEGORIES</div>
              <ul className="side-list">
                <li className="side-list-item"><span className="dot ok" /> My works <span className="count">9</span></li>
                <li className="side-list-item"><span className="dot" style={{ color: '#22d3ee' }} /> Accountant <span className="count">43</span></li>
                <li className="side-list-item"><span className="dot" style={{ color: '#ef4444' }} /> Works <span className="count">78</span></li>
                <li className="side-list-item"><span className="dot" style={{ color: '#10b981' }} /> Marketing <span className="count">253</span></li>
              </ul>
            </div>
            <div className="section">
              <div className="section-title">RECENT CHATS</div>
              <ul className="side-list">
                <li className="side-list-item avatar-row"><span className="avatar-circle">K</span> Kierra Gouse</li>
                <li className="side-list-item avatar-row"><span className="avatar-circle">J</span> Jordyn Vaccaro <span className="badge">3</span></li>
              </ul>
            </div>
          </div>
        )}

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
                  prefix={<ThunderboltOutlined />}
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
