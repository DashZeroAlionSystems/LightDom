# LightDom Design System

**Complete Atomic Design system with 34+ reusable components, comprehensive animation utilities, design tokens, and WCAG 2.1 AA accessibility compliance.**

## 🎨 Overview

This design system provides a unified, consistent user experience across the entire LightDom platform. Built with Atomic Design principles, anime.js v4 animations, comprehensive design tokens, and accessibility-first approach, it ensures a modern, performant, and inclusive user experience.

### What's New ✨

- **34 Reusable Components** - Complete atomic design hierarchy (Atoms → Molecules → Organisms → Templates)
- **Animation System** - 30+ animation patterns + 6 React hooks + 3 interactive controllers
- **Design Tokens** - Centralized token system for colors, spacing, typography, shadows, and more
- **Accessibility Utilities** - 20+ WCAG 2.1 AA compliance helpers
- **60+ Storybook Stories** - Interactive documentation across 9 showcase pages

## 📚 Documentation

### Interactive Storybook (60+ Stories)
Run `npm run storybook` and explore:
- **Design System Overview** - Architecture, philosophy, getting started guide
- **Design Tokens Reference** - Complete token system with 8 stories
- **Accessibility Guide** - WCAG compliance guide with 7 interactive demos
- **Atoms Showcase** - All 12 foundation components
- **Molecules Showcase** - All 13 composed components (2 pages)
- **Organisms Showcase** - All 6 complex UI patterns
- **Templates Showcase** - 3 page layouts with 5 interactive demos
- **Form Control Animations** - 30+ animation patterns
- **Animation Controllers** - 3 interactive playgrounds with 7 stories

### Written Documentation
- **[Atomic Design Architecture](./docs/ATOMIC_DESIGN_ARCHITECTURE.md)** - Component hierarchy and organization
- **[UX Research](./docs/research/DESIGN_SYSTEM_UX_RESEARCH.md)** - IDE-styled design patterns and best practices
- **[Headless API Research](./HEADLESS_API_RESEARCH.md)** - Building better app structures with Puppeteer
- **[Implementation Guide](./docs/DESIGN_SYSTEM_IMPLEMENTATION.md)** - Practical examples and code patterns
- **[Consolidation Plan](./DESIGN_SYSTEM_CONSOLIDATION_PLAN.md)** - Migration strategy from legacy systems
- **[Quick Reference](./docs/research/design-system-quick-reference.md)** - Cheat sheet for common tasks

## 🚀 Quick Start

### Installation

Required dependencies are already installed:
```bash
npm install class-variance-authority clsx tailwind-merge lucide-react
```

### Basic Usage

```tsx
// Using Atoms
import { Button, Card, Input, Typography, Avatar, Spinner } from '@/components/atoms';

function MyComponent() {
  return (
    <Card variant="elevated">
      <Card.Header>
        <Typography variant="h2">Welcome</Typography>
        <Typography variant="body1">Get started with LightDom</Typography>
      </Card.Header>
      <Card.Content>
        <Input 
          label="Email" 
          placeholder="you@example.com"
        />
      </Card.Content>
      <Card.Footer>
        <Button variant="primary" fullWidth>
          Continue
        </Button>
      </Card.Footer>
    </Card>
  );
}

// Using Molecules
import { Modal, Tabs, Accordion } from '@/components/molecules';

// Using Organisms
import { Header, Sidebar, DataTable } from '@/components/organisms';

// Using Templates
import { DashboardTemplate, LandingTemplate, AuthTemplate } from '@/components/templates';

// Using Animations
import { animateButton, animateInput } from '@/utils/formControlAnimations';
import { useAnimatedButton, useReducedMotion } from '@/hooks/useAnimations';

function AnimatedButton() {
  const { ref, isAnimating } = useAnimatedButton();
  const prefersReducedMotion = useReducedMotion();
  
  return (
    <button ref={ref} disabled={isAnimating}>
      Click me for smooth animations!
    </button>
  );
}

// Using Design Tokens
import { designTokens, getColor, getSpacing } from '@/utils/designTokens';

const primaryColor = getColor('primary', 500);
const spacing = getSpacing(4); // 16px

// Using Accessibility Utilities
import { getAriaLabel, checkColorContrast, createFocusTrap } from '@/utils/accessibility';

const label = getAriaLabel('Close dialog');
const meetsAA = checkColorContrast('#000000', '#FFFFFF', 'AA');
const trap = createFocusTrap(modalElement);
```

## 🧩 Components

### Atomic Design Hierarchy

#### Atoms (12 Foundation Components)
The smallest building blocks of the UI:
- **Typography** - 14 text variants (h1-h6, body1/2, subtitle, caption, code, lead, overline)
- **Avatar** - User images with initials fallback, status indicators, groups, shapes
- **Badge** - Status indicators and labels with multiple variants
- **Icon** - Lucide icon wrapper with containers, animations, IconButton
- **Button** - Enhanced button with multiple variants and states
- **Input** - Enhanced form input with validation support
- **Checkbox** - Form checkboxes with sizes, labels, descriptions, indeterminate state
- **Toggle** - On/off switches with variants, label positions, state text
- **Spinner** - Loading indicators (circular, dots, pulse variants)
- **Tooltip** - Contextual tooltips with placements, variants, arrows
- **Card** - Content containers with 5 variants (elevated, outlined, filled, gradient, glass)
- **Divider** - Visual separators (horizontal/vertical, with labels)

#### Molecules (13 Composed Components)
Combinations of atoms working together:
- **SearchInput** - Search input with clear button
- **FormGroup** - Form field grouping with labels and validation
- **ButtonGroup** - Button grouping with various layouts
- **AlertBanner** - Notifications and alert banners
- **Breadcrumb** - Navigation breadcrumbs
- **Select** - Enhanced dropdown select
- **DropdownMenu** - Dropdown menus with custom triggers and placements
- **Modal** - Dialog overlays with 6 sizes and close behaviors
- **Tabs** - Tabbed interfaces (3 variants: default, pills, underline)
- **Accordion** - Collapsible panels (3 variants, single/multiple open modes)
- **ProgressBar** - Progress indicators with 6 variants
- **Pagination** - Page navigation with ellipsis and controls
- **EmptyState** - Empty content placeholders with icons and actions

#### Organisms (6 Complex UI Patterns)
Complete, functional sections:
- **Header** - Application header with search, notifications, user dropdown
- **Sidebar** - Collapsible navigation with sections, active states, badges
- **DataTable** - Advanced table with sorting, filtering, search, pagination, row selection
- **Form** - Complete form builder with validation, error handling, 8 field types
- **UserProfile** - User profile card with avatar, contact info, stats, actions
- **NotificationCenter** - Notification list with tabs, mark as read, type indicators

#### Templates (3 Page Layouts)
Complete page structures:
- **DashboardTemplate** - Full dashboard with collapsible sidebar, header, and content area
- **LandingTemplate** - Marketing/landing page with hero section and features
- **AuthTemplate** - Authentication pages with social login and form layouts

### Animation Controllers (3 Interactive Playgrounds)
Inspired by animejs.com:
- **AnimationController** - Full animation player with timeline, easing visualizer, property inspector, speed controls
- **StaggerDemo** - Interactive stagger animation demo with configurable delay and direction
- **TimelineBuilder** - Multi-element timeline with synchronized animations

### Core Components (Material Design 3 Legacy)

#### Button
Material Design 3 button with multiple variants and states.

```tsx
<Button variant="filled" size="md" leftIcon={<Icon />} isLoading={false}>
  Click Me
</Button>
```

**Variants:** `filled` | `filled-tonal` | `outlined` | `text` | `elevated`  
**Sizes:** `sm` | `md` | `lg`

#### Card
Compound component for flexible card layouts.

```tsx
<Card variant="elevated" padding="md">
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>Content</CardContent>
  <CardFooter>Actions</CardFooter>
</Card>
```

**Variants:** `filled` | `elevated` | `outlined`  
**Padding:** `none` | `sm` | `md` | `lg`

#### Input
Accessible form input with validation support.

```tsx
<Input
  label="Email"
  type="email"
  variant="outlined"
  error="Invalid email"
  leftIcon={<Mail />}
/>
```

**Variants:** `filled` | `outlined`

#### StatusIndicator
Dynamic status badges with icons and pulse animation.

```tsx
<StatusIndicator status="running" pulse />
<StatusIndicator status="completed" label="Workflow Complete" />
<StatusIndicator status="error" size="lg" />
```

**Status Types:** `running` | `paused` | `stopped` | `completed` | `error` | `pending` | `idle`  
**Sizes:** `sm` | `md` | `lg`  
**Features:** Animated pulse, custom icons, color-coded

#### ProgressIndicator
Show progress of tasks and workflows.

```tsx
<ProgressIndicator value={75} variant="success" showLabel />
<CircularProgress value={60} size="lg" showValue />
```

**Variants:** `default` | `success` | `warning` | `error`  
**Types:** Linear, Circular  
**Features:** Animated, customizable colors

#### Badge
Semantic status indicators.

```tsx
<Badge variant="success">Active</Badge>
```

**Variants:** `primary` | `secondary` | `tertiary` | `success` | `warning` | `error` | `outline`

#### Avatar
User profile images with fallback initials.

```tsx
<Avatar name="John Doe" src="/avatar.jpg" size="md" />
```

**Sizes:** `sm` | `md` | `lg` | `xl`

#### StatCard
Dashboard statistics display.

```tsx
<StatCard
  title="Total Users"
  value="2,543"
  change="+12.5%"
  trend="up"
  icon={Users}
/>
```

### Layout Components

#### DashboardShell
Unified layout for admin and client dashboards.

```tsx
<DashboardShell mode="admin">
  {/* Your content */}
</DashboardShell>
```

**Features:**
- Collapsible sidebar
- Role-based navigation
- Search functionality
- User profile section
- Dark mode toggle
- Responsive design

### Workflow Components

#### WorkflowList
Panel list displaying workflows with controls and stats.

```tsx
<WorkflowList
  workflows={workflowData}
  onPlay={handlePlay}
  onPause={handlePause}
  onStop={handleStop}
  onDelete={handleDelete}
  onEdit={handleEdit}
  showQuickStats
/>
```

**Features:**
- Individual workflow items with status
- Play/Pause/Stop/Delete controls
- Progress indicators
- Expandable quick stats accordion
- Gear icon for editing
- Real-time status updates

#### WorkflowListItem
Single workflow item with full controls.

```tsx
<WorkflowListItem
  workflow={{
    id: 'workflow-1',
    name: 'Data Mining Workflow',
    status: 'running',
    currentStep: 3,
    totalSteps: 5,
    successRate: 94
  }}
  onPlay={handlePlay}
  showQuickStats
/>
```

**Features:**
- Status indicator with pulse animation
- Progress bar for running workflows
- Scheduled/last run metadata
- Action buttons contextual to status
- Bottom stats accordion

#### Wizard
Multi-step wizard for workflow creation.

```tsx
<Wizard
  title="Create Workflow"
  steps={wizardSteps}
  activeStepId="step1"
  onStepChange={setActiveStep}
>
  <WizardContent stepId="step1">
    {/* Step 1 content */}
  </WizardContent>
  <WizardContent stepId="step2">
    {/* Step 2 content */}
  </WizardContent>
</Wizard>
```

**Features:**
- Step navigation with status
- Progress tracking
- Contextual step descriptions
- Flexible content areas
- Action buttons per step

#### PromptInput
Claude-inspired AI prompt input.

```tsx
<PromptInput
  onSend={handlePromptSend}
  loading={generating}
  aiModel="deepseek-r1"
  supportedModels={['deepseek-r1', 'gpt-4']}
  maxLength={2000}
  showExamples
/>
```

**Features:**
- Auto-resizing textarea
- AI model selector
- Character counter
- Example prompts
- Keyboard shortcuts (Cmd/Ctrl+Enter)
- Attachment buttons (UI only)
- Loading states

#### WorkflowPanel
Container for workflow displays.

```tsx
<WorkflowPanel
  title="Active Workflows"
  description="Currently running"
  status="info"
  actions={<Button>View All</Button>}
>
  {/* Workflow content */}
</WorkflowPanel>
```

**Status Variants:** `default` | `info` | `success` | `warning` | `error`  
**Emphasis:** `normal` | `elevated` | `subtle`

#### NotImplemented
Wrapper for features not yet built.

```tsx
<NotImplemented reason="Scheduling coming soon">
  <Button>Schedule Workflow</Button>
</NotImplemented>

<NotImplementedWrapper isImplemented={false}>
  <FeatureComponent />
</NotImplementedWrapper>
```

**Features:**
- Grays out content
- Overlay with message
- Disables interactions
- Subtle or prominent variants
- Conditional rendering

## 🎨 Design Tokens

### Colors

```tsx
// Primary
bg-primary text-on-primary

// Secondary
bg-secondary text-on-secondary

// Surface
bg-surface bg-surface-container-* text-on-surface

// Semantic
bg-success bg-warning bg-error
```

### Typography

Material Design 3 type scale:

```tsx
// Display (hero text)
text-display-lg text-display-md text-display-sm

// Headline (page titles)
text-headline-lg text-headline-md text-headline-sm

// Title (section headers)
text-title-lg text-title-md text-title-sm

// Body (content)
text-body-lg text-body-md text-body-sm

// Label (UI elements)
text-label-lg text-label-md text-label-sm
```

### Elevation

```tsx
shadow-level-1  // Subtle elevation
shadow-level-2  // Moderate elevation
shadow-level-3  // High elevation
shadow-level-4  // Higher elevation
shadow-level-5  // Highest elevation

shadow-glow     // Special glow effect
shadow-glow-lg  // Larger glow effect
```

### Spacing

8px grid system:

```tsx
p-4   // 16px
m-6   // 24px
gap-8 // 32px

// Extended scale
p-18  // 72px
m-88  // 352px
```

### Border Radius

Material Design 3 shape scale:

```tsx
rounded-xs   // 4px - Small components
rounded-sm   // 8px - Buttons, inputs
rounded-md   // 12px - Cards
rounded-lg   // 16px - Large cards
rounded-xl   // 28px - Dialogs
rounded-full // Pill shape
```

## 🎭 Animations

Material Design 3 motion system:

```tsx
// Duration
duration-short-1  // 50ms
duration-short-2  // 100ms
duration-short-3  // 150ms
duration-short-4  // 200ms
duration-medium-1 // 250ms
duration-medium-2 // 300ms
duration-medium-3 // 350ms
duration-medium-4 // 400ms
duration-long-1   // 450ms
duration-long-2   // 500ms

// Easing
ease-emphasized   // Primary easing
ease-standard     // Secondary easing
```

## 📱 Responsive Design

Mobile-first breakpoints:

```tsx
sm: '640px'   // Small tablets
md: '768px'   // Tablets
lg: '1024px'  // Laptops
xl: '1280px'  // Desktops
2xl: '1536px' // Large screens
```

## ♿ Accessibility

All components follow WCAG 2.1 AA standards:

- Semantic HTML
- ARIA labels and roles
- Keyboard navigation
- Focus indicators
- Color contrast ratios
- Screen reader support
- Touch target sizes (44x44px minimum)

## 🛠️ Utilities

### cn() - Class Name Utility

Merge Tailwind classes with proper precedence:

```tsx
import { cn } from '@/lib/utils';

<div className={cn('base-class', condition && 'conditional', className)} />
```

### Helper Functions

```tsx
import { 
  formatNumber,      // Format numbers with separators
  formatCurrency,    // Format currency values
  truncateText,      // Truncate text with ellipsis
  getInitials,       // Get initials from name
  generateId,        // Generate random ID
} from '@/lib/utils';
```

## 📋 Component Patterns

### Compound Components

```tsx
<Card>
  <Card.Header>
    <Card.Title>Title</Card.Title>
  </Card.Header>
  <Card.Content>Content</Card.Content>
  <Card.Footer>Footer</Card.Footer>
</Card>
```

### Variant Props (CVA)

```tsx
const buttonVariants = cva('base-classes', {
  variants: {
    variant: { filled: '...', outlined: '...' },
    size: { sm: '...', md: '...', lg: '...' }
  },
  defaultVariants: {
    variant: 'filled',
    size: 'md'
  }
});
```

### Polymorphic Components

```tsx
<Text as="p">Paragraph</Text>
<Text as="h1">Heading</Text>
<Text as={Link} to="/path">Link</Text>
```

## 🔄 Migration Guide

### From Old Components

```tsx
// Old
import { EnhancedButton } from '@/components/DesignSystemComponents';
<EnhancedButton variant="primary">Click</EnhancedButton>

// New
import { Button } from '@/components/ui';
<Button variant="filled">Click</Button>
```

### From Ant Design

```tsx
// Old
import { Button as AntButton } from 'antd';
<AntButton type="primary">Click</AntButton>

// New
import { Button } from '@/components/ui';
<Button variant="filled">Click</Button>
```

## 📁 File Structure

```
src/
├── lib/
│   └── utils.ts              # Utility functions
├── components/
│   └── ui/
│       ├── Button.tsx        # Button component
│       ├── Card.tsx          # Card component
│       ├── Input.tsx         # Input component
│       ├── Badge.tsx         # Badge component
│       ├── Avatar.tsx        # Avatar component
│       ├── StatCard.tsx      # StatCard component
│       └── index.ts          # Component exports
├── pages/
│   ├── auth/
│   │   └── LoginPage.tsx     # Login page
│   ├── admin/
│   │   └── AdminDashboard.tsx
│   ├── client/
│   │   └── ClientDashboard.tsx
│   └── DashboardShell.tsx    # Unified layout
└── App.tsx                   # Main app with routing
```

## 🎯 Best Practices

1. **Use Semantic HTML** - Always use appropriate HTML elements
2. **Follow Composition** - Prefer composition over prop drilling
3. **Keep Components Small** - Single responsibility principle
4. **Use TypeScript** - Type-safe component props
5. **Accessibility First** - WCAG 2.1 AA compliance
6. **Mobile First** - Responsive design approach
7. **Performance** - Optimize re-renders and bundle size

## 🧪 Testing

```tsx
import { render, screen } from '@testing-library/react';
import { Button } from '@/components/ui';

test('renders button with text', () => {
  render(<Button>Click me</Button>);
  expect(screen.getByText('Click me')).toBeInTheDocument();
});
```

## 📊 Performance

- **Bundle Size**: Optimized with tree-shaking
- **Animations**: 60fps with GPU acceleration
- **Lazy Loading**: Code splitting for routes
- **Memoization**: React.memo for expensive components

## 🤝 Contributing

When adding new components:

1. Follow Material Design 3 specifications
2. Use CVA for variant management
3. Include TypeScript types
4. Add accessibility features
5. Write tests
6. Document usage

## 📖 Resources

- [Material Design 3](https://m3.material.io/)
- [Tailwind CSS](https://tailwindcss.com/)
- [CVA Documentation](https://cva.style/docs)
- [React Aria](https://react-spectrum.adobe.com/react-aria/)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

## 📝 License

Part of the LightDom platform. See LICENSE file for details.

---

**Built with ❤️ following Material Design 3 principles**
