-- ============================================================================
-- Migration: Comprehensive System Tables for Neural Networks, Data Mining, and Services
-- Description: Creates missing tables for neural networks, data mining jobs, 
--              training data, services, and their relationships
-- Created: 2025-11-16
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- NEURAL NETWORK TABLES
-- ============================================================================

-- Neural Network Instances - Manages per-client neural network instances
CREATE TABLE IF NOT EXISTS neural_network_instances (
    id SERIAL PRIMARY KEY,
    instance_id VARCHAR(255) UNIQUE NOT NULL,
    client_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    model_type VARCHAR(100) NOT NULL,
    -- Model types: 'classification', 'regression', 'timeseries', 'nlp', 'cv', 'custom'
    status VARCHAR(50) DEFAULT 'initializing' CHECK (status IN (
        'initializing', 'training', 'ready', 'predicting', 
        'updating', 'paused', 'error', 'archived'
    )),
    version VARCHAR(50) DEFAULT '1.0.0',
    
    -- Training Configuration
    training_config JSONB DEFAULT '{
        "epochs": 100,
        "batchSize": 32,
        "learningRate": 0.001,
        "validationSplit": 0.2,
        "optimizer": "adam",
        "earlyStopping": true,
        "patience": 10
    }'::jsonb,
    
    -- Data Configuration
    data_config JSONB DEFAULT '{
        "source": "database",
        "isolation": "strict",
        "minDataPoints": 100,
        "features": [],
        "labels": []
    }'::jsonb,
    
    -- Model Architecture
    architecture JSONB DEFAULT '{
        "inputShape": [],
        "layers": [],
        "outputShape": []
    }'::jsonb,
    
    -- Performance Metrics
    performance JSONB DEFAULT '{}'::jsonb,
    
    -- Deployment Configuration
    deployment JSONB DEFAULT '{
        "environment": "development",
        "autoUpdate": false
    }'::jsonb,
    
    -- Model Storage Path
    model_path TEXT,
    config_path TEXT,
    
    -- Metadata
    tags JSONB DEFAULT '[]'::jsonb,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_trained_at TIMESTAMP,
    
    _meta JSONB DEFAULT '{}'::jsonb
);

-- Neural Network Training Sessions - Track individual training runs
CREATE TABLE IF NOT EXISTS neural_network_training_sessions (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(255) UNIQUE NOT NULL,
    instance_id VARCHAR(255) NOT NULL REFERENCES neural_network_instances(instance_id) ON DELETE CASCADE,
    
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN (
        'pending', 'running', 'completed', 'failed', 'cancelled'
    )),
    
    -- Training Parameters
    epochs_planned INTEGER NOT NULL,
    epochs_completed INTEGER DEFAULT 0,
    batch_size INTEGER,
    learning_rate DECIMAL(10, 8),
    
    -- Training Metrics per Epoch
    training_metrics JSONB DEFAULT '[]'::jsonb,
    -- Array of: {"epoch": 1, "loss": 0.5, "accuracy": 0.8, "val_loss": 0.6, "val_accuracy": 0.75}
    
    -- Best Performance
    best_epoch INTEGER,
    best_loss DECIMAL(10, 6),
    best_accuracy DECIMAL(10, 6),
    best_val_loss DECIMAL(10, 6),
    best_val_accuracy DECIMAL(10, 6),
    
    -- Training Data Stats
    training_samples INTEGER,
    validation_samples INTEGER,
    test_samples INTEGER,
    
    -- Resource Usage
    training_time_seconds INTEGER,
    memory_usage_mb INTEGER,
    gpu_utilized BOOLEAN DEFAULT FALSE,
    
    -- Error Information
    error_message TEXT,
    error_stack TEXT,
    
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    _meta JSONB DEFAULT '{}'::jsonb
);

-- Neural Network Predictions - Track prediction requests and results
CREATE TABLE IF NOT EXISTS neural_network_predictions (
    id SERIAL PRIMARY KEY,
    prediction_id VARCHAR(255) UNIQUE NOT NULL,
    instance_id VARCHAR(255) NOT NULL REFERENCES neural_network_instances(instance_id) ON DELETE CASCADE,
    
    -- Input Data
    input_features JSONB NOT NULL,
    input_hash VARCHAR(64), -- Hash of input for deduplication
    
    -- Output Data
    prediction_result JSONB,
    confidence DECIMAL(5, 4),
    
    -- Feedback Loop
    actual_result JSONB,
    feedback_score DECIMAL(3, 2), -- -1.0 to 1.0
    feedback_notes TEXT,
    is_correct BOOLEAN,
    
    -- Performance
    inference_time_ms INTEGER,
    
    -- Metadata
    request_source VARCHAR(100), -- 'api', 'batch', 'scheduled', 'manual'
    batch_id VARCHAR(255),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    feedback_at TIMESTAMP,
    
    _meta JSONB DEFAULT '{}'::jsonb
);

-- ============================================================================
-- DATA MINING TABLES (Enhanced beyond existing data_mining_instances)
-- ============================================================================

-- Data Mining Jobs - Track comprehensive mining job lifecycle
CREATE TABLE IF NOT EXISTS data_mining_jobs (
    id SERIAL PRIMARY KEY,
    job_id VARCHAR(255) UNIQUE NOT NULL,
    mining_id VARCHAR(255), -- Link to data_mining_instances if applicable
    
    name VARCHAR(255) NOT NULL,
    description TEXT,
    job_type VARCHAR(100) NOT NULL,
    -- Types: 'web_scraping', 'api_extraction', 'database_mining', 'file_processing', 'pattern_analysis'
    
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN (
        'pending', 'queued', 'running', 'paused', 
        'completed', 'failed', 'cancelled', 'retrying'
    )),
    
    priority INTEGER DEFAULT 5,
    
    -- Configuration
    source_config JSONB NOT NULL DEFAULT '{}'::jsonb,
    -- Contains: url, api_endpoint, database_query, file_path, etc.
    
    extraction_config JSONB DEFAULT '{}'::jsonb,
    -- Contains: selectors, extractors, filters, transformations
    
    processing_config JSONB DEFAULT '{}'::jsonb,
    -- Contains: cleaning, validation, enrichment rules
    
    output_config JSONB DEFAULT '{}'::jsonb,
    -- Contains: destination, format, storage settings
    
    schedule_config JSONB DEFAULT '{}'::jsonb,
    -- Contains: cron, interval, one_time
    
    -- Progress Tracking
    total_items INTEGER DEFAULT 0,
    processed_items INTEGER DEFAULT 0,
    successful_items INTEGER DEFAULT 0,
    failed_items INTEGER DEFAULT 0,
    skipped_items INTEGER DEFAULT 0,
    
    -- Performance Metrics
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    duration_seconds INTEGER,
    items_per_second DECIMAL(10, 2),
    
    -- Resource Usage
    memory_usage_mb INTEGER,
    cpu_usage_percent DECIMAL(5, 2),
    network_bytes_downloaded BIGINT,
    
    -- Error Handling
    error_count INTEGER DEFAULT 0,
    last_error TEXT,
    error_log JSONB DEFAULT '[]'::jsonb,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    
    -- Results
    results_summary JSONB DEFAULT '{}'::jsonb,
    results_location TEXT,
    
    -- Metadata
    client_id VARCHAR(255),
    campaign_id VARCHAR(255),
    parent_job_id VARCHAR(255),
    tags JSONB DEFAULT '[]'::jsonb,
    
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    _meta JSONB DEFAULT '{}'::jsonb
);

-- Data Mining Results - Store extracted data
CREATE TABLE IF NOT EXISTS data_mining_results (
    id SERIAL PRIMARY KEY,
    result_id VARCHAR(255) UNIQUE NOT NULL,
    job_id VARCHAR(255) NOT NULL REFERENCES data_mining_jobs(job_id) ON DELETE CASCADE,
    
    -- Source Information
    source_url TEXT,
    source_type VARCHAR(100),
    
    -- Extracted Data
    raw_data JSONB NOT NULL,
    processed_data JSONB,
    
    -- Quality Metrics
    extraction_quality DECIMAL(5, 4), -- 0.0 to 1.0
    data_completeness DECIMAL(5, 4),
    validation_passed BOOLEAN DEFAULT TRUE,
    validation_errors JSONB DEFAULT '[]'::jsonb,
    
    -- Classification
    category VARCHAR(255),
    tags JSONB DEFAULT '[]'::jsonb,
    
    -- Timestamps
    extracted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP,
    
    _meta JSONB DEFAULT '{}'::jsonb
);

-- Data Mining Schedules - Manage recurring mining jobs
CREATE TABLE IF NOT EXISTS data_mining_schedules (
    id SERIAL PRIMARY KEY,
    schedule_id VARCHAR(255) UNIQUE NOT NULL,
    job_template_id VARCHAR(255) NOT NULL REFERENCES data_mining_jobs(job_id) ON DELETE CASCADE,
    
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    schedule_type VARCHAR(50) NOT NULL CHECK (schedule_type IN (
        'once', 'interval', 'cron', 'event_driven'
    )),
    
    -- Schedule Configuration
    cron_expression VARCHAR(255),
    interval_minutes INTEGER,
    interval_hours INTEGER,
    interval_days INTEGER,
    
    -- Time Constraints
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    timezone VARCHAR(100) DEFAULT 'UTC',
    
    -- Execution Tracking
    enabled BOOLEAN DEFAULT TRUE,
    last_run_at TIMESTAMP,
    next_run_at TIMESTAMP,
    run_count INTEGER DEFAULT 0,
    max_runs INTEGER,
    
    -- Error Handling
    consecutive_failures INTEGER DEFAULT 0,
    max_consecutive_failures INTEGER DEFAULT 3,
    pause_on_failure BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    _meta JSONB DEFAULT '{}'::jsonb
);

-- ============================================================================
-- TRAINING DATA TABLES (Enhanced beyond existing seo_training_data)
-- ============================================================================

-- Training Datasets - Organize training data into datasets
CREATE TABLE IF NOT EXISTS training_datasets (
    id SERIAL PRIMARY KEY,
    dataset_id VARCHAR(255) UNIQUE NOT NULL,
    
    name VARCHAR(255) NOT NULL,
    description TEXT,
    dataset_type VARCHAR(100) NOT NULL,
    -- Types: 'classification', 'regression', 'timeseries', 'nlp', 'image', 'mixed'
    
    -- Dataset Configuration
    domain VARCHAR(255), -- e.g., 'seo', 'ecommerce', 'nlp', 'cv'
    task VARCHAR(255), -- e.g., 'sentiment_analysis', 'price_prediction'
    
    -- Data Schema
    features_schema JSONB NOT NULL DEFAULT '[]'::jsonb,
    labels_schema JSONB NOT NULL DEFAULT '[]'::jsonb,
    
    -- Dataset Statistics
    total_records INTEGER DEFAULT 0,
    training_records INTEGER DEFAULT 0,
    validation_records INTEGER DEFAULT 0,
    test_records INTEGER DEFAULT 0,
    
    -- Quality Metrics
    quality_score DECIMAL(5, 4),
    completeness DECIMAL(5, 4),
    balance_score DECIMAL(5, 4), -- For classification: class balance
    
    -- Data Splits
    split_config JSONB DEFAULT '{
        "train": 0.7,
        "validation": 0.15,
        "test": 0.15,
        "strategy": "random"
    }'::jsonb,
    
    -- Version Control
    version VARCHAR(50) DEFAULT '1.0.0',
    parent_dataset_id VARCHAR(255),
    
    -- Storage
    storage_location TEXT,
    storage_format VARCHAR(50) DEFAULT 'jsonb', -- 'jsonb', 's3', 'filesystem'
    
    -- Access Control
    is_public BOOLEAN DEFAULT FALSE,
    owner_id VARCHAR(255),
    
    -- Metadata
    tags JSONB DEFAULT '[]'::jsonb,
    category VARCHAR(255),
    
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    _meta JSONB DEFAULT '{}'::jsonb
);

-- Training Records - Individual training data records
CREATE TABLE IF NOT EXISTS training_records (
    id SERIAL PRIMARY KEY,
    record_id VARCHAR(255) UNIQUE NOT NULL,
    dataset_id VARCHAR(255) NOT NULL REFERENCES training_datasets(dataset_id) ON DELETE CASCADE,
    
    -- Data Split
    split_type VARCHAR(50) NOT NULL CHECK (split_type IN (
        'train', 'validation', 'test', 'holdout'
    )),
    
    -- Features and Labels
    features JSONB NOT NULL,
    labels JSONB NOT NULL,
    
    -- Feature Engineering
    raw_features JSONB,
    engineered_features JSONB,
    feature_vector JSONB, -- Normalized/vectorized features
    
    -- Data Quality
    quality_score DECIMAL(5, 4),
    is_outlier BOOLEAN DEFAULT FALSE,
    is_synthetic BOOLEAN DEFAULT FALSE, -- Data augmentation flag
    
    -- Source Tracking
    source_id VARCHAR(255), -- Reference to original data source
    source_type VARCHAR(100),
    source_url TEXT,
    
    -- Weights (for imbalanced datasets)
    sample_weight DECIMAL(10, 6) DEFAULT 1.0,
    
    -- Metadata
    tags JSONB DEFAULT '[]'::jsonb,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    _meta JSONB DEFAULT '{}'::jsonb
);

-- Training Metrics - Track model training performance
CREATE TABLE IF NOT EXISTS training_metrics (
    id SERIAL PRIMARY KEY,
    metric_id VARCHAR(255) UNIQUE NOT NULL,
    session_id VARCHAR(255) REFERENCES neural_network_training_sessions(session_id) ON DELETE CASCADE,
    dataset_id VARCHAR(255) REFERENCES training_datasets(dataset_id) ON DELETE SET NULL,
    
    -- Metric Type
    metric_type VARCHAR(100) NOT NULL,
    -- Types: 'loss', 'accuracy', 'precision', 'recall', 'f1', 'mse', 'mae', 'r2', 'auc', 'custom'
    
    -- Values
    epoch INTEGER,
    step INTEGER,
    value DECIMAL(15, 10) NOT NULL,
    
    -- Context
    phase VARCHAR(50) NOT NULL CHECK (phase IN (
        'training', 'validation', 'test'
    )),
    
    -- Timestamp
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    _meta JSONB DEFAULT '{}'::jsonb
);

-- ============================================================================
-- SERVICE TABLES
-- ============================================================================

-- Service Definitions - Comprehensive service registry
CREATE TABLE IF NOT EXISTS service_definitions (
    id SERIAL PRIMARY KEY,
    service_id VARCHAR(255) UNIQUE NOT NULL,
    
    name VARCHAR(255) NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    description TEXT,
    
    service_type VARCHAR(100) NOT NULL,
    -- Types: 'crawler', 'neural_network', 'data_mining', 'api', 'worker', 'scheduler', 'monitor'
    
    category VARCHAR(100),
    -- Categories: 'seo', 'analytics', 'ml', 'automation', 'infrastructure'
    
    -- Service Configuration
    configuration JSONB DEFAULT '{}'::jsonb,
    default_config JSONB DEFAULT '{}'::jsonb,
    
    -- Deployment
    deployment_type VARCHAR(50) DEFAULT 'internal',
    -- Types: 'internal', 'docker', 'kubernetes', 'serverless', 'external'
    
    endpoint_url TEXT,
    health_check_url TEXT,
    
    -- Capabilities
    capabilities JSONB DEFAULT '[]'::jsonb,
    supported_operations JSONB DEFAULT '[]'::jsonb,
    
    -- Dependencies
    dependencies JSONB DEFAULT '[]'::jsonb,
    -- Array of service_ids this service depends on
    
    -- Resource Requirements
    resource_requirements JSONB DEFAULT '{
        "cpu": "100m",
        "memory": "256Mi",
        "disk": "1Gi"
    }'::jsonb,
    
    -- Status
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN (
        'active', 'inactive', 'maintenance', 'deprecated', 'archived'
    )),
    
    -- Version
    version VARCHAR(50) DEFAULT '1.0.0',
    
    -- Access Control
    is_public BOOLEAN DEFAULT FALSE,
    requires_auth BOOLEAN DEFAULT TRUE,
    allowed_roles JSONB DEFAULT '[]'::jsonb,
    
    -- Metadata
    tags JSONB DEFAULT '[]'::jsonb,
    documentation_url TEXT,
    repository_url TEXT,
    
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    _meta JSONB DEFAULT '{}'::jsonb
);

-- Service Health Checks - Monitor service health
CREATE TABLE IF NOT EXISTS service_health_checks (
    id SERIAL PRIMARY KEY,
    check_id VARCHAR(255) UNIQUE NOT NULL,
    service_id VARCHAR(255) NOT NULL REFERENCES service_definitions(service_id) ON DELETE CASCADE,
    
    -- Check Result
    status VARCHAR(50) NOT NULL CHECK (status IN (
        'healthy', 'degraded', 'unhealthy', 'unknown'
    )),
    
    -- Health Metrics
    response_time_ms INTEGER,
    cpu_usage_percent DECIMAL(5, 2),
    memory_usage_mb INTEGER,
    disk_usage_percent DECIMAL(5, 2),
    
    -- Additional Metrics
    active_connections INTEGER,
    error_rate DECIMAL(5, 4),
    throughput_rps DECIMAL(10, 2), -- Requests per second
    
    -- Error Information
    error_message TEXT,
    warnings JSONB DEFAULT '[]'::jsonb,
    
    -- Check Details
    check_type VARCHAR(50) DEFAULT 'automatic',
    -- Types: 'automatic', 'manual', 'scheduled'
    
    checked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    _meta JSONB DEFAULT '{}'::jsonb
);

-- Service Logs - Centralized service logging
CREATE TABLE IF NOT EXISTS service_logs (
    id SERIAL PRIMARY KEY,
    log_id VARCHAR(255) UNIQUE NOT NULL,
    service_id VARCHAR(255) REFERENCES service_definitions(service_id) ON DELETE CASCADE,
    
    -- Log Level
    level VARCHAR(50) NOT NULL CHECK (level IN (
        'debug', 'info', 'warn', 'error', 'fatal'
    )),
    
    -- Log Content
    message TEXT NOT NULL,
    details JSONB DEFAULT '{}'::jsonb,
    
    -- Context
    request_id VARCHAR(255),
    user_id VARCHAR(255),
    session_id VARCHAR(255),
    
    -- Error Information
    error_code VARCHAR(100),
    error_stack TEXT,
    
    -- Source
    source_file VARCHAR(500),
    source_line INTEGER,
    source_function VARCHAR(255),
    
    -- Timestamp
    logged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    _meta JSONB DEFAULT '{}'::jsonb
);

-- ============================================================================
-- SEEDING ENHANCEMENTS (Extending existing url_seeds)
-- ============================================================================

-- Seeding Strategies - Define seeding algorithms and strategies
CREATE TABLE IF NOT EXISTS seeding_strategies (
    id SERIAL PRIMARY KEY,
    strategy_id VARCHAR(255) UNIQUE NOT NULL,
    
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    strategy_type VARCHAR(100) NOT NULL,
    -- Types: 'breadth_first', 'depth_first', 'priority', 'smart', 'neural', 'custom'
    
    -- Algorithm Configuration
    algorithm_config JSONB DEFAULT '{}'::jsonb,
    
    -- Scoring Rules
    url_scoring_rules JSONB DEFAULT '[]'::jsonb,
    priority_rules JSONB DEFAULT '[]'::jsonb,
    
    -- Constraints
    max_depth INTEGER DEFAULT 3,
    max_urls_per_domain INTEGER,
    rate_limit_ms INTEGER DEFAULT 1000,
    
    -- Filters
    url_filters JSONB DEFAULT '[]'::jsonb,
    domain_filters JSONB DEFAULT '[]'::jsonb,
    
    -- Performance
    avg_quality_score DECIMAL(5, 4),
    success_rate DECIMAL(5, 4),
    
    -- Status
    status VARCHAR(50) DEFAULT 'active',
    is_default BOOLEAN DEFAULT FALSE,
    
    created_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    _meta JSONB DEFAULT '{}'::jsonb
);

-- Seed Quality Metrics - Track seed URL quality over time
CREATE TABLE IF NOT EXISTS seed_quality_metrics (
    id SERIAL PRIMARY KEY,
    metric_id VARCHAR(255) UNIQUE NOT NULL,
    seed_id INTEGER REFERENCES url_seeds(id) ON DELETE CASCADE,
    
    -- Quality Scores
    overall_quality DECIMAL(5, 4),
    content_quality DECIMAL(5, 4),
    relevance_score DECIMAL(5, 4),
    freshness_score DECIMAL(5, 4),
    authority_score DECIMAL(5, 4),
    
    -- Performance Metrics
    avg_response_time_ms INTEGER,
    success_rate DECIMAL(5, 4),
    error_rate DECIMAL(5, 4),
    
    -- Harvest Metrics
    total_crawls INTEGER DEFAULT 0,
    successful_crawls INTEGER DEFAULT 0,
    failed_crawls INTEGER DEFAULT 0,
    data_points_extracted INTEGER DEFAULT 0,
    
    -- Value Metrics
    conversion_rate DECIMAL(5, 4), -- % of extractions that led to useful data
    roi_score DECIMAL(10, 4), -- Return on investment
    
    -- Timestamp
    measured_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    _meta JSONB DEFAULT '{}'::jsonb
);

-- ============================================================================
-- ATTRIBUTE ENHANCEMENTS (Extending existing stream_attributes)
-- ============================================================================

-- Attribute Templates - Reusable attribute configurations
CREATE TABLE IF NOT EXISTS attribute_templates (
    id SERIAL PRIMARY KEY,
    template_id VARCHAR(255) UNIQUE NOT NULL,
    
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    attribute_type VARCHAR(100) NOT NULL,
    -- Types: 'seo', 'content', 'technical', 'performance', 'business', 'custom'
    
    -- Template Definition
    extraction_template JSONB NOT NULL,
    validation_template JSONB DEFAULT '{}'::jsonb,
    enrichment_template JSONB DEFAULT '{}'::jsonb,
    
    -- Default Values
    default_config JSONB DEFAULT '{}'::jsonb,
    
    -- Usage Statistics
    usage_count INTEGER DEFAULT 0,
    success_rate DECIMAL(5, 4),
    
    -- Categorization
    category VARCHAR(255),
    tags JSONB DEFAULT '[]'::jsonb,
    
    -- Status
    status VARCHAR(50) DEFAULT 'active',
    is_public BOOLEAN DEFAULT FALSE,
    
    created_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    _meta JSONB DEFAULT '{}'::jsonb
);

-- Attribute Extraction History - Track extraction performance
CREATE TABLE IF NOT EXISTS attribute_extraction_history (
    id SERIAL PRIMARY KEY,
    history_id VARCHAR(255) UNIQUE NOT NULL,
    attribute_id UUID REFERENCES stream_attributes(attribute_id) ON DELETE CASCADE,
    
    -- Extraction Context
    source_url TEXT NOT NULL,
    extraction_method VARCHAR(100),
    
    -- Results
    extracted_value JSONB,
    confidence_score DECIMAL(5, 4),
    validation_passed BOOLEAN,
    
    -- Performance
    extraction_time_ms INTEGER,
    retry_count INTEGER DEFAULT 0,
    
    -- Error Information
    error_message TEXT,
    
    -- Timestamp
    extracted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    _meta JSONB DEFAULT '{}'::jsonb
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Neural Network Indexes
CREATE INDEX IF NOT EXISTS idx_nn_instances_client ON neural_network_instances(client_id);
CREATE INDEX IF NOT EXISTS idx_nn_instances_status ON neural_network_instances(status);
CREATE INDEX IF NOT EXISTS idx_nn_instances_type ON neural_network_instances(model_type);
CREATE INDEX IF NOT EXISTS idx_nn_training_instance ON neural_network_training_sessions(instance_id);
CREATE INDEX IF NOT EXISTS idx_nn_training_status ON neural_network_training_sessions(status);
CREATE INDEX IF NOT EXISTS idx_nn_predictions_instance ON neural_network_predictions(instance_id);
CREATE INDEX IF NOT EXISTS idx_nn_predictions_hash ON neural_network_predictions(input_hash);

-- Data Mining Indexes
CREATE INDEX IF NOT EXISTS idx_mining_jobs_status ON data_mining_jobs(status);
CREATE INDEX IF NOT EXISTS idx_mining_jobs_type ON data_mining_jobs(job_type);
CREATE INDEX IF NOT EXISTS idx_mining_jobs_client ON data_mining_jobs(client_id);
CREATE INDEX IF NOT EXISTS idx_mining_jobs_campaign ON data_mining_jobs(campaign_id);
CREATE INDEX IF NOT EXISTS idx_mining_results_job ON data_mining_results(job_id);
CREATE INDEX IF NOT EXISTS idx_mining_schedules_template ON data_mining_schedules(job_template_id);
CREATE INDEX IF NOT EXISTS idx_mining_schedules_enabled ON data_mining_schedules(enabled) WHERE enabled = TRUE;
CREATE INDEX IF NOT EXISTS idx_mining_schedules_next_run ON data_mining_schedules(next_run_at) WHERE enabled = TRUE;

-- Training Data Indexes
CREATE INDEX IF NOT EXISTS idx_training_datasets_type ON training_datasets(dataset_type);
CREATE INDEX IF NOT EXISTS idx_training_datasets_domain ON training_datasets(domain);
CREATE INDEX IF NOT EXISTS idx_training_records_dataset ON training_records(dataset_id);
CREATE INDEX IF NOT EXISTS idx_training_records_split ON training_records(split_type);
CREATE INDEX IF NOT EXISTS idx_training_metrics_session ON training_metrics(session_id);
CREATE INDEX IF NOT EXISTS idx_training_metrics_dataset ON training_metrics(dataset_id);

-- Service Indexes
CREATE INDEX IF NOT EXISTS idx_service_defs_type ON service_definitions(service_type);
CREATE INDEX IF NOT EXISTS idx_service_defs_status ON service_definitions(status);
CREATE INDEX IF NOT EXISTS idx_service_health_service ON service_health_checks(service_id);
CREATE INDEX IF NOT EXISTS idx_service_health_status ON service_health_checks(status);
CREATE INDEX IF NOT EXISTS idx_service_logs_service ON service_logs(service_id);
CREATE INDEX IF NOT EXISTS idx_service_logs_level ON service_logs(level);
CREATE INDEX IF NOT EXISTS idx_service_logs_time ON service_logs(logged_at DESC);

-- Seeding Indexes
CREATE INDEX IF NOT EXISTS idx_seeding_strategies_type ON seeding_strategies(strategy_type);
CREATE INDEX IF NOT EXISTS idx_seeding_strategies_default ON seeding_strategies(is_default) WHERE is_default = TRUE;
CREATE INDEX IF NOT EXISTS idx_seed_quality_seed ON seed_quality_metrics(seed_id);

-- Attribute Indexes
CREATE INDEX IF NOT EXISTS idx_attribute_templates_type ON attribute_templates(attribute_type);
CREATE INDEX IF NOT EXISTS idx_attribute_templates_status ON attribute_templates(status);
CREATE INDEX IF NOT EXISTS idx_attribute_history_attr ON attribute_extraction_history(attribute_id);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update updated_at timestamp trigger (reuse existing function)
CREATE TRIGGER update_nn_instances_updated_at 
    BEFORE UPDATE ON neural_network_instances
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_nn_training_sessions_updated_at 
    BEFORE UPDATE ON neural_network_training_sessions
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mining_jobs_updated_at 
    BEFORE UPDATE ON data_mining_jobs
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mining_schedules_updated_at 
    BEFORE UPDATE ON data_mining_schedules
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_training_datasets_updated_at 
    BEFORE UPDATE ON training_datasets
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_training_records_updated_at 
    BEFORE UPDATE ON training_records
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_defs_updated_at 
    BEFORE UPDATE ON service_definitions
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_seeding_strategies_updated_at 
    BEFORE UPDATE ON seeding_strategies
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_attribute_templates_updated_at 
    BEFORE UPDATE ON attribute_templates
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- RELATIONSHIP TRIGGERS
-- ============================================================================

-- Auto-update training dataset statistics when records are added
CREATE OR REPLACE FUNCTION update_dataset_statistics()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE training_datasets
    SET 
        total_records = (
            SELECT COUNT(*) 
            FROM training_records 
            WHERE dataset_id = NEW.dataset_id
        ),
        training_records = (
            SELECT COUNT(*) 
            FROM training_records 
            WHERE dataset_id = NEW.dataset_id AND split_type = 'train'
        ),
        validation_records = (
            SELECT COUNT(*) 
            FROM training_records 
            WHERE dataset_id = NEW.dataset_id AND split_type = 'validation'
        ),
        test_records = (
            SELECT COUNT(*) 
            FROM training_records 
            WHERE dataset_id = NEW.dataset_id AND split_type = 'test'
        ),
        updated_at = CURRENT_TIMESTAMP
    WHERE dataset_id = NEW.dataset_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_dataset_stats
    AFTER INSERT OR DELETE ON training_records
    FOR EACH ROW
    EXECUTE FUNCTION update_dataset_statistics();

-- Auto-update data mining job progress
CREATE OR REPLACE FUNCTION update_mining_job_progress()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE data_mining_jobs
    SET 
        processed_items = processed_items + 1,
        successful_items = successful_items + CASE WHEN NEW.validation_passed THEN 1 ELSE 0 END,
        failed_items = failed_items + CASE WHEN NOT NEW.validation_passed THEN 1 ELSE 0 END,
        updated_at = CURRENT_TIMESTAMP
    WHERE job_id = NEW.job_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_job_progress
    AFTER INSERT ON data_mining_results
    FOR EACH ROW
    EXECUTE FUNCTION update_mining_job_progress();

-- ============================================================================
-- VIEWS FOR COMMON QUERIES
-- ============================================================================

-- Active Neural Network Instances
CREATE OR REPLACE VIEW v_active_neural_networks AS
SELECT 
    nni.instance_id,
    nni.client_id,
    nni.name,
    nni.model_type,
    nni.status,
    nni.version,
    nni.performance,
    nni.last_trained_at,
    COUNT(DISTINCT nnts.session_id) as training_session_count,
    COUNT(DISTINCT nnp.prediction_id) as prediction_count,
    nni.created_at,
    nni.updated_at
FROM neural_network_instances nni
LEFT JOIN neural_network_training_sessions nnts ON nni.instance_id = nnts.instance_id
LEFT JOIN neural_network_predictions nnp ON nni.instance_id = nnp.instance_id
WHERE nni.status IN ('ready', 'training', 'predicting')
GROUP BY nni.instance_id, nni.client_id, nni.name, nni.model_type, nni.status, 
         nni.version, nni.performance, nni.last_trained_at, nni.created_at, nni.updated_at;

-- Data Mining Job Summary
CREATE OR REPLACE VIEW v_mining_job_summary AS
SELECT 
    dmj.job_id,
    dmj.name,
    dmj.job_type,
    dmj.status,
    dmj.priority,
    dmj.total_items,
    dmj.processed_items,
    dmj.successful_items,
    dmj.failed_items,
    CASE 
        WHEN dmj.total_items > 0 
        THEN ROUND((dmj.processed_items::decimal / dmj.total_items * 100), 2)
        ELSE 0 
    END as progress_percentage,
    dmj.duration_seconds,
    dmj.items_per_second,
    dmj.client_id,
    dmj.campaign_id,
    dmj.created_at,
    dmj.start_time,
    dmj.end_time
FROM data_mining_jobs dmj;

-- Training Dataset Overview
CREATE OR REPLACE VIEW v_training_dataset_overview AS
SELECT 
    td.dataset_id,
    td.name,
    td.dataset_type,
    td.domain,
    td.task,
    td.total_records,
    td.training_records,
    td.validation_records,
    td.test_records,
    td.quality_score,
    td.version,
    td.created_at,
    COUNT(DISTINCT tr.record_id) as actual_record_count,
    AVG(tr.quality_score) as avg_record_quality
FROM training_datasets td
LEFT JOIN training_records tr ON td.dataset_id = tr.dataset_id
GROUP BY td.dataset_id, td.name, td.dataset_type, td.domain, td.task,
         td.total_records, td.training_records, td.validation_records, 
         td.test_records, td.quality_score, td.version, td.created_at;

-- Service Health Dashboard
CREATE OR REPLACE VIEW v_service_health_dashboard AS
SELECT 
    sd.service_id,
    sd.name,
    sd.service_type,
    sd.status as service_status,
    shc.status as health_status,
    shc.response_time_ms,
    shc.cpu_usage_percent,
    shc.memory_usage_mb,
    shc.error_rate,
    shc.checked_at as last_check_at
FROM service_definitions sd
LEFT JOIN LATERAL (
    SELECT * FROM service_health_checks
    WHERE service_id = sd.service_id
    ORDER BY checked_at DESC
    LIMIT 1
) shc ON TRUE
WHERE sd.status = 'active';

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE neural_network_instances IS 'Manages per-client neural network instances with isolated training';
COMMENT ON TABLE neural_network_training_sessions IS 'Tracks individual training runs and their metrics';
COMMENT ON TABLE neural_network_predictions IS 'Stores prediction requests and results with feedback loop';

COMMENT ON TABLE data_mining_jobs IS 'Comprehensive tracking of data mining job lifecycle';
COMMENT ON TABLE data_mining_results IS 'Stores extracted and processed data from mining jobs';
COMMENT ON TABLE data_mining_schedules IS 'Manages recurring mining jobs and schedules';

COMMENT ON TABLE training_datasets IS 'Organizes training data into versioned datasets';
COMMENT ON TABLE training_records IS 'Individual training data records with features and labels';
COMMENT ON TABLE training_metrics IS 'Tracks model training performance metrics over time';

COMMENT ON TABLE service_definitions IS 'Comprehensive service registry with capabilities and dependencies';
COMMENT ON TABLE service_health_checks IS 'Monitors service health and performance metrics';
COMMENT ON TABLE service_logs IS 'Centralized service logging for debugging and monitoring';

COMMENT ON TABLE seeding_strategies IS 'Defines URL seeding algorithms and strategies';
COMMENT ON TABLE seed_quality_metrics IS 'Tracks seed URL quality and performance over time';

COMMENT ON TABLE attribute_templates IS 'Reusable attribute extraction configurations';
COMMENT ON TABLE attribute_extraction_history IS 'Tracks attribute extraction performance and results';

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

DO $$ 
BEGIN 
    RAISE NOTICE '✅ Comprehensive system tables migration completed successfully';
    RAISE NOTICE 'Created tables for:';
    RAISE NOTICE '  - Neural Networks (3 tables)';
    RAISE NOTICE '  - Data Mining (3 tables)';
    RAISE NOTICE '  - Training Data (3 tables)';
    RAISE NOTICE '  - Services (3 tables)';
    RAISE NOTICE '  - Seeding Enhancements (2 tables)';
    RAISE NOTICE '  - Attribute Enhancements (2 tables)';
    RAISE NOTICE 'Total: 16 new tables + 4 views';
END $$;
