/**
 * Settings Dashboard - Comprehensive Settings Hub
 * Intuitive and user-friendly settings management with all configuration options
 */

import React, { useState, useEffect } from 'react';
import {
  Layout,
  Card,
  Row,
  Col,
  Typography,
  Space,
  Tabs,
  Button,
  Alert,
  Badge,
  Avatar,
  List,
  Tag,
  Progress,
  Statistic,
  message,
  Tooltip,
  Switch,
  Input,
  Select,
  Form,
  Modal,
  Drawer,
} from 'antd';
import {
  SettingOutlined,
  SecurityScanOutlined,
  MonitorOutlined,
  DatabaseOutlined,
  CloudOutlined,
  ApiOutlined,
  BellOutlined,
  MailOutlined,
  GlobalOutlined,
  UserOutlined,
  TeamOutlined,
  LockOutlined,
  KeyOutlined,
  SafetyOutlined,
  AuditOutlined,
  BugOutlined,
  CodeOutlined,
  FileTextOutlined,
  BarChartOutlined,
  LineChartOutlined,
  PieChartOutlined,
  ThunderboltOutlined,
  RocketOutlined,
  ToolOutlined,
  ControlOutlined,
  DeploymentUnitOutlined,
  HddOutlined,
  CloudServerOutlined,
  SaveOutlined,
  ReloadOutlined,
  DownloadOutlined,
  UploadOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  SearchOutlined,
  FilterOutlined,
  SortAscendingOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  HistoryOutlined,
  SyncOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  WarningOutlined,
  InfoCircleOutlined,
  BulbOutlined,
  HeartOutlined,
  StarOutlined,
  LikeOutlined,
  MessageOutlined,
  RetweetOutlined,
  ShareAltOutlined,
  PrinterOutlined,
  ExportOutlined,
  ImportOutlined,
} from '@ant-design/icons';

import GeneralSettings from './GeneralSettings';
import SecuritySettings from './SecuritySettings';
import SystemSettings from './SystemSettings';
import {
  EnhancedCard,
  EnhancedButton,
  EnhancedStatistic,
  EnhancedProgress,
  EnhancedTag,
  EnhancedAvatar,
} from '../DesignSystemComponents';
import {
  getSpacing,
  getFlexStyle,
  getGridStyle,
} from '../../utils/StyleUtils';

const { Header, Content, Sider } = Layout;
const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Search } = Input;

interface SettingsDashboardProps {
  defaultTab?: string;
}

const SettingsDashboard: React.FC<SettingsDashboardProps> = ({ defaultTab = 'general' }) => {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [settingsStats, setSettingsStats] = useState({
    totalSettings: 156,
    configuredSettings: 142,
    securityScore: 85,
    systemHealth: 92,
  });

  const settingsCategories = [
    {
      key: 'general',
      title: 'General',
      icon: <SettingOutlined />,
      description: 'Basic system configuration',
      component: <GeneralSettings />,
      settings: 24,
      configured: 22,
    },
    {
      key: 'security',
      title: 'Security',
      icon: <SecurityScanOutlined />,
      description: 'Authentication and access control',
      component: <SecuritySettings />,
      settings: 32,
      configured: 28,
    },
    {
      key: 'system',
      title: 'System',
      icon: <MonitorOutlined />,
      description: 'Performance and monitoring',
      component: <SystemSettings />,
      settings: 28,
      configured: 25,
    },
    {
      key: 'database',
      title: 'Database',
      icon: <DatabaseOutlined />,
      description: 'Database configuration',
      component: <div>Database settings coming soon...</div>,
      settings: 18,
      configured: 16,
    },
    {
      key: 'notifications',
      title: 'Notifications',
      icon: <BellOutlined />,
      description: 'Email and push notifications',
      component: <div>Notification settings coming soon...</div>,
      settings: 15,
      configured: 12,
    },
    {
      key: 'integrations',
      title: 'Integrations',
      icon: <ApiOutlined />,
      description: 'Third-party integrations',
      component: <div>Integration settings coming soon...</div>,
      settings: 20,
      configured: 18,
    },
    {
      key: 'backup',
      title: 'Backup & Recovery',
      icon: <CloudOutlined />,
      description: 'Data backup and recovery',
      component: <div>Backup settings coming soon...</div>,
      settings: 12,
      configured: 11,
    },
    {
      key: 'advanced',
      title: 'Advanced',
      icon: <ToolOutlined />,
      description: 'Advanced configuration',
      component: <div>Advanced settings coming soon...</div>,
      settings: 7,
      configured: 5,
    },
  ];

  useEffect(() => {
    loadSettingsStats();
  }, []);

  const loadSettingsStats = async () => {
    // Simulate loading settings statistics
    setSettingsStats({
      totalSettings: 156,
      configuredSettings: 142,
      securityScore: 85,
      systemHealth: 92,
    });
  };

  const handleSaveAll = async () => {
    setLoading(true);
    try {
      // Simulate saving all settings
      await new Promise(resolve => setTimeout(resolve, 2000));
      setHasUnsavedChanges(false);
      message.success('All settings saved successfully!');
    } catch (error) {
      message.error('Failed to save settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetAll = () => {
    Modal.confirm({
      title: 'Reset All Settings',
      content: 'Are you sure you want to reset all settings to their default values? This action cannot be undone.',
      okText: 'Reset',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk() {
        message.success('All settings reset to defaults');
        setHasUnsavedChanges(false);
      },
    });
  };

  const handleExportSettings = () => {
    message.loading('Exporting settings...', 0);
    setTimeout(() => {
      message.destroy();
      message.success('Settings exported successfully');
    }, 1500);
  };

  const handleImportSettings = () => {
    message.info('Import settings feature coming soon');
  };

  const filteredCategories = settingsCategories.filter(category => {
    const matchesSearch = category.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         category.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || category.key === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const completionPercentage = Math.round((settingsStats.configuredSettings / settingsStats.totalSettings) * 100);

  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <Header style={{
        background: '#fff',
        borderBottom: '1px solid #e8e8e8',
        padding: getSpacing(4),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={getFlexStyle('row', 'flex-start', 'center')}>
          <SettingOutlined style={{
            fontSize: '24px',
            color: '#1890ff',
            marginRight: getSpacing(3),
          }} />
          <Title level={3} style={{ margin: 0 }}>
            Settings Dashboard
          </Title>
        </div>
        <Space>
          <Search
            placeholder="Search settings..."
            allowClear
            style={{ width: 300 }}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button icon={<ImportOutlined />} onClick={handleImportSettings}>
            Import
          </Button>
          <Button icon={<ExportOutlined />} onClick={handleExportSettings}>
            Export
          </Button>
          <Button icon={<ReloadOutlined />} onClick={handleResetAll}>
            Reset All
          </Button>
          <EnhancedButton
            variant="primary"
            icon={<SaveOutlined />}
            onClick={handleSaveAll}
            loading={loading}
            disabled={!hasUnsavedChanges}
          >
            Save All Changes
          </EnhancedButton>
        </Space>
      </Header>

      <Layout>
        <Sider
          width={300}
          style={{
            background: '#fff',
            borderRight: '1px solid #e8e8e8',
            padding: getSpacing(4),
          }}
        >
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            {/* Settings Overview */}
            <EnhancedCard variant="flat" size="small">
              <Space direction="vertical" style={{ width: '100%' }} size="medium">
                <div style={{ textAlign: 'center' }}>
                  <Progress
                    type="circle"
                    percent={completionPercentage}
                    size={80}
                    strokeColor="#52c41a"
                  />
                  <div style={{ marginTop: '8px' }}>
                    <Text strong>{completionPercentage}%</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      Configured
                    </Text>
                  </div>
                </div>
                <div style={getFlexStyle('row', 'space-between', 'center')}>
                  <Text type="secondary">Total Settings</Text>
                  <Text strong>{settingsStats.totalSettings}</Text>
                </div>
                <div style={getFlexStyle('row', 'space-between', 'center')}>
                  <Text type="secondary">Configured</Text>
                  <Text strong>{settingsStats.configuredSettings}</Text>
                </div>
              </Space>
            </EnhancedCard>

            {/* Category Filter */}
            <div>
              <Text strong>Categories</Text>
              <Select
                value={selectedCategory}
                onChange={setSelectedCategory}
                style={{ width: '100%', marginTop: '8px' }}
              >
                <Option value="all">All Categories</Option>
                {settingsCategories.map(category => (
                  <Option key={category.key} value={category.key}>
                    {category.title}
                  </Option>
                ))}
              </Select>
            </div>

            {/* Quick Stats */}
            <EnhancedCard variant="flat" size="small">
              <Space direction="vertical" style={{ width: '100%' }} size="medium">
                <div style={getFlexStyle('row', 'space-between', 'center')}>
                  <Space>
                    <SafetyOutlined style={{ color: '#1890ff' }} />
                    <Text type="secondary">Security Score</Text>
                  </Space>
                  <Text strong>{settingsStats.securityScore}%</Text>
                </div>
                <div style={getFlexStyle('row', 'space-between', 'center')}>
                  <Space>
                    <MonitorOutlined style={{ color: '#52c41a' }} />
                    <Text type="secondary">System Health</Text>
                  </Space>
                  <Text strong>{settingsStats.systemHealth}%</Text>
                </div>
              </Space>
            </EnhancedCard>

            {/* Recent Changes */}
            <EnhancedCard variant="flat" size="small">
              <Text strong>Recent Changes</Text>
              <List
                size="small"
                dataSource={[
                  { action: 'Security settings updated', time: '2 hours ago' },
                  { action: 'Database configuration changed', time: '1 day ago' },
                  { action: 'Email settings modified', time: '3 days ago' },
                ]}
                renderItem={(item) => (
                  <List.Item style={{ padding: '8px 0' }}>
                    <div>
                      <Text style={{ fontSize: '12px' }}>{item.action}</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: '11px' }}>{item.time}</Text>
                    </div>
                  </List.Item>
                )}
              />
            </EnhancedCard>
          </Space>
        </Sider>

        <Content style={{ padding: getSpacing(6) }}>
          {hasUnsavedChanges && (
            <Alert
              message="You have unsaved changes"
              description="Your changes will be lost if you navigate away without saving."
              type="warning"
              showIcon
              closable
              style={{ marginBottom: getSpacing(4) }}
            />
          )}

          {/* Settings Categories Grid */}
          <div style={{ marginBottom: getSpacing(6) }}>
            <Title level={4}>Settings Categories</Title>
            <Row gutter={[getSpacing(4), getSpacing(4)]}>
              {filteredCategories.map((category) => (
                <Col xs={24} sm={12} md={8} lg={6} key={category.key}>
                  <EnhancedCard
                    variant="elevated"
                    hoverable
                    onClick={() => setActiveTab(category.key)}
                    style={{
                      cursor: 'pointer',
                      border: activeTab === category.key ? '2px solid #1890ff' : '1px solid #e8e8e8',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <Space direction="vertical" style={{ width: '100%' }} size="medium">
                      <div style={getFlexStyle('row', 'space-between', 'center')}>
                        <div style={{ fontSize: '20px', color: '#1890ff' }}>
                          {category.icon}
                        </div>
                        <Badge
                          count={category.configured}
                          style={{ backgroundColor: '#52c41a' }}
                        />
                      </div>
                      <div>
                        <Text strong>{category.title}</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          {category.description}
                        </Text>
                      </div>
                      <div style={getFlexStyle('row', 'space-between', 'center')}>
                        <Text type="secondary" style={{ fontSize: '11px' }}>
                          {category.configured}/{category.settings} configured
                        </Text>
                        <EnhancedProgress
                          percent={Math.round((category.configured / category.settings) * 100)}
                          size="small"
                          showInfo={false}
                        />
                      </div>
                    </Space>
                  </EnhancedCard>
                </Col>
              ))}
            </Row>
          </div>

          {/* Settings Content */}
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            size="large"
            items={settingsCategories.map(category => ({
              key: category.key,
              label: (
                <Space>
                  {category.icon}
                  <span>{category.title}</span>
                  <Badge count={category.settings} size="small" />
                </Space>
              ),
              children: category.component,
            }))}
          />
        </Content>
      </Layout>
    </Layout>
  );
};

export default SettingsDashboard;
