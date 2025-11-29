/**
 * User Management Component
 * Admin interface for managing users
 */

import {
  DeleteOutlined,
  EditOutlined,
  LockOutlined,
  MailOutlined,
  PlusOutlined,
  SearchOutlined,
  UnlockOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  Avatar,
  Badge,
  Button,
  Form,
  Input,
  message,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import React, { useState } from 'react';
import { Card as DSCard } from '../../../utils/AdvancedReusableComponents';

const { Title, Text } = Typography;
const { Search } = Input;

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'moderator';
  status: 'active' | 'inactive' | 'suspended';
  createdAt: Date;
  lastLogin?: Date;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'admin',
      status: 'active',
      createdAt: new Date('2024-01-01'),
      lastLogin: new Date(),
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      role: 'user',
      status: 'active',
      createdAt: new Date('2024-02-15'),
      lastLogin: new Date(),
    },
    {
      id: '3',
      name: 'Bob Wilson',
      email: 'bob@example.com',
      role: 'moderator',
      status: 'inactive',
      createdAt: new Date('2024-03-20'),
    },
  ]);

  const [searchText, setSearchText] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'red';
      case 'moderator':
        return 'orange';
      case 'user':
        return 'blue';
      default:
        return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'default';
      case 'suspended':
        return 'error';
      default:
        return 'default';
    }
  };

  const handleAddUser = () => {
    form.validateFields().then(values => {
      const newUser: User = {
        id: String(users.length + 1),
        name: values.name,
        email: values.email,
        role: values.role,
        status: 'active',
        createdAt: new Date(),
      };
      setUsers([...users, newUser]);
      setIsModalVisible(false);
      form.resetFields();
      message.success('User added successfully');
    });
  };

  const handleDeleteUser = (userId: string) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this user?',
      content: 'This action cannot be undone.',
      onOk: () => {
        setUsers(users.filter(u => u.id !== userId));
        message.success('User deleted successfully');
      },
    });
  };

  const columns = [
    {
      title: 'User',
      key: 'user',
      render: (record: User) => (
        <Space>
          <Avatar icon={<UserOutlined />} />
          <div>
            <Text strong>{record.name}</Text>
            <br />
            <Text type='secondary' style={{ fontSize: '12px' }}>
              <MailOutlined /> {record.email}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => <Tag color={getRoleColor(role)}>{role.toUpperCase()}</Tag>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Badge status={getStatusColor(status) as any} text={status.toUpperCase()} />
      ),
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: Date) => date.toLocaleDateString(),
    },
    {
      title: 'Last Login',
      dataIndex: 'lastLogin',
      key: 'lastLogin',
      render: (date?: Date) => (date ? date.toLocaleDateString() : 'Never'),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: User) => (
        <Space>
          <Tooltip title='Edit User'>
            <Button type='text' icon={<EditOutlined />} size='small' />
          </Tooltip>
          <Tooltip title='Delete User'>
            <Button
              type='text'
              danger
              icon={<DeleteOutlined />}
              size='small'
              onClick={() => handleDeleteUser(record.id)}
            />
          </Tooltip>
          {record.status === 'active' ? (
            <Tooltip title='Suspend User'>
              <Button type='text' icon={<LockOutlined />} size='small' />
            </Tooltip>
          ) : (
            <Tooltip title='Activate User'>
              <Button type='text' icon={<UnlockOutlined />} size='small' />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchText.toLowerCase()) ||
      user.email.toLowerCase().includes(searchText.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    const matchesStatus = selectedStatus === 'all' || user.status === selectedStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div>
      <DSCard.Root>
        <DSCard.Body>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px',
            }}
          >
            <Title level={3} style={{ margin: 0 }}>
              <UserOutlined /> User Management
            </Title>
            <Button type='primary' icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)}>
              Add User
            </Button>
          </div>

          <Space style={{ marginBottom: '16px', width: '100%' }} direction='vertical'>
            <Space wrap>
              <Search
                placeholder='Search users...'
                allowClear
                style={{ width: 300 }}
                onChange={e => setSearchText(e.target.value)}
                prefix={<SearchOutlined />}
              />
              <Select
                style={{ width: 150 }}
                placeholder='Filter by role'
                value={selectedRole}
                onChange={setSelectedRole}
              >
                <Select.Option value='all'>All Roles</Select.Option>
                <Select.Option value='admin'>Admin</Select.Option>
                <Select.Option value='moderator'>Moderator</Select.Option>
                <Select.Option value='user'>User</Select.Option>
              </Select>
              <Select
                style={{ width: 150 }}
                placeholder='Filter by status'
                value={selectedStatus}
                onChange={setSelectedStatus}
              >
                <Select.Option value='all'>All Statuses</Select.Option>
                <Select.Option value='active'>Active</Select.Option>
                <Select.Option value='inactive'>Inactive</Select.Option>
                <Select.Option value='suspended'>Suspended</Select.Option>
              </Select>
            </Space>
          </Space>

          <Table
            columns={columns}
            dataSource={filteredUsers}
            rowKey='id'
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: total => `Total ${total} users`,
            }}
          />
        </DSCard.Body>
      </DSCard.Root>

      <Modal
        title='Add New User'
        open={isModalVisible}
        onOk={handleAddUser}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        width={600}
      >
        <Form form={form} layout='vertical'>
          <Form.Item
            name='name'
            label='Full Name'
            rules={[{ required: true, message: 'Please enter user name' }]}
          >
            <Input prefix={<UserOutlined />} placeholder='John Doe' />
          </Form.Item>
          <Form.Item
            name='email'
            label='Email'
            rules={[
              { required: true, message: 'Please enter email' },
              { type: 'email', message: 'Please enter valid email' },
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder='john@example.com' />
          </Form.Item>
          <Form.Item
            name='role'
            label='Role'
            rules={[{ required: true, message: 'Please select role' }]}
          >
            <Select placeholder='Select role'>
              <Select.Option value='user'>User</Select.Option>
              <Select.Option value='moderator'>Moderator</Select.Option>
              <Select.Option value='admin'>Admin</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserManagement;
