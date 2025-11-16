/**
 * Complete Integration Example: Pre-Trained Models + SEO Crawler
 * 
 * This example demonstrates end-to-end integration of pre-trained models
 * with the SEO crawler system for enhanced content analysis and optimization.
 * 
 * Features:
 * - Real-time model inference during crawling
 * - Batch processing with multiple models
 * - Transfer learning setup
 * - Performance tracking and optimization
 * - Automated recommendation generation
 */

import { SEOCrawlerIntegration } from '../crawler/SEOCrawlerIntegration.js';
import { CrawlerNeuralIntegration } from './crawler-neural-integration.js';
import { EnhancedModelLibraryService } from './enhanced-model-library-service.js';
import { Pool } from 'pg';

class SEOCrawlerWithNeuralModels {
  constructor(options = {}) {
    this.db = new Pool({
      connectionString: options.databaseUrl || process.env.DATABASE_URL,
      max: 20
    });

    // Initialize components
    this.crawlerIntegration = new SEOCrawlerIntegration({ db: this.db });
    this.neuralIntegration = new CrawlerNeuralIntegration({ 
      db: this.db,
      enableRealtimeInference: true,
      enableBatchProcessing: true
    });
    this.modelLibrary = new EnhancedModelLibraryService({ 
      db: this.db,
      autoSetupModels: true
    });

    this.stats = {
      pagesCrawled: 0,
      pagesAnalyzed: 0,
      recommendationsGenerated: 0,
      totalInferenceTime: 0
    };
  }

  /**
   * Initialize all services
   */
  async initialize() {
    console.log('🚀 Initializing SEO Crawler with Neural Models...\n');

    try {
      // Initialize model library first
      await this.modelLibrary.initialize();

      // Initialize neural integration
      await this.neuralIntegration.initialize();

      // Test database connection
      await this.crawlerIntegration.testConnection();

      console.log('✅ All services initialized successfully\n');
      
      return true;
    } catch (error) {
      console.error('❌ Initialization failed:', error);
      throw error;
    }
  }

  /**
   * Crawl a single page with neural analysis
   */
  async crawlPageWithAnalysis(url, options = {}) {
    console.log(`🔍 Crawling and analyzing: ${url}`);

    try {
      // Step 1: Crawl the page (this would use actual crawler)
      const pageData = await this.simulateCrawl(url);
      this.stats.pagesCrawled++;

      // Step 2: Extract SEO attributes
      const attributes = await this.crawlerIntegration.calculateSEOScore(
        pageData.analysis,
        pageData.schemas,
        pageData.backlinks
      );

      // Step 3: Process with neural models
      const neuralResults = await this.neuralIntegration.processCrawledPage({
        url,
        ...pageData,
        attributes
      });
      this.stats.pagesAnalyzed++;

      // Step 4: Save results
      if (options.saveResults !== false) {
        await this.saveResults(url, neuralResults);
      }

      // Step 5: Generate and save recommendations
      if (neuralResults.recommendations.length > 0) {
        await this.saveRecommendations(url, neuralResults.recommendations);
        this.stats.recommendationsGenerated += neuralResults.recommendations.length;
      }

      // Update stats
      this.stats.totalInferenceTime += neuralResults.metadata.inferenceTime;

      console.log(`✅ Analysis complete: ${neuralResults.recommendations.length} recommendations`);
      
      return neuralResults;
    } catch (error) {
      console.error(`❌ Failed to analyze ${url}:`, error);
      throw error;
    }
  }

  /**
   * Crawl multiple pages in batch
   */
  async crawlBatch(urls, options = {}) {
    console.log(`\n📊 Batch crawling ${urls.length} URLs...\n`);

    const results = [];

    for (const url of urls) {
      try {
        const result = await this.crawlPageWithAnalysis(url, options);
        results.push({ url, success: true, result });
      } catch (error) {
        results.push({ url, success: false, error: error.message });
      }
    }

    console.log(`\n✅ Batch complete: ${results.filter(r => r.success).length}/${urls.length} successful\n`);

    return results;
  }

  /**
   * Simulate page crawl (in production, use actual crawler)
   */
  async simulateCrawl(url) {
    // Mock crawler data
    return {
      url,
      title: `SEO Optimized Page - ${url}`,
      metaDescription: 'A comprehensive guide to SEO optimization with neural networks',
      content: `
        This is a comprehensive guide about SEO optimization.
        
        We cover topics including:
        - Content optimization
        - Technical SEO
        - Link building strategies
        - Performance optimization
        
        Our services help businesses improve their search rankings.
        Contact us today for a free consultation.
      `,
      images: [
        { src: '/hero.jpg', alt: 'SEO Strategy' },
        { src: '/infographic.png', alt: '' },
        { src: '/team.jpg', alt: 'Our Team' }
      ],
      headings: ['SEO Guide', 'Content Optimization', 'Technical SEO'],
      analysis: {
        performance: { lcp: 2.5, fid: 100, cls: 0.1 }
      },
      schemas: [],
      backlinks: []
    };
  }

  /**
   * Save analysis results
   */
  async saveResults(url, results) {
    try {
      await this.neuralIntegration.saveAnalysisResults(results);
      
      // Also record in model library for tracking
      if (results.analyses.realtime) {
        const models = [
          'sentence-transformers-minilm',
          'mobilenet-v2',
          'distilbert-sst2-sentiment'
        ];

        for (const modelId of models) {
          await this.modelLibrary.recordInference(
            modelId,
            url,
            Math.round(results.metadata.inferenceTime / models.length),
            true,
            null,
            null
          );
        }
      }
    } catch (error) {
      console.error('Failed to save results:', error.message);
    }
  }

  /**
   * Save recommendations
   */
  async saveRecommendations(url, recommendations) {
    if (!this.db) return;

    try {
      const query = `
        INSERT INTO seo_recommendations (
          url, recommendations, priority, created_at
        ) VALUES ($1, $2, $3, NOW())
      `;

      const highPriorityCount = recommendations.filter(r => 
        r.priority === 'critical' || r.priority === 'high'
      ).length;

      const priority = highPriorityCount > 0 ? 'high' : 'medium';

      await this.db.query(query, [url, JSON.stringify(recommendations), priority]);
    } catch (error) {
      // Table might not exist, that's okay
      console.log('Note: Unable to save recommendations to database');
    }
  }

  /**
   * Get model performance statistics
   */
  async getModelPerformance() {
    const models = [
      'sentence-transformers-minilm',
      'mobilenet-v2',
      'distilbert-sst2-sentiment'
    ];

    const stats = {};

    for (const modelId of models) {
      const modelStats = await this.modelLibrary.getModelStats(modelId);
      if (modelStats) {
        stats[modelId] = {
          totalInferences: parseInt(modelStats.total_inferences) || 0,
          avgLatency: Math.round(parseFloat(modelStats.avg_latency) || 0),
          successRate: `${(parseFloat(modelStats.success_rate) * 100).toFixed(2)}%`
        };
      }
    }

    return stats;
  }

  /**
   * Generate comprehensive report
   */
  async generateReport() {
    console.log('\n' + '='.repeat(80));
    console.log('  SEO CRAWLER WITH NEURAL MODELS - PERFORMANCE REPORT');
    console.log('='.repeat(80) + '\n');

    // Crawler stats
    console.log('📊 Crawler Statistics:');
    console.log(`   Pages Crawled: ${this.stats.pagesCrawled}`);
    console.log(`   Pages Analyzed: ${this.stats.pagesAnalyzed}`);
    console.log(`   Recommendations: ${this.stats.recommendationsGenerated}`);
    console.log(`   Total Inference Time: ${this.stats.totalInferenceTime}ms`);
    
    if (this.stats.pagesAnalyzed > 0) {
      console.log(`   Avg Inference Time: ${Math.round(this.stats.totalInferenceTime / this.stats.pagesAnalyzed)}ms/page`);
      console.log(`   Avg Recommendations: ${(this.stats.recommendationsGenerated / this.stats.pagesAnalyzed).toFixed(2)}/page`);
    }

    // Neural integration stats
    const neuralStats = this.neuralIntegration.getStatistics();
    console.log(`\n🧠 Neural Integration Statistics:`);
    console.log(`   Success Rate: ${neuralStats.successRate}`);
    console.log(`   Average Inference Time: ${neuralStats.averageInferenceTime}`);
    console.log(`   Models Available: ${neuralStats.modelsAvailable}`);

    // Model library info
    const serviceInfo = this.modelLibrary.getServiceInfo();
    console.log(`\n📚 Model Library:`);
    console.log(`   Total Models: ${serviceInfo.totalModels}`);
    console.log(`   Average Accuracy: ${serviceInfo.averageAccuracy}`);
    console.log(`   TensorFlow Hub Models: ${serviceInfo.modelsBySource['tensorflow-hub']}`);
    console.log(`   Hugging Face Models: ${serviceInfo.modelsBySource['huggingface']}`);

    // Individual model performance (if available)
    const modelPerf = await this.getModelPerformance();
    if (Object.keys(modelPerf).length > 0) {
      console.log(`\n⚡ Individual Model Performance:`);
      for (const [modelId, stats] of Object.entries(modelPerf)) {
        console.log(`   ${modelId}:`);
        console.log(`     - Inferences: ${stats.totalInferences}`);
        console.log(`     - Avg Latency: ${stats.avgLatency}ms`);
        console.log(`     - Success Rate: ${stats.successRate}`);
      }
    }

    console.log('\n' + '='.repeat(80) + '\n');
  }

  /**
   * Cleanup resources
   */
  async cleanup() {
    console.log('🧹 Cleaning up resources...');
    
    await this.neuralIntegration.dispose();
    await this.db.end();
    
    console.log('✅ Cleanup complete');
  }
}

// Example usage
async function runExample() {
  const crawler = new SEOCrawlerWithNeuralModels();

  try {
    // Initialize
    await crawler.initialize();

    // Example 1: Single page analysis
    console.log('Example 1: Single Page Analysis');
    console.log('-'.repeat(80) + '\n');
    
    const singleResult = await crawler.crawlPageWithAnalysis('https://example.com/product');
    
    console.log('\nTop Recommendations:');
    singleResult.recommendations.slice(0, 3).forEach((rec, i) => {
      console.log(`  ${i + 1}. [${rec.priority.toUpperCase()}] ${rec.title}`);
      console.log(`     ${rec.description}`);
    });

    // Example 2: Batch processing
    console.log('\n\nExample 2: Batch Processing');
    console.log('-'.repeat(80) + '\n');
    
    const urls = [
      'https://example.com/page1',
      'https://example.com/page2',
      'https://example.com/page3'
    ];

    const batchResults = await crawler.crawlBatch(urls);
    
    console.log('\nBatch Results Summary:');
    batchResults.forEach(r => {
      console.log(`  ${r.url}: ${r.success ? '✓' : '✗'}`);
      if (r.success) {
        console.log(`    Recommendations: ${r.result.recommendations.length}`);
      }
    });

    // Generate report
    await crawler.generateReport();

    // Cleanup
    await crawler.cleanup();

  } catch (error) {
    console.error('Example failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runExample().catch(console.error);
}

export { SEOCrawlerWithNeuralModels, runExample };
