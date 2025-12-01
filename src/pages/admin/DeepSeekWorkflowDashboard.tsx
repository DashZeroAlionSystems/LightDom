/**
 * DeepSeek Workflow Management Dashboard
 * Allows admins and DeepSeek to view, execute, and manage workflows
 * Created: 2025-11-06
 */

import React, { useState, useEffect } from 'react';
import {
  Card,
  Tabs,
  Button,
  Steps,
  Descriptions,
  Tag,
  Space,
  List,
  Progress,
  message,
  Modal,
  Input,
  Select,
  Row,
  Col,
  Statistic,
  Timeline
} from 'antd';
import {
  PlayCircleOutlined,
  PauseCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined,
  RocketOutlined,
  UserAddOutlined,
  UserOutlined,
  BarChartOutlined
} from '@ant-design/icons';
import DeepSeekUserWorkflowService from '../../services/DeepSeekUserWorkflowService';

const { TabPane } = Tabs;
const { TextArea } = Input;
const { Option } = Select;
const { Step } = Steps;

interface WorkflowExecution {
  workflowId: string;
  currentStage: number;
  data: Record<string, any>;
  status: 'running' | 'paused' | 'completed' | 'failed';
  errors: string[];
}

const DeepSeekWorkflowDashboard: React.FC = () => {
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<any>(null);
  const [execution, setExecution] = useState<WorkflowExecution | null>(null);
  const [stageData, setStageData] = useState<Record<string, any>>({});

  useEffect(() => {
    loadWorkflows();
  }, []);

  const loadWorkflows = () => {
    const allWorkflows = DeepSeekUserWorkflowService.getAllWorkflows();
    setWorkflows(allWorkflows);
  };

  const startWorkflow = (workflowId: string) => {
    const workflow = DeepSeekUserWorkflowService.getWorkflowById(workflowId);
    if (workflow) {
      setSelectedWorkflow(workflow);
      setExecution({
        workflowId,
        currentStage: 0,
        data: {},
        status: 'running',
        errors: []
      });
      setStageData({});
    }
  };

  const executeStage = async () => {
    if (!selectedWorkflow || !execution) return;

    const stage = selectedWorkflow.stages[execution.currentStage];
    if (!stage) return;

    try {
      const result = await DeepSeekUserWorkflowService.executeStage(
        execution.workflowId,
        stage.id,
        stageData
      );

      if (result.success) {
        message.success(`Stage "${stage.name}" completed successfully`);
        
        // Move to next stage
        const nextStageIndex = execution.currentStage + 1;
        if (nextStageIndex < selectedWorkflow.stages.length) {
          setExecution({
            ...execution,
            currentStage: nextStageIndex,
            data: { ...execution.data, ...result.data }
          });
        } else {
          setExecution({
            ...execution,
            status: 'completed',
            data: { ...execution.data, ...result.data }
          });
          message.success('Workflow completed successfully!');
        }
      } else {
        setExecution({
          ...execution,
          status: 'failed',
          errors: result.errors
        });
        message.error(`Stage failed: ${result.errors.join(', ')}`);
      }
    } catch (error: any) {
      message.error(`Error executing stage: ${error.message}`);
      setExecution({
        ...execution,
        status: 'failed',
        errors: [error.message]
      });
    }
  };

  const renderWorkflowList = () => (
    <List
      dataSource={workflows}
      renderItem={(workflow) => (
        <List.Item
          actions={[
            <Button
              type="primary"
              icon={<PlayCircleOutlined />}
              onClick={() => startWorkflow(workflow.id)}
            >
              Start Workflow
            </Button>
          ]}
        >
          <List.Item.Meta
            avatar={
              workflow.id.includes('create') ? <UserAddOutlined style={{ fontSize: 24 }} /> :
              workflow.id.includes('update') ? <UserOutlined style={{ fontSize: 24 }} /> :
              <BarChartOutlined style={{ fontSize: 24 }} />
            }
            title={workflow.name}
            description={workflow.description}
          />
          <div>
            <Tag color="blue">{workflow.stages.length} stages</Tag>
            <Tag color="green">{workflow.permissions.length} permissions required</Tag>
          </div>
        </List.Item>
      )}
    />
  );

  const renderWorkflowExecution = () => {
    if (!selectedWorkflow || !execution) return null;

    const currentStage = selectedWorkflow.stages[execution.currentStage];

    return (
      <div>
        {/* Progress Steps */}
        <Card title="Workflow Progress" style={{ marginBottom: 24 }}>
          <Steps current={execution.currentStage} status={execution.status === 'failed' ? 'error' : undefined}>
            {selectedWorkflow.stages.map((stage: any, index: number) => (
              <Step
                key={stage.id}
                title={stage.name}
                description={index < execution.currentStage ? 'Completed' : index === execution.currentStage ? 'In Progress' : 'Pending'}
                icon={
                  index < execution.currentStage ? <CheckCircleOutlined /> :
                  index === execution.currentStage ? <PlayCircleOutlined /> :
                  <InfoCircleOutlined />
                }
              />
            ))}
          </Steps>
        </Card>

        {/* Current Stage Details */}
        {execution.status === 'running' && currentStage && (
          <Card title={`Current Stage: ${currentStage.name}`} style={{ marginBottom: 24 }}>
            <Descriptions column={1} bordered>
              <Descriptions.Item label="Description">
                {currentStage.description}
              </Descriptions.Item>
              <Descriptions.Item label="Actions">
                <ul>
                  {currentStage.actions.map((action: string, idx: number) => (
                    <li key={idx}>{action}</li>
                  ))}
                </ul>
              </Descriptions.Item>
            </Descriptions>

            {/* Required Data Inputs */}
            <Card title="Required Information" type="inner" style={{ marginTop: 16 }}>
              {currentStage.requiredData.map((field: string) => (
                <div key={field} style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>
                    {field.replace(/_/g, ' ').toUpperCase()} *
                  </label>
                  <Input
                    placeholder={`Enter ${field}`}
                    value={stageData[field] || ''}
                    onChange={(e) => setStageData({ ...stageData, [field]: e.target.value })}
                  />
                </div>
              ))}
            </Card>

            {/* Optional Data Inputs */}
            {currentStage.optionalData.length > 0 && (
              <Card title="Optional Information" type="inner" style={{ marginTop: 16 }}>
                {currentStage.optionalData.map((field: string) => (
                  <div key={field} style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', marginBottom: 8 }}>
                      {field.replace(/_/g, ' ').toUpperCase()}
                    </label>
                    <Input
                      placeholder={`Enter ${field} (optional)`}
                      value={stageData[field] || ''}
                      onChange={(e) => setStageData({ ...stageData, [field]: e.target.value })}
                    />
                  </div>
                ))}
              </Card>
            )}

            {/* Execute Stage Button */}
            <div style={{ marginTop: 24, textAlign: 'center' }}>
              <Button
                type="primary"
                size="large"
                icon={<RocketOutlined />}
                onClick={executeStage}
              >
                Execute Stage
              </Button>
            </div>
          </Card>
        )}

        {/* Completion or Error Display */}
        {execution.status === 'completed' && (
          <Card>
            <Result
              status="success"
              title="Workflow Completed Successfully!"
              subTitle={`All ${selectedWorkflow.stages.length} stages completed`}
              extra={[
                <Button type="primary" key="new" onClick={() => setExecution(null)}>
                  Start New Workflow
                </Button>
              ]}
            />
          </Card>
        )}

        {execution.status === 'failed' && (
          <Card>
            <Result
              status="error"
              title="Workflow Failed"
              subTitle="Please review the errors below"
              extra={[
                <Button type="primary" key="retry" onClick={() => setExecution({ ...execution, status: 'running', errors: [] })}>
                  Retry Stage
                </Button>,
                <Button key="cancel" onClick={() => setExecution(null)}>
                  Cancel Workflow
                </Button>
              ]}
            >
              <div style={{ textAlign: 'left' }}>
                <h4>Errors:</h4>
                <ul>
                  {execution.errors.map((error, idx) => (
                    <li key={idx} style={{ color: 'red' }}>{error}</li>
                  ))}
                </ul>
              </div>
            </Result>
          </Card>
        )}

        {/* Execution Data Display */}
        <Card title="Workflow Data" style={{ marginTop: 24 }}>
          <pre style={{ background: '#f5f5f5', padding: 16, borderRadius: 4, overflow: 'auto' }}>
            {JSON.stringify(execution.data, null, 2)}
          </pre>
        </Card>
      </div>
    );
  };

  return (
    <div style={{ padding: 24 }}>
      <Card title="DeepSeek Workflow Management" extra={<Tag color="purple">AI Automation</Tag>}>
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={8}>
            <Statistic
              title="Available Workflows"
              value={workflows.length}
              prefix={<RocketOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Col>
          <Col span={8}>
            <Statistic
              title="Currently Running"
              value={execution?.status === 'running' ? 1 : 0}
              prefix={<PlayCircleOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Col>
          <Col span={8}>
            <Statistic
              title="Completion Rate"
              value={95}
              suffix="%"
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Col>
        </Row>

        <Tabs defaultActiveKey="workflows">
          <TabPane tab="Available Workflows" key="workflows">
            {!execution && renderWorkflowList()}
            {execution && (
              <Button onClick={() => setExecution(null)} style={{ marginBottom: 16 }}>
                ← Back to Workflow List
              </Button>
            )}
          </TabPane>
          
          <TabPane tab="Workflow Execution" key="execution" disabled={!execution}>
            {renderWorkflowExecution()}
          </TabPane>

          <TabPane tab="Workflow Guide" key="guide">
            <Card>
              <Timeline>
                <Timeline.Item color="green">
                  <h4>Step 1: Select a Workflow</h4>
                  <p>Choose from available workflows based on your task (create user, update user, analyze user)</p>
                </Timeline.Item>
                <Timeline.Item color="blue">
                  <h4>Step 2: Provide Required Information</h4>
                  <p>Each stage will ask for specific information needed to proceed</p>
                </Timeline.Item>
                <Timeline.Item color="purple">
                  <h4>Step 3: Execute Stages</h4>
                  <p>Click "Execute Stage" to process each step of the workflow</p>
                </Timeline.Item>
                <Timeline.Item color="orange">
                  <h4>Step 4: Review Results</h4>
                  <p>After completion, review the workflow data and outcomes</p>
                </Timeline.Item>
              </Timeline>

              <Card title="Workflow Information Needs" type="inner" style={{ marginTop: 24 }}>
                <h4>What Information Does DeepSeek Need at Each Stage?</h4>
                <p>Each workflow is designed to guide you through the required information:</p>
                <ul>
                  <li><strong>Create User:</strong> Email, username, role, plan, and optional profile details</li>
                  <li><strong>Update User:</strong> User identifier, update type (profile/role/plan), and new values</li>
                  <li><strong>Analyze User:</strong> User identifier to retrieve and analyze data</li>
                </ul>
                <p>The workflow system validates all inputs and provides clear error messages if information is missing or invalid.</p>
              </Card>
            </Card>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

// Result component if not already imported from antd
const Result: React.FC<{ status: string; title: string; subTitle: string; extra?: React.ReactNode; children?: React.ReactNode }> = ({
  status,
  title,
  subTitle,
  extra,
  children
}) => (
  <div style={{ textAlign: 'center', padding: '48px 32px' }}>
    {status === 'success' && <CheckCircleOutlined style={{ fontSize: 72, color: '#52c41a', marginBottom: 24 }} />}
    {status === 'error' && <CloseCircleOutlined style={{ fontSize: 72, color: '#ff4d4f', marginBottom: 24 }} />}
    <h2>{title}</h2>
    <p style={{ color: '#666', marginBottom: 24 }}>{subTitle}</p>
    {children}
    {extra && <div style={{ marginTop: 24 }}>{extra}</div>}
  </div>
);

export default DeepSeekWorkflowDashboard;
