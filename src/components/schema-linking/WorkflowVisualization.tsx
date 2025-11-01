import React, { useState, useEffect } from 'react';
import { Card, Steps, Button, Tag, Descriptions, Empty, Spin, message, Timeline } from 'antd';
import {
  PlayCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  LoadingOutlined,
  ApiOutlined,
  DatabaseOutlined,
  SettingOutlined
} from '@ant-design/icons';

const { Step } = Steps;

interface WorkflowVisualizationProps {
  feature: string | null;
  darkMode: boolean;
}

const WorkflowVisualization: React.FC<WorkflowVisualizationProps> = ({
  feature,
  darkMode
}) => {
  const [workflow, setWorkflow] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [executionResults, setExecutionResults] = useState<any[]>([]);

  useEffect(() => {
    if (feature) {
      loadWorkflow(feature);
    }
  }, [feature]);

  const loadWorkflow = async (featureName: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/schema-linking/workflows/${featureName}`);
      const result = await response.json();
      
      if (result.success) {
        setWorkflow(result.data.workflows);
        setExecutionResults([]);
        setCurrentStep(0);
      }
    } catch (error) {
      console.error('Failed to load workflow:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteWorkflow = async () => {
    if (!workflow || !workflow.steps) return;

    setExecuting(true);
    setExecutionResults([]);
    setCurrentStep(0);

    for (let i = 0; i < workflow.steps.length; i++) {
      setCurrentStep(i);
      const step = workflow.steps[i];

      // Simulate step execution
      await new Promise(resolve => setTimeout(resolve, 1500));

      const result = {
        stepId: step.id,
        status: 'completed',
        timestamp: new Date().toISOString(),
        fieldsProcessed: step.fields?.length || 0
      };

      setExecutionResults(prev => [...prev, result]);
      message.success(`Step ${i + 1}: ${step.table} configured`);
    }

    setCurrentStep(workflow.steps.length);
    setExecuting(false);
    message.success('Workflow execution completed!');
  };

  const getStepStatus = (index: number) => {
    if (executing) {
      if (index < currentStep) return 'finish';
      if (index === currentStep) return 'process';
      return 'wait';
    }
    if (executionResults.length > 0) {
      if (index < executionResults.length) return 'finish';
    }
    return 'wait';
  };

  return (
    <div className="workflow-visualization">
      <style>{`
        .workflow-visualization {
          padding: 16px 0;
        }
        .workflow-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }
        .workflow-steps {
          margin: 24px 0;
        }
        .step-details {
          margin-top: 24px;
        }
        .field-tag {
          margin: 4px;
        }
        .execution-timeline {
          margin-top: 24px;
          max-height: 400px;
          overflow-y: auto;
        }
        .workflow-diagram {
          margin: 24px 0;
          padding: 24px;
          background: ${darkMode ? '#262626' : '#fafafa'};
          border-radius: 8px;
        }
        .workflow-node {
          display: inline-block;
          padding: 12px 24px;
          background: ${darkMode ? '#1f1f1f' : '#fff'};
          border: 2px solid #1890ff;
          border-radius: 8px;
          margin: 0 8px;
        }
        .workflow-arrow {
          display: inline-block;
          margin: 0 16px;
          color: #8c8c8c;
          font-size: 20px;
        }
      `}</style>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin tip="Loading workflow..." />
        </div>
      ) : workflow ? (
        <>
          <div className="workflow-header">
            <div>
              <h3>
                <ApiOutlined /> {workflow.name}
              </h3>
              <p style={{ margin: 0, color: '#8c8c8c' }}>
                {workflow.steps?.length || 0} steps · {workflow.triggers?.length || 0} triggers
              </p>
            </div>
            <Button
              type="primary"
              size="large"
              icon={<PlayCircleOutlined />}
              onClick={handleExecuteWorkflow}
              loading={executing}
              disabled={!workflow.steps || workflow.steps.length === 0}
            >
              Execute Workflow
            </Button>
          </div>

          <Card title="Workflow Diagram" className="workflow-diagram">
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              {workflow.steps?.map((step: any, index: number) => (
                <React.Fragment key={step.id}>
                  {index > 0 && <span className="workflow-arrow">→</span>}
                  <div className="workflow-node">
                    <div style={{ fontSize: '16px', fontWeight: 500 }}>
                      {step.table}
                    </div>
                    <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
                      {step.action}
                    </div>
                    <Tag color="blue" style={{ marginTop: 8 }}>
                      {step.fields?.length || 0} fields
                    </Tag>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </Card>

          <Card title="Workflow Steps" className="workflow-steps">
            <Steps current={currentStep} direction="vertical">
              {workflow.steps?.map((step: any, index: number) => (
                <Step
                  key={step.id}
                  title={`Step ${index + 1}: ${step.table}`}
                  description={
                    <div>
                      <p>Action: <Tag>{step.action}</Tag></p>
                      <p>Fields to configure: {step.fields?.length || 0}</p>
                      {executionResults[index] && (
                        <Tag color="green" icon={<CheckCircleOutlined />}>
                          Completed at {new Date(executionResults[index].timestamp).toLocaleTimeString()}
                        </Tag>
                      )}
                    </div>
                  }
                  status={getStepStatus(index)}
                  icon={
                    getStepStatus(index) === 'process' ? (
                      <LoadingOutlined />
                    ) : getStepStatus(index) === 'finish' ? (
                      <CheckCircleOutlined />
                    ) : (
                      <ClockCircleOutlined />
                    )
                  }
                />
              ))}
            </Steps>
          </Card>

          {workflow.steps && workflow.steps.length > 0 && (
            <Card title="Step Details" className="step-details">
              {workflow.steps.map((step: any, index: number) => (
                <Card
                  key={step.id}
                  type="inner"
                  title={`${step.table} Configuration`}
                  extra={<Tag color="blue">Step {index + 1}</Tag>}
                  style={{ marginBottom: 16 }}
                >
                  <Descriptions column={2} bordered size="small">
                    <Descriptions.Item label="Table">{step.table}</Descriptions.Item>
                    <Descriptions.Item label="Action">{step.action}</Descriptions.Item>
                    <Descriptions.Item label="Fields Count" span={2}>
                      {step.fields?.length || 0}
                    </Descriptions.Item>
                  </Descriptions>
                  <div style={{ marginTop: 12 }}>
                    <strong>Fields to configure:</strong>
                    <div style={{ marginTop: 8 }}>
                      {step.fields?.map((field: string) => (
                        <Tag key={field} className="field-tag" color="cyan">
                          {field}
                        </Tag>
                      ))}
                    </div>
                  </div>
                </Card>
              ))}
            </Card>
          )}

          {workflow.triggers && workflow.triggers.length > 0 && (
            <Card title="Workflow Triggers" style={{ marginTop: 16 }}>
              {workflow.triggers.map((trigger: any, index: number) => (
                <Tag key={index} color="purple" style={{ margin: '4px', padding: '4px 12px' }}>
                  <ApiOutlined /> {trigger.type}: {trigger.description}
                </Tag>
              ))}
            </Card>
          )}

          {executionResults.length > 0 && (
            <Card title="Execution Timeline" className="execution-timeline">
              <Timeline>
                {executionResults.map((result, index) => (
                  <Timeline.Item
                    key={result.stepId}
                    color="green"
                    dot={<CheckCircleOutlined />}
                  >
                    <p><strong>Step {index + 1} Completed</strong></p>
                    <p style={{ color: '#8c8c8c', margin: 0 }}>
                      {new Date(result.timestamp).toLocaleString()} · {result.fieldsProcessed} fields processed
                    </p>
                  </Timeline.Item>
                ))}
              </Timeline>
            </Card>
          )}
        </>
      ) : (
        <Empty description="No workflow available for this feature" />
      )}
    </div>
  );
};

export default WorkflowVisualization;
