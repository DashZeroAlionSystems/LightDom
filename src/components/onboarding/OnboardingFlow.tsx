/**
 * Professional SEO Onboarding Flow
 * Complete user journey from registration to paid conversion
 */

import React, { useState, useEffect } from 'react';
import { Card, Steps, Button, message, Spin } from 'antd';
import {
  UserOutlined,
  GlobalOutlined,
  RocketOutlined,
  CreditCardOutlined,
  CheckCircleOutlined,
  LoadingOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useEnhancedAuth } from '@/contexts/EnhancedAuthContext';
import WelcomeStep from './steps/WelcomeStep';
import WebsiteSetupStep from './steps/WebsiteSetupStep';
import FirstReportStep from './steps/FirstReportStep';
import PricingStep from './steps/PricingStep';
import ScriptSetupStep from './steps/ScriptSetupStep';

const { Step } = Steps;

interface OnboardingState {
  currentStep: number;
  websiteUrl: string;
  technicalContact: {
    name: string;
    email: string;
  };
  selectedPlan: string;
  reportGenerated: boolean;
  scriptGenerated: boolean;
}

const OnboardingFlow: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useEnhancedAuth();
  
  const [state, setState] = useState<OnboardingState>({
    currentStep: 0,
    websiteUrl: '',
    technicalContact: { name: '', email: '' },
    selectedPlan: 'free',
    reportGenerated: false,
    scriptGenerated: false
  });

  const [loading, setLoading] = useState(false);

  const steps = [
    {
      title: 'Welcome',
      icon: <UserOutlined />,
      description: 'Get started with LightDom SEO'
    },
    {
      title: 'Website Setup',
      icon: <GlobalOutlined />,
      description: 'Add your website'
    },
    {
      title: 'First Report',
      icon: <RocketOutlined />,
      description: 'Generate SEO analysis'
    },
    {
      title: 'Choose Plan',
      icon: <CreditCardOutlined />,
      description: 'Select your subscription'
    },
    {
      title: 'Script Setup',
      icon: <CheckCircleOutlined />,
      description: 'Install tracking script'
    }
  ];

  const handleNext = async () => {
    setLoading(true);
    try {
      // Validate current step before proceeding
      if (state.currentStep === 1 && !state.websiteUrl) {
        message.error('Please enter a valid website URL');
        setLoading(false);
        return;
      }

      if (state.currentStep === 2 && !state.reportGenerated) {
        message.error('Please wait for the report to complete');
        setLoading(false);
        return;
      }

      setState(prev => ({
        ...prev,
        currentStep: prev.currentStep + 1
      }));
    } catch (error) {
      message.error('An error occurred. Please try again.');
      console.error('Onboarding error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrevious = () => {
    setState(prev => ({
      ...prev,
      currentStep: Math.max(0, prev.currentStep - 1)
    }));
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      // Save onboarding completion
      await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          websiteUrl: state.websiteUrl,
          technicalContact: state.technicalContact,
          selectedPlan: state.selectedPlan
        })
      });

      message.success('Onboarding completed successfully!');
      navigate('/app/dashboard');
    } catch (error) {
      message.error('Failed to complete onboarding');
      console.error('Completion error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateState = (updates: Partial<OnboardingState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const renderStep = () => {
    switch (state.currentStep) {
      case 0:
        return <WelcomeStep onNext={handleNext} />;
      case 1:
        return (
          <WebsiteSetupStep
            websiteUrl={state.websiteUrl}
            technicalContact={state.technicalContact}
            onUpdate={updateState}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        );
      case 2:
        return (
          <FirstReportStep
            websiteUrl={state.websiteUrl}
            onReportComplete={() => updateState({ reportGenerated: true })}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        );
      case 3:
        return (
          <PricingStep
            currentPlan={state.selectedPlan}
            onSelectPlan={(plan) => updateState({ selectedPlan: plan })}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        );
      case 4:
        return (
          <ScriptSetupStep
            websiteUrl={state.websiteUrl}
            technicalContact={state.technicalContact}
            selectedPlan={state.selectedPlan}
            onComplete={handleComplete}
            onPrevious={handlePrevious}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="onboarding-flow" style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '40px 20px'
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <Card 
          bordered={false}
          style={{ 
            borderRadius: 16, 
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}
        >
          <Steps 
            current={state.currentStep} 
            style={{ marginBottom: 40 }}
            responsive={false}
          >
            {steps.map((step, index) => (
              <Step
                key={index}
                title={step.title}
                description={step.description}
                icon={step.icon}
              />
            ))}
          </Steps>

          <Spin spinning={loading} indicator={<LoadingOutlined spin />}>
            <div style={{ minHeight: 400 }}>
              {renderStep()}
            </div>
          </Spin>
        </Card>
      </div>
    </div>
  );
};

export default OnboardingFlow;
