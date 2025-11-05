/**
 * Enhanced Visual Workflow Builder
 * 
 * React Flow-based workflow editor inspired by n8n and MCP workflow builder patterns.
 * Features:
 * - Drag-and-drop node editor
 * - Visual workflow design
 * - AI-powered workflow generation
 * - Multi-instance support
 * - Real-time execution visualization
 */

import React, { useState, useCallback, useMemo } from 'react';
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Connection,
  BackgroundVariant,
  Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Card, Button, Space, message, Drawer, Form, Input, Select, Tag, Tooltip } from 'antd';
import {
  PlusOutlined,
  SaveOutlined,
  PlayCircleOutlined,
  RobotOutlined,
  DownloadOutlined,
  SettingOutlined,
  ApiOutlined,
} from '@ant-design/icons';

const { TextArea } = Input;
const { Option } = Select;

// Node type definitions
interface WorkflowNodeData {
  label: string;
  type: string;
  config?: any;
  status?: 'idle' | 'running' | 'success' | 'error';
}

// Available node types for the workflow
const nodeTypes = [
  { 
    type: 'trigger', 
    label: 'Trigger', 
    icon: '▶️', 
    color: '#52c41a',
    category: 'triggers',
    description: 'Start workflow on schedule or event'
  },
  { 
    type: 'webhook', 
    label: 'Webhook', 
    icon: '🌐', 
    color: '#1890ff',
    category: 'triggers',
    description: 'Trigger workflow via HTTP webhook'
  },
  { 
    type: 'httpRequest', 
    label: 'HTTP Request', 
    icon: '📡', 
    color: '#722ed1',
    category: 'actions',
    description: 'Make HTTP API calls'
  },
  { 
    type: 'dataMining', 
    label: 'Data Mining', 
    icon: '⛏️', 
    color: '#1890ff',
    category: 'actions',
    description: 'Extract and mine data'
  },
  { 
    type: 'seoAnalysis', 
    label: 'SEO Analysis', 
    icon: '📊', 
    color: '#722ed1',
    category: 'actions',
    description: 'Analyze SEO metrics'
  },
  { 
    type: 'aiProcess', 
    label: 'AI Processing', 
    icon: '🤖', 
    color: '#fa8c16',
    category: 'actions',
    description: 'AI-powered data processing'
  },
  { 
    type: 'database', 
    label: 'Database', 
    icon: '🗄️', 
    color: '#13c2c2',
    category: 'actions',
    description: 'Database operations'
  },
  { 
    type: 'function', 
    label: 'Function', 
    icon: '⚡', 
    color: '#eb2f96',
    category: 'actions',
    description: 'Custom JavaScript function'
  },
  { 
    type: 'notification', 
    label: 'Notification', 
    icon: '📧', 
    color: '#faad14',
    category: 'actions',
    description: 'Send notifications'
  },
  { 
    type: 'decision', 
    label: 'Decision', 
    icon: '🔀', 
    color: '#2f54eb',
    category: 'logic',
    description: 'Conditional branching'
  },
];

interface EnhancedWorkflowBuilderProps {
  initialWorkflow?: {
    nodes: Node[];
    edges: Edge[];
    name?: string;
    description?: string;
  };
  onSave?: (workflow: any) => void;
  onExecute?: (workflow: any) => void;
}

export const EnhancedWorkflowBuilder: React.FC<EnhancedWorkflowBuilderProps> = ({
  initialWorkflow,
  onSave,
  onExecute,
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialWorkflow?.nodes || []);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialWorkflow?.edges || []);
  const [workflowName, setWorkflowName] = useState(initialWorkflow?.name || 'Untitled Workflow');
  const [workflowDescription, setWorkflowDescription] = useState(initialWorkflow?.description || '');
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [aiDrawerVisible, setAiDrawerVisible] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');

  // Handle new connections between nodes
  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  // Add a new node to the canvas
  const addNode = useCallback((nodeType: string) => {
    const nodeConfig = nodeTypes.find(nt => nt.type === nodeType);
    if (!nodeConfig) return;

    const newNode: Node = {
      id: `node-${Date.now()}`,
      type: 'default',
      position: { x: Math.random() * 500, y: Math.random() * 500 },
      data: {
        label: nodeConfig.label,
        type: nodeType,
        config: {},
      } as WorkflowNodeData,
      style: {
        backgroundColor: nodeConfig.color,
        color: '#fff',
        border: '1px solid #222',
        borderRadius: '8px',
        padding: '10px',
      },
    };

    setNodes((nds) => [...nds, newNode]);
    message.success(`Added ${nodeConfig.label} node`);
  }, [setNodes]);

  // Handle node click for editing
  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
    setDrawerVisible(true);
  }, []);

  // Save workflow
  const handleSave = useCallback(() => {
    const workflow = {
      name: workflowName,
      description: workflowDescription,
      nodes,
      edges,
      updatedAt: new Date().toISOString(),
    };

    if (onSave) {
      onSave(workflow);
    }
    message.success('Workflow saved successfully');
  }, [workflowName, workflowDescription, nodes, edges, onSave]);

  // Execute workflow
  const handleExecute = useCallback(() => {
    const workflow = {
      name: workflowName,
      description: workflowDescription,
      nodes,
      edges,
    };

    if (onExecute) {
      onExecute(workflow);
    }
    message.success('Workflow execution started');
  }, [workflowName, workflowDescription, nodes, edges, onExecute]);

  // AI-powered workflow generation
  const handleAIGenerate = useCallback(async () => {
    if (!aiPrompt.trim()) {
      message.warning('Please enter a description for the workflow');
      return;
    }

    try {
      // Call AI endpoint to generate workflow
      const response = await fetch('/api/workflow-generator/ai-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.nodes) setNodes(data.nodes);
        if (data.edges) setEdges(data.edges);
        if (data.name) setWorkflowName(data.name);
        message.success('Workflow generated successfully');
        setAiDrawerVisible(false);
      } else {
        throw new Error('Failed to generate workflow');
      }
    } catch (error) {
      console.error('AI generation error:', error);
      message.error('Failed to generate workflow with AI');
    }
  }, [aiPrompt, setNodes, setEdges]);

  // Export workflow as JSON
  const handleExport = useCallback(() => {
    const workflow = {
      name: workflowName,
      description: workflowDescription,
      nodes,
      edges,
    };

    const blob = new Blob([JSON.stringify(workflow, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${workflowName.replace(/\s+/g, '-').toLowerCase()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    message.success('Workflow exported');
  }, [workflowName, workflowDescription, nodes, edges]);

  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        fitView
      >
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
        <Controls />
        <MiniMap />
        
        <Panel position="top-left" style={{ margin: 10 }}>
          <Card
            title={workflowName}
            extra={
              <Space>
                <Button
                  type="primary"
                  icon={<RobotOutlined />}
                  onClick={() => setAiDrawerVisible(true)}
                >
                  AI Generate
                </Button>
                <Button icon={<SaveOutlined />} onClick={handleSave}>
                  Save
                </Button>
                <Button 
                  icon={<PlayCircleOutlined />} 
                  type="primary" 
                  onClick={handleExecute}
                >
                  Execute
                </Button>
                <Button icon={<DownloadOutlined />} onClick={handleExport}>
                  Export
                </Button>
              </Space>
            }
            style={{ width: 400 }}
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <strong>Nodes:</strong> {nodes.length}
              </div>
              <div>
                <strong>Connections:</strong> {edges.length}
              </div>
            </Space>
          </Card>
        </Panel>

        <Panel position="top-right" style={{ margin: 10 }}>
          <Card title="Add Nodes" style={{ width: 250 }}>
            <Space direction="vertical" style={{ width: '100%' }} size="small">
              {['triggers', 'actions', 'logic'].map(category => (
                <div key={category}>
                  <div style={{ fontWeight: 'bold', marginBottom: 8, textTransform: 'capitalize' }}>
                    {category}
                  </div>
                  <Space wrap>
                    {nodeTypes
                      .filter(nt => nt.category === category)
                      .map(nodeType => (
                        <Tooltip key={nodeType.type} title={nodeType.description}>
                          <Button
                            size="small"
                            onClick={() => addNode(nodeType.type)}
                            style={{ 
                              backgroundColor: nodeType.color, 
                              color: '#fff',
                              border: 'none'
                            }}
                          >
                            {nodeType.icon} {nodeType.label}
                          </Button>
                        </Tooltip>
                      ))}
                  </Space>
                </div>
              ))}
            </Space>
          </Card>
        </Panel>
      </ReactFlow>

      {/* Node Configuration Drawer */}
      <Drawer
        title={`Configure ${selectedNode?.data?.label || 'Node'}`}
        placement="right"
        width={400}
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
      >
        {selectedNode && (
          <Form layout="vertical">
            <Form.Item label="Node ID">
              <Input value={selectedNode.id} disabled />
            </Form.Item>
            <Form.Item label="Node Type">
              <Input value={selectedNode.data?.type} disabled />
            </Form.Item>
            <Form.Item label="Label">
              <Input
                value={selectedNode.data?.label}
                onChange={(e) => {
                  setNodes((nds) =>
                    nds.map((node) =>
                      node.id === selectedNode.id
                        ? { ...node, data: { ...node.data, label: e.target.value } }
                        : node
                    )
                  );
                }}
              />
            </Form.Item>
            <Form.Item label="Configuration">
              <TextArea
                rows={6}
                placeholder="Enter node configuration as JSON"
                defaultValue={JSON.stringify(selectedNode.data?.config || {}, null, 2)}
                onChange={(e) => {
                  try {
                    const config = JSON.parse(e.target.value);
                    setNodes((nds) =>
                      nds.map((node) =>
                        node.id === selectedNode.id
                          ? { ...node, data: { ...node.data, config } }
                          : node
                      )
                    );
                  } catch (err) {
                    // Invalid JSON, ignore
                  }
                }}
              />
            </Form.Item>
          </Form>
        )}
      </Drawer>

      {/* AI Generation Drawer */}
      <Drawer
        title="AI Workflow Generator"
        placement="right"
        width={500}
        onClose={() => setAiDrawerVisible(false)}
        open={aiDrawerVisible}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <div>
            <p>Describe the workflow you want to create, and AI will generate it for you.</p>
          </div>
          <Form.Item label="Workflow Description">
            <TextArea
              rows={6}
              placeholder="Example: Create a workflow that fetches data from an API, analyzes it with AI, and stores results in a database"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
            />
          </Form.Item>
          <Button
            type="primary"
            icon={<RobotOutlined />}
            onClick={handleAIGenerate}
            block
            size="large"
          >
            Generate Workflow
          </Button>
        </Space>
      </Drawer>
    </div>
  );
};

export default EnhancedWorkflowBuilder;
