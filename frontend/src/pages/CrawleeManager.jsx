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
  ApiOutlined
} from '@ant-design/icons';
import axios from 'axios';

const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

const DEFAULT_URL_PATTERNS = {
  include: ['*'],
  exclude: [],
  maxDepth: 3,
  sameDomain: true,
  respectRobotsTxt: true
};

const DEFAULT_SELECTORS = {
  title: 'h1',
  description: 'meta[name="description"]',
  keywords: 'meta[name="keywords"]'
};

const safeParseJSON = (value, fallback) => {
  if (value === null || value === undefined) {
    return fallback;
  }

  if (typeof value === 'object') {
    return value;
  }

  if (typeof value === 'string') {
    if (!value.trim()) {
      return fallback;
    }

    try {
      return JSON.parse(value);
    } catch (error) {
      return fallback;
    }
  }

  return fallback;
};

const sanitizeSeederPayload = (payload) => JSON.parse(
  JSON.stringify(payload, (key, value) => {
    if (value === undefined || value === null) {
      return undefined;
    }

    if (Array.isArray(value) && value.length === 0) {
      return undefined;
    }

    if (typeof value === 'object' && Object.keys(value).length === 0) {
      return undefined;
    }

    return value;
  })
);

const parseJsonField = (rawValue, label, fallback) => {
  if (rawValue === undefined || rawValue === null || rawValue === '') {
    return fallback;
  }

  if (typeof rawValue !== 'string') {
    return rawValue;
  }

  try {
    return JSON.parse(rawValue);
  } catch (error) {
    throw new Error(`Invalid JSON in ${label}`);
  }
};

const normalizeCrawlerRecord = (crawler) => {
  if (!crawler) {
    return null;
  }

  const normalizedTags = Array.isArray(crawler.tags) ? crawler.tags : safeParseJSON(crawler.tags, []);

  return {
    ...crawler,
    config: safeParseJSON(crawler.config, {}),
    request_config: safeParseJSON(crawler.request_config, {}),
    autoscaling_config: safeParseJSON(crawler.autoscaling_config, {}),
    session_pool_config: safeParseJSON(crawler.session_pool_config, {}),
    proxy_config: safeParseJSON(crawler.proxy_config, {}),
    storage_config: safeParseJSON(crawler.storage_config, {}),
    request_queue_config: safeParseJSON(crawler.request_queue_config, {}),
    error_handling_config: safeParseJSON(crawler.error_handling_config, {}),
    url_patterns: safeParseJSON(crawler.url_patterns, DEFAULT_URL_PATTERNS),
    selectors: safeParseJSON(crawler.selectors, DEFAULT_SELECTORS),
    stats: safeParseJSON(crawler.stats, {}),
    tags: normalizedTags,
    metadata: safeParseJSON(crawler.metadata, {}),
    schedule: safeParseJSON(crawler.schedule, null)
  };
};

const CrawleeManager = () => {
  const [crawlers, setCrawlers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [detailsDrawerVisible, setDetailsDrawerVisible] = useState(false);
  const [selectedCrawler, setSelectedCrawler] = useState(null);
  const [editingCrawler, setEditingCrawler] = useState(null);
  const [crawlerTypes, setCrawlerTypes] = useState([]);
  const [modalSubmitting, setModalSubmitting] = useState(false);
  const [crawlerTypesLoading, setCrawlerTypesLoading] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchCrawlers();
    fetchCrawlerTypes();
  }, []);

  const fetchCrawlers = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/crawlee/crawlers');
      const crawlerList = Array.isArray(response.data.crawlers)
        ? response.data.crawlers.map(normalizeCrawlerRecord)
        : [];
      setCrawlers(crawlerList);
    } catch (error) {
      console.error('Failed to fetch crawlers:', error);
      message.error('Failed to fetch crawlers');
    } finally {
      setLoading(false);
    }
  };

  const fetchCrawlerTypes = async () => {
    setCrawlerTypesLoading(true);
    try {
      const response = await axios.get('/api/crawlee/crawler-types');
      setCrawlerTypes(response.data.types || []);
    } catch (error) {
      console.error('Failed to fetch crawler types:', error);
    } finally {
      setCrawlerTypesLoading(false);
    }
  };

  const openCreateModal = () => {
    setModalMode('create');
    setEditingCrawler(null);
    form.resetFields();
    form.setFieldsValue({
      selectors: JSON.stringify(DEFAULT_SELECTORS, null, 2),
      url_patterns: JSON.stringify(DEFAULT_URL_PATTERNS, null, 2),
      seed_urls: '',
      seeder_keywords: [],
      client_site_url: '',
      auto_start_seeder: true
    });
    setCreateModalVisible(true);
  };

  const openEditModal = (crawler) => {
    const normalized = normalizeCrawlerRecord(crawler);
    setModalMode('edit');
    setEditingCrawler(normalized);
    form.resetFields();

    form.setFieldsValue({
      name: normalized.name,
      description: normalized.description,
      type: normalized.type,
      campaign_id: normalized.campaign_id,
      seeder_service_id: normalized.seeder_service_id,
      tags: normalized.tags || [],
      selectors: JSON.stringify(normalized.selectors || {}, null, 2),
      url_patterns: JSON.stringify(normalized.url_patterns || {}, null, 2),
      seed_urls: '',
      seeder_keywords: normalized.tags || [],
      client_site_url: normalized.metadata?.clientSiteUrl || '',
      auto_start_seeder: true,
      config: {
        maxRequestsPerCrawl: normalized.config?.maxRequestsPerCrawl ?? 1000,
        maxConcurrency: normalized.config?.maxConcurrency ?? 10,
        maxRequestRetries: normalized.config?.maxRequestRetries ?? 3,
        requestHandlerTimeoutSecs: normalized.config?.requestHandlerTimeoutSecs ?? 60,
        useSessionPool: normalized.config?.useSessionPool ?? true
      }
    });

    setCreateModalVisible(true);
  };

  const closeModal = () => {
    setCreateModalVisible(false);
    setModalMode('create');
    setEditingCrawler(null);
    setModalSubmitting(false);
    form.resetFields();
  };

  const createSeederServiceForCrawler = async (crawler, options = {}) => {
    const normalizedCrawler = normalizeCrawlerRecord(crawler);
    if (!normalizedCrawler) {
      return null;
    }

    const {
      seedUrls = [],
      keywords = [],
      clientSiteUrl,
      instanceId,
      autoStart = true
    } = options;

    const normalizedConfig = normalizedCrawler.config || {};
    const normalizedUrlPatterns = normalizedCrawler.url_patterns || DEFAULT_URL_PATTERNS;
    const normalizedTags = normalizedCrawler.tags || [];

    const resolvedInstanceId = instanceId
      || normalizedCrawler.seeder_service_id
      || `seeder_${normalizedCrawler.id}`;

    const finalSeedUrls = Array.isArray(seedUrls) ? seedUrls : [];
    const finalKeywords = Array.isArray(keywords) && keywords.length > 0 ? keywords : normalizedTags;

    const payload = sanitizeSeederPayload({
      instanceId: resolvedInstanceId,
      name: `${normalizedCrawler.name || normalizedCrawler.id} Seeder`,
      description: `Auto-generated seeding configuration for ${normalizedCrawler.name || normalizedCrawler.id}`,
      clientId: normalizedCrawler.campaign_id || 'default',
      clientSiteUrl: clientSiteUrl || finalSeedUrls[0] || undefined,
      campaignId: normalizedCrawler.campaign_id || undefined,
      maxSeedsPerInstance: 1000,
      seedRefreshInterval: 3600000,
      searchDepth: normalizedUrlPatterns?.maxDepth ?? 3,
      minBacklinkQuality: 0.5,
      enableSearchAlgorithms: true,
      enableRelatedURLDiscovery: true,
      enableBacklinkGeneration: true,
      seeds: finalSeedUrls,
      keywords: finalKeywords,
      topics: finalKeywords.slice(0, 10),
      crawlerConfig: {
        maxDepth: normalizedUrlPatterns?.maxDepth ?? 3,
        parallelCrawlers: normalizedConfig?.maxConcurrency ?? 5,
        requestDelay: normalizedConfig?.requestHandlerTimeoutSecs
          ? Math.min(normalizedConfig.requestHandlerTimeoutSecs * 1000, 60000)
          : 2000,
        respectRobotsTxt: normalizedUrlPatterns?.respectRobotsTxt !== false
      }
    });

    try {
      let created = false;
      let started = false;

      if (resolvedInstanceId) {
        try {
          const existing = await axios.get(`/api/seeding/config/${resolvedInstanceId}`);
          if (existing.data?.config) {
            await axios.put(`/api/seeding/config/${resolvedInstanceId}`, payload);

            if (autoStart) {
              try {
                await axios.post(`/api/seeding/start/${resolvedInstanceId}`);
                started = true;
              } catch (startError) {
                if (!(startError.response && startError.response.status === 400)) {
                  message.warning('Seeder exists but failed to start automatically');
                }
              }
            }

            return { seederId: resolvedInstanceId, created, started };
          }
        } catch (error) {
          if (!(error.response && error.response.status === 404)) {
            throw error;
          }
        }
      }

      const response = await axios.post('/api/seeding/config', payload);
      const seederId = response.data?.config?.instanceId || resolvedInstanceId;
      created = true;

      if (seederId && seederId !== normalizedCrawler.seeder_service_id) {
        await axios.put(`/api/crawlee/crawlers/${normalizedCrawler.id}`, {
          seeder_service_id: seederId
        });
      }

      if (autoStart && seederId) {
        try {
          await axios.post(`/api/seeding/start/${seederId}`);
          started = true;
        } catch (startError) {
          if (!(startError.response && startError.response.status === 400)) {
            message.warning('Seeder created but failed to start automatically');
          }
        }
      }

      return { seederId, created, started };
    } catch (error) {
      throw new Error(error.response?.data?.error || error.message);
    }
  };

  const handleSubmitCrawler = async (formValues) => {
    const values = { ...formValues };

    let selectors;
    let urlPatterns;

    try {
      selectors = parseJsonField(values.selectors, 'selectors', {});
      urlPatterns = parseJsonField(values.url_patterns, 'URL patterns', DEFAULT_URL_PATTERNS);
    } catch (parseError) {
      message.error(parseError.message);
      return;
    }

    values.selectors = selectors;
    values.url_patterns = urlPatterns;

    const seedUrlsRaw = values.seed_urls;
    const seedUrls = typeof seedUrlsRaw === 'string'
      ? seedUrlsRaw.split(/\r?\n/).map((url) => url.trim()).filter(Boolean)
      : Array.isArray(seedUrlsRaw) ? seedUrlsRaw : [];

    const seederKeywords = Array.isArray(values.seeder_keywords) ? values.seeder_keywords : [];
    const clientSiteUrl = values.client_site_url ? values.client_site_url.trim() : '';
    const autoStartSeeder = values.auto_start_seeder !== false;

    delete values.seed_urls;
    delete values.seeder_keywords;
    delete values.client_site_url;
    delete values.auto_start_seeder;

    if (values.campaign_id) {
      values.campaign_id = values.campaign_id.trim();
    }

    values.tags = Array.isArray(values.tags) ? values.tags : values.tags ? [values.tags] : [];

    const trimmedSeederId = values.seeder_service_id ? values.seeder_service_id.trim() : '';
    values.seeder_service_id = trimmedSeederId || null;

    setModalSubmitting(true);
    const hideMessage = message.loading(modalMode === 'create' ? 'Creating crawler...' : 'Updating crawler...', 0);

    try {
      if (modalMode === 'create') {
        const response = await axios.post('/api/crawlee/crawlers', values);
        const createdCrawler = normalizeCrawlerRecord(response.data?.crawler);

        const seederResult = await createSeederServiceForCrawler(
          {
            ...createdCrawler,
            campaign_id: values.campaign_id,
            tags: values.tags,
            seeder_service_id: createdCrawler?.seeder_service_id || values.seeder_service_id
          },
          {
            seedUrls,
            keywords: seederKeywords.length > 0 ? seederKeywords : values.tags,
            clientSiteUrl,
            instanceId: trimmedSeederId || undefined,
            autoStart: autoStartSeeder
          }
        );

        if (seederResult?.seederId) {
          const seederMessage = seederResult.created ? ' and seeder provisioned' : ' and seeder ready';
          message.success(`Crawler created${seederMessage}`);
        } else {
          message.success('Crawler created successfully');
        }
      } else if (editingCrawler) {
        await axios.put(`/api/crawlee/crawlers/${editingCrawler.id}`, values);

        const shouldProvisionSeeder = !editingCrawler.seeder_service_id
          || (trimmedSeederId && trimmedSeederId !== editingCrawler.seeder_service_id)
          || seedUrls.length > 0
          || seederKeywords.length > 0
          || clientSiteUrl;

        if (shouldProvisionSeeder) {
          const updatedCrawlerResponse = await axios.get(`/api/crawlee/crawlers/${editingCrawler.id}`);
          const updatedCrawler = normalizeCrawlerRecord(updatedCrawlerResponse.data?.crawler);

          await createSeederServiceForCrawler(
            {
              ...updatedCrawler,
              campaign_id: values.campaign_id ?? updatedCrawler.campaign_id,
              tags: values.tags.length > 0 ? values.tags : updatedCrawler.tags
            },
            {
              seedUrls,
              keywords: seederKeywords.length > 0 ? seederKeywords : values.tags,
              clientSiteUrl,
              instanceId: trimmedSeederId || updatedCrawler.seeder_service_id || undefined,
              autoStart: autoStartSeeder
            }
          );
        }

        message.success('Crawler updated successfully');
      }

      closeModal();
      fetchCrawlers();
    } catch (error) {
      console.error('Crawler save failed:', error);
      message.error(error.response?.data?.error || error.message);
    } finally {
      hideMessage();
      setModalSubmitting(false);
    }
  };

  const handleCreateSeederForCrawler = async (crawler) => {
    const hide = message.loading('Provisioning seeder service...', 0);
    try {
      const result = await createSeederServiceForCrawler(crawler, { autoStart: true });
      if (result?.seederId) {
        message.success(result.created ? 'Seeder service created' : 'Seeder service ready');
        fetchCrawlers();
      }
    } catch (error) {
      message.error(error.message || 'Failed to provision seeder');
    } finally {
      hide();
    }
  };

  const handleStartSeeder = async (instanceId) => {
    if (!instanceId) {
      return;
    }

    const hide = message.loading('Starting seeder service...', 0);
    try {
      await axios.post(`/api/seeding/start/${instanceId}`);
      message.success('Seeder service started');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        message.info(error.response.data?.error || 'Seeder service already running');
      } else {
        message.error(error.response?.data?.error || error.message);
      }
    } finally {
      hide();
    }
  };

  const handleStopSeeder = async (instanceId) => {
    if (!instanceId) {
      return;
    }

    const hide = message.loading('Stopping seeder service...', 0);
    try {
      await axios.post(`/api/seeding/stop/${instanceId}`);
      message.success('Seeder service stopped');
    } catch (error) {
      message.error(error.response?.data?.error || error.message);
    } finally {
      hide();
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
      setSelectedCrawler(normalizeCrawlerRecord(response.data.crawler));
      setDetailsDrawerVisible(true);
    } catch (error) {
      message.error('Failed to fetch crawler details');
    }
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
      title: 'Seeder',
      dataIndex: 'seeder_service_id',
      key: 'seeder_service_id',
      render: (value) => (
        value ? <Tag color="green">{value}</Tag> : <Tag color="default">Not Linked</Tag>
      )
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
          <Tooltip title="Edit">
            <Button
              icon={<EditOutlined />}
              size="small"
              onClick={() => openEditModal(record)}
            />
          </Tooltip>
          {!record.seeder_service_id && (
            <Tooltip title="Provision Seeder">
              <Button
                icon={<SettingOutlined />}
                size="small"
                onClick={() => handleCreateSeederForCrawler(record)}
              />
            </Tooltip>
          )}
          
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

  const crawlerTypeColumns = [
    {
      title: 'Type',
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
      title: 'Description',
      dataIndex: 'description',
      key: 'description'
    },
    {
      title: 'Key Features',
      dataIndex: 'features',
      key: 'features',
      render: (features = []) => (
        <Space wrap>
          {features.map(feature => (
            <Tag key={feature} color="geekblue">{feature}</Tag>
          ))}
        </Space>
      )
    },
    {
      title: 'Best For',
      dataIndex: 'usage',
      key: 'usage'
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
              onClick={openCreateModal}
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

      <Card
        title="Crawler Types & Capabilities"
        style={{ marginTop: 24 }}
      >
        <Alert
          message="Crawler engine overview"
          description="Choose a crawler type that matches the rendering requirements of your target domain. Use full browser automation for heavy JavaScript sites and lighter engines for static pages."
          type="success"
          showIcon
          style={{ marginBottom: 16 }}
        />

        <Table
          columns={crawlerTypeColumns}
          dataSource={crawlerTypes}
          rowKey="id"
          pagination={false}
          loading={crawlerTypesLoading}
        />
      </Card>

      {/* Create Crawler Modal */}
      <Modal
        title={modalMode === 'create' ? 'Create New Crawler' : 'Edit Crawler'}
        open={createModalVisible}
        onCancel={closeModal}
        footer={null}
        width={800}
        maskClosable={!modalSubmitting}
        closable={!modalSubmitting}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmitCrawler}
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

              <Form.Item
                name="seed_urls"
                label="Initial Seed URLs"
                tooltip="Provide one URL per line to prime the seeding service."
              >
                <TextArea rows={4} placeholder="https://example.com\nhttps://example.com/about" />
              </Form.Item>

              <Form.Item
                name="seeder_keywords"
                label="Seeder Keywords"
                tooltip="Used to expand discovery beyond the initial seed URLs."
              >
                <Select mode="tags" placeholder="Add keywords..." />
              </Form.Item>

              <Form.Item
                name="client_site_url"
                label="Client Site URL"
                tooltip="Optional primary site used for relevance scoring."
              >
                <Input placeholder="https://client-site.com" />
              </Form.Item>

              <Form.Item
                name="auto_start_seeder"
                label="Auto start seeder after creation"
                valuePropName="checked"
                initialValue
              >
                <Switch />
              </Form.Item>
            </TabPane>
          </Tabs>

          <Form.Item style={{ marginTop: 16, marginBottom: 0 }}>
            <Space>
              <Button type="primary" htmlType="submit" loading={modalSubmitting}>
                {modalMode === 'create' ? 'Create Crawler' : 'Save Changes'}
              </Button>
              <Button onClick={closeModal} disabled={modalSubmitting}>
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
                <Descriptions.Item label="Campaign">
                  {selectedCrawler.campaign_id || '—'}
                </Descriptions.Item>
                <Descriptions.Item label="Seeder Service">
                  {selectedCrawler.seeder_service_id ? (
                    <Tag color="green">{selectedCrawler.seeder_service_id}</Tag>
                  ) : (
                    <Tag>No seeder linked</Tag>
                  )}
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
            <TabPane tab="Seeder Service" key="seeder">
              {selectedCrawler.seeder_service_id ? (
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  <Alert
                    message={`Seeder Service: ${selectedCrawler.seeder_service_id}`}
                    description="Manage the URL discovery pipeline powering this crawler."
                    type="success"
                    showIcon
                  />
                  <Space wrap>
                    <Button
                      size="small"
                      type="primary"
                      onClick={() => handleStartSeeder(selectedCrawler.seeder_service_id)}
                    >
                      Start Seeder
                    </Button>
                    <Button
                      size="small"
                      danger
                      onClick={() => handleStopSeeder(selectedCrawler.seeder_service_id)}
                    >
                      Stop Seeder
                    </Button>
                    <Button
                      size="small"
                      icon={<SettingOutlined />}
                      onClick={() => handleCreateSeederForCrawler(selectedCrawler)}
                    >
                      Rebuild Seeder
                    </Button>
                  </Space>
                </Space>
              ) : (
                <Alert
                  message="No seeder service linked"
                  description="Provision a seeder to automatically feed fresh URLs into this crawler's queue."
                  type="warning"
                  showIcon
                  action={
                    <Button
                      size="small"
                      type="primary"
                      onClick={() => handleCreateSeederForCrawler(selectedCrawler)}
                    >
                      Create Seeder
                    </Button>
                  }
                />
              )}
            </TabPane>
          </Tabs>
        </Drawer>
      )}
    </div>
  );
};

export default CrawleeManager;
