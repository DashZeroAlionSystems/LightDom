/**
 * Automation Orchestration Dashboard
 * UI for managing and monitoring automation workflows
 */

import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Select,
  Table,
  Badge,
  Progress,
  Space,
  Modal,
  InputNumber,
  Statistic,
  Row,
  Col,
  Alert,
  Tabs,
  Tag,
  Descriptions,
  notification
} from 'antd';
import {
  PlayCircleOutlined,
  StopOutlined,
  ReloadOutlined,
  RocketOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  ApiOutlined
} from '@ant-design/icons';
import axios from 'axios';

const { Option } = Select;
const { TabPane } = Tabs;

interface Workflow {
  workflowId: string;
  name: string;
  description: string;
  timeout: number;
}

interface Job {
  jobId: string;
  workflowId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'stopped';
  startTime?: string;
  endTime?: string;
  progress?: number;
  output?: string;
  error?: string;
}

interface Metrics {
  totalJobs: number;
  activeJobs: number;
  completedJobs: number;
  failedJobs: number;
  successRate: number;
  averageExecutionTime: number;
  workflowStats: Record<string, {
    executions: number;
    successes: number;
    failures: number;
  }>;
}

const API_BASE = 'http://localhost:3001/api';

export const AutomationOrchestrationDashboard: React.FC = () => {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [selectedWorkflow, setSelectedWorkflow] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [autopilotModalVisible, setAutopilotModalVisible] = useState(false);
  const [maxRounds, setMaxRounds] = useState(5);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [workflowsRes, jobsRes, metricsRes] = await Promise.all([
        axios.get(`${API_BASE}/automation/workflows`),
        axios.get(`${API_BASE}/automation/jobs`),
        axios.get(`${API_BASE}/automation/metrics`)
      ]);

      setWorkflows(workflowsRes.data.data);
      setJobs(jobsRes.data.data);
      setMetrics(metricsRes.data.data);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const handleStartWorkflow = async () => {
    if (!selectedWorkflow) {
      notification.warning({
        message: 'No Workflow Selected',
        description: 'Please select a workflow to start'
      });
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE}/automation/workflow/start`, {
        workflowId: selectedWorkflow
      });

      notification.success({
        message: 'Workflow Started',
        description: `Job ID: ${response.data.data.jobId}`
      });

      loadData();
    } catch (error: any) {
      notification.error({
        message: 'Failed to Start Workflow',
        description: error.response?.data?.message || error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStartAutopilot = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE}/automation/autopilot/start`, {
        maxRounds,
        config: {
          complianceCheck: true
        }
      });

      notification.success({
        message: 'Autopilot Started',
        description: `Running ${maxRounds} rounds. Job ID: ${response.data.data.jobId}`
      });

      setAutopilotModalVisible(false);
      loadData();
    } catch (error: any) {
      notification.error({
        message: 'Failed to Start Autopilot',
        description: error.response?.data?.message || error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStopJob = async (jobId: string) => {
    setLoading(true);
    try {
      await axios.post(`${API_BASE}/automation/workflow/stop`, { jobId });

      notification.success({
        message: 'Job Stopped',
        description: `Job ${jobId} has been stopped`
      });

      loadData();
    } catch (error: any) {
      notification.error({
        message: 'Failed to Stop Job',
        description: error.response?.data?.message || error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const showJobDetails = (job: Job) => {
    setSelectedJob(job);
    setDetailsModalVisible(true);
  };

  const getStatusBadge = (status: Job['status']) => {
    const colors = {
      pending: 'default',
      running: 'processing',
      completed: 'success',
      failed: 'error',
      stopped: 'warning'
    };

    const icons = {
      pending: <ClockCircleOutlined />,
      running: <ReloadOutlined spin />,
      completed: <CheckCircleOutlined />,
      failed: <CloseCircleOutlined />,
      stopped: <StopOutlined />
    };

    return (
      <Badge
        status={colors[status] as any}
        text={
          <span>
            {icons[status]} {status.toUpperCase()}
          </span>
        }
      />
    );
  };

  const jobColumns = [
    {
      title: 'Job ID',
      dataIndex: 'jobId',
      key: 'jobId',
      render: (text: string) => (
        <span style={{ fontFamily: 'monospace', fontSize: '0.9em' }}>
          {text.substring(0, 8)}...
        </span>
      )
    },
    {
      title: 'Workflow',
      dataIndex: 'workflowId',
      key: 'workflowId',
      render: (text: string) => <Tag color="blue">{text}</Tag>
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: Job['status']) => getStatusBadge(status)
    },
    {
      title: 'Progress',
      dataIndex: 'progress',
      key: 'progress',
      render: (progress: number | undefined) => (
        <Progress
          percent={progress || 0}
          size="small"
          status={progress === 100 ? 'success' : 'active'}
        />
      )
    },
    {
      title: 'Started',
      dataIndex: 'startTime',
      key: 'startTime',
      render: (time: string | undefined) =>
        time ? new Date(time).toLocaleTimeString() : '-'
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Job) => (
        <Space>
          <Button
            size="small"
            onClick={() => showJobDetails(record)}
          >
            Details
          </Button>
          {record.status === 'running' && (
            <Button
              size="small"
              danger
              onClick={() => handleStopJob(record.jobId)}
            >
              Stop
            </Button>
          )}
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <h1>
        <ApiOutlined /> Automation Orchestration
      </h1>

      {/* Metrics Overview */}
      {metrics && (
        <Row gutter={16} style={{ marginBottom: '24px' }}>
          <Col span={6}>
            <Card>
              <Statistic
                title="Total Jobs"
                value={metrics.totalJobs}
                prefix={<PlayCircleOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Active Jobs"
                value={metrics.activeJobs}
                prefix={<ReloadOutlined spin />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Success Rate"
                value={metrics.successRate.toFixed(1)}
                suffix="%"
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Avg. Time"
                value={(metrics.averageExecutionTime / 1000).toFixed(0)}
                suffix="sec"
                prefix={<ClockCircleOutlined />}
              />
            </Card>
          </Col>
        </Row>
      )}

      <Tabs defaultActiveKey="1">
        <TabPane tab="Workflows" key="1">
          <Card
            title="Start Workflow"
            extra={
              <Button
                type="primary"
                icon={<RocketOutlined />}
                onClick={() => setAutopilotModalVisible(true)}
              >
                Start Autopilot
              </Button>
            }
          >
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <Alert
                message="Workflow Execution"
                description="Select a workflow from the list and click Start to begin execution. Monitor progress in the Jobs tab."
                type="info"
                showIcon
              />

              <Space size="large">
                <Select
                  style={{ width: 300 }}
                  placeholder="Select a workflow"
                  value={selectedWorkflow}
                  onChange={setSelectedWorkflow}
                >
                  {workflows.map(wf => (
                    <Option key={wf.workflowId} value={wf.workflowId}>
                      {wf.name}
                    </Option>
                  ))}
                </Select>

                <Button
                  type="primary"
                  icon={<PlayCircleOutlined />}
                  onClick={handleStartWorkflow}
                  loading={loading}
                  disabled={!selectedWorkflow}
                >
                  Start Workflow
                </Button>

                <Button
                  icon={<ReloadOutlined />}
                  onClick={loadData}
                >
                  Refresh
                </Button>
              </Space>

              {selectedWorkflow && (
                <Card size="small" type="inner" title="Workflow Details">
                  {workflows
                    .filter(wf => wf.workflowId === selectedWorkflow)
                    .map(wf => (
                      <Descriptions key={wf.workflowId} column={1}>
                        <Descriptions.Item label="ID">
                          {wf.workflowId}
                        </Descriptions.Item>
                        <Descriptions.Item label="Name">
                          {wf.name}
                        </Descriptions.Item>
                        <Descriptions.Item label="Description">
                          {wf.description}
                        </Descriptions.Item>
                        <Descriptions.Item label="Timeout">
                          {(wf.timeout / 1000 / 60).toFixed(0)} minutes
                        </Descriptions.Item>
                      </Descriptions>
                    ))}
                </Card>
              )}
            </Space>
          </Card>
        </TabPane>

        <TabPane tab="Jobs" key="2">
          <Card
            title={`Active Jobs (${jobs.length})`}
            extra={
              <Button icon={<ReloadOutlined />} onClick={loadData}>
                Refresh
              </Button>
            }
          >
            <Table
              dataSource={jobs}
              columns={jobColumns}
              rowKey="jobId"
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </TabPane>

        <TabPane tab="Metrics" key="3">
          {metrics && (
            <Card title="Workflow Statistics">
              <Space direction="vertical" style={{ width: '100%' }} size="large">
                <Row gutter={16}>
                  <Col span={12}>
                    <Card size="small" title="Overall Statistics">
                      <Descriptions column={1} bordered>
                        <Descriptions.Item label="Total Jobs">
                          {metrics.totalJobs}
                        </Descriptions.Item>
                        <Descriptions.Item label="Completed">
                          {metrics.completedJobs}
                        </Descriptions.Item>
                        <Descriptions.Item label="Failed">
                          {metrics.failedJobs}
                        </Descriptions.Item>
                        <Descriptions.Item label="Success Rate">
                          {metrics.successRate.toFixed(2)}%
                        </Descriptions.Item>
                      </Descriptions>
                    </Card>
                  </Col>

                  <Col span={12}>
                    <Card size="small" title="Per-Workflow Statistics">
                      {Object.entries(metrics.workflowStats).map(
                        ([workflowId, stats]) => (
                          <Card
                            key={workflowId}
                            size="small"
                            type="inner"
                            style={{ marginBottom: '8px' }}
                            title={<Tag color="blue">{workflowId}</Tag>}
                          >
                            <Descriptions column={3} size="small">
                              <Descriptions.Item label="Executions">
                                {stats.executions}
                              </Descriptions.Item>
                              <Descriptions.Item label="Successes">
                                {stats.successes}
                              </Descriptions.Item>
                              <Descriptions.Item label="Failures">
                                {stats.failures}
                              </Descriptions.Item>
                            </Descriptions>
                          </Card>
                        )
                      )}
                    </Card>
                  </Col>
                </Row>
              </Space>
            </Card>
          )}
        </TabPane>
      </Tabs>

      {/* Autopilot Modal */}
      <Modal
        title={
          <span>
            <RocketOutlined /> Start Autopilot
          </span>
        }
        open={autopilotModalVisible}
        onOk={handleStartAutopilot}
        onCancel={() => setAutopilotModalVisible(false)}
        confirmLoading={loading}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <Alert
            message="Autopilot Mode"
            description="Autopilot will automatically run fix rounds until all issues are resolved or maximum rounds are reached."
            type="info"
            showIcon
          />

          <div>
            <label>Maximum Rounds:</label>
            <InputNumber
              min={1}
              max={10}
              value={maxRounds}
              onChange={(value) => setMaxRounds(value || 5)}
              style={{ width: '100%', marginTop: '8px' }}
            />
          </div>
        </Space>
      </Modal>

      {/* Job Details Modal */}
      <Modal
        title="Job Details"
        open={detailsModalVisible}
        onCancel={() => setDetailsModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailsModalVisible(false)}>
            Close
          </Button>
        ]}
        width={800}
      >
        {selectedJob && (
          <Descriptions column={1} bordered>
            <Descriptions.Item label="Job ID">
              <span style={{ fontFamily: 'monospace' }}>
                {selectedJob.jobId}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="Workflow">
              <Tag color="blue">{selectedJob.workflowId}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              {getStatusBadge(selectedJob.status)}
            </Descriptions.Item>
            <Descriptions.Item label="Progress">
              <Progress
                percent={selectedJob.progress || 0}
                status={selectedJob.progress === 100 ? 'success' : 'active'}
              />
            </Descriptions.Item>
            {selectedJob.startTime && (
              <Descriptions.Item label="Started">
                {new Date(selectedJob.startTime).toLocaleString()}
              </Descriptions.Item>
            )}
            {selectedJob.endTime && (
              <Descriptions.Item label="Ended">
                {new Date(selectedJob.endTime).toLocaleString()}
              </Descriptions.Item>
            )}
            {selectedJob.error && (
              <Descriptions.Item label="Error">
                <Alert message={selectedJob.error} type="error" />
              </Descriptions.Item>
            )}
            {selectedJob.output && (
              <Descriptions.Item label="Output">
                <pre
                  style={{
                    background: '#f5f5f5',
                    padding: '12px',
                    borderRadius: '4px',
                    maxHeight: '300px',
                    overflow: 'auto',
                    fontSize: '12px'
                  }}
                >
                  {selectedJob.output}
                </pre>
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default AutomationOrchestrationDashboard;
