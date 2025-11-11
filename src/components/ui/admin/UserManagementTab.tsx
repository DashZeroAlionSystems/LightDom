/**
 * User Management Tab Component
 * Extracted from AdminDashboard for better performance
 */

import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  TeamOutlined,
  UserOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import {
  Button,
  Col,
  Form,
  Input,
  Modal,
  Row,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from 'antd';
import React, { useEffect, useState } from 'react';
import { Card as DSCard } from '../../../utils/AdvancedReusableComponents';
import { StatCard } from '../StatCard';

const { Text } = Typography;
const { confirm } = Modal;

export const UserManagementTab: React.FC = () => {
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [userModalVisible, setUserModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userForm] = Form.useForm();

  // Load users
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const response = await fetch('/api/admin/users?page=1&limit=50');
      const data = await response.json();
      if (data.success) {
        setUsers(data.users);
      }
    } catch (error) {
      message.error('Failed to load users');
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleCreateUser = async values => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const data = await response.json();
      if (data.success) {
        message.success('User created successfully');
        setUserModalVisible(false);
        userForm.resetFields();
        fetchUsers();
      }
    } catch (error) {
      message.error('Failed to create user');
    }
  };

  const handleUpdateUser = async values => {
    try {
      const response = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const data = await response.json();
      if (data.success) {
        message.success('User updated successfully');
        setUserModalVisible(false);
        setEditingUser(null);
        userForm.resetFields();
        fetchUsers();
      }
    } catch (error) {
      message.error('Failed to update user');
    }
  };

  const handleDeleteUser = async userId => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        message.success('User deleted successfully');
        fetchUsers();
      }
    } catch (error) {
      message.error('Failed to delete user');
    }
  };

  const handleUserAction = async (userId, action) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/${action}`, {
        method: 'POST',
      });
      const data = await response.json();
      if (data.success) {
        message.success(`User ${action} successful`);
        fetchUsers();
      }
    } catch (error) {
      message.error(`Failed to ${action} user`);
    }
  };

  const handleBulkAction = async action => {
    if (selectedUsers.length === 0) {
      message.warning('Please select users first');
      return;
    }

    try {
      const response = await fetch('/api/admin/users/bulk-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, userIds: selectedUsers }),
      });
      const data = await response.json();
      if (data.success) {
        message.success(`Bulk ${action} successful`);
        setSelectedUsers([]);
        fetchUsers();
      }
    } catch (error) {
      message.error(`Failed to perform bulk ${action}`);
    }
  };

  const userColumns = [
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
      sorter: (a, b) => a.username.localeCompare(b.username),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: role => <Tag color={role === 'admin' ? 'red' : 'blue'}>{role.toUpperCase()}</Tag>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: status => (
        <Tag color={status === 'active' ? 'green' : 'orange'}>{status.toUpperCase()}</Tag>
      ),
    },
    {
      title: 'Reputation',
      dataIndex: ['stats', 'reputation'],
      key: 'reputation',
      sorter: (a, b) => a.stats.reputation - b.stats.reputation,
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: date => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            size='small'
            onClick={() => {
              setEditingUser(record);
              userForm.setFieldsValue(record);
              setUserModalVisible(true);
            }}
          >
            <EditOutlined />
          </Button>
          <Button
            size='small'
            type='primary'
            onClick={() => handleUserAction(record.id, 'activate')}
            disabled={record.status === 'active'}
          >
            Activate
          </Button>
          <Button
            size='small'
            danger
            onClick={() =>
              confirm({
                title: 'Delete User',
                content: `Are you sure you want to delete ${record.username}?`,
                onOk: () => handleDeleteUser(record.id),
              })
            }
          >
            <DeleteOutlined />
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <>
      <DSCard.Root>
        <DSCard.Header title='User Management' />
        <DSCard.Body>
          <Space direction='vertical' style={{ width: '100%' }} size='large'>
            <Row gutter={[16, 16]}>
              <Col xs={24} md={6}>
                <StatCard
                  title='Total Users'
                  value={users.length}
                  icon={<TeamOutlined />}
                  color='#1890ff'
                  loading={loadingUsers}
                />
              </Col>
              <Col xs={24} md={6}>
                <StatCard
                  title='Active Users'
                  value={users.filter(u => u.status === 'active').length}
                  icon={<UserOutlined />}
                  color='#52c41a'
                  loading={loadingUsers}
                />
              </Col>
              <Col xs={24} md={6}>
                <StatCard
                  title='Admins'
                  value={users.filter(u => u.role === 'admin').length}
                  icon={<UserOutlined />}
                  color='#722ed1'
                  loading={loadingUsers}
                />
              </Col>
              <Col xs={24} md={6}>
                <StatCard
                  title='Suspended'
                  value={users.filter(u => u.status === 'suspended').length}
                  icon={<WarningOutlined />}
                  color='#faad14'
                  loading={loadingUsers}
                />
              </Col>
            </Row>

            <DSCard.Root>
              <DSCard.Header title='User Management Tools' />
              <DSCard.Body>
                <Space direction='vertical' style={{ width: '100%' }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Text strong>Quick Actions</Text>
                    <Space>
                      <Button
                        type='primary'
                        icon={<PlusOutlined />}
                        onClick={() => {
                          setEditingUser(null);
                          userForm.resetFields();
                          setUserModalVisible(true);
                        }}
                      >
                        Add User
                      </Button>
                      {selectedUsers.length > 0 && (
                        <Space>
                          <Button onClick={() => handleBulkAction('activate')}>
                            Bulk Activate
                          </Button>
                          <Button onClick={() => handleBulkAction('suspend')}>Bulk Suspend</Button>
                        </Space>
                      )}
                    </Space>
                  </div>
                  <Table
                    rowSelection={{
                      selectedRowKeys: selectedUsers,
                      onChange: setSelectedUsers,
                    }}
                    columns={userColumns}
                    dataSource={users}
                    loading={loadingUsers}
                    rowKey='id'
                    pagination={{ pageSize: 10 }}
                  />
                </Space>
              </DSCard.Body>
            </DSCard.Root>
          </Space>
        </DSCard.Body>
      </DSCard.Root>

      {/* User Modal */}
      <Modal
        title={editingUser ? 'Edit User' : 'Create User'}
        open={userModalVisible}
        onCancel={() => {
          setUserModalVisible(false);
          setEditingUser(null);
          userForm.resetFields();
        }}
        footer={null}
      >
        <Form
          form={userForm}
          layout='vertical'
          onFinish={editingUser ? handleUpdateUser : handleCreateUser}
        >
          <Form.Item
            name='username'
            label='Username'
            rules={[{ required: true, message: 'Please enter username' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name='email'
            label='Email'
            rules={[{ required: true, type: 'email', message: 'Please enter valid email' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name='role'
            label='Role'
            rules={[{ required: true, message: 'Please select role' }]}
          >
            <Select>
              <Select.Option value='user'>User</Select.Option>
              <Select.Option value='admin'>Admin</Select.Option>
            </Select>
          </Form.Item>
          {!editingUser && (
            <Form.Item name='subscription' label='Subscription Plan'>
              <Select>
                <Select.Option value='free'>Free</Select.Option>
                <Select.Option value='pro'>Pro</Select.Option>
                <Select.Option value='enterprise'>Enterprise</Select.Option>
              </Select>
            </Form.Item>
          )}
          <Form.Item>
            <Space>
              <Button type='primary' htmlType='submit'>
                {editingUser ? 'Update' : 'Create'} User
              </Button>
              <Button
                onClick={() => {
                  setUserModalVisible(false);
                  setEditingUser(null);
                  userForm.resetFields();
                }}
              >
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};
