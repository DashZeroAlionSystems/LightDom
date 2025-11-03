# Advanced Schema Composition Patterns

**Research Document** | **Version 1.0** | **Date: 2025-11-02**

Comprehensive guide to schema composition, inheritance, polymorphism, and cross-schema references with practical examples from leading frameworks and LightDom integration patterns.

---

## Table of Contents

1. [Introduction](#introduction)
2. [Schema Composition Fundamentals](#schema-composition-fundamentals)
3. [Inheritance Patterns](#inheritance-patterns)
4. [Mixins and Traits](#mixins-and-traits)
5. [Polymorphic Schemas](#polymorphic-schemas)
6. [Cross-Schema References](#cross-schema-references)
7. [Schema Fragments](#schema-fragments)
8. [Recursive Schemas](#recursive-schemas)
9. [Schema Versioning](#schema-versioning)
10. [LightDom Integration](#lightdom-integration)
11. [Best Practices](#best-practices)
12. [References](#references)

---

## Introduction

Schema composition is the practice of building complex schemas from simpler, reusable building blocks. This approach:

- **Reduces duplication**: Define common patterns once, reuse everywhere
- **Improves maintainability**: Changes propagate automatically
- **Enables polymorphism**: Support multiple types with shared structure
- **Facilitates evolution**: Add features without breaking existing code
- **Promotes consistency**: Enforce patterns across your codebase

### Why Composition Matters

```typescript
// ❌ Without composition - lots of duplication
const UserSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
  name: z.string(),
  email: z.string().email()
});

const ProductSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
  title: z.string(),
  price: z.number()
});

// ✅ With composition - DRY and maintainable
const BaseEntity = z.object({
  id: z.string().uuid(),
});

const Timestamps = z.object({
  createdAt: z.date(),
  updatedAt: z.date()
});

const SoftDelete = z.object({
  deletedAt: z.date().nullable()
});

const UserSchema = BaseEntity.merge(Timestamps).merge(SoftDelete).extend({
  name: z.string(),
  email: z.string().email()
});

const ProductSchema = BaseEntity.merge(Timestamps).merge(SoftDelete).extend({
  title: z.string(),
  price: z.number()
});
```

---

## Schema Composition Fundamentals

### 1. Merge / Extend Pattern

The most basic composition pattern combines two schemas into one.

**Zod Example:**

```typescript
const PersonalInfo = z.object({
  firstName: z.string(),
  lastName: z.string()
});

const ContactInfo = z.object({
  email: z.string().email(),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/)
});

// Merge approach
const User = PersonalInfo.merge(ContactInfo);

// Extend approach (adds to existing schema)
const Employee = User.extend({
  employeeId: z.string(),
  department: z.string()
});
```

**JSON Schema Example:**

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "definitions": {
    "personalInfo": {
      "type": "object",
      "properties": {
        "firstName": { "type": "string" },
        "lastName": { "type": "string" }
      }
    },
    "contactInfo": {
      "type": "object",
      "properties": {
        "email": { "type": "string", "format": "email" },
        "phone": { "type": "string", "pattern": "^\\+?[1-9]\\d{1,14}$" }
      }
    }
  },
  "type": "object",
  "allOf": [
    { "$ref": "#/definitions/personalInfo" },
    { "$ref": "#/definitions/contactInfo" }
  ]
}
```

### 2. Intersection Types

Combine multiple schemas ensuring all constraints are satisfied.

**TypeScript Example:**

```typescript
type Identifiable = {
  id: string;
};

type Timestamped = {
  createdAt: Date;
  updatedAt: Date;
};

type Auditable = {
  createdBy: string;
  updatedBy: string;
};

// Intersection type
type Entity = Identifiable & Timestamped & Auditable;

// Usage
const user: Entity = {
  id: '123',
  createdAt: new Date(),
  updatedAt: new Date(),
  createdBy: 'admin',
  updatedBy: 'admin'
};
```

**Zod Intersection:**

```typescript
const IdentifiableSchema = z.object({ id: z.string() });
const TimestampedSchema = z.object({
  createdAt: z.date(),
  updatedAt: z.date()
});

const EntitySchema = z.intersection(
  IdentifiableSchema,
  TimestampedSchema
);
```

### 3. Union Types

Allow a value to be one of several types.

**TypeScript Union:**

```typescript
type Status = 'draft' | 'published' | 'archived';

type Article = {
  id: string;
  title: string;
  status: Status;
};
```

**Zod Union:**

```typescript
const PaymentMethod = z.union([
  z.object({
    type: z.literal('card'),
    cardNumber: z.string(),
    cvv: z.string()
  }),
  z.object({
    type: z.literal('paypal'),
    email: z.string().email()
  }),
  z.object({
    type: z.literal('crypto'),
    walletAddress: z.string()
  })
]);
```

---

## Inheritance Patterns

### Single Inheritance

**Prisma Example:**

```prisma
// Base model
model BaseEntity {
  id        String   @id @default(uuid())
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// "Inheriting" through embedding (Prisma doesn't support inheritance directly)
model User {
  id        String   @id @default(uuid())
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  name      String
  email     String   @unique
}
```

**TypeScript Class Inheritance:**

```typescript
abstract class BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;

  constructor() {
    this.id = crypto.randomUUID();
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  touch() {
    this.updatedAt = new Date();
  }
}

class User extends BaseEntity {
  constructor(
    public name: string,
    public email: string
  ) {
    super();
  }
}

class Product extends BaseEntity {
  constructor(
    public title: string,
    public price: number
  ) {
    super();
  }
}
```

### Schema-Based Inheritance with Zod

```typescript
// Base schema factory
const createEntitySchema = <T extends z.ZodRawShape>(extensions: T) => {
  const base = z.object({
    id: z.string().uuid(),
    createdAt: z.date(),
    updatedAt: z.date()
  });

  return base.extend(extensions);
};

// Usage
const UserSchema = createEntitySchema({
  name: z.string(),
  email: z.string().email(),
  role: z.enum(['admin', 'user', 'guest'])
});

const ProductSchema = createEntitySchema({
  title: z.string(),
  price: z.number().positive(),
  stock: z.number().int().nonnegative()
});

// Infer types
type User = z.infer<typeof UserSchema>;
type Product = z.infer<typeof ProductSchema>;
```

### Multi-Level Inheritance

```typescript
// Level 1: Base entity
const BaseEntitySchema = z.object({
  id: z.string().uuid()
});

// Level 2: Timestamped entity
const TimestampedEntitySchema = BaseEntitySchema.extend({
  createdAt: z.date(),
  updatedAt: z.date()
});

// Level 3: Auditable entity
const AuditableEntitySchema = TimestampedEntitySchema.extend({
  createdBy: z.string(),
  updatedBy: z.string()
});

// Level 4: Soft-deletable entity
const SoftDeletableEntitySchema = AuditableEntitySchema.extend({
  deletedAt: z.date().nullable(),
  deletedBy: z.string().nullable()
});

// Final schema
const UserSchema = SoftDeletableEntitySchema.extend({
  name: z.string(),
  email: z.string().email()
});
```

---

## Mixins and Traits

Mixins allow you to compose schemas from multiple reusable pieces without strict inheritance.

### Functional Mixins

```typescript
// Mixin functions
const withTimestamps = <T extends z.ZodRawShape>(schema: z.ZodObject<T>) =>
  schema.extend({
    createdAt: z.date(),
    updatedAt: z.date()
  });

const withSoftDelete = <T extends z.ZodRawShape>(schema: z.ZodObject<T>) =>
  schema.extend({
    deletedAt: z.date().nullable()
  });

const withAudit = <T extends z.ZodRawShape>(schema: z.ZodObject<T>) =>
  schema.extend({
    createdBy: z.string(),
    updatedBy: z.string()
  });

// Compose mixins
const BaseSchema = z.object({
  id: z.string().uuid()
});

const UserSchema = withAudit(
  withSoftDelete(
    withTimestamps(
      BaseSchema.extend({
        name: z.string(),
        email: z.string().email()
      })
    )
  )
);

// Or use a pipe utility
const pipe = <T>(value: T, ...fns: Array<(arg: T) => T>): T =>
  fns.reduce((acc, fn) => fn(acc), value);

const ProductSchema = pipe(
  BaseSchema.extend({
    title: z.string(),
    price: z.number()
  }),
  withTimestamps,
  withSoftDelete,
  withAudit
);
```

### Trait-Based Composition

```typescript
// Define traits
const traits = {
  identifiable: z.object({
    id: z.string().uuid()
  }),

  timestamped: z.object({
    createdAt: z.date(),
    updatedAt: z.date()
  }),

  softDelete: z.object({
    deletedAt: z.date().nullable()
  }),

  auditable: z.object({
    createdBy: z.string(),
    updatedBy: z.string()
  }),

  versionable: z.object({
    version: z.number().int().positive()
  })
};

// Compose helper
const compose = <T extends z.ZodRawShape>(
  base: z.ZodObject<T>,
  ...traits: Array<z.ZodObject<any>>
) => {
  return traits.reduce((schema, trait) => schema.merge(trait), base);
};

// Usage
const UserSchema = compose(
  z.object({
    name: z.string(),
    email: z.string().email()
  }),
  traits.identifiable,
  traits.timestamped,
  traits.softDelete,
  traits.auditable
);

const ProductSchema = compose(
  z.object({
    title: z.string(),
    price: z.number()
  }),
  traits.identifiable,
  traits.timestamped,
  traits.versionable
);
```

---

## Polymorphic Schemas

Polymorphic schemas allow different types to share a common interface while having distinct properties.

### Discriminated Unions

**Zod Example:**

```typescript
const EventSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('click'),
    x: z.number(),
    y: z.number(),
    button: z.enum(['left', 'right', 'middle'])
  }),
  z.object({
    type: z.literal('scroll'),
    deltaX: z.number(),
    deltaY: z.number()
  }),
  z.object({
    type: z.literal('keyboard'),
    key: z.string(),
    modifiers: z.array(z.enum(['ctrl', 'alt', 'shift', 'meta']))
  })
]);

type Event = z.infer<typeof EventSchema>;

// Type-safe handling
function handleEvent(event: Event) {
  switch (event.type) {
    case 'click':
      console.log(`Click at ${event.x}, ${event.y} with ${event.button}`);
      break;
    case 'scroll':
      console.log(`Scroll by ${event.deltaX}, ${event.deltaY}`);
      break;
    case 'keyboard':
      console.log(`Key ${event.key} with ${event.modifiers.join('+')}`);
      break;
  }
}
```

**JSON Schema Example:**

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "oneOf": [
    {
      "type": "object",
      "properties": {
        "type": { "const": "circle" },
        "radius": { "type": "number" }
      },
      "required": ["type", "radius"]
    },
    {
      "type": "object",
      "properties": {
        "type": { "const": "rectangle" },
        "width": { "type": "number" },
        "height": { "type": "number" }
      },
      "required": ["type", "width", "height"]
    }
  ]
}
```

### GraphQL Interfaces and Unions

```graphql
interface Node {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
}

type User implements Node {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
  name: String!
  email: String!
}

type Product implements Node {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
  title: String!
  price: Float!
}

union SearchResult = User | Product | Article

type Query {
  search(query: String!): [SearchResult!]!
  node(id: ID!): Node
}
```

### Advanced Polymorphism with Shared Base

```typescript
// Base schema
const BaseNotificationSchema = z.object({
  id: z.string().uuid(),
  userId: z.string(),
  createdAt: z.date(),
  read: z.boolean()
});

// Specific notification types
const EmailNotificationSchema = BaseNotificationSchema.extend({
  type: z.literal('email'),
  subject: z.string(),
  body: z.string(),
  from: z.string().email()
});

const PushNotificationSchema = BaseNotificationSchema.extend({
  type: z.literal('push'),
  title: z.string(),
  message: z.string(),
  icon: z.string().url().optional()
});

const SMSNotificationSchema = BaseNotificationSchema.extend({
  type: z.literal('sms'),
  phoneNumber: z.string(),
  message: z.string().max(160)
});

// Discriminated union
const NotificationSchema = z.discriminatedUnion('type', [
  EmailNotificationSchema,
  PushNotificationSchema,
  SMSNotificationSchema
]);

type Notification = z.infer<typeof NotificationSchema>;

// Polymorphic handler
async function sendNotification(notification: Notification) {
  switch (notification.type) {
    case 'email':
      return await emailService.send({
        to: notification.userId,
        subject: notification.subject,
        body: notification.body,
        from: notification.from
      });
    case 'push':
      return await pushService.send({
        userId: notification.userId,
        title: notification.title,
        message: notification.message,
        icon: notification.icon
      });
    case 'sms':
      return await smsService.send({
        to: notification.phoneNumber,
        message: notification.message
      });
  }
}
```

---

## Cross-Schema References

### JSON Schema $ref

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "definitions": {
    "address": {
      "type": "object",
      "properties": {
        "street": { "type": "string" },
        "city": { "type": "string" },
        "country": { "type": "string" }
      },
      "required": ["street", "city", "country"]
    },
    "person": {
      "type": "object",
      "properties": {
        "name": { "type": "string" },
        "age": { "type": "integer" },
        "address": { "$ref": "#/definitions/address" }
      }
    }
  },
  "type": "object",
  "properties": {
    "user": { "$ref": "#/definitions/person" },
    "billingAddress": { "$ref": "#/definitions/address" },
    "shippingAddress": { "$ref": "#/definitions/address" }
  }
}
```

### External Schema References

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "user": {
      "$ref": "https://api.example.com/schemas/user.json"
    },
    "product": {
      "$ref": "./schemas/product.json"
    }
  }
}
```

### Zod Lazy References for Circular Schemas

```typescript
// Circular reference: Category can contain subcategories
type Category = {
  id: string;
  name: string;
  parent?: Category;
  children?: Category[];
};

const CategorySchema: z.ZodType<Category> = z.lazy(() =>
  z.object({
    id: z.string(),
    name: z.string(),
    parent: CategorySchema.optional(),
    children: z.array(CategorySchema).optional()
  })
);

// Tree structure
type TreeNode = {
  value: string;
  left?: TreeNode;
  right?: TreeNode;
};

const TreeNodeSchema: z.ZodType<TreeNode> = z.lazy(() =>
  z.object({
    value: z.string(),
    left: TreeNodeSchema.optional(),
    right: TreeNodeSchema.optional()
  })
);
```

### Prisma Relations

```prisma
model User {
  id        String   @id @default(uuid())
  name      String
  email     String   @unique
  posts     Post[]
  profile   Profile?
  comments  Comment[]
}

model Profile {
  id     String @id @default(uuid())
  bio    String
  userId String @unique
  user   User   @relation(fields: [userId], references: [id])
}

model Post {
  id        String    @id @default(uuid())
  title     String
  content   String
  authorId  String
  author    User      @relation(fields: [authorId], references: [id])
  comments  Comment[]
}

model Comment {
  id       String @id @default(uuid())
  content  String
  postId   String
  post     Post   @relation(fields: [postId], references: [id])
  authorId String
  author   User   @relation(fields: [authorId], references: [id])
}
```

---

## Schema Fragments

Reusable schema pieces that can be composed into larger schemas.

### GraphQL Fragments

```graphql
fragment UserFields on User {
  id
  name
  email
  createdAt
}

fragment PostFields on Post {
  id
  title
  content
  publishedAt
}

query GetUserWithPosts($userId: ID!) {
  user(id: $userId) {
    ...UserFields
    posts {
      ...PostFields
    }
  }
}
```

### Zod Schema Fragments

```typescript
// Reusable fragments
const fragments = {
  id: z.string().uuid(),
  email: z.string().email(),
  url: z.string().url(),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/),
  
  timestamps: z.object({
    createdAt: z.date(),
    updatedAt: z.date()
  }),
  
  pagination: z.object({
    page: z.number().int().positive(),
    limit: z.number().int().positive().max(100),
    total: z.number().int().nonnegative()
  }),
  
  coordinates: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180)
  })
};

// Compose schemas from fragments
const UserSchema = z.object({
  id: fragments.id,
  name: z.string(),
  email: fragments.email,
  phone: fragments.phone.optional()
}).merge(fragments.timestamps);

const LocationSchema = z.object({
  id: fragments.id,
  name: z.string(),
  address: z.string()
}).merge(fragments.coordinates).merge(fragments.timestamps);

const SearchResultSchema = z.object({
  results: z.array(z.any()),
  pagination: fragments.pagination
});
```

---

## Recursive Schemas

### Nested Comment Threads

```typescript
type Comment = {
  id: string;
  author: string;
  text: string;
  replies?: Comment[];
};

const CommentSchema: z.ZodType<Comment> = z.lazy(() =>
  z.object({
    id: z.string().uuid(),
    author: z.string(),
    text: z.string(),
    replies: z.array(CommentSchema).optional()
  })
);

// Usage
const comment: Comment = {
  id: '1',
  author: 'Alice',
  text: 'Great post!',
  replies: [
    {
      id: '2',
      author: 'Bob',
      text: 'Thanks!',
      replies: [
        {
          id: '3',
          author: 'Alice',
          text: 'You're welcome!'
        }
      ]
    }
  ]
};

CommentSchema.parse(comment); // ✅
```

### File System Hierarchy

```typescript
type FileSystemNode = {
  name: string;
  type: 'file' | 'directory';
  size?: number; // Only for files
  children?: FileSystemNode[]; // Only for directories
};

const FileSystemNodeSchema: z.ZodType<FileSystemNode> = z.lazy(() =>
  z.discriminatedUnion('type', [
    z.object({
      name: z.string(),
      type: z.literal('file'),
      size: z.number().int().nonnegative()
    }),
    z.object({
      name: z.string(),
      type: z.literal('directory'),
      children: z.array(FileSystemNodeSchema).optional()
    })
  ])
);
```

### JSON Value Schema

```typescript
type JSONValue =
  | string
  | number
  | boolean
  | null
  | JSONValue[]
  | { [key: string]: JSONValue };

const JSONValueSchema: z.ZodType<JSONValue> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
    z.array(JSONValueSchema),
    z.record(JSONValueSchema)
  ])
);
```

---

## Schema Versioning

### Semantic Versioning for Schemas

```typescript
const UserSchemaV1 = z.object({
  id: z.string().uuid(),
  name: z.string(),
  email: z.string().email()
});

const UserSchemaV2 = UserSchemaV1.extend({
  // Added field (non-breaking)
  phone: z.string().optional(),
  // Changed field (breaking)
  email: z.string().email().transform(e => e.toLowerCase())
});

const UserSchemaV3 = UserSchemaV2.omit({ name: true }).extend({
  // Breaking: split name into first/last
  firstName: z.string(),
  lastName: z.string()
});

// Version registry
const userSchemas = {
  '1.0.0': UserSchemaV1,
  '2.0.0': UserSchemaV2,
  '3.0.0': UserSchemaV3
};

// Version-aware parser
function parseUser(data: unknown, version: string = '3.0.0') {
  const schema = userSchemas[version];
  if (!schema) {
    throw new Error(`Unknown schema version: ${version}`);
  }
  return schema.parse(data);
}
```

### Migration Between Versions

```typescript
// Migration functions
const migrations = {
  'v1_to_v2': (data: z.infer<typeof UserSchemaV1>) => ({
    ...data,
    phone: undefined
  }),
  
  'v2_to_v3': (data: z.infer<typeof UserSchemaV2>) => {
    const [firstName, ...lastNameParts] = data.name.split(' ');
    return {
      ...data,
      name: undefined,
      firstName,
      lastName: lastNameParts.join(' ')
    };
  }
};

// Auto-migrate
function migrateUser(data: any, fromVersion: string, toVersion: string) {
  const path = getMigrationPath(fromVersion, toVersion);
  
  return path.reduce((acc, migrationKey) => {
    return migrations[migrationKey](acc);
  }, data);
}
```

### Schema Evolution Strategies

```typescript
// Strategy 1: Optional fields (backward compatible)
const UserSchemaEvolved = UserSchemaV1.extend({
  preferences: z.object({
    theme: z.enum(['light', 'dark']),
    language: z.string()
  }).optional()
});

// Strategy 2: Default values (backward compatible)
const UserSchemaWithDefaults = UserSchemaV1.extend({
  role: z.enum(['user', 'admin']).default('user'),
  status: z.enum(['active', 'inactive']).default('active')
});

// Strategy 3: Transform/normalize (potentially breaking)
const UserSchemaTransformed = UserSchemaV1.extend({
  email: z.string().email().transform(e => e.toLowerCase().trim())
});

// Strategy 4: Deprecation warnings
const UserSchemaDeprecated = UserSchemaV1.extend({
  username: z.string().refine(
    () => {
      console.warn('Field "username" is deprecated. Use "name" instead.');
      return true;
    }
  ).optional()
});
```

---

## LightDom Integration

### Enhanced Schema Service with Composition

```typescript
import { z } from 'zod';

// Base mixins for LightDom entities
const lightdomMixins = {
  entity: z.object({
    id: z.string().uuid(),
    createdAt: z.date(),
    updatedAt: z.date()
  }),
  
  domMetadata: z.object({
    domComplexity: z.number().int().nonnegative(),
    domDepth: z.number().int().nonnegative(),
    domSpace: z.number().nonnegative()
  }),
  
  optimization: z.object({
    optimizationScore: z.number().min(0).max(100),
    optimizationSuggestions: z.array(z.string())
  }),
  
  blockchain: z.object({
    transactionHash: z.string().optional(),
    blockNumber: z.number().int().optional(),
    gasUsed: z.number().int().optional()
  })
};

// Compose LightDom-specific schemas
const DOMAnalysisSchema = z.object({
  url: z.string().url(),
  timestamp: z.date(),
  elements: z.array(z.object({
    tag: z.string(),
    attributes: z.record(z.string()),
    textContent: z.string().optional()
  }))
})
  .merge(lightdomMixins.entity)
  .merge(lightdomMixins.domMetadata)
  .merge(lightdomMixins.optimization);

const MiningSessionSchema = z.object({
  minerId: z.string(),
  startTime: z.date(),
  endTime: z.date().optional(),
  pagesProcessed: z.number().int().nonnegative(),
  tokensEarned: z.number().nonnegative()
})
  .merge(lightdomMixins.entity)
  .merge(lightdomMixins.blockchain);

// Component schema composition
const ComponentSchemaBase = z.object({
  '@context': z.string().url(),
  '@type': z.string(),
  '@id': z.string()
});

const createComponentSchema = <T extends z.ZodRawShape>(
  type: string,
  props: T
) => {
  return ComponentSchemaBase.extend({
    '@type': z.literal(type),
    'lightdom:props': z.object(props),
    'lightdom:accessibility': z.object({
      ariaLabel: z.string().optional(),
      ariaDescribedBy: z.string().optional(),
      role: z.string().optional()
    }).optional()
  });
};

// Usage
const ButtonSchema = createComponentSchema('Button', {
  text: z.string(),
  variant: z.enum(['primary', 'secondary', 'danger']),
  disabled: z.boolean().default(false),
  onClick: z.string() // Handler reference
});

const InputSchema = createComponentSchema('Input', {
  type: z.enum(['text', 'email', 'password', 'number']),
  placeholder: z.string().optional(),
  required: z.boolean().default(false),
  validation: z.string().optional() // Validation rule reference
});
```

### Workflow Schema Composition

```typescript
// Base workflow elements
const TaskBase = z.object({
  name: z.string(),
  description: z.string().optional(),
  timeout: z.number().int().positive().optional()
});

const createTaskSchema = <T extends z.ZodRawShape>(
  taskType: string,
  config: T
) => {
  return TaskBase.extend({
    type: z.literal(taskType),
    config: z.object(config)
  });
};

// Specific task types
const FunctionTaskSchema = createTaskSchema('function', {
  handler: z.string(),
  params: z.record(z.any())
});

const APITaskSchema = createTaskSchema('api', {
  endpoint: z.string().url(),
  method: z.enum(['GET', 'POST', 'PUT', 'DELETE']),
  headers: z.record(z.string()).optional(),
  body: z.any().optional()
});

const DatabaseTaskSchema = createTaskSchema('database', {
  operation: z.enum(['query', 'insert', 'update', 'delete']),
  table: z.string(),
  data: z.any().optional()
});

// Compose into workflow
const WorkflowSchema = z.object({
  '@context': z.string().url(),
  '@type': z.literal('Workflow'),
  '@id': z.string(),
  name: z.string(),
  description: z.string().optional(),
  tasks: z.array(
    z.discriminatedUnion('type', [
      FunctionTaskSchema,
      APITaskSchema,
      DatabaseTaskSchema
    ])
  ),
  errorHandling: z.object({
    strategy: z.enum(['abort', 'continue', 'retry']),
    maxRetries: z.number().int().positive().optional()
  }).optional()
});
```

---

## Best Practices

### 1. Keep Mixins Small and Focused

```typescript
// ✅ Good: Small, focused mixins
const withId = (schema) => schema.extend({ id: z.string().uuid() });
const withTimestamps = (schema) => schema.extend({
  createdAt: z.date(),
  updatedAt: z.date()
});

// ❌ Bad: Large, unfocused mixin
const withEverything = (schema) => schema.extend({
  id: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
  version: z.number(),
  metadata: z.record(z.any())
});
```

### 2. Use Discriminated Unions for Polymorphism

```typescript
// ✅ Good: Discriminated union with type safety
const Shape = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('circle'), radius: z.number() }),
  z.object({ kind: z.literal('square'), side: z.number() })
]);

// ❌ Bad: Non-discriminated union (harder to narrow)
const Shape = z.union([
  z.object({ radius: z.number() }),
  z.object({ side: z.number() })
]);
```

### 3. Version Your Schemas

```typescript
// ✅ Good: Clear versioning
export const UserSchemaV1 = z.object({ /* ... */ });
export const UserSchemaV2 = z.object({ /* ... */ });
export const UserSchema = UserSchemaV2; // Current version

// ❌ Bad: No versioning
export const UserSchema = z.object({ /* ... */ });
```

### 4. Document Breaking Changes

```typescript
/**
 * User Schema V2
 * 
 * Breaking changes from V1:
 * - `name` split into `firstName` and `lastName`
 * - `email` now normalized to lowercase
 * 
 * Non-breaking additions:
 * - `phone` field (optional)
 * - `preferences` object (optional)
 */
export const UserSchemaV2 = { /* ... */ };
```

### 5. Use Schema Registries

```typescript
// Schema registry pattern
class SchemaRegistry {
  private schemas = new Map<string, z.ZodSchema>();

  register(name: string, schema: z.ZodSchema) {
    this.schemas.set(name, schema);
  }

  get(name: string) {
    const schema = this.schemas.get(name);
    if (!schema) throw new Error(`Schema not found: ${name}`);
    return schema;
  }

  parse(name: string, data: unknown) {
    return this.get(name).parse(data);
  }
}

const registry = new SchemaRegistry();
registry.register('User', UserSchema);
registry.register('Product', ProductSchema);

// Usage
const user = registry.parse('User', userData);
```

---

## References

### Academic Papers

1. **"Type Systems for Programs with Inheritance"** - Luca Cardelli (1988)
   - https://www.lucacardelli.name/Papers/InheritanceTypeSystems.pdf

2. **"Composing Schemas with JSON Schema"** - JSON Schema Specification
   - https://json-schema.org/understanding-json-schema/reference/combining.html

### Documentation

3. **Zod Documentation** - Schema Composition
   - https://zod.dev/?id=merge

4. **TypeScript Handbook** - Advanced Types
   - https://www.typescriptlang.org/docs/handbook/2/types-from-types.html

5. **GraphQL Interfaces** - GraphQL Specification
   - https://graphql.org/learn/schema/#interfaces

### GitHub Projects

6. **Zod** (33k★) - TypeScript-first schema validation
   - https://github.com/colinhacks/zod
   - Excellent examples of schema composition patterns

7. **Prisma** (39k★) - Next-generation ORM
   - https://github.com/prisma/prisma
   - Schema modeling and relations

8. **GraphQL Code Generator** (11k★)
   - https://github.com/dotansimha/graphql-code-generator
   - Schema-based code generation

### Tools

9. **JSON Schema Validator**
   - https://www.jsonschemavalidator.net/

10. **TypeScript Playground**
    - https://www.typescriptlang.org/play

---

## Conclusion

Schema composition is a powerful technique that enables:

- **Code reuse** through mixins and inheritance
- **Type safety** with discriminated unions
- **Flexibility** via polymorphism
- **Evolution** through versioning

By applying these patterns in LightDom, we can build a robust, maintainable schema system that scales with the platform's growth.

**Next Steps:**
- Implement SchemaRegistry for centralized schema management
- Add schema versioning to existing LightDom schemas
- Create migration utilities for schema evolution
- Build composition utilities for common LightDom patterns

---

**Document Version:** 1.0  
**Last Updated:** 2025-11-02  
**Author:** LightDom Schema Research Team
