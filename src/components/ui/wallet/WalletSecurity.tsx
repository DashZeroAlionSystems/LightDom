/**
 * Wallet Security - Advanced security features for the LightDom wallet
 */

import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Lock, 
  Eye, 
  EyeOff, 
  Key, 
  Fingerprint, 
  Smartphone, 
  Mail, 
  CheckCircle, 
  AlertTriangle, 
  Settings, 
  RefreshCw,
  Download,
  Upload,
  Trash2,
  Plus,
  Minus,
  Clock,
  Activity,
  AlertCircle,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { cn } from '@/utils/validation/cn';

interface SecuritySettings {
  twoFactorEnabled: boolean;
  biometricEnabled: boolean;
  autoLock: number; // minutes
  notifications: boolean;
  sessionTimeout: number; // minutes
  maxLoginAttempts: number;
  ipWhitelist: string[];
  deviceWhitelist: string[];
}

interface SecurityEvent {
  id: string;
  type: 'login' | 'logout' | 'purchase' | 'transfer' | 'security_change' | 'suspicious_activity';
  description: string;
  timestamp: string;
  ip: string;
  device: string;
  location: string;
  status: 'success' | 'warning' | 'danger';
}

interface BackupCode {
  id: string;
  code: string;
  used: boolean;
  createdAt: string;
}

const WalletSecurity: React.FC = () => {
  const [settings, setSettings] = useState<SecuritySettings>({
    twoFactorEnabled: false,
    biometricEnabled: false,
    autoLock: 15,
    notifications: true,
    sessionTimeout: 60,
    maxLoginAttempts: 5,
    ipWhitelist: [],
    deviceWhitelist: []
  });

  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([
    {
      id: '1',
      type: 'login',
      description: 'Successful login from Chrome on Windows',
      timestamp: '2024-01-15T10:30:00Z',
      ip: '192.168.1.100',
      device: 'Chrome/Windows',
      location: 'New York, US',
      status: 'success'
    },
    {
      id: '2',
      type: 'purchase',
      description: 'Purchase: Space Bridge Pro (150 LDC)',
      timestamp: '2024-01-15T09:15:00Z',
      ip: '192.168.1.100',
      device: 'Chrome/Windows',
      location: 'New York, US',
      status: 'success'
    },
    {
      id: '3',
      type: 'suspicious_activity',
      description: 'Multiple failed login attempts detected',
      timestamp: '2024-01-14T22:45:00Z',
      ip: '203.0.113.1',
      device: 'Unknown',
      location: 'Unknown',
      status: 'danger'
    }
  ]);

  const [backupCodes, setBackupCodes] = useState<BackupCode[]>([
    { id: '1', code: 'ABCD-EFGH-IJKL', used: false, createdAt: '2024-01-10T00:00:00Z' },
    { id: '2', code: 'MNOP-QRST-UVWX', used: false, createdAt: '2024-01-10T00:00:00Z' },
    { id: '3', code: 'YZAB-CDEF-GHIJ', used: true, createdAt: '2024-01-10T00:00:00Z' }
  ]);

  const [activeTab, setActiveTab] = useState<'overview' | 'settings' | 'events' | 'backup' | 'devices'>('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [newIpAddress, setNewIpAddress] = useState('');
  const [newDeviceName, setNewDeviceName] = useState('');

  useEffect(() => {
    loadSecuritySettings();
    loadSecurityEvents();
  }, []);

  const loadSecuritySettings = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // In real implementation, fetch from API
    } catch (error) {
      console.error('Failed to load security settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSecurityEvents = async () => {
    try {
      // Simulate API call
      // In real implementation, fetch from API
    } catch (error) {
      console.error('Failed to load security events:', error);
    }
  };

  const updateSecuritySetting = async (key: keyof SecuritySettings, value: any) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setSettings(prev => ({
        ...prev,
        [key]: value
      }));

      // Add security event
      const newEvent: SecurityEvent = {
        id: Date.now().toString(),
        type: 'security_change',
        description: `Updated ${key.replace(/([A-Z])/g, ' $1').toLowerCase()}`,
        timestamp: new Date().toISOString(),
        ip: '192.168.1.100',
        device: 'Chrome/Windows',
        location: 'New York, US',
        status: 'success'
      };

      setSecurityEvents(prev => [newEvent, ...prev]);
    } catch (error) {
      console.error('Failed to update security setting:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateBackupCodes = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newCodes: BackupCode[] = Array.from({ length: 5 }, (_, i) => ({
        id: (backupCodes.length + i + 1).toString(),
        code: Math.random().toString(36).substring(2, 15).toUpperCase().replace(/(.{4})/g, '$1-').slice(0, -1),
        used: false,
        createdAt: new Date().toISOString()
      }));

      setBackupCodes(prev => [...prev, ...newCodes]);
    } catch (error) {
      console.error('Failed to generate backup codes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addIpToWhitelist = () => {
    if (newIpAddress && !settings.ipWhitelist.includes(newIpAddress)) {
      setSettings(prev => ({
        ...prev,
        ipWhitelist: [...prev.ipWhitelist, newIpAddress]
      }));
      setNewIpAddress('');
    }
  };

  const removeIpFromWhitelist = (ip: string) => {
    setSettings(prev => ({
      ...prev,
      ipWhitelist: prev.ipWhitelist.filter(addr => addr !== ip)
    }));
  };

  const addDeviceToWhitelist = () => {
    if (newDeviceName && !settings.deviceWhitelist.includes(newDeviceName)) {
      setSettings(prev => ({
        ...prev,
        deviceWhitelist: [...prev.deviceWhitelist, newDeviceName]
      }));
      setNewDeviceName('');
    }
  };

  const removeDeviceFromWhitelist = (device: string) => {
    setSettings(prev => ({
      ...prev,
      deviceWhitelist: prev.deviceWhitelist.filter(d => d !== device)
    }));
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'login': return <CheckCircle className="h-4 w-4" />;
      case 'logout': return <XCircle className="h-4 w-4" />;
      case 'purchase': return <Activity className="h-4 w-4" />;
      case 'transfer': return <RefreshCw className="h-4 w-4" />;
      case 'security_change': return <Settings className="h-4 w-4" />;
      case 'suspicious_activity': return <AlertTriangle className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getEventColor = (status: string) => {
    switch (status) {
      case 'success': return 'ld-text-success';
      case 'warning': return 'ld-text-warning';
      case 'danger': return 'ld-text-danger';
      default: return 'ld-text-muted';
    }
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="ld-container ld-container--xl ld-py-8 ld-animate-fade-in">
      {/* Header */}
      <div className="ld-card ld-card--elevated ld-animate-slide-down" style={{ borderRadius: 0, borderLeft: 'none', borderRight: 'none', borderTop: 'none', margin: 0 }}>
        <div className="ld-container ld-container--2xl">
          <div className="ld-flex ld-flex--between ld-flex--center">
            <div className="ld-flex ld-flex--center" style={{ gap: 'var(--ld-space-4)' }}>
              <div className="ld-flex ld-flex--center" style={{ gap: 'var(--ld-space-2)' }}>
                <div className="ld-flex ld-flex--center" style={{ 
                  width: '2rem', 
                  height: '2rem', 
                  borderRadius: 'var(--ld-radius-lg)', 
                  background: 'var(--ld-gradient-primary)' 
                }}>
                  <Shield className="h-5 w-5" style={{ color: 'var(--ld-text-primary)' }} />
                </div>
                <h1 className="ld-text-2xl ld-font-bold ld-text-primary">Wallet Security</h1>
              </div>
              <div className="ld-text-sm ld-text-secondary">
                Advanced security features • 24/7 monitoring
              </div>
            </div>
            <div className="ld-flex ld-flex--center" style={{ gap: 'var(--ld-space-4)' }}>
              <button
                onClick={loadSecuritySettings}
                disabled={isLoading}
                className="ld-btn ld-btn--primary ld-btn--md ld-hover-glow"
              >
                <RefreshCw className={cn("h-4 w-4", isLoading && "ld-animate-spin")} />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="ld-container ld-container--2xl ld-py-4">
        <div className="ld-card ld-card--elevated ld-flex ld-animate-slide-up" style={{ gap: 'var(--ld-space-1)', padding: 'var(--ld-space-1)' }}>
          {[
            { id: 'overview', label: 'Overview', icon: Shield },
            { id: 'settings', label: 'Settings', icon: Settings },
            { id: 'events', label: 'Security Events', icon: Activity },
            { id: 'backup', label: 'Backup', icon: Download },
            { id: 'devices', label: 'Devices', icon: Smartphone }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`ld-btn ld-btn--md ld-flex ld-flex--center ld-hover-scale ${
                activeTab === tab.id 
                  ? 'ld-btn--primary'
                  : 'ld-btn--ghost'
              }`}
              style={{ gap: 'var(--ld-space-2)', padding: 'var(--ld-space-2) var(--ld-space-4)' }}
            >
              <tab.icon className="h-4 w-4" />
              <span className="ld-text-sm ld-font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="ld-container ld-container--2xl ld-pb-8">
        {activeTab === 'overview' && (
          <div className="ld-grid ld-grid--gap-lg">
            {/* Security Status */}
            <div className="ld-card ld-card--elevated ld-animate-slide-up">
              <div className="ld-card__header">
                <h3 className="ld-card__title">Security Status</h3>
              </div>
              <div className="ld-card__content">
                <div className="ld-grid ld-grid--cols-1 md:ld-grid--cols-2 ld-grid--gap-lg">
                  <div className="ld-flex ld-flex--between ld-items--center ld-p-4 ld-card" style={{ borderRadius: 'var(--ld-radius-md)' }}>
                    <div className="ld-flex ld-flex--center" style={{ gap: 'var(--ld-space-2)' }}>
                      <div className={cn("ld-w-3 ld-h-3 ld-rounded-full", settings.twoFactorEnabled ? "ld-bg-success" : "ld-bg-danger")} />
                      <span className="ld-text-sm ld-font-medium ld-text-primary">Two-Factor Authentication</span>
                    </div>
                    <span className={cn("ld-text-sm ld-font-medium", settings.twoFactorEnabled ? "ld-text-success" : "ld-text-danger")}>
                      {settings.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>

                  <div className="ld-flex ld-flex--between ld-items--center ld-p-4 ld-card" style={{ borderRadius: 'var(--ld-radius-md)' }}>
                    <div className="ld-flex ld-flex--center" style={{ gap: 'var(--ld-space-2)' }}>
                      <div className={cn("ld-w-3 ld-h-3 ld-rounded-full", settings.biometricEnabled ? "ld-bg-success" : "ld-bg-danger")} />
                      <span className="ld-text-sm ld-font-medium ld-text-primary">Biometric Security</span>
                    </div>
                    <span className={cn("ld-text-sm ld-font-medium", settings.biometricEnabled ? "ld-text-success" : "ld-text-danger")}>
                      {settings.biometricEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>

                  <div className="ld-flex ld-flex--between ld-items--center ld-p-4 ld-card" style={{ borderRadius: 'var(--ld-radius-md)' }}>
                    <div className="ld-flex ld-flex--center" style={{ gap: 'var(--ld-space-2)' }}>
                      <div className="ld-w-3 ld-h-3 ld-rounded-full ld-bg-success" />
                      <span className="ld-text-sm ld-font-medium ld-text-primary">Auto-Lock</span>
                    </div>
                    <span className="ld-text-sm ld-font-medium ld-text-success">
                      {settings.autoLock} minutes
                    </span>
                  </div>

                  <div className="ld-flex ld-flex--between ld-items--center ld-p-4 ld-card" style={{ borderRadius: 'var(--ld-radius-md)' }}>
                    <div className="ld-flex ld-flex--center" style={{ gap: 'var(--ld-space-2)' }}>
                      <div className={cn("ld-w-3 ld-h-3 ld-rounded-full", settings.notifications ? "ld-bg-success" : "ld-bg-danger")} />
                      <span className="ld-text-sm ld-font-medium ld-text-primary">Security Notifications</span>
                    </div>
                    <span className={cn("ld-text-sm ld-font-medium", settings.notifications ? "ld-text-success" : "ld-text-danger")}>
                      {settings.notifications ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Security Events */}
            <div className="ld-card ld-card--elevated ld-animate-slide-up">
              <div className="ld-card__header">
                <h3 className="ld-card__title">Recent Security Events</h3>
              </div>
              <div className="ld-card__content">
                <div className="ld-space-y-3">
                  {securityEvents.slice(0, 5).map((event) => (
                    <div key={event.id} className="ld-flex ld-flex--between ld-items--center ld-p-3 ld-card ld-hover-lift" style={{ borderRadius: 'var(--ld-radius-md)' }}>
                      <div className="ld-flex ld-flex--center" style={{ gap: 'var(--ld-space-3)' }}>
                        <div className={cn("ld-p-2 ld-rounded-full", getEventColor(event.status))} style={{ background: 'var(--ld-color-tertiary)' }}>
                          {getEventIcon(event.type)}
                        </div>
                        <div>
                          <div className="ld-text-sm ld-font-medium ld-text-primary">{event.description}</div>
                          <div className="ld-text-xs ld-text-muted">{event.location} • {formatDate(event.timestamp)}</div>
                        </div>
                      </div>
                      <div className={cn("ld-text-xs ld-font-medium", getEventColor(event.status))}>
                        {event.status}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="ld-card ld-card--elevated ld-animate-slide-up">
            <div className="ld-card__header">
              <h3 className="ld-card__title">Security Settings</h3>
            </div>
            <div className="ld-card__content">
              <div className="ld-space-y-6">
                {/* Two-Factor Authentication */}
                <div className="ld-flex ld-flex--between ld-items--center">
                  <div>
                    <h4 className="ld-text-md ld-font-semibold ld-text-primary">Two-Factor Authentication</h4>
                    <p className="ld-text-sm ld-text-secondary">Add an extra layer of security to your wallet</p>
                  </div>
                  <button
                    onClick={() => updateSecuritySetting('twoFactorEnabled', !settings.twoFactorEnabled)}
                    disabled={isLoading}
                    className={cn(
                      "ld-btn ld-btn--md ld-hover-lift",
                      settings.twoFactorEnabled ? "ld-btn--success" : "ld-btn--secondary"
                    )}
                  >
                    {settings.twoFactorEnabled ? 'Disable' : 'Enable'} 2FA
                  </button>
                </div>

                {/* Biometric Security */}
                <div className="ld-flex ld-flex--between ld-items--center">
                  <div>
                    <h4 className="ld-text-md ld-font-semibold ld-text-primary">Biometric Security</h4>
                    <p className="ld-text-sm ld-text-secondary">Use fingerprint or face recognition for quick access</p>
                  </div>
                  <button
                    onClick={() => updateSecuritySetting('biometricEnabled', !settings.biometricEnabled)}
                    disabled={isLoading}
                    className={cn(
                      "ld-btn ld-btn--md ld-hover-lift",
                      settings.biometricEnabled ? "ld-btn--success" : "ld-btn--secondary"
                    )}
                  >
                    {settings.biometricEnabled ? 'Disable' : 'Enable'} Biometric
                  </button>
                </div>

                {/* Auto-Lock */}
                <div className="ld-flex ld-flex--between ld-items--center">
                  <div>
                    <h4 className="ld-text-md ld-font-semibold ld-text-primary">Auto-Lock Timer</h4>
                    <p className="ld-text-sm ld-text-secondary">Automatically lock wallet after inactivity</p>
                  </div>
                  <select
                    value={settings.autoLock}
                    onChange={(e) => updateSecuritySetting('autoLock', parseInt(e.target.value))}
                    disabled={isLoading}
                    className="ld-input"
                    style={{ width: '8rem' }}
                  >
                    <option value={5}>5 minutes</option>
                    <option value={15}>15 minutes</option>
                    <option value={30}>30 minutes</option>
                    <option value={60}>1 hour</option>
                    <option value={240}>4 hours</option>
                  </select>
                </div>

                {/* Notifications */}
                <div className="ld-flex ld-flex--between ld-items--center">
                  <div>
                    <h4 className="ld-text-md ld-font-semibold ld-text-primary">Security Notifications</h4>
                    <p className="ld-text-sm ld-text-secondary">Get notified about security events</p>
                  </div>
                  <button
                    onClick={() => updateSecuritySetting('notifications', !settings.notifications)}
                    disabled={isLoading}
                    className={cn(
                      "ld-btn ld-btn--md ld-hover-lift",
                      settings.notifications ? "ld-btn--success" : "ld-btn--secondary"
                    )}
                  >
                    {settings.notifications ? 'Disable' : 'Enable'} Notifications
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'backup' && (
          <div className="ld-card ld-card--elevated ld-animate-slide-up">
            <div className="ld-card__header">
              <h3 className="ld-card__title">Backup & Recovery</h3>
            </div>
            <div className="ld-card__content">
              <div className="ld-space-y-6">
                {/* Backup Codes */}
                <div>
                  <h4 className="ld-text-md ld-font-semibold ld-text-primary ld-mb-4">Backup Codes</h4>
                  <p className="ld-text-sm ld-text-secondary ld-mb-4">
                    Use these one-time codes to access your wallet if you lose your device
                  </p>
                  
                  <div className="ld-mb-4">
                    <button
                      onClick={() => setShowBackupCodes(!showBackupCodes)}
                      className="ld-btn ld-btn--secondary ld-hover-lift"
                    >
                      {showBackupCodes ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      {showBackupCodes ? 'Hide' : 'Show'} Codes
                    </button>
                    <button
                      onClick={generateBackupCodes}
                      disabled={isLoading}
                      className="ld-btn ld-btn--primary ld-hover-glow ld-ml-2"
                    >
                      <Plus className="h-4 w-4" />
                      Generate New Codes
                    </button>
                  </div>

                  {showBackupCodes && (
                    <div className="ld-grid ld-grid--cols-1 md:ld-grid--cols-2 ld-grid--gap-md">
                      {backupCodes.map((code) => (
                        <div key={code.id} className="ld-flex ld-flex--between ld-items--center ld-p-3 ld-card" style={{ borderRadius: 'var(--ld-radius-md)' }}>
                          <span className="ld-text-sm ld-font-mono ld-text-primary">{code.code}</span>
                          <div className="ld-flex ld-flex--center" style={{ gap: 'var(--ld-space-1)' }}>
                            {code.used ? (
                              <span className="ld-text-xs ld-text-danger">Used</span>
                            ) : (
                              <span className="ld-text-xs ld-text-success">Available</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Export Wallet */}
                <div>
                  <h4 className="ld-text-md ld-font-semibold ld-text-primary ld-mb-4">Export Wallet Data</h4>
                  <p className="ld-text-sm ld-text-secondary ld-mb-4">
                    Download a secure backup of your wallet data
                  </p>
                  <button className="ld-btn ld-btn--secondary ld-hover-lift">
                    <Download className="h-4 w-4" />
                    Export Wallet
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WalletSecurity;
