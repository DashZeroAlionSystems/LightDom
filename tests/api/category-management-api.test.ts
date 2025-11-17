import { beforeAll, afterAll, describe, it, expect } from 'vitest';
import express, { type Express } from 'express';
import request from 'supertest';
import { Pool } from 'pg';
import createCategoryManagementRoutes from '../../api/category-management-routes.js';

const connectionString = process.env.TEST_DATABASE_URL || process.env.DATABASE_URL;

const describeIfDb = connectionString ? describe : describe.skip;

describeIfDb('Category Management API', () => {
  const slug = `vitest-category-${Date.now()}`;
  let pool: Pool;
  let app: Express;

  beforeAll(async () => {
    pool = new Pool({ connectionString });
    app = express();
    app.use(express.json());

    const crudGeneratorMock = {
      scanAndGenerateAPIs: async () => undefined,
      getGeneratedRoutes: () => [],
      getSwaggerDocumentation: () => ({ paths: {}, components: {} }),
    };

    app.use('/api/category-management', createCategoryManagementRoutes(pool, crudGeneratorMock));
  });

  afterAll(async () => {
    if (pool) {
      await pool.query('DELETE FROM categories WHERE slug = $1', [slug]);
      await pool.end();
    }
  });

  it('should create, retrieve, update, and delete a category', async () => {
    const createResponse = await request(app)
      .post('/api/category-management/categories')
      .send({
        slug,
        display_name: 'Vitest Demo Category',
        description: 'Integration test category',
        auto_generate_crud_api: false,
        schema_definition: {
          type: 'object',
          properties: {
            title: { type: 'string' },
          },
        },
      });

    expect(createResponse.status).toBe(201);
    expect(createResponse.body?.data?.slug).toBe(slug);

    const listResponse = await request(app).get('/api/category-management/categories');
    const slugs = listResponse.body?.data?.map((item: any) => item.slug) || [];
    expect(slugs).toContain(slug);

    const updateResponse = await request(app)
      .put(`/api/category-management/categories/${slug}`)
      .send({
        description: 'Updated description',
        metadata: { updated_by: 'vitest' },
      });

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body?.data?.description).toBe('Updated description');

    const deleteResponse = await request(app)
      .delete(`/api/category-management/categories/${slug}`);

    expect(deleteResponse.status).toBe(200);
    expect(deleteResponse.body?.data?.slug).toBe(slug);
  });

  it('should reject invalid schema definitions', async () => {
    const response = await request(app)
      .post('/api/category-management/categories')
      .send({
        slug: `${slug}-invalid`,
        display_name: 'Invalid Schema Category',
        schema_definition: {
          type: 'object',
          properties: {
            title: { type: 'unsupported', test: true },
          },
        },
      });

    expect(response.status).toBe(422);
    expect(response.body.success).toBe(false);
  });
});

if (!connectionString) {
  describe('Category Management API (skipped)', () => {
    it('skips because no database connection string provided', () => {
      expect(true).toBe(true);
    });
  });
}
