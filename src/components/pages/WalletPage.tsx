/**
 * Wallet Page - Digital Assets Management
 */

import React, { useState } from 'react';
import {
  Card,
  Row,
  Col,
  Typography,
  Button,
  Statistic,
  Table,
  Tag,
  Space,
  Tabs,
  List,
  Avatar,
  Divider,
  Input,
  Select,
  Modal,
  message,
} from 'antd';
import {
  WalletOutlined,
  SendOutlined,
  ArrowDownOutlined,
  SwapOutlined,
  PlusOutlined,
  MinusOutlined,
  TrophyOutlined,
  RocketOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

interface Transaction {
  id: string;
  type: 'send' | 'receive' | 'mining' | 'reward';
  amount: number;
  address: string;
  status: 'completed' | 'pending' | 'failed';
  timestamp: string;
  description: string;
}

const WalletPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [sendModalVisible, setSendModalVisible] = useState(false);
  const [receiveModalVisible, setReceiveModalVisible] = useState(false);

  const [balance] = useState({
    total: 1.234567,
    available: 0.987654,
    pending: 0.123456,
    staked: 0.123456,
  });

  const [transactions] = useState<Transaction[]>([
    {
      id: '1',
      type: 'mining',
      amount: 0.000123,
      address: 'Mining Reward',
      status: 'completed',
      timestamp: '2 minutes ago',
      description: 'Block mining reward',
    },
    {
      id: '2',
      type: 'receive',
      amount: 0.045678,
      address: '0x742d...8921',
      status: 'completed',
      timestamp: '1 hour ago',
      description: 'Transfer from external wallet',
    },
    {
      id: '3',
      type: 'send',
      amount: -0.012345,
      address: '0x8f3c...1234',
      status: 'pending',
      timestamp: '3 hours ago',
      description: 'Payment to service provider',
    },
    {
      id: '4',
      type: 'reward',
      amount: 0.001234,
      address: 'Staking Reward',
      status: 'completed',
      timestamp: '1 day ago',
      description: 'Daily staking reward',
    },
  ]);

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'mining': return <TrophyOutlined style={{ color: '#f59e0b' }} />;
      case 'receive': return <PlusOutlined style={{ color: '#10b981' }} />;
      case 'send': return <MinusOutlined style={{ color: '#ef4444' }} />;
      case 'reward': return <RocketOutlined style={{ color: '#7c3aed' }} />;
      default: return <WalletOutlined />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#10b981';
      case 'pending': return '#f59e0b';
      case 'failed': return '#ef4444';
      default: return '#666666';
    }
  };

  const transactionColumns = [
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Space>
          {getTransactionIcon(type)}
          <Text style={{ color: '#ffffff', textTransform: 'capitalize' }}>
            {type}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => (
        <Text style={{ 
          color: amount > 0 ? '#10b981' : '#ef4444',
          fontWeight: 'bold'
        }}>
          {amount > 0 ? '+' : ''}{amount.toFixed(6)}
        </Text>
      ),
    },
    {
      title: 'Address',
      dataIndex: 'address',
      key: 'address',
      render: (address: string) => (
        <Text style={{ color: '#a0a0a0' }}>
          {address}
        </Text>
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
      title: 'Time',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (time: string) => (
        <Text style={{ color: '#a0a0a0' }}>
          {time}
        </Text>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2} style={{ color: '#ffffff', margin: 0 }}>
          Wallet
        </Title>
        <Text style={{ color: '#a0a0a0' }}>
          Manage your digital assets and transactions
        </Text>
      </div>

      {/* Balance Overview */}
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <Card 
            title="Total Balance"
            style={{
              backgroundColor: '#1a1a1a',
              border: '1px solid #333333',
              borderRadius: '12px',
              height: '180px',
              padding: '16px',
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <Statistic
                value={balance.total}
                precision={6}
                prefix={<WalletOutlined style={{ color: '#7c3aed', fontSize: '14px' }} />}
                valueStyle={{ color: '#7c3aed', fontSize: '20px' }}
                titleStyle={{ fontSize: '11px', color: '#a0a0a0' }}
              />
            </div>
            <div style={{ marginTop: '8px' }}>
              <Row gutter={[8, 8]}>
                <Col span={8}>
                  <div style={{ textAlign: 'center' }}>
                    <Text style={{ color: '#a0a0a0', fontSize: '9px', display: 'block' }}>Available</Text>
                    <Text style={{ color: '#10b981', fontSize: '11px', fontWeight: 'bold' }}>{balance.available.toFixed(6)}</Text>
                  </div>
                </Col>
                <Col span={8}>
                  <div style={{ textAlign: 'center' }}>
                    <Text style={{ color: '#a0a0a0', fontSize: '9px', display: 'block' }}>Pending</Text>
                    <Text style={{ color: '#f59e0b', fontSize: '11px', fontWeight: 'bold' }}>{balance.pending.toFixed(6)}</Text>
                  </div>
                </Col>
                <Col span={8}>
                  <div style={{ textAlign: 'center' }}>
                    <Text style={{ color: '#a0a0a0', fontSize: '9px', display: 'block' }}>Staked</Text>
                    <Text style={{ color: '#3b82f6', fontSize: '11px', fontWeight: 'bold' }}>{balance.staked.toFixed(6)}</Text>
                  </div>
                </Col>
              </Row>
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card 
            title="Quick Actions"
            style={{
              backgroundColor: '#1a1a1a',
              border: '1px solid #333333',
              borderRadius: '12px',
              height: '220px',
              padding: '16px',
            }}
            headStyle={{ 
              padding: '12px 16px', 
              minHeight: '48px',
              marginBottom: '0px'
            }}
          >
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '10px', 
              height: 'calc(100% - 48px)',
              justifyContent: 'center',
              padding: '0px'
            }}>
              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={() => setSendModalVisible(true)}
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  borderRadius: '6px',
                  height: '32px',
                  fontSize: '11px',
                  fontWeight: '500',
                  boxShadow: '0 2px 6px rgba(102, 126, 234, 0.3)',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 3px 8px rgba(102, 126, 234, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0px)';
                  e.currentTarget.style.boxShadow = '0 2px 6px rgba(102, 126, 234, 0.3)';
                }}
              >
                Send
              </Button>
              <Button
                icon={<ArrowDownOutlined />}
                onClick={() => setReceiveModalVisible(true)}
                style={{
                  background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                  border: 'none',
                  color: 'white',
                  borderRadius: '6px',
                  height: '32px',
                  fontSize: '11px',
                  fontWeight: '500',
                  boxShadow: '0 2px 6px rgba(17, 153, 142, 0.3)',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 3px 8px rgba(17, 153, 142, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0px)';
                  e.currentTarget.style.boxShadow = '0 2px 6px rgba(17, 153, 142, 0.3)';
                }}
              >
                Receive
              </Button>
              <Button
                icon={<SwapOutlined />}
                style={{
                  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  border: 'none',
                  color: 'white',
                  borderRadius: '6px',
                  height: '32px',
                  fontSize: '11px',
                  fontWeight: '500',
                  boxShadow: '0 2px 6px rgba(240, 147, 251, 0.3)',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 3px 8px rgba(240, 147, 251, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0px)';
                  e.currentTarget.style.boxShadow = '0 2px 6px rgba(240, 147, 251, 0.3)';
                }}
              >
                Swap
              </Button>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Transactions */}
      <Card 
        title="Recent Transactions"
        style={{
          backgroundColor: '#1a1a1a',
          border: '1px solid #333333',
          borderRadius: '12px',
          marginTop: '24px',
        }}
      >
        <Table
          columns={transactionColumns}
          dataSource={transactions}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          style={{ marginTop: '16px' }}
        />
      </Card>

      {/* Send Modal */}
      <Modal
        title="Send Funds"
        open={sendModalVisible}
        onCancel={() => setSendModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setSendModalVisible(false)}>
            Cancel
          </Button>,
          <Button key="send" type="primary" onClick={() => {
            message.success('Transaction sent successfully!');
            setSendModalVisible(false);
          }}>
            Send
          </Button>,
        ]}
        style={{
          background: '#1a1a1a',
        }}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <div>
            <Text strong style={{ color: '#ffffff' }}>Recipient Address</Text>
            <Input placeholder="0x..." style={{ marginTop: '8px' }} />
          </div>
          <div>
            <Text strong style={{ color: '#ffffff' }}>Amount</Text>
            <Input
              type="number"
              placeholder="0.000000"
              style={{ marginTop: '8px' }}
              suffix="LIGHT"
            />
          </div>
          <div>
            <Text strong style={{ color: '#ffffff' }}>Network Fee</Text>
            <Select defaultValue="standard" style={{ width: '100%', marginTop: '8px' }}>
              <Option value="standard">Standard (0.0001 LIGHT)</Option>
              <Option value="fast">Fast (0.0002 LIGHT)</Option>
              <Option value="instant">Instant (0.0005 LIGHT)</Option>
            </Select>
          </div>
        </Space>
      </Modal>

      {/* Receive Modal */}
      <Modal
        title="Receive Funds"
        open={receiveModalVisible}
        onCancel={() => setReceiveModalVisible(false)}
        footer={[
          <Button key="close" type="primary" onClick={() => setReceiveModalVisible(false)}>
            Close
          </Button>,
        ]}
        style={{
          background: '#1a1a1a',
        }}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="large" align="center">
          <div>
            <Text strong style={{ color: '#ffffff' }}>Your Wallet Address</Text>
            <div style={{
              background: '#2a2a2a',
              border: '1px solid #333333',
              borderRadius: '8px',
              padding: '16px',
              marginTop: '8px',
              textAlign: 'center',
            }}>
              <Text code style={{ color: '#ffffff', fontSize: '14px' }}>
                0x742d35Cc6634C0532925a3b8D4C9db96c4b4Db45
              </Text>
            </div>
          </div>
          <Button
            type="primary"
            onClick={() => {
              navigator.clipboard.writeText('0x742d35Cc6634C0532925a3b8D4C9db96c4b4Db45');
              message.success('Address copied to clipboard!');
            }}
          >
            Copy Address
          </Button>
        </Space>
      </Modal>
    </div>
  );
};

export default WalletPage;
