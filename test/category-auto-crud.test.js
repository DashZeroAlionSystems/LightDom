/**
 * End-to-End Tests for Category Auto-CRUD Generation System
 * Tests the complete workflow from category creation to API usage
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Pool } from 'pg';
import express from 'express';
import request from 'supertest';
import CategoryCrudAutoGenerator from '../services/category-crud-auto-generator.js';
import createCategoryManagementRoutes from '../api/category-management-routes.js';

describe('Category Auto-CRUD Generation System - End to End', () => {
  let db;
  let app;
  let server;
  let crudGenerator;
  const testCategoryId = `test_category_${Date.now()}`;

  beforeAll(async () => {
    // Setup database connection
    db = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'dom_space_harvester',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
    });

    // Initialize CRUD generator
    crudGenerator = new CategoryCrudAutoGenerator(db);

    // Setup Express app
    app = express();
    app.use(express.json());

    // Mount category management routes
    app.use('/api/category-management', createCategoryManagementRoutes(db, crudGenerator));

    // Scan and generate initial APIs
    await crudGenerator.scanAndGenerateAPIs();
    
    // Mount generated routes
    crudGenerator.mountRoutes(app);

    // Start server
    server = app.listen(0); // Random port
  });

  afterAll(async () => {
    // Cleanup test data
    try {
      await db.query('DELETE FROM category_items WHERE category_id = $1', [testCategoryId]);
      await db.query('DELETE FROM auto_generated_api_routes WHERE category_id = $1', [testCategoryId]);
      await db.query('DELETE FROM categories WHERE category_id = $1', [testCategoryId]);
    } catch (error) {
      console.error('Error cleaning up test data:', error);
    }

    // Close connections
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
    if (db) {
      await db.end();
    }
  });

  describe('Category Management', () => {
    it('should list all categories', async () => {
      const response = await request(app)
        .get('/api/category-management/categories')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.count).toBeGreaterThan(0);
    });

    it('should get system configuration', async () => {
      const response = await request(app)
        .get('/api/category-management/config')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('auto_crud_generation');
      expect(response.body.data).toHaveProperty('swagger_integration');
    });

    it('should get category statistics', async () => {
      const response = await request(app)
        .get('/api/category-management/statistics')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('Category Creation with Auto-CRUD', () => {
    it('should create a new workflow category with auto-CRUD enabled', async () => {
      const newCategory = {
        name: testCategoryId,
        display_name: 'Test Workflow Category',
        description: 'Test category for automated workflows',
        category_type: 'workflow',
        auto_generate_crud_api: true,
        api_config: {
          crud_enabled: true,
          use_cases: ['execute', 'pause', 'resume'],
          search_fields: ['name', 'description'],
          filter_fields: ['status']
        },
        schema_definition: {
          fields: [
            { name: 'name', type: 'string', required: true },
            { name: 'description', type: 'text', required: false },
            { name: 'status', type: 'string', default: 'active' }
          ]
        }
      };

      const response = await request(app)
        .post('/api/category-management/categories')
        .send(newCategory)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('category_id');
      expect(response.body.data.name).toBe(testCategoryId);
      expect(response.body.data.auto_generate_crud_api).toBe(true);
    });

    it('should verify API route was auto-generated', async () => {
      const response = await request(app)
        .get('/api/category-management/routes')
        .expect(200);

      expect(response.body.success).toBe(true);
      
      const testRoute = response.body.data.find(r => r.categoryId === testCategoryId);
      expect(testRoute).toBeDefined();
      expect(testRoute.crud).toBe(true);
      expect(testRoute.endpoints.length).toBeGreaterThan(0);
    });

    it('should verify database trigger created route entry', async () => {
      const result = await db.query(
        'SELECT * FROM auto_generated_api_routes WHERE category_id = $1 AND status = $2',
        [testCategoryId, 'active']
      );

      expect(result.rows.length).toBeGreaterThan(0);
      expect(result.rows[0].crud_enabled).toBe(true);
    });
  });

  describe('Auto-Generated CRUD API Operations', () => {
    let testItemId;
    const basePath = `/api/categories/${testCategoryId}`;

    it('should create an item using auto-generated POST endpoint', async () => {
      const newItem = {
        name: 'Test Workflow Item',
        description: 'A test workflow for E2E testing',
        status: 'active',
        config: { timeout: 300 },
        metadata: { priority: 'high' }
      };

      // Need to regenerate routes first
      await crudGenerator.scanAndGenerateAPIs();
      crudGenerator.mountRoutes(app);

      const response = await request(app)
        .post(basePath)
        .send(newItem)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('item_id');
      expect(response.body.data.name).toBe(newItem.name);
      
      testItemId = response.body.data.item_id;
    });

    it('should list items using auto-generated GET endpoint', async () => {
      const response = await request(app)
        .get(basePath)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body).toHaveProperty('pagination');
    });

    it('should get item by ID using auto-generated GET /:id endpoint', async () => {
      const response = await request(app)
        .get(`${basePath}/${testItemId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.item_id).toBe(testItemId);
    });

    it('should update item using auto-generated PUT /:id endpoint', async () => {
      const updates = {
        name: 'Updated Test Workflow',
        description: 'Updated description',
        status: 'active'
      };

      const response = await request(app)
        .put(`${basePath}/${testItemId}`)
        .send(updates)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(updates.name);
    });

    it('should search items using query parameters', async () => {
      const response = await request(app)
        .get(`${basePath}?search=Updated&limit=10`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.pagination.limit).toBe(10);
    });

    it('should delete item using auto-generated DELETE /:id endpoint', async () => {
      const response = await request(app)
        .delete(`${basePath}/${testItemId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should return 404 for deleted item', async () => {
      await request(app)
        .get(`${basePath}/${testItemId}`)
        .expect(404);
    });
  });

  describe('Service Category Tests', () => {
    const serviceCategoryId = 'services';
    const basePath = `/api/categories/${serviceCategoryId}`;
    let testServiceId;

    it('should create a service item', async () => {
      const newService = {
        name: 'Test API Service',
        description: 'A test microservice',
        status: 'active',
        config: { port: 3000, protocol: 'http' },
        metadata: { version: '1.0.0' }
      };

      const response = await request(app)
        .post(basePath)
        .send(newService)
        .expect(201);

      expect(response.body.success).toBe(true);
      testServiceId = response.body.data.item_id;
    });

    it('should cleanup test service', async () => {
      if (testServiceId) {
        await request(app)
          .delete(`${basePath}/${testServiceId}`)
          .expect(200);
      }
    });
  });

  describe('Data Stream Category Tests', () => {
    const dataStreamCategoryId = 'data-streams';
    const basePath = `/api/categories/${dataStreamCategoryId}`;
    let testStreamId;

    it('should create a data stream item', async () => {
      const newStream = {
        name: 'Test Data Stream',
        description: 'A real-time data pipeline',
        status: 'active',
        config: { source: 'kafka', destination: 'postgres' }
      };

      const response = await request(app)
        .post(basePath)
        .send(newStream)
        .expect(201);

      expect(response.body.success).toBe(true);
      testStreamId = response.body.data.item_id;
    });

    it('should cleanup test stream', async () => {
      if (testStreamId) {
        await request(app)
          .delete(`${basePath}/${testStreamId}`)
          .expect(200);
      }
    });
  });

  describe('Swagger Documentation', () => {
    it('should generate Swagger/OpenAPI documentation', async () => {
      const response = await request(app)
        .get('/api/category-management/swagger')
        .expect(200);

      expect(response.body).toHaveProperty('openapi');
      expect(response.body).toHaveProperty('info');
      expect(response.body).toHaveProperty('paths');
      expect(response.body).toHaveProperty('components');
      expect(response.body.info.title).toBe('LightDom Auto-Generated Category APIs');
    });

    it('should include all category endpoints in Swagger', async () => {
      const response = await request(app)
        .get('/api/category-management/swagger')
        .expect(200);

      const paths = Object.keys(response.body.paths);
      expect(paths.length).toBeGreaterThan(0);
      
      // Check that our test category is included
      const testCategoryPath = `/api/categories/${testCategoryId}`;
      expect(paths).toContain(testCategoryPath);
    });
  });

  describe('Category Update and Regeneration', () => {
    it('should update category configuration', async () => {
      const updates = {
        description: 'Updated test category description',
        api_config: {
          crud_enabled: true,
          use_cases: ['execute', 'pause', 'resume', 'cancel'],
          search_fields: ['name', 'description', 'status']
        }
      };

      const response = await request(app)
        .put(`/api/category-management/categories/${testCategoryId}`)
        .send(updates)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.description).toBe(updates.description);
    });

    it('should regenerate routes after configuration change', async () => {
      const response = await request(app)
        .post('/api/category-management/routes/regenerate')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.categories_processed).toBeGreaterThan(0);
    });
  });

  describe('Multiple Category Types', () => {
    const categoryTypes = [
      'workflows',
      'services',
      'data-streams',
      'neural-networks',
      'tensorflow-models',
      'scrapers',
      'data-mining',
      'seeders',
      'campaigns',
      'client-management'
    ];

    it('should have routes for all default category types', async () => {
      const response = await request(app)
        .get('/api/category-management/routes')
        .expect(200);

      expect(response.body.success).toBe(true);
      
      const routeCategories = response.body.data.map(r => r.categoryId);
      
      // Check that at least most default categories are present
      let foundCount = 0;
      for (const catType of categoryTypes) {
        if (routeCategories.includes(catType)) {
          foundCount++;
        }
      }
      
      expect(foundCount).toBeGreaterThan(5); // At least half should be present
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for non-existent category item', async () => {
      await request(app)
        .get(`/api/categories/${testCategoryId}/nonexistent_id`)
        .expect(404);
    });

    it('should return 400 for invalid category creation', async () => {
      const invalidCategory = {
        // Missing required fields
        description: 'Invalid category'
      };

      const response = await request(app)
        .post('/api/category-management/categories')
        .send(invalidCategory)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 409 for duplicate category name', async () => {
      const duplicateCategory = {
        name: testCategoryId, // Already exists
        display_name: 'Duplicate Category',
        category_type: 'workflow'
      };

      const response = await request(app)
        .post('/api/category-management/categories')
        .send(duplicateCategory)
        .expect(409);

      expect(response.body.success).toBe(false);
    });
  });
});

describe('Category CRUD Generator Unit Tests', () => {
  let db;
  let generator;

  beforeAll(async () => {
    db = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'dom_space_harvester',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
    });

    generator = new CategoryCrudAutoGenerator(db);
  });

  afterAll(async () => {
    if (db) {
      await db.end();
    }
  });

  it('should initialize with default use-case handlers', () => {
    expect(generator.useCaseHandlers.size).toBeGreaterThan(0);
  });

  it('should register custom use-case handler', () => {
    const customHandler = async (db, id, params) => {
      return { success: true, custom: true };
    };

    generator.registerUseCaseHandler('test_category', 'custom_action', customHandler);
    
    expect(generator.useCaseHandlers.has('test_category:custom_action')).toBe(true);
  });

  it('should scan and generate APIs', async () => {
    const result = await generator.scanAndGenerateAPIs();
    
    expect(result.success).toBe(true);
    expect(result.categories_processed).toBeGreaterThan(0);
  });

  it('should get generated routes', () => {
    const routes = generator.getGeneratedRoutes();
    
    expect(Array.isArray(routes)).toBe(true);
    expect(routes.length).toBeGreaterThan(0);
  });

  it('should generate Swagger documentation', () => {
    const swagger = generator.getSwaggerDocumentation();
    
    expect(swagger).toHaveProperty('openapi');
    expect(swagger).toHaveProperty('paths');
    expect(swagger).toHaveProperty('components');
    expect(swagger.openapi).toBe('3.0.0');
  });
});
