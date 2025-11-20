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
# Database Migration Rules & Best Practices

## Overview

This document outlines the rules and best practices for managing database migrations in the LightDom project.

## Directory Structure

```
database/
├── migrations/          # Versioned migration files
│   ├── crawler-campaign-tables.sql
│   ├── 001_initial_schema.sql
│   └── ...
├── schema/             # Current schema documentation
└── seeds/              # Seed data for development
```

## Migration Naming Convention

Migrations should follow this naming pattern:

```
<number>_<descriptive_name>.sql
```

Examples:
- `001_initial_schema.sql`
- `002_add_ai_interactions_table.sql`
- `220-data-streams-with-attributes.sql`
- `crawler-campaign-tables.sql` (feature-specific)

## Migration File Structure

Every migration file should include:

1. **Header Comment**: Description of what the migration does
2. **CREATE TABLE IF NOT EXISTS**: Always use to avoid errors
3. **Indexes**: Create appropriate indexes for performance
4. **Foreign Keys**: Define relationships with ON DELETE actions
5. **Comments**: Use COMMENT ON TABLE/COLUMN for documentation

### Example Migration Template

```sql
/**
 * Migration: Add User Authentication Tables
 * 
 * Creates tables for user management and authentication
 * Dependencies: None
 * Version: 1.0.0
 */

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(255) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  
  -- Status
  status VARCHAR(50) DEFAULT 'active',
  email_verified BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

-- Comments
COMMENT ON TABLE users IS 'User accounts and authentication information';
COMMENT ON COLUMN users.role IS 'User role: admin, user, guest';
```

## Rules for Creating Migrations

### 1. Always Use Idempotent Operations

✅ **GOOD:**
```sql
CREATE TABLE IF NOT EXISTS campaigns (...);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
```

❌ **BAD:**
```sql
CREATE TABLE campaigns (...);  -- Will fail if table exists
CREATE INDEX idx_campaigns_status ON campaigns(status);
```

### 2. Use Proper Data Types

- **IDs**: `VARCHAR(255)` for generated IDs, `SERIAL` for auto-increment
- **Timestamps**: `TIMESTAMP` with `DEFAULT CURRENT_TIMESTAMP`
- **JSON Data**: `JSONB` for structured data (not `JSON`)
- **Text**: `TEXT` for long text, `VARCHAR(n)` for limited length
- **Booleans**: `BOOLEAN` with explicit defaults
- **Numbers**: `INTEGER`, `BIGINT`, `DECIMAL(p,s)` as appropriate

### 3. Always Define Foreign Key Constraints

```sql
FOREIGN KEY (campaign_id) REFERENCES crawler_campaigns(id) ON DELETE CASCADE
```

Choose appropriate ON DELETE actions:
- `CASCADE`: Delete dependent records
- `SET NULL`: Set to NULL when parent deleted
- `RESTRICT`: Prevent deletion if dependents exist

### 4. Create Indexes for Performance

Index columns that are:
- Used in WHERE clauses
- Used in JOIN conditions
- Used in ORDER BY
- Foreign keys
- Frequently queried

```sql
-- Single column index
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);

-- Composite index
CREATE INDEX IF NOT EXISTS idx_campaigns_status_date ON campaigns(status, created_at);

-- Partial index
CREATE INDEX IF NOT EXISTS idx_active_campaigns ON campaigns(status) WHERE status = 'active';
```

### 5. Use JSONB for Flexible Data

```sql
configuration JSONB NOT NULL,
metadata JSONB,
```

Benefits:
- Flexible schema
- Indexable with GIN indexes
- Query with `->` and `->>` operators

### 6. Add Timestamps to All Tables

```sql
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

Consider also:
- `deleted_at` for soft deletes
- `last_activity` for tracking usage
- `started_at`, `stopped_at` for lifecycle tracking

### 7. Use Appropriate Index Types

```sql
-- B-tree (default) - for equality and range queries
CREATE INDEX idx_created ON table(created_at);

-- GIN - for JSONB and full-text search
CREATE INDEX idx_config_gin ON table USING GIN (config);

-- Hash - for equality only (rarely needed)
CREATE INDEX idx_hash ON table USING HASH (email);
```

### 8. Add Table and Column Comments

```sql
COMMENT ON TABLE crawler_campaigns IS 'Manages crawler campaign configurations and lifecycle';
COMMENT ON COLUMN crawler_campaigns.status IS 'Campaign status: created, running, paused, stopped';
```

## Migration Execution Order

1. **Apply migrations in order**: Numerical order or dependency order
2. **Track applied migrations**: Use a `schema_migrations` table
3. **Never modify applied migrations**: Create new migration to change schema
4. **Test migrations**: Always test on development database first

## Schema Migrations Table

Create a table to track applied migrations:

```sql
CREATE TABLE IF NOT EXISTS schema_migrations (
  id SERIAL PRIMARY KEY,
  version VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  execution_time_ms INTEGER
);

CREATE INDEX IF NOT EXISTS idx_migrations_version ON schema_migrations(version);
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
### Manual Execution

```bash
# PostgreSQL
psql -U postgres -d lightdom_blockchain -f database/migrations/001_initial_schema.sql

# With Docker
docker exec -i postgres_container psql -U postgres -d lightdom_blockchain < database/migrations/001_initial_schema.sql
```

### Using Node.js Script

```javascript
import { Pool } from 'pg';
import fs from 'fs';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function runMigration(filename) {
  const sql = fs.readFileSync(`database/migrations/${filename}`, 'utf8');
  const startTime = Date.now();
  
  try {
    await pool.query(sql);
    const executionTime = Date.now() - startTime;
    
    // Track migration
    await pool.query(`
      INSERT INTO schema_migrations (version, description, execution_time_ms)
      VALUES ($1, $2, $3)
      ON CONFLICT (version) DO NOTHING
    `, [filename, `Applied ${filename}`, executionTime]);
    
    console.log(`✅ Migration applied: ${filename} (${executionTime}ms)`);
  } catch (error) {
    console.error(`❌ Migration failed: ${filename}`, error);
    throw error;
  }
}

// Run migrations
const migrations = [
  '001_initial_schema.sql',
  '002_add_ai_interactions_table.sql',
  'crawler-campaign-tables.sql'
];

for (const migration of migrations) {
  await runMigration(migration);
}

await pool.end();
```

### Using npm Scripts

Add to `package.json`:

```json
{
  "scripts": {
    "migrate": "node scripts/run-migrations.js",
    "migrate:create": "node scripts/create-migration.js",
    "migrate:rollback": "node scripts/rollback-migration.js",
    "migrate:status": "node scripts/migration-status.js"
  }
}
```

## Rollback Strategy

### For Destructive Changes

Create separate rollback migrations:

```
220_add_user_roles.sql         # Migration
220_add_user_roles_rollback.sql  # Rollback
```

### For Non-Destructive Changes

Use conditional rollback:

```sql
-- Rollback: Drop table if exists
DROP TABLE IF EXISTS user_roles;
```

## Best Practices

### DO ✅

1. **Version all migrations** with clear numbering
2. **Test migrations** on development environment first
3. **Use transactions** where possible
4. **Document dependencies** in migration header
5. **Create indexes** for foreign keys
6. **Use JSONB** for flexible data structures
7. **Add comments** to tables and columns
8. **Use IF NOT EXISTS** for all CREATE statements
9. **Define CASCADE rules** explicitly
10. **Track applied migrations** in schema_migrations table

### DON'T ❌

1. **Never modify** an applied migration
2. **Don't use** `SELECT *` in production code
3. **Don't create** indexes without IF NOT EXISTS
4. **Don't forget** to add indexes for foreign keys
5. **Don't use** TEXT for limited-length strings
6. **Don't omit** ON DELETE actions on foreign keys
7. **Don't skip** migration version numbers
8. **Don't apply** migrations without testing
9. **Don't use** JSON instead of JSONB
10. **Don't leave** migrations without comments

## Schema Evolution Guidelines

### Adding a Column

```sql
-- Safe: Add nullable column
ALTER TABLE campaigns 
ADD COLUMN IF NOT EXISTS tags JSONB;

-- With default value
ALTER TABLE campaigns 
ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT 5;
```

### Changing a Column

```sql
-- Step 1: Add new column
ALTER TABLE campaigns ADD COLUMN new_status VARCHAR(50);

-- Step 2: Migrate data
UPDATE campaigns SET new_status = old_status;

-- Step 3: Drop old column (separate migration)
ALTER TABLE campaigns DROP COLUMN IF EXISTS old_status;

-- Step 4: Rename new column
ALTER TABLE campaigns RENAME COLUMN new_status TO status;
```

### Adding an Index

```sql
-- Add index concurrently (PostgreSQL)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_campaigns_complex 
ON campaigns(status, created_at) 
WHERE status = 'active';
```

### Removing a Table

```sql
-- Drop with cascade to remove dependent objects
DROP TABLE IF EXISTS old_table CASCADE;
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
### Pre-Migration Checklist

- [ ] Migration file follows naming convention
- [ ] Uses IF NOT EXISTS for all CREATE statements
- [ ] Includes appropriate indexes
- [ ] Defines foreign key constraints
- [ ] Has table/column comments
- [ ] Tested on development database
- [ ] Reviewed by team member
- [ ] Documented in schema documentation

### Post-Migration Validation

```sql
-- Verify table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_name = 'crawler_campaigns'
);

-- Check indexes
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'crawler_campaigns';

-- Validate foreign keys
SELECT
  tc.table_name, 
  kcu.column_name, 
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE constraint_type = 'FOREIGN KEY' 
  AND tc.table_name='crawler_campaigns';
```

## Continuous Integration

### Pre-Commit Checks

```bash
# Validate SQL syntax
pg_validate database/migrations/*.sql

# Check for dangerous operations
grep -r "DROP TABLE\|DROP DATABASE" database/migrations/
```

### CI/CD Pipeline

1. Run migrations on test database
2. Run integration tests
3. Validate schema matches expected state
4. Generate schema documentation

## Tools & Resources

### Recommended Tools

- **pgAdmin**: GUI for PostgreSQL
- **DBeaver**: Universal database tool
- **node-pg-migrate**: Node.js migration tool
- **Flyway**: Java-based migration tool
- **Liquibase**: Database schema change management

### Useful Commands

```bash
# Export current schema
pg_dump -U postgres -d lightdom_blockchain --schema-only > schema.sql

# Check table size
SELECT pg_size_pretty(pg_total_relation_size('crawler_campaigns'));

# List all tables
\dt

# Describe table
\d crawler_campaigns

# Show indexes
\di
```

## Conclusion

Following these migration rules ensures:

- **Consistency**: All developers follow the same patterns
- **Reliability**: Migrations are idempotent and safe
- **Maintainability**: Clear documentation and organization
- **Performance**: Proper indexes and data types
- **Safety**: Tested and validated before production

Always prioritize data integrity and backward compatibility when creating migrations.

---

**Version**: 1.0.0  
**Last Updated**: 2025-11-18  
**Authors**: LightDom Development Team
