# Prompt Dashboard - Visual Guide

## Main Dashboard Layout

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  🧠 Prompt Dashboard                          [deepseek-r1▼] [Export] [Clear]   │
│  AI-powered workflow generation with DeepSeek                                    │
│                                                                                   │
│  [💬 3 messages]  [📊 5 steps]  [📦 2 artifacts]                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                   │                                               │
│  ENTER YOUR PROMPT                │  [Step-by-Step Feedback] [Conversation]      │
│                                   │         [Artifacts]                           │
│  ┌──────────────────────────────┐│                                               │
│  │ Describe your workflow...    ││  ┌─────────────────────────────────────────┐ │
│  │                              ││  │ 1 ✓ Analyzing prompt          0.2s     │ │
│  │                              ││  │   DeepSeek is analyzing your request... │ │
│  │                              ││  └─────────────────────────────────────────┘ │
│  │                              ││                                               │
│  └──────────────────────────────┘│  ┌─────────────────────────────────────────┐ │
│  [deepseek-r1 ▼]  150/2000       │  │ 2 ✓ DeepSeek response         3.4s   ▼ │ │
│                  [Send →]         │  │   Based on your request, I'll create... │ │
│                                   │  │                                         │ │
│  Example prompts:                 │  │   [Expanded content showing full        │ │
│  [Create data mining workflow]    │  │    DeepSeek response with reasoning]    │ │
│  [Build SEO pipeline]             │  └─────────────────────────────────────────┘ │
│                                   │                                               │
│                                   │  ┌─────────────────────────────────────────┐ │
│                                   │  │ 3 ✓ Schema generated          0.5s   ▼ │ │
│                                   │  │   Successfully generated workflow...    │ │
│                                   │  │                                         │ │
│                                   │  │   📋 Generated Schema:                  │ │
│                                   │  │   {                                     │ │
│                                   │  │     "id": "workflow-001",               │ │
│                                   │  │     "tasks": [...]                      │ │
│                                   │  │   }                                     │ │
│                                   │  │                                         │ │
│                                   │  │   [Approve] [Reject]                    │ │
│                                   │  └─────────────────────────────────────────┘ │
│                                   │                                               │
│                                   │  ┌─────────────────────────────────────────┐ │
│                                   │  │ 4 ⟳ Component generation...           │ │
│                                   │  │   Generating React components...        │ │
│                                   │  └─────────────────────────────────────────┘ │
└───────────────────────────────────┴───────────────────────────────────────────────┘
```

## Feedback Card States

### 1. Pending State
```
┌─────────────────────────────────────────────────────────────┐
│ 🕐 1  Pending Task                      12:00:00     [▼]    │
│ ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄│
│ Waiting to start...                                         │
└─────────────────────────────────────────────────────────────┘
```

### 2. Processing State (with spinner)
```
┌─────────────────────────────────────────────────────────────┐
│ ⟳ 2  DeepSeek is thinking...           12:00:05     [▼]    │
│ ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄│
│ Analyzing your request and generating workflow...          │
│                                                             │
│ Based on your prompt, I will create a comprehensive...     │
└─────────────────────────────────────────────────────────────┘
```

### 3. Success State (with schema)
```
┌─────────────────────────────────────────────────────────────┐
│ ✓ 3  Schema generated                   12:00:08  245ms [▼]│
│ ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄│
│ Successfully generated workflow schema with 4 tasks        │
│                                                             │
│ 📋 Generated Schema                                        │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ {                                                       ││
│ │   "id": "workflow-seo-001",                             ││
│ │   "name": "SEO Analysis Workflow",                      ││
│ │   "tasks": [...]                                        ││
│ │ }                                                       ││
│ └─────────────────────────────────────────────────────────┘│
│                                                             │
│ 📊 Metadata                                                │
│ schemasGenerated: 4  │  tasksCreated: 4  │  dependencies: 3│
│                                                             │
│              [✓ Approve]  [✗ Reject]                       │
└─────────────────────────────────────────────────────────────┘
```

### 4. Error State
```
┌─────────────────────────────────────────────────────────────┐
│ ✗ 5  Error processing request          12:00:15     [▼]    │
│ ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄│
│ API error: Connection timeout                              │
│                                                             │
│ Please check your connection and try again.                │
└─────────────────────────────────────────────────────────────┘
```

### 5. Warning State
```
┌─────────────────────────────────────────────────────────────┐
│ ⚠ 6  Rate limit approaching             12:00:20     [▼]    │
│ ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄│
│ API rate limit at 80%                                       │
│                                                             │
│ 📊 Metadata                                                │
│ currentRate: 80  │  limit: 100  │  resetTime: 15 minutes   │
└─────────────────────────────────────────────────────────────┘
```

## Tab Views

### Feedback Tab (Default)
```
┌───────────────────────────────────────────────────────────┐
│ [Step-by-Step Feedback]  Conversation  Artifacts          │
├───────────────────────────────────────────────────────────┤
│                                                            │
│  [Feedback Card 1 - Collapsed]                            │
│  [Feedback Card 2 - Expanded]                             │
│  [Feedback Card 3 - Collapsed]                            │
│  [Feedback Card 4 - Processing, Expanded]                 │
│                                                            │
└───────────────────────────────────────────────────────────┘
```

### Conversation Tab
```
┌───────────────────────────────────────────────────────────┐
│  Step-by-Step Feedback  [Conversation]  Artifacts         │
├───────────────────────────────────────────────────────────┤
│                                                            │
│              ┌────────────────────────────────┐           │
│              │ You                   12:00:00 │           │
│              │ Create a workflow for SEO...   │           │
│              └────────────────────────────────┘           │
│                                                            │
│  ┌────────────────────────────────┐                       │
│  │ DeepSeek              12:00:05 │                       │
│  │ I'll create a comprehensive... │                       │
│  └────────────────────────────────┘                       │
│                                                            │
│              ┌────────────────────────────────┐           │
│              │ You                   12:00:15 │           │
│              │ Can you add monitoring?        │           │
│              └────────────────────────────────┘           │
│                                                            │
└───────────────────────────────────────────────────────────┘
```

### Artifacts Tab
```
┌───────────────────────────────────────────────────────────┐
│  Step-by-Step Feedback  Conversation  [Artifacts]         │
├───────────────────────────────────────────────────────────┤
│                                                            │
│  ┌─────────────────────────────────────────────────────┐ │
│  │ SEO Analysis Workflow                         [View]│ │
│  │ Type: schema • 12:00:08                             │ │
│  │ {                                                   │ │
│  │   "id": "workflow-seo-001",                         │ │
│  │   "tasks": [...]                                    │ │
│  │ }                                                   │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                            │
│  ┌─────────────────────────────────────────────────────┐ │
│  │ SEOAnalyzerDashboard                          [View]│ │
│  │ Type: component • 12:00:12                          │ │
│  │ {                                                   │ │
│  │   "name": "SEOAnalyzerDashboard",                   │ │
│  │   "code": "..."                                     │ │
│  │ }                                                   │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                            │
└───────────────────────────────────────────────────────────┘
```

## Color Scheme

### Status Colors
- **Pending**: Gray (#6B7280)
- **Processing**: Blue (#2563EB) with spinner
- **Success**: Green (#16A34A)
- **Error**: Red (#DC2626)
- **Warning**: Yellow (#CA8A04)

### UI Colors
- **Background**: Gray-50 (#F9FAFB)
- **Cards**: White (#FFFFFF)
- **Borders**: Gray-200 (#E5E7EB)
- **Text Primary**: Gray-900 (#111827)
- **Text Secondary**: Gray-600 (#4B5563)
- **Primary Button**: Purple-600 (#9333EA)
- **Hover**: Purple-700 (#7E22CE)

## Responsive Behavior

### Desktop (>1024px)
```
┌────────────────┬──────────────────────────────────┐
│                │                                  │
│  Prompt Input  │  Feedback Cards (70%)           │
│  (30%)         │                                  │
│                │                                  │
└────────────────┴──────────────────────────────────┘
```

### Tablet (768px - 1024px)
```
┌────────────────────────────────────────────────┐
│  Prompt Input (Full Width)                     │
├────────────────────────────────────────────────┤
│  Feedback Cards (Full Width)                   │
└────────────────────────────────────────────────┘
```

### Mobile (<768px)
```
┌──────────────────┐
│  Prompt Input    │
│  (Stacked)       │
├──────────────────┤
│  Feedback Cards  │
│  (Stacked)       │
└──────────────────┘
```

## Animations

### Collapse/Expand
```
Duration: 200ms
Easing: ease-in-out
Property: max-height, opacity
```

### Processing Spinner
```
Duration: 1s
Animation: rotate 360deg
Infinite: yes
```

### Card Hover
```
Duration: 150ms
Easing: ease-in-out
Property: box-shadow, opacity
```

## Accessibility

### Keyboard Navigation
- `Tab` - Navigate between elements
- `Enter` - Expand/collapse cards
- `Cmd/Ctrl + Enter` - Send prompt
- `Escape` - Close modals

### Screen Reader Support
- ARIA labels on all interactive elements
- Role attributes for semantic structure
- Alt text for icons
- Status announcements for dynamic content

## Performance Metrics

### Target Metrics
- First Paint: <500ms
- Time to Interactive: <2s
- Feedback Card Render: <50ms
- Streaming Latency: <100ms
- Memory Usage: <50MB

### Optimization
- Virtual scrolling for 100+ cards
- Lazy loading of artifact content
- Debounced input (300ms)
- Memoized components
- Code splitting
