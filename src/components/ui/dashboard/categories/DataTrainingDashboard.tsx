/**
 * Data Training Dashboard
 * Category dashboard for ML/AI training pipeline management
 */

import React, { useState, useEffect } from 'react';
import { Table, Tag, Progress, Space, Button, message, Timeline } from 'antd';
import {
  RocketOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import DashboardBoilerplate from '../DashboardBoilerplate';
import { DashboardCard } from '../atoms';

const DataTrainingDashboard: React.FC = () => {
  const [trainingSessions, setTrainingSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTrainingSessions = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/training/sessions');
      if (response.ok) {
        const data = await response.json();
        setTrainingSessions(data.sessions || []);
      }
    } catch (error) {
      console.error('Error fetching training sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainingSessions();
  }, []);

  const stats = [
    {
      title: 'Active Training',
      value: trainingSessions.filter(s => s.status === 'running').length,
      icon: <RocketOutlined />,
      trend: 'up' as const,
      trendValue: '+2',
      description: 'Currently training',
    },
    {
      title: 'Total Sessions',
      value: trainingSessions.length,
      icon: <ThunderboltOutlined />,
      description: 'All sessions',
    },
    {
      title: 'Completed',
      value: trainingSessions.filter(s => s.status === 'completed').length,
      icon: <CheckCircleOutlined />,
      trend: 'up' as const,
      trendValue: '+15',
      description: 'This month',
    },
    {
      title: 'Avg Accuracy',
      value: '92.8%',
      icon: <RocketOutlined />,
      trend: 'up' as const,
      trendValue: '+3.2%',
      description: 'Model performance',
    },
  ];

  const columns = [
    {
      title: 'Session Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <strong>{text}</strong>,
    },
    {
      title: 'Model',
      dataIndex: 'model_name',
      key: 'model_name',
      render: (name: string) => <Tag color="volcano">{name}</Tag>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const colors: Record<string, string> = {
          running: 'processing',
          completed: 'success',
          failed: 'error',
          pending: 'warning',
        };
        return <Tag color={colors[status] || 'default'}>{status}</Tag>;
      },
    },
    {
      title: 'Progress',
      dataIndex: 'progress',
      key: 'progress',
      render: (progress: number, record: any) => (
        <div>
          <Progress percent={progress || 0} size="small" />
          <small>{record.current_epoch}/{record.total_epochs} epochs</small>
        </div>
      ),
    },
    {
      title: 'Accuracy',
      dataIndex: 'accuracy',
      key: 'accuracy',
      render: (accuracy: number) => accuracy ? `${(accuracy * 100).toFixed(2)}%` : 'N/A',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space>
          {record.status === 'running' ? (
            <Button size="small" icon={<PauseCircleOutlined />}>Pause</Button>
          ) : (
            <Button size="small" icon={<PlayCircleOutlined />}>Resume</Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <DashboardBoilerplate
      categoryId="data-training"
      categoryName="training"
      categoryDisplayName="Data Training"
      categoryIcon={<RocketOutlined />}
      categoryDescription="ML/AI training pipeline and session management"
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Data Training' },
      ]}
      stats={stats}
      loading={loading}
      onRefresh={fetchTrainingSessions}
      onCreate={() => message.info('Create training session modal would open here')}
    >
      <DashboardCard title="Training Sessions" icon={<RocketOutlined />}>
        <Table
          columns={columns}
          dataSource={trainingSessions}
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </DashboardCard>
    </DashboardBoilerplate>
  );
};

export default DataTrainingDashboard;
