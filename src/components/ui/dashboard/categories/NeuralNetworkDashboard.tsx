/**
 * Neural Network Dashboard
 * Category dashboard for AI/ML neural network models management
 */

import React, { useState, useEffect } from 'react';
import { Table, Tag, Progress, Space, Button, message } from 'antd';
import {
  ExperimentOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  RocketOutlined,
  ThunderboltOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import DashboardBoilerplate from '../DashboardBoilerplate';
import { DashboardCard } from '../atoms';

const NeuralNetworkDashboard: React.FC = () => {
  const [instances, setInstances] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchInstances = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/neural-networks/instances');
      if (response.ok) {
        const data = await response.json();
        setInstances(data.instances || []);
      }
    } catch (error) {
      console.error('Error fetching neural networks:', error);
      message.error('Failed to load neural networks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstances();
  }, []);

  const stats = [
    {
      title: 'Total Models',
      value: instances.length,
      icon: <ExperimentOutlined />,
      trend: 'up' as const,
      trendValue: '+12%',
      description: 'vs last month',
    },
    {
      title: 'Training',
      value: instances.filter(i => i.status === 'training').length,
      icon: <PlayCircleOutlined />,
      trend: 'neutral' as const,
      description: 'Currently active',
    },
    {
      title: 'Ready',
      value: instances.filter(i => i.status === 'ready').length,
      icon: <CheckCircleOutlined />,
      trend: 'up' as const,
      trendValue: '+5',
      description: 'Deployed models',
    },
    {
      title: 'Avg Accuracy',
      value: '94.2%',
      icon: <ThunderboltOutlined />,
      trend: 'up' as const,
      trendValue: '+2.1%',
      description: 'Model performance',
    },
  ];

  const columns = [
    {
      title: 'Model Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <strong>{text}</strong>,
    },
    {
      title: 'Type',
      dataIndex: 'model_type',
      key: 'model_type',
      render: (type: string) => <Tag color="blue">{type}</Tag>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const colors: Record<string, string> = {
          training: 'processing',
          ready: 'success',
          error: 'error',
          paused: 'warning',
        };
        return <Tag color={colors[status] || 'default'}>{status}</Tag>;
      },
    },
    {
      title: 'Accuracy',
      dataIndex: 'accuracy',
      key: 'accuracy',
      render: (accuracy: number) => (
        <Progress 
          percent={accuracy || 0} 
          size="small" 
          status={accuracy > 90 ? 'success' : 'active'}
        />
      ),
    },
    {
      title: 'Last Trained',
      dataIndex: 'last_trained_at',
      key: 'last_trained_at',
      render: (date: string) => date ? new Date(date).toLocaleDateString() : 'Never',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space>
          <Button size="small" icon={<PlayCircleOutlined />}>Train</Button>
          <Button size="small" icon={<RocketOutlined />}>Deploy</Button>
        </Space>
      ),
    },
  ];

  return (
    <DashboardBoilerplate
      categoryId="neural-networks"
      categoryName="neural_networks"
      categoryDisplayName="Neural Networks"
      categoryIcon={<ExperimentOutlined />}
      categoryDescription="AI/ML neural network models and training management"
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Neural Networks' },
      ]}
      stats={stats}
      loading={loading}
      onRefresh={fetchInstances}
      onCreate={() => message.info('Create neural network modal would open here')}
      onExport={() => message.info('Export neural networks data')}
    >
      <DashboardCard title="Neural Network Models" icon={<ExperimentOutlined />}>
        <Table
          columns={columns}
          dataSource={instances}
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </DashboardCard>
    </DashboardBoilerplate>
  );
};

export default NeuralNetworkDashboard;
