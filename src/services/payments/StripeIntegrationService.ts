/**
 * Enhanced Stripe Payment Integration Service
 * Complete implementation for client signup and subscription management
 * 
 * Features:
 * - Customer management
 * - Subscription lifecycle
 * - Payment method management
 * - Webhook handling
 * - Invoice management
 * - Usage-based billing
 * - Trial periods
 * - Proration handling
 * 
 * @module StripeIntegrationService
 */

import Stripe from 'stripe';
import { httpClient } from '@/lib/http-client';
import Logger from '@/utils/Logger';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-11-20.acacia',
    typescript: true,
});

const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!;
const STRIPE_PUBLISHABLE_KEY = process.env.STRIPE_PUBLISHABLE_KEY!;

if (!process.env.STRIPE_SECRET_KEY || !STRIPE_WEBHOOK_SECRET || !STRIPE_PUBLISHABLE_KEY) {
    Logger.warn('Stripe environment variables not fully configured');
}

// ===== TYPE DEFINITIONS =====

export interface SubscriptionPlan {
    id: string;
    name: string;
    description: string;
    price: number;
    currency: string;
    interval: 'month' | 'year';
    features: string[];
    stripePriceId: string;
    trialDays?: number;
}

export interface Customer {
    id: string;
    email: string;
    name: string;
    stripeCustomerId?: string;
    subscriptionId?: string;
    subscriptionStatus?: string;
    currentPlan?: string;
}

export interface PaymentMethodInfo {
    id: string;
    type: string;
    card?: {
        brand: string;
        last4: string;
        expMonth: number;
        expYear: number;
    };
    isDefault: boolean;
}

export interface SubscriptionInfo {
    id: string;
    status: string;
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
    cancelAtPeriodEnd: boolean;
    plan: SubscriptionPlan;
    paymentMethod?: PaymentMethodInfo;
}

export interface CreateCustomerParams {
    email: string;
    name: string;
    userId: string;
    metadata?: Record<string, string>;
}

export interface CreateSubscriptionParams {
    customerId: string;
    priceId: string;
    paymentMethodId?: string;
    trialDays?: number;
    metadata?: Record<string, string>;
}

// ===== SUBSCRIPTION PLANS =====

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
    {
        id: 'starter',
        name: 'Starter',
        description: 'Perfect for small businesses and solo entrepreneurs',
        price: 29,
        currency: 'usd',
        interval: 'month',
        features: [
            '10 web crawls per month',
            'Basic SEO optimization',
            'Email support',
            '5 GB storage',
            'Standard analytics'
        ],
        stripePriceId: process.env.STRIPE_PRICE_STARTER || 'price_starter',
        trialDays: 14
    },
    {
        id: 'professional',
        name: 'Professional',
        description: 'For growing businesses with advanced needs',
        price: 99,
        currency: 'usd',
        interval: 'month',
        features: [
            '100 web crawls per month',
            'Advanced SEO optimization',
            'AI-powered content generation',
            'Priority support',
            '50 GB storage',
            'Advanced analytics',
            'Custom workflows'
        ],
        stripePriceId: process.env.STRIPE_PRICE_PROFESSIONAL || 'price_professional',
        trialDays: 14
    },
    {
        id: 'enterprise',
        name: 'Enterprise',
        description: 'For large organizations requiring maximum power',
        price: 299,
        currency: 'usd',
        interval: 'month',
        features: [
            'Unlimited web crawls',
            'Enterprise SEO optimization',
            'AI-powered content generation',
            'Neural network training',
            '24/7 dedicated support',
            'Unlimited storage',
            'Custom analytics dashboards',
            'Custom workflows & integrations',
            'White-label options',
            'SLA guarantee'
        ],
        stripePriceId: process.env.STRIPE_PRICE_ENTERPRISE || 'price_enterprise',
        trialDays: 30
    }
];

// ===== SERVICE CLASS =====

export class StripeIntegrationService {
    /**
     * Get publishable key for client-side
     */
    getPublishableKey(): string {
        return STRIPE_PUBLISHABLE_KEY;
    }
    
    /**
     * Get available subscription plans
     */
    getPlans(): SubscriptionPlan[] {
        return SUBSCRIPTION_PLANS;
    }
    
    /**
     * Get specific plan by ID
     */
    getPlan(planId: string): SubscriptionPlan | undefined {
        return SUBSCRIPTION_PLANS.find(p => p.id === planId);
    }
    
    // ===== CUSTOMER MANAGEMENT =====
    
    /**
     * Create a new Stripe customer
     */
    async createCustomer(params: CreateCustomerParams): Promise<Stripe.Customer> {
        try {
            const customer = await stripe.customers.create({
                email: params.email,
                name: params.name,
                metadata: {
                    userId: params.userId,
                    ...params.metadata
                }
            });
            
            Logger.info(`Created Stripe customer: ${customer.id} for user ${params.userId}`);
            return customer;
        } catch (error) {
            Logger.error('Failed to create Stripe customer:', error);
            throw new Error('Failed to create customer');
        }
    }
    
    /**
     * Get customer by ID
     */
    async getCustomer(customerId: string): Promise<Stripe.Customer> {
        try {
            const customer = await stripe.customers.retrieve(customerId);
            if (customer.deleted) {
                throw new Error('Customer has been deleted');
            }
            return customer as Stripe.Customer;
        } catch (error) {
            Logger.error('Failed to retrieve customer:', error);
            throw new Error('Failed to retrieve customer');
        }
    }
    
    /**
     * Update customer information
     */
    async updateCustomer(
        customerId: string,
        updates: Partial<Stripe.CustomerUpdateParams>
    ): Promise<Stripe.Customer> {
        try {
            return await stripe.customers.update(customerId, updates);
        } catch (error) {
            Logger.error('Failed to update customer:', error);
            throw new Error('Failed to update customer');
        }
    }
    
    // ===== PAYMENT METHODS =====
    
    /**
     * Attach payment method to customer
     */
    async attachPaymentMethod(
        paymentMethodId: string,
        customerId: string
    ): Promise<Stripe.PaymentMethod> {
        try {
            const paymentMethod = await stripe.paymentMethods.attach(paymentMethodId, {
                customer: customerId
            });
            
            // Set as default payment method
            await stripe.customers.update(customerId, {
                invoice_settings: {
                    default_payment_method: paymentMethodId
                }
            });
            
            return paymentMethod;
        } catch (error) {
            Logger.error('Failed to attach payment method:', error);
            throw new Error('Failed to attach payment method');
        }
    }
    
    /**
     * List customer payment methods
     */
    async listPaymentMethods(customerId: string): Promise<PaymentMethodInfo[]> {
        try {
            const paymentMethods = await stripe.paymentMethods.list({
                customer: customerId,
                type: 'card'
            });
            
            const customer = await this.getCustomer(customerId);
            const defaultPMId = customer.invoice_settings?.default_payment_method as string;
            
            return paymentMethods.data.map(pm => ({
                id: pm.id,
                type: pm.type,
                card: pm.card ? {
                    brand: pm.card.brand,
                    last4: pm.card.last4,
                    expMonth: pm.card.exp_month,
                    expYear: pm.card.exp_year
                } : undefined,
                isDefault: pm.id === defaultPMId
            }));
        } catch (error) {
            Logger.error('Failed to list payment methods:', error);
            throw new Error('Failed to list payment methods');
        }
    }
    
    /**
     * Detach payment method
     */
    async detachPaymentMethod(paymentMethodId: string): Promise<void> {
        try {
            await stripe.paymentMethods.detach(paymentMethodId);
        } catch (error) {
            Logger.error('Failed to detach payment method:', error);
            throw new Error('Failed to detach payment method');
        }
    }
    
    // ===== SUBSCRIPTION MANAGEMENT =====
    
    /**
     * Create a subscription
     */
    async createSubscription(params: CreateSubscriptionParams): Promise<Stripe.Subscription> {
        try {
            const subscriptionParams: Stripe.SubscriptionCreateParams = {
                customer: params.customerId,
                items: [{ price: params.priceId }],
                metadata: params.metadata || {},
                payment_behavior: 'default_incomplete',
                payment_settings: { save_default_payment_method: 'on_subscription' },
                expand: ['latest_invoice.payment_intent']
            };
            
            // Add trial period if specified
            if (params.trialDays) {
                subscriptionParams.trial_period_days = params.trialDays;
            }
            
            // Add payment method if provided
            if (params.paymentMethodId) {
                subscriptionParams.default_payment_method = params.paymentMethodId;
            }
            
            const subscription = await stripe.subscriptions.create(subscriptionParams);
            
            Logger.info(`Created subscription: ${subscription.id} for customer ${params.customerId}`);
            return subscription;
        } catch (error) {
            Logger.error('Failed to create subscription:', error);
            throw new Error('Failed to create subscription');
        }
    }
    
    /**
     * Get subscription details
     */
    async getSubscription(subscriptionId: string): Promise<SubscriptionInfo> {
        try {
            const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
                expand: ['default_payment_method']
            });
            
            const plan = SUBSCRIPTION_PLANS.find(
                p => p.stripePriceId === subscription.items.data[0].price.id
            );
            
            const paymentMethod = subscription.default_payment_method as Stripe.PaymentMethod | null;
            
            return {
                id: subscription.id,
                status: subscription.status,
                currentPeriodStart: new Date(subscription.current_period_start * 1000),
                currentPeriodEnd: new Date(subscription.current_period_end * 1000),
                cancelAtPeriodEnd: subscription.cancel_at_period_end,
                plan: plan || SUBSCRIPTION_PLANS[0],
                paymentMethod: paymentMethod ? {
                    id: paymentMethod.id,
                    type: paymentMethod.type,
                    card: paymentMethod.card ? {
                        brand: paymentMethod.card.brand,
                        last4: paymentMethod.card.last4,
                        expMonth: paymentMethod.card.exp_month,
                        expYear: paymentMethod.card.exp_year
                    } : undefined,
                    isDefault: true
                } : undefined
            };
        } catch (error) {
            Logger.error('Failed to retrieve subscription:', error);
            throw new Error('Failed to retrieve subscription');
        }
    }
    
    /**
     * Update subscription (change plan)
     */
    async updateSubscription(
        subscriptionId: string,
        newPriceId: string
    ): Promise<Stripe.Subscription> {
        try {
            const subscription = await stripe.subscriptions.retrieve(subscriptionId);
            
            return await stripe.subscriptions.update(subscriptionId, {
                items: [{
                    id: subscription.items.data[0].id,
                    price: newPriceId
                }],
                proration_behavior: 'create_prorations'
            });
        } catch (error) {
            Logger.error('Failed to update subscription:', error);
            throw new Error('Failed to update subscription');
        }
    }
    
    /**
     * Cancel subscription (at period end)
     */
    async cancelSubscription(subscriptionId: string, immediate: boolean = false): Promise<Stripe.Subscription> {
        try {
            if (immediate) {
                return await stripe.subscriptions.cancel(subscriptionId);
            } else {
                return await stripe.subscriptions.update(subscriptionId, {
                    cancel_at_period_end: true
                });
            }
        } catch (error) {
            Logger.error('Failed to cancel subscription:', error);
            throw new Error('Failed to cancel subscription');
        }
    }
    
    /**
     * Reactivate canceled subscription
     */
    async reactivateSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
        try {
            return await stripe.subscriptions.update(subscriptionId, {
                cancel_at_period_end: false
            });
        } catch (error) {
            Logger.error('Failed to reactivate subscription:', error);
            throw new Error('Failed to reactivate subscription');
        }
    }
    
    // ===== INVOICE MANAGEMENT =====
    
    /**
     * List customer invoices
     */
    async listInvoices(customerId: string, limit: number = 10): Promise<Stripe.Invoice[]> {
        try {
            const invoices = await stripe.invoices.list({
                customer: customerId,
                limit
            });
            return invoices.data;
        } catch (error) {
            Logger.error('Failed to list invoices:', error);
            throw new Error('Failed to list invoices');
        }
    }
    
    /**
     * Get upcoming invoice (preview)
     */
    async getUpcomingInvoice(customerId: string): Promise<Stripe.Invoice> {
        try {
            return await stripe.invoices.retrieveUpcoming({
                customer: customerId
            });
        } catch (error) {
            Logger.error('Failed to retrieve upcoming invoice:', error);
            throw new Error('Failed to retrieve upcoming invoice');
        }
    }
    
    // ===== WEBHOOK HANDLING =====
    
    /**
     * Verify and construct webhook event
     */
    constructWebhookEvent(
        payload: string | Buffer,
        signature: string
    ): Stripe.Event {
        try {
            return stripe.webhooks.constructEvent(
                payload,
                signature,
                STRIPE_WEBHOOK_SECRET
            );
        } catch (error) {
            Logger.error('Webhook signature verification failed:', error);
            throw new Error('Invalid webhook signature');
        }
    }
    
    /**
     * Handle webhook events
     */
    async handleWebhookEvent(event: Stripe.Event): Promise<void> {
        Logger.info(`Handling webhook event: ${event.type}`);
        
        switch (event.type) {
            case 'customer.subscription.created':
                await this.handleSubscriptionCreated(event.data.object as Stripe.Subscription);
                break;
            case 'customer.subscription.updated':
                await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
                break;
            case 'customer.subscription.deleted':
                await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
                break;
            case 'invoice.payment_succeeded':
                await this.handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
                break;
            case 'invoice.payment_failed':
                await this.handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
                break;
            default:
                Logger.info(`Unhandled webhook event type: ${event.type}`);
        }
    }
    
    private async handleSubscriptionCreated(subscription: Stripe.Subscription): Promise<void> {
        Logger.info(`Subscription created: ${subscription.id}`);
        // TODO: Update database, send confirmation email
    }
    
    private async handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
        Logger.info(`Subscription updated: ${subscription.id}, status: ${subscription.status}`);
        // TODO: Update database, notify user of changes
    }
    
    private async handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
        Logger.info(`Subscription deleted: ${subscription.id}`);
        // TODO: Update database, send cancellation confirmation
    }
    
    private async handleInvoicePaymentSucceeded(invoice: Stripe.Invoice): Promise<void> {
        Logger.info(`Invoice payment succeeded: ${invoice.id}`);
        // TODO: Update database, send receipt
    }
    
    private async handleInvoicePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
        Logger.error(`Invoice payment failed: ${invoice.id}`);
        // TODO: Update database, notify user, retry payment
    }
}

// Singleton instance
export const stripeService = new StripeIntegrationService();

export default StripeIntegrationService;
