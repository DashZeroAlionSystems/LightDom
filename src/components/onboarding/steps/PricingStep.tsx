/**
 * Pricing Step - Professional pricing with conversion optimization
 * Research-based pricing tiers for SEO-as-a-Service
 */

import React, { useState } from 'react';
import { Card, Button, Space, Typography, Row, Col, Tag, List, Switch, message } from 'antd';
import {
  CheckCircleOutlined,
  CrownOutlined,
  RocketOutlined,
  ThunderboltOutlined,
  StarOutlined
} from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

interface PricingStepProps {
  currentPlan: string;
  onSelectPlan: (plan: string) => void;
  onNext: () => void;
  onPrevious: () => void;
}

interface PricingPlan {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  icon: React.ReactNode;
  color: string;
  popular?: boolean;
  features: string[];
  limits: {
    websites: number | string;
    reports: number | string;
    attributes: number;
    users: number;
  };
}

const PricingStep: React.FC<PricingStepProps> = ({
  currentPlan,
  onSelectPlan,
  onNext,
  onPrevious
}) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedPlan, setSelectedPlan] = useState(currentPlan);

  const plans: PricingPlan[] = [
    {
      id: 'free',
      name: 'Free Trial',
      description: 'Perfect for testing the platform',
      monthlyPrice: 0,
      yearlyPrice: 0,
      icon: <RocketOutlined />,
      color: '#8c8c8c',
      features: [
        'One-time SEO report',
        'Basic 50 attributes',
        'No ongoing monitoring',
        'Community support',
        '7-day report access'
      ],
      limits: {
        websites: 1,
        reports: 1,
        attributes: 50,
        users: 1
      }
    },
    {
      id: 'starter',
      name: 'Starter',
      description: 'For small businesses and startups',
      monthlyPrice: 49,
      yearlyPrice: 470, // ~20% discount
      icon: <ThunderboltOutlined />,
      color: '#1890ff',
      features: [
        'Up to 3 websites',
        'Weekly SEO reports',
        '120 attributes monitored',
        'Basic recommendations',
        'Email support',
        'Export reports (PDF)',
        'Google Analytics integration'
      ],
      limits: {
        websites: 3,
        reports: '4/month',
        attributes: 120,
        users: 2
      }
    },
    {
      id: 'professional',
      name: 'Professional',
      description: 'Most popular for growing businesses',
      monthlyPrice: 149,
      yearlyPrice: 1430, // ~20% discount
      icon: <StarOutlined />,
      color: '#52c41a',
      popular: true,
      features: [
        'Up to 10 websites',
        'Daily SEO reports',
        'Full 192 attributes',
        'AI-powered recommendations',
        'Automated fixes',
        'Priority support',
        'Custom alerts',
        'White-label reports',
        'API access',
        'Competitor analysis'
      ],
      limits: {
        websites: 10,
        reports: 'Daily',
        attributes: 192,
        users: 5
      }
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      description: 'For agencies and large organizations',
      monthlyPrice: 499,
      yearlyPrice: 4790, // ~20% discount
      icon: <CrownOutlined />,
      color: '#722ed1',
      features: [
        'Unlimited websites',
        'Real-time monitoring',
        'Full 192 attributes + custom',
        'Advanced AI recommendations',
        'Automated fixes & deployment',
        'Dedicated account manager',
        'Custom integrations',
        'White-label platform',
        'Full API access',
        'Advanced backlink campaigns',
        'Custom training',
        'SLA guarantee',
        '24/7 premium support'
      ],
      limits: {
        websites: 'Unlimited',
        reports: 'Real-time',
        attributes: 192,
        users: 'Unlimited'
      }
    }
  ];

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId);
    onSelectPlan(planId);
  };

  const handleContinue = async () => {
    if (!selectedPlan) {
      message.warning('Please select a plan to continue');
      return;
    }

    if (selectedPlan === 'free') {
      // Free plan - skip payment, go directly to script setup
      message.info('You can upgrade anytime from your dashboard');
      onNext();
    } else {
      // Paid plan - proceed to payment
      onNext();
    }
  };

  const getPrice = (plan: PricingPlan) => {
    return billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
  };

  const getSavings = (plan: PricingPlan) => {
    if (billingCycle === 'yearly' && plan.monthlyPrice > 0) {
      const yearlySavings = (plan.monthlyPrice * 12) - plan.yearlyPrice;
      return Math.round(yearlySavings);
    }
    return 0;
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <Title level={2}>Choose Your Plan</Title>
        <Paragraph style={{ fontSize: 16, color: '#666' }}>
          Start with a free trial or choose a plan that fits your needs.
          All paid plans include a 14-day money-back guarantee.
        </Paragraph>

        <Space style={{ marginTop: 16 }}>
          <Text>Monthly</Text>
          <Switch
            checked={billingCycle === 'yearly'}
            onChange={(checked) => setBillingCycle(checked ? 'yearly' : 'monthly')}
          />
          <Text>Yearly</Text>
          <Tag color="success">Save up to 20%</Tag>
        </Space>
      </div>

      <Row gutter={[24, 24]}>
        {plans.map((plan) => {
          const price = getPrice(plan);
          const savings = getSavings(plan);
          const isSelected = selectedPlan === plan.id;

          return (
            <Col key={plan.id} xs={24} sm={12} lg={6}>
              <Card
                hoverable
                style={{
                  height: '100%',
                  border: isSelected ? `2px solid ${plan.color}` : '1px solid #d9d9d9',
                  borderRadius: 12,
                  position: 'relative',
                  transition: 'all 0.3s ease'
                }}
                bodyStyle={{ padding: 24 }}
              >
                {plan.popular && (
                  <div style={{
                    position: 'absolute',
                    top: -12,
                    right: 20,
                    background: plan.color,
                    color: 'white',
                    padding: '4px 16px',
                    borderRadius: 12,
                    fontSize: 12,
                    fontWeight: 'bold'
                  }}>
                    MOST POPULAR
                  </div>
                )}

                <Space direction="vertical" style={{ width: '100%' }} size="large">
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 48, color: plan.color, marginBottom: 8 }}>
                      {plan.icon}
                    </div>
                    <Title level={4} style={{ margin: 0 }}>{plan.name}</Title>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {plan.description}
                    </Text>
                  </div>

                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 40, fontWeight: 'bold', color: plan.color }}>
                      ${price}
                    </div>
                    <Text type="secondary">
                      {billingCycle === 'monthly' ? '/month' : '/year'}
                    </Text>
                    {savings > 0 && (
                      <div>
                        <Tag color="success" style={{ marginTop: 8 }}>
                          Save ${savings}/year
                        </Tag>
                      </div>
                    )}
                  </div>

                  <List
                    size="small"
                    dataSource={plan.features}
                    renderItem={(feature) => (
                      <List.Item style={{ border: 'none', padding: '4px 0' }}>
                        <CheckCircleOutlined style={{ color: plan.color, marginRight: 8 }} />
                        <Text style={{ fontSize: 13 }}>{feature}</Text>
                      </List.Item>
                    )}
                  />

                  <Button
                    type={isSelected ? 'primary' : 'default'}
                    size="large"
                    block
                    onClick={() => handleSelectPlan(plan.id)}
                    style={{
                      background: isSelected ? plan.color : undefined,
                      borderColor: plan.color
                    }}
                  >
                    {isSelected ? 'Selected' : 'Select Plan'}
                  </Button>
                </Space>
              </Card>
            </Col>
          );
        })}
      </Row>

      <Card style={{ marginTop: 32, background: '#f0f7ff', borderColor: '#1890ff' }}>
        <Row gutter={[24, 24]}>
          <Col xs={24} md={8}>
            <Space direction="vertical" align="center" style={{ width: '100%' }}>
              <CheckCircleOutlined style={{ fontSize: 32, color: '#52c41a' }} />
              <Title level={5} style={{ margin: 0 }}>14-Day Money-Back</Title>
              <Text type="secondary" style={{ textAlign: 'center', fontSize: 12 }}>
                Not satisfied? Get a full refund, no questions asked
              </Text>
            </Space>
          </Col>
          <Col xs={24} md={8}>
            <Space direction="vertical" align="center" style={{ width: '100%' }}>
              <ThunderboltOutlined style={{ fontSize: 32, color: '#1890ff' }} />
              <Title level={5} style={{ margin: 0 }}>Instant Setup</Title>
              <Text type="secondary" style={{ textAlign: 'center', fontSize: 12 }}>
                Start analyzing in minutes with our simple installation
              </Text>
            </Space>
          </Col>
          <Col xs={24} md={8}>
            <Space direction="vertical" align="center" style={{ width: '100%' }}>
              <CrownOutlined style={{ fontSize: 32, color: '#faad14' }} />
              <Title level={5} style={{ margin: 0 }}>Cancel Anytime</Title>
              <Text type="secondary" style={{ textAlign: 'center', fontSize: 12 }}>
                No long-term contracts. Cancel or change plans anytime
              </Text>
            </Space>
          </Col>
        </Row>
      </Card>

      <div style={{ textAlign: 'center', marginTop: 32 }}>
        <Space size="middle">
          <Button onClick={onPrevious} size="large">
            Back
          </Button>
          <Button 
            type="primary" 
            size="large" 
            onClick={handleContinue}
            disabled={!selectedPlan}
          >
            Continue
          </Button>
        </Space>
      </div>
    </div>
  );
};

export default PricingStep;
