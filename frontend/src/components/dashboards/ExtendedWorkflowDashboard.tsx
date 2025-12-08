import React, { useState, useEffect } from 'react';
import { Tabs, Table, Button, Card, Statistic, Row, Col, Modal, Form, Input, Select, message, Tag, Space, Typography } from 'antd';
import {
  PlayCircleOutlined,
  StopOutlined,
  EyeOutlined,
  ReloadOutlined,
  ThunderboltOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined,
  ExperimentOutlined,
  CodeOutlined,
  DatabaseOutlined,
  ApiOutlined
} from '@ant-design/icons';
import { extendedWorkflowAPI } from '../../services/apiService';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { TabPane } = Tabs;
const { Option } = Select;

/**
 * Extended Workflow Dashboard Component
 * 
 * Provides comprehensive workflow management with:
 * - Campaign training monitoring
 * - Client status overview
 * - Workflow state machine management
 * - 3D DOM mining with rich snippets
 * - Component library
 * - Training data models
 */
const ExtendedWorkflowDashboard: React.FC = () => {
  // State for campaigns
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
  const [campaignModalVisible, setCampaignModalVisible] = useState(false);
  
  // State for clients
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [clientModalVisible, setClientModalVisible] = useState(false);
  
  // State for state machine
  const [stateMachine, setStateMachine] = useState<any>(null);
  const [smModalVisible, setSmModalVisible] = useState(false);
  const [smForm] = Form.useForm();
  
  // State for 3D mining
  const [miningResults, setMiningResults] = useState<any[]>([]);
  const [miningModalVisible, setMiningModalVisible] = useState(false);
  const [miningForm] = Form.useForm();
  
  // State for component library
  const [components, setComponents] = useState<any[]>([]);
  const [componentModalVisible, setComponentModalVisible] = useState(false);
  const [componentForm] = Form.useForm();
  
  // State for training models
  const [trainingModels, setTrainingModels] = useState<any[]>([]);
  
  // State for schema links
  const [schemaLinks, setSchemaLinks] = useState<any[]>([]);
  
  // State for statistics
  const [stats, setStats] = useState({
    totalCampaigns: 0,
    activeCampaigns: 0,
    totalClients: 0,
    totalMiningResults: 0,
    totalComponents: 0,
    totalTrainingModels: 0
  });

  const [loading, setLoading] = useState(false);

  // Load data on mount
  useEffect(() => {
    loadCampaigns();
    loadClients();
    loadMiningResults();
    loadComponents();
    loadTrainingModels();
    loadSchemaLinks();
  }, []);

  // Load campaigns
  const loadCampaigns = async () => {
    try {
      setLoading(true);
      const data = await extendedWorkflowAPI.getCampaigns();
      setCampaigns(data || []);
      
      // Update stats
      const active = (data || []).filter((c: any) => c.status === 'active').length;
      setStats(prev => ({
        ...prev,
        totalCampaigns: data?.length || 0,
        activeCampaigns: active
      }));
    } catch (error) {
      console.error('Error loading campaigns:', error);
      message.error('Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  };

  // Load single campaign
  const loadCampaign = async (id: string) => {
    try {
      const data = await extendedWorkflowAPI.getCampaign(id);
      setSelectedCampaign(data);
      setCampaignModalVisible(true);
    } catch (error) {
      console.error('Error loading campaign:', error);
      message.error('Failed to load campaign details');
    }
  };

  // Load clients
  const loadClients = async () => {
    try {
      const data = await extendedWorkflowAPI.getClients();
      setClients(data || []);
      setStats(prev => ({
        ...prev,
        totalClients: data?.length || 0
      }));
    } catch (error) {
      console.error('Error loading clients:', error);
      message.error('Failed to load clients');
    }
  };

  // Load single client
  const loadClient = async (clientId: string) => {
    try {
      const data = await extendedWorkflowAPI.getClient(clientId);
      setSelectedClient(data);
      setClientModalVisible(true);
    } catch (error) {
      console.error('Error loading client:', error);
      message.error('Failed to load client details');
    }
  };

  // Initialize state machine
  const initializeStateMachine = async (values: any) => {
    try {
      const data = await extendedWorkflowAPI.initializeStateMachine(values);
      setStateMachine(data);
      message.success('State machine initialized successfully');
      smForm.resetFields();
      setSmModalVisible(false);
    } catch (error) {
      console.error('Error initializing state machine:', error);
      message.error('Failed to initialize state machine');
    }
  };

  // Execute state machine
  const executeStateMachine = async (values: any) => {
    try {
      const data = await extendedWorkflowAPI.executeStateMachine(values);
      message.success('State machine executed successfully');
      return data;
    } catch (error) {
      console.error('Error executing state machine:', error);
      message.error('Failed to execute state machine');
    }
  };

  // Simulate state machine
  const simulateStateMachine = async (values: any) => {
    try {
      const data = await extendedWorkflowAPI.simulateStateMachine(values);
      message.success('State machine simulation completed');
      return data;
    } catch (error) {
      console.error('Error simulating state machine:', error);
      message.error('Failed to simulate state machine');
    }
  };

  // Start 3D DOM mining
  const startMining = async (values: any) => {
    try {
      const data = await extendedWorkflowAPI.start3DDOMMining(values);
      message.success('3D DOM mining started successfully');
      miningForm.resetFields();
      setMiningModalVisible(false);
      loadMiningResults();
    } catch (error) {
      console.error('Error starting mining:', error);
      message.error('Failed to start 3D DOM mining');
    }
  };

  // Load mining results
  const loadMiningResults = async () => {
    try {
      const data = await extendedWorkflowAPI.getMiningResults();
      setMiningResults(data?.results || []);
      setStats(prev => ({
        ...prev,
        totalMiningResults: data?.results?.length || 0
      }));
    } catch (error) {
      console.error('Error loading mining results:', error);
      message.error('Failed to load mining results');
    }
  };

  // Load mining result detail
  const loadMiningResult = async (id: string) => {
    try {
      const data = await extendedWorkflowAPI.getMiningResult(id);
      Modal.info({
        title: 'Mining Result Details',
        width: 800,
        content: (
          <div>
            <p><strong>ID:</strong> {data.id}</p>
            <p><strong>URL:</strong> {data.url}</p>
            <p><strong>Layers:</strong> {data.layersCount}</p>
            <p><strong>Rich Snippets:</strong> {data.richSnippetsCount}</p>
            <p><strong>Created:</strong> {new Date(data.createdAt).toLocaleString()}</p>
            <pre>{JSON.stringify(data.data, null, 2)}</pre>
          </div>
        )
      });
    } catch (error) {
      console.error('Error loading mining result:', error);
      message.error('Failed to load mining result details');
    }
  };

  // Load components
  const loadComponents = async () => {
    try {
      const data = await extendedWorkflowAPI.getComponents();
      setComponents(data?.components || []);
      setStats(prev => ({
        ...prev,
        totalComponents: data?.components?.length || 0
      }));
    } catch (error) {
      console.error('Error loading components:', error);
      message.error('Failed to load components');
    }
  };

  // Add component
  const addComponent = async (values: any) => {
    try {
      await extendedWorkflowAPI.addComponent(values);
      message.success('Component added successfully');
      componentForm.resetFields();
      setComponentModalVisible(false);
      loadComponents();
    } catch (error) {
      console.error('Error adding component:', error);
      message.error('Failed to add component');
    }
  };

  // Load training models
  const loadTrainingModels = async () => {
    try {
      const data = await extendedWorkflowAPI.getTrainingModels();
      setTrainingModels(data?.models || []);
      setStats(prev => ({
        ...prev,
        totalTrainingModels: data?.models?.length || 0
      }));
    } catch (error) {
      console.error('Error loading training models:', error);
      message.error('Failed to load training models');
    }
  };

  // Load schema links
  const loadSchemaLinks = async () => {
    try {
      const data = await extendedWorkflowAPI.getSchemaLinks();
      setSchemaLinks(data?.links || []);
    } catch (error) {
      console.error('Error loading schema links:', error);
      message.error('Failed to load schema links');
    }
  };

  // Campaign columns
  const campaignColumns = [
    {
      title: 'Campaign ID',
      dataIndex: 'id',
      key: 'id',
      width: 100
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: 200
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => {
        const colors: any = {
          active: 'green',
          training: 'blue',
          paused: 'orange',
          completed: 'purple',
          failed: 'red'
        };
        return <Tag color={colors[status] || 'default'}>{status}</Tag>;
      }
    },
    {
      title: 'Progress',
      dataIndex: 'progress',
      key: 'progress',
      width: 100,
      render: (progress: number) => `${progress || 0}%`
    },
    {
      title: 'Training Cycles',
      dataIndex: 'trainingCycles',
      key: 'trainingCycles',
      width: 120
    },
    {
      title: 'Last Updated',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 150,
      render: (date: string) => new Date(date).toLocaleString()
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      render: (_: any, record: any) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => loadCampaign(record.id)}
        >
          View
        </Button>
      )
    }
  ];

  // Client columns
  const clientColumns = [
    {
      title: 'Client ID',
      dataIndex: 'clientId',
      key: 'clientId',
      width: 150
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: 200
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => {
        const colors: any = {
          active: 'green',
          inactive: 'orange',
          training: 'blue'
        };
        return <Tag color={colors[status] || 'default'}>{status}</Tag>;
      }
    },
    {
      title: 'Campaigns',
      dataIndex: 'campaignCount',
      key: 'campaignCount',
      width: 100
    },
    {
      title: 'Workflows',
      dataIndex: 'workflowCount',
      key: 'workflowCount',
      width: 100
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      render: (_: any, record: any) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => loadClient(record.clientId)}
        >
          View
        </Button>
      )
    }
  ];

  // Mining result columns
  const miningColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 100
    },
    {
      title: 'URL',
      dataIndex: 'url',
      key: 'url',
      width: 300,
      ellipsis: true
    },
    {
      title: 'Layers',
      dataIndex: 'layersCount',
      key: 'layersCount',
      width: 100
    },
    {
      title: 'Snippets',
      dataIndex: 'richSnippetsCount',
      key: 'richSnippetsCount',
      width: 100
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => {
        const colors: any = {
          completed: 'green',
          processing: 'blue',
          failed: 'red'
        };
        return <Tag color={colors[status] || 'default'}>{status}</Tag>;
      }
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (date: string) => new Date(date).toLocaleString()
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      render: (_: any, record: any) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => loadMiningResult(record.id)}
        >
          View
        </Button>
      )
    }
  ];

  // Component columns
  const componentColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: 200
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type: string) => <Tag>{type}</Tag>
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      width: 150
    },
    {
      title: 'Version',
      dataIndex: 'version',
      key: 'version',
      width: 100
    },
    {
      title: 'Usage Count',
      dataIndex: 'usageCount',
      key: 'usageCount',
      width: 120
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (date: string) => new Date(date).toLocaleString()
    }
  ];

  // Training model columns
  const modelColumns = [
    {
      title: 'Model Name',
      dataIndex: 'name',
      key: 'name',
      width: 200
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type: string) => <Tag color="purple">{type}</Tag>
    },
    {
      title: 'Accuracy',
      dataIndex: 'accuracy',
      key: 'accuracy',
      width: 100,
      render: (acc: number) => `${(acc * 100).toFixed(2)}%`
    },
    {
      title: 'Training Data',
      dataIndex: 'trainingDataCount',
      key: 'trainingDataCount',
      width: 120
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => {
        const colors: any = {
          trained: 'green',
          training: 'blue',
          pending: 'orange'
        };
        return <Tag color={colors[status] || 'default'}>{status}</Tag>;
      }
    },
    {
      title: 'Last Trained',
      dataIndex: 'lastTrained',
      key: 'lastTrained',
      width: 150,
      render: (date: string) => new Date(date).toLocaleString()
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>
        <ThunderboltOutlined /> Extended Workflow Monitoring
      </Title>
      
      {/* Statistics */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={4}>
          <Card>
            <Statistic
              title="Total Campaigns"
              value={stats.totalCampaigns}
              prefix={<DatabaseOutlined />}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="Active Campaigns"
              value={stats.activeCampaigns}
              valueStyle={{ color: '#3f8600' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="Total Clients"
              value={stats.totalClients}
              prefix={<ApiOutlined />}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="Mining Results"
              value={stats.totalMiningResults}
              prefix={<ExperimentOutlined />}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="Components"
              value={stats.totalComponents}
              prefix={<CodeOutlined />}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="Training Models"
              value={stats.totalTrainingModels}
              prefix={<SyncOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Tabs defaultActiveKey="campaigns">
        {/* Campaigns Tab */}
        <TabPane tab="Campaign Training" key="campaigns">
          <Space style={{ marginBottom: 16 }}>
            <Button
              type="primary"
              icon={<ReloadOutlined />}
              onClick={loadCampaigns}
              loading={loading}
            >
              Refresh
            </Button>
          </Space>
          
          <Table
            dataSource={campaigns}
            columns={campaignColumns}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10 }}
          />
        </TabPane>

        {/* Clients Tab */}
        <TabPane tab="Client Status" key="clients">
          <Space style={{ marginBottom: 16 }}>
            <Button
              type="primary"
              icon={<ReloadOutlined />}
              onClick={loadClients}
            >
              Refresh
            </Button>
          </Space>
          
          <Table
            dataSource={clients}
            columns={clientColumns}
            rowKey="clientId"
            pagination={{ pageSize: 10 }}
          />
        </TabPane>

        {/* State Machine Tab */}
        <TabPane tab="State Machine" key="stateMachine">
          <Space style={{ marginBottom: 16 }}>
            <Button
              type="primary"
              icon={<PlayCircleOutlined />}
              onClick={() => setSmModalVisible(true)}
            >
              Initialize State Machine
            </Button>
          </Space>
          
          {stateMachine && (
            <Card title="Current State Machine">
              <pre>{JSON.stringify(stateMachine, null, 2)}</pre>
            </Card>
          )}
        </TabPane>

        {/* 3D Mining Tab */}
        <TabPane tab="3D DOM Mining" key="mining">
          <Space style={{ marginBottom: 16 }}>
            <Button
              type="primary"
              icon={<ExperimentOutlined />}
              onClick={() => setMiningModalVisible(true)}
            >
              Start Mining
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={loadMiningResults}
            >
              Refresh
            </Button>
          </Space>
          
          <Table
            dataSource={miningResults}
            columns={miningColumns}
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        </TabPane>

        {/* Component Library Tab */}
        <TabPane tab="Component Library" key="components">
          <Space style={{ marginBottom: 16 }}>
            <Button
              type="primary"
              icon={<CodeOutlined />}
              onClick={() => setComponentModalVisible(true)}
            >
              Add Component
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={loadComponents}
            >
              Refresh
            </Button>
          </Space>
          
          <Table
            dataSource={components}
            columns={componentColumns}
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        </TabPane>

        {/* Training Models Tab */}
        <TabPane tab="Training Models" key="models">
          <Space style={{ marginBottom: 16 }}>
            <Button
              icon={<ReloadOutlined />}
              onClick={loadTrainingModels}
            >
              Refresh
            </Button>
          </Space>
          
          <Table
            dataSource={trainingModels}
            columns={modelColumns}
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        </TabPane>
      </Tabs>

      {/* Campaign Detail Modal */}
      <Modal
        title="Campaign Details"
        visible={campaignModalVisible}
        onCancel={() => setCampaignModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedCampaign && (
          <div>
            <p><Text strong>ID:</Text> {selectedCampaign.id}</p>
            <p><Text strong>Name:</Text> {selectedCampaign.name}</p>
            <p><Text strong>Status:</Text> <Tag color="blue">{selectedCampaign.status}</Tag></p>
            <p><Text strong>Progress:</Text> {selectedCampaign.progress}%</p>
            <p><Text strong>Training Cycles:</Text> {selectedCampaign.trainingCycles}</p>
            <p><Text strong>Created:</Text> {new Date(selectedCampaign.createdAt).toLocaleString()}</p>
            <p><Text strong>Last Updated:</Text> {new Date(selectedCampaign.updatedAt).toLocaleString()}</p>
            <pre>{JSON.stringify(selectedCampaign, null, 2)}</pre>
          </div>
        )}
      </Modal>

      {/* Client Detail Modal */}
      <Modal
        title="Client Details"
        visible={clientModalVisible}
        onCancel={() => setClientModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedClient && (
          <div>
            <p><Text strong>Client ID:</Text> {selectedClient.clientId}</p>
            <p><Text strong>Name:</Text> {selectedClient.name}</p>
            <p><Text strong>Status:</Text> <Tag color="green">{selectedClient.status}</Tag></p>
            <p><Text strong>Campaigns:</Text> {selectedClient.campaignCount}</p>
            <p><Text strong>Workflows:</Text> {selectedClient.workflowCount}</p>
            <pre>{JSON.stringify(selectedClient, null, 2)}</pre>
          </div>
        )}
      </Modal>

      {/* State Machine Modal */}
      <Modal
        title="Initialize State Machine"
        visible={smModalVisible}
        onCancel={() => setSmModalVisible(false)}
        onOk={() => smForm.submit()}
      >
        <Form
          form={smForm}
          layout="vertical"
          onFinish={initializeStateMachine}
        >
          <Form.Item
            name="workflowId"
            label="Workflow ID"
            rules={[{ required: true, message: 'Please enter workflow ID' }]}
          >
            <Input placeholder="Enter workflow ID" />
          </Form.Item>
          
          <Form.Item
            name="initialState"
            label="Initial State"
            rules={[{ required: true, message: 'Please enter initial state' }]}
          >
            <Input placeholder="e.g., idle" />
          </Form.Item>
          
          <Form.Item
            name="config"
            label="Configuration (JSON)"
          >
            <TextArea rows={4} placeholder='{"key": "value"}' />
          </Form.Item>
        </Form>
      </Modal>

      {/* Mining Modal */}
      <Modal
        title="Start 3D DOM Mining"
        visible={miningModalVisible}
        onCancel={() => setMiningModalVisible(false)}
        onOk={() => miningForm.submit()}
      >
        <Form
          form={miningForm}
          layout="vertical"
          onFinish={startMining}
        >
          <Form.Item
            name="url"
            label="Target URL"
            rules={[{ required: true, message: 'Please enter URL' }]}
          >
            <Input placeholder="https://example.com" />
          </Form.Item>
          
          <Form.Item
            name="depth"
            label="Mining Depth"
            initialValue={3}
          >
            <Select>
              <Option value={1}>Shallow (1 layer)</Option>
              <Option value={2}>Medium (2 layers)</Option>
              <Option value={3}>Deep (3 layers)</Option>
              <Option value={4}>Very Deep (4 layers)</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="includeRichSnippets"
            label="Include Rich Snippets"
            initialValue={true}
          >
            <Select>
              <Option value={true}>Yes</Option>
              <Option value={false}>No</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Component Modal */}
      <Modal
        title="Add Component"
        visible={componentModalVisible}
        onCancel={() => setComponentModalVisible(false)}
        onOk={() => componentForm.submit()}
      >
        <Form
          form={componentForm}
          layout="vertical"
          onFinish={addComponent}
        >
          <Form.Item
            name="name"
            label="Component Name"
            rules={[{ required: true, message: 'Please enter component name' }]}
          >
            <Input placeholder="Enter component name" />
          </Form.Item>
          
          <Form.Item
            name="type"
            label="Type"
            rules={[{ required: true, message: 'Please select type' }]}
          >
            <Select placeholder="Select type">
              <Option value="enrichment">Enrichment</Option>
              <Option value="transformation">Transformation</Option>
              <Option value="validation">Validation</Option>
              <Option value="utility">Utility</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="category"
            label="Category"
            rules={[{ required: true, message: 'Please enter category' }]}
          >
            <Input placeholder="e.g., data-processing" />
          </Form.Item>
          
          <Form.Item
            name="version"
            label="Version"
            initialValue="1.0.0"
          >
            <Input placeholder="1.0.0" />
          </Form.Item>
          
          <Form.Item
            name="config"
            label="Configuration (JSON)"
          >
            <TextArea rows={4} placeholder='{"key": "value"}' />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ExtendedWorkflowDashboard;
