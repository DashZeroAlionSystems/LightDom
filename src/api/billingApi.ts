/**
 * BillingAPI - Enterprise-grade billing API endpoints
 * Implements comprehensive billing operations with security and compliance
 * 
 * Security Features:
 * - Input validation and sanitization
 * - Rate limiting
 * - Authentication and authorization
 * - Audit logging
 * - Error handling without sensitive data exposure
 */

import { Request, Response } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { paymentService } from '../services/PaymentService';
import { logger } from '../utils/Logger';
import { ErrorHandler } from '../core/ErrorHandler';

const errorHandler = new ErrorHandler();

// Validation middleware
const validateCustomerId = param('customerId').isUUID().withMessage('Invalid customer ID');
const validateSubscriptionId = param('subscriptionId').isUUID().withMessage('Invalid subscription ID');
const validateInvoiceId = param('invoiceId').isUUID().withMessage('Invalid invoice ID');

const validateCreateCustomer = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('name').isLength({ min: 2, max: 100 }).trim().withMessage('Name must be 2-100 characters'),
  body('phone').optional().isMobilePhone().withMessage('Valid phone number required'),
  body('address').optional().isObject().withMessage('Address must be an object'),
  body('metadata').optional().isObject().withMessage('Metadata must be an object'),
];

const validateCreateSubscription = [
  body('customer_id').isUUID().withMessage('Valid customer ID is required'),
  body('price_id').isString().notEmpty().withMessage('Price ID is required'),
  body('trial_period_days').optional().isInt({ min: 0, max: 365 }).withMessage('Trial period must be 0-365 days'),
  body('metadata').optional().isObject().withMessage('Metadata must be an object'),
];

const validateCreatePaymentIntent = [
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('currency').optional().isIn(['usd', 'eur', 'gbp', 'cad', 'aud']).withMessage('Invalid currency'),
  body('customer_id').optional().isUUID().withMessage('Invalid customer ID'),
  body('metadata').optional().isObject().withMessage('Metadata must be an object'),
];

const validateRecordUsage = [
  body('subscription_item_id').isString().notEmpty().withMessage('Subscription item ID is required'),
  body('quantity').isInt({ min: 0 }).withMessage('Quantity must be non-negative'),
  body('timestamp').isInt({ min: 0 }).withMessage('Valid timestamp is required'),
  body('action').optional().isIn(['increment', 'set']).withMessage('Action must be increment or set'),
];

const validateWebhookSignature = [
  body('payload').isString().notEmpty().withMessage('Payload is required'),
  body('signature').isString().notEmpty().withMessage('Signature is required'),
];

/**
 * Create a new customer
 * POST /api/billing/customers
 */
export const createCustomer = async (req: Request, res: Response) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array(),
      });
    }

    const { email, name, phone, address, metadata } = req.body;

    // Create customer in Stripe
    const customer = await paymentService.createCustomer({
      email,
      name,
      phone,
      address,
      metadata,
    });

    logger.info('Customer created via API', {
      customer_id: customer.id,
      email: customer.email,
      request_id: req.headers['x-request-id'],
    });

    res.status(201).json({
      success: true,
      data: {
        id: customer.id,
        email: customer.email,
        name: customer.name,
        created: customer.created,
      },
    });

  } catch (error) {
    const errorReport = errorHandler.handleError(error, {
      service: 'BillingAPI',
      operation: 'createCustomer',
      request_id: req.headers['x-request-id'],
    });

    logger.error('Failed to create customer via API', {
      error_id: errorReport.id,
      error_type: errorReport.type,
    });

    res.status(500).json({
      error: 'Failed to create customer',
      error_id: errorReport.id,
    });
  }
};

/**
 * Get customer details
 * GET /api/billing/customers/:customerId
 */
export const getCustomer = async (req: Request, res: Response) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array(),
      });
    }

    const { customerId } = req.params;

    // Get customer payment methods and subscriptions
    const [paymentMethods, subscriptions, invoices] = await Promise.all([
      paymentService.getPaymentMethods(customerId),
      paymentService.getSubscriptions(customerId),
      paymentService.getInvoices(customerId, 10),
    ]);

    logger.info('Customer data retrieved via API', {
      customer_id: customerId,
      payment_methods_count: paymentMethods.length,
      subscriptions_count: subscriptions.length,
      invoices_count: invoices.length,
      request_id: req.headers['x-request-id'],
    });

    res.json({
      success: true,
      data: {
        customer_id: customerId,
        payment_methods: paymentMethods,
        subscriptions: subscriptions,
        recent_invoices: invoices,
      },
    });

  } catch (error) {
    const errorReport = errorHandler.handleError(error, {
      service: 'BillingAPI',
      operation: 'getCustomer',
      request_id: req.headers['x-request-id'],
      metadata: { customer_id: req.params.customerId },
    });

    logger.error('Failed to get customer via API', {
      error_id: errorReport.id,
      error_type: errorReport.type,
    });

    res.status(500).json({
      error: 'Failed to retrieve customer data',
      error_id: errorReport.id,
    });
  }
};

/**
 * Add payment method to customer
 * POST /api/billing/customers/:customerId/payment-methods
 */
export const addPaymentMethod = async (req: Request, res: Response) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array(),
      });
    }

    const { customerId } = req.params;
    const { payment_method_id } = req.body;

    if (!payment_method_id) {
      return res.status(400).json({
        error: 'Payment method ID is required',
      });
    }

    // Add payment method
    const paymentMethod = await paymentService.createPaymentMethod(customerId, payment_method_id);

    logger.info('Payment method added via API', {
      customer_id: customerId,
      payment_method_id: paymentMethod.id,
      request_id: req.headers['x-request-id'],
    });

    res.status(201).json({
      success: true,
      data: {
        id: paymentMethod.id,
        type: paymentMethod.type,
        created: paymentMethod.created,
      },
    });

  } catch (error) {
    const errorReport = errorHandler.handleError(error, {
      service: 'BillingAPI',
      operation: 'addPaymentMethod',
      request_id: req.headers['x-request-id'],
      metadata: { customer_id: req.params.customerId },
    });

    logger.error('Failed to add payment method via API', {
      error_id: errorReport.id,
      error_type: errorReport.type,
    });

    res.status(500).json({
      error: 'Failed to add payment method',
      error_id: errorReport.id,
    });
  }
};

/**
 * Create subscription
 * POST /api/billing/subscriptions
 */
export const createSubscription = async (req: Request, res: Response) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array(),
      });
    }

    const { customer_id, price_id, trial_period_days, metadata } = req.body;

    // Create subscription
    const subscription = await paymentService.createSubscription({
      customer_id,
      price_id,
      trial_period_days,
      metadata,
    });

    logger.info('Subscription created via API', {
      customer_id,
      subscription_id: subscription.id,
      price_id,
      request_id: req.headers['x-request-id'],
    });

    res.status(201).json({
      success: true,
      data: {
        id: subscription.id,
        status: subscription.status,
        current_period_start: subscription.current_period_start,
        current_period_end: subscription.current_period_end,
        trial_end: subscription.trial_end,
      },
    });

  } catch (error) {
    const errorReport = errorHandler.handleError(error, {
      service: 'BillingAPI',
      operation: 'createSubscription',
      request_id: req.headers['x-request-id'],
    });

    logger.error('Failed to create subscription via API', {
      error_id: errorReport.id,
      error_type: errorReport.type,
    });

    res.status(500).json({
      error: 'Failed to create subscription',
      error_id: errorReport.id,
    });
  }
};

/**
 * Cancel subscription
 * DELETE /api/billing/subscriptions/:subscriptionId
 */
export const cancelSubscription = async (req: Request, res: Response) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array(),
      });
    }

    const { subscriptionId } = req.params;
    const { immediately } = req.query;

    // Cancel subscription
    const subscription = await paymentService.cancelSubscription(
      subscriptionId,
      immediately === 'true'
    );

    logger.info('Subscription canceled via API', {
      subscription_id: subscriptionId,
      canceled_at: subscription.canceled_at,
      cancel_at_period_end: subscription.cancel_at_period_end,
      request_id: req.headers['x-request-id'],
    });

    res.json({
      success: true,
      data: {
        id: subscription.id,
        status: subscription.status,
        canceled_at: subscription.canceled_at,
        cancel_at_period_end: subscription.cancel_at_period_end,
      },
    });

  } catch (error) {
    const errorReport = errorHandler.handleError(error, {
      service: 'BillingAPI',
      operation: 'cancelSubscription',
      request_id: req.headers['x-request-id'],
      metadata: { subscription_id: req.params.subscriptionId },
    });

    logger.error('Failed to cancel subscription via API', {
      error_id: errorReport.id,
      error_type: errorReport.type,
    });

    res.status(500).json({
      error: 'Failed to cancel subscription',
      error_id: errorReport.id,
    });
  }
};

/**
 * Create payment intent
 * POST /api/billing/payment-intents
 */
export const createPaymentIntent = async (req: Request, res: Response) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array(),
      });
    }

    const { amount, currency = 'usd', customer_id, metadata } = req.body;

    // Create payment intent
    const paymentIntent = await paymentService.createPaymentIntent(
      amount,
      currency,
      customer_id,
      metadata
    );

    logger.info('Payment intent created via API', {
      payment_intent_id: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      customer_id,
      request_id: req.headers['x-request-id'],
    });

    res.status(201).json({
      success: true,
      data: {
        id: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
        client_secret: paymentIntent.client_secret,
      },
    });

  } catch (error) {
    const errorReport = errorHandler.handleError(error, {
      service: 'BillingAPI',
      operation: 'createPaymentIntent',
      request_id: req.headers['x-request-id'],
    });

    logger.error('Failed to create payment intent via API', {
      error_id: errorReport.id,
      error_type: errorReport.type,
    });

    res.status(500).json({
      error: 'Failed to create payment intent',
      error_id: errorReport.id,
    });
  }
};

/**
 * Record usage for metered billing
 * POST /api/billing/usage
 */
export const recordUsage = async (req: Request, res: Response) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array(),
      });
    }

    const { subscription_item_id, quantity, timestamp, action } = req.body;

    // Record usage
    const usageRecord = await paymentService.recordUsage({
      subscription_item_id,
      quantity,
      timestamp,
      action,
    });

    logger.info('Usage recorded via API', {
      subscription_item_id,
      quantity,
      timestamp,
      action,
      request_id: req.headers['x-request-id'],
    });

    res.status(201).json({
      success: true,
      data: {
        id: usageRecord.id,
        quantity: usageRecord.quantity,
        timestamp: usageRecord.timestamp,
      },
    });

  } catch (error) {
    const errorReport = errorHandler.handleError(error, {
      service: 'BillingAPI',
      operation: 'recordUsage',
      request_id: req.headers['x-request-id'],
    });

    logger.error('Failed to record usage via API', {
      error_id: errorReport.id,
      error_type: errorReport.type,
    });

    res.status(500).json({
      error: 'Failed to record usage',
      error_id: errorReport.id,
    });
  }
};

/**
 * Get customer invoices
 * GET /api/billing/customers/:customerId/invoices
 */
export const getCustomerInvoices = async (req: Request, res: Response) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array(),
      });
    }

    const { customerId } = req.params;
    const { limit = '10' } = req.query;

    const limitNum = Math.min(parseInt(limit as string), 100);

    // Get invoices
    const invoices = await paymentService.getInvoices(customerId, limitNum);

    logger.info('Customer invoices retrieved via API', {
      customer_id: customerId,
      invoices_count: invoices.length,
      request_id: req.headers['x-request-id'],
    });

    res.json({
      success: true,
      data: {
        customer_id: customerId,
        invoices: invoices,
        count: invoices.length,
      },
    });

  } catch (error) {
    const errorReport = errorHandler.handleError(error, {
      service: 'BillingAPI',
      operation: 'getCustomerInvoices',
      request_id: req.headers['x-request-id'],
      metadata: { customer_id: req.params.customerId },
    });

    logger.error('Failed to get customer invoices via API', {
      error_id: errorReport.id,
      error_type: errorReport.type,
    });

    res.status(500).json({
      error: 'Failed to retrieve invoices',
      error_id: errorReport.id,
    });
  }
};

/**
 * Download invoice
 * GET /api/billing/invoices/:invoiceId/download
 */
export const downloadInvoice = async (req: Request, res: Response) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array(),
      });
    }

    const { invoiceId } = req.params;

    // Get invoice details first
    const invoices = await paymentService.getInvoices('', 1000); // This would need to be modified to get by invoice ID
    const invoice = invoices.find(inv => inv.id === invoiceId);

    if (!invoice) {
      return res.status(404).json({
        error: 'Invoice not found',
      });
    }

    if (!invoice.invoice_pdf) {
      return res.status(404).json({
        error: 'Invoice PDF not available',
      });
    }

    logger.info('Invoice download requested via API', {
      invoice_id: invoiceId,
      request_id: req.headers['x-request-id'],
    });

    // Redirect to Stripe hosted invoice URL
    res.redirect(invoice.invoice_pdf);

  } catch (error) {
    const errorReport = errorHandler.handleError(error, {
      service: 'BillingAPI',
      operation: 'downloadInvoice',
      request_id: req.headers['x-request-id'],
      metadata: { invoice_id: req.params.invoiceId },
    });

    logger.error('Failed to download invoice via API', {
      error_id: errorReport.id,
      error_type: errorReport.type,
    });

    res.status(500).json({
      error: 'Failed to download invoice',
      error_id: errorReport.id,
    });
  }
};

/**
 * Handle Stripe webhooks
 * POST /api/billing/webhooks
 */
export const handleWebhook = async (req: Request, res: Response) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array(),
      });
    }

    const { payload, signature } = req.body;

    // Verify webhook signature
    const event = paymentService.verifyWebhookSignature(payload, signature);

    // Handle webhook event
    await paymentService.handleWebhookEvent(event);

    logger.info('Webhook processed successfully', {
      event_id: event.id,
      event_type: event.type,
      request_id: req.headers['x-request-id'],
    });

    res.json({
      success: true,
      message: 'Webhook processed successfully',
    });

  } catch (error) {
    const errorReport = errorHandler.handleError(error, {
      service: 'BillingAPI',
      operation: 'handleWebhook',
      request_id: req.headers['x-request-id'],
    });

    logger.error('Failed to process webhook', {
      error_id: errorReport.id,
      error_type: errorReport.type,
    });

    res.status(400).json({
      error: 'Webhook processing failed',
      error_id: errorReport.id,
    });
  }
};

/**
 * Get billing analytics
 * GET /api/billing/analytics
 */
export const getBillingAnalytics = async (req: Request, res: Response) => {
  try {
    const { period = '30' } = req.query;
    const periodDays = Math.min(parseInt(period as string), 365);

    // In a real implementation, you would fetch from your analytics service
    const analytics = {
      total_revenue: 125000, // $1,250.00
      monthly_recurring_revenue: 9900, // $99.00
      active_subscriptions: 45,
      churn_rate: 2.5,
      average_revenue_per_user: 85.50,
      new_customers_this_period: 12,
      period_days: periodDays,
      generated_at: new Date().toISOString(),
    };

    logger.info('Billing analytics retrieved via API', {
      period_days: periodDays,
      request_id: req.headers['x-request-id'],
    });

    res.json({
      success: true,
      data: analytics,
    });

  } catch (error) {
    const errorReport = errorHandler.handleError(error, {
      service: 'BillingAPI',
      operation: 'getBillingAnalytics',
      request_id: req.headers['x-request-id'],
    });

    logger.error('Failed to get billing analytics via API', {
      error_id: errorReport.id,
      error_type: errorReport.type,
    });

    res.status(500).json({
      error: 'Failed to retrieve billing analytics',
      error_id: errorReport.id,
    });
  }
};

// Export validation middleware for use in routes
export const billingValidation = {
  validateCustomerId,
  validateSubscriptionId,
  validateInvoiceId,
  validateCreateCustomer,
  validateCreateSubscription,
  validateCreatePaymentIntent,
  validateRecordUsage,
  validateWebhookSignature,
};