/**
 * Mining Console Page - Advanced Mining Operations Control
 * Real-time mining management with detailed statistics and controls
 */

import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Typography,
  Progress,
  Button,
  Statistic,
  Table,
  Tag,
  Space,
  Tooltip,
  Switch,
  InputNumber,
  Alert,
  Tabs,
  Badge,
  Avatar,
  List,
  Divider,
} from 'antd';
import {
  PlayCircleOutlined,
  PauseCircleOutlined,
  SettingOutlined,
  ThunderboltOutlined,
  FireOutlined,
  TrophyOutlined,
  RocketOutlined,
  LineChartOutlined,
  HeatMapOutlined,
  ApiOutlined,
  SyncOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import DesignSystem from './EnhancedDesignSystem';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

interface MiningStats {
  hashRate: number;
  acceptedShares: number;
  rejectedShares: number;
  difficulty: number;
  blockHeight: number;
  temperature: number;
  powerUsage: number;
  uptime: number;
  earnings: number;
  efficiency: number;
}

interface Worker {
  id: string;
  name: string;
  status: 'active' | 'idle' | 'error';
  hashRate: number;
  temperature: number;
  acceptedShares: number;
  rejectedShares: number;
  lastSeen: string;
}

const MiningConsolePage: React.FC = () => {
  const [isMining, setIsMining] = useState(false);
  const [stats, setStats] = useState<MiningStats>({
    hashRate: 0,
    acceptedShares: 0,
    rejectedShares: 0,
    difficulty: 0,
    blockHeight: 0,
    temperature: 0,
    powerUsage: 0,
    uptime: 0,
    earnings: 0,
    efficiency: 0,
  });
  
  const [workers, setWorkers] = useState<Worker[]>([
    {
      id: '1',
      name: 'GPU Worker 1',
      status: 'active',
      hashRate: 85.5,
      temperature: 72,
      acceptedShares: 1250,
      rejectedShares: 12,
      lastSeen: '2 seconds ago',
    },
    {
      id: '2',
      name: 'GPU Worker 2',
      status: 'active',
      hashRate: 92.3,
      temperature: 68,
      acceptedShares: 1180,
      rejectedShares: 8,
      lastSeen: '1 second ago',
    },
    {
      id: '3',
      name: 'CPU Worker',
      status: 'idle',
      hashRate: 0,
      temperature: 45,
      acceptedShares: 0,
      rejectedShares: 0,
      lastSeen: '5 minutes ago',
    },
  ]);

  const [settings, setSettings] = useState({
    maxTemperature: 80,
    powerLimit: 250,
    autoRestart: true,
    optimizationLevel: 2,
  });

  // Simulate real-time updates
  useEffect(() => {
    if (!isMining) return;

    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        hashRate: Math.max(0, prev.hashRate + (Math.random() - 0.5) * 10),
        acceptedShares: prev.acceptedShares + Math.floor(Math.random() * 3),
        rejectedShares: prev.rejectedShares + (Math.random() > 0.9 ? 1 : 0),
        difficulty: Math.max(1, prev.difficulty + (Math.random() - 0.5) * 0.1),
        blockHeight: prev.blockHeight + 1,
        temperature: Math.max(50, Math.min(85, prev.temperature + (Math.random() - 0.5) * 2)),
        powerUsage: Math.max(100, Math.min(300, prev.powerUsage + (Math.random() - 0.5) * 5)),
        uptime: prev.uptime + 1,
        earnings: prev.earnings + 0.0001,
        efficiency: Math.max(70, Math.min(95, prev.efficiency + (Math.random() - 0.5) * 2)),
      }));

      // Update workers
      setWorkers(prev => prev.map(worker => 
        worker.status === 'active' 
          ? {
              ...worker,
              hashRate: Math.max(0, worker.hashRate + (Math.random() - 0.5) * 5),
              temperature: Math.max(50, Math.min(85, worker.temperature + (Math.random() - 0.5) * 3)),
              acceptedShares: worker.acceptedShares + Math.floor(Math.random() * 2),
              rejectedShares: worker.rejectedShares + (Math.random() > 0.95 ? 1 : 0),
              lastSeen: Math.random() > 0.5 ? '1 second ago' : '2 seconds ago',
            }
          : worker
      ));
    }, 2000);

    return () => clearInterval(interval);
  }, [isMining]);

  const handleStartMining = () => {
    setIsMining(true);
    setStats(prev => ({
      ...prev,
      hashRate: 175.8,
      temperature: 70,
      powerUsage: 220,
      efficiency: 88.5,
    }));
  };

  const handleStopMining = () => {
    setIsMining(false);
    setStats(prev => ({
      ...prev,
      hashRate: 0,
      temperature: 45,
      powerUsage: 50,
      efficiency: 0,
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return DesignSystem.Colors.success;
      case 'idle': return DesignSystem.Colors.warning;
      case 'error': return DesignSystem.Colors.error;
      default: return DesignSystem.Colors.textSecondary;
    }
  };

  const getTemperatureColor = (temp: number) => {
    if (temp < 60) return DesignSystem.Colors.success;
    if (temp < 75) return DesignSystem.Colors.warning;
    return DesignSystem.Colors.error;
  };

  const workerColumns = [
    {
      title: 'Worker',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: Worker) => (
        <Space>
          <Avatar 
            size="small" 
            style={{ 
              backgroundColor: getStatusColor(record.status),
            }} 
            icon={<ApiOutlined />} 
          />
          <Text style={{ color: DesignSystem.Colors.text }}>{name}</Text>
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
      title: 'Hash Rate',
      dataIndex: 'hashRate',
      key: 'hashRate',
      render: (rate: number) => (
        <Text style={{ color: DesignSystem.Colors.text }}>
          {rate.toFixed(1)} MH/s
        </Text>
      ),
    },
    {
      title: 'Temperature',
      dataIndex: 'temperature',
      key: 'temperature',
      render: (temp: number) => (
        <Text style={{ color: getTemperatureColor(temp) }}>
          {temp}°C
        </Text>
      ),
    },
    {
      title: 'Accepted',
      dataIndex: 'acceptedShares',
      key: 'acceptedShares',
      render: (shares: number) => (
        <Text style={{ color: DesignSystem.Colors.success }}>
          {shares.toLocaleString()}
        </Text>
      ),
    },
    {
      title: 'Rejected',
      dataIndex: 'rejectedShares',
      key: 'rejectedShares',
      render: (shares: number) => (
        <Text style={{ color: DesignSystem.Colors.error }}>
          {shares}
        </Text>
      ),
    },
    {
      title: 'Last Seen',
      dataIndex: 'lastSeen',
      key: 'lastSeen',
      render: (time: string) => (
        <Text style={{ color: DesignSystem.Colors.textSecondary }}>
          {time}
        </Text>
      ),
    },
  ];

  return (
    <div style={{ padding: DesignSystem.Spacing.lg }}>
      <div style={{ marginBottom: DesignSystem.Spacing.lg }}>
        <Title level={2} style={{ color: DesignSystem.Colors.text, margin: 0 }}>
          Mining Console
        </Title>
        <Text style={{ color: DesignSystem.Colors.textSecondary }}>
          Advanced mining operations control and monitoring
        </Text>
      </div>

      {/* Control Panel */}
      <Card 
        style={{ 
          ...DesignSystem.ComponentStyles.card,
          marginBottom: DesignSystem.Spacing.lg,
        }}
      >
        <Row justify="space-between" align="middle">
          <Col>
            <Space size="large">
              <Button
                type={isMining ? "default" : "primary"}
                icon={<PlayCircleOutlined />}
                onClick={handleStartMining}
                disabled={isMining}
                style={{
                  background: isMining ? undefined : DesignSystem.Colors.gradients.success,
                  border: 'none',
                  ...DesignSystem.ComponentStyles.button,
                }}
              >
                Start Mining
              </Button>
              <Button
                type="default"
                icon={<PauseCircleOutlined />}
                onClick={handleStopMining}
                disabled={!isMining}
                danger={isMining}
                style={DesignSystem.ComponentStyles.button}
              >
                Stop Mining
              </Button>
              <Badge 
                status={isMining ? "processing" : "default"} 
                text={isMining ? "Mining Active" : "Mining Stopped"}
              />
            </Space>
          </Col>
          <Col>
            <Space>
              <Tooltip title="Mining Configuration">
                <Button icon={<SettingOutlined />} style={DesignSystem.ComponentStyles.button}>
                  Settings
                </Button>
              </Tooltip>
              <Tooltip title="Optimize Performance">
                <Button icon={<ThunderboltOutlined />} style={DesignSystem.ComponentStyles.button}>
                  Optimize
                </Button>
              </Tooltip>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Statistics Overview */}
      <Row gutter={[DesignSystem.Spacing.lg, DesignSystem.Spacing.lg]}>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card style={DesignSystem.ComponentStyles.card}>
            <Statistic
              title="Total Hash Rate"
              value={stats.hashRate}
              suffix="MH/s"
              prefix={<ThunderboltOutlined style={{ color: DesignSystem.Colors.primary }} />}
              valueStyle={{ color: DesignSystem.Colors.primary }}
            />
            <Progress 
              percent={(stats.hashRate / 200) * 100} 
              strokeColor={DesignSystem.Colors.primary}
              showInfo={false}
              style={{ marginTop: DesignSystem.Spacing.sm }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card style={DesignSystem.ComponentStyles.card}>
            <Statistic
              title="Temperature"
              value={stats.temperature}
              suffix="°C"
              prefix={<FireOutlined style={{ color: getTemperatureColor(stats.temperature) }} />}
              valueStyle={{ color: getTemperatureColor(stats.temperature) }}
            />
            <Progress 
              percent={(stats.temperature / 90) * 100} 
              strokeColor={getTemperatureColor(stats.temperature)}
              showInfo={false}
              style={{ marginTop: DesignSystem.Spacing.sm }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card style={DesignSystem.ComponentStyles.card}>
            <Statistic
              title="Power Usage"
              value={stats.powerUsage}
              suffix="W"
              prefix={<ApiOutlined style={{ color: DesignSystem.Colors.warning }} />}
              valueStyle={{ color: DesignSystem.Colors.warning }}
            />
            <Progress 
              percent={(stats.powerUsage / 300) * 100} 
              strokeColor={DesignSystem.Colors.warning}
              showInfo={false}
              style={{ marginTop: DesignSystem.Spacing.sm }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card style={DesignSystem.ComponentStyles.card}>
            <Statistic
              title="Efficiency"
              value={stats.efficiency}
              suffix="%"
              prefix={<LineChartOutlined style={{ color: DesignSystem.Colors.success }} />}
              valueStyle={{ color: DesignSystem.Colors.success }}
            />
            <Progress 
              percent={stats.efficiency} 
              strokeColor={DesignSystem.Colors.success}
              showInfo={false}
              style={{ marginTop: DesignSystem.Spacing.sm }}
            />
          </Card>
        </Col>
      </Row>

      {/* Detailed Tabs */}
      <Card 
        style={{ 
          ...DesignSystem.ComponentStyles.card,
          marginTop: DesignSystem.Spacing.lg,
        }}
      >
        <Tabs defaultActiveKey="workers">
          <TabPane 
            tab={
              <span>
                <ApiOutlined />
                Workers
              </span>
            } 
            key="workers"
          >
            <Table
              columns={workerColumns}
              dataSource={workers}
              rowKey="id"
              pagination={false}
              style={{ marginTop: DesignSystem.Spacing.md }}
            />
          </TabPane>
          <TabPane 
            tab={
              <span>
                <LineChartOutlined />
                Performance
              </span>
            } 
            key="performance"
          >
            <Row gutter={[DesignSystem.Spacing.lg, DesignSystem.Spacing.lg]}>
              <Col span={12}>
                <Statistic
                  title="Accepted Shares"
                  value={stats.acceptedShares}
                  prefix={<CheckCircleOutlined style={{ color: DesignSystem.Colors.success }} />}
                  valueStyle={{ color: DesignSystem.Colors.success }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Rejected Shares"
                  value={stats.rejectedShares}
                  prefix={<ExclamationCircleOutlined style={{ color: DesignSystem.Colors.error }} />}
                  valueStyle={{ color: DesignSystem.Colors.error }}
                />
              </Col>
              <Col span={12} style={{ marginTop: DesignSystem.Spacing.md }}>
                <Statistic
                  title="Block Height"
                  value={stats.blockHeight}
                  prefix={<RocketOutlined style={{ color: DesignSystem.Colors.info }} />}
                  valueStyle={{ color: DesignSystem.Colors.info }}
                />
              </Col>
              <Col span={12} style={{ marginTop: DesignSystem.Spacing.md }}>
                <Statistic
                  title="Difficulty"
                  value={stats.difficulty}
                  precision={2}
                  prefix={<HeatMapOutlined style={{ color: DesignSystem.Colors.warning }} />}
                  valueStyle={{ color: DesignSystem.Colors.warning }}
                />
              </Col>
            </Row>
          </TabPane>
          <TabPane 
            tab={
              <span>
                <TrophyOutlined />
                Earnings
              </span>
            } 
            key="earnings"
          >
            <Row gutter={[DesignSystem.Spacing.lg, DesignSystem.Spacing.lg]}>
              <Col span={12}>
                <Statistic
                  title="Total Earnings"
                  value={stats.earnings}
                  precision={6}
                  prefix={<TrophyOutlined style={{ color: DesignSystem.Colors.primary }} />}
                  valueStyle={{ color: DesignSystem.Colors.primary }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Uptime"
                  value={stats.uptime}
                  suffix="seconds"
                  prefix={<ClockCircleOutlined style={{ color: DesignSystem.Colors.info }} />}
                  valueStyle={{ color: DesignSystem.Colors.info }}
                />
              </Col>
            </Row>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default MiningConsolePage;
