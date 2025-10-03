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
  UserOutlined,
  MailOutlined,
  LockOutlined,
  GlobalOutlined,
  WalletOutlined
} from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import './AuthForms.css';

const { Title, Text, Paragraph } = Typography;

interface SignupFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  walletAddress?: string;
  agreeToTerms: boolean;
}

interface SignupFormProps {
  onSuccess?: () => void;
}

const SignupForm: React.FC<SignupFormProps> = ({ onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSignup = async (values: SignupFormData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: values.name,
          email: values.email,
          password: values.password,
          walletAddress: values.walletAddress,
          agreeToTerms: values.agreeToTerms
        }),
      });

      const data = await response.json();

      if (response.ok) {
        message.success('Account created successfully! Please check your email to verify your account.');
        
        // Store auth token
        if (data.token) {
          localStorage.setItem('auth_token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
        }

        onSuccess?.();
        navigate('/dashboard');
      } else {
        setError(data.error || 'Failed to create account');
      }
    } catch (error) {
      console.error('Signup error:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form-container">
      <Row justify="center" align="middle" style={{ minHeight: '100vh' }}>
        <Col xs={22} sm={18} md={12} lg={8} xl={6}>
          <Card className="auth-card" bordered={false}>
            <div className="auth-header">
              <Title level={2} className="auth-title">
                Join LightDom
              </Title>
              <Paragraph className="auth-subtitle">
                Start mining DOM space and earning tokens
              </Paragraph>
            </div>

            {error && (
              <Alert
                message="Signup Failed"
                description={error}
                type="error"
                showIcon
                style={{ marginBottom: 24 }}
              />
            )}

            <Form
              layout="vertical"
              onFinish={handleSignup}
              size="large"
            >
              <Form.Item
                name="name"
                label="Full Name"
                rules={[
                  { required: true, message: 'Please enter your full name' },
                  { min: 2, message: 'Name must be at least 2 characters' }
                ]}
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="Enter your full name"
                />
              </Form.Item>

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
                  { required: true, message: 'Please enter a password' },
                  { min: 8, message: 'Password must be at least 8 characters' },
                  { 
                    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
                    message: 'Password must contain uppercase, lowercase, number, and special character'
                  }
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Create a strong password"
                />
              </Form.Item>

              <Form.Item
                name="confirmPassword"
                label="Confirm Password"
                dependencies={['password']}
                rules={[
                  { required: true, message: 'Please confirm your password' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('Passwords do not match'));
                    },
                  }),
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Confirm your password"
                />
              </Form.Item>

              <Form.Item
                name="walletAddress"
                label="Wallet Address (Optional)"
                rules={[
                  { 
                    pattern: /^0x[a-fA-F0-9]{40}$/,
                    message: 'Please enter a valid Ethereum address'
                  }
                ]}
              >
                <Input
                  prefix={<WalletOutlined />}
                  placeholder="0x... (Ethereum wallet address)"
                />
              </Form.Item>

              <Form.Item
                name="agreeToTerms"
                valuePropName="checked"
                rules={[
                  { 
                    validator: (_, value) => 
                      value ? Promise.resolve() : Promise.reject(new Error('You must agree to the terms'))
                  }
                ]}
              >
                <Checkbox>
                  I agree to the{' '}
                  <Link to="/terms" target="_blank">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" target="_blank">
                    Privacy Policy
                  </Link>
                </Checkbox>
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  block
                  size="large"
                >
                  Create Account
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
                Already have an account?{' '}
                <Link to="/login">
                  <Text strong>Sign in</Text>
                </Link>
              </Text>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default SignupForm;