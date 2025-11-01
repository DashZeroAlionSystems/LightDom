/**
 * Workflow Components Demo
 * Demonstrates the new Material Design 3.0 workflow components
 */

import React, { useState } from 'react';
import { Row, Col, Space, Card, Button } from 'antd';
import { PlayCircleOutlined, PauseCircleOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import MaterialDesignSystem, { MaterialWorkflowComponents } from '../styles/MaterialDesignSystem';

const { WorkflowCard, StatusIndicator, ActionButton, ProgressTracker, NotificationToast } = MaterialWorkflowComponents;
const { MaterialSpacing, MaterialColors } = MaterialDesignSystem;

const WorkflowDemo: React.FC = () => {
  const [currentStep, setCurrentStep] = useState('step1');
  const [progress, setProgress] = useState(25);
  const [showToast, setShowToast] = useState(false);
  const [toastType, setToastType] = useState<'success' | 'error' | 'warning' | 'info'>('success');

  const workflowSteps = [
    {
      id: 'step1',
      title: 'Initialize',
      description: 'Setting up environment',
      status: 'completed' as const,
    },
    {
      id: 'step2',
      title: 'Process Data',
      description: 'Analyzing input data',
      status: 'running' as const,
    },
    {
      id: 'step3',
      title: 'Generate Results',
      description: 'Creating output',
      status: 'pending' as const,
    },
    {
      id: 'step4',
      title: 'Finalize',
      description: 'Completing workflow',
      status: 'pending' as const,
    },
  ];

  const handleAction = (type: 'success' | 'error' | 'warning' | 'info') => {
    setToastType(type);
    setShowToast(true);
  };

  const advanceStep = () => {
    if (currentStep === 'step1') setCurrentStep('step2');
    else if (currentStep === 'step2') {
      setCurrentStep('step3');
      setProgress(75);
    }
    else if (currentStep === 'step3') {
      setCurrentStep('step4');
      setProgress(100);
    }
  };

  return (
    <div style={{ padding: MaterialSpacing.lg, maxWidth: '1200px', margin: '0 auto' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: MaterialSpacing.xl }}>
          <h1 style={{ color: MaterialColors.primary[60], marginBottom: MaterialSpacing.sm }}>
            Material Design 3.0 Workflow Components
          </h1>
          <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '16px' }}>
            Advanced workflow components for modern applications
          </p>
        </div>

        {/* Status Indicators */}
        <Card title="Status Indicators" bordered={false}>
          <Space wrap size="large">
            <StatusIndicator status="idle" />
            <StatusIndicator status="running" animated />
            <StatusIndicator status="completed" />
            <StatusIndicator status="error" />
            <StatusIndicator status="warning" />
            <StatusIndicator status="info" />
          </Space>
        </Card>

        {/* Action Buttons */}
        <Card title="Action Buttons" bordered={false}>
          <Space wrap size="medium">
            <ActionButton variant="primary" icon={<PlayCircleOutlined />}>
              Start Process
            </ActionButton>
            <ActionButton variant="secondary" icon={<PauseCircleOutlined />}>
              Pause
            </ActionButton>
            <ActionButton variant="success" icon={<CheckCircleOutlined />}>
              Complete
            </ActionButton>
            <ActionButton variant="warning">
              Warning
            </ActionButton>
            <ActionButton variant="error" icon={<CloseCircleOutlined />}>
              Cancel
            </ActionButton>
          </Space>
        </Card>

        {/* Progress Tracker */}
        <Card title="Progress Tracker" bordered={false}>
          <ProgressTracker
            steps={workflowSteps}
            currentStep={currentStep}
          />
          <div style={{ marginTop: MaterialSpacing.lg, textAlign: 'center' }}>
            <Space>
              <Button onClick={advanceStep} type="primary">
                Advance Step
              </Button>
              <Button onClick={() => setProgress(Math.max(0, progress - 10))}>
                Decrease Progress
              </Button>
              <Button onClick={() => setProgress(Math.min(100, progress + 10))}>
                Increase Progress
              </Button>
            </Space>
          </div>
        </Card>

        {/* Workflow Cards */}
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={8}>
            <WorkflowCard
              title="Data Processing"
              description="Processing user data and generating insights"
              status="running"
              progress={progress}
              actions={
                <Space>
                  <ActionButton size="sm" variant="primary">
                    View Details
                  </ActionButton>
                </Space>
              }
            >
              <div style={{ marginTop: MaterialSpacing.sm }}>
                <p>Currently processing 1,234 records with 89% accuracy.</p>
              </div>
            </WorkflowCard>
          </Col>

          <Col xs={24} lg={8}>
            <WorkflowCard
              title="API Integration"
              description="Connecting to external services"
              status="completed"
              progress={100}
              actions={
                <Space>
                  <ActionButton size="sm" variant="secondary">
                    Reconnect
                  </ActionButton>
                </Space>
              }
            >
              <div style={{ marginTop: MaterialSpacing.sm }}>
                <p>Successfully connected to 5 external APIs.</p>
              </div>
            </WorkflowCard>
          </Col>

          <Col xs={24} lg={8}>
            <WorkflowCard
              title="Report Generation"
              description="Creating final reports and analytics"
              status="error"
              progress={0}
              actions={
                <Space>
                  <ActionButton size="sm" variant="error">
                    Retry
                  </ActionButton>
                  <ActionButton size="sm" variant="secondary">
                    Skip
                  </ActionButton>
                </Space>
              }
            >
              <div style={{ marginTop: MaterialSpacing.sm }}>
                <p>Error: Insufficient data for report generation.</p>
              </div>
            </WorkflowCard>
          </Col>
        </Row>

        {/* Notification Toast Demo */}
        <Card title="Notification Toasts" bordered={false}>
          <Space wrap size="medium">
            <Button onClick={() => handleAction('success')} type="primary">
              Show Success Toast
            </Button>
            <Button onClick={() => handleAction('error')} danger>
              Show Error Toast
            </Button>
            <Button onClick={() => handleAction('warning')}>
              Show Warning Toast
            </Button>
            <Button onClick={() => handleAction('info')}>
              Show Info Toast
            </Button>
          </Space>

          {showToast && (
            <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 1000 }}>
              <NotificationToast
                type={toastType}
                title={`${toastType.charAt(0).toUpperCase() + toastType.slice(1)} Notification`}
                message={`This is a ${toastType} notification message demonstrating the Material Design 3.0 toast component.`}
                onClose={() => setShowToast(false)}
                action={
                  <Button size="small" type="primary">
                    View Details
                  </Button>
                }
              />
            </div>
          )}
        </Card>

        {/* Component Features */}
        <Card title="Component Features" bordered={false}>
          <Row gutter={[24, 16]}>
            <Col xs={24} md={12}>
              <h3>🎨 Material Design 3.0</h3>
              <ul>
                <li>Consistent color system with semantic meanings</li>
                <li>Adaptive typography scale</li>
                <li>Dynamic elevation system</li>
                <li>Responsive spacing tokens</li>
              </ul>
            </Col>
            <Col xs={24} md={12}>
              <h3>⚡ Advanced Interactions</h3>
              <ul>
                <li>Framer Motion animations</li>
                <li>Smooth state transitions</li>
                <li>Interactive hover effects</li>
                <li>Loading states and feedback</li>
              </ul>
            </Col>
          </Row>
        </Card>
      </Space>
    </div>
  );
};

export default WorkflowDemo;
