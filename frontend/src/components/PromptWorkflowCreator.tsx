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
      // Simulate AI analysis (in production, call WorkflowWizardService)
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Generate workflow configuration based on prompt
      const config = generateWorkflowFromPrompt(prompt);
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

  const generateWorkflowFromPrompt = (prompt: string): WorkflowConfig => {
    // Simple keyword-based generation (in production, use AI service)
    const isDataMining = /scrape|extract|mine|crawl|collect/i.test(prompt);
    const isTraining = /train|model|ml|ai|neural/i.test(prompt);
    const isAnalysis = /analyze|evaluate|measure|assess/i.test(prompt);

    const tasks: Task[] = [];

    if (isDataMining) {
      tasks.push(
        {
          id: 'task-1',
          name: 'Fetch Web Data',
          type: 'web-scraper',
          description: 'Extract data from target website',
          dependencies: [],
          config: { url: '', selectors: [] },
          selected: true,
        },
        {
          id: 'task-2',
          name: 'Transform Data',
          type: 'data-transform',
          description: 'Clean and format extracted data',
          dependencies: ['task-1'],
          config: { transformations: [] },
          selected: true,
        },
        {
          id: 'task-3',
          name: 'Store Results',
          type: 'database-store',
          description: 'Save processed data to database',
          dependencies: ['task-2'],
          config: { table: 'workflow_results' },
          selected: true,
        }
      );
    }

    if (isTraining) {
      tasks.push(
        {
          id: 'task-4',
          name: 'Load Training Data',
          type: 'data-loader',
          description: 'Load training dataset',
          dependencies: [],
          config: { source: 'database' },
          selected: true,
        },
        {
          id: 'task-5',
          name: 'Preprocess Data',
          type: 'data-preprocessing',
          description: 'Normalize and prepare data',
          dependencies: ['task-4'],
          config: { normalization: 'standard' },
          selected: true,
        },
        {
          id: 'task-6',
          name: 'Train Model',
          type: 'model-training',
          description: 'Train TensorFlow model',
          dependencies: ['task-5'],
          config: { epochs: 50, batchSize: 32 },
          selected: true,
        },
        {
          id: 'task-7',
          name: 'Evaluate Model',
          type: 'model-evaluation',
          description: 'Evaluate model performance',
          dependencies: ['task-6'],
          config: { metrics: ['accuracy', 'loss'] },
          selected: true,
        }
      );
    }

    if (isAnalysis) {
      tasks.push(
        {
          id: 'task-8',
          name: 'Collect Metrics',
          type: 'metrics-collection',
          description: 'Gather performance metrics',
          dependencies: [],
          config: { metrics: [] },
          selected: true,
        },
        {
          id: 'task-9',
          name: 'Generate Report',
          type: 'report-generation',
          description: 'Create analysis report',
          dependencies: ['task-8'],
          config: { format: 'pdf' },
          selected: true,
        }
      );
    }

    // Default workflow if no keywords matched
    if (tasks.length === 0) {
      tasks.push(
        {
          id: 'task-default',
          name: 'Execute Workflow',
          type: 'generic',
          description: 'Execute custom workflow task',
          dependencies: [],
          config: {},
          selected: true,
        }
      );
    }

    return {
      name: `Workflow: ${prompt.slice(0, 50)}`,
      description: prompt,
      category: isDataMining ? 'data-mining' : isTraining ? 'ml-training' : isAnalysis ? 'analysis' : 'custom',
      trigger: 'manual',
      tasks,
    };
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
