/**
 * Base Workflow Component
 * 
 * Complete CRUD component for workflows with:
 * - Create, Read, Update, Delete workflows
 * - Service coupling and management
 * - Data stream configuration
 * - Campaign orchestration
 * - Real-time monitoring
 * 
 * This is the foundational component for building large-scale campaigns
 * by coupling multiple services together.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Form,
  Input,
  Select,
  Button,
  Space,
  message,
  Table,
  Modal,
  Tabs,
  Tag,
  Tooltip,
  Divider,
  Row,
  Col,
  Switch,
  InputNumber,
  List,
  Badge,
  Progress,
  Alert,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  StopOutlined,
  SaveOutlined,
  EyeOutlined,
  LinkOutlined,
  ApiOutlined,
  DashboardOutlined,
} from '@ant-design/icons';

const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

// TypeScript Interfaces
interface Workflow {
  workflow_id: string;
  name: string;
  description?: string;
  workflow_type: 'root' | 'composite' | 'atomic';
  category: string;
  status: 'draft' | 'active' | 'paused' | 'archived';
  parent_workflow_id?: string;
  hierarchy_level: number;
  config?: any;
  metadata?: any;
  auto_schema?: any;
}

interface Service {
  service_id: string;
  workflow_id: string;
  name: string;
  service_type: 'api' | 'data-processor' | 'ai-engine' | 'database' | 'notification';
  input_attributes: any[];
  output_attributes: any[];
  supports_realtime: boolean;
  is_active: boolean;
}

interface DataStream {
  stream_id: string;
  name: string;
  source_service_id: string;
  destination_service_id: string;
  stream_type: 'websocket' | 'sse' | 'polling' | 'webhook';
  direction: 'source-to-destination' | 'destination-to-source' | 'bidirectional';
  is_active: boolean;
  total_messages_sent?: number;
  total_messages_received?: number;
}

export const BaseWorkflowComponent: React.FC = () => {
  // State Management
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [currentWorkflow, setCurrentWorkflow] = useState<Workflow | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [streams, setStreams] = useState<DataStream[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  
  // Forms
  const [workflowForm] = Form.useForm();
  const [serviceForm] = Form.useForm();
  const [streamForm] = Form.useForm();

  // Load data on mount
  useEffect(() => {
    loadWorkflows();
  }, []);

  // Load services and streams when workflow changes
  useEffect(() => {
    if (currentWorkflow) {
      loadServices(currentWorkflow.workflow_id);
      loadStreams(currentWorkflow.workflow_id);
    }
  }, [currentWorkflow]);

  /**
   * CRUD Operations - Workflows
   */

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

  const createWorkflow = async (values: any) => {
    try {
      const response = await fetch('/api/workflow-hierarchy/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const data = await response.json();
      if (data.success) {
        message.success(`Workflow "${values.name}" created successfully`);
        setModalVisible(false);
        workflowForm.resetFields();
        loadWorkflows();
        setCurrentWorkflow(data.workflow);
      }
    } catch (error) {
      message.error('Failed to create workflow');
      console.error(error);
    }
  };

  const updateWorkflow = async (workflowId: string, values: any) => {
    try {
      const response = await fetch(`/api/workflow-hierarchy/workflows/${workflowId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const data = await response.json();
      if (data.success) {
        message.success('Workflow updated successfully');
        setModalVisible(false);
        workflowForm.resetFields();
        loadWorkflows();
        setCurrentWorkflow(data.workflow);
      }
    } catch (error) {
      message.error('Failed to update workflow');
      console.error(error);
    }
  };

  const deleteWorkflow = async (workflowId: string) => {
    Modal.confirm({
      title: 'Delete Workflow',
      content: 'Are you sure? This will delete all associated services and streams.',
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          const response = await fetch(`/api/workflow-hierarchy/workflows/${workflowId}`, {
            method: 'DELETE',
          });
          const data = await response.json();
          if (data.success) {
            message.success('Workflow deleted');
            loadWorkflows();
            if (currentWorkflow?.workflow_id === workflowId) {
              setCurrentWorkflow(null);
            }
          }
        } catch (error) {
          message.error('Failed to delete workflow');
          console.error(error);
        }
      },
    });
  };

  /**
   * CRUD Operations - Services
   */

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

  const createService = async (values: any) => {
    try {
      const response = await fetch('/api/workflow-hierarchy/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...values,
          workflow_id: currentWorkflow?.workflow_id,
        }),
      });
      const data = await response.json();
      if (data.success) {
        message.success(`Service "${values.name}" created`);
        serviceForm.resetFields();
        if (currentWorkflow) {
          loadServices(currentWorkflow.workflow_id);
        }
      }
    } catch (error) {
      message.error('Failed to create service');
      console.error(error);
    }
  };

  const deleteService = async (serviceId: string) => {
    Modal.confirm({
      title: 'Delete Service',
      content: 'This will also delete all connected data streams.',
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          const response = await fetch(`/api/workflow-hierarchy/services/${serviceId}`, {
            method: 'DELETE',
          });
          const data = await response.json();
          if (data.success) {
            message.success('Service deleted');
            if (currentWorkflow) {
              loadServices(currentWorkflow.workflow_id);
              loadStreams(currentWorkflow.workflow_id);
            }
          }
        } catch (error) {
          message.error('Failed to delete service');
          console.error(error);
        }
      },
    });
  };

  /**
   * CRUD Operations - Data Streams
   */

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

  const createDataStream = async (values: any) => {
    try {
      const response = await fetch('/api/workflow-hierarchy/streams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const data = await response.json();
      if (data.success) {
        message.success(`Data stream "${values.name}" created`);
        streamForm.resetFields();
        if (currentWorkflow) {
          loadStreams(currentWorkflow.workflow_id);
        }
      }
    } catch (error) {
      message.error('Failed to create data stream');
      console.error(error);
    }
  };

  /**
   * Campaign Coupling - Connect Multiple Services
   */

  const coupleServicesForCampaign = async () => {
    if (!currentWorkflow || services.length < 2) {
      message.warning('Need at least 2 services to couple');
      return;
    }

    Modal.confirm({
      title: 'Auto-Couple Services',
      content: `This will create data streams connecting all ${services.length} services in sequence. Continue?`,
      onOk: async () => {
        try {
          // Create sequential pipeline: Service1 → Service2 → Service3 → ...
          for (let i = 0; i < services.length - 1; i++) {
            const source = services[i];
            const destination = services[i + 1];

            await fetch('/api/workflow-hierarchy/streams', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                name: `${source.name} → ${destination.name}`,
                source_service_id: source.service_id,
                destination_service_id: destination.service_id,
                stream_type: 'websocket',
                direction: 'source-to-destination',
                data_format: 'json',
                is_active: true,
              }),
            });
          }

          message.success('Services coupled successfully!');
          if (currentWorkflow) {
            loadStreams(currentWorkflow.workflow_id);
          }
        } catch (error) {
          message.error('Failed to couple services');
          console.error(error);
        }
      },
    });
  };

  /**
   * Workflow Execution Control
   */

  const executeWorkflow = async (workflowId: string) => {
    try {
      const response = await fetch(`/api/workflow-hierarchy/workflows/${workflowId}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      if (data.success) {
        message.success('Workflow execution started');
      }
    } catch (error) {
      message.error('Failed to execute workflow');
      console.error(error);
    }
  };

  const pauseWorkflow = async (workflowId: string) => {
    try {
      await updateWorkflow(workflowId, { status: 'paused' });
      message.success('Workflow paused');
    } catch (error) {
      message.error('Failed to pause workflow');
    }
  };

  const stopWorkflow = async (workflowId: string) => {
    Modal.confirm({
      title: 'Stop Workflow',
      content: 'This will stop all running tasks. Continue?',
      okText: 'Stop',
      okType: 'danger',
      onOk: async () => {
        try {
          await updateWorkflow(workflowId, { status: 'draft' });
          message.success('Workflow stopped');
        } catch (error) {
          message.error('Failed to stop workflow');
        }
      },
    });
  };

  // Table Columns
  const workflowColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Workflow) => (
        <Space>
          <strong>{text}</strong>
          <Tag>{record.workflow_type}</Tag>
        </Space>
      ),
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
      render: (status: string) => {
        const colorMap: Record<string, string> = {
          draft: 'default',
          active: 'success',
          paused: 'warning',
          archived: 'error',
        };
        return <Tag color={colorMap[status]}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Workflow) => (
        <Space>
          <Tooltip title="View">
            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={() => setCurrentWorkflow(record)}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => {
                setModalMode('edit');
                setCurrentWorkflow(record);
                workflowForm.setFieldsValue(record);
                setModalVisible(true);
              }}
            />
          </Tooltip>
          {record.status === 'active' && (
            <Tooltip title="Pause">
              <Button
                size="small"
                icon={<PauseCircleOutlined />}
                onClick={() => pauseWorkflow(record.workflow_id)}
              />
            </Tooltip>
          )}
          {record.status === 'paused' && (
            <Tooltip title="Resume">
              <Button
                size="small"
                icon={<PlayCircleOutlined />}
                onClick={() => updateWorkflow(record.workflow_id, { status: 'active' })}
                type="primary"
              />
            </Tooltip>
          )}
          <Tooltip title="Delete">
            <Button
              size="small"
              icon={<DeleteOutlined />}
              danger
              onClick={() => deleteWorkflow(record.workflow_id)}
            />
          </Tooltip>
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
        <Badge status={realtime ? 'success' : 'default'} text={realtime ? 'Yes' : 'No'} />
      ),
    },
    {
      title: 'Status',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (active: boolean) => <Badge status={active ? 'success' : 'error'} text={active ? 'Active' : 'Inactive'} />,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Service) => (
        <Button size="small" icon={<DeleteOutlined />} danger onClick={() => deleteService(record.service_id)} />
      ),
    },
  ];

  const streamColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Type',
      dataIndex: 'stream_type',
      key: 'stream_type',
      render: (type: string) => <Tag color="purple">{type}</Tag>,
    },
    {
      title: 'Direction',
      dataIndex: 'direction',
      key: 'direction',
      render: (dir: string) => {
        const icon = dir === 'bidirectional' ? '↔' : '→';
        return <span>{icon} {dir}</span>;
      },
    },
    {
      title: 'Messages',
      key: 'messages',
      render: (_: any, record: DataStream) => (
        <Space>
          <Tag>↑ {record.total_messages_sent || 0}</Tag>
          <Tag>↓ {record.total_messages_received || 0}</Tag>
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (active: boolean) => <Badge status={active ? 'processing' : 'default'} text={active ? 'Streaming' : 'Inactive'} />,
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card
        title="Workflow Campaign Manager"
        extra={
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setModalMode('create');
                setCurrentWorkflow(null);
                workflowForm.resetFields();
                setModalVisible(true);
              }}
            >
              Create Workflow
            </Button>
          </Space>
        }
      >
        <Tabs>
          <TabPane tab="Workflows" key="workflows">
            <Table
              columns={workflowColumns}
              dataSource={workflows}
              rowKey="workflow_id"
              loading={loading}
              pagination={{ pageSize: 10 }}
            />
          </TabPane>

          <TabPane tab="Campaign Builder" key="builder" disabled={!currentWorkflow}>
            {currentWorkflow && (
              <div>
                <Alert
                  message={`Building Campaign: ${currentWorkflow.name}`}
                  description={`Status: ${currentWorkflow.status} | Type: ${currentWorkflow.workflow_type}`}
                  type="info"
                  showIcon
                  style={{ marginBottom: 16 }}
                />

                <Row gutter={16}>
                  <Col span={12}>
                    <Card
                      title="Services"
                      size="small"
                      extra={
                        <Button
                          size="small"
                          icon={<PlusOutlined />}
                          onClick={() => Modal.info({
                            title: 'Add Service',
                            content: (
                              <Form form={serviceForm} layout="vertical" onFinish={createService}>
                                <Form.Item name="name" label="Service Name" rules={[{ required: true }]}>
                                  <Input />
                                </Form.Item>
                                <Form.Item name="service_type" label="Type" rules={[{ required: true }]}>
                                  <Select>
                                    <Option value="api">API</Option>
                                    <Option value="data-processor">Data Processor</Option>
                                    <Option value="ai-engine">AI Engine</Option>
                                    <Option value="database">Database</Option>
                                    <Option value="notification">Notification</Option>
                                  </Select>
                                </Form.Item>
                                <Form.Item name="supports_realtime" label="Real-time" valuePropName="checked">
                                  <Switch />
                                </Form.Item>
                                <Button type="primary" htmlType="submit">Create</Button>
                              </Form>
                            ),
                            width: 500,
                          })}
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
                      {services.length >= 2 && (
                        <div style={{ marginTop: 16 }}>
                          <Button
                            type="primary"
                            icon={<LinkOutlined />}
                            onClick={coupleServicesForCampaign}
                            block
                          >
                            Auto-Couple Services ({services.length} services)
                          </Button>
                        </div>
                      )}
                    </Card>
                  </Col>

                  <Col span={12}>
                    <Card title="Data Streams" size="small">
                      <Table
                        columns={streamColumns}
                        dataSource={streams}
                        rowKey="stream_id"
                        size="small"
                        pagination={false}
                      />
                    </Card>
                  </Col>
                </Row>

                <Divider />

                <Space>
                  <Button
                    type="primary"
                    icon={<PlayCircleOutlined />}
                    onClick={() => executeWorkflow(currentWorkflow.workflow_id)}
                    disabled={currentWorkflow.status !== 'active'}
                  >
                    Execute Campaign
                  </Button>
                  <Button
                    icon={<PauseCircleOutlined />}
                    onClick={() => pauseWorkflow(currentWorkflow.workflow_id)}
                    disabled={currentWorkflow.status !== 'active'}
                  >
                    Pause
                  </Button>
                  <Button
                    icon={<StopOutlined />}
                    onClick={() => stopWorkflow(currentWorkflow.workflow_id)}
                    danger
                  >
                    Stop
                  </Button>
                </Space>
              </div>
            )}
          </TabPane>
        </Tabs>
      </Card>

      {/* Create/Edit Workflow Modal */}
      <Modal
        title={modalMode === 'create' ? 'Create Workflow' : 'Edit Workflow'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={workflowForm}
          layout="vertical"
          onFinish={(values) => {
            if (modalMode === 'create') {
              createWorkflow(values);
            } else if (currentWorkflow) {
              updateWorkflow(currentWorkflow.workflow_id, values);
            }
          }}
        >
          <Form.Item name="name" label="Workflow Name" rules={[{ required: true }]}>
            <Input placeholder="Q4 Marketing Campaign" />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <TextArea rows={3} placeholder="Describe your workflow..." />
          </Form.Item>
          <Form.Item name="workflow_type" label="Type" rules={[{ required: true }]}>
            <Select>
              <Option value="root">Root - Top-level campaign</Option>
              <Option value="composite">Composite - Multi-stage workflow</Option>
              <Option value="atomic">Atomic - Single-purpose task</Option>
            </Select>
          </Form.Item>
          <Form.Item name="category" label="Category" rules={[{ required: true }]}>
            <Select>
              <Option value="seo">SEO</Option>
              <Option value="data-mining">Data Mining</Option>
              <Option value="ai-content">AI Content</Option>
              <Option value="analytics">Analytics</Option>
              <Option value="automation">Automation</Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
                {modalMode === 'create' ? 'Create' : 'Update'}
              </Button>
              <Button onClick={() => setModalVisible(false)}>Cancel</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default BaseWorkflowComponent;
