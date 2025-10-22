import React from 'react';
import { Shield, Zap, Globe, CreditCard, Download, Star } from 'lucide-react';

interface LandingPageProps {
  onGetStarted?: () => void;
  onLogin?: () => void;
  onPricing?: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onPricing }) => {
  const handleGetStarted = () => {
    if (onGetStarted) onGetStarted();
    else window.location.pathname = '/register';
  };

  const handlePricing = () => {
    if (onPricing) onPricing();
    else window.location.pathname = '/pricing';
  };

  return (
    <div className="ld-landing-page">
      {/* subtle star field */}
      <div className="ld-star-field" />
      
      {/* Header */}
      <header className="ld-header">
        <div className="ld-header-brand">
          <div className="ld-logo" />
          <strong className="ld-brand-text">LightDom</strong>
        </div>
        <nav className="ld-header-nav">
          <button onClick={() => window.location.pathname = '/pricing'} className="ld-btn ld-btn--ghost">Pricing</button>
          <button onClick={() => window.location.pathname = '/login'} className="ld-btn ld-btn--outline">Sign in</button>
          <button onClick={handleGetStarted} className="ld-btn ld-btn--primary ld-btn--lg">
            Download for Windows
            <Download size={16} />
          </button>
        </nav>
      </header>

      {/* Hero */}
      <section className="ld-hero">
        <div className="ld-hero-container">
          <div className="ld-badge">
            <Star size={14} />
            Trusted by builders since 2015
          </div>
          <h1 className="ld-hero-title">
            <span className="ld-hero-title-primary">Bitcoin and crypto </span>
            <span className="ld-hero-title-secondary">wallet</span>
          </h1>
          <p className="ld-hero-description">
            Seamless, secure, self‑custodial. Swap, buy, and manage a diverse portfolio in one place.
          </p>
          <div className="ld-hero-actions">
            <button onClick={handleGetStarted} className="ld-btn ld-btn--primary ld-btn--lg ld-btn--glow">
              <Download size={18} />
              Download for Windows
            </button>
            <div className="ld-hero-subtitle">Available on other devices</div>
          </div>
          
          {/* device mock */}
          <div className="ld-hero-devices">
            <div className="ld-hero-glow" />
            <div className="ld-device-grid">
              <div className="ld-device-desktop" />
              <div className="ld-device-mobile" />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="ld-features">
        <div className="ld-features-container">
          {[
            { icon: <Zap size={18} />, title: 'Real Optimization', desc: 'Analyze and compress DOM intelligently for measurable space savings.' },
            { icon: <Globe size={18} />, title: 'Bridged Space', desc: 'Bridge optimized space across chains with on‑chain proofs.' },
            { icon: <Shield size={18} />, title: 'Enterprise Security', desc: 'Role‑based access, audits, and governance-ready events.' }
          ].map((f) => (
            <div key={f.title} className="ld-feature-card">
              <div className="ld-feature-icon">{f.icon}</div>
              <div className="ld-feature-title">{f.title}</div>
              <div className="ld-feature-description">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="ld-pricing">
        <div className="ld-pricing-container">
          <div className="ld-pricing-header">
            <h2 className="ld-pricing-title">Pricing</h2>
            <button onClick={handlePricing} className="ld-btn ld-btn--outline">
              <CreditCard size={16} />
              Compare plans
            </button>
          </div>
          <div className="ld-pricing-grid">
            {[
              { name: 'Starter', price: '$0', features: ['1,000 optimizations', 'Basic analytics', 'Email support'] },
              { name: 'Pro', price: '$29', features: ['10,000 optimizations', 'Advanced analytics', 'Priority support', 'API access'] },
              { name: 'Enterprise', price: 'Contact', features: ['Unlimited optimizations', 'Custom analytics', '24/7 support', 'Advanced API', 'Custom integrations'] }
            ].map((p, i) => (
              <div key={p.name} className={`ld-pricing-card ${i === 1 ? 'ld-pricing-card--featured' : ''}`}>
                <div className="ld-pricing-card-name">{p.name}</div>
                <div className="ld-pricing-card-price">
                  {p.price}
                  <span className="ld-pricing-card-period">{p.price === 'Contact' ? '' : '/mo'}</span>
                </div>
                <ul className="ld-pricing-card-features">
                  {p.features.map(f => (<li key={f} className="ld-pricing-card-feature">{f}</li>))}
                </ul>
                <button onClick={handleGetStarted} className="ld-btn ld-btn--primary ld-btn--full">
                  Get started
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="ld-footer">
        <div className="ld-footer-container">
          <div className="ld-footer-copyright">© {new Date().getFullYear()} LightDom. All rights reserved.</div>
          <div className="ld-footer-links">
            <a href="#" className="ld-footer-link">Privacy</a>
            <a href="#" className="ld-footer-link">Terms</a>
            <a href="#" className="ld-footer-link">Security</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;


