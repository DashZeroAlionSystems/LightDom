/**
 * Data Streams Dashboard
 * Category dashboard for real-time data streaming pipelines
 */

import React, { useState, useEffect } from 'react';
import { Table, Tag, Badge, Space, Button, message } from 'antd';
import {
  GlobalOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  LineChartOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import DashboardBoilerplate from '../DashboardBoilerplate';
import { DashboardCard } from '../atoms';

const DataStreamsDashboard: React.FC = () => {
  const [streams, setStreams] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchStreams = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/data-streams');
      if (response.ok) {
        const data = await response.json();
        setStreams(data.streams || []);
      }
    } catch (error) {
      console.error('Error fetching data streams:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStreams();
  }, []);

  const stats = [
    {
      title: 'Active Streams',
      value: streams.filter(s => s.status === 'active').length,
      icon: <GlobalOutlined />,
      trend: 'up' as const,
      trendValue: '+3',
      description: 'Currently running',
    },
    {
      title: 'Total Streams',
      value: streams.length,
      icon: <LineChartOutlined />,
      description: 'All configured',
    },
    {
      title: 'Events/sec',
      value: '1.2K',
      icon: <ThunderboltOutlined />,
      trend: 'up' as const,
      trendValue: '+15%',
      description: 'Processing rate',
    },
    {
      title: 'Uptime',
      value: '99.8%',
      icon: <PlayCircleOutlined />,
      trend: 'up' as const,
      trendValue: '+0.2%',
      description: 'System availability',
    },
  ];

  const columns = [
    {
      title: 'Stream Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: any) => (
        <Space>
          <Badge status={record.status === 'active' ? 'processing' : 'default'} />
          <strong>{text}</strong>
        </Space>
      ),
    },
    {
      title: 'Source',
      dataIndex: 'source',
      key: 'source',
      render: (source: string) => <Tag color="cyan">{source}</Tag>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const colors: Record<string, string> = {
          active: 'success',
          paused: 'warning',
          error: 'error',
          stopped: 'default',
        };
        return <Tag color={colors[status] || 'default'}>{status}</Tag>;
      },
    },
    {
      title: 'Events Processed',
      dataIndex: 'events_processed',
      key: 'events_processed',
      render: (count: number) => count?.toLocaleString() || 0,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space>
          {record.status === 'active' ? (
            <Button size="small" icon={<PauseCircleOutlined />}>Pause</Button>
          ) : (
            <Button size="small" icon={<PlayCircleOutlined />}>Start</Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <DashboardBoilerplate
      categoryId="data-streams"
      categoryName="data_streams"
      categoryDisplayName="Data Streams"
      categoryIcon={<GlobalOutlined />}
      categoryDescription="Real-time data streaming pipelines and processing"
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Data Streams' },
      ]}
      stats={stats}
      loading={loading}
      onRefresh={fetchStreams}
      onCreate={() => message.info('Create data stream modal would open here')}
    >
      <DashboardCard title="Data Streaming Pipelines" icon={<GlobalOutlined />}>
        <Table
          columns={columns}
          dataSource={streams}
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </DashboardCard>
    </DashboardBoilerplate>
  );
};

export default DataStreamsDashboard;
