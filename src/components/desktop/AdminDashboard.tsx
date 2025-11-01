/**
 * Admin Dashboard Component
 * Exodus wallet-inspired admin interface with real-time monitoring
 * Comprehensive system management and analytics
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
  Table,
  Button,
  Tabs,
  Alert,
  Badge,
  List,
  Avatar,
  Tag,
  Divider,
  Select,
  DatePicker,
  Input,
  Modal,
  Form,
  message,
  Tooltip,
  Switch,
  Dropdown,
  Menu,
} from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  SettingOutlined,
  SecurityScanOutlined,
  MonitorOutlined,
  AlertOutlined,
  TrophyOutlined,
  WalletOutlined,
  GlobalOutlined,
  ThunderboltOutlined,
  ApiOutlined,
  DatabaseOutlined,
  CloudOutlined,
  BugOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  CloseCircleOutlined,
  ReloadOutlined,
  ExportOutlined,
  ImportOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
  BarChartOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import { Line, Column, Pie, Area } from '@ant-design/plots';
import LightDomDesignSystem, {
  LightDomColors,
  LightDomShadows,
  StatsCard,
} from '../../styles/LightDomDesignSystem';

const { Header, Content, Sider } = Layout;
const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

interface SystemMetrics {
  cpu: number;
  memory: number;
  disk: number;
  network: number;
  uptime: number;
}

interface User {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'inactive' | 'suspended';
  lastLogin: string;
  optimizations: number;
  tokens: number;
  joinDate: string;
}

interface SecurityAlert {
  id: string;
  type: 'warning' | 'error' | 'info';
  message: string;
  timestamp: string;
  resolved: boolean;
}

interface MiningStats {
  hashRate: number;
  blocksMined: number;
  difficulty: number;
  miners: number;
  rewards: number;
}

const AdminDashboard: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics>({
    cpu: 0,
    memory: 0,
    disk: 0,
    network: 0,
    uptime: 0,
  });
  const [users, setUsers] = useState<User[]>([]);
  const [securityAlerts, setSecurityAlerts] = useState<SecurityAlert[]>([]);
  const [miningStats, setMiningStats] = useState<MiningStats>({
    hashRate: 0,
    blocksMined: 0,
    difficulty: 0,
    miners: 0,
    rewards: 0,
  });
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userModalVisible, setUserModalVisible] = useState(false);

  // Real-time data simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setSystemMetrics({
        cpu: Math.random() * 30 + 20,
        memory: Math.random() * 40 + 40,
        disk: Math.random() * 20 + 60,
        network: Math.random() * 50 + 25,
        uptime: Date.now(),
      });

      setMiningStats({
        hashRate: Math.random() * 1000 + 2000,
        blocksMined: Math.floor(Math.random() * 10) + 50,
        difficulty: Math.random() * 1000000 + 5000000,
        miners: Math.floor(Math.random() * 100) + 500,
        rewards: Math.floor(Math.random() * 10000) + 50000,
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Mock data
  useEffect(() => {
    setUsers([
      {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        status: 'active',
        lastLogin: '2025-10-27T10:30:00Z',
        optimizations: 245,
        tokens: 1250,
        joinDate: '2025-01-15',
      },
      {
        id: '2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        status: 'active',
        lastLogin: '2025-10-27T09:15:00Z',
        optimizations: 189,
        tokens: 980,
        joinDate: '2025-02-20',
      },
      {
        id: '3',
        name: 'Bob Wilson',
        email: 'bob@example.com',
        status: 'suspended',
        lastLogin: '2025-10-25T14:20:00Z',
        optimizations: 67,
        tokens: 340,
        joinDate: '2025-03-10',
      },
    ]);

    setSecurityAlerts([
      {
        id: '1',
        type: 'warning',
        message: 'Unusual login activity detected from IP 192.168.1.100',
        timestamp: '2025-10-27T11:45:00Z',
        resolved: false,
      },
      {
        id: '2',
        type: 'error',
        message: 'Failed authentication attempt for user admin@example.com',
        timestamp: '2025-10-27T11:30:00Z',
        resolved: false,
      },
      {
        id: '3',
        type: 'info',
        message: 'System backup completed successfully',
        timestamp: '2025-10-27T10:00:00Z',
        resolved: true,
      },
    ]);
  }, []);

  // Chart configurations
  const performanceConfig = {
    data: [
      { time: '00:00', cpu: 25, memory: 45, disk: 70 },
      { time: '04:00', cpu: 30, memory: 50, disk: 72 },
      { time: '08:00', cpu: 45, memory: 65, disk: 75 },
      { time: '12:00', cpu: 35, memory: 55, disk: 73 },
      { time: '16:00', cpu: 40, memory: 60, disk: 74 },
      { time: '20:00', cpu: 28, memory: 48, disk: 71 },
    ],
    xField: 'time',
    yField: 'value',
    seriesField: 'type',
    smooth: true,
    color: [LightDomColors.primary[500], LightDomColors.accent.orange, LightDomColors.accent.purple],
  };

  const userGrowthConfig = {
    data: [
      { month: 'Jan', users: 1000, active: 800 },
      { month: 'Feb', users: 1200, active: 950 },
      { month: 'Mar', users: 1450, active: 1150 },
      { month: 'Apr', users: 1680, active: 1350 },
      { month: 'May', users: 1920, active: 1580 },
      { month: 'Jun', users: 2200, active: 1850 },
    ],
    xField: 'month',
    yField: 'users',
    seriesField: 'type',
    color: [LightDomColors.primary[500], LightDomColors.accent.green],
  };

  const tokenDistributionConfig = {
    data: [
      { type: 'Mining', value: 45 },
      { type: 'Referrals', value: 25 },
      { type: 'Bonuses', value: 20 },
      { type: 'Staking', value: 10 },
    ],
    angleField: 'value',
    colorField: 'type',
    color: [LightDomColors.primary[500], LightDomColors.accent.purple, LightDomColors.accent.orange, LightDomColors.accent.green],
  };

  // User table columns
  const userColumns = [
    {
      title: 'User',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: User) => (
        <Space>
          <Avatar icon={<UserOutlined />} />
          <div>
            <div style={{ fontWeight: 600 }}>{text}</div>
            <div style={{ fontSize: '12px', color: LightDomColors.dark.textSecondary }}>
              {record.email}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag
          color={
            status === 'active' ? 'green' : status === 'suspended' ? 'red' : 'default'
          }
        >
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Optimizations',
      dataIndex: 'optimizations',
      key: 'optimizations',
      render: (value: number) => (
        <Statistic value={value} valueStyle={{ fontSize: '14px' }} />
      ),
    },
    {
      title: 'Tokens',
      dataIndex: 'tokens',
      key: 'tokens',
      render: (value: number) => (
        <Statistic
          value={value}
          valueStyle={{ fontSize: '14px', color: LightDomColors.accent.green }}
          prefix={<WalletOutlined />}
        />
      ),
    },
    {
      title: 'Last Login',
      dataIndex: 'lastLogin',
      key: 'lastLogin',
      render: (date: string) => (
        <Text style={{ fontSize: '12px' }}>
          {new Date(date).toLocaleString()}
        </Text>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: User) => (
        <Dropdown
          overlay={
            <Menu>
              <Menu.Item
                key="view"
                icon={<EyeOutlined />}
                onClick={() => {
                  setSelectedUser(record);
                  setUserModalVisible(true);
                }}
              >
                View Details
              </Menu.Item>
              <Menu.Item key="edit" icon={<EditOutlined />}>
                Edit User
              </Menu.Item>
              <Menu.Item key="suspend" icon={<SecurityScanOutlined />}>
                {record.status === 'active' ? 'Suspend' : 'Activate'}
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item key="delete" icon={<DeleteOutlined />} danger>
                Delete User
              </Menu.Item>
            </Menu>
          }
        >
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  const handleUserAction = (action: string, userId: string) => {
    message.success(`User ${action} action completed`);
  };

  const handleResolveAlert = (alertId: string) => {
    setSecurityAlerts(prev =>
      prev.map(alert =>
        alert.id === alertId ? { ...alert, resolved: true } : alert
      )
    );
    message.success('Alert resolved');
  };

  return (
    <Layout style={{ minHeight: '100vh', background: LightDomColors.dark.background }}>
      {/* Admin Header */}
      <Header
        style={{
          background: LightDomColors.dark.surface,
          borderBottom: `1px solid ${LightDomColors.dark.border}`,
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <DashboardOutlined style={{ fontSize: '24px', color: LightDomColors.primary[500] }} />
          <Title level={3} style={{ margin: 0, color: LightDomColors.dark.text }}>
            Admin Dashboard
          </Title>
          <Badge count={securityAlerts.filter(a => !a.resolved).length}>
            <AlertOutlined style={{ color: LightDomColors.accent.orange }} />
          </Badge>
        </div>

        <Space>
          <Button
            type="text"
            icon={<ReloadOutlined />}
            onClick={() => window.location.reload()}
          >
            Refresh
          </Button>
          <Button
            type="text"
            icon={<ExportOutlined />}
            onClick={() => message.info('Export functionality coming soon')}
          >
            Export
          </Button>
          <Button
            type="primary"
            style={{ background: LightDomColors.gradients.primary }}
          >
            Emergency Stop
          </Button>
        </Space>
      </Header>

      <Layout>
        {/* Sidebar */}
        <Sider
          width={250}
          style={{
            background: LightDomColors.dark.surface,
            borderRight: `1px solid ${LightDomColors.dark.border}`,
          }}
        >
          <Menu
            mode="inline"
            selectedKeys={[activeTab]}
            onClick={({ key }) => setActiveTab(key)}
            style={{ background: 'transparent', border: 'none' }}
          >
            <Menu.Item key="overview" icon={<DashboardOutlined />}>
              Overview
            </Menu.Item>
            <Menu.Item key="users" icon={<UserOutlined />}>
              User Management
            </Menu.Item>
            <Menu.Item key="mining" icon={<ThunderboltOutlined />}>
              Mining Operations
            </Menu.Item>
            <Menu.Item key="security" icon={<SecurityScanOutlined />}>
              Security Center
            </Menu.Item>
            <Menu.Item key="analytics" icon={<BarChartOutlined />}>
              Analytics
            </Menu.Item>
            <Menu.Item key="settings" icon={<SettingOutlined />}>
              System Settings
            </Menu.Item>
          </Menu>
        </Sider>

        {/* Main Content */}
        <Content style={{ padding: '24px', overflow: 'auto' }}>
          <Tabs activeKey={activeTab} onChange={setActiveTab} type="card">
            {/* Overview Tab */}
            <TabPane tab="System Overview" key="overview">
              <Row gutter={[24, 24]}>
                {/* System Metrics */}
                <Col span={24}>
                  <Card
                    title="System Performance"
                    style={{
                      background: LightDomColors.dark.surface,
                      border: `1px solid ${LightDomColors.dark.border}`,
                    }}
                  >
                    <Row gutter={[16, 16]}>
                      <Col xs={24} sm={12} lg={6}>
                        <StatsCard
                          title="CPU Usage"
                          value={`${systemMetrics.cpu.toFixed(1)}%`}
                          change={systemMetrics.cpu > 30 ? 5.2 : -2.1}
                          icon={<MonitorOutlined />}
                        />
                      </Col>
                      <Col xs={24} sm={12} lg={6}>
                        <StatsCard
                          title="Memory Usage"
                          value={`${systemMetrics.memory.toFixed(1)}%`}
                          change={systemMetrics.memory > 50 ? 8.7 : -3.4}
                          icon={<DatabaseOutlined />}
                        />
                      </Col>
                      <Col xs={24} sm={12} lg={6}>
                        <StatsCard
                          title="Disk Usage"
                          value={`${systemMetrics.disk.toFixed(1)}%`}
                          change={2.3}
                          icon={<CloudOutlined />}
                        />
                      </Col>
                      <Col xs={24} sm={12} lg={6}>
                        <StatsCard
                          title="Network I/O"
                          value={`${systemMetrics.network.toFixed(1)}%`}
                          change={12.8}
                          icon={<GlobalOutlined />}
                        />
                      </Col>
                    </Row>
                  </Card>
                </Col>

                {/* Performance Chart */}
                <Col span={16}>
                  <Card
                    title="Performance Trends"
                    style={{
                      background: LightDomColors.dark.surface,
                      border: `1px solid ${LightDomColors.dark.border}`,
                    }}
                  >
                    <Area {...performanceConfig} height={300} />
                  </Card>
                </Col>

                {/* Mining Stats */}
                <Col span={8}>
                  <Card
                    title="Mining Operations"
                    style={{
                      background: LightDomColors.dark.surface,
                      border: `1px solid ${LightDomColors.dark.border}`,
                    }}
                  >
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Statistic
                        title="Hash Rate"
                        value={miningStats.hashRate}
                        suffix="MH/s"
                        valueStyle={{ color: LightDomColors.primary[500] }}
                      />
                      <Statistic
                        title="Active Miners"
                        value={miningStats.miners}
                        valueStyle={{ color: LightDomColors.accent.green }}
                      />
                      <Statistic
                        title="Blocks Mined"
                        value={miningStats.blocksMined}
                        valueStyle={{ color: LightDomColors.accent.orange }}
                      />
                      <Statistic
                        title="Total Rewards"
                        value={miningStats.rewards}
                        prefix="$"
                        valueStyle={{ color: LightDomColors.accent.purple }}
                      />
                    </Space>
                  </Card>
                </Col>

                {/* Recent Alerts */}
                <Col span={24}>
                  <Card
                    title="Recent Security Alerts"
                    style={{
                      background: LightDomColors.dark.surface,
                      border: `1px solid ${LightDomColors.dark.border}`,
                    }}
                  >
                    <List
                      dataSource={securityAlerts.slice(0, 5)}
                      renderItem={(alert) => (
                        <List.Item
                          actions={[
                            !alert.resolved && (
                              <Button
                                type="link"
                                size="small"
                                onClick={() => handleResolveAlert(alert.id)}
                              >
                                Resolve
                              </Button>
                            ),
                          ]}
                        >
                          <List.Item.Meta
                            avatar={
                              <Avatar
                                icon={
                                  alert.type === 'error' ? (
                                    <CloseCircleOutlined />
                                  ) : alert.type === 'warning' ? (
                                    <ExclamationCircleOutlined />
                                  ) : (
                                    <InfoCircleOutlined />
                                  )
                                }
                                style={{
                                  backgroundColor:
                                    alert.type === 'error'
                                      ? LightDomColors.status.error
                                      : alert.type === 'warning'
                                      ? LightDomColors.status.warning
                                      : LightDomColors.status.info,
                                }}
                              />
                            }
                            title={alert.message}
                            description={new Date(alert.timestamp).toLocaleString()}
                          />
                        </List.Item>
                      )}
                    />
                  </Card>
                </Col>
              </Row>
            </TabPane>

            {/* Users Tab */}
            <TabPane tab="User Management" key="users">
              <Row gutter={[24, 24]}>
                <Col span={24}>
                  <Card
                    title="User Management"
                    extra={
                      <Space>
                        <Search
                          placeholder="Search users..."
                          style={{ width: 200 }}
                          onSearch={(value) => console.log('Search:', value)}
                        />
                        <Button type="primary">Add User</Button>
                      </Space>
                    }
                    style={{
                      background: LightDomColors.dark.surface,
                      border: `1px solid ${LightDomColors.dark.border}`,
                    }}
                  >
                    <Table
                      columns={userColumns}
                      dataSource={users}
                      rowKey="id"
                      pagination={{ pageSize: 10 }}
                      loading={loading}
                    />
                  </Card>
                </Col>
              </Row>
            </TabPane>

            {/* Mining Tab */}
            <TabPane tab="Mining Operations" key="mining">
              <Row gutter={[24, 24]}>
                <Col span={16}>
                  <Card
                    title="Mining Performance"
                    style={{
                      background: LightDomColors.dark.surface,
                      border: `1px solid ${LightDomColors.dark.border}`,
                    }}
                  >
                    <Line {...userGrowthConfig} height={300} />
                  </Card>
                </Col>
                <Col span={8}>
                  <Card
                    title="Token Distribution"
                    style={{
                      background: LightDomColors.dark.surface,
                      border: `1px solid ${LightDomColors.dark.border}`,
                    }}
                  >
                    <Pie {...tokenDistributionConfig} height={250} />
                  </Card>
                </Col>
              </Row>
            </TabPane>

            {/* Security Tab */}
            <TabPane tab="Security Center" key="security">
              <Row gutter={[24, 24]}>
                <Col span={24}>
                  <Card
                    title="Security Alerts"
                    style={{
                      background: LightDomColors.dark.surface,
                      border: `1px solid ${LightDomColors.dark.border}`,
                    }}
                  >
                    <List
                      dataSource={securityAlerts}
                      renderItem={(alert) => (
                        <List.Item
                          actions={[
                            !alert.resolved && (
                              <Button
                                type="primary"
                                size="small"
                                onClick={() => handleResolveAlert(alert.id)}
                              >
                                Resolve
                              </Button>
                            ),
                          ]}
                        >
                          <Alert
                            message={alert.message}
                            description={new Date(alert.timestamp).toLocaleString()}
                            type={alert.type === 'error' ? 'error' : alert.type === 'warning' ? 'warning' : 'info'}
                            showIcon
                            closable={alert.resolved}
                          />
                        </List.Item>
                      )}
                    />
                  </Card>
                </Col>
              </Row>
            </TabPane>
          </Tabs>
        </Content>
      </Layout>

      {/* User Details Modal */}
      <Modal
        title="User Details"
        visible={userModalVisible}
        onCancel={() => setUserModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setUserModalVisible(false)}>
            Close
          </Button>,
          <Button key="edit" type="primary">
            Edit User
          </Button>,
        ]}
        width={800}
      >
        {selectedUser && (
          <div>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Statistic title="Name" value={selectedUser.name} />
              </Col>
              <Col span={12}>
                <Statistic title="Email" value={selectedUser.email} />
              </Col>
              <Col span={12}>
                <Statistic title="Status" value={selectedUser.status} />
              </Col>
              <Col span={12}>
                <Statistic title="Optimizations" value={selectedUser.optimizations} />
              </Col>
              <Col span={12}>
                <Statistic title="Tokens" value={selectedUser.tokens} prefix="$" />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Member Since"
                  value={new Date(selectedUser.joinDate).toLocaleDateString()}
                />
              </Col>
            </Row>
          </div>
        )}
      </Modal>
    </Layout>
  );
};

export default AdminDashboard;
