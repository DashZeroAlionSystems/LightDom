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
import { Link, useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();

  const handleLogin = async (values: LoginFormData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: values.email,
          password: values.password,
          remember: values.remember
        }),
      });

      const data = await response.json();

      if (response.ok) {
        message.success('Welcome back!');
        
        // Store auth token and user data
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        if (values.remember) {
          localStorage.setItem('remember_me', 'true');
        }

        onSuccess?.();
        navigate('/dashboard');
      } else {
        setError(data.error || 'Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Network error. Please try again.');
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
      <Row justify="center" align="middle" style={{ minHeight: '100vh' }}>
        <Col xs={22} sm={18} md={12} lg={8} xl={6}>
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
                <Link to="/register">
                  <Text strong>Sign up</Text>
                </Link>
              </Text>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default LoginForm;