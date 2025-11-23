import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Tag, Space, Statistic, Row, Col, message, Modal } from 'antd';
import {
  PlusOutlined,
  ReloadOutlined,
  ExperimentOutlined,
  ApiOutlined,
  DatabaseOutlined,
  BranchesOutlined,
  RobotOutlined,
  ThunderboltOutlined
} from '@ant-design/icons';
import { NeuralNetworkInstanceForm } from '@/components/neural/NeuralNetworkInstanceForm';
import { NeuralNetworkDetailView } from '@/components/neural/NeuralNetworkDetailView';

export const NeuralNetworkManagementPage: React.FC = () => {
  const [instances, setInstances] = useState<any[]>([]);
  const [selectedInstance, setSelectedInstance] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);

  useEffect(() => {
    loadInstances();
    loadStats();
  }, []);

  const loadInstances = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/neural-network-dashboard/instances');
      const result = await response.json();
      
      if (result.success) {
        setInstances(result.data);
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

  const loadStats = async () => {
    try {
      const response = await fetch('/api/neural-network-dashboard/stats');
      const result = await response.json();
      
      if (result.success) {
        setStats(result.data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleCreateInstance = async (values: any) => {
    try {
      const response = await fetch('/api/neural-network-dashboard/instances', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      const result = await response.json();

      if (result.success) {
        message.success('Neural network instance created successfully');
        setCreateModalVisible(false);
        loadInstances();
        loadStats();
      } else {
        message.error(result.error || 'Failed to create instance');
      }
    } catch (error) {
      console.error('Error creating instance:', error);
      message.error('Failed to create instance');
    }
  };

  const handleSelectInstance = async (instanceId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/neural-network-dashboard/instances/${instanceId}`);
      const result = await response.json();
      
      if (result.success) {
        setSelectedInstance(result.data);
        setDetailVisible(true);
      } else {
        message.error('Failed to load instance details');
      }
    } catch (error) {
      console.error('Error loading instance:', error);
      message.error('Failed to load instance details');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteInstance = async (instanceId: string) => {
    Modal.confirm({
      title: 'Delete Neural Network Instance',
      content: 'Are you sure you want to delete this neural network instance? This action cannot be undone.',
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          const response = await fetch(`/api/neural-network-dashboard/instances/${instanceId}`, {
            method: 'DELETE',
          });

          const result = await response.json();

          if (result.success) {
            message.success('Instance deleted successfully');
            loadInstances();
            loadStats();
            if (selectedInstance?.id === instanceId) {
              setSelectedInstance(null);
              setDetailVisible(false);
            }
          } else {
            message.error(result.error || 'Failed to delete instance');
          }
        } catch (error) {
          console.error('Error deleting instance:', error);
          message.error('Failed to delete instance');
        }
      },
    });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      ready: 'green',
      training: 'blue',
      initializing: 'orange',
      paused: 'default',
      error: 'red',
    };
    return colors[status] || 'default';
  };

  const getModelTypeIcon = (modelType: string) => {
    const icons: Record<string, React.ReactNode> = {
      scraping: <ApiOutlined />,
      seo: <ThunderboltOutlined />,
      data_mining: <DatabaseOutlined />,
    };
    return icons[modelType] || <ExperimentOutlined />;
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: any) => (
        <Space>
          {getModelTypeIcon(record.model_type)}
          <a onClick={() => handleSelectInstance(record.id)}>{text}</a>
        </Space>
      ),
    },
    {
      title: 'Model Type',
      dataIndex: 'model_type',
      key: 'model_type',
      render: (type: string) => <Tag>{type.replace('_', ' ').toUpperCase()}</Tag>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{status.toUpperCase()}</Tag>
      ),
    },
    {
      title: 'Data Streams',
      dataIndex: 'data_stream_count',
      key: 'data_stream_count',
      render: (count: number) => <Tag icon={<BranchesOutlined />}>{count}</Tag>,
    },
    {
      title: 'Attributes',
      dataIndex: 'active_attribute_count',
      key: 'active_attribute_count',
      render: (count: number) => <Tag>{count}</Tag>,
    },
    {
      title: 'Accuracy',
      dataIndex: 'accuracy',
      key: 'accuracy',
      render: (accuracy: number) => 
        accuracy ? `${(accuracy * 100).toFixed(2)}%` : 'N/A',
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space>
          <Button
            type="link"
            size="small"
            onClick={() => handleSelectInstance(record.id)}
          >
            View
          </Button>
          <Button
            type="link"
            size="small"
            danger
            onClick={() => handleDeleteInstance(record.id)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold">
            <RobotOutlined className="mr-2" />
            Neural Network Management
          </h1>
          <Space>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => {
                loadInstances();
                loadStats();
              }}
            >
              Refresh
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setCreateModalVisible(true)}
            >
              Create Neural Network
            </Button>
          </Space>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <Row gutter={16} className="mb-6">
            <Col span={6}>
              <Card>
                <Statistic
                  title="Total Instances"
                  value={stats.total_instances}
                  prefix={<ExperimentOutlined />}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Ready Instances"
                  value={stats.ready_instances}
                  valueStyle={{ color: '#3f8600' }}
                  prefix={<RobotOutlined />}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Active Streams"
                  value={stats.active_streams}
                  prefix={<BranchesOutlined />}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Avg Accuracy"
                  value={stats.avg_accuracy ? (stats.avg_accuracy * 100).toFixed(2) : 'N/A'}
                  suffix="%"
                  prefix={<ThunderboltOutlined />}
                />
              </Card>
            </Col>
          </Row>
        )}
      </div>

      <Card>
        <Table
          dataSource={instances}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} instances`,
          }}
        />
      </Card>

      {/* Create Instance Modal */}
      <Modal
        title="Create Neural Network Instance"
        open={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        footer={null}
        width={800}
      >
        <NeuralNetworkInstanceForm
          onSubmit={handleCreateInstance}
          onCancel={() => setCreateModalVisible(false)}
        />
      </Modal>

      {/* Detail Modal */}
      <Modal
        title="Neural Network Instance Details"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={null}
        width={1200}
      >
        {selectedInstance && (
          <NeuralNetworkDetailView
            instance={selectedInstance}
            onRefresh={() => handleSelectInstance(selectedInstance.id)}
            onClose={() => setDetailVisible(false)}
          />
        )}
      </Modal>
    </div>
  );
};

export default NeuralNetworkManagementPage;
