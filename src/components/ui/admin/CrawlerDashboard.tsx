import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  DatabaseOutlined,
  LinkOutlined,
  RobotOutlined,
  SyncOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import {
  Button,
  Col,
  message,
  Progress,
  Row,
  Space,
  Statistic,
  Table,
  Tabs,
  Tag,
  Tooltip,
} from 'antd';
import React, { useEffect, useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts';
import { Card as DSCard } from '../../../utils/AdvancedReusableComponents';

const { TabPane } = Tabs;

interface CrawlerStats {
  total_urls_crawled: number;
  total_space_saved: number;
  total_tokens_earned: number;
  avg_space_per_url: number;
  active_workers: number;
  statusBreakdown: Array<{ status: string; count: number }>;
}

interface Optimization {
  id: number;
  url: string;
  space_saved_bytes: number;
  tokens_earned: number;
  optimization_types: string[];
  crawl_timestamp: string;
  worker_id: string;
}

interface ActiveCrawler {
  crawler_id: string;
  specialization: string;
  status: string;
  current_url: string;
  pages_per_second: number;
  efficiency_percent: number;
  total_pages_processed: number;
  total_space_harvested: number;
}

export const CrawlerDashboard: React.FC = () => {
  const [stats, setStats] = useState<CrawlerStats | null>(null);
  const [optimizations, setOptimizations] = useState<Optimization[]>([]);
  const [activeCrawlers, setActiveCrawlers] = useState<ActiveCrawler[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);

  const fetchCrawlerData = async () => {
    try {
      setLoading(true);

      // Fetch stats
      const statsRes = await fetch('/api/crawler/stats');
      const statsData = await statsRes.json();
      setStats(statsData);

      // Fetch recent optimizations
      const optsRes = await fetch('/api/crawler/optimizations?limit=50');
      const optsData = await optsRes.json();
      setOptimizations(optsData);

      // Fetch active crawlers
      const crawlersRes = await fetch('/api/crawler/active');
      const crawlersData = await crawlersRes.json();
      setActiveCrawlers(crawlersData);
    } catch (error) {
      console.error('Failed to fetch crawler data:', error);
      message.error('Failed to load crawler data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCrawlerData();

    // Set up auto-refresh every 5 seconds
    const interval = setInterval(fetchCrawlerData, 5000);
    setRefreshInterval(interval);

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, []);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const getStatusTag = (status: string) => {
    const statusColors: Record<string, string> = {
      completed: 'success',
      pending: 'warning',
      processing: 'processing',
      error: 'error',
      active: 'success',
      idle: 'default',
    };

    return <Tag color={statusColors[status] || 'default'}>{status.toUpperCase()}</Tag>;
  };

  const optimizationsColumns = [
    {
      title: 'URL',
      dataIndex: 'url',
      key: 'url',
      width: '30%',
      ellipsis: true,
      render: (url: string) => (
        <Tooltip title={url}>
          <a href={url} target='_blank' rel='noopener noreferrer'>
            {url}
          </a>
        </Tooltip>
      ),
    },
    {
      title: 'Space Saved',
      dataIndex: 'space_saved_bytes',
      key: 'space_saved',
      render: (bytes: number) => formatBytes(bytes),
      sorter: (a: Optimization, b: Optimization) => a.space_saved_bytes - b.space_saved_bytes,
    },
    {
      title: 'Tokens Earned',
      dataIndex: 'tokens_earned',
      key: 'tokens',
      render: (tokens: number) => `${tokens.toFixed(2)} LDOM`,
    },
    {
      title: 'Optimizations',
      dataIndex: 'optimization_types',
      key: 'optimization_types',
      render: (types: string[]) => (
        <>
          {types.map(type => (
            <Tag key={type} color='blue'>
              {type}
            </Tag>
          ))}
        </>
      ),
    },
    {
      title: 'Time',
      dataIndex: 'crawl_timestamp',
      key: 'timestamp',
      render: (timestamp: string) => new Date(timestamp).toLocaleString(),
    },
    {
      title: 'Worker',
      dataIndex: 'worker_id',
      key: 'worker',
      render: (id: string) => <Tag>{id || 'N/A'}</Tag>,
    },
  ];

  const crawlersColumns = [
    {
      title: 'Crawler ID',
      dataIndex: 'crawler_id',
      key: 'id',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getStatusTag(status),
    },
    {
      title: 'Current URL',
      dataIndex: 'current_url',
      key: 'url',
      ellipsis: true,
      render: (url: string) => url || <span style={{ color: '#999' }}>Idle</span>,
    },
    {
      title: 'Speed',
      dataIndex: 'pages_per_second',
      key: 'speed',
      render: (speed: number) => `${speed.toFixed(2)} pages/s`,
    },
    {
      title: 'Efficiency',
      dataIndex: 'efficiency_percent',
      key: 'efficiency',
      render: (efficiency: number) => (
        <Progress
          percent={efficiency}
          size='small'
          status={efficiency > 80 ? 'success' : 'normal'}
        />
      ),
    },
    {
      title: 'Pages Processed',
      dataIndex: 'total_pages_processed',
      key: 'pages',
    },
    {
      title: 'Space Harvested',
      dataIndex: 'total_space_harvested',
      key: 'space',
      render: (bytes: number) => formatBytes(bytes),
    },
  ];

  // Prepare chart data from recent optimizations
  const chartData = optimizations
    .slice(0, 20)
    .reverse()
    .map((opt, index) => ({
      index: index + 1,
      spaceSaved: opt.space_saved_bytes / 1024, // KB
      tokensEarned: opt.tokens_earned,
    }));

  return (
    <div className='crawler-dashboard'>
      <div style={{ marginBottom: 24 }}>
        <Space>
          <Button
            type='primary'
            icon={<SyncOutlined />}
            onClick={fetchCrawlerData}
            loading={loading}
          >
            Refresh
          </Button>
        </Space>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <DSCard.Root variant='outlined'>
            <DSCard.Body>
              <Statistic
                title='URLs Crawled (24h)'
                value={stats?.total_urls_crawled || 0}
                prefix={<RobotOutlined />}
                valueStyle={{ color: '#3f8600' }}
              />
            </DSCard.Body>
          </DSCard.Root>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <DSCard.Root variant='outlined'>
            <DSCard.Body>
              <Statistic
                title='Total Space Saved'
                value={formatBytes(stats?.total_space_saved || 0)}
                prefix={<DatabaseOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </DSCard.Body>
          </DSCard.Root>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <DSCard.Root variant='outlined'>
            <DSCard.Body>
              <Statistic
                title='Tokens Earned'
                value={(stats?.total_tokens_earned || 0).toFixed(2)}
                suffix='LDOM'
                prefix={<ThunderboltOutlined />}
                valueStyle={{ color: '#faad14' }}
              />
            </DSCard.Body>
          </DSCard.Root>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <DSCard.Root variant='outlined'>
            <DSCard.Body>
              <Statistic
                title='Active Crawlers'
                value={
                  activeCrawlers.filter(c => c.status === 'active' || c.status === 'processing')
                    .length
                }
                suffix={`/ ${activeCrawlers.length}`}
                prefix={<LinkOutlined />}
                valueStyle={{ color: '#722ed1' }}
              />
            </DSCard.Body>
          </DSCard.Root>
        </Col>
      </Row>

      {/* Status Breakdown */}
      {stats?.statusBreakdown && stats.statusBreakdown.length > 0 && (
        <DSCard.Root className='mb-6'>
          <DSCard.Header title='Crawl Status Breakdown' />
          <DSCard.Body>
            <Row gutter={16}>
              {stats.statusBreakdown.map(({ status, count }) => (
                <Col key={status} xs={12} sm={8} md={6}>
                  <Statistic
                    title={status.charAt(0).toUpperCase() + status.slice(1)}
                    value={count}
                    prefix={
                      status === 'completed' ? (
                        <CheckCircleOutlined style={{ color: '#52c41a' }} />
                      ) : status === 'error' ? (
                        <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
                      ) : status === 'processing' ? (
                        <SyncOutlined spin style={{ color: '#1890ff' }} />
                      ) : (
                        <ClockCircleOutlined style={{ color: '#faad14' }} />
                      )
                    }
                  />
                </Col>
              ))}
            </Row>
          </DSCard.Body>
        </DSCard.Root>
      )}

      {/* Charts */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <DSCard.Root className='mb-0'>
            <DSCard.Header title='Space Saved Trend' />
            <DSCard.Body>
              <ResponsiveContainer width='100%' height={300}>
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis
                    dataKey='index'
                    label={{ value: 'Recent Crawls', position: 'insideBottom', offset: -5 }}
                  />
                  <YAxis label={{ value: 'KB Saved', angle: -90, position: 'insideLeft' }} />
                  <RechartsTooltip />
                  <Legend />
                  <Area
                    type='monotone'
                    dataKey='spaceSaved'
                    stroke='#1890ff'
                    fill='#1890ff'
                    fillOpacity={0.6}
                    name='Space Saved (KB)'
                  />
                </AreaChart>
              </ResponsiveContainer>
            </DSCard.Body>
          </DSCard.Root>
        </Col>
        <Col xs={24} lg={12}>
          <DSCard.Root>
            <DSCard.Header title='Tokens Earned Trend' />
            <DSCard.Body>
              <ResponsiveContainer width='100%' height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis
                    dataKey='index'
                    label={{ value: 'Recent Crawls', position: 'insideBottom', offset: -5 }}
                  />
                  <YAxis label={{ value: 'LDOM Tokens', angle: -90, position: 'insideLeft' }} />
                  <RechartsTooltip />
                  <Legend />
                  <Line
                    type='monotone'
                    dataKey='tokensEarned'
                    stroke='#faad14'
                    strokeWidth={2}
                    name='Tokens Earned'
                  />
                </LineChart>
              </ResponsiveContainer>
            </DSCard.Body>
          </DSCard.Root>
        </Col>
      </Row>

      {/* Tabs for detailed views */}
      <DSCard.Root>
        <DSCard.Body>
          <Tabs defaultActiveKey='optimizations'>
            <TabPane tab='Recent Optimizations' key='optimizations'>
              <Table
                columns={optimizationsColumns}
                dataSource={optimizations}
                rowKey='id'
                loading={loading}
                pagination={{ pageSize: 10 }}
                scroll={{ x: 1200 }}
              />
            </TabPane>
            <TabPane tab='Active Crawlers' key='crawlers'>
              <Table
                columns={crawlersColumns}
                dataSource={activeCrawlers}
                rowKey='crawler_id'
                loading={loading}
                pagination={false}
              />
            </TabPane>
          </Tabs>
        </DSCard.Body>
      </DSCard.Root>
    </div>
  );
};

export default CrawlerDashboard;
