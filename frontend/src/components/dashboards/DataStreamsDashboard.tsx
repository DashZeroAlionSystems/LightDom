import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Form, Input, Select, message, Tabs, Tag, Space, Statistic, Row, Col } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { dataStreamsAPI } from '../../services/apiService';

const { Option } = Select;
const { TabPane } = Tabs;
const { TextArea } = Input;

interface DataStream {
  id: number;
  name: string;
  description?: string;
  source_type: string;
  source_config: any;
  destination_type: string;
  destination_config: any;
  status: string;
  attributes?: any[];
  created_at: string;
  updated_at: string;
}

interface Attribute {
  id: number;
  name: string;
  data_type: string;
  is_required: boolean;
  default_value?: string;
}

const DataStreamsDashboard: React.FC = () => {
  const [streams, setStreams] = useState<DataStream[]>([]);
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [attributeModalVisible, setAttributeModalVisible] = useState(false);
  const [editingStream, setEditingStream] = useState<DataStream | null>(null);
  const [selectedStreamId, setSelectedStreamId] = useState<number | null>(null);
  const [form] = Form.useForm();
  const [attributeForm] = Form.useForm();
  const [filters, setFilters] = useState({
    status: '',
    source_type: '',
    destination_type: ''
  });

  useEffect(() => {
    loadStreams();
    loadStats();
  }, [filters]);

  const loadStreams = async () => {
    try {
      setLoading(true);
      const response = await dataStreamsAPI.getStreams(filters);
      setStreams(response.data || []);
    } catch (error: any) {
      message.error(error.message || 'Failed to load data streams');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await dataStreamsAPI.getStats();
      setStats(response.data || {});
    } catch (error: any) {
      console.error('Failed to load stats:', error);
    }
  };

  const loadStreamAttributes = async (streamId: number) => {
    try {
      const response = await dataStreamsAPI.getStreamAttributes(streamId);
      setAttributes(response.data || []);
    } catch (error: any) {
      message.error('Failed to load stream attributes');
    }
  };

  const handleCreateStream = () => {
    setEditingStream(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEditStream = (stream: DataStream) => {
    setEditingStream(stream);
    form.setFieldsValue({
      ...stream,
      source_config: JSON.stringify(stream.source_config, null, 2),
      destination_config: JSON.stringify(stream.destination_config, null, 2)
    });
    setModalVisible(true);
  };

  const handleDeleteStream = async (id: number) => {
    Modal.confirm({
      title: 'Delete Data Stream',
      content: 'Are you sure you want to delete this data stream?',
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          await dataStreamsAPI.deleteStream(id);
          message.success('Data stream deleted successfully');
          loadStreams();
          loadStats();
        } catch (error: any) {
          message.error(error.message || 'Failed to delete data stream');
        }
      }
    });
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      // Parse JSON configurations
      const streamData = {
        ...values,
        source_config: JSON.parse(values.source_config),
        destination_config: JSON.parse(values.destination_config)
      };

      if (editingStream) {
        await dataStreamsAPI.updateStream(editingStream.id, streamData);
        message.success('Data stream updated successfully');
      } else {
        await dataStreamsAPI.createStream(streamData);
        message.success('Data stream created successfully');
      }

      setModalVisible(false);
      form.resetFields();
      loadStreams();
      loadStats();
    } catch (error: any) {
      if (error.errorFields) {
        message.error('Please check the form fields');
      } else {
        message.error(error.message || 'Failed to save data stream');
      }
    }
  };

  const handleManageAttributes = (stream: DataStream) => {
    setSelectedStreamId(stream.id);
    loadStreamAttributes(stream.id);
    setAttributeModalVisible(true);
  };

  const handleAddAttribute = async () => {
    try {
      const values = await attributeForm.validateFields();
      
      if (selectedStreamId) {
        await dataStreamsAPI.addAttribute(selectedStreamId, values.attribute_id);
        message.success('Attribute added to stream');
        loadStreamAttributes(selectedStreamId);
        attributeForm.resetFields();
      }
    } catch (error: any) {
      message.error(error.message || 'Failed to add attribute');
    }
  };

  const handleRemoveAttribute = async (attributeId: number) => {
    if (selectedStreamId) {
      try {
        await dataStreamsAPI.removeAttribute(selectedStreamId, attributeId);
        message.success('Attribute removed from stream');
        loadStreamAttributes(selectedStreamId);
      } catch (error: any) {
        message.error(error.message || 'Failed to remove attribute');
      }
    }
  };

  const streamColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: DataStream) => (
        <div>
          <div style={{ fontWeight: 500 }}>{text}</div>
          {record.description && (
            <div style={{ fontSize: '12px', color: '#888' }}>{record.description}</div>
          )}
        </div>
      )
    },
    {
      title: 'Source',
      dataIndex: 'source_type',
      key: 'source_type',
      render: (text: string) => <Tag color="blue">{text}</Tag>
    },
    {
      title: 'Destination',
      dataIndex: 'destination_type',
      key: 'destination_type',
      render: (text: string) => <Tag color="green">{text}</Tag>
    },
    {
      title: 'Attributes',
      dataIndex: 'attributes',
      key: 'attributes',
      render: (attributes: any[]) => attributes?.length || 0
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const color = status === 'active' ? 'green' : status === 'inactive' ? 'red' : 'orange';
        const icon = status === 'active' ? <CheckCircleOutlined /> : <CloseCircleOutlined />;
        return <Tag color={color} icon={icon}>{status}</Tag>;
      }
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (text: string) => new Date(text).toLocaleString()
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: DataStream) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEditStream(record)}
          >
            Edit
          </Button>
          <Button
            type="link"
            onClick={() => handleManageAttributes(record)}
          >
            Attributes
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteStream(record.id)}
          >
            Delete
          </Button>
        </Space>
      )
    }
  ];

  const attributeColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: 'Data Type',
      dataIndex: 'data_type',
      key: 'data_type',
      render: (text: string) => <Tag>{text}</Tag>
    },
    {
      title: 'Required',
      dataIndex: 'is_required',
      key: 'is_required',
      render: (required: boolean) => required ? <Tag color="red">Required</Tag> : <Tag>Optional</Tag>
    },
    {
      title: 'Default Value',
      dataIndex: 'default_value',
      key: 'default_value',
      render: (text: string) => text || '-'
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Attribute) => (
        <Button
          type="link"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleRemoveAttribute(record.id)}
        >
          Remove
        </Button>
      )
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <h1>Data Streams Management</h1>
      
      <Tabs defaultActiveKey="streams">
        <TabPane tab="Data Streams" key="streams">
          <Card
            title="Data Streams"
            extra={
              <Space>
                <Button icon={<ReloadOutlined />} onClick={loadStreams}>
                  Refresh
                </Button>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleCreateStream}
                >
                  Create Stream
                </Button>
              </Space>
            }
          >
            <div style={{ marginBottom: 16 }}>
              <Space>
                <Select
                  style={{ width: 150 }}
                  placeholder="Status"
                  allowClear
                  onChange={(value) => setFilters({ ...filters, status: value || '' })}
                >
                  <Option value="active">Active</Option>
                  <Option value="inactive">Inactive</Option>
                  <Option value="paused">Paused</Option>
                </Select>
                <Select
                  style={{ width: 150 }}
                  placeholder="Source Type"
                  allowClear
                  onChange={(value) => setFilters({ ...filters, source_type: value || '' })}
                >
                  <Option value="database">Database</Option>
                  <Option value="api">API</Option>
                  <Option value="file">File</Option>
                  <Option value="webhook">Webhook</Option>
                </Select>
                <Select
                  style={{ width: 150 }}
                  placeholder="Destination Type"
                  allowClear
                  onChange={(value) => setFilters({ ...filters, destination_type: value || '' })}
                >
                  <Option value="database">Database</Option>
                  <Option value="api">API</Option>
                  <Option value="file">File</Option>
                  <Option value="storage">Storage</Option>
                </Select>
              </Space>
            </div>

            <Table
              columns={streamColumns}
              dataSource={streams}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </TabPane>

        <TabPane tab="Statistics" key="stats">
          <Card title="Data Streams Statistics">
            <Row gutter={16}>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="Total Streams"
                    value={stats.total || 0}
                    prefix={<CheckCircleOutlined />}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="Active Streams"
                    value={stats.active || 0}
                    valueStyle={{ color: '#3f8600' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="Inactive Streams"
                    value={stats.inactive || 0}
                    valueStyle={{ color: '#cf1322' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="Total Attributes"
                    value={stats.total_attributes || 0}
                  />
                </Card>
              </Col>
            </Row>
          </Card>
        </TabPane>
      </Tabs>

      {/* Create/Edit Stream Modal */}
      <Modal
        title={editingStream ? 'Edit Data Stream' : 'Create Data Stream'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        width={800}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Stream Name"
            rules={[{ required: true, message: 'Please enter stream name' }]}
          >
            <Input placeholder="Enter stream name" />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <TextArea rows={2} placeholder="Enter stream description" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="source_type"
                label="Source Type"
                rules={[{ required: true, message: 'Please select source type' }]}
              >
                <Select placeholder="Select source type">
                  <Option value="database">Database</Option>
                  <Option value="api">API</Option>
                  <Option value="file">File</Option>
                  <Option value="webhook">Webhook</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="destination_type"
                label="Destination Type"
                rules={[{ required: true, message: 'Please select destination type' }]}
              >
                <Select placeholder="Select destination type">
                  <Option value="database">Database</Option>
                  <Option value="api">API</Option>
                  <Option value="file">File</Option>
                  <Option value="storage">Storage</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="source_config"
            label="Source Configuration (JSON)"
            rules={[
              { required: true, message: 'Please enter source configuration' },
              {
                validator: (_, value) => {
                  try {
                    JSON.parse(value);
                    return Promise.resolve();
                  } catch {
                    return Promise.reject('Invalid JSON format');
                  }
                }
              }
            ]}
          >
            <TextArea rows={4} placeholder='{"host": "localhost", "port": 5432}' />
          </Form.Item>

          <Form.Item
            name="destination_config"
            label="Destination Configuration (JSON)"
            rules={[
              { required: true, message: 'Please enter destination configuration' },
              {
                validator: (_, value) => {
                  try {
                    JSON.parse(value);
                    return Promise.resolve();
                  } catch {
                    return Promise.reject('Invalid JSON format');
                  }
                }
              }
            ]}
          >
            <TextArea rows={4} placeholder='{"bucket": "my-bucket", "path": "/data"}' />
          </Form.Item>

          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: 'Please select status' }]}
          >
            <Select placeholder="Select status">
              <Option value="active">Active</Option>
              <Option value="inactive">Inactive</Option>
              <Option value="paused">Paused</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Manage Attributes Modal */}
      <Modal
        title="Manage Stream Attributes"
        open={attributeModalVisible}
        onCancel={() => {
          setAttributeModalVisible(false);
          setSelectedStreamId(null);
          attributeForm.resetFields();
        }}
        footer={null}
        width={800}
      >
        <Card title="Add Attribute" size="small" style={{ marginBottom: 16 }}>
          <Form form={attributeForm} layout="inline">
            <Form.Item
              name="attribute_id"
              rules={[{ required: true, message: 'Please enter attribute ID' }]}
            >
              <Input placeholder="Attribute ID" type="number" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" onClick={handleAddAttribute}>
                Add Attribute
              </Button>
            </Form.Item>
          </Form>
        </Card>

        <Table
          columns={attributeColumns}
          dataSource={attributes}
          rowKey="id"
          pagination={false}
          size="small"
        />
      </Modal>
    </div>
  );
};

export default DataStreamsDashboard;
