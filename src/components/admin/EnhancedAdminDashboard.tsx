/**
 * Enhanced Admin Dashboard - Admin-Only Access
 * Comprehensive admin dashboard with all advanced features including Neural Network and SEO
 * Professional styling with intuitive settings and user-friendly UX
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
  Transfer,
  Tree,
  Checkbox,
  Radio,
  Upload,
  ColorPicker,
} from 'antd';
import {
  DashboardOutlined,
  RobotOutlined,
  TrophyOutlined,
  GlobalOutlined,
  ExperimentOutlined,
  UserOutlined,
  TeamOutlined,
  SettingOutlined,
  SecurityScanOutlined,
  DatabaseOutlined,
  CloudOutlined,
  ApiOutlined,
  MonitorOutlined,
  BarChartOutlined,
  LineChartOutlined,
  PieChartOutlined,
  FileTextOutlined,
  KeyOutlined,
  LockOutlined,
  UnlockOutlined,
  SafetyOutlined,
  AuditOutlined,
  BugOutlined,
  CodeOutlined,
  MobileOutlined,
  DesktopOutlined,
  TabletOutlined,
  BellOutlined,
  MailOutlined,
  PhoneOutlined,
  VideoCameraOutlined,
  AudioOutlined,
  CameraOutlined,
  ScreenshotOutlined,
  ScanOutlined,
  HddOutlined,
  CloudServerOutlined,
  DeploymentUnitOutlined,
  StarOutlined,
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
  ThunderboltOutlined,
  RocketOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  StopOutlined,
  SearchOutlined,
  FilterOutlined,
  SortAscendingOutlined,
  CalendarOutlined,
  WalletOutlined,
  GiftOutlined,
  CrownOutlined,
  ToolOutlined,
  ControlOutlined,
  NodeIndexOutlined,
  BranchesOutlined,
  FunctionOutlined,
  CalculatorOutlined,
  RadarChartOutlined,
  HeatMapOutlined,
  StockOutlined,
  FireOutlined,
  RiseOutlined,
  FallOutlined,
  MinusOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
  BulbOutlined,
  HeartOutlined,
  LikeOutlined,
  MessageOutlined,
  RetweetOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';

import NeuralNetworkPage from '../pages/NeuralNetworkPage';
import SEOContentGeneratorPage from '../pages/SEOContentGeneratorPage';
import UserManagementPage from '../pages/UserManagementPage';
import BillingManagementPage from '../pages/BillingManagementPage';
import SettingsDashboard from '../settings/SettingsDashboard';
import {
  EnhancedCard,
  EnhancedProgress,
  EnhancedStatistic,
  EnhancedAvatar,
  EnhancedTag,
  EnhancedButton,
  EnhancedInput,
} from '../DesignSystemComponents';
import {
  getColor,
  getGradient,
  getTextStyle,
  getSpacing,
  getShadow,
  getBorderRadius,
  getAnimation,
  getTransition,
  getHoverEffect,
  getHoverStyles,
  composeStyle,
  createComponentStyle,
  getFlexStyle,
  getGridStyle,
  getPerformanceStyles,
  willChange,
} from '../../utils/StyleUtils';

const { Header, Sider, Content } = Layout;
const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;
const { Option } = Select;
const { TextArea } = Input;

// Mock admin authentication check
const useAdminAuth = () => {
  const [isAdmin, setIsAdmin] = useState(true);
  const [loading, setLoading] = useState(false);

  const checkPermission = useCallback((resource: string, action: string) => {
    // Simulate admin permission check
    return isAdmin;
  }, [isAdmin]);

  return { isAdmin, loading, checkPermission };
};

const EnhancedAdminDashboard: React.FC = () => {
  const { isAdmin, loading: authLoading, checkPermission } = useAdminAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [settingsDrawerVisible, setSettingsDrawerVisible] = useState(false);
  const [selectedSettingsCategory, setSelectedSettingsCategory] = useState('general');

  // Check admin permission
  if (!checkPermission('admin', 'access')) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#f5f5f5',
      }}>
        <LockOutlined style={{ fontSize: '64px', color: '#ff4d4f', marginBottom: '16px' }} />
        <Title level={2}>Access Denied</Title>
        <Text type="secondary">You don't have permission to access the admin dashboard.</Text>
      </div>
    );
  }

  // Admin-only navigation items
  const adminNavigationItems = [
    {
      key: 'overview',
      label: (
        <Space>
          <DashboardOutlined />
          <span>Overview</span>
        </Space>
      ),
      children: renderOverview(),
    },
    {
      key: 'neural-network',
      label: (
        <Space>
          <ExperimentOutlined />
          <span>Neural Networks</span>
          <Badge count="Admin" size="small" style={{ backgroundColor: '#52c41a' }} />
        </Space>
      ),
      children: <NeuralNetworkPage />,
    },
    {
      key: 'seo-generator',
      label: (
        <Space>
          <RobotOutlined />
          <span>SEO Generator</span>
          <Badge count="Admin" size="small" style={{ backgroundColor: '#52c41a' }} />
        </Space>
      ),
      children: <SEOContentGeneratorPage />,
    },
    {
      key: 'users',
      label: (
        <Space>
          <TeamOutlined />
          <span>User Management</span>
        </Space>
      ),
      children: <UserManagementPage />,
    },
    {
      key: 'security',
      label: (
        <Space>
          <SafetyOutlined />
          <span>Security</span>
        </Space>
      ),
      children: <SettingsDashboard defaultTab="security" />,
    },
    {
      key: 'system',
      label: (
        <Space>
          <ControlOutlined />
          <span>System Settings</span>
        </Space>
      ),
      children: <SettingsDashboard defaultTab="system" />,
    },
    {
      key: 'billing',
      label: (
        <Space>
          <WalletOutlined />
          <span>Billing</span>
        </Space>
      ),
      children: <BillingManagementPage />,
    },
    {
      key: 'blockchain',
      label: (
        <Space>
          <NodeIndexOutlined />
          <span>Blockchain</span>
        </Space>
      ),
      children: renderBlockchainManagement(),
    },
    {
      key: 'automation',
      label: (
        <Space>
          <ThunderboltOutlined />
          <span>Automation</span>
        </Space>
      ),
      children: renderAutomationSettings(),
    },
    {
      key: 'analytics',
      label: (
        <Space>
          <BarChartOutlined />
          <span>Analytics</span>
        </Space>
      ),
      children: renderAnalytics(),
    },
  ];

  // Render functions for different sections
  function renderOverview() {
    return (
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        {/* Admin Stats */}
        <Row gutter={[getSpacing(6), getSpacing(6)]}>
          <Col xs={24} sm={12} md={6}>
            <EnhancedCard variant="elevated" animation="fadeIn">
              <EnhancedStatistic
                title="Total Users"
                value={15420}
                trend="up"
                trendValue={12.5}
                prefix={<TeamOutlined />}
                color="primary"
              />
            </EnhancedCard>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <EnhancedCard variant="elevated" animation="fadeIn">
              <EnhancedStatistic
                title="Active Models"
                value={8}
                trend="up"
                trendValue={2}
                prefix={<ExperimentOutlined />}
                color="success"
              />
            </EnhancedCard>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <EnhancedCard variant="elevated" animation="fadeIn">
              <EnhancedStatistic
                title="SEO Campaigns"
                value={24}
                trend="up"
                trendValue={8}
                prefix={<RobotOutlined />}
                color="warning"
              />
            </EnhancedCard>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <EnhancedCard variant="elevated" animation="fadeIn">
              <EnhancedStatistic
                title="System Health"
                value={98.5}
                trend="stable"
                trendValue={0}
                suffix="%"
                color="secondary"
              />
            </EnhancedCard>
          </Col>
        </Row>

        {/* Quick Actions */}
        <EnhancedCard title="Admin Quick Actions" variant="elevated">
          <Row gutter={[getSpacing(4), getSpacing(4)]}>
            <Col xs={24} sm={12} md={6}>
              <EnhancedButton
                variant="primary"
                icon={<ExperimentOutlined />}
                fullWidth
                onClick={() => setActiveTab('neural-network')}
              >
                Neural Networks
              </EnhancedButton>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <EnhancedButton
                variant="primary"
                icon={<RobotOutlined />}
                fullWidth
                onClick={() => setActiveTab('seo-generator')}
              >
                SEO Generator
              </EnhancedButton>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <EnhancedButton
                variant="secondary"
                icon={<TeamOutlined />}
                fullWidth
                onClick={() => setActiveTab('users')}
              >
                Manage Users
              </EnhancedButton>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <EnhancedButton
                variant="ghost"
                icon={<SettingOutlined />}
                fullWidth
                onClick={() => setSettingsDrawerVisible(true)}
              >
                Settings
              </EnhancedButton>
            </Col>
          </Row>
        </EnhancedCard>

        {/* System Status */}
        <Row gutter={[getSpacing(6), getSpacing(6)]}>
          <Col xs={24} md={12}>
            <EnhancedCard title="System Services" variant="elevated">
              <Space direction="vertical" style={{ width: '100%' }} size="medium">
                <div style={getFlexStyle('row', 'space-between', 'center')}>
                  <Space>
                    <CheckCircleOutlined style={{ color: '#52c41a' }} />
                    <Text>API Service</Text>
                  </Space>
                  <EnhancedTag color="success">Healthy</EnhancedTag>
                </div>
                <div style={getFlexStyle('row', 'space-between', 'center')}>
                  <Space>
                    <CheckCircleOutlined style={{ color: '#52c41a' }} />
                    <Text>Database</Text>
                  </Space>
                  <EnhancedTag color="success">Connected</EnhancedTag>
                </div>
                <div style={getFlexStyle('row', 'space-between', 'center')}>
                  <Space>
                    <CheckCircleOutlined style={{ color: '#52c41a' }} />
                    <Text>Neural Network Engine</Text>
                  </Space>
                  <EnhancedTag color="success">Running</EnhancedTag>
                </div>
                <div style={getFlexStyle('row', 'space-between', 'center')}>
                  <Space>
                    <CheckCircleOutlined style={{ color: '#52c41a' }} />
                    <Text>SEO Generator</Text>
                  </Space>
                  <EnhancedTag color="success">Active</EnhancedTag>
                </div>
              </Space>
            </EnhancedCard>
          </Col>
          <Col xs={24} md={12}>
            <EnhancedCard title="Recent Activity" variant="elevated">
              <Timeline
                items={[
                  {
                    children: 'Neural network model training completed',
                    color: 'green',
                  },
                  {
                    children: 'SEO campaign generated for 5 keywords',
                    color: 'blue',
                  },
                  {
                    children: 'System backup completed successfully',
                    color: 'gray',
                  },
                  {
                    children: 'New user registration spike detected',
                    color: 'orange',
                  },
                ]}
              />
            </EnhancedCard>
          </Col>
        </Row>
      </Space>
    );
  }

  function renderUserManagement() {
    const userColumns = [
      { title: 'User', dataIndex: 'name', key: 'name' },
      { title: 'Email', dataIndex: 'email', key: 'email' },
      { title: 'Role', dataIndex: 'role', key: 'role' },
      { title: 'Status', dataIndex: 'status', key: 'status' },
      { title: 'Actions', key: 'actions' },
    ];

    const userData = [
      { key: '1', name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'Active' },
      { key: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'User', status: 'Active' },
      { key: '3', name: 'Bob Johnson', email: 'bob@example.com', role: 'User', status: 'Inactive' },
    ];

    return (
      <EnhancedCard title="User Management" variant="elevated">
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <div style={getFlexStyle('row', 'space-between', 'center')}>
            <EnhancedButton variant="primary" icon={<PlusOutlined />}>
              Add User
            </EnhancedButton>
            <Space>
              <Input placeholder="Search users..." prefix={<SearchOutlined />} />
              <Button icon={<FilterOutlined />}>Filter</Button>
            </Space>
          </div>
          <Table columns={userColumns} dataSource={userData} />
        </Space>
      </EnhancedCard>
    );
  }

  function renderSecuritySettings() {
    return (
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <EnhancedCard title="Security Overview" variant="elevated">
          <Row gutter={[getSpacing(6), getSpacing(6)]}>
            <Col span={8}>
              <EnhancedStatistic
                title="Security Score"
                value={92}
                trend="up"
                trendValue={3}
                suffix="/ 100"
                color="success"
              />
            </Col>
            <Col span={8}>
              <EnhancedStatistic
                title="Active Sessions"
                value={24}
                prefix={<UserOutlined />}
                color="primary"
              />
            </Col>
            <Col span={8}>
              <EnhancedStatistic
                title="Failed Logins"
                value={3}
                prefix={<WarningOutlined />}
                color="warning"
              />
            </Col>
          </Row>
        </EnhancedCard>

        <EnhancedCard title="Security Settings" variant="elevated">
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <div>
              <Text strong>Two-Factor Authentication</Text>
              <div style={getFlexStyle('row', 'space-between', 'center')}>
                <Text type="secondary">Require 2FA for all admin users</Text>
                <Switch defaultChecked />
              </div>
            </div>
            <div>
              <Text strong>Session Timeout</Text>
              <div style={getFlexStyle('row', 'space-between', 'center')}>
                <Text type="secondary">Auto-logout after inactivity</Text>
                <Select defaultValue="30" style={{ width: 120 }}>
                  <Option value="15">15 minutes</Option>
                  <Option value="30">30 minutes</Option>
                  <Option value="60">1 hour</Option>
                  <Option value="120">2 hours</Option>
                </Select>
              </div>
            </div>
            <div>
              <Text strong>IP Whitelist</Text>
              <div style={getFlexStyle('row', 'space-between', 'center')}>
                <Text type="secondary">Restrict access to specific IPs</Text>
                <Switch />
              </div>
            </div>
          </Space>
        </EnhancedCard>
      </Space>
    );
  }

  function renderSystemSettings() {
    return (
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <EnhancedCard title="System Configuration" variant="elevated">
          <Form layout="vertical">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="System Name">
                  <Input defaultValue="LightDom Admin System" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Environment">
                  <Select defaultValue="production">
                    <Option value="development">Development</Option>
                    <Option value="staging">Staging</Option>
                    <Option value="production">Production</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Time Zone">
                  <Select defaultValue="UTC">
                    <Option value="UTC">UTC</Option>
                    <Option value="EST">Eastern Time</Option>
                    <Option value="PST">Pacific Time</Option>
                    <Option value="CET">Central European</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Language">
                  <Select defaultValue="en">
                    <Option value="en">English</Option>
                    <Option value="es">Spanish</Option>
                    <Option value="fr">French</Option>
                    <Option value="de">German</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </EnhancedCard>

        <EnhancedCard title="Performance Settings" variant="elevated">
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <div>
              <Text strong>Cache Duration</Text>
              <Slider defaultValue={30} min={5} max={120} />
              <Text type="secondary">5 minutes - 2 hours</Text>
            </div>
            <div>
              <Text strong>API Rate Limit</Text>
              <Slider defaultValue={1000} min={100} max={10000} step={100} />
              <Text type="secondary">100 - 10,000 requests per hour</Text>
            </div>
            <div>
              <Text strong>Enable Debug Mode</Text>
              <div style={getFlexStyle('row', 'space-between', 'center')}>
                <Text type="secondary">Show detailed error messages</Text>
                <Switch />
              </div>
            </div>
          </Space>
        </EnhancedCard>
      </Space>
    );
  }

  function renderBillingManagement() {
    return (
      <EnhancedCard title="Billing Management" variant="elevated">
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <Row gutter={[getSpacing(6), getSpacing(6)]}>
            <Col span={8}>
              <EnhancedStatistic
                title="Monthly Revenue"
                value={45678}
                trend="up"
                trendValue={15.3}
                prefix="$"
                color="success"
              />
            </Col>
            <Col span={8}>
              <EnhancedStatistic
                title="Active Subscriptions"
                value={142}
                trend="up"
                trendValue={8}
                color="primary"
              />
            </Col>
            <Col span={8}>
              <EnhancedStatistic
                title="Pending Invoices"
                value={12}
                trend="down"
                trendValue={3}
                color="warning"
              />
            </Col>
          </Row>
          <div style={getFlexStyle('row', 'center', 'center')}>
            <EnhancedButton variant="primary" icon={<PlusOutlined />}>
              Generate Invoice
            </EnhancedButton>
          </div>
        </Space>
      </EnhancedCard>
    );
  }

  function renderBlockchainManagement() {
    return (
      <EnhancedCard title="Blockchain Management" variant="elevated">
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <Row gutter={[getSpacing(6), getSpacing(6)]}>
            <Col span={8}>
              <EnhancedStatistic
                title="Block Height"
                value={15420}
                trend="up"
                trendValue={144}
                color="primary"
              />
            </Col>
            <Col span={8}>
              <EnhancedStatistic
                title="Active Miners"
                value={89}
                trend="up"
                trendValue={5}
                color="success"
              />
            </Col>
            <Col span={8}>
              <EnhancedStatistic
                title="Network Hashrate"
                value={1234}
                trend="up"
                trendValue={12}
                suffix="MH/s"
                color="warning"
              />
            </Col>
          </Row>
        </Space>
      </EnhancedCard>
    );
  }

  function renderAutomationSettings() {
    return (
      <EnhancedCard title="Automation Settings" variant="elevated">
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <div>
            <Text strong>Auto-Training</Text>
            <div style={getFlexStyle('row', 'space-between', 'center')}>
              <Text type="secondary">Automatically retrain underperforming models</Text>
              <Switch defaultChecked />
            </div>
          </div>
          <div>
            <Text strong>SEO Optimization</Text>
            <div style={getFlexStyle('row', 'space-between', 'center')}>
              <Text type="secondary">Auto-optimize content based on performance</Text>
              <Switch defaultChecked />
            </div>
          </div>
          <div>
            <Text strong>Backup Schedule</Text>
            <Select defaultValue="daily" style={{ width: '100%' }}>
              <Option value="hourly">Hourly</Option>
              <Option value="daily">Daily</Option>
              <Option value="weekly">Weekly</Option>
              <Option value="monthly">Monthly</Option>
            </Select>
          </div>
        </Space>
      </EnhancedCard>
    );
  }

  function renderAnalytics() {
    return (
      <EnhancedCard title="Analytics Dashboard" variant="elevated">
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <Row gutter={[getSpacing(6), getSpacing(6)]}>
            <Col span={6}>
              <EnhancedStatistic
                title="Page Views"
                value={123456}
                trend="up"
                trendValue={8.5}
                color="primary"
              />
            </Col>
            <Col span={6}>
              <EnhancedStatistic
                title="Unique Visitors"
                value={45678}
                trend="up"
                trendValue={12.3}
                color="success"
              />
            </Col>
            <Col span={6}>
              <EnhancedStatistic
                title="Conversion Rate"
                value={3.45}
                trend="up"
                trendValue={0.8}
                suffix="%"
                color="warning"
              />
            </Col>
            <Col span={6}>
              <EnhancedStatistic
                title="Avg. Session"
                value={4.23}
                trend="stable"
                trendValue={0}
                suffix="min"
                color="secondary"
              />
            </Col>
          </Row>
        </Space>
      </EnhancedCard>
    );
  }

  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        style={{
          background: '#fff',
          borderRight: '1px solid #e8e8e8',
        }}
      >
        <div style={{
          padding: getSpacing(4),
          borderBottom: '1px solid #e8e8e8',
          textAlign: 'center',
        }}>
          <ExperimentOutlined style={{
            fontSize: '24px',
            color: '#1890ff',
            marginBottom: '8px',
          }} />
          <Title level={5} style={{ margin: 0 }}>
            {collapsed ? 'Admin' : 'Admin Panel'}
          </Title>
        </div>
        
        <Menu
          mode="inline"
          selectedKeys={[activeTab]}
          onClick={({ key }) => setActiveTab(key)}
          style={{ border: 'none' }}
        >
          {adminNavigationItems.map(item => (
            <Menu.Item key={item.key}>
              {item.label}
            </Menu.Item>
          ))}
        </Menu>
      </Sider>

      <Layout>
        <Header style={{
          background: '#fff',
          borderBottom: '1px solid #e8e8e8',
          padding: getSpacing(4),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={getFlexStyle('row', 'flex-start', 'center')}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ marginRight: getSpacing(3) }}
            />
            <Title level={3} style={{ margin: 0 }}>
              Admin Dashboard
            </Title>
          </div>
          <Space>
            <Badge count={5}>
              <Button type="text" icon={<BellOutlined />} />
            </Badge>
            <EnhancedAvatar text="A" size="small" />
            <EnhancedButton
              variant="ghost"
              icon={<SettingOutlined />}
              onClick={() => setSettingsDrawerVisible(true)}
            >
              Settings
            </EnhancedButton>
          </Space>
        </Header>

        <Content style={{ padding: getSpacing(6) }}>
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={adminNavigationItems}
            size="large"
          />
        </Content>
      </Layout>

      {/* Settings Drawer */}
      <Drawer
        title="Admin Settings"
        placement="right"
        onClose={() => setSettingsDrawerVisible(false)}
        open={settingsDrawerVisible}
        width={500}
      >
        <Tabs
          activeKey={selectedSettingsCategory}
          onChange={setSelectedSettingsCategory}
          size="small"
        >
          <TabPane tab="General" key="general">
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <div>
                <Text strong>Theme</Text>
                <Select defaultValue="light" style={{ width: '100%' }}>
                  <Option value="light">Light</Option>
                  <Option value="dark">Dark</Option>
                  <Option value="auto">Auto</Option>
                </Select>
              </div>
              <div>
                <Text strong>Language</Text>
                <Select defaultValue="en" style={{ width: '100%' }}>
                  <Option value="en">English</Option>
                  <Option value="es">Spanish</Option>
                  <Option value="fr">French</Option>
                </Select>
              </div>
            </Space>
          </TabPane>
          <TabPane tab="Notifications" key="notifications">
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <div>
                <Text strong>Email Notifications</Text>
                <div style={getFlexStyle('row', 'space-between', 'center')}>
                  <Text type="secondary">Receive email alerts</Text>
                  <Switch defaultChecked />
                </div>
              </div>
              <div>
                <Text strong>Push Notifications</Text>
                <div style={getFlexStyle('row', 'space-between', 'center')}>
                  <Text type="secondary">Browser push notifications</Text>
                  <Switch />
                </div>
              </div>
            </Space>
          </TabPane>
          <TabPane tab="Privacy" key="privacy">
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <div>
                <Text strong>Data Collection</Text>
                <div style={getFlexStyle('row', 'space-between', 'center')}>
                  <Text type="secondary">Allow analytics data collection</Text>
                  <Switch defaultChecked />
                </div>
              </div>
              <div>
                <Text strong>Cookies</Text>
                <div style={getFlexStyle('row', 'space-between', 'center')}>
                  <Text type="secondary">Allow essential cookies</Text>
                  <Switch defaultChecked />
                </div>
              </div>
            </Space>
          </TabPane>
        </Tabs>
      </Drawer>
    </Layout>
  );
};

export default EnhancedAdminDashboard;
