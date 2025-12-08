/**
 * Welcome Step - Introduction to LightDom SEO
 */

import React from 'react';
import { Typography, Button, Space, Row, Col } from 'antd';
import {
  RocketOutlined,
  TrophyOutlined,
  ThunderboltOutlined,
  GlobalOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';

const { Title, Paragraph } = Typography;

interface WelcomeStepProps {
  onNext: () => void;
}

const WelcomeStep: React.FC<WelcomeStepProps> = ({ onNext }) => {
  const features = [
    {
      icon: <GlobalOutlined style={{ fontSize: 32, color: '#1890ff' }} />,
      title: 'Comprehensive SEO Analysis',
      description: '192+ attributes analyzed in real-time for complete website optimization'
    },
    {
      icon: <ThunderboltOutlined style={{ fontSize: 32, color: '#52c41a' }} />,
      title: 'Instant Results',
      description: 'Get your first SEO report in minutes with actionable insights'
    },
    {
      icon: <TrophyOutlined style={{ fontSize: 32, color: '#faad14' }} />,
      title: 'Proven Results',
      description: 'Join thousands of websites improving their search rankings'
    }
  ];

  return (
    <div style={{ textAlign: 'center', padding: '40px 20px' }}>
      <RocketOutlined style={{ fontSize: 80, color: '#667eea', marginBottom: 24 }} />
      
      <Title level={1}>Welcome to LightDom SEO</Title>
      <Paragraph style={{ fontSize: 18, color: '#666', maxWidth: 600, margin: '0 auto 40px' }}>
        The most comprehensive SEO platform for businesses that want to dominate search rankings.
        Get started in minutes with our AI-powered analysis.
      </Paragraph>

      <Row gutter={[24, 24]} style={{ marginBottom: 40 }}>
        {features.map((feature, index) => (
          <Col key={index} xs={24} md={8}>
            <div style={{ 
              background: '#f5f5f5', 
              padding: 30, 
              borderRadius: 12,
              height: '100%'
            }}>
              <div style={{ marginBottom: 16 }}>{feature.icon}</div>
              <Title level={4}>{feature.title}</Title>
              <Paragraph style={{ color: '#666' }}>
                {feature.description}
              </Paragraph>
            </div>
          </Col>
        ))}
      </Row>

      <Space direction="vertical" size="large">
        <div>
          <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
          <span>Free initial SEO report - no credit card required</span>
        </div>
        
        <Button 
          type="primary" 
          size="large" 
          onClick={onNext}
          style={{ 
            height: 50, 
            fontSize: 18, 
            paddingLeft: 40, 
            paddingRight: 40 
          }}
        >
          Get Started
        </Button>
      </Space>
    </div>
  );
};

export default WelcomeStep;
