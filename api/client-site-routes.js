/**
 * Client Site Script Injection API Routes
 * 
 * Provides easy-to-use API endpoints for:
 * - Managing client sites
 * - Generating header scripts
 * - Creating and managing workflows
 * - Tracking injection status
 */

import express from 'express';
import crypto from 'crypto';
import { Pool } from 'pg';
import EnhancedDeepSeekN8NService from '../services/enhanced-deepseek-n8n-service.js';
import headerScriptWorkflowTemplates from '../services/header-script-workflow-templates.js';
import axios from 'axios';

const router = express.Router();

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// N8N client
const createN8NClient = () => axios.create({
  baseURL: process.env.N8N_API_URL || 'http://localhost:5678/api/v1',
  headers: {
    'X-N8N-API-KEY': process.env.N8N_API_KEY || '',
    'Content-Type': 'application/json'
  },
  timeout: 30000
});

// DeepSeek service instance
const deepseekService = new EnhancedDeepSeekN8NService();

/**
 * POST /api/client-sites
 * Create a new client site
 */
router.post('/', async (req, res) => {
  try {
    const { domain, userId, subscriptionTier, config } = req.body;

    if (!domain) {
      return res.status(400).json({
        success: false,
        error: 'Domain is required'
      });
    }

    // Generate API key
    const apiKey = crypto.randomBytes(32).toString('hex');
    const apiKeyHash = crypto.createHash('sha256').update(apiKey).digest('hex');

    // Insert client
    const result = await pool.query(`
      INSERT INTO seo_clients (
        user_id, domain, api_key, api_key_hash, 
        subscription_tier, config, settings, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, domain, api_key, subscription_tier, status, created_at
    `, [
      userId || null,
      domain,
      apiKey,
      apiKeyHash,
      subscriptionTier || 'starter',
      JSON.stringify(config || {}),
      JSON.stringify({ autoOptimize: true, realtimeUpdates: true }),
      'active'
    ]);

    const client = result.rows[0];

    res.json({
      success: true,
      client: {
        id: client.id,
        domain: client.domain,
        apiKey: client.api_key, // Only returned on creation
        subscriptionTier: client.subscription_tier,
        status: client.status,
        createdAt: client.created_at
      },
      message: 'Client site created successfully. Store the API key securely - it will not be shown again.'
    });
  } catch (error) {
    console.error('Error creating client site:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/client-sites
 * List all client sites
 */
router.get('/', async (req, res) => {
  try {
    const { status, scriptInjected, limit = 50, offset = 0 } = req.query;

    let query = 'SELECT id, domain, subscription_tier, status, script_injected, script_injection_date, script_version, created_at FROM seo_clients';
    const conditions = [];
    const params = [];
    let paramIndex = 1;

    if (status) {
      conditions.push(`status = $${paramIndex++}`);
      params.push(status);
    }

    if (scriptInjected !== undefined) {
      conditions.push(`script_injected = $${paramIndex++}`);
      params.push(scriptInjected === 'true');
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    res.json({
      success: true,
      count: result.rows.length,
      clients: result.rows
    });
  } catch (error) {
    console.error('Error fetching client sites:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/client-sites/:id
 * Get specific client site details
 */
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        id, domain, subscription_tier, status, 
        script_injected, script_injection_date, 
        injection_workflow_id, monitoring_workflow_id, optimization_workflow_id,
        header_script_content, script_version, last_script_update,
        auto_optimize, realtime_updates, config, settings, created_at, updated_at
      FROM seo_clients
      WHERE id = $1::uuid
    `, [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Client site not found'
      });
    }

    res.json({
      success: true,
      client: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching client site:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/client-sites/:id/generate-script
 * Generate header script for client site
 */
router.post('/:id/generate-script', async (req, res) => {
  try {
    const clientId = req.params.id;
    const { autoOptimize = true, realtimeUpdates = true } = req.body;

    // Get client info
    const clientResult = await pool.query(`
      SELECT id, domain, api_key, subscription_tier
      FROM seo_clients
      WHERE id = $1::uuid
    `, [clientId]);

    if (clientResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Client site not found'
      });
    }

    const client = clientResult.rows[0];
    const scriptVersion = 'v1.0.0';
    const cdnUrl = process.env.LIGHTDOM_CDN_URL || 'https://cdn.lightdom.io/seo/v1/lightdom-seo.js';

    // Generate header script
    const headerScript = `<!-- LightDom Automated SEO - Zero Config Setup -->
<script async src="${cdnUrl}"
        data-api-key="${client.api_key}"
        data-client-id="${client.id}"
        data-domain="${client.domain}"
        data-auto-optimize="${autoOptimize}"
        data-realtime="${realtimeUpdates}"
        data-version="${scriptVersion}">
</script>
<!-- This script provides:
     • Automatic JSON-LD schema injection
     • Real-time SEO optimization via SVG widgets
     • Competitor analysis and tracking
     • Performance monitoring
     • Rich snippet generation
     • No visual changes to your site
     • <5ms performance impact
-->`;

    // Update database
    await pool.query(`
      UPDATE seo_clients
      SET 
        header_script_content = $1,
        script_version = $2,
        script_injected = true,
        script_injection_date = NOW(),
        last_script_update = NOW(),
        auto_optimize = $3,
        realtime_updates = $4,
        updated_at = NOW()
      WHERE id = $5::uuid
    `, [headerScript, scriptVersion, autoOptimize, realtimeUpdates, clientId]);

    // Log event
    await pool.query(`
      INSERT INTO script_injection_events (
        client_id, event_type, script_version, status, details
      )
      VALUES ($1::uuid, 'injection', $2, 'success', $3)
    `, [clientId, scriptVersion, JSON.stringify({ autoOptimize, realtimeUpdates })]);

    res.json({
      success: true,
      headerScript,
      scriptVersion,
      instructions: {
        step1: 'Copy the header script above',
        step2: 'Paste it in the <head> section of your website',
        step3: 'The script will automatically start optimizing your site',
        step4: 'Monitor performance in your LightDom dashboard'
      }
    });
  } catch (error) {
    console.error('Error generating header script:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/client-sites/:id/create-workflows
 * Create n8n workflows for client site
 */
router.post('/:id/create-workflows', async (req, res) => {
  try {
    const clientId = req.params.id;
    const { useDeepseek = false, workflowTypes = ['injection', 'monitoring', 'optimization'] } = req.body;

    // Get client info
    const clientResult = await pool.query(`
      SELECT id, domain, api_key
      FROM seo_clients
      WHERE id = $1::uuid
    `, [clientId]);

    if (clientResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Client site not found'
      });
    }

    const client = clientResult.rows[0];
    const n8nClient = createN8NClient();
    const createdWorkflows = {};

    // Create workflows based on templates
    for (const workflowType of workflowTypes) {
      let template;
      
      switch (workflowType) {
        case 'injection':
          template = headerScriptWorkflowTemplates.scriptInjection;
          break;
        case 'monitoring':
          template = headerScriptWorkflowTemplates.siteMonitoring;
          break;
        case 'optimization':
          template = headerScriptWorkflowTemplates.optimizationUpdate;
          break;
        default:
          continue;
      }

      try {
        // Create workflow in n8n
        const workflowResponse = await n8nClient.post('/workflows', {
          name: `${template.name} - ${client.domain}`,
          nodes: template.nodes,
          connections: template.connections,
          settings: template.settings,
          tags: [...(template.tags || []), client.domain],
          active: true
        });

        const workflow = workflowResponse.data.data || workflowResponse.data;
        createdWorkflows[workflowType] = {
          id: workflow.id,
          name: workflow.name,
          active: workflow.active
        };

        // Update client with workflow ID
        const columnName = `${workflowType}_workflow_id`;
        await pool.query(`
          UPDATE seo_clients
          SET ${columnName} = $1, updated_at = NOW()
          WHERE id = $2::uuid
        `, [workflow.id, clientId]);

      } catch (workflowError) {
        console.error(`Error creating ${workflowType} workflow:`, workflowError);
        createdWorkflows[workflowType] = {
          error: workflowError.message
        };
      }
    }

    res.json({
      success: true,
      client: {
        id: client.id,
        domain: client.domain
      },
      workflows: createdWorkflows,
      message: 'Workflows created successfully'
    });
  } catch (error) {
    console.error('Error creating workflows:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/client-sites/:id/create-workflows/deepseek
 * Use DeepSeek AI to create custom workflows
 */
router.post('/:id/create-workflows/deepseek', async (req, res) => {
  try {
    const clientId = req.params.id;
    const { description, requirements } = req.body;

    // Get client info
    const clientResult = await pool.query(`
      SELECT id, domain, api_key, config
      FROM seo_clients
      WHERE id = $1::uuid
    `, [clientId]);

    if (clientResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Client site not found'
      });
    }

    const client = clientResult.rows[0];

    // Use DeepSeek to generate workflow
    const prompt = `Create a custom n8n workflow for the client site: ${client.domain}

Description: ${description || 'Complete SEO optimization workflow'}

Requirements:
${requirements || '- Monitor site performance\n- Track SEO metrics\n- Apply automatic optimizations'}

The workflow must:
1. Follow n8n best practices and standards
2. Use proper node types (webhook, httpRequest, function, postgres, etc.)
3. Include error handling and retries
4. Work with our existing database schema (seo_clients, seo_analytics, etc.)
5. Be production-ready and scalable

Generate a complete n8n workflow JSON configuration.`;

    const result = await deepseekService.interactiveWorkflowGeneration([
      { role: 'user', content: prompt }
    ], {
      clientId: client.id,
      domain: client.domain,
      config: client.config
    });

    res.json({
      success: true,
      client: {
        id: client.id,
        domain: client.domain
      },
      deepseek: {
        message: result.message,
        needsMoreInfo: result.needsMoreInfo,
        conversationId: result.conversationId
      },
      workflows: result.executedTools?.workflow ? {
        generated: result.executedTools.workflow
      } : null,
      nextSteps: result.needsMoreInfo 
        ? 'Provide more information based on the questions above'
        : 'Review the generated workflow and deploy it'
    });
  } catch (error) {
    console.error('Error creating workflow with DeepSeek:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/client-sites/:id/injection-status
 * Get script injection status and history
 */
router.get('/:id/injection-status', async (req, res) => {
  try {
    const clientId = req.params.id;

    // Get current status
    const clientResult = await pool.query(`
      SELECT 
        id, domain, script_injected, script_injection_date,
        script_version, last_script_update,
        injection_workflow_id, monitoring_workflow_id, optimization_workflow_id
      FROM seo_clients
      WHERE id = $1::uuid
    `, [clientId]);

    if (clientResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Client site not found'
      });
    }

    const client = clientResult.rows[0];

    // Get injection history
    const eventsResult = await pool.query(`
      SELECT 
        event_type, workflow_id, script_version, 
        status, details, error_message, created_at
      FROM script_injection_events
      WHERE client_id = $1::uuid
      ORDER BY created_at DESC
      LIMIT 20
    `, [clientId]);

    // Get workflow execution logs
    const logsResult = await pool.query(`
      SELECT 
        workflow_id, execution_id, status, 
        execution_time_ms, started_at, completed_at
      FROM workflow_execution_logs
      WHERE client_id = $1::uuid
      ORDER BY started_at DESC
      LIMIT 10
    `, [clientId]);

    res.json({
      success: true,
      client: client,
      injectionHistory: eventsResult.rows,
      workflowExecutions: logsResult.rows
    });
  } catch (error) {
    console.error('Error fetching injection status:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * PUT /api/client-sites/:id
 * Update client site settings
 */
router.put('/:id', async (req, res) => {
  try {
    const clientId = req.params.id;
    const { status, autoOptimize, realtimeUpdates, config, settings } = req.body;

    const updates = [];
    const params = [];
    let paramIndex = 1;

    if (status !== undefined) {
      updates.push(`status = $${paramIndex++}`);
      params.push(status);
    }

    if (autoOptimize !== undefined) {
      updates.push(`auto_optimize = $${paramIndex++}`);
      params.push(autoOptimize);
    }

    if (realtimeUpdates !== undefined) {
      updates.push(`realtime_updates = $${paramIndex++}`);
      params.push(realtimeUpdates);
    }

    if (config !== undefined) {
      updates.push(`config = $${paramIndex++}`);
      params.push(JSON.stringify(config));
    }

    if (settings !== undefined) {
      updates.push(`settings = $${paramIndex++}`);
      params.push(JSON.stringify(settings));
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid fields to update'
      });
    }

    updates.push('updated_at = NOW()');
    params.push(clientId);

    const query = `
      UPDATE seo_clients
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}::uuid
      RETURNING id, domain, status, auto_optimize, realtime_updates
    `;

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Client site not found'
      });
    }

    res.json({
      success: true,
      client: result.rows[0],
      message: 'Client site updated successfully'
    });
  } catch (error) {
    console.error('Error updating client site:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * DELETE /api/client-sites/:id
 * Delete client site
 */
router.delete('/:id', async (req, res) => {
  try {
    const clientId = req.params.id;

    const result = await pool.query(`
      DELETE FROM seo_clients
      WHERE id = $1::uuid
      RETURNING domain
    `, [clientId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Client site not found'
      });
    }

    res.json({
      success: true,
      message: `Client site ${result.rows[0].domain} deleted successfully`
    });
  } catch (error) {
    console.error('Error deleting client site:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
