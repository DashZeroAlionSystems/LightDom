/**
 * Neural Network Instance Management Dashboard
 * UI for creating and managing per-client neural network instances
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
  Alert
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
  LineChartOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

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
}

export const NeuralNetworkInstanceDashboard: React.FC = () => {
  const [instances, setInstances] = useState<NeuralNetworkInstance[]>([]);
  const [selectedInstance, setSelectedInstance] = useState<NeuralNetworkInstance | null>(null);
  const [loading, setLoading] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    loadInstances();
  }, []);

  const loadInstances = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/neural-networks/instances');
      const data = await response.json();
      setInstances(data);
    } catch (error) {
      message.error('Failed to load neural network instances');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInstance = async (values: any) => {
    try {
      const response = await fetch('/api/neural-networks/instances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      });
      
      if (response.ok) {
        message.success('Neural network instance created successfully');
        setCreateModalVisible(false);
        form.resetFields();
        loadInstances();
      } else {
        message.error('Failed to create instance');
      }
    } catch (error) {
      message.error('Error creating instance');
    }
  };

  const handleTrainInstance = async (instanceId: string) => {
    try {
      const response = await fetch(`/api/neural-networks/instances/${instanceId}/train`, {
        method: 'POST'
      });
      
      if (response.ok) {
        message.success('Training started');
        loadInstances();
      } else {
        message.error('Failed to start training');
      }
    } catch (error) {
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
          message.error('Error deleting instance');
        }
      }
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ready': return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'training': return <ThunderboltOutlined style={{ color: '#1890ff' }} />;
      case 'error': return <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />;
      default: return <ClockCircleOutlined style={{ color: '#faad14' }} />;
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, any> = {
      ready: 'success',
      training: 'processing',
      error: 'error',
      initializing: 'warning',
      paused: 'default'
    };
    return colors[status] || 'default';
  };

  const modelTypes = [
    { value: 'seo_optimization', label: 'SEO Optimization' },
    { value: 'component_generation', label: 'Component Generation' },
    { value: 'workflow_prediction', label: 'Workflow Prediction' },
    { value: 'accessibility_improvement', label: 'Accessibility Improvement' },
    { value: 'ux_pattern_recognition', label: 'UX Pattern Recognition' },
    { value: 'performance_optimization', label: 'Performance Optimization' },
    { value: 'content_generation', label: 'Content Generation' }
  ];

  const columns = [
    {
      title: 'Instance ID',
      dataIndex: 'id',
      key: 'id',
      render: (id: string) => <Text code copyable={{ text: id }}>{id.substring(0, 20)}...</Text>
    },
    {
      title: 'Client',
      dataIndex: 'clientId',
      key: 'clientId',
      render: (clientId: string) => <Tag color="blue">{clientId}</Tag>
    },
    {
      title: 'Model Type',
      dataIndex: 'modelType',
      key: 'modelType',
      render: (type: string) => {
        const modelType = modelTypes.find(m => m.value === type);
        return <Tag color="purple">{modelType?.label || type}</Tag>;
      }
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
      )
    },
    {
      title: 'Version',
      dataIndex: 'version',
      key: 'version',
      render: (version: string) => <Tag>{version}</Tag>
    },
    {
      title: 'Performance',
      key: 'performance',
      render: (_: any, record: NeuralNetworkInstance) => {
        if (!record.performance) return <Text type="secondary">Not trained</Text>;
        return (
          <Space direction="vertical" size="small">
            <Text>Accuracy: {(record.performance.accuracy * 100).toFixed(2)}%</Text>
            <Progress
              percent={record.performance.accuracy * 100}
              size="small"
              status={record.performance.accuracy > 0.8 ? 'success' : 'normal'}
            />
          </Space>
        );
      }
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
                setDetailsModalVisible(true);
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
          <Tooltip title="Delete Instance">
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDeleteInstance(record.id)}
            />
          </Tooltip>
        </Space>
      )
    }
  ];

  const stats = {
    total: instances.length,
    ready: instances.filter(i => i.status === 'ready').length,
    training: instances.filter(i => i.status === 'training').length,
    error: instances.filter(i => i.status === 'error').length
  };

  return (
    <div style={{ padding: 24 }}>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card>
            <Row justify="space-between" align="middle">
              <Col>
                <Title level={2}>
                  <RocketOutlined /> Neural Network Instances
                </Title>
                <Paragraph>
                  Manage per-client neural network instances with isolated training data
                </Paragraph>
              </Col>
              <Col>
                <Space>
                  <Button icon={<ReloadOutlined />} onClick={loadInstances} loading={loading}>
                    Refresh
                  </Button>
                  <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateModalVisible(true)}>
                    Create Instance
                  </Button>
                </Space>
              </Col>
            </Row>
          </Card>
        </Col>

        <Col span={6}>
          <Card>
            <Statistic title="Total Instances" value={stats.total} prefix={<DatabaseOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Ready"
              value={stats.ready}
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Training"
              value={stats.training}
              valueStyle={{ color: '#1890ff' }}
              prefix={<ThunderboltOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Errors"
              value={stats.error}
              valueStyle={{ color: '#ff4d4f' }}
              prefix={<ExclamationCircleOutlined />}
            />
          </Card>
        </Col>

        <Col span={24}>
          <Card>
            <Table
              columns={columns}
              dataSource={instances}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </Col>
      </Row>

      <Modal
        title="Create Neural Network Instance"
        open={createModalVisible}
        onCancel={() => {
          setCreateModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={800}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateInstance}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="clientId"
                label="Client ID"
                rules={[{ required: true, message: 'Please enter client ID' }]}
              >
                <Input placeholder="client-001" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="modelType"
                label="Model Type"
                rules={[{ required: true, message: 'Please select model type' }]}
              >
                <Select placeholder="Select model type">
                  {modelTypes.map(type => (
                    <Option key={type.value} value={type.value}>{type.label}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name={['metadata', 'name']} label="Instance Name">
            <Input placeholder="e.g., Acme Corp SEO Optimizer" />
          </Form.Item>

          <Form.Item name={['metadata', 'description']} label="Description">
            <Input.TextArea rows={3} placeholder="Describe the purpose" />
          </Form.Item>

          <Title level={5}>Training Configuration</Title>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name={['trainingConfig', 'epochs']} label="Epochs" initialValue={50}>
                <InputNumber min={1} max={1000} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name={['trainingConfig', 'batchSize']} label="Batch Size" initialValue={32}>
                <InputNumber min={1} max={256} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name={['trainingConfig', 'learningRate']} label="Learning Rate" initialValue={0.001}>
                <InputNumber min={0.00001} max={1} step={0.0001} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">Create Instance</Button>
              <Button onClick={() => {
                setCreateModalVisible(false);
                form.resetFields();
              }}>Cancel</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Neural Network Instance Details"
        open={detailsModalVisible}
        onCancel={() => {
          setDetailsModalVisible(false);
          setSelectedInstance(null);
        }}
        footer={null}
        width={1000}
      >
        {selectedInstance && (
          <Tabs defaultActiveKey="overview">
            <TabPane tab="Overview" key="overview">
              <Descriptions bordered column={2}>
                <Descriptions.Item label="Instance ID" span={2}>
                  <Text code copyable>{selectedInstance.id}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Client ID">
                  <Tag color="blue">{selectedInstance.clientId}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Model Type">
                  <Tag color="purple">{selectedInstance.modelType}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Status">
                  <Badge status={getStatusColor(selectedInstance.status) as any} text={selectedInstance.status} />
                </Descriptions.Item>
                <Descriptions.Item label="Version">{selectedInstance.version}</Descriptions.Item>
                <Descriptions.Item label="Created">
                  {new Date(selectedInstance.metadata.createdAt).toLocaleString()}
                </Descriptions.Item>
                <Descriptions.Item label="Updated">
                  {new Date(selectedInstance.metadata.updatedAt).toLocaleString()}
                </Descriptions.Item>
              </Descriptions>
            </TabPane>

            <TabPane tab="Performance" key="performance">
              {selectedInstance.performance ? (
                <Row gutter={[16, 16]}>
                  <Col span={6}>
                    <Card>
                      <Statistic
                        title="Accuracy"
                        value={selectedInstance.performance.accuracy * 100}
                        precision={2}
                        suffix="%"
                        prefix={<LineChartOutlined />}
                      />
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card>
                      <Statistic
                        title="Validation Accuracy"
                        value={selectedInstance.performance.validationAccuracy * 100}
                        precision={2}
                        suffix="%"
                      />
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card>
                      <Statistic
                        title="Training Time"
                        value={selectedInstance.performance.trainingTime / 1000}
                        precision={2}
                        suffix="sec"
                      />
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card>
                      <Statistic
                        title="Predictions Made"
                        value={selectedInstance.performance.predictionCount || 0}
                      />
                    </Card>
                  </Col>
                </Row>
              ) : (
                <Alert message="No performance metrics available. Train the model first." type="info" />
              )}
            </TabPane>
          </Tabs>
        )}
      </Modal>
    </div>
  );
};

export default NeuralNetworkInstanceDashboard;
