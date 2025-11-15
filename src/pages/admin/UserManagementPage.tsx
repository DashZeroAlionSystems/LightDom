/**
 * UserManagementPage
 * Main admin page for managing users
 * Provides full CRUD interface for user management
 */

import React, { useState } from 'react';
import { Layout, Tabs, Card, Statistic, Row, Col } from 'antd';
import {
  UserOutlined,
  TeamOutlined,
  CrownOutlined,
  DollarOutlined,
  RiseOutlined
} from '@ant-design/icons';
import UserList from './UserList';
import UserDetail from './UserDetail';
import UserForm from './UserForm';

const { Content } = Layout;
const { TabPane } = Tabs;

const UserManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('list');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);

  // Fetch statistics
  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/users/stats/overview', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  React.useEffect(() => {
    fetchStats();
  }, []);

  const handleUserSelect = (user: any) => {
    setSelectedUserId(user.id);
    setActiveTab('detail');
  };

  const handleCreateUser = () => {
    setSelectedUserId(null);
    setActiveTab('create');
  };

  const handleEditUser = () => {
    setActiveTab('edit');
  };

  const handleBackToList = () => {
    setSelectedUserId(null);
    setActiveTab('list');
    fetchStats();
  };

  return (
    <Layout style={{ background: '#f0f2f5', padding: '24px' }}>
      <Content>
        {/* Statistics Overview */}
        {stats && (
          <Card style={{ marginBottom: 24 }}>
            <Row gutter={16}>
              <Col span={6}>
                <Statistic
                  title="Total Users"
                  value={stats.overview?.total_users || 0}
                  prefix={<TeamOutlined />}
                  valueStyle={{ color: '#3f8600' }}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="Active Users"
                  value={stats.overview?.active_users || 0}
                  prefix={<UserOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="New Users (30d)"
                  value={stats.overview?.new_users_30d || 0}
                  prefix={<RiseOutlined />}
                  valueStyle={{ color: '#cf1322' }}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="Active (7d)"
                  value={stats.overview?.active_users_7d || 0}
                  prefix={<UserOutlined />}
                />
              </Col>
            </Row>

            <Row gutter={16} style={{ marginTop: 24 }}>
              <Col span={12}>
                <h4>Users by Plan</h4>
                {stats.by_plan?.map((plan: any) => (
                  <div key={plan.plan_name} style={{ marginBottom: 8 }}>
                    <DollarOutlined /> {plan.plan_label}: {plan.user_count}
                  </div>
                ))}
              </Col>
              <Col span={12}>
                <h4>Users by Role</h4>
                {stats.by_role?.map((role: any) => (
                  <div key={role.role_name} style={{ marginBottom: 8 }}>
                    <CrownOutlined /> {role.role_label}: {role.user_count}
                  </div>
                ))}
              </Col>
            </Row>
          </Card>
        )}

        {/* Main Content */}
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'list',
              label: 'User List',
              children: (
                <UserList
                  onUserSelect={handleUserSelect}
                  onCreateUser={handleCreateUser}
                />
              )
            },
            {
              key: 'detail',
              label: 'User Details',
              disabled: !selectedUserId,
              children: selectedUserId ? (
                <UserDetail
                  userId={selectedUserId}
                  onEdit={handleEditUser}
                  onBack={handleBackToList}
                />
              ) : null
            },
            {
              key: 'edit',
              label: 'Edit User',
              disabled: !selectedUserId,
              children: selectedUserId ? (
                <UserForm
                  userId={selectedUserId}
                  onSuccess={handleBackToList}
                  onCancel={handleBackToList}
                />
              ) : null
            },
            {
              key: 'create',
              label: 'Create User',
              children: (
                <UserForm
                  onSuccess={handleBackToList}
                  onCancel={handleBackToList}
                />
              )
            }
          ]}
        />
      </Content>
    </Layout>
  );
};

export default UserManagementPage;
