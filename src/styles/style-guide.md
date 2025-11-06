# LightDom Design System - Style Guide

## Overview

The LightDom Design System provides a comprehensive set of design tokens, components, and utilities to ensure consistency across all pages and components in the LightDom Space Harvester platform.

## Design Principles

1. **Consistency**: All components follow the same visual language and interaction patterns
2. **Accessibility**: Components are built with accessibility in mind, supporting keyboard navigation and screen readers
3. **Performance**: Optimized animations and transitions that respect user preferences
4. **Scalability**: Easy to extend and customize for different use cases
5. **Modern**: Clean, contemporary design that feels professional and trustworthy

## Color Palette

### Primary Colors
- **Primary 50-950**: Blue gradient from light to dark
- **Usage**: Primary actions, links, focus states, brand elements

### Secondary Colors  
- **Secondary 50-950**: Purple gradient from light to dark
- **Usage**: Accent elements, highlights, secondary actions

### Semantic Colors
- **Success**: `#10b981` (Emerald) - Success states, positive feedback
- **Warning**: `#f59e0b` (Amber) - Warning states, caution
- **Error**: `#f43f5e` (Rose) - Error states, destructive actions
- **Info**: `#0ea5e9` (Blue) - Information, neutral states

### Neutral Colors
- **Neutral 50-950**: Gray scale from white to black
- **Usage**: Text, backgrounds, borders, subtle elements

## Typography

### Font Families
- **Sans**: Inter, Segoe UI, Roboto, Helvetica Neue, Arial
- **Mono**: JetBrains Mono, Fira Code, Consolas, Monaco
- **Display**: Poppins, Inter (for headings and large text)

### Font Sizes
- **xs**: 0.75rem (12px) - Small labels, captions
- **sm**: 0.875rem (14px) - Body text, form labels
- **base**: 1rem (16px) - Default body text
- **lg**: 1.125rem (18px) - Large body text
- **xl**: 1.25rem (20px) - Small headings
- **2xl**: 1.5rem (24px) - Medium headings
- **3xl**: 1.875rem (30px) - Large headings
- **4xl**: 2.25rem (36px) - Extra large headings
- **5xl**: 3rem (48px) - Display headings
- **6xl**: 3.75rem (60px) - Hero headings

### Font Weights
- **Thin**: 100 - Very light text
- **Light**: 300 - Light text
- **Normal**: 400 - Regular text
- **Medium**: 500 - Medium text
- **Semibold**: 600 - Semi-bold text
- **Bold**: 700 - Bold text
- **Extrabold**: 800 - Extra bold text
- **Black**: 900 - Black text

## Spacing

### Spacing Scale
- **0**: 0 - No spacing
- **px**: 1px - Hairline spacing
- **0.5**: 0.125rem (2px) - Very small spacing
- **1**: 0.25rem (4px) - Small spacing
- **2**: 0.5rem (8px) - Small-medium spacing
- **3**: 0.75rem (12px) - Medium spacing
- **4**: 1rem (16px) - Default spacing
- **6**: 1.5rem (24px) - Large spacing
- **8**: 2rem (32px) - Extra large spacing
- **12**: 3rem (48px) - Very large spacing
- **16**: 4rem (64px) - Huge spacing
- **20**: 5rem (80px) - Massive spacing
- **24**: 6rem (96px) - Enormous spacing

## Border Radius

- **none**: 0 - No rounding
- **sm**: 0.125rem (2px) - Small rounding
- **base**: 0.25rem (4px) - Default rounding
- **md**: 0.375rem (6px) - Medium rounding
- **lg**: 0.5rem (8px) - Large rounding
- **xl**: 0.75rem (12px) - Extra large rounding
- **2xl**: 1rem (16px) - Very large rounding
- **3xl**: 1.5rem (24px) - Huge rounding
- **full**: 9999px - Fully rounded (circles)

## Shadows

### Shadow Scale
- **xs**: 0 1px 2px 0 rgba(0, 0, 0, 0.05) - Subtle shadow
- **sm**: 0 1px 3px 0 rgba(0, 0, 0, 0.1) - Small shadow
- **base**: 0 4px 6px -1px rgba(0, 0, 0, 0.1) - Default shadow
- **md**: 0 10px 15px -3px rgba(0, 0, 0, 0.1) - Medium shadow
- **lg**: 0 20px 25px -5px rgba(0, 0, 0, 0.1) - Large shadow
- **xl**: 0 25px 50px -12px rgba(0, 0, 0, 0.25) - Extra large shadow
- **2xl**: 0 25px 50px -12px rgba(0, 0, 0, 0.25) - Very large shadow

### Glow Effects
- **sm**: 0 0 10px rgba(14, 165, 233, 0.3) - Small glow
- **md**: 0 0 20px rgba(14, 165, 233, 0.4) - Medium glow
- **lg**: 0 0 30px rgba(14, 165, 233, 0.5) - Large glow
- **xl**: 0 0 40px rgba(14, 165, 233, 0.6) - Extra large glow

## Components

### Buttons

#### Button Sizes
- **sm**: Height 32px, padding 0 12px, font-size 12px
- **md**: Height 40px, padding 0 16px, font-size 14px
- **lg**: Height 48px, padding 0 24px, font-size 16px

#### Button Variants
- **primary**: Gradient background, white text, primary color
- **secondary**: Gray background, white text, subtle border
- **ghost**: Transparent background, colored text
- **success**: Green background, white text
- **warning**: Amber background, white text
- **error**: Red background, white text

#### Button States
- **default**: Normal appearance
- **hover**: Slight elevation, glow effect
- **active**: Pressed state
- **disabled**: Reduced opacity, no interaction
- **loading**: Spinner animation, disabled interaction

### Cards

#### Card Types
- **default**: Standard card with subtle shadow
- **elevated**: Higher shadow, more prominent
- **interactive**: Hover effects, clickable
- **outlined**: Border only, no background

#### Card Structure
- **header**: Title and optional actions
- **content**: Main content area
- **footer**: Optional footer with actions

### Inputs

#### Input Sizes
- **sm**: Height 32px, font-size 12px
- **md**: Height 40px, font-size 14px
- **lg**: Height 48px, font-size 16px

#### Input States
- **default**: Normal appearance
- **focus**: Border color change, focus ring
- **error**: Red border, error styling
- **disabled**: Reduced opacity, no interaction

### Modals

#### Modal Structure
- **backdrop**: Semi-transparent overlay
- **content**: Modal container with shadow
- **header**: Title and close button
- **body**: Main content area
- **footer**: Action buttons

### Toasts

#### Toast Types
- **success**: Green accent, success icon
- **warning**: Amber accent, warning icon
- **error**: Red accent, error icon
- **info**: Blue accent, info icon

## Animations

### Duration
- **75ms**: Very fast transitions
- **100ms**: Fast transitions
- **150ms**: Default transitions
- **200ms**: Medium transitions
- **300ms**: Slow transitions
- **500ms**: Very slow transitions

### Easing Functions
- **linear**: Constant speed
- **ease-in**: Slow start, fast end
- **ease-out**: Fast start, slow end
- **ease-in-out**: Slow start and end
- **bounce**: Bouncy effect
- **spring**: Spring-like effect

### Animation Types
- **fade**: Opacity changes
- **slide**: Position changes
- **scale**: Size changes
- **rotate**: Rotation changes
- **bounce**: Bouncing effect
- **pulse**: Pulsing effect
- **shimmer**: Shimmer loading effect

## Layout

### Containers
- **sm**: Max-width 640px
- **md**: Max-width 768px
- **lg**: Max-width 1024px
- **xl**: Max-width 1280px
- **2xl**: Max-width 1536px

### Grid System
- **cols-1**: 1 column
- **cols-2**: 2 columns
- **cols-3**: 3 columns
- **cols-4**: 4 columns
- **cols-5**: 5 columns
- **cols-6**: 6 columns

### Flexbox Utilities
- **flex**: Display flex
- **flex-col**: Flex direction column
- **flex-row**: Flex direction row
- **center**: Align and justify center
- **between**: Justify space between
- **around**: Justify space around
- **evenly**: Justify space evenly

## Responsive Design

### Breakpoints
- **sm**: 640px and up
- **md**: 768px and up
- **lg**: 1024px and up
- **xl**: 1280px and up
- **2xl**: 1536px and up

### Mobile Considerations
- Touch-friendly button sizes (minimum 44px)
- Adequate spacing between interactive elements
- Readable text sizes
- Simplified navigation
- Optimized layouts for small screens

## Accessibility

### Focus Management
- Visible focus indicators
- Logical tab order
- Skip links for keyboard navigation
- Focus trapping in modals

### Color Contrast
- WCAG AA compliant contrast ratios
- High contrast mode support
- Color-blind friendly palette

### Screen Reader Support
- Semantic HTML structure
- ARIA labels and descriptions
- Live regions for dynamic content
- Proper heading hierarchy

## Usage Examples

### Basic Button
```jsx
<button className="ld-btn ld-btn--primary ld-btn--md">
  Click me
</button>
```

### Card with Content
```jsx
<div className="ld-card">
  <div className="ld-card__header">
    <h3 className="ld-card__title">Card Title</h3>
  </div>
  <div className="ld-card__content">
    Card content goes here
  </div>
</div>
```

### Input with Label
```jsx
<div className="ld-input-group">
  <label className="ld-input-group__label">Email</label>
  <input className="ld-input" type="email" placeholder="Enter your email" />
</div>
```

### Grid Layout
```jsx
<div className="ld-grid ld-grid--cols-3 ld-grid--gap-lg">
  <div className="ld-card">Item 1</div>
  <div className="ld-card">Item 2</div>
  <div className="ld-card">Item 3</div>
</div>
```

## Best Practices

1. **Use semantic HTML**: Always use appropriate HTML elements
2. **Follow the spacing scale**: Use design tokens for consistent spacing
3. **Maintain color consistency**: Use the defined color palette
4. **Test accessibility**: Ensure components work with screen readers
5. **Optimize performance**: Use CSS custom properties for theming
6. **Document components**: Include usage examples and props
7. **Test responsive design**: Ensure components work on all screen sizes
8. **Follow naming conventions**: Use consistent class naming

## Migration Guide

### From Tailwind to Design System
1. Replace Tailwind classes with design system classes
2. Use design tokens for colors and spacing
3. Apply consistent component patterns
4. Test for accessibility and responsiveness

### Example Migration
```jsx
// Before (Tailwind)
<div className="bg-blue-500 text-white p-4 rounded-lg shadow-md">
  <h2 className="text-xl font-bold mb-2">Title</h2>
  <p className="text-sm">Content</p>
</div>

// After (Design System)
<div className="ld-card ld-card--primary">
  <h2 className="ld-text-xl ld-font-bold ld-mb-2">Title</h2>
  <p className="ld-text-sm">Content</p>
</div>
```

## Resources

- [Design Tokens CSS](./design-tokens.css)
- [Component System CSS](./component-system.css)
- [Animations CSS](../animations.css)
- [Discord Theme CSS](../discord-theme.css)