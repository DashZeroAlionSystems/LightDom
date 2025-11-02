# Schema Quick Reference Guide
## Fast Lookup for Schema-Driven Development

**Version:** 1.0  
**Date:** November 2024

---

## Table of Contents

1. [Schema Type Mappings](#schema-type-mappings)
2. [Component Generation Patterns](#component-generation-patterns)
3. [Validation Rules](#validation-rules)
4. [Schema.org Common Types](#schemaorg-common-types)
5. [AI Prompts for Schemas](#ai-prompts-for-schemas)
6. [Useful Commands](#useful-commands)

---

## Schema Type Mappings

### Database → TypeScript

| Database Type | TypeScript Type | Zod Schema |
|--------------|----------------|------------|
| `VARCHAR` | `string` | `z.string()` |
| `TEXT` | `string` | `z.string()` |
| `UUID` | `string` | `z.string().uuid()` |
| `INTEGER` | `number` | `z.number().int()` |
| `DECIMAL` | `number` | `z.number()` |
| `BOOLEAN` | `boolean` | `z.boolean()` |
| `TIMESTAMP` | `Date` | `z.date()` |
| `JSONB` | `any` | `z.any()` or `z.record()` |
| `ARRAY` | `T[]` | `z.array(z.string())` |

### Database → React Component

| Database Type | React Component | Ant Design | Material-UI |
|--------------|----------------|------------|-------------|
| `VARCHAR` | Text Input | `<Input />` | `<TextField />` |
| `TEXT` | Textarea | `<Input.TextArea />` | `<TextField multiline />` |
| `INTEGER` | Number Input | `<InputNumber />` | `<TextField type="number" />` |
| `BOOLEAN` | Switch/Checkbox | `<Switch />` | `<Switch />` |
| `TIMESTAMP` | Date Picker | `<DatePicker />` | `<DatePicker />` |
| `ENUM` | Select/Radio | `<Select />` | `<Select />` |
| `FOREIGN_KEY` | Select (async) | `<Select showSearch />` | `<Autocomplete />` |

### Schema.org → HTML

| Schema Type | HTML Element | Microdata |
|------------|-------------|-----------|
| Article | `<article>` | `itemtype="Article"` |
| Person | `<div>` | `itemtype="Person"` |
| Product | `<div>` | `itemtype="Product"` |
| Organization | `<div>` | `itemtype="Organization"` |
| Event | `<div>` | `itemtype="Event"` |

---

## Component Generation Patterns

### 1. Form Component Pattern

```typescript
// Template
interface ${Name}FormProps {
  initialValues?: Partial<${Name}>;
  onSubmit: (values: ${Name}) => Promise<void>;
}

export const ${Name}Form: React.FC<${Name}FormProps> = ({
  initialValues,
  onSubmit
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      await onSubmit(values);
      message.success('Success');
    } catch (error) {
      message.error('Failed');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Form form={form} onFinish={handleSubmit} initialValues={initialValues}>
      {/* Fields */}
      <Button type="primary" htmlType="submit" loading={loading}>
        Submit
      </Button>
    </Form>
  );
};
```

### 2. Table Component Pattern

```typescript
// Template
interface ${Name}TableProps {
  data: ${Name}[];
  loading?: boolean;
  onEdit: (record: ${Name}) => void;
  onDelete: (id: string) => Promise<void>;
}

export const ${Name}Table: React.FC<${Name}TableProps> = ({
  data,
  loading,
  onEdit,
  onDelete
}) => {
  const columns = [
    // Column definitions
    {
      title: 'Actions',
      render: (_, record) => (
        <Space>
          <Button onClick={() => onEdit(record)}>Edit</Button>
          <Popconfirm onConfirm={() => onDelete(record.id)}>
            <Button danger>Delete</Button>
          </Popconfirm>
        </Space>
      )
    }
  ];
  
  return <Table columns={columns} dataSource={data} loading={loading} />;
};
```

### 3. Detail View Pattern

```typescript
// Template
interface ${Name}DetailProps {
  data?: ${Name};
  loading?: boolean;
}

export const ${Name}Detail: React.FC<${Name}DetailProps> = ({
  data,
  loading
}) => {
  if (loading) return <Spin />;
  if (!data) return <Empty />;
  
  return (
    <Descriptions bordered>
      {/* Field descriptions */}
    </Descriptions>
  );
};
```

---

## Validation Rules

### Common Zod Patterns

```typescript
// Email
z.string().email()

// URL
z.string().url()

// Phone (US)
z.string().regex(/^\+?1?\d{10,14}$/)

// Password (strong)
z.string()
  .min(8)
  .regex(/[A-Z]/, "Must contain uppercase")
  .regex(/[a-z]/, "Must contain lowercase")
  .regex(/[0-9]/, "Must contain number")
  .regex(/[^A-Za-z0-9]/, "Must contain special char")

// UUID
z.string().uuid()

// Date range
z.date().min(new Date("2020-01-01"))

// Number range
z.number().min(0).max(100)

// String length
z.string().min(3).max(50)

// Array length
z.array(z.string()).min(1).max(5)

// Enum
z.enum(["admin", "user", "moderator"])

// Optional with default
z.string().default("default value")

// Conditional validation
z.string().refine((val) => val.length > 0, {
  message: "Cannot be empty"
})

// Object with nested validation
z.object({
  name: z.string(),
  address: z.object({
    street: z.string(),
    city: z.string()
  })
})

// Union types
z.union([z.string(), z.number()])

// Discriminated union
z.discriminatedUnion("type", [
  z.object({ type: z.literal("email"), email: z.string().email() }),
  z.object({ type: z.literal("phone"), phone: z.string() })
])
```

### Ant Design Validation Rules

```typescript
// Required
{ required: true, message: 'This field is required' }

// Email
{ type: 'email', message: 'Invalid email' }

// URL
{ type: 'url', message: 'Invalid URL' }

// Min/Max length
{ min: 3, max: 50, message: 'Length must be 3-50 chars' }

// Pattern
{ pattern: /^[A-Za-z]+$/, message: 'Only letters allowed' }

// Custom validator
{
  validator: async (_, value) => {
    if (value < 18) {
      throw new Error('Must be 18 or older');
    }
  }
}

// Async validator (check uniqueness)
{
  validator: async (_, value) => {
    const exists = await checkIfExists(value);
    if (exists) {
      throw new Error('Already exists');
    }
  }
}
```

---

## Schema.org Common Types

### Article

```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Title",
  "image": "image.jpg",
  "author": {
    "@type": "Person",
    "name": "Author Name"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Publisher",
    "logo": "logo.png"
  },
  "datePublished": "2024-01-01",
  "dateModified": "2024-02-01"
}
```

### Product

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Product Name",
  "image": "product.jpg",
  "description": "Description",
  "brand": {
    "@type": "Brand",
    "name": "Brand Name"
  },
  "offers": {
    "@type": "Offer",
    "price": "99.99",
    "priceCurrency": "USD",
    "availability": "https://schema.org/InStock"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.5",
    "reviewCount": "100"
  }
}
```

### Person

```json
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Jane Doe",
  "email": "jane@example.com",
  "jobTitle": "Developer",
  "worksFor": {
    "@type": "Organization",
    "name": "Company"
  },
  "sameAs": [
    "https://twitter.com/janedoe",
    "https://linkedin.com/in/janedoe"
  ]
}
```

### Organization

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Company Name",
  "url": "https://example.com",
  "logo": "logo.png",
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+1-555-0123",
    "contactType": "customer service"
  },
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "123 Main St",
    "addressLocality": "City",
    "addressRegion": "State",
    "postalCode": "12345",
    "addressCountry": "US"
  }
}
```

### Event

```json
{
  "@context": "https://schema.org",
  "@type": "Event",
  "name": "Event Name",
  "startDate": "2024-06-15T09:00",
  "endDate": "2024-06-16T18:00",
  "location": {
    "@type": "Place",
    "name": "Venue Name",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "123 Event St",
      "addressLocality": "City"
    }
  },
  "offers": {
    "@type": "Offer",
    "price": "50",
    "priceCurrency": "USD",
    "availability": "https://schema.org/InStock"
  }
}
```

---

## AI Prompts for Schemas

### Generate Component from Schema

```
Generate a React component with TypeScript from this database schema:

Table: users
Columns:
- id (UUID, primary key)
- email (VARCHAR, unique, not null)
- name (VARCHAR, not null)
- age (INTEGER)
- is_active (BOOLEAN, default true)
- created_at (TIMESTAMP)

Requirements:
- Use Ant Design for UI
- Add Zod validation
- Include form, table, and detail views
- Add proper error handling
- Make it accessible
```

### Refine Existing Component

```
Improve this React component:

[paste component code]

Please:
1. Add TypeScript strict types
2. Improve accessibility (ARIA labels, keyboard navigation)
3. Optimize performance (memoization)
4. Add comprehensive error handling
5. Follow React best practices
```

### Generate Schema.org Markup

```
Generate Schema.org JSON-LD markup for:

Type: BlogPosting
Title: "Understanding React Hooks"
Author: Jane Doe
Published: 2024-01-15
Modified: 2024-02-01
Publisher: Tech Blog
Image: featured-image.jpg

Include:
- Article structured data
- Author person schema
- Publisher organization schema
- Breadcrumbs
```

### Database Schema to API

```
Generate Express.js REST API endpoints from this database schema:

Table: products
Columns:
- id, name, description, price, stock, created_at

Requirements:
- CRUD operations
- Input validation with Joi
- Error handling
- TypeScript types
- OpenAPI documentation
```

---

## Useful Commands

### Code Generation

```bash
# Generate components from database
npm run generate:components

# Generate TypeScript types from JSON Schema
json2ts -i schema.json -o types.ts

# Generate API client from OpenAPI
openapi-generator-cli generate -i openapi.yaml -g typescript-axios -o src/api

# Generate GraphQL types
graphql-codegen --config codegen.yml

# Generate Prisma client
npx prisma generate
```

### Schema Validation

```bash
# Validate JSON Schema
ajv validate -s schema.json -d data.json

# Validate Schema.org markup
curl -X POST https://validator.schema.org/ -d @markup.json

# Google Rich Results Test
# Visit: https://search.google.com/test/rich-results
```

### Database Introspection

```bash
# PostgreSQL: List tables
psql -c "\dt"

# PostgreSQL: Describe table
psql -c "\d+ users"

# PostgreSQL: Export schema
pg_dump -s dbname > schema.sql

# Prisma: Introspect database
npx prisma db pull

# TypeORM: Generate migrations
typeorm migration:generate -n MigrationName
```

### Testing

```bash
# Run TypeScript type check
tsc --noEmit

# Run Zod validation tests
npm test validation.test.ts

# Test React components
npm test UserForm.test.tsx

# E2E tests with Puppeteer
npm run test:e2e
```

---

## Quick Copy-Paste Templates

### Zod + React Hook Form

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

type FormData = z.infer<typeof schema>;

function MyForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema)
  });

  const onSubmit = (data: FormData) => {
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} />
      {errors.email && <span>{errors.email.message}</span>}
      
      <input {...register('password')} type="password" />
      {errors.password && <span>{errors.password.message}</span>}
      
      <button type="submit">Submit</button>
    </form>
  );
}
```

### Ant Design Form with Validation

```typescript
import { Form, Input, Button } from 'antd';

function MyForm() {
  const [form] = Form.useForm();

  const onFinish = (values: any) => {
    console.log('Success:', values);
  };

  return (
    <Form form={form} onFinish={onFinish} layout="vertical">
      <Form.Item
        name="email"
        label="Email"
        rules={[
          { required: true, message: 'Email is required' },
          { type: 'email', message: 'Invalid email' }
        ]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        name="password"
        label="Password"
        rules={[
          { required: true, message: 'Password is required' },
          { min: 8, message: 'Password must be at least 8 characters' }
        ]}
      >
        <Input.Password />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit">
          Submit
        </Button>
      </Form.Item>
    </Form>
  );
}
```

### Schema.org JSON-LD Component

```typescript
import { Helmet } from 'react-helmet';

interface SchemaMarkupProps {
  type: string;
  data: any;
}

export const SchemaMarkup: React.FC<SchemaMarkupProps> = ({ type, data }) => {
  const schemaData = {
    "@context": "https://schema.org",
    "@type": type,
    ...data
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schemaData)}
      </script>
    </Helmet>
  );
};

// Usage
<SchemaMarkup
  type="Article"
  data={{
    headline: "My Article",
    author: { "@type": "Person", name: "John Doe" }
  }}
/>
```

---

## Related Documentation

- **Full Research:** [COMPREHENSIVE_SCHEMA_RESEARCH.md](./COMPREHENSIVE_SCHEMA_RESEARCH.md)
- **Implementation Examples:** [SCHEMA_IMPLEMENTATION_EXAMPLES.md](./SCHEMA_IMPLEMENTATION_EXAMPLES.md)
- **Existing Research:** [LINKED_SCHEMA_RESEARCH.md](./LINKED_SCHEMA_RESEARCH.md)

---

**Last Updated:** November 2, 2024  
**Maintained by:** LightDom Research Team
