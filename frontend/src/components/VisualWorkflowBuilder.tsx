import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Card, Button, Modal, Input, Select, Form, message, Tag, Tooltip } from 'antd';
import { 
  PlusOutlined, 
  DeleteOutlined, 
  SaveOutlined, 
  PlayCircleOutlined,
  SettingOutlined,
  ArrowRightOutlined,
  CheckCircleOutlined,
  LoadingOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';

interface Task {
  id: string;
  label: string;
  description: string;
  handler: string;
  status?: 'pending' | 'in_progress' | 'completed' | 'failed';
  position: { x: number; y: number };
  dependencies?: string[];
}

interface Connection {
  from: string;
  to: string;
}

interface WorkflowBuilderProps {
  onSave?: (workflow: any) => void;
  onExecute?: (workflowId: string) => void;
  initialWorkflow?: any;
}

export const VisualWorkflowBuilder: React.FC<WorkflowBuilderProps> = ({
  onSave,
  onExecute,
  initialWorkflow
}) => {
  const [tasks, setTasks] = useState<Task[]>(initialWorkflow?.tasks || []);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [draggingTask, setDraggingTask] = useState<string | null>(null);
  const [isTaskModalVisible, setIsTaskModalVisible] = useState(false);
  const [isWorkflowModalVisible, setIsWorkflowModalVisible] = useState(false);
  const [workflowName, setWorkflowName] = useState(initialWorkflow?.name || '');
  const [connecting, setConnecting] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    if (initialWorkflow) {
      setTasks(initialWorkflow.tasks || []);
      setWorkflowName(initialWorkflow.name || '');
      // Build connections from task dependencies
      const deps: Connection[] = [];
      (initialWorkflow.tasks || []).forEach((task: Task) => {
        if (task.dependencies) {
          task.dependencies.forEach((depId: string) => {
            deps.push({ from: depId, to: task.id });
          });
        }
      });
      setConnections(deps);
    }
  }, [initialWorkflow]);

  const handleDragStart = (taskId: string) => {
    setDraggingTask(taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggingTask || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setTasks(tasks.map(task => 
      task.id === draggingTask 
        ? { ...task, position: { x, y } }
        : task
    ));
    setDraggingTask(null);
  };

  const handleAddTask = () => {
    setIsTaskModalVisible(true);
    form.resetFields();
  };

  const handleCreateTask = (values: any) => {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      label: values.label,
      description: values.description,
      handler: values.handler,
      position: { x: 100, y: 100 + tasks.length * 120 },
      status: 'pending'
    };
    setTasks([...tasks, newTask]);
    setIsTaskModalVisible(false);
    message.success('Task added successfully');
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(tasks.filter(task => task.id !== taskId));
    setConnections(connections.filter(conn => 
      conn.from !== taskId && conn.to !== taskId
    ));
    message.success('Task deleted');
  };

  const handleTaskClick = (taskId: string) => {
    if (connecting) {
      // Create connection
      if (connecting !== taskId && !connections.find(c => c.from === connecting && c.to === taskId)) {
        setConnections([...connections, { from: connecting, to: taskId }]);
        message.success('Connection created');
      }
      setConnecting(null);
    } else {
      setSelectedTask(selectedTask === taskId ? null : taskId);
    }
  };

  const handleStartConnect = (taskId: string) => {
    setConnecting(taskId);
    message.info('Click on another task to create connection');
  };

  const handleSaveWorkflow = () => {
    if (!workflowName.trim()) {
      setIsWorkflowModalVisible(true);
      return;
    }
    saveWorkflow();
  };

  const saveWorkflow = () => {
    // Build dependencies from connections
    const tasksWithDeps = tasks.map(task => ({
      ...task,
      dependencies: connections
        .filter(conn => conn.to === task.id)
        .map(conn => conn.from)
    }));

    const workflow = {
      name: workflowName,
      tasks: tasksWithDeps,
      version: '1.0.0',
      metadata: {
        createdAt: new Date().toISOString(),
        author: 'Visual Builder'
      }
    };

    if (onSave) {
      onSave(workflow);
    }
    message.success('Workflow saved successfully');
    setIsWorkflowModalVisible(false);
  };

  const handleExecuteWorkflow = async () => {
    if (!workflowName.trim()) {
      message.error('Please save the workflow first');
      return;
    }
    
    // Save workflow first
    saveWorkflow();
    
    // Then execute
    if (onExecute && initialWorkflow?.id) {
      onExecute(initialWorkflow.id);
    }
  };

  const renderConnections = () => {
    return connections.map((conn, index) => {
      const fromTask = tasks.find(t => t.id === conn.from);
      const toTask = tasks.find(t => t.id === conn.to);
      
      if (!fromTask || !toTask) return null;

      const x1 = fromTask.position.x + 100; // Center of task card
      const y1 = fromTask.position.y + 30;
      const x2 = toTask.position.x + 100;
      const y2 = toTask.position.y + 30;

      // Calculate control points for curved line
      const dx = x2 - x1;
      const dy = y2 - y1;
      const cx1 = x1 + dx * 0.5;
      const cy1 = y1;
      const cx2 = x2 - dx * 0.5;
      const cy2 = y2;

      return (
        <g key={`conn-${index}`}>
          <path
            d={`M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`}
            stroke="#4096ff"
            strokeWidth="2"
            fill="none"
            markerEnd="url(#arrowhead)"
          />
        </g>
      );
    });
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'in_progress':
        return <LoadingOutlined style={{ color: '#1890ff' }} />;
      case 'failed':
        return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
      default:
        return null;
    }
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Toolbar */}
      <div style={{ 
        padding: '16px', 
        borderBottom: '1px solid #f0f0f0',
        display: 'flex',
        gap: '8px',
        alignItems: 'center'
      }}>
        <Input
          placeholder="Workflow Name"
          value={workflowName}
          onChange={(e) => setWorkflowName(e.target.value)}
          style={{ width: '300px' }}
        />
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={handleAddTask}
        >
          Add Task
        </Button>
        <Button 
          icon={<SaveOutlined />}
          onClick={handleSaveWorkflow}
        >
          Save Workflow
        </Button>
        <Button 
          type="primary" 
          icon={<PlayCircleOutlined />}
          onClick={handleExecuteWorkflow}
          disabled={tasks.length === 0}
        >
          Execute
        </Button>
        {selectedTask && (
          <>
            <Button 
              icon={<ArrowRightOutlined />}
              onClick={() => handleStartConnect(selectedTask)}
            >
              Connect
            </Button>
            <Button 
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDeleteTask(selectedTask)}
            >
              Delete
            </Button>
          </>
        )}
      </div>

      {/* Canvas */}
      <div 
        ref={canvasRef}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        style={{ 
          flex: 1, 
          position: 'relative',
          backgroundColor: '#fafafa',
          overflow: 'auto'
        }}
      >
        {/* SVG for connections */}
        <svg
          ref={svgRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none'
          }}
        >
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="10"
              refX="9"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 10 3, 0 6" fill="#4096ff" />
            </marker>
          </defs>
          {renderConnections()}
        </svg>

        {/* Tasks */}
        {tasks.map(task => (
          <div
            key={task.id}
            draggable
            onDragStart={() => handleDragStart(task.id)}
            onClick={() => handleTaskClick(task.id)}
            style={{
              position: 'absolute',
              left: task.position.x,
              top: task.position.y,
              cursor: 'move',
              zIndex: selectedTask === task.id ? 100 : 1
            }}
          >
            <Card
              size="small"
              style={{ 
                width: 200,
                border: selectedTask === task.id ? '2px solid #1890ff' : '1px solid #d9d9d9',
                boxShadow: connecting === task.id ? '0 0 0 3px rgba(24, 144, 255, 0.2)' : undefined
              }}
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {getStatusIcon(task.status)}
                  <Tooltip title={task.label}>
                    <span style={{ 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      flex: 1
                    }}>
                      {task.label}
                    </span>
                  </Tooltip>
                </div>
              }
            >
              <div style={{ fontSize: '12px', color: '#666' }}>
                {task.description}
              </div>
              <div style={{ marginTop: '8px' }}>
                <Tag color="blue">{task.handler}</Tag>
              </div>
            </Card>
          </div>
        ))}

        {tasks.length === 0 && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            color: '#999'
          }}>
            <p>Click "Add Task" to start building your workflow</p>
          </div>
        )}
      </div>

      {/* Add Task Modal */}
      <Modal
        title="Add New Task"
        open={isTaskModalVisible}
        onOk={() => form.submit()}
        onCancel={() => setIsTaskModalVisible(false)}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateTask}
        >
          <Form.Item
            name="label"
            label="Task Name"
            rules={[{ required: true, message: 'Please enter task name' }]}
          >
            <Input placeholder="e.g., Initialize Data Sources" />
          </Form.Item>
          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please enter description' }]}
          >
            <Input.TextArea rows={3} placeholder="Describe what this task does" />
          </Form.Item>
          <Form.Item
            name="handler"
            label="Handler Type"
            rules={[{ required: true, message: 'Please select handler' }]}
          >
            <Select placeholder="Select handler type">
              <Select.Option value="data-source">Data Source</Select.Option>
              <Select.Option value="dom-mining">DOM Mining</Select.Option>
              <Select.Option value="schema-linking">Schema Linking</Select.Option>
              <Select.Option value="component-generation">Component Generation</Select.Option>
              <Select.Option value="seo-optimization">SEO Optimization</Select.Option>
              <Select.Option value="ml-training">ML Training</Select.Option>
              <Select.Option value="custom">Custom</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Workflow Name Modal */}
      <Modal
        title="Save Workflow"
        open={isWorkflowModalVisible}
        onOk={saveWorkflow}
        onCancel={() => setIsWorkflowModalVisible(false)}
      >
        <Form layout="vertical">
          <Form.Item label="Workflow Name" required>
            <Input
              placeholder="Enter workflow name"
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default VisualWorkflowBuilder;
