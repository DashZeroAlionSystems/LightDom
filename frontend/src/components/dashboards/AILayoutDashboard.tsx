import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Button, Modal, Form, Input, Select, Tag, message, Space, Alert, Divider } from 'antd';
import { LayoutOutlined, BulbOutlined, DatabaseOutlined, AppstoreOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { aiLayoutAPI } from '../../services/apiService';

const { TextArea } = Input;
const { Option } = Select;

const AILayoutDashboard: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [generatedLayout, setGeneratedLayout] = useState<any>(null);
  const [layoutHistory, setLayoutHistory] = useState<any[]>([]);
  const [components, setComponents] = useState<any[]>([]);
  const [schemas, setSchemas] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<string>('generator');
  
  // Generator form state
  const [prompt, setPrompt] = useState('');
  const [selectedComponents, setSelectedComponents] = useState<string[]>([]);
  const [provider, setProvider] = useState('ollama');
  const [selectedSchema, setSelectedSchema] = useState<string | null>(null);
  const [currentLayout, setCurrentLayout] = useState<any>(null);

  // Load initial data
  useEffect(() => {
    loadComponents();
    loadSchemas();
    loadHistory();
  }, []);

  const loadComponents = async () => {
    try {
      const result = await aiLayoutAPI.getComponents();
      setComponents(result.components || []);
    } catch (error) {
      message.error('Failed to load components');
    }
  };

  const loadSchemas = async () => {
    try {
      const result = await aiLayoutAPI.getSchemas();
      setSchemas(result.schemas || []);
    } catch (error) {
      message.error('Failed to load schemas');
    }
  };

  const loadHistory = async () => {
    try {
      const result = await aiLayoutAPI.getHistory();
      setLayoutHistory(result.history || []);
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  };

  const handleGenerateLayout = async () => {
    if (!prompt || selectedComponents.length === 0) {
      message.warning('Please enter a prompt and select at least one component');
      return;
    }

    setLoading(true);
    try {
      const result = await aiLayoutAPI.generateLayout({
        prompt,
        selectedComponents,
        currentLayout,
        provider,
        schema: selectedSchema
      });
      
      setGeneratedLayout(result.layout);
      message.success(`Layout generated successfully using ${result.provider}`);
      loadHistory(); // Refresh history
    } catch (error: any) {
      message.error(error.message || 'Failed to generate layout');
    } finally {
      setLoading(false);
    }
  };

  const handleOptimizeLayout = async () => {
    if (!generatedLayout) {
      message.warning('Please generate a layout first');
      return;
    }

    setLoading(true);
    try {
      const result = await aiLayoutAPI.optimizeLayout({
        layout: generatedLayout,
        criteria: ['spacing', 'alignment', 'hierarchy', 'responsiveness']
      });
      
      setGeneratedLayout(result.optimizedLayout);
      message.success('Layout optimized successfully');
    } catch (error: any) {
      message.error(error.message || 'Failed to optimize layout');
    } finally {
      setLoading(false);
    }
  };

  const handleValidateLayout = async () => {
    if (!generatedLayout) {
      message.warning('Please generate a layout first');
      return;
    }

    setLoading(true);
    try {
      const result = await aiLayoutAPI.validateLayout({ layout: generatedLayout });
      
      if (result.valid) {
        message.success('Layout is valid!');
      } else {
        Modal.error({
          title: 'Layout Validation Failed',
          content: (
            <div>
              <p>The layout has the following issues:</p>
              <ul>
                {result.errors?.map((error: string, index: number) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )
        });
      }
    } catch (error: any) {
      message.error(error.message || 'Failed to validate layout');
    } finally {
      setLoading(false);
    }
  };

  const componentColumns = [
    {
      title: 'Component',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => <Tag color="blue">{type}</Tag>
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: 'Properties',
      dataIndex: 'props',
      key: 'props',
      render: (props: any) => props ? Object.keys(props).length : 0
    }
  ];

  const historyColumns = [
    {
      title: 'Prompt',
      dataIndex: 'prompt',
      key: 'prompt',
      ellipsis: true,
      width: 200
    },
    {
      title: 'Components',
      dataIndex: 'components',
      key: 'components',
      render: (components: string[]) => components?.length || 0
    },
    {
      title: 'Provider',
      dataIndex: 'provider',
      key: 'provider',
      render: (provider: string) => (
        <Tag color={provider === 'deepseek' ? 'green' : 'blue'}>{provider}</Tag>
      )
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleString()
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: any) => (
        <Button 
          size="small" 
          onClick={() => {
            setPrompt(record.prompt);
            setSelectedComponents(record.components);
            setGeneratedLayout(record.layout);
            setActiveTab('generator');
          }}
        >
          Load
        </Button>
      )
    }
  ];

  const renderGeneratorTab = () => (
    <div>
      <Row gutter={16}>
        <Col span={12}>
          <Card title="Layout Configuration" bordered={false}>
            <Form layout="vertical">
              <Form.Item label="Prompt">
                <TextArea
                  rows={4}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe the layout you want to generate (e.g., 'Create a dashboard with a header, sidebar, and content area')"
                />
              </Form.Item>

              <Form.Item label="Select Components">
                <Select
                  mode="multiple"
                  value={selectedComponents}
                  onChange={setSelectedComponents}
                  placeholder="Select components to include"
                  style={{ width: '100%' }}
                >
                  {components.map((comp) => (
                    <Option key={comp.name} value={comp.name}>
                      {comp.name} - {comp.type}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item label="AI Provider">
                <Select value={provider} onChange={setProvider}>
                  <Option value="ollama">Ollama (Local)</Option>
                  <Option value="deepseek">DeepSeek (Cloud)</Option>
                </Select>
              </Form.Item>

              <Form.Item label="Schema (Optional)">
                <Select
                  value={selectedSchema}
                  onChange={setSelectedSchema}
                  placeholder="Select a schema"
                  allowClear
                >
                  {schemas.map((schema) => (
                    <Option key={schema.name} value={schema.name}>
                      {schema.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Space>
                <Button
                  type="primary"
                  icon={<ThunderboltOutlined />}
                  onClick={handleGenerateLayout}
                  loading={loading}
                  disabled={!prompt || selectedComponents.length === 0}
                >
                  Generate Layout
                </Button>
                <Button
                  onClick={handleOptimizeLayout}
                  disabled={!generatedLayout || loading}
                >
                  Optimize Layout
                </Button>
                <Button
                  onClick={handleValidateLayout}
                  disabled={!generatedLayout || loading}
                >
                  Validate Layout
                </Button>
              </Space>
            </Form>
          </Card>
        </Col>

        <Col span={12}>
          <Card title="Generated Layout Preview" bordered={false}>
            {generatedLayout ? (
              <div>
                <Alert
                  message="Layout Generated Successfully"
                  description="The layout has been generated. You can preview, optimize, or validate it."
                  type="success"
                  showIcon
                  style={{ marginBottom: 16 }}
                />
                <Divider>Layout Structure</Divider>
                <pre style={{ 
                  background: '#f5f5f5', 
                  padding: 16, 
                  borderRadius: 4,
                  maxHeight: 400,
                  overflow: 'auto'
                }}>
                  {JSON.stringify(generatedLayout, null, 2)}
                </pre>
              </div>
            ) : (
              <Alert
                message="No Layout Generated"
                description="Enter a prompt and select components, then click 'Generate Layout' to create a new layout."
                type="info"
                showIcon
              />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );

  const renderComponentsTab = () => (
    <Card title="Available Components" bordered={false}>
      <Table
        columns={componentColumns}
        dataSource={components}
        rowKey="name"
        pagination={{ pageSize: 10 }}
      />
    </Card>
  );

  const renderSchemasTab = () => (
    <Card title="Available Schemas" bordered={false}>
      <Table
        dataSource={schemas}
        rowKey="name"
        columns={[
          {
            title: 'Schema Name',
            dataIndex: 'name',
            key: 'name',
          },
          {
            title: 'Type',
            dataIndex: 'type',
            key: 'type',
            render: (type: string) => <Tag color="purple">{type}</Tag>
          },
          {
            title: 'Fields',
            dataIndex: 'fields',
            key: 'fields',
            render: (fields: any) => fields ? Object.keys(fields).length : 0
          }
        ]}
        pagination={{ pageSize: 10 }}
      />
    </Card>
  );

  const renderHistoryTab = () => (
    <Card title="Layout Generation History" bordered={false}>
      <Table
        columns={historyColumns}
        dataSource={layoutHistory}
        rowKey={(record) => record.id || record.createdAt}
        pagination={{ pageSize: 10 }}
      />
    </Card>
  );

  return (
    <div className="ai-layout-dashboard" style={{ padding: 24 }}>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <h1><LayoutOutlined /> AI Layout Generation</h1>
          <p>Generate intelligent component layouts using AI</p>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Components"
              value={components.length}
              prefix={<AppstoreOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Schemas"
              value={schemas.length}
              prefix={<DatabaseOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="History"
              value={layoutHistory.length}
              prefix={<BulbOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Provider"
              value={provider}
              prefix={<ThunderboltOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card>
            <Space style={{ marginBottom: 16 }}>
              <Button
                type={activeTab === 'generator' ? 'primary' : 'default'}
                onClick={() => setActiveTab('generator')}
              >
                Generator
              </Button>
              <Button
                type={activeTab === 'components' ? 'primary' : 'default'}
                onClick={() => setActiveTab('components')}
              >
                Components
              </Button>
              <Button
                type={activeTab === 'schemas' ? 'primary' : 'default'}
                onClick={() => setActiveTab('schemas')}
              >
                Schemas
              </Button>
              <Button
                type={activeTab === 'history' ? 'primary' : 'default'}
                onClick={() => setActiveTab('history')}
              >
                History
              </Button>
            </Space>

            {activeTab === 'generator' && renderGeneratorTab()}
            {activeTab === 'components' && renderComponentsTab()}
            {activeTab === 'schemas' && renderSchemasTab()}
            {activeTab === 'history' && renderHistoryTab()}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AILayoutDashboard;
