# Linked Schema Functionality - Research & Implementation Guide

## Overview

This document provides comprehensive research on linked schema functionality, how it enhances component generation, and implementation strategies for the LightDom platform.

## What is Linked Schema?

Linked schema refers to the practice of connecting database schemas, data structures, and semantic metadata (like schema.org) to create meaningful relationships that can be leveraged for:

1. **Automated Component Generation** - Understanding data structure to generate appropriate UI components
2. **Semantic Understanding** - Using schema.org and similar standards to provide context
3. **Relationship Mapping** - Automatically discovering and utilizing table relationships
4. **AI-Enhanced Generation** - Providing rich context to AI models for better generation

## Database Schema Structure

### Core Tables

#### 1. Schema Analysis & Discovery
```sql
-- schema_analysis_runs: Tracks analysis execution
-- discovered_tables: Metadata about database tables
-- schema_relationships: Foreign keys and semantic relationships
-- feature_groupings: Logical groupings of related tables
```

#### 2. Workflow & Component Hierarchy
```sql
workflows → dashboards → components → atoms

-- workflow_templates: Reusable workflow patterns
-- workflow_instances: Active workflow executions
-- atom_definitions: Smallest UI units
-- component_definitions: Composed UI elements
-- dashboard_definitions: Complete interfaces
```

#### 3. Schema Linking
```sql
-- component_schema_links: Maps schema.org URIs to components/atoms
-- Enables semantic understanding of component purpose
```

## How Linked Schemas Help Component Generation

### 1. Type Inference

**Database Column → UI Component Mapping:**

```javascript
const typeMapping = {
  // String types
  'VARCHAR': 'Input',
  'TEXT': 'TextArea',
  'UUID': 'Input (disabled)',
  
  // Number types
  'INTEGER': 'InputNumber',
  'DECIMAL': 'InputNumber (decimal)',
  'NUMERIC': 'InputNumber (precision)',
  
  // Date/Time
  'TIMESTAMP': 'DatePicker',
  'DATE': 'DatePicker (date only)',
  'TIME': 'TimePicker',
  
  // Boolean
  'BOOLEAN': 'Switch or Checkbox',
  
  // JSON
  'JSONB': 'CodeEditor or Form.List',
  
  // Relationships
  'FOREIGN_KEY': 'Select (from related table)',
};
```

### 2. Relationship Understanding

**One-to-Many Example:**
```sql
users (1) → posts (many)
```

Generates:
- User detail page with embedded posts table
- "Add Post" button that pre-fills user_id
- Posts list component with user filter

**Many-to-Many Example:**
```sql
users ←→ user_roles ←→ roles
```

Generates:
- Multi-select role assignment component
- Role management interface
- User-role relationship table

### 3. Semantic Enrichment with Schema.org

**Mapping Example:**
```javascript
{
  component: "PersonProfile",
  schema_uri: "https://schema.org/Person",
  properties: {
    "givenName": { db_column: "first_name", type: "Text" },
    "familyName": { db_column: "last_name", type: "Text" },
    "email": { db_column: "email", type: "email" },
    "jobTitle": { db_column: "job_title", type: "Text" },
    "image": { db_column: "profile_image_url", type: "ImageUrl" }
  }
}
```

**Benefits:**
- AI understands semantic meaning
- Validates component structure against standards
- Enables rich previews and SEO
- Interoperability with other systems

### 4. Pattern Recognition

**Naming Pattern Detection:**
```javascript
const patterns = {
  settings: /_(settings|config|preferences)$/,
  options: /_(options|choices)$/,
  metadata: /_(meta|metadata|extra)$/,
  timestamps: /^(created|updated|deleted)_at$/,
  foreign_keys: /^(.+)_id$/,
};
```

**Auto-generated Components:**
- `user_settings` → SettingsForm with user context
- `created_at` → ReadOnly timestamp display
- `category_id` → CategorySelect dropdown

## Implementation: Workflow Wizard with Schema Linking

### Step 1: Database Verification

```javascript
// Verify all required tables exist
GET /api/workflow/verify-schemas

Response:
{
  "verified": true,
  "tables": [
    { "table_name": "workflows", "exists": true },
    { "table_name": "atom_definitions", "exists": true },
    ...
  ]
}
```

### Step 2: Template Selection

```javascript
// Load workflow templates with schema context
GET /api/workflow/templates

Response:
{
  "templates": [
    {
      "id": "uuid",
      "template_key": "user-management",
      "label": "User Management",
      "description": "CRUD operations for users",
      "schema_context": {
        "primary_table": "users",
        "related_tables": ["user_roles", "user_settings"]
      },
      "default_tasks": [
        "create_form",
        "list_view",
        "detail_view",
        "edit_form"
      ]
    }
  ]
}
```

### Step 3: Task Configuration with Prompts

```javascript
// Each task can have custom prompts
{
  "task_key": "create_form",
  "task_label": "User Creation Form",
  "schema_refs": ["https://schema.org/Person"],
  "handler_type": "form_generator",
  "prompt": "Generate a user creation form with validation for email uniqueness and password strength"
}
```

### Step 4: Schema Linking

```javascript
// Map schema.org concepts to components
{
  "schema_links": [
    {
      "schema_uri": "https://schema.org/Person",
      "role": "main_entity",
      "component_name": "UserProfile"
    },
    {
      "schema_uri": "https://schema.org/PostalAddress",
      "role": "address",
      "component_name": "AddressForm"
    }
  ]
}
```

### Step 5: AI Generation with Context

```javascript
POST /api/ollama/generate-workflow

{
  "template": "create_workflow_from_description",
  "parameters": {
    "workflow_description": "User management system",
    "tasks": [...],
    "schema_context": {
      "database_tables": [...],
      "relationships": [...],
      "schema_org_mappings": [...]
    }
  }
}

AI Response:
{
  "atoms": [
    { "name": "TextInput", "category": "form" },
    { "name": "EmailInput", "category": "form", "validation": "email" }
  ],
  "components": [
    {
      "name": "UserCreateForm",
      "atoms": ["TextInput", "EmailInput", "PasswordInput"],
      "schema": {
        "@type": "Person",
        "givenName": "TextInput",
        "email": "EmailInput"
      }
    }
  ],
  "dashboards": [
    {
      "name": "UserManagement",
      "components": ["UserCreateForm", "UserListTable", "UserDetailView"]
    }
  ]
}
```

## Research: Schema.org Integration

### Popular Schema.org Types for Web Applications

1. **Person** - User profiles, team members
2. **Organization** - Company profiles, clients
3. **Product** - E-commerce items, services
4. **Event** - Calendar entries, bookings
5. **Article** - Blog posts, documentation
6. **Place** - Locations, addresses
7. **Offer** - Pricing, deals
8. **Review** - Ratings, feedback

### Mapping Strategy

```javascript
const schemaComponentMapping = {
  "Person": {
    components: ["UserProfile", "ContactCard", "AuthorBio"],
    atoms: ["Avatar", "NameDisplay", "EmailLink"],
    properties: {
      required: ["givenName", "familyName"],
      recommended: ["email", "telephone", "image"]
    }
  },
  "Product": {
    components: ["ProductCard", "ProductDetail", "ProductList"],
    atoms: ["PriceDisplay", "ProductImage", "RatingStars"],
    properties: {
      required: ["name", "price"],
      recommended: ["image", "description", "brand"]
    }
  }
};
```

## Training Data for Component Generation

### 1. Database Schema Patterns

**Source:** Open-source project schemas

```
- PostgreSQL Information Schema
- MySQL Information Schema
- Sample schemas from GitHub repos
- Database design patterns
```

### 2. UI Component Libraries

**Source:** Component documentation and examples

```
- Ant Design component catalog
- Material-UI components
- Bootstrap components
- Tailwind UI examples
```

### 3. Schema.org Documentation

**Source:** Official schema.org

```
- Type definitions
- Property specifications
- Usage examples
- Industry-specific extensions
```

### 4. Real-world Workflow Examples

**Source:** n8n workflow repository

```
- Workflow templates
- Node configurations
- Integration patterns
- Automation examples
```

### 5. Component Generation Examples

**Training Pairs:**
```json
[
  {
    "input": {
      "table": "users",
      "columns": ["id", "email", "name", "created_at"],
      "relationships": ["has_many posts"]
    },
    "output": {
      "components": [
        {
          "name": "UserForm",
          "fields": [
            {"name": "email", "type": "email", "validation": "required|email"},
            {"name": "name", "type": "text", "validation": "required"}
          ]
        },
        {
          "name": "UserDetailView",
          "sections": [
            {"label": "Profile", "fields": ["email", "name"]},
            {"label": "Posts", "component": "PostList", "filter": {"user_id": "$id"}}
          ]
        }
      ]
    }
  }
]
```

## Meaningful Schema Integration Strategies

### Strategy 1: Progressive Enhancement

1. **Basic**: Generate components from database schema
2. **Enhanced**: Add schema.org semantic meaning
3. **Advanced**: Use AI to suggest optimizations

### Strategy 2: Validation & Consistency

```javascript
// Validate generated components against schema
function validateComponent(component, schemaUri) {
  const schema = getSchema(schemaUri);
  const requiredProps = schema.properties.filter(p => p.required);
  
  // Check all required properties are present
  requiredProps.forEach(prop => {
    if (!component.fields.includes(prop.name)) {
      throw new Error(`Missing required field: ${prop.name}`);
    }
  });
}
```

### Strategy 3: Context-Aware Generation

```javascript
// Use relationship context for better generation
function generateRelatedComponent(table, relationship) {
  if (relationship.type === 'belongs_to') {
    return {
      type: 'Select',
      dataSource: `fetch('api/${relationship.table}')`
    };
  } else if (relationship.type === 'has_many') {
    return {
      type: 'Table',
      filter: { [relationship.foreign_key]: '$id' },
      actions: ['view', 'edit', 'delete']
    };
  }
}
```

### Strategy 4: Iterative Refinement

```javascript
// Allow AI to refine based on feedback
POST /api/workflow/refine

{
  "workflow_id": "uuid",
  "feedback": "Add pagination to user list",
  "component": "UserListTable"
}

Response:
{
  "updated_component": {
    "name": "UserListTable",
    "pagination": {
      "pageSize": 20,
      "showSizeChanger": true
    }
  }
}
```

## Integration with Ollama

### Specialized Prompts

#### 1. Schema-Aware Component Generation

```
Template: generate_schema_aware_component

Prompt:
Given the following database schema and schema.org type, generate a React component:

Database Table: {table_name}
Columns: {columns}
Relationships: {relationships}
Schema.org Type: {schema_uri}

Generate a {component_type} component with:
- Proper TypeScript types
- Validation rules
- Accessibility features
- Schema.org structured data
```

#### 2. Relationship-Based Dashboard Generation

```
Template: generate_relational_dashboard

Prompt:
Create a dashboard for managing {entity_name} with these relationships:

{relationship_map}

Include:
- Main entity CRUD operations
- Related entity displays
- Filters and search
- Breadcrumb navigation
```

## Best Practices

### 1. Schema Naming Conventions

```sql
-- Good: Clear, semantic names
CREATE TABLE user_profiles (...)
CREATE TABLE product_categories (...)

-- Better: With schema.org context
COMMENT ON TABLE user_profiles IS '@schema: https://schema.org/Person';
COMMENT ON TABLE products IS '@schema: https://schema.org/Product';
```

### 2. Metadata Storage

```sql
-- Store generation metadata
CREATE TABLE component_generation_history (
  id UUID PRIMARY KEY,
  component_id UUID,
  schema_uri TEXT,
  generation_prompt TEXT,
  ai_model TEXT,
  confidence_score DECIMAL,
  created_at TIMESTAMP
);
```

### 3. Versioning

```sql
-- Track schema evolution
CREATE TABLE schema_versions (
  id UUID PRIMARY KEY,
  table_name TEXT,
  version INTEGER,
  schema_snapshot JSONB,
  components_affected JSONB,
  created_at TIMESTAMP
);
```

## Future Enhancements

1. **Auto-Discovery**: Automatically detect new tables and suggest components
2. **ML-Powered Optimization**: Learn from user modifications to improve generation
3. **Cross-Platform**: Generate components for web, mobile, desktop
4. **Real-time Sync**: Update components when schema changes
5. **Collaborative Schemas**: Share schema mappings across teams

## Conclusion

Linked schema functionality provides a powerful foundation for automated component generation by:

- Understanding data structure and relationships
- Providing semantic context through schema.org
- Enabling AI to generate contextually appropriate components
- Maintaining consistency across the application
- Facilitating rapid development with minimal manual coding

The combination of database schema analysis, semantic web standards, and AI-powered generation creates a system that can intelligently construct entire application workflows from simple prompts and configuration.

---

**Next Steps:**
1. Implement schema analysis runner
2. Build prompt template library
3. Train AI models on schema patterns
4. Create component validation system
5. Develop iterative refinement workflow
