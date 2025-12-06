import React, { useState, useEffect } from 'react';
import { 
  Table, Button, Modal, Form, Input, Select, message, Tag, Space, 
  Card, Statistic, Row, Col, Tabs, Descriptions, Badge, Spin
} from 'antd';
import { 
  PlayCircleOutlined, PauseCircleOutlined, ReloadOutlined,
  PlusOutlined, DeleteOutlined, EyeOutlined, RobotOutlined,
  ThunderboltOutlined, DatabaseOutlined, ApiOutlined
} from '@ant-design/icons';
import { workflowAdminAPI } from '@/services/apiService';

const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;

interface WorkflowTask {
  id: string;
  taskId: string;
  label: string;
  name: string;
  description: string;
  status: string;
  handler_type: string;
  lastRunAt?: string;
}

interface WorkflowAttribute {
  id: string;
  label: string;
  name: string;
  type: string;
  enrichmentPrompt?: string;
  drilldownPrompts?: string[];
  status: string;
}

interface Workflow {
  id: string;
  workflowId: string;
  campaignName: string;
  datasetName: string;
  ownerName: string;
  ownerEmail: string;
  scriptInjected: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
  n8nWorkflowId?: string;
  tensorflowInstanceId?: string;
  seoScore?: number;
  tasks: WorkflowTask[];
  activeTasks: WorkflowTask[];
  attributes: WorkflowAttribute[];
  automationThreshold?: number;
  pendingAutomation?: boolean;
}

interface WorkflowRun {
  id: string;
  workflowId: string;
  status: string;
  startedAt: string;
  completedAt?: string;
  results?: any;
  errors?: string[];
}

const WorkflowAdminDashboard: React.FC = () => {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [runs, setRuns] = useState<WorkflowRun[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [executeModalVisible, setExecuteModalVisible] = useState(false);
  const [generateModalVisible, setGenerateModalVisible] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [form] = Form.useForm();
  const [generateForm] = Form.useForm();
  const [executeForm] = Form.useForm();

  const [stats, setStats] = useState({
    totalWorkflows: 0,
    activeWorkflows: 0,
    completedRuns: 0,
    pendingAutomation: 0
  });

  useEffect(() => {
    loadWorkflows();
    loadTemplates();
  }, []);

  const loadWorkflows = async () => {
    setLoading(true);
    try {
      const response = await workflowAdminAPI.getWorkflowsSummary();
      if (response.success) {
        setWorkflows(response.workflows);
        
        // Calculate stats
        setStats({
          totalWorkflows: response.workflows.length,
          activeWorkflows: response.workflows.filter((w: Workflow) => w.status === 'active').length,
          completedRuns: 0, // Would need separate endpoint
          pendingAutomation: response.workflows.filter((w: Workflow) => w.pendingAutomation).length
        });
      }
    } catch (error) {
      message.error('Failed to load workflows');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadTemplates = async () => {
    try {
      const response = await workflowAdminAPI.getTemplates();
      if (response.success) {
        setTemplates(response.templates);
      }
    } catch (error) {
      console.error('Failed to load templates:', error);
    }
  };

  const loadRuns = async (workflowId: string) => {
    try {
      const response = await workflowAdminAPI.getWorkflowRuns(workflowId);
      if (response.success) {
        setRuns(response.runs);
      }
    } catch (error) {
      message.error('Failed to load workflow runs');
      console.error(error);
    }
  };

  const handleCreateWorkflow = async (values: any) => {
    try {
      const response = await workflowAdminAPI.createWorkflow(values);
      if (response.success) {
        message.success('Workflow created successfully');
        setCreateModalVisible(false);
        form.resetFields();
        loadWorkflows();
      }
    } catch (error) {
      message.error('Failed to create workflow');
      console.error(error);
    }
  };

  const handleExecuteWorkflow = async (values: any) => {
    if (!selectedWorkflow) return;

    try {
      const response = await workflowAdminAPI.executeWorkflow(selectedWorkflow.workflowId, values);
      if (response.success) {
        message.success('Workflow execution started');
        setExecuteModalVisible(false);
        executeForm.resetFields();
        loadWorkflows();
      }
    } catch (error) {
      message.error('Failed to execute workflow');
      console.error(error);
    }
  };

  const handleGenerateAI = async (values: any) => {
    try {
      const response = await workflowAdminAPI.generateWorkflowAI(values);
      if (response.success) {
        message.success('AI-generated workflow created successfully');
        setGenerateModalVisible(false);
        generateForm.resetFields();
        loadWorkflows();
      }
    } catch (error) {
      message.error('Failed to generate workflow');
      console.error(error);
    }
  };

  const handleDeleteWorkflow = async (workflowId: string) => {
    try {
      await workflowAdminAPI.deleteWorkflow(workflowId);
      message.success('Workflow deleted successfully');
      loadWorkflows();
    } catch (error) {
      message.error('Failed to delete workflow');
      console.error(error);
    }
  };

  const showDetails = (workflow: Workflow) => {
    setSelectedWorkflow(workflow);
    setDetailsModalVisible(true);
    loadRuns(workflow.workflowId);
  };

  const showExecute = (workflow: Workflow) => {
    setSelectedWorkflow(workflow);
    setExecuteModalVisible(true);
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      active: 'green',
      paused: 'orange',
      completed: 'blue',
      failed: 'red',
      pending: 'gold'
    };
    return colors[status] || 'default';
  };

  const workflowColumns = [
    {
      title: 'Workflow Name',
      dataIndex: 'campaignName',
      key: 'campaignName',
      render: (text: string) => <strong>{text}</strong>
    },
    {
      title: 'Owner',
      dataIndex: 'ownerName',
      key: 'ownerName'
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{status.toUpperCase()}</Tag>
      )
    },
    {
      title: 'Tasks',
      dataIndex: 'tasks',
      key: 'tasks',
      render: (tasks: WorkflowTask[]) => <Tag>{tasks.length} tasks</Tag>
    },
    {
      title: 'Attributes',
      dataIndex: 'attributes',
      key: 'attributes',
      render: (attributes: WorkflowAttribute[]) => <Tag>{attributes.length} attributes</Tag>
    },
    {
      title: 'Script Injected',
      dataIndex: 'scriptInjected',
      key: 'scriptInjected',
      render: (injected: boolean) => (
        <Badge status={injected ? 'success' : 'default'} text={injected ? 'Yes' : 'No'} />
      )
    },
    {
      title: 'SEO Score',
      dataIndex: 'seoScore',
      key: 'seoScore',
      render: (score?: number) => score ? `${score}%` : 'N/A'
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Workflow) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => showDetails(record)}
          >
            Details
          </Button>
          <Button
            type="link"
            icon={<PlayCircleOutlined />}
            onClick={() => showExecute(record)}
          >
            Execute
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => {
              Modal.confirm({
                title: 'Delete Workflow',
                content: 'Are you sure you want to delete this workflow?',
                onOk: () => handleDeleteWorkflow(record.workflowId)
              });
            }}
          >
            Delete
          </Button>
        </Space>
      )
    }
  ];

  const runColumns = [
    {
      title: 'Run ID',
      dataIndex: 'id',
      key: 'id',
      render: (id: string) => id.substring(0, 12) + '...'
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{status.toUpperCase()}</Tag>
      )
    },
    {
      title: 'Started At',
      dataIndex: 'startedAt',
      key: 'startedAt',
      render: (date: string) => new Date(date).toLocaleString()
    },
    {
      title: 'Completed At',
      dataIndex: 'completedAt',
      key: 'completedAt',
      render: (date?: string) => date ? new Date(date).toLocaleString() : 'Running...'
    },
    {
      title: 'Errors',
      dataIndex: 'errors',
      key: 'errors',
      render: (errors?: string[]) => errors && errors.length > 0 ? (
        <Tag color="red">{errors.length} errors</Tag>
      ) : (
        <Tag color="green">No errors</Tag>
      )
    }
  ];

  const templateColumns = [
    {
      title: 'Template Name',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description'
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => <Tag>{type}</Tag>
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Button
          type="link"
          onClick={() => {
            form.setFieldsValue({
              name: `${record.name} - Copy`,
              description: record.description,
              type: record.type
            });
            setCreateModalVisible(true);
          }}
        >
          Use Template
        </Button>
      )
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <h1>Workflow Administration</h1>
      <p>Manage workflows with datamining execution, schema-driven templates, and AI-powered generation.</p>

      {/* Statistics */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Workflows"
              value={stats.totalWorkflows}
              prefix={<DatabaseOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Active Workflows"
              value={stats.activeWorkflows}
              valueStyle={{ color: '#3f8600' }}
              prefix={<ThunderboltOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Completed Runs"
              value={stats.completedRuns}
              prefix={<PlayCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Pending Automation"
              value={stats.pendingAutomation}
              valueStyle={{ color: '#cf1322' }}
              prefix={<RobotOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Tabs defaultActiveKey="workflows">
        <TabPane tab="Workflows" key="workflows">
          <div style={{ marginBottom: 16 }}>
            <Space>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setCreateModalVisible(true)}
              >
                Create Workflow
              </Button>
              <Button
                icon={<RobotOutlined />}
                onClick={() => setGenerateModalVisible(true)}
              >
                AI Generate
              </Button>
              <Button icon={<ReloadOutlined />} onClick={loadWorkflows}>
                Refresh
              </Button>
            </Space>
          </div>

          <Table
            columns={workflowColumns}
            dataSource={workflows}
            rowKey="workflowId"
            loading={loading}
            pagination={{ pageSize: 10 }}
          />
        </TabPane>

        <TabPane tab="Templates" key="templates">
          <Table
            columns={templateColumns}
            dataSource={templates}
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        </TabPane>
      </Tabs>

      {/* Create Workflow Modal */}
      <Modal
        title="Create New Workflow"
        open={createModalVisible}
        onCancel={() => {
          setCreateModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form form={form} onFinish={handleCreateWorkflow} layout="vertical">
          <Form.Item
            name="name"
            label="Workflow Name"
            rules={[{ required: true, message: 'Please enter workflow name' }]}
          >
            <Input placeholder="Enter workflow name" />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <TextArea rows={3} placeholder="Enter workflow description" />
          </Form.Item>

          <Form.Item
            name="type"
            label="Type"
            initialValue="datamining"
          >
            <Select>
              <Option value="datamining">Data Mining</Option>
              <Option value="seo">SEO Optimization</Option>
              <Option value="content">Content Generation</Option>
              <Option value="analytics">Analytics</Option>
            </Select>
          </Form.Item>

          <Form.Item name="ownerName" label="Owner Name">
            <Input placeholder="Enter owner name" />
          </Form.Item>

          <Form.Item name="ownerEmail" label="Owner Email">
            <Input placeholder="Enter owner email" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Create
              </Button>
              <Button onClick={() => {
                setCreateModalVisible(false);
                form.resetFields();
              }}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Execute Workflow Modal */}
      <Modal
        title="Execute Workflow"
        open={executeModalVisible}
        onCancel={() => {
          setExecuteModalVisible(false);
          executeForm.resetFields();
        }}
        footer={null}
      >
        <Form form={executeForm} onFinish={handleExecuteWorkflow} layout="vertical">
          <Form.Item name="config" label="Configuration (JSON)">
            <TextArea rows={6} placeholder='{"param1": "value1"}' />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" icon={<PlayCircleOutlined />}>
                Execute
              </Button>
              <Button onClick={() => {
                setExecuteModalVisible(false);
                executeForm.resetFields();
              }}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* AI Generate Modal */}
      <Modal
        title="AI-Powered Workflow Generation"
        open={generateModalVisible}
        onCancel={() => {
          setGenerateModalVisible(false);
          generateForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form form={generateForm} onFinish={handleGenerateAI} layout="vertical">
          <Form.Item
            name="prompt"
            label="Describe your workflow"
            rules={[{ required: true, message: 'Please enter a description' }]}
          >
            <TextArea
              rows={4}
              placeholder="E.g., Create a workflow that mines SEO data from competitor websites and generates content recommendations"
            />
          </Form.Item>

          <Form.Item
            name="type"
            label="Workflow Type"
            initialValue="datamining"
          >
            <Select>
              <Option value="datamining">Data Mining</Option>
              <Option value="seo">SEO Optimization</Option>
              <Option value="content">Content Generation</Option>
              <Option value="analytics">Analytics</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" icon={<RobotOutlined />}>
                Generate
              </Button>
              <Button onClick={() => {
                setGenerateModalVisible(false);
                generateForm.resetFields();
              }}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Workflow Details Modal */}
      <Modal
        title="Workflow Details"
        open={detailsModalVisible}
        onCancel={() => {
          setDetailsModalVisible(false);
          setSelectedWorkflow(null);
        }}
        footer={null}
        width={900}
      >
        {selectedWorkflow && (
          <Tabs defaultActiveKey="info">
            <TabPane tab="Information" key="info">
              <Descriptions bordered column={2}>
                <Descriptions.Item label="Workflow ID">
                  {selectedWorkflow.workflowId}
                </Descriptions.Item>
                <Descriptions.Item label="Status">
                  <Tag color={getStatusColor(selectedWorkflow.status)}>
                    {selectedWorkflow.status.toUpperCase()}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Campaign Name">
                  {selectedWorkflow.campaignName}
                </Descriptions.Item>
                <Descriptions.Item label="Dataset Name">
                  {selectedWorkflow.datasetName}
                </Descriptions.Item>
                <Descriptions.Item label="Owner">
                  {selectedWorkflow.ownerName} ({selectedWorkflow.ownerEmail})
                </Descriptions.Item>
                <Descriptions.Item label="Script Injected">
                  {selectedWorkflow.scriptInjected ? 'Yes' : 'No'}
                </Descriptions.Item>
                <Descriptions.Item label="SEO Score">
                  {selectedWorkflow.seoScore ? `${selectedWorkflow.seoScore}%` : 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="Automation Threshold">
                  {selectedWorkflow.automationThreshold || 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="N8N Workflow ID">
                  {selectedWorkflow.n8nWorkflowId || 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="TensorFlow Instance">
                  {selectedWorkflow.tensorflowInstanceId || 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="Created At" span={2}>
                  {new Date(selectedWorkflow.createdAt).toLocaleString()}
                </Descriptions.Item>
              </Descriptions>
            </TabPane>

            <TabPane tab={`Tasks (${selectedWorkflow.tasks.length})`} key="tasks">
              <Table
                dataSource={selectedWorkflow.tasks}
                rowKey="taskId"
                columns={[
                  { title: 'Task ID', dataIndex: 'taskId', key: 'taskId' },
                  { title: 'Label', dataIndex: 'label', key: 'label' },
                  { title: 'Description', dataIndex: 'description', key: 'description' },
                  { 
                    title: 'Status', 
                    dataIndex: 'status', 
                    key: 'status',
                    render: (status: string) => (
                      <Tag color={getStatusColor(status)}>{status}</Tag>
                    )
                  },
                  { title: 'Handler Type', dataIndex: 'handler_type', key: 'handler_type' }
                ]}
                pagination={false}
              />
            </TabPane>

            <TabPane tab={`Attributes (${selectedWorkflow.attributes.length})`} key="attributes">
              <Table
                dataSource={selectedWorkflow.attributes}
                rowKey="id"
                columns={[
                  { title: 'Label', dataIndex: 'label', key: 'label' },
                  { title: 'Type', dataIndex: 'type', key: 'type' },
                  { 
                    title: 'Status', 
                    dataIndex: 'status', 
                    key: 'status',
                    render: (status: string) => (
                      <Tag color={getStatusColor(status)}>{status}</Tag>
                    )
                  }
                ]}
                pagination={false}
              />
            </TabPane>

            <TabPane tab="Runs" key="runs">
              <Table
                columns={runColumns}
                dataSource={runs}
                rowKey="id"
                pagination={false}
              />
            </TabPane>
          </Tabs>
        )}
      </Modal>
    </div>
  );
};

export default WorkflowAdminDashboard;
