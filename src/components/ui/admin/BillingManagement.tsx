/**
 * Billing Management Component
 * Admin interface for managing billing and subscriptions
 */

import React, { useState } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Typography,
  Tag,
  Statistic,
  Row,
  Col,
  Select,
  DatePicker,
  Modal,
  Descriptions,
  Badge
} from 'antd';
import {
  WalletOutlined,
  DollarOutlined,
  CreditCardOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  DownloadOutlined,
  EyeOutlined,
  TrendingUpOutlined,
  TrendingDownOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

interface Transaction {
  id: string;
  date: Date;
  user: string;
  plan: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  method: string;
}

interface Subscription {
  id: string;
  user: string;
  plan: string;
  status: 'active' | 'cancelled' | 'expired';
  startDate: Date;
  nextBilling: Date;
  amount: number;
}

const BillingManagement: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: 'TXN001',
      date: new Date(),
      user: 'john@example.com',
      plan: 'Professional',
      amount: 49.99,
      status: 'completed',
      method: 'Credit Card'
    },
    {
      id: 'TXN002',
      date: new Date(Date.now() - 86400000),
      user: 'jane@example.com',
      plan: 'Enterprise',
      amount: 199.99,
      status: 'completed',
      method: 'PayPal'
    },
    {
      id: 'TXN003',
      date: new Date(Date.now() - 172800000),
      user: 'bob@example.com',
      plan: 'Starter',
      amount: 9.99,
      status: 'pending',
      method: 'Credit Card'
    },
    {
      id: 'TXN004',
      date: new Date(Date.now() - 259200000),
      user: 'alice@example.com',
      plan: 'Professional',
      amount: 49.99,
      status: 'failed',
      method: 'Credit Card'
    }
  ]);

  const [subscriptions, setSubscriptions] = useState<Subscription[]>([
    {
      id: 'SUB001',
      user: 'john@example.com',
      plan: 'Professional',
      status: 'active',
      startDate: new Date('2024-01-01'),
      nextBilling: new Date('2024-11-01'),
      amount: 49.99
    },
    {
      id: 'SUB002',
      user: 'jane@example.com',
      plan: 'Enterprise',
      status: 'active',
      startDate: new Date('2024-02-15'),
      nextBilling: new Date('2024-11-15'),
      amount: 199.99
    },
    {
      id: 'SUB003',
      user: 'bob@example.com',
      plan: 'Starter',
      status: 'active',
      startDate: new Date('2024-03-20'),
      nextBilling: new Date('2024-11-20'),
      amount: 9.99
    }
  ]);

  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'active':
        return 'success';
      case 'pending':
        return 'processing';
      case 'failed':
      case 'cancelled':
      case 'expired':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
      case 'active':
        return <CheckCircleOutlined />;
      case 'pending':
        return <ClockCircleOutlined />;
      case 'failed':
      case 'cancelled':
      case 'expired':
        return <CloseCircleOutlined />;
      default:
        return <ClockCircleOutlined />;
    }
  };

  const handleViewTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setDetailsModalVisible(true);
  };

  const transactionColumns = [
    {
      title: 'Transaction ID',
      dataIndex: 'id',
      key: 'id',
      render: (id: string) => <Text code>{id}</Text>
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date: Date) => date.toLocaleDateString()
    },
    {
      title: 'User',
      dataIndex: 'user',
      key: 'user'
    },
    {
      title: 'Plan',
      dataIndex: 'plan',
      key: 'plan'
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => <Text strong>${amount.toFixed(2)}</Text>
    },
    {
      title: 'Method',
      dataIndex: 'method',
      key: 'method'
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Badge
          status={getStatusColor(status) as any}
          text={status.toUpperCase()}
        />
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: Transaction) => (
        <Space>
          <Button
            type="text"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => handleViewTransaction(record)}
          />
          <Button
            type="text"
            icon={<DownloadOutlined />}
            size="small"
          />
        </Space>
      )
    }
  ];

  const subscriptionColumns = [
    {
      title: 'Subscription ID',
      dataIndex: 'id',
      key: 'id',
      render: (id: string) => <Text code>{id}</Text>
    },
    {
      title: 'User',
      dataIndex: 'user',
      key: 'user'
    },
    {
      title: 'Plan',
      dataIndex: 'plan',
      key: 'plan',
      render: (plan: string) => <Tag color="blue">{plan}</Tag>
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Badge
          status={getStatusColor(status) as any}
          text={status.toUpperCase()}
        />
      )
    },
    {
      title: 'Start Date',
      dataIndex: 'startDate',
      key: 'startDate',
      render: (date: Date) => date.toLocaleDateString()
    },
    {
      title: 'Next Billing',
      dataIndex: 'nextBilling',
      key: 'nextBilling',
      render: (date: Date) => date.toLocaleDateString()
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => <Text strong>${amount.toFixed(2)}/mo</Text>
    }
  ];

  const totalRevenue = transactions
    .filter(t => t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyRevenue = transactions
    .filter(t => t.status === 'completed' && t.date.getMonth() === new Date().getMonth())
    .reduce((sum, t) => sum + t.amount, 0);

  const activeSubscriptions = subscriptions.filter(s => s.status === 'active').length;

  return (
    <div>
      <Card style={{ marginBottom: '24px' }}>
        <Title level={3} style={{ marginBottom: '24px' }}>
          <WalletOutlined /> Billing Management
        </Title>

        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Total Revenue"
                value={totalRevenue}
                precision={2}
                prefix={<DollarOutlined />}
                valueStyle={{ color: '#3f8600' }}
                suffix={
                  <span style={{ fontSize: '14px' }}>
                    <TrendingUpOutlined style={{ color: '#52c41a' }} /> 15%
                  </span>
                }
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Monthly Revenue"
                value={monthlyRevenue}
                precision={2}
                prefix={<DollarOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Active Subscriptions"
                value={activeSubscriptions}
                prefix={<CreditCardOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Pending Transactions"
                value={transactions.filter(t => t.status === 'pending').length}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
        </Row>
      </Card>

      <Card style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <Title level={4} style={{ margin: 0 }}>
            Recent Transactions
          </Title>
          <Space>
            <Select
              defaultValue="all"
              style={{ width: 150 }}
            >
              <Select.Option value="all">All Status</Select.Option>
              <Select.Option value="completed">Completed</Select.Option>
              <Select.Option value="pending">Pending</Select.Option>
              <Select.Option value="failed">Failed</Select.Option>
            </Select>
            <RangePicker />
            <Button icon={<DownloadOutlined />}>Export</Button>
          </Space>
        </div>

        <Table
          columns={transactionColumns}
          dataSource={transactions}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showTotal: (total) => `Total ${total} transactions`
          }}
        />
      </Card>

      <Card>
        <Title level={4} style={{ marginBottom: '16px' }}>
          Active Subscriptions
        </Title>
        <Table
          columns={subscriptionColumns}
          dataSource={subscriptions}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showTotal: (total) => `Total ${total} subscriptions`
          }}
        />
      </Card>

      <Modal
        title="Transaction Details"
        open={detailsModalVisible}
        onCancel={() => setDetailsModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailsModalVisible(false)}>
            Close
          </Button>,
          <Button key="download" type="primary" icon={<DownloadOutlined />}>
            Download Receipt
          </Button>
        ]}
        width={600}
      >
        {selectedTransaction && (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Transaction ID">
              <Text code>{selectedTransaction.id}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Date">
              {selectedTransaction.date.toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label="User">
              {selectedTransaction.user}
            </Descriptions.Item>
            <Descriptions.Item label="Plan">
              <Tag color="blue">{selectedTransaction.plan}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Amount">
              <Text strong style={{ fontSize: '16px' }}>
                ${selectedTransaction.amount.toFixed(2)}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Payment Method">
              {selectedTransaction.method}
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              <Badge
                status={getStatusColor(selectedTransaction.status) as any}
                text={selectedTransaction.status.toUpperCase()}
              />
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default BillingManagement;
