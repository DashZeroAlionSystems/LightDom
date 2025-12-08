/**
 * UserDetail Component
 * Displays detailed information about a single user
 * Shows profile, statistics, activity, and management options
 */

import React, { useState, useEffect } from 'react';
import {
  Card,
  Descriptions,
  Avatar,
  Tag,
  Button,
  Space,
  Tabs,
  Statistic,
  Row,
  Col,
  Timeline,
  message,
  Modal,
  Select,
  Spin
} from 'antd';
import {
  UserOutlined,
  EditOutlined,
  SafetyOutlined,
  CrownOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  TrophyOutlined,
  RocketOutlined,
  DollarOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { TabPane } = Tabs;
const { Option } = Select;

interface UserDetailProps {
  userId: string;
  onEdit?: () => void;
  onBack?: () => void;
}

const UserDetail: React.FC<UserDetailProps> = ({ userId, onEdit, onBack }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);

  // Fetch user data
  const fetchUser = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user');
      }

      const data = await response.json();
      setUser(data.user);
    } catch (error) {
      console.error('Error fetching user:', error);
      message.error('Failed to load user details');
    } finally {
      setLoading(false);
    }
  };

  // Fetch plans and roles for assignment
  const fetchPlansAndRoles = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      
      const [plansRes, rolesRes] = await Promise.all([
        fetch('/api/users/plans/list?public_only=false', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/users/roles/list', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (plansRes.ok) {
        const plansData = await plansRes.json();
        setPlans(plansData.plans);
      }

      if (rolesRes.ok) {
        const rolesData = await rolesRes.json();
        setRoles(rolesData.roles);
      }
    } catch (error) {
      console.error('Error fetching plans and roles:', error);
    }
  };

  useEffect(() => {
    fetchUser();
    fetchPlansAndRoles();
  }, [userId]);

  // Assign plan
  const handleAssignPlan = () => {
    Modal.confirm({
      title: 'Assign Plan',
      content: (
        <div>
          <p>Select a plan to assign to this user:</p>
          <Select
            id="plan-select"
            style={{ width: '100%' }}
            placeholder="Select plan"
            defaultValue={user?.plan_name}
          >
            {plans.map(plan => (
              <Option key={plan.plan_name} value={plan.plan_name}>
                {plan.plan_label} - ${plan.price_monthly}/mo
              </Option>
            ))}
          </Select>
        </div>
      ),
      onOk: async () => {
        try {
          const planSelect = document.getElementById('plan-select') as any;
          const planName = planSelect?.value;
          
          if (!planName) {
            throw new Error('Please select a plan');
          }

          const token = localStorage.getItem('auth_token');
          const response = await fetch(`/api/users/${userId}/assign-plan`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ plan_name: planName })
          });

          if (!response.ok) {
            throw new Error('Failed to assign plan');
          }

          message.success('Plan assigned successfully');
          fetchUser();
        } catch (error: any) {
          console.error('Error assigning plan:', error);
          message.error(error.message || 'Failed to assign plan');
        }
      }
    });
  };

  // Assign role
  const handleAssignRole = () => {
    Modal.confirm({
      title: 'Assign Role',
      content: (
        <div>
          <p>Select a role to assign to this user:</p>
          <Select
            id="role-select"
            style={{ width: '100%' }}
            placeholder="Select role"
            defaultValue={user?.role_name}
          >
            {roles.map(role => (
              <Option key={role.role_name} value={role.role_name}>
                {role.role_label}
              </Option>
            ))}
          </Select>
        </div>
      ),
      onOk: async () => {
        try {
          const roleSelect = document.getElementById('role-select') as any;
          const roleName = roleSelect?.value;
          
          if (!roleName) {
            throw new Error('Please select a role');
          }

          const token = localStorage.getItem('auth_token');
          const response = await fetch(`/api/users/${userId}/assign-role`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ role_name: roleName })
          });

          if (!response.ok) {
            throw new Error('Failed to assign role');
          }

          message.success('Role assigned successfully');
          fetchUser();
        } catch (error: any) {
          console.error('Error assigning role:', error);
          message.error(error.message || 'Failed to assign role');
        }
      }
    });
  };

  if (loading || !user) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" />
        </div>
      </Card>
    );
  }

  return (
    <div>
      {/* Header Card */}
      <Card>
        <Row gutter={[24, 24]} align="middle">
          <Col>
            <Avatar
              size={100}
              src={user.avatar_url}
              icon={!user.avatar_url && <UserOutlined />}
            />
          </Col>
          <Col flex="auto">
            <h2 style={{ margin: 0 }}>
              {user.first_name && user.last_name
                ? `${user.first_name} ${user.last_name}`
                : user.username}
            </h2>
            <p style={{ margin: '8px 0', color: '#888' }}>@{user.username}</p>
            <Space wrap>
              <Tag color="blue" icon={<MailOutlined />}>
                {user.email}
              </Tag>
              <Tag color={user.email_verified ? 'green' : 'orange'}>
                {user.email_verified ? 'Verified' : 'Unverified'}
              </Tag>
              <Tag color="purple">
                <CrownOutlined /> {user.role_label}
              </Tag>
              <Tag color="gold">
                <DollarOutlined /> {user.plan_label}
              </Tag>
            </Space>
          </Col>
          <Col>
            <Space direction="vertical">
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={() => {
                  if (onEdit) {
                    onEdit();
                  } else {
                    navigate(`/admin/users/${userId}/edit`);
                  }
                }}
              >
                Edit Profile
              </Button>
              {onBack && (
                <Button onClick={onBack}>
                  Back to List
                </Button>
              )}
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Statistics */}
      <Card style={{ marginTop: 16 }}>
        <Row gutter={16}>
          <Col span={6}>
            <Statistic
              title="Reputation Score"
              value={user.reputation_score || 0}
              prefix={<TrophyOutlined />}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="Optimizations"
              value={user.optimization_count || 0}
              prefix={<RocketOutlined />}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="Space Harvested"
              value={(user.total_space_harvested || 0) / 1024 / 1024}
              suffix="MB"
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="Login Count"
              value={user.login_count || 0}
            />
          </Col>
        </Row>
      </Card>

      {/* Detailed Information */}
      <Card style={{ marginTop: 16 }}>
        <Tabs defaultActiveKey="profile">
          <TabPane tab="Profile Information" key="profile">
            <Descriptions bordered column={2}>
              <Descriptions.Item label="User ID" span={2}>
                {user.id}
              </Descriptions.Item>
              <Descriptions.Item label="Username">
                {user.username}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {user.email}
              </Descriptions.Item>
              <Descriptions.Item label="First Name">
                {user.first_name || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Last Name">
                {user.last_name || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Phone">
                {user.phone || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Company">
                {user.company || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Location">
                {user.location || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Timezone">
                {user.timezone || 'UTC'}
              </Descriptions.Item>
              <Descriptions.Item label="Language">
                {user.language || 'en'}
              </Descriptions.Item>
              <Descriptions.Item label="Bio" span={2}>
                {user.bio || 'No bio provided'}
              </Descriptions.Item>
            </Descriptions>
          </TabPane>

          <TabPane tab="Account & Subscription" key="account">
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Account Status">
                <Tag color={user.account_status === 'active' ? 'green' : 'orange'}>
                  {user.account_status?.toUpperCase()}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Subscription Status">
                <Tag color={user.subscription_status === 'active' ? 'green' : 'orange'}>
                  {user.subscription_status?.toUpperCase()}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Current Role">
                <Space>
                  <Tag color="purple">{user.role_label}</Tag>
                  <Button size="small" onClick={handleAssignRole}>
                    Change Role
                  </Button>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Current Plan">
                <Space>
                  <Tag color="gold">{user.plan_label}</Tag>
                  <Button size="small" onClick={handleAssignPlan}>
                    Change Plan
                  </Button>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Subscription Started">
                {user.subscription_started_at
                  ? new Date(user.subscription_started_at).toLocaleString()
                  : 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Subscription Expires">
                {user.subscription_expires_at
                  ? new Date(user.subscription_expires_at).toLocaleString()
                  : 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Trial Ends">
                {user.trial_ends_at
                  ? new Date(user.trial_ends_at).toLocaleString()
                  : 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Wallet Address">
                {user.wallet_address || 'Not connected'}
              </Descriptions.Item>
            </Descriptions>
          </TabPane>

          <TabPane tab="Activity & Timeline" key="activity">
            <Timeline>
              <Timeline.Item color="green">
                <p>Account Created</p>
                <p style={{ fontSize: '12px', color: '#888' }}>
                  {new Date(user.created_at).toLocaleString()}
                </p>
              </Timeline.Item>
              {user.last_login_at && (
                <Timeline.Item color="blue">
                  <p>Last Login</p>
                  <p style={{ fontSize: '12px', color: '#888' }}>
                    {new Date(user.last_login_at).toLocaleString()}
                  </p>
                </Timeline.Item>
              )}
              {user.updated_at && (
                <Timeline.Item>
                  <p>Profile Updated</p>
                  <p style={{ fontSize: '12px', color: '#888' }}>
                    {new Date(user.updated_at).toLocaleString()}
                  </p>
                </Timeline.Item>
              )}
            </Timeline>
          </TabPane>

          <TabPane tab="Plan Features & Limits" key="features">
            <Descriptions bordered column={1}>
              {user.plan_features && user.plan_features.map((feature: string, idx: number) => (
                <Descriptions.Item key={idx} label={`Feature ${idx + 1}`}>
                  {feature}
                </Descriptions.Item>
              ))}
            </Descriptions>
            <h4 style={{ marginTop: 24 }}>Usage Limits</h4>
            <Descriptions bordered column={2}>
              {user.plan_limits && Object.entries(user.plan_limits).map(([key, value]: [string, any]) => (
                <Descriptions.Item key={key} label={key.replace(/_/g, ' ').toUpperCase()}>
                  {value === -1 ? 'Unlimited' : value === true ? 'Yes' : value === false ? 'No' : value}
                </Descriptions.Item>
              ))}
            </Descriptions>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default UserDetail;
