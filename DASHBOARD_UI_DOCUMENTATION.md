# Ollama & n8n Dashboard - UI Documentation

## Dashboard Location
**Path:** Admin → AI Automation (`/admin/ai-automation`)

## Dashboard Overview

The Ollama & n8n Automation Dashboard provides a comprehensive interface for AI-powered component and workflow generation.

## Layout Structure

```
┌─────────────────────────────────────────────────────────────────┐
│ 🚀 Ollama & n8n Automation                                      │
│ Build components and dashboards using AI, generate n8n workflows│
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │ Ollama   │  │ n8n      │  │ Active   │  │ Templates│       │
│  │ ✓ Online │  │ ✓ Online │  │ 2 / 3    │  │ 5        │       │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │
│                                                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─ Tabs ──────────────────────────────────────────────────┐   │
│  │                                                            │   │
│  │ [Overview] [Component Builder] [Dashboard Builder]        │   │
│  │ [Prompt Templates] [Workflow Monitor]                     │   │
│  │                                                            │   │
│  │ ┌────────────────────────────────────────────────┐       │   │
│  │ │                                                  │       │   │
│  │ │  Tab Content (Interactive Forms and Results)    │       │   │
│  │ │                                                  │       │   │
│  │ │  - Text inputs for descriptions                 │       │   │
│  │ │  - Generate/Build buttons                       │       │   │
│  │ │  - Progress indicators                          │       │   │
│  │ │  - Build logs with timeline                     │       │   │
│  │ │  - Results display                              │       │   │
│  │ │                                                  │       │   │
│  │ └────────────────────────────────────────────────┘       │   │
│  │                                                            │   │
│  └────────────────────────────────────────────────────────────┘   │
│                                                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Quick Actions:                                                  │
│  [Generate Component] [Build Dashboard] [Use Template] [Monitor] │
│  [Settings]                                                      │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Tab Details

### 1. Overview Tab
```
┌─ Quick Start Alert ──────────────────────────────────────┐
│ ℹ️ Welcome to Ollama & n8n Automation!                   │
│                                                            │
│ • Component Builder: Generate single React components     │
│ • Dashboard Builder: Build complete dashboards            │
│ • Prompt Templates: Use pre-built AI templates           │
│ • Workflow Monitor: Monitor n8n workflow execution        │
└────────────────────────────────────────────────────────────┘

┌─ Recent Activity ──────┐  ┌─ Workflows ──────────────────┐
│                         │  │                               │
│ ○ Component "DataTable" │  │ Component Generator [Active]  │
│   generated             │  │ Last run: 2 hours ago         │
│   2 hours ago          │  │ [View] [Run]                  │
│                         │  │                               │
│ ○ Dashboard workflow    │  │ Dashboard Builder [Active]    │
│   created               │  │ Last run: 1 day ago           │
│   1 day ago            │  │ [View] [Run]                  │
│                         │  │                               │
│ ○ Template executed     │  │ Workflow Monitor [Idle]       │
│   2 days ago           │  │ Never run                     │
│                         │  │ [View] [Run]                  │
└─────────────────────────┘  └───────────────────────────────┘
```

### 2. Component Builder Tab
```
┌─ Build Component ─────────────────┐  ┌─ Build Log ────────────────┐
│                                    │  │                             │
│ Component Description:             │  │ 14:32:15                    │
│ ┌────────────────────────────────┐ │  │ ○ Loading design tokens...  │
│ │ A button component with        │ │  │                             │
│ │ primary, secondary, and danger │ │  │ 14:32:16                    │
│ │ variants, loading state, and   │ │  │ ○ Generating with Ollama... │
│ │ icon support                   │ │  │                             │
│ └────────────────────────────────┘ │  │ 14:32:18                    │
│                                    │  │ ○ Validating TypeScript...  │
│ [Generate Component] [Clear]       │  │                             │
│                                    │  │ 14:32:19                    │
│ Progress:                          │  │ ○ Adding accessibility...   │
│ ████████████████░░░░░░░░ 80%      │  │                             │
│                                    │  │ 14:32:20                    │
└────────────────────────────────────┘  │ ✓ Component generated!      │
                                        │                             │
                                        └─────────────────────────────┘
```

### 3. Dashboard Builder Tab
```
┌─ Build Dashboard ─────────────────┐  ┌─ Build Log ────────────────┐
│                                    │  │                             │
│ Dashboard Description:             │  │ 14:35:01                    │
│ ┌────────────────────────────────┐ │  │ ○ [1/5] Generating Header...│
│ │ Analytics dashboard with       │ │  │                             │
│ │ revenue chart, user metrics,   │ │  │ 14:35:02                    │
│ │ activity feed, and filters     │ │  │ ○ [2/5] Generating Chart... │
│ └────────────────────────────────┘ │  │                             │
│                                    │  │ 14:35:04                    │
│ [Build Dashboard] [Clear]          │  │ ○ [3/5] Generating Table... │
│                                    │  │                             │
│ Progressive Build:                 │  │ 14:35:06                    │
│ ████████████░░░░░░░░░░░░ 60%      │  │ ○ [4/5] Generating Filter...│
│                                    │  │                             │
└────────────────────────────────────┘  │ 14:35:08                    │
                                        │ ○ [5/5] Generating Footer...│
                                        │                             │
                                        │ 14:35:09                    │
                                        │ ✓ Dashboard assembled!      │
                                        └─────────────────────────────┘
```

### 4. Prompt Templates Tab
```
┌─ Execute Template ────────────────┐  ┌─ Available Templates ──────┐
│                                    │  │                             │
│ Select Template:                   │  │ • Generate Component        │
│ ┌────────────────────────────────┐ │  │   [Design System]           │
│ │ [Design System]                │ │  │                             │
│ │ Generate Component          ▼ │ │  │ • Dashboard Workflow        │
│ └────────────────────────────────┘ │  │   [Design System]           │
│                                    │  │                             │
│ Template Parameters:               │  │ • Create n8n Workflow       │
│ ┌────────────────────────────────┐ │  │   [Workflow]                │
│ │ description="..."               │ │  │                             │
│ └────────────────────────────────┘ │  │ • Analyze DOM Structure     │
│                                    │  │   [Optimization]            │
│ [Execute Template]                 │  │                             │
│                                    │  │ • Code Review               │
└────────────────────────────────────┘  │   [Analysis]                │
                                        │                             │
                                        └─────────────────────────────┘
```

### 5. Workflow Monitor Tab
```
┌─ Active Workflows ─────────────────────────────────────────────┐
│                                                                  │
│ Component Generator                    ● Active                 │
│ Last run: 2 hours ago                  [Monitor] [Configure]    │
│                                                                  │
│ Dashboard Builder                      ● Active                 │
│ Last run: 1 day ago                    [Monitor] [Configure]    │
│                                                                  │
│ Workflow Monitor                       ○ Idle                   │
│ Never run                              [Monitor] [Configure]    │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

## Color Scheme

- **Success**: Green (#3f8600)
- **Error**: Red (#cf1322)
- **Info**: Blue (#1890ff)
- **Warning**: Orange (#faad14)
- **Neutral**: Gray (#8c8c8c)

## Interactive Elements

### Status Indicators
- ✓ Green check for online/success
- ✗ Red X for offline/error
- ⟳ Spinning icon for checking/loading

### Progress Bars
- Active (blue) during building
- Success (green) when complete
- Error (red) on failure

### Buttons
- Primary: Blue with white text
- Secondary: White with blue border
- Danger: Red (for critical actions)
- Icon buttons: Gray, hover blue

### Timeline Items
- Green dot: Success
- Blue dot: In progress
- Red dot: Error
- Gray dot: Pending/neutral

## Component Organization

### Atomic Components in `frontend/src/components/ui/`
- Avatar.tsx
- Badge.tsx
- Button.tsx
- Card.tsx
- Checkbox.tsx
- Divider.tsx
- Input.tsx
- Modal.tsx
- Progress.tsx
- Tooltip.tsx

All properly exported through `index.ts` for easy importing:
```typescript
import { Button, Card, Badge } from 'frontend/src/components/ui';
```

## Responsive Design

- **Desktop (>1200px)**: Full layout with side-by-side panels
- **Tablet (768-1200px)**: Stacked layout, full-width cards
- **Mobile (<768px)**: Single column, mobile-optimized controls

## Accessibility

- Proper ARIA labels on all interactive elements
- Keyboard navigation support
- Screen reader friendly status updates
- High contrast color schemes
- Focus indicators on all focusable elements

## Future Enhancements

1. **Real-time Updates**: WebSocket integration for live progress
2. **Result Preview**: Visual preview of generated components
3. **Code Editor**: Syntax-highlighted code editor for results
4. **Version History**: Track and revert to previous generations
5. **Export Options**: Download generated code, workflows, configs
6. **Templates Library**: Expanded template collection
7. **Analytics**: Usage statistics and generation metrics

---

**The dashboard is now live at `/admin/ai-automation` in the admin panel!** 🎉
