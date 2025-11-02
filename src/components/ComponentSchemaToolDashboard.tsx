import React, { useState } from 'react';
import {
  Card,
  Tabs,
  Typography,
  Row,
  Col,
  Button,
  Input,
  Form,
  message,
  Space,
  Alert,
  Spin
} from 'antd';
import {
  CameraOutlined,
  NodeIndexOutlined,
  SettingOutlined,
  SearchOutlined,
  DatabaseOutlined
} from '@ant-design/icons';
import SEOSettingsDashboard from './SEOSettingsDashboard';
import SchemaVisualizationDashboard from './SchemaVisualizationDashboard';

const { Title, Paragraph } = Typography;
const { TabPane } = Tabs;

/**
 * Component Schema Tool Dashboard
 * Main dashboard for screenshot analysis, component breakdown, and schema mapping
 */
const ComponentSchemaToolDashboard = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('capture');
  const [lastAnalysis, setLastAnalysis] = useState(null);

  const handleAnalyzeUrl = async (values) => {
    setLoading(true);
    try {
      const response = await fetch('/api/component-analyzer/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: values.url,
          options: {
            waitFor: 2000,
            viewport: { width: 1920, height: 1080 },
            fullPage: true,
            captureMetadata: true
          }
        })
      });

      const result = await response.json();
      
      if (result.success) {
        message.success(`Analysis complete! Found ${result.data.componentCount} components`);
        setLastAnalysis(result.data);
        setActiveTab('visualization');
      } else {
        message.error('Analysis failed: ' + result.error);
      }
    } catch (error) {
      console.error('Error analyzing URL:', error);
      message.error('Failed to analyze URL');
    } finally {
      setLoading(false);
    }
  };

  const renderCaptureTab = () => (
    <Card>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Alert
          message="Screenshot & Component Analysis"
          description="Enter a URL to capture a screenshot and automatically break down visible components into atomic elements with full schema mapping."
          type="info"
          showIcon
          icon={<CameraOutlined />}
        />

        <Form
          form={form}
          onFinish={handleAnalyzeUrl}
          layout="vertical"
        >
          <Form.Item
            label="URL to Analyze"
            name="url"
            rules={[
              { required: true, message: 'Please enter a URL' },
              { type: 'url', message: 'Please enter a valid URL' }
            ]}
          >
            <Input
              size="large"
              placeholder="https://example.com"
              prefix={<SearchOutlined />}
              disabled={loading}
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={loading}
              icon={<CameraOutlined />}
            >
              {loading ? 'Analyzing...' : 'Capture & Analyze'}
            </Button>
          </Form.Item>
        </Form>

        {lastAnalysis && (
          <Card title="Last Analysis Results" size="small">
            <Row gutter={16}>
              <Col span={8}>
                <Card.Grid style={{ width: '100%', textAlign: 'center' }}>
                  <Statistic
                    title="Total Components"
                    value={lastAnalysis.componentCount}
                    prefix={<NodeIndexOutlined />}
                  />
                </Card.Grid>
              </Col>
              <Col span={8}>
                <Card.Grid style={{ width: '100%', textAlign: 'center' }}>
                  <Statistic
                    title="Atom Components"
                    value={lastAnalysis.atomComponentCount}
                    prefix={<DatabaseOutlined />}
                  />
                </Card.Grid>
              </Col>
              <Col span={8}>
                <Card.Grid style={{ width: '100%', textAlign: 'center' }}>
                  <Typography.Text strong>Analysis ID</Typography.Text>
                  <br />
                  <Typography.Text copyable>{lastAnalysis.analysisId}</Typography.Text>
                </Card.Grid>
              </Col>
            </Row>
            
            <Alert
              message="Screenshot saved"
              description={`Screenshot location: ${lastAnalysis.screenshotPath}`}
              type="success"
              showIcon
              style={{ marginTop: 16 }}
            />
          </Card>
        )}

        <Card title="How It Works" size="small">
          <Paragraph>
            <ol>
              <li><strong>Capture:</strong> Takes a full-page screenshot of the URL</li>
              <li><strong>Extract:</strong> Identifies all visible DOM components</li>
              <li><strong>Analyze:</strong> Breaks down components into atomic elements</li>
              <li><strong>Classify:</strong> Categorizes components by type, purpose, and framework</li>
              <li><strong>Map:</strong> Generates schema mappings and metadata</li>
              <li><strong>Track:</strong> Stores everything in database for future reference</li>
            </ol>
          </Paragraph>
        </Card>

        <Card title="Component Analysis Features" size="small">
          <Row gutter={16}>
            <Col span={12}>
              <Paragraph>
                <strong>Component Properties Extracted:</strong>
                <ul>
                  <li>Type and classification</li>
                  <li>Semantic role and interaction type</li>
                  <li>Visual properties (colors, fonts, sizes)</li>
                  <li>Content properties (text, attributes)</li>
                  <li>Layout properties (position, display)</li>
                  <li>SEO properties (headings, links, images)</li>
                  <li>Accessibility properties (ARIA, roles)</li>
                </ul>
              </Paragraph>
            </Col>
            <Col span={12}>
              <Paragraph>
                <strong>Automatic Scoring:</strong>
                <ul>
                  <li>Reuse score (0-100)</li>
                  <li>Complexity score (0-100)</li>
                  <li>Quality score (0-100)</li>
                </ul>
                <strong>Schema Mapping:</strong>
                <ul>
                  <li>Component family identification</li>
                  <li>Data binding patterns</li>
                  <li>Event handlers</li>
                  <li>Framework detection</li>
                </ul>
              </Paragraph>
            </Col>
          </Row>
        </Card>
      </Space>
    </Card>
  );

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
      <Card>
        <Title level={2}>
          <NodeIndexOutlined /> Component Schema Tool
        </Title>
        <Paragraph>
          Analyze website components, generate schemas, and optimize for SEO with AI-powered insights.
        </Paragraph>
      </Card>

      <div style={{ marginTop: 24 }}>
        <Tabs activeKey={activeTab} onChange={setActiveTab} size="large">
          <TabPane
            tab={
              <span>
                <CameraOutlined />
                Capture & Analyze
              </span>
            }
            key="capture"
          >
            {renderCaptureTab()}
          </TabPane>

          <TabPane
            tab={
              <span>
                <NodeIndexOutlined />
                Visualizations
              </span>
            }
            key="visualization"
          >
            <SchemaVisualizationDashboard />
          </TabPane>

          <TabPane
            tab={
              <span>
                <SettingOutlined />
                SEO Settings
              </span>
            }
            key="seo"
          >
            <SEOSettingsDashboard />
          </TabPane>
        </Tabs>
      </div>
    </div>
  );
};

// Import Statistic if not already imported
import { Statistic } from 'antd';

export default ComponentSchemaToolDashboard;
