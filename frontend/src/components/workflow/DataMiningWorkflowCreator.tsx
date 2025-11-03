/**
 * DataMiningWorkflowCreator Component
 * 
 * UI component for creating datamining workflows from natural language prompts.
 * Shows real-time workflow stage progression and generated schemas.
 */

import React, { useState } from 'react';
import {
  Modal,
  Input,
  Button,
  Steps,
  Card,
  Tag,
  Space,
  Typography,
  Spin,
  Alert,
  Descriptions,
  Collapse,
  message
} from 'antd';
import {
  RobotOutlined,
  FileSearchOutlined,
  CodeOutlined,
  ThunderboltOutlined,
  DatabaseOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  LoadingOutlined
} from '@ant-design/icons';
import DataMiningWorkflowService, {
  DataMiningWorkflow,
  WorkflowStage
} from '../../services/DataMiningWorkflowService';

const { TextArea } = Input;
const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;

interface DataMiningWorkflowCreatorProps {
  visible: boolean;
  onClose: () => void;
  onWorkflowCreated?: (workflow: DataMiningWorkflow) => void;
}

const DataMiningWorkflowCreator: React.FC<DataMiningWorkflowCreatorProps> = ({
  visible,
  onClose,
  onWorkflowCreated
}) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentStage, setCurrentStage] = useState<WorkflowStage | null>(null);
  const [workflow, setWorkflow] = useState<DataMiningWorkflow | null>(null);
  const [error, setError] = useState<string | null>(null);

  const service = new DataMiningWorkflowService();

  // Stage configuration
  const stages = [
    {
      key: WorkflowStage.INITIALIZING,
      title: 'Initializing',
      icon: <LoadingOutlined />
    },
    {
      key: WorkflowStage.PROMPT_ANALYSIS,
      title: 'Analyzing Prompt',
      icon: <RobotOutlined />
    },
    {
      key: WorkflowStage.SCHEMA_GENERATION,
      title: 'Generating Schema',
      icon: <CodeOutlined />
    },
    {
      key: WorkflowStage.WORKFLOW_CREATION,
      title: 'Creating Workflow',
      icon: <FileSearchOutlined />
    },
    {
      key: WorkflowStage.DATAMINING_SETUP,
      title: 'Setup Complete',
      icon: <CheckCircleOutlined />
    }
  ];

  const getCurrentStageIndex = () => {
    if (!currentStage) return 0;
    return stages.findIndex(s => s.key === currentStage);
  };

  const handleCreate = async () => {
    if (!prompt.trim()) {
      message.error('Please enter a datamining prompt');
      return;
    }

    setLoading(true);
    setError(null);
    setCurrentStage(WorkflowStage.INITIALIZING);

    try {
      // Simulate stage progression for UI feedback
      const stageDelay = 800;

      // Stage 1: Initializing
      await new Promise(resolve => setTimeout(resolve, stageDelay));
      setCurrentStage(WorkflowStage.PROMPT_ANALYSIS);

      // Stage 2: Prompt Analysis
      await new Promise(resolve => setTimeout(resolve, stageDelay));
      setCurrentStage(WorkflowStage.SCHEMA_GENERATION);

      // Stage 3: Schema Generation
      await new Promise(resolve => setTimeout(resolve, stageDelay));
      setCurrentStage(WorkflowStage.WORKFLOW_CREATION);

      // Stage 4: Workflow Creation
      await new Promise(resolve => setTimeout(resolve, stageDelay));
      setCurrentStage(WorkflowStage.DATAMINING_SETUP);

      // Create the actual workflow
      const createdWorkflow = await service.createFromPrompt(prompt);
      setWorkflow(createdWorkflow);

      message.success('Datamining workflow created successfully!');

      if (onWorkflowCreated) {
        onWorkflowCreated(createdWorkflow);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create workflow');
      setCurrentStage(WorkflowStage.FAILED);
      message.error('Failed to create datamining workflow');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setPrompt('');
    setLoading(false);
    setCurrentStage(null);
    setWorkflow(null);
    setError(null);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  return (
    <Modal
      title={
        <Space>
          <DatabaseOutlined style={{ color: '#1890ff' }} />
          <span>Create DataMining Workflow from Prompt</span>
        </Space>
      }
      open={visible}
      onCancel={handleClose}
      width={900}
      footer={null}
      destroyOnClose
    >
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        {/* Prompt Input */}
        <Card>
          <Title level={5}>
            <RobotOutlined /> Describe what you want to mine
          </Title>
          <Paragraph type="secondary">
            Use natural language to describe your datamining needs. For example:
            "Scrape product prices from https://example.com" or "Extract article
            titles and dates from tech blogs"
          </Paragraph>
          <TextArea
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            placeholder="Example: Extract job titles, companies, and locations from https://jobs.example.com daily"
            rows={4}
            disabled={loading}
            style={{ marginBottom: 16 }}
          />
          <Space>
            <Button
              type="primary"
              icon={<ThunderboltOutlined />}
              onClick={handleCreate}
              loading={loading}
              disabled={!prompt.trim() || loading}
            >
              Generate Workflow
            </Button>
            {workflow && (
              <Button onClick={handleReset}>Create Another</Button>
            )}
          </Space>
        </Card>

        {/* Stage Progress */}
        {currentStage && (
          <Card>
            <Title level={5}>Workflow Creation Progress</Title>
            <Steps
              current={getCurrentStageIndex()}
              status={
                currentStage === WorkflowStage.FAILED
                  ? 'error'
                  : loading
                  ? 'process'
                  : 'finish'
              }
              items={stages.map(stage => ({
                title: stage.title,
                icon: stage.icon
              }))}
            />
          </Card>
        )}

        {/* Error Display */}
        {error && (
          <Alert
            message="Workflow Creation Failed"
            description={error}
            type="error"
            showIcon
            icon={<CloseCircleOutlined />}
          />
        )}

        {/* Generated Workflow Details */}
        {workflow && !loading && (
          <Card>
            <Title level={5}>
              <CheckCircleOutlined style={{ color: '#52c41a' }} /> Workflow
              Created Successfully
            </Title>

            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="Name">{workflow.name}</Descriptions.Item>
              <Descriptions.Item label="ID">
                <Text code>{workflow['@id']}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Description">
                {workflow.description}
              </Descriptions.Item>
              <Descriptions.Item label="Stage">
                <Tag color="green">{workflow.stage}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Tasks">
                {workflow.tasks.length} task(s)
              </Descriptions.Item>
              <Descriptions.Item label="Monitoring">
                {workflow.monitoring.enabled ? (
                  <Tag color="blue">Enabled</Tag>
                ) : (
                  <Tag>Disabled</Tag>
                )}
              </Descriptions.Item>
            </Descriptions>

            {/* Tasks Detail */}
            <div style={{ marginTop: 16 }}>
              <Title level={5}>Datamining Tasks</Title>
              <Collapse>
                {workflow.tasks.map((task, index) => (
                  <Panel
                    header={
                      <Space>
                        <Tag color="blue">Task {index + 1}</Tag>
                        <Text strong>{task.name}</Text>
                      </Space>
                    }
                    key={task['@id']}
                  >
                    <Descriptions column={1} size="small">
                      <Descriptions.Item label="Description">
                        {task.description}
                      </Descriptions.Item>
                      <Descriptions.Item label="Source Type">
                        <Tag>{task.source.type}</Tag>
                      </Descriptions.Item>
                      {task.source.url && (
                        <Descriptions.Item label="URL">
                          <a
                            href={task.source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {task.source.url}
                          </a>
                        </Descriptions.Item>
                      )}
                      <Descriptions.Item label="Fields to Extract">
                        <Space wrap>
                          {task.extraction.fields.map(field => (
                            <Tag key={field.name} color="cyan">
                              {field.name} ({field.type})
                            </Tag>
                          ))}
                        </Space>
                      </Descriptions.Item>
                      <Descriptions.Item label="Storage">
                        {task.storage.type} - {task.storage.table || task.storage.path}
                      </Descriptions.Item>
                    </Descriptions>
                  </Panel>
                ))}
              </Collapse>
            </div>

            {/* Schema Preview */}
            <div style={{ marginTop: 16 }}>
              <Title level={5}>
                <CodeOutlined /> Generated Schema (JSON-LD)
              </Title>
              <pre
                style={{
                  background: '#f5f5f5',
                  padding: 16,
                  borderRadius: 4,
                  maxHeight: 300,
                  overflow: 'auto'
                }}
              >
                {JSON.stringify(workflow, null, 2)}
              </pre>
            </div>
          </Card>
        )}

        {/* Loading Indicator */}
        {loading && (
          <Card>
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <Spin size="large" />
              <div style={{ marginTop: 16 }}>
                <Text type="secondary">
                  {currentStage === WorkflowStage.PROMPT_ANALYSIS &&
                    'Analyzing your prompt...'}
                  {currentStage === WorkflowStage.SCHEMA_GENERATION &&
                    'Generating data schema...'}
                  {currentStage === WorkflowStage.WORKFLOW_CREATION &&
                    'Creating workflow tasks...'}
                  {currentStage === WorkflowStage.DATAMINING_SETUP &&
                    'Setting up datamining configuration...'}
                </Text>
              </div>
            </div>
          </Card>
        )}
      </Space>
    </Modal>
  );
};

export default DataMiningWorkflowCreator;
