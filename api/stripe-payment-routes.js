/**
 * Stripe Payment Routes - Professional payment processing
 * Handles subscriptions, checkout, and webhooks
 */

import express from 'express';
import Stripe from 'stripe';
import { authenticateToken } from './auth-routes-enhanced.js';

const router = express.Router();

// Initialize Stripe (ensure STRIPE_SECRET_KEY is in .env)
const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' })
  : null;

// Pricing configuration
const PRICING_PLANS = {
  free: {
    id: 'free',
    name: 'Free Trial',
    price: 0,
    interval: 'month',
    features: ['1 website', '1 report', '50 attributes', 'Community support']
  },
  starter: {
    id: 'starter',
    name: 'Starter',
    priceMonthly: 4900, // $49.00 in cents
    priceYearly: 47000, // $470/year ($39.17/month)
    stripePriceIdMonthly: process.env.STRIPE_PLAN_STARTER_MONTHLY || 'price_starter_monthly',
    stripePriceIdYearly: process.env.STRIPE_PLAN_STARTER_YEARLY || 'price_starter_yearly',
    features: ['3 websites', 'Weekly reports', '120 attributes', 'Email support']
  },
  professional: {
    id: 'professional',
    name: 'Professional',
    priceMonthly: 14900, // $149.00
    priceYearly: 143000, // $1,430/year ($119.17/month)
    stripePriceIdMonthly: process.env.STRIPE_PLAN_PRO_MONTHLY || 'price_pro_monthly',
    stripePriceIdYearly: process.env.STRIPE_PLAN_PRO_YEARLY || 'price_pro_yearly',
    features: ['10 websites', 'Daily reports', '192 attributes', 'Priority support', 'API access']
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    priceMonthly: 49900, // $499.00
    priceYearly: 479000, // $4,790/year ($399.17/month)
    stripePriceIdMonthly: process.env.STRIPE_PLAN_ENTERPRISE_MONTHLY || 'price_enterprise_monthly',
    stripePriceIdYearly: process.env.STRIPE_PLAN_ENTERPRISE_YEARLY || 'price_enterprise_yearly',
    features: ['Unlimited websites', 'Real-time monitoring', '192+ attributes', '24/7 support', 'White-label']
  }
};

/**
 * Get all pricing plans
 */
router.get('/plans', (req, res) => {
  res.json({
    plans: Object.values(PRICING_PLANS)
  });
});

/**
 * Create Stripe checkout session
 */
router.post('/create-checkout-session', authenticateToken, async (req, res) => {
  try {
    if (!stripe) {
      return res.status(500).json({ 
        error: 'Stripe not configured. Please add STRIPE_SECRET_KEY to environment variables.' 
      });
    }

    const { planId, billingCycle } = req.body;
    const userId = req.user.userId;

    if (!planId || !billingCycle) {
      return res.status(400).json({ error: 'Plan ID and billing cycle required' });
    }

    const plan = PRICING_PLANS[planId];
    if (!plan || planId === 'free') {
      return res.status(400).json({ error: 'Invalid plan selected' });
    }

    // Get the appropriate price ID based on billing cycle
    const priceId = billingCycle === 'yearly' 
      ? plan.stripePriceIdYearly 
      : plan.stripePriceIdMonthly;

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/cancelled`,
      client_reference_id: userId,
      customer_email: req.user.email,
      metadata: {
        userId,
        planId,
        billingCycle
      }
    });

    res.json({
      sessionId: session.id,
      url: session.url
    });

  } catch (error) {
    console.error('Checkout session error:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

/**
 * Verify payment session
 */
router.get('/verify-session/:sessionId', authenticateToken, async (req, res) => {
  try {
    if (!stripe) {
      return res.status(500).json({ error: 'Stripe not configured' });
    }

    const { sessionId } = req.params;

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === 'paid') {
      // Update user subscription in database
      // This is normally done via webhook, but this is a fallback
      res.json({
        success: true,
        paid: true,
        subscription: {
          id: session.subscription,
          status: 'active',
          planId: session.metadata.planId,
          billingCycle: session.metadata.billingCycle
        }
      });
    } else {
      res.json({
        success: false,
        paid: false,
        status: session.payment_status
      });
    }

  } catch (error) {
    console.error('Session verification error:', error);
    res.status(500).json({ error: 'Failed to verify session' });
  }
});

/**
 * Get customer subscriptions
 */
router.get('/subscriptions', authenticateToken, async (req, res) => {
  try {
    if (!stripe) {
      return res.status(500).json({ error: 'Stripe not configured' });
    }

    const userId = req.user.userId;

    // In production, get customer ID from database
    // For demo, return mock subscription
    res.json({
      subscriptions: [
        {
          id: 'sub_mock',
          status: 'active',
          plan: 'professional',
          billingCycle: 'monthly',
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          cancelAtPeriodEnd: false
        }
      ]
    });

  } catch (error) {
    console.error('Get subscriptions error:', error);
    res.status(500).json({ error: 'Failed to get subscriptions' });
  }
});

/**
 * Cancel subscription
 */
router.post('/subscriptions/:subscriptionId/cancel', authenticateToken, async (req, res) => {
  try {
    if (!stripe) {
      return res.status(500).json({ error: 'Stripe not configured' });
    }

    const { subscriptionId } = req.params;
    const { immediate } = req.body;

    if (immediate) {
      // Cancel immediately
      await stripe.subscriptions.cancel(subscriptionId);
    } else {
      // Cancel at end of billing period
      await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true
      });
    }

    res.json({
      success: true,
      message: immediate 
        ? 'Subscription cancelled immediately' 
        : 'Subscription will cancel at end of billing period'
    });

  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
});

/**
 * Create customer portal session
 */
router.post('/create-portal-session', authenticateToken, async (req, res) => {
  try {
    if (!stripe) {
      return res.status(500).json({ error: 'Stripe not configured' });
    }

    const userId = req.user.userId;

    // In production, get customer ID from database
    // For demo purposes, create a new portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: 'cus_mock', // Replace with actual customer ID
      return_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/app/settings/billing`,
    });

    res.json({
      url: session.url
    });

  } catch (error) {
    console.error('Portal session error:', error);
    res.status(500).json({ error: 'Failed to create portal session' });
  }
});

/**
 * Stripe webhook handler
 */
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    if (!stripe) {
      return res.status(500).send('Stripe not configured');
    }

    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        // Update user subscription in database
        console.log('Checkout session completed:', session.id);
        // TODO: Update user plan in database
        break;

      case 'customer.subscription.updated':
        const subscription = event.data.object;
        console.log('Subscription updated:', subscription.id);
        // TODO: Update subscription status in database
        break;

      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object;
        console.log('Subscription cancelled:', deletedSubscription.id);
        // TODO: Downgrade user to free plan
        break;

      case 'invoice.payment_succeeded':
        const invoice = event.data.object;
        console.log('Payment succeeded:', invoice.id);
        break;

      case 'invoice.payment_failed':
        const failedInvoice = event.data.object;
        console.log('Payment failed:', failedInvoice.id);
        // TODO: Send payment failed email
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });

  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).send('Webhook handler failed');
  }
});

export default router;
