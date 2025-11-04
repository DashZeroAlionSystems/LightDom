/**
 * Agent Management Dashboard
 * Comprehensive dashboard for managing agents, tools, services, workflows, campaigns, and data streams
 */

import React, { useState, useEffect } from 'react';
import {
  Layout,
  Card,
  Tabs,
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  Switch,
  InputNumber,
  Descriptions,
  Progress,
  Statistic,
  Row,
  Col,
  message,
  Drawer,
  Tree,
  Timeline,
  Badge
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  PlayCircleOutlined,
  SettingOutlined,
  ApiOutlined,
  RobotOutlined,
  FunctionOutlined,
  AppstoreOutlined,
  BranchesOutlined,
  ThunderboltOutlined,
  DatabaseOutlined,
  EyeOutlined,
  SyncOutlined
} from '@ant-design/icons';
import axios from 'axios';

const { Content } = Layout;
const { TabPane } = Tabs;
const { TextArea } = Input;

export const AgentManagementDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('sessions');
  const [sessions, setSessions] = useState([]);
  const [instances, setInstances] = useState([]);
  const [tools, setTools] = useState([]);
  const [services, setServices] = useState([]);
  const [workflows, setWorkflows] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [dataStreams, setDataStreams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      switch (activeTab) {
        case 'sessions':
          await loadSessions();
          break;
        case 'instances':
          await loadInstances();
          break;
        case 'tools':
          await loadTools();
          break;
        case 'services':
          await loadServices();
          break;
        case 'workflows':
          await loadWorkflows();
          break;
        case 'campaigns':
          await loadCampaigns();
          break;
        case 'dataStreams':
          await loadDataStreams();
          break;
      }
    } catch (error) {
      console.error('Error loading data:', error);
      message.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const loadSessions = async () => {
    const response = await axios.get('/api/agent/sessions');
    setSessions(response.data);
  };

  const loadInstances = async () => {
    const response = await axios.get('/api/agent/instances');
    setInstances(response.data);
  };

  const loadTools = async () => {
    const response = await axios.get('/api/agent/tools');
    setTools(response.data);
  };

  const loadServices = async () => {
    const response = await axios.get('/api/agent/services');
    setServices(response.data);
  };

  const loadWorkflows = async () => {
    const response = await axios.get('/api/agent/workflows');
    setWorkflows(response.data);
  };

  const loadCampaigns = async () => {
    const response = await axios.get('/api/agent/campaigns');
    setCampaigns(response.data);
  };

  const loadDataStreams = async () => {
    const response = await axios.get('/api/agent/data-streams');
    setDataStreams(response.data);
  };

  const handleCreate = () => {
    form.resetFields();
    setSelectedItem(null);
    setModalVisible(true);
  };

  const handleEdit = (item: any) => {
    setSelectedItem(item);
    form.setFieldsValue(item);
    setModalVisible(true);
  };

  const handleDelete = async (id: string, type: string) => {
    Modal.confirm({
      title: 'Are you sure?',
      content: 'This action cannot be undone.',
      onOk: async () => {
        try {
          await axios.delete(`/api/agent/${type}/${id}`);
          message.success('Deleted successfully');
          loadData();
        } catch (error) {
          message.error('Failed to delete');
        }
      }
    });
  };

  const handleSave = async (values: any) => {
    try {
      if (selectedItem) {
        await axios.patch(`/api/agent/${activeTab}/${selectedItem.id}`, values);
        message.success('Updated successfully');
      } else {
        await axios.post(`/api/agent/${activeTab}`, values);
        message.success('Created successfully');
      }
      setModalVisible(false);
      loadData();
    } catch (error) {
      message.error('Failed to save');
    }
  };

  const handleViewDetails = (item: any) => {
    setSelectedItem(item);
    setDetailDrawerVisible(true);
  };

  const sessionColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: 'Agent Type',
      dataIndex: 'agent_type',
      key: 'agent_type',
      render: (type: string) => <Tag color="blue">{type}</Tag>
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'default'}>{status}</Tag>
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
      render: (_: any, record: any) => (
        <Space>
          <Button icon={<EyeOutlined />} size="small" onClick={() => handleViewDetails(record)} />
          <Button icon={<EditOutlined />} size="small" onClick={() => handleEdit(record)} />
          <Button icon={<DeleteOutlined />} size="small" danger onClick={() => handleDelete(record.session_id, 'sessions')} />
        </Space>
      )
    }
  ];

  const instanceColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: 'Model',
      dataIndex: 'model_name',
      key: 'model_name'
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Badge
          status={status === 'ready' ? 'success' : status === 'busy' ? 'processing' : 'default'}
          text={status}
        />
      )
    },
    {
      title: 'Temperature',
      dataIndex: 'temperature',
      key: 'temperature'
    },
    {
      title: 'Max Tokens',
      dataIndex: 'max_tokens',
      key: 'max_tokens'
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space>
          <Button icon={<EyeOutlined />} size="small" onClick={() => handleViewDetails(record)} />
          <Button icon={<EditOutlined />} size="small" onClick={() => handleEdit(record)} />
          <Button icon={<DeleteOutlined />} size="small" danger onClick={() => handleDelete(record.instance_id, 'instances')} />
        </Space>
      )
    }
  ];

  const toolColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (cat: string) => <Tag>{cat}</Tag>
    },
    {
      title: 'Service Type',
      dataIndex: 'service_type',
      key: 'service_type'
    },
    {
      title: 'Active',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (active: boolean) => (
        <Tag color={active ? 'green' : 'red'}>{active ? 'Yes' : 'No'}</Tag>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space>
          <Button icon={<EyeOutlined />} size="small" onClick={() => handleViewDetails(record)} />
          <Button icon={<EditOutlined />} size="small" onClick={() => handleEdit(record)} />
          <Button icon={<DeleteOutlined />} size="small" danger onClick={() => handleDelete(record.tool_id, 'tools')} />
        </Space>
      )
    }
  ];

  const serviceColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (cat: string) => <Tag>{cat}</Tag>
    },
    {
      title: 'Tools Count',
      dataIndex: 'tools',
      key: 'tools_count',
      render: (tools: any[]) => tools?.length || 0
    },
    {
      title: 'Active',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (active: boolean) => (
        <Tag color={active ? 'green' : 'red'}>{active ? 'Yes' : 'No'}</Tag>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space>
          <Button icon={<EyeOutlined />} size="small" onClick={() => handleViewDetails(record)} />
          <Button icon={<EditOutlined />} size="small" onClick={() => handleEdit(record)} />
          <Button icon={<DeleteOutlined />} size="small" danger onClick={() => handleDelete(record.service_id, 'services')} />
        </Space>
      )
    }
  ];

  const workflowColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: 'Type',
      dataIndex: 'workflow_type',
      key: 'workflow_type',
      render: (type: string) => <Tag color="purple">{type}</Tag>
    },
    {
      title: 'Steps',
      dataIndex: 'steps',
      key: 'steps_count',
      render: (steps: any[]) => steps?.length || 0
    },
    {
      title: 'Template',
      dataIndex: 'is_template',
      key: 'is_template',
      render: (isTemplate: boolean) => isTemplate ? <Tag color="blue">Template</Tag> : null
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space>
          <Button icon={<PlayCircleOutlined />} size="small" />
          <Button icon={<EyeOutlined />} size="small" onClick={() => handleViewDetails(record)} />
          <Button icon={<EditOutlined />} size="small" onClick={() => handleEdit(record)} />
          <Button icon={<DeleteOutlined />} size="small" danger onClick={() => handleDelete(record.workflow_id, 'workflows')} />
        </Space>
      )
    }
  ];

  const campaignColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: 'Type',
      dataIndex: 'campaign_type',
      key: 'campaign_type',
      render: (type: string) => <Tag>{type}</Tag>
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : status === 'completed' ? 'blue' : 'default'}>
          {status}
        </Tag>
      )
    },
    {
      title: 'Workflows',
      dataIndex: 'workflows',
      key: 'workflows_count',
      render: (workflows: any[]) => workflows?.length || 0
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space>
          <Button icon={<PlayCircleOutlined />} size="small" />
          <Button icon={<EyeOutlined />} size="small" onClick={() => handleViewDetails(record)} />
          <Button icon={<EditOutlined />} size="small" onClick={() => handleEdit(record)} />
          <Button icon={<DeleteOutlined />} size="small" danger onClick={() => handleDelete(record.campaign_id, 'campaigns')} />
        </Space>
      )
    }
  ];

  const streamColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: 'Type',
      dataIndex: 'stream_type',
      key: 'stream_type',
      render: (type: string) => <Tag>{type}</Tag>
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Badge
          status={status === 'active' ? 'processing' : 'default'}
          text={status}
        />
      )
    },
    {
      title: 'Attributes',
      dataIndex: 'attributes',
      key: 'attributes_count',
      render: (attrs: any[]) => attrs?.length || 0
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space>
          <Button icon={<EyeOutlined />} size="small" onClick={() => handleViewDetails(record)} />
          <Button icon={<EditOutlined />} size="small" onClick={() => handleEdit(record)} />
          <Button icon={<DeleteOutlined />} size="small" danger onClick={() => handleDelete(record.stream_id, 'data-streams')} />
        </Space>
      )
    }
  ];

  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Content style={{ padding: '24px' }}>
        <Card
          title={
            <Space>
              <RobotOutlined style={{ fontSize: 24 }} />
              <span style={{ fontSize: 20, fontWeight: 600 }}>Agent Management Dashboard</span>
            </Space>
          }
          extra={
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreate}
            >
              Create New
            </Button>
          }
        >
          <Tabs activeKey={activeTab} onChange={setActiveTab}>
            <TabPane
              tab={<Space><RobotOutlined />Sessions</Space>}
              key="sessions"
            >
              <Table
                dataSource={sessions}
                columns={sessionColumns}
                loading={loading}
                rowKey="session_id"
              />
            </TabPane>

            <TabPane
              tab={<Space><ApiOutlined />Instances</Space>}
              key="instances"
            >
              <Table
                dataSource={instances}
                columns={instanceColumns}
                loading={loading}
                rowKey="instance_id"
              />
            </TabPane>

            <TabPane
              tab={<Space><FunctionOutlined />Tools</Space>}
              key="tools"
            >
              <Table
                dataSource={tools}
                columns={toolColumns}
                loading={loading}
                rowKey="tool_id"
              />
            </TabPane>

            <TabPane
              tab={<Space><AppstoreOutlined />Services</Space>}
              key="services"
            >
              <Table
                dataSource={services}
                columns={serviceColumns}
                loading={loading}
                rowKey="service_id"
              />
            </TabPane>

            <TabPane
              tab={<Space><BranchesOutlined />Workflows</Space>}
              key="workflows"
            >
              <Table
                dataSource={workflows}
                columns={workflowColumns}
                loading={loading}
                rowKey="workflow_id"
              />
            </TabPane>

            <TabPane
              tab={<Space><ThunderboltOutlined />Campaigns</Space>}
              key="campaigns"
            >
              <Table
                dataSource={campaigns}
                columns={campaignColumns}
                loading={loading}
                rowKey="campaign_id"
              />
            </TabPane>

            <TabPane
              tab={<Space><DatabaseOutlined />Data Streams</Space>}
              key="dataStreams"
            >
              <Table
                dataSource={dataStreams}
                columns={streamColumns}
                loading={loading}
                rowKey="stream_id"
              />
            </TabPane>
          </Tabs>
        </Card>

        <Modal
          title={selectedItem ? 'Edit' : 'Create New'}
          open={modalVisible}
          onCancel={() => setModalVisible(false)}
          onOk={() => form.submit()}
          width={700}
        >
          <Form form={form} layout="vertical" onFinish={handleSave}>
            {/* Form fields would be dynamic based on activeTab */}
            <Form.Item name="name" label="Name" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="description" label="Description">
              <TextArea rows={3} />
            </Form.Item>
          </Form>
        </Modal>

        <Drawer
          title="Details"
          placement="right"
          width={600}
          open={detailDrawerVisible}
          onClose={() => setDetailDrawerVisible(false)}
        >
          {selectedItem && (
            <Descriptions column={1} bordered>
              {Object.entries(selectedItem).map(([key, value]) => (
                <Descriptions.Item key={key} label={key}>
                  {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                </Descriptions.Item>
              ))}
            </Descriptions>
          )}
        </Drawer>
      </Content>
    </Layout>
  );
};
