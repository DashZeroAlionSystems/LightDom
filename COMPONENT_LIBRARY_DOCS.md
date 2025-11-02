# Component Library & AI Layout Builder Documentation

## Overview

The Component Library & AI Layout Builder provides a visual interface for browsing, selecting, and arranging UI components using AI-powered intelligent placement. It integrates with both Ollama and DeepSeek APIs to generate optimal layouts based on natural language descriptions and database schema context.

## Key Features

### 1. Component Browser
- **Visual Preview**: See live previews of each component
- **Code View**: Inspect and copy component code
- **Search & Filter**: Find components by name, description, tags, or category
- **Multi-Select**: Select multiple components for layout building
- **Drag & Drop**: Reorder components visually

### 2. AI-Powered Layout Generation
- **Natural Language Input**: Describe your desired layout in plain English
- **Schema-Aware**: Uses database schema to make intelligent placement decisions
- **Dual AI Providers**: Supports both Ollama (local) and DeepSeek (cloud)
- **Automatic Placement**: AI determines optimal component positions
- **Workflow-Driven**: Understands input → process → output patterns

### 3. Layout Builder
- **4-Slot Grid**: Header, Sidebar, Main Content, Footer
- **Visual Arrangement**: Drag components into layout slots
- **Real-Time Preview**: See layout as you build
- **Code Generation**: Export complete dashboard code
- **Responsive Design**: Mobile-first layouts

## Usage Guide

### Browsing Components

1. **Navigate to Admin → AI Automation → Component Library**
2. **Search** for components using the search bar
3. **Filter** by category (Buttons, Cards, Inputs, Dashboard, Display)
4. **Preview** each component by expanding the preview panel
5. **View Code** by expanding the code panel
6. **Copy Code** using the copy button in code panels

### Building Layouts with AI

#### Step 1: Select Components
```typescript
// Select the components you want to use
- Click on components to select them
- Selected components show a checkmark
- Can select multiple components at once
```

#### Step 2: Describe Your Layout
```typescript
// Example prompts:
"Place the search in header, stats in main content, buttons in footer"
"Create a dashboard with search on top, metrics in the center, and action buttons at the bottom"
"Arrange components in order of workflow: input, processing, output"
```

#### Step 3: Generate Layout
```typescript
// Click "Generate Layout with AI"
// AI analyzes your prompt, selected components, and schema
// Components are automatically placed in optimal positions
```

#### Step 4: Review & Refine
```typescript
// Review the generated layout
// Manually adjust if needed by dragging components
// Generate full dashboard code
```

### AI Providers

#### Ollama (Local)
- **Free & Private**: Runs entirely on your local machine
- **No API Key Required**: Just have Ollama installed
- **Model**: Uses llama2 by default
- **Best For**: Development, privacy-sensitive projects

**Setup:**
```bash
# Install Ollama
curl https://ollama.ai/install.sh | sh

# Pull model
ollama pull llama2

# Start Ollama
ollama serve
```

#### DeepSeek (Cloud)
- **Advanced AI**: More powerful language model
- **API Key Required**: Set `DEEPSEEK_API_KEY` environment variable
- **Model**: Uses deepseek-chat
- **Best For**: Production, complex layouts

**Setup:**
```bash
# Set environment variable
export DEEPSEEK_API_KEY="your-api-key-here"

# Or in .env file
DEEPSEEK_API_KEY=your-api-key-here
```

## AI Placement Algorithm

The AI considers multiple factors when placing components:

### 1. Component Type Analysis
```javascript
// Input components → Header
Search bars, filters, input fields

// Display components → Main Content  
Stats, KPIs, data tables, charts

// Action components → Footer
Buttons, submit actions, navigation

// Navigation components → Sidebar
Menus, links, category filters
```

### 2. Workflow Understanding
```javascript
// Follows natural workflow patterns
Input (Header) → Process (Main) → Output (Footer)

// Example:
Search Input → Search Results → Action Buttons
```

### 3. Schema-Aware Placement
```javascript
// Uses database schema to inform decisions
// Example: User table with relationships

{
  "table": "users",
  "relationships": {
    "orders": "one-to-many",
    "profile": "one-to-one"
  }
}

// AI Decision:
// - User search input → Header
// - User stats/KPIs → Main (top)
// - User profile card → Main (left)
// - Orders table → Main (right)
// - User actions → Footer
```

### 4. Responsive Considerations
```javascript
// AI considers screen sizes
Mobile: Single column, stack vertically
Tablet: 2 columns, header/footer full width
Desktop: Full grid with sidebar
```

## API Endpoints

### POST /api/ai/generate-layout

Generates optimized layout using AI.

**Request:**
```json
{
  "prompt": "Place search in header, stats in main, buttons in footer",
  "selectedComponents": ["search-bar", "stat-card", "button-primary"],
  "currentLayout": [...],
  "provider": "ollama",
  "schema": {
    "tables": [...],
    "relationships": [...]
  }
}
```

**Response:**
```json
{
  "success": true,
  "layout": [
    {
      "id": "header",
      "name": "Header",
      "components": ["search-bar"]
    },
    {
      "id": "main",
      "name": "Main Content",
      "components": ["stat-card"]
    },
    {
      "id": "footer",
      "name": "Footer",
      "components": ["button-primary"]
    }
  ],
  "provider": "ollama"
}
```

### GET /api/ai/status

Checks availability of AI providers.

**Response:**
```json
{
  "ollama": {
    "available": true,
    "models": ["llama2", "codellama"]
  },
  "deepseek": {
    "available": true,
    "configured": true,
    "models": ["deepseek-chat"]
  }
}
```

### POST /api/ai/generate-workflow

Generates n8n workflow from description and schema.

**Request:**
```json
{
  "description": "Create workflow to sync user data from API to database",
  "schema": {...},
  "provider": "ollama"
}
```

**Response:**
```json
{
  "success": true,
  "workflow": {
    "nodes": [...],
    "connections": {...}
  },
  "provider": "ollama"
}
```

## Component Library Structure

### Categories

1. **Buttons** - Action triggers
   - Primary Button
   - Secondary Button
   - Icon Button
   - FAB (Floating Action Button)

2. **Cards** - Containers
   - Elevated Card
   - Filled Card
   - Outlined Card
   - Stat Card

3. **Inputs** - Form fields
   - Text Input
   - Search Bar
   - Select Dropdown
   - Date Picker

4. **Dashboard** - Data display
   - Stat Card
   - KPI Grid
   - Chart Card
   - Metric Display

5. **Display** - Visual elements
   - Tag Group
   - Badge
   - Avatar
   - Tooltip

### Component Schema

Each component includes:

```typescript
interface Component {
  id: string;              // Unique identifier
  name: string;            // Display name
  category: string;        // Category group
  description: string;     // What it does
  code: string;            // React/TSX code
  preview: React.ReactNode; // Live preview
  props?: Record<string, any>; // Prop types
  tags: string[];          // Search tags
}
```

## Schema Integration

### How Schemas Enhance AI Placement

```javascript
// Database Schema Example
const schema = {
  tables: [
    {
      name: 'users',
      columns: [
        { name: 'id', type: 'INTEGER', primaryKey: true },
        { name: 'email', type: 'VARCHAR' },
        { name: 'created_at', type: 'TIMESTAMP' }
      ],
      relationships: [
        { 
          table: 'orders', 
          type: 'one-to-many', 
          foreignKey: 'user_id' 
        }
      ]
    }
  ]
};

// AI Uses This To:
1. Infer component types:
   - VARCHAR → Input
   - INTEGER → InputNumber
   - TIMESTAMP → DatePicker
   - FOREIGN_KEY → Select (from related table)

2. Understand relationships:
   - One-to-Many → Embedded table/list
   - Many-to-Many → Multi-select
   - Belongs-To → Dropdown selector

3. Determine placement:
   - Primary entities → Main content (center)
   - Filters/search → Header
   - Actions → Footer
   - Related entities → Sidebars/tabs
```

## Advanced Usage

### Custom Component Addition

```typescript
// Add your own components to the library
const customComponent: Component = {
  id: 'my-custom-widget',
  name: 'Custom Widget',
  category: 'Dashboard',
  description: 'My custom dashboard widget',
  tags: ['custom', 'widget', 'dashboard'],
  code: `<CustomWidget data={data} />`,
  preview: <CustomWidget data={sampleData} />
};

// Add to library
COMPONENT_LIBRARY.push(customComponent);
```

### Schema-Driven Component Generation

```typescript
// Generate components directly from schema
const generateFromSchema = async (schema) => {
  const response = await fetch('/api/ai/generate-layout', {
    method: 'POST',
    body: JSON.stringify({
      prompt: 'Generate CRUD interface for this schema',
      schema: schema,
      provider: 'deepseek'
    })
  });
  
  const { layout } = await response.json();
  return layout;
};
```

### Workflow Integration

```typescript
// Generate entire workflow from layout
const workflow = {
  name: 'User Management Dashboard',
  layout: generatedLayout,
  dataSource: schema,
  actions: {
    create: { endpoint: '/api/users', method: 'POST' },
    read: { endpoint: '/api/users', method: 'GET' },
    update: { endpoint: '/api/users/:id', method: 'PUT' },
    delete: { endpoint: '/api/users/:id', method: 'DELETE' }
  }
};
```

## Best Practices

### 1. Clear Prompts
```typescript
// Good
"Place search and filters in header, user stats in main content, action buttons in footer"

// Too vague
"Make it look good"
```

### 2. Schema Context
```typescript
// Include schema for better results
const request = {
  prompt: "Create user management dashboard",
  schema: userTableSchema, // Include this!
  selectedComponents: components
};
```

### 3. Iterative Refinement
```typescript
// Start simple, then refine
1. Generate initial layout
2. Review AI placement
3. Manually adjust if needed
4. Regenerate with refined prompt
5. Export code when satisfied
```

### 4. Component Selection
```typescript
// Select related components
// Good: Search + Results + Actions (complete workflow)
// Bad: Random unrelated components
```

## Troubleshooting

### AI Not Available
```bash
# Check Ollama status
curl http://localhost:11434/api/tags

# Check DeepSeek configuration
echo $DEEPSEEK_API_KEY

# Restart services
ollama serve
```

### Layout Not Generated
```typescript
// Check console for errors
// Verify components are selected
// Ensure prompt is descriptive
// Try different AI provider
```

### Poor Placement Results
```typescript
// Provide more context in prompt
// Include schema information
// Select appropriate components
// Use more specific descriptions
```

## Examples

### Example 1: User Management Dashboard

**Prompt:** "Create a user management dashboard with search on top, user stats in main area, and CRUD buttons at bottom"

**Components:** search-bar, stat-card, button-primary, tag-group

**Result:**
```javascript
Header: search-bar
Main: stat-card, tag-group
Footer: button-primary (create, edit, delete)
```

### Example 2: Analytics Dashboard

**Prompt:** "Build analytics dashboard showing metrics prominently in center, filters in sidebar"

**Components:** stat-card (x3), search-bar, tag-group

**Result:**
```javascript
Header: Empty
Sidebar: search-bar, tag-group
Main: stat-card (x3)
Footer: Empty
```

### Example 3: E-commerce Checkout

**Prompt:** "Checkout flow with cart summary, payment input, and confirm button"

**Components:** card-elevated, input-text, button-primary

**Result:**
```javascript
Header: Empty
Sidebar: card-elevated (cart summary)
Main: input-text (payment details)
Footer: button-primary (confirm order)
```

## Future Enhancements

- [ ] More AI providers (GPT-4, Claude, etc.)
- [ ] Component preview theming
- [ ] Layout templates library
- [ ] A/B testing layouts
- [ ] Accessibility scoring
- [ ] Performance optimization suggestions
- [ ] Mobile-first generation
- [ ] Export to Figma/Sketch

---

**Need Help?** Check the API status at `/api/ai/status` or contact support.
