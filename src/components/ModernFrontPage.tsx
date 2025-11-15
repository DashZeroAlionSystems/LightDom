/**
 * Modern Front Page Component
 * Enhanced with design system, scroll animations, and micro-interactions
 * Features: SEO optimization, custom SVG graphics, responsive design
 */

import React, { useState, useEffect } from 'react';
import SEOHead, { generateOrganizationSchema, generateFAQSchema, generateBreadcrumbSchema } from './SEOHead';
import useScrollAnimation from '../hooks/useScrollAnimation';
import {
  Rocket,
      <SEOHead
        title="LightDom | Blockchain-Verified DOM Optimization & Core Web Vitals Automation"
        description="Ship lightning-fast, search-optimized experiences with LightDom. Automate Core Web Vitals, notarize performance gains on-chain, and reward teams for sustained SEO improvements."
        keywords=[
          'DOM optimization platform',
          'Core Web Vitals automation',
          'blockchain performance monitoring',
          'SEO workflow automation',
          'frontend performance optimization',
          'page speed insights',
          'performance budgets',
          'web vitals alerts',
          'decentralized audit trail'
        ]
        type="website"
        url="https://lightdom.io"
        schema={seoSchema}
      />
  Activity,
  Star,
  ChevronRight,
  Play,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react';

// Custom SVG Graphics Components
const HeroGraphic: React.FC = () => (
  <svg width="100%" height="100%" viewBox="0 0 800 600" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Animated background grid */}
    <defs>
      <linearGradient id="gridGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#667eea" stopOpacity="0.2" />
        <stop offset="100%" stopColor="#764ba2" stopOpacity="0.1" />
      </linearGradient>
      <linearGradient id="glowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#667eea" />
        <stop offset="100%" stopColor="#764ba2" />
      </linearGradient>
      <filter id="glow">
        <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>

    {/* Grid pattern */}
    <g opacity="0.3">
      {[...Array(20)].map((_, i) => (
        <line
          key={`v-${i}`}
          x1={i * 40}
          y1="0"
          x2={i * 40}
          y2="600"
          stroke="url(#gridGradient)"
          strokeWidth="1"
        />
      ))}
      {[...Array(15)].map((_, i) => (
        <line
          key={`h-${i}`}
          x1="0"
          y1={i * 40}
          x2="800"
          y2={i * 40}
          stroke="url(#gridGradient)"
          strokeWidth="1"
        />
      ))}
    </g>

    {/* Floating nodes with connections */}
    <g className="animate-float-slow">
      <circle cx="150" cy="100" r="8" fill="url(#glowGradient)" filter="url(#glow)" />
      <circle cx="350" cy="150" r="12" fill="url(#glowGradient)" filter="url(#glow)" />
      <circle cx="600" cy="120" r="10" fill="url(#glowGradient)" filter="url(#glow)" />
      <circle cx="250" cy="300" r="8" fill="url(#glowGradient)" filter="url(#glow)" />
      <circle cx="550" cy="350" r="12" fill="url(#glowGradient)" filter="url(#glow)" />
      
      {/* Connection lines */}
      <line x1="150" y1="100" x2="350" y2="150" stroke="url(#glowGradient)" strokeWidth="2" opacity="0.5" />
      <line x1="350" y1="150" x2="600" y2="120" stroke="url(#glowGradient)" strokeWidth="2" opacity="0.5" />
      <line x1="250" y1="300" x2="350" y2="150" stroke="url(#glowGradient)" strokeWidth="2" opacity="0.5" />
      <line x1="550" y1="350" x2="600" y2="120" stroke="url(#glowGradient)" strokeWidth="2" opacity="0.5" />
    </g>

    {/* Orbiting elements */}
    <g className="animate-spin-slow" transform-origin="400 300">
      <circle cx="400" cy="200" r="6" fill="#667eea" opacity="0.6" />
      <circle cx="500" cy="300" r="6" fill="#764ba2" opacity="0.6" />
      <circle cx="400" cy="400" r="6" fill="#667eea" opacity="0.6" />
      <circle cx="300" cy="300" r="6" fill="#764ba2" opacity="0.6" />
    </g>
  </svg>
);

const FeatureGraphic: React.FC<{ type: 'speed' | 'security' | 'analytics' }> = ({ type }) => {
  const graphics = {
    speed: (
      <svg width="200" height="200" viewBox="0 0 200 200" fill="none">
        <defs>
          <linearGradient id="speedGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#667eea" />
            <stop offset="100%" stopColor="#764ba2" />
          </linearGradient>
        </defs>
        <circle cx="100" cy="100" r="80" stroke="url(#speedGrad)" strokeWidth="4" fill="none" opacity="0.2" />
        <path
          d="M 100 20 L 100 100 L 160 140"
          stroke="url(#speedGrad)"
          strokeWidth="6"
          strokeLinecap="round"
          className="animate-pulse"
        />
        {[0, 60, 120, 180, 240, 300].map((angle, i) => {
          const x = 100 + 70 * Math.cos((angle - 90) * Math.PI / 180);
          const y = 100 + 70 * Math.sin((angle - 90) * Math.PI / 180);
          return <circle key={i} cx={x} cy={y} r="4" fill="url(#speedGrad)" />;
        })}
      </svg>
    ),
    security: (
      <svg width="200" height="200" viewBox="0 0 200 200" fill="none">
        <defs>
          <linearGradient id="secGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#667eea" />
            <stop offset="100%" stopColor="#764ba2" />
          </linearGradient>
        </defs>
        <path
          d="M 100 30 L 150 50 L 150 100 Q 150 140 100 160 Q 50 140 50 100 L 50 50 Z"
          fill="url(#secGrad)"
          opacity="0.2"
        />
        <path
          d="M 100 40 L 140 55 L 140 100 Q 140 130 100 145 Q 60 130 60 100 L 60 55 Z"
          stroke="url(#secGrad)"
          strokeWidth="3"
          fill="none"
        />
        <path
          d="M 85 95 L 95 105 L 115 85"
          stroke="url(#secGrad)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="animate-pulse"
        />
      </svg>
    ),
    analytics: (
      <svg width="200" height="200" viewBox="0 0 200 200" fill="none">
        <defs>
          <linearGradient id="analyticsGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#667eea" />
            <stop offset="100%" stopColor="#764ba2" />
          </linearGradient>
        </defs>
        {[40, 60, 80, 50, 70, 90, 85].map((height, i) => (
          <rect
            key={i}
            x={30 + i * 22}
            y={160 - height}
            width="18"
            height={height}
            fill="url(#analyticsGrad)"
            opacity={0.3 + (i * 0.1)}
            className="animate-pulse"
            style={{ animationDelay: `${i * 0.1}s` }}
          />
        ))}
        <path
          d="M 30 130 Q 60 100, 90 110 T 150 90 T 180 100"
          stroke="url(#analyticsGrad)"
          strokeWidth="3"
          fill="none"
          className="animate-draw"
        />
      </svg>
    )
  };

  return graphics[type];
};

const LogoGraphic: React.FC = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
    <defs>
      <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#667eea" />
        <stop offset="100%" stopColor="#764ba2" />
      </linearGradient>
    </defs>
    <circle cx="20" cy="20" r="18" fill="url(#logoGrad)" />
    <path
      d="M 12 20 L 18 26 L 28 14"
      stroke="white"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

interface ModernFrontPageProps {
  onNavigate?: (path: string) => void;
}

const ModernFrontPage: React.FC<ModernFrontPageProps> = ({ onNavigate }) => {
  const [scrollY, setScrollY] = useState(0);
  const [activeFeature, setActiveFeature] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Feature rotation for interactive showcase
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 3);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    const existing = document.querySelector('script[data-lightdom="seo-sdk"]') as HTMLScriptElement | null;
    if (existing) {
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdn.lightdom.io/seo/v1/lightdom-seo.js';
    script.async = true;
    script.setAttribute('data-lightdom', 'seo-sdk');
    script.setAttribute('data-api-key', 'ld_live_demo_frontpage');
    script.setAttribute('data-api-endpoint', import.meta.env?.VITE_API_BASE_URL || 'https://api.lightdom.io');
    script.setAttribute('data-enable-crawler', 'true');
    script.setAttribute('data-apply-style-guide', 'true');
    script.setAttribute('data-realtime-insights', 'true');
    script.setAttribute('data-backlink-overlay', 'true');
    script.setAttribute('data-core-web-vitals', 'true');
    script.setAttribute('data-analytics', 'true');
    script.setAttribute('data-plan', 'enterprise');
    script.crossOrigin = 'anonymous';
    script.referrerPolicy = 'strict-origin-when-cross-origin';
    const integrity = import.meta.env?.VITE_LIGHTDOM_SDK_SRI as string | undefined;
    if (integrity) {
      script.integrity = integrity;
    }
    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  const features = [
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'Lightning Fast Optimization',
      description: 'Reduce page load times by up to 80% with advanced DOM optimization algorithms',
      graphic: <FeatureGraphic type="speed" />,
      status: 'active',
      seoKeywords: ['performance', 'optimization', 'speed', 'DOM']
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Blockchain Security',
      description: 'Enterprise-grade security with blockchain verification and encrypted storage',
      graphic: <FeatureGraphic type="security" />,
      status: 'active',
      seoKeywords: ['security', 'blockchain', 'encryption', 'verification']
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: 'Real-Time Analytics',
      description: 'Comprehensive analytics dashboard with real-time performance insights',
      graphic: <FeatureGraphic type="analytics" />,
      status: 'beta',
      seoKeywords: ['analytics', 'insights', 'monitoring', 'metrics']
    },
    {
      icon: <Database className="w-6 h-6" />,
      title: 'Decentralized Storage',
      description: 'Store and manage your data across distributed blockchain networks',
      graphic: null,
      status: 'coming-soon',
      seoKeywords: ['storage', 'decentralized', 'distributed', 'blockchain']
    },
    {
      icon: <Code className="w-6 h-6" />,
      title: 'Developer API',
      description: 'RESTful API and SDKs for seamless integration with your applications',
      graphic: null,
      status: 'coming-soon',
      seoKeywords: ['API', 'SDK', 'integration', 'developer']
    },
    {
      icon: <Cpu className="w-6 h-6" />,
      title: 'AI-Powered Insights',
      description: 'Machine learning algorithms for intelligent optimization recommendations',
      graphic: null,
      status: 'coming-soon',
      seoKeywords: ['AI', 'machine learning', 'intelligent', 'automation']
    }
  ];

  const stats = [
    { value: '10K+', label: 'Active Users', icon: <Users className="w-5 h-5" />, status: 'active' },
    { value: '$2M+', label: 'Rewards Distributed', icon: <Award className="w-5 h-5" />, status: 'active' },
    { value: '99.9%', label: 'Uptime', icon: <Activity className="w-5 h-5" />, status: 'active' },
    { value: '150+', label: 'Integrations', icon: <GitBranch className="w-5 h-5" />, status: 'beta' }
  ];

  const heroHighlights = [
    'Blockchain-verified audit trail for every optimization change',
    'Automated Core Web Vitals monitoring and alerting',
    'Reward engine that pays out for sustained performance gains'
  ];

  const headerScriptHighlights = [
    'One-line installation with rotating API keys and SRI protection',
    'Automatic schema orchestration mapped to live crawler snapshots',
    'Granular consent controls with CSP-safe delivery'
  ];

  const styleGuideTokens = {
    palette: [
      { name: 'Primary', value: '#7c3aed' },
      { name: 'Secondary', value: '#0ea5e9' },
      { name: 'Accent', value: '#f59e0b' },
      { name: 'Surface', value: '#1e293b' }
    ],
    typography: [
      { name: 'Heading', value: 'Inter 700 / 3.5rem' },
      { name: 'Subheading', value: 'Inter 600 / 2.25rem' },
      { name: 'Body', value: 'Inter 400 / 1rem' }
    ],
    automation: [
      { name: 'Zero-config setup', detail: 'Detects page intent and injects matching schema' },
      { name: 'Realtime budgets', detail: 'Locks spacing, colors, and typography at runtime' },
      { name: 'Platform aware', detail: 'Respects existing design tokens and dark mode switches' }
    ]
  };

  const telemetryMetrics = [
    { label: 'Live SEO score', value: '92', change: '+6.3', tone: 'text-green-400' },
    { label: 'Keywords trending up', value: '34', change: '+12', tone: 'text-purple-400' },
    { label: 'Alerts resolved', value: '18', change: '-5', tone: 'text-blue-400' }
  ];

  const backlinkHighlights = [
    {
      title: 'Self-generating storefront',
      detail: 'OfferCatalog schema spins up a live backlink marketplace tied to payout URLs'
    },
    {
      title: 'Authority routing',
      detail: 'Distributes link equity based on trust flow, topic clusters, and intent parity'
    },
    {
      title: 'Automated audits',
      detail: 'Edge worker verifies indexation, anchor diversity, and spam tolerances in real time'
    }
  ];

  const benefits = [
    { text: 'No setup fees', status: 'active' },
    { text: 'Cancel anytime', status: 'active' },
    { text: 'Blockchain verified', status: 'active' },
    { text: '24/7 Support', status: 'active' },
    { text: 'Advanced AI features', status: 'coming-soon' },
    { text: 'Custom integrations', status: 'coming-soon' }
  ];

  const useCases = [
    {
      title: 'E-Commerce',
      description: 'Optimize product pages for faster checkouts',
      icon: <Cloud className="w-8 h-8" />,
      status: 'active'
    },
    {
      title: 'Content Publishers',
      description: 'Improve reader experience with faster load times',
      icon: <Globe className="w-8 h-8" />,
      status: 'active'
    },
    {
      title: 'SaaS Applications',
      description: 'Enhance application performance and user satisfaction',
      icon: <Layers className="w-8 h-8" />,
      status: 'beta'
    },
    {
      title: 'Enterprise Solutions',
      description: 'Custom optimization for large-scale deployments',
      icon: <Users className="w-8 h-8" />,
      status: 'coming-soon'
    }
  ];

  const faqItems = [
    {
      question: 'How does LightDom improve page speed and SEO rankings?',
      answer:
        'LightDom analyzes your DOM tree, compresses render-blocking resources, and automates Core Web Vitals tuning. Search engines reward these improvements with higher rankings and lower bounce rates.'
    },
    {
      question: 'What makes blockchain verification useful for optimization?',
      answer:
        'Every optimization is notarized on-chain, giving engineering, marketing, and compliance teams a tamper-proof record that proves when and how performance gains were achieved.'
    },
    {
      question: 'Do I need to replace my current analytics or CDN setup?',
      answer:
        'No. LightDom layers on top of your existing stack with SDKs and REST APIs, so you can keep your preferred analytics, CDN, and deployment workflows.'
    },
    {
      question: 'Can enterprise teams integrate LightDom with their pipelines?',
      answer:
        'Yes. Integrate via our CLI, GraphQL API, and webhook subscriptions to orchestrate audits, enforce budgets, and trigger alerts directly from your CI/CD pipelines.'
    }
  ];

  const activeFeatureNames = features
    .filter((feature) => feature.status === 'active')
    .map((feature) => feature.title);

  const activeUseCaseNames = useCases
    .filter((useCase) => useCase.status === 'active')
    .map((useCase) => useCase.title);

  const softwareApplicationSchema = {
    '@type': 'SoftwareApplication',
    name: 'LightDom Platform',
    applicationCategory: 'WebPerformanceOptimizationSoftware',
    description:
      'LightDom is a blockchain-secured DOM optimization platform that accelerates page speed, boosts SEO, and rewards teams for sustained performance.',
    url: 'https://lightdom.io',
    operatingSystem: 'Web, Windows, macOS, Linux',
    featureList: activeFeatureNames,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock'
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      ratingCount: '10432'
    },
    audience: {
      '@type': 'Audience',
      audienceType: ['Developers', 'DevOps Teams', 'SEO Specialists', 'Digital Agencies']
    },
    keywords: [
      'DOM optimization platform',
      'Core Web Vitals automation',
      'blockchain performance monitoring',
      'SEO performance tracking'
    ].join(', '),
    applicationSubCategory: activeUseCaseNames
  };

  const { ['@context']: _orgContext, ...organizationSchema } = generateOrganizationSchema();
  const { ['@context']: _faqContext, ...faqSchema } = generateFAQSchema(faqItems);
  const { ['@context']: _breadcrumbContext, ...breadcrumbSchema } = generateBreadcrumbSchema([
    { name: 'Home', url: 'https://lightdom.io/' },
    { name: 'Platform', url: 'https://lightdom.io/platform' }
  ]);

  const seoSchema = {
    '@context': 'https://schema.org',
    '@graph': [softwareApplicationSchema, organizationSchema, faqSchema, breadcrumbSchema]
  };

  const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const config = {
      active: { icon: <CheckCircle2 className="w-3 h-3" />, text: 'Active', color: 'bg-green-500/10 text-green-500 border-green-500/20' },
      beta: { icon: <AlertCircle className="w-3 h-3" />, text: 'Beta', color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' },
      'coming-soon': { icon: <XCircle className="w-3 h-3" />, text: 'Coming Soon', color: 'bg-gray-500/10 text-gray-400 border-gray-500/20' }
    };

    const badge = config[status as keyof typeof config] || config['coming-soon'];

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${badge.color}`}>
        {badge.icon}
        {badge.text}
      </span>
    );
  };

  const handleNavigation = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* SEO Metadata */}
      <SEOHead
        title="LightDom - Next-Gen DOM Optimization Platform | Blockchain Verified"
        description="Advanced DOM optimization platform with blockchain verification, real-time analytics, and AI-powered insights. Reduce page load times by up to 80%. Trusted by 10,000+ developers worldwide."
        keywords={[
          'DOM optimization',
          'web performance',
          'page speed optimization',
          'blockchain verification',
          'SEO optimization',
          'web analytics',
          'performance monitoring',
          'frontend optimization',
          'load time reduction',
          'web vitals'
        ]}
        type="website"
        url="https://lightdom.io"
      />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <LogoGraphic />
              <span className="text-xl font-bold">LightDom</span>
              <span className="text-xs px-2 py-1 bg-purple-500/20 rounded-full border border-purple-500/30">
                Platform
              </span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-300 hover:text-white transition-colors">Features</a>
              <a href="#use-cases" className="text-gray-300 hover:text-white transition-colors">Use Cases</a>
              <a href="#pricing" className="text-gray-300 hover:text-white transition-colors opacity-50 cursor-not-allowed">
                Pricing <span className="text-xs">(Soon)</span>
              </a>
              <button
                onClick={() => handleNavigation('/login')}
                className="text-gray-300 hover:text-white transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => handleNavigation('/register')}
                className="px-4 py-2 bg-linear-to-r from-purple-600 to-blue-600 rounded-lg font-semibold hover:opacity-90 transition-opacity"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        {/* Animated background */}
        <div className="absolute inset-0 opacity-30">
          <HeroGraphic />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center max-w-4xl mx-auto">
            {/* Trust badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-sm">
              <Star className="w-4 h-4 text-yellow-400" />
              <span className="text-sm">Trusted by 10,000+ developers worldwide</span>
            </div>

            {/* Main headline - SEO optimized */}
            <h1
              className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
              itemProp="headline"
            >
              Blockchain-Verified DOM Optimization
              <br />
              <span className="bg-linear-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Built To Win Core Web Vitals
              </span>
            </h1>

            {/* Value proposition */}
            <p 
              className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto"
              itemProp="description"
            >
              LightDom automates the heavy lifting behind real-world performance. Analyze critical renders,
              eliminate layout thrash, and notarize every optimization on-chain so marketing, engineering, and
              compliance teams stay perfectly aligned.
            </p>

            <ul className="grid gap-3 sm:grid-cols-3 text-left text-base text-gray-300 mb-10" itemProp="about">
              {heroHighlights.map((highlight, index) => (
                <li key={index} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-400 mt-1" />
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <button
                onClick={() => handleNavigation('/register')}
                className="group flex items-center justify-center gap-2 px-8 py-4 bg-linear-to-r from-purple-600 to-blue-600 rounded-xl font-semibold text-lg hover:opacity-90 transition-all hover:scale-105"
              >
                <Rocket className="w-5 h-5" />
                <span>Start Optimizing</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => handleNavigation('/dashboard')}
                className="group flex items-center justify-center gap-2 px-8 py-4 bg-white/10 border-2 border-white/20 rounded-xl font-semibold text-lg hover:bg-white/20 transition-all hover:scale-105 backdrop-blur-sm"
              >
                <Play className="w-5 h-5" />
                <span>View Demo</span>
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-xl bg-white/5 border border-white/10 hover:border-purple-500/50 transition-all ${
                    stat.status !== 'active' ? 'opacity-50' : ''
                  }`}
                  itemProp="aggregateRating"
                  itemScope
                  itemType="https://schema.org/AggregateRating"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-purple-400">{stat.icon}</div>
                    <StatusBadge status={stat.status} />
                  </div>
                  <div className="text-2xl font-bold mb-1" itemProp="ratingValue">{stat.value}</div>
                  <div className="text-sm text-gray-400" itemProp="ratingCount">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-2">
            <div className="w-1 h-2 bg-white/50 rounded-full" />
          </div>
        </div>
      </section>

      {/* Header Script Engine */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-[2fr,1fr] gap-12 items-center">
          <div>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-purple-500/40 text-purple-300 text-xs uppercase tracking-wider mb-6">
              <Sparkles className="w-4 h-4" /> Header Script Automation
            </span>
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              One Line Of JavaScript. Endless SEO Automation.
            </h2>
            <p className="text-lg text-gray-300 mb-8">
              Our lightdom-seo.js header script crawls, classifies, and deploys structured data in real time. It rotates API keys, respects CSP, and notarizes every change on-chain.
            </p>
            <div className="grid sm:grid-cols-3 gap-6 mb-10">
              {headerScriptHighlights.map((item, index) => (
                <div key={index} className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-9 h-9 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-300">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <StatusBadge status="active" />
                  </div>
                  <p className="text-sm text-gray-300 leading-relaxed">{item}</p>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-3 text-sm text-gray-300">
              <span className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white/5 border border-white/10">
                <Shield className="w-4 h-4 text-purple-300" /> SRI + CSP Safe
              </span>
              <span className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white/5 border border-white/10">
                <GitBranch className="w-4 h-4 text-purple-300" /> Versioned via CDN edge
              </span>
              <span className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white/5 border border-white/10">
                <Search className="w-4 h-4 text-purple-300" /> Crawler-aware schema mapping
              </span>
            </div>
          </div>
          <div className="relative p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur">
            <pre className="text-xs text-left text-gray-300 overflow-x-auto">
{`<script
  data-lightdom="seo-sdk"
  src="https://cdn.lightdom.io/seo/v1/lightdom-seo.js"
  data-api-key="ld_live_demo_frontpage"
  data-enable-crawler="true"
  data-apply-style-guide="true"
  data-realtime-insights="true"
  data-backlink-overlay="true"
  data-plan="enterprise"
  async
  crossorigin="anonymous">
</script>`}
            </pre>
            <p className="mt-4 text-xs text-gray-500">
              Rotating keys, CSP allowlist helpers, and nonce support ship with every install.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-4" itemProp="about">
              Powerful Features for Modern Web
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Everything you need to optimize, monitor, and scale your web presence
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`group p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-500/50 transition-all duration-300 hover:scale-105 ${
                  feature.status !== 'active' ? 'opacity-60' : ''
                }`}
                itemProp="offers"
                itemScope
                itemType="https://schema.org/Offer"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="p-3 rounded-xl bg-linear-to-br from-purple-600 to-blue-600 text-white group-hover:scale-110 transition-transform">
                    {feature.icon}
                  </div>
                  <StatusBadge status={feature.status} />
                </div>
                
                {feature.graphic && (
                  <div className="flex justify-center mb-6">
                    {feature.graphic}
                  </div>
                )}
                
                <h3 className="text-2xl font-semibold mb-3" itemProp="name">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed mb-4" itemProp="description">
                  {feature.description}
                </p>
                
                {/* SEO keywords (hidden but indexed) */}
                <meta itemProp="keywords" content={feature.seoKeywords.join(', ')} />
                
                {feature.status === 'active' ? (
                  <button
                    onClick={() => handleNavigation('/dashboard')}
                    className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    Learn more
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <span className="text-gray-500 text-sm">Available soon</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section id="use-cases" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-4">
              Built for Every Use Case
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              From startups to enterprises, LightDom scales with your needs
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {useCases.map((useCase, index) => (
              <div
                key={index}
                className={`p-8 rounded-2xl bg-linear-to-br from-white/5 to-white/10 border border-white/10 hover:border-purple-500/50 transition-all ${
                  useCase.status !== 'active' ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="p-4 rounded-xl bg-purple-600/20">
                    {useCase.icon}
                  </div>
                  <StatusBadge status={useCase.status} />
                </div>
                <h3 className="text-2xl font-semibold mb-3">{useCase.title}</h3>
                <p className="text-gray-400 leading-relaxed">{useCase.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Real-Time Insights */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-[1.2fr,1fr] gap-12 items-center">
          <div>
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">Real-Time SEO Command Center</h2>
            <p className="text-lg text-gray-300 mb-8">
              Live telemetry streams straight from the header script into your dashboard. Monitor Core Web Vitals, ranking deltas, and campaign rules without refreshing the page.
            </p>
            <ul className="space-y-4">
              {telemetryMetrics.map((metric, index) => (
                <li key={index} className="flex items-center justify-between p-5 rounded-2xl bg-white/5 border border-white/10">
                  <div>
                    <p className="text-sm text-gray-400 uppercase tracking-[0.3em]">{metric.label}</p>
                    <p className="text-2xl font-semibold text-white">{metric.value}</p>
                  </div>
                  <span className={`${metric.tone} text-sm font-semibold`}>{metric.change}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="p-6 rounded-3xl bg-linear-to-br from-purple-700/40 via-blue-800/40 to-slate-900/60 border border-white/10 shadow-xl">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-300" /> Monthly Change Log
            </h3>
            <p className="text-sm text-gray-300 mb-6">
              Automatic month-end reports highlight every schema release, backlink approval, and Core Web Vital shift—ready for stakeholders and auditors.
            </p>
            <div className="space-y-3 text-sm text-gray-300">
              <div className="flex items-center gap-3">
                <Check className="w-4 h-4 text-green-400" /> Blockchain notarized optimization ledger
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-4 h-4 text-green-400" /> Automated alert routing to Slack, Teams, and email
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-4 h-4 text-green-400" /> Export-ready executive summaries and diffed SERP screenshots
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Style Guide DNA */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-900/40">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-[1.2fr,1fr] gap-12 items-center">
            <div>
              <h2 className="text-4xl lg:text-5xl font-bold mb-6">Style Guide Defaults Generated From Live Crawls</h2>
              <p className="text-lg text-gray-300 mb-8">
                The header script mines your DOM, extracts design tokens, and locks consistent presentation across every landing page—without overwriting your brand.
              </p>
              <div className="grid sm:grid-cols-2 gap-6 mb-10">
                {styleGuideTokens.palette.map((color, index) => (
                  <div key={index} className="p-5 rounded-2xl border border-white/10 bg-white/5">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="w-6 h-6 rounded-full" style={{ backgroundColor: color.value }} />
                      <span className="text-sm text-gray-300 uppercase tracking-[0.25em]">{color.name}</span>
                    </div>
                    <p className="text-gray-400 text-sm">{color.value}</p>
                  </div>
                ))}
              </div>
              <ul className="space-y-3 text-sm text-gray-300">
                {styleGuideTokens.automation.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Zap className="w-4 h-4 text-purple-300 mt-1" />
                    <span><strong className="text-white">{item.name}:</strong> {item.detail}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-6 rounded-3xl bg-linear-to-br from-purple-700/30 via-blue-700/30 to-slate-900/50 border border-white/10">
              <h3 className="text-xl font-semibold text-white mb-4">Typography Blueprint</h3>
              <div className="space-y-4">
                {styleGuideTokens.typography.map((item, index) => (
                  <div key={index} className="p-4 rounded-2xl bg-white/5 border border-white/10">
                    <p className="text-sm text-gray-400 uppercase tracking-[0.2em] mb-1">{item.name}</p>
                    <p className="text-lg text-white">{item.value}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 text-xs text-gray-400">
                Templates sync to Figma, Tailwind, and CSS custom properties for frictionless rollout.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl lg:text-5xl font-bold mb-6">
                Why Choose LightDom?
              </h2>
              <p className="text-xl text-gray-400 mb-8">
                Join thousands of developers and businesses who trust LightDom for their optimization needs.
              </p>
              <div className="grid sm:grid-cols-2 gap-4 mb-8">
                {benefits.map((benefit, index) => (
                  <div 
                    key={index} 
                    className={`flex items-center gap-3 ${benefit.status !== 'active' ? 'opacity-50' : ''}`}
                  >
                    {benefit.status === 'active' ? (
                      <Check className="w-6 h-6 text-green-400 shrink-0" />
                    ) : (
                      <AlertCircle className="w-6 h-6 text-gray-500 shrink-0" />
                    )}
                    <span className={benefit.status !== 'active' ? 'text-gray-500' : ''}>
                      {benefit.text}
                      {benefit.status !== 'active' && <span className="text-xs ml-2">(Soon)</span>}
                    </span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => handleNavigation('/register')}
                className="px-8 py-4 bg-linear-to-r from-purple-600 to-blue-600 rounded-xl font-semibold text-lg hover:opacity-90 transition-opacity"
              >
                Get Started Free
              </button>
            </div>
            <div className="relative">
              <div className="p-8 rounded-3xl bg-linear-to-br from-purple-600 to-blue-600">
                <div className="text-center space-y-6">
                  <Sparkles className="w-20 h-20 mx-auto text-white animate-pulse" />
                  <h3 className="text-3xl font-bold text-white">Start Optimizing Today</h3>
                  <p className="text-white/90">
                    Get instant access to all active features. No credit card required.
                  </p>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3 text-white">
                      <CheckCircle2 className="w-5 h-5" />
                      <span>Free tier available</span>
                    </div>
                    <div className="flex items-center gap-3 text-white">
                      <CheckCircle2 className="w-5 h-5" />
                      <span>Upgrade anytime</span>
                    </div>
                    <div className="flex items-center gap-3 text-white/50">
                      <AlertCircle className="w-5 h-5" />
                      <span>Enterprise plans coming soon</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl lg:text-5xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-400">
              Straightforward answers for performance, SEO, and compliance teams evaluating LightDom.
            </p>
          </div>
          <div className="space-y-4">
            {faqItems.map((item, index) => (
              <details
                key={index}
                className="group rounded-2xl border border-white/10 bg-white/5 p-6 transition-all hover:border-purple-500/40"
                itemScope
                itemProp="mainEntity"
                itemType="https://schema.org/Question"
              >
                <summary className="flex cursor-pointer items-center justify-between gap-4 text-lg font-semibold text-white">
                  <span itemProp="name">{item.question}</span>
                  <ChevronRight className="h-5 w-5 text-purple-400 transition-transform group-open:rotate-90" />
                </summary>
                <div className="pt-4 text-base text-gray-300" itemProp="acceptedAnswer" itemScope itemType="https://schema.org/Answer">
                  <p itemProp="text">{item.answer}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Backlink Commerce Network */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-4">Backlink Commerce Included In Elite Plans</h2>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto">
              Our backlink marketplace spins up OfferCatalog schemas that showcase pre-approved placements, payout URLs, and anchor text variants—ready for rich snippets and affiliate conversions.
            </p>
          </div>
          <div className="grid lg:grid-cols-3 gap-8 mb-16">
            {backlinkHighlights.map((item, index) => (
              <div key={index} className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm hover:border-purple-500/50 transition-all">
                <h3 className="text-xl font-semibold mb-3 text-white">{item.title}</h3>
                <p className="text-sm text-gray-300 leading-relaxed">{item.detail}</p>
              </div>
            ))}
          </div>
          <div className="p-6 rounded-3xl bg-linear-to-br from-purple-700/30 via-blue-700/30 to-slate-900/50 border border-white/10">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <GitBranch className="w-5 h-5" /> OfferCatalog Preview
            </h3>
            <pre className="text-xs text-left text-gray-300 overflow-x-auto">
{`{
  "@context": "https://schema.org",
  "@type": "OfferCatalog",
  "name": "LightDom Backlink Storefront - ELITE Tier",
  "itemListElement": [
    {
      "@type": "Offer",
      "position": 1,
      "url": "https://app.lightdom.io/payout?source=partner-site",
      "itemOffered": {
        "@type": "Service",
        "name": "High-authority editorial feature",
        "potentialAction": { "@type": "BuyAction", "target": "https://app.lightdom.io/payout" }
      }
    }
  ]
}`}
            </pre>
            <p className="mt-4 text-xs text-gray-400">
              Storefront data powers rich snippets, affiliate tracking, and automated reconciliation.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-linear-to-r from-purple-900 via-blue-900 to-purple-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-white">
            Ready to Optimize Your Web?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join the next generation of web optimization. Start for free today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => handleNavigation('/register')}
              className="group flex items-center justify-center gap-2 px-8 py-4 bg-white text-purple-600 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-all hover:scale-105"
            >
              <Rocket className="w-5 h-5" />
              <span>Start Free Trial</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              className="group flex items-center justify-center gap-2 px-8 py-4 bg-white/10 border-2 border-white text-white rounded-xl font-semibold text-lg hover:bg-white/20 transition-all hover:scale-105 backdrop-blur-sm opacity-50 cursor-not-allowed"
              disabled
            >
              <Users className="w-5 h-5" />
              <span>Schedule Demo</span>
              <span className="text-xs">(Soon)</span>
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-slate-900 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <LogoGraphic />
                <span className="text-xl font-bold">LightDom</span>
              </div>
              <p className="text-gray-400 text-sm">
                Next-generation DOM optimization platform.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#use-cases" className="hover:text-white transition-colors">Use Cases</a></li>
                <li><span className="text-gray-600 cursor-not-allowed">Pricing (Soon)</span></li>
                <li><span className="text-gray-600 cursor-not-allowed">Roadmap (Soon)</span></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>
                  <button onClick={() => handleNavigation('/dashboard')} className="hover:text-white transition-colors">
                    Documentation
                  </button>
                </li>
                <li><span className="text-gray-600 cursor-not-allowed">API Reference (Soon)</span></li>
                <li><span className="text-gray-600 cursor-not-allowed">Blog (Soon)</span></li>
                <li><span className="text-gray-600 cursor-not-allowed">Support (Soon)</span></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><span className="text-gray-600 cursor-not-allowed">About (Soon)</span></li>
                <li><span className="text-gray-600 cursor-not-allowed">Careers (Soon)</span></li>
                <li><span className="text-gray-600 cursor-not-allowed">Contact (Soon)</span></li>
                <li><span className="text-gray-600 cursor-not-allowed">Legal (Soon)</span></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-white/10 text-center text-gray-400 text-sm">
            <p>&copy; 2025 LightDom Platform. Built with blockchain technology.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ModernFrontPage;
