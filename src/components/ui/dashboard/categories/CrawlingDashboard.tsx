/**
 * Crawling Dashboard
 * Category dashboard for web scraping and data extraction
 */

import React, { useState, useEffect } from 'react';
import { Table, Tag, Progress, Space, Button, message } from 'antd';
import {
  SearchOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  CloudDownloadOutlined,
  RobotOutlined,
} from '@ant-design/icons';
import DashboardBoilerplate from '../DashboardBoilerplate';
import { DashboardCard } from '../atoms';

const CrawlingDashboard: React.FC = () => {
  const [crawlers, setCrawlers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCrawlers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/crawler/instances');
      if (response.ok) {
        const data = await response.json();
        setCrawlers(data.crawlers || []);
      }
    } catch (error) {
      console.error('Error fetching crawlers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCrawlers();
  }, []);

  const stats = [
    {
      title: 'Active Crawlers',
      value: crawlers.filter(c => c.status === 'running').length,
      icon: <SearchOutlined />,
      trend: 'up' as const,
      trendValue: '+2',
      description: 'Currently crawling',
    },
    {
      title: 'Total Crawlers',
      value: crawlers.length,
      icon: <RobotOutlined />,
      description: 'All configured',
    },
    {
      title: 'Pages Crawled',
      value: '45.3K',
      icon: <CloudDownloadOutlined />,
      trend: 'up' as const,
      trendValue: '+12K',
      description: 'This week',
    },
    {
      title: 'Success Rate',
      value: '95.7%',
      icon: <PlayCircleOutlined />,
      trend: 'up' as const,
      trendValue: '+2.3%',
      description: 'Crawl success',
    },
  ];

  const columns = [
    {
      title: 'Crawler Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <strong>{text}</strong>,
    },
    {
      title: 'Target',
      dataIndex: 'target_url',
      key: 'target_url',
      render: (url: string) => <Tag color="green">{url}</Tag>,
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
          paused: 'warning',
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
      title: 'Pages',
      dataIndex: 'pages_crawled',
      key: 'pages_crawled',
      render: (count: number) => count?.toLocaleString() || 0,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space>
          {record.status === 'running' ? (
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
      categoryId="crawling"
      categoryName="scrapers"
      categoryDisplayName="Crawling"
      categoryIcon={<SearchOutlined />}
      categoryDescription="Web scraping and data extraction management"
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Crawling' },
      ]}
      stats={stats}
      loading={loading}
      onRefresh={fetchCrawlers}
      onCreate={() => message.info('Create crawler modal would open here')}
    >
      <DashboardCard title="Web Crawlers" icon={<SearchOutlined />}>
        <Table
          columns={columns}
          dataSource={crawlers}
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </DashboardCard>
    </DashboardBoilerplate>
  );
};

export default CrawlingDashboard;
