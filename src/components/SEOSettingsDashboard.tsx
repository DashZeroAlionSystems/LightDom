import React, { useState, useEffect } from 'react';
import {
  Card,
  Tabs,
  Form,
  Input,
  Select,
  Button,
  Space,
  Typography,
  Row,
  Col,
  Alert,
  Tag,
  Statistic,
  Progress,
  Table,
  Switch,
  message,
  Collapse,
  Tooltip,
  Badge
} from 'antd';
import {
  SearchOutlined,
  FileTextOutlined,
  CodeOutlined,
  PictureOutlined,
  LinkOutlined,
  MobileOutlined,
  ThunderboltOutlined,
  GlobalOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { TextArea } = Input;
const { Option } = Select;
const { Panel } = Collapse;

/**
 * SEO Settings Dashboard Component
 * Comprehensive SEO configuration and optimization dashboard
 */
const SEOSettingsDashboard = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [seoResearch, setSeoResearch] = useState([]);
  const [seoMappings, setSeoMappings] = useState([]);
  const [seoScore, setSeoScore] = useState(0);
  const [activeTab, setActiveTab] = useState('meta-tags');

  // Fetch SEO research data
  useEffect(() => {
    fetchSEOResearch();
    fetchSEOMappings();
  }, []);

  const fetchSEOResearch = async () => {
    try {
      const response = await fetch('/api/component-analyzer/seo/research');
      const result = await response.json();
      if (result.success) {
        setSeoResearch(result.data);
      }
    } catch (error) {
      console.error('Error fetching SEO research:', error);
    }
  };

  const fetchSEOMappings = async () => {
    try {
      const response = await fetch('/api/component-analyzer/seo/mappings');
      const result = await response.json();
      if (result.success) {
        setSeoMappings(result.data);
      }
    } catch (error) {
      console.error('Error fetching SEO mappings:', error);
    }
  };

  const calculateSEOScore = (values) => {
    let score = 0;
    const checks = [
      { field: 'metaTitle', weight: 15, maxLength: 60 },
      { field: 'metaDescription', weight: 15, maxLength: 160 },
      { field: 'canonicalUrl', weight: 10 },
      { field: 'ogTitle', weight: 5 },
      { field: 'ogDescription', weight: 5 },
      { field: 'ogImage', weight: 5 },
      { field: 'schemaType', weight: 15 },
      { field: 'h1Tag', weight: 10 },
      { field: 'altText', weight: 10 },
      { field: 'mobileOptimized', weight: 10 }
    ];

    checks.forEach(check => {
      const value = values[check.field];
      if (value) {
        if (check.maxLength && value.length <= check.maxLength) {
          score += check.weight;
        } else if (!check.maxLength) {
          score += check.weight;
        } else if (check.maxLength && value.length > check.maxLength) {
          score += check.weight * 0.5; // Partial credit
        }
      }
    });

    return Math.round(score);
  };

  const handleFormChange = (changedValues, allValues) => {
    const newScore = calculateSEOScore(allValues);
    setSeoScore(newScore);
  };

  const handleSave = async (values) => {
    setLoading(true);
    try {
      // Save SEO settings
      console.log('Saving SEO settings:', values);
      message.success('SEO settings saved successfully!');
    } catch (error) {
      message.error('Failed to save SEO settings');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#52c41a';
    if (score >= 60) return '#faad14';
    return '#ff4d4f';
  };

  const getImpactColor = (impact) => {
    const colors = {
      critical: 'red',
      high: 'orange',
      medium: 'blue',
      low: 'default'
    };
    return colors[impact] || 'default';
  };

  // Meta Tags Tab
  const renderMetaTagsTab = () => (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Alert
        message="Meta Tags Best Practices"
        description="Optimize your meta tags for better search engine visibility and social sharing."
        type="info"
        showIcon
        icon={<InfoCircleOutlined />}
      />

      <Form.Item
        label="Page Title"
        name="metaTitle"
        rules={[
          { required: true, message: 'Page title is required' },
          { max: 60, message: 'Keep title under 60 characters for best results' }
        ]}
        extra={
          <Text type="secondary">
            {form.getFieldValue('metaTitle')?.length || 0}/60 characters
          </Text>
        }
      >
        <Input 
          placeholder="Enter compelling page title..." 
          prefix={<FileTextOutlined />}
        />
      </Form.Item>

      <Form.Item
        label="Meta Description"
        name="metaDescription"
        rules={[
          { required: true, message: 'Meta description is required' },
          { max: 160, message: 'Keep description under 160 characters' }
        ]}
        extra={
          <Text type="secondary">
            {form.getFieldValue('metaDescription')?.length || 0}/160 characters
          </Text>
        }
      >
        <TextArea 
          rows={3} 
          placeholder="Write a compelling meta description..."
        />
      </Form.Item>

      <Form.Item
        label="Meta Keywords"
        name="metaKeywords"
        extra="Comma-separated keywords (optional, limited SEO value)"
      >
        <Input placeholder="keyword1, keyword2, keyword3..." />
      </Form.Item>

      <Form.Item
        label="Canonical URL"
        name="canonicalUrl"
        rules={[
          { type: 'url', message: 'Please enter a valid URL' }
        ]}
      >
        <Input 
          placeholder="https://example.com/page" 
          prefix={<LinkOutlined />}
        />
      </Form.Item>

      <Form.Item
        label="Robots Meta Tag"
        name="robotsMeta"
      >
        <Select mode="multiple" placeholder="Select robots directives">
          <Option value="index">index</Option>
          <Option value="noindex">noindex</Option>
          <Option value="follow">follow</Option>
          <Option value="nofollow">nofollow</Option>
          <Option value="noarchive">noarchive</Option>
          <Option value="nosnippet">nosnippet</Option>
        </Select>
      </Form.Item>
    </Space>
  );

  // Open Graph Tab
  const renderOpenGraphTab = () => (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Alert
        message="Open Graph (Social Sharing)"
        description="Optimize how your content appears when shared on social media platforms."
        type="info"
        showIcon
        icon={<GlobalOutlined />}
      />

      <Form.Item
        label="OG Title"
        name="ogTitle"
        extra="Defaults to page title if not specified"
      >
        <Input placeholder="Social sharing title..." />
      </Form.Item>

      <Form.Item
        label="OG Description"
        name="ogDescription"
      >
        <TextArea rows={2} placeholder="Social sharing description..." />
      </Form.Item>

      <Form.Item
        label="OG Image"
        name="ogImage"
        rules={[
          { type: 'url', message: 'Please enter a valid image URL' }
        ]}
        extra="Recommended: 1200x630px"
      >
        <Input 
          placeholder="https://example.com/image.jpg" 
          prefix={<PictureOutlined />}
        />
      </Form.Item>

      <Form.Item
        label="OG Type"
        name="ogType"
      >
        <Select placeholder="Select content type">
          <Option value="website">Website</Option>
          <Option value="article">Article</Option>
          <Option value="product">Product</Option>
          <Option value="video">Video</Option>
        </Select>
      </Form.Item>

      <Form.Item
        label="Twitter Card"
        name="twitterCard"
      >
        <Select placeholder="Select Twitter card type">
          <Option value="summary">Summary</Option>
          <Option value="summary_large_image">Summary Large Image</Option>
          <Option value="app">App</Option>
          <Option value="player">Player</Option>
        </Select>
      </Form.Item>

      <Form.Item
        label="Twitter Site"
        name="twitterSite"
        extra="@username of website"
      >
        <Input placeholder="@yoursite" />
      </Form.Item>
    </Space>
  );

  // Schema Markup Tab
  const renderSchemaMarkupTab = () => (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Alert
        message="Structured Data (Schema.org)"
        description="Add structured data to help search engines understand your content."
        type="info"
        showIcon
        icon={<CodeOutlined />}
      />

      <Form.Item
        label="Schema Type"
        name="schemaType"
        rules={[{ required: true, message: 'Please select a schema type' }]}
      >
        <Select placeholder="Select schema.org type">
          <Option value="Article">Article</Option>
          <Option value="Product">Product</Option>
          <Option value="Organization">Organization</Option>
          <Option value="LocalBusiness">LocalBusiness</Option>
          <Option value="WebSite">WebSite</Option>
          <Option value="BreadcrumbList">BreadcrumbList</Option>
          <Option value="FAQPage">FAQPage</Option>
          <Option value="HowTo">HowTo</Option>
          <Option value="Event">Event</Option>
          <Option value="Recipe">Recipe</Option>
        </Select>
      </Form.Item>

      <Form.Item
        label="JSON-LD Schema"
        name="jsonLdSchema"
        extra="Enter valid JSON-LD structured data"
      >
        <TextArea 
          rows={8} 
          placeholder={`{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Your Article Title",
  "author": {
    "@type": "Person",
    "name": "Author Name"
  }
}`}
          style={{ fontFamily: 'monospace' }}
        />
      </Form.Item>

      <Form.Item>
        <Button type="link" icon={<CheckCircleOutlined />}>
          Validate with Google Rich Results Test
        </Button>
      </Form.Item>
    </Space>
  );

  // Technical SEO Tab
  const renderTechnicalSEOTab = () => (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Alert
        message="Technical SEO Settings"
        description="Configure technical aspects for better crawling and indexing."
        type="info"
        showIcon
        icon={<ThunderboltOutlined />}
      />

      <Form.Item
        label="H1 Tag"
        name="h1Tag"
        rules={[{ required: true, message: 'H1 tag is required' }]}
        extra="Use one H1 tag per page"
      >
        <Input placeholder="Main page heading..." />
      </Form.Item>

      <Form.Item
        label="Language"
        name="language"
      >
        <Input placeholder="en" />
      </Form.Item>

      <Form.Item
        label="Charset"
        name="charset"
      >
        <Input placeholder="UTF-8" disabled />
      </Form.Item>

      <Form.Item
        label="Viewport"
        name="viewport"
      >
        <Input 
          placeholder="width=device-width, initial-scale=1" 
          disabled 
        />
      </Form.Item>

      <Form.Item
        label="Image Alt Text Strategy"
        name="altTextStrategy"
      >
        <Select placeholder="Select strategy">
          <Option value="descriptive">Descriptive (Recommended)</Option>
          <Option value="keyword-focused">Keyword-Focused</Option>
          <Option value="contextual">Contextual</Option>
        </Select>
      </Form.Item>

      <Form.Item
        label="Internal Linking"
        name="internalLinking"
        valuePropName="checked"
      >
        <Switch checkedChildren="Enabled" unCheckedChildren="Disabled" />
      </Form.Item>
    </Space>
  );

  // Performance Tab
  const renderPerformanceTab = () => (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Alert
        message="Core Web Vitals & Performance"
        description="Monitor and optimize page performance metrics."
        type="info"
        showIcon
        icon={<ThunderboltOutlined />}
      />

      <Row gutter={16}>
        <Col span={8}>
          <Card>
            <Statistic
              title="LCP (Largest Contentful Paint)"
              value={2.3}
              suffix="s"
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckCircleOutlined />}
            />
            <Progress percent={85} status="success" showInfo={false} />
            <Text type="secondary">Good (&lt; 2.5s)</Text>
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="FID (First Input Delay)"
              value={85}
              suffix="ms"
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckCircleOutlined />}
            />
            <Progress percent={90} status="success" showInfo={false} />
            <Text type="secondary">Good (&lt; 100ms)</Text>
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="CLS (Cumulative Layout Shift)"
              value={0.08}
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckCircleOutlined />}
            />
            <Progress percent={92} status="success" showInfo={false} />
            <Text type="secondary">Good (&lt; 0.1)</Text>
          </Card>
        </Col>
      </Row>

      <Form.Item
        label="Mobile Optimized"
        name="mobileOptimized"
        valuePropName="checked"
      >
        <Switch 
          checkedChildren={<MobileOutlined />} 
          unCheckedChildren={<MobileOutlined />} 
        />
      </Form.Item>

      <Form.Item
        label="Image Lazy Loading"
        name="imageLazyLoading"
        valuePropName="checked"
      >
        <Switch checkedChildren="Enabled" unCheckedChildren="Disabled" />
      </Form.Item>

      <Form.Item
        label="Resource Hints"
        name="resourceHints"
      >
        <Select mode="multiple" placeholder="Select resource hints">
          <Option value="preconnect">Preconnect</Option>
          <Option value="prefetch">Prefetch</Option>
          <Option value="preload">Preload</Option>
          <Option value="dns-prefetch">DNS Prefetch</Option>
        </Select>
      </Form.Item>
    </Space>
  );

  // Research & Best Practices Tab
  const renderResearchTab = () => {
    const researchByCategory = seoResearch.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    }, {});

    return (
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Alert
          message="SEO Research & Best Practices"
          description="Evidence-based SEO recommendations and implementation guides."
          type="info"
          showIcon
        />

        <Collapse accordion>
          {Object.entries(researchByCategory).map(([category, items]) => (
            <Panel 
              header={
                <Space>
                  <Text strong>{category.replace(/-/g, ' ').toUpperCase()}</Text>
                  <Badge count={items.length} />
                </Space>
              } 
              key={category}
            >
              {items.map(item => (
                <Card 
                  key={item.research_id} 
                  size="small" 
                  style={{ marginBottom: 16 }}
                  title={
                    <Space>
                      {item.topic}
                      <Tag color={getImpactColor(item.impact_level)}>
                        {item.impact_level}
                      </Tag>
                    </Space>
                  }
                >
                  <Paragraph>
                    <Title level={5}>Best Practices</Title>
                    <ul>
                      {item.best_practices?.map((practice, idx) => (
                        <li key={idx}>
                          <Text>{practice.practice}</Text>
                          {' '}
                          <Tag color={getImpactColor(practice.priority)}>
                            {practice.priority}
                          </Tag>
                        </li>
                      ))}
                    </ul>
                  </Paragraph>

                  <Paragraph>
                    <Title level={5}>Recommended Components</Title>
                    <ul>
                      {item.component_recommendations?.map((comp, idx) => (
                        <li key={idx}>
                          <Text strong>{comp.component}</Text>: {comp.description}
                        </li>
                      ))}
                    </ul>
                  </Paragraph>

                  {item.sources && item.sources.length > 0 && (
                    <Paragraph type="secondary">
                      <Text type="secondary">Sources: {item.sources.join(', ')}</Text>
                    </Paragraph>
                  )}
                </Card>
              ))}
            </Panel>
          ))}
        </Collapse>
      </Space>
    );
  };

  return (
    <div style={{ padding: '24px' }}>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={24}>
          <Card>
            <Row gutter={16}>
              <Col span={6}>
                <Statistic
                  title="SEO Score"
                  value={seoScore}
                  suffix="/100"
                  valueStyle={{ color: getScoreColor(seoScore) }}
                  prefix={
                    seoScore >= 80 ? 
                      <CheckCircleOutlined /> : 
                      <ExclamationCircleOutlined />
                  }
                />
                <Progress 
                  percent={seoScore} 
                  strokeColor={getScoreColor(seoScore)} 
                  showInfo={false} 
                />
              </Col>
              <Col span={18}>
                <Alert
                  message={
                    seoScore >= 80 ? 'Excellent SEO Configuration' :
                    seoScore >= 60 ? 'Good SEO Configuration' :
                    'SEO Needs Improvement'
                  }
                  description={
                    seoScore >= 80 ? 'Your SEO settings are well-optimized!' :
                    seoScore >= 60 ? 'Your SEO settings are good, but could be improved.' :
                    'Please complete required SEO settings for better search visibility.'
                  }
                  type={
                    seoScore >= 80 ? 'success' :
                    seoScore >= 60 ? 'warning' :
                    'error'
                  }
                  showIcon
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          onValuesChange={handleFormChange}
          initialValues={{
            charset: 'UTF-8',
            viewport: 'width=device-width, initial-scale=1',
            mobileOptimized: true,
            imageLazyLoading: true,
            internalLinking: true
          }}
        >
          <Tabs activeKey={activeTab} onChange={setActiveTab}>
            <TabPane 
              tab={
                <span>
                  <FileTextOutlined />
                  Meta Tags
                </span>
              } 
              key="meta-tags"
            >
              {renderMetaTagsTab()}
            </TabPane>

            <TabPane 
              tab={
                <span>
                  <GlobalOutlined />
                  Open Graph
                </span>
              } 
              key="open-graph"
            >
              {renderOpenGraphTab()}
            </TabPane>

            <TabPane 
              tab={
                <span>
                  <CodeOutlined />
                  Schema Markup
                </span>
              } 
              key="schema"
            >
              {renderSchemaMarkupTab()}
            </TabPane>

            <TabPane 
              tab={
                <span>
                  <SearchOutlined />
                  Technical SEO
                </span>
              } 
              key="technical"
            >
              {renderTechnicalSEOTab()}
            </TabPane>

            <TabPane 
              tab={
                <span>
                  <ThunderboltOutlined />
                  Performance
                </span>
              } 
              key="performance"
            >
              {renderPerformanceTab()}
            </TabPane>

            <TabPane 
              tab={
                <span>
                  <InfoCircleOutlined />
                  Research
                </span>
              } 
              key="research"
            >
              {renderResearchTab()}
            </TabPane>
          </Tabs>

          <Form.Item style={{ marginTop: 24 }}>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                Save SEO Settings
              </Button>
              <Button onClick={() => form.resetFields()}>
                Reset
              </Button>
              <Button type="link">
                Preview in Google Search
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default SEOSettingsDashboard;
