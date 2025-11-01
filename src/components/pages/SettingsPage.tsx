/**
 * Settings Page
 * Professional settings management with categorized options
 */

import React, { useState } from 'react';
import {
  Card,
  Row,
  Col,
  Typography,
  Space,
  Switch,
  Slider,
  Select,
  Input,
  Button,
  Divider,
  Alert,
  List,
  Avatar,
  Tag,
  Tooltip,
  InputNumber,
  Radio,
} from 'antd';
import {
  SettingOutlined,
  SecurityScanOutlined,
  BellOutlined,
  GlobalOutlined,
  DatabaseOutlined,
  ThunderboltOutlined,
  UserOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  SaveOutlined,
  ReloadOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import { EnhancedColors, EnhancedSpacing, EnhancedTypography, EnhancedComponentSizes } from '../../styles/EnhancedDesignSystem';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

interface SettingsState {
  // General Settings
  theme: 'dark' | 'light';
  language: string;
  autoSave: boolean;
  autoRefresh: number;
  
  // Mining Settings
  miningOnStartup: boolean;
  maxWorkers: number;
  miningIntensity: number;
  maxTemperature: number;
  
  // Notification Settings
  desktopNotifications: boolean;
  emailNotifications: boolean;
  alertThreshold: number;
  
  // Security Settings
  twoFactorAuth: boolean;
  sessionTimeout: number;
  apiAccess: boolean;
  
  // Network Settings
  rpcUrl: string;
  maxConnections: number;
  timeout: number;
}

const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<SettingsState>({
    // General
    theme: 'dark',
    language: 'en',
    autoSave: true,
    autoRefresh: 30,
    
    // Mining
    miningOnStartup: false,
    maxWorkers: 4,
    miningIntensity: 75,
    maxTemperature: 80,
    
    // Notifications
    desktopNotifications: true,
    emailNotifications: false,
    alertThreshold: 90,
    
    // Security
    twoFactorAuth: false,
    sessionTimeout: 24,
    apiAccess: false,
    
    // Network
    rpcUrl: 'http://localhost:8545',
    maxConnections: 10,
    timeout: 5000,
  });

  const [hasChanges, setHasChanges] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  const handleSettingChange = (category: keyof SettingsState, value: any) => {
    setSettings(prev => ({ ...prev, [category]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    // Save settings logic here
    setHasChanges(false);
    // Show success message
  };

  const handleReset = () => {
    // Reset to defaults logic here
    setHasChanges(false);
  };

  const settingsCategories = [
    {
      key: 'general',
      title: 'General Settings',
      icon: <SettingOutlined />,
      description: 'Basic application preferences',
    },
    {
      key: 'mining',
      title: 'Mining Configuration',
      icon: <ThunderboltOutlined />,
      description: 'Mining operation settings',
    },
    {
      key: 'notifications',
      title: 'Notifications',
      icon: <BellOutlined />,
      description: 'Alert and notification preferences',
    },
    {
      key: 'security',
      title: 'Security',
      icon: <SecurityScanOutlined />,
      description: 'Security and privacy settings',
    },
    {
      key: 'network',
      title: 'Network',
      icon: <GlobalOutlined />,
      description: 'Network and connection settings',
    },
  ];

  return (
    <div style={{ padding: EnhancedSpacing.lg }}>
      {/* Page Header */}
      <div style={{ marginBottom: EnhancedSpacing.xl }}>
        <Title level={2} style={{ 
          color: EnhancedColors.dark.text,
          fontSize: EnhancedTypography.headlineMedium.fontSize,
          fontWeight: EnhancedTypography.headlineMedium.fontWeight,
          margin: 0,
          marginBottom: EnhancedSpacing.sm,
        }}>
          Settings
        </Title>
        <Text style={{ 
          fontSize: EnhancedTypography.bodyLarge.fontSize,
          color: EnhancedColors.dark.textSecondary,
        }}>
          Configure your LightDom Desktop application preferences
        </Text>
      </div>

      {/* Changes Alert */}
      {hasChanges && (
        <Alert
          message="You have unsaved changes"
          description="Your settings have been modified but not yet saved."
          type="warning"
          showIcon
          closable
          style={{
            marginBottom: EnhancedSpacing.lg,
            backgroundColor: `${EnhancedColors.warning[100]}20`,
            borderColor: EnhancedColors.warning[500],
          }}
          action={
            <Space>
              <Button size="small" onClick={handleReset}>
                Reset
              </Button>
              <Button type="primary" size="small" icon={<SaveOutlined />} onClick={handleSave}>
                Save Changes
              </Button>
            </Space>
          }
        />
      )}

      {/* Settings Categories */}
      <Row gutter={[EnhancedSpacing.lg, EnhancedSpacing.lg]}>
        <Col xs={24} lg={8}>
          <Card
            title="Categories"
            style={{ ...EnhancedComponents.card, height: 'fit-content' }}
            headStyle={{ borderBottom: `1px solid ${EnhancedColors.dark.border}` }}
          >
            <List
              dataSource={settingsCategories}
              renderItem={(category) => (
                <List.Item
                  style={{
                    padding: EnhancedSpacing.md,
                    borderRadius: EnhancedBorderRadius.sm,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    border: `1px solid transparent`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = EnhancedColors.primary[100];
                    e.currentTarget.style.borderColor = EnhancedColors.primary[300];
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.borderColor = 'transparent';
                  }}
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        icon={category.icon}
                        style={{
                          backgroundColor: EnhancedColors.primary[600],
                          border: `2px solid ${EnhancedColors.primary[400]}`,
                        }}
                      />
                    }
                    title={
                      <Text style={{ 
                        color: EnhancedColors.dark.text,
                        fontWeight: 500,
                      }}>
                        {category.title}
                      </Text>
                    }
                    description={
                      <Text style={{ 
                        fontSize: EnhancedTypography.bodySmall.fontSize,
                        color: EnhancedColors.dark.textTertiary,
                      }}>
                        {category.description}
                      </Text>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        <Col xs={24} lg={16}>
          {/* General Settings */}
          <Card
            title={
              <Space>
                <SettingOutlined style={{ color: EnhancedColors.primary[600] }} />
                <span>General Settings</span>
              </Space>
            }
            style={{ ...EnhancedComponents.card, marginBottom: EnhancedSpacing.lg }}
            headStyle={{ borderBottom: `1px solid ${EnhancedColors.dark.border}` }}
          >
            <Space direction="vertical" size={EnhancedSpacing.lg} style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <Text strong style={{ color: EnhancedColors.dark.text }}>Theme</Text>
                  <br />
                  <Text style={{ fontSize: EnhancedTypography.bodySmall.fontSize, color: EnhancedColors.dark.textSecondary }}>
                    Choose your preferred color theme
                  </Text>
                </div>
                <Radio.Group
                  value={settings.theme}
                  onChange={(e) => handleSettingChange('theme', e.target.value)}
                >
                  <Radio.Button value="dark">Dark</Radio.Button>
                  <Radio.Button value="light">Light</Radio.Button>
                </Radio.Group>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <Text strong style={{ color: EnhancedColors.dark.text }}>Language</Text>
                  <br />
                  <Text style={{ fontSize: EnhancedTypography.bodySmall.fontSize, color: EnhancedColors.dark.textSecondary }}>
                    Select your preferred language
                  </Text>
                </div>
                <Select
                  value={settings.language}
                  onChange={(value) => handleSettingChange('language', value)}
                  style={{ width: 120 }}
                >
                  <Option value="en">English</Option>
                  <Option value="es">Español</Option>
                  <Option value="fr">Français</Option>
                  <Option value="de">Deutsch</Option>
                  <Option value="zh">中文</Option>
                </Select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <Text strong style={{ color: EnhancedColors.dark.text }}>Auto Save</Text>
                  <br />
                  <Text style={{ fontSize: EnhancedTypography.bodySmall.fontSize, color: EnhancedColors.dark.textSecondary }}>
                    Automatically save your work
                  </Text>
                </div>
                <Switch
                  checked={settings.autoSave}
                  onChange={(checked) => handleSettingChange('autoSave', checked)}
                />
              </div>

              <div>
                <Text strong style={{ color: EnhancedColors.dark.text }}>Auto Refresh</Text>
                <br />
                <Text style={{ fontSize: EnhancedTypography.bodySmall.fontSize, color: EnhancedColors.dark.textSecondary }}>
                  Data refresh interval in seconds
                </Text>
                <Slider
                  min={10}
                  max={300}
                  value={settings.autoRefresh}
                  onChange={(value) => handleSettingChange('autoRefresh', value)}
                  marks={{
                    10: '10s',
                    30: '30s',
                    60: '1m',
                    120: '2m',
                    300: '5m',
                  }}
                  style={{ marginTop: EnhancedSpacing.md }}
                />
              </div>
            </Space>
          </Card>

          {/* Mining Settings */}
          <Card
            title={
              <Space>
                <ThunderboltOutlined style={{ color: EnhancedColors.warning[500] }} />
                <span>Mining Configuration</span>
              </Space>
            }
            style={{ ...EnhancedComponents.card, marginBottom: EnhancedSpacing.lg }}
            headStyle={{ borderBottom: `1px solid ${EnhancedColors.dark.border}` }}
          >
            <Space direction="vertical" size={EnhancedSpacing.lg} style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <Text strong style={{ color: EnhancedColors.dark.text }}>Start Mining on Startup</Text>
                  <br />
                  <Text style={{ fontSize: EnhancedTypography.bodySmall.fontSize, color: EnhancedColors.dark.textSecondary }}>
                    Automatically begin mining when application starts
                  </Text>
                </div>
                <Switch
                  checked={settings.miningOnStartup}
                  onChange={(checked) => handleSettingChange('miningOnStartup', checked)}
                />
              </div>

              <div>
                <Text strong style={{ color: EnhancedColors.dark.text }}>Maximum Workers</Text>
                <br />
                <Text style={{ fontSize: EnhancedTypography.bodySmall.fontSize, color: EnhancedColors.dark.textSecondary }}>
                  Maximum number of mining workers to use
                </Text>
                <InputNumber
                  min={1}
                  max={16}
                  value={settings.maxWorkers}
                  onChange={(value) => handleSettingChange('maxWorkers', value || 1)}
                  style={{ width: '100%', marginTop: EnhancedSpacing.sm }}
                />
              </div>

              <div>
                <Text strong style={{ color: EnhancedColors.dark.text }}>Mining Intensity</Text>
                <br />
                <Text style={{ fontSize: EnhancedTypography.bodySmall.fontSize, color: EnhancedColors.dark.textSecondary }}>
                  Mining performance intensity (25-100%)
                </Text>
                <Slider
                  min={25}
                  max={100}
                  value={settings.miningIntensity}
                  onChange={(value) => handleSettingChange('miningIntensity', value)}
                  marks={{
                    25: 'Low',
                    50: 'Medium',
                    75: 'High',
                    100: 'Maximum',
                  }}
                  style={{ marginTop: EnhancedSpacing.md }}
                />
              </div>

              <div>
                <Text strong style={{ color: EnhancedColors.dark.text }}>Maximum Temperature</Text>
                <br />
                <Text style={{ fontSize: EnhancedTypography.bodySmall.fontSize, color: EnhancedColors.dark.textSecondary }}>
                  Shutdown mining if temperature exceeds this limit
                </Text>
                <InputNumber
                  min={60}
                  max={95}
                  value={settings.maxTemperature}
                  onChange={(value) => handleSettingChange('maxTemperature', value || 80)}
                  suffix="°C"
                  style={{ width: '100%', marginTop: EnhancedSpacing.sm }}
                />
              </div>
            </Space>
          </Card>

          {/* Notification Settings */}
          <Card
            title={
              <Space>
                <BellOutlined style={{ color: EnhancedColors.info[500] }} />
                <span>Notifications</span>
              </Space>
            }
            style={{ ...EnhancedComponents.card, marginBottom: EnhancedSpacing.lg }}
            headStyle={{ borderBottom: `1px solid ${EnhancedColors.dark.border}` }}
          >
            <Space direction="vertical" size={EnhancedSpacing.lg} style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <Text strong style={{ color: EnhancedColors.dark.text }}>Desktop Notifications</Text>
                  <br />
                  <Text style={{ fontSize: EnhancedTypography.bodySmall.fontSize, color: EnhancedColors.dark.textSecondary }}>
                    Show system notifications for important events
                  </Text>
                </div>
                <Switch
                  checked={settings.desktopNotifications}
                  onChange={(checked) => handleSettingChange('desktopNotifications', checked)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <Text strong style={{ color: EnhancedColors.dark.text }}>Email Notifications</Text>
                  <br />
                  <Text style={{ fontSize: EnhancedTypography.bodySmall.fontSize, color: EnhancedColors.dark.textSecondary }}>
                    Receive email alerts for critical events
                  </Text>
                </div>
                <Switch
                  checked={settings.emailNotifications}
                  onChange={(checked) => handleSettingChange('emailNotifications', checked)}
                />
              </div>

              <div>
                <Text strong style={{ color: EnhancedColors.dark.text }}>Alert Threshold</Text>
                <br />
                <Text style={{ fontSize: EnhancedTypography.bodySmall.fontSize, color: EnhancedColors.dark.textSecondary }}>
                  Trigger alerts when metrics exceed this percentage
                </Text>
                <Slider
                  min={70}
                  max={100}
                  value={settings.alertThreshold}
                  onChange={(value) => handleSettingChange('alertThreshold', value)}
                  marks={{
                    70: '70%',
                    80: '80%',
                    90: '90%',
                    100: '100%',
                  }}
                  style={{ marginTop: EnhancedSpacing.md }}
                />
              </div>
            </Space>
          </Card>

          {/* Security Settings */}
          <Card
            title={
              <Space>
                <SecurityScanOutlined style={{ color: EnhancedColors.error[500] }} />
                <span>Security</span>
              </Space>
            }
            style={{ ...EnhancedComponents.card, marginBottom: EnhancedSpacing.lg }}
            headStyle={{ borderBottom: `1px solid ${EnhancedColors.dark.border}` }}
          >
            <Space direction="vertical" size={EnhancedSpacing.lg} style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <Text strong style={{ color: EnhancedColors.dark.text }}>Two-Factor Authentication</Text>
                  <br />
                  <Text style={{ fontSize: EnhancedTypography.bodySmall.fontSize, color: EnhancedColors.dark.textSecondary }}>
                    Add an extra layer of security to your account
                  </Text>
                </div>
                <Switch
                  checked={settings.twoFactorAuth}
                  onChange={(checked) => handleSettingChange('twoFactorAuth', checked)}
                />
              </div>

              <div>
                <Text strong style={{ color: EnhancedColors.dark.text }}>Session Timeout</Text>
                <br />
                <Text style={{ fontSize: EnhancedTypography.bodySmall.fontSize, color: EnhancedColors.dark.textSecondary }}>
                  Automatically log out after period of inactivity
                </Text>
                <InputNumber
                  min={1}
                  max={168}
                  value={settings.sessionTimeout}
                  onChange={(value) => handleSettingChange('sessionTimeout', value || 24)}
                  suffix="hours"
                  style={{ width: '100%', marginTop: EnhancedSpacing.sm }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <Text strong style={{ color: EnhancedColors.dark.text }}>API Access</Text>
                  <br />
                  <Text style={{ fontSize: EnhancedTypography.bodySmall.fontSize, color: EnhancedColors.dark.textSecondary }}>
                    Enable API access for third-party applications
                  </Text>
                </div>
                <Switch
                  checked={settings.apiAccess}
                  onChange={(checked) => handleSettingChange('apiAccess', checked)}
                />
              </div>

              {settings.apiAccess && (
                <div>
                  <Text strong style={{ color: EnhancedColors.dark.text }}>API Key</Text>
                  <br />
                  <Text style={{ fontSize: EnhancedTypography.bodySmall.fontSize, color: EnhancedColors.dark.textSecondary }}>
                    Your API key for external access
                  </Text>
                  <Input
                    value="ldt_sk_1234567890abcdef1234567890abcdef"
                    type={showApiKey ? 'text' : 'password'}
                    suffix={
                      <Button
                        type="text"
                        icon={showApiKey ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                        onClick={() => setShowApiKey(!showApiKey)}
                        size="small"
                      />
                    }
                    style={{ marginTop: EnhancedSpacing.sm }}
                  />
                </div>
              )}
            </Space>
          </Card>

          {/* Action Buttons */}
          <Space style={{ marginTop: EnhancedSpacing.xl }}>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleSave}
              disabled={!hasChanges}
              style={{
                height: EnhancedComponentSizes.button.lg.height,
                fontWeight: 600,
              }}
            >
              Save Changes
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={handleReset}
              style={{
                height: EnhancedComponentSizes.button.lg.height,
              }}
            >
              Reset to Defaults
            </Button>
          </Space>
        </Col>
      </Row>
    </div>
  );
};

export default SettingsPage;
