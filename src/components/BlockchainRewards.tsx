/**
 * Advanced Blockchain Reward System
 * Comprehensive reward management with NFT integration and metaverse economy
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
} from 'antd';
import {
  TrophyOutlined,
  WalletOutlined,
  ThunderboltOutlined,
  RocketOutlined,
  StarOutlined,
  CrownOutlined,
  DiamondOutlined,
  GiftOutlined,
  FireOutlined,
  HeartOutlined,
  ApiOutlined,
  GlobalOutlined,
  ClusterOutlined,
  DatabaseOutlined,
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
  CloudOutlined,
  NodeIndexOutlined,
  BugOutlined,
  CodeOutlined,
  FileTextOutlined,
  SearchOutlined,
  FilterOutlined,
  SortAscendingOutlined,
  CalendarOutlined,
  UserOutlined,
  TeamOutlined,
  FlagOutlined,
  BulbOutlined,
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

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

interface Reward {
  id: string;
  type: 'mining' | 'seo' | 'metaverse' | 'referral' | 'achievement' | 'nft';
  title: string;
  description: string;
  amount: number;
  token: 'LDT' | 'NFT' | 'META';
  status: 'pending' | 'claimed' | 'expired';
  timestamp: string;
  metadata: any;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface NFTAsset {
  id: string;
  name: string;
  description: string;
  image: string;
  collection: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  value: number;
  owner: string;
  minted: string;
  properties: Record<string, any>;
}

interface StakingPool {
  id: string;
  name: string;
  apy: number;
  totalStaked: number;
  yourStake: number;
  rewards: number;
  lockPeriod: number;
  minStake: number;
  maxStake: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  progress: number;
  total: number;
  reward: number;
  unlocked: boolean;
  category: 'mining' | 'seo' | 'metaverse' | 'social';
}

const BlockchainRewards: React.FC = () => {
  // State management
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('rewards');
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [nfts, setNfts] = useState<NFTAsset[]>([]);
  const [stakingPools, setStakingPools] = useState<StakingPool[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [claimModalVisible, setClaimModalVisible] = useState(false);
  const [stakeModalVisible, setStakeModalVisible] = useState(false);
  const [selectedPool, setSelectedPool] = useState<StakingPool | null>(null);

  // Form state
  const [stakeForm] = Form.useForm();
  const [stakeAmount, setStakeAmount] = useState(0);

  // User stats
  const [userStats, setUserStats] = useState({
    totalRewards: 0,
    claimedRewards: 0,
    pendingRewards: 0,
    nftCount: 0,
    stakedAmount: 0,
    achievementPoints: 0,
    rank: 'Gold',
    level: 25,
  });

  // Fetch rewards data
  const fetchRewardsData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Mock rewards data
      const mockRewards: Reward[] = [
        {
          id: '1',
          type: 'mining',
          title: 'Block Mining Reward',
          description: 'Successfully mined block #12345',
          amount: 50,
          token: 'LDT',
          status: 'pending',
          timestamp: new Date().toISOString(),
          metadata: { blockHeight: 12345, difficulty: 1.5 },
          rarity: 'common',
        },
        {
          id: '2',
          type: 'seo',
          title: 'SEO Optimization Bonus',
          description: 'Achieved 95% SEO score for client website',
          amount: 25,
          token: 'LDT',
          status: 'claimed',
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          metadata: { score: 95, clientId: 'client123' },
          rarity: 'rare',
        },
        {
          id: '3',
          type: 'metaverse',
          title: 'Metaverse Bridge Creator',
          description: 'Established new bridge to metaverse node',
          amount: 100,
          token: 'META',
          status: 'pending',
          timestamp: new Date(Date.now() - 172800000).toISOString(),
          metadata: { nodeId: 'node456', bridges: 3 },
          rarity: 'epic',
        },
        {
          id: '4',
          type: 'achievement',
          title: 'Master Miner Achievement',
          description: 'Mined 100 blocks successfully',
          amount: 500,
          token: 'NFT',
          status: 'claimed',
          timestamp: new Date(Date.now() - 259200000).toISOString(),
          metadata: { achievementId: 'master_miner', blocksMined: 100 },
          rarity: 'legendary',
        },
      ];
      
      setRewards(mockRewards);
      
      // Mock NFT data
      const mockNFTs: NFTAsset[] = [
        {
          id: '1',
          name: 'LightDom Genesis Miner',
          description: 'Limited edition NFT for early miners',
          image: '/api/placeholder/300/300',
          collection: 'Genesis Collection',
          rarity: 'legendary',
          value: 1000,
          owner: '0x1234...5678',
          minted: new Date().toISOString(),
          properties: {
            hash_power: '100 MH/s',
            efficiency: '95%',
            bonus_multiplier: '2x',
          },
        },
        {
          id: '2',
          name: 'SEO Master Badge',
          description: 'Awarded for achieving 99% SEO accuracy',
          image: '/api/placeholder/300/300',
          collection: 'Achievement Badges',
          rarity: 'epic',
          value: 500,
          owner: '0x1234...5678',
          minted: new Date(Date.now() - 86400000).toISOString(),
          properties: {
            accuracy: '99%',
            projects_completed: '50',
            client_satisfaction: '5/5',
          },
        },
      ];
      
      setNfts(mockNFTs);
      
      // Mock staking pools
      const mockPools: StakingPool[] = [
        {
          id: '1',
          name: 'LightDom Staking Pool',
          apy: 12.5,
          totalStaked: 1000000,
          yourStake: 5000,
          rewards: 125.5,
          lockPeriod: 30,
          minStake: 100,
          maxStake: 100000,
        },
        {
          id: '2',
          name: 'Metaverse Economy Pool',
          apy: 18.2,
          totalStaked: 500000,
          yourStake: 2000,
          rewards: 91.0,
          lockPeriod: 60,
          minStake: 500,
          maxStake: 50000,
        },
        {
          id: '3',
          name: 'SEO Performance Pool',
          apy: 15.8,
          totalStaked: 750000,
          yourStake: 0,
          rewards: 0,
          lockPeriod: 45,
          minStake: 250,
          maxStake: 75000,
        },
      ];
      
      setStakingPools(mockPools);
      
      // Mock achievements
      const mockAchievements: Achievement[] = [
        {
          id: '1',
          title: 'Block Pioneer',
          description: 'Mine your first block',
          icon: <TrophyOutlined />,
          progress: 1,
          total: 1,
          reward: 10,
          unlocked: true,
          category: 'mining',
        },
        {
          id: '2',
          title: 'SEO Expert',
          description: 'Achieve 90% SEO score on 10 projects',
          icon: <StarOutlined />,
          progress: 7,
          total: 10,
          reward: 100,
          unlocked: false,
          category: 'seo',
        },
        {
          id: '3',
          title: 'Metaverse Explorer',
          description: 'Create 5 metaverse bridges',
          icon: <GlobalOutlined />,
          progress: 3,
          total: 5,
          reward: 50,
          unlocked: false,
          category: 'metaverse',
        },
        {
          id: '4',
          title: 'Community Leader',
          description: 'Refer 10 active users',
          icon: <TeamOutlined />,
          progress: 6,
          total: 10,
          reward: 75,
          unlocked: false,
          category: 'social',
        },
      ];
      
      setAchievements(mockAchievements);
      
      // Calculate user stats
      const stats = {
        totalRewards: mockRewards.reduce((sum, reward) => sum + reward.amount, 0),
        claimedRewards: mockRewards.filter(r => r.status === 'claimed').reduce((sum, reward) => sum + reward.amount, 0),
        pendingRewards: mockRewards.filter(r => r.status === 'pending').reduce((sum, reward) => sum + reward.amount, 0),
        nftCount: mockNFTs.length,
        stakedAmount: mockPools.reduce((sum, pool) => sum + pool.yourStake, 0),
        achievementPoints: mockAchievements.filter(a => a.unlocked).reduce((sum, achievement) => sum + achievement.reward, 0),
        rank: 'Gold',
        level: 25,
      };
      
      setUserStats(stats);
      
    } catch (error) {
      console.error('Failed to fetch rewards data:', error);
      message.error('Failed to load rewards data');
    } finally {
      setLoading(false);
    }
  }, []);

  // Claim reward
  const claimReward = useCallback(async (reward: Reward) => {
    try {
      setLoading(true);
      
      // Mock claim process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setRewards(prev => prev.map(r => 
        r.id === reward.id ? { ...r, status: 'claimed' as const } : r
      ));
      
      message.success(`Successfully claimed ${reward.amount} ${reward.token}!`);
      setClaimModalVisible(false);
      
    } catch (error) {
      console.error('Failed to claim reward:', error);
      message.error('Failed to claim reward');
    } finally {
      setLoading(false);
    }
  }, []);

  // Stake tokens
  const stakeTokens = useCallback(async (poolId: string, amount: number) => {
    try {
      setLoading(true);
      
      // Mock staking process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setStakingPools(prev => prev.map(pool => 
        pool.id === poolId ? { ...pool, yourStake: pool.yourStake + amount } : pool
      ));
      
      message.success(`Successfully staked ${amount} tokens!`);
      setStakeModalVisible(false);
      stakeForm.resetFields();
      
    } catch (error) {
      console.error('Failed to stake tokens:', error);
      message.error('Failed to stake tokens');
    } finally {
      setLoading(false);
    }
  }, [stakeForm]);

  // Initialize component
  useEffect(() => {
    fetchRewardsData();
  }, [fetchRewardsData]);

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

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'claimed': return Colors.success;
      case 'pending': return Colors.warning;
      case 'expired': return Colors.error;
      default: return Colors.textTertiary;
    }
  };

  // Render rewards tab
  const renderRewards = () => (
    <Row gutter={[Spacing.lg, Spacing.lg]}>
      <Col xs={24} lg={16}>
        <Card
          title={
            <Space>
              <TrophyOutlined style={{ color: Colors.primary }} />
              <span>Available Rewards</span>
            </Space>
          }
          style={{
            backgroundColor: Colors.surface,
            border: `1px solid ${Colors.border}`,
            borderRadius: '12px',
          }}
        >
          <Table
            dataSource={rewards}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10 }}
            columns={[
              {
                title: 'Type',
                dataIndex: 'type',
                key: 'type',
                render: (type: string) => (
                  <Tag color={type === 'mining' ? 'orange' : 
                              type === 'seo' ? 'blue' : 
                              type === 'metaverse' ? 'purple' : 
                              type === 'achievement' ? 'gold' : 'green'}>
                    {type.toUpperCase()}
                  </Tag>
                ),
              },
              {
                title: 'Reward',
                dataIndex: 'title',
                key: 'title',
                render: (title: string, record: Reward) => (
                  <Space direction="vertical" size={0}>
                    <Text style={{ color: Colors.text, fontWeight: 500 }}>{title}</Text>
                    <Text style={{ color: Colors.textTertiary, fontSize: '12px' }}>
                      {record.description}
                    </Text>
                  </Space>
                ),
              },
              {
                title: 'Amount',
                dataIndex: 'amount',
                key: 'amount',
                render: (amount: number, record: Reward) => (
                  <Space>
                    <Text strong style={{ color: Colors.text }}>
                      {amount} {record.token}
                    </Text>
                    <Tag color={getRarityColor(record.rarity)} style={{ fontSize: '10px' }}>
                      {record.rarity.toUpperCase()}
                    </Tag>
                  </Space>
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
                render: (_, record: Reward) => (
                  <Space>
                    <Button
                      type="link"
                      icon={<EyeOutlined />}
                      onClick={() => setSelectedReward(record)}
                    >
                      View
                    </Button>
                    {record.status === 'pending' && (
                      <Button
                        type="primary"
                        size="small"
                        onClick={() => {
                          setSelectedReward(record);
                          setClaimModalVisible(true);
                        }}
                      >
                        Claim
                      </Button>
                    )}
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
                <WalletOutlined style={{ color: Colors.success }} />
                <span>Wallet Stats</span>
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
                title="Total Rewards"
                value={userStats.totalRewards}
                prefix={<TrophyOutlined />}
                valueStyle={{ color: Colors.primary }}
              />
              <Statistic
                title="Claimed"
                value={userStats.claimedRewards}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: Colors.success }}
              />
              <Statistic
                title="Pending"
                value={userStats.pendingRewards}
                prefix={<ExclamationCircleOutlined />}
                valueStyle={{ color: Colors.warning }}
              />
              <Statistic
                title="NFT Collection"
                value={userStats.nftCount}
                prefix={<DiamondOutlined />}
                valueStyle={{ color: Colors.info }}
              />
              <Statistic
                title="Staked Amount"
                value={userStats.stakedAmount}
                prefix={<SafetyOutlined />}
                valueStyle={{ color: Colors.secondary }}
              />
            </Space>
          </Card>
          
          <Card
            title={
              <Space>
                <CrownOutlined style={{ color: Colors.warning }} />
                <span>User Rank</span>
              </Space>
            }
            style={{
              backgroundColor: Colors.surface,
              border: `1px solid ${Colors.border}`,
              borderRadius: '12px',
            }}
          >
            <Space direction="vertical" style={{ width: '100%' }} size={Spacing.md}>
              <div style={{ textAlign: 'center' }}>
                <Avatar
                  size={64}
                  style={{
                    backgroundColor: Colors.gradients.primary,
                    border: `3px solid ${Colors.warning}`,
                  }}
                  icon={<CrownOutlined />}
                />
                <div style={{ marginTop: Spacing.md }}>
                  <Title level={4} style={{ color: Colors.text, margin: 0 }}>
                    {userStats.rank}
                  </Title>
                  <Text style={{ color: Colors.textSecondary }}>Level {userStats.level}</Text>
                </div>
              </div>
              
              <div>
                <Text strong style={{ color: Colors.text }}>Progress to Next Level</Text>
                <Progress
                  percent={75}
                  strokeColor={Colors.gradients.success}
                  style={{ marginTop: Spacing.sm }}
                />
              </div>
              
              <div>
                <Text strong style={{ color: Colors.text }}>Achievement Points</Text>
                <Statistic
                  value={userStats.achievementPoints}
                  prefix={<StarOutlined />}
                  valueStyle={{ color: Colors.warning }}
                />
              </div>
            </Space>
          </Card>
        </Space>
      </Col>
    </Row>
  );

  // Render NFT collection tab
  const renderNFTs = () => (
    <Row gutter={[Spacing.lg, Spacing.lg]}>
      <Col xs={24} lg={16}>
        <Card
          title={
            <Space>
              <DiamondOutlined style={{ color: Colors.primary }} />
              <span>NFT Collection</span>
            </Space>
          }
          style={{
            backgroundColor: Colors.surface,
            border: `1px solid ${Colors.border}`,
            borderRadius: '12px',
          }}
        >
          <Row gutter={[Spacing.md, Spacing.md]}>
            {nfts.map((nft) => (
              <Col xs={24} sm={12} lg={8} key={nft.id}>
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
                    <ShareAltOutlined key="share" onClick={() => message.info('Share NFT')} />,
                    <DownloadOutlined key="download" onClick={() => message.info('Download NFT')} />,
                  ]}
                >
                  <Card.Meta
                    title={
                      <Space>
                        <Text style={{ color: Colors.text }}>{nft.name}</Text>
                        <Tag color={getRarityColor(nft.rarity)} size="small">
                          {nft.rarity.toUpperCase()}
                        </Tag>
                      </Space>
                    }
                    description={
                      <Space direction="vertical" size={0}>
                        <Text style={{ color: Colors.textSecondary, fontSize: '12px' }}>
                          {nft.description}
                        </Text>
                        <Text style={{ color: Colors.textSecondary, fontSize: '12px' }}>
                          {nft.collection}
                        </Text>
                        <Text strong style={{ color: Colors.primary }}>
                          {nft.value} LDT
                        </Text>
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
        <Card
          title={
            <Space>
              <BarChartOutlined style={{ color: Colors.info }} />
              <span>Collection Stats</span>
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
              title="Total NFTs"
              value={nfts.length}
              prefix={<DiamondOutlined />}
              valueStyle={{ color: Colors.primary }}
            />
            <Statistic
              title="Collection Value"
              value={nfts.reduce((sum, nft) => sum + nft.value, 0)}
              suffix="LDT"
              prefix={<WalletOutlined />}
              valueStyle={{ color: Colors.success }}
            />
            <div>
              <Text strong style={{ color: Colors.text }}>Rarity Distribution</Text>
              <div style={{ marginTop: Spacing.sm }}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text style={{ color: Colors.textSecondary }}>Legendary</Text>
                    <Text style={{ color: Colors.warning }}>
                      {nfts.filter(n => n.rarity === 'legendary').length}
                    </Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text style={{ color: Colors.textSecondary }}>Epic</Text>
                    <Text style={{ color: Colors.primary }}>
                      {nfts.filter(n => n.rarity === 'epic').length}
                    </Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text style={{ color: Colors.textSecondary }}>Rare</Text>
                    <Text style={{ color: Colors.info }}>
                      {nfts.filter(n => n.rarity === 'rare').length}
                    </Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text style={{ color: Colors.textSecondary }}>Common</Text>
                    <Text style={{ color: Colors.textTertiary }}>
                      {nfts.filter(n => n.rarity === 'common').length}
                    </Text>
                  </div>
                </Space>
              </div>
            </div>
          </Space>
        </Card>
      </Col>
    </Row>
  );

  // Render staking tab
  const renderStaking = () => (
    <Row gutter={[Spacing.lg, Spacing.lg]}>
      <Col xs={24} lg={16}>
        <Card
          title={
            <Space>
              <SafetyOutlined style={{ color: Colors.success }} />
              <span>Staking Pools</span>
            </Space>
          }
          style={{
            backgroundColor: Colors.surface,
            border: `1px solid ${Colors.border}`,
            borderRadius: '12px',
          }}
        >
          <Table
            dataSource={stakingPools}
            rowKey="id"
            pagination={false}
            columns={[
              {
                title: 'Pool Name',
                dataIndex: 'name',
                key: 'name',
                render: (name: string) => (
                  <Text style={{ color: Colors.text, fontWeight: 500 }}>{name}</Text>
                ),
              },
              {
                title: 'APY',
                dataIndex: 'apy',
                key: 'apy',
                render: (apy: number) => (
                  <Text strong style={{ color: Colors.success }}>
                    {apy}%
                  </Text>
                ),
              },
              {
                title: 'Total Staked',
                dataIndex: 'totalStaked',
                key: 'totalStaked',
                render: (totalStaked: number) => (
                  <Text style={{ color: Colors.textSecondary }}>
                    {totalStaked.toLocaleString()} LDT
                  </Text>
                ),
              },
              {
                title: 'Your Stake',
                dataIndex: 'yourStake',
                key: 'yourStake',
                render: (yourStake: number) => (
                  <Text style={{ color: Colors.text }}>
                    {yourStake.toLocaleString()} LDT
                  </Text>
                ),
              },
              {
                title: 'Rewards',
                dataIndex: 'rewards',
                key: 'rewards',
                render: (rewards: number) => (
                  <Text strong style={{ color: Colors.warning }}>
                    {rewards.toFixed(2)} LDT
                  </Text>
                ),
              },
              {
                title: 'Actions',
                key: 'actions',
                render: (_, record: StakingPool) => (
                  <Space>
                    <Button
                      type="primary"
                      size="small"
                      onClick={() => {
                        setSelectedPool(record);
                        setStakeModalVisible(true);
                      }}
                    >
                      Stake
                    </Button>
                    <Button
                      size="small"
                      disabled={record.yourStake === 0}
                    >
                      Unstake
                    </Button>
                  </Space>
                ),
              },
            ]}
          />
        </Card>
      </Col>
      
      <Col xs={24} lg={8}>
        <Card
          title={
            <Space>
              <LineChartOutlined style={{ color: Colors.info }} />
              <span>Staking Overview</span>
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
              title="Total Staked"
              value={userStats.stakedAmount}
              suffix="LDT"
              prefix={<SafetyOutlined />}
              valueStyle={{ color: Colors.success }}
            />
            <Statistic
              title="Pending Rewards"
              value={stakingPools.reduce((sum, pool) => sum + pool.rewards, 0)}
              suffix="LDT"
              prefix={<GiftOutlined />}
              valueStyle={{ color: Colors.warning }}
            />
            <Statistic
              title="Average APY"
              value={stakingPools.length > 0 ? 
                (stakingPools.reduce((sum, pool) => sum + pool.apy, 0) / stakingPools.length).toFixed(1) : 
                0}
              suffix="%"
              prefix={<BarChartOutlined />}
              valueStyle={{ color: Colors.info }}
            />
            
            <Alert
              message="Staking Rewards"
              description="Earn passive income by staking your LDT tokens in our high-yield pools."
              type="info"
              showIcon
              style={{ marginTop: Spacing.md }}
            />
          </Space>
        </Card>
      </Col>
    </Row>
  );

  // Render achievements tab
  const renderAchievements = () => (
    <Row gutter={[Spacing.lg, Spacing.lg]}>
      <Col xs={24} lg={16}>
        <Card
          title={
            <Space>
              <TrophyOutlined style={{ color: Colors.warning }} />
              <span>Achievements</span>
            </Space>
          }
          style={{
            backgroundColor: Colors.surface,
            border: `1px solid ${Colors.border}`,
            borderRadius: '12px',
          }}
        >
          <Row gutter={[Spacing.md, Spacing.md]}>
            {achievements.map((achievement) => (
              <Col xs={24} sm={12} lg={6} key={achievement.id}>
                <Card
                  style={{
                    backgroundColor: achievement.unlocked ? Colors.surfaceLight : Colors.surface,
                    border: `1px solid ${achievement.unlocked ? Colors.success : Colors.border}`,
                    borderRadius: '8px',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ marginBottom: Spacing.md }}>
                    <Avatar
                      size={48}
                      style={{
                        backgroundColor: achievement.unlocked ? Colors.success : Colors.textTertiary,
                      }}
                      icon={achievement.icon}
                    />
                  </div>
                  <Title level={5} style={{ 
                    color: Colors.text, 
                    margin: 0, 
                    marginBottom: Spacing.xs 
                  }}>
                    {achievement.title}
                  </Title>
                  <Text style={{ 
                    color: Colors.textSecondary, 
                    fontSize: '12px',
                    marginBottom: Spacing.md,
                    display: 'block'
                  }}>
                    {achievement.description}
                  </Text>
                  <Progress
                    percent={Math.round((achievement.progress / achievement.total) * 100)}
                    size="small"
                    strokeColor={achievement.unlocked ? Colors.success : Colors.primary}
                    style={{ marginBottom: Spacing.sm }}
                  />
                  <Text style={{ 
                    color: Colors.textTertiary, 
                    fontSize: '12px' 
                  }}>
                    {achievement.progress}/{achievement.total}
                  </Text>
                  <div style={{ marginTop: Spacing.sm }}>
                    <Text strong style={{ color: Colors.warning }}>
                      +{achievement.reward} LDT
                    </Text>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </Card>
      </Col>
      
      <Col xs={24} lg={8}>
        <Card
          title={
            <Space>
              <StarOutlined style={{ color: Colors.warning }} />
              <span>Achievement Stats</span>
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
              title="Unlocked Achievements"
              value={achievements.filter(a => a.unlocked).length}
              suffix={`/ ${achievements.length}`}
              prefix={<TrophyOutlined />}
              valueStyle={{ color: Colors.success }}
            />
            <Statistic
              title="Total Points"
              value={userStats.achievementPoints}
              prefix={<StarOutlined />}
              valueStyle={{ color: Colors.warning }}
            />
            <div>
              <Text strong style={{ color: Colors.text }}>Category Progress</Text>
              <div style={{ marginTop: Spacing.sm }}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div>
                    <Text style={{ color: Colors.textSecondary }}>Mining</Text>
                    <Progress percent={75} size="small" />
                  </div>
                  <div>
                    <Text style={{ color: Colors.textSecondary }}>SEO</Text>
                    <Progress percent={60} size="small" />
                  </div>
                  <div>
                    <Text style={{ color: Colors.textSecondary }}>Metaverse</Text>
                    <Progress percent={40} size="small" />
                  </div>
                  <div>
                    <Text style={{ color: Colors.textSecondary }}>Social</Text>
                    <Progress percent={30} size="small" />
                  </div>
                </Space>
              </div>
            </div>
          </Space>
        </Card>
      </Col>
    </Row>
  );

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
          Blockchain Rewards
        </Title>
        <Text style={{ 
          fontSize: '16px',
          color: Colors.textSecondary,
        }}>
          Comprehensive reward system with NFTs, staking, and achievement tracking
        </Text>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        style={{ color: Colors.text }}
        items={[
          {
            key: 'rewards',
            label: (
              <Space>
                <TrophyOutlined />
                <span>Rewards</span>
                <Badge count={userStats.pendingRewards} style={{ backgroundColor: Colors.warning }} />
              </Space>
            ),
            children: renderRewards(),
          },
          {
            key: 'nfts',
            label: (
              <Space>
                <DiamondOutlined />
                <span>NFT Collection</span>
                <Badge count={userStats.nftCount} style={{ backgroundColor: Colors.primary }} />
              </Space>
            ),
            children: renderNFTs(),
          },
          {
            key: 'staking',
            label: (
              <Space>
                <SafetyOutlined />
                <span>Staking</span>
              </Space>
            ),
            children: renderStaking(),
          },
          {
            key: 'achievements',
            label: (
              <Space>
                <StarOutlined />
                <span>Achievements</span>
                <Badge count={achievements.filter(a => a.unlocked).length} style={{ backgroundColor: Colors.success }} />
              </Space>
            ),
            children: renderAchievements(),
          },
        ]}
      />

      {/* Claim Reward Modal */}
      <Modal
        title="Claim Reward"
        open={claimModalVisible}
        onCancel={() => setClaimModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setClaimModalVisible(false)}>
            Cancel
          </Button>,
          <Button
            key="claim"
            type="primary"
            loading={loading}
            onClick={() => selectedReward && claimReward(selectedReward)}
          >
            Claim Reward
          </Button>,
        ]}
      >
        {selectedReward && (
          <Space direction="vertical" style={{ width: '100%' }} size={Spacing.lg}>
            <Alert
              message="Reward Details"
              description={
                <Space direction="vertical" size={0}>
                  <Text strong>{selectedReward.title}</Text>
                  <Text>{selectedReward.description}</Text>
                  <Text strong style={{ color: Colors.primary }}>
                    {selectedReward.amount} {selectedReward.token}
                  </Text>
                </Space>
              }
              type="info"
              showIcon
            />
            <div>
              <Text strong>Transaction Details:</Text>
              <div style={{ marginTop: Spacing.sm, padding: Spacing.sm, backgroundColor: Colors.surfaceLight, borderRadius: '8px' }}>
                <Text style={{ color: Colors.textSecondary, fontSize: '12px' }}>
                  Network: Ethereum Mainnet
                  <br />
                  Gas Fee: ~0.001 ETH
                  <br />
                  Estimated Time: 2-3 minutes
                </Text>
              </div>
            </div>
          </Space>
        )}
      </Modal>

      {/* Stake Modal */}
      <Modal
        title="Stake Tokens"
        open={stakeModalVisible}
        onCancel={() => setStakeModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setStakeModalVisible(false)}>
            Cancel
          </Button>,
          <Button
            key="stake"
            type="primary"
            loading={loading}
            onClick={() => selectedPool && stakeTokens(selectedPool.id, stakeAmount)}
          >
            Stake Tokens
          </Button>,
        ]}
      >
        {selectedPool && (
          <Form form={stakeForm} layout="vertical">
            <Form.Item label="Pool">
              <Input value={selectedPool.name} readOnly />
            </Form.Item>
            <Form.Item label="APY">
              <Input value={`${selectedPool.apy}%`} readOnly />
            </Form.Item>
            <Form.Item label="Stake Amount" required>
              <InputNumber
                style={{ width: '100%' }}
                min={selectedPool.minStake}
                max={selectedPool.maxStake}
                value={stakeAmount}
                onChange={(value) => setStakeAmount(value || 0)}
                placeholder="Enter amount to stake"
              />
            </Form.Item>
            <Form.Item label="Lock Period">
              <Input value={`${selectedPool.lockPeriod} days`} readOnly />
            </Form.Item>
            <Alert
              message="Staking Information"
              description={`You will earn ${selectedPool.apy}% APY on your staked tokens. Tokens will be locked for ${selectedPool.lockPeriod} days.`}
              type="info"
              showIcon
            />
          </Form>
        )}
      </Modal>
    </div>
  );
};

export default BlockchainRewards;
