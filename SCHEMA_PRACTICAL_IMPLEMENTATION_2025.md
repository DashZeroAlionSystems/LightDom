# Schema Implementation Guide - Ready-to-Use Patterns (2025)

**Last Updated:** November 5, 2025  
**Focus:** Practical, copy-paste ready implementations  
**Target:** LightDom project and similar platforms

---

## Quick Start: Schema-Driven Development in 30 Minutes

### Prerequisites
```bash
npm install zod @tanstack/react-query axios
npm install --save-dev @graphql-codegen/cli
```

### Step 1: Define Your Schema (5 min)

```typescript
// schemas/user.schema.ts
import { z } from 'zod';

export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(2).max(100),
  role: z.enum(['admin', 'user', 'moderator']),
  avatar: z.string().url().optional(),
  preferences: z.object({
    theme: z.enum(['light', 'dark', 'auto']),
    notifications: z.boolean(),
  }).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreateUserSchema = UserSchema.omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export const UpdateUserSchema = CreateUserSchema.partial();

export type User = z.infer<typeof UserSchema>;
export type CreateUser = z.infer<typeof CreateUserSchema>;
export type UpdateUser = z.infer<typeof UpdateUserSchema>;
```

### Step 2: Create API Client (5 min)

```typescript
// api/users.api.ts
import axios from 'axios';
import { User, CreateUser, UpdateUser, UserSchema } from '../schemas/user.schema';

const api = axios.create({
  baseURL: '/api',
});

export const usersApi = {
  async getAll(params?: { page?: number; limit?: number }) {
    const response = await api.get('/users', { params });
    return z.array(UserSchema).parse(response.data);
  },

  async getById(id: string) {
    const response = await api.get(`/users/${id}`);
    return UserSchema.parse(response.data);
  },

  async create(data: CreateUser) {
    const validated = CreateUserSchema.parse(data);
    const response = await api.post('/users', validated);
    return UserSchema.parse(response.data);
  },

  async update(id: string, data: UpdateUser) {
    const validated = UpdateUserSchema.parse(data);
    const response = await api.patch(`/users/${id}`, validated);
    return UserSchema.parse(response.data);
  },

  async delete(id: string) {
    await api.delete(`/users/${id}`);
  },
};
```

### Step 3: Create React Hooks (5 min)

```typescript
// hooks/useUsers.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '../api/users.api';

export function useUsers(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: ['users', params],
    queryFn: () => usersApi.getAll(params),
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => usersApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: usersApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUser }) =>
      usersApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', variables.id] });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: usersApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}
```

### Step 4: Create Form Component (10 min)

```typescript
// components/UserForm.tsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, Input, Select, Button, message } from 'antd';
import { CreateUserSchema, CreateUser } from '../schemas/user.schema';

interface UserFormProps {
  onSubmit: (data: CreateUser) => Promise<void>;
  initialValues?: Partial<CreateUser>;
  submitText?: string;
}

export const UserForm: React.FC<UserFormProps> = ({
  onSubmit,
  initialValues,
  submitText = 'Submit',
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateUser>({
    resolver: zodResolver(CreateUserSchema),
    defaultValues: initialValues,
  });

  const handleFormSubmit = async (data: CreateUser) => {
    try {
      await onSubmit(data);
      message.success('User saved successfully');
    } catch (error) {
      message.error('Failed to save user');
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)}>
      <div>
        <label>Email</label>
        <input {...register('email')} type="email" />
        {errors.email && <span className="error">{errors.email.message}</span>}
      </div>

      <div>
        <label>Name</label>
        <input {...register('name')} type="text" />
        {errors.name && <span className="error">{errors.name.message}</span>}
      </div>

      <div>
        <label>Role</label>
        <select {...register('role')}>
          <option value="user">User</option>
          <option value="moderator">Moderator</option>
          <option value="admin">Admin</option>
        </select>
        {errors.role && <span className="error">{errors.role.message}</span>}
      </div>

      <div>
        <label>Avatar URL (optional)</label>
        <input {...register('avatar')} type="url" />
        {errors.avatar && <span className="error">{errors.avatar.message}</span>}
      </div>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Saving...' : submitText}
      </button>
    </form>
  );
};
```

### Step 5: Create List Component (5 min)

```typescript
// components/UserList.tsx
import React from 'react';
import { Table, Button, Space, Popconfirm } from 'antd';
import { useUsers, useDeleteUser } from '../hooks/useUsers';

export const UserList: React.FC = () => {
  const { data: users, isLoading } = useUsers();
  const deleteUser = useDeleteUser();

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button type="link" href={`/users/${record.id}`}>
            View
          </Button>
          <Button type="link" href={`/users/${record.id}/edit`}>
            Edit
          </Button>
          <Popconfirm
            title="Are you sure?"
            onConfirm={() => deleteUser.mutate(record.id)}
          >
            <Button type="link" danger>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Table
      dataSource={users}
      columns={columns}
      loading={isLoading}
      rowKey="id"
    />
  );
};
```

---

## Advanced Patterns

### Pattern 1: Database Schema Introspection

```typescript
// utils/db-introspection.ts
import { Pool } from 'pg';

export interface TableSchema {
  tableName: string;
  columns: ColumnSchema[];
  relationships: RelationshipSchema[];
}

export interface ColumnSchema {
  name: string;
  type: string;
  nullable: boolean;
  defaultValue?: string;
  isPrimaryKey: boolean;
  isForeignKey: boolean;
}

export interface RelationshipSchema {
  foreignTable: string;
  foreignColumn: string;
  localColumn: string;
  type: 'one-to-one' | 'one-to-many' | 'many-to-many';
}

export async function introspectPostgresDatabase(
  connectionString: string,
  tables: string[]
): Promise<Map<string, TableSchema>> {
  const pool = new Pool({ connectionString });
  const schemas = new Map<string, TableSchema>();

  try {
    for (const tableName of tables) {
      // Get columns
      const columnsResult = await pool.query(`
        SELECT 
          column_name,
          data_type,
          is_nullable,
          column_default,
          (SELECT COUNT(*) FROM information_schema.constraint_column_usage 
           WHERE table_name = $1 AND column_name = columns.column_name 
           AND constraint_name LIKE '%_pkey') > 0 AS is_primary_key
        FROM information_schema.columns
        WHERE table_name = $1
        ORDER BY ordinal_position
      `, [tableName]);

      const columns: ColumnSchema[] = columnsResult.rows.map(row => ({
        name: row.column_name,
        type: mapPostgresTypeToZodType(row.data_type),
        nullable: row.is_nullable === 'YES',
        defaultValue: row.column_default,
        isPrimaryKey: row.is_primary_key,
        isForeignKey: false,
      }));

      // Get relationships
      const relationshipsResult = await pool.query(`
        SELECT
          tc.table_name,
          kcu.column_name,
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY'
          AND tc.table_name = $1
      `, [tableName]);

      const relationships: RelationshipSchema[] = relationshipsResult.rows.map(row => ({
        foreignTable: row.foreign_table_name,
        foreignColumn: row.foreign_column_name,
        localColumn: row.column_name,
        type: 'one-to-many', // Simplified, could be determined by cardinality
      }));

      schemas.set(tableName, {
        tableName,
        columns,
        relationships,
      });
    }
  } finally {
    await pool.end();
  }

  return schemas;
}

function mapPostgresTypeToZodType(pgType: string): string {
  const mapping: Record<string, string> = {
    'character varying': 'string',
    'varchar': 'string',
    'text': 'string',
    'integer': 'number',
    'bigint': 'number',
    'numeric': 'number',
    'decimal': 'number',
    'real': 'number',
    'double precision': 'number',
    'boolean': 'boolean',
    'timestamp': 'date',
    'timestamp with time zone': 'date',
    'date': 'date',
    'time': 'string',
    'uuid': 'string',
    'json': 'object',
    'jsonb': 'object',
  };

  return mapping[pgType.toLowerCase()] || 'unknown';
}
```

### Pattern 2: Schema-to-Zod Generator

```typescript
// generators/schema-to-zod.ts
import { z } from 'zod';
import { TableSchema, ColumnSchema } from '../utils/db-introspection';

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

function toPascalCase(str: string): string {
  return str
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}
```

### Pattern 3: React Component Generator

```typescript
// generators/component-generator.ts
import { TableSchema } from '../utils/db-introspection';

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

function toPascalCase(str: string): string {
  return str
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}
```

---

## Complete CLI Tool

```typescript
// cli/generate.ts
import { Command } from 'commander';
import { introspectPostgresDatabase } from '../utils/db-introspection';
import { generateZodSchema } from '../generators/schema-to-zod';
import { generateFormComponent } from '../generators/component-generator';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const program = new Command();

program
  .name('lightdom-schema-gen')
  .description('Generate schemas and components from database')
  .version('1.0.0');

program
  .command('generate')
  .description('Generate schemas and components')
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
    mkdirSync(schemasDir, { recursive: true });
    mkdirSync(componentsDir, { recursive: true });
    
    // Generate files
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
      
      console.log(`  ✓ Created ${tableName}.schema.ts`);
      console.log(`  ✓ Created ${toPascalCase(tableName)}Form.tsx`);
    }
    
    console.log('\n🎉 Generation complete!');
  });

program.parse();

function toPascalCase(str: string): string {
  return str
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}
```

### Usage

```bash
# Generate from database
npx tsx cli/generate.ts generate \
  --database "postgresql://user:pass@localhost:5432/mydb" \
  --tables "users,posts,comments" \
  --output "./src/generated"

# Output:
# src/generated/
#   schemas/
#     users.schema.ts
#     posts.schema.ts
#     comments.schema.ts
#   components/
#     UserForm.tsx
#     PostForm.tsx
#     CommentForm.tsx
```

---

## AI-Enhanced Generation

```typescript
// generators/ai-enhanced-generator.ts
import OpenAI from 'openai';
import { TableSchema } from '../utils/db-introspection';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateEnhancedComponent(
  tableSchema: TableSchema,
  requirements: string
): Promise<string> {
  const prompt = `
Generate a production-ready React component for a ${tableSchema.tableName} form.

Database Schema:
${JSON.stringify(tableSchema, null, 2)}

Requirements:
${requirements}

Generate a complete React component with:
- TypeScript
- Zod validation
- React Hook Form
- Ant Design components
- Proper error handling
- Accessibility attributes
- Responsive design
- Loading states

Return only the component code, no explanations.
  `;

  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo',
    messages: [
      {
        role: 'system',
        content: 'You are an expert React and TypeScript developer. Generate production-ready code.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.3,
  });

  return response.choices[0].message.content || '';
}

// Usage
const component = await generateEnhancedComponent(userSchema, `
Create a user registration form with:
- Avatar upload with preview
- Real-time email validation
- Password strength indicator
- Role selection with descriptions
- Terms acceptance checkbox
- Submit button with loading state
`);
```

---

## Testing Generated Components

```typescript
// __tests__/UserForm.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserForm } from '../components/UserForm';

describe('UserForm', () => {
  it('validates email format', async () => {
    const onSubmit = jest.fn();
    render(<UserForm onSubmit={onSubmit} />);
    
    const emailInput = screen.getByLabelText(/email/i);
    await userEvent.type(emailInput, 'invalid-email');
    
    const submitButton = screen.getByRole('button', { name: /submit/i });
    await userEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
    });
    
    expect(onSubmit).not.toHaveBeenCalled();
  });
  
  it('submits valid data', async () => {
    const onSubmit = jest.fn();
    render(<UserForm onSubmit={onSubmit} />);
    
    await userEvent.type(screen.getByLabelText(/email/i), 'user@example.com');
    await userEvent.type(screen.getByLabelText(/name/i), 'John Doe');
    await userEvent.selectOptions(screen.getByLabelText(/role/i), 'user');
    
    await userEvent.click(screen.getByRole('button', { name: /submit/i }));
    
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        email: 'user@example.com',
        name: 'John Doe',
        role: 'user',
      });
    });
  });
});
```

---

## Conclusion

This guide provides ready-to-use patterns for:
- ✅ Schema definition with Zod
- ✅ API client generation
- ✅ React hooks with React Query
- ✅ Form components with validation
- ✅ Database introspection
- ✅ Automated code generation
- ✅ AI-enhanced components
- ✅ Testing strategies

Copy and adapt these patterns for your LightDom project to achieve rapid, type-safe development.

---

**Next Steps:**
1. Start with the 30-minute quick start
2. Introspect your database schema
3. Generate your first components
4. Customize the generators for your needs
5. Add AI enhancement for complex components

**Related Documents:**
- SCHEMA_AI_RESEARCH_2025.md
- SCHEMA_GITHUB_PROJECTS_2025.md
- COMPREHENSIVE_SCHEMA_RESEARCH.md
