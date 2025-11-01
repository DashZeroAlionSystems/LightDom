#!/usr/bin/env node

/**
 * Schema Linking API Routes
 * REST API endpoints for schema linking service
 */

import express from 'express';
import SchemaLinkingService from './schema-linking-service.js';
import { SchemaLinkingRunner } from './schema-linking-runner.js';
import fs from 'fs';
import path from 'path';

const router = express.Router();

// Singleton instances
let schemaService = null;
let schemaRunner = null;

/**
 * Initialize schema linking service
 */
function getSchemaService() {
  if (!schemaService) {
    schemaService = new SchemaLinkingService();
  }
  return schemaService;
}

/**
 * Initialize schema linking runner
 */
function getSchemaRunner() {
  if (!schemaRunner) {
    schemaRunner = new SchemaLinkingRunner({ autoStart: false });
  }
  return schemaRunner;
}

/**
 * GET /api/schema-linking/analyze
 * Analyze database schema and return metadata
 */
router.get('/analyze', async (req, res) => {
  try {
    const service = getSchemaService();
    const result = await service.analyzeDatabaseSchema();
    
    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Schema analysis error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/schema-linking/tables
 * Get all table metadata
 */
router.get('/tables', async (req, res) => {
  try {
    const service = getSchemaService();
    
    if (service.tableMetadata.size === 0) {
      await service.analyzeDatabaseSchema();
    }
    
    const tables = Array.from(service.tableMetadata.values());
    
    res.json({
      success: true,
      data: {
        count: tables.length,
        tables: tables
      }
    });
  } catch (error) {
    console.error('Get tables error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/schema-linking/relationships
 * Get all schema relationships
 */
router.get('/relationships', async (req, res) => {
  try {
    const service = getSchemaService();
    const type = req.query.type; // Optional filter by type
    
    if (service.schemaLinks.size === 0) {
      await service.analyzeDatabaseSchema();
    }
    
    let relationships = Array.from(service.schemaLinks.values());
    
    if (type) {
      relationships = relationships.filter(r => r.type === type);
    }
    
    res.json({
      success: true,
      data: {
        count: relationships.length,
        relationships: relationships
      }
    });
  } catch (error) {
    console.error('Get relationships error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/schema-linking/features
 * Get all feature groupings
 */
router.get('/features', async (req, res) => {
  try {
    const service = getSchemaService();
    
    if (service.featureInteractions.size === 0) {
      await service.analyzeDatabaseSchema();
    }
    
    const features = Array.from(service.featureInteractions.values());
    
    res.json({
      success: true,
      data: {
        count: features.length,
        features: features
      }
    });
  } catch (error) {
    console.error('Get features error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/schema-linking/features/:name
 * Get linked schema map for a specific feature
 */
router.get('/features/:name', async (req, res) => {
  try {
    const service = getSchemaService();
    const featureName = req.params.name;
    
    if (service.featureInteractions.size === 0) {
      await service.analyzeDatabaseSchema();
    }
    
    const linkedSchema = service.generateLinkedSchemaMap(featureName);
    
    if (!linkedSchema) {
      return res.status(404).json({
        success: false,
        error: `Feature '${featureName}' not found`
      });
    }
    
    res.json({
      success: true,
      data: linkedSchema
    });
  } catch (error) {
    console.error('Get feature schema error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/schema-linking/export
 * Export all linked schemas to file
 */
router.post('/export', async (req, res) => {
  try {
    const service = getSchemaService();
    const outputPath = req.body.outputPath || 
      path.join(process.cwd(), 'data', 'linked-schemas', `export-${Date.now()}.json`);
    
    if (service.tableMetadata.size === 0) {
      await service.analyzeDatabaseSchema();
    }
    
    const exportData = await service.exportLinkedSchemas(outputPath);
    
    res.json({
      success: true,
      data: {
        outputPath: outputPath,
        metadata: exportData.metadata
      }
    });
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/schema-linking/runner/status
 * Get schema linking runner status
 */
router.get('/runner/status', async (req, res) => {
  try {
    const runner = getSchemaRunner();
    const status = runner.getStatus();
    
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('Get runner status error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/schema-linking/runner/start
 * Start the automated runner
 */
router.post('/runner/start', async (req, res) => {
  try {
    const runner = getSchemaRunner();
    
    if (!runner.service) {
      await runner.initialize();
    }
    
    if (!runner.isRunning) {
      await runner.start();
    }
    
    res.json({
      success: true,
      message: 'Schema linking runner started',
      status: runner.getStatus()
    });
  } catch (error) {
    console.error('Start runner error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/schema-linking/runner/stop
 * Stop the automated runner
 */
router.post('/runner/stop', async (req, res) => {
  try {
    const runner = getSchemaRunner();
    await runner.stop();
    
    res.json({
      success: true,
      message: 'Schema linking runner stopped',
      status: runner.getStatus()
    });
  } catch (error) {
    console.error('Stop runner error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/schema-linking/runner/run
 * Run a single linking cycle
 */
router.post('/runner/run', async (req, res) => {
  try {
    const runner = getSchemaRunner();
    
    if (!runner.service) {
      await runner.initialize();
    }
    
    const result = await runner.runLinkingCycle();
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Run cycle error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/schema-linking/dashboards/:feature
 * Get dashboard configurations for a feature
 */
router.get('/dashboards/:feature', async (req, res) => {
  try {
    const service = getSchemaService();
    const featureName = req.params.feature;
    
    if (service.featureInteractions.size === 0) {
      await service.analyzeDatabaseSchema();
    }
    
    const linkedSchema = service.generateLinkedSchemaMap(featureName);
    
    if (!linkedSchema) {
      return res.status(404).json({
        success: false,
        error: `Feature '${featureName}' not found`
      });
    }
    
    res.json({
      success: true,
      data: {
        feature: featureName,
        dashboards: linkedSchema.dashboards
      }
    });
  } catch (error) {
    console.error('Get dashboards error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/schema-linking/workflows/:feature
 * Get workflow configurations for a feature
 */
router.get('/workflows/:feature', async (req, res) => {
  try {
    const service = getSchemaService();
    const featureName = req.params.feature;
    
    if (service.featureInteractions.size === 0) {
      await service.analyzeDatabaseSchema();
    }
    
    const linkedSchema = service.generateLinkedSchemaMap(featureName);
    
    if (!linkedSchema) {
      return res.status(404).json({
        success: false,
        error: `Feature '${featureName}' not found`
      });
    }
    
    res.json({
      success: true,
      data: {
        feature: featureName,
        workflows: linkedSchema.workflows
      }
    });
  } catch (error) {
    console.error('Get workflows error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/schema-linking/health
 * Health check endpoint
 */
router.get('/health', async (req, res) => {
  try {
    res.json({
      success: true,
      service: 'schema-linking',
      status: 'healthy',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
