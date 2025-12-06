/**
 * Codebase Indexing API Routes
 * 
 * REST API endpoints for semantic code search, knowledge graph construction,
 * and AI-powered code analysis - critical for RAG integration.
 */

import express from 'express';
import { CodebaseIndexingService } from '../services/codebase-indexing-service.js';

export function createCodebaseIndexingRoutes(db) {
  const router = express.Router();
  
  // Initialize service
  let indexingService = null;
  let initialized = false;
  
  // Lazy initialization
  router.use(async (req, res, next) => {
    if (!initialized) {
      try {
        indexingService = new CodebaseIndexingService({
          db,
          rootDir: process.cwd(),
          enableEmbeddings: true,
        });
        initialized = true;
        console.log('✅ Codebase Indexing Service initialized');
      } catch (error) {
        console.error('Failed to initialize codebase indexing service:', error);
      }
    }
    next();
  });

  /**
   * GET /api/codebase-indexing/status
   * Get current indexing status and statistics
   */
  router.get('/status', async (req, res) => {
    try {
      // Try to get stats from database
      let stats = {
        status: 'idle',
        lastIndexed: null,
        totalEntities: 0,
        totalRelationships: 0,
        totalFiles: 0,
      };

      if (db) {
        try {
          const entityCount = await db.query('SELECT COUNT(*) as count FROM code_entities');
          const relationCount = await db.query('SELECT COUNT(*) as count FROM code_relationships');
          const sessionResult = await db.query(
            'SELECT * FROM indexing_sessions ORDER BY start_time DESC LIMIT 1'
          );

          stats.totalEntities = parseInt(entityCount.rows[0]?.count || 0);
          stats.totalRelationships = parseInt(relationCount.rows[0]?.count || 0);
          
          if (sessionResult.rows.length > 0) {
            const session = sessionResult.rows[0];
            stats.lastIndexed = session.end_time || session.start_time;
            stats.status = session.status;
          }
        } catch (dbError) {
          // Database query failed - tables may not exist or there could be other issues
          console.warn('Database query failed for indexing status:', dbError.message);
        }
      }

      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * POST /api/codebase-indexing/start
   * Start codebase indexing
   */
  router.post('/start', async (req, res) => {
    try {
      const { incremental = false, targetFiles = null } = req.body;

      if (!indexingService) {
        return res.status(503).json({ error: 'Indexing service not initialized' });
      }

      // Start indexing asynchronously
      const sessionPromise = indexingService.indexCodebase({
        incremental,
        targetFiles,
      });

      // Generate unique session ID
      const crypto = await import('crypto');
      const sessionId = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      
      // Return immediately with session info
      res.json({
        success: true,
        message: 'Indexing started',
        session: {
          id: sessionId,
          status: 'running',
          startTime: new Date().toISOString(),
          incremental,
        },
      });

      // Let indexing complete in background
      sessionPromise
        .then(result => {
          console.log('✅ Indexing completed:', result?.stats);
        })
        .catch(err => {
          console.error('❌ Indexing failed:', err);
        });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * POST /api/codebase-indexing/stop/:sessionId
   * Stop an active indexing session
   */
  router.post('/stop/:sessionId', async (req, res) => {
    try {
      const { sessionId } = req.params;

      if (!indexingService) {
        return res.status(503).json({ error: 'Indexing service not initialized' });
      }

      // For now, just acknowledge the stop request
      res.json({
        success: true,
        message: `Stop requested for session ${sessionId}`,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * GET /api/codebase-indexing/sessions
   * Get list of indexing sessions
   */
  router.get('/sessions', async (req, res) => {
    try {
      const { limit = 10 } = req.query;

      if (!db) {
        return res.json([]);
      }

      try {
        const result = await db.query(
          `SELECT id, status, start_time, end_time, 
                  files_processed, entities_found, relationships_found, issues_detected
           FROM indexing_sessions 
           ORDER BY start_time DESC 
           LIMIT $1`,
          [parseInt(limit)]
        );

        const sessions = result.rows.map(row => ({
          id: row.id,
          status: row.status,
          startTime: row.start_time,
          endTime: row.end_time,
          stats: {
            filesProcessed: row.files_processed || 0,
            entitiesFound: row.entities_found || 0,
            relationshipsFound: row.relationships_found || 0,
            issuesDetected: row.issues_detected || 0,
          },
        }));

        res.json(sessions);
      } catch (dbError) {
        // Tables might not exist
        res.json([]);
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * GET /api/codebase-indexing/search
   * Search code entities
   */
  router.get('/search', async (req, res) => {
    try {
      const { query, type, limit = 50 } = req.query;

      if (!query) {
        return res.status(400).json({ error: 'Query parameter required' });
      }

      if (!db) {
        return res.json([]);
      }

      try {
        let sql = `
          SELECT id, name, type, file_path, line_start, line_end, description, signature
          FROM code_entities
          WHERE name ILIKE $1 OR description ILIKE $1
        `;
        const params = [`%${query}%`];
        let paramCount = 2;

        if (type) {
          sql += ` AND type = $${paramCount++}`;
          params.push(type);
        }

        sql += ` ORDER BY name LIMIT $${paramCount}`;
        params.push(parseInt(limit));

        const result = await db.query(sql, params);

        const entities = result.rows.map(row => ({
          id: row.id,
          name: row.name,
          type: row.type,
          filePath: row.file_path,
          lineStart: row.line_start,
          lineEnd: row.line_end,
          description: row.description,
          signature: row.signature,
        }));

        res.json(entities);
      } catch (dbError) {
        res.json([]);
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * GET /api/codebase-indexing/entities/:id
   * Get entity details
   */
  router.get('/entities/:id', async (req, res) => {
    try {
      const { id } = req.params;

      if (!db) {
        return res.status(404).json({ error: 'Entity not found' });
      }

      try {
        const result = await db.query(
          `SELECT id, name, type, file_path, line_start, line_end, 
                  description, signature, code_snippet, metadata
           FROM code_entities WHERE id = $1`,
          [id]
        );

        if (result.rows.length === 0) {
          return res.status(404).json({ error: 'Entity not found' });
        }

        const row = result.rows[0];
        res.json({
          id: row.id,
          name: row.name,
          type: row.type,
          filePath: row.file_path,
          lineStart: row.line_start,
          lineEnd: row.line_end,
          description: row.description,
          signature: row.signature,
          codeSnippet: row.code_snippet,
          metadata: row.metadata,
        });
      } catch (dbError) {
        res.status(404).json({ error: 'Entity not found' });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * GET /api/codebase-indexing/entities/:id/relationships
   * Get entity relationships
   */
  router.get('/entities/:id/relationships', async (req, res) => {
    try {
      const { id } = req.params;

      if (!db) {
        return res.json([]);
      }

      try {
        const result = await db.query(
          `SELECT cr.id, cr.source_entity_id, cr.target_entity_id, cr.relationship_type,
                  se.name as source_name, te.name as target_name
           FROM code_relationships cr
           LEFT JOIN code_entities se ON cr.source_entity_id = se.id
           LEFT JOIN code_entities te ON cr.target_entity_id = te.id
           WHERE cr.source_entity_id = $1 OR cr.target_entity_id = $1`,
          [id]
        );

        const relationships = result.rows.map(row => ({
          id: row.id,
          sourceId: row.source_entity_id,
          sourceName: row.source_name,
          targetId: row.target_entity_id,
          targetName: row.target_name,
          type: row.relationship_type,
        }));

        res.json(relationships);
      } catch (dbError) {
        res.json([]);
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * GET /api/codebase-indexing/entities/:id/call-graph
   * Get call graph for an entity
   */
  router.get('/entities/:id/call-graph', async (req, res) => {
    try {
      const { id } = req.params;
      const { depth = 3 } = req.query;

      // Build a simple call graph
      const nodes = [];
      const edges = [];
      const visited = new Set();

      async function buildGraph(entityId, currentDepth) {
        if (currentDepth > parseInt(depth) || visited.has(entityId)) {
          return;
        }
        visited.add(entityId);

        try {
          // Get entity
          const entityResult = await db.query(
            'SELECT id, name, type FROM code_entities WHERE id = $1',
            [entityId]
          );
          if (entityResult.rows.length > 0) {
            const entity = entityResult.rows[0];
            nodes.push({
              id: entity.id,
              name: entity.name,
              type: entity.type,
              depth: currentDepth,
            });
          }

          // Get outgoing relationships
          const relResult = await db.query(
            `SELECT target_entity_id, relationship_type 
             FROM code_relationships 
             WHERE source_entity_id = $1 AND relationship_type = 'calls'`,
            [entityId]
          );

          for (const rel of relResult.rows) {
            edges.push({
              source: entityId,
              target: rel.target_entity_id,
              type: rel.relationship_type,
            });
            await buildGraph(rel.target_entity_id, currentDepth + 1);
          }
        } catch (err) {
          // Gracefully handle errors in recursive graph building to prevent partial graph failures
          // The graph will be returned with whatever data was successfully collected
          console.debug('Graph building encountered an issue for entity:', entityId, err.message);
        }
      }

      if (db) {
        await buildGraph(id, 0);
      }

      res.json({ nodes, edges });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * GET /api/codebase-indexing/analysis/dead-code
   * Get dead code analysis results
   */
  router.get('/analysis/dead-code', async (req, res) => {
    try {
      if (!db) {
        return res.json([]);
      }

      try {
        // Find entities with no incoming references (except entry points)
        const result = await db.query(`
          SELECT ce.id, ce.name, ce.type, ce.file_path, ce.line_start
          FROM code_entities ce
          LEFT JOIN code_relationships cr ON ce.id = cr.target_entity_id
          WHERE cr.id IS NULL
            AND ce.type IN ('function', 'class')
            AND ce.name NOT IN ('main', 'App', 'default')
          ORDER BY ce.file_path, ce.line_start
          LIMIT 100
        `);

        const deadCode = result.rows.map(row => ({
          id: row.id,
          name: row.name,
          type: row.type,
          filePath: row.file_path,
          line: row.line_start,
          reason: 'No incoming references found',
        }));

        res.json(deadCode);
      } catch (dbError) {
        res.json([]);
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * GET /api/codebase-indexing/analysis/dependencies
   * Get dependency analysis
   */
  router.get('/analysis/dependencies', async (req, res) => {
    try {
      if (!db) {
        return res.json({ internal: [], external: [] });
      }

      try {
        // Get import relationships
        const result = await db.query(`
          SELECT DISTINCT cr.metadata->>'module' as module,
                 COUNT(*) as usage_count
          FROM code_relationships cr
          WHERE cr.relationship_type = 'imports'
            AND cr.metadata->>'module' IS NOT NULL
          GROUP BY cr.metadata->>'module'
          ORDER BY usage_count DESC
          LIMIT 100
        `);

        const internal = [];
        const external = [];

        for (const row of result.rows) {
          const dep = {
            module: row.module,
            usageCount: parseInt(row.usage_count),
          };

          if (row.module?.startsWith('.') || row.module?.startsWith('/')) {
            internal.push(dep);
          } else {
            external.push(dep);
          }
        }

        res.json({ internal, external });
      } catch (dbError) {
        res.json({ internal: [], external: [] });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * GET /api/codebase-indexing/insights
   * Get AI-powered insights about the codebase
   */
  router.get('/insights', async (req, res) => {
    try {
      const insights = [];

      if (!db) {
        return res.json(insights);
      }

      try {
        // Get entity counts by type
        const typeStats = await db.query(`
          SELECT type, COUNT(*) as count
          FROM code_entities
          GROUP BY type
          ORDER BY count DESC
        `);

        if (typeStats.rows.length > 0) {
          insights.push({
            type: 'composition',
            title: 'Codebase Composition',
            description: `Your codebase contains ${typeStats.rows.map(r => `${r.count} ${r.type}s`).join(', ')}`,
            data: typeStats.rows,
          });
        }

        // Get most connected entities
        const connected = await db.query(`
          SELECT ce.name, ce.type, ce.file_path,
                 (SELECT COUNT(*) FROM code_relationships WHERE source_entity_id = ce.id) +
                 (SELECT COUNT(*) FROM code_relationships WHERE target_entity_id = ce.id) as connections
          FROM code_entities ce
          ORDER BY connections DESC
          LIMIT 5
        `);

        if (connected.rows.length > 0) {
          insights.push({
            type: 'hotspots',
            title: 'Code Hotspots',
            description: 'Most connected components in your codebase',
            data: connected.rows,
          });
        }

        // Get largest files
        const largeFiles = await db.query(`
          SELECT file_path, COUNT(*) as entity_count
          FROM code_entities
          GROUP BY file_path
          ORDER BY entity_count DESC
          LIMIT 5
        `);

        if (largeFiles.rows.length > 0) {
          insights.push({
            type: 'complexity',
            title: 'Complex Files',
            description: 'Files with the most code entities',
            data: largeFiles.rows,
          });
        }
      } catch (dbError) {
        // Tables might not exist
      }

      res.json(insights);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
}

export default createCodebaseIndexingRoutes;
