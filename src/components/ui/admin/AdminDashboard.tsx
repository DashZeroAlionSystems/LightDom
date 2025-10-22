/**
 * Admin Dashboard Component - Comprehensive Admin Overview
 */

import React, { useState, useEffect } from 'react';
import {
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
  Alert,
  message,
  Modal,
  Row,
  Col,
  Timeline,
  Tag,
  Tooltip,
  Badge,
  Drawer,
  Avatar,
  Spin,
  Empty,
  Statistic,
  Progress,
  List,
  Divider
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
  ClockCircleOutlined,
  UserOutlined,
  FileTextOutlined,
  LockOutlined,
  ArrowLeftOutlined,
  DashboardOutlined,
  TeamOutlined,
  DollarOutlined,
  FileTextOutlined as LogsOutlined,
  BarChartOutlined,
  GlobalOutlined,
  DatabaseOutlined as DbOutlined,
  SettingOutlined as ConfigOutlined
} from '@ant-design/icons';
import { adminSettingsService } from '../../../services/AdminSettingsService';
import { AdminSettings, SettingsChangeLog } from '../../../types/AdminSettingsTypes';
import UserManagement from './UserManagement';
import BillingManagement from './BillingManagement';
import SystemLogs from './SystemLogs';
import SystemMonitoring from './SystemMonitoring';
import SettingsOverview from './SettingsOverview';
import './AdminDashboard.css';

const { TabPane } = Tabs;
const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

interface AdminDashboardProps {
  className?: string;
  onBack?: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ className, onBack }) => {
  const [form] = Form.useForm();
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [changeLogVisible, setChangeLogVisible] = useState(false);
  const [changeLog, setChangeLog] = useState<SettingsChangeLog[]>([]);
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [importData, setImportData] = useState('');
  const [passwordVisible, setPasswordVisible] = useState<Record<string, boolean>>({});
  const [systemStats, setSystemStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalOptimizations: 0,
    systemUptime: '99.9%',
    storageUsed: 0,
    storageTotal: 100,
    apiCalls: 0,
    errors: 0
  });

  useEffect(() => {
    loadSettings();
    loadChangeLog();
    loadSystemStats();
  }, []);

  const loadSystemStats = async () => {
    try {
      // Simulate loading system stats
      setSystemStats({
        totalUsers: 1250,
        activeUsers: 890,
        totalOptimizations: 15600,
        systemUptime: '99.9%',
        storageUsed: 75,
        storageTotal: 100,
        apiCalls: 45600,
        errors: 12
      });
    } catch (error) {
      console.error('Failed to load system stats:', error);
    }
  };

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

  const adminTabs = [
    { key: 'overview', name: 'Overview', icon: <DashboardOutlined />, component: null },
    { key: 'users', name: 'User Management', icon: <TeamOutlined />, component: <UserManagement /> },
    { key: 'billing', name: 'Billing', icon: <DollarOutlined />, component: <BillingManagement /> },
    { key: 'logs', name: 'System Logs', icon: <LogsOutlined />, component: <SystemLogs /> },
    { key: 'monitoring', name: 'Monitoring', icon: <BarChartOutlined />, component: <SystemMonitoring /> },
    { key: 'settings', name: 'Settings', icon: <ConfigOutlined />, component: <SettingsOverview /> }
  ];

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

  const renderAdminOverview = () => (
    <div>
      {/* System Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Users"
              value={systemStats.totalUsers}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Active Users"
              value={systemStats.activeUsers}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Optimizations"
              value={systemStats.totalOptimizations}
              prefix={<ThunderboltOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="System Uptime"
              value={systemStats.systemUptime}
              prefix={<GlobalOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Storage and Performance */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} md={12}>
          <Card title="Storage Usage" extra={<DbOutlined />}>
            <Progress
              percent={systemStats.storageUsed}
              status={systemStats.storageUsed > 80 ? 'exception' : 'active'}
              strokeColor={{
                '0%': '#108ee9',
                '100%': '#87d068',
              }}
            />
            <Text type="secondary">
              {systemStats.storageUsed}GB used of {systemStats.storageTotal}GB total
            </Text>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="API Performance" extra={<ApiOutlined />}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text strong>API Calls Today: </Text>
                <Text>{systemStats.apiCalls.toLocaleString()}</Text>
              </div>
              <div>
                <Text strong>Errors: </Text>
                <Text type={systemStats.errors > 10 ? 'danger' : 'success'}>
                  {systemStats.errors}
                </Text>
              </div>
              <Progress
                percent={((systemStats.apiCalls - systemStats.errors) / systemStats.apiCalls) * 100}
                status="active"
                strokeColor="#52c41a"
              />
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Card title="Quick Actions" style={{ marginBottom: '24px' }}>
        <Row gutter={[16, 16]}>
          {adminTabs.slice(1).map((tab) => (
            <Col xs={24} sm={12} md={8} lg={6} key={tab.key}>
              <Card
                hoverable
                onClick={() => setActiveTab(tab.key)}
                style={{ textAlign: 'center' }}
              >
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div style={{ fontSize: '24px', color: '#1890ff' }}>
                    {tab.icon}
                  </div>
                  <Text strong>{tab.name}</Text>
                </Space>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>

      {/* Recent Activity */}
      <Card title="Recent Activity" extra={<HistoryOutlined />}>
        <List
          dataSource={[
            { action: 'User registration', user: 'john.doe@example.com', time: '2 minutes ago', type: 'success' },
            { action: 'System optimization completed', user: 'System', time: '5 minutes ago', type: 'info' },
            { action: 'Billing payment processed', user: 'jane.smith@example.com', time: '10 minutes ago', type: 'success' },
            { action: 'API error detected', user: 'System', time: '15 minutes ago', type: 'error' },
            { action: 'Settings updated', user: 'admin@lightdom.com', time: '1 hour ago', type: 'info' }
          ]}
          renderItem={item => (
            <List.Item>
              <List.Item.Meta
                avatar={
                  <Avatar
                    style={{
                      backgroundColor: item.type === 'success' ? '#52c41a' : 
                                     item.type === 'error' ? '#ff4d4f' : '#1890ff'
                    }}
                  >
                    {item.type === 'success' ? <CheckCircleOutlined /> :
                     item.type === 'error' ? <ExclamationCircleOutlined /> : <InfoCircleOutlined />}
                  </Avatar>
                }
                title={item.action}
                description={
                  <Space>
                    <Text type="secondary">{item.user}</Text>
                    <Divider type="vertical" />
                    <Text type="secondary">{item.time}</Text>
                  </Space>
                }
              />
            </List.Item>
          )}
        />
      </Card>
    </div>
  );

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
      {/* Header with Back Button */}
      <Card style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {onBack && (
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={onBack}
                type="text"
                size="large"
              >
                Back
              </Button>
            )}
            <Title level={3} style={{ margin: 0 }}>
              <DashboardOutlined /> Admin Dashboard
            </Title>
          </div>
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
            {activeTab === 'settings' && (
              <Button
                type="primary"
                icon={<SaveOutlined />}
                loading={saving}
                onClick={handleSave}
                size="large"
              >
                Save Settings
              </Button>
            )}
          </Space>
        </div>

        <Alert
          message="Admin Dashboard"
          description="Manage users, monitor system performance, and configure application settings from this centralized admin panel."
          type="info"
          showIcon
          style={{ marginBottom: '24px' }}
        />

        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          type="card"
          size="large"
        >
          {adminTabs.map(tab => (
            <TabPane
              tab={
                <Space>
                  {tab.icon}
                  <span>{tab.name}</span>
                </Space>
              }
              key={tab.key}
            >
              {tab.key === 'overview' ? renderAdminOverview() : tab.component}
              {tab.key === 'settings' && (
                <Form form={form} layout="vertical">
                  {categories.map(category => 
                    renderCategory(
                      category.key as keyof AdminSettings,
                      category.name,
                      category.icon
                    )
                  )}
                </Form>
              )}
            </TabPane>
          ))}
        </Tabs>
      </Card>

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
            {changeLog.slice(0, 50).map((change) => (
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