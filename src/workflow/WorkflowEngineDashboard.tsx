import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import {
  Workflow,
  Play,
  Pause,
  Square,
  RotateCcw,
  Settings,
  Plus,
  Minus,
  Edit3,
  Save,
  Eye,
  Zap,
  Brain,
  Database,
  Globe,
  Search,
  Filter,
  ArrowRight,
  GitBranch,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  Target,
  BarChart3,
  Layers,
  Cpu,
  Network,
  Code,
  FileText,
  Download,
  Upload,
  RefreshCw,
  Maximize2,
  Minimize2,
  X,
  Move,
  Copy,
  Trash2
} from 'lucide-react';

// Workflow Engine Types
interface WorkflowNode {
  id: string;
  type: 'data_source' | 'data_processor' | 'ml_model' | 'api_call' | 'condition' | 'output' | 'custom';
  name: string;
  description: string;
  position: { x: number; y: number };
  config: Record<string, any>;
  inputs: string[]; // Connection point IDs
  outputs: string[]; // Connection point IDs
  status: 'idle' | 'running' | 'completed' | 'error';
  executionTime?: number;
  lastExecuted?: Date;
  error?: string;
}

interface WorkflowConnection {
  id: string;
  sourceNodeId: string;
  sourceOutputId: string;
  targetNodeId: string;
  targetInputId: string;
  data?: any;
}

interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: 'idle' | 'running' | 'completed' | 'failed' | 'paused';
  startTime?: Date;
  endTime?: Date;
  duration?: number;
  currentNodeId?: string;
  nodeResults: Map<string, any>;
  logs: WorkflowLog[];
  progress: number;
}

interface WorkflowLog {
  timestamp: Date;
  level: 'info' | 'warning' | 'error';
  nodeId: string;
  message: string;
  data?: any;
}

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  nodes: Omit<WorkflowNode, 'id'>[];
  connections: Omit<WorkflowConnection, 'id'>[];
  tags: string[];
  usage: number;
}

// Node Type Definitions
const NODE_TYPES = {
  data_source: {
    name: 'Data Source',
    description: 'Load data from various sources',
    icon: Database,
    color: 'blue',
    inputs: [],
    outputs: ['data'],
    defaultConfig: {
      source: 'file',
      path: '',
      format: 'json'
    }
  },
  data_processor: {
    name: 'Data Processor',
    description: 'Transform and process data',
    icon: Cpu,
    color: 'green',
    inputs: ['input'],
    outputs: ['output'],
    defaultConfig: {
      operation: 'filter',
      params: {}
    }
  },
  ml_model: {
    name: 'ML Model',
    description: 'Run machine learning predictions',
    icon: Brain,
    color: 'purple',
    inputs: ['data'],
    outputs: ['predictions', 'confidence'],
    defaultConfig: {
      modelId: '',
      version: 'latest'
    }
  },
  api_call: {
    name: 'API Call',
    description: 'Make HTTP API requests',
    icon: Globe,
    color: 'orange',
    inputs: ['trigger'],
    outputs: ['response', 'error'],
    defaultConfig: {
      method: 'GET',
      url: '',
      headers: {}
    }
  },
  condition: {
    name: 'Condition',
    description: 'Conditional logic and branching',
    icon: GitBranch,
    color: 'yellow',
    inputs: ['input'],
    outputs: ['true', 'false'],
    defaultConfig: {
      condition: '',
      operator: 'equals'
    }
  },
  output: {
    name: 'Output',
    description: 'Final output and results',
    icon: Target,
    color: 'red',
    inputs: ['input'],
    outputs: [],
    defaultConfig: {
      format: 'json',
      destination: 'console'
    }
  }
};

// Workflow Engine Class
class WorkflowEngine {
  private workflows: Map<string, { nodes: WorkflowNode[]; connections: WorkflowConnection[] }> = new Map();
  private executions: Map<string, WorkflowExecution> = new Map();
  private templates: WorkflowTemplate[] = [];
  private onUpdateCallbacks: Set<(workflowId: string, data: any) => void> = new Set();

  constructor() {
    this.initializeTemplates();
  }

  private initializeTemplates(): void {
    this.templates = [
      {
        id: 'seo-analysis-workflow',
        name: 'SEO Analysis Pipeline',
        description: 'Complete SEO analysis from data collection to insights',
        category: 'SEO',
        nodes: [
          {
            type: 'data_source',
            name: 'Load SEO Data',
            description: 'Load website SEO metrics',
            position: { x: 100, y: 100 },
            config: { source: 'api', path: '/api/seo-data' },
            inputs: [],
            outputs: ['data'],
            status: 'idle'
          },
          {
            type: 'data_processor',
            name: 'Process SEO Metrics',
            description: 'Clean and normalize SEO data',
            position: { x: 350, y: 100 },
            config: { operation: 'normalize' },
            inputs: ['input'],
            outputs: ['output'],
            status: 'idle'
          },
          {
            type: 'ml_model',
            name: 'SEO Score Predictor',
            description: 'Predict SEO performance scores',
            position: { x: 600, y: 100 },
            config: { modelId: 'seo-predictor' },
            inputs: ['data'],
            outputs: ['predictions'],
            status: 'idle'
          },
          {
            type: 'output',
            name: 'Save Results',
            description: 'Save analysis results',
            position: { x: 850, y: 100 },
            config: { destination: 'database' },
            inputs: ['input'],
            outputs: [],
            status: 'idle'
          }
        ],
        connections: [
          {
            sourceNodeId: 'node-0',
            sourceOutputId: 'data',
            targetNodeId: 'node-1',
            targetInputId: 'input'
          },
          {
            sourceNodeId: 'node-1',
            sourceOutputId: 'output',
            targetNodeId: 'node-2',
            targetInputId: 'data'
          },
          {
            sourceNodeId: 'node-2',
            sourceOutputId: 'predictions',
            targetNodeId: 'node-3',
            targetInputId: 'input'
          }
        ],
        tags: ['seo', 'analysis', 'ml'],
        usage: 45
      },
      {
        id: 'content-generation-workflow',
        name: 'Content Generation Pipeline',
        description: 'Generate optimized content using AI models',
        category: 'Content',
        nodes: [
          {
            type: 'data_source',
            name: 'Load Keywords',
            description: 'Load target keywords and topics',
            position: { x: 100, y: 100 },
            config: { source: 'database', table: 'keywords' },
            inputs: [],
            outputs: ['data'],
            status: 'idle'
          },
          {
            type: 'ml_model',
            name: 'Content Generator',
            description: 'Generate content using AI',
            position: { x: 350, y: 100 },
            config: { modelId: 'content-generator' },
            inputs: ['data'],
            outputs: ['content'],
            status: 'idle'
          },
          {
            type: 'data_processor',
            name: 'SEO Optimize',
            description: 'Optimize content for SEO',
            position: { x: 600, y: 100 },
            config: { operation: 'seo_optimize' },
            inputs: ['input'],
            outputs: ['output'],
            status: 'idle'
          },
          {
            type: 'output',
            name: 'Publish Content',
            description: 'Publish optimized content',
            position: { x: 850, y: 100 },
            config: { destination: 'cms' },
            inputs: ['input'],
            outputs: [],
            status: 'idle'
          }
        ],
        connections: [
          {
            sourceNodeId: 'node-0',
            sourceOutputId: 'data',
            targetNodeId: 'node-1',
            targetInputId: 'data'
          },
          {
            sourceNodeId: 'node-1',
            sourceOutputId: 'content',
            targetNodeId: 'node-2',
            targetInputId: 'input'
          },
          {
            sourceNodeId: 'node-2',
            sourceOutputId: 'output',
            targetNodeId: 'node-3',
            targetInputId: 'input'
          }
        ],
        tags: ['content', 'generation', 'seo'],
        usage: 32
      }
    ];
  }

  createWorkflow(name: string, description: string): string {
    const workflowId = `workflow-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.workflows.set(workflowId, {
      nodes: [],
      connections: []
    });

    console.log(`📝 Created workflow: ${name}`);
    return workflowId;
  }

  addNode(workflowId: string, node: Omit<WorkflowNode, 'id'>): string {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) throw new Error('Workflow not found');

    const nodeId = `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newNode: WorkflowNode = {
      ...node,
      id: nodeId
    };

    workflow.nodes.push(newNode);
    this.notifyUpdate(workflowId, { type: 'node_added', node: newNode });

    return nodeId;
  }

  removeNode(workflowId: string, nodeId: string): boolean {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) return false;

    const nodeIndex = workflow.nodes.findIndex(n => n.id === nodeId);
    if (nodeIndex === -1) return false;

    workflow.nodes.splice(nodeIndex, 1);

    // Remove connections to/from this node
    workflow.connections = workflow.connections.filter(
      c => c.sourceNodeId !== nodeId && c.targetNodeId !== nodeId
    );

    this.notifyUpdate(workflowId, { type: 'node_removed', nodeId });
    return true;
  }

  addConnection(workflowId: string, connection: Omit<WorkflowConnection, 'id'>): string {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) throw new Error('Workflow not found');

    const connectionId = `connection-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newConnection: WorkflowConnection = {
      ...connection,
      id: connectionId
    };

    workflow.connections.push(newConnection);
    this.notifyUpdate(workflowId, { type: 'connection_added', connection: newConnection });

    return connectionId;
  }

  updateNode(workflowId: string, nodeId: string, updates: Partial<WorkflowNode>): boolean {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) return false;

    const node = workflow.nodes.find(n => n.id === nodeId);
    if (!node) return false;

    Object.assign(node, updates);
    this.notifyUpdate(workflowId, { type: 'node_updated', nodeId, updates });

    return true;
  }

  async executeWorkflow(workflowId: string): Promise<string> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) throw new Error('Workflow not found');

    const executionId = `execution-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const execution: WorkflowExecution = {
      id: executionId,
      workflowId,
      status: 'running',
      startTime: new Date(),
      nodeResults: new Map(),
      logs: [],
      progress: 0
    };

    this.executions.set(executionId, execution);

    // Start execution in background
    this.executeWorkflowAsync(workflow, execution);

    console.log(`▶️ Started workflow execution: ${executionId}`);
    return executionId;
  }

  private async executeWorkflowAsync(workflow: { nodes: WorkflowNode[]; connections: WorkflowConnection[] }, execution: WorkflowExecution): Promise<void> {
    try {
      // Reset all nodes
      workflow.nodes.forEach(node => {
        node.status = 'idle';
        node.error = undefined;
        node.executionTime = undefined;
        node.lastExecuted = undefined;
      });

      // Get execution order based on dependencies
      const executionOrder = this.getExecutionOrder(workflow.nodes, workflow.connections);

      for (const nodeId of executionOrder) {
        const node = workflow.nodes.find(n => n.id === nodeId);
        if (!node) continue;

        execution.currentNodeId = nodeId;
        node.status = 'running';
        node.lastExecuted = new Date();

        this.addLog(execution, 'info', nodeId, `Starting execution of ${node.name}`);

        try {
          // Simulate node execution
          const result = await this.executeNode(node, workflow.connections, execution);
          execution.nodeResults.set(nodeId, result);

          node.status = 'completed';
          node.executionTime = Date.now() - node.lastExecuted!.getTime();

          this.addLog(execution, 'info', nodeId, `Completed execution in ${node.executionTime}ms`);

          // Update progress
          const completedNodes = workflow.nodes.filter(n => n.status === 'completed').length;
          execution.progress = (completedNodes / workflow.nodes.length) * 100;

        } catch (error) {
          node.status = 'error';
          node.error = error instanceof Error ? error.message : 'Execution failed';
          this.addLog(execution, 'error', nodeId, node.error);

          execution.status = 'failed';
          execution.endTime = new Date();
          execution.duration = execution.endTime.getTime() - (execution.startTime?.getTime() || 0);

          return;
        }
      }

      execution.status = 'completed';
      execution.endTime = new Date();
      execution.duration = execution.endTime.getTime() - (execution.startTime?.getTime() || 0);
      execution.progress = 100;

      this.addLog(execution, 'info', '', 'Workflow execution completed successfully');

    } catch (error) {
      execution.status = 'failed';
      execution.endTime = new Date();
      execution.duration = execution.endTime.getTime() - (execution.startTime?.getTime() || 0);
      execution.error = error instanceof Error ? error.message : 'Workflow execution failed';

      this.addLog(execution, 'error', '', execution.error);
    }
  }

  private getExecutionOrder(nodes: WorkflowNode[], connections: WorkflowConnection[]): string[] {
    const order: string[] = [];
    const visited = new Set<string>();
    const visiting = new Set<string>();

    const visit = (nodeId: string) => {
      if (visited.has(nodeId)) return;
      if (visiting.has(nodeId)) throw new Error('Circular dependency detected');

      visiting.add(nodeId);

      // Visit dependencies first
      const dependencies = connections
        .filter(c => c.targetNodeId === nodeId)
        .map(c => c.sourceNodeId);

      for (const dep of dependencies) {
        visit(dep);
      }

      visiting.delete(nodeId);
      visited.add(nodeId);
      order.push(nodeId);
    };

    // Visit all nodes
    for (const node of nodes) {
      if (!visited.has(node.id)) {
        visit(node.id);
      }
    }

    return order;
  }

  private async executeNode(node: WorkflowNode, connections: WorkflowConnection[], execution: WorkflowExecution): Promise<any> {
    // Simulate node execution based on type
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1500));

    switch (node.type) {
      case 'data_source':
        return { type: 'data', records: Math.floor(Math.random() * 1000) + 100 };

      case 'data_processor':
        const inputConnection = connections.find(c => c.targetNodeId === node.id);
        if (inputConnection) {
          const inputData = execution.nodeResults.get(inputConnection.sourceNodeId);
          return { ...inputData, processed: true };
        }
        return { processed: true };

      case 'ml_model':
        return {
          predictions: Array.from({ length: 10 }, () => Math.random()),
          confidence: Math.random() * 0.3 + 0.7
        };

      case 'api_call':
        return {
          status: 200,
          data: { success: true, timestamp: new Date().toISOString() }
        };

      case 'condition':
        return { result: Math.random() > 0.5 };

      case 'output':
        return { saved: true, destination: node.config.destination };

      default:
        return { result: 'executed' };
    }
  }

  private addLog(execution: WorkflowExecution, level: WorkflowLog['level'], nodeId: string, message: string, data?: any): void {
    execution.logs.push({
      timestamp: new Date(),
      level,
      nodeId,
      message,
      data
    });
  }

  getWorkflow(workflowId: string): { nodes: WorkflowNode[]; connections: WorkflowConnection[] } | undefined {
    return this.workflows.get(workflowId);
  }

  getExecution(executionId: string): WorkflowExecution | undefined {
    return this.executions.get(executionId);
  }

  getTemplates(): WorkflowTemplate[] {
    return [...this.templates];
  }

  loadTemplate(workflowId: string, templateId: string): boolean {
    const template = this.templates.find(t => t.id === templateId);
    if (!template) return false;

    // Convert template nodes to workflow nodes with IDs
    const nodes: WorkflowNode[] = template.nodes.map((node, index) => ({
      ...node,
      id: `node-${index}`
    }));

    // Convert template connections to workflow connections
    const connections: WorkflowConnection[] = template.connections.map((conn, index) => ({
      ...conn,
      id: `connection-${index}`,
      sourceNodeId: `node-${template.nodes.findIndex(n => n === conn.sourceNodeId)}`,
      targetNodeId: `node-${template.nodes.findIndex(n => n === conn.targetNodeId)}`
    }));

    this.workflows.set(workflowId, { nodes, connections });

    // Increment template usage
    template.usage++;

    console.log(`📋 Loaded template: ${template.name} into workflow ${workflowId}`);
    return true;
  }

  onWorkflowUpdate(callback: (workflowId: string, data: any) => void): () => void {
    this.onUpdateCallbacks.add(callback);
    return () => this.onUpdateCallbacks.delete(callback);
  }

  private notifyUpdate(workflowId: string, data: any): void {
    this.onUpdateCallbacks.forEach(callback => callback(workflowId, data));
  }
}

// Global workflow engine instance
const workflowEngine = new WorkflowEngine();

// React Components
export const WorkflowDesigner: React.FC<{
  workflowId: string;
  className?: string;
}> = ({ workflowId, className }) => {
  const [workflow, setWorkflow] = useState(workflowEngine.getWorkflow(workflowId));
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null);
  const [draggedNode, setDraggedNode] = useState<WorkflowNode | null>(null);
  const [connecting, setConnecting] = useState<{ sourceNode: string; sourceOutput: string } | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = workflowEngine.onWorkflowUpdate((updatedWorkflowId, data) => {
      if (updatedWorkflowId === workflowId) {
        setWorkflow(workflowEngine.getWorkflow(workflowId));
      }
    });

    return unsubscribe;
  }, [workflowId]);

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Add node at click position
    const nodeType = 'data_source'; // Default for demo
    const nodeId = workflowEngine.addNode(workflowId, {
      type: nodeType,
      name: `${NODE_TYPES[nodeType].name} ${Date.now()}`,
      description: NODE_TYPES[nodeType].description,
      position: { x, y },
      config: NODE_TYPES[nodeType].defaultConfig,
      inputs: NODE_TYPES[nodeType].inputs,
      outputs: NODE_TYPES[nodeType].outputs,
      status: 'idle'
    });
  };

  const handleNodeDragStart = (node: WorkflowNode) => {
    setDraggedNode(node);
  };

  const handleNodeDragEnd = (node: WorkflowNode, newPosition: { x: number; y: number }) => {
    workflowEngine.updateNode(workflowId, node.id, { position: newPosition });
    setDraggedNode(null);
  };

  const handleConnectionStart = (nodeId: string, outputId: string) => {
    setConnecting({ sourceNode: nodeId, sourceOutput: outputId });
  };

  const handleConnectionEnd = (nodeId: string, inputId: string) => {
    if (connecting && connecting.sourceNode !== nodeId) {
      workflowEngine.addConnection(workflowId, {
        sourceNodeId: connecting.sourceNode,
        sourceOutputId: connecting.sourceOutput,
        targetNodeId: nodeId,
        targetInputId: inputId
      });
    }
    setConnecting(null);
  };

  if (!workflow) {
    return <div className="text-center py-8">Workflow not found</div>;
  }

  return (
    <div className={cn('relative bg-gray-50 dark:bg-gray-900 rounded-lg border', className)}>
      {/* Toolbar */}
      <div className="flex items-center gap-2 p-4 border-b bg-white dark:bg-gray-800">
        <h3 className="text-lg font-semibold">Workflow Designer</h3>
        <div className="ml-auto flex items-center gap-2">
          {Object.entries(NODE_TYPES).map(([type, config]) => (
            <button
              key={type}
              onClick={() => {
                const nodeId = workflowEngine.addNode(workflowId, {
                  type: type as WorkflowNode['type'],
                  name: `${config.name} ${Date.now()}`,
                  description: config.description,
                  position: { x: Math.random() * 400 + 100, y: Math.random() * 300 + 100 },
                  config: config.defaultConfig,
                  inputs: config.inputs,
                  outputs: config.outputs,
                  status: 'idle'
                });
              }}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded text-white text-sm',
                `bg-${config.color}-600 hover:bg-${config.color}-700`
              )}
            >
              <config.icon className="h-4 w-4" />
              {config.name}
            </button>
          ))}
        </div>
      </div>

      {/* Canvas */}
      <div
        ref={canvasRef}
        className="relative h-96 overflow-auto cursor-crosshair"
        onClick={handleCanvasClick}
      >
        {/* Grid Background */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(to right, #e5e7eb 1px, transparent 1px),
              linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px'
          }}
        />

        {/* Connections */}
        <svg className="absolute inset-0 pointer-events-none">
          {workflow.connections.map(connection => {
            const sourceNode = workflow.nodes.find(n => n.id === connection.sourceNodeId);
            const targetNode = workflow.nodes.find(n => n.id === connection.targetNodeId);

            if (!sourceNode || !targetNode) return null;

            const sourceX = sourceNode.position.x + 150; // Node width / 2
            const sourceY = sourceNode.position.y + 40; // Approximate output position
            const targetX = targetNode.position.x + 150;
            const targetY = targetNode.position.y - 10; // Approximate input position

            return (
              <g key={connection.id}>
                <path
                  d={`M ${sourceX} ${sourceY} Q ${(sourceX + targetX) / 2} ${sourceY} ${(sourceX + targetX) / 2} ${(sourceY + targetY) / 2} Q ${(sourceX + targetX) / 2} ${targetY} ${targetX} ${targetY}`}
                  stroke="#6b7280"
                  strokeWidth="2"
                  fill="none"
                  markerEnd="url(#arrowhead)"
                />
              </g>
            );
          })}
          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#6b7280" />
            </marker>
          </defs>
        </svg>

        {/* Nodes */}
        {workflow.nodes.map(node => (
          <WorkflowNodeComponent
            key={node.id}
            node={node}
            isSelected={selectedNode?.id === node.id}
            isDragged={draggedNode?.id === node.id}
            onSelect={() => setSelectedNode(node)}
            onDragStart={() => handleNodeDragStart(node)}
            onDragEnd={(position) => handleNodeDragEnd(node, position)}
            onConnectionStart={(outputId) => handleConnectionStart(node.id, outputId)}
            onConnectionEnd={(inputId) => handleConnectionEnd(node.id, inputId)}
            isConnecting={connecting?.sourceNode === node.id}
          />
        ))}
      </div>

      {/* Node Configuration Panel */}
      {selectedNode && (
        <div className="absolute top-4 right-4 w-80 bg-white dark:bg-gray-800 rounded-lg border shadow-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold">{selectedNode.name}</h4>
            <Button
              onClick={() => setSelectedNode(null)}
              variant="ghost"
              size="sm"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                value={selectedNode.name}
                onChange={(e) => workflowEngine.updateNode(workflowId, selectedNode.id, { name: e.target.value })}
                className="w-full p-2 border rounded text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={selectedNode.description}
                onChange={(e) => workflowEngine.updateNode(workflowId, selectedNode.id, { description: e.target.value })}
                className="w-full p-2 border rounded text-sm"
                rows={2}
              />
            </div>

            {/* Node-specific configuration */}
            {selectedNode.type === 'data_source' && (
              <div className="space-y-2">
                <div>
                  <label className="block text-sm font-medium mb-1">Source Type</label>
                  <select
                    value={selectedNode.config.source}
                    onChange={(e) => workflowEngine.updateNode(workflowId, selectedNode.id, {
                      config: { ...selectedNode.config, source: e.target.value }
                    })}
                    className="w-full p-2 border rounded text-sm"
                  >
                    <option value="file">File</option>
                    <option value="api">API</option>
                    <option value="database">Database</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Path/URL</label>
                  <input
                    type="text"
                    value={selectedNode.config.path}
                    onChange={(e) => workflowEngine.updateNode(workflowId, selectedNode.id, {
                      config: { ...selectedNode.config, path: e.target.value }
                    })}
                    className="w-full p-2 border rounded text-sm"
                    placeholder="Enter path or URL"
                  />
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-4 border-t">
              <Button
                onClick={() => workflowEngine.removeNode(workflowId, selectedNode.id)}
                variant="outline"
                size="sm"
                className="text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const WorkflowNodeComponent: React.FC<{
  node: WorkflowNode;
  isSelected: boolean;
  isDragged: boolean;
  onSelect: () => void;
  onDragStart: () => void;
  onDragEnd: (position: { x: number; y: number }) => void;
  onConnectionStart: (outputId: string) => void;
  onConnectionEnd: (inputId: string) => void;
  isConnecting: boolean;
}> = ({
  node,
  isSelected,
  isDragged,
  onSelect,
  onDragStart,
  onDragEnd,
  onConnectionStart,
  onConnectionEnd,
  isConnecting
}) => {
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target !== e.currentTarget) return; // Don't drag if clicking on inputs/outputs

    onDragStart();
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragged) return;

    const canvas = document.querySelector('[data-canvas]');
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left - dragOffset.x;
    const y = e.clientY - rect.top - dragOffset.y;

    onDragEnd({ x: Math.max(0, x), y: Math.max(0, y) });
  };

  const handleMouseUp = () => {
    if (isDragged) {
      onDragEnd(node.position);
    }
  };

  useEffect(() => {
    if (isDragged) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragged]);

  const nodeType = NODE_TYPES[node.type];
  const Icon = nodeType.icon;

  return (
    <div
      className={cn(
        'absolute w-40 bg-white dark:bg-gray-800 border rounded-lg shadow-sm cursor-move select-none',
        isSelected && 'ring-2 ring-blue-500',
        isDragged && 'z-10 shadow-lg',
        isConnecting && 'ring-2 ring-green-500'
      )}
      style={{
        left: node.position.x,
        top: node.position.y,
        transform: isDragged ? 'scale(1.05)' : 'scale(1)',
        transition: isDragged ? 'none' : 'transform 0.2s'
      }}
      onMouseDown={handleMouseDown}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      {/* Header */}
      <div className={cn(
        'flex items-center gap-2 p-2 border-b rounded-t-lg',
        `bg-${nodeType.color}-100 dark:bg-${nodeType.color}-900/20`
      )}>
        <Icon className={cn('h-4 w-4', `text-${nodeType.color}-600`)} />
        <span className="text-sm font-medium truncate">{node.name}</span>
      </div>

      {/* Inputs */}
      {node.inputs.length > 0 && (
        <div className="p-2">
          {node.inputs.map(inputId => (
            <div
              key={inputId}
              className="flex items-center gap-2 mb-1"
              onClick={(e) => {
                e.stopPropagation();
                onConnectionEnd(inputId);
              }}
            >
              <div className="w-3 h-3 bg-blue-500 rounded-full cursor-crosshair hover:bg-blue-600" />
              <span className="text-xs text-gray-600 dark:text-gray-400 capitalize">{inputId}</span>
            </div>
          ))}
        </div>
      )}

      {/* Outputs */}
      {node.outputs.length > 0 && (
        <div className="p-2 border-t">
          {node.outputs.map(outputId => (
            <div
              key={outputId}
              className="flex items-center justify-end gap-2 mb-1"
              onClick={(e) => {
                e.stopPropagation();
                onConnectionStart(outputId);
              }}
            >
              <span className="text-xs text-gray-600 dark:text-gray-400 capitalize">{outputId}</span>
              <div className="w-3 h-3 bg-green-500 rounded-full cursor-crosshair hover:bg-green-600" />
            </div>
          ))}
        </div>
      )}

      {/* Status Indicator */}
      <div className={cn(
        'absolute -top-2 -right-2 w-4 h-4 rounded-full border-2 border-white dark:border-gray-800',
        node.status === 'running' && 'bg-blue-500 animate-pulse',
        node.status === 'completed' && 'bg-green-500',
        node.status === 'error' && 'bg-red-500',
        node.status === 'idle' && 'bg-gray-400'
      )} />
    </div>
  );
};

// Workflow Engine Dashboard
export const WorkflowEngineDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'designer' | 'templates' | 'executions'>('designer');
  const [currentWorkflowId, setCurrentWorkflowId] = useState<string | null>(null);
  const [executions, setExecutions] = useState<Map<string, WorkflowExecution>>(new Map());
  const [selectedExecution, setSelectedExecution] = useState<WorkflowExecution | null>(null);

  const templates = workflowEngine.getTemplates();

  const createNewWorkflow = () => {
    const workflowId = workflowEngine.createWorkflow(
      `New Workflow ${Date.now()}`,
      'A new automated workflow'
    );
    setCurrentWorkflowId(workflowId);
    setActiveTab('designer');
  };

  const loadTemplate = (templateId: string) => {
    if (!currentWorkflowId) {
      const workflowId = workflowEngine.createWorkflow(
        `Workflow from Template ${Date.now()}`,
        'Workflow created from template'
      );
      setCurrentWorkflowId(workflowId);
    }

    workflowEngine.loadTemplate(currentWorkflowId!, templateId);
    setActiveTab('designer');
  };

  const executeWorkflow = async () => {
    if (!currentWorkflowId) return;

    try {
      const executionId = await workflowEngine.executeWorkflow(currentWorkflowId);
      console.log(`Started execution: ${executionId}`);
    } catch (error) {
      console.error('Failed to execute workflow:', error);
    }
  };

  const tabs = [
    { id: 'designer', name: 'Designer', icon: Workflow },
    { id: 'templates', name: 'Templates', icon: FileText },
    { id: 'executions', name: 'Executions', icon: Activity }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Workflow className="h-6 w-6 text-blue-600" />
            Workflow Engine
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Visual workflow designer and execution engine inspired by n8n
          </p>
        </div>

        <div className="flex items-center gap-3">
          {currentWorkflowId && activeTab === 'designer' && (
            <Button onClick={executeWorkflow} className="bg-green-600 hover:bg-green-700">
              <Play className="h-4 w-4 mr-2" />
              Execute Workflow
            </Button>
          )}

          <Button onClick={createNewWorkflow}>
            <Plus className="h-4 w-4 mr-2" />
            New Workflow
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 border-b-2 transition-colors',
              activeTab === tab.id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            )}
          >
            <tab.icon className="h-4 w-4" />
            <span className="text-sm font-medium">{tab.name}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'designer' && (
          <div className="space-y-6">
            {currentWorkflowId ? (
              <WorkflowDesigner workflowId={currentWorkflowId} className="h-96" />
            ) : (
              <div className="text-center py-12 bg-gray-50 dark:bg-gray-900 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
                <Workflow className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No Workflow Selected
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Create a new workflow or load a template to get started
                </p>
                <Button onClick={createNewWorkflow}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Workflow
                </Button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'templates' && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {templates.map(template => (
              <div key={template.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{template.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{template.description}</p>
                  </div>
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded">
                    {template.category}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <Workflow className="h-3 w-3" />
                      <span>{template.nodes.length} nodes</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Activity className="h-3 w-3" />
                      <span>{template.usage} uses</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {template.tags.map(tag => (
                      <span key={tag} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <Button
                    onClick={() => loadTemplate(template.id)}
                    className="w-full"
                    size="sm"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Load Template
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'executions' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
              <h3 className="text-lg font-semibold mb-4">Recent Executions</h3>

              <div className="space-y-3">
                {/* Mock execution history - in real app this would be populated */}
                <div className="text-center py-8 text-gray-600 dark:text-gray-400">
                  <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No executions yet. Create and run a workflow to see execution history.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Export the workflow engine
export { WorkflowEngine, workflowEngine, NODE_TYPES };
