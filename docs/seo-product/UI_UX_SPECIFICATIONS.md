# SEO Dashboard: UI/UX Design Specifications

## Design Philosophy

The LightDom SEO Dashboard follows **three core principles**:

1. **Clarity**: Complex SEO data presented in simple, actionable formats
2. **Beauty**: Exodus-inspired gradients and modern Material Design 3 aesthetics
3. **Performance**: Instant feedback, optimistic UI updates, <100ms interactions

---

## Visual Design System

### Color System

#### Primary Palette
```css
/* Dark Theme (Primary) */
--dark-bg-base: #0A0E27;        /* Main background */
--dark-bg-surface: #151A31;     /* Cards, panels */
--dark-bg-elevated: #1E2438;    /* Modals, tooltips */
--dark-bg-overlay: #252B45;     /* Dropdowns, popovers */

/* Brand Colors */
--brand-primary: #5865F2;       /* Primary blue - CTAs, links */
--brand-secondary: #7C5CFF;     /* Primary purple - accents */
--brand-gradient: linear-gradient(135deg, #5865F2 0%, #7C5CFF 100%);
--brand-glow: 0 0 20px rgba(88, 101, 242, 0.3);

/* Semantic Colors */
--success: #3BA55C;             /* Positive trends, completed */
--success-bg: rgba(59, 165, 92, 0.1);
--warning: #FAA61A;             /* Warnings, moderate issues */
--warning-bg: rgba(250, 166, 26, 0.1);
--error: #ED4245;               /* Errors, critical issues */
--error-bg: rgba(237, 66, 69, 0.1);
--info: #5865F2;                /* Info messages */
--info-bg: rgba(88, 101, 242, 0.1);

/* Text Colors */
--text-primary: #FFFFFF;        /* Headings, important text */
--text-secondary: #B9BBBE;      /* Body text */
--text-tertiary: #72767D;       /* Labels, hints */
--text-disabled: #4F545C;       /* Disabled elements */
--text-link: #6C7BFF;           /* Hyperlinks */
--text-link-hover: #9D7CFF;     /* Hovered links */

/* Border Colors */
--border-default: #2E3349;      /* Default borders */
--border-light: #40444B;        /* Lighter borders */
--border-focus: #5865F2;        /* Focused elements */
--border-error: #ED4245;        /* Error states */
```

#### Gradients
```css
/* Background Gradients */
--gradient-hero: linear-gradient(135deg, #0A0E27 0%, #1E2438 50%, #252B45 100%);
--gradient-card: linear-gradient(135deg, #151A31 0%, #1E2438 100%);
--gradient-subtle: linear-gradient(180deg, rgba(88, 101, 242, 0.05) 0%, transparent 100%);

/* Accent Gradients */
--gradient-primary: linear-gradient(135deg, #5865F2 0%, #7C5CFF 100%);
--gradient-success: linear-gradient(135deg, #3BA55C 0%, #4BC76D 100%);
--gradient-warning: linear-gradient(135deg, #FAA61A 0%, #FFB84D 100%);
--gradient-error: linear-gradient(135deg, #ED4245 0%, #FF6B6D 100%);

/* Chart Gradients */
--gradient-chart-1: linear-gradient(180deg, rgba(88, 101, 242, 0.3) 0%, rgba(88, 101, 242, 0) 100%);
--gradient-chart-2: linear-gradient(180deg, rgba(124, 92, 255, 0.3) 0%, rgba(124, 92, 255, 0) 100%);
--gradient-chart-3: linear-gradient(180deg, rgba(59, 165, 92, 0.3) 0%, rgba(59, 165, 92, 0) 100%);
```

### Typography

#### Font Stack
```css
/* Font Families */
--font-display: 'Montserrat', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
--font-body: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace;

/* Font Sizes */
--text-xs: 0.75rem;      /* 12px - Captions, timestamps */
--text-sm: 0.875rem;     /* 14px - Body small, labels */
--text-base: 1rem;       /* 16px - Body text */
--text-lg: 1.125rem;     /* 18px - Subheadings */
--text-xl: 1.25rem;      /* 20px - Section titles */
--text-2xl: 1.5rem;      /* 24px - Page titles */
--text-3xl: 1.875rem;    /* 30px - Hero headings */
--text-4xl: 2.25rem;     /* 36px - Large displays */
--text-5xl: 3rem;        /* 48px - Extra large */

/* Font Weights */
--weight-normal: 400;
--weight-medium: 500;
--weight-semibold: 600;
--weight-bold: 700;
--weight-extrabold: 800;

/* Line Heights */
--leading-tight: 1.2;
--leading-normal: 1.5;
--leading-relaxed: 1.75;
--leading-loose: 2;
```

#### Typography Scale
```css
/* Heading Styles */
h1 {
  font-family: var(--font-display);
  font-size: var(--text-4xl);
  font-weight: var(--weight-bold);
  line-height: var(--leading-tight);
  color: var(--text-primary);
  letter-spacing: -0.02em;
}

h2 {
  font-family: var(--font-display);
  font-size: var(--text-3xl);
  font-weight: var(--weight-semibold);
  line-height: var(--leading-tight);
  color: var(--text-primary);
}

h3 {
  font-family: var(--font-display);
  font-size: var(--text-2xl);
  font-weight: var(--weight-semibold);
  line-height: var(--leading-normal);
  color: var(--text-primary);
}

/* Body Styles */
.body-large {
  font-family: var(--font-body);
  font-size: var(--text-lg);
  line-height: var(--leading-relaxed);
  color: var(--text-secondary);
}

.body-base {
  font-family: var(--font-body);
  font-size: var(--text-base);
  line-height: var(--leading-normal);
  color: var(--text-secondary);
}

.body-small {
  font-family: var(--font-body);
  font-size: var(--text-sm);
  line-height: var(--leading-normal);
  color: var(--text-tertiary);
}
```

### Spacing System

```css
/* Base: 4px grid */
--space-0: 0;
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
--space-20: 5rem;     /* 80px */
--space-24: 6rem;     /* 96px */
```

### Border Radius

```css
--radius-none: 0;
--radius-sm: 0.25rem;   /* 4px */
--radius-base: 0.5rem;  /* 8px */
--radius-lg: 0.75rem;   /* 12px */
--radius-xl: 1rem;      /* 16px */
--radius-2xl: 1.5rem;   /* 24px */
--radius-full: 9999px;  /* Circles */
```

### Shadows

```css
/* Elevation Shadows */
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.2);
--shadow-base: 0 2px 8px rgba(0, 0, 0, 0.3);
--shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.4);
--shadow-xl: 0 16px 48px rgba(0, 0, 0, 0.5);

/* Glow Effects */
--glow-primary: 0 0 20px rgba(88, 101, 242, 0.3);
--glow-success: 0 0 20px rgba(59, 165, 92, 0.3);
--glow-warning: 0 0 20px rgba(250, 166, 26, 0.3);
--glow-error: 0 0 20px rgba(237, 66, 69, 0.3);

/* Inner Shadows */
--shadow-inset: inset 0 2px 4px rgba(0, 0, 0, 0.2);
```

---

## Component Library

### 1. Cards

#### Basic Card
```tsx
<Card>
  <CardContent>
    Basic card with default styling
  </CardContent>
</Card>
```

#### Gradient Card (Featured)
```tsx
<Card variant="gradient" hover={true}>
  <CardHeader>
    <Icon name="chart-line" size={24} color="primary" />
    <Title>SEO Score</Title>
    <Badge variant="success">+5 pts</Badge>
  </CardHeader>
  <CardContent>
    <ScoreCircle score={87} />
  </CardContent>
  <CardFooter>
    <Button variant="text">View Details →</Button>
  </CardFooter>
</Card>
```

**Variants**: default, gradient, outline, ghost  
**States**: default, hover, active, disabled  
**Sizes**: sm, md, lg

#### Metric Card
```tsx
<MetricCard
  icon="users"
  title="Organic Traffic"
  value="24,521"
  change={+15.3}
  trend="up"
  sparkline={[/* 30-day data */]}
/>
```

### 2. Buttons

```tsx
// Primary Button (CTAs)
<Button variant="primary" size="lg">
  Get Started
</Button>

// Secondary Button (Alternative actions)
<Button variant="secondary" size="md">
  Learn More
</Button>

// Outline Button (Tertiary actions)
<Button variant="outline" size="md">
  Cancel
</Button>

// Ghost Button (Minimal)
<Button variant="ghost" size="sm">
  Skip
</Button>

// Icon Button
<IconButton icon="settings" size="md" />

// Button with Icon
<Button variant="primary" icon="download">
  Download Report
</Button>

// Loading State
<Button variant="primary" loading={true}>
  Processing...
</Button>

// Disabled State
<Button variant="primary" disabled={true}>
  Unavailable
</Button>
```

**Variants**: primary, secondary, outline, ghost, text  
**Sizes**: xs, sm, md, lg, xl  
**States**: default, hover, active, loading, disabled

### 3. Charts

#### Line Chart (Traffic Over Time)
```tsx
<LineChart
  data={trafficData}
  xAxis="date"
  yAxis={['organic', 'direct', 'referral', 'social']}
  colors={['#5865F2', '#7C5CFF', '#3BA55C', '#FAA61A']}
  height={400}
  smooth={true}
  gradient={true}
  legend={true}
  tooltip={{
    format: (value) => `${value.toLocaleString()} visits`
  }}
  responsive={true}
  animate={true}
/>
```

#### Bar Chart (Keyword Rankings)
```tsx
<BarChart
  data={keywordData}
  xAxis="keyword"
  yAxis="position"
  color="#5865F2"
  height={300}
  horizontal={true}
  tooltip={true}
  animate={true}
/>
```

#### Donut Chart (Traffic Sources)
```tsx
<DonutChart
  data={[
    { label: 'Organic', value: 45, color: '#5865F2' },
    { label: 'Direct', value: 30, color: '#7C5CFF' },
    { label: 'Referral', value: 15, color: '#3BA55C' },
    { label: 'Social', value: 10, color: '#FAA61A' }
  ]}
  size={250}
  innerRadius={0.6}
  showLabels={true}
  showPercentages={true}
  animate={true}
/>
```

#### Heatmap (User Activity)
```tsx
<Heatmap
  data={activityData}
  xAxis="hour"
  yAxis="day"
  colorScale={['#151A31', '#5865F2']}
  tooltip={true}
  animate={true}
/>
```

### 4. Data Tables

```tsx
<DataTable
  columns={[
    { 
      key: 'keyword', 
      label: 'Keyword', 
      sortable: true,
      searchable: true,
      width: '40%'
    },
    { 
      key: 'position', 
      label: 'Position', 
      sortable: true,
      align: 'center',
      render: (value, row) => (
        <PositionBadge 
          current={value} 
          previous={row.previousPosition}
        />
      )
    },
    { 
      key: 'change', 
      label: 'Change', 
      sortable: true,
      align: 'center',
      render: (value) => <TrendIndicator value={value} />
    },
    { 
      key: 'volume', 
      label: 'Search Volume', 
      sortable: true,
      align: 'right',
      format: 'number'
    },
    { 
      key: 'ctr', 
      label: 'CTR', 
      sortable: true,
      align: 'right',
      format: 'percent'
    },
    {
      key: 'actions',
      label: '',
      render: (_, row) => (
        <ActionMenu>
          <MenuItem icon="chart">View Trend</MenuItem>
          <MenuItem icon="edit">Edit Target</MenuItem>
          <MenuItem icon="trash" danger>Remove</MenuItem>
        </ActionMenu>
      )
    }
  ]}
  data={keywordsData}
  pagination={{
    pageSize: 25,
    showSizeChanger: true,
    showTotal: true
  }}
  selectable={true}
  onSelectionChange={handleSelection}
  searchable={true}
  searchPlaceholder="Search keywords..."
  filters={[
    {
      key: 'position',
      label: 'Position',
      type: 'range',
      min: 1,
      max: 100
    },
    {
      key: 'volume',
      label: 'Volume',
      type: 'select',
      options: [
        { label: 'High (>10k)', value: 'high' },
        { label: 'Medium (1k-10k)', value: 'medium' },
        { label: 'Low (<1k)', value: 'low' }
      ]
    }
  ]}
  exportable={true}
  exportFormats={['CSV', 'Excel', 'PDF']}
  stickyHeader={true}
  striped={true}
  hoverable={true}
/>
```

### 5. Forms

#### Input Fields
```tsx
// Text Input
<Input
  label="Website URL"
  placeholder="https://example.com"
  helperText="Enter your website's homepage URL"
  error={errors.url}
  required={true}
/>

// Search Input
<SearchInput
  placeholder="Search keywords..."
  onSearch={handleSearch}
  debounce={300}
/>

// Select Dropdown
<Select
  label="Report Type"
  options={[
    { label: 'Executive Summary', value: 'executive' },
    { label: 'Technical Report', value: 'technical' },
    { label: 'Full Report', value: 'full' }
  ]}
  placeholder="Choose report type"
/>

// Multi-Select
<MultiSelect
  label="Include Sections"
  options={sectionOptions}
  placeholder="Select sections..."
  searchable={true}
/>

// Date Range Picker
<DateRangePicker
  label="Date Range"
  presets={['Last 7 days', 'Last 30 days', 'Last 3 months']}
  onChange={handleDateChange}
/>

// Toggle Switch
<Switch
  label="Enable Real-time Monitoring"
  checked={isEnabled}
  onChange={setIsEnabled}
/>

// Checkbox
<Checkbox
  label="I agree to the terms and conditions"
  checked={agreed}
  onChange={setAgreed}
/>

// Radio Group
<RadioGroup
  label="Subscription Plan"
  options={[
    { label: 'Starter - $79/mo', value: 'starter' },
    { label: 'Professional - $249/mo', value: 'professional' },
    { label: 'Business - $599/mo', value: 'business' }
  ]}
  value={selectedPlan}
  onChange={setSelectedPlan}
/>
```

### 6. SEO-Specific Components

#### SEO Score Circle
```tsx
<SEOScoreCircle
  score={87}
  maxScore={100}
  size={200}
  strokeWidth={16}
  showLabel={true}
  showBreakdown={true}
  breakdown={{
    technical: 92,
    content: 85,
    performance: 84,
    ux: 88
  }}
  animated={true}
  interactive={true}
  onSegmentClick={handleSegmentClick}
/>
```

#### Core Web Vitals Widget
```tsx
<CoreWebVitalsWidget
  metrics={{
    lcp: { value: 1.8, threshold: 2.5, status: 'good' },
    inp: { value: 150, threshold: 200, status: 'good' },
    cls: { value: 0.08, threshold: 0.1, status: 'good' }
  }}
  distribution={vitalsDistribution}
  trend="improving"
  showTrend={true}
  compact={false}
/>
```

#### Position Badge
```tsx
<PositionBadge
  current={5}
  previous={8}
  showTrend={true}
  animate={true}
/>
```

**Output**: "5 ↑3" in success color

#### Trend Indicator
```tsx
<TrendIndicator
  value={+15.3}
  format="percent"
  showIcon={true}
  showValue={true}
  size="md"
/>
```

**Output**: "↑ 15.3%" with success color

#### Schema Status Badge
```tsx
<SchemaStatusBadge
  status="valid" // or "invalid", "warning", "missing"
  schemaType="Product"
  validationErrors={[]}
/>
```

#### Recommendation Card
```tsx
<RecommendationCard
  severity="high"
  title="Add Product Schema to Product Pages"
  description="15 product pages are missing Product schema markup, which could improve visibility in search results."
  impact={+8}
  effort="easy"
  affectedPages={15}
  autoFixable={true}
  onApply={handleApply}
  onDismiss={handleDismiss}
  onLearnMore={handleLearnMore}
/>
```

---

## Layout System

### Dashboard Grid
```tsx
<DashboardLayout>
  <Sidebar>
    <Logo />
    <Navigation />
    <UserMenu />
  </Sidebar>
  
  <MainContent>
    <Header>
      <Breadcrumbs />
      <Actions />
    </Header>
    
    <PageContent>
      <Grid
        columns={12}
        gap={6}
        responsive={true}
      >
        <GridItem span={8}>
          <Card>Main Content</Card>
        </GridItem>
        <GridItem span={4}>
          <Card>Sidebar Widget</Card>
        </GridItem>
      </Grid>
    </PageContent>
  </MainContent>
</DashboardLayout>
```

### Responsive Breakpoints
```css
--breakpoint-xs: 0;
--breakpoint-sm: 640px;
--breakpoint-md: 768px;
--breakpoint-lg: 1024px;
--breakpoint-xl: 1280px;
--breakpoint-2xl: 1536px;
```

---

## Animation & Transitions

### Timing Functions
```css
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
```

### Durations
```css
--duration-fast: 150ms;
--duration-base: 300ms;
--duration-slow: 500ms;
```

### Common Animations
```css
/* Fade In */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Slide Up */
@keyframes slideUp {
  from { 
    opacity: 0; 
    transform: translateY(20px); 
  }
  to { 
    opacity: 1; 
    transform: translateY(0); 
  }
}

/* Pulse (for loading states) */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* Spin (for loading spinners) */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
```

---

## Accessibility

### ARIA Labels
- All interactive elements have proper ARIA labels
- Form inputs have associated labels
- Buttons describe their action
- Icons have aria-hidden when decorative

### Keyboard Navigation
- Tab order follows visual layout
- Focus states are clearly visible
- Escape key closes modals/dropdowns
- Enter/Space activates buttons

### Screen Reader Support
- Semantic HTML elements
- Live regions for dynamic content
- Skip navigation links
- Descriptive alt text for images

### Color Contrast
- All text meets WCAG AA standards (4.5:1 minimum)
- Important text meets AAA standards (7:1 minimum)
- Focus indicators are clearly visible

---

## Interactive States

### Hover States
```css
.card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
  border-color: var(--border-light);
  transition: all var(--duration-base) var(--ease-out);
}

.button:hover {
  background: linear-gradient(135deg, #6C7BFF 0%, #9D7CFF 100%);
  box-shadow: var(--glow-primary);
}
```

### Focus States
```css
.input:focus {
  border-color: var(--border-focus);
  box-shadow: 0 0 0 3px rgba(88, 101, 242, 0.2);
  outline: none;
}
```

### Active States
```css
.button:active {
  transform: scale(0.98);
  transition: transform var(--duration-fast);
}
```

### Loading States
```css
.skeleton {
  background: linear-gradient(
    90deg,
    var(--dark-bg-surface) 0%,
    var(--dark-bg-elevated) 50%,
    var(--dark-bg-surface) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
```

---

## Mobile Optimization

### Responsive Design Patterns
- **Desktop (>1024px)**: Full sidebar + multi-column layouts
- **Tablet (768px-1024px)**: Collapsible sidebar + two-column layouts
- **Mobile (<768px)**: Bottom navigation + single-column layouts

### Touch Targets
- Minimum 44x44px for all interactive elements
- Increased spacing between clickable items
- Swipe gestures for table navigation

### Mobile-Specific Components
```tsx
// Mobile-optimized table
<MobileDataTable
  data={keywordsData}
  cardView={true}
  swipeable={true}
  expandable={true}
/>

// Bottom sheet for filters
<BottomSheet
  trigger={<Button>Filters</Button>}
  title="Filter Keywords"
>
  <FilterForm />
</BottomSheet>
```

---

## Performance Optimizations

### Code Splitting
```tsx
// Lazy load heavy components
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'));
const ReportsPage = lazy(() => import('./pages/ReportsPage'));
```

### Virtual Scrolling
```tsx
// For large tables
<VirtualTable
  data={largeDataset}
  itemHeight={50}
  overscan={5}
/>
```

### Image Optimization
```tsx
<Image
  src="/hero.jpg"
  alt="Dashboard preview"
  width={1200}
  height={630}
  loading="lazy"
  placeholder="blur"
  formats={['webp', 'avif', 'jpg']}
/>
```

---

## Design Tokens (CSS Variables)

All design tokens exported as CSS variables for easy theming:

```css
:root {
  /* Colors */
  --color-bg-primary: #0A0E27;
  --color-brand-primary: #5865F2;
  
  /* Typography */
  --font-display: 'Montserrat', sans-serif;
  --text-base: 1rem;
  
  /* Spacing */
  --space-4: 1rem;
  
  /* Shadows */
  --shadow-base: 0 2px 8px rgba(0, 0, 0, 0.3);
  
  /* ... all other tokens */
}
```

---

## Figma Design Files

### Required Mockups
1. **Dashboard Home** (Desktop + Mobile)
2. **Analytics Page** (Desktop + Tablet + Mobile)
3. **Schema Management** (Desktop + Modal states)
4. **Recommendations** (Desktop + Card variations)
5. **Reports Page** (Desktop + PDF preview)
6. **Settings** (Desktop + All tabs)
7. **Onboarding Flow** (All steps, Desktop + Mobile)
8. **Marketing Landing Page** (Desktop + Mobile)

### Component Library
- All components in all states (default, hover, active, disabled)
- All variants (primary, secondary, etc.)
- All sizes (sm, md, lg)
- Dark mode only (primary theme)

---

## Next Steps

1. **Create Figma designs** based on these specs
2. **Build component library** in Storybook
3. **Implement design system** in React + Tailwind
4. **Create interactive prototype** for user testing
5. **Conduct usability testing** with 10 target users
6. **Iterate based on feedback**
7. **Finalize designs** for development

---

**Document Version**: 1.0  
**Last Updated**: 2024-11-02  
**Owner**: Design Team  
**Status**: Ready for Design Phase
