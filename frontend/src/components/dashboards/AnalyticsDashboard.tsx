import React, { useState, useEffect } from 'react';
import { Card, Tabs, Table, Statistic, Row, Col, Space, Tag, Button, DatePicker, Select, message } from 'antd';
import { BarChartOutlined, LineChartOutlined, DashboardOutlined, UserOutlined, LinkOutlined, RocketOutlined } from '@ant-design/icons';
import { analyticsAPI } from '../../services/apiService';

const { TabPane } = Tabs;
const { RangePicker } = DatePicker;
const { Option } = Select;

const AnalyticsDashboard: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<any>(null);
  const [realTime, setRealTime] = useState<any>(null);
  const [bridges, setBridges] = useState<any[]>([]);
  const [bridgeComparison, setBridgeComparison] = useState<any[]>([]);
  const [spaceMining, setSpaceMining] = useState<any>(null);
  const [userEngagement, setUserEngagement] = useState<any>(null);
  const [selectedBridge, setSelectedBridge] = useState<string>('all');
  const [dateRange, setDateRange] = useState<any>(null);

  useEffect(() => {
    loadSummary();
    loadRealTime();
    loadBridges();
    loadSpaceMining();
    loadUserEngagement();
    
    // Auto-refresh real-time data
    const interval = setInterval(() => {
      loadRealTime();
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);

  const loadSummary = async () => {
    try {
      setLoading(true);
      const data = await analyticsAPI.getSummary();
      setSummary(data);
    } catch (error: any) {
      message.error(error.message || 'Failed to load summary');
    } finally {
      setLoading(false);
    }
  };

  const loadRealTime = async () => {
    try {
      const data = await analyticsAPI.getRealTime();
      setRealTime(data);
    } catch (error: any) {
      console.error('Failed to load real-time data:', error);
    }
  };

  const loadBridges = async () => {
    try {
      const data = await analyticsAPI.getBridges();
      setBridges(data);
      
      // Load comparison if we have bridges
      if (data.length > 0) {
        const bridgeIds = data.map((b: any) => b.id).slice(0, 5);
        const comparison = await analyticsAPI.getBridgeComparison(bridgeIds);
        setBridgeComparison(comparison);
      }
    } catch (error: any) {
      message.error(error.message || 'Failed to load bridges');
    }
  };

  const loadSpaceMining = async () => {
    try {
      const data = await analyticsAPI.getSpaceMining();
      setSpaceMining(data);
    } catch (error: any) {
      message.error(error.message || 'Failed to load space mining data');
    }
  };

  const loadUserEngagement = async () => {
    try {
      const data = await analyticsAPI.getUserEngagement();
      setUserEngagement(data);
    } catch (error: any) {
      message.error(error.message || 'Failed to load user engagement');
    }
  };

  const bridgeColumns = [
    {
      title: 'Bridge ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'default'}>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Connected Users',
      dataIndex: 'connectedUsers',
      key: 'connectedUsers',
    },
    {
      title: 'Total Messages',
      dataIndex: 'totalMessages',
      key: 'totalMessages',
    },
    {
      title: 'Avg Response Time',
      dataIndex: 'avgResponseTime',
      key: 'avgResponseTime',
      render: (time: number) => `${time}ms`,
    },
  ];

  const bridgeComparisonColumns = [
    {
      title: 'Bridge',
      dataIndex: 'bridgeName',
      key: 'bridgeName',
    },
    {
      title: 'Users',
      dataIndex: 'users',
      key: 'users',
    },
    {
      title: 'Messages',
      dataIndex: 'messages',
      key: 'messages',
    },
    {
      title: 'Engagement Rate',
      dataIndex: 'engagementRate',
      key: 'engagementRate',
      render: (rate: number) => `${(rate * 100).toFixed(1)}%`,
    },
    {
      title: 'Avg Session',
      dataIndex: 'avgSessionDuration',
      key: 'avgSessionDuration',
      render: (duration: number) => `${Math.round(duration / 60)}m`,
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <h1><BarChartOutlined /> Analytics Dashboard</h1>
      <p>Real-time analytics, bridge monitoring, space mining metrics, and user engagement tracking</p>

      <Tabs defaultActiveKey="overview">
        <TabPane 
          tab={<span><DashboardOutlined /> Overview</span>} 
          key="overview"
        >
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Card title="Key Metrics" loading={loading}>
              <Row gutter={16}>
                <Col span={6}>
                  <Statistic
                    title="Total Users"
                    value={summary?.totalUsers || 0}
                    prefix={<UserOutlined />}
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="Active Sessions"
                    value={realTime?.activeSessions || 0}
                    valueStyle={{ color: '#3f8600' }}
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="Total Bridges"
                    value={summary?.totalBridges || 0}
                    prefix={<LinkOutlined />}
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="Space Mined"
                    value={summary?.totalSpaceMined || 0}
                    suffix="KB"
                    prefix={<RocketOutlined />}
                  />
                </Col>
              </Row>
            </Card>

            <Card title="Real-Time Activity">
              <Row gutter={16}>
                <Col span={8}>
                  <Statistic
                    title="Current Users Online"
                    value={realTime?.currentOnline || 0}
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="Messages (Last 5 min)"
                    value={realTime?.recentMessages || 0}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="API Requests/min"
                    value={realTime?.apiRequestsPerMin || 0}
                  />
                </Col>
              </Row>
            </Card>

            <Card title="Performance Metrics">
              <Row gutter={16}>
                <Col span={8}>
                  <Statistic
                    title="Avg Response Time"
                    value={summary?.avgResponseTime || 0}
                    suffix="ms"
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="Success Rate"
                    value={summary?.successRate ? (summary.successRate * 100).toFixed(1) : 0}
                    suffix="%"
                    valueStyle={{ color: '#3f8600' }}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="Error Rate"
                    value={summary?.errorRate ? (summary.errorRate * 100).toFixed(2) : 0}
                    suffix="%"
                    valueStyle={{ color: summary?.errorRate > 0.05 ? '#cf1322' : '#3f8600' }}
                  />
                </Col>
              </Row>
            </Card>
          </Space>
        </TabPane>

        <TabPane 
          tab={<span><LinkOutlined /> Bridges</span>} 
          key="bridges"
        >
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Card 
              title="Bridge Analytics"
              extra={
                <Button onClick={loadBridges}>
                  Refresh
                </Button>
              }
            >
              <Table
                columns={bridgeColumns}
                dataSource={bridges}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 10 }}
              />
            </Card>

            <Card title="Bridge Comparison">
              <Table
                columns={bridgeComparisonColumns}
                dataSource={bridgeComparison}
                rowKey="bridgeId"
                loading={loading}
                pagination={false}
              />
            </Card>
          </Space>
        </TabPane>

        <TabPane 
          tab={<span><RocketOutlined /> Space Mining</span>} 
          key="spaceMining"
        >
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Card title="Space Mining Metrics" loading={loading}>
              <Row gutter={16}>
                <Col span={6}>
                  <Statistic
                    title="Total Space Mined"
                    value={spaceMining?.totalSpaceMined || 0}
                    suffix="KB"
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="Active Miners"
                    value={spaceMining?.activeMiners || 0}
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="Mining Sessions"
                    value={spaceMining?.totalSessions || 0}
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="Avg Mining Rate"
                    value={spaceMining?.avgMiningRate || 0}
                    suffix="KB/hr"
                  />
                </Col>
              </Row>
            </Card>

            <Card title="Top Miners">
              <Table
                dataSource={spaceMining?.topMiners || []}
                rowKey="userId"
                pagination={false}
                columns={[
                  {
                    title: 'User ID',
                    dataIndex: 'userId',
                    key: 'userId',
                  },
                  {
                    title: 'Space Mined',
                    dataIndex: 'spaceMined',
                    key: 'spaceMined',
                    render: (space: number) => `${space} KB`,
                  },
                  {
                    title: 'Sessions',
                    dataIndex: 'sessions',
                    key: 'sessions',
                  },
                  {
                    title: 'Last Active',
                    dataIndex: 'lastActive',
                    key: 'lastActive',
                    render: (date: string) => new Date(date).toLocaleString(),
                  },
                ]}
              />
            </Card>

            <Card title="Mining Distribution">
              <Row gutter={16}>
                <Col span={8}>
                  <Statistic
                    title="DOM Optimization"
                    value={spaceMining?.byType?.domOptimization || 0}
                    suffix="KB"
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="CSS Minification"
                    value={spaceMining?.byType?.cssMinification || 0}
                    suffix="KB"
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="Image Compression"
                    value={spaceMining?.byType?.imageCompression || 0}
                    suffix="KB"
                  />
                </Col>
              </Row>
            </Card>
          </Space>
        </TabPane>

        <TabPane 
          tab={<span><UserOutlined /> User Engagement</span>} 
          key="engagement"
        >
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Card 
              title="Engagement Overview"
              extra={
                <Space>
                  <Select 
                    style={{ width: 120 }} 
                    value={selectedBridge}
                    onChange={setSelectedBridge}
                  >
                    <Option value="all">All Bridges</Option>
                    {bridges.map(b => (
                      <Option key={b.id} value={b.id}>{b.name}</Option>
                    ))}
                  </Select>
                  <RangePicker onChange={setDateRange} />
                </Space>
              }
              loading={loading}
            >
              <Row gutter={16}>
                <Col span={6}>
                  <Statistic
                    title="Active Users"
                    value={userEngagement?.activeUsers || 0}
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="New Users"
                    value={userEngagement?.newUsers || 0}
                    valueStyle={{ color: '#3f8600' }}
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="Avg Session Duration"
                    value={userEngagement?.avgSessionDuration ? Math.round(userEngagement.avgSessionDuration / 60) : 0}
                    suffix="min"
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="Engagement Rate"
                    value={userEngagement?.engagementRate ? (userEngagement.engagementRate * 100).toFixed(1) : 0}
                    suffix="%"
                  />
                </Col>
              </Row>
            </Card>

            <Card title="User Activity">
              <Row gutter={16}>
                <Col span={8}>
                  <Statistic
                    title="Total Interactions"
                    value={userEngagement?.totalInteractions || 0}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="Messages Sent"
                    value={userEngagement?.messagesSent || 0}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="Features Used"
                    value={userEngagement?.featuresUsed || 0}
                  />
                </Col>
              </Row>
            </Card>

            <Card title="User Retention">
              <Row gutter={16}>
                <Col span={8}>
                  <Statistic
                    title="Daily Return Rate"
                    value={userEngagement?.dailyReturnRate ? (userEngagement.dailyReturnRate * 100).toFixed(1) : 0}
                    suffix="%"
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="Weekly Return Rate"
                    value={userEngagement?.weeklyReturnRate ? (userEngagement.weeklyReturnRate * 100).toFixed(1) : 0}
                    suffix="%"
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="Monthly Return Rate"
                    value={userEngagement?.monthlyReturnRate ? (userEngagement.monthlyReturnRate * 100).toFixed(1) : 0}
                    suffix="%"
                  />
                </Col>
              </Row>
            </Card>
          </Space>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default AnalyticsDashboard;
