/**
 * Modern Front Page Component - Temporary Placeholder
 * Original file was corrupted in the repository
 * This is a minimal placeholder to unblock development
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Typography, Space } from 'antd';
import { RocketOutlined, LoginOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const ModernFrontPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <Space direction="vertical" size="large" style={{ textAlign: 'center', maxWidth: '600px' }}>
        <RocketOutlined style={{ fontSize: '72px', color: 'white' }} />
        <Title style={{ color: 'white', margin: 0 }}>Welcome to LightDom</Title>
        <Paragraph style={{ color: 'white', fontSize: '18px' }}>
          Blockchain-Verified DOM Optimization & Core Web Vitals Automation Platform
        </Paragraph>
        <Space size="large">
          <Button 
            type="primary" 
            size="large" 
            icon={<LoginOutlined />}
            onClick={() => navigate('/login')}
          >
            Login
          </Button>
          <Button 
            size="large"
            onClick={() => navigate('/register')}
            style={{ background: 'white' }}
          >
            Register
          </Button>
        </Space>
      </Space>
    </div>
  );
};

export default ModernFrontPage;
