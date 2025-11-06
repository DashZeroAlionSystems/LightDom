/**
 * Portfolio Page
 * Professional wallet and asset management with real data integration
 */

import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Typography,
  Space,
  Button,
  Table,
  Progress,
  Tag,
  Alert,
  Statistic,
  List,
  Avatar,
  Tooltip,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Tabs,
  Divider,
  Badge,
  message,
} from 'antd';
import {
  WalletOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  SendOutlined,
  ReceiveOutlined,
  PlusOutlined,
  MinusOutlined,
  TrophyOutlined,
  ThunderboltOutlined,
  GlobalOutlined,
  BarChartOutlined,
  SettingOutlined,
  ReloadOutlined,
  DownloadOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  InfoCircleOutlined,
  FireOutlined,
  RocketOutlined,
  CrownOutlined,
  StarOutlined,
} from '@ant-design/icons';
import { api, WalletBalance, Transaction } from '../../services/apiService';

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

interface Asset {
  symbol: string;
  name: string;
  balance: number;
  value: number;
  change24h: number;
  change7d: number;
  allocation: number;
}

interface PortfolioStats {
  totalValue: number;
  totalChange24h: number;
  totalChange7d: number;
  bestPerformer: string;
  worstPerformer: string;
}

const PortfolioPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [sendModalVisible, setSendModalVisible] = useState(false);
  const [receiveModalVisible, setReceiveModalVisible] = useState(false);
  const [showBalances, setShowBalances] = useState(true);
  const [selectedAsset, setSelectedAsset] = useState<string>('LDT');

  // State for real data
  const [balance, setBalance] = useState<WalletBalance>({
    ldt: 0,
    usd: 0,
    btc: 0,
    eth: 0,
  });

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [stats, setStats] = useState<PortfolioStats>({
    totalValue: 0,
    totalChange24h: 0,
    totalChange7d: 0,
    bestPerformer: '',
    worstPerformer: '',
  });

  // Load real data on component mount
  useEffect(() => {
    loadPortfolioData();
    
    // Set up real-time updates
    const interval = setInterval(() => {
      loadPortfolioData();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const loadPortfolioData = async () => {
    try {
      const [walletBalance, transactionHistory] = await Promise.all([
        api.wallet.getBalance(),
        api.wallet.getTransactions(),
      ]);

      setBalance(walletBalance);
      setTransactions(transactionHistory);

      // Calculate assets and stats
      const assetData: Asset[] = [
        {
          symbol: 'LDT',
          name: 'LightDom Token',
          balance: walletBalance.ldt,
          value: walletBalance.ldt * 2.5, // Mock price
          change24h: 12.5,
          change7d: 28.3,
          allocation: 40,
        },
        {
          symbol: 'USD',
          name: 'US Dollar',
          balance: walletBalance.usd,
          value: walletBalance.usd,
          change24h: 0,
          change7d: 0,
          allocation: 30,
        },
        {
          symbol: 'BTC',
          name: 'Bitcoin',
          balance: walletBalance.btc,
          value: walletBalance.btc * 35000, // Mock price
          change24h: 5.2,
          change7d: 12.8,
          allocation: 20,
        },
        {
          symbol: 'ETH',
          name: 'Ethereum',
          balance: walletBalance.eth,
          value: walletBalance.eth * 2500, // Mock price
          change24h: 8.7,
          change7d: 15.4,
          allocation: 10,
        },
      ];

      setAssets(assetData);

      const totalValue = assetData.reduce((sum, asset) => sum + asset.value, 0);
      const totalChange24h = assetData.reduce((sum, asset) => sum + (asset.change24h * asset.allocation / 100), 0);
      const totalChange7d = assetData.reduce((sum, asset) => sum + (asset.change7d * asset.allocation / 100), 0);

      setStats({
        totalValue,
        totalChange24h,
        totalChange7d,
        bestPerformer: assetData.reduce((best, asset) => asset.change24h > best.change24h ? asset : best).symbol,
        worstPerformer: assetData.reduce((worst, asset) => asset.change24h < worst.change24h ? asset : worst).symbol,
      });
    } catch (error) {
      console.error('Failed to load portfolio data:', error);
    }
  };

  const handleSend = async (values: any) => {
    setLoading(true);
    try {
      await api.wallet.transfer(values.to, values.amount, selectedAsset);
      message.success('Transfer sent successfully!');
      setSendModalVisible(false);
      await loadPortfolioData();
    } catch (error) {
      console.error('Failed to send transfer:', error);
      message.error('Failed to send transfer');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    try {
      await loadPortfolioData();
      message.success('Portfolio refreshed');
    } catch (error) {
      message.error('Failed to refresh portfolio');
    } finally {
      setLoading(false);
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'mining': return <ThunderboltOutlined style={{ color: '#7c3aed' }} />;
      case 'optimization': return <RocketOutlined style={{ color: '#22c55e' }} />;
      case 'transfer': return <SendOutlined style={{ color: '#0ea5e9' }} />;
      case 'purchase': return <PlusOutlined style={{ color: '#f59e0b' }} />;
      default: return <InfoCircleOutlined style={{ color: '#737373' }} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#22c55e';
      case 'pending': return '#f59e0b';
      case 'failed': return '#ef4444';
      default: return '#737373';
    }
  };

  const assetColumns = [
    {
      title: 'Asset',
      dataIndex: 'symbol',
      key: 'symbol',
      render: (symbol: string, record: Asset) => (
        <Space>
          <Avatar style={{ backgroundColor: '#7c3aed' }}>
            {symbol.charAt(0)}
          </Avatar>
          <div>
            <div style={{ color: '#fafafa', fontWeight: 600 }}>{symbol}</div>
            <div style={{ color: '#737373', fontSize: '12px' }}>{record.name}</div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Balance',
      dataIndex: 'balance',
      key: 'balance',
      render: (balance: number, record: Asset) => (
        <div>
          <div style={{ color: '#fafafa', fontWeight: 600 }}>
            {showBalances ? balance.toFixed(4) : '••••••'}
          </div>
          <div style={{ color: '#737373', fontSize: '12px' }}>
            {showBalances ? `$${record.value.toFixed(2)}` : '••••••'}
          </div>
        </div>
      ),
    },
    {
      title: '24h Change',
      dataIndex: 'change24h',
      key: 'change24h',
      render: (change: number) => (
        <div style={{ color: change > 0 ? '#22c55e' : '#ef4444', fontWeight: 600 }}>
          {change > 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
          {Math.abs(change).toFixed(2)}%
        </div>
      ),
    },
    {
      title: '7d Change',
      dataIndex: 'change7d',
      key: 'change7d',
      render: (change: number) => (
        <div style={{ color: change > 0 ? '#22c55e' : '#ef4444', fontWeight: 600 }}>
          {change > 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
          {Math.abs(change).toFixed(2)}%
        </div>
      ),
    },
    {
      title: 'Allocation',
      dataIndex: 'allocation',
      key: 'allocation',
      render: (allocation: number) => (
        <div>
          <Progress
            percent={allocation}
            size="small"
            strokeColor="#7c3aed"
            format={() => `${allocation}%`}
          />
        </div>
      ),
    },
  ];

  const transactionColumns = [
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Space>
          {getTransactionIcon(type)}
          <Text style={{ color: '#fafafa', textTransform: 'capitalize' }}>{type}</Text>
        </Space>
      ),
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number, record: Transaction) => (
        <div style={{ color: amount > 0 ? '#22c55e' : '#ef4444', fontWeight: 600 }}>
          {amount > 0 ? '+' : ''}{amount} {record.currency}
        </div>
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
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (description: string) => (
        <Text style={{ color: '#a3a3a3' }}>{description}</Text>
      ),
    },
    {
      title: 'Time',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (timestamp: string) => (
        <Text style={{ color: '#737373' }}>
          {new Date(timestamp).toLocaleString()}
        </Text>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px', backgroundColor: '#0a0a0a', minHeight: '100vh' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Title level={2} style={{ color: '#fafafa', margin: 0, marginBottom: '8px' }}>
              Portfolio
            </Title>
            <Text style={{ color: '#a3a3a3', fontSize: '16px' }}>
              Manage your digital assets and track performance
            </Text>
          </div>
          
          <Space>
            <Button
              type="text"
              icon={showBalances ? <EyeOutlined /> : <EyeInvisibleOutlined />}
              onClick={() => setShowBalances(!showBalances)}
            >
              {showBalances ? 'Hide' : 'Show'} Balances
            </Button>
            
            <Button
              icon={<ReloadOutlined />}
              loading={loading}
              onClick={handleRefresh}
            >
              Refresh
            </Button>
            
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              style={{
                background: 'linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)',
                border: 'none',
              }}
            >
              Export
            </Button>
          </Space>
        </div>
      </div>

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="Overview" key="overview">
          {/* Portfolio Value Card */}
          <Card
            style={{
              backgroundColor: '#171717',
              border: '1px solid #404040',
              marginBottom: '32px',
              background: 'linear-gradient(135deg, #171717 0%, #262626 100%)',
            }}
          >
            <Row gutter={24} align="middle">
              <Col xs={24} md={8}>
                <Space direction="vertical" size="small">
                  <Text style={{ color: '#a3a3a3', fontSize: '14px' }}>Total Portfolio Value</Text>
                  <Statistic
                    value={stats.totalValue}
                    prefix="$"
                    precision={2}
                    valueStyle={{
                      color: '#fafafa',
                      fontSize: '36px',
                      fontWeight: 700,
                    }}
                  />
                </Space>
              </Col>
              
              <Col xs={24} md={8}>
                <Space direction="vertical" size="small">
                  <Text style={{ color: '#a3a3a3', fontSize: '14px' }}>24h Change</Text>
                  <Statistic
                    value={stats.totalChange24h}
                    precision={2}
                    suffix="%"
                    valueStyle={{
                      color: stats.totalChange24h > 0 ? '#22c55e' : '#ef4444',
                      fontSize: '24px',
                      fontWeight: 600,
                    }}
                    prefix={stats.totalChange24h > 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                  />
                </Space>
              </Col>
              
              <Col xs={24} md={8}>
                <Space direction="vertical" size="small">
                  <Text style={{ color: '#a3a3a3', fontSize: '14px' }}>7d Change</Text>
                  <Statistic
                    value={stats.totalChange7d}
                    precision={2}
                    suffix="%"
                    valueStyle={{
                      color: stats.totalChange7d > 0 ? '#22c55e' : '#ef4444',
                      fontSize: '24px',
                      fontWeight: 600,
                    }}
                    prefix={stats.totalChange7d > 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                  />
                </Space>
              </Col>
            </Row>
          </Card>

          {/* Quick Actions */}
          <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
            <Col xs={24} sm={12} md={6}>
              <Card
                hoverable
                style={{
                  backgroundColor: '#171717',
                  border: '1px solid #404040',
                  textAlign: 'center',
                  cursor: 'pointer',
                }}
                onClick={() => setSendModalVisible(true)}
              >
                <SendOutlined style={{ fontSize: '32px', color: '#0ea5e9', marginBottom: '16px' }} />
                <div>
                  <Title level={4} style={{ color: '#fafafa', margin: 0 }}>Send</Title>
                  <Text style={{ color: '#737373' }}>Transfer assets</Text>
                </div>
              </Card>
            </Col>
            
            <Col xs={24} sm={12} md={6}>
              <Card
                hoverable
                style={{
                  backgroundColor: '#171717',
                  border: '1px solid #404040',
                  textAlign: 'center',
                  cursor: 'pointer',
                }}
                onClick={() => setReceiveModalVisible(true)}
              >
                <ReceiveOutlined style={{ fontSize: '32px', color: '#22c55e', marginBottom: '16px' }} />
                <div>
                  <Title level={4} style={{ color: '#fafafa', margin: 0 }}>Receive</Title>
                  <Text style={{ color: '#737373' }}>Get deposit address</Text>
                </div>
              </Card>
            </Col>
            
            <Col xs={24} sm={12} md={6}>
              <Card
                hoverable
                style={{
                  backgroundColor: '#171717',
                  border: '1px solid #404040',
                  textAlign: 'center',
                  cursor: 'pointer',
                }}
              >
                <BarChartOutlined style={{ fontSize: '32px', color: '#f59e0b', marginBottom: '16px' }} />
                <div>
                  <Title level={4} style={{ color: '#fafafa', margin: 0 }}>Analytics</Title>
                  <Text style={{ color: '#737373' }}>View performance</Text>
                </div>
              </Card>
            </Col>
            
            <Col xs={24} sm={12} md={6}>
              <Card
                hoverable
                style={{
                  backgroundColor: '#171717',
                  border: '1px solid #404040',
                  textAlign: 'center',
                  cursor: 'pointer',
                }}
              >
                <SettingOutlined style={{ fontSize: '32px', color: '#8b5cf6', marginBottom: '16px' }} />
                <div>
                  <Title level={4} style={{ color: '#fafafa', margin: 0 }}>Settings</Title>
                  <Text style={{ color: '#737373' }}>Manage preferences</Text>
                </div>
              </Card>
            </Col>
          </Row>

          {/* Assets Overview */}
          <Card
            title="Assets"
            style={{ backgroundColor: '#171717', border: '1px solid #404040' }}
            headStyle={{ borderBottom: '1px solid #404040' }}
          >
            <Table
              columns={assetColumns}
              dataSource={assets}
              rowKey="symbol"
              pagination={false}
              style={{
                backgroundColor: '#171717',
              }}
            />
          </Card>
        </TabPane>

        <TabPane tab="Transactions" key="transactions">
          <Card
            title="Transaction History"
            style={{ backgroundColor: '#171717', border: '1px solid #404040' }}
            headStyle={{ borderBottom: '1px solid #404040' }}
          >
            <Table
              columns={transactionColumns}
              dataSource={transactions}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `Total ${total} transactions`,
              }}
              style={{
                backgroundColor: '#171717',
              }}
            />
          </Card>
        </TabPane>

        <TabPane tab="Analytics" key="analytics">
          <Row gutter={[24, 24]}>
            <Col xs={24} lg={12}>
              <Card
                title="Performance Chart"
                style={{ backgroundColor: '#171717', border: '1px solid #404040' }}
                headStyle={{ borderBottom: '1px solid #404040' }}
              >
                <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ color: '#737373' }}>Portfolio performance chart will be displayed here</Text>
                </div>
              </Card>
            </Col>

            <Col xs={24} lg={12}>
              <Card
                title="Asset Allocation"
                style={{ backgroundColor: '#171717', border: '1px solid #404040' }}
                headStyle={{ borderBottom: '1px solid #404040' }}
              >
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  {assets.map((asset) => (
                    <div key={asset.symbol}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <Text style={{ color: '#fafafa' }}>{asset.symbol}</Text>
                        <Text style={{ color: '#a3a3a3' }}>{asset.allocation}%</Text>
                      </div>
                      <Progress percent={asset.allocation} strokeColor="#7c3aed" showInfo={false} />
                    </div>
                  ))}
                </Space>
              </Card>
            </Col>
          </Row>
        </TabPane>
      </Tabs>

      {/* Send Modal */}
      <Modal
        title="Send Assets"
        open={sendModalVisible}
        onCancel={() => setSendModalVisible(false)}
        footer={null}
        style={{ backgroundColor: '#171717' }}
      >
        <Form onFinish={handleSend} layout="vertical">
          <Form.Item label="Asset" name="asset" initialValue="LDT">
            <Select value={selectedAsset} onChange={setSelectedAsset}>
              {assets.map((asset) => (
                <Option key={asset.symbol} value={asset.symbol}>
                  {asset.symbol} - {asset.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Recipient Address"
            name="to"
            rules={[{ required: true, message: 'Please enter recipient address' }]}
          >
            <Input placeholder="0x..." style={{ backgroundColor: '#262626', border: '1px solid #404040' }} />
          </Form.Item>

          <Form.Item
            label="Amount"
            name="amount"
            rules={[{ required: true, message: 'Please enter amount' }]}
          >
            <InputNumber
              placeholder="0.00"
              style={{ width: '100%', backgroundColor: '#262626', border: '1px solid #404040' }}
              min={0}
              precision={4}
            />
          </Form.Item>

          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => setSendModalVisible(false)}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                Send
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Receive Modal */}
      <Modal
        title="Receive Assets"
        open={receiveModalVisible}
        onCancel={() => setReceiveModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setReceiveModalVisible(false)}>
            Close
          </Button>,
          <Button key="copy" type="primary">
            Copy Address
          </Button>,
        ]}
        style={{ backgroundColor: '#171717' }}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div>
            <Text style={{ color: '#a3a3a3', display: 'block', marginBottom: '8px' }}>
              Your deposit address
            </Text>
            <Input
              value="0x1234567890abcdef1234567890abcdef12345678"
              readOnly
              style={{ backgroundColor: '#262626', border: '1px solid #404040' }}
            />
          </div>

          <Alert
            message="Important"
            description="Only send {selectedAsset} to this address. Sending other assets may result in permanent loss."
            type="warning"
            showIcon
          />
        </Space>
      </Modal>
    </div>
  );
};

export default PortfolioPage;
