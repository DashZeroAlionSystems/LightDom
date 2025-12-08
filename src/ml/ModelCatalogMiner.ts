/**
 * ModelCatalogMiner - Mines and catalogs AI models from multiple sources
 * 
 * Sources:
 * - Ollama Library (ollama.com/library)
 * - Kaggle (kaggle.com/models)
 * - HuggingFace (huggingface.co/models)
 * 
 * Features:
 * - Scrapes model metadata, descriptions, tags
 * - Downloads and stores Modelfile configurations
 * - Tracks download stats and popularity
 * - Campaign system for automated mining
 * - Database storage with search capabilities
 * 
 * @module ModelCatalogMiner
 */

import { EventEmitter } from 'events';
import type { DatabaseAccessLayer } from '../database/DatabaseAccessLayer';

/**
 * Model catalog entry
 */
export interface ModelCatalogEntry {
  id?: number;
  source: 'ollama' | 'kaggle' | 'huggingface';
  name: string;
  fullName: string;
  description: string;
  tags: string[];
  size_gb?: number;
  downloads?: number;
  config: Record<string, any>;
  modelfile?: string;
  capabilities: string[];
  framework?: string;
  created_at?: Date;
  updated_at?: Date;
}

/**
 * Mining campaign configuration
 */
export interface MiningCampaign {
  id?: string;
  name: string;
  sources: ('ollama' | 'kaggle' | 'huggingface')[];
  filters: {
    tags?: string[];
    minDownloads?: number;
    maxSizeGb?: number;
    frameworks?: string[];
  };
  schedule?: 'once' | 'daily' | 'weekly' | 'monthly';
  lastRun?: Date;
  status: 'pending' | 'running' | 'completed' | 'failed';
}

/**
 * Mining statistics
 */
export interface MiningStats {
  totalModels: number;
  bySource: Record<string, number>;
  byFramework: Record<string, number>;
  totalSizeGb: number;
  averageDownloads: number;
  lastMined: Date;
}

/**
 * Ollama model from library
 */
interface OllamaModel {
  name: string;
  tags: string[];
  description: string;
  size?: number;
  modelfile?: string;
}

/**
 * Kaggle model metadata
 */
interface KaggleModel {
  slug: string;
  title: string;
  description: string;
  downloadCount: number;
  tags: string[];
  framework: string;
}

/**
 * HuggingFace model metadata
 */
interface HuggingFaceModel {
  id: string;
  modelId: string;
  downloads: number;
  tags: string[];
  pipeline_tag?: string;
}

/**
 * ModelCatalogMiner - Main mining class
 */
export class ModelCatalogMiner extends EventEmitter {
  private db: DatabaseAccessLayer;
  private campaigns: Map<string, MiningCampaign>;
  private initialized: boolean = false;

  constructor(db: DatabaseAccessLayer) {
    super();
    this.db = db;
    this.campaigns = new Map();
  }

  /**
   * Initialize the miner
   */
  async initialize(): Promise<void> {
    this.emit('initializing');

    // Create database tables
    await this.createTables();

    // Load existing campaigns
    await this.loadCampaigns();

    this.initialized = true;
    this.emit('initialized');
  }

  /**
   * Create database tables
   */
  private async createTables(): Promise<void> {
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS model_catalog (
        id SERIAL PRIMARY KEY,
        source VARCHAR(50) NOT NULL,
        name VARCHAR(255) NOT NULL,
        full_name VARCHAR(500),
        description TEXT,
        tags TEXT[],
        size_gb DECIMAL(10, 2),
        downloads INTEGER,
        config JSONB,
        modelfile TEXT,
        capabilities TEXT[],
        framework VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(source, name)
      );

      CREATE INDEX IF NOT EXISTS idx_model_catalog_source ON model_catalog(source);
      CREATE INDEX IF NOT EXISTS idx_model_catalog_tags ON model_catalog USING GIN(tags);
      CREATE INDEX IF NOT EXISTS idx_model_catalog_downloads ON model_catalog(downloads DESC);

      CREATE TABLE IF NOT EXISTS model_catalog_campaigns (
        id VARCHAR(100) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        sources TEXT[],
        filters JSONB,
        schedule VARCHAR(20),
        last_run TIMESTAMP,
        status VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS model_catalog_configs (
        id SERIAL PRIMARY KEY,
        model_id INTEGER REFERENCES model_catalog(id),
        title VARCHAR(255),
        description TEXT,
        option_key VARCHAR(100),
        option_value TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    this.emit('tables:created');
  }

  /**
   * Load campaigns from database
   */
  private async loadCampaigns(): Promise<void> {
    const result = await this.db.select('model_catalog_campaigns', {});
    
    for (const row of result) {
      const campaign: MiningCampaign = {
        id: row.id,
        name: row.name,
        sources: row.sources,
        filters: row.filters,
        schedule: row.schedule,
        lastRun: row.last_run,
        status: row.status,
      };
      this.campaigns.set(campaign.id!, campaign);
    }

    this.emit('campaigns:loaded', { count: this.campaigns.size });
  }

  /**
   * Mine Ollama library for models
   */
  async mineOllamaLibrary(): Promise<ModelCatalogEntry[]> {
    this.emit('mining:started', { source: 'ollama' });

    try {
      // Fetch Ollama library page
      const response = await fetch('https://ollama.com/api/library');
      if (!response.ok) {
        throw new Error(`Failed to fetch Ollama library: ${response.statusText}`);
      }

      const data = await response.json();
      const models: ModelCatalogEntry[] = [];

      // Parse models
      for (const model of data.models || []) {
        const entry: ModelCatalogEntry = {
          source: 'ollama',
          name: model.name,
          fullName: `ollama.com/library/${model.name}`,
          description: model.description || '',
          tags: model.tags || [],
          downloads: model.pulls || 0,
          config: {
            template: model.template,
            parameters: model.parameters,
          },
          modelfile: await this.fetchModelfile(model.name),
          capabilities: this.inferCapabilities(model.description, model.tags),
        };

        models.push(entry);

        // Store in database
        await this.storeModel(entry);
      }

      this.emit('mining:completed', { 
        source: 'ollama', 
        count: models.length 
      });

      return models;

    } catch (error) {
      this.emit('mining:error', { source: 'ollama', error });
      throw error;
    }
  }

  /**
   * Fetch Modelfile for an Ollama model
   */
  private async fetchModelfile(modelName: string): Promise<string | undefined> {
    try {
      const response = await fetch(`https://ollama.com/library/${modelName}/blobs/modelfile`);
      if (response.ok) {
        return await response.text();
      }
    } catch (error) {
      // Modelfile not available, continue
    }
    return undefined;
  }

  /**
   * Mine Kaggle for pre-trained models
   */
  async mineKaggle(options: { limit?: number } = {}): Promise<ModelCatalogEntry[]> {
    this.emit('mining:started', { source: 'kaggle' });

    try {
      // Note: Kaggle requires API key for full access
      // This is a simplified version using public search

      const limit = options.limit || 100;
      const models: ModelCatalogEntry[] = [];

      // Fetch Kaggle models search page
      const response = await fetch(
        `https://www.kaggle.com/api/i/models.ModelsService/ListModels`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            pageSize: limit,
            sortBy: 'HOTNESS',
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Kaggle API error: ${response.statusText}`);
      }

      const data = await response.json();

      for (const model of data.models || []) {
        const entry: ModelCatalogEntry = {
          source: 'kaggle',
          name: model.slug,
          fullName: `kaggle.com/models/${model.slug}`,
          description: model.subtitle || model.title || '',
          tags: model.tags || [],
          downloads: model.downloadCount || 0,
          config: {
            framework: model.framework,
            license: model.license,
          },
          capabilities: this.inferCapabilities(
            model.subtitle || model.title,
            model.tags
          ),
          framework: model.framework,
        };

        models.push(entry);

        // Store in database
        await this.storeModel(entry);
      }

      this.emit('mining:completed', { 
        source: 'kaggle', 
        count: models.length 
      });

      return models;

    } catch (error) {
      this.emit('mining:error', { source: 'kaggle', error });
      throw error;
    }
  }

  /**
   * Mine HuggingFace model hub
   */
  async mineHuggingFace(options: { 
    limit?: number;
    filter?: string;
  } = {}): Promise<ModelCatalogEntry[]> {
    this.emit('mining:started', { source: 'huggingface' });

    try {
      const limit = options.limit || 100;
      const models: ModelCatalogEntry[] = [];

      // Fetch HuggingFace models
      const response = await fetch(
        `https://huggingface.co/api/models?limit=${limit}&sort=downloads`,
        {
          headers: {
            'Accept': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HuggingFace API error: ${response.statusText}`);
      }

      const data = await response.json();

      for (const model of data || []) {
        const entry: ModelCatalogEntry = {
          source: 'huggingface',
          name: model.modelId || model.id,
          fullName: `huggingface.co/${model.modelId || model.id}`,
          description: model.description || '',
          tags: model.tags || [],
          downloads: model.downloads || 0,
          config: {
            pipeline_tag: model.pipeline_tag,
            library_name: model.library_name,
          },
          capabilities: this.inferCapabilities(
            model.description || '',
            model.tags
          ),
          framework: model.library_name,
        };

        models.push(entry);

        // Store in database
        await this.storeModel(entry);
      }

      this.emit('mining:completed', { 
        source: 'huggingface', 
        count: models.length 
      });

      return models;

    } catch (error) {
      this.emit('mining:error', { source: 'huggingface', error });
      throw error;
    }
  }

  /**
   * Store model in database
   */
  private async storeModel(entry: ModelCatalogEntry): Promise<void> {
    try {
      await this.db.upsert('model_catalog', 
        {
          source: entry.source,
          name: entry.name,
          full_name: entry.fullName,
          description: entry.description,
          tags: entry.tags,
          size_gb: entry.size_gb,
          downloads: entry.downloads,
          config: entry.config,
          modelfile: entry.modelfile,
          capabilities: entry.capabilities,
          framework: entry.framework,
        },
        ['source', 'name']
      );

      // Store config options separately
      if (entry.config && entry.modelfile) {
        await this.storeModelConfig(entry);
      }

    } catch (error) {
      this.emit('store:error', { model: entry.name, error });
    }
  }

  /**
   * Store model configuration options
   */
  private async storeModelConfig(entry: ModelCatalogEntry): Promise<void> {
    // Get model ID
    const result = await this.db.select('model_catalog', {
      source: entry.source,
      name: entry.name,
    });

    if (result.length === 0) return;
    const modelId = result[0].id;

    // Parse config options from modelfile
    if (entry.modelfile) {
      const options = this.parseModelfileOptions(entry.modelfile);
      
      for (const option of options) {
        await this.db.insert('model_catalog_configs', {
          model_id: modelId,
          title: option.title,
          description: option.description,
          option_key: option.key,
          option_value: option.value,
        });
      }
    }
  }

  /**
   * Parse options from Modelfile
   */
  private parseModelfileOptions(modelfile: string): Array<{
    title: string;
    description: string;
    key: string;
    value: string;
  }> {
    const options: Array<{
      title: string;
      description: string;
      key: string;
      value: string;
    }> = [];

    // Parse PARAMETER lines
    const paramRegex = /PARAMETER\s+(\w+)\s+(.+)/g;
    let match;
    while ((match = paramRegex.exec(modelfile)) !== null) {
      options.push({
        title: match[1],
        description: `Parameter: ${match[1]}`,
        key: match[1],
        value: match[2].trim(),
      });
    }

    // Parse TEMPLATE
    const templateMatch = modelfile.match(/TEMPLATE\s+"([^"]+)"/);
    if (templateMatch) {
      options.push({
        title: 'template',
        description: 'Prompt template',
        key: 'template',
        value: templateMatch[1],
      });
    }

    // Parse SYSTEM
    const systemMatch = modelfile.match(/SYSTEM\s+"([^"]+)"/);
    if (systemMatch) {
      options.push({
        title: 'system',
        description: 'System prompt',
        key: 'system',
        value: systemMatch[1],
      });
    }

    return options;
  }

  /**
   * Infer capabilities from description and tags
   */
  private inferCapabilities(description: string, tags: string[]): string[] {
    const capabilities = new Set<string>();

    const text = (description + ' ' + tags.join(' ')).toLowerCase();

    if (text.includes('code') || text.includes('programming')) {
      capabilities.add('code-generation');
    }
    if (text.includes('chat') || text.includes('conversation')) {
      capabilities.add('chat');
    }
    if (text.includes('vision') || text.includes('image')) {
      capabilities.add('vision');
    }
    if (text.includes('embedding')) {
      capabilities.add('embeddings');
    }
    if (text.includes('instruct') || text.includes('instruction')) {
      capabilities.add('instruction-following');
    }
    if (text.includes('summariz')) {
      capabilities.add('summarization');
    }
    if (text.includes('translation')) {
      capabilities.add('translation');
    }
    if (text.includes('question') || text.includes('answer')) {
      capabilities.add('question-answering');
    }

    return Array.from(capabilities);
  }

  /**
   * Create a mining campaign
   */
  async createMiningCampaign(config: Omit<MiningCampaign, 'id' | 'status'>): Promise<MiningCampaign> {
    const campaign: MiningCampaign = {
      id: `campaign-${Date.now()}`,
      ...config,
      status: 'pending',
    };

    await this.db.insert('model_catalog_campaigns', {
      id: campaign.id,
      name: campaign.name,
      sources: campaign.sources,
      filters: campaign.filters,
      schedule: campaign.schedule,
      status: campaign.status,
    });

    this.campaigns.set(campaign.id, campaign);
    this.emit('campaign:created', { id: campaign.id });

    return campaign;
  }

  /**
   * Execute a mining campaign
   */
  async executeCampaign(campaignId: string): Promise<void> {
    const campaign = this.campaigns.get(campaignId);
    if (!campaign) {
      throw new Error(`Campaign not found: ${campaignId}`);
    }

    this.emit('campaign:started', { id: campaignId });

    try {
      campaign.status = 'running';
      await this.updateCampaign(campaign);

      const results: ModelCatalogEntry[] = [];

      // Mine each source
      for (const source of campaign.sources) {
        let models: ModelCatalogEntry[] = [];

        switch (source) {
          case 'ollama':
            models = await this.mineOllamaLibrary();
            break;
          case 'kaggle':
            models = await this.mineKaggle({ limit: 100 });
            break;
          case 'huggingface':
            models = await this.mineHuggingFace({ limit: 100 });
            break;
        }

        // Apply filters
        models = this.applyFilters(models, campaign.filters);
        results.push(...models);
      }

      campaign.status = 'completed';
      campaign.lastRun = new Date();
      await this.updateCampaign(campaign);

      this.emit('campaign:completed', { 
        id: campaignId, 
        models: results.length 
      });

    } catch (error) {
      campaign.status = 'failed';
      await this.updateCampaign(campaign);
      this.emit('campaign:error', { id: campaignId, error });
      throw error;
    }
  }

  /**
   * Apply filters to models
   */
  private applyFilters(
    models: ModelCatalogEntry[],
    filters: MiningCampaign['filters']
  ): ModelCatalogEntry[] {
    let filtered = models;

    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered.filter(m => 
        filters.tags!.some(tag => m.tags.includes(tag))
      );
    }

    if (filters.minDownloads) {
      filtered = filtered.filter(m => 
        (m.downloads || 0) >= filters.minDownloads!
      );
    }

    if (filters.maxSizeGb) {
      filtered = filtered.filter(m => 
        !m.size_gb || m.size_gb <= filters.maxSizeGb!
      );
    }

    if (filters.frameworks && filters.frameworks.length > 0) {
      filtered = filtered.filter(m => 
        m.framework && filters.frameworks!.includes(m.framework)
      );
    }

    return filtered;
  }

  /**
   * Update campaign in database
   */
  private async updateCampaign(campaign: MiningCampaign): Promise<void> {
    await this.db.update('model_catalog_campaigns',
      {
        status: campaign.status,
        last_run: campaign.lastRun,
      },
      { id: campaign.id }
    );
  }

  /**
   * Get mining statistics
   */
  async getStatistics(): Promise<MiningStats> {
    const result = await this.db.query(`
      SELECT 
        COUNT(*) as total_models,
        SUM(CASE WHEN source = 'ollama' THEN 1 ELSE 0 END) as ollama_count,
        SUM(CASE WHEN source = 'kaggle' THEN 1 ELSE 0 END) as kaggle_count,
        SUM(CASE WHEN source = 'huggingface' THEN 1 ELSE 0 END) as huggingface_count,
        SUM(size_gb) as total_size_gb,
        AVG(downloads) as avg_downloads,
        MAX(created_at) as last_mined
      FROM model_catalog
    `);

    const row = result.rows[0];

    return {
      totalModels: parseInt(row.total_models, 10),
      bySource: {
        ollama: parseInt(row.ollama_count, 10),
        kaggle: parseInt(row.kaggle_count, 10),
        huggingface: parseInt(row.huggingface_count, 10),
      },
      byFramework: {}, // Would aggregate separately
      totalSizeGb: parseFloat(row.total_size_gb) || 0,
      averageDownloads: parseFloat(row.avg_downloads) || 0,
      lastMined: new Date(row.last_mined),
    };
  }

  /**
   * Search models in catalog
   */
  async searchModels(query: string, filters?: {
    source?: string;
    tags?: string[];
    capabilities?: string[];
  }): Promise<ModelCatalogEntry[]> {
    let whereClause = `description ILIKE $1 OR name ILIKE $1`;
    const params: any[] = [`%${query}%`];
    let paramIndex = 2;

    if (filters?.source) {
      whereClause += ` AND source = $${paramIndex}`;
      params.push(filters.source);
      paramIndex++;
    }

    if (filters?.tags && filters.tags.length > 0) {
      whereClause += ` AND tags && $${paramIndex}`;
      params.push(filters.tags);
      paramIndex++;
    }

    if (filters?.capabilities && filters.capabilities.length > 0) {
      whereClause += ` AND capabilities && $${paramIndex}`;
      params.push(filters.capabilities);
      paramIndex++;
    }

    const result = await this.db.query(
      `SELECT * FROM model_catalog WHERE ${whereClause} ORDER BY downloads DESC LIMIT 50`,
      params
    );

    return result.rows as ModelCatalogEntry[];
  }
}

export default ModelCatalogMiner;
