/**
 * Visual Workflow Builder Component
 * 
 * Drag-and-drop interface for creating and managing workflows visually.
 * Integrates with DeepSeek for AI-powered workflow suggestions.
 */

import React, { useState, useCallback, useRef } from 'react';
import { Card, Button, Space, message, Modal, Form, Input, Select, Tag, Tooltip } from 'antd';
import {
  PlusOutlined,
  SaveOutlined,
  PlayCircleOutlined,
  RobotOutlined,
  DownloadOutlined,
} from '@ant-design/icons';

const { TextArea } = Input;
const { Option } = Select;

interface WorkflowNode {
  id: string;
  type: string;
  label: string;
  position: { x: number; y: number };
  data: any;
}

interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

interface WorkflowData {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  name: string;
  description: string;
}

const nodeTypes = [
  { type: 'trigger', label: 'Trigger', icon: '▶️', color: '#52c41a' },
  { type: 'dataMining', label: 'Data Mining', icon: '⛏️', color: '#1890ff' },
  { type: 'seoAnalysis', label: 'SEO Analysis', icon: '📊', color: '#722ed1' },
  { type: 'contentGen', label: 'Content Generation', icon: '✍️', color: '#fa8c16' },
  { type: 'monitoring', label: 'Monitoring', icon: '👁️', color: '#13c2c2' },
  { type: 'blockchain', label: 'Blockchain', icon: '⛓️', color: '#eb2f96' },
  { type: 'notification', label: 'Notification', icon: '📧', color: '#faad14' },
  { type: 'decision', label: 'Decision', icon: '🔀', color: '#2f54eb' },
];

export const VisualWorkflowBuilder: React.FC = () => {
  const [workflow, setWorkflow] = useState<WorkflowData>({
    nodes: [],
    edges: [],
    name: 'Untitled Workflow',
    description: '',
  });
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null);
  const [aiModalVisible, setAiModalVisible] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [draggedNodeType, setDraggedNodeType] = useState<string | null>(null);

  // Add new node to workflow
  const addNode = useCallback((type: string, x: number, y: number) => {
    const newNode: WorkflowNode = {
      id: `node-${Date.now()}`,
      type,
      label: nodeTypes.find(nt => nt.type === type)?.label || type,
      position: { x, y },
      data: {
        config: {},
        inputs: [],
        outputs: [],
      },
    };

    setWorkflow(prev => ({
      ...prev,
      nodes: [...prev.nodes, newNode],
    }));

    message.success(`Added ${newNode.label} node`);
  }, []);

  // Handle canvas drop
  const handleCanvasDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedNodeType || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    addNode(draggedNodeType, x, y);
    setDraggedNodeType(null);
  };

  // Connect nodes
  const connectNodes = (sourceId: string, targetId: string) => {
    const newEdge: WorkflowEdge = {
      id: `edge-${Date.now()}`,
      source: sourceId,
      target: targetId,
    };

    setWorkflow(prev => ({
      ...prev,
      edges: [...prev.edges, newEdge],
    }));

    message.success('Nodes connected');
  };

  // Generate workflow from AI
  const generateFromAI = async () => {
    if (!aiPrompt.trim()) {
      message.warning('Please enter a workflow description');
      return;
    }

    try {
      message.loading('Generating workflow with DeepSeek...', 0);
      
      // Call Ollama service to generate workflow
      const response = await fetch('/api/deepseek/generate-workflow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt }),
      });

      if (!response.ok) throw new Error('Failed to generate workflow');

      const generated = await response.json();
      
      // Convert generated workflow to visual format
      const visualWorkflow = convertToVisualWorkflow(generated);
      setWorkflow(visualWorkflow);

      message.destroy();
      message.success('Workflow generated successfully!');
      setAiModalVisible(false);
      setAiPrompt('');
    } catch (error) {
      message.destroy();
      message.error('Failed to generate workflow');
      console.error(error);
    }
  };

  // Convert API response to visual workflow
  const convertToVisualWorkflow = (generated: any): WorkflowData => {
    const nodes: WorkflowNode[] = [];
    const edges: WorkflowEdge[] = [];
    
    let x = 100;
    let y = 100;

    if (generated.steps) {
      generated.steps.forEach((step: any, index: number) => {
        const node: WorkflowNode = {
          id: step.id || `node-${index}`,
          type: step.type || 'dataMining',
          label: step.name || `Step ${index + 1}`,
          position: { x: x + (index * 200), y },
          data: step.config || {},
        };
        nodes.push(node);

        // Connect to previous node
        if (index > 0) {
          edges.push({
            id: `edge-${index}`,
            source: nodes[index - 1].id,
            target: node.id,
          });
        }
      });
    }

    return {
      nodes,
      edges,
      name: generated.name || 'AI Generated Workflow',
      description: generated.description || '',
    };
  };

  // Save workflow
  const saveWorkflow = async () => {
    try {
      const response = await fetch('/api/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workflow),
      });

      if (!response.ok) throw new Error('Failed to save workflow');

      message.success('Workflow saved successfully!');
    } catch (error) {
      message.error('Failed to save workflow');
      console.error(error);
    }
  };

  // Execute workflow
  const executeWorkflow = async () => {
    try {
      message.loading('Executing workflow...', 0);
      
      const response = await fetch('/api/workflows/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workflow),
      });

      if (!response.ok) throw new Error('Execution failed');

      const result = await response.json();
      
      message.destroy();
      message.success(`Workflow executed successfully! ID: ${result.executionId}`);
    } catch (error) {
      message.destroy();
      message.error('Workflow execution failed');
      console.error(error);
    }
  };

  // Export workflow
  const exportWorkflow = () => {
    const dataStr = JSON.stringify(workflow, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `${workflow.name.replace(/\s+/g, '-')}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <Card
      title={
        <Space>
          <span>Visual Workflow Builder</span>
          <Tag color="blue">{workflow.nodes.length} Nodes</Tag>
          <Tag color="green">{workflow.edges.length} Connections</Tag>
        </Space>
      }
      extra={
        <Space>
          <Button
            icon={<RobotOutlined />}
            onClick={() => setAiModalVisible(true)}
          >
            AI Generate
          </Button>
          <Button icon={<SaveOutlined />} onClick={saveWorkflow}>
            Save
          </Button>
          <Button
            icon={<PlayCircleOutlined />}
            type="primary"
            onClick={executeWorkflow}
            disabled={workflow.nodes.length === 0}
          >
            Execute
          </Button>
          <Button icon={<DownloadOutlined />} onClick={exportWorkflow}>
            Export
          </Button>
        </Space>
      }
    >
      <div style={{ display: 'flex', height: 600 }}>
        {/* Node Palette */}
        <div
          style={{
            width: 200,
            borderRight: '1px solid #d9d9d9',
            padding: 16,
            overflowY: 'auto',
          }}
        >
          <h4>Node Types</h4>
          <Space direction="vertical" style={{ width: '100%' }}>
            {nodeTypes.map(nodeType => (
              <div
                key={nodeType.type}
                draggable
                onDragStart={() => setDraggedNodeType(nodeType.type)}
                style={{
                  padding: '8px 12px',
                  border: '1px solid #d9d9d9',
                  borderRadius: 4,
                  cursor: 'move',
                  background: '#fff',
                  transition: 'all 0.3s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = nodeType.color;
                  e.currentTarget.style.color = '#fff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#fff';
                  e.currentTarget.style.color = '#000';
                }}
              >
                <span>{nodeType.icon}</span>
                <span style={{ marginLeft: 8 }}>{nodeType.label}</span>
              </div>
            ))}
          </Space>
        </div>

        {/* Canvas */}
        <div
          ref={canvasRef}
          style={{
            flex: 1,
            background: 'linear-gradient(90deg, #f0f0f0 1px, transparent 1px), linear-gradient(#f0f0f0 1px, transparent 1px)',
            backgroundSize: '20px 20px',
            position: 'relative',
            overflow: 'hidden',
          }}
          onDrop={handleCanvasDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          {/* Render nodes */}
          {workflow.nodes.map(node => {
            const nodeType = nodeTypes.find(nt => nt.type === node.type);
            return (
              <div
                key={node.id}
                onClick={() => setSelectedNode(node)}
                style={{
                  position: 'absolute',
                  left: node.position.x,
                  top: node.position.y,
                  padding: '12px 16px',
                  background: nodeType?.color || '#1890ff',
                  color: '#fff',
                  borderRadius: 8,
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  border: selectedNode?.id === node.id ? '3px solid #fff' : 'none',
                  minWidth: 120,
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: 24 }}>{nodeType?.icon}</div>
                <div style={{ marginTop: 4, fontWeight: 'bold' }}>{node.label}</div>
              </div>
            );
          })}

          {/* Render edges (simplified SVG lines) */}
          <svg
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
            }}
          >
            {workflow.edges.map(edge => {
              const source = workflow.nodes.find(n => n.id === edge.source);
              const target = workflow.nodes.find(n => n.id === edge.target);
              if (!source || !target) return null;

              return (
                <line
                  key={edge.id}
                  x1={source.position.x + 60}
                  y1={source.position.y + 30}
                  x2={target.position.x + 60}
                  y2={target.position.y + 30}
                  stroke="#1890ff"
                  strokeWidth="2"
                  markerEnd="url(#arrowhead)"
                />
              );
            })}
            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="10"
                refX="9"
                refY="3"
                orient="auto"
              >
                <polygon points="0 0, 10 3, 0 6" fill="#1890ff" />
              </marker>
            </defs>
          </svg>

          {workflow.nodes.length === 0 && (
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center',
                color: '#999',
              }}
            >
              <p style={{ fontSize: 18, marginBottom: 8 }}>
                Drag nodes from the palette to start building
              </p>
              <p>or use AI to generate a workflow</p>
            </div>
          )}
        </div>

        {/* Properties Panel */}
        {selectedNode && (
          <div
            style={{
              width: 250,
              borderLeft: '1px solid #d9d9d9',
              padding: 16,
              overflowY: 'auto',
            }}
          >
            <h4>Node Properties</h4>
            <Form layout="vertical">
              <Form.Item label="Label">
                <Input
                  value={selectedNode.label}
                  onChange={(e) => {
                    setWorkflow(prev => ({
                      ...prev,
                      nodes: prev.nodes.map(n =>
                        n.id === selectedNode.id ? { ...n, label: e.target.value } : n
                      ),
                    }));
                    setSelectedNode({ ...selectedNode, label: e.target.value });
                  }}
                />
              </Form.Item>
              <Form.Item label="Type">
                <Select value={selectedNode.type} disabled>
                  {nodeTypes.map(nt => (
                    <Option key={nt.type} value={nt.type}>
                      {nt.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item label="Configuration">
                <TextArea
                  rows={4}
                  value={JSON.stringify(selectedNode.data, null, 2)}
                  onChange={(e) => {
                    try {
                      const data = JSON.parse(e.target.value);
                      setWorkflow(prev => ({
                        ...prev,
                        nodes: prev.nodes.map(n =>
                          n.id === selectedNode.id ? { ...n, data } : n
                        ),
                      }));
                      setSelectedNode({ ...selectedNode, data });
                    } catch (err) {
                      // Invalid JSON, ignore
                    }
                  }}
                />
              </Form.Item>
              <Button
                danger
                onClick={() => {
                  setWorkflow(prev => ({
                    ...prev,
                    nodes: prev.nodes.filter(n => n.id !== selectedNode.id),
                    edges: prev.edges.filter(
                      e => e.source !== selectedNode.id && e.target !== selectedNode.id
                    ),
                  }));
                  setSelectedNode(null);
                  message.success('Node deleted');
                }}
              >
                Delete Node
              </Button>
            </Form>
          </div>
        )}
      </div>

      {/* AI Generation Modal */}
      <Modal
        title={<Space><RobotOutlined />Generate Workflow with AI</Space>}
        open={aiModalVisible}
        onOk={generateFromAI}
        onCancel={() => {
          setAiModalVisible(false);
          setAiPrompt('');
        }}
        okText="Generate"
        width={600}
      >
        <Form layout="vertical">
          <Form.Item label="Describe your workflow">
            <TextArea
              rows={6}
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="E.g., Create a workflow that crawls competitor websites, analyzes their SEO, extracts valuable keywords, and stores them in a database for training data..."
            />
          </Form.Item>
          <p style={{ color: '#999', fontSize: 12 }}>
            DeepSeek will analyze your description and generate an optimal workflow structure.
          </p>
        </Form>
      </Modal>
    </Card>
  );
};
