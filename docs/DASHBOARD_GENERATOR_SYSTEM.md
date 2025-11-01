# Dashboard Generator System Documentation

## Overview

The Dashboard Generator system enables AI-powered creation of custom dashboards from natural language prompts. It follows Material Design 3 principles, n8n workflow patterns, and provides a complete schema-driven architecture for reusable components.

## Architecture

### Component Hierarchy

```
Dashboard Generator
├── Prompt Input (Subject + Description + Type)
├── AI Generation (Ollama DeepSeek R1)
├── Schema Generation (JSON structure)
├── Configuration (Layout, Theme, Refresh)
├── Preview (Visual representation)
└── Save (Database persistence)

Generated Dashboard
├── Layout Configuration (Grid, Flex, Tabs, etc.)
├── Widgets (Stat Cards, Charts, Tables, Lists, etc.)
├── Data Sources (API endpoints, queries)
├── Refresh Settings (Auto-refresh intervals)
└── Access Control (Published, Template, etc.)
```

### Database Schema

The system uses 7 main tables:

1. **generated_dashboards** - Main dashboard definitions
2. **dashboard_widgets** - Individual widget configurations
3. **dashboard_templates** - Pre-built templates
4. **dashboard_component_links** - Links to reusable components/atoms
5. **ai_dashboard_generations** - AI generation history and training data
6. **dashboard_analytics** - Usage tracking and events
7. **Materialized Views** - Popularity and quality metrics

## Dashboard Types

### Pre-configured Types

1. **Analytics Dashboard** 📊
   - Traffic metrics, user engagement, conversion rates
   - Line charts, stat cards, tables
   - Real-time data visualization

2. **System Monitoring** 🔍
   - Server performance, CPU, memory, errors
   - Gauges, area charts, progress bars
   - Alert thresholds and notifications

3. **Workflow Management** ⚙️
   - Process tracking, task boards, timelines
   - Kanban boards, Gantt charts, status cards
   - Campaign management

4. **CRM Dashboard** 👥
   - Customer stats, sales pipeline, activities
   - Funnel charts, list widgets, calendar
   - Contact management

5. **E-Commerce** 🛒
   - Sales metrics, inventory, orders
   - Revenue charts, product tables, trend analysis
   - Cart abandonment tracking

6. **SEO Dashboard** 🔎
   - Rankings, backlinks, traffic sources
   - Keyword performance, competitor analysis
   - Content recommendations

7. **Content Management** 📝
   - Publishing stats, content calendar, performance
   - Timeline widgets, tag clouds, edit tracking
   - Multi-author workflows

8. **Custom Dashboard** 🎨
   - Fully customizable with any widgets
   - AI learns from your requirements
   - Template creation for reuse

## Widget Types

### Available Widgets

All widgets follow Material Design 3 and are fully reusable:

#### 1. Stat Card Widget
```typescript
<StatCardWidget
  title="Total Users"
  value={2543}
  change={12.5}
  trend="up"
  icon="users"
  format="number"
  threshold={2000}
  comparisonLabel="vs last month"
/>
```

Features:
- Icon support (users, dollar, activity, trending_up, etc.)
- Trend indicators (up/down arrows with colors)
- Value formatting (number, percentage, currency)
- Threshold alerts
- Comparison labels

#### 2. Chart Widget
```typescript
<ChartWidget
  title="Traffic Overview"
  chartType="line"
  data={chartData}
  dataKeys={{ xAxis: 'date', yAxis: ['visits', 'sales'] }}
  colors={['#6750A4', '#7958A5']}
  height={300}
/>
```

Supported chart types:
- Line charts (single/multiple lines)
- Bar charts (grouped/stacked)
- Area charts (filled line charts)
- Pie charts (circular data)
- Donut charts (pie with center hole)

#### 3. Table Widget
```typescript
<TableWidget
  title="Recent Activities"
  columns={tableColumns}
  data={tableData}
  pagination={true}
  pageSize={10}
  onRowClick={handleRowClick}
/>
```

Features:
- Column sorting
- Pagination
- Row selection
- Click handlers
- Responsive scrolling

#### 4. List Widget
```typescript
<ListWidget
  title="Notifications"
  items={notifications}
  renderItem={(item) => <NotificationItem {...item} />}
  pagination={false}
/>
```

Features:
- Custom item rendering
- Optional pagination
- Avatar support
- Actions menu

#### 5. Progress Widget
```typescript
<ProgressWidget
  title="Campaign Progress"
  percent={75}
  status="active"
  type="circle"
  showInfo={true}
/>
```

Features:
- Line, circle, or dashboard types
- Status indicators (success, error, active)
- Custom colors
- Percentage display

#### 6. Timeline Widget
```typescript
<TimelineWidget
  title="Activity Feed"
  items={[
    {
      id: '1',
      title: 'Campaign launched',
      timestamp: '2025-11-01T10:00:00Z',
      type: 'success',
      icon: 'check'
    }
  ]}
/>
```

Features:
- Chronological ordering
- Type-based colors (success, error, warning, info)
- Icon support
- Relative timestamps ("2h ago")

## AI-Powered Generation

### How It Works

1. **User Input**:
   - Subject: Main topic (e.g., "Web Analytics")
   - Prompt: Detailed requirements
   - Type: Pre-configured or custom

2. **AI Processing**:
   - Ollama DeepSeek R1 analyzes requirements
   - Generates complete dashboard schema
   - Selects appropriate widgets
   - Designs layout structure
   - Provides reasoning

3. **Schema Generation**:
   ```json
   {
     "name": "Web Analytics Dashboard",
     "layoutType": "grid",
     "layoutConfig": { "columns": 4, "gap": "md" },
     "widgets": [
       {
         "type": "stat_card",
         "title": "Total Visitors",
         "config": { "icon": "users", "format": "number" }
       },
       {
         "type": "chart",
         "title": "Traffic Trend",
         "config": { "chartType": "line" }
       }
     ]
   }
   ```

4. **User Refinement**:
   - Review generated structure
   - Modify configuration
   - Adjust layout
   - Preview changes

5. **Training Loop**:
   - User edits tracked
   - Ratings collected
   - AI improves over time

### Prompt Engineering Tips

**Good Prompts**:
- "Create an analytics dashboard showing website traffic by source, conversion funnel, and top pages with real-time updates"
- "Build a monitoring dashboard for tracking API response times, error rates, and system health with alert thresholds"
- "Design a workflow dashboard displaying active campaigns, task completion rates, and recent activities"

**What to Include**:
- Specific metrics you need
- Chart/visualization preferences
- Data refresh requirements
- Alert/threshold needs
- Comparison periods

## API Endpoints

### Dashboard Generation

```typescript
POST /api/dashboards/generate
{
  "subject": "Web Analytics",
  "prompt": "Create dashboard with traffic, conversions, top pages",
  "dashboardType": "analytics"
}

Response:
{
  "success": true,
  "dashboard": { /* generated schema */ },
  "reasoning": "AI explanation",
  "generationTime": 2341
}
```

### Dashboard CRUD

```typescript
// Create
POST /api/dashboards
Body: { name, description, subject, widgets, ... }

// Get all
GET /api/dashboards?page=1&perPage=20&subject=analytics

// Get one
GET /api/dashboards/:id

// Update
PUT /api/dashboards/:id
Body: { name, layoutConfig, widgets, ... }

// Delete
DELETE /api/dashboards/:id

// Clone
POST /api/dashboards/:id/clone
Body: { name, createdBy }
```

### Templates

```typescript
// List templates
GET /api/dashboards/templates/list?category=analytics

// Get template
GET /api/dashboards/templates/:id
```

### Analytics

```typescript
// Get dashboard analytics
GET /api/dashboards/:id/analytics

// Refresh materialized views
POST /api/dashboards/analytics/refresh
```

## Schema Linking

### Component Reusability

Dashboards can link to existing components and atoms:

```typescript
// Dashboard references component
{
  "dashboard_id": "uuid",
  "component_id": "uuid", // Links to component_definitions
  "atom_ids": ["uuid1", "uuid2"], // Links to atom_definitions
  "usage_context": "stat_card_primary_color"
}
```

### Design Token Integration

Widgets automatically use design tokens from atoms:

```typescript
// Atom: Primary Color
{
  "name": "PrimaryColor",
  "value": "#6750A4",
  "category": "colors"
}

// Used in widget
{
  "type": "stat_card",
  "config": {
    "iconColor": "{{atoms.PrimaryColor}}"
  }
}
```

## n8n Workflow Integration

### Workflow Pattern

Following n8n's node-based structure:

```javascript
{
  "nodes": [
    {
      "id": "dashboard-trigger",
      "type": "webhook",
      "name": "Dashboard Data Trigger",
      "parameters": {
        "path": "dashboard-data",
        "method": "POST"
      }
    },
    {
      "id": "fetch-data",
      "type": "httpRequest",
      "name": "Fetch Dashboard Data",
      "parameters": {
        "url": "{{$json.dataSource.endpoint}}",
        "method": "{{$json.dataSource.method}}"
      }
    },
    {
      "id": "process-data",
      "type": "function",
      "name": "Process Data",
      "parameters": {
        "functionCode": "// Transform data for widget\nreturn items.map(item => ({ ...item.json, processed: true }));"
      }
    }
  ]
}
```

### Widget Data Sources

Widgets can connect to n8n workflows:

```typescript
{
  "type": "chart",
  "dataSource": {
    "type": "n8n_workflow",
    "workflowId": "uuid",
    "triggerPath": "/webhook/dashboard-data",
    "method": "POST",
    "params": {
      "dashboardId": "{{dashboard.id}}",
      "timeRange": "7d"
    }
  }
}
```

## Best Practices

### Dashboard Design

1. **Keep it focused**: 4-8 widgets per dashboard
2. **Logical grouping**: Related metrics together
3. **Visual hierarchy**: Important metrics prominent
4. **Consistent spacing**: Use grid layouts
5. **Color coding**: Meaningful color use

### Performance

1. **Lazy loading**: Load widgets on demand
2. **Data caching**: Cache API responses
3. **Refresh intervals**: Don't over-refresh (30s minimum)
4. **Pagination**: Limit table rows
5. **Materialized views**: Pre-aggregate data

### Accessibility

1. **Keyboard navigation**: All interactions accessible
2. **Screen readers**: Proper ARIA labels
3. **Color contrast**: WCAG AA compliance
4. **Focus indicators**: Clear focus states
5. **Alt text**: Describe chart data

## Examples

### Analytics Dashboard

```typescript
const analyticsPrompt = `
Create an analytics dashboard for a web application with:
- Total visitors (today vs yesterday)
- Revenue (this month with trend)
- Top 5 traffic sources (pie chart)
- Daily traffic trend (7 days, line chart)
- Recent conversions (table with user, action, value)
- Conversion rate (percentage with threshold at 3%)
`;

// Generates dashboard with 6 widgets in 4-column grid
```

### Monitoring Dashboard

```typescript
const monitoringPrompt = `
Build a system monitoring dashboard showing:
- CPU usage (gauge with 80% alert threshold)
- Memory usage (progress bar)
- Active requests (real-time line chart)
- Error log (last 20 errors in table)
- System uptime (stat card with days)
- API response times (area chart by endpoint)
Set refresh interval to 5 seconds
`;

// Generates real-time monitoring dashboard
```

### Workflow Dashboard

```typescript
const workflowPrompt = `
Design a workflow management dashboard for tracking:
- Active campaigns (count with status breakdown)
- Tasks by status (kanban board: todo, in progress, done)
- Recent workflow executions (timeline)
- Success rate by workflow type (donut chart)
- Scheduled workflows (list with next run time)
`;

// Generates workflow tracking dashboard
```

## Testing End-to-End

### Test Checklist

- [ ] Generate dashboard from prompt
- [ ] Verify AI response parsing
- [ ] Check widget schema generation
- [ ] Test layout configuration
- [ ] Preview dashboard rendering
- [ ] Save to database
- [ ] Retrieve saved dashboard
- [ ] Clone dashboard
- [ ] Update widgets
- [ ] Track analytics events
- [ ] Test data refresh
- [ ] Verify component linking
- [ ] Check n8n integration
- [ ] Validate accessibility
- [ ] Test responsive design

### Test Script

```bash
# Run database migrations
psql -U postgres -d lightdom -f database/134-dashboard-generator-schema.sql

# Start Ollama
ollama pull deepseek-r1
ollama serve

# Test generation
curl -X POST http://localhost:3001/api/dashboards/generate \
  -H "Content-Type: application/json" \
  -d '{"subject":"Analytics","prompt":"Create analytics dashboard","dashboardType":"analytics"}'

# Test CRUD
curl http://localhost:3001/api/dashboards

# Access UI
open http://localhost:3000/dashboard-generator
```

## Future Enhancements

1. **Drag & Drop Builder**: Visual dashboard composer
2. **Widget Marketplace**: Share custom widgets
3. **Multi-Tenant**: Organization-level dashboards
4. **Export/Import**: JSON export for portability
5. **Embedding**: iframe embedding for external use
6. **Mobile App**: Native dashboard viewing
7. **Collaboration**: Real-time multi-user editing
8. **Version Control**: Dashboard versioning and rollback
9. **A/B Testing**: Test dashboard variants
10. **AI Insights**: AI-generated recommendations

## Support

For issues or questions:
- Check database logs: `SELECT * FROM ai_dashboard_generations WHERE accepted = FALSE`
- Review generation quality: `SELECT * FROM ai_generation_quality`
- Monitor analytics: `SELECT * FROM dashboard_popularity`

## License

Part of the LightDom design system.
