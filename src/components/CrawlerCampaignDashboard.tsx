/**
 * Crawler Campaign Management Dashboard
 * 
 * Comprehensive UI for managing crawler campaigns with DeepSeek AI integration
 * 
 * Features:
 * - Create campaigns from natural language prompts
 * - Manage multiple crawler instances per campaign
 * - Monitor real-time analytics
 * - Schedule automated workflows
 * - Configure load balancing and payload distribution
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Row,
  Col,
  Button,
  Input,
  Select,
  Table,
  Tag,
  Statistic,
  Progress,
  Modal,
  Form,
  Space,
  Tabs,
  Typography,
  Divider,
  Alert,
  Badge,
  Timeline,
  Tooltip,
  Switch,
  InputNumber,
  message,
  Spin
} from 'antd';
import {
  PlayCircleOutlined,
  PauseCircleOutlined,
  StopOutlined,
  PlusOutlined,
  ReloadOutlined,
  ThunderboltOutlined,
  RobotOutlined,
  BarChartOutlined,
  ScheduleOutlined,
  SettingOutlined,
  GlobalOutlined,
  DatabaseOutlined,
  LinkOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  RocketOutlined
} from '@ant-design/icons';
import axios from 'axios';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { TabPane } = Tabs;
const { Option } = Select;

interface Campaign {
  id: string;
  name: string;
  description: string;
  clientSiteUrl: string;
  status: 'created' | 'running' | 'paused' | 'stopped';
  seeds: any[];
  configuration: {
    parallelCrawlers: number;
    payloadSize: number;
    loadBalancing: string;
  };
  analytics: {
    totalPages: number;
    pagesProcessed: number;
    errorCount: number;
    successRate: number;
  };
  createdAt: string;
}

const CrawlerCampaignDashboard: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [serviceStats, setServiceStats] = useState<any>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  
  const [form] = Form.useForm();

  // Fetch campaigns
  const fetchCampaigns = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/campaigns');
      if (response.data.success) {
        setCampaigns(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      message.error('Failed to fetch campaigns');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch service stats
  const fetchServiceStats = useCallback(async () => {
    try {
      const response = await axios.get('/api/campaigns/stats/service');
      if (response.data.success) {
        setServiceStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching service stats:', error);
    }
  }, []);

  // Auto-refresh
  useEffect(() => {
    fetchCampaigns();
    fetchServiceStats();
    
    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchCampaigns();
        fetchServiceStats();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, fetchCampaigns, fetchServiceStats]);

  // Create campaign from prompt
  const handleCreateCampaign = async (values: any) => {
    try {
      setCreating(true);
      const response = await axios.post('/api/campaigns/create-from-prompt', {
        prompt: values.prompt,
        clientSiteUrl: values.clientSiteUrl,
        options: {
          payloadSize: values.payloadSize,
          loadBalancing: values.loadBalancing
        }
      });

      if (response.data.success) {
        message.success('Campaign created successfully!');
        setShowCreateModal(false);
        form.resetFields();
        fetchCampaigns();
      }
    } catch (error: any) {
      console.error('Error creating campaign:', error);
      message.error(error.response?.data?.error || 'Failed to create campaign');
    } finally {
      setCreating(false);
    }
  };

  // Start campaign
  const handleStartCampaign = async (campaignId: string) => {
    try {
      const response = await axios.post(`/api/campaigns/${campaignId}/start`);
      if (response.data.success) {
        message.success('Campaign started!');
        fetchCampaigns();
      }
    } catch (error: any) {
      message.error(error.response?.data?.error || 'Failed to start campaign');
    }
  };

  // Pause campaign
  const handlePauseCampaign = async (campaignId: string) => {
    try {
      const response = await axios.post(`/api/campaigns/${campaignId}/pause`);
      if (response.data.success) {
        message.success('Campaign paused!');
        fetchCampaigns();
      }
    } catch (error: any) {
      message.error(error.response?.data?.error || 'Failed to pause campaign');
    }
  };

  // Resume campaign
  const handleResumeCampaign = async (campaignId: string) => {
    try {
      const response = await axios.post(`/api/campaigns/${campaignId}/resume`);
      if (response.data.success) {
        message.success('Campaign resumed!');
        fetchCampaigns();
      }
    } catch (error: any) {
      message.error(error.response?.data?.error || 'Failed to resume campaign');
    }
  };

  // Stop campaign
  const handleStopCampaign = async (campaignId: string) => {
    try {
      const response = await axios.post(`/api/campaigns/${campaignId}/stop`);
      if (response.data.success) {
        message.success('Campaign stopped!');
        fetchCampaigns();
      }
    } catch (error: any) {
      message.error(error.response?.data?.error || 'Failed to stop campaign');
    }
  };

  // Get status tag color
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      created: 'blue',
      running: 'green',
      paused: 'orange',
      stopped: 'red'
    };
    return colors[status] || 'default';
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    const icons: Record<string, React.ReactNode> = {
      created: <ClockCircleOutlined />,
      running: <PlayCircleOutlined />,
      paused: <PauseCircleOutlined />,
      stopped: <StopOutlined />
    };
    return icons[status] || <ClockCircleOutlined />;
  };

  // Campaign table columns
  const campaignColumns = [
    {
      title: 'Campaign',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: Campaign) => (
        <Space direction="vertical" size={0}>
          <Text strong>{name}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.clientSiteUrl}
          </Text>
        </Space>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag icon={getStatusIcon(status)} color={getStatusColor(status)}>
          {status.toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Progress',
      key: 'progress',
      render: (_: any, record: Campaign) => {
        const progress = record.analytics.totalPages > 0
          ? Math.round((record.analytics.pagesProcessed / record.analytics.totalPages) * 100)
          : 0;
        return (
          <Space direction="vertical" size={0} style={{ width: '100%' }}>
            <Progress percent={progress} size="small" />
            <Text type="secondary" style={{ fontSize: 11 }}>
              {record.analytics.pagesProcessed} / {record.analytics.totalPages} pages
            </Text>
          </Space>
        );
      }
    },
    {
      title: 'Crawlers',
      dataIndex: ['configuration', 'parallelCrawlers'],
      key: 'crawlers',
      render: (count: number) => (
        <Badge count={count} showZero style={{ backgroundColor: '#52c41a' }} />
      )
    },
    {
      title: 'Success Rate',
      key: 'successRate',
      render: (_: any, record: Campaign) => (
        <Statistic
          value={record.analytics.successRate}
          suffix="%"
          valueStyle={{ fontSize: 14 }}
        />
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Campaign) => (
        <Space>
          {record.status === 'created' && (
            <Button
              type="primary"
              icon={<PlayCircleOutlined />}
              size="small"
              onClick={() => handleStartCampaign(record.id)}
            >
              Start
            </Button>
          )}
          {record.status === 'running' && (
            <>
              <Button
                icon={<PauseCircleOutlined />}
                size="small"
                onClick={() => handlePauseCampaign(record.id)}
              >
                Pause
              </Button>
              <Button
                danger
                icon={<StopOutlined />}
                size="small"
                onClick={() => handleStopCampaign(record.id)}
              >
                Stop
              </Button>
            </>
          )}
          {record.status === 'paused' && (
            <>
              <Button
                type="primary"
                icon={<PlayCircleOutlined />}
                size="small"
                onClick={() => handleResumeCampaign(record.id)}
              >
                Resume
              </Button>
              <Button
                danger
                icon={<StopOutlined />}
                size="small"
                onClick={() => handleStopCampaign(record.id)}
              >
                Stop
              </Button>
            </>
          )}
          <Button
            size="small"
            onClick={() => setSelectedCampaign(record)}
          >
            Details
          </Button>
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: 24 }}>
      {/* Header */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={2}>
            <RobotOutlined /> Crawler Campaign Management
          </Title>
          <Text type="secondary">
            AI-powered crawler orchestration with DeepSeek integration
          </Text>
        </Col>
        <Col>
          <Space>
            <Switch
              checked={autoRefresh}
              onChange={setAutoRefresh}
              checkedChildren="Auto Refresh"
              unCheckedChildren="Manual"
            />
            <Button
              icon={<ReloadOutlined />}
              onClick={() => {
                fetchCampaigns();
                fetchServiceStats();
              }}
            >
              Refresh
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setShowCreateModal(true)}
            >
              Create Campaign
            </Button>
          </Space>
        </Col>
      </Row>

      {/* Service Stats */}
      {serviceStats && (
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={6}>
            <Card>
              <Statistic
                title="Total Campaigns"
                value={serviceStats.totalCampaigns}
                prefix={<DatabaseOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Active Campaigns"
                value={serviceStats.activeCampaigns}
                prefix={<PlayCircleOutlined />}
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Active Crawlers"
                value={serviceStats.activeCrawlers}
                prefix={<RobotOutlined />}
                valueStyle={{ color: '#cf1322' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="URLs Processed"
                value={serviceStats.totalUrlsProcessed}
                prefix={<GlobalOutlined />}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* Campaigns Table */}
      <Card
        title={
          <Space>
            <BarChartOutlined />
            <span>Active Campaigns</span>
          </Space>
        }
      >
        <Table
          dataSource={campaigns}
          columns={campaignColumns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* Create Campaign Modal */}
      <Modal
        title={
          <Space>
            <RocketOutlined />
            <span>Create New Campaign</span>
          </Space>
        }
        visible={showCreateModal}
        onCancel={() => setShowCreateModal(false)}
        footer={null}
        width={700}
      >
        <Alert
          message="AI-Powered Campaign Creation"
          description="Describe your crawler campaign in natural language, and our AI will generate the optimal configuration, URL seeds, and workflow."
          type="info"
          showIcon
          icon={<ThunderboltOutlined />}
          style={{ marginBottom: 16 }}
        />

        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateCampaign}
          initialValues={{
            payloadSize: 100,
            loadBalancing: 'least-busy'
          }}
        >
          <Form.Item
            label="Campaign Prompt"
            name="prompt"
            rules={[{ required: true, message: 'Please enter a campaign description' }]}
          >
            <TextArea
              rows={4}
              placeholder="Example: Create a comprehensive SEO training dataset for an e-commerce website selling outdoor gear. Crawl product pages, blog posts, and category pages to collect metadata, content, and performance metrics."
            />
          </Form.Item>

          <Form.Item
            label="Client Site URL"
            name="clientSiteUrl"
            rules={[
              { required: true, message: 'Please enter the client site URL' },
              { type: 'url', message: 'Please enter a valid URL' }
            ]}
          >
            <Input
              prefix={<GlobalOutlined />}
              placeholder="https://example.com"
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Payload Size (URLs per crawler)"
                name="payloadSize"
              >
                <InputNumber
                  min={10}
                  max={500}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Load Balancing Strategy"
                name="loadBalancing"
              >
                <Select>
                  <Option value="least-busy">Least Busy</Option>
                  <Option value="round-robin">Round Robin</Option>
                  <Option value="priority-based">Priority Based</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                loading={creating}
                icon={<ThunderboltOutlined />}
              >
                Generate Campaign
              </Button>
              <Button onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Campaign Details Modal */}
      {selectedCampaign && (
        <Modal
          title={selectedCampaign.name}
          visible={!!selectedCampaign}
          onCancel={() => setSelectedCampaign(null)}
          footer={null}
          width={900}
        >
          <Tabs defaultActiveKey="overview">
            <TabPane tab="Overview" key="overview">
              <Paragraph>{selectedCampaign.description}</Paragraph>
              <Divider />
              <Row gutter={16}>
                <Col span={12}>
                  <Statistic
                    title="Client Site"
                    value={selectedCampaign.clientSiteUrl}
                    valueStyle={{ fontSize: 14 }}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Status"
                    value={selectedCampaign.status}
                    prefix={getStatusIcon(selectedCampaign.status)}
                  />
                </Col>
              </Row>
            </TabPane>
            <TabPane tab="Configuration" key="config">
              <Row gutter={16}>
                <Col span={8}>
                  <Statistic
                    title="Parallel Crawlers"
                    value={selectedCampaign.configuration.parallelCrawlers}
                    prefix={<RobotOutlined />}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="Payload Size"
                    value={selectedCampaign.configuration.payloadSize}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="Load Balancing"
                    value={selectedCampaign.configuration.loadBalancing}
                  />
                </Col>
              </Row>
            </TabPane>
            <TabPane tab="Analytics" key="analytics">
              <Row gutter={16}>
                <Col span={8}>
                  <Statistic
                    title="Pages Processed"
                    value={selectedCampaign.analytics.pagesProcessed}
                    suffix={`/ ${selectedCampaign.analytics.totalPages}`}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="Success Rate"
                    value={selectedCampaign.analytics.successRate}
                    suffix="%"
                    valueStyle={{ color: '#3f8600' }}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="Errors"
                    value={selectedCampaign.analytics.errorCount}
                    valueStyle={{ color: '#cf1322' }}
                  />
                </Col>
              </Row>
            </TabPane>
            <TabPane tab="Seeds" key="seeds">
              <Table
                dataSource={selectedCampaign.seeds.slice(0, 50)}
                columns={[
                  {
                    title: 'URL',
                    dataIndex: 'url',
                    key: 'url',
                    render: (url: string) => (
                      <a href={url} target="_blank" rel="noopener noreferrer">
                        {url}
                      </a>
                    )
                  },
                  {
                    title: 'Category',
                    dataIndex: 'category',
                    key: 'category',
                    render: (category: string) => <Tag>{category}</Tag>
                  },
                  {
                    title: 'Priority',
                    dataIndex: 'priority',
                    key: 'priority',
                    render: (priority: number) => (
                      <Progress
                        percent={priority * 10}
                        size="small"
                        showInfo={false}
                      />
                    )
                  }
                ]}
                pagination={{ pageSize: 10 }}
                size="small"
              />
            </TabPane>
          </Tabs>
        </Modal>
      )}
    </div>
  );
};

export default CrawlerCampaignDashboard;
