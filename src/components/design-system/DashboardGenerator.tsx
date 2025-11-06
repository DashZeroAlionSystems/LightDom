/**
 * Dashboard Generator Component
 * AI-powered dashboard creation from natural language prompts
 * Follows Material Design 3 and n8n workflow patterns
 */

import React, { useState } from 'react';
import {
  Card,
  Steps,
  Input,
  Button,
  Space,
  Typography,
  Tag,
  Spin,
  Alert,
  message,
  Row,
  Col,
  Select,
  Divider,
  Tabs,
  Progress,
} from 'antd';
import {
  WandSparkles,
  LayoutDashboard,
  Settings,
  Eye,
  Save,
  ArrowRight,
  ArrowLeft,
  Loader2,
  CheckCircle,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

const { TextArea } = Input;
const { Title, Paragraph, Text } = Typography;
const { TabPane } = Tabs;

interface DashboardGeneratorProps {
  onComplete?: (dashboard: any) => void;
  onCancel?: () => void;
  initialSubject?: string;
}

interface GeneratedDashboard {
  name: string;
  description: string;
  subject: string;
  layoutType: string;
  layoutConfig: any;
  widgets: any[];
  schema: any;
  reasoning?: string;
}

export default function DashboardGenerator({
  onComplete,
  onCancel,
  initialSubject,
}: DashboardGeneratorProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  
  // Step 1: Prompt
  const [subject, setSubject] = useState(initialSubject || '');
  const [prompt, setPrompt] = useState('');
  const [dashboardType, setDashboardType] = useState<string>('analytics');
  
  // Step 2: AI Generation
  const [generatedDashboard, setGeneratedDashboard] = useState<GeneratedDashboard | null>(null);
  const [aiReasoning, setAiReasoning] = useState('');
  
  // Step 3: Configuration
  const [dashboardConfig, setDashboardConfig] = useState<any>(null);
  
  // Step 4: Preview
  const [previewData, setPreviewData] = useState<any>(null);

  const dashboardTypes = [
    { value: 'analytics', label: 'Analytics Dashboard', icon: '📊' },
    { value: 'monitoring', label: 'System Monitoring', icon: '🔍' },
    { value: 'workflow', label: 'Workflow Management', icon: '⚙️' },
    { value: 'crm', label: 'CRM Dashboard', icon: '👥' },
    { value: 'ecommerce', label: 'E-Commerce', icon: '🛒' },
    { value: 'seo', label: 'SEO Dashboard', icon: '🔎' },
    { value: 'content', label: 'Content Management', icon: '📝' },
    { value: 'custom', label: 'Custom Dashboard', icon: '🎨' },
  ];

  const promptExamples = [
    'Create an analytics dashboard for tracking website traffic, user engagement, and conversion metrics',
    'Build a monitoring dashboard showing server performance, CPU usage, memory, and error logs',
    'Design a workflow dashboard for managing scraping tasks, crawl schedules, and SEO analysis results',
    'Generate a CRM dashboard with customer stats, sales pipeline, and recent activities',
  ];

  const steps = [
    { title: 'Define', icon: <WandSparkles className="w-4 h-4" /> },
    { title: 'Generate', icon: <Sparkles className="w-4 h-4" /> },
    { title: 'Configure', icon: <Settings className="w-4 h-4" /> },
    { title: 'Preview', icon: <Eye className="w-4 h-4" /> },
    { title: 'Save', icon: <Save className="w-4 h-4" /> },
  ];

  const handleGenerateDashboard = async () => {
    if (!subject || !prompt) {
      message.error('Please provide both subject and prompt');
      return;
    }

    setGenerating(true);
    setLoading(true);

    try {
      // Call Ollama API to generate dashboard
      const response = await fetch('/api/dashboards/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          prompt,
          dashboardType,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate dashboard');
      }

      const data = await response.json();
      
      setGeneratedDashboard(data.dashboard);
      setAiReasoning(data.reasoning);
      setDashboardConfig(data.dashboard.schema);
      
      message.success('Dashboard generated successfully!');
      setCurrentStep(1);
    } catch (error) {
      console.error('Dashboard generation error:', error);
      message.error('Failed to generate dashboard. Please try again.');
    } finally {
      setGenerating(false);
      setLoading(false);
    }
  };

  const handleSaveDashboard = async () => {
    if (!generatedDashboard) {
      message.error('No dashboard to save');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/dashboards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...generatedDashboard,
          schema: dashboardConfig,
          prompt,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save dashboard');
      }

      const savedDashboard = await response.json();
      
      message.success('Dashboard saved successfully!');
      
      if (onComplete) {
        onComplete(savedDashboard);
      }
    } catch (error) {
      console.error('Save error:', error);
      message.error('Failed to save dashboard');
    } finally {
      setLoading(false);
    }
  };

  const renderPromptStep = () => (
    <div className="space-y-6">
      <Card className="bg-surface-variant/30">
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div>
            <Title level={4}>What type of dashboard do you need?</Title>
            <Select
              value={dashboardType}
              onChange={setDashboardType}
              style={{ width: '100%' }}
              size="large"
              placeholder="Select dashboard type"
            >
              {dashboardTypes.map((type) => (
                <Select.Option key={type.value} value={type.value}>
                  <Space>
                    <span>{type.icon}</span>
                    <span>{type.label}</span>
                  </Space>
                </Select.Option>
              ))}
            </Select>
          </div>

          <div>
            <Title level={4}>Dashboard Subject</Title>
            <Paragraph type="secondary">
              Brief topic or focus area for the dashboard
            </Paragraph>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g., Web Analytics, Server Monitoring, Sales Pipeline"
              size="large"
            />
          </div>

          <div>
            <Title level={4}>Describe Your Dashboard</Title>
            <Paragraph type="secondary">
              Explain what metrics, charts, and data you want to display
            </Paragraph>
            <TextArea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the dashboard components, metrics, charts, and layout you need..."
              rows={6}
              size="large"
            />
          </div>

          <div>
            <Text strong>Example Prompts:</Text>
            <div className="mt-2 space-y-2">
              {promptExamples.map((example, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-surface rounded cursor-pointer hover:bg-surface-variant/50 transition-colors"
                  onClick={() => setPrompt(example)}
                >
                  <Text type="secondary" className="text-sm">
                    {example}
                  </Text>
                </div>
              ))}
            </div>
          </div>
        </Space>
      </Card>

      <div className="flex justify-between">
        <Button size="large" onClick={onCancel} icon={<ArrowLeft className="w-4 h-4" />}>
          Cancel
        </Button>
        <Button
          type="primary"
          size="large"
          onClick={handleGenerateDashboard}
          disabled={!subject || !prompt}
          loading={generating}
          icon={<Sparkles className="w-4 h-4" />}
        >
          Generate Dashboard
        </Button>
      </div>
    </div>
  );

  const renderGenerationStep = () => (
    <div className="space-y-6">
      {generating ? (
        <Card className="text-center py-12">
          <Spin size="large" />
          <Title level={4} className="mt-4">
            AI is generating your dashboard...
          </Title>
          <Paragraph type="secondary">
            Analyzing your requirements and creating the perfect layout
          </Paragraph>
        </Card>
      ) : (
        <>
          <Alert
            message="Dashboard Generated Successfully!"
            description={`AI created a ${dashboardType} dashboard based on your requirements.`}
            type="success"
            showIcon
            icon={<CheckCircle className="w-5 h-5" />}
          />

          {aiReasoning && (
            <Card title="AI Reasoning" className="bg-surface-variant/30">
              <Paragraph>{aiReasoning}</Paragraph>
            </Card>
          )}

          {generatedDashboard && (
            <Card title="Generated Dashboard">
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <div>
                  <Text strong>Name:</Text> {generatedDashboard.name}
                </div>
                <div>
                  <Text strong>Description:</Text> {generatedDashboard.description}
                </div>
                <div>
                  <Text strong>Layout:</Text>{' '}
                  <Tag color="blue">{generatedDashboard.layoutType}</Tag>
                </div>
                <div>
                  <Text strong>Widgets:</Text>{' '}
                  <Tag color="green">{generatedDashboard.widgets?.length || 0} widgets</Tag>
                </div>
                <Divider />
                <div>
                  <Text strong>Widget List:</Text>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {generatedDashboard.widgets?.map((widget: any, idx: number) => (
                      <div key={idx} className="p-2 bg-surface rounded">
                        <Text className="text-sm">
                          {idx + 1}. {widget.title || widget.name} ({widget.type})
                        </Text>
                      </div>
                    ))}
                  </div>
                </div>
              </Space>
            </Card>
          )}

          <div className="flex justify-between">
            <Button
              size="large"
              onClick={() => setCurrentStep(0)}
              icon={<ArrowLeft className="w-4 h-4" />}
            >
              Back
            </Button>
            <Button
              type="primary"
              size="large"
              onClick={() => setCurrentStep(2)}
              icon={<ArrowRight className="w-4 h-4" />}
            >
              Configure
            </Button>
          </div>
        </>
      )}
    </div>
  );

  const renderConfigurationStep = () => (
    <div className="space-y-6">
      <Card title="Dashboard Configuration">
        <Tabs defaultActiveKey="layout">
          <TabPane tab="Layout" key="layout">
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <div>
                <Text strong>Grid Columns:</Text>
                <Select
                  value={dashboardConfig?.columns || 4}
                  onChange={(val) =>
                    setDashboardConfig({ ...dashboardConfig, columns: val })
                  }
                  style={{ width: '100%', marginTop: 8 }}
                >
                  {[2, 3, 4, 6].map((num) => (
                    <Select.Option key={num} value={num}>
                      {num} Columns
                    </Select.Option>
                  ))}
                </Select>
              </div>
              <div>
                <Text strong>Gap Size:</Text>
                <Select
                  value={dashboardConfig?.gap || 'md'}
                  onChange={(val) => setDashboardConfig({ ...dashboardConfig, gap: val })}
                  style={{ width: '100%', marginTop: 8 }}
                >
                  <Select.Option value="sm">Small</Select.Option>
                  <Select.Option value="md">Medium</Select.Option>
                  <Select.Option value="lg">Large</Select.Option>
                </Select>
              </div>
            </Space>
          </TabPane>
          <TabPane tab="Theme" key="theme">
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <div>
                <Text strong>Color Scheme:</Text>
                <Select
                  value={dashboardConfig?.theme || 'material-you'}
                  onChange={(val) =>
                    setDashboardConfig({ ...dashboardConfig, theme: val })
                  }
                  style={{ width: '100%', marginTop: 8 }}
                >
                  <Select.Option value="material-you">Material You</Select.Option>
                  <Select.Option value="light">Light</Select.Option>
                  <Select.Option value="dark">Dark</Select.Option>
                </Select>
              </div>
            </Space>
          </TabPane>
          <TabPane tab="Refresh" key="refresh">
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <div>
                <Text strong>Auto Refresh (seconds):</Text>
                <Select
                  value={dashboardConfig?.refreshInterval || 0}
                  onChange={(val) =>
                    setDashboardConfig({ ...dashboardConfig, refreshInterval: val })
                  }
                  style={{ width: '100%', marginTop: 8 }}
                >
                  <Select.Option value={0}>Disabled</Select.Option>
                  <Select.Option value={5}>5 seconds</Select.Option>
                  <Select.Option value={10}>10 seconds</Select.Option>
                  <Select.Option value={30}>30 seconds</Select.Option>
                  <Select.Option value={60}>1 minute</Select.Option>
                </Select>
              </div>
            </Space>
          </TabPane>
        </Tabs>
      </Card>

      <div className="flex justify-between">
        <Button
          size="large"
          onClick={() => setCurrentStep(1)}
          icon={<ArrowLeft className="w-4 h-4" />}
        >
          Back
        </Button>
        <Button
          type="primary"
          size="large"
          onClick={() => setCurrentStep(3)}
          icon={<ArrowRight className="w-4 h-4" />}
        >
          Preview
        </Button>
      </div>
    </div>
  );

  const renderPreviewStep = () => (
    <div className="space-y-6">
      <Alert
        message="Dashboard Preview"
        description="Review your dashboard before saving. You can go back to make changes."
        type="info"
        showIcon
      />

      <Card title="Dashboard Preview" className="min-h-[400px]">
        <div className="p-4 bg-surface rounded">
          <Title level={3}>{generatedDashboard?.name}</Title>
          <Paragraph>{generatedDashboard?.description}</Paragraph>
          <Divider />
          
          <div
            className={`grid gap-${dashboardConfig?.gap || 'md'}`}
            style={{
              gridTemplateColumns: `repeat(${dashboardConfig?.columns || 4}, 1fr)`,
            }}
          >
            {generatedDashboard?.widgets?.map((widget: any, idx: number) => (
              <Card
                key={idx}
                size="small"
                className="bg-surface-variant"
                title={
                  <Space>
                    <span>{widget.icon || '📊'}</span>
                    <span>{widget.title || widget.name}</span>
                  </Space>
                }
              >
                <div className="h-32 flex items-center justify-center bg-surface rounded">
                  <Text type="secondary">{widget.type} widget</Text>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </Card>

      <div className="flex justify-between">
        <Button
          size="large"
          onClick={() => setCurrentStep(2)}
          icon={<ArrowLeft className="w-4 h-4" />}
        >
          Back to Configuration
        </Button>
        <Button
          type="primary"
          size="large"
          onClick={() => setCurrentStep(4)}
          icon={<ArrowRight className="w-4 h-4" />}
        >
          Continue to Save
        </Button>
      </div>
    </div>
  );

  const renderSaveStep = () => (
    <div className="space-y-6">
      <Card className="text-center">
        <CheckCircle className="w-16 h-16 mx-auto text-success mb-4" />
        <Title level={3}>Ready to Save</Title>
        <Paragraph>
          Your dashboard is configured and ready. Click save to add it to your collection.
        </Paragraph>

        <div className="mt-6 space-y-4">
          <Button
            type="primary"
            size="large"
            onClick={handleSaveDashboard}
            loading={loading}
            icon={<Save className="w-4 h-4" />}
            block
          >
            Save Dashboard
          </Button>
          <Button
            size="large"
            onClick={() => setCurrentStep(3)}
            icon={<ArrowLeft className="w-4 h-4" />}
            block
          >
            Back to Preview
          </Button>
        </div>
      </Card>
    </div>
  );

  const stepComponents = [
    renderPromptStep,
    renderGenerationStep,
    renderConfigurationStep,
    renderPreviewStep,
    renderSaveStep,
  ];

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="mb-8 text-center">
        <LayoutDashboard className="w-12 h-12 mx-auto mb-4 text-primary" />
        <Title level={2}>Dashboard Generator</Title>
        <Paragraph type="secondary">
          Create custom dashboards using AI-powered generation
        </Paragraph>
      </div>

      <Steps current={currentStep} className="mb-8">
        {steps.map((step, index) => (
          <Steps.Step
            key={index}
            title={step.title}
            icon={step.icon}
            disabled={index > currentStep}
          />
        ))}
      </Steps>

      <div className="bg-surface-container rounded-lg p-6">
        {stepComponents[currentStep]()}
      </div>
    </div>
  );
}
