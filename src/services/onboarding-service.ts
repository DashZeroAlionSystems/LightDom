/**
 * Client Onboarding Service
 * 
 * Manages secure, step-by-step client onboarding process
 * Integrates with encryption and schema protection services
 */

import crypto from 'crypto';
import { getEncryptionService } from '../security/encryption';

interface OnboardingSession {
  id: string;
  email: string;
  sessionToken: string;
  currentStep: number;
  totalSteps: number;
  status: 'in_progress' | 'completed' | 'abandoned' | 'failed';
  collectedData: {
    companyName?: string;
    websiteUrl?: string;
    industry?: string;
    businessSize?: string;
    goals?: string[];
    targetKeywords?: string[];
    competitorUrls?: string[];
    selectedPlan?: string;
    billingCycle?: string;
    integrationType?: string;
    technicalLevel?: string;
  };
  stepsCompleted: Record<number, { completed: boolean; timestamp: string }>;
  metadata: Record<string, any>;
  startedAt: Date;
  lastActivityAt: Date;
  expiresAt: Date;
}

interface OnboardingStepDefinition {
  stepNumber: number;
  stepName: string;
  stepTitle: string;
  stepDescription: string;
  componentType: 'welcome' | 'form' | 'analysis' | 'selection' | 'setup' | 'completion';
  requiredFields: string[];
  optionalFields: string[];
  validationRules: Record<string, any>;
  helpText?: string;
  estimatedDurationSeconds: number;
}

/**
 * Onboarding Service
 */
export class OnboardingService {
  private sessions: Map<string, OnboardingSession> = new Map();
  private stepDefinitions: Map<number, OnboardingStepDefinition> = new Map();
  private encryptionService = getEncryptionService();

  constructor() {
    this.initializeStepDefinitions();
  }

  /**
   * Initialize onboarding step definitions
   */
  private initializeStepDefinitions(): void {
    const steps: OnboardingStepDefinition[] = [
      {
        stepNumber: 1,
        stepName: 'welcome',
        stepTitle: 'Welcome to LightDom',
        stepDescription: 'Let\'s get started with your SEO optimization journey',
        componentType: 'welcome',
        requiredFields: ['email'],
        optionalFields: [],
        validationRules: {
          email: { type: 'email', required: true }
        },
        estimatedDurationSeconds: 30
      },
      {
        stepNumber: 2,
        stepName: 'business_info',
        stepTitle: 'Tell Us About Your Business',
        stepDescription: 'Help us understand your business and goals',
        componentType: 'form',
        requiredFields: ['companyName', 'websiteUrl', 'industry'],
        optionalFields: ['businessSize'],
        validationRules: {
          companyName: { minLength: 2, maxLength: 255 },
          websiteUrl: { type: 'url', required: true },
          industry: { required: true }
        },
        helpText: 'This information helps us tailor SEO strategies to your specific needs',
        estimatedDurationSeconds: 120
      },
      {
        stepNumber: 3,
        stepName: 'seo_analysis',
        stepTitle: 'Initial SEO Analysis',
        stepDescription: 'We\'ll analyze your website to identify opportunities',
        componentType: 'analysis',
        requiredFields: [],
        optionalFields: ['targetKeywords', 'competitorUrls'],
        validationRules: {},
        helpText: 'Our AI analyzes your website and compares it with competitors',
        estimatedDurationSeconds: 180
      },
      {
        stepNumber: 4,
        stepName: 'plan_selection',
        stepTitle: 'Choose Your Plan',
        stepDescription: 'Select the plan that best fits your needs',
        componentType: 'selection',
        requiredFields: ['selectedPlan', 'billingCycle'],
        optionalFields: [],
        validationRules: {
          selectedPlan: { 
            enum: ['starter', 'professional', 'business', 'enterprise'] 
          },
          billingCycle: { 
            enum: ['monthly', 'annual'] 
          }
        },
        estimatedDurationSeconds: 90
      },
      {
        stepNumber: 5,
        stepName: 'setup_method',
        stepTitle: 'Setup Your Integration',
        stepDescription: 'Choose how you want to integrate LightDom',
        componentType: 'selection',
        requiredFields: ['integrationType'],
        optionalFields: ['technicalLevel'],
        validationRules: {
          integrationType: { 
            enum: ['script_injection', 'api', 'plugin'] 
          }
        },
        estimatedDurationSeconds: 60
      },
      {
        stepNumber: 6,
        stepName: 'configuration',
        stepTitle: 'Configure Your Settings',
        stepDescription: 'Customize your SEO optimization preferences',
        componentType: 'form',
        requiredFields: [],
        optionalFields: ['goals'],
        validationRules: {},
        estimatedDurationSeconds: 120
      },
      {
        stepNumber: 7,
        stepName: 'complete',
        stepTitle: 'You\'re All Set!',
        stepDescription: 'Your account is ready to start optimizing',
        componentType: 'completion',
        requiredFields: [],
        optionalFields: [],
        validationRules: {},
        estimatedDurationSeconds: 30
      }
    ];

    steps.forEach(step => {
      this.stepDefinitions.set(step.stepNumber, step);
    });
  }

  /**
   * Start a new onboarding session
   */
  startOnboarding(email: string, metadata: Record<string, any> = {}): OnboardingSession {
    const sessionToken = this.generateSessionToken();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const session: OnboardingSession = {
      id: crypto.randomUUID(),
      email,
      sessionToken,
      currentStep: 1,
      totalSteps: 7,
      status: 'in_progress',
      collectedData: {},
      stepsCompleted: {},
      metadata: {
        ...metadata,
        startedFrom: metadata.referralSource || 'direct',
        userAgent: metadata.userAgent || 'unknown'
      },
      startedAt: now,
      lastActivityAt: now,
      expiresAt
    };

    this.sessions.set(sessionToken, session);

    return session;
  }

  /**
   * Generate a secure session token
   */
  private generateSessionToken(): string {
    return crypto.randomBytes(64).toString('hex');
  }

  /**
   * Get onboarding session by token
   */
  getSession(sessionToken: string): OnboardingSession | null {
    const session = this.sessions.get(sessionToken);
    
    if (!session) {
      return null;
    }

    // Check if session expired
    if (new Date() > session.expiresAt) {
      session.status = 'abandoned';
      return null;
    }

    return session;
  }

  /**
   * Update session data for current step
   */
  updateStepData(
    sessionToken: string,
    stepNumber: number,
    data: Record<string, any>
  ): { success: boolean; errors?: string[] } {
    const session = this.getSession(sessionToken);
    
    if (!session) {
      return { success: false, errors: ['Session not found or expired'] };
    }

    if (stepNumber !== session.currentStep) {
      return { success: false, errors: ['Invalid step number'] };
    }

    const stepDef = this.stepDefinitions.get(stepNumber);
    
    if (!stepDef) {
      return { success: false, errors: ['Step definition not found'] };
    }

    // Validate required fields
    const errors: string[] = [];
    
    for (const field of stepDef.requiredFields) {
      if (!data[field]) {
        errors.push(`${field} is required`);
      }
    }

    if (errors.length > 0) {
      return { success: false, errors };
    }

    // Update session data
    session.collectedData = {
      ...session.collectedData,
      ...data
    };

    // Mark step as completed
    session.stepsCompleted[stepNumber] = {
      completed: true,
      timestamp: new Date().toISOString()
    };

    session.lastActivityAt = new Date();

    return { success: true };
  }

  /**
   * Move to next step
   */
  nextStep(sessionToken: string): { success: boolean; nextStep?: number; errors?: string[] } {
    const session = this.getSession(sessionToken);
    
    if (!session) {
      return { success: false, errors: ['Session not found or expired'] };
    }

    // Check if current step is completed
    if (!session.stepsCompleted[session.currentStep]?.completed) {
      return { 
        success: false, 
        errors: ['Current step must be completed before proceeding'] 
      };
    }

    // Move to next step
    if (session.currentStep < session.totalSteps) {
      session.currentStep += 1;
      session.lastActivityAt = new Date();
      return { success: true, nextStep: session.currentStep };
    } else {
      // All steps completed
      session.status = 'completed';
      return { success: true, nextStep: session.currentStep };
    }
  }

  /**
   * Go back to previous step
   */
  previousStep(sessionToken: string): { success: boolean; previousStep?: number } {
    const session = this.getSession(sessionToken);
    
    if (!session) {
      return { success: false };
    }

    if (session.currentStep > 1) {
      session.currentStep -= 1;
      session.lastActivityAt = new Date();
      return { success: true, previousStep: session.currentStep };
    }

    return { success: false };
  }

  /**
   * Complete onboarding and create client account
   */
  async completeOnboarding(sessionToken: string): Promise<{
    success: boolean;
    clientId?: string;
    apiKey?: string;
    errors?: string[];
  }> {
    const session = this.getSession(sessionToken);
    
    if (!session) {
      return { success: false, errors: ['Session not found or expired'] };
    }

    if (session.status !== 'in_progress') {
      return { success: false, errors: ['Session already completed or abandoned'] };
    }

    // Verify all required steps are completed
    const allStepsCompleted = Array.from(this.stepDefinitions.keys()).every(
      stepNum => session.stepsCompleted[stepNum]?.completed
    );

    if (!allStepsCompleted) {
      return { success: false, errors: ['All steps must be completed'] };
    }

    try {
      // Generate API key for client
      const apiKey = this.encryptionService.constructor.generateApiKey('ld_live');
      const apiKeyHash = this.encryptionService.hashApiKey(apiKey);

      // In production, this would create database records
      const clientId = crypto.randomUUID();

      // Mark session as completed
      session.status = 'completed';

      // Clean up session data (would persist to DB in production)
      // this.sessions.delete(sessionToken);

      return {
        success: true,
        clientId,
        apiKey
      };
    } catch (error) {
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Get step definition
   */
  getStepDefinition(stepNumber: number): OnboardingStepDefinition | null {
    return this.stepDefinitions.get(stepNumber) || null;
  }

  /**
   * Get all step definitions
   */
  getAllStepDefinitions(): OnboardingStepDefinition[] {
    return Array.from(this.stepDefinitions.values());
  }

  /**
   * Abandon session
   */
  abandonSession(sessionToken: string): boolean {
    const session = this.sessions.get(sessionToken);
    
    if (session) {
      session.status = 'abandoned';
      return true;
    }

    return false;
  }
}

/**
 * Singleton instance
 */
let onboardingServiceInstance: OnboardingService | null = null;

export function getOnboardingService(): OnboardingService {
  if (!onboardingServiceInstance) {
    onboardingServiceInstance = new OnboardingService();
  }
  return onboardingServiceInstance;
}

export default OnboardingService;
