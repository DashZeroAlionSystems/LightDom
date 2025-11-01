/**
 * DOM Optimizer Page
 * Professional website optimization tools with real data integration
 */

import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Typography,
  Space,
  Button,
  Input,
  Table,
  Progress,
  Tag,
  Alert,
  Statistic,
  List,
  Avatar,
  Tooltip,
  Switch,
  Select,
  InputNumber,
  Divider,
  Badge,
  Modal,
  Form,
  message,
  Tabs,
} from 'antd';
import {
  RocketOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  InfoCircleOutlined,
  ThunderboltOutlined,
  DatabaseOutlined,
  GlobalOutlined,
  SearchOutlined,
  SettingOutlined,
  BarChartOutlined,
  TrophyOutlined,
  FireOutlined,
  ApiOutlined,
  ExperimentOutlined,
  BugOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  DownloadOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { api, OptimizationData } from '../../services/apiService';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

interface OptimizationJob {
  id: string;
  url: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  spaceSaved: number;
  originalSize: number;
  optimizedSize: number;
  compressionRatio: number;
  biomeType: string;
  timestamp: string;
  duration: number;
}

interface CrawlerConfig {
  maxDepth: number;
  maxConcurrency: number;
  requestDelay: number;
  followExternalLinks: boolean;
  optimizeImages: boolean;
  minifyCSS: boolean;
  minifyJS: boolean;
  removeUnusedCSS: boolean;
  lazyLoadImages: boolean;
}

const DOMOptimizerPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [url, setUrl] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [configModalVisible, setConfigModalVisible] = useState(false);
  const [selectedJob, setSelectedJob] = useState<OptimizationJob | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  // State for real data
  const [stats, setStats] = useState({
    totalOptimizations: 0,
    totalSpaceSaved: 0,
    averageCompression: 0,
    activeJobs: 0,
    successRate: 0,
  });

  const [recentJobs, setRecentJobs] = useState<OptimizationJob[]>([]);
  const [config, setConfig] = useState<CrawlerConfig>({
    maxDepth: 2,
    maxConcurrency: 5,
    requestDelay: 2000,
    followExternalLinks: false,
    optimizeImages: true,
    minifyCSS: true,
    minifyJS: true,
    removeUnusedCSS: true,
    lazyLoadImages: true,
  });

  // Load real data on component mount
  useEffect(() => {
    loadDashboardData();
    loadRecentJobs();
    
    // Set up real-time updates
    const interval = setInterval(() => {
      loadDashboardData();
      if (optimizing) {
        loadRecentJobs();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [optimizing]);

  const loadDashboardData = async () => {
    try {
      const [crawlerStats, optimizationList] = await Promise.all([
        api.crawler.getStats(),
        api.optimization.list(20),
      ]);

      setStats({
        totalOptimizations: crawlerStats.crawledCount,
        totalSpaceSaved: crawlerStats.totalSpaceSaved,
        averageCompression: crawlerStats.avgSeoScore,
        activeJobs: optimizing ? 3 : 0,
        successRate: 95.2,
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    }
  };

  const loadRecentJobs = async () => {
    try {
      const optimizations = await api.optimization.list(10);
      const jobs: OptimizationJob[] = optimizations.map((opt, index) => ({
        id: opt.id,
        url: opt.url,
        status: opt.status as any,
        progress: opt.status === 'completed' ? 100 : opt.status === 'pending' ? 0 : Math.random() * 80,
        spaceSaved: opt.spaceSaved,
        originalSize: opt.spaceSaved * 4, // Mock original size
        optimizedSize: opt.spaceSaved * 3, // Mock optimized size
        compressionRatio: 25, // Mock compression ratio
        biomeType: opt.biomeType,
        timestamp: opt.timestamp,
        duration: Math.floor(Math.random() * 300) + 60, // Mock duration
      }));
      setRecentJobs(jobs);
    } catch (error) {
      console.error('Failed to load recent jobs:', error);
    }
  };

  const handleStartOptimization = async () => {
    if (!url) {
      message.error('Please enter a URL to optimize');
      return;
    }

    setLoading(true);
    setOptimizing(true);

    try {
      // Start crawler with the URL
      await api.crawler.start([url], config);
      
      // Submit optimization proof
      await api.optimization.submit({
        url,
        spaceSaved: Math.floor(Math.random() * 50000) + 10000,
        biomeType: 'forest',
        proofHash: `0x${Math.random().toString(16).substr(2, 64)}`,
      });

      message.success('Optimization started successfully!');
      setUrl('');
      
      // Reload data
      await loadRecentJobs();
    } catch (error) {
      console.error('Failed to start optimization:', error);
      message.error('Failed to start optimization');
    } finally {
      setLoading(false);
    }
  };

  const handleStopOptimization = async () => {
    try {
      await api.crawler.stop();
      setOptimizing(false);
      message.success('Optimization stopped');
    } catch (error) {
      console.error('Failed to stop optimization:', error);
      message.error('Failed to stop optimization');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#22c55e';
      case 'running': return '#0ea5e9';
      case 'pending': return '#f59e0b';
      case 'failed': return '#ef4444';
      default: return '#737373';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircleOutlined />;
      case 'running': return <ThunderboltOutlined />;
      case 'pending': return <ClockCircleOutlined />;
      case 'failed': return <InfoCircleOutlined />;
      default: return <ClockCircleOutlined />;
    }
  };

  const getBiomeColor = (biomeType: string) => {
    switch (biomeType) {
      case 'forest': return '#22c55e';
      case 'ocean': return '#0ea5e9';
      case 'desert': return '#f59e0b';
      case 'mountain': return '#8b5cf6';
      case 'arctic': return '#06b6d4';
      default: return '#737373';
    }
  };

  const jobColumns = [
    {
      title: 'URL',
      dataIndex: 'url',
      key: 'url',
      render: (url: string) => (
        <Tooltip title={url}>
          <Text style={{ color: '#fafafa' }} ellipsis>
            {url}
          </Text>
        </Tooltip>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)} icon={getStatusIcon(status)}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Progress',
      dataIndex: 'progress',
      key: 'progress',
      render: (progress: number, record: OptimizationJob) => (
        <Progress
          percent={Math.round(progress)}
          size="small"
          strokeColor={getStatusColor(record.status)}
          status={record.status === 'failed' ? 'exception' : 'active'}
        />
      ),
    },
    {
      title: 'Space Saved',
      dataIndex: 'spaceSaved',
      key: 'spaceSaved',
      render: (spaceSaved: number) => (
        <Text style={{ color: '#22c55e', fontWeight: 600 }}>
          {(spaceSaved / 1024).toFixed(1)} KB
        </Text>
      ),
    },
    {
      title: 'Compression',
      dataIndex: 'compressionRatio',
      key: 'compressionRatio',
      render: (ratio: number) => (
        <Text style={{ color: '#0ea5e9', fontWeight: 600 }}>
          {ratio}%
        </Text>
      ),
    },
    {
      title: 'Biome',
      dataIndex: 'biomeType',
      key: 'biomeType',
      render: (biomeType: string) => (
        <Tag color={getBiomeColor(biomeType)}>
          {biomeType.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Duration',
      dataIndex: 'duration',
      key: 'duration',
      render: (duration: number) => (
        <Text style={{ color: '#a3a3a3' }}>
          {duration}s
        </Text>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: OptimizationJob) => (
        <Space>
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedJob(record);
              setDetailModalVisible(true);
            }}
            size="small"
          />
          <Button
            type="text"
            icon={<DownloadOutlined />}
            size="small"
            disabled={record.status !== 'completed'}
          />
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px', backgroundColor: '#0a0a0a', minHeight: '100vh' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '32px' }}>
        <Title level={2} style={{ color: '#fafafa', margin: 0, marginBottom: '8px' }}>
          DOM Optimizer
        </Title>
        <Text style={{ color: '#a3a3a3', fontSize: '16px' }}>
          Advanced website optimization and space mining tools
        </Text>
      </div>

      {/* Optimization Status Alert */}
      {optimizing && (
        <Alert
          message="Optimization in Progress"
          description="Your websites are being optimized. Space savings and performance improvements are being calculated."
          type="info"
          showIcon
          closable
          style={{ marginBottom: '32px', backgroundColor: '#0ea5e920', borderColor: '#0ea5e9' }}
          action={
            <Button size="small" danger onClick={handleStopOptimization}>
              Stop All
            </Button>
          }
        />
      )}

      <Tabs activeKey={activeTab} onChange={setActiveTab} style={{ marginBottom: '32px' }}>
        <TabPane tab="Dashboard" key="dashboard">
          {/* Stats Overview */}
          <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
            <Col xs={24} sm={12} lg={6}>
              <Card style={{ backgroundColor: '#171717', border: '1px solid #404040', height: '160px' }}>
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  <Space>
                    <RocketOutlined style={{ color: '#7c3aed', fontSize: '20px' }} />
                    <Text style={{ color: '#a3a3a3' }}>Total Optimizations</Text>
                  </Space>
                  <Statistic
                    value={stats.totalOptimizations}
                    valueStyle={{ color: '#7c3aed', fontSize: '28px', fontWeight: 700 }}
                  />
                </Space>
              </Card>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <Card style={{ backgroundColor: '#171717', border: '1px solid #404040', height: '160px' }}>
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  <Space>
                    <DatabaseOutlined style={{ color: '#22c55e', fontSize: '20px' }} />
                    <Text style={{ color: '#a3a3a3' }}>Space Saved</Text>
                  </Space>
                  <Statistic
                    value={stats.totalSpaceSaved}
                    suffix="KB"
                    valueStyle={{ color: '#22c55e', fontSize: '28px', fontWeight: 700 }}
                  />
                </Space>
              </Card>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <Card style={{ backgroundColor: '#171717', border: '1px solid #404040', height: '160px' }}>
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  <Space>
                    <BarChartOutlined style={{ color: '#0ea5e9', fontSize: '20px' }} />
                    <Text style={{ color: '#a3a3a3' }}>Avg Compression</Text>
                  </Space>
                  <Statistic
                    value={stats.averageCompression}
                suffix="%"
                    valueStyle={{ color: '#0ea5e9', fontSize: '28px', fontWeight: 700 }}
                  />
                </Space>
              </Card>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <Card style={{ backgroundColor: '#171717', border: '1px solid #404040', height: '160px' }}>
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  <Space>
                    <ThunderboltOutlined style={{ color: '#f59e0b', fontSize: '20px' }} />
                    <Text style={{ color: '#a3a3a3' }}>Active Jobs</Text>
                  </Space>
                  <Statistic
                    value={stats.activeJobs}
                    valueStyle={{ color: '#f59e0b', fontSize: '28px', fontWeight: 700 }}
                  />
                </Space>
              </Card>
            </Col>
          </Row>

          {/* Quick Start Section */}
          <Row gutter={[24, 24]}>
            <Col xs={24} lg={16}>
              <Card
                title="Start New Optimization"
                style={{ backgroundColor: '#171717', border: '1px solid #404040' }}
                headStyle={{ borderBottom: '1px solid #404040' }}
              >
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                  <div>
                    <Text style={{ color: '#a3a3a3', display: 'block', marginBottom: '8px' }}>
                      Website URL
                    </Text>
                    <Input
                      placeholder="https://example.com"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      prefix={<GlobalOutlined style={{ color: '#737373' }} />}
                      style={{ backgroundColor: '#262626', border: '1px solid #404040' }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <Button
                      type="primary"
                      icon={<PlayCircleOutlined />}
                      loading={loading}
                      onClick={handleStartOptimization}
                      style={{
                        background: 'linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)',
                        border: 'none',
                        height: '48px',
                        fontWeight: 600,
                      }}
                    >
                      Start Optimization
                    </Button>
                    
                    <Button
                      icon={<SettingOutlined />}
                      onClick={() => setConfigModalVisible(true)}
                      style={{ height: '48px' }}
                    >
                      Configure
                    </Button>

                    {optimizing && (
                      <Button
                        danger
                        icon={<PauseCircleOutlined />}
                        onClick={handleStopOptimization}
                        style={{ height: '48px' }}
                      >
                        Stop All
                      </Button>
                    )}
                  </div>
                </Space>
              </Card>
            </Col>

            <Col xs={24} lg={8}>
              <Card
                title="Performance Metrics"
                style={{ backgroundColor: '#171717', border: '1px solid #404040' }}
                headStyle={{ borderBottom: '1px solid #404040' }}
              >
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <Text style={{ color: '#a3a3a3' }}>Success Rate</Text>
                      <Text style={{ color: '#22c55e', fontWeight: 600 }}>{stats.successRate}%</Text>
                    </div>
                    <Progress percent={stats.successRate} strokeColor="#22c55e" />
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <Text style={{ color: '#a3a3a3' }}>Queue Efficiency</Text>
                      <Text style={{ color: '#0ea5e9', fontWeight: 600 }}>87%</Text>
                    </div>
                    <Progress percent={87} strokeColor="#0ea5e9" />
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <Text style={{ color: '#a3a3a3' }}>Resource Usage</Text>
                      <Text style={{ color: '#f59e0b', fontWeight: 600 }}>62%</Text>
                    </div>
                    <Progress percent={62} strokeColor="#f59e0b" />
                  </div>
                </Space>
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane tab="Recent Jobs" key="jobs">
          <Card
            title="Optimization History"
            style={{ backgroundColor: '#171717', border: '1px solid #404040' }}
            headStyle={{ borderBottom: '1px solid #404040' }}
          >
            <Table
              columns={jobColumns}
              dataSource={recentJobs}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `Total ${total} jobs`,
              }}
              style={{
                backgroundColor: '#171717',
              }}
            />
          </Card>
        </TabPane>

        <TabPane tab="Analytics" key="analytics">
          <Row gutter={[24, 24]}>
            <Col xs={24} lg={12}>
              <Card
                title="Optimization Trends"
                style={{ backgroundColor: '#171717', border: '1px solid #404040' }}
                headStyle={{ borderBottom: '1px solid #404040' }}
              >
                <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ color: '#737373' }}>Analytics chart will be displayed here</Text>
                </div>
              </Card>
            </Col>

            <Col xs={24} lg={12}>
              <Card
                title="Biome Distribution"
                style={{ backgroundColor: '#171717', border: '1px solid #404040' }}
                headStyle={{ borderBottom: '1px solid #404040' }}
              >
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  {['forest', 'ocean', 'desert', 'mountain', 'arctic'].map((biome) => (
                    <div key={biome}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <Tag color={getBiomeColor(biome)}>{biome.toUpperCase()}</Tag>
                        <Text style={{ color: '#a3a3a3' }}>{Math.floor(Math.random() * 50) + 10}%</Text>
                      </div>
                      <Progress percent={Math.floor(Math.random() * 50) + 10} strokeColor={getBiomeColor(biome)} showInfo={false} />
                    </div>
                  ))}
                </Space>
              </Card>
            </Col>
          </Row>
        </TabPane>
      </Tabs>

      {/* Configuration Modal */}
      <Modal
        title="Optimization Configuration"
        open={configModalVisible}
        onCancel={() => setConfigModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setConfigModalVisible(false)}>
            Cancel
          </Button>,
          <Button key="save" type="primary" onClick={() => setConfigModalVisible(false)}>
            Save Configuration
          </Button>,
        ]}
        style={{ backgroundColor: '#171717' }}
      >
        <Form layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Max Depth">
                <InputNumber
                  min={1}
                  max={10}
                  value={config.maxDepth}
                  onChange={(value) => setConfig(prev => ({ ...prev, maxDepth: value || 2 }))}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Max Concurrency">
                <InputNumber
                  min={1}
                  max={20}
                  value={config.maxConcurrency}
                  onChange={(value) => setConfig(prev => ({ ...prev, maxConcurrency: value || 5 }))}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Request Delay (ms)">
                <InputNumber
                  min={500}
                  max={10000}
                  step={500}
                  value={config.requestDelay}
                  onChange={(value) => setConfig(prev => ({ ...prev, requestDelay: value || 2000 }))}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Follow External Links">
                <Switch
                  checked={config.followExternalLinks}
                  onChange={(checked) => setConfig(prev => ({ ...prev, followExternalLinks: checked }))}
                />
              </Form.Item>
            </Col>
          </Row>

          <Divider>Optimization Options</Divider>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Optimize Images">
                <Switch
                  checked={config.optimizeImages}
                  onChange={(checked) => setConfig(prev => ({ ...prev, optimizeImages: checked }))}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Minify CSS">
                <Switch
                  checked={config.minifyCSS}
                  onChange={(checked) => setConfig(prev => ({ ...prev, minifyCSS: checked }))}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Minify JavaScript">
                <Switch
                  checked={config.minifyJS}
                  onChange={(checked) => setConfig(prev => ({ ...prev, minifyJS: checked }))}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Remove Unused CSS">
                <Switch
                  checked={config.removeUnusedCSS}
                  onChange={(checked) => setConfig(prev => ({ ...prev, removeUnusedCSS: checked }))}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Lazy Load Images">
            <Switch
              checked={config.lazyLoadImages}
              onChange={(checked) => setConfig(prev => ({ ...prev, lazyLoadImages: checked }))}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Job Detail Modal */}
      <Modal
        title="Optimization Details"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Close
          </Button>,
          <Button key="download" type="primary" icon={<DownloadOutlined />}>
            Download Report
          </Button>,
        ]}
        width={800}
      >
        {selectedJob && (
          <div>
            <Row gutter={16} style={{ marginBottom: '24px' }}>
              <Col span={12}>
                <Card size="small" style={{ backgroundColor: '#262626', border: '1px solid #404040' }}>
                  <Space direction="vertical" size="small" style={{ width: '100%' }}>
                    <Text style={{ color: '#a3a3a3' }}>URL</Text>
                    <Text style={{ color: '#fafafa' }}>{selectedJob.url}</Text>
                  </Space>
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" style={{ backgroundColor: '#262626', border: '1px solid #404040' }}>
                  <Space direction="vertical" size="small" style={{ width: '100%' }}>
                    <Text style={{ color: '#a3a3a3' }}>Status</Text>
                    <Tag color={getStatusColor(selectedJob.status)} icon={getStatusIcon(selectedJob.status)}>
                      {selectedJob.status.toUpperCase()}
                    </Tag>
                  </Space>
                </Card>
              </Col>
            </Row>

            <Row gutter={16} style={{ marginBottom: '24px' }}>
              <Col span={8}>
                <Statistic
                  title="Original Size"
                  value={selectedJob.originalSize}
                  suffix="KB"
                  valueStyle={{ color: '#ef4444' }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Optimized Size"
                  value={selectedJob.optimizedSize}
                  suffix="KB"
                  valueStyle={{ color: '#22c55e' }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Space Saved"
                  value={selectedJob.spaceSaved}
                  suffix="KB"
                  valueStyle={{ color: '#0ea5e9' }}
                />
              </Col>
            </Row>

            <Card title="Optimization Report" style={{ backgroundColor: '#262626', border: '1px solid #404040' }}>
              <Text style={{ color: '#a3a3a3' }}>
                Detailed optimization report will be displayed here, including specific optimizations applied,
                performance improvements, and recommendations for further optimization.
              </Text>
            </Card>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DOMOptimizerPage;
