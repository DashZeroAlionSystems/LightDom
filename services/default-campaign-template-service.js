/**
 * Default Campaign Template Service
 * 
 * Provides pre-configured templates for different campaign types,
 * especially the "mine everything" default campaign that uses all techniques
 */

import { EventEmitter } from 'events';

class DefaultCampaignTemplateService extends EventEmitter {
  constructor() {
    super();
    
    this.templates = {
      default: this.getDefaultTemplate(),
      seo: this.getSEOTemplate(),
      content: this.getContentTemplate(),
      ecommerce: this.getEcommerceTemplate(),
      news: this.getNewsTemplate(),
    };
  }

  /**
   * Get default "mine everything" template
   */
  getDefaultTemplate() {
    return {
      name: 'Complete Data Mining Campaign',
      description: 'Comprehensive data extraction using all available techniques',
      
      // Campaign settings
      campaign: {
        maxDepth: 5,
        maxPages: 10000,
        concurrency: 10,
        requestDelay: 2000,
        respectRobots: true,
      },

      // Cluster configuration
      cluster: {
        enabled: true,
        name: 'Main Mining Cluster',
        reason: 'Coordinate comprehensive data mining with all techniques',
        strategy: 'smart',
        maxCrawlers: 20,
        autoScale: true,
      },

      // Seeding services - all methods enabled
      seeding: {
        enabled: true,
        methods: ['sitemap', 'search', 'api'],
        sitemap: {
          followSubSitemaps: true,
          maxUrls: 10000,
          priority: 10,
        },
        search: {
          engines: ['google', 'bing', 'duckduckgo'],
          maxResultsPerEngine: 100,
          priority: 8,
        },
        api: {
          enabled: false, // User provides endpoint
          priority: 5,
        },
      },

      // Advanced features - all enabled
      advanced: {
        proxies: {
          enabled: true,
          rotation: 'smart',
          rotateInterval: 10,
          healthCheck: true,
        },
        robotsTxt: {
          enabled: true,
          respectCrawlDelay: true,
          minDelay: 1000,
          maxDelay: 10000,
        },
        layers3D: {
          enabled: true,
          maxDepth: 8,
          minImportance: 0.4,
          extractCompositing: true,
          gpuAcceleration: 'auto',
        },
        ocr: {
          enabled: true,
          maxImages: 10,
          compressionRatio: 0.1,
          minPrecision: 0.95,
          batchSize: 20,
        },
        resilience: {
          retryAttempts: 3,
          exponentialBackoff: true,
          userAgentRotation: true,
          sessionPersistence: true,
        },
        performance: {
          resourceBlocking: ['font'], // Keep images for OCR
          caching: true,
          compression: true,
          http2: true,
        },
      },

      // Data extraction configuration
      extraction: {
        // All data types
        types: [
          'html',
          'text',
          'metadata',
          'schemas',
          'seo',
          'images',
          'links',
          'headings',
          'tables',
          'forms',
          'scripts',
          'styles'
        ],
        
        // Schema extraction
        schemas: {
          jsonLd: true,
          microdata: true,
          rdfa: true,
          opengraph: true,
          twitter: true,
        },

        // SEO data
        seo: {
          title: true,
          metaTags: true,
          headings: true,
          images: true,
          links: true,
          canonical: true,
          robots: true,
          structured: true,
        },

        // 3D layers data
        layers3D: {
          positions: true,
          zIndex: true,
          compositing: true,
          paint: true,
          bounds: true,
        },

        // OCR results
        ocr: {
          text: true,
          confidence: true,
          metadata: true,
          boundingBoxes: true,
        },
      },

      // Output configuration
      output: {
        format: 'database', // database, json, both
        
        // Database configuration
        database: {
          table: 'mined_data_comprehensive',
          createRelationships: true,
          linkSchemas: true,
          enableDrillDown: true,
          
          // Schema for the table
          schema: {
            id: 'TEXT PRIMARY KEY',
            campaign_id: 'TEXT NOT NULL',
            url: 'TEXT NOT NULL',
            domain: 'TEXT',
            crawled_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
            
            // Content fields
            title: 'TEXT',
            content_text: 'TEXT',
            content_html: 'TEXT',
            metadata: 'JSONB',
            
            // Schema fields
            schemas_found: 'JSONB',
            schema_types: 'TEXT[]',
            linked_schemas: 'JSONB',
            
            // SEO fields
            seo_score: 'INTEGER',
            seo_data: 'JSONB',
            meta_tags: 'JSONB',
            headings: 'JSONB',
            
            // Media fields
            images: 'JSONB',
            ocr_results: 'JSONB',
            
            // Structure fields
            links_internal: 'JSONB',
            links_external: 'JSONB',
            dom_structure: 'JSONB',
            layers_3d: 'JSONB',
            
            // Performance fields
            load_time: 'INTEGER',
            size_bytes: 'INTEGER',
            resource_count: 'INTEGER',
            
            // Status fields
            status: 'TEXT',
            error_message: 'TEXT',
            retry_count: 'INTEGER DEFAULT 0',
          },
          
          // Indexes
          indexes: [
            'CREATE INDEX IF NOT EXISTS idx_mined_data_campaign ON mined_data_comprehensive(campaign_id)',
            'CREATE INDEX IF NOT EXISTS idx_mined_data_url ON mined_data_comprehensive(url)',
            'CREATE INDEX IF NOT EXISTS idx_mined_data_domain ON mined_data_comprehensive(domain)',
            'CREATE INDEX IF NOT EXISTS idx_mined_data_crawled ON mined_data_comprehensive(crawled_at)',
            'CREATE INDEX IF NOT EXISTS idx_mined_data_status ON mined_data_comprehensive(status)',
            'CREATE INDEX IF NOT EXISTS idx_mined_data_seo_score ON mined_data_comprehensive(seo_score)',
            'CREATE INDEX IF NOT EXISTS idx_mined_data_schemas ON mined_data_comprehensive USING GIN (schemas_found)',
            'CREATE INDEX IF NOT EXISTS idx_mined_data_metadata ON mined_data_comprehensive USING GIN (metadata)',
          ],

          // Relationships
          relationships: [
            {
              name: 'campaign_relationship',
              foreignKey: 'campaign_id',
              references: 'crawler_campaigns(id)',
              onDelete: 'CASCADE',
            },
          ],

          // Drill-down views
          drillDownViews: [
            {
              name: 'by_domain',
              groupBy: 'domain',
              aggregates: ['COUNT(*) as page_count', 'AVG(seo_score) as avg_seo'],
            },
            {
              name: 'by_schema_type',
              groupBy: 'schema_types',
              aggregates: ['COUNT(*) as count'],
            },
            {
              name: 'by_date',
              groupBy: 'DATE(crawled_at)',
              aggregates: ['COUNT(*) as count', 'AVG(load_time) as avg_load'],
            },
          ],
        },

        // JSON export configuration
        json: {
          enabled: true,
          path: './exports',
          filename: '{campaign_id}_{timestamp}.json',
          pretty: true,
          compress: true,
        },

        // Template for output structure
        template: {
          includeFields: [
            'url',
            'title',
            'content_text',
            'metadata',
            'schemas_found',
            'seo_data',
            'images',
            'ocr_results',
            'links_internal',
            'links_external',
            'dom_structure',
            'layers_3d'
          ],
          
          nestedStructure: true,
          
          structure: {
            basic: ['url', 'title', 'crawled_at'],
            content: ['content_text', 'content_html', 'metadata'],
            schemas: ['schemas_found', 'linked_schemas'],
            seo: ['seo_score', 'seo_data', 'meta_tags', 'headings'],
            media: ['images', 'ocr_results'],
            links: ['links_internal', 'links_external'],
            structure: ['dom_structure', 'layers_3d'],
          },
        },
      },

      // Monitoring and analytics
      monitoring: {
        enabled: true,
        metrics: [
          'pages_crawled',
          'data_extracted',
          'schemas_found',
          'images_processed',
          'ocr_successful',
          'avg_response_time',
          'error_rate',
          'proxy_usage',
        ],
        alerts: [
          {
            metric: 'error_rate',
            threshold: 0.1,
            action: 'pause',
          },
          {
            metric: 'proxy_failures',
            threshold: 5,
            action: 'rotate',
          },
        ],
      },
    };
  }

  /**
   * Get SEO-focused template
   */
  getSEOTemplate() {
    const baseTemplate = this.getDefaultTemplate();
    return {
      ...baseTemplate,
      name: 'SEO Training Data Campaign',
      description: 'Extract comprehensive SEO data for training ML models',
      extraction: {
        ...baseTemplate.extraction,
        types: ['html', 'text', 'metadata', 'schemas', 'seo', 'links'],
      },
      output: {
        ...baseTemplate.output,
        database: {
          ...baseTemplate.output.database,
          table: 'seo_training_data',
        },
      },
    };
  }

  /**
   * Get content extraction template
   */
  getContentTemplate() {
    const baseTemplate = this.getDefaultTemplate();
    return {
      ...baseTemplate,
      name: 'Content Extraction Campaign',
      description: 'Extract text content and media',
      advanced: {
        ...baseTemplate.advanced,
        layers3D: { enabled: false },
      },
      extraction: {
        ...baseTemplate.extraction,
        types: ['html', 'text', 'metadata', 'images', 'links'],
      },
    };
  }

  /**
   * Get e-commerce template
   */
  getEcommerceTemplate() {
    const baseTemplate = this.getDefaultTemplate();
    return {
      ...baseTemplate,
      name: 'E-commerce Data Mining Campaign',
      description: 'Extract product information, prices, and reviews',
      extraction: {
        ...baseTemplate.extraction,
        types: ['html', 'text', 'metadata', 'schemas', 'images', 'tables'],
      },
      output: {
        ...baseTemplate.output,
        database: {
          ...baseTemplate.output.database,
          table: 'ecommerce_products',
        },
      },
    };
  }

  /**
   * Get news/blog template
   */
  getNewsTemplate() {
    const baseTemplate = this.getDefaultTemplate();
    return {
      ...baseTemplate,
      name: 'News/Blog Content Campaign',
      description: 'Extract articles, authors, and publication data',
      extraction: {
        ...baseTemplate.extraction,
        types: ['html', 'text', 'metadata', 'schemas', 'images', 'links'],
      },
      output: {
        ...baseTemplate.output,
        database: {
          ...baseTemplate.output.database,
          table: 'news_articles',
        },
      },
    };
  }

  /**
   * Get template by type
   */
  getTemplate(type) {
    return this.templates[type] || this.templates.default;
  }

  /**
   * Apply template to campaign configuration
   */
  applyTemplate(templateType, customConfig = {}) {
    const template = this.getTemplate(templateType);
    
    // Deep merge custom config with template
    return this.deepMerge(template, customConfig);
  }

  /**
   * Deep merge objects
   */
  deepMerge(target, source) {
    const output = { ...target };
    
    if (this.isObject(target) && this.isObject(source)) {
      Object.keys(source).forEach(key => {
        if (this.isObject(source[key])) {
          if (!(key in target)) {
            output[key] = source[key];
          } else {
            output[key] = this.deepMerge(target[key], source[key]);
          }
        } else {
          output[key] = source[key];
        }
      });
    }
    
    return output;
  }

  /**
   * Check if value is object
   */
  isObject(item) {
    return item && typeof item === 'object' && !Array.isArray(item);
  }

  /**
   * Generate SQL for creating output table
   */
  generateTableSQL(template) {
    const { database } = template.output;
    const { table, schema, indexes, relationships } = database;

    let sql = `-- Create table for ${template.name}\n`;
    sql += `CREATE TABLE IF NOT EXISTS ${table} (\n`;
    
    const fields = Object.entries(schema).map(([name, type]) => `  ${name} ${type}`);
    sql += fields.join(',\n');
    sql += '\n);\n\n';

    // Add indexes
    sql += '-- Indexes\n';
    sql += indexes.join(';\n') + ';\n\n';

    // Add foreign keys
    if (relationships && relationships.length > 0) {
      sql += '-- Foreign keys\n';
      relationships.forEach(rel => {
        sql += `ALTER TABLE ${table} ADD CONSTRAINT fk_${rel.name} `;
        sql += `FOREIGN KEY (${rel.foreignKey}) REFERENCES ${rel.references}`;
        if (rel.onDelete) {
          sql += ` ON DELETE ${rel.onDelete}`;
        }
        sql += ';\n';
      });
      sql += '\n';
    }

    // Add views for drill-downs
    if (database.drillDownViews && database.drillDownViews.length > 0) {
      sql += '-- Drill-down views\n';
      database.drillDownViews.forEach(view => {
        sql += `CREATE OR REPLACE VIEW ${table}_${view.name} AS\n`;
        sql += `SELECT ${view.groupBy}, ${view.aggregates.join(', ')}\n`;
        sql += `FROM ${table}\n`;
        sql += `GROUP BY ${view.groupBy};\n\n`;
      });
    }

    return sql;
  }

  /**
   * List all available templates
   */
  listTemplates() {
    return Object.keys(this.templates).map(key => ({
      id: key,
      name: this.templates[key].name,
      description: this.templates[key].description,
    }));
  }
}

// Export singleton
const templateService = new DefaultCampaignTemplateService();

export default templateService;
export { DefaultCampaignTemplateService };
