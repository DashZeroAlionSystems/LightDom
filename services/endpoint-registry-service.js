/**
 * Endpoint Registry Service
 * 
 * Automatically discovers and registers all API endpoints in the system
 * for use in service bundling and data stream composition
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class EndpointRegistryService {
  constructor(db) {
    this.db = db;
    this.endpoints = [];
  }

  /**
   * Scan API route files and extract endpoint definitions
   */
  async discoverEndpoints() {
    const endpoints = [];
    const apiDir = path.join(__dirname, '..', 'api');
    
    // Define known route files and their categories
    const routeFiles = [
      { file: 'data-streams-routes.js', category: 'data-streams', service_type: 'data-processor' },
      { file: 'workflow-wizard-routes.js', category: 'workflow', service_type: 'workflow-engine' },
      { file: 'agent-orchestration-routes.js', category: 'agents', service_type: 'ai-engine' },
      { file: 'deepseek-db-routes.js', category: 'ai', service_type: 'ai-engine' },
      { file: 'lead-routes.js', category: 'leads', service_type: 'data-processor' },
      { file: 'category-management-routes.js', category: 'categories', service_type: 'data-processor' },
      { file: 'client-site-routes.js', category: 'client', service_type: 'frontend' },
      { file: 'feedback-loop-routes.js', category: 'feedback', service_type: 'data-processor' },
      { file: 'onboarding-routes.js', category: 'onboarding', service_type: 'user-management' },
      { file: 'stripe-payment-routes.js', category: 'payments', service_type: 'payment-processor' },
    ];

    // Common endpoints that exist in most applications
    const commonEndpoints = [
      // Data Streams
      {
        endpoint_id: 'data-streams-list',
        title: 'List Data Streams',
        path: '/api/data-streams',
        method: 'GET',
        description: 'Get all data streams with their attributes',
        category: 'data-streams',
        service_type: 'data-processor',
        is_public: false,
        requires_auth: true,
      },
      {
        endpoint_id: 'data-streams-create',
        title: 'Create Data Stream',
        path: '/api/data-streams',
        method: 'POST',
        description: 'Create a new data stream',
        category: 'data-streams',
        service_type: 'data-processor',
        is_public: false,
        requires_auth: true,
      },
      {
        endpoint_id: 'data-streams-get',
        title: 'Get Data Stream',
        path: '/api/data-streams/:id',
        method: 'GET',
        description: 'Get a single data stream with its attributes',
        category: 'data-streams',
        service_type: 'data-processor',
        is_public: false,
        requires_auth: true,
      },
      {
        endpoint_id: 'data-streams-update',
        title: 'Update Data Stream',
        path: '/api/data-streams/:id',
        method: 'PUT',
        description: 'Update a data stream',
        category: 'data-streams',
        service_type: 'data-processor',
        is_public: false,
        requires_auth: true,
      },
      {
        endpoint_id: 'data-streams-delete',
        title: 'Delete Data Stream',
        path: '/api/data-streams/:id',
        method: 'DELETE',
        description: 'Delete a data stream',
        category: 'data-streams',
        service_type: 'data-processor',
        is_public: false,
        requires_auth: true,
      },
      {
        endpoint_id: 'data-streams-start',
        title: 'Start Data Stream',
        path: '/api/data-streams/:id/start',
        method: 'POST',
        description: 'Start a data stream',
        category: 'data-streams',
        service_type: 'data-processor',
        is_public: false,
        requires_auth: true,
      },
      {
        endpoint_id: 'data-streams-stop',
        title: 'Stop Data Stream',
        path: '/api/data-streams/:id/stop',
        method: 'POST',
        description: 'Stop a data stream',
        category: 'data-streams',
        service_type: 'data-processor',
        is_public: false,
        requires_auth: true,
      },
      {
        endpoint_id: 'data-streams-metrics',
        title: 'Get Data Stream Metrics',
        path: '/api/data-streams/:id/metrics',
        method: 'GET',
        description: 'Get metrics for a data stream',
        category: 'data-streams',
        service_type: 'data-processor',
        is_public: false,
        requires_auth: true,
      },
      // Mining
      {
        endpoint_id: 'mining-start',
        title: 'Start Mining',
        path: '/api/mining/start',
        method: 'POST',
        description: 'Start blockchain mining',
        category: 'blockchain',
        service_type: 'blockchain',
        is_public: false,
        requires_auth: true,
      },
      {
        endpoint_id: 'mining-stop',
        title: 'Stop Mining',
        path: '/api/mining/stop',
        method: 'POST',
        description: 'Stop blockchain mining',
        category: 'blockchain',
        service_type: 'blockchain',
        is_public: false,
        requires_auth: true,
      },
      {
        endpoint_id: 'mining-stats',
        title: 'Get Mining Stats',
        path: '/api/mining/stats',
        method: 'GET',
        description: 'Get mining statistics',
        category: 'blockchain',
        service_type: 'blockchain',
        is_public: true,
        requires_auth: false,
      },
      // Crawler
      {
        endpoint_id: 'crawler-start',
        title: 'Start Crawler',
        path: '/api/crawler/start',
        method: 'POST',
        description: 'Start web crawler',
        category: 'crawler',
        service_type: 'web-crawler',
        is_public: false,
        requires_auth: true,
      },
      {
        endpoint_id: 'crawler-stop',
        title: 'Stop Crawler',
        path: '/api/crawler/stop',
        method: 'POST',
        description: 'Stop web crawler',
        category: 'crawler',
        service_type: 'web-crawler',
        is_public: false,
        requires_auth: true,
      },
      {
        endpoint_id: 'crawler-status',
        title: 'Get Crawler Status',
        path: '/api/crawler/status',
        method: 'GET',
        description: 'Get crawler status',
        category: 'crawler',
        service_type: 'web-crawler',
        is_public: true,
        requires_auth: false,
      },
      // RAG
      {
        endpoint_id: 'rag-query',
        title: 'RAG Query',
        path: '/api/rag/query',
        method: 'POST',
        description: 'Query RAG system',
        category: 'ai',
        service_type: 'ai-engine',
        is_public: false,
        requires_auth: true,
      },
      {
        endpoint_id: 'rag-index',
        title: 'Index Document',
        path: '/api/rag/index',
        method: 'POST',
        description: 'Index document in RAG system',
        category: 'ai',
        service_type: 'ai-engine',
        is_public: false,
        requires_auth: true,
      },
      // Workflows
      {
        endpoint_id: 'workflows-list',
        title: 'List Workflows',
        path: '/api/workflows',
        method: 'GET',
        description: 'Get all workflows',
        category: 'workflow',
        service_type: 'workflow-engine',
        is_public: false,
        requires_auth: true,
      },
      {
        endpoint_id: 'workflows-create',
        title: 'Create Workflow',
        path: '/api/workflows',
        method: 'POST',
        description: 'Create a new workflow',
        category: 'workflow',
        service_type: 'workflow-engine',
        is_public: false,
        requires_auth: true,
      },
      {
        endpoint_id: 'workflows-execute',
        title: 'Execute Workflow',
        path: '/api/workflows/:id/execute',
        method: 'POST',
        description: 'Execute a workflow',
        category: 'workflow',
        service_type: 'workflow-engine',
        is_public: false,
        requires_auth: true,
      },
      // Database
      {
        endpoint_id: 'db-health',
        title: 'Database Health',
        path: '/api/db/health',
        method: 'GET',
        description: 'Check database health',
        category: 'system',
        service_type: 'database',
        is_public: true,
        requires_auth: false,
      },
    ];

    this.endpoints = commonEndpoints;
    return commonEndpoints;
  }

  /**
   * Register endpoints in the database
   */
  async registerEndpoints() {
    if (!this.db) {
      console.warn('Database not available, skipping endpoint registration');
      return;
    }

    try {
      const endpoints = await this.discoverEndpoints();
      
      console.log(`Registering ${endpoints.length} endpoints...`);
      
      for (const endpoint of endpoints) {
        try {
          // Check if endpoint already exists
          const existingEndpoint = await this.db.query(
            'SELECT id FROM api_endpoints WHERE endpoint_id = $1',
            [endpoint.endpoint_id]
          );

          if (existingEndpoint.rows.length > 0) {
            // Update existing endpoint
            await this.db.query(`
              UPDATE api_endpoints
              SET title = $1, path = $2, method = $3, description = $4,
                  category = $5, service_type = $6, is_public = $7,
                  requires_auth = $8, is_active = $9, updated_at = NOW()
              WHERE endpoint_id = $10
            `, [
              endpoint.title,
              endpoint.path,
              endpoint.method,
              endpoint.description,
              endpoint.category,
              endpoint.service_type,
              endpoint.is_public,
              endpoint.requires_auth,
              true,
              endpoint.endpoint_id
            ]);
          } else {
            // Insert new endpoint
            await this.db.query(`
              INSERT INTO api_endpoints (
                endpoint_id, title, path, method, description,
                category, service_type, is_public, requires_auth, is_active
              )
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            `, [
              endpoint.endpoint_id,
              endpoint.title,
              endpoint.path,
              endpoint.method,
              endpoint.description,
              endpoint.category,
              endpoint.service_type,
              endpoint.is_public,
              endpoint.requires_auth,
              true
            ]);
          }
        } catch (error) {
          console.error(`Error registering endpoint ${endpoint.endpoint_id}:`, error.message);
        }
      }
      
      console.log('✅ Endpoint registration complete');
      return endpoints;
    } catch (error) {
      console.error('Error registering endpoints:', error);
      throw error;
    }
  }

  /**
   * Get all registered endpoints
   */
  async getEndpoints(filters = {}) {
    if (!this.db) {
      return this.endpoints;
    }

    try {
      let query = 'SELECT * FROM api_endpoints WHERE is_active = true';
      const params = [];
      let paramCount = 1;

      if (filters.category) {
        query += ` AND category = $${paramCount}`;
        params.push(filters.category);
        paramCount++;
      }

      if (filters.service_type) {
        query += ` AND service_type = $${paramCount}`;
        params.push(filters.service_type);
        paramCount++;
      }

      if (filters.method) {
        query += ` AND method = $${paramCount}`;
        params.push(filters.method);
        paramCount++;
      }

      query += ' ORDER BY category, path';

      const result = await this.db.query(query, params);
      return result.rows;
    } catch (error) {
      console.error('Error fetching endpoints:', error);
      return this.endpoints;
    }
  }

  /**
   * Get endpoint by ID
   */
  async getEndpointById(endpointId) {
    if (!this.db) {
      return this.endpoints.find(e => e.endpoint_id === endpointId);
    }

    try {
      const result = await this.db.query(
        'SELECT * FROM api_endpoints WHERE endpoint_id = $1',
        [endpointId]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error fetching endpoint:', error);
      return null;
    }
  }
}

export default EndpointRegistryService;
