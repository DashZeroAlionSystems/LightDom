import React from 'react';
import { ArrowRight, Shield, Zap, Globe, Cpu, CreditCard, Download, Star } from 'lucide-react';
import design from '../../styles/design-system';

interface LandingPageProps {
  onGetStarted?: () => void;
  onLogin?: () => void;
  onPricing?: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onLogin, onPricing }) => {
  const theme = design?.theme ?? {} as any;

  const handleGetStarted = () => {
    if (onGetStarted) onGetStarted();
    else window.location.pathname = '/register';
  };

  const handleLogin = () => {
    if (onLogin) onLogin();
    else window.location.pathname = '/login';
  };

  const handlePricing = () => {
    if (onPricing) onPricing();
    else window.location.pathname = '/pricing';
  };

  return (
    <div style={{ position: 'relative', background: 'radial-gradient(900px 500px at 50% -10%, rgba(124,58,237,0.35), rgba(0,0,0,0)) , radial-gradient(700px 380px at 50% 15%, rgba(56,189,248,0.18), rgba(0,0,0,0)) , #070b14', color: '#e6e8ef', minHeight: '100vh' }}>
      {/* subtle star field */}
      <div style={{ pointerEvents: 'none', position: 'absolute', inset: 0, background: 'radial-gradient(2px 2px at 20% 30%, rgba(255,255,255,0.15), transparent 60%), radial-gradient(1.5px 1.5px at 70% 40%, rgba(255,255,255,0.12), transparent 60%), radial-gradient(1.5px 1.5px at 35% 70%, rgba(255,255,255,0.12), transparent 60%)' }} />
      {/* Header */}
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 6, background: 'linear-gradient(135deg, #5ee7df 0%, #b490ca 100%)' }} />
          <strong style={{ letterSpacing: 0.4 }}>LightDom</strong>
        </div>
        <nav style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button onClick={() => window.location.pathname = '/pricing'} style={{ background: 'transparent', border: 'none', color: '#b8bfd4', cursor: 'pointer' }}>Pricing</button>
          <button onClick={() => window.location.pathname = '/login'} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', color: '#e6e8ef', borderRadius: 8, padding: '8px 14px', cursor: 'pointer' }}>Sign in</button>
          <button onClick={handleGetStarted} style={{ background: 'linear-gradient(135deg,#7c3aed,#3b82f6)', border: 'none', color: '#fff', fontWeight: 700, borderRadius: 10, padding: '10px 16px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8, boxShadow: '0 8px 24px rgba(59,130,246,0.35)' }}>
            Download for Windows
            <Download size={16} />
          </button>
        </nav>
      </header>

      {/* Hero */}
      <section style={{ padding: '88px 24px 48px' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 10px', borderRadius: 999, background: 'rgba(255,255,255,0.06)', color: '#cdd3ea', fontSize: 12 }}>
            <Star size={14} /> Trusted by builders since 2015
          </div>
          <h1 style={{ fontSize: 56, lineHeight: 1.05, margin: '16px 0 8px', letterSpacing: -0.5 }}>
            <span style={{ background: 'linear-gradient(90deg,#ffffff,#c7d2fe)', WebkitBackgroundClip: 'text', color: 'transparent' }}>Bitcoin and crypto </span>
            <span style={{ background: 'linear-gradient(90deg,#c7d2fe,#a78bfa)', WebkitBackgroundClip: 'text', color: 'transparent' }}>wallet</span>
          </h1>
          <p style={{ maxWidth: 640, margin: '0 auto', color: '#b8bfd4' }}>
            Seamless, secure, self‑custodial. Swap, buy, and manage a diverse portfolio in one place.
          </p>
          <div style={{ marginTop: 18 }}>
            <button onClick={handleGetStarted} style={{ background: 'linear-gradient(135deg,#7c3aed,#3b82f6)', border: 'none', color: '#fff', fontWeight: 800, borderRadius: 12, padding: '12px 18px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8, boxShadow: '0 12px 30px rgba(124,58,237,0.35)' }}>
              <Download size={18} /> Download for Windows
            </button>
            <div style={{ marginTop: 6, fontSize: 12, color: '#96a0bf' }}>Available on other devices</div>
          </div>
          {/* device mock */}
          <div style={{ marginTop: 36, position: 'relative' }}>
            <div style={{ position: 'absolute', inset: -40, background: 'radial-gradient(380px 160px at 50% 20%, rgba(124,58,237,0.35), rgba(0,0,0,0))' }} />
            <div style={{ display: 'inline-grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 16, alignItems: 'end' }}>
              <div style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'linear-gradient(180deg,#0d1222,#0a0f1e)', borderRadius: 16, height: 260, width: 520 }} />
              <div style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'linear-gradient(180deg,#0d1222,#0a0f1e)', borderRadius: 24, height: 220, width: 220 }} />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '48px 24px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {[{ icon: <Zap size={18} />, title: 'Real Optimization', desc: 'Analyze and compress DOM intelligently for measurable space savings.' }, { icon: <Globe size={18} />, title: 'Bridged Space', desc: 'Bridge optimized space across chains with on‑chain proofs.' }, { icon: <Shield size={18} />, title: 'Enterprise Security', desc: 'Role‑based access, audits, and governance-ready events.' }].map((f) => (
            <div key={f.title} style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 18, background: 'rgba(18,22,36,0.55)' }}>
              <div style={{ color: '#aab3cf' }}>{f.icon}</div>
              <div style={{ fontWeight: 700, marginTop: 8 }}>{f.title}</div>
              <div style={{ color: '#aab3cf', marginTop: 6, lineHeight: 1.5 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section style={{ padding: '32px 24px 64px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 style={{ margin: 0, fontSize: 28 }}>Pricing</h2>
            <button onClick={handlePricing} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.16)', color: '#e6e8ef', borderRadius: 10, padding: '10px 16px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <CreditCard size={16} />
              Compare plans
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
            {[{ name: 'Starter', price: '$0', features: ['1,000 optimizations', 'Basic analytics', 'Email support'] }, { name: 'Pro', price: '$29', features: ['10,000 optimizations', 'Advanced analytics', 'Priority support', 'API access'] }, { name: 'Enterprise', price: 'Contact', features: ['Unlimited optimizations', 'Custom analytics', '24/7 support', 'Advanced API', 'Custom integrations'] }].map((p, i) => (
              <div key={p.name} style={{ border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: 18, background: i === 1 ? 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(110,231,183,0.12))' : 'rgba(18,22,36,0.55)' }}>
                <div style={{ fontSize: 18, fontWeight: 700 }}>{p.name}</div>
                <div style={{ fontSize: 28, fontWeight: 800, marginTop: 8 }}>{p.price}<span style={{ fontSize: 14, color: '#9aa3ba' }}>{p.price === 'Contact' ? '' : '/mo'}</span></div>
                <ul style={{ marginTop: 10, paddingLeft: 18, color: '#aab3cf' }}>
                  {p.features.map(f => (<li key={f} style={{ marginBottom: 6 }}>{f}</li>))}
                </ul>
                <button onClick={handleGetStarted} style={{ marginTop: 10, width: '100%', background: 'linear-gradient(135deg, #6ee7b7, #3b82f6)', border: 'none', color: '#0b1020', fontWeight: 700, borderRadius: 10, padding: '10px 14px', cursor: 'pointer' }}>
                  Get started
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '24px', borderTop: '1px solid rgba(255,255,255,0.06)', color: '#9aa3ba' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>© {new Date().getFullYear()} LightDom. All rights reserved.</div>
          <div style={{ display: 'flex', gap: 16 }}>
            <a href="#" style={{ color: '#9aa3ba', textDecoration: 'none' }}>Privacy</a>
            <a href="#" style={{ color: '#9aa3ba', textDecoration: 'none' }}>Terms</a>
            <a href="#" style={{ color: '#9aa3ba', textDecoration: 'none' }}>Security</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;


