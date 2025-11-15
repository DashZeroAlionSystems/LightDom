#!/usr/bin/env node
// LightDom Schema Generator CLI
// Based on SCHEMA_PRACTICAL_IMPLEMENTATION_2025.md

import { Command } from 'commander';
import { introspectPostgresDatabase, toPascalCase } from '../utils/db-introspection';
import { generateZodSchema } from '../generators/schema-to-zod';
import { generateFormComponent, generateAPIClient, generateReactHooks } from '../generators/component-generator';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const program = new Command();

program
  .name('lightdom-schema-gen')
  .description('Generate schemas and components from database')
  .version('1.0.0');

program
  .command('generate')
  .description('Generate schemas and components from database')
  .requiredOption('-d, --database <url>', 'Database connection URL')
  .option('-t, --tables <tables>', 'Comma-separated list of tables', 'users')
  .option('-o, --output <dir>', 'Output directory', './src/generated')
  .action(async (options) => {
    console.log('🔍 Introspecting database...');
    
    const tables = options.tables.split(',').map((t: string) => t.trim());
    const schemas = await introspectPostgresDatabase(options.database, tables);
    
    console.log(`✅ Found ${schemas.size} tables\n`);
    
    // Create output directories
    const schemasDir = join(options.output, 'schemas');
    const componentsDir = join(options.output, 'components');
    const apiDir = join(options.output, 'api');
    const hooksDir = join(options.output, 'hooks');
    
    mkdirSync(schemasDir, { recursive: true });
    mkdirSync(componentsDir, { recursive: true });
    mkdirSync(apiDir, { recursive: true });
    mkdirSync(hooksDir, { recursive: true });
    
    // Generate files for each table
    for (const [tableName, tableSchema] of schemas) {
      console.log(`📝 Generating files for ${tableName}...`);
      
      // Generate Zod schema
      const zodSchema = generateZodSchema(tableSchema);
      writeFileSync(
        join(schemasDir, `${tableName}.schema.ts`),
        zodSchema
      );
      
      // Generate form component
      const formComponent = generateFormComponent(tableSchema);
      writeFileSync(
        join(componentsDir, `${toPascalCase(tableName)}Form.tsx`),
        formComponent
      );
      
      // Generate API client
      const apiClient = generateAPIClient(tableSchema);
      writeFileSync(
        join(apiDir, `${tableName}.api.ts`),
        apiClient
      );
      
      // Generate React hooks
      const hooks = generateReactHooks(tableSchema);
      writeFileSync(
        join(hooksDir, `use${toPascalCase(tableName)}.ts`),
        hooks
      );
      
      console.log(`  ✓ Created ${tableName}.schema.ts`);
      console.log(`  ✓ Created ${toPascalCase(tableName)}Form.tsx`);
      console.log(`  ✓ Created ${tableName}.api.ts`);
      console.log(`  ✓ Created use${toPascalCase(tableName)}.ts`);
    }
    
    console.log('\n🎉 Generation complete!');
    console.log(`📁 Files created in ${options.output}`);
  });

program.parse();
