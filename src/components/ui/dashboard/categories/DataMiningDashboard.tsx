/**
 * Data Mining Dashboard
 * Category dashboard for data mining and analytics jobs
 */

import React, { useState, useEffect } from 'react';
import { Table, Tag, Progress, Space, Button, message } from 'antd';
import {
  DatabaseOutlined,
  PlayCircleOutlined,
  StopOutlined,
  BarChartOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import DashboardBoilerplate from '../DashboardBoilerplate';
import { DashboardCard } from '../atoms';

const DataMiningDashboard: React.FC = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/data-mining/jobs');
      if (response.ok) {
        const data = await response.json();
        setJobs(data.jobs || []);
      }
    } catch (error) {
      console.error('Error fetching data mining jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const stats = [
    {
      title: 'Active Jobs',
      value: jobs.filter(j => j.status === 'running').length,
      icon: <DatabaseOutlined />,
      trend: 'up' as const,
      trendValue: '+4',
      description: 'Currently processing',
    },
    {
      title: 'Total Jobs',
      value: jobs.length,
      icon: <BarChartOutlined />,
      description: 'All configured',
    },
    {
      title: 'Records Mined',
      value: '2.4M',
      icon: <ThunderboltOutlined />,
      trend: 'up' as const,
      trendValue: '+320K',
      description: 'This month',
    },
    {
      title: 'Success Rate',
      value: '97.3%',
      icon: <PlayCircleOutlined />,
      trend: 'up' as const,
      trendValue: '+1.5%',
      description: 'Job completion',
    },
  ];

  const columns = [
    {
      title: 'Job Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <strong>{text}</strong>,
    },
    {
      title: 'Type',
      dataIndex: 'job_type',
      key: 'job_type',
      render: (type: string) => <Tag color="purple">{type}</Tag>,
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
      render: (progress: number) => (
        <Progress percent={progress || 0} size="small" />
      ),
    },
    {
      title: 'Records',
      dataIndex: 'records_processed',
      key: 'records_processed',
      render: (count: number) => count?.toLocaleString() || 0,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space>
          {record.status === 'running' ? (
            <Button size="small" icon={<StopOutlined />} danger>Stop</Button>
          ) : (
            <Button size="small" icon={<PlayCircleOutlined />}>Start</Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <DashboardBoilerplate
      categoryId="data-mining"
      categoryName="data_mining_jobs"
      categoryDisplayName="Data Mining"
      categoryIcon={<DatabaseOutlined />}
      categoryDescription="Data mining and analytics job management"
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Data Mining' },
      ]}
      stats={stats}
      loading={loading}
      onRefresh={fetchJobs}
      onCreate={() => message.info('Create data mining job modal would open here')}
    >
      <DashboardCard title="Data Mining Jobs" icon={<DatabaseOutlined />}>
        <Table
          columns={columns}
          dataSource={jobs}
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </DashboardCard>
    </DashboardBoilerplate>
  );
};

export default DataMiningDashboard;
