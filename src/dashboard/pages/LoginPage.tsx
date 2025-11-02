import React from 'react';
import { Form, Input, Button, Card } from 'antd';
import { useAuth } from '../contexts/AuthContext';

const LoginPage: React.FC = () => {
  const { login } = useAuth();

  const onFinish = async (values: any) => {
    await login(values.email, values.password);
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#0A0E27' }}>
      <Card title="Login" style={{ width: 400 }}>
        <Form onFinish={onFinish} layout="vertical">
          <Form.Item label="Email" name="email" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Password" name="password" rules={[{ required: true }]}>
            <Input.Password />
          </Form.Item>
          <Button type="primary" htmlType="submit" block>Login</Button>
        </Form>
      </Card>
    </div>
  );
};

export default LoginPage;
