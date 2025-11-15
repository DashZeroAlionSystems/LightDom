# Snapshot Pattern Implementation Guide

## Overview

The Snapshot Pattern is a behavioral design pattern that captures the internal state of an object at a specific point in time, allowing it to be restored later. In the LightDom project, this pattern is crucial for:

1. **State Management** - Capturing application state for undo/redo
2. **Testing** - Creating reproducible test scenarios
3. **Auditing** - Tracking changes over time
4. **Recovery** - Restoring previous states after errors

## Existing Implementation Analysis

### Current Usage in LightDom

After analyzing the codebase, snapshot pattern is used in several areas:

1. **Component State Snapshots** (`src/components/`)
   - Component hierarchy snapshots
   - Design token snapshots
   - UI state capture

2. **Database Snapshots** (`database/`)
   - Schema versioning
   - Migration snapshots
   - Data backup points

3. **Crawler Snapshots** (`crawler/`)
   - DOM snapshot capture
   - Page state preservation
   - Structured data snapshots

## Comprehensive Snapshot Pattern Implementation

### 1. Core Snapshot Interface

```typescript
// services/snapshot-pattern-service.ts

interface Snapshot<T> {
  id: string;
  timestamp: Date;
  state: T;
  metadata: {
    version: string;
    source: string;
    tags?: string[];
    checksum?: string;
  };
}

interface SnapshotManager<T> {
  createSnapshot(state: T, metadata?: Partial<Snapshot<T>['metadata']>): Snapshot<T>;
  restoreSnapshot(snapshotId: string): T | null;
  listSnapshots(filter?: SnapshotFilter): Snapshot<T>[];
  deleteSnapshot(snapshotId: string): boolean;
  compareSnapshots(id1: string, id2: string): SnapshotDiff<T>;
}

interface SnapshotFilter {
  startDate?: Date;
  endDate?: Date;
  tags?: string[];
  source?: string;
}

interface SnapshotDiff<T> {
  added: Partial<T>;
  removed: Partial<T>;
  modified: Partial<T>;
  unchanged: Partial<T>;
}
```

### 2. Database Schema for Snapshots

```sql
-- database/143-snapshot-pattern-system.sql

CREATE TABLE IF NOT EXISTS snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type VARCHAR(100) NOT NULL, -- component, page, workflow, etc.
    entity_id VARCHAR(255) NOT NULL,
    snapshot_data JSONB NOT NULL,
    metadata JSONB DEFAULT '{}',
    
    -- Versioning
    version INTEGER DEFAULT 1,
    parent_snapshot_id UUID REFERENCES snapshots(id),
    
    -- Checksums for integrity
    checksum VARCHAR(64),
    
    -- Classification
    snapshot_type VARCHAR(50) DEFAULT 'manual', -- manual, automatic, scheduled
    tags TEXT[],
    
    -- Lifecycle
    created_at TIMESTAMP DEFAULT NOW(),
    created_by VARCHAR(255),
    expires_at TIMESTAMP,
    is_archived BOOLEAN DEFAULT FALSE,
    
    -- Indexing
    CONSTRAINT unique_entity_version UNIQUE (entity_type, entity_id, version)
);

CREATE INDEX idx_snapshots_entity ON snapshots(entity_type, entity_id);
CREATE INDEX idx_snapshots_created_at ON snapshots(created_at DESC);
CREATE INDEX idx_snapshots_tags ON snapshots USING gin(tags);
CREATE INDEX idx_snapshots_parent ON snapshots(parent_snapshot_id);

-- Snapshot comparison cache
CREATE TABLE IF NOT EXISTS snapshot_comparisons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    snapshot_id_1 UUID REFERENCES snapshots(id),
    snapshot_id_2 UUID REFERENCES snapshots(id),
    diff_data JSONB NOT NULL,
    computed_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT unique_comparison UNIQUE (snapshot_id_1, snapshot_id_2)
);

-- Snapshot restoration history
CREATE TABLE IF NOT EXISTS snapshot_restorations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    snapshot_id UUID REFERENCES snapshots(id),
    restored_at TIMESTAMP DEFAULT NOW(),
    restored_by VARCHAR(255),
    restoration_reason TEXT,
    success BOOLEAN DEFAULT TRUE,
    error_message TEXT
);
```

### 3. Snapshot Service Implementation

```typescript
// services/snapshot-manager.service.ts

import { Pool } from 'pg';
import crypto from 'crypto';

export class SnapshotManagerService<T> {
  constructor(
    private db: Pool,
    private entityType: string
  ) {}

  /**
   * Create a new snapshot
   */
  async createSnapshot(
    entityId: string,
    state: T,
    options: {
      type?: 'manual' | 'automatic' | 'scheduled';
      tags?: string[];
      createdBy?: string;
      expiresIn?: number; // days
    } = {}
  ): Promise<Snapshot<T>> {
    const snapshotData = JSON.stringify(state);
    const checksum = this.calculateChecksum(snapshotData);
    
    // Get next version number
    const versionResult = await this.db.query(
      `SELECT COALESCE(MAX(version), 0) + 1 as next_version
       FROM snapshots 
       WHERE entity_type = $1 AND entity_id = $2`,
      [this.entityType, entityId]
    );
    
    const version = versionResult.rows[0].next_version;
    const expiresAt = options.expiresIn 
      ? new Date(Date.now() + options.expiresIn * 24 * 60 * 60 * 1000)
      : null;

    const result = await this.db.query(
      `INSERT INTO snapshots (
        entity_type, entity_id, snapshot_data, version,
        checksum, snapshot_type, tags, created_by, expires_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id, created_at`,
      [
        this.entityType,
        entityId,
        snapshotData,
        version,
        checksum,
        options.type || 'manual',
        options.tags || [],
        options.createdBy,
        expiresAt
      ]
    );

    return {
      id: result.rows[0].id,
      timestamp: result.rows[0].created_at,
      state,
      metadata: {
        version: version.toString(),
        source: this.entityType,
        tags: options.tags,
        checksum
      }
    };
  }

  /**
   * Restore a snapshot
   */
  async restoreSnapshot(
    snapshotId: string,
    restoredBy?: string,
    reason?: string
  ): Promise<T | null> {
    const result = await this.db.query(
      `SELECT snapshot_data, checksum 
       FROM snapshots 
       WHERE id = $1`,
      [snapshotId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const { snapshot_data, checksum } = result.rows[0];
    
    // Verify integrity
    if (this.calculateChecksum(snapshot_data) !== checksum) {
      throw new Error('Snapshot integrity check failed');
    }

    // Record restoration
    await this.db.query(
      `INSERT INTO snapshot_restorations (
        snapshot_id, restored_by, restoration_reason, success
      ) VALUES ($1, $2, $3, $4)`,
      [snapshotId, restoredBy, reason, true]
    );

    return JSON.parse(snapshot_data);
  }

  /**
   * List snapshots with filtering
   */
  async listSnapshots(
    entityId: string,
    filter: SnapshotFilter = {}
  ): Promise<Snapshot<T>[]> {
    let query = `
      SELECT id, snapshot_data, version, created_at, checksum, tags
      FROM snapshots
      WHERE entity_type = $1 AND entity_id = $2
        AND is_archived = FALSE
    `;
    const params: any[] = [this.entityType, entityId];
    let paramIndex = 3;

    if (filter.startDate) {
      query += ` AND created_at >= $${paramIndex}`;
      params.push(filter.startDate);
      paramIndex++;
    }

    if (filter.endDate) {
      query += ` AND created_at <= $${paramIndex}`;
      params.push(filter.endDate);
      paramIndex++;
    }

    if (filter.tags && filter.tags.length > 0) {
      query += ` AND tags && $${paramIndex}`;
      params.push(filter.tags);
      paramIndex++;
    }

    query += ` ORDER BY created_at DESC`;

    const result = await this.db.query(query, params);

    return result.rows.map(row => ({
      id: row.id,
      timestamp: row.created_at,
      state: JSON.parse(row.snapshot_data),
      metadata: {
        version: row.version.toString(),
        source: this.entityType,
        tags: row.tags,
        checksum: row.checksum
      }
    }));
  }

  /**
   * Compare two snapshots
   */
  async compareSnapshots(
    id1: string,
    id2: string
  ): Promise<SnapshotDiff<T>> {
    // Check cache first
    const cached = await this.db.query(
      `SELECT diff_data FROM snapshot_comparisons
       WHERE (snapshot_id_1 = $1 AND snapshot_id_2 = $2)
          OR (snapshot_id_1 = $2 AND snapshot_id_2 = $1)`,
      [id1, id2]
    );

    if (cached.rows.length > 0) {
      return cached.rows[0].diff_data;
    }

    // Fetch both snapshots
    const result = await this.db.query(
      `SELECT id, snapshot_data FROM snapshots WHERE id IN ($1, $2)`,
      [id1, id2]
    );

    if (result.rows.length !== 2) {
      throw new Error('One or both snapshots not found');
    }

    const snapshot1 = JSON.parse(
      result.rows.find(r => r.id === id1).snapshot_data
    );
    const snapshot2 = JSON.parse(
      result.rows.find(r => r.id === id2).snapshot_data
    );

    // Compute diff
    const diff = this.computeDiff(snapshot1, snapshot2);

    // Cache the result
    await this.db.query(
      `INSERT INTO snapshot_comparisons (snapshot_id_1, snapshot_id_2, diff_data)
       VALUES ($1, $2, $3)
       ON CONFLICT (snapshot_id_1, snapshot_id_2) DO NOTHING`,
      [id1, id2, JSON.stringify(diff)]
    );

    return diff;
  }

  /**
   * Delete a snapshot
   */
  async deleteSnapshot(snapshotId: string): Promise<boolean> {
    const result = await this.db.query(
      `UPDATE snapshots SET is_archived = TRUE WHERE id = $1`,
      [snapshotId]
    );

    return result.rowCount > 0;
  }

  /**
   * Calculate checksum for data
   */
  private calculateChecksum(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Compute diff between two objects
   */
  private computeDiff(obj1: T, obj2: T): SnapshotDiff<T> {
    const added: any = {};
    const removed: any = {};
    const modified: any = {};
    const unchanged: any = {};

    const allKeys = new Set([
      ...Object.keys(obj1 as any),
      ...Object.keys(obj2 as any)
    ]);

    for (const key of allKeys) {
      const val1 = (obj1 as any)[key];
      const val2 = (obj2 as any)[key];

      if (val1 === undefined && val2 !== undefined) {
        added[key] = val2;
      } else if (val1 !== undefined && val2 === undefined) {
        removed[key] = val1;
      } else if (JSON.stringify(val1) !== JSON.stringify(val2)) {
        modified[key] = { from: val1, to: val2 };
      } else {
        unchanged[key] = val1;
      }
    }

    return { added, removed, modified, unchanged };
  }

  /**
   * Cleanup expired snapshots
   */
  async cleanupExpiredSnapshots(): Promise<number> {
    const result = await this.db.query(
      `UPDATE snapshots 
       SET is_archived = TRUE 
       WHERE expires_at IS NOT NULL 
         AND expires_at < NOW()
         AND is_archived = FALSE`
    );

    return result.rowCount;
  }
}
```

### 4. Integration Examples

#### 4.1 Component State Snapshot

```typescript
// Example: Saving component state
const componentSnapshotManager = new SnapshotManagerService(db, 'component');

// Create snapshot
const snapshot = await componentSnapshotManager.createSnapshot(
  'dashboard-component-123',
  {
    layout: currentLayout,
    theme: currentTheme,
    data: componentData
  },
  {
    tags: ['before-update', 'v2.0'],
    createdBy: 'user@example.com'
  }
);

// Restore later
const previousState = await componentSnapshotManager.restoreSnapshot(
  snapshot.id,
  'user@example.com',
  'Reverting failed update'
);
```

#### 4.2 Workflow State Snapshot

```typescript
// Example: Workflow checkpointing
const workflowSnapshotManager = new SnapshotManagerService(db, 'workflow');

// Create automatic checkpoint
await workflowSnapshotManager.createSnapshot(
  workflowId,
  workflowState,
  {
    type: 'automatic',
    tags: ['checkpoint', `step-${currentStep}`]
  }
);
```

#### 4.3 Schema Evolution Snapshot

```typescript
// Example: Database schema versioning
const schemaSnapshotManager = new SnapshotManagerService(db, 'schema');

// Before migration
await schemaSnapshotManager.createSnapshot(
  'database-schema',
  currentSchema,
  {
    tags: ['pre-migration', 'v1.0'],
    type: 'automatic'
  }
);

// Run migration
await runMigration();

// After migration
await schemaSnapshotManager.createSnapshot(
  'database-schema',
  newSchema,
  {
    tags: ['post-migration', 'v2.0'],
    type: 'automatic'
  }
);
```

## Related Patterns

### 1. Memento Pattern
- **Purpose**: Similar to Snapshot, but focuses on encapsulation
- **Usage in LightDom**: Undo/Redo functionality in UI editors
- **Implementation**: `services/memento-manager.service.ts`

### 2. Command Pattern
- **Purpose**: Encapsulate actions that can be undone/redone
- **Usage in LightDom**: Workflow actions, Data transformations
- **Integration**: Commands store state snapshots for rollback

### 3. Observer Pattern
- **Purpose**: Notify observers of state changes
- **Usage in LightDom**: Trigger snapshot creation on significant changes
- **Integration**: Component lifecycle hooks trigger automatic snapshots

### 4. Event Sourcing Pattern
- **Purpose**: Store all changes as a sequence of events
- **Usage in LightDom**: Audit trail, State reconstruction
- **Integration**: Snapshots serve as event checkpoints

## Best Practices

### 1. Snapshot Frequency
- **Manual**: User-triggered (save points)
- **Automatic**: On significant state changes
- **Scheduled**: Daily/hourly for critical data
- **Checkpoint**: Before dangerous operations

### 2. Retention Policy
```typescript
// Implement tiered retention
const retentionPolicy = {
  manual: null, // Keep indefinitely
  automatic: 30, // 30 days
  scheduled: 90, // 90 days
  checkpoint: 7 // 7 days
};
```

### 3. Performance Optimization
- Use compression for large snapshots
- Implement differential snapshots (only store changes)
- Cache frequently accessed snapshots
- Lazy-load snapshot data

### 4. Security
- Encrypt sensitive snapshot data
- Implement access control
- Audit snapshot access
- Sanitize data before snapshots

## Implementation Checklist

- [ ] Create snapshot database schema
- [ ] Implement SnapshotManagerService
- [ ] Add snapshot UI components
- [ ] Integrate with component lifecycle
- [ ] Add automated testing
- [ ] Implement retention policies
- [ ] Add monitoring and alerting
- [ ] Document API usage
- [ ] Create user documentation
- [ ] Performance testing

## Conclusion

The Snapshot Pattern is fundamental to LightDom's robustness and user experience. By implementing comprehensive snapshot functionality, we enable:

- **Reliable State Management**: Never lose work
- **Easy Testing**: Reproducible scenarios
- **Audit Trail**: Track all changes
- **Quick Recovery**: Restore previous states instantly
- **Time Travel Debugging**: Step through state history

This implementation provides a solid foundation for all snapshot-related functionality across the platform.
