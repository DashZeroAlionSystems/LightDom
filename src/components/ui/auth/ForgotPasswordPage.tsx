import React, { useState } from 'react';
import {
  Form,
  Input,
  Button,
  Card,
  Typography,
  Alert,
  Result,
  message
} from 'antd';
import {
  MailOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import './AuthForms.css';

const { Title, Text, Paragraph } = Typography;

interface ForgotPasswordFormData {
  email: string;
}

const ForgotPasswordPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (values: ForgotPasswordFormData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: values.email,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        message.success('Password reset instructions sent to your email!');
      } else {
        setError(data.error || 'Failed to send reset instructions');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <Card className="auth-card" bordered={false}>
            <Result
              status="success"
              title="Check Your Email"
              subTitle="We've sent password reset instructions to your email address. Please check your inbox and follow the instructions to reset your password."
              extra={[
                <Button type="primary" key="login" onClick={() => navigate('/login')}>
                  Back to Login
                </Button>,
                <Button key="resend" onClick={() => setSuccess(false)}>
                  Resend Email
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
              Forgot Password?
            </Title>
            <Paragraph className="auth-subtitle">
              Enter your email address and we'll send you instructions to reset your password
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

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                size="large"
              >
                Send Reset Instructions
              </Button>
            </Form.Item>
          </Form>

          <div className="auth-footer">
            <Link to="/login">
              <Button type="link" icon={<ArrowLeftOutlined />}>
                Back to Login
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
