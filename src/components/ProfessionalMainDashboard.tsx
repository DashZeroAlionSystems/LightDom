/**
 * Professional Main Dashboard Component
 * Material Design 3.0 inspired dashboard with responsive grid and consistent sizing
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
  Tabs,
  Alert,
  Badge,
  Avatar,
  List,
  Tag,
  Divider,
  Table,
  Timeline,
  Empty,
} from 'antd';
import {
  ThunderboltOutlined,
  WalletOutlined,
  TrophyOutlined,
  RocketOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  SettingOutlined,
  BellOutlined,
  BarChartOutlined,
  SecurityScanOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined,
  FireOutlined,
  StarOutlined,
  GiftOutlined,
  CrownOutlined,
  TrendingUpOutlined,
  ApiOutlined,
  GlobalOutlined,
  DatabaseOutlined,
} from '@ant-design/icons';
import MaterialDesignSystem, {
  MaterialColors,
  MaterialSpacing,
  MaterialTypography,
  MaterialElevation,
  MaterialBorderRadius,
  MaterialComponentSizes,
  MaterialDarkTheme,
  MaterialTransitions,
  MaterialBreakpoints,
} from '../styles/MaterialDesignSystem';

const { Header, Content } = Layout;
const { Title, Text } = Typography;
const { TabPane } = Tabs;

interface MiningStats {
  hashRate: number;
  blocksMined: number;
  earnings: number;
  efficiency: number;
  uptime: number;
  temperature: number;
  powerUsage: number;
}

interface RecentActivity {
  id: string;
  type: 'mining' | 'optimization' | 'transaction' | 'achievement';
  title: string;
  description: string;
  timestamp: string;
  status: 'success' | 'pending' | 'error';
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  progress: number;
  total: number;
  icon: React.ReactNode;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlocked: boolean;
}

const ProfessionalMainDashboard: React.FC = () => {
  const [miningActive, setMiningActive] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [miningStats, setMiningStats] = useState<MiningStats>({
    hashRate: 2450.5,
    blocksMined: 127,
    earnings: 45.67,
    efficiency: 87.3,
    uptime: 3600,
    temperature: 65.2,
    powerUsage: 450.8,
  });

  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([
    {
      id: '1',
      type: 'mining',
      title: 'Block Mined Successfully',
      description: 'Mined block #12345 with 12.5 LDT reward',
      timestamp: '2 minutes ago',
      status: 'success',
    },
    {
      id: '2',
      type: 'optimization',
      title: 'Website Optimized',
      description: 'Optimized example.com - 28% size reduction',
      timestamp: '15 minutes ago',
      status: 'success',
    },
    {
      id: '3',
      type: 'transaction',
      title: 'Transfer Completed',
      description: 'Sent 50 LDT to wallet 0x1234...5678',
      timestamp: '1 hour ago',
      status: 'success',
    },
    {
      id: '4',
      type: 'achievement',
      title: 'New Achievement Unlocked',
      description: 'Efficiency Expert - 95% mining efficiency',
      timestamp: '2 hours ago',
      status: 'success',
    },
  ]);

  const [achievements, setAchievements] = useState<Achievement[]>([
    {
      id: '1',
      title: 'Mining Novice',
      description: 'Mine your first block',
      progress: 1,
      total: 1,
      icon: <ThunderboltOutlined />,
      rarity: 'common',
      unlocked: true,
    },
    {
      id: '2',
      title: 'Efficiency Expert',
      description: 'Achieve 95% mining efficiency',
      progress: 87,
      total: 95,
      icon: <RocketOutlined />,
      rarity: 'rare',
      unlocked: false,
    },
    {
      id: '3',
      title: 'Optimization Master',
      description: 'Optimize 100 websites',
      progress: 73,
      total: 100,
      icon: <StarOutlined />,
      rarity: 'epic',
      unlocked: false,
    },
    {
      id: '4',
      title: 'Blockchain Legend',
      description: 'Mine 1000 blocks',
      progress: 127,
      total: 1000,
      icon: <CrownOutlined />,
      rarity: 'legendary',
      unlocked: false,
    },
  ]);

  // Real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (miningActive) {
        setMiningStats(prev => ({
          hashRate: Math.random() * 1000 + 2000,
          blocksMined: prev.blocksMined + Math.floor(Math.random() * 3),
          earnings: prev.earnings + (Math.random() * 0.01),
          efficiency: Math.random() * 20 + 80,
          uptime: prev.uptime + 1,
          temperature: Math.random() * 20 + 60,
          powerUsage: Math.random() * 100 + 400,
        }));
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [miningActive]);

  const handleMiningToggle = () => {
    setMiningActive(!miningActive);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'mining':
        return <ThunderboltOutlined style={{ color: MaterialColors.primary[60] }} />;
      case 'optimization':
        return <RocketOutlined style={{ color: MaterialColors.success[50] }} />;
      case 'transaction':
        return <WalletOutlined style={{ color: MaterialColors.warning[50] }} />;
      case 'achievement':
        return <TrophyOutlined style={{ color: MaterialColors.secondary[60] }} />;
      default:
        return <ClockCircleOutlined style={{ color: MaterialDarkTheme.text.secondary }} />;
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return MaterialColors.neutral[50];
      case 'rare':
        return MaterialColors.info[50];
      case 'epic':
        return MaterialColors.secondary[60];
      case 'legendary':
        return MaterialColors.warning[50];
      default:
        return MaterialColors.neutral[50];
    }
  };

  // Stats Card Component for consistency
  const StatsCard: React.FC<{
    title: string;
    value: string | number;
    suffix?: string;
    icon: React.ReactNode;
    color?: string;
    trend?: number;
  }> = ({ title, value, suffix, icon, color = MaterialColors.primary[60], trend }) => (
    <Card
      style={{
        backgroundColor: MaterialDarkTheme.background.surface,
        border: `1px solid ${MaterialDarkTheme.border.default}`,
        borderRadius: MaterialBorderRadius.md,
        boxShadow: MaterialElevation.level1,
        height: MaterialComponentSizes.card.md.height,
        transition: `all ${MaterialTransitions.duration.medium} ${MaterialTransitions.easing.standard}`,
      }}
      bodyStyle={{ 
        padding: MaterialSpacing.md,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <div>
        <Space align="center" size={MaterialSpacing.sm}>
          <div style={{ 
            fontSize: '20px', 
            color: color,
            opacity: 0.8,
          }}>
            {icon}
          </div>
          <Text style={{ 
            fontSize: MaterialTypography.bodySmall.fontSize,
            color: MaterialDarkTheme.text.secondary,
            fontWeight: MaterialTypography.labelMedium.fontWeight,
          }}>
            {title}
          </Text>
        </Space>
      </div>
      
      <div style={{ marginTop: MaterialSpacing.sm }}>
        <Statistic
          value={value}
          suffix={suffix}
          precision={typeof value === 'number' ? 1 : 0}
          valueStyle={{ 
            color: color,
            fontSize: '24px',
            fontWeight: 600,
            lineHeight: '32px',
          }}
        />
        
        {trend !== undefined && (
          <div style={{ 
            marginTop: MaterialSpacing.xs,
            fontSize: MaterialTypography.bodySmall.fontSize,
            color: trend > 0 ? MaterialColors.success[50] : MaterialColors.error[50],
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}>
            {trend > 0 ? <TrendingUpOutlined /> : <TrendingUpOutlined style={{ transform: 'rotate(180deg)' }} />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
    </Card>
  );

  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: MaterialDarkTheme.background.default }}>
      {/* Professional Header */}
      <Header
        style={{
          backgroundColor: MaterialDarkTheme.background.surface,
          borderBottom: `1px solid ${MaterialDarkTheme.border.default}`,
          padding: `0 ${MaterialSpacing.lg}`,
          height: MaterialComponentSizes.header.lg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: MaterialElevation.level1,
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <div>
          <Title 
            level={2} 
            style={{ 
              margin: 0, 
              color: MaterialDarkTheme.text.primary,
              fontSize: MaterialTypography.headlineSmall.fontSize,
              fontWeight: MaterialTypography.headlineSmall.fontWeight,
              lineHeight: MaterialTypography.headlineSmall.lineHeight,
            }}
          >
            Mining Dashboard
          </Title>
          <Text 
            style={{ 
              fontSize: MaterialTypography.bodyMedium.fontSize,
              color: MaterialDarkTheme.text.secondary,
              fontWeight: MaterialTypography.bodyMedium.fontWeight,
            }}
          >
            Real-time monitoring and optimization control center
          </Text>
        </div>
        
        <Space size={MaterialSpacing.md}>
          <Button 
            type="primary"
            icon={<SecurityScanOutlined />}
            style={{
              backgroundColor: MaterialColors.primary[60],
              borderColor: MaterialColors.primary[60],
              borderRadius: MaterialBorderRadius.sm,
              height: MaterialComponentSizes.button.md.height,
              fontWeight: 500,
              boxShadow: MaterialElevation.level1,
            }}
          >
            Admin Panel
          </Button>
          
          <Button 
            type="text"
            icon={<SettingOutlined />}
            style={{
              color: MaterialDarkTheme.text.secondary,
              borderRadius: MaterialBorderRadius.sm,
              height: MaterialComponentSizes.button.md.height,
            }}
          >
            Settings
          </Button>
          
          <Badge count={5} size="small">
            <Button 
              type="text"
              icon={<BellOutlined />}
              style={{
                color: MaterialDarkTheme.text.secondary,
                borderRadius: MaterialBorderRadius.sm,
                height: MaterialComponentSizes.button.md.height,
                width: MaterialComponentSizes.button.md.height,
              }}
            />
          </Badge>
        </Space>
      </Header>

      {/* Main Content */}
      <Content style={{ 
        padding: MaterialSpacing.lg,
        backgroundColor: MaterialDarkTheme.background.default,
        overflow: 'auto',
      }}>
        {/* Mining Status Alert */}
        {miningActive && (
          <Alert
            message="Mining Operations Active"
            description="Your mining rig is operating at optimal efficiency. All systems are functioning normally."
            type="success"
            showIcon
            closable
            style={{
              marginBottom: MaterialSpacing.lg,
              backgroundColor: `${MaterialColors.success[10]}20`,
              borderColor: MaterialColors.success[50],
              borderRadius: MaterialBorderRadius.md,
            }}
          />
        )}

        {/* Professional Tabs */}
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          size="large"
          style={{
            marginBottom: MaterialSpacing.lg,
          }}
          tabBarStyle={{
            backgroundColor: MaterialDarkTheme.background.surface,
            borderRadius: MaterialBorderRadius.md,
            padding: MaterialSpacing.xs,
            border: `1px solid ${MaterialDarkTheme.border.default}`,
            boxShadow: MaterialElevation.level1,
          }}
        >
          {/* Overview Tab */}
          <TabPane 
            tab={
              <span style={{ 
                fontSize: MaterialTypography.bodyLarge.fontSize,
                fontWeight: 500,
                color: activeTab === 'overview' ? MaterialColors.primary[60] : MaterialDarkTheme.text.secondary,
              }}>
                <BarChartOutlined /> Overview
              </span>
            } 
            key="overview"
          >
            {/* Stats Grid */}
            <Row gutter={[MaterialSpacing.lg, MaterialSpacing.lg]}>
              <Col xs={24} sm={12} lg={6} xl={6}>
                <StatsCard
                  title="Hash Rate"
                  value={miningStats.hashRate}
                  suffix="MH/s"
                  icon={<ThunderboltOutlined />}
                  color={MaterialColors.primary[60]}
                  trend={12.5}
                />
              </Col>
              
              <Col xs={24} sm={12} lg={6} xl={6}>
                <StatsCard
                  title="Earnings"
                  value={miningStats.earnings}
                  suffix="LDT"
                  icon={<WalletOutlined />}
                  color={MaterialColors.success[50]}
                  trend={8.3}
                />
              </Col>
              
              <Col xs={24} sm={12} lg={6} xl={6}>
                <StatsCard
                  title="Efficiency"
                  value={miningStats.efficiency}
                  suffix="%"
                  icon={<RocketOutlined />}
                  color={MaterialColors.warning[50]}
                  trend={2.1}
                />
              </Col>
              
              <Col xs={24} sm={12} lg={6} xl={6}>
                <StatsCard
                  title="Blocks Mined"
                  value={miningStats.blocksMined}
                  icon={<TrophyOutlined />}
                  color={MaterialColors.secondary[60]}
                  trend={5.7}
                />
              </Col>
            </Row>

            {/* Secondary Stats */}
            <Row gutter={[MaterialSpacing.lg, MaterialSpacing.lg]} style={{ marginTop: MaterialSpacing.lg }}>
              <Col xs={24} sm={12} lg={8} xl={8}>
                <StatsCard
                  title="Temperature"
                  value={miningStats.temperature}
                  suffix="°C"
                  icon={<FireOutlined />}
                  color={miningStats.temperature > 80 ? MaterialColors.error[50] : MaterialColors.info[50]}
                />
              </Col>
              
              <Col xs={24} sm={12} lg={8} xl={8}>
                <StatsCard
                  title="Power Usage"
                  value={miningStats.powerUsage}
                  suffix="W"
                  icon={<DatabaseOutlined />}
                  color={MaterialColors.info[50]}
                />
              </Col>
              
              <Col xs={24} sm={12} lg={8} xl={8}>
                <StatsCard
                  title="Uptime"
                  value={Math.floor(miningStats.uptime / 3600)}
                  suffix="hours"
                  icon={<ClockCircleOutlined />}
                  color={MaterialColors.neutral[50]}
                />
              </Col>
            </Row>

            {/* Recent Activity */}
            <Row gutter={[MaterialSpacing.lg, MaterialSpacing.lg]} style={{ marginTop: MaterialSpacing.lg }}>
              <Col xs={24} lg={16}>
                <Card
                  title={
                    <div style={{ 
                      fontSize: MaterialTypography.titleLarge.fontSize,
                      fontWeight: MaterialTypography.titleLarge.fontWeight,
                      color: MaterialDarkTheme.text.primary,
                    }}>
                      Recent Activity
                    </div>
                  }
                  style={{
                    backgroundColor: MaterialDarkTheme.background.surface,
                    border: `1px solid ${MaterialDarkTheme.border.default}`,
                    borderRadius: MaterialBorderRadius.md,
                    boxShadow: MaterialElevation.level1,
                  }}
                  bodyStyle={{ padding: 0 }}
                >
                  <List
                    dataSource={recentActivities}
                    renderItem={(item) => (
                      <List.Item
                        style={{
                          padding: MaterialSpacing.md,
                          borderBottom: `1px solid ${MaterialDarkTheme.border.default}`,
                          transition: `all ${MaterialTransitions.duration.short} ${MaterialTransitions.easing.standard}`,
                        }}
                      >
                        <List.Item.Meta
                          avatar={
                            <Avatar 
                              icon={getActivityIcon(item.type)}
                              style={{
                                backgroundColor: `${MaterialColors.primary[10]}`,
                                border: `1px solid ${MaterialColors.primary[30]}`,
                              }}
                            />
                          }
                          title={
                            <div style={{ 
                              fontSize: MaterialTypography.bodyMedium.fontSize,
                              fontWeight: 500,
                              color: MaterialDarkTheme.text.primary,
                            }}>
                              {item.title}
                            </div>
                          }
                          description={
                            <div>
                              <div style={{ 
                                fontSize: MaterialTypography.bodySmall.fontSize,
                                color: MaterialDarkTheme.text.secondary,
                                marginBottom: MaterialSpacing.xs,
                              }}>
                                {item.description}
                              </div>
                              <div style={{ 
                                fontSize: MaterialTypography.bodySmall.fontSize,
                                color: MaterialDarkTheme.text.tertiary,
                              }}>
                                {item.timestamp}
                              </div>
                            </div>
                          }
                        />
                        <div>
                          {item.status === 'success' && (
                            <CheckCircleOutlined style={{ color: MaterialColors.success[50] }} />
                          )}
                          {item.status === 'pending' && (
                            <ClockCircleOutlined style={{ color: MaterialColors.warning[50] }} />
                          )}
                          {item.status === 'error' && (
                            <ExclamationCircleOutlined style={{ color: MaterialColors.error[50] }} />
                          )}
                        </div>
                      </List.Item>
                    )}
                  />
                </Card>
              </Col>
              
              <Col xs={24} lg={8}>
                <Card
                  title={
                    <div style={{ 
                      fontSize: MaterialTypography.titleLarge.fontSize,
                      fontWeight: MaterialTypography.titleLarge.fontWeight,
                      color: MaterialDarkTheme.text.primary,
                    }}>
                      Achievements
                    </div>
                  }
                  style={{
                    backgroundColor: MaterialDarkTheme.background.surface,
                    border: `1px solid ${MaterialDarkTheme.border.default}`,
                    borderRadius: MaterialBorderRadius.md,
                    boxShadow: MaterialElevation.level1,
                  }}
                  bodyStyle={{ padding: MaterialSpacing.md }}
                >
                  <Space direction="vertical" size={MaterialSpacing.md} style={{ width: '100%' }}>
                    {achievements.map((achievement) => (
                      <div key={achievement.id}>
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: MaterialSpacing.sm,
                          marginBottom: MaterialSpacing.xs,
                        }}>
                          <div style={{ 
                            fontSize: '20px',
                            color: achievement.unlocked ? getRarityColor(achievement.rarity) : MaterialDarkTheme.text.tertiary,
                          }}>
                            {achievement.icon}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ 
                              fontSize: MaterialTypography.bodyMedium.fontSize,
                              fontWeight: 500,
                              color: achievement.unlocked ? MaterialDarkTheme.text.primary : MaterialDarkTheme.text.secondary,
                            }}>
                              {achievement.title}
                            </div>
                            <div style={{ 
                              fontSize: MaterialTypography.bodySmall.fontSize,
                              color: MaterialDarkTheme.text.tertiary,
                            }}>
                              {achievement.description}
                            </div>
                          </div>
                        </div>
                        <Progress
                          percent={Math.round((achievement.progress / achievement.total) * 100)}
                          strokeColor={getRarityColor(achievement.rarity)}
                          trailColor={MaterialDarkTheme.border.default}
                          size="small"
                          style={{ marginTop: MaterialSpacing.xs }}
                        />
                      </div>
                    ))}
                  </Space>
                </Card>
              </Col>
            </Row>
          </TabPane>

          {/* Mining Console Tab */}
          <TabPane 
            tab={
              <span style={{ 
                fontSize: MaterialTypography.bodyLarge.fontSize,
                fontWeight: 500,
                color: activeTab === 'mining' ? MaterialColors.primary[60] : MaterialDarkTheme.text.secondary,
              }}>
                <ThunderboltOutlined /> Mining Console
              </span>
            } 
            key="mining"
          >
            <Card
              title="Mining Operations Control"
              style={{
                backgroundColor: MaterialDarkTheme.background.surface,
                border: `1px solid ${MaterialDarkTheme.border.default}`,
                borderRadius: MaterialBorderRadius.md,
                boxShadow: MaterialElevation.level1,
              }}
            >
              <div style={{ textAlign: 'center', padding: MaterialSpacing.xxl }}>
                <Button
                  type={miningActive ? 'default' : 'primary'}
                  size="large"
                  icon={miningActive ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
                  onClick={handleMiningToggle}
                  style={{ 
                    height: MaterialComponentSizes.button.lg.height,
                    padding: `0 ${MaterialSpacing.xl}`,
                    fontSize: MaterialTypography.bodyLarge.fontSize,
                    fontWeight: 600,
                    borderRadius: MaterialBorderRadius.md,
                    background: miningActive ? 'transparent' : MaterialColors.primary[60],
                    border: miningActive ? `1px solid ${MaterialDarkTheme.border.default}` : 'none',
                    color: miningActive ? MaterialDarkTheme.text.primary : 'white',
                    boxShadow: miningActive ? MaterialElevation.level0 : MaterialElevation.level2,
                  }}
                >
                  {miningActive ? 'Stop Mining Operations' : 'Start Mining Operations'}
                </Button>
                
                <div style={{ marginTop: MaterialSpacing.lg }}>
                  <Text style={{ 
                    fontSize: MaterialTypography.bodyLarge.fontSize,
                    color: MaterialDarkTheme.text.secondary,
                  }}>
                    {miningActive ? 'Mining is currently active and generating rewards' : 'Click to start mining and begin earning rewards'}
                  </Text>
                </div>
              </div>
            </Card>
          </TabPane>

          {/* Additional tabs can be added here */}
        </Tabs>
      </Content>

      {/* Professional CSS */}
      <style>{`
        .ant-card {
          transition: all ${MaterialTransitions.duration.medium} ${MaterialTransitions.easing.standard};
        }
        
        .ant-card:hover {
          box-shadow: ${MaterialElevation.level2};
          transform: translateY(-2px);
        }
        
        .ant-tabs-tab {
          transition: all ${MaterialTransitions.duration.short} ${MaterialTransitions.easing.standard} !important;
          border-radius: ${MaterialBorderRadius.sm} !important;
        }
        
        .ant-tabs-tab:hover {
          transform: translateY(-1px) !important;
        }
        
        .ant-tabs-tab-active {
          background: ${MaterialColors.primary[10]} !important;
        }
        
        .ant-statistic {
          transition: all ${MaterialTransitions.duration.short} ${MaterialTransitions.easing.standard};
        }
        
        .ant-statistic:hover {
          transform: translateY(-1px);
        }
      `}</style>
    </Layout>
  );
};

export default ProfessionalMainDashboard;
