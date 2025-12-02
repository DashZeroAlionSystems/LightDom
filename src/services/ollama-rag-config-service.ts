/**
 * Ollama RAG Configuration Service
 * 
 * Service for managing Ollama model and RAG configurations stored in the database.
 * Supports CRUD operations, configuration application, and Modelfile generation.
 * 
 * @module services/ollama-rag-config-service
 */

import { EventEmitter } from 'events';

// Types
export interface OllamaModelConfig {
  id?: number;
  name: string;
  displayName?: string;
  description?: string;
  baseModel: string;
  temperature: number;
  topP: number;
  topK: number;
  repeatPenalty: number;
  repeatLastN: number;
  numCtx: number;
  numPredict: number;
  numBatch: number;
  numKeep: number;
  mirostat: number;
  mirostatEta: number;
  mirostatTau: number;
  stopSequences: string[];
  systemPrompt?: string;
  template?: string;
  licenseText?: string;
  isActive: boolean;
  isDefault: boolean;
  createdBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
  additionalConfig?: Record<string, unknown>;
}

export interface OllamaRagConfig {
  id?: number;
  name: string;
  displayName?: string;
  description?: string;
  modelConfigId?: number;
  embeddingModel: string;
  embeddingDimension: number;
  embeddingProvider: string;
  chunkSize: number;
  chunkOverlap: number;
  preserveStructure: boolean;
  extractMetadata: boolean;
  supportedFormats: string[];
  vectorTableName: string;
  topK: number;
  minScore: number;
  hybridSearchEnabled: boolean;
  semanticWeight: number;
  keywordWeight: number;
  maxContextTokens: number;
  includeMetadataInContext: boolean;
  contextTemplate: string;
  fallbackResponse: string;
  enableFallback: boolean;
  isActive: boolean;
  isDefault: boolean;
  createdBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
  additionalConfig?: Record<string, unknown>;
}

export interface OllamaEmbeddingConfig {
  id?: number;
  name: string;
  displayName?: string;
  description?: string;
  modelName: string;
  provider: string;
  dimension: number;
  endpointUrl: string;
  apiPath: string;
  batchSize: number;
  maxRetries: number;
  timeoutMs: number;
  normalizeEmbeddings: boolean;
  isActive: boolean;
  isDefault: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  additionalConfig?: Record<string, unknown>;
}

export interface RagDocument {
  id?: number;
  docId: string;
  namespace: string;
  title?: string;
  content: string;
  chunkIndex: number;
  totalChunks: number;
  embedding?: number[];
  metadata?: Record<string, unknown>;
  sourceUrl?: string;
  sourceType?: string;
  filePath?: string;
  embeddingModel?: string;
  embeddingConfigId?: number;
  version: number;
  parentDocId?: string;
  indexedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface OllamaModelPreset {
  id?: number;
  name: string;
  displayName?: string;
  description?: string;
  category: 'chat' | 'code' | 'rag' | 'creative' | 'precise';
  modelConfigId?: number;
  ragConfigId?: number;
  embeddingConfigId?: number;
  icon?: string;
  color?: string;
  sortOrder: number;
  isActive: boolean;
  isSystem: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface DatabaseClient {
  query: (sql: string, params?: unknown[]) => Promise<{ rows: unknown[] }>;
}

/**
 * Ollama RAG Configuration Service
 */
export class OllamaRagConfigService extends EventEmitter {
  private db: DatabaseClient;
  private ollamaEndpoint: string;
  private cache: Map<string, { data: unknown; expiry: number }>;
  private cacheTTL: number;

  constructor(options: {
    db: DatabaseClient;
    ollamaEndpoint?: string;
    cacheTTL?: number;
  }) {
    super();
    this.db = options.db;
    this.ollamaEndpoint = options.ollamaEndpoint || process.env.OLLAMA_ENDPOINT || 'http://localhost:11434';
    this.cacheTTL = options.cacheTTL || 300000; // 5 minutes default
    this.cache = new Map();
  }

  // ==========================================================================
  // Model Configuration Methods
  // ==========================================================================

  /**
   * Get all model configurations
   */
  async getModelConfigs(activeOnly = true): Promise<OllamaModelConfig[]> {
    const cacheKey = `model_configs_${activeOnly}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached as OllamaModelConfig[];

    const sql = `
      SELECT 
        id, name, display_name, description, base_model,
        temperature, top_p, top_k, repeat_penalty, repeat_last_n,
        num_ctx, num_predict, num_batch, num_keep,
        mirostat, mirostat_eta, mirostat_tau,
        stop_sequences, system_prompt, template, license_text,
        is_active, is_default, created_by, created_at, updated_at,
        additional_config
      FROM ollama_model_configs
      ${activeOnly ? 'WHERE is_active = true' : ''}
      ORDER BY is_default DESC, name ASC
    `;

    const result = await this.db.query(sql);
    const configs = result.rows.map(this.mapModelConfigRow);
    this.setCache(cacheKey, configs);
    return configs;
  }

  /**
   * Get model configuration by name
   */
  async getModelConfig(name: string): Promise<OllamaModelConfig | null> {
    const cacheKey = `model_config_${name}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached as OllamaModelConfig;

    const sql = `
      SELECT * FROM ollama_model_configs WHERE name = $1
    `;
    const result = await this.db.query(sql, [name]);
    if (result.rows.length === 0) return null;

    const config = this.mapModelConfigRow(result.rows[0]);
    this.setCache(cacheKey, config);
    return config;
  }

  /**
   * Get default model configuration
   */
  async getDefaultModelConfig(): Promise<OllamaModelConfig | null> {
    const configs = await this.getModelConfigs(true);
    return configs.find(c => c.isDefault) || configs[0] || null;
  }

  /**
   * Create or update model configuration
   */
  async upsertModelConfig(config: Partial<OllamaModelConfig>): Promise<OllamaModelConfig> {
    const sql = `
      INSERT INTO ollama_model_configs (
        name, display_name, description, base_model,
        temperature, top_p, top_k, repeat_penalty, repeat_last_n,
        num_ctx, num_predict, num_batch, num_keep,
        mirostat, mirostat_eta, mirostat_tau,
        stop_sequences, system_prompt, template, license_text,
        is_active, is_default, created_by, additional_config
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24)
      ON CONFLICT (name) DO UPDATE SET
        display_name = EXCLUDED.display_name,
        description = EXCLUDED.description,
        base_model = EXCLUDED.base_model,
        temperature = EXCLUDED.temperature,
        top_p = EXCLUDED.top_p,
        top_k = EXCLUDED.top_k,
        repeat_penalty = EXCLUDED.repeat_penalty,
        repeat_last_n = EXCLUDED.repeat_last_n,
        num_ctx = EXCLUDED.num_ctx,
        num_predict = EXCLUDED.num_predict,
        num_batch = EXCLUDED.num_batch,
        num_keep = EXCLUDED.num_keep,
        mirostat = EXCLUDED.mirostat,
        mirostat_eta = EXCLUDED.mirostat_eta,
        mirostat_tau = EXCLUDED.mirostat_tau,
        stop_sequences = EXCLUDED.stop_sequences,
        system_prompt = EXCLUDED.system_prompt,
        template = EXCLUDED.template,
        license_text = EXCLUDED.license_text,
        is_active = EXCLUDED.is_active,
        is_default = EXCLUDED.is_default,
        additional_config = EXCLUDED.additional_config,
        updated_at = NOW()
      RETURNING *
    `;

    const params = [
      config.name,
      config.displayName,
      config.description,
      config.baseModel || 'deepseek-r1:14b',
      config.temperature ?? 0.7,
      config.topP ?? 0.9,
      config.topK ?? 40,
      config.repeatPenalty ?? 1.1,
      config.repeatLastN ?? 64,
      config.numCtx ?? 16384,
      config.numPredict ?? -1,
      config.numBatch ?? 512,
      config.numKeep ?? 0,
      config.mirostat ?? 2,
      config.mirostatEta ?? 0.1,
      config.mirostatTau ?? 5.0,
      JSON.stringify(config.stopSequences || ['<|im_end|>', '</s>']),
      config.systemPrompt,
      config.template,
      config.licenseText,
      config.isActive ?? true,
      config.isDefault ?? false,
      config.createdBy,
      JSON.stringify(config.additionalConfig || {}),
    ];

    const result = await this.db.query(sql, params);
    this.clearCache();
    this.emit('modelConfigUpdated', result.rows[0]);
    return this.mapModelConfigRow(result.rows[0]);
  }

  /**
   * Delete model configuration
   */
  async deleteModelConfig(name: string): Promise<boolean> {
    const sql = `DELETE FROM ollama_model_configs WHERE name = $1 RETURNING id`;
    const result = await this.db.query(sql, [name]);
    this.clearCache();
    return result.rows.length > 0;
  }

  // ==========================================================================
  // RAG Configuration Methods
  // ==========================================================================

  /**
   * Get all RAG configurations
   */
  async getRagConfigs(activeOnly = true): Promise<OllamaRagConfig[]> {
    const cacheKey = `rag_configs_${activeOnly}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached as OllamaRagConfig[];

    const sql = `
      SELECT * FROM ollama_rag_configs
      ${activeOnly ? 'WHERE is_active = true' : ''}
      ORDER BY is_default DESC, name ASC
    `;

    const result = await this.db.query(sql);
    const configs = result.rows.map(this.mapRagConfigRow);
    this.setCache(cacheKey, configs);
    return configs;
  }

  /**
   * Get RAG configuration by name
   */
  async getRagConfig(name: string): Promise<OllamaRagConfig | null> {
    const sql = `SELECT * FROM ollama_rag_configs WHERE name = $1`;
    const result = await this.db.query(sql, [name]);
    if (result.rows.length === 0) return null;
    return this.mapRagConfigRow(result.rows[0]);
  }

  /**
   * Get default RAG configuration
   */
  async getDefaultRagConfig(): Promise<OllamaRagConfig | null> {
    const configs = await this.getRagConfigs(true);
    return configs.find(c => c.isDefault) || configs[0] || null;
  }

  /**
   * Create or update RAG configuration
   */
  async upsertRagConfig(config: Partial<OllamaRagConfig>): Promise<OllamaRagConfig> {
    const sql = `
      INSERT INTO ollama_rag_configs (
        name, display_name, description, model_config_id,
        embedding_model, embedding_dimension, embedding_provider,
        chunk_size, chunk_overlap, preserve_structure, extract_metadata,
        supported_formats, vector_table_name, top_k, min_score,
        hybrid_search_enabled, semantic_weight, keyword_weight,
        max_context_tokens, include_metadata_in_context, context_template,
        fallback_response, enable_fallback, is_active, is_default,
        created_by, additional_config
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27)
      ON CONFLICT (name) DO UPDATE SET
        display_name = EXCLUDED.display_name,
        description = EXCLUDED.description,
        model_config_id = EXCLUDED.model_config_id,
        embedding_model = EXCLUDED.embedding_model,
        embedding_dimension = EXCLUDED.embedding_dimension,
        chunk_size = EXCLUDED.chunk_size,
        chunk_overlap = EXCLUDED.chunk_overlap,
        top_k = EXCLUDED.top_k,
        min_score = EXCLUDED.min_score,
        hybrid_search_enabled = EXCLUDED.hybrid_search_enabled,
        semantic_weight = EXCLUDED.semantic_weight,
        keyword_weight = EXCLUDED.keyword_weight,
        is_active = EXCLUDED.is_active,
        is_default = EXCLUDED.is_default,
        additional_config = EXCLUDED.additional_config,
        updated_at = NOW()
      RETURNING *
    `;

    const params = [
      config.name,
      config.displayName,
      config.description,
      config.modelConfigId,
      config.embeddingModel || 'nomic-embed-text',
      config.embeddingDimension || 768,
      config.embeddingProvider || 'ollama',
      config.chunkSize || 1000,
      config.chunkOverlap || 200,
      config.preserveStructure ?? true,
      config.extractMetadata ?? true,
      JSON.stringify(config.supportedFormats || ['text', 'markdown', 'code', 'json', 'html']),
      config.vectorTableName || 'rag_documents',
      config.topK || 5,
      config.minScore || 0.6,
      config.hybridSearchEnabled ?? true,
      config.semanticWeight || 0.7,
      config.keywordWeight || 0.3,
      config.maxContextTokens || 4096,
      config.includeMetadataInContext ?? true,
      config.contextTemplate || '[CONTEXT]\n{context}\n[/CONTEXT]\n\n{question}',
      config.fallbackResponse || "I don't have enough information to answer that.",
      config.enableFallback ?? true,
      config.isActive ?? true,
      config.isDefault ?? false,
      config.createdBy,
      JSON.stringify(config.additionalConfig || {}),
    ];

    const result = await this.db.query(sql, params);
    this.clearCache();
    this.emit('ragConfigUpdated', result.rows[0]);
    return this.mapRagConfigRow(result.rows[0]);
  }

  // ==========================================================================
  // Embedding Configuration Methods
  // ==========================================================================

  /**
   * Get all embedding configurations
   */
  async getEmbeddingConfigs(activeOnly = true): Promise<OllamaEmbeddingConfig[]> {
    const sql = `
      SELECT * FROM ollama_embedding_configs
      ${activeOnly ? 'WHERE is_active = true' : ''}
      ORDER BY is_default DESC, name ASC
    `;
    const result = await this.db.query(sql);
    return result.rows.map(this.mapEmbeddingConfigRow);
  }

  /**
   * Get default embedding configuration
   */
  async getDefaultEmbeddingConfig(): Promise<OllamaEmbeddingConfig | null> {
    const configs = await this.getEmbeddingConfigs(true);
    return configs.find(c => c.isDefault) || configs[0] || null;
  }

  // ==========================================================================
  // Modelfile Generation
  // ==========================================================================

  /**
   * Generate Modelfile content from configuration
   */
  generateModelfile(config: OllamaModelConfig): string {
    const lines: string[] = [
      `# LightDom Custom Modelfile`,
      `# Generated from database configuration: ${config.name}`,
      `# Generated at: ${new Date().toISOString()}`,
      '',
      `FROM ${config.baseModel}`,
      '',
      '# Generation Parameters',
      `PARAMETER temperature ${config.temperature}`,
      `PARAMETER top_p ${config.topP}`,
      `PARAMETER top_k ${config.topK}`,
      `PARAMETER repeat_penalty ${config.repeatPenalty}`,
      `PARAMETER repeat_last_n ${config.repeatLastN}`,
      '',
      '# Context Parameters',
      `PARAMETER num_ctx ${config.numCtx}`,
      `PARAMETER num_predict ${config.numPredict}`,
      `PARAMETER num_batch ${config.numBatch}`,
      `PARAMETER num_keep ${config.numKeep}`,
      '',
      '# Mirostat Perplexity Control',
      `PARAMETER mirostat ${config.mirostat}`,
      `PARAMETER mirostat_eta ${config.mirostatEta}`,
      `PARAMETER mirostat_tau ${config.mirostatTau}`,
      '',
      '# Stop Sequences',
    ];

    for (const stop of config.stopSequences) {
      lines.push(`PARAMETER stop "${stop}"`);
    }

    if (config.systemPrompt) {
      lines.push('', '# System Prompt');
      lines.push(`SYSTEM """${config.systemPrompt}"""`);
    }

    if (config.template) {
      lines.push('', '# Template');
      lines.push(`TEMPLATE """${config.template}"""`);
    }

    if (config.licenseText) {
      lines.push('', '# License');
      lines.push(`LICENSE """${config.licenseText}"""`);
    }

    return lines.join('\n');
  }

  /**
   * Apply configuration to create Ollama model
   */
  async applyModelConfig(configName: string): Promise<{ success: boolean; message: string }> {
    const config = await this.getModelConfig(configName);
    if (!config) {
      return { success: false, message: `Configuration '${configName}' not found` };
    }

    const modelfile = this.generateModelfile(config);

    try {
      const response = await fetch(`${this.ollamaEndpoint}/api/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: config.name,
          modelfile: modelfile,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        return { success: false, message: `Ollama API error: ${error}` };
      }

      this.emit('modelCreated', { name: config.name, config });
      return { success: true, message: `Model '${config.name}' created successfully` };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, message: `Failed to create model: ${message}` };
    }
  }

  // ==========================================================================
  // Preset Methods
  // ==========================================================================

  /**
   * Get all presets
   */
  async getPresets(): Promise<OllamaModelPreset[]> {
    const sql = `
      SELECT * FROM ollama_model_presets
      WHERE is_active = true
      ORDER BY sort_order ASC, name ASC
    `;
    const result = await this.db.query(sql);
    return result.rows.map(this.mapPresetRow);
  }

  /**
   * Apply a preset
   */
  async applyPreset(presetName: string): Promise<{
    modelConfig: OllamaModelConfig | null;
    ragConfig: OllamaRagConfig | null;
    embeddingConfig: OllamaEmbeddingConfig | null;
  }> {
    const sql = `SELECT * FROM ollama_model_presets WHERE name = $1`;
    const result = await this.db.query(sql, [presetName]);

    if (result.rows.length === 0) {
      return { modelConfig: null, ragConfig: null, embeddingConfig: null };
    }

    const preset = this.mapPresetRow(result.rows[0]);
    const [modelConfig, ragConfig, embeddingConfig] = await Promise.all([
      preset.modelConfigId ? this.getModelConfigById(preset.modelConfigId) : null,
      preset.ragConfigId ? this.getRagConfigById(preset.ragConfigId) : null,
      preset.embeddingConfigId ? this.getEmbeddingConfigById(preset.embeddingConfigId) : null,
    ]);

    this.emit('presetApplied', { preset, modelConfig, ragConfig, embeddingConfig });
    return { modelConfig, ragConfig, embeddingConfig };
  }

  // ==========================================================================
  // Helper Methods
  // ==========================================================================

  private async getModelConfigById(id: number): Promise<OllamaModelConfig | null> {
    const sql = `SELECT * FROM ollama_model_configs WHERE id = $1`;
    const result = await this.db.query(sql, [id]);
    return result.rows.length > 0 ? this.mapModelConfigRow(result.rows[0]) : null;
  }

  private async getRagConfigById(id: number): Promise<OllamaRagConfig | null> {
    const sql = `SELECT * FROM ollama_rag_configs WHERE id = $1`;
    const result = await this.db.query(sql, [id]);
    return result.rows.length > 0 ? this.mapRagConfigRow(result.rows[0]) : null;
  }

  private async getEmbeddingConfigById(id: number): Promise<OllamaEmbeddingConfig | null> {
    const sql = `SELECT * FROM ollama_embedding_configs WHERE id = $1`;
    const result = await this.db.query(sql, [id]);
    return result.rows.length > 0 ? this.mapEmbeddingConfigRow(result.rows[0]) : null;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private mapModelConfigRow(row: any): OllamaModelConfig {
    return {
      id: row.id,
      name: row.name,
      displayName: row.display_name,
      description: row.description,
      baseModel: row.base_model,
      temperature: parseFloat(row.temperature),
      topP: parseFloat(row.top_p),
      topK: row.top_k,
      repeatPenalty: parseFloat(row.repeat_penalty),
      repeatLastN: row.repeat_last_n,
      numCtx: row.num_ctx,
      numPredict: row.num_predict,
      numBatch: row.num_batch,
      numKeep: row.num_keep,
      mirostat: row.mirostat,
      mirostatEta: parseFloat(row.mirostat_eta),
      mirostatTau: parseFloat(row.mirostat_tau),
      stopSequences: row.stop_sequences || [],
      systemPrompt: row.system_prompt,
      template: row.template,
      licenseText: row.license_text,
      isActive: row.is_active,
      isDefault: row.is_default,
      createdBy: row.created_by,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      additionalConfig: row.additional_config || {},
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private mapRagConfigRow(row: any): OllamaRagConfig {
    return {
      id: row.id,
      name: row.name,
      displayName: row.display_name,
      description: row.description,
      modelConfigId: row.model_config_id,
      embeddingModel: row.embedding_model,
      embeddingDimension: row.embedding_dimension,
      embeddingProvider: row.embedding_provider,
      chunkSize: row.chunk_size,
      chunkOverlap: row.chunk_overlap,
      preserveStructure: row.preserve_structure,
      extractMetadata: row.extract_metadata,
      supportedFormats: row.supported_formats || [],
      vectorTableName: row.vector_table_name,
      topK: row.top_k,
      minScore: parseFloat(row.min_score),
      hybridSearchEnabled: row.hybrid_search_enabled,
      semanticWeight: parseFloat(row.semantic_weight),
      keywordWeight: parseFloat(row.keyword_weight),
      maxContextTokens: row.max_context_tokens,
      includeMetadataInContext: row.include_metadata_in_context,
      contextTemplate: row.context_template,
      fallbackResponse: row.fallback_response,
      enableFallback: row.enable_fallback,
      isActive: row.is_active,
      isDefault: row.is_default,
      createdBy: row.created_by,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      additionalConfig: row.additional_config || {},
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private mapEmbeddingConfigRow(row: any): OllamaEmbeddingConfig {
    return {
      id: row.id,
      name: row.name,
      displayName: row.display_name,
      description: row.description,
      modelName: row.model_name,
      provider: row.provider,
      dimension: row.dimension,
      endpointUrl: row.endpoint_url,
      apiPath: row.api_path,
      batchSize: row.batch_size,
      maxRetries: row.max_retries,
      timeoutMs: row.timeout_ms,
      normalizeEmbeddings: row.normalize_embeddings,
      isActive: row.is_active,
      isDefault: row.is_default,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      additionalConfig: row.additional_config || {},
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private mapPresetRow(row: any): OllamaModelPreset {
    return {
      id: row.id,
      name: row.name,
      displayName: row.display_name,
      description: row.description,
      category: row.category,
      modelConfigId: row.model_config_id,
      ragConfigId: row.rag_config_id,
      embeddingConfigId: row.embedding_config_id,
      icon: row.icon,
      color: row.color,
      sortOrder: row.sort_order,
      isActive: row.is_active,
      isSystem: row.is_system,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private getFromCache(key: string): unknown | null {
    const cached = this.cache.get(key);
    if (cached && cached.expiry > Date.now()) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  private setCache(key: string, data: unknown): void {
    this.cache.set(key, {
      data,
      expiry: Date.now() + this.cacheTTL,
    });
  }

  private clearCache(): void {
    this.cache.clear();
  }
}

export default OllamaRagConfigService;
