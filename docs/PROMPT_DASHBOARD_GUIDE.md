# Prompt Dashboard - Complete Integration Guide

## Quick Start

### 1. Installation

The Prompt Dashboard is already integrated into the LightDom platform. No additional installation needed.

### 2. Access the Dashboard

Navigate to: `http://localhost:3000/dashboard/prompt-dashboard`

Or from the main dashboard, click on "Prompt Dashboard" in the sidebar.

## Features Walkthrough

### Real-Time Conversation Flow

1. **Enter a Prompt**
   ```
   Example: "Create a workflow to analyze competitor SEO strategies"
   ```

2. **Watch Real-Time Feedback**
   - Step 1: "Analyzing prompt" - DeepSeek processes your request
   - Step 2: "DeepSeek is thinking..." - Streaming response with reasoning
   - Step 3: "Schema generated" - Automatic schema creation
   - Step 4: "Component generated" - React component suggestion

3. **Review Generated Artifacts**
   - Switch to "Artifacts" tab
   - View generated schemas and components
   - Download or copy for use

### Example Workflow

#### Scenario: SEO Data Mining Workflow

**Your Prompt:**
```
I need a complete workflow that:
1. Crawls competitor websites
2. Extracts their meta tags, headings, and content
3. Analyzes keyword usage and SEO scores
4. Stores results in PostgreSQL
5. Generates comparison reports
```

**Expected Output:**

**Feedback Steps:**
1. ✓ Analyzing prompt (0.2s)
2. ✓ DeepSeek response with detailed breakdown
3. ✓ Schema generated: SEODataMiningWorkflow
4. ✓ Component suggested: SEOAnalyzerDashboard

**Generated Schema:**
```json
{
  "id": "workflow-seo-mining-001",
  "name": "SEO Data Mining Workflow",
  "tasks": [
    {
      "id": "task-1",
      "name": "Web Crawler",
      "type": "crawl",
      "config": {
        "maxConcurrent": 5,
        "respectRobots": true,
        "rateLimit": "1000ms"
      }
    },
    {
      "id": "task-2",
      "name": "Data Extraction",
      "type": "extract",
      "dependencies": ["task-1"],
      "config": {
        "extractors": ["meta", "headings", "content", "links"]
      }
    },
    {
      "id": "task-3",
      "name": "SEO Analysis",
      "type": "analyze",
      "dependencies": ["task-2"],
      "config": {
        "metrics": ["keywordDensity", "readability", "seoScore"]
      }
    },
    {
      "id": "task-4",
      "name": "Data Storage",
      "type": "store",
      "dependencies": ["task-3"],
      "config": {
        "database": "postgresql",
        "table": "seo_analysis_results"
      }
    },
    {
      "id": "task-5",
      "name": "Report Generation",
      "type": "report",
      "dependencies": ["task-4"],
      "config": {
        "format": "pdf",
        "includeCharts": true
      }
    }
  ]
}
```

## Component Architecture

### FeedbackCard Component

**Purpose:** Display individual step feedback with collapsible design

**Key Features:**
- 5 status states (pending, processing, success, error, warning)
- Smooth expand/collapse animations
- Schema visualization
- Metadata display
- Review actions

**Usage Example:**
```tsx
<FeedbackCard
  id="step-1"
  step={1}
  title="Analyzing prompt"
  content="DeepSeek is processing your request..."
  status="processing"
  timestamp={new Date()}
  metadata={{ duration: 245, tokens: 150 }}
  onReview={(id, approved) => console.log(`Step ${id} ${approved ? 'approved' : 'rejected'}`)}
/>
```

### PromptDashboard Component

**Purpose:** Main dashboard orchestrating conversation and feedback

**Key Features:**
- Prompt input with model selection
- Real-time streaming from DeepSeek
- Tab-based interface (Feedback, Conversation, Artifacts)
- Export functionality
- Statistics tracking

**State Management:**
```typescript
// Conversation state
const [conversation, setConversation] = useState<ConversationMessage[]>([]);

// Feedback state
const [feedbackSteps, setFeedbackSteps] = useState<FeedbackStep[]>([]);

// Artifacts state
const [artifacts, setArtifacts] = useState<GeneratedArtifact[]>([]);
```

## API Integration

### Streaming Endpoint

**Endpoint:** `POST /api/deepseek/chat/stream`

**How it works:**
1. Client sends prompt + conversation history
2. Server establishes SSE connection
3. DeepSeek streams response in real-time
4. Server detects schemas/components in response
5. Automatically generates and sends artifacts
6. Client updates UI in real-time

**SSE Event Types:**
- `status` - Status updates
- `content` - Streaming text content
- `thinking` - DeepSeek's reasoning process
- `schema` - Generated schema
- `component` - Generated component
- `warning` - Warnings or notices
- `error` - Error messages
- `complete` - Stream complete

### Example Integration

```javascript
const response = await fetch('/api/deepseek/chat/stream', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    prompt: 'Create a workflow for SEO analysis',
    model: 'deepseek-r1',
    conversation: []
  })
});

const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;

  const chunk = decoder.decode(value);
  const lines = chunk.split('\n');

  for (const line of lines) {
    if (line.startsWith('data: ')) {
      const data = JSON.parse(line.slice(6));
      
      switch (data.type) {
        case 'content':
          // Update streaming content
          break;
        case 'schema':
          // Add generated schema
          break;
        case 'component':
          // Add generated component
          break;
      }
    }
  }
}
```

## Best Practices

### Writing Effective Prompts

✅ **Good:**
```
Create a workflow that crawls e-commerce websites, extracts product data 
(name, price, description, reviews), analyzes pricing trends, and stores 
results in PostgreSQL with daily updates.
```

❌ **Bad:**
```
make workflow for products
```

### Using Feedback Cards

- Keep cards collapsed by default except the latest one
- Review schemas before approving
- Use metadata to track performance metrics
- Export sessions for documentation

### Managing Artifacts

- Download schemas for version control
- Use generated components as templates
- Document customizations made to generated code
- Share artifacts with team members

## Troubleshooting

### Common Issues

**Issue: No response from DeepSeek**
- Check Ollama is running: `ollama list`
- Verify model is installed: `ollama pull deepseek-r1`
- Check API endpoint in .env: `OLLAMA_ENDPOINT=http://localhost:11434`

**Issue: Schemas not generating**
- Check PostgreSQL connection
- Verify PromptToSchemaGenerator service is running
- Check API server logs for errors

**Issue: Feedback cards not updating**
- Check browser console for errors
- Verify SSE connection is established
- Check network tab for streaming data

### Debug Mode

Enable debug logging:
```javascript
// In PromptDashboard.tsx
const DEBUG = true;

if (DEBUG) {
  console.log('Feedback step:', step);
  console.log('Artifact generated:', artifact);
}
```

## Advanced Usage

### Custom Prompt Templates

Create reusable prompt templates:

```typescript
const templates = {
  seoWorkflow: `Create a workflow for SEO analysis that includes:
    - Web crawling with rate limiting
    - Meta tag and content extraction
    - Keyword analysis
    - SEO score calculation
    - PostgreSQL storage
    - PDF report generation`,
    
  dataMining: `Create a data mining workflow that includes:
    - Data source configuration
    - ETL pipeline setup
    - Data transformation rules
    - Storage strategy
    - Analytics dashboard`
};
```

### Integration with Workflow Engine

Execute generated workflows:

```typescript
// After schema generation
const workflow = generatedSchema;

// Execute via workflow orchestrator
await fetch('/api/workflows', {
  method: 'POST',
  body: JSON.stringify(workflow)
});

// Monitor execution
await fetch(`/api/workflows/${workflow.id}/execute`, {
  method: 'POST'
});
```

## Performance Tips

1. **Use caching** - Cache similar prompts to reduce API calls
2. **Limit conversation history** - Only send last 10 messages
3. **Optimize metadata** - Only include essential metadata
4. **Lazy load artifacts** - Load artifact details on demand
5. **Debounce input** - Wait for user to finish typing

## Future Enhancements

Planned features:
- [ ] Multi-user collaboration
- [ ] Prompt templates library
- [ ] Advanced filtering and search
- [ ] Artifact versioning
- [ ] Integration with CI/CD
- [ ] Custom model fine-tuning
- [ ] Workflow execution monitoring

## Support

For issues or questions:
- Check the documentation: `/docs/PROMPT_DASHBOARD.md`
- View examples: `/src/components/__tests__/FeedbackCardDemo.tsx`
- Run tests: `npm test PromptDashboard.test.ts`
- Submit issues on GitHub

## License

Part of the LightDom platform. See main repository license.
