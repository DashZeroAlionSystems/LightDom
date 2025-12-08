/**
 * Crawlee Dashboard
 * Comprehensive web crawler management interface
 */

import React, { useState, useEffect } from 'react';
import { Card, Tabs, Table, Button, Modal, Form, Input, Select, Tag, Space, Statistic, Row, Col, message, Descriptions } from 'antd';
import { PlayCircleOutlined, PauseCircleOutlined, StopOutlined, PlusOutlined, ReloadOutlined, DeleteOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons';
import { crawleeAPI } from '../../services/apiService';

const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;

const CrawleeDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('crawlers');
  const [crawlers, setCrawlers] = useState<any[]>([]);
  const [selectedCrawler, setSelectedCrawler] = useState<any>(null);
  const [crawlerStats, setCrawlerStats] = useState<any>(null);
  const [crawlerResults, setCrawlerResults] = useState<any[]>([]);
  const [crawlerLogs, setCrawlerLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [resultsModalVisible, setResultsModalVisible] = useState(false);
  const [logsModalVisible, setLogsModalVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    loadCrawlers();
  }, []);

  const loadCrawlers = async () => {
    setLoading(true);
    try {
      const response = await crawleeAPI.getCrawlers();
      setCrawlers(response.crawlers || []);
    } catch (error) {
      message.error('Failed to load crawlers');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadCrawlerStats = async (id: string) => {
    try {
      const response = await crawleeAPI.getCrawlerStats(id);
      setCrawlerStats(response.stats);
    } catch (error) {
      message.error('Failed to load crawler statistics');
      console.error(error);
    }
  };

  const loadCrawlerResults = async (id: string) => {
    try {
      const response = await crawleeAPI.getCrawlerResults(id, { limit: 100 });
      setCrawlerResults(response.results || []);
      setResultsModalVisible(true);
    } catch (error) {
      message.error('Failed to load crawler results');
      console.error(error);
    }
  };

  const loadCrawlerLogs = async (id: string) => {
    try {
      const response = await crawleeAPI.getCrawlerLogs(id, { limit: 100 });
      setCrawlerLogs(response.logs || []);
      setLogsModalVisible(true);
    } catch (error) {
      message.error('Failed to load crawler logs');
      console.error(error);
    }
  };

  const handleCreateCrawler = async (values: any) => {
    try {
      await crawleeAPI.createCrawler({
        name: values.name,
        type: values.type,
        config: {
          maxRequestsPerCrawl: values.maxRequests,
          maxConcurrency: values.maxConcurrency,
          requestHandlerTimeoutSecs: values.timeout,
        },
        options: values.options ? JSON.parse(values.options) : {},
      });
      message.success('Crawler created successfully');
      setCreateModalVisible(false);
      form.resetFields();
      loadCrawlers();
    } catch (error) {
      message.error('Failed to create crawler');
      console.error(error);
    }
  };

  const handleStartCrawler = async (id: string, seedUrls?: string[]) => {
    try {
      await crawleeAPI.startCrawler(id, seedUrls);
      message.success('Crawler started');
      loadCrawlers();
    } catch (error) {
      message.error('Failed to start crawler');
      console.error(error);
    }
  };

  const handlePauseCrawler = async (id: string) => {
    try {
      await crawleeAPI.pauseCrawler(id);
      message.success('Crawler paused');
      loadCrawlers();
    } catch (error) {
      message.error('Failed to pause crawler');
      console.error(error);
    }
  };

  const handleResumeCrawler = async (id: string) => {
    try {
      await crawleeAPI.resumeCrawler(id);
      message.success('Crawler resumed');
      loadCrawlers();
    } catch (error) {
      message.error('Failed to resume crawler');
      console.error(error);
    }
  };

  const handleStopCrawler = async (id: string) => {
    try {
      await crawleeAPI.stopCrawler(id);
      message.success('Crawler stopped');
      loadCrawlers();
    } catch (error) {
      message.error('Failed to stop crawler');
      console.error(error);
    }
  };

  const handleDeleteCrawler = async (id: string) => {
    Modal.confirm({
      title: 'Delete Crawler',
      content: 'Are you sure you want to delete this crawler?',
      onOk: async () => {
        try {
          await crawleeAPI.deleteCrawler(id);
          message.success('Crawler deleted');
          loadCrawlers();
        } catch (error) {
          message.error('Failed to delete crawler');
          console.error(error);
        }
      },
    });
  };

  const handleViewDetails = async (crawler: any) => {
    setSelectedCrawler(crawler);
    await loadCrawlerStats(crawler.id);
    setDetailsModalVisible(true);
  };

  const crawlerColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => {
        const colors: any = {
          cheerio: 'blue',
          playwright: 'green',
          puppeteer: 'purple',
          jsdom: 'orange',
        };
        return <Tag color={colors[type] || 'default'}>{type.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const colors: any = {
          idle: 'default',
          running: 'processing',
          paused: 'warning',
          completed: 'success',
          failed: 'error',
        };
        return <Tag color={colors[status] || 'default'}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Campaign',
      dataIndex: 'campaign_id',
      key: 'campaign_id',
      render: (id: string) => id || 'N/A',
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space>
          {record.status === 'idle' && (
            <Button 
              type="primary" 
              icon={<PlayCircleOutlined />} 
              size="small"
              onClick={() => handleStartCrawler(record.id)}
            >
              Start
            </Button>
          )}
          {record.status === 'running' && (
            <>
              <Button 
                icon={<PauseCircleOutlined />} 
                size="small"
                onClick={() => handlePauseCrawler(record.id)}
              >
                Pause
              </Button>
              <Button 
                danger
                icon={<StopOutlined />} 
                size="small"
                onClick={() => handleStopCrawler(record.id)}
              >
                Stop
              </Button>
            </>
          )}
          {record.status === 'paused' && (
            <Button 
              type="primary"
              icon={<PlayCircleOutlined />} 
              size="small"
              onClick={() => handleResumeCrawler(record.id)}
            >
              Resume
            </Button>
          )}
          <Button 
            icon={<EyeOutlined />} 
            size="small"
            onClick={() => handleViewDetails(record)}
          >
            Details
          </Button>
          <Button 
            icon={<ReloadOutlined />} 
            size="small"
            onClick={() => loadCrawlerResults(record.id)}
          >
            Results
          </Button>
          <Button 
            icon={<EditOutlined />} 
            size="small"
            onClick={() => loadCrawlerLogs(record.id)}
          >
            Logs
          </Button>
          <Button 
            danger
            icon={<DeleteOutlined />} 
            size="small"
            onClick={() => handleDeleteCrawler(record.id)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  const resultsColumns = [
    {
      title: 'URL',
      dataIndex: 'url',
      key: 'url',
      ellipsis: true,
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: 'Crawled At',
      dataIndex: 'crawled_at',
      key: 'crawled_at',
      render: (date: string) => new Date(date).toLocaleString(),
    },
  ];

  const logsColumns = [
    {
      title: 'Level',
      dataIndex: 'level',
      key: 'level',
      render: (level: string) => {
        const colors: any = {
          error: 'red',
          warning: 'orange',
          info: 'blue',
          debug: 'default',
        };
        return <Tag color={colors[level] || 'default'}>{level.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Message',
      dataIndex: 'message',
      key: 'message',
    },
    {
      title: 'Timestamp',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (date: string) => new Date(date).toLocaleString(),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <h1>Crawlee Dashboard</h1>
      <p>Manage web crawlers with the Crawlee framework</p>

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="Crawlers" key="crawlers">
          <Card
            title="Active Crawlers"
            extra={
              <Space>
                <Button icon={<ReloadOutlined />} onClick={loadCrawlers}>
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
            <Table
              columns={crawlerColumns}
              dataSource={crawlers}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </TabPane>

        <TabPane tab="Statistics" key="statistics">
          <Card title="Crawler Statistics">
            <Row gutter={16}>
              <Col span={6}>
                <Statistic 
                  title="Total Crawlers" 
                  value={crawlers.length} 
                />
              </Col>
              <Col span={6}>
                <Statistic 
                  title="Running" 
                  value={crawlers.filter(c => c.status === 'running').length} 
                />
              </Col>
              <Col span={6}>
                <Statistic 
                  title="Completed" 
                  value={crawlers.filter(c => c.status === 'completed').length} 
                />
              </Col>
              <Col span={6}>
                <Statistic 
                  title="Failed" 
                  value={crawlers.filter(c => c.status === 'failed').length} 
                />
              </Col>
            </Row>
          </Card>
        </TabPane>
      </Tabs>

      {/* Create Crawler Modal */}
      <Modal
        title="Create New Crawler"
        open={createModalVisible}
        onCancel={() => {
          setCreateModalVisible(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateCrawler}>
          <Form.Item
            name="name"
            label="Crawler Name"
            rules={[{ required: true, message: 'Please enter crawler name' }]}
          >
            <Input placeholder="My Crawler" />
          </Form.Item>

          <Form.Item
            name="type"
            label="Crawler Type"
            rules={[{ required: true, message: 'Please select crawler type' }]}
          >
            <Select placeholder="Select crawler type">
              <Option value="cheerio">Cheerio (Fast, HTML-only)</Option>
              <Option value="playwright">Playwright (Full browser)</Option>
              <Option value="puppeteer">Puppeteer (Full browser)</Option>
              <Option value="jsdom">JSDOM (JavaScript parsing)</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="maxRequests"
            label="Max Requests"
            initialValue={1000}
          >
            <Input type="number" />
          </Form.Item>

          <Form.Item
            name="maxConcurrency"
            label="Max Concurrency"
            initialValue={10}
          >
            <Input type="number" />
          </Form.Item>

          <Form.Item
            name="timeout"
            label="Timeout (seconds)"
            initialValue={60}
          >
            <Input type="number" />
          </Form.Item>

          <Form.Item
            name="options"
            label="Additional Options (JSON)"
          >
            <TextArea rows={4} placeholder='{"headless": true, "proxy": "http://..."}' />
          </Form.Item>
        </Form>
      </Modal>

      {/* Crawler Details Modal */}
      <Modal
        title="Crawler Details"
        open={detailsModalVisible}
        onCancel={() => setDetailsModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailsModalVisible(false)}>
            Close
          </Button>
        ]}
        width={800}
      >
        {selectedCrawler && (
          <>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Name">{selectedCrawler.name}</Descriptions.Item>
              <Descriptions.Item label="Type">{selectedCrawler.type}</Descriptions.Item>
              <Descriptions.Item label="Status">{selectedCrawler.status}</Descriptions.Item>
              <Descriptions.Item label="Campaign ID">{selectedCrawler.campaign_id || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="Created">
                {new Date(selectedCrawler.created_at).toLocaleString()}
              </Descriptions.Item>
              <Descriptions.Item label="Updated">
                {new Date(selectedCrawler.updated_at).toLocaleString()}
              </Descriptions.Item>
            </Descriptions>

            {crawlerStats && (
              <Card title="Statistics" style={{ marginTop: 16 }}>
                <Row gutter={16}>
                  <Col span={8}>
                    <Statistic title="Total URLs" value={crawlerStats.total_urls || 0} />
                  </Col>
                  <Col span={8}>
                    <Statistic title="Crawled" value={crawlerStats.crawled_urls || 0} />
                  </Col>
                  <Col span={8}>
                    <Statistic title="Failed" value={crawlerStats.failed_urls || 0} />
                  </Col>
                  <Col span={8}>
                    <Statistic title="Success Rate" value={crawlerStats.success_rate || 0} suffix="%" />
                  </Col>
                  <Col span={8}>
                    <Statistic title="Avg Response Time" value={crawlerStats.avg_response_time || 0} suffix="ms" />
                  </Col>
                  <Col span={8}>
                    <Statistic title="Data Extracted" value={crawlerStats.data_extracted || 0} suffix=" KB" />
                  </Col>
                </Row>
              </Card>
            )}
          </>
        )}
      </Modal>

      {/* Results Modal */}
      <Modal
        title="Crawler Results"
        open={resultsModalVisible}
        onCancel={() => setResultsModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setResultsModalVisible(false)}>
            Close
          </Button>
        ]}
        width={1000}
      >
        <Table
          columns={resultsColumns}
          dataSource={crawlerResults}
          rowKey="id"
          pagination={{ pageSize: 20 }}
        />
      </Modal>

      {/* Logs Modal */}
      <Modal
        title="Crawler Logs"
        open={logsModalVisible}
        onCancel={() => setLogsModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setLogsModalVisible(false)}>
            Close
          </Button>
        ]}
        width={1000}
      >
        <Table
          columns={logsColumns}
          dataSource={crawlerLogs}
          rowKey="id"
          pagination={{ pageSize: 20 }}
        />
      </Modal>
    </div>
  );
};

export default CrawleeDashboard;
