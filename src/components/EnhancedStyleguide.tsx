/**
 * Enhanced Styleguide with Material Design Precision
 * Comprehensive design system showcase with animations, motion, and interactions
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Layout,
  Card,
  Row,
  Col,
  Typography,
  Space,
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
  Progress,
  Statistic,
  Checkbox,
  Radio,
  Slider,
  Rate,
  Transfer,
  Tree,
  Collapse,
  Carousel,
  Calendar,
  DatePicker,
  TimePicker,
  Upload,
  Popover,
  Popconfirm,
  Steps,
  Breadcrumb,
  Pagination,
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
  DislikeOutlined,
  CommentOutlined,
  RetweetOutlined,
  ShareAltOutlined as ShareOutlined,
  BookmarkOutlined,
  MoreOutlined,
  EllipsisOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  DoubleRightOutlined,
  DoubleLeftOutlined,
  VerticalAlignTopOutlined,
  VerticalAlignBottomOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
  LockOutlined,
  UnlockOutlined,
  SafetyOutlined,
  SecurityScanOutlined,
  KeyOutlined,
  EyeInvisibleOutlined,
  QuestionCircleOutlined,
  ExclamationTriangleOutlined,
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

const { Header, Content, Sider } = Layout;
const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Panel } = Collapse;
const { Step } = Steps;
const { Item } = Breadcrumb;
const { Link } = Anchor;

const EnhancedStyleguide: React.FC = () => {
  const [activeTab, setActiveTab] = useState('colors');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [animationEnabled, setAnimationEnabled] = useState(true);
  const [hoveredComponent, setHoveredComponent] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState(DesignSystem.colors.primary[500]);
  const [selectedAnimation, setSelectedAnimation] = useState('fadeIn');
  const [modalVisible, setModalVisible] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [rating, setRating] = useState(3);
  const [switchStates, setSwitchStates] = useState<Record<string, boolean>>({});
  const [checkboxStates, setCheckboxStates] = useState<Record<string, boolean>>({});
  const [radioValue, setRadioValue] = useState('option1');
  const [sliderValue, setSliderValue] = useState(50);

  // Simulate progress animation
  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            setLoading(false);
            return 0;
          }
          return prev + 10;
        });
      }, 200);
      return () => clearInterval(interval);
    }
  }, [loading]);

  // Animation presets
  const animationPresets = [
    { name: 'Fade In', value: 'fadeIn' },
    { name: 'Slide Up', value: 'slideUp' },
    { name: 'Slide Down', value: 'slideDown' },
    { name: 'Scale In', value: 'scaleIn' },
    { name: 'Bounce In', value: 'bounceIn' },
  ];

  // Color palette data
  const colorPalettes = [
    { name: 'Primary', colors: DesignSystem.colors.primary },
    { name: 'Secondary', colors: DesignSystem.colors.secondary },
    { name: 'Success', colors: DesignSystem.colors.success },
    { name: 'Warning', colors: DesignSystem.colors.warning },
    { name: 'Error', colors: DesignSystem.colors.error },
    { name: 'Neutral', colors: DesignSystem.colors.neutral },
  ];

  // Typography scale
  const typographyScale = [
    { size: '6xl', text: 'Heading 6xl', weight: 'bold' },
    { size: '5xl', text: 'Heading 5xl', weight: 'bold' },
    { size: '4xl', text: 'Heading 4xl', weight: 'bold' },
    { size: '3xl', text: 'Heading 3xl', weight: 'semibold' },
    { size: '2xl', text: 'Heading 2xl', weight: 'semibold' },
    { size: 'xl', text: 'Heading xl', weight: 'medium' },
    { size: 'lg', text: 'Heading lg', weight: 'medium' },
    { size: 'base', text: 'Body text base', weight: 'normal' },
    { size: 'sm', text: 'Body text sm', weight: 'normal' },
    { size: 'xs', text: 'Body text xs', weight: 'normal' },
  ];

  // Component showcase data
  const buttonVariants = [
    { type: 'primary', text: 'Primary Button', style: DesignSystem.components.button.primary },
    { type: 'secondary', text: 'Secondary Button', style: DesignSystem.components.button.secondary },
    { type: 'ghost', text: 'Ghost Button', style: DesignSystem.components.button.ghost },
  ];

  const cardVariants = [
    { type: 'elevated', style: DesignSystem.components.card.elevated },
    { type: 'flat', style: DesignSystem.components.card.flat },
    { type: 'glass', style: DesignSystem.components.card.glass },
  ];

  // Icon grid
  const iconCategories = [
    { name: 'Navigation', icons: [ArrowUpOutlined, ArrowDownOutlined, ArrowLeftOutlined, ArrowRightOutlined, DoubleRightOutlined, DoubleLeftOutlined] },
    { name: 'Actions', icons: [PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, DownloadOutlined, UploadOutlined] },
    { name: 'Social', icons: [HeartOutlined, StarOutlined, LikeOutlined, DislikeOutlined, CommentOutlined, RetweetOutlined] },
    { name: 'System', icons: [SettingOutlined, BellOutlined, LockOutlined, UnlockOutlined, SafetyOutlined, SecurityScanOutlined] },
    { name: 'Status', icons: [CheckCircleOutlined, ExclamationCircleOutlined, InfoCircleOutlined, WarningOutlined, ClockCircleOutlined, SyncOutlined] },
    { name: 'Media', icons: [PlayCircleOutlined, MonitorOutlined, DatabaseOutlined, CloudOutlined, FileTextOutlined, LinkOutlined] },
  ];

  // Render color palette
  const renderColorPalette = (palette: any) => (
    <div style={{ marginBottom: DesignSystem.spacing[6] }}>
      <Title level={4} style={{ marginBottom: DesignSystem.spacing[4] }}>
        {palette.name}
      </Title>
      <Row gutter={[DesignSystem.spacing[2], DesignSystem.spacing[2]]}>
        {Object.entries(palette.colors).map(([key, value]: [string, any]) => (
          <Col key={key} xs={12} sm={8} md={6} lg={4}>
            <div
              style={{
                backgroundColor: value,
                height: '80px',
                borderRadius: DesignSystem.borderRadius.lg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 200ms cubic-bezier(0.2, 0.0, 0.0, 1.0)',
                border: selectedColor === value ? '3px solid #000' : '1px solid rgba(0,0,0,0.1)',
                transform: selectedColor === value ? 'scale(1.05)' : 'scale(1)',
                ...DesignSystem.animation.hover.lift,
              }}
              onClick={() => setSelectedColor(value)}
              onMouseEnter={() => setHoveredComponent(`color-${key}`)}
              onMouseLeave={() => setHoveredComponent(null)}
            >
              <Text
                style={{
                  color: parseInt(key) <= 400 ? '#000' : '#fff',
                  fontSize: DesignSystem.typography.fontSize.xs,
                  fontWeight: DesignSystem.typography.fontWeight.medium,
                }}
              >
                {key}
              </Text>
            </div>
            <Text
              style={{
                fontSize: DesignSystem.typography.fontSize.xs,
                color: DesignSystem.colors.text.secondary,
                display: 'block',
                textAlign: 'center',
                marginTop: DesignSystem.spacing[1],
              }}
            >
              {value}
            </Text>
          </Col>
        ))}
      </Row>
    </div>
  );

  // Render typography scale
  const renderTypographyScale = () => (
    <div style={{ marginBottom: DesignSystem.spacing[6] }}>
      <Title level={4} style={{ marginBottom: DesignSystem.spacing[4] }}>
        Typography Scale
      </Title>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {typographyScale.map((item) => (
          <div
            key={item.size}
            style={{
              padding: DesignSystem.spacing[4],
              border: `1px solid ${DesignSystem.colors.surface[200]}`,
              borderRadius: DesignSystem.borderRadius.lg,
              transition: 'all 200ms cubic-bezier(0.2, 0.0, 0.0, 1.0)',
              ...DesignSystem.animation.hover.lift,
            }}
            onMouseEnter={() => setHoveredComponent(`typography-${item.size}`)}
            onMouseLeave={() => setHoveredComponent(null)}
          >
            <Text
              style={{
                fontSize: DesignSystem.typography.fontSize[item.size as keyof typeof DesignSystem.typography.fontSize],
                fontWeight: DesignSystem.typography.fontWeight[item.weight as keyof typeof DesignSystem.typography.fontWeight],
                lineHeight: DesignSystem.typography.lineHeight.tight,
                display: 'block',
              }}
            >
              {item.text}
            </Text>
            <Text
              style={{
                fontSize: DesignSystem.typography.fontSize.xs,
                color: DesignSystem.colors.text.tertiary,
                display: 'block',
                marginTop: DesignSystem.spacing[2],
              }}
            >
              {item.size} • {item.weight}
            </Text>
          </div>
        ))}
      </Space>
    </div>
  );

  // Render animation showcase
  const renderAnimationShowcase = () => (
    <div style={{ marginBottom: DesignSystem.spacing[6] }}>
      <Title level={4} style={{ marginBottom: DesignSystem.spacing[4] }}>
        Animation Showcase
      </Title>
      <Row gutter={[DesignSystem.spacing[4], DesignSystem.spacing[4]]}>
        {animationPresets.map((preset) => (
          <Col key={preset.value} xs={24} sm={12} md={8}>
            <Card
              style={{
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 300ms cubic-bezier(0.2, 0.0, 0.0, 1.0)',
                ...DesignSystem.components.card.flat,
                ...(selectedAnimation === preset.value ? {
                  borderColor: DesignSystem.colors.primary[500],
                  boxShadow: DesignSystem.shadows.primary,
                } : {}),
              }}
              onClick={() => setSelectedAnimation(preset.value)}
              onMouseEnter={() => setHoveredComponent(`animation-${preset.value}`)}
              onMouseLeave={() => setHoveredComponent(null)}
            >
              <div
                style={{
                  width: '60px',
                  height: '60px',
                  backgroundColor: DesignSystem.colors.primary[500],
                  borderRadius: DesignSystem.borderRadius.full,
                  margin: '0 auto ' + DesignSystem.spacing[4],
                  animation: selectedAnimation === preset.value ? `${preset.value} 2s infinite` : 'none',
                }}
              />
              <Text strong>{preset.name}</Text>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );

  // Render component showcase
  const renderComponentShowcase = () => (
    <div style={{ marginBottom: DesignSystem.spacing[6] }}>
      <Title level={4} style={{ marginBottom: DesignSystem.spacing[4] }}>
        Component Showcase
      </Title>
      
      {/* Buttons */}
      <div style={{ marginBottom: DesignSystem.spacing[6] }}>
        <Title level={5}>Buttons</Title>
        <Space wrap>
          {buttonVariants.map((variant) => (
            <Button
              key={variant.type}
              type={variant.type as any}
              style={{
                ...variant.style,
                ...(hoveredComponent === `button-${variant.type}` ? variant.style.hover : {}),
              }}
              onMouseEnter={() => setHoveredComponent(`button-${variant.type}`)}
              onMouseLeave={() => setHoveredComponent(null)}
            >
              {variant.text}
            </Button>
          ))}
        </Space>
      </div>

      {/* Cards */}
      <div style={{ marginBottom: DesignSystem.spacing[6] }}>
        <Title level={5}>Cards</Title>
        <Row gutter={[DesignSystem.spacing[4], DesignSystem.spacing[4]]}>
          {cardVariants.map((variant) => (
            <Col key={variant.type} xs={24} sm={12} md={8}>
              <Card
                style={{
                  ...variant.style,
                  ...(hoveredComponent === `card-${variant.type}` ? variant.style.hover : {}),
                  height: '150px',
                }}
                onMouseEnter={() => setHoveredComponent(`card-${variant.type}`)}
                onMouseLeave={() => setHoveredComponent(null)}
              >
                <Title level={5}>{variant.type}</Title>
                <Text>Interactive card with hover effects</Text>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      {/* Form Elements */}
      <div style={{ marginBottom: DesignSystem.spacing[6] }}>
        <Title level={5}>Form Elements</Title>
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <div>
            <Text strong>Switches</Text>
            <div style={{ marginTop: DesignSystem.spacing[2] }}>
              <Space>
                <Switch
                  checked={switchStates.switch1}
                  onChange={(checked) => setSwitchStates({ ...switchStates, switch1: checked })}
                />
                <Switch
                  checked={switchStates.switch2}
                  onChange={(checked) => setSwitchStates({ ...switchStates, switch2: checked })}
                />
                <Switch
                  checked={switchStates.switch3}
                  onChange={(checked) => setSwitchStates({ ...switchStates, switch3: checked })}
                  disabled
                />
              </Space>
            </div>
          </div>

          <div>
            <Text strong>Checkboxes</Text>
            <div style={{ marginTop: DesignSystem.spacing[2] }}>
              <Space direction="vertical">
                <Checkbox
                  checked={checkboxStates.check1}
                  onChange={(e) => setCheckboxStates({ ...checkboxStates, check1: e.target.checked })}
                >
                  Option 1
                </Checkbox>
                <Checkbox
                  checked={checkboxStates.check2}
                  onChange={(e) => setCheckboxStates({ ...checkboxStates, check2: e.target.checked })}
                >
                  Option 2
                </Checkbox>
                <Checkbox
                  checked={checkboxStates.check3}
                  onChange={(e) => setCheckboxStates({ ...checkboxStates, check3: e.target.checked })}
                  disabled
                >
                  Disabled Option
                </Checkbox>
              </Space>
            </div>
          </div>

          <div>
            <Text strong>Radio Buttons</Text>
            <div style={{ marginTop: DesignSystem.spacing[2] }}>
              <Radio.Group value={radioValue} onChange={(e) => setRadioValue(e.target.value)}>
                <Space direction="vertical">
                  <Radio value="option1">Option 1</Radio>
                  <Radio value="option2">Option 2</Radio>
                  <Radio value="option3">Option 3</Radio>
                </Space>
              </Radio.Group>
            </div>
          </div>

          <div>
            <Text strong>Slider</Text>
            <div style={{ marginTop: DesignSystem.spacing[2] }}>
              <Slider
                value={sliderValue}
                onChange={setSliderValue}
                style={{ width: '100%' }}
              />
              <Text>Value: {sliderValue}</Text>
            </div>
          </div>

          <div>
            <Text strong>Rate</Text>
            <div style={{ marginTop: DesignSystem.spacing[2] }}>
              <Rate value={rating} onChange={setRating} />
            </div>
          </div>
        </Space>
      </div>
    </div>
  );

  // Render icon showcase
  const renderIconShowcase = () => (
    <div style={{ marginBottom: DesignSystem.spacing[6] }}>
      <Title level={4} style={{ marginBottom: DesignSystem.spacing[4] }}>
        Icon Library
      </Title>
      {iconCategories.map((category) => (
        <div key={category.name} style={{ marginBottom: DesignSystem.spacing[6] }}>
          <Title level={5}>{category.name}</Title>
          <Row gutter={[DesignSystem.spacing[3], DesignSystem.spacing[3]]}>
            {category.icons.map((Icon, index) => (
              <Col key={index} xs={8} sm={6} md={4} lg={3}>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: DesignSystem.spacing[3],
                    border: `1px solid ${DesignSystem.colors.surface[200]}`,
                    borderRadius: DesignSystem.borderRadius.lg,
                    cursor: 'pointer',
                    transition: 'all 200ms cubic-bezier(0.2, 0.0, 0.0, 1.0)',
                    ...DesignSystem.animation.hover.lift,
                  }}
                  onMouseEnter={() => setHoveredComponent(`icon-${category.name}-${index}`)}
                  onMouseLeave={() => setHoveredComponent(null)}
                >
                  <Icon
                    style={{
                      fontSize: DesignSystem.typography.fontSize['2xl'],
                      color: DesignSystem.colors.primary[500],
                      marginBottom: DesignSystem.spacing[2],
                    }}
                  />
                  <Text style={{ fontSize: DesignSystem.typography.fontSize.xs }}>
                    {Icon.name}
                  </Text>
                </div>
              </Col>
            ))}
          </Row>
        </div>
      ))}
    </div>
  );

  // Render interactive demos
  const renderInteractiveDemos = () => (
    <div style={{ marginBottom: DesignSystem.spacing[6] }}>
      <Title level={4} style={{ marginBottom: DesignSystem.spacing[4] }}>
        Interactive Demos
      </Title>
      
      <Row gutter={[DesignSystem.spacing[4], DesignSystem.spacing[4]]}>
        <Col xs={24} md={12}>
          <Card title="Loading States" style={DesignSystem.components.card.flat}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Button
                  type="primary"
                  onClick={() => setLoading(true)}
                  loading={loading}
                  style={{ width: '100%' }}
                >
                  {loading ? 'Loading...' : 'Start Loading'}
                </Button>
              </div>
              <Progress
                percent={progress}
                status={loading ? 'active' : 'normal'}
                strokeColor={DesignSystem.colors.primary[500]}
              />
            </Space>
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card title="Notifications" style={DesignSystem.components.card.flat}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button
                type="primary"
                onClick={() => message.success('Success message!')}
                style={{ width: '100%' }}
              >
                Show Success
              </Button>
              <Button
                onClick={() => message.info('Info message!')}
                style={{ width: '100%' }}
              >
                Show Info
              </Button>
              <Button
                danger
                onClick={() => message.error('Error message!')}
                style={{ width: '100%' }}
              >
                Show Error
              </Button>
            </Space>
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card title="Modals & Drawers" style={DesignSystem.components.card.flat}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button
                type="primary"
                onClick={() => setModalVisible(true)}
                style={{ width: '100%' }}
              >
                Open Modal
              </Button>
              <Button
                onClick={() => setDrawerVisible(true)}
                style={{ width: '100%' }}
              >
                Open Drawer
              </Button>
            </Space>
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card title="Tooltips & Popovers" style={DesignSystem.components.card.flat}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Tooltip title="This is a tooltip">
                <Button style={{ width: '100%' }}>Hover for Tooltip</Button>
              </Tooltip>
              <Popover
                content="This is popover content"
                title="Popover Title"
                trigger="click"
              >
                <Button style={{ width: '100%' }}>Click for Popover</Button>
              </Popover>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );

  // Main render
  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: DesignSystem.colors.surface[50] }}>
      <Header style={{ 
        background: DesignSystem.colors.surface[0], 
        borderBottom: `1px solid ${DesignSystem.colors.surface[200]}`,
        padding: DesignSystem.spacing[4],
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <DashboardOutlined style={{ 
            fontSize: DesignSystem.typography.fontSize['2xl'], 
            color: DesignSystem.colors.primary[500],
            marginRight: DesignSystem.spacing[3],
          }} />
          <Title level={3} style={{ margin: 0, color: DesignSystem.colors.text.primary }}>
            Enhanced Styleguide
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
        </Space>
      </Header>

      <Content style={{ padding: DesignSystem.spacing[6] }}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          size="large"
          style={{ marginBottom: DesignSystem.spacing[6] }}
        >
          <TabPane tab="Colors" key="colors">
            {colorPalettes.map(renderColorPalette)}
          </TabPane>
          <TabPane tab="Typography" key="typography">
            {renderTypographyScale()}
          </TabPane>
          <TabPane tab="Animations" key="animations">
            {renderAnimationShowcase()}
          </TabPane>
          <TabPane tab="Components" key="components">
            {renderComponentShowcase()}
          </TabPane>
          <TabPane tab="Icons" key="icons">
            {renderIconShowcase()}
          </TabPane>
          <TabPane tab="Interactive" key="interactive">
            {renderInteractiveDemos()}
          </TabPane>
        </Tabs>
      </Content>

      {/* Modal */}
      <Modal
        title="Interactive Modal"
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setModalVisible(false)}>
            Cancel
          </Button>,
          <Button key="ok" type="primary" onClick={() => setModalVisible(false)}>
            OK
          </Button>,
        ]}
      >
        <p>This is an interactive modal with smooth animations.</p>
        <p>It demonstrates the design system's modal component.</p>
      </Modal>

      {/* Drawer */}
      <Drawer
        title="Interactive Drawer"
        placement="right"
        onClose={() => setDrawerVisible(false)}
        visible={drawerVisible}
      >
        <p>This is an interactive drawer with smooth animations.</p>
        <p>It demonstrates the design system's drawer component.</p>
      </Drawer>
    </Layout>
  );
};

export default EnhancedStyleguide;
