# API Endpoint Registry System Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                      LightDom Platform                              │
│                                                                     │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │           API Endpoint Registry System                     │   │
│  │                                                            │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │   │
│  │  │   Discovery  │  │   Registry   │  │ Orchestrator │    │   │
│  │  │   Service    │→│   Service    │→│   Service    │    │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘    │   │
│  │         ↓                 ↓                  ↓            │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │   │
│  │  │   Endpoint   │  │   Service    │  │   Endpoint   │    │   │
│  │  │   Catalog    │  │  Composition │  │    Chains    │    │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘    │   │
│  │         ↓                 ↓                  ↓            │   │
│  │  ┌────────────────────────────────────────────────────┐   │   │
│  │  │          Workflow Wizard Service                   │   │   │
│  │  │  (Configuration-driven Workflow Builder)           │   │   │
│  │  └────────────────────────────────────────────────────┘   │   │
│  └────────────────────────────────────────────────────────────┘   │
│                              ↕                                     │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │               PostgreSQL Database                          │   │
│  │  • api_endpoints              • workflow_endpoint_chains   │   │
│  │  • service_endpoint_bindings  • workflow_wizard_configs    │   │
│  │  • service_module_registry    • endpoint_execution_logs    │   │
│  └────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

## Component Architecture

### 1. API Endpoint Discovery Service

```
┌──────────────────────────────────────────────────┐
│     API Endpoint Discovery Service               │
├──────────────────────────────────────────────────┤
│                                                  │
│  Input: Route Files Directory                   │
│    ↓                                             │
│  Scan & Parse                                    │
│    • Find route files (.js, .ts)                │
│    • Extract route patterns                     │
│    • Parse comments & JSDoc                     │
│    ↓                                             │
│  Extract Metadata                                │
│    • Path & HTTP method                         │
│    • Request/response schemas                   │
│    • Query & path parameters                    │
│    • Authentication requirements                │
│    ↓                                             │
│  Generate Endpoint Objects                       │
│    • endpoint_id                                │
│    • title, description                         │
│    • schemas, examples                          │
│    ↓                                             │
│  Output: Endpoint Catalog                       │
│                                                  │
└──────────────────────────────────────────────────┘
```

### 2. API Endpoint Registry

```
┌──────────────────────────────────────────────────┐
│        API Endpoint Registry Service             │
├──────────────────────────────────────────────────┤
│                                                  │
│  CRUD Operations:                                │
│  ┌────────────────────────────────────────────┐ │
│  │ • Create/Register endpoints                │ │
│  │ • Read/Query endpoints                     │ │
│  │ • Update endpoint metadata                 │ │
│  │ • Delete endpoints                         │ │
│  └────────────────────────────────────────────┘ │
│                                                  │
│  Query & Search:                                 │
│  ┌────────────────────────────────────────────┐ │
│  │ • Filter by category/method/type           │ │
│  │ • Full-text search                         │ │
│  │ • Tag-based filtering                      │ │
│  │ • Statistics & aggregations                │ │
│  └────────────────────────────────────────────┘ │
│                                                  │
│  Service Management:                             │
│  ┌────────────────────────────────────────────┐ │
│  │ • Bind endpoints to services               │ │
│  │ • Manage data flow mappings                │ │
│  │ • Create endpoint chains                   │ │
│  │ • Log execution history                    │ │
│  └────────────────────────────────────────────┘ │
│                                                  │
└──────────────────────────────────────────────────┘
```

### 3. Service Composition Orchestrator

```
┌──────────────────────────────────────────────────────────────┐
│        Service Composition Orchestrator                      │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Execution Patterns:                                         │
│                                                              │
│  Sequential:                                                 │
│  ┌──────┐  ┌──────┐  ┌──────┐                               │
│  │ EP 1 │→│ EP 2 │→│ EP 3 │                               │
│  └──────┘  └──────┘  └──────┘                               │
│                                                              │
│  Parallel:                                                   │
│            ┌──────┐                                          │
│         ┌→│ EP 1 │─┐                                        │
│  Input ─┼→│ EP 2 │─┼→ Merge → Output                       │
│         └→│ EP 3 │─┘                                        │
│            └──────┘                                          │
│                                                              │
│  Conditional:                                                │
│  ┌──────┐    ┌──────┐    ┌──────┐                          │
│  │ EP 1 │→ ? │ EP 2 │ OR │ EP 3 │                          │
│  └──────┘    └──────┘    └──────┘                          │
│                                                              │
│  Features:                                                   │
│  • Data flow mapping (input/output)                         │
│  • Transform scripts                                         │
│  • Error handling (retry/fallback)                          │
│  • Conditional execution                                     │
│  • Performance monitoring                                    │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### 4. Workflow Wizard Service

```
┌──────────────────────────────────────────────────────────────┐
│           Workflow Wizard Service                            │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Step 1: Select Category                                     │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Available Categories:                                  │ │
│  │ • Workflow  • Data Mining  • AI  • Blockchain          │ │
│  └────────────────────────────────────────────────────────┘ │
│                    ↓                                         │
│  Step 2: Choose Endpoints                                    │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ [x] GET /api/data/fetch                                │ │
│  │ [x] POST /api/data/process                             │ │
│  │ [x] POST /api/data/save                                │ │
│  └────────────────────────────────────────────────────────┘ │
│                    ↓                                         │
│  Step 3: Configure Data Flow                                 │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ EP1.output → EP2.input                                 │ │
│  │ EP2.result → EP3.data                                  │ │
│  └────────────────────────────────────────────────────────┘ │
│                    ↓                                         │
│  Step 4: Advanced Settings                                   │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Execution: Sequential / Parallel / Conditional         │ │
│  │ Retry Policy: 3 attempts, exponential backoff          │ │
│  │ Error Handling: Continue / Stop / Rollback             │ │
│  └────────────────────────────────────────────────────────┘ │
│                    ↓                                         │
│  Step 5: Review & Create                                     │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Workflow Preview                                       │ │
│  │ ├─ Fetch Data (GET /api/data/fetch)                   │ │
│  │ ├─ Process Data (POST /api/data/process)              │ │
│  │ └─ Save Results (POST /api/data/save)                 │ │
│  └────────────────────────────────────────────────────────┘ │
│                    ↓                                         │
│  Output: Service Composition or Endpoint Chain               │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

## Data Flow Architecture

### Endpoint Registration Flow

```
┌──────────────┐
│ Route Files  │
│  (*.js, *.ts)│
└──────┬───────┘
       │
       ↓ Scan & Parse
┌──────────────┐
│  Discovery   │
│   Service    │
└──────┬───────┘
       │
       ↓ Extract Metadata
┌──────────────┐
│  Endpoint    │
│   Objects    │
└──────┬───────┘
       │
       ↓ Register
┌──────────────┐
│   Registry   │
│   Service    │
└──────┬───────┘
       │
       ↓ Store
┌──────────────┐
│  PostgreSQL  │
│  api_endpoints│
└──────────────┘
```

### Service Execution Flow

```
┌──────────────┐
│  Client      │
│  Request     │
└──────┬───────┘
       │
       ↓ Execute Service
┌──────────────┐
│ Orchestrator │
└──────┬───────┘
       │
       ↓ Get Bindings
┌──────────────┐
│   Registry   │
└──────┬───────┘
       │
       ↓ Endpoints
┌──────────────────────────────┐
│  Execute in Order:           │
│  1. Endpoint 1 → Result 1    │
│  2. Map Data                 │
│  3. Endpoint 2 → Result 2    │
│  4. Transform                │
│  5. Endpoint 3 → Final       │
└──────┬───────────────────────┘
       │
       ↓ Log & Return
┌──────────────┐
│   Client     │
│   Response   │
└──────────────┘
```

## Database Schema Relationships

```
┌─────────────────────┐
│   api_endpoints     │
│  • endpoint_id (PK) │
│  • title            │
│  • path, method     │
│  • schemas          │
└──────────┬──────────┘
           │
           │ Referenced by
           ↓
┌─────────────────────────────────┐
│  service_endpoint_bindings      │
│  • binding_id (PK)              │
│  • service_id (FK)              │──┐
│  • endpoint_id (FK) ────────────┘  │
│  • input_mapping                   │
│  • output_mapping                  │
└────────────────────────────────────┘
           │
           │ Belongs to
           ↓
┌─────────────────────┐
│  workflow_services  │
│  • service_id (PK)  │
│  • workflow_id (FK) │
│  • name             │
│  • bundled_endpoints│
└─────────────────────┘
           │
           │ Part of
           ↓
┌─────────────────────────────┐
│  workflow_hierarchy         │
│  • workflow_id (PK)         │
│  • name                     │
│  • hierarchy_level          │
└─────────────────────────────┘

┌─────────────────────────────┐
│  workflow_endpoint_chains   │
│  • chain_id (PK)            │
│  • workflow_id (FK)         │
│  • endpoints (JSONB)        │
│  • chain_type               │
│  • execution_stats          │
└─────────────────────────────┘

┌─────────────────────────────┐
│  workflow_wizard_configs    │
│  • config_id (PK)           │
│  • steps (JSONB)            │
│  • form_schema (JSONB)      │
│  • available_endpoints      │
└─────────────────────────────┘

┌─────────────────────────────┐
│  endpoint_execution_logs    │
│  • execution_id (PK)        │
│  • endpoint_id (FK)         │
│  • request/response         │
│  • performance metrics      │
└─────────────────────────────┘
```

## API Layer Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  Express API Server                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  /api/endpoint-registry/                                │
│  ├─ GET    /discover              # Scan & register    │
│  ├─ POST   /endpoints             # Register endpoint  │
│  ├─ GET    /endpoints             # List all           │
│  ├─ GET    /endpoints/search      # Search             │
│  ├─ GET    /endpoints/:id         # Get details        │
│  ├─ PUT    /endpoints/:id         # Update             │
│  ├─ DELETE /endpoints/:id         # Delete             │
│  ├─ POST   /services/:id/bind-endpoint  # Bind         │
│  ├─ GET    /services/:id/bindings       # Get bindings │
│  ├─ POST   /services/:id/execute        # Execute      │
│  ├─ POST   /chains                      # Create chain │
│  ├─ GET    /workflows/:id/chains        # List chains  │
│  ├─ GET    /chains/:id/execution-plan   # Get plan     │
│  ├─ POST   /chains/:id/execute          # Execute      │
│  ├─ GET    /stats                       # Statistics   │
│  └─ GET    /categories                  # Categories   │
│                                                         │
│  /api/workflow-wizard/                                  │
│  ├─ POST   /configs                     # Create       │
│  ├─ GET    /configs                     # List         │
│  ├─ GET    /configs/:id                 # Get details  │
│  ├─ PUT    /configs/:id                 # Update       │
│  ├─ DELETE /configs/:id                 # Delete       │
│  ├─ POST   /generate-from-category      # Auto-gen     │
│  ├─ POST   /configs/:id/submit          # Submit form  │
│  ├─ GET    /templates                   # Templates    │
│  └─ POST   /validate                    # Validate     │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Modular Architecture

```
┌──────────────────────────────────────────────────────────┐
│              Service Module Registry                     │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Module Discovery:                                       │
│  ┌────────────────────────────────────────────────────┐ │
│  │  Scan services/ directory                          │ │
│  │  Load module metadata                              │ │
│  │  Check dependencies                                │ │
│  │  Verify compatibility                              │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  Module Loading:                                         │
│  ┌────────────────────────────────────────────────────┐ │
│  │  Priority-based loading                            │ │
│  │  Dependency resolution                             │ │
│  │  Dynamic import/export                             │ │
│  │  Event hook registration                           │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  Plug-and-Play:                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │  Add: Drop file in services/                       │ │
│  │  Remove: Delete or disable in registry            │ │
│  │  Update: Replace file, restart                    │ │
│  │  Configure: JSON-based module config              │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

## Monitoring & Observability

```
┌──────────────────────────────────────────────────────────┐
│              Execution Monitoring                        │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Real-time Metrics:                                      │
│  ┌────────────────────────────────────────────────────┐ │
│  │ • Active executions                                │ │
│  │ • Success/failure rates                            │ │
│  │ • Average response times                           │ │
│  │ • Endpoint usage statistics                        │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  Execution Logs:                                         │
│  ┌────────────────────────────────────────────────────┐ │
│  │ • Complete request/response                        │ │
│  │ • Performance metrics                              │ │
│  │ • Error traces                                     │ │
│  │ • User context                                     │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  Chain Analytics:                                        │
│  ┌────────────────────────────────────────────────────┐ │
│  │ • Total executions                                 │ │
│  │ • Success rates                                    │ │
│  │ • Average duration                                 │ │
│  │ • Bottleneck identification                        │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

## Deployment Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    Production Setup                      │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐         ┌──────────────┐              │
│  │   Load       │────────→│   API        │              │
│  │   Balancer   │         │   Server     │              │
│  └──────────────┘         └──────┬───────┘              │
│                                  │                       │
│                                  ↓                       │
│                          ┌──────────────┐                │
│                          │  Registry    │                │
│                          │  Service     │                │
│                          └──────┬───────┘                │
│                                 │                        │
│                                 ↓                        │
│                          ┌──────────────┐                │
│                          │  PostgreSQL  │                │
│                          │  (Primary)   │                │
│                          └──────┬───────┘                │
│                                 │                        │
│                                 ↓ Replicate              │
│                          ┌──────────────┐                │
│                          │  PostgreSQL  │                │
│                          │  (Replica)   │                │
│                          └──────────────┘                │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

## Security Architecture

```
┌──────────────────────────────────────────────────────────┐
│                   Security Layers                        │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  1. Authentication Layer                                 │
│     ├─ Token validation                                  │
│     ├─ User identification                               │
│     └─ Session management                                │
│                                                          │
│  2. Authorization Layer                                  │
│     ├─ Role-based access                                 │
│     ├─ Endpoint permissions                              │
│     └─ Resource ownership                                │
│                                                          │
│  3. Rate Limiting                                        │
│     ├─ Per-endpoint limits                               │
│     ├─ User-based throttling                             │
│     └─ Burst protection                                  │
│                                                          │
│  4. Input Validation                                     │
│     ├─ Schema validation                                 │
│     ├─ Sanitization                                      │
│     └─ Type checking                                     │
│                                                          │
│  5. Execution Isolation                                  │
│     ├─ Sandboxed transforms                              │
│     ├─ Timeout enforcement                               │
│     └─ Resource limits                                   │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

This architecture enables:
- **Scalability**: Distributed execution, caching, load balancing
- **Maintainability**: Modular design, clear separation of concerns
- **Flexibility**: Config-driven, plug-and-play components
- **Observability**: Complete logging, metrics, tracing
- **Security**: Multi-layer protection, validation, isolation
