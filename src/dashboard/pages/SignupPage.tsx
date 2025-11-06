import React from 'react';
import { Form, Input, Button, Card } from 'antd';
import { useAuth } from '../contexts/AuthContext';

const SignupPage: React.FC = () => {
  const { signup } = useAuth();

  const onFinish = async (values: any) => {
    await signup(values.email, values.password, values.name);
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#0A0E27' }}>
      <Card title="Sign Up" style={{ width: 400 }}>
        <Form onFinish={onFinish} layout="vertical">
          <Form.Item label="Name" name="name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Email" name="email" rules={[{ required: true, type: 'email' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Password" name="password" rules={[{ required: true, min: 8 }]}>
            <Input.Password />
          </Form.Item>
          <Button type="primary" htmlType="submit" block>Sign Up</Button>
        </Form>
      </Card>
    </div>
  );
};

export default SignupPage;
