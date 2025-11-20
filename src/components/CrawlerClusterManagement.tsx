/**
 * Crawler Cluster Management Component
 * 
 * UI for managing crawler clusters - grouping campaigns together for coordinated operations
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Button,
  Table,
  Modal,
  Form,
  Input,
  Select,
  Switch,
  InputNumber,
  message,
  Space,
  Tag,
  Typography,
  Tooltip,
  Popconfirm,
  Badge
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ClusterOutlined,
  ReloadOutlined,
  LinkOutlined
} from '@ant-design/icons';
import axios from 'axios';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface Cluster {
  id: string;
  name: string;
  description: string;
  reason: string;
  strategy: string;
  max_crawlers: number;
  auto_scale: boolean;
  status: string;
  campaigns?: any[];
  created_at: string;
}

interface CrawlerClusterManagementProps {
  onSelectCluster?: (cluster: Cluster) => void;
}

const CrawlerClusterManagement: React.FC<CrawlerClusterManagementProps> = ({ onSelectCluster }) => {
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingCluster, setEditingCluster] = useState<Cluster | null>(null);
  const [form] = Form.useForm();

  // Fetch clusters
  const fetchClusters = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/campaigns/clusters');
      if (response.data.success) {
        setClusters(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching clusters:', error);
      message.error('Failed to fetch clusters');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClusters();
  }, [fetchClusters]);

  // Handle create/edit cluster
  const handleSaveCluster = async (values: any) => {
    try {
      if (editingCluster) {
        // Update existing cluster
        const response = await axios.put(`/api/campaigns/clusters/${editingCluster.id}`, values);
        if (response.data.success) {
          message.success('Cluster updated successfully');
          fetchClusters();
          setShowModal(false);
          setEditingCluster(null);
          form.resetFields();
        }
      } else {
        // Create new cluster
        const response = await axios.post('/api/campaigns/clusters', values);
        if (response.data.success) {
          message.success('Cluster created successfully');
          fetchClusters();
          setShowModal(false);
          form.resetFields();
        }
      }
    } catch (error) {
      console.error('Error saving cluster:', error);
      message.error('Failed to save cluster');
    }
  };

  // Handle delete cluster
  const handleDeleteCluster = async (clusterId: string) => {
    try {
      const response = await axios.delete(`/api/campaigns/clusters/${clusterId}`);
      if (response.data.success) {
        message.success('Cluster deleted successfully');
        fetchClusters();
      }
    } catch (error) {
      console.error('Error deleting cluster:', error);
      message.error('Failed to delete cluster');
    }
  };

  // Open edit modal
  const handleEditCluster = (cluster: Cluster) => {
    setEditingCluster(cluster);
    form.setFieldsValue({
      name: cluster.name,
      description: cluster.description,
      reason: cluster.reason,
      strategy: cluster.strategy,
      maxCrawlers: cluster.max_crawlers,
      autoScale: cluster.auto_scale
    });
    setShowModal(true);
  };

  // View cluster details
  const handleViewCluster = async (cluster: Cluster) => {
    try {
      const response = await axios.get(`/api/campaigns/clusters/${cluster.id}`);
      if (response.data.success && onSelectCluster) {
        onSelectCluster(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching cluster details:', error);
      message.error('Failed to fetch cluster details');
    }
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Cluster) => (
        <Space>
          <ClusterOutlined />
          <a onClick={() => handleViewCluster(record)}>{text}</a>
        </Space>
      )
    },
    {
      title: 'Reason',
      dataIndex: 'reason',
      key: 'reason',
      ellipsis: true
    },
    {
      title: 'Strategy',
      dataIndex: 'strategy',
      key: 'strategy',
      render: (strategy: string) => (
        <Tag color="blue">{strategy}</Tag>
      )
    },
    {
      title: 'Max Crawlers',
      dataIndex: 'max_crawlers',
      key: 'max_crawlers'
    },
    {
      title: 'Auto Scale',
      dataIndex: 'auto_scale',
      key: 'auto_scale',
      render: (autoScale: boolean) => (
        <Badge
          status={autoScale ? 'success' : 'default'}
          text={autoScale ? 'Enabled' : 'Disabled'}
        />
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'default'}>
          {status.toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Cluster) => (
        <Space>
          <Tooltip title="Edit">
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => handleEditCluster(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Are you sure you want to delete this cluster?"
            onConfirm={() => handleDeleteCluster(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title="Delete">
              <Button type="link" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <Card
      title={
        <Space>
          <ClusterOutlined />
          <Title level={4} style={{ margin: 0 }}>Crawler Clusters</Title>
        </Space>
      }
      extra={
        <Space>
          <Button
            icon={<ReloadOutlined />}
            onClick={fetchClusters}
            loading={loading}
          >
            Refresh
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingCluster(null);
              form.resetFields();
              setShowModal(true);
            }}
          >
            Create Cluster
          </Button>
        </Space>
      }
    >
      <Table
        columns={columns}
        dataSource={clusters}
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingCluster ? 'Edit Cluster' : 'Create New Cluster'}
        open={showModal}
        onCancel={() => {
          setShowModal(false);
          setEditingCluster(null);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSaveCluster}
          initialValues={{
            strategy: 'load-balanced',
            maxCrawlers: 10,
            autoScale: true
          }}
        >
          <Form.Item
            name="name"
            label="Cluster Name"
            rules={[{ required: true, message: 'Please enter cluster name' }]}
          >
            <Input placeholder="e.g., E-commerce Crawlers" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
          >
            <TextArea
              rows={3}
              placeholder="Describe what this cluster is for..."
            />
          </Form.Item>

          <Form.Item
            name="reason"
            label="Reason for Cluster"
            rules={[{ required: true, message: 'Please explain why this cluster is needed' }]}
          >
            <TextArea
              rows={2}
              placeholder="Why are these campaigns grouped together?"
            />
          </Form.Item>

          <Form.Item
            name="strategy"
            label="Load Balancing Strategy"
            rules={[{ required: true }]}
          >
            <Select>
              <Option value="load-balanced">Load Balanced</Option>
              <Option value="round-robin">Round Robin</Option>
              <Option value="priority-based">Priority Based</Option>
              <Option value="least-busy">Least Busy</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="maxCrawlers"
            label="Maximum Crawlers"
            rules={[{ required: true }]}
          >
            <InputNumber min={1} max={100} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="autoScale"
            label="Enable Auto-Scaling"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default CrawlerClusterManagement;
