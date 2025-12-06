/**
 * Training Data Dashboard
 * 
 * Dashboard for training data mining, bundling, attribute discovery,
 * and schema linking for ML/AI model training.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Row,
  Col,
  Button,
  Table,
  Tag,
  Space,
  Statistic,
  Input,
  Select,
  Tabs,
  Modal,
  Form,
  List,
  Badge,
  Tooltip,
  Empty,
  message,
  Progress,
  Descriptions,
  Alert,
} from 'antd';
import {
  DatabaseOutlined,
  CloudUploadOutlined,
  SearchOutlined,
  PlusOutlined,
  ReloadOutlined,
  EyeOutlined,
  RocketOutlined,
  ExperimentOutlined,
  LinkOutlined,
  ThunderboltOutlined,
  FileSearchOutlined,
  BulbOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import { trainingDataAPI, ModelType, FunctionalityConfig, MiningResult, LinkedSchema } from '../../services/apiService';

const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

export const TrainingDataDashboard: React.FC = () => {
  // State
  const [modelTypes, setModelTypes] = useState<ModelType[]>([]);
  const [functionalities, setFunctionalities] = useState<FunctionalityConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [mining, setMining] = useState(false);
  const [activeTab, setActiveTab] = useState('mine');
  
  // Mining state
  const [miningResults, setMiningResults] = useState<MiningResult[]>([]);
  const [selectedModelType, setSelectedModelType] = useState<string>('');
  const [miningUrls, setMiningUrls] = useState<string>('');
  
  // Bundle state
  const [selectedFunctionality, setSelectedFunctionality] = useState<string>('');
  const [bundleUrls, setBundleUrls] = useState<string>('');
  const [bundleResult, setBundleResult] = useState<any>(null);
  
  // Modal states
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [discoverModalVisible, setDiscoverModalVisible] = useState(false);
  const [discoveryResult, setDiscoveryResult] = useState<any>(null);
  
  const [form] = Form.useForm();

  // Fetch data
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [modelTypesData, funcData] = await Promise.all([
        trainingDataAPI.getModelTypes(),
        trainingDataAPI.getFunctionalities(),
      ]);
      setModelTypes(modelTypesData);
      setFunctionalities(funcData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      message.error('Failed to load training data configuration');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handlers
  const handleMineData = async () => {
    if (!selectedModelType || !miningUrls.trim()) {
      message.error('Please select a model type and enter at least one URL');
      return;
    }

    const urls = miningUrls.split('\n').map(u => u.trim()).filter(u => u);
    if (urls.length === 0) {
      message.error('Please enter at least one valid URL');
      return;
    }

    setMining(true);
    try {
      if (urls.length === 1) {
        const result = await trainingDataAPI.mineData(urls[0], selectedModelType);
        setMiningResults([result]);
        message.success('Data mined successfully');
      } else {
        const result = await trainingDataAPI.mineBatch(urls, selectedModelType);
        setMiningResults(result.results);
        message.success(`Mined ${result.successful}/${result.total} URLs successfully`);
      }
    } catch (error) {
      message.error('Failed to mine data');
    } finally {
      setMining(false);
    }
  };

  const handleCreateBundle = async () => {
    if (!selectedFunctionality || !bundleUrls.trim()) {
      message.error('Please select a functionality and enter at least one URL');
      return;
    }

    const urls = bundleUrls.split('\n').map(u => u.trim()).filter(u => u);
    if (urls.length === 0) {
      message.error('Please enter at least one valid URL');
      return;
    }

    setMining(true);
    try {
      const bundle = await trainingDataAPI.createBundle(selectedFunctionality, urls);
      setBundleResult(bundle);
      message.success('Training bundle created successfully');
    } catch (error) {
      message.error('Failed to create bundle');
    } finally {
      setMining(false);
    }
  };

  const handleDiscoverAttributes = async (functionality: string) => {
    try {
      const result = await trainingDataAPI.discoverAttributes(functionality);
      setDiscoveryResult(result);
      setDiscoverModalVisible(true);
    } catch (error) {
      message.error('Failed to discover attributes');
    }
  };

  const handleViewResult = (result: any) => {
    setSelectedItem(result);
    setViewModalVisible(true);
  };

  // Model type columns
  const modelTypeColumns = [
    {
      title: 'Model Type',
      dataIndex: 'id',
      key: 'id',
      render: (id: string) => (
        <Space>
          <ExperimentOutlined />
          <span style={{ fontWeight: 500 }}>{id}</span>
        </Space>
      ),
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Attributes',
      key: 'attributes',
      render: (_: any, record: ModelType) => (
        <Badge count={record.attributes?.length || 0} style={{ backgroundColor: '#1890ff' }} />
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: ModelType) => (
        <Button
          size="small"
          onClick={() => {
            setSelectedModelType(record.id);
            setActiveTab('mine');
          }}
        >
          Use for Mining
        </Button>
      ),
    },
  ];

  // Functionality columns
  const functionalityColumns = [
    {
      title: 'Functionality',
      dataIndex: 'functionality',
      key: 'functionality',
      render: (func: string) => (
        <Space>
          <BulbOutlined />
          <span style={{ fontWeight: 500 }}>{func}</span>
        </Space>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Model Types',
      key: 'modelTypes',
      render: (_: any, record: FunctionalityConfig) => (
        <Space wrap>
          {record.modelTypes?.slice(0, 2).map((mt, i) => (
            <Tag key={i} color="blue">{mt}</Tag>
          ))}
          {(record.modelTypes?.length || 0) > 2 && (
            <Tag>+{record.modelTypes.length - 2}</Tag>
          )}
        </Space>
      ),
    },
    {
      title: 'Min Quality',
      dataIndex: 'minQualityScore',
      key: 'minQualityScore',
      render: (score: number) => (
        <Progress
          percent={score * 100}
          size="small"
          status={score >= 0.7 ? 'success' : 'normal'}
          format={(p) => `${Math.round(p || 0)}%`}
        />
      ),
      width: 120,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: FunctionalityConfig) => (
        <Space>
          <Tooltip title="Discover Attributes">
            <Button
              size="small"
              icon={<SearchOutlined />}
              onClick={() => handleDiscoverAttributes(record.functionality)}
            />
          </Tooltip>
          <Button
            size="small"
            onClick={() => {
              setSelectedFunctionality(record.functionality);
              setActiveTab('bundle');
            }}
          >
            Create Bundle
          </Button>
        </Space>
      ),
    },
  ];

  // Mining results columns
  const miningResultColumns = [
    {
      title: 'URL',
      dataIndex: 'url',
      key: 'url',
      ellipsis: true,
    },
    {
      title: 'Status',
      key: 'success',
      render: (_: any, record: MiningResult) => (
        record.success ? (
          <Tag icon={<CheckCircleOutlined />} color="success">Success</Tag>
        ) : (
          <Tag icon={<CloseCircleOutlined />} color="error">Failed</Tag>
        )
      ),
    },
    {
      title: 'Quality Score',
      dataIndex: 'qualityScore',
      key: 'qualityScore',
      render: (score: number) => score !== undefined ? (
        <Progress
          percent={Math.round(score * 100)}
          size="small"
          status={score >= 0.7 ? 'success' : score >= 0.4 ? 'normal' : 'exception'}
        />
      ) : '-',
      width: 120,
    },
    {
      title: 'Attributes',
      key: 'attributes',
      render: (_: any, record: MiningResult) => (
        <Badge count={Object.keys(record.attributes || {}).length} style={{ backgroundColor: '#52c41a' }} />
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: MiningResult) => (
        <Tooltip title="View Details">
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewResult(record)}
          />
        </Tooltip>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Row gutter={[16, 16]}>
        {/* Header */}
        <Col span={24}>
          <Card>
            <Row justify="space-between" align="middle">
              <Col>
                <Space>
                  <DatabaseOutlined style={{ fontSize: 24, color: '#1890ff' }} />
                  <div>
                    <h2 style={{ margin: 0 }}>Training Data</h2>
                    <p style={{ margin: 0, color: '#666' }}>
                      Mine, bundle, and prepare training data for ML/AI models
                    </p>
                  </div>
                </Space>
              </Col>
              <Col>
                <Space>
                  <Button icon={<ReloadOutlined />} onClick={fetchData} loading={loading}>
                    Refresh
                  </Button>
                </Space>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Stats Cards */}
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Model Types"
              value={modelTypes.length}
              prefix={<ExperimentOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Functionalities"
              value={functionalities.length}
              prefix={<BulbOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Mining Results"
              value={miningResults.length}
              prefix={<FileSearchOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Bundles Created"
              value={bundleResult ? 1 : 0}
              prefix={<CloudUploadOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>

        {/* Main Content */}
        <Col span={24}>
          <Card>
            <Tabs activeKey={activeTab} onChange={setActiveTab}>
              <TabPane tab="Mine Data" key="mine">
                <Row gutter={[16, 16]}>
                  <Col xs={24} md={12}>
                    <Card title="Data Mining" size="small">
                      <Form layout="vertical">
                        <Form.Item label="Model Type" required>
                          <Select
                            placeholder="Select model type"
                            value={selectedModelType}
                            onChange={setSelectedModelType}
                            style={{ width: '100%' }}
                          >
                            {modelTypes.map((mt) => (
                              <Option key={mt.id} value={mt.id}>
                                {mt.name || mt.id}
                              </Option>
                            ))}
                          </Select>
                        </Form.Item>
                        <Form.Item label="URLs (one per line)" required>
                          <TextArea
                            rows={4}
                            placeholder="https://example.com&#10;https://example2.com"
                            value={miningUrls}
                            onChange={(e) => setMiningUrls(e.target.value)}
                          />
                        </Form.Item>
                        <Form.Item>
                          <Button
                            type="primary"
                            icon={mining ? <LoadingOutlined /> : <ThunderboltOutlined />}
                            onClick={handleMineData}
                            loading={mining}
                            block
                          >
                            Mine Data
                          </Button>
                        </Form.Item>
                      </Form>
                    </Card>
                  </Col>
                  <Col xs={24} md={12}>
                    <Card title="Mining Results" size="small">
                      {miningResults.length > 0 ? (
                        <Table
                          dataSource={miningResults}
                          columns={miningResultColumns}
                          rowKey="url"
                          size="small"
                          pagination={false}
                        />
                      ) : (
                        <Empty description="No mining results yet" />
                      )}
                    </Card>
                  </Col>
                </Row>
              </TabPane>

              <TabPane tab="Create Bundle" key="bundle">
                <Row gutter={[16, 16]}>
                  <Col xs={24} md={12}>
                    <Card title="Training Bundle Creator" size="small">
                      <Form layout="vertical">
                        <Form.Item label="Functionality" required>
                          <Select
                            placeholder="Select functionality"
                            value={selectedFunctionality}
                            onChange={setSelectedFunctionality}
                            style={{ width: '100%' }}
                          >
                            {functionalities.map((func) => (
                              <Option key={func.functionality} value={func.functionality}>
                                {func.functionality} - {func.description}
                              </Option>
                            ))}
                          </Select>
                        </Form.Item>
                        <Form.Item label="URLs (one per line)" required>
                          <TextArea
                            rows={4}
                            placeholder="https://example.com&#10;https://example2.com"
                            value={bundleUrls}
                            onChange={(e) => setBundleUrls(e.target.value)}
                          />
                        </Form.Item>
                        <Form.Item>
                          <Button
                            type="primary"
                            icon={mining ? <LoadingOutlined /> : <RocketOutlined />}
                            onClick={handleCreateBundle}
                            loading={mining}
                            block
                          >
                            Create Training Bundle
                          </Button>
                        </Form.Item>
                      </Form>
                    </Card>
                  </Col>
                  <Col xs={24} md={12}>
                    {bundleResult ? (
                      <Card title="Bundle Created" size="small">
                        <Descriptions column={1} size="small">
                          <Descriptions.Item label="ID">{bundleResult.id}</Descriptions.Item>
                          <Descriptions.Item label="Functionality">{bundleResult.functionality}</Descriptions.Item>
                          <Descriptions.Item label="URLs">{bundleResult.urls?.length || 0}</Descriptions.Item>
                          <Descriptions.Item label="Data Points">{bundleResult.data?.length || 0}</Descriptions.Item>
                          <Descriptions.Item label="Quality Score">
                            <Progress
                              percent={Math.round((bundleResult.qualityScore || 0) * 100)}
                              size="small"
                              status={bundleResult.qualityScore >= 0.7 ? 'success' : 'normal'}
                            />
                          </Descriptions.Item>
                        </Descriptions>
                      </Card>
                    ) : (
                      <Card size="small">
                        <Empty description="Create a bundle to see results here" />
                      </Card>
                    )}
                  </Col>
                </Row>
              </TabPane>

              <TabPane tab="Model Types" key="model-types">
                {modelTypes.length > 0 ? (
                  <Table
                    dataSource={modelTypes}
                    columns={modelTypeColumns}
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                    loading={loading}
                  />
                ) : (
                  <Empty description="No model types available" />
                )}
              </TabPane>

              <TabPane tab="Functionalities" key="functionalities">
                {functionalities.length > 0 ? (
                  <Table
                    dataSource={functionalities}
                    columns={functionalityColumns}
                    rowKey="functionality"
                    pagination={{ pageSize: 10 }}
                    loading={loading}
                  />
                ) : (
                  <Empty description="No functionalities available" />
                )}
              </TabPane>
            </Tabs>
          </Card>
        </Col>
      </Row>

      {/* View Details Modal */}
      <Modal
        title="Mining Result Details"
        open={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setViewModalVisible(false)}>
            Close
          </Button>,
        ]}
        width={700}
      >
        {selectedItem && (
          <div>
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="URL">{selectedItem.url}</Descriptions.Item>
              <Descriptions.Item label="Status">
                {selectedItem.success ? (
                  <Tag color="success">Success</Tag>
                ) : (
                  <Tag color="error">Failed</Tag>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Quality Score">
                {selectedItem.qualityScore !== undefined ? (
                  <Progress
                    percent={Math.round(selectedItem.qualityScore * 100)}
                    size="small"
                    status={selectedItem.qualityScore >= 0.7 ? 'success' : 'normal'}
                  />
                ) : '-'}
              </Descriptions.Item>
            </Descriptions>

            {selectedItem.attributes && (
              <>
                <h4 style={{ marginTop: 16 }}>Attributes ({Object.keys(selectedItem.attributes).length})</h4>
                <pre style={{ background: '#f5f5f5', padding: 12, borderRadius: 4, fontSize: 12, maxHeight: 300, overflow: 'auto' }}>
                  {JSON.stringify(selectedItem.attributes, null, 2)}
                </pre>
              </>
            )}

            {selectedItem.error && (
              <Alert
                message="Error"
                description={selectedItem.error}
                type="error"
                style={{ marginTop: 16 }}
              />
            )}
          </div>
        )}
      </Modal>

      {/* Discover Attributes Modal */}
      <Modal
        title="Attribute Discovery"
        open={discoverModalVisible}
        onCancel={() => setDiscoverModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDiscoverModalVisible(false)}>
            Close
          </Button>,
        ]}
        width={700}
      >
        {discoveryResult && (
          <div>
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="Functionality">{discoveryResult.functionality}</Descriptions.Item>
              <Descriptions.Item label="Description">{discoveryResult.description}</Descriptions.Item>
            </Descriptions>

            <h4 style={{ marginTop: 16 }}>Required Attributes</h4>
            <List
              dataSource={discoveryResult.requiredAttributes || []}
              renderItem={(attr: string) => (
                <List.Item>
                  <Tag color="blue">{attr}</Tag>
                </List.Item>
              )}
              locale={{ emptyText: 'No required attributes' }}
            />

            <h4 style={{ marginTop: 16 }}>Model Types</h4>
            <Space wrap>
              {discoveryResult.modelTypes?.map((mt: string, i: number) => (
                <Tag key={i} color="green">{mt}</Tag>
              ))}
            </Space>

            {discoveryResult.attributeDetails && (
              <>
                <h4 style={{ marginTop: 16 }}>Attribute Details</h4>
                <Table
                  dataSource={discoveryResult.attributeDetails}
                  columns={[
                    { title: 'Attribute', dataIndex: 'name', key: 'name' },
                    { title: 'Type', dataIndex: 'type', key: 'type', render: (t: string) => <Tag>{t}</Tag> },
                    { title: 'Description', dataIndex: 'description', key: 'description' },
                  ]}
                  rowKey="name"
                  size="small"
                  pagination={false}
                />
              </>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default TrainingDataDashboard;
