/**
 * Training Data Bundler
 * 
 * Aggregates data from multiple sources and mining workers to create
 * comprehensive training datasets for specific ML model functionalities.
 * 
 * Features:
 * - Smart data aggregation from multiple URLs
 * - Attribute validation and normalization
 * - Dataset quality scoring
 * - Model-specific data preparation
 * - Schema-linked data bundling
 */

import { EnhancedDataMiningWorker } from './enhanced-data-mining-worker.js';
import { ChromeLayersService } from './chrome-layers-service.js';

export class TrainingDataBundler {
  constructor(db = null) {
    this.db = db;
    this.workers = [];
    this.layersService = null;
  }

  /**
   * Initialize services
   */
  async initialize() {
    // Initialize Chrome Layers Service
    this.layersService = new ChromeLayersService({ headless: true, cacheEnabled: false });
    await this.layersService.initialize();

    // Initialize data mining workers (pool of 3)
    for (let i = 0; i < 3; i++) {
      const worker = new EnhancedDataMiningWorker({ workerId: `worker-${i}` });
      await worker.initialize();
      this.workers.push(worker);
    }

    console.log('✅ Training Data Bundler initialized with', this.workers.length, 'workers');
  }

  /**
   * Create training bundle for a specific functionality
   * 
   * @param {string} functionality - Target functionality (e.g., 'seo_optimization', 'component_generation')
   * @param {Array} urls - URLs to mine data from
   * @param {Object} options - Configuration options
   * @returns {Object} Training data bundle
   */
  async createTrainingBundle(functionality, urls, options = {}) {
    console.log(`📦 Creating training bundle for: ${functionality}`);
    console.log(`   URLs to process: ${urls.length}`);

    // Map functionality to model types and required attributes
    const bundleConfig = this.getBundleConfiguration(functionality);
    
    if (!bundleConfig) {
      throw new Error(`Unknown functionality: ${functionality}`);
    }

    const bundle = {
      functionality,
      timestamp: new Date().toISOString(),
      configuration: bundleConfig,
      datasets: [],
      metadata: {
        totalUrls: urls.length,
        successfulUrls: 0,
        failedUrls: 0,
        totalDataPoints: 0,
        avgQualityScore: 0,
        attributeCoverage: {}
      },
      aggregatedAttributes: {},
      linkedSchemas: [],
      trainingRecommendations: []
    };

    // Process URLs in parallel using worker pool
    const urlBatches = this.createBatches(urls, this.workers.length);
    const allResults = [];

    for (let i = 0; i < urlBatches.length; i++) {
      const batch = urlBatches[i];
      const worker = this.workers[i % this.workers.length];

      console.log(`   Processing batch ${i + 1}/${urlBatches.length} (${batch.length} URLs)`);

      for (const modelType of bundleConfig.modelTypes) {
        const results = await worker.batchMineData(batch, modelType);
        allResults.push(...results);
      }
    }

    // Also collect Chrome Layers data if relevant
    if (bundleConfig.includeLayersData) {
      console.log('   Collecting Chrome Layers data...');
      for (const url of urls.slice(0, Math.min(10, urls.length))) { // Limit to 10 for performance
        try {
          const layerAnalysis = await this.layersService.analyzeLayersForUrl(url);
          const trainingData = await this.layersService.extractTrainingData(url, layerAnalysis);
          
          allResults.push({
            url,
            success: true,
            data: {
              modelType: 'chrome_layers',
              ...trainingData,
              layerAnalysis
            }
          });
        } catch (error) {
          console.warn(`   Failed to collect layers data for ${url}:`, error.message);
        }
      }
    }

    // Process results
    for (const result of allResults) {
      if (result.success) {
        bundle.datasets.push(result.data);
        bundle.metadata.successfulUrls++;
        bundle.metadata.totalDataPoints += Object.keys(result.data.attributes || {}).length;
      } else {
        bundle.metadata.failedUrls++;
      }
    }

    // Aggregate attributes across all datasets
    bundle.aggregatedAttributes = this.aggregateAttributes(bundle.datasets, bundleConfig.requiredAttributes);

    // Calculate metadata
    bundle.metadata.avgQualityScore = bundle.datasets.reduce((sum, d) => sum + (d.qualityScore || 0), 0) / bundle.datasets.length || 0;
    bundle.metadata.attributeCoverage = this.calculateAttributeCoverage(bundle.datasets, bundleConfig.requiredAttributes);

    // Extract linked schemas if database available
    if (this.db && bundleConfig.linkSchemas) {
      bundle.linkedSchemas = await this.extractLinkedSchemas(bundle.datasets);
    }

    // Generate training recommendations
    bundle.trainingRecommendations = this.generateTrainingRecommendations(bundle, bundleConfig);

    // Save to database if available
    if (this.db) {
      await this.saveBundleToDatabase(bundle);
    }

    console.log(`✅ Training bundle created:`);
    console.log(`   - Successful: ${bundle.metadata.successfulUrls}/${bundle.metadata.totalUrls}`);
    console.log(`   - Data points: ${bundle.metadata.totalDataPoints}`);
    console.log(`   - Quality score: ${bundle.metadata.avgQualityScore.toFixed(2)}`);

    return bundle;
  }

  /**
   * Get bundle configuration for a functionality
   */
  getBundleConfiguration(functionality) {
    const configs = {
      seo_optimization: {
        modelTypes: ['seo_optimizer', 'performance_optimizer'],
        requiredAttributes: [
          'meta_tags', 'heading_structure', 'schema_markup',
          'page_load_time', 'mobile_friendliness', 'structured_data',
          'content_quality', 'internal_links', 'image_alt_text'
        ],
        includeLayersData: false,
        linkSchemas: true,
        minQualityScore: 70,
        description: 'Training data for SEO optimization models'
      },

      component_generation: {
        modelTypes: ['component_generator', 'design_system_analyzer'],
        requiredAttributes: [
          'component_structure', 'prop_types', 'style_patterns',
          'layout_methods', 'responsive_breakpoints', 'accessibility_features',
          'animation_usage', 'state_patterns', 'reusability_score'
        ],
        includeLayersData: true,
        linkSchemas: true,
        minQualityScore: 75,
        description: 'Training data for component generation models'
      },

      workflow_prediction: {
        modelTypes: ['workflow_predictor'],
        requiredAttributes: [
          'dom_depth', 'node_count', 'form_count', 'button_count',
          'interaction_points', 'data_flow_paths', 'event_handlers',
          'ajax_endpoints', 'state_management'
        ],
        includeLayersData: true,
        linkSchemas: true,
        minQualityScore: 65,
        description: 'Training data for workflow prediction models'
      },

      accessibility_improvement: {
        modelTypes: ['accessibility_analyzer'],
        requiredAttributes: [
          'aria_attributes', 'semantic_html', 'keyboard_navigation',
          'focus_management', 'color_contrast', 'screen_reader_support',
          'form_labels', 'error_handling', 'landmark_regions'
        ],
        includeLayersData: false,
        linkSchemas: false,
        minQualityScore: 80,
        description: 'Training data for accessibility improvement models'
      },

      ux_pattern_recognition: {
        modelTypes: ['ux_pattern_analyzer'],
        requiredAttributes: [
          'navigation_patterns', 'page_flows', 'cta_placement',
          'information_architecture', 'visual_hierarchy', 'micro_interactions',
          'loading_states', 'error_states', 'onboarding_patterns'
        ],
        includeLayersData: true,
        linkSchemas: false,
        minQualityScore: 70,
        description: 'Training data for UX pattern recognition models'
      },

      schema_relationship_learning: {
        modelTypes: ['schema_linker'],
        requiredAttributes: [
          'data_attributes', 'api_endpoints', 'data_bindings',
          'form_fields', 'table_relationships', 'crud_patterns',
          'validation_rules', 'data_transformations'
        ],
        includeLayersData: true,
        linkSchemas: true,
        minQualityScore: 75,
        description: 'Training data for schema relationship learning'
      },

      performance_optimization: {
        modelTypes: ['performance_optimizer'],
        requiredAttributes: [
          'resource_sizes', 'render_blocking_resources', 'cache_headers',
          'compression_usage', 'image_optimization', 'lazy_loading',
          'code_splitting', 'bundle_sizes', 'time_to_interactive'
        ],
        includeLayersData: false,
        linkSchemas: false,
        minQualityScore: 70,
        description: 'Training data for performance optimization'
      },

      design_system_extraction: {
        modelTypes: ['design_system_analyzer'],
        requiredAttributes: [
          'color_palette', 'typography_scale', 'spacing_system',
          'component_variants', 'icon_usage', 'grid_systems',
          'shadow_patterns', 'border_radius_usage', 'theme_tokens'
        ],
        includeLayersData: true,
        linkSchemas: false,
        minQualityScore: 75,
        description: 'Training data for design system extraction'
      }
    };

    return configs[functionality];
  }

  /**
   * Create batches for parallel processing
   */
  createBatches(array, batchCount) {
    const batches = [];
    const batchSize = Math.ceil(array.length / batchCount);
    
    for (let i = 0; i < array.length; i += batchSize) {
      batches.push(array.slice(i, i + batchSize));
    }
    
    return batches;
  }

  /**
   * Aggregate attributes from datasets
   */
  aggregateAttributes(datasets, requiredAttributes) {
    const aggregated = {};

    requiredAttributes.forEach(attr => {
      const values = [];
      const distributions = {};

      datasets.forEach(dataset => {
        if (dataset.attributes && dataset.attributes[attr] !== undefined) {
          const value = dataset.attributes[attr];
          values.push(value);

          // Track distribution
          const key = typeof value === 'object' ? JSON.stringify(value) : String(value);
          distributions[key] = (distributions[key] || 0) + 1;
        }
      });

      aggregated[attr] = {
        count: values.length,
        coverage: (values.length / datasets.length * 100).toFixed(2) + '%',
        distribution: distributions,
        samples: values.slice(0, 5) // Keep 5 samples
      };
    });

    return aggregated;
  }

  /**
   * Calculate attribute coverage
   */
  calculateAttributeCoverage(datasets, requiredAttributes) {
    const coverage = {};

    requiredAttributes.forEach(attr => {
      const presentCount = datasets.filter(d => d.attributes && d.attributes[attr] !== undefined).length;
      coverage[attr] = {
        present: presentCount,
        total: datasets.length,
        percentage: (presentCount / datasets.length * 100).toFixed(2)
      };
    });

    return coverage;
  }

  /**
   * Extract linked schemas from datasets
   */
  async extractLinkedSchemas(datasets) {
    if (!this.db) return [];

    const schemas = [];

    try {
      // Query database for schema information
      const result = await this.db.query(`
        SELECT DISTINCT 
          table_schema,
          table_name,
          column_name,
          data_type
        FROM information_schema.columns
        WHERE table_schema = 'public'
        ORDER BY table_name, ordinal_position
        LIMIT 1000
      `);

      // Match schemas to data patterns in datasets
      datasets.forEach(dataset => {
        if (dataset.rawData && dataset.rawData.dataFlow) {
          const dataAttrs = dataset.rawData.dataFlow.dataAttributes;
          
          Object.entries(dataAttrs || {}).forEach(([key, value]) => {
            // Try to match data attributes to schema tables
            result.rows.forEach(row => {
              if (value.attributes) {
                Object.keys(value.attributes).forEach(attr => {
                  const attrName = attr.replace('data-', '');
                  
                  if (row.table_name.includes(attrName) || attrName.includes(row.table_name)) {
                    schemas.push({
                      dataAttribute: attr,
                      schemaTable: row.table_name,
                      schemaColumn: row.column_name,
                      dataType: row.data_type,
                      confidence: 0.7,
                      source: dataset.url
                    });
                  }
                });
              }
            });
          });
        }
      });
    } catch (error) {
      console.warn('Failed to extract linked schemas:', error.message);
    }

    // Deduplicate and sort by confidence
    const uniqueSchemas = Array.from(
      new Map(schemas.map(s => [JSON.stringify(s), s])).values()
    ).sort((a, b) => b.confidence - a.confidence);

    return uniqueSchemas.slice(0, 100); // Limit to top 100
  }

  /**
   * Generate training recommendations
   */
  generateTrainingRecommendations(bundle, config) {
    const recommendations = [];

    // Check data quality
    if (bundle.metadata.avgQualityScore < config.minQualityScore) {
      recommendations.push({
        type: 'quality',
        severity: 'high',
        message: `Average quality score (${bundle.metadata.avgQualityScore.toFixed(2)}) is below threshold (${config.minQualityScore})`,
        suggestion: 'Collect data from higher quality sources or improve data collection methods'
      });
    }

    // Check attribute coverage
    Object.entries(bundle.metadata.attributeCoverage).forEach(([attr, coverage]) => {
      if (parseFloat(coverage.percentage) < 50) {
        recommendations.push({
          type: 'coverage',
          severity: 'medium',
          attribute: attr,
          message: `Low coverage for attribute '${attr}' (${coverage.percentage})`,
          suggestion: 'Ensure data sources contain this attribute or adjust collection methods'
        });
      }
    });

    // Check dataset size
    if (bundle.metadata.successfulUrls < 10) {
      recommendations.push({
        type: 'size',
        severity: 'high',
        message: `Small dataset size (${bundle.metadata.successfulUrls} URLs)`,
        suggestion: 'Collect data from more URLs for better model training (recommended: 100+)'
      });
    }

    // Check schema linking
    if (config.linkSchemas && bundle.linkedSchemas.length === 0) {
      recommendations.push({
        type: 'schema',
        severity: 'low',
        message: 'No schema links found',
        suggestion: 'Verify that data sources contain schema-linkable attributes'
      });
    }

    return recommendations;
  }

  /**
   * Save bundle to database
   */
  async saveBundleToDatabase(bundle) {
    if (!this.db) return;

    try {
      await this.db.query(`
        INSERT INTO ml_training_bundles (
          functionality,
          configuration,
          total_urls,
          successful_urls,
          total_data_points,
          avg_quality_score,
          attribute_coverage,
          aggregated_attributes,
          linked_schemas,
          recommendations,
          created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
      `, [
        bundle.functionality,
        JSON.stringify(bundle.configuration),
        bundle.metadata.totalUrls,
        bundle.metadata.successfulUrls,
        bundle.metadata.totalDataPoints,
        bundle.metadata.avgQualityScore,
        JSON.stringify(bundle.metadata.attributeCoverage),
        JSON.stringify(bundle.aggregatedAttributes),
        JSON.stringify(bundle.linkedSchemas),
        JSON.stringify(bundle.trainingRecommendations)
      ]);

      console.log('✅ Bundle saved to database');
    } catch (error) {
      console.error('Failed to save bundle to database:', error.message);
    }
  }

  /**
   * List all supported functionalities
   */
  getSupportedFunctionalities() {
    return [
      { id: 'seo_optimization', name: 'SEO Optimization' },
      { id: 'component_generation', name: 'Component Generation' },
      { id: 'workflow_prediction', name: 'Workflow Prediction' },
      { id: 'accessibility_improvement', name: 'Accessibility Improvement' },
      { id: 'ux_pattern_recognition', name: 'UX Pattern Recognition' },
      { id: 'schema_relationship_learning', name: 'Schema Relationship Learning' },
      { id: 'performance_optimization', name: 'Performance Optimization' },
      { id: 'design_system_extraction', name: 'Design System Extraction' }
    ];
  }

  /**
   * Cleanup
   */
  async cleanup() {
    for (const worker of this.workers) {
      await worker.cleanup();
    }
    
    if (this.layersService) {
      await this.layersService.cleanup();
    }

    this.workers = [];
    console.log('✅ Training Data Bundler cleaned up');
  }
}

export default TrainingDataBundler;
