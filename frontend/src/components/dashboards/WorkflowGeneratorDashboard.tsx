/**
 * Workflow Generator Dashboard
 * 
 * Dashboard for automated workflow generation, configuration management,
 * and self-generating workflows from natural language prompts.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Row,
  Col,
  Button,
  Table,
  Tag,
  Space,
  Statistic,
  Input,
  Tabs,
  Modal,
  Form,
  List,
  Badge,
  Tooltip,
  Empty,
  message,
  Steps,
  Progress,
  Collapse,
} from 'antd';
import {
  RocketOutlined,
  PlayCircleOutlined,
  SettingOutlined,
  AppstoreOutlined,
  BuildOutlined,
  ThunderboltOutlined,
  CodeOutlined,
  PlusOutlined,
  ReloadOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  SaveOutlined,
  BranchesOutlined,
  ClusterOutlined,
  ApiOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import { workflowGeneratorAPI, ConfigSummary, WorkflowSetting, WorkflowSetup, GeneratedWorkflow } from '../../services/apiService';

const { TextArea } = Input;
const { TabPane } = Tabs;
const { Step } = Steps;
const { Panel } = Collapse;

export const WorkflowGeneratorDashboard: React.FC = () => {
  // State
  const [summary, setSummary] = useState<ConfigSummary | null>(null);
  const [settings, setSettings] = useState<WorkflowSetting[]>([]);
  const [setups, setSetups] = useState<WorkflowSetup[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('generate');
  
  // Modal states
  const [generateModalVisible, setGenerateModalVisible] = useState(false);
  const [settingModalVisible, setSettingModalVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [generatedWorkflow, setGeneratedWorkflow] = useState<GeneratedWorkflow | null>(null);
  
  const [form] = Form.useForm();
  const [settingForm] = Form.useForm();

  // Fetch data
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [summaryData, settingsData, setupsData] = await Promise.all([
        workflowGeneratorAPI.getConfigSummary(),
        workflowGeneratorAPI.getSettings(),
        workflowGeneratorAPI.getSetups(),
      ]);
      setSummary(summaryData);
      setSettings(settingsData);
      setSetups(setupsData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      message.error('Failed to load workflow data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handlers
  const handleGenerateWorkflow = async (values: any) => {
    setGenerating(true);
    try {
      const workflow = await workflowGeneratorAPI.generateWorkflow(values.prompt);
      setGeneratedWorkflow(workflow);
      message.success('Workflow generated successfully!');
      fetchData();
    } catch (error) {
      message.error('Failed to generate workflow');
    } finally {
      setGenerating(false);
    }
  };

  const handleExecuteWorkflow = async (name: string) => {
    try {
      await workflowGeneratorAPI.executeWorkflow(name);
      message.success('Workflow executed successfully');
    } catch (error) {
      message.error('Failed to execute workflow');
    }
  };

  const handleSaveSetting = async (values: any) => {
    try {
      await workflowGeneratorAPI.saveSetting(values.name, { value: values.value, description: values.description });
      message.success('Setting saved');
      setSettingModalVisible(false);
      settingForm.resetFields();
      fetchData();
    } catch (error) {
      message.error('Failed to save setting');
    }
  };

  const handleViewSetup = async (name: string) => {
    try {
      const setup = await workflowGeneratorAPI.getSetup(name);
      setSelectedItem(setup);
      setViewModalVisible(true);
    } catch (error) {
      message.error('Failed to load setup details');
    }
  };

  const handleCreateSelfGenerating = async (values: any) => {
    setGenerating(true);
    try {
      const workflow = await workflowGeneratorAPI.createSelfGeneratingWorkflow(values.prompt, {
        autoExecute: values.autoExecute,
        saveAsSetting: values.saveAsSetting,
      });
      setGeneratedWorkflow(workflow);
      message.success('Self-generating workflow created!');
      setGenerateModalVisible(false);
      form.resetFields();
      fetchData();
    } catch (error) {
      message.error('Failed to create self-generating workflow');
    } finally {
      setGenerating(false);
    }
  };

  // Table columns for settings
  const settingColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => (
        <Space>
          <SettingOutlined />
          <span>{name}</span>
        </Space>
      ),
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => date ? new Date(date).toLocaleDateString() : '-',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: WorkflowSetting) => (
        <Space>
          <Tooltip title="View">
            <Button size="small" icon={<EyeOutlined />} onClick={() => { setSelectedItem(record); setViewModalVisible(true); }} />
          </Tooltip>
          <Tooltip title="Edit">
            <Button size="small" icon={<EditOutlined />} />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // Table columns for setups
  const setupColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => (
        <Space>
          <AppstoreOutlined />
          <a onClick={() => handleViewSetup(name)}>{name}</a>
        </Space>
      ),
    },
    {
      title: 'Components',
      key: 'components',
      render: (_: any, record: WorkflowSetup) => (
        <Tag color="blue">{record.components?.length || 0}</Tag>
      ),
    },
    {
      title: 'Dashboards',
      key: 'dashboards',
      render: (_: any, record: WorkflowSetup) => (
        <Tag color="green">{record.dashboards?.length || 0}</Tag>
      ),
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => date ? new Date(date).toLocaleDateString() : '-',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: WorkflowSetup) => (
        <Space>
          <Tooltip title="View">
            <Button size="small" icon={<EyeOutlined />} onClick={() => handleViewSetup(record.name)} />
          </Tooltip>
          <Tooltip title="Execute">
            <Button size="small" type="primary" icon={<PlayCircleOutlined />} onClick={() => handleExecuteWorkflow(record.name)} />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Row gutter={[16, 16]}>
        {/* Header */}
        <Col span={24}>
          <Card>
            <Row justify="space-between" align="middle">
              <Col>
                <Space>
                  <BranchesOutlined style={{ fontSize: 24, color: '#1890ff' }} />
                  <div>
                    <h2 style={{ margin: 0 }}>Workflow Generator</h2>
                    <p style={{ margin: 0, color: '#666' }}>
                      Generate workflows from prompts and manage configurations
                    </p>
                  </div>
                </Space>
              </Col>
              <Col>
                <Space>
                  <Button icon={<ReloadOutlined />} onClick={fetchData} loading={loading}>
                    Refresh
                  </Button>
                  <Button icon={<SettingOutlined />} onClick={() => setSettingModalVisible(true)}>
                    Add Setting
                  </Button>
                  <Button
                    type="primary"
                    icon={<ThunderboltOutlined />}
                    onClick={() => setGenerateModalVisible(true)}
                  >
                    Generate Workflow
                  </Button>
                </Space>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Stats Cards */}
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Atoms"
              value={summary?.totalAtoms || 0}
              prefix={<CodeOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Components"
              value={summary?.totalComponents || 0}
              prefix={<BuildOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Dashboards"
              value={summary?.totalDashboards || 0}
              prefix={<AppstoreOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Setups"
              value={summary?.totalSetups || 0}
              prefix={<ClusterOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>

        {/* Main Content */}
        <Col span={24}>
          <Card>
            <Tabs activeKey={activeTab} onChange={setActiveTab}>
              <TabPane tab="Generate" key="generate">
                <Row gutter={[16, 16]}>
                  <Col xs={24} md={12}>
                    <Card title="Quick Generate" size="small">
                      <Form layout="vertical" onFinish={handleGenerateWorkflow}>
                        <Form.Item
                          name="prompt"
                          label="Describe your workflow"
                          rules={[{ required: true, message: 'Please enter a prompt' }]}
                        >
                          <TextArea
                            rows={4}
                            placeholder="e.g., Create a lead management dashboard with contact forms and analytics..."
                          />
                        </Form.Item>
                        <Form.Item>
                          <Button
                            type="primary"
                            htmlType="submit"
                            icon={<RocketOutlined />}
                            loading={generating}
                            block
                          >
                            Generate Workflow
                          </Button>
                        </Form.Item>
                      </Form>
                    </Card>
                  </Col>
                  <Col xs={24} md={12}>
                    {generatedWorkflow ? (
                      <Card title="Generated Workflow" size="small">
                        <p><strong>Name:</strong> {generatedWorkflow.name}</p>
                        <p><strong>Generated:</strong> {new Date(generatedWorkflow.generatedAt).toLocaleString()}</p>
                        <Row gutter={8} style={{ marginTop: 16 }}>
                          <Col span={6}>
                            <Statistic title="Tables" value={generatedWorkflow.tables?.length || 0} />
                          </Col>
                          <Col span={6}>
                            <Statistic title="Atoms" value={generatedWorkflow.atoms?.length || 0} />
                          </Col>
                          <Col span={6}>
                            <Statistic title="Components" value={generatedWorkflow.components?.length || 0} />
                          </Col>
                          <Col span={6}>
                            <Statistic title="Dashboards" value={generatedWorkflow.dashboards?.length || 0} />
                          </Col>
                        </Row>
                        <div style={{ marginTop: 16 }}>
                          <Button
                            type="primary"
                            icon={<PlayCircleOutlined />}
                            onClick={() => handleExecuteWorkflow(generatedWorkflow.name)}
                          >
                            Execute Workflow
                          </Button>
                        </div>
                      </Card>
                    ) : (
                      <Card size="small">
                        <Empty description="Generate a workflow to see results here" />
                      </Card>
                    )}
                  </Col>
                </Row>
              </TabPane>

              <TabPane tab="Setups" key="setups">
                {setups.length > 0 ? (
                  <Table
                    dataSource={setups}
                    columns={setupColumns}
                    rowKey="name"
                    pagination={{ pageSize: 10 }}
                    loading={loading}
                  />
                ) : (
                  <Empty description="No setups created yet">
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={() => setGenerateModalVisible(true)}
                    >
                      Create First Setup
                    </Button>
                  </Empty>
                )}
              </TabPane>

              <TabPane tab="Settings" key="settings">
                <Row gutter={16} style={{ marginBottom: 16 }}>
                  <Col>
                    <Button icon={<PlusOutlined />} onClick={() => setSettingModalVisible(true)}>
                      Add Setting
                    </Button>
                  </Col>
                </Row>
                {settings.length > 0 ? (
                  <Table
                    dataSource={settings}
                    columns={settingColumns}
                    rowKey="name"
                    pagination={{ pageSize: 10 }}
                    loading={loading}
                  />
                ) : (
                  <Empty description="No settings configured yet" />
                )}
              </TabPane>

              <TabPane tab="Bundler" key="bundler">
                <Row gutter={[16, 16]}>
                  <Col xs={24} md={8}>
                    <Card title="Bundle Atoms → Component" size="small">
                      <p style={{ color: '#666', fontSize: 12 }}>
                        Combine atomic elements into reusable components
                      </p>
                      <Button icon={<BuildOutlined />} block>
                        Create Component Bundle
                      </Button>
                    </Card>
                  </Col>
                  <Col xs={24} md={8}>
                    <Card title="Bundle Components → Dashboard" size="small">
                      <p style={{ color: '#666', fontSize: 12 }}>
                        Combine components into full dashboards
                      </p>
                      <Button icon={<AppstoreOutlined />} block>
                        Create Dashboard Bundle
                      </Button>
                    </Card>
                  </Col>
                  <Col xs={24} md={8}>
                    <Card title="Bundle Dashboards → Workflow" size="small">
                      <p style={{ color: '#666', fontSize: 12 }}>
                        Combine dashboards into automated workflows
                      </p>
                      <Button icon={<BranchesOutlined />} block>
                        Create Workflow Bundle
                      </Button>
                    </Card>
                  </Col>
                </Row>
                <Row style={{ marginTop: 24 }}>
                  <Col span={24}>
                    <Card title="Bundle Pipeline" size="small">
                      <Steps current={-1}>
                        <Step title="Atoms" description="Basic UI elements" icon={<CodeOutlined />} />
                        <Step title="Components" description="Bundled atoms" icon={<BuildOutlined />} />
                        <Step title="Dashboards" description="Bundled components" icon={<AppstoreOutlined />} />
                        <Step title="Workflows" description="Bundled dashboards" icon={<BranchesOutlined />} />
                      </Steps>
                    </Card>
                  </Col>
                </Row>
              </TabPane>
            </Tabs>
          </Card>
        </Col>
      </Row>

      {/* Generate Workflow Modal */}
      <Modal
        title="Generate Self-Executing Workflow"
        open={generateModalVisible}
        onCancel={() => {
          setGenerateModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateSelfGenerating}>
          <Form.Item
            name="prompt"
            label="Workflow Description"
            rules={[{ required: true, message: 'Please describe your workflow' }]}
          >
            <TextArea
              rows={4}
              placeholder="Describe what your workflow should do in natural language..."
            />
          </Form.Item>
          <Form.Item name="autoExecute" valuePropName="checked">
            <Space>
              <input type="checkbox" />
              <span>Auto-execute after generation</span>
            </Space>
          </Form.Item>
          <Form.Item name="saveAsSetting" valuePropName="checked">
            <Space>
              <input type="checkbox" />
              <span>Save as reusable setting</span>
            </Space>
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={generating} icon={<ThunderboltOutlined />}>
                Generate & Create
              </Button>
              <Button onClick={() => setGenerateModalVisible(false)}>Cancel</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Add Setting Modal */}
      <Modal
        title="Add Setting"
        open={settingModalVisible}
        onCancel={() => {
          setSettingModalVisible(false);
          settingForm.resetFields();
        }}
        footer={null}
        width={500}
      >
        <Form form={settingForm} layout="vertical" onFinish={handleSaveSetting}>
          <Form.Item
            name="name"
            label="Setting Name"
            rules={[{ required: true, message: 'Setting name is required' }]}
          >
            <Input placeholder="e.g., default-layout" />
          </Form.Item>
          <Form.Item name="value" label="Value">
            <TextArea rows={3} placeholder="Setting value (JSON or text)" />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input placeholder="Brief description of this setting" />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
                Save Setting
              </Button>
              <Button onClick={() => setSettingModalVisible(false)}>Cancel</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* View Details Modal */}
      <Modal
        title="Details"
        open={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setViewModalVisible(false)}>
            Close
          </Button>,
        ]}
        width={700}
      >
        {selectedItem && (
          <div>
            <p><strong>Name:</strong> {selectedItem.name}</p>
            {selectedItem.createdAt && (
              <p><strong>Created:</strong> {new Date(selectedItem.createdAt).toLocaleString()}</p>
            )}
            {selectedItem.components && (
              <div style={{ marginTop: 16 }}>
                <strong>Components ({selectedItem.components.length}):</strong>
                <List
                  size="small"
                  dataSource={selectedItem.components}
                  renderItem={(comp: any) => (
                    <List.Item>
                      <Space>
                        <BuildOutlined />
                        {comp.name || comp}
                      </Space>
                    </List.Item>
                  )}
                  locale={{ emptyText: 'No components' }}
                />
              </div>
            )}
            {selectedItem.dashboards && (
              <div style={{ marginTop: 16 }}>
                <strong>Dashboards ({selectedItem.dashboards.length}):</strong>
                <List
                  size="small"
                  dataSource={selectedItem.dashboards}
                  renderItem={(dash: any) => (
                    <List.Item>
                      <Space>
                        <AppstoreOutlined />
                        {dash.name || dash}
                      </Space>
                    </List.Item>
                  )}
                  locale={{ emptyText: 'No dashboards' }}
                />
              </div>
            )}
            {selectedItem.config && (
              <div style={{ marginTop: 16 }}>
                <strong>Configuration:</strong>
                <pre style={{ background: '#f5f5f5', padding: 12, borderRadius: 4, fontSize: 12 }}>
                  {JSON.stringify(selectedItem.config, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default WorkflowGeneratorDashboard;
