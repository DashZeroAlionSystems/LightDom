/**
 * Neural Network Admin Panel
 * 
 * Comprehensive dashboard for managing neural network training,
 * viewing records, and controlling crawlers from a single interface.
 */

import React, { useState, useEffect } from 'react';
import { 
  Card, Button, Input, Select, Table, Tabs, Modal, message, 
  Statistic, Row, Col, Tag, Progress, Space, Spin, Alert 
} from 'antd';
import {
  RocketOutlined, DatabaseOutlined, BugOutlined, 
  CloudServerOutlined, PlayCircleOutlined, PauseCircleOutlined,
  ReloadOutlined, DeleteOutlined, EyeOutlined, SettingOutlined
} from '@ant-design/icons';

const { TextArea } = Input;
const { TabPane } = Tabs;
const { Option } = Select;

interface AdminPanelProps {
  dbUrl?: string;
  apiUrl?: string;
}

export const NeuralNetworkAdminPanel: React.FC<AdminPanelProps> = ({
  dbUrl = '/api/database',
  apiUrl = '/api/neural-network',
}) => {
  const [activeTab, setActiveTab] = useState('prompt');
  const [loading, setLoading] = useState(false);
  
  // Prompt interface state
  const [promptInput, setPromptInput] = useState('');
  const [promptAction, setPromptAction] = useState('train');
  const [promptResponse, setPromptResponse] = useState<any>(null);
  
  // Training data state
  const [trainingData, setTrainingData] = useState<any[]>([]);
  const [trainingDataLoading, setTrainingDataLoading] = useState(false);
  
  // Models state
  const [models, setModels] = useState<any[]>([]);
  const [modelsLoading, setModelsLoading] = useState(false);
  
  // Crawler instances state
  const [crawlers, setCrawlers] = useState<any[]>([]);
  const [crawlersLoading, setCrawlersLoading] = useState(false);
  
  // Crawler logs state
  const [crawlerLogs, setCrawlerLogs] = useState<any[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  
  // Stats
  const [stats, setStats] = useState({
    trainingDataCount: 0,
    modelsCount: 0,
    crawlersCount: 0,
    activeC rawlers: 0,
  });

  /**
   * Load training data from database
   */
  const loadTrainingData = async () => {
    setTrainingDataLoading(true);
    try {
      const response = await fetch(`${dbUrl}/training-data?limit=100`);
      const data = await response.json();
      setTrainingData(data.rows || []);
      setStats(prev => ({ ...prev, trainingDataCount: data.total || 0 }));
    } catch (error) {
      message.error('Failed to load training data');
      console.error(error);
    } finally {
      setTrainingDataLoading(false);
    }
  };

  /**
   * Load models from database
   */
  const loadModels = async () => {
    setModelsLoading(true);
    try {
      const response = await fetch(`${dbUrl}/models?limit=50`);
      const data = await response.json();
      setModels(data.rows || []);
      setStats(prev => ({ ...prev, modelsCount: data.total || 0 }));
    } catch (error) {
      message.error('Failed to load models');
      console.error(error);
    } finally {
      setModelsLoading(false);
    }
  };

  /**
   * Load crawler instances from database
   */
  const loadCrawlers = async () => {
    setCrawlersLoading(true);
    try {
      const response = await fetch(`${dbUrl}/crawlers?limit=50`);
      const data = await response.json();
      setCrawlers(data.rows || []);
      const activeCrawlers = (data.rows || []).filter((c: any) => c.status === 'running').length;
      setStats(prev => ({ 
        ...prev, 
        crawlersCount: data.total || 0,
        activeCrawlers,
      }));
    } catch (error) {
      message.error('Failed to load crawlers');
      console.error(error);
    } finally {
      setCrawlersLoading(false);
    }
  };

  /**
   * Load crawler logs from database
   */
  const loadCrawlerLogs = async (instanceId?: number) => {
    setLogsLoading(true);
    try {
      const url = instanceId 
        ? `${dbUrl}/crawler-logs?instance_id=${instanceId}&limit=100`
        : `${dbUrl}/crawler-logs?limit=100`;
      const response = await fetch(url);
      const data = await response.json();
      setCrawlerLogs(data.rows || []);
    } catch (error) {
      message.error('Failed to load logs');
      console.error(error);
    } finally {
      setLogsLoading(false);
    }
  };

  /**
   * Execute prompt action
   */
  const executePrompt = async () => {
    if (!promptInput.trim()) {
      message.warning('Please enter a prompt');
      return;
    }

    setLoading(true);
    setPromptResponse(null);

    try {
      const response = await fetch(`${apiUrl}/execute-prompt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptInput,
          action: promptAction,
        }),
      });

      const data = await response.json();
      setPromptResponse(data);
      
      message.success('Prompt executed successfully!');
      
      // Reload relevant data
      if (promptAction === 'train') {
        await loadTrainingData();
      } else if (promptAction === 'crawl') {
        await loadCrawlers();
      }
      
    } catch (error) {
      message.error('Failed to execute prompt');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Start crawler
   */
  const startCrawler = async (crawlerId: number) => {
    try {
      await fetch(`${apiUrl}/crawler/${crawlerId}/start`, { method: 'POST' });
      message.success('Crawler started');
      await loadCrawlers();
    } catch (error) {
      message.error('Failed to start crawler');
    }
  };

  /**
   * Stop crawler
   */
  const stopCrawler = async (crawlerId: number) => {
    try {
      await fetch(`${apiUrl}/crawler/${crawlerId}/stop`, { method: 'POST' });
      message.success('Crawler stopped');
      await loadCrawlers();
    } catch (error) {
      message.error('Failed to stop crawler');
    }
  };

  // Load data on mount
  useEffect(() => {
    loadTrainingData();
    loadModels();
    loadCrawlers();
    loadCrawlerLogs();
  }, []);

  // Auto-refresh crawlers every 30s
  useEffect(() => {
    const interval = setInterval(() => {
      if (activeTab === 'crawlers') {
        loadCrawlers();
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [activeTab]);

  // Training data columns
  const trainingDataColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'Component Type',
      dataIndex: 'component_type',
      key: 'component_type',
      width: 150,
    },
    {
      title: 'Overall Score',
      key: 'overall_score',
      width: 120,
      render: (record: any) => {
        const metrics = JSON.parse(record.metrics || '{}');
        return (
          <Tag color={metrics.overallScore > 0.8 ? 'green' : 'orange'}>
            {(metrics.overallScore * 100).toFixed(1)}%
          </Tag>
        );
      },
    },
    {
      title: 'User Rating',
      dataIndex: 'user_rating',
      key: 'user_rating',
      width: 120,
      render: (rating: number) => rating ? `${rating.toFixed(1)} / 5` : 'N/A',
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (record: any) => (
        <Space>
          <Button 
            size="small" 
            icon={<EyeOutlined />}
            onClick={() => {
              Modal.info({
                title: 'Training Data Details',
                width: 800,
                content: (
                  <div>
                    <p><strong>Component Type:</strong> {record.component_type}</p>
                    <p><strong>Features:</strong></p>
                    <pre>{JSON.stringify(JSON.parse(record.features), null, 2)}</pre>
                    <p><strong>Metrics:</strong></p>
                    <pre>{JSON.stringify(JSON.parse(record.metrics), null, 2)}</pre>
                  </div>
                ),
              });
            }}
          >
            View
          </Button>
        </Space>
      ),
    },
  ];

  // Crawler columns
  const crawlerColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: 200,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => (
        <Tag color={
          status === 'running' ? 'green' :
          status === 'paused' ? 'orange' :
          status === 'error' ? 'red' : 'default'
        }>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Pages Crawled',
      dataIndex: 'total_pages_crawled',
      key: 'total_pages_crawled',
      width: 120,
    },
    {
      title: 'Errors',
      dataIndex: 'total_errors',
      key: 'total_errors',
      width: 100,
    },
    {
      title: 'Last Heartbeat',
      dataIndex: 'last_heartbeat',
      key: 'last_heartbeat',
      width: 180,
      render: (date: string) => date ? new Date(date).toLocaleString() : 'Never',
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 200,
      render: (record: any) => (
        <Space>
          {record.status === 'running' ? (
            <Button 
              size="small" 
              icon={<PauseCircleOutlined />}
              onClick={() => stopCrawler(record.id)}
            >
              Stop
            </Button>
          ) : (
            <Button 
              size="small" 
              icon={<PlayCircleOutlined />}
              type="primary"
              onClick={() => startCrawler(record.id)}
            >
              Start
            </Button>
          )}
          <Button 
            size="small" 
            icon={<EyeOutlined />}
            onClick={() => {
              setActiveTab('logs');
              loadCrawlerLogs(record.id);
            }}
          >
            Logs
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="neural-network-admin-panel" style={{ padding: '24px' }}>
      <h1 style={{ marginBottom: '24px' }}>
        <SettingOutlined /> Neural Network Admin Panel
      </h1>

      {/* Stats Overview */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Training Data"
              value={stats.trainingDataCount}
              prefix={<DatabaseOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Models"
              value={stats.modelsCount}
              prefix={<RocketOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Crawlers"
              value={stats.crawlersCount}
              prefix={<CloudServerOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Active Crawlers"
              value={stats.activeCrawlers}
              prefix={<BugOutlined />}
              valueStyle={{ color: stats.activeCrawlers > 0 ? '#3f8600' : '#cf1322' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Tabs */}
      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          {/* Prompt Interface */}
          <TabPane tab="Prompt Interface" key="prompt">
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
              <Alert
                message="Natural Language Interface"
                description="Use natural language to train models, start crawlers, or analyze components. The system will understand your intent and execute the appropriate action."
                type="info"
                showIcon
                style={{ marginBottom: '24px' }}
              />

              <Space direction="vertical" style={{ width: '100%' }} size="large">
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                    Action Type:
                  </label>
                  <Select
                    value={promptAction}
                    onChange={setPromptAction}
                    style={{ width: '100%' }}
                  >
                    <Option value="train">Train Model</Option>
                    <Option value="analyze">Analyze Component</Option>
                    <Option value="crawl">Start Crawler</Option>
                    <Option value="query">Query Database</Option>
                  </Select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                    Prompt:
                  </label>
                  <TextArea
                    value={promptInput}
                    onChange={(e) => setPromptInput(e.target.value)}
                    placeholder="Example: Train a model on button components with high accessibility scores"
                    rows={4}
                  />
                </div>

                <Button
                  type="primary"
                  size="large"
                  icon={<RocketOutlined />}
                  onClick={executePrompt}
                  loading={loading}
                  style={{ width: '100%' }}
                >
                  Execute
                </Button>

                {promptResponse && (
                  <Card title="Response" style={{ marginTop: '16px' }}>
                    <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                      {JSON.stringify(promptResponse, null, 2)}
                    </pre>
                  </Card>
                )}
              </Space>
            </div>
          </TabPane>

          {/* Training Data */}
          <TabPane tab="Training Data" key="training-data">
            <div style={{ marginBottom: '16px' }}>
              <Button
                icon={<ReloadOutlined />}
                onClick={loadTrainingData}
                loading={trainingDataLoading}
              >
                Refresh
              </Button>
            </div>
            <Table
              columns={trainingDataColumns}
              dataSource={trainingData}
              rowKey="id"
              loading={trainingDataLoading}
              scroll={{ x: true }}
              pagination={{ pageSize: 20 }}
            />
          </TabPane>

          {/* Models */}
          <TabPane tab="Models" key="models">
            <div style={{ marginBottom: '16px' }}>
              <Button
                icon={<ReloadOutlined />}
                onClick={loadModels}
                loading={modelsLoading}
              >
                Refresh
              </Button>
            </div>
            <Table
              dataSource={models}
              rowKey="id"
              loading={modelsLoading}
              columns={[
                { title: 'ID', dataIndex: 'id', width: 60 },
                { title: 'Name', dataIndex: 'name' },
                { title: 'Version', dataIndex: 'version', width: 100 },
                { title: 'Status', dataIndex: 'status', width: 100 },
                { 
                  title: 'Created', 
                  dataIndex: 'created_at',
                  width: 180,
                  render: (date: string) => new Date(date).toLocaleString()
                },
              ]}
            />
          </TabPane>

          {/* Crawlers */}
          <TabPane tab="Crawlers" key="crawlers">
            <div style={{ marginBottom: '16px' }}>
              <Button
                icon={<ReloadOutlined />}
                onClick={loadCrawlers}
                loading={crawlersLoading}
              >
                Refresh
              </Button>
            </div>
            <Table
              columns={crawlerColumns}
              dataSource={crawlers}
              rowKey="id"
              loading={crawlersLoading}
              scroll={{ x: true }}
              pagination={{ pageSize: 20 }}
            />
          </TabPane>

          {/* Crawler Logs */}
          <TabPane tab="Logs" key="logs">
            <div style={{ marginBottom: '16px' }}>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => loadCrawlerLogs()}
                loading={logsLoading}
              >
                Refresh
              </Button>
            </div>
            <Table
              dataSource={crawlerLogs}
              rowKey="id"
              loading={logsLoading}
              scroll={{ x: true }}
              pagination={{ pageSize: 50 }}
              columns={[
                { title: 'ID', dataIndex: 'id', width: 60 },
                { title: 'Instance ID', dataIndex: 'instance_id', width: 100 },
                { title: 'URL', dataIndex: 'url', width: 300 },
                { title: 'Status', dataIndex: 'status', width: 100 },
                { title: 'Response Time', dataIndex: 'response_time', width: 120 },
                { 
                  title: 'Created', 
                  dataIndex: 'created_at',
                  width: 180,
                  render: (date: string) => new Date(date).toLocaleString()
                },
              ]}
            />
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default NeuralNetworkAdminPanel;
