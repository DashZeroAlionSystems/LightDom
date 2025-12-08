/**
 * Workflow Visual Editor
 * Drag-and-drop interface for creating and editing workflows
 * Supports visual dependency graphs, rule configuration, and component attachment
 */

import React, { useState, useCallback } from 'react';
import {
  Card,
  Button,
  Space,
  Form,
  Input,
  Select,
  InputNumber,
  Tag,
  List,
  Modal,
  message,
  Divider,
  Typography,
  Collapse,
  Switch,
} from 'antd';
import {
  PlusOutlined,
  SaveOutlined,
  PlayCircleOutlined,
  DeleteOutlined,
  SettingOutlined,
  BranchesOutlined,
  DashboardOutlined,
} from '@ant-design/icons';
import { useWorkflowExecution } from '../hooks/useWorkflowExecution';

const { Title, Text } = Typography;
const { Panel } = Collapse;
const { Option } = Select;

export interface WorkflowStep {
  id: string;
  name: string;
  type: string;
  config: Record<string, any>;
  dependencies: string[];
  timeout?: number;
  retryAttempts?: number;
}

export interface WorkflowRule {
  id: string;
  conditions: Array<{
    field: string;
    operator: string;
    value: any;
  }>;
  actions: Array<{
    type: string;
    config: Record<string, any>;
  }>;
}

export interface Workflow {
  id?: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  rules: WorkflowRule[];
  dataMiningCampaign?: any;
  visualComponents?: any[];
  enabled: boolean;
  priority: number;
}

export interface WorkflowVisualEditorProps {
  workflow?: Workflow;
  onSave?: (workflow: Workflow) => void;
  onExecute?: (workflowId: string) => void;
  enableDataMining?: boolean;
  enableVisualComponents?: boolean;
}

const STEP_TYPES = [
  { value: 'data-fetch', label: 'Data Fetch', icon: '📥' },
  { value: 'ai-analyze', label: 'AI Analysis', icon: '🤖' },
  { value: 'calculate', label: 'Calculation', icon: '🔢' },
  { value: 'blockchain-tx', label: 'Blockchain Transaction', icon: '⛓️' },
  { value: 'notification', label: 'Send Notification', icon: '📧' },
  { value: 'custom', label: 'Custom Action', icon: '⚙️' },
];

const COMPONENT_TYPES = [
  { value: 'chart', label: 'Chart', icon: '📊' },
  { value: 'table', label: 'Table', icon: '📋' },
  { value: 'form', label: 'Form', icon: '📝' },
  { value: 'dashboard', label: 'Dashboard', icon: '🎛️' },
];

export const WorkflowVisualEditor: React.FC<WorkflowVisualEditorProps> = ({
  workflow: initialWorkflow,
  onSave,
  onExecute,
  enableDataMining = true,
  enableVisualComponents = true,
}) => {
  const [workflow, setWorkflow] = useState<Workflow>(
    initialWorkflow || {
      name: '',
      description: '',
      steps: [],
      rules: [],
      visualComponents: [],
      enabled: true,
      priority: 1,
    }
  );

  const [stepModalVisible, setStepModalVisible] = useState(false);
  const [editingStep, setEditingStep] = useState<WorkflowStep | null>(null);
  const [componentModalVisible, setComponentModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [componentForm] = Form.useForm();

  const { executeWorkflow, isExecuting } = useWorkflowExecution();

  const handleAddStep = () => {
    setEditingStep(null);
    form.resetFields();
    setStepModalVisible(true);
  };

  const handleEditStep = (step: WorkflowStep) => {
    setEditingStep(step);
    form.setFieldsValue(step);
    setStepModalVisible(true);
  };

  const handleSaveStep = () => {
    form
      .validateFields()
      .then((values) => {
        const newStep: WorkflowStep = {
          id: editingStep?.id || `step-${Date.now()}`,
          ...values,
        };

        if (editingStep) {
          // Update existing step
          setWorkflow((prev) => ({
            ...prev,
            steps: prev.steps.map((s) => (s.id === editingStep.id ? newStep : s)),
          }));
        } else {
          // Add new step
          setWorkflow((prev) => ({
            ...prev,
            steps: [...prev.steps, newStep],
          }));
        }

        setStepModalVisible(false);
        message.success('Step saved successfully');
      })
      .catch((error) => {
        console.error('Validation error:', error);
      });
  };

  const handleDeleteStep = (stepId: string) => {
    setWorkflow((prev) => ({
      ...prev,
      steps: prev.steps.filter((s) => s.id !== stepId),
    }));
    message.success('Step deleted');
  };

  const handleAddComponent = () => {
    componentForm.resetFields();
    setComponentModalVisible(true);
  };

  const handleSaveComponent = () => {
    componentForm
      .validateFields()
      .then((values) => {
        const newComponent = {
          id: `component-${Date.now()}`,
          ...values,
        };

        setWorkflow((prev) => ({
          ...prev,
          visualComponents: [...(prev.visualComponents || []), newComponent],
        }));

        setComponentModalVisible(false);
        message.success('Component added successfully');
      })
      .catch((error) => {
        console.error('Validation error:', error);
      });
  };

  const handleSaveWorkflow = async () => {
    if (!workflow.name) {
      message.error('Please provide a workflow name');
      return;
    }

    if (workflow.steps.length === 0) {
      message.error('Please add at least one step');
      return;
    }

    try {
      if (onSave) {
        await onSave(workflow);
      }
      message.success('Workflow saved successfully');
    } catch (error) {
      message.error('Failed to save workflow');
      console.error('Save error:', error);
    }
  };

  const handleExecuteWorkflow = async () => {
    if (!workflow.id) {
      message.error('Please save the workflow first');
      return;
    }

    try {
      await executeWorkflow(workflow.id);
      if (onExecute) {
        onExecute(workflow.id);
      }
      message.success('Workflow execution started');
    } catch (error) {
      message.error('Failed to execute workflow');
      console.error('Execution error:', error);
    }
  };

  const getStepIcon = (type: string) => {
    return STEP_TYPES.find((t) => t.value === type)?.icon || '⚙️';
  };

  return (
    <Card
      title={
        <Space>
          <BranchesOutlined />
          <Title level={4} style={{ margin: 0 }}>
            Workflow Editor
          </Title>
        </Space>
      }
      extra={
        <Space>
          <Button icon={<SaveOutlined />} onClick={handleSaveWorkflow}>
            Save
          </Button>
          <Button
            type="primary"
            icon={<PlayCircleOutlined />}
            onClick={handleExecuteWorkflow}
            loading={isExecuting}
            disabled={!workflow.id}
          >
            Execute
          </Button>
        </Space>
      }
    >
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        {/* Workflow Info */}
        <div>
          <Title level={5}>Workflow Information</Title>
          <Form layout="vertical">
            <Form.Item label="Name" required>
              <Input
                value={workflow.name}
                onChange={(e) => setWorkflow({ ...workflow, name: e.target.value })}
                placeholder="Enter workflow name"
              />
            </Form.Item>
            <Form.Item label="Description">
              <Input.TextArea
                value={workflow.description}
                onChange={(e) => setWorkflow({ ...workflow, description: e.target.value })}
                placeholder="Enter workflow description"
                rows={2}
              />
            </Form.Item>
            <Space>
              <Form.Item label="Enabled">
                <Switch
                  checked={workflow.enabled}
                  onChange={(checked) => setWorkflow({ ...workflow, enabled: checked })}
                />
              </Form.Item>
              <Form.Item label="Priority">
                <InputNumber
                  value={workflow.priority}
                  onChange={(value) => setWorkflow({ ...workflow, priority: value || 1 })}
                  min={1}
                  max={10}
                />
              </Form.Item>
            </Space>
          </Form>
        </div>

        <Divider />

        {/* Workflow Steps */}
        <div>
          <Space style={{ marginBottom: 16 }}>
            <Title level={5}>Workflow Steps</Title>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAddStep}>
              Add Step
            </Button>
          </Space>

          <List
            dataSource={workflow.steps}
            locale={{ emptyText: 'No steps added yet. Click "Add Step" to start building your workflow.' }}
            renderItem={(step) => (
              <List.Item
                actions={[
                  <Button size="small" icon={<SettingOutlined />} onClick={() => handleEditStep(step)}>
                    Edit
                  </Button>,
                  <Button
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleDeleteStep(step.id)}
                  >
                    Delete
                  </Button>,
                ]}
              >
                <List.Item.Meta
                  avatar={<Text style={{ fontSize: 24 }}>{getStepIcon(step.type)}</Text>}
                  title={
                    <Space>
                      <Text strong>{step.name}</Text>
                      <Tag color="blue">{step.type}</Tag>
                    </Space>
                  }
                  description={
                    <div>
                      {step.dependencies.length > 0 && (
                        <Text type="secondary">
                          Depends on: {step.dependencies.map((d) => workflow.steps.find((s) => s.id === d)?.name || d).join(', ')}
                        </Text>
                      )}
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        </div>

        {/* Visual Components */}
        {enableVisualComponents && (
          <>
            <Divider />
            <div>
              <Space style={{ marginBottom: 16 }}>
                <Title level={5}>Visual Components</Title>
                <Button icon={<DashboardOutlined />} onClick={handleAddComponent}>
                  Add Component
                </Button>
              </Space>

              <List
                dataSource={workflow.visualComponents || []}
                locale={{ emptyText: 'No components added' }}
                renderItem={(comp) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={
                        <Text style={{ fontSize: 24 }}>
                          {COMPONENT_TYPES.find((t) => t.value === comp.componentType)?.icon || '📊'}
                        </Text>
                      }
                      title={<Tag color="purple">{comp.componentType}</Tag>}
                      description={comp.name || 'Unnamed component'}
                    />
                  </List.Item>
                )}
              />
            </div>
          </>
        )}
      </Space>

      {/* Step Modal */}
      <Modal
        title={editingStep ? 'Edit Step' : 'Add Step'}
        open={stepModalVisible}
        onOk={handleSaveStep}
        onCancel={() => setStepModalVisible(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Step Name" rules={[{ required: true }]}>
            <Input placeholder="Enter step name" />
          </Form.Item>

          <Form.Item name="type" label="Step Type" rules={[{ required: true }]}>
            <Select placeholder="Select step type">
              {STEP_TYPES.map((type) => (
                <Option key={type.value} value={type.value}>
                  {type.icon} {type.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="dependencies" label="Dependencies" initialValue={[]}>
            <Select
              mode="multiple"
              placeholder="Select dependencies"
              options={workflow.steps
                .filter((s) => s.id !== editingStep?.id)
                .map((s) => ({ label: s.name, value: s.id }))}
            />
          </Form.Item>

          <Form.Item name="timeout" label="Timeout (ms)" initialValue={30000}>
            <InputNumber min={1000} step={1000} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="retryAttempts" label="Retry Attempts" initialValue={3}>
            <InputNumber min={0} max={10} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Component Modal */}
      <Modal
        title="Add Visual Component"
        open={componentModalVisible}
        onOk={handleSaveComponent}
        onCancel={() => setComponentModalVisible(false)}
      >
        <Form form={componentForm} layout="vertical">
          <Form.Item name="name" label="Component Name" rules={[{ required: true }]}>
            <Input placeholder="Enter component name" />
          </Form.Item>

          <Form.Item name="componentType" label="Component Type" rules={[{ required: true }]}>
            <Select placeholder="Select component type">
              {COMPONENT_TYPES.map((type) => (
                <Option key={type.value} value={type.value}>
                  {type.icon} {type.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default WorkflowVisualEditor;
