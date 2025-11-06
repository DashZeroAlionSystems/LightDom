/**
 * System Settings Component
 * General system configuration for admins
 */

import React, { useState } from 'react';
import { 
  Settings,
  Globe,
  Mail,
  Database,
  Cloud,
  Sliders,
  Save,
  RefreshCw
} from 'lucide-react';

const SystemSettings: React.FC = () => {
  const [settings, setSettings] = useState({
    siteName: 'LightDom Platform',
    siteUrl: 'https://lightdom.io',
    supportEmail: 'support@lightdom.io',
    maintenanceMode: false,
    registrationEnabled: true,
    emailVerificationRequired: true,
    defaultUserPlan: 'free',
    dataRetentionDays: 90,
    backupEnabled: true,
    backupFrequency: 'daily',
    cdnEnabled: true,
    cacheDuration: 3600
  });

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    try {
      // Save settings to backend
      console.log('Saving settings:', settings);
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Failed to save settings');
    }
  };

  return (
    <div className="system-settings">
      {/* General Settings */}
      <div className="settings-section">
        <h3>General Settings</h3>
        <div className="settings-form">
          <div className="form-group">
            <label>
              <Globe size={18} />
              Site Name
            </label>
            <input
              type="text"
              value={settings.siteName}
              onChange={(e) => handleSettingChange('siteName', e.target.value)}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>
              <Globe size={18} />
              Site URL
            </label>
            <input
              type="url"
              value={settings.siteUrl}
              onChange={(e) => handleSettingChange('siteUrl', e.target.value)}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>
              <Mail size={18} />
              Support Email
            </label>
            <input
              type="email"
              value={settings.supportEmail}
              onChange={(e) => handleSettingChange('supportEmail', e.target.value)}
              className="form-input"
            />
          </div>
        </div>
      </div>

      {/* Registration Settings */}
      <div className="settings-section">
        <h3>Registration & Users</h3>
        <div className="settings-toggles">
          <div className="toggle-item">
            <div className="toggle-label">
              <Settings size={18} />
              <div>
                <span>Maintenance Mode</span>
                <p className="toggle-description">Disable site access for non-admins</p>
              </div>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.maintenanceMode}
                onChange={(e) => handleSettingChange('maintenanceMode', e.target.checked)}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="toggle-item">
            <div className="toggle-label">
              <Settings size={18} />
              <div>
                <span>Registration Enabled</span>
                <p className="toggle-description">Allow new user registrations</p>
              </div>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.registrationEnabled}
                onChange={(e) => handleSettingChange('registrationEnabled', e.target.checked)}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="toggle-item">
            <div className="toggle-label">
              <Mail size={18} />
              <div>
                <span>Email Verification</span>
                <p className="toggle-description">Require email verification for new users</p>
              </div>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.emailVerificationRequired}
                onChange={(e) => handleSettingChange('emailVerificationRequired', e.target.checked)}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>

        <div className="form-group">
          <label>Default User Plan</label>
          <select
            value={settings.defaultUserPlan}
            onChange={(e) => handleSettingChange('defaultUserPlan', e.target.value)}
            className="form-select"
          >
            <option value="free">Free</option>
            <option value="pro">Pro (Trial)</option>
            <option value="enterprise">Enterprise (Trial)</option>
          </select>
        </div>
      </div>

      {/* Data & Storage */}
      <div className="settings-section">
        <h3>Data & Storage</h3>
        <div className="settings-form">
          <div className="form-group">
            <label>
              <Database size={18} />
              Data Retention (days)
            </label>
            <input
              type="number"
              value={settings.dataRetentionDays}
              onChange={(e) => handleSettingChange('dataRetentionDays', parseInt(e.target.value))}
              className="form-input"
            />
          </div>

          <div className="toggle-item">
            <div className="toggle-label">
              <Cloud size={18} />
              <div>
                <span>Automatic Backups</span>
                <p className="toggle-description">Enable automatic database backups</p>
              </div>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.backupEnabled}
                onChange={(e) => handleSettingChange('backupEnabled', e.target.checked)}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          {settings.backupEnabled && (
            <div className="form-group">
              <label>Backup Frequency</label>
              <select
                value={settings.backupFrequency}
                onChange={(e) => handleSettingChange('backupFrequency', e.target.value)}
                className="form-select"
              >
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Performance */}
      <div className="settings-section">
        <h3>Performance</h3>
        <div className="settings-form">
          <div className="toggle-item">
            <div className="toggle-label">
              <Sliders size={18} />
              <div>
                <span>CDN Enabled</span>
                <p className="toggle-description">Use CDN for static assets</p>
              </div>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.cdnEnabled}
                onChange={(e) => handleSettingChange('cdnEnabled', e.target.checked)}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="form-group">
            <label>
              <RefreshCw size={18} />
              Cache Duration (seconds)
            </label>
            <input
              type="number"
              value={settings.cacheDuration}
              onChange={(e) => handleSettingChange('cacheDuration', parseInt(e.target.value))}
              className="form-input"
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="settings-actions">
        <button className="btn btn-primary" onClick={handleSave}>
          <Save size={18} />
          Save Settings
        </button>
        <button className="btn btn-secondary">
          <RefreshCw size={18} />
          Reset to Defaults
        </button>
      </div>
    </div>
  );
};

export default SystemSettings;


