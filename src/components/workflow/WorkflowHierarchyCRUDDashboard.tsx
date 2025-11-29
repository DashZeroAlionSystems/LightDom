/**
 * Comprehensive Workflow Hierarchy CRUD Dashboard
 * 
 * Features:
 * - Complete workflow hierarchy with tree view
 * - Service management with real-time streams
 * - Dashboard creation and configuration
 * - DeepSeek AI-powered workflow generation
 * - Auto-schema visualization
 * - Real-time data stream management
 */

import React, { useState, useEffect } from 'react';
import {
  Card,
  Tabs,
  Button,
  Table,
  Tree,
  Form,
  Input,
  Select,
  Modal,
  Tag,
  Space,
  Drawer,
  Descriptions,
  message,
  Row,
  Col,
  Statistic,
  Badge,
  Collapse,
  Switch,
  InputNumber,
  Divider,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  RobotOutlined,
  ApiOutlined,
  DashboardOutlined,
  ShareAltOutlined,
  BranchesOutlined,
  SyncOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';

const { TabPane } = Tabs;
const { TextArea } = Input;
const { Option } = Select;
const { Panel } = Collapse;

interface Workflow {
  workflow_id: string;
  name: string;
  description?: string;
  parent_workflow_id?: string;
  hierarchy_level: number;
  workflow_type: string;
  category?: string;
  status: string;
  auto_schema?: any;
  service_count?: number;
  dashboard_count?: number;
  stream_count?: number;
}

interface WorkflowService {
  service_id: string;
  workflow_id: string;
  name: string;
  service_type: string;
  supports_realtime: boolean;
  is_active: boolean;
  auto_schema?: any;
}

interface DataStream {
  stream_id: string;
  name: string;
  stream_type: string;
  direction: string;
  is_active: boolean;
}

export const WorkflowHierarchyCRUDDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('hierarchy');
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [services, setServices] = useState<WorkflowService[]>([]);
  const [streams, setStreams] = useState<DataStream[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Modal states
  const [workflowModalVisible, setWorkflowModalVisible] = useState(false);
  const [serviceModalVisible, setServiceModalVisible] = useState(false);
  const [streamModalVisible, setStreamModalVisible] = useState(false);
  const [aiGenModalVisible, setAiGenModalVisible] = useState(false);
  const [schemaDrawerVisible, setSchemaDrawerVisible] = useState(false);
  
  // Form instances
  const [workflowForm] = Form.useForm();
  const [serviceForm] = Form.useForm();
  const [streamForm] = Form.useForm();
  const [aiForm] = Form.useForm();

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    services: 0,
    streams: 0,
  });

  useEffect(() => {
    loadWorkflows();
    loadStats();
  }, []);

  useEffect(() => {
    if (selectedWorkflow) {
      loadServices(selectedWorkflow.workflow_id);
      loadStreams(selectedWorkflow.workflow_id);
    }
  }, [selectedWorkflow]);

  const loadWorkflows = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/workflow-hierarchy/workflows');
      const data = await response.json();
      if (data.success) {
        setWorkflows(data.workflows);
      }
    } catch (error) {
      message.error('Failed to load workflows');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadServices = async (workflowId: string) => {
    try {
      const response = await fetch(`/api/workflow-hierarchy/workflows/${workflowId}/services`);
      const data = await response.json();
      if (data.success) {
        setServices(data.services);
      }
    } catch (error) {
      console.error('Failed to load services:', error);
    }
  };

  const loadStreams = async (workflowId: string) => {
    try {
      const response = await fetch(`/api/workflow-hierarchy/workflows/${workflowId}/streams`);
      const data = await response.json();
      if (data.success) {
        setStreams(data.streams);
      }
    } catch (error) {
      console.error('Failed to load streams:', error);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch('/api/workflow-hierarchy/workflows');
      const data = await response.json();
      if (data.success) {
        const workflows = data.workflows;
        setStats({
          total: workflows.length,
          active: workflows.filter((w: Workflow) => w.status === 'active').length,
          services: workflows.reduce((sum: number, w: Workflow) => sum + (w.service_count || 0), 0),
          streams: workflows.reduce((sum: number, w: Workflow) => sum + (w.stream_count || 0), 0),
        });
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleCreateWorkflow = async (values: any) => {
    try {
      const response = await fetch('/api/workflow-hierarchy/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const data = await response.json();
      if (data.success) {
        message.success('Workflow created successfully');
        setWorkflowModalVisible(false);
        workflowForm.resetFields();
        loadWorkflows();
        loadStats();
      }
    } catch (error) {
      message.error('Failed to create workflow');
      console.error(error);
    }
  };

  const handleCreateService = async (values: any) => {
    try {
      const response = await fetch('/api/workflow-hierarchy/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...values,
          workflow_id: selectedWorkflow?.workflow_id,
        }),
      });
      const data = await response.json();
      if (data.success) {
        message.success('Service created successfully');
        setServiceModalVisible(false);
        serviceForm.resetFields();
        if (selectedWorkflow) {
          loadServices(selectedWorkflow.workflow_id);
        }
      }
    } catch (error) {
      message.error('Failed to create service');
      console.error(error);
    }
  };

  const handleAIGenerate = async (values: any) => {
    setLoading(true);
    try {
      const response = await fetch('/api/workflow-hierarchy/generate-from-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: values.prompt,
          context: values.context ? JSON.parse(values.context) : undefined,
        }),
      });
      const data = await response.json();
      if (data.success) {
        message.success(`Workflow "${data.workflow.name}" generated successfully by DeepSeek!`);
        setAiGenModalVisible(false);
        aiForm.resetFields();
        loadWorkflows();
        loadStats();
        setSelectedWorkflow(data.workflow);
      } else {
        throw new Error(data.error || 'Generation failed');
      }
    } catch (error: any) {
      message.error(error.message || 'Failed to generate workflow');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWorkflow = (workflowId: string) => {
    Modal.confirm({
      title: 'Delete Workflow',
      content: 'Are you sure you want to delete this workflow and all its services/streams?',
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          const response = await fetch(`/api/workflow-hierarchy/workflows/${workflowId}`, {
            method: 'DELETE',
          });
          const data = await response.json();
          if (data.success) {
            message.success('Workflow deleted successfully');
            loadWorkflows();
            loadStats();
            if (selectedWorkflow?.workflow_id === workflowId) {
              setSelectedWorkflow(null);
            }
          }
        } catch (error) {
          message.error('Failed to delete workflow');
          console.error(error);
        }
      },
    });
  };

  // Build tree data for hierarchy view
  const buildTreeData = (workflows: Workflow[]) => {
    const map = new Map<string, any>();
    const roots: any[] = [];

    workflows.forEach(wf => {
      map.set(wf.workflow_id, {
        key: wf.workflow_id,
        title: (
          <Space>
            <strong>{wf.name}</strong>
            <Tag color={wf.status === 'active' ? 'green' : 'default'}>{wf.status}</Tag>
            <Tag>{wf.workflow_type}</Tag>
          </Space>
        ),
        children: [],
        data: wf,
      });
    });

    workflows.forEach(wf => {
      const node = map.get(wf.workflow_id);
      if (wf.parent_workflow_id && map.has(wf.parent_workflow_id)) {
        map.get(wf.parent_workflow_id).children.push(node);
      } else {
        roots.push(node);
      }
    });

    return roots;
  };

  const workflowColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Workflow) => (
        <Space>
          <strong>{text}</strong>
          {record.service_count ? <Badge count={record.service_count} title="Services" /> : null}
        </Space>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'workflow_type',
      key: 'workflow_type',
      render: (type: string) => <Tag>{type}</Tag>,
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : status === 'draft' ? 'blue' : 'default'}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Level',
      dataIndex: 'hierarchy_level',
      key: 'hierarchy_level',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Workflow) => (
        <Space>
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => setSelectedWorkflow(record)}
          >
            View
          </Button>
          <Button
            size="small"
            icon={<DeleteOutlined />}
            danger
            onClick={() => handleDeleteWorkflow(record.workflow_id)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  const serviceColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Type',
      dataIndex: 'service_type',
      key: 'service_type',
      render: (type: string) => <Tag color="blue">{type}</Tag>,
    },
    {
      title: 'Real-time',
      dataIndex: 'supports_realtime',
      key: 'supports_realtime',
      render: (realtime: boolean) => (
        <Tag color={realtime ? 'green' : 'default'}>
          {realtime ? 'Yes' : 'No'}
        </Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (active: boolean) => (
        <Tag color={active ? 'success' : 'error'}>
          {active ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      {/* Stats Row */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Workflows"
              value={stats.total}
              prefix={<BranchesOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Active"
              value={stats.active}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Services"
              value={stats.services}
              prefix={<ApiOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Data Streams"
              value={stats.streams}
              prefix={<ShareAltOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Content */}
      <Card
        title="Workflow Hierarchy Management"
        extra={
          <Space>
            <Button
              type="primary"
              icon={<RobotOutlined />}
              onClick={() => setAiGenModalVisible(true)}
            >
              AI Generate
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setWorkflowModalVisible(true)}
            >
              Create Workflow
            </Button>
            <Button icon={<SyncOutlined />} onClick={loadWorkflows}>
              Refresh
            </Button>
          </Space>
        }
      >
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="Hierarchy View" key="hierarchy">
            <Tree
              showLine
              defaultExpandAll
              treeData={buildTreeData(workflows)}
              onSelect={(keys, info) => {
                if (info.node.data) {
                  setSelectedWorkflow(info.node.data);
                }
              }}
            />
          </TabPane>

          <TabPane tab="List View" key="list">
            <Table
              columns={workflowColumns}
              dataSource={workflows}
              rowKey="workflow_id"
              loading={loading}
              pagination={{ pageSize: 10 }}
            />
          </TabPane>

          <TabPane tab="Details" key="details" disabled={!selectedWorkflow}>
            {selectedWorkflow && (
              <div>
                <Descriptions title="Workflow Details" bordered column={2}>
                  <Descriptions.Item label="Name">{selectedWorkflow.name}</Descriptions.Item>
                  <Descriptions.Item label="ID">{selectedWorkflow.workflow_id}</Descriptions.Item>
                  <Descriptions.Item label="Type">{selectedWorkflow.workflow_type}</Descriptions.Item>
                  <Descriptions.Item label="Category">{selectedWorkflow.category}</Descriptions.Item>
                  <Descriptions.Item label="Status">
                    <Tag color={selectedWorkflow.status === 'active' ? 'green' : 'default'}>
                      {selectedWorkflow.status}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Hierarchy Level">
                    {selectedWorkflow.hierarchy_level}
                  </Descriptions.Item>
                  <Descriptions.Item label="Description" span={2}>
                    {selectedWorkflow.description}
                  </Descriptions.Item>
                </Descriptions>

                <Divider />

                <Row gutter={16}>
                  <Col span={12}>
                    <Card
                      title="Services"
                      size="small"
                      extra={
                        <Button
                          size="small"
                          icon={<PlusOutlined />}
                          onClick={() => setServiceModalVisible(true)}
                        >
                          Add Service
                        </Button>
                      }
                    >
                      <Table
                        columns={serviceColumns}
                        dataSource={services}
                        rowKey="service_id"
                        size="small"
                        pagination={false}
                      />
                    </Card>
                  </Col>
                  <Col span={12}>
                    <Card
                      title="Data Streams"
                      size="small"
                      extra={
                        <Button
                          size="small"
                          icon={<PlusOutlined />}
                          onClick={() => setStreamModalVisible(true)}
                        >
                          Add Stream
                        </Button>
                      }
                    >
                      <Table
                        dataSource={streams}
                        rowKey="stream_id"
                        size="small"
                        pagination={false}
                        columns={[
                          { title: 'Name', dataIndex: 'name', key: 'name' },
                          { title: 'Type', dataIndex: 'stream_type', key: 'stream_type' },
                          { title: 'Direction', dataIndex: 'direction', key: 'direction' },
                        ]}
                      />
                    </Card>
                  </Col>
                </Row>

                {selectedWorkflow.auto_schema && (
                  <div style={{ marginTop: 16 }}>
                    <Button
                      icon={<EyeOutlined />}
                      onClick={() => setSchemaDrawerVisible(true)}
                    >
                      View Auto-Generated Schema
                    </Button>
                  </div>
                )}
              </div>
            )}
          </TabPane>
        </Tabs>
      </Card>

      {/* Create Workflow Modal */}
      <Modal
        title="Create New Workflow"
        open={workflowModalVisible}
        onCancel={() => setWorkflowModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form form={workflowForm} layout="vertical" onFinish={handleCreateWorkflow}>
          <Form.Item name="name" label="Workflow Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <TextArea rows={3} />
          </Form.Item>
          <Form.Item name="workflow_type" label="Type" rules={[{ required: true }]}>
            <Select>
              <Option value="root">Root</Option>
              <Option value="composite">Composite</Option>
              <Option value="atomic">Atomic</Option>
            </Select>
          </Form.Item>
          <Form.Item name="category" label="Category">
            <Select>
              <Option value="seo">SEO</Option>
              <Option value="data-mining">Data Mining</Option>
              <Option value="ai-content">AI Content</Option>
              <Option value="analytics">Analytics</Option>
              <Option value="automation">Automation</Option>
            </Select>
          </Form.Item>
          <Form.Item name="parent_workflow_id" label="Parent Workflow">
            <Select allowClear placeholder="Select parent (optional)">
              {workflows.map(wf => (
                <Option key={wf.workflow_id} value={wf.workflow_id}>
                  {wf.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Create
              </Button>
              <Button onClick={() => setWorkflowModalVisible(false)}>Cancel</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Create Service Modal */}
      <Modal
        title="Create Service"
        open={serviceModalVisible}
        onCancel={() => setServiceModalVisible(false)}
        footer={null}
        width={700}
      >
        <Form form={serviceForm} layout="vertical" onFinish={handleCreateService}>
          <Form.Item name="name" label="Service Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <TextArea rows={2} />
          </Form.Item>
          <Form.Item name="service_type" label="Service Type" rules={[{ required: true }]}>
            <Select>
              <Option value="api">API</Option>
              <Option value="data-processor">Data Processor</Option>
              <Option value="ai-engine">AI Engine</Option>
              <Option value="database">Database</Option>
              <Option value="notification">Notification</Option>
            </Select>
          </Form.Item>
          <Form.Item name="supports_realtime" label="Supports Real-time" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item name="stream_direction" label="Stream Direction">
            <Select defaultValue="bidirectional">
              <Option value="inbound">Inbound</Option>
              <Option value="outbound">Outbound</Option>
              <Option value="bidirectional">Bidirectional</Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Create
              </Button>
              <Button onClick={() => setServiceModalVisible(false)}>Cancel</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* AI Generation Modal */}
      <Modal
        title="DeepSeek AI Workflow Generation"
        open={aiGenModalVisible}
        onCancel={() => setAiGenModalVisible(false)}
        footer={null}
        width={700}
      >
        <Form form={aiForm} layout="vertical" onFinish={handleAIGenerate}>
          <Form.Item
            name="prompt"
            label="Describe your workflow"
            rules={[{ required: true, message: 'Please describe the workflow you want to create' }]}
          >
            <TextArea
              rows={6}
              placeholder="Example: Create a workflow for daily SEO analysis that fetches website data, analyzes it with AI, stores results in a database, and displays them on a real-time dashboard"
            />
          </Form.Item>
          <Form.Item name="context" label="Additional Context (JSON)">
            <TextArea
              rows={4}
              placeholder='{"target_urls": ["example.com"], "analysis_types": ["seo", "performance"]}'
            />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading} icon={<RobotOutlined />}>
                Generate with DeepSeek
              </Button>
              <Button onClick={() => setAiGenModalVisible(false)}>Cancel</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Schema Drawer */}
      <Drawer
        title="Auto-Generated Schema"
        width={600}
        open={schemaDrawerVisible}
        onClose={() => setSchemaDrawerVisible(false)}
      >
        {selectedWorkflow?.auto_schema && (
          <pre style={{ background: '#f5f5f5', padding: 16, borderRadius: 4, overflow: 'auto' }}>
            {JSON.stringify(selectedWorkflow.auto_schema, null, 2)}
          </pre>
        )}
      </Drawer>
    </div>
  );
};

export default WorkflowHierarchyCRUDDashboard;
