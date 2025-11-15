# 🚀 API Endpoint Registry - Easy Setup Guide

Get started with the API Endpoint Registry system in just **3 steps**!

## ⚡ Quick Setup

### Option 1: Automated Setup (Recommended)

**Linux/Mac:**
```bash
./setup-endpoint-registry.sh
```

**Windows:**
```cmd
setup-endpoint-registry.bat
```

That's it! The script will:
- ✅ Check prerequisites
- ✅ Create all database tables
- ✅ Seed demo data
- ✅ Verify installation
- ✅ Show you what to do next

### Option 2: Manual Setup

If you prefer to run commands manually:

```bash
# 1. Run the schema migration
psql -d dom_space_harvester -f migrations/20251115_api_endpoint_registry.sql

# 2. Seed the demo data
psql -d dom_space_harvester -f migrations/20251115_api_endpoint_registry_demo_data.sql

# 3. Verify it worked
psql -d dom_space_harvester -c "SELECT COUNT(*) FROM api_endpoints;"
```

## 📊 What Gets Created

The demo data includes a complete, working example:

### Demo Workflow: "Data Pipeline"
A 3-step ETL (Extract-Transform-Load) process:

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ Fetch Data  │ --> │ Transform   │ --> │ Save Results│
│ (GET)       │     │ Data (POST) │     │ (POST)      │
└─────────────┘     └─────────────┘     └─────────────┘
```

### What You'll See:

**4 API Endpoints:**
- `demo-fetch-data` - GET /api/data/fetch
- `demo-transform-data` - POST /api/data/transform
- `demo-save-results` - POST /api/data/save
- `demo-workflow-status` - GET /api/workflows/:id/status

**1 Service Composition:**
- `demo-etl-service` - Combines the 3 endpoints with data flow mapping

**2 Endpoint Chains:**
- Sequential ETL chain (fetch → transform → save)
- Parallel processing chain (for comparison)

**1 Workflow Wizard:**
- Pre-configured wizard for building data mining workflows

**3 Execution Logs:**
- Shows successful execution history

## 🔍 Exploring the Data

### View All Endpoints

```sql
SELECT endpoint_id, method, path, category, description
FROM api_endpoints
ORDER BY category, endpoint_id;
```

**Output:**
```
     endpoint_id      | method |            path             |  category   |          description
---------------------+--------+-----------------------------+-------------+------------------------------
 demo-fetch-data     | GET    | /api/data/fetch             | data-mining | Fetches raw data from source
 demo-transform-data | POST   | /api/data/transform         | data-mining | Transforms raw data
 demo-save-results   | POST   | /api/data/save              | data-mining | Saves processed data
 demo-workflow-status| GET    | /api/workflows/:id/status   | workflow    | Checks workflow status
```

### See How Endpoints Connect

```sql
SELECT 
    ae.title as endpoint,
    seb.binding_order as order,
    ws.name as service,
    seb.input_mapping,
    seb.output_mapping
FROM api_endpoints ae
JOIN service_endpoint_bindings seb ON ae.endpoint_id = seb.endpoint_id
JOIN workflow_services ws ON seb.service_id = ws.service_id
ORDER BY seb.binding_order;
```

**Output:**
```
      endpoint       | order |     service     |     input_mapping      |      output_mapping
---------------------+-------+-----------------+------------------------+---------------------------
 Fetch Raw Data      |   0   | Demo ETL Service| {}                     | {"rawData": "data"}
 Transform Data      |   1   | Demo ETL Service| {"data": "rawData"}    | {"processedData": "transformedData"}
 Save Processed...   |   2   | Demo ETL Service| {"data": "processedData"}| {"savedCount": "saved"}
```

### View Execution History

```sql
SELECT 
    endpoint_id,
    request_method || ' ' || request_path as request,
    response_status,
    response_time_ms,
    status,
    started_at
FROM endpoint_execution_logs
ORDER BY started_at;
```

**Output:**
```
   endpoint_id      |          request           | response_status | response_time_ms | status  |       started_at
--------------------+---------------------------+-----------------+------------------+---------+------------------------
 demo-fetch-data    | GET /api/data/fetch       |       200       |     234.56       | success | 2025-11-15 13:10:00
 demo-transform-data| POST /api/data/transform  |       200       |     456.78       | success | 2025-11-15 13:11:00
 demo-save-results  | POST /api/data/save       |       200       |     123.45       | success | 2025-11-15 13:12:00
```

### View Chain Configuration

```sql
SELECT 
    chain_id,
    name,
    chain_type,
    jsonb_array_length(endpoints) as num_endpoints,
    total_executions,
    successful_executions,
    avg_execution_time_ms
FROM workflow_endpoint_chains;
```

**Output:**
```
     chain_id     |           name            |  chain_type  | num_endpoints | total_executions | successful | avg_time_ms
------------------+---------------------------+--------------+---------------+------------------+------------+-------------
 demo-etl-chain   | Demo ETL Chain            | sequential   |       3       |        1         |     1      |   814.79
 demo-parallel-chain| Demo Parallel Chain    | parallel     |       2       |        0         |     0      |    0.00
```

## 🎯 Understanding the Relationships

### Table Structure

```
workflow_hierarchy (1 demo workflow)
    ↓
workflow_services (1 demo service)
    ↓
service_endpoint_bindings (3 bindings)
    ↓
api_endpoints (4 demo endpoints)

workflow_endpoint_chains (2 chains)
    ↓
api_endpoints (references)

endpoint_execution_logs (3 logs)
    ↓
api_endpoints, workflow_endpoint_chains (foreign keys)
```

### How Data Flows

**Service Composition Example:**

1. **Step 0 - Fetch Data:**
   - Endpoint: `demo-fetch-data`
   - Output: `{"rawData": <fetched data>}`

2. **Step 1 - Transform:**
   - Endpoint: `demo-transform-data`
   - Input: `{"data": <rawData from step 0>}`
   - Output: `{"processedData": <transformed data>}`

3. **Step 2 - Save:**
   - Endpoint: `demo-save-results`
   - Input: `{"data": <processedData from step 1>}`
   - Output: `{"savedCount": <number>}`

## 🧪 Testing the Demo

### 1. Check the API Server

```bash
# Start the server
npm run start:dev

# In another terminal, test the endpoint
curl http://localhost:3001/api/endpoint-registry/endpoints
```

### 2. View Demo Data via API

```bash
# Get all endpoints
curl http://localhost:3001/api/endpoint-registry/endpoints

# Get statistics
curl http://localhost:3001/api/endpoint-registry/stats

# Search for demo endpoints
curl "http://localhost:3001/api/endpoint-registry/endpoints/search?q=demo"

# Get a specific endpoint
curl http://localhost:3001/api/endpoint-registry/endpoints/demo-fetch-data

# Get service bindings
curl http://localhost:3001/api/endpoint-registry/services/demo-etl-service/bindings
```

### 3. Run the Demo Script

```bash
node demo-endpoint-registry-system.js
```

This will:
- Discover more endpoints from your codebase
- Register them
- Create additional service compositions
- Execute chains
- Generate wizards

## 📚 Learning Path

1. **Explore the Demo Data** (15 min)
   - Run the SQL queries above
   - Understand the relationships
   - See how data flows

2. **Try the API** (15 min)
   - Use curl commands above
   - Browse endpoints
   - View statistics

3. **Read the Documentation** (30 min)
   - Start with `API_ENDPOINT_REGISTRY_QUICKSTART.md`
   - Review `API_ENDPOINT_REGISTRY_SYSTEM.md`
   - Check out `API_ENDPOINT_REGISTRY_ARCHITECTURE.md`

4. **Build Your Own** (1 hour+)
   - Create your own endpoints
   - Build service compositions
   - Set up endpoint chains
   - Generate wizards

## 🔧 Customization

### Add Your Own Demo Data

Edit `migrations/20251115_api_endpoint_registry_demo_data.sql` and add:

```sql
-- Your custom endpoint
INSERT INTO api_endpoints (
    endpoint_id, title, path, method, description, category, ...
) VALUES (
    'my-custom-endpoint',
    'My Custom Endpoint',
    '/api/my/endpoint',
    'GET',
    'My custom endpoint description',
    'my-category',
    ...
);
```

Then re-run:
```bash
psql -d dom_space_harvester -f migrations/20251115_api_endpoint_registry_demo_data.sql
```

### Reset Demo Data

To start fresh:

```sql
-- Delete demo data (keeps schema)
DELETE FROM endpoint_execution_logs WHERE execution_id LIKE 'demo-%';
DELETE FROM workflow_endpoint_chains WHERE chain_id LIKE 'demo-%';
DELETE FROM service_endpoint_bindings WHERE binding_id LIKE 'demo-%';
DELETE FROM workflow_wizard_configs WHERE config_id LIKE 'demo-%';
DELETE FROM service_module_registry WHERE module_id LIKE 'demo-%';
DELETE FROM api_endpoints WHERE endpoint_id LIKE 'demo-%';
DELETE FROM workflow_services WHERE service_id LIKE 'demo-%';
DELETE FROM workflow_hierarchy WHERE workflow_id LIKE 'demo-%';
```

Then re-seed:
```bash
psql -d dom_space_harvester -f migrations/20251115_api_endpoint_registry_demo_data.sql
```

## ❓ Troubleshooting

### "relation does not exist" error

Make sure you've run the workflow-hierarchy migration first:
```bash
psql -d dom_space_harvester -f migrations/workflow-hierarchy-schema.sql
```

### "already exists" warnings

This is normal! The script uses `ON CONFLICT DO NOTHING` to be idempotent (safe to run multiple times).

### Can't connect to database

Check your environment variables:
```bash
export DB_HOST=localhost
export DB_PORT=5432
export DB_NAME=dom_space_harvester
export DB_USER=postgres
export DB_PASSWORD=your_password
```

### Demo data not showing

Verify the insert worked:
```sql
SELECT COUNT(*) FROM api_endpoints WHERE endpoint_id LIKE 'demo-%';
-- Should return 4
```

## 🎉 What's Next?

Now that you have demo data, you can:

1. **Discover Real Endpoints:**
   ```bash
   curl http://localhost:3001/api/endpoint-registry/discover?register=true
   ```

2. **Create Real Services:**
   - Use the demo service as a template
   - Bind your actual endpoints
   - Configure data flow

3. **Build Real Workflows:**
   - Use the wizard
   - Or create chains programmatically
   - Monitor execution logs

4. **Integrate with Your App:**
   - Use the orchestrator in your code
   - Create custom wizards
   - Build dashboards

## 📖 Documentation

- **Quick Start:** `API_ENDPOINT_REGISTRY_QUICKSTART.md`
- **Complete Guide:** `API_ENDPOINT_REGISTRY_SYSTEM.md`
- **Architecture:** `API_ENDPOINT_REGISTRY_ARCHITECTURE.md`
- **This Guide:** `SETUP_ENDPOINT_REGISTRY_README.md`

## 💡 Tips

- **Use the demo as a template** - Copy the patterns and adapt them
- **Experiment safely** - Demo data uses 'demo-' prefix, won't conflict with real data
- **Check the logs** - Execution logs show you exactly what happened
- **Start simple** - Build one chain first, then add complexity

---

**Need Help?** Check the troubleshooting section or review the full documentation.

**Ready to Build?** Start with the quickstart guide!
