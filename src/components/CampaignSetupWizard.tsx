/**
 * Campaign Setup Wizard
 * 
 * Complete step-by-step wizard for setting up crawler campaigns with:
 * - Campaign configuration
 * - Cluster setup
 * - Seeding services
 * - Advanced features (proxies, 3D layers, OCR)
 * - Output templates and drill-downs
 */

import React, { useState } from 'react';
import {
  Steps,
  Card,
  Form,
  Input,
  Select,
  Switch,
  InputNumber,
  Button,
  Space,
  Typography,
  Divider,
  Alert,
  Tag,
  Row,
  Col,
  Collapse,
  Radio,
  Checkbox,
  message,
  Modal
} from 'antd';
import {
  RocketOutlined,
  ClusterOutlined,
  ApiOutlined,
  SettingOutlined,
  DatabaseOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import axios from 'axios';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { Panel } = Collapse;

interface CampaignSetupWizardProps {
  onComplete?: (campaign: any) => void;
}

const CampaignSetupWizard: React.FC<CampaignSetupWizardProps> = ({ onComplete }) => {
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  
  // State for each step
  const [campaignConfig, setCampaignConfig] = useState<any>({});
  const [clusterConfig, setClusterConfig] = useState<any>({});
  const [seedingConfig, setSeedingConfig] = useState<any>({});
  const [advancedConfig, setAdvancedConfig] = useState<any>({});
  const [outputConfig, setOutputConfig] = useState<any>({});
  const [createdCampaign, setCreatedCampaign] = useState<any>(null);

  const steps = [
    {
      title: 'Campaign',
      icon: <RocketOutlined />,
      description: 'Basic configuration'
    },
    {
      title: 'Cluster',
      icon: <ClusterOutlined />,
      description: 'Crawler clustering'
    },
    {
      title: 'Seeding',
      icon: <ApiOutlined />,
      description: 'URL collection'
    },
    {
      title: 'Advanced',
      icon: <SettingOutlined />,
      description: 'Features & optimization'
    },
    {
      title: 'Output',
      icon: <DatabaseOutlined />,
      description: 'Data templates'
    },
    {
      title: 'Complete',
      icon: <CheckCircleOutlined />,
      description: 'Review & launch'
    }
  ];

  // Step 1: Campaign Configuration
  const renderCampaignStep = () => (
    <Card>
      <Title level={4}>Campaign Configuration</Title>
      <Paragraph type="secondary">
        Configure the basic settings for your crawler campaign
      </Paragraph>

      <Form
        form={form}
        layout="vertical"
        initialValues={{
          campaignType: 'custom',
          useAI: true,
          ...campaignConfig
        }}
        onFinish={(values) => {
          setCampaignConfig(values);
          setCurrent(current + 1);
        }}
      >
        <Form.Item
          name="campaignType"
          label="Campaign Type"
          rules={[{ required: true }]}
        >
          <Radio.Group>
            <Space direction="vertical">
              <Radio value="default">
                <Space>
                  <Text strong>Default (Mine Everything)</Text>
                  <Tag color="blue">Recommended</Tag>
                </Space>
                <br />
                <Text type="secondary">
                  Uses all techniques to mine data comprehensively
                </Text>
              </Radio>
              <Radio value="seo">
                <Text strong>SEO Training Data</Text>
                <br />
                <Text type="secondary">
                  Focused on SEO metrics and training data
                </Text>
              </Radio>
              <Radio value="content">
                <Text strong>Content Extraction</Text>
                <br />
                <Text type="secondary">
                  Extract text, images, and structured content
                </Text>
              </Radio>
              <Radio value="custom">
                <Text strong>Custom Configuration</Text>
                <br />
                <Text type="secondary">
                  Manually configure all settings
                </Text>
              </Radio>
            </Space>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          noStyle
          shouldUpdate={(prevValues, currentValues) => 
            prevValues.campaignType !== currentValues.campaignType
          }
        >
          {({ getFieldValue }) => {
            const type = getFieldValue('campaignType');
            return type === 'custom' || type === 'default' ? (
              <>
                <Form.Item
                  name="name"
                  label="Campaign Name"
                  rules={[{ required: true, message: 'Please enter campaign name' }]}
                >
                  <Input placeholder="My Crawler Campaign" />
                </Form.Item>

                <Form.Item
                  name="description"
                  label="Description"
                >
                  <TextArea rows={3} placeholder="Describe your campaign goals..." />
                </Form.Item>

                <Form.Item
                  name="clientSiteUrl"
                  label="Target URL"
                  rules={[
                    { required: true, message: 'Please enter target URL' },
                    { type: 'url', message: 'Please enter a valid URL' }
                  ]}
                >
                  <Input placeholder="https://example.com" />
                </Form.Item>

                <Form.Item
                  name="useAI"
                  label="Use AI Configuration"
                  valuePropName="checked"
                >
                  <Switch />
                  <Text type="secondary" style={{ marginLeft: 8 }}>
                    Generate optimal configuration using DeepSeek AI
                  </Text>
                </Form.Item>

                <Form.Item
                  noStyle
                  shouldUpdate={(prev, curr) => prev.useAI !== curr.useAI}
                >
                  {({ getFieldValue }) =>
                    getFieldValue('useAI') ? (
                      <Form.Item
                        name="prompt"
                        label="AI Prompt"
                        tooltip="Describe what you want to crawl in natural language"
                      >
                        <TextArea
                          rows={4}
                          placeholder="e.g., Crawl all product pages and extract pricing, descriptions, and reviews for training an ML model..."
                        />
                      </Form.Item>
                    ) : null
                  }
                </Form.Item>

                <Divider />

                <Title level={5}>Crawl Settings</Title>

                <Row gutter={16}>
                  <Col span={8}>
                    <Form.Item
                      name="maxDepth"
                      label="Maximum Depth"
                      initialValue={3}
                    >
                      <InputNumber min={1} max={10} style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      name="maxPages"
                      label="Maximum Pages"
                      initialValue={1000}
                    >
                      <InputNumber min={1} max={100000} style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      name="concurrency"
                      label="Concurrency"
                      initialValue={5}
                    >
                      <InputNumber min={1} max={20} style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                </Row>
              </>
            ) : null;
          }}
        </Form.Item>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit">
              Next: Cluster Setup
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );

  // Step 2: Cluster Configuration
  const renderClusterStep = () => (
    <Card>
      <Title level={4}>Crawler Cluster Setup</Title>
      <Paragraph type="secondary">
        Configure how crawler instances work together
      </Paragraph>

      <Form
        form={form}
        layout="vertical"
        initialValues={{
          createCluster: campaignConfig.campaignType === 'default',
          clusterStrategy: 'smart',
          autoScale: true,
          ...clusterConfig
        }}
        onFinish={(values) => {
          setClusterConfig(values);
          setCurrent(current + 1);
        }}
      >
        <Form.Item
          name="createCluster"
          label="Create Cluster"
          valuePropName="checked"
        >
          <Switch />
          <Text type="secondary" style={{ marginLeft: 8 }}>
            Group multiple crawler instances for coordinated crawling
          </Text>
        </Form.Item>

        <Form.Item
          noStyle
          shouldUpdate={(prev, curr) => prev.createCluster !== curr.createCluster}
        >
          {({ getFieldValue }) =>
            getFieldValue('createCluster') ? (
              <>
                <Form.Item
                  name="clusterName"
                  label="Cluster Name"
                  rules={[{ required: true }]}
                >
                  <Input placeholder="Main Crawler Cluster" />
                </Form.Item>

                <Form.Item
                  name="clusterReason"
                  label="Cluster Purpose"
                >
                  <TextArea rows={2} placeholder="Why group these crawlers together?" />
                </Form.Item>

                <Form.Item
                  name="clusterStrategy"
                  label="Load Balancing Strategy"
                  rules={[{ required: true }]}
                >
                  <Select>
                    <Option value="smart">
                      <Space>
                        <Text strong>Smart</Text>
                        <Tag color="green">Recommended</Tag>
                      </Space>
                      <br />
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Based on success rate and latency
                      </Text>
                    </Option>
                    <Option value="load-balanced">Load Balanced - Even distribution</Option>
                    <Option value="round-robin">Round Robin - Sequential</Option>
                    <Option value="least-busy">Least Busy - Smallest queue</Option>
                  </Select>
                </Form.Item>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="maxCrawlers"
                      label="Maximum Crawlers"
                      initialValue={10}
                    >
                      <InputNumber min={1} max={50} style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="autoScale"
                      label="Auto-Scaling"
                      valuePropName="checked"
                    >
                      <Switch />
                    </Form.Item>
                  </Col>
                </Row>
              </>
            ) : (
              <Alert
                message="Single Crawler Mode"
                description="Campaign will use a single crawler instance"
                type="info"
                showIcon
              />
            )
          }
        </Form.Item>

        <Form.Item>
          <Space>
            <Button onClick={() => setCurrent(current - 1)}>
              Back
            </Button>
            <Button type="primary" htmlType="submit">
              Next: Seeding Services
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );

  // Step 3: Seeding Services
  const renderSeedingStep = () => (
    <Card>
      <Title level={4}>Seeding Services Configuration</Title>
      <Paragraph type="secondary">
        Configure how URLs are discovered and collected
      </Paragraph>

      <Form
        form={form}
        layout="vertical"
        initialValues={{
          enableSeeding: campaignConfig.campaignType === 'default',
          seedingMethods: ['sitemap'],
          ...seedingConfig
        }}
        onFinish={(values) => {
          setSeedingConfig(values);
          setCurrent(current + 1);
        }}
      >
        <Form.Item
          name="enableSeeding"
          label="Enable Automatic URL Collection"
          valuePropName="checked"
        >
          <Switch />
          <Text type="secondary" style={{ marginLeft: 8 }}>
            Automatically discover and collect URLs before crawling
          </Text>
        </Form.Item>

        <Form.Item
          noStyle
          shouldUpdate={(prev, curr) => prev.enableSeeding !== curr.enableSeeding}
        >
          {({ getFieldValue }) =>
            getFieldValue('enableSeeding') ? (
              <>
                <Form.Item
                  name="seedingMethods"
                  label="Collection Methods"
                  rules={[{ required: true, message: 'Select at least one method' }]}
                >
                  <Checkbox.Group style={{ width: '100%' }}>
                    <Space direction="vertical">
                      <Checkbox value="sitemap">
                        <Text strong>Sitemap Parser</Text>
                        <br />
                        <Text type="secondary">Parse XML sitemaps</Text>
                      </Checkbox>
                      <Checkbox value="search">
                        <Text strong>Search Results</Text>
                        <br />
                        <Text type="secondary">Collect from search engines</Text>
                      </Checkbox>
                      <Checkbox value="api">
                        <Text strong>Custom API</Text>
                        <br />
                        <Text type="secondary">Fetch from external API</Text>
                      </Checkbox>
                    </Space>
                  </Checkbox.Group>
                </Form.Item>

                <Form.Item
                  noStyle
                  shouldUpdate={(prev, curr) => 
                    JSON.stringify(prev.seedingMethods) !== JSON.stringify(curr.seedingMethods)
                  }
                >
                  {({ getFieldValue }) => {
                    const methods = getFieldValue('seedingMethods') || [];
                    return (
                      <Collapse>
                        {methods.includes('sitemap') && (
                          <Panel header="Sitemap Configuration" key="sitemap">
                            <Form.Item name={['sitemap', 'url']} label="Sitemap URL">
                              <Input placeholder="https://example.com/sitemap.xml" />
                            </Form.Item>
                            <Form.Item 
                              name={['sitemap', 'followSubSitemaps']} 
                              valuePropName="checked"
                              initialValue={true}
                            >
                              <Checkbox>Follow sub-sitemaps</Checkbox>
                            </Form.Item>
                          </Panel>
                        )}
                        {methods.includes('search') && (
                          <Panel header="Search Configuration" key="search">
                            <Form.Item name={['search', 'engine']} label="Search Engine">
                              <Select>
                                <Option value="google">Google</Option>
                                <Option value="bing">Bing</Option>
                                <Option value="duckduckgo">DuckDuckGo</Option>
                              </Select>
                            </Form.Item>
                            <Form.Item name={['search', 'query']} label="Search Query">
                              <Input placeholder="site:example.com" />
                            </Form.Item>
                          </Panel>
                        )}
                        {methods.includes('api') && (
                          <Panel header="API Configuration" key="api">
                            <Form.Item name={['api', 'endpoint']} label="API Endpoint">
                              <Input placeholder="https://api.example.com/urls" />
                            </Form.Item>
                            <Form.Item name={['api', 'method']} label="Method">
                              <Select>
                                <Option value="GET">GET</Option>
                                <Option value="POST">POST</Option>
                              </Select>
                            </Form.Item>
                          </Panel>
                        )}
                      </Collapse>
                    );
                  }}
                </Form.Item>
              </>
            ) : null
          }
        </Form.Item>

        <Form.Item>
          <Space>
            <Button onClick={() => setCurrent(current - 1)}>
              Back
            </Button>
            <Button type="primary" htmlType="submit">
              Next: Advanced Features
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );

  // Step 4: Advanced Features
  const renderAdvancedStep = () => (
    <Card>
      <Title level={4}>Advanced Features</Title>
      <Paragraph type="secondary">
        Enable enterprise features for better performance and data quality
      </Paragraph>

      <Form
        form={form}
        layout="vertical"
        initialValues={{
          enableAllFeatures: campaignConfig.campaignType === 'default',
          proxies: campaignConfig.campaignType === 'default',
          robotsTxt: true,
          layers3D: campaignConfig.campaignType === 'default',
          ocr: campaignConfig.campaignType === 'default',
          ...advancedConfig
        }}
        onFinish={(values) => {
          setAdvancedConfig(values);
          setCurrent(current + 1);
        }}
      >
        <Form.Item
          name="enableAllFeatures"
          label="Enable All Advanced Features"
          valuePropName="checked"
        >
          <Switch />
          <Text type="secondary" style={{ marginLeft: 8 }}>
            Activate all enterprise-level features (recommended for default campaign)
          </Text>
        </Form.Item>

        <Divider>Individual Features</Divider>

        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <Card size="small" title="Rotating Proxies">
            <Form.Item name="proxies" valuePropName="checked">
              <Switch />
              <Text style={{ marginLeft: 8 }}>Enable proxy rotation</Text>
            </Form.Item>
            <Form.Item
              noStyle
              shouldUpdate={(prev, curr) => prev.proxies !== curr.proxies}
            >
              {({ getFieldValue }) =>
                getFieldValue('proxies') ? (
                  <Form.Item name={['proxy', 'strategy']} label="Rotation Strategy">
                    <Select defaultValue="smart">
                      <Option value="smart">Smart (Recommended)</Option>
                      <Option value="round-robin">Round Robin</Option>
                      <Option value="least-used">Least Used</Option>
                    </Select>
                  </Form.Item>
                ) : null
              }
            </Form.Item>
          </Card>

          <Card size="small" title="robots.txt Compliance">
            <Form.Item name="robotsTxt" valuePropName="checked">
              <Switch defaultChecked />
              <Text style={{ marginLeft: 8 }}>Respect robots.txt rules</Text>
            </Form.Item>
          </Card>

          <Card size="small" title="3D Layers Mining">
            <Form.Item name="layers3D" valuePropName="checked">
              <Switch />
              <Text style={{ marginLeft: 8 }}>Extract DOM 3D compositing layers</Text>
            </Form.Item>
            <Text type="secondary">
              Uses Chrome DevTools Protocol for deep UI analysis
            </Text>
          </Card>

          <Card size="small" title="OCR (Image Text Extraction)">
            <Form.Item name="ocr" valuePropName="checked">
              <Switch />
              <Text style={{ marginLeft: 8 }}>Extract text from images</Text>
            </Form.Item>
            <Form.Item
              noStyle
              shouldUpdate={(prev, curr) => prev.ocr !== curr.ocr}
            >
              {({ getFieldValue }) =>
                getFieldValue('ocr') ? (
                  <Form.Item name={['ocr', 'precision']} label="Precision Target">
                    <Select defaultValue={0.95}>
                      <Option value={0.99}>99% (Legal/Medical)</Option>
                      <Option value={0.95}>95% (Business)</Option>
                      <Option value={0.90}>90% (Archives)</Option>
                      <Option value={0.70}>70% (Training Data)</Option>
                    </Select>
                  </Form.Item>
                ) : null
              }
            </Form.Item>
          </Card>
        </Space>

        <Form.Item>
          <Space>
            <Button onClick={() => setCurrent(current - 1)}>
              Back
            </Button>
            <Button type="primary" htmlType="submit">
              Next: Output Configuration
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );

  // Step 5: Output Configuration
  const renderOutputStep = () => (
    <Card>
      <Title level={4}>Output Configuration</Title>
      <Paragraph type="secondary">
        Configure how data is stored and structured
      </Paragraph>

      <Form
        form={form}
        layout="vertical"
        initialValues={{
          outputFormat: 'database',
          createRelationships: true,
          enableDrillDown: true,
          ...outputConfig
        }}
        onFinish={(values) => {
          setOutputConfig(values);
          handleCreateCampaign();
        }}
      >
        <Form.Item
          name="outputFormat"
          label="Output Format"
          rules={[{ required: true }]}
        >
          <Radio.Group>
            <Space direction="vertical">
              <Radio value="database">
                <Text strong>Database Table</Text>
                <br />
                <Text type="secondary">
                  Store in PostgreSQL with relationships
                </Text>
              </Radio>
              <Radio value="json">
                <Text strong>JSON Files</Text>
                <br />
                <Text type="secondary">
                  Export as structured JSON
                </Text>
              </Radio>
              <Radio value="both">
                <Text strong>Database + JSON</Text>
                <br />
                <Text type="secondary">
                  Store in database and export JSON
                </Text>
              </Radio>
            </Space>
          </Radio.Group>
        </Form.Item>

        <Divider />

        <Form.Item
          name="createRelationships"
          label="Create Schema Relationships"
          valuePropName="checked"
        >
          <Switch defaultChecked />
          <Text type="secondary" style={{ marginLeft: 8 }}>
            Link data using schema relationships
          </Text>
        </Form.Item>

        <Form.Item
          name="enableDrillDown"
          label="Enable Drill-Down Views"
          valuePropName="checked"
        >
          <Switch defaultChecked />
          <Text type="secondary" style={{ marginLeft: 8 }}>
            Support hierarchical data exploration
          </Text>
        </Form.Item>

        <Form.Item
          name="outputTemplate"
          label="Output Template"
          tooltip="Define how data is structured in the output"
        >
          <Select mode="multiple" placeholder="Select data fields to include">
            <Option value="url">URL</Option>
            <Option value="title">Title</Option>
            <Option value="content">Content</Option>
            <Option value="metadata">Metadata</Option>
            <Option value="schemas">Linked Schemas</Option>
            <Option value="seo">SEO Data</Option>
            <Option value="images">Images</Option>
            <Option value="links">Links</Option>
            <Option value="layers3D">3D Layers</Option>
            <Option value="ocr">OCR Results</Option>
          </Select>
        </Form.Item>

        <Alert
          message="Default Campaign"
          description={
            campaignConfig.campaignType === 'default' 
              ? "All data will be mined using all available techniques and stored with full relationships"
              : "Custom output configuration will be applied"
          }
          type="info"
          showIcon
          style={{ marginTop: 16 }}
        />

        <Form.Item>
          <Space>
            <Button onClick={() => setCurrent(current - 1)}>
              Back
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              Create Campaign
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );

  // Step 6: Complete
  const renderCompleteStep = () => (
    <Card>
      <div style={{ textAlign: 'center', padding: '40px 0' }}>
        <CheckCircleOutlined style={{ fontSize: 64, color: '#52c41a' }} />
        <Title level={2}>Campaign Created Successfully!</Title>
        <Paragraph>
          Your crawler campaign has been configured and is ready to launch.
        </Paragraph>

        {createdCampaign && (
          <>
            <Divider />
            <div style={{ textAlign: 'left', maxWidth: 600, margin: '0 auto' }}>
              <Title level={4}>Campaign Summary</Title>
              <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                  <Text strong>Campaign ID:</Text> <Text code>{createdCampaign.id}</Text>
                </div>
                <div>
                  <Text strong>Name:</Text> {createdCampaign.name}
                </div>
                <div>
                  <Text strong>Type:</Text> <Tag>{campaignConfig.campaignType}</Tag>
                </div>
                <div>
                  <Text strong>Target:</Text> {campaignConfig.clientSiteUrl}
                </div>
                <div>
                  <Text strong>Status:</Text> <Tag color="green">{createdCampaign.status}</Tag>
                </div>
              </Space>
            </div>
          </>
        )}

        <Divider />

        <Space size="large">
          <Button
            type="primary"
            size="large"
            icon={<RocketOutlined />}
            onClick={handleLaunchCampaign}
          >
            Launch Campaign
          </Button>
          <Button
            size="large"
            onClick={() => {
              setCurrent(0);
              form.resetFields();
              setCreatedCampaign(null);
            }}
          >
            Create Another
          </Button>
        </Space>
      </div>
    </Card>
  );

  // Create campaign API call
  const handleCreateCampaign = async () => {
    setLoading(true);
    try {
      const config = {
        ...campaignConfig,
        cluster: clusterConfig,
        seeding: seedingConfig,
        advanced: advancedConfig,
        output: outputConfig
      };

      const response = await axios.post('/api/campaigns/create-from-prompt', {
        prompt: campaignConfig.prompt || `Create a ${campaignConfig.campaignType} campaign for ${campaignConfig.clientSiteUrl}`,
        clientSiteUrl: campaignConfig.clientSiteUrl,
        options: config
      });

      if (response.data.success) {
        setCreatedCampaign(response.data.data);
        
        // Create cluster if requested
        if (clusterConfig.createCluster) {
          await axios.post('/api/campaigns/clusters', {
            name: clusterConfig.clusterName,
            reason: clusterConfig.clusterReason,
            strategy: clusterConfig.clusterStrategy,
            maxCrawlers: clusterConfig.maxCrawlers,
            autoScale: clusterConfig.autoScale
          });
        }

        // Setup seeding services
        if (seedingConfig.enableSeeding) {
          const methods = seedingConfig.seedingMethods || [];
          for (const method of methods) {
            const serviceConfig = seedingConfig[method];
            if (serviceConfig) {
              await axios.post('/api/campaigns/seeding-services', {
                name: `${method} collector`,
                type: method,
                config: serviceConfig
              });
            }
          }
        }

        // Enable advanced features
        if (advancedConfig.layers3D || advancedConfig.enableAllFeatures) {
          await axios.post(`/api/campaigns/${response.data.data.id}/3d-layers/enable`, {
            maxDepth: 8,
            minImportance: 0.4
          });
        }

        if (advancedConfig.ocr || advancedConfig.enableAllFeatures) {
          await axios.post(`/api/campaigns/${response.data.data.id}/ocr/enable`, {
            compressionRatio: 0.1,
            minPrecision: advancedConfig.ocr?.precision || 0.95
          });
        }

        setCurrent(current + 1);
        message.success('Campaign created successfully!');
        
        if (onComplete) {
          onComplete(response.data.data);
        }
      }
    } catch (error: any) {
      console.error('Error creating campaign:', error);
      message.error(error.response?.data?.error || 'Failed to create campaign');
    } finally {
      setLoading(false);
    }
  };

  // Launch campaign
  const handleLaunchCampaign = async () => {
    if (!createdCampaign) return;
    
    try {
      const response = await axios.post(`/api/campaigns/${createdCampaign.id}/start`);
      if (response.data.success) {
        message.success('Campaign launched successfully!');
        Modal.success({
          title: 'Campaign Started',
          content: `Campaign "${createdCampaign.name}" is now running. You can monitor progress in the dashboard.`
        });
      }
    } catch (error: any) {
      console.error('Error launching campaign:', error);
      message.error('Failed to launch campaign');
    }
  };

  const items = [
    renderCampaignStep(),
    renderClusterStep(),
    renderSeedingStep(),
    renderAdvancedStep(),
    renderOutputStep(),
    renderCompleteStep()
  ];

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: 24 }}>
      <Card>
        <Title level={2}>
          <RocketOutlined /> Campaign Setup Wizard
        </Title>
        <Paragraph type="secondary">
          Complete step-by-step setup for your crawler campaign with clustering, 
          seeding services, and advanced features.
        </Paragraph>
      </Card>

      <div style={{ marginTop: 24 }}>
        <Steps current={current} items={steps} />
      </div>

      <div style={{ marginTop: 24 }}>
        {items[current]}
      </div>
    </div>
  );
};

export default CampaignSetupWizard;
