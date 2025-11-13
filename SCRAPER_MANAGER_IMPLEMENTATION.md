# Scraper Manager and DeepSeek Integration - Implementation Complete

## Overview

This implementation provides a complete system for managing scraping instances, integrating with DeepSeek AI via Ollama, and mining design components from websites like TensorFlow and Kaggle for Storybook generation.

## Features Implemented

### 1. Scraper Manager Service ✅

The **Scraper Manager** orchestrates multiple mining/crawler instances with URL seeding configuration.

**Key Features:**
- Create and manage multiple scraper instances
- Configure URL seeds with priority and metadata
- Start/stop instances with real-time monitoring
- Track crawl results and statistics
- Data streams for organizing mined attributes

**Database Tables:**
- `scraper_instances` - Instance configuration and status
- `url_seeds` - URLs to crawl with priority and tags
- `crawl_results` - Extracted data from crawled pages

**API Endpoints:**
- `GET /api/scraper-manager/status` - Service status
- `GET /api/scraper-manager/instances` - List all instances
- `POST /api/scraper-manager/instances` - Create instance
- `POST /api/scraper-manager/instances/:id/start` - Start instance
- `POST /api/scraper-manager/instances/:id/stop` - Stop instance
- `POST /api/scraper-manager/instances/:id/seeds/bulk` - Add URL seeds
- `GET /api/scraper-manager/instances/:id/stats` - Instance statistics

**UI Component:**
- `ScraperManagerDashboard` - React component with Ant Design
- Located at `/dashboard/scraper-manager`

### 2. DeepSeek Chat Service ✅

The **DeepSeek Chat Service** provides real-time AI conversations using DeepSeek model via Ollama.

**Key Features:**
- Create and manage chat conversations
- Send messages and receive AI responses
- Conversation history and context management
- Support for long conversations with UX optimizations
- Real-time message streaming (future enhancement)

**Database Tables:**
- `chat_conversations` - Conversation metadata and context
- `chat_messages` - Individual messages with role and content
- `chat_context` - Additional context for prompt engineering

**API Endpoints:**
- `GET /api/chat/status` - Service and Ollama connection status
- `GET /api/chat/conversations` - List conversations
- `POST /api/chat/conversations` - Create conversation
- `GET /api/chat/conversations/:id` - Get conversation with messages
- `POST /api/chat/conversations/:id/messages` - Send message
- `POST /api/chat/conversations/:id/archive` - Archive conversation
- `DELETE /api/chat/conversations/:id` - Delete conversation

**UI Component:**
- `DeepSeekChatPanel` - React chat interface with conversation sidebar
- Located at `/dashboard/chat`

**Prerequisites:**
```bash
# Install and start Ollama
ollama serve

# Pull the DeepSeek model
ollama pull deepseek-r1:latest
```

### 3. Storybook Mining Service ✅

The **Storybook Mining Service** extracts components from design system websites and generates Storybook stories.

**Key Features:**
- Mine components from websites (TensorFlow, Kaggle, Material Design, anime.js)
- Extract HTML, CSS, and attributes
- Generate Storybook stories automatically
- Data streams for attribute organization
- Collection-based attribute grouping

**Database Tables:**
- `mined_components` - Extracted components with HTML and metadata
- `component_attributes` - Individual attributes organized by data streams
- `storybook_stories` - Generated story files with user stories

**API Endpoints:**
- `GET /api/storybook-mining/status` - Service status
- `POST /api/storybook-mining/mine` - Mine single website
- `POST /api/storybook-mining/mine/batch` - Mine multiple sites
- `POST /api/storybook-mining/mine/defaults` - Mine default design sites
- `POST /api/storybook-mining/stories/generate/:componentId` - Generate story
- `GET /api/storybook-mining/components` - List mined components
- `GET /api/storybook-mining/data-streams` - View data streams

**Data Streams:**
- `css_mining_stream` - CSS properties and values
- `html_attribute_stream` - HTML attributes
- `content_mining_stream` - Text content
- `interaction_pattern_stream` - Interaction patterns

**Collections:**
- `design_system_attributes` - Design system properties
- `html_attributes` - Standard HTML attributes
- `component_metadata` - Component metadata

## Architecture

### Service Layer
```
services/
├── scraper-manager-service.js    # Orchestrates scraper instances
├── deepseek-chat-service.js      # Manages AI conversations
└── storybook-mining-service.js   # Extracts components and generates stories
```

### API Layer
```
api/
├── scraper-manager-routes.js     # REST API for scraper management
├── deepseek-chat-routes.js       # REST API for chat
└── storybook-mining-routes.js    # REST API for component mining
```

### UI Layer
```
src/components/
├── ScraperManagerDashboard.tsx   # Scraper management UI
└── DeepSeekChatPanel.tsx         # Chat interface
```

### Integration
All services are integrated into the main API server (`api-server-express.js`) and accessible through the React frontend.

## Setup Instructions

### 1. Database Setup

The services automatically create their tables on first use. To manually initialize:

```bash
# Connect to PostgreSQL
psql -U postgres -d dom_space_harvester

# Tables will be created automatically on first API call
# Or run migrations if available
npm run db:migrate
```

### 2. Start Ollama (Required for Chat)

```bash
# Install Ollama (if not already installed)
# Visit: https://ollama.ai/download

# Start Ollama service
ollama serve

# Pull the DeepSeek model
ollama pull deepseek-r1:latest
```

### 3. Start the Complete System

```bash
# Start all services including Storybook
npm run start:complete

# Or start services individually
node api-server-express.js          # API server (port 3001)
npm run dev                          # Frontend (port 3000)
npm run storybook                    # Storybook (port 6006)
```

### 4. Run the Demo

```bash
# Test all services
node demo-system-integration.js
```

## Usage Examples

### Scraper Manager

```javascript
// Create a mining instance
const instance = await axios.post('/api/scraper-manager/instances', {
  name: 'TensorFlow Component Miner',
  config: { maxConcurrency: 5, timeout: 30000 }
});

// Add URLs to crawl
await axios.post(`/api/scraper-manager/instances/${instance.id}/seeds/bulk`, {
  urls: [
    { url: 'https://www.tensorflow.org', priority: 10, tags: ['ml', 'components'] },
    { url: 'https://www.kaggle.com', priority: 8, tags: ['data-science'] }
  ]
});

// Start the instance
await axios.post(`/api/scraper-manager/instances/${instance.id}/start`);
```

### DeepSeek Chat

```javascript
// Create a conversation
const conv = await axios.post('/api/chat/conversations', {
  title: 'Design System Planning',
  context: { topic: 'material-design' }
});

// Send a message
const response = await axios.post(`/api/chat/conversations/${conv.id}/messages`, {
  message: 'Explain atomic design principles'
});

console.log(response.data.aiMessage.content);
```

### Storybook Mining

```javascript
// Mine components from a website
const components = await axios.post('/api/storybook-mining/mine', {
  url: 'https://animejs.com'
});

// Generate a Storybook story
const story = await axios.post(
  `/api/storybook-mining/stories/generate/${components[0].id}`
);

// View generated stories at: http://localhost:6006
```

## Configuration

### Environment Variables

```bash
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/dom_space_harvester
DB_HOST=localhost
DB_PORT=5432
DB_NAME=dom_space_harvester
DB_USER=postgres
DB_PASSWORD=postgres

# Ollama
OLLAMA_API_URL=http://localhost:11434
OLLAMA_MODEL=deepseek-r1:latest
OLLAMA_TIMEOUT=60000

# API Server
PORT=3001
NODE_ENV=development
```

## Data Streams and Collections

The system uses **data streams** to organize how attributes are mined and **collections** to group related attributes:

### Example Data Stream Flow:
```
Website → Component Extraction → Attribute Identification → Data Stream Assignment → Collection Storage
```

### Defined Data Streams:
- **css_mining_stream**: CSS properties extracted from computed styles
- **html_attribute_stream**: HTML attributes (id, class, data-*, etc.)
- **content_mining_stream**: Text content and structure
- **interaction_pattern_stream**: Event handlers and interactions

### Collections:
- **design_system_attributes**: Design tokens and system properties
- **html_attributes**: Standard HTML attribute values
- **component_metadata**: Component-specific metadata

## Testing

### Manual Testing

1. **Scraper Manager**:
   - Visit http://localhost:3000/dashboard/scraper-manager
   - Create an instance
   - Add URLs
   - Start the instance
   - Monitor status

2. **Chat**:
   - Visit http://localhost:3000/dashboard/chat
   - Create a conversation
   - Send messages
   - View AI responses

3. **Storybook**:
   - Visit http://localhost:6006
   - Browse mined components
   - View generated stories

### Automated Testing

```bash
# Run the integration demo
node demo-system-integration.js

# Run compliance checks
npm run compliance:check
```

## API Documentation

Full API documentation is available through Swagger UI at:
- http://localhost:3001/api-docs

## Future Enhancements

1. **Real-time Streaming**: WebSocket support for live chat responses
2. **Component Refinement**: AI-powered component optimization
3. **Batch Operations**: Queue system for large-scale mining
4. **Analytics Dashboard**: Mining statistics and insights
5. **Export Formats**: Multiple export formats for mined components
6. **Template Library**: Pre-configured mining templates for popular design systems

## Troubleshooting

### Ollama Not Connected
```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# Start Ollama
ollama serve

# Pull model
ollama pull deepseek-r1:latest
```

### Database Connection Issues
```bash
# Check PostgreSQL is running
pg_isready

# Test connection
psql -U postgres -d dom_space_harvester -c "SELECT NOW();"
```

### Port Conflicts
```bash
# Check if ports are in use
lsof -i :3001  # API server
lsof -i :3000  # Frontend
lsof -i :6006  # Storybook
```

## Support

For issues and questions:
1. Check the logs in the console
2. Review the API responses for error details
3. Ensure all prerequisites are installed and running
4. Verify environment variables are set correctly

## License

MIT
