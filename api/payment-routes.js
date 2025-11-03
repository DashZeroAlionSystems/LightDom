/**
 * Payment API Routes
 * Handles Stripe payment integration for LightDom
 * Ready for Stripe account connection - just add STRIPE_SECRET_KEY to .env
 */

import { Router } from 'express';
import express from 'express';

const router = Router();

// Payment plan configurations (matches onboarding plans)
const PRICING_PLANS = {
  starter: {
    name: 'Starter',
    monthlyPrice: 29,
    annualPrice: 25, // per month when billed annually
    currency: 'usd',
    features: ['basic_seo', 'keyword_tracking'],
    limits: {
      keywords: 5,
      competitors: 2,
      crawlsPerMonth: 30
    }
  },
  professional: {
    name: 'Professional',
    monthlyPrice: 99,
    annualPrice: 82,
    currency: 'usd',
    features: ['advanced_seo', 'keyword_tracking', 'competitor_analysis', 'content_optimization'],
    limits: {
      keywords: 20,
      competitors: 5,
      crawlsPerMonth: 365
    }
  },
  business: {
    name: 'Business',
    monthlyPrice: 299,
    annualPrice: 249,
    currency: 'usd',
    features: ['enterprise_seo', 'keyword_tracking', 'competitor_analysis', 'content_optimization', 'link_building', 'technical_seo'],
    limits: {
      keywords: 100,
      competitors: 10,
      crawlsPerMonth: -1 // unlimited
    }
  },
  enterprise: {
    name: 'Enterprise',
    monthlyPrice: 999,
    annualPrice: 833,
    currency: 'usd',
    features: ['enterprise_seo', 'keyword_tracking', 'competitor_analysis', 'content_optimization', 'link_building', 'technical_seo', 'white_label', 'dedicated_support'],
    limits: {
      keywords: -1, // unlimited
      competitors: -1,
      crawlsPerMonth: -1
    }
  }
};

/**
 * Get pricing plans
 * GET /api/payment/plans
 */
router.get('/plans', (req, res) => {
  const plans = Object.entries(PRICING_PLANS).map(([key, plan]) => ({
    id: key,
    ...plan
  }));
  
  res.json({ plans });
});

/**
 * Create Stripe checkout session
 * POST /api/payment/checkout
 * 
 * Body: { planId, billingCycle, customerEmail, successUrl, cancelUrl }
 */
router.post('/checkout', async (req, res) => {
  try {
    const { planId, billingCycle = 'monthly', customerEmail, successUrl, cancelUrl } = req.body;
    
    if (!planId || !customerEmail) {
      return res.status(400).json({ 
        error: 'planId and customerEmail are required' 
      });
    }
    
    const plan = PRICING_PLANS[planId];
    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }
    
    // Check if Stripe is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      // Return mock response for development
      return res.json({
        status: 'mock',
        message: 'Stripe not configured. Add STRIPE_SECRET_KEY to .env file',
        checkoutUrl: '/mock-checkout',
        sessionId: `mock_session_${Date.now()}`,
        planDetails: {
          plan: planId,
          price: billingCycle === 'annual' ? plan.annualPrice * 12 : plan.monthlyPrice,
          billingCycle
        }
      });
    }
    
    // Initialize Stripe
    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16'
    });
    
    const price = billingCycle === 'annual' ? plan.annualPrice * 12 : plan.monthlyPrice;
    
    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      customer_email: customerEmail,
      line_items: [
        {
          price_data: {
            currency: plan.currency,
            product_data: {
              name: `${plan.name} Plan`,
              description: `${billingCycle === 'annual' ? 'Annual' : 'Monthly'} subscription`,
            },
            recurring: {
              interval: billingCycle === 'annual' ? 'year' : 'month',
            },
            unit_amount: Math.round(price * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      metadata: {
        planId,
        billingCycle,
        customerEmail
      },
      success_url: successUrl || `${process.env.FRONTEND_URL || 'http://localhost:3000'}/onboarding/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${process.env.FRONTEND_URL || 'http://localhost:3000'}/onboarding/cancel`,
    });
    
    res.json({
      status: 'success',
      checkoutUrl: session.url,
      sessionId: session.id
    });
    
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({ 
      error: 'Failed to create checkout session',
      message: error.message
    });
  }
});

/**
 * Verify payment session
 * GET /api/payment/session/:sessionId
 */
router.get('/session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    if (!process.env.STRIPE_SECRET_KEY) {
      return res.json({
        status: 'mock',
        message: 'Stripe not configured',
        paymentStatus: 'succeeded'
      });
    }
    
    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16'
    });
    
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    res.json({
      status: 'success',
      paymentStatus: session.payment_status,
      customerEmail: session.customer_email,
      metadata: session.metadata
    });
    
  } catch (error) {
    console.error('Session retrieval error:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve session',
      message: error.message
    });
  }
});

/**
 * Stripe webhook endpoint
 * POST /api/payment/webhook
 * 
 * Handles Stripe events like successful payments, subscription updates, etc.
 */
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
      console.log('Stripe webhook received but not configured');
      return res.json({ received: true, status: 'not_configured' });
    }
    
    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16'
    });
    
    const sig = req.headers['stripe-signature'];
    
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    
    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        console.log('Payment succeeded for session:', session.id);
        console.log('Customer email:', session.customer_email);
        console.log('Metadata:', session.metadata);
        
        // TODO: Update database with subscription info
        // - Create/update customer record
        // - Activate subscription
        // - Send welcome email
        // - Provision campaign based on plan
        
        break;
      }
      
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        console.log('Subscription updated:', subscription.id);
        
        // TODO: Update subscription status in database
        
        break;
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        console.log('Subscription canceled:', subscription.id);
        
        // TODO: Deactivate subscription in database
        
        break;
      }
      
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        console.log('Invoice paid:', invoice.id);
        
        // TODO: Record payment in database
        
        break;
      }
      
      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        console.log('Invoice payment failed:', invoice.id);
        
        // TODO: Handle failed payment
        // - Send notification
        // - Update subscription status
        
        break;
      }
      
      default:
        console.log('Unhandled event type:', event.type);
    }
    
    res.json({ received: true });
    
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ 
      error: 'Webhook handling failed',
      message: error.message
    });
  }
});

/**
 * Get subscription status
 * GET /api/payment/subscription/:customerId
 */
router.get('/subscription/:customerId', async (req, res) => {
  try {
    const { customerId } = req.params;
    
    if (!process.env.STRIPE_SECRET_KEY) {
      return res.json({
        status: 'mock',
        message: 'Stripe not configured',
        subscription: {
          status: 'active',
          plan: 'starter',
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }
      });
    }
    
    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16'
    });
    
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      limit: 1
    });
    
    if (subscriptions.data.length === 0) {
      return res.status(404).json({ error: 'No subscription found' });
    }
    
    const subscription = subscriptions.data[0];
    
    res.json({
      status: 'success',
      subscription: {
        id: subscription.id,
        status: subscription.status,
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end
      }
    });
    
  } catch (error) {
    console.error('Subscription retrieval error:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve subscription',
      message: error.message
    });
  }
});

/**
 * Cancel subscription
 * POST /api/payment/subscription/:subscriptionId/cancel
 */
router.post('/subscription/:subscriptionId/cancel', async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    const { immediately = false } = req.body;
    
    if (!process.env.STRIPE_SECRET_KEY) {
      return res.json({
        status: 'mock',
        message: 'Stripe not configured. Subscription would be canceled.',
        subscriptionId
      });
    }
    
    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16'
    });
    
    let subscription;
    if (immediately) {
      subscription = await stripe.subscriptions.cancel(subscriptionId);
    } else {
      subscription = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true
      });
    }
    
    res.json({
      status: 'success',
      subscription: {
        id: subscription.id,
        status: subscription.status,
        cancelAtPeriodEnd: subscription.cancel_at_period_end
      }
    });
    
  } catch (error) {
    console.error('Subscription cancellation error:', error);
    res.status(500).json({ 
      error: 'Failed to cancel subscription',
      message: error.message
    });
  }
});

export default router;
