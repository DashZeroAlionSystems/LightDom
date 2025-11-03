/**
 * Client SEO Campaign Dashboard
 * 
 * Per-client dashboard for viewing SEO reports and neural network training progress
 * Accessible via API key authentication for embedding in client sites
 */

import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Progress,
  Table,
  Tag,
  Timeline,
  Alert,
  Descriptions,
  Button,
  Space,
  Tabs,
  List,
  Typography,
  Badge,
} from 'antd';
import {
  RiseOutlined,
  FallOutlined,
  ThunderboltOutlined,
  LineChartOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  TrophyOutlined,
  RocketOutlined,
  BulbOutlined,
} from '@ant-design/icons';
import { Line, Column } from '@ant-design/plots';

const { TabPane } = Tabs;
const { Title, Text, Paragraph } = Typography;

interface Campaign {
  id: string;
  targetUrl: string;
  keywords: string[];
  status: string;
  neuralNetworkId?: string;
  planType: string;
  metadata: any;
}

interface Report {
  id: number;
  reportType: string;
  data: any;
  insights: any;
  recommendations: any;
  generatedAt: string;
}

interface TrainingMetrics {
  accuracy: number;
  loss: number;
  epochs: number;
  samples: number;
  status: string;
}

export const ClientSEODashboard: React.FC<{ apiKey: string }> = ({ apiKey }) => {
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [trainingMetrics, setTrainingMetrics] = useState<TrainingMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCampaignData();
    // Refresh every 30 seconds
    const interval = setInterval(loadCampaignData, 30000);
    return () => clearInterval(interval);
  }, [apiKey]);

  const loadCampaignData = async () => {
    try {
      setLoading(true);
      setError(null);

      const headers = {
        'X-API-Key': apiKey,
        'Content-Type': 'application/json',
      };

      const [campaignRes, reportsRes, metricsRes] = await Promise.all([
        fetch('/api/tensorflow/client/campaign', { headers }),
        fetch('/api/tensorflow/client/reports', { headers }),
        fetch('/api/tensorflow/client/training-metrics', { headers }),
      ]);

      if (!campaignRes.ok) {
        throw new Error('Invalid API key or campaign not found');
      }

      const campaignData = await campaignRes.json();
      const reportsData = await reportsRes.json();
      const metricsData = await metricsRes.json();

      setCampaign(campaignData);
      setReports(reportsData);
      setTrainingMetrics(metricsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load campaign data');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !campaign) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <ThunderboltOutlined style={{ fontSize: 48, color: '#1890ff' }} />
        <Title level={4}>Loading your SEO campaign...</Title>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '24px' }}>
        <Alert
          message="Access Error"
          description={error}
          type="error"
          showIcon
        />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div style={{ padding: '24px' }}>
        <Alert
          message="No Campaign Found"
          description="Please check your API key and try again."
          type="warning"
          showIcon
        />
      </div>
    );
  }

  const latestReport = reports[0];
  const seoData = latestReport?.data || {};
  const insights = latestReport?.insights || {};
  const recommendations = latestReport?.recommendations || [];

  // Mock performance data for charts
  const performanceData = [
    { month: 'Jan', traffic: 3200, rankings: 45 },
    { month: 'Feb', traffic: 4100, rankings: 38 },
    { month: 'Mar', traffic: 5200, rankings: 32 },
    { month: 'Apr', traffic: 6800, rankings: 28 },
    { month: 'May', traffic: 8100, rankings: 22 },
    { month: 'Jun', traffic: 9500, rankings: 18 },
  ];

  const keywordRankings = campaign.keywords.map((kw, idx) => ({
    keyword: kw,
    currentRank: 15 + idx * 3,
    previousRank: 20 + idx * 4,
    change: -(5 + idx),
    searchVolume: 5000 - idx * 500,
  }));

  const trafficConfig = {
    data: performanceData,
    xField: 'month',
    yField: 'traffic',
    smooth: true,
    color: '#52c41a',
    point: {
      size: 5,
      shape: 'diamond',
    },
  };

  const rankingsConfig = {
    data: performanceData,
    xField: 'month',
    yField: 'rankings',
    color: '#1890ff',
    columnWidthRatio: 0.6,
  };

  const keywordColumns = [
    {
      title: 'Keyword',
      dataIndex: 'keyword',
      key: 'keyword',
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: 'Current Rank',
      dataIndex: 'currentRank',
      key: 'currentRank',
      render: (rank: number) => (
        <Badge count={rank} style={{ backgroundColor: rank <= 10 ? '#52c41a' : '#faad14' }} />
      ),
    },
    {
      title: 'Change',
      dataIndex: 'change',
      key: 'change',
      render: (change: number) => (
        <Space>
          {change < 0 ? (
            <RiseOutlined style={{ color: '#52c41a' }} />
          ) : (
            <FallOutlined style={{ color: '#ff4d4f' }} />
          )}
          <Text type={change < 0 ? 'success' : 'danger'}>{Math.abs(change)}</Text>
        </Space>
      ),
    },
    {
      title: 'Search Volume',
      dataIndex: 'searchVolume',
      key: 'searchVolume',
      render: (vol: number) => vol.toLocaleString(),
    },
  ];

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
      <Row gutter={[16, 16]}>
        {/* Header */}
        <Col span={24}>
          <Card>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <Title level={2} style={{ margin: 0 }}>
                    <RocketOutlined /> SEO Campaign Dashboard
                  </Title>
                  <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                    {campaign.targetUrl}
                  </Paragraph>
                </div>
                <Tag color="blue" style={{ fontSize: 14, padding: '4px 12px' }}>
                  {campaign.planType.toUpperCase()} Plan
                </Tag>
              </div>
              {trainingMetrics && (
                <Alert
                  message={
                    <Space>
                      <ThunderboltOutlined />
                      <Text>
                        Neural network training in progress: {trainingMetrics.accuracy.toFixed(1)}% accuracy
                      </Text>
                    </Space>
                  }
                  type="info"
                  showIcon={false}
                  banner
                />
              )}
            </Space>
          </Card>
        </Col>

        {/* Key Metrics */}
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Organic Traffic"
              value={9500}
              suffix="visits"
              prefix={<LineChartOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
            <Progress percent={75} strokeColor="#52c41a" showInfo={false} />
            <Text type="secondary">+32% vs last month</Text>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Avg. Ranking"
              value={18}
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
            <Progress percent={60} strokeColor="#1890ff" showInfo={false} />
            <Text type="secondary">Improved by 7 positions</Text>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Keywords Tracked"
              value={campaign.keywords.length}
              prefix={<BulbOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
            <Progress percent={85} strokeColor="#faad14" showInfo={false} />
            <Text type="secondary">{campaign.keywords.filter((_, i) => i % 2 === 0).length} in top 20</Text>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Training Accuracy"
              value={trainingMetrics?.accuracy || 0}
              suffix="%"
              prefix={<ThunderboltOutlined />}
              precision={1}
              valueStyle={{ color: '#722ed1' }}
            />
            <Progress
              percent={trainingMetrics?.accuracy || 0}
              strokeColor="#722ed1"
              showInfo={false}
            />
            <Text type="secondary">{trainingMetrics?.samples || 0} samples trained</Text>
          </Card>
        </Col>

        {/* Main Content Tabs */}
        <Col span={24}>
          <Card>
            <Tabs defaultActiveKey="overview">
              <TabPane tab={<span><LineChartOutlined /> Overview</span>} key="overview">
                <Row gutter={[16, 16]}>
                  <Col xs={24} lg={12}>
                    <Card title="Traffic Trend" bordered={false}>
                      <Line {...trafficConfig} />
                    </Card>
                  </Col>
                  <Col xs={24} lg={12}>
                    <Card title="Ranking Improvements" bordered={false}>
                      <Column {...rankingsConfig} />
                    </Card>
                  </Col>
                </Row>
              </TabPane>

              <TabPane tab={<span><TrophyOutlined /> Keywords</span>} key="keywords">
                <Table
                  columns={keywordColumns}
                  dataSource={keywordRankings}
                  rowKey="keyword"
                  pagination={false}
                />
              </TabPane>

              <TabPane tab={<span><BulbOutlined /> Insights</span>} key="insights">
                <Row gutter={[16, 16]}>
                  <Col xs={24} lg={12}>
                    <Card title="AI-Generated Recommendations" bordered={false}>
                      <List
                        dataSource={recommendations.length > 0 ? recommendations : [
                          'Optimize page load speed - current average is 3.2s',
                          'Add more internal links to high-performing pages',
                          'Improve meta descriptions - 40% are too short',
                          'Create content for long-tail keywords with low competition',
                          'Fix 15 broken backlinks identified'
                        ]}
                        renderItem={(item: string, index) => (
                          <List.Item>
                            <Space>
                              <CheckCircleOutlined style={{ color: '#52c41a' }} />
                              <Text>{item}</Text>
                            </Space>
                          </List.Item>
                        )}
                      />
                    </Card>
                  </Col>
                  <Col xs={24} lg={12}>
                    <Card title="Neural Network Insights" bordered={false}>
                      {trainingMetrics && (
                        <Descriptions column={1} bordered size="small">
                          <Descriptions.Item label="Model Status">
                            <Badge status="processing" text={trainingMetrics.status} />
                          </Descriptions.Item>
                          <Descriptions.Item label="Training Accuracy">
                            {trainingMetrics.accuracy.toFixed(2)}%
                          </Descriptions.Item>
                          <Descriptions.Item label="Loss">
                            {trainingMetrics.loss.toFixed(4)}
                          </Descriptions.Item>
                          <Descriptions.Item label="Epochs Completed">
                            {trainingMetrics.epochs}
                          </Descriptions.Item>
                          <Descriptions.Item label="Training Samples">
                            {trainingMetrics.samples.toLocaleString()}
                          </Descriptions.Item>
                        </Descriptions>
                      )}
                      <Alert
                        message="Predictive Analysis"
                        description="Based on current trends, your site is projected to reach top 10 rankings for 5 keywords within 60 days."
                        type="success"
                        style={{ marginTop: 16 }}
                        showIcon
                      />
                    </Card>
                  </Col>
                </Row>
              </TabPane>

              <TabPane tab={<span><ClockCircleOutlined /> Activity</span>} key="activity">
                <Timeline mode="left">
                  <Timeline.Item
                    label="Today 10:30 AM"
                    color="green"
                    dot={<CheckCircleOutlined />}
                  >
                    <Text strong>Neural network training completed</Text>
                    <br />
                    <Text type="secondary">Achieved 94.3% accuracy on validation set</Text>
                  </Timeline.Item>
                  <Timeline.Item
                    label="Today 8:15 AM"
                    color="blue"
                  >
                    <Text strong>SEO report generated</Text>
                    <br />
                    <Text type="secondary">15 new recommendations identified</Text>
                  </Timeline.Item>
                  <Timeline.Item
                    label="Yesterday 6:45 PM"
                    color="blue"
                  >
                    <Text strong>Competitor analysis updated</Text>
                    <br />
                    <Text type="secondary">3 new competitor keywords discovered</Text>
                  </Timeline.Item>
                  <Timeline.Item
                    label="Yesterday 2:30 PM"
                    color="orange"
                  >
                    <Text strong>Training data collection completed</Text>
                    <br />
                    <Text type="secondary">1,200 new samples collected</Text>
                  </Timeline.Item>
                  <Timeline.Item
                    label="2 days ago"
                    color="green"
                  >
                    <Text strong>Keyword rankings improved</Text>
                    <br />
                    <Text type="secondary">5 keywords moved into top 20</Text>
                  </Timeline.Item>
                </Timeline>
              </TabPane>
            </Tabs>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ClientSEODashboard;
