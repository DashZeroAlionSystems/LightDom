import React, { useEffect, useRef } from 'react';
import anime from 'animejs';
import { 
  RocketOutlined, 
  ThunderboltOutlined, 
  SafetyOutlined,
  RiseOutlined,
  CheckCircleOutlined,
  StarOutlined,
  TrophyOutlined,
  LinkOutlined,
  BulbOutlined,
  LineChartOutlined
} from '@ant-design/icons';
import { Button, Card, Row, Col, Statistic, Badge } from 'antd';

/**
 * SEO Product Showcase Page
 * 
 * Features:
 * - Animated hero section with anime.js
 * - Feature comparison matrix
 * - Pricing plans with hover effects
 * - Live demo animations
 * - Interactive infographics
 * - Social proof and testimonials
 */
export const SEOProductShowcase: React.FC = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Hero animation on mount
    if (heroRef.current) {
      const timeline = anime.timeline({
        easing: 'easeOutExpo'
      });

      timeline.add({
        targets: '.hero-badge',
        opacity: [0, 1],
        translateY: [-20, 0],
        duration: 600
      });

      timeline.add({
        targets: '.hero-title',
        opacity: [0, 1],
        translateY: [50, 0],
        duration: 800
      }, '-=400');

      timeline.add({
        targets: '.hero-subtitle',
        opacity: [0, 1],
        translateY: [30, 0],
        duration: 600
      }, '-=400');

      timeline.add({
        targets: '.hero-cta',
        opacity: [0, 1],
        scale: [0.8, 1],
        duration: 600
      }, '-=200');

      // Floating elements animation
      anime({
        targets: '.floating-icon',
        translateY: [-10, 10],
        duration: 3000,
        direction: 'alternate',
        loop: true,
        easing: 'easeInOutSine',
        delay: anime.stagger(300)
      });
    }

    // Scroll-triggered animations
    const observerOptions = {
      threshold: 0.2,
      rootMargin: '0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateSection(entry.target as HTMLElement);
        }
      });
    }, observerOptions);

    document.querySelectorAll('.animate-on-scroll').forEach(el => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const animateSection = (element: HTMLElement) => {
    const timeline = anime.timeline({
      easing: 'easeOutExpo'
    });

    timeline.add({
      targets: element.querySelectorAll('.animate-item'),
      opacity: [0, 1],
      translateY: [30, 0],
      delay: anime.stagger(100),
      duration: 600
    });
  };

  const handleCTAClick = () => {
    // Pulse animation on button click
    anime({
      targets: '.hero-cta',
      scale: [1, 0.95, 1.05, 1],
      duration: 400,
      easing: 'easeInOutQuad'
    });
  };

  const features = [
    {
      icon: <RocketOutlined />,
      title: 'One-Line Setup',
      description: 'Add a single script tag and you\'re done. No complex configuration, no technical skills required.',
      benefit: '< 5 minutes to deploy'
    },
    {
      icon: <BulbOutlined />,
      title: 'AI-Powered Optimization',
      description: 'Neural networks analyze your content and automatically apply best SEO practices.',
      benefit: '+15-30 point SEO score boost'
    },
    {
      icon: <StarOutlined />,
      title: 'Rich Snippets',
      description: 'Auto-generated Schema.org markup for better search appearance and 30-50% higher CTR.',
      benefit: 'Appear in featured snippets'
    },
    {
      icon: <LinkOutlined />,
      title: 'Backlink Network',
      description: 'Ethical, high-quality backlinks from real authority sites that provide genuine value.',
      benefit: 'Domain Authority growth'
    },
    {
      icon: <LineChartOutlined />,
      title: 'Real-Time Monitoring',
      description: 'Live dashboard tracking SEO metrics, Core Web Vitals, and ranking improvements.',
      benefit: 'Know your ROI instantly'
    },
    {
      icon: <SafetyOutlined />,
      title: 'Enterprise Security',
      description: 'OAuth authentication, zero-trust architecture, and full PCI DSS compliance.',
      benefit: 'Bank-level security'
    }
  ];

  const pricingPlans = [
    {
      name: 'Starter',
      price: 79,
      period: 'month',
      popular: false,
      features: [
        '10,000 page views/month',
        'Basic rich snippets (5 types)',
        'Core Web Vitals monitoring',
        'Monthly SEO reports',
        '1 domain',
        'Email support'
      ],
      cta: 'Start Free Trial'
    },
    {
      name: 'Professional',
      price: 249,
      period: 'month',
      popular: true,
      features: [
        '100,000 page views/month',
        'Advanced rich snippets (15+ types)',
        'A/B testing',
        '100 keyword tracking',
        'API access',
        '5 domains',
        'Priority support (4h response)'
      ],
      cta: 'Get Started'
    },
    {
      name: 'Business',
      price: 599,
      period: 'month',
      popular: false,
      features: [
        '500,000 page views/month',
        'All rich snippet types',
        'ML optimization',
        '500 keyword tracking',
        'Backlink network',
        '20 domains',
        'Dedicated support (1h response)',
        'White-label reports'
      ],
      cta: 'Scale Your SEO'
    },
    {
      name: 'Enterprise',
      price: 1499,
      period: 'month',
      popular: false,
      features: [
        'Unlimited page views',
        'Custom schema development',
        'Dedicated ML model',
        'Unlimited keyword tracking',
        'Premium backlink network',
        'Unlimited domains',
        '24/7 support',
        'On-premise option',
        'SLA guarantee'
      ],
      cta: 'Contact Sales'
    }
  ];

  const stats = [
    { title: 'Average SEO Score Increase', value: '+23', suffix: ' points', icon: <RiseOutlined /> },
    { title: 'Average CTR Improvement', value: '+42', suffix: '%', icon: <TrophyOutlined /> },
    { title: 'Setup Time', value: '< 5', suffix: ' min', icon: <ThunderboltOutlined /> },
    { title: 'Client Satisfaction', value: '98', suffix: '%', icon: <CheckCircleOutlined /> }
  ];

  return (
    <div className="seo-product-showcase">
      {/* Hero Section */}
      <section className="hero-section" ref={heroRef} style={{
        background: 'linear-gradient(135deg, #0A0E27 0%, #1a1f2e 50%, #2a2f3e 100%)',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        padding: '4rem 2rem'
      }}>
        {/* Floating Background Icons */}
        <div className="floating-icon" style={{
          position: 'absolute',
          top: '10%',
          left: '10%',
          fontSize: '3rem',
          color: 'rgba(88, 101, 242, 0.2)'
        }}>
          <RocketOutlined />
        </div>
        <div className="floating-icon" style={{
          position: 'absolute',
          top: '20%',
          right: '15%',
          fontSize: '2.5rem',
          color: 'rgba(124, 92, 255, 0.2)'
        }}>
          <StarOutlined />
        </div>
        <div className="floating-icon" style={{
          position: 'absolute',
          bottom: '15%',
          left: '20%',
          fontSize: '2rem',
          color: 'rgba(0, 200, 81, 0.2)'
        }}>
          <LinkOutlined />
        </div>

        <div style={{ maxWidth: '1200px', width: '100%', textAlign: 'center', zIndex: 1 }}>
          <Badge.Ribbon text="40-60% Cheaper than Competitors" color="#5865F2" className="hero-badge">
            <div style={{ padding: '2rem 0' }} />
          </Badge.Ribbon>

          <h1 className="hero-title" style={{
            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
            fontWeight: 800,
            color: '#ffffff',
            marginBottom: '1.5rem',
            lineHeight: 1.2,
            opacity: 0
          }}>
            Automated SEO That Actually <span style={{ 
              background: 'linear-gradient(135deg, #5865F2, #7C5CFF)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>Works</span>
          </h1>

          <p className="hero-subtitle" style={{
            fontSize: 'clamp(1.1rem, 2vw, 1.5rem)',
            color: '#B9BBBE',
            marginBottom: '3rem',
            maxWidth: '800px',
            margin: '0 auto 3rem',
            opacity: 0
          }}>
            One-line script injection. Zero configuration. AI-powered optimization.
            <br />
            Watch your search rankings soar while you focus on your business.
          </p>

          <div className="hero-cta" style={{ opacity: 0 }}>
            <Button 
              type="primary" 
              size="large"
              onClick={handleCTAClick}
              icon={<RocketOutlined />}
              style={{
                height: '60px',
                fontSize: '1.2rem',
                padding: '0 3rem',
                background: 'linear-gradient(135deg, #5865F2, #7C5CFF)',
                border: 'none',
                borderRadius: '12px',
                marginRight: '1rem',
                boxShadow: '0 10px 30px rgba(88, 101, 242, 0.4)'
              }}
            >
              Start Free 14-Day Trial
            </Button>
            <Button 
              size="large"
              style={{
                height: '60px',
                fontSize: '1.2rem',
                padding: '0 3rem',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '2px solid rgba(255, 255, 255, 0.2)',
                color: '#ffffff',
                borderRadius: '12px',
                backdropFilter: 'blur(10px)'
              }}
            >
              Watch 2-Min Demo
            </Button>
          </div>

          {/* Quick Stats */}
          <Row gutter={[24, 24]} style={{ marginTop: '4rem' }}>
            {stats.map((stat, idx) => (
              <Col xs={12} sm={6} key={idx}>
                <div className="animate-item" style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  padding: '1.5rem',
                  borderRadius: '12px',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                    {stat.icon}
                  </div>
                  <Statistic 
                    value={stat.value} 
                    suffix={stat.suffix}
                    valueStyle={{ color: '#5865F2', fontSize: '2rem', fontWeight: 700 }}
                  />
                  <div style={{ color: '#B9BBBE', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                    {stat.title}
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section animate-on-scroll" ref={featuresRef} style={{
        padding: '6rem 2rem',
        background: '#0A0E27'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 className="animate-item" style={{
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontWeight: 700,
            color: '#ffffff',
            textAlign: 'center',
            marginBottom: '1rem'
          }}>
            Everything You Need to Dominate Search
          </h2>
          <p className="animate-item" style={{
            fontSize: '1.2rem',
            color: '#B9BBBE',
            textAlign: 'center',
            marginBottom: '4rem',
            maxWidth: '700px',
            margin: '0 auto 4rem'
          }}>
            Powerful features that work together to boost your SEO performance
          </p>

          <Row gutter={[32, 32]}>
            {features.map((feature, idx) => (
              <Col xs={24} md={12} lg={8} key={idx}>
                <Card
                  className="animate-item feature-card"
                  hoverable
                  style={{
                    background: 'linear-gradient(135deg, rgba(88, 101, 242, 0.1) 0%, rgba(124, 92, 255, 0.1) 100%)',
                    border: '1px solid rgba(88, 101, 242, 0.2)',
                    borderRadius: '16px',
                    height: '100%',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    anime({
                      targets: e.currentTarget,
                      scale: 1.05,
                      translateY: -10,
                      boxShadow: '0 20px 40px rgba(88, 101, 242, 0.3)',
                      duration: 300,
                      easing: 'easeOutQuad'
                    });
                  }}
                  onMouseLeave={(e) => {
                    anime({
                      targets: e.currentTarget,
                      scale: 1,
                      translateY: 0,
                      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
                      duration: 300,
                      easing: 'easeOutQuad'
                    });
                  }}
                >
                  <div style={{ fontSize: '3rem', color: '#5865F2', marginBottom: '1rem' }}>
                    {feature.icon}
                  </div>
                  <h3 style={{ 
                    fontSize: '1.5rem', 
                    fontWeight: 600, 
                    color: '#ffffff',
                    marginBottom: '1rem'
                  }}>
                    {feature.title}
                  </h3>
                  <p style={{ color: '#B9BBBE', fontSize: '1rem', marginBottom: '1rem' }}>
                    {feature.description}
                  </p>
                  <Badge 
                    count={feature.benefit} 
                    style={{ 
                      background: 'linear-gradient(135deg, #00C851, #00E676)',
                      fontSize: '0.85rem',
                      padding: '0.5rem 1rem',
                      height: 'auto'
                    }} 
                  />
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="pricing-section animate-on-scroll" style={{
        padding: '6rem 2rem',
        background: 'linear-gradient(135deg, #1a1f2e 0%, #0A0E27 100%)'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <h2 className="animate-item" style={{
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontWeight: 700,
            color: '#ffffff',
            textAlign: 'center',
            marginBottom: '1rem'
          }}>
            Simple, Transparent Pricing
          </h2>
          <p className="animate-item" style={{
            fontSize: '1.2rem',
            color: '#B9BBBE',
            textAlign: 'center',
            marginBottom: '4rem'
          }}>
            Start free, scale as you grow. Cancel anytime.
          </p>

          <Row gutter={[24, 24]} justify="center">
            {pricingPlans.map((plan, idx) => (
              <Col xs={24} sm={12} lg={6} key={idx}>
                <Card
                  className="animate-item pricing-card"
                  style={{
                    background: plan.popular 
                      ? 'linear-gradient(135deg, rgba(88, 101, 242, 0.2) 0%, rgba(124, 92, 255, 0.2) 100%)'
                      : 'rgba(255, 255, 255, 0.05)',
                    border: plan.popular 
                      ? '2px solid #5865F2' 
                      : '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '16px',
                    height: '100%',
                    position: 'relative',
                    transform: plan.popular ? 'scale(1.05)' : 'scale(1)'
                  }}
                >
                  {plan.popular && (
                    <div style={{
                      position: 'absolute',
                      top: '-15px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: 'linear-gradient(135deg, #5865F2, #7C5CFF)',
                      color: '#ffffff',
                      padding: '0.5rem 1.5rem',
                      borderRadius: '20px',
                      fontSize: '0.85rem',
                      fontWeight: 600
                    }}>
                      MOST POPULAR
                    </div>
                  )}
                  
                  <h3 style={{ 
                    fontSize: '1.5rem', 
                    fontWeight: 600, 
                    color: '#ffffff',
                    marginBottom: '1rem',
                    marginTop: plan.popular ? '1rem' : '0'
                  }}>
                    {plan.name}
                  </h3>
                  
                  <div style={{ marginBottom: '2rem' }}>
                    <span style={{ 
                      fontSize: '3rem', 
                      fontWeight: 700, 
                      color: '#5865F2' 
                    }}>
                      ${plan.price}
                    </span>
                    <span style={{ color: '#B9BBBE', fontSize: '1rem' }}>
                      /{plan.period}
                    </span>
                  </div>

                  <Button 
                    type={plan.popular ? "primary" : "default"}
                    block
                    size="large"
                    style={{
                      height: '50px',
                      fontSize: '1.1rem',
                      marginBottom: '2rem',
                      background: plan.popular 
                        ? 'linear-gradient(135deg, #5865F2, #7C5CFF)'
                        : 'transparent',
                      border: plan.popular ? 'none' : '1px solid rgba(255, 255, 255, 0.2)',
                      color: '#ffffff'
                    }}
                  >
                    {plan.cta}
                  </Button>

                  <div>
                    {plan.features.map((feature, fidx) => (
                      <div key={fidx} style={{ 
                        color: '#B9BBBE', 
                        marginBottom: '0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}>
                        <CheckCircleOutlined style={{ color: '#00C851' }} />
                        {feature}
                      </div>
                    ))}
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section" style={{
        padding: '6rem 2rem',
        background: 'linear-gradient(135deg, #5865F2, #7C5CFF)',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontWeight: 700,
            color: '#ffffff',
            marginBottom: '1rem'
          }}>
            Ready to 10x Your Organic Traffic?
          </h2>
          <p style={{
            fontSize: '1.2rem',
            color: 'rgba(255, 255, 255, 0.9)',
            marginBottom: '3rem'
          }}>
            Join 10,000+ businesses using LightDom to dominate search results
          </p>
          <Button 
            type="primary"
            size="large"
            icon={<RocketOutlined />}
            style={{
              height: '60px',
              fontSize: '1.2rem',
              padding: '0 3rem',
              background: '#ffffff',
              color: '#5865F2',
              border: 'none',
              borderRadius: '12px',
              fontWeight: 600
            }}
          >
            Start Your Free Trial Now
          </Button>
          <div style={{ 
            marginTop: '2rem', 
            color: 'rgba(255, 255, 255, 0.8)',
            fontSize: '0.9rem'
          }}>
            No credit card required • 14-day free trial • Cancel anytime
          </div>
        </div>
      </section>
    </div>
  );
};

export default SEOProductShowcase;
