/**
 * Service Management Component
 * 
 * Comprehensive UI for managing services with bundled API endpoints and data streams
 * Features:
 * - List, create, edit, delete services
 * - Multi-select API endpoints for bundling
 * - Manage endpoint bindings
 * - Configure data streams for services
 * - View service metrics and status
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
  Transfer,
  Checkbox,
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
  AppstoreOutlined,
  CloudServerOutlined,
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

interface Service {
  service_id: string;
  name: string;
  description: string;
  service_type: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  endpoint_count: number;
  bundled_endpoints?: any[];
  data_streams?: any[];
  workflow_name?: string;
}

interface Endpoint {
  endpoint_id: string;
  title: string;
  path: string;
  method: string;
  description: string;
  category: string;
  service_type: string;
}

const ServiceManagement: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [availableEndpoints, setAvailableEndpoints] = useState<Endpoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailsDrawerVisible, setDetailsDrawerVisible] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedEndpoints, setSelectedEndpoints] = useState<string[]>([]);
  const [form] = Form.useForm();

  // Fetch services
  const fetchServices = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/services');
      const result = await response.json();
      if (result.success) {
        setServices(result.data);
      } else {
        message.error('Failed to fetch services');
      }
    } catch (error) {
      console.error('Error fetching services:', error);
      message.error('Error loading services');
    } finally {
      setLoading(false);
    }
  };

  // Fetch available endpoints
  const fetchAvailableEndpoints = async () => {
    try {
      const response = await fetch('/api/services/available/endpoints');
      const result = await response.json();
      if (result.success) {
        setAvailableEndpoints(result.data);
      }
    } catch (error) {
      console.error('Error fetching endpoints:', error);
    }
  };

  useEffect(() => {
    fetchServices();
    fetchAvailableEndpoints();
  }, []);

  // Create or update service
  const handleSaveService = async (values: any) => {
    setLoading(true);
    try {
      const serviceData = {
        ...values,
        bundled_endpoints: selectedEndpoints.map(endpoint_id => ({ endpoint_id })),
      };

      const url = editingService
        ? `/api/services/${editingService.service_id}`
        : '/api/services';
      
      const method = editingService ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(serviceData),
      });

      const result = await response.json();

      if (result.success) {
        message.success(`Service ${editingService ? 'updated' : 'created'} successfully`);
        setModalVisible(false);
        setEditingService(null);
        setSelectedEndpoints([]);
        form.resetFields();
        fetchServices();
      } else {
        message.error(result.error || 'Failed to save service');
      }
    } catch (error) {
      console.error('Error saving service:', error);
      message.error('Error saving service');
    } finally {
      setLoading(false);
    }
  };

  // Delete service
  const handleDeleteService = async (serviceId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/services/${serviceId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        message.success('Service deleted successfully');
        fetchServices();
      } else {
        message.error(result.error || 'Failed to delete service');
      }
    } catch (error) {
      console.error('Error deleting service:', error);
      message.error('Error deleting service');
    } finally {
      setLoading(false);
    }
  };

  // Open edit modal
  const handleEdit = (service: Service) => {
    setEditingService(service);
    form.setFieldsValue({
      name: service.name,
      description: service.description,
      service_type: service.service_type,
      supports_realtime: service.bundled_endpoints?.some(e => e.supports_realtime) || false,
    });
    
    // Set selected endpoints if editing
    const currentEndpoints = Array.isArray(service.bundled_endpoints)
      ? service.bundled_endpoints.map(e => e.endpoint_id)
      : [];
    setSelectedEndpoints(currentEndpoints);
    
    setModalVisible(true);
  };

  // View service details
  const handleViewDetails = async (service: Service) => {
    try {
      const response = await fetch(`/api/services/${service.service_id}`);
      const result = await response.json();
      if (result.success) {
        setSelectedService(result.data);
        setDetailsDrawerVisible(true);
      }
    } catch (error) {
      console.error('Error fetching service details:', error);
      message.error('Error loading service details');
    }
  };

  // Get status badge
  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge status="success" text="Active" />
    ) : (
      <Badge status="default" text="Inactive" />
    );
  };

  // Handle endpoint selection change
  const handleEndpointChange = (targetKeys: string[]) => {
    setSelectedEndpoints(targetKeys);
  };

  // Render transfer for endpoint selection
  const renderEndpointTransfer = () => {
    const dataSource = availableEndpoints.map(endpoint => ({
      key: endpoint.endpoint_id,
      title: endpoint.title,
      description: `${endpoint.method} ${endpoint.path}`,
      category: endpoint.category,
    }));

    return (
      <Transfer
        dataSource={dataSource}
        titles={['Available Endpoints', 'Selected Endpoints']}
        targetKeys={selectedEndpoints}
        onChange={handleEndpointChange}
        render={item => (
          <div>
            <div><Text strong>{item.title}</Text></div>
            <div><Text type="secondary">{item.description}</Text></div>
            <Tag color="blue" size="small">{item.category}</Tag>
          </div>
        )}
        listStyle={{
          width: 300,
          height: 400,
        }}
        showSearch
        filterOption={(inputValue, item) =>
          item.title?.toLowerCase().includes(inputValue.toLowerCase()) ||
          item.description?.toLowerCase().includes(inputValue.toLowerCase())
        }
      />
    );
  };

  // Table columns
  const columns = [
    {
      title: 'Service Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Service) => (
        <Space>
          <CloudServerOutlined />
          <Text strong>{text}</Text>
        </Space>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'service_type',
      key: 'service_type',
      render: (text: string) => <Tag color="purple">{text || 'N/A'}</Tag>,
    },
    {
      title: 'Status',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (isActive: boolean) => getStatusBadge(isActive),
    },
    {
      title: 'Bundled Endpoints',
      dataIndex: 'endpoint_count',
      key: 'endpoint_count',
      render: (count: number) => (
        <Tooltip title={`${count} endpoints configured`}>
          <Tag icon={<ApiOutlined />}>{count || 0}</Tag>
        </Tooltip>
      ),
    },
    {
      title: 'Workflow',
      dataIndex: 'workflow_name',
      key: 'workflow_name',
      render: (name: string) => name ? <Tag color="cyan">{name}</Tag> : <Text type="secondary">None</Text>,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Service) => (
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
          <Popconfirm
            title="Are you sure you want to delete this service?"
            onConfirm={() => handleDeleteService(record.service_id)}
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
            <CloudServerOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
            <Title level={3} style={{ margin: 0 }}>
              Service Management
            </Title>
          </Space>
        }
        extra={
          <Space>
            <Button icon={<ReloadOutlined />} onClick={fetchServices}>
              Refresh
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingService(null);
                setSelectedEndpoints([]);
                form.resetFields();
                setModalVisible(true);
              }}
            >
              Create Service
            </Button>
          </Space>
        }
      >
        <Alert
          message="Service Bundling"
          description="Create services by bundling multiple API endpoints together. Services can have data streams and be composed into complex workflows."
          type="info"
          showIcon
          icon={<AppstoreOutlined />}
          style={{ marginBottom: 16 }}
        />

        <Table
          columns={columns}
          dataSource={services}
          loading={loading}
          rowKey="service_id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} services`,
          }}
        />
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        title={editingService ? 'Edit Service' : 'Create Service'}
        visible={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingService(null);
          setSelectedEndpoints([]);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        width={800}
        confirmLoading={loading}
      >
        <Form form={form} layout="vertical" onFinish={handleSaveService}>
          <Form.Item
            name="name"
            label="Service Name"
            rules={[{ required: true, message: 'Please enter service name' }]}
          >
            <Input placeholder="e.g., User Management Service" />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <TextArea rows={3} placeholder="Describe the purpose of this service" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="service_type"
                label="Service Type"
                rules={[{ required: true, message: 'Please select service type' }]}
              >
                <Select placeholder="Select service type">
                  <Option value="api">API Service</Option>
                  <Option value="data-processor">Data Processor</Option>
                  <Option value="ai-engine">AI Engine</Option>
                  <Option value="database">Database</Option>
                  <Option value="workflow-engine">Workflow Engine</Option>
                  <Option value="notification">Notification</Option>
                  <Option value="payment-processor">Payment Processor</Option>
                  <Option value="web-crawler">Web Crawler</Option>
                  <Option value="blockchain">Blockchain</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="supports_realtime" label="Real-time Support" valuePropName="checked">
                <Switch checkedChildren="Enabled" unCheckedChildren="Disabled" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Bundle API Endpoints">
            <Paragraph type="secondary">
              Select the API endpoints that this service should bundle together. These endpoints
              will be accessible through this service.
            </Paragraph>
            {renderEndpointTransfer()}
          </Form.Item>
        </Form>
      </Modal>

      {/* Details Drawer */}
      <Drawer
        title={
          <Space>
            <CloudServerOutlined />
            <Text strong>Service Details</Text>
          </Space>
        }
        width={720}
        visible={detailsDrawerVisible}
        onClose={() => setDetailsDrawerVisible(false)}
      >
        {selectedService && (
          <Tabs defaultActiveKey="info">
            <TabPane tab="Information" key="info">
              <Descriptions bordered column={1}>
                <Descriptions.Item label="Service ID">
                  <Text code>{selectedService.service_id}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Name">{selectedService.name}</Descriptions.Item>
                <Descriptions.Item label="Description">
                  {selectedService.description || 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="Status">
                  {getStatusBadge(selectedService.is_active)}
                </Descriptions.Item>
                <Descriptions.Item label="Service Type">
                  <Tag color="purple">{selectedService.service_type || 'N/A'}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Workflow">
                  {selectedService.workflow_name ? (
                    <Tag color="cyan">{selectedService.workflow_name}</Tag>
                  ) : (
                    <Text type="secondary">None</Text>
                  )}
                </Descriptions.Item>
                <Descriptions.Item label="Created">
                  {new Date(selectedService.created_at).toLocaleString()}
                </Descriptions.Item>
                <Descriptions.Item label="Last Updated">
                  {new Date(selectedService.updated_at).toLocaleString()}
                </Descriptions.Item>
              </Descriptions>
            </TabPane>

            <TabPane
              tab={
                <span>
                  <ApiOutlined />
                  Bundled Endpoints ({selectedService.bundled_endpoints?.length || 0})
                </span>
              }
              key="endpoints"
            >
              {selectedService.bundled_endpoints && selectedService.bundled_endpoints.length > 0 ? (
                <List
                  dataSource={selectedService.bundled_endpoints}
                  renderItem={(endpoint: any) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<ApiOutlined style={{ fontSize: 20, color: '#1890ff' }} />}
                        title={
                          <Space>
                            <Text strong>{endpoint.title}</Text>
                            <Tag color="blue">{endpoint.method}</Tag>
                            {endpoint.is_required && <Tag color="red">Required</Tag>}
                          </Space>
                        }
                        description={
                          <div>
                            <div><Text code>{endpoint.path}</Text></div>
                            <div><Text type="secondary">{endpoint.description}</Text></div>
                            <Tag color="cyan" size="small">{endpoint.endpoint_category}</Tag>
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
              ) : (
                <Empty description="No endpoints bundled" />
              )}
            </TabPane>

            <TabPane
              tab={
                <span>
                  <BranchesOutlined />
                  Data Streams ({selectedService.data_streams?.length || 0})
                </span>
              }
              key="streams"
            >
              {selectedService.data_streams && selectedService.data_streams.length > 0 ? (
                <List
                  dataSource={selectedService.data_streams}
                  renderItem={(stream: any) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<BranchesOutlined style={{ fontSize: 20, color: '#52c41a' }} />}
                        title={<Text strong>{stream.name}</Text>}
                        description={
                          <div>
                            <div>{stream.description}</div>
                            <Space>
                              <Tag color="green">{stream.stream_type}</Tag>
                              <Tag>{stream.direction}</Tag>
                              <Badge
                                status={stream.is_active ? 'success' : 'default'}
                                text={stream.is_active ? 'Active' : 'Inactive'}
                              />
                            </Space>
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
              ) : (
                <Empty description="No data streams configured" />
              )}
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
                      title="Bundled Endpoints"
                      value={selectedService.bundled_endpoints?.length || 0}
                      prefix={<ApiOutlined />}
                    />
                  </Card>
                </Col>
                <Col span={12}>
                  <Card>
                    <Statistic
                      title="Data Streams"
                      value={selectedService.data_streams?.length || 0}
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

export default ServiceManagement;
