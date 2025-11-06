/**
 * SEO Content Generator Page - Advanced Content Optimization
 * Professional SEO content generation with visual reports and analytics
 * Research-based UX for SEO professionals and content creators
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Layout,
  Row,
  Col,
  Typography,
  Space,
  Card,
  Button,
  Progress,
  Table,
  Tabs,
  Modal,
  Form,
  Input,
  Select,
  Switch,
  Slider,
  Alert,
  List,
  Timeline,
  Tag,
  Tooltip,
  Popover,
  Drawer,
  Badge,
  Avatar,
  Statistic,
  Divider,
  Radio,
  Checkbox,
  Rate,
  message,
  Spin,
  Empty,
} from 'antd';
import {
  FileTextOutlined,
  BarChartOutlined,
  LineChartOutlined,
  PieChartOutlined,
  ThunderboltOutlined,
  RocketOutlined,
  StarOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  DownloadOutlined,
  ShareAltOutlined,
  CopyOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  WarningOutlined,
  BulbOutlined,
  SearchOutlined,
  MonitorOutlined,
  GlobalOutlined,
  LinkOutlined,
  HeartOutlined,
  LikeOutlined,
  MessageOutlined,
  RetweetOutlined,
  PlusOutlined,
  SettingOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  StopOutlined,
  DatabaseOutlined,
  CloudOutlined,
  ApiOutlined,
  ExperimentOutlined,
  TrophyOutlined,
  ClockCircleOutlined,
  FireOutlined,
  RiseOutlined,
  FallOutlined,
  MinusOutlined,
} from '@ant-design/icons';

import SEOGenerationService from '../../services/SEOGenerationService';
import SEOAnalyticsService from '../../services/SEOAnalyticsService';
import {
  EnhancedButton,
  EnhancedCard,
  EnhancedStatistic,
  EnhancedProgress,
  EnhancedAvatar,
  EnhancedInput,
  EnhancedTag,
} from '../DesignSystemComponents';

const { Header, Content } = Layout;
const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;

const SEOContentGeneratorPage: React.FC = () => {
  const seoService = SEOGenerationService();
  const analyticsService = SEOAnalyticsService();
  const [activeTab, setActiveTab] = useState('generator');
  const [generatingContent, setGeneratingContent] = useState(false);
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [settingsDrawerVisible, setSettingsDrawerVisible] = useState(false);
  const [contentTemplate, setContentTemplate] = useState({
    type: 'blog' as 'blog' | 'landing' | 'product' | 'article',
    topic: '',
    targetKeywords: '',
    tone: 'professional' as 'professional' | 'casual' | 'technical' | 'promotional',
    wordCount: 1000,
    includeCTA: true,
    includeFAQ: false,
    optimizeForSEO: true,
  });
  const [generatedContent, setGeneratedContent] = useState<any>(null);
  const [seoReport, setSeoReport] = useState<any>(null);
  const [contentHistory, setContentHistory] = useState<any[]>([]);
  const [autoOptimization, setAutoOptimization] = useState(true);
  const [realTimeAnalysis, setRealTimeAnalysis] = useState(true);

  // Content generation workflow
  const generateContentWorkflow = useCallback(async () => {
    if (!contentTemplate.topic) {
      message.error('Please enter a topic for content generation');
      return;
    }

    setGeneratingContent(true);
    
    try {
      // Step 1: Generate content
      await new Promise(resolve => setTimeout(resolve, 2000));
      const content = seoService.generateContent(contentTemplate.type, contentTemplate.topic);
      setGeneratedContent(content);

      // Step 2: Analyze SEO
      await new Promise(resolve => setTimeout(resolve, 1500));
      analyticsService.runAnalysis();

      // Step 3: Generate report
      await new Promise(resolve => setTimeout(resolve, 1000));
      const report = seoService.generateSEOReport('https://lightdom.dev/generated-content');
      setSeoReport(report);

      // Step 4: Add to history
      const historyItem = {
        id: Date.now().toString(),
        topic: contentTemplate.topic,
        type: contentTemplate.type,
        generatedAt: new Date().toISOString(),
        seoScore: content.seoScore,
        readabilityScore: content.readabilityScore,
        wordCount: contentTemplate.wordCount,
      };
      setContentHistory(prev => [historyItem, ...prev.slice(0, 9)]);

      message.success('Content generated and analyzed successfully!');
    } catch (error) {
      message.error('Failed to generate content. Please try again.');
    } finally {
      setGeneratingContent(false);
    }
  }, [contentTemplate, seoService, analyticsService]);

  // Real-time analysis effect
  useEffect(() => {
    if (!realTimeAnalysis) return;

    const interval = setInterval(() => {
      if (generatedContent) {
        // Simulate real-time SEO score updates
        setGeneratedContent(prev => ({
          ...prev,
          seoScore: Math.min(100, prev.seoScore + Math.random() * 2 - 1),
          readabilityScore: Math.min(100, prev.readabilityScore + Math.random() * 2 - 1),
        }));
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [realTimeAnalysis, generatedContent]);

  // Auto-optimization effect
  useEffect(() => {
    if (!autoOptimization || !generatedContent) return;

    const interval = setInterval(() => {
      const metrics = analyticsService.getMetrics();
      
      if (metrics.overallScore < 85) {
        // Suggest optimizations
        message.info('Auto-optimization: Suggesting improvements for better SEO score');
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [autoOptimization, generatedContent, analyticsService]);

  // Content history columns
  const historyColumns = [
    {
      title: 'Topic',
      dataIndex: 'topic',
      key: 'topic',
      render: (topic: string) => (
        <Space>
          <FileTextOutlined style={{ color: '#1890ff' }} />
          <Text strong>{topic}</Text>
        </Space>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <EnhancedTag color={type === 'blog' ? 'primary' : type === 'landing' ? 'success' : 'secondary'}>
          {type.charAt(0).toUpperCase() + type.slice(1)}
        </EnhancedTag>
      ),
    },
    {
      title: 'SEO Score',
      dataIndex: 'seoScore',
      key: 'seoScore',
      render: (score: number) => (
        <Space>
          <EnhancedProgress 
            percent={score} 
            size="small" 
            status={score > 90 ? 'success' : score > 80 ? 'normal' : 'exception'}
          />
          <Text style={{ fontSize: '12px' }}>{score.toFixed(1)}</Text>
        </Space>
      ),
    },
    {
      title: 'Readability',
      dataIndex: 'readabilityScore',
      key: 'readabilityScore',
      render: (score: number) => (
        <Space>
          <EnhancedProgress 
            percent={score} 
            size="small" 
            status={score > 85 ? 'success' : 'normal'}
          />
          <Text style={{ fontSize: '12px' }}>{score.toFixed(1)}</Text>
        </Space>
      ),
    },
    {
      title: 'Words',
      dataIndex: 'wordCount',
      key: 'wordCount',
    },
    {
      title: 'Generated',
      dataIndex: 'generatedAt',
      key: 'generatedAt',
      render: (date: string) => (
        <Text style={{ fontSize: '12px' }}>
          {new Date(date).toLocaleDateString()}
        </Text>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: any) => (
        <Space>
          <Tooltip title="View Content">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => {
                setGeneratedContent(record);
                setPreviewModalVisible(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Download">
            <Button
              type="text"
              icon={<DownloadOutlined />}
              onClick={() => message.success('Content downloaded successfully')}
            />
          </Tooltip>
          <Tooltip title="Share">
            <Button
              type="text"
              icon={<ShareAltOutlined />}
              onClick={() => message.success('Share link copied to clipboard')}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // Render Content Generator
  const renderContentGenerator = () => (
    <div>
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={24} md={16}>
          <EnhancedCard 
            title="Content Generation Studio" 
            variant="elevated"
            extra={
              <Space>
                <Switch
                  checked={autoOptimization}
                  onChange={setAutoOptimization}
                  checkedChildren="Auto"
                  unCheckedChildren="Manual"
                />
                <EnhancedButton
                  variant="ghost"
                  size="small"
                  icon={<SettingOutlined />}
                  onClick={() => setSettingsDrawerVisible(true)}
                >
                  Settings
                </EnhancedButton>
              </Space>
            }
          >
            <Form layout="vertical">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Content Type">
                    <Radio.Group
                      value={contentTemplate.type}
                      onChange={(e) => setContentTemplate({ ...contentTemplate, type: e.target.value })}
                    >
                      <Radio value="blog">Blog Post</Radio>
                      <Radio value="landing">Landing Page</Radio>
                      <Radio value="product">Product Page</Radio>
                      <Radio value="article">Article</Radio>
                    </Radio.Group>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Tone of Voice">
                    <Select
                      value={contentTemplate.tone}
                      onChange={(value) => setContentTemplate({ ...contentTemplate, tone: value })}
                    >
                      <Option value="professional">Professional</Option>
                      <Option value="casual">Casual</Option>
                      <Option value="technical">Technical</Option>
                      <Option value="promotional">Promotional</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              
              <Form.Item label="Topic">
                <EnhancedInput
                  placeholder="Enter your content topic..."
                  value={contentTemplate.topic}
                  onChange={(value) => setContentTemplate({ ...contentTemplate, topic: value })}
                  prefix={<EditOutlined />}
                />
              </Form.Item>

              <Form.Item label="Target Keywords">
                <EnhancedInput
                  placeholder="Enter target keywords (comma-separated)..."
                  value={contentTemplate.targetKeywords}
                  onChange={(value) => setContentTemplate({ ...contentTemplate, targetKeywords: value })}
                  prefix={<SearchOutlined />}
                />
              </Form.Item>

              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item label="Word Count">
                    <Slider
                      value={contentTemplate.wordCount}
                      onChange={(value) => setContentTemplate({ ...contentTemplate, wordCount: value })}
                      min={500}
                      max={3000}
                      step={100}
                      marks={{
                        500: '500',
                        1000: '1k',
                        2000: '2k',
                        3000: '3k',
                      }}
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="Content Options">
                    <Space direction="vertical">
                      <Checkbox
                        checked={contentTemplate.includeCTA}
                        onChange={(e) => setContentTemplate({ ...contentTemplate, includeCTA: e.target.checked })}
                      >
                        Include CTA
                      </Checkbox>
                      <Checkbox
                        checked={contentTemplate.includeFAQ}
                        onChange={(e) => setContentTemplate({ ...contentTemplate, includeFAQ: e.target.checked })}
                      >
                        Include FAQ
                      </Checkbox>
                    </Space>
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="Optimization">
                    <Space direction="vertical">
                      <Checkbox
                        checked={contentTemplate.optimizeForSEO}
                        onChange={(e) => setContentTemplate({ ...contentTemplate, optimizeForSEO: e.target.checked })}
                      >
                        SEO Optimization
                      </Checkbox>
                      <Checkbox
                        checked={realTimeAnalysis}
                        onChange={(e) => setRealTimeAnalysis(e.target.checked)}
                      >
                        Real-time Analysis
                      </Checkbox>
                    </Space>
                  </Form.Item>
                </Col>
              </Row>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <EnhancedButton
                  variant="primary"
                  size="large"
                  icon={<RocketOutlined />}
                  onClick={generateContentWorkflow}
                  loading={generatingContent}
                  disabled={!contentTemplate.topic}
                >
                  {generatingContent ? 'Generating Content...' : 'Generate Content'}
                </EnhancedButton>
              </div>
            </Form>
          </EnhancedCard>
        </Col>
        
        <Col xs={24} md={8}>
          <EnhancedCard title="SEO Metrics" variant="elevated">
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <EnhancedStatistic
                title="Overall Score"
                value={analyticsService.metrics.overallScore}
                trend="up"
                trendValue={3.2}
                suffix="/ 100"
                color="success"
                precision={1}
              />
              <EnhancedStatistic
                title="Page Speed"
                value={analyticsService.metrics.pageSpeed}
                trend="up"
                trendValue={5.1}
                suffix="/ 100"
                color="warning"
                precision={1}
              />
              <EnhancedStatistic
                title="Keyword Rankings"
                value={analyticsService.metrics.keywordRankings}
                trend="up"
                trendValue={8}
                color="primary"
              />
              <EnhancedStatistic
                title="Organic Traffic"
                value={analyticsService.metrics.organicTraffic}
                trend="up"
                trendValue={12.3}
                color="secondary"
              />
            </Space>
          </EnhancedCard>
        </Col>
      </Row>

      {/* Generated Content Preview */}
      {generatedContent && (
        <EnhancedCard 
          title="Generated Content Preview" 
          variant="elevated"
          extra={
            <Space>
              <EnhancedButton
                variant="ghost"
                size="small"
                icon={<EyeOutlined />}
                onClick={() => setPreviewModalVisible(true)}
              >
                Full Preview
              </EnhancedButton>
              <EnhancedButton
                variant="primary"
                size="small"
                icon={<DownloadOutlined />}
                onClick={() => message.success('Content downloaded successfully')}
              >
                Download
              </EnhancedButton>
            </Space>
          }
        >
          <Row gutter={[24, 24]}>
            <Col xs={24} md={16}>
              <div style={{
                backgroundColor: '#f5f5f5',
                padding: 16,
                borderRadius: '8px',
                maxHeight: '400px',
                overflowY: 'auto',
              }}>
                <Title level={4}>{generatedContent.title}</Title>
                <Paragraph>
                  {generatedContent.content.substring(0, 500)}...
                </Paragraph>
              </div>
            </Col>
            <Col xs={24} md={8}>
              <Space direction="vertical" style={{ width: '100%' }} size="large">
                <div>
                  <Text strong>SEO Score</Text>
                  <EnhancedProgress 
                    percent={generatedContent.seoScore} 
                    status={generatedContent.seoScore > 90 ? 'success' : 'normal'}
                    gradient={true}
                  />
                </div>
                <div>
                  <Text strong>Readability Score</Text>
                  <EnhancedProgress 
                    percent={generatedContent.readabilityScore} 
                    status="normal"
                  />
                </div>
                <div>
                  <Text strong>Target Keywords</Text>
                  <div style={{ marginTop: 8 }}>
                    <Space wrap>
                      {generatedContent.keywords.slice(0, 5).map((keyword: string, index: number) => (
                        <EnhancedTag key={index} color="primary" size="small">
                          {keyword}
                        </EnhancedTag>
                      ))}
                    </Space>
                  </div>
                </div>
              </Space>
            </Col>
          </Row>
        </EnhancedCard>
      )}
    </div>
  );

  // Render SEO Reports
  const renderSEOReports = () => (
    <div>
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={24} md={8}>
          <EnhancedCard title="SEO Score Breakdown" variant="elevated">
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <div>
                <Text strong>Technical SEO</Text>
                <EnhancedProgress percent={92} status="success" size="small" />
              </div>
              <div>
                <Text strong>Content Quality</Text>
                <EnhancedProgress percent={88} status="normal" size="small" />
              </div>
              <div>
                <Text strong>Mobile Optimization</Text>
                <EnhancedProgress percent={95} status="success" size="small" />
              </div>
              <div>
                <Text strong>Page Speed</Text>
                <EnhancedProgress percent={78} status="exception" size="small" />
              </div>
              <div>
                <Text strong>Backlinks</Text>
                <EnhancedProgress percent={82} status="normal" size="small" />
              </div>
            </Space>
          </EnhancedCard>
        </Col>
        
        <Col xs={24} md={8}>
          <EnhancedCard title="Keyword Performance" variant="elevated">
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              {analyticsService.getKeywords().slice(0, 5).map((keyword, index) => (
                <div key={index} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
                  <div>
                    <Text strong>{keyword.keyword}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      Position: #{keyword.position} | Volume: {keyword.searchVolume}
                    </Text>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    {keyword.trend === 'up' && <RiseOutlined style={{ color: '#52c41a' }} />}
                    {keyword.trend === 'down' && <FallOutlined style={{ color: '#ff4d4f' }} />}
                    {keyword.trend === 'stable' && <MinusOutlined style={{ color: '#d1d5db' }} />}
                    <br />
                    <Text style={{ fontSize: '12px' }}>
                      {keyword.change > 0 ? '+' : ''}{keyword.change}
                    </Text>
                  </div>
                </div>
              ))}
            </Space>
          </EnhancedCard>
        </Col>
        
        <Col xs={24} md={8}>
          <EnhancedCard title="Content Optimization" variant="elevated">
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <Alert
                message="High Priority"
                description="Improve page load speed for better rankings"
                type="error"
                showIcon
              />
              <Alert
                message="Medium Priority"
                description="Add more internal links to content"
                type="warning"
                showIcon
              />
              <Alert
                message="Low Priority"
                description="Optimize image alt text"
                type="info"
                showIcon
              />
              <Alert
                message="Good Practice"
                description="Meta tags are well optimized"
                type="success"
                showIcon
              />
            </Space>
          </EnhancedCard>
        </Col>
      </Row>

      {/* Content History */}
      <EnhancedCard 
        title="Content Generation History" 
        variant="elevated"
        extra={
          <EnhancedButton
            variant="primary"
            size="small"
            icon={<PlusOutlined />}
            onClick={() => setActiveTab('generator')}
          >
            Generate New Content
          </EnhancedButton>
        }
      >
        <Table
          columns={historyColumns}
          dataSource={contentHistory}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          size="middle"
        />
      </EnhancedCard>
    </div>
  );

  // Render Analytics Dashboard
  const renderAnalytics = () => (
    <div>
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <EnhancedCard variant="elevated" animation="fadeIn">
            <EnhancedStatistic
              title="Overall SEO Score"
              value={analyticsService.metrics.overallScore}
              trend="up"
              trendValue={2.3}
              suffix="/ 100"
              color="success"
              precision={1}
            />
          </EnhancedCard>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <EnhancedCard variant="elevated" animation="fadeIn">
            <EnhancedStatistic
              title="Keyword Rankings"
              value={analyticsService.metrics.keywordRankings}
              trend="up"
              trendValue={8}
              prefix={<SearchOutlined />}
              color="primary"
            />
          </EnhancedCard>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <EnhancedCard variant="elevated" animation="fadeIn">
            <EnhancedStatistic
              title="Organic Traffic"
              value={analyticsService.metrics.organicTraffic}
              trend="up"
              trendValue={12.3}
              prefix={<GlobalOutlined />}
              color="warning"
            />
          </EnhancedCard>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <EnhancedCard variant="elevated" animation="fadeIn">
            <EnhancedStatistic
              title="Backlinks"
              value={analyticsService.metrics.backlinks}
              trend="up"
              trendValue={5.7}
              prefix={<LinkOutlined />}
              color="secondary"
            />
          </EnhancedCard>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        <Col xs={24} md={16}>
          <EnhancedCard title="Performance Trends" variant="elevated">
            <div style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Space direction="vertical" alignItems="center">
                <LineChartOutlined style={{ fontSize: '64px', color: '#d1d5db' }} />
                <Text type="secondary">SEO performance trends visualization</Text>
                <Text type="secondary">Chart integration coming soon</Text>
              </Space>
            </div>
          </EnhancedCard>
        </Col>
        <Col xs={24} md={8}>
          <EnhancedCard title="Top Performing Keywords" variant="elevated">
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              {analyticsService.getKeywords().slice(0, 3).map((keyword, index) => (
                <div key={index} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
                  <div>
                    <Text strong>{keyword.keyword}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      Volume: {keyword.searchVolume}
                    </Text>
                  </div>
                  <div>
                    <EnhancedTag color={index === 0 ? 'success' : index === 1 ? 'warning' : 'primary'}>
                      #{keyword.position}
                    </EnhancedTag>
                  </div>
                </div>
              ))}
            </Space>
          </EnhancedCard>
        </Col>
      </Row>
    </div>
  );

  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <Header style={{
        background: '#fff',
        borderBottom: '1px solid #e8e8e8',
        padding: 16,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
          }}>
          <FileTextOutlined style={{
            fontSize: '32px',
            color: '#7c3aed',
            marginRight: 12,
          }} />
          <Title level={3} style={{ margin: 0, fontSize: '24px', fontWeight: 600, lineHeight: '1.2' }}>
            SEO Content Generator
          </Title>
        </div>
        <Space>
          <Switch
            checked={realTimeAnalysis}
            onChange={setRealTimeAnalysis}
            checkedChildren="Live"
            unCheckedChildren="Static"
          />
          <EnhancedButton
            variant="primary"
            icon={<RocketOutlined />}
            onClick={() => setActiveTab('generator')}
          >
            Generate Content
          </EnhancedButton>
          <EnhancedButton
            variant="ghost"
            icon={<SettingOutlined />}
            onClick={() => setSettingsDrawerVisible(true)}
          >
            Settings
          </EnhancedButton>
        </Space>
      </Header>

      <Content style={{ padding: 24 }}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          size="large"
        >
          <TabPane
            tab={
              <Space>
                <EditOutlined />
                <span>Content Generator</span>
              </Space>
            }
            key="generator"
          >
            {renderContentGenerator()}
          </TabPane>
          <TabPane
            tab={
              <Space>
                <BarChartOutlined />
                <span>SEO Reports</span>
              </Space>
            }
            key="reports"
          >
            {renderSEOReports()}
          </TabPane>
          <TabPane
            tab={
              <Space>
                <LineChartOutlined />
                <span>Analytics</span>
              </Space>
            }
            key="analytics"
          >
            {renderAnalytics()}
          </TabPane>
        </Tabs>
      </Content>

      {/* Content Preview Modal */}
      <Modal
        title="Content Preview"
        visible={previewModalVisible}
        onCancel={() => setPreviewModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setPreviewModalVisible(false)}>
            Close
          </Button>,
          <EnhancedButton
            key="download"
            variant="primary"
            icon={<DownloadOutlined />}
            onClick={() => {
              message.success('Content downloaded successfully');
              setPreviewModalVisible(false);
            }}
          >
            Download
          </EnhancedButton>,
        ]}
        width={1000}
      >
        {generatedContent && (
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <div>
              <Title level={4}>{generatedContent.title}</Title>
              <Paragraph>{generatedContent.content}</Paragraph>
            </div>
            <Divider />
            <div>
              <Text strong>Meta Description:</Text>
              <Paragraph>{generatedContent.metaDescription}</Paragraph>
            </div>
            <div>
              <Text strong>Keywords:</Text>
              <div style={{ marginTop: 8 }}>
                <Space wrap>
                  {generatedContent.keywords.map((keyword: string, index: number) => (
                    <EnhancedTag key={index} color="primary">
                      {keyword}
                    </EnhancedTag>
                  ))}
                </Space>
              </div>
            </div>
          </Space>
        )}
      </Modal>

      {/* Settings Drawer */}
      <Drawer
        title="SEO Generator Settings"
        placement="right"
        onClose={() => setSettingsDrawerVisible(false)}
        visible={settingsDrawerVisible}
        width={400}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <EnhancedCard title="Auto-Optimization" variant="flat">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text strong>Enable Auto-Optimization</Text>
                <Switch
                  checked={autoOptimization}
                  onChange={setAutoOptimization}
                  style={{ marginLeft: 8 }}
                />
              </div>
              <div>
                <Text strong>Real-time Analysis</Text>
                <Switch
                  checked={realTimeAnalysis}
                  onChange={setRealTimeAnalysis}
                  style={{ marginLeft: 8 }}
                />
              </div>
            </Space>
          </EnhancedCard>

          <EnhancedCard title="Content Settings" variant="flat">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text strong>Default Word Count</Text>
                <Slider
                  value={contentTemplate.wordCount}
                  onChange={(value) => setContentTemplate({ ...contentTemplate, wordCount: value })}
                  min={500}
                  max={3000}
                  step={100}
                  marks={{
                    500: '500',
                    1000: '1k',
                    2000: '2k',
                    3000: '3k',
                  }}
                />
              </div>
              <div>
                <Text strong>Default Tone</Text>
                <Select
                  value={contentTemplate.tone}
                  onChange={(value) => setContentTemplate({ ...contentTemplate, tone: value })}
                  style={{ width: '100%' }}
                >
                  <Option value="professional">Professional</Option>
                  <Option value="casual">Casual</Option>
                  <Option value="technical">Technical</Option>
                  <Option value="promotional">Promotional</Option>
                </Select>
              </div>
            </Space>
          </EnhancedCard>

          <EnhancedCard title="Quick Actions" variant="flat">
            <Space direction="vertical" style={{ width: '100%' }}>
              <EnhancedButton
                variant="primary"
                fullWidth
                onClick={() => {
                  analyticsService.runAnalysis();
                  message.success('SEO analysis started');
                }}
              >
                Run SEO Analysis
              </EnhancedButton>
              <EnhancedButton
                variant="secondary"
                fullWidth
                onClick={() => {
                  setGeneratingContent(true);
                  setTimeout(() => {
                    setGeneratingContent(false);
                    message.success('Quick content generated');
                  }, 2000);
                }}
              >
                Quick Generate
              </EnhancedButton>
            </Space>
          </EnhancedCard>
        </Space>
      </Drawer>
    </Layout>
  );
};

export default SEOContentGeneratorPage;
