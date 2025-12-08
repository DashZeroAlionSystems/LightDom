/**
 * SEO Campaign Management Dashboard
 * Comprehensive SEO campaign management with attributes, seed URLs, and analytics
 */

import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Modal, 
  Form, 
  Input, 
  Select, 
  DatePicker, 
  Switch, 
  Tag, 
  Space, 
  Tabs, 
  message,
  Statistic,
  Row,
  Col,
  InputNumber,
  Divider,
  List,
  Popconfirm
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  LineChartOutlined,
  SettingOutlined,
  LinkOutlined,
  TagsOutlined
} from '@ant-design/icons';
import { seoCampaignAPI } from '@/services/apiService';

const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

interface Campaign {
  campaign_id: string;
  name: string;
  description: string;
  client_id: number;
  target_keywords: string[];
  target_urls: string[];
  industry: string;
  status: string;
  priority: string;
  start_date: string;
  end_date: string;
  schedule_cron: string;
  neural_network_enabled: boolean;
  neural_network_config: any;
  active_mining: boolean;
  mining_rules: any;
  created_by: string;
  created_at: string;
  updated_at: string;
  total_attributes?: number;
  total_workflows?: number;
  total_seed_urls?: number;
}

interface CampaignAttribute {
  attribute_key: string;
  enabled: boolean;
  mine_actively: boolean;
  priority: string;
  config: any;
}

const SEOCampaignDashboard: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [campaignModalVisible, setCampaignModalVisible] = useState(false);
  const [attributesModalVisible, setAttributesModalVisible] = useState(false);
  const [seedUrlsModalVisible, setSeedUrlsModalVisible] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  
  const [campaignAttributes, setCampaignAttributes] = useState<CampaignAttribute[]>([]);
  const [campaignSeedUrls, setCampaignSeedUrls] = useState<string[]>([]);
  const [campaignStats, setCampaignStats] = useState<any>(null);
  
  const [form] = Form.useForm();
  const [attributeForm] = Form.useForm();
  const [seedUrlForm] = Form.useForm();

  // Load campaigns on mount
  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    setLoading(true);
    try {
      const response = await seoCampaignAPI.getCampaigns();
      setCampaigns(response.data || []);
    } catch (error) {
      message.error('Failed to load campaigns');
      console.error('Error loading campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCampaignDetails = async (campaignId: string) => {
    try {
      const [details, attributes, seedUrls, stats] = await Promise.all([
        seoCampaignAPI.getCampaign(campaignId),
        seoCampaignAPI.getCampaignAttributes(campaignId),
        seoCampaignAPI.getCampaignSeedUrls(campaignId),
        seoCampaignAPI.getCampaignStats(campaignId)
      ]);
      
      setSelectedCampaign(details.data);
      setCampaignAttributes(attributes.data || []);
      setCampaignSeedUrls(seedUrls.data || []);
      setCampaignStats(stats.data);
    } catch (error) {
      message.error('Failed to load campaign details');
      console.error('Error loading campaign details:', error);
    }
  };

  const handleCreateCampaign = () => {
    setEditingCampaign(null);
    form.resetFields();
    setCampaignModalVisible(true);
  };

  const handleEditCampaign = (campaign: Campaign) => {
    setEditingCampaign(campaign);
    form.setFieldsValue({
      ...campaign,
      date_range: campaign.start_date && campaign.end_date 
        ? [campaign.start_date, campaign.end_date]
        : undefined
    });
    setCampaignModalVisible(true);
  };

  const handleDeleteCampaign = async (campaignId: string) => {
    try {
      await seoCampaignAPI.deleteCampaign(campaignId);
      message.success('Campaign deleted successfully');
      loadCampaigns();
    } catch (error) {
      message.error('Failed to delete campaign');
      console.error('Error deleting campaign:', error);
    }
  };

  const handleCampaignSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      const campaignData = {
        ...values,
        start_date: values.date_range?.[0]?.format('YYYY-MM-DD'),
        end_date: values.date_range?.[1]?.format('YYYY-MM-DD'),
      };
      delete campaignData.date_range;
      
      if (editingCampaign) {
        await seoCampaignAPI.updateCampaign(editingCampaign.campaign_id, campaignData);
        message.success('Campaign updated successfully');
      } else {
        await seoCampaignAPI.createCampaign(campaignData);
        message.success('Campaign created successfully');
      }
      
      setCampaignModalVisible(false);
      form.resetFields();
      loadCampaigns();
    } catch (error) {
      message.error('Failed to save campaign');
      console.error('Error saving campaign:', error);
    }
  };

  const handleManageAttributes = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    loadCampaignDetails(campaign.campaign_id);
    setAttributesModalVisible(true);
  };

  const handleManageSeedUrls = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    loadCampaignDetails(campaign.campaign_id);
    setSeedUrlsModalVisible(true);
  };

  const handleAddAttributes = async () => {
    try {
      const values = await attributeForm.validateFields();
      await seoCampaignAPI.addCampaignAttributes(selectedCampaign!.campaign_id, [values]);
      message.success('Attribute added successfully');
      attributeForm.resetFields();
      loadCampaignDetails(selectedCampaign!.campaign_id);
    } catch (error) {
      message.error('Failed to add attribute');
      console.error('Error adding attribute:', error);
    }
  };

  const handleDeleteAttribute = async (attributeKey: string) => {
    try {
      await seoCampaignAPI.deleteCampaignAttribute(selectedCampaign!.campaign_id, attributeKey);
      message.success('Attribute deleted successfully');
      loadCampaignDetails(selectedCampaign!.campaign_id);
    } catch (error) {
      message.error('Failed to delete attribute');
      console.error('Error deleting attribute:', error);
    }
  };

  const handleAddSeedUrls = async () => {
    try {
      const values = await seedUrlForm.validateFields();
      const urls = values.urls.split('\n').filter((url: string) => url.trim());
      await seoCampaignAPI.addCampaignSeedUrls(selectedCampaign!.campaign_id, urls);
      message.success('Seed URLs added successfully');
      seedUrlForm.resetFields();
      loadCampaignDetails(selectedCampaign!.campaign_id);
    } catch (error) {
      message.error('Failed to add seed URLs');
      console.error('Error adding seed URLs:', error);
    }
  };

  const campaignColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Campaign) => (
        <Space>
          <strong>{text}</strong>
          {record.neural_network_enabled && (
            <Tag color="blue">Neural</Tag>
          )}
          {record.active_mining && (
            <Tag color="green">Active Mining</Tag>
          )}
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const colorMap: Record<string, string> = {
          draft: 'default',
          active: 'success',
          paused: 'warning',
          completed: 'blue',
          cancelled: 'error'
        };
        return <Tag color={colorMap[status] || 'default'}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority: string) => {
        const colorMap: Record<string, string> = {
          low: 'default',
          medium: 'blue',
          high: 'orange',
          critical: 'red'
        };
        return <Tag color={colorMap[priority] || 'default'}>{priority.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Industry',
      dataIndex: 'industry',
      key: 'industry',
    },
    {
      title: 'Attributes',
      dataIndex: 'total_attributes',
      key: 'total_attributes',
      render: (count: number) => count || 0,
    },
    {
      title: 'Workflows',
      dataIndex: 'total_workflows',
      key: 'total_workflows',
      render: (count: number) => count || 0,
    },
    {
      title: 'Seed URLs',
      dataIndex: 'total_seed_urls',
      key: 'total_seed_urls',
      render: (count: number) => count || 0,
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Campaign) => (
        <Space>
          <Button
            type="link"
            icon={<TagsOutlined />}
            onClick={() => handleManageAttributes(record)}
            size="small"
          >
            Attributes
          </Button>
          <Button
            type="link"
            icon={<LinkOutlined />}
            onClick={() => handleManageSeedUrls(record)}
            size="small"
          >
            URLs
          </Button>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEditCampaign(record)}
            size="small"
          />
          <Popconfirm
            title="Delete this campaign?"
            onConfirm={() => handleDeleteCampaign(record.campaign_id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
              size="small"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const attributeColumns = [
    {
      title: 'Attribute Key',
      dataIndex: 'attribute_key',
      key: 'attribute_key',
    },
    {
      title: 'Enabled',
      dataIndex: 'enabled',
      key: 'enabled',
      render: (enabled: boolean) => (
        <Tag color={enabled ? 'green' : 'default'}>{enabled ? 'Yes' : 'No'}</Tag>
      ),
    },
    {
      title: 'Active Mining',
      dataIndex: 'mine_actively',
      key: 'mine_actively',
      render: (active: boolean) => (
        <Tag color={active ? 'blue' : 'default'}>{active ? 'Yes' : 'No'}</Tag>
      ),
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority: string) => <Tag>{priority?.toUpperCase() || 'MEDIUM'}</Tag>,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: CampaignAttribute) => (
        <Popconfirm
          title="Delete this attribute?"
          onConfirm={() => handleDeleteAttribute(record.attribute_key)}
          okText="Yes"
          cancelText="No"
        >
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            size="small"
          />
        </Popconfirm>
      ),
    },
  ];

  // Calculate summary statistics
  const totalCampaigns = campaigns.length;
  const activeCampaigns = campaigns.filter(c => c.status === 'active').length;
  const totalAttributes = campaigns.reduce((sum, c) => sum + (c.total_attributes || 0), 0);
  const totalSeedUrls = campaigns.reduce((sum, c) => sum + (c.total_seed_urls || 0), 0);

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1>SEO Campaign Management</h1>
            <Space>
              <Button
                type="default"
                icon={<ReloadOutlined />}
                onClick={loadCampaigns}
                loading={loading}
              >
                Refresh
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleCreateCampaign}
              >
                Create Campaign
              </Button>
            </Space>
          </div>

          <Row gutter={16}>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Total Campaigns"
                  value={totalCampaigns}
                  prefix={<LineChartOutlined />}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Active Campaigns"
                  value={activeCampaigns}
                  valueStyle={{ color: '#3f8600' }}
                  prefix={<LineChartOutlined />}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Total Attributes"
                  value={totalAttributes}
                  prefix={<TagsOutlined />}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Seed URLs"
                  value={totalSeedUrls}
                  prefix={<LinkOutlined />}
                />
              </Card>
            </Col>
          </Row>

          <Table
            columns={campaignColumns}
            dataSource={campaigns}
            rowKey="campaign_id"
            loading={loading}
            pagination={{ pageSize: 10 }}
          />
        </Space>
      </Card>

      {/* Create/Edit Campaign Modal */}
      <Modal
        title={editingCampaign ? 'Edit Campaign' : 'Create Campaign'}
        open={campaignModalVisible}
        onOk={handleCampaignSubmit}
        onCancel={() => {
          setCampaignModalVisible(false);
          form.resetFields();
        }}
        width={800}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Campaign Name"
            rules={[{ required: true, message: 'Please enter campaign name' }]}
          >
            <Input placeholder="Enter campaign name" />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <TextArea rows={3} placeholder="Enter campaign description" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="client_id" label="Client ID">
                <InputNumber style={{ width: '100%' }} placeholder="Enter client ID" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="industry" label="Industry">
                <Input placeholder="e.g., Technology, Healthcare" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="status" label="Status" initialValue="draft">
                <Select>
                  <Option value="draft">Draft</Option>
                  <Option value="active">Active</Option>
                  <Option value="paused">Paused</Option>
                  <Option value="completed">Completed</Option>
                  <Option value="cancelled">Cancelled</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="priority" label="Priority" initialValue="medium">
                <Select>
                  <Option value="low">Low</Option>
                  <Option value="medium">Medium</Option>
                  <Option value="high">High</Option>
                  <Option value="critical">Critical</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="date_range" label="Campaign Duration">
            <RangePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="schedule_cron" label="Schedule (Cron Expression)">
            <Input placeholder="e.g., 0 0 * * * (daily at midnight)" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="neural_network_enabled" label="Neural Network" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="active_mining" label="Active Mining" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="target_keywords" label="Target Keywords">
            <Select mode="tags" placeholder="Enter keywords" />
          </Form.Item>

          <Form.Item name="target_urls" label="Target URLs">
            <Select mode="tags" placeholder="Enter URLs" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Attributes Modal */}
      <Modal
        title={`Manage Attributes - ${selectedCampaign?.name}`}
        open={attributesModalVisible}
        onCancel={() => setAttributesModalVisible(false)}
        footer={null}
        width={900}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Card title="Add New Attribute" size="small">
            <Form form={attributeForm} layout="inline">
              <Form.Item name="attribute_key" rules={[{ required: true }]}>
                <Input placeholder="Attribute Key" style={{ width: 200 }} />
              </Form.Item>
              <Form.Item name="enabled" valuePropName="checked" initialValue={true}>
                <Switch checkedChildren="Enabled" unCheckedChildren="Disabled" />
              </Form.Item>
              <Form.Item name="mine_actively" valuePropName="checked" initialValue={false}>
                <Switch checkedChildren="Active Mining" unCheckedChildren="Passive" />
              </Form.Item>
              <Form.Item name="priority" initialValue="medium">
                <Select style={{ width: 120 }}>
                  <Option value="low">Low</Option>
                  <Option value="medium">Medium</Option>
                  <Option value="high">High</Option>
                </Select>
              </Form.Item>
              <Button type="primary" onClick={handleAddAttributes}>
                Add
              </Button>
            </Form>
          </Card>

          <Table
            columns={attributeColumns}
            dataSource={campaignAttributes}
            rowKey="attribute_key"
            pagination={false}
            size="small"
          />
        </Space>
      </Modal>

      {/* Seed URLs Modal */}
      <Modal
        title={`Manage Seed URLs - ${selectedCampaign?.name}`}
        open={seedUrlsModalVisible}
        onCancel={() => setSeedUrlsModalVisible(false)}
        footer={null}
        width={700}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Card title="Add Seed URLs" size="small">
            <Form form={seedUrlForm} layout="vertical">
              <Form.Item
                name="urls"
                rules={[{ required: true, message: 'Please enter at least one URL' }]}
              >
                <TextArea
                  rows={5}
                  placeholder="Enter URLs (one per line)"
                />
              </Form.Item>
              <Button type="primary" onClick={handleAddSeedUrls} block>
                Add URLs
              </Button>
            </Form>
          </Card>

          <Card title={`Current Seed URLs (${campaignSeedUrls.length})`} size="small">
            <List
              size="small"
              dataSource={campaignSeedUrls}
              renderItem={(url) => (
                <List.Item>
                  <a href={url} target="_blank" rel="noopener noreferrer">
                    {url}
                  </a>
                </List.Item>
              )}
              style={{ maxHeight: 300, overflow: 'auto' }}
            />
          </Card>
        </Space>
      </Modal>
    </div>
  );
};

export default SEOCampaignDashboard;
