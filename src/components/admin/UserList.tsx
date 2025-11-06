/**
 * UserList Component
 * Displays a list of all users with filtering, sorting, and pagination
 * Admin-only component for user management
 */

import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Card, 
  Input, 
  Select, 
  Button, 
  Tag, 
  Space, 
  message,
  Modal,
  Avatar,
  Tooltip,
  Pagination
} from 'antd';
import {
  UserOutlined,
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  FilterOutlined,
  ReloadOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Search } = Input;
const { Option } = Select;

interface User {
  id: string;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  role_name: string;
  role_label: string;
  plan_name: string;
  plan_label: string;
  account_status: string;
  subscription_status: string;
  email_verified: boolean;
  last_login_at?: string;
  created_at: string;
  reputation_score: number;
  optimization_count: number;
}

interface UserListProps {
  onUserSelect?: (user: User) => void;
  onCreateUser?: () => void;
}

const UserList: React.FC<UserListProps> = ({ onUserSelect, onCreateUser }) => {
  const navigate = useNavigate();
  
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [planFilter, setPlanFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortField, setSortField] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);

  // Fetch users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: pageSize.toString(),
        sort: sortField,
        order: sortOrder
      });

      if (searchText) params.append('search', searchText);
      if (roleFilter) params.append('role', roleFilter);
      if (planFilter) params.append('plan', planFilter);
      if (statusFilter) params.append('status', statusFilter);

      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/users?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data.users);
      setTotal(data.pagination.total);
    } catch (error) {
      console.error('Error fetching users:', error);
      message.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage, pageSize, searchText, roleFilter, planFilter, statusFilter, sortField, sortOrder]);

  // Handle user deletion
  const handleDelete = async (userId: string) => {
    Modal.confirm({
      title: 'Delete User',
      content: 'Are you sure you want to delete this user? This action cannot be undone.',
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          const token = localStorage.getItem('auth_token');
          const response = await fetch(`/api/users/${userId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (!response.ok) {
            throw new Error('Failed to delete user');
          }

          message.success('User deleted successfully');
          fetchUsers();
        } catch (error) {
          console.error('Error deleting user:', error);
          message.error('Failed to delete user');
        }
      }
    });
  };

  // Get status color
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: 'green',
      suspended: 'orange',
      deleted: 'red',
      pending: 'blue'
    };
    return colors[status] || 'default';
  };

  // Get role color
  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      admin: 'red',
      deepseek: 'purple',
      enterprise: 'gold',
      pro: 'blue',
      free: 'default',
      guest: 'default'
    };
    return colors[role] || 'default';
  };

  // Table columns
  const columns = [
    {
      title: 'User',
      key: 'user',
      render: (record: User) => (
        <Space>
          <Avatar 
            src={record.avatar_url} 
            icon={!record.avatar_url && <UserOutlined />}
          />
          <div>
            <div style={{ fontWeight: 500 }}>
              {record.first_name && record.last_name
                ? `${record.first_name} ${record.last_name}`
                : record.username}
            </div>
            <div style={{ fontSize: '12px', color: '#888' }}>
              {record.email}
            </div>
          </div>
        </Space>
      ),
      sorter: true
    },
    {
      title: 'Role',
      dataIndex: 'role_name',
      key: 'role',
      render: (role: string, record: User) => (
        <Tag color={getRoleColor(role)}>{record.role_label}</Tag>
      ),
      filters: [
        { text: 'Admin', value: 'admin' },
        { text: 'DeepSeek', value: 'deepseek' },
        { text: 'Enterprise', value: 'enterprise' },
        { text: 'Pro', value: 'pro' },
        { text: 'Free', value: 'free' },
        { text: 'Guest', value: 'guest' }
      ],
      onFilter: (value: any, record: User) => record.role_name === value
    },
    {
      title: 'Plan',
      dataIndex: 'plan_name',
      key: 'plan',
      render: (plan: string, record: User) => (
        <Tag color="blue">{record.plan_label}</Tag>
      ),
      filters: [
        { text: 'Admin', value: 'admin' },
        { text: 'DeepSeek', value: 'deepseek' },
        { text: 'Enterprise', value: 'enterprise' },
        { text: 'Pro', value: 'pro' },
        { text: 'Free', value: 'free' }
      ],
      onFilter: (value: any, record: User) => record.plan_name === value
    },
    {
      title: 'Status',
      dataIndex: 'account_status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{status.toUpperCase()}</Tag>
      ),
      filters: [
        { text: 'Active', value: 'active' },
        { text: 'Suspended', value: 'suspended' },
        { text: 'Pending', value: 'pending' }
      ],
      onFilter: (value: any, record: User) => record.account_status === value
    },
    {
      title: 'Verified',
      dataIndex: 'email_verified',
      key: 'verified',
      render: (verified: boolean) => (
        <Tag color={verified ? 'green' : 'orange'}>
          {verified ? 'Verified' : 'Unverified'}
        </Tag>
      )
    },
    {
      title: 'Stats',
      key: 'stats',
      render: (record: User) => (
        <div style={{ fontSize: '12px' }}>
          <div>Reputation: {record.reputation_score}</div>
          <div>Optimizations: {record.optimization_count}</div>
        </div>
      )
    },
    {
      title: 'Last Login',
      dataIndex: 'last_login_at',
      key: 'last_login',
      render: (date: string) => date ? new Date(date).toLocaleDateString() : 'Never',
      sorter: true
    },
    {
      title: 'Joined',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => new Date(date).toLocaleDateString(),
      sorter: true
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: User) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              type="link"
              icon={<EyeOutlined />}
              onClick={() => {
                if (onUserSelect) {
                  onUserSelect(record);
                } else {
                  navigate(`/admin/users/${record.id}`);
                }
              }}
            />
          </Tooltip>
          <Tooltip title="Edit User">
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => navigate(`/admin/users/${record.id}/edit`)}
            />
          </Tooltip>
          <Tooltip title="Delete User">
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record.id)}
            />
          </Tooltip>
        </Space>
      )
    }
  ];

  return (
    <Card
      title={
        <Space>
          <UserOutlined />
          <span>User Management</span>
        </Space>
      }
      extra={
        <Space>
          <Button
            icon={<ReloadOutlined />}
            onClick={fetchUsers}
          >
            Refresh
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              if (onCreateUser) {
                onCreateUser();
              } else {
                navigate('/admin/users/create');
              }
            }}
          >
            Create User
          </Button>
        </Space>
      }
    >
      {/* Filters */}
      <Space style={{ marginBottom: 16, width: '100%', flexWrap: 'wrap' }}>
        <Search
          placeholder="Search by name, email, or username"
          allowClear
          style={{ width: 300 }}
          onSearch={setSearchText}
          onChange={e => !e.target.value && setSearchText('')}
        />
        <Select
          placeholder="Filter by role"
          allowClear
          style={{ width: 150 }}
          onChange={setRoleFilter}
        >
          <Option value="admin">Admin</Option>
          <Option value="deepseek">DeepSeek</Option>
          <Option value="enterprise">Enterprise</Option>
          <Option value="pro">Pro</Option>
          <Option value="free">Free</Option>
          <Option value="guest">Guest</Option>
        </Select>
        <Select
          placeholder="Filter by plan"
          allowClear
          style={{ width: 150 }}
          onChange={setPlanFilter}
        >
          <Option value="admin">Admin</Option>
          <Option value="deepseek">DeepSeek</Option>
          <Option value="enterprise">Enterprise</Option>
          <Option value="pro">Pro</Option>
          <Option value="free">Free</Option>
        </Select>
        <Select
          placeholder="Filter by status"
          allowClear
          style={{ width: 150 }}
          onChange={setStatusFilter}
        >
          <Option value="active">Active</Option>
          <Option value="suspended">Suspended</Option>
          <Option value="pending">Pending</Option>
        </Select>
      </Space>

      {/* Table */}
      <Table
        columns={columns}
        dataSource={users}
        rowKey="id"
        loading={loading}
        pagination={false}
        onChange={(pagination, filters, sorter: any) => {
          if (sorter.field) {
            setSortField(sorter.field);
            setSortOrder(sorter.order === 'ascend' ? 'ASC' : 'DESC');
          }
        }}
      />

      {/* Pagination */}
      <div style={{ marginTop: 16, textAlign: 'right' }}>
        <Pagination
          current={currentPage}
          pageSize={pageSize}
          total={total}
          onChange={(page, size) => {
            setCurrentPage(page);
            if (size) setPageSize(size);
          }}
          showSizeChanger
          showTotal={(total) => `Total ${total} users`}
        />
      </div>
    </Card>
  );
};

export default UserList;
