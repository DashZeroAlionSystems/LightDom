/**
 * Advanced SEO Content Generator with TensorFlow Integration
 * AI-powered content generation with real-time optimization
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Row,
  Col,
  Typography,
  Button,
  Input,
  Form,
  Select,
  Slider,
  Switch,
  Progress,
  Tabs,
  Table,
  Tag,
  Space,
  Alert,
  Modal,
  message,
  Spin,
  Statistic,
  Divider,
  List,
  Avatar,
  Tooltip,
  Badge,
  Rate,
  DatePicker,
  Upload,
  Drawer,
  Collapse,
  Timeline,
  Empty,
} from 'antd';
import {
  RobotOutlined,
  ThunderboltOutlined,
  SearchOutlined,
  EditOutlined,
  EyeOutlined,
  DownloadOutlined,
  UploadOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  StarOutlined,
  TrophyOutlined,
  RocketOutlined,
  BarChartOutlined,
  LineChartOutlined,
  PieChartOutlined,
  DatabaseOutlined,
  CloudOutlined,
  SettingOutlined,
  BulbOutlined,
  FireOutlined,
  CrownOutlined,
  DiamondOutlined,
  ExperimentOutlined,
  ApiOutlined,
  GlobalOutlined,
  FileTextOutlined,
  CodeOutlined,
  BugOutlined,
  SafetyOutlined,
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { TabPane } = Tabs;
const { Panel } = Collapse;
const { RangePicker } = DatePicker;

// Enhanced color system
const Colors = {
  primary: '#7c3aed',
  primaryLight: '#a78bfa',
  secondary: '#06b6d4',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
  surface: '#1f2937',
  surfaceLight: '#374151',
  background: '#111827',
  text: '#f9fafb',
  textSecondary: '#d1d5db',
  textTertiary: '#9ca3af',
  border: '#374151',
  gradients: {
    primary: 'linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)',
    secondary: 'linear-gradient(135deg, #06b6d4 0%, #67e8f9 100%)',
    success: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
    warning: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
    error: 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)',
  }
};

const Spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  xxl: '48px',
};

interface SEOContentData {
  title: string;
  description: string;
  keywords: string[];
  headings: string[];
  content: string;
  schema: any;
  score: number;
  suggestions: string[];
}

interface ModelTrainingData {
  accuracy: number;
  loss: number;
  epochs: number;
  trainingTime: number;
  samples: number;
  features: string[];
}

interface GenerationHistory {
  id: string;
  timestamp: string;
  url: string;
  score: number;
  status: 'completed' | 'processing' | 'failed';
  content: SEOContentData;
}

const SEOContentGenerator: React.FC = () => {
  // State management
  const [loading, setLoading] = useState(false);
  const [training, setTraining] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('generator');
  const [modelData, setModelData] = useState<ModelTrainingData | null>(null);
  const [generatedContent, setGeneratedContent] = useState<SEOContentData | null>(null);
  const [generationHistory, setGenerationHistory] = useState<GenerationHistory[]>([]);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [advancedSettings, setAdvancedSettings] = useState(false);

  // Form state
  const [form] = Form.useForm();
  const [targetUrl, setTargetUrl] = useState('');
  const [contentType, setContentType] = useState('blog');
  const [tone, setTone] = useState('professional');
  const [length, setLength] = useState(500);
  const [focusKeywords, setFocusKeywords] = useState('');
  const [targetAudience, setTargetAudience] = useState('general');
  const [optimizeForSEO, setOptimizeForSEO] = useState(true);
  const [includeSchema, setIncludeSchema] = useState(true);
  const [generateMeta, setGenerateMeta] = useState(true);

  // Model configuration
  const [modelConfig, setModelConfig] = useState({
    temperature: 0.7,
    maxTokens: 1000,
    topP: 0.9,
    frequencyPenalty: 0.5,
    presencePenalty: 0.5,
  });

  // Fetch model data
  const fetchModelData = useCallback(async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API call
      const mockData: ModelTrainingData = {
        accuracy: 92.3 + Math.random() * 5,
        loss: 0.15 + Math.random() * 0.1,
        epochs: 100,
        trainingTime: 3600,
        samples: 50000,
        features: ['title', 'description', 'keywords', 'headings', 'content', 'schema'],
      };
      setModelData(mockData);
    } catch (error) {
      console.error('Failed to fetch model data:', error);
      message.error('Failed to load model data');
    } finally {
      setLoading(false);
    }
  }, []);

  // Generate SEO content
  const generateContent = useCallback(async () => {
    if (!targetUrl) {
      message.error('Please enter a target URL');
      return;
    }

    try {
      setGenerating(true);
      
      // Mock generation - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const mockContent: SEOContentData = {
        title: 'Ultimate Guide to SEO Optimization in 2024',
        description: 'Discover the latest SEO strategies and techniques to boost your website rankings and drive organic traffic.',
        keywords: ['SEO optimization', 'website ranking', 'organic traffic', 'search engine optimization'],
        headings: [
          'Introduction to Modern SEO',
          'Key Ranking Factors',
          'Content Optimization Strategies',
          'Technical SEO Best Practices',
          'Measuring SEO Success'
        ],
        content: `# Ultimate Guide to SEO Optimization in 2024

## Introduction to Modern SEO
Search engine optimization has evolved significantly over the years. In 2024, it's not just about keywords anymore; it's about creating comprehensive, user-focused content that satisfies search intent.

## Key Ranking Factors
- Content quality and relevance
- User experience signals
- Mobile optimization
- Page speed and performance
- Backlink profile
- Technical SEO health

## Content Optimization Strategies
Creating high-quality content that ranks requires a strategic approach. Focus on user intent, comprehensive coverage of topics, and natural keyword integration.

## Technical SEO Best Practices
Ensure your website is technically sound with proper site structure, fast loading times, and mobile-friendly design.

## Measuring SEO Success
Track your SEO performance with key metrics like organic traffic, keyword rankings, and conversion rates.`,
        schema: {
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: 'Ultimate Guide to SEO Optimization in 2024',
          description: 'Discover the latest SEO strategies and techniques',
          author: {
            '@type': 'Organization',
            name: 'LightDom SEO'
          },
          datePublished: new Date().toISOString(),
        },
        score: 85 + Math.random() * 15,
        suggestions: [
          'Add more internal links to related content',
          'Include relevant LSI keywords',
          'Optimize meta description for better CTR',
          'Add structured data for breadcrumbs',
          'Include social sharing buttons'
        ],
      };
      
      setGeneratedContent(mockContent);
      
      // Add to history
      const historyItem: GenerationHistory = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        url: targetUrl,
        score: mockContent.score,
        status: 'completed',
        content: mockContent,
      };
      
      setGenerationHistory(prev => [historyItem, ...prev.slice(0, 9)]);
      message.success('SEO content generated successfully!');
      
    } catch (error) {
      console.error('Failed to generate content:', error);
      message.error('Failed to generate content');
    } finally {
      setGenerating(false);
    }
  }, [targetUrl, contentType, tone, length, focusKeywords, targetAudience]);

  // Train model
  const trainModel = useCallback(async () => {
    try {
      setTraining(true);
      
      // Mock training - replace with actual API call
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 500));
        setModelData(prev => prev ? {
          ...prev,
          accuracy: 85 + (i * 0.15),
          loss: 0.3 - (i * 0.0015),
          epochs: i,
        } : null);
      }
      
      message.success('Model training completed successfully!');
    } catch (error) {
      console.error('Failed to train model:', error);
      message.error('Failed to train model');
    } finally {
      setTraining(false);
    }
  }, []);

  // Initialize component
  useEffect(() => {
    fetchModelData();
  }, [fetchModelData]);

  // Render content generator tab
  const renderGenerator = () => (
    <Row gutter={[Spacing.lg, Spacing.lg]}>
      <Col xs={24} lg={12}>
        <Card
          title={
            <Space>
              <EditOutlined style={{ color: Colors.primary }} />
              <span>Content Configuration</span>
            </Space>
          }
          style={{
            backgroundColor: Colors.surface,
            border: `1px solid ${Colors.border}`,
            borderRadius: '12px',
          }}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={generateContent}
          >
            <Form.Item label="Target URL" required>
              <Input
                placeholder="https://example.com"
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                prefix={<GlobalOutlined />}
              />
            </Form.Item>
            
            <Form.Item label="Content Type">
              <Select value={contentType} onChange={setContentType}>
                <Select.Option value="blog">Blog Post</Select.Option>
                <Select.Option value="article">Article</Select.Option>
                <Select.Option value="product">Product Description</Select.Option>
                <Select.Option value="landing">Landing Page</Select.Option>
                <Select.Option value="category">Category Page</Select.Option>
              </Select>
            </Form.Item>
            
            <Form.Item label="Tone of Voice">
              <Select value={tone} onChange={setTone}>
                <Select.Option value="professional">Professional</Select.Option>
                <Select.Option value="casual">Casual</Select.Option>
                <Select.Option value="friendly">Friendly</Select.Option>
                <Select.Option value="authoritative">Authoritative</Select.Option>
                <Select.Option value="conversational">Conversational</Select.Option>
              </Select>
            </Form.Item>
            
            <Form.Item label={`Content Length: ${length} words`}>
              <Slider
                min={100}
                max={2000}
                step={50}
                value={length}
                onChange={setLength}
              />
            </Form.Item>
            
            <Form.Item label="Focus Keywords">
              <Input
                placeholder="keyword1, keyword2, keyword3"
                value={focusKeywords}
                onChange={(e) => setFocusKeywords(e.target.value)}
                prefix={<SearchOutlined />}
              />
            </Form.Item>
            
            <Form.Item label="Target Audience">
              <Select value={targetAudience} onChange={setTargetAudience}>
                <Select.Option value="general">General</Select.Option>
                <Select.Option value="technical">Technical</Select.Option>
                <Select.Option value="business">Business</Select.Option>
                <Select.Option value="consumer">Consumer</Select.Option>
                <Select.Option value="enterprise">Enterprise</Select.Option>
              </Select>
            </Form.Item>
            
            <Divider />
            
            <Space direction="vertical" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ color: Colors.text }}>Optimize for SEO</Text>
                <Switch checked={optimizeForSEO} onChange={setOptimizeForSEO} />
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ color: Colors.text }}>Include Schema Markup</Text>
                <Switch checked={includeSchema} onChange={setIncludeSchema} />
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ color: Colors.text }}>Generate Meta Tags</Text>
                <Switch checked={generateMeta} onChange={setGenerateMeta} />
              </div>
            </Space>
            
            <Divider />
            
            <Button
              type="primary"
              htmlType="submit"
              loading={generating}
              icon={<RobotOutlined />}
              size="large"
              style={{
                background: Colors.gradients.primary,
                border: 'none',
                borderRadius: '8px',
                height: '48px',
                fontWeight: 600,
                width: '100%',
              }}
            >
              {generating ? 'Generating Content...' : 'Generate SEO Content'}
            </Button>
          </Form>
        </Card>
      </Col>
      
      <Col xs={24} lg={12}>
        <Card
          title={
            <Space>
              <EyeOutlined style={{ color: Colors.success }} />
              <span>Generated Content</span>
            </Space>
          }
          style={{
            backgroundColor: Colors.surface,
            border: `1px solid ${Colors.border}`,
            borderRadius: '12px',
          }}
        >
          {generating ? (
            <div style={{ textAlign: 'center', padding: Spacing.xxl }}>
              <Spin size="large" />
              <div style={{ marginTop: Spacing.lg }}>
                <Text style={{ color: Colors.text }}>AI is generating optimized content...</Text>
                <Progress percent={66} style={{ marginTop: Spacing.md }} />
              </div>
            </div>
          ) : generatedContent ? (
            <Space direction="vertical" style={{ width: '100%' }} size={Spacing.lg}>
              <div>
                <Text strong style={{ color: Colors.text }}>SEO Score</Text>
                <div style={{ display: 'flex', alignItems: 'center', marginTop: Spacing.sm }}>
                  <Progress
                    type="circle"
                    percent={Math.round(generatedContent.score)}
                    size={80}
                    strokeColor={Colors.gradients.success}
                  />
                  <div style={{ marginLeft: Spacing.lg }}>
                    <Rate disabled value={Math.round(generatedContent.score / 20)} />
                    <div>
                      <Text style={{ color: Colors.textSecondary }}>
                        {generatedContent.score >= 90 ? 'Excellent' : 
                         generatedContent.score >= 80 ? 'Good' : 
                         generatedContent.score >= 70 ? 'Fair' : 'Needs Improvement'}
                      </Text>
                    </div>
                  </div>
                </div>
              </div>
              
              <Collapse ghost>
                <Panel header="Title & Meta" key="meta">
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <div>
                      <Text strong style={{ color: Colors.text }}>Title:</Text>
                      <Paragraph style={{ color: Colors.textSecondary, marginBottom: 0 }}>
                        {generatedContent.title}
                      </Paragraph>
                    </div>
                    <div>
                      <Text strong style={{ color: Colors.text }}>Description:</Text>
                      <Paragraph style={{ color: Colors.textSecondary, marginBottom: 0 }}>
                        {generatedContent.description}
                      </Paragraph>
                    </div>
                    <div>
                      <Text strong style={{ color: Colors.text }}>Keywords:</Text>
                      <div style={{ marginTop: Spacing.xs }}>
                        {generatedContent.keywords.map((keyword, index) => (
                          <Tag key={index} color="blue" style={{ marginBottom: Spacing.xs }}>
                            {keyword}
                          </Tag>
                        ))}
                      </div>
                    </div>
                  </Space>
                </Panel>
                
                <Panel header="Content Structure" key="structure">
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Text strong style={{ color: Colors.text }}>Headings:</Text>
                    <List
                      size="small"
                      dataSource={generatedContent.headings}
                      renderItem={(heading, index) => (
                        <List.Item>
                          <Text style={{ color: Colors.textSecondary }}>
                            H{index + 2}: {heading}
                          </Text>
                        </List.Item>
                      )}
                    />
                  </Space>
                </Panel>
                
                <Panel header="Full Content" key="content">
                  <TextArea
                    value={generatedContent.content}
                    rows={10}
                    readOnly
                    style={{ backgroundColor: Colors.surfaceLight, border: `1px solid ${Colors.border}` }}
                  />
                </Panel>
                
                <Panel header="Schema Markup" key="schema">
                  <TextArea
                    value={JSON.stringify(generatedContent.schema, null, 2)}
                    rows={8}
                    readOnly
                    style={{ backgroundColor: Colors.surfaceLight, border: `1px solid ${Colors.border}` }}
                  />
                </Panel>
                
                <Panel header="Optimization Suggestions" key="suggestions">
                  <List
                    dataSource={generatedContent.suggestions}
                    renderItem={(suggestion) => (
                      <List.Item>
                        <Space>
                          <BulbOutlined style={{ color: Colors.warning }} />
                          <Text style={{ color: Colors.textSecondary }}>{suggestion}</Text>
                        </Space>
                      </List.Item>
                    )}
                  />
                </Panel>
              </Collapse>
              
              <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                <Button
                  icon={<DownloadOutlined />}
                  onClick={() => message.info('Downloading content...')}
                >
                  Download
                </Button>
                <Button
                  icon={<UploadOutlined />}
                  onClick={() => message.info('Uploading to website...')}
                >
                  Deploy to Site
                </Button>
                <Button
                  type="primary"
                  icon={<ReloadOutlined />}
                  onClick={generateContent}
                >
                  Regenerate
                </Button>
              </Space>
            </Space>
          ) : (
            <Empty
              description="No content generated yet"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          )}
        </Card>
      </Col>
    </Row>
  );

  // Render model training tab
  const renderTraining = () => (
    <Row gutter={[Spacing.lg, Spacing.lg]}>
      <Col xs={24} lg={16}>
        <Card
          title={
            <Space>
              <ExperimentOutlined style={{ color: Colors.primary }} />
              <span>Model Training Dashboard</span>
            </Space>
          }
          style={{
            backgroundColor: Colors.surface,
            border: `1px solid ${Colors.border}`,
            borderRadius: '12px',
          }}
        >
          <Row gutter={[Spacing.lg, Spacing.lg]}>
            <Col span={8}>
              <Statistic
                title="Model Accuracy"
                value={modelData?.accuracy || 0}
                suffix="%"
                prefix={<TrophyOutlined />}
                valueStyle={{ color: Colors.success }}
              />
            </Col>
            <Col span={8}>
              <Statistic
                title="Training Loss"
                value={modelData?.loss || 0}
                prefix={<LineChartOutlined />}
                valueStyle={{ color: Colors.error }}
              />
            </Col>
            <Col span={8}>
              <Statistic
                title="Training Samples"
                value={modelData?.samples || 0}
                prefix={<DatabaseOutlined />}
                valueStyle={{ color: Colors.info }}
              />
            </Col>
          </Row>
          
          <Divider />
          
          <Space direction="vertical" style={{ width: '100%' }} size={Spacing.lg}>
            <div>
              <Text strong style={{ color: Colors.text }}>Training Progress</Text>
              <Progress
                percent={modelData?.epochs || 0}
                status={training ? 'active' : 'normal'}
                strokeColor={Colors.gradients.primary}
                style={{ marginTop: Spacing.md }}
              />
            </div>
            
            <div>
              <Text strong style={{ color: Colors.text }}>Model Features</Text>
              <div style={{ marginTop: Spacing.sm }}>
                {modelData?.features.map((feature, index) => (
                  <Tag key={index} color="green" style={{ marginBottom: Spacing.xs }}>
                    {feature}
                  </Tag>
                ))}
              </div>
            </div>
            
            <Button
              type="primary"
              icon={<RocketOutlined />}
              loading={training}
              onClick={trainModel}
              style={{
                background: Colors.gradients.primary,
                border: 'none',
                borderRadius: '8px',
                height: '48px',
                fontWeight: 600,
              }}
            >
              {training ? 'Training Model...' : 'Start Training'}
            </Button>
          </Space>
        </Card>
      </Col>
      
      <Col xs={24} lg={8}>
        <Card
          title={
            <Space>
              <SettingOutlined style={{ color: Colors.warning }} />
              <span>Training Configuration</span>
            </Space>
          }
          style={{
            backgroundColor: Colors.surface,
            border: `1px solid ${Colors.border}`,
            borderRadius: '12px',
          }}
        >
          <Space direction="vertical" style={{ width: '100%' }} size={Spacing.lg}>
            <div>
              <Text strong style={{ color: Colors.text }}>Temperature</Text>
              <Slider
                min={0.1}
                max={2.0}
                step={0.1}
                value={modelConfig.temperature}
                onChange={(value) => setModelConfig(prev => ({ ...prev, temperature: value }))}
              />
              <Text style={{ color: Colors.textTertiary, fontSize: '12px' }}>
                {modelConfig.temperature} - Controls randomness
              </Text>
            </div>
            
            <div>
              <Text strong style={{ color: Colors.text }}>Max Tokens</Text>
              <Slider
                min={100}
                max={2000}
                step={50}
                value={modelConfig.maxTokens}
                onChange={(value) => setModelConfig(prev => ({ ...prev, maxTokens: value }))}
              />
              <Text style={{ color: Colors.textTertiary, fontSize: '12px' }}>
                {modelConfig.maxTokens} - Maximum response length
              </Text>
            </div>
            
            <div>
              <Text strong style={{ color: Colors.text }}>Top P</Text>
              <Slider
                min={0.1}
                max={1.0}
                step={0.1}
                value={modelConfig.topP}
                onChange={(value) => setModelConfig(prev => ({ ...prev, topP: value }))}
              />
              <Text style={{ color: Colors.textTertiary, fontSize: '12px' }}>
                {modelConfig.topP} - Nucleus sampling
              </Text>
            </div>
            
            <div>
              <Text strong style={{ color: Colors.text }}>Frequency Penalty</Text>
              <Slider
                min={0.0}
                max={2.0}
                step={0.1}
                value={modelConfig.frequencyPenalty}
                onChange={(value) => setModelConfig(prev => ({ ...prev, frequencyPenalty: value }))}
              />
              <Text style={{ color: Colors.textTertiary, fontSize: '12px' }}>
                {modelConfig.frequencyPenalty} - Reduces repetition
              </Text>
            </div>
            
            <div>
              <Text strong style={{ color: Colors.text }}>Presence Penalty</Text>
              <Slider
                min={0.0}
                max={2.0}
                step={0.1}
                value={modelConfig.presencePenalty}
                onChange={(value) => setModelConfig(prev => ({ ...prev, presencePenalty: value }))}
              />
              <Text style={{ color: Colors.textTertiary, fontSize: '12px' }}>
                {modelConfig.presencePenalty} - Encourages new topics
              </Text>
            </div>
          </Space>
        </Card>
      </Col>
    </Row>
  );

  // Render analytics tab
  const renderAnalytics = () => (
    <Row gutter={[Spacing.lg, Spacing.lg]}>
      <Col xs={24} lg={12}>
        <Card
          title={
            <Space>
              <BarChartOutlined style={{ color: Colors.info }} />
              <span>Generation History</span>
            </Space>
          }
          style={{
            backgroundColor: Colors.surface,
            border: `1px solid ${Colors.border}`,
            borderRadius: '12px',
          }}
        >
          <List
            dataSource={generationHistory}
            renderItem={(item) => (
              <List.Item>
                <List.Item.Meta
                  avatar={
                    <Avatar
                      icon={item.status === 'completed' ? <CheckCircleOutlined /> : 
                            item.status === 'processing' ? <ReloadOutlined spin /> : 
                            <ExclamationCircleOutlined />}
                      style={{
                        backgroundColor: item.status === 'completed' ? Colors.success :
                                        item.status === 'processing' ? Colors.warning :
                                        Colors.error,
                      }}
                    />
                  }
                  title={
                    <Space>
                      <Text style={{ color: Colors.text }}>{item.url}</Text>
                      <Tag color={item.score >= 90 ? 'green' : item.score >= 80 ? 'blue' : 'orange'}>
                        {item.score.toFixed(1)}%
                      </Tag>
                    </Space>
                  }
                  description={
                    <Space>
                      <Text style={{ color: Colors.textTertiary }}>
                        {new Date(item.timestamp).toLocaleString()}
                      </Text>
                      <Text style={{ color: Colors.textTertiary }}>
                        Score: {item.score.toFixed(1)}%
                      </Text>
                    </Space>
                  }
                />
                <div>
                  <Button
                    type="link"
                    icon={<EyeOutlined />}
                    onClick={() => setGeneratedContent(item.content)}
                  >
                    View
                  </Button>
                </div>
              </List.Item>
            )}
          />
        </Card>
      </Col>
      
      <Col xs={24} lg={12}>
        <Card
          title={
            <Space>
              <PieChartOutlined style={{ color: Colors.success }} />
              <span>Performance Metrics</span>
            </Space>
          }
          style={{
            backgroundColor: Colors.surface,
            border: `1px solid ${Colors.border}`,
            borderRadius: '12px',
          }}
        >
          <Space direction="vertical" style={{ width: '100%' }} size={Spacing.lg}>
            <Statistic
              title="Total Generations"
              value={generationHistory.length}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: Colors.info }}
            />
            
            <Statistic
              title="Average Score"
              value={generationHistory.length > 0 ? 
                (generationHistory.reduce((sum, item) => sum + item.score, 0) / generationHistory.length).toFixed(1) : 
                0}
              suffix="%"
              prefix={<StarOutlined />}
              valueStyle={{ color: Colors.success }}
            />
            
            <Statistic
              title="Success Rate"
              value={generationHistory.length > 0 ? 
                (generationHistory.filter(item => item.status === 'completed').length / generationHistory.length * 100).toFixed(1) : 
                0}
              suffix="%"
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: Colors.primary }}
            />
            
            <div>
              <Text strong style={{ color: Colors.text }}>Score Distribution</Text>
              <div style={{ marginTop: Spacing.md }}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text style={{ color: Colors.textSecondary }}>Excellent (90%+)</Text>
                    <Text style={{ color: Colors.success }}>
                      {generationHistory.filter(item => item.score >= 90).length}
                    </Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text style={{ color: Colors.textSecondary }}>Good (80-89%)</Text>
                    <Text style={{ color: Colors.info }}>
                      {generationHistory.filter(item => item.score >= 80 && item.score < 90).length}
                    </Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text style={{ color: Colors.textSecondary }}>Fair (70-79%)</Text>
                    <Text style={{ color: Colors.warning }}>
                      {generationHistory.filter(item => item.score >= 70 && item.score < 80).length}
                    </Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text style={{ color: Colors.textSecondary }}>Needs Improvement (&lt;70%)</Text>
                    <Text style={{ color: Colors.error }}>
                      {generationHistory.filter(item => item.score < 70).length}
                    </Text>
                  </div>
                </Space>
              </div>
            </div>
          </Space>
        </Card>
      </Col>
    </Row>
  );

  return (
    <div style={{ padding: Spacing.lg, backgroundColor: Colors.background, minHeight: '100vh' }}>
      <div style={{ marginBottom: Spacing.xxl }}>
        <Title level={1} style={{ 
          color: Colors.text,
          fontSize: '32px',
          fontWeight: 700,
          margin: 0,
          marginBottom: Spacing.sm,
        }}>
          SEO Content Generator
        </Title>
        <Text style={{ 
          fontSize: '16px',
          color: Colors.textSecondary,
        }}>
          AI-powered content generation with TensorFlow neural network integration
        </Text>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        style={{ color: Colors.text }}
        items={[
          {
            key: 'generator',
            label: (
              <Space>
                <RobotOutlined />
                <span>Content Generator</span>
              </Space>
            ),
            children: renderGenerator(),
          },
          {
            key: 'training',
            label: (
              <Space>
                <ExperimentOutlined />
                <span>Model Training</span>
                {modelData && (
                  <Badge count={`${Math.round(modelData.accuracy)}%`} style={{ backgroundColor: Colors.success }} />
                )}
              </Space>
            ),
            children: renderTraining(),
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
        ]}
      />

      {/* Advanced Settings Drawer */}
      <Drawer
        title={
          <Space>
            <SettingOutlined style={{ color: Colors.primary }} />
            <span>Advanced Settings</span>
          </Space>
        }
        placement="right"
        onClose={() => setSettingsVisible(false)}
        open={settingsVisible}
        width={400}
        style={{
          backgroundColor: Colors.surface,
        }}
      >
        <Space direction="vertical" size={Spacing.xl} style={{ width: '100%' }}>
          <Card size="small" style={{ backgroundColor: Colors.surfaceLight, border: `1px solid ${Colors.border}` }}>
            <Title level={5} style={{ color: Colors.text, marginBottom: Spacing.md }}>
              API Configuration
            </Title>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text style={{ color: Colors.text }}>API Endpoint</Text>
                <Input placeholder="https://api.lightdom.com/seo" style={{ marginTop: Spacing.xs }} />
              </div>
              <div>
                <Text style={{ color: Colors.text }}>API Key</Text>
                <Input.Password placeholder="Your API key" style={{ marginTop: Spacing.xs }} />
              </div>
            </Space>
          </Card>
          
          <Card size="small" style={{ backgroundColor: Colors.surfaceLight, border: `1px solid ${Colors.border}` }}>
            <Title level={5} style={{ color: Colors.text, marginBottom: Spacing.md }}>
              Export Settings
            </Title>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ color: Colors.text }}>Include Analytics</Text>
                <Switch defaultChecked />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ color: Colors.text }}>Auto-save History</Text>
                <Switch defaultChecked />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ color: Colors.text }}>Enable Debug Mode</Text>
                <Switch />
              </div>
            </Space>
          </Card>
        </Space>
      </Drawer>
    </div>
  );
};

export default SEOContentGenerator;
