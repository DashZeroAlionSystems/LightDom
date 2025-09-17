import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Button,
  Form,
  Input,
  Select,
  Radio,
  Typography,
  Space,
  Divider,
  Alert,
  Spin,
  Steps,
  Result,
  Modal,
  message,
} from 'antd';
import {
  CreditCardOutlined,
  WalletOutlined,
  CheckCircleOutlined,
  LockOutlined,
  TrophyOutlined,
  GlobalOutlined,
  OptimizationOutlined,
} from '@ant-design/icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import './PaymentPage.css';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { Step } = Steps;

interface PaymentPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: 'monthly' | 'yearly';
  features: string[];
  popular?: boolean;
  tokens: number;
  optimizations: number;
}

const PaymentPage: React.FC = () => {
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedPlan, setSelectedPlan] = useState<PaymentPlan | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [loading, setLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  const plans: PaymentPlan[] = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      currency: 'USD',
      interval: 'monthly',
      features: [
        '3 website optimizations per month',
        'Basic performance metrics',
        'Email support',
        'Community access',
      ],
      tokens: 100,
      optimizations: 3,
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 29,
      currency: 'USD',
      interval: 'monthly',
      features: [
        'Unlimited website optimizations',
        'Advanced performance metrics',
        'Priority support',
        'API access',
        'Custom optimization rules',
        'Team collaboration',
      ],
      popular: true,
      tokens: 1000,
      optimizations: -1, // unlimited
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 99,
      currency: 'USD',
      interval: 'monthly',
      features: [
        'Everything in Pro',
        'Dedicated account manager',
        'Custom integrations',
        'White-label options',
        'SLA guarantee',
        'On-premise deployment',
      ],
      tokens: 5000,
      optimizations: -1, // unlimited
    },
  ];

  const yearlyPlans = plans.map(plan => ({
    ...plan,
    price: Math.round(plan.price * 12 * 0.8), // 20% discount
    interval: 'yearly' as const,
  }));

  const allPlans = [...plans, ...yearlyPlans];

  useEffect(() => {
    const planId = searchParams.get('plan');
    if (planId) {
      const plan = allPlans.find(p => p.id === planId);
      if (plan) {
        setSelectedPlan(plan);
        setCurrentStep(1);
      }
    }
  }, [searchParams]);

  const handlePlanSelect = (plan: PaymentPlan) => {
    setSelectedPlan(plan);
    setCurrentStep(1);
  };

  const handlePayment = async (values: any) => {
    if (!selectedPlan) return;

    setLoading(true);
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // In a real app, you would integrate with a payment processor
      const paymentData = {
        plan: selectedPlan,
        paymentMethod,
        ...values,
      };

      // Mock successful payment
      setPaymentSuccess(true);
      setCurrentStep(2);

      // Redirect to dashboard after 3 seconds
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
    } catch (error) {
      message.error('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    {
      title: 'Select Plan',
      description: 'Choose your subscription plan',
    },
    {
      title: 'Payment Details',
      description: 'Enter your payment information',
    },
    {
      title: 'Confirmation',
      description: 'Complete your subscription',
    },
  ];

  if (paymentSuccess) {
    return (
      <div className='payment-success'>
        <Result
          status='success'
          title='Payment Successful!'
          subTitle='Your subscription has been activated. You can now access all features.'
          extra={[
            <Button type='primary' key='dashboard' onClick={() => navigate('/dashboard')}>
              Go to Dashboard
            </Button>,
          ]}
        />
      </div>
    );
  }

  return (
    <div className='payment-page'>
      <div className='payment-container'>
        <div className='payment-header'>
          <Title level={2}>Choose Your Plan</Title>
          <Paragraph type='secondary'>
            Unlock the full potential of LightDom with our powerful optimization tools
          </Paragraph>
        </div>

        <Steps current={currentStep} className='payment-steps'>
          {steps.map((step, index) => (
            <Step key={index} title={step.title} description={step.description} />
          ))}
        </Steps>

        <div className='payment-content'>
          {currentStep === 0 && (
            <div className='plan-selection'>
              <Row gutter={[24, 24]} justify='center'>
                {allPlans.map(plan => (
                  <Col xs={24} sm={12} lg={8} key={`${plan.id}-${plan.interval}`}>
                    <Card
                      className={`plan-card ${plan.popular ? 'popular' : ''}`}
                      hoverable
                      onClick={() => handlePlanSelect(plan)}
                    >
                      {plan.popular && (
                        <div className='popular-badge'>
                          <TrophyOutlined /> Most Popular
                        </div>
                      )}

                      <div className='plan-header'>
                        <Title level={3}>{plan.name}</Title>
                        <div className='plan-price'>
                          <span className='currency'>$</span>
                          <span className='amount'>{plan.price}</span>
                          <span className='interval'>/{plan.interval}</span>
                        </div>
                        {plan.interval === 'yearly' && (
                          <Text type='secondary' className='discount-text'>
                            Save 20% with yearly billing
                          </Text>
                        )}
                      </div>

                      <div className='plan-features'>
                        <div className='feature-item'>
                          <OptimizationOutlined />
                          <span>
                            {plan.optimizations === -1 ? 'Unlimited' : plan.optimizations}{' '}
                            optimizations
                          </span>
                        </div>
                        <div className='feature-item'>
                          <WalletOutlined />
                          <span>{plan.tokens.toLocaleString()} tokens included</span>
                        </div>
                        {plan.features.map((feature, index) => (
                          <div key={index} className='feature-item'>
                            <CheckCircleOutlined />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>

                      <Button
                        type={plan.popular ? 'primary' : 'default'}
                        size='large'
                        block
                        className='select-plan-btn'
                      >
                        {plan.price === 0 ? 'Get Started Free' : 'Select Plan'}
                      </Button>
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>
          )}

          {currentStep === 1 && selectedPlan && (
            <div className='payment-details'>
              <Row gutter={[24, 24]}>
                <Col xs={24} lg={16}>
                  <Card title='Payment Information' className='payment-form-card'>
                    <Form
                      form={form}
                      layout='vertical'
                      onFinish={handlePayment}
                      initialValues={{ paymentMethod: 'card' }}
                    >
                      <Form.Item label='Payment Method'>
                        <Radio.Group
                          value={paymentMethod}
                          onChange={e => setPaymentMethod(e.target.value)}
                        >
                          <Space direction='vertical'>
                            <Radio value='card'>
                              <Space>
                                <CreditCardOutlined />
                                Credit/Debit Card
                              </Space>
                            </Radio>
                            <Radio value='crypto'>
                              <Space>
                                <WalletOutlined />
                                Cryptocurrency
                              </Space>
                            </Radio>
                          </Space>
                        </Radio.Group>
                      </Form.Item>

                      {paymentMethod === 'card' && (
                        <>
                          <Form.Item
                            name='cardNumber'
                            label='Card Number'
                            rules={[{ required: true, message: 'Please enter card number' }]}
                          >
                            <Input placeholder='1234 5678 9012 3456' />
                          </Form.Item>

                          <Row gutter={16}>
                            <Col span={12}>
                              <Form.Item
                                name='expiryDate'
                                label='Expiry Date'
                                rules={[{ required: true, message: 'Please enter expiry date' }]}
                              >
                                <Input placeholder='MM/YY' />
                              </Form.Item>
                            </Col>
                            <Col span={12}>
                              <Form.Item
                                name='cvv'
                                label='CVV'
                                rules={[{ required: true, message: 'Please enter CVV' }]}
                              >
                                <Input placeholder='123' />
                              </Form.Item>
                            </Col>
                          </Row>

                          <Form.Item
                            name='cardholderName'
                            label='Cardholder Name'
                            rules={[{ required: true, message: 'Please enter cardholder name' }]}
                          >
                            <Input placeholder='John Doe' />
                          </Form.Item>
                        </>
                      )}

                      {paymentMethod === 'crypto' && (
                        <Alert
                          message='Cryptocurrency Payment'
                          description='You will be redirected to complete the payment with your preferred cryptocurrency wallet.'
                          type='info'
                          showIcon
                        />
                      )}

                      <Divider />

                      <div className='payment-summary'>
                        <Title level={4}>Order Summary</Title>
                        <div className='summary-item'>
                          <span>{selectedPlan.name} Plan</span>
                          <span>
                            ${selectedPlan.price}/{selectedPlan.interval}
                          </span>
                        </div>
                        <div className='summary-item'>
                          <span>Included Tokens</span>
                          <span>{selectedPlan.tokens.toLocaleString()}</span>
                        </div>
                        <Divider />
                        <div className='summary-total'>
                          <span>Total</span>
                          <span>
                            ${selectedPlan.price}/{selectedPlan.interval}
                          </span>
                        </div>
                      </div>

                      <Form.Item>
                        <Space>
                          <Button onClick={() => setCurrentStep(0)}>Back</Button>
                          <Button
                            type='primary'
                            htmlType='submit'
                            loading={loading}
                            size='large'
                            icon={<LockOutlined />}
                          >
                            Complete Payment
                          </Button>
                        </Space>
                      </Form.Item>
                    </Form>
                  </Card>
                </Col>

                <Col xs={24} lg={8}>
                  <Card title='Plan Details' className='plan-details-card'>
                    <div className='plan-info'>
                      <Title level={4}>{selectedPlan.name}</Title>
                      <div className='plan-price-display'>
                        <span className='currency'>$</span>
                        <span className='amount'>{selectedPlan.price}</span>
                        <span className='interval'>/{selectedPlan.interval}</span>
                      </div>

                      <div className='plan-features-list'>
                        {selectedPlan.features.map((feature, index) => (
                          <div key={index} className='feature-item'>
                            <CheckCircleOutlined />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card>
                </Col>
              </Row>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
