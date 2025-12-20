/**
 * Simple test to check if Swagger JSDos is working
 */

import swaggerJsdoc from 'swagger-jsdoc';
import { baseSwaggerConfig } from './config/swagger-config.js';

console.log('Testing swagger-jsdoc...\n');

console.log('Config:');
console.log(JSON.stringify(baseSwaggerConfig, null, 2));
console.log('\n');

try {
  console.log('Generating spec...');
  const spec = swaggerJsdoc(baseSwaggerConfig);
  
  console.log('\n✅ Spec generated successfully!');
  console.log(`Info: ${spec.info.title}`);
  console.log(`OpenAPI version: ${spec.openapi}`);
  console.log(`Paths: ${Object.keys(spec.paths || {}).length}`);
  console.log(`Components: ${Object.keys(spec.components || {}).length}`);
  
  if (spec.paths) {
    console.log('\nEndpoints:');
    Object.keys(spec.paths).forEach(path => {
      console.log(`  - ${path}`);
    });
  } else {
    console.log('\n⚠️  No paths found in spec');
  }
  
} catch (error) {
  console.error('\n❌ Error generating spec:', error.message);
  console.error(error.stack);
  process.exit(1);
}
