# DeepSeek Database Integration Guide

## Overview

Secure, read-only database access for DeepSeek AI with comprehensive safety controls, rate limiting, and automatic query suggestion.

---

## 🔒 Safety Features

### 1. **Read-Only Mode**

- Only `SELECT`, `EXPLAIN`, and `SHOW` operations allowed
- All write operations (`INSERT`, `UPDATE`, `DELETE`, `DROP`, `CREATE`, `ALTER`) are blocked
- SQL injection patterns are detected and rejected

### 2. **Table Access Control**

- Sensitive tables (users, api_keys, sessions, passwords) are blacklisted
- Schema introspection respects table restrictions
- Customizable allowed/disallowed table lists

### 3. **Rate Limiting**

- 30 requests per minute per client IP
- In-memory store (upgrade to Redis for production)
- Rate limit info returned in every response

### 4. **Query Constraints**

- Maximum 1000 rows per query
- 10-second query timeout
- Automatic LIMIT injection if not specified

### 5. **Safety Validation**

- Pre-execution query analysis
- Pattern matching for dangerous SQL
- Detailed error messages with security context

---

## 📡 API Endpoints

### GET /api/deepseek-db/schema

**Description**: Get complete database schema for DeepSeek to understand structure

**Response**:

```json
{
  "success": true,
  "schema": [
    {
      "schema": "public",
      "table": "seo_campaigns",
      "type": "BASE TABLE",
      "columns": [
        {
          "column_name": "id",
          "data_type": "integer",
          "is_nullable": "NO",
          "column_default": "nextval('seo_campaigns_id_seq'::regclass)"
        }
      ],
      "indexes": [
        {
          "indexname": "seo_campaigns_pkey",
          "indexdef": "CREATE UNIQUE INDEX..."
        }
      ],
      "estimatedRows": 150
    }
  ],
  "safety": {
    "readOnly": true,
    "allowedOperations": ["SELECT", "EXPLAIN", "SHOW"],
    "disallowedTables": ["users", "api_keys", "sessions", "passwords"],
    "maxRows": 1000
  },
  "rateLimit": {
    "remaining": 29,
    "resetAt": "2025-01-12T16:45:00.000Z"
  }
}
```

---

### POST /api/deepseek-db/query

**Description**: Execute a safe, read-only SQL query

**Request**:

```json
{
  "query": "SELECT * FROM seo_campaigns WHERE status = $1 LIMIT 10",
  "params": ["active"]
}
```

**Response**:

```json
{
  "success": true,
  "data": {
    "fields": [
      { "name": "id", "dataType": 23 },
      { "name": "title", "dataType": 1043 }
    ],
    "rows": [
      [1, "Campaign 1"],
      [2, "Campaign 2"]
    ],
    "rowCount": 2
  },
  "meta": {
    "executionTime": 45,
    "limited": false
  },
  "rateLimit": {
    "remaining": 28,
    "resetAt": "2025-01-12T16:45:00.000Z"
  }
}
```

**Error Response** (unsafe query):

```json
{
  "success": false,
  "error": "Query not allowed",
  "reason": "Operation \"DELETE\" is not allowed. DeepSeek can only perform read operations.",
  "hint": "DeepSeek can only execute SELECT queries on allowed tables."
}
```

---

### POST /api/deepseek-db/suggest

**Description**: Get AI-powered query suggestions from natural language intent

**Request**:

```json
{
  "intent": "Show me the 5 most recent SEO campaigns with their click counts",
  "context": {
    "orderBy": "created_at",
    "includeStats": true
  }
}
```

**Response**:

```json
{
  "success": true,
  "suggestion": {
    "query": "SELECT id, title, click_count, created_at FROM seo_campaigns ORDER BY created_at DESC LIMIT 5;",
    "safe": true,
    "intent": "Show me the 5 most recent SEO campaigns with their click counts"
  },
  "rateLimit": {
    "remaining": 27,
    "resetAt": "2025-01-12T16:45:00.000Z"
  }
}
```

**DeepSeek Integration**: This endpoint uses the local Ollama DeepSeek model to generate SQL from natural language, then validates the generated query for safety.

---

### GET /api/deepseek-db/examples

**Description**: Get example queries for common database operations

**Response**:

```json
{
  "success": true,
  "examples": [
    {
      "title": "Count all records",
      "query": "SELECT COUNT(*) FROM seo_campaigns;",
      "description": "Get total number of rows in a table"
    },
    {
      "title": "Get recent records",
      "query": "SELECT * FROM seo_campaigns ORDER BY created_at DESC LIMIT 10;",
      "description": "Fetch the 10 most recent records"
    }
  ],
  "availableTables": ["seo_campaigns", "crawler_jobs", "dom_optimizations"]
}
```

---

## 🤖 DeepSeek System Prompt

When configuring DeepSeek to use the database API, use this system prompt:

```
You are an AI assistant with secure, read-only access to a PostgreSQL database.

DATABASE ACCESS:
- Use GET /api/deepseek-db/schema to understand table structure
- Use POST /api/deepseek-db/query to execute SELECT queries
- Use POST /api/deepseek-db/suggest to convert natural language to SQL

SAFETY RULES:
- You can ONLY execute SELECT, EXPLAIN, and SHOW statements
- Write operations (INSERT, UPDATE, DELETE, DROP, CREATE, ALTER) are BLOCKED
- Sensitive tables (users, api_keys, sessions, passwords) are RESTRICTED
- All queries are rate-limited to 30 requests per minute
- Results are limited to 1000 rows maximum

WORKFLOW:
1. When user asks about database content, call GET /api/deepseek-db/schema first
2. Analyze the schema to understand available tables and columns
3. Generate appropriate SQL queries using table/column information
4. Execute queries with POST /api/deepseek-db/query
5. If unsure about SQL syntax, use POST /api/deepseek-db/suggest with natural language intent

BEST PRACTICES:
- Always include LIMIT clauses to avoid large result sets
- Use parameterized queries ($1, $2) for user inputs
- Explain query results in natural language
- Suggest useful queries based on schema structure
- Handle errors gracefully and suggest alternatives

EXAMPLE INTERACTION:
User: "How many SEO campaigns are active?"

You:
1. Check schema: GET /api/deepseek-db/schema
2. Generate query: SELECT COUNT(*) FROM seo_campaigns WHERE status = 'active'
3. Execute: POST /api/deepseek-db/query {"query": "SELECT COUNT(*) FROM seo_campaigns WHERE status = $1", "params": ["active"]}
4. Respond: "There are 47 active SEO campaigns in the database."
```

---

## 🔧 Configuration

Edit `api/deepseek-db-routes.js` to customize safety settings:

```javascript
const SAFETY_CONFIG = {
  // Allowed operations
  allowedOperations: ['SELECT', 'EXPLAIN', 'SHOW'],

  // Disallowed operations
  disallowedOperations: [
    'INSERT',
    'UPDATE',
    'DELETE',
    'DROP',
    'CREATE',
    'ALTER',
    'TRUNCATE',
    'GRANT',
    'REVOKE',
  ],

  // Rate limit (requests per minute)
  rateLimit: 30,

  // Maximum rows to return
  maxRows: 1000,

  // Query timeout (ms)
  queryTimeout: 10000,

  // Allowed tables (empty = all except disallowed)
  allowedTables: [],

  // Disallowed tables (sensitive data)
  disallowedTables: ['users', 'api_keys', 'sessions', 'passwords'],
};
```

---

## 🚀 Usage Examples

### Example 1: Schema Exploration

```bash
# Get database schema
curl http://localhost:3001/api/deepseek-db/schema
```

### Example 2: Simple Query

```bash
# Count campaigns
curl -X POST http://localhost:3001/api/deepseek-db/query \
  -H "Content-Type: application/json" \
  -d '{
    "query": "SELECT COUNT(*) FROM seo_campaigns"
  }'
```

### Example 3: Parameterized Query

```bash
# Find campaigns by status
curl -X POST http://localhost:3001/api/deepseek-db/query \
  -H "Content-Type: application/json" \
  -d '{
    "query": "SELECT id, title, status FROM seo_campaigns WHERE status = $1 LIMIT 20",
    "params": ["active"]
  }'
```

### Example 4: Natural Language Query

```bash
# Get AI-generated query from intent
curl -X POST http://localhost:3001/api/deepseek-db/suggest \
  -H "Content-Type: application/json" \
  -d '{
    "intent": "Show me the top 10 campaigns with the most clicks this month"
  }'
```

---

## 🛡️ Security Considerations

### Production Deployment

1. **Enable HTTPS**: All API requests should use HTTPS in production
2. **Authentication**: Add JWT or API key authentication before database routes
3. **Redis Rate Limiting**: Replace in-memory rate limiter with Redis for distributed systems
4. **Read-Only Database User**: Create a PostgreSQL user with SELECT-only permissions
5. **Query Logging**: Log all queries for audit trail
6. **IP Whitelisting**: Restrict access to trusted IPs only

### Database User Setup

```sql
-- Create read-only user for DeepSeek
CREATE USER deepseek_readonly WITH PASSWORD 'secure_password';

-- Grant connect
GRANT CONNECT ON DATABASE your_database TO deepseek_readonly;

-- Grant schema usage
GRANT USAGE ON SCHEMA public TO deepseek_readonly;

-- Grant SELECT on all tables (except sensitive ones)
GRANT SELECT ON ALL TABLES IN SCHEMA public TO deepseek_readonly;
REVOKE SELECT ON users, api_keys, sessions, passwords FROM deepseek_readonly;

-- Grant SELECT on future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT ON TABLES TO deepseek_readonly;
```

Update `DATABASE_URL` environment variable:

```
DATABASE_URL=postgresql://deepseek_readonly:secure_password@localhost:5432/lightdom
```

---

## 📊 Monitoring

Track these metrics for database access:

- **Request Rate**: Queries per minute per client
- **Query Performance**: Execution time distribution
- **Error Rate**: Failed queries vs total queries
- **Safety Violations**: Blocked query attempts
- **Table Access Patterns**: Most queried tables

---

## 🔍 Troubleshooting

### Issue: "Rate limit exceeded"

**Solution**: Wait 60 seconds or increase `SAFETY_CONFIG.rateLimit`

### Issue: "Query not allowed"

**Solution**: Ensure query starts with SELECT, EXPLAIN, or SHOW. Check for write operations.

### Issue: "Access to table is restricted"

**Solution**: Table is in `disallowedTables` list. Use a different table or request access.

### Issue: "Query execution failed"

**Solution**: Check SQL syntax, ensure table/column names are correct, verify parameterized query format.

---

## 🎯 Next Steps

1. Test endpoints with Postman or curl
2. Update DeepSeek system prompt in frontend
3. Add authentication middleware in production
4. Set up Redis for rate limiting
5. Create read-only database user
6. Monitor query patterns and optimize

---

**Last Updated**: 2025-01-12  
**API Version**: 1.0.0  
**Status**: Ready for Testing
