/**
 * Admin Dashboard Component
 * Comprehensive admin interface for managing application settings
 */

import React, { useState, useEffect } from 'react';
import {
  Layout,
  Card,
  Tabs,
  Form,
  Input,
  InputNumber,
  Switch,
  Select,
  Button,
  Space,
  Typography,
  Divider,
  Alert,
  message,
  Modal,
  Upload,
  Row,
  Col,
  Statistic,
  Timeline,
  Tag,
  Tooltip,
  Collapse,
  Badge,
  Drawer,
  List,
  Avatar,
  Descriptions,
  Progress,
  Spin,
  Empty,
  Result
} from 'antd';
import {
  SettingOutlined,
  ThunderboltOutlined,
  BlockOutlined,
  SecurityScanOutlined,
  ApiOutlined,
  BgColorsOutlined,
  DatabaseOutlined,
  MailOutlined,
  MonitorOutlined,
  SaveOutlined,
  ReloadOutlined,
  ExportOutlined,
  ImportOutlined,
  HistoryOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  WarningOutlined,
  ClockCircleOutlined,
  UserOutlined,
  DownloadOutlined,
  UploadOutlined,
  FileTextOutlined,
  LockOutlined,
  UnlockOutlined,
  EyeOutlined,
  EyeInvisibleOutlined
} from '@ant-design/icons';
// Fallback in-memory admin settings service for dev
const adminSettingsService = {
  getAllSettings: () => ({
    general: { environment: 'development', appName: 'LightDom' },
    performance: {},
    blockchain: {},
    security: {},
    api: {},
    ui: {},
    database: {},
    email: {},
    monitoring: {}
  }),
  getChangeLog: () => [],
  updateMultipleSettings: () => ({ isValid: true, errors: {} }),
  resetToDefaults: () => {},
  exportSettings: () => JSON.stringify({}),
  importSettings: () => ({ isValid: true, errors: {} })
};
import { AdminSettings, SettingsChangeLog } from '../../types/AdminSettingsTypes';
import './AdminDashboard.css';

const { Header, Content, Sider } = Layout;
const { TabPane } = Tabs;
const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;
const { TextArea } = Input;

interface AdminDashboardProps {
  className?: string;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ className }) => {
  const [form] = Form.useForm();
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('general');
  const [changeLogVisible, setChangeLogVisible] = useState(false);
  const [changeLog, setChangeLog] = useState<SettingsChangeLog[]>([]);
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [importData, setImportData] = useState('');
  const [passwordVisible, setPasswordVisible] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadSettings();
    loadChangeLog();
  }, []);

  const loadSettings = () => {
    setLoading(true);
    try {
      const allSettings = adminSettingsService.getAllSettings();
      setSettings(allSettings);
      form.setFieldsValue(allSettings);
    } catch (error) {
      message.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const loadChangeLog = () => {
    try {
      const log = adminSettingsService.getChangeLog();
      setChangeLog(log);
    } catch (error) {
      console.error('Failed to load change log:', error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const values = await form.validateFields();
      const result = adminSettingsService.updateMultipleSettings(
        Object.entries(values).flatMap(([category, categoryValues]) =>
          Object.entries(categoryValues as any).map(([key, value]) => ({
            category: category as keyof AdminSettings,
            key,
            value
          }))
        ),
        'admin',
        'Settings updated via admin dashboard'
      );

      if (result.isValid) {
        message.success('Settings saved successfully');
        loadSettings();
        loadChangeLog();
      } else {
        message.error('Validation failed: ' + Object.values(result.errors).join(', '));
      }
    } catch (error) {
      message.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    Modal.confirm({
      title: 'Reset to Defaults',
      content: 'Are you sure you want to reset all settings to their default values? This action cannot be undone.',
      onOk: () => {
        adminSettingsService.resetToDefaults('admin');
        loadSettings();
        loadChangeLog();
        message.success('Settings reset to defaults');
      }
    });
  };

  const handleExport = () => {
    const settingsJson = adminSettingsService.exportSettings();
    const blob = new Blob([settingsJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'lightdom-settings.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    message.success('Settings exported successfully');
  };

  const handleImport = () => {
    try {
      const result = adminSettingsService.importSettings(importData, 'admin');
      if (result.isValid) {
        message.success('Settings imported successfully');
        setImportModalVisible(false);
        setImportData('');
        loadSettings();
        loadChangeLog();
      } else {
        message.error('Import failed: ' + Object.values(result.errors).join(', '));
      }
    } catch (error) {
      message.error('Failed to import settings');
    }
  };

  const togglePasswordVisibility = (key: string) => {
    setPasswordVisible(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const getFieldType = (key: string, value: any): 'string' | 'number' | 'boolean' | 'select' | 'textarea' | 'password' => {
    if (typeof value === 'boolean') return 'boolean';
    if (typeof value === 'number') return 'number';
    if (key.toLowerCase().includes('password') || key.toLowerCase().includes('secret') || key.toLowerCase().includes('key')) {
      return 'password';
    }
    if (key.toLowerCase().includes('description') || key.toLowerCase().includes('template')) {
      return 'textarea';
    }
    if (key === 'environment' || key === 'theme' || key === 'logLevel' || key === 'provider' || key === 'cacheStrategy') {
      return 'select';
    }
    return 'string';
  };

  const getSelectOptions = (key: string) => {
    const options: Record<string, Array<{ label: string; value: any }>> = {
      environment: [
        { label: 'Development', value: 'development' },
        { label: 'Staging', value: 'staging' },
        { label: 'Production', value: 'production' }
      ],
      theme: [
        { label: 'Light', value: 'light' },
        { label: 'Dark', value: 'dark' },
        { label: 'Auto', value: 'auto' }
      ],
      logLevel: [
        { label: 'Debug', value: 'debug' },
        { label: 'Info', value: 'info' },
        { label: 'Warn', value: 'warn' },
        { label: 'Error', value: 'error' }
      ],
      provider: [
        { label: 'SMTP', value: 'smtp' },
        { label: 'SendGrid', value: 'sendgrid' },
        { label: 'Mailgun', value: 'mailgun' },
        { label: 'AWS SES', value: 'ses' }
      ],
      cacheStrategy: [
        { label: 'Memory', value: 'memory' },
        { label: 'Redis', value: 'redis' },
        { label: 'Database', value: 'database' }
      ],
      network: [
        { label: 'Mainnet', value: 'mainnet' },
        { label: 'Testnet', value: 'testnet' },
        { label: 'Local', value: 'local' }
      ],
      logFormat: [
        { label: 'JSON', value: 'json' },
        { label: 'Text', value: 'text' }
      ],
      errorTrackingService: [
        { label: 'Sentry', value: 'sentry' },
        { label: 'Bugsnag', value: 'bugsnag' },
        { label: 'Rollbar', value: 'rollbar' }
      ]
    };
    return options[key] || [];
  };

  const renderField = (category: keyof AdminSettings, key: string, value: any) => {
    const fieldType = getFieldType(key, value);
    const fieldName = `${category}.${key}`;

    switch (fieldType) {
      case 'boolean':
        return (
          <Form.Item
            name={fieldName}
            valuePropName="checked"
            label={
              <Space>
                <Text strong>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</Text>
                <Tooltip title={`Toggle ${key}`}>
                  <InfoCircleOutlined style={{ color: '#1890ff' }} />
                </Tooltip>
              </Space>
            }
          >
            <Switch />
          </Form.Item>
        );

      case 'number':
        return (
          <Form.Item
            name={fieldName}
            label={
              <Space>
                <Text strong>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</Text>
                <Tooltip title={`Numeric value for ${key}`}>
                  <InfoCircleOutlined style={{ color: '#1890ff' }} />
                </Tooltip>
              </Space>
            }
          >
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
        );

      case 'password':
        return (
          <Form.Item
            name={fieldName}
            label={
              <Space>
                <Text strong>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</Text>
                <Tooltip title={`Password field for ${key}`}>
                  <LockOutlined style={{ color: '#1890ff' }} />
                </Tooltip>
              </Space>
            }
          >
            <Input.Password
              visibilityToggle={{
                visible: passwordVisible[fieldName],
                onVisibleChange: () => togglePasswordVisibility(fieldName)
              }}
            />
          </Form.Item>
        );

      case 'textarea':
        return (
          <Form.Item
            name={fieldName}
            label={
              <Space>
                <Text strong>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</Text>
                <Tooltip title={`Multi-line text for ${key}`}>
                  <FileTextOutlined style={{ color: '#1890ff' }} />
                </Tooltip>
              </Space>
            }
          >
            <TextArea rows={3} />
          </Form.Item>
        );

      case 'select':
        const options = getSelectOptions(key);
        return (
          <Form.Item
            name={fieldName}
            label={
              <Space>
                <Text strong>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</Text>
                <Tooltip title={`Select option for ${key}`}>
                  <InfoCircleOutlined style={{ color: '#1890ff' }} />
                </Tooltip>
              </Space>
            }
          >
            <Select options={options} />
          </Form.Item>
        );

      default:
        return (
          <Form.Item
            name={fieldName}
            label={
              <Space>
                <Text strong>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</Text>
                <Tooltip title={`Text input for ${key}`}>
                  <InfoCircleOutlined style={{ color: '#1890ff' }} />
                </Tooltip>
              </Space>
            }
          >
            <Input />
          </Form.Item>
        );
    }
  };

  const renderCategory = (category: keyof AdminSettings, categoryName: string, icon: React.ReactNode) => {
    if (!settings) return null;

    const categorySettings = settings[category];
    const settingEntries = Object.entries(categorySettings);

    return (
      <TabPane
        tab={
          <Space>
            {icon}
            <span>{categoryName}</span>
            <Badge count={settingEntries.length} style={{ backgroundColor: '#52c41a' }} />
          </Space>
        }
        key={category}
      >
        <Card>
          <Title level={4}>
            <Space>
              {icon}
              {categoryName} Settings
            </Space>
          </Title>
          <Paragraph type="secondary">
            Configure {categoryName.toLowerCase()} related settings for your application.
          </Paragraph>
          
          <Row gutter={[24, 16]}>
            {settingEntries.map(([key, value]) => (
              <Col xs={24} sm={12} md={8} lg={6} key={key}>
                {renderField(category, key, value)}
              </Col>
            ))}
          </Row>
        </Card>
      </TabPane>
    );
  };

  const categories = [
    { key: 'general', name: 'General', icon: <SettingOutlined /> },
    { key: 'performance', name: 'Performance', icon: <ThunderboltOutlined /> },
    { key: 'blockchain', name: 'Blockchain', icon: <BlockOutlined /> },
    { key: 'security', name: 'Security', icon: <SecurityScanOutlined /> },
    { key: 'api', name: 'API', icon: <ApiOutlined /> },
    { key: 'ui', name: 'User Interface', icon: <BgColorsOutlined /> },
    { key: 'database', name: 'Database', icon: <DatabaseOutlined /> },
    { key: 'email', name: 'Email', icon: <MailOutlined /> },
    { key: 'monitoring', name: 'Monitoring', icon: <MonitorOutlined /> }
  ];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <div style={{ marginTop: '16px' }}>
          <Text>Loading admin settings...</Text>
        </div>
      </div>
    );
  }

  return (
    <div className={`admin-dashboard ${className || ''}`}>
      <Layout>
        <Header className="admin-header">
          <div className="header-content">
            <Title level={2} style={{ color: 'white', margin: 0 }}>
              <SettingOutlined /> Admin Dashboard
            </Title>
            <Space>
              <Button
                icon={<HistoryOutlined />}
                onClick={() => setChangeLogVisible(true)}
              >
                Change Log
              </Button>
              <Button
                icon={<ExportOutlined />}
                onClick={handleExport}
              >
                Export
              </Button>
              <Button
                icon={<ImportOutlined />}
                onClick={() => setImportModalVisible(true)}
              >
                Import
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={handleReset}
                danger
              >
                Reset
              </Button>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                loading={saving}
                onClick={handleSave}
                size="large"
              >
                Save Settings
              </Button>
            </Space>
          </div>
        </Header>

        <Content className="admin-content">
          <Alert
            message="Admin Settings"
            description="Configure all application settings from this centralized dashboard. Changes are automatically validated and logged."
            type="info"
            showIcon
            style={{ marginBottom: '24px' }}
          />

          <Form form={form} layout="vertical">
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              type="card"
              size="large"
            >
              {categories.map(category => 
                renderCategory(
                  category.key as keyof AdminSettings,
                  category.name,
                  category.icon
                )
              )}
            </Tabs>
          </Form>
        </Content>
      </Layout>

      {/* Change Log Drawer */}
      <Drawer
        title={
          <Space>
            <HistoryOutlined />
            <span>Settings Change Log</span>
            <Badge count={changeLog.length} style={{ backgroundColor: '#52c41a' }} />
          </Space>
        }
        placement="right"
        onClose={() => setChangeLogVisible(false)}
        open={changeLogVisible}
        width={600}
      >
        {changeLog.length === 0 ? (
          <Empty description="No changes recorded" />
        ) : (
          <Timeline>
            {changeLog.slice(0, 50).map((change, index) => (
              <Timeline.Item
                key={change.id}
                dot={
                  <Avatar
                    size="small"
                    icon={<UserOutlined />}
                    style={{ backgroundColor: '#1890ff' }}
                  />
                }
              >
                <Card size="small">
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Space>
                      <Text strong>{change.settingId}</Text>
                      <Tag color="blue">{change.changedBy}</Tag>
                    </Space>
                    <Space>
                      <Text type="secondary">From:</Text>
                      <Text code>{JSON.stringify(change.oldValue)}</Text>
                    </Space>
                    <Space>
                      <Text type="secondary">To:</Text>
                      <Text code>{JSON.stringify(change.newValue)}</Text>
                    </Space>
                    <Space>
                      <ClockCircleOutlined />
                      <Text type="secondary">{change.changedAt.toLocaleString()}</Text>
                    </Space>
                    {change.reason && (
                      <Space>
                        <Text type="secondary">Reason:</Text>
                        <Text italic>{change.reason}</Text>
                      </Space>
                    )}
                  </Space>
                </Card>
              </Timeline.Item>
            ))}
          </Timeline>
        )}
      </Drawer>

      {/* Import Modal */}
      <Modal
        title="Import Settings"
        open={importModalVisible}
        onOk={handleImport}
        onCancel={() => setImportModalVisible(false)}
        width={600}
      >
        <Alert
          message="Import Settings"
          description="Paste your exported settings JSON below. This will overwrite all current settings."
          type="warning"
          showIcon
          style={{ marginBottom: '16px' }}
        />
        <TextArea
          rows={10}
          value={importData}
          onChange={(e) => setImportData(e.target.value)}
          placeholder="Paste your settings JSON here..."
        />
      </Modal>
    </div>
  );
};

export default AdminDashboard;