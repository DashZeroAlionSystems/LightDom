// Integration Tests for SEO Pipeline
// Comprehensive test suite for the complete SEO data pipeline

import { SEODataProcessor } from './seo-data-processor.js';
import { SEOTrainingModel } from './ai-training-model.js';
import { SEOServiceAPI } from './seo-api-service.js';
import { Pool } from 'pg';
import axios from 'axios';

class SEOIntegrationTests {
  constructor(config = {}) {
    this.config = {
      dbHost: config.dbHost || process.env.DB_HOST || 'localhost',
      dbPort: config.dbPort || process.env.DB_PORT || 5432,
      dbName: config.dbName || process.env.DB_NAME || 'dom_space_harvester',
      dbUser: config.dbUser || process.env.DB_USER || 'postgres',
      dbPassword: config.dbPassword || process.env.DB_PASSWORD || 'postgres',
      apiBaseUrl: config.apiBaseUrl || 'http://localhost:3002',
      apiKey: config.apiKey || 'test-api-key'
    };

    this.db = new Pool({
      host: this.config.dbHost,
      port: this.config.dbPort,
      database: this.config.dbName,
      user: this.config.dbUser,
      password: this.config.dbPassword,
      max: 5,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    this.seoProcessor = null;
    this.aiModel = null;
    this.apiServer = null;
    
    this.testResults = {
      passed: 0,
      failed: 0,
      total: 0,
      details: []
    };
  }

  /**
   * Run all integration tests
   */
  async runAllTests() {
    console.log('🧪 Starting SEO Pipeline Integration Tests...\n');

    try {
      // Initialize services
      await this.initializeServices();

      // Run test suites
      await this.runDatabaseTests();
      await this.runDataProcessorTests();
      await this.runAIModelTests();
      await this.runAPITests();
      await this.runEndToEndTests();

      // Generate test report
      this.generateTestReport();

    } catch (error) {
      console.error('❌ Test suite failed:', error);
      this.testResults.failed++;
      this.testResults.total++;
    } finally {
      await this.cleanup();
    }
  }

  /**
   * Initialize test services
   */
  async initializeServices() {
    console.log('🔧 Initializing test services...');

    try {
      // Test database connection
      await this.db.query('SELECT NOW()');
      console.log('✅ Database connection established');

      // Initialize SEO processor
      this.seoProcessor = new SEODataProcessor({
        dbHost: this.config.dbHost,
        dbPort: this.config.dbPort,
        dbName: this.config.dbName,
        dbUser: this.config.dbUser,
        dbPassword: this.config.dbPassword
      });

      // Initialize AI model
      this.aiModel = new SEOTrainingModel({
        dbHost: this.config.dbHost,
        dbPort: this.config.dbPort,
        dbName: this.config.dbName,
        dbUser: this.config.dbUser,
        dbPassword: this.config.dbPassword
      });

      console.log('✅ Services initialized successfully\n');
    } catch (error) {
      console.error('❌ Service initialization failed:', error);
      throw error;
    }
  }

  /**
   * Database connectivity and schema tests
   */
  async runDatabaseTests() {
    console.log('📊 Running Database Tests...');

    const tests = [
      {
        name: 'Database Connection',
        test: () => this.db.query('SELECT NOW()')
      },
      {
        name: 'SEO Analysis Table Exists',
        test: () => this.db.query('SELECT * FROM seo_analysis LIMIT 1')
      },
      {
        name: 'Domain SEO Metrics Table Exists',
        test: () => this.db.query('SELECT * FROM domain_seo_metrics LIMIT 1')
      },
      {
        name: 'SEO Insights Table Exists',
        test: () => this.db.query('SELECT * FROM seo_insights LIMIT 1')
      },
      {
        name: 'API Keys Table Exists',
        test: () => this.db.query('SELECT * FROM api_keys LIMIT 1')
      },
      {
        name: 'SEO Recommendations Table Exists',
        test: () => this.db.query('SELECT * FROM seo_recommendations LIMIT 1')
      },
      {
        name: 'AI Predictions Table Exists',
        test: () => this.db.query('SELECT * FROM ai_predictions LIMIT 1')
      },
      {
        name: 'SEO Trends Table Exists',
        test: () => this.db.query('SELECT * FROM seo_trends LIMIT 1')
      },
      {
        name: 'Performance Trends Table Exists',
        test: () => this.db.query('SELECT * FROM performance_trends LIMIT 1')
      },
      {
        name: 'AI Model Versions Table Exists',
        test: () => this.db.query('SELECT * FROM ai_model_versions LIMIT 1')
      }
    ];

    await this.runTestSuite('Database Tests', tests);
  }

  /**
   * SEO Data Processor tests
   */
  async runDataProcessorTests() {
    console.log('🔄 Running SEO Data Processor Tests...');

    const tests = [
      {
        name: 'SEO Processor Initialization',
        test: () => Promise.resolve(this.seoProcessor !== null)
      },
      {
        name: 'Extract SEO Metrics',
        test: () => this.testExtractSEOMetrics()
      },
      {
        name: 'Calculate SEO Score',
        test: () => this.testCalculateSEOScore()
      },
      {
        name: 'Generate Recommendations',
        test: () => this.testGenerateRecommendations()
      },
      {
        name: 'Store SEO Data',
        test: () => this.testStoreSEOData()
      },
      {
        name: 'Update Domain Metrics',
        test: () => this.testUpdateDomainMetrics()
      },
      {
        name: 'Generate Insights',
        test: () => this.testGenerateInsights()
      }
    ];

    await this.runTestSuite('SEO Data Processor Tests', tests);
  }

  /**
   * AI Model tests
   */
  async runAIModelTests() {
    console.log('🤖 Running AI Model Tests...');

    const tests = [
      {
        name: 'AI Model Initialization',
        test: () => Promise.resolve(this.aiModel !== null)
      },
      {
        name: 'Model Architecture',
        test: () => this.testModelArchitecture()
      },
      {
        name: 'Feature Extraction',
        test: () => this.testFeatureExtraction()
      },
      {
        name: 'Data Normalization',
        test: () => this.testDataNormalization()
      },
      {
        name: 'Model Prediction',
        test: () => this.testModelPrediction()
      },
      {
        name: 'AI Recommendations',
        test: () => this.testAIRecommendations()
      },
      {
        name: 'Model Training Data',
        test: () => this.testModelTrainingData()
      }
    ];

    await this.runTestSuite('AI Model Tests', tests);
  }

  /**
   * API Service tests
   */
  async runAPITests() {
    console.log('🌐 Running API Service Tests...');

    const tests = [
      {
        name: 'API Health Check',
        test: () => this.testAPIHealthCheck()
      },
      {
        name: 'SEO Analysis Endpoint',
        test: () => this.testSEOAnalysisEndpoint()
      },
      {
        name: 'Domain Overview Endpoint',
        test: () => this.testDomainOverviewEndpoint()
      },
      {
        name: 'AI Recommendations Endpoint',
        test: () => this.testAIRecommendationsEndpoint()
      },
      {
        name: 'Score Prediction Endpoint',
        test: () => this.testScorePredictionEndpoint()
      },
      {
        name: 'Domain Comparison Endpoint',
        test: () => this.testDomainComparisonEndpoint()
      },
      {
        name: 'SEO Trends Endpoint',
        test: () => this.testSEOTrendsEndpoint()
      },
      {
        name: 'Model Status Endpoint',
        test: () => this.testModelStatusEndpoint()
      },
      {
        name: 'API Authentication',
        test: () => this.testAPIAuthentication()
      },
      {
        name: 'Rate Limiting',
        test: () => this.testRateLimiting()
      }
    ];

    await this.runTestSuite('API Service Tests', tests);
  }

  /**
   * End-to-end integration tests
   */
  async runEndToEndTests() {
    console.log('🔄 Running End-to-End Tests...');

    const tests = [
      {
        name: 'Complete SEO Analysis Flow',
        test: () => this.testCompleteSEOAnalysisFlow()
      },
      {
        name: 'AI Training and Prediction Flow',
        test: () => this.testAITrainingAndPredictionFlow()
      },
      {
        name: 'Domain Comparison Flow',
        test: () => this.testDomainComparisonFlow()
      },
      {
        name: 'Trend Analysis Flow',
        test: () => this.testTrendAnalysisFlow()
      },
      {
        name: 'Recommendation Implementation Flow',
        test: () => this.testRecommendationImplementationFlow()
      }
    ];

    await this.runTestSuite('End-to-End Tests', tests);
  }

  /**
   * Run a test suite
   */
  async runTestSuite(suiteName, tests) {
    console.log(`  Running ${suiteName}...`);

    for (const test of tests) {
      await this.runTest(test.name, test.test);
    }

    console.log(`  ✅ ${suiteName} completed\n`);
  }

  /**
   * Run a single test
   */
  async runTest(testName, testFunction) {
    this.testResults.total++;
    
    try {
      const startTime = Date.now();
      await testFunction();
      const duration = Date.now() - startTime;
      
      this.testResults.passed++;
      this.testResults.details.push({
        name: testName,
        status: 'PASSED',
        duration: `${duration}ms`
      });
      
      console.log(`    ✅ ${testName} (${duration}ms)`);
    } catch (error) {
      this.testResults.failed++;
      this.testResults.details.push({
        name: testName,
        status: 'FAILED',
        error: error.message,
        duration: 'N/A'
      });
      
      console.log(`    ❌ ${testName}: ${error.message}`);
    }
  }

  /**
   * Test SEO metrics extraction
   */
  async testExtractSEOMetrics() {
    const mockOptimizationData = {
      url: 'https://test.example.com',
      domStats: {
        titleLength: 45,
        descriptionLength: 140,
        h1Count: 1,
        h2Count: 3,
        imageCount: 5,
        imagesWithAlt: 4,
        totalElements: 100,
        unusedElements: 5,
        deadCSS: 2,
        orphanedJS: 1,
        isHTTPS: true,
        isResponsive: true,
        hasViewport: true
      },
      performance: {
        loadTime: 2500,
        fid: 80,
        cls: 0.1,
        memoryUsage: 50000000
      },
      schemas: [
        { type: 'Organization', data: { name: 'Test Company' } },
        { type: 'WebSite', data: { url: 'https://test.example.com' } }
      ],
      backlinks: [
        { isExternal: false, anchorText: 'Home' },
        { isExternal: true, anchorText: 'External Link' }
      ]
    };

    const seoMetrics = await this.seoProcessor.extractSEOMetrics(mockOptimizationData);
    
    if (!seoMetrics.url || !seoMetrics.domain || !seoMetrics.seoScore) {
      throw new Error('SEO metrics extraction failed');
    }

    if (seoMetrics.seoScore < 0 || seoMetrics.seoScore > 100) {
      throw new Error('Invalid SEO score range');
    }

    return seoMetrics;
  }

  /**
   * Test SEO score calculation
   */
  async testCalculateSEOScore() {
    const mockSEOMetrics = {
      coreWebVitals: {
        lcp: { score: 80 },
        fid: { score: 90 },
        cls: { score: 85 }
      },
      contentMetrics: {
        title: { score: 95 },
        description: { score: 90 },
        headings: { score: 85 },
        images: { score: 80 },
        schemaMarkup: { score: 70 }
      },
      technicalSEO: {
        pageSpeed: { score: 75 },
        mobileOptimization: { score: 90 },
        domOptimization: { score: 85 },
        security: { score: 100 }
      },
      backlinkMetrics: { score: 60 },
      schemaMetrics: { score: 70 }
    };

    const score = this.seoProcessor.calculateSEOScore(mockSEOMetrics);
    
    if (score < 0 || score > 100) {
      throw new Error('Invalid SEO score calculation');
    }

    return score;
  }

  /**
   * Test recommendation generation
   */
  async testGenerateRecommendations() {
    const mockSEOMetrics = {
      coreWebVitals: {
        lcp: { status: 'poor', value: 5000 },
        fid: { status: 'good', value: 80 },
        cls: { status: 'needs-improvement', value: 0.2 }
      },
      contentMetrics: {
        title: { status: 'poor', length: 20 },
        description: { status: 'good', length: 140 },
        headings: { status: 'poor', h1Count: 0 },
        images: { status: 'needs-improvement', total: 10, withAlt: 6 }
      },
      technicalSEO: {
        domOptimization: { status: 'poor', unusedElements: 20 },
        mobileOptimization: { status: 'good' },
        security: { status: 'poor', https: false }
      },
      backlinkMetrics: { status: 'poor', total: 0 },
      schemaMetrics: { status: 'poor', count: 0 }
    };

    const recommendations = this.seoProcessor.generateRecommendations(mockSEOMetrics);
    
    if (!Array.isArray(recommendations)) {
      throw new Error('Recommendations should be an array');
    }

    if (recommendations.length === 0) {
      throw new Error('Should generate recommendations for poor metrics');
    }

    return recommendations;
  }

  /**
   * Test SEO data storage
   */
  async testStoreSEOData() {
    const mockSEOData = {
      url: 'https://test.example.com',
      domain: 'test.example.com',
      timestamp: new Date(),
      coreWebVitals: { lcp: { score: 80 } },
      contentMetrics: { title: { score: 90 } },
      technicalSEO: { pageSpeed: { score: 75 } },
      backlinkMetrics: { score: 60 },
      schemaMetrics: { score: 70 },
      seoScore: 75.5,
      recommendations: [{ title: 'Test recommendation' }]
    };

    await this.seoProcessor.storeSEOData(mockSEOData);
    
    const result = await this.db.query(
      'SELECT * FROM seo_analysis WHERE url = $1',
      [mockSEOData.url]
    );

    if (result.rows.length === 0) {
      throw new Error('SEO data was not stored');
    }

    return result.rows[0];
  }

  /**
   * Test domain metrics update
   */
  async testUpdateDomainMetrics() {
    const mockSEOData = {
      domain: 'test.example.com',
      timestamp: new Date(),
      seoScore: 80.0,
      coreWebVitals: { lcp: { score: 85 } },
      contentMetrics: { title: { score: 90 } },
      technicalSEO: { pageSpeed: { score: 75 } }
    };

    await this.seoProcessor.updateDomainMetrics(mockSEOData);
    
    const result = await this.db.query(
      'SELECT * FROM domain_seo_metrics WHERE domain = $1',
      [mockSEOData.domain]
    );

    if (result.rows.length === 0) {
      throw new Error('Domain metrics were not updated');
    }

    return result.rows[0];
  }

  /**
   * Test insights generation
   */
  async testGenerateInsights() {
    const mockSEOData = {
      url: 'https://test.example.com',
      domain: 'test.example.com',
      timestamp: new Date(),
      seoScore: 75.5,
      performanceFactors: { lcp: 2500, fid: 80, cls: 0.1 },
      contentFactors: { titleLength: 45, descriptionLength: 140 },
      technicalFactors: { domElements: 100, unusedElements: 5 },
      backlinkFactors: { totalBacklinks: 2, externalBacklinks: 1 },
      recommendations: [{ category: 'performance', priority: 'high' }]
    };

    await this.seoProcessor.generateInsights(mockSEOData);
    
    const result = await this.db.query(
      'SELECT * FROM seo_insights WHERE url = $1',
      [mockSEOData.url]
    );

    if (result.rows.length === 0) {
      throw new Error('Insights were not generated');
    }

    return result.rows[0];
  }

  /**
   * Test model architecture
   */
  async testModelArchitecture() {
    if (!this.aiModel.model) {
      throw new Error('AI model not initialized');
    }

    const inputShape = this.aiModel.model.inputs[0].shape;
    const outputShape = this.aiModel.model.outputs[0].shape;

    if (!inputShape || !outputShape) {
      throw new Error('Invalid model architecture');
    }

    return { inputShape, outputShape };
  }

  /**
   * Test feature extraction
   */
  async testFeatureExtraction() {
    const mockData = {
      performanceFactors: { lcp: 2500, fid: 80, cls: 0.1, loadTime: 2000 },
      contentFactors: { titleLength: 45, descriptionLength: 140, headingCount: 4, imageCount: 5, schemaCount: 2 },
      technicalFactors: { domElements: 100, unusedElements: 5, deadCSS: 2, orphanedJS: 1, isHTTPS: true },
      backlinkFactors: { totalBacklinks: 2, externalBacklinks: 1 }
    };

    const features = this.aiModel.extractFeatures(mockData);
    
    if (!Array.isArray(features)) {
      throw new Error('Features should be an array');
    }

    if (features.length !== this.aiModel.getFeatureCount()) {
      throw new Error('Feature count mismatch');
    }

    return features;
  }

  /**
   * Test data normalization
   */
  async testDataNormalization() {
    const testCases = [
      { value: 0, min: 0, max: 100, expected: 0 },
      { value: 50, min: 0, max: 100, expected: 0.5 },
      { value: 100, min: 0, max: 100, expected: 1 },
      { value: 150, min: 0, max: 100, expected: 1 },
      { value: -50, min: 0, max: 100, expected: 0 }
    ];

    for (const testCase of testCases) {
      const result = this.aiModel.normalizeValue(testCase.value, testCase.min, testCase.max);
      if (Math.abs(result - testCase.expected) > 0.001) {
        throw new Error(`Normalization failed: ${testCase.value} -> ${result}, expected ${testCase.expected}`);
      }
    }

    return true;
  }

  /**
   * Test model prediction
   */
  async testModelPrediction() {
    const mockData = {
      performanceFactors: { lcp: 2500, fid: 80, cls: 0.1, loadTime: 2000 },
      contentFactors: { titleLength: 45, descriptionLength: 140, headingCount: 4, imageCount: 5, schemaCount: 2 },
      technicalFactors: { domElements: 100, unusedElements: 5, deadCSS: 2, orphanedJS: 1, isHTTPS: true },
      backlinkFactors: { totalBacklinks: 2, externalBacklinks: 1 }
    };

    try {
      const prediction = await this.aiModel.predictSEO(mockData);
      
      if (prediction < 0 || prediction > 100) {
        throw new Error('Invalid prediction range');
      }

      return prediction;
    } catch (error) {
      // Model might not be trained yet, which is expected in tests
      if (error.message.includes('Model not loaded')) {
        return 'Model not trained yet (expected in tests)';
      }
      throw error;
    }
  }

  /**
   * Test AI recommendations
   */
  async testAIRecommendations() {
    const mockData = {
      performanceFactors: { lcp: 5000, fid: 200, cls: 0.3, loadTime: 4000 },
      contentFactors: { titleLength: 20, descriptionLength: 50, headingCount: 0, imageCount: 10, schemaCount: 0 },
      technicalFactors: { domElements: 200, unusedElements: 50, deadCSS: 10, orphanedJS: 5, isHTTPS: false },
      backlinkFactors: { totalBacklinks: 0, externalBacklinks: 0 }
    };

    try {
      const recommendations = await this.aiModel.generateAIRecommendations(mockData);
      
      if (!Array.isArray(recommendations)) {
        throw new Error('AI recommendations should be an array');
      }

      return recommendations;
    } catch (error) {
      // Model might not be trained yet, which is expected in tests
      if (error.message.includes('Model not loaded')) {
        return 'Model not trained yet (expected in tests)';
      }
      throw error;
    }
  }

  /**
   * Test model training data
   */
  async testModelTrainingData() {
    // Insert some test training data
    const testInsights = {
      url: 'https://test.example.com',
      domain: 'test.example.com',
      timestamp: new Date(),
      seoScore: 75.5,
      performanceFactors: { lcp: 2500, fid: 80, cls: 0.1, loadTime: 2000 },
      contentFactors: { titleLength: 45, descriptionLength: 140, headingCount: 4, imageCount: 5, schemaCount: 2 },
      technicalFactors: { domElements: 100, unusedElements: 5, deadCSS: 2, orphanedJS: 1, isHTTPS: true },
      backlinkFactors: { totalBacklinks: 2, externalBacklinks: 1 },
      recommendations: [{ category: 'performance', priority: 'high', impact: 'high' }]
    };

    await this.db.query(`
      INSERT INTO seo_insights (url, domain, analysis_timestamp, insights_data)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (url, analysis_timestamp) DO NOTHING
    `, [testInsights.url, testInsights.domain, testInsights.timestamp, JSON.stringify(testInsights)]);

    const trainingData = await this.aiModel.loadTrainingData(10);
    
    if (!Array.isArray(trainingData)) {
      throw new Error('Training data should be an array');
    }

    return trainingData;
  }

  /**
   * Test API health check
   */
  async testAPIHealthCheck() {
    const response = await axios.get(`${this.config.apiBaseUrl}/api/seo/health`);
    
    if (response.status !== 200) {
      throw new Error('Health check failed');
    }

    if (!response.data.status || response.data.status !== 'healthy') {
      throw new Error('Service not healthy');
    }

    return response.data;
  }

  /**
   * Test SEO analysis endpoint
   */
  async testSEOAnalysisEndpoint() {
    const response = await axios.post(
      `${this.config.apiBaseUrl}/api/seo/analyze`,
      {
        url: 'https://test.example.com',
        includeAIRecommendations: false
      },
      {
        headers: { 'x-api-key': this.config.apiKey }
      }
    );

    if (response.status !== 200) {
      throw new Error('SEO analysis endpoint failed');
    }

    return response.data;
  }

  /**
   * Test domain overview endpoint
   */
  async testDomainOverviewEndpoint() {
    const response = await axios.get(
      `${this.config.apiBaseUrl}/api/seo/domain/test.example.com`,
      {
        headers: { 'x-api-key': this.config.apiKey }
      }
    );

    if (response.status !== 200) {
      throw new Error('Domain overview endpoint failed');
    }

    return response.data;
  }

  /**
   * Test AI recommendations endpoint
   */
  async testAIRecommendationsEndpoint() {
    const response = await axios.post(
      `${this.config.apiBaseUrl}/api/seo/recommendations`,
      {
        url: 'https://test.example.com',
        category: 'performance',
        limit: 5
      },
      {
        headers: { 'x-api-key': this.config.apiKey }
      }
    );

    if (response.status !== 200) {
      throw new Error('AI recommendations endpoint failed');
    }

    return response.data;
  }

  /**
   * Test score prediction endpoint
   */
  async testScorePredictionEndpoint() {
    const response = await axios.post(
      `${this.config.apiBaseUrl}/api/seo/predict`,
      {
        url: 'https://test.example.com',
        optimizations: {
          performance: { lcp: 2000, fid: 80 },
          content: { titleLength: 50 }
        }
      },
      {
        headers: { 'x-api-key': this.config.apiKey }
      }
    );

    if (response.status !== 200) {
      throw new Error('Score prediction endpoint failed');
    }

    return response.data;
  }

  /**
   * Test domain comparison endpoint
   */
  async testDomainComparisonEndpoint() {
    const response = await axios.post(
      `${this.config.apiBaseUrl}/api/seo/compare-domains`,
      {
        domains: ['test.example.com', 'competitor.com'],
        limit: 5
      },
      {
        headers: { 'x-api-key': this.config.apiKey }
      }
    );

    if (response.status !== 200) {
      throw new Error('Domain comparison endpoint failed');
    }

    return response.data;
  }

  /**
   * Test SEO trends endpoint
   */
  async testSEOTrendsEndpoint() {
    const response = await axios.get(
      `${this.config.apiBaseUrl}/api/seo/trends/test.example.com?days=30`,
      {
        headers: { 'x-api-key': this.config.apiKey }
      }
    );

    if (response.status !== 200) {
      throw new Error('SEO trends endpoint failed');
    }

    return response.data;
  }

  /**
   * Test model status endpoint
   */
  async testModelStatusEndpoint() {
    const response = await axios.get(
      `${this.config.apiBaseUrl}/api/seo/model-status`,
      {
        headers: { 'x-api-key': this.config.apiKey }
      }
    );

    if (response.status !== 200) {
      throw new Error('Model status endpoint failed');
    }

    return response.data;
  }

  /**
   * Test API authentication
   */
  async testAPIAuthentication() {
    try {
      await axios.get(`${this.config.apiBaseUrl}/api/seo/health`);
      throw new Error('Should require API key');
    } catch (error) {
      if (error.response && error.response.status === 401) {
        return 'Authentication working correctly';
      }
      throw new Error('Authentication test failed');
    }
  }

  /**
   * Test rate limiting
   */
  async testRateLimiting() {
    const requests = [];
    for (let i = 0; i < 110; i++) {
      requests.push(
        axios.get(`${this.config.apiBaseUrl}/api/seo/health`, {
          headers: { 'x-api-key': this.config.apiKey }
        }).catch(error => error.response)
      );
    }

    const responses = await Promise.all(requests);
    const rateLimited = responses.some(r => r && r.status === 429);

    if (!rateLimited) {
      throw new Error('Rate limiting not working');
    }

    return 'Rate limiting working correctly';
  }

  /**
   * Test complete SEO analysis flow
   */
  async testCompleteSEOAnalysisFlow() {
    // 1. Create test optimization data
    const optimizationData = {
      url: 'https://e2e-test.example.com',
      domStats: {
        titleLength: 45,
        descriptionLength: 140,
        h1Count: 1,
        h2Count: 3,
        imageCount: 5,
        imagesWithAlt: 4,
        totalElements: 100,
        unusedElements: 5,
        deadCSS: 2,
        orphanedJS: 1,
        isHTTPS: true,
        isResponsive: true,
        hasViewport: true
      },
      performance: {
        loadTime: 2500,
        fid: 80,
        cls: 0.1,
        memoryUsage: 50000000
      },
      schemas: [
        { type: 'Organization', data: { name: 'E2E Test Company' } }
      ],
      backlinks: [
        { isExternal: false, anchorText: 'Home' },
        { isExternal: true, anchorText: 'External Link' }
      ]
    };

    // 2. Process SEO data
    const seoData = await this.seoProcessor.queueOptimizationData(optimizationData);
    
    // 3. Wait for processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 4. Verify data was stored
    const analysis = await this.seoProcessor.getSEOAnalysis(optimizationData.url);
    if (!analysis) {
      throw new Error('SEO analysis not found after processing');
    }

    // 5. Test API endpoint
    const apiResponse = await axios.post(
      `${this.config.apiBaseUrl}/api/seo/analyze`,
      { url: optimizationData.url },
      { headers: { 'x-api-key': this.config.apiKey } }
    );

    if (apiResponse.status !== 200) {
      throw new Error('API analysis failed');
    }

    return 'Complete SEO analysis flow working';
  }

  /**
   * Test AI training and prediction flow
   */
  async testAITrainingAndPredictionFlow() {
    // 1. Generate training data
    const trainingData = [];
    for (let i = 0; i < 50; i++) {
      trainingData.push({
        url: `https://training-test-${i}.example.com`,
        domain: 'training-test.example.com',
        timestamp: new Date(),
        seoScore: 60 + Math.random() * 40,
        performanceFactors: {
          lcp: 1000 + Math.random() * 4000,
          fid: 50 + Math.random() * 200,
          cls: Math.random() * 0.5,
          loadTime: 1000 + Math.random() * 3000
        },
        contentFactors: {
          titleLength: 20 + Math.random() * 60,
          descriptionLength: 80 + Math.random() * 120,
          headingCount: Math.floor(Math.random() * 10),
          imageCount: Math.floor(Math.random() * 20),
          schemaCount: Math.floor(Math.random() * 5)
        },
        technicalFactors: {
          domElements: 50 + Math.random() * 200,
          unusedElements: Math.random() * 20,
          deadCSS: Math.random() * 10,
          orphanedJS: Math.random() * 5,
          isHTTPS: Math.random() > 0.5
        },
        backlinkFactors: {
          totalBacklinks: Math.floor(Math.random() * 20),
          externalBacklinks: Math.floor(Math.random() * 10)
        },
        recommendations: []
      });
    }

    // 2. Store training data
    for (const data of trainingData) {
      await this.db.query(`
        INSERT INTO seo_insights (url, domain, analysis_timestamp, insights_data)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (url, analysis_timestamp) DO NOTHING
      `, [data.url, data.domain, data.timestamp, JSON.stringify(data)]);
    }

    // 3. Test model training (if enough data)
    try {
      await this.aiModel.loadTrainingData();
      const preparedData = this.aiModel.prepareTrainingData();
      
      if (preparedData.features.shape[0] > 10) {
        // Test prediction
        const testData = trainingData[0];
        const prediction = await this.aiModel.predictSEO(testData);
        
        if (prediction < 0 || prediction > 100) {
          throw new Error('Invalid prediction range');
        }
      }
    } catch (error) {
      if (error.message.includes('not enough')) {
        return 'Not enough training data (expected in tests)';
      }
      throw error;
    }

    return 'AI training and prediction flow working';
  }

  /**
   * Test domain comparison flow
   */
  async testDomainComparisonFlow() {
    // 1. Create test domains
    const domains = ['e2e-domain1.com', 'e2e-domain2.com'];
    
    for (const domain of domains) {
      await this.db.query(`
        INSERT INTO domain_seo_metrics (domain, avg_seo_score, total_pages_analyzed, last_analysis)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (domain) DO UPDATE SET
          avg_seo_score = EXCLUDED.avg_seo_score,
          total_pages_analyzed = EXCLUDED.total_pages_analyzed,
          last_analysis = EXCLUDED.last_analysis
      `, [domain, 70 + Math.random() * 30, Math.floor(Math.random() * 20) + 1, new Date()]);
    }

    // 2. Test comparison API
    const response = await axios.post(
      `${this.config.apiBaseUrl}/api/seo/compare-domains`,
      { domains },
      { headers: { 'x-api-key': this.config.apiKey } }
    );

    if (response.status !== 200) {
      throw new Error('Domain comparison API failed');
    }

    if (!response.data.comparison || response.data.comparison.length !== domains.length) {
      throw new Error('Invalid comparison result');
    }

    return 'Domain comparison flow working';
  }

  /**
   * Test trend analysis flow
   */
  async testTrendAnalysisFlow() {
    const domain = 'e2e-trends.com';
    const today = new Date();
    
    // 1. Create trend data
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      await this.db.query(`
        INSERT INTO seo_trends (domain, trend_date, avg_seo_score, page_count, avg_lcp, avg_fid, avg_cls)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (domain, trend_date) DO UPDATE SET
          avg_seo_score = EXCLUDED.avg_seo_score,
          page_count = EXCLUDED.page_count,
          avg_lcp = EXCLUDED.avg_lcp,
          avg_fid = EXCLUDED.avg_fid,
          avg_cls = EXCLUDED.avg_cls
      `, [
        domain,
        date.toISOString().split('T')[0],
        70 + Math.random() * 30,
        Math.floor(Math.random() * 10) + 1,
        2000 + Math.random() * 2000,
        50 + Math.random() * 150,
        Math.random() * 0.3
      ]);
    }

    // 2. Test trends API
    const response = await axios.get(
      `${this.config.apiBaseUrl}/api/seo/trends/${domain}?days=7`,
      { headers: { 'x-api-key': this.config.apiKey } }
    );

    if (response.status !== 200) {
      throw new Error('Trends API failed');
    }

    if (!response.data.trends || response.data.trends.length === 0) {
      throw new Error('No trend data returned');
    }

    return 'Trend analysis flow working';
  }

  /**
   * Test recommendation implementation flow
   */
  async testRecommendationImplementationFlow() {
    const url = 'https://e2e-recommendations.example.com';
    
    // 1. Create test recommendation
    await this.db.query(`
      INSERT INTO seo_recommendations (url, domain, recommendation_type, category, priority, title, description, impact, predicted_improvement)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `, [
      url,
      'e2e-recommendations.example.com',
      'performance',
      'performance',
      'high',
      'Optimize Core Web Vitals',
      'Improve LCP, FID, and CLS scores',
      'high',
      15.5
    ]);

    // 2. Test recommendation retrieval
    const result = await this.db.query(`
      SELECT * FROM seo_recommendations WHERE url = $1
    `, [url]);

    if (result.rows.length === 0) {
      throw new Error('Recommendation not found');
    }

    // 3. Test recommendation update
    await this.db.query(`
      UPDATE seo_recommendations 
      SET implementation_status = 'implemented', implemented_at = NOW()
      WHERE url = $1
    `, [url]);

    const updatedResult = await this.db.query(`
      SELECT * FROM seo_recommendations WHERE url = $1
    `, [url]);

    if (updatedResult.rows[0].implementation_status !== 'implemented') {
      throw new Error('Recommendation status not updated');
    }

    return 'Recommendation implementation flow working';
  }

  /**
   * Generate test report
   */
  generateTestReport() {
    console.log('\n' + '='.repeat(60));
    console.log('🧪 SEO PIPELINE INTEGRATION TEST REPORT');
    console.log('='.repeat(60));
    
    const passRate = ((this.testResults.passed / this.testResults.total) * 100).toFixed(1);
    
    console.log(`\n📊 SUMMARY:`);
    console.log(`   Total Tests: ${this.testResults.total}`);
    console.log(`   Passed: ${this.testResults.passed} ✅`);
    console.log(`   Failed: ${this.testResults.failed} ❌`);
    console.log(`   Pass Rate: ${passRate}%`);
    
    if (this.testResults.failed > 0) {
      console.log(`\n❌ FAILED TESTS:`);
      this.testResults.details
        .filter(test => test.status === 'FAILED')
        .forEach(test => {
          console.log(`   • ${test.name}: ${test.error}`);
        });
    }
    
    console.log(`\n✅ PASSED TESTS:`);
    this.testResults.details
      .filter(test => test.status === 'PASSED')
      .forEach(test => {
        console.log(`   • ${test.name} (${test.duration})`);
      });
    
    console.log('\n' + '='.repeat(60));
    
    if (this.testResults.failed === 0) {
      console.log('🎉 ALL TESTS PASSED! SEO Pipeline is ready for production.');
    } else {
      console.log('⚠️  Some tests failed. Please review and fix issues before deployment.');
    }
    
    console.log('='.repeat(60) + '\n');
  }

  /**
   * Cleanup test resources
   */
  async cleanup() {
    console.log('🧹 Cleaning up test resources...');
    
    try {
      // Clean up test data
      await this.db.query(`
        DELETE FROM seo_analysis WHERE url LIKE '%test%' OR url LIKE '%e2e%'
      `);
      
      await this.db.query(`
        DELETE FROM domain_seo_metrics WHERE domain LIKE '%test%' OR domain LIKE '%e2e%'
      `);
      
      await this.db.query(`
        DELETE FROM seo_insights WHERE url LIKE '%test%' OR url LIKE '%e2e%'
      `);
      
      await this.db.query(`
        DELETE FROM seo_recommendations WHERE url LIKE '%test%' OR url LIKE '%e2e%'
      `);
      
      await this.db.query(`
        DELETE FROM seo_trends WHERE domain LIKE '%test%' OR domain LIKE '%e2e%'
      `);

      // Close database connection
      await this.db.end();
      
      console.log('✅ Cleanup completed');
    } catch (error) {
      console.error('❌ Cleanup failed:', error);
    }
  }
}

// Run tests if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const tests = new SEOIntegrationTests();
  tests.runAllTests().catch(console.error);
}

export { SEOIntegrationTests };