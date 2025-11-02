# UI Component Library

## Structure

This directory contains the LightDom UI component library, organized using atomic design principles.

```
ui/
├── atoms/           # Foundational components (Button, Card, Badge, etc.)
├── molecules/       # Composed components (StatCard, NavigationItem, etc.)
├── design-system/   # Material Design 3 components
└── dashboard/       # Dashboard-specific components
```

## Quick Start

### Using Atoms

```tsx
import { Button, Card, Badge, Heading, Text } from '@/components/ui/atoms';

// Buttons
<Button variant="primary" size="md">Save</Button>
<IconButton icon={<SaveIcon />} variant="success" ariaLabel="Save" />

// Cards
<Card variant="elevated" padding="lg">
  <Heading level="h3">Title</Heading>
  <Text>Content goes here</Text>
</Card>

// Badges
<Badge variant="success" dot>Active</Badge>
<StatusBadge status="online" />
```

### Using Molecules

```tsx
import { StatCard, NavigationItem, InfoPanel } from '@/components/ui/molecules';

// Stat Cards
<StatCard
  label="Users"
  value="1,234"
  icon={<UsersIcon />}
  trend={{ direction: 'up', value: '12%' }}
/>

// Navigation
<NavigationItem
  label="Dashboard"
  icon={<DashboardIcon />}
  active={true}
/>

// Info Panels
<InfoPanel title="Status" status="active">
  <DetailRow label="API" value="Online" />
</InfoPanel>
```

## Component Categories

### Atoms (Building Blocks)
- **Button** - Interactive buttons with multiple variants
- **Card** - Content containers
- **Badge** - Labels and status indicators
- **Typography** - Text elements (Heading, Text, Label, Caption, Code)
- **Icon** - Icon wrappers and variants

### Molecules (Composite)
- **StatCard** - Statistics display with trend
- **NavigationItem** - Sidebar navigation items
- **InfoPanel** - Information display panel
- **DetailRow** - Label-value pairs

### Existing Components
- **LiveDataDisplay** - Real-time data components
- **LiveStatusIndicator** - Status indicators with live updates

## Design System

All components follow:
- Material Design 3 principles
- Tailwind CSS utility classes
- TypeScript for type safety
- Accessibility best practices
- Responsive design patterns

## Documentation

See [ATOMIC_COMPONENTS.md](../../../docs/ATOMIC_COMPONENTS.md) for detailed documentation, examples, and best practices.

## Contributing

When adding new components:

1. **Atoms** - Should be simple, single-purpose components
2. **Molecules** - Should combine 2-3 atoms into a functional unit
3. **Organisms** - Should be complex, feature-complete sections

Follow the existing patterns:
- Use class-variance-authority for variants
- Use cn() helper for className merging
- Export types for all props
- Use React.forwardRef for ref forwarding
- Document usage with JSDoc comments
