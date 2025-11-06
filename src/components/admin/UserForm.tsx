/**
 * UserForm Component
 * Form for creating and editing user accounts
 * Handles all user fields, role and plan assignment
 */

import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  Select,
  Button,
  Card,
  Space,
  message,
  Row,
  Col,
  Divider,
  Switch,
  Avatar,
  Upload
} from 'antd';
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  LockOutlined,
  SaveOutlined,
  CloseOutlined,
  UploadOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Option } = Select;
const { TextArea } = Input;

interface UserFormProps {
  userId?: string; // If provided, edit mode; otherwise create mode
  initialData?: any;
  onSuccess?: (user: any) => void;
  onCancel?: () => void;
}

const UserForm: React.FC<UserFormProps> = ({
  userId,
  initialData,
  onSuccess,
  onCancel
}) => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [selectedRole, setSelectedRole] = useState<any>(null);
  const isEditMode = !!userId;

  // Fetch plans and roles
  const fetchOptions = async () => {
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
      console.error('Error fetching options:', error);
      message.error('Failed to load form options');
    }
  };

  // Fetch user data if editing
  const fetchUser = async () => {
    if (!userId) return;

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
      form.setFieldsValue({
        username: data.user.username,
        email: data.user.email,
        first_name: data.user.first_name,
        last_name: data.user.last_name,
        phone: data.user.phone,
        company: data.user.company,
        location: data.user.location,
        bio: data.user.bio,
        timezone: data.user.timezone,
        language: data.user.language,
        role_name: data.user.role_name,
        plan_name: data.user.plan_name,
        email_verified: data.user.email_verified,
        account_status: data.user.account_status
      });
    } catch (error) {
      console.error('Error fetching user:', error);
      message.error('Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOptions();
    if (userId) {
      fetchUser();
    } else if (initialData) {
      form.setFieldsValue(initialData);
    }
  }, [userId]);

  // Handle form submission
  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      
      const url = isEditMode ? `/api/users/${userId}` : '/api/users';
      const method = isEditMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(values)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save user');
      }

      const data = await response.json();
      message.success(data.message || `User ${isEditMode ? 'updated' : 'created'} successfully`);
      
      if (onSuccess) {
        onSuccess(data.user);
      } else {
        navigate('/admin/users');
      }
    } catch (error: any) {
      console.error('Error saving user:', error);
      message.error(error.message || 'Failed to save user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      title={isEditMode ? 'Edit User' : 'Create New User'}
      extra={
        <Space>
          <Button
            icon={<CloseOutlined />}
            onClick={() => {
              if (onCancel) {
                onCancel();
              } else {
                navigate('/admin/users');
              }
            }}
          >
            Cancel
          </Button>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={() => form.submit()}
            loading={loading}
          >
            {isEditMode ? 'Update' : 'Create'} User
          </Button>
        </Space>
      }
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          role_name: 'free',
          plan_name: 'free',
          timezone: 'UTC',
          language: 'en',
          account_status: 'active',
          email_verified: false
        }}
      >
        <Divider orientation="left">Basic Information</Divider>
        
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="username"
              label="Username"
              rules={[
                { required: true, message: 'Username is required' },
                { min: 3, message: 'Username must be at least 3 characters' }
              ]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="Enter username"
                disabled={isEditMode} // Username cannot be changed
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: 'Email is required' },
                { type: 'email', message: 'Please enter a valid email' }
              ]}
            >
              <Input
                prefix={<MailOutlined />}
                placeholder="Enter email address"
                disabled={isEditMode} // Email cannot be changed
              />
            </Form.Item>
          </Col>
        </Row>

        {!isEditMode && (
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="password"
                label="Password"
                rules={[
                  { required: !isEditMode, message: 'Password is required' },
                  { min: 8, message: 'Password must be at least 8 characters' }
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Enter password"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="wallet_address"
                label="Wallet Address (Optional)"
              >
                <Input placeholder="0x..." />
              </Form.Item>
            </Col>
          </Row>
        )}

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="first_name"
              label="First Name"
            >
              <Input placeholder="Enter first name" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="last_name"
              label="Last Name"
            >
              <Input placeholder="Enter last name" />
            </Form.Item>
          </Col>
        </Row>

        <Divider orientation="left">Contact Information</Divider>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="phone"
              label="Phone Number"
            >
              <Input prefix={<PhoneOutlined />} placeholder="Enter phone number" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="company"
              label="Company"
            >
              <Input placeholder="Enter company name" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="location"
              label="Location"
            >
              <Input prefix={<EnvironmentOutlined />} placeholder="Enter location" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="timezone"
              label="Timezone"
            >
              <Select placeholder="Select timezone">
                <Option value="UTC">UTC</Option>
                <Option value="America/New_York">America/New York (EST)</Option>
                <Option value="America/Chicago">America/Chicago (CST)</Option>
                <Option value="America/Denver">America/Denver (MST)</Option>
                <Option value="America/Los_Angeles">America/Los Angeles (PST)</Option>
                <Option value="Europe/London">Europe/London (GMT)</Option>
                <Option value="Europe/Paris">Europe/Paris (CET)</Option>
                <Option value="Asia/Tokyo">Asia/Tokyo (JST)</Option>
                <Option value="Asia/Shanghai">Asia/Shanghai (CST)</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="bio"
          label="Bio"
        >
          <TextArea
            rows={4}
            placeholder="Enter user bio or description"
          />
        </Form.Item>

        <Divider orientation="left">Role & Plan Assignment</Divider>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="role_name"
              label="User Role"
              rules={[{ required: true, message: 'Please select a role' }]}
            >
              <Select
                placeholder="Select role"
                onChange={(value) => {
                  const role = roles.find(r => r.role_name === value);
                  setSelectedRole(role);
                }}
              >
                {roles.map(role => (
                  <Option key={role.role_name} value={role.role_name}>
                    <Space>
                      {role.role_label}
                      {role.is_system_role && <Tag>System</Tag>}
                    </Space>
                  </Option>
                ))}
              </Select>
            </Form.Item>
            {selectedRole && (
              <div style={{ marginTop: -16, marginBottom: 16, fontSize: '12px', color: '#888' }}>
                {selectedRole.description}
              </div>
            )}
          </Col>
          <Col span={12}>
            <Form.Item
              name="plan_name"
              label="Subscription Plan"
              rules={[{ required: true, message: 'Please select a plan' }]}
            >
              <Select
                placeholder="Select plan"
                onChange={(value) => {
                  const plan = plans.find(p => p.plan_name === value);
                  setSelectedPlan(plan);
                }}
              >
                {plans.map(plan => (
                  <Option key={plan.plan_name} value={plan.plan_name}>
                    <Space>
                      {plan.plan_label}
                      {plan.price_monthly > 0 && (
                        <span style={{ fontSize: '12px', color: '#888' }}>
                          ${plan.price_monthly}/mo
                        </span>
                      )}
                    </Space>
                  </Option>
                ))}
              </Select>
            </Form.Item>
            {selectedPlan && (
              <div style={{ marginTop: -16, marginBottom: 16, fontSize: '12px', color: '#888' }}>
                {selectedPlan.description}
              </div>
            )}
          </Col>
        </Row>

        {isEditMode && (
          <>
            <Divider orientation="left">Account Settings</Divider>
            
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="account_status"
                  label="Account Status"
                >
                  <Select>
                    <Option value="active">Active</Option>
                    <Option value="suspended">Suspended</Option>
                    <Option value="pending">Pending</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="email_verified"
                  label="Email Verified"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
              </Col>
            </Row>
          </>
        )}

        <Divider orientation="left">Preferences</Divider>

        <Form.Item
          name="language"
          label="Language"
        >
          <Select>
            <Option value="en">English</Option>
            <Option value="es">Spanish</Option>
            <Option value="fr">French</Option>
            <Option value="de">German</Option>
            <Option value="zh">Chinese</Option>
            <Option value="ja">Japanese</Option>
          </Select>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default UserForm;
