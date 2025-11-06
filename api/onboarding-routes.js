/**
 * Onboarding API Routes
 * Handles client onboarding workflow with campaign setup based on payment plans
 */

import { Router } from 'express';
import crypto from 'crypto';

const router = Router();

// In-memory session storage (in production, use Redis or database)
const sessions = new Map();
const campaigns = new Map();

// Onboarding step definitions
const ONBOARDING_STEPS = [
  {
    stepNumber: 1,
    stepName: 'welcome',
    stepTitle: 'Welcome to LightDom',
    stepDescription: 'Let\'s get started with your SEO optimization journey',
    requiredFields: ['email'],
    estimatedDurationSeconds: 30
  },
  {
    stepNumber: 2,
    stepName: 'business_info',
    stepTitle: 'Tell Us About Your Business',
    stepDescription: 'Help us understand your business and goals',
    requiredFields: ['companyName', 'websiteUrl', 'industry'],
    estimatedDurationSeconds: 120
  },
  {
    stepNumber: 3,
    stepName: 'plan_selection',
    stepTitle: 'Choose Your Plan',
    stepDescription: 'Select the plan that best fits your needs',
    requiredFields: ['selectedPlan', 'billingCycle'],
    estimatedDurationSeconds: 90
  },
  {
    stepNumber: 4,
    stepName: 'campaign_setup',
    stepTitle: 'Campaign Setup',
    stepDescription: 'Configure your marketing campaign based on your selected plan',
    requiredFields: ['targetKeywords', 'competitorUrls'],
    estimatedDurationSeconds: 120
  },
  {
    stepNumber: 5,
    stepName: 'complete',
    stepTitle: 'You\'re All Set!',
    stepDescription: 'Your account is ready to start optimizing',
    requiredFields: [],
    estimatedDurationSeconds: 30
  }
];

// Payment plan configurations with campaign templates
const PAYMENT_PLANS = {
  starter: {
    name: 'Starter',
    price: 29,
    billingCycles: ['monthly', 'annual'],
    campaignTemplate: {
      maxKeywords: 5,
      maxCompetitors: 2,
      features: ['basic_seo', 'keyword_tracking'],
      crawlFrequency: 'weekly',
      reportFrequency: 'monthly'
    }
  },
  professional: {
    name: 'Professional',
    price: 99,
    billingCycles: ['monthly', 'annual'],
    campaignTemplate: {
      maxKeywords: 20,
      maxCompetitors: 5,
      features: ['advanced_seo', 'keyword_tracking', 'competitor_analysis', 'content_optimization'],
      crawlFrequency: 'daily',
      reportFrequency: 'weekly'
    }
  },
  business: {
    name: 'Business',
    price: 299,
    billingCycles: ['monthly', 'annual'],
    campaignTemplate: {
      maxKeywords: 100,
      maxCompetitors: 10,
      features: ['enterprise_seo', 'keyword_tracking', 'competitor_analysis', 'content_optimization', 'link_building', 'technical_seo'],
      crawlFrequency: 'realtime',
      reportFrequency: 'daily'
    }
  },
  enterprise: {
    name: 'Enterprise',
    price: 999,
    billingCycles: ['monthly', 'annual'],
    campaignTemplate: {
      maxKeywords: -1, // unlimited
      maxCompetitors: -1, // unlimited
      features: ['enterprise_seo', 'keyword_tracking', 'competitor_analysis', 'content_optimization', 'link_building', 'technical_seo', 'white_label', 'dedicated_support'],
      crawlFrequency: 'realtime',
      reportFrequency: 'custom'
    }
  }
};

/**
 * Start onboarding session
 * POST /api/onboarding/start
 */
router.post('/start', (req, res) => {
  try {
    const { email, metadata = {} } = req.body;
    
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Valid email required' });
    }
    
    const sessionToken = generateSessionToken();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days
    
    const session = {
      id: generateId(),
      email,
      sessionToken,
      currentStep: 1,
      totalSteps: ONBOARDING_STEPS.length,
      status: 'in_progress',
      collectedData: {},
      stepsCompleted: {},
      metadata: {
        ...metadata,
        userAgent: req.headers['user-agent'],
        ip: req.ip,
        startedFrom: metadata.referralSource || 'direct'
      },
      startedAt: now,
      lastActivityAt: now,
      expiresAt
    };
    
    sessions.set(sessionToken, session);
    
    res.json({
      sessionToken,
      currentStep: session.currentStep,
      totalSteps: session.totalSteps,
      expiresAt: session.expiresAt
    });
  } catch (error) {
    console.error('Error starting onboarding:', error);
    res.status(500).json({ error: 'Failed to start onboarding' });
  }
});

/**
 * Get current session state
 * GET /api/onboarding/session
 */
router.get('/session', (req, res) => {
  const sessionToken = req.headers['x-session-token'];
  
  if (!sessionToken) {
    return res.status(401).json({ error: 'Session token required' });
  }
  
  const session = sessions.get(sessionToken);
  
  if (!session || new Date() > session.expiresAt) {
    return res.status(401).json({ error: 'Invalid or expired session' });
  }
  
  res.json({
    currentStep: session.currentStep,
    totalSteps: session.totalSteps,
    collectedData: session.collectedData,
    stepsCompleted: session.stepsCompleted,
    status: session.status
  });
});

/**
 * Get all step definitions
 * GET /api/onboarding/steps
 */
router.get('/steps', (req, res) => {
  res.json(ONBOARDING_STEPS);
});

/**
 * Get specific step definition
 * GET /api/onboarding/steps/:stepNumber
 */
router.get('/steps/:stepNumber', (req, res) => {
  const stepNumber = parseInt(req.params.stepNumber);
  
  if (isNaN(stepNumber)) {
    return res.status(400).json({ error: 'Invalid step number' });
  }
  
  const step = ONBOARDING_STEPS.find(s => s.stepNumber === stepNumber);
  
  if (!step) {
    return res.status(404).json({ error: 'Step not found' });
  }
  
  res.json(step);
});

/**
 * Update step data
 * POST /api/onboarding/steps/:stepNumber
 */
router.post('/steps/:stepNumber', (req, res) => {
  const sessionToken = req.headers['x-session-token'];
  const stepNumber = parseInt(req.params.stepNumber);
  const data = req.body;
  
  if (!sessionToken) {
    return res.status(401).json({ error: 'Session token required' });
  }
  
  const session = sessions.get(sessionToken);
  
  if (!session || new Date() > session.expiresAt) {
    return res.status(401).json({ error: 'Invalid or expired session' });
  }
  
  if (isNaN(stepNumber) || stepNumber !== session.currentStep) {
    return res.status(400).json({ error: 'Invalid step number' });
  }
  
  const step = ONBOARDING_STEPS.find(s => s.stepNumber === stepNumber);
  
  if (!step) {
    return res.status(404).json({ error: 'Step not found' });
  }
  
  // Validate required fields
  const errors = [];
  for (const field of step.requiredFields) {
    if (!data[field]) {
      errors.push(`${field} is required`);
    }
  }
  
  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }
  
  // Update session data
  session.collectedData = {
    ...session.collectedData,
    ...data
  };
  
  session.stepsCompleted[stepNumber] = {
    completed: true,
    timestamp: new Date().toISOString()
  };
  
  session.lastActivityAt = new Date();
  
  // Auto-create campaign template when plan is selected
  if (stepNumber === 3 && data.selectedPlan) {
    const plan = PAYMENT_PLANS[data.selectedPlan];
    if (plan) {
      session.collectedData.campaignTemplate = plan.campaignTemplate;
    }
  }
  
  res.json({ success: true });
});

/**
 * Move to next step
 * POST /api/onboarding/next
 */
router.post('/next', (req, res) => {
  const sessionToken = req.headers['x-session-token'];
  
  if (!sessionToken) {
    return res.status(401).json({ error: 'Session token required' });
  }
  
  const session = sessions.get(sessionToken);
  
  if (!session || new Date() > session.expiresAt) {
    return res.status(401).json({ error: 'Invalid or expired session' });
  }
  
  if (!session.stepsCompleted[session.currentStep]?.completed) {
    return res.status(400).json({ 
      success: false, 
      error: 'Current step must be completed before proceeding' 
    });
  }
  
  if (session.currentStep < session.totalSteps) {
    session.currentStep += 1;
    session.lastActivityAt = new Date();
    res.json({ success: true, nextStep: session.currentStep });
  } else {
    session.status = 'completed';
    res.json({ success: true, nextStep: session.currentStep, completed: true });
  }
});

/**
 * Complete onboarding
 * POST /api/onboarding/complete
 */
router.post('/complete', async (req, res) => {
  const sessionToken = req.headers['x-session-token'];
  
  if (!sessionToken) {
    return res.status(401).json({ error: 'Session token required' });
  }
  
  const session = sessions.get(sessionToken);
  
  if (!session || new Date() > session.expiresAt) {
    return res.status(401).json({ error: 'Invalid or expired session' });
  }
  
  // Verify all steps completed
  const allCompleted = ONBOARDING_STEPS.every(
    step => session.stepsCompleted[step.stepNumber]?.completed
  );
  
  if (!allCompleted) {
    return res.status(400).json({ error: 'All steps must be completed' });
  }
  
  try {
    // Generate API key
    const apiKey = generateApiKey('ld_live');
    const clientId = generateId();
    
    // Create campaign based on selected plan
    const campaign = createCampaignFromSession(session, clientId);
    campaigns.set(clientId, campaign);
    
    // Mark session as completed
    session.status = 'completed';
    session.completedAt = new Date();
    
    res.json({
      success: true,
      clientId,
      apiKey,
      campaign: {
        id: campaign.id,
        name: campaign.name,
        features: campaign.features
      }
    });
  } catch (error) {
    console.error('Error completing onboarding:', error);
    res.status(500).json({ error: 'Failed to complete onboarding' });
  }
});

/**
 * Get payment plans
 * GET /api/onboarding/plans
 */
router.get('/plans', (req, res) => {
  const plans = Object.entries(PAYMENT_PLANS).map(([key, plan]) => ({
    id: key,
    name: plan.name,
    price: plan.price,
    billingCycles: plan.billingCycles,
    features: plan.campaignTemplate.features,
    maxKeywords: plan.campaignTemplate.maxKeywords,
    maxCompetitors: plan.campaignTemplate.maxCompetitors
  }));
  
  res.json({ plans });
});

/**
 * Get campaign for client
 * GET /api/onboarding/campaign/:clientId
 */
router.get('/campaign/:clientId', (req, res) => {
  const { clientId } = req.params;
  const campaign = campaigns.get(clientId);
  
  if (!campaign) {
    return res.status(404).json({ error: 'Campaign not found' });
  }
  
  res.json(campaign);
});

// Helper functions
function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

function generateSessionToken() {
  // Use crypto for secure token generation (64 bytes = 128 hex chars)
  return crypto.randomBytes(64).toString('hex');
}

function generateApiKey(prefix) {
  // Use crypto for secure API key generation
  const random = crypto.randomBytes(16).toString('hex');
  return `${prefix}_${random}`;
}

function createCampaignFromSession(session, clientId) {
  const { selectedPlan, billingCycle, targetKeywords, competitorUrls, companyName, websiteUrl } = session.collectedData;
  const plan = PAYMENT_PLANS[selectedPlan];
  
  return {
    id: generateId(),
    clientId,
    name: `${companyName} SEO Campaign`,
    plan: selectedPlan,
    billingCycle,
    status: 'active',
    websiteUrl,
    targetKeywords: targetKeywords || [],
    competitorUrls: competitorUrls || [],
    features: plan.campaignTemplate.features,
    crawlFrequency: plan.campaignTemplate.crawlFrequency,
    reportFrequency: plan.campaignTemplate.reportFrequency,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

export default router;
