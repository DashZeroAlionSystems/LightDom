/**
 * Modern Front Page Component - Temporary Placeholder
 * Original file was corrupted in the repository
 * This is a minimal placeholder to unblock development
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Typography, Space } from 'antd';
import { RocketOutlined, LoginOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const ModernFrontPage: React.FC = () => {
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
          <Link to="/login">
            <Button 
              type="primary" 
              size="large" 
              icon={<LoginOutlined />}
            >
              Login
            </Button>
          </Link>
          <Link to="/register">
            <Button 
              size="large"
              style={{ background: 'white' }}
            >
              Register
            </Button>
          </Link>
        </Space>
      </Space>
    </div>
  );
};

export default ModernFrontPage;
