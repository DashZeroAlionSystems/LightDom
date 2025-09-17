# Material Design 3 Implementation Guide

This directory contains a comprehensive Material Design 3 implementation for the LightDom platform, ensuring consistent design patterns and user experience across all components.

## Files Overview

### 1. `material-design-tokens.css`

Contains all Material Design 3 design tokens including:

- **Color System**: Primary, secondary, tertiary, error, surface, and outline colors
- **Typography Scale**: Display, headline, title, body, and label text styles
- **Spacing Tokens**: Consistent spacing values from 0-80px
- **Elevation Tokens**: Shadow definitions for different elevation levels
- **Shape Tokens**: Border radius values for different component sizes
- **Motion Tokens**: Duration and easing values for animations
- **State Layer Opacity**: Hover, focus, pressed, and dragged states

### 2. `material-components.css`

Pre-built Material Design 3 component styles including:

- **Buttons**: Filled, filled tonal, outlined, text, and elevated variants
- **Cards**: Standard, elevated, and outlined variants
- **Inputs**: Text fields with floating labels and validation states
- **Chips**: Assist, input, suggestion, and filter variants
- **Lists**: Standard list items with primary and secondary text
- **Progress Indicators**: Linear and circular progress bars
- **Badges**: Notification badges and dots
- **Icons**: Consistent icon styling with color variants

### 3. `material-tailwind.css`

Tailwind CSS utilities that integrate Material Design 3 tokens:

- **Color Utilities**: `.md-primary`, `.md-surface`, etc.
- **Typography Utilities**: `.md-headline-large`, `.md-body-medium`, etc.
- **Spacing Utilities**: `.md-spacing-*`, `.md-margin-*`, `.md-gap-*`
- **Shape Utilities**: `.md-shape-small`, `.md-shape-large`, etc.
- **Elevation Utilities**: `.md-elevation-1`, `.md-elevation-2`, etc.
- **Motion Utilities**: `.md-motion-short1`, `.md-motion-medium2`, etc.

## Usage Examples

### Basic Component Styling

```tsx
// Using Material Design 3 classes
<div className='md-card md-elevation-1 md-surface-container'>
  <div className='md-card-content'>
    <h2 className='md-headline-small md-on-surface'>Title</h2>
    <p className='md-body-medium md-on-surface-variant'>Description</p>
    <button className='md-button md-button-filled md-state-layer'>Action</button>
  </div>
</div>
```

### Typography Hierarchy

```tsx
<h1 className="md-display-large md-on-surface">Main Heading</h1>
<h2 className="md-headline-medium md-on-surface">Section Heading</h2>
<h3 className="md-title-large md-on-surface">Subsection Heading</h3>
<p className="md-body-large md-on-surface-variant">Body text</p>
<label className="md-label-medium md-on-surface-variant">Form label</label>
```

### Color System

```tsx
// Primary colors
<div className="md-primary">Primary background</div>
<div className="md-primary-container">Primary container</div>

// Surface colors
<div className="md-surface">Main surface</div>
<div className="md-surface-container">Container surface</div>
<div className="md-surface-container-high">High elevation surface</div>

// Text colors
<span className="md-on-surface">Primary text</span>
<span className="md-on-surface-variant">Secondary text</span>
```

### Spacing and Layout

```tsx
// Using Material Design spacing tokens
<div className="md-spacing-6">Padding 24px</div>
<div className="md-margin-4">Margin 16px</div>
<div className="md-gap-3">Gap 12px</div>

// Shape tokens
<div className="md-shape-large">Large border radius</div>
<div className="md-shape-medium">Medium border radius</div>
```

### Elevation and Shadows

```tsx
// Different elevation levels
<div className="md-elevation-0">No shadow</div>
<div className="md-elevation-1">Level 1 shadow</div>
<div className="md-elevation-2">Level 2 shadow</div>
<div className="md-elevation-3">Level 3 shadow</div>
```

### Interactive States

```tsx
// State layer for interactive elements
<button className="md-button md-button-filled md-state-layer">
  Hover and focus effects
</button>

// Focus ring for accessibility
<input className="md-input-field md-focus-ring" />
```

## Dark Theme Support

The implementation automatically supports dark theme through CSS custom properties. The color tokens automatically switch based on the user's system preference:

```css
@media (prefers-color-scheme: dark) {
  :root {
    --md-sys-color-primary: #d0bcff;
    --md-sys-color-on-primary: #381e72;
    /* ... other dark theme colors */
  }
}
```

## Component Examples

### Material Design 3 Button

```tsx
// Filled button
<button className="md-button md-button-filled md-state-layer">
  <Icon size={20} />
  Button Text
</button>

// Outlined button
<button className="md-button md-button-outlined md-state-layer">
  <Icon size={20} />
  Button Text
</button>

// Text button
<button className="md-button md-button-text md-state-layer">
  <Icon size={20} />
  Button Text
</button>
```

### Material Design 3 Card

```tsx
<div className='md-card md-elevation-1'>
  <div className='md-card-header'>
    <h3 className='md-title-large md-on-surface'>Card Title</h3>
  </div>
  <div className='md-card-content'>
    <p className='md-body-medium md-on-surface-variant'>Card content</p>
  </div>
  <div className='md-card-actions'>
    <button className='md-button md-button-text md-state-layer'>Action</button>
  </div>
</div>
```

### Material Design 3 Input

```tsx
<div className='md-input'>
  <div className='md-input-field'>
    <Icon size={20} className='md-on-surface-variant' />
    <input type='text' placeholder='Enter text' />
    <label className='md-input-label'>Label</label>
  </div>
  <div className='md-input-helper'>Helper text</div>
</div>
```

## Best Practices

### 1. Color Usage

- Use semantic color tokens (primary, secondary, error) for meaning
- Use surface tokens for backgrounds and containers
- Use on-surface tokens for text colors
- Maintain proper contrast ratios

### 2. Typography

- Use the appropriate text style for the content hierarchy
- Maintain consistent line heights and letter spacing
- Use label styles for form elements and UI labels

### 3. Spacing

- Use Material Design spacing tokens for consistent layouts
- Maintain 8px grid system for alignment
- Use appropriate spacing for different component sizes

### 4. Elevation

- Use elevation to show hierarchy and depth
- Higher elevation for more important content
- Use elevation changes for interactive feedback

### 5. Motion

- Use Material Design motion tokens for consistent animations
- Respect user preferences for reduced motion
- Provide meaningful transitions that enhance UX

### 6. Accessibility

- Always include focus rings for keyboard navigation
- Use proper color contrast ratios
- Provide alternative text for icons and images
- Use semantic HTML elements

## Migration from Custom Styles

When migrating existing components to Material Design 3:

1. **Replace custom colors** with Material Design color tokens
2. **Update typography** to use Material Design text styles
3. **Replace custom spacing** with Material Design spacing tokens
4. **Add proper elevation** using Material Design shadow tokens
5. **Implement state layers** for interactive elements
6. **Use consistent shapes** with Material Design border radius tokens

## Browser Support

This implementation uses modern CSS features including:

- CSS Custom Properties (CSS Variables)
- CSS Grid and Flexbox
- CSS Transitions and Animations
- Media Queries for responsive design

Supported browsers:

- Chrome 49+
- Firefox 31+
- Safari 9.1+
- Edge 16+

## Performance Considerations

- CSS custom properties are efficiently cached by browsers
- Minimal CSS bundle size with token-based approach
- No JavaScript required for styling
- Optimized for tree-shaking with Tailwind CSS

## Future Enhancements

- Dynamic theme switching (beyond system preference)
- Additional component variants
- Animation presets for common interactions
- Accessibility improvements based on WCAG 2.1 guidelines
