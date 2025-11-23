/**
 * Neural Network Management Page
 * Comprehensive dashboard for managing neural network instances with:
 * - Dataset upload and management
 * - Training configuration
 * - Model selection and deployment
 * - Integration with crawler, seeding, and SEO campaigns
 * - Data stream and attribute management
 */

import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Typography,
  Button,
  Table,
  Tag,
  Space,
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  message,
  Statistic,
  Progress,
  Tabs,
  Tooltip,
  Badge,
  Descriptions,
  Alert,
  Upload,
  Divider,
  Switch,
  Collapse,
  Tree,
  List,
  Empty,
  Spin,
} from 'antd';
import {
  PlusOutlined,
  PlayCircleOutlined,
  DeleteOutlined,
  EyeOutlined,
  ReloadOutlined,
  ThunderboltOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined,
  RocketOutlined,
  DatabaseOutlined,
  LineChartOutlined,
  UploadOutlined,
  DownloadOutlined,
  ApiOutlined,
  BranchesOutlined,
  SettingOutlined,
  FundOutlined,
  SyncOutlined,
  CloudUploadOutlined,
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { Panel } = Collapse;

interface NeuralNetworkInstance {
  id: string;
  clientId: string;
  modelType: string;
  status: string;
  version: string;
  trainingConfig: any;
  dataConfig: any;
  performance?: any;
  metadata: any;
  relationships?: {
    crawler?: string[];
    seeder?: string[];
    attributes?: string[];
    dataStreams?: string[];
  };
}

interface DataStream {
  id: string;
  name: string;
  attributes: string[];
  status: string;
}

interface Attribute {
  id: string;
  name: string;
  type: string;
  config: {
    algorithm?: string;
    drillDown?: boolean;
    dataMining?: boolean;
    training?: boolean;
  };
  relatedItems?: string[];
}

export const NeuralNetworkManagementPage: React.FC = () => {
  const [instances, setInstances] = useState<NeuralNetworkInstance[]>([]);
  const [selectedInstance, setSelectedInstance] = useState<NeuralNetworkInstance | null>(null);
  const [dataStreams, setDataStreams] = useState<DataStream[]>([]);
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [loading, setLoading] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [datasetModalVisible, setDatasetModalVisible] = useState(false);
  const [attributeModalVisible, setAttributeModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('instances');
  const [form] = Form.useForm();
  const [datasetForm] = Form.useForm();
  const [attributeForm] = Form.useForm();

  // Model types with descriptions
  const modelTypes = [
    { value: 'seo_optimization', label: 'SEO Optimization', description: 'Optimize content for search engines' },
    { value: 'content_generation', label: 'Content Generation', description: 'Generate high-quality content' },
    { value: 'crawler_optimization', label: 'Crawler Optimization', description: 'Improve web crawling efficiency' },
    { value: 'data_mining', label: 'Data Mining', description: 'Extract valuable insights from data' },
    { value: 'pattern_recognition', label: 'Pattern Recognition', description: 'Identify patterns in data' },
    { value: 'sentiment_analysis', label: 'Sentiment Analysis', description: 'Analyze sentiment in text' },
  ];

  useEffect(() => {
    loadInstances();
    loadDataStreams();
    loadAttributes();
  }, []);

  const loadInstances = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/neural-networks/instances');
      if (response.ok) {
        const data = await response.json();
        setInstances(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Failed to load neural network instances:', error);
      message.error('Failed to load neural network instances');
    } finally {
      setLoading(false);
    }
  };

  const loadDataStreams = async () => {
    try {
      const response = await fetch('/api/data-streams');
      if (response.ok) {
        const data = await response.json();
        setDataStreams(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Failed to load data streams:', error);
    }
  };

  const loadAttributes = async () => {
    try {
      const response = await fetch('/api/attributes');
      if (response.ok) {
        const data = await response.json();
        setAttributes(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Failed to load attributes:', error);
    }
  };

  const handleCreateInstance = async (values: any) => {
    try {
      // Add default configurations for scraping and data mining models
      const instanceData = {
        ...values,
        metadata: {
          name: values.name,
          description: values.description,
          defaultModels: ['scraping', 'data_mining'],
        },
        trainingConfig: {
          epochs: values.epochs || 50,
          batchSize: values.batchSize || 32,
          learningRate: values.learningRate || 0.001,
        },
        relationships: {
          crawler: values.crawlerIds || [],
          seeder: values.seederIds || [],
          attributes: values.attributeIds || [],
        },
      };

      const response = await fetch('/api/neural-networks/instances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(instanceData),
      });

      if (response.ok) {
        message.success('Neural network instance created successfully');
        setCreateModalVisible(false);
        form.resetFields();
        loadInstances();
      } else {
        const error = await response.json();
        message.error(error.message || 'Failed to create instance');
      }
    } catch (error) {
      console.error('Error creating instance:', error);
      message.error('Error creating instance');
    }
  };

  const handleUploadDataset = async (values: any) => {
    try {
      if (!selectedInstance) return;

      const formData = new FormData();
      formData.append('instanceId', selectedInstance.id);
      formData.append('datasetName', values.datasetName);
      formData.append('datasetType', values.datasetType);
      
      if (values.file?.fileList?.[0]?.originFileObj) {
        formData.append('file', values.file.fileList[0].originFileObj);
      }

      const response = await fetch('/api/neural-networks/datasets/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        message.success('Dataset uploaded successfully');
        setDatasetModalVisible(false);
        datasetForm.resetFields();
        loadInstances();
      } else {
        message.error('Failed to upload dataset');
      }
    } catch (error) {
      console.error('Error uploading dataset:', error);
      message.error('Error uploading dataset');
    }
  };

  const handleTrainInstance = async (instanceId: string) => {
    try {
      const response = await fetch(`/api/neural-networks/instances/${instanceId}/train`, {
        method: 'POST',
      });

      if (response.ok) {
        message.success('Training started');
        loadInstances();
      } else {
        message.error('Failed to start training');
      }
    } catch (error) {
      console.error('Error starting training:', error);
      message.error('Error starting training');
    }
  };

  const handleDeleteInstance = async (instanceId: string) => {
    Modal.confirm({
      title: 'Delete Neural Network Instance',
      content: 'Are you sure you want to delete this instance?',
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          await fetch(`/api/neural-networks/instances/${instanceId}`, { method: 'DELETE' });
          message.success('Instance deleted');
          loadInstances();
        } catch (error) {
          console.error('Error deleting instance:', error);
          message.error('Error deleting instance');
        }
      },
    });
  };

  const handleCreateAttribute = async (values: any) => {
    try {
      const response = await fetch('/api/attributes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...values,
          config: {
            algorithm: values.algorithm,
            drillDown: values.drillDown,
            dataMining: values.dataMining,
            training: values.training,
          },
        }),
      });

      if (response.ok) {
        message.success('Attribute created successfully');
        setAttributeModalVisible(false);
        attributeForm.resetFields();
        loadAttributes();
      } else {
        message.error('Failed to create attribute');
      }
    } catch (error) {
      console.error('Error creating attribute:', error);
      message.error('Error creating attribute');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ready':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'training':
        return <ThunderboltOutlined style={{ color: '#1890ff' }} />;
      case 'error':
        return <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />;
      default:
        return <ClockCircleOutlined style={{ color: '#faad14' }} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready':
        return 'success';
      case 'training':
        return 'processing';
      case 'error':
        return 'error';
      default:
        return 'default';
    }
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: ['metadata', 'name'],
      key: 'name',
      render: (text: string, record: NeuralNetworkInstance) => (
        <Space>
          {getStatusIcon(record.status)}
          <Text strong>{text || record.id}</Text>
        </Space>
      ),
    },
    {
      title: 'Model Type',
      dataIndex: 'modelType',
      key: 'modelType',
      render: (type: string) => {
        const modelType = modelTypes.find((m) => m.value === type);
        return (
          <Tooltip title={modelType?.description}>
            <Tag color="blue">{modelType?.label || type}</Tag>
          </Tooltip>
        );
      },
    },
    {
      title: 'Client',
      dataIndex: 'clientId',
      key: 'clientId',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => <Tag color={getStatusColor(status)}>{status.toUpperCase()}</Tag>,
    },
    {
      title: 'Performance',
      key: 'performance',
      render: (_: any, record: NeuralNetworkInstance) => {
        if (!record.performance) return <Text type="secondary">N/A</Text>;
        return (
          <Space direction="vertical" size="small">
            <Text>Accuracy: {((record.performance.accuracy || 0) * 100).toFixed(1)}%</Text>
            {record.performance.loss && <Text type="secondary">Loss: {record.performance.loss.toFixed(4)}</Text>}
          </Space>
        );
      },
    },
    {
      title: 'Version',
      dataIndex: 'version',
      key: 'version',
      render: (version: string) => <Tag>{version}</Tag>,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: NeuralNetworkInstance) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              type="link"
              icon={<EyeOutlined />}
              onClick={() => {
                setSelectedInstance(record);
                setActiveTab('details');
              }}
            />
          </Tooltip>
          <Tooltip title="Train Model">
            <Button
              type="link"
              icon={<PlayCircleOutlined />}
              onClick={() => handleTrainInstance(record.id)}
              disabled={record.status === 'training'}
            />
          </Tooltip>
          <Tooltip title="Upload Dataset">
            <Button
              type="link"
              icon={<UploadOutlined />}
              onClick={() => {
                setSelectedInstance(record);
                setDatasetModalVisible(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDeleteInstance(record.id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <Title level={2}>
          <RocketOutlined /> Neural Network Management
        </Title>
        <Paragraph>
          Manage neural network instances, upload datasets, configure training, and integrate with crawler and SEO campaigns.
        </Paragraph>
      </div>

      <Row gutter={[16, 16]} className="mb-4">
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Instances"
              value={instances.length}
              prefix={<DatabaseOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Active Training"
              value={instances.filter((i) => i.status === 'training').length}
              prefix={<ThunderboltOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Ready Models"
              value={instances.filter((i) => i.status === 'ready').length}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Data Streams"
              value={dataStreams.length}
              prefix={<BranchesOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="Instances" key="instances">
            <div className="mb-4">
              <Space>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateModalVisible(true)}>
                  Create Instance
                </Button>
                <Button icon={<ReloadOutlined />} onClick={loadInstances}>
                  Refresh
                </Button>
              </Space>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '50px' }}>
                <Spin size="large" />
              </div>
            ) : (
              <Table
                columns={columns}
                dataSource={instances}
                rowKey="id"
                pagination={{ pageSize: 10 }}
                locale={{
                  emptyText: (
                    <Empty
                      description="No neural network instances yet. Create your first instance to get started."
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                  ),
                }}
              />
            )}
          </TabPane>

          <TabPane tab="Data Streams" key="dataStreams">
            <Alert
              message="Data Stream Management"
              description="Configure data streams to combine multiple attributes for neural network training."
              type="info"
              showIcon
              className="mb-4"
            />
            <Button type="primary" icon={<PlusOutlined />} className="mb-4">
              Create Data Stream
            </Button>
            <List
              dataSource={dataStreams}
              renderItem={(stream) => (
                <List.Item
                  actions={[
                    <Button type="link" icon={<EyeOutlined />}>
                      View
                    </Button>,
                    <Button type="link" icon={<SettingOutlined />}>
                      Configure
                    </Button>,
                  ]}
                >
                  <List.Item.Meta
                    avatar={<BranchesOutlined style={{ fontSize: 24 }} />}
                    title={stream.name}
                    description={`${stream.attributes.length} attributes | Status: ${stream.status}`}
                  />
                </List.Item>
              )}
              locale={{
                emptyText: <Empty description="No data streams configured" />,
              }}
            />
          </TabPane>

          <TabPane tab="Attributes" key="attributes">
            <Alert
              message="Attribute Configuration"
              description="Define attributes with algorithms, drill-down capabilities, and data mining settings for SEO and other use cases."
              type="info"
              showIcon
              className="mb-4"
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setAttributeModalVisible(true)}
              className="mb-4"
            >
              Create Attribute
            </Button>
            <List
              grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4 }}
              dataSource={attributes}
              renderItem={(attr) => (
                <List.Item>
                  <Card
                    size="small"
                    title={attr.name}
                    extra={<Tag color="blue">{attr.type}</Tag>}
                    actions={[
                      <Tooltip title="Drill Down">
                        <Button type="link" icon={<FundOutlined />} disabled={!attr.config.drillDown} />
                      </Tooltip>,
                      <Tooltip title="Configure">
                        <Button type="link" icon={<SettingOutlined />} />
                      </Tooltip>,
                    ]}
                  >
                    <Space direction="vertical" size="small" style={{ width: '100%' }}>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Algorithm: {attr.config.algorithm || 'N/A'}
                      </Text>
                      <Space>
                        {attr.config.dataMining && <Tag color="green">Data Mining</Tag>}
                        {attr.config.training && <Tag color="blue">Training</Tag>}
                        {attr.config.drillDown && <Tag color="purple">Drill Down</Tag>}
                      </Space>
                    </Space>
                  </Card>
                </List.Item>
              )}
              locale={{
                emptyText: <Empty description="No attributes configured" />,
              }}
            />
          </TabPane>

          <TabPane tab="Details" key="details" disabled={!selectedInstance}>
            {selectedInstance && (
              <div>
                <Descriptions title="Instance Details" bordered>
                  <Descriptions.Item label="ID">{selectedInstance.id}</Descriptions.Item>
                  <Descriptions.Item label="Client ID">{selectedInstance.clientId}</Descriptions.Item>
                  <Descriptions.Item label="Status">
                    <Badge status={selectedInstance.status === 'ready' ? 'success' : 'processing'} text={selectedInstance.status} />
                  </Descriptions.Item>
                  <Descriptions.Item label="Model Type">{selectedInstance.modelType}</Descriptions.Item>
                  <Descriptions.Item label="Version">{selectedInstance.version}</Descriptions.Item>
                  <Descriptions.Item label="Name">{selectedInstance.metadata.name}</Descriptions.Item>
                </Descriptions>

                <Divider />

                <Collapse defaultActiveKey={['1', '2', '3']}>
                  <Panel header="Training Configuration" key="1">
                    <Descriptions bordered size="small">
                      <Descriptions.Item label="Epochs">{selectedInstance.trainingConfig.epochs}</Descriptions.Item>
                      <Descriptions.Item label="Batch Size">{selectedInstance.trainingConfig.batchSize}</Descriptions.Item>
                      <Descriptions.Item label="Learning Rate">{selectedInstance.trainingConfig.learningRate}</Descriptions.Item>
                    </Descriptions>
                  </Panel>

                  <Panel header="Performance Metrics" key="2">
                    {selectedInstance.performance ? (
                      <Row gutter={16}>
                        <Col span={8}>
                          <Card>
                            <Statistic
                              title="Accuracy"
                              value={(selectedInstance.performance.accuracy * 100).toFixed(2)}
                              suffix="%"
                            />
                          </Card>
                        </Col>
                        <Col span={8}>
                          <Card>
                            <Statistic
                              title="Loss"
                              value={selectedInstance.performance.loss?.toFixed(4)}
                            />
                          </Card>
                        </Col>
                        <Col span={8}>
                          <Card>
                            <Statistic
                              title="Predictions"
                              value={selectedInstance.performance.predictionCount || 0}
                            />
                          </Card>
                        </Col>
                      </Row>
                    ) : (
                      <Empty description="No performance metrics available yet" />
                    )}
                  </Panel>

                  <Panel header="Relationships" key="3">
                    <Descriptions bordered size="small">
                      <Descriptions.Item label="Crawlers" span={3}>
                        {selectedInstance.relationships?.crawler?.length ? (
                          <Space>
                            {selectedInstance.relationships.crawler.map((id) => (
                              <Tag key={id}>{id}</Tag>
                            ))}
                          </Space>
                        ) : (
                          <Text type="secondary">No crawlers linked</Text>
                        )}
                      </Descriptions.Item>
                      <Descriptions.Item label="Seeders" span={3}>
                        {selectedInstance.relationships?.seeder?.length ? (
                          <Space>
                            {selectedInstance.relationships.seeder.map((id) => (
                              <Tag key={id}>{id}</Tag>
                            ))}
                          </Space>
                        ) : (
                          <Text type="secondary">No seeders linked</Text>
                        )}
                      </Descriptions.Item>
                      <Descriptions.Item label="Attributes" span={3}>
                        {selectedInstance.relationships?.attributes?.length ? (
                          <Space>
                            {selectedInstance.relationships.attributes.map((id) => (
                              <Tag key={id}>{id}</Tag>
                            ))}
                          </Space>
                        ) : (
                          <Text type="secondary">No attributes linked</Text>
                        )}
                      </Descriptions.Item>
                    </Descriptions>
                  </Panel>
                </Collapse>
              </div>
            )}
          </TabPane>

          <TabPane tab="SEO Integration" key="seo">
            <Alert
              message="SEO Campaign Integration"
              description="Configure neural network instances to work with SEO campaigns, optimizing crawling, content generation, and ranking."
              type="info"
              showIcon
              className="mb-4"
            />
            <Card title="SEO Neural Network Configuration">
              <Form layout="vertical">
                <Form.Item label="SEO Campaign" name="campaignId">
                  <Select placeholder="Select SEO campaign">
                    <Option value="seo-1">Main SEO Campaign</Option>
                    <Option value="seo-2">Content Optimization Campaign</Option>
                  </Select>
                </Form.Item>
                <Form.Item label="SEO Attributes">
                  <Select mode="tags" placeholder="Select SEO attributes">
                    <Option value="meta-tags">Meta Tags</Option>
                    <Option value="keywords">Keywords</Option>
                    <Option value="backlinks">Backlinks</Option>
                    <Option value="trust-score">Trust Score</Option>
                    <Option value="ranking">Ranking</Option>
                  </Select>
                </Form.Item>
                <Form.Item>
                  <Button type="primary" icon={<SyncOutlined />}>
                    Configure SEO Integration
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </TabPane>
        </Tabs>
      </Card>

      {/* Create Instance Modal */}
      <Modal
        title="Create Neural Network Instance"
        open={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        footer={null}
        width={700}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateInstance}>
          <Form.Item label="Instance Name" name="name" rules={[{ required: true }]}>
            <Input placeholder="Enter instance name" />
          </Form.Item>

          <Form.Item label="Description" name="description">
            <Input.TextArea rows={3} placeholder="Describe the purpose of this neural network" />
          </Form.Item>

          <Form.Item label="Client ID" name="clientId" rules={[{ required: true }]}>
            <Input placeholder="Enter client identifier" />
          </Form.Item>

          <Form.Item label="Model Type" name="modelType" rules={[{ required: true }]}>
            <Select placeholder="Select model type">
              {modelTypes.map((type) => (
                <Option key={type.value} value={type.value}>
                  <div>
                    <div>{type.label}</div>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {type.description}
                    </Text>
                  </div>
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="Epochs" name="epochs" initialValue={50}>
                <InputNumber min={1} max={1000} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Batch Size" name="batchSize" initialValue={32}>
                <InputNumber min={1} max={256} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Learning Rate" name="learningRate" initialValue={0.001}>
                <InputNumber min={0.0001} max={0.1} step={0.001} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Divider>Relationships</Divider>

          <Form.Item label="Link to Crawlers" name="crawlerIds">
            <Select mode="tags" placeholder="Select or enter crawler IDs" />
          </Form.Item>

          <Form.Item label="Link to Seeders" name="seederIds">
            <Select mode="tags" placeholder="Select or enter seeder IDs" />
          </Form.Item>

          <Form.Item label="Link to Attributes" name="attributeIds">
            <Select mode="tags" placeholder="Select or enter attribute IDs">
              {attributes.map((attr) => (
                <Option key={attr.id} value={attr.id}>
                  {attr.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" icon={<PlusOutlined />}>
                Create Instance
              </Button>
              <Button onClick={() => setCreateModalVisible(false)}>Cancel</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Upload Dataset Modal */}
      <Modal
        title="Upload Training Dataset"
        open={datasetModalVisible}
        onCancel={() => setDatasetModalVisible(false)}
        footer={null}
      >
        <Form form={datasetForm} layout="vertical" onFinish={handleUploadDataset}>
          <Form.Item label="Dataset Name" name="datasetName" rules={[{ required: true }]}>
            <Input placeholder="Enter dataset name" />
          </Form.Item>

          <Form.Item label="Dataset Type" name="datasetType" rules={[{ required: true }]}>
            <Select placeholder="Select dataset type">
              <Option value="training">Training Data</Option>
              <Option value="validation">Validation Data</Option>
              <Option value="testing">Testing Data</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Dataset File"
            name="file"
            valuePropName="file"
            rules={[{ required: true, message: 'Please upload a dataset file' }]}
          >
            <Upload
              beforeUpload={() => false}
              maxCount={1}
              accept=".csv,.json,.txt"
            >
              <Button icon={<CloudUploadOutlined />}>Select File</Button>
            </Upload>
          </Form.Item>

          <Alert
            message="Supported Formats"
            description="CSV, JSON, or TXT files. The file should contain labeled training data."
            type="info"
            showIcon
            className="mb-4"
          />

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" icon={<UploadOutlined />}>
                Upload Dataset
              </Button>
              <Button onClick={() => setDatasetModalVisible(false)}>Cancel</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Create Attribute Modal */}
      <Modal
        title="Create Attribute"
        open={attributeModalVisible}
        onCancel={() => setAttributeModalVisible(false)}
        footer={null}
      >
        <Form form={attributeForm} layout="vertical" onFinish={handleCreateAttribute}>
          <Form.Item label="Attribute Name" name="name" rules={[{ required: true }]}>
            <Input placeholder="Enter attribute name (e.g., 'meta_description')" />
          </Form.Item>

          <Form.Item label="Attribute Type" name="type" rules={[{ required: true }]}>
            <Select placeholder="Select attribute type">
              <Option value="seo">SEO Attribute</Option>
              <Option value="content">Content Attribute</Option>
              <Option value="metadata">Metadata</Option>
              <Option value="behavioral">Behavioral</Option>
            </Select>
          </Form.Item>

          <Form.Item label="Algorithm" name="algorithm">
            <Select placeholder="Select algorithm">
              <Option value="ranking">Ranking Algorithm</Option>
              <Option value="classification">Classification</Option>
              <Option value="clustering">Clustering</Option>
              <Option value="regression">Regression</Option>
            </Select>
          </Form.Item>

          <Divider>Configuration</Divider>

          <Form.Item label="Enable Data Mining" name="dataMining" valuePropName="checked">
            <Switch />
          </Form.Item>

          <Form.Item label="Enable Training" name="training" valuePropName="checked">
            <Switch />
          </Form.Item>

          <Form.Item label="Enable Drill Down" name="drillDown" valuePropName="checked">
            <Switch />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" icon={<PlusOutlined />}>
                Create Attribute
              </Button>
              <Button onClick={() => setAttributeModalVisible(false)}>Cancel</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default NeuralNetworkManagementPage;
