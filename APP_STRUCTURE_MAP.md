# LightDom Application Structure Map

## 📁 Directory Structure Overview

```
LightDom/
├── src/
│   ├── ai/                          # AI Integration Layer
│   │   └── DeepSeekIntegration.ts   # DeepSeek AI service
│   ├── api/                         # REST API Endpoints
│   │   ├── deepseekApi.ts           # AI & calculation API
│   │   ├── DOMSpaceHarvesterAPI.ts  # DOM optimization API
│   │   ├── advancedNodeApi.ts       # Node management API
│   │   ├── blockchainModelStorageApi.ts
│   │   ├── metaverseMiningApi.ts
│   │   ├── optimizationApi.ts
│   │   └── routes.ts                # API route definitions
│   ├── apps/                        # Standalone Applications
│   │   ├── HeadlessApp.ts           # Headless Chrome app
│   │   ├── HeadlessCLI.ts           # Headless CLI tool
│   │   ├── HeadlessDemo.ts          # Demo application
│   │   └── BrowserbaseDemo.ts       # Browserbase integration
│   ├── automation/                  # Workflow Automation
│   │   ├── BlockchainAutomationManager.ts  # Main automation orchestrator
│   │   ├── BlockchainStartupOrchestrator.ts
│   │   ├── ProjectManagementFramework.ts
│   │   ├── BlockchainNodeManager.ts
│   │   └── WorkflowSchema.ts        # Schema-based workflows
│   ├── cli/                         # CLI Tools
│   │   └── commands/                # CLI command implementations
│   │       ├── dev.js
│   │       ├── build.js
│   │       ├── test.js
│   │       ├── automation.js
│   │       ├── blockchain.js
│   │       ├── deploy.js
│   │       ├── setup.js
│   │       ├── health.js
│   │       ├── doctor.js
│   │       ├── generate.js
│   │       └── init.js
│   ├── components/                  # React Components
│   │   ├── SpaceOptimizationDashboard.tsx
│   │   ├── MetaverseMiningDashboard.tsx
│   │   ├── AdvancedNodeDashboard.tsx
│   │   └── ... (various UI components)
│   ├── config/                      # Configuration
│   │   └── HeadlessConfig.ts
│   ├── core/                        # Core Business Logic
│   │   ├── SpaceOptimizationEngine.ts
│   │   ├── MetaverseMiningEngine.ts
│   │   ├── AdvancedNodeManager.ts
│   │   └── ClientManagementSystem.ts
│   ├── framework/                   # Framework Components
│   ├── mcp/                         # Model Context Protocol
│   │   ├── n8n-mcp-server.ts
│   │   └── n8n-mcp-cli.ts
│   ├── services/                    # Service Layer
│   │   ├── HeadlessCalculationEngine.ts  # Calculation service
│   │   ├── HeadlessChromeService.ts
│   │   └── WebCrawlerService.ts
│   ├── server/                      # Server Components
│   ├── utils/                       # Utility Functions
│   │   ├── BlockchainMetricsCollector.ts
│   │   ├── CrawlerSupervisor.ts
│   │   └── MetricsCollector.ts
│   └── types/                       # TypeScript Type Definitions
├── bin/                             # CLI Executables
│   ├── lightdom                     # Main CLI entry point
│   └── lightdom-dev                 # Development CLI
├── scripts/                         # Automation Scripts
│   ├── setup-dev-environment.sh     # Dev environment setup
│   ├── dev-automation.sh            # Development automation
│   ├── onboarding.sh                # New developer onboarding
│   ├── automated-deployment.js      # Deployment automation
│   ├── monitoring-setup.js          # Monitoring configuration
│   └── quality-gates.js             # Quality assurance
├── contracts/                       # Smart Contracts
│   ├── DOMSpaceToken.sol
│   ├── OptimizationRegistry.sol
│   └── ... (blockchain contracts)
├── test/                           # Test Suites
├── docs/                           # Documentation
├── .github/                        # GitHub Configuration
│   └── workflows/                  # CI/CD Workflows
│       ├── ci-cd.yml
│       └── test.yml
├── .husky/                         # Git Hooks
│   ├── pre-commit
│   └── pre-push
├── .vscode/                        # VSCode Configuration
│   ├── settings.json
│   ├── extensions.json
│   └── lightdom.code-workspace
└── config files...                 # Various configuration files
```

## 🎯 Component Relationships

### 1. AI & Calculation Layer

```
┌─────────────────────────────────────────────────────────┐
│                 DeepSeekIntegration                     │
│  - Portfolio analysis                                   │
│  - Real-time feedback                                   │
│  - Data stream monitoring                               │
└─────────────────────────┬───────────────────────────────┘
                          │
                          ├──→ Data Streams (market, blockchain, portfolio)
                          │
                          └──→ Analysis Results
                                     │
┌─────────────────────────────────────────────────────────┐
│           HeadlessCalculationEngine                     │
│  - Portfolio valuation                                  │
│  - Risk analysis                                        │
│  - Optimization                                         │
│  - Predictions                                          │
└─────────────────────────────────────────────────────────┘
```

### 2. Workflow Automation Layer

```
┌─────────────────────────────────────────────────────────┐
│              WorkflowSchema                             │
│  - Schema definitions                                   │
│  - Step configurations                                  │
│  - Rules and triggers                                   │
└─────────────────────────┬───────────────────────────────┘
                          │
                          ↓
┌─────────────────────────────────────────────────────────┐
│       BlockchainAutomationManager                       │
│  - Execute workflows                                    │
│  - Manage blockchain nodes                              │
│  - Coordinate services                                  │
└─────────────────────────┬───────────────────────────────┘
                          │
             ┌────────────┼────────────┐
             │            │            │
             ↓            ↓            ↓
    ┌─────────────┐ ┌─────────┐ ┌──────────┐
    │  WebCrawler │ │Headless │ │Blockchain│
    │   Service   │ │ Chrome  │ │  Nodes   │
    └─────────────┘ └─────────┘ └──────────┘
```

### 3. API Layer

```
┌─────────────────────────────────────────────────────────┐
│                    API Routes                           │
│  /api/ai/*          - AI and calculation endpoints      │
│  /api/optimization/* - DOM optimization endpoints       │
│  /api/blockchain/*   - Blockchain operations            │
│  /api/automation/*   - Workflow automation              │
└─────────────────────────┬───────────────────────────────┘
                          │
             ┌────────────┼────────────┐
             │            │            │
             ↓            ↓            ↓
    ┌──────────────┐ ┌────────┐ ┌──────────┐
    │  DeepSeek    │ │  Calc  │ │Blockchain│
    │    API       │ │ Engine │ │Automation│
    └──────────────┘ └────────┘ └──────────┘
```

## 🔄 Data Flow

### Real-Time Portfolio Management Flow

```
1. Data Collection
   ├── Market Data (CoinGecko, Binance, etc.)
   ├── Blockchain Metrics (on-chain data)
   └── Portfolio State (current holdings)
         │
         ↓
2. Data Streams Registration
   └── DeepSeekIntegration.registerDataStream()
         │
         ↓
3. Real-Time Monitoring
   └── DeepSeekIntegration.startStreamMonitoring()
         │
         ├──→ Fetch data from source
         ├──→ Send to DeepSeek AI
         └──→ Receive real-time feedback
               │
               ↓
4. AI Analysis
   ├── Sentiment analysis
   ├── Risk assessment
   └── Action recommendations
         │
         ↓
5. Calculation Engine
   └── HeadlessCalculationEngine.submitTask()
         │
         ├──→ Portfolio valuation
         ├──→ Risk metrics
         ├──→ Optimization
         └──→ Results
               │
               ↓
6. Decision Making
   ├── Apply workflow rules
   ├── Check conditions
   └── Trigger actions
         │
         ↓
7. Execution
   └── Blockchain transactions (if approved)
```

### Workflow Execution Flow

```
1. Workflow Definition
   └── WorkflowSchema (JSON/TypeScript)
         │
         ↓
2. Validation
   └── WorkflowSchemaValidator.validate()
         │
         ↓
3. Trigger Detection
   ├── Schedule (cron)
   ├── Manual
   ├── Webhook
   └── Event
         │
         ↓
4. Step Execution
   └── BlockchainAutomationManager.executeWorkflow()
         │
         ├──→ Step 1: Data Fetch
         ├──→ Step 2: AI Analysis
         ├──→ Step 3: Calculation
         └──→ Step N: Output
               │
               ↓
5. Rule Application
   ├── Validation rules
   ├── Decision rules
   └── Alert rules
         │
         ↓
6. Output Generation
   ├── File output
   ├── Database storage
   ├── API notification
   └── Blockchain submission
```

## 🔌 API Integration Points

### 1. DeepSeek AI API

**Base URL**: `/api/ai`

#### Endpoints:
- `GET /status` - Get AI service status
- `GET /streams` - List all data streams
- `POST /streams/register` - Register new stream
- `POST /streams/:id/start` - Start monitoring
- `POST /streams/:id/stop` - Stop monitoring
- `POST /analyze/portfolio` - Request portfolio analysis
- `POST /calculate` - Submit calculation task
- `POST /calculate/portfolio-value` - Calculate portfolio value
- `POST /calculate/risk` - Analyze risk
- `POST /calculate/optimize` - Optimize allocation
- `POST /predict` - Market predictions
- `GET /metrics` - Get AI metrics

### 2. Workflow Automation API

**Base URL**: `/api/automation`

#### Endpoints:
- `GET /workflows` - List workflows
- `POST /workflows` - Create workflow
- `GET /workflows/:id` - Get workflow details
- `PUT /workflows/:id` - Update workflow
- `DELETE /workflows/:id` - Delete workflow
- `POST /workflows/:id/execute` - Execute workflow
- `GET /workflows/:id/status` - Get execution status
- `POST /workflows/:id/validate` - Validate workflow schema

### 3. Blockchain Operations API

**Base URL**: `/api/blockchain`

#### Endpoints:
- `POST /nodes` - Create blockchain node
- `GET /nodes` - List nodes
- `POST /execute` - Execute blockchain transaction
- `GET /metrics` - Get blockchain metrics

## 🎨 UX Patterns in Codebase

### 1. Dashboard Patterns

Located in `src/components/*Dashboard.tsx`:
- Real-time data visualization
- Interactive charts
- Status indicators
- Action buttons
- Metric cards
- Progress tracking

### 2. Form Patterns

- Validation with immediate feedback
- Multi-step wizards
- Auto-save functionality
- Error handling with user-friendly messages

### 3. Navigation Patterns

- Sidebar navigation
- Breadcrumb trails
- Tab-based content organization
- Modal dialogs for actions

### 4. Feedback Patterns

- Toast notifications
- Loading states
- Success/error messages
- Confirmation dialogs
- Progress indicators

## 🔐 Providing DeepSeek Access to Codebase

### Option 1: API-Based Access (Recommended)

Create an API endpoint that provides code context:

```typescript
// src/api/codebaseApi.ts
router.get('/codebase/structure', (req, res) => {
  res.json({
    structure: /* directory tree */,
    components: /* list of components */,
    apis: /* API endpoints */,
    workflows: /* available workflows */
  });
});

router.get('/codebase/file/:path', (req, res) => {
  // Return file contents with syntax highlighting
  const content = fs.readFileSync(req.params.path, 'utf8');
  res.json({ content, language: detectLanguage(req.params.path) });
});
```

### Option 2: Documentation Generation

Generate comprehensive documentation that DeepSeek can analyze:

```bash
# Generate API documentation
npm run docs:api:generate

# Generate architecture diagrams
npm run docs:architecture:generate
```

### Option 3: Codebase Summary for AI

Create a special endpoint that provides AI-optimized code summaries:

```typescript
router.post('/ai/analyze-codebase', async (req, res) => {
  const { component, question } = req.body;
  
  // Get relevant code
  const code = getComponentCode(component);
  
  // Ask DeepSeek about it
  const analysis = await deepseek.analyzePortfolio({
    id: `code-analysis-${Date.now()}`,
    type: 'custom',
    dataStreams: [],
    context: {
      code,
      question,
      codebase: 'LightDom'
    },
    priority: 1,
    timestamp: new Date()
  });
  
  res.json({ analysis });
});
```

## 📊 Results Visualization

### Real-Time Dashboard

Access at: `http://localhost:3000/dashboard`

Features:
- Live data stream monitoring
- AI analysis results
- Calculation metrics
- Workflow execution status
- Blockchain transaction tracking

### API Response Format

All AI and calculation results follow this format:

```typescript
{
  success: true,
  data: {
    // Result data
  },
  metrics: {
    executionTime: number,
    confidence: number
  },
  timestamp: Date
}
```

## 🚀 Quick Start for DeepSeek Integration

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env and add DEEPSEEK_API_KEY

# 3. Initialize services
npm run setup

# 4. Start the platform
npm run dev

# 5. Access AI API
curl http://localhost:3000/api/ai/status

# 6. Register custom data stream
curl -X POST http://localhost:3000/api/ai/streams/register \
  -H "Content-Type: application/json" \
  -d '{"id":"my-stream","name":"My Data","type":"custom","source":"https://api.example.com"}'

# 7. Start monitoring
curl -X POST http://localhost:3000/api/ai/streams/my-stream/start
```

---

**This structure enables:**
✅ Schema-based workflow automation
✅ Headless Node.js calculations
✅ Real-time DeepSeek AI feedback
✅ API-based functional step chaining
✅ Comprehensive codebase access for AI
✅ Results visualization and monitoring
