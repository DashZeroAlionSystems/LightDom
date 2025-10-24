/**
 * Admin Overview Dashboard
 * Comprehensive admin dashboard with user management and system metrics
 */

import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Space,
  Typography,
  Button,
  Table,
  Tag,
  Avatar,
  Progress,
  Badge,
  Tooltip,
  Tabs,
  List,
  Timeline,
  Alert
} from 'antd';
import {
  UserOutlined,
  TeamOutlined,
  RiseOutlined,
  FallOutlined,
  ClockCircleOutlined,
  SafetyOutlined,
  DatabaseOutlined,
  ApiOutlined,
  SettingOutlined,
  DashboardOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  InfoCircleOutlined,
  TrophyOutlined,
  DollarOutlined,
  GlobalOutlined,
  BellOutlined,
  BarChartOutlined,
  LineChartOutlined
} from '@ant-design/icons';
import { Line, Column, Pie } from '@ant-design/plots';
import { useNavigate } from 'react-router-dom';
import './AdminStyles.css';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

interface UserStats {
  totalUsers: number;
  activeUsers: number;
  newUsersThisMonth: number;
  suspendedUsers: number;
  adminUsers: number;
  moderatorUsers: number;
  regularUsers: number;
  userGrowthRate: number;
}

interface SystemMetric {
  name: string;
  value: number;
  status: 'healthy' | 'warning' | 'critical';
  icon: React.ReactNode;
}

interface RecentActivity {
  id: string;
  user: string;
  action: string;
  timestamp: Date;
  type: 'success' | 'warning' | 'error' | 'info';
}

const AdminOverview: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Mock data - In production, fetch from API
  const [userStats] = useState<UserStats>({
    totalUsers: 1247,
    activeUsers: 892,
    newUsersThisMonth: 156,
    suspendedUsers: 12,
    adminUsers: 5,
    moderatorUsers: 18,
    regularUsers: 1224,
    userGrowthRate: 12.5
  });

  const [systemMetrics] = useState<SystemMetric[]>([
    { name: 'CPU Usage', value: 45, status: 'healthy', icon: <DashboardOutlined /> },
    { name: 'Memory', value: 68, status: 'warning', icon: <DatabaseOutlined /> },
    { name: 'API Health', value: 99, status: 'healthy', icon: <ApiOutlined /> },
    { name: 'Response Time', value: 85, status: 'healthy', icon: <ClockCircleOutlined /> }
  ]);

  const [recentActivities] = useState<RecentActivity[]>([
    { id: '1', user: 'John Doe', action: 'Logged in', timestamp: new Date(), type: 'success' },
    { id: '2', user: 'Jane Smith', action: 'Updated profile', timestamp: new Date(Date.now() - 300000), type: 'info' },
    { id: '3', user: 'Bob Wilson', action: 'Failed login attempt', timestamp: new Date(Date.now() - 600000), type: 'warning' },
    { id: '4', user: 'Alice Brown', action: 'Created new account', timestamp: new Date(Date.now() - 900000), type: 'success' },
    { id: '5', user: 'Charlie Davis', action: 'Suspended account', timestamp: new Date(Date.now() - 1200000), type: 'error' }
  ]);

  // User growth data for chart
  const userGrowthData = [
    { month: 'Jan', users: 850 },
    { month: 'Feb', users: 920 },
    { month: 'Mar', users: 980 },
    { month: 'Apr', users: 1050 },
    { month: 'May', users: 1120 },
    { month: 'Jun', users: 1247 }
  ];

  // Role distribution data
  const roleDistributionData = [
    { type: 'Regular Users', value: userStats.regularUsers },
    { type: 'Moderators', value: userStats.moderatorUsers },
    { type: 'Admins', value: userStats.adminUsers }
  ];

  // Active vs Inactive users
  const userStatusData = [
    { type: 'Active', value: userStats.activeUsers },
    { type: 'Inactive', value: userStats.totalUsers - userStats.activeUsers - userStats.suspendedUsers },
    { type: 'Suspended', value: userStats.suspendedUsers }
  ];

  const getMetricStatus = (status: string) => {
    switch (status) {
      case 'healthy': return { color: '#52c41a', icon: <CheckCircleOutlined /> };
      case 'warning': return { color: '#faad14', icon: <WarningOutlined /> };
      case 'critical': return { color: '#f5222d', icon: <WarningOutlined /> };
      default: return { color: '#d9d9d9', icon: <InfoCircleOutlined /> };
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'warning': return <WarningOutlined style={{ color: '#faad14' }} />;
      case 'error': return <WarningOutlined style={{ color: '#f5222d' }} />;
      default: return <InfoCircleOutlined style={{ color: '#1890ff' }} />;
    }
  };

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>
          <DashboardOutlined /> Admin Dashboard
        </Title>
        <Paragraph type="secondary">
          Manage your users, monitor system health, and configure platform settings
        </Paragraph>
      </div>

      {/* Quick Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} md={6}>
          <Card hoverable>
            <Statistic
              title="Total Users"
              value={userStats.totalUsers}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
            <div style={{ marginTop: '8px' }}>
              <Tag color="blue">All Time</Tag>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card hoverable>
            <Statistic
              title="Active Users"
              value={userStats.activeUsers}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
            <div style={{ marginTop: '8px' }}>
              <Tag color="success">
                {((userStats.activeUsers / userStats.totalUsers) * 100).toFixed(1)}% Active
              </Tag>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card hoverable>
            <Statistic
              title="New This Month"
              value={userStats.newUsersThisMonth}
              prefix={<RiseOutlined />}
              valueStyle={{ color: '#13c2c2' }}
            />
            <div style={{ marginTop: '8px' }}>
              <Tag color="cyan" icon={userStats.userGrowthRate >= 0 ? <RiseOutlined /> : <FallOutlined />}>
                {userStats.userGrowthRate >= 0 ? '+' : ''}{userStats.userGrowthRate}% Growth
              </Tag>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card hoverable>
            <Statistic
              title="Suspended"
              value={userStats.suspendedUsers}
              prefix={<WarningOutlined />}
              valueStyle={{ color: '#f5222d' }}
            />
            <div style={{ marginTop: '8px' }}>
              <Tag color="error">Action Required</Tag>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Charts Row */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <LineChartOutlined />
                <span>User Growth Trend</span>
              </Space>
            }
          >
            <Line
              data={userGrowthData}
              xField="month"
              yField="users"
              smooth
              color="#1890ff"
              point={{
                size: 5,
                shape: 'circle'
              }}
              height={250}
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <BarChartOutlined />
                <span>User Status Distribution</span>
              </Space>
            }
          >
            <Column
              data={userStatusData}
              xField="type"
              yField="value"
              colorField="type"
              color={({ type }) => {
                if (type === 'Active') return '#52c41a';
                if (type === 'Inactive') return '#d9d9d9';
                return '#f5222d';
              }}
              height={250}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        {/* Role Distribution */}
        <Col xs={24} lg={8}>
          <Card
            title={
              <Space>
                <SafetyOutlined />
                <span>Role Distribution</span>
              </Space>
            }
          >
            <Pie
              data={roleDistributionData}
              angleField="value"
              colorField="type"
              radius={0.8}
              label={{
                type: 'outer',
                content: '{name} {percentage}'
              }}
              height={250}
            />
            <div style={{ marginTop: '16px' }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text>Admins:</Text>
                  <Tag color="red">{userStats.adminUsers}</Tag>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text>Moderators:</Text>
                  <Tag color="orange">{userStats.moderatorUsers}</Tag>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text>Users:</Text>
                  <Tag color="blue">{userStats.regularUsers}</Tag>
                </div>
              </Space>
            </div>
          </Card>
        </Col>

        {/* System Health */}
        <Col xs={24} lg={8}>
          <Card
            title={
              <Space>
                <DashboardOutlined />
                <span>System Health</span>
              </Space>
            }
          >
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              {systemMetrics.map((metric, index) => {
                const status = getMetricStatus(metric.status);
                return (
                  <div key={index}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <Space>
                        {metric.icon}
                        <Text>{metric.name}</Text>
                      </Space>
                      <Space>
                        {status.icon}
                        <Text strong>{metric.value}%</Text>
                      </Space>
                    </div>
                    <Progress
                      percent={metric.value}
                      strokeColor={status.color}
                      showInfo={false}
                      size="small"
                    />
                  </div>
                );
              })}
            </Space>
            <Button
              type="link"
              block
              style={{ marginTop: '16px' }}
              onClick={() => navigate('/dashboard/admin/monitoring')}
            >
              View Detailed Metrics
            </Button>
          </Card>
        </Col>

        {/* Recent Activity */}
        <Col xs={24} lg={8}>
          <Card
            title={
              <Space>
                <ClockCircleOutlined />
                <span>Recent Activity</span>
              </Space>
            }
            extra={
              <Badge count={recentActivities.length} showZero style={{ backgroundColor: '#52c41a' }} />
            }
          >
            <List
              dataSource={recentActivities}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar icon={getActivityIcon(item.type)} />}
                    title={
                      <Space>
                        <Text strong>{item.user}</Text>
                        <Text type="secondary">•</Text>
                        <Text>{item.action}</Text>
                      </Space>
                    }
                    description={
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        {item.timestamp.toLocaleTimeString()}
                      </Text>
                    }
                  />
                </List.Item>
              )}
            />
            <Button
              type="link"
              block
              style={{ marginTop: '8px' }}
              onClick={() => navigate('/dashboard/admin/logs')}
            >
              View All Logs
            </Button>
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Card
        title={
          <Space>
            <SettingOutlined />
            <span>Quick Actions</span>
          </Space>
        }
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Button
              type="primary"
              size="large"
              icon={<UserOutlined />}
              block
              onClick={() => navigate('/dashboard/admin/users')}
            >
              Manage Users
            </Button>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Button
              size="large"
              icon={<SettingOutlined />}
              block
              onClick={() => navigate('/dashboard/admin/settings')}
            >
              System Settings
            </Button>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Button
              size="large"
              icon={<DashboardOutlined />}
              block
              onClick={() => navigate('/dashboard/admin/monitoring')}
            >
              System Monitoring
            </Button>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Button
              size="large"
              icon={<DollarOutlined />}
              block
              onClick={() => navigate('/dashboard/admin/billing')}
            >
              Billing & Payments
            </Button>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default AdminOverview;
