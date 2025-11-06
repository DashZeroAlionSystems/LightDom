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
  UserOutlined,
  WalletOutlined
} from '@ant-design/icons';
import './AuthForms.css';

const { Title, Text, Paragraph } = Typography;

interface SignupFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
  marketingEmails: boolean;
}

interface SignupFormProps {
  onSuccess?: () => void;
}

const SignupForm: React.FC<SignupFormProps> = ({ onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const navigatePath = (path: string) => { window.location.pathname = path; };

  const calculatePasswordStrength = (password: string): number => {
    let strength = 0;
    
    if (password.length >= 8) strength += 1;
    if (password.length >= 12) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    
    return strength;
  };

  const getPasswordStrengthText = (strength: number): string => {
    if (strength <= 2) return 'Weak';
    if (strength <= 4) return 'Medium';
    if (strength <= 5) return 'Strong';
    return 'Very Strong';
  };

  const getPasswordStrengthColor = (strength: number): string => {
    if (strength <= 2) return '#e74c3c';
    if (strength <= 4) return '#f39c12';
    if (strength <= 5) return '#27ae60';
    return '#2ecc71';
  };

  const handleSignup = async (values: SignupFormData) => {
    try {
      setLoading(true);
      setError(null);

      // Mock registration for development
      if (values.email && values.password) {
        message.success('Account created successfully!');
        
        // Store mock user data
        const mockUser = {
          id: `user_${Date.now()}`,
          username: `${values.firstName}${values.lastName}`.toLowerCase(),
          email: values.email,
          role: 'user',
          subscription: {
            plan: 'free',
            status: 'active',
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            features: ['basic_optimization', 'limited_mining']
          },
          wallet: {
            address: '0x0000000000000000000000000000000000000000',
            connected: false,
            balance: '0.0',
            ldomBalance: '0.0'
          },
          stats: {
            reputation: 0,
            totalSpaceHarvested: 0,
            optimizationCount: 0,
            tokensEarned: '0.0'
          },
          preferences: {
            theme: 'system',
            notifications: true,
            language: 'en',
            dashboard: ['overview']
          },
          permissions: [
            { resource: 'profile', actions: ['read', 'write'] },
            { resource: 'mining', actions: ['read'] }
          ]
        };

        localStorage.setItem('auth_token', `mock-token-${Date.now()}`);
        localStorage.setItem('user', JSON.stringify(mockUser));

        onSuccess?.();
        navigatePath('/dashboard');
        return;
      }

      // Try API call as fallback
      try {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            firstName: values.firstName,
            lastName: values.lastName,
            email: values.email,
            password: values.password,
            marketingEmails: values.marketingEmails
          }),
        });

        if (response.ok) {
          const data = await response.json();
          message.success('Account created successfully!');
          
          localStorage.setItem('auth_token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));

          onSuccess?.();
          navigatePath('/dashboard');
        } else {
          setError('Registration failed. Please try again.');
        }
      } catch (apiError) {
        // API server not available, use mock registration
        message.success('Account created successfully! (Demo Mode)');
        
        const mockUser = {
          id: `user_${Date.now()}`,
          username: `${values.firstName}${values.lastName}`.toLowerCase(),
          email: values.email,
          role: 'user',
          subscription: {
            plan: 'free',
            status: 'active',
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            features: ['basic_optimization', 'limited_mining']
          },
          wallet: {
            address: '0x0000000000000000000000000000000000000000',
            connected: false,
            balance: '0.0',
            ldomBalance: '0.0'
          },
          stats: {
            reputation: 0,
            totalSpaceHarvested: 0,
            optimizationCount: 0,
            tokensEarned: '0.0'
          },
          preferences: {
            theme: 'system',
            notifications: true,
            language: 'en',
            dashboard: ['overview']
          },
          permissions: [
            { resource: 'profile', actions: ['read', 'write'] },
            { resource: 'mining', actions: ['read'] }
          ]
        };

        localStorage.setItem('auth_token', `mock-token-${Date.now()}`);
        localStorage.setItem('user', JSON.stringify(mockUser));

        onSuccess?.();
        navigatePath('/dashboard');
      }
    } catch (error) {
      console.error('Signup error:', error);
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleWalletSignup = () => {
    message.info('Wallet registration coming soon!');
  };

  return (
    <div className="auth-form-container">
      <Row justify="center" align="middle" style={{ minHeight: '70vh' }}>
        <Col xs={24} sm={22} md={18} lg={14} xl={12}>
          <Card className="auth-card" bordered={false}>
            <div className="auth-header">
              <Title level={2} className="auth-title">
                Create Account
              </Title>
              <Paragraph className="auth-subtitle">
                Join the DOM optimization revolution
              </Paragraph>
            </div>

            {error && (
              <Alert
                message="Registration Failed"
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
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="firstName"
                    label="First Name"
                    rules={[
                      { required: true, message: 'Please enter your first name' }
                    ]}
                  >
                    <Input
                      prefix={<UserOutlined />}
                      placeholder="First name"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="lastName"
                    label="Last Name"
                    rules={[
                      { required: true, message: 'Please enter your last name' }
                    ]}
                  >
                    <Input
                      prefix={<UserOutlined />}
                      placeholder="Last name"
                    />
                  </Form.Item>
                </Col>
              </Row>

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
                  { required: true, message: 'Please enter your password' },
                  { min: 8, message: 'Password must be at least 8 characters' }
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Create a strong password"
                  onChange={(e) => {
                    const strength = calculatePasswordStrength(e.target.value);
                    setPasswordStrength(strength);
                  }}
                />
              </Form.Item>

              {passwordStrength > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ 
                    height: 4, 
                    background: '#f0f0f0', 
                    borderRadius: 2, 
                    overflow: 'hidden',
                    marginBottom: 4
                  }}>
                    <div 
                      style={{ 
                        height: '100%',
                        width: `${(passwordStrength / 6) * 100}%`,
                        background: getPasswordStrengthColor(passwordStrength),
                        transition: 'all 0.3s ease'
                      }}
                    />
                  </div>
                  <Text style={{ 
                    fontSize: 12, 
                    color: getPasswordStrengthColor(passwordStrength),
                    fontWeight: 500
                  }}>
                    {getPasswordStrengthText(passwordStrength)}
                  </Text>
                </div>
              )}

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

              <Form.Item>
                <Form.Item name="agreeToTerms" valuePropName="checked" noStyle>
                  <Checkbox>
                    I agree to the{' '}
                    <a href="/terms" target="_blank" rel="noopener noreferrer">
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a href="/privacy" target="_blank" rel="noopener noreferrer">
                      Privacy Policy
                    </a>
                  </Checkbox>
                </Form.Item>
              </Form.Item>

              <Form.Item name="marketingEmails" valuePropName="checked" noStyle>
                <Checkbox>
                  Send me marketing emails and updates
                </Checkbox>
              </Form.Item>

              <Form.Item style={{ marginTop: 24 }}>
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
                onClick={handleWalletSignup}
              >
                Connect Wallet
              </Button>
            </Space>

            <div className="auth-footer">
              <Text>
                Already have an account?{' '}
                <a href="/login">
                  <Text strong>Sign in</Text>
                </a>
              </Text>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default SignupForm;
