# LightDom Architecture Documentation

## System Overview

LightDom is a comprehensive blockchain-based DOM optimization platform with AI/ML capabilities, metaverse integration, and automated SEO workflows.

## High-Level Architecture

```mermaid
graph TB
    subgraph "Frontend Layer"
        UI[React UI Components]
        Pages[Pages & Routes]
        Design[Design System]
    end
    
    subgraph "API Layer"
        Express[Express API Server]
        WS[WebSocket Services]
        Routes[API Routes]
    end
    
    subgraph "Service Layer"
        Services[Core Services]
        AI[AI/ML Services]
        BC[Blockchain Services]
        Crawler[Web Crawler Services]
    end
    
    subgraph "Data Layer"
        PG[(PostgreSQL)]
        Redis[(Redis Cache)]
        BC_Chain[Blockchain Network]
    end
    
    subgraph "External Integrations"
        TF[TensorFlow]
        Puppeteer[Puppeteer/Headless]
        N8N[N8N Workflows]
        Ollama[Ollama AI]
        Stripe[Stripe Payments]
    end
    
    UI --> Express
    Pages --> UI
    Design --> UI
    Express --> Routes
    Routes --> Services
    WS --> Services
    Services --> AI
    Services --> BC
    Services --> Crawler
    AI --> TF
    Crawler --> Puppeteer
    Services --> PG
    Services --> Redis
    BC --> BC_Chain
    Services --> N8N
    Services --> Ollama
    Services --> Stripe
```

## Directory Structure Analysis

### `/src` Directory Organization

```mermaid
graph LR
    src[src/]
    src --> api[api/ - API Routes]
    src --> services[services/ - Business Logic]
    src --> components[components/ - UI Components]
    src --> pages[pages/ - Page Components]
    src --> hooks[hooks/ - React Hooks]
    src --> contexts[contexts/ - React Context]
    src --> utils[utils/ - Utilities]
    src --> types[types/ - Type Definitions]
    src --> apps[apps/ - Standalone Apps]
    src --> architecture[architecture/ - Patterns]
    src --> automation[automation/ - Automation]
    src --> crawler[crawler/ - Web Crawling]
    src --> ml[ml/ - Machine Learning]
    src --> seo[seo/ - SEO Services]
    src --> workflow[workflow/ - Workflows]
```

## Core Modules

### 1. API Layer (`src/api/`)
**Purpose**: RESTful API endpoints and route handlers

**Key Files**:
- `routes.ts` - Main route configuration
- `blockchainApi.ts` - Blockchain operations
- `billingApi.ts` - Payment and subscription management
- `seo-*.ts` - SEO optimization APIs
- `workflow-admin.ts` - Workflow management

### 2. Services Layer (`src/services/`)
**Purpose**: Business logic and data access

**Structure**:
```mermaid
graph TB
    Services[Services Layer]
    Services --> Core[Core Services]
    Services --> API[API Services]
    Services --> AI_ML[AI/ML Services]
    Services --> Workflow[Workflow Services]
    
    Core --> SEO[SEOGenerationService]
    Core --> Bridge[UnifiedSpaceBridgeService]
    Core --> DB[DatabaseIntegration]
    
    API --> Browser[BrowserbaseService]
    API --> Payment[PaymentService]
    API --> Auth[AuthN Services]
    
    AI_ML --> TF[TensorFlowService]
    AI_ML --> Content[AIContentGeneration]
    
    Workflow --> Repo[WorkflowRepository]
    Workflow --> Svc[WorkflowService]
```

### 3. Component Layer (`src/components/`)
**Purpose**: Reusable UI components

**Categories**:
- Admin components
- Client zone components
- Design system components
- Workflow components
- Dashboard components

### 4. Pages Layer (`src/pages/`)
**Purpose**: Top-level page components and routing

**Structure**:
- `/auth` - Authentication pages (LoginPage.tsx)
- `/admin` - Admin dashboard pages
- `/client` - Client area pages
- `LandingPage.tsx` - Public landing page
- `DashboardShell.tsx` - Main dashboard container

## Data Flow Architecture

```mermaid
sequenceDiagram
    participant User
    participant UI
    participant API
    participant Service
    participant DB
    participant External
    
    User->>UI: Interact
    UI->>API: HTTP/WebSocket Request
    API->>Service: Call Business Logic
    Service->>DB: Query/Update Data
    Service->>External: External API Calls
    External-->>Service: Response
    DB-->>Service: Data
    Service-->>API: Result
    API-->>UI: Response
    UI-->>User: Update View
```

## Authentication & Authorization Flow

```mermaid
graph TB
    User[User] --> Login[Login Page]
    Login --> Auth[Authentication Service]
    Auth --> JWT[JWT Token Generation]
    Auth --> Session[Session Management]
    JWT --> API[Protected API Routes]
    Session --> Redis[(Redis Session Store)]
    API --> Guard[Auth Guards]
    Guard --> Access{Authorized?}
    Access -->|Yes| Resource[Access Resource]
    Access -->|No| Deny[403 Forbidden]
```

## SEO Workflow Architecture

```mermaid
graph TB
    Client[Client Request] --> Crawler[Web Crawler]
    Crawler --> Analysis[DOM Analysis]
    Analysis --> Optimization[Optimization Engine]
    Optimization --> ML[ML Model Training]
    ML --> Dataset[Training Dataset]
    Dataset --> Model[TensorFlow Model]
    Model --> Prediction[SEO Predictions]
    Prediction --> Recommendations[Recommendations]
    Recommendations --> Client
    Recommendations --> Storage[(PostgreSQL)]
```

## AI/ML Pipeline

```mermaid
graph LR
    subgraph "Data Collection"
        Crawl[Web Crawling]
        Extract[Data Extraction]
    end
    
    subgraph "Processing"
        Clean[Data Cleaning]
        Transform[Transformation]
        Feature[Feature Engineering]
    end
    
    subgraph "Training"
        TF[TensorFlow Training]
        Validate[Validation]
        Optimize[Hyperparameter Tuning]
    end
    
    subgraph "Deployment"
        Model[Model Deployment]
        Serve[Model Serving]
        Monitor[Performance Monitoring]
    end
    
    Crawl --> Extract
    Extract --> Clean
    Clean --> Transform
    Transform --> Feature
    Feature --> TF
    TF --> Validate
    Validate --> Optimize
    Optimize --> Model
    Model --> Serve
    Serve --> Monitor
    Monitor --> Crawl
```

## Blockchain Integration

```mermaid
graph TB
    App[Application] --> BC_Service[Blockchain Service]
    BC_Service --> Contracts[Smart Contracts]
    BC_Service --> Wallet[Wallet Service]
    Contracts --> DOM[DOMSpaceToken]
    Contracts --> POO[ProofOfOptimization]
    Contracts --> Market[MetaverseMarketplace]
    Wallet --> Balance[Balance Management]
    Wallet --> Tx[Transaction History]
    DOM --> Mining[Space Mining]
    POO --> Rewards[Optimization Rewards]
```

## Crawler Architecture

```mermaid
graph TB
    Queue[Crawler Queue] --> Worker[Crawler Worker]
    Worker --> Headless[Headless Browser]
    Headless --> Puppeteer[Puppeteer Instance]
    Puppeteer --> DOM[DOM Extraction]
    DOM --> Parser[HTML Parser]
    Parser --> Storage[Data Storage]
    Storage --> PG[(PostgreSQL)]
    Storage --> Analysis[Analysis Pipeline]
    Analysis --> ML[ML Processing]
```

## Workflow Engine

```mermaid
graph TB
    Trigger[Workflow Trigger] --> Instance[Workflow Instance]
    Instance --> Tasks[Task Queue]
    Tasks --> Task1[Data Collection]
    Tasks --> Task2[Model Training]
    Tasks --> Task3[Deployment]
    Task1 --> N8N[N8N Integration]
    Task2 --> TF[TensorFlow Training]
    Task3 --> API[API Deployment]
    N8N --> Monitoring[Monitoring]
    TF --> Monitoring
    API --> Monitoring
    Monitoring --> Complete[Workflow Complete]
```

## Service Dependencies

```mermaid
graph TB
    App[Application]
    
    App --> Auth[AuthService]
    App --> Payment[PaymentService]
    App --> SEO[SEOService]
    App --> Workflow[WorkflowService]
    
    SEO --> Crawler[CrawlerService]
    SEO --> ML[MLService]
    SEO --> Opt[OptimizationEngine]
    
    Workflow --> Repo[WorkflowRepository]
    Workflow --> N8N[N8NService]
    Workflow --> Queue[QueueProcessor]
    
    ML --> TF[TensorFlowService]
    ML --> Training[TrainingPipeline]
    
    Payment --> Stripe[StripeService]
    Payment --> Billing[BillingService]
    
    Crawler --> Headless[HeadlessService]
    Crawler --> Puppeteer[PuppeteerService]
```

## Next Steps

1. **File Audit**: Complete file-by-file review (see FILE_AUDIT.md)
2. **Modularization**: Identify and extract duplicate code
3. **Standards Compliance**: Align with enterprise TypeScript/React standards
4. **Integration**: Complete AI/ML pipeline integration
5. **Testing**: Setup React component testing with Puppeteer
6. **Documentation**: Create per-file documentation

## Related Documentation

- [File Audit Report](./FILE_AUDIT.md) - Detailed file-by-file analysis
- [Design System](./DESIGN_SYSTEM.md) - UI/UX standards
- [Refactoring Summary](./REFACTORING_SUMMARY.md) - Recent improvements
- [API Documentation](./docs/API_DOCUMENTATION.md) - API endpoints
- [Development Workflow](./DEVELOPMENT_WORKFLOW.md) - Dev processes
