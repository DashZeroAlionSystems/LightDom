/**
 * Category Management Dashboard
 * Full CRUD interface for managing categories with auto-generated APIs
 */

import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Switch,
  message,
  Space,
  Tag,
  Descriptions,
  Tooltip,
  Row,
  Col,
  Statistic,
  Typography,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  ApiOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface Category {
  id: number;
  category_id: string;
  name: string;
  display_name: string;
  description?: string;
  category_type: string;
  parent_category_id?: string;
  auto_generate_crud_api: boolean;
  api_config?: any;
  schema_definition?: any;
  status: string;
  icon?: string;
  color?: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

interface CategoryStats {
  category_id: string;
  name: string;
  display_name: string;
  category_type: string;
  status: string;
  total_items: number;
  total_api_routes: number;
  auto_generate_crud_api: boolean;
  created_at: string;
}

const CategoryManagement: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [statistics, setStatistics] = useState<CategoryStats[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [form] = Form.useForm();

  const categoryTypes = [
    'workflow',
    'service',
    'data_stream',
    'neural_network',
    'tensorflow',
    'scraper',
    'data_mining',
    'seeder',
    'campaign',
    'client_management',
  ];

  // Fetch categories from API
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/category-management/categories');
      const data = await response.json();
      
      if (data.success) {
        setCategories(data.data || []);
      } else {
        message.error('Failed to load categories');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      message.error('Failed to connect to API');
    } finally {
      setLoading(false);
    }
  };

  // Fetch category statistics
  const fetchStatistics = async () => {
    try {
      const response = await fetch('/api/category-management/statistics');
      const data = await response.json();
      
      if (data.success) {
        setStatistics(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchStatistics();
  }, []);

  // Handle create/update category
  const handleSubmit = async (values: any) => {
    try {
      const isEdit = !!editingCategory;
      const url = isEdit
        ? `/api/category-management/categories/${editingCategory.category_id}`
        : '/api/category-management/categories';
      
      const method = isEdit ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (data.success) {
        message.success(data.message || `Category ${isEdit ? 'updated' : 'created'} successfully`);
        setModalVisible(false);
        form.resetFields();
        setEditingCategory(null);
        fetchCategories();
        fetchStatistics();
      } else {
        message.error(data.error || 'Operation failed');
      }
    } catch (error) {
      console.error('Error saving category:', error);
      message.error('Failed to save category');
    }
  };

  // Handle delete category
  const handleDelete = async (categoryId: string) => {
    Modal.confirm({
      title: 'Delete Category',
      content: 'Are you sure you want to delete this category? This will also remove all associated items and API routes.',
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          const response = await fetch(`/api/category-management/categories/${categoryId}`, {
            method: 'DELETE',
          });

          const data = await response.json();

          if (data.success) {
            message.success('Category deleted successfully');
            fetchCategories();
            fetchStatistics();
          } else {
            message.error(data.error || 'Failed to delete category');
          }
        } catch (error) {
          console.error('Error deleting category:', error);
          message.error('Failed to delete category');
        }
      },
    });
  };

  // Handle edit category
  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    form.setFieldsValue({
      name: category.name,
      display_name: category.display_name,
      description: category.description,
      category_type: category.category_type,
      auto_generate_crud_api: category.auto_generate_crud_api,
      icon: category.icon,
      color: category.color,
      sort_order: category.sort_order,
      status: category.status,
    });
    setModalVisible(true);
  };

  // Handle regenerate routes
  const handleRegenerateRoutes = async () => {
    try {
      const response = await fetch('/api/category-management/routes/regenerate', {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        message.success('Routes regenerated successfully');
      } else {
        message.error(data.error || 'Failed to regenerate routes');
      }
    } catch (error) {
      console.error('Error regenerating routes:', error);
      message.error('Failed to regenerate routes');
    }
  };

  const columns = [
    {
      title: 'Display Name',
      dataIndex: 'display_name',
      key: 'display_name',
      render: (text: string, record: Category) => (
        <Space>
          {record.icon && <span style={{ fontSize: 20 }}>{record.icon}</span>}
          <Text strong>{text}</Text>
        </Space>
      ),
    },
    {
      title: 'Name (ID)',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Category) => (
        <Tooltip title={`ID: ${record.category_id}`}>
          <Text code>{text}</Text>
        </Tooltip>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'category_type',
      key: 'category_type',
      render: (type: string) => <Tag color="blue">{type}</Tag>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : status === 'inactive' ? 'orange' : 'red'}>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Auto CRUD',
      dataIndex: 'auto_generate_crud_api',
      key: 'auto_generate_crud_api',
      render: (enabled: boolean) =>
        enabled ? (
          <Tag icon={<CheckCircleOutlined />} color="success">
            Enabled
          </Tag>
        ) : (
          <Tag color="default">Disabled</Tag>
        ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Category) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.category_id)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>Category Management</Title>
        <Text type="secondary">
          Manage categories with auto-generated CRUD APIs. Create categories and the system will automatically generate REST APIs for them.
        </Text>
      </div>

      {/* Statistics Cards */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Categories"
              value={categories.length}
              prefix={<ApiOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Active Categories"
              value={categories.filter(c => c.status === 'active').length}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Auto-CRUD Enabled"
              value={categories.filter(c => c.auto_generate_crud_api).length}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Items"
              value={statistics.reduce((sum, stat) => sum + stat.total_items, 0)}
            />
          </Card>
        </Col>
      </Row>

      {/* Actions Bar */}
      <Card style={{ marginBottom: 16 }}>
        <Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingCategory(null);
              form.resetFields();
              setModalVisible(true);
            }}
          >
            Create Category
          </Button>
          <Button icon={<ReloadOutlined />} onClick={fetchCategories}>
            Refresh
          </Button>
          <Button icon={<ApiOutlined />} onClick={handleRegenerateRoutes}>
            Regenerate Routes
          </Button>
        </Space>
      </Card>

      {/* Categories Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={categories}
          loading={loading}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} categories`,
          }}
        />
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        title={editingCategory ? 'Edit Category' : 'Create Category'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setEditingCategory(null);
        }}
        onOk={() => form.submit()}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            auto_generate_crud_api: true,
            status: 'active',
            sort_order: 0,
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Name (ID)"
                rules={[{ required: true, message: 'Please enter category name' }]}
                tooltip="Internal identifier, lowercase with underscores"
              >
                <Input placeholder="e.g., my_category" disabled={!!editingCategory} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="display_name"
                label="Display Name"
                rules={[{ required: true, message: 'Please enter display name' }]}
              >
                <Input placeholder="e.g., My Category" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="Description"
          >
            <TextArea rows={3} placeholder="Describe this category..." />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="category_type"
                label="Category Type"
                rules={[{ required: true, message: 'Please select a type' }]}
              >
                <Select placeholder="Select type">
                  {categoryTypes.map(type => (
                    <Option key={type} value={type}>
                      {type.replace(/_/g, ' ').toUpperCase()}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="status"
                label="Status"
                rules={[{ required: true }]}
              >
                <Select>
                  <Option value="active">Active</Option>
                  <Option value="inactive">Inactive</Option>
                  <Option value="archived">Archived</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="icon"
                label="Icon"
                tooltip="Emoji or icon character"
              >
                <Input placeholder="📁" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="color"
                label="Color"
                tooltip="Hex color code"
              >
                <Input placeholder="#1890ff" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="sort_order"
                label="Sort Order"
              >
                <Input type="number" placeholder="0" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="auto_generate_crud_api"
            label="Auto-Generate CRUD API"
            valuePropName="checked"
            tooltip="Automatically create REST API endpoints for this category"
          >
            <Switch />
          </Form.Item>

          {!editingCategory && (
            <div style={{ 
              padding: '12px', 
              background: '#f0f5ff', 
              borderRadius: '4px',
              marginTop: '16px'
            }}>
              <Space direction="vertical" size="small">
                <Text strong><InfoCircleOutlined /> What happens when you create a category?</Text>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  • A new category will be created in the database
                </Text>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  • If "Auto-Generate CRUD API" is enabled, REST endpoints will be created automatically
                </Text>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  • You'll be able to manage items within this category
                </Text>
              </Space>
            </div>
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default CategoryManagement;
