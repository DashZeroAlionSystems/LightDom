# Schema Design Patterns - Industry Best Practices
## Deep Dive into Production-Grade Schema Architectures

**Date:** November 2, 2024  
**Version:** 1.0  
**Related:** COMPREHENSIVE_SCHEMA_RESEARCH.md, ATOMIC_COMPONENT_SCHEMAS.md

---

## Table of Contents

1. [Introduction](#introduction)
2. [Prisma Schema Patterns](#prisma-schema-patterns)
3. [GraphQL Schema Design](#graphql-schema-design)
4. [JSON Schema Advanced Patterns](#json-schema-advanced-patterns)
5. [Database Schema Best Practices](#database-schema-best-practices)
6. [Type-Safe Schema Patterns](#type-safe-schema-patterns)
7. [Schema Versioning & Migration](#schema-versioning--migration)
8. [Real-World Code Examples](#real-world-code-examples)

---

## Introduction

This document examines battle-tested schema design patterns from industry-leading projects with millions of users. We'll analyze code from top GitHub repositories and extract reusable patterns for the LightDom platform.

### Projects Analyzed

| Project | Stars | Key Feature | Schema Type |
|---------|-------|-------------|-------------|
| Prisma | 39k+ | Database ORM | Database Schema |
| GraphQL Code Generator | 11k+ | Type generation | GraphQL Schema |
| Zod | 33k+ | Runtime validation | TypeScript Schema |
| shadcn/ui | 73k+ | Component library | Component Schema |
| n8n | 45k+ | Workflow automation | Workflow Schema |
| TypeORM | 34k+ | Database ORM | Entity Schema |
| tRPC | 34k+ | End-to-end typing | API Schema |

---

## Prisma Schema Patterns

### Pattern 1: Self-Documenting Models

**Source:** https://github.com/prisma/prisma/tree/main/examples

```prisma
// Prisma schema with comprehensive documentation
model User {
  /// Unique identifier for the user
  id        String   @id @default(cuid())
  
  /// User's email address (unique, used for login)
  email     String   @unique
  
  /// Hashed password (never store plain text!)
  password  String
  
  /// Display name shown to other users
  name      String?
  
  /// User's profile picture URL
  avatar    String?
  
  /// Timestamp when user registered
  createdAt DateTime @default(now())
  
  /// Timestamp of last profile update
  updatedAt DateTime @updatedAt
  
  /// Soft delete flag (never delete user data)
  deletedAt DateTime?
  
  // Relations
  posts     Post[]
  comments  Comment[]
  likes     Like[]
  
  // Indexes for performance
  @@index([email])
  @@index([createdAt])
  
  // Ensure email is lowercase
  @@map("users")
}

model Post {
  id          String    @id @default(cuid())
  title       String    @db.VarChar(255)
  slug        String    @unique @db.VarChar(255)
  content     String    @db.Text
  published   Boolean   @default(false)
  publishedAt DateTime?
  
  // Author relationship
  authorId    String
  author      User      @relation(fields: [authorId], references: [id])
  
  // Many-to-many with tags
  tags        Tag[]
  
  // One-to-many with comments
  comments    Comment[]
  likes       Like[]
  
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  @@index([slug])
  @@index([authorId])
  @@index([published, publishedAt])
  @@map("posts")
}

model Tag {
  id    String @id @default(cuid())
  name  String @unique
  slug  String @unique
  posts Post[]
  
  @@map("tags")
}

model Comment {
  id        String   @id @default(cuid())
  content   String   @db.Text
  
  // Nested comments (self-referential)
  parentId  String?
  parent    Comment?  @relation("CommentReplies", fields: [parentId], references: [id])
  replies   Comment[] @relation("CommentReplies")
  
  // Relations
  postId    String
  post      Post     @relation(fields: [postId], references: [id])
  
  authorId  String
  author    User     @relation(fields: [authorId], references: [id])
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@index([postId])
  @@index([authorId])
  @@map("comments")
}
```

**Key Takeaways:**
- Use `///` for documentation comments
- Add indexes on frequently queried fields
- Use `@map` for custom table names
- Implement soft deletes with `deletedAt`
- Use `@updatedAt` for automatic timestamps
- Add constraints at database level

### Pattern 2: Enum Types for Type Safety

```prisma
enum UserRole {
  USER
  MODERATOR
  ADMIN
  SUPER_ADMIN
}

enum PostStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
  DELETED
}

enum NotificationType {
  COMMENT
  LIKE
  MENTION
  FOLLOW
  SYSTEM
}

model User {
  id    String   @id @default(cuid())
  email String   @unique
  role  UserRole @default(USER)
  
  // ... other fields
}

model Post {
  id     String     @id @default(cuid())
  status PostStatus @default(DRAFT)
  
  // ... other fields
}

model Notification {
  id      String           @id @default(cuid())
  type    NotificationType
  read    Boolean          @default(false)
  userId  String
  user    User             @relation(fields: [userId], references: [id])
  
  // Polymorphic data (JSON)
  data    Json
  
  createdAt DateTime @default(now())
  
  @@index([userId, read])
}
```

**Benefits:**
- Type-safe at compile time
- Database constraints prevent invalid values
- Easier to refactor (find all usages)
- Self-documenting code

### Pattern 3: Composite Keys & Unique Constraints

```prisma
model UserFollower {
  followerId  String
  follower    User   @relation("Followers", fields: [followerId], references: [id])
  
  followingId String
  following   User   @relation("Following", fields: [followingId], references: [id])
  
  createdAt   DateTime @default(now())
  
  // Composite primary key
  @@id([followerId, followingId])
  
  // Prevent duplicate follows
  @@unique([followerId, followingId])
  
  // Index for reverse lookup
  @@index([followingId])
}

model PostLike {
  postId    String
  post      Post     @relation(fields: [postId], references: [id])
  
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  
  likedAt   DateTime @default(now())
  
  @@id([postId, userId])
  @@unique([postId, userId])
}
```

---

## GraphQL Schema Design

### Pattern 1: Relay Connection Pattern

**Source:** https://github.com/graphql/graphql-relay-js

```graphql
# Connection type for pagination
type PageInfo {
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
  startCursor: String
  endCursor: String
}

type UserEdge {
  node: User!
  cursor: String!
}

type UserConnection {
  edges: [UserEdge!]!
  pageInfo: PageInfo!
  totalCount: Int!
}

type Query {
  users(
    first: Int
    after: String
    last: Int
    before: String
    orderBy: UserOrderBy
    where: UserWhereInput
  ): UserConnection!
}

# Filters
input UserWhereInput {
  email: StringFilter
  name: StringFilter
  createdAt: DateTimeFilter
  AND: [UserWhereInput!]
  OR: [UserWhereInput!]
  NOT: UserWhereInput
}

input StringFilter {
  equals: String
  not: String
  in: [String!]
  notIn: [String!]
  contains: String
  startsWith: String
  endsWith: String
}

input DateTimeFilter {
  equals: DateTime
  not: DateTime
  in: [DateTime!]
  notIn: [DateTime!]
  lt: DateTime
  lte: DateTime
  gt: DateTime
  gte: DateTime
}

enum UserOrderBy {
  createdAt_ASC
  createdAt_DESC
  name_ASC
  name_DESC
  email_ASC
  email_DESC
}
```

**Implementation in TypeScript:**

```typescript
// types/relay.ts
export interface Connection<T> {
  edges: Edge<T>[];
  pageInfo: PageInfo;
  totalCount: number;
}

export interface Edge<T> {
  node: T;
  cursor: string;
}

export interface PageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor: string | null;
  endCursor: string | null;
}

export interface ConnectionArgs {
  first?: number;
  after?: string;
  last?: number;
  before?: string;
}

// utils/relay.ts
export function connectionFromArray<T>(
  array: T[],
  args: ConnectionArgs,
  totalCount: number
): Connection<T> {
  const { first, after, last, before } = args;
  
  let startIndex = 0;
  let endIndex = array.length;
  
  if (after) {
    startIndex = cursorToOffset(after) + 1;
  }
  
  if (before) {
    endIndex = cursorToOffset(before);
  }
  
  if (first) {
    endIndex = Math.min(endIndex, startIndex + first);
  }
  
  if (last) {
    startIndex = Math.max(startIndex, endIndex - last);
  }
  
  const slicedArray = array.slice(startIndex, endIndex);
  const edges = slicedArray.map((node, index) => ({
    node,
    cursor: offsetToCursor(startIndex + index)
  }));
  
  return {
    edges,
    pageInfo: {
      hasNextPage: endIndex < array.length,
      hasPreviousPage: startIndex > 0,
      startCursor: edges[0]?.cursor || null,
      endCursor: edges[edges.length - 1]?.cursor || null
    },
    totalCount
  };
}

function offsetToCursor(offset: number): string {
  return Buffer.from(`arrayconnection:${offset}`).toString('base64');
}

function cursorToOffset(cursor: string): number {
  return parseInt(
    Buffer.from(cursor, 'base64').toString('utf-8').split(':')[1],
    10
  );
}
```

### Pattern 2: Input/Output Separation

```graphql
# Never use the same type for input and output!

# Output type (what you return)
type User {
  id: ID!
  email: String!
  name: String!
  avatar: String
  createdAt: DateTime!
  updatedAt: DateTime!
  posts: [Post!]!
  followers: [User!]!
  following: [User!]!
}

# Create input (what you accept for creation)
input CreateUserInput {
  email: String!
  password: String!
  name: String!
  avatar: String
}

# Update input (all fields optional except ID)
input UpdateUserInput {
  email: String
  password: String
  name: String
  avatar: String
}

# Mutations with proper input/output
type Mutation {
  createUser(input: CreateUserInput!): CreateUserPayload!
  updateUser(id: ID!, input: UpdateUserInput!): UpdateUserPayload!
  deleteUser(id: ID!): DeleteUserPayload!
}

# Payloads with user-friendly errors
type CreateUserPayload {
  user: User
  errors: [UserError!]!
}

type UpdateUserPayload {
  user: User
  errors: [UserError!]!
}

type DeleteUserPayload {
  deletedId: ID
  errors: [UserError!]!
}

type UserError {
  field: String!
  message: String!
  code: String!
}
```

### Pattern 3: Interface & Union Types

```graphql
# Interface for common fields
interface Node {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
}

interface Timestamped {
  createdAt: DateTime!
  updatedAt: DateTime!
}

interface Authored {
  author: User!
  authorId: ID!
}

# Types implementing interfaces
type Post implements Node & Timestamped & Authored {
  id: ID!
  title: String!
  content: String!
  author: User!
  authorId: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
}

type Comment implements Node & Timestamped & Authored {
  id: ID!
  content: String!
  post: Post!
  author: User!
  authorId: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
}

# Union types for polymorphic queries
union SearchResult = Post | Comment | User

type Query {
  search(query: String!): [SearchResult!]!
}

# Activity feed using unions
union Activity = PostCreated | CommentCreated | UserFollowed | PostLiked

type PostCreated {
  id: ID!
  post: Post!
  user: User!
  timestamp: DateTime!
}

type CommentCreated {
  id: ID!
  comment: Comment!
  user: User!
  timestamp: DateTime!
}

type UserFollowed {
  id: ID!
  follower: User!
  following: User!
  timestamp: DateTime!
}

type PostLiked {
  id: ID!
  post: Post!
  user: User!
  timestamp: DateTime!
}

type Query {
  activityFeed(userId: ID!, first: Int): [Activity!]!
}
```

---

## JSON Schema Advanced Patterns

### Pattern 1: Schema Composition with $ref

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://example.com/schemas/user.json",
  
  "definitions": {
    "timestamp": {
      "type": "string",
      "format": "date-time",
      "description": "ISO 8601 timestamp"
    },
    
    "id": {
      "type": "string",
      "pattern": "^[a-zA-Z0-9_-]+$",
      "minLength": 1,
      "maxLength": 64
    },
    
    "email": {
      "type": "string",
      "format": "email",
      "minLength": 3,
      "maxLength": 254
    },
    
    "url": {
      "type": "string",
      "format": "uri",
      "pattern": "^https?://"
    },
    
    "address": {
      "type": "object",
      "properties": {
        "street": { "type": "string", "minLength": 1 },
        "city": { "type": "string", "minLength": 1 },
        "state": { "type": "string", "minLength": 2, "maxLength": 2 },
        "zipCode": { "type": "string", "pattern": "^[0-9]{5}(-[0-9]{4})?$" },
        "country": { "type": "string", "minLength": 2, "maxLength": 2 }
      },
      "required": ["street", "city", "state", "zipCode", "country"]
    }
  },
  
  "type": "object",
  "properties": {
    "id": { "$ref": "#/definitions/id" },
    "email": { "$ref": "#/definitions/email" },
    "name": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100
    },
    "avatar": { "$ref": "#/definitions/url" },
    "address": { "$ref": "#/definitions/address" },
    "createdAt": { "$ref": "#/definitions/timestamp" },
    "updatedAt": { "$ref": "#/definitions/timestamp" }
  },
  "required": ["id", "email", "name", "createdAt"],
  "additionalProperties": false
}
```

### Pattern 2: Conditional Schemas (if/then/else)

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Payment Method",
  "type": "object",
  "properties": {
    "type": {
      "type": "string",
      "enum": ["credit_card", "paypal", "bank_transfer"]
    }
  },
  "required": ["type"],
  
  "allOf": [
    {
      "if": {
        "properties": { "type": { "const": "credit_card" } }
      },
      "then": {
        "properties": {
          "cardNumber": {
            "type": "string",
            "pattern": "^[0-9]{16}$"
          },
          "expiryMonth": {
            "type": "integer",
            "minimum": 1,
            "maximum": 12
          },
          "expiryYear": {
            "type": "integer",
            "minimum": 2024
          },
          "cvv": {
            "type": "string",
            "pattern": "^[0-9]{3,4}$"
          }
        },
        "required": ["cardNumber", "expiryMonth", "expiryYear", "cvv"]
      }
    },
    {
      "if": {
        "properties": { "type": { "const": "paypal" } }
      },
      "then": {
        "properties": {
          "email": {
            "type": "string",
            "format": "email"
          }
        },
        "required": ["email"]
      }
    },
    {
      "if": {
        "properties": { "type": { "const": "bank_transfer" } }
      },
      "then": {
        "properties": {
          "accountNumber": {
            "type": "string",
            "pattern": "^[0-9]{10,12}$"
          },
          "routingNumber": {
            "type": "string",
            "pattern": "^[0-9]{9}$"
          }
        },
        "required": ["accountNumber", "routingNumber"]
      }
    }
  ]
}
```

### Pattern 3: Dynamic Defaults & Computed Values

```typescript
// Zod schema with transforms and refinements
import { z } from 'zod';

const UserSchema = z.object({
  id: z.string().cuid().optional(),
  email: z.string().email().toLowerCase().trim(),
  name: z.string().min(1).max(100).trim(),
  username: z.string()
    .min(3)
    .max(30)
    .regex(/^[a-zA-Z0-9_-]+$/)
    .transform(val => val.toLowerCase()),
  password: z.string()
    .min(8)
    .regex(/[A-Z]/, 'Must contain uppercase')
    .regex(/[a-z]/, 'Must contain lowercase')
    .regex(/[0-9]/, 'Must contain number')
    .regex(/[^A-Za-z0-9]/, 'Must contain special character'),
  avatar: z.string().url().optional(),
  bio: z.string().max(500).optional(),
  birthDate: z.coerce.date().refine(
    date => {
      const age = (new Date().getTime() - date.getTime()) / (1000 * 60 * 60 * 24 * 365);
      return age >= 13;
    },
    { message: 'Must be at least 13 years old' }
  ).optional(),
  settings: z.object({
    emailNotifications: z.boolean().default(true),
    theme: z.enum(['light', 'dark', 'auto']).default('auto'),
    language: z.string().length(2).default('en')
  }).default({}),
  metadata: z.record(z.any()).default({}),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date())
}).refine(
  data => data.email !== data.username,
  { message: 'Email and username cannot be the same', path: ['username'] }
);

// Usage
const user = UserSchema.parse({
  email: '  USER@EXAMPLE.COM  ',
  name: 'John Doe',
  username: 'JOHN_DOE',
  password: 'SecurePass123!',
  birthDate: '1990-01-01'
});

// Result:
// {
//   email: 'user@example.com',
//   name: 'John Doe',
//   username: 'john_doe',
//   password: 'SecurePass123!',
//   birthDate: Date('1990-01-01'),
//   settings: { emailNotifications: true, theme: 'auto', language: 'en' },
//   metadata: {},
//   createdAt: Date(now),
//   updatedAt: Date(now)
// }
```

---

*Continued in Part 2...*

**Related Files:**
- [COMPREHENSIVE_SCHEMA_RESEARCH.md](./COMPREHENSIVE_SCHEMA_RESEARCH.md)
- [ATOMIC_COMPONENT_SCHEMAS.md](./ATOMIC_COMPONENT_SCHEMAS.md)
- [WORKFLOW_WIZARD_SCHEMAS.md](./WORKFLOW_WIZARD_SCHEMAS.md)

**Version:** 1.0  
**Last Updated:** November 2, 2024  
**Maintained by:** LightDom Research Team
