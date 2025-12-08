/**
 * Lead Management Dashboard
 * 
 * Provides a complete interface for managing leads captured from crawler campaigns
 * Features: filtering, sorting, search, lead details, status updates, assignment
 */

import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Tag,
  Button,
  Space,
  Input,
  Select,
  Modal,
  Form,
  Descriptions,
  Timeline,
  message,
  Statistic,
  Row,
  Col,
  Drawer,
  Badge,
  Tooltip,
  Progress,
} from 'antd';
import {
  SearchOutlined,
  FilterOutlined,
  UserAddOutlined,
  MailOutlined,
  PhoneOutlined,
  GlobalOutlined,
  TagsOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  StarOutlined,
  ReloadOutlined,
} from '@ant-design/icons';

const { Option } = Select;
const { TextArea } = Input;

export const LeadManagementDashboard = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statistics, setStatistics] = useState(null);
  const [selectedLead, setSelectedLead] = useState(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [activityModalVisible, setActivityModalVisible] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 50, total: 0 });
  const [filters, setFilters] = useState({
    status: undefined,
    quality: undefined,
    sourceType: undefined,
    search: '',
  });

  const [form] = Form.useForm();
  const [assignForm] = Form.useForm();
  const [activityForm] = Form.useForm();

  // Fetch leads
  const fetchLeads = async (page = 1, pageSize = 50) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pageSize.toString(),
        ...(filters.status && { status: filters.status }),
        ...(filters.quality && { quality: filters.quality }),
        ...(filters.sourceType && { sourceType: filters.sourceType }),
        ...(filters.search && { search: filters.search }),
      });

      const response = await fetch(`/api/leads?${params}`);
      const data = await response.json();

      setLeads(data.leads || []);
      setPagination({
        current: data.pagination?.page || 1,
        pageSize: data.pagination?.limit || 50,
        total: data.pagination?.total || 0,
      });
    } catch (error) {
      console.error('Error fetching leads:', error);
      message.error('Failed to fetch leads');
    } finally {
      setLoading(false);
    }
  };

  // Fetch statistics
  const fetchStatistics = async () => {
    try {
      const response = await fetch('/api/leads/statistics');
      const data = await response.json();
      setStatistics(data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  // Fetch lead details
  const fetchLeadDetails = async (leadId) => {
    try {
      const response = await fetch(`/api/leads/${leadId}`);
      const data = await response.json();
      setSelectedLead(data);
      setDrawerVisible(true);
    } catch (error) {
      console.error('Error fetching lead details:', error);
      message.error('Failed to fetch lead details');
    }
  };

  // Update lead status
  const updateStatus = async (leadId, newStatus) => {
    try {
      const response = await fetch(`/api/leads/${leadId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        message.success('Status updated successfully');
        fetchLeads(pagination.current, pagination.pageSize);
        if (selectedLead?.id === leadId) {
          fetchLeadDetails(leadId);
        }
      } else {
        message.error('Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      message.error('Failed to update status');
    }
  };

  // Assign lead
  const handleAssign = async (values) => {
    try {
      const response = await fetch(`/api/leads/${selectedLead.id}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: values.userId }),
      });

      if (response.ok) {
        message.success('Lead assigned successfully');
        setAssignModalVisible(false);
        assignForm.resetFields();
        fetchLeadDetails(selectedLead.id);
        fetchLeads(pagination.current, pagination.pageSize);
      } else {
        message.error('Failed to assign lead');
      }
    } catch (error) {
      console.error('Error assigning lead:', error);
      message.error('Failed to assign lead');
    }
  };

  // Log activity
  const handleLogActivity = async (values) => {
    try {
      const response = await fetch(`/api/leads/${selectedLead.id}/activity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        message.success('Activity logged successfully');
        setActivityModalVisible(false);
        activityForm.resetFields();
        fetchLeadDetails(selectedLead.id);
      } else {
        message.error('Failed to log activity');
      }
    } catch (error) {
      console.error('Error logging activity:', error);
      message.error('Failed to log activity');
    }
  };

  useEffect(() => {
    fetchLeads();
    fetchStatistics();
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchLeads(1, pagination.pageSize);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [filters]);

  const getQualityColor = (quality) => {
    switch (quality) {
      case 'high':
        return 'green';
      case 'medium':
        return 'orange';
      case 'low':
        return 'red';
      default:
        return 'default';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'new':
        return 'blue';
      case 'contacted':
        return 'cyan';
      case 'qualified':
        return 'green';
      case 'converted':
        return 'gold';
      case 'lost':
        return 'red';
      default:
        return 'default';
    }
  };

  const columns = [
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (email) => (
        <Space>
          <MailOutlined />
          {email}
        </Space>
      ),
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Company',
      dataIndex: 'company',
      key: 'company',
    },
    {
      title: 'Score',
      dataIndex: 'score',
      key: 'score',
      render: (score) => (
        <Tooltip title={`Lead Score: ${score}/100`}>
          <Progress
            type="circle"
            percent={score}
            width={50}
            strokeColor={score >= 75 ? '#52c41a' : score >= 50 ? '#faad14' : '#ff4d4f'}
          />
        </Tooltip>
      ),
      sorter: true,
    },
    {
      title: 'Quality',
      dataIndex: 'quality',
      key: 'quality',
      render: (quality) => <Tag color={getQualityColor(quality)}>{quality?.toUpperCase()}</Tag>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => (
        <Select
          value={status}
          onChange={(value) => updateStatus(record.id, value)}
          style={{ width: 120 }}
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
      dataIndex: 'source_type',
      key: 'source_type',
      render: (source) => <Tag>{source}</Tag>,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button type="primary" size="small" onClick={() => fetchLeadDetails(record.id)}>
            View Details
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <h1>Lead Management Dashboard</h1>

      {/* Statistics Cards */}
      {statistics && (
        <Row gutter={16} style={{ marginBottom: '24px' }}>
          <Col span={6}>
            <Card>
              <Statistic
                title="Total Leads"
                value={statistics.total_leads}
                prefix={<UserAddOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="New Leads"
                value={statistics.new_leads}
                valueStyle={{ color: '#1890ff' }}
                prefix={<ClockCircleOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Qualified"
                value={statistics.qualified_leads}
                valueStyle={{ color: '#52c41a' }}
                prefix={<CheckCircleOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Converted"
                value={statistics.converted_leads}
                valueStyle={{ color: '#faad14' }}
                prefix={<StarOutlined />}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* Filters */}
      <Card style={{ marginBottom: '24px' }}>
        <Space wrap>
          <Input
            placeholder="Search email, name, or company"
            prefix={<SearchOutlined />}
            style={{ width: 300 }}
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
          <Select
            placeholder="Status"
            style={{ width: 150 }}
            allowClear
            value={filters.status}
            onChange={(value) => setFilters({ ...filters, status: value })}
          >
            <Option value="new">New</Option>
            <Option value="contacted">Contacted</Option>
            <Option value="qualified">Qualified</Option>
            <Option value="converted">Converted</Option>
            <Option value="lost">Lost</Option>
          </Select>
          <Select
            placeholder="Quality"
            style={{ width: 150 }}
            allowClear
            value={filters.quality}
            onChange={(value) => setFilters({ ...filters, quality: value })}
          >
            <Option value="high">High</Option>
            <Option value="medium">Medium</Option>
            <Option value="low">Low</Option>
          </Select>
          <Select
            placeholder="Source Type"
            style={{ width: 200 }}
            allowClear
            value={filters.sourceType}
            onChange={(value) => setFilters({ ...filters, sourceType: value })}
          >
            <Option value="crawler_campaign">Crawler Campaign</Option>
            <Option value="seo_campaign">SEO Campaign</Option>
            <Option value="manual">Manual</Option>
          </Select>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => fetchLeads(pagination.current, pagination.pageSize)}
          >
            Refresh
          </Button>
        </Space>
      </Card>

      {/* Leads Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={leads}
          rowKey="id"
          loading={loading}
          pagination={pagination}
          onChange={(newPagination) => {
            fetchLeads(newPagination.current, newPagination.pageSize);
          }}
        />
      </Card>

      {/* Lead Details Drawer */}
      <Drawer
        title="Lead Details"
        placement="right"
        width={720}
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
      >
        {selectedLead && (
          <div>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Email" span={2}>
                <Space>
                  <MailOutlined />
                  {selectedLead.email}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Name">{selectedLead.name || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="Company">{selectedLead.company || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="Phone">
                {selectedLead.phone ? (
                  <Space>
                    <PhoneOutlined />
                    {selectedLead.phone}
                  </Space>
                ) : (
                  'N/A'
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Website">
                {selectedLead.website ? (
                  <a href={selectedLead.website} target="_blank" rel="noopener noreferrer">
                    <GlobalOutlined /> {selectedLead.website}
                  </a>
                ) : (
                  'N/A'
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Score">
                <Progress percent={selectedLead.score} size="small" />
              </Descriptions.Item>
              <Descriptions.Item label="Quality">
                <Tag color={getQualityColor(selectedLead.quality)}>
                  {selectedLead.quality?.toUpperCase()}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={getStatusColor(selectedLead.status)}>
                  {selectedLead.status?.toUpperCase()}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Assigned To">
                {selectedLead.assigned_to || 'Unassigned'}
              </Descriptions.Item>
              <Descriptions.Item label="Source" span={2}>
                {selectedLead.source_type} / {selectedLead.source_id}
              </Descriptions.Item>
            </Descriptions>

            <div style={{ marginTop: '24px' }}>
              <Space>
                <Button
                  type="primary"
                  icon={<UserAddOutlined />}
                  onClick={() => setAssignModalVisible(true)}
                >
                  Assign Lead
                </Button>
                <Button icon={<TagsOutlined />} onClick={() => setActivityModalVisible(true)}>
                  Log Activity
                </Button>
              </Space>
            </div>

            {selectedLead.tags && selectedLead.tags.length > 0 && (
              <div style={{ marginTop: '16px' }}>
                <h4>Tags</h4>
                {selectedLead.tags.map((tag) => (
                  <Tag key={tag} color="blue">
                    {tag}
                  </Tag>
                ))}
              </div>
            )}

            {selectedLead.activities && selectedLead.activities.length > 0 && (
              <div style={{ marginTop: '24px' }}>
                <h4>Activity Timeline</h4>
                <Timeline>
                  {selectedLead.activities.map((activity) => (
                    <Timeline.Item key={activity.id}>
                      <p>
                        <strong>{activity.activity_type}</strong>
                      </p>
                      <p>{activity.activity_description}</p>
                      <p style={{ color: '#999', fontSize: '12px' }}>
                        {new Date(activity.created_at).toLocaleString()}
                      </p>
                    </Timeline.Item>
                  ))}
                </Timeline>
              </div>
            )}
          </div>
        )}
      </Drawer>

      {/* Assign Modal */}
      <Modal
        title="Assign Lead"
        open={assignModalVisible}
        onOk={() => assignForm.submit()}
        onCancel={() => {
          setAssignModalVisible(false);
          assignForm.resetFields();
        }}
      >
        <Form form={assignForm} onFinish={handleAssign} layout="vertical">
          <Form.Item
            name="userId"
            label="Assign To (Email or User ID)"
            rules={[{ required: true, message: 'Please enter user email or ID' }]}
          >
            <Input placeholder="sales@company.com" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Activity Modal */}
      <Modal
        title="Log Activity"
        open={activityModalVisible}
        onOk={() => activityForm.submit()}
        onCancel={() => {
          setActivityModalVisible(false);
          activityForm.resetFields();
        }}
      >
        <Form form={activityForm} onFinish={handleLogActivity} layout="vertical">
          <Form.Item
            name="activityType"
            label="Activity Type"
            rules={[{ required: true, message: 'Please select activity type' }]}
          >
            <Select>
              <Option value="email_sent">Email Sent</Option>
              <Option value="email_opened">Email Opened</Option>
              <Option value="call">Phone Call</Option>
              <Option value="meeting">Meeting</Option>
              <Option value="note">Note</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please enter description' }]}
          >
            <TextArea rows={4} placeholder="Describe the activity..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default LeadManagementDashboard;
