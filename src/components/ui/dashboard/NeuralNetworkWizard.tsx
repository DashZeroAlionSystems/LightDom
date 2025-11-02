/**
 * Neural Network Workflow Wizard
 * 
 * AI-powered wizard for creating neural network instances
 * Uses Ollama DeepSeek to configure settings based on schemas
 * 
 * Features:
 * - Multi-step wizard interface
 * - AI-powered configuration via Ollama DeepSeek
 * - Schema-based validation
 * - Prompt-based customization
 */

import React, { useState } from 'react';
import {
  Steps,
  Button,
  Input,
  Form,
  Space,
  message,
  Card,
  Select,
  Alert,
  Spin,
  Divider,
  InputNumber,
  Switch,
  Typography,
  Row,
  Col,
  Tag
} from 'antd';
import {
  PlusOutlined,
  RocketOutlined,
  BulbOutlined,
  CheckCircleOutlined,
  LoadingOutlined
} from '@ant-design/icons';

const { Step } = Steps;
const { TextArea } = Input;
const { Title, Text, Paragraph } = Typography;

interface Props {
  onComplete: (config: any) => void;
  onCancel: () => void;
}

const NeuralNetworkWizard: React.FC<Props> = ({ onComplete, onCancel }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [form] = Form.useForm();
  const [generating, setGenerating] = useState(false);
  const [generatedConfig, setGeneratedConfig] = useState<any>(null);
  const [aiAnalysis, setAiAnalysis] = useState<string>('');

  const steps = [
    {
      title: 'Describe',
      description: 'What to build',
      icon: <BulbOutlined />
    },
    {
      title: 'AI Generate',
      description: 'DeepSeek config',
      icon: <RocketOutlined />
    },
    {
      title: 'Review',
      description: 'Confirm settings',
      icon: <CheckCircleOutlined />
    }
  ];

  const modelTypes = [
    { value: 'seo_optimization', label: 'SEO Optimization' },
    { value: 'component_generation', label: 'Component Generation' },
    { value: 'workflow_prediction', label: 'Workflow Prediction' },
    { value: 'accessibility_improvement', label: 'Accessibility Improvement' },
    { value: 'ux_pattern_recognition', label: 'UX Pattern Recognition' },
    { value: 'schema_relationship_learning', label: 'Schema Relationship Learning' },
    { value: 'performance_optimization', label: 'Performance Optimization' },
    { value: 'design_system_extraction', label: 'Design System Extraction' },
    { value: 'content_generation', label: 'Content Generation' },
    { value: 'sentiment_analysis', label: 'Sentiment Analysis' }
  ];

  const handleGenerateFromPrompt = async () => {
    try {
      const values = await form.validateFields(['name', 'modelType', 'prompt', 'clientId']);
      setGenerating(true);

      // Load neural network schemas
      const instanceSchema = await fetch('/schemas/neural-networks/neural-network-instance.json')
        .then(r => r.json());
      const workflowSchema = await fetch('/schemas/neural-networks/neural-network-workflow.json')
        .then(r => r.json());

      // Call Ollama DeepSeek to generate configuration
      const response = await fetch('/api/ai/generate-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: 'deepseek',
          model: 'deepseek-chat',
          prompt: values.prompt,
          context: {
            name: values.name,
            modelType: values.modelType,
            clientId: values.clientId
          },
          schemas: {
            instance: instanceSchema,
            workflow: workflowSchema
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        setGeneratedConfig(data.config);
        setAiAnalysis(data.analysis || '');
        message.success('Configuration generated successfully!');
        setCurrentStep(2); // Skip to review step
      } else {
        throw new Error('Generation failed');
      }
    } catch (error) {
      console.error('Failed to generate configuration:', error);
      message.error('Failed to generate configuration. Using default values.');
      
      // Fallback to default configuration
      const values = form.getFieldsValue();
      setGeneratedConfig({
        trainingConfig: {
          epochs: 50,
          batchSize: 32,
          learningRate: 0.001,
          validationSplit: 0.2,
          optimizer: 'adam',
          earlyStopping: true,
          patience: 10
        },
        dataConfig: {
          source: 'database',
          isolation: 'strict',
          minDataPoints: 1000
        },
        architecture: {
          inputShape: [10],
          layers: [
            { type: 'dense', units: 64, activation: 'relu' },
            { type: 'dropout', dropout: 0.3 },
            { type: 'dense', units: 32, activation: 'relu' },
            { type: 'dense', units: 1, activation: 'sigmoid' }
          ],
          outputShape: [1]
        }
      });
      setAiAnalysis('Using default configuration as AI generation was unavailable.');
      setCurrentStep(2);
    } finally {
      setGenerating(false);
    }
  };

  const handleNext = async () => {
    try {
      if (currentStep === 0) {
        await form.validateFields(['name', 'modelType', 'prompt', 'clientId']);
      }
      setCurrentStep(currentStep + 1);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleComplete = async () => {
    try {
      const values = await form.validateFields();
      
      // Create instance via API
      const response = await fetch('/api/neural-networks/instances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: values.clientId,
          modelType: values.modelType,
          status: 'initializing',
          version: 'v1.0.0',
          trainingConfig: generatedConfig?.trainingConfig || {},
          dataConfig: generatedConfig?.dataConfig || {},
          architecture: generatedConfig?.architecture,
          metadata: {
            name: values.name,
            description: values.prompt,
            tags: values.tags || [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        })
      });

      if (response.ok) {
        const instance = await response.json();
        message.success('Neural network instance created successfully!');
        onComplete(instance);
        form.resetFields();
        setCurrentStep(0);
        setGeneratedConfig(null);
        setAiAnalysis('');
      } else {
        throw new Error('Failed to create instance');
      }
    } catch (error) {
      console.error('Failed to create instance:', error);
      message.error('Failed to create neural network instance');
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        // Describe What to Build
        return (
          <div style={{ maxWidth: 600, margin: '0 auto' }}>
            <Alert
              message="Describe Your Neural Network"
              description="Tell us what you want your neural network to do. Our AI will analyze your requirements and configure everything automatically."
              type="info"
              showIcon
              style={{ marginBottom: 24 }}
            />

            <Form.Item
              name="name"
              label="Instance Name"
              rules={[{ required: true, message: 'Please enter instance name' }]}
            >
              <Input placeholder="e.g., my-seo-optimizer" />
            </Form.Item>

            <Form.Item
              name="clientId"
              label="Client ID"
              rules={[{ required: true, message: 'Please enter client ID' }]}
              tooltip="Unique identifier for data isolation"
            >
              <Input placeholder="e.g., client-001" />
            </Form.Item>

            <Form.Item
              name="modelType"
              label="Model Type"
              rules={[{ required: true, message: 'Please select model type' }]}
            >
              <Select placeholder="Select the type of neural network" options={modelTypes} />
            </Form.Item>

            <Form.Item
              name="prompt"
              label="What should this neural network do?"
              rules={[{ required: true, message: 'Please describe your requirements' }]}
              tooltip="Describe in detail what you want this neural network to accomplish. The AI will use this to configure all settings."
            >
              <TextArea
                rows={6}
                placeholder="Example: Create a neural network that analyzes website content and suggests SEO improvements. It should learn from successful SEO patterns and provide actionable recommendations. Focus on keyword optimization, meta tags, and content structure."
              />
            </Form.Item>

            <Form.Item
              name="tags"
              label="Tags (Optional)"
            >
              <Select
                mode="tags"
                placeholder="Add tags for organization"
                style={{ width: '100%' }}
              />
            </Form.Item>
          </div>
        );

      case 1:
        // AI Generate Configuration
        return (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ marginBottom: 32 }}>
              <Title level={3}>Generate Configuration with AI</Title>
              <Paragraph type="secondary">
                Our AI (Ollama DeepSeek) will analyze your requirements and generate
                optimal configuration based on neural network schemas.
              </Paragraph>
            </div>

            <Card style={{ maxWidth: 600, margin: '0 auto 32px', textAlign: 'left' }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                  <Text strong>Instance Name:</Text>
                  <Text style={{ marginLeft: 8 }}>{form.getFieldValue('name')}</Text>
                </div>
                <div>
                  <Text strong>Model Type:</Text>
                  <Tag color="blue" style={{ marginLeft: 8 }}>
                    {modelTypes.find(t => t.value === form.getFieldValue('modelType'))?.label}
                  </Tag>
                </div>
                <Divider style={{ margin: '12px 0' }} />
                <div>
                  <Text strong>Your Requirements:</Text>
                  <Paragraph
                    style={{
                      marginTop: 8,
                      padding: 12,
                      background: '#f5f5f5',
                      borderRadius: 4,
                      fontSize: 13
                    }}
                  >
                    {form.getFieldValue('prompt')}
                  </Paragraph>
                </div>
              </Space>
            </Card>

            <Button
              type="primary"
              size="large"
              icon={generating ? <LoadingOutlined /> : <RocketOutlined />}
              loading={generating}
              onClick={handleGenerateFromPrompt}
              style={{ height: 48, fontSize: 16 }}
            >
              {generating ? 'AI is Configuring...' : 'Generate Configuration with DeepSeek'}
            </Button>

            {generating && (
              <div style={{ marginTop: 24 }}>
                <Spin />
                <Paragraph type="secondary" style={{ marginTop: 12 }}>
                  Analyzing requirements and generating optimal configuration...
                </Paragraph>
              </div>
            )}
          </div>
        );

      case 2:
        // Review Configuration
        return (
          <div style={{ maxWidth: 800, margin: '0 auto' }}>
            <Alert
              message="Configuration Ready"
              description="Review the AI-generated configuration below. You can proceed to create the instance or go back to make changes."
              type="success"
              showIcon
              style={{ marginBottom: 24 }}
            />

            {aiAnalysis && (
              <Card title="AI Analysis" style={{ marginBottom: 16 }}>
                <Paragraph>{aiAnalysis}</Paragraph>
              </Card>
            )}

            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Card title="Basic Information" size="small">
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <div>
                      <Text strong>Name:</Text>
                      <Text style={{ marginLeft: 8 }}>{form.getFieldValue('name')}</Text>
                    </div>
                    <div>
                      <Text strong>Client ID:</Text>
                      <Text style={{ marginLeft: 8 }}>{form.getFieldValue('clientId')}</Text>
                    </div>
                    <div>
                      <Text strong>Model Type:</Text>
                      <Tag color="blue" style={{ marginLeft: 8 }}>
                        {modelTypes.find(t => t.value === form.getFieldValue('modelType'))?.label}
                      </Tag>
                    </div>
                  </Space>
                </Card>
              </Col>

              <Col span={12}>
                <Card title="Training Configuration" size="small">
                  <Space direction="vertical" style={{ width: '100%', fontSize: 13 }}>
                    <div>Epochs: {generatedConfig?.trainingConfig?.epochs || 'N/A'}</div>
                    <div>Batch Size: {generatedConfig?.trainingConfig?.batchSize || 'N/A'}</div>
                    <div>Learning Rate: {generatedConfig?.trainingConfig?.learningRate || 'N/A'}</div>
                    <div>Optimizer: {generatedConfig?.trainingConfig?.optimizer || 'N/A'}</div>
                    <div>Validation Split: {generatedConfig?.trainingConfig?.validationSplit || 'N/A'}</div>
                  </Space>
                </Card>
              </Col>

              <Col span={12}>
                <Card title="Data Configuration" size="small">
                  <Space direction="vertical" style={{ width: '100%', fontSize: 13 }}>
                    <div>Source: {generatedConfig?.dataConfig?.source || 'N/A'}</div>
                    <div>Isolation: {generatedConfig?.dataConfig?.isolation || 'N/A'}</div>
                    <div>Min Data Points: {generatedConfig?.dataConfig?.minDataPoints || 'N/A'}</div>
                  </Space>
                </Card>
              </Col>

              {generatedConfig?.architecture && (
                <Col span={24}>
                  <Card title="Model Architecture" size="small">
                    <Space direction="vertical" style={{ width: '100%', fontSize: 13 }}>
                      <div>Input Shape: [{generatedConfig.architecture.inputShape?.join(', ')}]</div>
                      <div>Output Shape: [{generatedConfig.architecture.outputShape?.join(', ')}]</div>
                      <div>Layers: {generatedConfig.architecture.layers?.length || 0}</div>
                      <div style={{ marginTop: 8 }}>
                        {generatedConfig.architecture.layers?.map((layer: any, idx: number) => (
                          <Tag key={idx} style={{ marginBottom: 4 }}>
                            {layer.type} {layer.units ? `(${layer.units})` : ''}
                          </Tag>
                        ))}
                      </div>
                    </Space>
                  </Card>
                </Col>
              )}
            </Row>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div>
      <Steps current={currentStep} style={{ marginBottom: 32 }}>
        {steps.map((item, index) => (
          <Step
            key={item.title}
            title={item.title}
            description={item.description}
            icon={currentStep === index ? item.icon : undefined}
          />
        ))}
      </Steps>

      <Form form={form} layout="vertical">
        {renderStepContent()}
      </Form>

      <Divider />

      <div style={{ textAlign: 'right' }}>
        <Space>
          <Button onClick={onCancel}>Cancel</Button>
          {currentStep > 0 && currentStep !== 1 && (
            <Button onClick={handlePrevious}>Previous</Button>
          )}
          {currentStep === 0 && (
            <Button type="primary" onClick={handleNext}>
              Next
            </Button>
          )}
          {currentStep === 2 && (
            <Button type="primary" onClick={handleComplete} icon={<PlusOutlined />}>
              Create Instance
            </Button>
          )}
        </Space>
      </div>
    </div>
  );
};

export default NeuralNetworkWizard;
