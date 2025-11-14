/**
 * Swagger/OpenAPI Configuration
 * Auto-generates API documentation from JSDoc comments and OpenAPI spec
 * Includes support for dynamically generated category CRUD APIs
 */

import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load base OpenAPI spec
const openAPISpec = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../docs/openapi.json'), 'utf-8')
);

// Swagger JSDoc configuration
const swaggerOptions = {
  definition: openAPISpec,
  apis: [
    './src/api/routes/*.js',
    './src/api/controllers/*.js',
    './src/api-server.js',
    './api/*.js',
    './api/routes/*.js'
  ],
};

// Generate Swagger spec
const swaggerSpec = swaggerJsdoc(swaggerOptions);

/**
 * Setup Swagger documentation with auto-generated category APIs
 */
export const setupSwagger = (app, crudGenerator = null) => {
  // If CRUD generator is provided, merge its documentation
  if (crudGenerator) {
    try {
      const categorySwagger = crudGenerator.getSwaggerDocumentation();
      
      // Merge paths
      swaggerSpec.paths = {
        ...swaggerSpec.paths,
        ...categorySwagger.paths
      };
      
      // Merge tags
      if (categorySwagger.tags) {
        swaggerSpec.tags = swaggerSpec.tags || [];
        swaggerSpec.tags.push(...categorySwagger.tags);
      }
      
      // Merge schemas
      if (categorySwagger.components && categorySwagger.components.schemas) {
        swaggerSpec.components = swaggerSpec.components || {};
        swaggerSpec.components.schemas = {
          ...swaggerSpec.components.schemas,
          ...categorySwagger.components.schemas
        };
      }
      
      console.log('✅ Merged auto-generated category API documentation into Swagger');
    } catch (error) {
      console.error('⚠️  Failed to merge category API documentation:', error.message);
    }
  }
  
  // Serve Swagger UI
  app.use('/api-docs', swaggerUi.serve);
  app.get('/api-docs', swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'LightDom API Documentation',
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
      syntaxHighlight: {
        activate: true,
        theme: 'monokai'
      }
    }
  }));
  
  // Serve OpenAPI JSON spec
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
  
  // Serve auto-generated category API documentation separately
  if (crudGenerator) {
    app.get('/api-docs/categories.json', (req, res) => {
      try {
        const categorySwagger = crudGenerator.getSwaggerDocumentation();
        res.setHeader('Content-Type', 'application/json');
        res.send(categorySwagger);
      } catch (error) {
        res.status(500).json({ error: 'Failed to generate category documentation' });
      }
    });
    console.log('📄 Category API spec available at /api-docs/categories.json');
  }
  
  console.log('📚 Swagger documentation available at /api-docs');
  console.log('📄 OpenAPI spec available at /api-docs.json');
};

export default setupSwagger;
