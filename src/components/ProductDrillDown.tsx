/**
 * Product Drill-Down Page
 * 
 * Detailed product feature exploration with advanced anime.js animations
 * Features: Interactive 3D rotations, morphing SVGs, data visualizations
 */

import React, { useEffect, useRef, useState } from 'react';
import { Card, Tabs, Row, Col, Button, Space, Typography, Tag, Progress, Timeline } from 'antd';
import {
  ApiOutlined,
  CodeOutlined,
  DashboardOutlined,
  LineChartOutlined,
  SafetyOutlined,
  ThunderboltOutlined,
  CheckCircleOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons';
import anime from 'animejs/lib/anime.es.js';
import {
  product3DRotation,
  progressBarAnimation,
  svgDrawAnimation,
  textRevealAnimation,
  createTimeline,
  chartBarsAnimation,
  createScrollAnimation,
  prefersReducedMotion,
} from '../utils/animeControls';

const { Title, Paragraph, Text } = Typography;
const { TabPane } = Tabs;

interface FeatureDetail {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  benefits: string[];
  metrics: {
    label: string;
    value: number;
    unit: string;
  }[];
  technicalDetails: string[];
}

export const ProductDrillDown: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dom-analysis');
  const tabContentRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const [animations, setAnimations] = useState<any[]>([]);

  const features: FeatureDetail[] = [
    {
      id: 'dom-analysis',
      title: 'DOM Space Analysis',
      description: 'Advanced algorithms that analyze your DOM structure and quantify space usage with precision.',
      icon: <DashboardOutlined style={{ fontSize: 64, color: '#667eea' }} />,
      benefits: [
        'Real-time DOM tree visualization',
        'Memory footprint analysis',
        'Performance bottleneck detection',
        'Automated optimization suggestions',
      ],
      metrics: [
        { label: 'Analysis Speed', value: 95, unit: '%' },
        { label: 'Accuracy', value: 99, unit: '%' },
        { label: 'Memory Reduction', value: 40, unit: '%' },
      ],
      technicalDetails: [
        'Uses advanced tree traversal algorithms',
        'Machine learning-powered anomaly detection',
        'Integration with Chrome DevTools Protocol',
        'Real-time WebSocket data streaming',
      ],
    },
    {
      id: 'blockchain-mining',
      title: 'Blockchain Mining',
      description: 'Earn tokens by optimizing DOM structures with our proof-of-optimization consensus mechanism.',
      icon: <SafetyOutlined style={{ fontSize: 64, color: '#667eea' }} />,
      benefits: [
        'Earn DOMSpace tokens for optimizations',
        'Distributed consensus validation',
        'Transparent blockchain ledger',
        'Smart contract integration',
      ],
      metrics: [
        { label: 'Mining Speed', value: 88, unit: '%' },
        { label: 'Network Uptime', value: 99.9, unit: '%' },
        { label: 'Token Rewards', value: 150, unit: 'DST/day' },
      ],
      technicalDetails: [
        'Ethereum-compatible smart contracts',
        'Custom proof-of-optimization algorithm',
        'Gas-optimized transactions',
        'Layer 2 scaling solutions',
      ],
    },
    {
      id: 'ai-optimization',
      title: 'AI-Powered Optimization',
      description: 'Machine learning models that continuously learn and improve DOM optimization strategies.',
      icon: <ThunderboltOutlined style={{ fontSize: 64, color: '#667eea' }} />,
      benefits: [
        'Adaptive learning from usage patterns',
        'Predictive performance optimization',
        'Automated A/B testing',
        'Custom model training',
      ],
      metrics: [
        { label: 'Model Accuracy', value: 94, unit: '%' },
        { label: 'Optimization Rate', value: 85, unit: '%' },
        { label: 'Training Speed', value: 92, unit: '%' },
      ],
      technicalDetails: [
        'TensorFlow.js integration',
        'Neural network architecture',
        'Transfer learning capabilities',
        'Real-time model updates',
      ],
    },
    {
      id: 'api-integration',
      title: 'API Integration',
      description: 'Comprehensive REST and GraphQL APIs for seamless integration into your workflow.',
      icon: <ApiOutlined style={{ fontSize: 64, color: '#667eea' }} />,
      benefits: [
        'RESTful and GraphQL endpoints',
        'WebSocket real-time updates',
        'Comprehensive documentation',
        'SDK libraries for all platforms',
      ],
      metrics: [
        { label: 'API Uptime', value: 99.99, unit: '%' },
        { label: 'Response Time', value: 45, unit: 'ms' },
        { label: 'Rate Limit', value: 10000, unit: 'req/min' },
      ],
      technicalDetails: [
        'OpenAPI 3.0 specification',
        'OAuth 2.0 authentication',
        'Rate limiting and throttling',
        'Webhook event notifications',
      ],
    },
  ];

  const currentFeature = features.find(f => f.id === activeTab) || features[0];

  useEffect(() => {
    const reducedMotion = prefersReducedMotion();
    if (reducedMotion) return;

    // Clean up previous animations
    animations.forEach(anim => {
      if (anim && typeof anim.pause === 'function') {
        anim.pause();
      }
    });

    // Animate tab content entrance
    if (tabContentRef.current) {
      const tl = createTimeline();
      
      tl.add({
        targets: tabContentRef.current.querySelector('.feature-icon'),
        scale: [0, 1],
        rotate: [180, 0],
        duration: 800,
        easing: 'easeOutElastic(1, .6)',
      })
      .add({
        targets: tabContentRef.current.querySelector('.feature-title'),
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 600,
        easing: 'easeOutExpo',
      }, '-=400')
      .add({
        targets: tabContentRef.current.querySelectorAll('.benefit-item'),
        opacity: [0, 1],
        translateX: [-20, 0],
        delay: anime.stagger(100),
        duration: 500,
        easing: 'easeOutExpo',
      }, '-=300');

      setAnimations(prev => [...prev, tl]);
    }

    // Animate metrics
    if (chartRef.current) {
      const bars = chartRef.current.querySelectorAll('.metric-bar');
      bars.forEach((bar, index) => {
        const metric = currentFeature.metrics[index];
        anime({
          targets: bar,
          width: `${metric.value}%`,
          duration: 1200,
          delay: index * 150,
          easing: 'easeOutElastic(1, .6)',
        });
      });
    }

    // Animate timeline
    if (timelineRef.current) {
      createScrollAnimation(
        timelineRef.current.querySelectorAll('.timeline-item'),
        {
          opacity: [0, 1],
          translateX: [-30, 0],
          delay: anime.stagger(100),
          duration: 600,
          easing: 'easeOutExpo',
        },
        0.3
      );
    }
  }, [activeTab]);

  return (
    <div style={{ background: '#f8f9fa', minHeight: '100vh', padding: '40px 20px' }}>
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <Title level={1} style={{ 
            fontSize: '3rem',
            marginBottom: 16,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            Feature Deep Dive
          </Title>
          <Paragraph style={{ fontSize: '1.2rem', color: '#666', maxWidth: 700, margin: '0 auto' }}>
            Explore the powerful features that make LightDom Space Bridge the most advanced DOM optimization platform
          </Paragraph>
        </div>

        {/* Feature Tabs */}
        <Card style={{ borderRadius: 16, boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06)' }}>
          <Tabs 
            activeKey={activeTab} 
            onChange={setActiveTab}
            size="large"
            centered
          >
            {features.map(feature => (
              <TabPane
                tab={
                  <span>
                    {feature.icon}
                    <span style={{ marginLeft: 8 }}>{feature.title}</span>
                  </span>
                }
                key={feature.id}
              />
            ))}
          </Tabs>

          <div ref={tabContentRef} style={{ marginTop: 40 }}>
            <Row gutter={[48, 48]}>
              {/* Feature Overview */}
              <Col xs={24} lg={12}>
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                  <div className="feature-icon" style={{ opacity: 0 }}>
                    {currentFeature.icon}
                  </div>
                  
                  <div className="feature-title" style={{ opacity: 0 }}>
                    <Title level={2}>{currentFeature.title}</Title>
                    <Paragraph style={{ fontSize: '1.1rem', color: '#666' }}>
                      {currentFeature.description}
                    </Paragraph>
                  </div>

                  <div>
                    <Title level={4}>Key Benefits</Title>
                    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                      {currentFeature.benefits.map((benefit, index) => (
                        <div 
                          key={index} 
                          className="benefit-item"
                          style={{ 
                            display: 'flex', 
                            alignItems: 'center',
                            opacity: 0,
                          }}
                        >
                          <CheckCircleOutlined 
                            style={{ 
                              color: '#52c41a', 
                              fontSize: 20,
                              marginRight: 12,
                            }} 
                          />
                          <Text style={{ fontSize: '1rem' }}>{benefit}</Text>
                        </div>
                      ))}
                    </Space>
                  </div>

                  <Button 
                    type="primary" 
                    size="large"
                    icon={<ArrowRightOutlined />}
                    style={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      border: 'none',
                      borderRadius: 8,
                      height: 48,
                    }}
                  >
                    Learn More
                  </Button>
                </Space>
              </Col>

              {/* Metrics & Visualization */}
              <Col xs={24} lg={12}>
                <Card 
                  title="Performance Metrics"
                  style={{ 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: 12,
                  }}
                  headStyle={{ color: 'white', borderBottom: 'none' }}
                  bodyStyle={{ background: 'rgba(255, 255, 255, 0.95)', borderRadius: '0 0 12px 12px' }}
                >
                  <div ref={chartRef}>
                    <Space direction="vertical" size="large" style={{ width: '100%' }}>
                      {currentFeature.metrics.map((metric, index) => (
                        <div key={index}>
                          <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between',
                            marginBottom: 8,
                          }}>
                            <Text strong>{metric.label}</Text>
                            <Text strong style={{ color: '#667eea' }}>
                              {metric.value}{metric.unit}
                            </Text>
                          </div>
                          <div style={{ 
                            background: '#f0f0f0',
                            height: 24,
                            borderRadius: 12,
                            overflow: 'hidden',
                          }}>
                            <div 
                              className="metric-bar"
                              style={{
                                background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                                height: '100%',
                                width: '0%',
                                borderRadius: 12,
                                transition: 'width 0.3s ease',
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </Space>
                  </div>
                </Card>

                <Card 
                  title="Technical Details"
                  style={{ marginTop: 24, borderRadius: 12 }}
                >
                  <div ref={timelineRef}>
                    <Timeline>
                      {currentFeature.technicalDetails.map((detail, index) => (
                        <Timeline.Item 
                          key={index}
                          className="timeline-item"
                          color="blue"
                          style={{ opacity: 0 }}
                        >
                          <Text>{detail}</Text>
                        </Timeline.Item>
                      ))}
                    </Timeline>
                  </div>
                </Card>
              </Col>
            </Row>
          </div>
        </Card>

        {/* Visual Demo Section */}
        <Card 
          style={{ 
            marginTop: 40,
            borderRadius: 16,
            boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06)',
          }}
        >
          <Title level={3} style={{ textAlign: 'center', marginBottom: 40 }}>
            See It In Action
          </Title>
          
          <div style={{ 
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            borderRadius: 12,
            padding: 60,
            textAlign: 'center',
            minHeight: 300,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Space direction="vertical" size="large">
              <div>
                <svg width="200" height="200" viewBox="0 0 200 200">
                  <circle
                    cx="100"
                    cy="100"
                    r="80"
                    fill="none"
                    stroke="#667eea"
                    strokeWidth="4"
                    strokeDasharray="502"
                    strokeDashoffset="502"
                    className="demo-circle"
                  />
                  <path
                    d="M100,40 L140,100 L100,160 L60,100 Z"
                    fill="rgba(102, 126, 234, 0.2)"
                    stroke="#764ba2"
                    strokeWidth="3"
                    className="demo-path"
                  />
                </svg>
              </div>
              <Title level={4}>Interactive Demo</Title>
              <Button 
                type="primary"
                size="large"
                onClick={() => {
                  anime({
                    targets: '.demo-circle',
                    strokeDashoffset: [502, 0],
                    duration: 2000,
                    easing: 'easeInOutQuad',
                  });
                  anime({
                    targets: '.demo-path',
                    rotate: [0, 360],
                    scale: [1, 1.2, 1],
                    duration: 2000,
                    easing: 'easeInOutQuad',
                  });
                }}
              >
                Animate Demo
              </Button>
            </Space>
          </div>
        </Card>

        {/* CTA */}
        <div style={{ 
          textAlign: 'center',
          marginTop: 60,
          padding: '60px 20px',
          background: 'white',
          borderRadius: 16,
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06)',
        }}>
          <Title level={2}>Ready to Experience These Features?</Title>
          <Paragraph style={{ fontSize: '1.1rem', color: '#666', marginBottom: 32 }}>
            Start your free trial today and see the difference
          </Paragraph>
          <Space size="large">
            <Button 
              type="primary" 
              size="large"
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                height: 56,
                padding: '0 40px',
                fontSize: '1.1rem',
                borderRadius: 12,
              }}
            >
              Start Free Trial
            </Button>
            <Button 
              size="large"
              style={{
                height: 56,
                padding: '0 40px',
                fontSize: '1.1rem',
                borderRadius: 12,
              }}
            >
              Schedule Demo
            </Button>
          </Space>
        </div>
      </div>
    </div>
  );
};

export default ProductDrillDown;
