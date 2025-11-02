# Component Schema Tool - Complete Dashboard Design System

> Automated screenshot capture, component breakdown, schema mapping, and SEO optimization platform

## 🎯 Overview

The Component Schema Tool is a comprehensive system for analyzing web applications, breaking down their UI components into atomic elements, generating schema mappings, and optimizing for SEO. It combines:

- **Screenshot Capture**: Automated Puppeteer-based webpage screenshots
- **Component Analysis**: DOM parsing and component extraction
- **Atom Breakdown**: Decomposition into reusable atomic components
- **Schema Mapping**: Automatic schema generation with data binding
- **SEO Optimization**: Research-based SEO settings and recommendations
- **Visual Linkages**: Knowledge graphs, mermaid diagrams, and info charts
- **Database Tracking**: Complete audit trail of all operations

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Puppeteer dependencies (Chrome/Chromium)

### Installation

```bash
# 1. Install dependencies (already done)
npm install

# 2. Run database migrations
psql -U postgres -d lightdom -f database/140-component-analysis-schema.sql

# 3. Start API server
npm run start:dev

# 4. Access dashboard
open http://localhost:3000/dashboard/component-schema
```

### Demo

```bash
# Analyze a URL
npm run component:analyze https://example.com

# Access dashboard
npm run component:dashboard

# Check API health
npm run component:api:health

# View statistics
npm run component:api:stats
```

## 📁 Architecture

```
Component Schema Tool/
├── services/
│   ├── component-analyzer-service.js      # Core analysis engine
│   └── component-analyzer-routes.js       # REST API endpoints
├── database/
│   └── 140-component-analysis-schema.sql  # Database schema
├── src/components/
│   ├── ComponentSchemaToolDashboard.tsx   # Main dashboard
│   ├── SEOSettingsDashboard.tsx           # SEO configuration
│   └── SchemaVisualizationDashboard.tsx   # Visual tools
└── component-schema-tool-demo.js          # Demo script
```

## 🔧 Features

### 1. Screenshot Capture & Component Extraction

```javascript
import ComponentAnalyzerService from './services/component-analyzer-service.js';

const service = new ComponentAnalyzerService();
await service.initialize();

const result = await service.analyzeUrl('https://example.com', {
  waitFor: 2000,
  viewport: { width: 1920, height: 1080 },
  fullPage: true,
  captureMetadata: true
});

console.log(`Found ${result.componentCount} components`);
console.log(`Generated ${result.atomComponentCount} atom components`);
```

**Output:**
- Full-page screenshot (PNG)
- Component hierarchy (JSON)
- Atom components (JSON + Database)
- Page metadata (title, description, schemas, etc.)

### 2. Component Classification

Components are automatically classified into categories:

- **Navigation**: Menus, breadcrumbs, pagination
- **Layout**: Headers, footers, sidebars, grids
- **Container**: Cards, modals, dialogs, accordions
- **Input**: Text fields, buttons, selects, forms
- **Data Display**: Tables, lists, charts
- **Data Visualization**: Graphs, charts, infographics
- **Media**: Images, videos, canvases
- **Feedback**: Alerts, badges, tooltips
- **Overlay**: Modals, dialogs, popovers
- **Other**: Custom components

### 3. Atom Component Properties

Each component is broken down with:

#### Visual Properties
- Background color, text color
- Font size, font family
- Borders, border radius
- Dimensions (width, height)
- Position (x, y coordinates)

#### Content Properties
- Text content
- Placeholder text
- Alt text
- ARIA labels
- Values, hrefs, sources

#### Layout Properties
- Display mode (block, flex, grid)
- Position (static, relative, absolute)
- Z-index, padding, margin
- Area calculation

#### SEO Properties
- Heading detection (H1-H6)
- Link analysis
- Image alt text
- ARIA attributes
- Title attributes

#### Accessibility Properties
- ARIA roles
- ARIA labels and descriptions
- Tab index
- Keyboard navigation

#### Schema Mapping
- Data bindings (name, id, data attributes)
- Event handlers (click, change, submit)
- Component props
- Framework detection (React, Vue, Angular)

### 4. Component Scoring

**Reuse Score (0-100)**
- Generic components score higher
- Simple components score higher
- Clear semantic roles increase score
- Framework components (Ant Design, Material-UI) score higher

**Complexity Score (0-100)**
- Based on child count
- Nesting depth
- Number of classes
- Number of attributes

**Quality Score (0-100)**
- Accessibility features
- Semantic HTML
- Reusability
- Complexity (lower is better)

### 5. SEO Settings Dashboard

Comprehensive SEO configuration interface with:

#### Meta Tags
- Page title (character counter)
- Meta description (preview)
- Meta keywords
- Canonical URL
- Robots meta directives

#### Open Graph
- OG title, description, image
- OG type (website, article, product, video)
- Twitter Card integration
- Twitter site handle

#### Schema Markup
- Schema.org type selector (10+ types)
- JSON-LD editor with validation
- Google Rich Results Test integration
- Breadcrumb schema
- FAQ schema

#### Technical SEO
- H1 tag configuration
- Language and charset
- Viewport settings
- Image alt text strategy
- Internal linking toggle

#### Performance
- Core Web Vitals monitoring
  - LCP (Largest Contentful Paint)
  - FID (First Input Delay)
  - CLS (Cumulative Layout Shift)
- Mobile optimization toggle
- Image lazy loading
- Resource hints (preconnect, prefetch, preload)

#### Research & Best Practices
- 8 SEO research categories pre-loaded:
  1. Meta Tags Optimization
  2. Structured Data & Schema.org
  3. Heading Structure
  4. Core Web Vitals Performance
  5. Mobile-First SEO
  6. Internal Linking Strategy
  7. Image SEO Best Practices
  8. Local SEO Optimization

Each category includes:
- Best practices with priority levels
- Component recommendations
- Implementation examples
- Trusted sources

### 6. Schema Visualization

Three visualization modes:

#### Knowledge Graph
- Force-directed graph layout
- Component nodes colored by classification
- Relationship edges
- Interactive canvas rendering
- Legend with color coding

#### Mermaid Diagram
- Hierarchical component structure
- Subgraphs by classification
- Color coding by reuse score:
  - Green (≥70): Highly reusable
  - Orange (50-69): Moderately reusable
  - Red (<50): Low reusability
- Relationship arrows

#### Info Charts
- Statistical breakdown by classification
- Average reuse scores
- Average complexity scores
- Component counts
- Card-based layout

## 📊 Database Schema

### Tables

1. **component_analyses** - Analysis metadata and screenshots
2. **atom_components** - Individual atomic components
3. **component_relationships** - Component linkages
4. **dashboard_schemas** - Generated dashboard configurations
5. **seo_components** - SEO-specific component data
6. **component_library** - Reusable component templates
7. **schema_visualizations** - Visualization data (graphs, diagrams)
8. **component_mining_workflows** - Automated discovery workflows
9. **component_analysis_logs** - Complete audit trail
10. **seo_research_data** - SEO best practices database
11. **component_seo_mappings** - Component-to-SEO feature mappings

### Views

- **component_statistics** - Aggregate statistics
- **dashboard_schema_summary** - Dashboard overview
- **seo_component_health** - SEO health metrics
- **component_library_popular** - Most used components
- **recent_component_analyses** - Latest analyses

### Functions

- **calculate_component_quality_score** - Quality scoring algorithm
- **get_related_components** - Relationship discovery

## 🌐 API Endpoints

### Analysis
```bash
# Analyze a URL
POST /api/component-analyzer/analyze
{
  "url": "https://example.com",
  "options": {
    "waitFor": 2000,
    "viewport": { "width": 1920, "height": 1080 }
  }
}

# Get all analyses
GET /api/component-analyzer/analyses

# Get specific analysis
GET /api/component-analyzer/analyses/:analysisId
```

### Components
```bash
# Get components with filters
GET /api/component-analyzer/components?type=button&minReuseScore=70

# Get component statistics
GET /api/component-analyzer/components/statistics
```

### Dashboards
```bash
# Get all dashboard schemas
GET /api/component-analyzer/dashboards?type=admin&active=true

# Create dashboard schema
POST /api/component-analyzer/dashboards
{
  "name": "Admin Dashboard",
  "analysisId": "analysis_123",
  "dashboardType": "admin",
  "components": [...]
}
```

### SEO
```bash
# Get SEO components
GET /api/component-analyzer/seo/components?category=technical-seo

# Get SEO research data
GET /api/component-analyzer/seo/research?impact=critical

# Get component SEO mappings
GET /api/component-analyzer/seo/mappings?componentType=input-text
```

### Visualizations
```bash
# Create visualization
POST /api/component-analyzer/visualizations
{
  "name": "Component Graph",
  "visualizationType": "knowledge-graph",
  "data": {...}
}

# Get visualizations
GET /api/component-analyzer/visualizations?type=mermaid
```

### Library
```bash
# Get component library
GET /api/component-analyzer/library?framework=react&publicOnly=true
```

### Health
```bash
# Health check
GET /api/component-analyzer/health
```

## 🎨 UI Components

### ComponentSchemaToolDashboard
Main dashboard with three tabs:
1. Capture & Analyze - URL input and analysis trigger
2. Visualizations - Knowledge graphs, mermaid diagrams, info charts
3. SEO Settings - Comprehensive SEO configuration

### SEOSettingsDashboard
Six-tab interface:
1. Meta Tags - Title, description, keywords, canonical
2. Open Graph - Social sharing optimization
3. Schema Markup - JSON-LD structured data
4. Technical SEO - Headings, language, alt text
5. Performance - Core Web Vitals monitoring
6. Research - Evidence-based best practices

### SchemaVisualizationDashboard
Three visualization modes:
1. Knowledge Graph - Interactive force-directed layout
2. Mermaid Diagram - Hierarchical structure
3. Info Charts - Statistical breakdown

## 🔍 Use Cases

### 1. Component Library Generation

Analyze your app to build a reusable component library:

```bash
npm run component:analyze https://yourapp.com
```

Then query high-reuse-score components:

```bash
curl http://localhost:3001/api/component-analyzer/components?minReuseScore=80
```

### 2. SEO Audit

Analyze competitor sites for SEO insights:

```bash
npm run component:analyze https://competitor.com
curl http://localhost:3001/api/component-analyzer/seo/components
```

### 3. Design System Documentation

Generate comprehensive design system docs:

```bash
# Analyze all pages
npm run component:analyze https://yourapp.com/page1
npm run component:analyze https://yourapp.com/page2

# View statistics
npm run component:api:stats
```

### 4. Automated Dashboard Generation

Use extracted components to generate admin dashboards:

```javascript
const response = await fetch('/api/component-analyzer/dashboards', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Auto-Generated Admin Dashboard',
    analysisId: 'analysis_xyz',
    components: extractedComponents
  })
});
```

### 5. A/B Testing

Track component performance across different designs:

```bash
# Analyze variant A
npm run component:analyze https://yourapp.com/variant-a

# Analyze variant B
npm run component:analyze https://yourapp.com/variant-b

# Compare in dashboard
open http://localhost:3000/dashboard/component-schema
```

## 🧪 Testing

```bash
# Run full demo
npm run component:analyze

# Check API health
npm run component:api:health

# View statistics
npm run component:api:stats
```

## 📈 Performance

- Screenshot capture: ~2-5 seconds
- Component extraction: ~1-3 seconds
- Atom breakdown: ~0.5-1 seconds
- Database storage: ~0.5-1 seconds
- Total analysis time: **~5-10 seconds**

Handles:
- Pages with 100+ components
- Full-page screenshots (10,000+ px height)
- Complex nested component structures
- Multiple concurrent analyses

## 🔒 Security

- No PII storage from analyzed pages
- Screenshots stored locally (configurable)
- Database credentials in environment variables
- Rate limiting on API endpoints
- Input validation on all endpoints
- SQL injection prevention (parameterized queries)

## 🛠️ Troubleshooting

### Puppeteer Issues

```bash
# Install Chrome dependencies (Linux)
sudo apt-get install -y \
  ca-certificates fonts-liberation libappindicator3-1 \
  libasound2 libatk-bridge2.0-0 libatk1.0-0 libc6 libcairo2 \
  libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgbm1 \
  libgcc1 libglib2.0-0 libgtk-3-0 libnspr4 libnss3 \
  libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 \
  libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 \
  libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 \
  libxtst6 lsb-release wget xdg-utils
```

### Database Connection

```bash
# Check PostgreSQL is running
pg_isready -h localhost -p 5434

# Test connection
psql -h localhost -p 5434 -U lightdom_user -d lightdom

# Run migrations
psql -h localhost -p 5434 -U lightdom_user -d lightdom \
  -f database/140-component-analysis-schema.sql
```

### API Not Starting

```bash
# Check if port 3001 is in use
lsof -i :3001

# Start API server
npm run start:dev

# Check logs
tail -f logs/api-server.log
```

## 📚 Resources

- [Puppeteer Documentation](https://pptr.dev/)
- [Schema.org](https://schema.org/)
- [Google SEO Starter Guide](https://developers.google.com/search/docs/beginner/seo-starter-guide)
- [Core Web Vitals](https://web.dev/vitals/)
- [Ant Design Components](https://ant.design/components/)
- [Mermaid Diagrams](https://mermaid-js.github.io/)

## 🤝 Contributing

See main project [CONTRIBUTING.md](./CONTRIBUTING.md)

## 📄 License

Part of the LightDom platform. See main project LICENSE.

## 🎉 What's Next?

- [ ] Real-time collaborative editing
- [ ] Component code generation (React, Vue, Angular)
- [ ] AI-powered design suggestions
- [ ] Accessibility score improvements
- [ ] Multi-page analysis workflows
- [ ] Export to Figma/Sketch
- [ ] Component performance profiling
- [ ] Visual regression testing integration

---

**Built with ❤️ by the LightDom team**

*Making AI understand your components, one schema at a time.*
