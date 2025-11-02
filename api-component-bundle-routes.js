/**
 * API Routes for Component Bundles
 * 
 * Provides endpoints for creating, reading, updating, and deleting component bundles
 * Integrates with Ollama for AI-powered generation
 */

import express from 'express';

export function addComponentBundleRoutes(app, db, io) {
  const router = express.Router();

  // Get all component bundles
  router.get('/bundles', async (req, res) => {
    try {
      const result = await db.query(
        'SELECT * FROM component_bundles ORDER BY created_at DESC'
      );
      res.json({ bundles: result.rows });
    } catch (error) {
      console.error('Error fetching bundles:', error);
      res.status(500).json({ error: 'Failed to fetch component bundles' });
    }
  });

  // Get single bundle by ID
  router.get('/bundles/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const result = await db.query(
        'SELECT * FROM component_bundles WHERE id = $1',
        [id]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Bundle not found' });
      }
      
      res.json({ bundle: result.rows[0] });
    } catch (error) {
      console.error('Error fetching bundle:', error);
      res.status(500).json({ error: 'Failed to fetch bundle' });
    }
  });

  // Create new component bundle
  router.post('/bundles', async (req, res) => {
    try {
      const { name, description, components, config, mockDataEnabled } = req.body;
      
      if (!name || !components || components.length === 0) {
        return res.status(400).json({ 
          error: 'Name and components are required' 
        });
      }

      const result = await db.query(
        `INSERT INTO component_bundles 
         (name, description, components, config, mock_data_enabled, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
         RETURNING *`,
        [name, description, JSON.stringify(components), JSON.stringify(config), mockDataEnabled]
      );

      const bundle = result.rows[0];
      
      // Emit WebSocket event
      io.emit('component-bundle:created', { bundle });
      
      res.status(201).json({ bundle });
    } catch (error) {
      console.error('Error creating bundle:', error);
      res.status(500).json({ error: 'Failed to create bundle' });
    }
  });

  // Update component bundle
  router.put('/bundles/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { name, description, components, config, mockDataEnabled } = req.body;

      const result = await db.query(
        `UPDATE component_bundles 
         SET name = $1, description = $2, components = $3, config = $4, 
             mock_data_enabled = $5, updated_at = NOW()
         WHERE id = $6
         RETURNING *`,
        [name, description, JSON.stringify(components), JSON.stringify(config), mockDataEnabled, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Bundle not found' });
      }

      const bundle = result.rows[0];
      
      // Emit WebSocket event
      io.emit('component-bundle:updated', { bundle });
      
      res.json({ bundle });
    } catch (error) {
      console.error('Error updating bundle:', error);
      res.status(500).json({ error: 'Failed to update bundle' });
    }
  });

  // Delete component bundle
  router.delete('/bundles/:id', async (req, res) => {
    try {
      const { id } = req.params;
      
      const result = await db.query(
        'DELETE FROM component_bundles WHERE id = $1 RETURNING id',
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Bundle not found' });
      }

      // Emit WebSocket event
      io.emit('component-bundle:deleted', { id });
      
      res.json({ message: 'Bundle deleted successfully' });
    } catch (error) {
      console.error('Error deleting bundle:', error);
      res.status(500).json({ error: 'Failed to delete bundle' });
    }
  });

  // Generate component bundle using AI
  router.post('/generate', async (req, res) => {
    try {
      const { prompt, selectedComponents, mockDataEnabled } = req.body;

      if (!prompt || !selectedComponents) {
        return res.status(400).json({ 
          error: 'Prompt and selected components are required' 
        });
      }

      // Call Ollama service
      const ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434';
      const response = await fetch(`${ollamaUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'deepseek-r1',
          prompt: `You are a component configuration expert. Generate a valid JSON component bundle configuration.

Selected components: ${selectedComponents.join(', ')}
Mock data enabled: ${mockDataEnabled}

User request: ${prompt}

Generate a JSON configuration with this structure:
{
  "name": "bundle-name",
  "description": "Brief description",
  "components": [
    {
      "id": "component-id",
      "type": "stat-card|chart|table|form",
      "config": {
        "dataSource": "schema-id",
        "fields": [],
        "layout": {}
      }
    }
  ],
  "dataSources": [],
  "mockData": ${mockDataEnabled}
}

Return ONLY the JSON, no additional text.`,
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error('Ollama service error');
      }

      const data = await response.json();
      
      // Extract JSON from response
      const jsonMatch = data.response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON in response');
      }

      const config = JSON.parse(jsonMatch[0]);
      
      res.json(config);
    } catch (error) {
      console.error('Error generating bundle:', error);
      res.status(500).json({ 
        error: 'Failed to generate bundle configuration',
        message: error.message 
      });
    }
  });

  app.use('/api/component-generator', router);
}

// Database schema for component_bundles table
export const componentBundleSchema = `
CREATE TABLE IF NOT EXISTS component_bundles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  components JSONB NOT NULL,
  config JSONB,
  mock_data_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bundles_created ON component_bundles(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bundles_name ON component_bundles(name);
`;
