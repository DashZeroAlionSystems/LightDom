/**
 * Product Overview Page
 * 
 * Stunning product showcase page with anime.js animations
 * Features: Hero animation, feature cards, stats counter, interactive demos
 */

import React, { useEffect, useRef, useState } from 'react';
import { Card, Row, Col, Button, Space, Typography, Statistic } from 'antd';
import {
  RocketOutlined,
  ThunderboltOutlined,
  SafetyOutlined,
  DashboardOutlined,
  CheckCircleOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons';
import {
  productHeroEntrance,
  featureCardsStagger,
  animatedCounter,
  productFloating,
  createScrollAnimation,
  prefersReducedMotion,
  buttonMagnetic,
} from '../utils/animeControls';

const { Title, Paragraph, Text } = Typography;

interface ProductOverviewProps {
  productName?: string;
  tagline?: string;
  description?: string;
}

export const ProductOverview: React.FC<ProductOverviewProps> = ({
  productName = 'LightDom Space Bridge',
  tagline = 'Revolutionary DOM Optimization Platform',
  description = 'Transform your web applications with AI-powered DOM analysis, blockchain mining, and advanced space quantification technology.',
}) => {
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLButtonElement>(null);
  const [stats, setStats] = useState({
    users: 0,
    performance: 0,
    savings: 0,
  });

  useEffect(() => {
    const reducedMotion = prefersReducedMotion();
    
    if (reducedMotion) {
      // Instantly show content without animation
      if (heroRef.current) heroRef.current.style.opacity = '1';
      if (featuresRef.current) featuresRef.current.style.opacity = '1';
      setStats({ users: 12543, performance: 95, savings: 40 });
      return;
    }

    // Hero entrance animation
    if (heroRef.current) {
      const heroAnim = productHeroEntrance(heroRef.current);
      heroAnim.play();
    }

    // Feature cards stagger animation (scroll-triggered)
    if (featuresRef.current) {
      createScrollAnimation(
        featuresRef.current.querySelectorAll('.feature-card'),
        {
          opacity: [0, 1],
          translateY: [40, 0],
          scale: [0.9, 1],
          delay: (el: HTMLElement, i: number) => i * 100,
          duration: 800,
          easing: 'easeOutExpo',
        },
        0.6
      );
    }

    // Animated stats (scroll-triggered)
    if (statsRef.current) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              // Animate stats
              animateStats();
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.5 }
      );
      
      observer.observe(statsRef.current);
    }

    // Button magnetic effect
    if (ctaRef.current) {
      const cleanup = buttonMagnetic(ctaRef.current, 15);
      return cleanup;
    }
  }, []);

  const animateStats = () => {
    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      const easeOutExpo = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      
      setStats({
        users: Math.floor(12543 * easeOutExpo),
        performance: Math.floor(95 * easeOutExpo),
        savings: Math.floor(40 * easeOutExpo),
      });

      if (currentStep >= steps) {
        clearInterval(timer);
        setStats({ users: 12543, performance: 95, savings: 40 });
      }
    }, interval);
  };

  const features = [
    {
      icon: <ThunderboltOutlined style={{ fontSize: 48, color: '#667eea' }} />,
      title: 'Lightning Fast',
      description: 'Optimize your DOM in milliseconds with our advanced algorithms and AI-powered analysis.',
    },
    {
      icon: <SafetyOutlined style={{ fontSize: 48, color: '#667eea' }} />,
      title: 'Blockchain Secured',
      description: 'Your optimizations are secured on the blockchain with proof-of-optimization consensus.',
    },
    {
      icon: <DashboardOutlined style={{ fontSize: 48, color: '#667eea' }} />,
      title: 'Real-time Analytics',
      description: 'Monitor your DOM space metrics with live dashboards and comprehensive reporting.',
    },
    {
      icon: <RocketOutlined style={{ fontSize: 48, color: '#667eea' }} />,
      title: 'Space Quantification',
      description: 'Quantify and optimize every byte of your DOM with precision space analysis.',
    },
  ];

  return (
    <div style={{ background: 'linear-gradient(180deg, #f8f9fa 0%, #ffffff 100%)' }}>
      {/* Hero Section */}
      <div
        ref={heroRef}
        className="hero"
        style={{
          minHeight: '80vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 20px',
          position: 'relative',
          overflow: 'hidden',
          opacity: 0,
        }}
      >
        <div style={{ 
          position: 'absolute',
          top: '10%',
          right: '10%',
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(102, 126, 234, 0.1) 0%, transparent 70%)',
          borderRadius: '50%',
        }} />
        
        <div style={{ 
          position: 'absolute',
          bottom: '10%',
          left: '5%',
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(118, 75, 162, 0.1) 0%, transparent 70%)',
          borderRadius: '50%',
        }} />

        <Row gutter={[48, 48]} align="middle" style={{ maxWidth: 1200, width: '100%', zIndex: 1 }}>
          <Col xs={24} lg={12}>
            <div className="product-title">
              <Title 
                level={1} 
                style={{ 
                  fontSize: '3.5rem',
                  marginBottom: 24,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                {productName}
              </Title>
              
              <Title level={3} style={{ color: '#555', fontWeight: 400, marginBottom: 24 }}>
                {tagline}
              </Title>
              
              <Paragraph style={{ fontSize: '1.1rem', color: '#666', marginBottom: 32 }}>
                {description}
              </Paragraph>
              
              <Space size="large" wrap>
                <Button 
                  ref={ctaRef}
                  type="primary" 
                  size="large"
                  icon={<RocketOutlined />}
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none',
                    height: 56,
                    padding: '0 40px',
                    fontSize: '1.1rem',
                    borderRadius: 12,
                    boxShadow: '0 8px 16px rgba(102, 126, 234, 0.3)',
                  }}
                >
                  Get Started Free
                </Button>
                
                <Button 
                  size="large"
                  icon={<ArrowRightOutlined />}
                  style={{
                    height: 56,
                    padding: '0 40px',
                    fontSize: '1.1rem',
                    borderRadius: 12,
                  }}
                >
                  Watch Demo
                </Button>
              </Space>
            </div>
          </Col>
          
          <Col xs={24} lg={12}>
            <div className="product-features" style={{ textAlign: 'center' }}>
              <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: 24,
                padding: 60,
                boxShadow: '0 20px 60px rgba(102, 126, 234, 0.3)',
                position: 'relative',
              }}>
                <div style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: 16,
                  padding: 40,
                }}>
                  <Title level={2} style={{ color: 'white', marginBottom: 16 }}>
                    <ThunderboltOutlined /> Powered by AI
                  </Title>
                  <Text style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '1.1rem' }}>
                    Advanced machine learning algorithms analyze and optimize your DOM in real-time
                  </Text>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </div>

      {/* Stats Section */}
      <div 
        ref={statsRef}
        style={{ 
          padding: '80px 20px',
          background: 'white',
          borderTop: '1px solid #f0f0f0',
          borderBottom: '1px solid #f0f0f0',
        }}
      >
        <Row gutter={[48, 48]} justify="center" style={{ maxWidth: 1200, margin: '0 auto' }}>
          <Col xs={24} sm={8}>
            <div style={{ textAlign: 'center' }}>
              <Title level={1} style={{ 
                fontSize: '3.5rem',
                marginBottom: 8,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                {stats.users.toLocaleString()}+
              </Title>
              <Text style={{ fontSize: '1.1rem', color: '#666' }}>Active Users</Text>
            </div>
          </Col>
          <Col xs={24} sm={8}>
            <div style={{ textAlign: 'center' }}>
              <Title level={1} style={{ 
                fontSize: '3.5rem',
                marginBottom: 8,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                {stats.performance}%
              </Title>
              <Text style={{ fontSize: '1.1rem', color: '#666' }}>Performance Boost</Text>
            </div>
          </Col>
          <Col xs={24} sm={8}>
            <div style={{ textAlign: 'center' }}>
              <Title level={1} style={{ 
                fontSize: '3.5rem',
                marginBottom: 8,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                {stats.savings}%
              </Title>
              <Text style={{ fontSize: '1.1rem', color: '#666' }}>Cost Savings</Text>
            </div>
          </Col>
        </Row>
      </div>

      {/* Features Section */}
      <div 
        ref={featuresRef}
        style={{ 
          padding: '100px 20px',
          maxWidth: 1200,
          margin: '0 auto',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <Title level={2} style={{ fontSize: '2.5rem', marginBottom: 16 }}>
            Why Choose LightDom?
          </Title>
          <Paragraph style={{ fontSize: '1.2rem', color: '#666', maxWidth: 600, margin: '0 auto' }}>
            Powerful features designed to revolutionize your web development workflow
          </Paragraph>
        </div>

        <Row gutter={[32, 32]}>
          {features.map((feature, index) => (
            <Col key={index} xs={24} md={12}>
              <Card
                className="feature-card"
                hoverable
                style={{
                  height: '100%',
                  borderRadius: 16,
                  border: '1px solid #f0f0f0',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                  opacity: 0,
                  transition: 'all 0.3s ease',
                }}
                bodyStyle={{ padding: 32 }}
              >
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                  <div>{feature.icon}</div>
                  <Title level={4} style={{ marginBottom: 0 }}>
                    {feature.title}
                  </Title>
                  <Paragraph style={{ color: '#666', marginBottom: 0 }}>
                    {feature.description}
                  </Paragraph>
                </Space>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      {/* CTA Section */}
      <div style={{ 
        padding: '100px 20px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        textAlign: 'center',
      }}>
        <Title level={2} style={{ color: 'white', fontSize: '2.5rem', marginBottom: 24 }}>
          Ready to Transform Your DOM?
        </Title>
        <Paragraph style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '1.2rem', marginBottom: 40 }}>
          Join thousands of developers using LightDom Space Bridge
        </Paragraph>
        <Space size="large" wrap>
          <Button 
            size="large"
            style={{
              background: 'white',
              color: '#667eea',
              border: 'none',
              height: 56,
              padding: '0 40px',
              fontSize: '1.1rem',
              borderRadius: 12,
              fontWeight: 600,
            }}
          >
            Start Free Trial
          </Button>
          <Button 
            size="large"
            style={{
              background: 'transparent',
              color: 'white',
              border: '2px solid white',
              height: 56,
              padding: '0 40px',
              fontSize: '1.1rem',
              borderRadius: 12,
            }}
          >
            Contact Sales
          </Button>
        </Space>
      </div>
    </div>
  );
};

export default ProductOverview;
