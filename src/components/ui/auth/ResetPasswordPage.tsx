import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  Button,
  Card,
  Typography,
  Alert,
  Result,
  Progress,
  message
} from 'antd';
import {
  LockOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './AuthForms.css';

const { Title, Text, Paragraph } = Typography;

interface ResetPasswordFormData {
  password: string;
  confirmPassword: string;
}

const ResetPasswordPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  useEffect(() => {
    validateToken();
  }, [token]);

  const validateToken = async () => {
    if (!token) {
      setTokenValid(false);
      return;
    }

    try {
      const response = await fetch(`/api/auth/validate-reset-token?token=${token}`);
      const data = await response.json();
      
      setTokenValid(response.ok && data.valid);
    } catch (error) {
      console.error('Token validation error:', error);
      setTokenValid(false);
    }
  };

  const calculatePasswordStrength = (password: string): number => {
    let strength = 0;
    
    if (password.length >= 8) strength += 20;
    if (password.length >= 12) strength += 20;
    if (/[a-z]/.test(password)) strength += 20;
    if (/[A-Z]/.test(password)) strength += 20;
    if (/[0-9]/.test(password)) strength += 10;
    if (/[^A-Za-z0-9]/.test(password)) strength += 10;
    
    return strength;
  };

  const getPasswordStrengthText = (strength: number): string => {
    if (strength < 40) return 'Weak';
    if (strength < 70) return 'Medium';
    if (strength < 90) return 'Strong';
    return 'Very Strong';
  };

  const getPasswordStrengthColor = (strength: number): string => {
    if (strength < 40) return 'exception';
    if (strength < 70) return 'normal';
    if (strength < 90) return 'success';
    return 'success';
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    const strength = calculatePasswordStrength(newPassword);
    setPasswordStrength(strength);
  };

  const handleSubmit = async (values: ResetPasswordFormData) => {
    if (values.password !== values.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          password: values.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        message.success('Password reset successfully!');
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setError(data.error || 'Failed to reset password');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while validating token
  if (tokenValid === null) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <Card className="auth-card" bordered={false}>
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <Title level={3}>Validating Reset Link...</Title>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Show error if token is invalid
  if (!tokenValid) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <Card className="auth-card" bordered={false}>
            <Result
              status="error"
              title="Invalid or Expired Link"
              subTitle="This password reset link is invalid or has expired. Please request a new one."
              extra={[
                <Button type="primary" key="forgot" onClick={() => navigate('/forgot-password')}>
                  Request New Link
                </Button>,
                <Button key="login" onClick={() => navigate('/login')}>
                  Back to Login
                </Button>
              ]}
            />
          </Card>
        </div>
      </div>
    );
  }

  // Show success message after reset
  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <Card className="auth-card" bordered={false}>
            <Result
              status="success"
              title="Password Reset Successfully!"
              subTitle="Your password has been reset. You can now log in with your new password."
              extra={[
                <Button type="primary" key="login" onClick={() => navigate('/login')}>
                  Go to Login
                </Button>
              ]}
            />
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <Card className="auth-card" bordered={false}>
          <div className="auth-header">
            <Title level={2} className="auth-title">
              Reset Password
            </Title>
            <Paragraph className="auth-subtitle">
              Enter your new password below
            </Paragraph>
          </div>

          {error && (
            <Alert
              message="Error"
              description={error}
              type="error"
              showIcon
              style={{ marginBottom: 24 }}
              closable
              onClose={() => setError(null)}
            />
          )}

          <Form
            layout="vertical"
            onFinish={handleSubmit}
            size="large"
          >
            <Form.Item
              name="password"
              label="New Password"
              rules={[
                { required: true, message: 'Please enter your new password' },
                { min: 8, message: 'Password must be at least 8 characters' },
                {
                  validator: (_, value) => {
                    const strength = calculatePasswordStrength(value || '');
                    if (strength < 40) {
                      return Promise.reject('Password is too weak');
                    }
                    return Promise.resolve();
                  }
                }
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Enter your new password"
                onChange={handlePasswordChange}
              />
            </Form.Item>

            {passwordStrength > 0 && (
              <div style={{ marginBottom: 24 }}>
                <Progress
                  percent={passwordStrength}
                  status={getPasswordStrengthColor(passwordStrength) as any}
                  showInfo={false}
                />
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  Password Strength: {getPasswordStrengthText(passwordStrength)}
                </Text>
              </div>
            )}

            <Form.Item
              name="confirmPassword"
              label="Confirm New Password"
              dependencies={['password']}
              rules={[
                { required: true, message: 'Please confirm your new password' },
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
                placeholder="Confirm your new password"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                size="large"
              >
                Reset Password
              </Button>
            </Form.Item>
          </Form>

          <div className="auth-footer">
            <Text>
              Remember your password?{' '}
              <Button type="link" onClick={() => navigate('/login')}>
                Back to Login
              </Button>
            </Text>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
