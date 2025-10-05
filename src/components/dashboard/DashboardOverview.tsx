import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Progress,
  List,
  Avatar,
  Button,
  Space,
  Typography,
  Tag,
  Timeline,
  Alert,
  Spin,
  Empty,
  Tooltip,
  Form,
  Modal,
  Input,
  Select,
  message
} from 'antd';
import {
  TrophyOutlined,
  GlobalOutlined,
  WalletOutlined,
  OptimizationOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
<<<<<<< HEAD
  SearchOutlined,
  RobotOutlined
=======
  BarChartOutlined
>>>>>>> origin/main
} from '@ant-design/icons';
import { Line, Bar, Pie } from '@ant-design/plots';
import { useOptimization } from '../../hooks/useOptimization';
import { useAuth } from '../../hooks/useAuth';
import { useWebsites } from '../../hooks/useWebsites';
import { useAnalytics } from '../../hooks/useAnalytics';
<<<<<<< HEAD
import { useSEO } from '../../hooks/useSEO';
import SEOIntegrationTest from './SEOIntegrationTest';
=======
import { useNotifications } from '../../hooks/useNotifications';
import { useCrawler } from '../../hooks/useCrawler';
>>>>>>> origin/main
import './DashboardOverview.css';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

interface DashboardOverviewProps {
  className?: string;
}

const DashboardOverview: React.FC<DashboardOverviewProps> = ({ className }) => {
  const { user } = useAuth();
  const { optimizationStats, recentOptimizations, loading: optimizationLoading } = useOptimization();
  const { websites, loading: websitesLoading } = useWebsites();
  const { analytics, loading: analyticsLoading } = useAnalytics();
<<<<<<< HEAD
  const { stats: seoStats, loading: seoLoading } = useSEO();
=======
  const { session, loading: crawlerLoading, startCrawling, stopCrawling, resumeCrawling } = useCrawler();
>>>>>>> origin/main
  const [timeRange, setTimeRange] = useState('7d');
  const [showCrawlerModal, setShowCrawlerModal] = useState(false);

  // Performance metrics data for charts
  const performanceData = [
    { time: '2024-01-01', score: 85, type: 'Performance' },
    { time: '2024-01-02', score: 87, type: 'Performance' },
    { time: '2024-01-03', score: 89, type: 'Performance' },
    { time: '2024-01-04', score: 91, type: 'Performance' },
    { time: '2024-01-05', score: 88, type: 'Performance' },
    { time: '2024-01-06', score: 93, type: 'Performance' },
    { time: '2024-01-07', score: 95, type: 'Performance' },
  ];

  const optimizationTypesData = [
    { type: 'Image Optimization', value: 35, color: '#1890ff' },
    { type: 'CSS Optimization', value: 25, color: '#52c41a' },
    { type: 'JavaScript Optimization', value: 20, color: '#faad14' },
    { type: 'HTML Optimization', value: 15, color: '#f5222d' },
    { type: 'Other', value: 5, color: '#722ed1' },
  ];

  const websiteOptimizationData = websites?.map(site => ({
    website: site.domain,
    beforeScore: site.beforeScore,
    afterScore: site.afterScore,
    improvement: site.afterScore - site.beforeScore,
  })) || [];

  const performanceConfig = {
    data: performanceData,
    xField: 'time',
    yField: 'score',
    smooth: true,
    color: '#1890ff',
    point: {
      size: 4,
      shape: 'circle',
    },
    tooltip: {
      formatter: (datum: any) => ({
        name: 'Performance Score',
        value: `${datum.score}%`,
      }),
    },
  };

  const optimizationTypesConfig = {
    data: optimizationTypesData,
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    label: {
      type: 'outer',
      content: '{name} {percentage}',
    },
    interactions: [
      {
        type: 'element-active',
      },
    ],
  };

  const websiteComparisonConfig = {
    data: websiteOptimizationData,
    xField: 'website',
    yField: 'beforeScore',
    seriesField: 'type',
    isGroup: true,
    columnStyle: {
      radius: [4, 4, 0, 0],
    },
    tooltip: {
      shared: true,
      showMarkers: false,
    },
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return '#52c41a';
    if (score >= 70) return '#faad14';
    return '#f5222d';
  };

  const getScoreStatus = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 50) return 'Needs Improvement';
    return 'Poor';
  };

<<<<<<< HEAD
  if (optimizationLoading || websitesLoading || analyticsLoading || seoLoading) {
=======
  const handleStartCrawling = async (values: any) => {
    try {
      await startCrawling({
        startUrl: values.startUrl,
        maxDepth: values.maxDepth || 2,
        maxPages: values.maxPages || 10,
        optimizationTypes: values.optimizationTypes || ['image', 'css', 'js', 'html']
      });
      setShowCrawlerModal(false);
      message.success('Crawling started successfully!');
    } catch (error) {
      message.error('Failed to start crawling');
    }
  };

  const handleStopCrawling = async () => {
    try {
      await stopCrawling();
      message.success('Crawling stopped');
    } catch (error) {
      message.error('Failed to stop crawling');
    }
  };

  const handleResumeCrawling = async () => {
    try {
      await resumeCrawling();
      message.success('Crawling resumed');
    } catch (error) {
      message.error('Failed to resume crawling');
    }
  };

  if (optimizationLoading || websitesLoading || analyticsLoading) {
>>>>>>> origin/main
    return (
      <div className="dashboard-overview-loading">
        <Spin size="large" />
        <Text>Loading dashboard data...</Text>
      </div>
    );
  }

  return (
    <div className={`dashboard-overview ${className || ''}`}>
      {/* Welcome Section */}
      <Card className="welcome-card" bordered={false}>
        <Row align="middle" justify="space-between">
          <Col>
            <Title level={2} className="welcome-title">
              Welcome back, {user?.name}! 👋
            </Title>
            <Paragraph className="welcome-subtitle">
              Here's what's happening with your DOM optimizations today.
            </Paragraph>
          </Col>
          <Col>
            <Space>
              <Button 
                type="primary" 
                size="large"
                onClick={() => setShowCrawlerModal(true)}
                loading={crawlerLoading}
              >
                <OptimizationOutlined />
                Start Crawling
              </Button>
              <Button size="large">
                <GlobalOutlined />
                Add Website
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Key Metrics */}
      <Row gutter={[24, 24]} className="metrics-row">
        <Col xs={24} sm={12} lg={6}>
          <Card className="metric-card">
            <Statistic
              title="Total Websites"
              value={optimizationStats?.totalWebsites || 0}
              prefix={<GlobalOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
            <div className="metric-trend">
              <ArrowUpOutlined className="trend-up" />
              <Text type="secondary">+12% from last month</Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="metric-card">
            <Statistic
              title="Average Score"
              value={optimizationStats?.averageScore || 0}
              suffix="%"
              prefix={<TrophyOutlined />}
              valueStyle={{ color: getScoreColor(optimizationStats?.averageScore || 0) }}
            />
            <div className="metric-trend">
              <ArrowUpOutlined className="trend-up" />
              <Text type="secondary">+5% improvement</Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="metric-card">
            <Statistic
              title="Tokens Earned"
              value={optimizationStats?.tokensEarned || 0}
              prefix={<WalletOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
            <div className="metric-trend">
              <ArrowUpOutlined className="trend-up" />
              <Text type="secondary">+8% this week</Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="metric-card">
            <Statistic
              title="Optimizations Today"
              value={optimizationStats?.optimizationsToday || 0}
              prefix={<OptimizationOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
            <div className="metric-trend">
              <ArrowUpOutlined className="trend-up" />
              <Text type="secondary">+3 from yesterday</Text>
            </div>
          </Card>
        </Col>
      </Row>

      {/* SEO Metrics Row */}
      <Row gutter={[24, 24]} className="metrics-row" style={{ marginTop: 16 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="metric-card seo-metric">
            <Statistic
              title="SEO Analyses"
              value={seoStats?.totalAnalyses || 0}
              prefix={<SearchOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
            <div className="metric-trend">
              <ArrowUpOutlined className="trend-up" />
              <Text type="secondary">+15% this week</Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="metric-card seo-metric">
            <Statistic
              title="Domains Analyzed"
              value={seoStats?.domainsAnalyzed || 0}
              prefix={<GlobalOutlined />}
              valueStyle={{ color: '#13c2c2' }}
            />
            <div className="metric-trend">
              <ArrowUpOutlined className="trend-up" />
              <Text type="secondary">+8% this month</Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="metric-card seo-metric">
            <Statistic
              title="Average SEO Score"
              value={seoStats?.avgSEOScore || 0}
              suffix="/100"
              prefix={<TrophyOutlined />}
              valueStyle={{ color: getScoreColor(seoStats?.avgSEOScore || 0) }}
            />
            <div className="metric-trend">
              <ArrowUpOutlined className="trend-up" />
              <Text type="secondary">+3 points improvement</Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="metric-card seo-metric">
            <Statistic
              title="AI Recommendations"
              value={seoStats?.aiRecommendations || 0}
              prefix={<RobotOutlined />}
              valueStyle={{ color: '#eb2f96' }}
            />
            <div className="metric-trend">
              <ArrowUpOutlined className="trend-up" />
              <Text type="secondary">+22% this week</Text>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Charts Row */}
      <Row gutter={[24, 24]} className="charts-row">
        <Col xs={24} lg={16}>
          <Card title="Performance Trends" className="chart-card">
            <Line {...performanceConfig} />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Optimization Types" className="chart-card">
            <Pie {...optimizationTypesConfig} />
          </Card>
        </Col>
      </Row>

      {/* Website Performance */}
      <Row gutter={[24, 24]} className="websites-row">
        <Col xs={24} lg={16}>
          <Card title="Website Performance Comparison" className="chart-card">
            <Bar {...websiteComparisonConfig} />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Top Performing Websites" className="websites-list-card">
            <List
              dataSource={websites?.slice(0, 5)}
              renderItem={(website) => (
                <List.Item className="website-item">
                  <List.Item.Meta
                    avatar={<Avatar icon={<GlobalOutlined />} />}
                    title={
                      <div className="website-title">
                        <Text strong>{website.domain}</Text>
                        <Tag color={getScoreColor(website.afterScore)}>
                          {website.afterScore}%
                        </Tag>
                      </div>
                    }
                    description={
                      <div className="website-description">
                        <Text type="secondary">
                          {website.afterScore - website.beforeScore > 0 ? '+' : ''}
                          {website.afterScore - website.beforeScore}% improvement
                        </Text>
                        <Progress
                          percent={website.afterScore}
                          size="small"
                          strokeColor={getScoreColor(website.afterScore)}
                          showInfo={false}
                        />
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      {/* Recent Activity */}
      <Row gutter={[24, 24]} className="activity-row">
        <Col xs={24} lg={12}>
          <Card title="Recent Optimizations" className="activity-card">
            <Timeline>
              {recentOptimizations?.map((optimization, index) => (
                <Timeline.Item
                  key={index}
                  dot={
                    optimization.status === 'completed' ? (
                      <CheckCircleOutlined style={{ color: '#52c41a' }} />
                    ) : optimization.status === 'processing' ? (
                      <ClockCircleOutlined style={{ color: '#faad14' }} />
                    ) : (
                      <ExclamationCircleOutlined style={{ color: '#f5222d' }} />
                    )
                  }
                >
                  <div className="timeline-item">
                    <Text strong>{optimization.website}</Text>
                    <br />
                    <Text type="secondary">
                      {optimization.type} - {optimization.status}
                    </Text>
                    <br />
                    <Text type="secondary" className="timeline-time">
                      {optimization.timestamp}
                    </Text>
                  </div>
                </Timeline.Item>
              ))}
            </Timeline>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Quick Actions" className="quick-actions-card">
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <Button block size="large" type="primary">
                <OptimizationOutlined />
                Optimize New Website
              </Button>
              <Button block size="large">
                <SearchOutlined />
                SEO Analysis
              </Button>
              <Button block size="large">
                <GlobalOutlined />
                View All Websites
              </Button>
              <Button block size="large">
                <BarChartOutlined />
                View Analytics
              </Button>
              <Button block size="large">
                <WalletOutlined />
                Manage Tokens
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>

<<<<<<< HEAD
      {/* SEO Pipeline Integration Test */}
      <Row gutter={[24, 24]} className="seo-integration-row">
        <Col span={24}>
          <SEOIntegrationTest />
=======
      {/* Settings Overview */}
      <Row gutter={[24, 24]} className="settings-row">
        <Col span={24}>
          <Card className="settings-overview-card">
            <SettingsOverview />
          </Card>
>>>>>>> origin/main
        </Col>
      </Row>

      {/* Alerts and Notifications */}
      {optimizationStats?.alerts && optimizationStats.alerts.length > 0 && (
        <Row gutter={[24, 24]} className="alerts-row">
          <Col span={24}>
            <Card title="Important Alerts" className="alerts-card">
              {optimizationStats.alerts.map((alert, index) => (
                <Alert
                  key={index}
                  message={alert.title}
                  description={alert.description}
                  type={alert.type}
                  showIcon
                  action={
                    <Button size="small" type="primary">
                      View Details
                    </Button>
                  }
                  className="alert-item"
                />
              ))}
            </Card>
          </Col>
        </Row>
      )}

      {/* Crawler Status */}
      {session && (
        <Row gutter={[24, 24]} className="crawler-status-row">
          <Col span={24}>
            <Card title="Crawling Session" className="crawler-status-card">
              <Row gutter={[16, 16]} align="middle">
                <Col xs={24} sm={12} md={6}>
                  <Statistic
                    title="Status"
                    value={session.status}
                    valueStyle={{ 
                      color: session.status === 'running' ? '#52c41a' : 
                             session.status === 'completed' ? '#1890ff' : '#faad14'
                    }}
                  />
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Statistic
                    title="Progress"
                    value={session.progress}
                    suffix="%"
                    prefix={<OptimizationOutlined />}
                  />
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Statistic
                    title="Pages Processed"
                    value={session.urlsProcessed}
                    suffix={`/ ${session.totalUrls}`}
                    prefix={<GlobalOutlined />}
                  />
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Space>
                    {session.status === 'running' && (
                      <Button onClick={handleStopCrawling} danger>
                        Stop
                      </Button>
                    )}
                    {session.status === 'paused' && (
                      <Button onClick={handleResumeCrawling} type="primary">
                        Resume
                      </Button>
                    )}
                  </Space>
                </Col>
              </Row>
              {session.status === 'running' && (
                <Progress 
                  percent={session.progress} 
                  status="active"
                  style={{ marginTop: 16 }}
                />
              )}
            </Card>
          </Col>
        </Row>
      )}

      {/* Crawler Modal */}
      <Modal
        title="Start Web Crawling"
        open={showCrawlerModal}
        onCancel={() => setShowCrawlerModal(false)}
        footer={null}
        width={600}
      >
        <Form
          layout="vertical"
          onFinish={handleStartCrawling}
        >
          <Form.Item
            name="startUrl"
            label="Starting URL"
            rules={[{ required: true, message: 'Please enter a starting URL' }]}
          >
            <Input placeholder="https://example.com" />
          </Form.Item>

          <Form.Item
            name="maxDepth"
            label="Maximum Depth"
            initialValue={2}
          >
            <Input type="number" min={1} max={5} />
          </Form.Item>

          <Form.Item
            name="maxPages"
            label="Maximum Pages"
            initialValue={10}
          >
            <Input type="number" min={1} max={100} />
          </Form.Item>

          <Form.Item
            name="optimizationTypes"
            label="Optimization Types"
            initialValue={['image', 'css', 'js', 'html']}
          >
            <Select mode="multiple" placeholder="Select optimization types">
              <Option value="image">Image Optimization</Option>
              <Option value="css">CSS Optimization</Option>
              <Option value="js">JavaScript Optimization</Option>
              <Option value="html">HTML Optimization</Option>
              <Option value="performance">Performance Optimization</Option>
            </Select>
          </Form.Item>

          <Alert
            message="Crawling Information"
            description="The crawler will analyze websites for optimization opportunities and generate tokens based on space saved."
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={crawlerLoading}>
                Start Crawling
              </Button>
              <Button onClick={() => setShowCrawlerModal(false)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DashboardOverview;
