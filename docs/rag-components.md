# RAG Prompt Response Workflow UI Components

## Overview

This documentation describes a comprehensive set of atom components designed for RAG (Retrieval-Augmented Generation) prompt response workflow UIs. These components provide a modern, professional interface for displaying AI-generated responses with interactive controls for feedback, copying, and retry functionality.

## Components

### BotReplyBox

The main container component for displaying bot responses with status indicators, location information, and interactive controls.

#### Features
- Status indicators (success, error, pending, processing, warning)
- Repository/task location information
- List items/categories display
- Interactive controls (feedback, copy, try again)
- Processing state with busy indicator
- Customizable bot icon and title

#### Usage

```tsx
import { BotReplyBox } from '@/components/atoms/rag';

<BotReplyBox
  status="success"
  content="Task completed successfully!"
  location={{
    repo: 'owner/repo',
    task: '#123: Feature implementation',
    branch: 'feature/new-feature'
  }}
  listItems={[
    { id: '1', label: 'Item 1', description: 'Description' },
    { id: '2', label: 'Item 2', description: 'Description' }
  ]}
  onFeedback={(value) => console.log('Feedback:', value)}
  onCopy={() => console.log('Copied')}
  onRetry={() => console.log('Retrying')}
/>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| status | `'success' \| 'error' \| 'pending' \| 'processing' \| 'warning'` | `'success'` | Status of the reply |
| content | `ReactNode` | required | Main reply content |
| location | `{ repo?: string; task?: string; branch?: string }` | - | Location information |
| listItems | `Array<{ id: string; label: string; description?: string; icon?: ReactNode }>` | - | List items to display |
| showFeedback | `boolean` | `true` | Show feedback controls |
| showCopy | `boolean` | `true` | Show copy control |
| showTryAgain | `boolean` | `true` | Show try again control |
| isProcessing | `boolean` | `false` | Show busy indicator |
| processingMessage | `string` | - | Message during processing |

---

### AccordionItem

An expandable accordion component with support for nested accordions, icons, and badges.

#### Features
- Multiple visual variants (default, bordered, flat)
- Size options (sm, md, lg)
- Icon and badge support
- Nested accordion support
- Controlled and uncontrolled modes

#### Usage

```tsx
import { AccordionItem } from '@/components/atoms/rag';

<AccordionItem
  title="Campaign Services"
  icon={<Package />}
  badge={<span>5 services</span>}
  defaultExpanded={false}
>
  <p>Accordion content goes here</p>
  
  {/* Nested accordion */}
  <AccordionItem
    title="Sub-item"
    variant="bordered"
    size="sm"
  >
    <p>Nested content</p>
  </AccordionItem>
</AccordionItem>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| title | `string \| ReactNode` | required | Accordion title/header |
| children | `ReactNode` | required | Content when expanded |
| defaultExpanded | `boolean` | `false` | Initially expanded |
| expanded | `boolean` | - | Controlled expanded state |
| onExpandedChange | `(expanded: boolean) => void` | - | Callback on state change |
| icon | `ReactNode` | - | Icon in header |
| badge | `ReactNode` | - | Badge in header |
| variant | `'default' \| 'bordered' \| 'flat'` | `'default'` | Visual variant |
| size | `'sm' \| 'md' \| 'lg'` | `'md'` | Size variant |

---

### FeedbackControl

Thumbs up/down feedback controls for rating responses.

#### Features
- Toggle behavior (click again to clear)
- Size variants
- Optional labels
- Visual feedback on selection
- Disabled state support

#### Usage

```tsx
import { FeedbackControl } from '@/components/atoms/rag';

<FeedbackControl
  size="md"
  showLabels={true}
  onChange={(value) => console.log('Feedback:', value)}
/>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| value | `'positive' \| 'negative' \| null` | `null` | Current feedback value |
| onChange | `(value: FeedbackValue) => void` | - | Callback on change |
| size | `'sm' \| 'md' \| 'lg'` | `'md'` | Size variant |
| showLabels | `boolean` | `false` | Show text labels |
| disabled | `boolean` | `false` | Disable controls |

---

### CopyControl

Button to copy content to clipboard with visual feedback.

#### Features
- Multiple display variants (icon, text, both)
- Success animation
- Configurable success duration
- Size variants

#### Usage

```tsx
import { CopyControl } from '@/components/atoms/rag';

<CopyControl
  content="Text to copy"
  variant="both"
  size="md"
  onCopySuccess={() => console.log('Copied!')}
/>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| content | `string` | required | Content to copy |
| variant | `'icon' \| 'text' \| 'both'` | `'icon'` | Display variant |
| size | `'sm' \| 'md' \| 'lg'` | `'md'` | Size variant |
| successDuration | `number` | `2000` | Success state duration (ms) |
| onCopySuccess | `() => void` | - | Callback after copy |

---

### TryAgainControl

Retry control with optional AI model selection dropdown.

#### Features
- Exact retry (same model)
- Model selection dropdown
- Custom model list
- Loading state
- Size variants

#### Usage

```tsx
import { TryAgainControl } from '@/components/atoms/rag';

<TryAgainControl
  showModelSelector={true}
  selectedModel="gpt-4"
  models={[
    { id: 'gpt-4', name: 'GPT-4', description: 'OpenAI model' },
    { id: 'claude-3', name: 'Claude 3', description: 'Anthropic model' }
  ]}
  onRetry={() => console.log('Retry same')}
  onRetryWithModel={(model) => console.log('Retry with', model)}
/>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| models | `Array<{ id: string; name: string; description?: string }>` | Default models | Available models |
| selectedModel | `string` | - | Currently selected model |
| onRetry | `() => void` | - | Exact retry callback |
| onRetryWithModel | `(modelId: string) => void` | - | Retry with model callback |
| showModelSelector | `boolean` | `true` | Show dropdown |
| size | `'sm' \| 'md' \| 'lg'` | `'md'` | Size variant |
| isLoading | `boolean` | `false` | Loading state |

---

### BusyIndicator

Loading/processing indicator with multiple animation variants.

#### Features
- Three animation variants (spinner, pulse, dots)
- Optional message display
- Size variants
- Accessible with ARIA labels

#### Usage

```tsx
import { BusyIndicator } from '@/components/atoms/rag';

<BusyIndicator
  variant="dots"
  size="md"
  message="Processing your request..."
/>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| size | `'sm' \| 'md' \| 'lg'` | `'md'` | Size variant |
| message | `string` | - | Display message |
| variant | `'spinner' \| 'pulse' \| 'dots'` | `'spinner'` | Animation type |

---

### AddButton

Action button with optional description, ideal for adding items or triggering actions.

#### Features
- Primary, secondary, and outlined variants
- Optional description text
- Custom icon support
- Size variants
- Full width option

#### Usage

```tsx
import { AddButton } from '@/components/atoms/rag';

<AddButton
  label="Add Service"
  description="Deploy a new microservice"
  variant="primary"
  size="md"
  onClick={() => console.log('Add clicked')}
/>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| label | `string` | `'Add'` | Button text |
| description | `string` | - | Bonus action description |
| icon | `ReactNode` | Plus icon | Custom icon |
| size | `'sm' \| 'md' \| 'lg'` | `'md'` | Size variant |
| variant | `'primary' \| 'secondary' \| 'outlined'` | `'primary'` | Visual variant |
| fullWidth | `boolean` | `false` | Full width button |

---

## Design System Integration

All components follow Material Design 3 principles and integrate seamlessly with the existing LightDom design system:

- **Color tokens**: Uses semantic color tokens (primary, on-surface, etc.)
- **Typography**: Consistent font sizes and weights
- **Spacing**: 4px grid system
- **Animations**: Smooth transitions (200ms duration)
- **Accessibility**: ARIA labels, keyboard navigation, focus indicators

## Theming

Components automatically adapt to your theme through Tailwind CSS utility classes:

```css
/* Example theme variables */
--color-primary: /* your primary color */;
--color-on-surface: /* your text color */;
--color-surface: /* your surface color */;
```

## Storybook Integration

All components have comprehensive Storybook stories located in `src/stories/atoms/rag/`:

- `BotReplyBox.stories.tsx` - Main reply box variants
- `AccordionItem.stories.tsx` - Accordion examples including nested
- `FeedbackControl.stories.tsx` - Feedback control states
- `CopyControl.stories.tsx` - Copy functionality variants
- `TryAgainControl.stories.tsx` - Retry with model selection
- `BusyIndicator.stories.tsx` - Loading animations
- `AddButton.stories.tsx` - Action button variants

### Running Storybook

```bash
npm run storybook
```

Visit `http://localhost:6006` to view all component stories.

## Examples

### Complete RAG Workflow UI

```tsx
import {
  BotReplyBox,
  AccordionItem,
  AddButton
} from '@/components/atoms/rag';

function RAGWorkflowUI() {
  return (
    <div className="space-y-4">
      {/* Bot response */}
      <BotReplyBox
        status="success"
        content="I've analyzed your request and created the following components:"
        location={{
          repo: 'owner/repo',
          task: '#42: Add RAG UI',
          branch: 'feature/rag-ui'
        }}
        listItems={[
          { id: '1', label: 'Component A', description: 'Main component' },
          { id: '2', label: 'Component B', description: 'Helper component' }
        ]}
        onFeedback={(value) => handleFeedback(value)}
        onRetry={() => handleRetry()}
      />

      {/* Expandable details */}
      <AccordionItem
        title="Campaign Details"
        icon={<Package />}
        badge={<span>3 services</span>}
      >
        <div className="space-y-2">
          <AccordionItem
            title="SEO Service"
            variant="bordered"
            size="sm"
          >
            <p>SEO configuration and settings</p>
          </AccordionItem>
          
          <AccordionItem
            title="Analytics Service"
            variant="bordered"
            size="sm"
          >
            <p>Analytics tracking setup</p>
          </AccordionItem>
        </div>
      </AccordionItem>

      {/* Action button */}
      <AddButton
        label="Add Service"
        description="Deploy a new service"
        onClick={handleAddService}
      />
    </div>
  );
}
```

### Conversation Flow

```tsx
import { BotReplyBox, BusyIndicator } from '@/components/atoms/rag';

function ConversationFlow({ messages, isGenerating }) {
  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <BotReplyBox
          key={message.id}
          status={message.status}
          content={message.content}
          listItems={message.items}
        />
      ))}
      
      {isGenerating && (
        <BusyIndicator
          variant="dots"
          message="Generating response..."
        />
      )}
    </div>
  );
}
```

## Extension Guide

### Creating Custom Variants

You can extend components with custom variants:

```tsx
import { BotReplyBox, type BotReplyBoxProps } from '@/components/atoms/rag';
import { cn } from '@/lib/utils';

function CustomBotReplyBox(props: BotReplyBoxProps) {
  return (
    <BotReplyBox
      {...props}
      className={cn(
        props.className,
        'border-2 border-primary shadow-lg'
      )}
      botIcon={
        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500">
          <Bot className="h-5 w-5 text-white" />
        </div>
      }
    />
  );
}
```

### Adding Custom Controls

Create new control components following the same patterns:

```tsx
import { cn } from '@/lib/utils';
import { Star } from 'lucide-react';

export function StarRating({ value, onChange }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((rating) => (
        <button
          key={rating}
          onClick={() => onChange(rating)}
          className={cn(
            'p-1 rounded hover:bg-surface-container-highest',
            value >= rating ? 'text-warning' : 'text-on-surface-variant'
          )}
        >
          <Star className={cn(
            'h-5 w-5',
            value >= rating && 'fill-current'
          )} />
        </button>
      ))}
    </div>
  );
}
```

## Best Practices

1. **Always provide feedback**: Use the feedback controls to gather user input
2. **Show processing states**: Display BusyIndicator when generating responses
3. **Use location info**: Help users understand context with repo/task information
4. **Organize with accordions**: Use nested accordions for hierarchical data
5. **Enable copy functionality**: Let users easily copy responses
6. **Offer retry options**: Give users ability to try different models
7. **Keep it accessible**: Maintain ARIA labels and keyboard navigation

## Browser Support

These components are tested and supported in:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

When adding new components:

1. Create the component in `src/components/atoms/rag/`
2. Export from `index.ts`
3. Add comprehensive Storybook stories
4. Update this documentation
5. Include TypeScript types
6. Follow existing patterns and conventions

## License

These components are part of the LightDom project and follow the project's license terms.
