import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Button,
  Input,
  Select,
  Progress,
  Timeline,
  Tag,
  Space,
  Typography,
  Tabs,
  List,
  Badge,
  Modal,
  Form,
  message,
  Statistic,
  Alert,
  Spin
} from 'antd';
import {
  RocketOutlined,
  BulbOutlined,
  CodeOutlined,
  DashboardOutlined,
  MonitorOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined,
  EyeOutlined,
  SettingOutlined,
  FileTextOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

/**
 * Ollama & n8n Automation Dashboard
 * 
 * Provides interface for:
 * - Testing Ollama setup
 * - Using prompt engineering templates
 * - Building n8n workflows
 * - Generating design system components
 * - Monitoring workflow execution
 */
export const OllamaN8nDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [ollamaStatus, setOllamaStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [n8nStatus, setN8nStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [componentDescription, setComponentDescription] = useState('');
  const [dashboardDescription, setDashboardDescription] = useState('');
  const [buildProgress, setBuildProgress] = useState(0);
  const [buildLog, setBuildLog] = useState<Array<{time: string, message: string, type: 'info' | 'success' | 'error'}>>([]);
  const [isBuilding, setIsBuilding] = useState(false);
  const [workflows, setWorkflows] = useState<Array<{id: string, name: string, status: string, lastRun?: string}>>([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [templateParams, setTemplateParams] = useState<Record<string, string>>({});

  // Simulate status checks
  useEffect(() => {
    // Check Ollama status
    setTimeout(() => {
      setOllamaStatus('online'); // In real app, make API call
    }, 1000);

    // Check n8n status
    setTimeout(() => {
      setN8nStatus('online'); // In real app, make API call
    }, 1500);

    // Load workflows
    setWorkflows([
      { id: '1', name: 'Component Generator', status: 'active', lastRun: '2 hours ago' },
      { id: '2', name: 'Dashboard Builder', status: 'active', lastRun: '1 day ago' },
      { id: '3', name: 'Workflow Monitor', status: 'idle' }
    ]);
  }, []);

  const templates = [
    { id: 'generate_component', name: 'Generate Component', category: 'Design System' },
    { id: 'generate_dashboard_workflow', name: 'Generate Dashboard Workflow', category: 'Design System' },
    { id: 'create_workflow_from_description', name: 'Create n8n Workflow', category: 'Workflow' },
    { id: 'analyze_dom_structure', name: 'Analyze DOM Structure', category: 'Optimization' },
    { id: 'code_review', name: 'Code Review', category: 'Analysis' }
  ];

  const handleBuildComponent = () => {
    if (!componentDescription.trim()) {
      message.warning('Please enter a component description');
      return;
    }

    setIsBuilding(true);
    setBuildProgress(0);
    setBuildLog([]);

    // Simulate build process
    const steps = [
      { progress: 20, message: 'Loading design system tokens...', type: 'info' as const },
      { progress: 40, message: 'Generating component with Ollama...', type: 'info' as const },
      { progress: 60, message: 'Validating TypeScript code...', type: 'info' as const },
      { progress: 80, message: 'Adding accessibility features...', type: 'info' as const },
      { progress: 100, message: 'Component generated successfully!', type: 'success' as const }
    ];

    steps.forEach((step, index) => {
      setTimeout(() => {
        setBuildProgress(step.progress);
        setBuildLog(prev => [...prev, {
          time: new Date().toLocaleTimeString(),
          message: step.message,
          type: step.type
        }]);

        if (index === steps.length - 1) {
          setIsBuilding(false);
          message.success('Component built successfully!');
        }
      }, (index + 1) * 1000);
    });
  };

  const handleBuildDashboard = () => {
    if (!dashboardDescription.trim()) {
      message.warning('Please enter a dashboard description');
      return;
    }

    setIsBuilding(true);
    setBuildProgress(0);
    setBuildLog([]);

    // Simulate progressive build
    const components = ['HeaderComponent', 'ChartWidget', 'DataTable', 'FilterPanel', 'FooterComponent'];
    
    components.forEach((component, index) => {
      setTimeout(() => {
        const progress = ((index + 1) / components.length) * 100;
        setBuildProgress(progress);
        setBuildLog(prev => [...prev, {
          time: new Date().toLocaleTimeString(),
          message: `[${index + 1}/${components.length}] Generating ${component}...`,
          type: 'info'
        }]);

        if (index === components.length - 1) {
          setTimeout(() => {
            setBuildLog(prev => [...prev, {
              time: new Date().toLocaleTimeString(),
              message: 'Dashboard assembled successfully!',
              type: 'success'
            }]);
            setIsBuilding(false);
            message.success('Dashboard built successfully!');
          }, 500);
        }
      }, (index + 1) * 1500);
    });
  };

  const handleExecuteTemplate = () => {
    if (!selectedTemplate) {
      message.warning('Please select a template');
      return;
    }

    message.success(`Executing template: ${templates.find(t => t.id === selectedTemplate)?.name}`);
    setBuildLog(prev => [...prev, {
      time: new Date().toLocaleTimeString(),
      message: `Template "${templates.find(t => t.id === selectedTemplate)?.name}" executed`,
      type: 'success'
    }]);
  };

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <Title level={2}>
            <RocketOutlined /> Ollama & n8n Automation
          </Title>
          <Paragraph>
            Build components and dashboards using AI, generate n8n workflows, and monitor execution in real-time.
          </Paragraph>
        </div>

        {/* Status Cards */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Ollama Status"
                value={ollamaStatus === 'online' ? 'Online' : ollamaStatus === 'offline' ? 'Offline' : 'Checking'}
                valueStyle={{ color: ollamaStatus === 'online' ? '#3f8600' : '#cf1322' }}
                prefix={ollamaStatus === 'checking' ? <SyncOutlined spin /> : 
                        ollamaStatus === 'online' ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="n8n Status"
                value={n8nStatus === 'online' ? 'Online' : n8nStatus === 'offline' ? 'Offline' : 'Checking'}
                valueStyle={{ color: n8nStatus === 'online' ? '#3f8600' : '#cf1322' }}
                prefix={n8nStatus === 'checking' ? <SyncOutlined spin /> : 
                        n8nStatus === 'online' ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Active Workflows"
                value={workflows.filter(w => w.status === 'active').length}
                suffix={`/ ${workflows.length}`}
                prefix={<DashboardOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Templates"
                value={templates.length}
                prefix={<FileTextOutlined />}
              />
            </Card>
          </Col>
        </Row>

        {/* Main Content */}
        <Card>
          <Tabs activeKey={activeTab} onChange={setActiveTab}>
            <TabPane tab={<span><DashboardOutlined /> Overview</span>} key="overview">
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <Alert
                    message="Quick Start"
                    description={
                      <div>
                        <p>Welcome to the Ollama & n8n Automation Dashboard! Here's what you can do:</p>
                        <ul>
                          <li><strong>Component Builder:</strong> Generate single React components from descriptions</li>
                          <li><strong>Dashboard Builder:</strong> Build complete dashboards progressively</li>
                          <li><strong>Prompt Templates:</strong> Use pre-built AI prompt templates</li>
                          <li><strong>Workflow Monitor:</strong> Monitor n8n workflow execution in real-time</li>
                        </ul>
                      </div>
                    }
                    type="info"
                    showIcon
                  />
                </Col>

                <Col xs={24} md={12}>
                  <Card title="Recent Activity" size="small">
                    <Timeline>
                      <Timeline.Item color="green">
                        Component "DataTable" generated
                        <br />
                        <Text type="secondary">2 hours ago</Text>
                      </Timeline.Item>
                      <Timeline.Item color="blue">
                        Dashboard workflow created
                        <br />
                        <Text type="secondary">1 day ago</Text>
                      </Timeline.Item>
                      <Timeline.Item color="gray">
                        Template "code_review" executed
                        <br />
                        <Text type="secondary">2 days ago</Text>
                      </Timeline.Item>
                    </Timeline>
                  </Card>
                </Col>

                <Col xs={24} md={12}>
                  <Card title="Workflows" size="small">
                    <List
                      dataSource={workflows}
                      renderItem={item => (
                        <List.Item
                          actions={[
                            <Button size="small" icon={<EyeOutlined />}>View</Button>,
                            <Button size="small" type="primary" icon={<PlayCircleOutlined />}>Run</Button>
                          ]}
                        >
                          <List.Item.Meta
                            title={item.name}
                            description={item.lastRun ? `Last run: ${item.lastRun}` : 'Never run'}
                          />
                          <Badge status={item.status === 'active' ? 'success' : 'default'} text={item.status} />
                        </List.Item>
                      )}
                    />
                  </Card>
                </Col>
              </Row>
            </TabPane>

            <TabPane tab={<span><CodeOutlined /> Component Builder</span>} key="component">
              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <Card title="Build Component" size="small">
                    <Form layout="vertical">
                      <Form.Item label="Component Description">
                        <TextArea
                          rows={4}
                          placeholder="e.g., A button component with primary, secondary, and danger variants, loading state, and icon support"
                          value={componentDescription}
                          onChange={e => setComponentDescription(e.target.value)}
                          disabled={isBuilding}
                        />
                      </Form.Item>
                      <Form.Item>
                        <Space>
                          <Button
                            type="primary"
                            icon={<BulbOutlined />}
                            onClick={handleBuildComponent}
                            loading={isBuilding}
                          >
                            Generate Component
                          </Button>
                          <Button onClick={() => setComponentDescription('')} disabled={isBuilding}>
                            Clear
                          </Button>
                        </Space>
                      </Form.Item>
                    </Form>

                    {isBuilding && (
                      <div style={{ marginTop: 16 }}>
                        <Text strong>Progress:</Text>
                        <Progress percent={buildProgress} status="active" />
                      </div>
                    )}
                  </Card>
                </Col>

                <Col xs={24} md={12}>
                  <Card title="Build Log" size="small">
                    <div style={{ maxHeight: 300, overflow: 'auto' }}>
                      {buildLog.length === 0 ? (
                        <Text type="secondary">No build activity yet</Text>
                      ) : (
                        <Timeline>
                          {buildLog.map((log, index) => (
                            <Timeline.Item
                              key={index}
                              color={log.type === 'success' ? 'green' : log.type === 'error' ? 'red' : 'blue'}
                            >
                              <Text type="secondary">{log.time}</Text>
                              <br />
                              {log.message}
                            </Timeline.Item>
                          ))}
                        </Timeline>
                      )}
                    </div>
                  </Card>
                </Col>
              </Row>
            </TabPane>

            <TabPane tab={<span><DashboardOutlined /> Dashboard Builder</span>} key="dashboard">
              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <Card title="Build Dashboard" size="small">
                    <Form layout="vertical">
                      <Form.Item label="Dashboard Description">
                        <TextArea
                          rows={4}
                          placeholder="e.g., Analytics dashboard with revenue chart, user metrics cards, activity feed, and filter panel"
                          value={dashboardDescription}
                          onChange={e => setDashboardDescription(e.target.value)}
                          disabled={isBuilding}
                        />
                      </Form.Item>
                      <Form.Item>
                        <Space>
                          <Button
                            type="primary"
                            icon={<RocketOutlined />}
                            onClick={handleBuildDashboard}
                            loading={isBuilding}
                          >
                            Build Dashboard
                          </Button>
                          <Button onClick={() => setDashboardDescription('')} disabled={isBuilding}>
                            Clear
                          </Button>
                        </Space>
                      </Form.Item>
                    </Form>

                    {isBuilding && (
                      <div style={{ marginTop: 16 }}>
                        <Text strong>Progressive Build:</Text>
                        <Progress percent={buildProgress} status="active" />
                      </div>
                    )}
                  </Card>
                </Col>

                <Col xs={24} md={12}>
                  <Card title="Build Log" size="small">
                    <div style={{ maxHeight: 300, overflow: 'auto' }}>
                      {buildLog.length === 0 ? (
                        <Text type="secondary">No build activity yet</Text>
                      ) : (
                        <Timeline>
                          {buildLog.map((log, index) => (
                            <Timeline.Item
                              key={index}
                              color={log.type === 'success' ? 'green' : log.type === 'error' ? 'red' : 'blue'}
                            >
                              <Text type="secondary">{log.time}</Text>
                              <br />
                              {log.message}
                            </Timeline.Item>
                          ))}
                        </Timeline>
                      )}
                    </div>
                  </Card>
                </Col>
              </Row>
            </TabPane>

            <TabPane tab={<span><FileTextOutlined /> Prompt Templates</span>} key="templates">
              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <Card title="Execute Template" size="small">
                    <Form layout="vertical">
                      <Form.Item label="Select Template">
                        <Select
                          placeholder="Choose a prompt template"
                          value={selectedTemplate}
                          onChange={setSelectedTemplate}
                          style={{ width: '100%' }}
                        >
                          {templates.map(template => (
                            <Option key={template.id} value={template.id}>
                              <Tag color="blue">{template.category}</Tag> {template.name}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                      {selectedTemplate && (
                        <Form.Item label="Template Parameters">
                          <Input placeholder="Enter parameters as needed" />
                        </Form.Item>
                      )}
                      <Form.Item>
                        <Button
                          type="primary"
                          icon={<PlayCircleOutlined />}
                          onClick={handleExecuteTemplate}
                        >
                          Execute Template
                        </Button>
                      </Form.Item>
                    </Form>
                  </Card>
                </Col>

                <Col xs={24} md={12}>
                  <Card title="Available Templates" size="small">
                    <List
                      dataSource={templates}
                      renderItem={template => (
                        <List.Item>
                          <List.Item.Meta
                            title={template.name}
                            description={<Tag color="blue">{template.category}</Tag>}
                          />
                        </List.Item>
                      )}
                    />
                  </Card>
                </Col>
              </Row>
            </TabPane>

            <TabPane tab={<span><MonitorOutlined /> Workflow Monitor</span>} key="monitor">
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <Card title="Active Workflows" size="small">
                    <List
                      dataSource={workflows}
                      renderItem={workflow => (
                        <List.Item
                          actions={[
                            <Button size="small" icon={<EyeOutlined />}>Monitor</Button>,
                            <Button size="small" icon={<SettingOutlined />}>Configure</Button>
                          ]}
                        >
                          <List.Item.Meta
                            title={workflow.name}
                            description={
                              <Space>
                                <Badge status={workflow.status === 'active' ? 'success' : 'default'} text={workflow.status} />
                                {workflow.lastRun && <Text type="secondary">Last run: {workflow.lastRun}</Text>}
                              </Space>
                            }
                          />
                        </List.Item>
                      )}
                    />
                  </Card>
                </Col>
              </Row>
            </TabPane>
          </Tabs>
        </Card>

        {/* Quick Actions */}
        <Card style={{ marginTop: 24 }} title="Quick Actions">
          <Space wrap>
            <Button icon={<BulbOutlined />} onClick={() => setActiveTab('component')}>
              Generate Component
            </Button>
            <Button icon={<RocketOutlined />} onClick={() => setActiveTab('dashboard')}>
              Build Dashboard
            </Button>
            <Button icon={<FileTextOutlined />} onClick={() => setActiveTab('templates')}>
              Use Template
            </Button>
            <Button icon={<MonitorOutlined />} onClick={() => setActiveTab('monitor')}>
              Monitor Workflows
            </Button>
            <Button icon={<SettingOutlined />}>Settings</Button>
          </Space>
        </Card>
      </div>
    </div>
  );
};

export default OllamaN8nDashboard;
