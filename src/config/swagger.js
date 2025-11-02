/**
 * Swagger/OpenAPI Configuration
 * Auto-generates API documentation from JSDoc comments and OpenAPI spec
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
    './src/api-server.js'
  ],
};

// Generate Swagger spec
const swaggerSpec = swaggerJsdoc(swaggerOptions);

/**
 * Setup Swagger documentation
 */
export const setupSwagger = (app) => {
  // Serve Swagger UI
  app.use('/api-docs', swaggerUi.serve);
  app.get('/api-docs', swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'LightDom API Documentation',
  }));
  
  // Serve OpenAPI JSON spec
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
  
  console.log('📚 Swagger documentation available at /api-docs');
  console.log('📄 OpenAPI spec available at /api-docs.json');
};

export default setupSwagger;
