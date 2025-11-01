/**
 * SEO Crawler Service - Generates training data and runs SEO optimization
 */

import axios from 'axios';
import * as cheerio from 'cheerio';
import { EventEmitter } from 'events';

interface CrawlResult {
  url: string;
  title: string;
  description: string;
  keywords: string[];
  h1Tags: string[];
  h2Tags: string[];
  links: string[];
  images: string[];
  wordCount: number;
  loadTime: number;
  statusCode: number;
  crawledAt: Date;
}

interface SEOCrawlerConfig {
  maxConcurrentRequests: number;
  requestDelay: number;
  maxDepth: number;
  userAgent: string;
  timeout: number;
}

export class SEOCrawler extends EventEmitter {
  private config: SEOCrawlerConfig;
  private isRunning: boolean = false;
  private activeJobs: Map<string, CrawlResult[]> = new Map();
  private trainingData: any[] = [];

  constructor(config: Partial<SEOCrawlerConfig> = {}) {
    super();
    this.config = {
      maxConcurrentRequests: 5,
      requestDelay: 1000,
      maxDepth: 2,
      userAgent: 'LightDom SEO Crawler/1.0',
      timeout: 10000,
      ...config
    };
  }

  /**
   * Start SEO crawling for given URLs and keywords
   */
  async startCrawling(urls: string[], keywords: string[] = []): Promise<string> {
    if (this.isRunning) {
      throw new Error('Crawler is already running');
    }

    const jobId = `seo-crawl-${Date.now()}`;
    this.isRunning = true;
    this.activeJobs.set(jobId, []);

    this.emit('crawlStarted', { jobId, urls, keywords });

    try {
      const results: CrawlResult[] = [];

      for (const url of urls) {
        if (!this.isRunning) break;

        try {
          const result = await this.crawlUrl(url);
          results.push(result);

          // Generate training data based on keywords
          if (keywords.length > 0) {
            const trainingData = this.generateTrainingData(result, keywords);
            this.trainingData.push(...trainingData);
          }

          this.emit('urlCrawled', { jobId, url, result });
          await this.delay(this.config.requestDelay);

        } catch (error) {
          this.emit('crawlError', { jobId, url, error: error.message });
        }
      }

      this.activeJobs.set(jobId, results);
      this.emit('crawlCompleted', { jobId, results, trainingDataCount: this.trainingData.length });

    } catch (error) {
      this.emit('crawlFailed', { jobId, error: error.message });
    } finally {
      this.isRunning = false;
    }

    return jobId;
  }

  /**
   * Stop crawling
   */
  stopCrawling(): void {
    this.isRunning = false;
    this.emit('crawlStopped');
  }

  /**
   * Get crawler status
   */
  getStatus(): any {
    return {
      isRunning: this.isRunning,
      activeJobs: this.activeJobs.size,
      trainingDataGenerated: this.trainingData.length,
      config: this.config
    };
  }

  /**
   * Get training data
   */
  getTrainingData(): any[] {
    return this.trainingData;
  }

  /**
   * Crawl a single URL
   */
  private async crawlUrl(url: string): Promise<CrawlResult> {
    const startTime = Date.now();

    try {
      const response = await axios.get(url, {
        timeout: this.config.timeout,
        headers: {
          'User-Agent': this.config.userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive',
        },
        maxRedirects: 5,
      });

      const loadTime = Date.now() - startTime;
      const $ = cheerio.load(response.data);

      const result: CrawlResult = {
        url,
        title: $('title').text().trim() || '',
        description: $('meta[name="description"]').attr('content') || '',
        keywords: $('meta[name="keywords"]').attr('content')?.split(',').map(k => k.trim()) || [],
        h1Tags: $('h1').map((_, el) => $(el).text().trim()).get(),
        h2Tags: $('h2').map((_, el) => $(el).text().trim()).get(),
        links: $('a[href]').map((_, el) => $(el).attr('href')).get().filter(href => href && !href.startsWith('#')),
        images: $('img[src]').map((_, el) => $(el).attr('src')).get().filter(src => src),
        wordCount: $('body').text().split(/\s+/).length,
        loadTime,
        statusCode: response.status,
        crawledAt: new Date()
      };

      return result;

    } catch (error: any) {
      const loadTime = Date.now() - startTime;
      throw new Error(`Failed to crawl ${url}: ${error.message}`);
    }
  }

  /**
   * Generate training data from crawl results
   */
  private generateTrainingData(result: CrawlResult, keywords: string[]): any[] {
    const trainingData: any[] = [];

    // Generate training samples for each keyword
    keywords.forEach(keyword => {
      const content = `${result.title} ${result.description} ${result.h1Tags.join(' ')} ${result.h2Tags.join(' ')}`.toLowerCase();
      const keywordLower = keyword.toLowerCase();

      // Check if keyword appears in content
      const keywordPresent = content.includes(keywordLower);
      const keywordFrequency = (content.match(new RegExp(keywordLower, 'g')) || []).length;

      // Title optimization score
      const titleContainsKeyword = result.title.toLowerCase().includes(keywordLower);
      const titleLength = result.title.length;
      const titleScore = titleContainsKeyword && titleLength <= 60 ? 1 : 0;

      // Description optimization score
      const descContainsKeyword = result.description.toLowerCase().includes(keywordLower);
      const descLength = result.description.length;
      const descScore = descContainsKeyword && descLength <= 160 ? 1 : 0;

      // H1 optimization score
      const h1ContainsKeyword = result.h1Tags.some(h1 => h1.toLowerCase().includes(keywordLower));
      const h1Score = h1ContainsKeyword ? 1 : 0;

      // Overall SEO score
      const seoScore = (titleScore + descScore + h1Score) / 3;

      trainingData.push({
        keyword,
        url: result.url,
        title: result.title,
        description: result.description,
        keywordPresent,
        keywordFrequency,
        titleScore,
        descScore,
        h1Score,
        seoScore,
        wordCount: result.wordCount,
        loadTime: result.loadTime,
        internalLinks: result.links.filter(link => link.startsWith('/') || link.startsWith(result.url)).length,
        externalLinks: result.links.filter(link => !link.startsWith('/') && !link.startsWith(result.url)).length,
        imagesCount: result.images.length,
        crawledAt: result.crawledAt
      });
    });

    return trainingData;
  }

  /**
   * Generate SEO recommendations based on crawl data
   */
  generateSEORecommendations(results: CrawlResult[]): any[] {
    const recommendations: any[] = [];

    results.forEach(result => {
      // Title recommendations
      if (result.title.length > 60) {
        recommendations.push({
          type: 'title',
          severity: 'warning',
          message: `Title too long (${result.title.length} chars). Recommended: 50-60 characters.`,
          url: result.url,
          suggestion: result.title.substring(0, 57) + '...'
        });
      }

      if (result.title.length === 0) {
        recommendations.push({
          type: 'title',
          severity: 'error',
          message: 'Missing title tag',
          url: result.url,
          suggestion: 'Add a descriptive title tag'
        });
      }

      // Description recommendations
      if (result.description.length > 160) {
        recommendations.push({
          type: 'description',
          severity: 'warning',
          message: `Meta description too long (${result.description.length} chars). Recommended: 120-160 characters.`,
          url: result.url,
          suggestion: result.description.substring(0, 157) + '...'
        });
      }

      if (result.description.length === 0) {
        recommendations.push({
          type: 'description',
          severity: 'warning',
          message: 'Missing meta description',
          url: result.url,
          suggestion: 'Add a compelling meta description'
        });
      }

      // H1 recommendations
      if (result.h1Tags.length === 0) {
        recommendations.push({
          type: 'h1',
          severity: 'error',
          message: 'Missing H1 tag',
          url: result.url,
          suggestion: 'Add exactly one H1 tag per page'
        });
      }

      if (result.h1Tags.length > 1) {
        recommendations.push({
          type: 'h1',
          severity: 'warning',
          message: `Multiple H1 tags found (${result.h1Tags.length}). Recommended: exactly one H1 tag.`,
          url: result.url,
          suggestion: 'Use only one H1 tag per page'
        });
      }

      // Content recommendations
      if (result.wordCount < 300) {
        recommendations.push({
          type: 'content',
          severity: 'warning',
          message: `Low word count (${result.wordCount}). Recommended: at least 300 words.`,
          url: result.url,
          suggestion: 'Add more comprehensive content'
        });
      }

      // Performance recommendations
      if (result.loadTime > 3000) {
        recommendations.push({
          type: 'performance',
          severity: 'warning',
          message: `Slow page load time (${result.loadTime}ms). Recommended: under 3 seconds.`,
          url: result.url,
          suggestion: 'Optimize images, minify code, enable compression'
        });
      }
    });

    return recommendations;
  }

  /**
   * Utility delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const seoCrawler = new SEOCrawler();
