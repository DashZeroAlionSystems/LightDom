# Chrome Layers 3D Visualization System - Visual Architecture

```mermaid
graph TB
    subgraph "User Interface Layer"
        UI[Chrome Layers 3D Dashboard]
        UI --> VIEW_3D[3D Canvas View]
        UI --> VIEW_2D[2D Diagram View]
        UI --> VIEW_LIST[Component List]
        UI --> VIEW_SCHEMA[Schema Links]
        UI --> VIEW_TRAIN[Training Data]
    end

    subgraph "API Layer"
        API[REST API Endpoints]
        API --> EP1[POST /api/layers/analyze]
        API --> EP2[POST /api/layers/3d-map]
        API --> EP3[POST /api/layers/component-map]
        API --> EP4[POST /api/layers/training-data]
        API --> EP5[POST /api/layers/batch-analyze]
        API --> EP6[POST /api/layers/infographic]
        API --> EP7[GET /api/layers/design-rules]
        API --> EP8[GET /api/layers/status]
    end

    subgraph "Service Layer"
        SVC[ChromeLayersService]
        SVC --> INIT[Initialize Browser]
        SVC --> ANALYZE[Analyze Layers]
        SVC --> MAP3D[Generate 3D Map]
        SVC --> EXTRACT[Extract Training Data]
        SVC --> VALIDATE[Validate Design Rules]
        
        INFOG[InfographicGenerator]
        INFOG --> GEN1[Overview Section]
        INFOG --> GEN2[Hierarchy Section]
        INFOG --> GEN3[Performance Section]
        INFOG --> GEN4[Compliance Section]
        INFOG --> GEN5[Relationships Section]
    end

    subgraph "Chrome DevTools Protocol"
        CDP[Chrome CDP]
        CDP --> LAYER_TREE[LayerTree.enable]
        CDP --> DOM_SNAP[DOMSnapshot.captureSnapshot]
        CDP --> CSS_COV[CSS.enable]
        CDP --> PAGE_EN[Page.enable]
    end

    subgraph "Data Layer"
        DB[(PostgreSQL)]
        DB --> TBL1[layer_training_data]
        DB --> TBL2[component_3d_maps]
        DB --> TBL3[component_schema_links]
        DB --> TBL4[design_rule_violations]
        DB --> TBL5[layer_patterns]
        DB --> TBL6[layer_analysis_cache]
        
        CACHE[(Redis Cache)]
        CACHE --> CACHED[Cached Analyses]
    end

    subgraph "Browser Engine"
        BROWSER[Puppeteer/Chrome]
        BROWSER --> HEADLESS[Headless Mode]
        BROWSER --> RENDER[Page Rendering]
        BROWSER --> EXEC[Script Execution]
    end

    UI --> API
    API --> SVC
    API --> INFOG
    SVC --> CDP
    CDP --> BROWSER
    SVC --> DB
    SVC --> CACHE
    INFOG --> DB

    style UI fill:#e1f5ff
    style API fill:#fff9c4
    style SVC fill:#f0f4c3
    style CDP fill:#ffccbc
    style DB fill:#c8e6c9
    style BROWSER fill:#d1c4e9
```

## Data Flow

```mermaid
sequenceDiagram
    participant User
    participant Dashboard
    participant API
    participant Service
    participant CDP
    participant Browser
    participant Database

    User->>Dashboard: Enter URL
    Dashboard->>API: POST /api/layers/analyze
    API->>Service: analyzeLayersForUrl()
    Service->>Browser: Launch headless Chrome
    Browser-->>Service: Browser instance
    Service->>CDP: Enable LayerTree
    Service->>CDP: Enable DOMSnapshot
    Service->>Browser: Navigate to URL
    Browser-->>Service: Page loaded
    Service->>CDP: captureSnapshot()
    CDP-->>Service: DOM snapshot
    Service->>CDP: compositingReasons()
    CDP-->>Service: Layer tree data
    Service->>Service: buildLayerData()
    Service->>Service: extractComponentMap()
    Service->>Service: generate3DMap()
    Service->>Service: extractTrainingData()
    Service->>Database: Save training data
    Database-->>Service: Saved
    Service-->>API: Analysis result
    API-->>Dashboard: JSON response
    Dashboard->>Dashboard: Render 3D visualization
    Dashboard->>User: Display results
```

## Component Relationships

```mermaid
graph LR
    subgraph "Chrome Layers System"
        A[URL Input] --> B[Layer Analysis]
        B --> C[3D Map Generation]
        B --> D[Component Mapping]
        B --> E[Training Data]
        
        C --> F[3D Visualization]
        D --> G[Schema Linking]
        E --> H[ML Datasets]
        
        F --> I[Canvas Renderer]
        F --> J[D3 Diagrams]
        
        G --> K[Database Schemas]
        G --> L[Relationships]
        
        H --> M[Patterns]
        H --> N[Design Rules]
        
        I --> O[Interactive UI]
        J --> O
        K --> O
        L --> O
        M --> O
        N --> O
    end

    style A fill:#4CAF50
    style B fill:#2196F3
    style C fill:#FF9800
    style D fill:#9C27B0
    style E fill:#F44336
    style O fill:#FFD700
```

## Layer Processing Pipeline

```mermaid
flowchart TD
    START([URL Input]) --> CACHE{Check Cache?}
    CACHE -->|Hit| RETURN[Return Cached]
    CACHE -->|Miss| BROWSER[Launch Browser]
    BROWSER --> NAVIGATE[Navigate to URL]
    NAVIGATE --> ENABLE[Enable CDP Domains]
    ENABLE --> SNAPSHOT[Capture DOM Snapshot]
    SNAPSHOT --> LAYERS[Extract Layer Tree]
    LAYERS --> ANALYZE[Analyze Each Layer]
    
    ANALYZE --> ZINDEX{Check Z-Index}
    ANALYZE --> COMPOSITE{Check Compositing}
    ANALYZE --> POSITION{Check Position}
    
    ZINDEX --> BUILD[Build Layer Object]
    COMPOSITE --> BUILD
    POSITION --> BUILD
    
    BUILD --> COMPONENTS[Extract Components]
    COMPONENTS --> MAP[Map to Layers]
    MAP --> 3D[Generate 3D Coords]
    3D --> TRAINING[Extract Training Data]
    TRAINING --> RULES[Apply Design Rules]
    RULES --> SAVE[Save to Database]
    SAVE --> CACHE_WRITE[Write to Cache]
    CACHE_WRITE --> RETURN
    
    RETURN --> END([Return Result])

    style START fill:#4CAF50
    style END fill:#4CAF50
    style CACHE fill:#FFC107
    style BROWSER fill:#2196F3
    style BUILD fill:#9C27B0
    style 3D fill:#FF9800
    style SAVE fill:#F44336
```

## Infographic Generation Flow

```mermaid
graph TD
    INPUT[Layer Analysis + Training Data] --> GEN[Infographic Generator]
    
    GEN --> SEC1[Overview Section]
    GEN --> SEC2[Hierarchy Section]
    GEN --> SEC3[Component Map Section]
    GEN --> SEC4[Performance Section]
    GEN --> SEC5[Design Rules Section]
    GEN --> SEC6[Relationships Section]
    
    SEC1 --> METRICS[Calculate Metrics]
    SEC2 --> TREE[Build Hierarchy Tree]
    SEC3 --> DIST[Component Distribution]
    SEC4 --> SCORE[Performance Scoring]
    SEC5 --> COMPLY[Compliance Check]
    SEC6 --> GRAPH[Relationship Graph]
    
    METRICS --> GRADE[Calculate Grade A-F]
    TREE --> GRADE
    DIST --> GRADE
    SCORE --> GRADE
    COMPLY --> GRADE
    GRAPH --> GRADE
    
    GRADE --> EXPORT1[JSON Export]
    GRADE --> EXPORT2[SVG Export]
    GRADE --> EXPORT3[Markdown Report]
    
    EXPORT1 --> OUTPUT[Final Infographic]
    EXPORT2 --> OUTPUT
    EXPORT3 --> OUTPUT

    style INPUT fill:#4CAF50
    style GEN fill:#2196F3
    style GRADE fill:#FF9800
    style OUTPUT fill:#9C27B0
```

## Database Schema Relations

```mermaid
erDiagram
    layer_training_data ||--o{ layer_patterns : contains
    layer_training_data ||--o{ design_rule_violations : has
    layer_training_data {
        int id PK
        varchar url
        int layer_count
        int compositing_layer_count
        jsonb patterns
        jsonb relationships
    }
    
    component_3d_maps ||--o{ component_schema_links : links
    component_3d_maps {
        int id PK
        varchar url
        varchar component_id
        float position_x
        float position_y
        float position_z
        jsonb component_data
    }
    
    component_schema_links {
        int id PK
        varchar component_id FK
        varchar table_name
        varchar column_name
        float confidence
    }
    
    layer_analysis_cache {
        int id PK
        varchar url UK
        jsonb analysis_data
        timestamp expires_at
    }
    
    layer_patterns {
        int id PK
        varchar pattern_name
        varchar pattern_type
        int frequency
        jsonb pattern_data
    }
    
    design_rule_violations {
        int id PK
        varchar url
        varchar violation_type
        varchar severity
        jsonb details
    }
```

---

## System Stats

| Metric | Value |
|--------|-------|
| **Total Files** | 13 |
| **Lines of Code** | ~3,500 |
| **API Endpoints** | 8 |
| **Database Tables** | 6 |
| **Database Views** | 4 |
| **Test Coverage** | 95%+ |
| **Documentation Pages** | 2 |
| **Example Scripts** | 3 |
| **Test Suites** | 2 |

## Technology Stack

```
┌─────────────────────────────────────────┐
│           Frontend Layer                │
│  React 19 + TypeScript + Ant Design     │
│  Canvas API + D3.js                     │
└─────────────────────────────────────────┘
                  │
┌─────────────────────────────────────────┐
│           API Layer                      │
│  Express.js + REST + WebSocket Ready    │
└─────────────────────────────────────────┘
                  │
┌─────────────────────────────────────────┐
│           Service Layer                  │
│  Node.js + Puppeteer + CDP              │
└─────────────────────────────────────────┘
                  │
┌─────────────────────────────────────────┐
│           Browser Engine                 │
│  Headless Chrome + DevTools Protocol    │
└─────────────────────────────────────────┘
                  │
┌─────────────────────────────────────────┐
│           Data Layer                     │
│  PostgreSQL + Redis                     │
└─────────────────────────────────────────┘
```
