/**
 * Seeding Dashboard
 * Category dashboard for database and content seeders
 */

import React, { useState, useEffect } from 'react';
import { Table, Tag, Progress, Space, Button, message } from 'antd';
import {
  DeploymentUnitOutlined,
  PlayCircleOutlined,
  ReloadOutlined,
  CloudUploadOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import DashboardBoilerplate from '../DashboardBoilerplate';
import { DashboardCard } from '../atoms';

const SeedingDashboard: React.FC = () => {
  const [seeders, setSeeders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSeeders = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/seeders');
      if (response.ok) {
        const data = await response.json();
        setSeeders(data.seeders || []);
      }
    } catch (error) {
      console.error('Error fetching seeders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSeeders();
  }, []);

  const stats = [
    {
      title: 'Active Seeders',
      value: seeders.filter(s => s.status === 'running').length,
      icon: <DeploymentUnitOutlined />,
      trend: 'neutral' as const,
      description: 'Currently seeding',
    },
    {
      title: 'Total Seeders',
      value: seeders.length,
      icon: <CloudUploadOutlined />,
      description: 'All configured',
    },
    {
      title: 'Records Seeded',
      value: '128K',
      icon: <CheckCircleOutlined />,
      trend: 'up' as const,
      trendValue: '+28K',
      description: 'This month',
    },
    {
      title: 'Success Rate',
      value: '98.9%',
      icon: <PlayCircleOutlined />,
      trend: 'up' as const,
      trendValue: '+0.4%',
      description: 'Seed success',
    },
  ];

  const columns = [
    {
      title: 'Seeder Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <strong>{text}</strong>,
    },
    {
      title: 'Type',
      dataIndex: 'seeder_type',
      key: 'seeder_type',
      render: (type: string) => <Tag color="geekblue">{type}</Tag>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const colors: Record<string, string> = {
          running: 'processing',
          completed: 'success',
          error: 'error',
          pending: 'warning',
        };
        return <Tag color={colors[status] || 'default'}>{status}</Tag>;
      },
    },
    {
      title: 'Progress',
      dataIndex: 'progress',
      key: 'progress',
      render: (progress: number) => (
        <Progress percent={progress || 0} size="small" />
      ),
    },
    {
      title: 'Records',
      dataIndex: 'records_seeded',
      key: 'records_seeded',
      render: (count: number) => count?.toLocaleString() || 0,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space>
          <Button size="small" icon={<PlayCircleOutlined />}>Run</Button>
          <Button size="small" icon={<ReloadOutlined />}>Re-seed</Button>
        </Space>
      ),
    },
  ];

  return (
    <DashboardBoilerplate
      categoryId="seeding"
      categoryName="seeders"
      categoryDisplayName="Seeding"
      categoryIcon={<DeploymentUnitOutlined />}
      categoryDescription="Database and content seeder management"
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Seeding' },
      ]}
      stats={stats}
      loading={loading}
      onRefresh={fetchSeeders}
      onCreate={() => message.info('Create seeder modal would open here')}
    >
      <DashboardCard title="Data Seeders" icon={<DeploymentUnitOutlined />}>
        <Table
          columns={columns}
          dataSource={seeders}
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </DashboardCard>
    </DashboardBoilerplate>
  );
};

export default SeedingDashboard;
