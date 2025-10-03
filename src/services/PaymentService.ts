import { EventEmitter } from 'events';
import { Logger } from '../utils/Logger';
import Stripe from 'stripe';
import {
  BillingPlan,
  Subscription,
  PaymentMethod,
  Invoice,
  UsageRecord,
  PaymentIntent,
  WebhookEvent,
  BillingConfig,
  BillingError,
  BillingEvents
} from '../types/BillingTypes';

export class PaymentService extends EventEmitter {
  private stripe: Stripe;
  private logger: Logger;
  private config: BillingConfig;
  private isInitialized = false;

  constructor(config: BillingConfig) {
    super();
    this.config = config;
    this.logger = new Logger('PaymentService');
    
    // Initialize Stripe
    this.stripe = new Stripe(config.stripe.secretKey, {
      apiVersion: '2023-10-16',
      typescript: true
    });
  }

  /**
   * Initialize the payment service
   */
  async initialize(): Promise<void> {
    try {
      this.logger.info('Initializing PaymentService');
      
      // Verify Stripe connection
      await this.stripe.balance.retrieve();
      
      // Sync plans with Stripe
      await this.syncPlansWithStripe();
      
      this.isInitialized = true;
      this.logger.info('PaymentService initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize PaymentService:', error);
      throw error;
    }
  }

  /**
   * Create a new customer in Stripe
   */
  async createCustomer(userId: string, email: string, name?: string, metadata?: Record<string, any>): Promise<Stripe.Customer> {
    try {
      const customer = await this.stripe.customers.create({
        email,
        name,
        metadata: {
          userId,
          ...metadata
        }
      });

      this.logger.info(`Created Stripe customer for user ${userId}`, { customerId: customer.id });
      return customer;
    } catch (error) {
      this.logger.error(`Failed to create customer for user ${userId}:`, error);
      throw this.handleStripeError(error);
    }
  }

  /**
   * Create a subscription for a user
   */
  async createSubscription(
    userId: string,
    planId: string,
    customerId?: string,
    trialDays?: number,
    paymentMethodId?: string
  ): Promise<Subscription> {
    try {
      const plan = this.config.plans.find(p => p.id === planId);
      if (!plan) {
        throw new Error(`Plan ${planId} not found`);
      }

      // Get or create customer
      let stripeCustomerId = customerId;
      if (!stripeCustomerId) {
        // In a real implementation, you would get user data from your database
        const customer = await this.createCustomer(userId, 'user@example.com');
        stripeCustomerId = customer.id;
      }

      // Create subscription parameters
      const subscriptionParams: Stripe.SubscriptionCreateParams = {
        customer: stripeCustomerId,
        items: [{
          price: plan.metadata.stripePriceId,
          quantity: 1
        }],
        metadata: {
          userId,
          planId
        }
      };

      // Add trial period if specified
      if (trialDays && trialDays > 0) {
        subscriptionParams.trial_period_days = trialDays;
      }

      // Add payment method if provided
      if (paymentMethodId) {
        subscriptionParams.default_payment_method = paymentMethodId;
      }

      // Create subscription in Stripe
      const stripeSubscription = await this.stripe.subscriptions.create(subscriptionParams);

      // Create subscription record
      const subscription: Subscription = {
        id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        planId,
        status: this.mapStripeSubscriptionStatus(stripeSubscription.status),
        currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000).toISOString(),
        currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000).toISOString(),
        trialStart: stripeSubscription.trial_start ? new Date(stripeSubscription.trial_start * 1000).toISOString() : undefined,
        trialEnd: stripeSubscription.trial_end ? new Date(stripeSubscription.trial_end * 1000).toISOString() : undefined,
        cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
        canceledAt: stripeSubscription.canceled_at ? new Date(stripeSubscription.canceled_at * 1000).toISOString() : undefined,
        stripeSubscriptionId: stripeSubscription.id,
        stripeCustomerId,
        metadata: stripeSubscription.metadata,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      this.logger.info(`Created subscription for user ${userId}`, { subscriptionId: subscription.id });
      this.emit('subscriptionCreated', subscription);

      return subscription;
    } catch (error) {
      this.logger.error(`Failed to create subscription for user ${userId}:`, error);
      throw this.handleStripeError(error);
    }
  }

  /**
   * Update a subscription
   */
  async updateSubscription(
    subscriptionId: string,
    updates: {
      planId?: string;
      cancelAtPeriodEnd?: boolean;
      metadata?: Record<string, any>;
    }
  ): Promise<Subscription> {
    try {
      // In a real implementation, you would get the subscription from your database
      // For now, we'll simulate the update
      const subscription: Subscription = {
        id: subscriptionId,
        userId: 'user123',
        planId: updates.planId || 'basic',
        status: 'active',
        currentPeriodStart: new Date().toISOString(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        cancelAtPeriodEnd: updates.cancelAtPeriodEnd || false,
        stripeSubscriptionId: 'sub_stripe123',
        stripeCustomerId: 'cus_stripe123',
        metadata: updates.metadata || {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Update in Stripe if needed
      if (updates.planId) {
        const plan = this.config.plans.find(p => p.id === updates.planId);
        if (plan?.metadata.stripePriceId) {
          await this.stripe.subscriptions.update(subscription.stripeSubscriptionId!, {
            items: [{
              id: 'item_id', // You would get this from the current subscription
              price: plan.metadata.stripePriceId
            }],
            metadata: updates.metadata
          });
        }
      }

      this.logger.info(`Updated subscription ${subscriptionId}`);
      this.emit('subscriptionUpdated', subscription);

      return subscription;
    } catch (error) {
      this.logger.error(`Failed to update subscription ${subscriptionId}:`, error);
      throw this.handleStripeError(error);
    }
  }

  /**
   * Cancel a subscription
   */
  async cancelSubscription(subscriptionId: string, immediately = false): Promise<Subscription> {
    try {
      // In a real implementation, you would get the subscription from your database
      const subscription: Subscription = {
        id: subscriptionId,
        userId: 'user123',
        planId: 'basic',
        status: immediately ? 'canceled' : 'active',
        currentPeriodStart: new Date().toISOString(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        cancelAtPeriodEnd: !immediately,
        canceledAt: immediately ? new Date().toISOString() : undefined,
        stripeSubscriptionId: 'sub_stripe123',
        stripeCustomerId: 'cus_stripe123',
        metadata: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Cancel in Stripe
      if (subscription.stripeSubscriptionId) {
        if (immediately) {
          await this.stripe.subscriptions.cancel(subscription.stripeSubscriptionId);
        } else {
          await this.stripe.subscriptions.update(subscription.stripeSubscriptionId, {
            cancel_at_period_end: true
          });
        }
      }

      this.logger.info(`Canceled subscription ${subscriptionId}`, { immediately });
      this.emit('subscriptionCanceled', subscription);

      return subscription;
    } catch (error) {
      this.logger.error(`Failed to cancel subscription ${subscriptionId}:`, error);
      throw this.handleStripeError(error);
    }
  }

  /**
   * Create a payment intent
   */
  async createPaymentIntent(
    userId: string,
    amount: number,
    currency: string = 'usd',
    description?: string,
    metadata?: Record<string, any>
  ): Promise<PaymentIntent> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount,
        currency,
        description,
        metadata: {
          userId,
          ...metadata
        }
      });

      const result: PaymentIntent = {
        id: `pi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        amount,
        currency,
        status: this.mapStripePaymentIntentStatus(paymentIntent.status),
        description: description || '',
        stripePaymentIntentId: paymentIntent.id,
        metadata: paymentIntent.metadata,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      this.logger.info(`Created payment intent for user ${userId}`, { amount, currency });
      return result;
    } catch (error) {
      this.logger.error(`Failed to create payment intent for user ${userId}:`, error);
      throw this.handleStripeError(error);
    }
  }

  /**
   * Create an invoice
   */
  async createInvoice(
    userId: string,
    subscriptionId: string,
    amount: number,
    currency: string = 'usd',
    description: string,
    periodStart: string,
    periodEnd: string,
    items: Array<{ description: string; amount: number; quantity: number }>
  ): Promise<Invoice> {
    try {
      const invoiceNumber = `INV-${Date.now()}`;
      
      const invoice: Invoice = {
        id: `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        subscriptionId,
        number: invoiceNumber,
        status: 'draft',
        amount,
        currency,
        description,
        periodStart,
        periodEnd,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        items: items.map((item, index) => ({
          id: `item_${index}`,
          invoiceId: `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          description: item.description,
          amount: item.amount,
          quantity: item.quantity,
          unitPrice: item.amount / item.quantity,
          metadata: {}
        })),
        metadata: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      this.logger.info(`Created invoice for user ${userId}`, { invoiceNumber, amount });
      this.emit('invoiceCreated', invoice);

      return invoice;
    } catch (error) {
      this.logger.error(`Failed to create invoice for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Record usage for billing
   */
  async recordUsage(
    userId: string,
    subscriptionId: string,
    period: string,
    metrics: {
      optimizations?: number;
      apiCalls?: number;
      storageUsed?: number;
      bandwidthUsed?: number;
      domainsScanned?: number;
    }
  ): Promise<UsageRecord> {
    try {
      // In a real implementation, you would get the subscription and current usage from your database
      const usageRecord: UsageRecord = {
        id: `usage_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        subscriptionId,
        period,
        metrics: {
          optimizations: metrics.optimizations || 0,
          apiCalls: metrics.apiCalls || 0,
          storageUsed: metrics.storageUsed || 0,
          bandwidthUsed: metrics.bandwidthUsed || 0,
          domainsScanned: metrics.domainsScanned || 0
        },
        limits: {
          optimizations: 1000, // Default limits
          apiCalls: 10000,
          storage: 1000,
          bandwidth: 5000,
          domains: 10
        },
        overages: {
          optimizations: 0,
          apiCalls: 0,
          storage: 0,
          bandwidth: 0,
          domains: 0
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Calculate overages
      const overages = this.calculateOverages(usageRecord.metrics, usageRecord.limits);
      usageRecord.overages = overages;

      // Check if limits exceeded
      const hasOverages = Object.values(overages).some(value => value > 0);
      if (hasOverages) {
        this.emit('usageLimitExceeded', usageRecord);
      }

      this.logger.info(`Recorded usage for user ${userId}`, { period, metrics });
      return usageRecord;
    } catch (error) {
      this.logger.error(`Failed to record usage for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Handle Stripe webhook events
   */
  async handleWebhook(payload: string, signature: string): Promise<WebhookEvent> {
    try {
      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        this.config.stripe.webhookSecret
      );

      const webhookEvent: WebhookEvent = {
        id: `webhook_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: event.type,
        data: event.data.object,
        processed: false,
        createdAt: new Date().toISOString()
      };

      // Process the webhook event
      await this.processWebhookEvent(event);

      webhookEvent.processed = true;
      webhookEvent.processedAt = new Date().toISOString();

      this.logger.info(`Processed webhook event: ${event.type}`);
      this.emit('webhookReceived', webhookEvent);

      return webhookEvent;
    } catch (error) {
      this.logger.error('Failed to handle webhook:', error);
      throw error;
    }
  }

  /**
   * Process webhook events
   */
  private async processWebhookEvent(event: Stripe.Event): Promise<void> {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await this.handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;
      
      case 'payment_intent.payment_failed':
        await this.handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
        break;
      
      case 'invoice.payment_succeeded':
        await this.handleInvoicePaid(event.data.object as Stripe.Invoice);
        break;
      
      case 'invoice.payment_failed':
        await this.handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;
      
      case 'customer.subscription.created':
        await this.handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;
      
      case 'customer.subscription.updated':
        await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
      
      case 'customer.subscription.deleted':
        await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      
      default:
        this.logger.info(`Unhandled webhook event type: ${event.type}`);
    }
  }

  /**
   * Handle payment succeeded event
   */
  private async handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    const result: PaymentIntent = {
      id: `pi_${paymentIntent.id}`,
      userId: paymentIntent.metadata.userId || 'unknown',
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: this.mapStripePaymentIntentStatus(paymentIntent.status),
      description: paymentIntent.description || '',
      stripePaymentIntentId: paymentIntent.id,
      metadata: paymentIntent.metadata,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.emit('paymentSucceeded', result);
  }

  /**
   * Handle payment failed event
   */
  private async handlePaymentFailed(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    const result: PaymentIntent = {
      id: `pi_${paymentIntent.id}`,
      userId: paymentIntent.metadata.userId || 'unknown',
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: this.mapStripePaymentIntentStatus(paymentIntent.status),
      description: paymentIntent.description || '',
      stripePaymentIntentId: paymentIntent.id,
      metadata: paymentIntent.metadata,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const error: BillingError = {
      code: 'payment_failed',
      message: 'Payment failed',
      type: 'payment',
      details: { paymentIntentId: paymentIntent.id },
      timestamp: new Date().toISOString()
    };

    this.emit('paymentFailed', result, error);
  }

  /**
   * Handle invoice paid event
   */
  private async handleInvoicePaid(invoice: Stripe.Invoice): Promise<void> {
    // In a real implementation, you would update your database
    this.logger.info(`Invoice ${invoice.id} paid successfully`);
  }

  /**
   * Handle invoice payment failed event
   */
  private async handleInvoicePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
    // In a real implementation, you would handle the failed payment
    this.logger.warn(`Invoice ${invoice.id} payment failed`);
  }

  /**
   * Handle subscription created event
   */
  private async handleSubscriptionCreated(subscription: Stripe.Subscription): Promise<void> {
    // In a real implementation, you would create the subscription in your database
    this.logger.info(`Subscription ${subscription.id} created`);
  }

  /**
   * Handle subscription updated event
   */
  private async handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
    // In a real implementation, you would update the subscription in your database
    this.logger.info(`Subscription ${subscription.id} updated`);
  }

  /**
   * Handle subscription deleted event
   */
  private async handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
    // In a real implementation, you would mark the subscription as canceled in your database
    this.logger.info(`Subscription ${subscription.id} deleted`);
  }

  /**
   * Sync plans with Stripe
   */
  private async syncPlansWithStripe(): Promise<void> {
    try {
      for (const plan of this.config.plans) {
        if (!plan.metadata.stripeProductId || !plan.metadata.stripePriceId) {
          // Create product and price in Stripe
          const product = await this.stripe.products.create({
            name: plan.name,
            description: plan.description,
            metadata: {
              planId: plan.id
            }
          });

          const price = await this.stripe.prices.create({
            product: product.id,
            unit_amount: plan.price,
            currency: plan.currency,
            recurring: {
              interval: plan.interval
            },
            metadata: {
              planId: plan.id
            }
          });

          // Update plan with Stripe IDs
          plan.metadata.stripeProductId = product.id;
          plan.metadata.stripePriceId = price.id;

          this.logger.info(`Created Stripe product and price for plan ${plan.id}`);
        }
      }
    } catch (error) {
      this.logger.error('Failed to sync plans with Stripe:', error);
      throw error;
    }
  }

  /**
   * Calculate overages
   */
  private calculateOverages(metrics: any, limits: any): any {
    return {
      optimizations: Math.max(0, metrics.optimizations - limits.optimizations),
      apiCalls: Math.max(0, metrics.apiCalls - limits.apiCalls),
      storage: Math.max(0, metrics.storageUsed - limits.storage),
      bandwidth: Math.max(0, metrics.bandwidthUsed - limits.bandwidth),
      domains: Math.max(0, metrics.domainsScanned - limits.domains)
    };
  }

  /**
   * Map Stripe subscription status to our status
   */
  private mapStripeSubscriptionStatus(status: Stripe.Subscription.Status): Subscription['status'] {
    switch (status) {
      case 'active':
        return 'active';
      case 'canceled':
        return 'canceled';
      case 'past_due':
        return 'past_due';
      case 'unpaid':
        return 'unpaid';
      case 'trialing':
        return 'trialing';
      default:
        return 'active';
    }
  }

  /**
   * Map Stripe payment intent status to our status
   */
  private mapStripePaymentIntentStatus(status: Stripe.PaymentIntent.Status): PaymentIntent['status'] {
    switch (status) {
      case 'requires_payment_method':
        return 'requires_payment_method';
      case 'requires_confirmation':
        return 'requires_confirmation';
      case 'requires_action':
        return 'requires_action';
      case 'processing':
        return 'processing';
      case 'requires_capture':
        return 'requires_capture';
      case 'canceled':
        return 'canceled';
      case 'succeeded':
        return 'succeeded';
      default:
        return 'requires_payment_method';
    }
  }

  /**
   * Handle Stripe errors
   */
  private handleStripeError(error: any): BillingError {
    const billingError: BillingError = {
      code: error.code || 'stripe_error',
      message: error.message || 'Unknown Stripe error',
      type: 'payment',
      details: {
        type: error.type,
        code: error.code,
        decline_code: error.decline_code,
        param: error.param
      },
      timestamp: new Date().toISOString()
    };

    this.emit('error', billingError);
    return billingError;
  }

  /**
   * Get service status
   */
  getStatus(): any {
    return {
      isInitialized: this.isInitialized,
      config: {
        plansCount: this.config.plans.length,
        defaultPlan: this.config.defaultPlan,
        trialDays: this.config.trialDays
      }
    };
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    try {
      this.logger.info('PaymentService cleaned up');
    } catch (error) {
      this.logger.error('Error during cleanup:', error);
      throw error;
    }
  }
}

export default PaymentService;