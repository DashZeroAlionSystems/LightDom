/**
 * Enhanced Styleguide Dashboard - Design System Integration
 * Professional dashboard showcasing all components with the new design system
 */

import React, { useState, useEffect, useCallback } from 'react';
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
  ApiOutlined,
  ClusterOutlined,
  GlobalOutlined,
  MessageOutlined,
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

import DesignSystem from '../styles/DesignSystem';
import {
  EnhancedButton,
  EnhancedCard,
  EnhancedStatistic,
  EnhancedProgress,
  EnhancedAvatar,
  EnhancedInput,
  EnhancedTag,
} from './DesignSystemComponents';

import {
  getColor,
  getGradient,
  getTextStyle,
  getSpacing,
  getShadow,
  getBorderRadius,
  getAnimation,
  getTransition,
  getHoverEffect,
  getHoverStyles,
  getButtonStyle,
  getCardStyle,
  getInputStyle,
  composeStyle,
  createComponentStyle,
  getFlexStyle,
  getGridStyle,
  getPerformanceStyles,
  willChange,
} from '../utils/StyleUtils';

const { Header, Content } = Layout;
const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

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
];

const recentActivities = [
  {
    id: '1',
    user: 'John Doe',
    action: 'Completed SEO analysis',
    time: '2 minutes ago',
    status: 'success',
  },
  {
    id: '2',
    user: 'Jane Smith',
    action: 'Started mining operation',
    time: '5 minutes ago',
    status: 'info',
  },
  {
    id: '3',
    user: 'Bob Johnson',
    action: 'Deployed TensorFlow model',
    time: '10 minutes ago',
    status: 'warning',
  },
  {
    id: '4',
    user: 'Alice Brown',
    action: 'Generated new content',
    time: '15 minutes ago',
    status: 'success',
  },
];

const EnhancedStyleguideDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [animationEnabled, setAnimationEnabled] = useState(true);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const [refreshInterval, setRefreshInterval] = useState(30);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      message.info('Dashboard data refreshed');
    }, refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  // Render Overview Section
  const renderOverview = () => (
    <div style={{ marginBottom: getSpacing(6) }}>
      <Row gutter={[getSpacing(6), getSpacing(6)]}>
        <Col xs={24} sm={12} md={6}>
          <EnhancedCard variant="elevated" animation="fadeIn">
            <EnhancedStatistic
              title="Total Users"
              value={mockData.overview.totalUsers}
              trend="up"
              trendValue={12.5}
              prefix={<UserOutlined />}
              color="primary"
            />
          </EnhancedCard>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <EnhancedCard variant="elevated" animation="fadeIn">
            <EnhancedStatistic
              title="Active Users"
              value={mockData.overview.activeUsers}
              trend="up"
              trendValue={8.3}
              prefix={<ThunderboltOutlined />}
              color="success"
            />
          </EnhancedCard>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <EnhancedCard variant="elevated" animation="fadeIn">
            <EnhancedStatistic
              title="Revenue"
              value={mockData.overview.totalRevenue}
              trend="up"
              trendValue={15.7}
              prefix={<WalletOutlined />}
              color="warning"
              precision={0}
            />
          </EnhancedCard>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <EnhancedCard variant="elevated" animation="fadeIn">
            <EnhancedStatistic
              title="Growth Rate"
              value={mockData.overview.growthRate}
              trend="up"
              trendValue={3.2}
              suffix="%"
              color="secondary"
              precision={1}
            />
          </EnhancedCard>
        </Col>
      </Row>

      <Row gutter={[getSpacing(6), getSpacing(6)]} style={{ marginTop: getSpacing(6) }}>
        <Col xs={24} md={16}>
          <EnhancedCard title="Recent Activity" variant="elevated" extra={
            <EnhancedButton size="small" variant="ghost" icon={<EyeOutlined />}>
              View All
            </EnhancedButton>
          }>
            <List
              dataSource={recentActivities}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <EnhancedAvatar
                        text={item.user.split(' ').map(n => n[0]).join('')}
                        size="small"
                        status={item.status === 'success' ? 'online' : 'away'}
                      />
                    }
                    title={item.user}
                    description={item.action}
                  />
                  <div style={{ textAlign: 'right' }}>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      {item.time}
                    </Text>
                  </div>
                </List.Item>
              )}
            />
          </EnhancedCard>
        </Col>
        <Col xs={24} md={8}>
          <EnhancedCard title="System Health" variant="elevated">
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <div>
                <Text strong>CPU Usage</Text>
                <EnhancedProgress percent={mockData.system.cpu} status="normal" size="small" />
              </div>
              <div>
                <Text strong>Memory</Text>
                <EnhancedProgress percent={mockData.system.memory} status="active" size="small" />
              </div>
              <div>
                <Text strong>Storage</Text>
                <EnhancedProgress percent={mockData.system.disk} status="normal" size="small" />
              </div>
              <div>
                <Text strong>Network</Text>
                <EnhancedProgress percent={mockData.system.network} status="normal" size="small" />
              </div>
              <div>
                <Text strong>GPU</Text>
                <EnhancedProgress percent={mockData.system.gpu} status="active" size="small" />
              </div>
            </Space>
          </EnhancedCard>
        </Col>
      </Row>
    </div>
  );

  // Render SEO Section
  const renderSEO = () => (
    <div style={{ marginBottom: getSpacing(6) }}>
      <Row gutter={[getSpacing(6), getSpacing(6)]}>
        <Col xs={24} md={8}>
          <EnhancedCard variant="elevated" animation="fadeIn">
            <EnhancedStatistic
              title="SEO Score"
              value={mockData.seo.score}
              trend="up"
              trendValue={2.1}
              suffix="/ 100"
              color="success"
              precision={1}
            />
          </EnhancedCard>
        </Col>
        <Col xs={24} md={8}>
          <EnhancedCard variant="elevated" animation="fadeIn">
            <EnhancedStatistic
              title="Keywords"
              value={mockData.seo.keywords}
              trend="up"
              trendValue={8.7}
              prefix={<SearchOutlined />}
              color="primary"
            />
          </EnhancedCard>
        </Col>
        <Col xs={24} md={8}>
          <EnhancedCard variant="elevated" animation="fadeIn">
            <EnhancedStatistic
              title="Backlinks"
              value={mockData.seo.backlinks}
              trend="up"
              trendValue={5.2}
              prefix={<LinkOutlined />}
              color="secondary"
            />
          </EnhancedCard>
        </Col>
      </Row>

      <Row gutter={[getSpacing(6), getSpacing(6)]} style={{ marginTop: getSpacing(6) }}>
        <Col xs={24} md={12}>
          <EnhancedCard title="SEO Performance" variant="elevated">
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <div>
                <Text strong>Optimization Rate</Text>
                <EnhancedProgress 
                  percent={mockData.seo.optimizationRate} 
                  status="active" 
                  gradient={true}
                />
              </div>
              <div>
                <Text strong>Content Generated</Text>
                <EnhancedProgress 
                  percent={(mockData.seo.contentGenerated / 50) * 100} 
                  status="normal"
                />
              </div>
              <div>
                <Text strong>Rankings Improvement</Text>
                <EnhancedProgress 
                  percent={(mockData.seo.rankings / 200) * 100} 
                  status="normal"
                />
              </div>
            </Space>
          </EnhancedCard>
        </Col>
        <Col xs={24} md={12}>
          <EnhancedCard title="Quick Actions" variant="elevated">
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <EnhancedButton
                variant="primary"
                fullWidth
                icon={<BarChartOutlined />}
                onClick={() => message.info('Starting SEO analysis...')}
              >
                Run SEO Analysis
              </EnhancedButton>
              <EnhancedButton
                variant="secondary"
                fullWidth
                icon={<FileTextOutlined />}
                onClick={() => message.info('Generating content...')}
              >
                Generate Content
              </EnhancedButton>
              <EnhancedButton
                variant="ghost"
                fullWidth
                icon={<DownloadOutlined />}
                onClick={() => message.info('Downloading report...')}
              >
                Download Report
              </EnhancedButton>
            </Space>
          </EnhancedCard>
        </Col>
      </Row>
    </div>
  );

  // Render Blockchain Section
  const renderBlockchain = () => (
    <div style={{ marginBottom: getSpacing(6) }}>
      <Row gutter={[getSpacing(6), getSpacing(6)]}>
        <Col xs={24} md={8}>
          <EnhancedCard variant="elevated" animation="fadeIn">
            <EnhancedStatistic
              title="Transactions"
              value={mockData.blockchain.transactions}
              trend="up"
              trendValue={18.3}
              prefix={<SyncOutlined />}
              color="primary"
            />
          </EnhancedCard>
        </Col>
        <Col xs={24} md={8}>
          <EnhancedCard variant="elevated" animation="fadeIn">
            <EnhancedStatistic
              title="Wallet Balance"
              value={mockData.blockchain.walletBalance}
              trend="up"
              trendValue={12.7}
              prefix={<WalletOutlined />}
              color="success"
              precision={0}
            />
          </EnhancedCard>
        </Col>
        <Col xs={24} md={8}>
          <EnhancedCard variant="elevated" animation="fadeIn">
            <EnhancedStatistic
              title="Staking APY"
              value={mockData.blockchain.stakingAPY}
              trend="stable"
              trendValue={0.0}
              suffix="%"
              color="warning"
              precision={1}
            />
          </EnhancedCard>
        </Col>
      </Row>

      <Row gutter={[getSpacing(6), getSpacing(6)]} style={{ marginTop: getSpacing(6) }}>
        <Col xs={24} md={12}>
          <EnhancedCard title="Mining Operations" variant="elevated">
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <div>
                <Text strong>Staked Amount</Text>
                <EnhancedProgress 
                  percent={(mockData.blockchain.stakedAmount / 100000) * 100} 
                  status="active"
                  gradient={true}
                />
              </div>
              <div>
                <Text strong>Rards Earned</Text>
                <EnhancedProgress 
                  percent={(mockData.blockchain.rewards / 10000) * 100} 
                  status="normal"
                />
              </div>
              <div>
                <Text strong>NFT Collection</Text>
                <EnhancedProgress 
                  percent={(mockData.blockchain.nftCount / 50) * 100} 
                  status="normal"
                />
              </div>
            </Space>
          </EnhancedCard>
        </Col>
        <Col xs={24} md={12}>
          <EnhancedCard title="Quick Actions" variant="elevated">
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <EnhancedButton
                variant="primary"
                fullWidth
                icon={<PlayCircleOutlined />}
                onClick={() => message.info('Starting mining operation...')}
              >
                Start Mining
              </EnhancedButton>
              <EnhancedButton
                variant="secondary"
                fullWidth
                icon={<WalletOutlined />}
                onClick={() => message.info('Opening wallet...')}
              >
                Manage Wallet
              </EnhancedButton>
              <EnhancedButton
                variant="ghost"
                fullWidth
                icon={<TrophyOutlined />}
                onClick={() => message.info('Viewing staking pool...')}
              >
                Staking Pool
              </EnhancedButton>
            </Space>
          </EnhancedCard>
        </Col>
      </Row>
    </div>
  );

  // Render Metaverse Section
  const renderMetaverse = () => (
    <div style={{ marginBottom: getSpacing(6) }}>
      <Row gutter={[getSpacing(6), getSpacing(6)]}>
        <Col xs={24} md={8}>
          <EnhancedCard variant="elevated" animation="fadeIn">
            <EnhancedStatistic
              title="Active Worlds"
              value={mockData.metaverse.activeWorlds}
              trend="up"
              trendValue={2.0}
              prefix={<GlobalOutlined />}
              color="primary"
            />
          </EnhancedCard>
        </Col>
        <Col xs={24} md={8}>
          <EnhancedCard variant="elevated" animation="fadeIn">
            <EnhancedStatistic
              title="Total Users"
              value={mockData.metaverse.totalUsers}
              trend="up"
              trendValue={15.3}
              prefix={<TeamOutlined />}
              color="success"
            />
          </EnhancedCard>
        </Col>
        <Col xs={24} md={8}>
          <EnhancedCard variant="elevated" animation="fadeIn">
            <EnhancedStatistic
              title="Economy Value"
              value={mockData.metaverse.economy}
              trend="up"
              trendValue={8.9}
              prefix={<GiftOutlined />}
              color="warning"
              precision={0}
            />
          </EnhancedCard>
        </Col>
      </Row>

      <Row gutter={[getSpacing(6), getSpacing(6)]} style={{ marginTop: getSpacing(6) }}>
        <Col xs={24} md={12}>
          <EnhancedCard title="Metaverse Infrastructure" variant="elevated">
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <div>
                <Text strong>Active Bridges</Text>
                <EnhancedProgress 
                  percent={(mockData.metaverse.bridges / 20) * 100} 
                  status="active"
                  gradient={true}
                />
              </div>
              <div>
                <Text strong>Chat Nodes</Text>
                <EnhancedProgress 
                  percent={(mockData.metaverse.chatNodes / 25) * 100} 
                  status="normal"
                />
              </div>
              <div>
                <Text strong>Virtual Land</Text>
                <EnhancedProgress 
                  percent={(mockData.metaverse.virtualLand / 200) * 100} 
                  status="normal"
                />
              </div>
            </Space>
          </EnhancedCard>
        </Col>
        <Col xs={24} md={12}>
          <EnhancedCard title="Quick Actions" variant="elevated">
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <EnhancedButton
                variant="primary"
                fullWidth
                icon={<GlobalOutlined />}
                onClick={() => message.info('Creating new world...')}
              >
                Create World
              </EnhancedButton>
              <EnhancedButton
                variant="secondary"
                fullWidth
                icon={<ClusterOutlined />}
                onClick={() => message.info('Establishing bridge...')}
              >
                Establish Bridge
              </EnhancedButton>
              <EnhancedButton
                variant="ghost"
                fullWidth
                icon={<MonitorOutlined />}
                onClick={() => message.info('Opening metaverse portal...')}
              >
                Enter Metaverse
              </EnhancedButton>
            </Space>
          </EnhancedCard>
        </Col>
      </Row>
    </div>
  );

  // Render Automation Section
  const renderAutomation = () => (
    <div style={{ marginBottom: getSpacing(6) }}>
      <Row gutter={[getSpacing(6), getSpacing(6)]}>
        <Col xs={24} md={8}>
          <EnhancedCard variant="elevated" animation="fadeIn">
            <EnhancedStatistic
              title="Active Workflows"
              value={mockData.automation.activeWorkflows}
              trend="up"
              trendValue={3.0}
              prefix={<ExperimentOutlined />}
              color="primary"
            />
          </EnhancedCard>
        </Col>
        <Col xs={24} md={8}>
          <EnhancedCard variant="elevated" animation="fadeIn">
            <EnhancedStatistic
              title="Completed Tasks"
              value={mockData.automation.completedTasks}
              trend="up"
              trendValue={12.5}
              prefix={<CheckCircleOutlined />}
              color="success"
            />
          </EnhancedCard>
        </Col>
        <Col xs={24} md={8}>
          <EnhancedCard variant="elevated" animation="fadeIn">
            <EnhancedStatistic
              title="Success Rate"
              value={mockData.automation.successRate}
              trend="up"
              trendValue={1.2}
              suffix="%"
              color="warning"
              precision={1}
            />
          </EnhancedCard>
        </Col>
      </Row>

      <Row gutter={[getSpacing(6), getSpacing(6)]} style={{ marginTop: getSpacing(6) }}>
        <Col xs={24} md={12}>
          <EnhancedCard title="Workflow Performance" variant="elevated">
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <div>
                <Text strong>Average Time</Text>
                <EnhancedProgress 
                  percent={(mockData.automation.averageTime / 60) * 100} 
                  status="normal"
                />
              </div>
              <div>
                <Text strong>Scheduled Tasks</Text>
                <EnhancedProgress 
                  percent={(mockData.automation.scheduledTasks / 100) * 100} 
                  status="active"
                  gradient={true}
                />
              </div>
              <div>
                <Text strong>Error Rate</Text>
                <EnhancedProgress 
                  percent={mockData.automation.errorRate} 
                  status="exception"
                />
              </div>
            </Space>
          </EnhancedCard>
        </Col>
        <Col xs={24} md={12}>
          <EnhancedCard title="Quick Actions" variant="elevated">
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <EnhancedButton
                variant="primary"
                fullWidth
                icon={<PlusOutlined />}
                onClick={() => message.info('Creating new workflow...')}
              >
                Create Workflow
              </EnhancedButton>
              <EnhancedButton
                variant="secondary"
                fullWidth
                icon={<PlayCircleOutlined />}
                onClick={() => message.info('Running workflow...')}
              >
                Run Workflow
              </EnhancedButton>
              <EnhancedButton
                variant="ghost"
                fullWidth
                icon={<SettingOutlined />}
                onClick={() => message.info('Opening settings...')}
              >
                Configure
              </EnhancedButton>
            </Space>
          </EnhancedCard>
        </Col>
      </Row>
    </div>
  );

  // Render TensorFlow Section
  const renderTensorFlow = () => (
    <div style={{ marginBottom: getSpacing(6) }}>
      <Row gutter={[getSpacing(6), getSpacing(6)]}>
        <Col xs={24} md={8}>
          <EnhancedCard variant="elevated" animation="fadeIn">
            <EnhancedStatistic
              title="Total Models"
              value={mockData.tensorflow.totalModels}
              trend="up"
              trendValue={1.0}
              prefix={<RobotOutlined />}
              color="primary"
            />
          </EnhancedCard>
        </Col>
        <Col xs={24} md={8}>
          <EnhancedCard variant="elevated" animation="fadeIn">
            <EnhancedStatistic
              title="Training Jobs"
              value={mockData.tensorflow.trainingJobs}
              trend="stable"
              trendValue={0.0}
              prefix={<ApiOutlined />}
              color="warning"
            />
          </EnhancedCard>
        </Col>
        <Col xs={24} md={8}>
          <EnhancedCard variant="elevated" animation="fadeIn">
            <EnhancedStatistic
              title="Model Accuracy"
              value={mockData.tensorflow.accuracy}
              trend="up"
              trendValue={0.8}
              suffix="%"
              color="success"
              precision={1}
            />
          </EnhancedCard>
        </Col>
      </Row>

      <Row gutter={[getSpacing(6), getSpacing(6)]} style={{ marginTop: getSpacing(6) }}>
        <Col xs={24} md={12}>
          <EnhancedCard title="Resource Usage" variant="elevated">
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <div>
                <Text strong>GPU Usage</Text>
                <EnhancedProgress 
                  percent={mockData.tensorflow.gpuUsage} 
                  status="active"
                  gradient={true}
                />
              </div>
              <div>
                <Text strong>Deployed Models</Text>
                <EnhancedProgress 
                  percent={(mockData.tensorflow.deployedModels / 10) * 100} 
                  status="normal"
                />
              </div>
              <div>
                <Text strong>Training Time</Text>
                <EnhancedProgress 
                  percent={(mockData.tensorflow.trainingTime / 300) * 100} 
                  status="normal"
                />
              </div>
            </Space>
          </EnhancedCard>
        </Col>
        <Col xs={24} md={12}>
          <EnhancedCard title="Quick Actions" variant="elevated">
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <EnhancedButton
                variant="primary"
                fullWidth
                icon={<PlusOutlined />}
                onClick={() => message.info('Creating new model...')}
              >
                Create Model
              </EnhancedButton>
              <EnhancedButton
                variant="secondary"
                fullWidth
                icon={<PlayCircleOutlined />}
                onClick={() => message.info('Starting training...')}
              >
                Start Training
              </EnhancedButton>
              <EnhancedButton
                variant="ghost"
                fullWidth
                icon={<UploadOutlined />}
                onClick={() => message.info('Deploying model...')}
              >
                Deploy Model
              </EnhancedButton>
            </Space>
          </EnhancedCard>
        </Col>
      </Row>
    </div>
  );

  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: DesignSystem.colors.surface[50] }}>
      <Header style={{
        background: DesignSystem.colors.surface[0],
        borderBottom: `1px solid ${DesignSystem.colors.surface[200]}`,
        padding: getSpacing(4),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={getFlexStyle('row', 'flex-start', 'center')}>
          <DashboardOutlined style={{
            fontSize: DesignSystem.typography.fontSize['2xl'],
            color: DesignSystem.colors.primary[500],
            marginRight: getSpacing(3),
          }} />
          <Title level={3} style={{ margin: 0, ...getTextStyle('h3') }}>
            Enhanced Styleguide Dashboard
          </Title>
        </div>
        <Space>
          <Tooltip title="Toggle Dark Mode">
            <Switch
              checked={isDarkMode}
              onChange={setIsDarkMode}
              checkedChildren="🌙"
              unCheckedChildren="☀️"
            />
          </Tooltip>
          <Tooltip title="Toggle Animations">
            <Switch
              checked={animationEnabled}
              onChange={setAnimationEnabled}
              checkedChildren="✨"
              unCheckedChildren="🚫"
            />
          </Tooltip>
          <EnhancedButton
            variant="ghost"
            size="small"
            icon={<SettingOutlined />}
            onClick={() => setSettingsVisible(true)}
          >
            Settings
          </EnhancedButton>
        </Space>
      </Header>

      <Content style={{ padding: getSpacing(6) }}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          size="large"
          style={{ marginBottom: getSpacing(6) }}
        >
          <TabPane
            tab={
              <Space>
                <DashboardOutlined />
                <span>Overview</span>
              </Space>
            }
            key="overview"
          >
            {renderOverview()}
          </TabPane>
          <TabPane
            tab={
              <Space>
                <BarChartOutlined />
                <span>SEO Analytics</span>
              </Space>
            }
            key="seo"
          >
            {renderSEO()}
          </TabPane>
          <TabPane
            tab={
              <Space>
                <WalletOutlined />
                <span>Blockchain</span>
              </Space>
            }
            key="blockchain"
          >
            {renderBlockchain()}
          </TabPane>
          <TabPane
            tab={
              <Space>
                <GlobalOutlined />
                <span>Metaverse</span>
              </Space>
            }
            key="metaverse"
          >
            {renderMetaverse()}
          </TabPane>
          <TabPane
            tab={
              <Space>
                <ExperimentOutlined />
                <span>Automation</span>
              </Space>
            }
            key="automation"
          >
            {renderAutomation()}
          </TabPane>
          <TabPane
            tab={
              <Space>
                <ApiOutlined />
                <span>TensorFlow</span>
              </Space>
            }
            key="tensorflow"
          >
            {renderTensorFlow()}
          </TabPane>
        </Tabs>
      </Content>

      {/* Settings Drawer */}
      <Drawer
        title={
          <Space>
            <SettingOutlined style={{ color: DesignSystem.colors.primary[500] }} />
            <span>Dashboard Settings</span>
          </Space>
        }
        placement="right"
        onClose={() => setSettingsVisible(false)}
        visible={settingsVisible}
        width={400}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <EnhancedCard title="Refresh Settings" variant="flat">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text strong>Auto Refresh</Text>
                <Switch
                  checked={autoRefresh}
                  onChange={setAutoRefresh}
                  style={{ marginLeft: getSpacing(2) }}
                />
              </div>
              <div>
                <Text strong>Refresh Interval</Text>
                <Select
                  value={refreshInterval}
                  onChange={setRefreshInterval}
                  style={{ width: '100%', marginTop: getSpacing(2) }}
                >
                  <Select.Option value={10}>10 seconds</Select.Option>
                  <Select.Option value={30}>30 seconds</Select.Option>
                  <Select.Option value={60}>1 minute</Select.Option>
                  <Select.Option value={300}>5 minutes</Select.Option>
                </Select>
              </div>
            </Space>
          </EnhancedCard>

          <EnhancedCard title="Display Options" variant="flat">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text strong>Dark Mode</Text>
                <Switch
                  checked={isDarkMode}
                  onChange={setIsDarkMode}
                  style={{ marginLeft: getSpacing(2) }}
                />
              </div>
              <div>
                <Text strong>Animations</Text>
                <Switch
                  checked={animationEnabled}
                  onChange={setAnimationEnabled}
                  style={{ marginLeft: getSpacing(2) }}
                />
              </div>
            </Space>
          </EnhancedCard>

          <EnhancedCard title="Notifications" variant="flat">
            <Space direction="vertical" style={{ width: '100%' }}>
              <EnhancedButton
                variant="primary"
                fullWidth
                onClick={() => message.success('Test notification sent!')}
              >
                Test Notification
              </EnhancedButton>
              <EnhancedButton
                variant="ghost"
                fullWidth
                onClick={() => message.info('Notification settings updated')}
              >
                Configure Notifications
              </EnhancedButton>
            </Space>
          </EnhancedCard>
        </Space>
      </Drawer>
    </Layout>
  );
};

export default EnhancedStyleguideDashboard;
