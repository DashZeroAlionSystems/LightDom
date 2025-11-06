/**
 * Achievements Page
 * Professional gamification and rewards system with real data integration
 */

import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Typography,
  Space,
  Button,
  Progress,
  Tag,
  Alert,
  Statistic,
  List,
  Avatar,
  Tooltip,
  Modal,
  Badge,
  message,
  Tabs,
  Divider,
} from 'antd';
import {
  TrophyOutlined,
  StarOutlined,
  CrownOutlined,
  FireOutlined,
  RocketOutlined,
  ThunderboltOutlined,
  CheckCircleOutlined,
  LockOutlined,
  GiftOutlined,
  MedalOutlined,
  DiamondOutlined,
  GoldenOutlined,
  HeartOutlined,
  ThunderboltOutlined as BoltOutlined,
  ApiOutlined,
  ExperimentOutlined,
  BugOutlined,
  GlobalOutlined,
  DatabaseOutlined,
  ClusterOutlined,
  SearchOutlined,
  SettingOutlined,
  BarChartOutlined,
  WalletOutlined,
  SecurityScanOutlined,
  EyeOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

interface Achievement {
  id: string;
  title: string;
  description: string;
  category: 'mining' | 'optimization' | 'exploration' | 'social' | 'technical';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  progress: number;
  maxProgress: number;
  unlocked: boolean;
  unlockedAt?: string;
  reward: {
    type: 'points' | 'badge' | 'title' | 'item';
    value: string | number;
  };
  icon: React.ReactNode;
}

interface UserStats {
  totalPoints: number;
  level: number;
  nextLevelPoints: number;
  currentLevelPoints: number;
  totalAchievements: number;
  unlockedAchievements: number;
  streak: number;
  rank: string;
}

interface LeaderboardEntry {
  rank: number;
  username: string;
  points: number;
  achievements: number;
  avatar: string;
  status: 'online' | 'offline' | 'away';
}

const AchievementsPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  // State for real data
  const [userStats, setUserStats] = useState<UserStats>({
    totalPoints: 0,
    level: 1,
    nextLevelPoints: 1000,
    currentLevelPoints: 0,
    totalAchievements: 0,
    unlockedAchievements: 0,
    streak: 0,
    rank: 'Novice',
  });

  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  // Load real data on component mount
  useEffect(() => {
    loadAchievementsData();
    
    // Set up real-time updates
    const interval = setInterval(() => {
      loadAchievementsData();
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const loadAchievementsData = async () => {
    try {
      // Mock API calls - replace with real API calls
      const mockUserStats: UserStats = {
        totalPoints: 2850,
        level: 12,
        nextLevelPoints: 3000,
        currentLevelPoints: 2850,
        totalAchievements: 45,
        unlockedAchievements: 28,
        streak: 7,
        rank: 'Expert Optimizer',
      };

      const mockAchievements: Achievement[] = [
        {
          id: '1',
          title: 'First Steps',
          description: 'Complete your first website optimization',
          category: 'optimization',
          rarity: 'common',
          progress: 1,
          maxProgress: 1,
          unlocked: true,
          unlockedAt: '2025-10-20T10:30:00Z',
          reward: { type: 'points', value: 100 },
          icon: <RocketOutlined />,
        },
        {
          id: '2',
          title: 'Space Saver',
          description: 'Save over 1MB of total space through optimizations',
          category: 'optimization',
          rarity: 'rare',
          progress: 850,
          maxProgress: 1024,
          unlocked: false,
          reward: { type: 'points', value: 500 },
          icon: <DatabaseOutlined />,
        },
        {
          id: '3',
          title: 'Mining Pioneer',
          description: 'Mine your first block on the LightDom network',
          category: 'mining',
          rarity: 'common',
          progress: 1,
          maxProgress: 1,
          unlocked: true,
          unlockedAt: '2025-10-21T14:15:00Z',
          reward: { type: 'badge', value: 'Pioneer' },
          icon: <ThunderboltOutlined />,
        },
        {
          id: '4',
          title: 'Efficiency Expert',
          description: 'Maintain 95%+ mining efficiency for 24 hours',
          category: 'mining',
          rarity: 'epic',
          progress: 87,
          maxProgress: 100,
          unlocked: false,
          reward: { type: 'title', value: 'Efficiency Master' },
          icon: <BoltOutlined />,
        },
        {
          id: '5',
          title: 'Biome Explorer',
          description: 'Discover optimizations in all 5 biome types',
          category: 'exploration',
          rarity: 'rare',
          progress: 3,
          maxProgress: 5,
          unlocked: false,
          reward: { type: 'points', value: 750 },
          icon: <GlobalOutlined />,
        },
        {
          id: '6',
          title: 'Social Butterfly',
          description: 'Connect with 10 other users in the metaverse',
          category: 'social',
          rarity: 'common',
          progress: 7,
          maxProgress: 10,
          unlocked: false,
          reward: { type: 'points', value: 250 },
          icon: <HeartOutlined />,
        },
        {
          id: '7',
          title: 'Debug Master',
          description: 'Successfully resolve 50 system issues',
          category: 'technical',
          rarity: 'epic',
          progress: 42,
          maxProgress: 50,
          unlocked: false,
          reward: { type: 'item', value: 'Debug Tools Pro' },
          icon: <BugOutlined />,
        },
        {
          id: '8',
          title: 'Legendary Optimizer',
          description: 'Achieve 99% compression ratio on 10 websites',
          category: 'optimization',
          rarity: 'legendary',
          progress: 6,
          maxProgress: 10,
          unlocked: false,
          reward: { type: 'title', value: 'Legendary Optimizer' },
          icon: <CrownOutlined />,
        },
      ];

      const mockLeaderboard: LeaderboardEntry[] = [
        { rank: 1, username: 'CryptoKing', points: 15420, achievements: 89, avatar: '👑', status: 'online' },
        { rank: 2, username: 'OptimizeMaster', points: 12850, achievements: 76, avatar: '⚡', status: 'online' },
        { rank: 3, username: 'SpaceSaver', points: 11200, achievements: 68, avatar: '🚀', status: 'away' },
        { rank: 4, username: 'BiomeExplorer', points: 9800, achievements: 62, avatar: '🌍', status: 'online' },
        { rank: 5, username: 'You', points: mockUserStats.totalPoints, achievements: mockUserStats.unlockedAchievements, avatar: '🎯', status: 'online' },
        { rank: 6, username: 'MiningPro', points: 8500, achievements: 55, avatar: '⛏️', status: 'offline' },
        { rank: 7, username: 'DebugNinja', points: 7200, achievements: 48, avatar: '🥷', status: 'online' },
        { rank: 8, username: 'SocialStar', points: 6500, achievements: 42, avatar: '⭐', status: 'away' },
      ];

      setUserStats(mockUserStats);
      setAchievements(mockAchievements);
      setLeaderboard(mockLeaderboard);
    } catch (error) {
      console.error('Failed to load achievements data:', error);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return '#737373';
      case 'rare': return '#0ea5e9';
      case 'epic': return '#8b5cf6';
      case 'legendary': return '#f59e0b';
      default: return '#737373';
    }
  };

  const getRarityBorder = (rarity: string) => {
    switch (rarity) {
      case 'common': return '#404040';
      case 'rare': return '#0ea5e9';
      case 'epic': return '#8b5cf6';
      case 'legendary': return '#f59e0b';
      default: return '#404040';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'mining': return <ThunderboltOutlined style={{ color: '#7c3aed' }} />;
      case 'optimization': return <RocketOutlined style={{ color: '#22c55e' }} />;
      case 'exploration': return <GlobalOutlined style={{ color: '#0ea5e9' }} />;
      case 'social': return <HeartOutlined style={{ color: '#ec4899' }} />;
      case 'technical': return <BugOutlined style={{ color: '#f59e0b' }} />;
      default: return <StarOutlined style={{ color: '#737373' }} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return '#22c55e';
      case 'away': return '#f59e0b';
      case 'offline': return '#737373';
      default: return '#737373';
    }
  };

  const filteredAchievements = {
    all: achievements,
    unlocked: achievements.filter(a => a.unlocked),
    locked: achievements.filter(a => !a.unlocked),
    mining: achievements.filter(a => a.category === 'mining'),
    optimization: achievements.filter(a => a.category === 'optimization'),
    exploration: achievements.filter(a => a.category === 'exploration'),
    social: achievements.filter(a => a.category === 'social'),
    technical: achievements.filter(a => a.category === 'technical'),
  };

  return (
    <div style={{ padding: '24px', backgroundColor: '#0a0a0a', minHeight: '100vh' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '32px' }}>
        <Title level={2} style={{ color: '#fafafa', margin: 0, marginBottom: '8px' }}>
          Achievements
        </Title>
        <Text style={{ color: '#a3a3a3', fontSize: '16px' }}>
          Track your progress and unlock rewards through platform activities
        </Text>
      </div>

      {/* User Stats Overview */}
      <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ backgroundColor: '#171717', border: '1px solid #404040', height: '160px' }}>
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <Space>
                <TrophyOutlined style={{ color: '#f59e0b', fontSize: '20px' }} />
                <Text style={{ color: '#a3a3a3' }}>Total Points</Text>
              </Space>
              <Statistic
                value={userStats.totalPoints}
                valueStyle={{ color: '#f59e0b', fontSize: '28px', fontWeight: 700 }}
              />
            </Space>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card style={{ backgroundColor: '#171717', border: '1px solid #404040', height: '160px' }}>
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <Space>
                <StarOutlined style={{ color: '#8b5cf6', fontSize: '20px' }} />
                <Text style={{ color: '#a3a3a3' }}>Level</Text>
              </Space>
              <Statistic
                value={userStats.level}
                valueStyle={{ color: '#8b5cf6', fontSize: '28px', fontWeight: 700 }}
              />
              <Progress
                percent={(userStats.currentLevelPoints / userStats.nextLevelPoints) * 100}
                strokeColor="#8b5cf6"
                size="small"
                showInfo={false}
              />
            </Space>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card style={{ backgroundColor: '#171717', border: '1px solid #404040', height: '160px' }}>
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <Space>
                <MedalOutlined style={{ color: '#22c55e', fontSize: '20px' }} />
                <Text style={{ color: '#a3a3a3' }}>Achievements</Text>
              </Space>
              <Statistic
                value={userStats.unlockedAchievements}
                suffix={`/ ${userStats.totalAchievements}`}
                valueStyle={{ color: '#22c55e', fontSize: '28px', fontWeight: 700 }}
              />
            </Space>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card style={{ backgroundColor: '#171717', border: '1px solid #404040', height: '160px' }}>
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <Space>
                <FireOutlined style={{ color: '#ef4444', fontSize: '20px' }} />
                <Text style={{ color: '#a3a3a3' }}>Streak</Text>
              </Space>
              <Statistic
                value={userStats.streak}
                suffix="days"
                valueStyle={{ color: '#ef4444', fontSize: '28px', fontWeight: 700 }}
              />
            </Space>
          </Card>
        </Col>
      </Row>

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="Achievements" key="achievements">
          <Row gutter={[24, 24]}>
            <Col xs={24} lg={18}>
              <Card
                title="Your Achievements"
                style={{ backgroundColor: '#171717', border: '1px solid #404040' }}
                headStyle={{ borderBottom: '1px solid #404040' }}
              >
                <Tabs defaultActiveKey="all" size="small">
                  <TabPane tab="All" key="all" />
                  <TabPane tab="Unlocked" key="unlocked" />
                  <TabPane tab="Locked" key="locked" />
                  <TabPane tab="Mining" key="mining" />
                  <TabPane tab="Optimization" key="optimization" />
                  <TabPane tab="Exploration" key="exploration" />
                  <TabPane tab="Social" key="social" />
                  <TabPane tab="Technical" key="technical" />
                </Tabs>

                <Row gutter={[16, 16]}>
                  {filteredAchievements[activeTab === 'achievements' ? 'all' : activeTab as keyof typeof filteredAchievements]?.map((achievement) => (
                    <Col xs={24} sm={12} md={8} lg={6} key={achievement.id}>
                      <Card
                        hoverable
                        style={{
                          backgroundColor: achievement.unlocked ? '#262626' : '#1a1a1a',
                          border: `2px solid ${getRarityBorder(achievement.rarity)}`,
                          cursor: 'pointer',
                          opacity: achievement.unlocked ? 1 : 0.6,
                        }}
                        onClick={() => {
                          setSelectedAchievement(achievement);
                          setDetailModalVisible(true);
                        }}
                      >
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ marginBottom: '12px' }}>
                            <Badge
                              count={achievement.unlocked ? <CheckCircleOutlined style={{ color: '#22c55e' }} /> : <LockOutlined style={{ color: '#737373' }} />}
                            >
                              <Avatar
                                size={48}
                                icon={achievement.icon}
                                style={{
                                  backgroundColor: achievement.unlocked ? getRarityColor(achievement.rarity) : '#404040',
                                }}
                              />
                            </Badge>
                          </div>

                          <Title level={5} style={{ color: '#fafafa', margin: '0 0 8px 0', fontSize: '14px' }}>
                            {achievement.title}
                          </Title>

                          <Text style={{ color: '#737373', fontSize: '12px', display: 'block', marginBottom: '12px' }}>
                            {achievement.description}
                          </Text>

                          <Tag color={getRarityColor(achievement.rarity)} size="small">
                            {achievement.rarity.toUpperCase()}
                          </Tag>

                          {!achievement.unlocked && (
                            <div style={{ marginTop: '12px' }}>
                              <Progress
                                percent={(achievement.progress / achievement.maxProgress) * 100}
                                size="small"
                                strokeColor="#7c3aed"
                                format={() => `${achievement.progress}/${achievement.maxProgress}`}
                              />
                            </div>
                          )}

                          {achievement.unlocked && achievement.unlockedAt && (
                            <Text style={{ color: '#22c55e', fontSize: '10px', display: 'block', marginTop: '8px' }}>
                              Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                            </Text>
                          )}
                        </div>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </Card>
            </Col>

            <Col xs={24} lg={6}>
              <Card
                title="Current Rank"
                style={{ backgroundColor: '#171717', border: '1px solid #404040', marginBottom: '24px' }}
                headStyle={{ borderBottom: '1px solid #404040' }}
              >
                <div style={{ textAlign: 'center' }}>
                  <Avatar size={64} icon={<CrownOutlined />} style={{ backgroundColor: '#f59e0b', marginBottom: '16px' }} />
                  <Title level={4} style={{ color: '#fafafa', margin: '0 0 8px 0' }}>
                    {userStats.rank}
                  </Title>
                  <Text style={{ color: '#a3a3a3' }}>Level {userStats.level}</Text>
                </div>
              </Card>

              <Card
                title="Next Milestone"
                style={{ backgroundColor: '#171717', border: '1px solid #404040' }}
                headStyle={{ borderBottom: '1px solid #404040' }}
              >
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  <div>
                    <Text style={{ color: '#a3a3a3', display: 'block', marginBottom: '8px' }}>
                      Points to Level {userStats.level + 1}
                    </Text>
                    <Progress
                      percent={(userStats.currentLevelPoints / userStats.nextLevelPoints) * 100}
                      strokeColor="#8b5cf6"
                      format={() => `${userStats.nextLevelPoints - userStats.currentLevelPoints} pts`}
                    />
                  </div>

                  <Alert
                    message="Keep going!"
                    description={`You're ${Math.round((userStats.currentLevelPoints / userStats.nextLevelPoints) * 100)}% of the way to your next level.`}
                    type="info"
                    showIcon
                  />
                </Space>
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane tab="Leaderboard" key="leaderboard">
          <Card
            title="Global Leaderboard"
            style={{ backgroundColor: '#171717', border: '1px solid #404040' }}
            headStyle={{ borderBottom: '1px solid #404040' }}
          >
            <List
              dataSource={leaderboard}
              renderItem={(entry) => (
                <List.Item
                  style={{
                    backgroundColor: entry.username === 'You' ? '#262626' : 'transparent',
                    borderRadius: '8px',
                    marginBottom: '8px',
                    border: entry.username === 'You' ? '1px solid #7c3aed' : 'none',
                  }}
                >
                  <List.Item.Meta
                    avatar={
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          backgroundColor: entry.rank <= 3 ? '#f59e0b' : '#404040',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fafafa',
                          fontWeight: 600,
                          fontSize: '14px',
                        }}>
                          {entry.rank}
                        </div>
                        <Avatar size={40} style={{ backgroundColor: '#7c3aed' }}>
                          {entry.avatar}
                        </Avatar>
                        <div style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: getStatusColor(entry.status),
                        }} />
                      </div>
                    }
                    title={
                      <Text style={{ 
                        color: entry.username === 'You' ? '#7c3aed' : '#fafafa',
                        fontWeight: entry.username === 'You' ? 600 : 400,
                      }}>
                        {entry.username}
                      </Text>
                    }
                    description={
                      <Text style={{ color: '#737373' }}>
                        {entry.achievements} achievements
                      </Text>
                    }
                  />
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: '#f59e0b', fontSize: '18px', fontWeight: 600 }}>
                      {entry.points.toLocaleString()}
                    </div>
                    <div style={{ color: '#737373', fontSize: '12px' }}>
                      points
                    </div>
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </TabPane>

        <TabPane tab="Rewards" key="rewards">
          <Row gutter={[24, 24]}>
            <Col xs={24} lg={12}>
              <Card
                title="Available Rewards"
                style={{ backgroundColor: '#171717', border: '1px solid #404040' }}
                headStyle={{ borderBottom: '1px solid #404040' }}
              >
                <List
                  dataSource={[
                    { name: 'Pro Optimizer Tools', cost: 500, type: 'item', available: true },
                    { name: 'Custom Avatar Frame', cost: 750, type: 'cosmetic', available: true },
                    { name: 'Advanced Analytics', cost: 1000, type: 'feature', available: false },
                    { name: 'Exclusive Biome Access', cost: 1500, type: 'access', available: false },
                  ]}
                  renderItem={(reward) => (
                    <List.Item
                      actions={[
                        <Button
                          type={reward.available ? 'primary' : 'default'}
                          disabled={!reward.available}
                          size="small"
                        >
                          {reward.available ? 'Redeem' : `${reward.cost} pts`}
                        </Button>,
                      ]}
                    >
                      <List.Item.Meta
                        avatar={<GiftOutlined style={{ color: '#f59e0b', fontSize: '20px' }} />}
                        title={<Text style={{ color: '#fafafa' }}>{reward.name}</Text>}
                        description={<Text style={{ color: '#737373' }}>{reward.type}</Text>}
                      />
                    </List.Item>
                  )}
                />
              </Card>
            </Col>

            <Col xs={24} lg={12}>
              <Card
                title="Redemption History"
                style={{ backgroundColor: '#171717', border: '1px solid #404040' }}
                headStyle={{ borderBottom: '1px solid #404040' }}
              >
                <List
                  dataSource={[
                    { name: 'Speed Boost', date: '2025-10-25', cost: 250 },
                    { name: 'Extra Storage', date: '2025-10-20', cost: 300 },
                    { name: 'Premium Theme', date: '2025-10-15', cost: 400 },
                  ]}
                  renderItem={(redemption) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<CheckCircleOutlined style={{ color: '#22c55e', fontSize: '16px' }} />}
                        title={<Text style={{ color: '#fafafa' }}>{redemption.name}</Text>}
                        description={<Text style={{ color: '#737373' }}>{redemption.date}</Text>}
                      />
                      <Text style={{ color: '#f59e0b', fontWeight: 600 }}>-{redemption.cost} pts</Text>
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
          </Row>
        </TabPane>
      </Tabs>

      {/* Achievement Detail Modal */}
      <Modal
        title={selectedAchievement?.title}
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Close
          </Button>,
        ]}
        style={{ backgroundColor: '#171717' }}
      >
        {selectedAchievement && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <Avatar
                size={64}
                icon={selectedAchievement.icon}
                style={{
                  backgroundColor: selectedAchievement.unlocked ? getRarityColor(selectedAchievement.rarity) : '#404040',
                  marginBottom: '16px',
                }}
              />
              <Tag color={getRarityColor(selectedAchievement.rarity)}>
                {selectedAchievement.rarity.toUpperCase()}
              </Tag>
            </div>

            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <div>
                <Text style={{ color: '#a3a3a3', display: 'block', marginBottom: '8px' }}>
                  Description
                </Text>
                <Text style={{ color: '#fafafa' }}>{selectedAchievement.description}</Text>
              </div>

              <div>
                <Text style={{ color: '#a3a3a3', display: 'block', marginBottom: '8px' }}>
                  Category
                </Text>
                <Space>{getCategoryIcon(selectedAchievement.category)}</Space>
                <Text style={{ color: '#fafafa', textTransform: 'capitalize' }}>
                  {selectedAchievement.category}
                </Text>
              </div>

              <div>
                <Text style={{ color: '#a3a3a3', display: 'block', marginBottom: '8px' }}>
                  Progress
                </Text>
                {selectedAchievement.unlocked ? (
                  <Alert
                    message="Completed!"
                    description={`Unlocked on ${new Date(selectedAchievement.unlockedAt!).toLocaleDateString()}`}
                    type="success"
                    showIcon
                  />
                ) : (
                  <Progress
                    percent={(selectedAchievement.progress / selectedAchievement.maxProgress) * 100}
                    strokeColor="#7c3aed"
                    format={() => `${selectedAchievement.progress}/${selectedAchievement.maxProgress}`}
                  />
                )}
              </div>

              <div>
                <Text style={{ color: '#a3a3a3', display: 'block', marginBottom: '8px' }}>
                  Reward
                </Text>
                <Text style={{ color: '#f59e0b', fontWeight: 600 }}>
                  {selectedAchievement.reward.type === 'points' && `${selectedAchievement.reward.value} points`}
                  {selectedAchievement.reward.type === 'badge' && `Badge: ${selectedAchievement.reward.value}`}
                  {selectedAchievement.reward.type === 'title' && `Title: ${selectedAchievement.reward.value}`}
                  {selectedAchievement.reward.type === 'item' && `Item: ${selectedAchievement.reward.value}`}
                </Text>
              </div>
            </Space>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AchievementsPage;
