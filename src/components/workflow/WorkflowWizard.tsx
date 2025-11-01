/**
 * Workflow Creation Wizard
 * 
 * Step-by-step wizard for creating new workflows
 * Features:
 * - Multi-step wizard interface
 * - Prompt-based workflow generation
 * - Schema discovery and selection
 * - Component configuration
 * - Validation and preview
 */

import React, { useState } from 'react';
import { Steps, Button, Input, Select, Form, Space, message, Card, Tag } from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';

const { Step } = Steps;
const { TextArea } = Input;

interface Props {
  onComplete: (workflow: any) => void;
  darkMode: boolean;
}

const WorkflowWizard: React.FC<Props> = ({ onComplete, darkMode }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [form] = Form.useForm();
  const [generating, setGenerating] = useState(false);
  const [generatedWorkflow, setGeneratedWorkflow] = useState<any>(null);

  const steps = [
    {
      title: 'Basic Info',
      description: 'Workflow details'
    },
    {
      title: 'Generate',
      description: 'AI generation'
    },
    {
      title: 'Configure',
      description: 'Fine-tune settings'
    },
    {
      title: 'Review',
      description: 'Preview and create'
    }
  ];

  const handleGenerateFromPrompt = async () => {
    try {
      const values = await form.validateFields(['prompt', 'name']);
      setGenerating(true);

      const response = await fetch('/api/workflow-generator/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: values.prompt,
          name: values.name
        })
      });

      if (response.ok) {
        const data = await response.json();
        setGeneratedWorkflow(data);
        message.success('Workflow generated successfully!');
        setCurrentStep(2);
      } else {
        throw new Error('Generation failed');
      }
    } catch (error) {
      console.error('Failed to generate workflow:', error);
      message.error('Failed to generate workflow');
    } finally {
      setGenerating(false);
    }
  };

  const handleNext = async () => {
    try {
      if (currentStep === 0) {
        await form.validateFields(['name', 'prompt']);
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
      
      // Save workflow as setup
      const response = await fetch('/api/workflow-generator/setups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: values.name,
          workflow: generatedWorkflow,
          metadata: {
            createdAt: new Date().toISOString(),
            prompt: values.prompt
          }
        })
      });

      if (response.ok) {
        message.success('Workflow created successfully!');
        onComplete(generatedWorkflow);
        form.resetFields();
        setCurrentStep(0);
        setGeneratedWorkflow(null);
      } else {
        throw new Error('Failed to save workflow');
      }
    } catch (error) {
      console.error('Failed to complete workflow:', error);
      message.error('Failed to create workflow');
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        // Basic Info
        return (
          <div className="space-y-4">
            <Form.Item
              name="name"
              label="Workflow Name"
              rules={[{ required: true, message: 'Please enter workflow name' }]}
            >
              <Input placeholder="e.g., user-management" />
            </Form.Item>

            <Form.Item
              name="prompt"
              label="Workflow Description (Prompt)"
              rules={[{ required: true, message: 'Please describe your workflow' }]}
              tooltip="Describe what you want this workflow to do. AI will generate the components and steps."
            >
              <TextArea 
                rows={4}
                placeholder="e.g., Create a user management workflow with user creation, editing, and deletion capabilities"
              />
            </Form.Item>

            <Form.Item name="category" label="Category">
              <Select placeholder="Select category">
                <Select.Option value="data-management">Data Management</Select.Option>
                <Select.Option value="automation">Automation</Select.Option>
                <Select.Option value="analytics">Analytics</Select.Option>
                <Select.Option value="integration">Integration</Select.Option>
                <Select.Option value="custom">Custom</Select.Option>
              </Select>
            </Form.Item>
          </div>
        );

      case 1:
        // Generate
        return (
          <div className="text-center space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Generate Workflow from Prompt</h3>
              <p className="text-gray-500">
                Click the button below to automatically generate workflow components from your description
              </p>
            </div>

            <div className={`p-6 rounded ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <div className="mb-4">
                <div className="text-sm text-gray-500">Your Prompt:</div>
                <div className="mt-2 font-medium">{form.getFieldValue('prompt')}</div>
              </div>
            </div>

            <Button
              type="primary"
              size="large"
              loading={generating}
              onClick={handleGenerateFromPrompt}
              icon={<PlusOutlined />}
            >
              Generate Workflow
            </Button>

            {generatedWorkflow && (
              <div className="mt-6">
                <Tag color="green" className="text-sm">
                  ✓ Workflow Generated Successfully
                </Tag>
                <div className="mt-4 grid grid-cols-3 gap-4">
                  <Card size="small">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{generatedWorkflow.atoms?.length || 0}</div>
                      <div className="text-sm text-gray-500">Atoms</div>
                    </div>
                  </Card>
                  <Card size="small">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{generatedWorkflow.components?.length || 0}</div>
                      <div className="text-sm text-gray-500">Components</div>
                    </div>
                  </Card>
                  <Card size="small">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{generatedWorkflow.settings?.length || 0}</div>
                      <div className="text-sm text-gray-500">Settings</div>
                    </div>
                  </Card>
                </div>
              </div>
            )}
          </div>
        );

      case 2:
        // Configure
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Fine-tune Configuration</h3>
            
            {generatedWorkflow && (
              <div className="space-y-4">
                <Card title="Components" size="small">
                  {generatedWorkflow.components?.map((comp: any, idx: number) => (
                    <div key={idx} className={`p-3 mb-2 rounded ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                      <div className="font-medium">{comp.name}</div>
                      <div className="text-sm text-gray-500 mt-1">
                        {comp.atoms?.length || 0} atoms
                      </div>
                    </div>
                  ))}
                </Card>

                <Card title="Settings" size="small">
                  <div className="grid grid-cols-2 gap-2">
                    {generatedWorkflow.settings?.slice(0, 6).map((setting: any, idx: number) => (
                      <Tag key={idx}>{setting.field || setting.name}</Tag>
                    ))}
                    {generatedWorkflow.settings?.length > 6 && (
                      <Tag>+{generatedWorkflow.settings.length - 6} more</Tag>
                    )}
                  </div>
                </Card>

                <Form.Item name="autoPopulateOptions" valuePropName="checked" initialValue={true}>
                  <Select defaultValue="yes">
                    <Select.Option value="yes">Auto-populate dropdown options</Select.Option>
                    <Select.Option value="no">Manual configuration</Select.Option>
                  </Select>
                </Form.Item>
              </div>
            )}
          </div>
        );

      case 3:
        // Review
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Review & Create</h3>
            
            <Card>
              <div className="space-y-3">
                <div>
                  <span className="text-gray-500">Name:</span>
                  <span className="ml-2 font-medium">{form.getFieldValue('name')}</span>
                </div>
                <div>
                  <span className="text-gray-500">Category:</span>
                  <span className="ml-2">{form.getFieldValue('category') || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-500">Prompt:</span>
                  <div className="mt-1 text-sm">{form.getFieldValue('prompt')}</div>
                </div>
              </div>
            </Card>

            {generatedWorkflow && (
              <Card title="Generated Components">
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">
                      {generatedWorkflow.atoms?.length || 0}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">Atoms</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">
                      {generatedWorkflow.components?.length || 0}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">Components</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">
                      {generatedWorkflow.dashboards?.length || 0}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">Dashboards</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-600">
                      {generatedWorkflow.settings?.length || 0}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">Settings</div>
                  </div>
                </div>
              </Card>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Steps current={currentStep} className="mb-8">
        {steps.map(item => (
          <Step key={item.title} title={item.title} description={item.description} />
        ))}
      </Steps>

      <Form form={form} layout="vertical" className="mb-6">
        {renderStepContent()}
      </Form>

      <div className="flex justify-between">
        <Button onClick={handlePrevious} disabled={currentStep === 0}>
          Previous
        </Button>
        <Space>
          {currentStep < steps.length - 1 && (
            <Button type="primary" onClick={handleNext}>
              Next
            </Button>
          )}
          {currentStep === steps.length - 1 && (
            <Button type="primary" onClick={handleComplete}>
              Create Workflow
            </Button>
          )}
        </Space>
      </div>
    </div>
  );
};

export default WorkflowWizard;
