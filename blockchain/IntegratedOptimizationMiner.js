import { RealWebCrawlerSystem } from '../crawler/RealWebCrawlerSystem.js';
import { LightDomMiningSystem } from './LightDomMiningSystem.js';
import { ethers } from 'ethers';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Integrated Optimization Miner
 * Combines web crawling, DOM optimization, and blockchain mining
 */
class IntegratedOptimizationMiner {
  constructor(config = {}) {
    this.config = {
      crawlerConfig: {
        maxConcurrency: 3,
        requestDelay: 2000,
        maxDepth: 2,
        respectRobots: true,
        artifactPath: './artifacts',
        ...config.crawlerConfig
      },
      miningConfig: {
        rpcUrl: process.env.BLOCKCHAIN_RPC_URL || 'http://localhost:8545',
        chainId: parseInt(process.env.BLOCKCHAIN_CHAIN_ID || '1337'),
        miningInterval: 30000,
        minOptimizationsPerBlock: 3,
        ...config.miningConfig
      },
      seedUrls: config.seedUrls || [
        'https://example.com',
        'https://wikipedia.org',
        'https://github.com',
        'https://stackoverflow.com',
        'https://medium.com'
      ],
      trainingDataPath: config.trainingDataPath || './training-data',
      exportInterval: config.exportInterval || 300000, // 5 minutes
      ...config
    };

    this.crawler = null;
    this.miner = null;
    this.isRunning = false;
    this.statistics = {
      sitesOptimized: 0,
      totalSpaceSaved: 0,
      blocksMinedCount: 0,
      tokensEarned: 0,
      startTime: null,
      lastExportTime: null
    };
  }

  /**
   * Initialize the integrated system
   */
  async initialize() {
    console.log('🚀 Initializing Integrated Optimization Miner...');
    
    // Create directories
    await this.createDirectories();
    
    // Initialize crawler
    this.crawler = new RealWebCrawlerSystem({
      ...this.config.crawlerConfig,
      onOptimization: this.handleOptimization.bind(this)
    });
    
    await this.crawler.initialize();
    
    // Initialize miner
    this.miner = new LightDomMiningSystem(this.config.miningConfig);
    
    // Generate or load wallet
    const privateKey = await this.getOrCreateWallet();
    await this.miner.initialize(privateKey);
    
    // Set up event listeners
    this.setupEventListeners();
    
    console.log('✅ Integrated system initialized');
    console.log(`📊 Training data path: ${this.config.trainingDataPath}`);
    
    return true;
  }

  /**
   * Create required directories
   */
  async createDirectories() {
    const dirs = [
      this.config.trainingDataPath,
      path.join(this.config.trainingDataPath, 'raw'),
      path.join(this.config.trainingDataPath, 'processed'),
      path.join(this.config.trainingDataPath, 'models'),
      './artifacts',
      './checkpoints'
    ];
    
    for (const dir of dirs) {
      await fs.mkdir(dir, { recursive: true });
    }
  }

  /**
   * Get or create wallet for mining
   */
  async getOrCreateWallet() {
    const walletPath = path.join(__dirname, '../.wallet');
    
    try {
      // Try to load existing wallet
      const walletData = await fs.readFile(walletPath, 'utf8');
      const { privateKey } = JSON.parse(walletData);
      console.log('📂 Loaded existing wallet');
      return privateKey;
    } catch (error) {
      // Create new wallet
      const wallet = ethers.Wallet.createRandom();
      const walletData = {
        address: wallet.address,
        privateKey: wallet.privateKey,
        mnemonic: wallet.mnemonic.phrase
      };
      
      await fs.writeFile(walletPath, JSON.stringify(walletData, null, 2));
      console.log('🔑 Created new wallet:', wallet.address);
      console.log('⚠️  Save your mnemonic phrase:', wallet.mnemonic.phrase);
      
      return wallet.privateKey;
    }
  }

  /**
   * Set up event listeners
   */
  setupEventListeners() {
    // Miner events
    this.miner.on('blockMined', async (block) => {
      this.statistics.blocksMinedCount++;
      this.statistics.tokensEarned += block.reward;
      
      // Save block data for training
      await this.saveBlockData(block);
      
      console.log(`📊 Statistics Update:`);
      console.log(`   Sites optimized: ${this.statistics.sitesOptimized}`);
      console.log(`   Total space saved: ${(this.statistics.totalSpaceSaved / 1024 / 1024).toFixed(2)} MB`);
      console.log(`   Blocks mined: ${this.statistics.blocksMinedCount}`);
      console.log(`   Tokens earned: ${this.statistics.tokensEarned} LDOM`);
    });
    
    this.miner.on('optimizationQueued', (optimization) => {
      console.log(`🔗 Optimization queued for mining: ${optimization.url}`);
    });
  }

  /**
   * Start the integrated mining system
   */
  async start() {
    if (this.isRunning) {
      console.log('⚠️ System is already running');
      return;
    }
    
    this.isRunning = true;
    this.statistics.startTime = Date.now();
    
    console.log('🌐 Starting Integrated Optimization Miner...');
    
    // Add seed URLs to crawler
    for (const url of this.config.seedUrls) {
      this.crawler.crawlQueue.push({
        url,
        depth: 0,
        priority: 1,
        discoveredAt: new Date()
      });
    }
    
    // Start crawler
    await this.crawler.startCrawling();
    
    // Start miner
    await this.miner.startMining();
    
    // Start periodic data export
    this.startDataExport();
    
    console.log('✅ System started successfully');
  }

  /**
   * Stop the system
   */
  async stop() {
    console.log('🛑 Stopping Integrated Optimization Miner...');
    
    this.isRunning = false;
    
    // Stop crawler
    await this.crawler.shutdown();
    
    // Stop miner
    this.miner.stopMining();
    
    // Final data export
    await this.exportTrainingData();
    
    console.log('✅ System stopped');
  }

  /**
   * Handle optimization from crawler
   */
  async handleOptimization({ url, analysis, result }) {
    try {
      // Update statistics
      this.statistics.sitesOptimized++;
      this.statistics.totalSpaceSaved += result.spaceSaved;
      
      // Prepare optimization for mining
      const optimizationData = {
        ...result,
        biomeType: this.categorizeWebsite(url),
        timestamp: new Date().toISOString()
      };
      
      // Add to mining queue
      await this.miner.addOptimization(optimizationData);
      
      // Save raw optimization data for training
      await this.saveOptimizationData(optimizationData);
      
    } catch (error) {
      console.error('Error handling optimization:', error);
    }
  }

  /**
   * Categorize website into biome type
   */
  categorizeWebsite(url) {
    const urlLower = url.toLowerCase();
    
    if (urlLower.includes('blog') || urlLower.includes('medium') || urlLower.includes('wordpress')) {
      return 'blog';
    } else if (urlLower.includes('shop') || urlLower.includes('store') || urlLower.includes('amazon')) {
      return 'ecommerce';
    } else if (urlLower.includes('github') || urlLower.includes('gitlab') || urlLower.includes('stackoverflow')) {
      return 'developer';
    } else if (urlLower.includes('wikipedia') || urlLower.includes('edu')) {
      return 'educational';
    } else if (urlLower.includes('news') || urlLower.includes('cnn') || urlLower.includes('bbc')) {
      return 'news';
    } else if (urlLower.includes('facebook') || urlLower.includes('twitter') || urlLower.includes('instagram')) {
      return 'social';
    } else {
      return 'general';
    }
  }

  /**
   * Save optimization data for training
   */
  async saveOptimizationData(optimization) {
    const filename = `optimization_${Date.now()}_${optimization.crawlId}.json`;
    const filepath = path.join(this.config.trainingDataPath, 'raw', filename);
    
    await fs.writeFile(filepath, JSON.stringify(optimization, null, 2));
  }

  /**
   * Save block data for training
   */
  async saveBlockData(block) {
    const filename = `block_${block.index}_${block.hash}.json`;
    const filepath = path.join(this.config.trainingDataPath, 'raw', filename);
    
    await fs.writeFile(filepath, JSON.stringify(block, null, 2));
  }

  /**
   * Start periodic training data export
   */
  startDataExport() {
    setInterval(async () => {
      if (this.isRunning) {
        await this.exportTrainingData();
      }
    }, this.config.exportInterval);
  }

  /**
   * Export training data
   */
  async exportTrainingData() {
    console.log('📤 Exporting training data...');
    
    try {
      // Get mining data
      const miningData = await this.miner.getTrainingData();
      
      // Get crawler status
      const crawlerStatus = this.crawler.getStatus();
      
      // Prepare comprehensive training dataset
      const trainingDataset = {
        metadata: {
          exportTime: new Date().toISOString(),
          systemVersion: '1.0.0',
          statistics: this.statistics
        },
        miningData,
        crawlerData: {
          totalVisited: crawlerStatus.visitedCount,
          totalOptimizations: crawlerStatus.totalOptimizations,
          totalSpaceHarvested: crawlerStatus.totalSpaceHarvested,
          optimizationResults: this.crawler.optimizationResults.slice(-1000), // Last 1000
          schemaData: this.crawler.schemaData.slice(-1000),
          backlinkNetwork: this.crawler.backlinkNetwork.slice(-1000)
        },
        patterns: await this.analyzePatterns(),
        seoInsights: await this.generateSEOInsights()
      };
      
      // Save processed training data
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filepath = path.join(
        this.config.trainingDataPath, 
        'processed', 
        `training_data_${timestamp}.json`
      );
      
      await fs.writeFile(filepath, JSON.stringify(trainingDataset, null, 2));
      
      this.statistics.lastExportTime = Date.now();
      console.log(`✅ Training data exported to: ${filepath}`);
      
      // Generate SEO report
      await this.generateSEOReport(trainingDataset.seoInsights);
      
    } catch (error) {
      console.error('Error exporting training data:', error);
    }
  }

  /**
   * Analyze patterns for ML training
   */
  async analyzePatterns() {
    const patterns = {
      optimizationEffectiveness: {},
      domainSpecificTechniques: {},
      temporalPatterns: {},
      contentTypePatterns: {}
    };
    
    // Analyze optimization effectiveness by domain
    for (const result of this.crawler.optimizationResults) {
      try {
        const url = new URL(result.url);
        const domain = url.hostname;
        
        if (!patterns.optimizationEffectiveness[domain]) {
          patterns.optimizationEffectiveness[domain] = {
            totalOptimizations: 0,
            totalSpaceSaved: 0,
            techniques: {}
          };
        }
        
        patterns.optimizationEffectiveness[domain].totalOptimizations++;
        patterns.optimizationEffectiveness[domain].totalSpaceSaved += result.spaceSaved;
        
        // Track techniques
        if (result.optimizations) {
          for (const opt of result.optimizations) {
            patterns.optimizationEffectiveness[domain].techniques[opt.type] = 
              (patterns.optimizationEffectiveness[domain].techniques[opt.type] || 0) + 1;
          }
        }
      } catch (e) {
        // Invalid URL
      }
    }
    
    // Analyze temporal patterns
    const hourlyStats = {};
    for (const result of this.crawler.optimizationResults) {
      const hour = new Date(result.timestamp).getHours();
      hourlyStats[hour] = (hourlyStats[hour] || 0) + result.spaceSaved;
    }
    patterns.temporalPatterns = hourlyStats;
    
    return patterns;
  }

  /**
   * Generate SEO insights from crawled data
   */
  async generateSEOInsights() {
    const insights = {
      weakSEOSites: [],
      commonIssues: {},
      schemaAdoption: {},
      backlinkAnalysis: {},
      recommendations: []
    };
    
    // Analyze sites with weak SEO
    const domainStats = {};
    
    for (const result of this.crawler.optimizationResults) {
      try {
        const url = new URL(result.url);
        const domain = url.hostname;
        
        if (!domainStats[domain]) {
          domainStats[domain] = {
            domain,
            totalPages: 0,
            hasSchema: false,
            issues: [],
            backlinks: 0,
            spaceWasted: 0
          };
        }
        
        domainStats[domain].totalPages++;
        domainStats[domain].spaceWasted += result.spaceSaved;
        
        // Check for schema
        const hasSchema = this.crawler.schemaData.some(s => s.url.includes(domain));
        if (hasSchema) domainStats[domain].hasSchema = true;
        
        // Count backlinks
        const backlinks = this.crawler.backlinkNetwork.filter(b => b.targetUrl.includes(domain));
        domainStats[domain].backlinks = backlinks.length;
      } catch (e) {
        // Invalid URL
      }
    }
    
    // Identify weak SEO sites
    insights.weakSEOSites = Object.values(domainStats)
      .filter(site => 
        !site.hasSchema || 
        site.spaceWasted > 100000 || 
        site.backlinks < 10
      )
      .sort((a, b) => b.spaceWasted - a.spaceWasted)
      .slice(0, 20);
    
    // Common issues
    insights.commonIssues = {
      missingSchema: insights.weakSEOSites.filter(s => !s.hasSchema).length,
      excessiveDOM: insights.weakSEOSites.filter(s => s.spaceWasted > 100000).length,
      lowBacklinks: insights.weakSEOSites.filter(s => s.backlinks < 10).length
    };
    
    // Generate recommendations
    insights.recommendations = this.generateSEORecommendations(insights);
    
    return insights;
  }

  /**
   * Generate SEO recommendations
   */
  generateSEORecommendations(insights) {
    const recommendations = [];
    
    for (const site of insights.weakSEOSites) {
      const siteRecommendations = {
        domain: site.domain,
        priority: 'high',
        actions: []
      };
      
      if (!site.hasSchema) {
        siteRecommendations.actions.push({
          type: 'schema',
          description: 'Implement Schema.org structured data',
          impact: 'high',
          implementation: 'Add JSON-LD schema for your content type'
        });
      }
      
      if (site.spaceWasted > 100000) {
        siteRecommendations.actions.push({
          type: 'optimization',
          description: 'Optimize DOM structure and remove unused elements',
          impact: 'high',
          estimatedSavings: `${(site.spaceWasted / 1024).toFixed(2)} KB`,
          implementation: 'Use LightDOM optimization to clean up DOM'
        });
      }
      
      if (site.backlinks < 10) {
        siteRecommendations.actions.push({
          type: 'backlinks',
          description: 'Improve backlink profile',
          impact: 'medium',
          implementation: 'Create quality content and outreach for backlinks'
        });
      }
      
      recommendations.push(siteRecommendations);
    }
    
    return recommendations;
  }

  /**
   * Generate SEO report
   */
  async generateSEOReport(insights) {
    const reportPath = path.join(
      this.config.trainingDataPath,
      'reports',
      `seo_report_${Date.now()}.md`
    );
    
    await fs.mkdir(path.dirname(reportPath), { recursive: true });
    
    const report = `# SEO Analysis Report

Generated: ${new Date().toISOString()}

## Executive Summary

- **Sites Analyzed**: ${this.statistics.sitesOptimized}
- **Sites with Weak SEO**: ${insights.weakSEOSites.length}
- **Total Space Optimization Potential**: ${(insights.weakSEOSites.reduce((sum, s) => sum + s.spaceWasted, 0) / 1024 / 1024).toFixed(2)} MB

## Common Issues

- **Missing Schema.org Data**: ${insights.commonIssues.missingSchema} sites
- **Excessive DOM Size**: ${insights.commonIssues.excessiveDOM} sites
- **Low Backlink Count**: ${insights.commonIssues.lowBacklinks} sites

## Top Sites Needing Optimization

${insights.weakSEOSites.slice(0, 10).map(site => `
### ${site.domain}
- **Pages Analyzed**: ${site.totalPages}
- **Space Wasted**: ${(site.spaceWasted / 1024).toFixed(2)} KB
- **Has Schema**: ${site.hasSchema ? 'Yes' : 'No'}
- **Backlinks**: ${site.backlinks}
`).join('\n')}

## Recommendations

${insights.recommendations.slice(0, 10).map(rec => `
### ${rec.domain}
Priority: **${rec.priority.toUpperCase()}**

${rec.actions.map(action => `
- **${action.type}**: ${action.description}
  - Impact: ${action.impact}
  - ${action.estimatedSavings ? `Estimated Savings: ${action.estimatedSavings}` : ''}
  - Implementation: ${action.implementation}
`).join('\n')}
`).join('\n')}

## Next Steps

1. Implement Schema.org structured data for sites missing it
2. Use LightDOM optimization to reduce DOM size
3. Develop backlink building strategies for low-authority sites
4. Monitor improvements after optimization
5. Re-crawl optimized sites to measure impact

---

*Generated by LightDOM Integrated Optimization Miner*
`;
    
    await fs.writeFile(reportPath, report);
    console.log(`📊 SEO report generated: ${reportPath}`);
  }

  /**
   * Get system status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      statistics: this.statistics,
      crawlerStatus: this.crawler ? this.crawler.getStatus() : null,
      miningStats: this.miner ? this.miner.getMiningStats() : null,
      uptime: this.statistics.startTime ? Date.now() - this.statistics.startTime : 0
    };
  }
}

export { IntegratedOptimizationMiner };
