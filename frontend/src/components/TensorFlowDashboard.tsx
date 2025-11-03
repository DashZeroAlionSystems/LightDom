/**
 * TensorFlow Dashboard Component
 * Provides interface for model management, training, and deployment
 */

import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Select,
  InputNumber,
  Form,
  Space,
  Table,
  Progress,
  Statistic,
  Row,
  Col,
  Tabs,
  message,
  Modal,
  Input,
  Tag,
  Tooltip,
  Switch,
  Divider,
} from 'antd';
import {
  PlayCircleOutlined,
  PauseCircleOutlined,
  SaveOutlined,
  DownloadOutlined,
  UploadOutlined,
  DeleteOutlined,
  EyeOutlined,
  RocketOutlined,
  DatabaseOutlined,
  ThunderboltOutlined,
  LineChartOutlined,
  PlusCircleOutlined,
} from '@ant-design/icons';
import { Line } from '@ant-design/plots';
import { tensorFlowService, ModelConfig, TrainingProgress, ModelMetrics } from '../services/TensorFlowService';

const { TabPane } = Tabs;
const { Option } = Select;

interface Model {
  id: string;
  name: string;
  type: string;
  status: 'idle' | 'training' | 'ready' | 'deployed';
  accuracy?: number;
  loss?: number;
  lastTrained?: string;
  version: string;
}

export const TensorFlowDashboard: React.FC = () => {
  const [models, setModels] = useState<Model[]>([]);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [training, setTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState<TrainingProgress[]>([]);
  const [currentMetrics, setCurrentMetrics] = useState<ModelMetrics | null>(null);
  const [tfReady, setTfReady] = useState(false);
  const [activeTab, setActiveTab] = useState('models');
  const [createModelVisible, setCreateModelVisible] = useState(false);
  const [form] = Form.useForm();

  // Initialize TensorFlow
  useEffect(() => {
    const init = async () => {
      try {
        await tensorFlowService.initialize();
        setTfReady(true);
        message.success('TensorFlow.js initialized successfully');
      } catch (error) {
        message.error('Failed to initialize TensorFlow.js');
        console.error(error);
      }
    };
    init();
  }, []);

  // Load models from backend
  useEffect(() => {
    loadModels();
  }, []);

  const loadModels = async () => {
    try {
      // In a real app, this would fetch from the backend
      const mockModels: Model[] = [
        {
          id: 'model-1',
          name: 'DOM Content Classifier',
          type: 'classification',
          status: 'ready',
          accuracy: 0.92,
          loss: 0.15,
          lastTrained: new Date().toISOString(),
          version: '1.0.0',
        },
        {
          id: 'model-2',
          name: 'SEO Performance Predictor',
          type: 'regression',
          status: 'idle',
          version: '1.0.0',
        },
      ];
      setModels(mockModels);
    } catch (error) {
      message.error('Failed to load models');
      console.error(error);
    }
  };

  const handleCreateModel = async (values: any) => {
    try {
      const config: ModelConfig = {
        id: `model-${Date.now()}`,
        name: values.name,
        type: values.type,
        architecture: [
          { type: 'dense', units: 128, activation: 'relu', inputShape: [values.inputDim] },
          { type: 'dropout', dropout: 0.3 },
          { type: 'dense', units: 64, activation: 'relu' },
          { type: 'dropout', dropout: 0.2 },
          { type: 'dense', units: values.outputDim, activation: values.type === 'classification' ? 'softmax' : 'linear' },
        ],
        hyperparameters: {
          learningRate: values.learningRate || 0.001,
          epochs: values.epochs || 50,
          batchSize: values.batchSize || 32,
          validationSplit: values.validationSplit || 0.2,
        },
      };

      tensorFlowService.createModel(config);

      const newModel: Model = {
        id: config.id,
        name: config.name,
        type: config.type,
        status: 'idle',
        version: '1.0.0',
      };

      setModels([...models, newModel]);
      setCreateModelVisible(false);
      form.resetFields();
      message.success(`Model "${config.name}" created successfully`);
    } catch (error) {
      message.error('Failed to create model');
      console.error(error);
    }
  };

  const handleTrainModel = async (modelId: string) => {
    const model = models.find(m => m.id === modelId);
    if (!model) return;

    try {
      setTraining(true);
      setTrainingProgress([]);
      
      // Update model status
      setModels(models.map(m => m.id === modelId ? { ...m, status: 'training' } : m));

      // Generate sample training data (in real app, fetch from backend)
      const data = tensorFlowService.generateSampleData(1000, 10, model.type === 'classification' ? 5 : 1);

      const config: ModelConfig = {
        id: modelId,
        name: model.name,
        type: model.type as any,
        architecture: [],
        hyperparameters: {
          learningRate: 0.001,
          epochs: 50,
          batchSize: 32,
          validationSplit: 0.2,
        },
      };

      const metrics = await tensorFlowService.trainModel(
        modelId,
        data,
        config,
        (progress) => {
          setTrainingProgress(prev => [...prev, progress]);
        }
      );

      setCurrentMetrics(metrics);
      
      // Update model with final metrics
      setModels(models.map(m => 
        m.id === modelId 
          ? { 
              ...m, 
              status: 'ready',
              accuracy: metrics.accuracy,
              loss: metrics.loss,
              lastTrained: new Date().toISOString(),
            } 
          : m
      ));

      message.success(`Model trained successfully! Accuracy: ${(metrics.accuracy * 100).toFixed(2)}%`);
    } catch (error) {
      message.error('Training failed');
      console.error(error);
      setModels(models.map(m => m.id === modelId ? { ...m, status: 'idle' } : m));
    } finally {
      setTraining(false);
    }
  };

  const handleDeployModel = (modelId: string) => {
    setModels(models.map(m => 
      m.id === modelId ? { ...m, status: 'deployed' } : m
    ));
    message.success('Model deployed successfully');
  };

  const handleDeleteModel = (modelId: string) => {
    Modal.confirm({
      title: 'Delete Model',
      content: 'Are you sure you want to delete this model?',
      okText: 'Delete',
      okType: 'danger',
      onOk: () => {
        tensorFlowService.disposeModel(modelId);
        setModels(models.filter(m => m.id !== modelId));
        message.success('Model deleted');
      },
    });
  };

  const modelColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: Model) => (
        <Space>
          <strong>{name}</strong>
          <Tag color={record.status === 'deployed' ? 'green' : record.status === 'training' ? 'blue' : 'default'}>
            {record.status}
          </Tag>
        </Space>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => <Tag>{type}</Tag>,
    },
    {
      title: 'Accuracy',
      dataIndex: 'accuracy',
      key: 'accuracy',
      render: (acc: number) => acc ? `${(acc * 100).toFixed(2)}%` : '-',
    },
    {
      title: 'Loss',
      dataIndex: 'loss',
      key: 'loss',
      render: (loss: number) => loss ? loss.toFixed(4) : '-',
    },
    {
      title: 'Last Trained',
      dataIndex: 'lastTrained',
      key: 'lastTrained',
      render: (date: string) => date ? new Date(date).toLocaleString() : '-',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Model) => (
        <Space>
          <Tooltip title="Train">
            <Button
              type="primary"
              icon={<PlayCircleOutlined />}
              size="small"
              onClick={() => handleTrainModel(record.id)}
              disabled={training || record.status === 'training'}
            />
          </Tooltip>
          <Tooltip title="Deploy">
            <Button
              icon={<RocketOutlined />}
              size="small"
              onClick={() => handleDeployModel(record.id)}
              disabled={record.status !== 'ready'}
            />
          </Tooltip>
          <Tooltip title="View Details">
            <Button
              icon={<EyeOutlined />}
              size="small"
              onClick={() => setSelectedModel(record.id)}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button
              danger
              icon={<DeleteOutlined />}
              size="small"
              onClick={() => handleDeleteModel(record.id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const trainingChartData = trainingProgress.map(p => ({
    epoch: p.epoch,
    value: p.accuracy,
    type: 'Training Accuracy',
  })).concat(
    trainingProgress.map(p => ({
      epoch: p.epoch,
      value: p.loss,
      type: 'Training Loss',
    }))
  );

  const chartConfig = {
    data: trainingChartData,
    xField: 'epoch',
    yField: 'value',
    seriesField: 'type',
    smooth: true,
    animation: {
      appear: {
        animation: 'path-in',
        duration: 1000,
      },
    },
  };

  return (
    <div style={{ padding: '24px' }}>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={24}>
          <Card>
            <Row gutter={16}>
              <Col span={6}>
                <Statistic
                  title="Total Models"
                  value={models.length}
                  prefix={<DatabaseOutlined />}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="Deployed Models"
                  value={models.filter(m => m.status === 'deployed').length}
                  prefix={<RocketOutlined />}
                  valueStyle={{ color: '#3f8600' }}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="Training"
                  value={models.filter(m => m.status === 'training').length}
                  prefix={<ThunderboltOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="TensorFlow Status"
                  value={tfReady ? 'Ready' : 'Loading'}
                  prefix={<LineChartOutlined />}
                  valueStyle={{ color: tfReady ? '#3f8600' : '#cf1322' }}
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="Models" key="models">
          <Card
            title="Models"
            extra={
              <Button
                type="primary"
                icon={<PlusCircleOutlined />}
                onClick={() => setCreateModelVisible(true)}
              >
                Create Model
              </Button>
            }
          >
            <Table
              columns={modelColumns}
              dataSource={models}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </TabPane>

        <TabPane tab="Training" key="training">
          <Card title="Training Progress">
            {trainingProgress.length > 0 ? (
              <>
                <Row gutter={16} style={{ marginBottom: 24 }}>
                  <Col span={8}>
                    <Card>
                      <Statistic
                        title="Current Epoch"
                        value={trainingProgress[trainingProgress.length - 1]?.epoch || 0}
                      />
                    </Card>
                  </Col>
                  <Col span={8}>
                    <Card>
                      <Statistic
                        title="Current Accuracy"
                        value={(trainingProgress[trainingProgress.length - 1]?.accuracy * 100 || 0).toFixed(2)}
                        suffix="%"
                      />
                    </Card>
                  </Col>
                  <Col span={8}>
                    <Card>
                      <Statistic
                        title="Current Loss"
                        value={trainingProgress[trainingProgress.length - 1]?.loss?.toFixed(4) || 0}
                      />
                    </Card>
                  </Col>
                </Row>
                <Line {...chartConfig} />
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <p>No training in progress. Select a model and click Train to start.</p>
              </div>
            )}
          </Card>
        </TabPane>

        <TabPane tab="Deployment" key="deployment">
          <Card title="Deployed Models">
            <Table
              columns={modelColumns.filter(c => c.key !== 'actions')}
              dataSource={models.filter(m => m.status === 'deployed')}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </TabPane>
      </Tabs>

      <Modal
        title="Create New Model"
        open={createModelVisible}
        onCancel={() => setCreateModelVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateModel}
        >
          <Form.Item
            label="Model Name"
            name="name"
            rules={[{ required: true, message: 'Please enter model name' }]}
          >
            <Input placeholder="e.g., Content Classifier" />
          </Form.Item>

          <Form.Item
            label="Model Type"
            name="type"
            rules={[{ required: true, message: 'Please select model type' }]}
          >
            <Select placeholder="Select type">
              <Option value="classification">Classification</Option>
              <Option value="regression">Regression</Option>
              <Option value="sequence">Sequence</Option>
            </Select>
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Input Dimension"
                name="inputDim"
                initialValue={10}
                rules={[{ required: true }]}
              >
                <InputNumber min={1} max={1000} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Output Dimension"
                name="outputDim"
                initialValue={5}
                rules={[{ required: true }]}
              >
                <InputNumber min={1} max={100} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Divider>Training Configuration</Divider>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Learning Rate" name="learningRate" initialValue={0.001}>
                <InputNumber min={0.00001} max={1} step={0.0001} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Epochs" name="epochs" initialValue={50}>
                <InputNumber min={1} max={1000} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Batch Size" name="batchSize" initialValue={32}>
                <InputNumber min={1} max={512} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Validation Split" name="validationSplit" initialValue={0.2}>
                <InputNumber min={0} max={0.5} step={0.05} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Create Model
              </Button>
              <Button onClick={() => setCreateModelVisible(false)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TensorFlowDashboard;
