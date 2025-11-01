/**
 * Advanced Metaverse Portal with NFT Integration
 * Comprehensive metaverse management with bridges, economy, and social features
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Row,
  Col,
  Typography,
  Button,
  Table,
  Tag,
  Space,
  Alert,
  Modal,
  message,
  Spin,
  Statistic,
  Divider,
  List,
  Avatar,
  Tooltip,
  Badge,
  Progress,
  Tabs,
  Form,
  Input,
  Select,
  InputNumber,
  DatePicker,
  Timeline,
  Empty,
  QRCode,
  Image,
  Rate,
  Switch,
  Drawer,
  Collapse,
  Tree,
  Transfer,
  Slider,
} from 'antd';
import {
  GlobalOutlined,
  RocketOutlined,
  ClusterOutlined,
  NodeIndexOutlined,
  DatabaseOutlined,
  CloudOutlined,
  ThunderboltOutlined,
  TrophyOutlined,
  StarOutlined,
  CrownOutlined,
  DiamondOutlined,
  GiftOutlined,
  FireOutlined,
  HeartOutlined,
  ApiOutlined,
  BarChartOutlined,
  LineChartOutlined,
  PieChartOutlined,
  ExperimentOutlined,
  SettingOutlined,
  PlusOutlined,
  MinusOutlined,
  ReloadOutlined,
  DownloadOutlined,
  UploadOutlined,
  ShareAltOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  SafetyOutlined,
  UserOutlined,
  TeamOutlined,
  MessageOutlined,
  VideoCameraOutlined,
  AudioOutlined,
  FileTextOutlined,
  SearchOutlined,
  FilterOutlined,
  SortAscendingOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  WifiOutlined,
  LinkOutlined,
  DisconnectOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  StopOutlined,
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { TextArea } = Input;
const { RangePicker } = DatePicker;
const { Panel } = Collapse;
const { DirectoryTree } = Tree;

// Enhanced color system
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
  gradients: {
    primary: 'linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)',
    secondary: 'linear-gradient(135deg, #06b6d4 0%, #67e8f9 100%)',
    success: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
    warning: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
    error: 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)',
  }
};

const Spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  xxl: '48px',
};

interface MetaverseBridge {
  id: string;
  name: string;
  type: 'portal' | 'gateway' | 'node' | 'hub';
  status: 'active' | 'inactive' | 'maintenance';
  location: string;
  connectedNodes: number;
  bandwidth: number;
  latency: number;
  uptime: number;
  createdAt: string;
  lastActivity: string;
  metadata: any;
}

interface ChatNode {
  id: string;
  name: string;
  type: 'public' | 'private' | 'encrypted';
  participants: number;
  maxParticipants: number;
  status: 'active' | 'inactive';
  topic: string;
  messages: number;
  createdAt: string;
  owner: string;
  permissions: string[];
}

interface NFTMarketplace {
  id: string;
  name: string;
  collection: string;
  price: number;
  currency: 'LDT' | 'ETH' | 'USDC';
  owner: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  category: 'art' | 'music' | 'video' | 'experience' | 'utility';
  views: number;
  likes: number;
  listed: string;
}

interface MetaverseWorld {
  id: string;
  name: string;
  description: string;
  type: 'social' | 'gaming' | 'business' | 'education' | 'entertainment';
  visitors: number;
  maxVisitors: number;
  status: 'online' | 'offline' | 'maintenance';
  features: string[];
  entryFee: number;
  currency: 'LDT' | 'ETH' | 'USDC';
  rating: number;
  reviews: number;
  createdAt: string;
}

interface EconomyData {
  totalVolume: number;
  activeUsers: number;
  transactions: number;
  nftsTraded: number;
  bridgesActive: number;
  chatNodesActive: number;
  worldsOnline: number;
  marketCap: number;
  liquidity: number;
}

const MetaversePortal: React.FC = () => {
  // State management
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('bridges');
  const [bridges, setBridges] = useState<MetaverseBridge[]>([]);
  const [chatNodes, setChatNodes] = useState<ChatNode[]>([]);
  const [marketplace, setMarketplace] = useState<NFTMarketplace[]>([]);
  const [worlds, setWorlds] = useState<MetaverseWorld[]>([]);
  const [economyData, setEconomyData] = useState<EconomyData | null>(null);
  const [selectedBridge, setSelectedBridge] = useState<MetaverseBridge | null>(null);
  const [selectedNode, setSelectedNode] = useState<ChatNode | null>(null);
  const [selectedWorld, setSelectedWorld] = useState<MetaverseWorld | null>(null);
  const [bridgeModalVisible, setBridgeModalVisible] = useState(false);
  const [nodeModalVisible, setNodeModalVisible] = useState(false);
  const [worldModalVisible, setWorldModalVisible] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);

  // Form state
  const [bridgeForm] = Form.useForm();
  const [nodeForm] = Form.useForm();
  const [worldForm] = Form.useForm();

  // Fetch metaverse data
  const fetchMetaverseData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Mock bridges data
      const mockBridges: MetaverseBridge[] = [
        {
          id: '1',
          name: 'Alpha Portal',
          type: 'portal',
          status: 'active',
          location: 'New York, USA',
          connectedNodes: 15,
          bandwidth: 1000,
          latency: 25,
          uptime: 99.8,
          createdAt: new Date().toISOString(),
          lastActivity: new Date().toISOString(),
          metadata: { version: '2.1.0', protocol: 'HTTP/3' },
        },
        {
          id: '2',
          name: 'Beta Gateway',
          type: 'gateway',
          status: 'active',
          location: 'London, UK',
          connectedNodes: 23,
          bandwidth: 2500,
          latency: 18,
          uptime: 99.9,
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          lastActivity: new Date().toISOString(),
          metadata: { version: '2.2.0', protocol: 'WebSocket' },
        },
        {
          id: '3',
          name: 'Gamma Node',
          type: 'node',
          status: 'maintenance',
          location: 'Tokyo, Japan',
          connectedNodes: 8,
          bandwidth: 500,
          latency: 45,
          uptime: 95.2,
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          lastActivity: new Date(Date.now() - 3600000).toISOString(),
          metadata: { version: '2.0.5', protocol: 'HTTP/2' },
        },
        {
          id: '4',
          name: 'Delta Hub',
          type: 'hub',
          status: 'active',
          location: 'Singapore',
          connectedNodes: 31,
          bandwidth: 5000,
          latency: 12,
          uptime: 99.95,
          createdAt: new Date(Date.now() - 259200000).toISOString(),
          lastActivity: new Date().toISOString(),
          metadata: { version: '2.3.0', protocol: 'QUIC' },
        },
      ];
      
      setBridges(mockBridges);
      
      // Mock chat nodes
      const mockChatNodes: ChatNode[] = [
        {
          id: '1',
          name: 'General Discussion',
          type: 'public',
          participants: 245,
          maxParticipants: 500,
          status: 'active',
          topic: 'General metaverse discussions',
          messages: 15420,
          createdAt: new Date(Date.now() - 604800000).toISOString(),
          owner: 'system',
          permissions: ['read', 'write', 'react'],
        },
        {
          id: '2',
          name: 'Trading Hub',
          type: 'public',
          participants: 189,
          maxParticipants: 300,
          status: 'active',
          topic: 'NFT and token trading',
          messages: 8930,
          createdAt: new Date(Date.now() - 1209600000).toISOString(),
          owner: 'system',
          permissions: ['read', 'write', 'trade'],
        },
        {
          id: '3',
          name: 'Private Lounge',
          type: 'private',
          participants: 12,
          maxParticipants: 50,
          status: 'active',
          topic: 'VIP members only',
          messages: 2340,
          createdAt: new Date(Date.now() - 2592000000).toISOString(),
          owner: '0x1234...5678',
          permissions: ['read', 'write', 'moderate'],
        },
        {
          id: '4',
          name: 'Dev Chat',
          type: 'encrypted',
          participants: 67,
          maxParticipants: 100,
          status: 'active',
          topic: 'Developer discussions',
          messages: 5670,
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          owner: 'dev-team',
          permissions: ['read', 'write', 'code'],
        },
      ];
      
      setChatNodes(mockChatNodes);
      
      // Mock marketplace
      const mockMarketplace: NFTMarketplace[] = [
        {
          id: '1',
          name: 'Metaverse Land #001',
          collection: 'Virtual Real Estate',
          price: 5000,
          currency: 'LDT',
          owner: '0x1234...5678',
          rarity: 'legendary',
          category: 'experience',
          views: 1250,
          likes: 89,
          listed: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: '2',
          name: 'Digital Art Piece #042',
          collection: 'Crypto Gallery',
          price: 250,
          currency: 'ETH',
          owner: '0xabcd...efgh',
          rarity: 'epic',
          category: 'art',
          views: 567,
          likes: 34,
          listed: new Date(Date.now() - 172800000).toISOString(),
        },
        {
          id: '3',
          name: 'Music NFT #015',
          collection: 'Sound Waves',
          price: 100,
          currency: 'USDC',
          owner: '0x9876...5432',
          rarity: 'rare',
          category: 'music',
          views: 234,
          likes: 21,
          listed: new Date(Date.now() - 259200000).toISOString(),
        },
      ];
      
      setMarketplace(mockMarketplace);
      
      // Mock worlds
      const mockWorlds: MetaverseWorld[] = [
        {
          id: '1',
          name: 'LightDom Central',
          description: 'The main hub for all LightDom activities',
          type: 'social',
          visitors: 1234,
          maxVisitors: 2000,
          status: 'online',
          features: ['Chat', 'Trading', 'Events', 'Games'],
          entryFee: 0,
          currency: 'LDT',
          rating: 4.8,
          reviews: 567,
          createdAt: new Date(Date.now() - 2592000000).toISOString(),
        },
        {
          id: '2',
          name: 'Trading Plaza',
          description: 'Advanced trading and marketplace world',
          type: 'business',
          visitors: 892,
          maxVisitors: 1500,
          status: 'online',
          features: ['Trading', 'Analytics', 'Portfolio', 'News'],
          entryFee: 10,
          currency: 'LDT',
          rating: 4.6,
          reviews: 234,
          createdAt: new Date(Date.now() - 1728000000).toISOString(),
        },
        {
          id: '3',
          name: 'Gaming Arena',
          description: 'Competitive gaming and tournaments',
          type: 'gaming',
          visitors: 567,
          maxVisitors: 1000,
          status: 'online',
          features: ['Games', 'Tournaments', 'Leaderboards', 'Rewards'],
          entryFee: 5,
          currency: 'LDT',
          rating: 4.7,
          reviews: 189,
          createdAt: new Date(Date.now() - 1209600000).toISOString(),
        },
      ];
      
      setWorlds(mockWorlds);
      
      // Mock economy data
      const mockEconomyData: EconomyData = {
        totalVolume: 2500000,
        activeUsers: 15420,
        transactions: 45670,
        nftsTraded: 1234,
        bridgesActive: bridges.filter(b => b.status === 'active').length,
        chatNodesActive: chatNodes.filter(n => n.status === 'active').length,
        worldsOnline: worlds.filter(w => w.status === 'online').length,
        marketCap: 10000000,
        liquidity: 500000,
      };
      
      setEconomyData(mockEconomyData);
      
    } catch (error) {
      console.error('Failed to fetch metaverse data:', error);
      message.error('Failed to load metaverse data');
    } finally {
      setLoading(false);
    }
  }, []);

  // Create bridge
  const createBridge = useCallback(async (values: any) => {
    try {
      setLoading(true);
      
      // Mock bridge creation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newBridge: MetaverseBridge = {
        id: Date.now().toString(),
        name: values.name,
        type: values.type,
        status: 'inactive',
        location: values.location,
        connectedNodes: 0,
        bandwidth: values.bandwidth,
        latency: 0,
        uptime: 0,
        createdAt: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
        metadata: { version: '2.0.0', protocol: values.protocol },
      };
      
      setBridges(prev => [...prev, newBridge]);
      message.success('Bridge created successfully!');
      setBridgeModalVisible(false);
      bridgeForm.resetFields();
      
    } catch (error) {
      console.error('Failed to create bridge:', error);
      message.error('Failed to create bridge');
    } finally {
      setLoading(false);
    }
  }, [bridgeForm]);

  // Create chat node
  const createChatNode = useCallback(async (values: any) => {
    try {
      setLoading(true);
      
      // Mock node creation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newNode: ChatNode = {
        id: Date.now().toString(),
        name: values.name,
        type: values.type,
        participants: 0,
        maxParticipants: values.maxParticipants,
        status: 'active',
        topic: values.topic,
        messages: 0,
        createdAt: new Date().toISOString(),
        owner: 'current-user',
        permissions: values.permissions || ['read', 'write'],
      };
      
      setChatNodes(prev => [...prev, newNode]);
      message.success('Chat node created successfully!');
      setNodeModalVisible(false);
      nodeForm.resetFields();
      
    } catch (error) {
      console.error('Failed to create chat node:', error);
      message.error('Failed to create chat node');
    } finally {
      setLoading(false);
    }
  }, [nodeForm]);

  // Initialize component
  useEffect(() => {
    fetchMetaverseData();
  }, [fetchMetaverseData]);

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return Colors.success;
      case 'inactive': return Colors.textTertiary;
      case 'maintenance': return Colors.warning;
      case 'offline': return Colors.error;
      case 'online': return Colors.success;
      default: return Colors.textTertiary;
    }
  };

  // Get type color
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'portal': return Colors.primary;
      case 'gateway': return Colors.secondary;
      case 'node': return Colors.info;
      case 'hub': return Colors.warning;
      case 'public': return Colors.success;
      case 'private': return Colors.warning;
      case 'encrypted': return Colors.error;
      default: return Colors.textTertiary;
    }
  };

  // Render bridges tab
  const renderBridges = () => (
    <Row gutter={[Spacing.lg, Spacing.lg]}>
      <Col xs={24} lg={16}>
        <Card
          title={
            <Space>
              <ClusterOutlined style={{ color: Colors.primary }} />
              <span>Metaverse Bridges</span>
            </Space>
          }
          extra={
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setBridgeModalVisible(true)}
            >
              Create Bridge
            </Button>
          }
          style={{
            backgroundColor: Colors.surface,
            border: `1px solid ${Colors.border}`,
            borderRadius: '12px',
          }}
        >
          <Table
            dataSource={bridges}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10 }}
            columns={[
              {
                title: 'Name',
                dataIndex: 'name',
                key: 'name',
                render: (name: string, record: MetaverseBridge) => (
                  <Space direction="vertical" size={0}>
                    <Text style={{ color: Colors.text, fontWeight: 500 }}>{name}</Text>
                    <Text style={{ color: Colors.textTertiary, fontSize: '12px' }}>
                      {record.location}
                    </Text>
                  </Space>
                ),
              },
              {
                title: 'Type',
                dataIndex: 'type',
                key: 'type',
                render: (type: string) => (
                  <Tag color={getTypeColor(type)}>
                    {type.toUpperCase()}
                  </Tag>
                ),
              },
              {
                title: 'Status',
                dataIndex: 'status',
                key: 'status',
                render: (status: string) => (
                  <Tag color={getStatusColor(status)}>
                    {status.toUpperCase()}
                  </Tag>
                ),
              },
              {
                title: 'Nodes',
                dataIndex: 'connectedNodes',
                key: 'connectedNodes',
                render: (nodes: number) => (
                  <Badge count={nodes} style={{ backgroundColor: Colors.info }} />
                ),
              },
              {
                title: 'Performance',
                key: 'performance',
                render: (_, record: MetaverseBridge) => (
                  <Space direction="vertical" size={0}>
                    <Text style={{ color: Colors.textSecondary, fontSize: '12px' }}>
                      {record.bandwidth} Mbps
                    </Text>
                    <Text style={{ color: Colors.textSecondary, fontSize: '12px' }}>
                      {record.latency}ms latency
                    </Text>
                    <Text style={{ color: Colors.textSecondary, fontSize: '12px' }}>
                      {record.uptime}% uptime
                    </Text>
                  </Space>
                ),
              },
              {
                title: 'Actions',
                key: 'actions',
                render: (_, record: MetaverseBridge) => (
                  <Space>
                    <Button
                      type="link"
                      icon={<EyeOutlined />}
                      onClick={() => setSelectedBridge(record)}
                    >
                      View
                    </Button>
                    <Button
                      type="link"
                      icon={record.status === 'active' ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
                      onClick={() => message.info(`${record.status === 'active' ? 'Stopping' : 'Starting'} bridge...`)}
                    >
                      {record.status === 'active' ? 'Stop' : 'Start'}
                    </Button>
                  </Space>
                ),
              },
            ]}
          />
        </Card>
      </Col>
      
      <Col xs={24} lg={8}>
        <Space direction="vertical" style={{ width: '100%' }} size={Spacing.lg}>
          <Card
            title={
              <Space>
                <BarChartOutlined style={{ color: Colors.info }} />
                <span>Bridge Statistics</span>
              </Space>
            }
            style={{
              backgroundColor: Colors.surface,
              border: `1px solid ${Colors.border}`,
              borderRadius: '12px',
            }}
          >
            <Space direction="vertical" style={{ width: '100%' }} size={Spacing.md}>
              <Statistic
                title="Total Bridges"
                value={bridges.length}
                prefix={<ClusterOutlined />}
                valueStyle={{ color: Colors.primary }}
              />
              <Statistic
                title="Active Bridges"
                value={bridges.filter(b => b.status === 'active').length}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: Colors.success }}
              />
              <Statistic
                title="Total Nodes"
                value={bridges.reduce((sum, bridge) => sum + bridge.connectedNodes, 0)}
                prefix={<NodeIndexOutlined />}
                valueStyle={{ color: Colors.info }}
              />
              <Statistic
                title="Avg Bandwidth"
                value={bridges.length > 0 ? 
                  Math.round(bridges.reduce((sum, bridge) => sum + bridge.bandwidth, 0) / bridges.length) : 
                  0}
                suffix="Mbps"
                prefix={<WifiOutlined />}
                valueStyle={{ color: Colors.warning }}
              />
            </Space>
          </Card>
          
          <Card
            title={
              <Space>
                <ExperimentOutlined style={{ color: Colors.warning }} />
                <span>Recent Activity</span>
              </Space>
            }
            style={{
              backgroundColor: Colors.surface,
              border: `1px solid ${Colors.border}`,
              borderRadius: '12px',
            }}
          >
            <Timeline
              items={[
                {
                  color: Colors.primary,
                  children: (
                    <div>
                      <Text style={{ color: Colors.text }}>Alpha Portal connected</Text>
                      <br />
                      <Text style={{ color: Colors.textTertiary, fontSize: '12px' }}>
                        5 new nodes joined
                      </Text>
                    </div>
                  ),
                },
                {
                  color: Colors.success,
                  children: (
                    <div>
                      <Text style={{ color: Colors.text }}>Beta Gateway optimized</Text>
                      <br />
                      <Text style={{ color: Colors.textTertiary, fontSize: '12px' }}>
                        Latency reduced by 15%
                      </Text>
                    </div>
                  ),
                },
                {
                  color: Colors.warning,
                  children: (
                    <div>
                      <Text style={{ color: Colors.text }}>Gamma Node maintenance</Text>
                      <br />
                      <Text style={{ color: Colors.textTertiary, fontSize: '12px' }}>
                        Scheduled upgrade in progress
                      </Text>
                    </div>
                  ),
                },
              ]}
            />
          </Card>
        </Space>
      </Col>
    </Row>
  );

  // Render chat nodes tab
  const renderChatNodes = () => (
    <Row gutter={[Spacing.lg, Spacing.lg]}>
      <Col xs={24} lg={16}>
        <Card
          title={
            <Space>
              <MessageOutlined style={{ color: Colors.primary }} />
              <span>Chat Nodes</span>
            </Space>
          }
          extra={
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setNodeModalVisible(true)}
            >
              Create Node
            </Button>
          }
          style={{
            backgroundColor: Colors.surface,
            border: `1px solid ${Colors.border}`,
            borderRadius: '12px',
          }}
        >
          <Table
            dataSource={chatNodes}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10 }}
            columns={[
              {
                title: 'Name',
                dataIndex: 'name',
                key: 'name',
                render: (name: string, record: ChatNode) => (
                  <Space direction="vertical" size={0}>
                    <Text style={{ color: Colors.text, fontWeight: 500 }}>{name}</Text>
                    <Text style={{ color: Colors.textTertiary, fontSize: '12px' }}>
                      {record.topic}
                    </Text>
                  </Space>
                ),
              },
              {
                title: 'Type',
                dataIndex: 'type',
                key: 'type',
                render: (type: string) => (
                  <Tag color={getTypeColor(type)}>
                    {type.toUpperCase()}
                  </Tag>
                ),
              },
              {
                title: 'Participants',
                key: 'participants',
                render: (_, record: ChatNode) => (
                  <Space direction="vertical" size={0}>
                    <Progress
                      percent={Math.round((record.participants / record.maxParticipants) * 100)}
                      size="small"
                      strokeColor={Colors.gradients.primary}
                    />
                    <Text style={{ color: Colors.textSecondary, fontSize: '12px' }}>
                      {record.participants}/{record.maxParticipants}
                    </Text>
                  </Space>
                ),
              },
              {
                title: 'Messages',
                dataIndex: 'messages',
                key: 'messages',
                render: (messages: number) => (
                  <Text style={{ color: Colors.text }}>
                    {messages.toLocaleString()}
                  </Text>
                ),
              },
              {
                title: 'Status',
                dataIndex: 'status',
                key: 'status',
                render: (status: string) => (
                  <Tag color={getStatusColor(status)}>
                    {status.toUpperCase()}
                  </Tag>
                ),
              },
              {
                title: 'Actions',
                key: 'actions',
                render: (_, record: ChatNode) => (
                  <Space>
                    <Button
                      type="link"
                      icon={<MessageOutlined />}
                      onClick={() => setSelectedNode(record)}
                    >
                      Join
                    </Button>
                    <Button
                      type="link"
                      icon={<VideoCameraOutlined />}
                      onClick={() => message.info('Starting video chat...')}
                    >
                      Video
                    </Button>
                  </Space>
                ),
              },
            ]}
          />
        </Card>
      </Col>
      
      <Col xs={24} lg={8}>
        <Space direction="vertical" style={{ width: '100%' }} size={Spacing.lg}>
          <Card
            title={
              <Space>
                <TeamOutlined style={{ color: Colors.info }} />
                <span>Chat Statistics</span>
              </Space>
            }
            style={{
              backgroundColor: Colors.surface,
              border: `1px solid ${Colors.border}`,
              borderRadius: '12px',
            }}
          >
            <Space direction="vertical" style={{ width: '100%' }} size={Spacing.md}>
              <Statistic
                title="Total Nodes"
                value={chatNodes.length}
                prefix={<MessageOutlined />}
                valueStyle={{ color: Colors.primary }}
              />
              <Statistic
                title="Active Users"
                value={chatNodes.reduce((sum, node) => sum + node.participants, 0)}
                prefix={<UserOutlined />}
                valueStyle={{ color: Colors.success }}
              />
              <Statistic
                title="Total Messages"
                value={chatNodes.reduce((sum, node) => sum + node.messages, 0)}
                prefix={<FileTextOutlined />}
                valueStyle={{ color: Colors.info }}
              />
              <Statistic
                title="Avg Occupancy"
                value={chatNodes.length > 0 ? 
                  Math.round(chatNodes.reduce((sum, node) => sum + (node.participants / node.maxParticipants * 100), 0) / chatNodes.length) : 
                  0}
                suffix="%"
                prefix={<BarChartOutlined />}
                valueStyle={{ color: Colors.warning }}
              />
            </Space>
          </Card>
          
          <Card
            title={
              <Space>
                <StarOutlined style={{ color: Colors.warning }} />
                <span>Popular Nodes</span>
              </Space>
            }
            style={{
              backgroundColor: Colors.surface,
              border: `1px solid ${Colors.border}`,
              borderRadius: '12px',
            }}
          >
            <List
              dataSource={chatNodes.sort((a, b) => b.participants - a.participants).slice(0, 5)}
              renderItem={(node) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        style={{
                          backgroundColor: getTypeColor(node.type),
                        }}
                        icon={<MessageOutlined />}
                      />
                    }
                    title={
                      <Text style={{ color: Colors.text, fontSize: '14px' }}>
                        {node.name}
                      </Text>
                    }
                    description={
                      <Space>
                        <Text style={{ color: Colors.textTertiary, fontSize: '12px' }}>
                          {node.participants} users
                        </Text>
                        <Tag color={getTypeColor(node.type)} size="small">
                          {node.type}
                        </Tag>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Space>
      </Col>
    </Row>
  );

  // Render marketplace tab
  const renderMarketplace = () => (
    <Row gutter={[Spacing.lg, Spacing.lg]}>
      <Col xs={24} lg={16}>
        <Card
          title={
            <Space>
              <DiamondOutlined style={{ color: Colors.primary }} />
              <span>NFT Marketplace</span>
            </Space>
          }
          style={{
            backgroundColor: Colors.surface,
            border: `1px solid ${Colors.border}`,
            borderRadius: '12px',
          }}
        >
          <Row gutter={[Spacing.md, Spacing.md]}>
            {marketplace.map((item) => (
              <Col xs={24} sm={12} lg={8} key={item.id}>
                <Card
                  hoverable
                  style={{
                    backgroundColor: Colors.surfaceLight,
                    border: `1px solid ${Colors.border}`,
                    borderRadius: '8px',
                  }}
                  cover={
                    <div style={{ 
                      height: '200px', 
                      background: Colors.gradients.primary,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <DiamondOutlined style={{ fontSize: '48px', color: 'white' }} />
                    </div>
                  }
                  actions={[
                    <EyeOutlined key="view" onClick={() => message.info('View NFT details')} />,
                    <HeartOutlined key="like" onClick={() => message.info('Liked NFT')} />,
                    <ShoppingCartOutlined key="buy" onClick={() => message.info('Purchase NFT')} />,
                  ]}
                >
                  <Card.Meta
                    title={
                      <Space>
                        <Text style={{ color: Colors.text }}>{item.name}</Text>
                        <Tag color={getRarityColor(item.rarity)} size="small">
                          {item.rarity.toUpperCase()}
                        </Tag>
                      </Space>
                    }
                    description={
                      <Space direction="vertical" size={0}>
                        <Text style={{ color: Colors.textSecondary, fontSize: '12px' }}>
                          {item.collection}
                        </Text>
                        <Text strong style={{ color: Colors.primary }}>
                          {item.price} {item.currency}
                        </Text>
                        <Space>
                          <Text style={{ color: Colors.textTertiary, fontSize: '12px' }}>
                            {item.views} views
                          </Text>
                          <Text style={{ color: Colors.textTertiary, fontSize: '12px' }}>
                            {item.likes} likes
                          </Text>
                        </Space>
                      </Space>
                    }
                  />
                </Card>
              </Col>
            ))}
          </Row>
        </Card>
      </Col>
      
      <Col xs={24} lg={8}>
        <Space direction="vertical" style={{ width: '100%' }} size={Spacing.lg}>
          <Card
            title={
              <Space>
                <BarChartOutlined style={{ color: Colors.info }} />
                <span>Marketplace Stats</span>
              </Space>
            }
            style={{
              backgroundColor: Colors.surface,
              border: `1px solid ${Colors.border}`,
              borderRadius: '12px',
            }}
          >
            <Space direction="vertical" style={{ width: '100%' }} size={Spacing.md}>
              <Statistic
                title="Total Volume"
                value={economyData?.totalVolume || 0}
                prefix={<TrophyOutlined />}
                valueStyle={{ color: Colors.primary }}
              />
              <Statistic
                title="NFTs Traded"
                value={economyData?.nftsTraded || 0}
                prefix={<DiamondOutlined />}
                valueStyle={{ color: Colors.success }}
              />
              <Statistic
                title="Active Traders"
                value={economyData?.activeUsers || 0}
                prefix={<UserOutlined />}
                valueStyle={{ color: Colors.info }}
              />
              <Statistic
                title="Market Cap"
                value={economyData?.marketCap || 0}
                prefix={<BarChartOutlined />}
                valueStyle={{ color: Colors.warning }}
              />
            </Space>
          </Card>
        </Space>
      </Col>
    </Row>
  );

  // Render worlds tab
  const renderWorlds = () => (
    <Row gutter={[Spacing.lg, Spacing.lg]}>
      <Col xs={24} lg={16}>
        <Card
          title={
            <Space>
              <GlobalOutlined style={{ color: Colors.primary }} />
              <span>Metaverse Worlds</span>
            </Space>
          }
          style={{
            backgroundColor: Colors.surface,
            border: `1px solid ${Colors.border}`,
            borderRadius: '12px',
          }}
        >
          <Table
            dataSource={worlds}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10 }}
            columns={[
              {
                title: 'World',
                dataIndex: 'name',
                key: 'name',
                render: (name: string, record: MetaverseWorld) => (
                  <Space direction="vertical" size={0}>
                    <Text style={{ color: Colors.text, fontWeight: 500 }}>{name}</Text>
                    <Text style={{ color: Colors.textTertiary, fontSize: '12px' }}>
                      {record.description}
                    </Text>
                  </Space>
                ),
              },
              {
                title: 'Type',
                dataIndex: 'type',
                key: 'type',
                render: (type: string) => (
                  <Tag color={getTypeColor(type)}>
                    {type.toUpperCase()}
                  </Tag>
                ),
              },
              {
                title: 'Visitors',
                key: 'visitors',
                render: (_, record: MetaverseWorld) => (
                  <Space direction="vertical" size={0}>
                    <Progress
                      percent={Math.round((record.visitors / record.maxVisitors) * 100)}
                      size="small"
                      strokeColor={Colors.gradients.success}
                    />
                    <Text style={{ color: Colors.textSecondary, fontSize: '12px' }}>
                      {record.visitors}/{record.maxVisitors}
                    </Text>
                  </Space>
                ),
              },
              {
                title: 'Rating',
                dataIndex: 'rating',
                key: 'rating',
                render: (rating: number, record: MetaverseWorld) => (
                  <Space direction="vertical" size={0}>
                    <Rate disabled value={rating} style={{ fontSize: '14px' }} />
                    <Text style={{ color: Colors.textTertiary, fontSize: '12px' }}>
                      {record.reviews} reviews
                    </Text>
                  </Space>
                ),
              },
              {
                title: 'Entry Fee',
                key: 'entryFee',
                render: (_, record: MetaverseWorld) => (
                  <Text style={{ color: record.entryFee > 0 ? Colors.warning : Colors.success }}>
                    {record.entryFee > 0 ? `${record.entryFee} ${record.currency}` : 'FREE'}
                  </Text>
                ),
              },
              {
                title: 'Actions',
                key: 'actions',
                render: (_, record: MetaverseWorld) => (
                  <Space>
                    <Button
                      type="primary"
                      size="small"
                      onClick={() => setSelectedWorld(record)}
                    >
                      Enter
                    </Button>
                    <Button
                      size="small"
                      onClick={() => message.info('View world details...')}
                    >
                      Details
                    </Button>
                  </Space>
                ),
              },
            ]}
          />
        </Card>
      </Col>
      
      <Col xs={24} lg={8}>
        <Space direction="vertical" style={{ width: '100%' }} size={Spacing.lg}>
          <Card
            title={
              <Space>
                <EnvironmentOutlined style={{ color: Colors.info }} />
                <span>World Statistics</span>
              </Space>
            }
            style={{
              backgroundColor: Colors.surface,
              border: `1px solid ${Colors.border}`,
              borderRadius: '12px',
            }}
          >
            <Space direction="vertical" style={{ width: '100%' }} size={Spacing.md}>
              <Statistic
                title="Total Worlds"
                value={worlds.length}
                prefix={<GlobalOutlined />}
                valueStyle={{ color: Colors.primary }}
              />
              <Statistic
                title="Online Worlds"
                value={worlds.filter(w => w.status === 'online').length}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: Colors.success }}
              />
              <Statistic
                title="Total Visitors"
                value={worlds.reduce((sum, world) => sum + world.visitors, 0)}
                prefix={<UserOutlined />}
                valueStyle={{ color: Colors.info }}
              />
              <Statistic
                title="Avg Rating"
                value={worlds.length > 0 ? 
                  (worlds.reduce((sum, world) => sum + world.rating, 0) / worlds.length).toFixed(1) : 
                  0}
                prefix={<StarOutlined />}
                valueStyle={{ color: Colors.warning }}
              />
            </Space>
          </Card>
        </Space>
      </Col>
    </Row>
  );

  // Get rarity color
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return Colors.warning;
      case 'epic': return Colors.primary;
      case 'rare': return Colors.info;
      case 'common': return Colors.textTertiary;
      default: return Colors.textTertiary;
    }
  };

  return (
    <div style={{ padding: Spacing.lg, backgroundColor: Colors.background, minHeight: '100vh' }}>
      <div style={{ marginBottom: Spacing.xxl }}>
        <Title level={1} style={{ 
          color: Colors.text,
          fontSize: '32px',
          fontWeight: 700,
          margin: 0,
          marginBottom: Spacing.sm,
        }}>
          Metaverse Portal
        </Title>
        <Text style={{ 
          fontSize: '16px',
          color: Colors.textSecondary,
        }}>
          Advanced metaverse management with bridges, chat nodes, and NFT marketplace
        </Text>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        style={{ color: Colors.text }}
        items={[
          {
            key: 'bridges',
            label: (
              <Space>
                <ClusterOutlined />
                <span>Bridges</span>
                <Badge count={bridges.filter(b => b.status === 'active').length} style={{ backgroundColor: Colors.success }} />
              </Space>
            ),
            children: renderBridges(),
          },
          {
            key: 'chat',
            label: (
              <Space>
                <MessageOutlined />
                <span>Chat Nodes</span>
                <Badge count={chatNodes.filter(n => n.status === 'active').length} style={{ backgroundColor: Colors.info }} />
              </Space>
            ),
            children: renderChatNodes(),
          },
          {
            key: 'marketplace',
            label: (
              <Space>
                <DiamondOutlined />
                <span>Marketplace</span>
                <Badge count={marketplace.length} style={{ backgroundColor: Colors.primary }} />
              </Space>
            ),
            children: renderMarketplace(),
          },
          {
            key: 'worlds',
            label: (
              <Space>
                <GlobalOutlined />
                <span>Worlds</span>
                <Badge count={worlds.filter(w => w.status === 'online').length} style={{ backgroundColor: Colors.success }} />
              </Space>
            ),
            children: renderWorlds(),
          },
        ]}
      />

      {/* Create Bridge Modal */}
      <Modal
        title="Create Metaverse Bridge"
        open={bridgeModalVisible}
        onCancel={() => setBridgeModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setBridgeModalVisible(false)}>
            Cancel
          </Button>,
          <Button
            key="create"
            type="primary"
            loading={loading}
            onClick={() => bridgeForm.submit()}
          >
            Create Bridge
          </Button>,
        ]}
      >
        <Form
          form={bridgeForm}
          layout="vertical"
          onFinish={createBridge}
        >
          <Form.Item name="name" label="Bridge Name" rules={[{ required: true }]}>
            <Input placeholder="Enter bridge name" />
          </Form.Item>
          <Form.Item name="type" label="Bridge Type" rules={[{ required: true }]}>
            <Select placeholder="Select bridge type">
              <Select.Option value="portal">Portal</Select.Option>
              <Select.Option value="gateway">Gateway</Select.Option>
              <Select.Option value="node">Node</Select.Option>
              <Select.Option value="hub">Hub</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="location" label="Location" rules={[{ required: true }]}>
            <Input placeholder="Enter location" />
          </Form.Item>
          <Form.Item name="bandwidth" label="Bandwidth (Mbps)" rules={[{ required: true }]}>
            <InputNumber min={100} max={10000} placeholder="Enter bandwidth" style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="protocol" label="Protocol" rules={[{ required: true }]}>
            <Select placeholder="Select protocol">
              <Select.Option value="HTTP/2">HTTP/2</Select.Option>
              <Select.Option value="HTTP/3">HTTP/3</Select.Option>
              <Select.Option value="WebSocket">WebSocket</Select.Option>
              <Select.Option value="QUIC">QUIC</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Create Chat Node Modal */}
      <Modal
        title="Create Chat Node"
        open={nodeModalVisible}
        onCancel={() => setNodeModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setNodeModalVisible(false)}>
            Cancel
          </Button>,
          <Button
            key="create"
            type="primary"
            loading={loading}
            onClick={() => nodeForm.submit()}
          >
            Create Node
          </Button>,
        ]}
      >
        <Form
          form={nodeForm}
          layout="vertical"
          onFinish={createChatNode}
        >
          <Form.Item name="name" label="Node Name" rules={[{ required: true }]}>
            <Input placeholder="Enter node name" />
          </Form.Item>
          <Form.Item name="type" label="Node Type" rules={[{ required: true }]}>
            <Select placeholder="Select node type">
              <Select.Option value="public">Public</Select.Option>
              <Select.Option value="private">Private</Select.Option>
              <Select.Option value="encrypted">Encrypted</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="topic" label="Topic" rules={[{ required: true }]}>
            <Input placeholder="Enter chat topic" />
          </Form.Item>
          <Form.Item name="maxParticipants" label="Max Participants" rules={[{ required: true }]}>
            <InputNumber min={10} max={1000} placeholder="Enter max participants" style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="permissions" label="Permissions">
            <Select mode="multiple" placeholder="Select permissions">
              <Select.Option value="read">Read</Select.Option>
              <Select.Option value="write">Write</Select.Option>
              <Select.Option value="react">React</Select.Option>
              <Select.Option value="moderate">Moderate</Select.Option>
              <Select.Option value="trade">Trade</Select.Option>
              <Select.Option value="code">Code</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MetaversePortal;
