/**
 * LightDom Landing Page
 * Exodus wallet-inspired design with modern dark theme and vibrant accents
 * Comprehensive feature showcase with interactive elements
 */

import React, { useState, useEffect } from 'react';
import { 
  Button, 
  Card, 
  Row, 
  Col, 
  Typography, 
  Space, 
  Avatar, 
  Badge, 
  Progress,
  Statistic,
  Tabs,
  List,
  Divider,
  Input,
  Form,
  message,
  FloatButton,
  Tour
} from 'antd';
import {
  ThunderboltOutlined,
  WalletOutlined,
  GlobalOutlined,
  TrophyOutlined,
  RocketOutlined,
  SearchOutlined,
  BarChartOutlined,
  ApiOutlined,
  DatabaseOutlined,
  ClusterOutlined,
  ExperimentOutlined,
  BugOutlined,
  SettingOutlined,
  StarOutlined,
  FireOutlined,
  GiftOutlined,
  CrownOutlined,
  ArrowRightOutlined,
  PlayCircleOutlined,
  GithubOutlined,
  TwitterOutlined,
  DiscordOutlined,
  TelegramOutlined,
  CheckCircleOutlined,
  RocketFilled,
  BulbOutlined,
  SecurityScanOutlined,
  CloudOutlined,
  NodeIndexOutlined,
  FundOutlined,
  PieChartOutlined,
  CodeOutlined,
  LinkOutlined,
  EyeOutlined,
  LockOutlined,
  ThunderboltFilled,
  WalletFilled,
  GlobalFilled,
  TrophyFilled,
  QuestionCircleOutlined,
  MessageOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import LightDomDesignSystem, { 
  MiningCard, 
  FeatureCard, 
  StatsCard,
  LightDomColors,
  LightDomAnimations
} from '../styles/LightDomDesignSystem';
import {
  LightDomLogo,
  MiningAnimation,
  DOMOptimizationGraphic,
  BlockchainNetworkGraphic,
  SEOAnalysisGraphic,
  MetaverseNFTGraphic,
  PerformanceMeterGraphic,
  FloatingParticlesGraphic
} from '../assets/graphics/LightDomGraphics';
import {
  useScrollEffect,
  useParallax,
  useScrollProgress,
  useStickyHeader,
  addScrollReveal
} from '../hooks/useScrollEffects';
import ScrollProgressIndicator from './ScrollProgressIndicator';
import '../styles/ExodusAnimations.css';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Search } = Input;

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
  status?: 'active' | 'inactive' | 'beta';
  route?: string;
  graphic?: React.ReactNode;
}

interface MiningFeature {
  title: string;
  description: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythical';
  progress?: number;
  stats?: { label: string; value: string }[];
}

const LandingPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [tourVisible, setTourVisible] = useState(false);
  const [email, setEmail] = useState('');
  const navigate = useNavigate();
  
  // Scroll effects
  const scrollProgress = useScrollProgress();
  const { isSticky, scrollDirection } = useStickyHeader(100);
  
  // Parallax effects for hero section
  const heroParallax = useParallax({ speed: 0.3, direction: 'up' });
  const particlesParallax = useParallax({ speed: 0.1, direction: 'up' });
  
  // Scroll reveal for sections
  const heroSection = useScrollEffect({ threshold: 0.1 });
  const featuresSection = useScrollEffect({ threshold: 0.1 });
  const miningSection = useScrollEffect({ threshold: 0.1 });
  const ctaSection = useScrollEffect({ threshold: 0.1 });

  // Initialize scroll reveal
  useEffect(() => {
    addScrollReveal();
  }, []);

  // Auto-start tour on first visit
  useEffect(() => {
    const hasVisited = localStorage.getItem('lightdom-visited');
    if (!hasVisited) {
      setTimeout(() => {
        setTourVisible(true);
        localStorage.setItem('lightdom-visited', 'true');
      }, 2000);
    }
  }, []);

  const features: Feature[] = [
    {
      icon: <ThunderboltFilled />,
      title: 'DOM Optimization',
      description: 'Advanced DOM analysis and optimization algorithms that reduce page size and improve performance.',
      status: 'active',
      route: '/dashboard/optimization',
      graphic: <DOMOptimizationGraphic size={60} className="feature-graphic" />
    },
    {
      icon: <WalletFilled />,
      title: 'Blockchain Mining',
      description: 'Mine DSH tokens by optimizing web structures. Proof of Optimization consensus mechanism.',
      status: 'active',
      route: '/dashboard/blockchain',
      graphic: <BlockchainNetworkGraphic size={60} className="feature-graphic" />
    },
    {
      icon: <GlobalFilled />,
      title: 'Space Mining',
      description: 'Harvest digital space from optimized DOMs and trade in the metaverse marketplace.',
      status: 'active',
      route: '/dashboard/space-mining',
      graphic: <MiningAnimation size={60} className="feature-graphic" />
    },
    {
      icon: <TrophyFilled />,
      title: 'Metaverse Integration',
      description: 'Create, trade, and showcase NFT items in our immersive metaverse environment.',
      status: 'beta',
      route: '/dashboard/metaverse-mining',
      graphic: <MetaverseNFTGraphic size={60} className="feature-graphic" />
    },
    {
      icon: <SearchOutlined />,
      title: 'SEO AI Analysis',
      description: '194-feature ML-powered SEO analysis with LambdaMART ranking models.',
      status: 'active',
      route: '/dashboard/seo-optimization',
      graphic: <SEOAnalysisGraphic size={60} className="feature-graphic" />
    },
    {
      icon: <BarChartOutlined />,
      title: 'Advanced Analytics',
      description: 'Real-time monitoring, performance metrics, and business intelligence dashboards.',
      status: 'active',
      route: '/dashboard/analytics',
      graphic: <PerformanceMeterGraphic size={60} value={92} className="feature-graphic" />
    },
    {
      icon: <ApiOutlined />,
      title: 'API Infrastructure',
      description: 'Comprehensive RESTful APIs with WebSocket support for real-time updates.',
      status: 'active',
      route: '/dashboard/testing',
      graphic: <ClusterOutlined style={{ fontSize: '60px', color: LightDomColors.primary[500] }} className="feature-graphic" />
    },
    {
      icon: <DatabaseOutlined />,
      title: 'Distributed Network',
      description: 'Advanced node management with automatic load balancing and failover.',
      status: 'beta',
      route: '/dashboard/advanced-nodes',
      graphic: <NodeIndexOutlined style={{ fontSize: '60px', color: LightDomColors.accent.purple }} className="feature-graphic" />
    },
    {
      icon: <ClusterOutlined />,
      title: 'Blockchain Storage',
      description: 'Decentralized storage with IPFS integration and smart contract management.',
      status: 'active',
      route: '/dashboard/blockchain-models',
      graphic: <DatabaseOutlined style={{ fontSize: '60px', color: LightDomColors.accent.green }} className="feature-graphic" />
    }
  ];

  const miningFeatures: MiningFeature[] = [
    {
      title: 'DOM Space Harvester',
      rarity: 'legendary',
      progress: 87,
      stats: [
        { label: 'Space Saved', value: '2.4GB' },
        { label: 'Tokens Earned', value: '1,250 DSH' }
      ]
    },
    {
      title: 'Performance Optimizer',
      description: 'AI-powered performance optimization with real-time monitoring',
      rarity: 'epic',
      progress: 92,
      stats: [
        { label: 'Speed Boost', value: '+47%' },
        { label: 'Score', value: '94/100' }
      ]
    },
    {
      title: 'SEO Enhancement',
      description: '194-feature SEO analysis with ML-powered recommendations',
      rarity: 'rare',
      progress: 78,
      stats: [
        { label: 'Features', value: '194' },
        { label: 'Accuracy', value: '89%' }
      ]
    },
    {
      title: 'Metaverse Portal',
      description: 'Gateway to the LightDom metaverse with NFT marketplace',
      rarity: 'mythical',
      progress: 65,
      stats: [
        { label: 'Items', value: '25+' },
        { label: 'Users', value: '1.2K' }
      ]
    }
  ];

  const handleGetStarted = () => {
    navigate('/register');
  };

  const handleFeatureClick = (route: string) => {
    navigate(route);
  };

  const handleEmailSubmit = (values: any) => {
    message.success('Welcome to LightDom! Check your email for next steps.');
    setEmail('');
  };

  const tourSteps = [
    {
      title: 'Welcome to LightDom',
      description: 'The revolutionary blockchain-based DOM optimization platform.',
      target: () => document.querySelector('.hero-section'),
    },
    {
      title: 'Powerful Features',
      description: 'Explore our comprehensive suite of optimization and mining tools.',
      target: () => document.querySelector('.features-grid'),
    },
    {
      title: 'Mining Rewards',
      description: 'Earn DSH tokens by optimizing web structures.',
      target: () => document.querySelector('.mining-section'),
    },
    {
      title: 'Get Started',
      description: 'Join thousands of users optimizing the web.',
      target: () => document.querySelector('.cta-section'),
    },
  ];

  return (
    <div className="landing-page" style={{
      background: LightDomColors.dark.background,
      color: LightDomColors.dark.text,
      minHeight: '100vh',
      overflowX: 'hidden',
    }}>
      {/* Scroll Progress Indicator */}
      <ScrollProgressIndicator />
      
      {/* Navigation Header */}
      <header 
        className={`navigation-header ${isSticky ? 'header-scrolled' : ''}`}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          background: isSticky ? 'rgba(10, 10, 10, 0.98)' : 'rgba(10, 10, 10, 0.95)',
          backdropFilter: 'blur(20px)',
          borderBottom: `1px solid ${LightDomColors.dark.border}`,
          padding: '16px 0',
          transition: 'all 0.3s ease',
          transform: scrollDirection === 'down' && isSticky ? 'translateY(-100%)' : 'translateY(0)',
        }}
      >
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="logo-container floating-element">
              <LightDomLogo size={40} />
            </div>
            <Title level={4} style={{ margin: 0, color: LightDomColors.dark.text }}>
              LightDom
            </Title>
          </div>

          <nav style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
            <Button type="link" className="nav-item" style={{ color: LightDomColors.dark.textSecondary }}>
              Features
            </Button>
            <Button type="link" className="nav-item" style={{ color: LightDomColors.dark.textSecondary }}>
              Mining
            </Button>
            <Button type="link" className="nav-item" style={{ color: LightDomColors.dark.textSecondary }}>
              Metaverse
            </Button>
            <Button type="link" className="nav-item" style={{ color: LightDomColors.dark.textSecondary }}>
              SEO
            </Button>
            <Button type="link" className="nav-item" style={{ color: LightDomColors.dark.textSecondary }}>
              Pricing
            </Button>
          </nav>

          <Space>
            <Button 
              type="text" 
              style={{ color: LightDomColors.dark.textSecondary }}
              onClick={() => navigate('/login')}
            >
              Sign In
            </Button>
            <Button 
              className="exodus-button-primary"
              onClick={handleGetStarted}
            >
              Get Started
            </Button>
          </Space>
        </div>
      </header>

      {/* Hero Section */}
      <section 
        ref={heroSection.elementRef}
        className="hero-section animated-background scroll-reveal fade-in-up"
        style={{
          paddingTop: '120px',
          paddingBottom: '80px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Floating Particles Background */}
        <div 
          ref={particlesParallax.elementRef}
          className="parallax-container"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            transform: `translateY(${particlesParallax.offset.y}px)`,
            opacity: 0.6,
          }}
        >
          <FloatingParticlesGraphic className="floating-particles" />
        </div>

        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 1 }}>
          <Row gutter={[48, 48]} align="middle">
            <Col xs={24} md={12}>
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <div className="hero-title">
                  <Badge 
                    count="BETA" 
                    style={{
                      background: LightDomColors.gradients.accent,
                      fontSize: '12px',
                      fontWeight: 600,
                      padding: '4px 12px',
                      borderRadius: '20px',
                    }}
                  >
                    <Title level={2} className="gradient-text" style={{ 
                      color: LightDomColors.primary[300],
                      margin: 0,
                      fontWeight: 400,
                    }}>
                      Revolutionary Platform
                    </Title>
                  </Badge>
                </div>

                <div className="hero-title">
                  <Title level={1} className="gradient-text" style={{
                    fontSize: '56px',
                    fontWeight: 800,
                    color: LightDomColors.dark.text,
                    lineHeight: 1.1,
                    margin: 0,
                    background: LightDomColors.gradients.primary,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}>
                    Optimize. Mine. Earn.
                  </Title>
                </div>

                <div className="hero-subtitle">
                  <Paragraph style={{
                    fontSize: '20px',
                    color: LightDomColors.dark.textSecondary,
                    lineHeight: 1.6,
                    margin: 0,
                  }}>
                    Transform web optimization into cryptocurrency rewards. 
                    LightDom combines advanced DOM analysis, blockchain mining, 
                    and metaverse integration in one powerful platform.
                  </Paragraph>
                </div>

                <div className="hero-buttons">
                  <Space size="large">
                    <Button 
                      size="large"
                      className="exodus-button-primary"
                      onClick={handleGetStarted}
                    >
                      Start Mining Now
                      <ArrowRightOutlined />
                    </Button>
                    
                    <Button 
                      size="large"
                      style={{
                        background: 'transparent',
                        border: `1px solid ${LightDomColors.dark.border}`,
                        color: LightDomColors.dark.text,
                        height: '56px',
                        padding: '0 32px',
                        borderRadius: '12px',
                        fontSize: '16px',
                      }}
                    >
                      <PlayCircleOutlined /> Watch Demo
                    </Button>
                  </Space>
                </div>

                <div className="hero-stats">
                  <div style={{ display: 'flex', gap: '48px', paddingTop: '24px' }}>
                    <div className="stat-number">
                      <Title level={2} style={{ 
                        margin: 0, 
                        color: LightDomColors.dark.text,
                        fontWeight: 700,
                      }}>
                        50K+
                      </Title>
                      <Text type="secondary" style={{ color: LightDomColors.dark.textSecondary }}>
                        Active Miners
                      </Text>
                    </div>
                    <div className="stat-number">
                      <Title level={2} style={{ 
                        margin: 0, 
                        color: LightDomColors.dark.text,
                        fontWeight: 700,
                      }}>
                        2.4M
                      </Title>
                      <Text type="secondary" style={{ color: LightDomColors.dark.textSecondary }}>
                        Optimizations
                      </Text>
                    </div>
                    <div className="stat-number">
                      <Title level={2} style={{ 
                        margin: 0, 
                        color: LightDomColors.dark.text,
                        fontWeight: 700,
                      }}>
                        $1.2M
                      </Title>
                      <Text type="secondary" style={{ color: LightDomColors.dark.textSecondary }}>
                        Rewards Paid
                      </Text>
                    </div>
                  </div>
                </div>
              </Space>
            </Col>

            <Col xs={24} md={12}>
              <div 
                ref={heroParallax.elementRef}
                className="exodus-card floating-element floating-element-delay-1"
                style={{
                  background: LightDomColors.dark.surface,
                  borderRadius: '24px',
                  border: `1px solid ${LightDomColors.dark.border}`,
                  padding: '32px',
                  boxShadow: LightDomShadows.xl,
                  position: 'relative',
                  overflow: 'hidden',
                  transform: `translateY(${heroParallax.offset.y}px)`,
                }}
              >
                <div className="card-glow" />
                <div style={{
                  position: 'absolute',
                  top: '-50%',
                  right: '-50%',
                  width: '200%',
                  height: '200%',
                  background: `conic-gradient(from 0deg, ${LightDomColors.primary[500]}, ${LightDomColors.accent.purple}, ${LightDomColors.accent.pink}, ${LightDomColors.primary[500]})`,
                  opacity: 0.1,
                  animation: 'spin 20s linear infinite',
                }} />
                
                <Space direction="vertical" size="large" style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ marginBottom: '24px' }}>
                      <MiningAnimation size={120} className="mining-animation" />
                    </div>
                    <Title level={4} style={{ color: LightDomColors.dark.text, margin: 0 }}>
                      Live Mining Stats
                    </Title>
                    <Text type="secondary" style={{ color: LightDomColors.dark.textSecondary }}>
                      Real-time network performance
                    </Text>
                  </div>

                  <Row gutter={[16, 16]}>
                    <Col span={12}>
                      <StatsCard
                        title="Hash Rate"
                        value="2.4 TH/s"
                        change={12.5}
                        icon={<ThunderboltOutlined />}
                      />
                    </Col>
                    <Col span={12}>
                      <StatsCard
                        title="Block Time"
                        value="14.2s"
                        change={-2.1}
                        icon={<ApiOutlined />}
                      />
                    </Col>
                    <Col span={12}>
                      <StatsCard
                        title="Difficulty"
                        value="1.24T"
                        change={5.3}
                        icon={<ClusterOutlined />}
                      />
                    </Col>
                    <Col span={12}>
                      <StatsCard
                        title="DSH Price"
                        value="$0.48"
                        change={8.7}
                        icon={<WalletOutlined />}
                      />
                    </Col>
                  </Row>

                  <div style={{
                    background: LightDomColors.dark.background,
                    borderRadius: '12px',
                    padding: '16px',
                    border: `1px solid ${LightDomColors.dark.border}`,
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={{ color: LightDomColors.dark.textSecondary }}>
                        Network Status
                      </Text>
                      <Badge 
                        status="processing" 
                        text="Operational"
                        style={{ color: LightDomColors.status.success }}
                      />
                    </div>
                    <Progress 
                      percent={87} 
                      strokeColor={LightDomColors.gradients.primary}
                      trailColor={LightDomColors.dark.border}
                      showInfo={false}
                      style={{ marginTop: '12px' }}
                      className="progress-circle"
                    />
                  </div>
                </Space>
              </div>
            </Col>
          </Row>
        </div>
      </section>

      {/* Features Section */}
      <section 
        ref={featuresSection.elementRef}
        className="features-grid scroll-reveal fade-in-up"
        style={{
          padding: '80px 0',
          background: LightDomColors.dark.background,
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
          <div className="scroll-reveal fade-in-up" style={{ textAlign: 'center', marginBottom: '64px' }}>
            <Title level={2} className="gradient-text" style={{
              color: LightDomColors.dark.text,
              fontSize: '48px',
              fontWeight: 700,
              margin: 0,
            }}>
              Powerful Features
            </Title>
            <Paragraph style={{
              fontSize: '20px',
              color: LightDomColors.dark.textSecondary,
              marginTop: '16px',
              maxWidth: '600px',
              margin: '16px auto 0',
            }}>
              Everything you need to optimize, mine, and monetize web structures
            </Paragraph>
          </div>

          <Tabs 
            activeKey={activeTab} 
            onChange={setActiveTab}
            centered
            size="large"
            style={{
              color: LightDomColors.dark.text,
            }}
          >
            <TabPane tab="Core Features" key="overview">
              <Row gutter={[24, 24]}>
                {features.map((feature, index) => (
                  <Col 
                    xs={24} 
                    sm={12} 
                    lg={8} 
                    key={index}
                    className={`scroll-reveal fade-in-up stagger-${(index % 5) + 1}`}
                  >
                    <div className="exodus-card feature-card">
                      <div className="card-glow" />
                      <div style={{
                        background: LightDomColors.dark.surface,
                        borderRadius: '16px',
                        border: `1px solid ${LightDomColors.dark.border}`,
                        padding: '24px',
                        height: '100%',
                        cursor: feature.route ? 'pointer' : 'default',
                        transition: 'all 0.3s ease',
                      }} onClick={() => feature.route && handleFeatureClick(feature.route)}>
                        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                          <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'space-between' 
                          }}>
                            <div className="feature-icon" style={{ 
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '24px',
                              color: LightDomColors.primary[500],
                              marginBottom: '16px',
                            }}>
                              {feature.graphic || feature.icon}
                            </div>
                            
                            {feature.status && (
                              <Badge 
                                status={feature.status === 'active' ? 'success' : feature.status === 'beta' ? 'processing' : 'default'}
                                text={feature.status}
                                style={{ 
                                  textTransform: 'uppercase',
                                  fontSize: '12px',
                                  fontWeight: 600,
                                }}
                              />
                            )}
                          </div>

                          <div>
                            <Title level={5} style={{ margin: 0, color: LightDomColors.dark.text }}>
                              {feature.title}
                            </Title>
                            <Text type="secondary" style={{ color: LightDomColors.dark.textSecondary }}>
                              {feature.description}
                            </Text>
                          </div>
                        </Space>
                      </div>
                    </div>
                  </Col>
                ))}
              </Row>
            </TabPane>

            <TabPane tab="Mining System" key="mining">
              <Row gutter={[24, 24]}>
                {miningFeatures.map((feature, index) => (
                  <Col xs={24} sm={12} lg={6} key={index}>
                    <MiningCard
                      title={feature.title}
                      description={feature.description}
                      rarity={feature.rarity}
                      progress={feature.progress}
                      stats={feature.stats}
                    />
                  </Col>
                ))}
              </Row>
            </TabPane>

            <TabPane tab="Technology Stack" key="tech">
              <Row gutter={[24, 24]}>
                <Col xs={24} md={12}>
                  <Card style={LightDomComponents.card.glass}>
                    <Space direction="vertical" size="large" style={{ width: '100%' }}>
                      <Title level={4} style={{ color: LightDomColors.dark.text }}>
                        <CodeOutlined /> Frontend Technologies
                      </Title>
                      <List
                        dataSource={[
                          'React 19 with TypeScript',
                          'Ant Design Component Library',
                          'Vite Build System',
                          'Tailwind CSS for Styling',
                          'Progressive Web App (PWA)',
                        ]}
                        renderItem={(item) => (
                          <List.Item style={{ color: LightDomColors.dark.textSecondary }}>
                            <CheckCircleOutlined style={{ color: LightDomColors.status.success, marginRight: '12px' }} />
                            {item}
                          </List.Item>
                        )}
                      />
                    </Space>
                  </Card>
                </Col>
                <Col xs={24} md={12}>
                  <Card style={LightDomComponents.card.glass}>
                    <Space direction="vertical" size="large" style={{ width: '100%' }}>
                      <Title level={4} style={{ color: LightDomColors.dark.text }}>
                        <DatabaseOutlined /> Backend Technologies
                      </Title>
                      <List
                        dataSource={[
                          'Node.js with Express.js',
                          'PostgreSQL Database',
                          'Redis for Caching',
                          'Socket.IO for Real-time',
                          'Docker & Kubernetes',
                        ]}
                        renderItem={(item) => (
                          <List.Item style={{ color: LightDomColors.dark.textSecondary }}>
                            <CheckCircleOutlined style={{ color: LightDomColors.status.success, marginRight: '12px' }} />
                            {item}
                          </List.Item>
                        )}
                      />
                    </Space>
                  </Card>
                </Col>
              </Row>
            </TabPane>
          </Tabs>
        </div>
      </section>

      {/* Mining Section */}
      <section className="mining-section" style={{
        padding: '80px 0',
        background: `linear-gradient(135deg, ${LightDomColors.primary[900]}20 0%, ${LightDomColors.accent.purple}20 100%)`,
        borderBottom: `1px solid ${LightDomColors.dark.border}`,
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
          <Row gutter={[48, 48]} align="middle">
            <Col xs={24} md={12}>
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <Title level={2} style={{
                  color: LightDomColors.dark.text,
                  fontSize: '40px',
                  fontWeight: 700,
                  margin: 0,
                }}>
                  Start Mining DSH Tokens
                </Title>
                <Paragraph style={{
                  fontSize: '18px',
                  color: LightDomColors.dark.textSecondary,
                  lineHeight: 1.6,
                }}>
                  Join our revolutionary Proof of Optimization consensus mechanism. 
                  Optimize web structures and earn cryptocurrency rewards in real-time.
                </Paragraph>
                
                <List
                  dataSource={[
                    'No specialized hardware required',
                    'Earn DSH tokens for every optimization',
                    'Stake tokens for enhanced rewards',
                    'Trade on decentralized exchanges',
                    'Participate in governance',
                  ]}
                  renderItem={(item) => (
                    <List.Item style={{ color: LightDomColors.dark.text, padding: '12px 0' }}>
                      <CheckCircleOutlined style={{ color: LightDomColors.status.success, marginRight: '12px' }} />
                      {item}
                    </List.Item>
                  )}
                />

                <Button 
                  size="large"
                  style={{
                    background: LightDomColors.gradients.secondary,
                    border: 'none',
                    color: 'white',
                    fontWeight: 600,
                    height: '56px',
                    padding: '0 32px',
                    borderRadius: '12px',
                    fontSize: '16px',
                    boxShadow: LightDomShadows.lg,
                  }}
                  onClick={() => navigate('/dashboard/space-mining')}
                >
                  Start Mining <RocketOutlined />
                </Button>
              </Space>
            </Col>

            <Col xs={24} md={12}>
              <div style={{
                background: LightDomColors.dark.surface,
                borderRadius: '24px',
                border: `1px solid ${LightDomColors.dark.border}`,
                padding: '32px',
                boxShadow: LightDomShadows.xl,
              }}>
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                  <Title level={4} style={{ color: LightDomColors.dark.text, margin: 0 }}>
                    Mining Calculator
                  </Title>
                  
                  <Form layout="vertical">
                    <Form.Item label="Website URL">
                      <Search
                        placeholder="https://example.com"
                        enterButton="Analyze"
                        style={{ width: '100%' }}
                      />
                    </Form.Item>
                    
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item label="Daily Optimizations">
                          <Input placeholder="100" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item label="Average Score">
                          <Input placeholder="85" />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Form>

                  <Divider style={{ borderColor: LightDomColors.dark.border }} />

                  <div style={{
                    background: LightDomColors.dark.background,
                    borderRadius: '12px',
                    padding: '20px',
                    border: `1px solid ${LightDomColors.dark.border}`,
                  }}>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Statistic
                          title="Estimated Daily Earnings"
                          value={125.50}
                          prefix="DSH"
                          valueStyle={{ color: LightDomColors.status.success }}
                        />
                      </Col>
                      <Col span={12}>
                        <Statistic
                          title="USD Value"
                          value={60.24}
                          prefix="$"
                          valueStyle={{ color: LightDomColors.dark.text }}
                        />
                      </Col>
                    </Row>
                  </div>
                </Space>
              </div>
            </Col>
          </Row>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section" style={{
        padding: '100px 0',
        background: LightDomColors.dark.background,
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 24px' }}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Title level={2} style={{
              fontSize: '48px',
              fontWeight: 700,
              color: LightDomColors.dark.text,
              margin: 0,
            }}>
              Ready to Optimize the Web?
            </Title>
            
            <Paragraph style={{
              fontSize: '20px',
              color: LightDomColors.dark.textSecondary,
              lineHeight: 1.6,
            }}>
              Join thousands of miners earning rewards while making the web faster and more efficient.
            </Paragraph>

            <Form onFinish={handleEmailSubmit} style={{ maxWidth: '500px', margin: '0 auto' }}>
              <Form.Item name="email" rules={[{ required: true, type: 'email' }]}>
                <Input
                  placeholder="Enter your email"
                  size="large"
                  style={{
                    background: LightDomColors.dark.surface,
                    border: `1px solid ${LightDomColors.dark.border}`,
                    color: LightDomColors.dark.text,
                    height: '56px',
                    borderRadius: '12px',
                  }}
                />
              </Form.Item>
              <Form.Item>
                <Button 
                  type="primary" 
                  htmlType="submit"
                  size="large"
                  style={{
                    background: LightDomColors.gradients.primary,
                    border: 'none',
                    color: 'white',
                    fontWeight: 600,
                    height: '56px',
                    borderRadius: '12px',
                    fontSize: '16px',
                    width: '100%',
                    boxShadow: LightDomShadows.lg,
                  }}
                >
                  Get Started Free
                </Button>
              </Form.Item>
            </Form>

            <Text type="secondary" style={{ color: LightDomColors.dark.textTertiary }}>
              No credit card required • Free forever for basic features
            </Text>
          </Space>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        background: LightDomColors.dark.surface,
        borderTop: `1px solid ${LightDomColors.dark.border}`,
        padding: '64px 0 32px',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
          <Row gutter={[48, 48]}>
            <Col xs={24} md={6}>
              <Space direction="vertical" size="middle">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    background: LightDomColors.gradients.primary,
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px',
                    color: 'white',
                    fontWeight: 'bold',
                  }}>
                    LD
                  </div>
                  <Title level={5} style={{ margin: 0, color: LightDomColors.dark.text }}>
                    LightDom
                  </Title>
                </div>
                <Text style={{ color: LightDomColors.dark.textSecondary }}>
                  The revolutionary blockchain-based DOM optimization platform.
                </Text>
                <Space size="middle">
                  <GithubOutlined style={{ fontSize: '20px', color: LightDomColors.dark.textSecondary }} />
                  <TwitterOutlined style={{ fontSize: '20px', color: LightDomColors.dark.textSecondary }} />
                  <DiscordOutlined style={{ fontSize: '20px', color: LightDomColors.dark.textSecondary }} />
                  <TelegramOutlined style={{ fontSize: '20px', color: LightDomColors.dark.textSecondary }} />
                </Space>
              </Space>
            </Col>

            <Col xs={24} md={6}>
              <Space direction="vertical" size="middle">
                <Title level={5} style={{ color: LightDomColors.dark.text }}>Product</Title>
                <Button type="link" style={{ color: LightDomColors.dark.textSecondary, padding: 0 }}>
                  Features
                </Button>
                <Button type="link" style={{ color: LightDomColors.dark.textSecondary, padding: 0 }}>
                  Mining
                </Button>
                <Button type="link" style={{ color: LightDomColors.dark.textSecondary, padding: 0 }}>
                  Metaverse
                </Button>
                <Button type="link" style={{ color: LightDomColors.dark.textSecondary, padding: 0 }}>
                  SEO Tools
                </Button>
              </Space>
            </Col>

            <Col xs={24} md={6}>
              <Space direction="vertical" size="middle">
                <Title level={5} style={{ color: LightDomColors.dark.text }}>Resources</Title>
                <Button type="link" style={{ color: LightDomColors.dark.textSecondary, padding: 0 }}>
                  Documentation
                </Button>
                <Button type="link" style={{ color: LightDomColors.dark.textSecondary, padding: 0 }}>
                  API Reference
                </Button>
                <Button type="link" style={{ color: LightDomColors.dark.textSecondary, padding: 0 }}>
                  Tutorials
                </Button>
                <Button type="link" style={{ color: LightDomColors.dark.textSecondary, padding: 0 }}>
                  Blog
                </Button>
              </Space>
            </Col>

            <Col xs={24} md={6}>
              <Space direction="vertical" size="middle">
                <Title level={5} style={{ color: LightDomColors.dark.text }}>Company</Title>
                <Button type="link" style={{ color: LightDomColors.dark.textSecondary, padding: 0 }}>
                  About
                </Button>
                <Button type="link" style={{ color: LightDomColors.dark.textSecondary, padding: 0 }}>
                  Careers
                </Button>
                <Button type="link" style={{ color: LightDomColors.dark.textSecondary, padding: 0 }}>
                  Privacy
                </Button>
                <Button type="link" style={{ color: LightDomColors.dark.textSecondary, padding: 0 }}>
                  Terms
                </Button>
              </Space>
            </Col>
          </Row>

          <Divider style={{ borderColor: LightDomColors.dark.border, margin: '48px 0 32px' }} />

          <div style={{ textAlign: 'center' }}>
            <Text style={{ color: LightDomColors.dark.textTertiary }}>
              © 2025 LightDom. All rights reserved.
            </Text>
          </div>
        </div>
      </footer>

      {/* Interactive Tour */}
      <Tour 
        steps={tourSteps}
        open={tourVisible}
        onClose={() => setTourVisible(false)}
      />

      {/* Floating Action Button */}
      <FloatButton.Group
        trigger="hover"
        type="primary"
        style={{ right: 24 }}
        icon={<QuestionCircleOutlined />}
      >
        <FloatButton 
          icon={<MessageOutlined />}
          tooltip="Live Chat"
        />
        <FloatButton 
          icon={<GithubOutlined />}
          tooltip="GitHub"
        />
        <FloatButton 
          icon={<BulbOutlined />}
          tooltip="Start Tour"
          onClick={() => setTourVisible(true)}
        />
      </FloatButton.Group>

      {/* Custom Styles */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .landing-page * {
          transition: ${LightDomAnimations.transitions.colors};
        }
        
        .feature-card:hover,
        .mining-card:hover {
          transform: translateY(-4px);
        }
        
        .ant-tabs-tab {
          color: ${LightDomColors.dark.textSecondary} !important;
        }
        
        .ant-tabs-tab-active {
          color: ${LightDomColors.primary[500]} !important;
        }
        
        .ant-tabs-ink-bar {
          background: ${LightDomColors.gradients.primary} !important;
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
