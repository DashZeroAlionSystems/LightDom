import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Typography,
  Select,
  DatePicker,
  Table,
  Space,
  Tag,
  Spin
} from 'antd';
import {
  LineChartOutlined,
  BarChartOutlined,
  RiseOutlined,
  FallOutlined,
  EyeOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

interface AnalyticsData {
  totalOptimizations: number;
  totalSpaceSaved: number;
  averageLoadTime: number;
  totalPageViews: number;
  trend: {
    optimizations: number;
    spaceSaved: number;
    loadTime: number;
    pageViews: number;
  };
}

interface OptimizationRecord {
  key: string;
  date: string;
  website: string;
  spaceSaved: number;
  loadTimeImprovement: number;
  status: 'success' | 'pending' | 'failed';
}

const AnalyticsDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [optimizationRecords, setOptimizationRecords] = useState<OptimizationRecord[]>([]);

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data
      setAnalyticsData({
        totalOptimizations: 1247,
        totalSpaceSaved: 2.5 * 1024 * 1024 * 1024, // 2.5 GB in bytes
        averageLoadTime: 1.8,
        totalPageViews: 45280,
        trend: {
          optimizations: 12.5,
          spaceSaved: 8.3,
          loadTime: -15.2,
          pageViews: 23.4
        }
      });

      setOptimizationRecords([
        {
          key: '1',
          date: '2025-10-22',
          website: 'example.com',
          spaceSaved: 125000,
          loadTimeImprovement: 32,
          status: 'success'
        },
        {
          key: '2',
          date: '2025-10-21',
          website: 'mysite.com',
          spaceSaved: 98000,
          loadTimeImprovement: 28,
          status: 'success'
        },
        {
          key: '3',
          date: '2025-10-21',
          website: 'blog.example.com',
          spaceSaved: 156000,
          loadTimeImprovement: 45,
          status: 'success'
        },
        {
          key: '4',
          date: '2025-10-20',
          website: 'store.mysite.com',
          spaceSaved: 89000,
          loadTimeImprovement: 19,
          status: 'pending'
        }
      ]);
    } catch (error) {
      console.error('Failed to fetch analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnsType<OptimizationRecord> = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      sorter: (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    },
    {
      title: 'Website',
      dataIndex: 'website',
      key: 'website'
    },
    {
      title: 'Space Saved',
      dataIndex: 'spaceSaved',
      key: 'spaceSaved',
      render: (bytes: number) => `${(bytes / 1024).toFixed(2)} KB`,
      sorter: (a, b) => a.spaceSaved - b.spaceSaved
    },
    {
      title: 'Load Time Improvement',
      dataIndex: 'loadTimeImprovement',
      key: 'loadTimeImprovement',
      render: (percent: number) => (
        <Text type="success">
          <RiseOutlined /> {percent}%
        </Text>
      ),
      sorter: (a, b) => a.loadTimeImprovement - b.loadTimeImprovement
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const color = status === 'success' ? 'success' : status === 'pending' ? 'processing' : 'error';
        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      }
    }
  ];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 0' }}>
        <Spin size="large" />
        <div style={{ marginTop: '1rem' }}>
          <Text type="secondary">Loading analytics data...</Text>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={2}>Analytics Dashboard</Title>
        <Space>
          <Select
            value={timeRange}
            onChange={setTimeRange}
            style={{ width: 120 }}
            options={[
              { value: '7d', label: 'Last 7 days' },
              { value: '30d', label: 'Last 30 days' },
              { value: '90d', label: 'Last 90 days' },
              { value: 'custom', label: 'Custom' }
            ]}
          />
          {timeRange === 'custom' && (
            <RangePicker />
          )}
        </Space>
      </div>

      {analyticsData && (
        <>
          <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Total Optimizations"
                  value={analyticsData.totalOptimizations}
                  prefix={<LineChartOutlined />}
                  suffix={
                    <span style={{ fontSize: '14px', color: '#52c41a' }}>
                      <RiseOutlined /> {analyticsData.trend.optimizations}%
                    </span>
                  }
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Total Space Saved"
                  value={(analyticsData.totalSpaceSaved / (1024 * 1024 * 1024)).toFixed(2)}
                  suffix="GB"
                  prefix={<BarChartOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
                <div style={{ marginTop: '8px' }}>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    <RiseOutlined /> {analyticsData.trend.spaceSaved}% increase
                  </Text>
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Avg Load Time"
                  value={analyticsData.averageLoadTime}
                  suffix="s"
                  prefix={<ClockCircleOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
                <div style={{ marginTop: '8px' }}>
                  <Text type="success" style={{ fontSize: '12px' }}>
                    <FallOutlined /> {Math.abs(analyticsData.trend.loadTime)}% faster
                  </Text>
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Total Page Views"
                  value={analyticsData.totalPageViews}
                  prefix={<EyeOutlined />}
                />
                <div style={{ marginTop: '8px' }}>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    <RiseOutlined /> {analyticsData.trend.pageViews}% increase
                  </Text>
                </div>
              </Card>
            </Col>
          </Row>

          <Card title="Recent Optimizations" style={{ marginBottom: '24px' }}>
            <Table
              columns={columns}
              dataSource={optimizationRecords}
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </>
      )}
    </div>
  );
};

export default AnalyticsDashboard;
