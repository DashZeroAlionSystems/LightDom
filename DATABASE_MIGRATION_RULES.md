# Database Migration Rules and Best Practices

## Overview

This document defines the standardized process for creating, managing, and executing database migrations in the LightDom project. Following these rules ensures consistency, reliability, and maintainability of the database schema.

## Migration File Structure

### Naming Convention

Migration files must follow this naming pattern:

```
database/migrations/YYYYMMDD_descriptive_name.sql
```

**Examples:**
- `database/migrations/20251118_crawler_campaign_tables.sql`
- `database/migrations/20251118_add_user_preferences.sql`
- `database/migrations/20251118_fix_foreign_keys.sql`

### File Location

- **Primary migrations**: `database/migrations/`
- **Schema definitions**: `database/` (for reference, not for direct execution)
- **Legacy migrations**: Keep in place but document migration status

## SQL Script Standards

### 1. Idempotency Rules

**ALL migration scripts MUST be idempotent** (safe to run multiple times).

#### For Creating Tables

✅ **CORRECT - Use IF NOT EXISTS:**
```sql
CREATE TABLE IF NOT EXISTS my_table (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);
```

❌ **INCORRECT - Will fail on re-run:**
```sql
CREATE TABLE my_table (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);
```

#### Exception: Schema Replacement

When replacing an incompatible table structure:

```sql
-- Drop existing table if it exists with incompatible schema
DROP TABLE IF EXISTS my_table CASCADE;

CREATE TABLE my_table (
    id SERIAL PRIMARY KEY,
    new_column VARCHAR(255) NOT NULL
);
```

**⚠️ WARNING:** Use `DROP TABLE` only when:
- The table structure is fundamentally incompatible
- Data can be regenerated or is not critical
- This is documented in the migration file
- You've considered using `ALTER TABLE` instead

### 2. Index Creation

**Use IF NOT EXISTS for indexes:**

```sql
CREATE INDEX IF NOT EXISTS idx_table_column ON my_table(column_name);
```

**For functional indexes, be careful with PostgreSQL syntax:**

❌ **INCORRECT - MySQL style:**
```sql
CREATE INDEX idx_url ON my_table(url(255));
```

✅ **CORRECT - PostgreSQL style:**
```sql
-- For full column
CREATE INDEX idx_url ON my_table(url);

-- For substring (if needed)
CREATE INDEX idx_url_prefix ON my_table(SUBSTRING(url, 1, 255));

-- For text search
CREATE INDEX idx_url_text ON my_table USING GIN (to_tsvector('english', url));
```

### 3. Foreign Key Constraints

**Always specify ON DELETE and ON UPDATE behavior:**

```sql
CREATE TABLE IF NOT EXISTS child_table (
    id SERIAL PRIMARY KEY,
    parent_id VARCHAR(255) NOT NULL,
    
    FOREIGN KEY (parent_id) 
        REFERENCES parent_table(id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE
);
```

**Common behaviors:**
- `ON DELETE CASCADE` - Delete child records when parent is deleted
- `ON DELETE SET NULL` - Set child foreign key to NULL
- `ON DELETE RESTRICT` - Prevent deletion if children exist
- `ON DELETE NO ACTION` - Similar to RESTRICT (default)

### 4. Default Values

**Use appropriate defaults:**

```sql
CREATE TABLE IF NOT EXISTS my_table (
    id SERIAL PRIMARY KEY,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    config JSONB DEFAULT '{}'::jsonb,
    tags JSONB DEFAULT '[]'::jsonb,
    count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true
);
```

### 5. Triggers for Auto-Updates

**Create triggers for automatic timestamp updates:**

```sql
-- Create or replace the trigger function (once per database)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to each table
CREATE TRIGGER update_my_table_updated_at
    BEFORE UPDATE ON my_table
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

### 6. Comments and Documentation

**Add comments to tables and columns:**

```sql
COMMENT ON TABLE my_table IS 'Stores user preferences and settings';
COMMENT ON COLUMN my_table.status IS 'Current status: pending, active, completed, failed';
```

## Migration Script Template

Use this template for new migrations:

```sql
/**
 * Database Migration: [Description]
 * 
 * Purpose: [What this migration does]
 * Date: [YYYY-MM-DD]
 * Author: [Name or GitHub handle]
 * 
 * Dependencies:
 * - Requires: [List any required tables/schemas]
 * - Creates: [List tables/indexes/triggers created]
 * 
 * Notes:
 * - [Any special considerations]
 * - [Data migration steps if applicable]
 */

-- ============================================================================
-- [Section Name - e.g., "User Tables"]
-- ============================================================================

CREATE TABLE IF NOT EXISTS my_table (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_my_table_name ON my_table(name);

-- ============================================================================
-- Triggers
-- ============================================================================

CREATE TRIGGER update_my_table_updated_at
    BEFORE UPDATE ON my_table
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Comments
-- ============================================================================

COMMENT ON TABLE my_table IS 'Description of table purpose';
```

## Running Migrations

### Method 1: Using psql (Direct)

```bash
psql -U postgres -d dom_space_harvester -f database/migrations/YYYYMMDD_migration_name.sql
```

### Method 2: Using npm scripts

```bash
# Run specific migration
npm run db:migrate:file -- database/migrations/YYYYMMDD_migration_name.sql

# Run all pending migrations
npm run db:migrate:all

# Check migration status
npm run db:migrate:status
```

### Method 3: Using CLI tool

```bash
# Run migrations
npm run cli db migrate

# Check status
npm run cli db status
```

## Migration Checklist

Before committing a migration:

- [ ] File follows naming convention `YYYYMMDD_descriptive_name.sql`
- [ ] Script is idempotent (can run multiple times)
- [ ] Uses `CREATE TABLE IF NOT EXISTS`
- [ ] Uses `CREATE INDEX IF NOT EXISTS`
- [ ] Foreign keys have ON DELETE/UPDATE clauses
- [ ] Timestamps have DEFAULT CURRENT_TIMESTAMP
- [ ] Tables have updated_at triggers
- [ ] Tables and columns have COMMENT documentation
- [ ] Script has been tested on clean database
- [ ] Script has been tested on existing database (idempotency)
- [ ] No MySQL-specific syntax (use PostgreSQL syntax)
- [ ] Proper indexes on foreign keys and commonly queried columns
- [ ] JSONB columns have proper default values (`'{}'::jsonb` or `'[]'::jsonb`)

## Common PostgreSQL vs MySQL Differences

### Index Creation

| MySQL | PostgreSQL |
|-------|-----------|
| `url(255)` | `url` (or use SUBSTRING) |
| `FULLTEXT INDEX` | `CREATE INDEX ... USING GIN (to_tsvector(...))` |

### Data Types

| MySQL | PostgreSQL |
|-------|-----------|
| `TEXT` | `TEXT` (same) |
| `VARCHAR(n)` | `VARCHAR(n)` (same) |
| `INT` | `INTEGER` or `INT` (same) |
| `DATETIME` | `TIMESTAMP` |
| `JSON` | `JSONB` (binary, faster) |

### Auto-increment

| MySQL | PostgreSQL |
|-------|-----------|
| `INT AUTO_INCREMENT` | `SERIAL` or `BIGSERIAL` |
| `id INT AUTO_INCREMENT PRIMARY KEY` | `id SERIAL PRIMARY KEY` |

## Handling Schema Changes

### Adding Columns

```sql
-- Add new column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'my_table' AND column_name = 'new_column'
    ) THEN
        ALTER TABLE my_table ADD COLUMN new_column VARCHAR(255);
    END IF;
END $$;
```

### Modifying Columns

```sql
-- Change column type
ALTER TABLE my_table ALTER COLUMN my_column TYPE VARCHAR(500);

-- Add NOT NULL constraint (ensure no NULL values first)
UPDATE my_table SET my_column = 'default' WHERE my_column IS NULL;
ALTER TABLE my_table ALTER COLUMN my_column SET NOT NULL;

-- Remove NOT NULL constraint
ALTER TABLE my_table ALTER COLUMN my_column DROP NOT NULL;
```

### Dropping Columns

```sql
-- Drop column if it exists
ALTER TABLE my_table DROP COLUMN IF EXISTS old_column;
```

## Data Migration

When migrating data, use transactions:

```sql
BEGIN;

-- Create new table
CREATE TABLE IF NOT EXISTS new_table (
    id SERIAL PRIMARY KEY,
    data JSONB
);

-- Migrate data
INSERT INTO new_table (id, data)
SELECT id, old_column::jsonb FROM old_table
ON CONFLICT (id) DO NOTHING;

-- Verify data
DO $$
DECLARE
    old_count INTEGER;
    new_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO old_count FROM old_table;
    SELECT COUNT(*) INTO new_count FROM new_table;
    
    IF old_count != new_count THEN
        RAISE EXCEPTION 'Data migration failed: counts do not match';
    END IF;
END $$;

COMMIT;
```

## Rollback Strategy

Always prepare rollback scripts:

**Forward migration:** `20251118_add_feature.sql`
```sql
CREATE TABLE IF NOT EXISTS new_feature (
    id SERIAL PRIMARY KEY
);
```

**Rollback migration:** `20251118_rollback_add_feature.sql`
```sql
DROP TABLE IF EXISTS new_feature CASCADE;
```

## Version Control

### Migration Tracking Table

The system uses a `schema_migrations` table to track applied migrations:

```sql
CREATE TABLE IF NOT EXISTS schema_migrations (
    version VARCHAR(255) PRIMARY KEY,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    description TEXT,
    success BOOLEAN DEFAULT true
);
```

## Testing Migrations

### Test on Clean Database

```bash
# Create test database
createdb dom_space_harvester_test

# Run migration
psql -U postgres -d dom_space_harvester_test -f database/migrations/YYYYMMDD_migration.sql

# Verify
psql -U postgres -d dom_space_harvester_test -c "\dt"

# Cleanup
dropdb dom_space_harvester_test
```

### Test Idempotency

```bash
# Run migration twice
psql -U postgres -d dom_space_harvester_test -f database/migrations/YYYYMMDD_migration.sql
psql -U postgres -d dom_space_harvester_test -f database/migrations/YYYYMMDD_migration.sql

# Should complete without errors
```

## Common Pitfalls

### ❌ Don't Do This

```sql
-- Missing IF NOT EXISTS
CREATE TABLE my_table (...);

-- MySQL syntax in PostgreSQL
CREATE INDEX idx ON my_table(url(255));

-- No foreign key action
FOREIGN KEY (parent_id) REFERENCES parent(id);

-- Missing defaults for timestamps
created_at TIMESTAMP;

-- No idempotency for indexes
CREATE INDEX idx_name ON my_table(name);
```

### ✅ Do This Instead

```sql
-- Always use IF NOT EXISTS
CREATE TABLE IF NOT EXISTS my_table (...);

-- PostgreSQL syntax
CREATE INDEX IF NOT EXISTS idx ON my_table(url);

-- Always specify actions
FOREIGN KEY (parent_id) REFERENCES parent(id) ON DELETE CASCADE;

-- Always set defaults
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Idempotent indexes
CREATE INDEX IF NOT EXISTS idx_name ON my_table(name);
```

## Performance Considerations

### Index Optimization

```sql
-- Index foreign keys
CREATE INDEX IF NOT EXISTS idx_child_parent_id ON child_table(parent_id);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_table_status_created 
    ON my_table(status, created_at DESC);

-- Partial indexes for filtered queries
CREATE INDEX IF NOT EXISTS idx_active_records 
    ON my_table(status) WHERE status = 'active';

-- JSONB indexes
CREATE INDEX IF NOT EXISTS idx_config_gin 
    ON my_table USING GIN (config);
```

### Query Performance

- Always add indexes on foreign key columns
- Add indexes on columns used in WHERE clauses
- Use composite indexes for common multi-column queries
- Consider partial indexes for commonly filtered data

## Documentation Requirements

Each migration file should include:

1. **Header comment** with purpose and date
2. **Table comments** describing purpose
3. **Column comments** for non-obvious fields
4. **Section dividers** for organization
5. **Dependency notes** for related migrations

## Migration Review Process

Before merging migrations:

1. **Code Review**: Another developer reviews the SQL
2. **Test Execution**: Run on test database
3. **Idempotency Check**: Run twice to verify no errors
4. **Performance Check**: Verify indexes are appropriate
5. **Documentation**: Ensure comments and README are updated

## Related Documentation

- [Database Migration Summary](DATABASE_MIGRATION_SUMMARY.md)
- [Comprehensive System Tables Guide](COMPREHENSIVE_SYSTEM_TABLES_MIGRATION_GUIDE.md)
- [Campaign Management Schema](CRAWLER_CAMPAIGN_SYSTEM_README.md)

## Support

For questions or issues with migrations:
1. Check this guide first
2. Review existing migrations for examples
3. Test on a clean database before committing
4. Document any unusual patterns or decisions

---

**Last Updated:** 2025-11-18
**Version:** 1.0.0
