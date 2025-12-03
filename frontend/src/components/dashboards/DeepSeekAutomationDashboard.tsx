/**
 * DeepSeek Automation Dashboard
 * Comprehensive AI orchestration, memory system, workflow execution, and CI/CD management
 */

import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Button, Tag, Space, Tabs, message, Modal, Input, Select, Timeline, Form, Spin, Alert, Progress } from 'antd';
import { 
  ThunderboltOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined, 
  SyncOutlined, 
  RocketOutlined,
  BranchesOutlined,
  BugOutlined,
  BulbOutlined,
  ApiOutlined,
  DatabaseOutlined,
  CloudServerOutlined,
  DeploymentUnitOutlined,
  HistoryOutlined
} from '@ant-design/icons';
import { deepseekAutomationAPI } from '@/services/apiService';

const { TabPane } = Tabs;
const { TextArea } = Input;
const { Option } = Select;

const DeepSeekAutomationDashboard: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [systemStatus, setSystemStatus] = useState<any>(null);
  const [health, setHealth] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [activeWorkflows, setActiveWorkflows] = useState<any[]>([]);
  const [recentErrors, setRecentErrors] = useState<any[]>([]);
  const [memoryTasks, setMemoryTasks] = useState<any[]>([]);
  const [memorySolutions, setMemorySolutions] = useState<any>(null);
  const [deploymentStatus, setDeploymentStatus] = useState<any>(null);
  
  // Modal states
  const [workflowModalVisible, setWorkflowModalVisible] = useState(false);
  const [errorAnalysisModalVisible, setErrorAnalysisModalVisible] = useState(false);
  const [deployModalVisible, setDeployModalVisible] = useState(false);
  
  const [workflowForm] = Form.useForm();
  const [errorForm] = Form.useForm();
  const [deployForm] = Form.useForm();

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchAllData = async () => {
    try {
      const [statusRes, healthRes, servicesRes, workflowsRes, errorsRes, deployRes] = await Promise.all([
        deepseekAutomationAPI.getStatus().catch(() => null),
        deepseekAutomationAPI.getHealth().catch(() => null),
        deepseekAutomationAPI.getServices().catch(() => ({ services: [] })),
        deepseekAutomationAPI.getActiveWorkflows().catch(() => ({ workflows: [] })),
        deepseekAutomationAPI.getRecentErrors(10).catch(() => ({ errors: [] })),
        deepseekAutomationAPI.getDeploymentStatus().catch(() => null),
      ]);

      setSystemStatus(statusRes);
      setHealth(healthRes);
      setServices(servicesRes.services || []);
      setActiveWorkflows(workflowsRes.workflows || []);
      setRecentErrors(errorsRes.errors || []);
      setDeploymentStatus(deployRes);
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const handleRestartService = async (serviceName: string) => {
    try {
      setLoading(true);
      await deepseekAutomationAPI.restartService(serviceName);
      message.success(`Service ${serviceName} restarted successfully`);
      fetchAllData();
    } catch (error: any) {
      message.error(`Failed to restart service: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteWorkflow = async (values: any) => {
    try {
      setLoading(true);
      await deepseekAutomationAPI.executeWorkflow(values.workflow, JSON.parse(values.params || '{}'));
      message.success('Workflow execution started');
      setWorkflowModalVisible(false);
      workflowForm.resetFields();
      fetchAllData();
    } catch (error: any) {
      message.error(`Failed to execute workflow: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeError = async (values: any) => {
    try {
      setLoading(true);
      await deepseekAutomationAPI.analyzeError(values.error);
      message.success('Error analysis started');
      setErrorAnalysisModalVisible(false);
      errorForm.resetFields();
      fetchAllData();
    } catch (error: any) {
      message.error(`Failed to analyze error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeploy = async (values: any) => {
    try {
      setLoading(true);
      let result;
      
      switch (values.environment) {
        case 'dev':
          result = await deepseekAutomationAPI.deployToDev(values.branchName);
          break;
        case 'staging':
          result = await deepseekAutomationAPI.deployToStaging(values.branchName);
          break;
        case 'production':
          result = await deepseekAutomationAPI.deployToProduction(values.branchName, {
            strategy: values.strategy,
            rollbackOnError: values.rollbackOnError,
          });
          break;
      }
      
      message.success(`Deployment to ${values.environment} started`);
      setDeployModalVisible(false);
      deployForm.resetFields();
      fetchAllData();
    } catch (error: any) {
      message.error(`Failed to deploy: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRollback = async (deploymentId: string) => {
    try {
      setLoading(true);
      await deepseekAutomationAPI.rollbackDeployment(deploymentId);
      message.success('Rollback initiated');
      fetchAllData();
    } catch (error: any) {
      message.error(`Failed to rollback: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const serviceColumns = [
    {
      title: 'Service Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <strong>{text}</strong>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'running' ? 'green' : status === 'stopped' ? 'red' : 'orange'}>
          {status?.toUpperCase() || 'UNKNOWN'}
        </Tag>
      ),
    },
    {
      title: 'Health',
      dataIndex: 'healthy',
      key: 'healthy',
      render: (healthy: boolean) => (
        healthy ? <CheckCircleOutlined style={{ color: 'green', fontSize: 20 }} /> :
                  <CloseCircleOutlined style={{ color: 'red', fontSize: 20 }} />
      ),
    },
    {
      title: 'Uptime',
      dataIndex: 'uptime',
      key: 'uptime',
      render: (uptime: number) => uptime ? `${Math.floor(uptime / 60000)} min` : 'N/A',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space>
          <Button 
            size="small" 
            icon={<SyncOutlined />}
            onClick={() => handleRestartService(record.name)}
            disabled={loading}
          >
            Restart
          </Button>
        </Space>
      ),
    },
  ];

  const workflowColumns = [
    {
      title: 'Workflow ID',
      dataIndex: 'workflow_id',
      key: 'workflow_id',
      render: (text: string) => <code>{text?.substring(0, 8)}</code>,
    },
    {
      title: 'Name',
      dataIndex: 'workflow_name',
      key: 'workflow_name',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'completed' ? 'green' : status === 'running' ? 'blue' : 'orange'}>
          {status?.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Started',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => new Date(date).toLocaleString(),
    },
  ];

  const errorColumns = [
    {
      title: 'Error',
      dataIndex: 'error_message',
      key: 'error_message',
      ellipsis: true,
      render: (text: string) => <span style={{ color: '#ff4d4f' }}>{text}</span>,
    },
    {
      title: 'Service',
      dataIndex: 'service_name',
      key: 'service_name',
    },
    {
      title: 'Timestamp',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: 'Analyzed',
      dataIndex: 'analyzed',
      key: 'analyzed',
      render: (analyzed: boolean) => (
        analyzed ? <CheckCircleOutlined style={{ color: 'green' }} /> :
                  <CloseCircleOutlined style={{ color: 'gray' }} />
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <h1 style={{ marginBottom: 24 }}>
        <ThunderboltOutlined /> DeepSeek Automation Dashboard
      </h1>

      {/* System Overview */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="System Status"
              value={health?.healthy ? 'Healthy' : 'Degraded'}
              valueStyle={{ color: health?.healthy ? '#3f8600' : '#cf1322' }}
              prefix={health?.healthy ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Uptime"
              value={health?.uptime ? Math.floor(health.uptime / 60000) : 0}
              suffix="min"
              prefix={<CloudServerOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Active Workflows"
              value={activeWorkflows.length}
              prefix={<ApiOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Active Services"
              value={services.filter(s => s.status === 'running').length}
              suffix={`/ ${services.length}`}
              prefix={<DatabaseOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Tabs */}
      <Tabs defaultActiveKey="services" animated>
        {/* Services Tab */}
        <TabPane tab={<span><ApiOutlined />Services</span>} key="services">
          <Card title="System Services" extra={
            <Button onClick={fetchAllData} icon={<SyncOutlined spin={loading} />}>
              Refresh
            </Button>
          }>
            {services.length > 0 ? (
              <Table
                columns={serviceColumns}
                dataSource={services}
                rowKey="name"
                pagination={false}
                loading={loading}
              />
            ) : (
              <Alert message="No services available" type="info" />
            )}
          </Card>
        </TabPane>

        {/* Workflows Tab */}
        <TabPane tab={<span><RocketOutlined />Workflows</span>} key="workflows">
          <Card 
            title="Active Workflows" 
            extra={
              <Button 
                type="primary" 
                icon={<RocketOutlined />}
                onClick={() => setWorkflowModalVisible(true)}
              >
                Execute Workflow
              </Button>
            }
          >
            {activeWorkflows.length > 0 ? (
              <Table
                columns={workflowColumns}
                dataSource={activeWorkflows}
                rowKey="workflow_id"
                pagination={{ pageSize: 10 }}
              />
            ) : (
              <Alert message="No active workflows" type="info" />
            )}
          </Card>
        </TabPane>

        {/* Memory System Tab */}
        <TabPane tab={<span><BulbOutlined />Memory</span>} key="memory">
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Card title="Memory Statistics">
                {memorySolutions ? (
                  <Row gutter={16}>
                    <Col span={8}>
                      <Statistic title="Total Episodes" value={memorySolutions.statistics?.totalEpisodes || 0} />
                    </Col>
                    <Col span={8}>
                      <Statistic title="Solutions" value={memorySolutions.statistics?.solutions || 0} />
                    </Col>
                    <Col span={8}>
                      <Statistic title="Success Rate" value={memorySolutions.statistics?.successRate || 0} suffix="%" />
                    </Col>
                  </Row>
                ) : (
                  <Alert message="Memory statistics not available" type="info" />
                )}
              </Card>
            </Col>
          </Row>
        </TabPane>

        {/* Errors Tab */}
        <TabPane tab={<span><BugOutlined />Errors</span>} key="errors">
          <Card 
            title="Recent Errors" 
            extra={
              <Button 
                type="primary" 
                danger 
                icon={<BugOutlined />}
                onClick={() => setErrorAnalysisModalVisible(true)}
              >
                Analyze Error
              </Button>
            }
          >
            {recentErrors.length > 0 ? (
              <Table
                columns={errorColumns}
                dataSource={recentErrors}
                rowKey="id"
                pagination={{ pageSize: 10 }}
              />
            ) : (
              <Alert message="No recent errors" type="success" showIcon />
            )}
          </Card>
        </TabPane>

        {/* CI/CD Tab */}
        <TabPane tab={<span><DeploymentUnitOutlined />CI/CD</span>} key="cicd">
          <Card 
            title="Deployment Management" 
            extra={
              <Button 
                type="primary" 
                icon={<DeploymentUnitOutlined />}
                onClick={() => setDeployModalVisible(true)}
              >
                New Deployment
              </Button>
            }
          >
            {deploymentStatus ? (
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <h3>Active Deployments</h3>
                  {deploymentStatus.active && deploymentStatus.active.length > 0 ? (
                    <Timeline>
                      {deploymentStatus.active.map((deployment: any, index: number) => (
                        <Timeline.Item key={index} color="blue">
                          <p><strong>{deployment.environment}</strong> - {deployment.status}</p>
                          <p>Branch: {deployment.branchName}</p>
                          <Space>
                            <Button 
                              size="small" 
                              danger 
                              onClick={() => handleRollback(deployment.id)}
                            >
                              Rollback
                            </Button>
                          </Space>
                        </Timeline.Item>
                      ))}
                    </Timeline>
                  ) : (
                    <Alert message="No active deployments" type="info" />
                  )}
                </Col>
                <Col span={24}>
                  <h3>Deployment History</h3>
                  {deploymentStatus.history && deploymentStatus.history.length > 0 ? (
                    <Timeline>
                      {deploymentStatus.history.slice(0, 5).map((deployment: any, index: number) => (
                        <Timeline.Item 
                          key={index} 
                          color={deployment.status === 'success' ? 'green' : 'red'}
                        >
                          <p><strong>{deployment.environment}</strong> - {deployment.status}</p>
                          <p>Branch: {deployment.branchName}</p>
                          <p>Time: {new Date(deployment.timestamp).toLocaleString()}</p>
                        </Timeline.Item>
                      ))}
                    </Timeline>
                  ) : (
                    <Alert message="No deployment history" type="info" />
                  )}
                </Col>
              </Row>
            ) : (
              <Spin />
            )}
          </Card>
        </TabPane>
      </Tabs>

      {/* Execute Workflow Modal */}
      <Modal
        title="Execute Workflow"
        open={workflowModalVisible}
        onCancel={() => setWorkflowModalVisible(false)}
        footer={null}
      >
        <Form form={workflowForm} onFinish={handleExecuteWorkflow} layout="vertical">
          <Form.Item
            name="workflow"
            label="Workflow Name"
            rules={[{ required: true, message: 'Please enter workflow name' }]}
          >
            <Input placeholder="e.g., data-pipeline" />
          </Form.Item>
          <Form.Item
            name="params"
            label="Parameters (JSON)"
          >
            <TextArea rows={4} placeholder='{"key": "value"}' />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                Execute
              </Button>
              <Button onClick={() => setWorkflowModalVisible(false)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Analyze Error Modal */}
      <Modal
        title="Analyze Error"
        open={errorAnalysisModalVisible}
        onCancel={() => setErrorAnalysisModalVisible(false)}
        footer={null}
      >
        <Form form={errorForm} onFinish={handleAnalyzeError} layout="vertical">
          <Form.Item
            name="error"
            label="Error Message"
            rules={[{ required: true, message: 'Please enter error message' }]}
          >
            <TextArea rows={6} placeholder="Paste error message or stack trace..." />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                Analyze
              </Button>
              <Button onClick={() => setErrorAnalysisModalVisible(false)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Deploy Modal */}
      <Modal
        title="New Deployment"
        open={deployModalVisible}
        onCancel={() => setDeployModalVisible(false)}
        footer={null}
      >
        <Form form={deployForm} onFinish={handleDeploy} layout="vertical">
          <Form.Item
            name="environment"
            label="Environment"
            rules={[{ required: true, message: 'Please select environment' }]}
          >
            <Select placeholder="Select environment">
              <Option value="dev">Development</Option>
              <Option value="staging">Staging</Option>
              <Option value="production">Production</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="branchName"
            label="Branch Name"
            rules={[{ required: true, message: 'Please enter branch name' }]}
          >
            <Input placeholder="e.g., main, develop, feature/xyz" />
          </Form.Item>
          <Form.Item
            name="strategy"
            label="Deployment Strategy"
          >
            <Select placeholder="Select strategy">
              <Option value="rolling">Rolling</Option>
              <Option value="blue-green">Blue-Green</Option>
              <Option value="canary">Canary</Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                Deploy
              </Button>
              <Button onClick={() => setDeployModalVisible(false)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DeepSeekAutomationDashboard;
