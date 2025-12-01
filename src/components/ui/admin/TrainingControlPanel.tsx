import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  ExperimentOutlined,
  PlayCircleOutlined,
  RocketOutlined,
  StopOutlined,
  SyncOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import {
  Alert,
  Button,
  Col,
  Collapse,
  Divider,
  Form,
  InputNumber,
  message,
  Modal,
  Progress,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Tabs,
  Tag,
} from 'antd';
import React, { useEffect, useState } from 'react';
import { Card as DSCard } from '../../../utils/AdvancedReusableComponents';

const { Option } = Select;
const { Panel } = Collapse;
const { TabPane } = Tabs;

interface TrainingRun {
  trainingId: string;
  modelType: string;
  status: 'running' | 'completed' | 'failed' | 'stopped';
  progress: number;
  startTime: string;
  duration: number;
}

interface TrainingHistory {
  id: number;
  model_name: string;
  model_version: string;
  dataset_size: number;
  training_start_date: string;
  training_end_date: string;
  status: string;
  accuracy_score: number;
  hyperparameters: any;
}

interface TrainingMetrics {
  overall: {
    total_training_runs: number;
    completed_runs: number;
    failed_runs: number;
    avg_accuracy: number;
    avg_duration_seconds: number;
  };
  byModel: Array<{
    model_name: string;
    runs: number;
    avg_accuracy: number;
    best_accuracy: number;
    last_trained: string;
  }>;
}

export const TrainingControlPanel: React.FC = () => {
  const [form] = Form.useForm();
  const [activeRuns, setActiveRuns] = useState<TrainingRun[]>([]);
  const [history, setHistory] = useState<TrainingHistory[]>([]);
  const [metrics, setMetrics] = useState<TrainingMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [startingTraining, setStartingTraining] = useState(false);
  const [selectedRun, setSelectedRun] = useState<TrainingRun | null>(null);
  const [logsModalVisible, setLogsModalVisible] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const fetchTrainingData = async () => {
    try {
      setLoading(true);

      // Fetch active runs
      const runsRes = await fetch('/api/training/runs');
      const runsData = await runsRes.json();
      setActiveRuns(runsData.runs || []);

      // Fetch history
      const historyRes = await fetch('/api/training/history?limit=50');
      const historyData = await historyRes.json();
      setHistory(historyData.history || []);

      // Fetch metrics
      const metricsRes = await fetch('/api/training/metrics');
      const metricsData = await metricsRes.json();
      setMetrics(metricsData);
    } catch (error) {
      console.error('Failed to fetch training data:', error);
      message.error('Failed to load training data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainingData();

    // Auto-refresh every 10 seconds
    const interval = setInterval(fetchTrainingData, 10000);
    return () => clearInterval(interval);
  }, []);

  const startTraining = async (values: any) => {
    try {
      setStartingTraining(true);

      const response = await fetch('/api/training/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (data.success) {
        message.success(`Training started: ${data.trainingId}`);
        form.resetFields();
        fetchTrainingData();
      } else {
        message.error(data.error || 'Failed to start training');
      }
    } catch (error) {
      console.error('Error starting training:', error);
      message.error('Failed to start training');
    } finally {
      setStartingTraining(false);
    }
  };

  const stopTraining = async (trainingId: string) => {
    try {
      const response = await fetch(`/api/training/${trainingId}/stop`, {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        message.success('Training stopped');
        fetchTrainingData();
      } else {
        message.error(data.error || 'Failed to stop training');
      }
    } catch (error) {
      console.error('Error stopping training:', error);
      message.error('Failed to stop training');
    }
  };

  const viewLogs = async (trainingId: string) => {
    try {
      const response = await fetch(`/api/training/${trainingId}/status`);
      const data = await response.json();

      setLogs(data.recentLogs || []);
      setSelectedRun(activeRuns.find(r => r.trainingId === trainingId) || null);
      setLogsModalVisible(true);
    } catch (error) {
      console.error('Error fetching logs:', error);
      message.error('Failed to fetch logs');
    }
  };

  const cleanupCompletedRuns = async () => {
    try {
      const response = await fetch('/api/training/cleanup', {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        message.success(`Cleaned up ${data.cleaned} completed runs`);
        fetchTrainingData();
      }
    } catch (error) {
      console.error('Error cleaning up:', error);
      message.error('Failed to cleanup runs');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <SyncOutlined spin style={{ color: '#1890ff' }} />;
      case 'completed':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'failed':
        return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
      case 'stopped':
        return <ClockCircleOutlined style={{ color: '#faad14' }} />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'processing';
      case 'completed':
        return 'success';
      case 'failed':
        return 'error';
      case 'stopped':
        return 'warning';
      default:
        return 'default';
    }
  };

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const activeRunsColumns = [
    {
      title: 'Training ID',
      dataIndex: 'trainingId',
      key: 'id',
      width: '25%',
      ellipsis: true,
    },
    {
      title: 'Model Type',
      dataIndex: 'modelType',
      key: 'type',
      render: (type: string) => <Tag color='blue'>{type}</Tag>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Space>
          {getStatusIcon(status)}
          <Tag color={getStatusColor(status)}>{status.toUpperCase()}</Tag>
        </Space>
      ),
    },
    {
      title: 'Progress',
      dataIndex: 'progress',
      key: 'progress',
      render: (progress: number) => (
        <Progress
          percent={progress}
          size='small'
          status={progress === 100 ? 'success' : 'active'}
        />
      ),
    },
    {
      title: 'Duration',
      dataIndex: 'duration',
      key: 'duration',
      render: (duration: number) => formatDuration(duration),
    },
    {
      title: 'Started',
      dataIndex: 'startTime',
      key: 'start',
      render: (time: string) => new Date(time).toLocaleString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: TrainingRun) => (
        <Space>
          <Button size='small' icon={<SyncOutlined />} onClick={() => viewLogs(record.trainingId)}>
            Logs
          </Button>
          {record.status === 'running' && (
            <Button
              size='small'
              danger
              icon={<StopOutlined />}
              onClick={() => stopTraining(record.trainingId)}
            >
              Stop
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const historyColumns = [
    {
      title: 'Model',
      dataIndex: 'model_name',
      key: 'model',
      render: (name: string) => <Tag color='purple'>{name}</Tag>,
    },
    {
      title: 'Version',
      dataIndex: 'model_version',
      key: 'version',
    },
    {
      title: 'Dataset Size',
      dataIndex: 'dataset_size',
      key: 'dataset',
      render: (size: number) => size.toLocaleString(),
    },
    {
      title: 'Accuracy',
      dataIndex: 'accuracy_score',
      key: 'accuracy',
      render: (score: number) => (score ? `${(score * 100).toFixed(2)}%` : 'N/A'),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => <Tag color={getStatusColor(status)}>{status.toUpperCase()}</Tag>,
    },
    {
      title: 'Started',
      dataIndex: 'training_start_date',
      key: 'start',
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: 'Duration',
      key: 'duration',
      render: (_: any, record: TrainingHistory) => {
        if (!record.training_end_date) return 'N/A';
        const duration =
          new Date(record.training_end_date).getTime() -
          new Date(record.training_start_date).getTime();
        return formatDuration(duration);
      },
    },
  ];

  return (
    <div className='training-control-panel'>
      <Alert
        message='Neural Network Training Pipeline'
        description='Manage and monitor machine learning model training runs. Start new training sessions, monitor progress, and review historical performance.'
        type='info'
        showIcon
        icon={<ExperimentOutlined />}
        style={{ marginBottom: 24 }}
      />

      {/* Metrics Overview */}
      {metrics && (
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} lg={6}>
            <DSCard.Root>
              <DSCard.Body>
                <Statistic
                  title='Total Training Runs'
                  value={metrics.overall.total_training_runs}
                  prefix={<RocketOutlined />}
                />
              </DSCard.Body>
            </DSCard.Root>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <DSCard.Root>
              <DSCard.Body>
                <Statistic
                  title='Completed Runs'
                  value={metrics.overall.completed_runs}
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: '#3f8600' }}
                />
              </DSCard.Body>
            </DSCard.Root>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <DSCard.Root>
              <DSCard.Body>
                <Statistic
                  title='Average Accuracy'
                  value={(metrics.overall.avg_accuracy * 100).toFixed(2)}
                  suffix='%'
                  prefix={<ThunderboltOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </DSCard.Body>
            </DSCard.Root>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <DSCard.Root>
              <DSCard.Body>
                <Statistic
                  title='Avg Training Time'
                  value={formatDuration(metrics.overall.avg_duration_seconds * 1000)}
                  prefix={<ClockCircleOutlined />}
                />
              </DSCard.Body>
            </DSCard.Root>
          </Col>
        </Row>
      )}

      {/* Start New Training */}
      <DSCard.Root>
        <DSCard.Header title='Start New Training Run' />
        <DSCard.Body>
          <Form
            form={form}
            layout='vertical'
            onFinish={startTraining}
            initialValues={{
              algorithm: 'gradient_boosting',
              epochs: 100,
              batchSize: 32,
              learningRate: 0.001,
            }}
          >
            <Row gutter={16}>
              <Col xs={24} md={8}>
                <Form.Item
                  label='Model Type'
                  name='modelType'
                  rules={[{ required: true, message: 'Please select a model type' }]}
                >
                  <Select placeholder='Select model type'>
                    <Option value='seo'>SEO Ranking Model</Option>
                    <Option value='content_title'>Content Title Generator</Option>
                    <Option value='content_description'>Meta Description Generator</Option>
                    <Option value='content_full'>Full Content Generator</Option>
                    <Option value='ranking'>Learning-to-Rank Model</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item label='Algorithm' name='algorithm'>
                  <Select>
                    <Option value='gradient_boosting'>Gradient Boosting</Option>
                    <Option value='neural_network'>Neural Network</Option>
                    <Option value='random_forest'>Random Forest</Option>
                    <Option value='xgboost'>XGBoost</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item label='Epochs' name='epochs'>
                  <InputNumber min={10} max={1000} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item label='Batch Size' name='batchSize'>
                  <InputNumber min={8} max={256} step={8} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label='Learning Rate' name='learningRate'>
                  <InputNumber min={0.0001} max={0.1} step={0.0001} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item>
              <Space>
                <Button
                  type='primary'
                  htmlType='submit'
                  icon={<PlayCircleOutlined />}
                  loading={startingTraining}
                  size='large'
                >
                  Start Training
                </Button>
                <Button onClick={() => form.resetFields()}>Reset</Button>
              </Space>
            </Form.Item>
          </Form>
        </DSCard.Body>
      </DSCard.Root>

      {/* Active Runs and History */}
      <DSCard.Root>
        <DSCard.Body>
          <Tabs defaultActiveKey='active'>
            <TabPane
              tab={
                <span>
                  <SyncOutlined spin={activeRuns.some(r => r.status === 'running')} />
                  Active Runs ({activeRuns.length})
                </span>
              }
              key='active'
            >
              <Space style={{ marginBottom: 16 }}>
                <Button icon={<SyncOutlined />} onClick={fetchTrainingData} loading={loading}>
                  Refresh
                </Button>
                <Button onClick={cleanupCompletedRuns}>Cleanup Completed</Button>
              </Space>
              <Table
                columns={activeRunsColumns}
                dataSource={activeRuns}
                rowKey='trainingId'
                loading={loading}
                pagination={false}
              />
            </TabPane>

            <TabPane tab='Training History' key='history'>
              <Table
                columns={historyColumns}
                dataSource={history}
                rowKey='id'
                loading={loading}
                pagination={{ pageSize: 10 }}
              />
            </TabPane>

            {metrics && metrics.byModel.length > 0 && (
              <TabPane tab='Model Performance' key='performance'>
                <Row gutter={[16, 16]}>
                  {metrics.byModel.map(model => (
                    <Col xs={24} md={12} key={model.model_name}>
                      <DSCard.Root>
                        <DSCard.Header title={model.model_name} />
                        <DSCard.Body>
                          <Row gutter={8}>
                            <Col span={12}>
                              <Statistic title='Total Runs' value={model.runs} />
                            </Col>
                            <Col span={12}>
                              <Statistic
                                title='Best Accuracy'
                                value={(model.best_accuracy * 100).toFixed(2)}
                                suffix='%'
                                valueStyle={{ color: '#3f8600' }}
                              />
                            </Col>
                            <Col span={12}>
                              <Statistic
                                title='Avg Accuracy'
                                value={(model.avg_accuracy * 100).toFixed(2)}
                                suffix='%'
                              />
                            </Col>
                            <Col span={12}>
                              <Statistic
                                title='Last Trained'
                                value={new Date(model.last_trained).toLocaleDateString()}
                              />
                            </Col>
                          </Row>
                        </DSCard.Body>
                      </DSCard.Root>
                    </Col>
                  ))}
                </Row>
              </TabPane>
            )}
          </Tabs>
        </DSCard.Body>
      </DSCard.Root>

      {/* Logs Modal */}
      <Modal
        title={`Training Logs - ${selectedRun?.trainingId}`}
        open={logsModalVisible}
        onCancel={() => setLogsModalVisible(false)}
        footer={[
          <Button key='close' onClick={() => setLogsModalVisible(false)}>
            Close
          </Button>,
        ]}
        width={800}
      >
        {selectedRun && (
          <div style={{ marginBottom: 16 }}>
            <Space direction='vertical' size='small' style={{ width: '100%' }}>
              <div>
                <strong>Status:</strong>{' '}
                <Tag color={getStatusColor(selectedRun.status)}>
                  {selectedRun.status.toUpperCase()}
                </Tag>
              </div>
              <div>
                <strong>Progress:</strong> <Progress percent={selectedRun.progress} />
              </div>
            </Space>
          </div>
        )}
        <Divider />
        <div
          style={{
            maxHeight: 400,
            overflow: 'auto',
            background: '#f5f5f5',
            padding: 12,
            borderRadius: 4,
          }}
        >
          <pre style={{ margin: 0, fontSize: 12, fontFamily: 'monospace' }}>
            {logs.length > 0 ? logs.join('\n') : 'No logs available'}
          </pre>
        </div>
      </Modal>
    </div>
  );
};

export default TrainingControlPanel;
