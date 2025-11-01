/**
 * Professional Dashboard Component
 * Clean, readable, and professional design
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
  Badge,
  Avatar,
  Tag,
  Divider,
  Alert,
} from 'antd';
import {
  DashboardOutlined,
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
} from '@ant-design/icons';

const { Header, Content, Sider } = Layout;
const { Title, Text } = Typography;
const { TabPane } = Tabs;

interface MiningStats {
  hashRate: number;
  blocksMined: number;
  earnings: number;
  efficiency: number;
  uptime: number;
}

const ProfessionalDashboard: React.FC = () => {
  const [miningActive, setMiningActive] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [miningStats, setMiningStats] = useState<MiningStats>({
    hashRate: 2450.5,
    blocksMined: 127,
    earnings: 45.67,
    efficiency: 87.3,
    uptime: 3600,
  });

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
        }));
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [miningActive]);

  const handleMiningToggle = () => {
    setMiningActive(!miningActive);
  };

  return (
    <Layout style={{ minHeight: '100vh', background: '#0a0a0a' }}>
      {/* Professional Header */}
      <Header
        style={{
          background: 'linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)',
          borderBottom: '1px solid #333',
          padding: '0 32px',
          height: '72px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '18px',
              fontWeight: 'bold',
            }}>
              LD
            </div>
            <div>
              <Title 
                level={3} 
                style={{ 
                  margin: 0, 
                  color: '#4f46e5',
                  fontSize: '20px',
                  fontWeight: 600,
                  lineHeight: '24px'
                }}
              >
                LightDom Desktop
              </Title>
              <Text 
                style={{ 
                  fontSize: '12px',
                  color: '#999',
                  fontWeight: 500,
                }}
              >
                Professional Mining & Optimization Platform
              </Text>
            </div>
          </div>
        </div>
        
        <Space size="middle">
          <Button 
            type="primary" 
            icon={<SecurityScanOutlined />}
            style={{
              background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 500,
              height: '36px',
            }}
          >
            Admin Panel
          </Button>
          
          <Button 
            type="text" 
            icon={<SettingOutlined />}
            style={{
              color: '#999',
              borderRadius: '8px',
              height: '36px',
            }}
          >
            Settings
          </Button>
          
          <Badge count={3} size="small">
            <Button 
              type="text" 
              icon={<BellOutlined />}
              style={{
                color: '#999',
                borderRadius: '8px',
                height: '36px',
                width: '36px',
              }}
            />
          </Badge>
        </Space>
      </Header>

      <Layout>
        {/* Professional Sidebar */}
        <Sider
          width={300}
          style={{
            background: 'linear-gradient(180deg, #1a1a1a 0%, #0a0a0a 100%)',
            borderRight: '1px solid #333',
            boxShadow: '2px 0 8px rgba(0,0,0,0.2)',
          }}
        >
          <div style={{ padding: '24px 16px' }}>
            {/* Mining Status Card */}
            <Card
              size="small"
              style={{
                background: 'linear-gradient(135deg, #0a0a0a 0%, rgba(79, 70, 229, 0.1) 100%)',
                border: '1px solid #4f46e5',
                marginBottom: '24px',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              }}
            >
              <div style={{ textAlign: 'center', padding: '8px 0' }}>
                <div style={{ marginBottom: '20px' }}>
                  <ThunderboltOutlined style={{ fontSize: '48px', color: '#4f46e5' }} />
                </div>
                
                <Button
                  type={miningActive ? 'default' : 'primary'}
                  size="large"
                  icon={miningActive ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
                  onClick={handleMiningToggle}
                  style={{ 
                    width: '100%', 
                    marginBottom: '12px',
                    height: '44px',
                    fontWeight: 600,
                    fontSize: '14px',
                    borderRadius: '8px',
                    background: miningActive ? 'transparent' : 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                    border: miningActive ? '1px solid #333' : 'none',
                  }}
                >
                  {miningActive ? 'Stop Mining' : 'Start Mining'}
                </Button>
                
                <div style={{ 
                  fontSize: '13px', 
                  color: miningActive ? '#4f46e5' : '#999',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: miningActive ? '#22c55e' : '#999',
                  }} />
                  {miningActive ? 'Mining Active' : 'Mining Inactive'}
                </div>
              </div>
            </Card>

            {/* Navigation Menu */}
            <div style={{ marginBottom: '24px' }}>
              <Title 
                level={5} 
                style={{ 
                  color: '#999',
                  fontSize: '12px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  margin: '0 0 16px 16px',
                }}
              >
                Navigation
              </Title>
              <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                type="card"
                size="small"
                style={{ background: 'transparent' }}
                tabStyle={{ background: 'transparent', border: 'none' }}
              >
                <TabPane tab={<span><DashboardOutlined /> Dashboard</span>} key="overview" />
                <TabPane tab={<span><ThunderboltOutlined /> Mining</span>} key="mining" />
                <TabPane tab={<span><BarChartOutlined /> Analytics</span>} key="analytics" />
              </Tabs>
            </div>
          </div>
        </Sider>

        {/* Main Content */}
        <Content style={{ 
          padding: '32px', 
          background: '#0a0a0a',
          minHeight: 'calc(100vh - 72px)',
        }}>
          {/* Section Header */}
          <div style={{ marginBottom: '32px' }}>
            <Title 
              level={2} 
              style={{ 
                color: '#fff',
                fontSize: '28px',
                fontWeight: 700,
                margin: 0,
                marginBottom: '8px',
              }}
            >
              Mining Dashboard
            </Title>
            <Text 
              style={{ 
                fontSize: '16px',
                color: '#999',
                fontWeight: 400,
              }}
            >
              Monitor your mining performance and optimization results in real-time
            </Text>
          </div>

          {/* Stats Cards */}
          <Row gutter={[24, 24]}>
            <Col xs={24} sm={12} lg={6}>
              <Card
                style={{
                  background: '#1a1a1a',
                  border: '1px solid #333',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                }}
              >
                <Statistic
                  title={<span style={{ color: '#999' }}>Hash Rate</span>}
                  value={miningStats.hashRate}
                  suffix="MH/s"
                  precision={1}
                  valueStyle={{ color: '#4f46e5', fontSize: '24px', fontWeight: 600 }}
                  prefix={<ThunderboltOutlined />}
                />
              </Card>
            </Col>
            
            <Col xs={24} sm={12} lg={6}>
              <Card
                style={{
                  background: '#1a1a1a',
                  border: '1px solid #333',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                }}
              >
                <Statistic
                  title={<span style={{ color: '#999' }}>Earnings</span>}
                  value={miningStats.earnings}
                  prefix="$"
                  precision={2}
                  valueStyle={{ color: '#22c55e', fontSize: '24px', fontWeight: 600 }}
                  prefix={<WalletOutlined />}
                />
              </Card>
            </Col>
            
            <Col xs={24} sm={12} lg={6}>
              <Card
                style={{
                  background: '#1a1a1a',
                  border: '1px solid #333',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                }}
              >
                <Statistic
                  title={<span style={{ color: '#999' }}>Efficiency</span>}
                  value={miningStats.efficiency}
                  suffix="%"
                  precision={1}
                  valueStyle={{ color: '#f59e0b', fontSize: '24px', fontWeight: 600 }}
                  prefix={<RocketOutlined />}
                />
              </Card>
            </Col>
            
            <Col xs={24} sm={12} lg={6}>
              <Card
                style={{
                  background: '#1a1a1a',
                  border: '1px solid #333',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                }}
              >
                <Statistic
                  title={<span style={{ color: '#999' }}>Blocks Mined</span>}
                  value={miningStats.blocksMined}
                  valueStyle={{ color: '#8b5cf6', fontSize: '24px', fontWeight: 600 }}
                  prefix={<TrophyOutlined />}
                />
              </Card>
            </Col>
          </Row>

          {/* Mining Status Alert */}
          {miningActive && (
            <Alert
              message="Mining Active"
              description="Your mining operation is running smoothly. Performance metrics are being updated in real-time."
              type="success"
              showIcon
              style={{
                marginTop: '24px',
                background: 'rgba(34, 197, 94, 0.1)',
                border: '1px solid #22c55e',
                borderRadius: '8px',
              }}
            />
          )}
        </Content>
      </Layout>
    </Layout>
  );
};

export default ProfessionalDashboard;
