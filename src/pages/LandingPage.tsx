/**
 * Landing Page - LightDom Space Optimization Platform
 * Modern homepage introducing the platform and guiding users to get started
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import {
  Zap,
  Shield,
  BarChart3,
  Globe,
  ArrowRight,
  Star,
  CheckCircle,
  Users,
  TrendingUp,
  Cpu,
  Database,
  Cloud,
} from 'lucide-react';

export default function LandingPage() {
  const features = [
    {
      icon: Zap,
      title: 'Lightning Fast Optimization',
      description: 'AI-powered space mining algorithms that optimize DOM structures in real-time for maximum performance.',
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'Bank-grade security with end-to-end encryption and comprehensive audit trails.',
    },
    {
      icon: BarChart3,
      title: 'Advanced Analytics',
      description: 'Deep insights into your digital assets with predictive analytics and optimization recommendations.',
    },
    {
      icon: Globe,
      title: 'Global Network',
      description: 'Distributed mining network spanning multiple blockchains and optimization zones.',
    },
  ];

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'CTO, TechFlow Inc.',
      content: 'LightDom increased our site performance by 340% and reduced our hosting costs by 60%. The AI optimization is incredible.',
      avatar: 'SC',
    },
    {
      name: 'Marcus Rodriguez',
      role: 'Lead Developer, StartupXYZ',
      content: 'The blockchain integration makes earning from our digital assets effortless. Best investment we made for our platform.',
      avatar: 'MR',
    },
    {
      name: 'Dr. Emily Watson',
      role: 'Research Director, DataLab',
      content: 'The analytics and insights provided by LightDom have revolutionized how we approach digital optimization.',
      avatar: 'EW',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between p-6 lg:px-8">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-primary flex items-center justify-center">
            <Zap className="h-5 w-5 text-on-primary" />
          </div>
          <span className="text-xl font-bold text-on-background">LightDom</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-body-md text-on-surface-variant hover:text-on-surface transition-colors">
            Sign In
          </Link>
          <Button asChild>
            <Link to="/login">Get Started</Link>
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-6 pt-14 pb-16 lg:px-8 lg:pt-20 lg:pb-24">
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8">
            <Star className="h-4 w-4 text-primary fill-current" />
            <span className="text-sm font-medium text-primary">Join 50K+ users optimizing their digital space</span>
          </div>

          <h1 className="text-display-lg font-bold tracking-tight text-on-background mb-6">
            Transform Your Website Into a
            <span className="block bg-gradient-primary bg-clip-text text-transparent">
              Profitable Asset
            </span>
          </h1>

          <p className="mt-6 text-xl text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
            LightDom harnesses AI and blockchain to optimize your unused DOM space,
            turning it into valuable digital assets while boosting your site's performance by up to 340%.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" asChild className="px-8 py-4 text-lg">
              <Link to="/login" className="flex items-center gap-2">
                Start Free Trial
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <Button variant="outlined" size="lg" asChild className="px-8 py-4 text-lg">
              <Link to="/login">Sign In to Dashboard</Link>
            </Button>
          </div>

          <p className="mt-6 text-sm text-on-surface-variant">
            No credit card required • 14-day free trial • Cancel anytime
          </p>
        </div>

        {/* Hero Visual */}
        <div className="mt-16 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-primary/20 blur-3xl rounded-full"></div>
            <Card className="relative p-8 bg-surface-container-high/80 backdrop-blur-sm border-surface-container-high">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                {stats.map((stat) => (
                  <div key={stat.label} className="flex flex-col items-center gap-2">
                    <div className="h-12 w-12 rounded-full bg-gradient-primary flex items-center justify-center">
                      <stat.icon className="h-6 w-6 text-on-primary" />
                    </div>
                    <div className="text-headline-sm font-bold text-on-surface">{stat.value}</div>
                    <div className="text-label-sm text-on-surface-variant">{stat.label}</div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 lg:py-24 px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-headline-lg font-bold text-on-background">
              Powerful Features for Modern Optimization
            </h2>
            <p className="mt-4 text-body-lg text-on-surface-variant max-w-2xl mx-auto">
              Discover how LightDom transforms your digital spaces into optimized, high-performance environments.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => (
              <Card key={feature.title} variant="elevated" className="h-full">
                <CardContent className="p-6 text-center">
                  <div className="h-12 w-12 mx-auto mb-4 rounded-full bg-gradient-primary flex items-center justify-center">
                    <feature.icon className="h-6 w-6 text-on-primary" />
                  </div>
                  <h3 className="text-title-lg font-semibold text-on-surface mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-body-md text-on-surface-variant">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 lg:py-24 px-6 lg:px-8 bg-surface-container-high/30">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-headline-lg font-bold text-on-background">
              Trusted by Industry Leaders
            </h2>
            <p className="mt-4 text-body-lg text-on-surface-variant">
              See how LightDom is transforming digital optimization for businesses worldwide
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.name} variant="elevated" className="h-full">
                <CardContent className="p-6">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-primary fill-current" />
                    ))}
                  </div>
                  <blockquote className="text-body-md text-on-surface-variant mb-6 italic">
                    "{testimonial.content}"
                  </blockquote>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-primary flex items-center justify-center text-on-primary font-semibold text-sm">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="font-semibold text-on-surface">{testimonial.name}</div>
                      <div className="text-sm text-on-surface-variant">{testimonial.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-body-lg text-on-surface-variant mb-6">
              Ready to join thousands of satisfied users?
            </p>
            <Button size="lg" asChild>
              <Link to="/login" className="flex items-center gap-2">
                Start Your Free Trial
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 lg:py-24 px-6 lg:px-8 bg-surface-container-high/50">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-headline-lg font-bold text-on-background">
              How LightDom Works
            </h2>
            <p className="mt-4 text-body-lg text-on-surface-variant">
              Simple steps to transform your digital spaces
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="h-16 w-16 mx-auto mb-6 rounded-full bg-gradient-primary flex items-center justify-center text-on-primary font-bold text-title-lg">
                1
              </div>
              <h3 className="text-title-lg font-semibold text-on-surface mb-3">
                Connect Your Spaces
              </h3>
              <p className="text-body-md text-on-surface-variant">
                Link your websites, applications, and digital assets to the LightDom network for analysis and optimization.
              </p>
            </div>

            <div className="text-center">
              <div className="h-16 w-16 mx-auto mb-6 rounded-full bg-gradient-primary flex items-center justify-center text-on-primary font-bold text-title-lg">
                2
              </div>
              <h3 className="text-title-lg font-semibold text-on-surface mb-3">
                AI-Powered Mining
              </h3>
              <p className="text-body-md text-on-surface-variant">
                Our advanced AI algorithms mine unused DOM space and identify optimization opportunities in real-time.
              </p>
            </div>

            <div className="text-center">
              <div className="h-16 w-16 mx-auto mb-6 rounded-full bg-gradient-primary flex items-center justify-center text-on-primary font-bold text-title-lg">
                3
              </div>
              <h3 className="text-title-lg font-semibold text-on-surface mb-3">
                Earn & Optimize
              </h3>
              <p className="text-body-md text-on-surface-variant">
                Convert optimized space into valuable tokens while enjoying improved performance and user experience.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24 px-6 lg:px-8 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5">
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-error/10 border border-error/20 mb-8">
            <TrendingUp className="h-4 w-4 text-error" />
            <span className="text-sm font-medium text-error">Limited Time: Free 14-day trial for new users</span>
          </div>

          <h2 className="text-headline-lg font-bold text-on-background mb-6">
            Don't Let Your Digital Space Go to Waste
          </h2>

          <p className="text-xl text-on-surface-variant mb-8 max-w-3xl mx-auto leading-relaxed">
            Join over 50,000 users who are already monetizing their websites and boosting performance.
            Start your free trial today and see the difference LightDom can make.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="flex flex-col items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-success" />
              </div>
              <h3 className="font-semibold text-on-surface">Free 14-Day Trial</h3>
              <p className="text-sm text-on-surface-variant">No credit card required</p>
            </div>
            <div className="flex flex-col items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-on-surface">Instant Setup</h3>
              <p className="text-sm text-on-surface-variant">Get started in minutes</p>
            </div>
            <div className="flex flex-col items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-secondary/10 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="font-semibold text-on-surface">Guaranteed Results</h3>
              <p className="text-sm text-on-surface-variant">340% average performance boost</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" asChild className="px-12 py-4 text-lg">
              <Link to="/login" className="flex items-center gap-2">
                Claim Your Free Trial
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <Button variant="outlined" size="lg" asChild className="px-8 py-4">
              <Link to="/login">Sign In to Existing Account</Link>
            </Button>
          </div>

          <p className="mt-6 text-sm text-on-surface-variant">
            ⚡ Setup takes less than 5 minutes • 📈 See results in 24 hours • 💰 Start earning immediately
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-outline py-12 px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-primary flex items-center justify-center">
                <Zap className="h-5 w-5 text-on-primary" />
              </div>
              <span className="text-lg font-bold text-on-background">LightDom</span>
            </div>
            <p className="text-body-sm text-on-surface-variant">
              © 2024 LightDom. Optimizing the digital universe, one space at a time.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
