import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  Zap,
  Coins,
  Lock,
  TrendingUp,
  Download,
  Chrome,
  Smartphone,
  CheckCircle2,
  ArrowRight,
  Wallet,
  Database,
  Globe,
  Users
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const [scrollY, setScrollY] = useState(0);
  const [currentDeviceImage, setCurrentDeviceImage] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Rotate device images
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDeviceImage((prev) => (prev + 1) % 3);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: <Wallet className="w-12 h-12" />,
      title: 'Secure Wallet',
      description: 'Your crypto is safe with industry-leading security and encrypted private keys.',
      color: 'from-blue-500 to-purple-600'
    },
    {
      icon: <Zap className="w-12 h-12" />,
      title: 'Lightning Fast',
      description: 'Experience instant transactions with optimized performance and low fees.',
      color: 'from-purple-500 to-pink-600'
    },
    {
      icon: <Coins className="w-12 h-12" />,
      title: 'LightDom Coin',
      description: 'Earn rewards with every transaction. Mine, stake, and grow your portfolio.',
      color: 'from-blue-500 to-cyan-600'
    },
    {
      icon: <Lock className="w-12 h-12" />,
      title: 'Privacy First',
      description: 'Your data, your control. Complete privacy with decentralized architecture.',
      color: 'from-indigo-500 to-purple-600'
    },
    {
      icon: <Database className="w-12 h-12" />,
      title: 'Decentralized Storage',
      description: 'Store your assets on a distributed network. Redundant, reliable, and secure.',
      color: 'from-cyan-500 to-blue-600'
    },
    {
      icon: <Globe className="w-12 h-12" />,
      title: 'Multi-Chain Support',
      description: 'Seamlessly interact with multiple blockchains from one unified interface.',
      color: 'from-purple-500 to-indigo-600'
    }
  ];

  const stats = [
    { value: '100K+', label: 'Active Users', icon: <Users className="w-6 h-6" /> },
    { value: '$50M+', label: 'Total Volume', icon: <TrendingUp className="w-6 h-6" /> },
    { value: '99.9%', label: 'Uptime', icon: <Shield className="w-6 h-6" /> },
    { value: '150+', label: 'Countries', icon: <Globe className="w-6 h-6" /> }
  ];

  const benefits = [
    'Non-custodial - You control your keys',
    'Open source and audited',
    'No KYC required',
    '24/7 customer support',
    'Built-in exchange',
    'Portfolio tracking'
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-exodus flex items-center justify-center">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold">LightDom</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/login" className="text-muted-foreground hover:text-foreground transition-colors">
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 bg-gradient-exodus rounded-lg font-semibold hover:opacity-90 transition-opacity"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-card to-background">
          <div className="absolute inset-0 opacity-20">
            {[...Array(30)].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full bg-gradient-exodus animate-float"
                style={{
                  width: Math.random() * 100 + 50 + 'px',
                  height: Math.random() * 100 + 50 + 'px',
                  left: Math.random() * 100 + '%',
                  top: Math.random() * 100 + '%',
                  animationDelay: Math.random() * 5 + 's',
                  opacity: Math.random() * 0.3 + 0.1,
                  filter: 'blur(40px)'
                }}
              />
            ))}
          </div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-card border border-border mb-8">
                <Shield className="w-4 h-4 text-primary" />
                <span className="text-sm">Trusted by 100,000+ users worldwide</span>
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
                Your crypto,
                <br />
                <span className="bg-gradient-exodus bg-clip-text text-transparent">
                  Your control
                </span>
              </h1>

              <p className="text-xl text-muted-foreground mb-8 max-w-2xl">
                LightDom is a beautiful, secure wallet for managing your cryptocurrency.
                Built for everyone from beginners to experts.
              </p>

              {/* Download Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <button className="group flex items-center justify-center space-x-2 px-6 py-4 bg-gradient-exodus rounded-xl font-semibold text-lg hover:opacity-90 transition-all hover:scale-105">
                  <Download className="w-5 h-5" />
                  <span>Download App</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button className="group flex items-center justify-center space-x-2 px-6 py-4 bg-card border-2 border-primary rounded-xl font-semibold text-lg hover:bg-card/80 transition-all hover:scale-105">
                  <Chrome className="w-5 h-5" />
                  <span>Chrome Extension</span>
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-xl bg-card border border-border hover:border-primary transition-colors"
                  >
                    <div className="text-primary mb-2">{stat.icon}</div>
                    <div className="text-2xl font-bold mb-1">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Content - Animated Device Showcase */}
            <div className="relative lg:h-[600px] flex items-center justify-center">
              <div className="relative w-full max-w-md">
                {/* Device Frame */}
                <div
                  className="relative transform transition-all duration-1000 animate-float"
                  style={{
                    transform: `perspective(1000px) rotateY(${scrollY * 0.05}deg) rotateX(${-scrollY * 0.02}deg)`
                  }}
                >
                  {/* Phone/Tablet Frame */}
                  <div className="relative mx-auto w-80 h-[600px] bg-card rounded-[3rem] border-8 border-border shadow-2xl overflow-hidden">
                    {/* Screen Content - Rotating Images */}
                    <div className="relative w-full h-full bg-gradient-to-b from-background to-card p-6">
                      {/* Demo Wallet UI */}
                      {currentDeviceImage === 0 && (
                        <div className="animate-fade-in space-y-6">
                          <div className="text-center space-y-2">
                            <div className="text-4xl font-bold">$45,290.50</div>
                            <div className="text-muted-foreground">Total Balance</div>
                          </div>
                          <div className="space-y-3">
                            <div className="p-4 bg-background rounded-xl border border-border flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-exodus" />
                                <div>
                                  <div className="font-semibold">LightDom Coin</div>
                                  <div className="text-sm text-muted-foreground">15,420 LDC</div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-semibold">$32,190</div>
                                <div className="text-sm text-green-500">+12.5%</div>
                              </div>
                            </div>
                            <div className="p-4 bg-background rounded-xl border border-border flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 rounded-full bg-orange-500" />
                                <div>
                                  <div className="font-semibold">Bitcoin</div>
                                  <div className="text-sm text-muted-foreground">0.25 BTC</div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-semibold">$13,100</div>
                                <div className="text-sm text-green-500">+8.2%</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Demo Staking UI */}
                      {currentDeviceImage === 1 && (
                        <div className="animate-fade-in space-y-6">
                          <div className="text-center space-y-2">
                            <div className="text-3xl font-bold">Earn Rewards</div>
                            <div className="text-muted-foreground">Stake your LightDom Coin</div>
                          </div>
                          <div className="p-6 bg-gradient-exodus rounded-2xl text-center space-y-4">
                            <div className="text-5xl font-bold">12.5%</div>
                            <div className="text-lg">Annual Percentage Yield</div>
                            <button className="w-full py-3 bg-white text-blue-600 rounded-xl font-semibold">
                              Start Staking
                            </button>
                          </div>
                          <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Your Stake</span>
                              <span className="font-semibold">5,000 LDC</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Daily Rewards</span>
                              <span className="font-semibold text-green-500">+1.7 LDC</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Demo Security UI */}
                      {currentDeviceImage === 2 && (
                        <div className="animate-fade-in space-y-6">
                          <div className="text-center space-y-2">
                            <div className="flex justify-center">
                              <div className="p-4 rounded-full bg-green-500/20">
                                <CheckCircle2 className="w-12 h-12 text-green-500" />
                              </div>
                            </div>
                            <div className="text-3xl font-bold">Fully Secured</div>
                            <div className="text-muted-foreground">Your wallet is protected</div>
                          </div>
                          <div className="space-y-3">
                            {['Encrypted Private Keys', 'Biometric Authentication', 'Multi-Signature Support', '2FA Enabled'].map(
                              (feature, i) => (
                                <div key={i} className="flex items-center space-x-3 p-3 bg-background rounded-xl border border-border">
                                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                                  <span>{feature}</span>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Device Notch */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-6 bg-border rounded-b-3xl" />
                  </div>

                  {/* Glow Effect */}
                  <div className="absolute inset-0 -z-10 bg-gradient-exodus blur-3xl opacity-30 animate-pulse" />
                </div>

                {/* Floating Elements */}
                <div className="absolute top-10 -left-10 w-20 h-20 bg-gradient-exodus rounded-2xl animate-float opacity-60" style={{ animationDelay: '0.5s' }} />
                <div className="absolute bottom-20 -right-10 w-16 h-16 bg-gradient-exodus rounded-full animate-float opacity-60" style={{ animationDelay: '1s' }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-card/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-4">
              Everything you need in one wallet
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed for crypto enthusiasts and newcomers alike
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group p-8 rounded-2xl bg-card border border-border hover:border-primary transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              >
                <div className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${feature.color} text-white mb-6 group-hover:scale-110 transition-transform`}>
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl lg:text-5xl font-bold mb-6">
                Why choose LightDom?
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                Join thousands of users who trust LightDom for their crypto needs.
                Experience the perfect balance of security, simplicity, and power.
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="p-8 rounded-3xl bg-gradient-exodus text-center space-y-6">
                <Coins className="w-20 h-20 mx-auto text-white animate-bounce-in" />
                <h3 className="text-3xl font-bold text-white">Start earning today</h3>
                <p className="text-white/90">
                  Download LightDom and get rewarded for every transaction.
                  Mine LightDom Coins while you browse.
                </p>
                <button className="w-full py-4 bg-white text-blue-600 rounded-xl font-semibold hover:bg-gray-100 transition-colors">
                  Get Started Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-exodus">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-white">
            Ready to take control of your crypto?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Download LightDom today and start your journey into decentralized finance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="group flex items-center justify-center space-x-2 px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-all hover:scale-105">
              <Smartphone className="w-5 h-5" />
              <span>Download for Desktop</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="group flex items-center justify-center space-x-2 px-8 py-4 bg-white/10 border-2 border-white text-white rounded-xl font-semibold text-lg hover:bg-white/20 transition-all hover:scale-105 backdrop-blur-sm">
              <Chrome className="w-5 h-5" />
              <span>Add to Chrome</span>
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-card border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-exodus flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold">LightDom</span>
              </div>
              <p className="text-muted-foreground text-sm">
                Your gateway to decentralized finance.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-muted-foreground text-sm">
                <li><a href="#" className="hover:text-primary transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Security</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Download</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Roadmap</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-muted-foreground text-sm">
                <li><a href="#" className="hover:text-primary transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">API</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Support</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-muted-foreground text-sm">
                <li><a href="#" className="hover:text-primary transition-colors">About</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Legal</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-border text-center text-muted-foreground text-sm">
            <p>2025 LightDom. All rights reserved. Your keys, your crypto.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
