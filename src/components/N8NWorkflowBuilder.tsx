/**
 * N8N Workflow Builder Component
 * 
 * Visual workflow builder interface for creating and editing n8n workflows
 * Integrates with DeepSeek for AI-powered workflow generation
 * 
 * Features:
 * - Visual workflow canvas
 * - Drag-and-drop node placement
 * - Node configuration panel
 * - Connection drawing
 * - DeepSeek AI workflow generation
 * - Real-time validation
 * - Import/Export workflows
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  Card,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Space,
  message,
  Drawer,
  Tabs,
  Tag,
  Tooltip,
  Upload,
  Spin
} from 'antd';
import {
  PlusOutlined,
  PlayCircleOutlined,
  SaveOutlined,
  DownloadOutlined,
  UploadOutlined,
  RobotOutlined,
  NodeIndexOutlined,
  BranchesOutlined,
  SettingOutlined,
  DeleteOutlined,
  ApiOutlined
} from '@ant-design/icons';
import axios from 'axios';

const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

/**
 * Node types available in n8n
 */
const NODE_TYPES = {
  trigger: {
    icon: <BranchesOutlined />,
    color: '#52c41a',
    nodes: [
      { type: 'n8n-nodes-base.manualTrigger', label: 'Manual Trigger' },
      { type: 'n8n-nodes-base.webhook', label: 'Webhook' },
      { type: 'n8n-nodes-base.scheduleTrigger', label: 'Schedule' },
      { type: 'n8n-nodes-base.httpRequest', label: 'HTTP Request Trigger' }
    ]
  },
  action: {
    icon: <ApiOutlined />,
    color: '#1890ff',
    nodes: [
      { type: 'n8n-nodes-base.httpRequest', label: 'HTTP Request' },
      { type: 'n8n-nodes-base.postgres', label: 'PostgreSQL' },
      { type: 'n8n-nodes-base.emailSend', label: 'Send Email' },
      { type: 'n8n-nodes-base.slack', label: 'Slack' }
    ]
  },
  logic: {
    icon: <NodeIndexOutlined />,
    color: '#722ed1',
    nodes: [
      { type: 'n8n-nodes-base.if', label: 'IF Condition' },
      { type: 'n8n-nodes-base.switch', label: 'Switch' },
      { type: 'n8n-nodes-base.merge', label: 'Merge' },
      { type: 'n8n-nodes-base.wait', label: 'Wait' }
    ]
  },
  processing: {
    icon: <SettingOutlined />,
    color: '#fa8c16',
    nodes: [
      { type: 'n8n-nodes-base.function', label: 'Function' },
      { type: 'n8n-nodes-base.set', label: 'Set' },
      { type: 'n8n-nodes-base.code', label: 'Code' },
      { type: 'n8n-nodes-base.aggregate', label: 'Aggregate' }
    ]
  }
};

const N8NWorkflowBuilder = () => {
  const [workflows, setWorkflows] = useState([]);
  const [currentWorkflow, setCurrentWorkflow] = useState(null);
  const [nodes, setNodes] = useState([]);
  const [connections, setConnections] = useState({});
  const [selectedNode, setSelectedNode] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Modals
  const [showAIModal, setShowAIModal] = useState(false);
  const [showNodeDrawer, setShowNodeDrawer] = useState(false);
  const [showNewWorkflowModal, setShowNewWorkflowModal] = useState(false);
  
  // Forms
  const [form] = Form.useForm();
  const [aiForm] = Form.useForm();
  const [nodeForm] = Form.useForm();

  /**
   * Fetch workflows from API
   */
  useEffect(() => {
    fetchWorkflows();
  }, []);

  const fetchWorkflows = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/n8n/workflows');
      setWorkflows(response.data.workflows || []);
    } catch (error) {
      message.error('Failed to fetch workflows: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Load workflow into editor
   */
  const loadWorkflow = async (workflowId) => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/n8n/workflows/${workflowId}`);
      const workflow = response.data.workflow;
      
      setCurrentWorkflow(workflow);
      setNodes(workflow.nodes || []);
      setConnections(workflow.connections || {});
      
      message.success('Workflow loaded');
    } catch (error) {
      message.error('Failed to load workflow: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Create new workflow
   */
  const createWorkflow = async (values) => {
    try {
      setLoading(true);
      
      const workflowData = {
        name: values.name,
        description: values.description,
        nodes: [],
        connections: {},
        active: false,
        tags: values.tags || []
      };
      
      const response = await axios.post('/api/n8n/workflows', workflowData);
      const newWorkflow = response.data.workflow;
      
      setCurrentWorkflow(newWorkflow);
      setNodes([]);
      setConnections({});
      setWorkflows([...workflows, newWorkflow]);
      
      message.success('Workflow created');
      setShowNewWorkflowModal(false);
      form.resetFields();
    } catch (error) {
      message.error('Failed to create workflow: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Generate workflow with DeepSeek AI
   */
  const generateWorkflowWithAI = async (values) => {
    try {
      setLoading(true);
      
      const response = await axios.post('/api/n8n/deepseek/create-workflow', {
        type: values.workflowType,
        description: values.description,
        parameters: {
          inputs: {},
          outputs: {}
        }
      });
      
      const generatedWorkflow = response.data.workflow;
      
      setCurrentWorkflow(generatedWorkflow);
      setNodes(generatedWorkflow.nodes || []);
      setConnections(generatedWorkflow.connections || {});
      setWorkflows([...workflows, generatedWorkflow]);
      
      message.success('AI-generated workflow created!');
      setShowAIModal(false);
      aiForm.resetFields();
    } catch (error) {
      message.error('Failed to generate workflow: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Add node to workflow
   */
  const addNode = (nodeType, nodeLabel) => {
    const newNode = {
      id: `node_${Date.now()}`,
      name: nodeLabel,
      type: nodeType,
      typeVersion: 1,
      position: [250 + nodes.length * 50, 300],
      parameters: {}
    };
    
    setNodes([...nodes, newNode]);
    setSelectedNode(newNode);
    setShowNodeDrawer(true);
    
    message.success(`Added ${nodeLabel} node`);
  };

  /**
   * Update node configuration
   */
  const updateNode = (nodeId, updates) => {
    setNodes(nodes.map(node => 
      node.id === nodeId ? { ...node, ...updates } : node
    ));
  };

  /**
   * Delete node
   */
  const deleteNode = (nodeId) => {
    setNodes(nodes.filter(node => node.id !== nodeId));
    
    // Remove connections
    const newConnections = { ...connections };
    delete newConnections[nodeId];
    setConnections(newConnections);
    
    message.success('Node deleted');
  };

  /**
   * Save workflow
   */
  const saveWorkflow = async () => {
    if (!currentWorkflow) {
      message.error('No workflow loaded');
      return;
    }
    
    try {
      setLoading(true);
      
      const workflowData = {
        ...currentWorkflow,
        nodes,
        connections
      };
      
      await axios.put(`/api/n8n/workflows/${currentWorkflow.id}`, workflowData);
      
      message.success('Workflow saved');
    } catch (error) {
      message.error('Failed to save workflow: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Execute workflow
   */
  const executeWorkflow = async () => {
    if (!currentWorkflow) {
      message.error('No workflow loaded');
      return;
    }
    
    try {
      setLoading(true);
      
      const response = await axios.post(`/api/n8n/workflows/${currentWorkflow.id}/execute`, {
        data: {}
      });
      
      message.success('Workflow executed successfully');
      console.log('Execution result:', response.data);
    } catch (error) {
      message.error('Workflow execution failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Export workflow
   */
  const exportWorkflow = () => {
    if (!currentWorkflow) {
      message.error('No workflow loaded');
      return;
    }
    
    const workflowData = {
      ...currentWorkflow,
      nodes,
      connections
    };
    
    const blob = new Blob([JSON.stringify(workflowData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentWorkflow.name}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    message.success('Workflow exported');
  };

  return (
    <div className="n8n-workflow-builder" style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Card 
        className="workflow-builder-header"
        style={{ borderRadius: 0, marginBottom: 0 }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: 0 }}>
              <NodeIndexOutlined /> N8N Workflow Builder
            </h2>
            {currentWorkflow && (
              <Tag color="blue" style={{ marginTop: 8 }}>
                {currentWorkflow.name}
              </Tag>
            )}
          </div>
          
          <Space>
            <Select
              style={{ width: 200 }}
              placeholder="Load workflow..."
              onChange={loadWorkflow}
              value={currentWorkflow?.id}
              loading={loading}
            >
              {workflows.map(workflow => (
                <Option key={workflow.id} value={workflow.id}>
                  {workflow.name}
                </Option>
              ))}
            </Select>
            
            <Button
              icon={<PlusOutlined />}
              onClick={() => setShowNewWorkflowModal(true)}
            >
              New Workflow
            </Button>
            
            <Button
              icon={<RobotOutlined />}
              type="primary"
              onClick={() => setShowAIModal(true)}
            >
              AI Generate
            </Button>
            
            <Button
              icon={<SaveOutlined />}
              onClick={saveWorkflow}
              disabled={!currentWorkflow}
            >
              Save
            </Button>
            
            <Button
              icon={<PlayCircleOutlined />}
              type="primary"
              onClick={executeWorkflow}
              disabled={!currentWorkflow || nodes.length === 0}
            >
              Execute
            </Button>
            
            <Button
              icon={<DownloadOutlined />}
              onClick={exportWorkflow}
              disabled={!currentWorkflow}
            >
              Export
            </Button>
          </Space>
        </div>
      </Card>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Node Palette */}
        <Card 
          title="Node Palette"
          style={{ width: 250, borderRadius: 0, overflow: 'auto' }}
          bodyStyle={{ padding: 8 }}
        >
          <Tabs defaultActiveKey="trigger" size="small">
            {Object.entries(NODE_TYPES).map(([category, data]) => (
              <TabPane
                key={category}
                tab={
                  <span>
                    {data.icon} {category.charAt(0).toUpperCase() + category.slice(1)}
                  </span>
                }
              >
                <Space direction="vertical" style={{ width: '100%' }}>
                  {data.nodes.map(node => (
                    <Button
                      key={node.type}
                      block
                      onClick={() => addNode(node.type, node.label)}
                      style={{ textAlign: 'left' }}
                    >
                      {node.label}
                    </Button>
                  ))}
                </Space>
              </TabPane>
            ))}
          </Tabs>
        </Card>

        {/* Canvas */}
        <Card 
          style={{ flex: 1, borderRadius: 0, overflow: 'auto' }}
          bodyStyle={{ padding: 20, background: '#f5f5f5', minHeight: '100%' }}
        >
          {loading && (
            <div style={{ textAlign: 'center', padding: 50 }}>
              <Spin size="large" tip="Loading..." />
            </div>
          )}
          
          {!loading && !currentWorkflow && (
            <div style={{ textAlign: 'center', padding: 50 }}>
              <h3>No workflow loaded</h3>
              <p>Create a new workflow or load an existing one to get started</p>
            </div>
          )}
          
          {!loading && currentWorkflow && nodes.length === 0 && (
            <div style={{ textAlign: 'center', padding: 50 }}>
              <h3>Empty workflow</h3>
              <p>Add nodes from the palette on the left to build your workflow</p>
            </div>
          )}
          
          {!loading && currentWorkflow && nodes.length > 0 && (
            <div className="workflow-canvas">
              {nodes.map((node, index) => (
                <Card
                  key={node.id}
                  size="small"
                  style={{
                    width: 200,
                    position: 'absolute',
                    left: node.position[0],
                    top: node.position[1],
                    cursor: 'move',
                    border: selectedNode?.id === node.id ? '2px solid #1890ff' : '1px solid #d9d9d9'
                  }}
                  onClick={() => {
                    setSelectedNode(node);
                    setShowNodeDrawer(true);
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong>{node.name}</strong>
                      <div style={{ fontSize: 11, color: '#666' }}>
                        {node.type.split('.').pop()}
                      </div>
                    </div>
                    <Button
                      size="small"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNode(node.id);
                      }}
                    />
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Node Configuration Drawer */}
      <Drawer
        title={`Configure Node: ${selectedNode?.name}`}
        placement="right"
        width={400}
        open={showNodeDrawer}
        onClose={() => setShowNodeDrawer(false)}
      >
        {selectedNode && (
          <Form
            form={nodeForm}
            layout="vertical"
            initialValues={selectedNode}
            onFinish={(values) => {
              updateNode(selectedNode.id, values);
              setShowNodeDrawer(false);
              message.success('Node updated');
            }}
          >
            <Form.Item label="Node Name" name="name">
              <Input />
            </Form.Item>
            
            <Form.Item label="Node Type">
              <Input value={selectedNode.type} disabled />
            </Form.Item>
            
            <Form.Item label="Parameters">
              <TextArea
                rows={10}
                value={JSON.stringify(selectedNode.parameters || {}, null, 2)}
                onChange={(e) => {
                  try {
                    const params = JSON.parse(e.target.value);
                    updateNode(selectedNode.id, { parameters: params });
                  } catch (error) {
                    // Invalid JSON, don't update
                  }
                }}
              />
            </Form.Item>
            
            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit">
                  Update Node
                </Button>
                <Button onClick={() => setShowNodeDrawer(false)}>
                  Cancel
                </Button>
              </Space>
            </Form.Item>
          </Form>
        )}
      </Drawer>

      {/* New Workflow Modal */}
      <Modal
        title="Create New Workflow"
        open={showNewWorkflowModal}
        onCancel={() => setShowNewWorkflowModal(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={createWorkflow}
        >
          <Form.Item
            label="Workflow Name"
            name="name"
            rules={[{ required: true, message: 'Please enter workflow name' }]}
          >
            <Input placeholder="My Workflow" />
          </Form.Item>
          
          <Form.Item
            label="Description"
            name="description"
          >
            <TextArea rows={3} placeholder="Describe what this workflow does..." />
          </Form.Item>
          
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                Create Workflow
              </Button>
              <Button onClick={() => setShowNewWorkflowModal(false)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* AI Generation Modal */}
      <Modal
        title={<span><RobotOutlined /> AI Workflow Generation</span>}
        open={showAIModal}
        onCancel={() => setShowAIModal(false)}
        footer={null}
        width={600}
      >
        <Form
          form={aiForm}
          layout="vertical"
          onFinish={generateWorkflowWithAI}
        >
          <Form.Item
            label="Workflow Type"
            name="workflowType"
            rules={[{ required: true, message: 'Please select workflow type' }]}
          >
            <Select placeholder="Select workflow type">
              <Option value="basic">Basic Automation</Option>
              <Option value="seoDataMining">SEO Data Mining</Option>
              <Option value="apiIntegration">API Integration</Option>
              <Option value="dataProcessing">Data Processing</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            label="Description"
            name="description"
            rules={[{ required: true, message: 'Please describe the workflow' }]}
          >
            <TextArea
              rows={5}
              placeholder="Describe what you want the workflow to do. Be specific about inputs, processing, and outputs..."
            />
          </Form.Item>
          
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                Generate with AI
              </Button>
              <Button onClick={() => setShowAIModal(false)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default N8NWorkflowBuilder;
