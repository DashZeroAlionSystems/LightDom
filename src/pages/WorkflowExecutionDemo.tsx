/**
 * Workflow Execution Demo
 * 
 * Interactive visualization of automated workflows with:
 * - Real-time execution tracking
 * - Memory-driven optimizations
 * - Multiple workflow types
 * - Step-by-step progress
 */

import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Typography, Steps, Tag, Progress, Space, Timeline, Alert } from 'antd';
import {
  PlayCircleOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  ClockCircleOutlined,
  RocketOutlined,
  DatabaseOutlined,
  BarChartOutlined,
  FileTextOutlined,
  ThunderboltOutlined,
  ApiOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;

interface WorkflowStep {
  name: string;
  status: 'wait' | 'process' | 'finish' | 'error';
  duration?: number;
  details?: string;
}

interface WorkflowExecution {
  id: string;
  name: string;
  type: string;
  status: 'idle' | 'running' | 'completed' | 'error';
  progress: number;
  steps: WorkflowStep[];
  startTime?: number;
  endTime?: number;
  memoryOptimization: boolean;
  icon: React.ReactNode;
  color: string;
}

const workflows: WorkflowExecution[] = [
  {
    id: 'content-gen',
    name: 'Content Generation',
    type: 'content_generation',
    status: 'idle',
    progress: 0,
    memoryOptimization: true,
    icon: <FileTextOutlined />,
    color: '#3b82f6',
    steps: [
      { name: 'Initialize Context', status: 'wait' },
      { name: 'Fetch Memory Data', status: 'wait' },
      { name: 'Generate Content', status: 'wait' },
      { name: 'Apply Optimizations', status: 'wait' },
      { name: 'Validate Output', status: 'wait' }
    ]
  },
  {
    id: 'data-sync',
    name: 'Data Synchronization',
    type: 'data_sync',
    status: 'idle',
    progress: 0,
    memoryOptimization: true,
    icon: <DatabaseOutlined />,
    color: '#10b981',
    steps: [
      { name: 'Connect to Source', status: 'wait' },
      { name: 'Load Memory Cache', status: 'wait' },
      { name: 'Sync Data', status: 'wait' },
      { name: 'Resolve Conflicts', status: 'wait' },
      { name: 'Commit Changes', status: 'wait' }
    ]
  },
  {
    id: 'analytics',
    name: 'Analytics Processing',
    type: 'analytics',
    status: 'idle',
    progress: 0,
    memoryOptimization: true,
    icon: <BarChartOutlined />,
    color: '#8b5cf6',
    steps: [
      { name: 'Collect Metrics', status: 'wait' },
      { name: 'Apply Memory Patterns', status: 'wait' },
      { name: 'Process Analytics', status: 'wait' },
      { name: 'Detect Anomalies', status: 'wait' },
      { name: 'Generate Report', status: 'wait' }
    ]
  }
];

const WorkflowExecutionDemo: React.FC = () => {
  const [executions, setExecutions] = useState<WorkflowExecution[]>(workflows);
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalExecutions: 0,
    successfulExecutions: 0,
    avgDuration: 0,
    memoryOptimizationGain: 0
  });

  const executeWorkflow = (workflowId: string) => {
    setSelectedWorkflow(workflowId);
    
    setExecutions(prev => prev.map(wf => 
      wf.id === workflowId 
        ? { ...wf, status: 'running', progress: 0, startTime: Date.now() }
        : wf
    ));

    // Simulate workflow execution
    let currentStep = 0;
    const interval = setInterval(() => {
      setExecutions(prev => prev.map(wf => {
        if (wf.id !== workflowId) return wf;

        const newProgress = Math.min(wf.progress + 20, 100);
        const newSteps = wf.steps.map((step, idx) => {
          if (idx < currentStep) return { ...step, status: 'finish' as const };
          if (idx === currentStep) return { ...step, status: 'process' as const };
          return step;
        });

        if (newProgress >= 100) {
          clearInterval(interval);
          
          const duration = Date.now() - (wf.startTime || Date.now());
          
          setStats(prev => ({
            totalExecutions: prev.totalExecutions + 1,
            successfulExecutions: prev.successfulExecutions + 1,
            avgDuration: (prev.avgDuration * prev.totalExecutions + duration) / (prev.totalExecutions + 1),
            memoryOptimizationGain: Math.min(prev.memoryOptimizationGain + 5, 45)
          }));

          return {
            ...wf,
            status: 'completed',
            progress: 100,
            endTime: Date.now(),
            steps: newSteps.map(s => ({ ...s, status: 'finish' as const }))
          };
        }

        currentStep++;
        return {
          ...wf,
          progress: newProgress,
          steps: newSteps
        };
      }));
    }, 800);
  };

  const resetWorkflow = (workflowId: string) => {
    setExecutions(prev => prev.map(wf =>
      wf.id === workflowId
        ? {
            ...wf,
            status: 'idle',
            progress: 0,
            startTime: undefined,
            endTime: undefined,
            steps: wf.steps.map(s => ({ ...s, status: 'wait' as const }))
          }
        : wf
    ));
  };

  const getStatusTag = (status: WorkflowExecution['status']) => {
    const configs = {
      idle: { color: 'default', text: 'Idle', icon: <ClockCircleOutlined /> },
      running: { color: 'processing', text: 'Running', icon: <SyncOutlined spin /> },
      completed: { color: 'success', text: 'Completed', icon: <CheckCircleOutlined /> },
      error: { color: 'error', text: 'Error', icon: null }
    };
    const config = configs[status];
    return (
      <Tag color={config.color} icon={config.icon}>
        {config.text}
      </Tag>
    );
  };

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Title level={1} className="!text-white mb-4">
            <ApiOutlined className="mr-3" />
            Workflow Execution Demo
          </Title>
          <Paragraph className="text-slate-300 text-lg">
            Memory-driven workflow automation with real-time execution tracking
          </Paragraph>
        </div>

        {/* Statistics */}
        <Row gutter={16} className="mb-6">
          <Col span={6}>
            <Card className="bg-slate-800 border-slate-700 text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">{stats.totalExecutions}</div>
              <Text className="text-slate-400">Total Executions</Text>
            </Card>
          </Col>
          <Col span={6}>
            <Card className="bg-slate-800 border-slate-700 text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">{stats.successfulExecutions}</div>
              <Text className="text-slate-400">Successful</Text>
            </Card>
          </Col>
          <Col span={6}>
            <Card className="bg-slate-800 border-slate-700 text-center">
              <div className="text-3xl font-bold text-purple-400 mb-2">
                {Math.round(stats.avgDuration / 1000)}s
              </div>
              <Text className="text-slate-400">Avg Duration</Text>
            </Card>
          </Col>
          <Col span={6}>
            <Card className="bg-slate-800 border-slate-700 text-center">
              <div className="text-3xl font-bold text-yellow-400 mb-2">{stats.memoryOptimizationGain}%</div>
              <Text className="text-slate-400">Memory Optimization</Text>
            </Card>
          </Col>
        </Row>

        {/* Workflow Cards */}
        <Row gutter={16} className="mb-6">
          {executions.map(workflow => (
            <Col key={workflow.id} span={8}>
              <Card
                className="bg-slate-800 border-slate-700"
                style={{ borderTopColor: workflow.color, borderTopWidth: 4 }}
                title={
                  <div className="flex items-center justify-between">
                    <Space>
                      <span style={{ color: workflow.color, fontSize: '20px' }}>
                        {workflow.icon}
                      </span>
                      <span className="text-white">{workflow.name}</span>
                    </Space>
                    {getStatusTag(workflow.status)}
                  </div>
                }
              >
                <div className="mb-4">
                  <Text className="text-slate-400 text-sm">Progress</Text>
                  <Progress
                    percent={workflow.progress}
                    status={workflow.status === 'running' ? 'active' : workflow.status === 'completed' ? 'success' : undefined}
                    strokeColor={workflow.color}
                  />
                </div>

                <div className="mb-4">
                  <Timeline
                    items={workflow.steps.map(step => ({
                      color: step.status === 'finish' ? 'green' : step.status === 'process' ? 'blue' : 'gray',
                      dot: step.status === 'process' ? <SyncOutlined spin /> : undefined,
                      children: (
                        <Text className={step.status === 'wait' ? 'text-slate-500' : 'text-slate-300'}>
                          {step.name}
                        </Text>
                      )
                    }))}
                  />
                </div>

                <Space className="w-full justify-between">
                  <Button
                    type="primary"
                    icon={<PlayCircleOutlined />}
                    onClick={() => executeWorkflow(workflow.id)}
                    disabled={workflow.status === 'running'}
                    style={{ backgroundColor: workflow.color, borderColor: workflow.color }}
                  >
                    Execute
                  </Button>
                  {workflow.status === 'completed' && (
                    <Button
                      onClick={() => resetWorkflow(workflow.id)}
                      className="bg-slate-700 text-white border-slate-600"
                    >
                      Reset
                    </Button>
                  )}
                </Space>

                {workflow.memoryOptimization && (
                  <div className="mt-3">
                    <Tag color="purple" icon={<ThunderboltOutlined />}>
                      Memory Optimization Enabled
                    </Tag>
                  </div>
                )}
              </Card>
            </Col>
          ))}
        </Row>

        {/* Selected Workflow Details */}
        {selectedWorkflow && (
          <Card className="bg-slate-800 border-slate-700 mb-6" title={
            <span className="text-white flex items-center gap-2">
              <RocketOutlined />
              Workflow Execution Details
            </span>
          }>
            {(() => {
              const workflow = executions.find(w => w.id === selectedWorkflow);
              if (!workflow) return null;

              return (
                <div>
                  <Row gutter={16}>
                    <Col span={24}>
                      <Steps
                        current={workflow.steps.findIndex(s => s.status === 'process')}
                        items={workflow.steps.map(step => ({
                          title: step.name,
                          status: step.status === 'finish' ? 'finish' : step.status === 'process' ? 'process' : 'wait'
                        }))}
                      />
                    </Col>
                  </Row>

                  <div className="mt-6">
                    <Row gutter={16}>
                      <Col span={8}>
                        <Text className="text-slate-400">Workflow Type:</Text>
                        <div className="text-white font-semibold">{workflow.type}</div>
                      </Col>
                      <Col span={8}>
                        <Text className="text-slate-400">Status:</Text>
                        <div className="mt-1">{getStatusTag(workflow.status)}</div>
                      </Col>
                      <Col span={8}>
                        <Text className="text-slate-400">Memory Optimization:</Text>
                        <div className="text-white font-semibold">
                          {workflow.memoryOptimization ? 'Enabled' : 'Disabled'}
                        </div>
                      </Col>
                    </Row>
                  </div>
                </div>
              );
            })()}
          </Card>
        )}

        {/* Info */}
        <Alert
          message="Memory-Driven Workflow Optimization"
          description={
            <div>
              <Paragraph className="mb-2">
                This demo showcases automated workflow execution with memory-driven optimizations:
              </Paragraph>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Content Generation:</strong> AI-powered content creation with context awareness</li>
                <li><strong>Data Synchronization:</strong> Incremental sync with conflict resolution</li>
                <li><strong>Analytics Processing:</strong> Real-time metrics with anomaly detection</li>
                <li><strong>Memory Optimization:</strong> Up to 45% performance improvement with cached patterns</li>
              </ul>
            </div>
          }
          type="info"
          className="bg-blue-900 border-blue-700"
        />
      </div>
    </div>
  );
};

export default WorkflowExecutionDemo;
