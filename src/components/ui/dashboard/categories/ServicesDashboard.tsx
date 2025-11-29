/**
 * Services Dashboard
 * Category dashboard for microservices and API services
 */

import React, { useState, useEffect } from 'react';
import { Table, Tag, Badge, Space, Button, message } from 'antd';
import {
  ApiOutlined,
  PlayCircleOutlined,
  StopOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import DashboardBoilerplate from '../DashboardBoilerplate';
import { DashboardCard } from '../atoms';

const ServicesDashboard: React.FC = () => {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/services');
      if (response.ok) {
        const data = await response.json();
        setServices(data.services || []);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const stats = [
    {
      title: 'Running Services',
      value: services.filter(s => s.status === 'running').length,
      icon: <ApiOutlined />,
      trend: 'neutral' as const,
      description: 'Currently active',
    },
    {
      title: 'Total Services',
      value: services.length,
      icon: <ApiOutlined />,
      description: 'All configured',
    },
    {
      title: 'Uptime',
      value: '99.9%',
      icon: <CheckCircleOutlined />,
      trend: 'up' as const,
      trendValue: '+0.1%',
      description: 'Overall uptime',
    },
    {
      title: 'Requests/min',
      value: '4.2K',
      icon: <PlayCircleOutlined />,
      trend: 'up' as const,
      trendValue: '+18%',
      description: 'Traffic rate',
    },
  ];

  const columns = [
    {
      title: 'Service Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: any) => (
        <Space>
          <Badge 
            status={record.status === 'running' ? 'processing' : 'default'} 
          />
          <strong>{text}</strong>
        </Space>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'service_type',
      key: 'service_type',
      render: (type: string) => <Tag color="magenta">{type}</Tag>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const colors: Record<string, string> = {
          running: 'success',
          stopped: 'default',
          error: 'error',
          starting: 'processing',
        };
        return <Tag color={colors[status] || 'default'}>{status}</Tag>;
      },
    },
    {
      title: 'Port',
      dataIndex: 'port',
      key: 'port',
      render: (port: number) => <code>{port}</code>,
    },
    {
      title: 'Health',
      dataIndex: 'health',
      key: 'health',
      render: (health: string) => (
        health === 'healthy' ? 
          <CheckCircleOutlined style={{ color: '#52c41a' }} /> : 
          <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
      ),
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
          <Button size="small" icon={<ReloadOutlined />}>Restart</Button>
        </Space>
      ),
    },
  ];

  return (
    <DashboardBoilerplate
      categoryId="services"
      categoryName="services"
      categoryDisplayName="Services"
      categoryIcon={<ApiOutlined />}
      categoryDescription="Microservices and API service management"
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Services' },
      ]}
      stats={stats}
      loading={loading}
      onRefresh={fetchServices}
      onCreate={() => message.info('Create service modal would open here')}
    >
      <DashboardCard title="Service Instances" icon={<ApiOutlined />}>
        <Table
          columns={columns}
          dataSource={services}
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </DashboardCard>
    </DashboardBoilerplate>
  );
};

export default ServicesDashboard;
