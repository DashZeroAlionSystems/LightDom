import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Button,
  Input,
  Form,
  message,
  Tabs,
  Table,
  Progress,
  Tag,
  Space,
  Typography,
  Alert,
  Spin,
  Modal,
  List,
  Avatar,
  Badge,
  Tooltip
} from 'antd';
import {
  WalletOutlined,
  TrophyOutlined,
  GlobalOutlined,
  DatabaseOutlined,
  ThunderboltOutlined,
  StarOutlined,
  LinkOutlined,
  SettingOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { useBlockchain } from '../../hooks/state/useBlockchain';
import { OptimizationData } from '../services/BlockchainService';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { TextArea } = Input;

const BlockchainDashboard: React.FC = () => {
  const {
    blockchainService,
    userAddress,
    isConnected,
    loading,
    error,
    harvesterStats,
    metaverseStats,
    tokenBalance,
    stakingRewards,
    networkInfo,
    connectWallet,
    disconnectWallet,
    submitOptimization,
    stakeTokens,
    unstakeTokens,
    claimStakingRewards,
    refreshData
  } = useBlockchain();
  const [optimizationForm] = Form.useForm();
  const [stakeForm] = Form.useForm();
  const [showOptimizationModal, setShowOptimizationModal] = useState(false);
  const [showStakeModal, setShowStakeModal] = useState(false);
  const [recentOptimizations, setRecentOptimizations] = useState<any[]>([]);

  const handleSubmitOptimization = async (values: any) => {
    try {
      const optimizationData: OptimizationData = {
        url: values.url,
        spaceBytes: parseInt(values.spaceBytes),
        proofHash: values.proofHash,
        biomeType: values.biomeType,
        metadata: values.metadata
      };

      const txHash = await submitOptimization(optimizationData);
      message.success(`Optimization submitted! Transaction: ${txHash}`);
      setShowOptimizationModal(false);
      optimizationForm.resetFields();
    } catch (error) {
      console.error('Failed to submit optimization:', error);
      message.error('Failed to submit optimization');
    }
  };

  const handleStakeTokens = async (values: any) => {
    try {
      const txHash = await stakeTokens(values.amount);
      message.success(`Tokens staked! Transaction: ${txHash}`);
      setShowStakeModal(false);
      stakeForm.resetFields();
    } catch (error) {
      console.error('Failed to stake tokens:', error);
      message.error('Failed to stake tokens');
    }
  };

  const handleUnstakeTokens = async (values: any) => {
    try {
      const txHash = await unstakeTokens(values.amount);
      message.success(`Tokens unstaked! Transaction: ${txHash}`);
    } catch (error) {
      console.error('Failed to unstake tokens:', error);
      message.error('Failed to unstake tokens');
    }
  };

  const handleClaimRewards = async () => {
    try {
      const txHash = await claimStakingRewards();
      message.success(`Rewards claimed! Transaction: ${txHash}`);
    } catch (error) {
      console.error('Failed to claim rewards:', error);
      message.error('Failed to claim rewards');
    }
  };

  const getReputationLevel = (score: number) => {
    if (score >= 10000) return { level: 'Legendary', color: 'purple' };
    if (score >= 5000) return { level: 'Master', color: 'gold' };
    if (score >= 1000) return { level: 'Expert', color: 'blue' };
    if (score >= 100) return { level: 'Advanced', color: 'green' };
    return { level: 'Beginner', color: 'default' };
  };

  const optimizationColumns = [
    {
      title: 'URL',
      dataIndex: 'url',
      key: 'url',
      render: (url: string) => (
        <Tooltip title={url}>
          <Text ellipsis style={{ maxWidth: 200 }}>
            {url}
          </Text>
        </Tooltip>
      )
    },
    {
      title: 'Space Saved',
      dataIndex: 'spaceBytes',
      key: 'spaceBytes',
      render: (bytes: number) => `${(bytes / 1024).toFixed(2)} KB`
    },
    {
      title: 'Biome',
      dataIndex: 'biomeType',
      key: 'biomeType',
      render: (biome: string) => <Tag color="blue">{biome}</Tag>
    },
    {
      title: 'Status',
      dataIndex: 'verified',
      key: 'verified',
      render: (verified: boolean) => (
        verified ? 
          <Tag icon={<CheckCircleOutlined />} color="success">Verified</Tag> :
          <Tag icon={<ExclamationCircleOutlined />} color="warning">Pending</Tag>
      )
    },
    {
      title: 'Score',
      dataIndex: 'verificationScore',
      key: 'verificationScore',
      render: (score: number) => (
        <Progress 
          percent={score} 
          size="small" 
          status={score >= 70 ? 'success' : 'exception'}
        />
      )
    }
  ];

  // Show wallet connection if not connected
  if (!isConnected) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <Title level={2}>
          <WalletOutlined /> Blockchain Dashboard
        </Title>
        
        <Card style={{ maxWidth: 500, margin: '0 auto' }}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div>
              <WalletOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
              <Title level={3}>Connect Your Wallet</Title>
              <Text type="secondary">
                Connect your MetaMask wallet to access blockchain features
              </Text>
            </div>
            
            {error && (
              <Alert
                message="Connection Error"
                description={error}
                type="error"
                showIcon
              />
            )}
            
            <Button
              type="primary"
              size="large"
              onClick={connectWallet}
              loading={loading}
              icon={<WalletOutlined />}
            >
              Connect MetaMask
            </Button>
            
            <Text type="secondary" style={{ fontSize: '12px' }}>
              Make sure you have MetaMask installed and unlocked
            </Text>
          </Space>
        </Card>
      </div>
    );
  }

  if (loading && !harvesterStats) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <div style={{ marginTop: '20px' }}>Loading blockchain dashboard...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <Title level={2}>
          <WalletOutlined /> Blockchain Dashboard
        </Title>
        
        <Space>
          <Text type="secondary">
            {userAddress?.slice(0, 6)}...{userAddress?.slice(-4)}
          </Text>
          <Button onClick={disconnectWallet} size="small">
            Disconnect
          </Button>
        </Space>
      </div>
      
      <Alert
        message="Blockchain Integration Active"
        description={`Connected to ${networkInfo?.name || 'Unknown'} network (Chain ID: ${networkInfo?.chainId || 'Unknown'})`}
        type="success"
        showIcon
        style={{ marginBottom: '24px' }}
      />
      
      {error && (
        <Alert
          message="Blockchain Error"
          description={error}
          type="error"
          showIcon
          style={{ marginBottom: '24px' }}
        />
      )}

      <Row gutter={[16, 16]}>
        {/* Token Balance */}
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="LDOM Balance"
              value={parseFloat(tokenBalance).toFixed(4)}
              prefix={<WalletOutlined />}
              suffix="LDOM"
            />
          </Card>
        </Col>

        {/* Reputation Score */}
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Reputation Score"
              value={harvesterStats?.reputation || 0}
              prefix={<StarOutlined />}
              suffix={
                harvesterStats ? (
                  <Tag color={getReputationLevel(harvesterStats.reputation).color}>
                    {getReputationLevel(harvesterStats.reputation).level}
                  </Tag>
                ) : null
              }
            />
          </Card>
        </Col>

        {/* Space Harvested */}
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Space Harvested"
              value={harvesterStats ? (harvesterStats.spaceHarvested / 1024).toFixed(2) : 0}
              prefix={<DatabaseOutlined />}
              suffix="KB"
            />
          </Card>
        </Col>

        {/* Optimizations */}
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Optimizations"
              value={harvesterStats?.optimizations || 0}
              prefix={<ThunderboltOutlined />}
              suffix={`${harvesterStats?.successfulOptimizations || 0} successful`}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
        {/* Staking Section */}
        <Col xs={24} lg={12}>
          <Card title="Staking & Rewards" extra={<SettingOutlined />}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Row gutter={16}>
                <Col span={12}>
                  <Statistic
                    title="Staked Amount"
                    value={parseFloat(harvesterStats?.stakedAmount || '0').toFixed(4)}
                    suffix="LDOM"
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Pending Rewards"
                    value={parseFloat(stakingRewards).toFixed(4)}
                    suffix="LDOM"
                  />
                </Col>
              </Row>
              
              <Space>
                <Button 
                  type="primary" 
                  onClick={() => setShowStakeModal(true)}
                  disabled={parseFloat(tokenBalance) < 1000}
                >
                  Stake Tokens
                </Button>
                <Button 
                  onClick={handleUnstakeTokens}
                  disabled={parseFloat(harvesterStats?.stakedAmount || '0') <= 0}
                >
                  Unstake Tokens
                </Button>
                <Button 
                  type="default"
                  onClick={handleClaimRewards}
                  disabled={parseFloat(stakingRewards) <= 0}
                >
                  Claim Rewards
                </Button>
              </Space>
            </Space>
          </Card>
        </Col>

        {/* Metaverse Stats */}
        <Col xs={24} lg={12}>
          <Card title="Metaverse Infrastructure" extra={<GlobalOutlined />}>
            <Row gutter={16}>
              <Col span={12}>
                <Statistic
                  title="Virtual Land"
                  value={metaverseStats?.land || 0}
                  prefix={<TrophyOutlined />}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="AI Nodes"
                  value={metaverseStats?.nodes || 0}
                  prefix={<ThunderboltOutlined />}
                />
              </Col>
            </Row>
            <Row gutter={16} style={{ marginTop: '16px' }}>
              <Col span={12}>
                <Statistic
                  title="Storage Shards"
                  value={metaverseStats?.shards || 0}
                  prefix={<DatabaseOutlined />}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Bridges"
                  value={metaverseStats?.bridges || 0}
                  prefix={<LinkOutlined />}
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      <Row style={{ marginTop: '24px' }}>
        <Col span={24}>
          <Card title="Optimization Management">
            <Tabs defaultActiveKey="submit">
              <TabPane tab="Submit Optimization" key="submit">
                <Button 
                  type="primary" 
                  size="large"
                  onClick={() => setShowOptimizationModal(true)}
                  icon={<ThunderboltOutlined />}
                >
                  Submit New Optimization
                </Button>
              </TabPane>
              
              <TabPane tab="Recent Optimizations" key="recent">
                <Table
                  columns={optimizationColumns}
                  dataSource={recentOptimizations}
                  rowKey="id"
                  pagination={{ pageSize: 10 }}
                  locale={{ emptyText: 'No optimizations yet' }}
                />
              </TabPane>
            </Tabs>
          </Card>
        </Col>
      </Row>

      {/* Optimization Modal */}
      <Modal
        title="Submit Optimization"
        open={showOptimizationModal}
        onCancel={() => setShowOptimizationModal(false)}
        footer={null}
        width={600}
      >
        <Form
          form={optimizationForm}
          layout="vertical"
          onFinish={handleSubmitOptimization}
        >
          <Form.Item
            name="url"
            label="Website URL"
            rules={[{ required: true, message: 'Please enter the website URL' }]}
          >
            <Input placeholder="https://example.com" />
          </Form.Item>

          <Form.Item
            name="spaceBytes"
            label="Space Saved (bytes)"
            rules={[{ required: true, message: 'Please enter the space saved' }]}
          >
            <Input type="number" placeholder="1024" />
          </Form.Item>

          <Form.Item
            name="proofHash"
            label="Proof Hash"
            rules={[{ required: true, message: 'Please enter the proof hash' }]}
          >
            <Input placeholder="0x..." />
          </Form.Item>

          <Form.Item
            name="biomeType"
            label="Biome Type"
            rules={[{ required: true, message: 'Please select a biome type' }]}
          >
            <Input placeholder="e.g., Corporate, E-commerce, Blog" />
          </Form.Item>

          <Form.Item
            name="metadata"
            label="Additional Metadata"
          >
            <TextArea rows={3} placeholder="Additional information about the optimization..." />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                Submit Optimization
              </Button>
              <Button onClick={() => setShowOptimizationModal(false)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Staking Modal */}
      <Modal
        title="Stake Tokens"
        open={showStakeModal}
        onCancel={() => setShowStakeModal(false)}
        footer={null}
        width={400}
      >
        <Form
          form={stakeForm}
          layout="vertical"
          onFinish={handleStakeTokens}
        >
          <Form.Item
            name="amount"
            label="Amount to Stake (LDOM)"
            rules={[
              { required: true, message: 'Please enter the amount to stake' },
              { 
                validator: (_, value) => {
                  if (value && parseFloat(value) < 1000) {
                    return Promise.reject('Minimum stake amount is 1000 LDOM');
                  }
                  if (value && parseFloat(value) > parseFloat(tokenBalance)) {
                    return Promise.reject('Insufficient balance');
                  }
                  return Promise.resolve();
                }
              }
            ]}
          >
            <Input type="number" placeholder="1000" />
          </Form.Item>

          <Alert
            message="Staking Information"
            description="Staking tokens earns you 5% annual rewards and increases your reputation score. Minimum stake: 1000 LDOM"
            type="info"
            showIcon
            style={{ marginBottom: '16px' }}
          />

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                Stake Tokens
              </Button>
              <Button onClick={() => setShowStakeModal(false)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default BlockchainDashboard;