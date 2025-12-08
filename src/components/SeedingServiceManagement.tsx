/**
 * Seeding Service Management Component
 * 
 * UI for managing seeding services that collect URLs for campaigns
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Button,
  Table,
  Modal,
  Form,
  Input,
  Select,
  Switch,
  message,
  Space,
  Tag,
  Typography,
  Tooltip,
  Popconfirm,
  Badge,
  Collapse,
  InputNumber
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  ApiOutlined,
  PlayCircleOutlined,
  GlobalOutlined,
  SearchOutlined
} from '@ant-design/icons';
import axios from 'axios';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { Panel } = Collapse;

interface SeedingService {
  id: string;
  name: string;
  type: string;
  description: string;
  config: any;
  status: string;
  enabled: boolean;
  urls_collected: number;
  last_run_at: string;
  created_at: string;
}

interface SeedingServiceManagementProps {
  campaignId?: string;
}

const SeedingServiceManagement: React.FC<SeedingServiceManagementProps> = ({ campaignId }) => {
  const [services, setServices] = useState<SeedingService[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState<SeedingService | null>(null);
  const [serviceType, setServiceType] = useState<string>('sitemap');
  const [form] = Form.useForm();

  // Fetch seeding services
  const fetchServices = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/campaigns/seeding-services');
      if (response.data.success) {
        setServices(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching seeding services:', error);
      message.error('Failed to fetch seeding services');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  // Handle create/edit service
  const handleSaveService = async (values: any) => {
    try {
      const config = buildConfigFromValues(values, serviceType);
      
      const payload = {
        name: values.name,
        type: serviceType,
        description: values.description,
        config
      };

      if (editingService) {
        const response = await axios.put(`/api/campaigns/seeding-services/${editingService.id}`, payload);
        if (response.data.success) {
          message.success('Seeding service updated successfully');
          fetchServices();
          setShowModal(false);
          setEditingService(null);
          form.resetFields();
        }
      } else {
        const response = await axios.post('/api/campaigns/seeding-services', payload);
        if (response.data.success) {
          message.success('Seeding service created successfully');
          fetchServices();
          setShowModal(false);
          form.resetFields();
        }
      }
    } catch (error) {
      console.error('Error saving seeding service:', error);
      message.error('Failed to save seeding service');
    }
  };

  // Build config object based on service type
  const buildConfigFromValues = (values: any, type: string) => {
    switch (type) {
      case 'sitemap':
        return {
          sitemapUrl: values.sitemapUrl,
          followSubSitemaps: values.followSubSitemaps,
          maxUrls: values.maxUrls
        };
      case 'search-results':
        return {
          searchEngine: values.searchEngine,
          query: values.query,
          maxResults: values.maxResults,
          language: values.language
        };
      case 'api':
        return {
          apiUrl: values.apiUrl,
          method: values.method,
          headers: values.headers ? JSON.parse(values.headers) : {},
          authentication: values.authentication
        };
      default:
        return {};
    }
  };

  // Handle delete service
  const handleDeleteService = async (serviceId: string) => {
    try {
      const response = await axios.delete(`/api/campaigns/seeding-services/${serviceId}`);
      if (response.data.success) {
        message.success('Seeding service deleted successfully');
        fetchServices();
      }
    } catch (error) {
      console.error('Error deleting seeding service:', error);
      message.error('Failed to delete seeding service');
    }
  };

  // Handle run seeding service
  const handleRunService = async (serviceId: string) => {
    try {
      const response = await axios.post(`/api/campaigns/seeding-services/${serviceId}/collect`, {
        campaignId
      });
      if (response.data.success) {
        message.success(`Collected ${response.data.data.urlsCollected} URLs`);
        fetchServices();
      }
    } catch (error) {
      console.error('Error running seeding service:', error);
      message.error('Failed to run seeding service');
    }
  };

  // Open edit modal
  const handleEditService = (service: SeedingService) => {
    setEditingService(service);
    setServiceType(service.type);
    
    const formValues: any = {
      name: service.name,
      description: service.description,
      ...service.config
    };

    if (service.config.headers) {
      formValues.headers = JSON.stringify(service.config.headers, null, 2);
    }

    form.setFieldsValue(formValues);
    setShowModal(true);
  };

  // Get icon for service type
  const getServiceIcon = (type: string) => {
    switch (type) {
      case 'sitemap':
        return <GlobalOutlined />;
      case 'search-results':
        return <SearchOutlined />;
      case 'api':
        return <ApiOutlined />;
      default:
        return <ApiOutlined />;
    }
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: SeedingService) => (
        <Space>
          {getServiceIcon(record.type)}
          <Text strong>{text}</Text>
        </Space>
      )
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag color="cyan">{type}</Tag>
      )
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true
    },
    {
      title: 'URLs Collected',
      dataIndex: 'urls_collected',
      key: 'urls_collected',
      render: (count: number) => (
        <Badge count={count} showZero style={{ backgroundColor: '#52c41a' }} />
      )
    },
    {
      title: 'Enabled',
      dataIndex: 'enabled',
      key: 'enabled',
      render: (enabled: boolean) => (
        <Badge
          status={enabled ? 'success' : 'default'}
          text={enabled ? 'Yes' : 'No'}
        />
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'default'}>
          {status.toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: SeedingService) => (
        <Space>
          <Tooltip title="Run Service">
            <Button
              type="link"
              icon={<PlayCircleOutlined />}
              onClick={() => handleRunService(record.id)}
              disabled={!record.enabled}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => handleEditService(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Are you sure you want to delete this service?"
            onConfirm={() => handleDeleteService(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title="Delete">
              <Button type="link" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      )
    }
  ];

  // Render config fields based on service type
  const renderConfigFields = () => {
    switch (serviceType) {
      case 'sitemap':
        return (
          <>
            <Form.Item
              name="sitemapUrl"
              label="Sitemap URL"
              rules={[{ required: true, message: 'Please enter sitemap URL' }]}
            >
              <Input placeholder="https://example.com/sitemap.xml" />
            </Form.Item>
            <Form.Item
              name="followSubSitemaps"
              label="Follow Sub-Sitemaps"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
            <Form.Item
              name="maxUrls"
              label="Maximum URLs to Collect"
            >
              <InputNumber min={1} max={10000} style={{ width: '100%' }} />
            </Form.Item>
          </>
        );
      
      case 'search-results':
        return (
          <>
            <Form.Item
              name="searchEngine"
              label="Search Engine"
              rules={[{ required: true }]}
            >
              <Select>
                <Option value="google">Google</Option>
                <Option value="bing">Bing</Option>
                <Option value="duckduckgo">DuckDuckGo</Option>
              </Select>
            </Form.Item>
            <Form.Item
              name="query"
              label="Search Query"
              rules={[{ required: true, message: 'Please enter search query' }]}
            >
              <Input placeholder="e.g., site:example.com" />
            </Form.Item>
            <Form.Item
              name="maxResults"
              label="Maximum Results"
            >
              <InputNumber min={1} max={1000} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item
              name="language"
              label="Language"
            >
              <Input placeholder="en" />
            </Form.Item>
          </>
        );
      
      case 'api':
        return (
          <>
            <Form.Item
              name="apiUrl"
              label="API URL"
              rules={[{ required: true, message: 'Please enter API URL' }]}
            >
              <Input placeholder="https://api.example.com/urls" />
            </Form.Item>
            <Form.Item
              name="method"
              label="HTTP Method"
              rules={[{ required: true }]}
            >
              <Select>
                <Option value="GET">GET</Option>
                <Option value="POST">POST</Option>
              </Select>
            </Form.Item>
            <Form.Item
              name="headers"
              label="Headers (JSON)"
            >
              <TextArea
                rows={4}
                placeholder={'{\n  "Authorization": "Bearer token",\n  "Content-Type": "application/json"\n}'}
              />
            </Form.Item>
            <Form.Item
              name="authentication"
              label="Authentication Type"
            >
              <Select allowClear>
                <Option value="none">None</Option>
                <Option value="bearer">Bearer Token</Option>
                <Option value="apikey">API Key</Option>
                <Option value="basic">Basic Auth</Option>
              </Select>
            </Form.Item>
          </>
        );
      
      default:
        return null;
    }
  };

  return (
    <Card
      title={
        <Space>
          <ApiOutlined />
          <Title level={4} style={{ margin: 0 }}>Seeding Services</Title>
        </Space>
      }
      extra={
        <Space>
          <Button
            icon={<ReloadOutlined />}
            onClick={fetchServices}
            loading={loading}
          >
            Refresh
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingService(null);
              setServiceType('sitemap');
              form.resetFields();
              setShowModal(true);
            }}
          >
            Create Service
          </Button>
        </Space>
      }
    >
      <Paragraph type="secondary">
        Seeding services automatically collect URLs from various sources like sitemaps, 
        search results, or custom APIs to feed into your crawler campaigns.
      </Paragraph>

      <Table
        columns={columns}
        dataSource={services}
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 10 }}
        expandable={{
          expandedRowRender: (record) => (
            <Collapse ghost>
              <Panel header="Configuration" key="1">
                <pre style={{ background: '#f5f5f5', padding: 12, borderRadius: 4 }}>
                  {JSON.stringify(record.config, null, 2)}
                </pre>
              </Panel>
            </Collapse>
          )
        }}
      />

      <Modal
        title={editingService ? 'Edit Seeding Service' : 'Create New Seeding Service'}
        open={showModal}
        onCancel={() => {
          setShowModal(false);
          setEditingService(null);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSaveService}
          initialValues={{
            followSubSitemaps: true,
            maxUrls: 1000,
            maxResults: 100,
            method: 'GET',
            searchEngine: 'google',
            authentication: 'none'
          }}
        >
          <Form.Item
            name="name"
            label="Service Name"
            rules={[{ required: true, message: 'Please enter service name' }]}
          >
            <Input placeholder="e.g., Main Sitemap Collector" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
          >
            <TextArea
              rows={2}
              placeholder="Describe what URLs this service collects..."
            />
          </Form.Item>

          <Form.Item
            label="Service Type"
            required
          >
            <Select
              value={serviceType}
              onChange={setServiceType}
              disabled={!!editingService}
            >
              <Option value="sitemap">
                <Space>
                  <GlobalOutlined />
                  Sitemap Parser
                </Space>
              </Option>
              <Option value="search-results">
                <Space>
                  <SearchOutlined />
                  Search Results
                </Space>
              </Option>
              <Option value="api">
                <Space>
                  <ApiOutlined />
                  Custom API
                </Space>
              </Option>
            </Select>
          </Form.Item>

          {renderConfigFields()}
        </Form>
      </Modal>
    </Card>
  );
};

export default SeedingServiceManagement;
