import React, { useState, useEffect } from 'react';
import { Card, Tabs, Table, Button, Space, Tag, message, Modal, Form, Input, Select, Progress, Statistic, Row, Col, Descriptions } from 'antd';
import { PlayCircleOutlined, StopOutlined, EyeOutlined, PlusOutlined, ReloadOutlined, RocketOutlined, DatabaseOutlined, LineChartOutlined } from '@ant-design/icons';
import { pretrainedModelAPI } from '../../services/apiService';

const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;

interface PretrainedModel {
  id: string;
  name: string;
  type: string;
  description: string;
  version: string;
  accuracy?: number;
  trained_at?: string;
}

interface TrainingPipeline {
  id: string;
  name: string;
  model_type: string;
  status: string;
  created_at: string;
  config: any;
}

interface TrainingRun {
  id: string;
  pipeline_id: string;
  status: string;
  progress: number;
  started_at: string;
  completed_at?: string;
  metrics?: any;
}

interface TrainingData {
  total_records: number;
  quality_score: number;
  last_updated: string;
  sources: Array<{
    source: string;
    count: number;
  }>;
}

const PretrainedModelDashboard: React.FC = () => {
  const [models, setModels] = useState<PretrainedModel[]>([]);
  const [pipelines, setPipelines] = useState<TrainingPipeline[]>([]);
  const [runs, setRuns] = useState<TrainingRun[]>([]);
  const [trainingData, setTrainingData] = useState<TrainingData | null>(null);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedModel, setSelectedModel] = useState<PretrainedModel | null>(null);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    loadModels();
    loadPipelines();
    loadTrainingData();
  }, []);

  const loadModels = async () => {
    try {
      setLoading(true);
      const response = await pretrainedModelAPI.getModels();
      if (response.success) {
        setModels(response.data);
      }
    } catch (error) {
      message.error('Failed to load models');
    } finally {
      setLoading(false);
    }
  };

  const loadPipelines = async () => {
    try {
      const response = await pretrainedModelAPI.getPipelines();
      if (response.success) {
        setPipelines(response.data);
      }
    } catch (error) {
      message.error('Failed to load pipelines');
    }
  };

  const loadTrainingData = async () => {
    try {
      const response = await pretrainedModelAPI.getTrainingDataQuality();
      if (response.success) {
        setTrainingData(response.data);
      }
    } catch (error) {
      message.error('Failed to load training data quality');
    }
  };

  const handleCreatePipeline = async (values: any) => {
    try {
      setLoading(true);
      const response = await pretrainedModelAPI.createPipeline(values);
      if (response.success) {
        message.success('Training pipeline created successfully');
        setModalVisible(false);
        form.resetFields();
        loadPipelines();
      } else {
        message.error(response.error || 'Failed to create pipeline');
      }
    } catch (error) {
      message.error('Failed to create pipeline');
    } finally {
      setLoading(false);
    }
  };

  const handleStartTraining = async (pipelineId: string) => {
    try {
      setLoading(true);
      const response = await pretrainedModelAPI.startTraining(pipelineId);
      if (response.success) {
        message.success('Training started successfully');
        loadPipelines();
      } else {
        message.error(response.error || 'Failed to start training');
      }
    } catch (error) {
      message.error('Failed to start training');
    } finally {
      setLoading(false);
    }
  };

  const handleViewRun = async (runId: string) => {
    try {
      setLoading(true);
      const response = await pretrainedModelAPI.getTrainingRun(runId);
      if (response.success) {
        setRuns([response.data]);
        message.success('Run details loaded');
      } else {
        message.error(response.error || 'Failed to load run details');
      }
    } catch (error) {
      message.error('Failed to load run details');
    } finally {
      setLoading(false);
    }
  };

  const handleViewModelDetails = (model: PretrainedModel) => {
    setSelectedModel(model);
    setDetailsVisible(true);
  };

  const modelColumns = [
    {
      title: 'Model Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: PretrainedModel) => (
        <Button type="link" onClick={() => handleViewModelDetails(record)}>
          {text}
        </Button>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => {
        const typeColors: Record<string, string> = {
          'seo': 'blue',
          'content': 'green',
          'classification': 'purple',
          'regression': 'orange',
        };
        return <Tag color={typeColors[type] || 'default'}>{type.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Version',
      dataIndex: 'version',
      key: 'version',
    },
    {
      title: 'Accuracy',
      dataIndex: 'accuracy',
      key: 'accuracy',
      render: (accuracy?: number) => accuracy ? `${(accuracy * 100).toFixed(2)}%` : 'N/A',
    },
    {
      title: 'Trained At',
      dataIndex: 'trained_at',
      key: 'trained_at',
      render: (date: string) => date ? new Date(date).toLocaleString() : 'N/A',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: PretrainedModel) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            onClick={() => handleViewModelDetails(record)}
          >
            Details
          </Button>
        </Space>
      ),
    },
  ];

  const pipelineColumns = [
    {
      title: 'Pipeline Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Model Type',
      dataIndex: 'model_type',
      key: 'model_type',
      render: (type: string) => <Tag>{type}</Tag>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusColors: Record<string, string> = {
          'active': 'green',
          'training': 'blue',
          'completed': 'success',
          'failed': 'error',
          'idle': 'default',
        };
        return <Tag color={statusColors[status] || 'default'}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Created At',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: TrainingPipeline) => (
        <Space>
          <Button
            type="primary"
            icon={<PlayCircleOutlined />}
            onClick={() => handleStartTraining(record.id)}
            disabled={record.status === 'training'}
          >
            Start Training
          </Button>
        </Space>
      ),
    },
  ];

  const runColumns = [
    {
      title: 'Run ID',
      dataIndex: 'id',
      key: 'id',
      render: (id: string) => id.substring(0, 8),
    },
    {
      title: 'Pipeline ID',
      dataIndex: 'pipeline_id',
      key: 'pipeline_id',
      render: (id: string) => id.substring(0, 8),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusColors: Record<string, string> = {
          'running': 'processing',
          'completed': 'success',
          'failed': 'error',
        };
        return <Tag color={statusColors[status] || 'default'}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Progress',
      dataIndex: 'progress',
      key: 'progress',
      render: (progress: number) => <Progress percent={progress} />,
    },
    {
      title: 'Started At',
      dataIndex: 'started_at',
      key: 'started_at',
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: 'Completed At',
      dataIndex: 'completed_at',
      key: 'completed_at',
      render: (date?: string) => date ? new Date(date).toLocaleString() : 'In Progress',
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card
        title={
          <Space>
            <RocketOutlined />
            <span>Pretrained Model Training Dashboard</span>
          </Space>
        }
        extra={
          <Button
            type="primary"
            icon={<ReloadOutlined />}
            onClick={() => {
              loadModels();
              loadPipelines();
              loadTrainingData();
            }}
          >
            Refresh
          </Button>
        }
      >
        <Tabs defaultActiveKey="models">
          <TabPane tab="Available Models" key="models">
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <Row gutter={16}>
                <Col span={6}>
                  <Card>
                    <Statistic
                      title="Total Models"
                      value={models.length}
                      prefix={<DatabaseOutlined />}
                    />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card>
                    <Statistic
                      title="Active Pipelines"
                      value={pipelines.filter(p => p.status === 'active').length}
                      prefix={<PlayCircleOutlined />}
                    />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card>
                    <Statistic
                      title="Training Data Quality"
                      value={trainingData ? (trainingData.quality_score * 100).toFixed(1) : 0}
                      suffix="%"
                      prefix={<LineChartOutlined />}
                    />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card>
                    <Statistic
                      title="Training Records"
                      value={trainingData?.total_records || 0}
                      prefix={<DatabaseOutlined />}
                    />
                  </Card>
                </Col>
              </Row>
              <Table
                columns={modelColumns}
                dataSource={models}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 10 }}
              />
            </Space>
          </TabPane>

          <TabPane tab="Training Pipelines" key="pipelines">
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setModalVisible(true)}
              >
                Create Training Pipeline
              </Button>
              <Table
                columns={pipelineColumns}
                dataSource={pipelines}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 10 }}
              />
            </Space>
          </TabPane>

          <TabPane tab="Training Runs" key="runs">
            <Table
              columns={runColumns}
              dataSource={runs}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 10 }}
            />
          </TabPane>

          <TabPane tab="Training Data" key="data">
            {trainingData && (
              <Space direction="vertical" style={{ width: '100%' }} size="large">
                <Card title="Data Quality Overview">
                  <Row gutter={16}>
                    <Col span={8}>
                      <Statistic
                        title="Total Records"
                        value={trainingData.total_records}
                        prefix={<DatabaseOutlined />}
                      />
                    </Col>
                    <Col span={8}>
                      <Statistic
                        title="Quality Score"
                        value={(trainingData.quality_score * 100).toFixed(1)}
                        suffix="%"
                      />
                    </Col>
                    <Col span={8}>
                      <Statistic
                        title="Last Updated"
                        value={new Date(trainingData.last_updated).toLocaleString()}
                      />
                    </Col>
                  </Row>
                </Card>
                <Card title="Data Sources">
                  <Table
                    dataSource={trainingData.sources}
                    columns={[
                      { title: 'Source', dataIndex: 'source', key: 'source' },
                      { title: 'Record Count', dataIndex: 'count', key: 'count' },
                    ]}
                    pagination={false}
                  />
                </Card>
              </Space>
            )}
          </TabPane>
        </Tabs>
      </Card>

      <Modal
        title="Create Training Pipeline"
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreatePipeline}
        >
          <Form.Item
            label="Pipeline Name"
            name="name"
            rules={[{ required: true, message: 'Please enter pipeline name' }]}
          >
            <Input placeholder="e.g., SEO Content Training Pipeline" />
          </Form.Item>
          <Form.Item
            label="Model Type"
            name="model_type"
            rules={[{ required: true, message: 'Please select model type' }]}
          >
            <Select placeholder="Select model type">
              <Option value="seo">SEO Optimization</Option>
              <Option value="content">Content Generation</Option>
              <Option value="classification">Classification</Option>
              <Option value="regression">Regression</Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="Description"
            name="description"
          >
            <TextArea rows={4} placeholder="Describe the training pipeline purpose and configuration" />
          </Form.Item>
          <Form.Item
            label="Configuration"
            name="config"
          >
            <TextArea
              rows={6}
              placeholder='{"epochs": 10, "batch_size": 32, "learning_rate": 0.001}'
            />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                Create Pipeline
              </Button>
              <Button onClick={() => {
                setModalVisible(false);
                form.resetFields();
              }}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Model Details"
        open={detailsVisible}
        onCancel={() => setDetailsVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailsVisible(false)}>
            Close
          </Button>,
        ]}
        width={700}
      >
        {selectedModel && (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Model ID">{selectedModel.id}</Descriptions.Item>
            <Descriptions.Item label="Name">{selectedModel.name}</Descriptions.Item>
            <Descriptions.Item label="Type">
              <Tag>{selectedModel.type.toUpperCase()}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Version">{selectedModel.version}</Descriptions.Item>
            <Descriptions.Item label="Description">{selectedModel.description}</Descriptions.Item>
            <Descriptions.Item label="Accuracy">
              {selectedModel.accuracy ? `${(selectedModel.accuracy * 100).toFixed(2)}%` : 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Trained At">
              {selectedModel.trained_at ? new Date(selectedModel.trained_at).toLocaleString() : 'N/A'}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default PretrainedModelDashboard;
