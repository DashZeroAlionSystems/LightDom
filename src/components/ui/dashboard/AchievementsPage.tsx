import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Typography,
  Progress,
  Tag,
  Space,
  Badge,
  Spin,
  Tabs,
  Statistic
} from 'antd';
import {
  TrophyOutlined,
  StarOutlined,
  FireOutlined,
  RocketOutlined,
  ThunderboltOutlined,
  CrownOutlined,
  CheckCircleOutlined,
  LockOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: 'optimization' | 'usage' | 'social' | 'special';
  unlocked: boolean;
  progress: number;
  maxProgress: number;
  points: number;
  unlockedDate?: string;
}

interface UserStats {
  totalPoints: number;
  level: number;
  nextLevelPoints: number;
  rank: string;
  totalAchievements: number;
  unlockedAchievements: number;
}

const AchievementsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data
      setUserStats({
        totalPoints: 1250,
        level: 8,
        nextLevelPoints: 1500,
        rank: 'Gold',
        totalAchievements: 24,
        unlockedAchievements: 12
      });

      setAchievements([
        {
          id: '1',
          name: 'First Steps',
          description: 'Complete your first optimization',
          icon: <RocketOutlined />,
          category: 'optimization',
          unlocked: true,
          progress: 1,
          maxProgress: 1,
          points: 10,
          unlockedDate: '2025-10-15'
        },
        {
          id: '2',
          name: 'Optimization Master',
          description: 'Complete 100 optimizations',
          icon: <TrophyOutlined />,
          category: 'optimization',
          unlocked: false,
          progress: 47,
          maxProgress: 100,
          points: 100
        },
        {
          id: '3',
          name: 'Space Saver',
          description: 'Save 10GB of space',
          icon: <StarOutlined />,
          category: 'optimization',
          unlocked: false,
          progress: 6.5,
          maxProgress: 10,
          points: 75
        },
        {
          id: '4',
          name: 'Daily Streaker',
          description: 'Use LightDom for 7 consecutive days',
          icon: <FireOutlined />,
          category: 'usage',
          unlocked: true,
          progress: 7,
          maxProgress: 7,
          points: 50,
          unlockedDate: '2025-10-20'
        },
        {
          id: '5',
          name: 'Speed Demon',
          description: 'Improve load time by 50% or more',
          icon: <ThunderboltOutlined />,
          category: 'optimization',
          unlocked: true,
          progress: 1,
          maxProgress: 1,
          points: 25,
          unlockedDate: '2025-10-18'
        },
        {
          id: '6',
          name: 'Early Adopter',
          description: 'Join LightDom in the first year',
          icon: <CrownOutlined />,
          category: 'special',
          unlocked: true,
          progress: 1,
          maxProgress: 1,
          points: 200,
          unlockedDate: '2025-10-15'
        }
      ]);
    } catch (error) {
      console.error('Failed to fetch achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'optimization': return 'blue';
      case 'usage': return 'green';
      case 'social': return 'purple';
      case 'special': return 'gold';
      default: return 'default';
    }
  };

  const getRankColor = (rank: string) => {
    switch (rank.toLowerCase()) {
      case 'bronze': return '#cd7f32';
      case 'silver': return '#c0c0c0';
      case 'gold': return '#ffd700';
      case 'platinum': return '#e5e4e2';
      case 'diamond': return '#b9f2ff';
      default: return '#1890ff';
    }
  };

  const filterAchievements = (category: string) => {
    if (category === 'all') return achievements;
    if (category === 'unlocked') return achievements.filter(a => a.unlocked);
    if (category === 'locked') return achievements.filter(a => !a.unlocked);
    return achievements.filter(a => a.category === category);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 0' }}>
        <Spin size="large" />
        <div style={{ marginTop: '1rem' }}>
          <Text type="secondary">Loading achievements...</Text>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>Achievements</Title>

      {userStats && (
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col xs={24} md={6}>
            <Card>
              <Statistic
                title="Total Points"
                value={userStats.totalPoints}
                prefix={<StarOutlined />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col xs={24} md={6}>
            <Card>
              <Statistic
                title="Level"
                value={userStats.level}
                prefix={<RocketOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
              <Progress
                percent={Math.round((userStats.totalPoints / userStats.nextLevelPoints) * 100)}
                showInfo={false}
                strokeColor="#1890ff"
              />
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {userStats.nextLevelPoints - userStats.totalPoints} points to next level
              </Text>
            </Card>
          </Col>
          <Col xs={24} md={6}>
            <Card>
              <Statistic
                title="Rank"
                value={userStats.rank}
                prefix={<CrownOutlined />}
                valueStyle={{ color: getRankColor(userStats.rank) }}
              />
            </Card>
          </Col>
          <Col xs={24} md={6}>
            <Card>
              <Statistic
                title="Achievements"
                value={userStats.unlockedAchievements}
                suffix={`/ ${userStats.totalAchievements}`}
                prefix={<TrophyOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
        </Row>
      )}

      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="All" key="all" />
          <TabPane tab="Unlocked" key="unlocked" />
          <TabPane tab="Locked" key="locked" />
          <TabPane tab="Optimization" key="optimization" />
          <TabPane tab="Usage" key="usage" />
          <TabPane tab="Special" key="special" />
        </Tabs>

        <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
          {filterAchievements(activeTab).map(achievement => (
            <Col xs={24} sm={12} lg={8} key={achievement.id}>
              <Badge.Ribbon
                text={achievement.unlocked ? 'Unlocked' : 'Locked'}
                color={achievement.unlocked ? 'green' : 'gray'}
              >
                <Card
                  hoverable
                  style={{
                    opacity: achievement.unlocked ? 1 : 0.6,
                    border: achievement.unlocked ? '2px solid #52c41a' : '1px solid #d9d9d9'
                  }}
                >
                  <div style={{ textAlign: 'center' }}>
                    <div
                      style={{
                        fontSize: '48px',
                        marginBottom: '16px',
                        color: achievement.unlocked ? '#1890ff' : '#d9d9d9'
                      }}
                    >
                      {achievement.unlocked ? achievement.icon : <LockOutlined />}
                    </div>
                    
                    <Space direction="vertical" size="small" style={{ width: '100%' }}>
                      <Title level={5} style={{ marginBottom: 0 }}>
                        {achievement.name}
                      </Title>
                      
                      <Tag color={getCategoryColor(achievement.category)}>
                        {achievement.category.toUpperCase()}
                      </Tag>
                      
                      <Paragraph
                        type="secondary"
                        style={{ fontSize: '12px', marginBottom: '8px' }}
                      >
                        {achievement.description}
                      </Paragraph>
                      
                      {!achievement.unlocked && (
                        <>
                          <Progress
                            percent={Math.round((achievement.progress / achievement.maxProgress) * 100)}
                            size="small"
                            status="active"
                          />
                          <Text type="secondary" style={{ fontSize: '11px' }}>
                            {achievement.progress} / {achievement.maxProgress}
                          </Text>
                        </>
                      )}
                      
                      {achievement.unlocked && achievement.unlockedDate && (
                        <Text type="secondary" style={{ fontSize: '11px' }}>
                          <CheckCircleOutlined /> Unlocked on {new Date(achievement.unlockedDate).toLocaleDateString()}
                        </Text>
                      )}
                      
                      <div style={{ marginTop: '8px' }}>
                        <Tag color="gold">
                          <StarOutlined /> {achievement.points} points
                        </Tag>
                      </div>
                    </Space>
                  </div>
                </Card>
              </Badge.Ribbon>
            </Col>
          ))}
        </Row>
      </Card>
    </div>
  );
};

export default AchievementsPage;
