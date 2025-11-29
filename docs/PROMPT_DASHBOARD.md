# Prompt Dashboard Documentation

## Overview

The Prompt Dashboard is a comprehensive AI-powered interface for creating workflows, schemas, and components using natural language prompts with DeepSeek integration.

## Features

### 1. Real-Time Conversation with DeepSeek
- Streaming responses with live updates
- Support for multiple AI models (DeepSeek R1, DeepSeek Chat, GPT-4)
- Conversation history tracking
- Automatic schema and component generation

### 2. Step-by-Step Feedback Cards
- Collapsible design for easy navigation
- Status indicators (pending, processing, success, error, warning)
- Visual step numbering
- Timestamp tracking
- Schema and metadata display
- Review/approval workflow support

### 3. Artifact Management
- Automatic collection of generated schemas
- Component generation tracking
- Workflow artifacts
- Export functionality

## Usage

### Accessing the Dashboard

Navigate to `/dashboard/prompt-dashboard` in your application.

### Sending a Prompt

1. Enter your workflow description in the prompt input box
2. Select your preferred AI model (default: deepseek-r1)
3. Click "Send" or press Cmd/Ctrl+Enter
4. Watch real-time feedback in the Step-by-Step Feedback tab

### Example Prompts

```
Create a data mining workflow for competitor analysis

Build an SEO optimization pipeline with content generation

Set up automated social media monitoring and reporting

Generate a schema for product catalog with reviews
```

### Tabs

#### Feedback Tab
Shows step-by-step progress cards with:
- Analysis status
- DeepSeek thinking process
- Generated schemas
- Component suggestions
- Processing metrics

#### Conversation Tab
Full conversation history with:
- User messages
- AI responses
- Timestamps
- Message context

#### Artifacts Tab
All generated artifacts including:
- Schemas (JSON Schema format)
- Components (React components)
- Workflows (Task definitions)
- Download/view capabilities

## API Endpoints

### POST /api/deepseek/chat/stream
Stream real-time conversation with DeepSeek.

**Request:**
```json
{
  "prompt": "Create a workflow for SEO analysis",
  "model": "deepseek-r1",
  "conversation": [
    { "role": "user", "content": "previous message" },
    { "role": "assistant", "content": "previous response" }
  ]
}
```

**Response:** Server-Sent Events (SSE)
```
data: {"type":"content","content":"Analyzing your request..."}
data: {"type":"schema","schema":{...}}
data: {"type":"component","component":{...}}
data: [DONE]
```

### POST /api/deepseek/chat
Non-streaming chat endpoint.

**Request:**
```json
{
  "prompt": "Create a workflow for SEO analysis",
  "model": "deepseek-r1"
}
```

**Response:**
```json
{
  "success": true,
  "response": "...",
  "model": "deepseek-r1",
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

### GET /api/deepseek/models
List available AI models.

**Response:**
```json
{
  "success": true,
  "models": [
    {
      "name": "deepseek-r1",
      "description": "DeepSeek R1 - Reasoning model"
    }
  ]
}
```

## Components

### PromptDashboard
Main dashboard component.

**Location:** `src/components/PromptDashboard.tsx`

**Features:**
- Prompt input with model selection
- Tab-based interface
- Real-time streaming
- Export functionality

### FeedbackCard
Individual feedback step card component.

**Location:** `src/components/ui/FeedbackCard.tsx`

**Props:**
```typescript
interface FeedbackCardProps {
  id: string;
  step: number;
  title: string;
  content: string;
  status: 'pending' | 'processing' | 'success' | 'error' | 'warning';
  timestamp: Date;
  metadata?: Record<string, any>;
  schema?: any;
  defaultExpanded?: boolean;
  onReview?: (id: string, approved: boolean) => void;
}
```

## Configuration

### Environment Variables

```bash
# DeepSeek/Ollama endpoint
OLLAMA_ENDPOINT=http://localhost:11434

# Frontend URL for CORS
FRONTEND_URL=http://localhost:3000
```

### Model Configuration

Supported models:
- `deepseek-r1` - DeepSeek R1 reasoning model
- `deepseek-chat` - DeepSeek conversational model
- `gpt-4` - OpenAI GPT-4 (requires API key)

## Development

### Running Locally

1. Start the API server:
```bash
npm run start:dev
```

2. Start the frontend:
```bash
npm run dev
```

3. Navigate to http://localhost:3000/dashboard/prompt-dashboard

### Testing

The prompt dashboard requires:
- PostgreSQL database (for schema storage)
- Ollama with DeepSeek R1 model (or compatible API)

To install DeepSeek R1 with Ollama:
```bash
ollama pull deepseek-r1
```

## Troubleshooting

### No response from DeepSeek
- Check that Ollama is running: `ollama list`
- Verify OLLAMA_ENDPOINT environment variable
- Check API server logs for errors

### Schemas not generating
- Ensure PostgreSQL is running and accessible
- Check database migrations are up to date
- Verify PromptToSchemaGenerator service is configured

### Streaming not working
- Check browser console for SSE errors
- Verify CORS settings in API server
- Check network tab for connection issues

## Future Enhancements

- [ ] Conversation persistence to database
- [ ] Feedback review workflow with approvals
- [ ] Artifact download in multiple formats
- [ ] Multi-user collaboration
- [ ] Custom prompt templates
- [ ] Advanced filtering and search
- [ ] Integration with workflow execution engine
