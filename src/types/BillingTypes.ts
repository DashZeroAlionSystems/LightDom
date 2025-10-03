// Billing System Types for LightDom Platform

export interface BillingPlan {
  id: string;
  name: string;
  description: string;
  price: number; // Monthly price in cents
  currency: string;
  interval: 'month' | 'year';
  features: string[];
  limits: {
    optimizations: number; // Monthly optimization limit
    storage: number; // Storage limit in MB
    apiCalls: number; // Monthly API call limit
    users: number; // Number of users allowed
    domains: number; // Number of domains allowed
  };
  metadata: {
    stripeProductId?: string;
    stripePriceId?: string;
    popular?: boolean;
    recommended?: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  status: 'active' | 'canceled' | 'past_due' | 'unpaid' | 'trialing';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  trialStart?: string;
  trialEnd?: string;
  cancelAtPeriodEnd: boolean;
  canceledAt?: string;
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentMethod {
  id: string;
  userId: string;
  type: 'card' | 'bank_account' | 'paypal';
  brand?: string; // Visa, Mastercard, etc.
  last4?: string;
  expMonth?: number;
  expYear?: number;
  isDefault: boolean;
  stripePaymentMethodId?: string;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  id: string;
  userId: string;
  subscriptionId: string;
  number: string;
  status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';
  amount: number; // Amount in cents
  currency: string;
  description: string;
  periodStart: string;
  periodEnd: string;
  dueDate: string;
  paidAt?: string;
  stripeInvoiceId?: string;
  items: InvoiceItem[];
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceItem {
  id: string;
  invoiceId: string;
  description: string;
  amount: number; // Amount in cents
  quantity: number;
  unitPrice: number; // Unit price in cents
  metadata: Record<string, any>;
}

export interface UsageRecord {
  id: string;
  userId: string;
  subscriptionId: string;
  period: string; // YYYY-MM format
  metrics: {
    optimizations: number;
    apiCalls: number;
    storageUsed: number; // Storage used in MB
    bandwidthUsed: number; // Bandwidth used in MB
    domainsScanned: number;
  };
  limits: {
    optimizations: number;
    apiCalls: number;
    storage: number;
    bandwidth: number;
    domains: number;
  };
  overages: {
    optimizations: number;
    apiCalls: number;
    storage: number;
    bandwidth: number;
    domains: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface PaymentIntent {
  id: string;
  userId: string;
  amount: number; // Amount in cents
  currency: string;
  status: 'requires_payment_method' | 'requires_confirmation' | 'requires_action' | 'processing' | 'requires_capture' | 'canceled' | 'succeeded';
  description: string;
  metadata: Record<string, any>;
  stripePaymentIntentId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WebhookEvent {
  id: string;
  type: string;
  data: Record<string, any>;
  processed: boolean;
  processedAt?: string;
  error?: string;
  createdAt: string;
}

export interface BillingConfig {
  stripe: {
    publishableKey: string;
    secretKey: string;
    webhookSecret: string;
  };
  plans: BillingPlan[];
  defaultPlan: string;
  trialDays: number;
  gracePeriodDays: number;
  overageRates: {
    optimization: number; // Price per optimization over limit
    apiCall: number; // Price per API call over limit
    storage: number; // Price per MB over limit
    bandwidth: number; // Price per MB over limit
  };
  taxRates: {
    [country: string]: number; // Tax rate by country code
  };
}

export interface BillingMetrics {
  totalRevenue: number;
  monthlyRecurringRevenue: number;
  annualRecurringRevenue: number;
  churnRate: number;
  customerLifetimeValue: number;
  averageRevenuePerUser: number;
  activeSubscriptions: number;
  trialSubscriptions: number;
  canceledSubscriptions: number;
  overdueSubscriptions: number;
}

export interface BillingReport {
  period: string;
  metrics: BillingMetrics;
  subscriptions: {
    new: number;
    canceled: number;
    reactivated: number;
    churned: number;
  };
  revenue: {
    total: number;
    recurring: number;
    oneTime: number;
    refunds: number;
    chargebacks: number;
  };
  usage: {
    totalOptimizations: number;
    totalApiCalls: number;
    totalStorage: number;
    totalBandwidth: number;
  };
  topPlans: Array<{
    planId: string;
    planName: string;
    subscribers: number;
    revenue: number;
  }>;
}

export interface BillingError {
  code: string;
  message: string;
  type: 'validation' | 'payment' | 'subscription' | 'webhook' | 'system';
  details?: Record<string, any>;
  timestamp: string;
}

// Event types
export interface BillingEvents {
  'subscriptionCreated': (subscription: Subscription) => void;
  'subscriptionUpdated': (subscription: Subscription) => void;
  'subscriptionCanceled': (subscription: Subscription) => void;
  'paymentSucceeded': (paymentIntent: PaymentIntent) => void;
  'paymentFailed': (paymentIntent: PaymentIntent, error: BillingError) => void;
  'invoiceCreated': (invoice: Invoice) => void;
  'invoicePaid': (invoice: Invoice) => void;
  'invoicePaymentFailed': (invoice: Invoice, error: BillingError) => void;
  'usageLimitExceeded': (usage: UsageRecord) => void;
  'webhookReceived': (event: WebhookEvent) => void;
  'error': (error: BillingError) => void;
}

// Utility types
export type BillingEventType = keyof BillingEvents;
export type SubscriptionStatusType = 'active' | 'canceled' | 'past_due' | 'unpaid' | 'trialing';
export type InvoiceStatusType = 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';
export type PaymentIntentStatusType = 'requires_payment_method' | 'requires_confirmation' | 'requires_action' | 'processing' | 'requires_capture' | 'canceled' | 'succeeded';
export type PaymentMethodType = 'card' | 'bank_account' | 'paypal';
export type BillingIntervalType = 'month' | 'year';