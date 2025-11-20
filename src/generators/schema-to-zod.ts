// Schema to Zod Generator
// Based on SCHEMA_PRACTICAL_IMPLEMENTATION_2025.md

import { TableSchema, ColumnSchema, toPascalCase } from '../utils/db-introspection';

export function generateZodSchema(tableSchema: TableSchema): string {
  const schemaName = toPascalCase(tableSchema.tableName);
  const fields = tableSchema.columns.map(col => generateField(col)).join(',\n  ');

  return `
import { z } from 'zod';

export const ${schemaName}Schema = z.object({
  ${fields}
});

export type ${schemaName} = z.infer<typeof ${schemaName}Schema>;

export const Create${schemaName}Schema = ${schemaName}Schema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const Update${schemaName}Schema = Create${schemaName}Schema.partial();

export type Create${schemaName} = z.infer<typeof Create${schemaName}Schema>;
export type Update${schemaName} = z.infer<typeof Update${schemaName}Schema>;
  `.trim();
}

function generateField(column: ColumnSchema): string {
  let zodType = '';

  switch (column.type) {
    case 'string':
      zodType = 'z.string()';
      if (column.name === 'email') zodType += '.email()';
      if (column.name === 'url' || column.name.includes('url')) zodType += '.url()';
      if (column.name === 'id' && !column.isForeignKey) zodType += '.uuid()';
      break;
    case 'number':
      zodType = 'z.number()';
      if (column.name.includes('age')) zodType += '.int().min(0).max(120)';
      if (column.name.includes('price')) zodType += '.min(0)';
      break;
    case 'boolean':
      zodType = 'z.boolean()';
      break;
    case 'date':
      zodType = 'z.date()';
      if (column.name === 'createdAt' || column.name === 'updatedAt') {
        zodType += '.default(() => new Date())';
      }
      break;
    case 'object':
      zodType = 'z.record(z.unknown())';
      break;
    default:
      zodType = 'z.unknown()';
  }

  if (column.nullable || column.defaultValue) {
    zodType += '.optional()';
  }

  if (column.defaultValue && column.defaultValue !== 'NULL') {
    const defaultVal = column.defaultValue.replace(/^'|'$/g, '');
    if (column.type === 'string') {
      zodType += `.default('${defaultVal}')`;
    } else if (column.type === 'boolean') {
      zodType += `.default(${defaultVal})`;
    }
  }

  return `${column.name}: ${zodType}`;
}
