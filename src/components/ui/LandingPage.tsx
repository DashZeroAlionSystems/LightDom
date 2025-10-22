/**
 * Exodus-Inspired Landing Page
 * Modern, gradient-rich design with smooth animations
 */

import React, { useState, useEffect } from 'react';
import { 
  Rocket, 
  Shield, 
  Zap, 
  TrendingUp, 
  Users, 
  Award,
  ArrowRight,
  Check,
  Sparkles,
  Globe,
  Lock,
  BarChart3
} from 'lucide-react';

const LandingPage: React.FC = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: <Zap className="w-8 h-8" />,
      title: 'Lightning Fast',
      description: 'Optimize your DOM and reduce page load times by up to 80% with our advanced algorithms.',
      gradient: 'from-accent-blue to-accent-purple'
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Secure & Private',
      description: 'Enterprise-grade security with blockchain verification and encrypted data storage.',
      gradient: 'from-accent-purple to-accent-blue'
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: 'Earn Rewards',
      description: 'Get rewarded with DSH tokens for every optimization you perform.',
      gradient: 'from-accent-blue to-accent-purple'
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: 'Real-time Analytics',
      description: 'Track your optimizations and earnings with comprehensive analytics dashboard.',
      gradient: 'from-accent-purple to-accent-blue'
    }
  ];

  const stats = [
    { label: 'Active Users', value: '50,000+', icon: <Users /> },
    { label: 'Optimizations', value: '2M+', icon: <Sparkles /> },
    { label: 'Tokens Earned', value: '$5M+', icon: <Award /> },
    { label: 'Networks', value: '20+', icon: <Globe /> }
  ];

  const pricingPlans = [
    {
      name: 'Starter',
      price: 'Free',
      description: 'Perfect for individuals',
      features: [
        'Up to 10 optimizations/day',
        'Basic analytics',
        'Community support',
        'DSH token rewards'
      ]
    },
    {
      name: 'Pro',
      price: '$29',
      period: '/month',
      description: 'For professionals',
      features: [
        'Unlimited optimizations',
        'Advanced analytics',
        'Priority support',
        'Higher token rewards',
        'API access',
        'Custom integrations'
      ],
      highlighted: true
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      description: 'For large teams',
      features: [
        'Everything in Pro',
        'Dedicated support',
        'Custom solutions',
        'SLA guarantee',
        'White-label options',
        'Advanced security'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background-primary text-text-primary">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-hero">
          <div className="absolute inset-0 opacity-30">
            {[...Array(50)].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full bg-accent-blue"
                style={{
                  width: Math.random() * 4 + 1 + 'px',
                  height: Math.random() * 4 + 1 + 'px',
                  left: Math.random() * 100 + '%',
                  top: Math.random() * 100 + '%',
                  animation: `float ${Math.random() * 10 + 5}s ease-in-out infinite`,
                  animationDelay: Math.random() * 5 + 's',
                  opacity: Math.random() * 0.5 + 0.2
                }}
              />
            ))}
          </div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div 
            className="animate-fade-in"
            style={{ transform: `translateY(${scrollY * 0.1}px)` }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface border border-border mb-8 animate-slide-up">
              <Sparkles className="w-4 h-4 text-accent-blue" />
              <span className="text-sm text-text-secondary">Powered by Blockchain Technology</span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-heading font-bold mb-6 leading-tight">
              Optimize Your Web,
              <br />
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Earn Rewards
              </span>
            </h1>

            <p className="text-xl text-text-secondary mb-12 max-w-3xl mx-auto leading-relaxed">
              LightDom revolutionizes web optimization with AI-powered DOM analysis, 
              blockchain verification, and crypto rewards. Join thousands earning while improving the web.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button className="group px-8 py-4 bg-gradient-primary rounded-xl font-semibold text-lg transition-all duration-300 hover:shadow-glow hover:scale-105 flex items-center gap-2">
                Get Started Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="px-8 py-4 bg-surface border border-border rounded-xl font-semibold text-lg transition-all duration-300 hover:bg-surface-hover hover:border-border-light">
                View Demo
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mt-20 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <div 
                  key={index}
                  className="p-6 rounded-2xl bg-surface border border-border backdrop-blur-sm hover:bg-surface-hover transition-all duration-300 hover:scale-105"
                >
                  <div className="text-accent-blue mb-2">{stat.icon}</div>
                  <div className="text-3xl font-bold mb-1">{stat.value}</div>
                  <div className="text-sm text-text-secondary">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-background-secondary">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-heading font-bold mb-4">
              Powerful Features
            </h2>
            <p className="text-xl text-text-secondary max-w-2xl mx-auto">
              Everything you need to optimize, analyze, and monetize your web presence
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group p-8 rounded-2xl bg-gradient-card border border-border hover:border-accent-blue transition-all duration-300 hover:scale-105"
              >
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.gradient} text-white mb-6`}>
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-text-secondary leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-heading font-bold mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-text-secondary max-w-2xl mx-auto">
              Choose the plan that fits your needs
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <div
                key={index}
                className={`relative p-8 rounded-2xl border transition-all duration-300 hover:scale-105 ${
                  plan.highlighted
                    ? 'bg-gradient-card border-accent-blue shadow-glow'
                    : 'bg-surface border-border hover:border-border-light'
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-primary rounded-full text-sm font-semibold">
                    Most Popular
                  </div>
                )}

                <h3 className="text-2xl font-semibold mb-2">{plan.name}</h3>
                <p className="text-text-secondary mb-6">{plan.description}</p>
                
                <div className="mb-6">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.period && <span className="text-text-secondary">{plan.period}</span>}
                </div>

                <button className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 mb-8 ${
                  plan.highlighted
                    ? 'bg-gradient-primary hover:shadow-glow'
                    : 'bg-surface-hover border border-border hover:border-border-light'
                }`}>
                  {plan.highlighted ? 'Get Started' : 'Choose Plan'}
                </button>

                <ul className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-semantic-success flex-shrink-0 mt-0.5" />
                      <span className="text-text-secondary">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-hero">
        <div className="max-w-4xl mx-auto text-center">
          <Rocket className="w-16 h-16 mx-auto mb-6 text-accent-blue" />
          <h2 className="text-4xl lg:text-5xl font-heading font-bold mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-text-secondary mb-8">
            Join thousands of developers optimizing the web and earning rewards
          </p>
          <button className="group px-8 py-4 bg-gradient-primary rounded-xl font-semibold text-lg transition-all duration-300 hover:shadow-glow hover:scale-105 inline-flex items-center gap-2">
            Start Optimizing Now
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-background-secondary border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-heading font-bold text-xl mb-4">LightDom</h3>
              <p className="text-text-secondary text-sm">
                Revolutionizing web optimization with blockchain technology
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-text-secondary text-sm">
                <li><a href="#" className="hover:text-accent-blue transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-accent-blue transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-accent-blue transition-colors">Security</a></li>
                <li><a href="#" className="hover:text-accent-blue transition-colors">Roadmap</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-text-secondary text-sm">
                <li><a href="#" className="hover:text-accent-blue transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-accent-blue transition-colors">API Reference</a></li>
                <li><a href="#" className="hover:text-accent-blue transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-accent-blue transition-colors">Community</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-text-secondary text-sm">
                <li><a href="#" className="hover:text-accent-blue transition-colors">About</a></li>
                <li><a href="#" className="hover:text-accent-blue transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-accent-blue transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-accent-blue transition-colors">Legal</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-border text-center text-text-secondary text-sm">
            <p>&copy; 2025 LightDom. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0);
          }
          50% {
            transform: translateY(-20px) translateX(10px);
          }
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
