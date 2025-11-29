#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import swaggerJsdoc from 'swagger-jsdoc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const baseSpecPath = path.join(projectRoot, 'src', 'docs', 'openapi.json');

if (!fs.existsSync(baseSpecPath)) {
  console.error(`Base OpenAPI spec not found at ${baseSpecPath}`);
  process.exit(1);
}

const openAPISpec = JSON.parse(fs.readFileSync(baseSpecPath, 'utf-8'));

const swaggerOptions = {
  definition: openAPISpec,
  apis: [
    path.join(projectRoot, 'api', '**/*.js'),
    path.join(projectRoot, 'api-server-express.js'),
    path.join(projectRoot, 'src', 'api', '**/*.js'),
  ],
};

const spec = swaggerJsdoc(swaggerOptions);

const outputDir = path.join(projectRoot, 'docs', 'generated');
const outputPath = path.join(outputDir, 'openapi.generated.json');

fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify(spec, null, 2));

console.log(`✅ OpenAPI specification generated at ${outputPath}`);
