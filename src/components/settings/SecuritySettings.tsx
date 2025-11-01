/**
 * Security Settings Component
 * Comprehensive security configuration with intuitive UX
 */

import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  Select,
  Switch,
  Button,
  Space,
  Typography,
  Divider,
  Row,
  Col,
  Table,
  Tag,
  Alert,
  Modal,
  message,
  Tooltip,
  Progress,
  List,
  Avatar,
  Badge,
  QRCode,
  Transfer,
  Tree,
  Checkbox,
  Radio,
  InputNumber,
  DatePicker,
} from 'antd';
import {
  SecurityScanOutlined,
  LockOutlined,
  UnlockOutlined,
  KeyOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  InfoCircleOutlined,
  UserOutlined,
  TeamOutlined,
  ApiOutlined,
  GlobalOutlined,
  MobileOutlined,
  MailOutlined,
  PhoneOutlined,
  SafetyOutlined,
  AuditOutlined,
  BugOutlined,
  CameraOutlined,
  FingerprintOutlined,
  ScanOutlined,
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  ReloadOutlined,
  SaveOutlined,
  ThunderboltOutlined,
  ClockCircleOutlined,
  HistoryOutlined,
  FileTextOutlined,
  DownloadOutlined,
  UploadOutlined,
} from '@ant-design/icons';

import {
  EnhancedCard,
  EnhancedButton,
  EnhancedInput,
  EnhancedProgress,
  EnhancedTag,
} from '../DesignSystemComponents';
import {
  getSpacing,
  getFlexStyle,
} from '../../utils/StyleUtils';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { Password } = Input;

interface SecuritySettingsProps {
  onSave?: (settings: any) => void;
  onReset?: () => void;
}

const SecuritySettings: React.FC<SecuritySettingsProps> = ({ onSave, onReset }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [securityScore, setSecurityScore] = useState(85);
  const [activeSessions, setActiveSessions] = useState([]);
  const [twoFactorModal, setTwoFactorModal] = useState(false);
  const [apiKeyModal, setApiKeyModal] = useState(false);
  const [auditLogModal, setAuditLogModal] = useState(false);

  const initialValues = {
    // Authentication
    twoFactorAuth: true,
    twoFactorMethod: 'app',
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    lockoutDuration: 15,
    passwordMinLength: 8,
    passwordRequireUppercase: true,
    passwordRequireLowercase: true,
    passwordRequireNumbers: true,
    passwordRequireSymbols: true,
    passwordExpiry: 90,
    
    // Access Control
    ipWhitelist: false,
    allowedIPs: [],
    geoRestriction: false,
    allowedCountries: [],
    roleBasedAccess: true,
    
    // API Security
    apiRateLimit: 1000,
    apiTimeout: 30,
    requireApiKey: true,
    corsEnabled: true,
    allowedOrigins: ['https://lightdom.dev'],
    
    // Monitoring
    loginNotifications: true,
    failedLoginAlerts: true,
    suspiciousActivityDetection: true,
    auditLogging: true,
    logRetention: 90,
    
    // Privacy
    dataEncryption: true,
    secureCookies: true,
    hstsEnabled: true,
    csrfProtection: true,
  };

  useEffect(() => {
    form.setFieldsValue(initialValues);
    loadSecurityData();
  }, [form]);

  const loadSecurityData = async () => {
    // Simulate loading security data
    setActiveSessions([
      {
        id: '1',
        user: 'John Doe',
        device: 'Chrome on Windows',
        location: 'New York, USA',
        ip: '192.168.1.1',
        lastActive: '2 minutes ago',
        status: 'active',
      },
      {
        id: '2',
        user: 'Jane Smith',
        device: 'Safari on iPhone',
        location: 'London, UK',
        ip: '192.168.1.2',
        lastActive: '1 hour ago',
        status: 'active',
      },
    ]);
  };

  const handleValuesChange = (changedValues: any, allValues: any) => {
    setHasChanges(true);
    calculateSecurityScore(allValues);
  };

  const calculateSecurityScore = (values: any) => {
    let score = 0;
    const maxScore = 100;
    
    // Authentication (30 points)
    if (values.twoFactorAuth) score += 10;
    if (values.passwordMinLength >= 12) score += 5;
    if (values.passwordRequireUppercase && values.passwordRequireLowercase && 
        values.passwordRequireNumbers && values.passwordRequireSymbols) score += 10;
    if (values.sessionTimeout <= 30) score += 5;
    
    // Access Control (25 points)
    if (values.ipWhitelist) score += 10;
    if (values.geoRestriction) score += 10;
    if (values.roleBasedAccess) score += 5;
    
    // API Security (25 points)
    if (values.requireApiKey) score += 10;
    if (values.apiRateLimit <= 1000) score += 5;
    if (values.corsEnabled && values.allowedOrigins.length > 0) score += 5;
    if (values.csrfProtection) score += 5;
    
    // Monitoring (20 points)
    if (values.loginNotifications) score += 5;
    if (values.failedLoginAlerts) score += 5;
    if (values.suspiciousActivityDetection) score += 5;
    if (values.auditLogging) score += 5;
    
    setSecurityScore(score);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onSave?.(values);
      setHasChanges(false);
      message.success('Security settings saved successfully!');
    } catch (error) {
      message.error('Failed to save security settings. Please check your input.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    form.setFieldsValue(initialValues);
    setHasChanges(false);
    onReset?.();
    message.info('Security settings reset to defaults');
  };

  const sessionColumns = [
    {
      title: 'User',
      dataIndex: 'user',
      key: 'user',
      render: (user: string) => (
        <Space>
          <Avatar icon={<UserOutlined />} size="small" />
          <Text>{user}</Text>
        </Space>
      ),
    },
    {
      title: 'Device',
      dataIndex: 'device',
      key: 'device',
    },
    {
      title: 'Location',
      dataIndex: 'location',
      key: 'location',
    },
    {
      title: 'IP Address',
      dataIndex: 'ip',
      key: 'ip',
    },
    {
      title: 'Last Active',
      dataIndex: 'lastActive',
      key: 'lastActive',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: any) => (
        <Space>
          <Button type="text" size="small" icon={<EyeOutlined />} />
          <Button type="text" size="small" danger icon={<DeleteOutlined />} />
        </Space>
      ),
    },
  ];

  const getScoreColor = (score: number) => {
    if (score >= 90) return '#52c41a';
    if (score >= 70) return '#fa8c16';
    return '#ff4d4f';
  };

  const getScoreStatus = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 50) return 'Fair';
    return 'Poor';
  };

  return (
    <Space direction="vertical" style={{ width: '100%' }} size="large">
      {/* Header */}
      <div style={getFlexStyle('row', 'space-between', 'center')}>
        <div>
          <Title level={3}>Security Settings</Title>
          <Text type="secondary">Manage authentication, access control, and security monitoring</Text>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={handleReset}>
            Reset
          </Button>
          <EnhancedButton
            variant="primary"
            icon={<SaveOutlined />}
            onClick={handleSave}
            loading={loading}
            disabled={!hasChanges}
          >
            Save Changes
          </EnhancedButton>
        </Space>
      </div>

      {/* Security Score Overview */}
      <EnhancedCard variant="elevated">
        <Row gutter={24} align="middle">
          <Col span={8}>
            <div style={{ textAlign: 'center' }}>
              <Progress
                type="circle"
                percent={securityScore}
                strokeColor={getScoreColor(securityScore)}
                size={120}
              />
              <Title level={4} style={{ marginTop: '16px', color: getScoreColor(securityScore) }}>
                {getScoreStatus(securityScore)}
              </Title>
              <Text type="secondary">Security Score</Text>
            </div>
          </Col>
          <Col span={16}>
            <Space direction="vertical" style={{ width: '100%' }} size="medium">
              <Alert
                message="Security Recommendations"
                description="Enable two-factor authentication and IP whitelisting to improve your security score."
                type="info"
                showIcon
                closable
              />
              <div>
                <Text strong>Security Checklist:</Text>
                <div style={{ marginTop: '8px' }}>
                  <Space wrap>
                    <Tag color="green">2FA Enabled</Tag>
                    <Tag color="green">Strong Passwords</Tag>
                    <Tag color="orange">Session Management</Tag>
                    <Tag color="red">IP Whitelist</Tag>
                    <Tag color="green">Audit Logging</Tag>
                  </Space>
                </div>
              </div>
            </Space>
          </Col>
        </Row>
      </EnhancedCard>

      {hasChanges && (
        <Alert
          message="You have unsaved security changes"
          description="Your changes will be lost if you navigate away without saving."
          type="warning"
          showIcon
          closable
        />
      )}

      <Form
        form={form}
        layout="vertical"
        onValuesChange={handleValuesChange}
      >
        {/* Authentication Settings */}
        <EnhancedCard 
          title={
            <Space>
              <LockOutlined />
              <span>Authentication</span>
            </Space>
          }
          variant="elevated"
        >
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item name="twoFactorAuth" valuePropName="checked">
                <Checkbox>Enable Two-Factor Authentication</Checkbox>
              </Form.Item>
              <Form.Item label="2FA Method" name="twoFactorMethod">
                <Radio.Group>
                  <Radio value="app">Authenticator App</Radio>
                  <Radio value="sms">SMS</Radio>
                  <Radio value="email">Email</Radio>
                </Radio.Group>
              </Form.Item>
            </Col>
            <Col span={12}>
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <QRCode value="otpauth://totp/LightDom:admin@lightdom.dev?secret=JBSWY3DPEHPK3PXP&issuer=LightDom" />
                <div style={{ marginTop: '12px' }}>
                  <Text type="secondary">Scan with authenticator app</Text>
                  <br />
                  <EnhancedButton
                    variant="ghost"
                    size="small"
                    onClick={() => setTwoFactorModal(true)}
                  >
                    Setup Instructions
                  </EnhancedButton>
                </div>
              </div>
            </Col>
          </Row>

          <Divider />

          <Row gutter={24}>
            <Col span={12}>
              <Form.Item label="Session Timeout (minutes)" name="sessionTimeout">
                <Slider
                  min={5}
                  max={120}
                  marks={{
                    5: '5m',
                    30: '30m',
                    60: '1h',
                    120: '2h',
                  }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Max Login Attempts" name="maxLoginAttempts">
                <InputNumber min={3} max={10} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={12}>
              <Form.Item label="Lockout Duration (minutes)" name="lockoutDuration">
                <InputNumber min={5} max={60} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Password Expiry (days)" name="passwordExpiry">
                <InputNumber min={30} max={365} />
              </Form.Item>
            </Col>
          </Row>

          <Divider />

          <Title level={5}>Password Requirements</Title>
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item label="Minimum Length" name="passwordMinLength">
                <Slider
                  min={6}
                  max={20}
                  marks={{
                    6: '6',
                    8: '8',
                    12: '12',
                    16: '16',
                    20: '20',
                  }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Space direction="vertical">
                <Form.Item name="passwordRequireUppercase" valuePropName="checked">
                  <Checkbox>Require Uppercase Letters</Checkbox>
                </Form.Item>
                <Form.Item name="passwordRequireLowercase" valuePropName="checked">
                  <Checkbox>Require Lowercase Letters</Checkbox>
                </Form.Item>
                <Form.Item name="passwordRequireNumbers" valuePropName="checked">
                  <Checkbox>Require Numbers</Checkbox>
                </Form.Item>
                <Form.Item name="passwordRequireSymbols" valuePropName="checked">
                  <Checkbox>Require Special Characters</Checkbox>
                </Form.Item>
              </Space>
            </Col>
          </Row>
        </EnhancedCard>

        {/* Access Control */}
        <EnhancedCard 
          title={
            <Space>
              <SafetyOutlined />
              <span>Access Control</span>
            </Space>
          }
          variant="elevated"
        >
          <Row gutter={24}>
            <Col span={12}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Form.Item name="ipWhitelist" valuePropName="checked">
                  <Checkbox>Enable IP Whitelist</Checkbox>
                </Form.Item>
                <Form.Item name="geoRestriction" valuePropName="checked">
                  <Checkbox>Enable Geographic Restrictions</Checkbox>
                </Form.Item>
                <Form.Item name="roleBasedAccess" valuePropName="checked">
                  <Checkbox>Enable Role-Based Access Control</Checkbox>
                </Form.Item>
              </Space>
            </Col>
            <Col span={12}>
              <Alert
                message="Access Control Tips"
                description="IP whitelisting and geo-restrictions provide an additional layer of security but may limit legitimate access."
                type="info"
                showIcon
              />
            </Col>
          </Row>
        </EnhancedCard>

        {/* API Security */}
        <EnhancedCard 
          title={
            <Space>
              <ApiOutlined />
              <span>API Security</span>
            </Space>
          }
          variant="elevated"
        >
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item label="Rate Limit (requests/hour)" name="apiRateLimit">
                <Slider
                  min={100}
                  max={10000}
                  step={100}
                  marks={{
                    100: '100',
                    1000: '1k',
                    5000: '5k',
                    10000: '10k',
                  }}
                />
              </Form.Item>
              <Form.Item label="API Timeout (seconds)" name="apiTimeout">
                <InputNumber min={10} max={120} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Form.Item name="requireApiKey" valuePropName="checked">
                  <Checkbox>Require API Key</Checkbox>
                </Form.Item>
                <Form.Item name="corsEnabled" valuePropName="checked">
                  <Checkbox>Enable CORS</Checkbox>
                </Form.Item>
                <Form.Item name="csrfProtection" valuePropName="checked">
                  <Checkbox>Enable CSRF Protection</Checkbox>
                </Form.Item>
                <EnhancedButton
                  variant="ghost"
                  icon={<KeyOutlined />}
                  onClick={() => setApiKeyModal(true)}
                >
                  Manage API Keys
                </EnhancedButton>
              </Space>
            </Col>
          </Row>
        </EnhancedCard>

        {/* Monitoring */}
        <EnhancedCard 
          title={
            <Space>
              <AuditOutlined />
              <span>Security Monitoring</span>
            </Space>
          }
          variant="elevated"
        >
          <Row gutter={24}>
            <Col span={12}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Form.Item name="loginNotifications" valuePropName="checked">
                  <Checkbox>Login Notifications</Checkbox>
                </Form.Item>
                <Form.Item name="failedLoginAlerts" valuePropName="checked">
                  <Checkbox>Failed Login Alerts</Checkbox>
                </Form.Item>
                <Form.Item name="suspiciousActivityDetection" valuePropName="checked">
                  <Checkbox>Suspicious Activity Detection</Checkbox>
                </Form.Item>
                <Form.Item name="auditLogging" valuePropName="checked">
                  <Checkbox>Enable Audit Logging</Checkbox>
                </Form.Item>
              </Space>
            </Col>
            <Col span={12}>
              <Form.Item label="Log Retention (days)" name="logRetention">
                <Slider
                  min={30}
                  max={365}
                  marks={{
                    30: '30',
                    90: '90',
                    180: '180',
                    365: '365',
                  }}
                />
              </Form.Item>
              <EnhancedButton
                variant="ghost"
                icon={<HistoryOutlined />}
                onClick={() => setAuditLogModal(true)}
              >
                View Audit Logs
              </EnhancedButton>
            </Col>
          </Row>
        </EnhancedCard>

        {/* Active Sessions */}
        <EnhancedCard 
          title={
            <Space>
              <UserOutlined />
              <span>Active Sessions</span>
              <Badge count={activeSessions.length} />
            </Space>
          }
          variant="elevated"
        >
          <Table
            columns={sessionColumns}
            dataSource={activeSessions}
            pagination={false}
            size="small"
          />
        </EnhancedCard>
      </Form>

      {/* 2FA Setup Modal */}
      <Modal
        title="Two-Factor Authentication Setup"
        open={twoFactorModal}
        onCancel={() => setTwoFactorModal(false)}
        footer={[
          <Button key="cancel" onClick={() => setTwoFactorModal(false)}>
            Cancel
          </Button>,
          <EnhancedButton key="setup" variant="primary" onClick={() => {
            message.success('2FA setup completed');
            setTwoFactorModal(false);
          }}>
            Complete Setup
          </EnhancedButton>,
        ]}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <Alert
            message="Setup Instructions"
            description="1. Download an authenticator app (Google Authenticator, Authy, etc.)\n2. Scan the QR code with your app\n3. Enter the 6-digit code below to verify"
            type="info"
            showIcon
          />
          <div style={{ textAlign: 'center' }}>
            <QRCode value="otpauth://totp/LightDom:admin@lightdom.dev?secret=JBSWY3DPEHPK3PXP&issuer=LightDom" />
          </div>
          <Form.Item label="Verification Code">
            <Input.OTP length={6} />
          </Form.Item>
        </Space>
      </Modal>

      {/* API Keys Modal */}
      <Modal
        title="API Keys Management"
        open={apiKeyModal}
        onCancel={() => setApiKeyModal(false)}
        footer={[
          <Button key="cancel" onClick={() => setApiKeyModal(false)}>
            Close
          </Button>,
          <EnhancedButton key="create" variant="primary" icon={<PlusOutlined />}>
            Create New Key
          </EnhancedButton>,
        ]}
        width={800}
      >
        <List
          dataSource={[
            { key: 'ld_prod_123456', name: 'Production API', created: '2024-01-15', lastUsed: '2 hours ago' },
            { key: 'ld_dev_789012', name: 'Development API', created: '2024-01-10', lastUsed: '1 day ago' },
          ]}
          renderItem={(item) => (
            <List.Item
              actions={[
                <Button type="text" icon={<EyeOutlined />} />,
                <Button type="text" icon={<EditOutlined />} />,
                <Button type="text" danger icon={<DeleteOutlined />} />,
              ]}
            >
              <List.Item.Meta
                title={item.name}
                description={`Key: ${item.key.substring(0, 10)}...`}
              />
              <div>
                <Text type="secondary">Created: {item.created}</Text>
                <br />
                <Text type="secondary">Last used: {item.lastUsed}</Text>
              </div>
            </List.Item>
          )}
        />
      </Modal>

      {/* Audit Logs Modal */}
      <Modal
        title="Security Audit Logs"
        open={auditLogModal}
        onCancel={() => setAuditLogModal(false)}
        footer={[
          <Button key="cancel" onClick={() => setAuditLogModal(false)}>
            Close
          </Button>,
          <EnhancedButton key="export" variant="ghost" icon={<DownloadOutlined />}>
            Export Logs
          </EnhancedButton>,
        ]}
        width={800}
      >
        <List
          dataSource={[
            { action: 'Login Successful', user: 'admin@lightdom.dev', ip: '192.168.1.1', time: '2024-01-20 10:30:00' },
            { action: 'Settings Changed', user: 'admin@lightdom.dev', ip: '192.168.1.1', time: '2024-01-20 10:25:00' },
            { action: 'Failed Login Attempt', user: 'unknown', ip: '192.168.1.100', time: '2024-01-20 10:20:00' },
          ]}
          renderItem={(item) => (
            <List.Item>
              <List.Item.Meta
                avatar={<Avatar icon={<AuditOutlined />} />}
                title={item.action}
                description={`${item.user} from ${item.ip}`}
              />
              <Text type="secondary">{item.time}</Text>
            </List.Item>
          )}
        />
      </Modal>
    </Space>
  );
};

export default SecuritySettings;
