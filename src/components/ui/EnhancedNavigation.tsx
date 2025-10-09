/**
 * Enhanced Navigation Component (rail + panel)
 */

import React, { useEffect, useMemo, useState } from 'react';
import { useEnhancedAuth } from '../../contexts/EnhancedAuthContext';
import { 
  Home, Settings, Wallet, Zap, Globe, Database, FlaskConical as TestTube, Workflow, Cpu,
  Lock, Users, CreditCard, Crown, LogOut, ChevronLeft, ChevronRight, MailPlus, Bell,
  Rocket, BarChart3, Bug, Server, ShieldCheck
} from 'lucide-react';

interface NavigationProps {
  currentPath?: string;
  onNavigate?: (path: string) => void;
}

const NAV_WIDTH_RAIL = 64;
const NAV_WIDTH_PANEL = 280;

const EnhancedNavigation: React.FC<NavigationProps> = ({ currentPath = window.location.pathname, onNavigate }) => {
  const { user, isAuthenticated, logout } = useEnhancedAuth();
  const [expanded, setExpanded] = useState(true);
  const [serviceStatus, setServiceStatus] = useState<{ api: boolean; crawler: boolean; optimization: boolean; blockchain: boolean }>({ api: false, crawler: false, optimization: false, blockchain: false });

  useEffect(() => {
    let mounted = true;
    const probe = async () => {
      const ok = async (url: string) => fetch(url, { method: 'GET' }).then(r => r.ok).catch(() => false);
      const api = await ok('/api/health');
      const crawler = await ok('/api/crawler/status');
      const mining = await ok('/api/mining/stats');
      if (mounted) setServiceStatus({ api, crawler, optimization: api, blockchain: mining });
    };
    probe();
    const id = setInterval(probe, 10000);
    return () => { mounted = false; clearInterval(id); };
  }, []);

  const items = useMemo(() => {
    const all = [
      { path: '/', label: 'Dashboard', icon: Home, plans: ['free','pro','enterprise','admin'] },
      { path: '/optimization', label: 'Optimization', icon: Zap, plans: ['free','pro','enterprise','admin'] },
      { path: '/space-mining', label: 'Space Mining', icon: Rocket, plans: ['pro','enterprise','admin'] },
      { path: '/analytics', label: 'Analytics', icon: BarChart3, plans: ['pro','enterprise','admin'] },
      { path: '/harvester', label: 'Web Crawler', icon: Globe, plans: ['pro','enterprise','admin'] },
      { path: '/advanced-nodes', label: 'Advanced Nodes', icon: Cpu, plans: ['enterprise','admin'] },
      { path: '/blockchain-models', label: 'Blockchain Models', icon: Database, plans: ['enterprise','admin'] },
      { path: '/workflow-simulation', label: 'Workflow Simulation', icon: Workflow, plans: ['enterprise','admin'] },
      { path: '/wallet', label: 'Wallet', icon: Wallet, plans: ['free','pro','enterprise','admin'] },
      { path: '/metaverse', label: 'Metaverse', icon: Globe, plans: ['pro','enterprise','admin'] },
      { path: '/settings', label: 'Settings', icon: Settings, plans: ['free','pro','enterprise','admin'] },
    ] as Array<{path:string,label:string,icon:any,plans:string[]}>
    if (user?.role === 'admin') return all;
    const plan = user?.subscription?.plan || 'free';
    return all.filter(i => i.plans.includes(plan));
  }, [user]);

  const navigate = (path: string) => {
    if (onNavigate) onNavigate(path); else window.location.pathname = path;
  };

  return (
    <aside style={{ position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 120, display: 'flex', width: expanded ? NAV_WIDTH_RAIL + NAV_WIDTH_PANEL : NAV_WIDTH_RAIL }}>
      {/* Rail */}
      <div style={{ width: NAV_WIDTH_RAIL, background: '#0f172a', color: 'rgba(255,255,255,0.9)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', padding: '12px 8px', boxShadow: '2px 0 8px rgba(0,0,0,.3)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#7c3aed,#3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>LD</div>
            {items.slice(0,4).map(it => {
            const Icon = it.icon as any;
            const active = currentPath === it.path;
            return (
              <button key={it.path} title={it.label} onClick={() => navigate(it.path)}
                style={{ width: 40, height: 40, borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)', background: active? 'rgba(24,144,255,.25)':'rgba(255,255,255,.04)', color: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <Icon size={18} />
              </button>
            );
          })}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <div title={`API: ${serviceStatus.api ? 'Operational':'Down'}`} style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.85)' }}>
            <span style={{ width: 8, height: 8, borderRadius: 9999, boxShadow: '0 0 8px currentColor', color: serviceStatus.api? '#22c55e':'#ef4444' }} />
            <Server size={14} />
          </div>
          <div title={`Crawler: ${serviceStatus.crawler ? 'Operational':'Down'}`} style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.85)' }}>
            <span style={{ width: 8, height: 8, borderRadius: 9999, boxShadow: '0 0 8px currentColor', color: serviceStatus.crawler? '#22c55e':'#ef4444' }} />
            <Bug size={14} />
          </div>
          <div title={`Optimization: ${serviceStatus.optimization ? 'Operational':'Down'}`} style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.85)' }}>
            <span style={{ width: 8, height: 8, borderRadius: 9999, boxShadow: '0 0 8px currentColor', color: serviceStatus.optimization? '#22c55e':'#ef4444' }} />
            <ShieldCheck size={14} />
              </div>
          <div title={`Blockchain: ${serviceStatus.blockchain ? 'Operational':'Down'}`} style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.85)' }}>
            <span style={{ width: 8, height: 8, borderRadius: 9999, boxShadow: '0 0 8px currentColor', color: serviceStatus.blockchain? '#22c55e':'#ef4444' }} />
            <Wallet size={14} />
          </div>
          <button onClick={() => setExpanded(e => !e)} title={expanded ? 'Collapse':'Expand'}
            style={{ width: 40, height: 40, borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,.04)', color: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            {expanded ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>
        </div>
      </div>

      {/* Panel */}
      {expanded && (
        <div style={{ width: NAV_WIDTH_PANEL, background: '#0b1220', color: '#e6e8ef', display: 'flex', flexDirection: 'column', borderLeft: '1px solid #0a1a30' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #0a1a30', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg,#7c3aed,#3b82f6)' }} />
              <strong>LightDom</strong>
            </div>
            <Bell size={16} color="#9aa3ba" />
                  </div>
          <div style={{ padding: '12px 16px' }}>
            <button style={{ width: '100%', height: 40, borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,.05)', color: '#e6e8ef', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer' }}>
              <MailPlus size={16} /> New Message
          </button>
            <button onClick={() => (window as any).electronAPI?.restartApp?.()} style={{ marginTop: 8, width: '100%', height: 36, borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(239,68,68,.12)', color: '#fecaca', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer' }}>
              Restart App
              </button>
            </div>
          <nav style={{ padding: '8px 8px 0 8px', overflowY: 'auto' }}>
            {items.map(it => {
              const Icon = it.icon as any;
              const active = currentPath === it.path;
            return (
                <button key={it.path} onClick={() => navigate(it.path)}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', margin: '2px 4px', borderRadius: 8, background: active? 'rgba(24,144,255,.15)':'transparent', color: active? '#fff':'#cbd5e1', border: '1px solid transparent', textAlign: 'left', cursor: 'pointer' }}>
                  <Icon size={18} />
                  <span style={{ flex: 1 }}>{it.label}</span>
                </button>
            );
          })}
      </nav>
          <div style={{ marginTop: 'auto', padding: '12px 16px', borderTop: '1px solid #0a1a30', color: '#9aa3ba', fontSize: 12 }}>
            {isAuthenticated ? (
              <button onClick={() => { logout(); navigate('/'); }} style={{ background: 'transparent', border: 'none', color: '#9aa3ba', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <LogOut size={14} /> Logout
              </button>
            ) : (
              <span>Welcome</span>
            )}
          </div>
        </div>
      )}
    </aside>
  );
};

export default EnhancedNavigation;
