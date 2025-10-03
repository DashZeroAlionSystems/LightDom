import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Button,
  Progress,
  Typography,
  Space,
  Badge,
  Modal,
  List,
  Avatar,
  Tag,
  Statistic,
  Alert,
  Spin,
  Empty,
  Tooltip
} from 'antd';
import {
  ThunderboltOutlined,
  TrophyOutlined,
  GiftOutlined,
  StarOutlined,
  FireOutlined,
  CrownOutlined,
  GemOutlined,
  RocketOutlined,
  SettingOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  StopOutlined,
  EyeOutlined,
  ShoppingCartOutlined
} from '@ant-design/icons';
import MetaverseItemGraphics from './MetaverseItemGraphics';
import { useAuth } from '../hooks/useAuth';
import { useBlockchain } from '../hooks/useBlockchain';
import './MetaverseMiningRewards.css';

const { Title, Text, Paragraph } = Typography;

interface MiningReward {
  id: string;
  name: string;
  description: string;
  type: 'land' | 'building' | 'vehicle' | 'avatar' | 'tool' | 'decoration' | 'powerup';
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
  icon: string;
  stats: {
    power: number;
    speed: number;
    durability: number;
    special: number;
  };
  effects: string[];
  biome: string;
  dropRate: number;
  value: number;
  currency: 'LDOM' | 'ETH' | 'DSH';
  requirements: {
    level: number;
    miningPower: number;
    achievements: string[];
  };
}

interface MiningSession {
  id: string;
  type: 'metaverse_items' | 'tokens' | 'experience';
  status: 'active' | 'paused' | 'completed' | 'failed';
  startTime: string;
  duration: number;
  progress: number;
  rewards: MiningReward[];
  totalValue: number;
  miningPower: number;
  efficiency: number;
}

const MetaverseMiningRewards: React.FC = () => {
  const { user } = useAuth();
  const { tokenBalance, submitOptimization } = useBlockchain();
  const [miningSession, setMiningSession] = useState<MiningSession | null>(null);
  const [availableRewards, setAvailableRewards] = useState<MiningReward[]>([]);
  const [loading, setLoading] = useState(false);
  const [showRewardsModal, setShowRewardsModal] = useState(false);
  const [selectedReward, setSelectedReward] = useState<MiningReward | null>(null);

  useEffect(() => {
    loadAvailableRewards();
    loadMiningSession();
  }, []);

  const loadAvailableRewards = async () => {
    try {
      const response = await fetch('/api/metaverse/mining-rewards');
      const data = await response.json();
      if (data.success) {
        setAvailableRewards(data.rewards);
      }
    } catch (error) {
      console.error('Failed to load mining rewards:', error);
    }
  };

  const loadMiningSession = async () => {
    try {
      const response = await fetch('/api/metaverse/mining-session');
      const data = await response.json();
      if (data.success && data.session) {
        setMiningSession(data.session);
      }
    } catch (error) {
      console.error('Failed to load mining session:', error);
    }
  };

  const startMining = async (type: 'metaverse_items' | 'tokens' | 'experience') => {
    try {
      setLoading(true);
      const response = await fetch('/api/metaverse/start-mining', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          miningPower: user?.stats?.miningPower || 100,
          duration: 300000 // 5 minutes
        }),
      });

      const data = await response.json();
      if (data.success) {
        setMiningSession(data.session);
        message.success('Mining session started!');
      } else {
        message.error(data.error || 'Failed to start mining');
      }
    } catch (error) {
      message.error('Failed to start mining');
    } finally {
      setLoading(false);
    }
  };

  const pauseMining = async () => {
    try {
      const response = await fetch('/api/metaverse/pause-mining', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: miningSession?.id
        }),
      });

      const data = await response.json();
      if (data.success) {
        setMiningSession(data.session);
        message.success('Mining paused');
      }
    } catch (error) {
      message.error('Failed to pause mining');
    }
  };

  const resumeMining = async () => {
    try {
      const response = await fetch('/api/metaverse/resume-mining', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: miningSession?.id
        }),
      });

      const data = await response.json();
      if (data.success) {
        setMiningSession(data.session);
        message.success('Mining resumed');
      }
    } catch (error) {
      message.error('Failed to resume mining');
    }
  };

  const stopMining = async () => {
    try {
      const response = await fetch('/api/metaverse/stop-mining', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: miningSession?.id
        }),
      });

      const data = await response.json();
      if (data.success) {
        setMiningSession(null);
        setShowRewardsModal(true);
        message.success('Mining completed! Check your rewards.');
      }
    } catch (error) {
      message.error('Failed to stop mining');
    }
  };

  const claimReward = async (reward: MiningReward) => {
    try {
      const response = await fetch('/api/metaverse/claim-reward', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rewardId: reward.id,
          sessionId: miningSession?.id
        }),
      });

      const data = await response.json();
      if (data.success) {
        message.success(`Claimed ${reward.name}!`);
        loadAvailableRewards();
      } else {
        message.error(data.error || 'Failed to claim reward');
      }
    } catch (error) {
      message.error('Failed to claim reward');
    }
  };

  const getRarityColor = (rarity: string) => {
    const colors = {
      common: '#95a5a6',
      rare: '#3498db',
      epic: '#9b59b6',
      legendary: '#f39c12',
      mythic: '#e74c3c'
    };
    return colors[rarity as keyof typeof colors] || '#95a5a6';
  };

  const getRarityIcon = (rarity: string) => {
    const icons = {
      common: <StarOutlined />,
      rare: <GemOutlined />,
      epic: <CrownOutlined />,
      legendary: <TrophyOutlined />,
      mythic: <FireOutlined />
    };
    return icons[rarity as keyof typeof icons] || <StarOutlined />;
  };

  const mockRewards: MiningReward[] = [
    {
      id: 'reward_1',
      name: 'Crystal Fragment',
      description: 'A small crystal fragment with magical properties',
      type: 'powerup',
      rarity: 'common',
      icon: '💎',
      stats: { power: 15, speed: 10, durability: 20, special: 25 },
      effects: ['+5% mining speed'],
      biome: 'crystal_cave',
      dropRate: 0.3,
      value: 50,
      currency: 'LDOM',
      requirements: { level: 1, miningPower: 50, achievements: [] }
    },
    {
      id: 'reward_2',
      name: 'Forest Spirit',
      description: 'A mystical spirit from the ancient forests',
      type: 'avatar',
      rarity: 'rare',
      icon: '🌿',
      stats: { power: 45, speed: 30, durability: 40, special: 60 },
      effects: ['+15% nature affinity', '+10% forest mining bonus'],
      biome: 'forest',
      dropRate: 0.1,
      value: 300,
      currency: 'LDOM',
      requirements: { level: 5, miningPower: 150, achievements: ['forest_explorer'] }
    },
    {
      id: 'reward_3',
      name: 'Quantum Core',
      description: 'A powerful energy core from the quantum realm',
      type: 'powerup',
      rarity: 'epic',
      icon: '⚛️',
      stats: { power: 70, speed: 50, durability: 80, special: 90 },
      effects: ['+25% optimization power', '+20% algorithm discovery'],
      biome: 'quantum',
      dropRate: 0.05,
      value: 800,
      currency: 'LDOM',
      requirements: { level: 10, miningPower: 300, achievements: ['quantum_researcher'] }
    },
    {
      id: 'reward_4',
      name: 'Dragon Scale',
      description: 'A legendary scale from an ancient dragon',
      type: 'decoration',
      rarity: 'legendary',
      icon: '🐉',
      stats: { power: 90, speed: 60, durability: 95, special: 100 },
      effects: ['+50% fire resistance', '+30% dragon affinity'],
      biome: 'dragon_lair',
      dropRate: 0.01,
      value: 2000,
      currency: 'LDOM',
      requirements: { level: 15, miningPower: 500, achievements: ['dragon_slayer'] }
    },
    {
      id: 'reward_5',
      name: 'Cosmic Essence',
      description: 'Pure essence from the cosmic void',
      type: 'powerup',
      rarity: 'mythic',
      icon: '🌌',
      stats: { power: 100, speed: 80, durability: 100, special: 100 },
      effects: ['+100% cosmic power', '+50% void resistance', 'Reality manipulation'],
      biome: 'cosmic_void',
      dropRate: 0.001,
      value: 10000,
      currency: 'LDOM',
      requirements: { level: 20, miningPower: 1000, achievements: ['cosmic_explorer', 'reality_bender'] }
    }
  ];

  const displayRewards = availableRewards.length > 0 ? availableRewards : mockRewards;

  return (
    <div className="metaverse-mining-rewards">
      <div className="rewards-header">
        <Title level={2} className="rewards-title">
          ⚡ Metaverse Mining Rewards
        </Title>
        <Paragraph className="rewards-subtitle">
          Mine for rare metaverse items and earn valuable rewards. The longer you mine, the better rewards you can discover!
        </Paragraph>
      </div>

      <Row gutter={[24, 24]}>
        {/* Mining Session Status */}
        <Col xs={24} lg={12}>
          <Card title="Mining Session" className="mining-session-card">
            {miningSession ? (
              <div className="session-status">
                <div className="session-info">
                  <Title level={4}>
                    {miningSession.type === 'metaverse_items' && '🎁 Item Mining'}
                    {miningSession.type === 'tokens' && '💰 Token Mining'}
                    {miningSession.type === 'experience' && '⭐ Experience Mining'}
                  </Title>
                  <div className="session-stats">
                    <Row gutter={[16, 16]}>
                      <Col span={12}>
                        <Statistic
                          title="Mining Power"
                          value={miningSession.miningPower}
                          prefix={<ThunderboltOutlined />}
                        />
                      </Col>
                      <Col span={12}>
                        <Statistic
                          title="Efficiency"
                          value={miningSession.efficiency}
                          suffix="%"
                          prefix={<SettingOutlined />}
                        />
                      </Col>
                    </Row>
                  </div>
                  <div className="session-progress">
                    <Text strong>Progress</Text>
                    <Progress
                      percent={miningSession.progress}
                      status={miningSession.status === 'active' ? 'active' : 'normal'}
                      strokeColor={{
                        '0%': '#108ee9',
                        '100%': '#87d068',
                      }}
                    />
                  </div>
                  <div className="session-actions">
                    <Space>
                      {miningSession.status === 'active' && (
                        <Button
                          icon={<PauseCircleOutlined />}
                          onClick={pauseMining}
                        >
                          Pause
                        </Button>
                      )}
                      {miningSession.status === 'paused' && (
                        <Button
                          type="primary"
                          icon={<PlayCircleOutlined />}
                          onClick={resumeMining}
                        >
                          Resume
                        </Button>
                      )}
                      <Button
                        danger
                        icon={<StopOutlined />}
                        onClick={stopMining}
                      >
                        Stop & Claim
                      </Button>
                    </Space>
                  </div>
                </div>
              </div>
            ) : (
              <div className="no-session">
                <Empty
                  description="No active mining session"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
                <div className="start-mining-actions">
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Button
                      type="primary"
                      size="large"
                      icon={<GiftOutlined />}
                      onClick={() => startMining('metaverse_items')}
                      loading={loading}
                      block
                    >
                      Start Item Mining
                    </Button>
                    <Button
                      size="large"
                      icon={<ThunderboltOutlined />}
                      onClick={() => startMining('tokens')}
                      loading={loading}
                      block
                    >
                      Start Token Mining
                    </Button>
                    <Button
                      size="large"
                      icon={<StarOutlined />}
                      onClick={() => startMining('experience')}
                      loading={loading}
                      block
                    >
                      Start Experience Mining
                    </Button>
                  </Space>
                </div>
              </div>
            )}
          </Card>
        </Col>

        {/* Available Rewards */}
        <Col xs={24} lg={12}>
          <Card title="Available Rewards" className="rewards-card">
            <div className="rewards-list">
              {displayRewards.map((reward) => (
                <div key={reward.id} className="reward-item">
                  <div className="reward-graphics">
                    <MetaverseItemGraphics
                      type={reward.type}
                      rarity={reward.rarity}
                      size="medium"
                      animated={reward.rarity === 'legendary' || reward.rarity === 'mythic'}
                    />
                  </div>
                  <div className="reward-info">
                    <div className="reward-header">
                      <Title level={5} className="reward-name">
                        {reward.name}
                      </Title>
                      <Tag
                        color={getRarityColor(reward.rarity)}
                        icon={getRarityIcon(reward.rarity)}
                        className="rarity-tag"
                      >
                        {reward.rarity.toUpperCase()}
                      </Tag>
                    </div>
                    <Paragraph className="reward-description">
                      {reward.description}
                    </Paragraph>
                    <div className="reward-stats">
                      <div className="stat-item">
                        <ThunderboltOutlined /> {reward.stats.power}
                      </div>
                      <div className="stat-item">
                        <RocketOutlined /> {reward.stats.speed}
                      </div>
                      <div className="stat-item">
                        <GemOutlined /> {reward.stats.special}
                      </div>
                    </div>
                    <div className="reward-value">
                      <Text strong className="value-text">
                        {reward.value} {reward.currency}
                      </Text>
                      <Text type="secondary" className="drop-rate">
                        Drop Rate: {(reward.dropRate * 100).toFixed(1)}%
                      </Text>
                    </div>
                  </div>
                  <div className="reward-actions">
                    <Space direction="vertical">
                      <Button
                        type="primary"
                        size="small"
                        icon={<EyeOutlined />}
                        onClick={() => {
                          setSelectedReward(reward);
                          setShowRewardsModal(true);
                        }}
                      >
                        View Details
                      </Button>
                      <Button
                        size="small"
                        icon={<ShoppingCartOutlined />}
                        onClick={() => claimReward(reward)}
                      >
                        Claim
                      </Button>
                    </Space>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>

      {/* Rewards Modal */}
      <Modal
        title="Reward Details"
        open={showRewardsModal}
        onCancel={() => setShowRewardsModal(false)}
        footer={null}
        width={600}
      >
        {selectedReward && (
          <div className="reward-details">
            <Row gutter={[24, 24]}>
              <Col xs={24} md={12}>
                <div className="reward-graphics-large">
                  <MetaverseItemGraphics
                    type={selectedReward.type}
                    rarity={selectedReward.rarity}
                    size="large"
                    animated={true}
                  />
                </div>
              </Col>
              <Col xs={24} md={12}>
                <div className="reward-info-large">
                  <Title level={3}>{selectedReward.name}</Title>
                  <Tag
                    color={getRarityColor(selectedReward.rarity)}
                    icon={getRarityIcon(selectedReward.rarity)}
                    className="rarity-tag-large"
                  >
                    {selectedReward.rarity.toUpperCase()}
                  </Tag>
                  <Paragraph>{selectedReward.description}</Paragraph>
                  
                  <div className="reward-stats-large">
                    <Title level={5}>Stats</Title>
                    <div className="stats-grid">
                      <div className="stat-item">
                        <ThunderboltOutlined /> Power: {selectedReward.stats.power}
                      </div>
                      <div className="stat-item">
                        <RocketOutlined /> Speed: {selectedReward.stats.speed}
                      </div>
                      <div className="stat-item">
                        <GemOutlined /> Durability: {selectedReward.stats.durability}
                      </div>
                      <div className="stat-item">
                        <StarOutlined /> Special: {selectedReward.stats.special}
                      </div>
                    </div>
                  </div>
                  
                  <div className="reward-effects">
                    <Title level={5}>Effects</Title>
                    <ul className="effects-list">
                      {selectedReward.effects.map((effect, index) => (
                        <li key={index}>{effect}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="reward-value-large">
                    <Text strong className="value-text-large">
                      {selectedReward.value} {selectedReward.currency}
                    </Text>
                  </div>
                </div>
              </Col>
            </Row>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MetaverseMiningRewards;