/**
 * Onboarding Dashboard
 * Multi-step client onboarding with payment plan integration
 */

import React, { useState, useEffect } from 'react';
import { Card, Steps, Button, Form, Input, Select, Alert, Spin, Progress, Space, Typography, Descriptions, Tag } from 'antd';
import { CheckCircleOutlined, RightOutlined, LeftOutlined } from '@ant-design/icons';
import { onboardingAPI } from '@/services/apiService';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { Step } = Steps;

const OnboardingDashboard: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [sessionData, setSessionData] = useState<any>(null);
  const [steps, setSteps] = useState<any[]>([]);
  const [plans, setPlans] = useState<any>({});
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  // Load onboarding configuration on mount
  useEffect(() => {
    loadConfiguration();
  }, []);

  // Load session data when sessionId changes
  useEffect(() => {
    if (sessionId) {
      loadSessionData();
    }
  }, [sessionId]);

  const loadConfiguration = async () => {
    try {
      const [stepsData, plansData] = await Promise.all([
        onboardingAPI.getSteps(),
        onboardingAPI.getPlans()
      ]);
      setSteps(stepsData);
      setPlans(plansData);
    } catch (error) {
      console.error('Failed to load configuration:', error);
    }
  };

  const loadSessionData = async () => {
    if (!sessionId) return;
    
    try {
      setLoading(true);
      const data = await onboardingAPI.getSession(sessionId);
      setSessionData(data);
      setCurrentStep(data.currentStep || 0);
      setCompletedSteps(data.completedSteps || []);
    } catch (error) {
      console.error('Failed to load session:', error);
    } finally {
      setLoading(false);
    }
  };

  const startOnboarding = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields(['email']);
      const response = await onboardingAPI.startSession(values);
      setSessionId(response.sessionId);
      setCurrentStep(response.currentStep);
    } catch (error) {
      console.error('Failed to start onboarding:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitStep = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      
      if (!sessionId) {
        throw new Error('No session ID');
      }

      await onboardingAPI.submitStep(currentStep, values, sessionId);
      const nextResponse = await onboardingAPI.nextStep(sessionId);
      
      setCompletedSteps([...completedSteps, currentStep]);
      setCurrentStep(nextResponse.currentStep);
      form.resetFields();
      
      await loadSessionData();
    } catch (error) {
      console.error('Failed to submit step:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    try {
      setLoading(true);
      if (!sessionId) throw new Error('No session ID');
      
      const response = await onboardingAPI.completeOnboarding(sessionId);
      setSessionData(response);
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Render welcome step
  const renderWelcomeStep = () => (
    <div style={{ maxWidth: 500, margin: '0 auto', textAlign: 'center' }}>
      <Title level={2}>Welcome to LightDom</Title>
      <Paragraph>Let's get started with your SEO optimization journey</Paragraph>
      
      <Form form={form} layout="vertical" style={{ marginTop: 32 }}>
        <Form.Item
          name="email"
          label="Email Address"
          rules={[
            { required: true, message: 'Please enter your email' },
            { type: 'email', message: 'Please enter a valid email' }
          ]}
        >
          <Input size="large" placeholder="your@email.com" />
        </Form.Item>
        
        <Button type="primary" size="large" onClick={startOnboarding} loading={loading} block>
          Start Onboarding <RightOutlined />
        </Button>
      </Form>
    </div>
  );

  // Render business info step
  const renderBusinessInfoStep = () => (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <Title level={3}>Tell Us About Your Business</Title>
      <Paragraph>Help us understand your business and goals</Paragraph>
      
      <Form form={form} layout="vertical">
        <Form.Item
          name="companyName"
          label="Company Name"
          rules={[{ required: true, message: 'Please enter your company name' }]}
        >
          <Input size="large" placeholder="Acme Inc." />
        </Form.Item>
        
        <Form.Item
          name="websiteUrl"
          label="Website URL"
          rules={[
            { required: true, message: 'Please enter your website URL' },
            { type: 'url', message: 'Please enter a valid URL' }
          ]}
        >
          <Input size="large" placeholder="https://example.com" />
        </Form.Item>
        
        <Form.Item
          name="industry"
          label="Industry"
          rules={[{ required: true, message: 'Please select your industry' }]}
        >
          <Select size="large" placeholder="Select your industry">
            <Option value="technology">Technology</Option>
            <Option value="ecommerce">E-commerce</Option>
            <Option value="healthcare">Healthcare</Option>
            <Option value="finance">Finance</Option>
            <Option value="education">Education</Option>
            <Option value="real-estate">Real Estate</Option>
            <Option value="other">Other</Option>
          </Select>
        </Form.Item>
      </Form>
    </div>
  );

  // Render plan selection step
  const renderPlanSelectionStep = () => (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <Title level={3}>Choose Your Plan</Title>
      <Paragraph>Select the plan that best fits your needs</Paragraph>
      
      <Form form={form} layout="vertical">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16, marginBottom: 24 }}>
          {Object.entries(plans).map(([key, plan]: [string, any]) => (
            <Card
              key={key}
              hoverable
              style={{
                borderColor: selectedPlan === key ? '#1890ff' : undefined,
                borderWidth: selectedPlan === key ? 2 : 1
              }}
              onClick={() => {
                setSelectedPlan(key);
                form.setFieldsValue({ selectedPlan: key });
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <Title level={4}>{plan.name}</Title>
                <Title level={2} style={{ color: '#1890ff', margin: '16px 0' }}>
                  ${plan.price}<Text type="secondary">/mo</Text>
                </Title>
                
                <div style={{ textAlign: 'left', marginTop: 16 }}>
                  <Text strong>Features:</Text>
                  <ul style={{ marginTop: 8 }}>
                    {plan.campaignTemplate.features.map((feature: string) => (
                      <li key={feature}>
                        <Text>{feature.replace(/_/g, ' ')}</Text>
                      </li>
                    ))}
                  </ul>
                  
                  <Descriptions size="small" column={1}>
                    <Descriptions.Item label="Keywords">
                      {plan.campaignTemplate.maxKeywords}
                    </Descriptions.Item>
                    <Descriptions.Item label="Competitors">
                      {plan.campaignTemplate.maxCompetitors}
                    </Descriptions.Item>
                    <Descriptions.Item label="Crawl Frequency">
                      {plan.campaignTemplate.crawlFrequency}
                    </Descriptions.Item>
                  </Descriptions>
                </div>
              </div>
            </Card>
          ))}
        </div>
        
        <Form.Item
          name="selectedPlan"
          rules={[{ required: true, message: 'Please select a plan' }]}
          hidden
        >
          <Input />
        </Form.Item>
        
        <Form.Item
          name="billingCycle"
          label="Billing Cycle"
          rules={[{ required: true, message: 'Please select billing cycle' }]}
        >
          <Select size="large">
            <Option value="monthly">Monthly</Option>
            <Option value="annual">Annual (Save 20%)</Option>
          </Select>
        </Form.Item>
      </Form>
    </div>
  );

  // Render campaign setup step
  const renderCampaignSetupStep = () => {
    const currentPlan = selectedPlan && plans[selectedPlan];
    
    return (
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <Title level={3}>Campaign Setup</Title>
        <Paragraph>Configure your marketing campaign</Paragraph>
        
        {currentPlan && (
          <Alert
            message={`${currentPlan.name} Plan Selected`}
            description={`You can add up to ${currentPlan.campaignTemplate.maxKeywords} keywords and ${currentPlan.campaignTemplate.maxCompetitors} competitors.`}
            type="info"
            showIcon
            style={{ marginBottom: 24 }}
          />
        )}
        
        <Form form={form} layout="vertical">
          <Form.Item
            name="targetKeywords"
            label="Target Keywords"
            rules={[{ required: true, message: 'Please enter target keywords' }]}
          >
            <Select
              mode="tags"
              size="large"
              placeholder="Enter keywords and press enter"
              style={{ width: '100%' }}
            />
          </Form.Item>
          
          <Form.Item
            name="competitorUrls"
            label="Competitor URLs"
            rules={[{ required: true, message: 'Please enter competitor URLs' }]}
          >
            <Select
              mode="tags"
              size="large"
              placeholder="Enter competitor URLs and press enter"
              style={{ width: '100%' }}
            />
          </Form.Item>
          
          <Form.Item
            name="goals"
            label="Goals (Optional)"
          >
            <Input.TextArea 
              rows={4} 
              placeholder="What are your main SEO goals?"
            />
          </Form.Item>
        </Form>
      </div>
    );
  };

  // Render complete step
  const renderCompleteStep = () => (
    <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
      <CheckCircleOutlined style={{ fontSize: 72, color: '#52c41a', marginBottom: 24 }} />
      <Title level={2}>You're All Set!</Title>
      <Paragraph>Your account is ready to start optimizing</Paragraph>
      
      {sessionData && (
        <Card style={{ marginTop: 32, textAlign: 'left' }}>
          <Title level={4}>Your Account Summary</Title>
          <Descriptions column={1} bordered>
            <Descriptions.Item label="Email">
              {sessionData.stepData?.welcome?.email}
            </Descriptions.Item>
            <Descriptions.Item label="Company">
              {sessionData.stepData?.business_info?.companyName}
            </Descriptions.Item>
            <Descriptions.Item label="Website">
              {sessionData.stepData?.business_info?.websiteUrl}
            </Descriptions.Item>
            <Descriptions.Item label="Plan">
              <Tag color="blue">
                {sessionData.stepData?.plan_selection?.selectedPlan}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Keywords">
              {sessionData.stepData?.campaign_setup?.targetKeywords?.length || 0}
            </Descriptions.Item>
            <Descriptions.Item label="Competitors">
              {sessionData.stepData?.campaign_setup?.competitorUrls?.length || 0}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      )}
      
      <Button type="primary" size="large" style={{ marginTop: 32 }}>
        Go to Dashboard
      </Button>
    </div>
  );

  // Render current step content
  const renderStepContent = () => {
    if (loading && !sessionData) {
      return <Spin size="large" />;
    }

    const stepName = steps[currentStep]?.stepName;

    switch (stepName) {
      case 'welcome':
        return renderWelcomeStep();
      case 'business_info':
        return renderBusinessInfoStep();
      case 'plan_selection':
        return renderPlanSelectionStep();
      case 'campaign_setup':
        return renderCampaignSetupStep();
      case 'complete':
        return renderCompleteStep();
      default:
        return <div>Unknown step</div>;
    }
  };

  // Calculate progress
  const progress = steps.length > 0 ? Math.round((currentStep / (steps.length - 1)) * 100) : 0;

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <Title level={2}>Client Onboarding</Title>
      
      {sessionId && steps.length > 0 && (
        <>
          <Progress percent={progress} style={{ marginBottom: 24 }} />
          
          <Steps current={currentStep} style={{ marginBottom: 48 }}>
            {steps.map((step, index) => (
              <Step
                key={index}
                title={step.stepTitle}
                description={step.stepDescription}
                icon={completedSteps.includes(index) ? <CheckCircleOutlined /> : undefined}
              />
            ))}
          </Steps>
        </>
      )}
      
      <Card>
        {renderStepContent()}
        
        {sessionId && currentStep > 0 && currentStep < steps.length - 1 && (
          <div style={{ marginTop: 32, display: 'flex', justifyContent: 'space-between' }}>
            <Button onClick={handlePrevious} disabled={currentStep === 0}>
              <LeftOutlined /> Previous
            </Button>
            
            <Space>
              {currentStep === steps.length - 2 ? (
                <Button type="primary" onClick={handleComplete} loading={loading}>
                  Complete Onboarding
                </Button>
              ) : (
                <Button type="primary" onClick={handleSubmitStep} loading={loading}>
                  Next <RightOutlined />
                </Button>
              )}
            </Space>
          </div>
        )}
      </Card>
    </div>
  );
};

export default OnboardingDashboard;
