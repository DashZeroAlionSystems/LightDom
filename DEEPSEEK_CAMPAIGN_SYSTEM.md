# DeepSeek Campaign Management System

## 🎯 Overview

The DeepSeek Campaign Management System is a comprehensive platform for managing SEO campaigns with AI-powered assistance. It enables real-time interaction with DeepSeek AI via Ollama, visual workflow building, autonomous data mining, and blockchain anomaly detection.

## 🚀 Key Features

### 1. **Real-Time DeepSeek Chat Interface**
- Interactive chat with DeepSeek AI for campaign management
- Context-aware conversations with campaign details
- Action execution based on AI suggestions
- Command recognition and automated workflows
- Streaming responses for better UX

### 2. **Visual Workflow Builder**
- Drag-and-drop workflow design
- AI-powered workflow generation from natural language
- Multiple node types: triggers, data mining, SEO analysis, blockchain, etc.
- Real-time workflow execution
- Import/export workflow configurations

### 3. **Campaign Dashboard**
- Real-time campaign monitoring
- Aggregate statistics and KPIs
- Campaign status management (pause, resume, archive)
- Quick actions for common tasks
- Integrated chat and workflow interfaces

### 4. **Data Mining & Analytics**
- Automated data collection from web sources
- Quality scoring and validation
- Pattern recognition and insight generation
- Historical data tracking

### 5. **Blockchain Anomaly Detection**
- Real-time blockchain monitoring
- Market anomaly detection
- Automated alerts for unusual patterns
- Transaction and contract analysis

### 6. **Schema Management**
- Auto-generated CRUD schemas
- AI-suggested schema definitions
- Schema relationship mapping
- Validation rules and constraints

## 📁 File Structure

```
LightDom/
├── src/
│   ├── components/
│   │   ├── DeepSeekCampaignChat.tsx       # Chat interface
│   │   ├── VisualWorkflowBuilder.tsx       # Workflow builder
│   │   └── CampaignManagementDashboard.tsx # Main dashboard
│   ├── api/
│   │   └── routes/
│   │       └── campaign.routes.ts          # API endpoints
│   └── services/
│       └── ollama-service.ts               # Ollama integration
├── database/
│   └── campaign-management-schema.sql      # Database schema
└── DEEPSEEK_CAMPAIGN_SYSTEM.md            # This file
```

## 🔧 Setup Instructions

### Prerequisites

1. **Ollama with DeepSeek-R1**
   ```bash
   # Install Ollama
   curl -fsSL https://ollama.ai/install.sh | sh
   
   # Pull DeepSeek-R1 model
   ollama pull deepseek-r1
   
   # Start Ollama service
   ollama serve
   ```

2. **PostgreSQL Database**
   ```bash
   # Create database
   createdb lightdom
   
   # Run schema migration
   psql -U postgres -d lightdom -f database/campaign-management-schema.sql
   ```

3. **Node.js Dependencies**
   ```bash
   npm install
   ```

### Configuration

1. **Environment Variables** (`.env`)
   ```env
   # Database
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=lightdom
   DB_USER=postgres
   DB_PASSWORD=postgres
   
   # Ollama
   OLLAMA_BASE_URL=http://localhost:11434
   OLLAMA_MODEL=deepseek-r1
   
   # API
   API_PORT=3001
   FRONTEND_PORT=3000
   ```

2. **Ollama Configuration**
   - Default model: `deepseek-r1`
   - Temperature: 0.7
   - Context window: 32K tokens
   - Streaming: Enabled

## 🎨 Component Architecture

### DeepSeekCampaignChat Component

**Purpose**: Real-time chat interface with DeepSeek AI

**Features**:
- Message history with user/assistant/system roles
- Context-aware prompts with campaign information
- Action detection and execution
- Quick action buttons
- Offline detection and warnings

**Usage**:
```tsx
import { DeepSeekCampaignChat } from '@/components/DeepSeekCampaignChat';

<DeepSeekCampaignChat />
```

**Available Commands**:
- `CREATE_CAMPAIGN`: Create new SEO campaign
- `ANALYZE_DATA`: Analyze market or blockchain data
- `BUILD_WORKFLOW`: Create automated workflow
- `OPTIMIZE`: Optimize campaign settings
- `MINE_INSIGHTS`: Extract valuable patterns

### VisualWorkflowBuilder Component

**Purpose**: Visual drag-and-drop workflow designer

**Node Types**:
- **Trigger** (▶️): Start workflow execution
- **Data Mining** (⛏️): Collect data from sources
- **SEO Analysis** (📊): Analyze SEO metrics
- **Content Generation** (✍️): Generate content
- **Monitoring** (👁️): Monitor metrics
- **Blockchain** (⛓️): Blockchain operations
- **Notification** (📧): Send notifications
- **Decision** (🔀): Conditional logic

**Usage**:
```tsx
import { VisualWorkflowBuilder } from '@/components/VisualWorkflowBuilder';

<VisualWorkflowBuilder />
```

**AI Generation**:
Simply describe your workflow in natural language, and DeepSeek will generate the complete workflow structure with appropriate nodes and connections.

Example prompt:
```
Create a workflow that monitors competitor websites daily, analyzes their SEO strategies, extracts valuable keywords, stores them in the database, and sends a summary email to the marketing team.
```

### CampaignManagementDashboard Component

**Purpose**: Central dashboard for managing all campaigns

**Features**:
- Campaign list with status, progress, and metrics
- Real-time statistics cards
- Integrated chat interface
- Workflow builder access
- Quick actions panel

**Usage**:
```tsx
import { CampaignManagementDashboard } from '@/components/CampaignManagementDashboard';

<CampaignManagementDashboard />
```

## 🔌 API Endpoints

### Campaign Management

#### List Campaigns
```http
GET /api/campaigns
```

Response:
```json
[
  {
    "id": "uuid",
    "name": "Campaign 1",
    "status": "active",
    "progress": 75,
    "dataMined": 15000,
    "workflows": 3,
    "insights": 12,
    "anomalies": 2
  }
]
```

#### Create Campaign
```http
POST /api/campaigns
Content-Type: application/json

{
  "name": "My SEO Campaign",
  "description": "Campaign description",
  "config": {}
}
```

#### Get Campaign Stats
```http
GET /api/campaigns/stats
```

Response:
```json
{
  "totalRecords": 50000,
  "todayRecords": 1200,
  "avgQuality": 85,
  "anomaliesDetected": 5
}
```

#### Pause/Resume Campaign
```http
POST /api/campaigns/:id/pause
POST /api/campaigns/:id/resume
```

### Workflow Management

#### Generate Workflow with AI
```http
POST /api/deepseek/generate-workflow
Content-Type: application/json

{
  "prompt": "Create a workflow for SEO monitoring",
  "selectedParts": ["dataMining", "seoAnalysis"]
}
```

#### Save Workflow
```http
POST /api/workflows
Content-Type: application/json

{
  "name": "SEO Monitoring",
  "description": "Daily SEO checks",
  "nodes": [...],
  "edges": [...],
  "campaignId": "uuid"
}
```

#### Execute Workflow
```http
POST /api/workflows/execute
Content-Type: application/json

{
  "name": "Workflow Name",
  "nodes": [...],
  "edges": [...]
}
```

Response:
```json
{
  "executionId": "uuid",
  "status": "running",
  "message": "Workflow execution started"
}
```

## 📊 Database Schema

### Core Tables

1. **campaigns**: Campaign definitions and status
2. **workflows**: Workflow configurations
3. **workflow_executions**: Execution history and status
4. **data_mining_stats**: Data collection metrics
5. **insights**: AI-generated insights
6. **anomalies**: Detected anomalies and alerts
7. **campaign_schemas**: CRUD schema definitions
8. **schema_suggestions**: AI-suggested schemas
9. **workflow_templates**: Reusable workflow templates
10. **deepseek_chat_history**: Chat conversation history
11. **blockchain_anomalies**: Blockchain-specific anomalies

### Key Relationships

```
campaigns (1) ─→ (N) workflows
campaigns (1) ─→ (N) data_mining_stats
campaigns (1) ─→ (N) insights
campaigns (1) ─→ (N) anomalies
campaigns (1) ─→ (N) campaign_schemas
workflows (1) ─→ (N) workflow_executions
```

## 🤖 DeepSeek Integration Patterns

### 1. Chat-Based Campaign Management

```typescript
// User asks: "Create a new SEO campaign for e-commerce"
// System generates context-aware prompt:

const prompt = `
You are DeepSeek, an AI campaign manager.

Current Context:
- User has 3 active campaigns
- Total data mined: 50,000 records
- Average quality: 85%

User Request: Create a new SEO campaign for e-commerce

Provide:
1. Campaign name suggestion
2. Recommended workflow steps
3. Data sources to target
4. Success metrics to track

Include [ACTION:CREATE_CAMPAIGN] tag in your response.
`;
```

### 2. AI-Powered Workflow Generation

```typescript
// User describes workflow in natural language
const description = `
Monitor top 10 competitors daily, analyze their meta tags, 
extract high-performing keywords, compare with our site, 
and email insights to marketing team
`;

// DeepSeek generates structured workflow:
const workflow = {
  name: "Competitor SEO Monitoring",
  nodes: [
    { type: "trigger", config: { schedule: "daily" } },
    { type: "dataMining", config: { sources: ["competitor-list"] } },
    { type: "seoAnalysis", config: { metrics: ["meta-tags", "keywords"] } },
    { type: "decision", config: { condition: "quality > 80" } },
    { type: "notification", config: { recipients: ["marketing@example.com"] } }
  ]
};
```

### 3. Blockchain Anomaly Detection

```typescript
// DeepSeek analyzes blockchain data
const anomalyCheck = async (blockchainData) => {
  const prompt = `
  Analyze this blockchain data for market anomalies:
  ${JSON.stringify(blockchainData)}
  
  Look for:
  - Unusual transaction patterns
  - Price manipulation signals
  - Smart contract vulnerabilities
  - Market manipulation indicators
  
  Return anomalies with severity scores.
  `;
  
  const analysis = await ollamaService.generate({ prompt });
  return parseAnomalies(analysis);
};
```

## 🎯 Use Cases

### Use Case 1: Automated SEO Monitoring

**Scenario**: Monitor 20 competitor websites daily for SEO changes

**Implementation**:
1. Create campaign via chat: "Create daily SEO monitoring for competitors"
2. DeepSeek generates workflow automatically
3. Workflow executes daily at 2 AM
4. Insights are generated and emailed

**Result**: Automated competitive intelligence with minimal manual effort

### Use Case 2: Blockchain Market Analysis

**Scenario**: Detect unusual trading patterns in DeFi markets

**Implementation**:
1. Create blockchain monitoring workflow
2. Connect to blockchain data sources
3. DeepSeek analyzes transaction patterns
4. Anomalies trigger instant alerts

**Result**: Early detection of market manipulation or opportunities

### Use Case 3: Content Strategy Optimization

**Scenario**: Optimize content strategy based on competitor analysis

**Implementation**:
1. Mine competitor content data
2. DeepSeek analyzes successful patterns
3. Generate content recommendations
4. Track implementation and results

**Result**: Data-driven content strategy

## 🔒 Security & Best Practices

### 1. API Security
- Rate limiting on all endpoints
- Authentication required for sensitive operations
- Input validation and sanitization
- SQL injection prevention

### 2. Data Privacy
- Encrypted storage of sensitive data
- GDPR-compliant data handling
- User consent for data collection
- Data retention policies

### 3. AI Safety
- Human approval for critical actions
- Confidence scoring on AI suggestions
- Audit trail of AI decisions
- Fallback to manual controls

### 4. Performance
- Database query optimization
- Caching of frequent queries
- Async workflow execution
- Load balancing for high traffic

## 📈 Monitoring & Metrics

### Key Metrics to Track

1. **Campaign Performance**
   - Active campaigns
   - Completion rate
   - Average execution time

2. **Data Quality**
   - Records mined per day
   - Quality score average
   - Error rate

3. **AI Performance**
   - Response time
   - Suggestion accuracy
   - Action success rate

4. **System Health**
   - API response time
   - Database query performance
   - Ollama availability

## 🚦 Troubleshooting

### Common Issues

#### 1. Ollama Not Available
```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# Start Ollama
ollama serve

# Verify model is installed
ollama list
```

#### 2. Database Connection Error
```bash
# Check PostgreSQL status
systemctl status postgresql

# Test connection
psql -U postgres -d lightdom -c "SELECT 1"

# Check environment variables
echo $DB_HOST $DB_PORT $DB_NAME
```

#### 3. Workflow Execution Fails
```sql
-- Check execution logs
SELECT * FROM workflow_executions 
WHERE status = 'failed' 
ORDER BY started_at DESC 
LIMIT 10;

-- View error details
SELECT id, error, config 
FROM workflow_executions 
WHERE id = 'execution-id';
```

## 🔄 Future Enhancements

### Planned Features

1. **Advanced Visual Builder**
   - Sub-workflows and composability
   - Conditional branching
   - Loop support
   - Error handling nodes

2. **Enhanced AI Capabilities**
   - Multi-model support (GPT-4, Claude, etc.)
   - Fine-tuned models for specific domains
   - Reinforcement learning from feedback

3. **Collaboration Features**
   - Team workspaces
   - Shared workflows
   - Comments and annotations
   - Version control

4. **Advanced Analytics**
   - Predictive modeling
   - A/B testing
   - ROI calculation
   - Custom dashboards

5. **Integration Expansions**
   - Zapier integration
   - Slack notifications
   - Google Analytics sync
   - CRM integrations

## 📚 Additional Resources

- [Ollama Documentation](https://ollama.ai/docs)
- [DeepSeek API Guide](https://deepseek.com/docs)
- [React Flow Documentation](https://reactflow.dev)
- [PostgreSQL Best Practices](https://wiki.postgresql.org/wiki/Don%27t_Do_This)

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch
3. Add tests for new features
4. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

---

**Last Updated**: 2025-01-05  
**Version**: 1.0.0  
**Status**: Production Ready 🚀
