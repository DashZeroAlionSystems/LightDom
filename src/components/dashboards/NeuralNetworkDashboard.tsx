/**
 * Neural Network Dashboard
 * 
 * Manages per-client neural network instances for training, predictions, and model optimization.
 * Provides UI for creating instances, training models, making predictions, and monitoring performance.
 */

import React, { useState, useEffect } from 'react';
import {
  Card,
  Tabs,
  Table,
  Button,
  Form,
  Input,
  Select,
  Modal,
  Upload,
  Space,
  Tag,
  Statistic,
  Row,
  Col,
  message,
  Spin,
  Progress,
  Typography,
  Divider,
  InputNumber,
} from 'antd';
import {
  PlusOutlined,
  PlayCircleOutlined,
  UploadOutlined,
  ReloadOutlined,
  RobotOutlined,
  ThunderboltOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  LineChartOutlined,
} from '@ant-design/icons';
import { neuralNetworkAPI } from '../../services/apiService';

const { TabPane } = Tabs;
const { Option } = Select;
const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

interface NeuralNetworkInstance {
  id: string;
  clientId: string;
  modelType: string;
  status: 'idle' | 'training' | 'ready' | 'failed';
  configuration: any;
  trainingData?: any[];
  performance?: {
    accuracy: number;
    loss: number;
    epochs: number;
    trainingTime: number;
  };
  createdAt: string;
  updatedAt: string;
  metadata?: any;
}

interface ModelType {
  value: string;
  label: string;
  description: string;
  defaultModels: string[];
}

const NeuralNetworkDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('instances');
  const [instances, setInstances] = useState<NeuralNetworkInstance[]>([]);
  const [modelTypes, setModelTypes] = useState<ModelType[]>([]);
  const [loading, setLoading] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [trainModalVisible, setTrainModalVisible] = useState(false);
  const [predictModalVisible, setPredictModalVisible] = useState(false);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [selectedInstance, setSelectedInstance] = useState<NeuralNetworkInstance | null>(null);
  const [predictionResult, setPredictionResult] = useState<any>(null);
  const [form] = Form.useForm();
  const [predictForm] = Form.useForm();
  const [uploadForm] = Form.useForm();

  // Fetch instances on mount
  useEffect(() => {
    fetchInstances();
    fetchModelTypes();
  }, []);

  const fetchInstances = async (filters?: any) => {
    setLoading(true);
    try {
      const data = await neuralNetworkAPI.getInstances(filters);
      setInstances(Array.isArray(data) ? data : []);
    } catch (error) {
      message.error('Failed to load neural network instances');
    } finally {
      setLoading(false);
    }
  };

  const fetchModelTypes = async () => {
    try {
      const data = await neuralNetworkAPI.getModelTypes();
      setModelTypes(Array.isArray(data) ? data : []);
    } catch (error) {
      message.error('Failed to load model types');
    }
  };

  const handleCreateInstance = async (values: any) => {
    try {
      await neuralNetworkAPI.createInstance(values);
      message.success('Neural network instance created successfully');
      setCreateModalVisible(false);
      form.resetFields();
      fetchInstances();
    } catch (error) {
      message.error('Failed to create neural network instance');
    }
  };

  const handleTrainInstance = async (instanceId: string) => {
    try {
      const result = await neuralNetworkAPI.trainInstance(instanceId);
      message.success('Training completed successfully');
      setTrainModalVisible(false);
      fetchInstances();
    } catch (error) {
      message.error('Training failed');
    }
  };

  const handlePredict = async (values: any) => {
    if (!selectedInstance) return;
    
    try {
      const result = await neuralNetworkAPI.predict(selectedInstance.id, values.input);
      setPredictionResult(result);
      message.success('Prediction completed successfully');
    } catch (error) {
      message.error('Prediction failed');
    }
  };

  const handleUploadDataset = async (values: any) => {
    const formData = new FormData();
    formData.append('instanceId', values.instanceId);
    formData.append('datasetName', values.datasetName);
    formData.append('datasetType', values.datasetType);
    if (values.file && values.file.length > 0) {
      formData.append('file', values.file[0].originFileObj);
    }

    try {
      await neuralNetworkAPI.uploadDataset(formData);
      message.success('Dataset uploaded successfully');
      setUploadModalVisible(false);
      uploadForm.resetFields();
    } catch (error) {
      message.error('Failed to upload dataset');
    }
  };

  const getStatusTag = (status: string) => {
    const statusConfig: Record<string, { color: string; icon: React.ReactNode }> = {
      idle: { color: 'default', icon: <ClockCircleOutlined /> },
      training: { color: 'processing', icon: <ThunderboltOutlined spin /> },
      ready: { color: 'success', icon: <CheckCircleOutlined /> },
      failed: { color: 'error', icon: <CloseCircleOutlined /> },
    };

    const config = statusConfig[status] || statusConfig.idle;
    return (
      <Tag color={config.color} icon={config.icon}>
        {status.toUpperCase()}
      </Tag>
    );
  };

  const instanceColumns = [
    {
      title: 'Instance ID',
      dataIndex: 'id',
      key: 'id',
      width: 200,
      render: (text: string) => <Text code>{text.substring(0, 8)}...</Text>,
    },
    {
      title: 'Client ID',
      dataIndex: 'clientId',
      key: 'clientId',
    },
    {
      title: 'Model Type',
      dataIndex: 'modelType',
      key: 'modelType',
      render: (text: string) => {
        const modelType = modelTypes.find(mt => mt.value === text);
        return modelType ? modelType.label : text;
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getStatusTag(status),
    },
    {
      title: 'Performance',
      key: 'performance',
      render: (record: NeuralNetworkInstance) => {
        if (record.performance) {
          return (
            <Space direction="vertical" size="small">
              <Text>Accuracy: {(record.performance.accuracy * 100).toFixed(2)}%</Text>
              <Text type="secondary">Loss: {record.performance.loss.toFixed(4)}</Text>
            </Space>
          );
        }
        return <Text type="secondary">Not trained</Text>;
      },
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: NeuralNetworkInstance) => (
        <Space>
          <Button
            size="small"
            icon={<PlayCircleOutlined />}
            onClick={() => {
              setSelectedInstance(record);
              setTrainModalVisible(true);
            }}
            disabled={record.status === 'training'}
          >
            Train
          </Button>
          <Button
            size="small"
            icon={<RobotOutlined />}
            onClick={() => {
              setSelectedInstance(record);
              setPredictModalVisible(true);
              setPredictionResult(null);
            }}
            disabled={record.status !== 'ready'}
          >
            Predict
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Title level={2}>
          <RobotOutlined /> Neural Network Management
        </Title>
        <Paragraph>
          Manage per-client neural network instances for training, predictions, and model optimization.
        </Paragraph>

        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          {/* Instances Tab */}
          <TabPane tab="Instances" key="instances">
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <Row gutter={16}>
                <Col span={6}>
                  <Card>
                    <Statistic
                      title="Total Instances"
                      value={instances.length}
                      prefix={<RobotOutlined />}
                    />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card>
                    <Statistic
                      title="Ready"
                      value={instances.filter(i => i.status === 'ready').length}
                      valueStyle={{ color: '#3f8600' }}
                      prefix={<CheckCircleOutlined />}
                    />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card>
                    <Statistic
                      title="Training"
                      value={instances.filter(i => i.status === 'training').length}
                      valueStyle={{ color: '#1890ff' }}
                      prefix={<ThunderboltOutlined />}
                    />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card>
                    <Statistic
                      title="Failed"
                      value={instances.filter(i => i.status === 'failed').length}
                      valueStyle={{ color: '#cf1322' }}
                      prefix={<CloseCircleOutlined />}
                    />
                  </Card>
                </Col>
              </Row>

              <Space>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => setCreateModalVisible(true)}
                >
                  Create Instance
                </Button>
                <Button
                  icon={<UploadOutlined />}
                  onClick={() => setUploadModalVisible(true)}
                >
                  Upload Dataset
                </Button>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={() => fetchInstances()}
                >
                  Refresh
                </Button>
              </Space>

              <Table
                columns={instanceColumns}
                dataSource={instances}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 10 }}
              />
            </Space>
          </TabPane>

          {/* Model Types Tab */}
          <TabPane tab="Model Types" key="model-types">
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <Title level={4}>Available Model Types</Title>
              <Row gutter={[16, 16]}>
                {modelTypes.map((modelType) => (
                  <Col span={8} key={modelType.value}>
                    <Card
                      title={modelType.label}
                      extra={<Tag color="blue">{modelType.value}</Tag>}
                    >
                      <Paragraph>{modelType.description}</Paragraph>
                      <Divider />
                      <Text strong>Default Models:</Text>
                      <div style={{ marginTop: 8 }}>
                        {modelType.defaultModels.map((model) => (
                          <Tag key={model} color="green">
                            {model}
                          </Tag>
                        ))}
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Space>
          </TabPane>

          {/* Statistics Tab */}
          <TabPane tab="Statistics" key="statistics">
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <Title level={4}>Performance Metrics</Title>
              
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Card title="Average Accuracy by Model Type">
                    {modelTypes.map((modelType) => {
                      const instancesOfType = instances.filter(
                        i => i.modelType === modelType.value && i.performance
                      );
                      const avgAccuracy = instancesOfType.length > 0
                        ? instancesOfType.reduce((sum, i) => sum + (i.performance?.accuracy || 0), 0) / instancesOfType.length
                        : 0;
                      
                      return (
                        <div key={modelType.value} style={{ marginBottom: 16 }}>
                          <Text>{modelType.label}</Text>
                          <Progress
                            percent={Math.round(avgAccuracy * 100)}
                            status={avgAccuracy > 0.8 ? 'success' : avgAccuracy > 0.6 ? 'normal' : 'exception'}
                          />
                        </div>
                      );
                    })}
                  </Card>
                </Col>

                <Col span={12}>
                  <Card title="Training Status Distribution">
                    <Row gutter={16}>
                      <Col span={12}>
                        <Statistic
                          title="Success Rate"
                          value={
                            instances.length > 0
                              ? ((instances.filter(i => i.status === 'ready').length / instances.length) * 100).toFixed(1)
                              : 0
                          }
                          suffix="%"
                          valueStyle={{ color: '#3f8600' }}
                        />
                      </Col>
                      <Col span={12}>
                        <Statistic
                          title="Failure Rate"
                          value={
                            instances.length > 0
                              ? ((instances.filter(i => i.status === 'failed').length / instances.length) * 100).toFixed(1)
                              : 0
                          }
                          suffix="%"
                          valueStyle={{ color: '#cf1322' }}
                        />
                      </Col>
                    </Row>
                  </Card>
                </Col>
              </Row>
            </Space>
          </TabPane>
        </Tabs>
      </Card>

      {/* Create Instance Modal */}
      <Modal
        title="Create Neural Network Instance"
        open={createModalVisible}
        onCancel={() => {
          setCreateModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form form={form} onFinish={handleCreateInstance} layout="vertical">
          <Form.Item
            name="clientId"
            label="Client ID"
            rules={[{ required: true, message: 'Please enter client ID' }]}
          >
            <Input placeholder="Enter client ID" />
          </Form.Item>

          <Form.Item
            name="modelType"
            label="Model Type"
            rules={[{ required: true, message: 'Please select model type' }]}
          >
            <Select placeholder="Select model type">
              {modelTypes.map((type) => (
                <Option key={type.value} value={type.value}>
                  {type.label} - {type.description}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="metadata" label="Metadata (JSON)">
            <TextArea
              rows={4}
              placeholder='{"key": "value"}'
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" icon={<PlusOutlined />}>
                Create Instance
              </Button>
              <Button onClick={() => {
                setCreateModalVisible(false);
                form.resetFields();
              }}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Train Instance Modal */}
      <Modal
        title="Train Neural Network Instance"
        open={trainModalVisible}
        onCancel={() => setTrainModalVisible(false)}
        footer={null}
      >
        {selectedInstance && (
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Card>
              <Statistic
                title="Instance ID"
                value={selectedInstance.id}
                valueStyle={{ fontSize: 14 }}
              />
              <Statistic
                title="Model Type"
                value={modelTypes.find(mt => mt.value === selectedInstance.modelType)?.label || selectedInstance.modelType}
              />
            </Card>

            <Paragraph>
              This will start the training process for the selected neural network instance.
              Training may take several minutes depending on the dataset size and model complexity.
            </Paragraph>

            <Space>
              <Button
                type="primary"
                icon={<PlayCircleOutlined />}
                onClick={() => handleTrainInstance(selectedInstance.id)}
              >
                Start Training
              </Button>
              <Button onClick={() => setTrainModalVisible(false)}>
                Cancel
              </Button>
            </Space>
          </Space>
        )}
      </Modal>

      {/* Predict Modal */}
      <Modal
        title="Make Prediction"
        open={predictModalVisible}
        onCancel={() => {
          setPredictModalVisible(false);
          setPredictionResult(null);
          predictForm.resetFields();
        }}
        footer={null}
        width={700}
      >
        {selectedInstance && (
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Card>
              <Statistic
                title="Instance ID"
                value={selectedInstance.id}
                valueStyle={{ fontSize: 14 }}
              />
              {selectedInstance.performance && (
                <Row gutter={16} style={{ marginTop: 16 }}>
                  <Col span={12}>
                    <Statistic
                      title="Accuracy"
                      value={(selectedInstance.performance.accuracy * 100).toFixed(2)}
                      suffix="%"
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic
                      title="Loss"
                      value={selectedInstance.performance.loss.toFixed(4)}
                    />
                  </Col>
                </Row>
              )}
            </Card>

            <Form form={predictForm} onFinish={handlePredict} layout="vertical">
              <Form.Item
                name="input"
                label="Input Data (JSON)"
                rules={[{ required: true, message: 'Please enter input data' }]}
              >
                <TextArea
                  rows={6}
                  placeholder='Enter input data as JSON, e.g., {"feature1": 1.5, "feature2": 2.3}'
                />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" icon={<RobotOutlined />}>
                  Make Prediction
                </Button>
              </Form.Item>
            </Form>

            {predictionResult && (
              <Card title="Prediction Result" style={{ backgroundColor: '#f0f2f5' }}>
                <pre>{JSON.stringify(predictionResult, null, 2)}</pre>
              </Card>
            )}
          </Space>
        )}
      </Modal>

      {/* Upload Dataset Modal */}
      <Modal
        title="Upload Training Dataset"
        open={uploadModalVisible}
        onCancel={() => {
          setUploadModalVisible(false);
          uploadForm.resetFields();
        }}
        footer={null}
      >
        <Form form={uploadForm} onFinish={handleUploadDataset} layout="vertical">
          <Form.Item
            name="instanceId"
            label="Instance ID"
            rules={[{ required: true, message: 'Please select instance' }]}
          >
            <Select placeholder="Select instance">
              {instances.map((instance) => (
                <Option key={instance.id} value={instance.id}>
                  {instance.id.substring(0, 8)}... - {instance.modelType}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="datasetName"
            label="Dataset Name"
            rules={[{ required: true, message: 'Please enter dataset name' }]}
          >
            <Input placeholder="Enter dataset name" />
          </Form.Item>

          <Form.Item
            name="datasetType"
            label="Dataset Type"
            rules={[{ required: true, message: 'Please select dataset type' }]}
          >
            <Select placeholder="Select dataset type">
              <Option value="training">Training</Option>
              <Option value="validation">Validation</Option>
              <Option value="test">Test</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="file"
            label="Dataset File"
            valuePropName="fileList"
            getValueFromEvent={(e) => {
              if (Array.isArray(e)) {
                return e;
              }
              return e?.fileList;
            }}
            rules={[{ required: true, message: 'Please upload dataset file' }]}
          >
            <Upload beforeUpload={() => false} maxCount={1}>
              <Button icon={<UploadOutlined />}>Select File</Button>
            </Upload>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" icon={<UploadOutlined />}>
                Upload Dataset
              </Button>
              <Button onClick={() => {
                setUploadModalVisible(false);
                uploadForm.resetFields();
              }}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default NeuralNetworkDashboard;
