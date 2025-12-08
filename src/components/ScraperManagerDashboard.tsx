import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Table,
  Modal,
  Form,
  Input,
  Select,
  Tag,
  Space,
  Statistic,
  Row,
  Col,
  message,
  Divider,
  Badge,
  Tooltip,
} from 'antd';
import {
  PlayCircleOutlined,
  PauseCircleOutlined,
  PlusOutlined,
  DeleteOutlined,
  EyeOutlined,
  LinkOutlined,
  DatabaseOutlined,
  ThunderboltOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import axios from 'axios';

const { TextArea } = Input;

export const ScraperManagerDashboard: React.FC = () => {
  const [instances, setInstances] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [seedModalVisible, setSeedModalVisible] = useState(false);
  const [selectedInstance, setSelectedInstance] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [form] = Form.useForm();
  const [seedForm] = Form.useForm();

  useEffect(() => {
    loadInstances();
    loadStatus();
    
    // Auto-refresh every 5 seconds
    const interval = setInterval(() => {
      loadInstances();
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const loadInstances = async () => {
    try {
      const response = await axios.get('/api/scraper-manager/instances');
      if (response.data.success) {
        setInstances(response.data.instances);
      }
    } catch (error) {
      console.error('Failed to load instances:', error);
    }
  };

  const loadStatus = async () => {
    try {
      const response = await axios.get('/api/scraper-manager/status');
      if (response.data.success) {
        setStats(response.data.status);
      }
    } catch (error) {
      console.error('Failed to load status:', error);
    }
  };

  const handleCreateInstance = async (values: any) => {
    setLoading(true);
    try {
      const response = await axios.post('/api/scraper-manager/instances', values);
      if (response.data.success) {
        message.success('Instance created successfully');
        setCreateModalVisible(false);
        form.resetFields();
        loadInstances();
        loadStatus();
      }
    } catch (error: any) {
      message.error(error.response?.data?.error || 'Failed to create instance');
    } finally {
      setLoading(false);
    }
  };

  const handleStartInstance = async (instanceId: string) => {
    setLoading(true);
    try {
      const response = await axios.post(`/api/scraper-manager/instances/${instanceId}/start`);
      if (response.data.success) {
        message.success('Instance started');
        loadInstances();
        loadStatus();
      }
    } catch (error: any) {
      message.error(error.response?.data?.error || 'Failed to start instance');
    } finally {
      setLoading(false);
    }
  };

  const handleStopInstance = async (instanceId: string) => {
    setLoading(true);
    try {
      const response = await axios.post(`/api/scraper-manager/instances/${instanceId}/stop`);
      if (response.data.success) {
        message.success('Instance stopped');
        loadInstances();
        loadStatus();
      }
    } catch (error: any) {
      message.error(error.response?.data?.error || 'Failed to stop instance');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteInstance = async (instanceId: string) => {
    Modal.confirm({
      title: 'Delete Instance',
      content: 'Are you sure you want to delete this instance? This action cannot be undone.',
      onOk: async () => {
        try {
          const response = await axios.delete(`/api/scraper-manager/instances/${instanceId}`);
          if (response.data.success) {
            message.success('Instance deleted');
            loadInstances();
            loadStatus();
          }
        } catch (error: any) {
          message.error(error.response?.data?.error || 'Failed to delete instance');
        }
      },
    });
  };

  const handleAddSeeds = async (values: any) => {
    setLoading(true);
    try {
      const urls = values.urls.split('\n').filter((url: string) => url.trim());
      const response = await axios.post(
        `/api/scraper-manager/instances/${selectedInstance.id}/seeds/bulk`,
        {
          urls: urls.map((url: string) => ({
            url: url.trim(),
            priority: values.priority || 5,
            tags: values.tags ? values.tags.split(',').map((t: string) => t.trim()) : [],
          })),
        }
      );
      
      if (response.data.success) {
        message.success(`Added ${response.data.count} URLs`);
        setSeedModalVisible(false);
        seedForm.resetFields();
      }
    } catch (error: any) {
      message.error(error.response?.data?.error || 'Failed to add URLs');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: any) => (
        <Space>
          <DatabaseOutlined />
          <strong>{text}</strong>
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Badge
          status={status === 'running' ? 'processing' : 'default'}
          text={status.toUpperCase()}
        />
      ),
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space size="small">
          {record.status === 'stopped' ? (
            <Tooltip title="Start Instance">
              <Button
                type="primary"
                icon={<PlayCircleOutlined />}
                onClick={() => handleStartInstance(record.id)}
                loading={loading}
              />
            </Tooltip>
          ) : (
            <Tooltip title="Stop Instance">
              <Button
                icon={<PauseCircleOutlined />}
                onClick={() => handleStopInstance(record.id)}
                loading={loading}
              />
            </Tooltip>
          )}
          <Tooltip title="Add URLs">
            <Button
              icon={<LinkOutlined />}
              onClick={() => {
                setSelectedInstance(record);
                setSeedModalVisible(true);
              }}
            />
          </Tooltip>
          <Tooltip title="View Details">
            <Button icon={<EyeOutlined />} />
          </Tooltip>
          <Tooltip title="Delete Instance">
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDeleteInstance(record.id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Instances"
              value={stats?.totalInstances || 0}
              prefix={<DatabaseOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Running"
              value={stats?.runningInstances || 0}
              prefix={<ThunderboltOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Stopped"
              value={stats?.stoppedInstances || 0}
              prefix={<PauseCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Button
              type="primary"
              icon={<ReloadOutlined />}
              onClick={() => {
                loadInstances();
                loadStatus();
              }}
              block
              style={{ marginTop: 8 }}
            >
              Refresh
            </Button>
          </Card>
        </Col>
      </Row>

      <Card
        title="Scraper Instances"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setCreateModalVisible(true)}
          >
            Create Instance
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={instances}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title="Create Scraper Instance"
        open={createModalVisible}
        onCancel={() => {
          setCreateModalVisible(false);
          form.resetFields();
        }}
        footer={null}
      >
        <Form form={form} onFinish={handleCreateInstance} layout="vertical">
          <Form.Item
            name="name"
            label="Instance Name"
            rules={[{ required: true, message: 'Please enter instance name' }]}
          >
            <Input placeholder="e.g., Material Design Scraper" />
          </Form.Item>
          
          <Form.Item name={['config', 'maxConcurrency']} label="Max Concurrency">
            <Input type="number" placeholder="5" />
          </Form.Item>
          
          <Form.Item name={['config', 'timeout']} label="Timeout (ms)">
            <Input type="number" placeholder="30000" />
          </Form.Item>
          
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                Create
              </Button>
              <Button onClick={() => setCreateModalVisible(false)}>Cancel</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`Add URLs to ${selectedInstance?.name}`}
        open={seedModalVisible}
        onCancel={() => {
          setSeedModalVisible(false);
          seedForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form form={seedForm} onFinish={handleAddSeeds} layout="vertical">
          <Form.Item
            name="urls"
            label="URLs (one per line)"
            rules={[{ required: true, message: 'Please enter at least one URL' }]}
          >
            <TextArea
              rows={8}
              placeholder="https://example.com&#10;https://material.io&#10;https://www.tensorflow.org"
            />
          </Form.Item>
          
          <Form.Item name="priority" label="Priority" initialValue={5}>
            <Select>
              <Select.Option value={1}>Low</Select.Option>
              <Select.Option value={5}>Medium</Select.Option>
              <Select.Option value={10}>High</Select.Option>
            </Select>
          </Form.Item>
          
          <Form.Item name="tags" label="Tags (comma-separated)">
            <Input placeholder="material-design, components, ui-library" />
          </Form.Item>
          
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                Add URLs
              </Button>
              <Button onClick={() => setSeedModalVisible(false)}>Cancel</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ScraperManagerDashboard;
