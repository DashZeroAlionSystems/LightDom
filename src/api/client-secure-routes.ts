/**
 * Secure Client Dashboard and Onboarding API Routes
 * 
 * Provides secure endpoints for client onboarding and dashboard data
 * with proper authentication, rate limiting, and data obfuscation
 */

import express, { Request, Response, NextFunction } from 'express';
import { getOnboardingService } from '../services/onboarding-service';
import { getEncryptionService } from '../security/encryption';
import { getSchemaProtectionService } from '../security/schema-protection';

const router = express.Router();
const onboardingService = getOnboardingService();
const encryptionService = getEncryptionService();
const schemaProtectionService = getSchemaProtectionService();

// =====================================================
// Middleware
// =====================================================

/**
 * Rate limiting middleware
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function rateLimit(maxRequests: number, windowMs: number) {
  return (req: Request, res: Response, next: NextFunction) => {
    const identifier = req.ip || 'unknown';
    const now = Date.now();
    
    let record = rateLimitMap.get(identifier);
    
    if (!record || now > record.resetTime) {
      record = { count: 0, resetTime: now + windowMs };
      rateLimitMap.set(identifier, record);
    }
    
    record.count++;
    
    if (record.count > maxRequests) {
      return res.status(429).json({
        error: 'Too many requests',
        retryAfter: Math.ceil((record.resetTime - now) / 1000)
      });
    }
    
    next();
  };
}

/**
 * Session validation middleware
 */
function validateSession(req: Request, res: Response, next: NextFunction) {
  const sessionToken = req.headers['x-session-token'] as string;
  
  if (!sessionToken) {
    return res.status(401).json({ error: 'Session token required' });
  }
  
  const session = onboardingService.getSession(sessionToken);
  
  if (!session) {
    return res.status(401).json({ error: 'Invalid or expired session' });
  }
  
  (req as any).session = session;
  next();
}

/**
 * API key validation middleware
 */
function validateApiKey(req: Request, res: Response, next: NextFunction) {
  const apiKey = req.headers['x-api-key'] as string;
  
  if (!apiKey) {
    return res.status(401).json({ error: 'API key required' });
  }
  
  // In production, validate against database
  // For now, just check format
  if (!apiKey.startsWith('ld_')) {
    return res.status(401).json({ error: 'Invalid API key format' });
  }
  
  (req as any).apiKey = apiKey;
  next();
}

// =====================================================
// Onboarding Endpoints
// =====================================================

/**
 * Start onboarding session
 * POST /api/v1/onboarding/start
 */
router.post(
  '/onboarding/start',
  rateLimit(10, 60000), // 10 requests per minute
  (req: Request, res: Response) => {
    try {
      const { email, metadata } = req.body;
      
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ error: 'Valid email required' });
      }
      
      const session = onboardingService.startOnboarding(email, {
        ...metadata,
        userAgent: req.headers['user-agent'],
        ip: req.ip
      });
      
      res.json({
        sessionToken: session.sessionToken,
        currentStep: session.currentStep,
        totalSteps: session.totalSteps,
        expiresAt: session.expiresAt
      });
    } catch (error) {
      console.error('Error starting onboarding:', error);
      res.status(500).json({ error: 'Failed to start onboarding' });
    }
  }
);

/**
 * Get current session state
 * GET /api/v1/onboarding/session
 */
router.get(
  '/onboarding/session',
  validateSession,
  (req: Request, res: Response) => {
    const session = (req as any).session;
    
    res.json({
      currentStep: session.currentStep,
      totalSteps: session.totalSteps,
      collectedData: session.collectedData,
      stepsCompleted: session.stepsCompleted,
      status: session.status
    });
  }
);

/**
 * Get step definition
 * GET /api/v1/onboarding/steps/:stepNumber
 */
router.get(
  '/onboarding/steps/:stepNumber',
  (req: Request, res: Response) => {
    const stepNumber = parseInt(req.params.stepNumber);
    
    if (isNaN(stepNumber)) {
      return res.status(400).json({ error: 'Invalid step number' });
    }
    
    const stepDef = onboardingService.getStepDefinition(stepNumber);
    
    if (!stepDef) {
      return res.status(404).json({ error: 'Step not found' });
    }
    
    res.json(stepDef);
  }
);

/**
 * Update step data
 * POST /api/v1/onboarding/steps/:stepNumber
 */
router.post(
  '/onboarding/steps/:stepNumber',
  validateSession,
  (req: Request, res: Response) => {
    const session = (req as any).session;
    const stepNumber = parseInt(req.params.stepNumber);
    const data = req.body;
    
    if (isNaN(stepNumber)) {
      return res.status(400).json({ error: 'Invalid step number' });
    }
    
    const result = onboardingService.updateStepData(
      session.sessionToken,
      stepNumber,
      data
    );
    
    if (result.success) {
      res.json({ success: true });
    } else {
      res.status(400).json({ success: false, errors: result.errors });
    }
  }
);

/**
 * Move to next step
 * POST /api/v1/onboarding/next
 */
router.post(
  '/onboarding/next',
  validateSession,
  (req: Request, res: Response) => {
    const session = (req as any).session;
    
    const result = onboardingService.nextStep(session.sessionToken);
    
    if (result.success) {
      res.json({ success: true, nextStep: result.nextStep });
    } else {
      res.status(400).json({ success: false, errors: result.errors });
    }
  }
);

/**
 * Move to previous step
 * POST /api/v1/onboarding/previous
 */
router.post(
  '/onboarding/previous',
  validateSession,
  (req: Request, res: Response) => {
    const session = (req as any).session;
    
    const result = onboardingService.previousStep(session.sessionToken);
    
    if (result.success) {
      res.json({ success: true, previousStep: result.previousStep });
    } else {
      res.status(400).json({ success: false });
    }
  }
);

/**
 * Complete onboarding
 * POST /api/v1/onboarding/complete
 */
router.post(
  '/onboarding/complete',
  validateSession,
  async (req: Request, res: Response) => {
    const session = (req as any).session;
    
    const result = await onboardingService.completeOnboarding(session.sessionToken);
    
    if (result.success) {
      res.json({
        success: true,
        clientId: result.clientId,
        apiKey: result.apiKey,
        message: 'Onboarding completed successfully'
      });
    } else {
      res.status(400).json({ success: false, errors: result.errors });
    }
  }
);

// =====================================================
// Dashboard Endpoints
// =====================================================

/**
 * Get dashboard data
 * GET /api/v1/dashboard/:clientId
 */
router.get(
  '/dashboard/:clientId',
  validateApiKey,
  rateLimit(100, 60000), // 100 requests per minute
  async (req: Request, res: Response) => {
    try {
      const { clientId } = req.params;
      const { period = '30d' } = req.query;
      
      // In production, fetch from database and apply obfuscation
      // For now, return mock data
      
      const dashboardData = {
        clientId,
        metrics: {
          seoScore: {
            current: 85,
            previous: 72,
            change: 18
          },
          organicTraffic: {
            current: 45230,
            previous: 38100,
            change: 19
          },
          keywordRankings: {
            improved: 23,
            declined: 5,
            stable: 42,
            topPositions: 12
          },
          conversions: {
            current: 342,
            previous: 275,
            change: 24,
            value: 68400
          }
        },
        planLimits: {
          pageViews: { used: 42300, limit: 100000 },
          apiCalls: { used: 8750, limit: 10000 },
          domains: { used: 3, limit: 5 }
        },
        recentActivity: [
          {
            type: 'optimization',
            message: 'SEO optimization applied to 12 pages',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
          }
        ]
      };
      
      // Obfuscate sensitive data
      const obfuscatedData = encryptionService.obfuscateForDisplay(
        dashboardData,
        ['clientId', 'metrics', 'planLimits', 'recentActivity']
      );
      
      res.json(obfuscatedData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }
  }
);

/**
 * Generate client report
 * POST /api/v1/dashboard/:clientId/report
 */
router.post(
  '/dashboard/:clientId/report',
  validateApiKey,
  rateLimit(10, 3600000), // 10 reports per hour
  async (req: Request, res: Response) => {
    try {
      const { clientId } = req.params;
      const { reportType = 'monthly', format = 'json' } = req.body;
      
      // In production, generate actual report
      const report = {
        reportId: `report_${Date.now()}`,
        clientId,
        reportType,
        generatedAt: new Date().toISOString(),
        metrics: {
          // Obfuscated metrics
          performance: 'Excellent',
          improvement: 'Significant',
          keyInsights: [
            'Traffic increased substantially',
            'Keyword rankings improved across the board',
            'Conversion rate optimization showing positive results'
          ]
        },
        // Don't include: specific algorithms, ranking factors, or proprietary strategies
      };
      
      res.json(report);
    } catch (error) {
      console.error('Error generating report:', error);
      res.status(500).json({ error: 'Failed to generate report' });
    }
  }
);

// =====================================================
// Schema Protection Endpoints
// =====================================================

/**
 * Get available schema templates (public catalog)
 * GET /api/v1/schemas/catalog
 */
router.get(
  '/schemas/catalog',
  validateApiKey,
  (req: Request, res: Response) => {
    try {
      const catalog = schemaProtectionService.getPublicSchemaCatalog();
      res.json(catalog);
    } catch (error) {
      console.error('Error fetching schema catalog:', error);
      res.status(500).json({ error: 'Failed to fetch schema catalog' });
    }
  }
);

/**
 * Get schema for client use
 * GET /api/v1/schemas/:schemaId
 */
router.get(
  '/schemas/:schemaId',
  validateApiKey,
  rateLimit(1000, 60000), // 1000 requests per minute
  (req: Request, res: Response) => {
    try {
      const { schemaId } = req.params;
      const apiKey = (req as any).apiKey;
      
      // In production, get clientId from API key
      const clientId = 'demo_client';
      
      const schema = schemaProtectionService.getSchemaForClient(
        schemaId,
        clientId,
        {
          url: req.query.url,
          timestamp: new Date().toISOString()
        }
      );
      
      res.json(schema);
    } catch (error) {
      console.error('Error fetching schema:', error);
      res.status(404).json({ error: 'Schema not found' });
    }
  }
);

/**
 * Get performance report for schema usage
 * GET /api/v1/schemas/:schemaId/performance
 */
router.get(
  '/schemas/:schemaId/performance',
  validateApiKey,
  (req: Request, res: Response) => {
    try {
      const { schemaId } = req.params;
      
      // Mock actual metrics from client's usage
      const actualMetrics = {
        rankingChange: 23,
        trafficChange: 45,
        engagementChange: 3.8
      };
      
      const performanceReport = schemaProtectionService.generatePerformanceReport(
        schemaId,
        actualMetrics
      );
      
      res.json(performanceReport);
    } catch (error) {
      console.error('Error generating performance report:', error);
      res.status(500).json({ error: 'Failed to generate performance report' });
    }
  }
);

// =====================================================
// Health Check
// =====================================================

router.get('/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      onboarding: 'operational',
      dashboard: 'operational',
      schemas: 'operational'
    }
  });
});

export default router;
