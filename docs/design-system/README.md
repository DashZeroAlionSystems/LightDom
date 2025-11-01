# LightDom Design System - Material Design 3 Integration

## Overview

The LightDom design system has been updated to integrate Material Design 3 (MD3) principles with Tailwind CSS utility classes. This creates a modern, accessible, and consistent user interface across the entire platform.

## Key Features

### 1. Material Design 3 Foundation
- Comprehensive color system with semantic tokens
- Typography scale based on MD3 type system
- 4px base grid spacing system
- Five-level elevation (shadow) system
- Motion and animation standards

### 2. Tailwind CSS Integration
- Custom Tailwind configuration with MD3 design tokens
- Utility-first approach for rapid development
- Responsive design utilities
- Custom component classes built on Tailwind

### 3. Component Library
- Pre-built MD3 components (buttons, cards, inputs, chips)
- Consistent styling across all components
- State layer interactions (hover, active, focus)
- Accessibility built-in

## Architecture

### CSS Structure

```
src/
├── index.css                      # Main CSS entry (Tailwind + custom layers)
├── styles/
│   ├── material-design-3.css      # MD3 CSS variables & component classes
│   ├── DesignSystem.tsx           # TypeScript component definitions
│   ├── NewDesignSystem.tsx        # Updated design system
│   └── EnhancedDesignSystem.tsx   # MD3-enhanced version
└── main.tsx                       # CSS import order
```

### Import Order (Critical!)

```typescript
// main.tsx
import './styles/material-design-3.css';  // MD3 variables first
import './index.css';                      // Tailwind + custom layers
import './discord-theme.css';              // Theme overrides
```

## Design Tokens

### Color System

#### Primary Palette
```css
--md3-primary-600: #7c3aed;    /* Main brand color */
--md3-primary-700: #6d28d9;    /* Darker variant */
--md3-primary-500: #9333ea;    /* Lighter variant */
```

#### Semantic Colors
```css
--md3-success-500: #16a34a;
--md3-warning-500: #d97706;
--md3-error-500: #dc2626;
--md3-info-500: #0284c7;
```

#### Surface Colors (Dark Theme)
```css
--md3-surface: #171717;
--md3-surface-light: #262626;
--md3-surface-elevated: #404040;
--md3-background: #0a0a0a;
--md3-on-surface: #fafafa;
```

### Typography Scale

```css
Display Large:   57px / 64px line-height
Display Medium:  45px / 52px line-height
Display Small:   36px / 44px line-height
Headline Large:  32px / 40px line-height
Headline Medium: 28px / 36px line-height
Headline Small:  24px / 32px line-height
Title Large:     22px / 28px line-height
Title Medium:    16px / 24px line-height
Title Small:     14px / 20px line-height
Body Large:      16px / 24px line-height
Body Medium:     14px / 20px line-height
Body Small:      12px / 16px line-height
Label Large:     14px / 20px line-height
Label Medium:    12px / 16px line-height
Label Small:     11px / 16px line-height
```

### Spacing System

```css
XS:  4px   (--md3-spacing-xs)
SM:  8px   (--md3-spacing-sm)
MD:  16px  (--md3-spacing-md)
LG:  24px  (--md3-spacing-lg)
XL:  32px  (--md3-spacing-xl)
XXL: 48px  (--md3-spacing-xxl)
```

### Border Radius

```css
XS:   4px    (--md3-radius-xs)
SM:   8px    (--md3-radius-sm)
MD:   12px   (--md3-radius-md)
LG:   16px   (--md3-radius-lg)
XL:   20px   (--md3-radius-xl)
XXL:  28px   (--md3-radius-xxl)
Full: 9999px (--md3-radius-full)
```

### Elevation (Shadows)

```css
Level 1: Light shadow for subtle elevation
Level 2: Medium shadow for cards and buttons
Level 3: Prominent shadow for elevated surfaces
Level 4: Strong shadow for high elevation
Level 5: Maximum shadow for very high elevation
```

## Component Usage

### Buttons

```tsx
// Filled Button (Primary action)
<button className="md3-btn md3-btn-filled">
  Save Changes
</button>

// Outlined Button (Secondary action)
<button className="md3-btn md3-btn-outlined">
  Cancel
</button>

// Text Button (Tertiary action)
<button className="md3-btn md3-btn-text">
  Learn More
</button>

// Elevated Button
<button className="md3-btn md3-btn-elevated">
  Upload
</button>

// Tonal Button
<button className="md3-btn md3-btn-tonal">
  Settings
</button>
```

### Cards

```tsx
// Filled Card
<div className="md3-card md3-card-filled md3-p-md">
  <h3 className="md3-title-large">Card Title</h3>
  <p className="md3-body-medium">Card content...</p>
</div>

// Elevated Card
<div className="md3-card md3-card-elevated md3-p-md">
  Content...
</div>

// Outlined Card
<div className="md3-card md3-card-outlined md3-p-md">
  Content...
</div>
```

### App Bar

```tsx
import { AppBar, Button } from '@/components/ui';

// Standard app bar
<AppBar title="Dashboard" subtitle="Overview" leading={<Logo />} actions={<Button variant="text">Settings</Button>} />

// Elevated app bar with compact density
<AppBar density="compact" elevated border={false} leading={<BackIcon />} actions={<ActionsMenu />}> 
  <span className="md3-body-small text-on-surface-variant">Custom slot content here</span>
</AppBar>
```

**Variants**
- `density`: `default` (64px), `comfortable` (72px), `compact` (56px)
- `elevated`: adds level-3 elevation when `true`
- `border`: toggles bottom outline divider

**Slots**
- `leading`: icon/avatar/button rendered on the left
- `title` / `subtitle`: text hierarchy with MD3 typography tokens
- `actions`: right aligned action group (buttons, menus)
- `children`: optional content stacked under title/subtitle

### Workflow Panel

```tsx
import { WorkflowPanel, WorkflowPanelSection, WorkflowPanelFooter } from '@/components/ui';
import { Button } from '@/components/ui';

<WorkflowPanel
  title="Automation Job"
  description="Configure run cadence and resource allocations"
  status="info"
  meta={<span>Updated 2m ago</span>}
  actions={<Button variant="text">View History</Button>}
>
  <WorkflowPanelSection>
    <p className="md3-body-medium">Primary configuration controls and summary content.</p>
  </WorkflowPanelSection>
  <WorkflowPanelFooter>
    <Button variant="filled">Save changes</Button>
    <Button variant="text">Cancel</Button>
  </WorkflowPanelFooter>
</WorkflowPanel>
```

**Variants & States**
- `status`: semantic accenting for `default`, `info`, `success`, `warning`, `error`
- `emphasis`: `normal` (default), `elevated`, or `subtle` surface treatments

**Guidelines**
- Use for dashboard/workflow modules that need header, body, and footer affordances
- Reserve `WorkflowPanelSection` for intra-panel dividers and optional insets
- Keep footer actions concise; pair primary/secondary MD3 buttons for clarity

### Floating Action Button (FAB)

```tsx
import { Fab } from '@/components/ui';
import { Plus } from 'lucide-react';

// Primary FAB
<Fab icon={<Plus />} aria-label="Create task" />

// Extended FAB with label and surface tone
<Fab tone="surface" extended icon={<Plus />}>
  New workflow
</Fab>
```

**Variants**
- `tone`: `primary` (default), `secondary`, `tertiary`, `surface`
- `size`: `small`, `medium` (default), `large`
- `extended`: adds horizontal padding and label support when `true`

**Guidelines**
- Reserve FAB for high-priority, contextual actions within dashboards
- Use icon-only for quick actions; extended variant for descriptive workflows
- Pair with state-layer hover/focus feedback to reinforce MD3 motion cues

### Dashboard KPI Grid

```tsx
import { KpiGrid, KpiCard } from '@/components/ui';
import { TrendingUp } from 'lucide-react';

<KpiGrid columns={3}>
  <KpiCard
    label="Active miners"
    value="3,241"
    delta="+5.2% vs last week"
    icon={<TrendingUp className="w-4 h-4" />}
  />
  <KpiCard label="Tokens earned" value="12,540 LDC" tone="primary">
    Distributed in the past 24 hours
  </KpiCard>
  <KpiCard label="Efficiency" value="98.4%" tone="success" align="center" />
</KpiGrid>
```

**Variants**
- `KpiGrid` supports 1–4 responsive column presets
- `KpiCard` tone: `neutral` (default), `primary`, `success`, `warning`, `error`
- `KpiCard` alignment: `start`, `center`, `end`

**Guidelines**
- Use for at-a-glance metrics on dashboards and workflow summaries
- Combine with `WorkflowPanel` when KPIs require contextual actions
- Keep labels short; leverage `delta` slot for trend callouts

### Text Fields

```tsx
// Basic Text Field
<input
  type="text"
  className="md3-text-field"
  placeholder="Enter text..."
/>

// Or using Tailwind utilities
<input
  type="text"
  className="md3-input"
  placeholder="Search..."
/>
```

### Chips

```tsx
// Assist Chip
<span className="md3-chip md3-chip-assist">
  Help
</span>

// Filter Chip (unselected)
<span className="md3-chip md3-chip-filter">
  All
</span>

// Filter Chip (selected)
<span className="md3-chip md3-chip-filter-selected">
  Active
</span>

// Input Chip
<span className="md3-chip md3-chip-input">
  Tag
</span>
```

## Utility Classes

### Typography

```tsx
<h1 className="md3-display-large">Display Large</h1>
<h2 className="md3-headline-large">Headline Large</h2>
<h3 className="md3-title-large">Title Large</h3>
<p className="md3-body-large">Body text</p>
<span className="md3-label-medium">Label</span>
```

### Layout

```tsx
// Flex utilities
<div className="md3-flex md3-gap-md">Items</div>
<div className="md3-flex-col md3-gap-sm">Column</div>
<div className="md3-flex-center">Centered</div>
<div className="md3-flex-between">Space between</div>

// Grid utilities
<div className="md3-grid md3-grid-cols-3 md3-gap-md">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>
```

### Spacing

```tsx
// Padding
<div className="md3-p-xs">Extra small padding</div>
<div className="md3-p-sm">Small padding</div>
<div className="md3-p-md">Medium padding</div>
<div className="md3-p-lg">Large padding</div>
<div className="md3-p-xl">Extra large padding</div>

// Margin
<div className="md3-m-md">Medium margin</div>

// Gap
<div className="md3-flex md3-gap-lg">Large gap</div>
```

### Colors

```tsx
// Background colors
<div className="md3-bg-primary">Primary background</div>
<div className="md3-bg-success">Success background</div>

// Text colors
<span className="md3-text-primary">Primary text</span>
<span className="md3-text-muted">Muted text</span>

// Surfaces
<div className="md3-surface">Default surface</div>
<div className="md3-surface-light">Light surface</div>
```

### Elevation

```tsx
<div className="md3-elevation-1">Level 1 shadow</div>
<div className="md3-elevation-2">Level 2 shadow</div>
<div className="md3-elevation-3">Level 3 shadow</div>
```

### Border Radius

```tsx
<div className="md3-rounded-xs">4px radius</div>
<div className="md3-rounded-md">12px radius</div>
<div className="md3-rounded-full">Fully rounded</div>
```

### Animation

```tsx
<div className="md3-fade-in">Fade in animation</div>
<div className="md3-slide-up">Slide up animation</div>
```

## Tailwind Utilities

All standard Tailwind utilities are available alongside MD3 classes:

```tsx
<div className="flex items-center justify-between p-4 bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors">
  <span className="text-lg font-medium">Tailwind</span>
  <button className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700">
    Action
  </button>
</div>
```

## Best Practices

### 1. Semantic Color Usage
- Use `md3-bg-primary` for primary actions
- Use `md3-bg-success` for positive feedback
- Use `md3-bg-error` for errors and destructive actions
- Use `md3-bg-warning` for warnings

### 2. Typography Hierarchy
- One `md3-display-*` per page (main heading)
- Use `md3-headline-*` for section headers
- Use `md3-title-*` for subsections
- Use `md3-body-*` for content
- Use `md3-label-*` for UI labels

### 3. Spacing Consistency
- Use the MD3 spacing scale consistently
- Maintain 4px base grid alignment
- Use larger spacing between major sections
- Use smaller spacing within components

### 4. Component Variants
- `filled` for primary actions
- `outlined` for secondary actions
- `text` for tertiary actions
- `elevated` for special emphasis
- `tonal` for medium emphasis

### 5. State Layers
- All interactive elements have hover states
- Active states provide tactile feedback
- Focus states meet WCAG accessibility requirements

## Responsive Design

The design system is mobile-first and responsive:

```css
/* Mobile-first breakpoints */
@media (max-width: 768px) {
  /* Mobile styles */
  .md3-grid-cols-2 {
    grid-template-columns: 1fr;
  }
}

@media (min-width: 769px) and (max-width: 1024px) {
  /* Tablet styles */
}

@media (min-width: 1025px) {
  /* Desktop styles */
}
```

## Accessibility

### Built-in Features
- WCAG 2.1 AA compliant color contrast
- Keyboard navigation support
- Screen reader friendly
- Focus indicators on all interactive elements
- Semantic HTML structure

### Usage Guidelines
- Always provide `aria-label` for icon buttons
- Use semantic HTML elements (`<button>`, `<nav>`, etc.)
- Ensure sufficient color contrast
- Test with keyboard navigation
- Validate with screen readers

## Migration Guide

### From Old Design System

```tsx
// Old
<button className="btn btn-primary">Click</button>

// New
<button className="md3-btn md3-btn-filled">Click</button>
```

```tsx
// Old
<div className="card">Content</div>

// New
<div className="md3-card md3-card-filled md3-p-md">Content</div>
```

### Combining with Existing Styles

You can combine MD3 classes with Tailwind utilities:

```tsx
<button className="md3-btn md3-btn-filled w-full sm:w-auto">
  Responsive Button
</button>
```

## Performance

### CSS Bundle Optimization
- Tailwind purges unused classes in production
- Only required MD3 classes are included
- Minimal runtime CSS
- Optimized for modern browsers

### Best Practices
- Use utility classes directly in JSX
- Avoid inline styles when possible
- Leverage Tailwind's JIT compiler
- Use CSS variables for theme customization

## Theming

### Custom Theme Variables

You can customize the design system by overriding CSS variables:

```css
:root {
  --md3-primary-600: #your-brand-color;
  --md3-spacing-md: 20px;  /* Custom spacing */
  --md3-radius-md: 8px;    /* Custom radius */
}
```

### Dark/Light Mode

The current implementation uses a dark theme. To add light mode:

```css
[data-theme="light"] {
  --md3-surface: #ffffff;
  --md3-on-surface: #1a1a1a;
  /* ... other light theme tokens */
}
```

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Android)

## Resources

- [Material Design 3 Guidelines](https://m3.material.io/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

## Changelog

### v1.0.0 (2025-10-28)
- Initial Material Design 3 integration
- Comprehensive component library
- Tailwind CSS configuration
- Dark theme implementation
- Documentation and examples

---

## Support

For questions or issues with the design system:
1. Check this documentation first
2. Review the TODO list in `docs/design-system/TODO.md`
3. Check component examples in the codebase
4. Consult Material Design 3 official documentation

---

**Last Updated:** 2025-10-28
**Version:** 1.0.0
