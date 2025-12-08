/**
 * Workflow Wizard Dashboard
 * Interactive workflow template creation and management with AI-powered generation
 */

import React, { useState, useEffect } from 'react';
import { Card, Tabs, Button, Table, Form, Input, message, Modal, Space, Tag, Descriptions } from 'antd';
import { 
  PlusOutlined, 
  PlayCircleOutlined, 
  DeleteOutlined, 
  EditOutlined,
  ThunderboltOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  CodeOutlined
} from '@ant-design/icons';
import { workflowWizardAPI } from '@/services/apiService';

const { TabPane } = Tabs;
const { TextArea } = Input;

const WorkflowWizardDashboard: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [schemaStatus, setSchemaStatus] = useState<any>(null);
  const [templates, setTemplates] = useState<any[]>([]);
  const [instances, setInstances] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [selectedInstance, setSelectedInstance] = useState<any>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'template' | 'instance' | 'generate'>('template');
  const [form] = Form.useForm();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [schemasRes, templatesRes, instancesRes] = await Promise.all([
        workflowWizardAPI.verifySchemas(),
        workflowWizardAPI.getTemplates(),
        workflowWizardAPI.getInstances()
      ]);
      
      setSchemaStatus(schemasRes);
      setTemplates(templatesRes);
      setInstances(instancesRes);
    } catch (error: any) {
      message.error(`Failed to load data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = () => {
    setModalType('template');
    setSelectedTemplate(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEditTemplate = (template: any) => {
    setModalType('template');
    setSelectedTemplate(template);
    form.setFieldsValue(template);
    setIsModalVisible(true);
  };

  const handleCreateInstance = () => {
    setModalType('instance');
    setSelectedInstance(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleGenerateWorkflow = () => {
    setModalType('generate');
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      if (modalType === 'template') {
        if (selectedTemplate) {
          await workflowWizardAPI.updateTemplate(selectedTemplate.id, values);
          message.success('Template updated successfully');
        } else {
          await workflowWizardAPI.createTemplate(values);
          message.success('Template created successfully');
        }
      } else if (modalType === 'instance') {
        await workflowWizardAPI.createInstance(values);
        message.success('Instance created successfully');
      } else if (modalType === 'generate') {
        const result = await workflowWizardAPI.generateFromPrompt(values.prompt);
        message.success('Workflow generated successfully');
        console.log('Generated workflow:', result);
      }

      setIsModalVisible(false);
      form.resetFields();
      await loadData();
    } catch (error: any) {
      message.error(`Operation failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    try {
      setLoading(true);
      await workflowWizardAPI.deleteTemplate(id);
      message.success('Template deleted successfully');
      await loadData();
    } catch (error: any) {
      message.error(`Delete failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteInstance = async (id: string) => {
    try {
      setLoading(true);
      const result = await workflowWizardAPI.executeInstance(id);
      message.success('Instance execution started');
      console.log('Execution result:', result);
      await loadData();
    } catch (error: any) {
      message.error(`Execution failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const templateColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Tasks',
      dataIndex: 'task_count',
      key: 'task_count',
      render: (count: number) => <Tag color="blue">{count || 0} tasks</Tag>,
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => date ? new Date(date).toLocaleDateString() : 'N/A',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space>
          <Button 
            icon={<EditOutlined />} 
            size="small" 
            onClick={() => handleEditTemplate(record)}
          >
            Edit
          </Button>
          <Button 
            icon={<DeleteOutlined />} 
            size="small" 
            danger 
            onClick={() => handleDeleteTemplate(record.id)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  const instanceColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Template',
      dataIndex: 'template_name',
      key: 'template_name',
      render: (name: string) => name || <Tag>Custom</Tag>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const color = status === 'completed' ? 'green' : status === 'running' ? 'blue' : 'default';
        return <Tag color={color}>{status || 'pending'}</Tag>;
      },
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => date ? new Date(date).toLocaleDateString() : 'N/A',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space>
          <Button 
            icon={<PlayCircleOutlined />} 
            size="small" 
            type="primary"
            onClick={() => handleExecuteInstance(record.id)}
            disabled={record.status === 'running'}
          >
            Execute
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <h1>Workflow Wizard Dashboard</h1>
      <p>Interactive workflow template creation and AI-powered generation</p>

      <Tabs defaultActiveKey="overview">
        <TabPane tab="Overview" key="overview">
          <Card title="Schema Status" loading={loading}>
            {schemaStatus && (
              <Descriptions column={2}>
                <Descriptions.Item label="Verified">
                  {schemaStatus.verified ? (
                    <Tag icon={<CheckCircleOutlined />} color="success">All schemas exist</Tag>
                  ) : (
                    <Tag icon={<CloseCircleOutlined />} color="error">
                      {schemaStatus.missing_count} missing
                    </Tag>
                  )}
                </Descriptions.Item>
                <Descriptions.Item label="Total Tables">
                  {schemaStatus.tables?.length || 0}
                </Descriptions.Item>
              </Descriptions>
            )}
          </Card>

          <Card 
            title="Quick Stats" 
            style={{ marginTop: 16 }}
            extra={
              <Button 
                type="primary" 
                icon={<ThunderboltOutlined />}
                onClick={handleGenerateWorkflow}
              >
                AI Generate
              </Button>
            }
          >
            <Space size="large">
              <div>
                <div style={{ fontSize: 24, fontWeight: 'bold' }}>{templates.length}</div>
                <div>Templates</div>
              </div>
              <div>
                <div style={{ fontSize: 24, fontWeight: 'bold' }}>{instances.length}</div>
                <div>Instances</div>
              </div>
              <div>
                <div style={{ fontSize: 24, fontWeight: 'bold' }}>
                  {instances.filter(i => i.status === 'running').length}
                </div>
                <div>Running</div>
              </div>
            </Space>
          </Card>
        </TabPane>

        <TabPane tab="Templates" key="templates">
          <Card
            title="Workflow Templates"
            extra={
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={handleCreateTemplate}
              >
                Create Template
              </Button>
            }
          >
            <Table
              columns={templateColumns}
              dataSource={templates}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </TabPane>

        <TabPane tab="Instances" key="instances">
          <Card
            title="Workflow Instances"
            extra={
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={handleCreateInstance}
              >
                Create Instance
              </Button>
            }
          >
            <Table
              columns={instanceColumns}
              dataSource={instances}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </TabPane>

        <TabPane tab="AI Generation" key="ai-generation">
          <Card 
            title="AI-Powered Workflow Generation"
            extra={
              <Button 
                type="primary" 
                icon={<ThunderboltOutlined />}
                onClick={handleGenerateWorkflow}
              >
                Generate Workflow
              </Button>
            }
          >
            <p>
              Use natural language to describe your workflow, and AI will generate the complete workflow 
              structure including tasks, dependencies, and configurations.
            </p>
            <div style={{ marginTop: 16 }}>
              <h4>Example Prompts:</h4>
              <ul>
                <li>"Create a data processing workflow with validation, transformation, and storage steps"</li>
                <li>"Build an onboarding workflow for new users with email verification and profile setup"</li>
                <li>"Design a content approval workflow with review, revision, and publication stages"</li>
              </ul>
            </div>
          </Card>
        </TabPane>
      </Tabs>

      <Modal
        title={
          modalType === 'template' ? (selectedTemplate ? 'Edit Template' : 'Create Template') :
          modalType === 'instance' ? 'Create Instance' :
          'Generate Workflow'
        }
        visible={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
        confirmLoading={loading}
        width={600}
      >
        <Form form={form} layout="vertical">
          {modalType === 'template' && (
            <>
              <Form.Item
                name="name"
                label="Template Name"
                rules={[{ required: true, message: 'Please enter template name' }]}
              >
                <Input placeholder="e.g., Data Processing Template" />
              </Form.Item>
              <Form.Item
                name="description"
                label="Description"
              >
                <TextArea rows={3} placeholder="Describe what this template does..." />
              </Form.Item>
              <Form.Item
                name="config"
                label="Configuration (JSON)"
              >
                <TextArea rows={6} placeholder='{"tasks": [], "dependencies": []}' />
              </Form.Item>
            </>
          )}

          {modalType === 'instance' && (
            <>
              <Form.Item
                name="name"
                label="Instance Name"
                rules={[{ required: true, message: 'Please enter instance name' }]}
              >
                <Input placeholder="e.g., Customer Data Processing" />
              </Form.Item>
              <Form.Item
                name="description"
                label="Description"
              >
                <TextArea rows={2} placeholder="Describe this instance..." />
              </Form.Item>
              <Form.Item
                name="templateId"
                label="Template ID (optional)"
              >
                <Input placeholder="Leave empty for custom workflow" />
              </Form.Item>
              <Form.Item
                name="prompt"
                label="AI Generation Prompt (optional)"
              >
                <TextArea rows={4} placeholder="Describe workflow to generate with AI..." />
              </Form.Item>
            </>
          )}

          {modalType === 'generate' && (
            <Form.Item
              name="prompt"
              label="Workflow Description"
              rules={[{ required: true, message: 'Please describe the workflow' }]}
            >
              <TextArea 
                rows={8} 
                placeholder="Describe the workflow you want to create in detail. Include steps, conditions, and any specific requirements..." 
              />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default WorkflowWizardDashboard;
