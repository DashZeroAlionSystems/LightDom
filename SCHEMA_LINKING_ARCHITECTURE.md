# Schema Linking Dashboard - Component Architecture

## Component Hierarchy

```
SchemaLinkingDashboard (Main Container)
├── Header
│   ├── Title: "Schema Linking Dashboard"
│   ├── Dark Mode Toggle Switch
│   ├── Run Analysis Button
│   ├── Export Button
│   └── Start/Stop Runner Button
│
├── Statistics Row (4 Cards)
│   ├── Database Tables Count
│   ├── Relationships Count
│   ├── Feature Groups Count
│   └── Runner Status
│
└── Tabbed Interface
    ├── Tab 1: Schema Overview
    │   └── SchemaVisualization Component
    │       ├── Feature Selector Dropdown
    │       ├── Schema Tree View (tables → columns)
    │       ├── Feature Details Card
    │       ├── Relationships Card (with strength indicators)
    │       └── Settings Fields Card
    │
    ├── Tab 2: Workflow
    │   └── WorkflowVisualization Component
    │       ├── Workflow Header (name, step count)
    │       ├── Execute Workflow Button
    │       ├── Workflow Diagram (visual flow)
    │       ├── Workflow Steps (vertical stepper)
    │       ├── Step Details Cards
    │       ├── Triggers Card
    │       └── Execution Timeline
    │
    ├── Tab 3: Components
    │   └── ComponentGallery Component
    │       ├── Gallery Header (total count)
    │       ├── Validate All Button
    │       ├── Component Cards (grid layout)
    │       │   ├── Input Components
    │       │   ├── Textarea Components
    │       │   ├── Number Components
    │       │   ├── Toggle Components
    │       │   ├── DateTime Components
    │       │   ├── JSON Editor Components
    │       │   └── UUID Display Components
    │       ├── Schema Display (per dashboard)
    │       └── Validation Summary (3 stats)
    │
    ├── Tab 4: Dashboard Preview
    │   └── DashboardPreview Component
    │       ├── Preview Header
    │       ├── Capture/Export/Fullscreen Buttons
    │       ├── Dashboard Selector (if multiple)
    │       ├── Dashboard Frame
    │       │   ├── Title Bar
    │       │   ├── Component Grid (responsive layout)
    │       │   └── Save/Reset Buttons
    │       └── Layout Information Card
    │
    └── Tab 5: Reports
        └── InfoChartReport Component
            ├── Metrics Row (4 cards with progress)
            │   ├── Tables Metric
            │   ├── Relationships Metric
            │   ├── Features Metric
            │   └── Quality Score Metric
            ├── Charts Row
            │   ├── Column Chart (Tables by Feature)
            │   └── Pie Chart (Relationship Types)
            ├── Insights Card
            │   ├── Strengths Section
            │   └── Recommendations Section
            └── Feature Timeline
```

## Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        User Actions                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  React Component Layer                       │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Schema     │  │   Workflow   │  │  Component   │      │
│  │Visualization │  │Visualization │  │   Gallery    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐                         │
│  │  Dashboard   │  │   InfoChart  │                         │
│  │   Preview    │  │    Report    │                         │
│  └──────────────┘  └──────────────┘                         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      API Layer (Fetch)                       │
│                                                               │
│  GET /api/schema-linking/analyze                            │
│  GET /api/schema-linking/features                           │
│  GET /api/schema-linking/features/:name                     │
│  GET /api/schema-linking/dashboards/:feature                │
│  GET /api/schema-linking/workflows/:feature                 │
│  POST /api/schema-linking/runner/run                        │
│  POST /api/schema-linking/export                            │
│  GET /api/schema-linking/runner/status                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              Schema Linking Service (Node.js)                │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  SchemaLinkingService                                 │   │
│  │  ├── analyzeDatabaseSchema()                         │   │
│  │  ├── discoverRelationships()                         │   │
│  │  ├── identifyFeatureGroupings()                      │   │
│  │  ├── generateDashboardConfigs()                      │   │
│  │  └── generateWorkflowConfigs()                       │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    PostgreSQL Database                       │
│                                                               │
│  ├── Application Tables (users, optimizations, etc.)        │
│  ├── Schema Metadata Tables                                 │
│  │   ├── schema_analysis_runs                              │
│  │   ├── discovered_tables                                 │
│  │   ├── schema_relationships                              │
│  │   ├── feature_groupings                                 │
│  │   ├── generated_dashboards                              │
│  │   └── generated_workflows                               │
│  └── Views                                                   │
│      ├── latest_schema_analysis                             │
│      ├── active_dashboards                                  │
│      └── active_workflows                                   │
└─────────────────────────────────────────────────────────────┘
```

## Schema Linkup Pattern

### Component Schema Definition
```typescript
interface ComponentSchema {
  id: string;                    // Unique identifier
  type: ComponentType;           // UI component type
  field: string;                 // Database field name
  label: string;                 // Human-readable label
  required: boolean;             // Validation requirement
  validation?: ValidationRule[]; // Validation rules
  position?: GridPosition;       // Layout position
}

type ComponentType = 
  | 'input'        // Text input
  | 'textarea'     // Multi-line text
  | 'number'       // Numeric input
  | 'toggle'       // Boolean switch
  | 'datetime'     // Date/time picker
  | 'date'         // Date picker
  | 'json-editor'  // JSON text editor
  | 'uuid-display';// Read-only UUID

interface ValidationRule {
  type: 'required' | 'maxLength' | 'integer';
  message?: string;
  value?: any;
}

interface GridPosition {
  row: number;    // Row index
  col: number;    // Column index
  width: number;  // Span width (out of 12)
  height: number; // Span height
}
```

### Linkup Flow
```
Database Column Type → Component Type Mapping
──────────────────────────────────────────────
boolean          → toggle
integer/bigint   → number
numeric/decimal  → number
text             → textarea
varchar          → input
jsonb/json       → json-editor
timestamp        → datetime
date             → date
uuid             → uuid-display

Table Structure → Dashboard Generation
─────────────────────────────────────
1. Analyze table columns
2. Generate component for each field
3. Apply type mapping
4. Add validation rules
5. Calculate grid layout
6. Create dashboard config

Workflow Generation → Step Execution
───────────────────────────────────
1. Group related tables (feature)
2. Create step for each table
3. Define fields to configure
4. Set up triggers
5. Build data flow
6. Generate execution plan
```

## Testing Architecture

### Puppeteer E2E Tests
```
Test Suite
├── Setup
│   ├── Launch browser (headless)
│   ├── Set viewport (1920x1080)
│   └── Create screenshots directory
│
├── Test Scenarios (13+)
│   ├── 01. Navigation & Page Load
│   ├── 02. Dashboard Title Verification
│   ├── 03. Dark Mode Toggle
│   ├── 04. Run Analysis Button
│   ├── 05. Statistics Cards Display
│   ├── 06. Tab Navigation (all 5 tabs)
│   ├── 07. Component Gallery Interactions
│   ├── 08. Workflow Execution Simulation
│   ├── 09. Dashboard Preview Loading
│   ├── 10. Info Charts Rendering
│   ├── 11. API Connectivity Tests
│   ├── 12. Console Error Detection
│   └── 13. Responsive Design (3 viewports)
│
├── Screenshot Capture (16+ images)
│   ├── Light mode views
│   ├── Dark mode views
│   ├── All tab states
│   ├── Component interactions
│   ├── Workflow execution
│   └── Responsive layouts
│
└── Results & Reporting
    ├── Pass/Fail counts
    ├── Screenshot paths
    ├── Test report JSON
    └── Console output summary
```

## Dark Mode Implementation

### Color Scheme
```css
/* Light Mode */
--bg-primary: #f0f2f5
--bg-card: #fff
--bg-input: #fafafa
--border: #d9d9d9
--text-primary: rgba(0, 0, 0, 0.85)
--text-secondary: rgba(0, 0, 0, 0.65)

/* Dark Mode */
--bg-primary: #141414
--bg-card: #1f1f1f
--bg-input: #141414
--border: #434343
--text-primary: rgba(255, 255, 255, 0.85)
--text-secondary: rgba(255, 255, 255, 0.65)

/* Shared Colors */
--blue: #1890ff
--green: #52c41a
--orange: #faad14
--red: #ff4d4f
--purple: #722ed1
```

### Applied To
- Main dashboard background
- All card backgrounds
- Input fields
- Borders and dividers
- Text colors
- Chart themes (Ant Design Charts)
- Tree components
- Timeline components

## Info Chart Design Patterns

### Research Applied

1. **Visual Hierarchy**
   - Most important metrics at top (statistics row)
   - Charts below for detailed analysis
   - Insights/recommendations last

2. **Color Encoding**
   - Blue (#1890ff) - Primary/Tables
   - Green (#52c41a) - Success/Relationships
   - Orange (#faad14) - Warning/Features
   - Purple (#722ed1) - Quality scores

3. **Chart Selection**
   - **Column Chart** - Compare quantities across categories
   - **Donut Pie Chart** - Show proportions with center metric
   - **Progress Bars** - Linear metric indicators
   - **Timeline** - Chronological data display

4. **Minimalist Approach**
   - Remove unnecessary grid lines
   - Use whitespace effectively
   - Focus on data, not decoration
   - Clear labels and legends

5. **Interactive Elements**
   - Tooltips on hover
   - Click to drill down (future)
   - Responsive resizing
   - Animation on load

## Responsive Breakpoints

```css
/* Mobile */
@media (max-width: 767px) {
  - Single column layout
  - Stacked components
  - Full-width cards
  - Simplified navigation
}

/* Tablet */
@media (min-width: 768px) and (max-width: 1023px) {
  - 2-column grid
  - Responsive charts
  - Compact headers
  - Touch-friendly buttons
}

/* Desktop */
@media (min-width: 1024px) {
  - 12-column grid
  - Full feature set
  - Multi-column layouts
  - Optimized spacing
}
```

## Performance Optimizations

1. **Lazy Loading** - Components load data only when tab is active
2. **Memoization** - UseMemo for chart data calculations
3. **Debounced Inputs** - Validation triggers after typing stops
4. **Efficient Re-renders** - State updates only affected components
5. **API Caching** - Reuse loaded data when switching tabs
