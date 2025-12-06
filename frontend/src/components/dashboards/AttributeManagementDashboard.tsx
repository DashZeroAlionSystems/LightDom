import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, Switch, Tag, Space, Card, Statistic, Row, Col, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import { attributeManagementAPI } from '../../services/apiService';

const { Option } = Select;
const { TextArea } = Input;

interface AttributeConfig {
  algorithm?: string;
  drillDown?: boolean;
  dataMining?: boolean;
  training?: boolean;
}

interface Attribute {
  id: number;
  app_id?: number;
  entity_type: string;
  attribute_name: string;
  attribute_type: string;
  description?: string;
  is_required: boolean;
  default_value?: any;
  validation_rules?: any;
  display_config?: any;
  data_stream_ids?: number[];
  config?: AttributeConfig;
  relatedItems?: number[];
  created_at?: string;
  updated_at?: string;
}

const AttributeManagementDashboard: React.FC = () => {
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAttribute, setEditingAttribute] = useState<Attribute | null>(null);
  const [form] = Form.useForm();
  const [stats, setStats] = useState({ total: 0, required: 0, metadata: 0, activeStreams: 0 });

  // Filters
  const [filterEntityType, setFilterEntityType] = useState<string | undefined>(undefined);
  const [filterAttributeType, setFilterAttributeType] = useState<string | undefined>(undefined);
  const [filterRequired, setFilterRequired] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    loadAttributes();
  }, [filterEntityType, filterAttributeType, filterRequired]);

  const loadAttributes = async () => {
    setLoading(true);
    try {
      const data = await attributeManagementAPI.getAttributes({
        entity_type: filterEntityType,
        attribute_type: filterAttributeType,
        is_required: filterRequired,
      });
      setAttributes(data);
      
      // Calculate stats
      const total = data.length;
      const required = data.filter((a: Attribute) => a.is_required).length;
      const metadata = data.filter((a: Attribute) => a.attribute_type === 'metadata').length;
      const activeStreams = data.reduce((sum: number, a: Attribute) => 
        sum + (a.data_stream_ids?.length || 0), 0
      );
      
      setStats({ total, required, metadata, activeStreams });
    } catch (error) {
      console.error('Error loading attributes:', error);
      message.error('Failed to load attributes');
    } finally {
      setLoading(false);
    }
  };

  const showCreateModal = () => {
    setEditingAttribute(null);
    form.resetFields();
    form.setFieldsValue({
      entity_type: 'generic',
      attribute_type: 'metadata',
      is_required: false,
      config: {
        drillDown: false,
        dataMining: false,
        training: false,
      }
    });
    setModalVisible(true);
  };

  const showEditModal = (attribute: Attribute) => {
    setEditingAttribute(attribute);
    form.setFieldsValue({
      ...attribute,
      name: attribute.attribute_name,
      type: attribute.attribute_type,
      config: attribute.config || {
        drillDown: false,
        dataMining: false,
        training: false,
      },
    });
    setModalVisible(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      
      if (editingAttribute) {
        await attributeManagementAPI.updateAttribute(editingAttribute.id, {
          attribute_name: values.name,
          attribute_type: values.type,
          description: values.description,
          is_required: values.is_required,
          default_value: values.default_value,
          config: values.config,
        });
        message.success('Attribute updated successfully');
      } else {
        await attributeManagementAPI.createAttribute({
          entity_type: values.entity_type,
          name: values.name,
          type: values.type,
          description: values.description,
          is_required: values.is_required,
          default_value: values.default_value,
          config: values.config,
        });
        message.success('Attribute created successfully');
      }
      
      setModalVisible(false);
      loadAttributes();
    } catch (error) {
      console.error('Error saving attribute:', error);
      message.error('Failed to save attribute');
    }
  };

  const handleDelete = async (id: number) => {
    Modal.confirm({
      title: 'Delete Attribute',
      content: 'Are you sure you want to delete this attribute?',
      onOk: async () => {
        try {
          await attributeManagementAPI.deleteAttribute(id);
          message.success('Attribute deleted successfully');
          loadAttributes();
        } catch (error) {
          console.error('Error deleting attribute:', error);
          message.error('Failed to delete attribute');
        }
      },
    });
  };

  const handleBulkCreate = () => {
    Modal.info({
      title: 'Bulk Create Attributes',
      content: 'This feature allows you to create multiple attributes at once from a JSON template or CSV file.',
      onOk: () => {
        message.info('Bulk create feature coming soon');
      },
    });
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'Name',
      dataIndex: 'attribute_name',
      key: 'attribute_name',
      render: (text: string, record: Attribute) => (
        <div>
          <div style={{ fontWeight: 500 }}>{text}</div>
          {record.is_required && <Tag color="red">Required</Tag>}
        </div>
      ),
    },
    {
      title: 'Entity Type',
      dataIndex: 'entity_type',
      key: 'entity_type',
      render: (text: string) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: 'Type',
      dataIndex: 'attribute_type',
      key: 'attribute_type',
      render: (text: string) => <Tag color="green">{text}</Tag>,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Config',
      key: 'config',
      render: (_: any, record: Attribute) => (
        <Space direction="vertical" size="small">
          {record.config?.algorithm && (
            <Tag color="purple">Algo: {record.config.algorithm}</Tag>
          )}
          {record.config?.drillDown && <Tag>Drill Down</Tag>}
          {record.config?.dataMining && <Tag>Data Mining</Tag>}
          {record.config?.training && <Tag>Training</Tag>}
        </Space>
      ),
    },
    {
      title: 'Streams',
      dataIndex: 'data_stream_ids',
      key: 'data_stream_ids',
      render: (streams: number[]) => (
        <Tag color="cyan">{streams?.length || 0} streams</Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (_: any, record: Attribute) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => showEditModal(record)}
          >
            Edit
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1>Attribute Management</h1>
        <p>Manage metadata attribute definitions bundled in data streams</p>
      </div>

      {/* Statistics */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card>
            <Statistic title="Total Attributes" value={stats.total} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic 
              title="Required Attributes" 
              value={stats.required}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic 
              title="Metadata Type" 
              value={stats.metadata}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic 
              title="Active in Streams" 
              value={stats.activeStreams}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters and Actions */}
      <Card style={{ marginBottom: '16px' }}>
        <Space wrap>
          <Select
            placeholder="Filter by Entity Type"
            style={{ width: 200 }}
            allowClear
            value={filterEntityType}
            onChange={setFilterEntityType}
          >
            <Option value="generic">Generic</Option>
            <Option value="campaign">Campaign</Option>
            <Option value="stream">Stream</Option>
            <Option value="user">User</Option>
          </Select>

          <Select
            placeholder="Filter by Type"
            style={{ width: 200 }}
            allowClear
            value={filterAttributeType}
            onChange={setFilterAttributeType}
          >
            <Option value="metadata">Metadata</Option>
            <Option value="config">Config</Option>
            <Option value="custom">Custom</Option>
          </Select>

          <Select
            placeholder="Filter by Required"
            style={{ width: 200 }}
            allowClear
            value={filterRequired}
            onChange={setFilterRequired}
          >
            <Option value={true}>Required</Option>
            <Option value={false}>Optional</Option>
          </Select>

          <Button icon={<ReloadOutlined />} onClick={loadAttributes}>
            Refresh
          </Button>

          <Button type="primary" icon={<PlusOutlined />} onClick={showCreateModal}>
            Create Attribute
          </Button>

          <Button onClick={handleBulkCreate}>
            Bulk Create
          </Button>
        </Space>
      </Card>

      {/* Attributes Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={attributes}
          rowKey="id"
          loading={loading}
          pagination={{
            total: attributes.length,
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} attributes`,
          }}
        />
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        title={editingAttribute ? 'Edit Attribute' : 'Create Attribute'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
        width={700}
      >
        <Form form={form} layout="vertical">
          {!editingAttribute && (
            <Form.Item
              name="entity_type"
              label="Entity Type"
              rules={[{ required: true, message: 'Please select entity type' }]}
            >
              <Select>
                <Option value="generic">Generic</Option>
                <Option value="campaign">Campaign</Option>
                <Option value="stream">Stream</Option>
                <Option value="user">User</Option>
              </Select>
            </Form.Item>
          )}

          <Form.Item
            name="name"
            label="Attribute Name"
            rules={[{ required: true, message: 'Please enter attribute name' }]}
          >
            <Input placeholder="e.g., target_keyword, competitor_url" />
          </Form.Item>

          <Form.Item
            name="type"
            label="Attribute Type"
            rules={[{ required: true, message: 'Please select attribute type' }]}
          >
            <Select>
              <Option value="metadata">Metadata</Option>
              <Option value="config">Config</Option>
              <Option value="custom">Custom</Option>
            </Select>
          </Form.Item>

          <Form.Item name="description" label="Description">
            <TextArea rows={2} placeholder="Describe the purpose of this attribute" />
          </Form.Item>

          <Form.Item name="is_required" label="Required" valuePropName="checked">
            <Switch />
          </Form.Item>

          <Form.Item name="default_value" label="Default Value">
            <Input placeholder="Default value (optional)" />
          </Form.Item>

          <Form.Item label="Configuration">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Form.Item name={['config', 'algorithm']} label="Algorithm" noStyle>
                <Input placeholder="Algorithm name (optional)" style={{ width: '100%' }} />
              </Form.Item>
              
              <Form.Item name={['config', 'drillDown']} valuePropName="checked" noStyle>
                <Switch /> <span style={{ marginLeft: 8 }}>Enable Drill Down</span>
              </Form.Item>
              
              <Form.Item name={['config', 'dataMining']} valuePropName="checked" noStyle>
                <Switch /> <span style={{ marginLeft: 8 }}>Data Mining</span>
              </Form.Item>
              
              <Form.Item name={['config', 'training']} valuePropName="checked" noStyle>
                <Switch /> <span style={{ marginLeft: 8 }}>Training Data</span>
              </Form.Item>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AttributeManagementDashboard;
