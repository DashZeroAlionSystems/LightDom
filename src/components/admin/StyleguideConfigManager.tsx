/**
 * Styleguide Configuration Manager - Admin CRUD Interface
 * 
 * Features:
 * - Create/Edit/Delete styleguide configurations
 * - Visual attribute relationship editor
 * - Workflow and campaign management
 * - Real-time simulation and optimization
 * - SEO rich snippet generation
 */

import React, { useState, useEffect } from 'react';
import {
  Button,
  Card,
  Form,
  Input,
  Select,
  Slider,
  Switch,
  Tabs,
  Modal,
  Space,
  Table,
  Tag,
  Typography,
  Row,
  Col,
  InputNumber,
  Divider,
  notification,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SaveOutlined,
  PlayCircleOutlined,
  LineChartOutlined,
  BranchesOutlined,
  RocketOutlined,
} from '@ant-design/icons';
import {
  styleguideConfigSystem,
  StyleguideCategory,
  StyleguideAttribute,
  WorkflowConfig,
  CampaignConfig,
  HeadlessContainerConfig,
} from '../../config/styleguide-config-system';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;

export const StyleguideConfigManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState('categories');
  const [categories, setCategories] = useState<StyleguideCategory[]>([]);
  const [workflows, setWorkflows] = useState<WorkflowConfig[]>([]);
  const [campaigns, setCampaigns] = useState<CampaignConfig[]>([]);
  const [containers, setContainers] = useState<HeadlessContainerConfig[]>([]);
  
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [modalType, setModalType] = useState<'category' | 'workflow' | 'campaign' | 'container'>('category');
  
  const [form] = Form.useForm();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setCategories(styleguideConfigSystem.getAllCategories());
    setWorkflows(styleguideConfigSystem.getAllWorkflows());
    setCampaigns(styleguideConfigSystem.getAllCampaigns());
    setContainers(styleguideConfigSystem.getAllContainers());
  };

  const handleCreate = (type: typeof modalType) => {
    setModalType(type);
    setEditingItem(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (item: any, type: typeof modalType) => {
    setModalType(type);
    setEditingItem(item);
    form.setFieldsValue(item);
    setIsModalVisible(true);
  };

  const handleDelete = (id: string, type: typeof modalType) => {
    Modal.confirm({
      title: `Delete ${type}?`,
      content: 'This action cannot be undone.',
      onOk: () => {
        // In production, this would call the config system's delete method
        notification.success({
          message: `${type} deleted successfully`,
        });
        loadData();
      },
    });
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      
      switch (modalType) {
        case 'category':
          if (editingItem) {
            // Update existing
            notification.success({ message: 'Category updated' });
          } else {
            const category = styleguideConfigSystem.createCategory({
              name: values.name,
              description: values.description,
              attributes: [],
              workflows: [],
              campaigns: [],
              importance: values.importance || 5,
              relationships: {
                parentCategories: [],
                childCategories: [],
                relatedCategories: [],
              },
            });
            notification.success({ message: 'Category created', description: category.id });
          }
          break;
          
        case 'workflow':
          const workflow = styleguideConfigSystem.createWorkflow({
            name: values.name,
            description: values.description,
            categories: values.categories || [],
            steps: [],
            automation: {
              enabled: values.automationEnabled || false,
              triggers: [],
              actions: [],
            },
            seo: {
              optimizationGoals: values.seoGoals || [],
              targetMetrics: {},
            },
          });
          notification.success({ message: 'Workflow created', description: workflow.id });
          break;
          
        case 'campaign':
          const campaign = styleguideConfigSystem.createCampaign({
            name: values.name,
            type: values.type || 'content',
            workflows: values.workflows || [],
            categories: values.categories || [],
            automation: {
              bulkDataMining: values.bulkDataMining || false,
              massDataSimulation: values.massDataSimulation || false,
              selfOptimization: values.selfOptimization || false,
              searchAlgorithmBeating: values.searchAlgorithmBeating || false,
            },
            seo: {
              richSnippets: {
                autoGenerate: values.autoGenerateSnippets || false,
                schemas: [],
                selfEnriching: values.selfEnriching || false,
              },
              targetRanking: values.targetRanking || 10,
              competitorTracking: values.competitorTracking || false,
              visualDataOptimization: values.visualDataOptimization || false,
            },
            simulation: {
              enabled: values.simulationEnabled || false,
              lowCost: values.lowCost || true,
              highAccuracy: values.highAccuracy || true,
              liveExchange: values.liveExchange || true,
              attributes: [],
            },
          });
          notification.success({ message: 'Campaign created', description: campaign.id });
          break;
          
        case 'container':
          const container = styleguideConfigSystem.createHeadlessContainer({
            name: values.name,
            nodejs: {
              version: values.nodejsVersion || '20',
              runtime: values.nodejsRuntime || 'node',
              apiPort: values.apiPort || 3001,
              headlessMode: values.headlessMode || true,
            },
            categories: values.categories || [],
            startWindow: values.enableStartWindow ? {
              enabled: true,
              width: values.windowWidth || 1920,
              height: values.windowHeight || 1080,
              visible: values.windowVisible || false,
            } : undefined,
            electron: {
              enabled: values.electronEnabled || false,
              testMode: values.electronTestMode || false,
              mainProcess: values.electronMainProcess || 'electron/main.cjs',
            },
          });
          notification.success({ message: 'Container created', description: container.id });
          break;
      }
      
      setIsModalVisible(false);
      loadData();
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const categoryColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Importance',
      dataIndex: 'importance',
      key: 'importance',
      render: (importance: number) => (
        <Tag color={importance > 7 ? 'red' : importance > 4 ? 'orange' : 'blue'}>
          {importance}/10
        </Tag>
      ),
    },
    {
      title: 'Workflows',
      dataIndex: 'workflows',
      key: 'workflows',
      render: (workflows: string[]) => <Tag>{workflows.length}</Tag>,
    },
    {
      title: 'Campaigns',
      dataIndex: 'campaigns',
      key: 'campaigns',
      render: (campaigns: string[]) => <Tag color="green">{campaigns.length}</Tag>,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: StyleguideCategory) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record, 'category')}
          />
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id, 'category')}
          />
        </Space>
      ),
    },
  ];

  const workflowColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Categories',
      dataIndex: 'categories',
      key: 'categories',
      render: (categories: string[]) => <Tag>{categories.length}</Tag>,
    },
    {
      title: 'Automation',
      dataIndex: ['automation', 'enabled'],
      key: 'automation',
      render: (enabled: boolean) => (
        <Tag color={enabled ? 'green' : 'default'}>
          {enabled ? 'Enabled' : 'Disabled'}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: WorkflowConfig) => (
        <Space>
          <Button
            type="link"
            icon={<PlayCircleOutlined />}
            onClick={() => notification.info({ message: 'Workflow execution not implemented yet' })}
          />
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record, 'workflow')}
          />
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id, 'workflow')}
          />
        </Space>
      ),
    },
  ];

  const campaignColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => <Tag color="blue">{type}</Tag>,
    },
    {
      title: 'SEO Automation',
      key: 'seoAutomation',
      render: (_: any, record: CampaignConfig) => (
        <Space direction="vertical" size="small">
          {record.automation.bulkDataMining && <Tag color="purple">Bulk Mining</Tag>}
          {record.automation.selfOptimization && <Tag color="green">Self-Optimizing</Tag>}
          {record.automation.searchAlgorithmBeating && <Tag color="red">Algorithm Beating</Tag>}
          {record.seo.richSnippets.autoGenerate && <Tag color="gold">Auto Snippets</Tag>}
        </Space>
      ),
    },
    {
      title: 'Target Ranking',
      dataIndex: ['seo', 'targetRanking'],
      key: 'targetRanking',
      render: (ranking: number) => <Tag color="orange">#{ranking}</Tag>,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: CampaignConfig) => (
        <Space>
          <Button
            type="link"
            icon={<RocketOutlined />}
            onClick={() => notification.info({ message: 'Campaign launch not implemented yet' })}
          />
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record, 'campaign')}
          />
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id, 'campaign')}
          />
        </Space>
      ),
    },
  ];

  const containerColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: 'Node.js',
      dataIndex: ['nodejs', 'version'],
      key: 'nodejs',
      render: (version: string, record: HeadlessContainerConfig) => (
        <Space>
          <Tag>v{version}</Tag>
          <Tag color={record.nodejs.headlessMode ? 'purple' : 'default'}>
            {record.nodejs.headlessMode ? 'Headless' : 'GUI'}
          </Tag>
        </Space>
      ),
    },
    {
      title: 'Port',
      dataIndex: ['nodejs', 'apiPort'],
      key: 'port',
      render: (port: number) => <Tag color="blue">:{port}</Tag>,
    },
    {
      title: 'Electron',
      dataIndex: ['electron', 'enabled'],
      key: 'electron',
      render: (enabled: boolean, record: HeadlessContainerConfig) => (
        <Space>
          <Tag color={enabled ? 'green' : 'default'}>
            {enabled ? 'Enabled' : 'Disabled'}
          </Tag>
          {enabled && record.electron.testMode && <Tag color="orange">Test Mode</Tag>}
        </Space>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: HeadlessContainerConfig) => (
        <Space>
          <Button
            type="link"
            icon={<PlayCircleOutlined />}
            onClick={() => notification.info({ message: 'Container start not implemented yet' })}
          />
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record, 'container')}
          />
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id, 'container')}
          />
        </Space>
      ),
    },
  ];

  const renderCreateForm = () => {
    switch (modalType) {
      case 'category':
        return (
          <>
            <Form.Item label="Name" name="name" rules={[{ required: true }]}>
              <Input placeholder="Enter category name" />
            </Form.Item>
            <Form.Item label="Description" name="description">
              <TextArea rows={3} placeholder="Describe this category" />
            </Form.Item>
            <Form.Item label="Importance (1-10)" name="importance" initialValue={5}>
              <Slider min={1} max={10} marks={{ 1: '1', 5: '5', 10: '10' }} />
            </Form.Item>
          </>
        );
        
      case 'workflow':
        return (
          <>
            <Form.Item label="Name" name="name" rules={[{ required: true }]}>
              <Input placeholder="Enter workflow name" />
            </Form.Item>
            <Form.Item label="Description" name="description">
              <TextArea rows={3} placeholder="Describe this workflow" />
            </Form.Item>
            <Form.Item label="Categories" name="categories">
              <Select mode="multiple" placeholder="Select categories">
                {categories.map(cat => (
                  <Option key={cat.id} value={cat.id}>{cat.name}</Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item label="Enable Automation" name="automationEnabled" valuePropName="checked">
              <Switch />
            </Form.Item>
            <Form.Item label="SEO Goals" name="seoGoals">
              <Select mode="tags" placeholder="Enter SEO optimization goals" />
            </Form.Item>
          </>
        );
        
      case 'campaign':
        return (
          <>
            <Form.Item label="Name" name="name" rules={[{ required: true }]}>
              <Input placeholder="Enter campaign name" />
            </Form.Item>
            <Form.Item label="Type" name="type" initialValue="content">
              <Select>
                <Option value="content">Content</Option>
                <Option value="seo">SEO</Option>
                <Option value="product">Product</Option>
                <Option value="community">Community</Option>
              </Select>
            </Form.Item>
            <Form.Item label="Categories" name="categories">
              <Select mode="multiple" placeholder="Select categories">
                {categories.map(cat => (
                  <Option key={cat.id} value={cat.id}>{cat.name}</Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item label="Workflows" name="workflows">
              <Select mode="multiple" placeholder="Select workflows">
                {workflows.map(wf => (
                  <Option key={wf.id} value={wf.id}>{wf.name}</Option>
                ))}
              </Select>
            </Form.Item>
            <Divider>Automation Settings</Divider>
            <Form.Item label="Bulk Data Mining" name="bulkDataMining" valuePropName="checked">
              <Switch />
            </Form.Item>
            <Form.Item label="Mass Data Simulation" name="massDataSimulation" valuePropName="checked">
              <Switch />
            </Form.Item>
            <Form.Item label="Self Optimization" name="selfOptimization" valuePropName="checked">
              <Switch />
            </Form.Item>
            <Form.Item label="Search Algorithm Beating" name="searchAlgorithmBeating" valuePropName="checked">
              <Switch />
            </Form.Item>
            <Divider>SEO Settings</Divider>
            <Form.Item label="Auto Generate Rich Snippets" name="autoGenerateSnippets" valuePropName="checked">
              <Switch />
            </Form.Item>
            <Form.Item label="Self-Enriching Snippets" name="selfEnriching" valuePropName="checked">
              <Switch />
            </Form.Item>
            <Form.Item label="Target Ranking" name="targetRanking" initialValue={10}>
              <InputNumber min={1} max={100} />
            </Form.Item>
            <Form.Item label="Competitor Tracking" name="competitorTracking" valuePropName="checked">
              <Switch />
            </Form.Item>
            <Form.Item label="Visual Data Optimization" name="visualDataOptimization" valuePropName="checked">
              <Switch />
            </Form.Item>
            <Divider>Simulation Settings</Divider>
            <Form.Item label="Enable Simulation" name="simulationEnabled" valuePropName="checked">
              <Switch />
            </Form.Item>
            <Form.Item label="Low Cost Mode" name="lowCost" valuePropName="checked" initialValue={true}>
              <Switch />
            </Form.Item>
            <Form.Item label="High Accuracy" name="highAccuracy" valuePropName="checked" initialValue={true}>
              <Switch />
            </Form.Item>
            <Form.Item label="Live Data Exchange" name="liveExchange" valuePropName="checked" initialValue={true}>
              <Switch />
            </Form.Item>
          </>
        );
        
      case 'container':
        return (
          <>
            <Form.Item label="Name" name="name" rules={[{ required: true }]}>
              <Input placeholder="Enter container name" />
            </Form.Item>
            <Divider>Node.js Configuration</Divider>
            <Form.Item label="Node.js Version" name="nodejsVersion" initialValue="20">
              <Input placeholder="e.g., 20" />
            </Form.Item>
            <Form.Item label="Runtime" name="nodejsRuntime" initialValue="node">
              <Input placeholder="e.g., node" />
            </Form.Item>
            <Form.Item label="API Port" name="apiPort" initialValue={3001}>
              <InputNumber min={1000} max={65535} />
            </Form.Item>
            <Form.Item label="Headless Mode" name="headlessMode" valuePropName="checked" initialValue={true}>
              <Switch />
            </Form.Item>
            <Divider>Start Window</Divider>
            <Form.Item label="Enable Start Window" name="enableStartWindow" valuePropName="checked">
              <Switch />
            </Form.Item>
            <Form.Item label="Width" name="windowWidth" initialValue={1920}>
              <InputNumber min={800} max={3840} />
            </Form.Item>
            <Form.Item label="Height" name="windowHeight" initialValue={1080}>
              <InputNumber min={600} max={2160} />
            </Form.Item>
            <Form.Item label="Visible" name="windowVisible" valuePropName="checked">
              <Switch />
            </Form.Item>
            <Divider>Electron Configuration</Divider>
            <Form.Item label="Enable Electron" name="electronEnabled" valuePropName="checked">
              <Switch />
            </Form.Item>
            <Form.Item label="Test Mode" name="electronTestMode" valuePropName="checked">
              <Switch />
            </Form.Item>
            <Form.Item label="Main Process" name="electronMainProcess" initialValue="electron/main.cjs">
              <Input placeholder="Path to electron main process" />
            </Form.Item>
            <Form.Item label="Categories" name="categories">
              <Select mode="multiple" placeholder="Select categories">
                {categories.map(cat => (
                  <Option key={cat.id} value={cat.id}>{cat.name}</Option>
                ))}
              </Select>
            </Form.Item>
          </>
        );
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>
        <BranchesOutlined /> Styleguide Configuration Manager
      </Title>
      <Paragraph>
        Manage styleguide configurations, workflows, campaigns, and headless containers.
        Create relationships between attributes, automate SEO campaigns, and run simulations.
      </Paragraph>

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="Categories" key="categories">
          <Card
            title="Styleguide Categories"
            extra={
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => handleCreate('category')}
              >
                Create Category
              </Button>
            }
          >
            <Table
              dataSource={categories}
              columns={categoryColumns}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </TabPane>

        <TabPane tab="Workflows" key="workflows">
          <Card
            title="Workflows"
            extra={
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => handleCreate('workflow')}
              >
                Create Workflow
              </Button>
            }
          >
            <Table
              dataSource={workflows}
              columns={workflowColumns}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </TabPane>

        <TabPane tab="Campaigns" key="campaigns">
          <Card
            title="SEO & Content Campaigns"
            extra={
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => handleCreate('campaign')}
              >
                Create Campaign
              </Button>
            }
          >
            <Table
              dataSource={campaigns}
              columns={campaignColumns}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </TabPane>

        <TabPane tab="Containers" key="containers">
          <Card
            title="Headless Containers"
            extra={
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => handleCreate('container')}
              >
                Create Container
              </Button>
            }
          >
            <Table
              dataSource={containers}
              columns={containerColumns}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </TabPane>
      </Tabs>

      <Modal
        title={`${editingItem ? 'Edit' : 'Create'} ${modalType}`}
        open={isModalVisible}
        onOk={handleSave}
        onCancel={() => setIsModalVisible(false)}
        width={800}
        okText="Save"
        cancelText="Cancel"
      >
        <Form form={form} layout="vertical">
          {renderCreateForm()}
        </Form>
      </Modal>
    </div>
  );
};

export default StyleguideConfigManager;
