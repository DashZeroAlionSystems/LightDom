/**
 * Payment Plan Configuration System
 * 
 * Manages subscription tiers, features, billing, and access control for the SEO service.
 * Supports multiple payment gateways and provides flexible plan management.
 */

export interface PaymentPlanFeatures {
  // Core Limits
  monthlyPageViews: number;
  maxDomains: number;
  keywordTracking: number;
  
  // Rich Snippets
  basicSchemas: boolean;
  advancedSchemas: boolean;
  allSchemas: boolean;
  customSchemas: boolean;
  
  // SEO Features
  coreWebVitals: boolean;
  abTesting: boolean;
  mlOptimization: boolean;
  backlinkNetwork: boolean;
  premiumBacklinks: boolean;
  
  // Reporting
  monthlyReports: boolean;
  weeklyReports: boolean;
  realtimeReports: boolean;
  whiteLabelReports: boolean;
  
  // Integration
  apiAccess: boolean;
  webhooks: boolean;
  customIntegrations: boolean;
  
  // Support
  emailSupport: boolean;
  prioritySupport: boolean;
  dedicatedSupport: boolean;
  support24x7: boolean;
  responseTime: string; // e.g., "24h", "4h", "1h", "instant"
  
  // Advanced
  onPremiseOption: boolean;
  slaGuarantee: boolean;
  dedicatedModel: boolean;
  customDevelopment: boolean;
}

export interface PaymentPlan {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  currency: string;
  billingPeriod: 'month' | 'year';
  trialDays: number;
  popular: boolean;
  enterprise: boolean;
  features: PaymentPlanFeatures;
  metadata: {
    order: number;
    colorScheme: string;
    icon: string;
    ctaText: string;
    targetAudience: string[];
  };
}

export const PAYMENT_PLANS: Record<string, PaymentPlan> = {
  FREE: {
    id: 'plan_free',
    name: 'Free',
    slug: 'free',
    description: 'Perfect for testing and small personal sites',
    price: 0,
    currency: 'USD',
    billingPeriod: 'month',
    trialDays: 0,
    popular: false,
    enterprise: false,
    features: {
      monthlyPageViews: 1000,
      maxDomains: 1,
      keywordTracking: 10,
      
      basicSchemas: true,
      advancedSchemas: false,
      allSchemas: false,
      customSchemas: false,
      
      coreWebVitals: true,
      abTesting: false,
      mlOptimization: false,
      backlinkNetwork: false,
      premiumBacklinks: false,
      
      monthlyReports: true,
      weeklyReports: false,
      realtimeReports: false,
      whiteLabelReports: false,
      
      apiAccess: false,
      webhooks: false,
      customIntegrations: false,
      
      emailSupport: true,
      prioritySupport: false,
      dedicatedSupport: false,
      support24x7: false,
      responseTime: '48h',
      
      onPremiseOption: false,
      slaGuarantee: false,
      dedicatedModel: false,
      customDevelopment: false
    },
    metadata: {
      order: 1,
      colorScheme: '#99AAB5',
      icon: 'gift',
      ctaText: 'Get Started Free',
      targetAudience: ['Personal Sites', 'Portfolios', 'Small Blogs']
    }
  },

  STARTER: {
    id: 'plan_starter',
    name: 'Starter',
    slug: 'starter',
    description: 'Essential SEO tools for growing websites',
    price: 79,
    currency: 'USD',
    billingPeriod: 'month',
    trialDays: 14,
    popular: false,
    enterprise: false,
    features: {
      monthlyPageViews: 10000,
      maxDomains: 1,
      keywordTracking: 50,
      
      basicSchemas: true,
      advancedSchemas: false,
      allSchemas: false,
      customSchemas: false,
      
      coreWebVitals: true,
      abTesting: false,
      mlOptimization: false,
      backlinkNetwork: false,
      premiumBacklinks: false,
      
      monthlyReports: true,
      weeklyReports: false,
      realtimeReports: false,
      whiteLabelReports: false,
      
      apiAccess: false,
      webhooks: false,
      customIntegrations: false,
      
      emailSupport: true,
      prioritySupport: false,
      dedicatedSupport: false,
      support24x7: false,
      responseTime: '24h',
      
      onPremiseOption: false,
      slaGuarantee: false,
      dedicatedModel: false,
      customDevelopment: false
    },
    metadata: {
      order: 2,
      colorScheme: '#00C851',
      icon: 'rocket',
      ctaText: 'Start Free Trial',
      targetAudience: ['Small Businesses', 'Startups', 'New Websites']
    }
  },

  PROFESSIONAL: {
    id: 'plan_professional',
    name: 'Professional',
    slug: 'professional',
    description: 'Advanced features for serious SEO growth',
    price: 249,
    currency: 'USD',
    billingPeriod: 'month',
    trialDays: 14,
    popular: true,
    enterprise: false,
    features: {
      monthlyPageViews: 100000,
      maxDomains: 5,
      keywordTracking: 100,
      
      basicSchemas: true,
      advancedSchemas: true,
      allSchemas: false,
      customSchemas: false,
      
      coreWebVitals: true,
      abTesting: true,
      mlOptimization: false,
      backlinkNetwork: false,
      premiumBacklinks: false,
      
      monthlyReports: true,
      weeklyReports: true,
      realtimeReports: false,
      whiteLabelReports: false,
      
      apiAccess: true,
      webhooks: false,
      customIntegrations: false,
      
      emailSupport: true,
      prioritySupport: true,
      dedicatedSupport: false,
      support24x7: false,
      responseTime: '4h',
      
      onPremiseOption: false,
      slaGuarantee: false,
      dedicatedModel: false,
      customDevelopment: false
    },
    metadata: {
      order: 3,
      colorScheme: '#5865F2',
      icon: 'star',
      ctaText: 'Get Started',
      targetAudience: ['Growing Businesses', 'E-commerce', 'Agencies']
    }
  },

  BUSINESS: {
    id: 'plan_business',
    name: 'Business',
    slug: 'business',
    description: 'Complete SEO automation with ML optimization',
    price: 599,
    currency: 'USD',
    billingPeriod: 'month',
    trialDays: 14,
    popular: false,
    enterprise: false,
    features: {
      monthlyPageViews: 500000,
      maxDomains: 20,
      keywordTracking: 500,
      
      basicSchemas: true,
      advancedSchemas: true,
      allSchemas: true,
      customSchemas: false,
      
      coreWebVitals: true,
      abTesting: true,
      mlOptimization: true,
      backlinkNetwork: true,
      premiumBacklinks: false,
      
      monthlyReports: true,
      weeklyReports: true,
      realtimeReports: true,
      whiteLabelReports: true,
      
      apiAccess: true,
      webhooks: true,
      customIntegrations: false,
      
      emailSupport: true,
      prioritySupport: true,
      dedicatedSupport: true,
      support24x7: false,
      responseTime: '1h',
      
      onPremiseOption: false,
      slaGuarantee: false,
      dedicatedModel: false,
      customDevelopment: false
    },
    metadata: {
      order: 4,
      colorScheme: '#7C5CFF',
      icon: 'trophy',
      ctaText: 'Scale Your SEO',
      targetAudience: ['Large Businesses', 'Multi-site Operations', 'SaaS Companies']
    }
  },

  ENTERPRISE: {
    id: 'plan_enterprise',
    name: 'Enterprise',
    slug: 'enterprise',
    description: 'Custom solutions with dedicated support',
    price: 1499,
    currency: 'USD',
    billingPeriod: 'month',
    trialDays: 30,
    popular: false,
    enterprise: true,
    features: {
      monthlyPageViews: Infinity,
      maxDomains: Infinity,
      keywordTracking: Infinity,
      
      basicSchemas: true,
      advancedSchemas: true,
      allSchemas: true,
      customSchemas: true,
      
      coreWebVitals: true,
      abTesting: true,
      mlOptimization: true,
      backlinkNetwork: true,
      premiumBacklinks: true,
      
      monthlyReports: true,
      weeklyReports: true,
      realtimeReports: true,
      whiteLabelReports: true,
      
      apiAccess: true,
      webhooks: true,
      customIntegrations: true,
      
      emailSupport: true,
      prioritySupport: true,
      dedicatedSupport: true,
      support24x7: true,
      responseTime: 'instant',
      
      onPremiseOption: true,
      slaGuarantee: true,
      dedicatedModel: true,
      customDevelopment: true
    },
    metadata: {
      order: 5,
      colorScheme: '#FFD700',
      icon: 'crown',
      ctaText: 'Contact Sales',
      targetAudience: ['Enterprise', 'Fortune 500', 'High-Traffic Sites']
    }
  }
};

/**
 * Payment Plan Management Service
 */
export class PaymentPlanService {
  /**
   * Get all available payment plans
   */
  static getAllPlans(): PaymentPlan[] {
    return Object.values(PAYMENT_PLANS).sort((a, b) => 
      a.metadata.order - b.metadata.order
    );
  }

  /**
   * Get a specific payment plan by slug
   */
  static getPlanBySlug(slug: string): PaymentPlan | null {
    return Object.values(PAYMENT_PLANS).find(plan => plan.slug === slug) || null;
  }

  /**
   * Get a specific payment plan by ID
   */
  static getPlanById(id: string): PaymentPlan | null {
    return Object.values(PAYMENT_PLANS).find(plan => plan.id === id) || null;
  }

  /**
   * Check if a feature is available in a plan
   */
  static hasFeature(planSlug: string, featurePath: string): boolean {
    const plan = this.getPlanBySlug(planSlug);
    if (!plan) return false;

    const keys = featurePath.split('.');
    let value: any = plan.features;
    
    for (const key of keys) {
      value = value[key];
      if (value === undefined) return false;
    }

    return Boolean(value);
  }

  /**
   * Check if usage is within plan limits
   */
  static checkUsageLimit(
    planSlug: string, 
    metric: 'pageViews' | 'domains' | 'keywords',
    currentUsage: number
  ): { allowed: boolean; limit: number; usage: number; percentage: number } {
    const plan = this.getPlanBySlug(planSlug);
    if (!plan) {
      return { allowed: false, limit: 0, usage: currentUsage, percentage: 0 };
    }

    const limitMap = {
      pageViews: plan.features.monthlyPageViews,
      domains: plan.features.maxDomains,
      keywords: plan.features.keywordTracking
    };

    const limit = limitMap[metric];
    const allowed = limit === Infinity || currentUsage <= limit;
    const percentage = limit === Infinity ? 0 : (currentUsage / limit) * 100;

    return { allowed, limit, usage: currentUsage, percentage };
  }

  /**
   * Get recommended plan based on requirements
   */
  static getRecommendedPlan(requirements: {
    pageViews?: number;
    domains?: number;
    keywords?: number;
    needsMLOptimization?: boolean;
    needsBacklinks?: boolean;
    needsAPI?: boolean;
  }): PaymentPlan {
    const plans = this.getAllPlans();

    for (const plan of plans) {
      const { features } = plan;
      
      // Check if plan meets requirements
      if (requirements.pageViews && features.monthlyPageViews < requirements.pageViews) continue;
      if (requirements.domains && features.maxDomains < requirements.domains) continue;
      if (requirements.keywords && features.keywordTracking < requirements.keywords) continue;
      if (requirements.needsMLOptimization && !features.mlOptimization) continue;
      if (requirements.needsBacklinks && !features.backlinkNetwork) continue;
      if (requirements.needsAPI && !features.apiAccess) continue;
      
      return plan;
    }

    // Return enterprise if no plan matches
    return PAYMENT_PLANS.ENTERPRISE;
  }

  /**
   * Calculate annual savings if billed yearly
   */
  static calculateAnnualSavings(monthlyPrice: number, discount: number = 0.2): {
    monthlyTotal: number;
    annualPrice: number;
    savings: number;
    savingsPercentage: number;
  } {
    const monthlyTotal = monthlyPrice * 12;
    const annualPrice = monthlyTotal * (1 - discount);
    const savings = monthlyTotal - annualPrice;
    const savingsPercentage = discount * 100;

    return {
      monthlyTotal,
      annualPrice,
      savings,
      savingsPercentage
    };
  }

  /**
   * Add a new payment plan
   */
  static async addPaymentPlan(plan: PaymentPlan): Promise<{ success: boolean; error?: string }> {
    try {
      // Validate plan structure
      if (!plan.id || !plan.slug || !plan.name) {
        return { success: false, error: 'Missing required fields' };
      }

      // Check for duplicates
      if (PAYMENT_PLANS[plan.slug.toUpperCase()]) {
        return { success: false, error: 'Plan already exists' };
      }

      // Add to database (in real implementation)
      // await db.query('INSERT INTO payment_plans ...');

      // Add to in-memory cache
      PAYMENT_PLANS[plan.slug.toUpperCase()] = plan;

      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Update an existing payment plan
   */
  static async updatePaymentPlan(
    slug: string, 
    updates: Partial<PaymentPlan>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const existingPlan = this.getPlanBySlug(slug);
      if (!existingPlan) {
        return { success: false, error: 'Plan not found' };
      }

      // Merge updates
      const updatedPlan = {
        ...existingPlan,
        ...updates,
        features: {
          ...existingPlan.features,
          ...(updates.features || {})
        },
        metadata: {
          ...existingPlan.metadata,
          ...(updates.metadata || {})
        }
      };

      // Update in database (in real implementation)
      // await db.query('UPDATE payment_plans ...');

      // Update in-memory cache
      PAYMENT_PLANS[slug.toUpperCase()] = updatedPlan;

      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Compare two plans
   */
  static comparePlans(slug1: string, slug2: string): {
    plan1: PaymentPlan | null;
    plan2: PaymentPlan | null;
    differences: Array<{ feature: string; plan1Value: any; plan2Value: any }>;
  } {
    const plan1 = this.getPlanBySlug(slug1);
    const plan2 = this.getPlanBySlug(slug2);
    const differences: Array<{ feature: string; plan1Value: any; plan2Value: any }> = [];

    if (!plan1 || !plan2) {
      return { plan1, plan2, differences };
    }

    // Compare features
    const featureKeys = Object.keys(plan1.features) as Array<keyof PaymentPlanFeatures>;
    for (const key of featureKeys) {
      const val1 = plan1.features[key];
      const val2 = plan2.features[key];
      
      if (val1 !== val2) {
        differences.push({
          feature: key,
          plan1Value: val1,
          plan2Value: val2
        });
      }
    }

    return { plan1, plan2, differences };
  }
}

/**
 * Subscription management
 */
export interface Subscription {
  id: string;
  clientId: string;
  planId: string;
  status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'paused';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  trialEnd?: Date;
  metadata: {
    stripeSubscriptionId?: string;
    paypalSubscriptionId?: string;
    cancelReason?: string;
    pauseReason?: string;
  };
}

export class SubscriptionService {
  /**
   * Create a new subscription
   */
  static async createSubscription(
    clientId: string,
    planSlug: string,
    paymentMethod: 'stripe' | 'paypal' | 'other'
  ): Promise<{ success: boolean; subscription?: Subscription; error?: string }> {
    try {
      const plan = PaymentPlanService.getPlanBySlug(planSlug);
      if (!plan) {
        return { success: false, error: 'Invalid plan' };
      }

      const now = new Date();
      const subscription: Subscription = {
        id: `sub_${Date.now()}`,
        clientId,
        planId: plan.id,
        status: plan.trialDays > 0 ? 'trialing' : 'active',
        currentPeriodStart: now,
        currentPeriodEnd: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
        cancelAtPeriodEnd: false,
        trialEnd: plan.trialDays > 0 
          ? new Date(now.getTime() + plan.trialDays * 24 * 60 * 60 * 1000)
          : undefined,
        metadata: {}
      };

      // Create subscription in payment gateway
      // await stripe.subscriptions.create(...) or paypal API

      // Save to database
      // await db.query('INSERT INTO subscriptions ...');

      return { success: true, subscription };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Cancel a subscription
   */
  static async cancelSubscription(
    subscriptionId: string,
    immediately: boolean = false,
    reason?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Update in database
      // await db.query('UPDATE subscriptions SET ...');

      // Cancel in payment gateway
      // await stripe.subscriptions.cancel(...);

      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Upgrade/downgrade subscription
   */
  static async changeSubscription(
    subscriptionId: string,
    newPlanSlug: string,
    prorate: boolean = true
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const newPlan = PaymentPlanService.getPlanBySlug(newPlanSlug);
      if (!newPlan) {
        return { success: false, error: 'Invalid plan' };
      }

      // Update in payment gateway with proration
      // await stripe.subscriptions.update(...);

      // Update in database
      // await db.query('UPDATE subscriptions SET ...');

      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
}

export default PaymentPlanService;
