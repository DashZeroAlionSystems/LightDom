#!/usr/bin/env node

/**
 * Data Mining Database Schema & Visualization App
 * Complete tables for major data mining operations with config controls
 */

import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Comprehensive Data Mining Database Schema
const DATA_MINING_SCHEMA = {
  // Core Mining Operations Tables
  mining_operations: `
    CREATE TABLE IF NOT EXISTS mining_operations (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      type TEXT CHECK(type IN ('scraping', 'analysis', 'processing', 'training', 'validation')),
      status TEXT CHECK(status IN ('pending', 'running', 'completed', 'failed', 'paused')) DEFAULT 'pending',
      priority INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      started_at DATETIME,
      completed_at DATETIME,
      duration_seconds INTEGER,
      error_message TEXT,
      metadata TEXT -- JSON metadata
    )
  `,

  // Scraping Configuration Tables
  scraping_configs: `
    CREATE TABLE IF NOT EXISTS scraping_configs (
      id TEXT PRIMARY KEY,
      operation_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      source_type TEXT CHECK(source_type IN ('website', 'api', 'database', 'file', 'feed')),
      base_url TEXT,
      allowed_domains TEXT, -- JSON array
      blocked_paths TEXT, -- JSON array
      selectors TEXT, -- JSON object of CSS selectors
      extractors TEXT, -- JSON array of extractor configs
      rate_limit INTEGER DEFAULT 1000, -- ms between requests
      max_concurrency INTEGER DEFAULT 5,
      timeout INTEGER DEFAULT 30000, -- ms
      max_depth INTEGER DEFAULT 3,
      follow_links BOOLEAN DEFAULT 1,
      respect_robots_txt BOOLEAN DEFAULT 1,
      user_agent TEXT DEFAULT 'DataMiningBot/1.0',
      headers TEXT, -- JSON object
      cookies TEXT, -- JSON array
      authentication TEXT, -- JSON auth config
      proxy_settings TEXT, -- JSON proxy config
      retry_policy TEXT, -- JSON retry config
      data_filters TEXT, -- JSON filtering rules
      output_format TEXT CHECK(output_format IN ('json', 'html', 'markdown', 'csv')) DEFAULT 'json',
      storage_location TEXT,
      compression_enabled BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (operation_id) REFERENCES mining_operations(id) ON DELETE CASCADE
    )
  `,

  scraping_schedules: `
    CREATE TABLE IF NOT EXISTS scraping_schedules (
      id TEXT PRIMARY KEY,
      config_id TEXT NOT NULL,
      name TEXT NOT NULL,
      schedule_type TEXT CHECK(schedule_type IN ('once', 'interval', 'cron')),
      interval_minutes INTEGER,
      cron_expression TEXT,
      start_date DATETIME,
      end_date DATETIME,
      timezone TEXT DEFAULT 'UTC',
      enabled BOOLEAN DEFAULT 1,
      last_run DATETIME,
      next_run DATETIME,
      max_runs INTEGER,
      run_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (config_id) REFERENCES scraping_configs(id) ON DELETE CASCADE
    )
  `,

  // Data Processing & Analysis Tables
  data_processing_configs: `
    CREATE TABLE IF NOT EXISTS data_processing_configs (
      id TEXT PRIMARY KEY,
      operation_id TEXT NOT NULL,
      name TEXT NOT NULL,
      input_source TEXT, -- table name or file path
      processing_type TEXT CHECK(processing_type IN ('cleaning', 'transformation', 'enrichment', 'aggregation', 'filtering')),
      config TEXT NOT NULL, -- JSON processing configuration
      dependencies TEXT, -- JSON array of dependent operations
      output_table TEXT,
      error_handling TEXT CHECK(error_handling IN ('skip', 'fail', 'retry', 'log')) DEFAULT 'log',
      performance_settings TEXT, -- JSON performance tuning
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (operation_id) REFERENCES mining_operations(id) ON DELETE CASCADE
    )
  `,

  data_quality_rules: `
    CREATE TABLE IF NOT EXISTS data_quality_rules (
      id TEXT PRIMARY KEY,
      operation_id TEXT NOT NULL,
      name TEXT NOT NULL,
      rule_type TEXT CHECK(rule_type IN ('completeness', 'accuracy', 'consistency', 'validity', 'uniqueness')),
      target_field TEXT,
      rule_condition TEXT NOT NULL, -- SQL condition or JSON logic
      severity TEXT CHECK(severity IN ('error', 'warning', 'info')) DEFAULT 'warning',
      enabled BOOLEAN DEFAULT 1,
      sample_size INTEGER DEFAULT 100,
      last_checked DATETIME,
      pass_count INTEGER DEFAULT 0,
      fail_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (operation_id) REFERENCES mining_operations(id) ON DELETE CASCADE
    )
  `,

  // Training Data Management
  training_datasets: `
    CREATE TABLE IF NOT EXISTS training_datasets (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      source_type TEXT CHECK(source_type IN ('scraped', 'synthetic', 'manual', 'imported')),
      data_format TEXT CHECK(data_format IN ('json', 'csv', 'parquet', 'database')),
      storage_path TEXT,
      schema_definition TEXT, -- JSON schema
      record_count INTEGER DEFAULT 0,
      file_size_bytes INTEGER DEFAULT 0,
      quality_score REAL CHECK(quality_score >= 0 AND quality_score <= 1),
      last_processed DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `,

  training_labels: `
    CREATE TABLE IF NOT EXISTS training_labels (
      id TEXT PRIMARY KEY,
      dataset_id TEXT NOT NULL,
      record_id TEXT NOT NULL,
      label_type TEXT NOT NULL,
      label_value TEXT NOT NULL,
      confidence REAL CHECK(confidence >= 0 AND confidence <= 1),
      labeled_by TEXT, -- user or system
      labeled_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (dataset_id) REFERENCES training_datasets(id) ON DELETE CASCADE,
      UNIQUE(dataset_id, record_id, label_type)
    )
  `,

  model_training_configs: `
    CREATE TABLE IF NOT EXISTS model_training_configs (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      model_type TEXT CHECK(model_type IN ('classification', 'regression', 'clustering', 'generation', 'embedding')),
      algorithm TEXT NOT NULL,
      hyperparameters TEXT NOT NULL, -- JSON hyperparameters
      training_data_id TEXT NOT NULL,
      validation_data_id TEXT,
      test_data_id TEXT,
      feature_columns TEXT, -- JSON array
      target_column TEXT,
      preprocessing_pipeline TEXT, -- JSON preprocessing steps
      evaluation_metrics TEXT, -- JSON metrics to track
      cross_validation_folds INTEGER DEFAULT 5,
      early_stopping_enabled BOOLEAN DEFAULT 1,
      max_training_time INTEGER, -- seconds
      gpu_enabled BOOLEAN DEFAULT 0,
      distributed_training BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (training_data_id) REFERENCES training_datasets(id),
      FOREIGN KEY (validation_data_id) REFERENCES training_datasets(id),
      FOREIGN KEY (test_data_id) REFERENCES training_datasets(id)
    )
  `,

  // Model Management & Deployment
  trained_models: `
    CREATE TABLE IF NOT EXISTS trained_models (
      id TEXT PRIMARY KEY,
      config_id TEXT NOT NULL,
      name TEXT NOT NULL,
      version TEXT NOT NULL,
      model_path TEXT NOT NULL,
      model_format TEXT CHECK(model_format IN ('pytorch', 'tensorflow', 'onnx', 'sklearn', 'custom')),
      input_schema TEXT NOT NULL, -- JSON input schema
      output_schema TEXT NOT NULL, -- JSON output schema
      performance_metrics TEXT, -- JSON performance results
      training_duration INTEGER, -- seconds
      model_size_bytes INTEGER,
      framework_version TEXT,
      python_version TEXT,
      hardware_used TEXT,
      status TEXT CHECK(status IN ('training', 'completed', 'failed', 'deployed', 'retired')) DEFAULT 'completed',
      deployed_at DATETIME,
      last_used DATETIME,
      usage_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (config_id) REFERENCES model_training_configs(id)
    )
  `,

  model_deployments: `
    CREATE TABLE IF NOT EXISTS model_deployments (
      id TEXT PRIMARY KEY,
      model_id TEXT NOT NULL,
      environment TEXT CHECK(environment IN ('development', 'staging', 'production')),
      endpoint_url TEXT,
      api_version TEXT DEFAULT 'v1',
      authentication_required BOOLEAN DEFAULT 1,
      rate_limit_per_minute INTEGER DEFAULT 60,
      timeout_seconds INTEGER DEFAULT 30,
      monitoring_enabled BOOLEAN DEFAULT 1,
      health_check_endpoint TEXT,
      deployed_by TEXT,
      deployed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_health_check DATETIME,
      health_status TEXT CHECK(health_status IN ('healthy', 'unhealthy', 'unknown')) DEFAULT 'unknown',
      FOREIGN KEY (model_id) REFERENCES trained_models(id) ON DELETE CASCADE
    )
  `,

  // Monitoring & Analytics
  operation_logs: `
    CREATE TABLE IF NOT EXISTS operation_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      operation_id TEXT NOT NULL,
      level TEXT CHECK(level IN ('debug', 'info', 'warning', 'error')) DEFAULT 'info',
      message TEXT NOT NULL,
      details TEXT, -- JSON additional details
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (operation_id) REFERENCES mining_operations(id) ON DELETE CASCADE
    )
  `,

  performance_metrics: `
    CREATE TABLE IF NOT EXISTS performance_metrics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      operation_id TEXT,
      metric_type TEXT NOT NULL,
      metric_name TEXT NOT NULL,
      metric_value REAL NOT NULL,
      unit TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (operation_id) REFERENCES mining_operations(id) ON DELETE CASCADE
    )
  `,

  // Settings & Configuration Management
  system_settings: `
    CREATE TABLE IF NOT EXISTS system_settings (
      id TEXT PRIMARY KEY,
      category TEXT NOT NULL,
      setting_key TEXT NOT NULL,
      setting_value TEXT NOT NULL,
      setting_type TEXT CHECK(setting_type IN ('string', 'number', 'boolean', 'json', 'array')) DEFAULT 'string',
      description TEXT,
      validation_rules TEXT, -- JSON validation
      is_system_setting BOOLEAN DEFAULT 0,
      modified_by TEXT,
      modified_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(category, setting_key)
    )
  `,

  user_preferences: `
    CREATE TABLE IF NOT EXISTS user_preferences (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT,
      preference_category TEXT NOT NULL,
      preference_key TEXT NOT NULL,
      preference_value TEXT NOT NULL,
      preference_type TEXT CHECK(preference_type IN ('string', 'number', 'boolean', 'json')) DEFAULT 'string',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, preference_category, preference_key)
    )
  `,

  // Indexes for performance
  indexes: [
    // Mining operations
    'CREATE INDEX IF NOT EXISTS idx_mining_operations_status ON mining_operations(status)',
    'CREATE INDEX IF NOT EXISTS idx_mining_operations_type ON mining_operations(type)',
    'CREATE INDEX IF NOT EXISTS idx_mining_operations_created ON mining_operations(created_at)',

    // Scraping configs
    'CREATE INDEX IF NOT EXISTS idx_scraping_configs_operation ON scraping_configs(operation_id)',
    'CREATE INDEX IF NOT EXISTS idx_scraping_configs_source_type ON scraping_configs(source_type)',

    // Training data
    'CREATE INDEX IF NOT EXISTS idx_training_datasets_source_type ON training_datasets(source_type)',
    'CREATE INDEX IF NOT EXISTS idx_training_labels_dataset ON training_labels(dataset_id)',
    'CREATE INDEX IF NOT EXISTS idx_training_labels_type ON training_labels(label_type)',

    // Models
    'CREATE INDEX IF NOT EXISTS idx_trained_models_config ON trained_models(config_id)',
    'CREATE INDEX IF NOT EXISTS idx_trained_models_status ON trained_models(status)',
    'CREATE INDEX IF NOT EXISTS idx_model_deployments_environment ON model_deployments(environment)',
    'CREATE INDEX IF NOT EXISTS idx_model_deployments_status ON model_deployments(health_status)',

    // Logs and metrics
    'CREATE INDEX IF NOT EXISTS idx_operation_logs_operation ON operation_logs(operation_id)',
    'CREATE INDEX IF NOT EXISTS idx_operation_logs_level ON operation_logs(level)',
    'CREATE INDEX IF NOT EXISTS idx_operation_logs_timestamp ON operation_logs(timestamp)',
    'CREATE INDEX IF NOT EXISTS idx_performance_metrics_operation ON performance_metrics(operation_id)',
    'CREATE INDEX IF NOT EXISTS idx_performance_metrics_type ON performance_metrics(metric_type)',

    // Settings
    'CREATE INDEX IF NOT EXISTS idx_system_settings_category ON system_settings(category)',
    'CREATE INDEX IF NOT EXISTS idx_user_preferences_user ON user_preferences(user_id)',
    'CREATE INDEX IF NOT EXISTS idx_user_preferences_category ON user_preferences(preference_category)'
  ]
};

// Data Mining Database Manager
class DataMiningDatabase {
  constructor(dbPath = './data-mining.db') {
    this.dbPath = path.resolve(dbPath);
    this.db = null;
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;

    try {
      // Create database directory if it doesn't exist
      const dbDir = path.dirname(this.dbPath);
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }

      this.db = new Database(this.dbPath);

      // Enable foreign keys and other pragmas
      this.db.pragma('foreign_keys = ON');
      this.db.pragma('journal_mode = WAL');
      this.db.pragma('synchronous = NORMAL');
      this.db.pragma('cache_size = 1000000'); // 1GB cache
      this.db.pragma('temp_store = MEMORY');

      // Create all tables
      console.log('🏗️  Creating comprehensive data mining database schema...');

      // Core tables
      Object.entries(DATA_MINING_SCHEMA).forEach(([tableName, sql]) => {
        if (tableName !== 'indexes') {
          this.db.exec(sql);
        }
      });

      // Create indexes
      for (const indexSQL of DATA_MINING_SCHEMA.indexes) {
        this.db.exec(indexSQL);
      }

      // Prepare statements
      this.prepareStatements();

      // Initialize default settings
      this.initializeDefaultSettings();

      this.initialized = true;
      console.log(`✅ Data mining database initialized at ${this.dbPath}`);

    } catch (error) {
      console.error('❌ Database initialization failed:', error);
      throw error;
    }
  }

  prepareStatements() {
    this.stmts = {
      // Mining operations
      insertMiningOperation: this.db.prepare(`
        INSERT OR REPLACE INTO mining_operations
        (id, name, description, type, status, priority, metadata)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `),

      updateOperationStatus: this.db.prepare(`
        UPDATE mining_operations
        SET status = ?, started_at = ?, completed_at = ?, duration_seconds = ?, error_message = ?
        WHERE id = ?
      `),

      // Scraping configs
      insertScrapingConfig: this.db.prepare(`
        INSERT OR REPLACE INTO scraping_configs
        (id, operation_id, name, description, source_type, base_url, allowed_domains, blocked_paths,
         selectors, extractors, rate_limit, max_concurrency, timeout, max_depth, follow_links,
         respect_robots_txt, user_agent, headers, cookies, authentication, proxy_settings,
         retry_policy, data_filters, output_format, storage_location, compression_enabled)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `),

      // Training datasets
      insertTrainingDataset: this.db.prepare(`
        INSERT OR REPLACE INTO training_datasets
        (id, name, description, source_type, data_format, storage_path, schema_definition,
         record_count, file_size_bytes, quality_score)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `),

      // Model training
      insertModelTrainingConfig: this.db.prepare(`
        INSERT OR REPLACE INTO model_training_configs
        (id, name, description, model_type, algorithm, hyperparameters, training_data_id,
         validation_data_id, test_data_id, feature_columns, target_column, preprocessing_pipeline,
         evaluation_metrics, cross_validation_folds, early_stopping_enabled, max_training_time,
         gpu_enabled, distributed_training)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `),

      // Trained models
      insertTrainedModel: this.db.prepare(`
        INSERT OR REPLACE INTO trained_models
        (id, config_id, name, version, model_path, model_format, input_schema, output_schema,
         performance_metrics, training_duration, model_size_bytes, framework_version,
         python_version, hardware_used, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `),

      // System settings
      insertSystemSetting: this.db.prepare(`
        INSERT OR REPLACE INTO system_settings
        (id, category, setting_key, setting_value, setting_type, description, validation_rules, is_system_setting)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `),

      // Operation logs
      insertOperationLog: this.db.prepare(`
        INSERT INTO operation_logs (operation_id, level, message, details)
        VALUES (?, ?, ?, ?)
      `),

      // Performance metrics
      insertPerformanceMetric: this.db.prepare(`
        INSERT INTO performance_metrics (operation_id, metric_type, metric_name, metric_value, unit)
        VALUES (?, ?, ?, ?, ?)
      `)
    };
  }

  initializeDefaultSettings() {
    const defaultSettings = [
      // Scraping defaults
      {
        id: 'scraping-default-rate-limit',
        category: 'scraping',
        setting_key: 'default_rate_limit',
        setting_value: '1000',
        setting_type: 'number',
        description: 'Default rate limit between requests (ms)',
        is_system_setting: true
      },
      {
        id: 'scraping-default-timeout',
        category: 'scraping',
        setting_key: 'default_timeout',
        setting_value: '30000',
        setting_type: 'number',
        description: 'Default request timeout (ms)',
        is_system_setting: true
      },
      {
        id: 'scraping-default-max-depth',
        category: 'scraping',
        setting_key: 'default_max_depth',
        setting_value: '3',
        setting_type: 'number',
        description: 'Default maximum crawl depth',
        is_system_setting: true
      },
      {
        id: 'scraping-respect-robots',
        category: 'scraping',
        setting_key: 'respect_robots_txt',
        setting_value: 'true',
        setting_type: 'boolean',
        description: 'Respect robots.txt by default',
        is_system_setting: true
      },

      // Training defaults
      {
        id: 'training-default-model-type',
        category: 'training',
        setting_key: 'default_model_type',
        setting_value: 'classification',
        setting_type: 'string',
        description: 'Default model type for training',
        is_system_setting: true
      },
      {
        id: 'training-cross-validation-folds',
        category: 'training',
        setting_key: 'default_cv_folds',
        setting_value: '5',
        setting_type: 'number',
        description: 'Default cross-validation folds',
        is_system_setting: true
      },

      // System defaults
      {
        id: 'system-max-concurrent-operations',
        category: 'system',
        setting_key: 'max_concurrent_operations',
        setting_value: '3',
        setting_type: 'number',
        description: 'Maximum concurrent mining operations',
        is_system_setting: true
      },
      {
        id: 'system-default-storage-path',
        category: 'system',
        setting_key: 'default_storage_path',
        setting_value: './mining-data',
        setting_type: 'string',
        description: 'Default storage path for mined data',
        is_system_setting: true
      }
    ];

    for (const setting of defaultSettings) {
      this.stmts.insertSystemSetting.run(
        setting.id,
        setting.category,
        setting.setting_key,
        setting.setting_value,
        setting.setting_type,
        setting.description,
        null,
        setting.is_system_setting ? 1 : 0
      );
    }

    console.log('✅ Default system settings initialized');
  }

  // Operation Management
  createMiningOperation(operation) {
    const operationId = operation.id || `op-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    this.stmts.insertMiningOperation.run(
      operationId,
      operation.name,
      operation.description,
      operation.type,
      operation.status || 'pending',
      operation.priority || 1,
      JSON.stringify(operation.metadata || {})
    );

    return operationId;
  }

  updateOperationStatus(operationId, status, errorMessage = null) {
    const updates = {
      started_at: status === 'running' ? new Date().toISOString() : undefined,
      completed_at: ['completed', 'failed'].includes(status) ? new Date().toISOString() : undefined
    };

    this.stmts.updateOperationStatus.run(
      status,
      updates.started_at,
      updates.completed_at,
      null, // duration will be calculated later
      errorMessage,
      operationId
    );
  }

  // Scraping Configuration
  createScrapingConfig(config) {
    const configId = config.id || `config-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    this.stmts.insertScrapingConfig.run(
      configId,
      config.operationId,
      config.name,
      config.description,
      config.sourceType,
      config.baseUrl,
      JSON.stringify(config.allowedDomains || []),
      JSON.stringify(config.blockedPaths || []),
      JSON.stringify(config.selectors || {}),
      JSON.stringify(config.extractors || []),
      config.rateLimit || 1000,
      config.maxConcurrency || 5,
      config.timeout || 30000,
      config.maxDepth || 3,
      config.followLinks ? 1 : 0,
      config.respectRobotsTxt ? 1 : 0,
      config.userAgent || 'DataMiningBot/1.0',
      JSON.stringify(config.headers || {}),
      JSON.stringify(config.cookies || []),
      JSON.stringify(config.authentication || {}),
      JSON.stringify(config.proxySettings || {}),
      JSON.stringify(config.retryPolicy || {}),
      JSON.stringify(config.dataFilters || {}),
      config.outputFormat || 'json',
      config.storageLocation,
      config.compressionEnabled ? 1 : 0
    );

    return configId;
  }

  // Training Data Management
  createTrainingDataset(dataset) {
    const datasetId = dataset.id || `dataset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    this.stmts.insertTrainingDataset.run(
      datasetId,
      dataset.name,
      dataset.description,
      dataset.sourceType,
      dataset.dataFormat,
      dataset.storagePath,
      JSON.stringify(dataset.schemaDefinition || {}),
      dataset.recordCount || 0,
      dataset.fileSizeBytes || 0,
      dataset.qualityScore || 0.8
    );

    return datasetId;
  }

  // Model Training
  createModelTrainingConfig(config) {
    const configId = config.id || `model-config-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    this.stmts.insertModelTrainingConfig.run(
      configId,
      config.name,
      config.description,
      config.modelType,
      config.algorithm,
      JSON.stringify(config.hyperparameters),
      config.trainingDataId,
      config.validationDataId,
      config.testDataId,
      JSON.stringify(config.featureColumns || []),
      config.targetColumn,
      JSON.stringify(config.preprocessingPipeline || []),
      JSON.stringify(config.evaluationMetrics || []),
      config.crossValidationFolds || 5,
      config.earlyStoppingEnabled ? 1 : 0,
      config.maxTrainingTime,
      config.gpuEnabled ? 1 : 0,
      config.distributedTraining ? 1 : 0
    );

    return configId;
  }

  // Logging and Monitoring
  logOperation(operationId, level, message, details = {}) {
    this.stmts.insertOperationLog.run(
      operationId,
      level,
      message,
      JSON.stringify(details)
    );
  }

  recordPerformanceMetric(operationId, metricType, metricName, value, unit = null) {
    this.stmts.insertPerformanceMetric.run(
      operationId,
      metricType,
      metricName,
      value,
      unit
    );
  }

  // Query Methods
  getMiningOperations(filters = {}) {
    let query = 'SELECT * FROM mining_operations WHERE 1=1';
    const params = [];

    if (filters.type) {
      query += ' AND type = ?';
      params.push(filters.type);
    }

    if (filters.status) {
      query += ' AND status = ?';
      params.push(filters.status);
    }

    if (filters.limit) {
      query += ' LIMIT ?';
      params.push(filters.limit);
    }

    query += ' ORDER BY created_at DESC';

    const stmt = this.db.prepare(query);
    const results = stmt.all(...params);

    return results.map(row => ({
      ...row,
      metadata: JSON.parse(row.metadata || '{}')
    }));
  }

  getScrapingConfigs(operationId) {
    const stmt = this.db.prepare('SELECT * FROM scraping_configs WHERE operation_id = ?');
    const results = stmt.all(operationId);

    return results.map(row => ({
      ...row,
      allowedDomains: JSON.parse(row.allowed_domains || '[]'),
      blockedPaths: JSON.parse(row.blocked_paths || '[]'),
      selectors: JSON.parse(row.selectors || '{}'),
      extractors: JSON.parse(row.extractors || '[]'),
      headers: JSON.parse(row.headers || '{}'),
      cookies: JSON.parse(row.cookies || '[]'),
      authentication: JSON.parse(row.authentication || '{}'),
      proxySettings: JSON.parse(row.proxy_settings || '{}'),
      retryPolicy: JSON.parse(row.retry_policy || '{}'),
      dataFilters: JSON.parse(row.data_filters || '{}')
    }));
  }

  getTrainingDatasets() {
    const stmt = this.db.prepare('SELECT * FROM training_datasets ORDER BY created_at DESC');
    const results = stmt.all();

    return results.map(row => ({
      ...row,
      schemaDefinition: JSON.parse(row.schema_definition || '{}')
    }));
  }

  getSystemSettings(category = null) {
    let query = 'SELECT * FROM system_settings';
    const params = [];

    if (category) {
      query += ' WHERE category = ?';
      params.push(category);
    }

    query += ' ORDER BY category, setting_key';

    const stmt = this.db.prepare(query);
    const results = stmt.all(...params);

    return results.reduce((acc, row) => {
      if (!acc[row.category]) acc[row.category] = {};
      acc[row.category][row.setting_key] = {
        value: this.parseSettingValue(row.setting_value, row.setting_type),
        type: row.setting_type,
        description: row.description
      };
      return acc;
    }, {});
  }

  parseSettingValue(value, type) {
    switch (type) {
      case 'number': return parseFloat(value);
      case 'boolean': return value === 'true' || value === '1';
      case 'json': return JSON.parse(value);
      case 'array': return JSON.parse(value);
      default: return value;
    }
  }

  // Analytics and Statistics
  getOperationStats(operationId) {
    const logsStmt = this.db.prepare(`
      SELECT level, COUNT(*) as count
      FROM operation_logs
      WHERE operation_id = ?
      GROUP BY level
    `);

    const metricsStmt = this.db.prepare(`
      SELECT metric_type, metric_name, AVG(metric_value) as avg_value, MAX(metric_value) as max_value
      FROM performance_metrics
      WHERE operation_id = ?
      GROUP BY metric_type, metric_name
    `);

    return {
      logs: logsStmt.all(operationId),
      metrics: metricsStmt.all(operationId)
    };
  }

  getSystemStats() {
    const stats = {
      operations: {
        total: this.db.prepare('SELECT COUNT(*) as count FROM mining_operations').get().count,
        byStatus: this.db.prepare(`
          SELECT status, COUNT(*) as count
          FROM mining_operations
          GROUP BY status
        `).all(),
        byType: this.db.prepare(`
          SELECT type, COUNT(*) as count
          FROM mining_operations
          GROUP BY type
        `).all()
      },
      datasets: {
        total: this.db.prepare('SELECT COUNT(*) as count FROM training_datasets').get().count,
        bySourceType: this.db.prepare(`
          SELECT source_type, COUNT(*) as count
          FROM training_datasets
          GROUP BY source_type
        `).all(),
        totalRecords: this.db.prepare('SELECT SUM(record_count) as total FROM training_datasets').get().total || 0
      },
      models: {
        total: this.db.prepare('SELECT COUNT(*) as count FROM trained_models').get().count,
        byStatus: this.db.prepare(`
          SELECT status, COUNT(*) as count
          FROM trained_models
          GROUP BY status
        `).all()
      }
    };

    return stats;
  }

  // Export functionality
  exportToJSON(outputPath) {
    const data = {
      operations: this.getMiningOperations(),
      scrapingConfigs: this.db.prepare('SELECT * FROM scraping_configs').all(),
      trainingDatasets: this.getTrainingDatasets(),
      modelConfigs: this.db.prepare('SELECT * FROM model_training_configs').all(),
      trainedModels: this.db.prepare('SELECT * FROM trained_models').all(),
      systemSettings: this.getSystemSettings(),
      statistics: this.getSystemStats(),
      exportTimestamp: new Date().toISOString()
    };

    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
    console.log(`✅ Database exported to ${outputPath}`);
    return outputPath;
  }

  // Cleanup
  close() {
    if (this.db) {
      this.db.close();
      this.db = null;
      this.initialized = false;
      console.log('🔒 Data mining database connection closed');
    }
  }

  // Maintenance
  vacuum() {
    if (this.db) {
      console.log('🧹 Running database vacuum...');
      this.db.exec('VACUUM');
      console.log('✅ Database vacuum completed');
    }
  }

  optimize() {
    if (this.db) {
      console.log('⚡ Running database optimization...');
      this.db.exec('ANALYZE');
      console.log('✅ Database optimization completed');
    }
  }
}

// Independent React Visualization App
function createVisualizationAppHTML() {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Data Mining Operations Dashboard</title>
    <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <script src="https://unpkg.com/socket.io-client@4.7.2/dist/socket.io.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/chartjs-adapter-date-fns@3.0.0"></script>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f8fafc;
            color: #1a202c;
            line-height: 1.6;
        }

        .app-container {
            min-height: 100vh;
        }

        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 2rem 0;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .header-content {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 2rem;
        }

        .header h1 {
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
        }

        .header p {
            font-size: 1.2rem;
            opacity: 0.9;
        }

        .nav-tabs {
            background: white;
            border-bottom: 1px solid #e2e8f0;
            padding: 0 2rem;
        }

        .nav-tabs .tabs {
            max-width: 1200px;
            margin: 0 auto;
            display: flex;
            gap: 0;
        }

        .nav-tabs .tab {
            padding: 1rem 1.5rem;
            border-bottom: 3px solid transparent;
            cursor: pointer;
            font-weight: 500;
            color: #4a5568;
            transition: all 0.2s;
        }

        .nav-tabs .tab.active {
            border-bottom-color: #667eea;
            color: #667eea;
            background: rgba(102, 126, 234, 0.05);
        }

        .nav-tabs .tab:hover {
            background: #f7fafc;
        }

        .main-content {
            max-width: 1200px;
            margin: 0 auto;
            padding: 2rem;
        }

        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1.5rem;
            margin-bottom: 2rem;
        }

        .stat-card {
            background: white;
            padding: 1.5rem;
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            border: 1px solid #e2e8f0;
        }

        .stat-card .stat-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 1rem;
        }

        .stat-card .stat-title {
            font-size: 0.875rem;
            font-weight: 600;
            color: #718096;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }

        .stat-card .stat-icon {
            width: 2rem;
            height: 2rem;
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
        }

        .stat-card .stat-value {
            font-size: 2rem;
            font-weight: 700;
            color: #1a202c;
            margin-bottom: 0.5rem;
        }

        .stat-card .stat-change {
            font-size: 0.875rem;
            font-weight: 500;
        }

        .stat-card .stat-change.positive {
            color: #48bb78;
        }

        .stat-card .stat-change.negative {
            color: #f56565;
        }

        .operations-table {
            background: white;
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            overflow: hidden;
            margin-bottom: 2rem;
        }

        .operations-table table {
            width: 100%;
            border-collapse: collapse;
        }

        .operations-table th,
        .operations-table td {
            padding: 1rem;
            text-align: left;
            border-bottom: 1px solid #e2e8f0;
        }

        .operations-table th {
            background: #f8fafc;
            font-weight: 600;
            color: #4a5568;
            font-size: 0.875rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }

        .operations-table .status-badge {
            padding: 0.25rem 0.75rem;
            border-radius: 9999px;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
        }

        .status-pending { background: #fef5e7; color: #f59e0b; }
        .status-running { background: #dbeafe; color: #3b82f6; }
        .status-completed { background: #d1fae5; color: #10b981; }
        .status-failed { background: #fee2e2; color: #ef4444; }

        .config-panel {
            background: white;
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            padding: 1.5rem;
            margin-bottom: 2rem;
        }

        .config-panel h3 {
            margin-bottom: 1rem;
            color: #1a202c;
            font-size: 1.25rem;
            font-weight: 600;
        }

        .config-form {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 1rem;
        }

        .config-field {
            display: flex;
            flex-direction: column;
        }

        .config-field label {
            font-size: 0.875rem;
            font-weight: 500;
            color: #4a5568;
            margin-bottom: 0.5rem;
        }

        .config-field input,
        .config-field select,
        .config-field textarea {
            padding: 0.5rem;
            border: 1px solid #d1d5db;
            border-radius: 4px;
            font-size: 0.875rem;
        }

        .config-field textarea {
            resize: vertical;
            min-height: 80px;
        }

        .btn {
            padding: 0.5rem 1rem;
            border: none;
            border-radius: 4px;
            font-size: 0.875rem;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
        }

        .btn-primary {
            background: #667eea;
            color: white;
        }

        .btn-primary:hover {
            background: #5a67d8;
        }

        .btn-secondary {
            background: #e2e8f0;
            color: #4a5568;
        }

        .btn-secondary:hover {
            background: #cbd5e0;
        }

        .chart-container {
            background: white;
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            padding: 1.5rem;
            margin-bottom: 2rem;
        }

        .chart-container h3 {
            margin-bottom: 1rem;
            color: #1a202c;
            font-size: 1.25rem;
            font-weight: 600;
        }

        .chart-placeholder {
            height: 300px;
            background: #f7fafc;
            border: 2px dashed #cbd5e0;
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #a0aec0;
            font-size: 1.125rem;
        }

        .loading-spinner {
            display: inline-block;
            width: 20px;
            height: 20px;
            border: 3px solid #f3f3f3;
            border-top: 3px solid #667eea;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        .hidden {
            display: none;
        }

        @media (max-width: 768px) {
            .header-content,
            .main-content {
                padding: 0 1rem;
            }

            .nav-tabs .tabs {
                flex-wrap: wrap;
            }

            .stats-grid {
                grid-template-columns: 1fr;
            }

            .config-form {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div id="data-mining-app"></div>

    <script type="text/babel">
        const { useState, useEffect } = React;

        function DataMiningDashboard() {
            const [activeTab, setActiveTab] = useState('overview');
            const [operations, setOperations] = useState([]);
            const [stats, setStats] = useState({});
            const [configs, setConfigs] = useState([]);
            const [datasets, setDatasets] = useState([]);
            const [isLoading, setIsLoading] = useState(true);
            const [newConfig, setNewConfig] = useState({
                name: '',
                description: '',
                sourceType: 'website',
                baseUrl: '',
                rateLimit: 1000,
                maxDepth: 3
            });

            const tabs = [
                { id: 'overview', name: 'Overview', icon: '📊' },
                { id: 'operations', name: 'Operations', icon: '⚙️' },
                { id: 'scraping', name: 'Scraping Config', icon: '🕷️' },
                { id: 'training', name: 'Training Data', icon: '🎓' },
                { id: 'models', name: 'Models', icon: '🤖' },
                { id: 'analytics', name: 'Analytics', icon: '📈' }
            ];

            useEffect(() => {
                loadDashboardData();
            }, []);

            const loadDashboardData = async () => {
                try {
                    // In a real implementation, these would be API calls
                    // For now, we'll simulate the data structure
                    const mockStats = {
                        operations: {
                            total: 15,
                            byStatus: [
                                { status: 'completed', count: 12 },
                                { status: 'running', count: 2 },
                                { status: 'pending', count: 1 }
                            ],
                            byType: [
                                { type: 'scraping', count: 8 },
                                { type: 'training', count: 4 },
                                { type: 'analysis', count: 3 }
                            ]
                        },
                        datasets: {
                            total: 5,
                            bySourceType: [
                                { source_type: 'scraped', count: 3 },
                                { source_type: 'synthetic', count: 2 }
                            ],
                            totalRecords: 50000
                        },
                        models: {
                            total: 3,
                            byStatus: [
                                { status: 'deployed', count: 2 },
                                { status: 'training', count: 1 }
                            ]
                        }
                    };

                    const mockOperations = [
                        {
                            id: 'op-001',
                            name: 'SEO Data Mining',
                            type: 'scraping',
                            status: 'completed',
                            created_at: '2025-01-15T10:00:00Z',
                            duration_seconds: 3600
                        },
                        {
                            id: 'op-002',
                            name: 'Component Analysis',
                            type: 'analysis',
                            status: 'running',
                            created_at: '2025-01-15T11:00:00Z'
                        },
                        {
                            id: 'op-003',
                            name: 'Model Training',
                            type: 'training',
                            status: 'pending',
                            created_at: '2025-01-15T12:00:00Z'
                        }
                    ];

                    const mockConfigs = [
                        {
                            id: 'config-001',
                            name: 'Material Design Scraper',
                            source_type: 'website',
                            base_url: 'https://material.io',
                            rate_limit: 1000,
                            max_depth: 3,
                            status: 'active'
                        },
                        {
                            id: 'config-002',
                            name: 'Ant Design Scraper',
                            source_type: 'website',
                            base_url: 'https://ant.design',
                            rate_limit: 1500,
                            max_depth: 4,
                            status: 'active'
                        }
                    ];

                    const mockDatasets = [
                        {
                            id: 'dataset-001',
                            name: 'Material Design Components',
                            source_type: 'scraped',
                            record_count: 15000,
                            quality_score: 0.92
                        },
                        {
                            id: 'dataset-002',
                            name: 'Ant Design Components',
                            source_type: 'scraped',
                            record_count: 12000,
                            quality_score: 0.89
                        },
                        {
                            id: 'dataset-003',
                            name: 'Synthetic Training Data',
                            source_type: 'synthetic',
                            record_count: 25000,
                            quality_score: 0.95
                        }
                    ];

                    setStats(mockStats);
                    setOperations(mockOperations);
                    setConfigs(mockConfigs);
                    setDatasets(mockDatasets);
                } catch (error) {
                    console.error('Failed to load dashboard data:', error);
                } finally {
                    setIsLoading(false);
                }
            };

            const handleCreateConfig = () => {
                const config = {
                    ...newConfig,
                    id: \`config-\${Date.now()}\`,
                    status: 'active'
                };
                setConfigs(prev => [...prev, config]);
                setNewConfig({
                    name: '',
                    description: '',
                    sourceType: 'website',
                    baseUrl: '',
                    rateLimit: 1000,
                    maxDepth: 3
                });
                console.log('Created new scraping config:', config);
            };

            const getStatusColor = (status) => {
                const colors = {
                    pending: 'status-pending',
                    running: 'status-running',
                    completed: 'status-completed',
                    failed: 'status-failed'
                };
                return colors[status] || 'status-pending';
            };

            const formatDuration = (seconds) => {
                if (!seconds) return 'N/A';
                const hours = Math.floor(seconds / 3600);
                const minutes = Math.floor((seconds % 3600) / 60);
                const secs = seconds % 60;
                return \`\${hours}h \${minutes}m \${secs}s\`;
            };

            if (isLoading) {
                return (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                        <div>
                            <div className="loading-spinner" style={{ margin: '0 auto 1rem' }}></div>
                            <p>Loading Data Mining Dashboard...</p>
                        </div>
                    </div>
                );
            }

            return (
                <div className="app-container">
                    <header className="header">
                        <div className="header-content">
                            <h1>Data Mining Operations Dashboard</h1>
                            <p>Comprehensive data mining, scraping configuration, and analytics platform</p>
                        </div>
                    </header>

                    <nav className="nav-tabs">
                        <div className="tabs">
                            {tabs.map(tab => (
                                <div
                                    key={tab.id}
                                    className={\`tab \${activeTab === tab.id ? 'active' : ''}\`}
                                    onClick={() => setActiveTab(tab.id)}
                                >
                                    <span style={{ marginRight: '0.5rem' }}>{tab.icon}</span>
                                    {tab.name}
                                </div>
                            ))}
                        </div>
                    </nav>

                    <main className="main-content">
                        {activeTab === 'overview' && (
                            <div>
                                <div className="stats-grid">
                                    <div className="stat-card">
                                        <div className="stat-header">
                                            <div className="stat-title">Total Operations</div>
                                            <div className="stat-icon" style={{ background: '#667eea' }}>⚙️</div>
                                        </div>
                                        <div className="stat-value">{stats.operations?.total || 0}</div>
                                        <div className="stat-change positive">+12% from last month</div>
                                    </div>

                                    <div className="stat-card">
                                        <div className="stat-header">
                                            <div className="stat-title">Active Operations</div>
                                            <div className="stat-icon" style={{ background: '#48bb78' }}>▶️</div>
                                        </div>
                                        <div className="stat-value">
                                            {stats.operations?.byStatus?.find(s => s.status === 'running')?.count || 0}
                                        </div>
                                        <div className="stat-change">Currently running</div>
                                    </div>

                                    <div className="stat-card">
                                        <div className="stat-header">
                                            <div className="stat-title">Training Datasets</div>
                                            <div className="stat-icon" style={{ background: '#f59e0b' }}>📚</div>
                                        </div>
                                        <div className="stat-value">{stats.datasets?.total || 0}</div>
                                        <div className="stat-change">{stats.datasets?.totalRecords?.toLocaleString() || 0} records</div>
                                    </div>

                                    <div className="stat-card">
                                        <div className="stat-header">
                                            <div className="stat-title">Trained Models</div>
                                            <div className="stat-icon" style={{ background: '#ef4444' }}>🤖</div>
                                        </div>
                                        <div className="stat-value">{stats.models?.total || 0}</div>
                                        <div className="stat-change">
                                            {stats.models?.byStatus?.find(s => s.status === 'deployed')?.count || 0} deployed
                                        </div>
                                    </div>
                                </div>

                                <div className="chart-container">
                                    <h3>Operations Overview</h3>
                                    <div className="chart-placeholder">
                                        📊 Charts and analytics will be displayed here
                                        <br />
                                        <small>Integration with Chart.js for real-time visualizations</small>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'operations' && (
                            <div>
                                <div className="operations-table">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Operation</th>
                                                <th>Type</th>
                                                <th>Status</th>
                                                <th>Created</th>
                                                <th>Duration</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {operations.map(op => (
                                                <tr key={op.id}>
                                                    <td>
                                                        <div>
                                                            <div style={{ fontWeight: '600' }}>{op.name}</div>
                                                            <div style={{ fontSize: '0.75rem', color: '#718096' }}>{op.id}</div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <span style={{
                                                            padding: '0.25rem 0.5rem',
                                                            background: '#e2e8f0',
                                                            borderRadius: '4px',
                                                            fontSize: '0.75rem',
                                                            textTransform: 'capitalize'
                                                        }}>
                                                            {op.type}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span className={\`status-badge \${getStatusColor(op.status)}\`}>
                                                            {op.status}
                                                        </span>
                                                    </td>
                                                    <td>{new Date(op.created_at).toLocaleDateString()}</td>
                                                    <td>{formatDuration(op.duration_seconds)}</td>
                                                    <td>
                                                        <button className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}>
                                                            View Details
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {activeTab === 'scraping' && (
                            <div>
                                <div className="config-panel">
                                    <h3>Create New Scraping Configuration</h3>
                                    <div className="config-form">
                                        <div className="config-field">
                                            <label>Name</label>
                                            <input
                                                type="text"
                                                value={newConfig.name}
                                                onChange={(e) => setNewConfig(prev => ({ ...prev, name: e.target.value }))}
                                                placeholder="Configuration name"
                                            />
                                        </div>
                                        <div className="config-field">
                                            <label>Source Type</label>
                                            <select
                                                value={newConfig.sourceType}
                                                onChange={(e) => setNewConfig(prev => ({ ...prev, sourceType: e.target.value }))}
                                            >
                                                <option value="website">Website</option>
                                                <option value="api">API</option>
                                                <option value="database">Database</option>
                                                <option value="file">File</option>
                                            </select>
                                        </div>
                                        <div className="config-field">
                                            <label>Base URL</label>
                                            <input
                                                type="url"
                                                value={newConfig.baseUrl}
                                                onChange={(e) => setNewConfig(prev => ({ ...prev, baseUrl: e.target.value }))}
                                                placeholder="https://example.com"
                                            />
                                        </div>
                                        <div className="config-field">
                                            <label>Rate Limit (ms)</label>
                                            <input
                                                type="number"
                                                value={newConfig.rateLimit}
                                                onChange={(e) => setNewConfig(prev => ({ ...prev, rateLimit: parseInt(e.target.value) }))}
                                                min="100"
                                                max="10000"
                                            />
                                        </div>
                                        <div className="config-field">
                                            <label>Description</label>
                                            <textarea
                                                value={newConfig.description}
                                                onChange={(e) => setNewConfig(prev => ({ ...prev, description: e.target.value }))}
                                                placeholder="Configuration description"
                                                rows="3"
                                            />
                                        </div>
                                        <div className="config-field">
                                            <label>Max Depth</label>
                                            <input
                                                type="number"
                                                value={newConfig.maxDepth}
                                                onChange={(e) => setNewConfig(prev => ({ ...prev, maxDepth: parseInt(e.target.value) }))}
                                                min="1"
                                                max="10"
                                            />
                                        </div>
                                    </div>
                                    <div style={{ marginTop: '1rem' }}>
                                        <button className="btn btn-primary" onClick={handleCreateConfig}>
                                            Create Configuration
                                        </button>
                                    </div>
                                </div>

                                <div className="operations-table">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Configuration</th>
                                                <th>Source Type</th>
                                                <th>Base URL</th>
                                                <th>Rate Limit</th>
                                                <th>Status</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {configs.map(config => (
                                                <tr key={config.id}>
                                                    <td>
                                                        <div>
                                                            <div style={{ fontWeight: '600' }}>{config.name}</div>
                                                            <div style={{ fontSize: '0.75rem', color: '#718096' }}>{config.id}</div>
                                                        </div>
                                                    </td>
                                                    <td>{config.source_type}</td>
                                                    <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                        {config.base_url}
                                                    </td>
                                                    <td>{config.rate_limit}ms</td>
                                                    <td>
                                                        <span className="status-badge status-completed">
                                                            {config.status}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <button className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}>
                                                            Edit
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {activeTab === 'training' && (
                            <div>
                                <div className="stats-grid">
                                    <div className="stat-card">
                                        <div className="stat-header">
                                            <div className="stat-title">Total Datasets</div>
                                            <div className="stat-icon" style={{ background: '#f59e0b' }}>📚</div>
                                        </div>
                                        <div className="stat-value">{datasets.length}</div>
                                        <div className="stat-change">Ready for training</div>
                                    </div>

                                    <div className="stat-card">
                                        <div className="stat-header">
                                            <div className="stat-title">Total Records</div>
                                            <div className="stat-icon" style={{ background: '#10b981' }}>📊</div>
                                        </div>
                                        <div className="stat-value">
                                            {datasets.reduce((sum, d) => sum + d.record_count, 0).toLocaleString()}
                                        </div>
                                        <div className="stat-change">Across all datasets</div>
                                    </div>
                                </div>

                                <div className="operations-table">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Dataset</th>
                                                <th>Source Type</th>
                                                <th>Records</th>
                                                <th>Quality Score</th>
                                                <th>Created</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {datasets.map(dataset => (
                                                <tr key={dataset.id}>
                                                    <td>
                                                        <div>
                                                            <div style={{ fontWeight: '600' }}>{dataset.name}</div>
                                                            <div style={{ fontSize: '0.75rem', color: '#718096' }}>{dataset.id}</div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <span style={{
                                                            padding: '0.25rem 0.5rem',
                                                            background: '#e2e8f0',
                                                            borderRadius: '4px',
                                                            fontSize: '0.75rem',
                                                            textTransform: 'capitalize'
                                                        }}>
                                                            {dataset.source_type}
                                                        </span>
                                                    </td>
                                                    <td>{dataset.record_count.toLocaleString()}</td>
                                                    <td>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                            <div style={{
                                                                width: '60px',
                                                                height: '8px',
                                                                background: '#e2e8f0',
                                                                borderRadius: '4px',
                                                                overflow: 'hidden'
                                                            }}>
                                                                <div style={{
                                                                    width: \`\${dataset.quality_score * 100}%\`,
                                                                    height: '100%',
                                                                    background: dataset.quality_score > 0.8 ? '#48bb78' : dataset.quality_score > 0.6 ? '#f59e0b' : '#ef4444'
                                                                }}></div>
                                                            </div>
                                                            {(dataset.quality_score * 100).toFixed(1)}%
                                                        </div>
                                                    </td>
                                                    <td>{new Date(dataset.created_at || Date.now()).toLocaleDateString()}</td>
                                                    <td>
                                                        <button className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}>
                                                            View Details
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {activeTab === 'models' && (
                            <div>
                                <div className="chart-container">
                                    <h3>Model Performance Analytics</h3>
                                    <div className="chart-placeholder">
                                        🤖 Model training progress and performance metrics
                                        <br />
                                        <small>Real-time model monitoring and analytics</small>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'analytics' && (
                            <div>
                                <div className="chart-container">
                                    <h3>Data Mining Analytics Dashboard</h3>
                                    <div className="chart-placeholder">
                                        📈 Comprehensive analytics and insights
                                        <br />
                                        <small>Performance metrics, trends, and optimization suggestions</small>
                                    </div>
                                </div>
                            </div>
                        )}
                    </main>
                </div>
            );
        }

        ReactDOM.render(<DataMiningDashboard />, document.getElementById('data-mining-app'));
    </script>
</body>
</html>`;
}

// Main setup function
async function setupDataMiningSystem() {
  console.log('🚀 SETTING UP COMPREHENSIVE DATA MINING SYSTEM');
  console.log('==============================================');

  // Initialize database
  const db = new DataMiningDatabase('./comprehensive-data-mining.db');

  try {
    await db.initialize();

    // Create sample mining operations
    console.log('📋 Creating sample mining operations...');

    const operations = [
      {
        id: 'op-seo-mining',
        name: 'SEO Data Mining Campaign',
        description: 'Comprehensive mining of SEO-related data from design systems',
        type: 'scraping',
        status: 'completed',
        priority: 1,
        metadata: {
          targetSources: ['Material Design', 'Ant Design', 'Chakra UI'],
          dataTypes: ['components', 'patterns', 'tokens'],
          estimatedDuration: 3600
        }
      },
      {
        id: 'op-training-prep',
        name: 'Training Data Preparation',
        description: 'Process and prepare mined data for neural network training',
        type: 'processing',
        status: 'completed',
        priority: 2,
        metadata: {
          inputOperations: ['op-seo-mining'],
          processingSteps: ['cleaning', 'normalization', 'validation'],
          outputFormat: 'training-ready'
        }
      },
      {
        id: 'op-model-training',
        name: 'Schema Generation Model Training',
        description: 'Train neural networks for automated schema generation',
        type: 'training',
        status: 'running',
        priority: 3,
        metadata: {
          modelType: 'generation',
          algorithm: 'transformer',
          trainingData: 'op-training-prep',
          targetAccuracy: 0.90
        }
      }
    ];

    for (const op of operations) {
      db.createMiningOperation(op);
    }

    // Create scraping configurations
    console.log('🕷️ Creating scraping configurations...');

    const scrapingConfigs = [
      {
        id: 'config-material-design',
        operationId: 'op-seo-mining',
        name: 'Material Design Component Mining',
        description: 'Extract component schemas and patterns from Material Design',
        sourceType: 'website',
        baseUrl: 'https://material.io',
        allowedDomains: ['material.io', 'material-components.github.io'],
        selectors: {
          components: ['.component-card', '.mdc-component'],
          patterns: ['.pattern-card', '.design-pattern'],
          codeExamples: ['.code-example', 'pre']
        },
        extractors: [
          {
            name: 'Button Extractor',
            selector: '.component-card[data-component*="button"]',
            properties: { name: 'name', description: 'description', variants: 'variants' },
            schema: { visual: ['color', 'typography'], behavioral: ['interaction'], accessibility: ['aria'] }
          }
        ],
        rateLimit: 1000,
        maxConcurrency: 3,
        timeout: 30000,
        maxDepth: 3,
        followLinks: true,
        respectRobotsTxt: true,
        outputFormat: 'json',
        storageLocation: './mining-data/material-design'
      },
      {
        id: 'config-ant-design',
        operationId: 'op-seo-mining',
        name: 'Ant Design Component Mining',
        description: 'Extract component schemas and patterns from Ant Design',
        sourceType: 'website',
        baseUrl: 'https://ant.design',
        allowedDomains: ['ant.design', 'ant-design.antgroup.com'],
        selectors: {
          components: ['.ant-component', '.component-item'],
          patterns: ['.ant-pattern', '.usage-pattern'],
          codeExamples: ['.code-box', 'pre']
        },
        extractors: [
          {
            name: 'Ant Button Extractor',
            selector: '.ant-component[data-name*="button"]',
            properties: { name: 'name', description: 'description', variants: 'variants' },
            schema: { visual: ['type', 'size'], behavioral: ['loading', 'disabled'], accessibility: ['aria'] }
          }
        ],
        rateLimit: 1500,
        maxConcurrency: 2,
        timeout: 25000,
        maxDepth: 4,
        followLinks: true,
        respectRobotsTxt: true,
        outputFormat: 'json',
        storageLocation: './mining-data/ant-design'
      },
      {
        id: 'config-chakra-ui',
        operationId: 'op-seo-mining',
        name: 'Chakra UI Component Mining',
        description: 'Extract component schemas and patterns from Chakra UI',
        sourceType: 'website',
        baseUrl: 'https://chakra-ui.com',
        allowedDomains: ['chakra-ui.com'],
        selectors: {
          components: ['.chakra-component', '.component-doc'],
          patterns: ['.pattern-example', '.usage-guide'],
          codeExamples: ['.code-example', 'pre']
        },
        extractors: [
          {
            name: 'Chakra Button Extractor',
            selector: '.chakra-component[data-name*="button"]',
            properties: { name: 'name', description: 'description', variants: 'variants' },
            schema: { visual: ['variant', 'size'], behavioral: ['onClick', 'isDisabled'], accessibility: ['aria'] }
          }
        ],
        rateLimit: 1200,
        maxConcurrency: 3,
        timeout: 20000,
        maxDepth: 3,
        followLinks: true,
        respectRobotsTxt: true,
        outputFormat: 'json',
        storageLocation: './mining-data/chakra-ui'
      }
    ];

    for (const config of scrapingConfigs) {
      db.createScrapingConfig(config);
    }

    // Create training datasets
    console.log('🎓 Creating training datasets...');

    const trainingDatasets = [
      {
        id: 'dataset-material-components',
        name: 'Material Design Components',
        description: 'Component schemas and patterns mined from Material Design',
        sourceType: 'scraped',
        dataFormat: 'json',
        storagePath: './mining-data/material-design/components.json',
        schemaDefinition: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            category: { type: 'string' },
            variants: { type: 'array' },
            schema: { type: 'object' }
          }
        },
        recordCount: 150,
        fileSizeBytes: 245760,
        qualityScore: 0.92
      },
      {
        id: 'dataset-ant-components',
        name: 'Ant Design Components',
        description: 'Component schemas and patterns mined from Ant Design',
        sourceType: 'scraped',
        dataFormat: 'json',
        storagePath: './mining-data/ant-design/components.json',
        schemaDefinition: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            category: { type: 'string' },
            variants: { type: 'array' },
            schema: { type: 'object' }
          }
        },
        recordCount: 120,
        fileSizeBytes: 196608,
        qualityScore: 0.89
      },
      {
        id: 'dataset-synthetic-training',
        name: 'Synthetic Training Data',
        description: 'Synthetically generated training data for schema generation',
        sourceType: 'synthetic',
        dataFormat: 'json',
        storagePath: './training-data/synthetic-examples.json',
        schemaDefinition: {
          type: 'object',
          properties: {
            input: { type: 'object' },
            output: { type: 'object' },
            metadata: { type: 'object' }
          }
        },
        recordCount: 500,
        fileSizeBytes: 524288,
        qualityScore: 0.95
      }
    ];

    for (const dataset of trainingDatasets) {
      db.createTrainingDataset(dataset);
    }

    // Create model training configurations
    console.log('🤖 Creating model training configurations...');

    const modelConfigs = [
      {
        id: 'model-schema-generator',
        name: 'Schema Generation Model',
        description: 'Neural network for generating component schemas from requirements',
        modelType: 'generation',
        algorithm: 'transformer',
        hyperparameters: {
          hiddenSize: 512,
          numLayers: 6,
          numHeads: 8,
          dropout: 0.1,
          learningRate: 0.0001
        },
        trainingDataId: 'dataset-synthetic-training',
        validationDataId: 'dataset-material-components',
        featureColumns: ['component', 'context', 'requirements'],
        targetColumn: 'schema',
        preprocessingPipeline: [
          { type: 'tokenization', params: { maxLength: 512 } },
          { type: 'normalization', params: { lowercase: true } },
          { type: 'encoding', params: { type: 'positional' } }
        ],
        evaluationMetrics: ['accuracy', 'f1_score', 'bleu_score'],
        crossValidationFolds: 5,
        earlyStoppingEnabled: true,
        maxTrainingTime: 7200, // 2 hours
        gpuEnabled: true,
        distributedTraining: false
      },
      {
        id: 'model-pattern-recognizer',
        name: 'Usage Pattern Recognition Model',
        description: 'Model for recognizing component usage patterns',
        modelType: 'classification',
        algorithm: 'bert',
        hyperparameters: {
          hiddenSize: 768,
          numLayers: 12,
          numHeads: 12,
          dropout: 0.1,
          learningRate: 0.00002
        },
        trainingDataId: 'dataset-ant-components',
        featureColumns: ['description', 'usage', 'context'],
        targetColumn: 'pattern_category',
        preprocessingPipeline: [
          { type: 'tokenization', params: { model: 'bert-base' } },
          { type: 'padding', params: { maxLength: 256 } },
          { type: 'attention_mask', params: {} }
        ],
        evaluationMetrics: ['accuracy', 'precision', 'recall', 'f1_score'],
        crossValidationFolds: 3,
        earlyStoppingEnabled: true,
        maxTrainingTime: 3600,
        gpuEnabled: true,
        distributedTraining: false
      }
    ];

    for (const config of modelConfigs) {
      db.createModelTrainingConfig(config);
    }

    // Create sample trained models
    console.log('🎯 Creating sample trained models...');

    const trainedModels = [
      {
        id: 'model-schema-gen-v1',
        configId: 'model-schema-generator',
        name: 'Schema Generator v1.0',
        version: '1.0.0',
        modelPath: './models/schema-generator-v1.pkl',
        modelFormat: 'pytorch',
        inputSchema: {
          type: 'object',
          properties: {
            component: { type: 'string' },
            context: { type: 'string' },
            requirements: { type: 'array', items: { type: 'string' } }
          }
        },
        outputSchema: {
          type: 'object',
          properties: {
            schema: { type: 'object' },
            composition: { type: 'object' },
            styling: { type: 'object' }
          }
        },
        performanceMetrics: {
          accuracy: 0.87,
          f1_score: 0.84,
          bleu_score: 0.76,
          validation_loss: 0.23
        },
        trainingDuration: 5400,
        modelSizeBytes: 524288000, // 500MB
        frameworkVersion: 'PyTorch 2.0.1',
        pythonVersion: '3.9.7',
        hardwareUsed: 'NVIDIA A100',
        status: 'deployed'
      }
    ];

    for (const model of trainedModels) {
      db.insertTrainedModel.run(
        model.id,
        model.configId,
        model.name,
        model.version,
        model.modelPath,
        model.modelFormat,
        JSON.stringify(model.inputSchema),
        JSON.stringify(model.outputSchema),
        JSON.stringify(model.performanceMetrics),
        model.trainingDuration,
        model.modelSizeBytes,
        model.frameworkVersion,
        model.pythonVersion,
        model.hardwareUsed,
        model.status
      );
    }

    // Log sample operations
    console.log('📝 Logging sample operations...');

    db.logOperation('op-seo-mining', 'info', 'Started SEO data mining campaign');
    db.logOperation('op-seo-mining', 'info', 'Successfully crawled Material Design components');
    db.logOperation('op-seo-mining', 'info', 'Extracted 150 component schemas');
    db.logOperation('op-seo-mining', 'info', 'Campaign completed successfully');

    db.logOperation('op-training-prep', 'info', 'Started training data preparation');
    db.logOperation('op-training-prep', 'info', 'Normalized component schemas');
    db.logOperation('op-training-prep', 'info', 'Generated training examples');
    db.logOperation('op-training-prep', 'info', 'Data preparation completed');

    // Record performance metrics
    db.recordPerformanceMetric('op-seo-mining', 'scraping', 'requests_per_second', 2.5);
    db.recordPerformanceMetric('op-seo-mining', 'scraping', 'success_rate', 95.2, '%');
    db.recordPerformanceMetric('op-seo-mining', 'scraping', 'data_extracted_mb', 2.4, 'MB');

    // Create and serve the visualization app
    console.log('🎨 Creating data mining visualization app...');

    const publicDir = './data-mining-visualization';
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    const appHTML = createVisualizationAppHTML();
    fs.writeFileSync(path.join(publicDir, 'index.html'), appHTML);

    // Export database for analysis
    const exportPath = './data-mining-system-export.json';
    db.exportToJSON(exportPath);

    console.log('');
    console.log('🎊 COMPREHENSIVE DATA MINING SYSTEM SETUP COMPLETE');
    console.log('==================================================');

    console.log('');
    console.log('📊 SYSTEM STATISTICS:');
    const stats = db.getStatistics();
    console.log(`   🏗️  Mining Operations: ${stats.operations.total}`);
    console.log(`   🕷️  Scraping Configurations: ${stats.operations.total} (one per operation)`);
    console.log(`   📚 Training Datasets: ${stats.datasets.total}`);
    console.log(`   🤖 Model Configurations: 2`);
    console.log(`   🎯 Trained Models: ${stats.models.total}`);
    console.log(`   🔗 Total Relationships: ${stats.totalRelationships}`);
    console.log(`   📈 Total Records: ${stats.datasets.totalRecords.toLocaleString()}`);

    console.log('');
    console.log('🎨 VISUALIZATION APP CREATED:');
    console.log(`   📁 Location: ${publicDir}/index.html`);
    console.log(`   🌐 Independent React app for data mining dashboard`);
    console.log(`   📊 Real-time statistics and operation monitoring`);
    console.log(`   ⚙️ Scraping configuration management`);
    console.log(`   🎓 Training data visualization`);
    console.log(`   🤖 Model performance analytics`);

    console.log('');
    console.log('💾 DATABASE EXPORT:');
    console.log(`   📄 Complete system export: ${exportPath}`);
    console.log(`   🔍 Contains all operations, configs, datasets, and models`);
    console.log(`   📊 Ready for analysis and backup`);

    console.log('');
    console.log('🚀 TO START THE VISUALIZATION:');
    console.log(`   1. cd ${publicDir}`);
    console.log(`   2. Start a local HTTP server (e.g., python -m http.server 8080)`);
    console.log(`   3. Open http://localhost:8080 in your browser`);
    console.log(`   4. Explore the comprehensive data mining dashboard!`);

    console.log('');
    console.log('🎯 SYSTEM CAPABILITIES:');
    console.log('   ✅ Complete data mining operation management');
    console.log('   ✅ Configurable scraping with rate limiting and ethics');
    console.log('   ✅ Training data preparation and quality scoring');
    console.log('   ✅ Model training configuration and deployment');
    console.log('   ✅ Comprehensive logging and performance monitoring');
    console.log('   ✅ Independent React visualization dashboard');
    console.log('   ✅ Full system export and analysis capabilities');

  } catch (error) {
    console.error('❌ Data mining system setup failed:', error);
    throw error;
  } finally {
    db.close();
  }
}

// Export for use as module
export { DataMiningDatabase, setupDataMiningSystem };

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  setupDataMiningSystem().catch(console.error);
}
