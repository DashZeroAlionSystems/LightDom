/**
 * Beautiful Admin Dashboard - Working Version
 * All the features we built, but without broken imports
 */

import React, { useState, useEffect } from 'react';
import {
  Layout,
  Card,
  Row,
  Col,
  Typography,
  Space,
  Statistic,
  Progress,
  Button,
  Alert,
  Badge,
  Avatar,
  List,
  Tag,
  Menu,
  Drawer,
  Tooltip,
  Switch,
  Select,
  Table,
  Tabs,
  Modal,
  Form,
  Input,
  message,
  Spin,
  Empty,
  Divider,
  Timeline,
  Dropdown,
} from 'antd';
import {
  DashboardOutlined,
  ThunderboltOutlined,
  WalletOutlined,
  TrophyOutlined,
  RocketOutlined,
  BarChartOutlined,
  LineChartOutlined,
  PieChartOutlined,
  ExperimentOutlined,
  RobotOutlined,
  BrainOutlined,
  ClusterOutlined,
  GlobalOutlined,
  MessageOutlined,
  DiamondOutlined,
  PlayCircleOutlined,
  SettingOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  DownloadOutlined,
  UploadOutlined,
  ShareAltOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  WarningOutlined,
  ClockCircleOutlined,
  SyncOutlined,
  ApiOutlined,
  DatabaseOutlined,
  CloudOutlined,
  SearchOutlined,
  FilterOutlined,
  CalendarOutlined,
  UserOutlined,
  TeamOutlined,
  BellOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  FileTextOutlined,
  LinkOutlined,
  GiftOutlined,
  PauseCircleOutlined,
  MonitorOutlined,
} from '@ant-design/icons';

const { Header, Content } = Layout;
const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

// Professional Design System
const Colors = {
  primary: '#7c3aed',
  primaryLight: '#a78bfa',
  secondary: '#06b6d4',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
  surface: '#1f2937',
  surfaceLight: '#374151',
  background: '#111827',
  text: '#f9fafb',
  textSecondary: '#d1d5db',
  textTertiary: '#9ca3af',
  border: '#374151',
};

const Spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  xxl: '48px',
};

// Mock Data
const mockData = {
  overview: {
    totalUsers: 15420,
    activeUsers: 8932,
    totalRevenue: 2847500,
    growthRate: 23.5,
  },
  seo: {
    score: 94.2,
    keywords: 1250,
    backlinks: 890,
    rankings: 156,
    contentGenerated: 45,
    optimizationRate: 87.3,
  },
  blockchain: {
    transactions: 45670,
    walletBalance: 125000,
    stakedAmount: 50000,
    rewards: 8920,
    nftCount: 23,
    stakingAPY: 12.5,
  },
  metaverse: {
    activeWorlds: 12,
    totalUsers: 5670,
    bridges: 8,
    economy: 2340000,
    chatNodes: 15,
    virtualLand: 145,
  },
  automation: {
    activeWorkflows: 15,
    completedTasks: 1250,
    successRate: 94.5,
    averageTime: 45,
    scheduledTasks: 89,
    errorRate: 2.3,
  },
  tensorflow: {
    totalModels: 8,
    trainingJobs: 2,
    deployedModels: 5,
    accuracy: 92.3,
    gpuUsage: 78.4,
    trainingTime: 180,
  },
  system: {
    cpu: 67.8,
    memory: 72.3,
    disk: 45.6,
    network: 23.4,
    gpu: 78.4,
  },
};

const notifications = [
  {
    id: '1',
    type: 'success',
    title: 'SEO Campaign Completed',
    message: 'Your SEO optimization campaign has been completed successfully.',
    timestamp: new Date().toISOString(),
    read: false,
  },
  {
    id: '2',
    type: 'warning',
    title: 'Mining Efficiency Drop',
    message: 'Mining efficiency has dropped by 5%. Consider optimizing parameters.',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    read: false,
  },
  {
    id: '3',
    type: 'info',
    title: 'New Metaverse Bridge',
    message: 'A new metaverse bridge has been established in Tokyo.',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    read: true,
  },
  {
    id: '4',
    type: 'success',
    title: 'Model Training Complete',
    message: 'TensorFlow model training completed with 92.3% accuracy.',
    timestamp: new Date(Date.now() - 10800000).toISOString(),
    read: true,
  },
];

const BeautifulAdminDashboard: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');
  const [settingsVisible, setSettingsVisible] = useState(false);

  // Simulate data fetching
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      console.log('Refreshing data...');
    }, 30000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  // Quick action handlers
  const handleQuickAction = (action: string) => {
    message.success(`${action} initiated successfully!`);
    setActiveTab(action.toLowerCase().replace(' ', ''));
  };

  // Render Overview Tab
  const renderOverview = () => (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      {/* Quick Actions */}
      <Card
        title={
          <Space>
            <ThunderboltOutlined style={{ color: Colors.primary }} />
            <span>Quick Actions</span>
          </Space>
        }
        style={{
          background: Colors.surface,
          border: `1px solid ${Colors.border}`,
          borderRadius: '12px',
        }}
      >
        <Row gutter={[Spacing.md, Spacing.md]}>
          <Col xs={24} sm={12} md={6}>
            <Button
              type="primary"
              icon={<RobotOutlined />}
              size="large"
              style={{
                background: Colors.primary,
                border: 'none',
                borderRadius: '8px',
                width: '100%',
                height: '60px',
              }}
              onClick={() => handleQuickAction('SEO Generator')}
            >
              Generate SEO Content
            </Button>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Button
              type="primary"
              icon={<PlayCircleOutlined />}
              size="large"
              style={{
                background: Colors.success,
                border: 'none',
                borderRadius: '8px',
                width: '100%',
                height: '60px',
              }}
              onClick={() => handleQuickAction('Automation')}
            >
              Start Workflow
            </Button>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Button
              type="primary"
              icon={<BrainOutlined />}
              size="large"
              style={{
                background: Colors.warning,
                border: 'none',
                borderRadius: '8px',
                width: '100%',
                height: '60px',
              }}
              onClick={() => handleQuickAction('TensorFlow')}
            >
              Train Model
            </Button>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Button
              type="primary"
              icon={<GlobalOutlined />}
              size="large"
              style={{
                background: Colors.info,
                border: 'none',
                borderRadius: '8px',
                width: '100%',
                height: '60px',
              }}
              onClick={() => handleQuickAction('Metaverse')}
            >
              Enter Metaverse
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Overview Stats */}
      <Row gutter={[Spacing.lg, Spacing.lg]}>
        <Col xs={24} lg={6}>
          <Card
            style={{
              background: Colors.surface,
              border: `1px solid ${Colors.border}`,
              borderRadius: '12px',
            }}
          >
            <Statistic
              title="Total Users"
              value={mockData.overview.totalUsers}
              prefix={<UserOutlined />}
              valueStyle={{ color: Colors.primary }}
            />
            <Progress
              percent={23.5}
              strokeColor={Colors.success}
              showInfo={false}
              style={{ marginTop: Spacing.sm }}
            />
            <Text style={{ color: Colors.textTertiary, fontSize: '12px' }}>
              +23.5% from last month
            </Text>
          </Card>
        </Col>
        <Col xs={24} lg={6}>
          <Card
            style={{
              background: Colors.surface,
              border: `1px solid ${Colors.border}`,
              borderRadius: '12px',
            }}
          >
            <Statistic
              title="Active Users"
              value={mockData.overview.activeUsers}
              prefix={<TeamOutlined />}
              valueStyle={{ color: Colors.success }}
            />
            <Progress
              percent={57.9}
              strokeColor={Colors.primary}
              showInfo={false}
              style={{ marginTop: Spacing.sm }}
            />
            <Text style={{ color: Colors.textTertiary, fontSize: '12px' }}>
              57.9% of total users
            </Text>
          </Card>
        </Col>
        <Col xs={24} lg={6}>
          <Card
            style={{
              background: Colors.surface,
              border: `1px solid ${Colors.border}`,
              borderRadius: '12px',
            }}
          >
            <Statistic
              title="Revenue"
              value={mockData.overview.totalRevenue}
              prefix={<WalletOutlined />}
              valueStyle={{ color: Colors.warning }}
              formatter={(value) => `$${Number(value).toLocaleString()}`}
            />
            <Progress
              percent={18.2}
              strokeColor={Colors.warning}
              showInfo={false}
              style={{ marginTop: Spacing.sm }}
            />
            <Text style={{ color: Colors.textTertiary, fontSize: '12px' }}>
              +18.2% growth rate
            </Text>
          </Card>
        </Col>
        <Col xs={24} lg={6}>
          <Card
            style={{
              background: Colors.surface,
              border: `1px solid ${Colors.border}`,
              borderRadius: '12px',
            }}
          >
            <Statistic
              title="Growth Rate"
              value={mockData.overview.growthRate}
              suffix="%"
              prefix={<RocketOutlined />}
              valueStyle={{ color: Colors.info }}
            />
            <Progress
              percent={23.5}
              strokeColor={Colors.info}
              showInfo={false}
              style={{ marginTop: Spacing.sm }}
            />
            <Text style={{ color: Colors.textTertiary, fontSize: '12px' }}>
              Monthly growth
            </Text>
          </Card>
        </Col>
      </Row>

      {/* System Status & Notifications */}
      <Row gutter={[Spacing.lg, Spacing.lg]}>
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <MonitorOutlined style={{ color: Colors.info }} />
                <span>System Resources</span>
              </Space>
            }
            style={{
              background: Colors.surface,
              border: `1px solid ${Colors.border}`,
              borderRadius: '12px',
            }}
          >
            <Space direction="vertical" style={{ width: '100%' }} size={Spacing.lg}>
              <div>
                <Text strong style={{ color: Colors.text }}>CPU Usage</Text>
                <Progress
                  percent={mockData.system.cpu}
                  strokeColor={Colors.primary}
                  format={(percent) => `${percent}%`}
                />
              </div>
              <div>
                <Text strong style={{ color: Colors.text }}>Memory Usage</Text>
                <Progress
                  percent={mockData.system.memory}
                  strokeColor={Colors.warning}
                  format={(percent) => `${percent}%`}
                />
              </div>
              <div>
                <Text strong style={{ color: Colors.text }}>Disk Usage</Text>
                <Progress
                  percent={mockData.system.disk}
                  strokeColor={Colors.error}
                  format={(percent) => `${percent}%`}
                />
              </div>
              <div>
                <Text strong style={{ color: Colors.text }}>Network Usage</Text>
                <Progress
                  percent={mockData.system.network}
                  strokeColor={Colors.success}
                  format={(percent) => `${percent}%`}
                />
              </div>
              <div>
                <Text strong style={{ color: Colors.text }}>GPU Usage</Text>
                <Progress
                  percent={mockData.system.gpu}
                  strokeColor={Colors.info}
                  format={(percent) => `${percent}%`}
                />
              </div>
            </Space>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <BellOutlined style={{ color: Colors.warning }} />
                <span>Recent Notifications</span>
              </Space>
            }
            extra={
              <Button
                type="link"
                icon={<SettingOutlined />}
                onClick={() => setSettingsVisible(true)}
                style={{ color: Colors.textSecondary }}
              >
                Settings
              </Button>
            }
            style={{
              background: Colors.surface,
              border: `1px solid ${Colors.border}`,
              borderRadius: '12px',
            }}
          >
            <List
              dataSource={notifications.slice(0, 5)}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        style={{
                          backgroundColor: item.type === 'success' ? Colors.success :
                                          item.type === 'warning' ? Colors.warning :
                                          item.type === 'error' ? Colors.error : Colors.info,
                        }}
                        icon={
                          item.type === 'success' ? <CheckCircleOutlined /> :
                          item.type === 'warning' ? <WarningOutlined /> :
                          item.type === 'error' ? <ExclamationCircleOutlined /> :
                          <InfoCircleOutlined />
                        }
                      />
                    }
                    title={
                      <Text style={{ color: Colors.text, fontSize: '14px' }}>
                        {item.title}
                      </Text>
                    }
                    description={
                      <Space direction="vertical" size={0}>
                        <Text style={{ color: Colors.textSecondary, fontSize: '12px' }}>
                          {item.message}
                        </Text>
                        <Text style={{ color: Colors.textTertiary, fontSize: '10px' }}>
                          {new Date(item.timestamp).toLocaleString()}
                        </Text>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </Space>
  );

  // Render SEO Tab
  const renderSEO = () => (
    <Row gutter={[Spacing.lg, Spacing.lg]}>
      <Col xs={24} lg={16}>
        <Card
          title={
            <Space>
              <RobotOutlined style={{ color: Colors.primary }} />
              <span>SEO Content Generator</span>
            </Space>
          }
          extra={
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => message.info('Opening SEO generator...')}
              style={{ background: Colors.primary, border: 'none' }}
            >
              Generate Content
            </Button>
          }
          style={{
            background: Colors.surface,
            border: `1px solid ${Colors.border}`,
            borderRadius: '12px',
          }}
        >
          <Row gutter={[Spacing.md, Spacing.md]}>
            <Col span={6}>
              <Statistic
                title="SEO Score"
                value={mockData.seo.score}
                suffix="%"
                prefix={<TrophyOutlined />}
                valueStyle={{ color: Colors.success }}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="Keywords"
                value={mockData.seo.keywords}
                prefix={<SearchOutlined />}
                valueStyle={{ color: Colors.info }}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="Backlinks"
                value={mockData.seo.backlinks}
                prefix={<LinkOutlined />}
                valueStyle={{ color: Colors.warning }}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="Rankings"
                value={mockData.seo.rankings}
                prefix={<BarChartOutlined />}
                valueStyle={{ color: Colors.primary }}
              />
            </Col>
          </Row>
          <Divider />
          <Row gutter={[Spacing.md, Spacing.md]}>
            <Col span={8}>
              <Statistic
                title="Content Generated"
                value={mockData.seo.contentGenerated}
                prefix={<FileTextOutlined />}
                valueStyle={{ color: Colors.info }}
              />
            </Col>
            <Col span={8}>
              <Statistic
                title="Optimization Rate"
                value={mockData.seo.optimizationRate}
                suffix="%"
                prefix={<ExperimentOutlined />}
                valueStyle={{ color: Colors.success }}
              />
            </Col>
            <Col span={8}>
              <Button
                type="default"
                icon={<EyeOutlined />}
                style={{ width: '100%', marginTop: Spacing.md }}
              >
                View Analytics
              </Button>
            </Col>
          </Row>
        </Card>
      </Col>
      <Col xs={24} lg={8}>
        <Card
          title={
            <Space>
              <LineChartOutlined style={{ color: Colors.info }} />
              <span>Performance Metrics</span>
            </Space>
          }
          style={{
            background: Colors.surface,
            border: `1px solid ${Colors.border}`,
            borderRadius: '12px',
          }}
        >
          <Space direction="vertical" style={{ width: '100%' }} size={Spacing.md}>
            <div>
              <Text strong style={{ color: Colors.text }}>Content Quality</Text>
              <Progress percent={94} strokeColor={Colors.success} />
            </div>
            <div>
              <Text strong style={{ color: Colors.text }}>Keyword Optimization</Text>
              <Progress percent={87} strokeColor={Colors.warning} />
            </div>
            <div>
              <Text strong style={{ color: Colors.text }}>Readability Score</Text>
              <Progress percent={92} strokeColor={Colors.info} />
            </div>
            <div>
              <Text strong style={{ color: Colors.text }}>SEO Optimization</Text>
              <Progress percent={89} strokeColor={Colors.primary} />
            </div>
          </Space>
        </Card>
      </Col>
    </Row>
  );

  // Render Blockchain Tab
  const renderBlockchain = () => (
    <Row gutter={[Spacing.lg, Spacing.lg]}>
      <Col xs={24} lg={16}>
        <Card
          title={
            <Space>
              <TrophyOutlined style={{ color: Colors.warning }} />
              <span>Blockchain Rewards</span>
            </Space>
          }
          style={{
            background: Colors.surface,
            border: `1px solid ${Colors.border}`,
            borderRadius: '12px',
          }}
        >
          <Row gutter={[Spacing.md, Spacing.md]}>
            <Col span={6}>
              <Statistic
                title="Transactions"
                value={mockData.blockchain.transactions}
                prefix={<SyncOutlined />}
                valueStyle={{ color: Colors.primary }}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="Wallet Balance"
                value={mockData.blockchain.walletBalance}
                prefix={<WalletOutlined />}
                valueStyle={{ color: Colors.success }}
                formatter={(value) => `$${Number(value).toLocaleString()}`}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="Staked Amount"
                value={mockData.blockchain.stakedAmount}
                prefix={<DiamondOutlined />}
                valueStyle={{ color: Colors.warning }}
                formatter={(value) => `$${Number(value).toLocaleString()}`}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="Rewards"
                value={mockData.blockchain.rewards}
                prefix={<GiftOutlined />}
                valueStyle={{ color: Colors.info }}
                formatter={(value) => `$${Number(value).toLocaleString()}`}
              />
            </Col>
          </Row>
          <Divider />
          <Row gutter={[Spacing.md, Spacing.md]}>
            <Col span={8}>
              <Statistic
                title="NFT Collection"
                value={mockData.blockchain.nftCount}
                prefix={<DiamondOutlined />}
                valueStyle={{ color: Colors.warning }}
              />
            </Col>
            <Col span={8}>
              <Statistic
                title="Staking APY"
                value={mockData.blockchain.stakingAPY}
                suffix="%"
                prefix={<TrophyOutlined />}
                valueStyle={{ color: Colors.success }}
              />
            </Col>
            <Col span={8}>
              <Button
                type="default"
                icon={<WalletOutlined />}
                style={{ width: '100%', marginTop: Spacing.md }}
              >
                View Portfolio
              </Button>
            </Col>
          </Row>
        </Card>
      </Col>
      <Col xs={24} lg={8}>
        <Card
          title={
            <Space>
              <DiamondOutlined style={{ color: Colors.warning }} />
              <span>NFT Collection</span>
            </Space>
          }
          style={{
            background: Colors.surface,
            border: `1px solid ${Colors.border}`,
            borderRadius: '12px',
          }}
        >
          <List
            dataSource={[
              { name: 'Cosmic Crystal #001', rarity: 'Legendary', value: '$5,000' },
              { name: 'Data Node #042', rarity: 'Rare', value: '$1,200' },
              { name: 'Space Bridge #007', rarity: 'Epic', value: '$2,800' },
              { name: 'Quantum Token #156', rarity: 'Common', value: '$450' },
            ]}
            renderItem={(item) => (
              <List.Item>
                <List.Item.Meta
                  avatar={<Avatar style={{ backgroundColor: Colors.primary }} icon={<DiamondOutlined />} />}
                  title={<Text style={{ color: Colors.text }}>{item.name}</Text>}
                  description={
                    <Space>
                      <Tag color={item.rarity === 'Legendary' ? Colors.warning :
                                 item.rarity === 'Epic' ? Colors.info :
                                 item.rarity === 'Rare' ? Colors.primary : Colors.textSecondary}>
                        {item.rarity}
                      </Tag>
                      <Text style={{ color: Colors.textSecondary }}>{item.value}</Text>
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        </Card>
      </Col>
    </Row>
  );

  // Render Metaverse Tab
  const renderMetaverse = () => (
    <Row gutter={[Spacing.lg, Spacing.lg]}>
      <Col xs={24} lg={16}>
        <Card
          title={
            <Space>
              <GlobalOutlined style={{ color: Colors.info }} />
              <span>Metaverse Portal</span>
            </Space>
          }
          style={{
            background: Colors.surface,
            border: `1px solid ${Colors.border}`,
            borderRadius: '12px',
          }}
        >
          <Row gutter={[Spacing.md, Spacing.md]}>
            <Col span={6}>
              <Statistic
                title="Active Worlds"
                value={mockData.metaverse.activeWorlds}
                prefix={<GlobalOutlined />}
                valueStyle={{ color: Colors.info }}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="Total Users"
                value={mockData.metaverse.totalUsers}
                prefix={<UserOutlined />}
                valueStyle={{ color: Colors.success }}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="Bridges"
                value={mockData.metaverse.bridges}
                prefix={<ClusterOutlined />}
                valueStyle={{ color: Colors.warning }}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="Economy"
                value={mockData.metaverse.economy}
                prefix={<WalletOutlined />}
                valueStyle={{ color: Colors.primary }}
                formatter={(value) => `$${Number(value).toLocaleString()}`}
              />
            </Col>
          </Row>
          <Divider />
          <Row gutter={[Spacing.md, Spacing.md]}>
            <Col span={8}>
              <Statistic
                title="Chat Nodes"
                value={mockData.metaverse.chatNodes}
                prefix={<MessageOutlined />}
                valueStyle={{ color: Colors.info }}
              />
            </Col>
            <Col span={8}>
              <Statistic
                title="Virtual Land"
                value={mockData.metaverse.virtualLand}
                prefix={<GlobalOutlined />}
                valueStyle={{ color: Colors.warning }}
              />
            </Col>
            <Col span={8}>
              <Button
                type="default"
                icon={<GlobalOutlined />}
                style={{ width: '100%', marginTop: Spacing.md }}
              >
                Explore Worlds
              </Button>
            </Col>
          </Row>
        </Card>
      </Col>
      <Col xs={24} lg={8}>
        <Card
          title={
            <Space>
              <MessageOutlined style={{ color: Colors.info }} />
              <span>Chat Nodes</span>
            </Space>
          }
          style={{
            background: Colors.surface,
            border: `1px solid ${Colors.border}`,
            borderRadius: '12px',
          }}
        >
          <List
            dataSource={[
              { name: 'Tokyo Hub', status: 'Active', users: 234 },
              { name: 'New York Node', status: 'Active', users: 189 },
              { name: 'London Bridge', status: 'Maintenance', users: 0 },
              { name: 'Singapore Portal', status: 'Active', users: 156 },
            ]}
            renderItem={(item) => (
              <List.Item>
                <List.Item.Meta
                  avatar={<Avatar style={{ backgroundColor: item.status === 'Active' ? Colors.success : Colors.warning }} icon={<MessageOutlined />} />}
                  title={<Text style={{ color: Colors.text }}>{item.name}</Text>}
                  description={
                    <Space>
                      <Tag color={item.status === 'Active' ? Colors.success : Colors.warning}>
                        {item.status}
                      </Tag>
                      <Text style={{ color: Colors.textSecondary }}>{item.users} users</Text>
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        </Card>
      </Col>
    </Row>
  );

  // Render Automation Tab
  const renderAutomation = () => (
    <Row gutter={[Spacing.lg, Spacing.lg]}>
      <Col xs={24} lg={16}>
        <Card
          title={
            <Space>
              <ExperimentOutlined style={{ color: Colors.primary }} />
              <span>Automation Workflows</span>
            </Space>
          }
          extra={
            <Button
              type="primary"
              icon={<PlayCircleOutlined />}
              onClick={() => message.info('Starting workflow...')}
              style={{ background: Colors.primary, border: 'none' }}
            >
              Start Workflow
            </Button>
          }
          style={{
            background: Colors.surface,
            border: `1px solid ${Colors.border}`,
            borderRadius: '12px',
          }}
        >
          <Row gutter={[Spacing.md, Spacing.md]}>
            <Col span={6}>
              <Statistic
                title="Active Workflows"
                value={mockData.automation.activeWorkflows}
                prefix={<PlayCircleOutlined />}
                valueStyle={{ color: Colors.primary }}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="Completed Tasks"
                value={mockData.automation.completedTasks}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: Colors.success }}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="Success Rate"
                value={mockData.automation.successRate}
                suffix="%"
                prefix={<TrophyOutlined />}
                valueStyle={{ color: Colors.info }}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="Avg Time"
                value={mockData.automation.averageTime}
                suffix="s"
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: Colors.warning }}
              />
            </Col>
          </Row>
          <Divider />
          <Row gutter={[Spacing.md, Spacing.md]}>
            <Col span={8}>
              <Statistic
                title="Scheduled Tasks"
                value={mockData.automation.scheduledTasks}
                prefix={<CalendarOutlined />}
                valueStyle={{ color: Colors.info }}
              />
            </Col>
            <Col span={8}>
              <Statistic
                title="Error Rate"
                value={mockData.automation.errorRate}
                suffix="%"
                prefix={<WarningOutlined />}
                valueStyle={{ color: Colors.error }}
              />
            </Col>
            <Col span={8}>
              <Button
                type="default"
                icon={<ExperimentOutlined />}
                style={{ width: '100%', marginTop: Spacing.md }}
              >
                View Templates
              </Button>
            </Col>
          </Row>
        </Card>
      </Col>
      <Col xs={24} lg={8}>
        <Card
          title={
            <Space>
              <ClockCircleOutlined style={{ color: Colors.warning }} />
              <span>Recent Activities</span>
            </Space>
          }
          style={{
            background: Colors.surface,
            border: `1px solid ${Colors.border}`,
            borderRadius: '12px',
          }}
        >
          <Timeline
            items={[
              {
                color: Colors.success,
                children: (
                  <div>
                    <Text style={{ color: Colors.text }}>SEO content generated</Text>
                    <br />
                    <Text style={{ color: Colors.textTertiary, fontSize: '12px' }}>
                      2 minutes ago
                    </Text>
                  </div>
                ),
              },
              {
                color: Colors.primary,
                children: (
                  <div>
                    <Text style={{ color: Colors.text }}>Workflow completed</Text>
                    <br />
                    <Text style={{ color: Colors.textTertiary, fontSize: '12px' }}>
                      5 minutes ago
                    </Text>
                  </div>
                ),
              },
              {
                color: Colors.warning,
                children: (
                  <div>
                    <Text style={{ color: Colors.text }}>Mining optimization</Text>
                    <br />
                    <Text style={{ color: Colors.textTertiary, fontSize: '12px' }}>
                      10 minutes ago
                    </Text>
                  </div>
                ),
              },
              {
                color: Colors.info,
                children: (
                  <div>
                    <Text style={{ color: Colors.text }}>Model deployed</Text>
                    <br />
                    <Text style={{ color: Colors.textTertiary, fontSize: '12px' }}>
                      15 minutes ago
                    </Text>
                  </div>
                ),
              },
            ]}
          />
        </Card>
      </Col>
    </Row>
  );

  // Render TensorFlow Tab
  const renderTensorFlow = () => (
    <Row gutter={[Spacing.lg, Spacing.lg]}>
      <Col xs={24} lg={16}>
        <Card
          title={
            <Space>
              <BrainOutlined style={{ color: Colors.error }} />
              <span>TensorFlow Admin</span>
            </Space>
          }
          extra={
            <Button
              type="primary"
              icon={<PlayCircleOutlined />}
              onClick={() => message.info('Starting training...')}
              style={{ background: Colors.warning, border: 'none' }}
            >
              Train Model
            </Button>
          }
          style={{
            background: Colors.surface,
            border: `1px solid ${Colors.border}`,
            borderRadius: '12px',
          }}
        >
          <Row gutter={[Spacing.md, Spacing.md]}>
            <Col span={6}>
              <Statistic
                title="Total Models"
                value={mockData.tensorflow.totalModels}
                prefix={<BrainOutlined />}
                valueStyle={{ color: Colors.error }}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="Training Jobs"
                value={mockData.tensorflow.trainingJobs}
                prefix={<PlayCircleOutlined />}
                valueStyle={{ color: Colors.warning }}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="Deployed Models"
                value={mockData.tensorflow.deployedModels}
                prefix={<RocketOutlined />}
                valueStyle={{ color: Colors.success }}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="Accuracy"
                value={mockData.tensorflow.accuracy}
                suffix="%"
                prefix={<TrophyOutlined />}
                valueStyle={{ color: Colors.info }}
              />
            </Col>
          </Row>
          <Divider />
          <Row gutter={[Spacing.md, Spacing.md]}>
            <Col span={8}>
              <Statistic
                title="GPU Usage"
                value={mockData.tensorflow.gpuUsage}
                suffix="%"
                prefix={<CloudOutlined />}
                valueStyle={{ color: Colors.warning }}
              />
            </Col>
            <Col span={8}>
              <Statistic
                title="Training Time"
                value={mockData.tensorflow.trainingTime}
                suffix="min"
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: Colors.info }}
              />
            </Col>
            <Col span={8}>
              <Button
                type="default"
                icon={<BrainOutlined />}
                style={{ width: '100%', marginTop: Spacing.md }}
              >
                View Models
              </Button>
            </Col>
          </Row>
        </Card>
      </Col>
      <Col xs={24} lg={8}>
        <Card
          title={
            <Space>
              <CloudOutlined style={{ color: Colors.info }} />
              <span>Resource Usage</span>
            </Space>
          }
          style={{
            background: Colors.surface,
            border: `1px solid ${Colors.border}`,
            borderRadius: '12px',
          }}
        >
          <Space direction="vertical" style={{ width: '100%' }} size={Spacing.md}>
            <div>
              <Text strong style={{ color: Colors.text }}>GPU Usage</Text>
              <Progress percent={78} strokeColor={Colors.warning} />
            </div>
            <div>
              <Text strong style={{ color: Colors.text }}>Memory Usage</Text>
              <Progress percent={65} strokeColor={Colors.primary} />
            </div>
            <div>
              <Text strong style={{ color: Colors.text }}>CPU Usage</Text>
              <Progress percent={45} strokeColor={Colors.success} />
            </div>
            <div>
              <Text strong style={{ color: Colors.text }}>Disk I/O</Text>
              <Progress percent={23} strokeColor={Colors.info} />
            </div>
          </Space>
        </Card>
      </Col>
    </Row>
  );

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: Colors.background,
      }}>
        <Spin size="large" />
        <Text style={{ color: Colors.text, marginLeft: Spacing.md }}>
          Loading Dashboard...
        </Text>
      </div>
    );
  }

  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: Colors.background }}>
      <Header
        style={{
          background: Colors.surface,
          padding: `0 ${Spacing.lg}`,
          borderBottom: `1px solid ${Colors.border}`,
          height: '72px',
        }}
      >
        <Row justify="space-between" align="middle" style={{ height: '100%' }}>
          <Col>
            <Space align="center">
              <Button
                type="text"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setCollapsed(!collapsed)}
                style={{ color: Colors.text }}
              />
              <Avatar
                size="large"
                style={{
                  background: Colors.primary,
                  border: `2px solid ${Colors.primaryLight}`,
                }}
                icon={<DashboardOutlined />}
              />
              <div>
                <Title level={3} style={{ color: Colors.text, margin: 0 }}>
                  LightDom Dashboard
                </Title>
                <Text style={{ color: Colors.textSecondary, fontSize: '12px' }}>
                  Professional Admin Interface
                </Text>
              </div>
            </Space>
          </Col>
          <Col>
            <Space>
              <Select
                value={selectedTimeRange}
                onChange={setSelectedTimeRange}
                style={{ width: 120 }}
                options={[
                  { label: 'Last Hour', value: '1h' },
                  { label: 'Last 24h', value: '24h' },
                  { label: 'Last Week', value: '7d' },
                  { label: 'Last Month', value: '30d' },
                ]}
              />
              <Tooltip title="Auto Refresh">
                <Switch
                  checked={autoRefresh}
                  onChange={setAutoRefresh}
                  checkedChildren={<SyncOutlined spin />}
                  unCheckedChildren={<PauseCircleOutlined />}
                />
              </Tooltip>
              <Button
                type="text"
                icon={<BellOutlined />}
                style={{ color: Colors.text }}
                onClick={() => message.info('Notifications clicked')}
              />
              <Button
                type="text"
                icon={<SettingOutlined />}
                style={{ color: Colors.text }}
                onClick={() => setSettingsVisible(true)}
              />
            </Space>
          </Col>
        </Row>
      </Header>

      <Content style={{ padding: Spacing.lg }}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          style={{ color: Colors.text }}
          items={[
            {
              key: 'overview',
              label: (
                <Space>
                  <DashboardOutlined />
                  <span>Overview</span>
                </Space>
              ),
              children: renderOverview(),
            },
            {
              key: 'seo',
              label: (
                <Space>
                  <RobotOutlined />
                  <span>SEO Generator</span>
                </Space>
              ),
              children: renderSEO(),
            },
            {
              key: 'blockchain',
              label: (
                <Space>
                  <TrophyOutlined />
                  <span>Blockchain Rewards</span>
                </Space>
              ),
              children: renderBlockchain(),
            },
            {
              key: 'metaverse',
              label: (
                <Space>
                  <GlobalOutlined />
                  <span>Metaverse Portal</span>
                </Space>
              ),
              children: renderMetaverse(),
            },
            {
              key: 'automation',
              label: (
                <Space>
                  <ExperimentOutlined />
                  <span>Automation Workflows</span>
                </Space>
              ),
              children: renderAutomation(),
            },
            {
              key: 'tensorflow',
              label: (
                <Space>
                  <BrainOutlined />
                  <span>TensorFlow Admin</span>
                </Space>
              ),
              children: renderTensorFlow(),
            },
          ]}
        />
      </Content>

      {/* Settings Drawer */}
      <Drawer
        title={
          <Space>
            <SettingOutlined style={{ color: Colors.primary }} />
            <span>Dashboard Settings</span>
          </Space>
        }
        placement="right"
        onClose={() => setSettingsVisible(false)}
        open={settingsVisible}
        width={400}
        style={{
          backgroundColor: Colors.surface,
        }}
      >
        <Space direction="vertical" size={Spacing.xl} style={{ width: '100%' }}>
          <Card size="small" style={{ backgroundColor: Colors.surfaceLight, border: `1px solid ${Colors.border}` }}>
            <Title level={5} style={{ color: Colors.text, marginBottom: Spacing.md }}>
              Refresh Settings
            </Title>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ color: Colors.text }}>Auto Refresh</Text>
                <Switch checked={autoRefresh} onChange={setAutoRefresh} />
              </div>
            </Space>
          </Card>
          
          <Card size="small" style={{ backgroundColor: Colors.surfaceLight, border: `1px solid ${Colors.border}` }}>
            <Title level={5} style={{ color: Colors.text, marginBottom: Spacing.md }}>
              Display Settings
            </Title>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ color: Colors.text }}>Compact Mode</Text>
                <Switch />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ color: Colors.text }}>Show Animations</Text>
                <Switch defaultChecked />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ color: Colors.text }}>Dark Mode</Text>
                <Switch defaultChecked />
              </div>
            </Space>
          </Card>
        </Space>
      </Drawer>
    </Layout>
  );
};

export default BeautifulAdminDashboard;
