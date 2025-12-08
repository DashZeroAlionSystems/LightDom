import { NeuralNetworkDetailView } from '@/components/neural/NeuralNetworkDetailView';
import { NeuralNetworkInstanceForm } from '@/components/neural/NeuralNetworkInstanceForm';
import {
  ApiOutlined,
  BranchesOutlined,
  DatabaseOutlined,
  PlusOutlined,
  ReloadOutlined,
  RobotOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import {
  Button,
  Card,
  Col,
  Empty,
  message,
  Modal,
  Row,
  Space,
  Spin,
  Statistic,
  Table,
  Tag,
} from 'antd';
import React, { useEffect, useState } from 'react';

interface NeuralNetworkInstance {
  id: string;
  name: string;
  model_type: string;
  status: string;
  created_at: string;
  updated_at: string;
  accuracy?: number;
  description?: string;
  metadata?: Record<string, unknown>;
}

interface NeuralNetworkStats {
  total_instances?: number;
  active_instances?: number;
  training_instances?: number;
  datasets?: number;
  crawler_integrations?: number;
  seeder_integrations?: number;
}

const formatModelType = (value?: string) => (value ? value.replace(/_/g, ' ') : 'unknown');

const statusColor = (status?: string) => {
  const normalized = status?.toLowerCase();
  switch (normalized) {
    case 'ready':
    case 'active':
      return 'green';
    case 'training':
      return 'blue';
    case 'initializing':
      return 'orange';
    case 'paused':
      return 'gold';
    case 'error':
      return 'red';
    default:
      return 'default';
  }
};

export const NeuralNetworkManagementPage: React.FC = () => {
  const [instances, setInstances] = useState<NeuralNetworkInstance[]>([]);
  const [stats, setStats] = useState<NeuralNetworkStats | null>(null);
  const [tableLoading, setTableLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selectedInstance, setSelectedInstance] = useState<any | null>(null);

  useEffect(() => {
    void refreshAll();
  }, []);

  const loadInstances = async () => {
    setTableLoading(true);
    let loaded = false;

    try {
      const response = await fetch('/api/neural-network-dashboard/instances');
      if (response.ok) {
        const payload = await response.json();
        if (payload?.success && Array.isArray(payload.data)) {
          setInstances(payload.data);
          loaded = true;
        }
      }
    } catch (error) {
      console.error('Failed to load neural network instances (dashboard endpoint):', error);
    }

    if (!loaded) {
      try {
        const fallback = await fetch('/api/neural-networks/instances');
        if (fallback.ok) {
          const data = await fallback.json();
          if (Array.isArray(data)) {
            setInstances(data);
            loaded = true;
          }
        }
      } catch (error) {
        console.error('Failed to load neural network instances (fallback endpoint):', error);
      }
    }

    if (!loaded) {
      message.error('Failed to load neural network instances');
    }

    setTableLoading(false);
  };

  const loadStats = async () => {
    setStatsLoading(true);
    try {
      const response = await fetch('/api/neural-network-dashboard/stats');
      if (response.ok) {
        const payload = await response.json();
        if (payload?.success && payload.data) {
          setStats(payload.data as NeuralNetworkStats);
          setStatsLoading(false);
          return;
        }
      }
    } catch (error) {
      console.error('Failed to load neural network stats:', error);
    }

    setStatsLoading(false);
  };

  const refreshAll = async () => {
    await Promise.all([loadInstances(), loadStats()]);
  };

  const handleOpenDetail = async (instanceId: string) => {
    setSelectedInstance(null);
    setDetailVisible(true);
    setDetailLoading(true);

    try {
      const response = await fetch(`/api/neural-network-dashboard/instances/${instanceId}`);
      if (response.ok) {
        const payload = await response.json();
        if (payload?.success) {
          setSelectedInstance(payload.data);
          setDetailLoading(false);
          return;
        }
      }
    } catch (error) {
      console.error('Failed to load neural network instance (dashboard endpoint):', error);
    }

    try {
      const fallback = await fetch(`/api/neural-networks/instances/${instanceId}`);
      if (fallback.ok) {
        const data = await fallback.json();
        setSelectedInstance(data);
        setDetailLoading(false);
        return;
      }
    } catch (error) {
      console.error('Failed to load neural network instance (fallback endpoint):', error);
    }

    message.error('Failed to load neural network instance details');
    setDetailLoading(false);
  };

  const handleCreateInstance = async (values: any) => {
    try {
      const response = await fetch('/api/neural-network-dashboard/instances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        const payload = await response.json();
        if (payload?.success) {
          message.success('Neural network instance created successfully');
          setCreateModalVisible(false);
          await refreshAll();
          return;
        }

        message.error(payload?.error || 'Failed to create neural network instance');
        return;
      }
    } catch (error) {
      console.error('Failed to create neural network instance:', error);
    }

    message.error('Failed to create neural network instance');
  };

  const closeDetailModal = () => {
    setDetailVisible(false);
    setSelectedInstance(null);
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (_: string, record: NeuralNetworkInstance) => (
        <Button type='link' onClick={() => void handleOpenDetail(record.id)}>
          {record.name}
        </Button>
      ),
    },
    {
      title: 'Model Type',
      dataIndex: 'model_type',
      key: 'model_type',
      render: (value: string) => <Tag>{formatModelType(value)}</Tag>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (value: string) => (
        <Tag color={statusColor(value)}>{value?.toUpperCase() || 'UNKNOWN'}</Tag>
      ),
    },
    {
      title: 'Accuracy',
      dataIndex: 'accuracy',
      key: 'accuracy',
      render: (value?: number) =>
        typeof value === 'number' ? `${(value * 100).toFixed(1)}%` : '—',
    },
    {
      title: 'Last Updated',
      dataIndex: 'updated_at',
      key: 'updated_at',
      render: (value: string) => (value ? new Date(value).toLocaleString() : '—'),
    },
    {
      key: 'actions',
      render: (_: unknown, record: NeuralNetworkInstance) => (
        <Button
          size='small'
          icon={<ReloadOutlined />}
          onClick={() => void handleOpenDetail(record.id)}
        >
          Inspect
        </Button>
      ),
    },
  ];

  const statCards = [
    {
      title: 'Total Instances',
      value: stats?.total_instances ?? instances.length,
      icon: <RobotOutlined className='text-2xl text-primary' />,
    },
    {
      title: 'Active',
      value:
        stats?.active_instances ??
        instances.filter(item => item.status?.toLowerCase() === 'active').length,
      icon: <ThunderboltOutlined className='text-2xl text-success' />,
    },
    {
      title: 'Training',
      value:
        stats?.training_instances ??
        instances.filter(item => item.status?.toLowerCase() === 'training').length,
      icon: <ApiOutlined className='text-2xl text-warning' />,
    },
    {
      title: 'Datasets',
      value: stats?.datasets ?? 0,
      icon: <DatabaseOutlined className='text-2xl text-info' />,
    },
    {
      title: 'Crawler Integrations',
      value: stats?.crawler_integrations ?? 0,
      icon: <BranchesOutlined className='text-2xl text-secondary' />,
    },
    {
      title: 'Seeder Integrations',
      value: stats?.seeder_integrations ?? 0,
      icon: <PlusOutlined className='text-2xl text-muted' />,
    },
  ];

  return (
    <div className='space-y-6 p-6'>
      <Row gutter={[16, 16]}>
        {statCards.map(card => (
          <Col xs={24} sm={12} md={8} lg={6} key={card.title}>
            <Card>
              <Space align='start' size='large'>
                {card.icon}
                <div>
                  <Statistic
                    title={card.title}
                    value={statsLoading ? <Spin size='small' /> : card.value}
                    valueRender={valueNode => (
                      <span className='text-lg font-semibold'>{valueNode}</span>
                    )}
                  />
                </div>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>

      <Card
        title='Neural Network Instances'
        extra={
          <Space>
            <Button icon={<ReloadOutlined />} onClick={() => void refreshAll()}>
              Refresh
            </Button>
            <Button
              type='primary'
              icon={<PlusOutlined />}
              onClick={() => setCreateModalVisible(true)}
            >
              New Instance
            </Button>
          </Space>
        }
      >
        <Table
          dataSource={instances}
          columns={columns}
          rowKey='id'
          loading={tableLoading}
          pagination={false}
          locale={{
            emptyText: tableLoading ? (
              <Spin />
            ) : (
              <Empty description='No neural network instances found' />
            ),
          }}
        />
      </Card>

      <Modal
        title='Create Neural Network Instance'
        open={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        footer={null}
        destroyOnClose
      >
        <NeuralNetworkInstanceForm
          onSubmit={handleCreateInstance}
          onCancel={() => setCreateModalVisible(false)}
        />
      </Modal>

      <Modal
        title={selectedInstance?.name || 'Neural Network Instance'}
        open={detailVisible}
        onCancel={closeDetailModal}
        footer={null}
        width={900}
        destroyOnClose
      >
        {detailLoading ? (
          <div className='flex justify-center py-12'>
            <Spin />
          </div>
        ) : selectedInstance ? (
          <NeuralNetworkDetailView
            instance={selectedInstance}
            onRefresh={() => selectedInstance && void handleOpenDetail(selectedInstance.id)}
            onClose={closeDetailModal}
          />
        ) : (
          <Empty description='No instance selected' />
        )}
      </Modal>
    </div>
  );
};

export default NeuralNetworkManagementPage;
