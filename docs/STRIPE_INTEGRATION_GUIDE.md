# Stripe Payment Integration Guide

## Overview

This guide provides complete implementation of Stripe payment processing for the LightDom platform, including subscription management, one-time payments, and webhook handling.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Stripe Account Setup](#stripe-account-setup)
3. [Database Schema](#database-schema)
4. [Stripe Service Implementation](#stripe-service-implementation)
5. [Subscription Management](#subscription-management)
6. [Webhook Integration](#webhook-integration)
7. [Payment UI Components](#payment-ui-components)
8. [Testing](#testing)
9. [Security Best Practices](#security-best-practices)

---

## Prerequisites

### Install Stripe SDK

```bash
npm install stripe @stripe/stripe-js @stripe/react-stripe-js
```

### Environment Variables

```bash
# Stripe Keys
STRIPE_SECRET_KEY=sk_test_your_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Stripe Products (create these in Stripe Dashboard)
STRIPE_PRODUCT_FREE=prod_free_tier
STRIPE_PRODUCT_PRO=prod_pro_tier
STRIPE_PRODUCT_ENTERPRISE=prod_enterprise_tier

# Price IDs
STRIPE_PRICE_PRO_MONTHLY=price_pro_monthly
STRIPE_PRICE_PRO_YEARLY=price_pro_yearly
STRIPE_PRICE_ENTERPRISE_MONTHLY=price_enterprise_monthly
STRIPE_PRICE_ENTERPRISE_YEARLY=price_enterprise_yearly
```

---

## Stripe Account Setup

### Step 1: Create Stripe Account

1. Sign up at [Stripe Dashboard](https://dashboard.stripe.com/)
2. Complete business verification
3. Get API keys from Developers → API keys

### Step 2: Create Products

```javascript
// Script to create products in Stripe
// scripts/setup-stripe-products.js

import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function setupProducts() {
  // Create Free Plan
  const freePlan = await stripe.products.create({
    name: 'Free Plan',
    description: 'Basic features for getting started',
    metadata: {
      plan_type: 'free',
      features: JSON.stringify([
        '1 project',
        'Basic analytics',
        'Community support'
      ])
    }
  });

  // Create Pro Plan
  const proPlan = await stripe.products.create({
    name: 'Pro Plan',
    description: 'Advanced features for professionals',
    metadata: {
      plan_type: 'pro',
      features: JSON.stringify([
        'Unlimited projects',
        'Advanced analytics',
        'Priority support',
        'Custom domains'
      ])
    }
  });

  // Create Pro Monthly Price
  const proMonthly = await stripe.prices.create({
    product: proPlan.id,
    unit_amount: 2900, // $29.00
    currency: 'usd',
    recurring: {
      interval: 'month'
    },
    metadata: {
      billing_cycle: 'monthly'
    }
  });

  // Create Pro Yearly Price (20% discount)
  const proYearly = await stripe.prices.create({
    product: proPlan.id,
    unit_amount: 27840, // $278.40 ($23.20/month)
    currency: 'usd',
    recurring: {
      interval: 'year'
    },
    metadata: {
      billing_cycle: 'yearly'
    }
  });

  // Create Enterprise Plan
  const enterprisePlan = await stripe.products.create({
    name: 'Enterprise Plan',
    description: 'Custom solutions for large teams',
    metadata: {
      plan_type: 'enterprise',
      features: JSON.stringify([
        'Everything in Pro',
        'Dedicated support',
        'SLA guarantees',
        'Custom integrations',
        'Advanced security'
      ])
    }
  });

  // Create Enterprise Prices
  const enterpriseMonthly = await stripe.prices.create({
    product: enterprisePlan.id,
    unit_amount: 9900, // $99.00
    currency: 'usd',
    recurring: {
      interval: 'month'
    }
  });

  console.log('Products created:', {
    freePlan: freePlan.id,
    proPlan: proPlan.id,
    enterprisePlan: enterprisePlan.id,
    prices: {
      proMonthly: proMonthly.id,
      proYearly: proYearly.id,
      enterpriseMonthly: enterpriseMonthly.id
    }
  });
}

setupProducts().catch(console.error);
```

---

## Database Schema

```sql
-- Already created in USER_CREATION_WORKFLOW.md
-- user_plans, user_subscriptions, payment_methods tables

-- Payment transactions
CREATE TABLE IF NOT EXISTS payment_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    stripe_payment_intent_id VARCHAR(255) UNIQUE,
    stripe_charge_id VARCHAR(255),
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'usd',
    status VARCHAR(50), -- 'succeeded', 'pending', 'failed', 'refunded'
    payment_method_id UUID REFERENCES payment_methods(id),
    description TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Stripe events log (for webhook processing)
CREATE TABLE IF NOT EXISTS stripe_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    stripe_event_id VARCHAR(255) UNIQUE NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    event_data JSONB NOT NULL,
    processed BOOLEAN DEFAULT false,
    processed_at TIMESTAMP WITH TIME ZONE,
    error TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Invoices
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES user_subscriptions(id),
    stripe_invoice_id VARCHAR(255) UNIQUE,
    amount_due DECIMAL(10, 2),
    amount_paid DECIMAL(10, 2),
    currency VARCHAR(3) DEFAULT 'usd',
    status VARCHAR(50), -- 'draft', 'open', 'paid', 'void', 'uncollectible'
    invoice_pdf VARCHAR(500),
    hosted_invoice_url VARCHAR(500),
    period_start TIMESTAMP WITH TIME ZONE,
    period_end TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_payment_transactions_user_id ON payment_transactions(user_id);
CREATE INDEX idx_payment_transactions_status ON payment_transactions(status);
CREATE INDEX idx_stripe_events_event_type ON stripe_events(event_type);
CREATE INDEX idx_stripe_events_processed ON stripe_events(processed);
CREATE INDEX idx_invoices_user_id ON invoices(user_id);
CREATE INDEX idx_invoices_subscription_id ON invoices(subscription_id);
```

---

## Stripe Service Implementation

```javascript
// services/stripe-payment-service.js
import Stripe from 'stripe';

export class StripePaymentService {
  constructor(dbPool) {
    this.db = dbPool;
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }

  /**
   * Create Stripe customer
   */
  async createCustomer(userId) {
    // Get user data
    const userResult = await this.db.query(
      'SELECT email, first_name, last_name, phone FROM users WHERE id = $1',
      [userId]
    );

    const user = userResult.rows[0];

    // Create Stripe customer
    const customer = await this.stripe.customers.create({
      email: user.email,
      name: `${user.first_name} ${user.last_name}`.trim(),
      phone: user.phone,
      metadata: {
        user_id: userId
      }
    });

    // Store customer ID
    await this.db.query(
      'UPDATE users SET metadata = metadata || $1 WHERE id = $2',
      [JSON.stringify({ stripe_customer_id: customer.id }), userId]
    );

    return customer;
  }

  /**
   * Get or create Stripe customer
   */
  async getOrCreateCustomer(userId) {
    const result = await this.db.query(
      "SELECT metadata->>'stripe_customer_id' as stripe_customer_id FROM users WHERE id = $1",
      [userId]
    );

    let customerId = result.rows[0]?.stripe_customer_id;

    if (!customerId) {
      const customer = await this.createCustomer(userId);
      customerId = customer.id;
    }

    return customerId;
  }

  /**
   * Create subscription
   */
  async createSubscription(userId, priceId, paymentMethodId = null) {
    const customerId = await this.getOrCreateCustomer(userId);

    // Get price details
    const price = await this.stripe.prices.retrieve(priceId);
    const product = await this.stripe.products.retrieve(price.product);

    const subscriptionParams = {
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: {
        save_default_payment_method: 'on_subscription'
      },
      expand: ['latest_invoice.payment_intent'],
      metadata: {
        user_id: userId
      }
    };

    if (paymentMethodId) {
      subscriptionParams.default_payment_method = paymentMethodId;
    }

    // Create Stripe subscription
    const subscription = await this.stripe.subscriptions.create(subscriptionParams);

    // Get plan from database
    const planResult = await this.db.query(
      'SELECT id FROM user_plans WHERE stripe_price_id_monthly = $1 OR stripe_price_id_yearly = $1',
      [priceId]
    );

    const planId = planResult.rows[0]?.id;

    // Save subscription to database
    await this.db.query(
      `INSERT INTO user_subscriptions 
       (user_id, plan_id, status, billing_cycle, current_period_start, current_period_end, 
        stripe_subscription_id, stripe_customer_id, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        userId,
        planId,
        subscription.status,
        price.recurring.interval === 'month' ? 'monthly' : 'yearly',
        new Date(subscription.current_period_start * 1000),
        new Date(subscription.current_period_end * 1000),
        subscription.id,
        customerId,
        JSON.stringify({ product_id: product.id })
      ]
    );

    return {
      subscription,
      clientSecret: subscription.latest_invoice.payment_intent?.client_secret
    };
  }

  /**
   * Update subscription
   */
  async updateSubscription(subscriptionId, updates) {
    const { priceId, cancelAtPeriodEnd } = updates;

    const updateParams = {};

    if (priceId) {
      // Get current subscription
      const subscription = await this.stripe.subscriptions.retrieve(subscriptionId);
      
      updateParams.items = [{
        id: subscription.items.data[0].id,
        price: priceId
      }];
      updateParams.proration_behavior = 'create_prorations';
    }

    if (cancelAtPeriodEnd !== undefined) {
      updateParams.cancel_at_period_end = cancelAtPeriodEnd;
    }

    const updatedSubscription = await this.stripe.subscriptions.update(
      subscriptionId,
      updateParams
    );

    // Update database
    await this.db.query(
      `UPDATE user_subscriptions 
       SET status = $1, cancel_at_period_end = $2, updated_at = CURRENT_TIMESTAMP
       WHERE stripe_subscription_id = $3`,
      [updatedSubscription.status, updatedSubscription.cancel_at_period_end, subscriptionId]
    );

    return updatedSubscription;
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(subscriptionId, immediately = false) {
    if (immediately) {
      await this.stripe.subscriptions.cancel(subscriptionId);
    } else {
      await this.stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true
      });
    }

    await this.db.query(
      `UPDATE user_subscriptions 
       SET status = $1, cancel_at_period_end = $2, updated_at = CURRENT_TIMESTAMP
       WHERE stripe_subscription_id = $3`,
      [immediately ? 'canceled' : 'active', !immediately, subscriptionId]
    );
  }

  /**
   * Add payment method
   */
  async addPaymentMethod(userId, paymentMethodId) {
    const customerId = await this.getOrCreateCustomer(userId);

    // Attach payment method to customer
    await this.stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId
    });

    // Get payment method details
    const paymentMethod = await this.stripe.paymentMethods.retrieve(paymentMethodId);

    // Save to database
    const result = await this.db.query(
      `INSERT INTO payment_methods 
       (user_id, stripe_payment_method_id, type, card_brand, card_last4, 
        card_exp_month, card_exp_year, is_default)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        userId,
        paymentMethodId,
        paymentMethod.type,
        paymentMethod.card?.brand,
        paymentMethod.card?.last4,
        paymentMethod.card?.exp_month,
        paymentMethod.card?.exp_year,
        true // Set as default for now
      ]
    );

    // Set as default payment method
    await this.stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId
      }
    });

    return result.rows[0];
  }

  /**
   * Create one-time payment
   */
  async createPayment(userId, amount, currency = 'usd', description = '') {
    const customerId = await this.getOrCreateCustomer(userId);

    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      customer: customerId,
      description,
      automatic_payment_methods: {
        enabled: true
      },
      metadata: {
        user_id: userId
      }
    });

    // Save transaction
    await this.db.query(
      `INSERT INTO payment_transactions 
       (user_id, stripe_payment_intent_id, amount, currency, status, description)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [userId, paymentIntent.id, amount, currency, paymentIntent.status, description]
    );

    return {
      paymentIntent,
      clientSecret: paymentIntent.client_secret
    };
  }

  /**
   * Create setup intent for saving card
   */
  async createSetupIntent(userId) {
    const customerId = await this.getOrCreateCustomer(userId);

    const setupIntent = await this.stripe.setupIntents.create({
      customer: customerId,
      payment_method_types: ['card'],
      metadata: {
        user_id: userId
      }
    });

    return {
      setupIntent,
      clientSecret: setupIntent.client_secret
    };
  }

  /**
   * Get customer portal URL
   */
  async createPortalSession(userId, returnUrl) {
    const customerId = await this.getOrCreateCustomer(userId);

    const session = await this.stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl
    });

    return session.url;
  }
}
```

---

## Subscription Management

### API Routes

```javascript
// api/payment-routes.js (enhanced)
import express from 'express';
import { StripePaymentService } from '../services/stripe-payment-service.js';

const router = express.Router();

// Create subscription
router.post('/subscriptions', async (req, res) => {
  try {
    const { priceId, paymentMethodId } = req.body;
    const userId = req.user.id;

    const paymentService = new StripePaymentService(req.app.locals.db);
    const result = await paymentService.createSubscription(userId, priceId, paymentMethodId);

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update subscription
router.put('/subscriptions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const paymentService = new StripePaymentService(req.app.locals.db);
    const subscription = await paymentService.updateSubscription(id, updates);

    res.json({ subscription });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cancel subscription
router.delete('/subscriptions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { immediately = false } = req.query;

    const paymentService = new StripePaymentService(req.app.locals.db);
    await paymentService.cancelSubscription(id, immediately === 'true');

    res.json({ message: 'Subscription canceled' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add payment method
router.post('/payment-methods', async (req, res) => {
  try {
    const { paymentMethodId } = req.body;
    const userId = req.user.id;

    const paymentService = new StripePaymentService(req.app.locals.db);
    const paymentMethod = await paymentService.addPaymentMethod(userId, paymentMethodId);

    res.json({ paymentMethod });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create one-time payment
router.post('/payments', async (req, res) => {
  try {
    const { amount, currency, description } = req.body;
    const userId = req.user.id;

    const paymentService = new StripePaymentService(req.app.locals.db);
    const result = await paymentService.createPayment(userId, amount, currency, description);

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create setup intent
router.post('/setup-intent', async (req, res) => {
  try {
    const userId = req.user.id;

    const paymentService = new StripePaymentService(req.app.locals.db);
    const result = await paymentService.createSetupIntent(userId);

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get customer portal
router.post('/portal', async (req, res) => {
  try {
    const { returnUrl } = req.body;
    const userId = req.user.id;

    const paymentService = new StripePaymentService(req.app.locals.db);
    const url = await paymentService.createPortalSession(userId, returnUrl);

    res.json({ url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
```

---

## Webhook Integration

```javascript
// api/stripe-webhook-routes.js
import express from 'express';
import Stripe from 'stripe';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

// Webhook endpoint (raw body required)
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    const sig = req.headers['stripe-signature'];

    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Log event
    await req.app.locals.db.query(
      `INSERT INTO stripe_events (stripe_event_id, event_type, event_data)
       VALUES ($1, $2, $3)
       ON CONFLICT (stripe_event_id) DO NOTHING`,
      [event.id, event.type, JSON.stringify(event.data)]
    );

    // Handle the event
    try {
      await handleWebhookEvent(req.app.locals.db, event);
      
      // Mark as processed
      await req.app.locals.db.query(
        'UPDATE stripe_events SET processed = true, processed_at = CURRENT_TIMESTAMP WHERE stripe_event_id = $1',
        [event.id]
      );
    } catch (error) {
      console.error('Error processing webhook:', error);
      
      // Log error
      await req.app.locals.db.query(
        'UPDATE stripe_events SET error = $1 WHERE stripe_event_id = $2',
        [error.message, event.id]
      );
    }

    res.json({ received: true });
  }
);

async function handleWebhookEvent(db, event) {
  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
      await handleSubscriptionUpdated(db, event.data.object);
      break;

    case 'customer.subscription.deleted':
      await handleSubscriptionDeleted(db, event.data.object);
      break;

    case 'invoice.paid':
      await handleInvoicePaid(db, event.data.object);
      break;

    case 'invoice.payment_failed':
      await handleInvoicePaymentFailed(db, event.data.object);
      break;

    case 'payment_intent.succeeded':
      await handlePaymentSucceeded(db, event.data.object);
      break;

    case 'payment_intent.payment_failed':
      await handlePaymentFailed(db, event.data.object);
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }
}

async function handleSubscriptionUpdated(db, subscription) {
  await db.query(
    `UPDATE user_subscriptions 
     SET 
       status = $1,
       current_period_start = $2,
       current_period_end = $3,
       cancel_at_period_end = $4,
       updated_at = CURRENT_TIMESTAMP
     WHERE stripe_subscription_id = $5`,
    [
      subscription.status,
      new Date(subscription.current_period_start * 1000),
      new Date(subscription.current_period_end * 1000),
      subscription.cancel_at_period_end,
      subscription.id
    ]
  );
}

async function handleSubscriptionDeleted(db, subscription) {
  await db.query(
    `UPDATE user_subscriptions 
     SET status = 'canceled', updated_at = CURRENT_TIMESTAMP
     WHERE stripe_subscription_id = $1`,
    [subscription.id]
  );
}

async function handleInvoicePaid(db, invoice) {
  await db.query(
    `INSERT INTO invoices 
     (user_id, subscription_id, stripe_invoice_id, amount_due, amount_paid, 
      currency, status, invoice_pdf, hosted_invoice_url, period_start, period_end)
     SELECT 
       us.user_id,
       us.id,
       $1, $2, $3, $4, $5, $6, $7, $8, $9
     FROM user_subscriptions us
     WHERE us.stripe_subscription_id = $10
     ON CONFLICT (stripe_invoice_id) 
     DO UPDATE SET 
       amount_paid = EXCLUDED.amount_paid,
       status = EXCLUDED.status`,
    [
      invoice.id,
      invoice.amount_due / 100,
      invoice.amount_paid / 100,
      invoice.currency,
      invoice.status,
      invoice.invoice_pdf,
      invoice.hosted_invoice_url,
      new Date(invoice.period_start * 1000),
      new Date(invoice.period_end * 1000),
      invoice.subscription
    ]
  );
}

async function handleInvoicePaymentFailed(db, invoice) {
  // Update subscription status
  await db.query(
    `UPDATE user_subscriptions 
     SET status = 'past_due', updated_at = CURRENT_TIMESTAMP
     WHERE stripe_subscription_id = $1`,
    [invoice.subscription]
  );

  // TODO: Send notification email to user
}

async function handlePaymentSucceeded(db, paymentIntent) {
  await db.query(
    `UPDATE payment_transactions 
     SET status = 'succeeded', updated_at = CURRENT_TIMESTAMP
     WHERE stripe_payment_intent_id = $1`,
    [paymentIntent.id]
  );
}

async function handlePaymentFailed(db, paymentIntent) {
  await db.query(
    `UPDATE payment_transactions 
     SET status = 'failed', updated_at = CURRENT_TIMESTAMP
     WHERE stripe_payment_intent_id = $1`,
    [paymentIntent.id]
  );
}

export default router;
```

---

## Payment UI Components

### Pricing Plans Component

```jsx
// components/PricingPlans.jsx
import React, { useState } from 'react';
import { Card, Button, Switch, Row, Col, Tag } from 'antd';
import { CheckOutlined } from '@ant-design/icons';

const plans = [
  {
    name: 'Free',
    price: { monthly: 0, yearly: 0 },
    features: [
      '1 project',
      'Basic analytics',
      'Community support',
      '1GB storage'
    ],
    priceIds: {
      monthly: null,
      yearly: null
    }
  },
  {
    name: 'Pro',
    price: { monthly: 29, yearly: 278.40 },
    popular: true,
    features: [
      'Unlimited projects',
      'Advanced analytics',
      'Priority support',
      'Custom domains',
      '100GB storage',
      'API access'
    ],
    priceIds: {
      monthly: process.env.REACT_APP_STRIPE_PRICE_PRO_MONTHLY,
      yearly: process.env.REACT_APP_STRIPE_PRICE_PRO_YEARLY
    }
  },
  {
    name: 'Enterprise',
    price: { monthly: 99, yearly: 950.40 },
    features: [
      'Everything in Pro',
      'Dedicated support',
      'SLA guarantees',
      'Custom integrations',
      'Advanced security',
      'Unlimited storage',
      'Team collaboration'
    ],
    priceIds: {
      monthly: process.env.REACT_APP_STRIPE_PRICE_ENTERPRISE_MONTHLY,
      yearly: process.env.REACT_APP_STRIPE_PRICE_ENTERPRISE_YEARLY
    }
  }
];

export const PricingPlans = ({ onSelectPlan }) => {
  const [billingCycle, setBillingCycle] = useState('monthly');

  const handleSelectPlan = (plan) => {
    if (plan.name === 'Free') {
      // Handle free plan
      return;
    }

    const priceId = plan.priceIds[billingCycle];
    onSelectPlan(priceId, plan.name);
  };

  return (
    <div className="pricing-plans">
      <div className="billing-toggle">
        <span>Monthly</span>
        <Switch
          checked={billingCycle === 'yearly'}
          onChange={(checked) => setBillingCycle(checked ? 'yearly' : 'monthly')}
        />
        <span>Yearly <Tag color="green">Save 20%</Tag></span>
      </div>

      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        {plans.map((plan) => (
          <Col key={plan.name} xs={24} md={8}>
            <Card
              className={plan.popular ? 'pricing-card popular' : 'pricing-card'}
              title={
                <div>
                  {plan.name}
                  {plan.popular && <Tag color="blue">Popular</Tag>}
                </div>
              }
            >
              <div className="price">
                <span className="amount">${plan.price[billingCycle]}</span>
                <span className="period">
                  /{billingCycle === 'monthly' ? 'month' : 'year'}
                </span>
              </div>

              <ul className="features">
                {plan.features.map((feature, idx) => (
                  <li key={idx}>
                    <CheckOutlined style={{ color: '#52c41a' }} /> {feature}
                  </li>
                ))}
              </ul>

              <Button
                type={plan.popular ? 'primary' : 'default'}
                size="large"
                block
                onClick={() => handleSelectPlan(plan)}
              >
                {plan.name === 'Free' ? 'Get Started' : 'Subscribe'}
              </Button>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};
```

### Payment Form Component

```jsx
// components/PaymentForm.jsx
import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { Button, message } from 'antd';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const CheckoutForm = ({ priceId, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);

    try {
      // Create subscription
      const response = await fetch('/api/payments/subscriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ priceId })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      // Confirm payment
      const { error, paymentIntent } = await stripe.confirmCardPayment(
        data.clientSecret,
        {
          payment_method: {
            card: elements.getElement(CardElement)
          }
        }
      );

      if (error) {
        throw new Error(error.message);
      }

      if (paymentIntent.status === 'succeeded') {
        message.success('Subscription created successfully!');
        onSuccess();
      }
    } catch (error) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardElement
        options={{
          style: {
            base: {
              fontSize: '16px',
              color: '#424770',
              '::placeholder': {
                color: '#aab7c4'
              }
            },
            invalid: {
              color: '#9e2146'
            }
          }
        }}
      />
      
      <Button
        type="primary"
        htmlType="submit"
        loading={loading}
        disabled={!stripe}
        block
        size="large"
        style={{ marginTop: 24 }}
      >
        Subscribe
      </Button>
    </form>
  );
};

export const PaymentForm = ({ priceId, onSuccess }) => {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm priceId={priceId} onSuccess={onSuccess} />
    </Elements>
  );
};
```

---

## Testing

### Test Mode

Use Stripe test cards:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- 3D Secure: `4000 0027 6000 3184`

### Webhook Testing

```bash
# Install Stripe CLI
brew install stripe/stripe-brew/stripe

# Login
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3001/api/stripe/webhook

# Trigger test events
stripe trigger customer.subscription.created
stripe trigger invoice.paid
stripe trigger payment_intent.succeeded
```

---

## Security Best Practices

1. **Never expose secret keys in frontend**
2. **Use environment variables for all keys**
3. **Verify webhook signatures**
4. **Use HTTPS in production**
5. **Implement rate limiting**
6. **Store minimal payment data**
7. **Use Stripe's PCI-compliant forms**
8. **Log all payment events**
9. **Implement idempotency for webhooks**
10. **Regular security audits**

---

## Next Steps

- Setup [Error Handling](./ERROR_HANDLING_GUIDE.md)
- Implement [Invoice Management](./INVOICE_MANAGEMENT.md)
- Configure [Email Notifications](./EMAIL_NOTIFICATIONS.md)
