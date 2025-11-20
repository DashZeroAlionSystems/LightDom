# Database Tables Analysis and Migration Status

## Overview

This document provides a comprehensive analysis of existing database tables, identifies missing tables that should be created, and provides migration guidance for the LightDom project.

## Current State

### Total Tables in Schema: 424+

The database currently contains 400+ tables across various functional areas including:
- AI/ML systems
- Campaign management
- Crawler orchestration
- SEO workflows
- Agent systems
- Data mining
- Neural networks
- Blockchain integration
- Metaverse features

## Crawler Campaign System Tables

### ✅ Existing Tables (Already Created)

These tables are defined in `database/migrations/crawler-campaign-tables.sql`:

1. **`crawler_campaigns`** ✅
   - Purpose: Campaign configurations and lifecycle management
   - Status: FIXED (migration errors resolved)
   - Location: `database/migrations/crawler-campaign-tables.sql`

2. **`crawler_instances`** ✅
   - Purpose: Individual crawler worker management
   - Status: Created
   - Location: `database/migrations/crawler-campaign-tables.sql`

3. **`crawler_schedules`** ✅
   - Purpose: Automated execution schedules
   - Status: Created
   - Location: `database/migrations/crawler-campaign-tables.sql`

4. **`crawl_targets`** ✅
   - Purpose: URLs to crawl with status tracking
   - Status: FIXED (schema incompatibility resolved with DROP/CREATE pattern)
   - Location: `database/migrations/crawler-campaign-tables.sql`

5. **`crawler_schemas`** ✅
   - Purpose: Data extraction schema definitions
   - Status: Created
   - Location: `database/migrations/crawler-campaign-tables.sql`

6. **`workflow_pipelines`** ✅
   - Purpose: Multi-stage processing workflows
   - Status: Created
   - Location: `database/migrations/crawler-campaign-tables.sql`

7. **`campaign_analytics`** ✅
   - Purpose: Historical analytics and metrics
   - Status: Created
   - Location: `database/migrations/crawler-campaign-tables.sql`

### ⚠️ Related Tables (Different Schema Files)

These crawler-related tables exist in other schema files:

1. **`seo_campaigns`** ✅
   - Location: `database/migrations/create_campaign_management_tables.sql`
   - Purpose: Main SEO campaign records
   - Note: Different from `crawler_campaigns` - more SEO-specific

2. **`campaign_services`** ✅
   - Location: `database/migrations/create_campaign_management_tables.sql`
   - Purpose: Services for campaigns

3. **`campaign_crawlers`** ✅
   - Location: `database/migrations/create_campaign_management_tables.sql`
   - Purpose: Crawler configurations (alternative to `crawler_instances`)

4. **`campaign_seeds`** ✅
   - Location: `database/migrations/create_campaign_management_tables.sql`
   - Purpose: Seed URL management

5. **`campaign_data_streams`** ✅
   - Location: `database/migrations/create_campaign_management_tables.sql`
   - Purpose: Data stream configurations

6. **`seo_mining_results`** ✅
   - Location: `database/migrations/create_campaign_management_tables.sql`
   - Purpose: Extracted SEO data storage

7. **`crawl_results`** ✅
   - Location: `database/133-workflow-processes-tasks.sql`
   - Purpose: Crawl results with SEO metrics

8. **`crawl_queue`** ✅
   - Location: `database/research-pipeline-schema.sql`
   - Purpose: URL queue management

9. **`crawled_sites`** ✅
   - Location: `database/optimization_schema.sql`, `database/metaverse_schema.sql`
   - Purpose: Historical crawl data

10. **`crawler_configurations`** ✅
    - Location: `database/schema-knowledge-graph-codebase.sql`
    - Purpose: Crawler configuration management

11. **`crawled_attributes`** ✅
    - Location: `database/schema-knowledge-graph-codebase.sql`
    - Purpose: Extracted attribute data

## Missing/Recommended Tables

### 🔴 Tables That Should Be Added

Based on the CRAWLER_CAMPAIGN_SYSTEM_README.md and system architecture, consider adding these tables:

#### 1. Campaign Execution History

```sql
CREATE TABLE IF NOT EXISTS campaign_executions (
    id SERIAL PRIMARY KEY,
    campaign_id VARCHAR(255) NOT NULL REFERENCES crawler_campaigns(id) ON DELETE CASCADE,
    execution_type VARCHAR(50) NOT NULL, -- 'manual', 'scheduled', 'api', 'event_driven'
    status VARCHAR(50) DEFAULT 'running', -- 'running', 'completed', 'failed', 'cancelled'
    
    -- Execution metrics
    started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    duration_seconds INTEGER,
    pages_crawled INTEGER DEFAULT 0,
    errors_encountered INTEGER DEFAULT 0,
    
    -- Resource usage
    crawlers_used INTEGER,
    memory_peak_mb INTEGER,
    
    -- Trigger information
    triggered_by VARCHAR(255), -- user_id or 'system'
    trigger_reason TEXT,
    
    -- Results
    result_summary JSONB,
    error_log JSONB,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_executions_campaign ON campaign_executions(campaign_id);
CREATE INDEX idx_executions_status ON campaign_executions(status);
CREATE INDEX idx_executions_started ON campaign_executions(started_at DESC);

COMMENT ON TABLE campaign_executions IS 'Historical record of campaign execution runs';
```

**Rationale:** Tracks individual campaign runs for debugging, analytics, and audit purposes.

#### 2. Crawler Performance Metrics

```sql
CREATE TABLE IF NOT EXISTS crawler_performance_metrics (
    id SERIAL PRIMARY KEY,
    crawler_id VARCHAR(255) NOT NULL REFERENCES crawler_instances(id) ON DELETE CASCADE,
    campaign_id VARCHAR(255) REFERENCES crawler_campaigns(id) ON DELETE CASCADE,
    
    -- Time-series metrics
    recorded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Performance metrics
    pages_per_second DECIMAL(10, 4),
    average_response_time_ms INTEGER,
    success_rate DECIMAL(5, 2),
    error_rate DECIMAL(5, 2),
    
    -- Resource metrics
    cpu_usage_percent DECIMAL(5, 2),
    memory_usage_mb INTEGER,
    
    -- Queue metrics
    queue_size INTEGER,
    processed_count INTEGER,
    pending_count INTEGER,
    
    -- Network metrics
    bandwidth_mbps DECIMAL(10, 2),
    requests_per_minute INTEGER
);

CREATE INDEX idx_metrics_crawler ON crawler_performance_metrics(crawler_id);
CREATE INDEX idx_metrics_recorded ON crawler_performance_metrics(recorded_at DESC);
CREATE INDEX idx_metrics_campaign_time ON crawler_performance_metrics(campaign_id, recorded_at DESC);

COMMENT ON TABLE crawler_performance_metrics IS 'Time-series performance data for crawler instances';
```

**Rationale:** Enables real-time monitoring and historical performance analysis.

#### 3. Campaign Errors and Warnings

```sql
CREATE TABLE IF NOT EXISTS campaign_errors (
    id SERIAL PRIMARY KEY,
    campaign_id VARCHAR(255) NOT NULL REFERENCES crawler_campaigns(id) ON DELETE CASCADE,
    crawler_id VARCHAR(255) REFERENCES crawler_instances(id) ON DELETE SET NULL,
    
    -- Error details
    error_type VARCHAR(100) NOT NULL, -- 'network', 'parsing', 'validation', 'timeout', 'robot_blocked'
    severity VARCHAR(20) DEFAULT 'error', -- 'info', 'warning', 'error', 'critical'
    error_code VARCHAR(50),
    error_message TEXT NOT NULL,
    error_stack TEXT,
    
    -- Context
    url TEXT,
    http_status_code INTEGER,
    retry_count INTEGER DEFAULT 0,
    
    -- Resolution
    resolved BOOLEAN DEFAULT false,
    resolved_at TIMESTAMP,
    resolution_notes TEXT,
    
    occurred_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_errors_campaign ON campaign_errors(campaign_id);
CREATE INDEX idx_errors_severity ON campaign_errors(severity);
CREATE INDEX idx_errors_type ON campaign_errors(error_type);
CREATE INDEX idx_errors_unresolved ON campaign_errors(resolved) WHERE resolved = false;
CREATE INDEX idx_errors_occurred ON campaign_errors(occurred_at DESC);

COMMENT ON TABLE campaign_errors IS 'Error and warning tracking for campaign debugging';
```

**Rationale:** Centralized error tracking for debugging and quality monitoring.

#### 4. URL Discovery Log

```sql
CREATE TABLE IF NOT EXISTS url_discovery_log (
    id SERIAL PRIMARY KEY,
    campaign_id VARCHAR(255) NOT NULL REFERENCES crawler_campaigns(id) ON DELETE CASCADE,
    
    -- Discovery details
    discovered_url TEXT NOT NULL,
    source_url TEXT NOT NULL,
    discovery_method VARCHAR(50), -- 'link', 'sitemap', 'api', 'seed'
    
    -- URL analysis
    url_depth INTEGER DEFAULT 0,
    is_internal BOOLEAN DEFAULT true,
    url_hash VARCHAR(64), -- MD5 or SHA hash for deduplication
    
    -- Decision
    should_crawl BOOLEAN DEFAULT true,
    skip_reason VARCHAR(100), -- 'duplicate', 'depth_limit', 'excluded_pattern', 'robots_txt'
    priority_score INTEGER DEFAULT 5,
    
    discovered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_discovery_campaign ON url_discovery_log(campaign_id);
CREATE INDEX idx_discovery_hash ON url_discovery_log(url_hash);
CREATE INDEX idx_discovery_discovered ON url_discovery_log(discovered_at DESC);

COMMENT ON TABLE url_discovery_log IS 'Log of discovered URLs and crawl decisions';
```

**Rationale:** Tracks URL discovery for crawl optimization and debugging.

#### 5. Schema Evolution History

```sql
CREATE TABLE IF NOT EXISTS crawler_schema_versions (
    id SERIAL PRIMARY KEY,
    schema_id INTEGER NOT NULL REFERENCES crawler_schemas(id) ON DELETE CASCADE,
    version VARCHAR(20) NOT NULL,
    
    -- Schema definition
    attributes JSONB NOT NULL,
    linked_schemas JSONB,
    
    -- Change tracking
    changed_by VARCHAR(255),
    change_description TEXT,
    change_type VARCHAR(50), -- 'creation', 'minor_update', 'major_update', 'deprecation'
    
    -- Validation
    is_active BOOLEAN DEFAULT true,
    validation_status VARCHAR(50), -- 'draft', 'testing', 'production', 'deprecated'
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_schema_versions_schema ON crawler_schema_versions(schema_id);
CREATE INDEX idx_schema_versions_active ON crawler_schema_versions(is_active);
CREATE INDEX idx_schema_versions_created ON crawler_schema_versions(created_at DESC);

COMMENT ON TABLE crawler_schema_versions IS 'Version history for data extraction schemas';
```

**Rationale:** Tracks schema evolution and allows rolling back to previous versions.

## Migration Priority

### High Priority ✅ (Completed)

1. ✅ **Fix `crawler-campaign-tables.sql` errors** - COMPLETED
   - Fixed `url(255)` syntax error
   - Fixed missing column errors with DROP/CREATE pattern
   - Migration now runs successfully

### Medium Priority 📋 (Recommended)

1. **Create `campaign_executions` table** - Track campaign runs
2. **Create `crawler_performance_metrics` table** - Real-time monitoring
3. **Create `campaign_errors` table** - Error tracking and debugging

### Low Priority 📌 (Nice to Have)

1. **Create `url_discovery_log` table** - URL discovery tracking
2. **Create `crawler_schema_versions` table** - Schema versioning

## Migration File Organization

### Current Structure

```
database/
├── migrations/
│   ├── crawler-campaign-tables.sql          ✅ Fixed
│   ├── create_campaign_management_tables.sql ✅ Exists
│   ├── create_seo_workflow_tables.sql        ✅ Exists
│   └── [400+ other tables...]
├── campaign-management-schema.sql            ✅ Exists
└── [other schema files...]
```

### Recommended: Consolidation Strategy

Consider consolidating crawler-related tables:

1. **Option A: Keep Separate** (Current Approach)
   - Pros: Modular, easier to manage individual migrations
   - Cons: Harder to see full picture, potential duplication

2. **Option B: Create Unified Migration** (Recommended for New Tables)
   - Create: `database/migrations/20251118_crawler_system_enhancements.sql`
   - Include: All 5 new recommended tables
   - Benefit: Single file for related functionality

## Implementation Plan

### Phase 1: Documentation (✅ Completed)

- [x] Create `DATABASE_MIGRATION_RULES.md`
- [x] Document existing tables
- [x] Identify missing tables
- [x] Create this analysis document

### Phase 2: High-Priority Migrations (✅ Completed)

- [x] Fix `crawler-campaign-tables.sql` errors
- [x] Test migration on clean database
- [x] Test migration on existing database (idempotency)
- [x] Verify all tables and indexes created correctly

### Phase 3: Enhancement Migrations (Recommended Next Steps)

- [ ] Create `20251118_crawler_system_enhancements.sql` with:
  - [ ] `campaign_executions` table
  - [ ] `crawler_performance_metrics` table
  - [ ] `campaign_errors` table
  - [ ] `url_discovery_log` table
  - [ ] `crawler_schema_versions` table

- [ ] Add to .cursorrules:
  - [ ] Link to `DATABASE_MIGRATION_RULES.md`
  - [ ] Reference this document for table status

### Phase 4: Testing and Validation

- [ ] Test new migrations on clean database
- [ ] Test idempotency
- [ ] Create example data insertion scripts
- [ ] Update API endpoints for new tables
- [ ] Update documentation

## Schema Relationships

```
crawler_campaigns (1) ──→ (N) crawler_instances
       │                        │
       │                        │
       ├──→ (N) crawler_schedules
       ├──→ (N) crawl_targets
       ├──→ (N) campaign_analytics
       ├──→ (N) campaign_executions     [NEW - Recommended]
       ├──→ (N) campaign_errors         [NEW - Recommended]
       └──→ (N) url_discovery_log       [NEW - Recommended]

crawler_instances (1) ──→ (N) crawler_performance_metrics [NEW - Recommended]

crawler_schemas (1) ──→ (N) crawler_schema_versions [NEW - Recommended]

workflow_pipelines [Standalone with JSONB relationships]
```

## Integration with API

### Existing API Endpoints

Located in `api-server-express.js`:

- `GET /api/crawler/campaigns` - List campaigns
- `POST /api/crawler/campaigns` - Create campaign
- `GET /api/crawler/campaigns/:id` - Get campaign
- `POST /api/crawler/campaigns/:id/start` - Start campaign
- `POST /api/crawler/campaigns/:id/stop` - Stop campaign

### Recommended New Endpoints (After Phase 3)

- `GET /api/crawler/campaigns/:id/executions` - Execution history
- `GET /api/crawler/campaigns/:id/errors` - Error log
- `GET /api/crawler/instances/:id/metrics` - Performance metrics
- `GET /api/crawler/campaigns/:id/discovered-urls` - URL discovery log
- `GET /api/crawler/schemas/:id/versions` - Schema versions

## Testing Strategy

### Migration Testing

1. **Clean Database Test**
   ```bash
   createdb test_lightdom
   psql -d test_lightdom -f database/migrations/crawler-campaign-tables.sql
   # Verify: No errors
   ```

2. **Idempotency Test**
   ```bash
   psql -d test_lightdom -f database/migrations/crawler-campaign-tables.sql
   # Verify: No errors on second run
   ```

3. **Data Insertion Test**
   ```bash
   psql -d test_lightdom -c "INSERT INTO crawler_campaigns (...) VALUES (...);"
   # Verify: Can insert data successfully
   ```

### Integration Testing

1. Test API endpoints with new tables
2. Verify foreign key constraints work
3. Test CASCADE deletes
4. Verify triggers update timestamps

## Monitoring and Maintenance

### Regular Tasks

1. **Weekly**: Check for new table requirements in feature branches
2. **Monthly**: Review migration execution logs
3. **Quarterly**: Audit table usage and optimize indexes
4. **Yearly**: Consider table archival for historical data

### Performance Monitoring

1. Monitor query performance on new tables
2. Add indexes as needed based on query patterns
3. Consider partitioning for large time-series tables
4. Archive old data from analytics tables

## Rollback Procedures

### If Migration Fails

```bash
# For tables with DROP TABLE
# Restore from backup if needed
pg_restore -d dom_space_harvester backup_file.sql

# For tables with IF NOT EXISTS
# Simply fix the SQL and re-run
```

### Rollback Script Template

Create alongside each migration:

```sql
-- Rollback for 20251118_crawler_system_enhancements.sql
DROP TABLE IF EXISTS campaign_executions CASCADE;
DROP TABLE IF EXISTS crawler_performance_metrics CASCADE;
DROP TABLE IF EXISTS campaign_errors CASCADE;
DROP TABLE IF EXISTS url_discovery_log CASCADE;
DROP TABLE IF EXISTS crawler_schema_versions CASCADE;
```

## Related Documentation

- [Database Migration Rules](DATABASE_MIGRATION_RULES.md) - Comprehensive migration guidelines
- [Crawler Campaign System README](CRAWLER_CAMPAIGN_SYSTEM_README.md) - System architecture
- [Database Migration Summary](DATABASE_MIGRATION_SUMMARY.md) - Auto-CRUD documentation
- [Comprehensive System Tables Guide](COMPREHENSIVE_SYSTEM_TABLES_MIGRATION_GUIDE.md) - Full table reference

## Conclusion

The LightDom database schema is comprehensive with 400+ tables covering all major functionality. The recent fix to `crawler-campaign-tables.sql` resolves all migration errors. The recommended Phase 3 enhancements would add 5 new tables to improve monitoring, debugging, and analytics capabilities for the crawler campaign system.

**Current Status:** ✅ All existing crawler campaign tables are functional and migrations run successfully.

**Next Steps:** Consider implementing Phase 3 enhancements based on operational needs and monitoring requirements.

---

**Last Updated:** 2025-11-18
**Version:** 1.0.0
