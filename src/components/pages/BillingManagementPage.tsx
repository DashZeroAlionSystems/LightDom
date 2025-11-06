/**
 * Billing Management Page - Admin Only
 * Comprehensive billing, subscription, and payment management
 */

import React, { useState, useEffect } from 'react';
import {
  Layout,
  Card,
  Row,
  Col,
  Typography,
  Space,
  Table,
  Button,
  Input,
  Select,
  Tag,
  Avatar,
  Modal,
  Form,
  message,
  Tooltip,
  Badge,
  Progress,
  Statistic,
  Tabs,
  DatePicker,
  Drawer,
  List,
  Timeline,
  Alert,
  InputNumber,
} from 'antd';
import {
  WalletOutlined,
  DollarOutlined,
  CreditCardOutlined,
  BankOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  DownloadOutlined,
  UploadOutlined,
  ReloadOutlined,
  ExportOutlined,
  ImportOutlined,
  BarChartOutlined,
  LineChartOutlined,
  PieChartOutlined,
  HeatMapOutlined,
  RadarChartOutlined,
  StockOutlined,
  FireOutlined,
  RocketOutlined,
  ToolOutlined,
  ControlOutlined,
  DeploymentUnitOutlined,
  HddOutlined,
  CloudServerOutlined,
  SafetyOutlined,
  AuditOutlined,
  HistoryOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  WarningOutlined,
  SearchOutlined,
  FilterOutlined,
  SortAscendingOutlined,
  PrinterOutlined,
  FileTextOutlined,
  SettingOutlined,
  BellOutlined,
  MessageOutlined,
  HeartOutlined,
  StarOutlined,
  LikeOutlined,
  RetweetOutlined,
  ShareAltOutlined,
  GiftOutlined,
  CrownOutlined,
  TrophyOutlined,
  DiamondOutlined,
  GoldOutlined,
  SilverOutlined,
  BronzeOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';

import {
  EnhancedCard,
  EnhancedButton,
  EnhancedStatistic,
  EnhancedProgress,
  EnhancedTag,
  EnhancedAvatar,
  EnhancedInput,
} from '../DesignSystemComponents';
import {
  getSpacing,
  getFlexStyle,
  getGridStyle,
} from '../../utils/StyleUtils';

const { Header, Content } = Layout;
const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;
const { Search } = Input;
const { RangePicker } = DatePicker;

const BillingManagementPage: React.FC = () => {
  const [billingData, setBillingData] = useState({
    totalRevenue: 45678,
    monthlyRevenue: 12345,
    activeSubscriptions: 142,
    pendingInvoices: 12,
    churnRate: 2.3,
    averageRevenuePerUser: 89.50,
  });

  const [subscriptions, setSubscriptions] = useState([
    {
      id: '1',
      user: 'John Doe',
      plan: 'Professional',
      status: 'Active',
      amount: 99.00,
      billingCycle: 'Monthly',
      nextBilling: '2024-02-15',
      startDate: '2024-01-15',
    },
    {
      id: '2',
      user: 'Jane Smith',
      plan: 'Enterprise',
      status: 'Active',
      amount: 299.00,
      billingCycle: 'Monthly',
      nextBilling: '2024-02-10',
      startDate: '2024-01-10',
    },
    {
      id: '3',
      user: 'Bob Johnson',
      plan: 'Starter',
      status: 'Cancelled',
      amount: 29.00,
      billingCycle: 'Monthly',
      nextBilling: 'N/A',
      startDate: '2023-12-01',
    },
    {
      id: '4',
      user: 'Alice Brown',
      plan: 'Professional',
      status: 'Active',
      amount: 99.00,
      billingCycle: 'Annual',
      nextBilling: '2025-01-20',
      startDate: '2024-01-20',
    },
  ]);

  const [invoices, setInvoices] = useState([
    {
      id: 'INV-001',
      user: 'John Doe',
      amount: 99.00,
      status: 'Paid',
      dueDate: '2024-01-15',
      paidDate: '2024-01-14',
      plan: 'Professional',
    },
    {
      id: 'INV-002',
      user: 'Jane Smith',
      amount: 299.00,
      status: 'Pending',
      dueDate: '2024-01-25',
      paidDate: 'N/A',
      plan: 'Enterprise',
    },
    {
      id: 'INV-003',
      user: 'Bob Johnson',
      amount: 29.00,
      status: 'Overdue',
      dueDate: '2024-01-10',
      paidDate: 'N/A',
      plan: 'Starter',
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedSubscription, setSelectedSubscription] = useState<any>(null);
  const [subscriptionModalVisible, setSubscriptionModalVisible] = useState(false);
  const [invoiceModalVisible, setInvoiceModalVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPlan, setFilterPlan] = useState('all');

  const subscriptionColumns = [
    {
      title: 'User',
      dataIndex: 'user',
      key: 'user',
      render: (user: string) => (
        <Space>
          <EnhancedAvatar text={user.substring(0, 2).toUpperCase()} size="small" />
          <Text strong>{user}</Text>
        </Space>
      ),
    },
    {
      title: 'Plan',
      dataIndex: 'plan',
      key: 'plan',
      render: (plan: string) => {
        const planConfig = {
          Starter: { color: 'green', icon: <GiftOutlined /> },
          Professional: { color: 'blue', icon: <StarOutlined /> },
          Enterprise: { color: 'purple', icon: <CrownOutlined /> },
        };
        const config = planConfig[plan as keyof typeof planConfig];
        return (
          <EnhancedTag color={config.color} icon={config.icon}>
            {plan}
          </EnhancedTag>
        );
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <EnhancedTag color={status === 'Active' ? 'success' : status === 'Cancelled' ? 'default' : 'warning'}>
          {status}
        </EnhancedTag>
      ),
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => (
        <Text strong>${amount.toFixed(2)}</Text>
      ),
    },
    {
      title: 'Billing Cycle',
      dataIndex: 'billingCycle',
      key: 'billingCycle',
    },
    {
      title: 'Next Billing',
      dataIndex: 'nextBilling',
      key: 'nextBilling',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: any) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => {
                setSelectedSubscription(record);
                setSubscriptionModalVisible(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Edit Subscription">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => message.info('Edit subscription feature coming soon')}
            />
          </Tooltip>
          <Tooltip title="Cancel Subscription">
            <Button
              type="text"
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => {
                Modal.confirm({
                  title: 'Cancel Subscription',
                  content: `Are you sure you want to cancel ${record.user}'s subscription?`,
                  onOk() {
                    message.success('Subscription cancelled successfully');
                  },
                });
              }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const invoiceColumns = [
    {
      title: 'Invoice ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'User',
      dataIndex: 'user',
      key: 'user',
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => (
        <Text strong>${amount.toFixed(2)}</Text>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusConfig = {
          Paid: { color: 'success' },
          Pending: { color: 'warning' },
          Overdue: { color: 'error' },
        };
        return (
          <EnhancedTag color={statusConfig[status as keyof typeof statusConfig]}>
            {status}
          </EnhancedTag>
        );
      },
    },
    {
      title: 'Due Date',
      dataIndex: 'dueDate',
      key: 'dueDate',
    },
    {
      title: 'Paid Date',
      dataIndex: 'paidDate',
      key: 'paidDate',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: any) => (
        <Space>
          <Tooltip title="View Invoice">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => {
                setSelectedSubscription(record);
                setInvoiceModalVisible(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Download Invoice">
            <Button
              type="text"
              size="small"
              icon={<DownloadOutlined />}
              onClick={() => message.info('Downloading invoice...')}
            />
          </Tooltip>
          <Tooltip title="Send Reminder">
            <Button
              type="text"
              size="small"
              icon={<MessageOutlined />}
              onClick={() => message.info('Reminder sent successfully')}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const filteredSubscriptions = subscriptions.filter(sub => {
    const matchesSearch = sub.user.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || sub.status === filterStatus;
    const matchesPlan = filterPlan === 'all' || sub.plan === filterPlan;
    return matchesSearch && matchesStatus && matchesPlan;
  });

  const handleGenerateInvoice = () => {
    message.loading('Generating invoice...', 0);
    setTimeout(() => {
      message.destroy();
      message.success('Invoice generated successfully');
    }, 1500);
  };

  const handleExportData = () => {
    message.loading('Exporting billing data...', 0);
    setTimeout(() => {
      message.destroy();
      message.success('Billing data exported successfully');
    }, 1500);
  };

  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <Header style={{
        background: '#fff',
        borderBottom: '1px solid #e8e8e8',
        padding: getSpacing(4),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={getFlexStyle('row', 'flex-start', 'center')}>
          <WalletOutlined style={{
            fontSize: '24px',
            color: '#1890ff',
            marginRight: getSpacing(3),
          }} />
          <Title level={3} style={{ margin: 0 }}>
            Billing Management
          </Title>
        </div>
        <Space>
          <EnhancedButton
            variant="ghost"
            icon={<ExportOutlined />}
            onClick={handleExportData}
          >
            Export
          </EnhancedButton>
          <EnhancedButton
            variant="primary"
            icon={<PlusOutlined />}
            onClick={handleGenerateInvoice}
          >
            Generate Invoice
          </EnhancedButton>
        </Space>
      </Header>

      <Content style={{ padding: getSpacing(6) }}>
        {/* Billing Statistics */}
        <Row gutter={[getSpacing(6), getSpacing(6)]} style={{ marginBottom: getSpacing(6) }}>
          <Col xs={24} sm={12} md={6}>
            <EnhancedCard variant="elevated" animation="fadeIn">
              <EnhancedStatistic
                title="Total Revenue"
                value={billingData.totalRevenue}
                trend="up"
                trendValue={15.3}
                prefix="$"
                color="success"
              />
            </EnhancedCard>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <EnhancedCard variant="elevated" animation="fadeIn">
              <EnhancedStatistic
                title="Monthly Revenue"
                value={billingData.monthlyRevenue}
                trend="up"
                trendValue={8.7}
                prefix="$"
                color="primary"
              />
            </EnhancedCard>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <EnhancedCard variant="elevated" animation="fadeIn">
              <EnhancedStatistic
                title="Active Subscriptions"
                value={billingData.activeSubscriptions}
                trend="up"
                trendValue={12}
                color="warning"
              />
            </EnhancedCard>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <EnhancedCard variant="elevated" animation="fadeIn">
              <EnhancedStatistic
                title="Pending Invoices"
                value={billingData.pendingInvoices}
                trend="down"
                trendValue={3}
                color="secondary"
              />
            </EnhancedCard>
          </Col>
        </Row>

        {/* Billing Management Tabs */}
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="Subscriptions" key="subscriptions">
            <EnhancedCard 
              title="Subscription Management" 
              variant="elevated"
              extra={
                <Space>
                  <Search
                    placeholder="Search subscriptions..."
                    allowClear
                    style={{ width: 200 }}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Select
                    value={filterStatus}
                    onChange={setFilterStatus}
                    style={{ width: 120 }}
                  >
                    <Option value="all">All Status</Option>
                    <Option value="Active">Active</Option>
                    <Option value="Cancelled">Cancelled</Option>
                  </Select>
                  <Select
                    value={filterPlan}
                    onChange={setFilterPlan}
                    style={{ width: 120 }}
                  >
                    <Option value="all">All Plans</Option>
                    <Option value="Starter">Starter</Option>
                    <Option value="Professional">Professional</Option>
                    <Option value="Enterprise">Enterprise</Option>
                  </Select>
                </Space>
              }
            >
              <Table
                columns={subscriptionColumns}
                dataSource={filteredSubscriptions}
                rowKey="id"
                pagination={{ 
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                }}
                size="middle"
              />
            </EnhancedCard>
          </TabPane>

          <TabPane tab="Invoices" key="invoices">
            <EnhancedCard title="Invoice Management" variant="elevated">
              <Table
                columns={invoiceColumns}
                dataSource={invoices}
                rowKey="id"
                pagination={{ 
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                }}
                size="middle"
              />
            </EnhancedCard>
          </TabPane>

          <TabPane tab="Analytics" key="analytics">
            <Row gutter={[getSpacing(6), getSpacing(6)]}>
              <Col span={12}>
                <EnhancedCard title="Revenue Trends" variant="elevated">
                  <div style={{
                    height: '300px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#fafafa',
                    borderRadius: '8px',
                  }}>
                    <Space direction="vertical" alignItems="center">
                      <LineChartOutlined style={{ fontSize: '48px', color: '#d1d5db' }} />
                      <Text type="secondary">Revenue chart coming soon</Text>
                    </Space>
                  </div>
                </EnhancedCard>
              </Col>
              <Col span={12}>
                <EnhancedCard title="Subscription Distribution" variant="elevated">
                  <div style={{
                    height: '300px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#fafafa',
                    borderRadius: '8px',
                  }}>
                    <Space direction="vertical" alignItems="center">
                      <PieChartOutlined style={{ fontSize: '48px', color: '#d1d5db' }} />
                      <Text type="secondary">Distribution chart coming soon</Text>
                    </Space>
                  </div>
                </EnhancedCard>
              </Col>
            </Row>
          </TabPane>

          <TabPane tab="Payment Methods" key="payment-methods">
            <EnhancedCard title="Payment Methods" variant="elevated">
              <Alert
                message="Payment Methods Management"
                description="Configure and manage payment methods, gateways, and processing settings."
                type="info"
                showIcon
                style={{ marginBottom: '16px' }}
              />
              <Space direction="vertical" style={{ width: '100%' }} size="large">
                <div style={getFlexStyle('row', 'space-between', 'center')}>
                  <Space>
                    <CreditCardOutlined />
                    <Text strong>Credit Card Processing</Text>
                  </Space>
                  <Switch defaultChecked />
                </div>
                <div style={getFlexStyle('row', 'space-between', 'center')}>
                  <Space>
                    <BankOutlined />
                    <Text strong>Bank Transfer</Text>
                  </Space>
                  <Switch defaultChecked />
                </div>
                <div style={getFlexStyle('row', 'space-between', 'center')}>
                  <Space>
                    <DollarOutlined />
                    <Text strong>PayPal Integration</Text>
                  </Space>
                  <Switch />
                </div>
                <div style={getFlexStyle('row', 'space-between', 'center')}>
                  <Space>
                    <WalletOutlined />
                    <Text strong>Crypto Payments</Text>
                  </Space>
                  <Switch />
                </div>
              </Space>
            </EnhancedCard>
          </TabPane>
        </Tabs>
      </Content>

      {/* Subscription Details Modal */}
      <Modal
        title="Subscription Details"
        open={subscriptionModalVisible}
        onCancel={() => setSubscriptionModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setSubscriptionModalVisible(false)}>
            Close
          </Button>,
          <EnhancedButton key="edit" variant="primary" onClick={() => message.info('Edit feature coming soon')}>
            Edit Subscription
          </EnhancedButton>,
        ]}
        width={600}
      >
        {selectedSubscription && (
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <Row gutter={16}>
              <Col span={12}>
                <div>
                  <Text strong>User</Text>
                  <br />
                  <Text>{selectedSubscription.user}</Text>
                </div>
              </Col>
              <Col span={12}>
                <div>
                  <Text strong>Plan</Text>
                  <br />
                  <EnhancedTag color="blue">{selectedSubscription.plan}</EnhancedTag>
                </div>
              </Col>
            </Row>
            
            <Row gutter={16}>
              <Col span={12}>
                <div>
                  <Text strong>Status</Text>
                  <br />
                  <EnhancedTag color={selectedSubscription.status === 'Active' ? 'success' : 'default'}>
                    {selectedSubscription.status}
                  </EnhancedTag>
                </div>
              </Col>
              <Col span={12}>
                <div>
                  <Text strong>Amount</Text>
                  <br />
                  <Text strong>${selectedSubscription.amount.toFixed(2)}</Text>
                </div>
              </Col>
            </Row>
            
            <Row gutter={16}>
              <Col span={12}>
                <div>
                  <Text strong>Billing Cycle</Text>
                  <br />
                  <Text>{selectedSubscription.billingCycle}</Text>
                </div>
              </Col>
              <Col span={12}>
                <div>
                  <Text strong>Next Billing</Text>
                  <br />
                  <Text>{selectedSubscription.nextBilling}</Text>
                </div>
              </Col>
            </Row>
            
            <div>
              <Text strong>Start Date</Text>
              <br />
              <Text>{selectedSubscription.startDate}</Text>
            </div>
          </Space>
        )}
      </Modal>

      {/* Invoice Details Modal */}
      <Modal
        title="Invoice Details"
        open={invoiceModalVisible}
        onCancel={() => setInvoiceModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setInvoiceModalVisible(false)}>
            Close
          </Button>,
          <EnhancedButton key="download" variant="primary" icon={<DownloadOutlined />}>
            Download Invoice
          </EnhancedButton>,
        ]}
        width={600}
      >
        {selectedSubscription && (
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <div style={{ textAlign: 'center' }}>
              <Title level={4}>Invoice {selectedSubscription.id}</Title>
              <Text type="secondary">Generated on {dayjs().format('MMMM DD, YYYY')}</Text>
            </div>
            
            <Row gutter={16}>
              <Col span={12}>
                <div>
                  <Text strong>Billed To</Text>
                  <br />
                  <Text>{selectedSubscription.user}</Text>
                </div>
              </Col>
              <Col span={12}>
                <div>
                  <Text strong>Plan</Text>
                  <br />
                  <Text>{selectedSubscription.plan}</Text>
                </div>
              </Col>
            </Row>
            
            <Row gutter={16}>
              <Col span={12}>
                <div>
                  <Text strong>Amount</Text>
                  <br />
                  <Text strong>${selectedSubscription.amount.toFixed(2)}</Text>
                </div>
              </Col>
              <Col span={12}>
                <div>
                  <Text strong>Status</Text>
                  <br />
                  <EnhancedTag color={selectedSubscription.status === 'Paid' ? 'success' : selectedSubscription.status === 'Pending' ? 'warning' : 'error'}>
                    {selectedSubscription.status}
                  </EnhancedTag>
                </div>
              </Col>
            </Row>
            
            <Row gutter={16}>
              <Col span={12}>
                <div>
                  <Text strong>Due Date</Text>
                  <br />
                  <Text>{selectedSubscription.dueDate}</Text>
                </div>
              </Col>
              <Col span={12}>
                <div>
                  <Text strong>Paid Date</Text>
                  <br />
                  <Text>{selectedSubscription.paidDate}</Text>
                </div>
              </Col>
            </Row>
          </Space>
        )}
      </Modal>
    </Layout>
  );
};

export default BillingManagementPage;
