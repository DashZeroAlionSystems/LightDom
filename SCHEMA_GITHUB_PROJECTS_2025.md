# Schema-Related GitHub Projects - 2025 Comprehensive Guide

**Last Updated:** November 5, 2025  
**Category:** Code Examples & Real-World Projects  
**Target Audience:** Developers implementing schema-driven systems

---

## Table of Contents

1. [Code Generation Tools](#code-generation-tools)
2. [Validation Libraries](#validation-libraries)
3. [UI Component Generators](#ui-component-generators)
4. [AI/ML Integration](#aiml-integration)
5. [Schema.org Tools](#schemaorg-tools)
6. [Full-Stack Examples](#full-stack-examples)
7. [LightDom Integration Examples](#lightdom-integration-examples)

---

## Code Generation Tools

### 1. GraphQL Code Generator
**Repository:** https://github.com/dotansimha/graphql-code-generator  
**Stars:** 11,170+ ⭐  
**Language:** TypeScript  
**License:** MIT

#### What it Does
The most popular GraphQL code generator. Creates TypeScript types, React hooks, and more from GraphQL schemas.

#### Installation
```bash
npm install --save-dev @graphql-codegen/cli
npm install --save-dev @graphql-codegen/typescript
npm install --save-dev @graphql-codegen/typescript-operations
npm install --save-dev @graphql-codegen/typescript-react-query
```

#### Configuration Example
```yaml
# codegen.yml
schema: "http://localhost:4000/graphql"
documents: "src/**/*.graphql"
generates:
  src/generated/graphql.ts:
    plugins:
      - typescript
      - typescript-operations
      - typescript-react-query
    config:
      withHooks: true
      fetcher:
        func: ./fetcher#fetcher
      scalars:
        DateTime: string
        UUID: string
```

#### Real-World Code Example
```typescript
// Input: schema.graphql
type User {
  id: ID!
  email: String!
  name: String!
  role: UserRole!
  posts: [Post!]!
}

enum UserRole {
  ADMIN
  USER
  MODERATOR
}

type Query {
  user(id: ID!): User
  users(limit: Int, offset: Int): [User!]!
}

type Mutation {
  createUser(input: CreateUserInput!): User!
  updateUser(id: ID!, input: UpdateUserInput!): User!
}

// Generated: graphql.ts
export type User = {
  __typename?: 'User';
  id: Scalars['ID'];
  email: Scalars['String'];
  name: Scalars['String'];
  role: UserRole;
  posts: Array<Post>;
};

export enum UserRole {
  Admin = 'ADMIN',
  User = 'USER',
  Moderator = 'MODERATOR'
}

// Generated React Hook
export function useGetUserQuery(
  variables: GetUserQueryVariables,
  options?: UseQueryOptions<GetUserQuery, Error>
) {
  return useQuery<GetUserQuery, Error>(
    ['GetUser', variables],
    fetcher<GetUserQuery, GetUserQueryVariables>(GetUserDocument, variables),
    options
  );
}

// Usage in Component
function UserProfile({ userId }: { userId: string }) {
  const { data, isLoading, error } = useGetUserQuery({ id: userId });
  
  if (isLoading) return <Spin />;
  if (error) return <Alert message={error.message} type="error" />;
  if (!data?.user) return <Empty />;
  
  return (
    <Card>
      <h2>{data.user.name}</h2>
      <p>{data.user.email}</p>
      <Tag>{data.user.role}</Tag>
    </Card>
  );
}
```

#### Key Features
- ✅ TypeScript types from GraphQL
- ✅ React Query/Apollo hooks
- ✅ Custom plugin system
- ✅ Monorepo support
- ✅ Watch mode for development

---

### 2. OpenAPI React Query Codegen
**Repository:** https://github.com/7nohe/openapi-react-query-codegen  
**Stars:** 409+ ⭐  
**Language:** TypeScript  
**License:** MIT

#### What it Does
Generates React Query (TanStack Query) hooks from OpenAPI/Swagger schemas.

#### Installation
```bash
npm install --save-dev @7nohe/openapi-react-query-codegen
```

#### Configuration
```json
// package.json
{
  "scripts": {
    "codegen": "openapi-rq -i ./openapi.yaml -o ./src/api"
  }
}
```

#### Real-World Example
```yaml
# openapi.yaml
openapi: 3.0.0
info:
  title: User API
  version: 1.0.0
paths:
  /users:
    get:
      operationId: getUsers
      parameters:
        - name: page
          in: query
          schema:
            type: integer
            default: 1
        - name: limit
          in: query
          schema:
            type: integer
            default: 10
      responses:
        '200':
          description: List of users
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/User'
    post:
      operationId: createUser
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateUserInput'
      responses:
        '201':
          description: Created user
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'

components:
  schemas:
    User:
      type: object
      required: [id, email, name]
      properties:
        id:
          type: string
          format: uuid
        email:
          type: string
          format: email
        name:
          type: string
        role:
          type: string
          enum: [admin, user, moderator]
    CreateUserInput:
      type: object
      required: [email, name]
      properties:
        email:
          type: string
          format: email
        name:
          type: string
        role:
          type: string
          enum: [admin, user, moderator]
```

```typescript
// Generated: src/api/queries.ts
export const useGetUsers = (params?: GetUsersParams) => {
  return useQuery({
    queryKey: ['users', params],
    queryFn: () => api.getUsers(params),
  });
};

export const useCreateUser = () => {
  return useMutation({
    mutationFn: (data: CreateUserInput) => api.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

// Usage
function UserList() {
  const { data: users, isLoading } = useGetUsers({ page: 1, limit: 10 });
  const createUser = useCreateUser();
  
  const handleCreate = async (formData: CreateUserInput) => {
    await createUser.mutateAsync(formData);
  };
  
  return (
    <div>
      {users?.map(user => <UserCard key={user.id} user={user} />)}
      <UserForm onSubmit={handleCreate} />
    </div>
  );
}
```

---

### 3. Prisma Generator Pothos Codegen
**Repository:** https://github.com/Cauen/prisma-generator-pothos-codegen  
**Stars:** 109+ ⭐  
**Language:** TypeScript  
**License:** MIT

#### What it Does
Creates a fully customizable CRUD GraphQL API from Prisma schema.

#### Installation
```bash
npm install prisma-generator-pothos-codegen
```

#### Configuration
```prisma
// schema.prisma
generator client {
  provider = "prisma-client-js"
}

generator pothos {
  provider = "prisma-generator-pothos-codegen"
  output   = "./src/generated"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String
  role      UserRole @default(USER)
  posts     Post[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@map("users")
}

model Post {
  id        String   @id @default(uuid())
  title     String
  content   String
  published Boolean  @default(false)
  author    User     @relation(fields: [authorId], references: [id])
  authorId  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@map("posts")
}

enum UserRole {
  ADMIN
  USER
  MODERATOR
}
```

```typescript
// Generated GraphQL Schema
import { builder } from './builder';
import { prisma } from './db';

builder.prismaObject('User', {
  fields: (t) => ({
    id: t.exposeID('id'),
    email: t.exposeString('email'),
    name: t.exposeString('name'),
    role: t.expose('role', { type: UserRole }),
    posts: t.relation('posts'),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
    updatedAt: t.expose('updatedAt', { type: 'DateTime' }),
  }),
});

builder.queryFields((t) => ({
  users: t.prismaField({
    type: ['User'],
    args: {
      where: t.arg({ type: UserWhereInput }),
      orderBy: t.arg({ type: [UserOrderByInput] }),
      take: t.arg.int(),
      skip: t.arg.int(),
    },
    resolve: (query, root, args) =>
      prisma.user.findMany({
        ...query,
        ...args,
      }),
  }),
}));

builder.mutationFields((t) => ({
  createUser: t.prismaField({
    type: 'User',
    args: {
      data: t.arg({ type: CreateUserInput, required: true }),
    },
    resolve: (query, root, { data }) =>
      prisma.user.create({
        ...query,
        data,
      }),
  }),
}));
```

---

## Validation Libraries

### 4. Zod - TypeScript-First Schema Validation
**Repository:** https://github.com/colinhacks/zod  
**Stars:** 32,000+ ⭐  
**Language:** TypeScript  
**License:** MIT

#### Complete Example
```typescript
import { z } from 'zod';

// Define schema
const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(2).max(100),
  age: z.number().int().min(13).max(120).optional(),
  role: z.enum(['admin', 'user', 'moderator']).default('user'),
  preferences: z.object({
    theme: z.enum(['light', 'dark', 'auto']).default('auto'),
    notifications: z.boolean().default(true),
    language: z.string().default('en'),
  }).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
}).strict();

// Infer TypeScript type
type User = z.infer<typeof UserSchema>;

// Validation
const result = UserSchema.safeParse({
  id: '123e4567-e89b-12d3-a456-426614174000',
  email: 'user@example.com',
  name: 'John Doe',
  role: 'admin',
});

if (result.success) {
  console.log(result.data); // Typed as User
} else {
  console.error(result.error.errors);
}

// Transform data
const TransformSchema = UserSchema.transform((data) => ({
  ...data,
  displayName: `${data.name} (${data.role})`,
}));

// Refinements
const PasswordSchema = z.object({
  password: z.string().min(8),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

// Async validation
const AsyncUserSchema = z.object({
  email: z.string().email(),
}).refine(async (data) => {
  const exists = await checkEmailExists(data.email);
  return !exists;
}, {
  message: 'Email already exists',
});
```

---

### 5. GraphQL Codegen Validation Schema
**Repository:** https://github.com/Code-Hex/graphql-codegen-typescript-validation-schema  
**Stars:** 352+ ⭐  
**Language:** TypeScript

#### Configuration
```yaml
# codegen.yml
generates:
  src/generated/validation.ts:
    plugins:
      - typescript
      - graphql-codegen-typescript-validation-schema
    config:
      schema: yup  # or zod, joi
      importFrom: ./types
      withObjectType: true
```

#### Generated Output
```typescript
// From GraphQL schema
import * as yup from 'yup';

export const UserSchema = yup.object({
  id: yup.string().required(),
  email: yup.string().email().required(),
  name: yup.string().required(),
  role: yup.string().oneOf(['ADMIN', 'USER', 'MODERATOR']).required(),
  posts: yup.array().of(PostSchema).required(),
});

export const CreateUserInputSchema = yup.object({
  email: yup.string().email().required(),
  name: yup.string().required(),
  role: yup.string().oneOf(['ADMIN', 'USER', 'MODERATOR']).default('USER'),
});

// Usage in forms
import { yupResolver } from '@hookform/resolvers/yup';

function UserForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(CreateUserInputSchema),
  });
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} />
      {errors.email && <span>{errors.email.message}</span>}
      {/* ... */}
    </form>
  );
}
```

---

## UI Component Generators

### 6. React JSONSchema Form
**Repository:** https://github.com/rjsf-team/react-jsonschema-form  
**Stars:** 14,000+ ⭐  
**Language:** JavaScript  
**License:** Apache 2.0

#### Example
```typescript
import Form from '@rjsf/core';
import validator from '@rjsf/validator-ajv8';

const schema = {
  title: "User Registration",
  type: "object",
  required: ["email", "password"],
  properties: {
    email: {
      type: "string",
      format: "email",
      title: "Email Address"
    },
    password: {
      type: "string",
      minLength: 8,
      title: "Password"
    },
    name: {
      type: "string",
      title: "Full Name"
    },
    age: {
      type: "integer",
      minimum: 13,
      title: "Age"
    },
    role: {
      type: "string",
      enum: ["admin", "user", "moderator"],
      default: "user",
      title: "Role"
    }
  }
};

const uiSchema = {
  password: {
    "ui:widget": "password"
  },
  role: {
    "ui:widget": "radio"
  }
};

function RegistrationForm() {
  const handleSubmit = ({ formData }) => {
    console.log("Data submitted: ", formData);
  };
  
  return (
    <Form
      schema={schema}
      uiSchema={uiSchema}
      validator={validator}
      onSubmit={handleSubmit}
    />
  );
}
```

---

### 7. Formik + Yup Integration
**Formik:** https://github.com/jaredpalmer/formik (33,000+ ⭐)  
**Yup:** https://github.com/jquense/yup (22,000+ ⭐)

#### Complete Example
```typescript
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';

const UserValidationSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email')
    .required('Required'),
  name: Yup.string()
    .min(2, 'Too short')
    .max(50, 'Too long')
    .required('Required'),
  age: Yup.number()
    .min(13, 'Must be at least 13')
    .max(120, 'Invalid age')
    .required('Required'),
  role: Yup.string()
    .oneOf(['admin', 'user', 'moderator'])
    .required('Required'),
  acceptTerms: Yup.boolean()
    .oneOf([true], 'Must accept terms')
    .required('Required'),
});

function UserForm() {
  return (
    <Formik
      initialValues={{
        email: '',
        name: '',
        age: '',
        role: 'user',
        acceptTerms: false,
      }}
      validationSchema={UserValidationSchema}
      onSubmit={(values, { setSubmitting }) => {
        setTimeout(() => {
          alert(JSON.stringify(values, null, 2));
          setSubmitting(false);
        }, 400);
      }}
    >
      {({ errors, touched, isSubmitting }) => (
        <Form>
          <div>
            <label>Email</label>
            <Field name="email" type="email" />
            {errors.email && touched.email && <div>{errors.email}</div>}
          </div>
          
          <div>
            <label>Name</label>
            <Field name="name" type="text" />
            {errors.name && touched.name && <div>{errors.name}</div>}
          </div>
          
          <div>
            <label>Age</label>
            <Field name="age" type="number" />
            {errors.age && touched.age && <div>{errors.age}</div>}
          </div>
          
          <div>
            <label>Role</label>
            <Field as="select" name="role">
              <option value="user">User</option>
              <option value="moderator">Moderator</option>
              <option value="admin">Admin</option>
            </Field>
            {errors.role && touched.role && <div>{errors.role}</div>}
          </div>
          
          <div>
            <label>
              <Field type="checkbox" name="acceptTerms" />
              Accept Terms
            </label>
            {errors.acceptTerms && touched.acceptTerms && (
              <div>{errors.acceptTerms}</div>
            )}
          </div>
          
          <button type="submit" disabled={isSubmitting}>
            Submit
          </button>
        </Form>
      )}
    </Formik>
  );
}
```

---

## LightDom Integration Examples

### 8. Complete Schema-to-Component Pipeline

```typescript
// lightdom-schema-generator.ts
import { z } from 'zod';
import { generateReactComponents } from '@lightdom/codegen';
import { introspectDatabase } from '@lightdom/db';

// Step 1: Define or introspect schema
const schema = await introspectDatabase({
  connection: process.env.DATABASE_URL,
  tables: ['users', 'posts', 'comments'],
});

// Step 2: Add UI hints
const enhancedSchema = {
  ...schema,
  users: {
    ...schema.users,
    ui: {
      list: {
        columns: ['email', 'name', 'role', 'createdAt'],
        filters: ['role', 'createdAt'],
        actions: ['edit', 'delete', 'view'],
      },
      form: {
        layout: 'vertical',
        sections: [
          {
            title: 'Basic Information',
            fields: ['email', 'name'],
          },
          {
            title: 'Permissions',
            fields: ['role'],
          },
        ],
      },
    },
  },
};

// Step 3: Generate components
await generateReactComponents({
  schema: enhancedSchema,
  outputDir: './src/generated',
  framework: {
    name: 'react',
    version: '18',
  },
  uiLibrary: {
    name: 'antd',
    version: '5',
  },
  features: {
    crud: true,
    validation: true,
    typescript: true,
    storybook: true,
    tests: true,
  },
});
```

### Generated File Structure
```
src/generated/
├── users/
│   ├── UserForm.tsx
│   ├── UserTable.tsx
│   ├── UserDetail.tsx
│   ├── UserCard.tsx
│   ├── useUsers.ts
│   ├── userSchema.ts
│   ├── userTypes.ts
│   ├── UserForm.stories.tsx
│   └── UserForm.test.tsx
├── posts/
│   ├── PostForm.tsx
│   ├── PostTable.tsx
│   ├── PostDetail.tsx
│   ├── usePosts.ts
│   └── ...
└── index.ts
```

---

## AI/ML Schema Projects

### 9. LangChain Schema Integration

```typescript
import { StructuredOutputParser } from "langchain/output_parsers";
import { z } from "zod";

// Define schema
const userAnalysisSchema = z.object({
  sentiment: z.enum(["positive", "negative", "neutral"]),
  topics: z.array(z.string()),
  entities: z.array(z.object({
    name: z.string(),
    type: z.enum(["person", "organization", "location"]),
    confidence: z.number().min(0).max(1),
  })),
  summary: z.string(),
  actionItems: z.array(z.string()),
});

// Create parser
const parser = StructuredOutputParser.fromZodSchema(userAnalysisSchema);

// Get format instructions
const formatInstructions = parser.getFormatInstructions();

// Use in prompt
const prompt = `
Analyze this user feedback: "${feedback}"

${formatInstructions}
`;

// Parse LLM output
const result = await parser.parse(llmOutput);
// Type-safe result matching schema
```

---

## Conclusion

These GitHub projects demonstrate the power of schema-driven development:

- **Code Generation**: Automatic TypeScript, React components, API clients
- **Validation**: Type-safe, runtime validation with great DX
- **UI Generation**: Forms, tables, dashboards from schemas
- **AI Integration**: LLM-powered schema creation and validation

For LightDom, these tools can be combined to create a complete schema-to-app pipeline with minimal manual coding.

---

**Next Steps:**
1. Experiment with GraphQL Code Generator
2. Integrate Zod into LightDom validation
3. Build custom schema-to-component generator
4. Train AI model on generated components

**Related Documents:**
- SCHEMA_AI_RESEARCH_2025.md
- SCHEMA_IMPLEMENTATION_EXAMPLES.md
- COMPREHENSIVE_SCHEMA_RESEARCH.md
