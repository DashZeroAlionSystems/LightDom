import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Progress, List, Tag, Space, Button, message } from 'antd';
import {
  RocketOutlined,
  GlobalOutlined,
  DatabaseOutlined,
  ThunderboltOutlined,
  DollarOutlined,
  CloudServerOutlined,
  LineChartOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import axios from 'axios';

interface MiningStats {
  isRunning: boolean;
  statistics: {
    sitesOptimized: number;
    totalSpaceSaved: number;
    blocksMinedCount: number;
    tokensEarned: number;
    startTime: number | null;
    lastExportTime: number | null;
  };
  crawlerStatus: {
    isRunning: boolean;
    sessionId: string;
    activeCrawlers: any[];
    queueLength: number;
    priorityQueueLength: number;
    visitedCount: number;
    totalOptimizations: number;
    totalSpaceHarvested: number;
  } | null;
  miningStats: {
    blocksMinedCount: number;
    totalSpaceOptimized: number;
    totalTokensRewarded: number;
    averageBlockTime: number;
    hashRate: number;
    currentDifficulty: number;
    pendingOptimizations: number;
    isActive: boolean;
  } | null;
  uptime: number;
}

interface BlockInfo {
  index: number;
  hash: string;
  timestamp: number;
  spaceOptimized: number;
  reward: number;
  optimizations: any[];
}

const MiningDashboard: React.FC = () => {
  const [miningStats, setMiningStats] = useState<MiningStats | null>(null);
  const [recentBlocks, setRecentBlocks] = useState<BlockInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [miningActive, setMiningActive] = useState(false);

  useEffect(() => {
    fetchMiningStats();
    const interval = setInterval(fetchMiningStats, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchMiningStats = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/mining/stats');
      setMiningStats(response.data);
      setMiningActive(response.data.isRunning);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch mining stats:', error);
      setLoading(false);
    }
  };

  const fetchRecentBlocks = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/mining/blocks/recent');
      setRecentBlocks(response.data);
    } catch (error) {
      console.error('Failed to fetch recent blocks:', error);
    }
  };

  const startMining = async () => {
    try {
      await axios.post('http://localhost:3001/api/mining/start');
      message.success('Mining started successfully!');
      fetchMiningStats();
    } catch (error) {
      message.error('Failed to start mining');
    }
  };

  const stopMining = async () => {
    try {
      await axios.post('http://localhost:3001/api/mining/stop');
      message.success('Mining stopped');
      fetchMiningStats();
    } catch (error) {
      message.error('Failed to stop mining');
    }
  };

  const formatUptime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
    return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
  };

  if (loading || !miningStats) {
    return <Card loading={true} />;
  }

  return (
    <div style={{ padding: '24px' }}>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={24}>
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h1 style={{ margin: 0 }}>
                  <RocketOutlined /> LightDOM Mining Dashboard
                </h1>
                <p style={{ margin: '8px 0 0 0', color: '#666' }}>
                  Mine blocks by optimizing websites and harvesting DOM space
                </p>
              </div>
              <Space>
                {miningActive ? (
                  <Button type="primary" danger onClick={stopMining}>
                    Stop Mining
                  </Button>
                ) : (
                  <Button type="primary" onClick={startMining}>
                    Start Mining
                  </Button>
                )}
                <Tag color={miningActive ? 'success' : 'default'}>
                  {miningActive ? 'ACTIVE' : 'INACTIVE'}
                </Tag>
              </Space>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Sites Optimized"
              value={miningStats.statistics.sitesOptimized}
              prefix={<GlobalOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Space Saved"
              value={formatBytes(miningStats.statistics.totalSpaceSaved)}
              prefix={<DatabaseOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Blocks Mined"
              value={miningStats.statistics.blocksMinedCount}
              prefix={<CloudServerOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="LDOM Earned"
              value={miningStats.statistics.tokensEarned}
              prefix={<DollarOutlined />}
              suffix="LDOM"
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
      </Row>

      {miningStats.miningStats && (
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col xs={24} md={12}>
            <Card title="Mining Performance">
              <Row gutter={16}>
                <Col span={12}>
                  <Statistic
                    title="Hash Rate"
                    value={miningStats.miningStats.hashRate}
                    suffix="H/s"
                    prefix={<ThunderboltOutlined />}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Difficulty"
                    value={miningStats.miningStats.currentDifficulty}
                    prefix={<LineChartOutlined />}
                  />
                </Col>
              </Row>
              <div style={{ marginTop: 16 }}>
                <p>Average Block Time</p>
                <Progress
                  percent={(miningStats.miningStats.averageBlockTime / 15000) * 100}
                  format={() => `${(miningStats.miningStats.averageBlockTime / 1000).toFixed(1)}s`}
                  status={miningStats.miningStats.averageBlockTime < 20000 ? 'success' : 'exception'}
                />
              </div>
              <div style={{ marginTop: 16 }}>
                <p>Pending Optimizations</p>
                <Progress
                  percent={(miningStats.miningStats.pendingOptimizations / 10) * 100}
                  format={() => `${miningStats.miningStats.pendingOptimizations}`}
                  status={miningStats.miningStats.pendingOptimizations < 3 ? 'exception' : 'active'}
                />
              </div>
            </Card>
          </Col>

          <Col xs={24} md={12}>
            <Card title="Crawler Status">
              {miningStats.crawlerStatus ? (
                <>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Statistic
                        title="Active Crawlers"
                        value={miningStats.crawlerStatus.activeCrawlers.length}
                        suffix="/ 5"
                      />
                    </Col>
                    <Col span={12}>
                      <Statistic
                        title="Sites Visited"
                        value={miningStats.crawlerStatus.visitedCount}
                      />
                    </Col>
                  </Row>
                  <div style={{ marginTop: 16 }}>
                    <p>Queue Status</p>
                    <Space>
                      <Tag color="blue">Regular: {miningStats.crawlerStatus.queueLength}</Tag>
                      <Tag color="orange">Priority: {miningStats.crawlerStatus.priorityQueueLength}</Tag>
                    </Space>
                  </div>
                  <div style={{ marginTop: 16 }}>
                    <p>Uptime</p>
                    <Tag color="green">{formatUptime(miningStats.uptime)}</Tag>
                  </div>
                </>
              ) : (
                <p>Crawler not running</p>
              )}
            </Card>
          </Col>
        </Row>
      )}

      <Row gutter={16}>
        <Col xs={24}>
          <Card 
            title="Recent Blocks" 
            extra={
              <Button size="small" onClick={fetchRecentBlocks}>
                Refresh
              </Button>
            }
          >
            <List
              dataSource={recentBlocks}
              renderItem={(block) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<CheckCircleOutlined style={{ fontSize: 24, color: '#52c41a' }} />}
                    title={
                      <Space>
                        <span>Block #{block.index}</span>
                        <Tag color="blue">{block.reward} LDOM</Tag>
                      </Space>
                    }
                    description={
                      <Space direction="vertical" size={0}>
                        <span style={{ fontSize: 12, color: '#666' }}>
                          Hash: {block.hash.substring(0, 20)}...
                        </span>
                        <span style={{ fontSize: 12, color: '#666' }}>
                          Space optimized: {formatBytes(block.spaceOptimized)} | 
                          Optimizations: {block.optimizations.length}
                        </span>
                      </Space>
                    }
                  />
                  <div style={{ fontSize: 12, color: '#999' }}>
                    {new Date(block.timestamp).toLocaleString()}
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default MiningDashboard;
