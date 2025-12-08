import React, { useState, useEffect } from 'react';
import { Card, Tabs, Table, Button, Input, Select, message, Modal, Tag, Space, Statistic, Row, Col, Form } from 'antd';
import { 
  SearchOutlined, 
  ThunderboltOutlined, 
  AppstoreOutlined, 
  DatabaseOutlined,
  CodeOutlined,
  ReloadOutlined,
  FileTextOutlined 
} from '@ant-design/icons';
import { storybookMiningAPI } from '../../services/apiService';

const { TabPane } = Tabs;
const { TextArea } = Input;
const { Option } = Select;

const StorybookMiningDashboard: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<any>(null);
  const [components, setComponents] = useState<any[]>([]);
  const [dataStreams, setDataStreams] = useState<any[]>([]);
  const [miningResults, setMiningResults] = useState<any[]>([]);
  const [selectedComponent, setSelectedComponent] = useState<any>(null);
  const [componentAttributes, setComponentAttributes] = useState<any[]>([]);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [mineModalVisible, setMineModalVisible] = useState(false);
  const [batchMineModalVisible, setBatchMineModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [batchForm] = Form.useForm();

  useEffect(() => {
    loadStatus();
    loadComponents();
    loadDataStreams();
  }, []);

  const loadStatus = async () => {
    try {
      const response = await storybookMiningAPI.getStatus();
      if (response.success) {
        setStatus(response.status);
      }
    } catch (error: any) {
      message.error('Failed to load status: ' + error.message);
    }
  };

  const loadComponents = async () => {
    setLoading(true);
    try {
      const response = await storybookMiningAPI.getComponents();
      if (response.success) {
        setComponents(response.components);
      }
    } catch (error: any) {
      message.error('Failed to load components: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadDataStreams = async () => {
    try {
      const response = await storybookMiningAPI.getDataStreams();
      if (response.success) {
        setDataStreams(response.dataStreams);
      }
    } catch (error: any) {
      message.error('Failed to load data streams: ' + error.message);
    }
  };

  const handleMineWebsite = async (values: any) => {
    setLoading(true);
    try {
      const response = await storybookMiningAPI.mineWebsite(values.url);
      if (response.success) {
        message.success(`Successfully mined ${response.count} components`);
        setMiningResults(response.components);
        setMineModalVisible(false);
        loadComponents();
        form.resetFields();
      }
    } catch (error: any) {
      message.error('Failed to mine website: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBatchMine = async (values: any) => {
    setLoading(true);
    try {
      const sites = values.sites.split('\n').filter((s: string) => s.trim());
      const response = await storybookMiningAPI.mineBatch(sites);
      if (response.success) {
        message.success('Batch mining completed');
        setMiningResults(response.results);
        setBatchMineModalVisible(false);
        loadComponents();
        batchForm.resetFields();
      }
    } catch (error: any) {
      message.error('Failed to batch mine: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMineDefaults = async () => {
    setLoading(true);
    try {
      const response = await storybookMiningAPI.mineDefaults();
      if (response.success) {
        message.success('Successfully mined default design sites');
        setMiningResults(response.results);
        loadComponents();
      }
    } catch (error: any) {
      message.error('Failed to mine defaults: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateStory = async (componentId: string) => {
    setLoading(true);
    try {
      const response = await storybookMiningAPI.generateStory(componentId);
      if (response.success) {
        message.success(`Story generated: ${response.filePath}`);
      }
    } catch (error: any) {
      message.error('Failed to generate story: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const showComponentDetails = async (component: any) => {
    setSelectedComponent(component);
    setDetailsModalVisible(true);
    try {
      const response = await storybookMiningAPI.getComponentAttributes(component.id);
      if (response.success) {
        setComponentAttributes(response.attributes);
      }
    } catch (error: any) {
      message.error('Failed to load attributes: ' + error.message);
    }
  };

  const componentsColumns = [
    {
      title: 'Component Name',
      dataIndex: 'component_name',
      key: 'component_name',
      render: (text: string) => <strong>{text}</strong>
    },
    {
      title: 'Type',
      dataIndex: 'component_type',
      key: 'component_type',
      render: (type: string) => (
        <Tag color={type === 'button' ? 'blue' : type === 'input' ? 'green' : 'orange'}>
          {type?.toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Source URL',
      dataIndex: 'source_url',
      key: 'source_url',
      ellipsis: true,
      render: (url: string) => (
        <a href={url} target="_blank" rel="noopener noreferrer">{url}</a>
      )
    },
    {
      title: 'HTML Snippet',
      dataIndex: 'html_snippet',
      key: 'html_snippet',
      ellipsis: true,
      render: (snippet: string) => (
        <code style={{ fontSize: '11px' }}>{snippet?.substring(0, 50)}...</code>
      )
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => new Date(date).toLocaleString()
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space>
          <Button 
            size="small" 
            icon={<FileTextOutlined />}
            onClick={() => handleGenerateStory(record.id)}
          >
            Generate Story
          </Button>
          <Button 
            size="small" 
            onClick={() => showComponentDetails(record)}
          >
            Details
          </Button>
        </Space>
      )
    }
  ];

  const dataStreamsColumns = [
    {
      title: 'Data Stream',
      dataIndex: 'data_stream',
      key: 'data_stream',
      render: (text: string) => <Tag color="purple">{text}</Tag>
    },
    {
      title: 'Collection',
      dataIndex: 'collection',
      key: 'collection'
    },
    {
      title: 'Attributes',
      dataIndex: 'attribute_count',
      key: 'attribute_count',
      render: (count: number) => <Tag color="blue">{count}</Tag>
    },
    {
      title: 'Components',
      dataIndex: 'component_count',
      key: 'component_count',
      render: (count: number) => <Tag color="green">{count}</Tag>
    }
  ];

  const attributesColumns = [
    {
      title: 'Attribute Name',
      dataIndex: 'attribute_name',
      key: 'attribute_name'
    },
    {
      title: 'Data Stream',
      dataIndex: 'data_stream',
      key: 'data_stream',
      render: (text: string) => <Tag>{text}</Tag>
    },
    {
      title: 'Collection',
      dataIndex: 'collection',
      key: 'collection'
    },
    {
      title: 'Attribute Value',
      dataIndex: 'attribute_value',
      key: 'attribute_value',
      ellipsis: true
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <h1>
        <AppstoreOutlined /> Storybook Mining Dashboard
      </h1>
      <p>Mine UI components from websites and generate Storybook stories</p>

      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card>
            <Statistic 
              title="Total Components" 
              value={components.length} 
              prefix={<AppstoreOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic 
              title="Data Streams" 
              value={dataStreams.length} 
              prefix={<DatabaseOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic 
              title="Mining Results" 
              value={miningResults.length} 
              prefix={<SearchOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic 
              title="Service Status" 
              value={status?.initialized ? 'Ready' : 'Initializing'} 
              valueStyle={{ color: status?.initialized ? '#3f8600' : '#cf1322' }}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <Space style={{ marginBottom: '16px' }}>
          <Button 
            type="primary" 
            icon={<SearchOutlined />}
            onClick={() => setMineModalVisible(true)}
          >
            Mine Website
          </Button>
          <Button 
            icon={<ThunderboltOutlined />}
            onClick={() => setBatchMineModalVisible(true)}
          >
            Batch Mine
          </Button>
          <Button 
            icon={<ThunderboltOutlined />}
            onClick={handleMineDefaults}
            loading={loading}
          >
            Mine Default Sites
          </Button>
          <Button 
            icon={<ReloadOutlined />}
            onClick={() => {
              loadComponents();
              loadDataStreams();
              loadStatus();
            }}
          >
            Refresh
          </Button>
        </Space>

        <Tabs defaultActiveKey="1">
          <TabPane tab={<span><AppstoreOutlined /> Components</span>} key="1">
            <Table 
              columns={componentsColumns}
              dataSource={components}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 10 }}
            />
          </TabPane>

          <TabPane tab={<span><DatabaseOutlined /> Data Streams</span>} key="2">
            <Table 
              columns={dataStreamsColumns}
              dataSource={dataStreams}
              rowKey={(record) => `${record.data_stream}-${record.collection}`}
              loading={loading}
              pagination={{ pageSize: 10 }}
            />
          </TabPane>

          <TabPane tab={<span><CodeOutlined /> Mining Results</span>} key="3">
            <pre style={{ 
              background: '#f5f5f5', 
              padding: '16px', 
              borderRadius: '4px',
              maxHeight: '400px',
              overflow: 'auto'
            }}>
              {JSON.stringify(miningResults, null, 2)}
            </pre>
          </TabPane>
        </Tabs>
      </Card>

      {/* Mine Website Modal */}
      <Modal
        title="Mine Website"
        visible={mineModalVisible}
        onCancel={() => setMineModalVisible(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleMineWebsite} layout="vertical">
          <Form.Item
            name="url"
            label="Website URL"
            rules={[{ required: true, message: 'Please enter a URL' }]}
          >
            <Input 
              placeholder="https://example.com" 
              prefix={<SearchOutlined />}
            />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                Mine
              </Button>
              <Button onClick={() => setMineModalVisible(false)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Batch Mine Modal */}
      <Modal
        title="Batch Mine Websites"
        visible={batchMineModalVisible}
        onCancel={() => setBatchMineModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form form={batchForm} onFinish={handleBatchMine} layout="vertical">
          <Form.Item
            name="sites"
            label="Website URLs (one per line)"
            rules={[{ required: true, message: 'Please enter at least one URL' }]}
          >
            <TextArea 
              rows={8} 
              placeholder="https://example1.com&#10;https://example2.com&#10;https://example3.com"
            />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                Start Batch Mining
              </Button>
              <Button onClick={() => setBatchMineModalVisible(false)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Component Details Modal */}
      <Modal
        title={`Component: ${selectedComponent?.component_name}`}
        visible={detailsModalVisible}
        onCancel={() => setDetailsModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedComponent && (
          <div>
            <Row gutter={16}>
              <Col span={12}>
                <p><strong>Type:</strong> {selectedComponent.component_type}</p>
                <p><strong>Source URL:</strong> <a href={selectedComponent.source_url} target="_blank" rel="noopener noreferrer">{selectedComponent.source_url}</a></p>
              </Col>
              <Col span={12}>
                <p><strong>Created:</strong> {new Date(selectedComponent.created_at).toLocaleString()}</p>
              </Col>
            </Row>
            
            <div style={{ marginTop: '16px' }}>
              <strong>HTML Snippet:</strong>
              <pre style={{ 
                background: '#f5f5f5', 
                padding: '12px', 
                borderRadius: '4px',
                marginTop: '8px',
                maxHeight: '200px',
                overflow: 'auto'
              }}>
                {selectedComponent.html_snippet}
              </pre>
            </div>

            {selectedComponent.css_styles && (
              <div style={{ marginTop: '16px' }}>
                <strong>CSS Styles:</strong>
                <pre style={{ 
                  background: '#f5f5f5', 
                  padding: '12px', 
                  borderRadius: '4px',
                  marginTop: '8px',
                  maxHeight: '200px',
                  overflow: 'auto'
                }}>
                  {selectedComponent.css_styles}
                </pre>
              </div>
            )}

            <div style={{ marginTop: '16px' }}>
              <strong>Attributes:</strong>
              <Table 
                columns={attributesColumns}
                dataSource={componentAttributes}
                rowKey="id"
                pagination={{ pageSize: 5 }}
                size="small"
                style={{ marginTop: '8px' }}
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default StorybookMiningDashboard;
