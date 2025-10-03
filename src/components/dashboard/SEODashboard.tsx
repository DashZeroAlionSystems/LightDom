import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Button,
  Input,
  Select,
  Table,
  Tag,
  Progress,
  Alert,
  Tabs,
  Form,
  Space,
  Typography,
  Divider,
  List,
  Avatar,
  Badge,
  Tooltip,
  Modal,
  message,
  Spin,
  Empty
} from 'antd';
import {
  SearchOutlined,
  BarChartOutlined,
  RobotOutlined,
  GlobalOutlined,
  TrophyOutlined,
  TrendingUpOutlined,
  SettingOutlined,
  BulbOutlined,
  EyeOutlined,
  LinkOutlined,
  ThunderboltOutlined,
  DatabaseOutlined,
  ApiOutlined,
  KeyOutlined,
  DownloadOutlined,
  DeleteOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { Line } from '@ant-design/plots';
import { useSEO } from '../../hooks/useSEO';
import './SEODashboard.css';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;

interface SEOAnalysis {
  url: string;
  seoScore: number;
  timestamp: string;
  coreWebVitals: {
    lcp: { value: number; status: string };
    fid: { value: number; status: string };
    cls: { value: number; status: string };
  };
  recommendations: Array<{
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    category: string;
    impact: string;
  }>;
}

interface DomainMetrics {
  domain: string;
  avgScore: number;
  totalPages: number;
  lastAnalysis: string;
  topPages: Array<{
    url: string;
    seoScore: number;
    timestamp: string;
  }>;
}

interface AIRecommendation {
  title: string;
  description: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  impact: string;
  improvement: number;
}

interface TrendData {
  date: string;
  avgScore: number;
  pageCount: number;
  avgLCP: number;
  avgFID: number;
  avgCLS: number;
}

interface ModelStatus {
  loaded: boolean;
  training: boolean;
  metrics: {
    trainingSamples: number;
    validationAccuracy: number;
    loss: number;
    mae: number;
    lastUpdated: string;
  };
}

const SEODashboard: React.FC = () => {
  const [analysisUrl, setAnalysisUrl] = useState('');
  const [domainInput, setDomainInput] = useState('');
  const [comparisonDomains, setComparisonDomains] = useState('');
  const [recommendationUrl, setRecommendationUrl] = useState('');
  const [recommendationCategory, setRecommendationCategory] = useState('');
  const [predictionUrl, setPredictionUrl] = useState('');
  const [optimizations, setOptimizations] = useState('');
  const [trendsDomain, setTrendsDomain] = useState('');
  const [trendsDays, setTrendsDays] = useState('30');
  
  // State for results
  const [analysisResult, setAnalysisResult] = useState<SEOAnalysis | null>(null);
  const [domainResult, setDomainResult] = useState<DomainMetrics | null>(null);
  const [comparisonResult, setComparisonResult] = useState<any>(null);
  const [recommendationsResult, setRecommendationsResult] = useState<AIRecommendation[]>([]);
  const [predictionResult, setPredictionResult] = useState<any>(null);
  const [trendsResult, setTrendsResult] = useState<TrendData[]>([]);

  // Configuration
  const [seoConfig, setSeoConfig] = useState({
    apiUrl: 'http://localhost:3002',
    apiKey: 'demo-api-key'
  });

  // Use SEO hook
  const {
    loading,
    stats,
    topDomains,
    recentActivity,
    modelStatus,
    loadSEOOverview,
    analyzeWebsite,
    getDomainOverview,
    compareDomains,
    getAIRecommendations,
    predictSEOScore,
    getSEOTrends,
    getModelStatus,
    trainModel,
    updateConfig
  } = useSEO();

  useEffect(() => {
    updateConfig(seoConfig);
  }, [seoConfig, updateConfig]);

  const handleAnalyzeWebsite = async () => {
    if (!analysisUrl) {
      message.error('Please enter a URL');
      return;
    }

    try {
      const result = await analyzeWebsite(analysisUrl);
      setAnalysisResult(result);
      message.success('Website analysis completed');
    } catch (error) {
      message.error('Analysis failed: ' + (error as Error).message);
    }
  };

  const handleGetDomainOverview = async () => {
    if (!domainInput) {
      message.error('Please enter a domain');
      return;
    }

    try {
      const result = await getDomainOverview(domainInput);
      setDomainResult(result);
      message.success('Domain overview loaded');
    } catch (error) {
      message.error('Domain overview failed: ' + (error as Error).message);
    }
  };

  const handleCompareDomains = async () => {
    if (!comparisonDomains) {
      message.error('Please enter domains to compare');
      return;
    }

    const domains = comparisonDomains.split(',').map(d => d.trim()).filter(d => d);
    if (domains.length < 2) {
      message.error('Please enter at least 2 domains');
      return;
    }

    try {
      const result = await compareDomains(domains);
      setComparisonResult(result);
      message.success('Domain comparison completed');
    } catch (error) {
      message.error('Domain comparison failed: ' + (error as Error).message);
    }
  };

  const handleGetAIRecommendations = async () => {
    if (!recommendationUrl) {
      message.error('Please enter a URL');
      return;
    }

    try {
      const result = await getAIRecommendations(recommendationUrl, recommendationCategory || undefined);
      setRecommendationsResult(result);
      message.success('AI recommendations generated');
    } catch (error) {
      message.error('AI recommendations failed: ' + (error as Error).message);
    }
  };

  const handlePredictSEOScore = async () => {
    if (!predictionUrl || !optimizations) {
      message.error('Please enter a URL and optimizations');
      return;
    }

    let optimizationData;
    try {
      optimizationData = JSON.parse(optimizations);
    } catch (error) {
      message.error('Invalid JSON format for optimizations');
      return;
    }

    try {
      const result = await predictSEOScore(predictionUrl, optimizationData);
      setPredictionResult(result);
      message.success('SEO score prediction completed');
    } catch (error) {
      message.error('Score prediction failed: ' + (error as Error).message);
    }
  };

  const handleGetSEOTrends = async () => {
    if (!trendsDomain) {
      message.error('Please enter a domain');
      return;
    }

    try {
      const result = await getSEOTrends(trendsDomain, parseInt(trendsDays));
      setTrendsResult(result);
      message.success('SEO trends loaded');
    } catch (error) {
      message.error('SEO trends failed: ' + (error as Error).message);
    }
  };

  const handleTrainModel = async () => {
    try {
      await trainModel();
      message.success('Model training started');
    } catch (error) {
      message.error('Model training failed: ' + (error as Error).message);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return '#52c41a';
    if (score >= 70) return '#1890ff';
    if (score >= 50) return '#faad14';
    return '#ff4d4f';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'red';
      case 'medium': return 'orange';
      case 'low': return 'green';
      default: return 'blue';
    }
  };

  const trendsChartConfig = {
    data: trendsResult,
    xField: 'date',
    yField: 'avgScore',
    smooth: true,
    color: '#1890ff',
    point: {
      size: 4,
      shape: 'circle',
    },
    tooltip: {
      formatter: (datum: any) => {
        return { name: 'SEO Score', value: `${datum.avgScore.toFixed(1)}/100` };
      },
    },
  };

  const recommendationColumns = [
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority: string) => (
        <Tag color={getPriorityColor(priority)}>{priority.toUpperCase()}</Tag>
      ),
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (category: string) => (
        <Tag color="blue">{category}</Tag>
      ),
    },
    {
      title: 'Impact',
      dataIndex: 'impact',
      key: 'impact',
      render: (impact: string) => (
        <Tag color="purple">{impact}</Tag>
      ),
    },
    {
      title: 'Improvement',
      dataIndex: 'improvement',
      key: 'improvement',
      render: (improvement: number) => (
        <Text type="success">+{improvement} points</Text>
      ),
    },
  ];

  return (
    <div className="seo-dashboard">
      <div className="seo-header">
        <Title level={2}>
          <BarChartOutlined /> SEO Pipeline Management
        </Title>
        <Text type="secondary">
          AI-powered website optimization insights and recommendations
        </Text>
      </div>

      <Tabs defaultActiveKey="overview" className="seo-tabs">
        <TabPane tab={<span><EyeOutlined />Overview</span>} key="overview">
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Total Analyses"
                  value={stats.totalAnalyses}
                  prefix={<SearchOutlined />}
                  loading={loading}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Domains Analyzed"
                  value={stats.domainsAnalyzed}
                  prefix={<GlobalOutlined />}
                  loading={loading}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Average SEO Score"
                  value={stats.avgSEOScore}
                  suffix="/100"
                  prefix={<TrophyOutlined />}
                  loading={loading}
                  valueStyle={{ color: getScoreColor(stats.avgSEOScore) }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="AI Recommendations"
                  value={stats.aiRecommendations}
                  prefix={<RobotOutlined />}
                  loading={loading}
                />
              </Card>
            </Col>
          </Row>

          <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
            <Col xs={24} lg={12}>
              <Card title="Top Performing Domains" extra={<Button icon={<ReloadOutlined />} onClick={loadSEOOverview} />}>
                <List
                  dataSource={topDomains}
                  renderItem={(item) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<Avatar icon={<GlobalOutlined />} />}
                        title={item.domain}
                        description={`${item.pages} pages analyzed`}
                      />
                      <div>
                        <Progress
                          percent={item.score}
                          size="small"
                          strokeColor={getScoreColor(item.score)}
                          format={() => `${item.score}/100`}
                        />
                      </div>
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card title="Recent Activity" extra={<Button icon={<ReloadOutlined />} onClick={loadSEOOverview} />}>
                <List
                  dataSource={recentActivity}
                  renderItem={(item) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<Avatar icon={<ThunderboltOutlined />} />}
                        title={item.action}
                        description={item.domain}
                      />
                      <Text type="secondary">{item.time}</Text>
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane tab={<span><SearchOutlined />Analysis</span>} key="analysis">
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={8}>
              <Card title="Website Analysis">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Input
                    placeholder="https://example.com"
                    value={analysisUrl}
                    onChange={(e) => setAnalysisUrl(e.target.value)}
                    prefix={<SearchOutlined />}
                  />
                  <Button type="primary" onClick={handleAnalyzeWebsite} loading={loading} block>
                    Analyze Website
                  </Button>
                </Space>
                {analysisResult && (
                  <div style={{ marginTop: 16 }}>
                    <Alert
                      message="Analysis Complete"
                      description={
                        <div>
                          <p><strong>SEO Score:</strong> <Text style={{ color: getScoreColor(analysisResult.seoScore) }}>{analysisResult.seoScore}/100</Text></p>
                          <p><strong>Analysis Date:</strong> {new Date(analysisResult.timestamp).toLocaleString()}</p>
                          <Divider />
                          <Title level={5}>Core Web Vitals</Title>
                          <ul>
                            <li>LCP: {analysisResult.coreWebVitals.lcp.value}ms ({analysisResult.coreWebVitals.lcp.status})</li>
                            <li>FID: {analysisResult.coreWebVitals.fid.value}ms ({analysisResult.coreWebVitals.fid.status})</li>
                            <li>CLS: {analysisResult.coreWebVitals.cls.value} ({analysisResult.coreWebVitals.cls.status})</li>
                          </ul>
                        </div>
                      }
                      type="success"
                    />
                  </div>
                )}
              </Card>
            </Col>
            <Col xs={24} lg={8}>
              <Card title="Domain Overview">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Input
                    placeholder="example.com"
                    value={domainInput}
                    onChange={(e) => setDomainInput(e.target.value)}
                    prefix={<GlobalOutlined />}
                  />
                  <Button type="primary" onClick={handleGetDomainOverview} loading={loading} block>
                    Get Overview
                  </Button>
                </Space>
                {domainResult && (
                  <div style={{ marginTop: 16 }}>
                    <Alert
                      message={`Domain Overview: ${domainResult.domain}`}
                      description={
                        <div>
                          <p><strong>Average SEO Score:</strong> <Text style={{ color: getScoreColor(domainResult.avgScore) }}>{domainResult.avgScore}/100</Text></p>
                          <p><strong>Pages Analyzed:</strong> {domainResult.totalPages}</p>
                          <p><strong>Last Analysis:</strong> {new Date(domainResult.lastAnalysis).toLocaleString()}</p>
                        </div>
                      }
                      type="success"
                    />
                  </div>
                )}
              </Card>
            </Col>
            <Col xs={24} lg={8}>
              <Card title="Domain Comparison">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Input
                    placeholder="example.com, competitor.com"
                    value={comparisonDomains}
                    onChange={(e) => setComparisonDomains(e.target.value)}
                    prefix={<LinkOutlined />}
                  />
                  <Button type="primary" onClick={handleCompareDomains} loading={loading} block>
                    Compare Domains
                  </Button>
                </Space>
                {comparisonResult && (
                  <div style={{ marginTop: 16 }}>
                    <Alert
                      message="Domain Comparison"
                      description={
                        <div>
                          <p><strong>Best Performing:</strong> {comparisonResult.bestPerforming?.domain}</p>
                          <p><strong>Total Domains:</strong> {comparisonResult.totalDomains}</p>
                        </div>
                      }
                      type="success"
                    />
                  </div>
                )}
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane tab={<span><RobotOutlined />Recommendations</span>} key="recommendations">
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <Card title="AI Recommendations">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Input
                    placeholder="https://example.com"
                    value={recommendationUrl}
                    onChange={(e) => setRecommendationUrl(e.target.value)}
                    prefix={<SearchOutlined />}
                  />
                  <Select
                    placeholder="Select category"
                    value={recommendationCategory}
                    onChange={setRecommendationCategory}
                    style={{ width: '100%' }}
                    allowClear
                  >
                    <Option value="performance">Performance</Option>
                    <Option value="content">Content</Option>
                    <Option value="technical">Technical</Option>
                    <Option value="backlinks">Backlinks</Option>
                  </Select>
                  <Button type="primary" onClick={handleGetAIRecommendations} loading={loading} block>
                    Get Recommendations
                  </Button>
                </Space>
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card title="Score Prediction">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Input
                    placeholder="https://example.com"
                    value={predictionUrl}
                    onChange={(e) => setPredictionUrl(e.target.value)}
                    prefix={<SearchOutlined />}
                  />
                  <TextArea
                    placeholder='{"performance": {"lcp": 2000, "fid": 80}, "content": {"titleLength": 50}}'
                    value={optimizations}
                    onChange={(e) => setOptimizations(e.target.value)}
                    rows={4}
                  />
                  <Button type="primary" onClick={handlePredictSEOScore} loading={loading} block>
                    Predict Score
                  </Button>
                </Space>
                {predictionResult && (
                  <div style={{ marginTop: 16 }}>
                    <Alert
                      message="SEO Score Prediction"
                      description={
                        <div>
                          <p><strong>Current Score:</strong> <Text style={{ color: getScoreColor(predictionResult.currentScore) }}>{predictionResult.currentScore}/100</Text></p>
                          <p><strong>Predicted Score:</strong> <Text style={{ color: getScoreColor(predictionResult.predictedScore) }}>{predictionResult.predictedScore}/100</Text></p>
                          <p><strong>Improvement:</strong> <Text type="success">+{predictionResult.improvement} points</Text></p>
                          <p><strong>Impact:</strong> <Tag color="purple">{predictionResult.impact}</Tag></p>
                        </div>
                      }
                      type="success"
                    />
                  </div>
                )}
              </Card>
            </Col>
          </Row>

          {recommendationsResult.length > 0 && (
            <Card title="AI Recommendations" style={{ marginTop: 16 }}>
              <Table
                dataSource={recommendationsResult}
                columns={recommendationColumns}
                rowKey="title"
                pagination={{ pageSize: 5 }}
                size="small"
              />
            </Card>
          )}
        </TabPane>

        <TabPane tab={<span><TrendingUpOutlined />Trends</span>} key="trends">
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={8}>
              <Card title="SEO Trends">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Input
                    placeholder="example.com"
                    value={trendsDomain}
                    onChange={(e) => setTrendsDomain(e.target.value)}
                    prefix={<GlobalOutlined />}
                  />
                  <Select
                    value={trendsDays}
                    onChange={setTrendsDays}
                    style={{ width: '100%' }}
                  >
                    <Option value="7">7 days</Option>
                    <Option value="30">30 days</Option>
                    <Option value="90">90 days</Option>
                  </Select>
                  <Button type="primary" onClick={handleGetSEOTrends} loading={loading} block>
                    Get Trends
                  </Button>
                </Space>
              </Card>
            </Col>
            <Col xs={24} lg={16}>
              <Card title="Performance Trends Chart">
                {trendsResult.length > 0 ? (
                  <Line {...trendsChartConfig} />
                ) : (
                  <Empty description="No trend data available" />
                )}
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane tab={<span><RobotOutlined />AI Model</span>} key="ai">
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={8}>
              <Card title="Model Status">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div>
                    <Text strong>Model Status: </Text>
                    <Tag color={modelStatus?.loaded ? 'green' : 'red'}>
                      {modelStatus?.loaded ? 'Loaded' : 'Not Loaded'}
                    </Tag>
                  </div>
                  <div>
                    <Text strong>Training Status: </Text>
                    <Tag color={modelStatus?.training ? 'orange' : 'blue'}>
                      {modelStatus?.training ? 'Training' : 'Idle'}
                    </Tag>
                  </div>
                  <div>
                    <Text strong>Training Samples: </Text>
                    <Text>{modelStatus?.metrics?.trainingSamples || 0}</Text>
                  </div>
                  <div>
                    <Text strong>Model Accuracy: </Text>
                    <Text>{modelStatus?.metrics?.validationAccuracy ? `${(modelStatus.metrics.validationAccuracy * 100).toFixed(1)}%` : '0%'}</Text>
                  </div>
                  <Button type="primary" onClick={handleTrainModel} loading={loading} block>
                    Train Model
                  </Button>
                  <Button onClick={getModelStatus} block>
                    Refresh Status
                  </Button>
                </Space>
              </Card>
            </Col>
            <Col xs={24} lg={8}>
              <Card title="Model Performance">
                {modelStatus?.metrics ? (
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <div>
                      <Text strong>Training Loss: </Text>
                      <Text>{modelStatus.metrics.loss?.toFixed(4) || 'N/A'}</Text>
                    </div>
                    <div>
                      <Text strong>Mean Absolute Error: </Text>
                      <Text>{modelStatus.metrics.mae?.toFixed(4) || 'N/A'}</Text>
                    </div>
                    <div>
                      <Text strong>Last Updated: </Text>
                      <Text>{modelStatus.metrics.lastUpdated ? new Date(modelStatus.metrics.lastUpdated).toLocaleString() : 'N/A'}</Text>
                    </div>
                  </Space>
                ) : (
                  <Empty description="No metrics available" />
                )}
              </Card>
            </Col>
            <Col xs={24} lg={8}>
              <Card title="Continuous Learning">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div>
                    <Text strong>Learning Interval: </Text>
                    <Text>24 hours</Text>
                  </div>
                  <div>
                    <Text strong>Last Learning: </Text>
                    <Text>Never</Text>
                  </div>
                  <div>
                    <Text strong>Next Learning: </Text>
                    <Text>-</Text>
                  </div>
                  <Button type="primary" block>
                    Trigger Learning
                  </Button>
                </Space>
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane tab={<span><SettingOutlined />Settings</span>} key="settings">
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={8}>
              <Card title="SEO Configuration">
                <Form layout="vertical">
                  <Form.Item label="SEO API URL">
                    <Input
                      value={seoConfig.apiUrl}
                      onChange={(e) => setSeoConfig({ ...seoConfig, apiUrl: e.target.value })}
                      prefix={<ApiOutlined />}
                    />
                  </Form.Item>
                  <Form.Item label="API Key">
                    <Input.Password
                      value={seoConfig.apiKey}
                      onChange={(e) => setSeoConfig({ ...seoConfig, apiKey: e.target.value })}
                      prefix={<KeyOutlined />}
                    />
                  </Form.Item>
                  <Form.Item label="Analysis Interval (minutes)">
                    <Input type="number" defaultValue={30} min={5} max={1440} />
                  </Form.Item>
                  <Button type="primary" block>
                    Save Settings
                  </Button>
                </Form>
              </Card>
            </Col>
            <Col xs={24} lg={8}>
              <Card title="API Key Management">
                <Form layout="vertical">
                  <Form.Item label="Owner Email">
                    <Input placeholder="user@example.com" prefix={<DatabaseOutlined />} />
                  </Form.Item>
                  <Form.Item label="Request Limit">
                    <Input type="number" defaultValue={1000} min={100} max={10000} />
                  </Form.Item>
                  <Button type="primary" block>
                    Create API Key
                  </Button>
                </Form>
              </Card>
            </Col>
            <Col xs={24} lg={8}>
              <Card title="Database Management">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Button icon={<DeleteOutlined />} block>
                    Cleanup Old Data
                  </Button>
                  <Button icon={<DownloadOutlined />} block>
                    Export Data
                  </Button>
                  <Button icon={<DatabaseOutlined />} block>
                    Backup Database
                  </Button>
                </Space>
              </Card>
            </Col>
          </Row>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default SEODashboard;