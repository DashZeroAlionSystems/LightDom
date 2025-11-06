/**
 * Add Agent Modal Component
 * Modal for creating new AI agents with DeepSeek configuration
 */

import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  Switch,
  InputNumber,
  Button,
  Steps,
  Card,
  Typography,
  Space,
  Tag,
  Divider,
  message,
  Collapse,
  Alert
} from 'antd';
import {
  RobotOutlined,
  SettingOutlined,
  ThunderboltOutlined,
  CheckCircleOutlined,
  BulbOutlined
} from '@ant-design/icons';
import axios from 'axios';

const { Step } = Steps;
const { TextArea } = Input;
const { Option } = Select;
const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;

interface AddAgentModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: (agent: any) => void;
}

export const AddAgentModal: React.FC<AddAgentModalProps> = ({
  visible,
  onCancel,
  onSuccess
}) => {
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [agentModes, setAgentModes] = useState<any[]>([]);
  const [selectedMode, setSelectedMode] = useState<any>(null);

  useEffect(() => {
    if (visible) {
      loadAgentModes();
    }
  }, [visible]);

  const loadAgentModes = async () => {
    try {
      const response = await axios.get('/api/agent-deepseek/modes');
      if (response.data.success) {
        setAgentModes(response.data.data);
      }
    } catch (error) {
      console.error('Failed to load agent modes:', error);
      message.error('Failed to load agent modes');
    }
  };

  const handleModeSelect = (mode_id: string) => {
    const mode = agentModes.find(m => m.mode_id === mode_id);
    setSelectedMode(mode);
    if (mode) {
      form.setFieldsValue({
        configuration: mode.default_config || {},
        capabilities: mode.capabilities || []
      });
    }
  };

  const handleNext = async () => {
    try {
      await form.validateFields();
      setCurrentStep(currentStep + 1);
    } catch (error) {
      console.error('Validation error:', error);
    }
  };

  const handlePrev = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();

      // Create agent instance
      const agentData = {
        name: values.name,
        description: values.description,
        mode_id: values.mode_id,
        configuration: values.configuration || {},
        deepseek_config: {
          api_url: values.deepseek_api_url || 'http://localhost:11434',
          model: values.model_name || 'deepseek-chat'
        },
        tools_enabled: values.tools_enabled || [],
        services_enabled: values.services_enabled || [],
        model_name: values.model_name || 'deepseek-chat',
        temperature: values.temperature || 0.7,
        max_tokens: values.max_tokens || 4000
      };

      const response = await axios.post('/api/agent-deepseek/agents', agentData);

      if (response.data.success) {
        message.success('Agent created successfully!');
        onSuccess(response.data.data);
        handleReset();
      }
    } catch (error: any) {
      console.error('Create agent error:', error);
      message.error(error.response?.data?.error || 'Failed to create agent');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    form.resetFields();
    setCurrentStep(0);
    setSelectedMode(null);
  };

  const steps = [
    {
      title: 'Agent Mode',
      icon: <RobotOutlined />,
      description: 'Select agent functional mode'
    },
    {
      title: 'Configuration',
      icon: <SettingOutlined />,
      description: 'Configure agent settings'
    },
    {
      title: 'DeepSeek Setup',
      icon: <ThunderboltOutlined />,
      description: 'DeepSeek AI configuration'
    },
    {
      title: 'Review',
      icon: <CheckCircleOutlined />,
      description: 'Review and create'
    }
  ];

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div>
            <Alert
              message="Choose an Agent Mode"
              description="Select the functional role this agent will fulfill. Each mode has predefined capabilities and rules."
              type="info"
              icon={<BulbOutlined />}
              showIcon
              style={{ marginBottom: 24 }}
            />
            <Form.Item
              name="mode_id"
              label="Agent Mode"
              rules={[{ required: true, message: 'Please select an agent mode' }]}
            >
              <Select
                placeholder="Select agent mode"
                onChange={handleModeSelect}
                size="large"
              >
                {agentModes.map(mode => (
                  <Option key={mode.mode_id} value={mode.mode_id}>
                    <div>
                      <Text strong>{mode.name}</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {mode.description}
                      </Text>
                    </div>
                  </Option>
                ))}
              </Select>
            </Form.Item>

            {selectedMode && (
              <Card size="small" style={{ marginTop: 16 }}>
                <Title level={5}>Function Definition</Title>
                <Paragraph>{selectedMode.function_definition}</Paragraph>
                
                <Title level={5} style={{ marginTop: 16 }}>Capabilities</Title>
                <Space wrap>
                  {(selectedMode.capabilities || []).map((cap: string, idx: number) => (
                    <Tag key={idx} color="blue">{cap}</Tag>
                  ))}
                </Space>

                <Title level={5} style={{ marginTop: 16 }}>Rules & Guidelines</Title>
                <Collapse ghost>
                  {(selectedMode.rules || []).map((rule: any, idx: number) => (
                    <Panel
                      key={idx}
                      header={
                        <Space>
                          <Tag color={
                            rule.type === 'requirement' ? 'red' :
                            rule.type === 'constraint' ? 'orange' :
                            rule.type === 'guideline' ? 'blue' : 'green'
                          }>
                            {rule.type}
                          </Tag>
                          <Text>{rule.description}</Text>
                        </Space>
                      }
                    />
                  ))}
                </Collapse>
              </Card>
            )}
          </div>
        );

      case 1:
        return (
          <div>
            <Form.Item
              name="name"
              label="Agent Name"
              rules={[{ required: true, message: 'Please enter agent name' }]}
            >
              <Input placeholder="e.g., My SEO Optimizer" size="large" />
            </Form.Item>

            <Form.Item
              name="description"
              label="Description"
            >
              <TextArea
                rows={3}
                placeholder="Describe what this agent will do..."
              />
            </Form.Item>

            <Form.Item
              name="tools_enabled"
              label="Enabled Tools"
            >
              <Select
                mode="tags"
                placeholder="Select or add tools"
                tokenSeparators={[',']}
              >
                <Option value="web_crawler">Web Crawler</Option>
                <Option value="data_extractor">Data Extractor</Option>
                <Option value="code_analyzer">Code Analyzer</Option>
                <Option value="content_generator">Content Generator</Option>
                <Option value="seo_optimizer">SEO Optimizer</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="services_enabled"
              label="Enabled Services"
            >
              <Select
                mode="tags"
                placeholder="Select or add services"
                tokenSeparators={[',']}
              >
                <Option value="workflow_service">Workflow Service</Option>
                <Option value="data_mining_service">Data Mining Service</Option>
                <Option value="optimization_service">Optimization Service</Option>
              </Select>
            </Form.Item>
          </div>
        );

      case 2:
        return (
          <div>
            <Alert
              message="DeepSeek AI Configuration"
              description="Configure how this agent connects to DeepSeek AI for intelligent operations."
              type="info"
              showIcon
              style={{ marginBottom: 24 }}
            />

            <Form.Item
              name="deepseek_api_url"
              label="DeepSeek API URL"
              initialValue="http://localhost:11434"
            >
              <Input placeholder="http://localhost:11434" />
            </Form.Item>

            <Form.Item
              name="model_name"
              label="Model Name"
              initialValue="deepseek-chat"
            >
              <Select>
                <Option value="deepseek-chat">DeepSeek Chat</Option>
                <Option value="deepseek-coder">DeepSeek Coder</Option>
                <Option value="deepseek-r1">DeepSeek R1</Option>
                <Option value="custom">Custom Model</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="temperature"
              label="Temperature"
              initialValue={0.7}
              help="Controls randomness. Lower = more focused, Higher = more creative"
            >
              <InputNumber
                min={0}
                max={2}
                step={0.1}
                style={{ width: '100%' }}
              />
            </Form.Item>

            <Form.Item
              name="max_tokens"
              label="Max Tokens"
              initialValue={4000}
              help="Maximum tokens per response"
            >
              <InputNumber
                min={100}
                max={16000}
                step={100}
                style={{ width: '100%' }}
              />
            </Form.Item>

            <Form.Item
              name="top_p"
              label="Top P"
              initialValue={0.95}
              help="Nucleus sampling parameter"
            >
              <InputNumber
                min={0}
                max={1}
                step={0.05}
                style={{ width: '100%' }}
              />
            </Form.Item>
          </div>
        );

      case 3:
        const values = form.getFieldsValue();
        return (
          <div>
            <Alert
              message="Review Your Agent Configuration"
              description="Please review all settings before creating the agent."
              type="success"
              showIcon
              style={{ marginBottom: 24 }}
            />

            <Card title="Agent Details" size="small" style={{ marginBottom: 16 }}>
              <p><Text strong>Name:</Text> {values.name}</p>
              <p><Text strong>Description:</Text> {values.description || 'None'}</p>
              <p><Text strong>Mode:</Text> {selectedMode?.name}</p>
            </Card>

            <Card title="Configuration" size="small" style={{ marginBottom: 16 }}>
              <p><Text strong>Tools:</Text> {values.tools_enabled?.join(', ') || 'None'}</p>
              <p><Text strong>Services:</Text> {values.services_enabled?.join(', ') || 'None'}</p>
            </Card>

            <Card title="DeepSeek Settings" size="small">
              <p><Text strong>API URL:</Text> {values.deepseek_api_url}</p>
              <p><Text strong>Model:</Text> {values.model_name}</p>
              <p><Text strong>Temperature:</Text> {values.temperature}</p>
              <p><Text strong>Max Tokens:</Text> {values.max_tokens}</p>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Modal
      title={
        <Space>
          <RobotOutlined style={{ fontSize: 24, color: '#1890ff' }} />
          <Text strong style={{ fontSize: 18 }}>Add New Agent</Text>
        </Space>
      }
      open={visible}
      onCancel={() => {
        handleReset();
        onCancel();
      }}
      width={800}
      footer={null}
    >
      <Steps current={currentStep} style={{ marginBottom: 32 }}>
        {steps.map(step => (
          <Step key={step.title} title={step.title} icon={step.icon} />
        ))}
      </Steps>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        {renderStepContent()}

        <Divider />

        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div>
            {currentStep > 0 && (
              <Button onClick={handlePrev}>
                Previous
              </Button>
            )}
          </div>
          <div>
            <Space>
              <Button onClick={() => {
                handleReset();
                onCancel();
              }}>
                Cancel
              </Button>
              {currentStep < steps.length - 1 && (
                <Button type="primary" onClick={handleNext}>
                  Next
                </Button>
              )}
              {currentStep === steps.length - 1 && (
                <Button
                  type="primary"
                  onClick={handleSubmit}
                  loading={loading}
                  icon={<CheckCircleOutlined />}
                >
                  Create Agent
                </Button>
              )}
            </Space>
          </div>
        </div>
      </Form>
    </Modal>
  );
};

export default AddAgentModal;
