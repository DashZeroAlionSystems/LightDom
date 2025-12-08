/**
 * Lead Generation Dashboard
 * 
 * Comprehensive dashboard for managing leads captured from campaigns,
 * crawlers, and other data sources. Provides lead scoring, filtering,
 * assignment, and analytics.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Row,
  Col,
  Button,
  Table,
  Tag,
  Space,
  Statistic,
  Input,
  Select,
  Tabs,
  Modal,
  Form,
  Badge,
  Tooltip,
  Progress,
  List,
  message,
  Dropdown,
  Menu,
  Avatar,
  Empty,
} from 'antd';
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  GlobalOutlined,
  PlusOutlined,
  SearchOutlined,
  FilterOutlined,
  ExportOutlined,
  ImportOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  StarOutlined,
  StarFilled,
  MoreOutlined,
  ReloadOutlined,
  TagOutlined,
  EditOutlined,
  EyeOutlined,
  BarChartOutlined,
  LineChartOutlined,
} from '@ant-design/icons';
import { leadGenerationAPI, Lead, LeadStatistics } from '../../services/apiService';

const { Search } = Input;
const { Option } = Select;
const { TabPane } = Tabs;
const { TextArea } = Input;

export const LeadGenerationDashboard: React.FC = () => {
  // State
  const [leads, setLeads] = useState<Lead[]>([]);
  const [statistics, setStatistics] = useState<LeadStatistics | null>(null);
  const [sourcePerformance, setSourcePerformance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('leads');
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  
  // Filters
  const [filters, setFilters] = useState<{
    status?: string;
    quality?: string;
    sourceType?: string;
    search?: string;
  }>({});
  
  // Modals
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [form] = Form.useForm();

  // Fetch leads
  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const result = await leadGenerationAPI.getLeads({
        ...filters,
        page: pagination.current,
        limit: pagination.pageSize,
      });
      setLeads(result.leads);
      setPagination(prev => ({ ...prev, total: result.total }));
    } catch (error) {
      console.error('Failed to fetch leads:', error);
      message.error('Failed to load leads');
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.current, pagination.pageSize]);

  // Fetch statistics
  const fetchStatistics = useCallback(async () => {
    try {
      const [stats, performance] = await Promise.all([
        leadGenerationAPI.getStatistics(),
        leadGenerationAPI.getSourcePerformance(),
      ]);
      setStatistics(stats);
      setSourcePerformance(performance);
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
    }
  }, []);

  useEffect(() => {
    fetchLeads();
    fetchStatistics();
  }, [fetchLeads, fetchStatistics]);

  // Handlers
  const handleCreateLead = async (values: any) => {
    try {
      await leadGenerationAPI.createLead(values);
      message.success('Lead created successfully');
      setCreateModalVisible(false);
      form.resetFields();
      fetchLeads();
      fetchStatistics();
    } catch (error) {
      message.error('Failed to create lead');
    }
  };

  const handleUpdateStatus = async (leadId: number, status: string) => {
    try {
      await leadGenerationAPI.updateStatus(leadId, status);
      message.success('Status updated');
      fetchLeads();
      fetchStatistics();
    } catch (error) {
      message.error('Failed to update status');
    }
  };

  const handleViewLead = async (lead: Lead) => {
    setSelectedLead(lead);
    setViewModalVisible(true);
  };

  // Status colors
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      new: 'blue',
      contacted: 'orange',
      qualified: 'green',
      converted: 'purple',
      lost: 'red',
    };
    return colors[status] || 'default';
  };

  // Quality colors
  const getQualityColor = (quality: string) => {
    const colors: Record<string, string> = {
      high: 'green',
      medium: 'orange',
      low: 'red',
    };
    return colors[quality] || 'default';
  };

  // Table columns
  const columns = [
    {
      title: 'Lead',
      key: 'lead',
      render: (_: any, record: Lead) => (
        <Space>
          <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }}>
            {record.name?.charAt(0).toUpperCase()}
          </Avatar>
          <div>
            <div style={{ fontWeight: 500 }}>{record.name || 'Unknown'}</div>
            <div style={{ fontSize: 12, color: '#666' }}>{record.email}</div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Company',
      dataIndex: 'company',
      key: 'company',
      render: (company: string) => company || '-',
    },
    {
      title: 'Score',
      dataIndex: 'score',
      key: 'score',
      render: (score: number) => (
        <Progress
          percent={score}
          size="small"
          strokeColor={score >= 70 ? '#52c41a' : score >= 40 ? '#faad14' : '#f5222d'}
          format={(p) => p}
        />
      ),
      width: 120,
    },
    {
      title: 'Quality',
      dataIndex: 'quality',
      key: 'quality',
      render: (quality: string) => (
        <Tag color={getQualityColor(quality)}>
          {quality === 'high' && <StarFilled style={{ marginRight: 4 }} />}
          {quality.charAt(0).toUpperCase() + quality.slice(1)}
        </Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string, record: Lead) => (
        <Select
          value={status}
          size="small"
          style={{ width: 120 }}
          onChange={(value) => handleUpdateStatus(record.id, value)}
        >
          <Option value="new">New</Option>
          <Option value="contacted">Contacted</Option>
          <Option value="qualified">Qualified</Option>
          <Option value="converted">Converted</Option>
          <Option value="lost">Lost</Option>
        </Select>
      ),
    },
    {
      title: 'Source',
      dataIndex: 'sourceType',
      key: 'sourceType',
      render: (source: string) => <Tag>{source}</Tag>,
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Lead) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleViewLead(record)}
            />
          </Tooltip>
          <Dropdown
            overlay={
              <Menu>
                <Menu.Item key="edit" icon={<EditOutlined />}>
                  Edit Lead
                </Menu.Item>
                <Menu.Item key="email" icon={<MailOutlined />}>
                  Send Email
                </Menu.Item>
                <Menu.Item key="tag" icon={<TagOutlined />}>
                  Add Tags
                </Menu.Item>
                <Menu.Item key="assign" icon={<TeamOutlined />}>
                  Assign
                </Menu.Item>
              </Menu>
            }
          >
            <Button size="small" icon={<MoreOutlined />} />
          </Dropdown>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Row gutter={[16, 16]}>
        {/* Header */}
        <Col span={24}>
          <Card>
            <Row justify="space-between" align="middle">
              <Col>
                <Space>
                  <TeamOutlined style={{ fontSize: 24, color: '#1890ff' }} />
                  <div>
                    <h2 style={{ margin: 0 }}>Lead Generation</h2>
                    <p style={{ margin: 0, color: '#666' }}>
                      Manage leads from campaigns and data sources
                    </p>
                  </div>
                </Space>
              </Col>
              <Col>
                <Space>
                  <Button icon={<ReloadOutlined />} onClick={() => { fetchLeads(); fetchStatistics(); }} loading={loading}>
                    Refresh
                  </Button>
                  <Button icon={<ImportOutlined />}>
                    Import
                  </Button>
                  <Button icon={<ExportOutlined />}>
                    Export
                  </Button>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setCreateModalVisible(true)}
                  >
                    Add Lead
                  </Button>
                </Space>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Stats Cards */}
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Leads"
              value={statistics?.total || 0}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="High Quality"
              value={statistics?.byQuality?.high || 0}
              prefix={<StarFilled />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="New This Week"
              value={statistics?.recentLeads || 0}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Conversion Rate"
              value={statistics?.conversionRate || 0}
              suffix="%"
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>

        {/* Main Content */}
        <Col span={24}>
          <Card>
            <Tabs activeKey={activeTab} onChange={setActiveTab}>
              <TabPane tab="All Leads" key="leads">
                {/* Filters */}
                <Row gutter={16} style={{ marginBottom: 16 }}>
                  <Col xs={24} sm={8}>
                    <Search
                      placeholder="Search leads..."
                      onSearch={(value) => setFilters(f => ({ ...f, search: value }))}
                      allowClear
                    />
                  </Col>
                  <Col xs={12} sm={4}>
                    <Select
                      placeholder="Status"
                      style={{ width: '100%' }}
                      allowClear
                      onChange={(value) => setFilters(f => ({ ...f, status: value }))}
                    >
                      <Option value="new">New</Option>
                      <Option value="contacted">Contacted</Option>
                      <Option value="qualified">Qualified</Option>
                      <Option value="converted">Converted</Option>
                      <Option value="lost">Lost</Option>
                    </Select>
                  </Col>
                  <Col xs={12} sm={4}>
                    <Select
                      placeholder="Quality"
                      style={{ width: '100%' }}
                      allowClear
                      onChange={(value) => setFilters(f => ({ ...f, quality: value }))}
                    >
                      <Option value="high">High</Option>
                      <Option value="medium">Medium</Option>
                      <Option value="low">Low</Option>
                    </Select>
                  </Col>
                  <Col xs={12} sm={4}>
                    <Select
                      placeholder="Source"
                      style={{ width: '100%' }}
                      allowClear
                      onChange={(value) => setFilters(f => ({ ...f, sourceType: value }))}
                    >
                      <Option value="crawler">Crawler</Option>
                      <Option value="manual">Manual</Option>
                      <Option value="import">Import</Option>
                      <Option value="api">API</Option>
                    </Select>
                  </Col>
                </Row>

                {/* Table */}
                <Table
                  dataSource={leads}
                  columns={columns}
                  rowKey="id"
                  loading={loading}
                  pagination={{
                    ...pagination,
                    showSizeChanger: true,
                    showTotal: (total) => `Total ${total} leads`,
                    onChange: (page, pageSize) => setPagination(p => ({ ...p, current: page, pageSize: pageSize || 20 })),
                  }}
                />
              </TabPane>

              <TabPane tab="Statistics" key="statistics">
                <Row gutter={[16, 16]}>
                  <Col xs={24} md={12}>
                    <Card title="Leads by Status">
                      <List
                        dataSource={Object.entries(statistics?.byStatus || {})}
                        renderItem={([status, count]) => (
                          <List.Item>
                            <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                              <Tag color={getStatusColor(status)}>{status}</Tag>
                              <Badge count={count as number} showZero style={{ backgroundColor: '#1890ff' }} />
                            </Space>
                          </List.Item>
                        )}
                        locale={{ emptyText: 'No data' }}
                      />
                    </Card>
                  </Col>
                  <Col xs={24} md={12}>
                    <Card title="Leads by Quality">
                      <List
                        dataSource={Object.entries(statistics?.byQuality || {})}
                        renderItem={([quality, count]) => (
                          <List.Item>
                            <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                              <Tag color={getQualityColor(quality)}>{quality}</Tag>
                              <Badge count={count as number} showZero style={{ backgroundColor: '#52c41a' }} />
                            </Space>
                          </List.Item>
                        )}
                        locale={{ emptyText: 'No data' }}
                      />
                    </Card>
                  </Col>
                  <Col xs={24}>
                    <Card title="Source Performance">
                      {sourcePerformance.length > 0 ? (
                        <Table
                          dataSource={sourcePerformance}
                          columns={[
                            { title: 'Source', dataIndex: 'source', key: 'source' },
                            { title: 'Leads', dataIndex: 'leads', key: 'leads' },
                            { title: 'High Quality', dataIndex: 'highQuality', key: 'highQuality' },
                            { title: 'Conversions', dataIndex: 'conversions', key: 'conversions' },
                            {
                              title: 'Conversion Rate',
                              key: 'rate',
                              render: (_: any, record: any) => (
                                <Progress
                                  percent={record.conversionRate || 0}
                                  size="small"
                                  status={record.conversionRate >= 50 ? 'success' : 'normal'}
                                />
                              ),
                            },
                          ]}
                          rowKey="source"
                          pagination={false}
                        />
                      ) : (
                        <Empty description="No source data available" />
                      )}
                    </Card>
                  </Col>
                </Row>
              </TabPane>

              <TabPane tab="By Source" key="sources">
                <Row gutter={[16, 16]}>
                  <Col xs={24} md={12}>
                    <Card title="Leads by Source Type">
                      <List
                        dataSource={Object.entries(statistics?.bySource || {})}
                        renderItem={([source, count]) => (
                          <List.Item>
                            <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                              <Tag color="blue">{source}</Tag>
                              <Badge count={count as number} showZero style={{ backgroundColor: '#722ed1' }} />
                            </Space>
                          </List.Item>
                        )}
                        locale={{ emptyText: 'No source data' }}
                      />
                    </Card>
                  </Col>
                </Row>
              </TabPane>
            </Tabs>
          </Card>
        </Col>
      </Row>

      {/* Create Lead Modal */}
      <Modal
        title="Add New Lead"
        open={createModalVisible}
        onCancel={() => {
          setCreateModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateLead}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Email is required' },
                  { type: 'email', message: 'Invalid email' },
                ]}
              >
                <Input prefix={<MailOutlined />} placeholder="email@example.com" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="name" label="Name">
                <Input prefix={<UserOutlined />} placeholder="Full name" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="company" label="Company">
                <Input placeholder="Company name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="jobTitle" label="Job Title">
                <Input placeholder="Job title" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="phone" label="Phone">
                <Input prefix={<PhoneOutlined />} placeholder="Phone number" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="website" label="Website">
                <Input prefix={<GlobalOutlined />} placeholder="https://" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="sourceType" label="Source" initialValue="manual">
            <Select>
              <Option value="manual">Manual Entry</Option>
              <Option value="crawler">Crawler</Option>
              <Option value="import">Import</Option>
              <Option value="api">API</Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Create Lead
              </Button>
              <Button onClick={() => setCreateModalVisible(false)}>Cancel</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* View Lead Modal */}
      <Modal
        title={
          <Space>
            <UserOutlined />
            {selectedLead?.name || 'Lead Details'}
          </Space>
        }
        open={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setViewModalVisible(false)}>
            Close
          </Button>,
        ]}
        width={700}
      >
        {selectedLead && (
          <div>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <p><strong>Email:</strong> {selectedLead.email}</p>
                <p><strong>Phone:</strong> {selectedLead.phone || '-'}</p>
                <p><strong>Company:</strong> {selectedLead.company || '-'}</p>
                <p><strong>Job Title:</strong> {selectedLead.jobTitle || '-'}</p>
              </Col>
              <Col span={12}>
                <p><strong>Score:</strong> <Progress percent={selectedLead.score} size="small" style={{ width: 100 }} /></p>
                <p><strong>Quality:</strong> <Tag color={getQualityColor(selectedLead.quality)}>{selectedLead.quality}</Tag></p>
                <p><strong>Status:</strong> <Tag color={getStatusColor(selectedLead.status)}>{selectedLead.status}</Tag></p>
                <p><strong>Source:</strong> {selectedLead.sourceType}</p>
              </Col>
            </Row>
            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
              <Col span={24}>
                <p><strong>Website:</strong> {selectedLead.website ? <a href={selectedLead.website} target="_blank" rel="noopener noreferrer">{selectedLead.website}</a> : '-'}</p>
              </Col>
            </Row>
            {selectedLead.tags && selectedLead.tags.length > 0 && (
              <Row style={{ marginTop: 16 }}>
                <Col span={24}>
                  <strong>Tags:</strong>{' '}
                  {selectedLead.tags.map((tag, i) => (
                    <Tag key={i}>{tag}</Tag>
                  ))}
                </Col>
              </Row>
            )}
            <Row style={{ marginTop: 16 }}>
              <Col span={24}>
                <p><strong>Created:</strong> {new Date(selectedLead.createdAt).toLocaleString()}</p>
                <p><strong>Updated:</strong> {new Date(selectedLead.updatedAt).toLocaleString()}</p>
              </Col>
            </Row>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default LeadGenerationDashboard;
