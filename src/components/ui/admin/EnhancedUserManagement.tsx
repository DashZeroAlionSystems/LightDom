/**
 * Enhanced User Management Component
 * Advanced admin interface for comprehensive user management
 */

import React, { useState } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Typography,
  Tag,
  Input,
  Select,
  Modal,
  Form,
  message,
  Badge,
  Avatar,
  Tooltip,
  Drawer,
  Row,
  Col,
  Statistic,
  Dropdown,
  Checkbox,
  DatePicker,
  Upload,
  Tabs,
  List,
  Timeline,
  Descriptions,
  Progress,
  Alert
} from 'antd';
import {
  UserOutlined,
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  LockOutlined,
  UnlockOutlined,
  MailOutlined,
  PhoneOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  DownloadOutlined,
  UploadOutlined,
  FilterOutlined,
  ReloadOutlined,
  MoreOutlined,
  EyeOutlined,
  SafetyOutlined,
  ClockCircleOutlined,
  GlobalOutlined,
  TeamOutlined,
  SettingOutlined,
  WarningOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { MenuProps } from 'antd';
import './AdminStyles.css';

const { Title, Text } = Typography;
const { Search } = Input;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'user' | 'moderator';
  status: 'active' | 'inactive' | 'suspended';
  createdAt: Date;
  lastLogin?: Date;
  avatar?: string;
  subscription?: {
    plan: string;
    status: string;
    expiresAt: Date;
  };
  stats?: {
    optimizations: number;
    storage: number;
    apiCalls: number;
  };
  permissions?: string[];
  location?: string;
  verified?: boolean;
}

const EnhancedUserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1234567890',
      role: 'admin',
      status: 'active',
      createdAt: new Date('2024-01-01'),
      lastLogin: new Date(),
      avatar: '',
      subscription: { plan: 'Enterprise', status: 'active', expiresAt: new Date('2025-01-01') },
      stats: { optimizations: 1250, storage: 15.5, apiCalls: 45000 },
      permissions: ['read', 'write', 'delete', 'admin'],
      location: 'New York, USA',
      verified: true
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      phone: '+1987654321',
      role: 'user',
      status: 'active',
      createdAt: new Date('2024-02-15'),
      lastLogin: new Date(),
      avatar: '',
      subscription: { plan: 'Pro', status: 'active', expiresAt: new Date('2024-12-15') },
      stats: { optimizations: 456, storage: 5.2, apiCalls: 12000 },
      permissions: ['read', 'write'],
      location: 'London, UK',
      verified: true
    },
    {
      id: '3',
      name: 'Bob Wilson',
      email: 'bob@example.com',
      role: 'moderator',
      status: 'inactive',
      createdAt: new Date('2024-03-20'),
      avatar: '',
      subscription: { plan: 'Free', status: 'active', expiresAt: new Date('2024-12-31') },
      stats: { optimizations: 89, storage: 1.8, apiCalls: 2500 },
      permissions: ['read', 'moderate'],
      location: 'Toronto, Canada',
      verified: false
    }
  ]);

  const [searchText, setSearchText] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPlan, setSelectedPlan] = useState<string>('all');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isDetailDrawerVisible, setIsDetailDrawerVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'red';
      case 'moderator': return 'orange';
      case 'user': return 'blue';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'default';
      case 'suspended': return 'error';
      default: return 'default';
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'Enterprise': return 'purple';
      case 'Pro': return 'blue';
      case 'Free': return 'default';
      default: return 'default';
    }
  };

  const handleAddUser = () => {
    form.validateFields().then(values => {
      const newUser: User = {
        id: String(users.length + 1),
        name: values.name,
        email: values.email,
        phone: values.phone,
        role: values.role,
        status: 'active',
        createdAt: new Date(),
        subscription: { plan: values.plan || 'Free', status: 'active', expiresAt: new Date('2024-12-31') },
        stats: { optimizations: 0, storage: 0, apiCalls: 0 },
        permissions: values.permissions || ['read'],
        verified: false
      };
      setUsers([...users, newUser]);
      setIsModalVisible(false);
      form.resetFields();
      message.success('User added successfully');
    });
  };

  const handleEditUser = () => {
    if (!selectedUser) return;

    editForm.validateFields().then(values => {
      setUsers(users.map(u =>
        u.id === selectedUser.id
          ? { ...u, ...values }
          : u
      ));
      setIsEditModalVisible(false);
      editForm.resetFields();
      message.success('User updated successfully');
    });
  };

  const handleDeleteUser = (userId: string) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this user?',
      content: 'This action cannot be undone. All user data will be permanently deleted.',
      okText: 'Delete',
      okType: 'danger',
      onOk: () => {
        setUsers(users.filter(u => u.id !== userId));
        message.success('User deleted successfully');
      }
    });
  };

  const handleBulkDelete = () => {
    Modal.confirm({
      title: `Delete ${selectedRowKeys.length} users?`,
      content: 'This action cannot be undone. All selected users and their data will be permanently deleted.',
      okText: 'Delete',
      okType: 'danger',
      onOk: () => {
        setUsers(users.filter(u => !selectedRowKeys.includes(u.id)));
        setSelectedRowKeys([]);
        message.success(`${selectedRowKeys.length} users deleted successfully`);
      }
    });
  };

  const handleSuspendUser = (userId: string) => {
    setUsers(users.map(u =>
      u.id === userId
        ? { ...u, status: 'suspended' as const }
        : u
    ));
    message.success('User suspended successfully');
  };

  const handleActivateUser = (userId: string) => {
    setUsers(users.map(u =>
      u.id === userId
        ? { ...u, status: 'active' as const }
        : u
    ));
    message.success('User activated successfully');
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Name', 'Email', 'Role', 'Status', 'Created At', 'Plan'];
    const csvContent = [
      headers.join(','),
      ...filteredUsers.map(u => [
        u.id,
        u.name,
        u.email,
        u.role,
        u.status,
        u.createdAt.toLocaleDateString(),
        u.subscription?.plan || 'N/A'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users-export-${new Date().toISOString()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    message.success('Users exported successfully');
  };

  const showUserDetails = (user: User) => {
    setSelectedUser(user);
    setIsDetailDrawerVisible(true);
  };

  const showEditUser = (user: User) => {
    setSelectedUser(user);
    editForm.setFieldsValue(user);
    setIsEditModalVisible(true);
  };

  const userActionItems: MenuProps['items'] = [
    {
      key: 'view',
      label: 'View Details',
      icon: <EyeOutlined />
    },
    {
      key: 'edit',
      label: 'Edit User',
      icon: <EditOutlined />
    },
    {
      type: 'divider'
    },
    {
      key: 'suspend',
      label: 'Suspend User',
      icon: <LockOutlined />,
      danger: true
    },
    {
      key: 'delete',
      label: 'Delete User',
      icon: <DeleteOutlined />,
      danger: true
    }
  ];

  const columns: ColumnsType<User> = [
    {
      title: 'User',
      key: 'user',
      fixed: 'left',
      width: 250,
      render: (record: User) => (
        <Space>
          <Badge dot={record.verified} status="success">
            <Avatar
              src={record.avatar}
              icon={<UserOutlined />}
              style={{ backgroundColor: record.verified ? '#52c41a' : '#d9d9d9' }}
            />
          </Badge>
          <div>
            <div>
              <Text strong>{record.name}</Text>
              {record.verified && (
                <Tooltip title="Verified User">
                  <CheckCircleOutlined style={{ color: '#52c41a', marginLeft: 4 }} />
                </Tooltip>
              )}
            </div>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              <MailOutlined /> {record.email}
            </Text>
          </div>
        </Space>
      ),
      sorter: (a, b) => a.name.localeCompare(b.name)
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      width: 120,
      render: (role: string) => (
        <Tag color={getRoleColor(role)} icon={<SafetyOutlined />}>
          {role.toUpperCase()}
        </Tag>
      ),
      filters: [
        { text: 'Admin', value: 'admin' },
        { text: 'Moderator', value: 'moderator' },
        { text: 'User', value: 'user' }
      ],
      onFilter: (value, record) => record.role === value
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => (
        <Badge
          status={getStatusColor(status) as any}
          text={status.toUpperCase()}
        />
      ),
      filters: [
        { text: 'Active', value: 'active' },
        { text: 'Inactive', value: 'inactive' },
        { text: 'Suspended', value: 'suspended' }
      ],
      onFilter: (value, record) => record.status === value
    },
    {
      title: 'Plan',
      key: 'plan',
      width: 120,
      render: (record: User) => (
        <Tag color={getPlanColor(record.subscription?.plan || '')}>
          {record.subscription?.plan || 'N/A'}
        </Tag>
      )
    },
    {
      title: 'Usage Stats',
      key: 'stats',
      width: 150,
      render: (record: User) => (
        <Space direction="vertical" size="small">
          <Text style={{ fontSize: '12px' }}>
            Optimizations: <Text strong>{record.stats?.optimizations || 0}</Text>
          </Text>
          <Text style={{ fontSize: '12px' }}>
            Storage: <Text strong>{record.stats?.storage || 0} GB</Text>
          </Text>
        </Space>
      )
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (date: Date) => (
        <Tooltip title={date.toLocaleString()}>
          <Text style={{ fontSize: '12px' }}>{date.toLocaleDateString()}</Text>
        </Tooltip>
      ),
      sorter: (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
    },
    {
      title: 'Last Login',
      dataIndex: 'lastLogin',
      key: 'lastLogin',
      width: 120,
      render: (date?: Date) => (
        <Text style={{ fontSize: '12px' }}>
          {date ? date.toLocaleDateString() : <Tag color="default">Never</Tag>}
        </Text>
      ),
      sorter: (a, b) => {
        const aTime = a.lastLogin?.getTime() || 0;
        const bTime = b.lastLogin?.getTime() || 0;
        return aTime - bTime;
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right',
      width: 200,
      render: (record: User) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              type="text"
              icon={<EyeOutlined />}
              size="small"
              onClick={() => showUserDetails(record)}
            />
          </Tooltip>
          <Tooltip title="Edit User">
            <Button
              type="text"
              icon={<EditOutlined />}
              size="small"
              onClick={() => showEditUser(record)}
            />
          </Tooltip>
          {record.status === 'active' ? (
            <Tooltip title="Suspend User">
              <Button
                type="text"
                danger
                icon={<LockOutlined />}
                size="small"
                onClick={() => handleSuspendUser(record.id)}
              />
            </Tooltip>
          ) : (
            <Tooltip title="Activate User">
              <Button
                type="text"
                icon={<UnlockOutlined />}
                size="small"
                style={{ color: '#52c41a' }}
                onClick={() => handleActivateUser(record.id)}
              />
            </Tooltip>
          )}
          <Tooltip title="Delete User">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              size="small"
              onClick={() => handleDeleteUser(record.id)}
            />
          </Tooltip>
        </Space>
      )
    }
  ];

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchText.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchText.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    const matchesStatus = selectedStatus === 'all' || user.status === selectedStatus;
    const matchesPlan = selectedPlan === 'all' || user.subscription?.plan === selectedPlan;
    return matchesSearch && matchesRole && matchesStatus && matchesPlan;
  });

  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys: React.Key[]) => {
      setSelectedRowKeys(newSelectedRowKeys);
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>
          <TeamOutlined /> User Management
        </Title>
        <Text type="secondary">
          Manage and monitor all users on your platform
        </Text>
      </div>

      {/* Stats Row */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Users"
              value={users.length}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Active Users"
              value={users.filter(u => u.status === 'active').length}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Suspended"
              value={users.filter(u => u.status === 'suspended').length}
              prefix={<WarningOutlined />}
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Verified Users"
              value={users.filter(u => u.verified).length}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#13c2c2' }}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        {/* Action Bar */}
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <Space wrap>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsModalVisible(true)}
              size="large"
            >
              Add User
            </Button>
            {selectedRowKeys.length > 0 && (
              <>
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  onClick={handleBulkDelete}
                >
                  Delete Selected ({selectedRowKeys.length})
                </Button>
              </>
            )}
          </Space>
          <Space wrap>
            <Button
              icon={<DownloadOutlined />}
              onClick={handleExportCSV}
            >
              Export CSV
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => {
                setSearchText('');
                setSelectedRole('all');
                setSelectedStatus('all');
                setSelectedPlan('all');
                message.success('Filters reset');
              }}
            >
              Reset Filters
            </Button>
          </Space>
        </div>

        {/* Filters */}
        <Space style={{ marginBottom: '16px', width: '100%', flexWrap: 'wrap' }}>
          <Search
            placeholder="Search by name or email..."
            allowClear
            style={{ width: 300 }}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            prefix={<SearchOutlined />}
          />
          <Select
            style={{ width: 150 }}
            placeholder="Filter by role"
            value={selectedRole}
            onChange={setSelectedRole}
          >
            <Select.Option value="all">All Roles</Select.Option>
            <Select.Option value="admin">Admin</Select.Option>
            <Select.Option value="moderator">Moderator</Select.Option>
            <Select.Option value="user">User</Select.Option>
          </Select>
          <Select
            style={{ width: 150 }}
            placeholder="Filter by status"
            value={selectedStatus}
            onChange={setSelectedStatus}
          >
            <Select.Option value="all">All Statuses</Select.Option>
            <Select.Option value="active">Active</Select.Option>
            <Select.Option value="inactive">Inactive</Select.Option>
            <Select.Option value="suspended">Suspended</Select.Option>
          </Select>
          <Select
            style={{ width: 150 }}
            placeholder="Filter by plan"
            value={selectedPlan}
            onChange={setSelectedPlan}
          >
            <Select.Option value="all">All Plans</Select.Option>
            <Select.Option value="Enterprise">Enterprise</Select.Option>
            <Select.Option value="Pro">Pro</Select.Option>
            <Select.Option value="Free">Free</Select.Option>
          </Select>
        </Space>

        {/* Results Info */}
        {selectedRowKeys.length > 0 && (
          <Alert
            message={`${selectedRowKeys.length} user(s) selected`}
            type="info"
            showIcon
            style={{ marginBottom: '16px' }}
            closable
            onClose={() => setSelectedRowKeys([])}
          />
        )}

        {/* Table */}
        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={filteredUsers}
          rowKey="id"
          scroll={{ x: 1300 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} users`,
            pageSizeOptions: ['10', '20', '50', '100']
          }}
        />
      </Card>

      {/* Add User Modal */}
      <Modal
        title={<Space><PlusOutlined /> Add New User</Space>}
        open={isModalVisible}
        onOk={handleAddUser}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        width={700}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Full Name"
                rules={[{ required: true, message: 'Please enter user name' }]}
              >
                <Input prefix={<UserOutlined />} placeholder="John Doe" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Please enter email' },
                  { type: 'email', message: 'Please enter valid email' }
                ]}
              >
                <Input prefix={<MailOutlined />} placeholder="john@example.com" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="phone"
                label="Phone Number"
              >
                <Input prefix={<PhoneOutlined />} placeholder="+1234567890" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="role"
                label="Role"
                rules={[{ required: true, message: 'Please select role' }]}
              >
                <Select placeholder="Select role">
                  <Select.Option value="user">User</Select.Option>
                  <Select.Option value="moderator">Moderator</Select.Option>
                  <Select.Option value="admin">Admin</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="plan"
                label="Subscription Plan"
              >
                <Select placeholder="Select plan">
                  <Select.Option value="Free">Free</Select.Option>
                  <Select.Option value="Pro">Pro</Select.Option>
                  <Select.Option value="Enterprise">Enterprise</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="permissions"
                label="Permissions"
              >
                <Select mode="multiple" placeholder="Select permissions">
                  <Select.Option value="read">Read</Select.Option>
                  <Select.Option value="write">Write</Select.Option>
                  <Select.Option value="delete">Delete</Select.Option>
                  <Select.Option value="moderate">Moderate</Select.Option>
                  <Select.Option value="admin">Admin</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        title={<Space><EditOutlined /> Edit User</Space>}
        open={isEditModalVisible}
        onOk={handleEditUser}
        onCancel={() => {
          setIsEditModalVisible(false);
          editForm.resetFields();
        }}
        width={700}
      >
        <Form form={editForm} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Full Name"
                rules={[{ required: true, message: 'Please enter user name' }]}
              >
                <Input prefix={<UserOutlined />} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Please enter email' },
                  { type: 'email', message: 'Please enter valid email' }
                ]}
              >
                <Input prefix={<MailOutlined />} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="role" label="Role">
                <Select>
                  <Select.Option value="user">User</Select.Option>
                  <Select.Option value="moderator">Moderator</Select.Option>
                  <Select.Option value="admin">Admin</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="status" label="Status">
                <Select>
                  <Select.Option value="active">Active</Select.Option>
                  <Select.Option value="inactive">Inactive</Select.Option>
                  <Select.Option value="suspended">Suspended</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* User Details Drawer */}
      <Drawer
        title={
          <Space>
            <Avatar src={selectedUser?.avatar} icon={<UserOutlined />} />
            <span>{selectedUser?.name}</span>
            {selectedUser?.verified && (
              <CheckCircleOutlined style={{ color: '#52c41a' }} />
            )}
          </Space>
        }
        placement="right"
        onClose={() => setIsDetailDrawerVisible(false)}
        open={isDetailDrawerVisible}
        width={600}
      >
        {selectedUser && (
          <Tabs defaultActiveKey="1">
            <TabPane tab="Overview" key="1">
              <Descriptions column={1} bordered>
                <Descriptions.Item label="Email">
                  <Space>
                    <MailOutlined />
                    {selectedUser.email}
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="Phone">
                  <Space>
                    <PhoneOutlined />
                    {selectedUser.phone || 'N/A'}
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="Role">
                  <Tag color={getRoleColor(selectedUser.role)}>
                    {selectedUser.role.toUpperCase()}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Status">
                  <Badge status={getStatusColor(selectedUser.status) as any} text={selectedUser.status.toUpperCase()} />
                </Descriptions.Item>
                <Descriptions.Item label="Location">
                  <Space>
                    <GlobalOutlined />
                    {selectedUser.location || 'N/A'}
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="Created">
                  {selectedUser.createdAt.toLocaleDateString()}
                </Descriptions.Item>
                <Descriptions.Item label="Last Login">
                  {selectedUser.lastLogin?.toLocaleString() || 'Never'}
                </Descriptions.Item>
                <Descriptions.Item label="Verified">
                  {selectedUser.verified ? (
                    <Tag color="success" icon={<CheckCircleOutlined />}>Verified</Tag>
                  ) : (
                    <Tag color="warning" icon={<CloseCircleOutlined />}>Not Verified</Tag>
                  )}
                </Descriptions.Item>
              </Descriptions>

              <Title level={5} style={{ marginTop: '24px' }}>Subscription</Title>
              <Card size="small">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text>Plan:</Text>
                    <Tag color={getPlanColor(selectedUser.subscription?.plan || '')}>
                      {selectedUser.subscription?.plan}
                    </Tag>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text>Status:</Text>
                    <Tag color="success">{selectedUser.subscription?.status}</Tag>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text>Expires:</Text>
                    <Text>{selectedUser.subscription?.expiresAt.toLocaleDateString()}</Text>
                  </div>
                </Space>
              </Card>
            </TabPane>

            <TabPane tab="Usage Stats" key="2">
              <Space direction="vertical" style={{ width: '100%' }} size="large">
                <Card size="small">
                  <Statistic
                    title="Total Optimizations"
                    value={selectedUser.stats?.optimizations || 0}
                    prefix={<SettingOutlined />}
                  />
                </Card>
                <Card size="small">
                  <Statistic
                    title="Storage Used"
                    value={selectedUser.stats?.storage || 0}
                    suffix="GB"
                    prefix={<DatabaseOutlined />}
                  />
                  <Progress
                    percent={((selectedUser.stats?.storage || 0) / 20) * 100}
                    strokeColor="#1890ff"
                    style={{ marginTop: '8px' }}
                  />
                </Card>
                <Card size="small">
                  <Statistic
                    title="API Calls"
                    value={selectedUser.stats?.apiCalls || 0}
                    prefix={<GlobalOutlined />}
                  />
                </Card>
              </Space>
            </TabPane>

            <TabPane tab="Permissions" key="3">
              <List
                dataSource={selectedUser.permissions || []}
                renderItem={(permission) => (
                  <List.Item>
                    <Checkbox checked disabled>
                      <Tag color="blue">{permission.toUpperCase()}</Tag>
                    </Checkbox>
                  </List.Item>
                )}
              />
            </TabPane>

            <TabPane tab="Activity" key="4">
              <Timeline>
                <Timeline.Item color="green">
                  <Text>Account created</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    {selectedUser.createdAt.toLocaleString()}
                  </Text>
                </Timeline.Item>
                {selectedUser.lastLogin && (
                  <Timeline.Item color="blue">
                    <Text>Last login</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      {selectedUser.lastLogin.toLocaleString()}
                    </Text>
                  </Timeline.Item>
                )}
              </Timeline>
            </TabPane>
          </Tabs>
        )}
      </Drawer>
    </div>
  );
};

export default EnhancedUserManagement;
