/**
 * Mining Console Page
 * Professional mining operations control and monitoring
 */

import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Typography,
  Space,
  Statistic,
  Progress,
  Button,
  Alert,
  Table,
  Tag,
  Divider,
  Switch,
  InputNumber,
  Select,
  Tooltip,
} from 'antd';
import {
  ThunderboltOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  SettingOutlined,
  FireOutlined,
  DatabaseOutlined,
  ClockCircleOutlined,
  TrophyOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import { EnhancedColors, EnhancedSpacing, EnhancedTypography, EnhancedComponentSizes } from '../../styles/EnhancedDesignSystem';

const { Title, Text } = Typography;
const { Option } = Select;

interface MiningWorker {
  id: string;
  name: string;
  status: 'active' | 'idle' | 'error';
  hashRate: number;
  temperature: number;
  powerUsage: number;
  efficiency: number;
}

interface MiningConfig {
  workers: number;
  intensity: number;
  maxTemp: number;
  autoRestart: boolean;
}

const MiningConsolePage: React.FC = () => {
  const [miningActive, setMiningActive] = useState(false);
  const [config, setConfig] = useState<MiningConfig>({
    workers: 4,
    intensity: 75,
    maxTemp: 80,
    autoRestart: true,
  });

  const [workers, setWorkers] = useState<MiningWorker[]>([
    {
      id: '1',
      name: 'Worker GPU-1',
      status: 'active',
      hashRate: 625.5,
      temperature: 65.2,
      powerUsage: 225.3,
      efficiency: 94.2,
    },
    {
      id: '2',
      name: 'Worker GPU-2',
      status: 'active',
      hashRate: 618.8,
      temperature: 67.1,
      powerUsage: 228.7,
      efficiency: 93.1,
    },
    {
      id: '3',
      name: 'Worker GPU-3',
      status: 'idle',
      hashRate: 0,
      temperature: 45.3,
      powerUsage: 45.2,
      efficiency: 0,
    },
    {
      id: '4',
      name: 'Worker GPU-4',
      status: 'active',
      hashRate: 632.1,
      temperature: 69.8,
      powerUsage: 235.4,
      efficiency: 92.8,
    },
  ]);

  const [stats, setStats] = useState({
    totalHashRate: 1876.4,
    averageTemp: 65.2,
    totalPower: 734.4,
    networkDifficulty: 1258439201875,
    blockReward: 12.5,
    nextBlockIn: 142,
  });

  // Real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (miningActive) {
        setStats(prev => ({
          ...prev,
          totalHashRate: prev.totalHashRate + (Math.random() - 0.5) * 50,
          averageTemp: Math.max(45, Math.min(85, prev.averageTemp + (Math.random() - 0.5) * 2)),
          totalPower: Math.max(100, prev.totalPower + (Math.random() - 0.5) * 20),
          nextBlockIn: Math.max(1, prev.nextBlockIn - 1),
        }));

        setWorkers(prev => prev.map(worker => 
          worker.status === 'active' ? {
            ...worker,
            hashRate: Math.max(500, worker.hashRate + (Math.random() - 0.5) * 20),
            temperature: Math.max(45, Math.min(85, worker.temperature + (Math.random() - 0.5) * 3)),
            powerUsage: Math.max(100, worker.powerUsage + (Math.random() - 0.5) * 10),
            efficiency: Math.max(80, Math.min(98, worker.efficiency + (Math.random() - 0.5) * 2)),
          } : worker
        ));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [miningActive]);

  const handleMiningToggle = () => {
    setMiningActive(!miningActive);
    if (!miningActive) {
      setWorkers(prev => prev.map(worker => ({
        ...worker,
        status: worker.name !== 'Worker GPU-3' ? 'active' as const : 'idle' as const,
      })));
    } else {
      setWorkers(prev => prev.map(worker => ({
        ...worker,
        status: 'idle' as const,
        hashRate: 0,
        temperature: 45,
        powerUsage: 45,
        efficiency: 0,
      })));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return EnhancedColors.success[500];
      case 'idle': return EnhancedColors.warning[500];
      case 'error': return EnhancedColors.error[500];
      default: return EnhancedColors.neutral[500];
    }
  };

  const getTemperatureColor = (temp: number) => {
    if (temp > 80) return EnhancedColors.error[500];
    if (temp > 70) return EnhancedColors.warning[500];
    return EnhancedColors.success[500];
  };

  const workerColumns = [
    {
      title: 'Worker',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: MiningWorker) => (
        <Space>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: getStatusColor(record.status),
          }} />
          <Text style={{ color: EnhancedColors.dark.text }}>{name}</Text>
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
        <Text style={{ color: EnhancedColors.primary[600], fontWeight: 600 }}>
          {rate.toFixed(1)} MH/s
        </Text>
      ),
    },
    {
      title: 'Temperature',
      dataIndex: 'temperature',
      key: 'temperature',
      render: (temp: number) => (
        <Text style={{ color: getTemperatureColor(temp), fontWeight: 600 }}>
          {temp.toFixed(1)}°C
        </Text>
      ),
    },
    {
      title: 'Power Usage',
      dataIndex: 'powerUsage',
      key: 'powerUsage',
      render: (power: number) => (
        <Text style={{ color: EnhancedColors.info[500] }}>
          {power.toFixed(1)}W
        </Text>
      ),
    },
    {
      title: 'Efficiency',
      dataIndex: 'efficiency',
      key: 'efficiency',
      render: (eff: number) => (
        <Progress
          percent={eff}
          size="small"
          strokeColor={eff > 90 ? EnhancedColors.success[500] : EnhancedColors.warning[500]}
          format={() => `${eff.toFixed(1)}%`}
        />
      ),
    },
  ];

  return (
    <div style={{ padding: EnhancedSpacing.lg }}>
      {/* Page Header */}
      <div style={{ marginBottom: EnhancedSpacing.xl }}>
        <Title level={2} style={{ 
          color: EnhancedColors.dark.text,
          fontSize: EnhancedTypography.headlineMedium.fontSize,
          fontWeight: EnhancedTypography.headlineMedium.fontWeight,
          margin: 0,
          marginBottom: EnhancedSpacing.sm,
        }}>
          Mining Console
        </Title>
        <Text style={{ 
          fontSize: EnhancedTypography.bodyLarge.fontSize,
          color: EnhancedColors.dark.textSecondary,
        }}>
          Advanced mining operations control and real-time monitoring
        </Text>
      </div>

      {/* Mining Control Panel */}
      <Alert
        message={miningActive ? "Mining Operations Active" : "Mining Operations Stopped"}
        description={
          miningActive 
            ? `All systems operational. Current hash rate: ${stats.totalHashRate.toFixed(1)} MH/s`
            : "Click 'Start Mining' to begin mining operations"
        }
        type={miningActive ? "success" : "info"}
        showIcon
        action={
          <Button
            size="large"
            type={miningActive ? "default" : "primary"}
            icon={miningActive ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
            onClick={handleMiningToggle}
            style={{
              height: EnhancedComponentSizes.button.lg.height,
              fontWeight: 600,
              background: miningActive ? 'transparent' : EnhancedColors.primary[600],
              border: miningActive ? `1px solid ${EnhancedColors.dark.border}` : 'none',
              color: miningActive ? EnhancedColors.dark.text : 'white',
            }}
          >
            {miningActive ? 'Stop Mining' : 'Start Mining'}
          </Button>
        }
        style={{
          marginBottom: EnhancedSpacing.lg,
          backgroundColor: miningActive ? `${EnhancedColors.success[100]}20` : `${EnhancedColors.info[100]}20`,
          borderColor: miningActive ? EnhancedColors.success[500] : EnhancedColors.info[500],
          borderRadius: EnhancedBorderRadius.md,
        }}
      />

      {/* Mining Statistics */}
      <Row gutter={[EnhancedSpacing.lg, EnhancedSpacing.lg]} style={{ marginBottom: EnhancedSpacing.lg }}>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ ...EnhancedComponents.card, height: EnhancedComponentSizes.card.md.height }}>
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <Space>
                <ThunderboltOutlined style={{ color: EnhancedColors.primary[600], fontSize: '20px' }} />
                <Text style={{ color: EnhancedColors.dark.textSecondary }}>Total Hash Rate</Text>
              </Space>
              <Statistic
                value={stats.totalHashRate}
                suffix="MH/s"
                precision={1}
                valueStyle={{ color: EnhancedColors.primary[600], fontSize: '24px', fontWeight: 600 }}
              />
            </Space>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card style={{ ...EnhancedComponents.card, height: EnhancedComponentSizes.card.md.height }}>
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <Space>
                <FireOutlined style={{ color: getTemperatureColor(stats.averageTemp), fontSize: '20px' }} />
                <Text style={{ color: EnhancedColors.dark.textSecondary }}>Average Temperature</Text>
              </Space>
              <Statistic
                value={stats.averageTemp}
                suffix="°C"
                precision={1}
                valueStyle={{ color: getTemperatureColor(stats.averageTemp), fontSize: '24px', fontWeight: 600 }}
              />
            </Space>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card style={{ ...EnhancedComponents.card, height: EnhancedComponentSizes.card.md.height }}>
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <Space>
                <DatabaseOutlined style={{ color: EnhancedColors.info[500], fontSize: '20px' }} />
                <Text style={{ color: EnhancedColors.dark.textSecondary }}>Power Usage</Text>
              </Space>
              <Statistic
                value={stats.totalPower}
                suffix="W"
                precision={1}
                valueStyle={{ color: EnhancedColors.info[500], fontSize: '24px', fontWeight: 600 }}
              />
            </Space>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card style={{ ...EnhancedComponents.card, height: EnhancedComponentSizes.card.md.height }}>
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <Space>
                <ClockCircleOutlined style={{ color: EnhancedColors.warning[500], fontSize: '20px' }} />
                <Text style={{ color: EnhancedColors.dark.textSecondary }}>Next Block In</Text>
              </Space>
              <Statistic
                value={stats.nextBlockIn}
                suffix="sec"
                valueStyle={{ color: EnhancedColors.warning[500], fontSize: '24px', fontWeight: 600 }}
              />
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Configuration and Workers */}
      <Row gutter={[EnhancedSpacing.lg, EnhancedSpacing.lg]}>
        <Col xs={24} lg={8}>
          <Card
            title="Mining Configuration"
            style={{ ...EnhancedComponents.card }}
            headStyle={{ borderBottom: `1px solid ${EnhancedColors.dark.border}` }}
          >
            <Space direction="vertical" size={EnhancedSpacing.lg} style={{ width: '100%' }}>
              <div>
                <Text style={{ color: EnhancedColors.dark.textSecondary, marginBottom: EnhancedSpacing.xs }}>
                  Active Workers
                </Text>
                <InputNumber
                  min={1}
                  max={8}
                  value={config.workers}
                  onChange={(value) => setConfig(prev => ({ ...prev, workers: value || 1 }))}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <Text style={{ color: EnhancedColors.dark.textSecondary, marginBottom: EnhancedSpacing.xs }}>
                  Mining Intensity
                </Text>
                <InputNumber
                  min={25}
                  max={100}
                  value={config.intensity}
                  onChange={(value) => setConfig(prev => ({ ...prev, intensity: value || 75 }))}
                  style={{ width: '100%' }}
                  suffix="%"
                />
              </div>

              <div>
                <Text style={{ color: EnhancedColors.dark.textSecondary, marginBottom: EnhancedSpacing.xs }}>
                  Max Temperature
                </Text>
                <InputNumber
                  min={60}
                  max={90}
                  value={config.maxTemp}
                  onChange={(value) => setConfig(prev => ({ ...prev, maxTemp: value || 80 }))}
                  style={{ width: '100%' }}
                  suffix="°C"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ color: EnhancedColors.dark.textSecondary }}>Auto Restart</Text>
                <Switch
                  checked={config.autoRestart}
                  onChange={(checked) => setConfig(prev => ({ ...prev, autoRestart: checked }))}
                />
              </div>

              <Button
                type="primary"
                icon={<SettingOutlined />}
                style={{ width: '100%' }}
              >
                Apply Configuration
              </Button>
            </Space>
          </Card>
        </Col>

        <Col xs={24} lg={16}>
          <Card
            title="Mining Workers"
            style={{ ...EnhancedComponents.card }}
            headStyle={{ borderBottom: `1px solid ${EnhancedColors.dark.border}` }}
          >
            <Table
              columns={workerColumns}
              dataSource={workers}
              pagination={false}
              size="middle"
              style={{
                backgroundColor: EnhancedColors.dark.surface,
              }}
              rowKey="id"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default MiningConsolePage;
