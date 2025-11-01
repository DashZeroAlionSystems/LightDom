/**
 * Neural Network Page - Advanced ML Model Management
 * Professional neural network interface with automatic training workflows
 * Research-based UX for ML/AI professionals
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
} from 'antd';
import {
  RobotOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  StopOutlined,
  SettingOutlined,
  DownloadOutlined,
  UploadOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  ThunderboltOutlined,
  BarChartOutlined,
  LineChartOutlined,
  TrophyOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  DatabaseOutlined,
  CloudOutlined,
  ApiOutlined,
  ExperimentOutlined,
  MonitorOutlined,
  HeatMapOutlined,
  NodeIndexOutlined,
  BranchesOutlined,
  FunctionOutlined,
  CalculatorOutlined,
  RadarChartOutlined,
  StockOutlined,
} from '@ant-design/icons';

import TensorFlowService from '../../services/TensorFlowService';
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

const NeuralNetworkPage: React.FC = () => {
  const tensorflowService = TensorFlowService();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [trainingModalVisible, setTrainingModalVisible] = useState(false);
  const [settingsDrawerVisible, setSettingsDrawerVisible] = useState(false);
  const [modelDetailsVisible, setModelDetailsVisible] = useState(false);
  const [autoTrainingEnabled, setAutoTrainingEnabled] = useState(false);
  const [trainingConfig, setTrainingConfig] = useState({
    epochs: 100,
    batchSize: 32,
    learningRate: 0.001,
    validationSplit: 0.2,
    earlyStopping: true,
    dataAugmentation: false,
  });
  const [realTimeMonitoring, setRealTimeMonitoring] = useState(true);
  const [notificationSettings, setNotificationSettings] = useState({
    trainingComplete: true,
    accuracyThreshold: 90,
    errorAlerts: true,
    resourceWarnings: true,
  });

  // Training workflow states
  const [trainingStep, setTrainingStep] = useState(0);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [trainingLogs, setTrainingLogs] = useState<string[]>([]);

  const trainingSteps = [
    'Initializing environment...',
    'Loading dataset...',
    'Preprocessing data...',
    'Building model architecture...',
    'Compiling model...',
    'Starting training...',
    'Training in progress...',
    'Validating model...',
    'Saving model...',
    'Training complete!',
  ];

  // Auto-training effect
  useEffect(() => {
    if (!autoTrainingEnabled) return;

    const interval = setInterval(() => {
      // Check if any model needs retraining based on performance
      const models = tensorflowService.getModels();
      const needsRetraining = models.some(model => 
        model.accuracy < 85 && model.status === 'Active'
      );

      if (needsRetraining && !tensorflowService.isTraining) {
        tensorflowService.startTraining();
        addTrainingLog('Auto-training triggered for underperforming models');
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [autoTrainingEnabled, tensorflowService]);

  // Real-time monitoring effect
  useEffect(() => {
    if (!realTimeMonitoring) return;

    const interval = setInterval(() => {
      // Update metrics and check for alerts
      const metrics = tensorflowService.getMetrics();
      
      if (metrics.gpuUtilization > 90 && notificationSettings.resourceWarnings) {
        addTrainingLog('⚠️ High GPU utilization detected');
      }
      
      if (metrics.memoryUsage > 3500 && notificationSettings.resourceWarnings) {
        addTrainingLog('⚠️ High memory usage detected');
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [realTimeMonitoring, notificationSettings]);

  // Training progress simulation
  useEffect(() => {
    if (!tensorflowService.isTraining) {
      setTrainingStep(0);
      setTrainingProgress(0);
      return;
    }

    const interval = setInterval(() => {
      setTrainingProgress(prev => {
        if (prev >= 100) return 100;
        return prev + Math.random() * 3;
      });

      setTrainingStep(prev => {
        const progress = trainingProgress;
        if (progress > 90 && prev < 9) return 9;
        if (progress > 70 && prev < 8) return 8;
        if (progress > 50 && prev < 7) return 7;
        if (progress > 30 && prev < 6) return 6;
        if (progress > 20 && prev < 5) return 5;
        if (progress > 10 && prev < 4) return 4;
        if (progress > 5 && prev < 3) return 3;
        if (progress > 2 && prev < 2) return 2;
        if (progress > 0 && prev < 1) return 1;
        return prev;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [tensorflowService.isTraining, trainingProgress]);

  const addTrainingLog = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setTrainingLogs(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 49)]);
  }, []);

  const startTrainingWorkflow = useCallback(() => {
    setTrainingModalVisible(false);
    tensorflowService.startTraining();
    addTrainingLog('🚀 Training workflow started');
    setTrainingProgress(0);
    setTrainingStep(0);
  }, [tensorflowService, addTrainingLog]);

  const stopTrainingWorkflow = useCallback(() => {
    tensorflowService.stopTraining();
    addTrainingLog('⏹️ Training workflow stopped');
  }, [tensorflowService, addTrainingLog]);

  const deployModel = useCallback((modelId: string) => {
    tensorflowService.deployModel(modelId);
    addTrainingLog(`✅ Model ${modelId} deployed successfully`);
  }, [tensorflowService, addTrainingLog]);

  // Model management table columns
  const modelColumns = [
    {
      title: 'Model',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: any) => (
        <Space>
          <EnhancedAvatar
            text={text.split(' ').map((w: string) => w[0]).join('')}
            size="small"
            status={record.status === 'Active' ? 'online' : 'away'}
          />
          <div>
            <Text strong>{text}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: '12px' }}>{record.type}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Accuracy',
      dataIndex: 'accuracy',
      key: 'accuracy',
      render: (accuracy: number) => (
        <Space>
          <EnhancedProgress 
            percent={accuracy} 
            size="small" 
            status={accuracy > 90 ? 'success' : accuracy > 80 ? 'normal' : 'exception'}
          />
          <Text style={{ fontSize: '12px' }}>{accuracy}%</Text>
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <EnhancedTag 
          color={status === 'Active' ? 'success' : status === 'Training' ? 'warning' : 'default'}
        >
          {status}
        </EnhancedTag>
      ),
    },
    {
      title: 'Predictions',
      dataIndex: 'predictions',
      key: 'predictions',
      render: (predictions: number) => (
        <Text>{predictions.toLocaleString()}</Text>
      ),
    },
    {
      title: 'Last Trained',
      dataIndex: 'lastTrained',
      key: 'lastTrained',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: any) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => {
                setSelectedModel(record.id);
                setModelDetailsVisible(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Deploy Model">
            <Button
              type="text"
              icon={<UploadOutlined />}
              onClick={() => deployModel(record.id)}
              disabled={record.status === 'Active'}
            />
          </Tooltip>
          <Tooltip title="Retrain">
            <Button
              type="text"
              icon={<ExperimentOutlined />}
              onClick={() => {
                setSelectedModel(record.id);
                setTrainingModalVisible(true);
              }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // Render Overview Section
  const renderOverview = () => (
    <div>
      {/* Key Metrics */}
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <EnhancedCard variant="elevated" animation="fadeIn">
            <EnhancedStatistic
              title="Model Accuracy"
              value={tensorflowService.metrics.modelAccuracy}
              trend="up"
              trendValue={2.3}
              suffix="%"
              color="success"
              precision={1}
            />
          </EnhancedCard>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <EnhancedCard variant="elevated" animation="fadeIn">
            <EnhancedStatistic
              title="Active Models"
              value={tensorflowService.metrics.activeModels}
              trend="up"
              trendValue={1}
              prefix={<RobotOutlined />}
              color="primary"
            />
          </EnhancedCard>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <EnhancedCard variant="elevated" animation="fadeIn">
            <EnhancedStatistic
              title="GPU Usage"
              value={tensorflowService.metrics.gpuUtilization}
              trend="stable"
              trendValue={0}
              suffix="%"
              color="warning"
            />
          </EnhancedCard>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <EnhancedCard variant="elevated" animation="fadeIn">
            <EnhancedStatistic
              title="Total Predictions"
              value={tensorflowService.metrics.totalPredictions}
              trend="up"
              trendValue={15.7}
              prefix={<CalculatorOutlined />}
              color="secondary"
            />
          </EnhancedCard>
        </Col>
      </Row>

      {/* Training Workflow Status */}
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={24} md={16}>
          <EnhancedCard 
            title="Training Workflow Status" 
            variant="elevated"
            extra={
              <Space>
                <Switch
                  checked={autoTrainingEnabled}
                  onChange={setAutoTrainingEnabled}
                  checkedChildren="Auto"
                  unCheckedChildren="Manual"
                />
                <EnhancedButton
                  variant="primary"
                  size="small"
                  icon={<PlusOutlined />}
                  onClick={() => setTrainingModalVisible(true)}
                >
                  New Training
                </EnhancedButton>
              </Space>
            }
          >
            {tensorflowService.isTraining ? (
              <Space direction="vertical" style={{ width: '100%' }} size="large">
                <div>
                  <Text strong>Current Step: {trainingSteps[trainingStep]}</Text>
                  <EnhancedProgress 
                    percent={trainingProgress} 
                    status="active"
                    gradient={true}
                  />
                </div>
                <div>
                  <Text strong>Training Logs:</Text>
                  <div style={{
                    backgroundColor: '#f5f5f5',
                    padding: 12,
                    borderRadius: '8px',
                    marginTop: 8,
                    height: '200px',
                    overflowY: 'auto',
                    fontFamily: 'monospace',
                    fontSize: '12px',
                  }}>
                    {trainingLogs.map((log, index) => (
                      <div key={index} style={{ marginBottom: '2px' }}>
                        {log}
                      </div>
                    ))}
                  </div>
                </div>
                <Space>
                  <EnhancedButton
                    variant="danger"
                    icon={<StopOutlined />}
                    onClick={stopTrainingWorkflow}
                  >
                    Stop Training
                  </EnhancedButton>
                  <EnhancedButton
                    variant="ghost"
                    icon={<SettingOutlined />}
                    onClick={() => setSettingsDrawerVisible(true)}
                  >
                    Settings
                  </EnhancedButton>
                </Space>
              </Space>
            ) : (
              <Space direction="vertical" style={{ width: '100%' }} alignItems="center">
                <RobotOutlined style={{ fontSize: '48px', color: '#d1d5db' }} />
                <Text type="secondary">No training in progress</Text>
                <EnhancedButton
                  variant="primary"
                  icon={<PlayCircleOutlined />}
                  onClick={() => setTrainingModalVisible(true)}
                >
                  Start Training
                </EnhancedButton>
              </Space>
            )}
          </EnhancedCard>
        </Col>
        <Col xs={24} md={8}>
          <EnhancedCard title="System Resources" variant="elevated">
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <div>
                <Text strong>GPU Utilization</Text>
                <EnhancedProgress 
                  percent={tensorflowService.metrics.gpuUtilization} 
                  status={tensorflowService.metrics.gpuUtilization > 80 ? 'exception' : 'normal'}
                  size="small"
                />
              </div>
              <div>
                <Text strong>Memory Usage</Text>
                <EnhancedProgress 
                  percent={(tensorflowService.metrics.memoryUsage / 4096) * 100} 
                  status="normal"
                  size="small"
                />
              </div>
              <div>
                <Text strong>Batch Processing</Text>
                <EnhancedProgress 
                  percent={tensorflowService.metrics.batchProcessing} 
                  status="active"
                  size="small"
                />
              </div>
              <div>
                <Text strong>Training Time</Text>
                <Text>{tensorflowService.metrics.trainingTime}ms</Text>
              </div>
              <div>
                <Text strong>Inference Time</Text>
                <Text>{tensorflowService.metrics.inferenceTime}ms</Text>
              </div>
            </Space>
          </EnhancedCard>
        </Col>
      </Row>

      {/* Models Table */}
      <EnhancedCard 
        title="Model Management" 
        variant="elevated"
        extra={
          <Space>
            <Switch
              checked={realTimeMonitoring}
              onChange={setRealTimeMonitoring}
              checkedChildren="Live"
              unCheckedChildren="Static"
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
        <Table
          columns={modelColumns}
          dataSource={tensorflowService.getModels()}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          size="middle"
        />
      </EnhancedCard>
    </div>
  );

  // Render Training History
  const renderTrainingHistory = () => (
    <div>
      <Row gutter={[24, 24]}>
        <Col xs={24} md={16}>
          <EnhancedCard title="Training Progress" variant="elevated">
            <div style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Space direction="vertical" alignItems="center">
                <LineChartOutlined style={{ fontSize: '64px', color: '#d1d5db' }} />
                <Text type="secondary">Training history visualization</Text>
                <Text type="secondary">Chart integration coming soon</Text>
              </Space>
            </div>
          </EnhancedCard>
        </Col>
        <Col xs={24} md={8}>
          <EnhancedCard title="Training Statistics" variant="elevated">
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <div>
                <Text strong>Total Epochs</Text>
                <Text>{tensorflowService.getTrainingHistory().length}</Text>
              </div>
              <div>
                <Text strong>Best Accuracy</Text>
                <Text>
                  {Math.max(...tensorflowService.getTrainingHistory().map(h => h.accuracy)).toFixed(2)}%
                </Text>
              </div>
              <div>
                <Text strong>Final Loss</Text>
                <Text>
                  {tensorflowService.getTrainingHistory().slice(-1)[0]?.loss.toFixed(4) || 'N/A'}
                </Text>
              </div>
              <div>
                <Text strong>Training Duration</Text>
                <Text>2h 34m</Text>
              </div>
              <div>
                <Text strong>Convergence Rate</Text>
                <Text>87.3%</Text>
              </div>
            </Space>
          </EnhancedCard>
        </Col>
      </Row>
    </div>
  );

  // Render Model Architecture
  const renderModelArchitecture = () => (
    <div>
      <Row gutter={[24, 24]}>
        <Col xs={24} md={12}>
          <EnhancedCard title="Neural Network Architecture" variant="elevated">
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
                <Text strong>Input Layer</Text>
                <EnhancedTag color="primary">784 neurons</EnhancedTag>
              </div>
              <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
                <Text strong>Hidden Layer 1</Text>
                <EnhancedTag color="secondary">512 neurons</EnhancedTag>
              </div>
              <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
                <Text strong>Hidden Layer 2</Text>
                <EnhancedTag color="secondary">256 neurons</EnhancedTag>
              </div>
              <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
                <Text strong>Hidden Layer 3</Text>
                <EnhancedTag color="secondary">128 neurons</EnhancedTag>
              </div>
              <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
                <Text strong>Output Layer</Text>
                <EnhancedTag color="success">10 neurons</EnhancedTag>
              </div>
              <Divider />
              <div>
                <Text strong>Total Parameters</Text>
                <Text>567,890</Text>
              </div>
              <div>
                <Text strong>Model Size</Text>
                <Text>2.3 MB</Text>
              </div>
            </Space>
          </EnhancedCard>
        </Col>
        <Col xs={24} md={12}>
          <EnhancedCard title="Layer Configuration" variant="elevated">
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <div>
                <Text strong>Activation Functions</Text>
                <Space wrap>
                  <EnhancedTag color="primary">ReLU</EnhancedTag>
                  <EnhancedTag color="secondary">Sigmoid</EnhancedTag>
                  <EnhancedTag color="success">Softmax</EnhancedTag>
                </Space>
              </div>
              <div>
                <Text strong>Optimization</Text>
                <Space wrap>
                  <EnhancedTag color="warning">Adam</EnhancedTag>
                  <EnhancedTag color="default">LR: 0.001</EnhancedTag>
                </Space>
              </div>
              <div>
                <Text strong>Regularization</Text>
                <Space wrap>
                  <EnhancedTag color="primary">Dropout: 0.2</EnhancedTag>
                  <EnhancedTag color="secondary">L2: 0.01</EnhancedTag>
                </Space>
              </div>
              <div>
                <Text strong>Batch Normalization</Text>
                <Switch checked={true} disabled />
              </div>
              <div>
                <Text strong>Data Augmentation</Text>
                <Switch checked={trainingConfig.dataAugmentation} onChange={(checked) => 
                  setTrainingConfig({ ...trainingConfig, dataAugmentation: checked })
                } />
              </div>
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
          <RobotOutlined style={{
            fontSize: '32px',
            color: '#7c3aed',
            marginRight: 12,
          }} />
          <Title level={3} style={{ margin: 0, fontSize: '24px', fontWeight: 600, lineHeight: '1.2' }}>
            Neural Network Management
          </Title>
        </div>
        <Space>
          <EnhancedButton
            variant="primary"
            icon={<PlayCircleOutlined />}
            onClick={() => setTrainingModalVisible(true)}
            disabled={tensorflowService.isTraining}
          >
            Start Training
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
                <MonitorOutlined />
                <span>Overview</span>
              </Space>
            }
            key="overview"
          >
            {renderOverview()}
          </TabPane>
          <TabPane
            tab={
              <Space>
                <BarChartOutlined />
                <span>Training History</span>
              </Space>
            }
            key="history"
          >
            {renderTrainingHistory()}
          </TabPane>
          <TabPane
            tab={
              <Space>
                <NodeIndexOutlined />
                <span>Model Architecture</span>
              </Space>
            }
            key="architecture"
          >
            {renderModelArchitecture()}
          </TabPane>
        </Tabs>
      </Content>

      {/* Training Configuration Modal */}
      <Modal
        title="Configure Training Workflow"
        visible={trainingModalVisible}
        onCancel={() => setTrainingModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setTrainingModalVisible(false)}>
            Cancel
          </Button>,
          <EnhancedButton
            key="start"
            variant="primary"
            icon={<PlayCircleOutlined />}
            onClick={startTrainingWorkflow}
          >
            Start Training
          </EnhancedButton>,
        ]}
        width={600}
      >
        <Form layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Epochs">
                <Slider
                  value={trainingConfig.epochs}
                  onChange={(value) => setTrainingConfig({ ...trainingConfig, epochs: value })}
                  min={10}
                  max={500}
                  marks={{
                    10: '10',
                    100: '100',
                    200: '200',
                    500: '500',
                  }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Batch Size">
                <Select
                  value={trainingConfig.batchSize}
                  onChange={(value) => setTrainingConfig({ ...trainingConfig, batchSize: value })}
                >
                  <Option value={16}>16</Option>
                  <Option value={32}>32</Option>
                  <Option value={64}>64</Option>
                  <Option value={128}>128</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Learning Rate">
                <Select
                  value={trainingConfig.learningRate}
                  onChange={(value) => setTrainingConfig({ ...trainingConfig, learningRate: value })}
                >
                  <Option value={0.0001}>0.0001</Option>
                  <Option value={0.001}>0.001</Option>
                  <Option value={0.01}>0.01</Option>
                  <Option value={0.1}>0.1</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Validation Split">
                <Slider
                  value={trainingConfig.validationSplit}
                  onChange={(value) => setTrainingConfig({ ...trainingConfig, validationSplit: value })}
                  min={0.1}
                  max={0.5}
                  step={0.1}
                  marks={{
                    0.1: '10%',
                    0.2: '20%',
                    0.3: '30%',
                    0.5: '50%',
                  }}
                />
              </Form.Item>
            </Col>
          </Row>
          <Space direction="vertical" style={{ width: '100%' }}>
            <div>
              <Text strong>Training Options</Text>
              <div style={{ marginTop: 8 }}>
                <Space direction="vertical">
                  <div>
                    <Text>Early Stopping</Text>
                    <Switch
                      checked={trainingConfig.earlyStopping}
                      onChange={(checked) => setTrainingConfig({ ...trainingConfig, earlyStopping: checked })}
                      style={{ marginLeft: 8 }}
                    />
                  </div>
                  <div>
                    <Text>Data Augmentation</Text>
                    <Switch
                      checked={trainingConfig.dataAugmentation}
                      onChange={(checked) => setTrainingConfig({ ...trainingConfig, dataAugmentation: checked })}
                      style={{ marginLeft: 8 }}
                    />
                  </div>
                </Space>
              </div>
            </div>
          </Space>
        </Form>
      </Modal>

      {/* Settings Drawer */}
      <Drawer
        title="Neural Network Settings"
        placement="right"
        onClose={() => setSettingsDrawerVisible(false)}
        visible={settingsDrawerVisible}
        width={400}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <EnhancedCard title="Auto Training" variant="flat">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text strong>Enable Auto Training</Text>
                <Switch
                  checked={autoTrainingEnabled}
                  onChange={setAutoTrainingEnabled}
                  style={{ marginLeft: 8 }}
                />
              </div>
              <div>
                <Text strong>Accuracy Threshold</Text>
                <Slider
                  value={notificationSettings.accuracyThreshold}
                  onChange={(value) => setNotificationSettings({ ...notificationSettings, accuracyThreshold: value })}
                  min={70}
                  max={99}
                  marks={{
                    70: '70%',
                    85: '85%',
                    95: '95%',
                  }}
                />
              </div>
            </Space>
          </EnhancedCard>

          <EnhancedCard title="Notifications" variant="flat">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text>Training Complete</Text>
                <Switch
                  checked={notificationSettings.trainingComplete}
                  onChange={(checked) => setNotificationSettings({ ...notificationSettings, trainingComplete: checked })}
                  style={{ marginLeft: 8 }}
                />
              </div>
              <div>
                <Text>Error Alerts</Text>
                <Switch
                  checked={notificationSettings.errorAlerts}
                  onChange={(checked) => setNotificationSettings({ ...notificationSettings, errorAlerts: checked })}
                  style={{ marginLeft: 8 }}
                />
              </div>
              <div>
                <Text>Resource Warnings</Text>
                <Switch
                  checked={notificationSettings.resourceWarnings}
                  onChange={(checked) => setNotificationSettings({ ...notificationSettings, resourceWarnings: checked })}
                  style={{ marginLeft: 8 }}
                />
              </div>
            </Space>
          </EnhancedCard>

          <EnhancedCard title="Monitoring" variant="flat">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text strong>Real-time Monitoring</Text>
                <Switch
                  checked={realTimeMonitoring}
                  onChange={setRealTimeMonitoring}
                  style={{ marginLeft: 8 }}
                />
              </div>
              <EnhancedButton
                variant="primary"
                fullWidth
                onClick={() => {
                  tensorflowService.startTraining();
                  setSettingsDrawerVisible(false);
                }}
              >
                Start Quick Training
              </EnhancedButton>
            </Space>
          </EnhancedCard>
        </Space>
      </Drawer>

      {/* Model Details Modal */}
      <Modal
        title="Model Details"
        visible={modelDetailsVisible}
        onCancel={() => setModelDetailsVisible(false)}
        footer={[
          <Button key="close" onClick={() => setModelDetailsVisible(false)}>
            Close
          </Button>,
        ]}
        width={800}
      >
        {selectedModel && (
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <Alert
              message="Model Information"
              description="Detailed information about the selected neural network model"
              type="info"
              showIcon
            />
            {/* Model details would go here */}
            <Text>Model details for {selectedModel}</Text>
          </Space>
        )}
      </Modal>
    </Layout>
  );
};

export default NeuralNetworkPage;
