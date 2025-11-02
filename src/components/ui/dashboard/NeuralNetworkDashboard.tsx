/**
 * Neural Network Dashboard
 * 
 * Main dashboard for managing neural network instances
 * Features:
 * - List of all neural network instances
 * - Create new instance button with AI workflow wizard
 * - Instance status monitoring
 * - Training and prediction controls
 */

import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Table,
  Tag,
  Space,
  Modal,
  message,
  Statistic,
  Row,
  Col,
  Typography,
  Tooltip,
  Spin
} from 'antd';
import {
  PlusOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  RocketOutlined,
  DeploymentUnitOutlined,
  SettingOutlined,
  EyeOutlined,
  DeleteOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import NeuralNetworkWizard from './NeuralNetworkWizard';

const { Title, Text } = Typography;

interface NeuralNetworkInstance {
  id: string;
  clientId: string;
  modelType: string;
  status: 'initializing' | 'training' | 'ready' | 'predicting' | 'updating' | 'paused' | 'error' | 'archived';
  version?: string;
  performance?: {
    accuracy?: number;
    loss?: number;
    validationAccuracy?: number;
    validationLoss?: number;
    trainingTime?: number;
    inferenceTime?: number;
    lastTrainingDate?: string;
    predictionCount?: number;
  };
  metadata: {
    name: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
  };
}

const NeuralNetworkDashboard: React.FC = () => {
  const [instances, setInstances] = useState<NeuralNetworkInstance[]>([]);
  const [loading, setLoading] = useState(true);
  const [wizardVisible, setWizardVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    ready: 0,
    training: 0,
    error: 0
  });

  useEffect(() => {
    loadInstances();
  }, []);

  const loadInstances = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/neural-networks/instances');
      if (response.ok) {
        const data = await response.json();
        setInstances(data);
        
        // Calculate stats
        const stats = {
          total: data.length,
          ready: data.filter((i: NeuralNetworkInstance) => i.status === 'ready').length,
          training: data.filter((i: NeuralNetworkInstance) => i.status === 'training').length,
          error: data.filter((i: NeuralNetworkInstance) => i.status === 'error').length
        };
        setStats(stats);
      } else {
        message.error('Failed to load neural network instances');
      }
    } catch (error) {
      console.error('Error loading instances:', error);
      message.error('Failed to load neural network instances');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadInstances();
    setRefreshing(false);
    message.success('Instances refreshed');
  };

  const handleCreateInstance = () => {
    setWizardVisible(true);
  };

  const handleWizardComplete = async (config: any) => {
    setWizardVisible(false);
    await loadInstances();
    message.success('Neural network instance created successfully!');
  };

  const handleTrain = async (instanceId: string) => {
    try {
      const response = await fetch(`/api/neural-networks/instances/${instanceId}/train`, {
        method: 'POST'
      });
      
      if (response.ok) {
        message.success('Training started');
        await loadInstances();
      } else {
        message.error('Failed to start training');
      }
    } catch (error) {
      console.error('Error starting training:', error);
      message.error('Failed to start training');
    }
  };

  const handleDelete = async (instanceId: string) => {
    Modal.confirm({
      title: 'Delete Neural Network Instance',
      content: 'Are you sure you want to delete this instance? This action cannot be undone.',
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          const response = await fetch(`/api/neural-networks/instances/${instanceId}`, {
            method: 'DELETE'
          });
          
          if (response.ok) {
            message.success('Instance deleted');
            await loadInstances();
          } else {
            message.error('Failed to delete instance');
          }
        } catch (error) {
          console.error('Error deleting instance:', error);
          message.error('Failed to delete instance');
        }
      }
    });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      initializing: 'blue',
      training: 'orange',
      ready: 'green',
      predicting: 'cyan',
      updating: 'purple',
      paused: 'default',
      error: 'red',
      archived: 'default'
    };
    return colors[status] || 'default';
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: ['metadata', 'name'],
      key: 'name',
      render: (name: string, record: NeuralNetworkInstance) => (
        <Space direction="vertical" size={0}>
          <Text strong>{name}</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>{record.id}</Text>
        </Space>
      )
    },
    {
      title: 'Model Type',
      dataIndex: 'modelType',
      key: 'modelType',
      render: (type: string) => (
        <Tag color="blue">{type.replace(/_/g, ' ')}</Tag>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{status.toUpperCase()}</Tag>
      )
    },
    {
      title: 'Performance',
      key: 'performance',
      render: (_: any, record: NeuralNetworkInstance) => {
        if (!record.performance) {
          return <Text type="secondary">Not trained</Text>;
        }
        return (
          <Space direction="vertical" size={0}>
            {record.performance.accuracy !== undefined && (
              <Text>Accuracy: {(record.performance.accuracy * 100).toFixed(2)}%</Text>
            )}
            {record.performance.validationAccuracy !== undefined && (
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Val: {(record.performance.validationAccuracy * 100).toFixed(2)}%
              </Text>
            )}
          </Space>
        );
      }
    },
    {
      title: 'Version',
      dataIndex: 'version',
      key: 'version',
      render: (version?: string) => version || '-'
    },
    {
      title: 'Created',
      dataIndex: ['metadata', 'createdAt'],
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString()
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: NeuralNetworkInstance) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              type="text"
              icon={<EyeOutlined />}
              size="small"
            />
          </Tooltip>
          {record.status === 'ready' && (
            <Tooltip title="Start Training">
              <Button
                type="text"
                icon={<PlayCircleOutlined />}
                size="small"
                onClick={() => handleTrain(record.id)}
              />
            </Tooltip>
          )}
          <Tooltip title="Settings">
            <Button
              type="text"
              icon={<SettingOutlined />}
              size="small"
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              size="small"
              onClick={() => handleDelete(record.id)}
            />
          </Tooltip>
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <Row align="middle" justify="space-between">
          <Col>
            <Title level={2} style={{ margin: 0 }}>
              <DeploymentUnitOutlined style={{ marginRight: '12px' }} />
              Neural Network Instances
            </Title>
          </Col>
          <Col>
            <Space>
              <Button
                icon={<ReloadOutlined />}
                onClick={handleRefresh}
                loading={refreshing}
              >
                Refresh
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                size="large"
                onClick={handleCreateInstance}
              >
                Create New Instance
              </Button>
            </Space>
          </Col>
        </Row>
      </div>

      {/* Stats Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Instances"
              value={stats.total}
              prefix={<DeploymentUnitOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Ready"
              value={stats.ready}
              valueStyle={{ color: '#3f8600' }}
              prefix={<RocketOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Training"
              value={stats.training}
              valueStyle={{ color: '#cf1322' }}
              prefix={<PlayCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Errors"
              value={stats.error}
              valueStyle={{ color: '#ff4d4f' }}
              prefix={<PauseCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Instances Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={instances}
          loading={loading}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} instances`
          }}
        />
      </Card>

      {/* Wizard Modal */}
      <Modal
        title="Create Neural Network Instance"
        open={wizardVisible}
        onCancel={() => setWizardVisible(false)}
        footer={null}
        width={900}
        destroyOnClose
      >
        <NeuralNetworkWizard
          onComplete={handleWizardComplete}
          onCancel={() => setWizardVisible(false)}
        />
      </Modal>
    </div>
  );
};

export default NeuralNetworkDashboard;
