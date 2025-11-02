import React, { useState, useMemo } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Layout,
  Menu,
  Avatar,
  Dropdown,
  Button,
  Space,
  Typography,
  Badge,
  Drawer,
  theme
} from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  BarChartOutlined,
  SettingOutlined,
  BellOutlined,
  MenuFoldOutlined,
  CloseCircleOutlined,
  FileTextOutlined,
  DatabaseOutlined,
  ApiOutlined,
  ThunderboltOutlined,
  RocketOutlined,
  ExperimentOutlined,
  TeamOutlined,
  AppstoreOutlined,
  SafetyOutlined,
  GlobalOutlined,
  ToolOutlined,
  QuestionCircleOutlined,
  InfoCircleOutlined,
  CloudDownloadOutlined,
  RiseOutlined,
  SearchOutlined,
  SwapOutlined,
  CommentOutlined,
  SnippetsOutlined,
  ArrowLeftOutlined,
  ShieldOutlined,
  MenuUnfoldOutlined,
  EditOutlined
} from '@ant-design/icons';
import { useAuth } from '../../../hooks/state/useAuth';
import './AdminLayout.css';

const { Header, Sider, Content } = Layout;
const { Text, Title } = Typography;
const { useToken } = theme;

const AdminLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = useToken();
  
  // Get the current path to highlight the active menu item
  const currentPath = location.pathname;

  // Main navigation items
  const adminMenuItems = useMemo(() => [
    {
      key: '/admin',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'user-management',
      icon: <UserOutlined />,
      label: 'User Management',
      children: [
        { key: '/admin/users', label: 'All Users', icon: <TeamOutlined /> },
        { key: '/admin/user-workflows', label: 'User Workflows', icon: <ThunderboltOutlined /> },
        { key: '/admin/roles', label: 'Roles & Permissions', icon: <SafetyOutlined /> },
        { key: '/admin/activity', label: 'User Activity', icon: <EditOutlined /> },
      ],
    },
    {
      key: 'content',
      icon: <AppstoreOutlined />,
      label: 'Content',
      children: [
        { key: '/admin/pages', label: 'Pages', icon: <FileTextOutlined /> },
        { key: '/admin/media', label: 'Media Library', icon: <DatabaseOutlined /> },
        { key: '/admin/comments', label: 'Comments', icon: <CommentOutlined /> },
      ],
    },
    {
      key: 'system',
      icon: <SettingOutlined />,
      label: 'System',
      children: [
        { key: '/admin/settings', label: 'General Settings', icon: <ToolOutlined /> },
        { key: '/admin/performance', label: 'Performance', icon: <ThunderboltOutlined /> },
        { key: '/admin/updates', label: 'Updates', icon: <CloudDownloadOutlined /> },
      ],
    },
    {
      key: 'analytics',
      icon: <BarChartOutlined />,
      label: 'Analytics',
      children: [
        { key: '/admin/overview', label: 'Overview', icon: <DashboardOutlined /> },
        { key: '/admin/reports', label: 'Reports', icon: <FileTextOutlined /> },
        { key: '/admin/insights', label: 'Insights', icon: <RiseOutlined /> },
      ],
    },
    {
      key: 'seo',
      icon: <GlobalOutlined />,
      label: 'SEO',
      children: [
        { key: '/admin/seo/analysis', label: 'SEO Analysis', icon: <SearchOutlined /> },
        { key: '/admin/seo-workflows', label: 'SEO Workflows', icon: <ThunderboltOutlined /> },
        { key: '/admin/seo/sitemap', label: 'Sitemap', icon: <SwapOutlined /> },
        { key: '/admin/seo/redirects', label: 'Redirects', icon: <SwapOutlined /> },
      ],
    },
    {
      type: 'divider' as const,
    },
    {
      key: '/admin/ai-automation',
      icon: <RocketOutlined />,
      label: 'AI Automation',
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'help',
      icon: <QuestionCircleOutlined />,
      label: 'Help & Support',
    },
    {
      key: 'documentation',
      icon: <InfoCircleOutlined />,
      label: 'Documentation',
    },
    {
      key: '/admin/settings',
      icon: <SettingOutlined />,
      label: 'Admin Settings',
    },
  ], []);

  const userMenuItems = [
    {
      key: 'back-to-dashboard',
      icon: <ArrowLeftOutlined />,
      label: 'Back to Dashboard',
    },
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile',
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <SettingOutlined />,
      label: 'Logout',
      danger: true,
    },
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    if (key === 'logout') {
      logout();
      navigate('/login');
    } else if (key === 'back-to-dashboard') {
      navigate('/dashboard');
    } else if (key === 'profile') {
      navigate('/dashboard/profile');
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
      className="admin-user-dropdown-menu"
    />
  );

  return (
    <Layout className="admin-layout" style={{ minHeight: '100vh' }}>
      {/* Admin Banner - Visual distinction */}
      <div className="admin-banner">
        <ShieldOutlined /> Administrator Mode
      </div>

      {/* Mobile Header */}
      <div className="admin-mobile-header">
        <Button
          type="text"
          icon={<MenuUnfoldOutlined />}
          onClick={() => setMobileMenuVisible(true)}
          className="mobile-menu-button"
        />
        <Title level={4} className="mobile-title" style={{ margin: 0, color: '#fff' }}>
          Admin Dashboard
        </Title>
        <Space>
          <Badge count={0} size="small">
            <Button
              type="text"
              icon={<BellOutlined style={{ color: '#fff' }} />}
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
        className="admin-sidebar"
        width={280}
        collapsedWidth={80}
        style={{
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
          borderRight: '2px solid #e74c3c',
        }}
      >
        <div className="admin-sidebar-header">
          <div className="admin-logo">
            <ShieldOutlined className="admin-logo-icon" />
            {!collapsed && <span className="admin-logo-text">Admin Panel</span>}
          </div>
        </div>

        {!collapsed && (
          <div style={{ padding: '12px 16px' }}>
            <Button
              type="primary"
              danger
              block
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/dashboard')}
            >
              Back to Dashboard
            </Button>
          </div>
        )}

        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={adminMenuItems}
          onClick={handleSidebarClick}
          className="admin-sidebar-menu"
          theme="dark"
          style={{ background: 'transparent', borderRight: 'none' }}
        />

        <div className="admin-sidebar-footer">
          <div style={{ padding: '16px', background: 'rgba(231, 76, 60, 0.1)', borderRadius: '8px', margin: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Avatar
                src={user?.avatar}
                icon={<UserOutlined />}
                size="small"
              />
              {!collapsed && (
                <div>
                  <Text strong style={{ color: '#fff', display: 'block' }}>{user?.name}</Text>
                  <Text type="secondary" style={{ color: '#e74c3c', fontSize: '12px' }}>
                    Administrator
                  </Text>
                </div>
              )}
            </div>
          </div>
        </div>
      </Sider>

      <Layout className="admin-main">
        {/* Desktop Header */}
        <Header className="admin-header" style={{ background: '#1a1a2e', borderBottom: '2px solid #e74c3c' }}>
          <div className="header-left">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <CloseCircleOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              className="sidebar-toggle"
              style={{ color: '#fff' }}
            />
          </div>

          <div className="header-center">
            <Title level={3} className="page-title" style={{ margin: 0, color: '#fff' }}>
              <ShieldOutlined style={{ color: '#e74c3c', marginRight: '8px' }} />
              {adminMenuItems.find(item => item.key === location.pathname)?.label || 'Admin Dashboard'}
            </Title>
          </div>

          <div className="header-right">
            <Space size="middle">
              <Badge count={0} size="small">
                <Button
                  type="text"
                  icon={<BellOutlined style={{ color: '#fff' }} />}
                  className="notification-button"
                />
              </Badge>

              <Dropdown overlay={userMenu} placement="bottomRight">
                <div className="admin-user-profile">
                  <Avatar
                    src={user?.avatar}
                    icon={<UserOutlined />}
                    className="user-avatar"
                  />
                  <div className="user-info">
                    <Text strong style={{ color: '#fff' }}>{user?.name}</Text>
                    <Text type="secondary" style={{ color: '#e74c3c', fontSize: '12px' }}>
                      Administrator
                    </Text>
                  </div>
                </div>
              </Dropdown>
            </Space>
          </div>
        </Header>

        {/* Main Content */}
        <Content className="admin-content" style={{ padding: '24px', background: '#f0f2f5' }}>
          <Outlet />
        </Content>
      </Layout>

      {/* Mobile Sidebar Drawer */}
      <Drawer
        title={
          <div style={{ color: '#e74c3c' }}>
            <ShieldOutlined /> Admin Dashboard
          </div>
        }
        placement="left"
        onClose={() => setMobileMenuVisible(false)}
        open={mobileMenuVisible}
        className="admin-mobile-drawer"
        width={280}
      >
        <Button
          type="primary"
          danger
          block
          icon={<ArrowLeftOutlined />}
          onClick={() => {
            setMobileMenuVisible(false);
            navigate('/dashboard');
          }}
          style={{ marginBottom: '16px' }}
        >
          Back to Dashboard
        </Button>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={adminMenuItems}
          onClick={handleSidebarClick}
          className="admin-mobile-sidebar-menu"
        />
      </Drawer>
    </Layout>
  );
};

export default AdminLayout;
