# Dashboard Boilerplate System

A comprehensive Material Design 3.0 dashboard boilerplate system for creating consistent, maintainable, and accessible dashboards.

## Overview

The Dashboard Boilerplate System provides a set of atomic components and templates that follow Material Design 3.0 principles to quickly create professional dashboards with minimal code.

## Quick Start

### Creating a New Category Dashboard

```tsx
import React, { useState, useEffect } from 'react';
import { Table } from 'antd';
import { DatabaseOutlined } from '@ant-design/icons';
import DashboardBoilerplate from '../DashboardBoilerplate';
import { DashboardCard } from '../atoms';

const MyCategoryDashboard: React.FC = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const stats = [
    {
      title: 'Total Items',
      value: data.length,
      icon: <DatabaseOutlined />,
      trend: 'up',
      trendValue: '+12%',
      description: 'vs last month',
    },
    // Add more stats...
  ];

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    // Add more columns...
  ];

  return (
    <DashboardBoilerplate
      categoryId="my-category"
      categoryName="my_category"
      categoryDisplayName="My Category"
      categoryIcon={<DatabaseOutlined />}
      categoryDescription="Manage my category items"
      stats={stats}
      loading={loading}
      onRefresh={() => fetchData()}
      onCreate={() => handleCreate()}
    >
      <DashboardCard title="Items" icon={<DatabaseOutlined />}>
        <Table columns={columns} dataSource={data} />
      </DashboardCard>
    </DashboardBoilerplate>
  );
};

export default MyCategoryDashboard;
```

## Atomic Components

### DashboardCard

Container for dashboard content with Material Design elevation and styling.

```tsx
import { DashboardCard } from '@/components/ui/dashboard/atoms';

<DashboardCard
  title="Card Title"
  subtitle="Optional subtitle"
  icon={<IconComponent />}
  actions={<Button>Action</Button>}
  elevation={2}
  size="medium"
>
  {/* Content */}
</DashboardCard>
```

**Props:**
- `title` - Card title
- `subtitle` - Optional subtitle
- `icon` - Icon component
- `actions` - Action buttons/elements
- `loading` - Show loading skeleton
- `hoverable` - Enable hover effects (default: true)
- `elevation` - Material elevation level (1-5)
- `size` - Card size: 'small' | 'medium' | 'large'

### DashboardStat

Display key performance indicators with trends.

```tsx
import { DashboardStat } from '@/components/ui/dashboard/atoms';

<DashboardStat
  title="Revenue"
  value={12450}
  prefix="$"
  icon={<DollarOutlined />}
  trend="up"
  trendValue="+12.5%"
  description="vs last month"
/>
```

**Props:**
- `title` - Metric name
- `value` - Numeric or string value
- `icon` - Icon component
- `trend` - 'up' | 'down' | 'neutral'
- `trendValue` - Trend indicator value
- `description` - Additional context
- `prefix` - Value prefix (e.g., '$')
- `suffix` - Value suffix (e.g., '%')
- `precision` - Decimal places

### DashboardHeader

Page header with breadcrumbs, tabs, and actions.

```tsx
import { DashboardHeader } from '@/components/ui/dashboard/atoms';

<DashboardHeader
  title="Dashboard Title"
  subtitle="Description"
  icon={<IconComponent />}
  breadcrumbs={[
    { label: 'Home', href: '/' },
    { label: 'Current' }
  ]}
  actions={<Button>Action</Button>}
  tabs={[
    { key: 'tab1', label: 'Tab 1' },
    { key: 'tab2', label: 'Tab 2' }
  ]}
  activeTab="tab1"
  onTabChange={(key) => console.log(key)}
/>
```

### DashboardGrid

Responsive grid layout for dashboard cards.

```tsx
import { DashboardGrid } from '@/components/ui/dashboard/atoms';

<DashboardGrid columns={3}>
  <DashboardCard>Card 1</DashboardCard>
  <DashboardCard>Card 2</DashboardCard>
  <DashboardCard>Card 3</DashboardCard>
</DashboardGrid>
```

**Props:**
- `columns` - Number of columns (1-12)
- `gutter` - Spacing between items
- `align` - Vertical alignment
- `justify` - Horizontal alignment

### DashboardSection

Section container with title and divider.

```tsx
import { DashboardSection } from '@/components/ui/dashboard/atoms';

<DashboardSection
  title="Section Title"
  subtitle="Description"
  icon={<IconComponent />}
  actions={<Button>Action</Button>}
>
  {/* Section content */}
</DashboardSection>
```

## DashboardBoilerplate Template

Complete dashboard template with all features.

**Key Features:**
- Automatic header generation
- Stats grid layout
- Loading and error states
- API integration
- Standard CRUD actions (refresh, create, export, settings)
- Breadcrumbs and tabs
- Responsive design

**Props:**

```typescript
interface DashboardBoilerplateProps {
  // Category Information
  categoryId: string;
  categoryName: string;
  categoryDisplayName: string;
  categoryIcon?: ReactNode;
  categoryDescription?: string;

  // Header Configuration
  breadcrumbs?: Array<{ label: string; icon?: ReactNode; href?: string }>;
  tabs?: Array<{ key: string; label: string; icon?: ReactNode }>;
  activeTab?: string;
  onTabChange?: (key: string) => void;

  // Stats Configuration
  stats?: Array<{
    title: string;
    value: string | number;
    icon?: ReactNode;
    trend?: 'up' | 'down' | 'neutral';
    trendValue?: string | number;
    description?: string;
  }>;

  // Main Content
  children?: ReactNode;

  // Actions
  onRefresh?: () => void;
  onCreate?: () => void;
  onExport?: () => void;
  onSettings?: () => void;
  customActions?: ReactNode;

  // Data
  loading?: boolean;
  error?: string | null;

  // API Configuration
  apiEndpoint?: string;
  fetchOnMount?: boolean;
}
```

## Category Dashboards

Pre-built category dashboards for common use cases:

1. **Neural Network** - AI/ML models management
2. **Data Streams** - Real-time data pipelines
3. **Data Mining** - Data mining jobs
4. **Crawling** - Web scraping
5. **Seeding** - Database seeders
6. **Attributes** - Data attributes
7. **Data Training** - Training pipelines
8. **Services** - Microservices

### Using Category Dashboards

Import and use in your routes:

```tsx
import { NeuralNetworkDashboard } from '@/components/ui/dashboard/categories';

<Route path="/dashboard/neural-network" element={<NeuralNetworkDashboard />} />
```

## Database Integration

Dashboards integrate with the categories table:

```sql
SELECT * FROM categories 
WHERE category_id = 'neural-networks';
```

Category structure:
- `category_id` - Unique identifier
- `name` - Internal name
- `display_name` - UI display name
- `description` - Category description
- `category_type` - Type classification
- `icon` - Icon identifier
- `auto_generate_crud_api` - API generation flag
- `api_config` - API configuration JSON
- `schema_definition` - Schema JSON

## Material Design System

### Colors

```tsx
import { MaterialColors } from '@/styles/MaterialDesignSystem';

MaterialColors.primary[50]  // Main brand color
MaterialColors.success[50]  // Positive states
MaterialColors.error[50]    // Error states
MaterialColors.neutral[90]  // Primary text
```

### Spacing

```tsx
import { MaterialSpacing } from '@/styles/MaterialDesignSystem';

MaterialSpacing.xs   // 8px
MaterialSpacing.sm   // 12px
MaterialSpacing.md   // 16px
MaterialSpacing.lg   // 24px
MaterialSpacing.xl   // 32px
```

### Elevation

```tsx
import { MaterialElevation } from '@/styles/MaterialDesignSystem';

style={{ boxShadow: MaterialElevation[2] }}
```

## Storybook Documentation

View all components in Storybook:

```bash
npm run storybook
```

Stories available:
- Dashboard/Atoms/DashboardCard
- Dashboard/Atoms/DashboardStat
- Dashboard/Templates/DashboardBoilerplate

## Best Practices

### Do's ✅
- Use DashboardBoilerplate for new dashboards
- Follow Material Design spacing and elevation
- Provide loading and error states
- Use semantic colors for meaning
- Keep stats to 4 items maximum
- Test keyboard navigation

### Don'ts ❌
- Don't create custom layouts (use atoms)
- Don't mix spacing units
- Don't skip loading states
- Don't use arbitrary colors
- Don't nest cards more than 2 levels

## API Integration

### Automatic Data Fetching

```tsx
<DashboardBoilerplate
  apiEndpoint="/api/my-category"
  fetchOnMount={true}
  onRefresh={fetchData}
>
  {/* Content */}
</DashboardBoilerplate>
```

### Manual Data Management

```tsx
const [data, setData] = useState([]);
const [loading, setLoading] = useState(false);

const fetchData = async () => {
  setLoading(true);
  try {
    const response = await fetch('/api/my-category');
    const result = await response.json();
    setData(result.items);
  } catch (error) {
    console.error(error);
  } finally {
    setLoading(false);
  }
};

<DashboardBoilerplate
  loading={loading}
  onRefresh={fetchData}
>
  {/* Content */}
</DashboardBoilerplate>
```

## Responsive Design

All components are mobile-friendly:

- **Mobile** (xs): Single column layout
- **Tablet** (sm-md): 2 column layout
- **Desktop** (lg+): 3-4 column layout

Grid automatically adjusts based on screen size.

## Accessibility

All components follow WCAG 2.1 AA standards:

- Keyboard navigation
- Screen reader support
- Sufficient color contrast (4.5:1 minimum)
- Focus indicators
- Semantic HTML

## Documentation

- **Style Guide**: `docs/DASHBOARD_MATERIAL_DESIGN_GUIDE.md`
- **Storybook**: Run `npm run storybook`
- **Component Source**: `src/components/ui/dashboard/`

## Support

For issues or questions:
1. Check existing components and examples
2. Review Material Design guidelines
3. Check Storybook documentation
4. Create a GitHub issue

## License

See main project LICENSE file.
