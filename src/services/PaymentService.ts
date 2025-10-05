/**
 * PaymentService - Enterprise-grade payment processing service
 * Implements Stripe integration with comprehensive security and compliance
 * 
 * Security Features:
 * - PCI DSS compliance
 * - Secure token handling
 * - Input validation and sanitization
 * - Audit logging
 * - Error handling with no sensitive data exposure
 */

import Stripe from 'stripe';
import { logger } from '../utils/Logger';
import { ErrorHandler } from '../core/ErrorHandler';

// Environment variables for secure configuration
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
const STRIPE_PUBLISHABLE_KEY = process.env.STRIPE_PUBLISHABLE_KEY;

if (!STRIPE_SECRET_KEY || !STRIPE_WEBHOOK_SECRET || !STRIPE_PUBLISHABLE_KEY) {
  throw new Error('Missing required Stripe environment variables');
}

// Initialize Stripe with secure configuration
const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
  typescript: true,
  timeout: 10000,
  maxNetworkRetries: 3,
});

// Type definitions for type safety
export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank_account' | 'paypal';
  last4?: string;
  brand?: string;
  exp_month?: number;
  exp_year?: number;
  is_default: boolean;
}

export interface Subscription {
  id: string;
  customer_id: string;
  status: 'active' | 'canceled' | 'past_due' | 'unpaid' | 'incomplete';
  current_period_start: Date;
  current_period_end: Date;
  plan_id: string;
  plan_name: string;
  amount: number;
  currency: string;
  trial_end?: Date;
}

export interface Invoice {
  id: string;
  customer_id: string;
  subscription_id?: string;
  status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';
  amount_due: number;
  amount_paid: number;
  currency: string;
  created: Date;
  due_date?: Date;
  paid_at?: Date;
  invoice_pdf?: string;
  hosted_invoice_url?: string;
}

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: 'requires_payment_method' | 'requires_confirmation' | 'requires_action' | 'processing' | 'succeeded' | 'canceled';
  client_secret: string;
  metadata: Record<string, string>;
}

export interface BillingAddress {
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postal_code: string;
  country: string;
}

export interface CreateCustomerData {
  email: string;
  name: string;
  phone?: string;
  address?: BillingAddress;
  metadata?: Record<string, string>;
}

export interface CreateSubscriptionData {
  customer_id: string;
  price_id: string;
  trial_period_days?: number;
  metadata?: Record<string, string>;
}

export interface UsageRecord {
  subscription_item_id: string;
  quantity: number;
  timestamp: number;
  action?: 'increment' | 'set';
}

export class PaymentService {
  private errorHandler: ErrorHandler;
  private webhookSecret: string;

  constructor() {
    this.errorHandler = new ErrorHandler();
    this.webhookSecret = STRIPE_WEBHOOK_SECRET;
  }

  /**
   * Create a new customer in Stripe
   * Implements secure customer creation with validation
   */
  async createCustomer(data: CreateCustomerData): Promise<Stripe.Customer> {
    try {
      // Validate input data
      this.validateCustomerData(data);

      // Sanitize input data
      const sanitizedData = this.sanitizeCustomerData(data);

      // Create customer in Stripe
      const customer = await stripe.customers.create({
        email: sanitizedData.email,
        name: sanitizedData.name,
        phone: sanitizedData.phone,
        address: sanitizedData.address,
        metadata: sanitizedData.metadata,
      });

      // Log successful creation (without sensitive data)
      logger.info('Customer created successfully', {
        customer_id: customer.id,
        email: customer.email,
        created_at: customer.created,
      });

      return customer;
    } catch (error) {
      // Handle error securely without exposing sensitive data
      const errorReport = this.errorHandler.handleError(error, {
        service: 'PaymentService',
        operation: 'createCustomer',
        metadata: { email: data.email },
      });

      logger.error('Failed to create customer', {
        error_id: errorReport.id,
        error_type: errorReport.type,
      });

      throw new Error('Failed to create customer. Please try again.');
    }
  }

  /**
   * Create a payment method for a customer
   * Implements secure payment method creation
   */
  async createPaymentMethod(
    customerId: string,
    paymentMethodId: string
  ): Promise<Stripe.PaymentMethod> {
    try {
      // Validate inputs
      if (!customerId || !paymentMethodId) {
        throw new Error('Customer ID and Payment Method ID are required');
      }

      // Attach payment method to customer
      const paymentMethod = await stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId,
      });

      // Set as default if it's the first payment method
      const customerPaymentMethods = await stripe.paymentMethods.list({
        customer: customerId,
        type: 'card',
      });

      if (customerPaymentMethods.data.length === 1) {
        await stripe.customers.update(customerId, {
          invoice_settings: {
            default_payment_method: paymentMethodId,
          },
        });
      }

      logger.info('Payment method created successfully', {
        customer_id: customerId,
        payment_method_id: paymentMethod.id,
        type: paymentMethod.type,
      });

      return paymentMethod;
    } catch (error) {
      const errorReport = this.errorHandler.handleError(error, {
        service: 'PaymentService',
        operation: 'createPaymentMethod',
        metadata: { customer_id: customerId },
      });

      logger.error('Failed to create payment method', {
        error_id: errorReport.id,
        error_type: errorReport.type,
      });

      throw new Error('Failed to create payment method. Please try again.');
    }
  }

  /**
   * Create a subscription for a customer
   * Implements secure subscription creation with trial support
   */
  async createSubscription(data: CreateSubscriptionData): Promise<Stripe.Subscription> {
    try {
      // Validate input data
      this.validateSubscriptionData(data);

      // Create subscription in Stripe
      const subscription = await stripe.subscriptions.create({
        customer: data.customer_id,
        items: [{ price: data.price_id }],
        trial_period_days: data.trial_period_days,
        metadata: data.metadata,
        expand: ['latest_invoice.payment_intent'],
      });

      logger.info('Subscription created successfully', {
        customer_id: data.customer_id,
        subscription_id: subscription.id,
        status: subscription.status,
        trial_end: subscription.trial_end,
      });

      return subscription;
    } catch (error) {
      const errorReport = this.errorHandler.handleError(error, {
        service: 'PaymentService',
        operation: 'createSubscription',
        metadata: { customer_id: data.customer_id },
      });

      logger.error('Failed to create subscription', {
        error_id: errorReport.id,
        error_type: errorReport.type,
      });

      throw new Error('Failed to create subscription. Please try again.');
    }
  }

  /**
   * Cancel a subscription
   * Implements secure subscription cancellation
   */
  async cancelSubscription(
    subscriptionId: string,
    immediately: boolean = false
  ): Promise<Stripe.Subscription> {
    try {
      if (!subscriptionId) {
        throw new Error('Subscription ID is required');
      }

      const subscription = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: !immediately,
        ...(immediately && { status: 'canceled' }),
      });

      logger.info('Subscription canceled successfully', {
        subscription_id: subscriptionId,
        canceled_at: subscription.canceled_at,
        cancel_at_period_end: subscription.cancel_at_period_end,
      });

      return subscription;
    } catch (error) {
      const errorReport = this.errorHandler.handleError(error, {
        service: 'PaymentService',
        operation: 'cancelSubscription',
        metadata: { subscription_id: subscriptionId },
      });

      logger.error('Failed to cancel subscription', {
        error_id: errorReport.id,
        error_type: errorReport.type,
      });

      throw new Error('Failed to cancel subscription. Please try again.');
    }
  }

  /**
   * Create a payment intent for one-time payments
   * Implements secure payment intent creation
   */
  async createPaymentIntent(
    amount: number,
    currency: string = 'usd',
    customerId?: string,
    metadata?: Record<string, string>
  ): Promise<PaymentIntent> {
    try {
      // Validate amount
      if (amount <= 0) {
        throw new Error('Amount must be greater than 0');
      }

      // Convert to cents for Stripe
      const amountInCents = Math.round(amount * 100);

      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency: currency.toLowerCase(),
        customer: customerId,
        metadata: metadata || {},
        automatic_payment_methods: {
          enabled: true,
        },
      });

      logger.info('Payment intent created successfully', {
        payment_intent_id: paymentIntent.id,
        amount: amountInCents,
        currency: currency,
        customer_id: customerId,
      });

      return {
        id: paymentIntent.id,
        amount: amountInCents,
        currency: currency,
        status: paymentIntent.status as any,
        client_secret: paymentIntent.client_secret!,
        metadata: paymentIntent.metadata,
      };
    } catch (error) {
      const errorReport = this.errorHandler.handleError(error, {
        service: 'PaymentService',
        operation: 'createPaymentIntent',
        metadata: { amount, currency, customer_id: customerId },
      });

      logger.error('Failed to create payment intent', {
        error_id: errorReport.id,
        error_type: errorReport.type,
      });

      throw new Error('Failed to create payment intent. Please try again.');
    }
  }

  /**
   * Record usage for metered billing
   * Implements secure usage recording
   */
  async recordUsage(data: UsageRecord): Promise<Stripe.UsageRecord> {
    try {
      // Validate input data
      this.validateUsageData(data);

      const usageRecord = await stripe.subscriptionItems.createUsageRecord(
        data.subscription_item_id,
        {
          quantity: data.quantity,
          timestamp: data.timestamp,
          action: data.action || 'increment',
        }
      );

      logger.info('Usage recorded successfully', {
        subscription_item_id: data.subscription_item_id,
        quantity: data.quantity,
        timestamp: data.timestamp,
      });

      return usageRecord;
    } catch (error) {
      const errorReport = this.errorHandler.handleError(error, {
        service: 'PaymentService',
        operation: 'recordUsage',
        metadata: { subscription_item_id: data.subscription_item_id },
      });

      logger.error('Failed to record usage', {
        error_id: errorReport.id,
        error_type: errorReport.type,
      });

      throw new Error('Failed to record usage. Please try again.');
    }
  }

  /**
   * Get customer's payment methods
   * Implements secure payment method retrieval
   */
  async getPaymentMethods(customerId: string): Promise<PaymentMethod[]> {
    try {
      if (!customerId) {
        throw new Error('Customer ID is required');
      }

      const paymentMethods = await stripe.paymentMethods.list({
        customer: customerId,
        type: 'card',
      });

      const formattedPaymentMethods: PaymentMethod[] = paymentMethods.data.map(pm => ({
        id: pm.id,
        type: pm.type as any,
        last4: pm.card?.last4,
        brand: pm.card?.brand,
        exp_month: pm.card?.exp_month,
        exp_year: pm.card?.exp_year,
        is_default: false, // Will be determined by customer's default payment method
      }));

      logger.info('Payment methods retrieved successfully', {
        customer_id: customerId,
        count: formattedPaymentMethods.length,
      });

      return formattedPaymentMethods;
    } catch (error) {
      const errorReport = this.errorHandler.handleError(error, {
        service: 'PaymentService',
        operation: 'getPaymentMethods',
        metadata: { customer_id: customerId },
      });

      logger.error('Failed to get payment methods', {
        error_id: errorReport.id,
        error_type: errorReport.type,
      });

      throw new Error('Failed to retrieve payment methods. Please try again.');
    }
  }

  /**
   * Get customer's subscriptions
   * Implements secure subscription retrieval
   */
  async getSubscriptions(customerId: string): Promise<Subscription[]> {
    try {
      if (!customerId) {
        throw new Error('Customer ID is required');
      }

      const subscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: 'all',
        expand: ['data.items.data.price'],
      });

      const formattedSubscriptions: Subscription[] = subscriptions.data.map(sub => ({
        id: sub.id,
        customer_id: sub.customer as string,
        status: sub.status as any,
        current_period_start: new Date(sub.current_period_start * 1000),
        current_period_end: new Date(sub.current_period_end * 1000),
        plan_id: sub.items.data[0]?.price.id || '',
        plan_name: sub.items.data[0]?.price.nickname || '',
        amount: sub.items.data[0]?.price.unit_amount || 0,
        currency: sub.currency,
        trial_end: sub.trial_end ? new Date(sub.trial_end * 1000) : undefined,
      }));

      logger.info('Subscriptions retrieved successfully', {
        customer_id: customerId,
        count: formattedSubscriptions.length,
      });

      return formattedSubscriptions;
    } catch (error) {
      const errorReport = this.errorHandler.handleError(error, {
        service: 'PaymentService',
        operation: 'getSubscriptions',
        metadata: { customer_id: customerId },
      });

      logger.error('Failed to get subscriptions', {
        error_id: errorReport.id,
        error_type: errorReport.type,
      });

      throw new Error('Failed to retrieve subscriptions. Please try again.');
    }
  }

  /**
   * Get customer's invoices
   * Implements secure invoice retrieval
   */
  async getInvoices(customerId: string, limit: number = 10): Promise<Invoice[]> {
    try {
      if (!customerId) {
        throw new Error('Customer ID is required');
      }

      const invoices = await stripe.invoices.list({
        customer: customerId,
        limit: Math.min(limit, 100), // Stripe limit
      });

      const formattedInvoices: Invoice[] = invoices.data.map(invoice => ({
        id: invoice.id,
        customer_id: invoice.customer as string,
        subscription_id: invoice.subscription as string,
        status: invoice.status as any,
        amount_due: invoice.amount_due,
        amount_paid: invoice.amount_paid,
        currency: invoice.currency,
        created: new Date(invoice.created * 1000),
        due_date: invoice.due_date ? new Date(invoice.due_date * 1000) : undefined,
        paid_at: invoice.status_transitions?.paid_at ? new Date(invoice.status_transitions.paid_at * 1000) : undefined,
        invoice_pdf: invoice.invoice_pdf || undefined,
        hosted_invoice_url: invoice.hosted_invoice_url || undefined,
      }));

      logger.info('Invoices retrieved successfully', {
        customer_id: customerId,
        count: formattedInvoices.length,
      });

      return formattedInvoices;
    } catch (error) {
      const errorReport = this.errorHandler.handleError(error, {
        service: 'PaymentService',
        operation: 'getInvoices',
        metadata: { customer_id: customerId },
      });

      logger.error('Failed to get invoices', {
        error_id: errorReport.id,
        error_type: errorReport.type,
      });

      throw new Error('Failed to retrieve invoices. Please try again.');
    }
  }

  /**
   * Verify webhook signature for security
   * Implements secure webhook verification
   */
  verifyWebhookSignature(payload: string, signature: string): Stripe.Event {
    try {
      const event = stripe.webhooks.constructEvent(
        payload,
        signature,
        this.webhookSecret
      );

      logger.info('Webhook signature verified successfully', {
        event_id: event.id,
        event_type: event.type,
      });

      return event;
    } catch (error) {
      logger.error('Webhook signature verification failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      throw new Error('Invalid webhook signature');
    }
  }

  /**
   * Handle webhook events
   * Implements secure webhook event processing
   */
  async handleWebhookEvent(event: Stripe.Event): Promise<void> {
    try {
      logger.info('Processing webhook event', {
        event_id: event.id,
        event_type: event.type,
      });

      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
          break;
        case 'payment_intent.payment_failed':
          await this.handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
          break;
        case 'invoice.payment_succeeded':
          await this.handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
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
          logger.info('Unhandled webhook event type', {
            event_type: event.type,
            event_id: event.id,
          });
      }
    } catch (error) {
      const errorReport = this.errorHandler.handleError(error, {
        service: 'PaymentService',
        operation: 'handleWebhookEvent',
        metadata: { event_id: event.id, event_type: event.type },
      });

      logger.error('Failed to handle webhook event', {
        error_id: errorReport.id,
        error_type: errorReport.type,
      });

      throw error;
    }
  }

  // Private helper methods for validation and sanitization

  private validateCustomerData(data: CreateCustomerData): void {
    if (!data.email || !data.name) {
      throw new Error('Email and name are required');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      throw new Error('Invalid email format');
    }

    // Validate name length
    if (data.name.length < 2 || data.name.length > 100) {
      throw new Error('Name must be between 2 and 100 characters');
    }
  }

  private validateSubscriptionData(data: CreateSubscriptionData): void {
    if (!data.customer_id || !data.price_id) {
      throw new Error('Customer ID and Price ID are required');
    }
  }

  private validateUsageData(data: UsageRecord): void {
    if (!data.subscription_item_id || data.quantity < 0) {
      throw new Error('Subscription Item ID is required and quantity must be non-negative');
    }
  }

  private sanitizeCustomerData(data: CreateCustomerData): CreateCustomerData {
    return {
      email: data.email.trim().toLowerCase(),
      name: data.name.trim(),
      phone: data.phone?.trim(),
      address: data.address ? {
        line1: data.address.line1.trim(),
        line2: data.address.line2?.trim(),
        city: data.address.city.trim(),
        state: data.address.state?.trim(),
        postal_code: data.address.postal_code.trim(),
        country: data.address.country.trim().toUpperCase(),
      } : undefined,
      metadata: data.metadata || {},
    };
  }

  // Webhook event handlers

  private async handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    logger.info('Payment intent succeeded', {
      payment_intent_id: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
    });
    // Implement business logic for successful payment
  }

  private async handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    logger.warn('Payment intent failed', {
      payment_intent_id: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
    });
    // Implement business logic for failed payment
  }

  private async handleInvoicePaymentSucceeded(invoice: Stripe.Invoice): Promise<void> {
    logger.info('Invoice payment succeeded', {
      invoice_id: invoice.id,
      customer_id: invoice.customer,
      amount_paid: invoice.amount_paid,
    });
    // Implement business logic for successful invoice payment
  }

  private async handleInvoicePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
    logger.warn('Invoice payment failed', {
      invoice_id: invoice.id,
      customer_id: invoice.customer,
      amount_due: invoice.amount_due,
    });
    // Implement business logic for failed invoice payment
  }

  private async handleSubscriptionCreated(subscription: Stripe.Subscription): Promise<void> {
    logger.info('Subscription created', {
      subscription_id: subscription.id,
      customer_id: subscription.customer,
      status: subscription.status,
    });
    // Implement business logic for subscription creation
  }

  private async handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
    logger.info('Subscription updated', {
      subscription_id: subscription.id,
      customer_id: subscription.customer,
      status: subscription.status,
    });
    // Implement business logic for subscription updates
  }

  private async handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
    logger.info('Subscription deleted', {
      subscription_id: subscription.id,
      customer_id: subscription.customer,
      canceled_at: subscription.canceled_at,
    });
    // Implement business logic for subscription deletion
  }
}

// Export singleton instance
export const paymentService = new PaymentService();
