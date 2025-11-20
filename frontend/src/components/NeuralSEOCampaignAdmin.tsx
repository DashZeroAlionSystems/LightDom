/**
 * Neural SEO Campaign Admin Dashboard
 * 
 * Comprehensive admin interface for managing neural network-powered SEO campaigns
 * Features:
 * - Campaign management with neural network instances
 * - Attribute coverage monitoring (192 attributes)
 * - Smart re-crawl configuration
 * - Model library selection
 * - Real-time training metrics
 * - Backlink optimization
 */

import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Table,
  Progress,
  Statistic,
  Row,
  Col,
  Tabs,
  message,
  Modal,
  Form,
  Input,
  Select,
  Switch,
  Tag,
  Tooltip,
  Space,
  Divider,
  InputNumber,
  List,
  Badge,
  Alert,
  Collapse,
  Descriptions,
} from 'antd';
import {
  RocketOutlined,
  ThunderboltOutlined,
  LineChartOutlined,
  DatabaseOutlined,
  EyeOutlined,
  SettingOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  SyncOutlined,
  PlusOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  ReloadOutlined,
  DownloadOutlined,
} from '@ant-design/icons';

const { TabPane } = Tabs;
const { Option } = Select;
const { Panel } = Collapse;
const { TextArea } = Input;

interface Campaign {
  id: string;
  name: string;
  type: string;
  status: string;
  stats: {
    urlsCrawled: number;
    urlsQueued: number;
    attributesMined: number;
    dataStreamed: number;
  };
  neuralInstance?: {
    id: string;
    accuracy: number;
  };
}

interface AttributeValidation {
  complete: boolean;
  total: number;
  present: number;
  missing: string[];
  coverage: number;
}

interface ModelLibrary {
  id: string;
  name: string;
  type: string;
  description: string;
  inputDimensions: number;
  outputDimensions: number;
  attributes: string[];
  recommended: boolean;
  preTrainedUrl?: string;
}

export const NeuralSEOCampaignAdmin: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [systemStatus, setSystemStatus] = useState<any>(null);
  const [attributeValidation, setAttributeValidation] = useState<AttributeValidation | null>(null);
  const [modelLibrary, setModelLibrary] = useState<ModelLibrary[]>([]);
  const [backgroundMining, setBackgroundMining] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [form] = Form.useForm();

  // Load system status
  useEffect(() => {
    loadSystemStatus();
    const interval = setInterval(loadSystemStatus, 30000); // Update every 30s
    return () => clearInterval(interval);
  }, []);

  // Load campaigns
  useEffect(() => {
    loadCampaigns();
  }, []);

  // Load model library
  useEffect(() => {
    loadModelLibrary();
  }, []);

  const loadSystemStatus = async () => {
    try {
      const response = await fetch('/api/neural-seo/status');
      const data = await response.json();
      setSystemStatus(data);
      setBackgroundMining(data.backgroundMining);
    } catch (error) {
      console.error('Failed to load system status:', error);
    }
  };

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/neural-seo/campaigns');
      const data = await response.json();
      setCampaigns(data.campaigns || []);
    } catch (error) {
      message.error('Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  };

  const loadModelLibrary = async () => {
    // Load pre-configured TensorFlow/Keras models for SEO
    const library: ModelLibrary[] = [
      {
        id: 'seo-optimizer-v1',
        name: 'SEO Score Optimizer',
        type: 'regression',
        description: 'Predicts optimal SEO configurations based on 192 attributes',
        inputDimensions: 192,
        outputDimensions: 50,
        attributes: ['all'],
        recommended: true,
        preTrainedUrl: '/models/seo-optimizer-v1.json'
      },
      {
        id: 'content-quality-v1',
        name: 'Content Quality Analyzer',
        type: 'classification',
        description: 'Analyzes content quality and readability metrics',
        inputDimensions: 30,
        outputDimensions: 5,
        attributes: ['content-quality'],
        recommended: true
      },
      {
        id: 'backlink-optimizer-v1',
        name: 'Backlink Network Optimizer',
        type: 'sequential',
        description: 'Optimizes backlink strategies and network building',
        inputDimensions: 50,
        outputDimensions: 20,
        attributes: ['backlink'],
        recommended: true
      },
      {
        id: 'performance-predictor-v1',
        name: 'Performance Predictor',
        type: 'regression',
        description: 'Predicts Core Web Vitals and performance metrics',
        inputDimensions: 25,
        outputDimensions: 10,
        attributes: ['performance'],
        recommended: false
      },
      {
        id: 'technical-seo-v1',
        name: 'Technical SEO Auditor',
        type: 'classification',
        description: 'Identifies technical SEO issues and fixes',
        inputDimensions: 22,
        outputDimensions: 15,
        attributes: ['technical-seo'],
        recommended: false
      }
    ];
    setModelLibrary(library);
  };

  const validateAttributes = async (campaignId: string, url: string) => {
    try {
      const encodedUrl = encodeURIComponent(url);
      const response = await fetch(`/api/neural-seo/attributes/validate/${campaignId}/${encodedUrl}`);
      const data = await response.json();
      setAttributeValidation(data.validation);
      
      if (data.validation.coverage < 100) {
        message.warning(`Attribute coverage: ${data.validation.coverage.toFixed(1)}%. ${data.validation.missing.length} attributes missing.`);
      } else {
        message.success('All 192 attributes present!');
      }
    } catch (error) {
      message.error('Failed to validate attributes');
    }
  };

  const createCampaign = async (values: any) => {
    try {
      setLoading(true);
      const response = await fetch('/api/neural-seo/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: values.name,
          type: values.type,
          startUrls: values.startUrls.split('\n').filter((url: string) => url.trim()),
          config: {
            maxDepth: values.maxDepth || 3,
            maxPages: values.maxPages || 1000,
            modelId: values.modelId
          }
        })
      });
      
      if (response.ok) {
        message.success('Campaign created successfully');
        setCreateModalVisible(false);
        form.resetFields();
        loadCampaigns();
      } else {
        message.error('Failed to create campaign');
      }
    } catch (error) {
      message.error('Error creating campaign');
    } finally {
      setLoading(false);
    }
  };

  const toggleBackgroundMining = async () => {
    try {
      const endpoint = backgroundMining ? 'stop' : 'start';
      const response = await fetch(`/api/neural-seo/background-mining/${endpoint}`, {
        method: 'POST'
      });
      
      if (response.ok) {
        setBackgroundMining(!backgroundMining);
        message.success(`Background mining ${backgroundMining ? 'stopped' : 'started'}`);
        loadSystemStatus();
      }
    } catch (error) {
      message.error('Failed to toggle background mining');
    }
  };

  const campaignColumns = [
    {
      title: 'Campaign Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Campaign) => (
        <Space>
          <strong>{text}</strong>
          {record.neuralInstance && (
            <Tooltip title="Neural Network Active">
              <ThunderboltOutlined style={{ color: '#1890ff' }} />
            </Tooltip>
          )}
        </Space>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const colors: Record<string, string> = {
          active: 'green',
          paused: 'orange',
          completed: 'blue',
          error: 'red'
        };
        return <Tag color={colors[status] || 'default'}>{status.toUpperCase()}</Tag>;
      }
    },
    {
      title: 'URLs Crawled',
      dataIndex: ['stats', 'urlsCrawled'],
      key: 'crawled',
      render: (num: number) => <Statistic value={num} valueStyle={{ fontSize: '14px' }} />
    },
    {
      title: 'Attributes Mined',
      dataIndex: ['stats', 'attributesMined'],
      key: 'attributes',
      render: (num: number) => <Statistic value={num} valueStyle={{ fontSize: '14px' }} />
    },
    {
      title: 'Neural Accuracy',
      key: 'accuracy',
      render: (record: Campaign) => {
        if (record.neuralInstance) {
          return (
            <Progress 
              type="circle" 
              percent={Math.round(record.neuralInstance.accuracy * 100)} 
              width={50}
              format={percent => `${percent}%`}
            />
          );
        }
        return <span style={{ color: '#999' }}>N/A</span>;
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: Campaign) => (
        <Space>
          <Button 
            size="small" 
            icon={<EyeOutlined />}
            onClick={() => setSelectedCampaign(record.id)}
          >
            View
          </Button>
          <Button 
            size="small" 
            icon={<LineChartOutlined />}
            onClick={() => message.info('Metrics view coming soon')}
          >
            Metrics
          </Button>
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card>
            <Row gutter={16} align="middle">
              <Col flex="auto">
                <h1 style={{ margin: 0 }}>
                  <RocketOutlined /> Neural SEO Campaign Manager
                </h1>
              </Col>
              <Col>
                <Space>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setCreateModalVisible(true)}
                  >
                    Create Campaign
                  </Button>
                  <Button
                    icon={<ReloadOutlined />}
                    onClick={loadCampaigns}
                  >
                    Refresh
                  </Button>
                </Space>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* System Status */}
        <Col span={24}>
          <Card title="System Status" extra={
            <Switch
              checked={backgroundMining}
              onChange={toggleBackgroundMining}
              checkedChildren="Background Mining ON"
              unCheckedChildren="Background Mining OFF"
            />
          }>
            <Row gutter={16}>
              <Col span={6}>
                <Statistic
                  title="Active Campaigns"
                  value={systemStatus?.campaigns?.active || 0}
                  prefix={<DatabaseOutlined />}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="Neural Networks"
                  value={systemStatus?.neuralNetworks?.total || 0}
                  prefix={<ThunderboltOutlined />}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="Total Attributes Mined"
                  value={systemStatus?.crawling?.totalAttributesMined || 0}
                  prefix={<CheckCircleOutlined />}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="System Health"
                  value={systemStatus?.monitoring?.systemHealth || 'N/A'}
                  prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                />
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Main Content */}
        <Col span={24}>
          <Card>
            <Tabs activeKey="campaigns">
              <TabPane tab="Campaigns" key="campaigns">
                <Table
                  dataSource={campaigns}
                  columns={campaignColumns}
                  rowKey="id"
                  loading={loading}
                  pagination={{ pageSize: 10 }}
                />
              </TabPane>

              <TabPane tab="Model Library" key="models">
                <Alert
                  message="Pre-configured TensorFlow Models"
                  description="Select from our library of pre-trained models optimized for SEO attribute harvesting"
                  type="info"
                  showIcon
                  style={{ marginBottom: 16 }}
                />
                <List
                  dataSource={modelLibrary}
                  renderItem={model => (
                    <Card
                      style={{ marginBottom: 16 }}
                      extra={
                        model.recommended && <Tag color="gold">Recommended</Tag>
                      }
                    >
                      <Descriptions column={2} size="small">
                        <Descriptions.Item label="Name" span={2}>
                          <strong>{model.name}</strong>
                        </Descriptions.Item>
                        <Descriptions.Item label="Type">{model.type}</Descriptions.Item>
                        <Descriptions.Item label="Model ID">
                          <code>{model.id}</code>
                        </Descriptions.Item>
                        <Descriptions.Item label="Input">{model.inputDimensions} features</Descriptions.Item>
                        <Descriptions.Item label="Output">{model.outputDimensions} predictions</Descriptions.Item>
                        <Descriptions.Item label="Description" span={2}>
                          {model.description}
                        </Descriptions.Item>
                        <Descriptions.Item label="Attributes" span={2}>
                          {model.attributes.map(attr => (
                            <Tag key={attr}>{attr}</Tag>
                          ))}
                        </Descriptions.Item>
                      </Descriptions>
                      <div style={{ marginTop: 12 }}>
                        <Space>
                          <Button size="small" type="primary" icon={<DownloadOutlined />}>
                            Use Model
                          </Button>
                          {model.preTrainedUrl && (
                            <Button size="small" icon={<DownloadOutlined />}>
                              Download Pre-trained
                            </Button>
                          )}
                        </Space>
                      </div>
                    </Card>
                  )}
                />
              </TabPane>

              <TabPane tab="Attribute Configuration" key="attributes">
                <Alert
                  message="192 SEO Attributes"
                  description="All SEO attributes are automatically extracted and validated. Missing attributes are completed using neural networks."
                  type="success"
                  showIcon
                  style={{ marginBottom: 16 }}
                />
                
                {attributeValidation && (
                  <Card title="Attribute Coverage">
                    <Progress
                      percent={Math.round(attributeValidation.coverage)}
                      status={attributeValidation.complete ? 'success' : 'active'}
                    />
                    <Divider />
                    <Row gutter={16}>
                      <Col span={8}>
                        <Statistic
                          title="Total Attributes"
                          value={attributeValidation.total}
                        />
                      </Col>
                      <Col span={8}>
                        <Statistic
                          title="Present"
                          value={attributeValidation.present}
                          valueStyle={{ color: '#3f8600' }}
                        />
                      </Col>
                      <Col span={8}>
                        <Statistic
                          title="Missing"
                          value={attributeValidation.missing.length}
                          valueStyle={{ color: '#cf1322' }}
                        />
                      </Col>
                    </Row>
                    {attributeValidation.missing.length > 0 && (
                      <>
                        <Divider />
                        <Collapse>
                          <Panel header={`Missing Attributes (${attributeValidation.missing.length})`} key="1">
                            {attributeValidation.missing.map(attr => (
                              <Tag key={attr} style={{ margin: 4 }}>{attr}</Tag>
                            ))}
                          </Panel>
                        </Collapse>
                      </>
                    )}
                  </Card>
                )}
              </TabPane>
            </Tabs>
          </Card>
        </Col>
      </Row>

      {/* Create Campaign Modal */}
      <Modal
        title="Create New SEO Campaign"
        visible={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        footer={null}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={createCampaign}
        >
          <Form.Item
            name="name"
            label="Campaign Name"
            rules={[{ required: true, message: 'Please enter campaign name' }]}
          >
            <Input placeholder="e.g., my-website-audit" />
          </Form.Item>

          <Form.Item
            name="type"
            label="Campaign Type"
            rules={[{ required: true }]}
            initialValue="continuous"
          >
            <Select>
              <Option value="single-run">Single Run</Option>
              <Option value="continuous">Continuous</Option>
              <Option value="scheduled">Scheduled</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="modelId"
            label="Neural Network Model"
            tooltip="Select a pre-configured model from the library"
          >
            <Select placeholder="Select a model" allowClear>
              {modelLibrary.filter(m => m.recommended).map(model => (
                <Option key={model.id} value={model.id}>
                  {model.name} - {model.description}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="startUrls"
            label="Start URLs (one per line)"
            rules={[{ required: true, message: 'Please enter at least one URL' }]}
          >
            <TextArea 
              rows={4} 
              placeholder="https://example.com&#10;https://example.com/about&#10;https://example.com/products"
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="maxDepth"
                label="Max Crawl Depth"
                initialValue={3}
              >
                <InputNumber min={1} max={10} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="maxPages"
                label="Max Pages"
                initialValue={1000}
              >
                <InputNumber min={1} max={10000} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                Create Campaign
              </Button>
              <Button onClick={() => setCreateModalVisible(false)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default NeuralSEOCampaignAdmin;
