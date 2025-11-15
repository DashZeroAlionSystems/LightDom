// Component Schema - Schema-driven component generation
// Based on SCHEMA_GITHUB_PROJECTS_2025.md patterns

import { z } from 'zod';

export const ComponentPropertySchema = z.object({
  name: z.string(),
  type: z.enum(['string', 'number', 'boolean', 'object', 'array', 'date']),
  required: z.boolean().default(false),
  default: z.unknown().optional(),
  validation: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
    pattern: z.string().optional(),
    enum: z.array(z.string()).optional(),
  }).optional(),
  uiComponent: z.enum(['Input', 'TextArea', 'Select', 'Switch', 'DatePicker', 'Upload']).optional(),
});

export const ComponentSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  type: z.enum(['form', 'table', 'detail', 'card', 'dashboard']),
  schema: z.record(z.unknown()),
  properties: z.array(ComponentPropertySchema),
  uiLibrary: z.enum(['antd', 'material-ui', 'chakra']).default('antd'),
  framework: z.enum(['react', 'vue', 'angular']).default('react'),
  generatedCode: z.string().optional(),
  metadata: z.object({
    tableName: z.string().optional(),
    relationships: z.array(z.string()).optional(),
    features: z.object({
      crud: z.boolean().default(true),
      validation: z.boolean().default(true),
      typescript: z.boolean().default(true),
      accessibility: z.boolean().default(true),
    }).optional(),
  }).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreateComponentSchema = ComponentSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  generatedCode: true,
});

export const UpdateComponentSchema = CreateComponentSchema.partial();

export type Component = z.infer<typeof ComponentSchema>;
export type ComponentProperty = z.infer<typeof ComponentPropertySchema>;
export type CreateComponent = z.infer<typeof CreateComponentSchema>;
export type UpdateComponent = z.infer<typeof UpdateComponentSchema>;
