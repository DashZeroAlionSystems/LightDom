/**
 * Prompt-Based Workflow Creator
 * AI-powered workflow generation from natural language prompts
 */

import React, { useState } from 'react';
import {
  Modal,
  Steps,
  Form,
  Input,
  Button,
  Space,
  Card,
  List,
  Tag,
  Checkbox,
  Select,
  message,
  Alert,
  Divider,
  Spin,
  Row,
  Col,
} from 'antd';
import {
  ThunderboltOutlined,
  CheckCircleOutlined,
  EditOutlined,
  SaveOutlined,
  RobotOutlined,
  LinkOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { promptAnalyzerService } from '../services/PromptAnalyzerService';

const { Step } = Steps;
const { TextArea } = Input;
const { Option } = Select;

interface Task {
  id: string;
  name: string;
  type: string;
  description: string;
  dependencies: string[];
  config: any;
  selected: boolean;
}

interface WorkflowConfig {
  name: string;
  description: string;
  category: string;
  trigger: string;
  tasks: Task[];
}

interface PromptWorkflowCreatorProps {
  visible: boolean;
  onClose: () => void;
  onComplete: (workflow: WorkflowConfig) => void;
}

export const PromptWorkflowCreator: React.FC<PromptWorkflowCreatorProps> = ({
  visible,
  onClose,
  onComplete,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [form] = Form.useForm();
  const [prompt, setPrompt] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [generatedConfig, setGeneratedConfig] = useState<WorkflowConfig | null>(null);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);

  const steps = [
    { title: 'Describe', icon: <EditOutlined /> },
    { title: 'Generate', icon: <RobotOutlined /> },
    { title: 'Configure', icon: <SettingOutlined /> },
    { title: 'Review', icon: <CheckCircleOutlined /> },
  ];

  const handleAnalyzePrompt = async () => {
    if (!prompt.trim()) {
      message.warning('Please enter a workflow description');
      return;
    }

    setAnalyzing(true);
    try {
      // Use PromptAnalyzerService to analyze the prompt
      const workflowSchema = await promptAnalyzerService.createWorkflowFromPrompt(prompt);
      
      // Convert to our WorkflowConfig format
      const config: WorkflowConfig = {
        name: workflowSchema.name || 'New Workflow',
        description: workflowSchema.description || prompt,
        category: workflowSchema.category || 'automation',
        trigger: workflowSchema.trigger?.type || 'manual',
        tasks: (workflowSchema.tasks || []).map((task, index) => ({
          id: `task-${index + 1}`,
          name: task.name || `Task ${index + 1}`,
          type: task['@type'] || 'generic',
          description: task.execution?.config?.description || task.name || '',
          dependencies: task.dependsOn || [],
          config: task.execution?.config || {},
          selected: true,
        })),
      };

      setGeneratedConfig(config);
      setSelectedTasks(config.tasks.filter(t => t.selected).map(t => t.id));
      
      message.success('Workflow configuration generated successfully!');
      setCurrentStep(1);
    } catch (error) {
      message.error('Failed to analyze prompt');
      console.error(error);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleTaskToggle = (taskId: string) => {
    setSelectedTasks(prev =>
      prev.includes(taskId)
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  const handleComplete = () => {
    if (!generatedConfig) return;

    const finalConfig = {
      ...generatedConfig,
      tasks: generatedConfig.tasks
        .filter(t => selectedTasks.includes(t.id))
        .map(t => ({ ...t, selected: true })),
    };

    onComplete(finalConfig);
    handleClose();
  };

  const handleClose = () => {
    setCurrentStep(0);
    setPrompt('');
    setGeneratedConfig(null);
    setSelectedTasks([]);
    form.resetFields();
    onClose();
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div>
            <Alert
              message="Describe Your Workflow"
              description="Describe what you want your workflow to do in plain English. Our AI will analyze your description and generate a complete workflow configuration."
              type="info"
              showIcon
              icon={<ThunderboltOutlined />}
              style={{ marginBottom: 16 }}
            />
            <TextArea
              rows={6}
              placeholder="Example: Create a workflow that scrapes product data from example.com, trains a TensorFlow model to predict prices, and saves the results to the database."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <Divider />
            <div style={{ marginBottom: 16 }}>
              <strong>Example Prompts:</strong>
              <List
                size="small"
                dataSource={[
                  'Extract job listings from tech websites and store in database',
                  'Train a neural network model on SEO data and deploy it',
                  'Scrape competitor prices daily and generate analysis reports',
                  'Collect user feedback and analyze sentiment using AI',
                ]}
                renderItem={item => (
                  <List.Item>
                    <Button
                      type="link"
                      onClick={() => setPrompt(item)}
                      style={{ padding: 0 }}
                    >
                      "{item}"
                    </Button>
                  </List.Item>
                )}
              />
            </div>
          </div>
        );

      case 1:
        return (
          <div>
            {analyzing ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <Spin size="large" />
                <p style={{ marginTop: 16 }}>Analyzing your prompt and generating workflow...</p>
              </div>
            ) : generatedConfig ? (
              <div>
                <Alert
                  message="Workflow Generated Successfully"
                  description={`Generated ${generatedConfig.tasks.length} tasks for your workflow`}
                  type="success"
                  showIcon
                  style={{ marginBottom: 16 }}
                />
                <Card title="Generated Configuration" size="small">
                  <Row gutter={16}>
                    <Col span={12}>
                      <p><strong>Name:</strong> {generatedConfig.name}</p>
                    </Col>
                    <Col span={12}>
                      <p><strong>Category:</strong> <Tag>{generatedConfig.category}</Tag></p>
                    </Col>
                    <Col span={24}>
                      <p><strong>Description:</strong> {generatedConfig.description}</p>
                    </Col>
                  </Row>
                </Card>
              </div>
            ) : null}
          </div>
        );

      case 2:
        return generatedConfig ? (
          <div>
            <Alert
              message="Configure Tasks"
              description="Review and configure the generated tasks. You can enable/disable tasks and modify their configuration."
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
            <List
              dataSource={generatedConfig.tasks}
              renderItem={(task) => (
                <Card
                  key={task.id}
                  size="small"
                  style={{ marginBottom: 8 }}
                  title={
                    <Checkbox
                      checked={selectedTasks.includes(task.id)}
                      onChange={() => handleTaskToggle(task.id)}
                    >
                      {task.name}
                    </Checkbox>
                  }
                  extra={<Tag color="blue">{task.type}</Tag>}
                >
                  <p>{task.description}</p>
                  {task.dependencies.length > 0 && (
                    <div>
                      <LinkOutlined /> Dependencies:{' '}
                      {task.dependencies.map(dep => (
                        <Tag key={dep} size="small">{dep}</Tag>
                      ))}
                    </div>
                  )}
                </Card>
              )}
            />
          </div>
        ) : null;

      case 3:
        return generatedConfig ? (
          <div>
            <Alert
              message="Review & Create"
              description="Review your workflow configuration and create it."
              type="success"
              showIcon
              style={{ marginBottom: 16 }}
            />
            <Card title="Workflow Summary">
              <Row gutter={16}>
                <Col span={24}>
                  <p><strong>Name:</strong> {generatedConfig.name}</p>
                </Col>
                <Col span={12}>
                  <p><strong>Category:</strong> <Tag>{generatedConfig.category}</Tag></p>
                </Col>
                <Col span={12}>
                  <p><strong>Trigger:</strong> <Tag>{generatedConfig.trigger}</Tag></p>
                </Col>
                <Col span={24}>
                  <p><strong>Description:</strong> {generatedConfig.description}</p>
                </Col>
                <Col span={24}>
                  <p><strong>Tasks:</strong> {selectedTasks.length} selected</p>
                  <Space wrap>
                    {generatedConfig.tasks
                      .filter(t => selectedTasks.includes(t.id))
                      .map(t => (
                        <Tag key={t.id} color="blue">{t.name}</Tag>
                      ))}
                  </Space>
                </Col>
              </Row>
            </Card>
          </div>
        ) : null;

      default:
        return null;
    }
  };

  return (
    <Modal
      title="Create Workflow from Prompt"
      open={visible}
      onCancel={handleClose}
      width={800}
      footer={null}
    >
      <Steps current={currentStep} style={{ marginBottom: 24 }}>
        {steps.map((step, index) => (
          <Step key={index} title={step.title} icon={step.icon} />
        ))}
      </Steps>

      <div style={{ minHeight: 400 }}>
        {renderStepContent()}
      </div>

      <Divider />

      <Space style={{ float: 'right' }}>
        {currentStep > 0 && (
          <Button onClick={() => setCurrentStep(currentStep - 1)}>
            Previous
          </Button>
        )}
        {currentStep === 0 && (
          <Button type="primary" onClick={handleAnalyzePrompt} loading={analyzing}>
            Generate Workflow
          </Button>
        )}
        {currentStep > 0 && currentStep < steps.length - 1 && (
          <Button type="primary" onClick={() => setCurrentStep(currentStep + 1)}>
            Next
          </Button>
        )}
        {currentStep === steps.length - 1 && (
          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={handleComplete}
          >
            Create Workflow
          </Button>
        )}
      </Space>
    </Modal>
  );
};

export default PromptWorkflowCreator;
