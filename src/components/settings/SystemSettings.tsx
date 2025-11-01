/**
 * System Settings Component
 * Comprehensive system configuration with performance and monitoring settings
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
  Slider,
  InputNumber,
  DatePicker,
  TimePicker,
  Checkbox,
  Radio,
  Upload,
  Statistic,
  Tabs,
  Tree,
  Transfer,
} from 'antd';
import {
  SettingOutlined,
  MonitorOutlined,
  DatabaseOutlined,
  CloudOutlined,
  SafetyOutlined,
  ApiOutlined,
  ThunderboltOutlined,
  ClockCircleOutlined,
  SyncOutlined,
  ReloadOutlined,
  SaveOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  StopOutlined,
  DownloadOutlined,
  UploadOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  InfoCircleOutlined,
  BugOutlined,
  CodeOutlined,
  FileTextOutlined,
  BarChartOutlined,
  LineChartOutlined,
  PieChartOutlined,
  HeatMapOutlined,
  RadarChartOutlined,
  StockOutlined,
  FireOutlined,
  RocketOutlined,
  ToolOutlined,
  ControlOutlined,
  DeploymentUnitOutlined,
  HddOutlined,
  CloudServerOutlined,
  AuditOutlined,
  HistoryOutlined,
  CalendarOutlined,
  MailOutlined,
  BellOutlined,
  MessageOutlined,
  TeamOutlined,
  UserOutlined,
  LockOutlined,
  UnlockOutlined,
  KeyOutlined,
  GlobalOutlined,
  MobileOutlined,
  DesktopOutlined,
  TabletOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';

import {
  EnhancedCard,
  EnhancedButton,
  EnhancedInput,
  EnhancedProgress,
  EnhancedStatistic,
  EnhancedTag,
} from '../DesignSystemComponents';
import {
  getSpacing,
  getFlexStyle,
} from '../../utils/StyleUtils';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;

interface SystemSettingsProps {
  onSave?: (settings: any) => void;
  onReset?: () => void;
}

const SystemSettings: React.FC<SystemSettingsProps> = ({ onSave, onReset }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [systemStatus, setSystemStatus] = useState({
    cpu: 45,
    memory: 62,
    disk: 78,
    network: 23,
  });
  const [services, setServices] = useState([
    { name: 'API Server', status: 'running', uptime: '15d 8h', cpu: 12, memory: 256 },
    { name: 'Database', status: 'running', uptime: '30d 12h', cpu: 8, memory: 512 },
    { name: 'Cache Server', status: 'running', uptime: '15d 8h', cpu: 5, memory: 128 },
    { name: 'Background Worker', status: 'running', uptime: '7d 2h', cpu: 15, memory: 64 },
  ]);

  const initialValues = {
    // General System
    environment: 'production',
    debugMode: false,
    maintenanceMode: false,
    systemName: 'LightDom Platform',
    version: '2.1.0',
    
    // Performance
    maxConnections: 1000,
    connectionTimeout: 30,
    requestTimeout: 60,
    cacheEnabled: true,
    cacheTtl: 3600,
    compressionEnabled: true,
    
    // Database
    dbHost: 'localhost',
    dbPort: 5432,
    dbName: 'lightdom',
    dbPoolSize: 20,
    dbTimeout: 30,
    backupEnabled: true,
    backupSchedule: '0 2 * * *',
    backupRetention: 30,
    
    // Logging
    logLevel: 'info',
    logToFile: true,
    logToDatabase: true,
    logRetention: 90,
    auditLogEnabled: true,
    
    // Email
    smtpEnabled: true,
    smtpHost: 'smtp.lightdom.dev',
    smtpPort: 587,
    smtpSecure: true,
    emailFrom: 'noreply@lightdom.dev',
    
    // Storage
    storageType: 'local',
    storagePath: '/var/lib/lightdom',
    maxFileSize: 100,
    allowedFileTypes: ['jpg', 'png', 'pdf', 'doc', 'docx'],
    
    // Security
    sslEnabled: true,
    sslCertificate: '',
    sslPrivateKey: '',
    allowedOrigins: ['https://lightdom.dev'],
    rateLimitEnabled: true,
    rateLimitRequests: 1000,
  };

  useEffect(() => {
    form.setFieldsValue(initialValues);
    loadSystemData();
    const interval = setInterval(loadSystemData, 5000);
    return () => clearInterval(interval);
  }, [form]);

  const loadSystemData = async () => {
    // Simulate loading system data
    setSystemStatus({
      cpu: Math.floor(Math.random() * 30) + 30,
      memory: Math.floor(Math.random() * 20) + 50,
      disk: Math.floor(Math.random() * 10) + 70,
      network: Math.floor(Math.random() * 40) + 10,
    });
  };

  const handleValuesChange = (changedValues: any, allValues: any) => {
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onSave?.(values);
      setHasChanges(false);
      message.success('System settings saved successfully!');
    } catch (error) {
      message.error('Failed to save system settings. Please check your input.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    form.setFieldsValue(initialValues);
    setHasChanges(false);
    onReset?.();
    message.info('System settings reset to defaults');
  };

  const handleRestartService = async (serviceName: string) => {
    message.loading(`Restarting ${serviceName}...`, 0);
    await new Promise(resolve => setTimeout(resolve, 2000));
    message.destroy();
    message.success(`${serviceName} restarted successfully`);
  };

  const handleSystemBackup = async () => {
    message.loading('Creating system backup...', 0);
    await new Promise(resolve => setTimeout(resolve, 3000));
    message.destroy();
    message.success('System backup completed successfully');
  };

  const serviceColumns = [
    {
      title: 'Service',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => (
        <Space>
          <SafetyOutlined />
          <Text strong>{name}</Text>
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <EnhancedTag color={status === 'running' ? 'success' : 'error'}>
          {status}
        </EnhancedTag>
      ),
    },
    {
      title: 'Uptime',
      dataIndex: 'uptime',
      key: 'uptime',
    },
    {
      title: 'CPU',
      dataIndex: 'cpu',
      key: 'cpu',
      render: (cpu: number) => (
        <EnhancedProgress percent={cpu} size="small" />
      ),
    },
    {
      title: 'Memory',
      dataIndex: 'memory',
      key: 'memory',
      render: (memory: number) => (
        <Text>{memory} MB</Text>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: any) => (
        <Space>
          <Button
            type="text"
            size="small"
            icon={<ReloadOutlined />}
            onClick={() => handleRestartService(record.name)}
          />
          <Button type="text" size="small" icon={<StopOutlined />} danger />
        </Space>
      ),
    },
  ];

  const getStatusColor = (value: number) => {
    if (value < 50) return '#52c41a';
    if (value < 80) return '#fa8c16';
    return '#ff4d4f';
  };

  return (
    <Space direction="vertical" style={{ width: '100%' }} size="large">
      {/* Header */}
      <div style={getFlexStyle('row', 'space-between', 'center')}>
        <div>
          <Title level={3}>System Settings</Title>
          <Text type="secondary">Configure system performance, database, and monitoring settings</Text>
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

      {/* System Status Overview */}
      <EnhancedCard variant="elevated">
        <Row gutter={24}>
          <Col span={12}>
            <Title level={4}>System Resources</Title>
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <div>
                <div style={getFlexStyle('row', 'space-between', 'center')}>
                  <Text strong>CPU Usage</Text>
                  <Text>{systemStatus.cpu}%</Text>
                </div>
                <Progress percent={systemStatus.cpu} strokeColor={getStatusColor(systemStatus.cpu)} />
              </div>
              <div>
                <div style={getFlexStyle('row', 'space-between', 'center')}>
                  <Text strong>Memory Usage</Text>
                  <Text>{systemStatus.memory}%</Text>
                </div>
                <Progress percent={systemStatus.memory} strokeColor={getStatusColor(systemStatus.memory)} />
              </div>
              <div>
                <div style={getFlexStyle('row', 'space-between', 'center')}>
                  <Text strong>Disk Usage</Text>
                  <Text>{systemStatus.disk}%</Text>
                </div>
                <Progress percent={systemStatus.disk} strokeColor={getStatusColor(systemStatus.disk)} />
              </div>
              <div>
                <div style={getFlexStyle('row', 'space-between', 'center')}>
                  <Text strong>Network Usage</Text>
                  <Text>{systemStatus.network}%</Text>
                </div>
                <Progress percent={systemStatus.network} strokeColor={getStatusColor(systemStatus.network)} />
              </div>
            </Space>
          </Col>
          <Col span={12}>
            <Title level={4}>Quick Actions</Title>
            <Space direction="vertical" style={{ width: '100%' }}>
              <EnhancedButton
                variant="primary"
                icon={<DownloadOutlined />}
                onClick={handleSystemBackup}
                fullWidth
              >
                Create System Backup
              </EnhancedButton>
              <EnhancedButton
                variant="secondary"
                icon={<ReloadOutlined />}
                onClick={() => message.info('System cache cleared')}
                fullWidth
              >
                Clear System Cache
              </EnhancedButton>
              <EnhancedButton
                variant="ghost"
                icon={<SyncOutlined />}
                onClick={() => message.info('System synchronization started')}
                fullWidth
              >
                Synchronize System
              </EnhancedButton>
            </Space>
          </Col>
        </Row>
      </EnhancedCard>

      {hasChanges && (
        <Alert
          message="You have unsaved system changes"
          description="Your changes will be lost if you navigate away without saving."
          type="warning"
          showIcon
          closable
        />
      )}

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="General" key="general">
          <Form
            form={form}
            layout="vertical"
            onValuesChange={handleValuesChange}
          >
            <EnhancedCard title="System Configuration" variant="elevated">
              <Row gutter={24}>
                <Col span={12}>
                  <Form.Item label="Environment" name="environment">
                    <Select>
                      <Option value="development">Development</Option>
                      <Option value="staging">Staging</Option>
                      <Option value="production">Production</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="System Name" name="systemName">
                    <EnhancedInput />
                  </Form.Item>
                </Col>
              </Row>
              
              <Row gutter={24}>
                <Col span={12}>
                  <Form.Item label="Version" name="version">
                    <EnhancedInput />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Space direction="vertical">
                    <Form.Item name="debugMode" valuePropName="checked">
                      <Checkbox>Debug Mode</Checkbox>
                    </Form.Item>
                    <Form.Item name="maintenanceMode" valuePropName="checked">
                      <Checkbox>Maintenance Mode</Checkbox>
                    </Form.Item>
                  </Space>
                </Col>
              </Row>
            </EnhancedCard>

            <EnhancedCard title="Performance Settings" variant="elevated">
              <Row gutter={24}>
                <Col span={12}>
                  <Form.Item label="Max Connections" name="maxConnections">
                    <InputNumber min={100} max={10000} />
                  </Form.Item>
                  <Form.Item label="Connection Timeout (seconds)" name="connectionTimeout">
                    <InputNumber min={5} max={300} />
                  </Form.Item>
                  <Form.Item label="Request Timeout (seconds)" name="requestTimeout">
                    <InputNumber min={10} max={600} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Form.Item name="cacheEnabled" valuePropName="checked">
                      <Checkbox>Enable Cache</Checkbox>
                    </Form.Item>
                    <Form.Item label="Cache TTL (seconds)" name="cacheTtl">
                      <InputNumber min={60} max={86400} />
                    </Form.Item>
                    <Form.Item name="compressionEnabled" valuePropName="checked">
                      <Checkbox>Enable Compression</Checkbox>
                    </Form.Item>
                  </Space>
                </Col>
              </Row>
            </EnhancedCard>
          </Form>
        </TabPane>

        <TabPane tab="Database" key="database">
          <EnhancedCard title="Database Configuration" variant="elevated">
            <Row gutter={24}>
              <Col span={12}>
                <Form.Item label="Database Host" name="dbHost">
                  <EnhancedInput />
                </Form.Item>
                <Form.Item label="Database Port" name="dbPort">
                  <InputNumber min={1} max={65535} />
                </Form.Item>
                <Form.Item label="Database Name" name="dbName">
                  <EnhancedInput />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Pool Size" name="dbPoolSize">
                  <InputNumber min={5} max={100} />
                </Form.Item>
                <Form.Item label="Timeout (seconds)" name="dbTimeout">
                  <InputNumber min={5} max={120} />
                </Form.Item>
                <Space direction="vertical">
                  <Form.Item name="backupEnabled" valuePropName="checked">
                    <Checkbox>Enable Backups</Checkbox>
                  </Form.Item>
                  <Form.Item label="Backup Schedule" name="backupSchedule">
                    <EnhancedInput placeholder="0 2 * * *" />
                  </Form.Item>
                  <Form.Item label="Backup Retention (days)" name="backupRetention">
                    <InputNumber min={7} max={365} />
                  </Form.Item>
                </Space>
              </Col>
            </Row>
          </EnhancedCard>
        </TabPane>

        <TabPane tab="Services" key="services">
          <EnhancedCard title="System Services" variant="elevated">
            <Table
              columns={serviceColumns}
              dataSource={services}
              pagination={false}
              size="small"
            />
          </EnhancedCard>
        </TabPane>

        <TabPane tab="Logging" key="logging">
          <EnhancedCard title="Logging Configuration" variant="elevated">
            <Row gutter={24}>
              <Col span={12}>
                <Form.Item label="Log Level" name="logLevel">
                  <Select>
                    <Option value="debug">Debug</Option>
                    <Option value="info">Info</Option>
                    <Option value="warning">Warning</Option>
                    <Option value="error">Error</Option>
                  </Select>
                </Form.Item>
                <Form.Item label="Log Retention (days)" name="logRetention">
                  <InputNumber min={7} max={365} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Space direction="vertical">
                  <Form.Item name="logToFile" valuePropName="checked">
                    <Checkbox>Log to File</Checkbox>
                  </Form.Item>
                  <Form.Item name="logToDatabase" valuePropName="checked">
                    <Checkbox>Log to Database</Checkbox>
                  </Form.Item>
                  <Form.Item name="auditLogEnabled" valuePropName="checked">
                    <Checkbox>Enable Audit Logging</Checkbox>
                  </Form.Item>
                </Space>
              </Col>
            </Row>
          </EnhancedCard>
        </TabPane>

        <TabPane tab="Email" key="email">
          <EnhancedCard title="Email Configuration" variant="elevated">
            <Row gutter={24}>
              <Col span={12}>
                <Form.Item label="SMTP Host" name="smtpHost">
                  <EnhancedInput />
                </Form.Item>
                <Form.Item label="SMTP Port" name="smtpPort">
                  <InputNumber min={1} max={65535} />
                </Form.Item>
                <Form.Item label="From Email" name="emailFrom">
                  <EnhancedInput />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Space direction="vertical">
                  <Form.Item name="smtpEnabled" valuePropName="checked">
                    <Checkbox>Enable SMTP</Checkbox>
                  </Form.Item>
                  <Form.Item name="smtpSecure" valuePropName="checked">
                    <Checkbox>Use SSL/TLS</Checkbox>
                  </Form.Item>
                </Space>
              </Col>
            </Row>
          </EnhancedCard>
        </TabPane>

        <TabPane tab="Storage" key="storage">
          <EnhancedCard title="Storage Configuration" variant="elevated">
            <Row gutter={24}>
              <Col span={12}>
                <Form.Item label="Storage Type" name="storageType">
                  <Select>
                    <Option value="local">Local Storage</Option>
                    <Option value="s3">Amazon S3</Option>
                    <Option value="gcs">Google Cloud Storage</Option>
                    <Option value="azure">Azure Blob Storage</Option>
                  </Select>
                </Form.Item>
                <Form.Item label="Storage Path" name="storagePath">
                  <EnhancedInput />
                </Form.Item>
                <Form.Item label="Max File Size (MB)" name="maxFileSize">
                  <InputNumber min={1} max={1000} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Allowed File Types" name="allowedFileTypes">
                  <Select mode="multiple" placeholder="Select file types">
                    <Option value="jpg">JPG</Option>
                    <Option value="png">PNG</Option>
                    <Option value="pdf">PDF</Option>
                    <Option value="doc">DOC</Option>
                    <Option value="docx">DOCX</Option>
                    <Option value="txt">TXT</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </EnhancedCard>
        </TabPane>
      </Tabs>
    </Space>
  );
};

export default SystemSettings;
