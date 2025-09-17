import React, { useState } from 'react';
import {
  Card,
  Row,
  Col,
  Button,
  Table,
  Tag,
  // Progress,
  Modal,
  Form,
  Input,
  Select,
  message,
  Space,
  Typography,
  Tabs,
  List,
  Avatar,
  Tooltip,
  // Badge,
  Alert,
  Spin,
  // Empty,
  Statistic,
  Timeline,
  Divider,
  QRCode,
} from 'antd';
import {
  WalletOutlined,
  PlusOutlined,
  SendOutlined,
  SwapOutlined,
  HistoryOutlined,
  TrophyOutlined,
  GiftOutlined,
  SettingOutlined,
  EyeOutlined,
  CopyOutlined,
  // DownloadOutlined,
  ShareAltOutlined,
  // InfoCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { useWallet } from '../../hooks/useWallet';
import { useBlockchain } from '@/hooks/useBlockchain';
import { useAuth } from '../../hooks/useAuth';
import './WalletDashboard.css';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

interface WalletDashboardProps {
  className?: string;
}

const WalletDashboard: React.FC<WalletDashboardProps> = ({ className }) => {
  const {
    /* user */
  } = useAuth();
  const {
    wallet,
    transactions,
    tokens,
    sendTokens,
    // receiveTokens,
    claimRewards,
    loading: walletLoading,
  } = useWallet();
  const {
    connectWallet,
    // disconnectWallet,
    isConnected,
    // networkInfo
  } = useBlockchain();

  const [isSendModalVisible, setIsSendModalVisible] = useState(false);
  const [isReceiveModalVisible, setIsReceiveModalVisible] = useState(false);
  const [isClaimModalVisible, setIsClaimModalVisible] = useState(false);
  const [sendForm] = Form.useForm();
  const [claimForm] = Form.useForm();

  // Wallet stats
  const walletStats = {
    totalBalance: tokens?.reduce((sum, token) => sum + token.balance, 0) || 0,
    totalValue: tokens?.reduce((sum, token) => sum + token.balance * token.price, 0) || 0,
    pendingRewards: wallet?.pendingRewards || 0,
    totalEarned: wallet?.totalEarned || 0,
  };

  // Transaction columns
  const transactionColumns: any[] = [
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag color={getTransactionTypeColor(type)} icon={getTransactionTypeIcon(type)}>
          {type}
        </Tag>
      ),
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number, record: any) => (
        <div className='amount-cell'>
          <Text strong style={{ color: record.type === 'received' ? '#52c41a' : '#f5222d' }}>
            {record.type === 'received' ? '+' : '-'}
            {amount} {record.token}
          </Text>
          <br />
          <Text type='secondary'>${(amount * record.price).toFixed(2)}</Text>
        </div>
      ),
    },
    {
      title: 'From/To',
      dataIndex: 'address',
      key: 'address',
      render: (address: string) => (
        <div className='address-cell'>
          <Text code className='address-text'>
            {address.slice(0, 6)}...{address.slice(-4)}
          </Text>
          <Button
            type='text'
            size='small'
            icon={<CopyOutlined />}
            onClick={() => handleCopyAddress(address)}
          />
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)} icon={getStatusIcon(status)}>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => <Text type='secondary'>{formatDate(date)}</Text>,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: unknown, record: any) => (
        <Space>
          <Tooltip title='View Details'>
            <Button type='text' icon={<EyeOutlined />} onClick={() => handleViewTransaction()} />
          </Tooltip>
          <Tooltip title='View on Explorer'>
            <Button
              type='text'
              icon={<ShareAltOutlined />}
              onClick={() => handleViewOnExplorer(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const getTransactionTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      sent: 'red',
      received: 'green',
      reward: 'blue',
      swap: 'orange',
      stake: 'purple',
    };
    return colors[type] || 'default';
  };

  const getTransactionTypeIcon = (type: string) => {
    const icons: Record<string, React.ReactElement> = {
      sent: <SendOutlined />,
      received: <WalletOutlined />,
      reward: <TrophyOutlined />,
      swap: <SwapOutlined />,
      stake: <SettingOutlined />,
    };
    return icons[type];
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'processing',
      confirmed: 'success',
      failed: 'error',
    };
    return colors[status] || 'default';
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, React.ReactElement> = {
      pending: <ClockCircleOutlined />,
      confirmed: <CheckCircleOutlined />,
      failed: <ExclamationCircleOutlined />,
    };
    return icons[status];
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString();
  };

  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    message.success('Address copied to clipboard');
  };

  const handleSendTokens = async (values: any) => {
    try {
      await sendTokens({
        recipient: values.recipient,
        amount: Number(values.amount),
        token: values.token,
      });
      message.success('Tokens sent successfully');
      setIsSendModalVisible(false);
      sendForm.resetFields();
    } catch (error) {
      message.error('Failed to send tokens');
    }
  };

  const handleClaimRewards = async (values: any) => {
    try {
      await claimRewards(values.amount);
      message.success('Rewards claimed successfully');
      setIsClaimModalVisible(false);
      claimForm.resetFields();
    } catch (error) {
      message.error('Failed to claim rewards');
    }
  };

  const handleViewTransaction = () => {
    // Implement transaction details view
    message.info('Transaction details coming soon');
  };

  const handleViewOnExplorer = (transaction: any) => {
    window.open(`https://etherscan.io/tx/${transaction.hash}`, '_blank');
  };

  if (walletLoading) {
    return (
      <div className='wallet-dashboard-loading'>
        <Spin size='large' />
        <Text>Loading wallet data...</Text>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className='wallet-connect'>
        <Card className='connect-card'>
          <div className='connect-content'>
            <WalletOutlined className='connect-icon' />
            <Title level={3}>Connect Your Wallet</Title>
            <Paragraph type='secondary'>
              Connect your wallet to view your tokens, transactions, and manage your LightDom
              assets.
            </Paragraph>
            <Button type='primary' size='large' onClick={connectWallet} className='connect-button'>
              Connect Wallet
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className={`wallet-dashboard ${className || ''}`}>
      {/* Header */}
      <Card className='dashboard-header' bordered={false}>
        <Row align='middle' justify='space-between'>
          <Col>
            <Title level={2}>Wallet & Tokens</Title>
            <Paragraph type='secondary'>Manage your LightDom tokens and transactions</Paragraph>
          </Col>
          <Col>
            <Space>
              <Button icon={<HistoryOutlined />}>Transaction History</Button>
              <Button
                type='primary'
                icon={<PlusOutlined />}
                onClick={() => setIsReceiveModalVisible(true)}
              >
                Receive
              </Button>
              <Button icon={<SendOutlined />} onClick={() => setIsSendModalVisible(true)}>
                Send
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Wallet Stats */}
      <Row gutter={[24, 24]} className='wallet-stats-row'>
        <Col xs={24} sm={12} lg={6}>
          <Card className='stat-card'>
            <Statistic
              title='Total Balance'
              value={walletStats.totalBalance}
              suffix='LDT'
              prefix={<WalletOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className='stat-card'>
            <Statistic
              title='Total Value'
              value={walletStats.totalValue}
              prefix='$'
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className='stat-card'>
            <Statistic
              title='Pending Rewards'
              value={walletStats.pendingRewards}
              suffix='LDT'
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className='stat-card'>
            <Statistic
              title='Total Earned'
              value={walletStats.totalEarned}
              suffix='LDT'
              prefix={<GiftOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Content */}
      <Tabs defaultActiveKey='tokens' className='wallet-tabs'>
        <TabPane tab='Tokens' key='tokens'>
          <Row gutter={[24, 24]}>
            <Col xs={24} lg={16}>
              <Card title='Your Tokens' className='tokens-card'>
                <List
                  dataSource={tokens}
                  renderItem={token => (
                    <List.Item className='token-item'>
                      <List.Item.Meta
                        avatar={<Avatar icon={<WalletOutlined />} />}
                        title={
                          <div className='token-title'>
                            <Text strong>{token.name}</Text>
                            <Tag color='blue'>{token.symbol}</Tag>
                          </div>
                        }
                        description={
                          <div className='token-description'>
                            <Text type='secondary'>
                              Balance: {token.balance} {token.symbol}
                            </Text>
                            <br />
                            <Text type='secondary'>
                              Value: ${(token.balance * token.price).toFixed(2)}
                            </Text>
                          </div>
                        }
                      />
                      <div className='token-actions'>
                        <Space>
                          <Button size='small' icon={<SendOutlined />}>
                            Send
                          </Button>
                          <Button size='small' icon={<SwapOutlined />}>
                            Swap
                          </Button>
                        </Space>
                      </div>
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
            <Col xs={24} lg={8}>
              <Card title='Quick Actions' className='quick-actions-card'>
                <Space direction='vertical' size='middle' style={{ width: '100%' }}>
                  <Button block size='large' type='primary' icon={<SendOutlined />}>
                    Send Tokens
                  </Button>
                  <Button block size='large' icon={<SwapOutlined />}>
                    Swap Tokens
                  </Button>
                  <Button block size='large' icon={<TrophyOutlined />}>
                    Claim Rewards
                  </Button>
                  <Button block size='large' icon={<SettingOutlined />}>
                    Wallet Settings
                  </Button>
                </Space>
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane tab='Transactions' key='transactions'>
          <Card className='transactions-card'>
            <Table
              columns={transactionColumns}
              dataSource={transactions}
              rowKey='id'
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} transactions`,
              }}
              loading={walletLoading}
            />
          </Card>
        </TabPane>

        <TabPane tab='Rewards' key='rewards'>
          <Row gutter={[24, 24]}>
            <Col xs={24} lg={16}>
              <Card title='Reward History' className='rewards-card'>
                <Timeline>
                  {wallet?.rewardHistory?.map((reward, index) => (
                    <Timeline.Item
                      key={index}
                      dot={<TrophyOutlined style={{ color: '#faad14' }} />}
                    >
                      <div className='reward-item'>
                        <Text strong>{reward.type}</Text>
                        <br />
                        <Text type='secondary'>+{reward.amount} LDT</Text>
                        <br />
                        <Text type='secondary' className='reward-date'>
                          {formatDate(reward.date)}
                        </Text>
                      </div>
                    </Timeline.Item>
                  ))}
                </Timeline>
              </Card>
            </Col>
            <Col xs={24} lg={8}>
              <Card title='Claim Rewards' className='claim-rewards-card'>
                <div className='claim-content'>
                  <Statistic
                    title='Available Rewards'
                    value={walletStats.pendingRewards}
                    suffix='LDT'
                    valueStyle={{ color: '#faad14' }}
                  />
                  <Divider />
                  <Button
                    type='primary'
                    size='large'
                    block
                    icon={<TrophyOutlined />}
                    onClick={() => setIsClaimModalVisible(true)}
                    disabled={walletStats.pendingRewards === 0}
                  >
                    Claim All Rewards
                  </Button>
                </div>
              </Card>
            </Col>
          </Row>
        </TabPane>
      </Tabs>

      {/* Send Tokens Modal */}
      <Modal
        title='Send Tokens'
        open={isSendModalVisible}
        onOk={() => sendForm.submit()}
        onCancel={() => setIsSendModalVisible(false)}
        width={500}
      >
        <Form form={sendForm} layout='vertical' onFinish={handleSendTokens}>
          <Form.Item
            name='token'
            label='Token'
            rules={[{ required: true, message: 'Please select a token' }]}
          >
            <Select placeholder='Select token'>
              {tokens?.map(token => (
                <Option key={token.symbol} value={token.symbol}>
                  {token.name} ({token.symbol})
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name='recipient'
            label='Recipient Address'
            rules={[{ required: true, message: 'Please enter recipient address' }]}
          >
            <Input placeholder='0x...' />
          </Form.Item>

          <Form.Item
            name='amount'
            label='Amount'
            rules={[{ required: true, message: 'Please enter amount' }]}
          >
            <Input type='number' placeholder='0.00' />
          </Form.Item>
        </Form>
      </Modal>

      {/* Receive Tokens Modal */}
      <Modal
        title='Receive Tokens'
        open={isReceiveModalVisible}
        onCancel={() => setIsReceiveModalVisible(false)}
        footer={null}
        width={400}
      >
        <div className='receive-content'>
          <div className='qr-code'>
            <QRCode value={wallet?.address || ''} size={200} />
          </div>
          <div className='address-section'>
            <Text strong>Your Address:</Text>
            <div className='address-display'>
              <Text code className='address-text'>
                {wallet?.address}
              </Text>
              <Button
                type='text'
                icon={<CopyOutlined />}
                onClick={() => handleCopyAddress(wallet?.address || '')}
              />
            </div>
          </div>
          <Alert message='Share this address to receive tokens' type='info' showIcon />
        </div>
      </Modal>

      {/* Claim Rewards Modal */}
      <Modal
        title='Claim Rewards'
        open={isClaimModalVisible}
        onOk={() => claimForm.submit()}
        onCancel={() => setIsClaimModalVisible(false)}
        width={400}
      >
        <Form form={claimForm} layout='vertical' onFinish={handleClaimRewards}>
          <Form.Item
            name='amount'
            label='Amount to Claim'
            initialValue={walletStats.pendingRewards}
            rules={[{ required: true, message: 'Please enter amount' }]}
          >
            <Input type='number' placeholder='0.00' />
          </Form.Item>

          <Alert message={`Available: ${walletStats.pendingRewards} LDT`} type='info' showIcon />
        </Form>
      </Modal>
    </div>
  );
};

export default WalletDashboard;
