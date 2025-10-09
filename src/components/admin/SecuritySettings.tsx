/**
 * Security Settings Component
 * Admin interface for managing security policies and configurations
 */

import React, { useState } from 'react';
import { 
  Shield,
  Lock,
  Key,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  RefreshCw
} from 'lucide-react';

const SecuritySettings: React.FC = () => {
  const [showSecrets, setShowSecrets] = useState(false);
  const [settings, setSettings] = useState({
    twoFactorRequired: true,
    sessionTimeout: 30,
    passwordExpiry: 90,
    minPasswordLength: 12,
    requireSpecialChars: true,
    maxLoginAttempts: 5,
    ipWhitelist: false,
    apiRateLimit: 1000
  });

  const securityEvents = [
    {
      id: '1',
      type: 'login_failed',
      user: 'unknown@suspicious.com',
      ip: '192.168.1.100',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      severity: 'warning'
    },
    {
      id: '2',
      type: 'api_limit_exceeded',
      user: 'alice@example.com',
      ip: '10.0.0.50',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      severity: 'warning'
    },
    {
      id: '3',
      type: 'admin_access',
      user: 'admin@lightdom.com',
      ip: '172.16.0.1',
      timestamp: new Date(Date.now() - 10800000).toISOString(),
      severity: 'info'
    }
  ];

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="security-settings">
      <div className="security-header">
        <Shield className="security-icon" />
        <h2>Security Configuration</h2>
      </div>

      {/* Security Policies */}
      <div className="security-section">
        <h3>Authentication Policies</h3>
        <div className="settings-grid">
          <div className="setting-item">
            <div className="setting-label">
              <Lock size={18} />
              <span>Two-Factor Authentication</span>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.twoFactorRequired}
                onChange={(e) => handleSettingChange('twoFactorRequired', e.target.checked)}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="setting-item">
            <div className="setting-label">
              <Key size={18} />
              <span>Session Timeout (minutes)</span>
            </div>
            <input
              type="number"
              value={settings.sessionTimeout}
              onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))}
              className="setting-input"
            />
          </div>

          <div className="setting-item">
            <div className="setting-label">
              <RefreshCw size={18} />
              <span>Password Expiry (days)</span>
            </div>
            <input
              type="number"
              value={settings.passwordExpiry}
              onChange={(e) => handleSettingChange('passwordExpiry', parseInt(e.target.value))}
              className="setting-input"
            />
          </div>

          <div className="setting-item">
            <div className="setting-label">
              <Shield size={18} />
              <span>Max Login Attempts</span>
            </div>
            <input
              type="number"
              value={settings.maxLoginAttempts}
              onChange={(e) => handleSettingChange('maxLoginAttempts', parseInt(e.target.value))}
              className="setting-input"
            />
          </div>
        </div>
      </div>

      {/* API Security */}
      <div className="security-section">
        <h3>API Security</h3>
        <div className="settings-grid">
          <div className="setting-item">
            <div className="setting-label">
              <Shield size={18} />
              <span>API Rate Limit (requests/hour)</span>
            </div>
            <input
              type="number"
              value={settings.apiRateLimit}
              onChange={(e) => handleSettingChange('apiRateLimit', parseInt(e.target.value))}
              className="setting-input"
            />
          </div>

          <div className="setting-item">
            <div className="setting-label">
              <Lock size={18} />
              <span>IP Whitelist</span>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.ipWhitelist}
                onChange={(e) => handleSettingChange('ipWhitelist', e.target.checked)}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>
      </div>

      {/* API Keys */}
      <div className="security-section">
        <h3>API Keys</h3>
        <div className="api-keys-list">
          <div className="api-key-item">
            <div className="key-info">
              <span className="key-name">Production API Key</span>
              <span className="key-value">
                {showSecrets ? 'sk_live_abcd1234efgh5678ijkl9012' : '••••••••••••••••••••9012'}
              </span>
            </div>
            <div className="key-actions">
              <button 
                className="btn-icon"
                onClick={() => setShowSecrets(!showSecrets)}
              >
                {showSecrets ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
              <button className="btn-icon">
                <RefreshCw size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Security Events */}
      <div className="security-section">
        <h3>Recent Security Events</h3>
        <div className="events-list">
          {securityEvents.map(event => (
            <div key={event.id} className={`event-item ${event.severity}`}>
              <div className="event-icon">
                {event.severity === 'warning' ? (
                  <AlertTriangle size={18} />
                ) : event.severity === 'error' ? (
                  <XCircle size={18} />
                ) : (
                  <CheckCircle size={18} />
                )}
              </div>
              <div className="event-details">
                <div className="event-type">{event.type.replace(/_/g, ' ').toUpperCase()}</div>
                <div className="event-meta">
                  {event.user} • IP: {event.ip} • {new Date(event.timestamp).toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="security-actions">
        <button className="btn btn-primary">Save Security Settings</button>
        <button className="btn btn-secondary">Export Security Logs</button>
      </div>
    </div>
  );
};

export default SecuritySettings;


