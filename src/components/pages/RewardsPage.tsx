/**
 * Rewards Page - Achievements and Earned Rewards
 */

import React, { useState } from 'react';
import {
  Card,
  Row,
  Col,
  Typography,
  Progress,
  Button,
  Statistic,
  List,
  Avatar,
  Badge,
  Space,
  Tabs,
  Tag,
  Divider,
  Timeline,
  Modal,
  message,
} from 'antd';
import {
  TrophyOutlined,
  StarOutlined,
  StarFilled,
  CrownOutlined,
  RocketOutlined,
  FireOutlined,
  ThunderboltOutlined,
  CheckCircleOutlined,
  LockOutlined,
  GiftOutlined,
  SafetyOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  progress: number;
  total: number;
  reward: number;
  unlocked: boolean;
  category: 'mining' | 'staking' | 'referral' | 'special';
}

interface Reward {
  id: string;
  name: string;
  description: string;
  cost: number;
  claimed: boolean;
  category: 'bonus' | 'multiplier' | 'cosmetic' | 'feature';
}

const RewardsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('achievements');
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [rewardModalVisible, setRewardModalVisible] = useState(false);

  const [achievements] = useState<Achievement[]>([
    {
      id: '1',
      title: 'First Steps',
      description: 'Start your first mining session',
      icon: <RocketOutlined />,
      progress: 1,
      total: 1,
      reward: 0.01,
      unlocked: true,
      category: 'mining',
    },
    {
      id: '2',
      title: 'Mining Novice',
      description: 'Mine for 1 hour total',
      icon: <ThunderboltOutlined />,
      progress: 45,
      total: 60,
      reward: 0.05,
      unlocked: false,
      category: 'mining',
    },
    {
      id: '3',
      title: 'Hash Master',
      description: 'Reach 100 MH/s hash rate',
      icon: <FireOutlined />,
      progress: 75,
      total: 100,
      reward: 0.1,
      unlocked: false,
      category: 'mining',
    },
    {
      id: '4',
      title: 'Staking Pro',
      description: 'Stake 1 LIGHT for 30 days',
      icon: <CrownOutlined />,
      progress: 15,
      total: 30,
      reward: 0.15,
      unlocked: false,
      category: 'staking',
    },
    {
      id: '5',
      title: 'Social Butterfly',
      description: 'Refer 5 friends to the platform',
      icon: <StarOutlined />,
      progress: 2,
      total: 5,
      reward: 0.25,
      unlocked: false,
      category: 'referral',
    },
    {
      id: '6',
      title: 'Early Adopter',
      description: 'Join the platform in the first month',
      icon: <StarFilled />,
      progress: 1,
      total: 1,
      reward: 0.5,
      unlocked: true,
      category: 'special',
    },
  ]);

  const [rewards] = useState<Reward[]>([
    {
      id: '1',
      name: 'Mining Boost 2x',
      description: 'Double your mining rewards for 24 hours',
      cost: 0.1,
      claimed: false,
      category: 'bonus',
    },
    {
      id: '2',
      name: 'Hash Rate Multiplier',
      description: 'Increase hash rate by 10% for 1 week',
      cost: 0.25,
      claimed: false,
      category: 'multiplier',
    },
    {
      id: '3',
      name: 'Golden Avatar',
      description: 'Unlock a special golden avatar frame',
      cost: 0.05,
      claimed: true,
      category: 'cosmetic',
    },
    {
      id: '4',
      name: 'Advanced Analytics',
      description: 'Access detailed mining analytics dashboard',
      cost: 0.5,
      claimed: false,
      category: 'feature',
    },
  ]);

  const [stats] = useState({
    totalPoints: 1250,
    unlockedAchievements: 2,
    totalAchievements: 6,
    rewardsClaimed: 1,
    totalRewards: 4,
    level: 5,
    nextLevelPoints: 1500,
  });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'mining': return '#f59e0b';
      case 'staking': return '#7c3aed';
      case 'referral': return '#3b82f6';
      case 'special': return '#ef4444';
      case 'bonus': return '#10b981';
      case 'multiplier': return '#f59e0b';
      case 'cosmetic': return '#ec4899';
      case 'feature': return '#6366f1';
      default: return '#666666';
    }
  };

  const handleClaimReward = (reward: Reward) => {
    setSelectedReward(reward);
    setRewardModalVisible(true);
  };

  const confirmClaimReward = () => {
    if (selectedReward) {
      message.success(`Successfully claimed ${selectedReward.name}!`);
      setRewardModalVisible(false);
      setSelectedReward(null);
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2} style={{ color: '#ffffff', margin: 0 }}>
          Rewards
        </Title>
        <Text style={{ color: '#a0a0a0' }}>
          View achievements and earned rewards
        </Text>
      </div>

      {/* Stats Overview */}
      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12} md={6}>
          <Card style={{
            backgroundColor: '#1a1a1a',
            border: '1px solid #333333',
            borderRadius: '12px',
            height: '160px',
          }}>
            <Statistic
              title="Total Points"
              value={stats.totalPoints}
              prefix={<TrophyOutlined style={{ color: '#f59e0b' }} />}
              valueStyle={{ color: '#f59e0b' }}
            />
            <Progress 
              percent={(stats.totalPoints / stats.nextLevelPoints) * 100} 
              strokeColor="#f59e0b"
              showInfo={false}
              style={{ marginTop: '8px' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card style={{
            backgroundColor: '#1a1a1a',
            border: '1px solid #333333',
            borderRadius: '12px',
            height: '160px',
          }}>
            <Statistic
              title="Achievements"
              value={stats.unlockedAchievements}
              suffix={`/ ${stats.totalAchievements}`}
              prefix={<SafetyOutlined style={{ color: '#7c3aed' }} />}
              valueStyle={{ color: '#7c3aed' }}
            />
            <Progress 
              percent={(stats.unlockedAchievements / stats.totalAchievements) * 100} 
              strokeColor="#7c3aed"
              showInfo={false}
              style={{ marginTop: '8px' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card style={{
            backgroundColor: '#1a1a1a',
            border: '1px solid #333333',
            borderRadius: '12px',
            height: '160px',
          }}>
            <Statistic
              title="Rewards Claimed"
              value={stats.rewardsClaimed}
              suffix={`/ ${stats.totalRewards}`}
              prefix={<GiftOutlined style={{ color: '#10b981' }} />}
              valueStyle={{ color: '#10b981' }}
            />
            <Progress 
              percent={(stats.rewardsClaimed / stats.totalRewards) * 100} 
              strokeColor="#10b981"
              showInfo={false}
              style={{ marginTop: '8px' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card style={{
            backgroundColor: '#1a1a1a',
            border: '1px solid #333333',
            borderRadius: '12px',
            height: '160px',
          }}>
            <Statistic
              title="Current Level"
              value={stats.level}
              prefix={<StarOutlined style={{ color: '#ef4444' }} />}
              valueStyle={{ color: '#ef4444' }}
            />
            <div style={{ marginTop: '8px' }}>
              <Text style={{ color: '#a0a0a0', fontSize: '12px' }}>
                {stats.nextLevelPoints - stats.totalPoints} points to next level
              </Text>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Tabs */}
      <Card style={{
        backgroundColor: '#1a1a1a',
        border: '1px solid #333333',
        borderRadius: '12px',
        marginTop: '24px',
      }}>
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          items={[
            {
              key: 'achievements',
              label: (
                <span>
                  <TrophyOutlined />
                  Achievements
                </span>
              ),
              children: (
                <List
                  grid={{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 3, xl: 3, xxl: 3 }}
                  dataSource={achievements}
                  renderItem={(achievement) => (
                    <List.Item>
                      <Card
                        style={{
                          backgroundColor: achievement.unlocked ? '#2a2a2a' : '#1a1a1a',
                          border: `1px solid ${achievement.unlocked ? '#7c3aed' : '#333333'}`,
                          borderRadius: '12px',
                          height: '240px',
                          padding: '16px',
                        }}
                      >
                        <div style={{ textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                          <div>
                            <Avatar
                              size={48}
                              style={{
                                backgroundColor: getCategoryColor(achievement.category),
                                marginBottom: '12px',
                              }}
                              icon={achievement.icon}
                            />
                            <Title level={5} style={{ color: '#ffffff', margin: '0 0 8px 0', fontSize: '13px' }}>
                              {achievement.title}
                            </Title>
                            <Text style={{ color: '#a0a0a0', fontSize: '10px', display: 'block', marginBottom: '12px' }}>
                              {achievement.description}
                            </Text>
                          </div>
                          <div>
                            <div style={{ marginBottom: '8px' }}>
                              <Progress
                                percent={(achievement.progress / achievement.total) * 100}
                                strokeColor={getCategoryColor(achievement.category)}
                                size="small"
                                strokeWidth={4}
                                showInfo={false}
                              />
                            </div>
                            <div style={{ marginBottom: '8px' }}>
                              <Text style={{ color: '#a0a0a0', fontSize: '10px' }}>
                                {achievement.progress}/{achievement.total}
                              </Text>
                              <Tag color={getCategoryColor(achievement.category)} style={{ fontSize: '9px', marginLeft: '8px' }}>
                                {achievement.category}
                              </Tag>
                            </div>
                            {achievement.unlocked ? (
                              <div style={{ marginTop: '4px' }}>
                                <Badge status="success" text={`+${achievement.reward} LIGHT`} />
                              </div>
                            ) : (
                              <div style={{ marginTop: '4px' }}>
                                <Badge status="default" text={<LockOutlined />} />
                              </div>
                            )}
                          </div>
                        </div>
                      </Card>
                    </List.Item>
                  )}
                />
              ),
            },
            {
              key: 'rewards',
              label: (
                <span>
                  <GiftOutlined />
                  Rewards Store
                </span>
              ),
              children: (
                <List
                  grid={{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 3, xl: 3, xxl: 3 }}
                  dataSource={rewards}
                  renderItem={(reward) => (
                    <List.Item>
                      <Card
                        style={{
                          backgroundColor: '#2a2a2a',
                          border: '1px solid #333333',
                          borderRadius: '12px',
                          height: '260px',
                          padding: '16px',
                        }}
                      >
                        <div style={{ textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                          <div>
                            <Avatar
                              size={48}
                              style={{
                                backgroundColor: getCategoryColor(reward.category),
                                marginBottom: '12px',
                              }}
                              icon={<GiftOutlined />}
                            />
                            <Title level={5} style={{ color: '#ffffff', margin: '0 0 8px 0', fontSize: '13px' }}>
                              {reward.name}
                            </Title>
                            <Text style={{ color: '#a0a0a0', fontSize: '10px', display: 'block', marginBottom: '12px' }}>
                              {reward.description}
                            </Text>
                            <Tag color={getCategoryColor(reward.category)} style={{ fontSize: '9px', marginBottom: '12px' }}>
                              {reward.category}
                            </Tag>
                          </div>
                          <div>
                            {reward.claimed ? (
                              <Badge status="success" text="Claimed" />
                            ) : (
                              <Button
                                type="primary"
                                size="small"
                                onClick={() => handleClaimReward(reward)}
                                style={{
                                  background: 'linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)',
                                  border: 'none',
                                  fontSize: '10px',
                                  padding: '4px 12px',
                                }}
                              >
                                Claim ({reward.cost} LIGHT)
                              </Button>
                            )}
                          </div>
                        </div>
                      </Card>
                    </List.Item>
                  )}
                />
              ),
            },
          ]}
        />
      </Card>

      {/* Reward Claim Modal */}
      <Modal
        title="Claim Reward"
        open={rewardModalVisible}
        onCancel={() => setRewardModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setRewardModalVisible(false)}>
            Cancel
          </Button>,
          <Button key="claim" type="primary" onClick={confirmClaimReward}>
            Confirm Claim
          </Button>,
        ]}
        style={{
          background: '#1a1a1a',
        }}
      >
        {selectedReward && (
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <div style={{ textAlign: 'center' }}>
              <Avatar
                size={64}
                style={{
                  backgroundColor: getCategoryColor(selectedReward.category),
                  marginBottom: '16px',
                }}
                icon={<GiftOutlined />}
              />
              <Title level={4} style={{ color: '#ffffff' }}>
                {selectedReward.name}
              </Title>
              <Text style={{ color: '#a0a0a0' }}>
                {selectedReward.description}
              </Text>
            </div>
            <Divider />
            <div style={{ textAlign: 'center' }}>
              <Text strong style={{ color: '#ffffff' }}>
                Cost: {selectedReward.cost} LIGHT
              </Text>
            </div>
          </Space>
        )}
      </Modal>
    </div>
  );
};

export default RewardsPage;
