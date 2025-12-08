import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Tag, Space, Modal, Form, Input, Select, Switch, message, Tabs, Tree, Descriptions, Statistic, Row, Col } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ApiOutlined, FolderOutlined, ReloadOutlined } from '@ant-design/icons';
import { categoryManagementAPI } from '../../services/apiService';

const { TabPane } = Tabs;
const { TextArea } = Input;
const { Option } = Select;

const CategoryManagementDashboard: React.FC = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [form] = Form.useForm();
  const [stats, setStats] = useState<any>({});
  const [schemaModalVisible, setSchemaModalVisible] = useState(false);
  const [crudModalVisible, setCrudModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [crudStatus, setCrudStatus] = useState<any>(null);

  useEffect(() => {
    loadCategories();
    loadStats();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const response = await categoryManagementAPI.getCategories();
      setCategories(response.data || []);
    } catch (error) {
      message.error('Failed to load categories');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await categoryManagementAPI.getCategoryStats();
      setStats(response.data || {});
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleCreate = () => {
    setEditingCategory(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (category: any) => {
    setEditingCategory(category);
    form.setFieldsValue({
      slug: category.slug,
      display_name: category.display_name,
      description: category.description,
      category_type: category.category_type,
      default_table: category.default_table,
      config_table: category.config_table,
      log_table: category.log_table,
      auto_generate_crud_api: category.auto_generate_crud_api,
      status: category.status,
      parent_category_id: category.parent_category_id,
      icon: category.icon,
      color: category.color,
      sort_order: category.sort_order,
    });
    setModalVisible(true);
  };

  const handleDelete = async (categoryId: string) => {
    Modal.confirm({
      title: 'Delete Category',
      content: 'Are you sure you want to delete this category? This action cannot be undone.',
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          await categoryManagementAPI.deleteCategory(categoryId);
          message.success('Category deleted successfully');
          loadCategories();
          loadStats();
        } catch (error) {
          message.error('Failed to delete category');
          console.error(error);
        }
      },
    });
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingCategory) {
        await categoryManagementAPI.updateCategory(editingCategory.category_id, values);
        message.success('Category updated successfully');
      } else {
        await categoryManagementAPI.createCategory(values);
        message.success('Category created successfully');
      }
      setModalVisible(false);
      form.resetFields();
      loadCategories();
      loadStats();
    } catch (error) {
      message.error(editingCategory ? 'Failed to update category' : 'Failed to create category');
      console.error(error);
    }
  };

  const handleGenerateCRUD = async (category: any) => {
    setSelectedCategory(category);
    setCrudModalVisible(true);
    try {
      const response = await categoryManagementAPI.generateCRUD(category.category_id);
      setCrudStatus(response.data);
      message.success('CRUD generation initiated');
    } catch (error) {
      message.error('Failed to generate CRUD');
      console.error(error);
    }
  };

  const handleValidateSchema = async (category: any) => {
    try {
      const response = await categoryManagementAPI.validateSchema(category.category_id);
      if (response.data.valid) {
        message.success('Schema is valid');
      } else {
        message.error(`Schema validation failed: ${response.data.errors?.join(', ')}`);
      }
    } catch (error) {
      message.error('Failed to validate schema');
      console.error(error);
    }
  };

  const buildCategoryTree = (categories: any[], parentId: string | null = null): any[] => {
    return categories
      .filter(cat => cat.parent_category_id === parentId)
      .map(cat => ({
        title: (
          <Space>
            <FolderOutlined style={{ color: cat.color || '#1890ff' }} />
            <span>{cat.display_name}</span>
            <Tag color={cat.status === 'active' ? 'green' : 'red'}>{cat.status}</Tag>
          </Space>
        ),
        key: cat.category_id,
        children: buildCategoryTree(categories, cat.category_id),
        data: cat,
      }));
  };

  const columns = [
    {
      title: 'Display Name',
      dataIndex: 'display_name',
      key: 'display_name',
      render: (text: string, record: any) => (
        <Space>
          {record.icon && <span>{record.icon}</span>}
          <span style={{ color: record.color }}>{text}</span>
        </Space>
      ),
    },
    {
      title: 'Slug',
      dataIndex: 'slug',
      key: 'slug',
    },
    {
      title: 'Type',
      dataIndex: 'category_type',
      key: 'category_type',
      render: (type: string) => type && <Tag>{type}</Tag>,
    },
    {
      title: 'Default Table',
      dataIndex: 'default_table',
      key: 'default_table',
      render: (table: string) => table && <Tag color="blue">{table}</Tag>,
    },
    {
      title: 'Auto CRUD',
      dataIndex: 'auto_generate_crud_api',
      key: 'auto_generate_crud_api',
      render: (enabled: boolean) => (
        <Tag color={enabled ? 'green' : 'default'}>{enabled ? 'Yes' : 'No'}</Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>{status}</Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            Edit
          </Button>
          {record.auto_generate_crud_api && (
            <Button 
              size="small" 
              icon={<ApiOutlined />} 
              onClick={() => handleGenerateCRUD(record)}
            >
              Generate CRUD
            </Button>
          )}
          <Button
            size="small"
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
      <Card
        title="Category Management"
        extra={
          <Space>
            <Button icon={<ReloadOutlined />} onClick={loadCategories}>
              Refresh
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
              Create Category
            </Button>
          </Space>
        }
      >
        <Tabs defaultActiveKey="table">
          <TabPane tab="Categories Table" key="table">
            <Table
              dataSource={categories}
              columns={columns}
              loading={loading}
              rowKey="category_id"
              pagination={{ pageSize: 10 }}
            />
          </TabPane>

          <TabPane tab="Category Tree" key="tree">
            <Tree
              showLine
              defaultExpandAll
              treeData={buildCategoryTree(categories)}
              onSelect={(selectedKeys, info: any) => {
                if (info.node.data) {
                  handleEdit(info.node.data);
                }
              }}
            />
          </TabPane>

          <TabPane tab="Statistics" key="stats">
            <Row gutter={16}>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="Total Categories"
                    value={stats.total_categories || 0}
                    prefix={<FolderOutlined />}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="Active Categories"
                    value={stats.active_categories || 0}
                    valueStyle={{ color: '#3f8600' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="Generated APIs"
                    value={stats.generated_apis || 0}
                    prefix={<ApiOutlined />}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="Category Types"
                    value={stats.unique_types || 0}
                  />
                </Card>
              </Col>
            </Row>
          </TabPane>
        </Tabs>
      </Card>

      <Modal
        title={editingCategory ? 'Edit Category' : 'Create Category'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        width={800}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="Slug"
            name="slug"
            rules={[{ required: true, message: 'Please enter a slug' }]}
          >
            <Input placeholder="category-slug" />
          </Form.Item>

          <Form.Item
            label="Display Name"
            name="display_name"
            rules={[{ required: true, message: 'Please enter a display name' }]}
          >
            <Input placeholder="Category Display Name" />
          </Form.Item>

          <Form.Item label="Description" name="description">
            <TextArea rows={3} placeholder="Category description" />
          </Form.Item>

          <Form.Item
            label="Category Type"
            name="category_type"
            rules={[{ required: true, message: 'Please select a category type' }]}
          >
            <Select placeholder="Select category type">
              <Option value="data">Data</Option>
              <Option value="analytics">Analytics</Option>
              <Option value="content">Content</Option>
              <Option value="workflow">Workflow</Option>
              <Option value="system">System</Option>
            </Select>
          </Form.Item>

          <Form.Item label="Default Table" name="default_table">
            <Input placeholder="default_table_name" />
          </Form.Item>

          <Form.Item label="Config Table" name="config_table">
            <Input placeholder="config_table_name" />
          </Form.Item>

          <Form.Item label="Log Table" name="log_table">
            <Input placeholder="log_table_name" />
          </Form.Item>

          <Form.Item label="Parent Category" name="parent_category_id">
            <Select placeholder="Select parent category" allowClear>
              {categories.map(cat => (
                <Option key={cat.category_id} value={cat.category_id}>
                  {cat.display_name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="Icon" name="icon">
            <Input placeholder="📁" />
          </Form.Item>

          <Form.Item label="Color" name="color">
            <Input type="color" />
          </Form.Item>

          <Form.Item label="Sort Order" name="sort_order">
            <Input type="number" placeholder="0" />
          </Form.Item>

          <Form.Item label="Auto Generate CRUD API" name="auto_generate_crud_api" valuePropName="checked">
            <Switch />
          </Form.Item>

          <Form.Item label="Status" name="status">
            <Select>
              <Option value="active">Active</Option>
              <Option value="inactive">Inactive</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="CRUD Generation Status"
        open={crudModalVisible}
        onCancel={() => setCrudModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setCrudModalVisible(false)}>
            Close
          </Button>,
        ]}
        width={600}
      >
        {crudStatus && (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Status">
              <Tag color={crudStatus.success ? 'green' : 'red'}>
                {crudStatus.success ? 'Success' : 'Failed'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Routes Generated">
              {crudStatus.routes_generated || 0}
            </Descriptions.Item>
            <Descriptions.Item label="Endpoints">
              {crudStatus.endpoints?.map((ep: string) => (
                <Tag key={ep} color="blue">{ep}</Tag>
              ))}
            </Descriptions.Item>
            {crudStatus.message && (
              <Descriptions.Item label="Message">
                {crudStatus.message}
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default CategoryManagementDashboard;
