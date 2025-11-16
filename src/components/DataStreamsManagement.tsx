/**
 * Data Streams Management Component
 * 
 * Comprehensive UI for managing data streams with attribute associations
 * Features:
 * - List, create, edit, delete data streams
 * - Manage attribute associations
 * - Include/exclude attributes from streams
 * - View stream metrics and status
 * - Control stream execution (start/stop)
 */

import React, { useState, useEffect } from 'react';
import {
  Layout,
  Card,
  Row,
  Col,
  Typography,
  Button,
  Table,
  Tag,
  Space,
  Modal,
  Form,
  Input,
  Select,
  Switch,
  message,
  Tooltip,
  Drawer,
  Descriptions,
  Badge,
  Divider,
  Alert,
  Statistic,
  Empty,
  Tabs,
  List,
  Popconfirm,
  InputNumber,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  EyeOutlined,
  ReloadOutlined,
  ApiOutlined,
  DatabaseOutlined,
  BranchesOutlined,
  SettingOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined,
  LineChartOutlined,
  OrderedListOutlined,
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

interface DataStream {
  id: string;
  name: string;
  description: string;
  source_type: string;
  destination_type: string;
  status: 'active' | 'inactive' | 'paused' | 'error';
  data_format: string;
  created_at: string;
  updated_at: string;
  total_records_processed: number;
  attributes: Attribute[];
}

interface Attribute {
  id: string;
  attribute_id: string;
  attribute_name: string;
  attribute_type: string;
  is_required: boolean;
  is_included: boolean;
  position: number;
}

interface AttributeList {
  id: string;
  name: string;
  description: string;
  category: string;
  is_active: boolean;
  items: any[];
}

const DataStreamsManagement: React.FC = () => {
  const [dataStreams, setDataStreams] = useState<DataStream[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailsDrawerVisible, setDetailsDrawerVisible] = useState(false);
  const [editingStream, setEditingStream] = useState<DataStream | null>(null);
  const [selectedStream, setSelectedStream] = useState<DataStream | null>(null);
  const [attributeLists, setAttributeLists] = useState<AttributeList[]>([]);
  const [form] = Form.useForm();
  const [attributeForm] = Form.useForm();

  // Fetch data streams
  const fetchDataStreams = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/data-streams');
      const result = await response.json();
      if (result.success) {
        setDataStreams(result.data);
      } else {
        message.error('Failed to fetch data streams');
      }
    } catch (error) {
      console.error('Error fetching data streams:', error);
      message.error('Error loading data streams');
    } finally {
      setLoading(false);
    }
  };

  // Fetch attribute lists
  const fetchAttributeLists = async () => {
    try {
      const response = await fetch('/api/data-streams/lists/all');
      const result = await response.json();
      if (result.success) {
        setAttributeLists(result.data);
      }
    } catch (error) {
      console.error('Error fetching attribute lists:', error);
    }
  };

  useEffect(() => {
    fetchDataStreams();
    fetchAttributeLists();
  }, []);

  // Create or update data stream
  const handleSaveStream = async (values: any) => {
    setLoading(true);
    try {
      const url = editingStream
        ? `/api/data-streams/${editingStream.id}`
        : '/api/data-streams';
      
      const method = editingStream ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      const result = await response.json();

      if (result.success) {
        message.success(`Data stream ${editingStream ? 'updated' : 'created'} successfully`);
        setModalVisible(false);
        setEditingStream(null);
        form.resetFields();
        fetchDataStreams();
      } else {
        message.error(result.error || 'Failed to save data stream');
      }
    } catch (error) {
      console.error('Error saving data stream:', error);
      message.error('Error saving data stream');
    } finally {
      setLoading(false);
    }
  };

  // Delete data stream
  const handleDeleteStream = async (id: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/data-streams/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        message.success('Data stream deleted successfully');
        fetchDataStreams();
      } else {
        message.error(result.error || 'Failed to delete data stream');
      }
    } catch (error) {
      console.error('Error deleting data stream:', error);
      message.error('Error deleting data stream');
    } finally {
      setLoading(false);
    }
  };

  // Start data stream
  const handleStartStream = async (id: string) => {
    try {
      const response = await fetch(`/api/data-streams/${id}/start`, {
        method: 'POST',
      });

      const result = await response.json();

      if (result.success) {
        message.success('Data stream started');
        fetchDataStreams();
      } else {
        message.error(result.error || 'Failed to start data stream');
      }
    } catch (error) {
      console.error('Error starting data stream:', error);
      message.error('Error starting data stream');
    }
  };

  // Stop data stream
  const handleStopStream = async (id: string) => {
    try {
      const response = await fetch(`/api/data-streams/${id}/stop`, {
        method: 'POST',
      });

      const result = await response.json();

      if (result.success) {
        message.success('Data stream stopped');
        fetchDataStreams();
      } else {
        message.error(result.error || 'Failed to stop data stream');
      }
    } catch (error) {
      console.error('Error stopping data stream:', error);
      message.error('Error stopping data stream');
    }
  };

  // Open edit modal
  const handleEdit = (stream: DataStream) => {
    setEditingStream(stream);
    form.setFieldsValue({
      name: stream.name,
      description: stream.description,
      source_type: stream.source_type,
      destination_type: stream.destination_type,
      data_format: stream.data_format,
    });
    setModalVisible(true);
  };

  // View stream details
  const handleViewDetails = async (stream: DataStream) => {
    try {
      const response = await fetch(`/api/data-streams/${stream.id}`);
      const result = await response.json();
      if (result.success) {
        setSelectedStream(result.data);
        setDetailsDrawerVisible(true);
      }
    } catch (error) {
      console.error('Error fetching stream details:', error);
      message.error('Error loading stream details');
    }
  };

  // Add attribute to stream
  const handleAddAttribute = async (values: any) => {
    if (!selectedStream) return;

    try {
      const response = await fetch(`/api/data-streams/${selectedStream.id}/attributes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      const result = await response.json();

      if (result.success) {
        message.success('Attribute added successfully');
        attributeForm.resetFields();
        handleViewDetails(selectedStream); // Refresh details
      } else {
        message.error(result.error || 'Failed to add attribute');
      }
    } catch (error) {
      console.error('Error adding attribute:', error);
      message.error('Error adding attribute');
    }
  };

  // Remove attribute from stream
  const handleRemoveAttribute = async (attrId: string) => {
    if (!selectedStream) return;

    try {
      const response = await fetch(
        `/api/data-streams/${selectedStream.id}/attributes/${attrId}`,
        { method: 'DELETE' }
      );

      const result = await response.json();

      if (result.success) {
        message.success('Attribute removed successfully');
        handleViewDetails(selectedStream); // Refresh details
      } else {
        message.error(result.error || 'Failed to remove attribute');
      }
    } catch (error) {
      console.error('Error removing attribute:', error);
      message.error('Error removing attribute');
    }
  };

  // Toggle attribute inclusion
  const handleToggleAttribute = async (attrId: string, isIncluded: boolean) => {
    if (!selectedStream) return;

    try {
      const response = await fetch(
        `/api/data-streams/${selectedStream.id}/attributes/${attrId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ is_included: !isIncluded }),
        }
      );

      const result = await response.json();

      if (result.success) {
        message.success('Attribute updated successfully');
        handleViewDetails(selectedStream); // Refresh details
      } else {
        message.error(result.error || 'Failed to update attribute');
      }
    } catch (error) {
      console.error('Error updating attribute:', error);
      message.error('Error updating attribute');
    }
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; text: string }> = {
      active: { color: 'success', text: 'Active' },
      inactive: { color: 'default', text: 'Inactive' },
      paused: { color: 'warning', text: 'Paused' },
      error: { color: 'error', text: 'Error' },
    };

    const config = statusConfig[status] || statusConfig.inactive;
    return <Badge status={config.color as any} text={config.text} />;
  };

  // Table columns
  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: DataStream) => (
        <Space>
          <ApiOutlined />
          <Text strong>{text}</Text>
        </Space>
      ),
    },
    {
      title: 'Source',
      dataIndex: 'source_type',
      key: 'source_type',
      render: (text: string) => <Tag color="blue">{text || 'N/A'}</Tag>,
    },
    {
      title: 'Destination',
      dataIndex: 'destination_type',
      key: 'destination_type',
      render: (text: string) => <Tag color="green">{text || 'N/A'}</Tag>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getStatusBadge(status),
    },
    {
      title: 'Attributes',
      dataIndex: 'attributes',
      key: 'attributes',
      render: (attributes: any[]) => (
        <Tooltip title={`${attributes?.length || 0} attributes configured`}>
          <Tag icon={<BranchesOutlined />}>{attributes?.length || 0}</Tag>
        </Tooltip>
      ),
    },
    {
      title: 'Records Processed',
      dataIndex: 'total_records_processed',
      key: 'total_records_processed',
      render: (count: number) => count?.toLocaleString() || 0,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: DataStream) => (
        <Space size="small">
          <Tooltip title="View Details">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetails(record)}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          {record.status === 'active' ? (
            <Tooltip title="Stop">
              <Button
                type="text"
                icon={<PauseCircleOutlined />}
                onClick={() => handleStopStream(record.id)}
              />
            </Tooltip>
          ) : (
            <Tooltip title="Start">
              <Button
                type="text"
                icon={<PlayCircleOutlined />}
                onClick={() => handleStartStream(record.id)}
              />
            </Tooltip>
          )}
          <Popconfirm
            title="Are you sure you want to delete this data stream?"
            onConfirm={() => handleDeleteStream(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title="Delete">
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Layout style={{ padding: '24px', background: '#f0f2f5' }}>
      <Card
        title={
          <Space>
            <DatabaseOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
            <Title level={3} style={{ margin: 0 }}>
              Data Streams Management
            </Title>
          </Space>
        }
        extra={
          <Space>
            <Button icon={<ReloadOutlined />} onClick={fetchDataStreams}>
              Refresh
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingStream(null);
                form.resetFields();
                setModalVisible(true);
              }}
            >
              Create Data Stream
            </Button>
          </Space>
        }
      >
        <Alert
          message="Data Streams Overview"
          description="Manage data flows between services with flexible attribute configurations. Create streams, associate attributes, and control data flow in real-time."
          type="info"
          showIcon
          icon={<ApiOutlined />}
          style={{ marginBottom: 16 }}
        />

        <Table
          columns={columns}
          dataSource={dataStreams}
          loading={loading}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} streams`,
          }}
        />
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        title={editingStream ? 'Edit Data Stream' : 'Create Data Stream'}
        visible={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingStream(null);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        width={600}
        confirmLoading={loading}
      >
        <Form form={form} layout="vertical" onFinish={handleSaveStream}>
          <Form.Item
            name="name"
            label="Stream Name"
            rules={[{ required: true, message: 'Please enter stream name' }]}
          >
            <Input placeholder="e.g., User Data Stream" />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <TextArea rows={3} placeholder="Describe the purpose of this stream" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="source_type" label="Source Type">
                <Select placeholder="Select source type">
                  <Option value="database">Database</Option>
                  <Option value="api">API</Option>
                  <Option value="file">File</Option>
                  <Option value="stream">Stream</Option>
                  <Option value="webhook">Webhook</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="destination_type" label="Destination Type">
                <Select placeholder="Select destination type">
                  <Option value="database">Database</Option>
                  <Option value="api">API</Option>
                  <Option value="file">File</Option>
                  <Option value="stream">Stream</Option>
                  <Option value="webhook">Webhook</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="data_format" label="Data Format">
            <Select placeholder="Select data format">
              <Option value="json">JSON</Option>
              <Option value="xml">XML</Option>
              <Option value="csv">CSV</Option>
              <Option value="parquet">Parquet</Option>
              <Option value="avro">Avro</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Details Drawer */}
      <Drawer
        title={
          <Space>
            <ApiOutlined />
            <Text strong>Stream Details</Text>
          </Space>
        }
        width={720}
        visible={detailsDrawerVisible}
        onClose={() => setDetailsDrawerVisible(false)}
      >
        {selectedStream && (
          <Tabs defaultActiveKey="info">
            <TabPane tab="Information" key="info">
              <Descriptions bordered column={1}>
                <Descriptions.Item label="Name">{selectedStream.name}</Descriptions.Item>
                <Descriptions.Item label="Description">
                  {selectedStream.description || 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="Status">
                  {getStatusBadge(selectedStream.status)}
                </Descriptions.Item>
                <Descriptions.Item label="Source Type">
                  <Tag color="blue">{selectedStream.source_type || 'N/A'}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Destination Type">
                  <Tag color="green">{selectedStream.destination_type || 'N/A'}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Data Format">
                  {selectedStream.data_format || 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="Records Processed">
                  <Statistic
                    value={selectedStream.total_records_processed || 0}
                    valueStyle={{ fontSize: '16px' }}
                  />
                </Descriptions.Item>
                <Descriptions.Item label="Created">
                  {new Date(selectedStream.created_at).toLocaleString()}
                </Descriptions.Item>
                <Descriptions.Item label="Last Updated">
                  {new Date(selectedStream.updated_at).toLocaleString()}
                </Descriptions.Item>
              </Descriptions>
            </TabPane>

            <TabPane
              tab={
                <span>
                  <BranchesOutlined />
                  Attributes ({selectedStream.attributes?.length || 0})
                </span>
              }
              key="attributes"
            >
              <Card
                title="Add Attribute"
                size="small"
                style={{ marginBottom: 16 }}
              >
                <Form
                  form={attributeForm}
                  layout="inline"
                  onFinish={handleAddAttribute}
                >
                  <Form.Item
                    name="attribute_name"
                    rules={[{ required: true, message: 'Required' }]}
                  >
                    <Input placeholder="Attribute name" />
                  </Form.Item>
                  <Form.Item name="attribute_type">
                    <Select placeholder="Type" style={{ width: 120 }}>
                      <Option value="string">String</Option>
                      <Option value="number">Number</Option>
                      <Option value="boolean">Boolean</Option>
                      <Option value="date">Date</Option>
                      <Option value="object">Object</Option>
                    </Select>
                  </Form.Item>
                  <Form.Item name="is_required" valuePropName="checked">
                    <Switch checkedChildren="Required" unCheckedChildren="Optional" />
                  </Form.Item>
                  <Form.Item>
                    <Button type="primary" htmlType="submit" icon={<PlusOutlined />}>
                      Add
                    </Button>
                  </Form.Item>
                </Form>
              </Card>

              <List
                dataSource={selectedStream.attributes || []}
                renderItem={(attr: any) => (
                  <List.Item
                    actions={[
                      <Switch
                        checked={attr.is_included}
                        onChange={() =>
                          handleToggleAttribute(attr.id, attr.is_included)
                        }
                        checkedChildren="Included"
                        unCheckedChildren="Excluded"
                      />,
                      <Popconfirm
                        title="Remove this attribute?"
                        onConfirm={() => handleRemoveAttribute(attr.id)}
                      >
                        <Button type="text" danger icon={<DeleteOutlined />} />
                      </Popconfirm>,
                    ]}
                  >
                    <List.Item.Meta
                      avatar={
                        attr.is_included ? (
                          <CheckCircleOutlined style={{ color: '#52c41a' }} />
                        ) : (
                          <CloseCircleOutlined style={{ color: '#d9d9d9' }} />
                        )
                      }
                      title={
                        <Space>
                          <Text strong>{attr.attribute_name}</Text>
                          <Tag>{attr.attribute_type}</Tag>
                          {attr.is_required && <Tag color="red">Required</Tag>}
                        </Space>
                      }
                      description={`Position: ${attr.position}`}
                    />
                  </List.Item>
                )}
              />
            </TabPane>

            <TabPane
              tab={
                <span>
                  <LineChartOutlined />
                  Metrics
                </span>
              }
              key="metrics"
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Card>
                    <Statistic
                      title="Total Records Processed"
                      value={selectedStream.total_records_processed || 0}
                      prefix={<DatabaseOutlined />}
                    />
                  </Card>
                </Col>
                <Col span={12}>
                  <Card>
                    <Statistic
                      title="Active Attributes"
                      value={
                        selectedStream.attributes?.filter((a: any) => a.is_included)
                          .length || 0
                      }
                      suffix={`/ ${selectedStream.attributes?.length || 0}`}
                      prefix={<BranchesOutlined />}
                    />
                  </Card>
                </Col>
              </Row>
            </TabPane>
          </Tabs>
        )}
      </Drawer>
    </Layout>
  );
};

export default DataStreamsManagement;
