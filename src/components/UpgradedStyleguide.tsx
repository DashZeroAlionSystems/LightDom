/**
 * Upgraded Styleguide with Research-Based UX Patterns
 * Professional design system showcase with enhanced components and great UX workflows
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Layout,
  Row,
  Col,
  Typography,
  Space,
  Tabs,
  Table,
  Form,
  Select,
  Switch,
  Slider,
  Rate,
  Checkbox,
  Radio,
  DatePicker,
  TimePicker,
  Upload,
  Modal,
  Drawer,
  Tooltip,
  Popover,
  Alert,
  List,
  Timeline,
  Collapse,
  Carousel,
  Calendar,
  Pagination,
  Breadcrumb,
  Steps,
  Transfer,
  Tree,
  Menu,
  message,
  notification,
  Spin,
  Empty,
  Divider,
  BackTop,
  Affix,
  Anchor,
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
  MonitorOutlined,
  BulbOutlined,
  HeartOutlined,
  StarOutlined,
  LikeOutlined,
  CommentOutlined,
  RetweetOutlined,
  BookmarkOutlined,
  MoreOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  VerticalAlignTopOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
  LockOutlined,
  UnlockOutlined,
  SafetyOutlined,
  KeyOutlined,
  QuestionCircleOutlined,
  CloseCircleOutlined,
  CloseOutlined,
  CheckOutlined,
  InfoCircleFilled,
  WarningFilled,
  CloseCircleFilled,
  CheckCircleFilled,
  ExclamationCircleFilled,
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
  getStaggerDelay,
  getStaggerAnimation,
} from '../utils/StyleUtils';

const { Header, Content, Sider } = Layout;
const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Panel } = Collapse;
const { Step } = Steps;
const { Item } = Breadcrumb;

const UpgradedStyleguide: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [animationEnabled, setAnimationEnabled] = useState(true);
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [switchStates, setSwitchStates] = useState<Record<string, boolean>>({});
  const [sliderValues, setSliderValues] = useState<Record<string, number>>({});

  // Mock data for demonstrations
  const mockStats = {
    users: { current: 15420, previous: 14200, trend: 'up' as const },
    revenue: { current: 2847500, previous: 2650000, trend: 'up' as const },
    conversion: { current: 23.5, previous: 21.2, trend: 'up' as const },
    satisfaction: { current: 94.2, previous: 92.8, trend: 'up' as const },
  };

  const mockActivities = [
    { id: 1, user: 'John Doe', action: 'Completed SEO analysis', time: '2 minutes ago', status: 'success' },
    { id: 2, user: 'Jane Smith', action: 'Started mining operation', time: '5 minutes ago', status: 'info' },
    { id: 3, user: 'Bob Johnson', action: 'Deployed TensorFlow model', time: '10 minutes ago', status: 'warning' },
    { id: 4, user: 'Alice Brown', action: 'Generated new content', time: '15 minutes ago', status: 'success' },
  ];

  const mockNotifications = [
    { id: 1, type: 'success', title: 'Campaign Completed', message: 'SEO optimization finished successfully', read: false },
    { id: 2, type: 'warning', title: 'Efficiency Drop', message: 'Mining efficiency decreased by 5%', read: false },
    { id: 3, type: 'info', title: 'New Feature', message: 'TensorFlow dashboard is now available', read: true },
  ];

  // UX Pattern: Progressive Disclosure
  const renderProgressiveDisclosure = () => (
    <Row gutter={[getSpacing(6), getSpacing(6)]}>
      <Col xs={24} md={12}>
        <EnhancedCard
          title="Progressive Disclosure Pattern"
          variant="elevated"
          animation="slideUp"
        >
          <Paragraph style={getTextStyle('body')}>
            This pattern reveals information progressively to avoid overwhelming users.
            Click the button below to see it in action.
          </Paragraph>
          <EnhancedButton
            variant="primary"
            onClick={() => message.info('Progressive disclosure helps users focus on what matters most.')}
          >
            Learn More
          </EnhancedButton>
        </EnhancedCard>
      </Col>
      <Col xs={24} md={12}>
        <EnhancedCard
          title="Advanced Settings"
          variant="flat"
          animation="slideUp"
        >
          <Collapse ghost>
            <Panel header="Configuration Options" key="1">
              <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                  <Text>Enable notifications</Text>
                  <Switch
                    checked={switchStates.notifications}
                    onChange={(checked) => setSwitchStates({ ...switchStates, notifications: checked })}
                    style={{ marginLeft: getSpacing(2) }}
                  />
                </div>
                <div>
                  <Text>Auto-save progress</Text>
                  <Switch
                    checked={switchStates.autosave}
                    onChange={(checked) => setSwitchStates({ ...switchStates, autosave: checked })}
                    style={{ marginLeft: getSpacing(2) }}
                  />
                </div>
              </Space>
            </Panel>
          </Collapse>
        </EnhancedCard>
      </Col>
    </Row>
  );

  // UX Pattern: Immediate Feedback
  const renderImmediateFeedback = () => (
    <Row gutter={[getSpacing(6), getSpacing(6)]}>
      <Col xs={24} md={8}>
        <EnhancedCard title="Interactive Rating" variant="elevated">
          <Space direction="vertical" style={{ width: '100%', alignItems: 'center' }}>
            <Text>Rate your experience:</Text>
            <Rate
              value={ratings.experience || 0}
              onChange={(value) => {
                setRatings({ ...ratings, experience: value });
                message.success(`Thank you for rating ${value} star${value > 1 ? 's' : ''}!`);
              }}
              style={{ fontSize: '24px' }}
            />
            <Text type="secondary">
              {ratings.experience ? `You rated: ${ratings.experience}/5` : 'Click to rate'}
            </Text>
          </Space>
        </EnhancedCard>
      </Col>
      <Col xs={24} md={8}>
        <EnhancedCard title="Real-time Validation" variant="elevated">
          <Space direction="vertical" style={{ width: '100%' }}>
            <EnhancedInput
              label="Email Address"
              placeholder="Enter your email"
              value={formValues.email}
              onChange={(value) => {
                setFormValues({ ...formValues, email: value });
                if (value.includes('@')) {
                  message.success('Email format looks good!');
                }
              }}
              helper={formValues.email && (formValues.email.includes('@') ? 'Valid email format' : 'Please include @')}
              status={formValues.email && (formValues.email.includes('@') ? 'success' : 'error')}
            />
          </Space>
        </EnhancedCard>
      </Col>
      <Col xs={24} md={8}>
        <EnhancedCard title="Instant Actions" variant="elevated">
          <Space direction="vertical" style={{ width: '100%' }}>
            <EnhancedButton
              variant="success"
              fullWidth
              onClick={() => {
                setLoadingStates({ ...loadingStates, action1: true });
                setTimeout(() => {
                  setLoadingStates({ ...loadingStates, action1: false });
                  message.success('Action completed successfully!');
                }, 2000);
              }}
              loading={loadingStates.action1}
            >
              Quick Action
            </EnhancedButton>
            <EnhancedButton
              variant="ghost"
              fullWidth
              onClick={() => message.info('Secondary action triggered')}
            >
              Secondary Action
            </EnhancedButton>
          </Space>
        </EnhancedCard>
      </Col>
    </Row>
  );

  // UX Pattern: Consistent Navigation
  const renderConsistentNavigation = () => (
    <Row gutter={[getSpacing(6), getSpacing(6)]}>
      <Col xs={24}>
        <EnhancedCard title="Navigation Patterns" variant="flat">
          <Row gutter={[getSpacing(4), getSpacing(4)]}>
            <Col xs={24} md={8}>
              <Title level={5}>Breadcrumb Navigation</Title>
              <Breadcrumb>
                <Item>Home</Item>
                <Item>Dashboard</Item>
                <Item>Analytics</Item>
                <Item>Reports</Item>
              </Breadcrumb>
            </Col>
            <Col xs={24} md={8}>
              <Title level={5}>Step Indicator</Title>
              <Steps current={1} size="small">
                <Step title="Setup" icon={<SettingOutlined />} />
                <Step title="Configure" icon={<ExperimentOutlined />} />
                <Step title="Deploy" icon={<RocketOutlined />} />
                <Step title="Monitor" icon={<MonitorOutlined />} />
              </Steps>
            </Col>
            <Col xs={24} md={8}>
              <Title level={5}>Quick Actions</Title>
              <Space wrap>
                <EnhancedButton size="small" variant="primary">New</EnhancedButton>
                <EnhancedButton size="small" variant="secondary">Edit</EnhancedButton>
                <EnhancedButton size="small" variant="ghost">Share</EnhancedButton>
                <EnhancedButton size="small" variant="danger">Delete</EnhancedButton>
              </Space>
            </Col>
          </Row>
        </EnhancedCard>
      </Col>
    </Row>
  );

  // UX Pattern: Data Visualization
  const renderDataVisualization = () => (
    <Row gutter={[getSpacing(6), getSpacing(6)]}>
      <Col xs={24} md={6}>
        <EnhancedCard variant="elevated" animation="fadeIn">
          <EnhancedStatistic
            title="Total Users"
            value={mockStats.users.current}
            trend="up"
            trendValue={8.6}
            prefix={<UserOutlined />}
            color="primary"
          />
        </EnhancedCard>
      </Col>
      <Col xs={24} md={6}>
        <EnhancedCard variant="elevated" animation="fadeIn">
          <EnhancedStatistic
            title="Revenue"
            value={mockStats.revenue.current}
            trend="up"
            trendValue={7.4}
            prefix={<WalletOutlined />}
            color="success"
            precision={0}
          />
        </EnhancedCard>
      </Col>
      <Col xs={24} md={6}>
        <EnhancedCard variant="elevated" animation="fadeIn">
          <EnhancedStatistic
            title="Conversion"
            value={mockStats.conversion.current}
            trend="up"
            trendValue={10.8}
            suffix="%"
            color="warning"
            precision={1}
          />
        </EnhancedCard>
      </Col>
      <Col xs={24} md={6}>
        <EnhancedCard variant="elevated" animation="fadeIn">
          <EnhancedStatistic
            title="Satisfaction"
            value={mockStats.satisfaction.current}
            trend="up"
            trendValue={1.5}
            suffix="%"
            color="secondary"
            precision={1}
          />
        </EnhancedCard>
      </Col>
    </Row>
  );

  // UX Pattern: Form Design
  const renderFormDesign = () => (
    <Row gutter={[getSpacing(6), getSpacing(6)]}>
      <Col xs={24} md={12}>
        <EnhancedCard title="Smart Form Design" variant="elevated">
          <Form layout="vertical">
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <EnhancedInput
                label="Full Name"
                placeholder="Enter your full name"
                required
                value={formValues.name}
                onChange={(value) => setFormValues({ ...formValues, name: value })}
                prefix={<UserOutlined />}
              />
              <EnhancedInput
                label="Email Address"
                placeholder="your@email.com"
                type="email"
                required
                value={formValues.email}
                onChange={(value) => setFormValues({ ...formValues, email: value })}
                prefix={<MessageOutlined />}
              />
              <div>
                <Text strong>Project Priority</Text>
                <Slider
                  value={sliderValues.priority || 50}
                  onChange={(value) => setSliderValues({ ...sliderValues, priority: value })}
                  marks={{
                    0: 'Low',
                    50: 'Medium',
                    100: 'High'
                  }}
                  style={{ marginTop: getSpacing(2) }}
                />
              </div>
              <Space>
                <EnhancedButton variant="primary" type="submit">
                  Submit Form
                </EnhancedButton>
                <EnhancedButton variant="ghost">
                  Clear
                </EnhancedButton>
              </Space>
            </Space>
          </Form>
        </EnhancedCard>
      </Col>
      <Col xs={24} md={12}>
        <EnhancedCard title="Interactive Elements" variant="elevated">
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <div>
              <Text strong>Notification Preferences</Text>
              <Space direction="vertical" style={{ width: '100%', marginTop: getSpacing(2) }}>
                <Checkbox checked={switchStates.email} onChange={(e) => setSwitchStates({ ...switchStates, email: e.target.checked })}>
                  Email notifications
                </Checkbox>
                <Checkbox checked={switchStates.push} onChange={(e) => setSwitchStates({ ...switchStates, push: e.target.checked })}>
                  Push notifications
                </Checkbox>
                <Checkbox checked={switchStates.sms} onChange={(e) => setSwitchStates({ ...switchStates, sms: e.target.checked })}>
                  SMS notifications
                </Checkbox>
              </Space>
            </div>
            <div>
              <Text strong>Account Type</Text>
              <Radio.Group
                value={formValues.accountType}
                onChange={(e) => setFormValues({ ...formValues, accountType: e.target.value })}
                style={{ marginTop: getSpacing(2) }}
              >
                <Space direction="vertical">
                  <Radio value="personal">Personal Account</Radio>
                  <Radio value="business">Business Account</Radio>
                  <Radio value="enterprise">Enterprise Account</Radio>
                </Space>
              </Radio.Group>
            </div>
          </Space>
        </EnhancedCard>
      </Col>
    </Row>
  );

  // UX Pattern: Status and Feedback
  const renderStatusFeedback = () => (
    <Row gutter={[getSpacing(6), getSpacing(6)]}>
      <Col xs={24} md={12}>
        <EnhancedCard title="Status Indicators" variant="elevated">
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <div>
              <Text strong>User Status</Text>
              <div style={{ ...getFlexStyle('row', 'flex-start', 'center'), gap: getSpacing(3), marginTop: getSpacing(2) }}>
                <EnhancedAvatar text="JD" status="online" />
                <div>
                  <Text>John Doe</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: '12px' }}>Online</Text>
                </div>
              </div>
            </div>
            <div>
              <Text strong>Team Members</Text>
              <div style={{ ...getFlexStyle('row', 'flex-start', 'center'), gap: getSpacing(2), marginTop: getSpacing(2) }}>
                <EnhancedAvatar text="AS" status="online" />
                <EnhancedAvatar text="BJ" status="away" />
                <EnhancedAvatar text="MK" status="busy" />
                <EnhancedAvatar text="TW" status="offline" />
                <EnhancedAvatar text="+5" />
              </div>
            </div>
            <div>
              <Text strong>System Health</Text>
              <Space direction="vertical" style={{ width: '100%', marginTop: getSpacing(2) }}>
                <div>
                  <Text>CPU Usage</Text>
                  <EnhancedProgress percent={67} status="normal" size="small" />
                </div>
                <div>
                  <Text>Memory</Text>
                  <EnhancedProgress percent={82} status="active" size="small" />
                </div>
                <div>
                  <Text>Storage</Text>
                  <EnhancedProgress percent={45} status="normal" size="small" />
                </div>
              </Space>
            </div>
          </Space>
        </EnhancedCard>
      </Col>
      <Col xs={24} md={12}>
        <EnhancedCard title="Notifications & Alerts" variant="elevated">
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <Alert
              message="Success"
              description="Your changes have been saved successfully."
              type="success"
              showIcon
              closable
            />
            <Alert
              message="Warning"
              description="Your session will expire in 5 minutes."
              type="warning"
              showIcon
              closable
            />
            <Alert
              message="Error"
              description="Failed to connect to the server. Please try again."
              type="error"
              showIcon
              closable
            />
            <Alert
              message="Info"
              description="New features are available in the dashboard."
              type="info"
              showIcon
              closable
            />
          </Space>
        </EnhancedCard>
      </Col>
    </Row>
  );

  // UX Pattern: Content Organization
  const renderContentOrganization = () => (
    <Row gutter={[getSpacing(6), getSpacing(6)]}>
      <Col xs={24} md={8}>
        <EnhancedCard title="Recent Activity" variant="elevated">
          <Timeline>
            <Timeline.Item color="green" dot={<CheckCircleOutlined />}>
              <Text>SEO campaign completed</Text>
              <br />
              <Text type="secondary" style={{ fontSize: '12px' }}>2 minutes ago</Text>
            </Timeline.Item>
            <Timeline.Item color="blue" dot={<InfoCircleOutlined />}>
              <Text>New user registered</Text>
              <br />
              <Text type="secondary" style={{ fontSize: '12px' }}>5 minutes ago</Text>
            </Timeline.Item>
            <Timeline.Item color="orange" dot={<WarningOutlined />}>
              <Text>Mining efficiency drop</Text>
              <br />
              <Text type="secondary" style={{ fontSize: '12px' }}>10 minutes ago</Text>
            </Timeline.Item>
            <Timeline.Item>
              <Text>System backup completed</Text>
              <br />
              <Text type="secondary" style={{ fontSize: '12px' }}>15 minutes ago</Text>
            </Timeline.Item>
          </Timeline>
        </EnhancedCard>
      </Col>
      <Col xs={24} md={8}>
        <EnhancedCard title="Quick Stats" variant="elevated">
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <div style={getFlexStyle('row', 'space-between', 'center')}>
              <Text>Active Projects</Text>
              <EnhancedTag color="primary">12</EnhancedTag>
            </div>
            <div style={getFlexStyle('row', 'space-between', 'center')}>
              <Text>Pending Tasks</Text>
              <EnhancedTag color="warning">8</EnhancedTag>
            </div>
            <div style={getFlexStyle('row', 'space-between', 'center')}>
              <Text>Completed Today</Text>
              <EnhancedTag color="success">24</EnhancedTag>
            </div>
            <div style={getFlexStyle('row', 'space-between', 'center')}>
              <Text>Team Members</Text>
              <EnhancedTag color="secondary">6</EnhancedTag>
            </div>
          </Space>
        </EnhancedCard>
      </Col>
      <Col xs={24} md={8}>
        <EnhancedCard title="Tags & Categories" variant="elevated">
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <div>
              <Text strong>Popular Tags</Text>
              <div style={{ marginTop: getSpacing(2) }}>
                <Space wrap>
                  <EnhancedTag color="primary">Analytics</EnhancedTag>
                  <EnhancedTag color="success">SEO</EnhancedTag>
                  <EnhancedTag color="warning">Mining</EnhancedTag>
                  <EnhancedTag color="secondary">TensorFlow</EnhancedTag>
                  <EnhancedTag color="default">Reports</EnhancedTag>
                </Space>
              </div>
            </div>
            <div>
              <Text strong>Categories</Text>
              <div style={{ marginTop: getSpacing(2) }}>
                <Space wrap>
                  <EnhancedTag color="primary" icon={<DashboardOutlined />}>Dashboard</EnhancedTag>
                  <EnhancedTag color="success" icon={<BarChartOutlined />}>Analytics</EnhancedTag>
                  <EnhancedTag color="warning" icon={<SettingOutlined />}>Settings</EnhancedTag>
                </Space>
              </div>
            </div>
          </Space>
        </EnhancedCard>
      </Col>
    </Row>
  );

  // Main render
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
            Upgraded Styleguide
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
            variant="primary"
            size="small"
            onClick={() => setModalVisible(true)}
          >
            Preview Modal
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
          <TabPane tab="Overview" key="overview">
            <div style={{ marginBottom: getSpacing(6) }}>
              <Title level={2}>Research-Based UX Patterns</Title>
              <Paragraph style={getTextStyle('body')}>
                This styleguide demonstrates proven UX patterns and workflows that create
                intuitive, efficient, and delightful user experiences. Each pattern is
                implemented with our enhanced design system components.
              </Paragraph>
            </div>
            {renderProgressiveDisclosure()}
            <Divider />
            {renderImmediateFeedback()}
          </TabPane>

          <TabPane tab="Navigation" key="navigation">
            {renderConsistentNavigation()}
          </TabPane>

          <TabPane tab="Data Visualization" key="data">
            {renderDataVisualization()}
          </TabPane>

          <TabPane tab="Forms" key="forms">
            {renderFormDesign()}
          </TabPane>

          <TabPane tab="Status & Feedback" key="status">
            {renderStatusFeedback()}
          </TabPane>

          <TabPane tab="Content Organization" key="content">
            {renderContentOrganization()}
          </TabPane>
        </Tabs>
      </Content>

      {/* Modal Demo */}
      <Modal
        title="Enhanced Modal Demo"
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <EnhancedButton key="cancel" variant="ghost" onClick={() => setModalVisible(false)}>
            Cancel
          </EnhancedButton>,
          <EnhancedButton key="ok" variant="primary" onClick={() => setModalVisible(false)}>
            Confirm
          </EnhancedButton>,
        ]}
        width={600}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <Alert
            message="Enhanced Modal"
            description="This modal showcases our enhanced design system with smooth animations and professional styling."
            type="info"
            showIcon
          />
          <EnhancedInput
            label="Modal Input"
            placeholder="Type something..."
            value={formValues.modalInput}
            onChange={(value) => setFormValues({ ...formValues, modalInput: value })}
          />
          <div>
            <Text strong>Rate this modal:</Text>
            <Rate
              value={ratings.modal || 0}
              onChange={(value) => setRatings({ ...ratings, modal: value })}
              style={{ marginTop: getSpacing(2) }}
            />
          </div>
        </Space>
      </Modal>

      {/* Drawer Demo */}
      <Drawer
        title="Enhanced Drawer"
        placement="right"
        onClose={() => setDrawerVisible(false)}
        visible={drawerVisible}
        width={400}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <Paragraph>
            This drawer demonstrates the enhanced design system with consistent styling
            and smooth animations.
          </Paragraph>
          <EnhancedButton
            variant="primary"
            fullWidth
            onClick={() => message.success('Drawer action completed!')}
          >
            Drawer Action
          </EnhancedButton>
          <div>
            <Text strong>Quick Settings</Text>
            <Space direction="vertical" style={{ width: '100%', marginTop: getSpacing(2) }}>
              <div>
                <Text>Enable notifications</Text>
                <Switch
                  checked={switchStates.drawerNotifications}
                  onChange={(checked) => setSwitchStates({ ...switchStates, drawerNotifications: checked })}
                  style={{ marginLeft: getSpacing(2) }}
                />
              </div>
              <div>
                <Text>Dark mode</Text>
                <Switch
                  checked={switchStates.drawerDarkMode}
                  onChange={(checked) => setSwitchStates({ ...switchStates, drawerDarkMode: checked })}
                  style={{ marginLeft: getSpacing(2) }}
                />
              </div>
            </Space>
          </div>
        </Space>
      </Drawer>
    </Layout>
  );
};

export default UpgradedStyleguide;
