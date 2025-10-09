import { EventEmitter } from 'events';
import { Logger } from '../../utils/Logger';
import { PuppeteerAutomationService, PerformanceMetrics, OptimizationSuggestion } from './PuppeteerAutomationService';
import { VisualTestingService, VisualTestResult } from './VisualTestingService';

export interface OptimizationRule {
  id: string;
  name: string;
  description: string;
  category: 'performance' | 'accessibility' | 'seo' | 'ux' | 'security';
  priority: 'low' | 'medium' | 'high' | 'critical';
  conditions: {
    metric?: keyof PerformanceMetrics;
    threshold?: number;
    operator?: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
    selector?: string;
    pattern?: string;
  }[];
  suggestions: {
    title: string;
    description: string;
    implementation: string;
    estimatedImpact: {
      performance?: number;
      accessibility?: number;
      seo?: number;
      userExperience?: number;
    };
    complexity: 'low' | 'medium' | 'high';
    effort: 'low' | 'medium' | 'high';
  }[];
  examples?: {
    before: string;
    after: string;
    explanation: string;
  }[];
}

export interface OptimizationAnalysis {
  url: string;
  timestamp: Date;
  performance: PerformanceMetrics;
  suggestions: OptimizationSuggestion[];
  score: {
    overall: number;
    performance: number;
    accessibility: number;
    seo: number;
    bestPractices: number;
  };
  priorities: {
    critical: OptimizationSuggestion[];
    high: OptimizationSuggestion[];
    medium: OptimizationSuggestion[];
    low: OptimizationSuggestion[];
  };
  estimatedImpact: {
    loadTimeImprovement: number;
    scoreImprovement: number;
    userExperienceGain: number;
  };
}

export interface OptimizationPlan {
  id: string;
  name: string;
  description: string;
  url: string;
  createdAt: Date;
  status: 'draft' | 'active' | 'completed' | 'paused';
  phases: OptimizationPhase[];
  metrics: {
    baseline: PerformanceMetrics;
    current: PerformanceMetrics;
    target: PerformanceMetrics;
  };
  timeline: {
    estimatedDuration: number;
    milestones: Array<{
      name: string;
      targetDate: Date;
      status: 'pending' | 'in-progress' | 'completed';
    }>;
  };
}

export interface OptimizationPhase {
  id: string;
  name: string;
  description: string;
  priority: number;
  estimatedEffort: number;
  suggestions: OptimizationSuggestion[];
  status: 'pending' | 'in-progress' | 'completed' | 'skipped';
  results?: {
    before: PerformanceMetrics;
    after: PerformanceMetrics;
    improvement: number;
  };
}

export class AIPerformanceOptimizer extends EventEmitter {
  private logger: Logger;
  private automationService: PuppeteerAutomationService;
  private visualTestingService: VisualTestingService;
  private optimizationRules: Map<string, OptimizationRule> = new Map();
  private optimizationPlans: Map<string, OptimizationPlan> = new Map();
  private analysisHistory: OptimizationAnalysis[] = [];

  constructor(
    automationService: PuppeteerAutomationService,
    visualTestingService: VisualTestingService
  ) {
    super();
    this.automationService = automationService;
    this.visualTestingService = visualTestingService;
    this.logger = new Logger('AIPerformanceOptimizer');
    
    this.initializeOptimizationRules();
  }

  /**
   * Initialize built-in optimization rules
   */
  private initializeOptimizationRules(): void {
    const rules: OptimizationRule[] = [
      {
        id: 'lcp-optimization',
        name: 'Optimize Largest Contentful Paint',
        description: 'Improve LCP by optimizing the largest content element',
        category: 'performance',
        priority: 'high',
        conditions: [
          {
            metric: 'largestContentfulPaint',
            threshold: 2500,
            operator: 'gt'
          }
        ],
        suggestions: [
          {
            title: 'Optimize Hero Image',
            description: 'The largest content element is likely an image that needs optimization',
            implementation: 'Convert to WebP format, implement lazy loading, add preload hints',
            estimatedImpact: {
              performance: 0.3,
              userExperience: 0.4
            },
            complexity: 'medium',
            effort: 'medium'
          },
          {
            title: 'Reduce Server Response Time',
            description: 'Optimize server-side rendering and response times',
            implementation: 'Implement caching, optimize database queries, use CDN',
            estimatedImpact: {
              performance: 0.4,
              userExperience: 0.3
            },
            complexity: 'high',
            effort: 'high'
          }
        ]
      },
      {
        id: 'cls-optimization',
        name: 'Reduce Cumulative Layout Shift',
        description: 'Minimize layout shifts that cause visual instability',
        category: 'performance',
        priority: 'high',
        conditions: [
          {
            metric: 'cumulativeLayoutShift',
            threshold: 0.1,
            operator: 'gt'
          }
        ],
        suggestions: [
          {
            title: 'Add Size Attributes to Images',
            description: 'Prevent layout shifts by reserving space for images',
            implementation: 'Add width and height attributes to all img elements',
            estimatedImpact: {
              performance: 0.2,
              userExperience: 0.5
            },
            complexity: 'low',
            effort: 'low'
          },
          {
            title: 'Reserve Space for Dynamic Content',
            description: 'Prevent shifts from dynamically loaded content',
            implementation: 'Use skeleton loaders, reserve space for ads, optimize font loading',
            estimatedImpact: {
              performance: 0.3,
              userExperience: 0.4
            },
            complexity: 'medium',
            effort: 'medium'
          }
        ]
      },
      {
        id: 'accessibility-optimization',
        name: 'Improve Accessibility',
        description: 'Enhance accessibility compliance and screen reader support',
        category: 'accessibility',
        priority: 'high',
        conditions: [
          {
            selector: 'img:not([alt])',
            pattern: 'exists'
          }
        ],
        suggestions: [
          {
            title: 'Add Alt Text to Images',
            description: 'Provide alternative text for all images',
            implementation: 'Add descriptive alt attributes to img elements',
            estimatedImpact: {
              accessibility: 0.6,
              userExperience: 0.3
            },
            complexity: 'low',
            effort: 'low'
          },
          {
            title: 'Improve Form Labels',
            description: 'Ensure all form inputs have proper labels',
            implementation: 'Add label elements or aria-label attributes',
            estimatedImpact: {
              accessibility: 0.5,
              userExperience: 0.4
            },
            complexity: 'low',
            effort: 'low'
          }
        ]
      },
      {
        id: 'seo-optimization',
        name: 'Enhance SEO',
        description: 'Improve search engine optimization',
        category: 'seo',
        priority: 'medium',
        conditions: [
          {
            selector: 'meta[name="description"]',
            pattern: 'missing'
          }
        ],
        suggestions: [
          {
            title: 'Add Meta Description',
            description: 'Include a compelling meta description for better search results',
            implementation: 'Add meta description tag with 150-160 characters',
            estimatedImpact: {
              seo: 0.4,
              userExperience: 0.2
            },
            complexity: 'low',
            effort: 'low'
          },
          {
            title: 'Optimize Heading Structure',
            description: 'Use proper heading hierarchy for better content structure',
            implementation: 'Ensure H1-H6 tags are used in logical order',
            estimatedImpact: {
              seo: 0.3,
              accessibility: 0.3
            },
            complexity: 'medium',
            effort: 'medium'
          }
        ]
      },
      {
        id: 'resource-optimization',
        name: 'Optimize Resource Loading',
        description: 'Improve resource loading and caching strategies',
        category: 'performance',
        priority: 'medium',
        conditions: [
          {
            metric: 'pageLoadTime',
            threshold: 3000,
            operator: 'gt'
          }
        ],
        suggestions: [
          {
            title: 'Implement Resource Hints',
            description: 'Use preload, prefetch, and preconnect for critical resources',
            implementation: 'Add link rel="preload" for critical CSS and fonts',
            estimatedImpact: {
              performance: 0.3,
              userExperience: 0.3
            },
            complexity: 'low',
            effort: 'low'
          },
          {
            title: 'Optimize Critical CSS',
            description: 'Inline critical CSS and defer non-critical styles',
            implementation: 'Extract and inline above-the-fold CSS',
            estimatedImpact: {
              performance: 0.4,
              userExperience: 0.2
            },
            complexity: 'high',
            effort: 'high'
          }
        ]
      }
    ];

    rules.forEach(rule => {
      this.optimizationRules.set(rule.id, rule);
    });

    this.logger.info(`Initialized ${rules.length} optimization rules`);
  }

  /**
   * Analyze page and generate optimization suggestions
   */
  async analyzePage(url: string, options?: {
    includeVisualTests?: boolean;
    testSuiteName?: string;
  }): Promise<OptimizationAnalysis> {
    const sessionId = `analysis_${Date.now()}`;
    
    try {
      this.logger.info(`Analyzing page: ${url}`);

      // Create automation session
      await this.automationService.createSession(sessionId, { url });
      
      // Get performance metrics
      const performance = await this.automationService.analyzePerformance(sessionId);
      
      // Generate optimization suggestions
      const suggestions = await this.automationService.generateOptimizationSuggestions(sessionId);
      
      // Apply AI rules to generate additional suggestions
      const aiSuggestions = await this.applyOptimizationRules(sessionId, performance);
      suggestions.push(...aiSuggestions);

      // Run visual tests if requested
      if (options?.includeVisualTests && options?.testSuiteName) {
        const visualResults = await this.visualTestingService.getTestResults(options.testSuiteName);
        const visualSuggestions = this.generateVisualOptimizations(visualResults);
        suggestions.push(...visualSuggestions);
      }

      // Calculate overall scores
      const scores = this.calculateScores(performance, suggestions);
      
      // Categorize suggestions by priority
      const priorities = this.categorizeSuggestions(suggestions);
      
      // Estimate impact
      const estimatedImpact = this.estimateImpact(suggestions);

      const analysis: OptimizationAnalysis = {
        url,
        timestamp: new Date(),
        performance,
        suggestions,
        score: scores,
        priorities,
        estimatedImpact
      };

      // Store analysis
      this.analysisHistory.push(analysis);
      
      this.logger.info(`Page analysis completed: ${url}`);
      this.emit('analysisCompleted', analysis);
      
      return analysis;

    } catch (error) {
      this.logger.error(`Page analysis failed: ${url}`, error);
      throw error;
    } finally {
      await this.automationService.closeSession(sessionId);
    }
  }

  /**
   * Apply optimization rules to generate AI-powered suggestions
   */
  private async applyOptimizationRules(sessionId: string, performance: PerformanceMetrics): Promise<OptimizationSuggestion[]> {
    const suggestions: OptimizationSuggestion[] = [];

    for (const [ruleId, rule] of this.optimizationRules) {
      if (await this.evaluateRuleConditions(sessionId, rule, performance)) {
        for (const suggestion of rule.suggestions) {
          suggestions.push({
            type: rule.category as any,
            priority: rule.priority,
            title: suggestion.title,
            description: suggestion.description,
            impact: `Estimated impact: ${this.formatImpact(suggestion.estimatedImpact)}`,
            implementation: suggestion.implementation,
            estimatedSavings: {
              score: suggestion.estimatedImpact.performance * 100
            }
          });
        }
      }
    }

    return suggestions;
  }

  /**
   * Evaluate rule conditions
   */
  private async evaluateRuleConditions(sessionId: string, rule: OptimizationRule, performance: PerformanceMetrics): Promise<boolean> {
    for (const condition of rule.conditions) {
      if (condition.metric && condition.threshold && condition.operator) {
        const value = performance[condition.metric];
        if (typeof value === 'number') {
          switch (condition.operator) {
            case 'gt':
              if (value <= condition.threshold) return false;
              break;
            case 'lt':
              if (value >= condition.threshold) return false;
              break;
            case 'eq':
              if (value !== condition.threshold) return false;
              break;
            case 'gte':
              if (value < condition.threshold) return false;
              break;
            case 'lte':
              if (value > condition.threshold) return false;
              break;
          }
        }
      }

      if (condition.selector) {
        // Check if selector exists in DOM
        try {
          const element = await this.automationService.findAndInteract(sessionId, {
            selector: condition.selector,
            action: 'screenshot' // Dummy action to check existence
          });
          
          if (condition.pattern === 'exists' && !element.success) {
            return false;
          }
        } catch (error) {
          if (condition.pattern === 'exists') {
            return false;
          }
        }
      }
    }

    return true;
  }

  /**
   * Generate visual optimization suggestions
   */
  private generateVisualOptimizations(visualResults: VisualTestResult[]): OptimizationSuggestion[] {
    const suggestions: OptimizationSuggestion[] = [];

    for (const result of visualResults) {
      if (!result.passed) {
        suggestions.push({
          type: 'ux',
          priority: 'medium',
          title: 'Visual Regression Detected',
          description: `Visual changes detected in test: ${result.testName}`,
          impact: 'May affect user experience and brand consistency',
          implementation: 'Review visual changes and update baselines if intentional'
        });
      }

      // Add performance-related visual optimizations
      if (result.metadata.performance.largestContentfulPaint > 2500) {
        suggestions.push({
          type: 'performance',
          priority: 'high',
          title: 'Optimize Visual Content Loading',
          description: 'Large visual content is affecting page load performance',
          impact: 'Improves Core Web Vitals and user experience',
          implementation: 'Optimize images, implement lazy loading, use modern formats'
        });
      }
    }

    return suggestions;
  }

  /**
   * Calculate performance scores
   */
  private calculateScores(performance: PerformanceMetrics, suggestions: OptimizationSuggestion[]): OptimizationAnalysis['score'] {
    // Calculate performance score (0-100)
    const performanceScore = Math.max(0, 100 - (
      (performance.largestContentfulPaint - 2500) / 100 +
      (performance.cumulativeLayoutShift * 100) +
      (performance.totalBlockingTime / 10)
    ));

    // Calculate accessibility score based on suggestions
    const accessibilitySuggestions = suggestions.filter(s => s.type === 'accessibility');
    const accessibilityScore = Math.max(0, 100 - (accessibilitySuggestions.length * 10));

    // Calculate SEO score based on suggestions
    const seoSuggestions = suggestions.filter(s => s.type === 'seo');
    const seoScore = Math.max(0, 100 - (seoSuggestions.length * 15));

    // Calculate best practices score
    const bestPracticesScore = Math.max(0, 100 - (suggestions.length * 2));

    // Calculate overall score
    const overallScore = (
      performanceScore * 0.4 +
      accessibilityScore * 0.3 +
      seoScore * 0.2 +
      bestPracticesScore * 0.1
    );

    return {
      overall: Math.round(overallScore),
      performance: Math.round(performanceScore),
      accessibility: Math.round(accessibilityScore),
      seo: Math.round(seoScore),
      bestPractices: Math.round(bestPracticesScore)
    };
  }

  /**
   * Categorize suggestions by priority
   */
  private categorizeSuggestions(suggestions: OptimizationSuggestion[]): OptimizationAnalysis['priorities'] {
    return {
      critical: suggestions.filter(s => s.priority === 'critical'),
      high: suggestions.filter(s => s.priority === 'high'),
      medium: suggestions.filter(s => s.priority === 'medium'),
      low: suggestions.filter(s => s.priority === 'low')
    };
  }

  /**
   * Estimate optimization impact
   */
  private estimateImpact(suggestions: OptimizationSuggestion[]): OptimizationAnalysis['estimatedImpact'] {
    const highPrioritySuggestions = suggestions.filter(s => s.priority === 'high' || s.priority === 'critical');
    
    return {
      loadTimeImprovement: highPrioritySuggestions.length * 15, // 15% per high priority suggestion
      scoreImprovement: highPrioritySuggestions.length * 20, // 20 points per high priority suggestion
      userExperienceGain: highPrioritySuggestions.length * 25 // 25% UX improvement
    };
  }

  /**
   * Format impact description
   */
  private formatImpact(impact: any): string {
    const parts = [];
    if (impact.performance) parts.push(`${Math.round(impact.performance * 100)}% performance`);
    if (impact.accessibility) parts.push(`${Math.round(impact.accessibility * 100)}% accessibility`);
    if (impact.seo) parts.push(`${Math.round(impact.seo * 100)}% SEO`);
    if (impact.userExperience) parts.push(`${Math.round(impact.userExperience * 100)}% UX`);
    
    return parts.join(', ');
  }

  /**
   * Create optimization plan
   */
  async createOptimizationPlan(url: string, name: string, description: string): Promise<OptimizationPlan> {
    const analysis = await this.analyzePage(url);
    
    const plan: OptimizationPlan = {
      id: `plan_${Date.now()}`,
      name,
      description,
      url,
      createdAt: new Date(),
      status: 'draft',
      phases: this.createOptimizationPhases(analysis),
      metrics: {
        baseline: analysis.performance,
        current: analysis.performance,
        target: this.generateTargetMetrics(analysis.performance)
      },
      timeline: {
        estimatedDuration: this.estimatePlanDuration(analysis.suggestions),
        milestones: this.createMilestones(analysis.suggestions)
      }
    };

    this.optimizationPlans.set(plan.id, plan);
    this.logger.info(`Created optimization plan: ${plan.name}`);
    this.emit('optimizationPlanCreated', plan);
    
    return plan;
  }

  /**
   * Create optimization phases
   */
  private createOptimizationPhases(analysis: OptimizationAnalysis): OptimizationPhase[] {
    const phases: OptimizationPhase[] = [];
    
    // Critical phase
    if (analysis.priorities.critical.length > 0) {
      phases.push({
        id: 'critical-phase',
        name: 'Critical Issues',
        description: 'Address critical performance and accessibility issues',
        priority: 1,
        estimatedEffort: analysis.priorities.critical.length * 4,
        suggestions: analysis.priorities.critical,
        status: 'pending'
      });
    }

    // High priority phase
    if (analysis.priorities.high.length > 0) {
      phases.push({
        id: 'high-priority-phase',
        name: 'High Priority Optimizations',
        description: 'Implement high-impact performance improvements',
        priority: 2,
        estimatedEffort: analysis.priorities.high.length * 2,
        suggestions: analysis.priorities.high,
        status: 'pending'
      });
    }

    // Medium priority phase
    if (analysis.priorities.medium.length > 0) {
      phases.push({
        id: 'medium-priority-phase',
        name: 'Medium Priority Enhancements',
        description: 'Improve SEO and user experience',
        priority: 3,
        estimatedEffort: analysis.priorities.medium.length * 1,
        suggestions: analysis.priorities.medium,
        status: 'pending'
      });
    }

    return phases;
  }

  /**
   * Generate target metrics
   */
  private generateTargetMetrics(baseline: PerformanceMetrics): PerformanceMetrics {
    return {
      ...baseline,
      pageLoadTime: Math.max(baseline.pageLoadTime * 0.7, 1000), // 30% improvement, min 1s
      largestContentfulPaint: Math.max(baseline.largestContentfulPaint * 0.6, 1200), // 40% improvement, min 1.2s
      cumulativeLayoutShift: Math.max(baseline.cumulativeLayoutShift * 0.3, 0.05), // 70% improvement, max 0.05
      totalBlockingTime: Math.max(baseline.totalBlockingTime * 0.5, 100) // 50% improvement, min 100ms
    };
  }

  /**
   * Estimate plan duration
   */
  private estimatePlanDuration(suggestions: OptimizationSuggestion[]): number {
    return suggestions.reduce((total, suggestion) => {
      const effort = suggestion.priority === 'critical' ? 4 : 
                    suggestion.priority === 'high' ? 2 : 
                    suggestion.priority === 'medium' ? 1 : 0.5;
      return total + effort;
    }, 0);
  }

  /**
   * Create milestones
   */
  private createMilestones(suggestions: OptimizationSuggestion[]): OptimizationPlan['timeline']['milestones'] {
    const milestones = [];
    const criticalCount = suggestions.filter(s => s.priority === 'critical').length;
    const highCount = suggestions.filter(s => s.priority === 'high').length;
    
    if (criticalCount > 0) {
      milestones.push({
        name: 'Critical Issues Resolved',
        targetDate: new Date(Date.now() + criticalCount * 4 * 24 * 60 * 60 * 1000), // 4 days per critical issue
        status: 'pending' as const
      });
    }
    
    if (highCount > 0) {
      milestones.push({
        name: 'High Priority Optimizations',
        targetDate: new Date(Date.now() + (criticalCount * 4 + highCount * 2) * 24 * 60 * 60 * 1000),
        status: 'pending' as const
      });
    }
    
    milestones.push({
      name: 'All Optimizations Complete',
      targetDate: new Date(Date.now() + this.estimatePlanDuration(suggestions) * 24 * 60 * 60 * 1000),
      status: 'pending' as const
    });
    
    return milestones;
  }

  /**
   * Get optimization plan
   */
  getOptimizationPlan(id: string): OptimizationPlan | undefined {
    return this.optimizationPlans.get(id);
  }

  /**
   * List optimization plans
   */
  listOptimizationPlans(): OptimizationPlan[] {
    return Array.from(this.optimizationPlans.values());
  }

  /**
   * Get analysis history
   */
  getAnalysisHistory(): OptimizationAnalysis[] {
    return this.analysisHistory;
  }

  /**
   * Get service status
   */
  getStatus(): any {
    return {
      optimizationRules: this.optimizationRules.size,
      optimizationPlans: this.optimizationPlans.size,
      analysisHistory: this.analysisHistory.length,
      activePlans: Array.from(this.optimizationPlans.values()).filter(p => p.status === 'active').length
    };
  }
}

export default AIPerformanceOptimizer;
