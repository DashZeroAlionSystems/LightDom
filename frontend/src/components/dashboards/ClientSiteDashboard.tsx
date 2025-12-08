import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Form, Input, Select, Tag, Space, message, Tabs, Descriptions, Switch, Typography } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, CodeOutlined, ThunderboltOutlined, EyeOutlined, ReloadOutlined } from '@ant-design/icons';
import { clientSiteAPI } from '../../services/apiService';

const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;
const { Title, Text, Paragraph } = Typography;

interface ClientSite {
  id: number;
  domain: string;
  user_id: string;
  subscription_tier: string;
  api_key: string;
  script_generated: boolean;
  created_at: string;
  updated_at: string;
  config?: any;
}

interface InjectionStatus {
  detected: boolean;
  lastChecked: string;
  scriptVersion?: string;
  loadTime?: number;
}

const ClientSiteDashboard: React.FC = () => {
  const [sites, setSites] = useState<ClientSite[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingSite, setEditingSite] = useState<ClientSite | null>(null);
  const [scriptModalVisible, setScriptModalVisible] = useState(false);
  const [workflowModalVisible, setWorkflowModalVisible] = useState(false);
  const [selectedSite, setSelectedSite] = useState<ClientSite | null>(null);
  const [generatedScript, setGeneratedScript] = useState<string>('');
  const [workflowResult, setWorkflowResult] = useState<any>(null);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [injectionStatus, setInjectionStatus] = useState<InjectionStatus | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchSites();
  }, []);

  const fetchSites = async () => {
    try {
      setLoading(true);
      const data = await clientSiteAPI.getSites();
      setSites(data.sites || []);
    } catch (error) {
      message.error('Failed to fetch client sites');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingSite(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (site: ClientSite) => {
    setEditingSite(site);
    form.setFieldsValue({
      domain: site.domain,
      userId: site.user_id,
      subscriptionTier: site.subscription_tier,
      config: site.config ? JSON.stringify(site.config, null, 2) : ''
    });
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this site?',
      content: 'This action cannot be undone.',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk: async () => {
        try {
          await clientSiteAPI.deleteSite(id);
          message.success('Site deleted successfully');
          fetchSites();
        } catch (error) {
          message.error('Failed to delete site');
          console.error(error);
        }
      }
    });
  };

  const handleSubmit = async (values: any) => {
    try {
      const payload = {
        domain: values.domain,
        userId: values.userId,
        subscriptionTier: values.subscriptionTier,
        config: values.config ? JSON.parse(values.config) : {}
      };

      if (editingSite) {
        await clientSiteAPI.updateSite(editingSite.id, payload);
        message.success('Site updated successfully');
      } else {
        await clientSiteAPI.createSite(payload);
        message.success('Site created successfully');
      }

      setModalVisible(false);
      form.resetFields();
      fetchSites();
    } catch (error) {
      message.error(`Failed to ${editingSite ? 'update' : 'create'} site`);
      console.error(error);
    }
  };

  const handleGenerateScript = async (site: ClientSite) => {
    try {
      setLoading(true);
      const result = await clientSiteAPI.generateScript(site.id);
      setGeneratedScript(result.script || '');
      setSelectedSite(site);
      setScriptModalVisible(true);
    } catch (error) {
      message.error('Failed to generate script');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWorkflow = async (site: ClientSite, useDeepseek = false) => {
    try {
      setLoading(true);
      const result = useDeepseek
        ? await clientSiteAPI.createWorkflowsDeepseek(site.id)
        : await clientSiteAPI.createWorkflows(site.id);
      setWorkflowResult(result);
      setSelectedSite(site);
      setWorkflowModalVisible(true);
      message.success('Workflow created successfully');
    } catch (error) {
      message.error('Failed to create workflow');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckInjectionStatus = async (site: ClientSite) => {
    try {
      setLoading(true);
      const status = await clientSiteAPI.getInjectionStatus(site.id);
      setInjectionStatus(status);
      setSelectedSite(site);
      setStatusModalVisible(true);
    } catch (error) {
      message.error('Failed to check injection status');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Domain',
      dataIndex: 'domain',
      key: 'domain',
      render: (text: string) => <Text strong>{text}</Text>
    },
    {
      title: 'User ID',
      dataIndex: 'user_id',
      key: 'user_id'
    },
    {
      title: 'Subscription',
      dataIndex: 'subscription_tier',
      key: 'subscription_tier',
      render: (tier: string) => {
        const color = tier === 'premium' ? 'gold' : tier === 'pro' ? 'blue' : 'default';
        return <Tag color={color}>{tier?.toUpperCase()}</Tag>;
      }
    },
    {
      title: 'Script',
      dataIndex: 'script_generated',
      key: 'script_generated',
      render: (generated: boolean) => (
        <Tag color={generated ? 'green' : 'red'}>
          {generated ? 'Generated' : 'Not Generated'}
        </Tag>
      )
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => new Date(date).toLocaleDateString()
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: ClientSite) => (
        <Space>
          <Button
            type="text"
            icon={<CodeOutlined />}
            onClick={() => handleGenerateScript(record)}
            title="Generate Script"
          />
          <Button
            type="text"
            icon={<ThunderboltOutlined />}
            onClick={() => handleCreateWorkflow(record)}
            title="Create Workflow"
          />
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handleCheckInjectionStatus(record)}
            title="Check Status"
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          />
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={2}>Client Site Management</Title>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchSites}>
            Refresh
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            Add Site
          </Button>
        </Space>
      </div>

      <Tabs defaultActiveKey="sites">
        <TabPane tab="Sites" key="sites">
          <Card>
            <Table
              dataSource={sites}
              columns={columns}
              loading={loading}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </TabPane>

        <TabPane tab="Statistics" key="statistics">
          <Card title="Overview">
            <Descriptions column={2}>
              <Descriptions.Item label="Total Sites">{sites.length}</Descriptions.Item>
              <Descriptions.Item label="Scripts Generated">
                {sites.filter(s => s.script_generated).length}
              </Descriptions.Item>
              <Descriptions.Item label="Premium Sites">
                {sites.filter(s => s.subscription_tier === 'premium').length}
              </Descriptions.Item>
              <Descriptions.Item label="Pro Sites">
                {sites.filter(s => s.subscription_tier === 'pro').length}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </TabPane>
      </Tabs>

      {/* Create/Edit Modal */}
      <Modal
        title={editingSite ? 'Edit Site' : 'Create Site'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="Domain"
            name="domain"
            rules={[{ required: true, message: 'Please enter domain' }]}
          >
            <Input placeholder="example.com" />
          </Form.Item>

          <Form.Item
            label="User ID"
            name="userId"
            rules={[{ required: true, message: 'Please enter user ID' }]}
          >
            <Input placeholder="user-123" />
          </Form.Item>

          <Form.Item
            label="Subscription Tier"
            name="subscriptionTier"
            rules={[{ required: true, message: 'Please select subscription tier' }]}
          >
            <Select placeholder="Select tier">
              <Option value="free">Free</Option>
              <Option value="pro">Pro</Option>
              <Option value="premium">Premium</Option>
            </Select>
          </Form.Item>

          <Form.Item label="Config (JSON)" name="config">
            <TextArea rows={6} placeholder='{"key": "value"}' />
          </Form.Item>
        </Form>
      </Modal>

      {/* Script Modal */}
      <Modal
        title={`Generated Script for ${selectedSite?.domain}`}
        open={scriptModalVisible}
        onCancel={() => setScriptModalVisible(false)}
        width={800}
        footer={[
          <Button key="copy" onClick={() => {
            navigator.clipboard.writeText(generatedScript);
            message.success('Script copied to clipboard');
          }}>
            Copy Script
          </Button>,
          <Button key="close" onClick={() => setScriptModalVisible(false)}>
            Close
          </Button>
        ]}
      >
        <Card>
          <Paragraph>
            <Text type="secondary">Add this script to your site's header:</Text>
          </Paragraph>
          <pre style={{
            background: '#f5f5f5',
            padding: '16px',
            borderRadius: '4px',
            overflow: 'auto',
            maxHeight: '400px'
          }}>
            {generatedScript}
          </pre>
        </Card>
      </Modal>

      {/* Workflow Modal */}
      <Modal
        title={`Workflow Created for ${selectedSite?.domain}`}
        open={workflowModalVisible}
        onCancel={() => setWorkflowModalVisible(false)}
        width={800}
        footer={[
          <Button key="close" onClick={() => setWorkflowModalVisible(false)}>
            Close
          </Button>
        ]}
      >
        <Card>
          {workflowResult && (
            <Descriptions column={1} bordered>
              <Descriptions.Item label="Workflow ID">
                {workflowResult.workflowId || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color="green">{workflowResult.status || 'Created'}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Message">
                {workflowResult.message || 'Workflow created successfully'}
              </Descriptions.Item>
            </Descriptions>
          )}
        </Card>
      </Modal>

      {/* Injection Status Modal */}
      <Modal
        title={`Injection Status for ${selectedSite?.domain}`}
        open={statusModalVisible}
        onCancel={() => setStatusModalVisible(false)}
        width={600}
        footer={[
          <Button
            key="refresh"
            icon={<ReloadOutlined />}
            onClick={() => selectedSite && handleCheckInjectionStatus(selectedSite)}
          >
            Refresh
          </Button>,
          <Button key="close" onClick={() => setStatusModalVisible(false)}>
            Close
          </Button>
        ]}
      >
        <Card>
          {injectionStatus && (
            <Descriptions column={1} bordered>
              <Descriptions.Item label="Detected">
                <Tag color={injectionStatus.detected ? 'green' : 'red'}>
                  {injectionStatus.detected ? 'Yes' : 'No'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Last Checked">
                {injectionStatus.lastChecked ? new Date(injectionStatus.lastChecked).toLocaleString() : 'N/A'}
              </Descriptions.Item>
              {injectionStatus.scriptVersion && (
                <Descriptions.Item label="Script Version">
                  {injectionStatus.scriptVersion}
                </Descriptions.Item>
              )}
              {injectionStatus.loadTime && (
                <Descriptions.Item label="Load Time">
                  {injectionStatus.loadTime}ms
                </Descriptions.Item>
              )}
            </Descriptions>
          )}
        </Card>
      </Modal>
    </div>
  );
};

export default ClientSiteDashboard;
