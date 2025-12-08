# RAG Components - Quick Reference

## Import

```tsx
import {
  BotReplyBox,
  AccordionItem,
  FeedbackControl,
  CopyControl,
  TryAgainControl,
  BusyIndicator,
  AddButton,
} from '@/components/atoms/rag';
```

## Quick Examples

### Basic Bot Reply

```tsx
<BotReplyBox
  status="success"
  content="Task completed!"
/>
```

### With Location & Items

```tsx
<BotReplyBox
  status="success"
  content="Created components successfully"
  location={{
    repo: 'owner/repo',
    task: '#123',
    branch: 'feature/x'
  }}
  listItems={[
    { id: '1', label: 'Item 1' },
    { id: '2', label: 'Item 2' }
  ]}
/>
```

### Processing State

```tsx
<BotReplyBox
  status="processing"
  isProcessing={true}
  processingMessage="Working on it..."
/>
```

### Accordion

```tsx
<AccordionItem title="Details">
  <p>Content here</p>
</AccordionItem>
```

### Nested Accordion

```tsx
<AccordionItem title="Parent">
  <AccordionItem title="Child" variant="bordered" size="sm">
    <p>Nested content</p>
  </AccordionItem>
</AccordionItem>
```

### Feedback

```tsx
<FeedbackControl
  onChange={(value) => console.log(value)}
/>
```

### Copy

```tsx
<CopyControl
  content="Text to copy"
  variant="both"
/>
```

### Try Again

```tsx
<TryAgainControl
  onRetry={() => retry()}
  onRetryWithModel={(model) => retryWith(model)}
/>
```

### Busy Indicator

```tsx
<BusyIndicator
  variant="dots"
  message="Loading..."
/>
```

### Add Button

```tsx
<AddButton
  label="Add Service"
  description="Deploy new service"
/>
```

## Status Colors

- `success` - Green
- `error` - Red
- `pending` - Orange
- `processing` - Blue
- `warning` - Yellow

## Size Options

All components support: `sm`, `md`, `lg`

## Variants

### BusyIndicator
- `spinner` - Rotating spinner
- `pulse` - Pulsing dot
- `dots` - Bouncing dots

### AccordionItem
- `default` - Card style
- `bordered` - Border only
- `flat` - Minimal style

### AddButton
- `primary` - Solid color
- `secondary` - Tonal
- `outlined` - Border only

### CopyControl
- `icon` - Icon only
- `text` - Text only
- `both` - Icon + text

## Common Props

### showFeedback, showCopy, showTryAgain
Control visibility of interactive elements in BotReplyBox

### disabled
Disable interaction (most components)

### className
Add custom Tailwind classes (all components)

### size
Control component size: `sm` | `md` | `lg`

## Callbacks

### onFeedback
`(value: 'positive' | 'negative' | null) => void`

### onCopy
`() => void`

### onRetry
`() => void`

### onRetryWithModel
`(modelId: string) => void`

### onExpandedChange
`(expanded: boolean) => void`

## Storybook

```bash
npm run storybook
```

Browse to: `http://localhost:6006`

Navigate to: **Atoms > RAG**

## File Locations

- **Components**: `src/components/atoms/rag/`
- **Stories**: `src/stories/atoms/rag/`
- **Docs**: `docs/rag-components.md`

## Tips

1. Use `isProcessing` with BotReplyBox for loading states
2. Nest AccordionItems for hierarchical data
3. Always provide meaningful feedback callbacks
4. Use location prop to show context
5. Combine components for rich UIs
6. Check Storybook for more examples
