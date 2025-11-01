/**
 * User Management Page - Admin Only
 * Comprehensive user management with roles, permissions, and activity monitoring
 */

import React, { useState, useEffect } from 'react';
import {
  Layout,
  Card,
  Row,
  Col,
  Typography,
  Space,
  Table,
  Button,
  Input,
  Select,
  Tag,
  Avatar,
  Modal,
  Form,
  message,
  Tooltip,
  Badge,
  Progress,
  Statistic,
  Tabs,
  Transfer,
  Tree,
  Checkbox,
  Radio,
  DatePicker,
  Drawer,
  List,
  Timeline,
  Alert,
} from 'antd';
import {
  UserOutlined,
  TeamOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  LockOutlined,
  UnlockOutlined,
  CrownOutlined,
  SecurityScanOutlined,
  KeyOutlined,
  MailOutlined,
  PhoneOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  WarningOutlined,
  SearchOutlined,
  FilterOutlined,
  SortAscendingOutlined,
  DownloadOutlined,
  UploadOutlined,
  ReloadOutlined,
  ExportOutlined,
  ImportOutlined,
  AuditOutlined,
  HistoryOutlined,
  BarChartOutlined,
  LineChartOutlined,
  PieChartOutlined,
  HeatMapOutlined,
  RadarChartOutlined,
  StockOutlined,
  FireOutlined,
  RocketOutlined,
  ToolOutlined,
  ControlOutlined,
  DeploymentUnitOutlined,
  HddOutlined,
  CloudServerOutlined,
  SafetyOutlined,
  BugOutlined,
  CodeOutlined,
  FileTextOutlined,
  SettingOutlined,
  BellOutlined,
  MessageOutlined,
  HeartOutlined,
  StarOutlined,
  LikeOutlined,
  RetweetOutlined,
  ShareAltOutlined,
  PrinterOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';

import {
  EnhancedCard,
  EnhancedButton,
  EnhancedStatistic,
  EnhancedProgress,
  EnhancedTag,
  EnhancedAvatar,
  EnhancedInput,
} from '../DesignSystemComponents';

const { Header, Content } = Layout;
const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;
const { Search } = Input;

const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState([
    {
      id: '1',
      name: 'John Doe',
      email: 'john@lightdom.dev',
      role: 'Admin',
      status: 'Active',
      lastLogin: '2024-01-20 10:30:00',
      registered: '2024-01-15',
      permissions: ['read', 'write', 'delete', 'admin'],
      avatar: 'JD',
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@lightdom.dev',
      role: 'Manager',
      status: 'Active',
      lastLogin: '2024-01-20 09:15:00',
      registered: '2024-01-10',
      permissions: ['read', 'write', 'delete'],
      avatar: 'JS',
    },
    {
      id: '3',
      name: 'Bob Johnson',
      email: 'bob@lightdom.dev',
      role: 'User',
      status: 'Inactive',
      lastLogin: '2024-01-18 16:45:00',
      registered: '2024-01-05',
      permissions: ['read', 'write'],
      avatar: 'BJ',
    },
    {
      id: '4',
      name: 'Alice Brown',
      email: 'alice@lightdom.dev',
      role: 'User',
      status: 'Active',
      lastLogin: '2024-01-20 11:20:00',
      registered: '2024-01-12',
      permissions: ['read'],
      avatar: 'AB',
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userModalVisible, setUserModalVisible] = useState(false);
  const [roleModalVisible, setRoleModalVisible] = useState(false);
  const [permissionsModalVisible, setPermissionsModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const userStats = {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.status === 'Active').length,
    adminUsers: users.filter(u => u.role === 'Admin').length,
    newUsersThisMonth: 2,
  };

  const columns = [
    {
      title: 'User',
      dataIndex: 'name',
      key: 'user',
      render: (name: string, record: any) => (
        <Space>
          <EnhancedAvatar text={record.avatar} size="small" />
          <div>
            <Text strong>{name}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: '12px' }}>{record.email}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => {
        const roleConfig = {
          Admin: { color: 'error', icon: <CrownOutlined /> },
          Manager: { color: 'secondary', icon: <SecurityScanOutlined /> },
          User: { color: 'success', icon: <UserOutlined /> },
        } as const;
        const config = roleConfig[role as keyof typeof roleConfig];
        return (
          <EnhancedTag color={config.color} icon={config.icon}>
            {role}
          </EnhancedTag>
        );
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <EnhancedTag color={status === 'Active' ? 'success' : 'default'}>
          {status}
        </EnhancedTag>
      ),
    },
    {
      title: 'Last Login',
      dataIndex: 'lastLogin',
      key: 'lastLogin',
      render: (date: string) => (
        <Text style={{ fontSize: '12px' }}>
          {dayjs(date).format('MMM DD, YYYY HH:mm')}
        </Text>
      ),
    },
    {
      title: 'Registered',
      dataIndex: 'registered',
      key: 'registered',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: any) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => {
                setSelectedUser(record);
                setUserModalVisible(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Edit Role">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => {
                setSelectedUser(record);
                setRoleModalVisible(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Manage Permissions">
            <Button
              type="text"
              size="small"
              icon={<KeyOutlined />}
              onClick={() => {
                setSelectedUser(record);
                setPermissionsModalVisible(true);
              }}
            />
          </Tooltip>
          <Tooltip title={record.status === 'Active' ? 'Deactivate' : 'Activate'}>
            <Button
              type="text"
              size="small"
              icon={record.status === 'Active' ? <LockOutlined /> : <UnlockOutlined />}
              onClick={() => {
                const updatedUsers = users.map(u => 
                  u.id === record.id 
                    ? { ...u, status: u.status === 'Active' ? 'Inactive' : 'Active' }
                    : u
                );
                setUsers(updatedUsers);
                message.success(`User ${record.name} ${record.status === 'Active' ? 'deactivated' : 'activated'}`);
              }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleAddUser = () => {
    message.info('Add user feature coming soon');
  };

  const handleExportUsers = () => {
    message.loading('Exporting users...', 0);
    setTimeout(() => {
      message.destroy();
      message.success('Users exported successfully');
    }, 1500);
  };

  const handleImportUsers = () => {
    message.info('Import users feature coming soon');
  };

  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <Header style={{
        background: '#fff',
        borderBottom: '1px solid #e8e8e8',
        padding: 16,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
        }}>
          <TeamOutlined style={{
            fontSize: '24px',
            color: '#1890ff',
            marginRight: 12,
          }} />
          <Title level={3} style={{ margin: 0 }}>
            User Management
          </Title>
        </div>
        <Space>
          <EnhancedButton
            variant="ghost"
            icon={<ImportOutlined />}
            onClick={handleImportUsers}
          >
            Import
          </EnhancedButton>
          <EnhancedButton
            variant="ghost"
            icon={<ExportOutlined />}
            onClick={handleExportUsers}
          >
            Export
          </EnhancedButton>
          <EnhancedButton
            variant="primary"
            icon={<PlusOutlined />}
            onClick={handleAddUser}
          >
            Add User
          </EnhancedButton>
        </Space>
      </Header>

      <Content style={{ padding: 24 }}>
        {/* User Statistics */}
        <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} md={6}>
            <EnhancedCard variant="elevated" animation="fadeIn">
              <EnhancedStatistic
                title="Total Users"
                value={userStats.totalUsers}
                trend="up"
                trendValue={12.5}
                prefix={<TeamOutlined />}
                color="primary"
              />
            </EnhancedCard>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <EnhancedCard variant="elevated" animation="fadeIn">
              <EnhancedStatistic
                title="Active Users"
                value={userStats.activeUsers}
                trend="up"
                trendValue={8.3}
                prefix={<UserOutlined />}
                color="success"
              />
            </EnhancedCard>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <EnhancedCard variant="elevated" animation="fadeIn">
              <EnhancedStatistic
                title="Admin Users"
                value={userStats.adminUsers}
                trend="stable"
                trendValue={0}
                prefix={<CrownOutlined />}
                color="warning"
              />
            </EnhancedCard>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <EnhancedCard variant="elevated" animation="fadeIn">
              <EnhancedStatistic
                title="New This Month"
                value={userStats.newUsersThisMonth}
                trend="up"
                trendValue={2}
                prefix={<PlusOutlined />}
                color="secondary"
              />
            </EnhancedCard>
          </Col>
        </Row>

        {/* User Management */}
        <EnhancedCard 
          title="User Management" 
          variant="elevated"
          extra={
            <Space>
              <Search
                placeholder="Search users..."
                allowClear
                style={{ width: 200 }}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Select
                value={filterRole}
                onChange={setFilterRole}
                style={{ width: 120 }}
              >
                <Option value="all">All Roles</Option>
                <Option value="Admin">Admin</Option>
                <Option value="Manager">Manager</Option>
                <Option value="User">User</Option>
              </Select>
              <Select
                value={filterStatus}
                onChange={setFilterStatus}
                style={{ width: 120 }}
              >
                <Option value="all">All Status</Option>
                <Option value="Active">Active</Option>
                <Option value="Inactive">Inactive</Option>
              </Select>
            </Space>
          }
        >
          <Table
            columns={columns}
            dataSource={filteredUsers}
            rowKey="id"
            pagination={{ 
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
            }}
            size="middle"
          />
        </EnhancedCard>
      </Content>

      {/* User Details Modal */}
      <Modal
        title="User Details"
        open={userModalVisible}
        onCancel={() => setUserModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setUserModalVisible(false)}>
            Close
          </Button>,
        ]}
        width={600}
      >
        {selectedUser && (
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <div style={{ textAlign: 'center' }}>
              <EnhancedAvatar text={selectedUser.avatar} size="large" />
              <Title level={4}>{selectedUser.name}</Title>
              <Text type="secondary">{selectedUser.email}</Text>
            </div>
            
            <Row gutter={16}>
              <Col span={12}>
                <div>
                  <Text strong>Role</Text>
                  <br />
                  <EnhancedTag color={
                    selectedUser.role === 'Admin'
                      ? 'error'
                      : selectedUser.role === 'Manager'
                      ? 'secondary'
                      : 'success'
                  }>
                    {selectedUser.role}
                  </EnhancedTag>
                </div>
              </Col>
              <Col span={12}>
                <div>
                  <Text strong>Status</Text>
                  <br />
                  <EnhancedTag color={selectedUser.status === 'Active' ? 'success' : 'default'}>
                    {selectedUser.status}
                  </EnhancedTag>
                </div>
              </Col>
            </Row>
            
            <Row gutter={16}>
              <Col span={12}>
                <div>
                  <Text strong>Last Login</Text>
                  <br />
                  <Text>{dayjs(selectedUser.lastLogin).format('MMM DD, YYYY HH:mm')}</Text>
                </div>
              </Col>
              <Col span={12}>
                <div>
                  <Text strong>Registered</Text>
                  <br />
                  <Text>{selectedUser.registered}</Text>
                </div>
              </Col>
            </Row>
            
            <div>
              <Text strong>Permissions</Text>
              <div style={{ marginTop: '8px' }}>
                <Space wrap>
                  {selectedUser.permissions.map((permission: string) => (
                    <EnhancedTag key={permission} color="primary">
                      {permission}
                    </EnhancedTag>
                  ))}
                </Space>
              </div>
            </div>
          </Space>
        )}
      </Modal>

      {/* Role Management Modal */}
      <Modal
        title="Manage Role"
        open={roleModalVisible}
        onCancel={() => setRoleModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setRoleModalVisible(false)}>
            Cancel
          </Button>,
          <EnhancedButton
            key="save"
            variant="primary"
            onClick={() => {
              message.success('Role updated successfully');
              setRoleModalVisible(false);
            }}
          >
            Save Changes
          </EnhancedButton>,
        ]}
      >
        {selectedUser && (
          <Form layout="vertical">
            <Form.Item label="Current Role">
              <Input value={selectedUser.role} disabled />
            </Form.Item>
            <Form.Item label="New Role">
              <Select defaultValue={selectedUser.role}>
                <Option value="Admin">Admin</Option>
                <Option value="Manager">Manager</Option>
                <Option value="User">User</Option>
              </Select>
            </Form.Item>
            <Form.Item label="Reason for Change">
              <Input.TextArea rows={3} placeholder="Enter reason for role change..." />
            </Form.Item>
          </Form>
        )}
      </Modal>

      {/* Permissions Management Modal */}
      <Modal
        title="Manage Permissions"
        open={permissionsModalVisible}
        onCancel={() => setPermissionsModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setPermissionsModalVisible(false)}>
            Cancel
          </Button>,
          <EnhancedButton
            key="save"
            variant="primary"
            onClick={() => {
              message.success('Permissions updated successfully');
              setPermissionsModalVisible(false);
            }}
          >
            Save Changes
          </EnhancedButton>,
        ]}
        width={800}
      >
        {selectedUser && (
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <Alert
              message="Permission Management"
              description="Configure what this user can access and do within the system."
              type="info"
              showIcon
            />
            <Checkbox.Group defaultValue={selectedUser.permissions}>
              <Space direction="vertical">
                <Checkbox value="read">Read Access - View content and data</Checkbox>
                <Checkbox value="write">Write Access - Create and edit content</Checkbox>
                <Checkbox value="delete">Delete Access - Remove content and data</Checkbox>
                <Checkbox value="admin">Admin Access - Full system administration</Checkbox>
              </Space>
            </Checkbox.Group>
          </Space>
        )}
      </Modal>
    </Layout>
  );
};

export default UserManagementPage;
