import React, { useState, useEffect } from 'react';
import { Card, Tabs, Table, Button, Space, Tag, Statistic, Row, Col, Modal, Form, Input, Select, notification, Descriptions } from 'antd';
import { 
  PlayCircleOutlined, 
  PauseCircleOutlined, 
  DeleteOutlined, 
  EditOutlined, 
  PlusOutlined, 
  ThunderboltOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined,
  CodeOutlined,
  AppstoreOutlined,
  LineChartOutlined
} from '@ant-design/icons';
import { n8nWorkflowAPI } from '../../services/apiService';

const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;

const N8NWorkflowDashboard: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [workflows, setWorkflows] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [serviceStatus, setServiceStatus] = useState<any>(null);
  const [systemMetrics, setSystemMetrics] = useState<any>(null);
  const [selectedWorkflow, setSelectedWorkflow] = useState<any>(null);
  const [executions, setExecutions] = useState([]);
  
  // Modals
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [isTemplateModalVisible, setIsTemplateModalVisible] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isExecutionModalVisible, setIsExecutionModalVisible] = useState(false);
  
  const [form] = Form.useForm();
  const [templateForm] = Form.useForm();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadWorkflows(),
        loadTemplates(),
        loadServiceStatus(),
        loadSystemMetrics(),
      ]);
    } catch (error) {
      notification.error({
        message: 'Error loading data',
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const loadWorkflows = async () => {
    try {
      const data = await n8nWorkflowAPI.getWorkflows();
      setWorkflows(data.workflows || []);
    } catch (error) {
      console.error('Error loading workflows:', error);
    }
  };

  const loadTemplates = async () => {
    try {
      const data = await n8nWorkflowAPI.getTemplates();
      setTemplates(data || []);
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  };

  const loadServiceStatus = async () => {
    try {
      const data = await n8nWorkflowAPI.getServiceStatus();
      setServiceStatus(data);
    } catch (error) {
      console.error('Error loading service status:', error);
    }
  };

  const loadSystemMetrics = async () => {
    try {
      const data = await n8nWorkflowAPI.getSystemMetrics();
      setSystemMetrics(data);
    } catch (error) {
      console.error('Error loading system metrics:', error);
    }
  };

  const handleCreateWorkflow = async (values: any) => {
    try {
      await n8nWorkflowAPI.createWorkflow({
        name: values.name,
        nodes: [],
        connections: {},
        tags: values.tags ? values.tags.split(',').map((t: string) => t.trim()) : [],
      });
      notification.success({
        message: 'Workflow Created',
        description: 'Workflow has been created successfully',
      });
      setIsCreateModalVisible(false);
      form.resetFields();
      loadWorkflows();
    } catch (error) {
      notification.error({
        message: 'Error creating workflow',
        description: error.message,
      });
    }
  };

  const handleCreateFromTemplate = async (values: any) => {
    try {
      await n8nWorkflowAPI.createFromTemplate(values.templateId, values.config ? JSON.parse(values.config) : {});
      notification.success({
        message: 'Workflow Created',
        description: 'Workflow has been created from template',
      });
      setIsTemplateModalVisible(false);
      templateForm.resetFields();
      loadWorkflows();
    } catch (error) {
      notification.error({
        message: 'Error creating workflow from template',
        description: error.message,
      });
    }
  };

  const handleExecuteWorkflow = async (id: string) => {
    try {
      await n8nWorkflowAPI.executeWorkflow(id);
      notification.success({
        message: 'Workflow Executed',
        description: 'Workflow has been executed successfully',
      });
    } catch (error) {
      notification.error({
        message: 'Error executing workflow',
        description: error.message,
      });
    }
  };

  const handleStartWorkflow = async (id: string) => {
    try {
      await n8nWorkflowAPI.startWorkflow(id);
      notification.success({
        message: 'Workflow Started',
        description: 'Workflow has been activated',
      });
      loadWorkflows();
    } catch (error) {
      notification.error({
        message: 'Error starting workflow',
        description: error.message,
      });
    }
  };

  const handleStopWorkflow = async (id: string) => {
    try {
      await n8nWorkflowAPI.stopWorkflow(id);
      notification.success({
        message: 'Workflow Stopped',
        description: 'Workflow has been deactivated',
      });
      loadWorkflows();
    } catch (error) {
      notification.error({
        message: 'Error stopping workflow',
        description: error.message,
      });
    }
  };

  const handleDeleteWorkflow = async (id: string) => {
    Modal.confirm({
      title: 'Delete Workflow',
      content: 'Are you sure you want to delete this workflow?',
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          await n8nWorkflowAPI.deleteWorkflow(id);
          notification.success({
            message: 'Workflow Deleted',
            description: 'Workflow has been deleted successfully',
          });
          loadWorkflows();
        } catch (error) {
          notification.error({
            message: 'Error deleting workflow',
            description: error.message,
          });
        }
      },
    });
  };

  const handleViewDetails = async (workflow: any) => {
    setSelectedWorkflow(workflow);
    setIsDetailModalVisible(true);
    
    // Load executions
    try {
      const data = await n8nWorkflowAPI.getExecutions(workflow.id);
      setExecutions(data.executions || []);
    } catch (error) {
      console.error('Error loading executions:', error);
    }
  };

  const workflowColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <strong>{text}</strong>,
    },
    {
      title: 'Status',
      dataIndex: 'active',
      key: 'active',
      render: (active: boolean) => (
        <Tag color={active ? 'green' : 'default'}>
          {active ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: 'Nodes',
      dataIndex: 'node_count',
      key: 'node_count',
      render: (count: number) => count || 0,
    },
    {
      title: 'Tags',
      dataIndex: 'tags',
      key: 'tags',
      render: (tags: string[]) => (
        <>
          {tags && tags.map((tag: string, index: number) => (
            <Tag key={index}>{tag}</Tag>
          ))}
        </>
      ),
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space>
          <Button
            size="small"
            icon={<ThunderboltOutlined />}
            onClick={() => handleExecuteWorkflow(record.id)}
          >
            Execute
          </Button>
          {record.active ? (
            <Button
              size="small"
              icon={<PauseCircleOutlined />}
              onClick={() => handleStopWorkflow(record.id)}
            >
              Stop
            </Button>
          ) : (
            <Button
              size="small"
              icon={<PlayCircleOutlined />}
              type="primary"
              onClick={() => handleStartWorkflow(record.id)}
            >
              Start
            </Button>
          )}
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleViewDetails(record)}
          >
            Details
          </Button>
          <Button
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteWorkflow(record.id)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  const templateColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <strong>{text}</strong>,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (category: string) => <Tag>{category}</Tag>,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Button
          size="small"
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            templateForm.setFieldsValue({ templateId: record.id });
            setIsTemplateModalVisible(true);
          }}
        >
          Use Template
        </Button>
      ),
    },
  ];

  const executionColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        let color = 'default';
        let icon = null;
        if (status === 'success') {
          color = 'green';
          icon = <CheckCircleOutlined />;
        } else if (status === 'error' || status === 'failed') {
          color = 'red';
          icon = <CloseCircleOutlined />;
        } else if (status === 'running') {
          color = 'blue';
          icon = <SyncOutlined spin />;
        }
        return (
          <Tag color={color} icon={icon}>
            {status}
          </Tag>
        );
      },
    },
    {
      title: 'Started',
      dataIndex: 'started_at',
      key: 'started_at',
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: 'Finished',
      dataIndex: 'finished_at',
      key: 'finished_at',
      render: (date: string) => date ? new Date(date).toLocaleString() : '-',
    },
    {
      title: 'Duration',
      dataIndex: 'execution_time',
      key: 'execution_time',
      render: (time: number) => time ? `${time}ms` : '-',
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <h1>N8N Workflow Management</h1>
      <p>Manage N8N workflows with database persistence and execution tracking</p>

      <Tabs defaultActiveKey="overview">
        <TabPane tab="Overview" key="overview">
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Total Workflows"
                  value={systemMetrics?.total_workflows || 0}
                  prefix={<CodeOutlined />}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Active Workflows"
                  value={systemMetrics?.active_workflows || 0}
                  prefix={<PlayCircleOutlined />}
                  valueStyle={{ color: '#3f8600' }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Running Executions"
                  value={systemMetrics?.running_executions || 0}
                  prefix={<SyncOutlined spin />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Executions (24h)"
                  value={systemMetrics?.executions_last_24h || 0}
                  prefix={<ThunderboltOutlined />}
                />
              </Card>
            </Col>
          </Row>

          {serviceStatus && (
            <Card title="Service Status" style={{ marginBottom: 16 }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                {serviceStatus.services && serviceStatus.services.map((service: any, index: number) => (
                  <Card key={index} size="small">
                    <Row align="middle">
                      <Col span={12}>
                        <Space>
                          {service.status === 'running' ? (
                            <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 18 }} />
                          ) : (
                            <CloseCircleOutlined style={{ color: '#ff4d4f', fontSize: 18 }} />
                          )}
                          <span style={{ fontWeight: 'bold' }}>{service.name}</span>
                        </Space>
                      </Col>
                      <Col span={12}>
                        <Tag color={service.status === 'running' ? 'green' : 'red'}>
                          {service.status}
                        </Tag>
                        <span style={{ fontSize: 12, color: '#888' }}>
                          Required for: {service.required_for.join(', ')}
                        </span>
                      </Col>
                    </Row>
                  </Card>
                ))}
              </Space>
            </Card>
          )}
        </TabPane>

        <TabPane tab="Workflows" key="workflows">
          <Space style={{ marginBottom: 16 }}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsCreateModalVisible(true)}
            >
              Create Workflow
            </Button>
            <Button
              icon={<AppstoreOutlined />}
              onClick={() => setIsTemplateModalVisible(true)}
            >
              Use Template
            </Button>
            <Button
              icon={<SyncOutlined />}
              onClick={loadWorkflows}
            >
              Refresh
            </Button>
          </Space>

          <Table
            columns={workflowColumns}
            dataSource={workflows}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10 }}
          />
        </TabPane>

        <TabPane tab="Templates" key="templates">
          <Table
            columns={templateColumns}
            dataSource={templates}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10 }}
          />
        </TabPane>

        <TabPane tab="Metrics" key="metrics">
          <Card title="System Metrics">
            {systemMetrics && (
              <Descriptions bordered column={2}>
                <Descriptions.Item label="Total Workflows">
                  {systemMetrics.total_workflows || 0}
                </Descriptions.Item>
                <Descriptions.Item label="Active Workflows">
                  {systemMetrics.active_workflows || 0}
                </Descriptions.Item>
                <Descriptions.Item label="Running Executions">
                  {systemMetrics.running_executions || 0}
                </Descriptions.Item>
                <Descriptions.Item label="Executions (24h)">
                  {systemMetrics.executions_last_24h || 0}
                </Descriptions.Item>
                <Descriptions.Item label="Successful (24h)">
                  {systemMetrics.success_last_24h || 0}
                </Descriptions.Item>
                <Descriptions.Item label="Failed (24h)">
                  {systemMetrics.failed_last_24h || 0}
                </Descriptions.Item>
              </Descriptions>
            )}
          </Card>
        </TabPane>
      </Tabs>

      {/* Create Workflow Modal */}
      <Modal
        title="Create New Workflow"
        visible={isCreateModalVisible}
        onCancel={() => {
          setIsCreateModalVisible(false);
          form.resetFields();
        }}
        footer={null}
      >
        <Form form={form} onFinish={handleCreateWorkflow} layout="vertical">
          <Form.Item
            name="name"
            label="Workflow Name"
            rules={[{ required: true, message: 'Please enter workflow name' }]}
          >
            <Input placeholder="Enter workflow name" />
          </Form.Item>
          <Form.Item
            name="tags"
            label="Tags (comma-separated)"
          >
            <Input placeholder="e.g., automation, data, processing" />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Create
              </Button>
              <Button onClick={() => {
                setIsCreateModalVisible(false);
                form.resetFields();
              }}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Create from Template Modal */}
      <Modal
        title="Create Workflow from Template"
        visible={isTemplateModalVisible}
        onCancel={() => {
          setIsTemplateModalVisible(false);
          templateForm.resetFields();
        }}
        footer={null}
      >
        <Form form={templateForm} onFinish={handleCreateFromTemplate} layout="vertical">
          <Form.Item
            name="templateId"
            label="Template"
            rules={[{ required: true, message: 'Please select a template' }]}
          >
            <Select placeholder="Select a template">
              {templates.map((template: any) => (
                <Option key={template.id} value={template.id}>
                  {template.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="config"
            label="Configuration (JSON)"
          >
            <TextArea rows={4} placeholder='{"key": "value"}' />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Create
              </Button>
              <Button onClick={() => {
                setIsTemplateModalVisible(false);
                templateForm.resetFields();
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
        visible={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        width={800}
        footer={null}
      >
        {selectedWorkflow && (
          <>
            <Descriptions bordered column={2} style={{ marginBottom: 16 }}>
              <Descriptions.Item label="Name" span={2}>
                {selectedWorkflow.name}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={selectedWorkflow.active ? 'green' : 'default'}>
                  {selectedWorkflow.active ? 'Active' : 'Inactive'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Nodes">
                {selectedWorkflow.node_count || 0}
              </Descriptions.Item>
              <Descriptions.Item label="Created">
                {new Date(selectedWorkflow.created_at).toLocaleString()}
              </Descriptions.Item>
              <Descriptions.Item label="Updated">
                {new Date(selectedWorkflow.updated_at).toLocaleString()}
              </Descriptions.Item>
              <Descriptions.Item label="Tags" span={2}>
                {selectedWorkflow.tags && selectedWorkflow.tags.map((tag: string, index: number) => (
                  <Tag key={index}>{tag}</Tag>
                ))}
              </Descriptions.Item>
            </Descriptions>

            <h3>Recent Executions</h3>
            <Table
              columns={executionColumns}
              dataSource={executions}
              rowKey="id"
              size="small"
              pagination={{ pageSize: 5 }}
            />
          </>
        )}
      </Modal>
    </div>
  );
};

export default N8NWorkflowDashboard;
