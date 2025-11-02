# Copilot UI Components

VS Code GitHub Copilot-inspired interface components for LightDom.

## Overview

This component library recreates the clean, minimal aesthetic of VS Code's GitHub Copilot interface, featuring:

- Subtle borders and dividers
- Soft shadows
- Clean typography
- Monaco editor-inspired panels
- Smooth transitions
- Accessible design

## Components

### CopilotPanel

Main container component with optional header and footer.

```tsx
import { CopilotPanel } from '@/components/ui/copilot';

<CopilotPanel
  title="Code Assistant"
  subtitle="Get AI-powered suggestions"
  elevated
  headerAction={<Button>Action</Button>}
  footer={<div>Footer content</div>}
>
  Panel content
</CopilotPanel>
```

**Props:**
- `title?: string` - Panel title
- `subtitle?: string` - Panel subtitle
- `headerAction?: ReactNode` - Action buttons in header
- `footer?: ReactNode` - Footer content
- `elevated?: boolean` - Add subtle shadow

### CopilotDivider

Subtle horizontal divider with optional label.

```tsx
import { CopilotDivider } from '@/components/ui/copilot';

<CopilotDivider />
<CopilotDivider label="OR" />
<CopilotDivider variant="light" />
```

**Props:**
- `label?: string` - Optional label text
- `variant?: 'light' | 'default'` - Visual weight

### CopilotList & CopilotListItem

Clean list component with hover states and icons.

```tsx
import { CopilotList, CopilotListItem } from '@/components/ui/copilot';

<CopilotList>
  <CopilotListItem
    icon={<FileIcon />}
    title="component.tsx"
    description="Modified 2 minutes ago"
    action={<Button>View</Button>}
    active
    clickable
  />
</CopilotList>

// Or with items prop
<CopilotList items={[
  { icon: <Icon />, title: 'Item 1', description: 'Description' }
]} />
```

**CopilotListItem Props:**
- `icon?: ReactNode` - Leading icon
- `title: string` - Main text (required)
- `description?: string` - Secondary text
- `action?: ReactNode` - Trailing action
- `active?: boolean` - Active state styling
- `clickable?: boolean` - Add hover effects

### CopilotInput

Clean input field with icon support.

```tsx
import { CopilotInput } from '@/components/ui/copilot';

<CopilotInput
  label="Search"
  placeholder="Type to search..."
  leftIcon={<SearchIcon />}
  hint="Press Enter to search"
  error="This field is required"
/>
```

**Props:**
- `label?: string` - Field label
- `error?: string` - Error message
- `hint?: string` - Hint text
- `leftIcon?: ReactNode` - Left icon
- `rightIcon?: ReactNode` - Right icon

### CopilotTextarea

Multi-line input field.

```tsx
import { CopilotTextarea } from '@/components/ui/copilot';

<CopilotTextarea
  label="Description"
  placeholder="Enter description..."
  rows={4}
  hint="Be specific for better results"
/>
```

**Props:**
- `label?: string` - Field label
- `error?: string` - Error message
- `hint?: string` - Hint text
- All standard textarea attributes

### CopilotAccordion

Collapsible sections with smooth animations.

```tsx
import { CopilotAccordion } from '@/components/ui/copilot';

<CopilotAccordion
  allowMultiple
  items={[
    {
      id: 'section1',
      title: 'Code Suggestions',
      subtitle: '4 active suggestions',
      icon: <BulbIcon />,
      badge: <Badge>4</Badge>,
      content: <div>Content here</div>,
      defaultOpen: true,
    }
  ]}
/>
```

**Props:**
- `items: CopilotAccordionItemProps[]` - Accordion items
- `allowMultiple?: boolean` - Allow multiple open sections

**CopilotAccordionItemProps:**
- `id: string` - Unique identifier (required)
- `title: string` - Section title (required)
- `subtitle?: string` - Section subtitle
- `icon?: ReactNode` - Leading icon
- `badge?: ReactNode` - Badge or count
- `content: ReactNode` - Section content (required)
- `defaultOpen?: boolean` - Open by default

### CopilotButton

Clean button with variants.

```tsx
import { CopilotButton } from '@/components/ui/copilot';

<CopilotButton variant="primary">
  Generate Code
</CopilotButton>

<CopilotButton variant="secondary" size="sm" icon={<Icon />}>
  Action
</CopilotButton>

<CopilotButton variant="ghost">
  Cancel
</CopilotButton>
```

**Props:**
- `variant?: 'primary' | 'secondary' | 'ghost'` - Visual style
- `size?: 'sm' | 'md'` - Button size
- `icon?: ReactNode` - Button icon
- `iconPosition?: 'left' | 'right'` - Icon placement

### CopilotCodeBlock

Code display with syntax highlighting styling.

```tsx
import { CopilotCodeBlock } from '@/components/ui/copilot';

<CopilotCodeBlock
  language="TypeScript"
  code={`function hello() {
  console.log('Hello, world!');
}`}
  showLineNumbers
/>
```

**Props:**
- `language?: string` - Language label
- `code: string` - Code content (required)
- `showLineNumbers?: boolean` - Show line numbers

## Design Principles

### Colors
- **Borders:** `border-gray-200/60` - Subtle, semi-transparent
- **Backgrounds:** `bg-white`, `bg-gray-50/50` - Clean, light
- **Text:** `text-gray-900` (primary), `text-gray-500` (secondary)
- **Focus:** `border-blue-500`, `ring-blue-500` - Clear focus states

### Spacing
- **Tight spacing:** `gap-2` (8px), `gap-3` (12px) for compact layouts
- **Standard padding:** `px-4 py-3` for panels
- **Reduced padding:** `px-3 py-2` for list items

### Typography
- **Labels:** `text-xs` (12px), `font-medium`
- **Content:** `text-sm` (14px) for body text
- **Titles:** `text-sm` (14px), `font-semibold`

### Interactions
- **Transitions:** `duration-150` for smooth state changes
- **Hover states:** `hover:bg-gray-50/80` - Subtle backgrounds
- **Active states:** `bg-blue-50/50` - Tinted backgrounds
- **Focus rings:** `ring-2 ring-blue-500 ring-offset-2`

## Usage Patterns

### Suggestion Panel
```tsx
<CopilotPanel title="Code Suggestions" elevated>
  <CopilotInput
    placeholder="Describe what you want..."
    leftIcon={<SearchIcon />}
  />
  <CopilotDivider />
  <CopilotList items={suggestions} />
  <CopilotDivider />
  <CopilotButton variant="primary">Apply</CopilotButton>
</CopilotPanel>
```

### Settings Accordion
```tsx
<CopilotAccordion items={[
  {
    id: 'general',
    title: 'General Settings',
    icon: <SettingsIcon />,
    content: (
      <div className="space-y-3">
        <CopilotInput label="API Key" type="password" />
        <CopilotInput label="Model" />
      </div>
    ),
  }
]} />
```

### Code Review Panel
```tsx
<CopilotPanel
  title="Code Review"
  footer={
    <div className="flex gap-2">
      <CopilotButton variant="primary">Accept</CopilotButton>
      <CopilotButton variant="secondary">Modify</CopilotButton>
      <CopilotButton variant="ghost">Reject</CopilotButton>
    </div>
  }
>
  <CopilotCodeBlock
    language="TypeScript"
    code={generatedCode}
    showLineNumbers
  />
</CopilotPanel>
```

## Accessibility

All components include:
- ✅ Proper ARIA labels
- ✅ Keyboard navigation support
- ✅ Focus visible states
- ✅ Semantic HTML
- ✅ Color contrast compliance

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## Demo

See the live demo at `/admin/copilot-ui` in the admin dashboard.

## Contributing

When adding new Copilot-styled components:

1. Follow the established design patterns
2. Use the standard color palette
3. Maintain consistent spacing
4. Add TypeScript types
5. Include accessibility features
6. Update this documentation
