import React, { useState } from 'react';
import {
  Form,
  Input,
  Button,
  Card,
  Typography,
  Space,
  Alert,
  Divider,
  Row,
  Col,
  message,
  Checkbox
} from 'antd';
import {
  MailOutlined,
  LockOutlined,
  WalletOutlined,
  UserOutlined
} from '@ant-design/icons';
// Avoid react-router hooks in contexts without a Router
import './AuthForms.css';

const { Title, Text, Paragraph } = Typography;

interface LoginFormData {
  email: string;
  password: string;
  remember: boolean;
}

interface LoginFormProps {
  onSuccess?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigatePath = (path: string) => { window.location.pathname = path; };

  const handleLogin = async (values: LoginFormData) => {
    try {
      setLoading(true);
      setError(null);

      // Mock authentication for development - check this first
      if ((values.email === 'admin' || values.email === 'admin@lightdom.com') && values.password === 'admin123') {
        message.success('Welcome back, Admin!');
        
        // Store mock auth data
        const mockUser = {
          id: 'admin',
          username: 'admin',
          email: 'admin@lightdom.com',
          role: 'admin',
          subscription: {
            plan: 'admin',
            status: 'active',
            expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
            features: ['all']
          },
          wallet: {
            address: '0x1234567890123456789012345678901234567890',
            connected: true,
            balance: '1000.0',
            ldomBalance: '5000.0'
          },
          stats: {
            reputation: 100,
            totalSpaceHarvested: 1000000,
            optimizationCount: 150,
            tokensEarned: '5000.0'
          },
          preferences: {
            theme: 'dark',
            notifications: true,
            language: 'en',
            dashboard: ['overview', 'mining', 'analytics']
          },
          permissions: [
            { resource: 'admin', actions: ['read', 'write', 'delete'] },
            { resource: 'users', actions: ['read', 'write', 'delete'] },
            { resource: 'system', actions: ['read', 'write', 'delete'] }
          ]
        };

        localStorage.setItem('auth_token', 'mock-admin-token');
        localStorage.setItem('user', JSON.stringify(mockUser));
        
        if (values.remember) {
          localStorage.setItem('remember_me', 'true');
        }

        onSuccess?.();
        navigatePath('/admin');
        return;
      }

      // For any other credentials, show demo message
      setError('Demo Mode: Use admin/admin123 for admin access or register a new account.');
      
    } catch (error) {
      console.error('Login error:', error);
      setError('Login failed. Try admin/admin123 for demo access.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    try {
      const email = prompt('Enter your email address:');
      if (!email) return;

      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        message.success('Password reset email sent!');
      } else {
        message.error('Failed to send reset email');
      }
    } catch (error) {
      message.error('Network error. Please try again.');
    }
  };

  return (
    <div className="auth-form-container">
      <Row justify="center" align="middle" style={{ minHeight: '70vh' }}>
        <Col xs={24} sm={22} md={18} lg={14} xl={12}>
          <Card className="auth-card" bordered={false}>
            <div className="auth-header">
              <Title level={2} className="auth-title">
                Welcome Back
              </Title>
              <Paragraph className="auth-subtitle">
                Sign in to continue mining DOM space
              </Paragraph>
            </div>

            {error && (
              <Alert
                message="Login Failed"
                description={error}
                type="error"
                showIcon
                style={{ marginBottom: 24 }}
              />
            )}

            <Form
              layout="vertical"
              onFinish={handleLogin}
              size="large"
            >
              <Form.Item
                name="email"
                label="Email Address"
                rules={[
                  { required: true, message: 'Please enter your email' },
                  { type: 'email', message: 'Please enter a valid email' }
                ]}
              >
                <Input
                  prefix={<MailOutlined />}
                  placeholder="Enter your email address"
                />
              </Form.Item>

              <Form.Item
                name="password"
                label="Password"
                rules={[
                  { required: true, message: 'Please enter your password' }
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Enter your password"
                />
              </Form.Item>

              <Form.Item>
                <Row justify="space-between" align="middle">
                  <Col>
                    <Form.Item name="remember" valuePropName="checked" noStyle>
                      <Checkbox>Remember me</Checkbox>
                    </Form.Item>
                  </Col>
                  <Col>
                    <Button type="link" onClick={handleForgotPassword}>
                      Forgot password?
                    </Button>
                  </Col>
                </Row>
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  block
                  size="large"
                >
                  Sign In
                </Button>
              </Form.Item>
            </Form>

            <Divider>Or</Divider>

            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <Button
                icon={<WalletOutlined />}
                block
                size="large"
                onClick={() => message.info('Wallet connection coming soon!')}
              >
                Connect Wallet
              </Button>
            </Space>

            <div className="auth-footer">
              <Text>
                Don't have an account?{' '}
                <a href="/register">
                  <Text strong>Sign up</Text>
                </a>
              </Text>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default LoginForm;