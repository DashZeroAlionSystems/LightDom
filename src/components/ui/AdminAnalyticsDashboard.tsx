/**
 * Admin Analytics Dashboard - Comprehensive overview of system, clients, mining, and billing
 * Provides drill-down capabilities for detailed client analysis
 */

import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Tabs,
  Progress,
  Tag,
  Button,
  Input,
  Select,
  Space,
  Alert,
  Badge,
  Drawer,
  Timeline,
  Descriptions,
  Typography,
  Spin,
  Empty,
  Modal,
  message
} from 'antd';
import {
  DollarOutlined,
  UserOutlined,
  RocketOutlined,
  ThunderboltOutlined,
  TrophyOutlined,
  AlertOutlined,
  BarChartOutlined,
  LineChartOutlined,
  PieChartOutlined,
  EyeOutlined,
  ReloadOutlined,
  DownloadOutlined,
  FilterOutlined,
  SearchOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  FireOutlined,
  CrownOutlined,
  StarOutlined,
  RiseOutlined,
  FallOutlined
} from '@ant-design/icons';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import './AdminAnalyticsDashboard.css';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

// Color constants
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

interface SystemOverview {
  totalClients: number;
  activeClients: number;
  suspendedClients: number;
  trialClients: number;
  totalRevenue: number;
  monthlyRecurringRevenue: number;
  totalMiningScore: number;
  totalAlgorithmsDiscovered: number;
  totalOptimizations: number;
  totalTokensMinted: number;
  systemHealth: {
    uptime: number;
    cpuUsage: number;
    memoryUsage: number;
    diskUsage: number;
    apiResponseTime: number;
    errorRate: number;
  };
}

interface ClientMetrics {
  clientId: string;
  clientName: string;
  planName: string;
  status: string;
  usage: {
    requestsThisMonth: number;
    requestsLimit: number;
    requestsPercentage: number;
    storageUsedGB: number;
    storageLimit: number;
    storagePercentage: number;
    apiCallsToday: number;
    optimizationTasksCompleted: number;
  };
  mining: {
    totalMiningScore: number;
    algorithmsDiscovered: number;
    elementsCollected: number;
    combinationsCompleted: number;
    totalTokensEarned: number;
  };
  gamification: {
    level: number;
    experiencePoints: number;
    achievementsUnlocked: number;
    questsCompleted: number;
    currentStreak: number;
    rank: string;
  };
  billing: {
    totalCharges: number;
    paymentStatus: string;
  };
  lastActive: number;
}

const AdminAnalyticsDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [overview, setOverview] = useState<SystemOverview | null>(null);
  const [clients, setClients] = useState<ClientMetrics[]>([]);
  const [miningStats, setMiningStats] = useState<any>(null);
  const [billingAnalytics, setBillingAnalytics] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState<ClientMetrics | null>(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [clientActivity, setClientActivity] = useState<any>(null);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadAllData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      loadAllData(true);
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const loadAllData = async (silent = false) => {
    if (!silent) setLoading(true);
    setRefreshing(true);

    try {
      const adminAddress = localStorage.getItem('adminAddress') || '0x1234567890123456789012345678901234567890';
      const headers = { 'x-admin-address': adminAddress };

      // Load all data in parallel
      const [overviewRes, clientsRes, miningRes, billingRes, alertsRes] = await Promise.all([
        fetch('/api/admin/analytics/overview', { headers }),
        fetch('/api/admin/analytics/clients', { headers }),
        fetch('/api/admin/analytics/mining', { headers }),
        fetch('/api/admin/analytics/billing', { headers }),
        fetch('/api/admin/analytics/alerts', { headers })
      ]);

      const overviewData = await overviewRes.json();
      const clientsData = await clientsRes.json();
      const miningData = await miningRes.json();
      const billingData = await billingRes.json();
      const alertsData = await alertsRes.json();

      if (overviewData.success) setOverview(overviewData.data);
      if (clientsData.success) setClients(clientsData.data);
      if (miningData.success) setMiningStats(miningData.data);
      if (billingData.success) setBillingAnalytics(billingData.data);
      if (alertsData.success) setAlerts(alertsData.data.alerts);

    } catch (error) {
      console.error('Error loading admin analytics:', error);
      message.error('Failed to load analytics data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadClientActivity = async (clientId: string) => {
    try {
      const adminAddress = localStorage.getItem('adminAddress') || '0x1234567890123456789012345678901234567890';
      const response = await fetch(`/api/admin/analytics/client/${clientId}/activity`, {
        headers: { 'x-admin-address': adminAddress }
      });
      const data = await response.json();
      if (data.success) {
        setClientActivity(data.data);
      }
    } catch (error) {
      console.error('Error loading client activity:', error);
      message.error('Failed to load client activity');
    }
  };

  const handleClientClick = (client: ClientMetrics) => {
    setSelectedClient(client);
    setDrawerVisible(true);
    loadClientActivity(client.clientId);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: 'success',
      trial: 'processing',
      suspended: 'warning',
      cancelled: 'error'
    };
    return colors[status] || 'default';
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.clientName.toLowerCase().includes(searchText.toLowerCase()) ||
                         client.clientId.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = statusFilter === 'all' || client.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const clientColumns = [
    {
      title: 'Client',
      dataIndex: 'clientName',
      key: 'clientName',
      render: (text: string, record: ClientMetrics) => (
        <Space direction="vertical" size={0}>
          <Text strong>{text}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>{record.clientId.slice(0, 16)}...</Text>
        </Space>
      ),
      sorter: (a: ClientMetrics, b: ClientMetrics) => a.clientName.localeCompare(b.clientName)
    },
    {
      title: 'Plan',
      dataIndex: 'planName',
      key: 'planName',
      render: (text: string) => <Tag color="blue">{text}</Tag>
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{status.toUpperCase()}</Tag>
      ),
      filters: [
        { text: 'Active', value: 'active' },
        { text: 'Trial', value: 'trial' },
        { text: 'Suspended', value: 'suspended' },
        { text: 'Cancelled', value: 'cancelled' }
      ],
      onFilter: (value: any, record: ClientMetrics) => record.status === value
    },
    {
      title: 'Usage',
      key: 'usage',
      render: (_, record: ClientMetrics) => (
        <Space direction="vertical" size={0} style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontSize: 12 }}>Requests</Text>
            <Text style={{ fontSize: 12 }}>{record.usage.requestsPercentage.toFixed(1)}%</Text>
          </div>
          <Progress 
            percent={record.usage.requestsPercentage} 
            size="small" 
            status={record.usage.requestsPercentage > 90 ? 'exception' : 'normal'}
            showInfo={false}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
            <Text style={{ fontSize: 12 }}>Storage</Text>
            <Text style={{ fontSize: 12 }}>{record.usage.storagePercentage.toFixed(1)}%</Text>
          </div>
          <Progress 
            percent={record.usage.storagePercentage} 
            size="small"
            status={record.usage.storagePercentage > 90 ? 'exception' : 'normal'}
            showInfo={false}
          />
        </Space>
      ),
      width: 150
    },
    {
      title: 'Mining Score',
      dataIndex: ['mining', 'totalMiningScore'],
      key: 'miningScore',
      render: (score: number) => (
        <Statistic value={score} precision={0} valueStyle={{ fontSize: 14 }} />
      ),
      sorter: (a: ClientMetrics, b: ClientMetrics) => a.mining.totalMiningScore - b.mining.totalMiningScore
    },
    {
      title: 'Revenue',
      dataIndex: ['billing', 'totalCharges'],
      key: 'revenue',
      render: (amount: number) => formatCurrency(amount),
      sorter: (a: ClientMetrics, b: ClientMetrics) => a.billing.totalCharges - b.billing.totalCharges
    },
    {
      title: 'Last Active',
      dataIndex: 'lastActive',
      key: 'lastActive',
      render: (timestamp: number) => {
        const hoursAgo = Math.floor((Date.now() - timestamp) / 3600000);
        return <Text type="secondary">{hoursAgo}h ago</Text>;
      },
      sorter: (a: ClientMetrics, b: ClientMetrics) => b.lastActive - a.lastActive
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record: ClientMetrics) => (
        <Button 
          type="link" 
          icon={<EyeOutlined />}
          onClick={() => handleClientClick(record)}
        >
          View Details
        </Button>
      )
    }
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" tip="Loading analytics data..." />
      </div>
    );
  }

  if (!overview) {
    return (
      <div style={{ padding: 24 }}>
        <Empty description="No data available" />
      </div>
    );
  }

  return (
    <div className="admin-analytics-dashboard" style={{ padding: 24, background: '#f0f2f5', minHeight: '100vh' }}>
      {/* Header */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={2} style={{ margin: 0 }}>
            <BarChartOutlined /> Admin Analytics Dashboard
          </Title>
          <Text type="secondary">Real-time system monitoring and client analytics</Text>
        </Col>
        <Col>
          <Space>
            <Button 
              icon={<ReloadOutlined spin={refreshing} />}
              onClick={() => loadAllData()}
              disabled={refreshing}
            >
              Refresh
            </Button>
            <Button icon={<DownloadOutlined />}>
              Export Report
            </Button>
          </Space>
        </Col>
      </Row>

      {/* Alerts */}
      {alerts.length > 0 && (
        <Alert
          message={`${alerts.length} System Alerts`}
          description={
            <Space direction="vertical">
              {alerts.slice(0, 3).map((alert, index) => (
                <Text key={index}>
                  <Tag color={alert.severity === 'critical' ? 'red' : 'orange'}>
                    {alert.severity.toUpperCase()}
                  </Tag>
                  {alert.message}
                </Text>
              ))}
              {alerts.length > 3 && <Text type="secondary">and {alerts.length - 3} more...</Text>}
            </Space>
          }
          type="warning"
          showIcon
          icon={<AlertOutlined />}
          closable
          style={{ marginBottom: 24 }}
        />
      )}

      <Tabs activeKey={activeTab} onChange={setActiveTab} size="large">
        {/* Overview Tab */}
        <TabPane tab={<span><BarChartOutlined /> Overview</span>} key="overview">
          {/* Key Metrics */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Total Clients"
                  value={overview.totalClients}
                  prefix={<UserOutlined />}
                  suffix={
                    <Tag color="success">
                      {overview.activeClients} active
                    </Tag>
                  }
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Total Revenue"
                  value={overview.totalRevenue}
                  precision={2}
                  prefix={<DollarOutlined />}
                  valueStyle={{ color: '#3f8600' }}
                  suffix={
                    <Text type="secondary" style={{ fontSize: 14 }}>
                      /{formatCurrency(overview.monthlyRecurringRevenue)} MRR
                    </Text>
                  }
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Mining Score"
                  value={overview.totalMiningScore}
                  precision={0}
                  prefix={<RocketOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                  suffix={
                    <Text type="secondary" style={{ fontSize: 14 }}>
                      {overview.totalAlgorithmsDiscovered} algorithms
                    </Text>
                  }
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Tokens Minted"
                  value={overview.totalTokensMinted}
                  precision={0}
                  prefix={<TrophyOutlined />}
                  valueStyle={{ color: '#faad14' }}
                />
              </Card>
            </Col>
          </Row>

          {/* System Health */}
          <Card title="System Health" style={{ marginBottom: 24 }}>
            <Row gutter={[16, 16]}>
              <Col xs={24} md={8}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Text>CPU Usage</Text>
                  <Progress 
                    percent={overview.systemHealth.cpuUsage} 
                    status={overview.systemHealth.cpuUsage > 80 ? 'exception' : 'normal'}
                  />
                </Space>
              </Col>
              <Col xs={24} md={8}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Text>Memory Usage</Text>
                  <Progress 
                    percent={overview.systemHealth.memoryUsage} 
                    status={overview.systemHealth.memoryUsage > 80 ? 'exception' : 'normal'}
                  />
                </Space>
              </Col>
              <Col xs={24} md={8}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Text>Uptime: {formatUptime(overview.systemHealth.uptime)}</Text>
                  <Text type="secondary">API Response: {overview.systemHealth.apiResponseTime}ms</Text>
                  <Text type="secondary">Error Rate: {overview.systemHealth.errorRate}%</Text>
                </Space>
              </Col>
            </Row>
          </Card>

          {/* Quick Stats */}
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Card title="Client Distribution">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Active', value: overview.activeClients },
                        { name: 'Trial', value: overview.trialClients },
                        { name: 'Suspended', value: overview.suspendedClients }
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {[0, 1, 2].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card title="Optimizations Overview">
                <Statistic
                  title="Total Optimizations"
                  value={overview.totalOptimizations}
                  suffix="tasks"
                  style={{ marginBottom: 16 }}
                />
                <Statistic
                  title="Algorithms Discovered"
                  value={overview.totalAlgorithmsDiscovered}
                  suffix="algorithms"
                />
              </Card>
            </Col>
          </Row>
        </TabPane>

        {/* Clients Tab */}
        <TabPane tab={<span><UserOutlined /> Clients ({clients.length})</span>} key="clients">
          <Card>
            <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}>
              <Space>
                <Input
                  placeholder="Search clients..."
                  prefix={<SearchOutlined />}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  style={{ width: 300 }}
                />
                <Select
                  value={statusFilter}
                  onChange={setStatusFilter}
                  style={{ width: 150 }}
                  placeholder="Filter by status"
                >
                  <Option value="all">All Status</Option>
                  <Option value="active">Active</Option>
                  <Option value="trial">Trial</Option>
                  <Option value="suspended">Suspended</Option>
                  <Option value="cancelled">Cancelled</Option>
                </Select>
              </Space>
              <Text type="secondary">
                Showing {filteredClients.length} of {clients.length} clients
              </Text>
            </Space>

            <Table
              columns={clientColumns}
              dataSource={filteredClients}
              rowKey="clientId"
              pagination={{ pageSize: 10 }}
              scroll={{ x: 1200 }}
            />
          </Card>
        </TabPane>

        {/* Mining Tab */}
        <TabPane tab={<span><RocketOutlined /> Mining Statistics</span>} key="mining">
          {miningStats && (
            <>
              {/* Overall Mining Stats */}
              <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12} md={6}>
                  <Card>
                    <Statistic
                      title="Total Operations"
                      value={miningStats.overall.totalMiningOperations}
                      prefix={<ThunderboltOutlined />}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Card>
                    <Statistic
                      title="Algorithms"
                      value={miningStats.overall.totalAlgorithmsDiscovered}
                      prefix={<FireOutlined />}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Card>
                    <Statistic
                      title="Avg Score"
                      value={miningStats.overall.averageMiningScore}
                      precision={1}
                      prefix={<StarOutlined />}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Card>
                    <Statistic
                      title="Tokens Earned"
                      value={miningStats.overall.totalTokensEarned}
                      prefix={<CrownOutlined />}
                    />
                  </Card>
                </Col>
              </Row>

              {/* Top Performers */}
              <Card title="Top Performing Clients" style={{ marginBottom: 24 }}>
                <Table
                  dataSource={miningStats.byClient.slice(0, 10)}
                  pagination={false}
                  rowKey="clientId"
                  columns={[
                    {
                      title: 'Rank',
                      key: 'rank',
                      render: (_, __, index) => (
                        <Badge 
                          count={index + 1} 
                          style={{ backgroundColor: index < 3 ? '#faad14' : '#1890ff' }}
                        />
                      ),
                      width: 80
                    },
                    {
                      title: 'Client',
                      dataIndex: 'clientName',
                      key: 'clientName'
                    },
                    {
                      title: 'Mining Score',
                      dataIndex: 'miningScore',
                      key: 'miningScore',
                      render: (score: number) => (
                        <Statistic value={score} precision={0} valueStyle={{ fontSize: 14 }} />
                      )
                    },
                    {
                      title: 'Algorithms',
                      dataIndex: 'algorithmsDiscovered',
                      key: 'algorithmsDiscovered'
                    },
                    {
                      title: 'Tokens',
                      dataIndex: 'tokensEarned',
                      key: 'tokensEarned',
                      render: (tokens: number) => (
                        <Tag color="gold">{tokens.toLocaleString()}</Tag>
                      )
                    }
                  ]}
                />
              </Card>

              {/* Biome Statistics */}
              <Card title="Mining by Biome Type">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={miningStats.byBiome}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="biomeType" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="totalOperations" fill="#8884d8" name="Operations" />
                    <Bar dataKey="totalRewards" fill="#82ca9d" name="Rewards" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </>
          )}
        </TabPane>

        {/* Billing Tab */}
        <TabPane tab={<span><DollarOutlined /> Billing Analytics</span>} key="billing">
          {billingAnalytics && (
            <>
              {/* Revenue Metrics */}
              <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12} md={6}>
                  <Card>
                    <Statistic
                      title="Total Revenue"
                      value={billingAnalytics.revenue.total}
                      precision={2}
                      prefix="$"
                      valueStyle={{ color: '#3f8600' }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Card>
                    <Statistic
                      title="This Month"
                      value={billingAnalytics.revenue.thisMonth}
                      precision={2}
                      prefix="$"
                      suffix={
                        <Tag color={billingAnalytics.revenue.growthRate > 0 ? 'success' : 'error'}>
                          {billingAnalytics.revenue.growthRate > 0 ? <RiseOutlined /> : <FallOutlined />}
                          {Math.abs(billingAnalytics.revenue.growthRate).toFixed(1)}%
                        </Tag>
                      }
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Card>
                    <Statistic
                      title="Active Subscriptions"
                      value={billingAnalytics.subscriptions.active}
                      suffix={`/ ${billingAnalytics.subscriptions.active + billingAnalytics.subscriptions.trial}`}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Card>
                    <Statistic
                      title="Churn Rate"
                      value={billingAnalytics.subscriptions.churnRate}
                      precision={1}
                      suffix="%"
                      valueStyle={{ color: billingAnalytics.subscriptions.churnRate > 5 ? '#cf1322' : '#3f8600' }}
                    />
                  </Card>
                </Col>
              </Row>

              {/* Revenue Trends */}
              <Card title="Revenue Trends (Last 30 Days)" style={{ marginBottom: 24 }}>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={billingAnalytics.trends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="revenue" stroke="#8884d8" fill="#8884d8" name="Revenue" />
                    <Area type="monotone" dataKey="activeClients" stroke="#82ca9d" fill="#82ca9d" name="Active Clients" />
                  </AreaChart>
                </ResponsiveContainer>
              </Card>

              {/* Plan Distribution */}
              <Card title="Revenue by Plan">
                <Table
                  dataSource={billingAnalytics.plans}
                  pagination={false}
                  rowKey="planId"
                  columns={[
                    {
                      title: 'Plan',
                      dataIndex: 'planName',
                      key: 'planName',
                      render: (name: string) => <Tag color="blue">{name}</Tag>
                    },
                    {
                      title: 'Subscribers',
                      dataIndex: 'subscriberCount',
                      key: 'subscriberCount'
                    },
                    {
                      title: 'Total Revenue',
                      dataIndex: 'revenue',
                      key: 'revenue',
                      render: (amount: number) => formatCurrency(amount)
                    },
                    {
                      title: 'Avg Revenue',
                      dataIndex: 'averageRevenue',
                      key: 'averageRevenue',
                      render: (amount: number) => formatCurrency(amount)
                    }
                  ]}
                />
              </Card>
            </>
          )}
        </TabPane>
      </Tabs>

      {/* Client Detail Drawer */}
      <Drawer
        title="Client Details"
        width={720}
        open={drawerVisible}
        onClose={() => {
          setDrawerVisible(false);
          setSelectedClient(null);
          setClientActivity(null);
        }}
        extra={
          <Space>
            <Button icon={<ReloadOutlined />} onClick={() => selectedClient && loadClientActivity(selectedClient.clientId)}>
              Refresh
            </Button>
          </Space>
        }
      >
        {selectedClient && (
          <>
            <Descriptions title="Client Information" bordered column={2}>
              <Descriptions.Item label="Client Name">{selectedClient.clientName}</Descriptions.Item>
              <Descriptions.Item label="Client ID">{selectedClient.clientId}</Descriptions.Item>
              <Descriptions.Item label="Plan">{selectedClient.planName}</Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={getStatusColor(selectedClient.status)}>{selectedClient.status.toUpperCase()}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Total Charges">
                {formatCurrency(selectedClient.billing.totalCharges)}
              </Descriptions.Item>
              <Descriptions.Item label="Payment Status">
                <Tag color={selectedClient.billing.paymentStatus === 'paid' ? 'success' : 'warning'}>
                  {selectedClient.billing.paymentStatus.toUpperCase()}
                </Tag>
              </Descriptions.Item>
            </Descriptions>

            <Card title="Usage Statistics" style={{ marginTop: 16 }}>
              <Descriptions column={2}>
                <Descriptions.Item label="Requests">
                  {selectedClient.usage.requestsThisMonth} / {selectedClient.usage.requestsLimit}
                </Descriptions.Item>
                <Descriptions.Item label="Storage">
                  {selectedClient.usage.storageUsedGB.toFixed(2)} / {selectedClient.usage.storageLimit} GB
                </Descriptions.Item>
                <Descriptions.Item label="API Calls Today">
                  {selectedClient.usage.apiCallsToday}
                </Descriptions.Item>
                <Descriptions.Item label="Optimizations">
                  {selectedClient.usage.optimizationTasksCompleted}
                </Descriptions.Item>
              </Descriptions>
              <div style={{ marginTop: 16 }}>
                <Text>Request Usage</Text>
                <Progress percent={selectedClient.usage.requestsPercentage} />
                <Text>Storage Usage</Text>
                <Progress percent={selectedClient.usage.storagePercentage} />
              </div>
            </Card>

            <Card title="Mining Performance" style={{ marginTop: 16 }}>
              <Row gutter={16}>
                <Col span={12}>
                  <Statistic
                    title="Mining Score"
                    value={selectedClient.mining.totalMiningScore}
                    prefix={<RocketOutlined />}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Tokens Earned"
                    value={selectedClient.mining.totalTokensEarned}
                    prefix={<CrownOutlined />}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Algorithms"
                    value={selectedClient.mining.algorithmsDiscovered}
                    prefix={<FireOutlined />}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Combinations"
                    value={selectedClient.mining.combinationsCompleted}
                    prefix={<ThunderboltOutlined />}
                  />
                </Col>
              </Row>
            </Card>

            <Card title="Gamification" style={{ marginTop: 16 }}>
              <Descriptions column={2}>
                <Descriptions.Item label="Level">{selectedClient.gamification.level}</Descriptions.Item>
                <Descriptions.Item label="Rank">
                  <Tag color="purple">{selectedClient.gamification.rank}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Achievements">{selectedClient.gamification.achievementsUnlocked}</Descriptions.Item>
                <Descriptions.Item label="Quests">{selectedClient.gamification.questsCompleted}</Descriptions.Item>
                <Descriptions.Item label="Current Streak">
                  {selectedClient.gamification.currentStreak} days
                </Descriptions.Item>
                <Descriptions.Item label="XP">{selectedClient.gamification.experiencePoints.toLocaleString()}</Descriptions.Item>
              </Descriptions>
            </Card>

            {clientActivity && (
              <Card title="Recent Activity" style={{ marginTop: 16 }}>
                <Timeline>
                  {clientActivity.activities.slice(0, 10).map((activity: any, index: number) => (
                    <Timeline.Item 
                      key={index}
                      color={activity.metadata.success ? 'green' : 'red'}
                    >
                      <Space direction="vertical" size={0}>
                        <Text strong>{activity.description}</Text>
                        <Text type="secondary">{formatDate(activity.timestamp)}</Text>
                      </Space>
                    </Timeline.Item>
                  ))}
                </Timeline>
              </Card>
            )}
          </>
        )}
      </Drawer>
    </div>
  );
};

export default AdminAnalyticsDashboard;
