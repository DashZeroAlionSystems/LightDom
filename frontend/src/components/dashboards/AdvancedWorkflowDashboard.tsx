import React, { useState, useEffect } from 'react';
import { Card, Tabs, Table, Button, Modal, Form, Input, Select, message, Tag, Space, Statistic, Row, Col, Typography } from 'antd';
import { 
  PlayCircleOutlined, 
  EyeOutlined, 
  ReloadOutlined,
  ThunderboltOutlined,
  CodeOutlined,
  BarChartOutlined,
  GoogleOutlined,
  AppstoreOutlined,
  LinkOutlined
} from '@ant-design/icons';
import { advancedWorkflowAPI } from '../../services/apiService';

const { TabPane } = Tabs;
const { TextArea } = Input;
const { Option } = Select;
const { Title, Text } = Typography;

const AdvancedWorkflowDashboard: React.FC = () => {
  const [loading, setLoading] = useState(false);
  
  // Paint Timeline State
  const [snapshots, setSnapshots] = useState<any[]>([]);
  const [models, setModels] = useState<any[]>([]);
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [snapshotDetailsVisible, setSnapshotDetailsVisible] = useState(false);
  const [selectedSnapshot, setSelectedSnapshot] = useState<any>(null);
  
  // MCP Tools State
  const [mcpTools, setMcpTools] = useState<any[]>([]);
  const [subAgents, setSubAgents] = useState<any[]>([]);
  const [executions, setExecutions] = useState<any[]>([]);
  const [executeModalVisible, setExecuteModalVisible] = useState(false);
  const [selectedTool, setSelectedTool] = useState<any>(null);
  
  // Prompt-to-Schema State
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [generateModalVisible, setGenerateModalVisible] = useState(false);
  
  // GA4 State
  const [gaHistory, setGaHistory] = useState<any[]>([]);
  const [gaChanges, setGaChanges] = useState<any[]>([]);
  const [gaModalVisible, setGaModalVisible] = useState(false);
  
  // Enrichment State
  const [components, setComponents] = useState<any[]>([]);
  const [chains, setChains] = useState<any[]>([]);
  
  // Statistics
  const [stats, setStats] = useState({
    totalSnapshots: 0,
    totalTools: 0,
    totalWorkflows: 0,
    totalComponents: 0
  });

  const [profileForm] = Form.useForm();
  const [executeForm] = Form.useForm();
  const [generateForm] = Form.useForm();
  const [gaForm] = Form.useForm();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadSnapshots(),
        loadMCPTools(),
        loadWorkflows(),
        loadComponents()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
      message.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const loadSnapshots = async () => {
    try {
      const data = await advancedWorkflowAPI.getPaintSnapshots();
      setSnapshots(data || []);
      
      const modelData = await advancedWorkflowAPI.getPaintModels();
      setModels(modelData || []);
      
      setStats(prev => ({ ...prev, totalSnapshots: (data || []).length }));
    } catch (error) {
      console.error('Error loading snapshots:', error);
    }
  };

  const loadMCPTools = async () => {
    try {
      const toolData = await advancedWorkflowAPI.getMCPTools();
      setMcpTools(toolData || []);
      
      const agentData = await advancedWorkflowAPI.getMCPSubAgents();
      setSubAgents(agentData || []);
      
      const execData = await advancedWorkflowAPI.getMCPExecutions();
      setExecutions(execData || []);
      
      setStats(prev => ({ ...prev, totalTools: (toolData || []).length }));
    } catch (error) {
      console.error('Error loading MCP tools:', error);
    }
  };

  const loadWorkflows = async () => {
    try {
      const data = await advancedWorkflowAPI.getPromptWorkflows();
      setWorkflows(data || []);
      setStats(prev => ({ ...prev, totalWorkflows: (data || []).length }));
    } catch (error) {
      console.error('Error loading workflows:', error);
    }
  };

  const loadComponents = async () => {
    try {
      const data = await advancedWorkflowAPI.getEnrichmentComponents();
      setComponents(data || []);
      
      const chainData = await advancedWorkflowAPI.getWorkflowChains();
      setChains(chainData || []);
      
      setStats(prev => ({ ...prev, totalComponents: (data || []).length }));
    } catch (error) {
      console.error('Error loading components:', error);
    }
  };

  const handleProfileURL = async (values: any) => {
    try {
      setLoading(true);
      await advancedWorkflowAPI.profilePaintTimeline(values);
      message.success('Paint timeline profile created successfully');
      setProfileModalVisible(false);
      profileForm.resetFields();
      loadSnapshots();
    } catch (error) {
      console.error('Error profiling URL:', error);
      message.error('Failed to create profile');
    } finally {
      setLoading(false);
    }
  };

  const handleViewSnapshot = async (snapshot: any) => {
    try {
      const details = await advancedWorkflowAPI.getPaintSnapshot(snapshot.id);
      setSelectedSnapshot(details);
      setSnapshotDetailsVisible(true);
    } catch (error) {
      console.error('Error loading snapshot details:', error);
      message.error('Failed to load snapshot details');
    }
  };

  const handleExecuteTool = async (values: any) => {
    try {
      setLoading(true);
      await advancedWorkflowAPI.executeMCPTool(selectedTool.name, values);
      message.success('Tool executed successfully');
      setExecuteModalVisible(false);
      executeForm.resetFields();
      loadMCPTools();
    } catch (error) {
      console.error('Error executing tool:', error);
      message.error('Failed to execute tool');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSchema = async (values: any) => {
    try {
      setLoading(true);
      await advancedWorkflowAPI.generatePromptSchema(values);
      message.success('Schema generated successfully');
      setGenerateModalVisible(false);
      generateForm.resetFields();
      loadWorkflows();
    } catch (error) {
      console.error('Error generating schema:', error);
      message.error('Failed to generate schema');
    } finally {
      setLoading(false);
    }
  };

  const handleConfigureGA4 = async (values: any) => {
    try {
      setLoading(true);
      await advancedWorkflowAPI.configureGA4(values.campaignId, values.config);
      message.success('GA4 configured successfully');
      setGaModalVisible(false);
      gaForm.resetFields();
    } catch (error) {
      console.error('Error configuring GA4:', error);
      message.error('Failed to configure GA4');
    } finally {
      setLoading(false);
    }
  };

  const handleUseComponent = async (componentId: string) => {
    try {
      setLoading(true);
      await advancedWorkflowAPI.useEnrichmentComponent(componentId, {});
      message.success('Component used successfully');
      loadComponents();
    } catch (error) {
      console.error('Error using component:', error);
      message.error('Failed to use component');
    } finally {
      setLoading(false);
    }
  };

  const snapshotColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80
    },
    {
      title: 'URL',
      dataIndex: 'url',
      key: 'url',
      ellipsis: true
    },
    {
      title: 'Campaign',
      dataIndex: 'campaignId',
      key: 'campaignId'
    },
    {
      title: 'Model',
      dataIndex: 'modelId',
      key: 'modelId',
      render: (modelId: number) => {
        const model = models.find(m => m.id === modelId);
        return model ? model.name : modelId;
      }
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleString()
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Button 
          type="link" 
          icon={<EyeOutlined />}
          onClick={() => handleViewSnapshot(record)}
        >
          View
        </Button>
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
      render: (category: string) => (
        <Tag color="blue">{category}</Tag>
      )
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Button 
          type="primary" 
          icon={<PlayCircleOutlined />}
          onClick={() => {
            setSelectedTool(record);
            setExecuteModalVisible(true);
          }}
        >
          Execute
        </Button>
      )
    }
  ];

  const workflowColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: 'Prompt',
      dataIndex: 'prompt',
      key: 'prompt',
      ellipsis: true
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const colors: any = {
          'active': 'green',
          'paused': 'orange',
          'completed': 'blue'
        };
        return <Tag color={colors[status] || 'default'}>{status}</Tag>;
      }
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleString()
    }
  ];

  const componentColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag color="purple">{type}</Tag>
      )
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true
    },
    {
      title: 'Usage Count',
      dataIndex: 'usageCount',
      key: 'usageCount'
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Button 
          type="link" 
          icon={<ThunderboltOutlined />}
          onClick={() => handleUseComponent(record.id)}
        >
          Use
        </Button>
      )
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>Advanced Workflow Orchestration</Title>
      
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic 
              title="Paint Snapshots" 
              value={stats.totalSnapshots}
              prefix={<BarChartOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic 
              title="MCP Tools" 
              value={stats.totalTools}
              prefix={<ThunderboltOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic 
              title="Workflows" 
              value={stats.totalWorkflows}
              prefix={<CodeOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic 
              title="Components" 
              value={stats.totalComponents}
              prefix={<AppstoreOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <Tabs defaultActiveKey="paint">
          <TabPane tab={<span><BarChartOutlined />Paint Timeline</span>} key="paint">
            <Space style={{ marginBottom: 16 }}>
              <Button 
                type="primary" 
                icon={<PlayCircleOutlined />}
                onClick={() => setProfileModalVisible(true)}
              >
                Profile URL
              </Button>
              <Button 
                icon={<ReloadOutlined />}
                onClick={loadSnapshots}
              >
                Refresh
              </Button>
            </Space>
            <Table 
              columns={snapshotColumns}
              dataSource={snapshots}
              loading={loading}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </TabPane>

          <TabPane tab={<span><ThunderboltOutlined />MCP Tools</span>} key="mcp">
            <Space style={{ marginBottom: 16 }}>
              <Button 
                icon={<ReloadOutlined />}
                onClick={loadMCPTools}
              >
                Refresh
              </Button>
              <Text type="secondary">
                Sub-Agents: {subAgents.length} | Executions: {executions.length}
              </Text>
            </Space>
            <Table 
              columns={toolColumns}
              dataSource={mcpTools}
              loading={loading}
              rowKey="name"
              pagination={{ pageSize: 10 }}
            />
          </TabPane>

          <TabPane tab={<span><CodeOutlined />Prompt-to-Schema</span>} key="schema">
            <Space style={{ marginBottom: 16 }}>
              <Button 
                type="primary" 
                icon={<PlayCircleOutlined />}
                onClick={() => setGenerateModalVisible(true)}
              >
                Generate Schema
              </Button>
              <Button 
                icon={<ReloadOutlined />}
                onClick={loadWorkflows}
              >
                Refresh
              </Button>
            </Space>
            <Table 
              columns={workflowColumns}
              dataSource={workflows}
              loading={loading}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </TabPane>

          <TabPane tab={<span><GoogleOutlined />GA4 Integration</span>} key="ga4">
            <Space style={{ marginBottom: 16 }}>
              <Button 
                type="primary" 
                icon={<PlayCircleOutlined />}
                onClick={() => setGaModalVisible(true)}
              >
                Configure GA4
              </Button>
            </Space>
            <Text>Configure Google Analytics 4 integration for campaigns</Text>
          </TabPane>

          <TabPane tab={<span><AppstoreOutlined />Enrichment</span>} key="enrichment">
            <Space style={{ marginBottom: 16 }}>
              <Button 
                icon={<ReloadOutlined />}
                onClick={loadComponents}
              >
                Refresh
              </Button>
              <Text type="secondary">
                Chains: {chains.length}
              </Text>
            </Space>
            <Table 
              columns={componentColumns}
              dataSource={components}
              loading={loading}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </TabPane>
        </Tabs>
      </Card>

      {/* Profile Modal */}
      <Modal
        title="Profile Paint Timeline"
        open={profileModalVisible}
        onCancel={() => setProfileModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={profileForm}
          layout="vertical"
          onFinish={handleProfileURL}
        >
          <Form.Item
            name="url"
            label="URL"
            rules={[{ required: true, message: 'Please enter URL' }]}
          >
            <Input placeholder="https://example.com" />
          </Form.Item>
          <Form.Item
            name="campaignId"
            label="Campaign ID"
            rules={[{ required: true, message: 'Please enter campaign ID' }]}
          >
            <Input type="number" />
          </Form.Item>
          <Form.Item
            name="modelId"
            label="Model"
          >
            <Select placeholder="Select model">
              {models.map(model => (
                <Option key={model.id} value={model.id}>{model.name}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              Create Profile
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Execute Tool Modal */}
      <Modal
        title={`Execute Tool: ${selectedTool?.name}`}
        open={executeModalVisible}
        onCancel={() => setExecuteModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={executeForm}
          layout="vertical"
          onFinish={handleExecuteTool}
        >
          <Form.Item
            name="parameters"
            label="Parameters (JSON)"
          >
            <TextArea rows={6} placeholder='{"key": "value"}' />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              Execute Tool
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Generate Schema Modal */}
      <Modal
        title="Generate Workflow from Prompt"
        open={generateModalVisible}
        onCancel={() => setGenerateModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={generateForm}
          layout="vertical"
          onFinish={handleGenerateSchema}
        >
          <Form.Item
            name="prompt"
            label="Workflow Prompt"
            rules={[{ required: true, message: 'Please enter prompt' }]}
          >
            <TextArea rows={4} placeholder="Describe the workflow you want to create..." />
          </Form.Item>
          <Form.Item
            name="campaignId"
            label="Campaign ID"
          >
            <Input type="number" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              Generate Schema
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* GA4 Configuration Modal */}
      <Modal
        title="Configure GA4 Integration"
        open={gaModalVisible}
        onCancel={() => setGaModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={gaForm}
          layout="vertical"
          onFinish={handleConfigureGA4}
        >
          <Form.Item
            name="campaignId"
            label="Campaign ID"
            rules={[{ required: true, message: 'Please enter campaign ID' }]}
          >
            <Input type="number" />
          </Form.Item>
          <Form.Item
            name="config"
            label="Configuration (JSON)"
            rules={[{ required: true, message: 'Please enter configuration' }]}
          >
            <TextArea rows={6} placeholder='{"propertyId": "G-XXXXXXXXXX", "measurementId": "..."}' />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              Configure
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Snapshot Details Modal */}
      <Modal
        title="Paint Timeline Snapshot Details"
        open={snapshotDetailsVisible}
        onCancel={() => setSnapshotDetailsVisible(false)}
        footer={null}
        width={800}
      >
        {selectedSnapshot && (
          <div>
            <p><strong>ID:</strong> {selectedSnapshot.id}</p>
            <p><strong>URL:</strong> {selectedSnapshot.url}</p>
            <p><strong>Campaign:</strong> {selectedSnapshot.campaignId}</p>
            <p><strong>Created:</strong> {new Date(selectedSnapshot.createdAt).toLocaleString()}</p>
            <pre style={{ background: '#f5f5f5', padding: 16, borderRadius: 4, overflow: 'auto', maxHeight: 400 }}>
              {JSON.stringify(selectedSnapshot, null, 2)}
            </pre>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdvancedWorkflowDashboard;
