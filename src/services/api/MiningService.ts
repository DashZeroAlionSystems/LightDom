import { DOMOptimizationEngine } from '../../core/DOMOptimizationEngine';

export interface MiningSession {
  id: string;
  userId: string;
  status: 'idle' | 'mining' | 'paused' | 'completed' | 'error';
  startTime: string;
  endTime?: string;
  totalPages: number;
  pagesProcessed: number;
  optimizationsFound: number;
  spaceSaved: number;
  tokensEarned: number;
  currentUrl?: string;
  progress: number;
  config: MiningConfig;
  results: MiningResult[];
}

export interface MiningConfig {
  startUrl: string;
  maxDepth: number;
  maxPages: number;
  optimizationTypes: string[];
  maxConcurrency: number;
  requestDelay: number;
  respectRobots: boolean;
  followRedirects: boolean;
  timeout: number;
}

export interface MiningResult {
  url: string;
  domain: string;
  timestamp: string;
  optimizations: OptimizationResult[];
  spaceSaved: number;
  tokensEarned: number;
  status: 'success' | 'error' | 'skipped';
  error?: string;
}

export interface OptimizationResult {
  type: string;
  beforeSize: number;
  afterSize: number;
  spaceSaved: number;
  tokensEarned: number;
  details: any;
}

export class MiningService {
  private static instance: MiningService;
  private optimizationEngine: DOMOptimizationEngine;
  private activeSessions: Map<string, MiningSession> = new Map();
  private sessionCallbacks: Map<string, (session: MiningSession) => void> = new Map();

  constructor() {
    this.optimizationEngine = DOMOptimizationEngine.getInstance();
  }

  static getInstance(): MiningService {
    if (!MiningService.instance) {
      MiningService.instance = new MiningService();
    }
    return MiningService.instance;
  }

  /**
   * Get count of active mining sessions
   */
  getActiveSessionCount(): number {
    return this.activeSessions.size;
  }

  /**
   * Get all active sessions
   */
  getActiveSessions(): MiningSession[] {
    return Array.from(this.activeSessions.values());
  }

  async startMining(userId: string, config: MiningConfig): Promise<MiningSession> {
    const sessionId = `mining_${userId}_${Date.now()}`;
    
    const session: MiningSession = {
      id: sessionId,
      userId,
      status: 'mining',
      startTime: new Date().toISOString(),
      totalPages: 0,
      pagesProcessed: 0,
      optimizationsFound: 0,
      spaceSaved: 0,
      tokensEarned: 0,
      progress: 0,
      config,
      results: []
    };

    this.activeSessions.set(sessionId, session);

    // Start mining process
    this.performMining(session);

    return session;
  }

  private async performMining(session: MiningSession): Promise<void> {
    try {
      const urlsToProcess = await this.discoverUrls(session.config.startUrl, session.config.maxDepth, session.config.maxPages);
      session.totalPages = urlsToProcess.length;
      
      this.updateSession(session);

      for (let i = 0; i < urlsToProcess.length; i++) {
        if (session.status === 'paused') {
          break;
        }

        const url = urlsToProcess[i];
        session.currentUrl = url;
        session.progress = Math.round((i / urlsToProcess.length) * 100);
        
        this.updateSession(session);

        try {
          const result = await this.mineUrl(url, session.config);
          session.results.push(result);
          session.pagesProcessed++;
          session.optimizationsFound += result.optimizations.length;
          session.spaceSaved += result.spaceSaved;
          session.tokensEarned += result.tokensEarned;
        } catch (error) {
          console.error(`Failed to mine URL ${url}:`, error);
          session.results.push({
            url,
            domain: new URL(url).hostname,
            timestamp: new Date().toISOString(),
            optimizations: [],
            spaceSaved: 0,
            tokensEarned: 0,
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error'
          });
          session.pagesProcessed++;
        }

        // Add delay between requests
        if (session.config.requestDelay > 0) {
          await this.delay(session.config.requestDelay);
        }
      }

      session.status = 'completed';
      session.endTime = new Date().toISOString();
      session.progress = 100;
      session.currentUrl = undefined;
      
      this.updateSession(session);

    } catch (error) {
      console.error('Mining session failed:', error);
      session.status = 'error';
      session.endTime = new Date().toISOString();
      this.updateSession(session);
    }
  }

  private async discoverUrls(startUrl: string, maxDepth: number, maxPages: number): Promise<string[]> {
    const urls = new Set<string>();
    const queue: { url: string; depth: number }[] = [{ url: startUrl, depth: 0 }];
    const visited = new Set<string>();

    while (queue.length > 0 && urls.size < maxPages) {
      const { url, depth } = queue.shift()!;
      
      if (visited.has(url) || depth > maxDepth) {
        continue;
      }

      visited.add(url);
      urls.add(url);

      if (depth < maxDepth) {
        try {
          const links = await this.extractLinks(url);
          links.forEach(link => {
            if (!visited.has(link) && urls.size < maxPages) {
              queue.push({ url: link, depth: depth + 1 });
            }
          });
        } catch (error) {
          console.error(`Failed to extract links from ${url}:`, error);
        }
      }
    }

    return Array.from(urls);
  }

  private async extractLinks(url: string): Promise<string[]> {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'LightDom-Miner/1.0'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const html = await response.text();
      const links: string[] = [];
      const baseUrl = new URL(url);

      // Extract links using regex (simple approach)
      const linkRegex = /<a[^>]+href=["']([^"']+)["'][^>]*>/gi;
      let match;

      while ((match = linkRegex.exec(html)) !== null) {
        try {
          const href = match[1];
          const absoluteUrl = new URL(href, baseUrl).href;
          
          // Only include same-domain links
          if (new URL(absoluteUrl).hostname === baseUrl.hostname) {
            links.push(absoluteUrl);
          }
        } catch (error) {
          // Skip invalid URLs
        }
      }

      return links;
    } catch (error) {
      console.error(`Failed to fetch ${url}:`, error);
      return [];
    }
  }

  private async mineUrl(url: string, config: MiningConfig): Promise<MiningResult> {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'LightDom-Miner/1.0'
        },
        signal: AbortSignal.timeout(config.timeout || 10000)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const html = await response.text();
      const domain = new URL(url).hostname;

      // Analyze DOM for optimizations
      const analysis = await this.optimizationEngine.analyzeDOM(url, html);
      const optimizations: OptimizationResult[] = [];

      // Generate optimization results based on analysis
      if (config.optimizationTypes.includes('image')) {
        const imageOptimization = this.optimizeImages(analysis);
        if (imageOptimization) {
          optimizations.push(imageOptimization);
        }
      }

      if (config.optimizationTypes.includes('css')) {
        const cssOptimization = this.optimizeCSS(analysis);
        if (cssOptimization) {
          optimizations.push(cssOptimization);
        }
      }

      if (config.optimizationTypes.includes('js')) {
        const jsOptimization = this.optimizeJavaScript(analysis);
        if (jsOptimization) {
          optimizations.push(jsOptimization);
        }
      }

      if (config.optimizationTypes.includes('html')) {
        const htmlOptimization = this.optimizeHTML(analysis);
        if (htmlOptimization) {
          optimizations.push(htmlOptimization);
        }
      }

      const totalSpaceSaved = optimizations.reduce((sum, opt) => sum + opt.spaceSaved, 0);
      const totalTokensEarned = optimizations.reduce((sum, opt) => sum + opt.tokensEarned, 0);

      return {
        url,
        domain,
        timestamp: new Date().toISOString(),
        optimizations,
        spaceSaved: totalSpaceSaved,
        tokensEarned: totalTokensEarned,
        status: 'success'
      };

    } catch (error) {
      return {
        url,
        domain: new URL(url).hostname,
        timestamp: new Date().toISOString(),
        optimizations: [],
        spaceSaved: 0,
        tokensEarned: 0,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private optimizeImages(analysis: any): OptimizationResult | null {
    // Mock image optimization
    const imagesFound = Math.floor(Math.random() * 20) + 5;
    if (imagesFound === 0) return null;

    const beforeSize = imagesFound * 50000; // 50KB per image
    const compressionRatio = 0.7; // 30% reduction
    const afterSize = Math.round(beforeSize * compressionRatio);
    const spaceSaved = beforeSize - afterSize;
    const tokensEarned = Math.round(spaceSaved / 1000); // 1 token per KB

    return {
      type: 'Image Optimization',
      beforeSize,
      afterSize,
      spaceSaved,
      tokensEarned,
      details: {
        imagesFound,
        compressionRatio,
        formatsOptimized: ['JPEG', 'PNG', 'WebP']
      }
    };
  }

  private optimizeCSS(analysis: any): OptimizationResult | null {
    // Mock CSS optimization
    const cssSize = Math.floor(Math.random() * 50000) + 10000; // 10-60KB
    if (cssSize < 5000) return null;

    const compressionRatio = 0.6; // 40% reduction
    const afterSize = Math.round(cssSize * compressionRatio);
    const spaceSaved = cssSize - afterSize;
    const tokensEarned = Math.round(spaceSaved / 1000);

    return {
      type: 'CSS Optimization',
      beforeSize: cssSize,
      afterSize,
      spaceSaved,
      tokensEarned,
      details: {
        rulesOptimized: Math.floor(Math.random() * 100) + 20,
        unusedRulesRemoved: Math.floor(Math.random() * 50) + 10
      }
    };
  }

  private optimizeJavaScript(analysis: any): OptimizationResult | null {
    // Mock JavaScript optimization
    const jsSize = Math.floor(Math.random() * 100000) + 20000; // 20-120KB
    if (jsSize < 10000) return null;

    const compressionRatio = 0.5; // 50% reduction
    const afterSize = Math.round(jsSize * compressionRatio);
    const spaceSaved = jsSize - afterSize;
    const tokensEarned = Math.round(spaceSaved / 1000);

    return {
      type: 'JavaScript Optimization',
      beforeSize: jsSize,
      afterSize,
      spaceSaved,
      tokensEarned,
      details: {
        functionsOptimized: Math.floor(Math.random() * 50) + 10,
        deadCodeRemoved: Math.floor(Math.random() * 30) + 5
      }
    };
  }

  private optimizeHTML(analysis: any): OptimizationResult | null {
    // Mock HTML optimization
    const htmlSize = Math.floor(Math.random() * 30000) + 5000; // 5-35KB
    if (htmlSize < 3000) return null;

    const compressionRatio = 0.8; // 20% reduction
    const afterSize = Math.round(htmlSize * compressionRatio);
    const spaceSaved = htmlSize - afterSize;
    const tokensEarned = Math.round(spaceSaved / 1000);

    return {
      type: 'HTML Optimization',
      beforeSize: htmlSize,
      afterSize,
      spaceSaved,
      tokensEarned,
      details: {
        whitespaceRemoved: Math.floor(Math.random() * 20) + 5,
        attributesOptimized: Math.floor(Math.random() * 15) + 3
      }
    };
  }

  pauseMining(sessionId: string): boolean {
    const session = this.activeSessions.get(sessionId);
    if (session && session.status === 'mining') {
      session.status = 'paused';
      this.updateSession(session);
      return true;
    }
    return false;
  }

  resumeMining(sessionId: string): boolean {
    const session = this.activeSessions.get(sessionId);
    if (session && session.status === 'paused') {
      session.status = 'mining';
      this.updateSession(session);
      // Resume mining process
      this.performMining(session);
      return true;
    }
    return false;
  }

  stopMining(sessionId: string): boolean {
    const session = this.activeSessions.get(sessionId);
    if (session) {
      session.status = 'completed';
      session.endTime = new Date().toISOString();
      this.updateSession(session);
      return true;
    }
    return false;
  }

  getSession(sessionId: string): MiningSession | undefined {
    return this.activeSessions.get(sessionId);
  }

  getUserSessions(userId: string): MiningSession[] {
    return Array.from(this.activeSessions.values())
      .filter(session => session.userId === userId);
  }

  onSessionUpdate(sessionId: string, callback: (session: MiningSession) => void): void {
    this.sessionCallbacks.set(sessionId, callback);
  }

  private updateSession(session: MiningSession): void {
    this.activeSessions.set(session.id, session);
    const callback = this.sessionCallbacks.get(session.id);
    if (callback) {
      callback(session);
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}