/**
 * Discord-Style Dashboard for LightDom Space Harvester
 * Modern Discord-inspired UI with dark theme and clean layout
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Activity, 
  Cpu, 
  HardDrive, 
  Zap, 
  Globe, 
  TrendingUp, 
  Award, 
  Settings, 
  Play, 
  Pause, 
  RotateCcw, 
  Database, 
  Network, 
  Link, 
  Search, 
  Map, 
  Brain, 
  Layers,
  BarChart3,
  PieChart,
  Target,
  Coins,
  Landmark,
  Server,
  Bridge,
  Star,
  Users,
  MessageSquare,
  Hash,
  Bell,
  Mic,
  Headphones,
  Volume2,
  Monitor,
  Smartphone,
  Gamepad2,
  Plus,
  MoreHorizontal,
  Pin,
  Inbox,
  HelpCircle,
  Crown,
  Shield
} from 'lucide-react';
import { DiscordButton, DiscordCard, DiscordCollapsible, DiscordModal, DiscordToast, DiscordProgressBar } from './DiscordComponents';

interface OptimizationResult {
  id: string;
  url: string;
  spaceSavedKB: number;
  tokensEarned: number;
  biomeType: string;
  optimizationType: string;
  qualityScore: number;
  timestamp: number;
  harvesterAddress: string;
  metaverseAssets: number;
}

interface HarvesterStats {
  address: string;
  totalOptimizations: number;
  totalSpaceSaved: number;
  totalTokensEarned: number;
  rank: number;
  efficiency: number;
  lastActive: number;
}

interface DiscordStyleDashboardProps {
  className?: string;
}

const DiscordStyleDashboard: React.FC<DiscordStyleDashboardProps> = ({ className = '' }) => {
  const [optimizations, setOptimizations] = useState<OptimizationResult[]>([]);
  const [harvesterStats, setHarvesterStats] = useState<HarvesterStats | null>(null);
  const [isCrawling, setIsCrawling] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [notificationCount, setNotificationCount] = useState(3);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [toasts, setToasts] = useState<Array<{id: string, message: string, type: 'success' | 'error' | 'warning' | 'info'}>>([]);
  const [userStatus, setUserStatus] = useState<'online' | 'idle' | 'dnd' | 'offline'>('online');

  const socketRef = useRef<WebSocket | null>(null);

  // Mock data for demonstration
  useEffect(() => {
    const mockOptimizations: OptimizationResult[] = [
      {
        id: '1',
        url: 'https://example.com',
        spaceSavedKB: 1250,
        tokensEarned: 45,
        biomeType: 'Digital Forest',
        optimizationType: 'CSS Cleanup',
        qualityScore: 95,
        timestamp: Date.now() - 300000,
        harvesterAddress: '0x1234...5678',
        metaverseAssets: 12
      },
      {
        id: '2',
        url: 'https://test-site.com',
        spaceSavedKB: 890,
        tokensEarned: 32,
        biomeType: 'Code Canyon',
        optimizationType: 'JS Optimization',
        qualityScore: 88,
        timestamp: Date.now() - 600000,
        harvesterAddress: '0x1234...5678',
        metaverseAssets: 8
      }
    ];

    const mockStats: HarvesterStats = {
      address: '0x1234...5678',
      totalOptimizations: 1247,
      totalSpaceSaved: 456789,
      totalTokensEarned: 12345,
      rank: 42,
      efficiency: 94.5,
      lastActive: Date.now() - 120000
    };

    setOptimizations(mockOptimizations);
    setHarvesterStats(mockStats);
  }, []);

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'var(--discord-success)';
      case 'warning': return 'var(--discord-warning)';
      case 'error': return 'var(--discord-danger)';
      default: return 'var(--discord-text-muted)';
    }
  };

  const addToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const getStatusIcon = (status: 'online' | 'idle' | 'dnd' | 'offline') => {
    switch (status) {
      case 'online': return <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--discord-success)' }} />;
      case 'idle': return <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--discord-warning)' }} />;
      case 'dnd': return <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--discord-danger)' }} />;
      case 'offline': return <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--discord-text-muted)' }} />;
    }
  };

  const ServerIcon = ({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) => (
    <div className={`discord-server-icon ${active ? 'active' : ''}`} title={label}>
      {icon}
    </div>
  );

  const SidebarItem = ({ icon, label, active = false, badge = 0, onClick }: {
    icon: React.ReactNode;
    label: string;
    active?: boolean;
    badge?: number;
    onClick?: () => void;
  }) => (
    <div 
      className={`discord-sidebar-item ${active ? 'active' : ''}`}
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--discord-spacing-sm)',
        padding: 'var(--discord-spacing-sm) var(--discord-spacing-md)',
        cursor: 'pointer',
        borderRadius: 'var(--discord-radius-sm)',
        margin: '2px var(--discord-spacing-sm)',
        backgroundColor: active ? 'var(--discord-hover-bg)' : 'transparent',
        transition: 'all 0.2s ease'
      }}
    >
      <div style={{ fontSize: '20px' }}>{icon}</div>
      <span style={{ fontSize: '14px', fontWeight: '500' }}>{label}</span>
      {badge > 0 && (
        <div style={{
          backgroundColor: 'var(--discord-danger)',
          color: 'white',
          borderRadius: '50%',
          width: '20px',
          height: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '12px',
          fontWeight: '600',
          marginLeft: 'auto'
        }}>
          {badge}
        </div>
      )}
    </div>
  );

  return (
    <div className={`discord-app ${className}`}>
      {/* Server List */}
      <div className="discord-server-list">
        <ServerIcon icon={<Zap size={24} />} label="LightDom" active />
        <ServerIcon icon={<Globe size={24} />} label="Web Crawler" />
        <ServerIcon icon={<Database size={24} />} label="Database" />
        <ServerIcon icon={<Network size={24} />} label="Blockchain" />
        <div style={{ 
          width: '32px', 
          height: '2px', 
          backgroundColor: 'var(--discord-border)', 
          borderRadius: '1px',
          margin: 'var(--discord-spacing-sm) 0'
        }} />
        <ServerIcon icon={<Settings size={24} />} label="Settings" />
        <ServerIcon icon={<Plus size={24} />} label="Add Server" />
      </div>

      {/* Sidebar */}
      <div className="discord-sidebar">
        <div style={{
          padding: 'var(--discord-spacing-md)',
          borderBottom: '1px solid var(--discord-border)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--discord-spacing-sm)'
        }}>
          <Hash size={20} />
          <span style={{ fontWeight: '600', fontSize: '16px' }}>lightdom-space</span>
        </div>

        <div style={{ padding: 'var(--discord-spacing-sm) 0', flex: 1 }}>
          <SidebarItem 
            icon={<Activity size={20} />} 
            label="Dashboard" 
            active={currentView === 'dashboard'}
            onClick={() => setCurrentView('dashboard')}
          />
          <SidebarItem 
            icon={<Globe size={20} />} 
            label="Crawler" 
            badge={notificationCount}
            onClick={() => setCurrentView('crawler')}
          />
          <SidebarItem 
            icon={<Network size={20} />} 
            label="Blockchain" 
            onClick={() => setCurrentView('blockchain')}
          />
          <SidebarItem 
            icon={<Database size={20} />} 
            label="Database" 
            onClick={() => setCurrentView('database')}
          />
          <SidebarItem 
            icon={<Map size={20} />} 
            label="Metaverse" 
            onClick={() => setCurrentView('metaverse')}
          />
          <SidebarItem 
            icon={<Star size={20} />} 
            label="Space Mining" 
            onClick={() => window.location.href = '/space-mining'}
          />
          <SidebarItem 
            icon={<BarChart3 size={20} />} 
            label="Analytics" 
            onClick={() => setCurrentView('analytics')}
          />
        </div>

        <div style={{
          padding: 'var(--discord-spacing-sm)',
          borderTop: '1px solid var(--discord-border)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--discord-spacing-sm)',
          cursor: 'pointer',
          transition: 'background-color 0.2s ease'
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--discord-hover-bg)'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        onClick={() => setShowSettingsModal(true)}
        >
          <div style={{ position: 'relative' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: 'var(--discord-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              fontWeight: '600'
            }}>
              LD
            </div>
            <div style={{
              position: 'absolute',
              bottom: '-2px',
              right: '-2px',
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: 'var(--discord-bg-secondary)',
              border: '2px solid var(--discord-bg-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {getStatusIcon(userStatus)}
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '14px', fontWeight: '500' }}>LightDom Harvester</div>
            <div style={{ fontSize: '12px', color: 'var(--discord-text-muted)' }}>#{Math.floor(Math.random() * 9999)}</div>
          </div>
          <div style={{ display: 'flex', gap: 'var(--discord-spacing-xs)' }}>
            <Mic size={16} style={{ cursor: 'pointer', opacity: 0.7 }} title="Microphone" />
            <Headphones size={16} style={{ cursor: 'pointer', opacity: 0.7 }} title="Voice Settings" />
            <Settings size={16} style={{ cursor: 'pointer', opacity: 0.7 }} title="User Settings" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="discord-main">
        {/* Header */}
        <div className="discord-header">
          <div className="discord-flex discord-items-center discord-gap-md">
            <Hash size={24} />
            <span className="discord-header-title">
              {currentView === 'dashboard' && 'Dashboard'}
              {currentView === 'crawler' && 'Web Crawler'}
              {currentView === 'blockchain' && 'Blockchain'}
              {currentView === 'database' && 'Database'}
              {currentView === 'metaverse' && 'Metaverse'}
              {currentView === 'analytics' && 'Analytics'}
            </span>
          </div>
          <div className="discord-flex discord-items-center discord-gap-sm" style={{ marginLeft: 'auto' }}>
            <div className="discord-status">
              <div className="discord-status-dot discord-status-online" />
              <span>Online</span>
            </div>
            <Bell size={20} style={{ cursor: 'pointer', opacity: 0.7 }} />
            <Search size={20} style={{ cursor: 'pointer', opacity: 0.7 }} />
          </div>
        </div>

        {/* Content */}
        <div className="discord-content discord-scrollbar">
          {currentView === 'dashboard' && (
            <div className="discord-fade-in">
              <div className="dashboard-grid">
                {/* Stats Cards */}
                <div className="metric-card">
                  <div className="discord-flex discord-items-center discord-gap-sm discord-mb-sm">
                    <Activity size={20} style={{ color: 'var(--discord-primary)' }} />
                    <span className="metric-label">Active Optimizations</span>
                  </div>
                  <div className="metric-value">{optimizations.length}</div>
                </div>

                <div className="metric-card">
                  <div className="discord-flex discord-items-center discord-gap-sm discord-mb-sm">
                    <HardDrive size={20} style={{ color: 'var(--discord-success)' }} />
                    <span className="metric-label">Space Saved</span>
                  </div>
                  <div className="metric-value">{formatBytes(harvesterStats?.totalSpaceSaved || 0)}</div>
                </div>

                <div className="metric-card">
                  <div className="discord-flex discord-items-center discord-gap-sm discord-mb-sm">
                    <Coins size={20} style={{ color: 'var(--discord-warning)' }} />
                    <span className="metric-label">Tokens Earned</span>
                  </div>
                  <div className="metric-value">{harvesterStats?.totalTokensEarned.toLocaleString() || 0}</div>
                </div>

                <div className="metric-card">
                  <div className="discord-flex discord-items-center discord-gap-sm discord-mb-sm">
                    <Award size={20} style={{ color: 'var(--discord-info)' }} />
                    <span className="metric-label">Rank</span>
                  </div>
                  <div className="metric-value">#{harvesterStats?.rank || 0}</div>
                </div>
              </div>

              {/* Control Panel */}
              <div className="discord-card discord-mb-lg">
                <div className="discord-card-header">
                  <h3 className="discord-card-title">Crawler Control</h3>
                  <div className="discord-flex discord-gap-sm">
                    <DiscordButton
                      variant={isCrawling ? 'danger' : 'success'}
                      onClick={() => {
                        setIsCrawling(!isCrawling);
                        addToast(
                          isCrawling ? 'Crawler stopped' : 'Crawler started',
                          isCrawling ? 'warning' : 'success'
                        );
                      }}
                    >
                      {isCrawling ? <Pause size={16} /> : <Play size={16} />}
                      {isCrawling ? 'Stop' : 'Start'} Crawling
                    </DiscordButton>
                    <DiscordButton
                      variant="secondary"
                      onClick={() => {
                        addToast('System reset', 'info');
                      }}
                    >
                      <RotateCcw size={16} />
                      Reset
                    </DiscordButton>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="discord-card discord-mb-lg">
                <div className="discord-card-header">
                  <h3 className="discord-card-title">Quick Actions</h3>
                </div>
                <div className="discord-p-md">
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--discord-spacing-md)' }}>
                    <DiscordButton
                      variant="primary"
                      onClick={() => window.location.href = '/space-mining'}
                      style={{ display: 'flex', alignItems: 'center', gap: 'var(--discord-spacing-sm)', justifyContent: 'flex-start' }}
                    >
                      <Star size={16} />
                      Space Mining Dashboard
                    </DiscordButton>
                    <DiscordButton
                      variant="secondary"
                      onClick={() => window.location.href = '/metaverse-mining'}
                      style={{ display: 'flex', alignItems: 'center', gap: 'var(--discord-spacing-sm)', justifyContent: 'flex-start' }}
                    >
                      <Map size={16} />
                      Metaverse Mining
                    </DiscordButton>
                    <DiscordButton
                      variant="secondary"
                      onClick={() => window.location.href = '/optimization'}
                      style={{ display: 'flex', alignItems: 'center', gap: 'var(--discord-spacing-sm)', justifyContent: 'flex-start' }}
                    >
                      <TrendingUp size={16} />
                      Space Optimization
                    </DiscordButton>
                    <DiscordButton
                      variant="secondary"
                      onClick={() => window.location.href = '/wallet'}
                      style={{ display: 'flex', alignItems: 'center', gap: 'var(--discord-spacing-sm)', justifyContent: 'flex-start' }}
                    >
                      <Coins size={16} />
                      Wallet Dashboard
                    </DiscordButton>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="discord-card">
                <div className="discord-card-header">
                  <h3 className="discord-card-title">Recent Optimizations</h3>
                </div>
                <div className="activity-feed">
                  {optimizations.map((opt) => (
                    <div key={opt.id} className="activity-item">
                      <div 
                        className="activity-icon"
                        style={{ backgroundColor: getStatusColor('online') }}
                      >
                        <Zap size={16} />
                      </div>
                      <div className="activity-content">
                        <div className="activity-title">
                          Optimized {opt.url}
                        </div>
                        <div className="activity-description">
                          {formatBytes(opt.spaceSavedKB * 1024)} saved • {opt.tokensEarned} tokens earned
                        </div>
                      </div>
                      <div className="activity-time">
                        {formatTime(opt.timestamp)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentView === 'crawler' && (
            <div className="discord-fade-in">
              <div className="discord-card">
                <div className="discord-card-header">
                  <h3 className="discord-card-title">Web Crawler Status</h3>
                  <div className="discord-status">
                    <div className="discord-status-dot discord-status-online" />
                    <span>Active</span>
                  </div>
                </div>
                <div className="discord-p-md">
                  <p className="discord-text-secondary">Crawler is actively scanning websites for optimization opportunities.</p>
                </div>
              </div>
            </div>
          )}

          {currentView === 'blockchain' && (
            <div className="discord-fade-in">
              <div className="discord-card">
                <div className="discord-card-header">
                  <h3 className="discord-card-title">Blockchain Status</h3>
                  <div className="discord-status">
                    <div className="discord-status-dot discord-status-online" />
                    <span>Connected</span>
                  </div>
                </div>
                <div className="discord-p-md">
                  <p className="discord-text-secondary">Blockchain network is connected and mining operations are active.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <DiscordModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        title="User Settings"
        footer={
          <>
            <DiscordButton variant="secondary" onClick={() => setShowSettingsModal(false)}>
              Cancel
            </DiscordButton>
            <DiscordButton variant="primary" onClick={() => setShowSettingsModal(false)}>
              Save Changes
            </DiscordButton>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--discord-spacing-md)' }}>
          <div>
            <label style={{ display: 'block', marginBottom: 'var(--discord-spacing-xs)', fontSize: '12px', fontWeight: '600', color: 'var(--discord-text-secondary)' }}>
              USERNAME
            </label>
            <input
              type="text"
              className="discord-input"
              defaultValue="LightDom Harvester"
              style={{ width: '100%' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 'var(--discord-spacing-xs)', fontSize: '12px', fontWeight: '600', color: 'var(--discord-text-secondary)' }}>
              STATUS
            </label>
            <div style={{ display: 'flex', gap: 'var(--discord-spacing-sm)' }}>
              {(['online', 'idle', 'dnd', 'offline'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setUserStatus(status)}
                  style={{
                    padding: 'var(--discord-spacing-sm)',
                    border: `2px solid ${userStatus === status ? 'var(--discord-primary)' : 'var(--discord-border)'}`,
                    borderRadius: 'var(--discord-radius-sm)',
                    backgroundColor: 'transparent',
                    color: 'var(--discord-text-primary)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--discord-spacing-xs)',
                    fontSize: '12px',
                    textTransform: 'capitalize'
                  }}
                >
                  {getStatusIcon(status)}
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>
      </DiscordModal>

      {/* Toasts */}
      {toasts.map((toast) => (
        <DiscordToast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
};

export default DiscordStyleDashboard;
