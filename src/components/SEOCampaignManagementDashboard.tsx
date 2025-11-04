/**
 * SEO Campaign Management Dashboard
 * 
 * Comprehensive dashboard for managing:
 * - Workflows
 * - Services
 * - Crawler
 * - Seeds
 * - Data Streams
 * - SEO Campaigns
 * 
 * Features CRUD operations with schema-based configuration
 */

import React, { useState, useEffect } from 'react';
import {
  Tabs,
  Card,
  Table,
  Button,
  Form,
  Input,
  Select,
  Switch,
  InputNumber,
  Space,
  Tag,
  Modal,
  Drawer,
  Descriptions,
  Statistic,
  Row,
  Col,
  Alert,
  message,
  Popconfirm,
  Badge,
  Timeline,
  Progress
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  EyeOutlined,
  ApiOutlined,
  DatabaseOutlined,
  RobotOutlined,
  LinkOutlined,
  ThunderboltOutlined,
  SettingOutlined,
  LineChartOutlined
} from '@ant-design/icons';
import { campaignSchemas, campaignCRUDRules, campaignDefaults } from '../../../schemas/campaign-schemas';

const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;

const SEOCampaignManagementDashboard: React.FC = () => {
  // State for each entity type
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [crawlers, setCrawlers] = useState<any[]>([]);
  const [seeds, setSeeds] = useState<any[]>([]);
  const [dataStreams, setDataStreams] = useState<any[]>([]);
  const [attributes, setAttributes] = useState<any[]>([]);

  // UI state
  const [activeTab, setActiveTab] = useState('campaigns');
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [currentEntity, setCurrentEntity] = useState<any>(null);
  const [entityType, setEntityType] = useState<string>('campaign');
  const [form] = Form.useForm();

  // Load data on mount
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [campaignsData, workflowsData, servicesData, crawlersData, seedsData, streamsData, attributesData] = await Promise.all([
        fetch('/api/seo-campaign/campaigns').then(r => r.json()),
        fetch('/api/seo-workflow/workflows').then(r => r.json()),
        fetch('/api/seo-campaign/services').then(r => r.json()),
        fetch('/api/seo-campaign/crawlers').then(r => r.json()),
        fetch('/api/seo-campaign/seeds').then(r => r.json()),
        fetch('/api/seo-campaign/data-streams').then(r => r.json()),
        fetch('/api/seo-workflow/attributes').then(r => r.json())
      ]);

      setCampaigns(campaignsData.campaigns || []);
      setWorkflows(workflowsData.workflows || []);
      setServices(servicesData.services || []);
      setCrawlers(crawlersData.crawlers || []);
      setSeeds(seedsData.seeds || []);
      setDataStreams(streamsData.streams || []);
      setAttributes(attributesData.attributes || []);
    } catch (error) {
      console.error('Error loading data:', error);
      message.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Create new campaign with all wiring
  const createCampaign = async (values: any) => {
    setLoading(true);
    try {
      const response = await fetch('/api/seo-campaign/campaigns/create-complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...values,
          template: values.template || 'standard'
        })
      });

      const data = await response.json();
      
      if (data.success) {
        message.success('Campaign created successfully!');
        setModalVisible(false);
        form.resetFields();
        loadAllData();
      } else {
        message.error(data.error || 'Failed to create campaign');
      }
    } catch (error) {
      console.error('Error creating campaign:', error);
      message.error('Failed to create campaign');
    } finally {
      setLoading(false);
    }
  };

  // Generic CRUD operations
  const handleCreate = (type: string) => {
    setEntityType(type);
    setCurrentEntity(null);
    form.setFieldsValue(campaignSchemas[type]);
    setModalVisible(true);
  };

  const handleEdit = (type: string, entity: any) => {
    setEntityType(type);
    setCurrentEntity(entity);
    form.setFieldsValue(entity);
    setModalVisible(true);
  };

  const handleView = (type: string, entity: any) => {
    setEntityType(type);
    setCurrentEntity(entity);
    setDrawerVisible(true);
  };

  const handleDelete = async (type: string, id: string) => {
    try {
      const response = await fetch(`/api/seo-campaign/${type}s/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        message.success(`${type} deleted successfully`);
        loadAllData();
      } else {
        message.error(`Failed to delete ${type}`);
      }
    } catch (error) {
      console.error(`Error deleting ${type}:`, error);
      message.error(`Failed to delete ${type}`);
    }
  };

  const handleSubmit = async (values: any) => {
    const endpoint = currentEntity
      ? `/api/seo-campaign/${entityType}s/${currentEntity.id}`
      : `/api/seo-campaign/${entityType}s`;
    
    const method = currentEntity ? 'PUT' : 'POST';

    try {
      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      });

      if (response.ok) {
        message.success(`${entityType} ${currentEntity ? 'updated' : 'created'} successfully`);
        setModalVisible(false);
        form.resetFields();
        loadAllData();
      } else {
        message.error(`Failed to ${currentEntity ? 'update' : 'create'} ${entityType}`);
      }
    } catch (error) {
      console.error(`Error ${currentEntity ? 'updating' : 'creating'} ${entityType}:`, error);
      message.error(`Failed to ${currentEntity ? 'update' : 'create'} ${entityType}`);
    }
  };

  // Campaign columns
  const campaignColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: any) => (
        <Space>
          <Badge status={record.status === 'active' ? 'success' : 'default'} />
          <strong>{text}</strong>
        </Space>
      )
    },
    {
      title: 'Target URL',
      dataIndex: 'targetUrl',
      key: 'targetUrl',
      ellipsis: true
    },
    {
      title: 'Progress',
      dataIndex: 'progress',
      key: 'progress',
      render: (progress: any) => (
        <Progress percent={progress?.percentage || 0} size="small" />
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const colors = {
          draft: 'default',
          active: 'green',
          paused: 'orange',
          completed: 'blue',
          cancelled: 'red'
        };
        return <Tag color={colors[status] || 'default'}>{status.toUpperCase()}</Tag>;
      }
    },
    {
      title: 'Analytics',
      key: 'analytics',
      render: (record: any) => (
        <Space direction="vertical" size="small">
          <span>Pages: {record.analytics?.pagesProcessed || 0}/{record.analytics?.totalPages || 0}</span>
          <span>Score: {record.analytics?.avgScore || 0}%</span>
        </Space>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: any) => (
        <Space>
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleView('campaign', record)}
          />
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit('campaign', record)}
          />
          <Button
            size="small"
            icon={record.status === 'active' ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
            onClick={() => toggleCampaignStatus(record.id)}
          />
          <Popconfirm
            title="Are you sure you want to delete this campaign?"
            onConfirm={() => handleDelete('campaign', record.id)}
          >
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    }
  ];

  // Workflow columns
  const workflowColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => <Tag>{type}</Tag>
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => <Tag color={status === 'active' ? 'green' : 'default'}>{status}</Tag>
    },
    {
      title: 'Executions',
      dataIndex: 'execution',
      key: 'execution',
      render: (execution: any) => execution?.count || 0
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: any) => (
        <Space>
          <Button size="small" icon={<EyeOutlined />} onClick={() => handleView('workflow', record)} />
          <Button size="small" icon={<EditOutlined />} onClick={() => handleEdit('workflow', record)} />
          <Popconfirm title="Delete workflow?" onConfirm={() => handleDelete('workflow', record.id)}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    }
  ];

  // Service columns
  const serviceColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => <Tag icon={<ApiOutlined />}>{type}</Tag>
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const colors = { active: 'green', inactive: 'default', paused: 'orange', error: 'red' };
        return <Tag color={colors[status]}>{status}</Tag>;
      }
    },
    {
      title: 'Config',
      key: 'config',
      render: (record: any) => (
        <Space direction="vertical" size="small">
          <span>Concurrency: {record.config?.maxConcurrency || 0}</span>
          <span>Auto-start: {record.config?.autoStart ? 'Yes' : 'No'}</span>
        </Space>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: any) => (
        <Space>
          <Button size="small" icon={<EyeOutlined />} onClick={() => handleView('service', record)} />
          <Button size="small" icon={<EditOutlined />} onClick={() => handleEdit('service', record)} />
          <Popconfirm title="Delete service?" onConfirm={() => handleDelete('service', record.id)}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    }
  ];

  // Crawler columns
  const crawlerColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: 'Target URL',
      dataIndex: 'targetUrl',
      key: 'targetUrl',
      ellipsis: true
    },
    {
      title: 'Progress',
      dataIndex: 'progress',
      key: 'progress',
      render: (progress: any) => (
        <div>
          <Progress 
            percent={progress?.pagesTotal > 0 ? Math.round((progress.pagesProcessed / progress.pagesTotal) * 100) : 0} 
            size="small" 
          />
          <small>{progress?.pagesProcessed || 0} / {progress?.pagesTotal || 0} pages</small>
        </div>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const colors = { idle: 'default', running: 'blue', paused: 'orange', completed: 'green', failed: 'red' };
        return <Tag color={colors[status]}>{status}</Tag>;
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: any) => (
        <Space>
          <Button size="small" icon={<EyeOutlined />} onClick={() => handleView('crawler', record)} />
          <Button size="small" icon={<EditOutlined />} onClick={() => handleEdit('crawler', record)} />
          <Popconfirm title="Delete crawler?" onConfirm={() => handleDelete('crawler', record.id)}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    }
  ];

  // Seed columns
  const seedColumns = [
    {
      title: 'URL',
      dataIndex: 'url',
      key: 'url',
      ellipsis: true
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => <Tag>{type}</Tag>
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority: number) => <Tag color={priority >= 7 ? 'red' : priority >= 5 ? 'orange' : 'default'}>{priority}</Tag>
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => <Tag>{status}</Tag>
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: any) => (
        <Space>
          <Button size="small" icon={<EyeOutlined />} onClick={() => handleView('seed', record)} />
          <Button size="small" icon={<EditOutlined />} onClick={() => handleEdit('seed', record)} />
          <Popconfirm title="Delete seed?" onConfirm={() => handleDelete('seed', record.id)}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    }
  ];

  // Data Stream columns
  const dataStreamColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => <Tag icon={<ThunderboltOutlined />}>{type}</Tag>
    },
    {
      title: 'Source',
      dataIndex: 'source',
      key: 'source',
      render: (source: any) => <Tag>{source?.type}</Tag>
    },
    {
      title: 'Destination',
      dataIndex: 'destination',
      key: 'destination',
      render: (dest: any) => <Tag>{dest?.type}</Tag>
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const colors = { inactive: 'default', active: 'green', paused: 'orange', error: 'red' };
        return <Tag color={colors[status]}>{status}</Tag>;
      }
    },
    {
      title: 'Metrics',
      dataIndex: 'metrics',
      key: 'metrics',
      render: (metrics: any) => (
        <Space direction="vertical" size="small">
          <span>Processed: {metrics?.recordsProcessed || 0}</span>
          <span>Failed: {metrics?.recordsFailed || 0}</span>
        </Space>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: any) => (
        <Space>
          <Button size="small" icon={<EyeOutlined />} onClick={() => handleView('dataStream', record)} />
          <Button size="small" icon={<EditOutlined />} onClick={() => handleEdit('dataStream', record)} />
          <Popconfirm title="Delete data stream?" onConfirm={() => handleDelete('dataStream', record.id)}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    }
  ];

  const toggleCampaignStatus = async (id: string) => {
    try {
      await fetch(`/api/seo-campaign/campaigns/${id}/toggle`, {
        method: 'POST'
      });
      message.success('Campaign status updated');
      loadAllData();
    } catch (error) {
      message.error('Failed to update campaign status');
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Active Campaigns"
              value={campaigns.filter(c => c.status === 'active').length}
              prefix={<LineChartOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Running Workflows"
              value={workflows.filter(w => w.status === 'active').length}
              prefix={<ThunderboltOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Active Services"
              value={services.filter(s => s.status === 'active').length}
              prefix={<ApiOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Seeds"
              value={seeds.length}
              prefix={<LinkOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab={<span><LineChartOutlined /> Campaigns</span>} key="campaigns">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => handleCreate('campaign')}
              style={{ marginBottom: 16 }}
            >
              Create Campaign
            </Button>
            <Table
              dataSource={campaigns}
              columns={campaignColumns}
              rowKey="id"
              loading={loading}
            />
          </TabPane>

          <TabPane tab={<span><ThunderboltOutlined /> Workflows</span>} key="workflows">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => handleCreate('workflow')}
              style={{ marginBottom: 16 }}
            >
              Create Workflow
            </Button>
            <Table
              dataSource={workflows}
              columns={workflowColumns}
              rowKey="id"
              loading={loading}
            />
          </TabPane>

          <TabPane tab={<span><ApiOutlined /> Services</span>} key="services">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => handleCreate('service')}
              style={{ marginBottom: 16 }}
            >
              Create Service
            </Button>
            <Table
              dataSource={services}
              columns={serviceColumns}
              rowKey="id"
              loading={loading}
            />
          </TabPane>

          <TabPane tab={<span><RobotOutlined /> Crawlers</span>} key="crawlers">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => handleCreate('crawler')}
              style={{ marginBottom: 16 }}
            >
              Create Crawler
            </Button>
            <Table
              dataSource={crawlers}
              columns={crawlerColumns}
              rowKey="id"
              loading={loading}
            />
          </TabPane>

          <TabPane tab={<span><LinkOutlined /> Seeds</span>} key="seeds">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => handleCreate('seed')}
              style={{ marginBottom: 16 }}
            >
              Add Seed
            </Button>
            <Table
              dataSource={seeds}
              columns={seedColumns}
              rowKey="id"
              loading={loading}
            />
          </TabPane>

          <TabPane tab={<span><DatabaseOutlined /> Data Streams</span>} key="dataStreams">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => handleCreate('dataStream')}
              style={{ marginBottom: 16 }}
            >
              Create Data Stream
            </Button>
            <Table
              dataSource={dataStreams}
              columns={dataStreamColumns}
              rowKey="id"
              loading={loading}
            />
          </TabPane>
        </Tabs>
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        title={`${currentEntity ? 'Edit' : 'Create'} ${entityType}`}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        width={800}
        confirmLoading={loading}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          {entityType === 'campaign' && (
            <>
              <Form.Item name="name" label="Campaign Name" rules={[{ required: true }]}>
                <Input placeholder="Enter campaign name" />
              </Form.Item>
              <Form.Item name="targetUrl" label="Target URL" rules={[{ required: true, type: 'url' }]}>
                <Input placeholder="https://example.com" />
              </Form.Item>
              <Form.Item name="description" label="Description">
                <TextArea rows={3} placeholder="Campaign description" />
              </Form.Item>
              <Form.Item name="template" label="Template">
                <Select placeholder="Select template">
                  <Option value="basic">Basic SEO Audit</Option>
                  <Option value="standard">Standard SEO Campaign</Option>
                  <Option value="professional">Professional SEO Campaign</Option>
                  <Option value="enterprise">Enterprise SEO Campaign</Option>
                </Select>
              </Form.Item>
              <Form.Item name="keywords" label="Keywords">
                <Select mode="tags" placeholder="Enter keywords" />
              </Form.Item>
              <Form.Item name="competitors" label="Competitor URLs">
                <Select mode="tags" placeholder="Enter competitor URLs" />
              </Form.Item>
            </>
          )}
          {/* Add forms for other entity types as needed */}
        </Form>
      </Modal>

      {/* View Drawer */}
      <Drawer
        title={`${entityType} Details`}
        placement="right"
        width={600}
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
      >
        {currentEntity && (
          <Descriptions column={1} bordered>
            {Object.entries(currentEntity).map(([key, value]) => (
              <Descriptions.Item key={key} label={key}>
                {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
              </Descriptions.Item>
            ))}
          </Descriptions>
        )}
      </Drawer>
    </div>
  );
};

export default SEOCampaignManagementDashboard;
