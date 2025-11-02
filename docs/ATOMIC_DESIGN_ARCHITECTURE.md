# Atomic Design Architecture for LightDom

## Overview

This document outlines the atomic design methodology implemented in the LightDom platform, following the principles established by Brad Frost. The architecture promotes reusability, consistency, and scalability across the entire application.

## Table of Contents

1. [Atomic Design Principles](#atomic-design-principles)
2. [Component Hierarchy](#component-hierarchy)
3. [Implementation Guidelines](#implementation-guidelines)
4. [Component Catalog](#component-catalog)
5. [State Management](#state-management)
6. [Best Practices](#best-practices)

---

## Atomic Design Principles

Atomic design is a methodology for creating design systems that breaks user interfaces into fundamental building blocks and combines them to form increasingly complex components.

### The Five Levels

```
Atoms → Molecules → Organisms → Templates → Pages
```

**1. Atoms** (Basic building blocks)
- Smallest functional units
- Cannot be broken down further
- Examples: Button, Input, Icon, Badge, Avatar

**2. Molecules** (Simple combinations of atoms)
- Groups of atoms functioning together
- Serve a single purpose
- Examples: SearchBar, StatCard, FormField

**3. Organisms** (Complex components)
- Groups of molecules and/or atoms
- Form distinct sections of an interface
- Examples: WorkflowPanel, Wizard, NavigationBar

**4. Templates** (Page layouts)
- Page-level layouts without real content
- Show component arrangement
- Examples: DashboardShell, WizardLayout

**5. Pages** (Specific instances of templates)
- Templates with real content
- Final product users interact with
- Examples: WorkflowDashboard, AdminDashboard

---

## Component Hierarchy

### Level 1: Atoms

Located in: `src/components/ui/`

#### Input Components
- **Button**: All button variants with icons and loading states
- **Input**: Text input with validation and icons
- **Checkbox**: Checkbox with label support
- **Radio**: Radio button component
- **Switch**: Toggle switch
- **Slider**: Range slider
- **Select**: Dropdown select

#### Display Components
- **Badge**: Status and label badges
- **Avatar**: User avatars with fallback initials
- **Icon**: Icon components from Lucide React
- **Divider**: Horizontal/vertical dividers
- **Spacer**: Spacing utilities
- **Skeleton**: Loading placeholders

#### Feedback Components
- **StatusIndicator**: Status badges with icons and animation
- **Progress**: Linear progress bars
- **CircularProgress**: Circular progress indicators
- **ProgressIndicator**: Enhanced progress with variants
- **LoadingSpinner**: Loading animations
- **Toast**: Toast notifications
- **Alert**: Alert messages

### Level 2: Molecules

Located in: `src/components/ui/`

#### Form Molecules
- **FormField**: Label + Input + ErrorMessage
- **SearchBar**: Input + Search Icon + Clear Button
- **PromptInput**: Enhanced textarea with AI model selector and send button

#### Display Molecules
- **StatCard**: Icon + Title + Value + Trend indicator
- **Card**: Header + Content + Footer compound component
- **Modal**: Header + Content + Footer modal dialog
- **Tooltip**: Content + trigger tooltip

### Level 3: Organisms

Located in: `src/components/ui/` and `src/components/workflow/`

#### Workflow Organisms
- **WorkflowList**: List of workflow items with actions
- **WorkflowListItem**: Individual workflow with controls and stats
- **WorkflowPanel**: Panel for workflow display with sections
- **Wizard**: Multi-step wizard with navigation
- **WorkflowDiagramView**: Interactive Mermaid diagrams

#### Dashboard Organisms
- **DashboardShell**: Complete dashboard layout with sidebar
- **NavigationBar**: Top or side navigation
- **Sidebar**: Collapsible sidebar with menu items

#### Utility Organisms
- **NotImplemented**: Wrapper for unfinished features
- **NotImplementedWrapper**: Conditional not-implemented state

### Level 4: Templates

Located in: `src/pages/`

#### Dashboard Templates
- **DashboardShell**: Base layout for all dashboards
  - Sidebar + Header + Content area
  - Role-based navigation
  - Theme toggle

#### Workflow Templates
- **WizardLayout**: Multi-step wizard layout
  - Step navigation + Content + Actions
  - Progress indicator

### Level 5: Pages

Located in: `src/pages/`

#### Workflow Pages
- **EnhancedWorkflowDashboard**: Complete workflow management
  - Workflow list with filters
  - Create workflow wizard
  - Real-time status updates

#### Admin Pages
- **AdminDashboard**: Admin interface (existing)
- **ClientDashboard**: Client interface (existing)

---

## Implementation Guidelines

### Naming Conventions

```typescript
// Atoms: Single word, descriptive
Button.tsx
Input.tsx
Badge.tsx

// Molecules: Descriptive phrase
FormField.tsx
SearchBar.tsx
StatCard.tsx

// Organisms: Descriptive phrase with context
WorkflowPanel.tsx
NavigationBar.tsx
DashboardHeader.tsx

// Templates: Layout suffix
DashboardShell.tsx
WizardLayout.tsx

// Pages: Page suffix
WorkflowDashboard.tsx
AdminDashboard.tsx
```

### File Structure

```
src/
├── components/
│   └── ui/                    # Atoms, Molecules, and some Organisms
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── FormField.tsx
│       ├── WorkflowPanel.tsx
│       └── index.ts
│   └── workflow/              # Domain-specific Organisms
│       ├── WorkflowList.tsx
│       ├── WorkflowWizard.tsx
│       └── index.ts
├── pages/                     # Templates and Pages
│   ├── DashboardShell.tsx
│   └── workflow/
│       └── EnhancedWorkflowDashboard.tsx
└── lib/
    └── utils.ts               # Utility functions
```

### Component Template

```typescript
import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// Define variants using CVA
const componentVariants = cva(
  'base-classes-here',
  {
    variants: {
      variant: {
        default: 'variant-classes',
        primary: 'variant-classes',
      },
      size: {
        sm: 'size-classes',
        md: 'size-classes',
        lg: 'size-classes',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

// Props interface extending HTML attributes + variants
export interface ComponentProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof componentVariants> {
  customProp?: string;
}

// Component with forwardRef for ref support
export const Component = React.forwardRef<HTMLElement, ComponentProps>(
  ({ variant, size, className, children, customProp, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(componentVariants({ variant, size }), className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Component.displayName = 'Component';

export default Component;
```

---

## Component Catalog

### Workflow Components

#### StatusIndicator (Atom)

**Purpose**: Display workflow/task status with icon and animation

**Props**:
```typescript
{
  status: 'running' | 'paused' | 'stopped' | 'completed' | 'error' | 'pending' | 'idle';
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  showIcon?: boolean;
  pulse?: boolean;
}
```

**Usage**:
```tsx
<StatusIndicator status="running" pulse />
<StatusIndicator status="completed" label="Workflow Complete" />
```

#### ProgressIndicator (Atom)

**Purpose**: Show progress of tasks/workflows

**Variants**:
- Linear progress bar
- Circular progress indicator

**Props**:
```typescript
{
  value: number;        // 0-100
  max?: number;
  variant?: 'default' | 'success' | 'warning' | 'error';
  showLabel?: boolean;
  animated?: boolean;
}
```

**Usage**:
```tsx
<ProgressIndicator value={75} max={100} variant="success" />
<CircularProgress value={60} size="lg" showValue />
```

#### PromptInput (Molecule)

**Purpose**: Claude-inspired AI prompt input

**Features**:
- Auto-resizing textarea
- Model selection dropdown
- Character count
- Example prompts
- Keyboard shortcuts (Cmd/Ctrl+Enter)

**Props**:
```typescript
{
  onSend?: (value: string) => void;
  loading?: boolean;
  maxLength?: number;
  aiModel?: string;
  supportedModels?: string[];
  showExamples?: boolean;
}
```

**Usage**:
```tsx
<PromptInput
  onSend={handlePromptSend}
  loading={generating}
  aiModel="deepseek-r1"
  showExamples
/>
```

#### WorkflowListItem (Organism)

**Purpose**: Individual workflow item with controls

**Features**:
- Status indicator
- Play/Pause/Stop/Delete buttons
- Progress display
- Edit button (gear icon)
- Expandable quick stats accordion

**Props**:
```typescript
{
  workflow: WorkflowItemData;
  onPlay?: (id: string) => void;
  onPause?: (id: string) => void;
  onStop?: (id: string) => void;
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
  showQuickStats?: boolean;
  isImplemented?: boolean;
}
```

**Usage**:
```tsx
<WorkflowListItem
  workflow={workflowData}
  onPlay={handlePlay}
  onPause={handlePause}
  showQuickStats
/>
```

#### NotImplemented (Utility Organism)

**Purpose**: Wrapper for features not yet implemented

**Features**:
- Grays out content
- Shows overlay with message
- Disables interactions
- Subtle or prominent variants

**Props**:
```typescript
{
  children: React.ReactNode;
  reason?: string;
  showOverlay?: boolean;
  variant?: 'subtle' | 'prominent';
}
```

**Usage**:
```tsx
<NotImplemented reason="Scheduling feature coming soon">
  <Button>Schedule Workflow</Button>
</NotImplemented>

<NotImplementedWrapper isImplemented={false} reason="Coming Soon">
  <FeatureComponent />
</NotImplementedWrapper>
```

---

## State Management

### Component State Patterns

#### Local State
Use `useState` for component-specific state:
```typescript
const [isOpen, setIsOpen] = useState(false);
const [value, setValue] = useState('');
```

#### Shared State
Use Context API for shared state across components:
```typescript
const WorkflowContext = createContext<WorkflowContextValue | null>(null);

export const useWorkflow = () => {
  const context = useContext(WorkflowContext);
  if (!context) {
    throw new Error('useWorkflow must be used within WorkflowProvider');
  }
  return context;
};
```

#### Not Implemented State
Use standardized approach:
```typescript
interface ComponentState {
  isImplemented: boolean;
  mockDataEnabled?: boolean;
  disabledReason?: string;
}

// In component
<Component 
  disabled={!isImplemented}
  className={cn({ 'opacity-50': !isImplemented })}
/>
```

---

## Best Practices

### 1. Component Composition

**DO**: Build complex components from simpler ones
```tsx
<Card>
  <Card.Header>
    <Card.Title>Title</Card.Title>
  </Card.Header>
  <Card.Content>
    <StatusIndicator status="running" />
    <ProgressIndicator value={50} />
  </Card.Content>
</Card>
```

**DON'T**: Create monolithic components
```tsx
// Avoid this - too much in one component
<ComplexCardWithEverything 
  title="Title"
  status="running"
  progress={50}
  // 20 more props...
/>
```

### 2. Prop Drilling

**DO**: Use Context for deeply nested state
```tsx
<WizardProvider value={wizardState}>
  <Wizard>
    <WizardStep>
      <WizardContent /> {/* Can access wizard state */}
    </WizardStep>
  </Wizard>
</WizardProvider>
```

**DON'T**: Pass props through many levels
```tsx
<Parent data={data}>
  <Child data={data}>
    <GrandChild data={data}>
      <GreatGrandChild data={data} />
    </GrandChild>
  </Child>
</Parent>
```

### 3. Variants Over Props

**DO**: Use variant system
```tsx
<Button variant="filled" size="lg">Click</Button>
<Badge variant="success">Active</Badge>
```

**DON'T**: Use boolean flags
```tsx
<Button isPrimary isLarge>Click</Button>
<Badge isSuccess>Active</Badge>
```

### 4. TypeScript Types

**DO**: Export types for consumers
```typescript
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'filled' | 'outlined' | 'text';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = (props) => { ... };
```

**DON'T**: Use `any` types
```typescript
export const Button = (props: any) => { ... }; // Avoid
```

### 5. Accessibility

**DO**: Include ARIA attributes
```tsx
<button
  aria-label="Close modal"
  aria-pressed={isActive}
  role="button"
>
  <Icon />
</button>
```

**DON'T**: Forget keyboard navigation
```tsx
<div onClick={handleClick}>Clickable</div> // Not keyboard accessible
```

### 6. Performance

**DO**: Memoize expensive computations
```tsx
const memoizedValue = useMemo(() => expensiveComputation(data), [data]);
const memoizedCallback = useCallback(() => doSomething(), []);
```

**DON'T**: Create functions in render
```tsx
<Button onClick={() => handleClick(id)}>Click</Button> // Re-creates on every render
```

---

## Component Testing Checklist

For each component, ensure:

- [ ] TypeScript types defined and exported
- [ ] Variants tested (if applicable)
- [ ] Responsive design (mobile, tablet, desktop)
- [ ] Dark mode support
- [ ] Keyboard navigation
- [ ] Screen reader compatibility
- [ ] Loading states
- [ ] Error states
- [ ] Empty states
- [ ] Documentation with examples
- [ ] Storybook story (if applicable)

---

## Migration Path

### From Legacy Components

1. **Identify** the legacy component
2. **Map** to atomic design level (atom, molecule, organism)
3. **Refactor** using CVA and cn utility
4. **Add** TypeScript types
5. **Test** thoroughly
6. **Update** imports across codebase
7. **Deprecate** old component

### Example Migration

```typescript
// Old component
import { EnhancedButton } from '@/components/DesignSystemComponents';

<EnhancedButton variant="primary" onClick={handleClick}>
  Click Me
</EnhancedButton>

// New component
import { Button } from '@/components/ui';

<Button variant="filled" onClick={handleClick}>
  Click Me
</Button>
```

---

## Resources

- [Atomic Design Book](https://atomicdesign.bradfrost.com/)
- [Material Design 3](https://m3.material.io/)
- [CVA Documentation](https://cva.style/docs)
- [Tailwind CSS](https://tailwindcss.com/)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)

---

**Document Version**: 1.0.0  
**Last Updated**: 2025-11-02  
**Maintained By**: LightDom Development Team
