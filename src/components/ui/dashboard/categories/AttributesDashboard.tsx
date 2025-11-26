/**
 * Attributes Dashboard
 * Category dashboard for SEO and data attributes management
 */

import React, { useState, useEffect } from 'react';
import { Table, Tag, Space, Button, message } from 'antd';
import {
  TagsOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import DashboardBoilerplate from '../DashboardBoilerplate';
import { DashboardCard } from '../atoms';

const AttributesDashboard: React.FC = () => {
  const [attributes, setAttributes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAttributes = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/attributes');
      if (response.ok) {
        const data = await response.json();
        setAttributes(data.attributes || []);
      }
    } catch (error) {
      console.error('Error fetching attributes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttributes();
  }, []);

  const stats = [
    {
      title: 'Total Attributes',
      value: attributes.length,
      icon: <TagsOutlined />,
      description: 'All configured',
    },
    {
      title: 'Active',
      value: attributes.filter(a => a.status === 'active').length,
      icon: <CheckCircleOutlined />,
      trend: 'up' as const,
      trendValue: '+8',
      description: 'In use',
    },
    {
      title: 'SEO Attributes',
      value: attributes.filter(a => a.type === 'seo').length,
      icon: <TagsOutlined />,
      description: 'SEO related',
    },
    {
      title: 'Custom Attributes',
      value: attributes.filter(a => a.type === 'custom').length,
      icon: <TagsOutlined />,
      description: 'User defined',
    },
  ];

  const columns = [
    {
      title: 'Attribute Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <strong>{text}</strong>,
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => <Tag color="orange">{type}</Tag>,
    },
    {
      title: 'Data Type',
      dataIndex: 'data_type',
      key: 'data_type',
      render: (dataType: string) => <Tag>{dataType}</Tag>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const colors: Record<string, string> = {
          active: 'success',
          inactive: 'default',
          deprecated: 'warning',
        };
        return <Tag color={colors[status] || 'default'}>{status}</Tag>;
      },
    },
    {
      title: 'Usage Count',
      dataIndex: 'usage_count',
      key: 'usage_count',
      render: (count: number) => count?.toLocaleString() || 0,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space>
          <Button size="small" icon={<EditOutlined />}>Edit</Button>
          <Button size="small" icon={<DeleteOutlined />} danger>Delete</Button>
        </Space>
      ),
    },
  ];

  return (
    <DashboardBoilerplate
      categoryId="attributes"
      categoryName="attributes"
      categoryDisplayName="Attributes"
      categoryIcon={<TagsOutlined />}
      categoryDescription="SEO and data attributes management"
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Attributes' },
      ]}
      stats={stats}
      loading={loading}
      onRefresh={fetchAttributes}
      onCreate={() => message.info('Create attribute modal would open here')}
    >
      <DashboardCard title="Attribute Configuration" icon={<TagsOutlined />}>
        <Table
          columns={columns}
          dataSource={attributes}
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </DashboardCard>
    </DashboardBoilerplate>
  );
};

export default AttributesDashboard;
