/**
 * CrawleeManager Component
 * Main UI for managing Crawlee crawlers
 */

import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Table,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  Switch,
  Tabs,
  Progress,
  Statistic,
  Row,
  Col,
  message,
  Drawer,
  Descriptions,
  Badge,
  Tooltip,
  Popconfirm,
  Alert
} from 'antd';
import {
  PlusOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  StopOutlined,
  DeleteOutlined,
  EyeOutlined,
  EditOutlined,
  ReloadOutlined,
  SettingOutlined,
  ApiOutlined,
  BugOutlined,
  LineChartOutlined
} from '@ant-design/icons';
import axios from 'axios';

const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

const CrawleeManager = () => {
  const [crawlers, setCrawlers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [detailsDrawerVisible, setDetailsDrawerVisible] = useState(false);
  const [selectedCrawler, setSelectedCrawler] = useState(null);
  const [crawlerTypes, setCrawlerTypes] = useState([]);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchCrawlers();
    fetchCrawlerTypes();
  }, []);

  const fetchCrawlers = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/crawlee/crawlers');
      setCrawlers(response.data.crawlers || []);
    } catch (error) {
      message.error('Failed to fetch crawlers');
    } finally {
      setLoading(false);
    }
  };

  const fetchCrawlerTypes = async () => {
    try {
      const response = await axios.get('/api/crawlee/crawler-types');
      setCrawlerTypes(response.data.types || []);
    } catch (error) {
      console.error('Failed to fetch crawler types:', error);
    }
  };

  const handleCreateCrawler = async (values) => {
    try {
      // Parse JSON fields
      if (values.selectors) {
        try {
          values.selectors = JSON.parse(values.selectors);
        } catch (e) {
          message.error('Invalid JSON in selectors');
          return;
        }
      }

      if (values.url_patterns) {
        try {
          values.url_patterns = JSON.parse(values.url_patterns);
        } catch (e) {
          message.error('Invalid JSON in URL patterns');
          return;
        }
      }

      await axios.post('/api/crawlee/crawlers', values);
      message.success('Crawler created successfully');
      setCreateModalVisible(false);
      form.resetFields();
      fetchCrawlers();
    } catch (error) {
      message.error('Failed to create crawler: ' + error.message);
    }
  };

  const handleStartCrawler = async (crawlerId, seedUrls = []) => {
    try {
      await axios.post(`/api/crawlee/crawlers/${crawlerId}/start`, { seedUrls });
      message.success('Crawler started');
      fetchCrawlers();
    } catch (error) {
      message.error('Failed to start crawler: ' + error.message);
    }
  };

  const handlePauseCrawler = async (crawlerId) => {
    try {
      await axios.post(`/api/crawlee/crawlers/${crawlerId}/pause`);
      message.success('Crawler paused');
      fetchCrawlers();
    } catch (error) {
      message.error('Failed to pause crawler: ' + error.message);
    }
  };

  const handleResumeCrawler = async (crawlerId) => {
    try {
      await axios.post(`/api/crawlee/crawlers/${crawlerId}/resume`);
      message.success('Crawler resumed');
      fetchCrawlers();
    } catch (error) {
      message.error('Failed to resume crawler: ' + error.message);
    }
  };

  const handleStopCrawler = async (crawlerId) => {
    try {
      await axios.post(`/api/crawlee/crawlers/${crawlerId}/stop`);
      message.success('Crawler stopped');
      fetchCrawlers();
    } catch (error) {
      message.error('Failed to stop crawler: ' + error.message);
    }
  };

  const handleDeleteCrawler = async (crawlerId) => {
    try {
      await axios.delete(`/api/crawlee/crawlers/${crawlerId}`);
      message.success('Crawler deleted');
      fetchCrawlers();
    } catch (error) {
      message.error('Failed to delete crawler: ' + error.message);
    }
  };

  const showCrawlerDetails = async (crawlerId) => {
    try {
      const response = await axios.get(`/api/crawlee/crawlers/${crawlerId}`);
      setSelectedCrawler(response.data.crawler);
      setDetailsDrawerVisible(true);
    } catch (error) {
      message.error('Failed to fetch crawler details');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      idle: 'default',
      running: 'processing',
      paused: 'warning',
      completed: 'success',
      error: 'error'
    };
    return colors[status] || 'default';
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space direction="vertical" size={0}>
          <strong>{text}</strong>
          <small style={{ color: '#888' }}>{record.id}</small>
        </Space>
      )
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => <Tag color="blue">{type.toUpperCase()}</Tag>
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Badge status={status === 'running' ? 'processing' : 'default'} text={status.toUpperCase()} />
      )
    },
    {
      title: 'Progress',
      key: 'progress',
      render: (_, record) => {
        const stats = record.stats || {};
        const total = stats.requestsTotal || 0;
        const finished = stats.requestsFinished || 0;
        const percent = total > 0 ? Math.round((finished / total) * 100) : 0;
        return (
          <Space direction="vertical" size={0} style={{ width: '100%' }}>
            <Progress percent={percent} size="small" status={record.status === 'error' ? 'exception' : 'active'} />
            <small>{finished} / {total} requests</small>
          </Space>
        );
      }
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => new Date(date).toLocaleString()
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="View Details">
            <Button 
              icon={<EyeOutlined />} 
              size="small" 
              onClick={() => showCrawlerDetails(record.id)}
            />
          </Tooltip>
          
          {record.status === 'idle' && (
            <Tooltip title="Start">
              <Button 
                icon={<PlayCircleOutlined />} 
                size="small" 
                type="primary"
                onClick={() => handleStartCrawler(record.id)}
              />
            </Tooltip>
          )}
          
          {record.status === 'running' && (
            <>
              <Tooltip title="Pause">
                <Button 
                  icon={<PauseCircleOutlined />} 
                  size="small" 
                  onClick={() => handlePauseCrawler(record.id)}
                />
              </Tooltip>
              <Tooltip title="Stop">
                <Button 
                  icon={<StopOutlined />} 
                  size="small" 
                  danger
                  onClick={() => handleStopCrawler(record.id)}
                />
              </Tooltip>
            </>
          )}
          
          {record.status === 'paused' && (
            <Tooltip title="Resume">
              <Button 
                icon={<PlayCircleOutlined />} 
                size="small" 
                type="primary"
                onClick={() => handleResumeCrawler(record.id)}
              />
            </Tooltip>
          )}
          
          <Popconfirm
            title="Are you sure you want to delete this crawler?"
            onConfirm={() => handleDeleteCrawler(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title="Delete">
              <Button 
                icon={<DeleteOutlined />} 
                size="small" 
                danger
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card 
        title={
          <Space>
            <ApiOutlined />
            <span>Crawlee Crawler Manager</span>
          </Space>
        }
        extra={
          <Space>
            <Button icon={<ReloadOutlined />} onClick={fetchCrawlers}>
              Refresh
            </Button>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => setCreateModalVisible(true)}
            >
              Create Crawler
            </Button>
          </Space>
        }
      >
        <Alert
          message="24/7 SEO Data Mining"
          description="Crawlee provides a powerful, scalable crawling solution for extracting SEO data continuously. Configure crawlers, add them to campaigns, and let them mine data automatically."
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />

        <Table 
          columns={columns} 
          dataSource={crawlers}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* Create Crawler Modal */}
      <Modal
        title="Create New Crawler"
        open={createModalVisible}
        onCancel={() => {
          setCreateModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateCrawler}
        >
          <Tabs defaultActiveKey="basic">
            <TabPane tab="Basic Settings" key="basic">
              <Form.Item
                name="name"
                label="Crawler Name"
                rules={[{ required: true, message: 'Please enter crawler name' }]}
              >
                <Input placeholder="My SEO Crawler" />
              </Form.Item>

              <Form.Item name="description" label="Description">
                <TextArea rows={3} placeholder="Describe what this crawler does..." />
              </Form.Item>

              <Form.Item
                name="type"
                label="Crawler Type"
                rules={[{ required: true, message: 'Please select crawler type' }]}
                initialValue="cheerio"
              >
                <Select placeholder="Select crawler type">
                  {crawlerTypes.map(type => (
                    <Option key={type.id} value={type.id}>
                      <Space direction="vertical" size={0}>
                        <strong>{type.name}</strong>
                        <small>{type.description}</small>
                      </Space>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </TabPane>

            <TabPane tab="Configuration" key="config">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name={['config', 'maxRequestsPerCrawl']}
                    label="Max Requests Per Crawl"
                    initialValue={1000}
                  >
                    <InputNumber min={1} max={10000} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name={['config', 'maxConcurrency']}
                    label="Max Concurrency"
                    initialValue={10}
                  >
                    <InputNumber min={1} max={100} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name={['config', 'maxRequestRetries']}
                    label="Max Request Retries"
                    initialValue={3}
                  >
                    <InputNumber min={0} max={10} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name={['config', 'requestHandlerTimeoutSecs']}
                    label="Request Timeout (seconds)"
                    initialValue={60}
                  >
                    <InputNumber min={1} max={300} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name={['config', 'useSessionPool']}
                label="Use Session Pool"
                valuePropName="checked"
                initialValue={true}
              >
                <Switch />
              </Form.Item>
            </TabPane>

            <TabPane tab="URL Patterns" key="urls">
              <Form.Item
                name="url_patterns"
                label="URL Patterns (JSON)"
                initialValue={JSON.stringify({
                  include: ['*'],
                  exclude: [],
                  maxDepth: 3,
                  sameDomain: true,
                  respectRobotsTxt: true
                }, null, 2)}
              >
                <TextArea rows={10} placeholder='{"include": ["*"], "exclude": [], "maxDepth": 3}' />
              </Form.Item>
            </TabPane>

            <TabPane tab="Data Extraction" key="extraction">
              <Alert
                message="Define CSS selectors for data extraction"
                description='Use JSON format: {"title": "h1", "price": ".price", "description": "meta[name=description]"}'
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />
              
              <Form.Item
                name="selectors"
                label="Selectors (JSON)"
                initialValue={JSON.stringify({
                  title: 'h1',
                  description: 'meta[name="description"]',
                  keywords: 'meta[name="keywords"]'
                }, null, 2)}
              >
                <TextArea rows={10} placeholder='{"title": "h1", "price": ".price"}' />
              </Form.Item>
            </TabPane>

            <TabPane tab="Integration" key="integration">
              <Form.Item name="campaign_id" label="Campaign ID (Optional)">
                <Input placeholder="campaign_xyz123" />
              </Form.Item>

              <Form.Item name="seeder_service_id" label="Seeder Service ID (Optional)">
                <Input placeholder="seeder_abc456" />
              </Form.Item>

              <Form.Item name="tags" label="Tags">
                <Select mode="tags" placeholder="Add tags...">
                  <Option value="seo">SEO</Option>
                  <Option value="product">Product</Option>
                  <Option value="news">News</Option>
                </Select>
              </Form.Item>
            </TabPane>
          </Tabs>

          <Form.Item style={{ marginTop: 16, marginBottom: 0 }}>
            <Space>
              <Button type="primary" htmlType="submit">
                Create Crawler
              </Button>
              <Button onClick={() => {
                setCreateModalVisible(false);
                form.resetFields();
              }}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Crawler Details Drawer */}
      {selectedCrawler && (
        <Drawer
          title="Crawler Details"
          placement="right"
          width={720}
          open={detailsDrawerVisible}
          onClose={() => {
            setDetailsDrawerVisible(false);
            setSelectedCrawler(null);
          }}
        >
          <Tabs defaultActiveKey="overview">
            <TabPane tab="Overview" key="overview">
              <Descriptions bordered column={1}>
                <Descriptions.Item label="ID">{selectedCrawler.id}</Descriptions.Item>
                <Descriptions.Item label="Name">{selectedCrawler.name}</Descriptions.Item>
                <Descriptions.Item label="Description">{selectedCrawler.description}</Descriptions.Item>
                <Descriptions.Item label="Type">
                  <Tag color="blue">{selectedCrawler.type}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Status">
                  <Badge status={selectedCrawler.status === 'running' ? 'processing' : 'default'} 
                         text={selectedCrawler.status.toUpperCase()} />
                </Descriptions.Item>
                <Descriptions.Item label="Created">
                  {new Date(selectedCrawler.created_at).toLocaleString()}
                </Descriptions.Item>
                {selectedCrawler.started_at && (
                  <Descriptions.Item label="Started">
                    {new Date(selectedCrawler.started_at).toLocaleString()}
                  </Descriptions.Item>
                )}
              </Descriptions>

              {selectedCrawler.stats && (
                <Card title="Statistics" style={{ marginTop: 16 }}>
                  <Row gutter={16}>
                    <Col span={8}>
                      <Statistic 
                        title="Total Requests" 
                        value={selectedCrawler.stats.requestsTotal || 0} 
                      />
                    </Col>
                    <Col span={8}>
                      <Statistic 
                        title="Finished" 
                        value={selectedCrawler.stats.requestsFinished || 0}
                        valueStyle={{ color: '#3f8600' }}
                      />
                    </Col>
                    <Col span={8}>
                      <Statistic 
                        title="Failed" 
                        value={selectedCrawler.stats.requestsFailed || 0}
                        valueStyle={{ color: '#cf1322' }}
                      />
                    </Col>
                  </Row>
                </Card>
              )}
            </TabPane>

            <TabPane tab="Configuration" key="config">
              <pre style={{ background: '#f5f5f5', padding: 16, borderRadius: 4 }}>
                {JSON.stringify(selectedCrawler.config, null, 2)}
              </pre>
            </TabPane>

            <TabPane tab="URL Patterns" key="patterns">
              <pre style={{ background: '#f5f5f5', padding: 16, borderRadius: 4 }}>
                {JSON.stringify(selectedCrawler.url_patterns, null, 2)}
              </pre>
            </TabPane>

            <TabPane tab="Selectors" key="selectors">
              <pre style={{ background: '#f5f5f5', padding: 16, borderRadius: 4 }}>
                {JSON.stringify(selectedCrawler.selectors, null, 2)}
              </pre>
            </TabPane>
          </Tabs>
        </Drawer>
      )}
    </div>
  );
};

export default CrawleeManager;
