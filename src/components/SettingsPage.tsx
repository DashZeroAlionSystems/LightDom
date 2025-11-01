/**
 * Settings Page - Comprehensive Settings Management
 * Professional settings interface with categorized configuration options
 */

import React, { useState } from 'react';
import {
  Card,
  Row,
  Col,
  Typography,
  Switch,
  Slider,
  Select,
  InputNumber,
  Button,
  Divider,
  Space,
  Alert,
  Form,
  Input,
  ColorPicker,
  Upload,
  message,
  Tabs,
  Badge,
  Tooltip,
  Tag,
} from 'antd';
import {
  SettingOutlined,
  SecurityScanOutlined,
  BellOutlined,
  ApiOutlined,
  ThunderboltOutlined,
  EyeOutlined,
  SaveOutlined,
  ReloadOutlined,
  UploadOutlined,
  DownloadOutlined,
  LockOutlined,
  UnlockOutlined,
  MonitorOutlined,
  DatabaseOutlined,
  CloudOutlined,
  UserOutlined,
  TeamOutlined,
  GlobalOutlined,
  WalletOutlined,
  TrophyOutlined,
  FireOutlined,
} from '@ant-design/icons';
import DesignSystem from './EnhancedDesignSystem';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

interface SettingsState {
  // General Settings
  theme: 'dark' | 'light' | 'auto';
  language: string;
  autoSave: boolean;
  notifications: boolean;
  soundEffects: boolean;
  
  // Mining Settings
  autoStartMining: boolean;
  maxTemperature: number;
  powerLimit: number;
  optimizationLevel: number;
  workerCount: number;
  
  // Security Settings
  twoFactorAuth: boolean;
  sessionTimeout: number;
  encryptionLevel: 'standard' | 'high' | 'maximum';
  autoLock: boolean;
  
  // Performance Settings
  gpuAcceleration: boolean;
  maxMemoryUsage: number;
  cacheSize: number;
  backgroundUpdates: boolean;
  
  // Network Settings
  proxyEnabled: boolean;
  maxConnections: number;
  timeout: number;
  retryAttempts: number;
  
  // Appearance Settings
  primaryColor: string;
  accentColor: string;
  fontSize: number;
  compactMode: boolean;
  showAnimations: boolean;
}

const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<SettingsState>({
    // General
    theme: 'dark',
    language: 'en',
    autoSave: true,
    notifications: true,
    soundEffects: false,
    
    // Mining
    autoStartMining: false,
    maxTemperature: 80,
    powerLimit: 250,
    optimizationLevel: 2,
    workerCount: 3,
    
    // Security
    twoFactorAuth: false,
    sessionTimeout: 30,
    encryptionLevel: 'high',
    autoLock: true,
    
    // Performance
    gpuAcceleration: true,
    maxMemoryUsage: 4096,
    cacheSize: 512,
    backgroundUpdates: true,
    
    // Network
    proxyEnabled: false,
    maxConnections: 10,
    timeout: 30,
    retryAttempts: 3,
    
    // Appearance
    primaryColor: '#7c3aed',
    accentColor: '#10b981',
    fontSize: 14,
    compactMode: false,
    showAnimations: true,
  });

  const [hasChanges, setHasChanges] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  const handleSettingChange = (category: keyof SettingsState, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: value,
    }));
    setHasChanges(true);
  };

  const handleSaveSettings = () => {
    // Simulate saving settings
    message.success('Settings saved successfully!');
    setHasChanges(false);
  };

  const handleResetSettings = () => {
    // Reset to default settings
    setSettings({
      theme: 'dark',
      language: 'en',
      autoSave: true,
      notifications: true,
      soundEffects: false,
      autoStartMining: false,
      maxTemperature: 80,
      powerLimit: 250,
      optimizationLevel: 2,
      workerCount: 3,
      twoFactorAuth: false,
      sessionTimeout: 30,
      encryptionLevel: 'high',
      autoLock: true,
      gpuAcceleration: true,
      maxMemoryUsage: 4096,
      cacheSize: 512,
      backgroundUpdates: true,
      proxyEnabled: false,
      maxConnections: 10,
      timeout: 30,
      retryAttempts: 3,
      primaryColor: '#7c3aed',
      accentColor: '#10b981',
      fontSize: 14,
      compactMode: false,
      showAnimations: true,
    });
    message.info('Settings reset to defaults');
    setHasChanges(false);
  };

  const handleExportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'lightdom-settings.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    message.success('Settings exported successfully!');
  };

  const renderGeneralSettings = () => (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Row gutter={[DesignSystem.Spacing.lg, DesignSystem.Spacing.lg]}>
        <Col span={12}>
          <div style={{ marginBottom: DesignSystem.Spacing.md }}>
            <Text strong style={{ color: DesignSystem.Colors.text }}>Theme</Text>
            <Text style={{ color: DesignSystem.Colors.textSecondary, display: 'block', fontSize: '12px' }}>
              Choose your preferred color theme
            </Text>
          </div>
          <Select
            value={settings.theme}
            onChange={(value) => handleSettingChange('theme', value)}
            style={{ width: '100%' }}
          >
            <Option value="dark">🌙 Dark</Option>
            <Option value="light">☀️ Light</Option>
            <Option value="auto">🔄 Auto</Option>
          </Select>
        </Col>
        <Col span={12}>
          <div style={{ marginBottom: DesignSystem.Spacing.md }}>
            <Text strong style={{ color: DesignSystem.Colors.text }}>Language</Text>
            <Text style={{ color: DesignSystem.Colors.textSecondary, display: 'block', fontSize: '12px' }}>
              Select your preferred language
            </Text>
          </div>
          <Select
            value={settings.language}
            onChange={(value) => handleSettingChange('language', value)}
            style={{ width: '100%' }}
          >
            <Option value="en">English</Option>
            <Option value="es">Español</Option>
            <Option value="fr">Français</Option>
            <Option value="de">Deutsch</Option>
            <Option value="zh">中文</Option>
          </Select>
        </Col>
      </Row>

      <Row gutter={[DesignSystem.Spacing.lg, DesignSystem.Spacing.lg]}>
        <Col span={8}>
          <Space direction="vertical">
            <Text strong style={{ color: DesignSystem.Colors.text }}>Auto Save</Text>
            <Switch
              checked={settings.autoSave}
              onChange={(checked) => handleSettingChange('autoSave', checked)}
            />
            <Text style={{ color: DesignSystem.Colors.textSecondary, fontSize: '12px' }}>
              Automatically save your work
            </Text>
          </Space>
        </Col>
        <Col span={8}>
          <Space direction="vertical">
            <Text strong style={{ color: DesignSystem.Colors.text }}>Notifications</Text>
            <Switch
              checked={settings.notifications}
              onChange={(checked) => handleSettingChange('notifications', checked)}
            />
            <Text style={{ color: DesignSystem.Colors.textSecondary, fontSize: '12px' }}>
              Enable desktop notifications
            </Text>
          </Space>
        </Col>
        <Col span={8}>
          <Space direction="vertical">
            <Text strong style={{ color: DesignSystem.Colors.text }}>Sound Effects</Text>
            <Switch
              checked={settings.soundEffects}
              onChange={(checked) => handleSettingChange('soundEffects', checked)}
            />
            <Text style={{ color: DesignSystem.Colors.textSecondary, fontSize: '12px' }}>
              Play sounds for actions
            </Text>
          </Space>
        </Col>
      </Row>
    </Space>
  );

  const renderMiningSettings = () => (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Row gutter={[DesignSystem.Spacing.lg, DesignSystem.Spacing.lg]}>
        <Col span={12}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Text strong style={{ color: DesignSystem.Colors.text }}>Max Temperature</Text>
            <Slider
              min={60}
              max={90}
              value={settings.maxTemperature}
              onChange={(value) => handleSettingChange('maxTemperature', value)}
              marks={{
                60: '60°C',
                75: '75°C',
                90: '90°C',
              }}
            />
            <Text style={{ color: DesignSystem.Colors.textSecondary, fontSize: '12px' }}>
              Maximum safe temperature for mining
            </Text>
          </Space>
        </Col>
        <Col span={12}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Text strong style={{ color: DesignSystem.Colors.text }}>Power Limit</Text>
            <Slider
              min={100}
              max={350}
              value={settings.powerLimit}
              onChange={(value) => handleSettingChange('powerLimit', value)}
              marks={{
                100: '100W',
                250: '250W',
                350: '350W',
              }}
            />
            <Text style={{ color: DesignSystem.Colors.textSecondary, fontSize: '12px' }}>
              Maximum power consumption limit
            </Text>
          </Space>
        </Col>
      </Row>

      <Row gutter={[DesignSystem.Spacing.lg, DesignSystem.Spacing.lg]}>
        <Col span={12}>
          <Space direction="vertical">
            <Text strong style={{ color: DesignSystem.Colors.text }}>Auto Start Mining</Text>
            <Switch
              checked={settings.autoStartMining}
              onChange={(checked) => handleSettingChange('autoStartMining', checked)}
            />
            <Text style={{ color: DesignSystem.Colors.textSecondary, fontSize: '12px' }}>
              Automatically start mining on launch
            </Text>
          </Space>
        </Col>
        <Col span={12}>
          <div style={{ marginBottom: DesignSystem.Spacing.md }}>
            <Text strong style={{ color: DesignSystem.Colors.text }}>Worker Count</Text>
          </div>
          <InputNumber
            min={1}
            max={8}
            value={settings.workerCount}
            onChange={(value) => handleSettingChange('workerCount', value)}
            style={{ width: '100%' }}
          />
        </Col>
      </Row>

      <Row>
        <Col span={24}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Text strong style={{ color: DesignSystem.Colors.text }}>Optimization Level</Text>
            <Slider
              min={1}
              max={5}
              value={settings.optimizationLevel}
              onChange={(value) => handleSettingChange('optimizationLevel', value)}
              marks={{
                1: 'Conservative',
                2: 'Balanced',
                3: 'Performance',
                4: 'Aggressive',
                5: 'Maximum',
              }}
            />
            <Text style={{ color: DesignSystem.Colors.textSecondary, fontSize: '12px' }}>
              Higher levels provide better performance but may increase temperature
            </Text>
          </Space>
        </Col>
      </Row>
    </Space>
  );

  const renderSecuritySettings = () => (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Row gutter={[DesignSystem.Spacing.lg, DesignSystem.Spacing.lg]}>
        <Col span={12}>
          <Space direction="vertical">
            <Text strong style={{ color: DesignSystem.Colors.text }}>Two-Factor Authentication</Text>
            <Switch
              checked={settings.twoFactorAuth}
              onChange={(checked) => handleSettingChange('twoFactorAuth', checked)}
            />
            <Text style={{ color: DesignSystem.Colors.textSecondary, fontSize: '12px' }}>
              Add an extra layer of security
            </Text>
          </Space>
        </Col>
        <Col span={12}>
          <Space direction="vertical">
            <Text strong style={{ color: DesignSystem.Colors.text }}>Auto Lock</Text>
            <Switch
              checked={settings.autoLock}
              onChange={(checked) => handleSettingChange('autoLock', checked)}
            />
            <Text style={{ color: DesignSystem.Colors.textSecondary, fontSize: '12px' }}>
              Automatically lock when inactive
            </Text>
          </Space>
        </Col>
      </Row>

      <Row gutter={[DesignSystem.Spacing.lg, DesignSystem.Spacing.lg]}>
        <Col span={12}>
          <div style={{ marginBottom: DesignSystem.Spacing.md }}>
            <Text strong style={{ color: DesignSystem.Colors.text }}>Session Timeout</Text>
          </div>
          <InputNumber
            min={5}
            max={120}
            value={settings.sessionTimeout}
            onChange={(value) => handleSettingChange('sessionTimeout', value)}
            suffix="minutes"
            style={{ width: '100%' }}
          />
        </Col>
        <Col span={12}>
          <div style={{ marginBottom: DesignSystem.Spacing.md }}>
            <Text strong style={{ color: DesignSystem.Colors.text }}>Encryption Level</Text>
          </div>
          <Select
            value={settings.encryptionLevel}
            onChange={(value) => handleSettingChange('encryptionLevel', value)}
            style={{ width: '100%' }}
          >
            <Option value="standard">Standard</Option>
            <Option value="high">High</Option>
            <Option value="maximum">Maximum</Option>
          </Select>
        </Col>
      </Row>

      <Alert
        message="Security Recommendation"
        description="Enable two-factor authentication and use maximum encryption for sensitive operations."
        type="info"
        showIcon
        icon={<SecurityScanOutlined />}
      />
    </Space>
  );

  const renderAppearanceSettings = () => (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Row gutter={[DesignSystem.Spacing.lg, DesignSystem.Spacing.lg]}>
        <Col span={12}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Text strong style={{ color: DesignSystem.Colors.text }}>Primary Color</Text>
            <ColorPicker
              value={settings.primaryColor}
              onChange={(color) => handleSettingChange('primaryColor', color.toHexString())}
              showText
            />
            <Text style={{ color: DesignSystem.Colors.textSecondary, fontSize: '12px' }}>
              Main accent color for the interface
            </Text>
          </Space>
        </Col>
        <Col span={12}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Text strong style={{ color: DesignSystem.Colors.text }}>Accent Color</Text>
            <ColorPicker
              value={settings.accentColor}
              onChange={(color) => handleSettingChange('accentColor', color.toHexString())}
              showText
            />
            <Text style={{ color: DesignSystem.Colors.textSecondary, fontSize: '12px' }}>
              Secondary accent color
            </Text>
          </Space>
        </Col>
      </Row>

      <Row gutter={[DesignSystem.Spacing.lg, DesignSystem.Spacing.lg]}>
        <Col span={12}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Text strong style={{ color: DesignSystem.Colors.text }}>Font Size</Text>
            <Slider
              min={12}
              max={18}
              value={settings.fontSize}
              onChange={(value) => handleSettingChange('fontSize', value)}
              marks={{
                12: 'Small',
                14: 'Medium',
                16: 'Large',
                18: 'Extra Large',
              }}
            />
          </Space>
        </Col>
        <Col span={12}>
          <Space direction="vertical">
            <Text strong style={{ color: DesignSystem.Colors.text }}>Compact Mode</Text>
            <Switch
              checked={settings.compactMode}
              onChange={(checked) => handleSettingChange('compactMode', checked)}
            />
            <Text style={{ color: DesignSystem.Colors.textSecondary, fontSize: '12px' }}>
              Reduce spacing between elements
            </Text>
          </Space>
        </Col>
      </Row>

      <Row>
        <Col span={24}>
          <Space direction="vertical">
            <Text strong style={{ color: DesignSystem.Colors.text }}>Show Animations</Text>
            <Switch
              checked={settings.showAnimations}
              onChange={(checked) => handleSettingChange('showAnimations', checked)}
            />
            <Text style={{ color: DesignSystem.Colors.textSecondary, fontSize: '12px' }}>
              Enable interface animations and transitions
            </Text>
          </Space>
        </Col>
      </Row>
    </Space>
  );

  return (
    <div style={{ padding: DesignSystem.Spacing.lg }}>
      <div style={{ marginBottom: DesignSystem.Spacing.lg }}>
        <Title level={2} style={{ color: DesignSystem.Colors.text, margin: 0 }}>
          Settings
        </Title>
        <Text style={{ color: DesignSystem.Colors.textSecondary }}>
          Configure your LightDom experience
        </Text>
      </div>

      {hasChanges && (
        <Alert
          message="You have unsaved changes"
          description="Don't forget to save your settings before leaving."
          type="warning"
          showIcon
          style={{ marginBottom: DesignSystem.Spacing.lg }}
          action={
            <Button size="small" onClick={handleSaveSettings}>
              Save Now
            </Button>
          }
        />
      )}

      <Card style={DesignSystem.ComponentStyles.card}>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane 
            tab={
              <span>
                <SettingOutlined />
                General
              </span>
            } 
            key="general"
          >
            {renderGeneralSettings()}
          </TabPane>
          <TabPane 
            tab={
              <span>
                <ThunderboltOutlined />
                Mining
              </span>
            } 
            key="mining"
          >
            {renderMiningSettings()}
          </TabPane>
          <TabPane 
            tab={
              <span>
                <SecurityScanOutlined />
                Security
              </span>
            } 
            key="security"
          >
            {renderSecuritySettings()}
          </TabPane>
          <TabPane 
            tab={
              <span>
                <EyeOutlined />
                Appearance
              </span>
            } 
            key="appearance"
          >
            {renderAppearanceSettings()}
          </TabPane>
        </Tabs>

        <Divider />

        <Row justify="space-between" align="middle">
          <Col>
            <Space>
              <Button
                icon={<UploadOutlined />}
                onClick={handleExportSettings}
                style={DesignSystem.ComponentStyles.button}
              >
                Export Settings
              </Button>
              <Button
                icon={<DownloadOutlined />}
                style={DesignSystem.ComponentStyles.button}
              >
                Import Settings
              </Button>
            </Space>
          </Col>
          <Col>
            <Space>
              <Button
                icon={<ReloadOutlined />}
                onClick={handleResetSettings}
                style={DesignSystem.ComponentStyles.button}
              >
                Reset to Defaults
              </Button>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                onClick={handleSaveSettings}
                disabled={!hasChanges}
                style={{
                  background: DesignSystem.Colors.gradients.primary,
                  border: 'none',
                  ...DesignSystem.ComponentStyles.button,
                }}
              >
                Save Settings
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default SettingsPage;
