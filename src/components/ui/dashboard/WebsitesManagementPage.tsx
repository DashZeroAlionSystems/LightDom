import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  Typography,
  message,
  Popconfirm,
  Spin
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  GlobalOutlined,
  SyncOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { Title } = Typography;
const { Option } = Select;

interface Website {
  key: string;
  id: string;
  name: string;
  url: string;
  status: 'active' | 'inactive' | 'error';
  lastOptimized: string;
  spaceSaved: number;
  optimizationCount: number;
}

const WebsitesManagementPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [websites, setWebsites] = useState<Website[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingWebsite, setEditingWebsite] = useState<Website | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchWebsites();
  }, []);

  const fetchWebsites = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data
      setWebsites([
        {
          key: '1',
          id: '1',
          name: 'Main Website',
          url: 'https://example.com',
          status: 'active',
          lastOptimized: '2025-10-22T10:30:00Z',
          spaceSaved: 1.2 * 1024 * 1024 * 1024,
          optimizationCount: 45
        },
        {
          key: '2',
          id: '2',
          name: 'Blog',
          url: 'https://blog.example.com',
          status: 'active',
          lastOptimized: '2025-10-21T15:20:00Z',
          spaceSaved: 800 * 1024 * 1024,
          optimizationCount: 32
        },
        {
          key: '3',
          id: '3',
          name: 'E-commerce Store',
          url: 'https://store.example.com',
          status: 'inactive',
          lastOptimized: '2025-10-18T09:15:00Z',
          spaceSaved: 2.5 * 1024 * 1024 * 1024,
          optimizationCount: 78
        }
      ]);
    } catch (error) {
      console.error('Failed to fetch websites:', error);
      message.error('Failed to load websites');
    } finally {
      setLoading(false);
    }
  };

  const handleAddWebsite = () => {
    setEditingWebsite(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEditWebsite = (website: Website) => {
    setEditingWebsite(website);
    form.setFieldsValue({
      name: website.name,
      url: website.url,
      status: website.status
    });
    setIsModalVisible(true);
  };

  const handleDeleteWebsite = async (id: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setWebsites(websites.filter(w => w.id !== id));
      message.success('Website deleted successfully');
    } catch (error) {
      console.error('Failed to delete website:', error);
      message.error('Failed to delete website');
    }
  };

  const handleOptimizeWebsite = async (id: string) => {
    try {
      message.loading({ content: 'Starting optimization...', key: 'optimize' });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      message.success({ content: 'Optimization completed!', key: 'optimize' });
      fetchWebsites();
    } catch (error) {
      console.error('Failed to optimize website:', error);
      message.error({ content: 'Optimization failed', key: 'optimize' });
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (editingWebsite) {
        // Update existing website
        setWebsites(websites.map(w => 
          w.id === editingWebsite.id 
            ? { ...w, ...values }
            : w
        ));
        message.success('Website updated successfully');
      } else {
        // Add new website
        const newWebsite: Website = {
          key: Date.now().toString(),
          id: Date.now().toString(),
          ...values,
          lastOptimized: new Date().toISOString(),
          spaceSaved: 0,
          optimizationCount: 0
        };
        setWebsites([...websites, newWebsite]);
        message.success('Website added successfully');
      }
      
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('Form validation failed:', error);
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const columns: ColumnsType<Website> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: Website) => (
        <Space>
          <GlobalOutlined />
          <span>{name}</span>
        </Space>
      )
    },
    {
      title: 'URL',
      dataIndex: 'url',
      key: 'url',
      render: (url: string) => (
        <a href={url} target="_blank" rel="noopener noreferrer">
          {url}
        </a>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const color = status === 'active' ? 'success' : status === 'inactive' ? 'default' : 'error';
        const icon = status === 'active' ? <CheckCircleOutlined /> : status === 'inactive' ? <CloseCircleOutlined /> : <CloseCircleOutlined />;
        return <Tag color={color} icon={icon}>{status.toUpperCase()}</Tag>;
      }
    },
    {
      title: 'Last Optimized',
      dataIndex: 'lastOptimized',
      key: 'lastOptimized',
      render: (date: string) => new Date(date).toLocaleDateString()
    },
    {
      title: 'Space Saved',
      dataIndex: 'spaceSaved',
      key: 'spaceSaved',
      render: (bytes: number) => `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`,
      sorter: (a, b) => a.spaceSaved - b.spaceSaved
    },
    {
      title: 'Optimizations',
      dataIndex: 'optimizationCount',
      key: 'optimizationCount',
      sorter: (a, b) => a.optimizationCount - b.optimizationCount
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record: Website) => (
        <Space>
          <Button
            type="link"
            icon={<SyncOutlined />}
            onClick={() => handleOptimizeWebsite(record.id)}
            disabled={record.status !== 'active'}
          >
            Optimize
          </Button>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEditWebsite(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this website?"
            onConfirm={() => handleDeleteWebsite(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={2}>Websites Management</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAddWebsite}>
          Add Website
        </Button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
          <Spin size="large" />
        </div>
      ) : (
        <Card>
          <Table
            columns={columns}
            dataSource={websites}
            pagination={{ pageSize: 10 }}
          />
        </Card>
      )}

      <Modal
        title={editingWebsite ? 'Edit Website' : 'Add Website'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText={editingWebsite ? 'Update' : 'Add'}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="name"
            label="Website Name"
            rules={[{ required: true, message: 'Please enter website name' }]}
          >
            <Input placeholder="Enter website name" />
          </Form.Item>

          <Form.Item
            name="url"
            label="Website URL"
            rules={[
              { required: true, message: 'Please enter website URL' },
              { type: 'url', message: 'Please enter a valid URL' }
            ]}
          >
            <Input placeholder="https://example.com" />
          </Form.Item>

          <Form.Item
            name="status"
            label="Status"
            initialValue="active"
            rules={[{ required: true, message: 'Please select status' }]}
          >
            <Select>
              <Option value="active">Active</Option>
              <Option value="inactive">Inactive</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default WebsitesManagementPage;
