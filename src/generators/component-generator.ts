// Component Generator
// Based on SCHEMA_PRACTICAL_IMPLEMENTATION_2025.md

import { TableSchema, ColumnSchema, toPascalCase } from '../utils/db-introspection';

export function generateFormComponent(tableSchema: TableSchema): string {
  const componentName = toPascalCase(tableSchema.tableName);
  const schemaName = componentName;
  const fields = tableSchema.columns
    .filter(col => !['id', 'createdAt', 'updatedAt'].includes(col.name))
    .map(col => generateFormField(col))
    .join('\n\n      ');

  return `
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ${schemaName}Schema, Create${schemaName} } from '../schemas/${tableSchema.tableName}.schema';

interface ${componentName}FormProps {
  onSubmit: (data: Create${componentName}) => Promise<void>;
  initialValues?: Partial<Create${componentName}>;
  submitText?: string;
}

export const ${componentName}Form: React.FC<${componentName}FormProps> = ({
  onSubmit,
  initialValues,
  submitText = 'Submit',
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Create${componentName}>({
    resolver: zodResolver(${schemaName}Schema),
    defaultValues: initialValues,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      ${fields}
      
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Saving...' : submitText}
      </button>
    </form>
  );
};
  `.trim();
}

function generateFormField(column: ColumnSchema): string {
  const label = column.name
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  let inputType = 'text';
  let inputElement = '<input {...register(\'{name}\')} type="{type}" />';

  if (column.name === 'email') {
    inputType = 'email';
  } else if (column.name.includes('password')) {
    inputType = 'password';
  } else if (column.type === 'number') {
    inputType = 'number';
  } else if (column.type === 'boolean') {
    inputElement = '<input {...register(\'{name}\')} type="checkbox" />';
  } else if (column.type === 'date') {
    inputType = 'date';
  } else if (column.name.includes('description') || column.name.includes('content')) {
    inputElement = '<textarea {...register(\'{name}\')} rows={4} />';
  }

  return `
      <div>
        <label>${label}</label>
        ${inputElement.replace('{name}', column.name).replace('{type}', inputType)}
        {errors.${column.name} && <span className="error">{errors.${column.name}.message}</span>}
      </div>
  `.trim();
}

export function generateAPIClient(tableSchema: TableSchema): string {
  const entityName = toPascalCase(tableSchema.tableName);
  const entityLower = entityName.charAt(0).toLowerCase() + entityName.slice(1);

  return `
// API Client for ${entityName}
import axios from 'axios';
import { ${entityName}, Create${entityName}, Update${entityName}, ${entityName}Schema } from '../schemas/${tableSchema.tableName}.schema';
import { z } from 'zod';

const api = axios.create({
  baseURL: '/api',
});

export const ${entityLower}Api = {
  async getAll(params?: { page?: number; limit?: number }) {
    const response = await api.get('/${tableSchema.tableName}', { params });
    return z.array(${entityName}Schema).parse(response.data);
  },

  async getById(id: string) {
    const response = await api.get(\`/${tableSchema.tableName}/\${id}\`);
    return ${entityName}Schema.parse(response.data);
  },

  async create(data: Create${entityName}) {
    const response = await api.post('/${tableSchema.tableName}', data);
    return ${entityName}Schema.parse(response.data);
  },

  async update(id: string, data: Update${entityName}) {
    const response = await api.patch(\`/${tableSchema.tableName}/\${id}\`, data);
    return ${entityName}Schema.parse(response.data);
  },

  async delete(id: string) {
    await api.delete(\`/${tableSchema.tableName}/\${id}\`);
  },
};
  `.trim();
}

export function generateReactHooks(tableSchema: TableSchema): string {
  const entityName = toPascalCase(tableSchema.tableName);
  const entityLower = entityName.charAt(0).toLowerCase() + entityName.slice(1);

  return `
// React Hooks for ${entityName}
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ${entityLower}Api } from '../api/${tableSchema.tableName}.api';
import { Update${entityName} } from '../schemas/${tableSchema.tableName}.schema';

export function use${entityName}s(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: ['${tableSchema.tableName}', params],
    queryFn: () => ${entityLower}Api.getAll(params),
  });
}

export function use${entityName}(id: string) {
  return useQuery({
    queryKey: ['${entityLower}', id],
    queryFn: () => ${entityLower}Api.getById(id),
    enabled: !!id,
  });
}

export function useCreate${entityName}() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ${entityLower}Api.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['${tableSchema.tableName}'] });
    },
  });
}

export function useUpdate${entityName}() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Update${entityName} }) =>
      ${entityLower}Api.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['${tableSchema.tableName}'] });
      queryClient.invalidateQueries({ queryKey: ['${entityLower}', variables.id] });
    },
  });
}

export function useDelete${entityName}() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ${entityLower}Api.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['${tableSchema.tableName}'] });
    },
  });
}
  `.trim();
}
