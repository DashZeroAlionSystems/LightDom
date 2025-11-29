# Material Design Dashboard Components Style Guide

## Overview

This style guide documents the Material Design 3.0 principles and implementation patterns for the LightDom dashboard boilerplate system. All dashboard components follow these guidelines to ensure consistency, accessibility, and maintainability.

## Design Principles

### 1. Material Design 3.0

Our dashboard components implement Material Design 3.0 (Material You) with the following core principles:

- **Elevation & Depth**: Using shadows to create hierarchy
- **Motion & Animation**: Smooth, purposeful transitions
- **Typography**: Clear hierarchical type scale
- **Color**: Semantic and accessible color system
- **Spacing**: Consistent spacing units (8dp base)

### 2. Component Hierarchy

```
Dashboard Page
├── DashboardHeader (page title, breadcrumbs, actions)
├── DashboardSection (logical groupings)
│   ├── DashboardGrid (responsive layout)
│   │   └── DashboardCard (content containers)
│   │       └── DashboardStat (metrics display)
```

## Atomic Components

### DashboardCard

**Purpose**: Primary container for dashboard content

**Material Design Properties**:
- Elevation: 1-5 (default: 1)
- Border Radius: 12px (MaterialBorderRadius.lg)
- Padding: 16px/20px/24px (based on size)
- Transition: 300ms cubic-bezier

**Usage**:
```tsx
<DashboardCard
  title="Card Title"
  subtitle="Optional subtitle"
  icon={<IconComponent />}
  elevation={2}
  size="medium"
>
  {/* Content */}
</DashboardCard>
```

**States**:
- Default
- Hover (elevated)
- Loading (skeleton)
- Clickable (with cursor pointer)

### DashboardStat

**Purpose**: Display key performance indicators

**Material Design Properties**:
- Value Typography: 28px, weight 600
- Label Typography: 14px, weight 500
- Icon Size: 20px
- Spacing: 8px between elements

**Usage**:
```tsx
<DashboardStat
  title="Metric Name"
  value={1234}
  icon={<IconComponent />}
  trend="up"
  trendValue="+12%"
  description="vs last month"
/>
```

**Trend Colors**:
- Up: MaterialColors.success[50] (#22c55e)
- Down: MaterialColors.error[50] (#ef4444)
- Neutral: MaterialColors.neutral[50] (#737373)

### DashboardHeader

**Purpose**: Page header with title, breadcrumbs, and actions

**Material Design Properties**:
- Title Size: 32px, weight 700
- Subtitle Size: 16px
- Bottom Border: 1px solid neutral[20]
- Padding Bottom: 16px

**Usage**:
```tsx
<DashboardHeader
  title="Dashboard Title"
  subtitle="Description"
  icon={<IconComponent />}
  breadcrumbs={[
    { label: 'Home', href: '/' },
    { label: 'Current Page' }
  ]}
  actions={<Button>Action</Button>}
/>
```

### DashboardGrid

**Purpose**: Responsive grid layout for cards

**Material Design Properties**:
- Gutter: 16px horizontal, 16px vertical
- Responsive Breakpoints:
  - xs (mobile): 24/24 (1 column)
  - sm (tablet): 12/24 (2 columns)
  - md+ (desktop): Based on columns prop

**Usage**:
```tsx
<DashboardGrid columns={3}>
  <DashboardCard>Card 1</DashboardCard>
  <DashboardCard>Card 2</DashboardCard>
  <DashboardCard>Card 3</DashboardCard>
</DashboardGrid>
```

### DashboardSection

**Purpose**: Logical content groupings with dividers

**Material Design Properties**:
- Margin Top: 32px
- Divider: 1px solid neutral[20]
- Title Size: 20px (h4)

**Usage**:
```tsx
<DashboardSection
  title="Section Title"
  subtitle="Optional description"
  icon={<IconComponent />}
  actions={<Button>Action</Button>}
>
  {/* Section content */}
</DashboardSection>
```

## Layout Component

### DashboardBoilerplate

**Purpose**: Complete dashboard page template

**Features**:
- Automatic header generation
- Stats grid
- Loading states
- Error handling
- API integration
- Standard actions (refresh, create, export, settings)

**Usage**:
```tsx
<DashboardBoilerplate
  categoryId="neural-networks"
  categoryName="neural_networks"
  categoryDisplayName="Neural Networks"
  categoryIcon={<ExperimentOutlined />}
  categoryDescription="AI/ML models management"
  breadcrumbs={[{ label: 'Dashboard' }]}
  stats={[
    { title: 'Total', value: 42, icon: <Icon /> }
  ]}
  onRefresh={handleRefresh}
  onCreate={handleCreate}
>
  {/* Dashboard content */}
</DashboardBoilerplate>
```

## Color System

### Primary Colors
- primary[50]: #9333ea (main brand color)
- primary[40]: #a855f7
- primary[60]: #7c3aed

### Semantic Colors
- success[50]: #22c55e (positive trends, success states)
- error[50]: #ef4444 (negative trends, error states)
- warning[50]: #f59e0b (warnings, caution)

### Neutral Colors
- neutral[90]: #171717 (primary text)
- neutral[60]: #525252 (secondary text)
- neutral[20]: #e5e5e5 (borders, dividers)
- neutral[10]: #f5f5f5 (backgrounds)

## Typography Scale

```
Hero (h1): 48px / 600 weight
Title 1 (h2): 32px / 700 weight
Title 2 (h3): 24px / 600 weight
Title 3 (h4): 20px / 600 weight
Title 4 (h5): 18px / 600 weight
Body Large: 16px / 400 weight
Body: 14px / 400 weight
Caption: 12px / 400 weight
```

## Spacing Scale

Based on 8px unit system:

```
xs: 8px
sm: 12px
md: 16px
lg: 24px
xl: 32px
2xl: 48px
3xl: 64px
```

## Elevation System

```
Level 1: 0 1px 2px 0 rgba(0,0,0,0.05)
Level 2: 0 2px 4px 0 rgba(0,0,0,0.08)
Level 3: 0 4px 8px 0 rgba(0,0,0,0.10)
Level 4: 0 8px 16px 0 rgba(0,0,0,0.12)
Level 5: 0 16px 32px 0 rgba(0,0,0,0.15)
```

## Animation & Transitions

### Duration
- Fast: 150ms (small UI elements)
- Standard: 300ms (most transitions)
- Slow: 500ms (large movements)

### Easing
- Standard: cubic-bezier(0.4, 0.0, 0.2, 1)
- Decelerate: cubic-bezier(0.0, 0.0, 0.2, 1)
- Accelerate: cubic-bezier(0.4, 0.0, 1, 1)

## Accessibility Guidelines

### Color Contrast
- Text on background: minimum 4.5:1 ratio
- Large text: minimum 3:1 ratio
- Interactive elements: clear focus indicators

### Keyboard Navigation
- All interactive elements must be keyboard accessible
- Clear focus states
- Logical tab order

### Screen Readers
- Semantic HTML structure
- ARIA labels where needed
- Descriptive alt text for icons

## Responsive Breakpoints

```
xs: 0-575px (mobile)
sm: 576-767px (tablet portrait)
md: 768-991px (tablet landscape)
lg: 992-1199px (desktop)
xl: 1200-1599px (large desktop)
xxl: 1600px+ (extra large)
```

## Best Practices

### Do's
✅ Use consistent spacing from the spacing scale
✅ Maintain proper elevation hierarchy
✅ Follow the typography scale
✅ Use semantic colors for meaning
✅ Provide loading and error states
✅ Test with keyboard navigation
✅ Ensure mobile responsiveness

### Don'ts
❌ Don't mix spacing units (stick to scale)
❌ Don't use arbitrary colors (use system colors)
❌ Don't skip elevation levels randomly
❌ Don't forget loading states
❌ Don't nest cards more than 2 levels deep
❌ Don't use elevation > 3 for regular content

## Category Dashboard Implementation

Each category dashboard follows this structure:

1. **Import DashboardBoilerplate**
2. **Define stats array** with category metrics
3. **Create data table** with appropriate columns
4. **Wrap in boilerplate** with category metadata
5. **Add API integration** for data fetching

Example structure:
```tsx
const CategoryDashboard = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const stats = [/* 4 key metrics */];
  const columns = [/* table columns */];

  return (
    <DashboardBoilerplate
      categoryId="..."
      categoryName="..."
      categoryDisplayName="..."
      categoryIcon={<Icon />}
      categoryDescription="..."
      stats={stats}
      loading={loading}
      onRefresh={fetchData}
    >
      <DashboardCard title="...">
        <Table columns={columns} dataSource={data} />
      </DashboardCard>
    </DashboardBoilerplate>
  );
};
```

## Storybook Documentation

All atomic components have Storybook stories with:
- Component description
- Props documentation
- Usage examples
- Multiple variants
- Accessibility notes
- Best practices

Run Storybook:
```bash
npm run storybook
```

## Database Integration

Dashboards connect to the categories table:
```sql
SELECT * FROM categories WHERE category_id = 'neural-networks';
```

Category structure:
- id, category_id, name, display_name
- description, category_type, icon, color
- auto_generate_crud_api, api_config
- schema_definition, status

## Future Enhancements

- [ ] Dark mode support
- [ ] Custom theme configuration
- [ ] Advanced filtering
- [ ] Real-time updates via WebSocket
- [ ] Export to PDF/CSV
- [ ] Dashboard customization UI
- [ ] Drag-and-drop dashboard builder

## Support & Contribution

For questions or contributions:
1. Check existing components first
2. Follow Material Design guidelines
3. Write Storybook stories
4. Test accessibility
5. Document new patterns

---

Last Updated: 2025-11-23
Version: 1.0.0
