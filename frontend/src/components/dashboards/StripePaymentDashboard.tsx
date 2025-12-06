import React, { useState, useEffect } from 'react';
import { Card, Tabs, Button, Table, Tag, Alert, Spin, Modal, Form, Input, Select, Radio, message, Statistic, Row, Col, Space, Typography, Descriptions } from 'antd';
import { CreditCardOutlined, DollarOutlined, CheckCircleOutlined, CloseCircleOutlined, ReloadOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { stripePaymentAPI } from '../../services/apiService';

const { TabPane } = Tabs;
const { Title, Text } = Typography;
const { Option } = Select;

const StripePaymentDashboard: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkoutForm] = Form.useForm();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [plansData, subsData, sessionsData, statsData] = await Promise.all([
        stripePaymentAPI.getPlans(),
        stripePaymentAPI.getSubscriptions().catch(() => ({ subscriptions: [] })),
        stripePaymentAPI.getSessions().catch(() => ({ sessions: [] })),
        stripePaymentAPI.getStats().catch(() => ({}))
      ]);

      setPlans(plansData.plans || []);
      setSubscriptions(subsData.subscriptions || []);
      setSessions(sessionsData.sessions || []);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading payment data:', error);
      message.error('Failed to load payment data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCheckout = async (values: any) => {
    try {
      const result = await stripePaymentAPI.createCheckoutSession(
        values.priceId,
        values.billingInterval,
        values.successUrl || `${window.location.origin}/payment/success`,
        values.cancelUrl || `${window.location.origin}/payment/cancel`
      );

      if (result.url) {
        // Redirect to Stripe Checkout
        window.location.href = result.url;
      } else {
        message.success('Checkout session created successfully');
        setShowCheckoutModal(false);
        checkoutForm.resetFields();
        loadDashboardData();
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      message.error('Failed to create checkout session');
    }
  };

  const handleCancelSubscription = async (subscriptionId: string) => {
    Modal.confirm({
      title: 'Cancel Subscription',
      content: 'Are you sure you want to cancel this subscription? This cannot be undone.',
      onOk: async () => {
        try {
          await stripePaymentAPI.cancelSubscription(subscriptionId);
          message.success('Subscription cancelled successfully');
          loadDashboardData();
        } catch (error) {
          console.error('Error cancelling subscription:', error);
          message.error('Failed to cancel subscription');
        }
      }
    });
  };

  const handleUpdatePayment = async (subscriptionId: string) => {
    try {
      const result = await stripePaymentAPI.updatePaymentMethod(subscriptionId);
      if (result.url) {
        window.location.href = result.url;
      }
    } catch (error) {
      console.error('Error updating payment:', error);
      message.error('Failed to update payment method');
    }
  };

  const subscriptionColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 150,
      ellipsis: true
    },
    {
      title: 'Customer',
      dataIndex: 'customer',
      key: 'customer',
      width: 150,
      ellipsis: true
    },
    {
      title: 'Plan',
      dataIndex: 'plan',
      key: 'plan',
      render: (plan: any) => plan?.nickname || plan?.product || 'N/A'
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const colorMap: any = {
          active: 'green',
          canceled: 'red',
          incomplete: 'orange',
          trialing: 'blue',
          past_due: 'red'
        };
        return <Tag color={colorMap[status] || 'default'}>{status?.toUpperCase()}</Tag>;
      }
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number, record: any) => `$${(amount / 100).toFixed(2)}/${record.interval || 'month'}`
    },
    {
      title: 'Current Period',
      key: 'period',
      render: (record: any) => {
        if (record.current_period_start && record.current_period_end) {
          return `${new Date(record.current_period_start * 1000).toLocaleDateString()} - ${new Date(record.current_period_end * 1000).toLocaleDateString()}`;
        }
        return 'N/A';
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: any) => (
        <Space>
          <Button size="small" onClick={() => handleUpdatePayment(record.id)}>
            Update Payment
          </Button>
          {record.status === 'active' && (
            <Button size="small" danger onClick={() => handleCancelSubscription(record.id)}>
              Cancel
            </Button>
          )}
        </Space>
      )
    }
  ];

  const sessionColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 150,
      ellipsis: true
    },
    {
      title: 'Customer',
      dataIndex: 'customer',
      key: 'customer',
      width: 150,
      ellipsis: true
    },
    {
      title: 'Amount',
      dataIndex: 'amount_total',
      key: 'amount_total',
      render: (amount: number) => `$${(amount / 100).toFixed(2)}`
    },
    {
      title: 'Status',
      dataIndex: 'payment_status',
      key: 'payment_status',
      render: (status: string) => {
        const colorMap: any = {
          paid: 'green',
          unpaid: 'orange',
          no_payment_required: 'blue'
        };
        return <Tag color={colorMap[status] || 'default'}>{status?.toUpperCase()}</Tag>;
      }
    },
    {
      title: 'Created',
      dataIndex: 'created',
      key: 'created',
      render: (timestamp: number) => new Date(timestamp * 1000).toLocaleString()
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>
        <CreditCardOutlined /> Stripe Payment Management
      </Title>

      <Tabs defaultActiveKey="overview">
        <TabPane tab="Overview" key="overview">
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Active Subscriptions"
                  value={stats.activeSubscriptions || 0}
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: '#3f8600' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Monthly Revenue"
                  value={stats.monthlyRevenue || 0}
                  prefix={<DollarOutlined />}
                  precision={2}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Total Customers"
                  value={stats.totalCustomers || 0}
                  prefix={<ShoppingCartOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Cancelled"
                  value={stats.cancelledSubscriptions || 0}
                  prefix={<CloseCircleOutlined />}
                  valueStyle={{ color: '#cf1322' }}
                />
              </Card>
            </Col>
          </Row>

          <Card
            title="Quick Actions"
            extra={
              <Button icon={<ReloadOutlined />} onClick={loadDashboardData}>
                Refresh
              </Button>
            }
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button
                type="primary"
                icon={<ShoppingCartOutlined />}
                onClick={() => setShowCheckoutModal(true)}
                size="large"
              >
                Create New Checkout Session
              </Button>
              <Alert
                message="Stripe Integration Active"
                description="Payment processing is configured and ready. All transactions are secure and PCI compliant."
                type="success"
                showIcon
              />
            </Space>
          </Card>
        </TabPane>

        <TabPane tab="Pricing Plans" key="plans">
          <Card title="Available Plans">
            <Row gutter={[16, 16]}>
              {plans.map((plan: any) => (
                <Col xs={24} sm={12} md={6} key={plan.id}>
                  <Card
                    hoverable
                    style={{ height: '100%' }}
                    actions={[
                      <Button
                        type="primary"
                        onClick={() => {
                          checkoutForm.setFieldsValue({ priceId: plan.stripePriceIdMonthly });
                          setShowCheckoutModal(true);
                        }}
                      >
                        Select Plan
                      </Button>
                    ]}
                  >
                    <Title level={4}>{plan.name}</Title>
                    <Title level={2} style={{ color: '#1890ff' }}>
                      ${(plan.priceMonthly / 100).toFixed(0)}
                      <Text type="secondary" style={{ fontSize: '16px' }}>/mo</Text>
                    </Title>
                    {plan.priceYearly && (
                      <Text type="secondary">
                        or ${(plan.priceYearly / 100 / 12).toFixed(2)}/mo billed yearly
                      </Text>
                    )}
                    <div style={{ marginTop: 16 }}>
                      {plan.features?.map((feature: string, idx: number) => (
                        <div key={idx} style={{ marginBottom: 8 }}>
                          <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                          {feature}
                        </div>
                      ))}
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
        </TabPane>

        <TabPane tab="Subscriptions" key="subscriptions">
          <Card
            title={`Subscriptions (${subscriptions.length})`}
            extra={
              <Button icon={<ReloadOutlined />} onClick={loadDashboardData}>
                Refresh
              </Button>
            }
          >
            <Table
              dataSource={subscriptions}
              columns={subscriptionColumns}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </TabPane>

        <TabPane tab="Checkout Sessions" key="sessions">
          <Card
            title={`Checkout Sessions (${sessions.length})`}
            extra={
              <Button icon={<ReloadOutlined />} onClick={loadDashboardData}>
                Refresh
              </Button>
            }
          >
            <Table
              dataSource={sessions}
              columns={sessionColumns}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </TabPane>

        <TabPane tab="Webhooks" key="webhooks">
          <Card title="Webhook Configuration">
            <Descriptions bordered column={1}>
              <Descriptions.Item label="Webhook Endpoint">
                {window.location.origin}/api/stripe/webhook
              </Descriptions.Item>
              <Descriptions.Item label="Events Listened">
                <ul>
                  <li>checkout.session.completed</li>
                  <li>customer.subscription.created</li>
                  <li>customer.subscription.updated</li>
                  <li>customer.subscription.deleted</li>
                  <li>invoice.payment_succeeded</li>
                  <li>invoice.payment_failed</li>
                </ul>
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color="green">ACTIVE</Tag>
              </Descriptions.Item>
            </Descriptions>

            <Alert
              style={{ marginTop: 16 }}
              message="Webhook Security"
              description="All webhook requests are verified using Stripe signature verification to ensure authenticity."
              type="info"
              showIcon
            />
          </Card>
        </TabPane>
      </Tabs>

      <Modal
        title="Create Checkout Session"
        open={showCheckoutModal}
        onCancel={() => {
          setShowCheckoutModal(false);
          checkoutForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={checkoutForm}
          layout="vertical"
          onFinish={handleCreateCheckout}
        >
          <Form.Item
            name="priceId"
            label="Select Plan"
            rules={[{ required: true, message: 'Please select a plan' }]}
          >
            <Select placeholder="Choose a pricing plan">
              {plans.map((plan: any) => (
                <Option key={plan.stripePriceIdMonthly} value={plan.stripePriceIdMonthly}>
                  {plan.name} - ${(plan.priceMonthly / 100).toFixed(0)}/month
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="billingInterval"
            label="Billing Interval"
            initialValue="monthly"
            rules={[{ required: true }]}
          >
            <Radio.Group>
              <Radio value="monthly">Monthly</Radio>
              <Radio value="yearly">Yearly (Save 20%)</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            name="successUrl"
            label="Success URL"
            tooltip="URL to redirect after successful payment (optional)"
          >
            <Input placeholder={`${window.location.origin}/payment/success`} />
          </Form.Item>

          <Form.Item
            name="cancelUrl"
            label="Cancel URL"
            tooltip="URL to redirect if payment is cancelled (optional)"
          >
            <Input placeholder={`${window.location.origin}/payment/cancel`} />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Create Checkout Session
              </Button>
              <Button onClick={() => {
                setShowCheckoutModal(false);
                checkoutForm.resetFields();
              }}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default StripePaymentDashboard;
