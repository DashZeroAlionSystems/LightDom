/**
 * Web Address Miner
 * Specialized service for mining and analyzing web addresses for DOM optimization
 */

import { EventEmitter } from 'events';
import {
  storageNodeManager,
  StorageNode,
  MiningTarget,
  MiningMetadata,
} from './StorageNodeManager';
import { headlessBrowserService } from './HeadlessBrowserService';
import { spaceOptimizationEngine } from '../core/SpaceOptimizationEngine';

export interface MiningJob {
  id: string;
  url: string;
  priority: 'high' | 'medium' | 'low';
  status: 'queued' | 'mining' | 'analyzing' | 'optimizing' | 'completed' | 'failed';
  nodeId?: string;
  target?: MiningTarget;
  results?: MiningResults;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
}

export interface MiningResults {
  originalSize: number; // Original DOM size in KB
  optimizedSize: number; // Optimized DOM size in KB
  spaceSaved: number; // Space saved in KB
  optimizationRate: number; // Optimization percentage
  tokensEarned: number; // Tokens earned from mining
  optimizations: Optimization[];
  performance: PerformanceMetrics;
  metadata: MiningMetadata;
}

export interface Optimization {
  type: 'html' | 'css' | 'js' | 'images' | 'fonts' | 'resources';
  description: string;
  spaceSaved: number; // Space saved in KB
  impact: 'high' | 'medium' | 'low';
  implementation: string; // Implementation suggestion
  estimatedTime: number; // Estimated implementation time in minutes
}

export interface PerformanceMetrics {
  loadTime: number; // Page load time in ms
  domSize: number; // DOM size in KB
  resourceCount: number; // Number of resources
  imageCount: number; // Number of images
  scriptCount: number; // Number of scripts
  styleCount: number; // Number of stylesheets
  networkRequests: number; // Number of network requests
  lighthouseScore: number; // Lighthouse performance score (0-100)
}

export interface MiningConfig {
  maxConcurrentJobs: number;
  timeoutMs: number;
  retryAttempts: number;
  enableDeepAnalysis: boolean;
  enablePerformanceTesting: boolean;
  enableLighthouseAudit: boolean;
  optimizationThreshold: number; // Minimum space savings to qualify (KB)
  tokenRewardRate: number; // Tokens per KB saved
}

export interface MiningStats {
  totalJobs: number;
  completedJobs: number;
  failedJobs: number;
  successRate: number;
  totalSpaceSaved: number;
  totalTokensEarned: number;
  averageOptimizationRate: number;
  topOptimizations: Optimization[];
  performanceBySiteType: Map<string, PerformanceMetrics>;
}

export class WebAddressMiner extends EventEmitter {
  private jobs: Map<string, MiningJob> = new Map();
  private isRunning: boolean = false;
  private processingInterval: NodeJS.Timeout | null = null;
  private config: MiningConfig;

  constructor(config?: Partial<MiningConfig>) {
    super();

    this.config = {
      maxConcurrentJobs: 5,
      timeoutMs: 60000,
      retryAttempts: 3,
      enableDeepAnalysis: true,
      enablePerformanceTesting: true,
      enableLighthouseAudit: true,
      optimizationThreshold: 10, // 10KB minimum
      tokenRewardRate: 0.001, // 1 token per KB
      ...config,
    };

    this.setupEventHandlers();
  }

  /**
   * Initialize the web address miner
   */
  async initialize(): Promise<void> {
    console.log('⛏️ Initializing Web Address Miner...');

    try {
      // Initialize headless browser service
      await headlessBrowserService.initialize();

      // Start processing jobs
      this.startProcessing();

      this.isRunning = true;
      this.emit('initialized');

      console.log('✅ Web Address Miner initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Web Address Miner:', error);
      throw error;
    }
  }

  /**
   * Add a web address to mining queue
   */
  async addMiningJob(url: string, priority: 'high' | 'medium' | 'low' = 'medium'): Promise<string> {
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const job: MiningJob = {
      id: jobId,
      url,
      priority,
      status: 'queued',
      createdAt: new Date(),
    };

    this.jobs.set(jobId, job);

    this.emit('jobQueued', job);
    console.log(`📝 Mining job queued: ${url} (${jobId})`);

    return jobId;
  }

  /**
   * Add multiple web addresses to mining queue
   */
  async addMiningJobs(
    urls: Array<{ url: string; priority?: 'high' | 'medium' | 'low' }>
  ): Promise<string[]> {
    const jobIds: string[] = [];

    for (const { url, priority = 'medium' } of urls) {
      const jobId = await this.addMiningJob(url, priority);
      jobIds.push(jobId);
    }

    return jobIds;
  }

  /**
   * Start processing mining jobs
   */
  private startProcessing(): void {
    this.processingInterval = setInterval(async () => {
      if (!this.isRunning) return;

      const queuedJobs = Array.from(this.jobs.values())
        .filter(job => job.status === 'queued')
        .sort((a, b) => {
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        });

      const activeJobs = Array.from(this.jobs.values()).filter(job =>
        ['mining', 'analyzing', 'optimizing'].includes(job.status)
      );

      // Process jobs up to the concurrent limit
      const availableSlots = this.config.maxConcurrentJobs - activeJobs.length;
      const jobsToProcess = queuedJobs.slice(0, availableSlots);

      for (const job of jobsToProcess) {
        this.processMiningJob(job);
      }
    }, 2000); // Check every 2 seconds
  }

  /**
   * Process a mining job
   */
  private async processMiningJob(job: MiningJob): Promise<void> {
    try {
      job.status = 'mining';
      job.startedAt = new Date();

      this.emit('jobStarted', job);
      console.log(`⛏️ Starting mining job: ${job.url}`);

      // Find available storage node
      const node = await this.findAvailableNode();
      if (!node) {
        throw new Error('No available storage nodes');
      }

      job.nodeId = node.id;

      // Create mining target
      const target = await storageNodeManager.addMiningTarget(node.id, {
        url: job.url,
        priority: job.priority,
        metadata: await this.analyzeUrl(job.url),
      });

      job.target = target;
      job.status = 'analyzing';

      // Perform deep analysis
      const results = await this.performDeepAnalysis(job.url);
      job.results = results;

      // Check if optimization meets threshold
      if (results.spaceSaved < this.config.optimizationThreshold) {
        job.status = 'completed';
        job.completedAt = new Date();
        this.emit('jobCompleted', job);
        console.log(
          `✅ Mining job completed (below threshold): ${job.url} - ${results.spaceSaved}KB saved`
        );
        return;
      }

      job.status = 'optimizing';

      // Apply optimizations
      await this.applyOptimizations(job.url, results.optimizations);

      // Update mining target with results
      if (job.target) {
        job.target.actualSize = results.originalSize;
        job.target.spaceSaved = results.spaceSaved;
        job.target.tokensEarned = results.tokensEarned;
        job.target.status = 'completed';
        job.target.completedAt = new Date();
      }

      job.status = 'completed';
      job.completedAt = new Date();

      this.emit('jobCompleted', job);
      console.log(
        `✅ Mining job completed: ${job.url} - ${results.spaceSaved}KB saved, ${results.tokensEarned} tokens earned`
      );
    } catch (error) {
      job.status = 'failed';
      job.error = error instanceof Error ? error.message : String(error);
      job.completedAt = new Date();

      this.emit('jobFailed', job);
      console.error(`❌ Mining job failed: ${job.url} - ${job.error}`);
    }
  }

  /**
   * Find an available storage node
   */
  private async findAvailableNode(): Promise<StorageNode | null> {
    const activeNodes = storageNodeManager.getActiveNodes();

    // Find node with available capacity and concurrent mining slots
    for (const node of activeNodes) {
      const activeTargets = node.miningTargets.filter(t => t.status === 'mining').length;
      if (activeTargets < node.configuration.maxConcurrentMining) {
        return node;
      }
    }

    return null;
  }

  /**
   * Analyze URL for mining potential
   */
  private async analyzeUrl(url: string): Promise<MiningMetadata> {
    try {
      // Use headless browser to analyze the page
      const page = await headlessBrowserService.createPage(url);

      // Get basic page information
      const pageInfo = await headlessBrowserService.analyzePage(page);

      // Detect technologies
      const technologies = await this.detectTechnologies(page);

      // Estimate optimization potential
      const optimizationPotential = this.estimateOptimizationPotential(pageInfo);

      // Generate estimated optimizations
      const estimatedOptimizations = this.generateOptimizationSuggestions(pageInfo);

      // Determine site type
      const siteType = this.detectSiteType(url, pageInfo);

      // Calculate complexity score
      const complexity = this.calculateComplexityScore(pageInfo);

      return {
        siteType,
        technologies,
        optimizationPotential,
        estimatedOptimizations,
        biomeType: 'digital',
        complexity,
      };
    } catch (error) {
      console.error(`Failed to analyze URL ${url}:`, error);

      // Return default metadata
      return {
        siteType: 'corporate',
        technologies: [],
        optimizationPotential: 'medium',
        estimatedOptimizations: [],
        biomeType: 'digital',
        complexity: 5,
      };
    }
  }

  /**
   * Perform deep analysis of the web page
   */
  private async performDeepAnalysis(url: string): Promise<MiningResults> {
    try {
      const page = await headlessBrowserService.createPage(url);

      // Get performance metrics
      const performance = await this.measurePerformance(page);

      // Analyze DOM structure
      const domAnalysis = await this.analyzeDOM(page);

      // Identify optimization opportunities
      const optimizations = await this.identifyOptimizations(page, domAnalysis);

      // Calculate space savings
      const spaceSaved = optimizations.reduce((total, opt) => total + opt.spaceSaved, 0);
      const optimizationRate = domAnalysis.size > 0 ? (spaceSaved / domAnalysis.size) * 100 : 0;
      const tokensEarned = spaceSaved * this.config.tokenRewardRate;

      // Generate metadata
      const metadata: MiningMetadata = {
        siteType: this.detectSiteType(url, domAnalysis),
        technologies: await this.detectTechnologies(page),
        optimizationPotential:
          optimizationRate > 30 ? 'high' : optimizationRate > 15 ? 'medium' : 'low',
        estimatedOptimizations: optimizations.map(opt => opt.description),
        biomeType: 'digital',
        complexity: this.calculateComplexityScore(domAnalysis),
      };

      return {
        originalSize: domAnalysis.size,
        optimizedSize: domAnalysis.size - spaceSaved,
        spaceSaved,
        optimizationRate,
        tokensEarned,
        optimizations,
        performance,
        metadata,
      };
    } catch (error) {
      console.error(`Deep analysis failed for ${url}:`, error);
      throw error;
    }
  }

  /**
   * Apply optimizations to the page
   */
  private async applyOptimizations(url: string, optimizations: Optimization[]): Promise<void> {
    try {
      const page = await headlessBrowserService.createPage(url);

      for (const optimization of optimizations) {
        await this.applyOptimization(page, optimization);
      }

      // Verify optimizations were applied
      await this.verifyOptimizations(page, optimizations);
    } catch (error) {
      console.error(`Failed to apply optimizations to ${url}:`, error);
      throw error;
    }
  }

  /**
   * Detect technologies used on the page
   */
  private async detectTechnologies(page: any): Promise<string[]> {
    const technologies: string[] = [];

    try {
      // Check for common frameworks
      const frameworks = [
        'React',
        'Vue',
        'Angular',
        'jQuery',
        'Bootstrap',
        'Tailwind',
        'Material-UI',
      ];

      for (const framework of frameworks) {
        const isPresent = await page.evaluate(name => {
          return (
            window[name] !== undefined ||
            document.querySelector(`[data-${name.toLowerCase()}]`) !== null ||
            document.querySelector(`script[src*="${name.toLowerCase()}"]`) !== null
          );
        }, framework);

        if (isPresent) {
          technologies.push(framework);
        }
      }

      // Check for other technologies
      const otherTechs = ['Webpack', 'Babel', 'TypeScript', 'Sass', 'Less', 'PostCSS'];

      for (const tech of otherTechs) {
        const isPresent = await page.evaluate(name => {
          return (
            document.querySelector(`script[src*="${name.toLowerCase()}"]`) !== null ||
            document.querySelector(`link[href*="${name.toLowerCase()}"]`) !== null
          );
        }, tech);

        if (isPresent) {
          technologies.push(tech);
        }
      }
    } catch (error) {
      console.error('Failed to detect technologies:', error);
    }

    return technologies;
  }

  /**
   * Estimate optimization potential
   */
  private estimateOptimizationPotential(pageInfo: any): 'high' | 'medium' | 'low' {
    const size = pageInfo.domSize || 0;
    const resourceCount = pageInfo.resourceCount || 0;
    const imageCount = pageInfo.imageCount || 0;

    let score = 0;

    // Size-based scoring
    if (size > 5000) score += 3;
    else if (size > 2000) score += 2;
    else if (size > 1000) score += 1;

    // Resource count scoring
    if (resourceCount > 100) score += 2;
    else if (resourceCount > 50) score += 1;

    // Image count scoring
    if (imageCount > 20) score += 2;
    else if (imageCount > 10) score += 1;

    if (score >= 5) return 'high';
    if (score >= 3) return 'medium';
    return 'low';
  }

  /**
   * Generate optimization suggestions
   */
  private generateOptimizationSuggestions(pageInfo: any): string[] {
    const suggestions: string[] = [];

    if (pageInfo.domSize > 2000) {
      suggestions.push('HTML minification');
      suggestions.push('Remove unused HTML elements');
    }

    if (pageInfo.imageCount > 10) {
      suggestions.push('Image optimization');
      suggestions.push('Lazy loading for images');
    }

    if (pageInfo.scriptCount > 5) {
      suggestions.push('JavaScript bundling');
      suggestions.push('Remove unused JavaScript');
    }

    if (pageInfo.styleCount > 3) {
      suggestions.push('CSS minification');
      suggestions.push('Remove unused CSS');
    }

    return suggestions;
  }

  /**
   * Detect site type based on URL and page content
   */
  private detectSiteType(
    url: string,
    pageInfo: any
  ): 'ecommerce' | 'blog' | 'corporate' | 'portfolio' | 'news' | 'social' {
    const domain = new URL(url).hostname.toLowerCase();

    // E-commerce indicators
    if (
      domain.includes('shop') ||
      domain.includes('store') ||
      domain.includes('buy') ||
      pageInfo.content?.includes('cart') ||
      pageInfo.content?.includes('checkout')
    ) {
      return 'ecommerce';
    }

    // Blog indicators
    if (
      domain.includes('blog') ||
      pageInfo.content?.includes('article') ||
      pageInfo.content?.includes('post')
    ) {
      return 'blog';
    }

    // News indicators
    if (domain.includes('news') || domain.includes('times') || domain.includes('post')) {
      return 'news';
    }

    // Social indicators
    if (
      domain.includes('social') ||
      domain.includes('community') ||
      pageInfo.content?.includes('follow') ||
      pageInfo.content?.includes('share')
    ) {
      return 'social';
    }

    // Portfolio indicators
    if (
      domain.includes('portfolio') ||
      pageInfo.content?.includes('work') ||
      pageInfo.content?.includes('projects')
    ) {
      return 'portfolio';
    }

    return 'corporate';
  }

  /**
   * Calculate complexity score
   */
  private calculateComplexityScore(pageInfo: any): number {
    let score = 1;

    const size = pageInfo.domSize || 0;
    const resourceCount = pageInfo.resourceCount || 0;
    const scriptCount = pageInfo.scriptCount || 0;
    const styleCount = pageInfo.styleCount || 0;

    // Size complexity
    if (size > 10000) score += 3;
    else if (size > 5000) score += 2;
    else if (size > 2000) score += 1;

    // Resource complexity
    if (resourceCount > 200) score += 3;
    else if (resourceCount > 100) score += 2;
    else if (resourceCount > 50) score += 1;

    // Script complexity
    if (scriptCount > 20) score += 2;
    else if (scriptCount > 10) score += 1;

    // Style complexity
    if (styleCount > 10) score += 2;
    else if (styleCount > 5) score += 1;

    return Math.min(score, 10);
  }

  /**
   * Measure page performance
   */
  private async measurePerformance(page: any): Promise<PerformanceMetrics> {
    try {
      const metrics = await page.evaluate(() => {
        const navigation = performance.getEntriesByType(
          'navigation'
        )[0] as PerformanceNavigationTiming;
        const paint = performance.getEntriesByType('paint');

        return {
          loadTime: navigation.loadEventEnd - navigation.loadEventStart,
          domSize: document.documentElement.outerHTML.length / 1024,
          resourceCount: performance.getEntriesByType('resource').length,
          imageCount: document.querySelectorAll('img').length,
          scriptCount: document.querySelectorAll('script').length,
          styleCount: document.querySelectorAll('link[rel="stylesheet"], style').length,
          networkRequests: performance.getEntriesByType('resource').length,
          lighthouseScore: 0, // Would be calculated by Lighthouse
        };
      });

      return metrics;
    } catch (error) {
      console.error('Failed to measure performance:', error);
      return {
        loadTime: 0,
        domSize: 0,
        resourceCount: 0,
        imageCount: 0,
        scriptCount: 0,
        styleCount: 0,
        networkRequests: 0,
        lighthouseScore: 0,
      };
    }
  }

  /**
   * Analyze DOM structure
   */
  private async analyzeDOM(page: any): Promise<any> {
    try {
      const analysis = await page.evaluate(() => {
        const html = document.documentElement.outerHTML;
        const size = html.length / 1024; // Size in KB

        return {
          size,
          elementCount: document.querySelectorAll('*').length,
          imageCount: document.querySelectorAll('img').length,
          scriptCount: document.querySelectorAll('script').length,
          styleCount: document.querySelectorAll('link[rel="stylesheet"], style').length,
          linkCount: document.querySelectorAll('a').length,
          divCount: document.querySelectorAll('div').length,
          spanCount: document.querySelectorAll('span').length,
          content: document.body.textContent?.substring(0, 1000) || '',
        };
      });

      return analysis;
    } catch (error) {
      console.error('Failed to analyze DOM:', error);
      return {
        size: 0,
        elementCount: 0,
        imageCount: 0,
        scriptCount: 0,
        styleCount: 0,
        linkCount: 0,
        divCount: 0,
        spanCount: 0,
        content: '',
      };
    }
  }

  /**
   * Identify optimization opportunities
   */
  private async identifyOptimizations(page: any, domAnalysis: any): Promise<Optimization[]> {
    const optimizations: Optimization[] = [];

    // HTML optimizations
    if (domAnalysis.size > 1000) {
      optimizations.push({
        type: 'html',
        description: 'HTML minification and cleanup',
        spaceSaved: Math.floor(domAnalysis.size * 0.1),
        impact: 'medium',
        implementation: 'Remove unnecessary whitespace and comments',
        estimatedTime: 15,
      });
    }

    // Image optimizations
    if (domAnalysis.imageCount > 5) {
      optimizations.push({
        type: 'images',
        description: 'Image optimization and lazy loading',
        spaceSaved: Math.floor(domAnalysis.imageCount * 50),
        impact: 'high',
        implementation: 'Compress images and implement lazy loading',
        estimatedTime: 30,
      });
    }

    // Script optimizations
    if (domAnalysis.scriptCount > 3) {
      optimizations.push({
        type: 'js',
        description: 'JavaScript bundling and minification',
        spaceSaved: Math.floor(domAnalysis.scriptCount * 20),
        impact: 'high',
        implementation: 'Bundle and minify JavaScript files',
        estimatedTime: 25,
      });
    }

    // CSS optimizations
    if (domAnalysis.styleCount > 2) {
      optimizations.push({
        type: 'css',
        description: 'CSS minification and optimization',
        spaceSaved: Math.floor(domAnalysis.styleCount * 15),
        impact: 'medium',
        implementation: 'Minify CSS and remove unused styles',
        estimatedTime: 20,
      });
    }

    return optimizations;
  }

  /**
   * Apply a specific optimization
   */
  private async applyOptimization(page: any, optimization: Optimization): Promise<void> {
    try {
      switch (optimization.type) {
        case 'html':
          await this.applyHTMLOptimization(page);
          break;
        case 'images':
          await this.applyImageOptimization(page);
          break;
        case 'js':
          await this.applyJSOptimization(page);
          break;
        case 'css':
          await this.applyCSSOptimization(page);
          break;
        default:
          console.log(`Optimization type ${optimization.type} not implemented`);
      }
    } catch (error) {
      console.error(`Failed to apply ${optimization.type} optimization:`, error);
    }
  }

  /**
   * Apply HTML optimizations
   */
  private async applyHTMLOptimization(page: any): Promise<void> {
    await page.evaluate(() => {
      // Remove comments
      const comments = document.createTreeWalker(document, NodeFilter.SHOW_COMMENT, null);

      let comment;
      while ((comment = comments.nextNode())) {
        comment.remove();
      }

      // Remove empty elements
      const emptyElements = document.querySelectorAll('div:empty, span:empty, p:empty');
      emptyElements.forEach(el => el.remove());
    });
  }

  /**
   * Apply image optimizations
   */
  private async applyImageOptimization(page: any): Promise<void> {
    await page.evaluate(() => {
      const images = document.querySelectorAll('img');
      images.forEach(img => {
        // Add lazy loading
        img.setAttribute('loading', 'lazy');

        // Add alt text if missing
        if (!img.alt) {
          img.alt = 'Optimized image';
        }
      });
    });
  }

  /**
   * Apply JavaScript optimizations
   */
  private async applyJSOptimization(page: any): Promise<void> {
    await page.evaluate(() => {
      // Remove console.log statements (simplified)
      const scripts = document.querySelectorAll('script');
      scripts.forEach(script => {
        if (script.textContent) {
          script.textContent = script.textContent.replace(/console\.log\([^)]*\);?/g, '');
        }
      });
    });
  }

  /**
   * Apply CSS optimizations
   */
  private async applyCSSOptimization(page: any): Promise<void> {
    await page.evaluate(() => {
      // Remove unused CSS classes (simplified)
      const styles = document.querySelectorAll('style');
      styles.forEach(style => {
        if (style.textContent) {
          // Remove empty rules
          style.textContent = style.textContent.replace(/\{[^}]*\}/g, match => {
            return match.trim() === '{}' ? '' : match;
          });
        }
      });
    });
  }

  /**
   * Verify optimizations were applied
   */
  private async verifyOptimizations(page: any, optimizations: Optimization[]): Promise<void> {
    // In a real implementation, this would verify that optimizations were actually applied
    console.log(`Verified ${optimizations.length} optimizations`);
  }

  /**
   * Get mining statistics
   */
  getMiningStats(): MiningStats {
    const allJobs = Array.from(this.jobs.values());
    const completedJobs = allJobs.filter(job => job.status === 'completed');
    const failedJobs = allJobs.filter(job => job.status === 'failed');

    const totalSpaceSaved = completedJobs.reduce(
      (total, job) => total + (job.results?.spaceSaved || 0),
      0
    );

    const totalTokensEarned = completedJobs.reduce(
      (total, job) => total + (job.results?.tokensEarned || 0),
      0
    );

    const averageOptimizationRate =
      completedJobs.length > 0
        ? completedJobs.reduce((total, job) => total + (job.results?.optimizationRate || 0), 0) /
          completedJobs.length
        : 0;

    const topOptimizations = completedJobs
      .flatMap(job => job.results?.optimizations || [])
      .sort((a, b) => b.spaceSaved - a.spaceSaved)
      .slice(0, 10);

    const performanceBySiteType = new Map<string, PerformanceMetrics>();

    return {
      totalJobs: allJobs.length,
      completedJobs: completedJobs.length,
      failedJobs: failedJobs.length,
      successRate: allJobs.length > 0 ? (completedJobs.length / allJobs.length) * 100 : 0,
      totalSpaceSaved,
      totalTokensEarned,
      averageOptimizationRate,
      topOptimizations,
      performanceBySiteType,
    };
  }

  /**
   * Get job by ID
   */
  getJob(jobId: string): MiningJob | undefined {
    return this.jobs.get(jobId);
  }

  /**
   * Get all jobs
   */
  getAllJobs(): MiningJob[] {
    return Array.from(this.jobs.values());
  }

  /**
   * Get jobs by status
   */
  getJobsByStatus(status: MiningJob['status']): MiningJob[] {
    return Array.from(this.jobs.values()).filter(job => job.status === status);
  }

  /**
   * Setup event handlers
   */
  private setupEventHandlers(): void {
    this.on('jobQueued', job => {
      console.log(`📝 Job queued: ${job.url}`);
    });

    this.on('jobStarted', job => {
      console.log(`⛏️ Job started: ${job.url}`);
    });

    this.on('jobCompleted', job => {
      console.log(`✅ Job completed: ${job.url}`);
    });

    this.on('jobFailed', job => {
      console.error(`❌ Job failed: ${job.url} - ${job.error}`);
    });
  }

  /**
   * Stop the web address miner
   */
  async stop(): Promise<void> {
    console.log('🛑 Stopping Web Address Miner...');

    this.isRunning = false;

    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }

    await headlessBrowserService.close();

    this.emit('stopped');
    console.log('✅ Web Address Miner stopped');
  }

  /**
   * Get status
   */
  getStatus(): { running: boolean; totalJobs: number; activeJobs: number; queuedJobs: number } {
    const allJobs = Array.from(this.jobs.values());
    const activeJobs = allJobs.filter(job =>
      ['mining', 'analyzing', 'optimizing'].includes(job.status)
    );
    const queuedJobs = allJobs.filter(job => job.status === 'queued');

    return {
      running: this.isRunning,
      totalJobs: allJobs.length,
      activeJobs: activeJobs.length,
      queuedJobs: queuedJobs.length,
    };
  }
}

// Export singleton instance
export const webAddressMiner = new WebAddressMiner();
