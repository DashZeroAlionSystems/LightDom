# Comprehensive System Tables Migration Guide

## Overview

This migration creates a complete database schema for neural networks, data mining, training data, services, seeding, and attributes. It includes 16 new tables, comprehensive indexes, triggers for automatic updates, and 4 views for common queries.

## 🎯 Purpose

The system was missing dedicated database tables for several core functionalities:

1. **Neural Networks** - Per-client neural network instance management
2. **Data Mining** - Comprehensive job tracking and result storage
3. **Training Data** - Dataset organization and training metrics
4. **Services** - Service registry and health monitoring
5. **Seeding** - Advanced URL seeding strategies and quality tracking
6. **Attributes** - Reusable attribute templates and extraction history

## 📋 Tables Created

### Neural Network Tables (3)

#### `neural_network_instances`
Manages per-client neural network instances with isolated training.

**Key Fields:**
- `instance_id` - Unique instance identifier
- `client_id` - Client owning this instance
- `model_type` - Type: classification, regression, timeseries, nlp, cv, custom
- `status` - Current status: initializing, training, ready, predicting, etc.
- `training_config` - Training parameters (epochs, batch size, learning rate)
- `data_config` - Data source and isolation settings
- `architecture` - Model architecture definition
- `performance` - Performance metrics (accuracy, loss, etc.)

**Use Cases:**
- Create isolated neural network instances per client
- Track model versions and configurations
- Monitor training progress and performance
- Deploy models with specific configurations

#### `neural_network_training_sessions`
Tracks individual training runs with detailed metrics.

**Key Fields:**
- `session_id` - Unique session identifier
- `instance_id` - Reference to neural network instance
- `epochs_planned` / `epochs_completed` - Training progress
- `training_metrics` - Array of per-epoch metrics
- `best_epoch` / `best_loss` / `best_accuracy` - Best performance
- `training_time_seconds` - Total training time
- `gpu_utilized` - Whether GPU was used

**Use Cases:**
- Track training progress in real-time
- Compare training sessions
- Identify best performing epochs
- Analyze training efficiency

#### `neural_network_predictions`
Stores prediction requests and results with feedback loop.

**Key Fields:**
- `prediction_id` - Unique prediction identifier
- `instance_id` - Reference to neural network instance
- `input_features` - Input data for prediction
- `prediction_result` - Predicted output
- `confidence` - Prediction confidence score
- `actual_result` - Actual outcome (for feedback)
- `is_correct` - Whether prediction was correct
- `feedback_score` - Human feedback rating

**Use Cases:**
- Store prediction history
- Enable feedback loops for model improvement
- Track prediction accuracy over time
- Deduplicate predictions based on input hash

### Data Mining Tables (3)

#### `data_mining_jobs`
Comprehensive tracking of data mining job lifecycle.

**Key Fields:**
- `job_id` - Unique job identifier
- `job_type` - Type: web_scraping, api_extraction, database_mining, etc.
- `status` - Current status with full lifecycle tracking
- `source_config` - Source configuration (URL, API endpoint, etc.)
- `extraction_config` - Selectors, extractors, filters
- `processing_config` - Cleaning, validation, enrichment rules
- `output_config` - Destination and storage settings
- `schedule_config` - Schedule configuration
- Progress tracking: `total_items`, `processed_items`, `successful_items`, `failed_items`
- Performance: `duration_seconds`, `items_per_second`

**Use Cases:**
- Create and manage data mining jobs
- Track job progress in real-time
- Monitor performance metrics
- Handle retries and error recovery

#### `data_mining_results`
Stores extracted and processed data with quality metrics.

**Key Fields:**
- `result_id` - Unique result identifier
- `job_id` - Reference to mining job
- `source_url` - Source of the data
- `raw_data` - Raw extracted data
- `processed_data` - Cleaned and processed data
- `extraction_quality` - Quality score (0.0 to 1.0)
- `data_completeness` - Completeness score
- `validation_passed` - Validation status
- `validation_errors` - Array of validation errors

**Use Cases:**
- Store extracted data with quality metrics
- Enable data validation and filtering
- Track extraction quality over time
- Categorize and tag extracted data

#### `data_mining_schedules`
Manages recurring mining jobs with schedule configuration.

**Key Fields:**
- `schedule_id` - Unique schedule identifier
- `job_template_id` - Reference to job template
- `schedule_type` - Type: once, interval, cron, event_driven
- `cron_expression` - Cron schedule
- `interval_minutes/hours/days` - Interval schedule
- `enabled` - Whether schedule is active
- `last_run_at` / `next_run_at` - Execution tracking
- `consecutive_failures` - Error tracking
- `pause_on_failure` - Auto-pause on errors

**Use Cases:**
- Schedule recurring mining jobs
- Track execution history
- Handle failures gracefully
- Manage job frequency and timing

### Training Data Tables (3)

#### `training_datasets`
Organizes training data into versioned datasets.

**Key Fields:**
- `dataset_id` - Unique dataset identifier
- `dataset_type` - Type: classification, regression, timeseries, etc.
- `domain` - Domain: seo, ecommerce, nlp, cv
- `task` - Specific task: sentiment_analysis, price_prediction
- `features_schema` / `labels_schema` - Data schemas
- Dataset statistics: `total_records`, `training_records`, `validation_records`, `test_records`
- Quality metrics: `quality_score`, `completeness`, `balance_score`
- `split_config` - Train/validation/test split configuration
- `version` - Dataset version for version control

**Use Cases:**
- Organize training data by domain and task
- Track dataset quality and statistics
- Version control for datasets
- Manage data splits for training

#### `training_records`
Individual training data records with features and labels.

**Key Fields:**
- `record_id` - Unique record identifier
- `dataset_id` - Reference to dataset
- `split_type` - Split: train, validation, test, holdout
- `features` - Feature values
- `labels` - Label values
- `raw_features` / `engineered_features` - Feature engineering
- `feature_vector` - Normalized/vectorized features
- `quality_score` - Record quality
- `is_outlier` / `is_synthetic` - Data flags
- `sample_weight` - Weight for imbalanced datasets

**Use Cases:**
- Store individual training records
- Track feature engineering transformations
- Handle imbalanced datasets with weights
- Mark outliers and synthetic data

#### `training_metrics`
Tracks model training performance metrics over time.

**Key Fields:**
- `metric_id` - Unique metric identifier
- `session_id` - Reference to training session
- `dataset_id` - Reference to dataset
- `metric_type` - Type: loss, accuracy, precision, recall, f1, mse, mae, r2, auc
- `epoch` / `step` - Training progress
- `value` - Metric value
- `phase` - Phase: training, validation, test

**Use Cases:**
- Track metrics during training
- Compare training vs validation performance
- Identify overfitting or underfitting
- Analyze learning curves

### Service Tables (3)

#### `service_definitions`
Comprehensive service registry with capabilities and dependencies.

**Key Fields:**
- `service_id` - Unique service identifier
- `service_type` - Type: crawler, neural_network, data_mining, api, worker, scheduler, monitor
- `category` - Category: seo, analytics, ml, automation, infrastructure
- `configuration` / `default_config` - Service configuration
- `deployment_type` - Type: internal, docker, kubernetes, serverless, external
- `endpoint_url` / `health_check_url` - Service endpoints
- `capabilities` - Array of service capabilities
- `supported_operations` - Array of supported operations
- `dependencies` - Array of service dependencies
- `resource_requirements` - CPU, memory, disk requirements

**Use Cases:**
- Register and manage services
- Track service dependencies
- Monitor service capabilities
- Manage service configurations

#### `service_health_checks`
Monitors service health and performance metrics.

**Key Fields:**
- `check_id` - Unique check identifier
- `service_id` - Reference to service
- `status` - Status: healthy, degraded, unhealthy, unknown
- Health metrics: `response_time_ms`, `cpu_usage_percent`, `memory_usage_mb`, `disk_usage_percent`
- `active_connections`, `error_rate`, `throughput_rps`
- `error_message` / `warnings` - Error information

**Use Cases:**
- Monitor service health in real-time
- Track performance metrics
- Alert on service degradation
- Analyze service reliability

#### `service_logs`
Centralized service logging for debugging and monitoring.

**Key Fields:**
- `log_id` - Unique log identifier
- `service_id` - Reference to service
- `level` - Level: debug, info, warn, error, fatal
- `message` / `details` - Log content
- `request_id` / `user_id` / `session_id` - Context
- `error_code` / `error_stack` - Error information
- `source_file` / `source_line` / `source_function` - Source location

**Use Cases:**
- Centralized logging for all services
- Debug service issues
- Track error patterns
- Analyze service behavior

### Seeding Tables (2)

#### `seeding_strategies`
Defines URL seeding algorithms and strategies.

**Key Fields:**
- `strategy_id` - Unique strategy identifier
- `strategy_type` - Type: breadth_first, depth_first, priority, smart, neural, custom
- `algorithm_config` - Algorithm configuration
- `url_scoring_rules` / `priority_rules` - Scoring and priority rules
- Constraints: `max_depth`, `max_urls_per_domain`, `rate_limit_ms`
- `url_filters` / `domain_filters` - Filter rules
- `avg_quality_score` / `success_rate` - Performance metrics

**Use Cases:**
- Define custom seeding algorithms
- Optimize crawling strategies
- Filter and score URLs intelligently
- Track strategy performance

#### `seed_quality_metrics`
Tracks seed URL quality and performance over time.

**Key Fields:**
- `metric_id` - Unique metric identifier
- `seed_id` - Reference to url_seeds table
- Quality scores: `overall_quality`, `content_quality`, `relevance_score`, `freshness_score`, `authority_score`
- Performance: `avg_response_time_ms`, `success_rate`, `error_rate`
- Harvest metrics: `total_crawls`, `successful_crawls`, `data_points_extracted`
- Value metrics: `conversion_rate`, `roi_score`

**Use Cases:**
- Track URL quality over time
- Identify high-value URLs
- Optimize seeding strategies
- Calculate ROI for seed URLs

### Attribute Tables (2)

#### `attribute_templates`
Reusable attribute extraction configurations.

**Key Fields:**
- `template_id` - Unique template identifier
- `attribute_type` - Type: seo, content, technical, performance, business, custom
- `extraction_template` - Extraction configuration
- `validation_template` - Validation rules
- `enrichment_template` - Enrichment configuration
- `default_config` - Default values
- `usage_count` / `success_rate` - Usage statistics

**Use Cases:**
- Create reusable attribute templates
- Standardize extraction patterns
- Share templates across projects
- Track template effectiveness

#### `attribute_extraction_history`
Tracks attribute extraction performance and results.

**Key Fields:**
- `history_id` - Unique history identifier
- `attribute_id` - Reference to stream_attributes
- `source_url` - Source URL
- `extraction_method` - Method used
- `extracted_value` - Extracted value
- `confidence_score` - Confidence in extraction
- `validation_passed` - Validation status
- `extraction_time_ms` - Performance metric

**Use Cases:**
- Track extraction performance
- Analyze confidence scores
- Debug extraction issues
- Optimize extraction methods

## 🔄 Triggers and Automation

### Update Triggers
All tables have `updated_at` triggers that automatically update the timestamp on row modification.

### Dataset Statistics Trigger
`update_dataset_statistics()` - Automatically updates training dataset statistics when records are added/removed:
- `total_records`
- `training_records`
- `validation_records`
- `test_records`

### Mining Job Progress Trigger
`update_mining_job_progress()` - Automatically updates data mining job progress when results are stored:
- `processed_items`
- `successful_items`
- `failed_items`

## 📊 Views

### `v_active_neural_networks`
Summary of active neural network instances with counts of training sessions and predictions.

### `v_mining_job_summary`
Summary of data mining jobs with progress percentage and performance metrics.

### `v_training_dataset_overview`
Overview of training datasets with actual record counts and average quality.

### `v_service_health_dashboard`
Real-time service health dashboard with latest health check results.

## 🚀 Running the Migration

### Option 1: Using the Migration Runner

```bash
# Check current migration status
npm run db:migrate:check

# Run all pending migrations
npm run db:migrate:all

# List all migrations with status
npm run db:migrate:list
```

### Option 2: Using psql directly

```bash
psql -U postgres -d dom_space_harvester -f migrations/20251116_comprehensive_system_tables.sql
```

### Option 3: Using the migrate script

```bash
node scripts/run-all-migrations.js migrate
```

## 📝 Post-Migration Setup

### 1. Verify Tables Were Created

```sql
-- Check if tables exist
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename LIKE 'neural_network_%' 
OR tablename LIKE 'data_mining_%'
OR tablename LIKE 'training_%'
OR tablename LIKE 'service_%'
OR tablename LIKE 'seeding_%'
OR tablename LIKE 'attribute_%';
```

### 2. Check Views

```sql
-- Check if views exist
SELECT viewname FROM pg_views 
WHERE schemaname = 'public'
AND viewname LIKE 'v_%';
```

### 3. Verify Triggers

```sql
-- Check triggers
SELECT trigger_name, event_object_table 
FROM information_schema.triggers 
WHERE trigger_schema = 'public';
```

## 🔌 Integrating with API Server

### Auto-Generated CRUD Routes

The system includes an auto-CRUD generator that creates REST APIs for all tables.

**See:** `examples/auto-crud-integration-examples.js` for integration examples.

### Basic Integration

```javascript
import { createAutoGeneratedCrudRoutes } from './services/auto-crud-integration.js';

// In your API server setup
const autoCrudRouter = createAutoGeneratedCrudRoutes(dbPool);
app.use('/api/auto', autoCrudRouter);
```

### Generated Endpoints

Each table gets full CRUD operations:

- `POST   /api/auto/{base_path}` - Create
- `GET    /api/auto/{base_path}` - List (with pagination, filtering, sorting, search)
- `GET    /api/auto/{base_path}/:id` - Get by ID
- `PUT    /api/auto/{base_path}/:id` - Update
- `PATCH  /api/auto/{base_path}/:id` - Partial update
- `DELETE /api/auto/{base_path}/:id` - Delete
- `POST   /api/auto/{base_path}/bulk` - Bulk create

### Example Endpoints

```
/api/auto/neural-networks/instances
/api/auto/neural-networks/training-sessions
/api/auto/neural-networks/predictions
/api/auto/data-mining/jobs
/api/auto/data-mining/results
/api/auto/data-mining/schedules
/api/auto/training/datasets
/api/auto/training/records
/api/auto/training/metrics
/api/auto/services/definitions
/api/auto/services/health-checks
/api/auto/services/logs
/api/auto/seeding/strategies
/api/auto/seeding/quality-metrics
/api/auto/attributes/templates
/api/auto/attributes/extraction-history
```

## 🧪 Testing

### Test Neural Network Instance Creation

```bash
curl -X POST http://localhost:3001/api/auto/neural-networks/instances \
  -H "Content-Type: application/json" \
  -d '{
    "instance_id": "nn-test-001",
    "client_id": "client-123",
    "name": "Test Neural Network",
    "model_type": "classification"
  }'
```

### Test Data Mining Job Creation

```bash
curl -X POST http://localhost:3001/api/auto/data-mining/jobs \
  -H "Content-Type: application/json" \
  -d '{
    "job_id": "mining-test-001",
    "name": "Test Mining Job",
    "job_type": "web_scraping",
    "source_config": {"url": "https://example.com"}
  }'
```

### Test Training Dataset Creation

```bash
curl -X POST http://localhost:3001/api/auto/training/datasets \
  -H "Content-Type: application/json" \
  -d '{
    "dataset_id": "dataset-test-001",
    "name": "Test Dataset",
    "dataset_type": "classification",
    "domain": "seo"
  }'
```

## 📚 Additional Resources

- **Migration Script**: `migrations/20251116_comprehensive_system_tables.sql`
- **Migration Runner**: `scripts/run-all-migrations.js`
- **Auto-CRUD Generator**: `services/enhanced-auto-crud-generator.js`
- **Integration Module**: `services/auto-crud-integration.js`
- **Integration Examples**: `examples/auto-crud-integration-examples.js`

## 🐛 Troubleshooting

### Migration Fails with "relation already exists"

This is normal if tables already exist. The migration uses `IF NOT EXISTS` so it's safe to run multiple times.

### Cannot connect to database

Check your `.env` file:
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=dom_space_harvester
DB_USER=postgres
DB_PASSWORD=postgres
```

### Auto-CRUD routes not appearing

1. Ensure migrations have been run
2. Check database connection in API server
3. Verify the integration code is uncommented
4. Check server logs for errors

## 📈 Benefits

1. **Comprehensive Data Model** - Complete schema for all core functionality
2. **Automated CRUD APIs** - Instant REST APIs for all tables
3. **Performance Optimized** - Indexes on all common query patterns
4. **Relationship Tracking** - Foreign keys maintain data integrity
5. **Automatic Updates** - Triggers keep timestamps and stats current
6. **Quality Tracking** - Built-in quality metrics for data and processes
7. **Version Control** - Support for dataset and model versioning
8. **Scalable** - Designed to handle large volumes of data
9. **Developer Friendly** - Clear naming and comprehensive documentation
10. **Production Ready** - Includes monitoring, logging, and health checks

## 🎯 Next Steps

1. Run the migration: `npm run db:migrate:all`
2. Integrate auto-CRUD routes in API server
3. Test endpoints with sample data
4. Update frontend to use new APIs
5. Add custom business logic as needed
6. Implement authentication and authorization
7. Set up monitoring dashboards
8. Configure backup and recovery
